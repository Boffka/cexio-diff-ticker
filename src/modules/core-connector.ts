import { Subject } from 'rxjs/Subject';

export abstract class CoreConnector {
	abstract moduleName;
	priceTicker = new Subject();
	price = this.priceTicker.asObservable();
	eventTicker = new Subject();
	events = this.eventTicker.asObservable();
	currentPrice;
	lastUpdate = Date.now();
	timePeriod;
	refreshTime;
	Scheduler;
	WSClient;

	constructor(opts) {
		Object.assign(this, opts);
	}

	stop() {
		this.priceTicker.complete();
		if (this.Scheduler) this.Scheduler.stop();
		if (this.WSClient) this.WSClient.terminate();
	}

	diffCurrent(newPrice: string) {
		if (this.currentPrice !== newPrice || this.currentPrice === undefined) {
			this.currentPrice = newPrice;
			let _time = Date.now();
			this.timePeriod = _time - this.lastUpdate;
			this.lastUpdate = _time;
			return true;
		} else {
			return false;
		}

	}

	event(name, msg) {
		this.eventTicker.next({
			name: name,
			msg : msg
		});
	}

	abstract run();

}