let common = (function(){
    "use strict";
    let module = {};

    //
    // Contains functions used on every tab
    //

    // add error listeners to show error messages to the user
    api.onError(function(err) {
        console.log(err);
    });

    api.onError(function(err) {
        // make the error box visible and show the message
        document.querySelector('#errMessage').innerHTML = err;
        document.querySelector('#errBox').style.display = 'block';
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

    return module;
})();
