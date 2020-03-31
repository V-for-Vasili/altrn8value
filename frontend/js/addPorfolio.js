/*jshint esversion: 6 */
window.onload = (function () {
    "use strict";

    let NEW_PORFOLIO = null;

    function initPorfolio(){
        NEW_PORFOLIO = {
            stocks:[],
            cost:0,
            created: new Date()
        };
    }
    initPorfolio();

    let data = JSON.parse(localStorage.getItem("data"));
    if (data.option == 1){
        loadInfo(data.newPorfolio);
    }

    function addStock(name,symbol,price){
        let stockObj = {name:name,symbol:symbol,purchasePrice:price,shares:0,cost:0};
        NEW_PORFOLIO.stocks.push(stockObj);

    }

    function removeStock(symbol){
        NEW_PORFOLIO.stocks = NEW_PORFOLIO.stocks.filter(stockObj => stockObj.symbol == symbol);
    }

    function updateStock(symbol,newShares,newCost){
        let idx = NEW_PORFOLIO.stocks.findIndex(stockObj => stockObj.symbol == symbol);
        let oldCost = NEW_PORFOLIO.stocks[idx].cost;
        NEW_PORFOLIO.stocks[idx].shares = newShares;
        NEW_PORFOLIO.stocks[idx].cost = newCost;
        UpdatePorfolioCost(newCost - oldCost);
    }

    function UpdatePorfolioCost(amount){
        NEW_PORFOLIO.cost += amount;
    }

    function getPorofolioCost(){
        return NEW_PORFOLIO.cost;
    }

    function loadInfo(symbols){
        symbols.forEach(function(symbol){
            let url = "https://financialmodelingprep.com/api/v3/quote/" + symbol;
        $.getJSON(url, function (response) {
            let name = response[0].name;
            let price = response[0].price;
            addStock(name,symbol,price);
            let tr = document.createElement('tr');
            tr.innerHTML = `
          <td class="stockImgContainer"><img class="stockSelectImg" src="https://financialmodelingprep.com/stocks/${symbol.toLowerCase()}.png"/></td>
          <td class="tm-product-name"> ${symbol} | ${name}</td>
          <td id="${symbol + "Price"}">${formatNumeric(price, "$", 2, ".", ",")}</td>
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
                  updateStock(symbol,shares,newCost);
                  let newCostFormatted = formatNumeric(newCost, "$", 2, ".", ",");
                  $("#" + symbol + "Cost").text(newCostFormatted);
              } else {
                  updateStock(symbol,0,0);
                  $("#" + symbol + "Cost").text("-");

              }
              let totalCost = getPorofolioCost();
              totalCost = (totalCost == 0)? "-" :  formatNumeric(totalCost, "$", 2, ".", ",");
              $("#totalCost").text(totalCost);
          });

          // Behaviour For When Stock is removed from selections
          tr.querySelector('i').addEventListener('click', function (e) {
              tr.parentElement.removeChild(tr);
              updateStock(symbol,0,0);
              removeStock(symbol);
              let totalCost = getPorofolioCost();
              totalCost = (totalCost == 0)? "-" :  formatNumeric(totalCost, "$", 2, ".", ",");
              $("#totalCost").text(totalCost);
          });
          // Clear Stock Select Bar
          if ($("#StockSelections").children("tr").length > 0){
              $("#rowTotal").show();
              $("#saveBtn").show();
          } else {
              $("#rowTotal").hide();
              $("#saveBtn").hide();
          }
          $("#stockSelect").val(null).trigger("change");
        });
        });
    }

    function formatState(state) {
        if (!state.id) {
            return state.text;
        }
        let baseUrl = "https://financialmodelingprep.com/stocks/" + state.text.toLowerCase();
        //<img src="' + baseUrl +'.png" class="search-icon" /> 
        let $state = $('<span>' + state.text + ' | ' + state.name + '</span>');
        return $state;
    }

    // https://stackoverflow.com/questions/149055/how-to-format-numbers-as-currency-string
    function formatNumeric(amount, prefix, decimalCount, decimal, thousands) {
        try {
            decimalCount = Math.abs(decimalCount);
            decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

            const negativeSign = amount < 0 ? "-" : "";

            let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
            let j = (i.length > 3) ? i.length % 3 : 0;

            return negativeSign + prefix + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
        } catch (e) {
            console.log(e);
        }
    }
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
            addStock(name,symbol,price);
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="stockImgContainer"><img class="stockSelectImg" src="https://financialmodelingprep.com/stocks/${symbol.toLowerCase()}.png"/></td>
                <td class="tm-product-name"> ${symbol} | ${name}</td>
                <td id="${symbol + "Price"}">${formatNumeric(price, "$", 2, ".", ",")}</td>
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
                    updateStock(symbol,shares,newCost);
                    let newCostFormatted = formatNumeric(newCost, "$", 2, ".", ",");
                    $("#" + symbol + "Cost").text(newCostFormatted);
                } else {
                    updateStock(symbol,0,0);
                    $("#" + symbol + "Cost").text("-");
                }
                let totalCost = getPorofolioCost();
                totalCost = (totalCost == 0)? "-" :  formatNumeric(totalCost, "$", 2, ".", ",");
                $("#totalCost").text(totalCost);
            });

            // Behaviour For When Stock is removed from selections
            tr.querySelector('i').addEventListener('click', function (e) {
                tr.parentElement.removeChild(tr);
                updateStock(symbol,0,0);
                removeStock(symbol);
                let totalCost = getPorofolioCost();
                totalCost = (totalCost == 0)? "-" :  formatNumeric(totalCost, "$", 2, ".", ",");
                $("#totalCost").text(totalCost);
            });
            // Clear Stock Select Bar
            if ($("#StockSelections").children("tr").length > 0){
                $("#rowTotal").show();
                $("#saveBtn").show();
            } else {
                $("#rowTotal").hide();
                $("#saveBtn").hide();
            }
            
            $("#stockSelect").val(null).trigger("change");
        });
    });
   
    document.querySelector('#addStockForm').addEventListener("submit",function(e){
        e.preventDefault();
        let name = $("#porfolioName").val();
        NEW_PORFOLIO.name = name;
        data.porfolios.push(NEW_PORFOLIO);
        data.option = 0;
        localStorage.setItem("data", JSON.stringify(data));
        window.location.href = '/myPorfolios.html';
    });

})();
