

var widthMap = parseInt(d3.select(".maps").style("width")),
    mapRatioGermany = .9,
    heightGermany = widthMap * mapRatioGermany,
    focusedState,
    lowColor = '#f4e8eb',
    highColor = '#7a003f',
    mapRatioAdjuster = 2.2,
    marginGermany = { top: 10, left: 10, bottom: 10, right: 10 },
    germanyCenter = [10, 51];


var keyArray = ["confirmed", "confirmed_per_100000", "deaths"];
var selectedData = keyArray[0];
var mapFeatures;
var mapText;

var projectionGermany = d3.geoMercator()
    .center(germanyCenter)
    .translate([widthMap / 2, heightGermany / 2])
    .scale(widthMap * [mapRatioGermany + mapRatioAdjuster]);

var geoPath = d3.geoPath().projection(projectionGermany);

//d3.select(window).on("resize", resizeGermany);

var svgGermany = d3.select("#map-germany")
    .append("svg")
    .attr("id", "map-germany-container")
    .style('height', heightGermany + 'px')
    .style('width', widthMap + 'px');

var bgGermany = svgGermany.append("rect")
    .attr("class", "background")
    .attr("width", "100%")
    .attr("height", "100%")
    .on("click", clickPath);

var g = svgGermany.append("g")
    .attr("id", "states");


function initializeMap() {
    d3.queue()
        .defer(d3.json, urls.states)
        .defer(d3.json, urls.coronaStates)
        .await(buildMap);
}

function buildMap(err, collection, coronaData) {

    var dataFields = coronaData.fields;

    for (var i = 0; i < dataFields.length; i++) {
        collection.fields[i] = dataFields[i].name;
    }

    const ft = coronaData.features;

    for (var i = 0; i < ft.length; i++) {

        var state_id = ft[i].attributes.OBJECTID;
        var state_update = ft[i].attributes.Aktualisierung;
        var state_death = ft[i].attributes.Death;
        var state_fallzahl = ft[i].attributes.Fallzahl;
        var state_fallzahl_pro_100000 = ft[i].attributes.faelle_100000_EW;
        var state_population = ft[i].attributes.LAN_ew_EWZ;

        for (var j = 0; j < collection.features.length; j++) {
            var map_id = collection.features[j].id + 1;

            if (state_id == map_id) {

                collection.features[j].properties.update = state_update;
                collection.features[j].properties.deaths = state_death;
                collection.features[j].properties.confirmed = state_fallzahl;
                collection.features[j].properties.confirmed_per_100000 = state_fallzahl_pro_100000;
                collection.features[j].properties.population = state_population;

                break;
            }
        }
    }

    mapFeatures = collection.features;
    console.log(mapFeatures);
    var dropdownButton = d3.select("#change-data")
        .append("select")
        .attr("id", "dataMode")
        .on("change", function () {
            updateMapColor(this.value, mapFeatures);
            updateCompareGraph("germany");
            changeTableSelectionGermany(this.value);
        });


    dropdownButton.selectAll("myOptions")
        .data(keyArray)
        .enter()
        .append("option")
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });



    g.selectAll("path.regions")
        .data(mapFeatures)
        .enter()
        .append("path")
        .attr("class", "regions")
        .attr("id", function (d) {
            return d.properties.id
        })
        .attr("d", geoPath)
        .style("fill", function (d) { return getColor(d, getColorScale(mapFeatures)) })
        .attr("stroke", "#ffffff")
        .attr("stroke-width", .2)
        .on("click", clickPath)
        .on("mousemove", hoverOver)
        .on("mouseover", hoverState)
        .on("mouseout", hoverStateOut);


    var key = d3.select("#color-key-germany")
        .append("svg")
        .attr("class", "color-key")
        .attr("width", "100%")
        .attr("height", "100%");

    var legend = key.append("defs")
        .append("linearGradient")
        .attr("id", "gradient-germany");

    legend.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", lowColor);

    legend.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", highColor);

    key.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .style("fill", "url(#gradient-germany)");

    var caret = d3.select("#data-caret")
        .style("opacity", 0);

    //takes last update of Bavaria data
    var lastPatch = mapFeatures[1].properties.update;
    document.getElementById("GermanyLastUpdated").innerHTML = "Last updated: " + formatDays(lastPatch);

    var date = new Date(1592517600000);

}

function clickPath(d) {

    g.selectAll("text")
        .remove();
    console.log(d.properties);
    var x = widthMap / 2,
        y = heightGermany / 2,
        k = 1;

    if (d && focusedState !== d) {
        var centroid = geoPath.centroid(d),
            x = +centroid[0],
            y = +centroid[1],
            k = 1.75;
        focusedState = d;

        var value_1 = d.properties.confirmed;
        var value_2 = d.properties.confirmed_per_100000;
        value_2 = Math.round(value_2 * 100) / 100;
        var value_3 = d.properties.deaths;
        var value_n = d.properties.name;
        var value_p = d.properties.population;

        /* g.append("text")
            .text(value)
            .attr("x", x)
            .attr("y", y)
            .style("text-anchor", "middle")
            .style("font-size", "13px")
            .style("stroke-width", "0px")
            .style("fill", "black")
            .style("font-family", "Verdana")
            .on("click", clickText); */
        if (document.getElementById("info-key-1").innerHTML == "") {
            document.getElementById("info-key-1").innerHTML = "Confirmed Cases: ";
            document.getElementById("info-key-2").innerHTML = "Per 100.000: ";
            document.getElementById("info-key-3").innerHTML = "Deaths: ";
        }

        document.getElementById("info-value-1").innerHTML = value_1;
        document.getElementById("info-value-2").innerHTML = value_2;
        document.getElementById("info-value-3").innerHTML = value_3;
        document.getElementById("info-name").innerHTML = value_n;
        document.getElementById("info-population").innerHTML = value_p;

    } else {

        g.selectAll("text")
            .remove();
        focusedState = null;
    };

    g.selectAll("path")
        .classed("active", focusedState && function (d) { return d === focusedState; });

    g.transition()
        .duration(1000)
        .attr("transform", "translate(" + (widthMap / 2) + "," + (heightGermany / 2) + ")scale(" + k + ")translate(" + (-x) + "," + (-y) + ")")
        .style("stroke-width", 1.75 / k + "px");
}

function clickText(d) {

    g.selectAll("text")
        .remove();
    g.selectAll("path")
        .classed("active", 0);
    g.transition()
        .duration(1000)
        .attr("transform", "scale(" + 1 + ")translate(" + 0 + "," + 0 + ")")
        .style("stroke-width", 1.00 + "px");

}

function hoverOver(d, i) {

    d3.select("#tooltip")
        .style("top", d3.event.pageY + 20 + "px")
        .style("left", d3.event.pageX + 20 + "px")
        .select("#state-name")
        .text(d.properties.name);

    d3.select("#tooltip")
        .classed("hidden", !1);
}

function hoverState(d, i) {
    d3.select(this).transition()
        .duration('50')
        .attr("stroke-width", 1.5)
        .attr('opacity', '.9');

}

function hoverStateOut(d, i) {
    d3.select(this).transition()
        .duration('50')
        .attr("stroke-width", 0.2)
        .attr('opacity', '1');

    d3.select("#tooltip").classed("hidden", !0);
}

function getColorScale(features) {

    var dataArray = [];
    for (var i in features) {
        dataArray.push(parseFloat(features[i].properties[selectedData]));
    }

    var minVal = d3.min(dataArray);
    var maxVal = d3.max(dataArray);

    var color = d3.scaleLinear().domain([minVal, maxVal]).range([lowColor, highColor]);
    return color;
}

function getColor(d, regionColor) {

    var value = d.properties[selectedData];
    if (value) {
        return regionColor(value);
    } else {
        return "#ccc";
    };
}

function updateMapColor(attribute, features) {

    selectedData = attribute;
    d3.selectAll(".regions")
        .style("fill", function (d) {
            return getColor(d, getColorScale(features));
        });
}

function selectState(name) {

    for (var i in mapFeatures) {
        if (mapFeatures[i].properties.name == name) {
            return mapFeatures[i];
        }
    }

}

function changeTableSelectionGermany(value) {
    console.log(value);
    if (value === keyArray[0]) {
        console.log(value);
        openTabFromSelect("Fallzahl");
        document.getElementById("fallzahl").classList.add("active");
    }
    else if (value === keyArray[1]) {
        console.log(value);
        openTabFromSelect("Pro100000");
        document.getElementById("pro100000").classList.add("active");
    }
    else if (value === keyArray[2]) {
        console.log(value);
        openTabFromSelect("Death");
        document.getElementById("death").classList.add("active");
    }
}

