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
        };
    }
    initPageInfo();

    //
    // Selected metrics that we need to display
    //

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

    // Initate Blank Canvas Where Historic Price Data will be loaded
    var options = {
        theme: {
            mode: 'light', 
            palette: 'palette1', 
            monochrome: {
                enabled: false,
                color: '#255aee',
                shadeTo: 'light',
                shadeIntensity: 0.65
            },
        },
        series: [],
        noData: {
            text: 'No Stocks Selected'
          },
        chart: {
        type: 'area',
        stacked: false,
        height: 350,
        zoom: {
          type: 'x',
          enabled: true,
          autoScaleYaxis: true
        },
        toolbar: {
          autoSelected: 'zoom'
        }
      },
      dataLabels: {
        enabled: false
      },
      markers: {
        size: 0,
      },
      title: {
        text: 'Stock Price Movement',
        align: 'left',
        style: {
            fontSize:  '20px',
            fontWeight:  'bold',
            fontFamily:  'Roboto, Helvetica, Arial, sans-serif',
            color:  '#fff'
          }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.5,
          opacityTo: 0,
          stops: [0, 90, 100]
        },
      },
      yaxis: {
        labels: {
            style: {
                colors: '#fff',
                fontSize: '12px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 400,
                cssClass: 'apexcharts-yaxis-label',
            },  
          formatter: function (val) {
            return (val);
          }
          
        },
        title: {
          text: 'Price',
          style: {
            color: '#fff',
            fontSize: '12px',
            fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
            fontWeight: 600,
            cssClass: 'apexcharts-yaxis-title',
        },
        },
      },
      xaxis: {
        type: 'datetime',
      },
      tooltip: {
        shared: false,
        y: {
          formatter: function (val) {
            return (val);
          }
        }
      }
    };
    var chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();

    // Sets Up the Add Stock Bar at top of page
    $("#singleSearch").select2({
        placeholder: 'Select A Stock',
        theme: "flat",
        allowClear: true,
        minimumInputLength: 1,
        ajax: {
            delay: 250,
            url:'https://financialmodelingprep.com/api/v3/search',
            data: function(params){
                var Q = {query: params.term};
                return Q;
            },
            processResults: function (ajaxData){
                let data = $.map(ajaxData, function (obj,index){
                    obj.id = obj.id || index + 1;
                    obj.text = obj.text || obj.symbol; // replace name with the property used for the text
                    return obj;
                });
                return {results: data};
            },
            cache: true
        }
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
            <td class="tm-product-name">${name}</td>
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

          let ser = chart.w.globals.initialSeries.filter(obj => (obj.name != symbol) );
          if (ser.length > 0){
            ser = ser.map(obj => {
                let rObj ={};
              rObj.name=obj.name;
              rObj.data = obj.data;
              return rObj;
            });
            chart.updateSeries(ser);
          }
          else chart.updateSeries();
          
          // delete the stock from list of displayed stocks
          deleteStockFromDisplayList(symbol);
        });

        // Retrive time sereies for added stock and add to plot
        var url = "https://financialmodelingprep.com/api/v3/historical-price-full/" + symbol +"?serietype=line";
        $.getJSON(url, function(response) {
          let data = response.historical.map(obj =>{
              let rObj = {};
              rObj.x = obj.date;
              rObj.y = obj.close;
              return rObj;
          });
          if (chart.w.globals.initialSeries.length == 0 || chart.w.globals.initialSeries[0].data.length == 0){
            chart.updateSeries([{name: symbol,data: data}]);
          }
          else{
            chart.appendSeries({
                name: symbol,
                data: data
            });
          }  
        });
        // Add Selected Comaney to FS select companey bar
        let opt = new Option(name,symbol,false,true);
        $('#companeySelect').append(opt).trigger('change').trigger(
          {type: 'select2:select',
          params: {
             data: {name: name,id:symbol}
        }});
        // Clear Stock Select Bar
        $("#singleSearch").val(null).trigger("change");
    });

    // This is called when companey is selected: Use to call function to populate FS
    $('#companeySelect').on('select2:select', function (e) {
        
        let sym = e.params.data.id;
        metricsTableChangeCurrStock(sym);
        addStockToDisplayList(sym);
        
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
            let infoByYear = getInfoByYear(respObj);
            let table = document.querySelector('#metrics_table_tbody');
            // populate table
            table.innerHTML = '';
            for (let idx in metrics) {
                let m = metrics[idx];
                let tr = document.createElement('tr');
                tr.innerHTML = `<th scope="row"><b>${m}</b></th>`;
                for (let idx1 in years) {
                    let year = years[idx1];
                    let info = infoByYear[year][m];
                    info = parseFloat(info);
                    info = info.toFixed(2);
                    if (idx1 == 0) info = `<b>${info}</b>`;
                    tr.innerHTML += `<td>${info}</td>`;
                }
                table.appendChild(tr);
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
        api.notifyStockDisplayListeners();
    }

    // refresh when index.js file is loaded
    reloadPageContent();

})();
