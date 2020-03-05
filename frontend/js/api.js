var api = (function(){
    "use strict";
    var module = {};

    //
    // helper functions
    //

    function do_nothing(code, err, respObj) {}

    // callback format: code, err, respObj
    function send_ajax(data, callback) {
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
        xhr.open('POST', '/graphql', true);
        if (!data) {
            xhr.send();
        } else{
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    }

    //
    // api methods
    //

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
        send_ajax(data, callback);
    };

    //
    // Listeners for different events
    //

    let errorListeners = [];

    // notifyErrorListeners, module.onError from lab 6
    function notifyErrorListeners(err){
        errorListeners.forEach(function(listener){
            listener(err);
        });
    }

    module.onError = function(listener){
        errorListeners.push(listener);
    };

    return module;
})();
