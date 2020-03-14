/*jshint esversion: 6 */
// Sets Up the Add Stock Bar at top of page
$("#singleSearch").select2({
    placeholder: 'Select A Stock',
    theme: "flat",
    allowClear: true,
    ajax: {
        url:'https://financialmodelingprep.com/api/v3/search?query=&limit=10',
        processResults: function (ajaxData){
            let data = $.map(ajaxData, function (obj,index){
                obj.id = obj.id || index + 1;
                obj.text = obj.text || obj.symbol; // replace name with the property used for the text
                return obj;
              });
              
            return {results: data};
        },
        cache: true
    }
});

// Behavoiour For when a stock is selected from the drop down list
$("#singleSearch").on('select2:select', function (e) {
    let data = e.params.data;
    let tr = document.createElement('tr');
    tr.innerHTML = `<td class="tm-product-name">${data.name}</td>
    <td class="text-center">
        <a class="tm-product-delete-link">
            <i class="far fa-trash-alt tm-product-delete-icon"></i>
        </a>
    </td>`;
    $('#StockSelections').prepend(tr);
    tr.querySelector('i').addEventListener('click',function(e){
       tr.parentElement.removeChild(tr);
    });
    $("#singleSearch").val(null).trigger("change");

});


