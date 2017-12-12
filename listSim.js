function listSim (beerName) {

    d3.json('Data/beer_CosSim.json', json => {


        function tabulate(data, columns) {

            let data2 = [];

            for(var i in data)
                data2.push(data[i]);


            let rows = d3.select("#table-sim").selectAll("tr")
                .data(data2)
                .enter()
                .append('tr')
                .style("font-size", "15px")

            // create a cell in each row for each column
            var cells = rows.selectAll('td')
                .data(function (row) {
                    return columns.map(function (column) {
                        return {column: column, value: row[column]};
                    });
                })
                .enter()
                .append('td')
                .text(function (d) { return d.value; });

            return table;
        }

        // render the table(s)
        console.log(json[beerName])
        tabulate(json[beerName], ['name', 'country','city','sim']); // 4 column table

    });

}

function removeListSim() {
    d3.select("#table-sim").selectAll("tr").remove();
}
