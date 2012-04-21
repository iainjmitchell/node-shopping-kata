(function() {
  var Checkout, EventEmitter, Scanner, Totaller, assert, prices, vows,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  vows = require('vows');

  assert = require('assert');

  EventEmitter = require('events').EventEmitter;

  prices = {
    'A': 50,
    'B': 30,
    'C': 20,
    'D': 15
  };

  vows.describe('checkout tests').addBatch({
    'no special offers - one item': {
      'when one A': {
        topic: function() {
          new Checkout(this.callback, prices).scan('A').total();
          return;
        },
        'total is 50': function(err, total) {
          return assert.equal(total, 50);
        }
      },
      'when one B': {
        topic: function() {
          new Checkout(this.callback, prices).scan('B').total();
          return;
        },
        'total is 30': function(err, total) {
          return assert.equal(total, 30);
        }
      },
      'when one C': {
        topic: function() {
          new Checkout(this.callback, prices).scan('C').total();
          return;
        },
        'total is 30': function(err, total) {
          return assert.equal(total, 20);
        }
      },
      'when one D': {
        topic: function() {
          new Checkout(this.callback, prices).scan('D').total();
          return;
        },
        'total is 30': function(err, total) {
          return assert.equal(total, 15);
        }
      }
    },
    'no special offers - multiple items': {
      'when two A': {
        topic: function() {
          new Checkout(this.callback, prices).scan('A').scan('A').total();
          return;
        },
        'total is 100': function(err, total) {
          return assert.equal(total, 100);
        }
      },
      'when one A and one B': {
        topic: function() {
          new Checkout(this.callback, prices).scan('A').scan('B').total();
          return;
        },
        'total is 80': function(err, total) {
          return assert.equal(total, 80);
        }
      }
    }
  }, 'special offers', {
    'when three A': {
      topic: function() {
        new Checkout(this.callback, prices).scan('A').scan('A').scan('A').total();
        return;
      },
      'total is 130': function(err, total) {
        return assert.equal(total, 130);
      }
    }
  }).run();

  Checkout = (function() {

    function Checkout(onTotal, prices) {
      var totaller;
      this.prices = prices;
      totaller = new Totaller(onTotal);
      this.scanner = new Scanner(this.prices);
      this.scanner.on('NewItem', function(itemInfo) {
        return totaller.add(itemInfo.price);
      });
      this.totaller = totaller;
    }

    Checkout.prototype.scan = function(item) {
      this.scanner.scan(item);
      return this;
    };

    Checkout.prototype.total = function() {
      return this.totaller.total();
    };

    return Checkout;

  })();

  Scanner = (function(_super) {

    __extends(Scanner, _super);

    function Scanner(prices) {
      this.prices = prices;
    }

    Scanner.prototype.scan = function(item) {
      return this.emit('NewItem', {
        item: item,
        price: this.prices[item]
      });
    };

    return Scanner;

  })(EventEmitter);

  Totaller = (function() {

    function Totaller(onTotal) {
      this.onTotal = onTotal;
      this.totalAmount = 0;
    }

    Totaller.prototype.add = function(price) {
      return this.totalAmount += price;
    };

    Totaller.prototype.total = function() {
      return this.onTotal(void 0, this.totalAmount);
    };

    return Totaller;

  })();

}).call(this);
