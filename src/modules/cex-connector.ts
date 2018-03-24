import { CoreConnector } from './core-connector';

export default class CexConnector extends CoreConnector {
	moduleName = 'CEX';
	apiURI = 'wss://ws.cex.io/ws/';
	WSClient;
	ws;

	constructor(ws, opts?) {
		super(opts);
		this.ws = ws;
	}

	run() {
		this.openWebSocket();
		this.initSocketProps();
	}

	openWebSocket() {
		this.WSClient = new this.ws(this.apiURI);
	}

	initSocketProps() {
		this.WSClient.on('open', () => {
			this.event('connectors', `${this.moduleName}: Socket connected!`);
			this.WSClient.send(
				JSON.stringify({
					e    : 'subscribe',
					rooms: ['ticker']
				})
			);
		});

		this.WSClient.on('message', (message) => {
			let msg = JSON.parse(message);
			if (msg.e === 'ticker' && msg.data.pair === 'BTC:USD') {
				let priceChanges = this.diffCurrent(msg.data.last);
				if (priceChanges) {
					this.priceTicker.next(priceChanges);
					this.event('price', {name: this.moduleName, price: msg.data.last});
				}
			}
		});
		this.WSClient.on('close', () => {
			this.event('connectors', `${this.moduleName}: Connection Closed`);
		});
		this.WSClient.on('error', (e) => {
			this.event('connectors', `${this.moduleName}: Connection Error: ${e.toString()}`);
		});
		// TODO Detect broken connection
	}
}