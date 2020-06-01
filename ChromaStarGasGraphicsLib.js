
//    
// Set up the canvas:
//

    // **********  Basic canvas parameters: These are numbers in px - needed for calculations:
    // All plots and other output must fit within this region to be white-washed between runs

    var xRangeText = 2050;
    var yRangeText = 65;
    var xOffsetText = 10;
    var yOffsetText = 10;
    var charToPxText = 4; // width of typical character font in pixels - CAUTION: finesse!


// Graphical output section:


//  NOTE!!!
//  
//  The remaining lines of code or so are all devoted to the graphical (and textual) output.  
//  Have not been able to spin this stuff off into separare function that can be called from 
//  seperate source files by the HTML code.  This is baaaaad!  :-(
//    

// ***** WARNING: Do NOT rearrange order of plot-wise code-blocks.  Some blocks use variables declared and initialized in
// previous blocks.  If you want to re-arrange the plots in the WWW page, change the row and column number
// indices (plotRow, plotCol) at the beginning of each block

//    
// Set up the canvas:
//

// Coordinate considerations with HTML5 <canvas>:
//Display coordinates for size and location of canvas with respect to browser viewport
// are set with CSS with JavaScript (JS) as in objectID.style.width = "***px" 
// (just like scripting a <div>)
//
//"Model" (ie. canvas) coordinates set in html document with <canvas width="***", ...>
// - The CSS (panlWidth & panelHeight) and HTML "width"s and "height"s have to match 
// for model and display coordinates to be on the same scale
// AND: display (CSS) coordinates are with repect to upper left corner of browser window (viewport)
//   BUT model (canvas) coordinates are with respect to upper left corner of *canvas*!
// So - we have to run two coordinate systems with different origins, but same scale
//   camelCase variables of form ***Cnvs are in canvas coordinates

//
// Offset note: Quantities that are relative offsets with respect to other elements 
// have name of form ***Offset;
// Generally, yOffsets must be *added* to the reference element's y-coordinate AND
// xOffsets must be *subtracted* from the reference element's x-coordinate
//  (origin is always upper left corner whether viewport or canvas)
//

// **********  Basic canvas parameters: These are numbers in px - needed for calculations:
// All plots and other output must fit within this region to be gray-washed between runs


//June 2017 - Graphics converted from <canvas> to scale-invariant <SVG> by Jason Bayer

// **************************
//
// Global graphical output variables:
//
//  Panel variables 
//  - set with HTML/CSS style parameters 
//  - in pixels
//
//
// These are with respect to browser viewport upper left corner 
// (ie. y coordinate increases *downward*) :
//
//
   //Origin of panel (upper left corner of panel)
   // - to be computeed for each panel from plotCol & spacingX 
   //    AND plotRow & spacingY
   var panelX, panelY;
//
// Whole number indices for row and column number in plot grid:
   var plotRow, plotCol;
//
   var panelWidth, panelHeight;
// 
   //horizontal and vertical intervals between panel origins
   //  - must be greater than panelWidth & panelHeight, respectively
   //  to avoid panel overlap
   var spacingX, spacingY;  //horizontal and vertical intervals between panel origins
//
   panelWidth = 450;
   panelHeight = 350;
   spacingX = panelWidth + 5;
   spacingY = panelHeight + 5;
//
// The following panel elements are clickable/hoverable HTML elements, so will be handled in CSS
// and so are with respect to the browser viewport:
// These are offsets from the panel origin (specifid by panelX & panelY), and so *seem*
// a lot like canvas coordinates:
//
// NOTE: Custom functions like txtPrint(), numPrint(), and plotPnt() always take these
// viewport oriented coordinates
// 
   var titleOffsetX, titleOffsetY; //main plot title origin
   var xAxisNameOffsetX, xAxisNameOffsetY;
   var yAxisNameOffsetX, yAxisNameOffsetY;
   titleOffsetX = 10;
   titleOffsetY = 10;
   xAxisNameOffsetX = 100;
   xAxisNameOffsetY = panelHeight - 35;
   yAxisNameOffsetX = 5;
   yAxisNameOffsetY = 100;
// ... and to hold the computed viewport coordinates:
   var titleX, titleY;
   var xAxisNameX, xAxisNameY;
   var yAxisNameX, yAxisNameY;

// Global offsets to provid white space above top-row plots
// and to the left of left-column plots (Needed??) 
   var xOffset, yOffset;
   xOffset = 3;
   yOffset = 3;

    //these are the corresponding strings in pixel units ready to be assigned to HTML/CSS style attributes
   var panelXStr;
   var panelYStr;
   var panelWidthStr = numToPxStrng(panelWidth);
   var panelHeightStr = numToPxStrng(panelHeight);
   var titleXStr, titleYStr;
   var xAxisNameXStr, xAxisNameYStr;
   var yAxisNameXStr, yAxisNameYStr;


//Background color of panels - a gray tone will accentuate most colors:
// 24 bit RGB color in hexadecimal notation:
    var wDefaultColor = "#F0F0F0"; //default value 
    var wDiskColor = wDefaultColor; //needed to finesse background colour of white light image 

    var charToPx = 4; // width of typical character font in pixels - CAUTION: finesse!


        var washer = function(plotRow, plotCol, wColor, areaId, cnvsId) {


        // Very first thing on each load: gray-wash the canvas!!
// Browser viewport coordinates for upper left corner of panel:
        panelX = xOffset + plotCol * spacingX;
        panelY = yOffsetText + yRangeText +
             yOffset + plotRow * spacingY;
        panelXStr = numToPxStrng(panelX);
        panelYStr = numToPxStrng(panelY);

//script the <div> container:
        areaId.style.position = "absolute";
        areaId.style.width = panelWidthStr;
        areaId.style.height = panelHeightStr;
        areaId.style.marginTop = panelYStr;
        areaId.style.marginLeft = panelXStr;
        areaId.style.backgroundColor = wColor;
//
//script the <canvas>:
                        //JB
        cnvsId.style.position = "absolute";
        cnvsId.style.width = panelWidthStr;
        cnvsId.style.height = panelHeightStr;
        cnvsId.style.opacity = "1.0";
        cnvsId.style.backgroundColor = wColor;
        cnvsId.style.zIndex = 0;

        //Wash the canvas:
        areaId.appendChild(cnvsId);

        var panelOrigin = [panelX, panelY];

        return panelOrigin;

    };


//
//
// These global parameters are for the HTML5 <svg> element 
//   - in pixls
//   - with respect to upper left corner of *panel* (not viewport!)
//   Assumes that <canvas> HTML width/height in html doc and CSS JS 
//   canvas width/height are the same for a 1:1 scaling (see main graphical
//   section comments above). 
//
    //******* axis, tick mark, and tick-value properties: 

//Origins of plot axes
   var xAxisXCnvs, xAxisYCnvs; //x-axis
   var yAxisXCnvs, yAxisYCnvs; //y-axis
   xAxisXCnvs = 95; //should be greater than yAxisNameOffset  
   xAxisYCnvs = panelHeight - 65; //should be greater than xAxisNameOffset  
   yAxisXCnvs = xAxisXCnvs; //Have x & y axes meet at common origin
   // yAxisYCnvs must be initialized below...

//
//Lengths of plot axes
   var xAxisLength, yAxisLength;
   xAxisLength = 300; //should be less than (panelWidth - yAxisXCnvs)    
   yAxisLength = 200; //should be less than (panelHeight - xAxisYCnvs)    
   yAxisYCnvs = xAxisYCnvs - yAxisLength; // *top* of the y-axis - Have x & y axes meet at common origin

    //tick marks:
    //This is either or a height or width depending on whether an x-axis or a y-axis tick: 
    var tickLength = 8; 
//Offsets with respect to relevent axis:
    var xTickYOffset = (-1 * tickLength) / 2;
    var yTickXOffset = (-1 * tickLength) / 2;
//tick mark value label offsets:
    var xValYOffset = 2 * tickLength;
    var yValXOffset = (-4 * tickLength);

//
//Other general values:
//Default color of plot elements:
  var lineColor = "#000000"; //black
  var wColor = "#222222";
//Default one thickness of plot elements:
  var lineThick = 1;
//

    //
    //
    //
    // ********* XBar()
    //
    //
    //
//// Draws a horizontal line (for any purpose) at a given DATA y-coordinate (yVal) 
//and returns the DEVICE y-coordinate (yShift) for further use by calling routine
// (such as placing an accompanying annotation)
//
    var XBar = function(yVal, minYDataIn, maxYDataIn, barWidthCnvs, barHeightCnvs,
            xFinesse, color, areaId, cnvsId) {
                                        //JB
        var yBarPosCnvs = yAxisLength * (yVal - minYDataIn) / (maxYDataIn - minYDataIn);
        //       xTickPos = xTickPos;

        //JB var xBarPosCnvs = xAxisLength * (xVal - minXDataIn) / (maxXDataIn - minXDataIn) ;
        var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yBarPosCnvs;

// Make the y-tick mark, Teff:
        var thisLine = document.createElementNS(xmlW3, 'line');
        thisLine.setAttributeNS(null, 'x1', yAxisXCnvs);
        thisLine.setAttributeNS(null, 'x2', yAxisXCnvs + barWidthCnvs);
        thisLine.setAttributeNS(null, 'y1', yShiftCnvs);
        thisLine.setAttributeNS(null, 'y2', yShiftCnvs);
        thisLine.setAttributeNS(null, 'stroke', color);
        thisLine.setAttributeNS(null, 'stroke-width', 2);
        cnvsId.appendChild(thisLine);

//
        return yShiftCnvs;
    };
    //

    //
    //
    //
    // ********* YBar()
    //
    //
    //

// Draws a vertical line (for any purpose) at a given DATA x-coordinate (xVal) 
//and returns the DEVICE x-coordinate (xShift) for further use by calling routine
// (such as placing an accompanying annotation)
// CAUTION: input parameter barHeightCnvs gets ADDED to input parameter yFinesse
// and bar will be drawn DOWNWARD from (yAxisYCnvs + yFinesse)

    var YBar = function(xVal, minXDataIn, maxXDataIn, barWidthCnvs, barHeightCnvs,
            yFinesse, color, areaId, cnvsId) {
                                        //JB
        var xBarPosCnvs = xAxisLength * (xVal - minXDataIn) / (maxXDataIn - minXDataIn);
        var xShiftCnvs = xAxisXCnvs + xBarPosCnvs;
        var yBarPosCnvs = yAxisYCnvs + yFinesse;

// Make the x-tick mark, Teff:
        var thisLine = document.createElementNS(xmlW3, 'line');
        thisLine.setAttributeNS(null, 'x1', xShiftCnvs);
        thisLine.setAttributeNS(null, 'x2', xShiftCnvs);
        thisLine.setAttributeNS(null, 'y1', yBarPosCnvs);
        thisLine.setAttributeNS(null, 'y2', yBarPosCnvs + barHeightCnvs);
        thisLine.setAttributeNS(null, 'stroke', color);
        thisLine.setAttributeNS(null, 'stroke-width', 2);
        cnvsId.appendChild(thisLine);

        return xShiftCnvs;
    };


    //
    //
    //
    //
    //
    //  ***** XAxis()
    //
    //
    //

    var XAxis = function(panelX, panelY,
            minXDataIn, maxXDataIn, xAxisName, fineness,
            areaId, cnvsId) {
                                //JB
        var axisParams = [];
        axisParams.length = 8;
        // Variables to handle normalization and rounding:
        var numParts = [];
        numParts.length = 2;

        //axisParams[5] = xLowerYOffset;
        var thisLine = document.createElementNS(xmlW3, 'line');
        thisLine.setAttributeNS(null, 'x1', xAxisXCnvs);
        thisLine.setAttributeNS(null, 'x2', xAxisXCnvs + xAxisLength);
        thisLine.setAttributeNS(null, 'y1', xAxisYCnvs);
        thisLine.setAttributeNS(null, 'y2', xAxisYCnvs);
        thisLine.setAttributeNS(null, 'stroke', lineColor);
        thisLine.setAttributeNS(null, 'stroke-width', 2);
        cnvsId.appendChild(thisLine);

        //console.log("minXDataIn, maxXDataIn " + minXDataIn + ", " + maxXDataIn);
        numParts = standForm(minXDataIn);
        //minXData = mantissa * Math.pow(10.0, numParts[1]);
        var mantissa0 = numParts[0];
        var exp0 = numParts[1];
        //maxXData = mantissa * Math.pow(10.0, numParts[1]);
        var mantissa1 = maxXDataIn / Math.pow(10.0, exp0);
        //var rangeXData = maxXData - minXData;
        var reverse = false; //initialization
        var rangeXData = mantissa1 - mantissa0;
        //console.log("XAxis: mantissa1 " + mantissa1 + " mantissa0 " + mantissa0);
        //console.log("XAxis: rangeXData " + rangeXData);
        //Catch axes that are supposed to be backwards
        if (rangeXData < 0.0) {
            rangeXData = -1.0 * rangeXData;
            reverse = true;
        }
        var deltaXData = 1.0; //default initialization
        if (rangeXData >= 100000.0) {
            deltaXData = 20000.0;
        } else if ((rangeXData >= 20000.0) && (rangeXData < 100000.0)) {
            deltaXData = 20000.0;
        } else if ((rangeXData >= 5000.0) && (rangeXData < 20000.0)) {
            deltaXData = 2000.0;
        } else if ((rangeXData >= 1000.0) && (rangeXData < 5000.0)) {
            deltaXData = 200.0;
        } else if ((rangeXData >= 200.0) && (rangeXData < 1000.0)) {
            deltaXData = 100.0;
        } else if ((rangeXData >= 100.0) && (rangeXData < 200.0)) {
            deltaXData = 25.0;
        } else if ((rangeXData >= 50.0) && (rangeXData < 100.0)) {
            deltaXData = 10.0;
        } else if ((rangeXData >= 20.0) && (rangeXData < 50.0)) {
            deltaXData = 10.0;
        } else if ((rangeXData >= 10.0) && (rangeXData < 20.0)) {
            deltaXData = 5.0;
        } else if ((rangeXData > 5.0) && (rangeXData <= 10.0)) {
            deltaXData = 2.0;
        } else if ((rangeXData > 2.0) && (rangeXData <= 5.0)) {
            deltaXData = 0.5;
        } else if ((rangeXData > 1.0) && (rangeXData <= 2.0)) {
            deltaXData = 0.25;
        } else if ((rangeXData > 0.5) && (rangeXData <= 1.0)) {
            deltaXData = 0.2;
        } else if ((rangeXData > 0.1) && (rangeXData <= 0.5)) {
            deltaXData = 0.1;
        } else if ((rangeXData > 0.01) && (rangeXData <= 0.1)) {
            deltaXData = 0.02;
        } else if (rangeXData < 0.01){
            deltaXData = 0.002;
        }

        if (fineness == "hyperfine"){
              deltaXData = deltaXData / 10.0;
             }
        if (fineness == "fine"){
             }
        if (fineness == "coarse"){
              deltaXData = deltaXData * 2.0;
             }

        var mantissa0new = mantissa0 - (mantissa0 % deltaXData) - deltaXData;
        var mantissa1new = mantissa1 - (mantissa1 % deltaXData) + deltaXData;
        var numerDiff = ((mantissa1new - mantissa0new) / deltaXData).toPrecision(6);
//        var numXTicks = Math.floor((mantissa1new - mantissa0new) / deltaXData);
        var numXTicks = Math.floor(numerDiff);
        if (reverse) {
            deltaXData = -1.0 * deltaXData;
            //minXData2 = minXData2 - deltaXData; //sigh - I dunno.
            numXTicks = (-1 * numXTicks); // + 1; //sigh - I dunno.
        }
        numXTicks++;
        var minXData2, maxXData2, rangeXData2;
        minXData2 = mantissa0new * Math.pow(10.0, exp0);
        maxXData2 = mantissa1new * Math.pow(10.0, exp0);
        rangeXData2 = (mantissa1new - mantissa0new) * Math.pow(10.0, exp0);
        deltaXData = deltaXData * Math.pow(10.0, exp0);
        //var deltaXData = rangeXData / (1.0 * numXTicks);
        //deltaXData = mantissa * Math.pow(10.0, numParts[1]);
        var deltaXPxl = panelWidth / (numXTicks - 1);
        var deltaXPxlCnvs = xAxisLength / (numXTicks - 1);

        //console.log("deltaXData " + deltaXData);
        //console.log("XAxis: mantissa1new " + mantissa1new + " mantissa0new " + mantissa0new);
        //console.log("XAxis: rangeXData2 " + rangeXData2);
        axisParams[1] = rangeXData2;
        axisParams[2] = deltaXData;
        axisParams[3] = deltaXPxl;
        axisParams[6] = minXData2;
        axisParams[7] = maxXData2;
        //
        var ii;
        for (var i = 0; i < numXTicks; i++) {

            ii = 1.0 * i;
            var xTickPos = ii * deltaXPxl;
            var xTickPosCnvs = ii * deltaXPxlCnvs;
            var xTickVal = minXData2 + (ii * deltaXData);
            var xTickRound = xTickVal.toPrecision(3); //default
        if (fineness == "hyperfine"){
            var xTickRound = xTickVal.toPrecision(5);
              }
        if (fineness == "fine"){
            var xTickRound = xTickVal.toPrecision(4);
              }
        if (fineness == "coarse"){
            var xTickRound = xTickVal.toPrecision(3);
              }

            //var xTickRound = xTickVal;
            var xTickValStr = xTickRound.toString(10);
            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;
// Make the x-tick mark, Teff:

            var thisLine = document.createElementNS(xmlW3, 'line');
            thisLine.setAttributeNS(null, 'x1', xShiftCnvs);
            thisLine.setAttributeNS(null, 'x2', xShiftCnvs);
            thisLine.setAttributeNS(null, 'y1', xAxisYCnvs + xTickYOffset);
            thisLine.setAttributeNS(null, 'y2', xAxisYCnvs + xTickYOffset + tickLength);
            thisLine.setAttributeNS(null, 'stroke', lineColor);
            thisLine.setAttributeNS(null, 'stroke-width', 2);
            cnvsId.appendChild(thisLine);

            //Make the tick label, Teff:
            txtPrint("<span style='font-size:small'>" + xTickValStr + "</span>",
                xShiftCnvs, xAxisYCnvs + xValYOffset, 50, lineColor, areaId);

        }  // end x-tickmark loop


// Add name of x-axis:
//Axis label still needs to be html so we can use mark-up
        xAxisNameX = panelX + xAxisNameOffsetX;
        xAxisNameY = panelY + xAxisNameOffsetY;
        txtPrint("<span style='font-size:small'>" + xAxisName + "</span>",
                xAxisNameOffsetX, xAxisNameOffsetY, 75, lineColor, areaId);

        return axisParams;

    };


    //
    //
    //
    //  ***** YAxis()
    //
    //
    //

    var YAxis = function(panelX, panelY,
            minYDataIn, maxYDataIn, yAxisName, 
            fineness, areaId, cnvsId) {
                        //JB
        var axisParams = [];
        axisParams.length = 8;
        // Variables to handle normalization and rounding:
        var numParts = [];
        numParts.length = 2;

        //axisParams[5] = xLowerYOffset;
        // Create the LEFT y-axis element and set its style attributes:

        var thisLine = document.createElementNS(xmlW3, 'line');
        thisLine.setAttributeNS(null, 'x1', yAxisXCnvs);
        thisLine.setAttributeNS(null, 'x2', yAxisXCnvs);
        thisLine.setAttributeNS(null, 'y1', yAxisYCnvs);
        thisLine.setAttributeNS(null, 'y2', yAxisYCnvs + yAxisLength);
        thisLine.setAttributeNS(null, 'stroke', lineColor);
        thisLine.setAttributeNS(null, 'stroke-width', 2);
        cnvsId.appendChild(thisLine);

        numParts = standForm(minYDataIn);
        //minYData = mantissa * Math.pow(10.0, numParts[1]);
        var mantissa0 = numParts[0];
        var exp0 = numParts[1];
        //maxYData = mantissa * Math.pow(10.0, numParts[1]);
        var mantissa1 = maxYDataIn / Math.pow(10.0, exp0);
        //var rangeYData = maxYData - minYData;
        var reverse = false; //initialization
        var rangeYData = mantissa1 - mantissa0;
        //Catch axes that are supposed to be backwards
        if (rangeYData < 0.0) {
            rangeYData = -1.0 * rangeYData;
            reverse = true;
        }
        var deltaYData = 1.0; //default initialization
        if (rangeYData >= 100000.0) {
            deltaYData = 20000.0;
        } else if ((rangeYData >= 20000.0) && (rangeYData < 100000.0)) {
            deltaXData = 25000.0;
        } else if ((rangeYData >= 1000.0) && (rangeYData < 20000.0)) {
            deltaYData = 5000.0;
        } else if ((rangeYData >= 250.0) && (rangeYData < 1000.0)) {
            deltaYData = 200.0;
        } else if ((rangeYData >= 100.0) && (rangeYData < 250.0)) {
            deltaYData = 20.0;
        } else if ((rangeYData >= 50.0) && (rangeYData < 100.0)) {
            deltaYData = 10.0;
        } else if ((rangeYData >= 20.0) && (rangeYData < 50.0)) {
            deltaYData = 5.0;
        } else if ((rangeYData >= 8.0) && (rangeYData < 20.0)) {
            deltaYData = 2.0;
        } else if ((rangeYData > 0.5) && (rangeYData <= 2.0)) {
            deltaYData = 0.20;
        } else if ((rangeYData > 0.1) && (rangeYData <= 0.5)) {
            deltaYData = 0.1;
        } else if ((rangeYData > 0.01) && (rangeYData <= 0.1)) {
            deltaYData = 0.02;
        } else if ((rangeYData > 0.001) && (rangeYData <= 0.01)) {
            deltaYData = 0.002;
        } else if ((rangeYData > 0.0001) && (rangeYData <= 0.001)) {
            deltaYData = 0.0002;
        } else if ((rangeYData > 0.00001) && (rangeYData <= 0.0001)) {
            deltaYData = 0.00002;
        } else if ((rangeYData > 0.000001) && (rangeYData <= 0.00001)) {
            deltaYData = 0.000002;
        } else if ((rangeYData > 0.0000001) && (rangeYData <= 0.000001)) {
            deltaYData = 0.0000002;
        } else if ((rangeYData > 0.00000001) && (rangeYData <= 0.0000001)) {
            deltaYData = 0.00000002;
        } else if ((rangeYData > 0.000000001) && (rangeYData <= 0.00000001)) {
            deltaYData = 0.000000002;
        } else if ((rangeYData > 0.0000000001) && (rangeYData <= 0.000000001)) {
            deltaYData = 0.0000000002;
        } else if ((rangeYData > 0.00000000001) && (rangeYData <= 0.0000000001)) {
            deltaYData = 0.00000000002;
        } else if (rangeYData <= 0.000000001) {
            deltaYData = 0.000000000002;
        }

        var mantissa0new = mantissa0 - (mantissa0 % deltaYData);
        var mantissa1new = mantissa1 - (mantissa1 % deltaYData) + deltaYData;
        var numerDiff = ((mantissa1new - mantissa0new) / deltaYData).toPrecision(6);
//        var numYTicks = Math.floor((mantissa1new - mantissa0new) / deltaYData); // + 1;
        var numYTicks = Math.floor(numerDiff);
        if (reverse) {
            deltaYData = -1.0 * deltaYData;
            //minYData2 = minYData2 - deltaXData; //sigh - I dunno.
            numYTicks = (-1 * numYTicks); // + 1; //sigh - I dunno.
        }
        numYTicks++;
        deltaYData = deltaYData * Math.pow(10.0, exp0);
        var minYData2, maxYData2, rangeYData2;
        minYData2 = mantissa0new * Math.pow(10.0, exp0);
        maxYData2 = mantissa1new * Math.pow(10.0, exp0);
        rangeYData2 = (mantissa1new - mantissa0new) * Math.pow(10.0, exp0);
        //var deltaYData = rangeYData / (1.0 * numYTicks);
        //deltaYData = mantissa * Math.pow(10.0, numParts[1]);
        var deltaYPxl = panelHeight / (numYTicks - 1);
        var deltaYPxlCnvs = yAxisLength / (numYTicks - 1);
        axisParams[1] = rangeYData2;
        axisParams[2] = deltaYData;
        axisParams[3] = deltaYPxl;
        axisParams[6] = minYData2;
        axisParams[7] = maxYData2;
        //
        var ii;
        for (var i = 0; i < numYTicks; i++) {

            ii = 1.0 * i;
            var yTickPos = ii * deltaYPxl;
            var yTickPosCnvs = ii * deltaYPxlCnvs;
            // Doesn't work - ?? var yTickVal = minYDataRnd + (ii * deltaDataRnd);
            var yTickVal = minYData2 + (ii * deltaYData);
            var yTickRound = yTickVal.toPrecision(3);
            //var yTickRound = yTickVal;
            var yTickValStr = yTickRound.toString(10);
            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
// Make the y-tick mark, Teff:
          var thisLine = document.createElementNS(xmlW3, 'line');
           thisLine.setAttributeNS(null, 'x1', yAxisXCnvs + yTickXOffset);
           thisLine.setAttributeNS(null, 'x2', yAxisXCnvs + yTickXOffset + tickLength);
           thisLine.setAttributeNS(null, 'y1', yShiftCnvs);
           thisLine.setAttributeNS(null, 'y2', yShiftCnvs);
           thisLine.setAttributeNS(null, 'stroke', lineColor);
           thisLine.setAttributeNS(null, 'stroke-width', 2);
           cnvsId.appendChild(thisLine);

            //Make the y-tick label:
         txtPrint("<span style='font-size:small'>" + yTickValStr + "</span>",
                   yAxisXCnvs + yValXOffset, yShiftCnvs, 50, lineColor, areaId);

        }  // end y-tickmark loop, j

// Add name of LOWER y-axis:

//Axis label still need to be html so we can use mark-up
        yAxisNameX = panelX + yAxisNameOffsetX;
        yAxisNameY = panelY + yAxisNameOffsetY;

       txtPrint("<span style='font-size:x-small'>" + yAxisName + "</span>",
                yAxisNameOffsetX, yAxisNameOffsetY, 75, lineColor, areaId);


        return axisParams;

    };

    //
    //
    //
    //  ***** plot()
    //
    //
    //

//General plot procedure:
//minXData, rangeXData, minYData,  rangeYData as returned by XAxis() and YAxis() procedures
//colrs[] contains values as returned by colHex()
  var plot = function(cnvsId, x, y,
                      minXData, maxXData, rangeXData, minYData,  maxYData, rangeYData,
                      colrs, style, dSize){

        var numPoints = x.length;
        if (numPoints != y.length){
           console.log("plot():  BOOM!!!  x and y have different lengths!!");
           return;
        }

//First point:
        var xTickPosCnvs = xAxisLength * (x[0] - minXData) / rangeXData; // pixels
        // horizontal position in pixels - data values increase rightward:
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
        //var yTickPosCnvs = yAxisLength * ((tuneBandIntens[0] / tuneBandIntens[0]) - minYData) / rangeYData;
        var yTickPosCnvs = yAxisLength * (y[0] - minYData) / rangeYData;

        // vertical position in pixels - data values increase upward:
        var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

//

        for (var i = 1; i < numPoints; i++) {

            var RGBHex = colrs[i];

            xTickPosCnvs = xAxisLength * (x[i] - minXData) / rangeXData; // pixels
            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            //yTickPosCnvs = yAxisLength * ((tuneBandIntens[i] / tuneBandIntens[0]) - minYData) / rangeYData;
            yTickPosCnvs = yAxisLength * (y[i] - minYData) / rangeYData;

            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

       if (style == 'o' || style == '-o' || style == ""){
//Plot points
         //console.log("Points branch");
                        //JB
            //RGBHex = colHex(0, 0, 0);
            //if (x[i] >= minXData && x[i] <= maxXData 
            //  &&  y[i] <= maxYData){
              var circle = document.createElementNS(xmlW3, 'circle');
              circle.setAttributeNS(null, 'cx', xShiftCnvs);
              circle.setAttributeNS(null, 'cy', yShiftCnvs);
              circle.setAttributeNS(null, 'r', dSize);
              circle.setAttributeNS(null, 'stroke', RGBHex);
              circle.setAttributeNS(null, 'fill', wDefaultColor);
              cnvsId.appendChild(circle);
           //}
                        //JB
        }

       if (style == '-' || style == '-o'){
//line plot
         //console.log("Line branch");
                        //JB
            //if (x[i] >= minXData && x[i] <= maxXData
            //  &&  y[i] <= maxYData){
              var line = document.createElementNS(xmlW3, 'line');
              line.setAttributeNS(null, 'x1', lastXShiftCnvs);
              line.setAttributeNS(null, 'x2', xShiftCnvs);
              line.setAttributeNS(null, 'y1', lastYShiftCnvs);
              line.setAttributeNS(null, 'y2', yShiftCnvs);
              line.setAttributeNS(null, 'stroke', RGBHex);
              line.setAttributeNS(null, 'stroke-width', 2);
              cnvsId.appendChild(line);
            //}
                        //JB
            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
       }

    } //end data loop
                              //JB
}; //end plot()

//
//
//
// makeCirc()
//
//
//

// make a circle

var makeCirc = function(cnvsId, x, y, r,
                strokeColr, strokeWdth, strokeOpc, fillColr, fillOpc){

        var thisCirc = document.createElementNS(xmlW3, 'circle');
        thisCirc.setAttributeNS(null, 'cx', x);
        thisCirc.setAttributeNS(null, 'cy', y);
        thisCirc.setAttributeNS(null, 'r', r);
        thisCirc.setAttributeNS(null, 'stroke', strokeColr);
        thisCirc.setAttributeNS(null, 'stroke-width', strokeWdth);
        thisCirc.setAttributeNS(null, 'stroke-opacity', strokeOpc);
        thisCirc.setAttributeNS(null, 'fill', fillColr);
        thisCirc.setAttributeNS(null, 'fill-opacity', fillOpc);
        cnvsId.appendChild(thisCirc);

}; //end function makeCirc()


