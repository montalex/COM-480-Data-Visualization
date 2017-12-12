const sizeShown = 5;
const unknown = "unknown";
let lastSelected = null;

function listBeer(data, name, isCountry) {
	let beers = [];
	let index = 1;
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
			temp_list = [index, data[i].name];
			if(data[i].score === "") {
				temp_list.push(unknown);
			} else {
				temp_list.push(data[i].score);
			}
			if(data[i].abv === "") {
				temp_list.push(unknown);
			} else {
				temp_list.push(data[i].abv + "%");
			}

			if(data[i].cal === "") {
				temp_list.push(unknown);
			} else {
				temp_list.push(data[i].cal);
			}
			beers.push(temp_list);
			index += 1;
		}
	}

	let rows = d3.select("#beer-table-body").selectAll("tr")
		.data(beers)
		.enter()
		.append("tr")
		.style("font-size", "15px")
		.on("click", function(d) {
			removeChart();
			drawChart(d[1]);
            removeListSim();
            listSim (d[1]);

		});
	lastSelected = rows;
	rows.append("td")
		.text(function(d) {
			return d[0]
		}).on("click", function(){
			lastSelected.style("background-color", "white");
			lastSelected = d3.select(this.parentNode).style("background-color", "#F79400");
		});
	rows.append("td")
		.text(function(d) {
			return d[1]
		}).on("click", function(){
			lastSelected.style("background-color", "white");
			lastSelected = d3.select(this.parentNode).style("background-color", "#F79400");
		});
	rows.append("td")
		.text(function(d) {
			return d[2]
		}).on("click", function(){
			lastSelected.style("background-color", "white");
			lastSelected = d3.select(this.parentNode).style("background-color", "#F79400");
		});
	rows.append("td")
		.text(function(d) {
			return d[3]
		}).on("click", function(){
			lastSelected.style("background-color", "white");
			lastSelected = d3.select(this.parentNode).style("background-color", "#F79400");
		});
	rows.append("td")
		.text(function(d) {
			return d[4]
		}).on("click", function(){
			lastSelected.style("background-color", "white");
			lastSelected = d3.select(this.parentNode).style("background-color", "#F79400");
		});
};

/**
 * [Clean list of beer from side div]
 */
function removeListBeer() {
	d3.select("#beer-table-body").selectAll("tr").remove();
}
