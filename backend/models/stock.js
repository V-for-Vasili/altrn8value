// Imports
const axios = require('axios');
const {companyProfileTypeDef, companyProfileResolver} = require("./stockFieldModels/companyProfile.js");
const {historicalClosingTypeDef, historyResolver, historyQueryDef} = require("./stockFieldModels/historicalClosing.js");
const {quoteTypeDef, quoteResolver} = require("./stockFieldModels/quote.js");
const {ratingTypeDef, ratingResolver} = require("./stockFieldModels/rating.js");
const {ratingDetailTypeDef, ratingDetailResolver} = require("./stockFieldModels/ratingDetail.js");
const {cashFlowStatementTypeDef, cashFlowStatementYearResolver, cashFlowStatementQuarterResolver} = require("./stockFieldModels/cashFlowStatement.js");
const {balanceSheetTypeDef, balanceSheetYearResolver, balanceSheetQuarterResolver} = require("./stockFieldModels/balanceSheet.js");
const {incomeStatementTypeDef, incomeStatementYearResolver, incomeStatementQuarterResolver} = require("./stockFieldModels/incomeStatement.js");
const {retrieveFromCache} = require('../cache.js');


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
    balanse_sheet_year: [BalanceSheet]
    balanse_sheet_quarter: [BalanceSheet]
    income_statement_year: [IncomeStatement]
    income_statement_quarter: [IncomeStatement]
    ${historyQueryDef}
}`;

let stockQueryDef = `stock(symbol: String!): Stock`;

let stockFieldTypeDef=`
  ${companyProfileTypeDef}
  ${historicalClosingTypeDef}
  ${quoteTypeDef}
  ${ratingTypeDef}
  ${ratingDetailTypeDef}
  ${cashFlowStatementTypeDef}
  ${balanceSheetTypeDef}
  ${incomeStatementTypeDef}
`;

let stockResolver = async (_, {symbol}) => {
    let response = {};
    try {
        // get data from cache
        let key = `stock_${symbol}`;
        let url = `https://financialmodelingprep.com/api/v3/quote/${symbol}`;
        response = await retrieveFromCache(key, url, 60);
        response = response[0];
    } catch (err) {
        console.log(err);
    }
    if(!response) {
        return null;
    } else {
        return {
            exchange: response.exhange,
            symbol: response.symbol,
            price: response.price,
            market_cap: response.marketCap,
            change: response.change,
            changes_percentage: response.changesPercentage,
            avg_volume: response.avgVolume,
        };
    }
};

let stocksQueryDef = `stocks(symbols: [String!]!): [Stock!]!`;
let stocksResolver = async (_, {symbols}) => {
    let response = {};
    try {
        response = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${symbols.toString()}`);
    } catch (err) {
        console.log(err);
    }
    if(!response) {
        return null;
    } else {
        return response.data;
    }
};



let stockFieldResolvers = {
    company_profile: companyProfileResolver,
    quote: quoteResolver,
    rating: ratingResolver,
    rating_details: ratingDetailResolver,
    history: historyResolver,
    cash_flow_statement_year: cashFlowStatementYearResolver,
    cash_flow_statement_quarter: cashFlowStatementQuarterResolver,
    balanse_sheet_year: balanceSheetYearResolver,
    balanse_sheet_quarter: balanceSheetQuarterResolver,
    income_statement_year: incomeStatementYearResolver,
    income_statement_quarter: incomeStatementQuarterResolver,
};

module.exports = {stockTypeDef, stockQueryDef,stocksQueryDef, stockFieldTypeDef, stockResolver, stockFieldResolvers,stocksResolver};
