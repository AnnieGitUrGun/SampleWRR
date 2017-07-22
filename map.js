// Colors Used
// gray = rgb(184, 186, 184)
// yellow = rgb(255, 243, 86)
// green = rgb(38, 124, 43)


//Width and height of map
var width = 960;
var height = 500;
var viewBox = "0 0 900 500";
var aspectRatio = "xMidYMid meet";

// D3 Projection
var projection = d3.geo.albersUsa()
    .translate([width / 2, height / 2]) // translate to center of screen
    .scale([1000]); // scale things down so see entire US

// Define path generator
var path = d3.geo.path() // path generator that will convert GeoJSON to SVG paths
    .projection(projection); // tell path generator to use albersUsa projection


// Define linear scale for output
var color = d3.scale.linear()
    .range(["rgb(184, 186, 184)", "rgb(255, 243, 86)", "rgb(38, 124, 43)"]);

var legendText = ["Active", "In progress", "Non-participating"];

//Create SVG element and append map to the SVG
var svg = d3.select("div#national-map")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", viewBox)
    .attr("preserveAspectRatio", aspectRatio)
    .classed("svg-content", true);

// Append Div for tooltip to SVG
var div = d3.select("div#national-map")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load in my states data!
d3.csv("stateparticipation.csv", function(data) {
    color.domain([0, 1, 2]); // setting the range of the input data

    // Load GeoJSON data and merge with states data
    d3.json("us-states.json", function(json) {

        // Loop through each state data value in the .csv file
        for (var i = 0; i < data.length; i++) {

            // Grab State Name
            var dataState = data[i].state;

            // Grab data value 
            var dataValue = data[i].wrrstatus;

            // Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {
                var jsonState = json.features[j].properties.name;

                if (dataState == jsonState) {

                    // Copy the data value into the JSON
                    json.features[j].properties.wrrstatus = dataValue;

                    // Stop looking through the JSON
                    break;
                }
            }
        }


        // Bind the data to the SVG and create one path per GeoJSON feature
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("a")
            .attr("xlink:href", function(s) {
                // State does not have WRR site
                if (s.properties.wrrstatus == 0){
                    return "#noWrr"
                }
                else {
                    return "http://localhost/SampleWRR/" + s.properties.name + ".html" 
                }
                })
            .append("path")

        .attr("d", path)

        .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", function(d) {

                // Get data value
                var value = d.properties.wrrstatus;

                if (value) {
                    //If value exists…
                    return color(value);
                } else {
                    //If value is undefined…
                    return "rgb(213,222,217)";
                }
            })
            .append("a")
            .attr("xlink:href", function(d) {
                return "http://localhost/SampleWRR/" + d.properties.name + ".html" });

        // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
        var legend = d3.select("div#national-map").append("svg")
            .attr("class", "legend")
            .attr("width", 140)
            .attr("height", 200)
            .classed("svg-content", true)
            .selectAll("g")
            .data(color.domain().slice().reverse())
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
                return "translate(0," + i * 20 + ")";
            });

        legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color)
            .style("border", "rgb(0, 0, 0)");

        legend.append("text")
            .data(legendText)
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(function(d) {
                return d;
            });
    });

});
