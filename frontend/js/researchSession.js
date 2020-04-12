let RS = (function(){
    let module ={};

    function newSession() {
        let rs = {
            stockDisplayList: [],           // list of stocks symbols that are displayed;

            stockNamesList:[],

            metricTableCurrStock: null,     // stock currenttly displayed in metric table

            metricTableCurrTab: 0,          // tab currenttly displayed in metric table
                                            // 0,1,2 = IS, BS, CF respectively

            series: [],                      // Contains Time sereies data for stock in stockDisplayList
            seriesType: "line",
            seriesTime: "line"
        };
        sessionStorage.setItem("RS",JSON.stringify(rs));
        return rs;
    }

    module.init = function(){
        let rs;
        if (!sessionStorage.getItem("RS")) rs = newSession();
        else rs = JSON.parse(sessionStorage.getItem("RS"));
        return rs;
    };
    module.update = function(rs){
        sessionStorage.setItem("RS",JSON.stringify(rs));
    };

    module.addStock = function(rs,symbol,name,series){
        rs.series.push(series);
        rs.stockDisplayList.push(symbol);
        rs.stockNamesList.push(name);
        rs.metricTableCurrStock = symbol;
        module.update(rs);
        return rs;
    };

    module.deleteStock = function(rs,symbol) {
        // remove symbol from list of stocks
        let index = rs.stockDisplayList.indexOf(symbol);
        if (index == -1) return api.notifyErrorListeners(`Cannot deleteStockFromDisplayList - ${symbol} is not in the list.`);
        rs.stockDisplayList.splice(index, 1);
        rs.stockNamesList.splice(index,1);
        rs.series = rs.series.filter(obj => (obj.name != symbol));
        // if list is empty, reset PAGE_INFO
        if (rs.stockDisplayList.length == 0) {
            // hide metric table, reset PAGE_INFO to default value
            FS.hideMetricsTable(this.id);
            return newSession();
        } 
        else {
            if (rs.metricTableCurrStock && rs.metricTableCurrStock.localeCompare(symbol) == 0){
                rs.metricTableCurrStock = rs.stockDisplayList[0];
            }
            module.update(rs);
            return rs;  
        }
    };

    module.changeStatement = function(rs, val){
        rs.metricTableCurrTab = val;
        module.update(rs);
        return rs;
    };
    module.changePlotType = function(rs,type,newSeries){
        rs.seriesType = type;
        rs.series = newSeries;
        module.update(rs);
        return rs;
    };

    module.changePlotTime = function(rs,time,newSeries){
        rs.seriesTime = time;
        rs.series = newSeries;
        module.update(rs);
        return rs;
    };

    module.rest = function(){
        let rs = newSession();
        return rs;
    };

    return module;
})();
