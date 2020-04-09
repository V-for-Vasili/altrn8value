---
title: API Reference

language_tabs: # must be one of https://git.io/vQNgJ
  - shell
  - javascript
  - ruby
  - python

toc_footers:
  - <a href='https://github.com/slatedocs/slate'>Documentation Powered by Slate</a>

includes:
  - errors

search: true
---

# Introduction
## About the API

## Financial Modeling Prep

## Executing Graphql Queries

## Graphiql

# Authentication

> To authorize, use this code:

```ruby
require 'kittn'

api = Kittn::APIClient.authorize!('meowmeowmeow')
```

```python
import kittn

api = kittn.authorize('meowmeowmeow')
```

```shell
# With shell, you can just pass the correct header with each request
curl "api_endpoint_here"
  -H "Authorization: meowmeowmeow"
```

```javascript
const kittn = require('kittn');

let api = kittn.authorize('meowmeowmeow');
```

> Make sure to replace `meowmeowmeow` with your API key.

Kittn uses API keys to allow access to the API. You can register a new Kittn API key at our [developer portal](http://example.com/developers).

Kittn expects for the API key to be included in all API requests to the server in a header that looks like the following:

`Authorization: meowmeowmeow`

<aside class="notice">
You must replace <code>meowmeowmeow</code> with your personal API key.
</aside>

# Stock

The Stock Object is the interface used to pull all stock data from
the backend about any stock that can be purchased and added to a portfolio.

## Example

```

```

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

## Balanse Sheet

## Income Statement

## History

# Portfolio
