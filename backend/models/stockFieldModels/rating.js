// Imports
const {retrieveFromCache} = require('../../cache.js');


let ratingTypeDef = `
type Rating {
  score: Int
  rating: String
  recommendation: String
}`;

let ratingResolver = async (obj, args, context, info) => {
    let response = {};
    try {
        // get information from cache
        let key = `rating_${obj.symbol}`;
        let url = `https://financialmodelingprep.com/api/v3/company/rating/${obj.symbol}`;
        response = await retrieveFromCache(key, url, 60);
        response = response.rating;
    } catch (err) {
        console.log(err);
    }
    if (!response) {
        return null;
    } else {
        return {
            score: response.score,
            rating: response.rating,
            recommendation: response.recommendation,
        };
    }
};

module.exports = {ratingTypeDef, ratingResolver};
