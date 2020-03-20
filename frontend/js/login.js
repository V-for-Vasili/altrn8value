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

    // once we are signed in, redirect to main page
    if (!api.isLoggedIn()) {
        api.onLogin(function() {
            if (api.isLoggedIn()) window.location.href = '/index.html';
        });
    }

    // hide portfolios and settings tabs initially
    document.querySelector('#navbarDropdown_portfolios').style.visibility = 'hidden';
    document.querySelector('#navbarDropdown_settings').style.visibility = 'hidden';

    // From lab 6
    // function to submit signin or sigup form
    function submit_form(action) {
        let form = document.querySelector("#loginForm");
        if (form.checkValidity()) {
            var username = form.querySelector("[name=username]").value;
            var password = form.querySelector("[name=password]").value;
            api[action](username, password);
        }
    }

    // attach events to signin and signup btns
    document.querySelector('#signinBtn').onclick = function() {
        submit_form('signIn');
    }
    document.querySelector('#signupBtn').onclick = function() {
        submit_form('signUp');
    }

})();
