/*jshint esversion: 6 */
window.onload = (function(){
    "use strict";

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
