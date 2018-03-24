const args = require('minimist')(process.argv.slice(2));
const CEXTicker = require("./dist/cex-ticker");

const ticker = new CEXTicker(args);

/*
ticker.on('tick',console.info);
ticker.on('price',console.info);
ticker.on('connectors',console.info);
ticker.on('error',console.info);
*/

ticker.run();
