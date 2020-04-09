// Imports
const axios = require('axios');

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
        response = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${obj.symbol}`);
        response = response.data[0];
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
