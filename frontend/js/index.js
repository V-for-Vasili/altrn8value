/*jshint esversion: 6 */
window.onload = (function(){
    "use strict";

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
        align: 'left'
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
          formatter: function (val) {
            return (val);
          },
        },
        title: {
          text: 'Price'
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
        ajax: {
            url:'https://financialmodelingprep.com/api/v3/search?query=AA&limit=10',
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
      console.log("single search e:",e);
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
        tr.querySelector('i').addEventListener('click',function(e){
          tr.parentElement.removeChild(tr);
          let ser = chart.w.globals.initialSeries.filter(obj => (obj.name != symbol || obj.name == null) );
          console.log("After Del sereis is",ser);
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
          console.log("delete Sereies");
          console.log(chart);

        });
        var url = "https://financialmodelingprep.com/api/v3/historical-price-full/" + symbol +"?serietype=line";
        $.getJSON(url, function(response) {
            let data = response.historical.map(obj =>{
                let rObj = {};
                rObj.x = obj.date;
                rObj.y = obj.close;
                return rObj;
            });
            if (chart.w.globals.initialSeries.length == 0){
              chart.updateSeries([{name: symbol,data: data}]);
            }
            else{
              chart.appendSeries({
                  name: name,
                  data: data
              });
            }
            console.log("Add Sereies");
            console.log(chart);
        });
        let opt = new Option(name,symbol,false,false);
        $('#companeySelect').append(opt).trigger('change');
        $("#singleSearch").val(null).trigger("change");
    });
    //////////////////////////////////////////////////////////////////////
    // This is called when companey is selected:
    $('#companeySelect').on('select2:select', function (e) {
      console.log("selected");
      let symbol = e.params.id;
      let name = e. params.text;
    });
    ////////////////////////////////////////////////////////////////////////
    // add error listeners to show error messages to the user
    api.onError(function(err) {
        console.log(err);
    });

    function showMetricsTable() {
        document.querySelector('#metrics_table_div').style.display = 'block';
        document.querySelector('#metrics_table_div').style.visibility = 'visible';
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

    showMetricsTable();
    //metricsTableShowIncomeStatements('TSLA');
    //metricsTableShowBalanceSheetInfo('TSLA');
    //metricsTableShowCashFlowStatements('TSLA');

})();
