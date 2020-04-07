/*jshint esversion: 6 */
window.onload = (function () {
    "use strict";

    loadInfo((sessionStorage.getItem("newPorfolio"))? JSON.parse(sessionStorage.getItem("newPorfolio")): []); 
    $("#stockSelect").select2({
        placeholder: 'Select A Stock',
        theme: "flat",
        allowClear: true,
        minimumInputLength: 2,
        ajax: {
            delay: 250,
            url: 'https://financialmodelingprep.com/api/v3/search',
            data: function (params) {
                let Q = { query: params.term };
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
        let url = "https://financialmodelingprep.com/api/v3/quote/" + symbol;
        $.getJSON(url, function (response) {
            let price = response[0].price;
            NP.addStock(name,symbol,price);
            let tr = document.createElement('tr');
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
                let totalCost = NP.getPorofolioCost();
                totalCost = (totalCost == 0)? "-" :  api.formatNumeric(totalCost, "$", 2, ".", ",");
                $("#totalCost").text(totalCost);
            });

            // Behaviour For When Stock is removed from selections
            tr.querySelector('i').addEventListener('click', function (e) {
                tr.parentElement.removeChild(tr);
                NP.updateStock(symbol,0,0);
                NP.removeStock(symbol);
                let totalCost = NP.getPorofolioCost();
                totalCost = (totalCost == 0)? "-" :  api.formatNumeric(totalCost, "$", 2, ".", ",");
                $("#totalCost").text(totalCost);
            });
            // Display Save Button if there is atleast one stock selected
            if ($("#StockSelections").children("tr").length > 0){
                $("#rowTotal").show();
                $("#saveBtn").show();
            } else {
                $("#rowTotal").hide();
                $("#saveBtn").hide();
            }
            // Clear Stock Select Bar
            $("#stockSelect").val(null).trigger("change");
        });
    });

    // Save Button Functionallity
    document.querySelector('#addStockForm').addEventListener("submit",function(e){
        e.preventDefault();
        let name = $("#porfolioName").val();
        NP.porfolio.name = name;
        let porfolios = (localStorage.getItem("Porfolios"))? JSON.parse(localStorage.getItem("Porfolios")) : []; 
        porfolios.push(NP.getPorfolio());
        // TODO:
        //##################################################################
        // Push profolio object into backend storage of users array of porofolios
        localStorage.setItem("Porfolios",JSON.stringify(porfolios));
        //#################################################################
        sessionStorage.setItem("newPorfolio",JSON.stringify([]));
        sessionStorage.removeItem("RS");
        window.location.href = '/myPorfolios.html';
    });

    // Inital Loading of stock selections from current research session
    function loadInfo(symbols){ 
        symbols.forEach(function(symbol){
            let url = "https://financialmodelingprep.com/api/v3/quote/" + symbol;
            $.getJSON(url, function (response) {
                let name = response[0].name;
                let price = response[0].price;
                NP.addStock(name,symbol,price);
                let tr = document.createElement('tr');
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
                    }
                    else {
                        NP.updateStock(symbol,0,0);
                        $("#" + symbol + "Cost").text("-");
                    }
                    let totalCost = NP.getPorofolioCost();
                    totalCost = (totalCost == 0)? "-" :  api.formatNumeric(totalCost, "$", 2, ".", ",");
                    $("#totalCost").text(totalCost);
                });

                // Behaviour For When Stock is removed from selections
                tr.querySelector('i').addEventListener('click', function (e) {
                    tr.parentElement.removeChild(tr);
                    NP.updateStock(symbol,0,0);
                    NP.removeStock(symbol);
                    let totalCost = NP.getPorofolioCost();
                    totalCost = (totalCost == 0)? "-" :  api.formatNumeric(totalCost, "$", 2, ".", ",");
                    $("#totalCost").text(totalCost);
                });
                if ($("#StockSelections").children("tr").length > 0){
                    $("#rowTotal").show();
                    $("#saveBtn").show();
                } else {
                    $("#rowTotal").hide();
                    $("#saveBtn").hide();
                }
                // Clear Stock Select Bar
                $("#stockSelect").val(null).trigger("change");
            });
        });
    }
    // Formats options for select stock bar
    function formatState(state) {
        if (!state.id) {
            return state.text;
        }
        let baseUrl = "https://financialmodelingprep.com/stocks/" + state.text.toLowerCase();
        //<img src="' + baseUrl +'.png" class="search-icon" /> 
        let $state = $('<span>' + state.text + ' | ' + state.name + '</span>');
        return $state;
    }
})();
