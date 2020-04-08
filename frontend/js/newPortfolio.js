/*jshint esversion: 6 */
let NP = (function(){
    let np = {
        portfolio : {
            stock_list : [],
            purchaseValue : 0,
            
        },
        getPorofolio: function(){
            return this.portfolio;
        },
        // Will correctly formatt the object to be passed into API call and assign
        submitportfolio : function(name,portfolio,date){
            let result = {name:name ,purchaseValue:portfolio.purchaseValue, dateCreated:date};
            let stock_list = portfolio.stock_list.map(obj => {
                let rObj = {
                    symbol:obj.symbol,
                    shares:obj.shares,
                    purchasePrice:obj.purchasePrice,
                    purchaseTime:date
                };
            return rObj;
            });
            result.stock_list = stock_list;
            return result;
        },
        addStock : function(name,symbol,price){
            let stockObj = {name:name,symbol:symbol,purchasePrice:price,shares:0,cost:0};
            this.portfolio.stock_list.push(stockObj);
        },
        removeStock : function(symbol){
            this.portfolio.stock_list = this.portfolio.stock_list.filter(stockObj => stockObj.symbol == symbol);
        },
        updateStock : function(symbol,newShares,newCost){
            let idx = this.portfolio.stock_list.findIndex(stockObj => stockObj.symbol == symbol);
            let oldCost = this.portfolio.stock_list[idx].cost;
            this.portfolio.stock_list[idx].shares = newShares;
            this.portfolio.stock_list[idx].cost = newCost;
            this.UpdateportfolioCost(newCost - oldCost);
            return np;
        },
        UpdateportfolioCost : function(amount){
            this.portfolio.purchaseValue += amount;
        },
        getPorofolioCost :  function(){
            return this.portfolio.purchaseValue;
        }
    };
    return np;
})();