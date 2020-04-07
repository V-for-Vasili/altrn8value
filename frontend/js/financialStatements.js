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
            document.getElementById(this.headId).innerHTML = `<tr><th scope="col">Account:</th>${this.generateMetricTableColumns()}</tr>`;
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
                    // used to assign conditonal formatting
                    for (let idx in metrics) {
                        let c = '';
                        let m = metrics[idx];
                        let tr = document.createElement('tr');
                        c = FS.assignClass(title,m,api.years.length,table);
                        tr.classList.add(c.tr);
                        
                        tr.innerHTML = `<th scope="row" class="${c.head}">${(c.flag)?c.newM:m}</th>`;
                        for (let idx1 in api.years) {
                            let year = api.years[idx1];
                            let info = infoByYear[year][m];
                            info = FS.formatNumeric(info,'',2,'.',',');
                            if (idx1 == 0) info = `${info}`;
                            tr.innerHTML += `<td class="${c.cell}">${info}</td>`;
                        }
                        table.append(tr);
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

        assignClass:function(fs,accountName,numYears,tbl){
            let c={head:'',cell:'',append:'',flag:false, td:''};
            let a;
            switch(fs){
                case "Income Statement":
                    switch(accountName){
                        case "Gross Profit":
                            c.head = "ra";
                            c.cell = "raTotal";
                            break;
                            //c.append = document.createElement('tr');
                            //c.append.classList.add("seperator");
                            //c.append.innerHTML = `<th scope="row" class="SeperatorTitle">Operating Expenses :</th>` + "<td></td>".repeat(len);
                            //break;
                        case "Operating Expenses":
                            c.head = "ra";
                            c.cell = "raTotal";
                            break;
                        case "R&D Expenses":
                            c.cell = "totalNext";
                            break;
                        case "Operating Income":
                            c.cell = "totalNext";
                            break;
                        case "Earnings before Tax":
                            c.head = "ra";
                            c.cell = "raTotal";
                            break;
                        case "Income Tax Expense":
                            c.cell = "totalNext";
                            break;
                        case "Net Income":
                            c.head = "ra";
                            c.cell = "raTotal";
                            break;
                        case "EPS":
                            c.cell = "totalNext";
                            break;
                    }
                    break;
                case "Balance Sheet":
                    switch(accountName){
                        case 'Cash & Cash Equivalents':
                            c.append = document.createElement('tr');
                            c.append.classList.add("seperator");
                            c.append.innerHTML = `<th scope="row" class="seperatorTitle">Assets :</th>` + "<td></td>".repeat(numYears);
                            a = document.createElement('tr');
                            a.classList.add("seperator");
                            a.innerHTML = `<th scope="row" class="seperatorSubTitle">Current Assets :</th>` + "<td></td>".repeat(numYears);
                            tbl.append(c.append);
                            tbl.append(a);
                            break;
                        case "Total Current Assets":
                            c.head = "ra";
                            c.cell = "raTotal";
                            break;
                        case "Property, Plant & Equipment Net":
                            c.append = document.createElement('tr');
                            c.append.classList.add("seperator");
                            c.append.innerHTML = `<th scope="row" class="seperatorSubTitle">Non-current Assets :</th>` + "<td></td>".repeat(numYears);
                            tbl.append(c.append);
                            break;
                        case "Total Non-current Assets":
                            c.head = "ra";
                            c.cell = "raTotal";
                            break;
                        case "Total Assets":
                            c.head ="raTotal";
                            c.cell = "raTotal";
                            break;
                        case "Payables":
                            c.append = document.createElement('tr');
                            c.append.classList.add("seperator");
                            c.append.innerHTML = `<th scope="row" class="seperatorTitle text-red">Liabilites :</th>` + "<td></td>".repeat(numYears);
                            a = document.createElement('tr');
                            a.classList.add("seperator");
                            a.innerHTML = `<th scope="row" class="seperatorSubTitle text-red">Current Liabilites :</th>` + "<td></td>".repeat(numYears);
                            tbl.append(c.append);
                            tbl.append(a);
                            break;
                        case "Total Current Liabilities":
                            c.head = "ra";
                            c.cell = "raTotal";
                            break;
                        case "Long-term Debt":
                            c.append = document.createElement('tr');
                            c.append.classList.add("seperator");
                            c.append.innerHTML = `<th scope="row" class="seperatorSubTitle">Non-current Liabilites :</th>` + "<td></td>".repeat(numYears);
                            tbl.append(c.append);
                            break;
                            case "Total Non-current Liabilities":
                                c.head = "ra";
                                c.cell = "raTotal";
                                break;
                            case "Total Liabilities":
                                c.head ="raTotal";
                                c.cell = "raTotal";
                                break;
                            case "Other Comprehensive Income":
                                c.append = document.createElement('tr');
                                c.append.classList.add("seperator");
                                c.append.innerHTML = `<th scope="row" class="seperatorTitle ">Equity :</th>` + "<td></td>".repeat(numYears);
                                tbl.append(c.append);
                                break;
                            case "Total Shareholders Equity":
                                c.head ="raTotal";
                                c.cell = "raTotal";
                                break;
                    } 
                    break;
            }
            return c;
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