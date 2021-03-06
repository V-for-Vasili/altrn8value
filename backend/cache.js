// Imports
const Memcached = require('memcached');
const axios = require('axios');
const fs = require('fs');

// init server at 11211
let memcached = new Memcached('localhost:11211');

// Test connection
console.log('memcached trying to connect');
memcached.connect('localhost:11211', function(err, conn) {
    if (err) return console.log('error from memcached: ', err);
    console.log('memcached running.');
});

// Read api key from file ./API.key
let API_KEY = null;
let reportApiKeyErrorAndExit = function() {
    console.log('\n\nError: Api key not provided. File app_config/API.key must ' +
                'contain the api key from https://financialmodelingprep.com/\n\n');
    process.exit(1);
}

try {
    API_KEY = fs.readFileSync('app_config/API.key', {encoding: 'utf8', flag: 'r'});
} catch (e) {
    reportApiKeyErrorAndExit();
}
if (API_KEY.length === 0) reportApiKeyErrorAndExit();

/*
Memcached key should be of the form:

${type}_${perior}_${symbol}
    type is one of:     balanceSheet, cashFlow, incomeStatement etc.
    period is one of:   year, quarter
    symbol uniquely identifies company (ex: TSLA)

or

search_${searchStr}

or

${type}_${symbol}
    type is one of:     stock, stocks, quote, rating, ratingDetail, companyProfile,
                        historicalPriceFull, historicalPriceFull_line

or

historicalChart_${timeseries}_${symbol}
    timeseries is one of:   5min, 15min, 30min, 1hour
*/

/* Data stored in memcached under "key" is returned; If cache miss, memcache is
   warmed automatically by getting data from "url" and storing it under "key"
   for duration "lifetime" (in seconds). */
let retrieveFromCache = async function(key, url, lifetime) {
    // append api key to url for authentication.
    // if url contains the "?" char, then it already has some params
    if (url.includes('?')) {
        url += `&apikey=${API_KEY}`;
    } else {
        url += `?apikey=${API_KEY}`;
    }
    return new Promise((resolve, reject) => {
        memcached.get(key, function(err, data) {
            if (err) return reject(err);
            if (data) {
                // return data from cache
                console.log(`[ CACHE HIT key=${key} ]`);
                return resolve(data);
            } else {
                console.log(`[ CACHE MISS key=${key} ]`);
                // fetch data from url
                axios.get(url)
                    .then(function(resp) {
                        // process response
                        data = resp.data;
                        // save response into cache
                        memcached.set(key, data, lifetime, function(err) {
                            if (err) console.log('memcached.set error: ', err);
                        });
                        // promise resolved
                        return resolve(data);
                    })
                    .catch(function(err) {
                        // process error
                        return reject(err);
                    });
            }
        });
    });
};

module.exports = {retrieveFromCache};
