vows = require 'vows'
assert = require 'assert'
EventEmitter = require('events').EventEmitter

prices = 
	'A': 50
	'B': 30
	'C': 20
	'D': 15

vows.describe('checkout tests')
	.addBatch(
		'no special offers - one item':
			'when one A': 
				topic: () -> 
					new Checkout(@callback, prices).scan('A').total()
					undefined
				'total is 50': (err, total) ->
					assert.equal total, 50
			'when one B':
				topic: () ->
					new Checkout(@callback, prices).scan('B').total()
					undefined
				'total is 30': (err, total) ->
					assert.equal total, 30
			'when one C':
				topic: () ->
					new Checkout(@callback, prices).scan('C').total()
					undefined
				'total is 30': (err, total) ->
					assert.equal total, 20
			'when one D':
				topic: () ->
					new Checkout(@callback, prices).scan('D').total()
					undefined
				'total is 30': (err, total) ->
					assert.equal total, 15
		'no special offers - multiple items':
			'when two A':
				topic: () -> 
					new Checkout(@callback, prices).scan('A').scan('A').total()
					undefined
				'total is 100': (err, total) ->
					assert.equal total, 100
			'when one A and one B':
				topic: () -> 
					new Checkout(@callback, prices).scan('A').scan('B').total()
					undefined
				'total is 80': (err, total) ->
					assert.equal total, 80
		'special offers'
			'when three A': 
				topic: () -> 
					new Checkout(@callback, prices).scan('A').scan('A').scan('A').total()
					undefined
				'total is 130': (err, total) ->
					assert.equal total, 130
	)
	.run()


class Checkout 
	constructor: (onTotal, @prices) ->
		totaller = new Totaller(onTotal)
		@scanner = new Scanner(@prices)
		@scanner.on 'NewItem', (itemInfo) ->
			totaller.add(itemInfo.price)
		@totaller = totaller

	scan: (item) -> 
		@scanner.scan(item)
		this
	total: () ->
		@totaller.total()


class Scanner extends EventEmitter
	constructor: (@prices) ->
	scan: (item) ->
		@emit('NewItem',
			item: item 
			price: @prices[item]
		)

class Totaller 	
	constructor: (@onTotal) ->
		@totalAmount = 0
	add: (price) ->
		@totalAmount += price 
	total: ()->
		@onTotal undefined, @totalAmount

