// Imports
const { makeExecutableSchema } = require('graphql-tools');
const {portfolioTypeDef, portfolioQueryResolver, portfolioFieldResolvers, portfolioQueryDef, createPortfolioResolver, createPortfolioTypeDef,
  deletePortfolioTypeDef, deletePortfolioResolver, updatePortfolioTypeDef, updatePortfolioResolver} = require('./models/user.js')
const {stockTypeDef, stockQueryDef, stockFieldTypeDef, stockResolver, stockFieldResolvers} = require('./models/stock.js')
const {stockDescriptionTypeDef, stockListQueryDef, stockListResolver} = require('./models/stockList.js');

const typeDefs = `
  ${stockFieldTypeDef}
  ${stockDescriptionTypeDef}
  ${stockTypeDef}
  ${portfolioTypeDef}

  type Query {
    ${stockListQueryDef}
    ${stockQueryDef}
    ${portfolioQueryDef}
  }

  type Mutation {
    ${createPortfolioTypeDef}
  }
`

const resolvers = {
  Query: {
    stock_list: stockListResolver,
    stock: stockResolver,
    portfolio: portfolioQueryResolver
  },
  Mutation: {
    createPortfolio: createPortfolioResolver
  },
  Stock: stockFieldResolvers,
  Portfolio: portfolioFieldResolvers
}

let schema = makeExecutableSchema({typeDefs, resolvers});

module.exports = {schema};
