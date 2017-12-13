'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _reactMixin = require('react-mixin');

var _reactMixin2 = _interopRequireDefault(_reactMixin);

var _trackr = require('trackr');

var _trackr2 = _interopRequireDefault(_trackr);

var _ejson = require('ejson');

var _ejson2 = _interopRequireDefault(_ejson);

var _ddp = require('../lib/ddp.js');

var _ddp2 = _interopRequireDefault(_ddp);

var _Random = require('../lib/Random');

var _Random2 = _interopRequireDefault(_Random);

var _Data = require('./Data');

var _Data2 = _interopRequireDefault(_Data);

var _Collection = require('./Collection');

var _Call = require('./Call');

var _Call2 = _interopRequireDefault(_Call);

var _Mixin = require('./components/Mixin');

var _Mixin2 = _interopRequireDefault(_Mixin);

var _createContainer = require('./components/createContainer');

var _createContainer2 = _interopRequireDefault(_createContainer);

var _composeWithTracker = require('./components/composeWithTracker');

var _composeWithTracker2 = _interopRequireDefault(_composeWithTracker);

var _FSCollection = require('./CollectionFS/FSCollection');

var _FSCollection2 = _interopRequireDefault(_FSCollection);

var _ReactiveDict = require('./ReactiveDict');

var _ReactiveDict2 = _interopRequireDefault(_ReactiveDict);

var _User = require('./user/User');

var _User2 = _interopRequireDefault(_User);

var _Accounts = require('./user/Accounts');

var _Accounts2 = _interopRequireDefault(_Accounts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import MeteorListView from './components/ListView';
// import MeteorComplexListView from './components/ComplexListView';
module.exports = (0, _extends3.default)({
  composeWithTracker: _composeWithTracker2.default,
  Accounts: _Accounts2.default,
  Tracker: _trackr2.default,
  EJSON: _ejson2.default,
  // MeteorListView,
  // MeteorComplexListView,
  ReactiveDict: _ReactiveDict2.default,
  Collection: _Collection.Collection,
  // FSCollectionImagesPreloader: Platform.OS == 'android' ? View : FSCollectionImagesPreloader,
  collection: function collection(name, options) {
    return new _Collection.Collection(name, options);
  },

  FSCollection: _FSCollection2.default,
  createContainer: _createContainer2.default,
  getData: function getData() {
    return _Data2.default;
  },
  connectMeteor: function connectMeteor(reactClass) {
    return _reactMixin2.default.onClass(reactClass, _Mixin2.default);
  }
}, _User2.default, {
  status: function status() {
    return {
      connected: _Data2.default.ddp ? _Data2.default.ddp.status == "connected" : false,
      status: _Data2.default.ddp ? _Data2.default.ddp.status : "disconnected"
      //retryCount: 0
      //retryTime:
      //reason:
    };
  },

  call: _Call2.default,
  disconnect: function disconnect() {
    if (_Data2.default.ddp) {
      _Data2.default.ddp.disconnect();
    }
  },
  _subscriptionsRestart: function _subscriptionsRestart() {

    for (var i in _Data2.default.subscriptions) {
      var sub = _Data2.default.subscriptions[i];
      _Data2.default.ddp.unsub(sub.subIdRemember);
      sub.subIdRemember = _Data2.default.ddp.sub(sub.name, sub.params);
    }
  },

  waitDdpConnected: _Data2.default.waitDdpConnected.bind(_Data2.default),
  reconnect: function reconnect() {
    _Data2.default.ddp && _Data2.default.ddp.connect();
  },
  connect: function connect(endpoint, options) {
    var _this = this;

    if (!endpoint) endpoint = _Data2.default._endpoint;
    if (!options) options = _Data2.default._options;

    _Data2.default._endpoint = endpoint;
    _Data2.default._options = options;

    this.ddp = _Data2.default.ddp = new _ddp2.default((0, _extends3.default)({
      endpoint: endpoint,
      SocketConstructor: WebSocket
    }, options));

    // NetInfo.isConnected.addEventListener('connectionChange', isConnected=>{
    //   if(isConnected && Data.ddp.autoReconnect) {
    //     Data.ddp.connect();
    //   }
    // });


    _Data2.default.ddp.on("connected", function () {

      // Clear the collections of any stale data in case this is a reconnect
      if (_Data2.default.db && _Data2.default.db.collections) {
        for (var collection in _Data2.default.db.collections) {
          _Data2.default.db[collection].remove({});
        }
      }

      _Data2.default.notify('change');

      console.info("Connected to DDP server.");
      _this._loadInitialUser().then(function () {
        _this._subscriptionsRestart();
      });
    });

    var lastDisconnect = null;
    _Data2.default.ddp.on("disconnected", function () {

      _Data2.default.notify('change');

      console.info("Disconnected from DDP server.");

      if (!_Data2.default.ddp.autoReconnect) return;

      if (!lastDisconnect || new Date() - lastDisconnect > 3000) {
        _Data2.default.ddp.connect();
      }

      lastDisconnect = new Date();
    });

    _Data2.default.ddp.on("added", function (message) {
      if (!_Data2.default.db[message.collection]) {
        _Data2.default.db.addCollection(message.collection);
      }
      _Data2.default.db[message.collection].upsert((0, _extends3.default)({ _id: message.id }, message.fields));
    });

    _Data2.default.ddp.on("ready", function (message) {
      var idsMap = new Map();
      for (var i in _Data2.default.subscriptions) {
        var sub = _Data2.default.subscriptions[i];
        idsMap.set(sub.subIdRemember, sub.id);
      }
      for (var i in message.subs) {
        var subId = idsMap.get(message.subs[i]);
        if (subId) {
          var _sub = _Data2.default.subscriptions[subId];
          _sub.ready = true;
          _sub.readyDeps.changed();
          _sub.readyCallback && _sub.readyCallback();
        }
      }
    });

    _Data2.default.ddp.on("changed", function (message) {
      _Data2.default.db[message.collection] && _Data2.default.db[message.collection].upsert((0, _extends3.default)({ _id: message.id }, message.fields));
    });

    _Data2.default.ddp.on("removed", function (message) {
      _Data2.default.db[message.collection] && _Data2.default.db[message.collection].del(message.id);
    });
    _Data2.default.ddp.on("result", function (message) {
      var call = _Data2.default.calls.find(function (call) {
        return call.id == message.id;
      });
      if (typeof call.callback == 'function') call.callback(message.error, message.result);
      _Data2.default.calls.splice(_Data2.default.calls.findIndex(function (call) {
        return call.id == message.id;
      }), 1);
    });

    _Data2.default.ddp.on("nosub", function (message) {
      for (var i in _Data2.default.subscriptions) {
        var sub = _Data2.default.subscriptions[i];
        if (sub.subIdRemember == message.id) {
          console.warn("No subscription existing for", sub.name);
        }
      }
    });
  },
  subscribe: function subscribe(name) {
    var params = Array.prototype.slice.call(arguments, 1);
    var callbacks = {};
    if (params.length) {
      var lastParam = params[params.length - 1];
      if (typeof lastParam == 'function') {
        callbacks.onReady = params.pop();
      } else if (lastParam && (typeof lastParam.onReady == 'function' || typeof lastParam.onError == 'function' || typeof lastParam.onStop == 'function')) {
        callbacks = params.pop();
      }
    }

    // Is there an existing sub with the same name and param, run in an
    // invalidated Computation? This will happen if we are rerunning an
    // existing computation.
    //
    // For example, consider a rerun of:
    //
    //     Tracker.autorun(function () {
    //       Meteor.subscribe("foo", Session.get("foo"));
    //       Meteor.subscribe("bar", Session.get("bar"));
    //     });
    //
    // If "foo" has changed but "bar" has not, we will match the "bar"
    // subcribe to an existing inactive subscription in order to not
    // unsub and resub the subscription unnecessarily.
    //
    // We only look for one such sub; if there are N apparently-identical subs
    // being invalidated, we will require N matching subscribe calls to keep
    // them all active.


    var existing = false;
    for (var i in _Data2.default.subscriptions) {
      var sub = _Data2.default.subscriptions[i];
      if (sub.inactive && sub.name === name && _ejson2.default.equals(sub.params, params)) existing = sub;
    }

    var id = void 0;
    if (existing) {
      id = existing.id;
      existing.inactive = false;

      if (callbacks.onReady) {
        // If the sub is not already ready, replace any ready callback with the
        // one provided now. (It's not really clear what users would expect for
        // an onReady callback inside an autorun; the semantics we provide is
        // that at the time the sub first becomes ready, we call the last
        // onReady callback provided, if any.)
        if (!existing.ready) existing.readyCallback = callbacks.onReady;
      }
      if (callbacks.onStop) {
        existing.stopCallback = callbacks.onStop;
      }
    } else {

      // New sub! Generate an id, save it locally, and send message.

      id = _Random2.default.id();
      var subIdRemember = _Data2.default.ddp.sub(name, params);

      _Data2.default.subscriptions[id] = {
        id: id,
        subIdRemember: subIdRemember,
        name: name,
        params: _ejson2.default.clone(params),
        inactive: false,
        ready: false,
        readyDeps: new _trackr2.default.Dependency(),
        readyCallback: callbacks.onReady,
        stopCallback: callbacks.onStop,
        stop: function stop() {
          _Data2.default.ddp.unsub(this.subIdRemember);
          delete _Data2.default.subscriptions[this.id];
          this.ready && this.readyDeps.changed();

          if (callbacks.onStop) {
            callbacks.onStop();
          }
        }
      };
    }

    // return a handle to the application.
    var handle = {
      stop: function stop() {
        if (_Data2.default.subscriptions[id]) _Data2.default.subscriptions[id].stop();
      },
      ready: function ready() {
        if (!_Data2.default.subscriptions[id]) return false;

        var record = _Data2.default.subscriptions[id];
        record.readyDeps.depend();
        return record.ready;
      },
      subscriptionId: id
    };

    if (_trackr2.default.active) {
      // We're in a reactive computation, so we'd like to unsubscribe when the
      // computation is invalidated... but not if the rerun just re-subscribes
      // to the same subscription!  When a rerun happens, we use onInvalidate
      // as a change to mark the subscription "inactive" so that it can
      // be reused from the rerun.  If it isn't reused, it's killed from
      // an afterFlush.
      _trackr2.default.onInvalidate(function (c) {
        if (_Data2.default.subscriptions[id]) {
          _Data2.default.subscriptions[id].inactive = true;
        }

        _trackr2.default.afterFlush(function () {
          if (_Data2.default.subscriptions[id] && _Data2.default.subscriptions[id].inactive) {
            handle.stop();
          }
        });
      });
    }

    return handle;
  }
});
// import FSCollectionImagesPreloader from './CollectionFS/FSCollectionImagesPreloader';