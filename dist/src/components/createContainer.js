'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = createContainer;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _Mixin = require('./Mixin');

var _Mixin2 = _interopRequireDefault(_Mixin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createContainer() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var Component = arguments[1];

  var expandedOptions = options;
  if (typeof options === 'function') {
    expandedOptions = {
      getMeteorData: options
    };
  }

  var _expandedOptions = expandedOptions,
      _getMeteorData = _expandedOptions.getMeteorData;


  return (0, _createReactClass2.default)({
    displayName: 'MeteorDataContainer',
    mixins: [_Mixin2.default],
    getMeteorData: function getMeteorData() {
      return _getMeteorData(this.props);
    },
    render: function render() {
      return _react2.default.createElement(Component, (0, _extends3.default)({}, this.props, this.data));
    }
  });
} /**
   * Container helper using react-meteor-data.
   */