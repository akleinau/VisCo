

var widthGraph = parseInt(d3.select("#graphs").style("width"));
var heightGraph1 = 240;
var margin = { top: 20, right: 30, bottom: 30, left: 70 };

var formatDays = d3.timeFormat("%x");


function updateGlobalGraph() {

    var oldest = document.getElementById("oldest").value;
    var dataType = document.getElementById("change-data").value;
    console.log(dataType);
    var link;
    if (dataType == "confirmed") link = urls.coronaWorldConfirmed;
    else if (dataType == "recovered") link = urls.coronaWorldRecovered;
    else if (dataType == "deaths") link = urls.coronaWorldDeaths;
    d3.csv(link, d3.autoType, function (data) {


        //structure data
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

        var global = [];

        for (var i = oldest; i < globalDates.length; i++) {
            globalDates[i].value = globalValues[i];
            global.push(globalDates[i]);
        }

        document.getElementById("GlobalLastUpdated").innerHTML = "Last updated: " + formatDays(global[global.length-1].key);

        //create graph
        var x = d3.scaleUtc()
            .domain(d3.extent(global, d => d.key))
            .range([margin.left, widthGraph - margin.right])

        var y = d3.scaleLinear()
            .domain([0, d3.max(global, d => d.value) + 1000000])
            .range([heightGraph1 - margin.bottom, margin.top])

        var tooltip = d3.select("#Gtooltip");

            function bisect(data, date) {
                const bisectDate = d3.bisector(d => d.key).left;
                const i = bisectDate(data, date, 1);
                  const a = data[i - 1];
                  const b = data[i];   
                  return date - a.key > b.key - date ? b : a;
              }


        function tooltipText(xPos) {

            day = bisect(global, x.invert(xPos));

            return "<p style='color:black'>" + formatDays(day.key)+ ' <br> ' + day.value + "</p>";
        }

        d3.select("#global-graph").remove();


        var svg = d3.select("#right-col-1").append("svg")
            .attr("id", "global-graph")
            .attr("width", widthGraph)
            .attr("height", heightGraph1)
            .on("mouseover", function () { return  tooltip.classed("hidden", !1); })
            .on("mousemove", function () {
                return tooltip.style("top", (event.pageY + 20) + "px")
                    .style("left", (event.pageX + 20) + "px")
                    .html(tooltipText(d3.mouse(this)[0]));
            })
            .on("mouseleave", function () { return  tooltip.classed("hidden", !0); })


        svg.append("g")
            .call(g => g.select(".domain").remove())
            .attr("transform", `translate(0,${heightGraph1 - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(widthGraph / 80).tickSizeOuter(0));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(heightGraph1 / 40));

        svg.append("path")
            .datum(global)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 5)
            .attr("stroke-miterlimit", 1)
            .attr("d", d3.line()
                .x(function (d) { return x(d.key) })
                .y(function (d) { return y(d.value) })
            )



    });
}