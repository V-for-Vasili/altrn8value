// Imports
const { makeExecutableSchema } = require('graphql-tools');
const {stockTypeDef, stockQueryDef, stockFieldTypeDef, stockResolver, stockFieldResolvers} = require('./models/stock.js')
const {portfolioTypeDef, portfolioQueryResolver, portfolioFieldtResolvers, portfolioQueryDef, createPortfolioResolver, createPortfolioTypeDef,
  deletePortfolioTypeDef, deletePortfolioResolver, updatePortfolioTypeDef, updatePortfolioResolver} = require('./models/user.js')

const typeDefs = `
  ${stockFieldTypeDef}
  ${stockTypeDef}
  ${portfolioTypeDef}

  type Query {
    ${stockQueryDef}
    ${portfolioQueryDef}
  }

  type Mutation {
    ${createPortfolioTypeDef}
  }
`

const resolvers = {
  Query: {
    stock: stockResolver,
    portfolio: portfolioQueryResolver
  },
  Mutation: {
    createPortfolio: createPortfolioResolver
  },
  Stock: stockFieldResolvers,
  Portfolio: portfolioFieldtResolvers
}

let schema = makeExecutableSchema({typeDefs, resolvers});

module.exports = {schema};
