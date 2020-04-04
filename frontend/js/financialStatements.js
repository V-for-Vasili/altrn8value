/*jshint esversion: 6 */
let FS = (function(){
    let module ={
        
        init : function(id,titleId,colHeadId,bodyId){
            this.id = id;
            this.titleId = titleId;
            this.headId = colHeadId;
            this.bodyId = bodyId;
        },
        initColHeaders : function(){
            document.getElementById(this.headId).innerHTML = `<tr><th scope="col">Metric:</th>${this.generateMetricTableColumns()}</tr>`;
        },
        update: function(rs){
            if (rs.stockDisplayList.length == 0) {
                // no stocks in display list
                RS.init();
                // hide metrics table
                this.hideMetricsTable(this.id);
                return;
            }
            let companyName = rs.metricTableCurrStock;
            if (rs.metricTableCurrTab == 0)
                return this.dsiplayIS(companyName);
            if (rs.metricTableCurrTab == 1)
                return this.displayBS(companyName);
            if (rs.metricTableCurrTab == 2)
                return this.displayCF(companyName);
            api.notifyErrorListeners('rs.metricTableCurrTab contains invalid number.');

        },

        showMetricsTable : function() {
            document.getElementById(this.id).style.display = 'block';
            //document.getElementById(this.id).style.visibility = 'visible';
            
        },

        hideMetricsTable : function() {
            document.getElementById(this.id).style.display = 'none';
            //document.getElementById(this).style.visibility = 'hidden';
        },
        // generates columns for metrics table
        generateMetricTableColumns: function() {
        let content = '';
        for (let year of api.years) {
            content += `<th scope="col">${year}</th>`;
        }
        return content;
        },
        getInfoByYear: function(respObj) {
            let infoByYear = {};
            respObj.forEach(function(item) {
                let year = item.date.split('-', 1)[0];
                infoByYear[year] = item;
            });
            // if info for some year is not present, substitute it with empty object
            for (let year of api.years) {
                if (!infoByYear[year]) infoByYear[year] = {};
            }
            return infoByYear;
        },

        populateMetricsTable : function(apiFunction, companyName, metrics, title) {
            // set title
            
            document.getElementById(this.titleId).innerHTML = title;
            // get info statements from api
            apiFunction(companyName, false, function(code, err, respObj) {
                if (code !== 200) return api.notifyErrorListeners(err);
                let table = document.getElementById(FS.bodyId);
                // populate table
                table.innerHTML = '';
                if (api.is_empty_object(respObj)) {
                    table.innerHTML = '<th scope="row"><b>No Data.</b></th>';
                    // notify user of error
                    api.notifyErrorListeners('Error: Empty respObj for company ' + companyName);
                } else {
                    let infoByYear = FS.getInfoByYear(respObj);
                    for (let idx in metrics) {
                        let m = metrics[idx];
                        let tr = document.createElement('tr');
                        tr.innerHTML = `<th scope="row">${m}</th>`;
                        for (let idx1 in api.years) {
                            let year = api.years[idx1];
                            let info = infoByYear[year][m];
                            info = FS.formatNumeric(info,'',2,'.',',');
                            if (idx1 == 0) info = `${info}`;
                            tr.innerHTML += `<td>${info}</td>`;
                        }
                        table.appendChild(tr);
                    }
                }
                FS.showMetricsTable();
            });
        },
        // Functions to populate metrics table
        dsiplayIS : function(companyName) {
            this.populateMetricsTable(api.getIncomeStatement, companyName, api.getIncomeStatementMetricNames(), "Income Statement");
        },

        displayBS : function(companyName) {
            this.populateMetricsTable(api.getBalanceSheet, companyName, api.getBalanceSheetMetricNames(), "Balance Sheet");
        },

        displayCF : function (companyName) {
            this.populateMetricsTable(api.getCashFlowStmt, companyName, api.getCashFlowStmtMetricNames(), "Cash Flow Statement");
        },

        
        formatNumeric : function (amount,prefix,decimalCount,decimal,thousands) {
            try {
                decimalCount = Math.abs(decimalCount);
                decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
    
                const negativeSign = amount < 0 ? "-" : "";
    
                let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
                let j = (i.length > 3) ? i.length % 3 : 0;
    
                return negativeSign + prefix + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
            } catch (e) {
                api.notifyErrorListeners(e);
            }
        }
    };

    return module;
})();