// Imports
const axios = require('axios');

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
}
`

let historyResolver  =  async (obj, args, context, info) => {
  let from = args.from;
  let to = args.to;
  let timeseries = args.timeseries;
  let response = {};
  try {
    if (timeseries) {
      response = await axios.get(`https://financialmodelingprep.com/api/v3/historical-price-full/${obj.symbol}?serietype=${timeseries}`);
        response = response.data.historical;
    } 
    else if (to && from) {
      response = await axios.get(`https://financialmodelingprep.com/api/v3/historical-price-full/${obj.symbol}?from=${from}&to=${to}`);
      response = response.data.historical;
    } else {
      response = await axios.get(`https://financialmodelingprep.com/api/v3/historical-price-full/${obj.symbol}`);
      response = response.data.historical;
    }
  } catch (err) {
    console.log(err);
  }
  if(!response) {
    return null;
  } else {
    return response;
  }
}

let historyQueryDef =  `history(from: String, to: String, timeseries: String): [HistoricalClosing]`;
module.exports = {historicalClosingTypeDef, historyResolver, historyQueryDef};
