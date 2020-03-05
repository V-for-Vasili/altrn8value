// Imports
const express = require('express');
const graphqlHTTP = require('express-graphql');
const morgan = require('morgan');
const morganBody = require('morgan-body');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');
const { buildSchema } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');


// Start building express app
let app = express();

// BodyParser Config
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// serve frontend statically
app.use(express.static('frontend'));

// Enviroment Variables
const PORT =  process.env.FACEBOOK_KEY || '8080';
CONNECTION_URL = process.env.CONNECTION_URL || 'mongodb://myTester:123456@localhost:27017/test?retryWrites=true&w=majority';

// Settup Logger
morgan.token('id', function getId(req) {
  return req.id
});

let loggerFormat = ':id [:date[web]] ":method :url" :status :response-time';
app.use(morgan(loggerFormat));
morganBody(app);


/*
symbol: String
price: Float

market_cap: Float
change: Float
changes_percentage: Float
avg_volume: Int

company_profile: CompanyProfile
quote: Quote
*/


const typeDefs = `type CompanyProfile {
    beta: String
    last_div: String
    range: String
    company_name: String
    industry: String
    website: String
    description: String
    ceo: String
    sector: String
    image: String
  }

  type Quote {
    day_low: Float
    day_high: Float
    year_high: Float
    year_low: Float
    price_avg_50: Float
    price_avg_200: Float
    volume: Int
    open: Float
    previous_close: Float
    eps: Float
    pe: Float
    earnings_announcement: String
    shares_outstanding: Float
    timestamp: Int
  }

  type Rating {
    score: Int
    rating: String
    recommendation: String
  }

  type RatingDetail {
    type: String
    score: Int
    recommendation: String
    exchange: String
  }

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

  type HistoricalClosing {
    date: String
    open: Float
    high: Float
    low: Float
    close: Float
    adjClose: Float
    volume: Float
    unadjustedVolume: Float
    change: Float
    changePercent: Float
    vwap: Float
    label: String
    changeOverTime: Float
  }

  type Stock {
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
    history(from: String, to: String, timeseries: String): [HistoricalClosing]
  }

  type Query {
    stock(symbol: String!): Stock
  }`

const resolvers = {
  Query: {
    stock: async (_, {symbol}) => {

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
  },
  Stock: {
    company_profile: async (obj, args, context, info) => {
      let response = {};
      try {
        response = await axios.get(`https://financialmodelingprep.com/api/v3/company/profile/${obj.symbol}`);
        response = response.data.profile;
      } catch (err) {
        console.log(err);
      }
      if(!response) {
        return null
      } else {
        return {
          beta: response.beta,
          last_div: response.lastDiv,
          range: response.range,
          company_name: response.companyName,
          industry: response.industry,
          website: response.website,
          description: response.description,
          ceo: response.ceo,
          sector: response.sector,
          image: response.image
        }
      }
    },
    quote: async (obj, args, context, info) => {
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

    },
    rating: async (obj, args, context, info) => {
      let response = {};
      try {
        response = await axios.get(`https://financialmodelingprep.com/api/v3/company/rating/${obj.symbol}`);
        response = response.data.rating;
      } catch (err) {
        console.log(err);
      }
      if(!response) {
        return null
      } else {
        return {
          score: response.score,
          rating: response.rating,
          recommendation: response.recommendation
        }
      }
    },
    rating_details: async (obj, args, context, info) => {
      let response = {};
      try {
        response = await axios.get(`https://financialmodelingprep.com/api/v3/company/rating/${obj.symbol}`);
        response = response.data;
      } catch (err) {
        console.log(err);
      }
      if(!response) {
        return null
      } else {
        let ratings = [];
        const pb = response.ratingDetails["P/B"]
        ratings.push({type: "P/B", score: pb.score, recommendation: pb.recommendation});
        const roa = response.ratingDetails["ROA"]
        ratings.push({type: "ROA", score: roa.score, recommendation: roa.recommendation});
        const  dcf = response.ratingDetails["DCF"]
        ratings.push({type: "DCF", score: dcf.score, recommendation: dcf.recommendation});
        const pe = response.ratingDetails["P/E"]
        ratings.push({type: "P/E", score: pe.score, recommendation: pe.recommendation});
        const roe = response.ratingDetails["ROE"]
        ratings.push({type: "ROE", score: roe.score, recommendation: roe.recommendation});
        const ed = response.ratingDetails["D/E"]
        ratings.push({type: "D/E", score: ed.score, recommendation: ed.recommendation});
        return ratings;
      }
    },
    history: async (obj, args, context, info) => {
      let from = args.from;
      let to = args.to;
      let timeseries = args.timeseries;
      let response = {};
      try {
        if (timeseries) {
          response = await axios.get(`https://financialmodelingprep.com/api/v3/historical-price-full/${obj.symbol}?timeseries=${timeseries}`);
            response = response.data.historical;
        } if (to && from) {
          response = await axios.get(`https://financialmodelingprep.com/api/v3/historical-price-full/${obj.symbol}?from=${from}&to=${to}`);
          response = response.data.historical;
        } else {
          response = await axios.get(`https://financialmodelingprep.com/api/v3/historical-price-full/${obj.symbol}`);
          response = response.data.historical;
        }
      } catch (err) {
        console.log(err);
      }
      if(!response) {
        return null
      } else {
        return response
      }
    }
  }
}

let schema = makeExecutableSchema({typeDefs, resolvers});

/*
curl -X POST                                                       \
    -H "Content-Type: application/json"                            \
    -d '{ "query": "{ stock(symbol:\"AAPL\"){ symbol price } }" }' \
    http://localhost:8080/graphql
*/
app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));

// Routes
// healthcheck Function
app.get('/healthcheck/' ,async function (req, res) {
  res.status(200).send("Api is running");
});

// Server is running
console.log(`Service running on port ${PORT}`);
app.listen(PORT);
