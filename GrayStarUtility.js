/*
 * GrayStar
 * V1.0, June 2014
 * 
 * C. Ian Short
 * Saint Mary's University
 * Department of Astronomy and Physics
 * Institute for Computational Astrophysics (ICA)
 * Halifax, NS, Canada
 *  * ian.short@smu.ca
 * www.ap.smu.ca/~ishort/
 *
 * 1D, static, plane-parallel, LTE, gray stellar atmospheric model
 * core + wing approximation to Voigt spectral line profile
 *
 * Suitable for pedagogical purposes only
 * 
 * Logic written in Java SE 8.0, JDK 1.8
 * GUI written with JavaFX 8.0
 * 
 * Ported to JavaScript for deployment
 *
 * System requirements for Java version: Java run-time environment (JRE)
 * System requirements for JavaScript version: JavaScript intrepretation enabld in WWW browser (usually by default)
 *
 * Code provided "as is" - there is no formal support 
 *
 * Java default license applies:
 * End users may adapt, modify, develop, debug, and deploy at will
 * for academic and othe non-profit uses, but are asked to leave this
 * header text in place (although they may add to the header text).
 *
 */


// **********************************************

"use strict";  //testing only!

// Global variables - Doesn't work - scope not global!

var c = 2.9979249E+10; // light speed in vaccuum in cm/s
var sigma = 5.670373E-5; //Stefan-Boltzmann constant ergs/s/cm^2/K^4  
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var h = 6.62606957E-27; //Planck's constant in ergs sec
var ee = 4.80320425E-10; //fundamental charge unit in statcoulombs (cgs)
var mE = 9.10938291E-28; //electron mass (g)
//Conversion factors
var amu = 1.66053892E-24; // atomic mass unit in g
var eV = 1.602176565E-12; // eV in ergs

//Methods:
//Natural logs more useful than base 10 logs - Eg. Formal soln module: 
// Fundamental constants
var logC = Math.log(c);
var logSigma = Math.log(sigma);
var logK = Math.log(k);
var logH = Math.log(h);
var logEe = Math.log(ee); //Named so won't clash with log_10(e)
var logMe = Math.log(mE);
//Conversion factors
var logAmu = Math.log(amu);
var logEv = Math.log(eV);
// ********************************************
// 
// 
// Utility functions:
//
//
// ********************************************

// Intrinsic utility function:
// //
// // numPrint function to Set up special area of screen for printing out computed values for trouble-shooting
// // requires value to be printed, and the x and y pixel positions in that order
// // Must be defined in scope of main() - ??
//

    var numPrint = function(val, x, y, RGBHex, areaId) {

        var xStr = numToPxStrng(x);
        var yStr = numToPxStrng(y);
     //   var RGBHex = colHex(r255, g255, b255);
        var valStr = val.toString(10);
        var numId = document.createElement("p");
        numId.style.position = "absolute";
        numId.style.display = "block";
        numId.style.marginTop = yStr;
        numId.style.marginLeft = xStr;
        numId.style.color = RGBHex;
        numId.innerHTML = valStr;
        //masterId.appendChild(numId);
        areaId.appendChild(numId);
    }; // end numPrint

    var txtPrint = function(text, x, y, RGBHex, areaId) {

        var xStr = numToPxStrng(x);
        var yStr = numToPxStrng(y);
       // var RGBHex = colHex(r255, g255, b255);
        var txtId = document.createElement("p");
        txtId.style.position = "absolute";
        txtId.style.display = "block";
        txtId.style.width = "500px";
        txtId.style.marginTop = yStr;
        txtId.style.marginLeft = xStr;
        txtId.style.color = RGBHex;
        txtId.innerHTML = text;
        //masterId.appendChild(numId);
        areaId.appendChild(txtId);
    }; // end txtPrint


    /*
 *      plotPnt takes in the *numerical* x- and y- DEVICE coordinates (browser pixels),
 *           hexadecimal colour, and opacity, and plots a generic plotting dot at that location:
 *                Calls numToPxStrng to convert numeric coordinates and opacity to style attribute strings for HTML
 *                     Calls colHex to convert R, G, and B amounts out of 255 into #RRGGBB hex format
 *                          */

    var plotPnt = function(x, y, RGBHex, opac, dSize, areaId) {

        var xStr = numToPxStrng(x);
        var yStr = numToPxStrng(y);
        var opacStr = numToPxStrng(opac);
        var dSizeStr = numToPxStrng(dSize);
   //     var RGBHex = colHex(r255, g255, b255);
//   var RGBHex = "#000000";
//
//   // Each dot making up the line is a separate element:
        var dotId = document.createElement("div");
        dotId.class = "dot";
        dotId.style.position = "absolute";
        dotId.style.display = "block";
        dotId.style.height = dSizeStr;
        dotId.style.width = dSizeStr;
        dotId.style.borderRadius = "100%";
        dotId.style.opacity = opacStr;
        dotId.style.backgroundColor = RGBHex;
        dotId.style.marginLeft = xStr;
        dotId.style.marginTop = yStr;
//Append the dot to the plot
///masterId.appendChild(dotId);
        areaId.appendChild(dotId);
    };
    /*
 *      plotLin takes in the *numerical* x- and y- DEVICE coordinates (browser pixels)
 *           OF TWO SUGGESSIVE DATA POITNS defining a line segment,
 *                hexadecimal colour, and opacity, and plots a generic plotting dot at that location:
 *                     Calls numToPxStrng to convert numeric coordinates and opacity to style attribute strings for HTML
 *                          Calls colHex to convert R, G, and B amounts out of 255 into #RRGGBB hex format
 *                               */


    var plotLin = function(x0, y0, x1, y1, RGBHex, opac, dSize, areaId) {

        // Parameters of a straight line - all that matters here is internal self-consistency:
               var slope = (y1 - y0) / (x1 - x0);
        var num = x1 - x0;
        var x, y, iFloat;
        for (var i = 0; i < num; i += 5) {
            iFloat = 1.0 * i;
            x = x0 + i;
            y = y0 + i * slope;
            var xStr = numToPxStrng(x);
            var yStr = numToPxStrng(y);
            var opacStr = numToPxStrng(opac);
            var dSizeStr = numToPxStrng(dSize);
            //var RGBHex = colHex(r255, g255, b255);
//   var RGBHex = "#000000";
//
//   Each dot making up the line is a separate element:
            var dotId = document.createElement("div");
            dotId.class = "dot";
            dotId.style.position = "absolute";
            dotId.style.display = "block";
            dotId.style.height = dSizeStr;
            dotId.style.width = dSizeStr;
            dotId.style.borderRadius = "100%";
            dotId.style.opacity = opacStr;
            dotId.style.backgroundColor = RGBHex;
            dotId.style.marginLeft = xStr;
            dotId.style.marginTop = yStr;
//Append the dot to the plot
//masterId.appendChild(dotId);
            areaId.appendChild(dotId);
        }
    };

    /*
 *      colHex takes in red, green, and blue (in that order!) amounts out of 255 and converts
 *           them into stringified #RRGGBB format for HTML
 *                */

    var colHex = function(r255, g255, b255) {



        var rr = Math.floor(r255); //MUST convert to integer
        var gg = Math.floor(g255); //MUST convert to integer
        var bb = Math.floor(b255); //MUST convert to integer

        var RGBHex = "rgb(";
        RGBHex = RGBHex.concat(rr);
        RGBHex = RGBHex.concat(",");
        RGBHex = RGBHex.concat(gg);
        RGBHex = RGBHex.concat(",");
        RGBHex = RGBHex.concat(bb);
        RGBHex = RGBHex.concat(")");
//////    var RGBHex = "rgb(60,80,120)";

        return RGBHex;
    };


// logTen function (JS only provides natural log as standard on all browsers)

var logTen = function(x) {

// JS' 'log()' is really ln()

    return Math.log(x) / Math.LN10;
} //end logTen


// numToPxStng function to convert operable and calculable numbers into strings in 'px' for setting HTML style attributes

var numToPxStrng = function(x) {

    var xStr = x.toString(10) + "px"; // argument means interpret x as base 10 number

    return xStr;
} //end numToPxStrng


/*
 Linear interpolation to a new abscissa - mainly for interpoalting flux to a specific lambda
 This version for 2XN vector where we want to interpolate in row 1 - log units
 */

var interpol2 = function(x, y, newX) {

    var newY;
    // Bracket newX:
    var x1, x2;
    var p1, p2;
    p1 = 0;
    p2 = 1;
    x1 = x[p1];
    x2 = x[p2];
    for (var i = 1; i < x.length; i++) {
        if (x[i] >= newX) {
// Found upper bracket
            p2 = i;
            p1 = i - 1;
            x2 = x[p2];
            x1 = x[p1];
            break;
        }
    }

    var step = x2 - x1;
    //Interpolate
    // y is probably flux - Row 1 is log flux - let's interpolate in log space
    newY = y[1][p2] * (newX - x1) / step
            + y[1][p1] * (x2 - newX) / step;
    //System.out.println("Interpol: p1, p2, x1, x2, y1, y2, newX, newY: " + 
    //        p1 + " " + p2 + " " + x1 + " " + x2 + " " + y[1][p1] + " " + y[1][p2] + " " + newX + " " + newY + " ");
    //numPrint(roundNum, 100, 300, masterId); //debug

    return newY;
};

/*
 Linear interpolation to a new abscissa - mainly for interpolating flux to a specific lambda
 */

var interpol = function(x, y, newX) {

    var newY;
    var num = x.length;
    // Bracket newX:
    var x1, x2;
    var p1, p2;
    p1 = 0;
    p2 = 1;
    x1 = x[p1];
    x2 = x[p2];
    for (var i = 1; i < num; i++) {

        if (x[0] < x[num - 1]) {
            // Case of monotonically increasing absicissae
            if (x[i] >= newX) {
// Found upper bracket
                p2 = i;
                p1 = i - 1;
                x2 = x[p2];
                x1 = x[p1];
                break;
            }
        } else {
            // Case of monotonically decreasing absicissae
            if (x[i] <= newX) {
// Found upper bracket
                p2 = i;
                p1 = i - 1;
                x2 = x[p2];
                x1 = x[p1];
                break;
            }
        }

    }

    var step = x2 - x1;
    //Interpolate
    newY = y[p2] * (newX - x1) / step
            + y[p1] * (x2 - newX) / step;
    //System.out.println("Interpol: p1, p2, x1, x2, y1, y2, newX, newY: " + 
    //        p1 + " " + p2 + " " + x1 + " " + x2 + " " + y[1][p1] + " " + y[1][p2] + " " + newX + " " + newY + " ");
    //numPrint(roundNum, 100, 300, masterId); //debug

    return newY;
};



/**
 * Return the array index of the optical depth arry (tauRos) closest to a
 * desired value of optical depth (tau) Assumes the use wants to find a *linear*
 * tau value , NOT logarithmic
 */
var tauPoint = function(numDeps, tauRos, tau) {

    var index;
    var help = [];
    help.length = numDeps;
    for (var i = 0; i < numDeps; i++) {

        help[i] = tauRos[0][i] - tau;
        help[i] = Math.abs(help[i]);
    }
    index = 0;
    var min = help[index];
    for (var i = 1; i < numDeps; i++) {

        if (help[i] < min) {
            min = help[i];
            index = i;
        }

    }

    return index;
};

/**
 * Return the array index of the wavelength array (lambdas) closest to a desired
 * value of wavelength (lam)
 */

var lamPoint = function(numLams, lambdas, lam) {

    var index;

    var help = [];
    help.length = numLams;

    for (var i = 0; i < numLams; i++) {

        help[i] = lambdas[i] - lam;
        help[i] = Math.abs(help[i]);

    }
    index = 0;
    var min = help[index];

    for (var i = 1; i < numLams; i++) {

        if (help[i] < min) {
            min = help[i];
            index = i;
        }

    }

    return index;

};

/**
 * Find the wavelength where a spectral line profile is half of its minimum,
 * line-centre brightness Assume symmetric (pure Voigt) profile?
 *
 * Returns the integer indices of the red half-power and line-centre wavelengths
 */

var halfPower = function(numPoints, lineFlux) {

    var keyLambdas = [];
    keyLambdas.length = 2;

    // CAUTION; numPoints-1st value holds the line centre monochromatic *continuum* flux for normalization
    // Extract 1D vector of linear continuum normalized fluxes of length numPoints-1
    var flux1D = [];
    flux1D.length = numPoints - 1;

    for (var i = 0; i < numPoints - 1; i++) {
        flux1D[i] = lineFlux[0][i] / lineFlux[0][numPoints - 1];
    }

    // To be on the safe side, let's "rediscover" the line centre of wavelength of minimum brightness:
    var minmax = minMax(flux1D);
    keyLambdas[0] = minmax[0]; // line centre index

    var help = [];
    help.length = numPoints - keyLambdas[0] - 1;
    var half;
    half = flux1D[keyLambdas[0]] + ((1.0 - flux1D[keyLambdas[0]]) / 2.0);
    //System.out.println("HalfPower: half power flux: " + half);

    for (var i = keyLambdas[0]; i < numPoints - 1; i++) {

        // The last minimum of help should be the red half-depth point
        help[i - keyLambdas[0]] = Math.abs(flux1D[i] - half);
        //System.out.println("HalfPower: i, i - keyLambdas[0], fluxiD, help: " 
        //        + i + " " + (i - keyLambdas[0]) + " " + flux1D[i] + " " + help[i - keyLambdas[0]] );
    }

    minmax = minMax(help);
    keyLambdas[1] = minmax[0] + keyLambdas[0]; // red half-power index
    //System.out.println("HalfPower: minmax[0]: " + keyLambdas[1]);

    return keyLambdas;

};

/**
 * Return the array indices of minimum and maximum values of an input 1D array CAUTION; Will
 * return the *first* occurence if min and/or max values occur in multiple
 * places iMinMax[0] = first occurence of minimum iMinMax[1] = first occurence
 * of maximum
 */
var minMax = function(x) {

    var iMinMax = [];
    iMinMax.length = 2;

    var num = x.length;
    //System.out.println("MinMax: num: " + num);

    var iMin = 0;
    var iMax = 0;
    var min = x[iMin];
    var max = x[iMax];

    for (var i = 1; i < num; i++) {

        //System.out.println("MinMax: i , current min, x : " + i + " " + min + " " + x[i]);
        if (x[i] < min) {
            //System.out.println("MinMax: new min: if branch triggered" );
            min = x[i];
            iMin = i;
        }
        //System.out.println("MinMax: new min: " + min);

        if (x[i] > max) {
            max = x[i];
            iMax = i;
        }

    }
    //System.out.println("MinMax: " + iMin + " " + iMax);

    iMinMax[0] = iMin;
    iMinMax[1] = iMax;

    return iMinMax;

};


/**
 * Version of MinMax.minMax for 2XnumDep & 2XnumLams arrays where row 0 is
 * linear and row 1 is logarithmic
 *
 * Return the array indices of the minimum and maximum values of an input 1D array CAUTION; Will
 * return the *first* occurence if min and/or max values occur in multiple
 * places iMinMax[0] = first occurence of minimum iMinMax[1] = first occurence
 * of maximum
 */
var minMax2 = function(x) {

    var iMinMax = [];
    iMinMax.length = 2;

    var num = x[0].length;

    var iMin = 0;
    var iMax = 0;

    // Search for minimum and maximum in row 0 - linear values:
    var min = x[0][iMin];
    var max = x[0][iMax];

    for (var i = 1; i < num; i++) {

        if (x[0][i] < min) {
            min = x[0][i];
            iMin = i;
        }

        if (x[0][i] > max) {
            max = x[0][i];
            iMax = i;
        }

    }

    iMinMax[0] = iMin;
    iMinMax[1] = iMax;

    return iMinMax;

};

  var lambdaToRGB = function(Wavelength, zLevel){

// Okay - now the question is:  Which crayon in the box does your optic nerve and visual cortex
// think corresponds to each wavelength??   This is actually beyond the realm of physics and astrophsyics...
// Taken from Earl F. Glynn's web page:
// <a href="http://www.efg2.com/Lab/ScienceAndEngineering/Spectra.htm">Spectra Lab Report</a>
//Converted from C to JS by Ian Short, Aug 2015
//
        var Gamma = 0.80;
        var IntensityMax = 255;
        var factor = 1.0;
        var Red, Green, Blue, Wavelength, r255, g255, b255;
        var rgb = [];
        rgb.length = 3;

                if ((Wavelength >= 370) && (Wavelength < 440)) {
                    Red = -(Wavelength - 440) / (440 - 370);
                    Green = 0.0;
                    Blue = 1.0;
                } else if ((Wavelength >= 440) && (Wavelength < 490)) {
                    Red = 0.0;
                    Green = (Wavelength - 440) / (490 - 440);
                    Blue = 1.0;
                } else if ((Wavelength >= 490) && (Wavelength < 510)) {
                    Red = 0.0;
                    Green = 1.0;
                    Blue = -(Wavelength - 510) / (510 - 490);
                } else if ((Wavelength >= 510) && (Wavelength < 580)) {
                    Red = (Wavelength - 510) / (580 - 510);
                    Green = 1.0;
                    Blue = 0.0;
                } else if ((Wavelength >= 580) && (Wavelength < 645)) {
                    Red = 1.0;
                    Green = -(Wavelength - 645) / (645 - 580);
                    Blue = 0.0;
                } else if ((Wavelength >= 645) && (Wavelength < 781)) {
                    Red = 1.0;
                    Green = 0.0;
                    Blue = 0.0;
                } else {
                    Red = 0.0;
                    Green = 0.0;
                    Blue = 0.0;
                }


                rgb[0] = Math.floor(IntensityMax * Math.pow(Red * factor, Gamma));
                rgb[1] = Math.floor(IntensityMax * Math.pow(Green * factor, Gamma));
                rgb[2] = Math.floor(IntensityMax * Math.pow(Blue * factor, Gamma));

                r255 = Math.floor(rgb[0] * zLevel);
                g255 = Math.floor(rgb[1] * zLevel);
                b255 = Math.floor(rgb[2] * zLevel);

            if (Wavelength < 370.0) {
                r255 = Math.floor(255.0 * zLevel);
                g255 = 0;
                b255 = Math.floor(255.0 * zLevel);
            }
            if (Wavelength >= 781.0) {
                r255 = Math.floor(128.0 * zLevel);
                g255 = Math.floor(0.0 * zLevel);
                b255 = 0;
            }


                var RGBHex = colHex(r255, g255, b255);
     

       return RGBHex;

  };

    //
    //    
    //   ********* standForm()
    //  
    // 
    //
    var standForm = function(x) {
        // Turn any old number into the nearest number in standard form with a whole number exponent
        //   and a mantissa rounded to the nearest canonical value appropriate for labeling a tick mark
        //
        var numParts = [2];
        var isNeg = false;
        if (x === 0.0) {
            numParts = [0.0, 0.0];
        } else {

            if (x < 0) {
                isNeg = true;
                x = -1.0 * x;
            }

            var b = logTen(x);
            var n = Math.floor(b);
            var a = x / Math.pow(10.0, n);
            if (isNeg === true) {
                a = -1.0 * a;
            }

            numParts[0] = a; //mantissa
            numParts[1] = n; //exponent
        }

        return numParts;
    };

    //
    // 
    //  
    //  ********* rounder()
    // 
    //     
    //
        var rounder = function(x, n, flag) {

        // Return a number rounded up or down to n decimal places (sort of?)
        //
        var y, z;
        n = Math.abs(Math.floor(n)); //n was supposed to be a positive whole number anyway
        if (flag != "up" && flag != "down") {
            flag = "down";
        }

        if (n === 0) {
            z = x;
        } else {
            var fctr = Math.pow(10.0, n);
            var fx = 1.0 * x;
            y = fx * fctr;
            if (flag === "up") {
                z = Math.ceil(y);
            } else {
                z = Math.floor(y);
            }

            var fz = 1.0 * z;
            fz = fz / fctr;
        }

        return fz;
    };

/**
 *
 * @author Ian vectorized version of simple linear 1st order interpolation
 * // Caution: Assumes new and old abscissae are in monotonic increasing order
 */

   var interpolV = function(y, x, newX) {

        var num = x.length;
        if (num != y.length){
          //System.out.println("Toolbox.interpolV(): Old x and y must be same length");  
        }
        var newNum = newX.length;
        //System.out.println("interpolV: newNum " + newNum + " num " + num); 
        var newY = [];
        newY.length = newNum;

//Renormalize ordinates:
    
    var iMinAndMax = minMax(y);
    
    var norm = y[iMinAndMax[1]];
    //System.out.println("norm " + norm);
    var yNorm = [];
    yNorm.length = num; 
    var newYNorm = [];
    newYNorm.length = newNum;
    for (var i = 0; i < num; i++){
      yNorm[i] = y[i] / norm; 
    }

// Set any newX elements that are *less than* the first x element to th first 
// x element - "0th order extrapolation"
//
        var start = 0;
         for (var i = 0; i < newNum; i++) {
            if (newX[i] <= x[1]){
              newYNorm[i] = yNorm[0];
              start++;
            }
            if (newX[i] > x[1]){
               break;
            }
         }   
  //System.out.println("start " + start);
  //System.out.println("x[0] " + x[0] + " x[1] " + x[1] + " newX[start] " + newX[start]);
  var jWght, jm1Wght, denom;
  
  if (start < newNum-1){

        var j = 1; //initialize old abscissae index
        //outer loop over new abscissae
        for (var i = start; i < newNum; i++) {

            //System.out.println("i " + i + " j " + j);

// break out if current element newX is *greater* that last x element
            if ( (newX[i] > x[num-1]) || (j > (num-1)) ){
               break; 
            }

            while (x[j] < newX[i]) {
                j++;
            }
            //System.out.println("i " + i + " newX[i] " + newX[i] + " j " + j + " x[j-1] " + x[j-1] + " x[j] " + x[j]);
            //1st order Lagrange method:
            jWght = newX[i] * (1.0 - (x[j-1]/newX[i])); //(newX[i]-x[j-1])
            jm1Wght = x[j] * (1.0 - (newX[i]/x[j])); //(x[j]-newX[i])
            denom = x[j] * (1.0 - (x[j-1]/x[j])); //(x[j]-x[j-1])
            jWght = jWght / denom;
            jm1Wght = jm1Wght / denom;
            //newYNorm[i] = (yNorm[j]*(newX[i]-x[j-1])) + (yNorm[j-1]*(x[j]-newX[i]));
            newYNorm[i] = (yNorm[j]*jWght) + (yNorm[j-1]*jm1Wght);
            //System.out.println("i " + i + " newYNorm[i] " + newYNorm[i] + " j " + j + " yNorm[j-1] " + yNorm[j-1] + " yNorm[j] " + yNorm[j]);
        }

    } //start condition

// Set any newX elements that are *greater than* the first x element to the last 
// x element - "0th order extrapolation"
//
         for (var i = 0; i < newNum; i++) {
            if (newX[i] >= x[num-1]){
              newYNorm[i] = yNorm[num-1];
            }
         }   

//Restore orinate scale
    for (var i = 0; i < newNum; i++){
      newY[i] = newYNorm[i] * norm; 
    }


        return newY;
 };



//Atomic masses in atomic mass units (amu. "mu")
//From CIAAW
//Atomic weights of the elements 2015 ciaaw.org/atomic-weights.htm, Aug. 2015
//Heaviest element treated in La (57)


    var getMass = function(elName){

    var elMass = 1.0;  //default initialization

    if (elName == "H"){
       elMass = 1.007;
        }
   
    if (elName == "He"){
       elMass  = 4.002;
       }
   
    if (elName == "Li"){
       elMass = 6.938;
      }
 
    if (elName == "Be"){
       elMass  = 9.012;
  }
 
    if (elName == "B"){
       elMass = 10.806;
   }
   
    if (elName == "C"){
       elMass = 12.0096;
  }
   
    if (elName == "N"){
       elMass = 14.006;
  }
 
    if (elName == "O"){
       elMass = 15.999;
  }
 
    if (elName == "F"){
       elMass = 18.998;
  }
 
    if (elName == "Ne"){
       elMass  = 20.1797;
  }
 
    if (elName == "Na"){
       elMass  = 22.989;
  }
 
    if (elName == "Mg"){
       elMass  = 24.304;
  }
 
    if (elName == "Al"){
       elMass  = 26.981;
  }
 
    if (elName == "Si"){
       elMass  = 28.084;
  }
 
    if (elName == "P"){
       elMass = 30.973;
  }
 
    if (elName == "S"){
       elMass = 32.059;
 }
 
    if (elName == "Cl"){
       elMass  = 35.446;
  }
 
    if (elName == "Ar"){
       elMass  = 39.948;
  }
 
    if (elName == "K"){
       elMass = 39.0983;
  }
 
    if (elName == "Ca"){
       elMass  = 40.078;
  }
 
    if (elName == "Sc"){
       elMass  = 44.955;
  }
 
    if (elName == "Ti"){
       elMass  = 47.867;
  }
 
    if (elName == "Va"){
       elMass  = 50.9415;
  }
 
    if (elName == "Cr"){
       elMass  = 51.9961;
  }
 
    if (elName == "Mn"){
       elMass  = 54.938;
  }
 
    if (elName == "Fe"){
       elMass  = 55.845;
  }
 
    if (elName == "Co"){
       elMass  = 58.933;
  }
 
    if (elName == "Ni"){
       elMass  = 58.6934;
  }
 
    if (elName == "Cu"){
       elMass  = 63.546;
  }
 
    if (elName == "Zn"){
       elMass  = 65.38;
  }
 
    if (elName == "Ga"){
       elMass  = 69.723;
  }
 
    if (elName == "Ge"){
       elMass  = 72.630;
  }
 
    if (elName == "As"){
       elMass  = 74.921;
  }
 
    if (elName == "Se"){
       elMass  = 78.971;
  }
 
    if (elName == "Br"){
       elMass  = 79.901;
  }
 
    if (elName == "Kr"){
       elMass  = 83.798;
  }
 
    if (elName == "Rb"){
       elMass  = 85.4678;
  }
 
    if (elName == "Sr"){
       elMass  = 87.62;
  }
 
    if (elName == "Y"){
       elMass = 88.905;
  }
 
    if (elName == "Zr"){
       elMass  = 91.224;
  }
 
    if (elName == "Nb"){
       elMass  = 92.906;
  }
 
    if (elName == "Mo"){
       elMass  = 95.95;
  }
 
    if (elName == "Ru"){
       elMass  = 101.07;
  }
 
    if (elName == "Rh"){
       elMass  = 102.905;
  }
 
    if (elName == "Pd"){
       elMass  = 106.42;
  }
 
    if (elName == "Ag"){
       elMass  = 107.8682;
  }
 
    if (elName == "Cd"){
       elMass  = 112.414;
  }
 
    if (elName == "In"){
       elMass  = 114.818;
  }
 
    if (elName == "Sn"){
       elMass  = 118.710;
  }
 
    if (elName == "Sb"){
       elMass  = 121.760;
  }
 
    if (elName == "Te"){
       elMass  = 127.60;
  }
 
    if (elName == "I"){
       elMass = 126.904;
  }
 
    if (elName == "Xe"){
       elMass  = 131.293;
  }
 
    if (elName == "Cs"){
       elMass  = 132.905;
  }
 
    if (elName == "Ba"){
       elMass  = 137.327;
  }
 
    if (elName == "La"){
       elMass  = 138.905;
  }

// 
    return elMass; 


}; // end of getMass method



// Ground state ionization energies in eV 
//From NIST Atomic Spectra Database
//Ionization Energies Data
//Kramida, A., Ralchenko, Yu., Reader, J., and NIST ASD Team (2014). NIST Atomic Spectra Database (ver. 5.2), [Online]. Available: http://physics.nist.gov/asd [2015, November 23]. National Institute of Standards and Technology, Gaithersburg, MD.
//Heaviest element treatable: La


//Ionization stages that don't exist (eg. "HIII") are given extremely large ioization energies (999 ev)


   var getIonE = function(species){

   var ionE = 8.0; //default initialization

      if (species == "HI"){
         ionE = 13.598434005136;
       }
      if (species == "HII"){
         ionE = 999999.0;
       }
      if (species == "HIII"){
         ionE = 999999.0;
       }
      if (species == "HIV"){
         ionE = 999999.0;
       }
      if (species == "HeI"){
         ionE = 24.587387936;
        }     
      if (species == "HeII"){
         ionE = 54.417763110;
        }   
      if (species == "HeIII"){
         ionE = 999999.0;
        }   
      if (species == "HeIV"){
         ionE = 999999.0;
        }   
      if (species == "LiI"){
         ionE = 5.391714761;
        }   
      if (species == "LiII"){
         ionE = 75.6400937;
        }             
      if (species == "LiIII"){
         ionE = 122.45435380;
        }           
      if (species == "LiIV"){
         ionE = 999999.0;
        }           
      if (species == "BeI"){
         ionE = 9.3226990;
        }            
      if (species == "BeII"){
         ionE = 18.211153;
        }            
      if (species == "BeIII"){
         ionE = 153.8961980;
        }         
      if (species == "BeIV"){
         ionE = 217.7185766;
        }         
      if (species == "BI"){
         ionE = 8.2980190;
        }         
      if (species == "BII"){
         ionE = 25.154830;
        }         
      if (species == "BIII"){
         ionE = 37.930580;
        }        
      if (species == "BIV"){
         ionE = 259.3715;
        }        
      if (species == "CI"){
         ionE = 11.260300;
        }       
      if (species == "CII"){
         ionE = 24.38450;
        }      
      if (species == "CIII"){
         ionE = 47.88778;
        }      
      if (species == "CIV"){
         ionE = 64.49351;
        }      
      if (species == "NI"){
         ionE = 14.534130;
        }    
      if (species == "NII"){
         ionE = 29.601250;
        }  
      if (species == "NIII"){
         ionE = 47.4453;
        }   
      if (species == "NIV"){
         ionE = 77.47350;
        }   
      if (species == "OI"){
         ionE = 13.6180540;
        }               
      if (species == "OII"){
         ionE = 35.121110;
        }               
      if (species == "OIII"){
         ionE = 54.93554;
        }              
      if (species == "OIV"){
         ionE = 77.41350;
        }              
      if (species == "FI"){
         ionE = 17.422820;
        }             
      if (species == "FII"){
         ionE = 34.97081;
        }             
      if (species == "FIII"){
         ionE = 62.70800;
        }           
      if (species == "FIV"){
         ionE = 87.175;
        }           
      if (species == "NeI"){
         ionE = 21.5645400;
        }         
      if (species == "NeII"){
         ionE = 40.962960;
        }         
      if (species == "NeIII"){
         ionE = 63.42331;
        }         
      if (species == "NeIV"){
         ionE = 97.1900;
        }         
      if (species == "NaI"){
         ionE = 5.13907670;
        }     
      if (species == "NaII"){
         ionE = 47.28636;
        }       
      if (species == "NaIII"){
         ionE = 71.6200;
        }      
      if (species == "NaIV"){
         ionE = 98.936;
        }      
      if (species == "MgI"){
         ionE = 7.6462350;
        }               
      if (species == "MgII"){
         ionE = 15.0352670;
        }              
      if (species == "MgIII"){
         ionE = 80.14360;
        }               
      if (species == "MgIV"){
         ionE = 109.2654;
        }               
      if (species == "AlI"){
         ionE = 5.9857684;
        }            
      if (species == "AlII"){
         ionE = 18.828550;
        }            
      if (species == "AlIII"){
         ionE = 28.447640;
        }           
      if (species == "AlIV"){
         ionE = 119.9924;
        }           
      if (species == "SiI"){
         ionE = 8.151683;
        }          
      if (species == "SiII"){
         ionE = 16.345845;
        }         
      if (species == "SiIII"){
         ionE = 33.493000;
        }        
      if (species == "SiIV"){
         ionE = 45.141790;
        }        
      if (species == "PI"){
         ionE = 10.486686;
        }       
      if (species == "PII"){
         ionE = 19.769490;
        }     
      if (species == "PIII"){
         ionE = 30.202640;
        }     
      if (species == "PIV"){
         ionE = 51.44387;
        }     
      if (species == "SI"){
         ionE = 10.36001;
        }     
      if (species == "SII"){
         ionE = 23.33788;
        }    
      if (species == "SIII"){
         ionE = 34.856;
        }    
      if (species == "SIV"){
         ionE = 47.222;
        }    
      if (species == "ClI"){
         ionE = 12.967632;
        } 
      if (species == "ClII"){
         ionE = 23.81364;
        }                
      if (species == "ClIII"){
         ionE = 39.80;
        }                 
      if (species == "ClIV"){
         ionE = 53.24;
        }                 
      if (species == "ArI"){
         ionE = 15.75961120;
        }           
      if (species == "ArII"){
         ionE = 27.62967;
        }             
      if (species == "ArIII"){
         ionE = 40.735;
        }             
      if (species == "ArIV"){
         ionE = 59.58;
        }             
      if (species == "KI"){
         ionE = 4.340663540;
        }
      if (species == "KII"){
         ionE = 31.62500;
        }
      if (species == "KIII"){
         ionE = 45.8031;
         }         
      if (species == "KIV"){
         ionE = 60.917;
         }         
      if (species == "CaI"){
         ionE = 6.11315520;
         }     
      if (species == "CaII"){
         ionE = 11.8717180;
         }     
      if (species == "CaIII"){
       ionE = 50.91315;
         }    
      if (species == "CaIV"){
       ionE = 67.273;
         }    
      if (species == "ScI"){
         ionE = 6.561490;
         }     
      if (species == "ScII"){
         ionE = 12.79977;
         }     
      if (species == "ScIII"){
         ionE = 24.756838;
         }  
      if (species == "ScIV"){
         ionE = 73.48940;
         }  
      if (species == "TiI"){
         ionE = 6.828120;
         } 
      if (species == "TiII"){
         ionE = 13.5755;
         }                   
      if (species == "TiIII"){
         ionE = 27.49171;
         }                 
      if (species == "TiIV"){
         ionE = 43.26717;
         }                 
      if (species == "VI"){
         ionE = 6.746187;
         }               
      if (species == "VII"){
         ionE = 14.6200;
         }                
      if (species == "VIII"){
         ionE = 29.3110;
         }               
      if (species == "VIV"){
         ionE = 46.7090;
         }               
      if (species == "CrI"){
         ionE = 6.766510;
         }            
      if (species == "CrII"){
         ionE = 16.486305;
         }           
      if (species == "CrIII"){
         ionE = 30.960;
         }             
      if (species == "CrIV"){
         ionE = 49.160 ;
         }             
      if (species == "MnI"){
         ionE = 7.4340377;
         }        
      if (species == "MnII"){
         ionE = 15.639990;
         }        
      if (species == "MnIII"){
         ionE = 33.668;
         }          
      if (species == "MnIV"){
         ionE = 51.20;
         }          
      if (species == "FeI"){
         ionE = 7.9024678;
         }     
      if (species == "FeII"){
         ionE = 16.199200;
         }     
      if (species == "FeIII"){
         ionE = 30.651;
         }       
      if (species == "FeIV"){
         ionE = 54.910;
         }       
      if (species == "CoI"){
         ionE = 7.88101;
         }    
      if (species == "CoII)"){
         ionE = 17.0844;
         }    
      if (species == "CoIII"){
         ionE = 33.500;
         }   
      if (species == "CoIV"){
         ionE = 51.27;
         }   
      if (species == "NiI"){
         ionE = 7.639877;
         }                 
      if (species == "NiII"){
         ionE = 18.168837;
         }                
      if (species == "NiIII"){
         ionE = 35.190;
         }                  
      if (species == "NiIV"){
         ionE = 54.90;
         }                  
      if (species == "CuI"){
         ionE = 7.7263800;
         }             
      if (species == "CuII"){
         ionE = 20.292390;
         }             
      if (species == "CuIII"){
         ionE = 36.841;
         }               
      if (species == "CuIV"){
         ionE = 57.380;
         }               
      if (species == "ZnI"){
         ionE = 9.3941970;
         }          
      if (species == "ZnII"){
        ionE = 17.96439;
         }           
      if (species == "ZnIII"){
         ionE = 39.72300;
         }          
      if (species == "ZnIV"){
         ionE = 59.573;
         }          
      if (species == "GaI"){
         ionE = 5.9993018;
         }       
      if (species == "GaII"){
         ionE = 20.51514;
         }        
      if (species == "GaIII"){
         ionE = 30.72600;
         }       
      if (species == "GaIV"){
         ionE = 63.2410;
         }       
      if (species == "KrI"){
         ionE = 13.9996049;
         }
      if (species == "KrII"){
         ionE = 24.35984;
        }     
      if (species == "KrIII"){
         ionE = 35.838;
        }      
      if (species == "KrIV"){
         ionE = 50.85;
        }      
      if (species == "RbI"){
         ionE = 4.1771280;
        } 
      if (species == "RbII"){
         ionE = 27.289540;
        }                 
      if (species == "RbIII"){
         ionE = 39.2470;
        }                 
      if (species == "RbIV"){
         ionE = 52.20;
        }                 
      if (species == "SrI"){
         ionE = 5.69486720;
        }             
      if (species == "SrII"){
         ionE = 11.0302760;
        }             
      if (species == "SrIII"){
         ionE = 42.88353;
        }              
      if (species == "SrIV"){
         ionE = 56.2800;
        }              
      if (species == "YI"){
         ionE = 6.21726;
        }             
      if (species == "YII"){
         ionE = 12.22400;
        }            
      if (species == "YIII"){
         ionE = 20.52441;
        }           
      if (species == "YIV"){
         ionE = 60.6070;
        }           
      if (species == "ZrI"){
         ionE = 6.633900;
        }                 
      if (species == "ZrII"){
         ionE = 13.13;
        }                    
      if (species == "ZrIII"){
         ionE = 23.1700;
        }                
      if (species == "ZrIV"){
         ionE = 34.418360;
        }                
      if (species == "NbI"){
         ionE = 6.758850;
        }              
      if (species == "NbII"){
         ionE = 14.32;
        }                
      if (species == "NbIII"){
         ionE = 25.0;
        }                
      if (species == "NbIV"){
         ionE = 37.611;
        }                
      if (species == "CsI"){
         ionE = 3.893905548;
        }              
      if (species == "CsII"){
         ionE = 23.157450;
        }                
      if (species == "CsIII"){
         ionE = 33.1950;
        }                
      if (species == "CsIV"){
         ionE = 43.0;
        }                
      if (species == "BaI"){
         ionE = 5.2116640;
        }             
      if (species == "BaII"){
         ionE = 10.003826;
        }             
      if (species == "BaIII"){
         ionE = 35.8400;
        }              
      if (species == "BaIV"){
         ionE = 47.03;
        }              
      if (species == "LaI"){
         ionE = 5.57690;
        }            
      if (species == "LaII"){
         ionE = 11.184920;
        }          
      if (species == "LaIII"){
         ionE = 19.17730;
        }          
      if (species == "LaIV"){
         ionE = 49.950;
        }          

//
return ionE;

};  //end of method getIonE    

// Molecular dissociation energies in eV 
//From NIST Allen's Astrophysical Quantities, 4th Ed.



   var getDissE = function(species){

   var dissE = 8.0; //default initialization

      if (species == "H2"){
         dissE = 4.4781;
       }
      if (species == "H2+"){
         dissE = 2.6507;
       }
      if (species == "C2"){
         dissE = 6.296;
       }
      if (species == "CH"){
         dissE = 3.465;
       }
      if (species == "CO"){
         dissE = 11.092;
       }
      if (species == "CN"){
         dissE = 7.76;
       }
      if (species == "N2"){
         dissE = 9.759;
       }
      if (species == "NH"){
         dissE = 3.47;
       }
      if (species == "NO"){
         dissE = 6.497;
       }
      if (species == "O2"){
         dissE = 5.116;
       }
      if (species == "OH"){
         dissE = 4.392;
       }
      if (species == "MgH"){
         dissE = 1.34;
       }
      if (species == "SiO"){
         dissE = 8.26;
       }
      if (species == "CaH"){
         dissE = 1.70;
       }
      if (species == "CaO"){
         dissE = 4.8;
       }
      if (species == "TiO"){
         dissE = 6.87;
       }
      if (species == "VO"){
         dissE = 6.4;
       }
      if (species == "FeO"){
         dissE = 4.20;
       }

//
return dissE;

};  //end of method getDissE    


//Partition functions at two representative temperatures,
//from Allen's Astrophysical quantities
// CAUTION: Return Base 10 log_10 of partition fn
//Ionization stages that don't exist (eg. "HIII") are given dummy values of 0.0;


   var getPartFn = function(species){

// CAUTION: log_10 base 10!!
   var log10PartFn = []; 
   log10PartFn.length = 2; 
   
   //default initialization
   log10PartFn[0] = 0.0;  //for theta = 5040.0/T = 1.0
   log10PartFn[1] = 0.0;  //for theta = 5040.0/T = 0.5
   

      if (species == "HI"){
         log10PartFn[0] = 0.30; 
         log10PartFn[1] = 0.30;
       }
      if (species == "HII"){
         log10PartFn[0] = 0.0;  //dummy 
         log10PartFn[1] = 0.0;   //dummy
       }
      if (species == "HIII"){
         log10PartFn[0] = 0.0;   //dummy
         log10PartFn[1] = 0.0;   //dummy
       }
      if (species == "HIV"){
         log10PartFn[0] = 0.0;   //dummy
         log10PartFn[1] = 0.0;   //dummy
       }
      if (species == "HeI"){
         log10PartFn[0] = 0.00; 
         log10PartFn[1] = 0.00; 
        }     
      if (species == "HeII"){
         log10PartFn[0] = 0.30; 
         log10PartFn[1] = 0.30;
        }   
      if (species == "HeIII"){
         log10PartFn[0] = 0.0;  //dummy 
         log10PartFn[1] = 0.0;  //dummy 
        }   
      if (species == "HeIV"){
         log10PartFn[0] = 0.0;  //dummy 
         log10PartFn[1] = 0.0;  //dummy 
        }   
      if (species == "LiI"){
         log10PartFn[0] = 0.32; 
         log10PartFn[1] = 0.49;
        }   
      if (species == "LiII"){
         log10PartFn[0] = 0.00; 
         log10PartFn[1] = 0.00; 
        }             
      if (species == "LiIII"){
         log10PartFn[0] = Math.log10(2.0);   
         log10PartFn[1] = Math.log10(2.0); 
        }           
      if (species == "LiIV"){
         log10PartFn[0] = 0.00; 
         log10PartFn[1] = 0.00; 
        }           
      if (species == "BeI"){
         log10PartFn[0] = 0.01; 
         log10PartFn[1] = 0.13; 
        }            
      if (species == "BeII"){
         log10PartFn[0] = 0.30; 
         log10PartFn[1] = 0.30; 
        }            
      if (species == "BeIII"){
         log10PartFn[0] = Math.log10(1.0); 
         log10PartFn[1] = Math.log10(1.0); 
        }         
      if (species == "BeIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }         
      if (species == "BI"){
         log10PartFn[0] = 0.78; 
         log10PartFn[1] =  0.78;
        }         
      if (species == "BII"){
         log10PartFn[0] = 0.00; 
         log10PartFn[1] = 0.00; 
        }         
      if (species == "BIII"){
         log10PartFn[0] = Math.log10(2.0);
         log10PartFn[1] = Math.log10(2.0);
        }        
      if (species == "BIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }        
      if (species == "CI"){
         log10PartFn[0] = 0.97; 
         log10PartFn[1] = 1.0; 
        }       
      if (species == "CII"){
         log10PartFn[0] = 0.78; 
         log10PartFn[1] = 0.78; 
        }      
      if (species == "CIII"){
         log10PartFn[0] = Math.log10(1.0);
         log10PartFn[1] = Math.log10(1.0);
        }      
      if (species == "CIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] = 0.0;
        }      
      if (species == "NI"){
         log10PartFn[0] = 0.61; 
         log10PartFn[1] = 0.66; 
        }    
      if (species == "NII"){
         log10PartFn[0] = 0.95; 
         log10PartFn[1] = 0.97; 
        }  
      if (species == "NIII"){
         log10PartFn[0] = Math.log10(6.0);
         log10PartFn[1] = Math.log10(6.0);
        }   
      if (species == "NIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }   
      if (species == "OI"){
         log10PartFn[0] = 0.94; 
         log10PartFn[1] = 0.97; 
        }               
      if (species == "OII"){
         log10PartFn[0] = 0.60; 
         log10PartFn[1] = 0.61; 
        }               
      if (species == "OIII"){
         log10PartFn[0] = Math.log10(9.0);
         log10PartFn[1] = Math.log10(9.0);
        }              
      if (species == "OIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }              
      if (species == "FI"){
         log10PartFn[0] = 0.75; 
         log10PartFn[1] =  0.77;
        }             
      if (species == "FII"){
         log10PartFn[0] = 0.92; 
         log10PartFn[1] = 0.94; 
        }             
      if (species == "FIII"){
         log10PartFn[0] = Math.log10(4.0);
         log10PartFn[1] = Math.log10(4.0);
        }           
      if (species == "FIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }           
      if (species == "NeI"){
         log10PartFn[0] = 0.00; 
         log10PartFn[1] = 0.00; 
        }         
      if (species == "NeII"){
         log10PartFn[0] = 0.73; 
         log10PartFn[1] = 0.75; 
        }         
      if (species == "NeIII"){
         log10PartFn[0] = Math.log10(9.0); 
         log10PartFn[1] = Math.log10(9.0); 
        }         
      if (species == "NeIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }         
      if (species == "NaI"){
         log10PartFn[0] = 0.31; 
         log10PartFn[1] = 0.60; 
        }     
      if (species == "NaII"){
         log10PartFn[0] = 0.00; 
         log10PartFn[1] = 0.00; 
        }       
      if (species == "NaIII"){
         log10PartFn[0] = Math.log10(6.0); 
         log10PartFn[1] =  Math.log10(6.0);
        }      
      if (species == "NaIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }      
      if (species == "MgI"){
         log10PartFn[0] = 0.01; 
         log10PartFn[1] = 0.15; 
        }               
      if (species == "MgII"){
         log10PartFn[0] = 0.31; 
         log10PartFn[1] = 0.31; 
        }              
      if (species == "MgIII"){
         log10PartFn[0] = Math.log10(1.0); 
         log10PartFn[1] =  Math.log10(1.0);
        }               
      if (species == "MgIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }               
      if (species == "AlI"){
         log10PartFn[0] = 0.77; 
         log10PartFn[1] = 0.81; 
        }            
      if (species == "AlII"){
         log10PartFn[0] = 0.00; 
         log10PartFn[1] = 0.01; 
        }            
      if (species == "AlIII"){
         log10PartFn[0] = Math.log10(2.0); 
         log10PartFn[1] =  Math.log10(2.0);
        }           
      if (species == "AlIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }           
      if (species == "SiI"){
         log10PartFn[0] = 0.98; 
         log10PartFn[1] = 1.04; 
        }          
      if (species == "SiII"){
         log10PartFn[0] = 0.76; 
         log10PartFn[1] = 0.77; 
        }         
      if (species == "SiIII"){
         log10PartFn[0] = Math.log10(1.0); 
         log10PartFn[1] =  Math.log10(1.0);
        }        
      if (species == "SiIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }        
      if (species == "PI"){
         log10PartFn[0] = 0.65; 
         log10PartFn[1] = 0.79; 
        }       
      if (species == "PII"){
         log10PartFn[0] = 0.91; 
         log10PartFn[1] = 0.94; 
        }     
      if (species == "PIII"){
         log10PartFn[0] = Math.log10(6.0); 
         log10PartFn[1] =  Math.log10(6.0);
        }     
      if (species == "PIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }     
      if (species == "SI"){
         log10PartFn[0] = 0.91; 
         log10PartFn[1] = 0.94; 
        }     
      if (species == "SII"){
         log10PartFn[0] = 0.62; 
         log10PartFn[1] = 0.72; 
        }    
      if (species == "SIII"){
         log10PartFn[0] = Math.log10(9.0); 
         log10PartFn[1] =  Math.log10(9.0);
        }    
      if (species == "SIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }    
      if (species == "ClI"){
         log10PartFn[0] = 0.72; 
         log10PartFn[1] = 0.75; 
        } 
      if (species == "ClII"){
         log10PartFn[0] = 0.89; 
         log10PartFn[1] = 0.92; 
        }                
      if (species == "ClIII"){
         log10PartFn[0] = Math.log10(4.0); 
         log10PartFn[1] =  Math.log10(4.0);
        }                 
      if (species == "ClIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }                 
      if (species == "ArI"){
         log10PartFn[0] = 0.00; 
         log10PartFn[1] = 0.00; 
        }           
      if (species == "ArII"){
         log10PartFn[0] = 0.69; 
         log10PartFn[1] = 0.71; 
        }             
      if (species == "ArIII"){
         log10PartFn[0] = Math.log10(9.0); 
         log10PartFn[1] =  Math.log10(9.0);
        }             
      if (species == "ArIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }             
      if (species == "KI"){
         log10PartFn[0] = 0.34; 
         log10PartFn[1] = 0.60; 
        }
      if (species == "KII"){
         log10PartFn[0] = 0.00; 
         log10PartFn[1] = 0.00; 
        }
      if (species == "KIII"){
         log10PartFn[0] = Math.log10(6.0); 
         log10PartFn[1] =  Math.log10(6.0);
         }         
      if (species == "KIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
         }         
      if (species == "CaI"){
         log10PartFn[0] = 0.07; 
         log10PartFn[1] = 0.55; 
         }     
      if (species == "CaII"){
         log10PartFn[0] = 0.34; 
         log10PartFn[1] = 0.54; 
         }     
      if (species == "CaIII"){
       log10PartFn[0] =  Math.log10(1.0);
       log10PartFn[1] =  Math.log10(1.0);
         }    
      if (species == "CaIV"){
       log10PartFn[0] = 0.00; 
       log10PartFn[1] = 0.00; 
         }    
      if (species == "ScI"){
         log10PartFn[0] = 1.08; 
         log10PartFn[1] = 1.49; 
         }     
      if (species == "ScII"){
         log10PartFn[0] = 1.36; 
         log10PartFn[1] = 1.52; 
         }     
      if (species == "ScIII"){
         log10PartFn[0] = Math.log10(10.0); 
         log10PartFn[1] =  Math.log10(10.0);
         }  
      if (species == "ScIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
         }  
      if (species == "TiI"){
         log10PartFn[0] = 1.48; 
         log10PartFn[1] = 1.88; 
         } 
      if (species == "TiII"){
         log10PartFn[0] = 1.75; 
         log10PartFn[1] = 1.92; 
         }                   
      if (species == "TiIII"){
         log10PartFn[0] = Math.log10(21.0); 
         log10PartFn[1] =  Math.log10(21.0);
         }                 
      if (species == "TiIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
         }                 
      if (species == "VI"){
         log10PartFn[0] = 1.62; 
         log10PartFn[1] = 2.03; 
         }               
      if (species == "VII"){
         log10PartFn[0] = 1.64; 
         log10PartFn[1] = 1.89; 
         }                
      if (species == "VIII"){
         log10PartFn[0] = Math.log10(28.0); 
         log10PartFn[1] =  Math.log10(28.0);
         }               
      if (species == "VIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
         }               
      if (species == "CrI"){
         log10PartFn[0] = 1.02; 
         log10PartFn[1] = 1.51; 
         }            
      if (species == "CrII"){
         log10PartFn[0] = 0.86; 
         log10PartFn[1] = 1.22; 
         }           
      if (species == "CrIII"){
         log10PartFn[0] = Math.log10(25.0); 
         log10PartFn[1] =  Math.log10(25.0);
         }             
      if (species == "CrIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
         }             
      if (species == "MnI"){
         log10PartFn[0] = 0.81; 
         log10PartFn[1] = 1.16; 
         }        
      if (species == "MnII"){
         log10PartFn[0] = 0.89; 
         log10PartFn[1] = 1.13; 
         }        
      if (species == "MnIII"){
         log10PartFn[0] = Math.log10(6.0); 
         log10PartFn[1] =  Math.log10(6.0);
         }          
      if (species == "MnIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
         }          
      if (species == "FeI"){
         log10PartFn[0] = 1.43; 
         log10PartFn[1] = 1.74; 
         }     
      if (species == "FeII"){
         log10PartFn[0] = 1.63; 
         log10PartFn[1] = 1.80; 
         }     
      if (species == "FeIII"){
         log10PartFn[0] = Math.log10(25.0); 
         log10PartFn[1] =  Math.log10(25.0);
         }       
      if (species == "FeIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
         }       
      if (species == "CoI"){
         log10PartFn[0] = 1.52; 
         log10PartFn[1] = 1.76; 
         }    
      if (species == "CoII)"){
         log10PartFn[0] = 1.46; 
         log10PartFn[1] = 1.66; 
         }    
      if (species == "CoIII"){
         log10PartFn[0] = Math.log10(28.0); 
         log10PartFn[1] =  Math.log10(28.0);
         }   
      if (species == "CoIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
         }   
      if (species == "NiI"){
         log10PartFn[0] = 1.47; 
         log10PartFn[1] = 1.60; 
         }                 
      if (species == "NiII"){
         log10PartFn[0] = 1.02; 
         log10PartFn[1] = 1.28; 
         }                
      if (species == "NiIII"){
         log10PartFn[0] = Math.log10(21.0); 
         log10PartFn[1] =  Math.log10(21.0);
         }                  
      if (species == "NiIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
         }                  
      if (species == "CuI"){
         log10PartFn[0] = 0.36; 
         log10PartFn[1] = 0.58; 
         }             
      if (species == "CuII"){
         log10PartFn[0] = 0.01; 
         log10PartFn[1] = 0.18; 
         }             
      if (species == "CuIII"){
         log10PartFn[0] = Math.log10(10.0); 
         log10PartFn[1] =  Math.log10(10.0);
         }               
      if (species == "CuIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
         }               
      if (species == "ZnI"){
         log10PartFn[0] = 0.00; 
         log10PartFn[1] = 0.03; 
         }          
      if (species == "ZnII"){
        log10PartFn[0] = 0.30; 
        log10PartFn[1] = 0.30; 
         }           
      if (species == "ZnIII"){
         log10PartFn[0] = Math.log10(1.0); 
         log10PartFn[1] =  Math.log10(1.0);
         }          
      if (species == "ZnIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
         }          
      if (species == "GaI"){
         log10PartFn[0] = 0.73; 
         log10PartFn[1] = 0.77; 
         }       
      if (species == "GaII"){
         log10PartFn[0] = 0.00; 
         log10PartFn[1] = 0.00; 
         }        
      if (species == "GaIII"){
         log10PartFn[0] = Math.log10(2.0); 
         log10PartFn[1] =  Math.log10(2.0);
         }       
      if (species == "GaIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
         }       
      if (species == "KrI"){
         log10PartFn[0] = 0.00; 
         log10PartFn[1] = 0.00; 
         }
      if (species == "KrII"){
         log10PartFn[0] = 0.62; 
         log10PartFn[1] = 0.66; 
        }     
      if (species == "KrIII"){
         log10PartFn[0] = Math.log10(9.0); 
         log10PartFn[1] =  Math.log10(9.0);
        }      
      if (species == "KrIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }      
      if (species == "RbI"){
         log10PartFn[0] = 0.36; 
         log10PartFn[1] = 0.70; 
        } 
      if (species == "RbII"){
         log10PartFn[0] = 0.00; 
         log10PartFn[1] = 0.00; 
        }                 
      if (species == "RbIII"){
         log10PartFn[0] = Math.log10(6.0); 
         log10PartFn[1] =  Math.log10(6.0);
        }                 
      if (species == "RbIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }                 
      if (species == "SrI"){
         log10PartFn[0] = 0.10; 
         log10PartFn[1] = 0.70; 
        }             
      if (species == "SrII"){
         log10PartFn[0] = 0.34; 
         log10PartFn[1] = 0.53; 
        }             
      if (species == "SrIII"){
         log10PartFn[0] = Math.log10(1.0); 
         log10PartFn[1] =  Math.log10(1.0);
        }              
      if (species == "SrIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }              
      if (species == "YI"){
         log10PartFn[0] = 1.08; 
         log10PartFn[1] = 1.50; 
        }             
      if (species == "YII"){
         log10PartFn[0] = 1.18; 
         log10PartFn[1] = 1.41; 
        }            
      if (species == "YIII"){
         log10PartFn[0] = Math.log10(10.0); 
         log10PartFn[1] =  Math.log10(10.0);
        }           
      if (species == "YIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }           
      if (species == "ZrI"){
         log10PartFn[0] = 1.53; 
         log10PartFn[1] = 1.99; 
        }                 
      if (species == "ZrII"){
         log10PartFn[0] = 1.66; 
         log10PartFn[1] = 1.91; 
        }                    
      if (species == "ZrIII"){
         log10PartFn[0] = Math.log10(21.0); 
         log10PartFn[1] =  Math.log10(21.0);
        }                
      if (species == "ZrIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }                
      if (species == "NbI"){
         log10PartFn[0] = 0.00; 
         log10PartFn[1] = 0.00; 
        }              
      if (species == "NbII"){
         log10PartFn[0] = 0.00; 
         log10PartFn[1] = 0.00; 
        }                
      if (species == "NbIII"){
         log10PartFn[0] = Math.log10(1.0); 
         log10PartFn[1] =  Math.log10(1.0);
        }                
      if (species == "NbIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }                
      if (species == "CsI"){
         log10PartFn[0] = 0.00; 
         log10PartFn[1] = 0.00; 
        }              
      if (species == "CsII"){
         log10PartFn[0] = 0.00; 
         log10PartFn[1] = 0.00; 
        }                
      if (species == "CsIII"){
         log10PartFn[0] = Math.log10(1.0); 
         log10PartFn[1] =  Math.log10(1.0);
        }                
      if (species == "CsIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }                
      if (species == "BaI"){
         log10PartFn[0] = 0.36; 
         log10PartFn[1] = 0.92; 
        }             
      if (species == "BaII"){
         log10PartFn[0] = 0.62; 
         log10PartFn[1] = 0.85; 
        }             
      if (species == "BaIII"){
         log10PartFn[0] = Math.log10(1.0); 
         log10PartFn[1] =  Math.log10(1.0);
        }              
      if (species == "BaIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }              
      if (species == "LaI"){
         log10PartFn[0] = 1.41; 
         log10PartFn[1] = 1.85; 
        }            
      if (species == "LaII"){
         log10PartFn[0] = 1.47; 
         log10PartFn[1] = 1.71; 
        }          
      if (species == "LaIII"){
         log10PartFn[0] =  Math.log10(10.0);
         log10PartFn[1] =  Math.log10(10.0);
        }          
      if (species == "LaIV"){
         log10PartFn[0] = 0.0; 
         log10PartFn[1] =  0.0;
        }          

//
return log10PartFn;

};  //end of method getIonE    

