// Imports
const axios = require('axios');


let cashFlowStatementTypeDef = `
type CashFlowStatement {
    date: String
    depreciation_and_amortization: String
    stock_based_compensation: String
    operating_cash_flow: String
    capital_expenditure: String
    acquisitions_and_disposals: String
    investment_purchases_and_sales: String
    investing_cash_flow: String
    issuance_repayment_of_debt: String
    issuance_buybacks_of_shares: String
    dividend_payments: String
    financing_cash_flow: String
    effect_of_forex_changes_on_cash: String
    net_cash_flow_change_in_cash: String
    free_cash_flow: String
    net_cash_marketcap: String
  }
`
function parse_response(response) {
    let statements = [];
    response.forEach(function(item) {
        statements.push({
            date: item['date'],
            depreciation_and_amortization: item['Depreciation & Amortization'],
            stock_based_compensation: item['Stock-based compensation'],
            operating_cash_flow: item['Operating Cash Flow'],
            capital_expenditure: item['Capital Expenditure'],
            acquisitions_and_disposals: item['Acquisitions and disposals'],
            investment_purchases_and_sales: item['Investment purchases and sales'],
            investing_cash_flow: item['Investing Cash flow'],
            issuance_repayment_of_debt: item['Issuance (repayment) of debt'],
            issuance_buybacks_of_shares: item['Issuance (buybacks) of shares'],
            dividend_payments: item['Dividend payments'],
            financing_cash_flow: item['Financing Cash Flow'],
            effect_of_forex_changes_on_cash: item['Effect of forex changes on cash'],
            net_cash_flow_change_in_cash: item['Net cash flow / Change in cash'],
            free_cash_flow: item['Free Cash Flow'],
            net_cash_marketcap: item['Net Cash/Marketcap'],
        });
    });
    return statements;
}

let cashFlowStatementYearResolver = async (obj, args, context, info) => {
  let response = {};
  try {
    response = await axios.get(`https://financialmodelingprep.com/api/v3/financials/cash-flow-statement/${obj.symbol}`);
    response = response.data.financials;
  } catch (err) {
    console.log(err);
  }
  if(!response) {
    return null;
  } else {
    return parse_response(response);
  }
}

let cashFlowStatementQuarterResolver = async (obj, args, context, info) => {
  let response = {};
  try {
    response = await axios.get(`https://financialmodelingprep.com/api/v3/financials/cash-flow-statement/${obj.symbol}?period=quarter`);
    response = response.data.financials;
  } catch (err) {
    console.log(err);
  }
  if(!response) {
    return null;
  } else {
    return parse_response(response);
  }
}

module.exports = {cashFlowStatementTypeDef, cashFlowStatementYearResolver, cashFlowStatementQuarterResolver};
