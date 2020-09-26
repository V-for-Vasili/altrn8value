window.onload = (function () {
    "use strict";

    /* True iff stock with given symbol exists in NP.portfolio.stock_list */
    function checkIfStockSymbolExists(symbol) {
        let idx = NP.getPortfolio().stock_list.findIndex(obj => symbol.localeCompare(obj.symbol) == 0);
        return idx != -1;
    }

    /* sets up a poll to pull stock quote data every second */
    function Subscription(symbol,callback) {
        this.on = false;
        this.activate = function () {
            this.on = true;
            this.run();
        };
        this.disable = function () {
            this.on = false;
        };
        this.run = function () {
            let self = this;
            let poll = setTimeout(function () {
                api.getStockData(symbol,callback);
                if(self.on) self.run();
                else clearTimeout(poll);
            }, 1000);
        };
    }

    // Check if portfolio is stored in session storage, if so display it
    loadInfo((sessionStorage.getItem("newPortfolio"))? JSON.parse(sessionStorage.getItem("newPortfolio")): []); 

    // attach event to stock search selector
    $("#stockSelect").select2({
        placeholder: 'Select A Stock',
        theme: "flat",
        allowClear: true,
        minimumInputLength: 2,
        ajax: {
            delay: 250,
            url: '/financialmodelingprep_direct_resolver',
            data: function (params) {
                let Q = {
                    key: `stock_search_${params.term}`,
                    url: `https://financialmodelingprep.com/api/v3/search?query=${params.term}`,
                    lifetime: 60,
                };
                return Q;
            },
            processResults: function (ajaxData) {
                let data = $.map(ajaxData, function (obj, index) {
                    obj.id = obj.id || index + 1;
                    obj.text = obj.text || obj.symbol; // replace name with the property used for the text
                    obj.name = obj.name;
                    return obj;
                });
                return { results: data };
            },
            cache: true
        },
        templateResult: formatState,
        templateSelection: formatState
    });

    $("#stockSelect").on('select2:select', function (e) {
        let name = e.params.data.name;
        let symbol = e.params.data.symbol;
        // if stock symbol already exists in the table, do not add it again
        if (checkIfStockSymbolExists(symbol)) return;
        api.getCompanyProfile(symbol, function (response) {
            response = response.data.stock;
            let name = (response.company_profile)?response.company_profile.company_name:"";
            let price = response.price;
            NP.addStock(name,symbol,price);
            let tr = document.createElement('tr');
            // This call to https://financialmodelingprep.com does not need the
            // API key
            tr.innerHTML = `
                <td class="stockImgContainer"><img class="stockSelectImg" src="https://financialmodelingprep.com/stocks/${symbol.toLowerCase()}.png"/></td>
                <td class="tm-product-name"> ${symbol} | ${name}</td>
                <td id="${symbol + "Price"}">${api.formatNumeric(price, "$", 2, ".", ",")}</td>
                <td><input id="${symbol + "Shares"}"name="stock"type="text"class="form-control table-input validate" placeholder="-" required/></td>
                <td id="${symbol + "Cost"}">-</td>
                <td>
                <a href="#" class="tm-product-delete-link">
                    <i class="far fa-trash-alt tm-product-delete-icon"></i>
                </a>
                </td>`;
            $('#StockSelections').prepend(tr);
            let quote = new Subscription(symbol,function(response){
                // if stock with given symbol no longer needs to be
                // monitored, stop the refresh for that symbol
                if (!checkIfStockSymbolExists(symbol)) {
                    self.on = false;
                    return;
                }
                let price = response.data.stock.price;
                $("#" + symbol +"Price").text(api.formatNumeric(price, "$", 2, ".", ","));
                let newCost = NP.updateStockPrice(price,symbol);
                let newCostFormatted = api.formatNumeric(newCost, "$", 2, ".", ",");
                $("#" + symbol + "Cost").text(newCostFormatted);
                let totalCost = NP.getPortfolioCost();
                totalCost = (totalCost == 0)? "-" :  api.formatNumeric(totalCost, "$", 2, ".", ",");
                $("#totalCost").text(totalCost);
            });
            quote.activate();
            $("#" + symbol + "Shares").on("change", function (e) {
                let shares = parseFloat($("#" + symbol + "Shares").val());
                if (!isNaN(shares)) {
                    let newCost = shares * price ;
                    NP.updateStock(symbol,shares,newCost);
                    let newCostFormatted = api.formatNumeric(newCost, "$", 2, ".", ",");
                    $("#" + symbol + "Cost").text(newCostFormatted);
                } else {
                    NP.updateStock(symbol,0,0);
                    $("#" + symbol + "Cost").text("-");
                }
                let totalCost = NP.getPortfolioCost();
                totalCost = (totalCost == 0)? "-" :  api.formatNumeric(totalCost, "$", 2, ".", ",");
                $("#totalCost").text(totalCost);
            });

            // Behaviour for when stock is removed from selections
            tr.querySelector('i').addEventListener('click', function (e) {
                quote.disable();
                tr.parentElement.removeChild(tr);
                NP.updateStock(symbol,0,0);
                NP.removeStock(symbol);
                let totalCost = NP.getPortfolioCost();
                totalCost = (totalCost == 0)? "-" : api.formatNumeric(totalCost, "$", 2, ".", ",");
                $("#totalCost").text(totalCost);
                // if no stocks left, do not display the table
                if ($("#StockSelections").children("tr").length == 0){
                    $("#rowTotal").hide();
                    $("#saveBtn").hide();
                }
            });
            // Display Save Button if there is atleast one stock selected
            if ($("#StockSelections").children("tr").length > 0){
                $("#rowTotal").show();
                $("#saveBtn").show();
            }
            // Clear Stock Select Bar
            $("#stockSelect").val(null).trigger("change");
        });
    });

    // Save Button Functionallity
    document.querySelector('#addStockForm').addEventListener("submit",function(e){
        e.preventDefault();
        let name = $("#portfolioName").val();
        let date = '' + Math.floor(Date.now()/1000);  // timestamp in seconds
        let pObj = NP.submitPortfolio(name, date);
        api.createPortfolio(pObj.name, pObj.stock_list, pObj.purchaseValue, date);
        sessionStorage.setItem("newPortfolio",JSON.stringify([]));
        sessionStorage.removeItem("RS");
        window.location.href = '/myPortfolios.html';
    });

    // Inital Loading of stock selections from current research session
    function loadInfo(symbols) {
        symbols.forEach(function(symbol){
            api.getCompanyProfile(symbol, function (response) {
                response = response.data.stock;
                let name = (response.company_profile)?response.company_profile.company_name:"";
                let price = response.price;
                NP.addStock(name,symbol,price);
                let tr = document.createElement('tr');
                // This call to https://financialmodelingprep.com does not need
                // the API key
                tr.innerHTML = `
                <td class="stockImgContainer"><img class="stockSelectImg" src="https://financialmodelingprep.com/stocks/${symbol.toLowerCase()}.png"/></td>
                <td class="tm-product-name"> ${symbol} | ${name}</td>
                <td id="${symbol + "Price"}">${api.formatNumeric(price, "$", 2, ".", ",")}</td>
                <td><input id="${symbol + "Shares"}"name="stock"type="text"class="form-control table-input validate" placeholder="-" required/></td>
                <td id="${symbol + "Cost"}">-</td>
                <td>
                    <a href="#" class="tm-product-delete-link">
                    <i class="far fa-trash-alt tm-product-delete-icon"></i>
                    </a>
                </td>`;
                $('#StockSelections').prepend(tr);
                $("#" + symbol + "Shares").on("change", function (e) {
                    let shares = $("#" + symbol + "Shares").val();
                    if (!isNaN(shares)) {
                        let newCost = shares * price ;
                        NP.updateStock(symbol,shares,newCost);
                        let newCostFormatted = api.formatNumeric(newCost, "$", 2, ".", ",");
                        $("#" + symbol + "Cost").text(newCostFormatted);
                    } else {
                        NP.updateStock(symbol,0,0);
                        $("#" + symbol + "Cost").text("-");
                    }
                    let totalCost = NP.getPortfolioCost();
                    totalCost = (totalCost == 0)? "-" :  api.formatNumeric(totalCost, "$", 2, ".", ",");
                    $("#totalCost").text(totalCost);
                });
                let quote = new Subscription(symbol,function(response){
                    // if stock with given symbol no longer needs to be
                    // monitored, stop the refresh for that symbol
                    if (!checkIfStockSymbolExists(symbol)) {
                        self.on = false;
                        return;
                    }
                    let price = response.data.stock.price;
                    $("#" + symbol +"Price").text(api.formatNumeric(price, "$", 2, ".", ","));
                    let newCost = NP.updateStockPrice(price,symbol);
                    let newCostFormatted = api.formatNumeric(newCost, "$", 2, ".", ",");
                    $("#" + symbol + "Cost").text(newCostFormatted);
                    let totalCost = NP.getPortfolioCost();
                    totalCost = (totalCost == 0)? "-" :  api.formatNumeric(totalCost, "$", 2, ".", ",");
                    $("#totalCost").text(totalCost);
                });
                quote.activate();

                // Behaviour for when stock is removed from selections
                tr.querySelector('i').addEventListener('click', function (e) {
                    quote.disable();
                    tr.parentElement.removeChild(tr);
                    NP.updateStock(symbol,0,0);
                    NP.removeStock(symbol);
                    let totalCost = NP.getPortfolioCost();
                    totalCost = (totalCost == 0)? "-" : api.formatNumeric(totalCost, "$", 2, ".", ",");
                    $("#totalCost").text(totalCost);
                    // if no stocks left, do not display the table
                    if ($("#StockSelections").children("tr").length == 0){
                        $("#rowTotal").hide();
                        $("#saveBtn").hide();
                    }
                });
                if ($("#StockSelections").children("tr").length > 0){
                    $("#rowTotal").show();
                    $("#saveBtn").show();
                } 
                // Clear Stock Select Bar
                $("#stockSelect").val(null).trigger("change");
            });
        });
    }

    // Formats options for select stock bar
    function formatState(state) {
        if (!state.id) return state.text;
        let $state = $('<span>' + state.text + ' | ' + state.name + '</span>');
        return $state;
    }
})();
