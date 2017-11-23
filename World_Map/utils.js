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
		beerDict[key].sort((x, y) => {return y[1] - x[1]});
		avgScore[key] = (avgScore[key] / beerDict[key].length).toFixed(2);
		avgAlc[key] = (avgAlc[key] / beerDict[key].length).toFixed(2);
		avgCal[key] = (avgCal[key] / beerDict[key].length).toFixed(2);
	}

	dictWithAvg["beerDict"] = beerDict;
	dictWithAvg["avgScore"] = avgScore;
	dictWithAvg["avgAlc"] = avgAlc;
	dictWithAvg["avgCal"] = avgCal;
	return dictWithAvg;
};

/**
 * [Returns every cities from the given country with localisation]
 * @param  {[CSV]} data        [CSV file]
 * @param  {[String]} countryName [The country to look for]
 * @return {[dictionary]}             [A dictionary citieName : localisation]
 */
function citiesDict(data, countryName) {
	let citiesDict = {};
	for(let i = 0; i < data.length; i++) {
		let country = data[i].country;
		//Clean USA data
		if(country.indexOf(" USA") > -1) {
			country = "United States of America";
		}
		//Clean UK data
		if(country === "England" || country === "Scotland" || country === "Wales" || country === "Northern Ireland") {
			country = "United Kingdom";
		}

		if(country === countryName) {
			citiesDict[data[i].city] = [data[i].lat, data[i].lon];
		}
	}
	return citiesDict;
};
