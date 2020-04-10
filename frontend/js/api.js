let api = (function(){
    "use strict";
    let module = {};

    //
    // helper functions
    //

    function do_nothing(code, err, respObj) {}

    // Error is any return code >= 400.
    // callback format: code, err, respObj.
    function send_ajax(method, url, data, callback) {
        let xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status < 400) {
                let respObj = JSON.parse(xhr.responseText);
                callback(xhr.status, null, respObj);
            } else {
                let err = `[${xhr.status}]: ${xhr.responseText}`;
                callback(xhr.status, err, null);
                // notify listeners to display error message
                module.notifyErrorListeners(err);
            }
        };
        xhr.open(method, url, true);
        if (!data) {
            xhr.send();
        } else{
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    }

    // queries backend
    function seng_graphql_request(data, callback) {
        let method = 'POST';
        let url = '/graphql';
        send_ajax(method, url, data, function(code, err, respObj) {
            // catch http error
            if (err)
                return module.notifyErrorListeners('Graphql errors: ' + JSON.stringify(err));
            // catch graphql error
            if (respObj.errors)
                return module.notifyErrorListeners('Graphql errors: ' + JSON.stringify(respObj.errors));
            return callback(200, null, respObj);
        });
    }

    // Passed to signin and signup ajax requests.
    // notifies login listeners if login is successfuls.
    function authentication_callback(code, err, respObj) {
        if (code >= 400) return module.notifyErrorListeners(err);
        // notify listeners so changes on the page take place
        module.notifyLoginListeners();
    }

    // helper f-on to get all metric labels; Omits 'date'
    function get_metric_names(obj) {
        let names = [];
        Object.keys(obj).forEach(function(key) {
            if (key === 'date') return;
            names.push(obj[key]);
        });
        return names;
    }

    function transform_financial_metrics_result(respObj, metrics_table) {
        let result = [];
        respObj.forEach(function(data) {
            let data_transformed = {};
            Object.keys(data).forEach(function(key) {
                data_transformed[metrics_table[key]] = data[key];
            });
            result.push(data_transformed);
        });
        return result;
    }

    // src : https://www.w3schools.com/js/js_cookies.asp
    function getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return null;
    }

    //
    // Declarations of the metrics we fetch from the backend
    //

    // years for which we show financial statements
    module.years = ['2019', '2018', '2017', '2016', '2015', '2014'];

    module.incomeStatementMetrics = {
        date: 'date',
        revenue: 'Revenue',
        cost_of_revenue: 'Cost of Revenue',
        gross_profit: 'Gross Profit',
        rd_expenses: 'R&D Expenses',
        sga_expense: 'SG&A Expense',
        operating_expenses: 'Operating Expenses',
        operating_income: 'Operating Income',
        interest_expense: 'Interest Expense',
        earnings_before_tax: 'Earnings before Tax',
        income_tax_expense: 'Income Tax Expense',
        //net_ncome_non_controlling_int: 'Net Income - Non-Controlling int',
        //net_income_discontinued_ops: 'Net Income - Discontinued ops',
        net_income: 'Net Income',
        //preferred_dividends: 'Preferred Dividends',
        //net_income_com: 'Net Income Com',
        eps: 'EPS',
        eps_diluted: 'EPS Diluted',
        weighted_average_shs_out: 'Weighted Average Shs Out',
        weighted_average_shs_out_dil: 'Weighted Average Shs Out (Dil)',
        dividend_per_share: 'Dividend per Share',
    };

    module.finacialRatios ={
        revenue_growth: 'Revenue Growth',
        gross_margin: 'Gross Margin',
        ebitda_margin: 'EBITDA Margin',
        ebit_margin: 'EBIT Margin',
        profit_margin: 'Profit Margin',
        free_cash_flow_margin: 'Free Cash Flow margin',
        ebitda: 'EBITDA',
        ebit: 'EBIT',
        consolidated_income: 'Consolidated Income',
        earnings_before_tax_margin: 'Earnings Before Tax Margin',
        net_profit_margin: 'Net Profit Margin',
    };

    module.balanceSheetMetrics = {
        date: 'date',
        cash_and_cash_equivalents: 'Cash & Cash Equivalents',
        //short_term_investments: 'Short-term investments',
        //cash_and_short_term_investments: 'Cash and short-term investments',
        receivables: 'Receivables',
        inventories: 'Inventories',
        total_current_assets: 'Total Current Assets',
        property_plant_and_equipment_net: 'Property, Plant & Equipment Net',
        goodwill_and_intangible_assets: 'Goodwill and Intangible Assets',
        long_term_investments: 'Long-term Investments',
        tax_assets: 'Tax Assets',
        total_non_current_assets: 'Total Non-current Assets',
        total_assets: 'Total Assets',
        payables: 'Payables',
        short_term_debt: 'Short-term debt',
        total_current_liabilities: 'Total Current Liabilities',
        long_term_debt: 'Long-term Debt',
        total_debt: 'Total debt',
        deferred_revenue: 'Deferred revenue',
        tax_liabilities: 'Tax Liabilities',
        deposit_liabilities: 'Deposit Liabilities',
        total_non_current_liabilities: 'Total Non-current Liabilities',
        total_liabilities: 'Total Liabilities',
        other_comprehensive_income: 'Other Comprehensive Income',
        retained_earnings_deficit: 'Retained Earnings (deficit)',
        total_shareholders_equity: 'Total Shareholders Equity',
        //investments: 'Investments',
        //net_debt: 'Net Debt',
        //other_ssets: 'Other Assets',
        //other_liabilities: 'Other Liabilities',
    };

    module.cashFlowStmtMetrics = {
        date: 'date',
        depreciation_and_amortization: 'Depreciation & Amortization',
        stock_based_compensation: 'Stock-based compensation',
        operating_cash_flow: 'Operating Cash Flow',
        capital_expenditure: 'Capital Expenditure',
        acquisitions_and_disposals: 'Acquisitions and disposals',
        investment_purchases_and_sales: 'Investment purchases and sales',
        investing_cash_flow: 'Investing Cash flow',
        issuance_repayment_of_debt: 'Issuance (repayment) of debt',
        issuance_buybacks_of_shares: 'Issuance (buybacks) of shares',
        dividend_payments: 'Dividend payments',
        financing_cash_flow: 'Financing Cash Flow',
        effect_of_forex_changes_on_cash: 'Effect of forex changes on cash',
        net_cash_flow_change_in_cash: 'Net cash flow / Change in cash',
        free_cash_flow: 'Free Cash Flow',
        net_cash_marketcap: 'Net Cash/Marketcap',
    };

    module.getIncomeStatementMetricNames = function() {
        return get_metric_names(module.incomeStatementMetrics);
    };

    module.getBalanceSheetMetricNames = function() {
        return get_metric_names(module.balanceSheetMetrics);
    };

    module.getCashFlowStmtMetricNames = function() {
        return get_metric_names(module.cashFlowStmtMetrics);
    };

    //
    // authentication
    //

    module.isLoggedIn = function() {
        let username = getCookie('username');
        return (username)? 1:0;
    };

    module.getUsername = function() {
        return getCookie('username');
    };

    module.getUid = function() {
        return getCookie("Uid");
    };

    // from lab 6
    module.signUp = function(username, password) {
        send_ajax('POST', '/api/signup', {username, password}, authentication_callback);
    };

    // from lab 6
    module.signIn = function(username, password) {
        send_ajax('POST', '/api/signin', {username, password}, authentication_callback);
    };

    module.signOut = function() {
        // destroy username and token
        document.cookie ="username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        // notify listeners so changes on the page take place
        module.notifyLoginListeners();
        window.location.href = '/index.html';
    };

    //
    // api methods
    //

    // company profile includes some info about the company and its business
    module.getCompanyProfile = function(symbol, callback=do_nothing) {
        let query = `{
                stock(symbol:\"${symbol}\"){
                    symbol
                    price
                    company_profile {
                        beta
                        last_div
                        range
                        company_name
                        industry
                        website
                        description
                        ceo
                        sector
                        image
                    }
                }
            }
        `;
        let data = {query: query};
        seng_graphql_request(data, function(code, err, respObj) {
            // financial info for different time intervals
            if (code !== 200) return module.notifyErrorListeners(err);
           
            callback(respObj);
        });
    };

    // does not include the following fields:
    // rating, rating_details, company_profile, quote, history
    module.getStockData = function(symbol, callback=do_nothing) {
        let query = `{
            stock(symbol:\"${symbol}\"){
                symbol
                price
                exchange
                market_cap
                change
                changes_percentage
                avg_volume
            }
        }`;
        let data = {query: query};
        seng_graphql_request(data, function(code, err, respObj) {
            // financial info for different time intervals
            if (code !== 200) return module.notifyErrorListeners(err);
           
            callback(respObj);
        });
    };

    // queries financialmodelingprep.com; Searches NASDAQ only for now
    // based on https://financialmodelingprep.com/developer/docs/#Company-Financial-Statements
    module.getListOfStocks = function(searchStr, callback=do_nothing) {
        let query = `{
            stockList(searchStr:\"${searchStr}\"){
                symbol
                name
                currency
                stockExchange
                exchangeShortName
            }
        }`;
        let data = {query: query};
        seng_graphql_request(data, callback);
    };

    module.getDailyStoclPriceTS = function(symbol,type="line",callback=do_nothing){
        let query = `{stock(symbol:\"${symbol}\"){
            symbol
            price
            history(timeseries:\"${type}\") {
                date
                open
                high
                low
                close
                adjClose
                volume
                unadjustedVolume
                change
                changePercent
                vwap
                label
            }
          }}`;
          let data = {query: query};
          seng_graphql_request(data,function(code, err, respObj) {
            // financial info for different time intervals
            if (code !== 200) return module.notifyErrorListeners(err);
           
            callback(respObj);
        });
    };

    // if quarter is true, pull quarterly data
    // if quarter is false, pull yearly data
    module.getIncomeStatement = function(symbol, quarter=false, callback=do_nothing) {
        let metric = quarter ? 'income_statement_quarter' : 'income_statement_year';
        let query = `{
            stock(symbol:\"${symbol}\"){
                ${metric} {
                    date
                    revenue
                    revenue_growth
                    cost_of_revenue
                    gross_profit
                    rd_expenses
                    sga_expense
                    operating_expenses
                    operating_income
                    interest_expense
                    earnings_before_tax
                    income_tax_expense
                    net_ncome_non_controlling_int
                    net_income_discontinued_ops
                    net_income
                    preferred_dividends
                    net_income_com
                    eps
                    eps_diluted
                    weighted_average_shs_out
                    weighted_average_shs_out_dil
                    dividend_per_share
                    gross_margin
                    ebitda_margin
                    ebit_margin
                    profit_margin
                    free_cash_flow_margin
                    ebitda
                    ebit
                    consolidated_income
                    earnings_before_tax_margin
                    net_profit_margin
                }
            }
        }`;
        let data = {query: query};
        seng_graphql_request(data, function(code, err, respObj) {
            // need to transform the response object to return only a list of
            // financial info for different time intervals
            if (code !== 200) return module.notifyErrorListeners(err);
            respObj = respObj.data.stock[metric];
            // Transform the result to attah correct metric names, for example
            // "R&D Expenses" in place of "rd_expenses"
            let result = transform_financial_metrics_result(respObj, module.incomeStatementMetrics);
            callback(code, err, result);
        });
    };

    // if quarter is true, pull quarterly data
    // if quarter is false, pull yearly data
    module.getBalanceSheet = function(symbol, quarter=false, callback=do_nothing) {
        let metric = quarter ? 'balanse_sheet_quarter' : 'balanse_sheet_year';
        let query = `{
            stock(symbol:\"${symbol}\"){
                ${metric} {
                    date
                    cash_and_cash_equivalents
                    short_term_investments
                    cash_and_short_term_investments
                    receivables
                    inventories
                    total_current_assets
                    property_plant_and_equipment_net
                    goodwill_and_intangible_assets
                    long_term_investments
                    tax_assets
                    total_non_current_assets
                    total_assets
                    payables
                    short_term_debt
                    total_current_liabilities
                    long_term_debt
                    total_debt
                    deferred_revenue
                    tax_liabilities
                    deposit_liabilities
                    total_non_current_liabilities
                    total_liabilities
                    other_comprehensive_income
                    retained_earnings_deficit
                    total_shareholders_equity
                    investments
                    net_debt
                    other_ssets
                    other_liabilities
                }
            }
        }`;
        let data = {query: query};
        seng_graphql_request(data, function(code, err, respObj) {
            // need to transform the response object to return only a list of
            // financial info for different time intervals
            if (code !== 200) return module.notifyErrorListeners(err);
            respObj = respObj.data.stock[metric];
            // Transform the result to attah correct metric names, for example
            // "R&D Expenses" in place of "rd_expenses"
            let result = transform_financial_metrics_result(respObj, module.balanceSheetMetrics);
            callback(code, err, result);
        });
    };

    // if quarter is true, pull quarterly data
    // if quarter is false, pull yearly data
    module.getCashFlowStmt = function(symbol, quarter=false, callback=do_nothing) {
        let metric = quarter ? 'cash_flow_statement_quarter' : 'cash_flow_statement_year';
        let query = `{
            stock(symbol:\"${symbol}\"){
                ${metric} {
                    date
                    depreciation_and_amortization
                    stock_based_compensation
                    operating_cash_flow
                    capital_expenditure
                    acquisitions_and_disposals
                    investment_purchases_and_sales
                    investing_cash_flow
                    issuance_repayment_of_debt
                    issuance_buybacks_of_shares
                    dividend_payments
                    financing_cash_flow
                    effect_of_forex_changes_on_cash
                    net_cash_flow_change_in_cash
                    free_cash_flow
                    net_cash_marketcap
                }
            }
        }`;
        let data = {query: query};
        seng_graphql_request(data, function(code, err, respObj) {
            // need to transform the response object to return only a list of
            // financial info for different time intervals
            if (code !== 200) return module.notifyErrorListeners(err);
            respObj = respObj.data.stock[metric];
            // Transform the result to attah correct metric names, for example
            // "R&D Expenses" in place of "rd_expenses"
            let result = transform_financial_metrics_result(respObj, module.cashFlowStmtMetrics);
            callback(code, err, result);
        });
    };

    // returns list of portfolios for current user with the current price of each stock
    module.getUserPortfoliosList = function(callback=do_nothing) {
        if (!module.isLoggedIn()) return module.notifyErrorListeners('Must be logged in.');
        let query = `{
            portfolioList {
                name
                purchaseValue
                createdAt
                stock_list {
                    stock {
                        symbol
                        price
                    }
                    shares
                    purchasePrice
                    purchaseTime
                }
            }
        }`;
        let data = {query: query};
        seng_graphql_request(data, callback);
    };

    // gets portfolio by name for a current user
    module.getPortfolioByName = function(name, callback=do_nothing) {
        if (!module.isLoggedIn()) return module.notifyErrorListeners('Must be logged in.');
        let query = `query portfolio($name:String!){
            porfolio(name:$name){
                name
                purchaseValue
                createdAt
                stock_list{
                stock{
                    symbol
                    price
                    exchange
                    market_cap
                    change
                    changes_percentage
                    avg_volume
                }
                shares
                purchaseTime
                }
            }    
        }`;
        let variables = {name};
        let data = {query: query,variables:variables};
        seng_graphql_request(data, callback);
    };

    module.getPortfolioHistoryByName = function(name, callback=do_nothing) {
        if (!module.isLoggedIn()) return module.notifyErrorListeners('Must be logged in.');
        let query = `query portfolio($name:String!){
            portfolio(name:$name){
                name 
                    stock_list {
                    stock {
                    symbol
                    price
                    history {
                        date
                        open
                        high
                        low
                        close
                        adjClose
                        volume
                        unadjustedVolume
                        change
                        changePercent
                        vwap
                        label
                        changeOverTime
                    }
                    
                    }
                    shares
                    purchasePrice
                    purchaseTime
                }
            }
        }`;
        let variables = {name};
        let data = {query: query,variables:variables};
        seng_graphql_request(data, function(code, err, respObj) {
            //if (code !== 200) return module.notifyErrorListeners(err);
            callback(respObj);
        });
    };

    // name is the name of the new portfolio
    // stock list is of the form [{symbol, amount}]; symbols must not repeat;
    // response is the portfolio object created
    module.createPortfolio = function(name,stock_list,purchaseValue,createdAt,callback=do_nothing) {
        if (!module.isLoggedIn()) return module.notifyErrorListeners('Must be logged in.');
        let mutation = `mutation createPortfolio($name:String!,$stock_list:[stockListInput!]!,$purchaseValue:Float!,$createdAt:String!){
            createPortfolio(name:$name,
                stock_list:$stock_list,
                purchaseValue:$purchaseValue,
                createdAt:$createdAt 
            ){
              name
              stock_list {
                  stock {
                      symbol
                  }
                  shares
                  purchasePrice
                  purchaseTime
              }
        }}`;
        let variables ={name,stock_list,purchaseValue,createdAt};
        let data = {query: mutation , variables:variables};
        seng_graphql_request(data, callback);
    };

    // deletes portfolio by name
    // response is the portfolio object deleted
    module.deletePortfolio = function(name, callback=do_nothing) {
        if (!module.isLoggedIn()) return module.notifyErrorListeners('Must be logged in.');
        let mutation = `mutation {
            deletePortfolio(name:\"${name}\") {
              name
              stock_list {
                  stock {
                      symbol
                  }
                  shares
                  purchasePrice
                  purchaseTime
              }
            }
        }`;
        let data = {query: mutation};
        seng_graphql_request(data, callback);
    };

    // name is the name of the portfolio
    // stock_list argument will be the new stock_list stored for this portfolio
    // stock list is of the form [{symbol, amount}]; symbols must not repeat
    // response is the portfolio object after update
    module.updatePortfolio = function(name, stock_list, purchaseValue, callback=do_nothing) {
        if (!module.isLoggedIn()) return module.notifyErrorListeners('Must be logged in.');
        let mutation = `mutation updatePortfolio($name:String!,$stock_list:[stockListInput!]!,$purchaseValue:Float!){
            updatePortfolio(name:$name,stock_list:$stock_list,purchaseValue:$purchaseValue){
              name
              stock_list {
                  stock {
                      symbol
                  }
                  shares
                  purchasePrice
                  purchaseTime
              }
        }}`;
        let variables ={name,stock_list,purchaseValue};
        let data = {query:mutation , variables:variables};
        seng_graphql_request(data, callback);
    };

    //
    // Listeners for different events
    //

    let loginListeners = [];
    let stockDisplayListeners = [];
    let errorListeners = [];

    module.notifyLoginListeners = function() {
        loginListeners.forEach(function(listener) {
            listener();
        });
    };

    module.notifyStockDisplayListeners = function() {
        stockDisplayListeners.forEach(function(listener) {
            listener();
        });
    };

    // notifyErrorListeners from lab 6
    module.notifyErrorListeners  = function(err) {
        errorListeners.forEach(function(listener) {
            listener(err);
        });
    };

    module.onLogin = function(listener) {
        loginListeners.push(listener);
        listener();
    };

    module.onStockDisplayChange = function(listener) {
        stockDisplayListeners.push(listener);
    };

    // module.onError from lab 6
    module.onError = function(listener) {
        errorListeners.push(listener);
    };

    module.stockQuoteSubscribe = function(symbol,callback=do_nothing){
        
    };

    


    //
    // api helper methods
    //

    // based on accepted answer:
    // https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
    module.is_empty_object = function(obj) {
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    };

    // Formats numeric outputs for cost calculations
    // https://stackoverflow.com/questions/149055/how-to-format-numbers-as-currency-string
    module.formatNumeric = function(amount, prefix, decimalCount, decimal, thousands) {
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
    };

    return module;
})();
