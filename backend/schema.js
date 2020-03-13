// Imports
const { makeExecutableSchema } = require('graphql-tools');
const {stockTypeDef, stockQueryDef, stockFieldTypeDef, stockResolver, stockFieldResolvers} = require('./models/stock.js')

const typeDefs = `
  ${stockFieldTypeDef}
  ${stockTypeDef}

  type Query {
    ${stockQueryDef}
  }`

const resolvers = {
  Query: {
    stock: stockResolver
  },
  Stock: stockFieldResolvers
}

let schema = makeExecutableSchema({typeDefs, resolvers});

module.exports = {schema};
