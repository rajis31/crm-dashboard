chart1(data1);
chart2(data2, ["won", "lost"]);
chart3(data3);
chart4(data4);
chart5(data5);

//Bar Chart showing Total sold by SalesPerson
function chart1(data) {
    let margins = {
        top: 30,
        bottom: 30,
        left: 55,
        right: 30
    };
    // define chart dimensions 
    let height = 500 - margins.top - margins.bottom;
    let width = 550 - margins.left - margins.right;


    //select svg 
    let svg = d3.select("#chart1").append("svg")
        .attr("height", height + margins.top + margins.right)
        .attr("width", width + margins.left + margins.right)
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

    //define the axes
    let x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, width])
        .padding(0.1);

    let y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.total_sold) + 1000])
        .range([height, 0]);

    //Create Chart Bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.name))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.total_sold))
        .attr("height", d => height - y(d.total_sold));

    // Add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add title 
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margins.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("font", "arial")
        .style("text-decoration", "underline")
        .style("text-underline-position", "under")
        .text("Total Sales by Sales Person");

    // add X Axis title
    svg.append("text")
        .attr("x", (width - 50) / 2)
        .attr("y", height + margins.top + margins.bottom - 30)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Sales RM");

    // add Y Axis Title
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height - 100) / 2)
        .attr("y", -55)
        .attr("dy", "0.71em")
        .style("font-weight", "bold")
        .attr("text-anchor", "end")
        .attr("font-size", "12px")
        .style("font-weight", "bold")
        .text("Total Sold");
}

//bar chart showing # of transactions won and lost 
function chart2(data, columns) {

    // Create empty SVG Element
    let svg = d3.select("#chart2").select("svg")

    // Define Chart Dimensions
    let margin = {
        top: 30,
        right: 30,
        bottom: 30,
        left: 30
    };

    let width = +svg.attr("width") - margin.left - margin.right;
    let height = +svg.attr("height") - margin.top - margin.bottom;
    let g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create X Axis scale
    let x = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.05)
        .align(0.1);

    // Create Y Axis scale
    let y = d3.scaleLinear()
        .rangeRound([height, 0]);

    // Create colors for the stacks
    let z = d3.scaleOrdinal()
        .range(["blue", "red"]);

    // Add Total column to data
    function add_total(d, i, columns) {
        for (i = 0, t = 0; i < columns.length; ++i) {
            t += d[columns[i]] = +d[columns[i]];
        }
        d.total = t;
        return d;
    }

    // Map the total column to data array using .map function
    data = data.map((d, idx) => add_total(d, idx, ["won", "lost"]))

    let keys = columns;

    // Sort Data in descending order which is represented on the chart
    data.sort(function (a, b) {
        return b.total - a.total;
    });

    // Map data to axes
    x.domain(data.map(function (d) {
        return d.name;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.total;
    })]).nice();
    z.domain(keys);

    // Create Chart
    g.append("g")
        .selectAll("g")
        .data(d3.stack().keys(keys)(data))
        .enter().append("g")
        .attr("fill", function (d) {
            return z(d.key);
        })
        .selectAll("rect")
        .data(function (d) {
            return d;
        })
        .enter().append("rect")
        .attr("x", function (d) {
            return x(d.data.name);
        })
        .attr("y", function (d) {
            return y(d[1]);
        })
        .attr("height", function (d) {
            return y(d[0]) - y(d[1]);
        })
        .attr("width", x.bandwidth())
        .on("mouseover", function () {
            tooltip.style("display", null);
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
        })
        .on("mousemove", function (d) {
            let xPosition = d3.mouse(this)[0] - 5;
            let yPosition = d3.mouse(this)[1] - 5;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text(d[1] - d[0]);
        });

    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start");

    let legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 20 + ")";
        });

    // add Chart Title
    g.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("font", "arial")
        .style("text-decoration", "underline")
        .text("Deals Won and Lost by Sales Person");

    // Append Legend to Top Right
    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function (d) {
            return d;
        });

    // Create Tooltips when user hovers the bars
    let tooltip = svg.append("g")
        .attr("class", "tooltip")
        .style("display", "none");

    tooltip.append("rect")
        .attr("width", 60)
        .attr("height", 20)
        .attr("fill", "white")
        .style("opacity", 0.5);

    tooltip.append("text")
        .attr("x", 30)
        .attr("dy", "1.2em")
        .style("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold");

}


// create horizontal barchart of total sales to goal

function chart3(data) {
    // Set the chart dimensions 
    let margins = {
        top: 30,
        right: 20,
        bottom: 30,
        left: 60
    };
    let width = 500 - margins.left - margins.right;
    let height = 500 - margins.top - margins.bottom;

    // Set the axes 
    //define the axes
    let y = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([height, 0])
        .padding(0.1);


    let x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.met) + 10])
        .range([0, width]);


    //select svg 
    let svg = d3.select("#chart3").append("svg")
        .attr("height", height + margins.top + margins.right)
        .attr("width", width + margins.left + margins.right)
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("width", d => x(d.met))
        .attr("y", d => y(d.name))
        .attr("height", y.bandwidth());

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + (height) + ")")
        .call(d3.axisBottom(x).tickFormat(d => d + "%"));

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // add title 
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - (margins.top / 2) + 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("font", "arial")
        .style("text-decoration", "underline")
        .text("Total Sales to Goal Met");

    // add X Axis title
    svg.append("text")
        .attr("x", width - 50)
        .attr("y", height + margins.top + margins.bottom - 65)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("% Goal");

    // add Y Axis Title
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height - 100) / 2)
        .attr("y", -45)
        .attr("dy", "0.71em")
        .style("font-weight", "bold")
        .attr("text-anchor", "end")
        .attr("font-size", "12px")
        .style("font-weight", "bold")
        .text("Sales RM");

}

// create line chart showing avg days completed by salesperson

// create linechart of avg days sold by salesperson
function chart4(data) {
    // define dimensions 
    let margins = {
        "top": 30,
        "bottom": 30,
        "left": 50,
        "right": 50
    };
    let height = 500 - margins.top - margins.bottom;
    let width = 500 - margins.left - margins.right;

    // create svg element 
    let svg = d3.select("#chart4").append("svg")
        .attr("width", width + margins.left + margins.right)
        .attr("height", height + margins.top + margins.bottom)
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

    // create axis scales
    let xscale = d3.scaleBand()
        .domain(data.map(d => d.name))
        .rangeRound([0, width])
        .padding(0.8)
    let yscale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.days)])
        .range([height, 0])

    let line = d3.line()
        .x(d => xscale(d.name))
        .y(d => yscale(d.days))
        .curve(d3.curveMonotoneX);


    // append x axis to svg
    svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xscale));

    // append y axis to svg
    svg.append("g")
        .attr("class", "yAxis")
        .call(d3.axisLeft(yscale).ticks(10));

    // append the line 
    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", function (d) {
            return xscale(d.name);
        })
        .attr("cy", function (d) {
            return yscale(d.days);
        })
        .attr("r", 4);

    // add title 
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margins.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("font", "arial")
        .style("text-decoration", "underline")
        .text("Avg Time to Completion");

    // add X Axis title
    svg.append("text")
        .attr("x", (width - 50) / 2)
        .attr("y", height + margins.top + margins.bottom - 30)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Sales Person");

    // add Y Axis Title
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height - 100) / 2)
        .attr("y", -40)
        .attr("dy", "0.71em")
        .style("font-weight", "bold")
        .attr("text-anchor", "end")
        .attr("font-size", "12px")
        .style("font-weight", "bold")
        .text("Avg Days to Sell");

}

// create linechart of total sold by year 

function chart5(data) {

    // define dimensions 
    let margins = {
        "top": 30,
        "bottom": 30,
        "left": 60,
        "right": 50
    };
    let height = 500 - margins.top - margins.bottom;
    let width = 500 - margins.left - margins.right;

    // create svg element 
    let svg = d3.select("#chart5").append("svg")
        .attr("width", width + margins.left + margins.right)
        .attr("height", height + margins.top + margins.bottom)
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

    // create axis scales
    let xscale = d3.scaleBand()
        .domain(data.map(d => d.year))
        .rangeRound([0, width])
        .padding(0.9);

    let yscale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.total)])
        .range([height, 0])

    // Append Line to Chart
    let line = d3.line()
        .x(d => xscale(d.year))
        .y(d => yscale(d.total))
        .curve(d3.curveMonotoneX);


    // append x axis to svg
    svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xscale));

    // append y axis to svg
    svg.append("g")
        .attr("class", "yAxis")
        .call(d3.axisLeft(yscale).ticks(10));

    // append the line 
    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    // append points
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", function (d) {
            return xscale(d.year);
        })
        .attr("cy", function (d) {
            return yscale(d.total);
        })
        .attr("r", 4);

    // add title 
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margins.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("font", "arial")
        .style("text-decoration", "underline")
        .text("Total Sold by Year");

    // add axes title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margins.top + margins.bottom - 30)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Year");

    // add Y Axis Title
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height - 100) / 2)
        .attr("y", -60)
        .attr("dy", "0.71em")
        .style("font-weight", "bold")
        .attr("text-anchor", "end")
        .attr("font-size", "12px")
        .style("font-weight", "bold")
        .text("Total Sold");
}