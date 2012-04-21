(function() {
  var Checkout, assert, vows;

  vows = require('vows');

  assert = require('assert');

  vows.describe('checkout tests').addBatch({
    'no special offers': {
      'when one A': {
        topic: function() {
          new Checkout(this.callback, 50).scan('A').total();
          return;
        },
        'total is 50': function(err, total) {
          return assert.equal(total, 50);
        }
      },
      'when one B': {
        topic: function() {
          new Checkout(this.callback, 30).scan('B').total();
          return;
        },
        'total is 30': function(err, total) {
          return assert.equal(total, 30);
        }
      }
    }
  }).run();

  Checkout = (function() {

    function Checkout(onTotal, price) {
      this.onTotal = onTotal;
      this.price = price;
    }

    Checkout.prototype.scan = function() {
      return this;
    };

    Checkout.prototype.total = function() {
      console.log(this.onTotal);
      return this.onTotal(void 0, this.price);
    };

    return Checkout;

  })();

}).call(this);
