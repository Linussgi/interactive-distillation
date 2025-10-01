import { 
    calculateEquilVal, 
    calculateTolVal, 
    calculateBolVal, 
    calculateQVal,
    updateTolLine,
    updateQLine,
    findIntersect,
    checkMinReflux
} from "./calculations.js";

import { initializeChart, updateChartLines } from "./chart.js";

// Initial values
const step = 0.0001;
const initialQVal = 0.5;
const initialRefluxRatio = 0.5;
const initialPurity = 0.9;
const feedComp = 0.55;

// Generate Data
var initialData = [];

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

// Composition data (used for most calculations in the tool)
const compValArray = initialData.map(dataPoint => dataPoint.compVal);

// Initialize the chart
initializeChart(initialData);

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

var showQLine = true;

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

    updateChartLines(newQLineData, newTolLineData, isGlowing, showQLine);
    changeDisplayText(qPos.yOrdinate, tolPos.yOrdinate, minReflux);
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