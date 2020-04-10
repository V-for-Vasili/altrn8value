let Graphing = (function(){
    let module = {};

    module.initPlot =function(id){
        // Initate Blank Canvas Where Historic Price Data will be loaded
        let plot = echarts.init(document.getElementById(id),'template', {
            //width: document.getElementById(id).offsetWidth,
            //height: document.getElementById(id).offsetHeight
        });
        window.onresize = function() {
            plot.resize();
        };
        return plot;
    };

    module.update =  function(chart,stocks,series){
        let option;
        if (stocks.length == 0){
           option = {
                title: {
                    show: true,
                    textStyle:{
                      fontSize:20
                    },
                    text: "No Stocks Selected",
                    left:'center',
                    top: 'center'
                  },
                legend: {
                    data: stocks,
                    top:'10%'
                },
                series: []
            };
        } else {
            option = {
                title: {
                    text: "Historic Price",
                    textStyle:{fontFamily:'Roboto, Helvetica'}, 
                    top: '5%',
                    left: '5%'
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: stocks,
                    top:'10%'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '12%',
                    containLabel: true
                },
                toolbox: {
                    feature: {
                        dataZoom: {yAxisIndex: 'none'},
                        restore: {},
                        //saveAsImage: {}
                    }
                },
                xAxis: {
                    type: 'time',
                    boundaryGap: false,
                },
                yAxis: {
                    type: 'value',
                    boundaryGap: [0, '100%']
                },
                dataZoom: [{
                    type: 'inside',
                    start: 80,
                    end: 100
                }, {
                    start: 80,
                    end: 100,
                    dataBackground:{
                        lineStyle:{color:'#fff',shadowColor:'#fff'},
                        areaStyle:{color: '#rgb(245, 166, 35)',opacity:1}
                    },
                    fillerColor:'rgb(245, 166, 35,.25)',
                    handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    handleSize: '80%',
                    handleStyle: {
                        color: '#fff',
                        shadowBlur: 3,
                        shadowColor: 'rgba(0, 0, 0, 0.6)',
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    }
                }],
                series:series
            };
        }
        chart.setOption(option,true);
    };
    module.addSeries = function(chart,sereiesName,TSData){
        let prevOption = chart.getOption();
        let names = [];
        let sereies = [];
        if(prevOption){
            
            names = prevOption.legend[0].data;
            if (names.includes(sereiesName)) return;
            sereies = prevOption.series;
        }
        names.push(sereiesName);
        sereies.push(TSData);
        
        module.update(chart,names,sereies);
    };
    module.removeSeries = function(chart,sereiesName){
        if (!chart) return;
        let prevOption = chart.getOption();
        let names = [];
        let sereies = [];
        if(prevOption){
            names = prevOption.legend[0].data.filter(obj => obj != sereiesName);
            sereies = prevOption.series.filter(obj => obj.name != sereiesName);
            module.update(chart,names,sereies);
        }
       
    };

    module.graphPortfolio = function(chart,portfolioName){ 
        let prevOption = chart.getOption();
        if (prevOption){
            names = prevOption.legend[0].data;
            if (names.includes(portfolioName)) return;
        }
        var portfolioDecomp = [];
       api.getPortfolioHistoryByName(portfolioName,function(response) {
           let portfolio = response.data.portfolio;
           let stock_list = portfolio.stock_list;
           let allStocksHistory = stock_list.map(obj => {
               let rObj = {};
               rObj.symbol = obj.stock.symbol;
               rObj.historical = obj.stock.history;
               return rObj;
           });
           
            let datesClose = {};
            allStocksHistory.forEach(function(ts,index){
                let decompItem = {name:ts.symbol,type:'line',area:{}};
                let decompItemData = [];
                ts.historical.forEach(function(day){
                    decompItemData.push([day.date,day.close]);
                    if (datesClose[day.date])
                        datesClose[day.date] += day.close * portfolio.stock_list[index].shares;
                    else
                        datesClose[day.date] = day.close * portfolio.stock_list[index].shares;
                });
                decompItem.data = decompItemData;
                portfolioDecomp.push(decompItem);
            });

            let totalPortfolio = {name:portfolioName,type:'line',area:{}};
            let totalPortfolioData = [];
             Object.keys(datesClose).forEach(function(date){
                totalPortfolioData.push([date,datesClose[date]]);
                });
                totalPortfolio.data = totalPortfolioData;
                portfolioDecomp.push(totalPortfolio);
                module.addSeries(chart,totalPortfolio.name,totalPortfolio);
            });
    };

    module.graphPortfolios = function(chart, portfolioNames){
        portfolioNames.forEach(function(name){
            module.graphPortfolio(chart,name);
        });
    };

    return module;
})();