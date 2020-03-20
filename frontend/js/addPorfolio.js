 // Sets Up the Add Stock Bar at top of page

 window.onload = (function(){
    "use strict";
    function formatState (state) {
        if (!state.id) {
          return state.text;
        }
        var baseUrl = "https://financialmodelingprep.com/stocks/" + state.text.toLowerCase();
        //<img src="' + baseUrl +'.png" class="search-icon" /> 
        var $state = $('<span>' + state.text + ' | '+ state.name + '</span>');
        return $state;
    }
    // https://stackoverflow.com/questions/149055/how-to-format-numbers-as-currency-string
    function formatNumeric(amount,prefix,decimalCount,decimal,thousands) {
        try {
          decimalCount = Math.abs(decimalCount);
          decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
      
          const negativeSign = amount < 0 ? "-" : "";
      
          let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
          let j = (i.length > 3) ? i.length % 3 : 0;
      
          return negativeSign + prefix + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
        } catch (e) {
          console.log(e);
        }
      }
    $("#stockSelect").select2({
        placeholder: 'Select A Stock',
        theme: "flat",
        allowClear: true,
        minimumInputLength: 2,
        ajax: {
            delay: 250,
            url:'https://financialmodelingprep.com/api/v3/search',
            data: function(params){
                var Q = {query: params.term};
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

    $("#singleSearch").on('select2:select', function (e) {
        let name = e.params.data.name;
        let symbol = e.params.data.symbol;
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="stockImgContainer"><img class="stockSelectImg" src="https://financialmodelingprep.com/stocks/${symbol.toLowerCase()}.png"/></td>
            <td class="tm-product-name"> ${symbol} | ${name}</td>
            <td class="text-center">
                <a class="tm-product-delete-link">
                    <i class="far fa-trash-alt tm-product-delete-icon"></i>
                </a>
            </td>`;
        $('#StockSelections').prepend(tr);

        // Behaviour For When Stock is removed from selections
        tr.querySelector('i').addEventListener('click',function(e){
          tr.parentElement.removeChild(tr);
          $('#companeySelect').find("option[value='"+symbol+"']").remove();
          //$('#companeySelect').trigger('change');

          PAGE_INFO.series = PAGE_INFO.series.filter(obj => (obj.name != symbol) );
          console.log(PAGE_INFO.series);
          deleteStockFromDisplayList(symbol);
          if (PAGE_INFO.series.length == 0) chart.clear();
          initGraphCanvas(chart,PAGE_INFO.stockDisplayList,PAGE_INFO.series);  
          
          // delete the stock from list of displayed stocks
          
        });

        // Retrive time sereies for added stock and add to plot
        var url = "https://financialmodelingprep.com/api/v3/historical-price-full/" + symbol +"?serietype=line";
        $.getJSON(url, function(response) {
          let data = response.historical.map(obj =>{
              let rObj = [obj.date,obj.close];
              return rObj;  
          });
          let series = {name:symbol,type:'line',area:{},data:data};
          addStockToDisplayList(symbol);
          PAGE_INFO.series.push(series);
          initGraphCanvas(chart,PAGE_INFO.stockDisplayList,PAGE_INFO.series);
        });
        // Add Selected Comaney to FS select companey bar
        let opt = new Option(name,symbol,false,true);
        $('#companeySelect').append(opt).trigger('change').trigger(
          {type: 'select2:select',
          params: {
             data: {name: name,id:symbol}
        }});
        // Clear Stock Select Bar
        $("#singleSearch").val(null).trigger("change");
    });


   

})();
 