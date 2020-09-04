// Imports
const axios = require('axios');
const {retrieveFromCache} = require('../../cache.js');


let historicalClosingTypeDef = `
type HistoricalClosing {
  date: String
  open: Float
  high: Float
  low: Float
  close: Float
  adjClose: Float
  volume: Float
  unadjustedVolume: Float
  change: Float
  changePercent: Float
  vwap: Float
  label: String
  changeOverTime: Float
}`;

let historyResolver = async (obj, args, context, info) => {
    let from = args.from;
    let to = args.to;
    let timeseries = args.timeseries;
    let response = {};

    try {
        if (timeseries == "line") {
            // get data from cache
            // Cache for 60s
            let key = `historicalPriceFull_line_${obj.symbol}`;
            let url = `https://financialmodelingprep.com/api/v3/historical-price-full/${obj.symbol}?serietype=${timeseries}`;
            response = await retrieveFromCache(key, url, 60);
            response = response.historical;
        } else if (timeseries == "1min") {
            // get data from cache
            // Cache for 10s
            let key = `historicalChart_${timeseries}_${obj.symbol}`;
            let url = `https://financialmodelingprep.com/api/v3/historical-chart/${timeseries}/${obj.symbol}`;
            response = await retrieveFromCache(key, url, 10);
        } else if (["5min","15min","30min","1hour"].includes(timeseries)) {
            // get data from cache
            // Cache for 60s
            let key = `historicalChart_${timeseries}_${obj.symbol}`;
            let url = `https://financialmodelingprep.com/api/v3/historical-chart/${timeseries}/${obj.symbol}`;
            response = await retrieveFromCache(key, url, 60);
        } else if (to && from) {
            // We do not cache this because of key explosion
            response = await axios.get(`https://financialmodelingprep.com/api/v3/historical-price-full/${obj.symbol}?from=${from}&to=${to}`);
            response = response.data;
        } else {
            // get data from cache
            // Cache for 60s
            let key = `historicalPriceFull_${obj.symbol}`;
            let url = `https://financialmodelingprep.com/api/v3/historical-price-full/${obj.symbol}`;
            response = await retrieveFromCache(key, url, 60);
            response = response.historical;
        }
    } catch (err) {
        console.log(err);
    }
    if (!response) {
        return null;
    } else {
        return response;
    }
};

let historyQueryDef =  `history(from: String, to: String, timeseries: String): [HistoricalClosing]`;

module.exports = {historicalClosingTypeDef, historyResolver, historyQueryDef};
