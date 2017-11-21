const width = 1000;
const height = 900;
const width_map = width * 80 / 100;
const height_map = height;

// Select Box name
const select_box = ["Score", "Alcool %", "Calory"];

// D3 Projection
const projection = d3.geoNaturalEarth1()
	.scale(150);

d3.select(window).on("resize", sizeChange);

// path generator to convert JSON to SVG paths
let path = d3.geoPath().projection(projection);

// Create select box
var select = d3.select('#container')
  	.append('select')
	.attr('class','select')
    .on('change',changeMap);
var options = select
	.selectAll('option')
	.data(select_box)
	.enter()
	.append('option')
	.text(function (d) { return d; });
let selectedMap = d3.select('select').property('value');

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

	d3.csv("../Data/ratebeer_dataset_all_with_loc.csv", function(data) {
		const fullDict = csvToBeerDict(data);
		//Draw map & show tooltip with name when mouse over country
		let map_window = d3.select("g").selectAll("path")
			.data(countries.features)
			.enter()
			.append("path")
			.attr("class", "boundary")
			.attr("d", path)
			.style("fill", function(d) {
				//return color based on average
				return color(fullDict["avgScore"][d.name]);
			})
			.on("click", function(d) {
				document.getElementById("information").style.display = "block";
				document.getElementById("countryName").innerHTML = "Country: " +  d.name;
				document.getElementById("averageScore").innerHTML =  "Average Score: " + fullDict["avgScore"][d.name];

				if(selectedCountry.node() === this) {
					return zoomOutOnClick();
				}
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
			      	.call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));
			});
	});
});

//Draw cities on the map
//d3.csv("cities.csv", function(error, data) {
//    g.selectAll("circle")
//    	.data(data)
//        .enter()
//        .append("a")
//		.attr("xlink:href", function(d) {
//					   return "https://www.google.com/search?q="+d.city;}
//				  )
//        .append("circle")
//        .attr("cx", function(d) {
//                return projection([d.lon, d.lat])[0];
//        })
//        .attr("cy", function(d) {
//                return projection([d.lon, d.lat])[1];
//        })
//        .attr("r", 5)
//        .style("fill", "red");
//});

/**
 * [Create and order (based on score) dictionary of Country: [beer, score],
 * another one of Country: Average score, another one of Country: Average alcool
 * another one of Country: Average calory and returns them all]
 * @param  {[CSV]} data [CSV file]
 * @return {[dictionary]}     [The dictionaries with key beerDict, avgScore, avgAlc and avgCal]
 */
function csvToBeerDict(data) {
	let dictWithAvg = {};
	let beerDict = {};
	let avgScore = {};
	let avgAlc = {};
	let avgCal = {};

	for(let i = 0; i < data.length; i++) {
		let country = data[i].country;
		let score = data[i].score;
		let name = data[i].name;
		let alcool = data[i].abv;
		let cal = data[i].cal;

		//Filter sparse data
		if(country === "" || name === "" || score === "" || alcool === "" || cal === "") {
			continue;
		}

		score = parseInt(score);
		alcool = parseInt(alcool);
		cal = parseInt(cal);

		//Clean USA data
		if(country.indexOf(" USA") > -1) {
			country = "United States of America";
		}

		//Clean UK data
		if(country === "England" || country === "Scotland" || country === "Wales" || country === "Northern Ireland") {
			country = "United Kingdom";
		}

		if(!(country in beerDict)) {
			beerDict[country] = [];
			avgScore[country] = 0;
			avgAlc[country] = 0;
			avgCal[country] = 0;
		}
		beerDict[country].push([[name], score]);
		avgScore[country] += score;
		avgAlc[country] += alcool;
		avgCal[country] += cal;
	}

	// Ordering and getting average for each country.
	for(let key in beerDict){
		beerDict[key].sort(function(x, y){return y[1] - x[1]});
		avgScore[key] = avgScore[key] / beerDict[key].length;
		avgAlc[key] = avgAlc[key] / beerDict[key].length;
		avgCal[key] = avgCal[key] / beerDict[key].length;
	}

	dictWithAvg["beerDict"] = beerDict;
	dictWithAvg["avgScore"] = avgScore;
	dictWithAvg["avgAlc"] = avgAlc;
	dictWithAvg["avgCal"] = avgCal;
	return dictWithAvg;
};

function changeMap() {
	selectedMap = d3.select('select').property('value');
	console.log(selectedMap);
}

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
