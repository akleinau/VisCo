
console.log(parseInt(d3.select("body").style("height")));

function resize() {
    widthMap = parseInt(d3.select(".maps").style("width"));
    console.log(parseInt(d3.select("body").style("height")));
    //resize map Germany
    heightGermany = widthMap * mapRatioGermany;

    projectionGermany.translate([widthMap / 2, heightGermany / 2])
        .center(germanyCenter)
        .scale(widthMap * [mapRatioGermany + mapRatioAdjuster]);
    svgGermany.style("width", widthMap + "px")
        .style("height", heightGermany + "px");
    svgGermany.selectAll("path.regions").attr("d", geoPath);

    if (focusedState !== null && focusedState !== void (0)) {
       /*  g.selectAll("text")
            .remove(); */

        var centroid = geoPath.centroid(focusedState),
            x = +centroid[0],
            y = +centroid[1],
            k = 1.75;

    /*     var value = focusedState.properties[selectedData];
        value = Math.round(value * 100) / 100;
        g.append("text")
            .text(value)
            .attr("x", x)
            .attr("y", y)
            .style("text-anchor", "middle")
            .style("font-size", "13px")
            .style("stroke-width", "0px")
            .style("fill", "black")
            .style("font-family", "Verdana"); */
            
        g.transition()
            .attr("transform", "translate(" + (widthMap / 2) + "," + (heightGermany / 2) + ")scale(" + k + ")translate(" + (-x) + "," + (-y) + ")");
    }

    /* ------------------------------------------------------------------------------------ */
    //resize globe
    heightGlobe = widthMap * mapRatioGlobe

    projectionGlobe
        .scale((heightGlobe - 100) / 2)
        .translate([widthMap / 2, heightGlobe / 2])
        .clipAngle(90);
    svgGlobe.style('height', heightGlobe + 'px')
        .style('width', widthMap + 'px');
    gGlobe.selectAll("path.land").attr("d", geoPathGlobe);

    if (focusedCountry !== null && focusedCountry !== void (0)) {
        transitionGlobe(focusedCountry);
    }

    circle1.attr("cx", widthMap / 2)
        .attr("cy", heightGlobe / 2)
        .attr("r", projectionGlobe.scale());

    circle2.attr("cx", widthMap / 2)
        .attr("cy", heightGlobe / 2)
        .attr("r", projectionGlobe.scale());

    circle3.attr("cx", widthMap / 2)
        .attr("cy", heightGlobe / 2)
        .attr("r", projectionGlobe.scale());

    /* ------------------------------------------------------------------------------------ */
    //resize globalGraph
    widthGraph1 = parseInt(d3.select("#graphs").style("width"));
    heightGraph1 = parseInt(d3.select("body").style("height"))/3.5;
    widthGraph2 = parseInt(d3.select("#graphs").style("width"));
    heightGraph2 = parseInt(d3.select("body").style("height"))/3.5;
    updateGlobalGraph();
    updateCompareGraph("global");
    updateCompareGraph("germany");
}




d3.select(window).on("resize", resize);