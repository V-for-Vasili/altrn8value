// Imports
const axios = require('axios');


let stockListQueryDef = `stock_list: String`

let stockListResolver = async (_, {symbol}) => {
    return 'qwe1234';
}

module.exports = {stockListQueryDef, stockListResolver};
