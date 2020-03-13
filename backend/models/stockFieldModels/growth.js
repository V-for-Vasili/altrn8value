// Imports
const axios = require('axios');

let growthTypeDef = `
type Growth {
  date: String
  gross_profit_growth: String
  EBIT_growth: String
  operating_income_growth: String
  net_income_growth: String
  EPS_growth: String
  EPS_diluted_growth: String
  weighted_average_shares_growth: String
  weighted_average_shares_diluted_growth: String
  dividends_per_share_growth: String
  operating_cash_flow_growth: String
  free_cash_flow_growth: String
  receivables_growth: String
  inventory_growth: String
  asset_growth: String
  book_value_per_share_growth: String
  debt_growth: String
  R_and_D_expense_growth: String
  SG_and_A_expenses_growth: String
}
`

let growthResolver  = async (obj, args, context, info) => {
  let response = {};
  try {
    response = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${obj.symbol}`);
    response = response.data[0];
  } catch (err) {
    console.log(err);
  }
  if(!response) {
    return null
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
      timestamp: response.timestamp
    }
  }

}

module.exports = {growthTypeDef, growthResolver};
