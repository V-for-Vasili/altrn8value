// Imports
const {retrieveFromCache} = require('../../cache.js');


let quoteTypeDef = `
type Quote {
  day_low: Float
  day_high: Float
  year_high: Float
  year_low: Float
  price_avg_50: Float
  price_avg_200: Float
  volume: Int
  open: Float
  previous_close: Float
  eps: Float
  pe: Float
  earnings_announcement: String
  shares_outstanding: Float
  timestamp: Int
}`;

let quoteResolver = async (obj, args, context, info) => {
    let response = {};
    try {
        // get data from cache
        let key = `quote_${obj.symbol}`;
        let url = `https://financialmodelingprep.com/api/v3/quote/${obj.symbol}`;
        response = await retrieveFromCache(key, url, 60);
        response = response[0];
    } catch (err) {
        console.log(err);
    }
    if (!response) {
        return null;
    } else {
        return {
            day_low: response.dayLow,
            day_high: response.dayHigh,
            year_high: response.yearHigh,
            year_low: response.yearLow,
            price_avg_50: response.priceAvg50,
            price_avg_200: response.priceAvg200,
            volume: response.volume,
            open: response.open,
            previous_close: response.previousClose,
            eps: response.eps,
            pe: response.pe,
            earnings_announcement: response.earningsAnnouncement,
            shares_outstanding: response.sharesOutstanding,
            timestamp: response.timestamp,
        };
    }
};

module.exports = {quoteTypeDef, quoteResolver};
