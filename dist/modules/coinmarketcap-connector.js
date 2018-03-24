"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_connector_1 = require("./core-connector");
const querystring = require("querystring");
const cron = require("node-cron");
class CoinmaketcapConnector extends core_connector_1.CoreConnector {
    constructor(fetch, opts) {
        super(opts);
        this.moduleName = 'Coinmarcetcap';
        this.apiURI = 'https://api.coinmarketcap.com/v1';
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
    ticker(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = querystring.stringify(opts);
            const res = yield this.fetch(`${this.apiURI}/ticker/?${query}`);
            return res.json();
        });
    }
    tickerByAsset(asset, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = querystring.stringify(opts);
            let res = yield this.fetch(`${this.apiURI}/ticker/${asset}/?${query}`);
            let [data] = yield res.json();
            return data;
        });
    }
    getBTCPrice() {
        this.tickerByAsset('bitcoin').then(resp => {
            let priceChanges = this.diffCurrent(resp['price_usd']);
            if (priceChanges) {
                this.priceTicker.next(priceChanges);
                this.event('price', { name: this.moduleName, price: resp['price_usd'] });
            }
        }).catch(e => {
            console.error(`Coinmarketcap: API fetch error: ${e.toString()}`);
        });
    }
}
exports.default = CoinmaketcapConnector;
