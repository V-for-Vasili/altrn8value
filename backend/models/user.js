// Imports
const axios = require('axios');
const FormatError = require('easygraphql-format-error');

// Set up custom errors
const formatError = new FormatError([{name: 'ACCESS_DENIED', message: "access denied", statusCode: 401},{name: 'NOT_FOUND', message: "not found", statusCode: 404}]);
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
  }
`;


// Get Portfolio
let portfolioQueryDef =  `portfolio(name: String!): Portfolio`;

let portfolioQueryResolver = async (obj, args, context, info) => {

  // Check the user is authenticated
  if (!context.uid) throw new Error(errorName.ACCESS_DENIED);
  // Get Portfolio by name
  const name = args.name;
  // Checks for each element of the stock list
  let response = await Portfolio.findOne({uid: context.uid, name}, 'name stock_list', async function(err, docs) {
    if(err) {
      console.log(err);
      return null;
    } else if(!docs){
      throw new Error(errorName.NOT_FOUND);
    }
  });
  if(!response) throw new Error(errorName.NOT_FOUND);
  return  response;
}

let portfolioFieldResolvers = {
  stock_list:  async (obj, args, context, info) => {

    // Check the user is authenticated
    if (!context.uid) throw new Error(errorName.ACCESS_DENIED);
    // Get Portfolio by name
    const name = obj.name;
    // Checks for each element of the stock list
    //let response =  await Portfolio.findOne({uid: context.uid, name}, 'name stock_list');
    let parent_list = obj.stock_list;
    // If no Portfolio was found throw and error
    if(!parent_list) throw new Error(errorName.NOT_FOUND);
    // For each stock populate its fields
    let stock_list = [];
    for (stock_element in parent_list) {
      let stock = {};
      try {
        let symbol = parent_list[parseInt(stock_element)].symbol;
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
      }, amount: parent_list[parseInt(stock_element)].amount }) ;
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
let createPortfolioTypeDef = `


  createPortfolio (
    name: String!
    stock_list: [stockListInput]
  ): Portfolio
`;

let createPortfolioResolver = async (obj, args, context, info) => {
  // Check the user is authenticated
  if (!context.uid) throw new Error(errorName.ACCESS_DENIED);
  // For each stock in the list check it exists
  name = args.name;
  stockListInput = args.stock_list;
  for (i in stockListInput){
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
  let result = await Portfolio.findOne({uid: context.uid, name });
  if(result) return null;
  else {
    let portfolio = new Portfolio({uid: context.uid, name, stock_list: stockListInput});
    portfolio.save();
    return {name, stock_list: stockListInput}
  }
}

// Delete Portfolio
let deletePortfolioTypeDef = `
  deletePortfolio(
    name: String!
  ): Portfolio
`;

let deletePortfolioResolver = async (obj, args, context, info) => {
  // Check the user is authenticated
  if (!context.uid) throw new Error(errorName.ACCESS_DENIED);
}


// Edit Portfolio
let updatePortfolioTypeDef = `
  type Portfolio (
    name: String
    stock_list: [{Stock, amount: Int}]
  ): Portfolio
`;

let updatePortfolioResolver = async (obj, args, context, info) => {
  // Check the user is authenticated
  if (!context.uid) throw new Error(errorName.ACCESS_DENIED);
}



module.exports = {portfolioTypeDef,portfolioFieldResolvers, portfolioQueryResolver, portfolioQueryDef, createPortfolioResolver, createPortfolioTypeDef,
  deletePortfolioTypeDef, deletePortfolioResolver, updatePortfolioTypeDef, updatePortfolioResolver};
