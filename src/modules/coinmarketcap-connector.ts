import { CoreConnector } from './core-connector';
import * as querystring from 'querystring';
import * as cron from 'node-cron';

export default class CoinmaketcapConnector extends CoreConnector {
	moduleName = 'Coinmarcetcap';
	apiURI = 'https://api.coinmarketcap.com/v1';
	fetch;
	Scheduler;

	constructor(fetch, opts?) {
		super(opts);
		this.fetch = fetch;
	}

	run() {
		this.initCron(this.refreshTime);
	}

	initCron(time) {
		this.event('connectors', 'Coinmarketcap: Scheduler started!');
		this.Scheduler = cron.schedule(time, () => {
			this.getBTCPrice();
		});
	}

	async ticker(opts?) {
		const query = querystring.stringify(opts);
		const res = await this.fetch(`${this.apiURI}/ticker/?${query}`);
		return res.json();
	}

	async tickerByAsset(asset?, opts?) {
		let query = querystring.stringify(opts);
		let res = await this.fetch(`${this.apiURI}/ticker/${asset}/?${query}`);
		let [data] = await res.json();
		return data;
	}

	getBTCPrice() {
		this.tickerByAsset('bitcoin').then(resp => {
			let priceChanges = this.diffCurrent(resp['price_usd']);
			if (priceChanges) {
				this.priceTicker.next(priceChanges);
				this.event('price', {name: this.moduleName, price: resp['price_usd']});
			}

		}).catch(e => {
			console.error(`Coinmarketcap: API fetch error: ${e.toString()}`);
		});
	}

}
