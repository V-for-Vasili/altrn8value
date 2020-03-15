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
        'Net Profit Margin',
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

    // Behavoiour For when a stock is selected from the drop down list
    $("#singleSearch").on('select2:select', function (e) {
        let data = e.params.data;
        let tr = document.createElement('tr');
        tr.innerHTML = `<td class="tm-product-name">${data.name}</td>
        <td class="text-center">
            <a class="tm-product-delete-link">
                <i class="far fa-trash-alt tm-product-delete-icon"></i>
            </a>
        </td>`;
        $('#StockSelections').prepend(tr);
        tr.querySelector('i').addEventListener('click',function(e){
        
           tr.parentElement.removeChild(tr);
           let ser = chart.w.globals.initialSeries.filter(obj => (obj.name != data.symbol || obj.name == null) );
           console.log("ser is ",ser);
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
           
           
        });
        var url = "https://financialmodelingprep.com/api/v3/historical-price-full/" + data.symbol +"?serietype=line";
        $.getJSON(url, function(response) {
            let name = response.symbol;
            let data = response.historical.map(obj =>{
                let rObj = {};
                rObj.x = obj.date;
                rObj.y = obj.close;
                return rObj;
             });
            if (chart.w.globals.initialSeries.length == 0){
                chart.updateSeries([{name: name,data: data}]);
            }
            else{
                chart.appendSeries({
                    name: name,
                    data: data
                });
            }
            
            
        });
        $("#singleSearch").val(null).trigger("change");
    });

    // add error listeners to show error messages to the user
    api.onError(function(err) {
        console.log(err);
    });

    // populates fin statements table
    function load_fin_statements(companyName) {
        // get yearly statements from api
        api.getIncomeStatement(companyName, false, function(code, err, respObj) {
            if (code !== 200) return api.notifyErrorListeners(err);
            let infoByYear = {};
            respObj.financials.forEach(function(item) {
                let year = item.date.split('-', 1)[0];
                infoByYear[year] = item;
            });
            // if info for some year is not present, substitute it with empty object
            for (let year of years) {
                if (!infoByYear[year]) infoByYear[year] = {};
            }
            let table = document.querySelector('#fin_statements_table_tbody');
            // populate table
            table.innerHTML = '';
            for (let idx in incomeStatementMetrics) {
                let m = incomeStatementMetrics[idx];
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
        });
    }

    // populates all page content with data
    function refresh_page_content() {
        load_fin_statements('TSLA');
    }

    // refresh page on load
    refresh_page_content();

})();
