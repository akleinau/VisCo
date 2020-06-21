dataType = "confirmed"

Rintervall = 7;


var formatDays = d3.timeFormat("%x");

var formatValue = d3.format("0.2r");

function checkCountry1(o) {
    return (o["Country/Region"].toLowerCase().replace(/\s+/g, '') == countryName1.toLowerCase().replace(/\s+/g, ''));
}

function checkCountry2(o) {
    return (o["Country/Region"].toLowerCase().replace(/\s+/g, '') == countryName2.toLowerCase().replace(/\s+/g, ''));
}

function checkCountry3(o) {
    return (o["Country/Region"].toLowerCase().replace(/\s+/g, '') == countryName3.toLowerCase().replace(/\s+/g, ''));
}

function checkCountry4(o) {
    return (o["Country/Region"].toLowerCase().replace(/\s+/g, '') == countryName4.toLowerCase().replace(/\s+/g, ''));
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

function initializeGraph() {

    if (document.getElementById("dataMode") !== null) {
        updateCompareGraph('germany');
        updateGlobalGraph();
    }
    else {
        setTimeout(initializeGraph, 250);
    }
}

function updateCompareGraph(view) {
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

    perPeople = false;


    if (view == "germany") dataType = document.getElementById("dataMode").value;
    if (view == "global") dataType = document.getElementById("dataModeGlobal").value;
    var link;
    if (dataType == "confirmed") link = urls.coronaWorldConfirmed;
    if (dataType == "recovered") link = urls.coronaWorldRecovered;
    if (dataType == "confirmed_per_100000") {
        link = urls.coronaWorldConfirmed;
        perPeople = true;
    }
    else if (dataType == "deaths") link = urls.coronaWorldDeaths;


    d3.csv(link, d3.autoType, function (dataUnsorted) {

        var data = sumUpStates(dataUnsorted);



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
        if (countryData1 == null) {
            countryData1 = data[62];
            countryName1 = "";
        }

        var countryData2 = data.find(checkCountry2);
        if (countryData2 == null) {
            countryData2 = countryData1;
            countryName2 = "";
        }

        var countryData3 = data.find(checkCountry3);
        if (countryData3 == null) {
            countryData3 = countryData1;
            countryName3 = "";
        }

        var countryData4 = data.find(checkCountry4);
        if (countryData4 == null) {
            countryData4 = countryData1;
            countryName4 = "";
        }
        var gd = [jsonCopy(countryData1), jsonCopy(countryData2), jsonCopy(countryData3), jsonCopy(countryData4)];
        for (var i = 0; i < 4; i++) {
            gd[i] = justData(gd[i]);
            gd[i] = entriesOfCountry(gd[i], oldest);
            if (perPeople) {
                for (var j = 0; j < gd[i].length; j++) {
                    gd[i][j].value /= 814;
                }
                console.log(gd[i]);
            }
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
                else {
                    r.push({ key: c[i].key, value: 0 });
                }
            }
            return r;
        }

        var RrateCountries = [Rrate(Rcountry[0]), Rrate(Rcountry[1]), Rrate(Rcountry[2]), Rrate(Rcountry[3])];

        var x = d3.scaleUtc()
            .domain(d3.extent(country[0], d => d.key))
            .range([margin.left, widthGraph - margin.right])

        var data0 = entriesOfCountry(justData(data[0]), oldest)
        document.getElementById("oldestDate").innerHTML = "&nbsp;" + formatDays(data0[0].key);

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
            .domain([0, maxValue(country)])
            .range([heightGraph2 - margin.bottom, margin.top])


        var RateY = d3.scaleLinear()
            .domain([minValue(RrateCountries), maxValue(RrateCountries)])
            .range([heightGraph2 - margin.bottom, margin.top])




        var tooltip = d3.select("#Gtooltip");

        function bisect(data, date) {
            const bisectDate = d3.bisector(d => d.key).left;
            const i = bisectDate(data, date, 1);
            const a = data[i - 1];
            const b = data[i];
            return date - a.key > b.key - date ? b.key : a.key;
        }



        strokeWidth = 2.0;
        var color1 = "#dd0273";
        var color2 = "#3005bc";
        var color3 = "#01aa97";
        var color4 = "#8e0050";

        function tooltipText(xPos) {

            var day = bisect(country[0], x.invert(xPos));
            var text = "<p style='color:black'>" + formatDays(day) + "</p>";
            if (countryName1 != "" && country[0].find(o => o.key.toString() == day.toString()) != undefined)
                text += "<p style='color:" + color1 + "'>" + country[0].find(o => o.key.toString() == day.toString()).value + "</p>";
            if (countryName2 != "") text += "<p style='color:" + color2 + "'>" + country[1].find(o => o.key.toString() == day.toString()).value + "</p>";
            if (countryName3 != "") text += "<p style='color:" + color3 + "'>" + country[2].find(o => o.key.toString() == day.toString()).value + "</p>";
            if (countryName4 != "") text += "<p style='color:" + color4 + "'>" + country[3].find(o => o.key.toString() == day.toString()).value + "</p>";

            return text;
        }



        d3.select("#compare-graph-2").remove();
        var svg = d3.select("#right-col-2").append("svg")
            .attr("id", "compare-graph-2")
            .attr("width", widthGraph)
            .attr("height", heightGraph2)
            .on("mouseover", function () { return tooltip.classed("hidden", !1); })
            .on("mousemove", function () {
                return tooltip.style("top", (event.pageY + 20) + "px")
                    .style("left", (event.pageX + 20) + "px")
                    .html(tooltipText(d3.mouse(this)[0]));
            })
            .on("mouseleave", function () { return tooltip.classed("hidden", !0); })


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
                .attr("stroke", color2)
                .attr("stroke-width", strokeWidth)
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
                .attr("stroke", color3)
                .attr("stroke-width", strokeWidth)
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
                .attr("stroke", color4)
                .attr("stroke-width", strokeWidth)
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
                .attr("stroke", color1)
                .attr("stroke-width", strokeWidth)
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
            document.getElementById("right-col-3").innerHTML = (view == "global" ? "> " : "") + "Reproduction Rate";
            ttext = "The Reproduction Rate states how many people one infected person will infect. A rate under 1 means the virus is subsiding."
            ttext +=" There are different ways to calculate the RRate, here it is calculated by comparing the newly infected people of one week with the week before."
            document.getElementById("right-col-3").innerHTML += " <button id='RepQuestion' onclick='toggleRepTooltip()'>?</button> <div id='RepTooltip'>" + ttext + "</div>"

            function RtooltipText(xPos) {

                var day = bisect(RrateCountries[0], x.invert(xPos));
                var text = "<p style='color:black'>" + formatDays(day) + "</p>";
                if (countryName1 != "" && RrateCountries[0].find(o => o.key.toString() == day.toString()) != undefined)
                    text += "<p style='color:" + color1 + "'>" + formatValue(RrateCountries[0].find(o => o.key.toString() == day.toString()).value) + "</p>";
                if (countryName2 != "") text += "<p style='color:" + color2 + "'>" + formatValue(RrateCountries[1].find(o => o.key.toString() == day.toString()).value) + "</p>";
                if (countryName3 != "") text += "<p style='color:" + color3 + "'>" + formatValue(RrateCountries[2].find(o => o.key.toString() == day.toString()).value) + "</p>";
                if (countryName4 != "") text += "<p style='color:" + color4 + "'>" + formatValue(RrateCountries[3].find(o => o.key.toString() == day.toString()).value) + "</p>";
                return text;
            }


            d3.select("#compare-graph-3").remove();
            svg = d3.select("#right-col-3").append("svg")
                .attr("id", "compare-graph-3")
                .attr("width", widthGraph)
                .attr("height", heightGraph2)
                .on("mouseover", function () { return tooltip.classed("hidden", !1); })
                .on("mousemove", function () {
                    return tooltip.style("top", (event.pageY + 20) + "px")
                        .style("left", (event.pageX + 20) + "px")
                        .html(RtooltipText(d3.mouse(this)[0]));
                })
                .on("mouseleave", function () { return tooltip.classed("hidden", !0); });


            svg.append("g")
                .attr("transform", `translate(0,${heightGraph2 - margin.bottom})`)
                .call(d3.axisBottom(x).ticks(widthGraph / 80).tickSizeOuter(0))

            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(RateY).tickFormat(function (d) { return formatValue(d) }))
                .call(g => g.select(".domain").remove())

            svg.append("path")
                .datum(data0)
                .attr("fill", "#ccf9c7")
                .attr("d", d3.area()
                    .x(function (d) { return x(d.key) })
                    .y0(function (d) { return RateY(minValue(RrateCountries)) })
                    .y1(function (d) { return RateY(1) })
                );

            if (countryName2 != "") {
                svg.append("path")
                    .datum(RrateCountries[1])
                    .attr("fill", "none")
                    .attr("stroke", color2)
                    .attr("stroke-width", strokeWidth)
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
                    .attr("stroke", color3)
                    .attr("stroke-width", strokeWidth)
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
                    .attr("stroke", color4)
                    .attr("stroke-width", strokeWidth)
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
                    .attr("stroke", color1)
                    .attr("stroke-width", strokeWidth)
                    .attr("stroke-miterlimit", 1)
                    .attr("d", d3.line()
                        .x(function (d) { return x(d.key) })
                        .y(function (d) { return RateY(d.value) })
                    );
            }

        }

        if (view === "global") {
            $("#compare-graph-3").hide();
        }
    });
}

function toggleRepGraph() {
    var icon = document.getElementById("view-image");
    if (icon.src.endsWith("images/germany.png")) {
        $("#compare-graph-3, #compare-graph-2").toggle();
    }
}

function toggleRepTooltip() {
    $("#RepTooltip").toggle();
    toggleRepGraph();
}