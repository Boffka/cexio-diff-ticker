//const mocha = require('mocha');
const assert = require('assert');
const config = require("../app.config");
const CEXTicker = require("../dist/cex-ticker");
const ticker = new CEXTicker();
const expect = require('chai').expect;

describe("Common test", () =>{
	it('Default config implementation test', () =>{
		assert.equal(
			config,
			ticker.config,
			'Config propeerly implemented'
		);
	});
});
describe("3rd part API connectors", () =>{
	after(() =>{
		ticker.stop();
	});
	ticker.config.silent = true;
	it('Create instances of External API modules', () =>{
		ticker.createWorkers();
	});
	/*it('Subscribe to observables events')*/
	it('should subscribe to internal events', function(){
		ticker.subscribeToEvents();
	});
	it('should subscribe to prices', function(){
		ticker.subscribeToPrices();
	});
	it('should start api connectors', function(){
		ticker.initConnectors();
	});
	describe("Coinmarket test", function(){
		this.timeout(60000);
		it('Price is observable', () =>{
			assert.equal(typeof ticker.workers['coinmarcetcap'].price.subscribe, "function", "has subscribed method")
		});
		it('should return true from price observable', (done) =>{
			ticker.workers['coinmarcetcap'].price.subscribe((d) =>{
				assert.equal(d, true);
				done()
			});
		});
	});
	describe("CEX test", function(){
		this.timeout(120000);
		it('Price is observable', () =>{
			assert.equal(typeof ticker.workers['cex'].price.subscribe, "function", "has subscribed method")
		});
		it('should return true from price observable', (done) =>{
			ticker.workers['cex'].price.subscribe((data) =>{
				assert.equal(data, true);
				done()
			})
		});
	});
});
