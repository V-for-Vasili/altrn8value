/*jshint sub:true*/
// Imports
const {retrieveFromCache} = require('../../cache.js');


let ratingDetailTypeDef = `
type RatingDetail {
  type: String
  score: Int
  recommendation: String
  exchange: String
}`;

let ratingDetailResolver = async (obj, args, context, info) => {
    let response = {};
    try {
        // get data from cache
        let key = `ratingDetail_${obj.symbol}`;
        let url = `https://financialmodelingprep.com/api/v3/company/rating/${obj.symbol}`;
        response = await retrieveFromCache(key, url, 60);
    } catch (err) {
        console.log(err);
    }
    if(!response) {
        return null;
    } else {
        let ratings = [];
        const pb = response.ratingDetails["P/B"];
        ratings.push({type: "P/B", score: pb.score, recommendation: pb.recommendation});
        const roa = response.ratingDetails["ROA"];
        ratings.push({type: "ROA", score: roa.score, recommendation: roa.recommendation});
        const dcf = response.ratingDetails["DCF"];
        ratings.push({type: "DCF", score: dcf.score, recommendation: dcf.recommendation});
        const pe = response.ratingDetails["P/E"];
        ratings.push({type: "P/E", score: pe.score, recommendation: pe.recommendation});
        const roe = response.ratingDetails["ROE"];
        ratings.push({type: "ROE", score: roe.score, recommendation: roe.recommendation});
        const ed = response.ratingDetails["D/E"];
        ratings.push({type: "D/E", score: ed.score, recommendation: ed.recommendation});
        return ratings;
    }
};

module.exports = {ratingDetailTypeDef, ratingDetailResolver};
