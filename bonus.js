function makeResponsive() {

    //set variable that selects svg area
    var svgArea = d3.select("body").select("svg");

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    if (!svgArea.empty()) {
        svgArea.remove();
      }

    //set svg params
    var svgWidth = window.innerWidth - 150;
    var svgHeight = window.innerHeight;


    //define chart's margins
    var chartMargin = {
        top: 100,
        bottom: 100,
        right: 50,
        left: 75    
    };

    //define dimensions of the chart area
    var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
    var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

    //select id=scatter, append SVG area to it, and set the dimensions
    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);


    //append a group area, shift svg area by left and top margins
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`)

    
    // set initial axis params
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";


    // function used for updating x and y-scale var upon click on axis label
    function xScale(healthData, chosenXAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(healthData, d => d[chosenXAxis] -2),
            d3.max(healthData, d => d[chosenXAxis] +2)
        ])
        .range([0, chartWidth]);
  
        return xLinearScale;
    }

    function yScale(healthData, chosenYAxis) {
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(healthData, d => d[chosenYAxis] -2),
            d3.max(healthData, d => d[chosenYAxis] +2)
        ])
        .range([chartHeight, 0]);
    
        return yLinearScale;
    }

    // function used for updating x and y-Axis var upon click on axis label
    function renderXAxis(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
  
        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);
  
        return xAxis;
    } 

    function renderYAxis(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
  
        yAxis.transition()
            .duration(1000)
        .call(leftAxis);
  
        return yAxis;
    }

    // function used for updating circles group with a transition to new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
  
        return circlesGroup;
    }

    // function to update text within circles
    function renderStateText(circlesAbbrGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        circlesAbbrGroup.transition()
            .duration(1000)
            .attr("x", d => newXScale(d[chosenXAxis]))
            .attr("y", d => newYScale(d[chosenYAxis]));
  
        return circlesAbbrGroup;
    } 

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

        var xlabel;
        var ylabel;

        //conditionals for x axis
        if (chosenXAxis === "poverty") {
            xlabel = "Poverty (%): ";
        }
        else if (chosenXAxis === "age") {
            xlabel = "Age (Median): ";
        }
        else {
            xlabel = "Household Income (Median): ";
        }

        //conditionals for y axis
        if (chosenYAxis === "healthcare") {
            ylabel = "Lacks Healthcare (%):";
        }
        else if (chosenYAxis === "smokes") {
            ylabel = "Smokes (%):";
        }
        else {
            ylabel = "Obesity (%):";
        }

        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([0, 0])
            .html(function(d) {
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
        });

        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        // onmouseout event
            .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

        return circlesGroup;
    }

    //load data from csv file
    d3.csv("assets/data/data.csv").then(function(healthData, err) {
        if (err) throw err;

        //print data in console
        console.log(healthData);

        //convert all numerical data in csv file from string to integer
        healthData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.healthcare = +data.healthcare;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
            });
    
        // x and y LinearScales
        var xLinearScale = xScale(healthData, chosenXAxis);
        var yLinearScale = yScale(healthData, chosenYAxis);

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x and y axis
        var xAxis = chartGroup.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

        var yAxis = chartGroup.append("g")
            .attr("class", "y-axis")
            .call(leftAxis);

        //create circles for scatter plot
        var circlesGroup = chartGroup.selectAll("circle")
            .data(healthData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", "12")
            .attr("fill", "blue")
            .attr("opacity", ".5")
            .attr("class", "circles");


        //add state abbreviations to circles
        var circlesAbbrGroup = chartGroup.selectAll("text")
            .data(healthData)
            .enter()
            .append("text")
            .text(d => (d.abbr))
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .attr("font-family", "sans-serif")
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "10px")
            .style("font-weight", "bold")
            .attr("alignment-baseline", "central")
            .attr("class", "stateAbbr");
    

        // Create group for 3 x-axis labels
        var xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

        var povertyLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("Poverty (%)");

        var ageLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Income (Median)");

        //Create group for 3 y-axis labels
        var ylabelsGroup = chartGroup.append("g");

        var healthcareLabel = ylabelsGroup.append("text")
            .attr("transform","rotate(-90)")
            .attr("y", 0 - 20)
            .attr("x", 0 - (chartHeight / 2))
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("Lacks Healthcare (%)");

        var smokesLabel = ylabelsGroup.append("text")
            .attr("transform","rotate(-90)")
            .attr("y", 0 - 40)
            .attr("x", 0 - (chartHeight / 2))
            .attr("value", "smokes") // value to grab for event listener
            .classed("inactive", true)
            .text("Smokes (%)");

        var obesityLabel = ylabelsGroup.append("text")
            .attr("transform","rotate(-90)")
            .attr("y", 0 - 60)
            .attr("x", 0 - (chartHeight / 2))
            .attr("value", "obesity") // value to grab for event listener
            .classed("inactive", true)
            .text("Obesity (%)");

        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circlesGroup);

        // x axis labels event listener
        xlabelsGroup.selectAll("text")
            .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(healthData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxis(xLinearScale, xAxis); 
            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            circlesAbbrGroup = renderStateText(circlesAbbrGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis )

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circlesAbbrGroup);

            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel 
                    .classed("active", false)
                    .classed("inactive", true);
                
            }
            else if (chosenXAxis === "age") {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
          }
        });
    

        // y axis labels event listener
        ylabelsGroup.selectAll("text")
            .on("click", function() {
        // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

            // replaces chosenXAxis with value
            chosenYAxis = value;

            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(healthData, chosenYAxis);

            // updates x axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis); 
            // updates circles and text with new y values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            circlesAbbrGroup = renderStateText(circlesAbbrGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup,circlesAbbrGroup);

            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel 
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === "smokes") {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                obesityLabel 
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel 
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
    }); 

});

}
//call makeResponsize function when browser opens
makeResponsive();

//call makeResponsize function when broswer resized
d3.select(window).on("resize", makeResponsive);