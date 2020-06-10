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


var height = 240;
var width = 500;

var margin = { top: 20, right: 10, bottom: 30, left: 80 }


function updateCompareGraph() {

    var oldest = document.getElementById("oldest").value; 

    countryName1 = document.getElementById("country1").value;
    countryName2 = document.getElementById("country2").value;
    countryName3 = document.getElementById("country3").value;
    countryName4 = document.getElementById("country4").value;

    var dataType = document.getElementById("dataType").value;
    var link;
    if (dataType == "confirmed") link = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
    else if (dataType == "recovered") link = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv";
    else if (dataType == "deaths") link = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";
    d3.csv(link, d3.autoType, function (dataUnsorted) {

        var sorted = [];
        sorted.push(dataUnsorted[0]);
        for (var i = 1; i < dataUnsorted.length; i++) {
            if (!sameCountry(sorted[sorted.length - 1], dataUnsorted[i])) {
                sorted.push(dataUnsorted[i]);
                var s = sorted[sorted.length - 1];
                s["Province/State"] = null;
            }
            else {
                for (var x in dataUnsorted[i]) {
                    if (x != "Province/State" && x != "Country/Region" && x != "Lat" && x != "Long") {
                        var old = sorted[sorted.length - 1];
                        var added = dataUnsorted[i];
                        old[x] += added[x];
                    }
                }
            }
        }
        var data = sorted;

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
            .range([margin.left, width - margin.right])

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
            .range([height - margin.bottom, margin.top])


        var RateY = d3.scaleLinear()
            .domain([minValue(RrateCountries), maxValue(RrateCountries)])
            .range([height - margin.bottom, margin.top])


        function formatDays() {
            return d3.timeFormat("%x");
        }
        function formatValue(d) {
            // return d3.format("0.2r");
            return d;
        }

        d3.select("#compareGraph2").remove();
        var svg = d3.select("#rightCol2").append("svg")
            .attr("id", "compareGraph2")
            .attr("width", width)
            .attr("height", height);


        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(height / 40))
            .call(g => g.select(".domain").remove())


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

        svg.append("path")
            .datum(country[0])
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("stroke-miterlimit", 1)
            .attr("d", d3.line()
                .x(function (d) { return x(d.key) })
                .y(function (d) { return y(d.value) })
            );

        if (dataType != "confirmed") {
            d3.select("#compareGraph3").remove();
        } else {
            d3.select("#compareGraph3").remove();
            svg = d3.select("#rightCol3").append("svg")
                .attr("id", "compareGraph3")
                .attr("width", width)
                .attr("height", height);


            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(RateY).tickFormat(function (d) { return formatValue(d) }))
                .call(g => g.select(".domain").remove())


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

            svg.append("path")
                .datum(RrateCountries[0])
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("stroke-miterlimit", 1)
                .attr("d", d3.line()
                    .x(function (d) { return x(d.key) })
                    .y(function (d) { return RateY(d.value) })
                );

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
    //change to d3
//    return Object.assign(html`<svg viewBox="0 0 ${width} ${height}">
 // <path d="${line(country[3])}" fill="none" stroke="steelblue" stroke-width="1.5" stroke-miterlimit="1"></path>
 // <path d="${line(country[2])}" fill="none" stroke="orange" stroke-width="1.5" stroke-miterlimit="1"></path>
//  <path d="${line(country[1])}" fill="none" stroke="green" stroke-width="1.5" stroke-miterlimit="1"></path>
//  <path d="${line(country[0])}" fill="none" stroke="red" stroke-width="1.5" stroke-miterlimit="1"></path>
//  ${d3.select(svg`<g>`).call(xAxis).node()}
 // ${d3.select(svg`<g>`).call(yAxis).node()}
//</svg>`

