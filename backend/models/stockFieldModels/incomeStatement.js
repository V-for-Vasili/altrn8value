// Imports
const axios = require('axios');


let incomeStatementTypeDef = `
type IncomeStatement {
    date: String
    revenue: String
    revenue_growth: String
    cost_of_revenue: String
    gross_profit: String
    rd_expenses: String
    sga_expense: String
    operating_expenses: String
    operating_income: String
    interest_expense: String
    earnings_before_tax: String
    income_tax_expense: String
    net_ncome_non_controlling_int: String
    net_income_discontinued_ops: String
    net_income: String
    preferred_dividends: String
    net_income_com: String
    eps: String
    eps_diluted: String
    weighted_average_shs_out: String
    weighted_average_shs_out_dil: String
    dividend_per_share: String
    gross_margin: String
    ebitda_margin: String
    ebit_margin: String
    profit_margin: String
    free_cash_flow_margin: String
    ebitda: String
    ebit: String
    consolidated_income: String
    earnings_before_tax_margin: String
    net_profit_margin: String
}`;

function parse_response(response) {
    let statements = [];
    response.forEach(function(item) {
        statements.push({
            date: item['date'],
            revenue: item['Revenue'],
            revenue_growth: item['Revenue Growth'],
            cost_of_revenue: item['Cost of Revenue'],
            gross_profit: item['Gross Profit'],
            rd_expenses: item['R&D Expenses'],
            sga_expense: item['SG&A Expense'],
            operating_expenses: item['Operating Expenses'],
            operating_income: item['Operating Income'],
            interest_expense: item['Interest Expense'],
            earnings_before_tax: item['Earnings before Tax'],
            income_tax_expense: item['Income Tax Expense'],
            net_ncome_non_controlling_int: item['Net Income - Non-Controlling int'],
            net_income_discontinued_ops: item['Net Income - Discontinued ops'],
            net_income: item['Net Income'],
            preferred_dividends: item['Preferred Dividends'],
            net_income_com: item['Net Income Com'],
            eps: item['EPS'],
            eps_diluted: item['EPS Diluted'],
            weighted_average_shs_out: item['Weighted Average Shs Out'],
            weighted_average_shs_out_dil: item['Weighted Average Shs Out (Dil)'],
            dividend_per_share: item['Dividend per Share'],
            gross_margin: item['Gross Margin'],
            ebitda_margin: item['EBITDA Margin'],
            ebit_margin: item['EBIT Margin'],
            profit_margin: item['Profit Margin'],
            free_cash_flow_margin: item['Free Cash Flow margin'],
            ebitda: item['EBITDA'],
            ebit: item['EBIT'],
            consolidated_income: item['Consolidated Income'],
            earnings_before_tax_margin: item['Earnings Before Tax Margin'],
            net_profit_margin: item['Net Profit Margin'],
        });
    });
    return statements;
}

let incomeStatementYearResolver = async (obj, args, context, info) => {
  let response = {};
  try {
    response = await axios.get(`https://financialmodelingprep.com/api/v3/financials/income-statement/${obj.symbol}`);
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

let incomeStatementQuarterResolver = async (obj, args, context, info) => {
  let response = {};
  try {
    response = await axios.get(`https://financialmodelingprep.com/api/v3/financials/income-statement/${obj.symbol}?period=quarter`);
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

module.exports = {incomeStatementTypeDef, incomeStatementYearResolver, incomeStatementQuarterResolver};
