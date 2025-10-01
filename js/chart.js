const margin = { top: 20, right: 50, bottom: 70, left: 80 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const yMinVal = 0;
const yMaxVal = 1;
const yRange = yMaxVal - yMinVal;

const xAxisName = "Composition X";
const yAxisName = "Composition Y";

// Create SVG element
var svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("border", "2px solid")
    .style("margin-left", "auto")
    .style("margin-right", "auto")
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Define xScale scale
var xScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, width]);

// Define yScale scale
var yScale = d3.scaleLinear()
    .domain([yMinVal, yMaxVal])
    .range([height, 0]);

// Add the gridlines
svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat(""))
    .selectAll(".tick line")
    .attr("stroke-width", 0.5);

svg.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat(""))
    .selectAll(".tick line")
    .attr("stroke-width", 0.5);

// Add xScale-axis
svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale))
    .style("font-size", "16px");

// Add yScale-axis
svg.append("g")
    .call(d3.axisLeft(yScale))
    .style("font-size", "16px");

// Append xScale-axis label
svg.append("text")
    .attr("class", "xScale-axis-label")
    .attr("x", width / 2)
    .attr("y", height + margin.top + 30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .text(xAxisName);

// Append yScale-axis label
svg.append("text")
    .attr("class", "yScale-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .text(yAxisName);

// Define clip path
svg.append("defs").append("clipPath")
    .attr("id", "chart-clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

// Create a group for the chart area with clipping
var chartArea = svg.append("g")
    .attr("clip-path", "url(#chart-clip)");

// Define line functions
var equiLine = d3.line()
    .x(function (d) { return xScale(d.compVal) })
    .y(function (d) { return yScale(d.equiDataVal) });

var line45Line = d3.line()
    .x(function (d) { return xScale(d.compVal) })
    .y(function (d) { return yScale(d.line45Val) });

var qLine = d3.line()
    .x(function (d) { return xScale(d.compVal) })
    .y(function (d) { return yScale(d.qLineVal) });

var tolLine = d3.line()
    .x(function (d) { return xScale(d.compVal) })
    .y(function (d) { return yScale(d.tolVal) });

var bolLine = d3.line()
    .x(function (d) { return xScale(d.compVal) })
    .y(function (d) { return yScale(d.bolVal) });

// Define the filter for the glow effect
var glowFilter = svg.append("defs")
    .append("filter")
    .attr("id", "glow")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");

glowFilter.append("feGaussianBlur")
    .attr("stdDeviation", "3")
    .attr("result", "coloredBlur");

var feMerge = glowFilter.append("feMerge");

feMerge.append("feMergeNode")
    .attr("in", "coloredBlur");
feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");

// Function to initialize chart with data
export function initializeChart(initialData) {
    // Add equilibrium line to chartArea
    chartArea.append("path")
        .datum(initialData)
        .attr("class", "equi-line")
        .attr("fill", "none")
        .style("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("d", equiLine);

    // Add 45-line to chartArea
    chartArea.append("path")
        .datum(initialData)
        .attr("class", "line-45")
        .attr("fill", "none")
        .style("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("d", line45Line);

    // Add q-line to chartArea
    chartArea.append("path")
        .datum(initialData)
        .attr("class", "q-line")
        .attr("fill", "none")
        .style("stroke", "red")
        .attr("stroke-width", 2)
        .style("filter", "url(#glow)")
        .attr("d", qLine);

    // Add ToL to chartArea
    chartArea.append("path")
        .datum(initialData)
        .attr("class", "tol-line")
        .attr("fill", "none")
        .style("stroke", "blue")
        .style("stroke-dasharray", "10, 10")
        .attr("stroke-width", 2)
        .attr("d", tolLine);

    // Add BoL to charArea
    chartArea.append("path")
        .datum(initialData)
        .attr("class", "bol-line")
        .attr("fill", "none")
        .style("stroke", "black")
        .style("stroke-dasharray", "10, 10")
        .attr("stroke-width", 2)
        .attr("d", bolLine);
}

// Function to update chart lines
export function updateChartLines(newQLineData, newTolLineData, isGlowing, showQLine) {
    if (showQLine == true) {
        chartArea.select(".q-line")
            .datum(newQLineData)
            .attr("d", qLine);

        chartArea.select(".equi-line")
            .style("filter", isGlowing ? "url(#glow)" : "none")
            .style("stroke", isGlowing ? "red" : "black");

        chartArea.select(".tol-line")
            .datum(newTolLineData)
            .attr("d", tolLine)
            .style("filter", isGlowing ? "url(#glow)" : "none")
            .style("stroke", isGlowing ? "red" : "blue");
    } else {
        chartArea.select(".q-line")
            .remove();
    }
}

// Export chartArea for external access if needed
export { chartArea };