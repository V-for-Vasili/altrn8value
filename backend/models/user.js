const graphql = require('graphql')
const { GraphQLSchema, buildSchema, GraphQLObjectType, GraphQLString } = graphql

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    hello: String
  }
`);

// The root provides a resolver function for each API endpoint
var root = {
  hello: () => {
    return 'Hello world!';
  },
};


module.exports = schema, root;
