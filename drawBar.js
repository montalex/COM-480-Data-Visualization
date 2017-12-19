function drawBar(cntryName) {
    let margin = {
                  top: 20,
                  right: 20,
                  bottom: 150,
                  left: 40
              };

    let width = 1000 - margin.left - margin.right;
    let height = 400 - margin.top - margin.bottom;


    // set the ranges
    let x = d3.scaleBand().rangeRound([5, width], .05);

    let y = d3.scaleLinear().range([height, 0]);

    // define the axis
    let xAxis = d3.axisBottom()
        .scale(x);


    let yAxis = d3.axisLeft()
        .scale(y)
        .ticks(10);


    // add the SVG element
    let svg = d3.select("#barchart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("class", "barchart")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");


    // load the data
    d3.json("./data/beer_styles.json", (error, data) => {
        console.log(data[cntryName])

        
        data[cntryName].forEach(d => {
            d.name = d.name;
            d.count = +d.count;
        });


        // scale the range of the data
        x.domain(data[cntryName].map(d => d.name));

        y.domain([0, d3.max(data[cntryName], d => d.count)]);

        // add axis
        svg.append("g")
            .attr("class", "x axis-bar")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "-.55em")
            .attr("transform", "rotate(-90)");

        svg.append("g")
            .attr("class", "y axis-bar")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 5)
            .attr("dy", "0.70em")
            .style("text-anchor", "end")
            .attr("fill", "#5D6971")
            .text("Count");


        // Add bar chart
        svg.selectAll("bar")
            .data(data[cntryName])
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.name)+10)
            .attr("width", x.bandwidth()-20)
            .attr("y", d => y(d.count))
            .attr("height", d => height - y(d.count));

    });
    
}
function removeBar() {
    d3.select("#barchart").selectAll("svg")
        .remove();
}

