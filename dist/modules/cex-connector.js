"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_connector_1 = require("./core-connector");
class CexConnector extends core_connector_1.CoreConnector {
    constructor(ws, opts) {
        super(opts);
        this.moduleName = 'CEX';
        this.apiURI = 'wss://ws.cex.io/ws/';
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
            this.WSClient.send(JSON.stringify({
                e: 'subscribe',
                rooms: ['ticker']
            }));
        });
        this.WSClient.on('message', (message) => {
            let msg = JSON.parse(message);
            if (msg.e === 'ticker' && msg.data.pair === 'BTC:USD') {
                let priceChanges = this.diffCurrent(msg.data.last);
                if (priceChanges) {
                    this.priceTicker.next(priceChanges);
                    this.event('price', { name: this.moduleName, price: msg.data.last });
                }
            }
        });
        this.WSClient.on('close', () => {
            this.event('connectors', `${this.moduleName}: Connection Closed`);
        });
        this.WSClient.on('error', (e) => {
            this.event('connectors', `${this.moduleName}: Connection Error: ${e.toString()}`);
        });
    }
}
exports.default = CexConnector;
