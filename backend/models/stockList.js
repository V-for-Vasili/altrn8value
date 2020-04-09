// Imports
const axios = require('axios');


let stockDescriptionTypeDef = `
type StockDescription {
    symbol: String
    name: String
    currency: String
    stockExchange: String
    exchangeShortName: String
}`;

let stockListQueryDef = `stockList(searchStr: String!): [StockDescription]`;

let stockListResolver = async (_, {searchStr}) => {
    let response = {};
    try {
        response = await axios.get(`https://financialmodelingprep.com/api/v3/search?query=${searchStr}&limit=100`);
        response = response.data;
    } catch (err) {
        console.log(err);
    }
    if(!response) {
        console.log('Empty response from stockListResolver.');
        return null;
    } else {
        return response;
    }
};

module.exports = {stockDescriptionTypeDef, stockListQueryDef, stockListResolver};
