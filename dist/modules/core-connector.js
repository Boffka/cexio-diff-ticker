"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Subject_1 = require("rxjs/Subject");
class CoreConnector {
    constructor(opts) {
        this.priceTicker = new Subject_1.Subject();
        this.price = this.priceTicker.asObservable();
        this.eventTicker = new Subject_1.Subject();
        this.events = this.eventTicker.asObservable();
        this.lastUpdate = Date.now();
        Object.assign(this, opts);
    }
    stop() {
        this.priceTicker.complete();
        if (this.Scheduler)
            this.Scheduler.stop();
        if (this.WSClient)
            this.WSClient.terminate();
    }
    diffCurrent(newPrice) {
        if (this.currentPrice !== newPrice || this.currentPrice === undefined) {
            this.currentPrice = newPrice;
            let _time = Date.now();
            this.timePeriod = _time - this.lastUpdate;
            this.lastUpdate = _time;
            return true;
        }
        else {
            return false;
        }
    }
    event(name, msg) {
        this.eventTicker.next({
            name: name,
            msg: msg
        });
    }
}
exports.CoreConnector = CoreConnector;
