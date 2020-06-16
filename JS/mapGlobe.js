

var marginGlobe = { top: 10, left: 10, bottom: 10, right: 10 },
    widthGlobe = parseInt(d3.select("#map-globe").style("width")),
    mapRatioGlobe = .8,
    heightGlobe = widthGlobe * mapRatioGlobe;
    


console.log(widthGlobe);
/* var keyArray = ["Fallzahl", "Death", "Fallzahl_pro_100000_EW"];
var selectedData = keyArray[0]; */


var projectionGlobe = d3.geoOrthographic()
    .scale((heightGlobe - 10) / 2)   
    .translate([widthGlobe / 2, heightGlobe / 2])
    .precision(0.1)
    .clipAngle(90);

d3.select(window).on("resize", resize);

var geoPathGlobe = d3.geoPath().projection(projectionGlobe);

var svgGlobe = d3.select("#map-globe")
.append("svg")
.attr("id", "map-globe-container")
.style('height', heightGlobe + 'px')
.style('width', widthGlobe + 'px');


svgGlobe.call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged));

d3.queue()
    .defer(d3.json, urls.countries)
    .defer(d3.csv, urls.coronaWorldConfirmed)
    .await(buildGlobalMap);

function buildGlobalMap(err, countries, coronaData){
    console.log(countries);

    svgGlobe.append("circle")
        .attr("cx", widthGlobe / 2)
      	.attr("cy", heightGlobe / 2)
        .attr("r", projectionGlobe.scale())
        .attr("class", "noclicks")
        .attr("fill", "none");



    svgGlobe.append("g").selectAll("path")
    .data(countries.features)
    .enter()
        .append("path")
        .attr("class", "land")
        .attr("id", function (d) {
            return d.id 
        })
        .attr("d", geoPathGlobe)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", .2);

    refresh();
}

function refresh() {
    svgGlobe.selectAll(".land").attr("d", geoPathGlobe);
    svgGlobe.selectAll(".land path").attr("d", geoPathGlobe);
    //svg.selectAll(".graticule").attr("d", path);
    //svg.selectAll(".point").attr("d", path);
    //svg.selectAll(".lines").attr("d", (d) => { if (d) { return lineToLondon(d); }});
    //position_labels();
  }
  var timer, r0,q0;
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