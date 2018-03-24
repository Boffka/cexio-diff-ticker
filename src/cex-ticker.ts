const config = require('../app.config');
import * as EventEmitter from 'events';
import * as WSClient from 'ws';
import * as moment from 'moment';
import fetch from 'node-fetch';
import CexConnector from './modules/cex-connector'
import CoinmaketcapConnector from './modules/coinmarketcap-connector';

export class CexTicker extends EventEmitter {
	config;
	workers = [];
	priceDifference;
	lastUpdate = Date.now();

	constructor(opts?) {
		super();
		this.config = config;
		if (opts) this.setup(opts);
	}

	setup(options?) {
		let params = Object.keys(this.config);
		if (options) {
			if (options._) delete options._;
			Object.keys(options).map((key) => {
				if (params.includes(key)) {
					if (typeof options[key] === typeof this.config[key]) {
						this.config[key] = options[key];
					} else {
						throw new Error(`Param ${key} must be a ${typeof this.config[key]}`);
					}
				} else {
					throw new Error(`Wrong parameter ${key} . Allowable parameters: ${params}`)
				}
				console.log(key)
			})
		}
	}

	run() {
		this.createWorkers();
		this.subscribeToEvents();
		this.subscribeToPrices();
		this.initConnectors();
	}

	stop() {
		Object.keys(this.workers).forEach((key) => {
			this.workers[key].stop();
		})

	}

	createWorkers() {
		this.workers['cex'] = new CexConnector(WSClient, this.config);
		this.workers['coinmarcetcap'] = new CoinmaketcapConnector(fetch, this.config);
	}

	initConnectors() {
		Object.keys(this.workers).forEach((key) => {
			this.workers[key].run();
		});
	}

	subscribeToPrices() {
		this.workers['cex'].price.subscribe(() => {
			this.getPriceDiffs()
		});
		//this.workers['coinmarcetcap'].price.subscribe(console.info)
	}

	subscribeToEvents() {
		Object.keys(this.workers).forEach((key) => {
			this.workers[key].events.subscribe((ev) => {
				this.emit(ev.name, ev.msg);
			})
		});
	}

	getPriceDiffs() {
		let y = this.workers['cex'].currentPrice;
		let x = this.workers['coinmarcetcap'].currentPrice;
		if (y && x) {
			let diff: any = 100.0 * ((y - x) / x);
			diff = this.round(diff, this.config.precision);
			if (diff !== this.priceDifference) {
				let now = Date.now();
				let timeAgo = moment.unix((now - this.lastUpdate) / 1000).format('mm:ss');
				this.lastUpdate = now;
				this.priceDifference = diff;
				this.emit('tick', {time: timeAgo, diff: diff});
				if (!this.config.silent) console.info(`${timeAgo} ${diff}%`);
			}
		}
		//
	}

	//Jack Moore Rounding Decimals Fix
	round(value, decimals) {
		decimals = (decimals) ? decimals : this.config.precision;
		return Number(`${Math.round(Number(`${value}e${decimals}`))}e-${decimals}`).toFixed(decimals);
	}

}

module.exports = CexTicker;
