var api = (function(){
    "use strict";
    var module = {};

    function do_nothing(code, respText) {}

    // callback format: code, respText
    function send_ajax(data, callback=do_nothing) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            callback(xhr.status, xhr.responseText);
        };
        xhr.open('POST', 'http://localhost:8080/graphql', true);
        if (!data) {
            xhr.send();
        } else{
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    }

    /*
    To test:
    api.getStockData('AAPL', function(code, respText) {
        console.log('---');
        console.log('Server response: ', code);
        console.log(respText);
        console.log('---');
    });
    */
    module.getStockData = function(symbol, callback) {
        let query = '{ stock(symbol:\"' + symbol + '\"){ symbol price } }';
        let data = {query: query};
        send_ajax(data, callback);
    };

    return module;
})();
