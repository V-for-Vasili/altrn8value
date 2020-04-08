const mongoose = require('mongoose');

let PortfolioSchema = new mongoose.Schema(
  {uid: String,
    name: String,
    stock_list:  [{symbol: String, shares: Number, purchasePrice: Number ,purchaseTime: Date}],
    purchaseValue: Number,
    createdAt:Date
  }
);
let Portfolio = mongoose.model('Portfolio', PortfolioSchema);

module.exports = {Portfolio};
