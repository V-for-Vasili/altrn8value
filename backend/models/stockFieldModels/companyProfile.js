// Imports
const axios = require('axios');


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

let companyProfileResolver  =async (obj, args, context, info) => {
    let response = {};
    try {
        response = await axios.get(`https://financialmodelingprep.com/api/v3/company/profile/${obj.symbol}`);
        response = response.data.profile;
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
