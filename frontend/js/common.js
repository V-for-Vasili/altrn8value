window.addEventListener('load', function(){
    "use strict";
    // Contains functions used on every tab

    // add error listeners to show error messages to the user
    api.onError(function(err) {
        console.log(err);
    });

    api.onError(function(err) {
        // make the error box visible and show the message
        document.querySelector('#errBox').style.display = 'block';
        document.querySelector('#errMessage').innerHTML = err;
        
    });

    // add event listener to show or hide tabs depending on whether user is
    // signed in or not
    api.onLogin(function() {
        let myPortfoliosTab = document.querySelector('#navbarDropdown_portfolios');
        let settingsTab = document.querySelector('#navbarDropdown_settings');
        let authBtn = document.querySelector('#authBtn');
        if (api.isLoggedIn()) {
            myPortfoliosTab.style.display = '';
            settingsTab.style.display = '';
            authBtn.innerHTML = `${api.getUsername()}, <b>Logout</b>`;
            authBtn.onclick = function() {
                api.signOut();
            };
        } else {
            myPortfoliosTab.style.display = 'none';
            settingsTab.style.display = 'none';
            authBtn.innerHTML = `<b>Sign In or Sign Up</b>`;
            authBtn.onclick = function() {
                window.location.href = '/login.html';
            };
        }
    });
});

