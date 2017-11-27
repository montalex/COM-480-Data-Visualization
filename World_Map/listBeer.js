const sizeShown = 5;
const unknown = "unknown";

function listBeer(data, name, isCountry) {
	let beers = [];
		for(let i = 0; (i < data.length) && (beers.length < sizeShown); i++) {
			let c = "";
			if(isCountry) {
				c = data[i].country;

				//Clean USA data
				if(c.indexOf(" USA") > -1) {
					c = "United States of America";
				}
				//Clean UK data
				if(c === "England" || c === "Scotland" || c === "Wales" || c === "Northern Ireland") {
					c = "United Kingdom";
				}
			} else {
				c = data[i].city;
			}

			if((c === name) && (c != "")) {
				switch(selectedMap) {
					case "Alcool %":
						if(data[i].abv === "") {
							beers.push([data[i].name, " " + unknown]);
						} else {
							beers.push([data[i].name, " " + data[i].abv + "%"]);
						}
						break;
					case "Calory":
						if(data[i].cal === "") {
							beers.push([data[i].name, " " + unknown]);
						} else {
							beers.push([data[i].name, " " + data[i].cal + " cal."]);
						}
						break;
					default:
						if(data[i].score === "") {
							beers.push([data[i].name, " " + unknown]);
						} else {
							beers.push([data[i].name, " " + data[i].score]);
						}
				}
			}
		}
		d3.select("#information").selectAll("li")
			.data(beers)
			.enter()
			.append("li")
			.html(String)
			.style("font-size", "10px")
			.on("click", function(d) {
				removeChart();
				drawChart(d[0]);
			});
};

/**
 * [Clean list of beer from side div]
 */
function removeListBeer() {
	d3.select("#information").selectAll("li")
		.remove();
}
