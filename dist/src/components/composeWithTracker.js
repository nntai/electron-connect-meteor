'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.default = function (reactiveFn) {
  var collections = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var L = arguments[2];
  var E = arguments[3];
  var options = arguments[4];

  var onPropsChange = function onPropsChange(props, onData) {
    var trackerCleanup = void 0;
    var _meteorDataDep = new _trackr2.default.Dependency();
    var _meteorDataChangedCallback = function _meteorDataChangedCallback(msg) {
      if ((typeof msg === 'undefined' ? 'undefined' : (0, _typeof3.default)(msg)) === 'object' && collections.length > 0) {
        var dbChanged = Object.keys(msg);
        var intersection = _underscore2.default.intersection(dbChanged, collections);
        if (intersection.length > 0) {
          _meteorDataDep.changed();
        }
      } else if (collections.length === 0) {
        _meteorDataDep.changed();
      }
    };

    _Data2.default.onChange(_meteorDataChangedCallback);

    var handler = _trackr2.default.nonreactive(function () {
      return _trackr2.default.autorun(function () {
        _meteorDataDep.depend();
        trackerCleanup = reactiveFn(props, onData);
      });
    });

    return function () {
      if (typeof trackerCleanup === 'function') {
        trackerCleanup();
      }
      _Data2.default.offChange(_meteorDataChangedCallback);
      return handler.stop();
    };
  };

  return (0, _reactKomposer.compose)(onPropsChange, L, E, options);
};

var _trackr = require('trackr');

var _trackr2 = _interopRequireDefault(_trackr);

var _reactKomposer = require('react-komposer');

var _Data = require('../Data');

var _Data2 = _interopRequireDefault(_Data);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }