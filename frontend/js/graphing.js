const width_threshold = 480;

function drawLineChart() {
    if ($("#lineChart").length) {
        ctxLine = document.getElementById("lineChart").getContext("2d");
        optionsLine = {
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Price"
                    }
                }]
            }
        };

        // Set aspect ratio based on window width
        optionsLine.maintainAspectRatio =
            $(window).width() < width_threshold ? false : true;

        configLine = {
            type: "line",
            data: {
                labels: [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July"
                ],
                datasets: [{
                        label: "Stock A",
                        data: [88, 68, 79, 57, 50, 55, 70],
                        fill: false,
                        borderColor: "rgb(75, 192, 192)",
                        cubicInterpolationMode: "monotone",
                        pointRadius: 0
                    },
                    {
                        label: "Stock B",
                        data: [33, 45, 37, 21, 55, 74, 69],
                        fill: false,
                        borderColor: "rgba(255,99,132,1)",
                        cubicInterpolationMode: "monotone",
                        pointRadius: 0
                    },
                    {
                        label: "Stock C",
                        data: [44, 19, 38, 46, 85, 66, 79],
                        fill: false,
                        borderColor: "rgba(153, 102, 255, 1)",
                        cubicInterpolationMode: "monotone",
                        pointRadius: 0
                    }
                ]
            },
            options: optionsLine
        };

        lineChart = new Chart(ctxLine, configLine);
    }
}

function updateLineChart() {
    if (lineChart) {
        lineChart.options = optionsLine;
        lineChart.update();
    }
}