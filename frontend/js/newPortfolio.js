let NP = (function(){
    "use strict";
    let np = {
        portfolio : {
            stock_list : [],
            purchaseValue : 0,
        },
        getPortfolio: function(){
            return this.portfolio;
        },
        // Will correctly formatt the object to be passed into API call and assign
        submitPortfolio : function(name,date){
            let result = {name:name ,purchaseValue:this.portfolio.purchaseValue, dateCreated:date};
            let stock_list = this.portfolio.stock_list.map(obj => {
                let rObj = {
                    symbol:obj.symbol,
                    shares:parseFloat(obj.shares),
                    purchasePrice:obj.purchasePrice,
                    purchaseTime:date
                };
            return rObj;
            });
            result.stock_list = stock_list;
            return result;
        },
        updateStockPrice: function(price,symbol){
            let idx = this.portfolio.stock_list.findIndex(obj => symbol.localeCompare(obj.symbol) == 0);
            if (idx == -1) {
                api.notifyErrorListeners(`updateStockPrice: Stock with symbol ${symbol} DNE.`);
                return;
            }
            let oldCost = this.portfolio.stock_list[idx].cost;
            let newCost = this.portfolio.stock_list[idx].shares * price;
            this.portfolio.stock_list[idx].purchasePrice = price;
            this.portfolio.stock_list[idx].cost = newCost;
            this.updatePortfolioCost(newCost - oldCost);
            return newCost;
        },
        addStock : function(name,symbol,price){
            let stockObj = {name:name,symbol:symbol,purchasePrice:price,shares:0,cost:0};
            this.portfolio.stock_list.push(stockObj);
        },
        removeStock : function(symbol){
            this.portfolio.stock_list = this.portfolio.stock_list.filter(stockObj => symbol.localeCompare(stockObj.symbol) != 0);
        },
        updateStock : function(symbol,newShares,newCost){
            let idx = this.portfolio.stock_list.findIndex(stockObj => symbol.localeCompare(stockObj.symbol) == 0);
            if (idx == -1) {
                api.notifyErrorListeners(`updateStock: Stock with symbol ${symbol} DNE.`);
                return;
            }
            let oldCost = this.portfolio.stock_list[idx].cost;
            this.portfolio.stock_list[idx].shares = newShares;
            this.portfolio.stock_list[idx].cost = newCost;
            this.updatePortfolioCost(newCost - oldCost);
            return np;
        },
        updatePortfolioCost : function(amount){
            this.portfolio.purchaseValue += amount;
        },
        getPortfolioCost : function(){
            return this.portfolio.purchaseValue;
        }
    };
    return np;
})();