const margin = {top: 20, right: 50, bottom: 70, left: 80};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const yMinVal = 0
const yMaxVal = 1
const yRange = yMaxVal - yMinVal

const xAxisName = "Composition X"
const yAxisName = "Composition Y"

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
    .attr("transform", `translate(0, ${height})`) // yScale positioning is inverted in d3
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

// Generate Data
function equiDataCalc(comp) {
    return Math.pow(1 - Math.pow(comp - 1, 2), 0.5);
}

var equilData = [];
var step = 0.0001;
var qVal = 0.5;
var refluxRatio = 3;
var distillatePurity = 0.9;
var distillateRate = 50;
var inletRate = 100;

const xF = 0.55;

for (var xVal = 0; xVal < 1; xVal += step) {
    var dataPoint = {
        // composition, vapour curve, liquid curve
        compVal: xVal,

        equiDataVal: equiDataCalc(xVal),
        tolVal: xVal * 0.3 + 0.6,
        bolVal: xVal * 2.3 - 0.1,
        line45Val: xVal,
        qLineVal: xVal * (qVal) / (qVal - 1) + (xF) / (1 - qVal)
    };

    equilData.push(dataPoint);
}

function generateQLine(q, dataPoints) {
    var newData = []

    for (dataPoint of dataPoints) {
        calculatedQ = dataPoint.compVal * (q) / (q - 1) + (xF) / (1 - q)

        var newDataPoint = {
            qLineVal: calculatedQ,
            compVal: dataPoint.compVal
        }

        newData.push(newDataPoint);
    }

    return newData
}

// Define line functions
var equiLine = d3.line()
    .x(function (d) {return xScale(d.compVal)})
    .y(function (d) {return yScale(d.equiDataVal)});

var line45Line = d3.line()
    .x(function (d) {return xScale(d.compVal)})
    .y(function (d) {return yScale(d.line45Val)});

var qLine = d3.line()
    .x(function (d) {return xScale(d.compVal)})
    .y(function (d) {return yScale(d.qLineVal)});

var tolLine = d3.line()
    .x(function (d) {return xScale(d.compVal)})
    .y(function (d) {return yScale(d.tolVal)});

var bolLine = d3.line()
    .x(function (d) {return xScale(d.compVal)})
    .y(function (d) {return yScale(d.bolVal)});

// Add equilibrium line to chartArea
chartArea.append("path")
    .datum(equilData)
    .attr("class", "equi-line")
    .attr("fill", "none")
    .style("stroke", "black")
    .attr("stroke-width", 1.5) 
    .attr("d", equiLine);

// Add 45-line to chartArea
chartArea.append("path")
    .datum(equilData)
    .attr("class", "line")
    .attr("fill", "none")
    .style("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("d", line45Line);

// Add q-line to chartArea
chartArea.append("path")
    .datum(equilData)
    .attr("class", "q-line")
    .attr("fill", "none")
    .style("stroke", "red")
    .attr("stroke-width", 2)
    .style("filter", "url(#glow)") // Apply the glow effect
    .attr("d", qLine);

// Add ToL to chartArea
chartArea.append("path")
    .datum(equilData)
    .attr("class", "tol-line")
    .attr("fill", "none")
    .style("stroke", "black")
    .style("stroke-dasharray", "8, 12")  
    .attr("stroke-width", 2)
    .attr("d", tolLine);

// Add BoL to charArea
chartArea.append("path")
    .datum(equilData)
    .attr("class", "line")
    .attr("fill", "none")
    .style("stroke", "black")
    .style("stroke-dasharray", "8, 12")  // Set the dash pattern (4 units of line, 4 units of gap)
    .attr("stroke-width", 2)
    .attr("d", bolLine);

var qSlider = document.getElementById("q-slider");
var qValueSpan = document.getElementById("q-value");

qSlider.addEventListener("input", function() {
    // Get the new q value from the slider
    var newQValue = parseFloat(qSlider.value);

    // Update the q value display
    qValueSpan.textContent = newQValue.toFixed(2);

    var newQLineData = generateQLine(newQValue, equilData)

    var intersectPoint = findTolEquiIntersect(equilData);

    var minReflux = checkMinReflux(intersectPoint, equilData.map(dataPoint => dataPoint.compVal), newQLineData.map(dataPoint => dataPoint.qLineVal));

    var isGlowing = minReflux;

    chartArea.select(".q-line")
        .datum(newQLineData)
        .attr("d", qLine);

    chartArea.select(".equi-line")
        .style("filter", isGlowing ? "url(#glow)" : "none")
        .style("stroke", isGlowing ? "red" : "black")
    
    chartArea.select(".tol-line")
        .style("filter", isGlowing ? "url(#glow)" : "none")
        .style("stroke", isGlowing ? "red" : "black")
});

function findTolEquiIntersect(data) {
    var minDistance = 2;

    for (dataPoint of data) {
        var lineDistance = Math.abs(dataPoint.tolVal - dataPoint.equiDataVal);

        if (lineDistance < minDistance) {
            minDistance = lineDistance;
            var yVal = dataPoint.tolVal;
            var xVal = dataPoint.compVal
        }
    }

    return {
        yOrdinate: yVal, 
        xOrdinate: xVal
    }
}

function checkMinReflux(point, compData, qData) {

    var index = compData.indexOf(point.xOrdinate)
    var qDistance = Math.abs(point.yOrdinate - qData[index])

    if (qDistance < 0.0075) {
        return true;
    } else {
        return false;
    }
}

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