# CEX.io Ticker

Console utility that displays in percentages how much the price of bitcoin in dollars on the cex.io site is different from the price of coinmarketcap.com

### Prerequisites
Tested with following node versions:
- 9.5.0 

## Getting Started

```
git clone dhfjghdjfghkdjfhg
cd hhhh
npm i
npm start
```

##Configuration
###Default config.json
The format of the default configuration file:

```
{
  "refreshTime": "*/10 * * * * *",
  "precision": 4,
  "timeFormat": "mm:ss",
  "silent": false
}
```
**refreshTime** - *Default: "\*/10 \* \* \* \* \*"* 
:The frequency of updates is REST connectors. String in crontab syntax [format](https://github.com/merencia/node-cron).

**precission** - *Default: 4* 
: Number of digits after the decimal point in percent

**precission** - *Default: "mm:ss"* 
: Output date [format](https://momentjs.com/docs/#/displaying/)

**silent** - *Default: false* 
: Silent mode: Without output to console, only tick event 

###Configuring in constructor
You can also configure the utility by specifying parameters in the startup line
```
const CEXTicker = require("./dist/cex-ticker");
const options = {
    "refreshTime": "*/10 * * * * *",
};
const Ticker = new CEXTicker(options);
```



###Running with args
You can also configure the utility by specifying parameters in the startup line
```
node example.js --precission 4 --timeFormat "mm:ss"
```


##Events
###tick
Duplicate the price difference that is output to the console.
Message format JSON:
```
{
  time: 'mm:ss',
  diff: 'Price difference in percent'
}
```
###price
This event is emitted when any connector receives a new price.
```
{
  name: 'Connector name',
  price: 'New received price'
}
```
###connectors
This event is thrown when the connectors state changes.
###errors
This event is not implemented.

## Running the tests
```
npm test
```

## Built With

* [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
* [Maven](https://maven.apache.org/) - Dependency Management
* [ROME](https://rometools.github.io/rome/) - Used to generate RSS Feeds


## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
