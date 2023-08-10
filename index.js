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

// Generate Data
var initialData = [];
const step = 0.0001;
const qVal = 0.5;
const refluxRatio = 0.5;
const distillatePurity = 0.9;
const feedComp = 0.55;

function calculateEquilVal(comp) {
    return Math.pow(1 - Math.pow(comp - 1, 2), 0.5);
}

function calculateTolVal(r, comp, xD) {
    return comp * (r) / (r + 1) + (xD) / (1 + r)
}

function calculateBolVal(comp) {
    return 2.3 * comp - 0.1
}

function calculateQVal(q, comp, xF) {
    return comp * (q) / (q - 1) + (xF) / (1 - q)
}

function updateTolLine(r, compVals, xD) {
    var newData = []

    for (compPoint of compVals) {
        tolPoint = calculateTolVal(r, compPoint, xD)

        var newDataPoint = {
            tolVal: tolPoint,
            compVal: compPoint
        }

        if (isNaN(tolPoint)) {
            console.log("NaN detected in tolPoint calculation:");
        }

        newData.push(newDataPoint);
    }

    return newData
}

function updateQLine(q, compVals, xF) {
    var newData = []

    for (compPoint of compVals) {
        qPoint = calculateQVal(q, compPoint, xF)

        var newDataPoint = {
            qLineVal: qPoint,
            compVal: compPoint
        }

        newData.push(newDataPoint);
    }

    return newData
}

for (var xVal = 0; xVal < 1; xVal += step) {
    var dataPoint = {

        compVal: xVal,
        equiDataVal: calculateEquilVal(xVal),
        tolVal: calculateTolVal(refluxRatio, xVal, distillatePurity),
        bolVal: calculateBolVal(xVal),
        line45Val: xVal,
        qLineVal: calculateQVal(qVal, xVal, feedComp)
    };

    initialData.push(dataPoint);
}

compValArray = initialData.map(dataPoint => dataPoint.compVal)

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
    .style("stroke", "black")
    .style("stroke-dasharray", "8, 12")  
    .attr("stroke-width", 2)
    .attr("d", tolLine);

// Add BoL to charArea
chartArea.append("path")
    .datum(initialData)
    .attr("class", "bol-line")
    .attr("fill", "none")
    .style("stroke", "black")
    .style("stroke-dasharray", "8, 12")  // Set the dash pattern (4 units of line, 4 units of gap)
    .attr("stroke-width", 2)
    .attr("d", bolLine);

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

// Obtain slider information
var qSlider = document.getElementById("q-slider");
var qValueSpan = document.getElementById("q-value");

var refluxSlider = document.getElementById("reflux-slider");
var refluxValueSpan = document.getElementById("reflux-value");

var puritySlider = document.getElementById("purity-slider");
var purityValueSpan = document.getElementById("purity-value");


qSlider.addEventListener("input", handleSliderInput);
refluxSlider.addEventListener("input", handleSliderInput);
puritySlider.addEventListener("input", handleSliderInput);

function handleSliderInput() {
    var newQValue = parseFloat(qSlider.value);
    var newRefluxRatio = parseFloat(refluxSlider.value);
    var newPurity = parseFloat(puritySlider.value);

    // Update the slider value display
    qValueSpan.textContent = newQValue.toFixed(2);
    refluxValueSpan.textContent = newRefluxRatio.toFixed(2);
    purityValueSpan.textContent = newPurity.toFixed(2);

    var newQLineData = updateQLine(newQValue, compValArray, feedComp)
    var newTolLineData = updateTolLine(newRefluxRatio, compValArray, newPurity)

    var intersectPoint = findIntersect(initialData, newTolLineData);

    var minReflux = checkMinReflux(intersectPoint, compValArray, newQLineData.map(dataPoint => dataPoint.qLineVal));

    var isGlowing = minReflux;

    chartArea.select(".q-line")
        .datum(newQLineData)
        .attr("d", qLine);

    chartArea.select(".equi-line")
        .style("filter", isGlowing ? "url(#glow)" : "none")
        .style("stroke", isGlowing ? "red" : "black")
    
    chartArea.select(".tol-line")
        .datum(newTolLineData)
        .attr("d", tolLine)
        .style("filter", isGlowing ? "url(#glow)" : "none")
        .style("stroke", isGlowing ? "red" : "black")
};

function findIntersect(equiData, tolData) {
    var minDistance = 2;

    for (let index = 0; index < equiData.length; index++) {
        var lineDistance = Math.abs(tolData[index].tolVal - equiData[index].equiDataVal);

        if (lineDistance < minDistance) {
            minDistance = lineDistance;
            var yVal = tolData[index].tolVal;
            var xVal = tolData[index].compVal;
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

    if (qDistance < 0.01) {
        return true;
    } else {
        return false;
    }
}