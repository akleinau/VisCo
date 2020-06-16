

var margin = { top: 10, left: 10, bottom: 10, right: 10 },
    widthGermany = parseInt(d3.select("#map-germany").style("width")),
    mapRatio = .8,
    heightGermany = widthGermany * mapRatio,
    focused = null,
    lowColor = '#f4e8eb',
    highColor = '#7a003f',
    mapRatioAdjuster = 2.2,
    germanyCenter = [10, 51];



var keyArray = ["Fallzahl", "Death", "Fallzahl_pro_100000_EW"];
var selectedData = keyArray[0];


var projectionGermany = d3.geoMercator()
    .center(germanyCenter)
    .translate([widthGermany / 2, heightGermany / 2])
    .scale(widthGermany * [mapRatio + mapRatioAdjuster]);


var geoPath = d3.geoPath().projection(projectionGermany);

d3.select(window).on("resize", resize);

var svg = d3.select("#map-germany")
    .append("svg")
    .attr("id", "map-germany-container")
    .style('height', heightGermany + 'px')
    .style('width', widthGermany + 'px');

svg.append("rect")
    .attr("class", "background")
    .attr("width", "100%")
    .attr("height", "100%");

var g = svg.append("g")
    .attr("id", "states");

function resize() {
    widthGermany = parseInt(d3.select("#map-germany").style("width")),
        heightGermany = widthGermany * mapRatio,
        projectionGermany.translate([widthGermany / 2, heightGermany / 2])
            .center(germanyCenter)
            .scale(widthGermany * [mapRatio + mapRatioAdjuster]),
        svg.style("width", widthGermany + "px")
            .style("height", heightGermany + "px"),
        svg.selectAll("path.regions").attr("d", geoPath);
}

d3.queue()
    .defer(d3.json, urls.states)
    .defer(d3.json, urls.coronaStates)
    .await(buildMap);

d3.queue()
    .defer(d3.json, urls.states)
    .defer(d3.json, urls.coronaStates)
    .await(buildTable);

    

function buildTable(err, collection, coronaData){
    console.log(coronaData);
    var ft = coronaData.features;
    var state_id = new Array;
    var state_death = new Array;
    var state_fallzahl = new Array;
    var state_fallzahl_pro_100000 = new Array;

    for (var i = 0; i < ft.length; i++) {

        state_id[i] = ft[i].attributes.OBJECTID;        
        state_death[i] = ft[i].attributes.Death;
        state_fallzahl[i] = ft[i].attributes.Fallzahl;
        state_fallzahl_pro_100000[i] = ft[i].attributes.faelle_100000_EW;
    }

    var death = new Array(2);
    var fallzahl = new Array(2);
    var fallzahl_pro_100000 = new Array(2);
    
    for (var j = 0; j < state_id.length; j++) {
        var asdf = [state_id[j], state_death[j]];
        death[j] = asdf;
    } 

    for (var j = 0; j < state_id.length; j++) {
        var asdf = [state_id[j], state_fallzahl[j]];
        fallzahl[j] = asdf;
    } 

    for (var j = 0; j < state_id.length; j++) {
        var asdf = [state_id[j], state_fallzahl_pro_100000[j]];
        fallzahl_pro_100000[j] = asdf;
    } 
    dataSort(death, "death");
    dataSort(fallzahl, "fallzahl");
    dataSort(fallzahl_pro_100000, "pro100000");
    
}

function dataSort(array2D, tab){
 
    var data_length = 0;

    data_length = 15;

    array2D.sort(compareSecondColumn);
    doTable(array2D, data_length, tab);

    function compareSecondColumn(a, b) {
        if (a[1] === b[1]) {
          return 0;
        }
        else {
          return (a[1] > b[1]) ? -1 : 1;
        }
    }  
    console.log(array2D); 
}
    
function doTable(data, length, tab) {

  var i = 0, rowEl = null,
    tableEl = document.createElement("table");

  tableEl.setAttribute("class", "data-table");
  
  for (i = 0; i <= length; i++) {
    rowEl = tableEl.insertRow();  // DOM method for creating table rows
    rowEl.insertCell().textContent = data[i][0];
    rowEl.insertCell().textContent = data[i][1];
  }
  document.getElementById(tab).appendChild(tableEl);
}



function buildMap(err, collection, coronaData) {

    console.log(collection);
    var dataFields = coronaData.fields;
    console.log(coronaData);

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
    var x = widthGermany / 2,
        y = heightGermany / 2,
        k = 1,
        value = d.properties[selectedData];

    value = Math.round(value*100)/100;
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
        .attr("transform", "translate(" + (widthGermany / 2) + "," + (heightGermany / 2) + ")scale(" + k + ")translate(" + (-x) + "," + (-y) + ")")
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

