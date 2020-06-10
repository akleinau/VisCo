var height = 240;

var width = 500;

var margin = { top: 20, right: 30, bottom: 30, left: 70 };

function formatDays() {
    return d3.timeFormat("%x");
}

function updateGlobalGraph() {

    var dataType =  document.getElementById("dataType").value;
    var link;
    if (dataType == "confirmed") link = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
    else if (dataType == "recovered") link = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv";
    else if (dataType == "deaths") link = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";
    d3.csv(link, d3.autoType, function (data) {

        var gd = data[0];
        delete gd["Country/Region"];
        delete gd["Province/State"];
        delete gd.Lat;
        delete gd.Long;
        
        var e = d3.entries(gd);

        for (var i in e) {
            e[i].key = new Date(e[i].key);
        }

        var globalDates = e;

        var arrayG = [];
        for (const i of data) {
            var gd = i;
            delete gd["Country/Region"];
            delete gd["Province/State"];
            delete gd.Lat;
            delete gd.Long;
            arrayG.push(d3.values(gd));
        }

         for (var i = 1; i < arrayG.length; i++) {

            for (var j = 0; j < arrayG[j].length; j++) {
                arrayG[0][j] = parseInt(arrayG[i][j]) + parseInt(arrayG[0][j]);
            }
        } 

        var globalValues = arrayG[0];


        for (var i = 0; i < globalDates.length; i++) {
            globalDates[i].value = globalValues[i];
        }
        var global = globalDates;


        var x = d3.scaleUtc()
            .domain(d3.extent(global, d => d.key))
            .range([margin.left, width - margin.right])

        var y = d3.scaleLinear()
            .domain([0, d3.max(global, d => d.value) + 1000000])
            .range([height - margin.bottom, margin.top])

        d3.select("#globalGraph").remove();
        var svg = d3.select("#rightCol").append("svg")
            .attr("id", "globalGraph")
            .attr("width", width)
            .attr("height", height);


        svg.append("g")
            .call(g => g.select(".domain").remove())
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(height / 40));

        svg.append("path")
            .datum(global)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("stroke-miterlimit", 1)
            .attr("d", d3.line()
                .x(function (d) { return x(d.key) })
                .y(function (d) { return y(d.value) })
            )

    });
}