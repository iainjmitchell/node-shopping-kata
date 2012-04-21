vows = require 'vows'
assert = require 'assert'

vows.describe('checkout tests')
	.addBatch(
		'no special offers':
			'when one A': 
				topic: () -> 
					new Checkout(@callback, 50).scan('A').total()
					undefined
				'total is 50': (err, total) ->
					assert.equal total, 50
			'when one B':
				topic: () ->
					new Checkout(@callback, 30).scan('B').total()
					undefined
				'total is 30': (err, total) ->
					assert.equal total, 30
	)
	.run()


class Checkout 
	constructor: (@onTotal, @price) ->
	scan: () -> this
	total: () ->
		console.log @onTotal
		@onTotal undefined, @price 


