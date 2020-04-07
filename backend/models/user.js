// Imports
const axios = require('axios');
const FormatError = require('easygraphql-format-error');

// Set up custom errors
const formatError = new FormatError([
    {name: 'ACCESS_DENIED', message: 'access denied', statusCode: 401},
    {name: 'NOT_FOUND', message: 'not found', statusCode: 404},
    {name: 'CONFLICT', message: 'already exists', statusCode: 409},
    {name: 'SERVER_ERROR', message: 'server error', statusCode: 500},
    {name: 'UNIMPLEMENTED', message: 'unimplemented', statusCode: 501},
    ]);
const errorName = formatError.errorName;

// Import MongoDB Type
const {Portfolio} = require('../db/Portfolio.js');


// portfolio type def
let portfolioTypeDef = `
  type Stock_Purchase {
    stock: Stock,
    amount: Int
  }

  type Agregate {
      value: Int
      date: Int
  }

  input stockListInput {
    symbol: String
    amount: Int
  }

  type Portfolio {
    name: String
    stock_list: [Stock_Purchase]
    agregate: [Agregate]
  }`;


// Get Portfolio
let portfolioQueryDef = `portfolio(name: String!): Portfolio`;

let portfolioQueryResolver = async (obj, args, context, info) => {
  // Check the user is authenticated
  if (!context.isAuth) throw new Error(errorName.ACCESS_DENIED);
  // Get Portfolio by name from db
  let response = await Portfolio.findOne({uid: context.uid, name: args.name},
                                        'name stock_list',
                                        async function(err, docs) {
    if (err) return console.log(err);
    if(!docs) throw new Error(errorName.NOT_FOUND);
  });
  if(!response) throw new Error(errorName.NOT_FOUND);
  return response;
}

let portfolioFieldResolvers = {
  stock_list:  async (obj, args, context, info) => {
    // Check the user is authenticated
    if (!context.isAuth) throw new Error(errorName.ACCESS_DENIED);
    // Get Portfolio by name
    const name = obj.name;
    // Checks for each element of the stock list
    let parent_list = obj.stock_list;
    // If no Portfolio was found throw and error
    if(!parent_list) throw new Error(errorName.NOT_FOUND);
    // For each stock populate its fields
    let stock_list = [];
    for (stock_element in parent_list) {
      stock_element = parseInt(stock_element);
      let amount = parent_list[stock_element].amount;
      let symbol = parent_list[stock_element].symbol;
      let stock = {};
      try {
        stock = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${symbol}`);
        stock = stock.data[0];
      } catch (err) {
        console.log(err);
      }
      stock_list.push({stock: {
        exchange: stock.exhange,
        symbol: stock.symbol,
        price: stock.price,
        market_cap: stock.marketCap,
        change: stock.change,
        changes_percentage: stock.changesPercentage,
        avg_volume: stock.avgVolume,
      }, amount: amount}) ;
    }
    return stock_list;
  },
  agregate: async (obj, args, context, info) => {
    let stock_list = obj.stock_list;
    let history_list = [];
    for (i in stock_list) {
      try {
        let symbol = stock_list[i].symbol;
        let stock = await axios.get(`https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}`);
        history_list[i] = {history: stock.data.historical, symbol, amount: stock_list[i].amount}
      } catch (err) {
        console.log(err);
      }
    }
    let agregate = [];
    for (i in history_list) {
      for (j in history_list) {
        agregate[j] = {
          activeStock: 0,
          value: 0,
          individual
        }
      }
    }
    console.log(history_list);
  }
}


// Create portfolio
let createPortfolioQueryDef = `
  createPortfolio (
    name: String!
    stock_list: [stockListInput]
  ): Portfolio
`;

let createPortfolioResolver = async (obj, args, context, info) => {
  // Check the user is authenticated
  if (!context.isAuth) throw new Error(errorName.ACCESS_DENIED);
  // For each stock in the list check it exists
  let name = args.name;
  let stockListInput = args.stock_list;
  // if no stock list provided, start with empty list
  if (!stockListInput) stockListInput = [];
  for (i in stockListInput) {
    // Check The Symbol is valid
    let stock = {};
    try {
      let symbol = stockListInput[i].symbol;
      stock = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${symbol}`);
      stock = stock.data[0];
    } catch (err) {
      console.log(err);
    }
    if (!stock) throw new Error(errorName.NOT_FOUND);
  }
  // Check whether this exists alread
  let result = await Portfolio.findOne({uid: context.uid, name});
  if (result) throw new Error(errorName.CONFLICT);
  else {
    // create and save a portfolo object in database
    let portfolio = new Portfolio({uid: context.uid, name, stock_list: stockListInput});
    portfolio.save();
    return {name, stock_list: stockListInput}
  }
}

// Delete Portfolio
let deletePortfolioQueryDef = `
  deletePortfolio (
    name: String!
  ): Portfolio
`;

let deletePortfolioResolver = async (obj, args, context, info) => {
  // Check the user is authenticated
  if (!context.isAuth) throw new Error(errorName.ACCESS_DENIED);
  // remove 1 document from db, return result if successful
  let result = null;
  let x = await Portfolio.findOneAndDelete({name: args.name}, function(err, item) {
      result = item;
  });
  if (!result) throw new Error(errorName.NOT_FOUND);
  return result;
}


// Edit Portfolio
let updatePortfolioQueryDef = `
  updatePortfolio (
    name: String!
    stock_list: [stockListInput]
  ): Portfolio
`;

let updatePortfolioResolver = async (obj, args, context, info) => {
  // Check the user is authenticated
  if (!context.isAuth) throw new Error(errorName.ACCESS_DENIED);
  // make sure portfolio with that name does exist for that username
  let portfolio = await Portfolio.findOne(
                            {uid: context.uid, name: args.name},
                            'name uid stock_list',
                            async function(err, doc) {
    if (err) return console.log(err);
  });
  if (!portfolio) throw new Error(errorName.NOT_FOUND);
  // uddate the portfolio object with the given stock list
  let result = await Portfolio.findOneAndUpdate(
                            {uid: context.uid, name: args.name},
                            {stock_list: args.stock_list},
                            {upsert: false},
                            async function(err, doc) {
    if (err) return console.log(err);
  });
  // return updated portfolio
  return result;
}


// Portfolio list

let portfolioListQueryDef = `
    portfolioList (
        uid: String!
    ): [Portfolio]
`;

let portfolioListResolver = async (obj, args, context, info) => {
    // Check the user is authenticated
    if (!context.isAuth) throw new Error(errorName.ACCESS_DENIED);
    // Fetch and return all portfolios that are associated with given uid
    return await Portfolio.find({uid: context.uid});
}

module.exports = {portfolioTypeDef,portfolioFieldResolvers,
    portfolioQueryResolver, portfolioQueryDef,
    createPortfolioQueryDef, createPortfolioResolver,
    deletePortfolioQueryDef, deletePortfolioResolver,
    updatePortfolioQueryDef, updatePortfolioResolver,
    portfolioListQueryDef, portfolioListResolver};
