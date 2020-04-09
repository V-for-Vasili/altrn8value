let Graphing = (function(){
    let module ={};
    module.initPlot =function(id){
        // Initate Blank Canvas Where Historic Price Data will be loaded
    let plot = echarts.init(document.getElementById(id),'template', {
        //width: document.getElementById(id).offsetWidth,
        //height: document.getElementById(id).offsetHeight
        });
        return plot;
    };

    module.update =  function(chart,stocks,series){
        console.log("updateCalled");
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
                    start: 0,
                    end: 10
                }, {
                    start: 0,
                    end: 10,
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
    module.graphPorfolio = function(chart,porfolio){
        var porfolioDecomp = [];
        let stockList = porfolio.stocks.map(obj => {
            let rObj = obj.symbol;
            return rObj;
        });
        let url = "https://financialmodelingprep.com/api/v3/historical-price-full/" + stockList.toString();
        $.getJSON(url, function(response) {
            let rawData = response.historicalStockList;
            let datesClose = {};
            rawData.forEach(function(ts,index){

                let decompItem = {name:ts.symbol,type:'line',area:{}};
                let decompItemData = [];
                ts.historical.forEach(function(day){
                    decompItemData.push([day.date,day.close]);
                    (datesClose[day.date])? datesClose[day.date]+=day.close * porfolio.stocks[index].shares : datesClose[day.date] = day.close * porfolio.stocks[index].shares;
                });
                decompItem.data = decompItemData;
                porfolioDecomp.push(decompItem);
            });

            let totalPorfolio = {name:porfolio.name,type:'line',area:{}};
            let totalPorfolioData = [];
             Object.keys(datesClose).forEach(function(date){
                totalPorfolioData.push([date,datesClose[date]]);
                });
                totalPorfolio.data = totalPorfolioData;
                porfolioDecomp.push(totalPorfolio);
                console.log(totalPorfolio);
                module.update(chart,totalPorfolio.name,totalPorfolio);
            });

    };

    return module;
})();