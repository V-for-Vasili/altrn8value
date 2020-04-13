---
title: API Reference

language_tabs: # must be one of https://git.io/vQNgJ
  - shell
  - javascript
  - python

toc_footers:
  - <a href='https://github.com/slatedocs/slate'>Documentation Powered by Slate</a>

includes:
  - errors

search: true
---

# Introduction
## About the API

Altern8value, is a stock portfolio backtesting tool. The idea behind Altern8value is that you choose a portfolio of stock and see its historic performance as well as how the portfolio improves over time. Our open api allows uses to programatically use this tool to potentially connect it with AI and advanced scripts to find more optimal portfolios and connect messured metrics with possible successful portfolio managment.

## Financial Modeling Prep

None of what we are doing would be possible with out the API published by Financial Modeling Prep, we also have worked closely with their fouder to keep our API moving smoothly and reduce lag. If you want to know more or get data from their API dirrectly go to https://financialmodelingprep.com/ and check them out. They are doing great things and I encourage anyone developing a fintech app to use their service.

## Executing Graphql Queries

Altern8value takes advantage of graphql's flexible querrying system this means that querries are made to only one endpoint with the actual query schema sent in the body of the message, some examples of this can be found on the pannel to the right.

```shell
curl --location --request POST 'https://altern8value.digital/graphql/' \
--header "Content-Type: application/json" \
--data-raw "{"query":"query { stock(symbol: \"AAPL\") {price, exchange, market_cap}}","variables":{}}"
```  

```javascript
let settings = {
  "url": "https://altern8value.digital/graphql/",
  "method": "POST",
  "timeout": 0,
  "headers": {
    "Content-Type": "application/json"
  },
  "data": JSON.stringify({
    query: "query {  stock(symbol: \"AAPL\") {price, exchange, market_cap}}",
    variables: {}
  })
};

$.ajax(settings).done(function (response) {
  console.log(response);
});  
```  

``` python
import http.client
import mimetypes
conn = http.client.HTTPSConnection("altern8value.digital")
payload = "{\"query\":\"query {  stock(symbol: \\\"AAPL\\\") {price, exchange, market_cap}}\",\"variables\":{}}"
headers = {
  'Content-Type': 'application/json'
}
conn.request("POST", "/graphql/", payload, headers)
res = conn.getresponse()
data = res.read()
print(data.decode("utf-8"))
```  

## Graphiql

Through GraphQL our app has enables the graphiql graphql query editor,
this is a great way to try out our api and test your querries. You can
 find this editor at https://altern8value.digital/graphql/  
 However this does not work with routes that require login.


# Authentication
Authentication is implemented through use of JSON Webtokens. When a user signs in/signs up they recieve in the response a token in the form of an HTTPOnly cookie. When graphQL queries are made that are restricted for authourized users, the cookie containing this token should be contained within their request, its first checked for validation, if valid, then additonal context is passed into the graphql request specifying they are authorized.This conext value can only be set from within the server.Addiotnally the decoded payload of the token contains the user id which is used to locate data unqiue to that user and required required for the restriced queries. If no cookie is founud or the token fails validation then the context is set to unauthorized and the user will be restriced to queries for unauthorized users.  


# Stock

The Stock Object is the interface used to pull all stock data from
the backend about any stock that can be purchased and added to a portfolio.

## Query

The Stock object is returned by the following graphql query

### Query TypeDef

The Query to get Stock data is defined by the following type definition

`stock(symbol: String!): Stock`  

### Query Parameters

Parameter | Type| Required| Default | Description
--------- | --- | ------- |-------- | -----------
symbol | String | Yes| None | The Symbol of the Stock data to be querried.

## Stock Object

The object returned has the following fields available


### Object TypeDef

The Stock object is defined by the following type definition


`type Stock {`  
&nbsp;&nbsp;&nbsp;&nbsp;`  symbol: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`  price: Float`  
&nbsp;&nbsp;&nbsp;&nbsp;`  exchange: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`  market_cap: Float`  
&nbsp;&nbsp;&nbsp;&nbsp;`  change: Float`  
&nbsp;&nbsp;&nbsp;&nbsp;`  changes_percentage: Float`  
&nbsp;&nbsp;&nbsp;&nbsp;`  avg_volume: Int`  
&nbsp;&nbsp;&nbsp;&nbsp;`  rating: Rating`  
&nbsp;&nbsp;&nbsp;&nbsp;`  rating_details: [RatingDetail]`  
&nbsp;&nbsp;&nbsp;&nbsp;`  company_profile: CompanyProfile`  
&nbsp;&nbsp;&nbsp;&nbsp;`  quote: Quote`  
&nbsp;&nbsp;&nbsp;&nbsp;`  cash_flow_statement_year: [CashFlowStatement]`  
&nbsp;&nbsp;&nbsp;&nbsp;`  cash_flow_statement_quarter: [CashFlowStatement]`  
&nbsp;&nbsp;&nbsp;&nbsp;`  balanse_sheet_year: [BalanceSheet]`  
&nbsp;&nbsp;&nbsp;&nbsp;`  balanse_sheet_quarter: [BalanceSheet]`  
&nbsp;&nbsp;&nbsp;&nbsp;`  income_statement_year: [IncomeStatement]`  
&nbsp;&nbsp;&nbsp;&nbsp;`  income_statement_quarter: [IncomeStatement]`  
&nbsp;&nbsp;&nbsp;&nbsp;`  history(from: String, to: String, timeseries: String): [HistoricalClosing]`  
`}`  

### Object Fields

Parameter                   | Type                      |  Description
--------------------------- | ------------------------- |  -----------
symbol                      | String                    | The Stock Symbol of the company
price                       | Float                     | The per share price of the company's stock
exchange                    | String                    | The exchange the company's stock is traded on
market_cap                  | Float                     | The market capitalization of the company
change                      | Float                     | The daily change in stock value
changes_percentage          | Float                     | The the daily change in stock value by percentage
avg_volume                  | Int                       | The Average amount of stock traded
rating                      | Rating                    | The Average rating of the stock over
rating_details              | List of Rating Detail      | List of rating object that each correspond to a method of rating stock
company_profile             | CompanyProfile            | The profile of the company querried
quote                       | Quote                     | The up to date stock quote
cash_flow_statement_year    | List of CashFlowStatement | The historical cash flow statments by year
cash_flow_statement_quarter | List of CashFlowStatement | The historical cash flow statments by quarter
balanse_sheet_year          | List of BalanceSheet       | The historical BalanceSheet statments by year
balanse_sheet_quarter       | List of BalanceSheet       | The historical BalanceSheet statments by quarter
income_statement_year       | List of Income Statement    | The historical Income Statement statments by quarter
income_statement_quarter    | List of Income Statement    | The historical Income Statement statments by quarter
history                     | List of HistoricalClosing  | The Historical Closing data of the stock querried



## Cash Flow Statement
Parameter                       | Type                      |  Description
------------------------------- | ------------------------- |  -----------
date                            | String                    | Date the statement was reported
depreciation_and_amortization   | String                    | The corresponding accounts value
stock_based_compensation        | String                    | The corresponding accounts value
operating_cash_flow             | String                    | The corresponding accounts value
capital_expenditure: String     | String                    | The corresponding accounts value
acquisitions_and_disposals      | String                    | The corresponding accounts value
investment_purchases_and_sales  | String                    | The corresponding accounts value
investing_cash_flow             | String                    | The corresponding accounts value
issuance_repayment_of_debt      | String                    | The corresponding accounts value
issuance_buybacks_of_shares     | String                    | The corresponding accounts value
dividend_payments               | String                    | The corresponding accounts value
financing_cash_flow             | String                    | The corresponding accounts value
effect_of_forex_changes_on_cash | String                    | The corresponding accounts value
net_cash_flow_change_in_cash    | String                    | The corresponding accounts value
free_cash_flow                  | String                    | The corresponding accounts value
net_cash_marketcap              | String                    | The corresponding accounts value

## Balance Sheet

The Balance Sheed object is defined by the following type definition:

`type IncomeStatement {`  
&nbsp;&nbsp;&nbsp;&nbsp;`date: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`cash_and_cash_equivalents: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`short_term_investments: String
&nbsp;&nbsp;&nbsp;&nbsp;`cash_and_short_term_investments: String
&nbsp;&nbsp;&nbsp;&nbsp;`receivables: String
&nbsp;&nbsp;&nbsp;&nbsp;`inventories: String
&nbsp;&nbsp;&nbsp;&nbsp;`total_current_assets: String
&nbsp;&nbsp;&nbsp;&nbsp;`property_plant_and_equipment_net: String
&nbsp;&nbsp;&nbsp;&nbsp;`goodwill_and_intangible_assets: String
&nbsp;&nbsp;&nbsp;&nbsp;`long_term_investments: String
&nbsp;&nbsp;&nbsp;&nbsp;`tax_assets: String
&nbsp;&nbsp;&nbsp;&nbsp;`total_non_current_assets: String
&nbsp;&nbsp;&nbsp;&nbsp;`total_assets: String
&nbsp;&nbsp;&nbsp;&nbsp;`payables: String
&nbsp;&nbsp;&nbsp;&nbsp;`short_term_debt: String
&nbsp;&nbsp;&nbsp;&nbsp;`total_current_liabilities: String
&nbsp;&nbsp;&nbsp;&nbsp;`long_term_debt: String
&nbsp;&nbsp;&nbsp;&nbsp;`total_debt: String
&nbsp;&nbsp;&nbsp;&nbsp;`deferred_revenue: String
&nbsp;&nbsp;&nbsp;&nbsp;`tax_liabilities: String
&nbsp;&nbsp;&nbsp;&nbsp;`deposit_liabilities: String
&nbsp;&nbsp;&nbsp;&nbsp;`total_non_current_liabilities: String
&nbsp;&nbsp;&nbsp;&nbsp;`total_liabilities: String
&nbsp;&nbsp;&nbsp;&nbsp;`other_comprehensive_income: String
&nbsp;&nbsp;&nbsp;&nbsp;`retained_earnings_deficit: String
&nbsp;&nbsp;&nbsp;&nbsp;`total_shareholders_equity: String
&nbsp;&nbsp;&nbsp;&nbsp;`investments: String
&nbsp;&nbsp;&nbsp;&nbsp;`net_debt: String
&nbsp;&nbsp;&nbsp;&nbsp;`other_ssets: String
&nbsp;&nbsp;&nbsp;&nbsp;`other_liabilities: String String`  
&nbsp;&nbsp;&nbsp;&nbsp;`net_profit_margin: String`  
`}`  

## Income Statement

The Income Statement object is defined by the following type definition:

`type IncomeStatement {`  
&nbsp;&nbsp;&nbsp;&nbsp;`date: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`revenue: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`revenue_growth: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`cost_of_revenue: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`gross_profit: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`rd_expenses: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`sga_expense: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`operating_expenses: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`operating_income: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`interest_expense: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`earnings_before_tax: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`income_tax_expense: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`net_ncome_non_controlling_int: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`net_income_discontinued_ops: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`net_income: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`preferred_dividends: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`net_income_com: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`eps: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`eps_diluted: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`weighted_average_shs_out: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`weighted_average_shs_out_dil: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`dividend_per_share: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`gross_margin: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`ebitda_margin: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`ebit_margin: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`profit_margin: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`free_cash_flow_margin: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`ebitda: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`ebit: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`consolidated_income: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`earnings_before_tax_margin: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`net_profit_margin: String`  
`}`  

### Object Fields

Parameter                   | Type                      |  Description
--------------------------- | ------------------------- |  -----------
date                        | String                    | Date of the statement
revenue                     | String                    | Revenue
revenue_growth              | String                    | Revenue Growth
cost_of_revenue             | String                    | Cost of Revenue
gross_profit                | String                    | Gross Profit
rd_expenses                 | String                    | R&D Expenses
sga_expense                 | String                    | SG&A Expense
operating_expenses          | String                    | Operating Expenses
operating_income            | String                    | Operating Income
interest_expense            | String                    | Interest Expense
earnings_before_tax         | String                    | Earnings before Tax
income_tax_expense          | String                    | Income Tax Expense
net_ncome_non_controlling_int | String                    | Net Income - Non-Controlling int
net_income_discontinued_ops | String                    | Net Income - Discontinued ops
net_income                  | String                    | Net Income
preferred_dividends         | String                    | Preferred Dividends
net_income_com              | String                    | Net Income Com
eps                         | String                    | EPS
eps_diluted                 | String                    | EPS Diluted
weighted_average_shs_out    | String                    | Weighted Average Shs Out
weighted_average_shs_out_dil  | String                    | Weighted Average Shs Out (Dil)
dividend_per_share          | String                    | Dividend per Share
gross_margin                | String                    | Gross Margin
ebitda_margin               | String                    | EBITDA Margin
ebit_margin                 | String                    | EBIT Margin
profit_margin               | String                    | Profit Margin
free_cash_flow_margin       | String                    | Free Cash Flow margin
ebitda                      | String                    | EBITDA
ebit                        | String                    | EBIT
consolidated_income         | String                    | Consolidated Income
earnings_before_tax_margin  | String                    | Earnings Before Tax Margin
net_profit_margin           | String                    | Net Profit Margin


## Historical Closing

The Historical Closing object is defined by the following type definition:

`type HistoricalClosing {`  
&nbsp;&nbsp;&nbsp;&nbsp;`date: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`open: Float`  
&nbsp;&nbsp;&nbsp;&nbsp;`high: Float`  
&nbsp;&nbsp;&nbsp;&nbsp;`low: Float`  
&nbsp;&nbsp;&nbsp;&nbsp;`close: Float`  
&nbsp;&nbsp;&nbsp;&nbsp;`adjClose: Float`  
&nbsp;&nbsp;&nbsp;&nbsp;`volume: Float`  
&nbsp;&nbsp;&nbsp;&nbsp;`unadjustedVolume: Float`  
&nbsp;&nbsp;&nbsp;&nbsp;`change: Float`  
&nbsp;&nbsp;&nbsp;&nbsp;`changePercent: Float`  
&nbsp;&nbsp;&nbsp;&nbsp;`vwap: Float`  
&nbsp;&nbsp;&nbsp;&nbsp;`label: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`changeOverTime: Float`  
`}`  

### Object Fields

Parameter                   | Type                      |  Description
--------------------------- | ------------------------- |  -----------
date                        | String                    | Date of the closing
open                        | Float                     | Price at opening
high                        | Float                     | Highest day price
low                         | Float                     | Lowest day price
close                       | Float                     | Price at closing
volume                      | Float                     | Volume traded
unadjustedVolume            | Float                     | Unajusted volume traded
change                      | Float                     | Price change for the day
changePercent               | Float                     | Percentage of price change for the day
label                       | String                    | Stock label
changeOverTime              | Float                     | Amount of change over time


# Portfolio

The Portfolio object is defined by the following type definition:

type Portfolio {
&nbsp;&nbsp;&nbsp;&nbsp;name: String!
&nbsp;&nbsp;&nbsp;&nbsp;purchaseValue: Float!
&nbsp;&nbsp;&nbsp;&nbsp;createdAt: String!
&nbsp;&nbsp;&nbsp;&nbsp;stock_list: [Stock_Purchase]!
&nbsp;&nbsp;&nbsp;&nbsp;agregate: [Agregate]
}

## Query

The Portfolio object is returned by the following graphql query

### Query TypeDef

The Query to get Portfolio data is defined by the following type definition

portfolio(name: String!): Portfolio

### Query Parameters

Parameter | Type| Required| Default | Description
--------- | --- | ------- |-------- | -----------
name | String | Yes| None | The name of the Portfolio retrieved.

### Object Fields

Parameter                   | Type                      |  Description
--------------------------- | ------------------------- |  -----------
name                        | String                    | Name of the portfolio
purchaseValue               | Float                     | Cost at the time of purchase
createdAt                   | String                    | Number of seconds from Unix epoch to the time of creation
stock_list                  | [Stock_Purchase]          | List of stock symbols and corresponding amounts in the portfolio
agregate                    | [Agregate]                | List of prices of this porfolio at different points in history

## Agregate

The Agregate object is defined by the following type definition:

type Agregate {
&nbsp;&nbsp;&nbsp;&nbsp;value: Int
&nbsp;&nbsp;&nbsp;&nbsp;date: Int
}

### Object Fields

Parameter                   | Type                      |  Description
--------------------------- | ------------------------- |  -----------
value                       | Int                       | Value of object in USD at data
data                        | Int                       | Date represented as integer
# Stock Purchase

The Stock Purchase object is defined by the following type definition:

`type Stock_Purchase {`  
&nbsp;&nbsp;&nbsp;&nbsp;`stock: Stock`  
&nbsp;&nbsp;&nbsp;&nbsp;`shares: Float`  
&nbsp;&nbsp;&nbsp;&nbsp;`purchasePrice: Float`  
&nbsp;&nbsp;&nbsp;&nbsp;`purchaseTime: String`  
`}`  

## Query

The Stock object is returned by the following graphql query

### Query TypeDef

The Query to get Stock data is defined by the following type definition

`stock(symbol: String!): Stock`  

### Query Parameters

Parameter | Type| Required| Default | Description
--------- | --- | ------- |-------- | -----------
symbol | String | Yes| None | The Symbol of the Stock data to be querried.

## Stock Purchase Object

Parameter                   | Type                      |  Description
--------------------------- | ------------------------- |  -----------
stock                       | Stock                     | Stock object representation
shares                      | Float                     | Number of shares of the stock
purchasePrice               | Float                     | Price at the time of purchase
purchaseTime                | String                    | Number of seconds from Unix epoch to the time of purchase

# Stock Description

The Stock Description object is defined by the following type definition:

`type StockDescription {`  
&nbsp;&nbsp;&nbsp;&nbsp;`symbol: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`name: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`currency: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`stockExchange: String`  
&nbsp;&nbsp;&nbsp;&nbsp;`exchangeShortName: String`  
`}`  

## Query

The Stock object is returned by the following graphql query

### Query TypeDef

`stockList(searchStr: String!): [StockDescription]`

### Query Parameters

Parameter | Type| Required| Default | Description
--------- | --- | ------- |-------- | -----------
String    | String | Yes  | None    | String to search stock symbol for.

## Stock Description Object

Parameter                   | Type                      |  Description
--------------------------- | ------------------------- |  -----------
symbol                      | String                    | Symbol identifiyng the stock (ex: TSLA)
name                        | String                    | Name of the company
currency                    | String                    | Currency the stock is traded in
stockExchange               | String                    | Name of the stock exchange, example New York Stock Exchange
exchangeShortName           | String                    | Abbreviation of stock exchange name, example NYSE
