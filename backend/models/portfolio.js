/*jshint esversion: 6 */
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
    stock: Stock
    shares: Float
    purchasePrice: Float
    purchaseTime: String
  }

  type Agregate {
      value: Int
      date: Int
  }

  input stockListInput {
    symbol: String
    shares: Float
    purchasePrice: Float
    purchaseTime: String
  }

  type Portfolio {
    name: String!
    stock_list: [Stock_Purchase]!
    purchaseValue: Float!
    currentValue: Float!
    createdAt: String!
    agregate: [Agregate]
  }`;

  // Create portfolio
  let createPortfolioQueryDef = `
  createPortfolio (
    name: String!
    stock_list: [stockListInput!]!
    purchaseValue: Float!
    createdAt:String!
  ): Portfolio
  `;

  let createPortfolioResolver = async (obj, args, context, info) => {
    // Check the user is authenticated
    
    //if (!context.isAuth) throw new Error(errorName.ACCESS_DENIED);
    //let userID = context.uid;
    let userID = "sanicTheHedgehog";

    // For each stock in the list check it exists
    let name = args.name;
    // Check whether this exists alread
    let result = await Portfolio.findOne({uid: userID, name});
    if (result) throw new Error(errorName.CONFLICT);

    let stockListInput = args.stock_list;
    // if no stock list provided, start with empty list
    if (!stockListInput) stockListInput = [];
    else {
      // Extract list of symbols
      let symbols = stockListInput.map(obj => {
        let rObj = obj.symbol;
        return rObj;
      });
      try {
      // Check all symbols are valid 
      console.log("SYMBOLS ARE:",symbols);
      let response = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${symbols.toString()}`);
      let stocks = response.data;
      console.log("STOCKS ARE",stocks);
      console.log("SYMBOLS LENGTH: ",symbols.length);
      console.log("STOCKS LENGTH: ",stocks.length);
      if (stocks.length != symbols.length) throw new Error(errorName.NOT_FOUND);
        // Change date strings to ISO objects so they can be used in queries in MOGODB
        // let sl = stockListInput.map(obj => {
        //   let rObj = obj;
        //   rObj.purchaseTime = Date.parse(obj.purchaseTime);
        //   return rObj;
        // });
        let portfolio =  new Portfolio({uid: userID, name:name, stock_list: stockListInput,purchaseValue:args.purchaseValue , createdAt:args.createdAt});
        await portfolio.save();
        console.log(portfolio);
        
        return portfolio;
      } catch (err) {
        console.log(err);
      }
      // If any of symbols are invalid lengths will differ
    }
  }


// Get Portfolio
let portfolioQueryDef = `portfolio(name: String!): Portfolio`;

let portfolioQueryResolver = async (obj, args, context, info) => {
  // Check the user is authenticated
  //if (!context.isAuth) throw new Error(errorName.ACCESS_DENIED);
  //let userID = context.uid;
  let userID = "sanicTheHedgehog";
  // Get Portfolio by name from db
  let result = null;
  let response = await Portfolio.findOne({uid: userID, name: args.name}, function(err, res) {
    if (err) return console.log(err);
    if(!res) throw new Error(errorName.NOT_FOUND);
    
    result = res;
  });

  if(!result) throw new Error(errorName.NOT_FOUND);
  return result;
}

let portfolioListQueryDef = `
    portfolioList:[Portfolio]
`;

let portfolioListResolver = async (obj, args, context, info) => {
    // Check the user is authenticated
    //if (!context.isAuth) throw new Error(errorName.ACCESS_DENIED);
    // Fetch and return all portfolios that are associated with given uid
    //let userID = context.uid;
    let userID = "sanicTheHedgehog";
    return await Portfolio.find({uid: userID});
}

let portfolioFieldResolvers = {
  // stock_list:  async (obj, args, context, info) => {
  //   // Check the user is authenticated
  //   if (!context.isAuth) throw new Error(errorName.ACCESS_DENIED);
  //   // Get Portfolio by name
  //   const name = obj.name;
  //   // Checks for each element of the stock list
  //   let parent_list = obj.stock_list;
  //   // If no Portfolio was found throw and error
  //   if(!parent_list) throw new Error(errorName.NOT_FOUND);
  //   // For each stock populate its fields
  //   let stock_list = [];
  //   for (stock_element in parent_list) {
  //     stock_element = parseInt(stock_element);
  //     let amount = parent_list[stock_element].amount;
  //     let symbol = parent_list[stock_element].symbol;
  //     let stock = {};
  //     try {
  //       stock = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${symbol}`);
  //       stock = stock.data[0];
  //     } catch (err) {
  //       console.log(err);
  //     }
  //     stock_list.push({stock: {
  //       exchange: stock.exhange,
  //       symbol: stock.symbol,
  //       price: stock.price,
  //       market_cap: stock.marketCap,
  //       change: stock.change,
  //       changes_percentage: stock.changesPercentage,
  //       avg_volume: stock.avgVolume,
  //     }, amount: amount}) ;
  //   }
  //   return stock_list;
  // },
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

// Delete Portfolio
let deletePortfolioQueryDef = `
  deletePortfolio (
    name: String!
  ): Portfolio
`;

let deletePortfolioResolver = async (obj, args, context, info) => {
  // Check the user is authenticated
  //if (!context.isAuth) throw new Error(errorName.ACCESS_DENIED);
  //let userID = context.uid;
  let userID = "sanicTheHedgehog";
  // remove 1 document from db, return result if successful
  let result = null;
  let x = await Portfolio.findOneAndDelete({uid:userID, name: args.name}, function(err, item) {
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
    purchaseValue : Float!
  ): Portfolio
`;

let updatePortfolioResolver = async (obj, args, context, info) => {
  // Check the user is authenticated
  //if (!context.isAuth) throw new Error(errorName.ACCESS_DENIED);
  //let userID = context.uid;
  let userID = "sanicTheHedgehog";
  // make sure portfolio with that name does exist for that username
  let portfolio = await Portfolio.findOne(
                            {uid: userID, name: args.name},
                            'name uid stock_list purchaseValue',
                            async function(err, doc) {
    if (err) return console.log(err);
  });
  if (!portfolio) throw new Error(errorName.NOT_FOUND);
  // uddate the portfolio object with the given stock list
  let result = await Portfolio.findOneAndUpdate(
                            {uid: userID, name: args.name},
                            {stock_list: args.stock_list,purchaseValue:args.purchaseValue},
                            {upsert: false},
                            async function(err, doc) {
    if (err) return console.log(err);
  });
  // return updated portfolio
  return result;
}


// Portfolio list



module.exports = {portfolioTypeDef,portfolioFieldResolvers,
    portfolioQueryResolver, portfolioQueryDef,
    createPortfolioQueryDef, createPortfolioResolver,
    deletePortfolioQueryDef, deletePortfolioResolver,
    updatePortfolioQueryDef, updatePortfolioResolver,
    portfolioListQueryDef, portfolioListResolver};
