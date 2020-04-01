// Imports
const axios = require('axios');


let balanceSheetTypeDef = `
type BalanceSheet {
    date: String
    cash_and_cash_equivalents: String
    short_term_investments: String
    cash_and_short_term_investments: String
    receivables: String
    inventories: String
    total_current_assets: String
    property_plant_and_equipment_net: String
    goodwill_and_intangible_assets: String
    long_term_investments: String
    tax_assets: String
    total_non_current_assets: String
    total_assets: String
    payables: String
    short_term_debt: String
    total_current_liabilities: String
    long_term_debt: String
    total_debt: String
    deferred_revenue: String
    tax_liabilities: String
    deposit_liabilities: String
    total_non_current_liabilities: String
    total_liabilities: String
    other_comprehensive_income: String
    retained_earnings_deficit: String
    total_shareholders_equity: String
    investments: String
    net_debt: String
    other_ssets: String
    other_liabilities: String
}
`;

function parse_response(response) {
    let statements = [];
    response.forEach(function(item) {
        statements.push({
            date: item['date'],
            cash_and_cash_equivalents: item['Cash and cash equivalents'],
            short_term_investments: item['Short-term investments'],
            cash_and_short_term_investments: item['Cash and short-term investments'],
            receivables: item['Receivables'],
            inventories: item['Inventories'],
            total_current_assets: item['Total current assets'],
            property_plant_and_equipment_net: item['Property, Plant & Equipment Net'],
            goodwill_and_intangible_assets: item['Goodwill and Intangible Assets'],
            long_term_investments: item['Long-term investments'],
            tax_assets: item['Tax assets'],
            total_non_current_assets: item['Total non-current assets'],
            total_assets: item['Total assets'],
            payables: item['Payables'],
            short_term_debt: item['Short-term debt'],
            total_current_liabilities: item['Total current liabilities'],
            long_term_debt: item['Long-term debt'],
            total_debt: item['Total debt'],
            deferred_revenue: item['Deferred revenue'],
            tax_liabilities: item['Tax Liabilities'],
            deposit_liabilities: item['Deposit Liabilities'],
            total_non_current_liabilities: item['Total non-current liabilities'],
            total_liabilities: item['Total liabilities'],
            other_comprehensive_income: item['Other comprehensive income'],
            retained_earnings_deficit: item['Retained earnings (deficit)'],
            total_shareholders_equity: item['Total shareholders equity'],
            investments: item['Investments'],
            net_debt: item['Net Debt'],
            other_ssets: item['Other Assets'],
            other_liabilities: item['Other Liabilities'],
        });
    });
    return statements;
}

let balanceSheetYearResolver = async (obj, args, context, info) => {
    let response = {};
    try {
      response = await axios.get(`https://financialmodelingprep.com/api/v3/financials/balance-sheet-statement/${obj.symbol}`);
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

let balanceSheetQuarterResolver = async (obj, args, context, info) => {
    let response = {};
    try {
      response = await axios.get(`https://financialmodelingprep.com/api/v3/financials/balance-sheet-statement/${obj.symbol}?period=quarter`);
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

module.exports = {balanceSheetTypeDef, balanceSheetYearResolver, balanceSheetQuarterResolver};
