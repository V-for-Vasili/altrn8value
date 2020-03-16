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


var stock_resolver = async (_, {symbol}) => {

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

var stock_field_resolvers = {

}

module.exports = schema, root;
