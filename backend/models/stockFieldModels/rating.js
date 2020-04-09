// Imports
const axios = require('axios');

let ratingTypeDef = `
type Rating {
  score: Int
  rating: String
  recommendation: String
}`;

let ratingResolver = async (obj, args, context, info) => {
    let response = {};
    try {
        response = await axios.get(`https://financialmodelingprep.com/api/v3/company/rating/${obj.symbol}`);
        response = response.data.rating;
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
