var api = (function(){
    "use strict";
    var module = {};

    //
    // helper functions
    //

    function do_nothing(code, err, respObj) {}

    // callback format: code, err, respObj
    function send_ajax(method, url, data, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status == 200) {
                let respObj = JSON.parse(xhr.responseText);
                callback(xhr.status, null, respObj);
            } else {
                let err = `[${xhr.status}]: ${xhr.responseText}`;
                callback(xhr.status, err, null);
                // notify listeners to display error message
                notifyErrorListeners(err);
            }
        };
        xhr.open(method, url, true);
        if (!data) {
            xhr.send();
        } else{
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    }

    // queries backend
    function seng_graphql_query(data, callback) {
        let method = 'POST';
        let url = '/graphql';
        send_ajax(method, url, data, callback);
    }

    // queries financialmodelingprep.com api directly
    function send_financial_modeling_query(path, callback) {
        let method = 'GET';
        let url = 'https://financialmodelingprep.com/api/v3/' + path;
        send_ajax(method, url, null, callback);
    }

    //
    // api methods
    //

    // queries financialmodelingprep.com;
    // based on https://financialmodelingprep.com/developer/docs/#Company-Financial-Statements
    module.getCompanyProfile = function(symbol, callback=do_nothing) {
        let path = `company/profile/${symbol}`;
        send_financial_modeling_query(path, callback);
    };

    // does not include the following fields:
    // rating, rating_details, company_profile, quote, history
    module.getStockData = function(symbol, callback=do_nothing) {
        let query = `{
            stock(symbol:\"${symbol}\"){
                symbol
                price
                exchange
                market_cap
                change
                changes_percentage
                avg_volume
            }
        }`;
        let data = {query: query};
        seng_graphql_query(data, callback);
    };

    // queries financialmodelingprep.com; Searches NASDAQ only for now
    // based on https://financialmodelingprep.com/developer/docs/#Company-Financial-Statements
    module.queryListOfStocks = function(searchStr, callback=do_nothing) {
        let path = `search?query=${searchStr}&limit=10&exchange=NASDAQ`;
        send_financial_modeling_query(path, callback);
    };

    // queries financialmodelingprep.com;
    // based on https://financialmodelingprep.com/developer/docs/#Company-Financial-Statements
    // if quarter is true, pull quarterly data
    // if quarter is false, pull yearly data
    module.getIncomeStatement = function(symbol, quarter=false, callback=do_nothing) {
        let path = `financials/income-statement/${symbol}`;
        if (quarter) path += '?period=quarter';
        send_financial_modeling_query(path, callback);
    };

    // queries financialmodelingprep.com;
    // based on https://financialmodelingprep.com/developer/docs/#Company-Financial-Statements
    // if quarter is true, pull quarterly data
    // if quarter is false, pull yearly data
    module.getBalanceSheet = function(symbol, quarter=false, callback=do_nothing) {
        let path = `financials/balance-sheet-statement/${symbol}`;
        if (quarter) path += '?period=quarter';
        send_financial_modeling_query(path, callback);
    };

    // queries financialmodelingprep.com;
    // based on https://financialmodelingprep.com/developer/docs/#Company-Financial-Statements
    // if quarter is true, pull quarterly data
    // if quarter is false, pull yearly data
    module.getCashFlowStmt = function(symbol, quarter=false, callback=do_nothing) {
        let path = `financials/cash-flow-statement/${symbol}`;
        if (quarter) path += '?period=quarter';
        send_financial_modeling_query(path, callback);
    };

    //
    // Listeners for different events
    //

    let stockDisplayListeners = [];
    let errorListeners = [];

    module.notifyStockDisplayListeners = function() {
        stockDisplayListeners.forEach(function(listener) {
            listener();
        });
    }

    // notifyErrorListeners from lab 6
    module.notifyErrorListeners  = function(err) {
        errorListeners.forEach(function(listener) {
            listener(err);
        });
    }

    module.onStockDisplayChange = function(listener) {
        stockDisplayListeners.push(listener);
    };

    // module.onError from lab 6
    module.onError = function(listener) {
        errorListeners.push(listener);
    };

    return module;
})();
