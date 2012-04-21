(function() {
  var Bill, Checkout, Discounter, EventEmitter, Scanner, assert, discounts, prices, vows,
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

  discounts = {
    'A': {
      quantity: 3,
      amount: 20
    },
    'B': {
      quantity: 2,
      amount: 15
    }
  };

  vows.describe('checkout tests').addBatch({
    'no special offers - one item': {
      'when one A': {
        topic: function() {
          new Checkout(this.callback, prices, discounts).scan('A').total();
          return;
        },
        'total is 50': function(err, total) {
          return assert.equal(total, 50);
        }
      },
      'when one B': {
        topic: function() {
          new Checkout(this.callback, prices, discounts).scan('B').total();
          return;
        },
        'total is 30': function(err, total) {
          return assert.equal(total, 30);
        }
      },
      'when one C': {
        topic: function() {
          new Checkout(this.callback, prices, discounts).scan('C').total();
          return;
        },
        'total is 30': function(err, total) {
          return assert.equal(total, 20);
        }
      },
      'when one D': {
        topic: function() {
          new Checkout(this.callback, prices, discounts).scan('D').total();
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
          new Checkout(this.callback, prices, discounts).scan('A').scan('A').total();
          return;
        },
        'total is 100': function(err, total) {
          return assert.equal(total, 100);
        }
      },
      'when one A and one B': {
        topic: function() {
          new Checkout(this.callback, prices, discounts).scan('A').scan('B').total();
          return;
        },
        'total is 80': function(err, total) {
          return assert.equal(total, 80);
        }
      }
    },
    'special offers': {
      'when three A': {
        topic: function() {
          new Checkout(this.callback, prices, discounts).scan('A').scan('A').scan('A').total();
          return;
        },
        'total is 130': function(err, total) {
          return assert.equal(total, 130);
        }
      },
      'when two B': {
        topic: function() {
          new Checkout(this.callback, prices, discounts).scan('B').scan('B').total();
          return;
        },
        'total is 45': function(err, total) {
          return assert.equal(total, 45);
        }
      },
      'when six A': {
        topic: function() {
          new Checkout(this.callback, prices, discounts).scan('A').scan('A').scan('A').scan('A').scan('A').scan('A').total();
          return;
        },
        'total is 260': function(err, total) {
          return assert.equal(total, 260);
        }
      },
      'when three A and two B': {
        topic: function() {
          new Checkout(this.callback, prices, discounts).scan('B').scan('B').scan('A').scan('A').scan('A').total();
          return;
        },
        'total is 175': function(err, total) {
          return assert.equal(total, 175);
        }
      },
      'when two A mixed with 1 C': {
        topic: function() {
          new Checkout(this.callback, prices, discounts).scan('A').scan('C').scan('A').total();
          return;
        },
        'total is 120': function(err, total) {
          return assert.equal(total, 120);
        }
      }
    }
  }).run();

  Checkout = (function() {

    function Checkout(onTotal, prices, discounts) {
      var bill, discounter;
      bill = new Bill(onTotal);
      discounter = new Discounter(discounts);
      discounter.on('Discount', function(amount) {
        return bill.deduct(amount);
      });
      this.scanner = new Scanner(prices);
      this.scanner.on('NewItem', function(itemInfo) {
        return bill.add(itemInfo.price);
      });
      this.scanner.on('NewItem', function(itemInfo) {
        return discounter.newItem(itemInfo.item);
      });
      this.bill = bill;
    }

    Checkout.prototype.scan = function(item) {
      this.scanner.scan(item);
      return this;
    };

    Checkout.prototype.total = function() {
      return this.bill.total();
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

  Bill = (function() {

    function Bill(onTotal) {
      this.onTotal = onTotal;
      this.totalAmount = 0;
    }

    Bill.prototype.add = function(price) {
      return this.totalAmount += price;
    };

    Bill.prototype.deduct = function(amount) {
      return this.totalAmount -= amount;
    };

    Bill.prototype.total = function() {
      return this.onTotal(void 0, this.totalAmount);
    };

    return Bill;

  })();

  Discounter = (function(_super) {

    __extends(Discounter, _super);

    function Discounter(discounts) {
      this.discounts = discounts;
      this.itemCount = {};
    }

    Discounter.prototype.newItem = function(item) {
      if (this.hasDiscount(item)) return this.makeDiscount(item);
    };

    Discounter.prototype.hasDiscount = function(item) {
      return this.getDiscount(item) !== void 0;
    };

    Discounter.prototype.getDiscount = function(item) {
      return this.discounts[item];
    };

    Discounter.prototype.makeDiscount = function(item) {
      var discount;
      this.incrementItemCount(item);
      discount = this.getDiscount(item);
      if (this.itemCount[item] % discount.quantity === 0) {
        return this.emit('Discount', discount.amount);
      }
    };

    Discounter.prototype.incrementItemCount = function(item) {
      return this.itemCount[item] = this.itemCount[item] ? this.itemCount[item] + 1 : 1;
    };

    return Discounter;

  })(EventEmitter);

}).call(this);
