// Imports
const axios = require('axios');

let metricsTypeDef = `
type Metrics {
  date: String
  revenue_per_share: String
  net_income_per_share: String
  operating_cash_flow_per_share: String
  free_cash_flow_per_share: String
  cash_per_share: String
  book_value_per_share: String
  tangible_book_value_per_share: String
  shareholders_equity_per_share: String
  interest_debt_per_share: String
  market_cap: String
  enterprise_value: String
  PE_ratio: String
  price_to_sales_ratio: String
  POCF_ratio: String
  PFCF_ratio: String
  PB_ratio: String
  PTB_ratio: String
  EV_to_sales: String
  enterprise_value_over_EBITDA: String
  EV_to_operating_cash_flow: String
  EV_to_free_cash_flow: String
  earnings_yield: String
  free_cash_flow_yield: String
  debt_to_equity: String
  debt_to_assets: String
  net_debt_to_EBITDA: String
  current_ratio: String
  interest_coverage: String
  income_quality: String
  dividend_yield: String
  payout_ratio: String
  SG_and_A_to_revenue: String
  R_and_D_to_revenue: String
  intangibles_to_total_assets: String
  capex_to_operating_cash_flow: String
  capex_to_revenue: String
  capex_to_depreciation: String
  stock_based_compensation_to_revenue: String
  graham_number: String
  graham_net_net: String
  working_capital: String
  tangible_asset_value: String
  net_current_asset_value: String
  invested_capital: String
  average_receivables: String
  average_payables: String
  average_inventory: String
  capex_per_share: String
}
`

let metricsResolver  = {};

module.exports = {metricsTypeDef, metricsResolver};
