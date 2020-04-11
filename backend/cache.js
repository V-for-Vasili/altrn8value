// Imports
const Memcached = require('memcached');
const axios = require('axios');

// init server at 11211
let memcached = new Memcached('localhost:11211');

// Test connection
console.log('memcached trying to connect');
memcached.connect('localhost:11211', function(err, conn) {
    if(err) return console.log('error from memcached: ', err);
    console.log('memcached running.');
});

/*
Memcached key should be of the form:
${type}_${perior}_${symbol}
    type is one of:     balanceSheet, cashFlow, companyProfile, incomeStatement etc.
    period is one of:   year, quarter
    symbol uniquely identifies company (ex: TSLA)

or

quote_${symbol}
*/

/* Data stored in memcached under "key" is returned; If cache miss, memcache is
   warmed automatically by getting data from "url" and storing it under "key"
   for duration "lifetime" (in seconds). */
let retrieveFromCache = async function(key, url, lifetime) {
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
                        // cache response
                        memcached.set(key, data, 1000, function(err) {
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

module.exports = {memcached, retrieveFromCache}
