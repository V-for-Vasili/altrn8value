/*jshint esversion: 6 */
window.onload = (function(){
    "use strict";

    //TODO:
    // #########################################################################
    // Replace With Call to Backend to pull all porofolios for the user 
    let Porfolios = JSON.parse(localStorage.getItem("Porfolios"));
    // Array of poroflio objects will be passed into the loadPorfolio function
    loadPorfolios(Porfolios);
    //########################################################################
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
    reloadPageContent();
    function reloadPageContent() {
        api.notifyStockDisplayListeners();
    }
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

            tr.querySelector('i').addEventListener('click',function(e){
                tr.parentElement.removeChild(tr);
                // TODO:
                //#########################################
                //## Replace with Backend Function Calls###
                // Removes The porfolio with this name from the users list of porofolios
                let name = porfolio.name;
                Porfolios = Porfolios.filter(obj => (obj.name != name));
                localStorage.setItem("Porfolios",JSON.stringify(Porfolios));
                //########################################## 
            });

            $('#porfolioList').prepend(tr);
        });
    }

    
})();
