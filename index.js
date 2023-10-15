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
const initialQVal = 0.5;
const initialRefluxRatio = 0.5;
const initialPurity = 0.9;
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

// Calculate new ToL line data when slider is changed
function updateTolLine(r, compVals, xD) {
    var newData = []

    for (compPoint of compVals) {
        tolPoint = calculateTolVal(r, compPoint, xD)

        var newDataPoint = {
            tolVal: tolPoint,
            compVal: compPoint
        }

        newData.push(newDataPoint);
    }
    return newData
}

// Calculate new q-line line data when slider is changed
function updateQLine(q, compVals, xF) {
    var newData = []
    if (q == 1 || q == 0){
        var offset = 0.0005
    } else {
        var offset = 0
    }

    for (compPoint of compVals) {
        qPoint = calculateQVal(q + offset, compPoint, xF)

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
        tolVal: calculateTolVal(initialRefluxRatio, xVal, initialPurity),
        bolVal: calculateBolVal(xVal),
        line45Val: xVal,
        qLineVal: calculateQVal(initialQVal, xVal, feedComp)
    };

    initialData.push(dataPoint);
}

// Composition data often useful to have as an array
const compValArray = initialData.map(dataPoint => dataPoint.compVal)

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
    .style("stroke-dasharray", "10, 10")  // Set the dash pattern (x units of line, y units of gap)
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

const paragraph1 = document.getElementById("paragraph1");
const paragraph2 = document.getElementById("paragraph2");
const paragraph3 = document.getElementById("paragraph3");

qSlider.addEventListener("input", sliderEventHandler);
refluxSlider.addEventListener("input", sliderEventHandler);
puritySlider.addEventListener("input", sliderEventHandler);

// What runs when an event occurs
function sliderEventHandler() {
    var newQValue = parseFloat(qSlider.value);
    var newRefluxRatio = parseFloat(refluxSlider.value);
    var newPurity = parseFloat(puritySlider.value);

    qValueSpan.textContent = newQValue.toFixed(2);
    refluxValueSpan.textContent = newRefluxRatio.toFixed(2);
    purityValueSpan.textContent = newPurity.toFixed(2);

    var newQLineData = updateQLine(newQValue, compValArray, feedComp);
    var newTolLineData = updateTolLine(newRefluxRatio, compValArray, newPurity);

    var newTolValArray = newTolLineData.map(dataPoint => dataPoint.tolVal);
    var newQValArray = newQLineData.map(dataPoint => dataPoint.qLineVal);

    var qPos = findIntersect(initialData, newQValArray);
    var tolPos = findIntersect(initialData, newTolValArray);

    var minReflux = checkMinReflux(qPos, tolPos);
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
        .style("stroke", isGlowing ? "red" : "blue")
    
    changeDisplayText(qPos.yOrdinate, tolPos.yOrdinate, minReflux)
};

// Find where tol or q-line intersects equilibrium line
function findIntersect(systemData, dataArray) {
    var minDistance = 2;

    for (let index = 0; index < systemData.length - 10; index++) { 
        var lineDistance = Math.abs(dataArray[index] - systemData[index].equiDataVal);

        if (lineDistance < minDistance) {
            minDistance = lineDistance;
            var yVal = dataArray[index];
            var xVal = systemData[index].equiDataVal;
        }
    }
    return {
        yOrdinate: yVal, 
        xOrdinate: xVal
    }
}

function checkMinReflux(qPoint, tolPoint) {
    var xDiff = Math.abs(qPoint.xOrdinate - tolPoint.xOrdinate)
    var yDiff = Math.abs(qPoint.yOrdinate - tolPoint.yOrdinate)

    if (xDiff < 0.01 && yDiff < 0.01) {
        return true
    } else {
        return false
    }
}

// Determine text to display
function changeDisplayText(qVal, tolIntersect, atEdge) {
    if (qVal < tolIntersect && !atEdge) {
        paragraph1.style.display = "block";
        paragraph2.style.display = "none";
        paragraph3.style.display = "none";
    } else if (qVal > tolIntersect && !atEdge) {
        paragraph1.style.display = "none";
        paragraph2.style.display = "block";
        paragraph3.style.display = "none";
    } else {
        paragraph1.style.display = "none";
        paragraph2.style.display = "none";
        paragraph3.style.display = "block";
    }
}