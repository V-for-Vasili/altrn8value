// Imports
const {retrieveFromCache} = require('../../cache.js');


let companyProfileTypeDef = `
type CompanyProfile {
    beta: String
    last_div: String
    range: String
    company_name: String
    industry: String
    website: String
    description: String
    ceo: String
    sector: String
    image: String
}`;

let companyProfileResolver = async (obj, args, context, info) => {
    let response = {};
    try {
        // get data from cache
        let key = `companyProfile_${obj.symbol}`;
        let url = `https://financialmodelingprep.com/api/v3/company/profile/${obj.symbol}`;
        response = await retrieveFromCache(key, url, 60);
        response = response.profile;
    } catch (err) {
        console.log(err);
    }
    if (!response) {
        return null;
    } else {
        return {
            beta: response.beta,
            last_div: response.lastDiv,
            range: response.range,
            company_name: response.companyName,
            industry: response.industry,
            website: response.website,
            description: response.description,
            ceo: response.ceo,
            sector: response.sector,
            image: response.image,
        };
    }
};

module.exports = {companyProfileTypeDef, companyProfileResolver};
