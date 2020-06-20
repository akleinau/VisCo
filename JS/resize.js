function resize() {
    //resize map Germany
    widthGermany = parseInt(d3.select(".maps").style("width")),
        heightGermany = widthGermany * mapRatio,
        projectionGermany.translate([widthGermany / 2, heightGermany / 2])
            .center(germanyCenter)
            .scale(widthGermany * [mapRatio + mapRatioAdjuster]),
        svgGermany.style("width", widthGermany + "px")
            .style("height", heightGermany + "px"),
        svgGermany.selectAll("path.regions").attr("d", geoPath);

    if (focusedState !== null && focusedState !== void (0)) {
        g.selectAll("text")
            .remove();

        var centroid = geoPath.centroid(focusedState),
            x = +centroid[0],
            y = +centroid[1],
            k = 1.75;

        var value = focusedState.properties[selectedData];
        value = Math.round(value * 100) / 100;
        g.append("text")
            .text(value)
            .attr("x", x)
            .attr("y", y)
            .style("text-anchor", "middle")
            .style("font-size", "13px")
            .style("stroke-width", "0px")
            .style("fill", "black")
            .style("font-family", "Verdana");

        g.transition()
            .attr("transform", "translate(" + (widthGermany / 2) + "," + (heightGermany / 2) + ")scale(" + k + ")translate(" + (-x) + "," + (-y) + ")");
    }

    /* ------------------------------------------------------------------------------------ */
    //resize globe
    widthGlobe = parseInt(d3.select(".maps").style("width")),
        heightGlobe = widthGlobe * mapRatioGlobe,
        projectionGlobe
            .scale((heightGlobe - 100) / 2)
            .translate([widthGlobe / 2, heightGlobe / 2])
            .clipAngle(90),
        svgGlobe.style('height', heightGlobe + 'px')
            .style('width', widthGlobe + 'px'),
        svgGlobe.selectAll("path.land").attr("d", geoPathGlobe);
        
    if((d3.event.transform.translate(projectionGlobe).k) !== 1){
        projectionGlobe.scale(d3.event.transform.translate(projectionGlobe).k * scaleGlobe);
    }
}




d3.select(window).on("resize", resize);