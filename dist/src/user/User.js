'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _electronJsonStorage = require('electron-json-storage');

var _electronJsonStorage2 = _interopRequireDefault(_electronJsonStorage);

var _Data = require('../Data');

var _Data2 = _interopRequireDefault(_Data);

var _utils = require('../../lib/utils');

var _Call = require('../Call');

var _Call2 = _interopRequireDefault(_Call);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import { AsyncStorage } from 'react-native';
var TOKEN_KEY = 'reactnativemeteor_usertoken';

module.exports = {
  user: function user() {
    if (!this._userIdSaved) return null;

    return this.collection('users').findOne(this._userIdSaved);
  },
  userId: function userId() {
    if (!this._userIdSaved) return null;

    var user = this.collection('users').findOne(this._userIdSaved);
    return user && user._id;
  },

  _isLoggingIn: true,
  loggingIn: function loggingIn() {
    return this._isLoggingIn;
  },
  logout: function logout(callback) {
    var _this = this;

    (0, _Call2.default)("logout", function (err) {
      _this.handleLogout();
      _this.connect();

      typeof callback == 'function' && callback(err);
    });
  },
  handleLogout: function handleLogout() {
    // AsyncStorage.removeItem(TOKEN_KEY);
    _electronJsonStorage2.default.remove(TOKEN_KEY);

    _Data2.default._tokenIdSaved = null;
    this._userIdSaved = null;
  },
  loginWithPassword: function loginWithPassword(selector, password, callback) {
    var _this2 = this;

    if (typeof selector === 'string') {
      if (selector.indexOf('@') === -1) selector = { username: selector };else selector = { email: selector };
    }

    this._startLoggingIn();
    (0, _Call2.default)("login", {
      user: selector,
      password: (0, _utils.hashPassword)(password)
    }, function (err, result) {
      _this2._endLoggingIn();

      _this2._handleLoginCallback(err, result);

      typeof callback == 'function' && callback(err);
    });
  },
  logoutOtherClients: function logoutOtherClients() {
    var _this3 = this;

    var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

    (0, _Call2.default)('getNewToken', function (err, res) {
      if (err) return callback(err);

      _this3._handleLoginCallback(err, res);

      (0, _Call2.default)('removeOtherTokens', function (err) {
        callback(err);
      });
    });
  },
  _login: function _login(user, callback) {
    var _this4 = this;

    this._startLoggingIn();
    this.call("login", user, function (err, result) {
      _this4._endLoggingIn();

      _this4._handleLoginCallback(err, result);

      typeof callback == 'function' && callback(err);
    });
  },
  _startLoggingIn: function _startLoggingIn() {
    this._isLoggingIn = true;
    _Data2.default.notify('loggingIn');
  },
  _endLoggingIn: function _endLoggingIn() {
    this._isLoggingIn = false;
    _Data2.default.notify('loggingIn');
  },
  _handleLoginCallback: function _handleLoginCallback(err, result) {
    if (!err) {
      //save user id and token
      // AsyncStorage.setItem(TOKEN_KEY, result.token);
      _electronJsonStorage2.default.set(TOKEN_KEY, { token: result.token });
      _Data2.default._tokenIdSaved = result.token;
      this._userIdSaved = result.id;
      _Data2.default.notify('onLogin');
    } else {
      _Data2.default.notify('onLoginFailure');
      this.handleLogout();
    }
    _Data2.default.notify('change');
  },
  _loginWithToken: function _loginWithToken(value) {
    var _this5 = this;

    _Data2.default._tokenIdSaved = value;
    if (value !== null) {
      this._startLoggingIn();
      (0, _Call2.default)('login', { resume: value }, function (err, result) {
        _this5._endLoggingIn();
        _this5._handleLoginCallback(err, result);
      });
    } else {
      this._endLoggingIn();
    }
  },
  getAuthToken: function getAuthToken() {
    return _Data2.default._tokenIdSaved;
  },
  _loadInitialUser: function _loadInitialUser() {
    var _this6 = this;

    return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
      var value, getStorage;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              value = null;
              _context.prev = 1;

              getStorage = function getStorage() {
                return new Promise(function (resolve, reject) {
                  _electronJsonStorage2.default.get(TOKEN_KEY, function (err, res) {
                    resolve(res);
                  });
                });
              };

              _context.next = 5;
              return getStorage();

            case 5:
              value = _context.sent;

              value = value.token;
              _context.next = 12;
              break;

            case 9:
              _context.prev = 9;
              _context.t0 = _context['catch'](1);

              console.warn('json-storage error: ' + _context.t0.message);

            case 12:
              _context.prev = 12;

              _this6._loginWithToken(value);
              return _context.finish(12);

            case 15:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this6, [[1, 9, 12, 15]]);
    }))();
  }
};