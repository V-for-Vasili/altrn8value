
const Memcached = require('memcached');
let memcached = new Memcached('localhost:11211');

// Test connection
console.log('memcached trying to connect');
memcached.connect('localhost:11211', function(err, conn) {
    if(err) return console.log('error from memcached: ', err);
    console.log('memcached running.');
});

/*
Memcached key should be of the form:    ${type}_${perior}_${symbol}
type is one of:     balanceSheet, cashFlow, companyProfile, incomeStatement etc.
period is one of:   year, quarter
symbol uniquely identifies company (ex: TSLA)
*/
module.exports = {memcached}
