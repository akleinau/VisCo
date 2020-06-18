

var marginGlobe = { top: 10, left: 10, bottom: 10, right: 10 },
    widthGlobe = parseInt(d3.select("#map-globe").style("width")),
    mapRatioGlobe = .8,
    heightGlobe = widthGlobe * mapRatioGlobe;


/* var keyArray = ["Fallzahl", "Death", "Fallzahl_pro_100000_EW"];
var selectedData = keyArray[0]; */


var projectionGlobe = d3.geoOrthographic()
    .scale((heightGlobe - 100) / 2)
    .translate([widthGlobe / 2, heightGlobe / 2])
    .clipAngle(90);

//d3.select(window).on("resize", resize);

var geoPathGlobe = d3.geoPath().projection(projectionGlobe);

var graticuleGlobe = d3.geoGraticule();

var svgGlobe = d3.select("#map-globe")
    .append("svg")
    .attr("id", "map-globe-container")
    .style('height', heightGlobe + 'px')
    .style('width', widthGlobe + 'px');

svgGlobe.append("rect")
    .attr("class", "background")
    .attr("width", "100%")
    .attr("height", "100%");

svgGlobe.call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged));

var countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip");

d3.queue()
    .defer(d3.json, urls.countries)
    .defer(d3.csv, urls.coronaWorldConfirmed)
    .await(buildGlobalMap);

function buildGlobalMap(err, countries, coronaData) {

    var ocean_fill = svgGlobe.append("defs").append("radialGradient")
        .attr("id", "ocean_fill")
        .attr("cx", "75%")
        .attr("cy", "25%");

    ocean_fill.append("stop").attr("offset", "1%").attr("stop-color", "#ddf");
    ocean_fill.append("stop").attr("offset", "100%").attr("stop-color", "#ffffff");

    var globe_highlight = svgGlobe.append("defs").append("radialGradient")
        .attr("id", "globe_highlight")
        .attr("cx", "75%")
        .attr("cy", "25%");
    globe_highlight.append("stop")
        .attr("offset", "1%").attr("stop-color", "#ffd")
        .attr("stop-opacity", "0.6");
    globe_highlight.append("stop")
        .attr("offset", "100%").attr("stop-color", "#ba9")
        .attr("stop-opacity", "0.1");

    var globe_shading = svgGlobe.append("defs").append("radialGradient")
        .attr("id", "globe_shading")
        .attr("cx", "50%")
        .attr("cy", "40%");
    globe_shading.append("stop")
        .attr("offset", "50%").attr("stop-color", "#9ab")
        .attr("stop-opacity", "0")
    globe_shading.append("stop")
        .attr("offset", "100%").attr("stop-color", "#3e6184")
        .attr("stop-opacity", "0.3")

    var sortedData = sumUpStates(coronaData);

    // columns of the table
    var keys = d3.keys(sortedData[0]);

    var countryValues = {};
    var globeFeatures = countries.features;

    //map each country and the last date value
    sortedData.map(function (d) {
        countryValues[d["Country/Region"]] = d[keys[keys.length - 1]];
    })

    for (var i = 0; i < globeFeatures.length; i++) {
        globeFeatures[i].properties.Value = 0;

    }

    for (var i in countryValues) {
        //console.log(i);
        var currentCountry = i;
        var currentValue = +countryValues[i];

        for (var j = 0; j < countries.features.length; j++) {
            var mapCountry = globeFeatures[j].properties.name;

            if (mapCountry == currentCountry) {
                globeFeatures[j].properties.Value = currentValue;
            }
        }
    }

    svgGlobe.append("circle")
        .attr("cx", widthGlobe / 2)
        .attr("cy", heightGlobe / 2)
        .attr("r", projectionGlobe.scale())
        .attr("class", "noclicks")
        .attr("fill", "url(#ocean_fill)");

    svgGlobe.append("path")
        .datum(graticuleGlobe)
        .attr("class", "graticuleLine noclicks")
        .attr("d", geoPathGlobe);

    svgGlobe.append("circle")
        .attr("cx", widthGlobe / 2)
        .attr("cy", heightGlobe / 2)
        .attr("r", projectionGlobe.scale())
        .attr("class", "noclicks")
        .attr("fill", "url(#globe_highlight)");

    svgGlobe.append("circle")
        .attr("cx", widthGlobe / 2)
        .attr("cy", heightGlobe / 2)
        .attr("r", projectionGlobe.scale())
        .attr("class", "noclicks")
        .attr("fill", "url(#globe_shading)");

      svgGlobe.selectAll("path.land")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("class", "land")
        .attr("id", function (d) {
            return d.id
        })
        .attr("d", geoPathGlobe)
        .style("fill", function (d) { return getColorGlobe(d, getColorScaleGlobe(globeFeatures)) })
        .on("mousemove", hoverOverGlobe)
        .on("mouseover", hoverStateGlobe)
        .on("mouseout", hoverStateOutGlobe)
        .on("click", clickGlobe);


    refresh();
}

function refresh() {
    svgGlobe.selectAll(".land").attr("d", geoPathGlobe);
    svgGlobe.selectAll(".land path").attr("d", geoPathGlobe);
    svgGlobe.selectAll(".graticuleLine").attr("d", geoPathGlobe);
    //position_labels();
}

var timer, r0, q0;

function dragstarted() {

    v0 = versor.cartesian(projectionGlobe.invert(d3.mouse(this)));
    r0 = projectionGlobe.rotate();
    q0 = versor(r0);
}

function dragged() {
    var v1 = versor.cartesian(projectionGlobe.rotate(r0).invert(d3.mouse(this))),
        q1 = versor.multiply(q0, versor.delta(v0, v1)),
        r1 = versor.rotation(q1);
    projectionGlobe.rotate(r1);
    refresh();
}

function hoverOverGlobe(d, i) {

    d3.select("#tooltipGlobe")
        .style("top", d3.event.pageY + 20 + "px")
        .style("left", d3.event.pageX + 20 + "px")
        .select("#country-name")
        .text(d.properties.name);

    d3.select("#tooltipGlobe")
        .classed("hidden", !1);
}

function hoverStateGlobe(d, i) {
    d3.select(this).transition()
        .duration('50')
        .attr("stroke-width", 1.5)
        .attr('opacity', '.9');

}

function hoverStateOutGlobe(d, i) {
    d3.select(this).transition()
        .duration('50')
        .attr("stroke-width", 0.2)
        .attr('opacity', '1');

    d3.select("#tooltipGlobe").classed("hidden", !0);
}

function clickGlobe(d, i) {
    for (i = 1; i <= 5; i++) {
        if (i == 5) document.getElementById("country1").value = d.properties.name;
        else if (document.getElementById("country" + i).value == "") {
            document.getElementById("country" + i).value = d.properties.name;
            break;
        }  
        updateCompareGraph();
    }
}

function getColorScaleGlobe(features) {

    var dataArray = [];
    for (var i in features) {
        dataArray.push(parseFloat(features[i].properties["Value"]));
    }

    var minVal = d3.min(dataArray);

    var maxVal = d3.max(dataArray);

    console.log(maxVal);
    var color = d3.scaleLinear().domain([minVal, maxVal]).range([lowColor, highColor]);

    return color;
}

function getColorGlobe(d, regionColor) {

    var value = d.properties["Value"];
    if (value) {
        return regionColor(value);
    } else {
        return "#ccc";
    };
}