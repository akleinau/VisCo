dataType = "confirmed"

Rintervall = 7;

var toggled = false;
var toggleView;

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

console.log();
var heightGraph2 = parseInt(d3.select("body").style("height")) / 3.5;
var widthGraph2 = parseInt(d3.select("#graphs").style("width"));

var marginGraph2 = { top: 20, right: 30, bottom: 30, left: 70 };

function initializeGraph() {

    if (document.getElementById("dataMode") !== null && document.getElementById("dataModeGlobal") !== null) {
        updateCompareGraph('germany');
        updateGlobalGraph();
    }
    else {
        setTimeout(initializeGraph, 250);
    }
}

function updateCompareGraph(view) {

    toggleView = view;

    var oldest, dataType;
    if (view == "germany") {
        dataType = document.getElementById("dataMode").value;
        oldest = document.getElementById("oldestG").value;
    }
    if (view == "global") {
        dataType = document.getElementById("dataModeGlobal").value;
        oldest = document.getElementById("oldest").value;
    }


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
                //console.log(gd[i]);
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
            .range([marginGraph2.left, widthGraph2 - marginGraph2.right])

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
            .range([heightGraph2 - marginGraph2.bottom, marginGraph2.top])


        var RateY = d3.scaleLinear()
            .domain([0, maxValue(RrateCountries)])
            .range([heightGraph2 - marginGraph2.bottom, marginGraph2.top])


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
        var color3 = "#058bdb";
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
            .attr("width", widthGraph2)
            .attr("height", heightGraph2);

        svg.append("rect")
            .attr("class", "background")
            .attr("width", widthGraph2)
            .attr("height", heightGraph2);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${heightGraph2 - marginGraph2.bottom})`)
            .call(d3.axisBottom(x).ticks(widthGraph2 / 80).tickSizeOuter(0))

        svg.append("g")
            .call(g => g.select(".domain").remove())
            .attr("class", "axis")
            .attr("transform", `translate(${marginGraph2.left},0)`)
            .call(d3.axisLeft(y).ticks(heightGraph2 / 40))

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

        svg.append("rect")
            .attr("class", "graph-field")
            .attr("x", marginGraph2.left)
            .attr("y", marginGraph2.top)
            .attr("width", widthGraph2 - marginGraph2.left - marginGraph2.right)
            .attr("height", heightGraph2 - marginGraph2.top - marginGraph2.bottom)
            .attr("opacity", 1)
            .on("mouseover", function () { return tooltip.classed("hidden", !1); })
            .on("mousemove", function () {
                return tooltip.style("top", (event.pageY + 20) + "px")
                    .style("left", (event.pageX + 20) + "px")
                    .html(tooltipText(d3.mouse(this)[0]));
            })
            .on("mouseleave", function () { return tooltip.classed("hidden", !0); })


        if (dataType != "confirmed") {
            d3.select("#compare-graph-3").remove();
            document.getElementById("reproduction-name-gl").innerHTML = "";
            document.getElementById("reproduction-name-gl").style.display = "none";
        } else {
            document.getElementById("reproduction-name-gl").style.display = "block";
            document.getElementById("reproduction-name-gl").innerHTML = /*(view == "global" ? "> " : "") + */"Reproduction Rate";
            ttext = "The reproduction rate states how many people on average one infected person will infect. A rate under 1 means the virus is subsiding."
            ttext += " There are different ways to calculate the reproduction rate, here it is calculated by comparing the newly infected people of one week with the newly infected of the week before."
            document.getElementById("reproduction-name-gl").innerHTML += " <button id='RepQuestion' onclick='toggleRepTooltip()'>?</button> <div id='RepTooltip'>" + ttext + "</div>"

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
                .attr("width", widthGraph2)
                .attr("height", heightGraph2)


            svg.append("rect")
                .attr("class", "background")
                .attr("width", widthGraph2)
                .attr("height", heightGraph2);

            svg.append("g")
                .attr("class", "axis")
                .attr("transform", `translate(0,${heightGraph2 - marginGraph2.bottom})`)
                .call(d3.axisBottom(x).ticks(widthGraph2 / 80).tickSizeOuter(0))

            svg.append("g")
                .call(g => g.select(".domain").remove())
                .attr("class", "axis")
                .attr("transform", `translate(${marginGraph2.left},0)`)
                .call(d3.axisLeft(RateY).tickFormat(function (d) { return formatValue(d) }))

            svg.append("path")
                .datum(data0)
                .attr("fill", "#ccf9c7")
                .attr("d", d3.area()
                    .x(function (d) { return x(d.key) })
                    .y0(function (d) { return RateY(0) })
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

            svg.append("rect")
                .attr("class", "graph-field")
                .attr("x", marginGraph2.left)
                .attr("y", marginGraph2.top)
                .attr("width", widthGraph2 - marginGraph2.left - marginGraph2.right)
                .attr("height", heightGraph2 - marginGraph2.top - marginGraph2.bottom)
                .attr("opacity", 0)
                .on("mouseover", function () { return tooltip.classed("hidden", !1); })
                .on("mousemove", function () {
                    return tooltip.style("top", (event.pageY + 20) + "px")
                        .style("left", (event.pageX + 20) + "px")
                        .html(RtooltipText(d3.mouse(this)[0]));
                })
                .on("mouseleave", function () { return tooltip.classed("hidden", !0); });

        }

        if (view === "global" && toggled === true) {
            $("#compare-graph-2").hide();
        }
        if (view === "global" && toggled === false) {
            $("#compare-graph-3").hide();
        }
    });

}

function toggleRepGraph(trigger) {
    if (toggleView === "global") {
        if ((trigger == 'compare' && toggled) || (trigger == 'rep' && !toggled)) {
            if (toggled === false) {
                toggled = true;


                document.getElementById('germany-compare').style.backgroundColor = "#e0e0e0";
                document.getElementById('germany-compare').style.color = "#505050";
                document.getElementById("germany-compare").style.border = "thin solid #4b4b4b";

                document.getElementById('reproduction-name-gl').style.backgroundColor = "#505050";
                document.getElementById('reproduction-name-gl').style.color = "#e0e0e0";
                document.getElementById("reproduction-name-gl").style.border = "none";
            }
            else {
                toggled = false;
                document.getElementById('germany-compare').style.backgroundColor = "#505050";
                document.getElementById('germany-compare').style.color = "#e0e0e0";
                document.getElementById("germany-compare").style.border = "none";
                document.getElementById("germany-compare").style.borderBottom = "thin solid #e0e0e0";

                document.getElementById('reproduction-name-gl').style.backgroundColor = "#e0e0e0";
                document.getElementById('reproduction-name-gl').style.color = "#505050";
                document.getElementById("reproduction-name-gl").style.border = "thin solid #4b4b4b";
            }
            var icon = document.getElementById("view-image");
            if (icon.src.endsWith("images/germany.png")) {
                $("#compare-graph-3, #compare-graph-2").toggle();
            }
        }
    }
}

function toggleRepTooltip() {
    $("#RepTooltip").toggle();
    toggleRepGraph('rep')
}

var sliderGermany = $("#oldestG");
var sliderGlobal = $("#oldest");
var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";

function moveSliderGermany(e) {
    var zoomLevel = parseInt(sliderGermany.val());

    // detect positive or negative scrolling
    if (e.originalEvent.wheelDelta < 0) {
        //scroll down
        sliderGermany.val(zoomLevel - 2);
    } else {
        //scroll up
        sliderGermany.val(zoomLevel + 2);
    }

    // trigger the change event
    sliderGermany.trigger('change');

    //prevent page fom scrolling
    return false;
}

function moveSliderGlobal(e) {
    var zoomLevel = parseInt(sliderGlobal.val());

    // detect positive or negative scrolling
    if (e.originalEvent.wheelDelta < 0) {
        //scroll down
        sliderGlobal.val(zoomLevel - 2);
    } else {
        //scroll up
        sliderGlobal.val(zoomLevel + 2);
    }

    // trigger the change event
    sliderGlobal.trigger('change');

    //prevent page fom scrolling
    return false;
}

sliderGermany.on('mouseover', function () {
    sliderGermany.bind(mousewheelevt, moveSliderGermany);

});

sliderGlobal.on('mouseover', function () {
    sliderGlobal.bind(mousewheelevt, moveSliderGlobal);

});