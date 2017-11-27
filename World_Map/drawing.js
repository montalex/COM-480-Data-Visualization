/**
 * [Draws map in the svg]
 * @param  {[String]} data_path [Path to csv file]
 * @param  {[topoJson]} countries [topoJson list of countries]
 */
function drawMap(data_path, countries) {
	d3.csv(data_path, data => {
		const fullDict = csvToBeerDict(data);
		let selectedDict = "avgScore";
		let selectedText = "Average Score: ";
		switch(selectedMap) {
			case "Alcool %":
				selectedDict = "avgAlc";
				selectedText = "Average Alcool %: ";
				break;
			case "Calory":
				selectedDict = "avgCal";
				selectedText = "Average Calories: ";
				break;
			default:
				selectedDict = "avgScore";
				selectedText = "Average Score: ";
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
				if(selectedMap === "Calory") {
					colorValue = Math.max(colorValue / 100, 1.0);
				}
				return color(colorValue);
			})
			.on("click", function(d) {
				//Clean text block on new click
				document.getElementById("cityName").innerHTML = "";
				document.getElementById("information").style.display = "block";
				document.getElementById("countryName").innerHTML = "Country: " +  d.name;
				document.getElementById("averageScore").innerHTML =  selectedText + fullDict[selectedDict][d.name];
				removeListBeer();

				if(selectedCountry.node() === this) {
					document.getElementById("countryName").innerHTML = "";
					document.getElementById("averageScore").innerHTML =  "";
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
			      	translate = [width_map / 2 - scale * x + 100, height_map / 2 - scale * y - 100];

			  	svg.transition()
			    	.duration(750)
			      	.call(zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));
				listBeer(data, d.name, true);
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
	        .style("fill", "red")
			.on("click", function(d) {
				document.getElementById("cityName").innerHTML = "City: " +  d.city;
				removeListBeer();
				listBeer(data, d.city, false);
			});
	});
};
