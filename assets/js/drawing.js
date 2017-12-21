let fullDict = {};
let selectedDict = "avgScore";
let selectedText = "Average Score: ";
let centered = null;

//colormap for selected dropdown option
const colorScore = d3.scaleLinear().domain([0,5])
	.range([d3.rgb('#F5DF86'), d3.rgb('#C04800')])
	.interpolate(d3.interpolateHcl);

const colorAlc = d3.scaleLinear().domain([0,20])
	.range([d3.rgb('#F5DF86'), d3.rgb('#C04800')])
	.interpolate(d3.interpolateHcl);

const colorCal = d3.scaleLinear().domain([0,400])
	.range([d3.rgb('#F5DF86'), d3.rgb('#C04800')])
	.interpolate(d3.interpolateHcl);

var colorLegend = null;
/**
 * [Draws map in the svg]
 * @param  {[String]} data_path [Path to csv file]
 * @param  {[topoJson]} countries [topoJson list of countries]
 */
function drawMap(data_path, countries) {
	d3.csv(data_path, data => {
		fullDict = csvToBeerDict(data);
		switch(selectedMap) {
			case "Alcool %":
				selectedDict = "avgAlc";
				selectedText = "Average Alcool (%)";
				break;
			case "Calories":
				selectedDict = "avgCal";
				selectedText = "Average kCalories";
				break;
			default:
				selectedDict = "avgScore";
				selectedText = "Average Score";
		}
		//Draw map
		d3.select("g").selectAll("path")
			.data(countries.features)
			.enter()
			.append("path")
			.attr("class", "boundary")
			.attr("d", path)
			.style("fill", d => {
				//return color based on average
				let colorValue = fullDict[selectedDict][d.name];
				if(colorValue == undefined) {
					colorValue = 0;
				}
				if(selectedMap === "Alcool %") {
					return colorAlc(colorValue);
				} else if(selectedMap === "Calories") {
					return colorCal(colorValue);
				} else {
					return colorScore(colorValue);
				}

			})
			.on("click", function(d) {
				//Clean text block on new click
				document.getElementById("cityName").innerHTML = "";
				document.getElementById("information").style.display = "block";
				document.getElementById("countryName").innerHTML = d.name;
				document.getElementById("averageScore").innerHTML =  selectedText;
                document.getElementById("score").innerHTML =  fullDict[selectedDict][d.name];

				removeListBeer();
				removeChart();
				removeListSim();
				listBeer(data, d.name, true);
                removeBar();
                drawBar(d.name);
			    zoomOnCountry(d);
			});
	});
};

/**
 * [Draws the city on the map as circles]
 * @param  {[String]} data_path [Data path]
 */
function drawCities(data_path) {
	d3.csv(data_path, data => {
	    d3.select("g").selectAll("circle")
	    	.data(data)
	        .enter()
	        .append("circle")
	        .attr("cx", function(d) {
	            return projection([d.lon, d.lat])[0];
	        })
	        .attr("cy", function(d) {
	            return projection([d.lon, d.lat])[1];
	        })
	        .attr("r", 1)
	        .style("fill", "#3f3f3f")
			.on("click", function(d) {
				document.getElementById("countryName").innerHTML = d.country;
				document.getElementById("cityName").innerHTML = d.city;
				document.getElementById("averageScore").innerHTML =  selectedText;
                document.getElementById("score").innerHTML =  fullDict[selectedDict][d.country];
				removeChart();
				removeListBeer();
				removeListSim();
				listBeer(data, d.city, false);
			});
	});
};

function zoomOnCountry(d) {
	let x, y, zoom, limits, dx, dy;
	if (d && centered !== d) {
		let centroid = path.centroid(d);
		x = centroid[0];
		y = centroid[1];
		centered = d;
		limits = path.bounds(d);
		dx = limits[1][0] - limits[0][0];
		dy = limits[1][1] - limits[0][1];
		zoom = Math.max(1, Math.min(3, 0.9 / Math.max(dx / width, dy / height)));
	} else {
		x = width / 2;
		y = height / 2;
		zoom = 1;
		centered = null;
		document.getElementById("countryName").innerHTML = "";
		document.getElementById("averageScore").innerHTML =  "";
        document.getElementById("score").innerHTML =  "";
		removeListBeer();
		removeBar();
	}

	svg.selectAll("path")
	  .classed("active", centered && function(d) { return d === centered; });

	svg.transition()
		.duration(750)
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + zoom + ")translate(" + -x + "," + -y + ")")
}

function focusOnElement(element_id) {
     $('#div_' + element_id).goTo(); // need to 'go to' this element
}
