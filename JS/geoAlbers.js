
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

    /* var graticule = d3.geoGraticule()
            .step([1, 1]);

    svg.append("path")
           .datum(graticule)
           .attr("class", "graticuleLine")
           .attr("d", geoPath);  */