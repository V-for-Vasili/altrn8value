/*jshint esversion: 6 */
window.onload = (function(){
    "use strict";

    //
    // PAGE_INFO is informaton about what we are displaying on the page
    //

    // No need for local storage because we start with blank page every time we
    // refresh.
    let PAGE_INFO = null;
    function initPageInfo() {
        PAGE_INFO = {
            stockDisplayList: [],           // list of stocks that are displayed;

            metricTableCurrStock: null,     // stock currenttly displayed in metric table

            metricTableCurrTab: 0,          // tab currenttly displayed in metric table
                                            // 0,1,2 = IS, BS, CF respectively

            series: []                      // Contains Time sereies data for stock in stockDisplayList
        };
    }
    initPageInfo();

    // Initate Blank Canvas Where Historic Price Data will be loaded
    let chart = echarts.init(document.getElementById('chart'),'template', {
        width: document.getElementById('chart').offsetWidth,
        height: document.getElementById('chart').offsetHeight
    });

    function initGraphCanvas(chart,stocks,series){
        let option;
        if (stocks.length == 0){
           option = {
                title: {
                    show: true,
                    textStyle:{
                      fontSize:20
                    },
                    text: "No Stocks Selected",
                    left:'center',
                    top: 'center'
                  },
                series: []
            };
        } else {
            option = {
                title: {
                    text: "Historic Price",
                    textStyle:{fontFamily:'Roboto, Helvetica'}, 
                    top: '5%',
                    left: '5%'
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: stocks,
                    top:'10%'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '12%',
                    containLabel: true
                },
                toolbox: {
                    feature: {
                        dataZoom: {yAxisIndex: 'none'},
                        restore: {},
                        //saveAsImage: {}
                    }
                },
                xAxis: {
                    type: 'time',
                    boundaryGap: false,
                },
                yAxis: {
                    type: 'value',
                    boundaryGap: [0, '100%']
                },
                dataZoom: [{
                    type: 'inside',
                    start: 0,
                    end: 10
                }, {
                    start: 0,
                    end: 10,
                    dataBackground:{
                        lineStyle:{color:'#fff',shadowColor:'#fff'},
                        areaStyle:{color: '#rgb(245, 166, 35)',opacity:1}
                    },
                    fillerColor:'rgb(245, 166, 35,.25)',
                    handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    handleSize: '80%',
                    handleStyle: {
                        color: '#fff',
                        shadowBlur: 3,
                        shadowColor: 'rgba(0, 0, 0, 0.6)',
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    }
                }],
                series:series
            };
        }
        chart.setOption(option,true);
    }

    initGraphCanvas(chart,PAGE_INFO.stockDisplayList,PAGE_INFO.series);

    //
    // Selected metrics that we need to display
    //

    // https://stackoverflow.com/questions/149055/how-to-format-numbers-as-currency-string
    function formatNumeric(amount,prefix,decimalCount,decimal,thousands) {
        try {
            decimalCount = Math.abs(decimalCount);
            decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

            const negativeSign = amount < 0 ? "-" : "";

            let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
            let j = (i.length > 3) ? i.length % 3 : 0;

            return negativeSign + prefix + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
        } catch (e) {
            api.notifyErrorListeners(e);
        }
    }

    // years for which we show financial statements
    let years = ['2019', '2018', '2017', '2016', '2015', '2014'];
    let incomeStatementMetrics = [
        'Revenue',
        'Revenue Growth',
        'Cost of Revenue',
        'Gross Profit',
        'R&D Expenses',
        'SG&A Expense',
        'Operating Expenses',
        'Operating Income',
        'Interest Expense',
        'Earnings before Tax',
        'Income Tax Expense',
        'Net Income - Non-Controlling int',
        'Net Income - Discontinued ops',
        'Net Income',
        'Preferred Dividends',
        'Net Income Com',
        'EPS',
        'EPS Diluted',
        'Weighted Average Shs Out',
        'Weighted Average Shs Out (Dil)',
        'Dividend per Share',
        'Gross Margin',
        'EBITDA Margin',
        'EBIT Margin',
        'Profit Margin',
        'Free Cash Flow margin',
        'EBITDA',
        'EBIT',
        'Consolidated Income',
        'Earnings Before Tax Margin',
        'Net Profit Margin'
    ];
    let balanceSheetMetrics = [
        "Cash and cash equivalents",
        "Short-term investments",
        "Cash and short-term investments",
        "Receivables",
        "Inventories",
        "Total current assets",
        "Property, Plant & Equipment Net",
        "Goodwill and Intangible Assets",
        "Long-term investments",
        "Tax assets",
        "Total non-current assets",
        "Total assets",
        "Payables",
        "Short-term debt",
        "Total current liabilities",
        "Long-term debt",
        "Total debt",
        "Deferred revenue",
        "Tax Liabilities",
        "Deposit Liabilities",
        "Total non-current liabilities",
        "Total liabilities",
        "Other comprehensive income",
        "Retained earnings (deficit)",
        "Total shareholders equity",
        "Investments",
        "Net Debt",
        "Other Assets",
        "Other Liabilities"
    ];
    let getCashFlowStmtMetrics = [
        "Depreciation & Amortization",
        "Stock-based compensation",
        "Operating Cash Flow",
        "Capital Expenditure",
        "Acquisitions and disposals",
        "Investment purchases and sales",
        "Investing Cash flow",
        "Issuance (repayment) of debt",
        "Issuance (buybacks) of shares",
        "Dividend payments",
        "Financing Cash Flow",
        "Effect of forex changes on cash",
        "Net cash flow / Change in cash",
        "Free Cash Flow",
        "Net Cash/Marketcap"
    ];

    function formatState (state) {
        if (!state.id) {
          return state.text;
        }
        let baseUrl = "https://financialmodelingprep.com/stocks/" + state.text.toLowerCase();
        //<img src="' + baseUrl +'.png" class="search-icon" /> 
        let $state = $('<span>' + state.text + ' | '+ state.name + '</span>');
        return $state;
    }

    // Sets Up the Add Stock Bar at top of page
    $("#singleSearch").select2({
        placeholder: 'Select A Stock',
        theme: "flat",
        allowClear: true,
        minimumInputLength: 2,
        ajax: {
            delay: 250,
            url:'https://financialmodelingprep.com/api/v3/search',
            data: function(params){
                let Q = {query: params.term};
                return Q;
            },
            processResults: function (ajaxData){
                let data = $.map(ajaxData, function (obj,index){
                    obj.id = obj.id || index + 1;
                    obj.text = obj.text || obj.symbol; // replace name with the property used for the text
                    obj.name = obj.name;
                    return obj;
                });
                return {results: data};
            },
            cache: true
        },
        templateResult: formatState,
        templateSelection: formatState

    });
    $("#companeySelect").select2({
      placeholder: 'Select A Stock',
      theme: "flat",
      allowClear: true,
    });

    // Behavoiour For when a stock is selected from the drop down list
    $("#singleSearch").on('select2:select', function (e) {
        let name = e.params.data.name;
        let symbol = e.params.data.symbol;
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="stockImgContainer"><img class="stockSelectImg" src="https://financialmodelingprep.com/stocks/${symbol.toLowerCase()}.png"/></td>
            <td class="tm-product-name"> ${symbol} | ${name}</td>
            <td class="text-center">
                <a class="tm-product-delete-link">
                    <i class="far fa-trash-alt tm-product-delete-icon"></i>
                </a>
            </td>`;
        $('#StockSelections').prepend(tr);

        // Behaviour For When Stock is removed from selections
        tr.querySelector('i').addEventListener('click',function(e){
          tr.parentElement.removeChild(tr);
          $('#companeySelect').find("option[value='"+symbol+"']").remove();
          //$('#companeySelect').trigger('change');

          PAGE_INFO.series = PAGE_INFO.series.filter(obj => (obj.name != symbol) );
          console.log(PAGE_INFO.series);
          deleteStockFromDisplayList(symbol);
          if (PAGE_INFO.series.length == 0) chart.clear();
          initGraphCanvas(chart,PAGE_INFO.stockDisplayList,PAGE_INFO.series);  
          if ($("#StockSelections").children("tr").length == 0){
            $("#savePorfolio").hide();
        }
          // delete the stock from list of displayed stocks
          
        });

        // Retrive time sereies for added stock and add to plot
        let url = "https://financialmodelingprep.com/api/v3/historical-price-full/" + symbol +"?serietype=line";
        $.getJSON(url, function(response) {
          let data = response.historical.map(obj =>{
              let rObj = [obj.date,obj.close];
              return rObj;  
          });
          let series = {name:symbol,type:'line',area:{},data:data};
          addStockToDisplayList(symbol);
          PAGE_INFO.series.push(series);
          initGraphCanvas(chart,PAGE_INFO.stockDisplayList,PAGE_INFO.series);
        });
        // Add Selected Comaney to FS select companey bar
        let opt = new Option(name,symbol,false,true);
        $('#companeySelect').append(opt).trigger('change').trigger(
          {type: 'select2:select',
          params: {
             data: {name: name,id:symbol}
        }});

        if ($("#StockSelections").children("tr").length > 0){
            $("#savePorfolio").show();
        }
        
        // Clear Stock Select Bar
        $("#singleSearch").val(null).trigger("change");
    });

    // This is called when companey is selected: Use to call function to populate FS
    $('#companeySelect').on('select2:select', function (e) {
        let sym = e.params.data.id;
        metricsTableChangeCurrStock(sym);
    });

    function addStockToDisplayList(symbol) {
        if (PAGE_INFO.stockDisplayList.includes(symbol)) return;
        PAGE_INFO.stockDisplayList.push(symbol);
        if (!PAGE_INFO.metricTableCurrStock) PAGE_INFO.metricTableCurrStock = symbol;
        reloadPageContent();
    }

    function deleteStockFromDisplayList(symbol) {
        // remove symbol from list of stocks
        let index = PAGE_INFO.stockDisplayList.indexOf(symbol);
        if (index == -1)
            return api.notifyErrorListeners(`Cannot deleteStockFromDisplayList - ${symbol} is not in the list.`);
        PAGE_INFO.stockDisplayList.splice(index, 1);
        // if list is empty, reset PAGE_INFO
        if (PAGE_INFO.stockDisplayList == 0) {
            // hide metric table, reset PAGE_INFO to default value
            hideMetricsTable();
            initPageInfo();
        } else {
            if (PAGE_INFO.metricTableCurrStock &&
                PAGE_INFO.metricTableCurrStock.localeCompare(symbol) == 0)
                PAGE_INFO.metricTableCurrStock = PAGE_INFO.stockDisplayList[0];
        }
        reloadPageContent();
    }

    // generates columns for metrics table
    function generateMetricTableColumns() {
        let content = '';
        for (let year of years) {
            content += `<th scope="col">${year}</th>`;
        }
        return content;
    }

    // Show metric table thead
    document.querySelector('#metrics_table_thead').innerHTML = `
        <tr>
            <th scope="col">Metric:</th>
            ${generateMetricTableColumns()}
        </tr>
    `;

    // add error listeners to show error messages to the user
    api.onError(function(err) {
        console.log(err);
    });

    api.onError(function(err) {
        // make the error box visible and show the message
        document.querySelector('#errMessage').innerHTML = err;
        document.querySelector('#errBox').style.display = 'block';
    });

    // add event listener to handle login or logout as appropriate
    api.onLogin(function() {
        let authBtn = document.querySelector('#authBtn');
        if (api.isLoggedIn()) {
            authBtn.innerHTML = `${api.getUsername()}, <b>Logout</b>`;
            // set action to log out
            authBtn.onclick = function() {
                api.signOut();
            };
        } else {
            authBtn.innerHTML = `<b>Sign In or Sign Up</b>`;
            // set action to log in
            authBtn.onclick = function() {
                window.location.href = '/login.html';
            };
        }
    });

    // add event listener to show or hide tabs depending on whether user is
    // signed in or not
    api.onLogin(function() {
        let myPortfoliosTab = document.querySelector('#navbarDropdown_portfolios');
        let settingsTab = document.querySelector('#navbarDropdown_settings');
        if (api.isLoggedIn()) {
            myPortfoliosTab.style.display = '';
            settingsTab.style.style = '';
        } else {
            myPortfoliosTab.style.display = 'none';
            settingsTab.style.display = 'none';
        }
    });

    function showMetricsTable() {
        document.querySelector('#metrics_table_div').style.display = 'block';
        document.querySelector('#metrics_table_div').style.visibility = 'visible';
    }

    function hideMetricsTable() {
        document.querySelector('#metrics_table_div').style.display = 'none';
        document.querySelector('#metrics_table_div').style.visibility = 'hidden';
    }

    function getInfoByYear(respObj) {
        let infoByYear = {};
        respObj.financials.forEach(function(item) {
            let year = item.date.split('-', 1)[0];
            infoByYear[year] = item;
        });
        // if info for some year is not present, substitute it with empty object
        for (let year of years) {
            if (!infoByYear[year]) infoByYear[year] = {};
        }
        return infoByYear;
    }

    // calls appropriate api function, populates metrics table with information
    function populateMetricsTable(apiFunction, companyName, metrics, title) {
        // set title
        document.querySelector('#metrics_table_title').innerHTML = title;
        // get info statements from api
        apiFunction(companyName, false, function(code, err, respObj) {
            if (code !== 200) return api.notifyErrorListeners(err);
            let table = document.querySelector('#metrics_table_tbody');
            // populate table
            table.innerHTML = '';
            if (api.is_empty_object(respObj)) {
                table.innerHTML = '<th scope="row"><b>No Data.</b></th>';
                // notify user of error
                api.notifyErrorListeners('Error: Empty respObj for company ' + companyName);
            } else {
                let infoByYear = getInfoByYear(respObj);
                for (let idx in metrics) {
                    let m = metrics[idx];
                    let tr = document.createElement('tr');
                    tr.innerHTML = `<th scope="row">${m}</th>`;
                    for (let idx1 in years) {
                        let year = years[idx1];
                        let info = infoByYear[year][m];
                        info = formatNumeric(info,'',2,'.',',');
                        if (idx1 == 0) info = `${info}`;
                        tr.innerHTML += `<td>${info}</td>`;
                    }
                    table.appendChild(tr);
                }
            }
            showMetricsTable();
        });
    }

    // Functions to populate metrics table
    function metricsTableShowIncomeStatements(companyName) {
        populateMetricsTable(api.getIncomeStatement, companyName, incomeStatementMetrics, "Income Statement");
    }

    function metricsTableShowBalanceSheetInfo(companyName) {
        populateMetricsTable(api.getBalanceSheet, companyName, balanceSheetMetrics, "Balance Sheet");
    }

    function metricsTableShowCashFlowStatements(companyName) {
        populateMetricsTable(api.getCashFlowStmt, companyName, getCashFlowStmtMetrics, "Cash Flow Statement");
    }

    function metricsTableChangeCurrStock(symbol) {
        PAGE_INFO.metricTableCurrStock = symbol;
        reloadPageContent();
    }

    // attach events to go between different tabs in metrics table
    document.querySelector('#IS_tab_btn').addEventListener('click', function() {
        PAGE_INFO.metricTableCurrTab = 0;
        reloadPageContent();
    });
    document.querySelector('#BS_tab_btn').addEventListener('click', function() {
        PAGE_INFO.metricTableCurrTab = 1;
        reloadPageContent();
    });
    document.querySelector('#CF_tab_btn').addEventListener('click', function() {
        PAGE_INFO.metricTableCurrTab = 2;
        reloadPageContent();
    });

    // On stock display change, refresh metric table
    api.onStockDisplayChange(function() {
        if (PAGE_INFO.stockDisplayList.length == 0) {
            // no stocks in display list
            initPageInfo();
            // hide metrics table
            hideMetricsTable();
            return;
        }
        let companyName = PAGE_INFO.metricTableCurrStock;
        if (PAGE_INFO.metricTableCurrTab == 0)
            return metricsTableShowIncomeStatements(companyName);
        if (PAGE_INFO.metricTableCurrTab == 1)
            return metricsTableShowBalanceSheetInfo(companyName);
        if (PAGE_INFO.metricTableCurrTab == 2)
            return metricsTableShowCashFlowStatements(companyName);
        api.notifyErrorListeners('PAGE_INFO.metricTableCurrTab contains invalid number.');
    });

    function reloadPageContent() {
        api.notifyLoginListeners();
        api.notifyStockDisplayListeners();
    }

    $('#savePorfolio').on('click',function(e){
        if(api.isLoggedIn()){
            let data = JSON.parse(localStorage.getItem("data"));
            data.newPorfolio = PAGE_INFO.stockDisplayList;
            data.option = 1;
            localStorage.setItem('data',JSON.stringify(data));
            window.location.href = '/addPorfolio.html';
            
        }
    });

    reloadPageContent();

})();
