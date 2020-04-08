/*jshint esversion: 6 */
window.onload = (function(){
    "use strict";
    
    //call to backend to pull all portfolios for the user
    api.getUserPortfolios(api.getUid(), function(code, err, respObj) {
        if (code !== 200) return api.notifyErrorListeners(err);
        console.log(respObj);
        //loadportfolios(respObj);
    });
    // let portfolios = JSON.parse(localStorage.getItem("portfolios"));
    // // Array of poroflio objects will be passed into the loadportfolio function
    // loadportfolios(portfolios);

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

    function reloadPageContent() {
        api.notifyStockDisplayListeners();
    }
    reloadPageContent();

    function loadPortfolios(portfolios){
        portfolios.forEach(function(portfolio){
            let tr = document.createElement('tr');
            tr.innerHTML = `
            <th scope="row" class="checkCell"><input type="checkbox" /></th>
            <td class="tm-product-name">${portfolio.name}</td>
            <td>${portfolio.cost}</td>
            <td>${portfolio.cost * 1.35}</td>
            <td>35%</td>
            <td>${portfolio.created}</td>
            <td>
              <a href="#" class="tm-product-delete-link">
                <i class="far fa-trash-alt tm-product-delete-icon"></i>
              </a>
            </td>`;

            tr.querySelector('i').addEventListener('click',function(e){
                // delete this portfolio
                api.deletePortfolio(portfolio._id, function(code, err, respObj) {
                    if (code !== 200) return api.notifyErrorListeners(err);
                    tr.parentElement.removeChild(tr);
                });
            });

            $('#portfolioList').prepend(tr);
        });
    }

    //let tsPlot = Graphing.initPlot("chart");
    //Graphing.update(tsPlot,[],[]);
    //Graphing.graphportfolio(tsPlot,portfolios[0]);

})();
