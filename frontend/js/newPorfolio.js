/*jshint esversion: 6 */
let NP = (function(){
    let np = {
        porfolio : {
            stocks : [],
            cost : 0,
            created : new Date()
        },
        getPorfolio : function(){
            return this.porfolio;
        },
        addStock : function(name,symbol,price){
            let stockObj = {name:name,symbol:symbol,purchasePrice:price,shares:0,cost:0};
            this.porfolio.stocks.push(stockObj);
        },
        removeStock : function(symbol){
            this.porfolio.stocks = this.porfolio.stocks.filter(stockObj => stockObj.symbol == symbol);
        },
        updateStock : function(symbol,newShares,newCost){
            let idx = this.porfolio.stocks.findIndex(stockObj => stockObj.symbol == symbol);
            let oldCost = this.porfolio.stocks[idx].cost;
            this.porfolio.stocks[idx].shares = newShares;
            this.porfolio.stocks[idx].cost = newCost;
            this.UpdatePorfolioCost(newCost - oldCost);
            return np;
        },
        UpdatePorfolioCost : function(amount){
            this.porfolio.cost += amount;
        },
        getPorofolioCost :  function(){
            return this.porfolio.cost;
        }
    };
    return np;
})();