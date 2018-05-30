'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _apiRouteProvider = require('./api-route-provider');

var _apiRouteProvider2 = _interopRequireDefault(_apiRouteProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function () {
  var enterModule = require('react-hot-loader').enterModule;

  enterModule && enterModule(module);
})();

var _default = _apiRouteProvider2.default;
exports.default = _default;
;

(function () {
  var reactHotLoader = require('react-hot-loader').default;

  var leaveModule = require('react-hot-loader').leaveModule;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(_default, 'default', 'src/index.js');
  leaveModule(module);
})();

;