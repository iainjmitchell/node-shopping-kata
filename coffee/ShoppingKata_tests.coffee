vows = require 'vows'
assert = require 'assert'
EventEmitter = require('events').EventEmitter

prices = 
	'A': 50
	'B': 30
	'C': 20
	'D': 15

discounts = 
	'A':
		quantity: 3
		amount: 20
	'B':
		quantity: 2
		amount: 15

vows.describe('checkout tests')
	.addBatch(
		'no special offers - one item':
			'when one A': 
				topic: () -> 
					new Checkout(@callback, prices, discounts).scan('A').total()
					undefined
				'total is 50': (err, total) ->
					assert.equal total, 50
			'when one B':
				topic: () ->
					new Checkout(@callback, prices, discounts).scan('B').total()
					undefined
				'total is 30': (err, total) ->
					assert.equal total, 30
			'when one C':
				topic: () ->
					new Checkout(@callback, prices, discounts).scan('C').total()
					undefined
				'total is 30': (err, total) ->
					assert.equal total, 20
			'when one D':
				topic: () ->
					new Checkout(@callback, prices, discounts).scan('D').total()
					undefined
				'total is 30': (err, total) ->
					assert.equal total, 15
		'no special offers - multiple items':
			'when two A':
				topic: () -> 
					new Checkout(@callback, prices, discounts).scan('A').scan('A').total()
					undefined
				'total is 100': (err, total) ->
					assert.equal total, 100
			'when one A and one B':
				topic: () -> 
					new Checkout(@callback, prices, discounts).scan('A').scan('B').total()
					undefined
				'total is 80': (err, total) ->
					assert.equal total, 80
		'special offers':
			'when three A': 
				topic: () -> 
					new Checkout(@callback, prices, discounts).scan('A').scan('A').scan('A').total()
					undefined
				'total is 130': (err, total) ->
					assert.equal total, 130
			'when two B': 
				topic: () -> 
					new Checkout(@callback, prices, discounts).scan('B').scan('B').total()
					undefined
				'total is 45': (err, total) ->
					assert.equal total, 45,
			'when six A': 
				topic: () -> 
					new Checkout(@callback, prices, discounts).scan('A').scan('A').scan('A').scan('A').scan('A').scan('A').total()
					undefined
				'total is 260': (err, total) ->
					assert.equal total, 260
			'when three A and two B':
				topic: () -> 
					new Checkout(@callback, prices, discounts).scan('B').scan('B').scan('A').scan('A').scan('A').total()
					undefined
				'total is 175': (err, total) ->
					assert.equal total, 175
			'when two A mixed with 1 C':
				topic: () -> 
					new Checkout(@callback, prices, discounts).scan('A').scan('C').scan('A').total()
					undefined
				'total is 120': (err, total) ->
					assert.equal total, 120
	)
	.run()


class Checkout 
	constructor: (onTotal, prices, discounts) ->
		bill = new Bill(onTotal)
		discounter = new Discounter(discounts)
		discounter.on 'Discount', (amount) -> bill.deduct(amount)
		@scanner = new Scanner(prices)
		@scanner.on 'NewItem', (itemInfo) -> bill.add(itemInfo.price)
		@scanner.on 'NewItem', (itemInfo) -> discounter.newItem(itemInfo.item)
		@bill = bill
	scan: (item) -> 
		@scanner.scan(item)
		this
	total: () ->
		@bill.total()


class Scanner extends EventEmitter
	constructor: (@prices) ->
	scan: (item) ->
		@emit('NewItem',
			item: item 
			price: @prices[item]
		)

class Bill 	
	constructor: (@onTotal) ->
		@totalAmount = 0
	add: (price) ->
		@totalAmount += price
	deduct: (amount) ->
		@totalAmount -= amount
	total: ()->
		@onTotal undefined, @totalAmount

class Discounter extends EventEmitter
	constructor: (@discounts) ->
		@itemCount = {}
	newItem: (item) ->
		@makeDiscount(item) if @hasDiscount(item)			
	hasDiscount: (item) ->
		@getDiscount(item) isnt undefined
	getDiscount: (item) ->
		@discounts[item]
	makeDiscount: (item) ->
		@incrementItemCount(item)
		discount = @getDiscount(item)
		@emit('Discount', discount.amount) if @itemCount[item] % discount.quantity is 0
	incrementItemCount: (item) ->
		@itemCount[item] = if @itemCount[item] then @itemCount[item] + 1 else 1