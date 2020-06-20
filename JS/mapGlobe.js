

var marginGlobe = { top: 10, left: 10, bottom: 10, right: 10 },
    widthGlobe = parseInt(d3.select(".maps").style("width")),
    mapRatioGlobe = .8,
    heightGlobe = widthGlobe * mapRatioGlobe;


var keyArrayG = ["confirmed", "recovered", "deaths"];
var selectedDataGlobe = keyArray[0];

var projectionGlobe = d3.geoOrthographic()
    .rotate([0, 0])
    .scale((heightGlobe - 100) / 2)
    .translate([widthGlobe / 2, heightGlobe / 2])
    .clipAngle(90);

//d3.select(window).on("resize", resize);

var geoPathGlobe = d3.geoPath().projection(projectionGlobe).pointRadius(1.5);

var graticuleGlobe = d3.geoGraticule();

var rotate = [39.666666666666664, -30];
var lastTime = Date.now();
var velocity = [.015, -0];
var focused;

//var rotationDelay = 3000;
//var degPerSec = 6;
//var degPerMs = degPerSec / 1000
//var autorotate, now, diff, roation;

var globeFeatures;

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
//.on("end",dragended));

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
    .attr("stop-opacity", "0");
globe_shading.append("stop")
    .attr("offset", "100%").attr("stop-color", "#3e6184")
    .attr("stop-opacity", "0.3");


    svgGlobe.append("circle")
        .attr("cx", widthGlobe / 2)
        .attr("cy", heightGlobe / 2)
        .attr("r", projectionGlobe.scale())
        .attr("class", "noclicks")
        .attr("fill", "url(#ocean_fill)");

    /* 
        svgGlobe.append("path")
            .datum(graticuleGlobe)
            .attr("class", "graticuleLine noclicks")
            .attr("d", geoPathGlobe); */

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

function initializeGlobe(){
d3.queue()
    .defer(d3.json, urls.countries)
    .defer(d3.csv, urls.coronaWorldConfirmed)
    .defer(d3.csv, urls.coronaWorldRecovered)
    .defer(d3.csv, urls.coronaWorldDeaths)
    .await(buildGlobalMap);
}

function buildGlobalMap(err, countries, coronaConfirmed, coronaRecovered, coronaDeaths) {

    /*  var coronaData;
     var datatype = document.getElementById("dataModeGlobal").value;
     if (datatype == "confirmed") coronaData = coronaConfirmed;
     if (datatype == "recovered") coronaData = coronaRecovered;
     if (datatype == "deaths") coronaData = coronaDeaths;
  */
 
    globeFeatures = countries.features;

    var provinceListConfirmed = createProvinceList(coronaConfirmed, globeFeatures);
    var sortedDataConfirmed = sumUpStatesAndProvinces(coronaConfirmed, provinceListConfirmed);

    var provinceListRecovered = createProvinceList(coronaRecovered, globeFeatures);
    var sortedDataRecovered = sumUpStatesAndProvinces(coronaRecovered,provinceListRecovered);

    var provinceListDeaths = createProvinceList(coronaDeaths, globeFeatures);
    var sortedDataDeaths = sumUpStatesAndProvinces(coronaDeaths,provinceListDeaths);

    createProvinceList(coronaConfirmed, globeFeatures);
    // columns of the table
    var keys = d3.keys(sortedDataConfirmed[0]);

    var countryConfirmed = {},
        countryRecovered = {},
        countryDeaths = {};

    

    //map each country and the last date value
    sortedDataConfirmed.map(function (d) {
        countryConfirmed[d["Country/Region"]] = d[keys[keys.length - 1]];
    })

    sortedDataRecovered.map(function (d) {
        countryRecovered[d["Country/Region"]] = d[keys[keys.length - 1]];
    })

    sortedDataDeaths.map(function (d) {
        countryDeaths[d["Country/Region"]] = d[keys[keys.length - 1]];
    })

    for (var i = 0; i < globeFeatures.length; i++) {
        globeFeatures[i].properties.confirmed = 0;
        globeFeatures[i].properties.recovered = 0;
        globeFeatures[i].properties.deaths = 0;
    }

    for (var i in countryConfirmed) {
        //console.log(i);
        var currentCountry = i;
        var currentValueConfirmed = +countryConfirmed[i];
        var currentValueRecovered = +countryRecovered[i];
        var currentValueDeaths = +countryDeaths[i];

        for (var j = 0; j < countries.features.length; j++) {
            var mapCountry = globeFeatures[j].properties.name;

            if (mapCountry == currentCountry) {
                globeFeatures[j].properties.confirmed = currentValueConfirmed;
                globeFeatures[j].properties.recovered = currentValueRecovered;
                globeFeatures[j].properties.deaths = currentValueDeaths;
            }
        }
    }

    var dropdownButtonG = d3.select("#change-data-globe")
        .append("select")
        .attr("id", "dataModeGlobal")
        .on("change", function () {
            updateColorGlobe(this.value, globeFeatures);
            updateGlobalGraph();
            updateCompareGraph("global");
        });

    dropdownButtonG.selectAll("myOptions")
        .data(keyArrayG)
        .enter()
        .append("option")
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });


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
    spin();
    console.log(countries);
    //autorotate = d3.timer(spin);
    /* 
        d3.selectAll("tbody").selectAll("tr").on("click", function () {
            console.log(selectedCountry); */
    /*   var rotate = projectionGlobe.rotate(),
          focusedCountry = selectedCountry,
          p = d3.geoCentroid(selectedCountry);
  
      svg.selectAll(".focused").classed("focused", focused = false);
  
      (function transition() {
          d3.transition()
              .duration(2500)
              .tween("rotate", function () {
                  var r = d3.interpolate(projectionGlobe.rotate(), [-p[0], -p[1]]);
                  return function (t) {
                      projectionGlobe.rotate(r(t));
                      svg.selectAll("path").attr("d", path)
                          .classed("focused", function (d, i) { return d.id == selectedCountry.id ? focused = d : false; });
                  };
              })
      })(); */
    /*   });
   */
}


function refresh() {
    svgGlobe.selectAll(".land").attr("d", geoPathGlobe);
    svgGlobe.selectAll(".land path").attr("d", geoPathGlobe);
    svgGlobe.selectAll(".graticuleLine").attr("d", geoPathGlobe);
    svgGlobe.selectAll(".focused").classed("focused", focused = false);
    //position_labels();
}

var timer, r0, q0;

/* function startRotation(delay) {
    autorotate.restart(spin, delay || 0)
}

function stopRotation() {
    autorotate.stop()
}
 */

function spin() {
    timer = d3.timer(function () {
        var dt = Date.now() - lastTime;
        projectionGlobe.rotate([rotate[0] + velocity[0] * dt, rotate[1] + velocity[1] * dt]);
        refresh();
    });

}

/* function spin(elapsed) {

    now = d3.now()
    diff = now - lastTime
    if (diff < elapsed) {
        projectionGlobe.rotate([rotate[0] + velocity[0] * dt, rotate[1] + velocity[1] * dt]);
        refresh()
    }
    lastTime = now
} */

function dragstarted() {
    //stopRotation();
    timer.stop();
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

/* function dragended() {
    startRotation(rotationDelay)
  }
 */

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
    }
    updateCompareGraph();

    transitionGlobe(d);

}

function transitionGlobe(d, i) {
    timer.stop();
    focusedCountry = d,

        svgGlobe.selectAll(".focused").classed("focused", focused = false);

    //Globe rotating    

    (function transition() {
        d3.transition()
            .duration(2500)
            .tween("rotate", function () {
                var p = d3.geoCentroid(focusedCountry),
                    r = d3.interpolate(projectionGlobe.rotate(), [-p[0], -p[1]]);
                return function (t) {
                    projectionGlobe.rotate(r(t));
                    svgGlobe.selectAll("path").attr("d", geoPathGlobe)
                        .classed("focused", function (d, i) {

                            return d.properties.name == focusedCountry.properties.name ? focused = d : false;
                        });
                };
            })
    })();
}


function getColorScaleGlobe(features) {

    var dataArray = [];
    for (var i in features) {
        dataArray.push(parseFloat(features[i].properties[selectedDataGlobe]));
    }

    var minVal = d3.min(dataArray);

    var maxVal = d3.max(dataArray);

    var color = d3.scaleLinear().domain([minVal, maxVal]).range([lowColor, highColor]);

    return color;
}

function getColorGlobe(d, regionColor) {

    var value = d.properties[selectedDataGlobe];
    if (value) {
        return regionColor(value);
    } else {
        return "#ccc";
    };
}

function updateColorGlobe(attribute, features) {

    selectedDataGlobe = attribute;
    d3.selectAll(".land")
        .style("fill", function (d) {
            return getColorGlobe(d, getColorScaleGlobe(features));
        });
}

function selectCountry(name) {

    for (var i in globeFeatures) {
        if (globeFeatures[i].properties.name == name) {
            return globeFeatures[i];
        }
    }

}
