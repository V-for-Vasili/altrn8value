window.onload = (function(){
    "use strict";

    // show welcome message
    let uname = api.getUsername();
    if (uname) document.querySelector('#welcome_uname').innerHTML = `Welcome back, <b>${uname}</b>`;

    FS.init('metrics_table_div','metrics_table_title','metrics_table_thead','metrics_table_tbody');
   
    // Get sessional Storage Data
    let rs = RS.init();
    //  Initalize Echarts Object
    let tsPlot = Graphing.initPlot("chart");
    // Populate tsPlot 
    Graphing.update(tsPlot,rs.stockDisplayList,rs.series);
    populateStockSelections(rs);

    // Formats the options in the dropdown of the select bar
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

    // Setup Select Bar For Financial Statements
    $("#companeySelect").select2({
      placeholder: 'Select A Stock',
      theme: "flat",
      allowClear: true,
    });

    // Behavoiour For when a stock is selected from the drop down list
    $("#singleSearch").on('select2:select', function (e) {
        let name = e.params.data.name;
        let symbol = e.params.data.symbol;
        if (!rs.stockDisplayList.includes(symbol)){
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="stockImgContainer"><img class="stockSelectImg" src="https://financialmodelingprep.com/stocks/${symbol.toLowerCase()}.png"/></td>
                <td class="tm-product-name"> ${symbol} | ${name}</td>
                <td class="text-center">
                    <a href="#" class="tm-product-delete-link">
                        <i class="far fa-trash-alt tm-product-delete-icon"></i>
                    </a>
                </td>`;
            $('#StockSelections').prepend(tr);

            // Behaviour For When Stock is removed from selections
            tr.querySelector('i').addEventListener('click',function(e){
                tr.parentElement.removeChild(tr);
                $('#companeySelect').find("option[value='"+symbol+"']").remove();
                // remove sereies from plot
                rs = RS.deleteStock(rs,symbol);
                // Update Sessional Storage
                RS.update(rs);
                // Remove Stock From FS 
                reloadPageContent();
                // Clear Graph if no stocks selected
                Graphing.update(tsPlot,rs.stockDisplayList,rs.series);
                //  
                if ($("#StockSelections").children("tr").length == 0){
                    $("#savePortfolio").hide();
                }
            });
            // Check whether all ready selected
            
            // Retrive time sereies for added stock and add to plot
            
                api.getDailyStoclPriceTS(symbol, function(response) {
                let data = response.data.stock.history.map(obj =>{
                    let rObj = [obj.date,obj.close];
                    return rObj;  
                });
                let series = {name:symbol,type:'line',area:{},data:data};
                rs = RS.addStock(rs,symbol,name,series);
                Graphing.update(tsPlot,rs.stockDisplayList,rs.series);
                reloadPageContent();
                
            });
            // Add Selected Comaney to FS select companey bar
            let opt = new Option(name,symbol,false,true);
            $('#companeySelect').append(opt).trigger('change').trigger({
                type: 'select2:select',
                params: {
                    data: {name: name,id:symbol}
                }
            });
            
            // Display Save Portfolio Button of Authorized and Has atleast one selection
            if (api.isLoggedIn()  && $("#StockSelections").children("tr").length > 0){
                $("#savePortfolio").show();
            }
            // Clear Stock Select Bar
            $("#singleSearch").val(null).trigger("change");
            
        }
    });

    FS.initColHeaders();

    // This is called when companey is selected: Use to call function to populate FS
    $('#companeySelect').on('select2:select', function (e) {
        let sym = e.params.data.id;
        rs.metricTableCurrStock = sym;
        RS.update(rs);
        reloadPageContent();
    });

     // On stock display change, refresh metric table
     api.onStockDisplayChange(function() {
        FS.update(rs);
    });
    // attach events to go between different tabs in metrics table
    document.querySelector('#IS_tab_btn').addEventListener('click', function() {
        rs = RS.changeStatement(rs,0);
        reloadPageContent();
    });
    document.querySelector('#BS_tab_btn').addEventListener('click', function() {
        rs = RS.changeStatement(rs,1);
        reloadPageContent();
    });
    document.querySelector('#CF_tab_btn').addEventListener('click', function() {
        rs = RS.changeStatement(rs,2);
        reloadPageContent();
    });

    $('#savePortfolio').on('click',function(e){
        console.log("entered");
        if(api.isLoggedIn()){
            let data = rs.stockDisplayList;
            sessionStorage.setItem('newPortfolio',JSON.stringify(data));
            window.location.href = '/addPortfolio.html';
        }
    });

    function populateStockSelections(rs){
        $('#StockSelections').innerHTML ='';
        rs.stockDisplayList.forEach(function(ele,idx){
            let symbol = ele;
            let name = rs.stockNamesList[idx];
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="stockImgContainer"><img class="stockSelectImg" src="https://financialmodelingprep.com/stocks/${symbol.toLowerCase()}.png"/></td>
                <td class="tm-product-name"> ${symbol} | ${name}</td>
                <td class="text-center">
                    <a class="tm-product-delete-link">
                        <i class="far fa-trash-alt tm-product-delete-icon"></i>
                    </a>
                </td>`;
            let opt = new Option(name,symbol,false,true);
            $('#companeySelect').append(opt);
            // Behaviour For When Stock is removed from selections
            tr.querySelector('i').addEventListener('click',function(e){
                tr.parentElement.removeChild(tr);
                $('#companeySelect').find("option[value='"+symbol+"']").remove();
                // remove sereies from plot
                rs = RS.deleteStock(rs,symbol);
                // Update Sessional Storage
                RS.update(rs);
                // Remove Stock From FS 
                // Clear Graph if no stocks selected
                //if (rs.series.length == 0) chart.clear();
                Graphing.update(tsPlot,rs.stockDisplayList,rs.series);
                //  
                if ($("#StockSelections").children("tr").length == 0){
                    $("#savePortfolio").hide();
                }
            });
            $('#StockSelections').prepend(tr);
        });
        if (api.isLoggedIn()  && $("#StockSelections").children("tr").length > 0){
            $("#savePortfolio").show();
        }
    }

    function reloadPageContent() {
        //api.notifyLoginListeners();
        api.notifyStockDisplayListeners();
    }

    reloadPageContent();

})();
