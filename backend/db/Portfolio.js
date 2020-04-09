const mongoose = require('mongoose');

/*
purchaseTime is timestamp in seconds;
To create: let d = '' + Math.floor(Date.now()/1000);
To parse: let s = new Date(parseInt(d)*1000)
*/
let PortfolioSchema = new mongoose.Schema(
  {uid: String,
    name: String,
    stock_list:  [{symbol: String,
                  shares: Number,
                  purchasePrice: Number,
                  purchaseTime: String}],
    purchaseValue: Number,
    createdAt:Date
  }
);
let Portfolio = mongoose.model('Portfolio', PortfolioSchema);

module.exports = {Portfolio};
