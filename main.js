const width = 1068;
const height = 641;
const beerData_path = "data/final_rateBeer.csv";

// Select Box name
const select_box = ["Score", "Alcool %", "Calory"];

// D3 Projection
const projection = d3.geoNaturalEarth1()
	.scale(230)
	.translate([width / 2, height / 2]);

d3.select(window).on("resize", sizeChange);

// path generator to convert JSON to SVG paths
let path = d3.geoPath().projection(projection);
let selectedMap = "Score";
// Create select box
let options = d3.select('#button-select')
	.selectAll('button')
	.data(select_box)
	.enter()
	.append('button')
	.attr('class', 'btn btn-default')
	.text(d => { return d; })
	.on('click', function(d) {
		selectedMap = d;
		d3.select('#container').selectAll('path').remove();
		d3.select('#container').selectAll('circle').remove();
		drawMap(beerData_path, countries);
		drawCities(beerData_path);
	});

let svg = d3.select("#container")
	.append("svg")
	.attr("class", "container")
	.attr("width", "100%")
	.attr("height", "100%")
	.append("g");

// Setup center map for Zooming - Dezooming
svg.transition()
	.duration(0)
	.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + 1 + ")translate(" + - width / 2 + "," + -height / 2 + ")")

let selectedCountry = d3.select(null);

// Append Div for tooltip to SVG
let div = d3.select("body")
    .append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

// Countries variable get filled by the json
let countries = null;

d3.json("data/world-map.json", json => {
	countries = topojson.feature(json, json.objects.countries);
	// Adding Country name to json.
	d3.csv("data/country-code.csv", data => {
		// Loop through each country data value in the .csv file
		for(let i = 0; i < data.length; i++) {
			// Country code
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
	drawMap(beerData_path, countries);
	drawCities(beerData_path);
});

// Rescale when window size changes
function sizeChange() {
	d3.select("g").attr("transform", "scale(" + $("#container").width()/900 + ")");
	$("svg").height($("#container").width()*0.6);
};
