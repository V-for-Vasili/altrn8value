// Imports
const axios = require('axios');
const {companyProfileTypeDef, companyProfileResolver} = require("./stockFieldModels/companyProfile.js");
const {historicalClosingTypeDef, historyResolver, historyQueryDef} = require("./stockFieldModels/historicalClosing.js");
const {quoteTypeDef, quoteResolver} = require("./stockFieldModels/quote.js");
const {ratingTypeDef, ratingResolver} = require("./stockFieldModels/rating.js");
const {ratingDetailTypeDef, ratingDetailResolver} = require("./stockFieldModels/ratingDetail.js");
const {cashFlowStatementTypeDef, cashFlowStatementYearResolver, cashFlowStatementQuarterResolver} = require("./stockFieldModels/cashFlowStatement.js");


// TODO: Implement these fields
const {growthTypeDef, growthResolver} = require("./stockFieldModels/growth.js");
const {metricsTypeDef, metricsResolver} = require("./stockFieldModels/metrics.js");

let stockTypeDef = `type Stock {
    symbol: String
    price: Float
    exchange: String
    market_cap: Float
    change: Float
    changes_percentage: Float
    avg_volume: Int
    rating: Rating
    rating_details: [RatingDetail]
    company_profile: CompanyProfile
    quote: Quote
    cash_flow_statement_year: [CashFlowStatement]
    cash_flow_statement_quarter: [CashFlowStatement]
    ${historyQueryDef}
  }`;

let stockQueryDef = `stock(symbol: String!): Stock`

let stockFieldTypeDef=`
  ${companyProfileTypeDef}
  ${historicalClosingTypeDef}
  ${quoteTypeDef}
  ${ratingTypeDef}
  ${ratingDetailTypeDef}
  ${cashFlowStatementTypeDef}
`;

let stockResolver = async (_, {symbol}) => {
  let response = {};
  try {
    response = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${symbol}`);
    response = response.data[0];
  } catch (err) {
    console.log(err);
  }
  if(!response) {
    return null
  } else {
    return {
      exchange: response.exhange,
      symbol: response.symbol,
      price: response.price,
      market_cap: response.marketCap,
      change: response.change,
      changes_percentage: response.changesPercentage,
      avg_volume: response.avgVolume,
    }
  }
}

let stockFieldResolvers = {
  company_profile: companyProfileResolver,
  quote: quoteResolver,
  rating: ratingResolver,
  rating_details: ratingDetailResolver,
  history: historyResolver,
  cash_flow_statement_year: cashFlowStatementYearResolver,
  cash_flow_statement_quarter: cashFlowStatementQuarterResolver,
}

module.exports = {stockTypeDef, stockQueryDef, stockFieldTypeDef, stockResolver, stockFieldResolvers};
