const width = 1300;
const height = 1000;
const width_map = width * 80 / 100;
const height_map = height;

// D3 Projection
const projection = d3.geoNaturalEarth1()
	.scale(150);

d3.select(window).on("resize", sizeChange);

// path generator to convert JSON to SVG paths
let path = d3.geoPath().projection(projection);

let svg = d3.select("#container")
	.append("svg")
	.attr("width", "100%")
	.attr("height", "100%")
	.append("g");

let selectedCountry = d3.select(null);

//colormap for rating average
const color = d3.scaleLog()
	.range(["hsl(62,100%,90%)", "hsl(228,30%,20%)"])
	.interpolate(d3.interpolateHcl);


// Append Div for tooltip to SVG
let div = d3.select("body")
    .append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

d3.json("../Data/world-map.json", function(json) {
	const countries = topojson.feature(json, json.objects.countries);
	// Adding Country name to json.
	d3.csv("../Data/country-code.csv", function(data) {
		// Loop through each country data value in the .csv file
		for(let i = 0; i < data.length; i++) {

			// Country name
			let dataCountryCode = data[i].Code;

			// Country name
			let dataCountryName = data[i].Name;

			// Find the corresponding Country inside the JSON
			for(let j = 0; j < countries.features.length; j++) {
				let jsonCountryCode = countries.features[j].id;

				if(dataCountryCode === jsonCountryCode) {
					// Copy the canton density into the JSON
					countries.features[j].name = dataCountryName;
					break;
				}
			}
		}
	});

	d3.csv("../Data/ratebeer_dataset_all.csv", function(data) {
		const fullDict = csvToBeerDict(data);
		console.log(fullDict);
		//Draw map & show tooltip with name when mouse over country
		var map_window = d3.select("g").selectAll("path")
			.data(countries.features)
			.enter()
			.append("path")
			.attr("class", "boundary")
			.attr("d", path)
			.style("fill", function(d) {
				return color(fullDict["avgDict"][d.name]);
			})
			//.style("opacity", 0.7)
			.on("mouseover", function(d) {
		    	div.transition()
		           .style("opacity", 1);
		           div.text(d.name + ", " + fullDict["avgDict"][d.name])
		           .style("left", (d3.event.pageX - 10) + "px")
		           .style("top", (d3.event.pageY - 20) + "px");
			})

		    // fade out tooltip on mouse out
		    .on("mouseout", function(d) {
		        div.transition()
		           .style("opacity", 0);
		    })
			.on("click", function(d) {
				document.getElementById("information").style.display = "block";
				document.getElementById("countryName").innerHTML = "Country: " +  d.name;
				document.getElementById("averageScore").innerHTML =  "Average Score: " + fullDict["avgDict"][d.name];

				if (selectedCountry.node() === this) return zoomOutOnClick();
			  	selectedCountry.classed("active", false);
			  	selectedCountry = d3.select(this).classed("active", true);

				let limits = path.bounds(d),
			      	dx = limits[1][0] - limits[0][0],
			      	dy = limits[1][1] - limits[0][1],
			      	x = (limits[0][0] + limits[1][0]) / 2,
			      	y = (limits[0][1] + limits[1][1]) / 2,
			      	scale = Math.max(1, Math.min(4, 0.9 / Math.max(dx / width_map, dy / height_map))),
			      	translate = [width_map / 2 - scale * x, height_map / 2 - scale * y];

			  	svg.transition()
			    	.duration(750)
			      	.call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) );
			});
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

/**
 * [Create and order (based on score) dictionary of Country: [beer, score],
 * another one of Country: Average score and returns them both]
 * @param  {[CSV]} data [CSV file]
 * @return {[dictionary]}     [The dictionaries with key beerDict and avgDict]
 */
function csvToBeerDict(data) {
	let dictWithAvg = {};
	let beerDict = {};
	let avgDict = {};

	for(let i = 0; i < data.length; i++) {
		let country = data[i].country;
		let score = data[i].score;
		let name = data[i].name;

		//Filter sparse data
		if(country === "" || name === "" || score === "") {
			continue;
		}

		score = parseInt(score);

		//Clean USA data
		if(country.indexOf(" USA") > 0) {
			country = "United States of America";
		}

		//Clean UK data
		if(country === "England" || country === "Scotland" || country === "Wales" || country === "Northern Ireland") {
			country = "United Kingdom";
		}

		if(!(country in beerDict)) {
			beerDict[country] = [];
			avgDict[country] = 0;
		}
		beerDict[country].push([[name], score]);
		avgDict[country] += score;
	}

	// Ordering and getting average for each country.
	for(let key in beerDict){
		beerDict[key].sort(function(x, y){return y[1] - x[1]});
		avgDict[key] = avgDict[key] / beerDict[key].length;
	}

	dictWithAvg["beerDict"] = beerDict;
	dictWithAvg["avgDict"] = avgDict;
	return dictWithAvg;
};

//Rescale when window size changes
function sizeChange() {
	d3.select("g").attr("transform", "scale(" + $("#container").width()/900 + ")");
	$("svg").height($("#container").width()*0.6);
};

// Zooming
var zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zooming);
svg.call(zoom);

function zooming() {
	d3.select("g").attr("transform", d3.event.transform); // updated for d3 v4
};

function zoomOutOnClick() {
	selectedCountry.classed("active", false);
	selectedCountry = d3.select(null);

	svg.transition()
		.duration(750)
		.call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4
}
