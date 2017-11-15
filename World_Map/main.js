const width = 1300;
const height = 1000;

// D3 Projection
const projection = d3.geoNaturalEarth1()
	.rotate([0, 0])
	.center([8, 46])
	.translate([width / 2, height / 2])
	.precision(.1);

// path generator to convert JSON to SVG paths
let path = d3.geoPath().projection(projection);

const svg = d3.select("body")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

// Append Div for tooltip to SVG
var div = d3.select("body")
		    .append("div")
    		.attr("class", "tooltip")
    		.style("opacity", 0);

d3.csv("Data/country-code.csv", function(data) {
	d3.json("Data/world-map.json", function(json) {

		const countries = topojson.feature(json, json.objects.countries);
		// Loop through each country data value in the .csv file
		for (let i = 0; i < data.length; i++) {

			// Country name
			let dataCountryCode = data[i].Code;

			// Country name
			let dataCountryName = data[i].Name;

			// Find the corresponding Country inside the JSON
			for (let j = 0; j < countries.features.length; j++) {
				let jsonCountryCode = countries.features[j].id;

				if (dataCountryCode === jsonCountryCode) {
					// Copy the canton density into the JSON
					countries.features[j].name = dataCountryName;
					break;
				}
			}
		}

		//Draw map & show tooltip with name when mouse over country
		svg.selectAll("path")
			.data(countries.features)
			.enter()
			.append("path")
			.attr("class", "boundary")
			.attr("d", path)
			.style("fill", "lightgreen")
			.on("mouseover", function(d) {
		    	div.transition()
		           .style("opacity", .9);
		           div.text(d.name)
		           .style("left", (d3.event.pageX - 10) + "px")
		           .style("top", (d3.event.pageY - 20) + "px");
			})

		    // fade out tooltip on mouse out
		    .on("mouseout", function(d) {
		        div.transition()
		           .style("opacity", 0);
		    });

		/**
		 * Keeping this in case we want to let the names on the map.
		 */
		//svg.selectAll("text")
		//	.data(countries.features)
		//	.enter().append("text")
		//	.attr("transform", (d) => "translate(" + path.centroid(d) + ")")
		//	.attr("font-size", ".6em")
		//	.attr("fill", "black")
		//	.text((d) => d.name);
	});
});
