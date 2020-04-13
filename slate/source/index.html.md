---
title: API Reference

language_tabs: # must be one of https://git.io/vQNgJ
  - shell
  - HTTP
  - js-jQuery
  - js-XHR
  - node.js
  - Python

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
--header 'Content-Type: application/json' \
--data-raw '{"query":"query {\n  stock(symbol: \"AAPL\") {price, exchange, market_cap}\n}","variables":{}}'
```
```HTTP
POST /graphql/ HTTP/1.1
Host: altern8value.digital
Content-Type: application/json
{"query":"query {\n  stock(symbol: \"AAPL\") {price, exchange, market_cap}\n}","variables":{}}
```  

```js-jQuery
let settings = {
  "url": "https://altern8value.digital/graphql/",
  "method": "POST",
  "timeout": 0,
  "headers": {
    "Content-Type": "application/json"
  },
  "data": JSON.stringify({
    query: "query {\n  stock(symbol: \"AAPL\") {price, exchange, market_cap}\n}",
    variables: {}
  })
};

$.ajax(settings).done(function (response) {
  console.log(response);
});  
```  

``` js-XHR
let data = JSON.stringify({
  query: "query {\n  stock(symbol: \"AAPL\") {price, exchange, market_cap}\n}",
  variables: {}
});

let xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function() {
  if(this.readyState === 4) {
    console.log(this.responseText);
  }
});

xhr.open("POST", "https://altern8value.digital/graphql/");
xhr.setRequestHeader("Content-Type", "application/json");

xhr.send(data);
```  

``` node.js
let https = require('follow-redirects').https;
let fs = require('fs');

let options = {
  'method': 'POST',
  'hostname': 'altern8value.digital',
  'path': '/graphql/',
  'headers': {
    'Content-Type': 'application/json'
  },
  'maxRedirects': 20
};

let req = https.request(options, function (res) {
  let chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function (chunk) {
    let body = Buffer.concat(chunks);
    console.log(body.toString());
  });

  res.on("error", function (error) {
    console.error(error);
  });
});

let postData = JSON.stringify({
  query: "query {\n  stock(symbol: "AAPL") {price, exchange, market_cap}\n}",
  variables: {}
});

req.write(postData);

req.end();
```  

``` Python
import http.client
import mimetypes
conn = http.client.HTTPSConnection("altern8value.digital")
payload = "{\"query\":\"query {\\n  stock(symbol: \\\"AAPL\\\") {price, exchange, market_cap}\\n}\",\"variables\":{}}"
headers = {
  'Content-Type': 'application/json'
}
conn.request("POST", "/graphql/", payload, headers)
res = conn.getresponse()
data = res.read()
print(data.decode("utf-8"))
```

## Graphiql

# Authentication



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

`type Portfolio {`
&nbsp;&nbsp;&nbsp;&nbsp;`name: String!`
&nbsp;&nbsp;&nbsp;&nbsp;`purchaseValue: Float!`
&nbsp;&nbsp;&nbsp;&nbsp;`createdAt: String!`
&nbsp;&nbsp;&nbsp;&nbsp;`stock_list: [Stock_Purchase]!`
&nbsp;&nbsp;&nbsp;&nbsp;`agregate: [Agregate]`
`}`

### Object Fields

Parameter                   | Type                      |  Description
--------------------------- | ------------------------- |  -----------
name                        | String                    | Name of the portfolio
purchaseValue               | Float                     | Cost at the time of purchase
createdAt                   | String                    | Number of seconds from Unix epoch to the time of creation
stock_list                  | [Stock_Purchase]          | List of stock symbols and corresponding amounts in the portfolio
agregate                    | [Agregate]                | List of prices of this porfolio at different points in history

# Stock Purchase

The Stock Purchase object is defined by the following type definition:

`type Stock_Purchase {`
&nbsp;&nbsp;&nbsp;&nbsp;`stock: Stock`
&nbsp;&nbsp;&nbsp;&nbsp;`shares: Float`
&nbsp;&nbsp;&nbsp;&nbsp;`purchasePrice: Float`
&nbsp;&nbsp;&nbsp;&nbsp;`purchaseTime: String`
`}`

### Object Fields

Parameter                   | Type                      |  Description
--------------------------- | ------------------------- |  -----------
stock                       | Stock                     | Stock object representation
shares                      | Float                     | Number of shares of the stock
purchasePrice               | Float                     | Price at the time of purchase
purchaseTime                | String                    | Number of seconds from Unix epoch to the time of purchase

# Agregate

The Agregate object is defined by the following type definition:

`type Agregate {`
&nbsp;&nbsp;&nbsp;&nbsp;`value: Int`
&nbsp;&nbsp;&nbsp;&nbsp;`date: Int`
`}`

### Object Fields

Parameter                   | Type                      |  Description
--------------------------- | ------------------------- |  -----------
value                       | Int                       | Value of object in USD at data
data                        | Int                       | Date represented as integer

# Stock Description

The Stock Description object is defined by the following type definition:

`type StockDescription {`
&nbsp;&nbsp;&nbsp;&nbsp;`symbol: String`
&nbsp;&nbsp;&nbsp;&nbsp;`name: String`
&nbsp;&nbsp;&nbsp;&nbsp;`currency: String`
&nbsp;&nbsp;&nbsp;&nbsp;`stockExchange: String`
&nbsp;&nbsp;&nbsp;&nbsp;`exchangeShortName: String`
`}`

### Object Fields

Parameter                   | Type                      |  Description
--------------------------- | ------------------------- |  -----------
symbol                      | String                    | Symbol identifiyng the stock (ex: TSLA)
name                        | String                    | Name of the company
currency                    | String                    | Currency the stock is traded in
stockExchange               | String                    | Name of the stock exchange, example New York Stock Exchange
exchangeShortName           | String                    | Abbreviation of stock exchange name, example NYSE
