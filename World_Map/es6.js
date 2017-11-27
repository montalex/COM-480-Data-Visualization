        function draw(json) {
          let margin = 0;
          let width = 400;
          let height = 400;
          let maxBarHeight = height / 2 - (margin + 70);

          let innerRadius = 0.1 * maxBarHeight; // innermost circle

          let svg = d3.select('body')
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("class", "chart")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

          let defs = svg.append("defs");

          let gradients = defs
            .append("linearGradient")
            .attr("id", "gradient-chart-area")
            .attr("x1", "50%")
            .attr("y1", "0%")
            .attr("x2", "50%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");

          gradients.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#EDF0F0")
            .attr("stop-opacity", 1);

          gradients.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#ACB7BE")
            .attr("stop-opacity", 1);

          gradients = defs
            .append("linearGradient")
            .attr("id", "gradient-questions")
            .attr("x1", "50%")
            .attr("y1", "0%")
            .attr("x2", "50%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");

          gradients.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#F6F8F9")
            .attr("stop-opacity", 1);

          gradients.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#D4DAE0")
            .attr("stop-opacity", 1);

          gradients = defs
            .append("radialGradient")
            .attr("id", "gradient-bars")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("cx", "0")
            .attr("cy", "0")
            .attr("r", maxBarHeight)
            .attr("spreadMethod", "pad");

          gradients.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#CEECF5");

          gradients.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", "#2ECCFA");

          gradients.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#01A9DB");

          svg.append("circle")
            .attr("r", maxBarHeight + 70)
            .classed("category-circle", true);

          svg.append("circle")
            .attr("r", maxBarHeight + 40)
            .classed("question-circle", true);

          svg.append("circle")
            .attr("r", maxBarHeight)
            .classed("chart-area-circle", true);

          svg.append("circle")
            .attr("r", innerRadius)
            .classed("center-circle", true);


          d3.json('./beer_desc.json', json => {
            console.log(json['Eagle Lager'])

            let cats = json['Eagle Lager'].map(({sens}, i) => sens);

            //console.log(cats)

            let catCounts = {};

            for (let num of cats) {
              catCounts[num] = catCounts[num] ? catCounts[num] + 1 : 1;
            }

            // remove dupes (not exactly the fastest)
            cats = cats.filter((v, i) => cats.indexOf(v) == i);
            let numCatBars = cats.length;

            let angle = 0;
            let rotate = 0;

            json['Eagle Lager'].forEach((d, i) => {
              // bars start and end angles
              d.startAngle = angle;
              angle += (2 * Math.PI) / numCatBars / catCounts[d.sens];
              d.endAngle = angle;

              // y axis minor lines (i.e. questions) rotation
              d.rotate = rotate;
              rotate += 360 / numCatBars / catCounts[d.sens];
            });

            // category_label
            let arc_category_label = d3.svg.arc()
              .startAngle((d, i) => (i * 2 * Math.PI) / numCatBars)
              .endAngle((d, i) => ((i + 1) * 2 * Math.PI) / numCatBars)
              .innerRadius(maxBarHeight + 40)
              .outerRadius(maxBarHeight + 64);

            let category_text = svg.selectAll("path.category_label_arc")
              .data(cats)
              .enter().append("path")
              .classed("category-label-arc", true)
              .attr("id", (d, i) => "category_label_" + i) //Give each slice a unique ID
              .attr("fill", "none")
              .attr("d", arc_category_label);

            category_text.each(function(d, i) {
              //Search pattern for everything between the start and the first capital L
              let firstArcSection = /(^.+?)L/;

              //Grab everything up to the first Line statement
              let newArc = firstArcSection.exec(d3.select(this).attr("d"))[1];
              //Replace all the commas so that IE can handle it
              newArc = newArc.replace(/,/g, " ");

              //If the whole bar lies beyond a quarter of a circle (90 degrees or pi/2)
              // and less than 270 degrees or 3 * pi/2, flip the end and start position
              let startAngle = (i * 2 * Math.PI) / numCatBars;

              let endAngle = ((i + 1) * 2 * Math.PI) / numCatBars;

              if (startAngle > Math.PI / 2 && startAngle < 3 * Math.PI / 2 && endAngle > Math.PI / 2 && endAngle < 3 * Math.PI / 2) {
                let //Everything between the capital M and first capital A
                startLoc = /M(.*?)A/; //Everything between the 0 0 1 and the end of the string (denoted by $)

                let //Everything between the capital A and 0 0 1
                middleLoc = /A(.*?)0 0 1/;

                let endLoc = /0 0 1 (.*?)$/;
                //Flip the direction of the arc by switching the start and end point (and sweep flag)
                let newStart = endLoc.exec(newArc)[1];
                let newEnd = startLoc.exec(newArc)[1];
                let middleSec = middleLoc.exec(newArc)[1];

                //Build up the new arc notation, set the sweep-flag to 0
                newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
              } //if

              //Create a new invisible arc that the text can flow along
              /*                            svg.append("path")
               .attr("class", "hiddenDonutArcs")
               .attr("id", "category_label_"+i)
               .attr("d", newArc)
               .style("fill", "none");*/

              // modifying existing arc instead
              d3.select(this).attr("d", newArc);
            });

            svg.selectAll(".category-label-text")
              .data(cats)
              .enter().append("text")
              .attr("class", "category-label-text")
              //.attr("x", 0)   //Move the text from the start angle of the arc
              //Move the labels below the arcs for those slices with an end angle greater than 90 degrees
              .attr("dy", (d, i) => {
              let startAngle = (i * 2 * Math.PI) / numCatBars;
              let endAngle = ((i + 1) * 2 * Math.PI) / numCatBars;
              return (startAngle > Math.PI / 2 && startAngle < 3 * Math.PI / 2 && endAngle > Math.PI / 2 && endAngle < 3 * Math.PI / 2 ? -4 : 14);
            })
              .append("textPath")
              .attr("startOffset", "50%")
              .style("text-anchor", "middle")
              .attr("xlink:href", (d, i) => "#category_label_" + i)
              .text(d => d.toUpperCase());

            // question_label
            let arc_question_label = d3.svg.arc()
              .startAngle(({startAngle}, i) => startAngle)
              .endAngle(({endAngle}, i) => endAngle)
              //.innerRadius(maxBarHeight + 2)
              .outerRadius(maxBarHeight + 2);

            let question_text = svg.selectAll("path.desc_arc")
              .data(json['Eagle Lager'])
              .enter().append("path")
              .classed("question-label-arc", true)
              .attr("id", (d, i) => "question_label_" + i) //Give each slice a unique ID
              .attr("fill", "none")
              .attr("d", arc_question_label);

            question_text.each(function({startAngle, endAngle}, i) {
              //Search pattern for everything between the start and the first capital L
              let firstArcSection = /(^.+?)L/;

              //Grab everything up to the first Line statement
              let newArc = firstArcSection.exec(d3.select(this).attr("d"))[1];
              //Replace all the commas so that IE can handle it
              newArc = newArc.replace(/,/g, " ");

              //If the end angle lies beyond a quarter of a circle (90 degrees or pi/2)
              //flip the end and start position
              if (startAngle > Math.PI / 2 && startAngle < 3 * Math.PI / 2 && endAngle > Math.PI / 2 && endAngle < 3 * Math.PI / 2) {
                let //Everything between the capital M and first capital A
                startLoc = /M(.*?)A/; //Everything between the 0 0 1 and the end of the string (denoted by $)

                let //Everything between the capital A and 0 0 1
                middleLoc = /A(.*?)0 0 1/;

                let endLoc = /0 0 1 (.*?)$/;
                //Flip the direction of the arc by switching the start and end point (and sweep flag)
                let newStart = endLoc.exec(newArc)[1];
                let newEnd = startLoc.exec(newArc)[1];
                let middleSec = middleLoc.exec(newArc)[1];

                //Build up the new arc notation, set the sweep-flag to 0
                newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
              } //if

              //Create a new invisible arc that the text can flow along
              /*                            svg.append("path")
               .attr("class", "hiddenDonutArcs")
               .attr("id", "question_label_"+i)
               .attr("d", newArc)
               .style("fill", "none");*/

              // modifying existing arc instead
              d3.select(this).attr("d", newArc);
            });

            question_text = svg.selectAll(".question-label-text")
              .data(json['Eagle Lager'])
              .enter().append("text")
              .attr("class", "question-label-text")
              //.attr("x", 0)   //Move the text from the start angle of the arc
              //.attr("y", 0)
              //Move the labels below the arcs for those slices with an end angle greater than 90 degrees
              /*                        .attr("dy", function (d, i) {
               return (d.startAngle > Math.PI / 2 && d.startAngle < 3 * Math.PI / 2 && d.endAngle > Math.PI / 2 && d.endAngle < 3 * Math.PI / 2 ? 10 : -10);
               })*/
              .append("textPath")
              //.attr("startOffset", "50%")
              //.style("text-anchor", "middle")
              //.style("dominant-baseline", "central")
              .style('font-size', '7px')
              .style('font-family', 'sans-serif')
              .attr("xlink:href", (d, i) => "#question_label_" + i)
              .text(({desc}) => desc.toUpperCase())
              .call(wrapTextOnArc, maxBarHeight);

            // adjust dy (labels vertical start) based on number of lines (i.e. tspans)
            question_text.each(function({startAngle, endAngle}, i) {
              //console.log(d3.select(this)[0]);
              let textPath = d3.select(this)[0][0];

              let tspanCount = textPath.childNodes.length;

              if (startAngle > Math.PI / 2 && startAngle < 3 * Math.PI / 2 && endAngle > Math.PI / 2 && endAngle < 3 * Math.PI / 2) {
                // set baseline for one line and adjust if greater than one line
                d3.select(textPath.childNodes[0]).attr("dy", 3 + (tspanCount - 1) * -0.6 + 'em');
              } else {
                d3.select(textPath.childNodes[0]).attr("dy", -2.1 + (tspanCount - 1) * -0.6 + 'em');
              }
            });

            /* bars */
            let arc = d3.svg.arc()
              .startAngle(({startAngle}, i) => startAngle)
              .endAngle(({endAngle}, i) => endAngle)
              .innerRadius(innerRadius);

            let bars = svg.selectAll("path.bar")
              .data(json['Eagle Lager'])
              .enter().append("path")
              .classed("bars", true)
              .each(d => {
                d.outerRadius = innerRadius;
              })
              .attr("d", arc);

            bars.transition().ease("elastic").duration(1000).delay((d, i) => i * 100)
              .attrTween("d", (d, index) => {
                let i = d3.interpolate(d.outerRadius, x_scale(+d.score));
                return t => {
                  d.outerRadius = i(t);
                  return arc(d, index);
                };
              });

            let x_scale = d3.scale.linear()
              .domain([0, 100])
              .range([innerRadius, maxBarHeight]);


            let y_scale = d3.scale.linear()
              .domain([0, 100])
              .range([-innerRadius, -maxBarHeight]);

            svg.selectAll("circle.x.minor")
              .data(y_scale.ticks(5))
              .enter().append("circle")
              .classed("gridlines minor", true)
              .attr("r", d => x_scale(d));

            // question lines
            svg.selectAll("line.y.minor")
              .data(json['Eagle Lager'])
              .enter().append("line")
              .classed("gridlines minor", true)
              .attr("y1", -innerRadius)
              .attr("y2", -maxBarHeight - 40)
              .attr("transform", (d, i) => "rotate(" + (d.rotate) + ")");

            // category lines
            svg.selectAll("line.y.major")
              .data(cats)
              .enter().append("line")
              .classed("gridlines major", true)
              .attr("y1", -innerRadius)
              .attr("y2", -maxBarHeight - 70)
              .attr("transform", (d, i) => "rotate(" + (i * 360 / numCatBars) + ")");
          });
        }

        // https://bl.ocks.org/mbostock/7555321
        function wrapTextOnArc(text, radius) {
          // note getComputedTextLength() doesn't work correctly for text on an arc,
          // hence, using a hidden text element for measuring text length.
          let temporaryText = d3.select('svg')
            .append("text")
            .attr("class", "temporary-text") // used to select later
            .style("font", "7px sans-serif")
            .style("opacity", 0); // hide element

          let getTextLength = string => {
            temporaryText.text(string);
            return temporaryText.node().getComputedTextLength();
          };

          text.each(function({endAngle, startAngle}) {
            let text = d3.select(this);

            let //Don't cut non-breaking space (\xA0), as well as the Unicode characters \u00A0 \u2028 \u2029)
            words = text.text().split(/[ \f\n\r\t\v]+/).reverse();

            let word;
            let wordCount = words.length;
            let line = [];
            let textLength;

            let // ems
            lineHeight = 1.1;

            let x = 0;
            let y = 0;
            let dy = 0;
            let tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
            let arcLength = ((endAngle - startAngle) / (2 * Math.PI)) * (2 * Math.PI * radius);
            let paddedArcLength = arcLength - 16;

            while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join(" "));
              textLength = getTextLength(tspan.text());
              tspan.attr("x", (arcLength - textLength) / 2);

              if (textLength > paddedArcLength && line.length > 1) {
                // remove last word
                line.pop();
                tspan.text(line.join(" "));
                textLength = getTextLength(tspan.text());
                tspan.attr("x", (arcLength - textLength) / 2);

                // start new line with last word
                line = [word];
                tspan = text.append("tspan").attr("dy", lineHeight + dy + "em").text(word);
                textLength = getTextLength(tspan.text());
                tspan.attr("x", (arcLength - textLength) / 2);
              }
            }
          });

          d3.selectAll("text.temporary-text").remove()
        }