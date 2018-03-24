"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require('../app.config');
const EventEmitter = require("events");
const WSClient = require("ws");
const moment = require("moment");
const node_fetch_1 = require("node-fetch");
const cex_connector_1 = require("./modules/cex-connector");
const coinmarketcap_connector_1 = require("./modules/coinmarketcap-connector");
class CexTicker extends EventEmitter {
    constructor(opts) {
        super();
        this.workers = [];
        this.lastUpdate = Date.now();
        this.config = config;
        if (opts)
            this.setup(opts);
    }
    setup(options) {
        let params = Object.keys(this.config);
        if (options) {
            if (options._)
                delete options._;
            Object.keys(options).map((key) => {
                if (params.includes(key)) {
                    if (typeof options[key] === typeof this.config[key]) {
                        this.config[key] = options[key];
                    }
                    else {
                        throw new Error(`Param ${key} must be a ${typeof this.config[key]}`);
                    }
                }
                else {
                    throw new Error(`Wrong parameter ${key} . Allowable parameters: ${params}`);
                }
                console.log(key);
            });
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
        });
    }
    createWorkers() {
        this.workers['cex'] = new cex_connector_1.default(WSClient, this.config);
        this.workers['coinmarcetcap'] = new coinmarketcap_connector_1.default(node_fetch_1.default, this.config);
    }
    initConnectors() {
        Object.keys(this.workers).forEach((key) => {
            this.workers[key].run();
        });
    }
    subscribeToPrices() {
        this.workers['cex'].price.subscribe(() => {
            this.getPriceDiffs();
        });
    }
    subscribeToEvents() {
        Object.keys(this.workers).forEach((key) => {
            this.workers[key].events.subscribe((ev) => {
                this.emit(ev.name, ev.msg);
            });
        });
    }
    getPriceDiffs() {
        let y = this.workers['cex'].currentPrice;
        let x = this.workers['coinmarcetcap'].currentPrice;
        if (y && x) {
            let diff = 100.0 * ((y - x) / x);
            diff = this.round(diff, this.config.precision);
            if (diff !== this.priceDifference) {
                let now = Date.now();
                let timeAgo = moment.unix((now - this.lastUpdate) / 1000).format('mm:ss');
                this.lastUpdate = now;
                this.priceDifference = diff;
                this.emit('tick', { time: timeAgo, diff: diff });
                if (!this.config.silent)
                    console.info(`${timeAgo} ${diff}%`);
            }
        }
    }
    round(value, decimals) {
        decimals = (decimals) ? decimals : this.config.precision;
        return Number(`${Math.round(Number(`${value}e${decimals}`))}e-${decimals}`).toFixed(decimals);
    }
}
exports.CexTicker = CexTicker;
module.exports = CexTicker;
