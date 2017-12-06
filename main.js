const width = 1000;
const height = 500;
const width_map = width * 70 / 100;
const height_map = height;
const beerData_path = "data/final_rateBeer.csv";

// Select Box name
const select_box = ["Score", "Alcool %", "Calory"];

// D3 Projection
const projection = d3.geoNaturalEarth1()
	.center([25, 10])
	.scale(200);

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
	.text(d => { return d; });
let selectedMap = d3.select('select').property('value');

let svg = d3.select("#container")
	.append("svg")
	.attr("class", "container")
	.attr("width", "100%")
	.attr("height", "100%")
	.append("g");

let selectedCountry = d3.select(null);

//colormap for selected dropdown option
const color = d3.scaleLog()
	.range(["hsl(62,100%,90%)", "hsl(228,30%,20%)"])
	.interpolate(d3.interpolateHcl);

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

// Modify map when selection in dropdown is changed
function changeMap() {
	selectedMap = d3.select('select').property('value');
	d3.select('#container').selectAll('path').remove();
	d3.select('#container').selectAll('circle').remove();
	drawMap(beerData_path, countries);
	drawCities(beerData_path);
};

// Rescale when window size changes
function sizeChange() {
	d3.select("g").attr("transform", "scale(" + $("#container").width()/900 + ")");
	$("svg").height($("#container").width()*0.6);
};

// Zooming
var zoom = d3.zoom()
    .on("zoom", zooming);
svg.call(zoom);

function zooming() {
	d3.select("g").attr("transform", d3.event.transform);
};

// Zooming out when reclicking on same country
function zoomOutOnClick() {
	selectedCountry.classed("active", false);
	selectedCountry = d3.select(null);
	svg.transition()
		.duration(750)
		.call(zoom.transform, d3.zoomIdentity);
}
