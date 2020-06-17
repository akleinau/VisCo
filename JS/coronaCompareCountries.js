dataType = "confirmed"

Rintervall = 7;

function checkCountry1(o) {
    return (o["Country/Region"] == countryName1);
}

function checkCountry2(o) {
    return (o["Country/Region"] == countryName2);
}

function checkCountry3(o) {
    return (o["Country/Region"] == countryName3);
}

function checkCountry4(o) {
    return (o["Country/Region"] == countryName4);
}

function sameCountry(c1, c2) {
    return (c1["Country/Region"] == c2["Country/Region"]);
}

function jsonCopy(src) {
    return JSON.parse(JSON.stringify(src));
}


var heightGraph2 = 240;
var widthGraph = parseInt(d3.select("#graphs").style("width"));

var margin = { top: 20, right: 10, bottom: 30, left: 80 }


function updateCompareGraph() {

    var oldest = document.getElementById("oldest").value;

    if (!document.getElementById("view-image").src.endsWith('images/germany.png')) {
        countryName1 = "Germany";
        countryName2 = "";
        countryName3 = "";
        countryName4 = "";
    }
    else {
        countryName1 = document.getElementById("country1").value;
        countryName2 = document.getElementById("country2").value;
        countryName3 = document.getElementById("country3").value;
        countryName4 = document.getElementById("country4").value;
    }

    var dataType = document.getElementById("data-type").value;
    var link;
    if (dataType == "confirmed") link = urls.coronaWorldConfirmed;
    else if (dataType == "recovered") link = urls.coronaWorldRecovered;
    else if (dataType == "deaths") link = urls.coronaWorldDeaths;
 
   
    d3.csv(link, d3.autoType, function (dataUnsorted) {

        data = sumUpStates(dataUnsorted);

        function justData(c) {
            delete c["Country/Region"];
            delete c["Province/State"];
            delete c.Lat;
            delete c.Long;
            return c
        }

        function entriesOfCountry(c, o) {
            var e = d3.entries(c);
            var entries = [];
            for (var i = 0; i < e.length; i++) {
                if (i >= o)
                    entries.push({ key: new Date(e[i].key), value: parseInt(e[i].value) });
            }
            return entries;
        }

        var countryData1 = data.find(checkCountry1);
        if (countryData1 == null) countryData1 = data[62];

        var countryData2 = data.find(checkCountry2);
        if (countryData2 == null) countryData2 = countryData1

        var countryData3 = data.find(checkCountry3);
        if (countryData3 == null) countryData3 = countryData1

        var countryData4 = data.find(checkCountry4);
        if (countryData4 == null) countryData4 = countryData1

        var gd = [jsonCopy(countryData1), jsonCopy(countryData2), jsonCopy(countryData3), jsonCopy(countryData4)];
        for (var i = 0; i < 4; i++) {
            gd[i] = justData(gd[i]);
            gd[i] = entriesOfCountry(gd[i], oldest);
        }
        var country = gd;

        gd = [jsonCopy(countryData1), jsonCopy(countryData2), jsonCopy(countryData3), jsonCopy(countryData4)];
        for (var i = 0; i < 4; i++) {
            gd[i] = justData(gd[i]);
            gd[i] = entriesOfCountry(gd[i], Math.max(0, oldest - (2 * Rintervall - 1)));
        }
        var Rcountry = gd;

        function Rrate(c) {
            var r = [];
            for (var i = 2 * Rintervall - 1; i < c.length; i++) {
                var oldR = Math.max(0, c[i - Rintervall].value - c[i - Rintervall - (Rintervall - 1)].value);

                var newR = Math.max(0, c[i].value - c[i - (Rintervall - 1)].value);
                if (oldR != 0) {
                    r.push({ key: c[i].key, value: newR / oldR });
                }
            }
            return r;
        }

        var RrateCountries = [Rrate(Rcountry[0]), Rrate(Rcountry[1]), Rrate(Rcountry[2]), Rrate(Rcountry[3])];

        var x = d3.scaleUtc()
            .domain(d3.extent(country[0], d => d.key))
            .range([margin.left, widthGraph - margin.right])

        var data0 = entriesOfCountry(justData(data[0]), oldest)


        function maxValue(a4) {
            var max = [d3.max(a4[0], d => d.value),
            d3.max(a4[1], d => d.value),
            d3.max(a4[2], d => d.value),
            d3.max(a4[3], d => d.value)];
            return d3.max(max);
        }

        function minValue(a4) {
            var min = [d3.min(a4[0], d => d.value),
            d3.min(a4[1], d => d.value),
            d3.min(a4[2], d => d.value),
            d3.min(a4[3], d => d.value)];
            return d3.min(min);
        }

        var y = d3.scaleLinear()
            .domain([0, maxValue(country) + 10000])
            .range([heightGraph2 - margin.bottom, margin.top])


        var RateY = d3.scaleLinear()
            .domain([minValue(RrateCountries), maxValue(RrateCountries)])
            .range([heightGraph2 - margin.bottom, margin.top])


        var formatDays = d3.timeFormat("%x");

        var formatValue = d3.format("0.2r");


        var tooltip = d3.select("#right-col-2").append("div")
            .attr("class", "Tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("color", "black")
            .attr("width", "100px")
            .attr("height", "100px")

        function bisect(data, date) {
            const bisectDate = d3.bisector(d => d.key).left;
            const i = bisectDate(data, date, 1);
            const a = data[i - 1];
            const b = data[i];
            return date - a.key > b.key - date ? b.key : a.key;
        }


        function tooltipText(xPos) {

            var day = bisect(country[0], x.invert(xPos));
            var text = "<p style='color:black'>" + formatDays(day) + "</p>";
            if (countryName1 != "" && country[0].find(o => o.key.toString() == day.toString()) != undefined)
                text += "<p style='color:steelblue'>" + country[0].find(o => o.key.toString() == day.toString()).value + "</p>";
            if (countryName2 != "") text += "<p style='color:orange'>" + country[1].find(o => o.key.toString() == day.toString()).value + "</p>";
            if (countryName3 != "") text += "<p style='color:red'>" + country[2].find(o => o.key.toString() == day.toString()).value + "</p>";
            if (countryName4 != "") text += "<p style='color:green'>" + country[3].find(o => o.key.toString() == day.toString()).value + "</p>";

            return text;
        }


        d3.select("#compare-graph-2").remove();
        var svg = d3.select("#right-col-2").append("svg")
            .attr("id", "compare-graph-2")
            .attr("width", widthGraph)
            .attr("height", heightGraph2)
            .on("mouseover", function () { return tooltip.style("visibility", "visible"); })
            .on("mousemove", function () {
                return tooltip.style("top", (d3.mouse(this)[1] + 300) + "px")
                    .style("left", (d3.mouse(this)[0]) + "px")
                    .html(tooltipText(d3.mouse(this)[0]));
            })
            .on("mouseleave", function () { return tooltip.style("visibility", "hidden"); });


        svg.append("g")
            .attr("transform", `translate(0,${heightGraph2 - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(widthGraph / 80).tickSizeOuter(0))

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(heightGraph2 / 40))
            .call(g => g.select(".domain").remove())

        if (countryName2 != "") {
            svg.append("path")
                .datum(country[1])
                .attr("fill", "none")
                .attr("stroke", "orange")
                .attr("stroke-width", 1.5)
                .attr("stroke-miterlimit", 1)
                .attr("d", d3.line()
                    .x(function (d) { return x(d.key) })
                    .y(function (d) { return y(d.value) })
                );
        }
        if (countryName3 != "") {
            svg.append("path")
                .datum(country[2])
                .attr("fill", "none")
                .attr("stroke", "green")
                .attr("stroke-width", 1.5)
                .attr("stroke-miterlimit", 1)
                .attr("d", d3.line()
                    .x(function (d) { return x(d.key) })
                    .y(function (d) { return y(d.value) })
                );
        }
        if (countryName4 != "") {
            svg.append("path")
                .datum(country[3])
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-width", 1.5)
                .attr("stroke-miterlimit", 1)
                .attr("d", d3.line()
                    .x(function (d) { return x(d.key) })
                    .y(function (d) { return y(d.value) })
                );
        }
        if (countryName1 != "") {
            svg.append("path")
                .datum(country[0])
                .attr("fill", "none")
                .attr("stroke", "#c51b8a")
                .attr("stroke-width", 1.5)
                .attr("stroke-miterlimit", 1)
                .attr("d", d3.line()
                    .x(function (d) { return x(d.key) })
                    .y(function (d) { return y(d.value) })
                );
        }

        if (dataType != "confirmed") {
            d3.select("#compare-graph-3").remove();
            document.getElementById("right-col-3").innerHTML = "";
        } else {
            document.getElementById("right-col-3").innerHTML = "Reproduction Rate";

            var Rtooltip = d3.select("#right-col-2").append("div")
                .attr("class", "Tooltip")
                .style("position", "absolute")
                .style("visibility", "hidden")
                .style("color", "black")
                .attr("width", "100px")
                .attr("height", "100px")

            function RtooltipText(xPos) {

                var day = bisect(RrateCountries[0], x.invert(xPos));
                var text = "<p style='color:black'>" + formatDays(day) + "</p>";
                if (countryName1 != "" && RrateCountries[0].find(o => o.key.toString() == day.toString()) != undefined)
                    text += "<p style='color:#c51b8a'>" + RrateCountries[0].find(o => o.key.toString() == day.toString()).value + "</p>";
                if (countryName2 != "") text += "<p style='color:orange'>" + RrateCountries[1].find(o => o.key.toString() == day.toString()).value + "</p>";
                if (countryName3 != "") text += "<p style='color:red'>" + RrateCountries[2].find(o => o.key.toString() == day.toString()).value + "</p>";
                if (countryName4 != "") text += "<p style='color:green'>" + RrateCountries[3].find(o => o.key.toString() == day.toString()).value + "</p>";
                return text;
            }


            d3.select("#compare-graph-3").remove();
            svg = d3.select("#right-col-3").append("svg")
                .attr("id", "compare-graph-3")
                .attr("width", widthGraph)
                .attr("height", heightGraph2)
                .on("mouseover", function () { return Rtooltip.style("visibility", "visible"); })
                .on("mousemove", function () {
                    return Rtooltip.style("top", (d3.mouse(this)[1] + 550) + "px")
                        .style("left", (d3.mouse(this)[0]) + "px")
                        .html(RtooltipText(d3.mouse(this)[0]));
                })
                .on("mouseleave", function () { return Rtooltip.style("visibility", "hidden"); });


            svg.append("g")
                .attr("transform", `translate(0,${heightGraph2 - margin.bottom})`)
                .call(d3.axisBottom(x).ticks(widthGraph / 80).tickSizeOuter(0))

            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(RateY).tickFormat(function (d) { return formatValue(d) }))
                .call(g => g.select(".domain").remove())

            if (countryName2 != "") {
                svg.append("path")
                    .datum(RrateCountries[1])
                    .attr("fill", "none")
                    .attr("stroke", "orange")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-miterlimit", 1)
                    .attr("d", d3.line()
                        .x(function (d) { return x(d.key) })
                        .y(function (d) { return RateY(d.value) })
                    );
            }
            if (countryName3 != "") {
                svg.append("path")
                    .datum(RrateCountries[2])
                    .attr("fill", "none")
                    .attr("stroke", "green")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-miterlimit", 1)
                    .attr("d", d3.line()
                        .x(function (d) { return x(d.key) })
                        .y(function (d) { return RateY(d.value) })
                    );
            }
            if (countryName4 != "") {
                svg.append("path")
                    .datum(RrateCountries[3])
                    .attr("fill", "none")
                    .attr("stroke", "red")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-miterlimit", 1)
                    .attr("d", d3.line()
                        .x(function (d) { return x(d.key) })
                        .y(function (d) { return RateY(d.value) })
                    );
            }
            if (countryName1 != "") {
                svg.append("path")
                    .datum(RrateCountries[0])
                    .attr("fill", "none")
                    .attr("stroke", "#c51b8a")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-miterlimit", 1)
                    .attr("d", d3.line()
                        .x(function (d) { return x(d.key) })
                        .y(function (d) { return RateY(d.value) })
                    );
            }
            svg.append("path")
                .datum(data0)
                .attr("fill", "green")
                .attr("opacity", "0.2")
                .attr("d", d3.area()
                    .x(function (d) { return x(d.key) })
                    .y0(function (d) { return RateY(minValue(RrateCountries)) })
                    .y1(function (d) { return RateY(1) })
                );
        }
    });

}


