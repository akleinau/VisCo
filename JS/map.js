var urls = {
    states: "data/3_mittel.geo.json",
    coronaStates: "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronafälle_in_den_Bundesländern/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json"
};

var margin = { top: 10, left: 10, bottom: 10, right: 10 },
    width = parseInt(d3.select("#maps").style("width")),
    mapRatio = .8,
    height = width * mapRatio,
    focused = null,
    lowColor = '#f4e8eb',
    highColor = '#7a003f',
    mapRatioAdjuster = 2.2,
    germany_center = [10, 51];



var keyArray = ["Fallzahl", "Death", "Fallzahl_pro_100000_EW"];
var selectedData = keyArray[0];


var projection = d3.geoMercator()
    .center(germany_center)
    .translate([width / 2, height / 2])
    .scale(width * [mapRatio + mapRatioAdjuster]);


d3.select(window).on("resize", resize);

var svg = d3.select("#maps")
    .append("svg")
    .attr("id", "map-container")
    .style('height', height + 'px')
    .style('width', width + 'px');

svg.append("rect")
    .attr("class", "background")
    .attr("width", "100%")
    .attr("height", "100%");

var g = svg.append("g")
    .attr("id", "states");

var geoPath = d3.geoPath().projection(projection);

function resize() {
    width = parseInt(d3.select("#maps").style("width")),
        height = width * mapRatio,
        projection.translate([width / 2, height / 2])
            .center(germany_center)
            .scale(width * [mapRatio + mapRatioAdjuster]),
        svg.style("width", width + "px")
            .style("height", height + "px"),
        svg.selectAll("path.regions").attr("d", geoPath);
}

d3.queue()
    .defer(d3.json, urls.states)
    .defer(d3.json, urls.coronaStates)
    .await(buildMap);

function buildMap(err, collection, coronaData) {

    console.log(collection);
    var dataFields = coronaData.fields;

    for (var i = 0; i < dataFields.length; i++) {
        collection.fields[i] = dataFields[i].name;
    }

    const ft = coronaData.features;

    for (var i = 0; i < ft.length; i++) {

        var state_id = ft[i].attributes.OBJECTID;
        var state_death = ft[i].attributes.Death;
        var state_fallzahl = ft[i].attributes.Fallzahl;
        var state_fallzahl_pro_100000 = ft[i].attributes.faelle_100000_EW;

        for (var j = 0; j < collection.features.length; j++) {
            var map_id = collection.features[j].id + 1;

            if (state_id == map_id) {

                collection.features[j].properties.Death = state_death;
                collection.features[j].properties.Fallzahl = state_fallzahl;
                collection.features[j].properties.Fallzahl_pro_100000_EW = state_fallzahl_pro_100000;

                break;
            }
        }
    }

    var mapFeatures = collection.features;

    var dropdownButton = d3.select("#change-data")
        .append("select")
        .on("change", function () {
            updateMapColor(this.value, mapFeatures);
            console.log(selectedData);
        });


    dropdownButton.selectAll("myOptions")
        .data(keyArray)
        .enter()
        .append("option")
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });


    /* var bounds = d3.geoBounds(collection),
        bottomLeft = bounds[0],
        topRight = bounds[1],
        rotLong = -(topRight[0] + bottomLeft[0]) / 2,

        center = [(topRight[0] + bottomLeft[0]) / 2 + rotLong, (topRight[1] + bottomLeft[1]) / 2];

    //default scale projection
    projection = d3.geoAlbers()
        .parallels([bottomLeft[1], topRight[1]])
        .rotate([rotLong, 0, 0])
        .translate([width / 2, height / 2])
        .center(center);

    var bottomLeftPx = projection(bottomLeft),
        topRightPx = projection(topRight),
        scaleFactor = 1.00 * Math.min(width / (topRightPx[0] - bottomLeftPx[0]),
            height / (-topRightPx[1] + bottomLeftPx[1]));

    projection = d3.geoAlbers()
        .parallels([bottomLeft[1], topRight[1]])
        .rotate([rotLong, 0, 0])
        .translate([width / 2, height / 2])
        .scale(scaleFactor * 0.975 * 1000)
        //.scale(4*1000)  //1000 is default for USA map
        .center(center);

    geoPath = d3.geoPath().projection(projection); */

    /*     var graticule = d3.geoGraticule()
            .step([1, 1]); */

    /*    svg.append("path")
           .datum(graticule)
           .attr("class", "graticuleLine")
           .attr("d", geoPath); */

    g.selectAll("path.regions")
        .data(collection.features)
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

    var w = 300, h = 15;

    var key = d3.select(".color-key")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    legend = key.append("defs")
        .append("linearGradient")
        .attr("id", "gradient");

    legend.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", lowColor);

    legend.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", highColor);

    key.append("rect")
        .attr("width", w)
        .attr("height", h)
        .style("fill", "url(#gradient)");

    var caret = d3.select("#data-caret")
        .style("opacity", 0);


}

function clickPath(d) {
    var x = width / 2,
        y = height / 2,
        k = 1,
        value = d.properties[selectedData];


    g.selectAll("text")
        .remove();
    if ((focused === null) || !(focused === d)) {
        var centroid = geoPath.centroid(d),
            x = +centroid[0],
            y = +centroid[1],
            k = 1.75;
        focused = d;

        g.append("text")
            .text(value)
            .attr("x", x)
            .attr("y", y)
            .style("text-anchor", "middle")
            .style("font-size", "13px")
            .style("stroke-width", "0px")
            .style("fill", "black")
            .style("font-family", "Verdana")
            .on("click", clickText);
    } else {
        focused = null;
    };

    g.selectAll("path")
        .classed("active", focused && function (d) { return d === focused; });

    g.transition()
        .duration(1000)
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")scale(" + k + ")translate(" + (-x) + "," + (-y) + ")")
        .style("stroke-width", 1.75 / k + "px");
}

function clickText(d) {
    focused = null;
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

