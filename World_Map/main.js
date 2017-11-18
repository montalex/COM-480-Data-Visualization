const width = 1300;
const height = 1000;

// D3 Projection
const projection = d3.geoNaturalEarth1()
	.scale(150);

d3.select(window).on("resize", sizeChange);

// path generator to convert JSON to SVG paths
let path = d3.geoPath().projection(projection);


var svg = d3.select("#container")
	.append("svg")
	.attr("width", "100%")
		.append("g");

//colormap for population density
const color = d3.scaleLog()
	.range(["hsl(62,100%,90%)", "hsl(228,30%,20%)"])
	.interpolate(d3.interpolateHcl);


// Append Div for tooltip to SVG
var div = d3.select("body")
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
		var map_window = svg.selectAll("path")
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

function sizeChange() {
	d3.select("g").attr("transform", "scale(" + $("#container").width()/900 + ")");
	$("svg").height($("#container").width()*0.618);
};
