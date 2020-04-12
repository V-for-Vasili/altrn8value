window.addEventListener('load', function(){
    "use strict";

    function populatePortfolioTable(portfolios) {
        let table = $('#portfolioList');
        // Display stats about each portfolio as a separate table row
        portfolios.forEach(function(portfolio){
            let totalPurchasePrice = portfolio.purchaseValue;
            let created = new Date(parseInt(portfolio.createdAt)*1000).toLocaleString("en-US");
            // calculate totalCurrentPrice, change;
            let totalCurrentPrice = 0.0;
            portfolio.stock_list.forEach(function(stockPurchase) {
                let pricePerShare = stockPurchase.stock.price;
                let shares = stockPurchase.shares;
                totalCurrentPrice = totalCurrentPrice + (pricePerShare * shares);
            });
            let change = ((totalCurrentPrice / totalPurchasePrice) - 1.0) * 100;
            // Fields in order:
            // Name, Original Cost, Curent Value, Profit Percentage
            let tr = document.createElement('tr');
            tr.innerHTML = `
              <th scope="row" class="checkCell"><input type="checkbox" /></th>
              <td class="tm-product-name">${portfolio.name}</td>
              <td>${'$ ' + totalCurrentPrice.toFixed(2)}</td>
              <td>${'$ ' + totalPurchasePrice.toFixed(2)}</td>
              <td>${change.toFixed(2)} %</td>
              <td>${created}</td>
              <td>
                <a href="#" class="tm-product-delete-link">
                  <i class="far fa-trash-alt tm-product-delete-icon"></i>
                </a>
              </td>`;

            // attach event listener to "delete portfolio btn"
            tr.querySelector('i').addEventListener('click',function(e){
                // delete this portfolio
                api.deletePortfolio(portfolio.name, function(code, err, respObj) {
                    if (code !== 200) return api.notifyErrorListeners(err);
                    tr.parentElement.removeChild(tr);
                    Graphing.removeSeries(tsPlot,portfolio.name);
                });
            });

            table.prepend(tr);
        });
    }
    let tsPlot = null;
    // call to backend to pull all portfolios for the user,
    // populate the table with portfolio list
    api.getUserPortfoliosList(function(code, err, respObj) {
        if (code !== 200) return api.notifyErrorListeners(err);
        populatePortfolioTable(respObj.data.portfolioList);
    });

    
    let graphData = {portfolioNames:[],porfotlioSeries:[]};
    $("#viewSelectionsBtn").click(function(){
        let selections = [];
       $("input[type='checkbox']:checked").each(function(){
            let row = this.parentElement.parentElement;
            let portfolioName = $(row).find(".tm-product-name").text();
            selections.push(portfolioName);
       });
       if(selections.length == 0){
           if(tsPlot && !tsPlot.isDisposed())
           tsPlot.dispose();
           document.getElementById('chartHeader').style.visibility = "hidden";
           document.getElementById('chartContainer').style.visibility = "hidden";
       }
       else{
           if (!tsPlot || tsPlot.isDisposed)
           document.getElementById('chartHeader').style.visibility = "visible";
           document.getElementById('chartContainer').style.visibility = "visible";
           tsPlot = Graphing.initPlot("chart");
           Graphing.graphPortfolios(tsPlot,selections,"line");
            
       }
    });

    let timeBtns = document.querySelector("#timeBtns");
    let timeButtons = timeBtns.querySelectorAll('.btn');
    timeButtons.forEach(function(btn){
        btn.onclick = function(){
            timeButtons.forEach(function(btn2){
                btn2.disabled = false;
            });
            btn.disabled = true;
        };
    });

    let plotBtns = document.querySelector("#plotBtns");
    let plotButtons = plotBtns.querySelectorAll('.btn');
    plotButtons.forEach(function(btn){
        btn.onclick = function(){
            plotButtons.forEach(function(btn2){
                btn2.disabled = false;
            });
            btn.disabled = true;
        };
    });

    $("#linePlot").click( function(e){
        let ns =Graphing.changeLinePlot(tsPlot,"line");
    });
    $("#areaPlot").click(function(e){
        let ns = Graphing.changeLinePlot(tsPlot,"area");
    });
    
    $("#1min").click(function(e){
        let selections = tsPlot.getOption().legend[0].data;
        tsPlot.dispose();
        tsPlot = Graphing.initPlot("chart");
        Graphing.graphPortfolios(tsPlot,selections,"1min");
    });
    $("#5min").click(function(e){
        let selections = tsPlot.getOption().legend[0].data;
        tsPlot.dispose();
        tsPlot = Graphing.initPlot("chart");
        Graphing.graphPortfolios(tsPlot,selections,"5min");
    });
    $("#15min").click(function(e){
        let selections = tsPlot.getOption().legend[0].data;
        tsPlot.dispose();
        tsPlot = Graphing.initPlot("chart");
        Graphing.graphPortfolios(tsPlot,selections,"15min");
    });
    $("#30min").click(function(e){
        let selections = tsPlot.getOption().legend[0].data;
        tsPlot.dispose();
        tsPlot = Graphing.initPlot("chart");
        Graphing.graphPortfolios(tsPlot,selections,"30min");
    });
    $("#1hour").click(function(e){
        let selections = tsPlot.getOption().legend[0].data;
        tsPlot.dispose();
        tsPlot = Graphing.initPlot("chart");
        Graphing.graphPortfolios(tsPlot,selections,"1hour");
    });
    $("#line").click(function(e){
        let selections = tsPlot.getOption().legend[0].data;
        tsPlot.dispose();
        tsPlot = Graphing.initPlot("chart");
        Graphing.graphPortfolios(tsPlot,selections,"line");
    });

});
