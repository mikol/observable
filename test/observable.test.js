'use strict';

require('criteria'); /* globals scope, test */

const is = require('is');
const Observable = require('observable');

scope('Observable Tests',
function () {
  scope('The Observable API is implemented.',
  function () {
    test('Implements method `on()`.',
    function (must) {
      must.true(() => is.function(Observable.prototype.on));
    });

    test('Implements method `one()`.',
    function (must) {
      must.true(() => is.function(Observable.prototype.one));
    });

    test('Implements method `off()`.',
    function (must) {
      must.true(() => is.function(Observable.prototype.off));
    });

    test('Implements method `trigger()`.',
    function (must) {
      must.true(() => is.function(Observable.prototype.trigger));
    });

    test('Implements static method `provide()`.',
    function (must) {
      must.true(() => is.function(Observable.provide));
    });
  });

  scope('Observers can be registered and unregistered events can be triggered.',
  function () {
    scope.before(function () {
      this.onFoo = function onFoo(self) {
        self.onFooCalled++;
      };

      this.onBar = function onBar(self) {
        self.onBarCalled++;
      };
    });

    test.before(function () {
      this.onFooCalled = 0;
      this.onBarCalled = 0;
      this.observable = new Observable();
    });

    test('`on()` registers and calls an observer when triggered.',
    function (must) {
      this.observable.on('foo', this.onFoo);
      must.true(() => this.onFooCalled === 0);

      this.observable.trigger('foo', this);
      must.true(() => this.onFooCalled === 1);

      this.observable.trigger('foo', this);
      must.true(() => this.onFooCalled === 2);
    });

    test('`one()` registers and calls an observer only once.',
    function (must) {
      this.observable.one('foo', this.onFoo);
      must.true(() => this.onFooCalled === 0);

      this.observable.trigger('foo', this);
      must.true(() => this.onFooCalled === 1);

      this.observable.trigger('foo', this);
      must.true(() => this.onFooCalled === 1);
    });

    test('`off()` unregisters an observer function.',
    function (must) {
      this.observable.on('foo', this.onFoo);
      must.true(() => this.onFooCalled === 0);

      this.observable.trigger('foo', this);
      must.true(() => this.onFooCalled === 1);

      this.observable.trigger('foo', this);
      must.true(() => this.onFooCalled === 2);

      this.observable.off('foo', this.onFoo);
      this.observable.trigger('foo', this);
      must.true(() => this.onFooCalled === 2);
    });

    test('`off()` unregisters all observers of an event.',
    function (must) {
      this.observable.on('foo', this.onFoo);
      must.true(() => this.onFooCalled === 0);

      this.observable.on('foo', this.onBar);
      must.true(() => this.onBarCalled === 0);

      this.observable.trigger('foo', this);
      must.true(() => this.onFooCalled === 1);
      must.true(() => this.onBarCalled === 1);

      this.observable.trigger('foo', this);
      must.true(() => this.onFooCalled === 2);
      must.true(() => this.onBarCalled === 2);

      this.observable.off('foo');
      this.observable.trigger('foo', this);
      must.true(() => this.onFooCalled === 2);
      must.true(() => this.onBarCalled === 2);
    });

    test('`off()` unregisters all observers of all events.',
    function (must) {
      this.observable.on('foo', this.onFoo);
      must.true(() => this.onFooCalled === 0);

      this.observable.on('foo', this.onBar);
      must.true(() => this.onBarCalled === 0);

      this.observable.trigger('foo', this);
      this.observable.trigger('bar', this);
      must.true(() => this.onFooCalled === 1);
      must.true(() => this.onBarCalled === 1);

      this.observable.trigger('foo', this);
      this.observable.trigger('bar', this);
      must.true(() => this.onFooCalled === 2);
      must.true(() => this.onBarCalled === 2);

      this.observable.off();
      this.observable.trigger('foo', this);
      this.observable.trigger('bar', this);
      must.true(() => this.onFooCalled === 2);
      must.true(() => this.onBarCalled === 2);
    });
  });
});
