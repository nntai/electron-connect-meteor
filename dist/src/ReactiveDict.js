'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _ejson = require('ejson');

var _ejson2 = _interopRequireDefault(_ejson);

var _Data = require('./Data');

var _Data2 = _interopRequireDefault(_Data);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stringify = function stringify(value) {
  if (value === undefined) return 'undefined';
  return _ejson2.default.stringify(value);
};

var parse = function parse(serialized) {
  if (serialized === undefined || serialized === 'undefined') return undefined;
  return _ejson2.default.parse(serialized);
};

var ReactiveDict = function () {
  function ReactiveDict(dictName) {
    (0, _classCallCheck3.default)(this, ReactiveDict);

    this.keys = {};
    if ((typeof dictName === 'undefined' ? 'undefined' : (0, _typeof3.default)(dictName)) === 'object') {
      for (var i in dictName) {
        this.keys[i] = stringify(dictName[i]);
      }
    }
  }

  (0, _createClass3.default)(ReactiveDict, [{
    key: 'set',
    value: function set(keyOrObject, value) {
      if ((typeof keyOrObject === 'undefined' ? 'undefined' : (0, _typeof3.default)(keyOrObject)) === 'object' && value === undefined) {
        this._setObject(keyOrObject);
        return;
      }
      // the input isn't an object, so it must be a key
      // and we resume with the rest of the function
      var key = keyOrObject;

      value = stringify(value);

      var oldSerializedValue = 'undefined';
      if (Object.keys(this.keys).indexOf(key) != -1) {
        oldSerializedValue = this.keys[key];
      }
      if (value === oldSerializedValue) return;

      this.keys[key] = value;

      _Data2.default.notify('change');
    }
  }, {
    key: 'setDefault',
    value: function setDefault(key, value) {
      // for now, explicitly check for undefined, since there is no
      // ReactiveDict.clear().  Later we might have a ReactiveDict.clear(), in which case
      // we should check if it has the key.
      if (this.keys[key] === undefined) {
        this.set(key, value);
      }
    }
  }, {
    key: 'get',
    value: function get(key) {
      return parse(this.keys[key]);
    }
  }, {
    key: 'equals',
    value: function equals(key, value) {
      // We don't allow objects (or arrays that might include objects) for
      // .equals, because JSON.stringify doesn't canonicalize object key
      // order. (We can make equals have the right return value by parsing the
      // current value and using EJSON.equals, but we won't have a canonical
      // element of keyValueDeps[key] to store the dependency.) You can still use
      // "EJSON.equals(reactiveDict.get(key), value)".
      //
      // XXX we could allow arrays as long as we recursively check that there
      // are no objects
      if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean' && typeof value !== 'undefined' && !(value instanceof Date) && !(ObjectID && value instanceof ObjectID) && value !== null) throw new Error("ReactiveDict.equals: value must be scalar");

      var serializedValue = stringify(value);

      var oldValue = undefined;
      if (Object.keys(this.keys).indexOf(key) != -1) {
        oldValue = parse(this.keys[key]);
      }
      return _ejson2.default.equals(oldValue, value);
    }
  }, {
    key: '_setObject',
    value: function _setObject(object) {

      var keys = Object.keys(object);

      for (var i in keys) {
        this.set(i, keys[i]);
      }
    }
  }]);
  return ReactiveDict;
}();

exports.default = ReactiveDict;