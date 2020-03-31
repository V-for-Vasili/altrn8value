/*jshint esversion: 6 */
window.onload = (function(){
    "use strict";

    function loadPorfolios(porfolios){
        porfolios.forEach(function(porfolio){
            let tr = document.createElement('tr');
            tr.innerHTML = `
            <th scope="row"><input type="checkbox" /></th>
            <td class="tm-product-name">${porfolio.name}</td>
            <td>${porfolio.cost}</td>
            <td>${porfolio.cost * 1.35}</td>
            <td>35%</td>
            <td>${porfolio.created}</td>
            <td>
              <a href="#" class="tm-product-delete-link">
                <i class="far fa-trash-alt tm-product-delete-icon"></i>
              </a>
            </td>`;
            $('#porfolioList').prepend(tr);
        });
        
    }
    let data = JSON.parse(localStorage.getItem("data"));
    loadPorfolios(data.porfolios);

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
            myPortfoliosTab.style.visibility = 'visible';
            settingsTab.style.visibility = 'visible';
        } else {
            myPortfoliosTab.style.visibility = 'hidden';
            settingsTab.style.visibility = 'hidden';
        }
    });

    function reloadPageContent() {
        api.notifyLoginListeners();
        api.notifyStockDisplayListeners();
    }

    reloadPageContent();

})();
