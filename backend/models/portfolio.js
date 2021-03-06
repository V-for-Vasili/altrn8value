// Imports
const {retrieveFromCache} = require('../cache.js');
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
    purchaseValue: Float!
    createdAt: String!
    stock_list: [Stock_Purchase]!
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
    if (!context.isAuth) throw new Error(errorName.ACCESS_DENIED);
    let userID = context.uid;
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
            // Get data from cache
            let key = `stock_${symbols.toString()}`;
            let url = `https://financialmodelingprep.com/api/v3/quote/${symbols.toString()}`;
            let stocks = await retrieveFromCache(key, url, 60);
            if (stocks.length != symbols.length) throw new Error(errorName.NOT_FOUND);
            // If any of symbols are invalid lengths will differ
            // Change date strings to ISO objects so they can be used in queries in MOGODB
            let portfolio = new Portfolio({uid: userID, name:name, stock_list: stockListInput, purchaseValue:args.purchaseValue, createdAt:args.createdAt});
            await portfolio.save();
            return portfolio;
        } catch (err) {
            console.log(err);
        }
    }
};

// Get Portfolio
let portfolioQueryDef = `portfolio(name: String!): Portfolio`;

let portfolioQueryResolver = async (obj, args, context, info) => {
    // Check the user is authenticated
    if (!context.isAuth) throw new Error(errorName.ACCESS_DENIED);
    let userID = context.uid;
    // Get Portfolio by name from db
    let response = await Portfolio.findOne({uid: userID, name: args.name}, async function(err, docs) {
        if (err) return console.log(err);
        docs.stock_list = docs.stock_list.map(obj => {
            let rObj = obj;
            rObj.stock = {};
            rObj.stock.symbol = obj.symbol;
            rObj.purchaseTime = rObj.purchaseTime;
            return rObj;
        });
        // Json timestamp so that it is parsed properly by frontend
        docs.createdAt = docs.createdAt.toJSON();
    });
    if(!response) throw new Error(errorName.NOT_FOUND);
    return response;
};

let portfolioFieldResolvers = {
    stock_list: async (obj, args, context, info) => {
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
        for (let stock_element in parent_list) {
            stock_element = parseInt(stock_element);
            let shares = parent_list[stock_element].shares;
            let symbol = parent_list[stock_element].symbol;
            let purchasePrice =  parent_list[stock_element].purchasePrice;
            let purchaseTime =  parent_list[stock_element].purchaseTime;
            let stock = {};
            try {
                // get data from cache
                let key = `stock_${symbol}`;
                let url = `https://financialmodelingprep.com/api/v3/quote/${symbol}`;
                stock = await retrieveFromCache(key, url, 60);
                stock = stock[0];
            } catch (err) {
                console.log(err);
            }
            stock_list.push({stock: {
                exchange: stock.exchange,
                symbol: stock.symbol,
                price: stock.price,
                market_cap: stock.marketCap,
                change: stock.change,
                changes_percentage: stock.changesPercentage,
                avg_volume: stock.avgVolume,
            }, shares: shares , purchasePrice:purchasePrice,purchaseTime:purchaseTime});
        }
        return stock_list;
    },
    agregate: async (obj, args, context, info) => {
        let stock_list = obj.stock_list;
        let history_list = [];
        for (let i in stock_list) {
            try {
                // get data from cache
                let key = `historicalPriceFull_${symbol}`;
                let url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}`;
                stock = await retrieveFromCache(key, url, 60);
                history_list[i] = {history: stock.historical, symbol, amount: stock_list[i].amount};
            } catch (err) {
                console.log(err);
            }
        }
        let agregate = [];
        for (let i in history_list) {
            for (let j in history_list) {
                agregate[j] = {
                    activeStock: 0,
                    value: 0,
                    individual
                };
            }
        }
    }
};

// Delete Portfolio
let deletePortfolioQueryDef = `
  deletePortfolio (
    name: String!
  ): Portfolio
`;

let deletePortfolioResolver = async (obj, args, context, info) => {
    // Check the user is authenticated
    if (!context.isAuth) throw new Error(errorName.ACCESS_DENIED);
    let userID = context.uid;
    // remove 1 document from db, return result if successful
    let result = await Portfolio.findOneAndDelete({name: args.name},async function(err, item) {
        if (err) return console.log(err);
    });
    if (!result) console.log("error: empty result from Portfolio.findOneAndDelete");
    return result;
};

// Edit Portfolio
let updatePortfolioQueryDef = `
  updatePortfolio (
    name: String!
    stock_list: [stockListInput]
    purchaseValue: Float!
  ): Portfolio
`;

let updatePortfolioResolver = async (obj, args, context, info) => {
    // Check the user is authenticated
    if (!context.isAuth) throw new Error(errorName.ACCESS_DENIED);
    let userID = context.uid;
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
};

// Portfolio list

let portfolioListQueryDef = `portfolioList:[Portfolio]`;

let portfolioListResolver = async (obj, args, context, info) => {
    // Check the user is authenticated
    if (!context.isAuth) throw new Error(errorName.ACCESS_DENIED);
    // Fetch and return all portfolios that are associated with given uid
    return await Portfolio.find({uid: context.uid});
};

module.exports = {portfolioTypeDef,portfolioFieldResolvers,
    portfolioQueryResolver, portfolioQueryDef,
    createPortfolioQueryDef, createPortfolioResolver,
    deletePortfolioQueryDef, deletePortfolioResolver,
    updatePortfolioQueryDef, updatePortfolioResolver,
    portfolioListQueryDef, portfolioListResolver};
