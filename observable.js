/* jshint ignore:start *//* jscs:disable */
!function(e,o){'use strict';var t=[
  'instance',
  'is',
  'slice',
  'type'
];if('function'==typeof define&&define.amd)define(t,function(){return o.apply(e,[].slice.call(arguments))});else if('object'==typeof module&&module.exports){for(var n=t.length;n--;)t[n]=require(t[n]);module.exports=o.apply(e,t)}}('object'==typeof global&&global||'object'==typeof window&&window||this,

function (instance, is, slice, type) {
/* jshint ignore:end   *//* jscs:enable  */
  'use strict';

  /**
   * Observable instances maintain a list of registered observer functions,
   * each of which will be called when the corresponding event type occurs.
   *
   * @constructor Observable
   */
  function Observable() {
    /**
     * A map of each registered event type and its corresponding event handlers.
     *
     * @type {Object}
     * @private
     */
    instance.props(this, {
      observers: {value: {}, writable: true},
    });
  }

  /** @private */
  var definition = type(Observable)['implements']({
    /**
     * Adds `iface`’s enumerable properties to `Observable.prototype`.
     *
     * @param {Object} iface - The properties to add to `Observable.prototype`.
     * @param {Object=} aliases - Each enumerable property name in `aliases`
     *     will be an alias for an `Observable.prototype` property. For example,
     *     `provide({...}, {emit: 'trigger'})` would make
     *     `Observable.prototype.emit()` strictly equal to
     *     `Observable.prototype.trigger()`.
     */
    provide: {
      static: function (iface, aliases) {
        if (this.provided.indexOf(iface) === -1) {
          if (is.object(aliases)) {
            for (var name in iface) {
              if (name in aliases) {
                definition['implements'](name, prototype[aliases[name]]);
              } else if (is.function(prototype[name])) {
                // XXX: Allow `iface` to specify an implementation for `name`.
                // The original implementation will be called after the
                // specified `iface` implementation so that interfaces can add
                // preconditions to “aliased” functionality – for example, so
                // that Node.js `maxListeners` can be enforced – which may or
                // may not be sufficient for compatibility with the desired
                // interface.
                var original = prototype[name];
                var override = iface[name];

                /* jshint -W083 */
                definition['implements'](name, {
                  value: function () {
                    var argv = slice(arguments);
                    override.apply(this, argv);
                    original.apply(this, argv);
                  },
                  writable: true
                });
                /* jshint +W083 */
              } else {
                definition['implements'](name, iface[name]);
              }
            }
          } else {
            definition['implements'](iface);
          }

          this.provided.push(iface);
        }
      }
    },

    /**
     * A list of interfaces already provided.
     *
     * @private
     */
    provided: {
      static: []
    },

    /**
     * Returns the number of observers registered to handle event `type`.
     *
     * @param {string} type - The event of interest.
     *
     * @return {number} The number of functions to call when event
     *     `type` occurs.
     */
    count: function (type) {
      var observers = this.observers[type];
      return observers ? observers.length : 0;
    },

    /**
     * Registers the observer `fn` to call when event `type` occurs.
     *
     * @param {string} type - The event that `fn` will handle.
     * @param {function} fn - The function to call when event `type` occurs.
     *
     * @return {Observable} This observable instance for chaining.
     */
    on: {
      value: function (type, fn) {
        var observers = this.observers[type] = this.observers[type] || [];

        var index = observers.indexOf(fn);
        if (index === -1) {
          observers.push(fn);
        }

        return this;
      },
      writable: true
    },

    /**
     * Registers the observer `fn` to call exactly once before automatically
     * being unregistered when event `type` occurs.
     *
     * @param {string} type - The event that `fn` will handle.
     * @param {function} fn - The function to call when event `type` occurs.
     *
     * @return {Observable} This observable instance for chaining.
     */
    one: function (type, fn) {
      var self = this;
      function handle() {
        fn.apply(self, slice(arguments));
        self.off(type, handle);
      }

      this.on(type, handle);

      return this;
    },

    /**
     * Unregisters the observer `fn` of event `type`.
     *
     * @param {string=} type - The event to unregister; if not specified, then
     *     each and every observer will be unregistered.
     * @param {function=} fn - The observer to unregister; if not specified,
     *     then each observer of `type` will be unregistered.
     *
     * @return {Observable} This observable instance for chaining.
     */
    off: function (type, fn) {
      if (is.nix(type)) {
        this.observers = {};
      } else {
        var observers = this.observers;
        if (observers && observers.hasOwnProperty(type)) {
          if (is.nix(fn)) {
            observers[type] = [];
          } else {
            var index = observers[type].indexOf(fn);
            if (index > -1) {
              this.observers[type].splice(index, 1);
            }
          }
        }
      }

      return this;
    },

    /**
     * Returns a copy of the functions registered to handle event `type`.
     *
     * @param {string} type - The event of interest.
     * @param {number} [begin=0] - Zero-based index at which to begin copy.
     * @param {number} [end] - Zero-based (up to, but not including) index at
     *     which to end copy.
     *
     * @return {Array<function>} A copy of the functions to call when event
     *     `type` occurs.
     *
     * @see [Array.prototype.slice()](https://goo.gl/3Kyhoo)
     */
    slice: function (type, begin, end) {
      var observers = this.observers[type];
      return observers ? observers.slice(begin, end) : [];
    },

    /**
     * Dispatches event `type`, invoking each registered observer function with
     * this observable as the `this` object and any supplied values in `argv` as
     * arguments.
     *
     * @param {string} type - The event to dispatch.
     * @param {...*} argv - The values to supply as arguments to each observer
     *     function when it is called.
     *
     * @return {Observable} This observable instance for chaining.
     */
    trigger: function (type) {
      var observers = this.observers;

      if (observers && observers.hasOwnProperty(type)) {
        var argv = slice(arguments, 1);
        observers = observers[type].slice();

        for (var x = 0, nx = observers.length; x < nx; ++x) {
          observers[x].apply(this, argv);
        }
      }

      return this;
    },
  });

  /** @private */
  var constructor = definition.identity;

  /** @private */
  var prototype = constructor.prototype;

  return constructor;
});
