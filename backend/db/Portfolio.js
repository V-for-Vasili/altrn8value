const mongoose = require('mongoose');

let PortfolioSchema = new mongoose.Schema({
  uid: String,
  name: String,
  stock_list:  [{symbol: String, amount: Number}]
});
let Portfolio = mongoose.model('Portfolio', PortfolioSchema);

module.exports = {Portfolio};
