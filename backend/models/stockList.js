// Imports
const {retrieveFromCache} = require('../cache.js');


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
        // get data from cache
        let key = `search_${searchStr}`;
        let url = `https://financialmodelingprep.com/api/v3/search?query=${searchStr}&limit=100`;
        response = await retrieveFromCache(key, url, 60);
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
