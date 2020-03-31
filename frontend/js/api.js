let api = (function(){
    "use strict";
    let module = {};

    //
    // helper functions
    //

    function do_nothing(code, err, respObj) {}

    // Error is any return code >= 400.
    // callback format: code, err, respObj.
    function send_ajax(method, url, data, callback) {
        let xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status < 400) {
                let respObj = JSON.parse(xhr.responseText);
                callback(xhr.status, null, respObj);
            } else {
                let err = `[${xhr.status}]: ${xhr.responseText}`;
                callback(xhr.status, err, null);
                // notify listeners to display error message
                module.notifyErrorListeners(err);
            }
        };
        xhr.open(method, url, true);
        if (!data) {
            xhr.send();
        } else{
            // attach auth token
            xhr.setRequestHeader('token', localStorage.getItem('Token'));
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

    // Passed to signin and signup ajax requests.
    // checks response for validity and saves Username and Token, notifies
    // login listeners.
    function authentication_callback(code, err, respObj) {
        if (code >= 400) return module.notifyErrorListeners(err);
        if (!respObj.token) return module.notifyErrorListeners('Error: no token in respObj');
        if (!respObj.username) return module.notifyErrorListeners('Error: no username in respObj');
        // save token and username to localStorage
        localStorage.setItem('Username', respObj.username);
        localStorage.setItem('Token', respObj.token);
        // notify listeners so changes on the page take place
        module.notifyLoginListeners();
    }

    //
    // authentication
    //

    module.isLoggedIn = function() {
        let Token = localStorage.getItem('Token');
        return Token === Token && Token !== null;
    };

    module.getUsername = function() {
        return localStorage.getItem('Username');;
    }

    // from lab 6
    module.signUp = function(username, password) {
        send_ajax('POST', '/api/signup', {username, password}, authentication_callback);
    }

    // from lab 6
    module.signIn = function(username, password) {
        send_ajax('POST', '/api/signin', {username, password}, authentication_callback);
    }

    module.signOut = function() {
        // destroy username and token
        localStorage.removeItem('Username');
        localStorage.removeItem('Token');
        // notify listeners so changes on the page take place
        module.notifyLoginListeners();
        window.location.href = '/index.html';
    }

    //
    // api methods
    //

    // company profile includes some info about the company and its business
    module.getCompanyProfile = function(symbol, callback=do_nothing) {
        let query = `{
                stock(symbol:\"${symbol}\"){
                    company_profile {
                        beta
                        last_div
                        range
                        company_name
                        industry
                        website
                        description
                        ceo
                        sector
                        image
                    }
                }
            }
        `;
        let data = {query: query};
        seng_graphql_query(data, callback);
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

    let loginListeners = [];
    let stockDisplayListeners = [];
    let errorListeners = [];

    module.notifyLoginListeners = function() {
        loginListeners.forEach(function(listener) {
            listener();
        });
    }

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

    module.onLogin = function(listener) {
        loginListeners.push(listener);
    }

    module.onStockDisplayChange = function(listener) {
        stockDisplayListeners.push(listener);
    };

    // module.onError from lab 6
    module.onError = function(listener) {
        errorListeners.push(listener);
    };

    /////////////////////////////////////////////////////
    // TO BE REPLACED ONCE GRAPHQL IS FINISHED !!!!!!!!!//
    module.initStorage = function(){
        if (!localStorage.getItem("data")) localStorage.setItem("data",JSON.stringify({porfolios:[],pageInfo:null,newPorfolio:null,editPorfolio:null,option:null}));
    };
    
    ////////////////////////////////////////////////////////

    //
    // api helper methods
    //

    // based on accepted answer:
    // https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
    module.is_empty_object = function(obj) {
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    }

    return module;
})();
