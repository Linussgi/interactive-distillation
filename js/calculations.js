const rv = 1.901;

export function calculateEquilVal(comp) {
    return comp * rv / (1 + comp * (rv - 1));
}

export function calculateTolVal(r, comp, xD) {
    return comp * (r) / (r + 1) + (xD) / (1 + r);
}

export function calculateBolVal(comp) {
    return 2.3 * comp - 0.1;
}

export function calculateQVal(q, comp, xF) {
    return comp * (q) / (q - 1) + (xF) / (1 - q);
}

// Calculate new ToL line data when slider is changed
export function updateTolLine(r, compVals, xD) {
    var newData = [];

    for (let compPoint of compVals) {
        let tolPoint = calculateTolVal(r, compPoint, xD);

        var newDataPoint = {
            tolVal: tolPoint,
            compVal: compPoint
        };

        newData.push(newDataPoint);
    }
    return newData;
}

// Calculate new q-line line data when slider is changed
export function updateQLine(q, compVals, xF) {
    var newData = [];
    if (q == 1 || q == 0) {
        var offset = 0.0005;
    } else {
        var offset = 0;
    }

    for (let compPoint of compVals) {
        let qPoint = calculateQVal(q + offset, compPoint, xF);

        var newDataPoint = {
            qLineVal: qPoint,
            compVal: compPoint
        };

        newData.push(newDataPoint);
    }

    return newData;
}

// Find where tol or q-line intersects equilibrium line
export function findIntersect(systemData, dataArray) {
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
    };
}

export function checkMinReflux(qPoint, tolPoint) {
    var xDiff = Math.abs(qPoint.xOrdinate - tolPoint.xOrdinate);
    var yDiff = Math.abs(qPoint.yOrdinate - tolPoint.yOrdinate);

    if (xDiff < 0.01 && yDiff < 0.01) {
        return true;
    } else {
        return false;
    }
}

export function findEquilinePoint(purity, toldata, boldata, equildata, comp) {
    var closestDistance = 2;

    for (let point of equildata) {
        if (point.equiDataVal - purity < closestDistance) {
            closestDistance = point.equiDataVal;
            var equiXVal = point.compVal;
        }
    }
}