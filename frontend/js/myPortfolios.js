/*jshint esversion: 6 */
window.addEventListener('load', function(){
    "use strict";

    function populatePortfolioTable(portfolios) {
        let table = $('#portfolioList');
        // Display stats about each portfolio as a separate table row
        portfolios.forEach(function(portfolio){
            let totalPurchasePrice = portfolio.purchaseValue;
            let created = 'TODO';
            // calculate totalCurrentPrice, change;
            let totalCurrentPrice = 0.0;
            portfolio.stock_list.forEach(function(stockPurchase) {
                totalCurrentPrice = totalCurrentPrice + stockPurchase.stock.price;
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
                api.deletePortfolio(portfolio._id, function(code, err, respObj) {
                    if (code !== 200) return api.notifyErrorListeners(err);
                    tr.parentElement.removeChild(tr);
                });
            });

            table.prepend(tr);
        });
    }

    // call to backend to pull all portfolios for the user,
    // populate the table with portfolio list
    api.getUserPortfoliosList(function(code, err, respObj) {
        if (code !== 200) return api.notifyErrorListeners(err);
        populatePortfolioTable(respObj.data.portfolioList);
    });

    let tsPlot = null;
    let graphData = {portfolioNames:[],porfotlioSeries:[]}
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
           document.getElementById('chartContainer').style.display = "none";
       }
       else{
           if (!tsPlot || tsPlot.isDisposed)
           document.getElementById('chartContainer').style.display = "block";
           tsPlot = Graphing.initPlot("chart");
           //let temp = graphSelectedPortfolios(tsPlot,graphData); 
       }
    });

});
