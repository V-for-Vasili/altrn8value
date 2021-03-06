// Imports
const { makeExecutableSchema } = require('graphql-tools');
const {portfolioTypeDef, portfolioQueryResolver,
    portfolioFieldResolvers, portfolioQueryDef,
    createPortfolioQueryDef, createPortfolioResolver,
    deletePortfolioQueryDef, deletePortfolioResolver,
    updatePortfolioQueryDef, updatePortfolioResolver,
    portfolioListQueryDef, portfolioListResolver} = require('./models/portfolio.js');
const {stockTypeDef, stockQueryDef,stocksQueryDef ,stockFieldTypeDef, stockResolver,stocksResolver ,stockFieldResolvers} = require('./models/stock.js');
const {stockDescriptionTypeDef, stockListQueryDef, stockListResolver} = require('./models/stockList.js');

const typeDefs = `
  ${stockFieldTypeDef}
  ${stockDescriptionTypeDef}
  ${stockTypeDef}
  ${portfolioTypeDef}

  type Query {
    ${stockListQueryDef}
    ${stockQueryDef}
    ${stocksQueryDef}
    ${portfolioListQueryDef}
    ${portfolioQueryDef}
  }

  type Mutation {
    ${createPortfolioQueryDef}
    ${deletePortfolioQueryDef}
    ${updatePortfolioQueryDef}
  }`;

const resolvers = {
  Query: {
    stockList: stockListResolver,
    stock: stockResolver,
    stocks: stocksResolver,
    portfolioList: portfolioListResolver,
    portfolio: portfolioQueryResolver,
  },
  Mutation: {
    createPortfolio: createPortfolioResolver,
    deletePortfolio: deletePortfolioResolver,
    updatePortfolio: updatePortfolioResolver,
  },
  Stock: stockFieldResolvers,
  Portfolio: portfolioFieldResolvers
};

let schema = makeExecutableSchema({typeDefs, resolvers});


module.exports = {schema};
