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
        txtId.style.width = "750px";
        txtId.style.marginTop = yStr;
        txtId.style.marginLeft = xStr;
        txtId.style.color = RGBHex;
        txtId.innerHTML = text;
        //masterId.appendChild(numId);
        areaId.appendChild(txtId);
    }; // end txtPrint

                        //JB
    var txtPrintYAx = function(text, x, y, RGBHex, areaId) {

        var xStr = numToPxStrng(x);
        var yStr = numToPxStrng(y);
       // var RGBHex = colHex(r255, g255, b255);
        var txtId = document.createElement("p");
        txtId.style.position = "absolute";
        txtId.style.display = "block";
        txtId.style.width = "50px";
        txtId.style.marginTop = yStr;
        txtId.style.marginLeft = xStr;
        txtId.style.color = RGBHex;
        txtId.innerHTML = text;
        //masterId.appendChild(numId);
        areaId.appendChild(txtId);
    }; // end txtPrint
                        //Jb

    /* Not needed with HTML5 <canvas> tag... ???
 *
 *      plotPnt takes in the *numerical* x- and y- DEVICE coordinates (browser pixels),
 *           hexadecimal colour, and opacity, and plots a generic plotting dot at that location:
 *                Calls numToPxStrng to convert numeric coordinates and opacity to style attribute strings for HTML
 *                     Calls colHex to convert R, G, and B amounts out of 255 into #RRGGBB hex format
 *                          */
/*
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
*/

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


/* Not currently used??
 *
 Linear interpolation to a new abscissa - mainly for interpoalting flux to a specific lambda
 This version for 2XN vector where we want to interpolate in row 1 - log units
 */
/*
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
*/
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
 * Return the array index of the optical depth arry (tauRos) closest to a
 * desired value of optical depth (tau). except an (N x M) array of values
 */


var tauPointP2 = function(numDeps, tauN, nth, logTau) {

    var index;
    //var indacies = [];
    var tauForNth = [];
   // help.length = numDeps;

    for (var i = 0; i < numDeps; i++) {
        //console.log(tauN[nth][i]);
        var tempVar = (Math.abs(tauN[nth][i]));
        tauForNth.push(tempVar);// - logTau;
        //help.push(Math.abs(help[i]));
    }

    index = 0;
    var min = tauForNth[index];
    for (var i = 1; i < numDeps; i++) {

        if (tauForNth[i] < min) {
            min = tauForNth[i];
            index = i;
//          console.log(index);
            //indacies.push(index);
        }
    }

    return index;//indacies;

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

//
    var getMolMass = function(molName){

    var molMass = 2.0;  //default initialization (H_2)

    if (molName == "TiO"){
       molMass = getMass("O") + getMass("Ti");
        }


//
    return molMass;


}; // end of getMolMass method


// Ground state ionization energies in eV 
//From NIST Atomic Spectra Database
//Ionization Energies Data
//Kramida, A., Ralchenko, Yu., Reader, J., and NIST ASD Team (2014). NIST Atomic Spectra Database (ver. 5.2), [Online]. Available: http://physics.nist.gov/asd [2015, November 23]. National Institute of Standards and Technology, Gaithersburg, MD.
//Heaviest element treatable: La


//Ionization stages that don't exist (eg. "HIII") are given extremely large ioization energies (999 ev)


   var getIonE = function(species){

   var ionE = 999999.0; //default initialization

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

//
   var getMolPartFn = function(species){

// Diatomic Partition fn values, Q_AB, from
//http://vizier.cfa.harvard.edu/viz-bin/VizieR?-source=J/A+A/588/A96
//See: Barklem, P. S.; Collet, R., 2016, Astronomy & Astrophysics, Volume 588, id.A96
//Just do linear piecewise interpolation in log of to hottest five values for now:
   var logPartFn = [];
   logPartFn.length = 5;
   //default initialization
   logPartFn[0] = 0.0;  //for T = 130 K
   logPartFn[1] = 0.0;  //for T = 500 K
   logPartFn[2] = 0.0;  //for T = 3000 K
   logPartFn[3] = 0.0;  //for T = 8000 K
   logPartFn[4] = 0.0;  //for T = 10000 K



      if (species == "H2"){
         logPartFn[0] = Math.log(8.83429e-01);
         logPartFn[1] = Math.log(3.12970e+00);
         logPartFn[2] = Math.log(2.22684e+01);
         logPartFn[3] = Math.log(1.24852e+02);
         logPartFn[4] = Math.log(1.94871e+02);
       }

      if (species == "C2"){
         logPartFn[0] = Math.log(2.53157e+01);
         logPartFn[1] = Math.log(2.08677e+02);
         logPartFn[2] = Math.log(6.75852e+03);
         logPartFn[3] = Math.log(6.15554e+04);
         logPartFn[4] = Math.log(1.07544e+05);
       }

      if (species == "N2"){
         logPartFn[0] = Math.log(2.28805e+01);
         logPartFn[1] = Math.log(8.76988e+01);
         logPartFn[2] = Math.log(7.89979e+02);
         logPartFn[3] = Math.log(4.32734e+03);
         logPartFn[4] = Math.log(6.68047e+03);
       }

      if (species == "O2"){
         logPartFn[0] = Math.log(9.78808e+01);
         logPartFn[1] = Math.log(3.70966e+02);
         logPartFn[2] = Math.log(4.34427e+03);
         logPartFn[3] = Math.log(3.30098e+04);
         logPartFn[4] = Math.log(5.76869e+04);
       }

      if (species == "H2+"){
         logPartFn[0] = Math.log(3.40918e+00);
         logPartFn[1] = Math.log(1.21361e+01);
         logPartFn[2] = Math.log(1.16205e+02);
         logPartFn[3] = Math.log(7.56297e+02);
         logPartFn[4] = Math.log(1.18728e+03);
       }

      if (species == "CH"){
         logPartFn[0] = Math.log(3.13181e+01);
         logPartFn[1] = Math.log(1.03985e+02);
         logPartFn[2] = Math.log(9.04412e+02);
         logPartFn[3] = Math.log(6.99662e+03);
         logPartFn[4] = Math.log(1.22732e+04);
       }

      if (species == "NH"){
         logPartFn[0] = Math.log(1.76430e+01);
         logPartFn[1] = Math.log(6.50991e+01);
         logPartFn[2] = Math.log(5.20090e+02);
         logPartFn[3] = Math.log(3.35774e+03);
         logPartFn[4] = Math.log(5.85785e+03);
       }

      if (species == "OH"){
         logPartFn[0] = Math.log(2.54704e+01);
         logPartFn[1] = Math.log(8.07652e+01);
         logPartFn[2] = Math.log(5.77700e+02);
         logPartFn[3] = Math.log(3.11647e+03);
         logPartFn[4] = Math.log(5.02698e+03);
       }

      if (species == "MgH"){
         logPartFn[0] = Math.log(3.22349e+01);
         logPartFn[1] = Math.log(1.24820e+02);
         logPartFn[2] = Math.log(1.69231e+03);
         logPartFn[3] = Math.log(1.72862e+04);
         logPartFn[4] = Math.log(3.16394e+04);
      }

      if (species == "CaH"){
         logPartFn[0] = Math.log(4.34133e+01);
         logPartFn[1] = Math.log(1.69692e+02);
         logPartFn[2] = Math.log(2.33105e+03);
         logPartFn[3] = Math.log(2.24220e+04);
         logPartFn[4] = Math.log(4.33139e+04);
       }

      if (species == "CN"){
         logPartFn[0] = Math.log(9.62592e+01);
         logPartFn[1] = Math.log(3.69706e+02);
         logPartFn[2] = Math.log(3.65207e+03);
         logPartFn[3] = Math.log(2.59277e+04);
         logPartFn[4] = Math.log(4.43257e+04);
       }

      if (species == "CO"){
         logPartFn[0] = Math.log(4.73391e+01);
         logPartFn[1] = Math.log(1.81659e+02);
         logPartFn[2] = Math.log(1.71706e+03);
         logPartFn[3] = Math.log(9.67381e+03);
         logPartFn[4] = Math.log(1.50689e+04);
       }

      if (species == "NO"){
         logPartFn[0] = Math.log(1.38024e+02);
         logPartFn[1] = Math.log(7.06108e+02);
         logPartFn[2] = Math.log(8.21159e+03);
         logPartFn[3] = Math.log(4.97309e+04);
         logPartFn[4] = Math.log(7.94214e+04);
       }

      if (species == "FeO"){
         logPartFn[0] = Math.log(1.85254e+03);
         logPartFn[1] = Math.log(7.52666e+03);
         logPartFn[2] = Math.log(1.23649e+05);
         logPartFn[3] = Math.log(9.55089e+05);
         logPartFn[4] = Math.log(1.58411e+06);
       }

      if (species == "SiO"){
         logPartFn[0] = Math.log(1.25136e+02);
         logPartFn[1] = Math.log(4.95316e+02);
         logPartFn[2] = Math.log(6.63653e+03);
         logPartFn[3] = Math.log(4.56577e+04);
         logPartFn[4] = Math.log(8.57529e+04);
       }

      if (species == "CaO"){
         logPartFn[0] = Math.log(2.03667e+02);
         logPartFn[1] = Math.log(8.94430e+02);
         logPartFn[2] = Math.log(2.08874e+04);
         logPartFn[3] = Math.log(5.21424e+05);
         logPartFn[4] = Math.log(1.08355e+06);
       }

      if (species == "TiO"){
         logPartFn[0] = Math.log(5.04547e+02);
         logPartFn[1] = Math.log(3.27426e+03);
         logPartFn[2] = Math.log(6.43969e+04);
         logPartFn[3] = Math.log(5.28755e+05);
         logPartFn[4] = Math.log(9.61395e+05);
       }

      if (species == "VO"){
         logPartFn[0] = Math.log(6.62935e+02);
         logPartFn[1] = Math.log(2.70111e+03);
         logPartFn[2] = Math.log(4.15856e+04);
         logPartFn[3] = Math.log(3.57467e+05);
         logPartFn[4] = Math.log(6.53298e+05);
       }

return logPartFn;

   };  //end of method getMolPartFn


 var hjertingComponents = function(){

//Hjerting function components (expansion coefficients in Voigt fn "a" parameter):
// Observation and Analysis of Stellar Photospehres -, 3rd. Ed., Tab 11.5, p. 256
// David F. Gray
//Note: "u" is the Voigt fn "v" parameter

  var numV = 81;
  var hjertComp = [];
//Row 0 containt abscissae (Voigt fn "v" parameter)
  hjertComp.length = 6;
  for (var i = 0; i < numV; i++){
     hjertComp[i] = [];
     hjertComp[i].length = numV;
  }

//u    H_0(u)    H_1(u)     H_2(u)    H_3(u)    H_4(u)

hjertComp[0][0] = 0.0; hjertComp[1][0] =   1.000000 ; hjertComp[2][0] = -1.12838 ; hjertComp[3][0] =   1.0000 ; hjertComp[4][0] =  -0.752 ; hjertComp[5][0] =    0.50;
hjertComp[0][1] = 0.1; hjertComp[1][1] =   0.990050 ; hjertComp[2][1] = -1.10596 ; hjertComp[3][1] =   0.9702 ; hjertComp[4][1] =  -0.722 ; hjertComp[5][1] =    0.48;
hjertComp[0][2] = 0.2; hjertComp[1][2] =   0.960789 ; hjertComp[2][2] = -1.04048 ; hjertComp[3][2] =   0.8839 ; hjertComp[4][2] =  -0.637 ; hjertComp[5][2] =    0.40;
hjertComp[0][3] = 0.3; hjertComp[1][3] =   0.913931 ; hjertComp[2][3] = -0.93703 ; hjertComp[3][3] =   0.7494 ; hjertComp[4][3] =  -0.505 ; hjertComp[5][3] =    0.30;
hjertComp[0][4] = 0.4; hjertComp[1][4] =   0.852144 ; hjertComp[2][4] = -0.80346 ; hjertComp[3][4] =   0.5795 ; hjertComp[4][4] =  -0.342 ; hjertComp[5][4] =    0.17;
hjertComp[0][5] = 0.5; hjertComp[1][5] =   0.778801 ; hjertComp[2][5] = -0.64945 ; hjertComp[3][5] =   0.3894 ; hjertComp[4][5] =  -0.165 ; hjertComp[5][5] =    0.03;
hjertComp[0][6] = 0.6; hjertComp[1][6] =   0.697676 ; hjertComp[2][6] = -0.48582 ; hjertComp[3][6] =   0.1953 ; hjertComp[4][6] =   0.007 ; hjertComp[5][6] =   -0.09;
hjertComp[0][7] = 0.7; hjertComp[1][7] =   0.612626 ; hjertComp[2][7] = -0.32192 ; hjertComp[3][7] =   0.0123 ; hjertComp[4][7] =   0.159 ; hjertComp[5][7] =   -0.20;
hjertComp[0][8] = 0.8; hjertComp[1][8] =   0.527292 ; hjertComp[2][8] = -0.16772 ; hjertComp[3][8] =  -0.1476 ; hjertComp[4][8] =   0.280 ; hjertComp[5][8] =   -0.27;
hjertComp[0][9] = 0.9; hjertComp[1][9] =   0.444858 ; hjertComp[2][9] = -0.03012 ; hjertComp[3][9] =  -0.2758 ; hjertComp[4][9] =   0.362 ; hjertComp[5][9] =   -0.30;

hjertComp[0][10] = 1.0; hjertComp[1][10] =   0.367879 ; hjertComp[2][10] =  0.08594 ; hjertComp[3][10] =  -0.3679 ; hjertComp[4][10] =   0.405 ; hjertComp[5][10] =   -0.31;
hjertComp[0][11] = 1.1; hjertComp[1][11] =   0.298197 ; hjertComp[2][11] =  0.17789 ; hjertComp[3][11] =  -0.4234 ; hjertComp[4][11] =   0.411 ; hjertComp[5][11] =   -0.28;
hjertComp[0][12] = 1.2; hjertComp[1][12] =   0.236928 ; hjertComp[2][12] =  0.24537 ; hjertComp[3][12] =  -0.4454 ; hjertComp[4][12] =   0.386 ; hjertComp[5][12] =   -0.24;
hjertComp[0][13] = 1.3; hjertComp[1][13] =   0.184520 ; hjertComp[2][13] =  0.28981 ; hjertComp[3][13] =  -0.4392 ; hjertComp[4][13] =   0.339 ; hjertComp[5][13] =   -0.18;
hjertComp[0][14] = 1.4; hjertComp[1][14] =   0.140858 ; hjertComp[2][14] =  0.31394 ; hjertComp[3][14] =  -0.4113 ; hjertComp[4][14] =   0.280 ; hjertComp[5][14] =   -0.12;
hjertComp[0][15] = 1.5; hjertComp[1][15] =   0.105399 ; hjertComp[2][15] =  0.32130 ; hjertComp[3][15] =  -0.3689 ; hjertComp[4][15] =   0.215 ; hjertComp[5][15] =   -0.07;
hjertComp[0][16] = 1.6; hjertComp[1][16] =   0.077305 ; hjertComp[2][16] =  0.31573 ; hjertComp[3][16] =  -0.3185 ; hjertComp[4][16] =   0.153 ; hjertComp[5][16] =   -0.02;
hjertComp[0][17] = 1.7; hjertComp[1][17] =   0.055576 ; hjertComp[2][17] =  0.30094 ; hjertComp[3][17] =  -0.2657 ; hjertComp[4][17] =   0.097 ; hjertComp[5][17] =    0.02;
hjertComp[0][18] = 1.8; hjertComp[1][18] =   0.039164 ; hjertComp[2][18] =  0.28027 ; hjertComp[3][18] =  -0.2146 ; hjertComp[4][18] =   0.051 ; hjertComp[5][18] =    0.04;
hjertComp[0][19] = 1.9; hjertComp[1][19] =   0.027052 ; hjertComp[2][19] =  0.25648 ; hjertComp[3][19] =  -0.1683 ; hjertComp[4][19] =   0.015 ; hjertComp[5][19] =    0.05;

hjertComp[0][20] = 2.0; hjertComp[1][20] =   0.0183156; hjertComp[2][20] =  0.231726; hjertComp[3][20] =  -0.12821; hjertComp[4][20] =  -0.0101; hjertComp[5][20] =    0.058;
hjertComp[0][21] = 2.1; hjertComp[1][21] =   0.0121552; hjertComp[2][21] =  0.207528; hjertComp[3][21] =  -0.09505; hjertComp[4][21] =  -0.0265; hjertComp[5][21] =    0.056;
hjertComp[0][22] = 2.2; hjertComp[1][22] =   0.0079071; hjertComp[2][22] =  0.184882; hjertComp[3][22] =  -0.06863; hjertComp[4][22] =  -0.0355; hjertComp[5][22] =    0.051;
hjertComp[0][23] = 2.3; hjertComp[1][23] =   0.0050418; hjertComp[2][23] =  0.164341; hjertComp[3][23] =  -0.04830; hjertComp[4][23] =  -0.0391; hjertComp[5][23] =    0.043;
hjertComp[0][24] = 2.4; hjertComp[1][24] =   0.0031511; hjertComp[2][24] =  0.146128; hjertComp[3][24] =  -0.03315; hjertComp[4][24] =  -0.0389; hjertComp[5][24] =    0.035;
hjertComp[0][25] = 2.5; hjertComp[1][25] =   0.0019305; hjertComp[2][25] =  0.130236; hjertComp[3][25] =  -0.02220; hjertComp[4][25] =  -0.0363; hjertComp[5][25] =    0.027;
hjertComp[0][26] = 2.6; hjertComp[1][26] =   0.0011592; hjertComp[2][26] =  0.116515; hjertComp[3][26] =  -0.01451; hjertComp[4][26] =  -0.0325; hjertComp[5][26] =    0.020;
hjertComp[0][27] = 2.7; hjertComp[1][27] =   0.0006823; hjertComp[2][27] =  0.104739; hjertComp[3][27] =  -0.00927; hjertComp[4][27] =  -0.0282; hjertComp[5][27] =    0.015;
hjertComp[0][28] = 2.8; hjertComp[1][28] =   0.0003937; hjertComp[2][28] =  0.094653; hjertComp[3][28] =  -0.00578; hjertComp[4][28] =  -0.0239; hjertComp[5][28] =    0.010;
hjertComp[0][29] = 2.9; hjertComp[1][29] =   0.0002226; hjertComp[2][29] =  0.086005; hjertComp[3][29] =  -0.00352; hjertComp[4][29] =  -0.0201; hjertComp[5][29] =    0.007;

hjertComp[0][30] = 3.0; hjertComp[1][30] =   0.0001234; hjertComp[2][30] =  0.078565; hjertComp[3][30] =  -0.00210; hjertComp[4][30] =  -0.0167; hjertComp[5][30] =    0.005;
hjertComp[0][31] = 3.1; hjertComp[1][31] =   0.0000671; hjertComp[2][31] =  0.072129; hjertComp[3][31] =  -0.00122; hjertComp[4][31] =  -0.0138; hjertComp[5][31] =    0.003;
hjertComp[0][32] = 3.2; hjertComp[1][32] =   0.0000357; hjertComp[2][32] =  0.066526; hjertComp[3][32] =  -0.00070; hjertComp[4][32] =  -0.0115; hjertComp[5][32] =    0.002;
hjertComp[0][33] = 3.3; hjertComp[1][33] =   0.0000186; hjertComp[2][33] =  0.061615; hjertComp[3][33] =  -0.00039; hjertComp[4][33] =  -0.0096; hjertComp[5][33] =    0.001;
hjertComp[0][34] = 3.4; hjertComp[1][34] =   0.0000095; hjertComp[2][34] =  0.057281; hjertComp[3][34] =  -0.00021; hjertComp[4][34] =  -0.0080; hjertComp[5][34] =    0.001;
hjertComp[0][35] = 3.5; hjertComp[1][35] =   0.0000048; hjertComp[2][35] =  0.053430; hjertComp[3][35] =  -0.00011; hjertComp[4][35] =  -0.0068; hjertComp[5][35] =    0.000;
hjertComp[0][36] = 3.6; hjertComp[1][36] =   0.0000024; hjertComp[2][36] =  0.049988; hjertComp[3][36] =  -0.00006; hjertComp[4][36] =  -0.0058; hjertComp[5][36] =    0.000;
hjertComp[0][37] = 3.7; hjertComp[1][37] =   0.0000011; hjertComp[2][37] =  0.046894; hjertComp[3][37] =  -0.00003; hjertComp[4][37] =  -0.0050; hjertComp[5][37] =    0.000;
hjertComp[0][38] = 3.8; hjertComp[1][38] =   0.0000005; hjertComp[2][38] =  0.044098; hjertComp[3][38] =  -0.00001; hjertComp[4][38] =  -0.0043; hjertComp[5][38] =    0.000;
hjertComp[0][39] = 3.9; hjertComp[1][39] =   0.0000002; hjertComp[2][39] =  0.041561; hjertComp[3][39] =  -0.00001; hjertComp[4][39] =  -0.0037; hjertComp[5][39] =    0.000;

hjertComp[0][40] = 4.0; hjertComp[1][40] =   0.0000000; hjertComp[2][40] =  0.039250; hjertComp[3][40] =   0.00000; hjertComp[4][40] =  -0.00329; hjertComp[5][40] =   0.000;
hjertComp[0][41] = 4.2; hjertComp[1][41] =   0.0000000; hjertComp[2][41] =  0.035195; hjertComp[3][41] =   0.00000; hjertComp[4][41] =  -0.00257; hjertComp[5][41] =   0.000;
hjertComp[0][42] = 4.4; hjertComp[1][42] =   0.0000000; hjertComp[2][42] =  0.031762; hjertComp[3][42] =   0.00000; hjertComp[4][42] =  -0.00205; hjertComp[5][42] =   0.000;
hjertComp[0][43] = 4.6; hjertComp[1][43] =   0.0000000; hjertComp[2][43] =  0.028824; hjertComp[3][43] =   0.00000; hjertComp[4][43] =  -0.00166; hjertComp[5][43] =   0.000;
hjertComp[0][44] = 4.8; hjertComp[1][44] =   0.0000000; hjertComp[2][44] =  0.026288; hjertComp[3][44] =   0.00000; hjertComp[4][44] =  -0.00137; hjertComp[5][44] =   0.000;
hjertComp[0][45] = 5.0; hjertComp[1][45] =   0.0000000; hjertComp[2][45] =  0.024081; hjertComp[3][45] =   0.00000; hjertComp[4][45] =  -0.00113; hjertComp[5][45] =   0.000;
hjertComp[0][46] = 5.2; hjertComp[1][46] =   0.0000000; hjertComp[2][46] =  0.022146; hjertComp[3][46] =   0.00000; hjertComp[4][46] =  -0.00095; hjertComp[5][46] =   0.000;
hjertComp[0][47] = 5.4; hjertComp[1][47] =   0.0000000; hjertComp[2][47] =  0.020441; hjertComp[3][47] =   0.00000; hjertComp[4][47] =  -0.00080; hjertComp[5][47] =   0.000;
hjertComp[0][48] = 5.6; hjertComp[1][48] =   0.0000000; hjertComp[2][48] =  0.018929; hjertComp[3][48] =   0.00000; hjertComp[4][48] =  -0.00068; hjertComp[5][48] =   0.000;
hjertComp[0][49] = 5.8; hjertComp[1][49] =   0.0000000; hjertComp[2][49] =  0.017582; hjertComp[3][49] =   0.00000; hjertComp[4][49] =  -0.00059; hjertComp[5][49] =   0.000;

hjertComp[0][50] = 6.0; hjertComp[1][50] =   0.0000000; hjertComp[2][50] =  0.016375;  hjertComp[3][50] =  0.00000; hjertComp[4][50] =  -0.00051; hjertComp[5][50] =   0.000;
hjertComp[0][51] = 6.2; hjertComp[1][51] =   0.0000000; hjertComp[2][51] =  0.015291;  hjertComp[3][51] =  0.00000; hjertComp[4][51] =  -0.00044; hjertComp[5][51] =   0.000;
hjertComp[0][52] = 6.4; hjertComp[1][52] =   0.0000000; hjertComp[2][52] =  0.014312;  hjertComp[3][52] =  0.00000; hjertComp[4][52] =  -0.00038; hjertComp[5][52] =   0.000;
hjertComp[0][53] = 6.6; hjertComp[1][53] =   0.0000000; hjertComp[2][53] =  0.013426;  hjertComp[3][53] =  0.00000; hjertComp[4][53] =  -0.00034; hjertComp[5][53] =   0.000;
hjertComp[0][54] = 6.8; hjertComp[1][54] =   0.0000000; hjertComp[2][54] =  0.012620;  hjertComp[3][54] =  0.00000; hjertComp[4][54] =  -0.00030; hjertComp[5][54] =   0.000;
hjertComp[0][55] = 7.0; hjertComp[1][55] =   0.0000000; hjertComp[2][55] =  0.0118860; hjertComp[3][55] =  0.00000; hjertComp[4][55] =  -0.00026; hjertComp[5][55] =   0.000;
hjertComp[0][56] = 7.2; hjertComp[1][56] =   0.0000000; hjertComp[2][56] =  0.0112145; hjertComp[3][56] =  0.00000; hjertComp[4][56] =  -0.00023; hjertComp[5][56] =   0.000;
hjertComp[0][57] = 7.4; hjertComp[1][57] =   0.0000000; hjertComp[2][57] =  0.0105990; hjertComp[3][57] =  0.00000; hjertComp[4][57] =  -0.00021; hjertComp[5][57] =   0.000;
hjertComp[0][58] = 7.6; hjertComp[1][58] =   0.0000000; hjertComp[2][58] =  0.0100332; hjertComp[3][58] =  0.00000; hjertComp[4][58] =  -0.00019; hjertComp[5][58] =   0.000;
hjertComp[0][59] = 7.8; hjertComp[1][59] =   0.0000000; hjertComp[2][59] =  0.0095119; hjertComp[3][59] =  0.00000; hjertComp[4][59] =  -0.00017; hjertComp[5][59] =   0.000;

hjertComp[0][60] = 8.0; hjertComp[1][60] =   0.0000000; hjertComp[2][60] =  0.0090306; hjertComp[3][60] =  0.00000; hjertComp[4][60] =  -0.00015; hjertComp[5][60] =   0.000;
hjertComp[0][61] = 8.2; hjertComp[1][61] =   0.0000000; hjertComp[2][61] =  0.0085852; hjertComp[3][61] =  0.00000; hjertComp[4][61] =  -0.00013; hjertComp[5][61] =   0.000;
hjertComp[0][62] = 8.4; hjertComp[1][62] =   0.0000000; hjertComp[2][62] =  0.0081722; hjertComp[3][62] =  0.00000; hjertComp[4][62] =  -0.00012; hjertComp[5][62] =   0.000;
hjertComp[0][63] = 8.6; hjertComp[1][63] =   0.0000000; hjertComp[2][63] =  0.0077885; hjertComp[3][63] =  0.00000; hjertComp[4][63] =  -0.00011; hjertComp[5][63] =   0.000;
hjertComp[0][64] = 8.8; hjertComp[1][64] =   0.0000000; hjertComp[2][64] =  0.0074314; hjertComp[3][64] =  0.00000; hjertComp[4][64] =  -0.00010; hjertComp[5][64] =   0.000;
hjertComp[0][65] = 9.0; hjertComp[1][65] =   0.0000000; hjertComp[2][65] =  0.0070985; hjertComp[3][65] =  0.00000; hjertComp[4][65] =  -0.00009; hjertComp[5][65] =   0.000;
hjertComp[0][66] = 9.2; hjertComp[1][66] =   0.0000000; hjertComp[2][66] =  0.0067875; hjertComp[3][66] =  0.00000; hjertComp[4][66] =  -0.00008; hjertComp[5][66] =   0.000;
hjertComp[0][67] = 9.4; hjertComp[1][67] =   0.0000000; hjertComp[2][67] =  0.0064967; hjertComp[3][67] =  0.00000; hjertComp[4][67] =  -0.00008; hjertComp[5][67] =   0.000;
hjertComp[0][68] = 9.6; hjertComp[1][68] =   0.0000000; hjertComp[2][68] =  0.0062243; hjertComp[3][68] =  0.00000; hjertComp[4][68] =  -0.00007; hjertComp[5][68] =   0.000;
hjertComp[0][69] = 9.8; hjertComp[1][69] =   0.0000000; hjertComp[2][69] =  0.0059688; hjertComp[3][69] =  0.00000; hjertComp[4][69] =  -0.00007; hjertComp[5][69] =   0.000;

hjertComp[0][70] = 10.0; hjertComp[1][70] =  0.000000 ; hjertComp[2][70] =  0.0057287; hjertComp[3][70] =  0.00000; hjertComp[4][70] =  -0.00006; hjertComp[5][70] =   0.000;
hjertComp[0][71] = 10.2; hjertComp[1][71] =  0.000000 ; hjertComp[2][71] =  0.0055030; hjertComp[3][71] =  0.00000; hjertComp[4][71] =  -0.00006; hjertComp[5][71] =   0.000;
hjertComp[0][72] = 10.4; hjertComp[1][72] =  0.000000 ; hjertComp[2][72] =  0.0052903; hjertComp[3][72] =  0.00000; hjertComp[4][72] =  -0.00005; hjertComp[5][72] =   0.000;
hjertComp[0][73] = 10.6; hjertComp[1][73] =  0.000000 ; hjertComp[2][73] =  0.0050898; hjertComp[3][73] =  0.00000; hjertComp[4][73] =  -0.00005; hjertComp[5][73] =   0.000;
hjertComp[0][74] = 10.8; hjertComp[1][74] =  0.000000 ; hjertComp[2][74] =  0.0049006; hjertComp[3][74] =  0.00000; hjertComp[4][74] =  -0.00004; hjertComp[5][74] =   0.000;
hjertComp[0][75] = 11.0; hjertComp[1][75] =  0.000000 ; hjertComp[2][75] =  0.0047217; hjertComp[3][75] =  0.00000; hjertComp[4][75] =  -0.00004; hjertComp[5][75] =   0.000;
hjertComp[0][76] = 11.2; hjertComp[1][76] =  0.000000 ; hjertComp[2][76] =  0.0045526; hjertComp[3][76] =  0.00000; hjertComp[4][76] =  -0.00004; hjertComp[5][76] =   0.000;
hjertComp[0][77] = 11.4; hjertComp[1][77] =  0.000000 ; hjertComp[2][77] =  0.0043924; hjertComp[3][77] =  0.00000; hjertComp[4][77] =  -0.00003; hjertComp[5][77] =   0.000;
hjertComp[0][78] = 11.6; hjertComp[1][78] =  0.000000 ; hjertComp[2][78] =  0.0042405; hjertComp[3][78] =  0.00000; hjertComp[4][78] =  -0.00003; hjertComp[5][78] =   0.000;
hjertComp[0][79] = 11.8; hjertComp[1][79] =  0.000000 ; hjertComp[2][79] =  0.0040964; hjertComp[3][79] =  0.00000; hjertComp[4][79] =  -0.00003; hjertComp[5][79] =   0.000;

hjertComp[0][80] = 12.0; hjertComp[1][80] =  0.000000 ; hjertComp[2][80] =  0.0039595; hjertComp[3][80] =  0.00000; hjertComp[4][80] =  -0.00003; hjertComp[5][80] =   0.000;

 
    return hjertComp;

  }; //end method hjertingFUnction 


//Various diatomic molecular transition data needed for the 
//Just-overlapping-line-approximation (JOLA)
// to molecular band opacity

//Input SYSTEM is a string with both the molecular species AND the band "system"

// Electronic transition moment, Re, needed for "Line strength", S = |R_e|^2*q_v'v" or just |R_e|^2
// //Allen's Astrophysical quantities, 4.12.2 - 4.13.1  
// // ROtational & vibrational constants for TiO states:, p. 87, Table 4.17

   var getSqTransMoment = function(system){

// Square electronic transition moment, |Re|^2, 
// needed for "Line strength", S = |R_e|^2*q_v'v" or just |R_e|^2
// // //Allen's Astrophysical quantities, 4.12.2 - 4.13.1
// As of Feb 2017 - try the band-head value R_00^2 from last column of table:
   var RSqu = 0.0; //default initialization

      if (system == "TiO_C3Delta_X3Delta"){
         RSqu = 0.84;
       }
      if (system == "TiO_c1Phi_a1Delta"){
         RSqu = 4.63;
       }
      if (system == "TiO_A3Phi_X3Delta"){
         RSqu = 5.24;
       }

//
    return RSqu;

  };  //end of method getSqTransMoment 


   var getRotConst = function(system){


// vibrational constant, B (cm^-1): // ??? what is this??? 
// //Allen's Astrophysical quantities, p. 87, Table 4.17
//
// Feb 2017 - Problem:
// Eq. 1 of Zeidler & Koester 1982 1982A&A...113..173Z
// suggests that "B" is a vibrational E-level constant
// BUT: Allens Astrop. Quant., 4th Ed.,  p. 45 has
// "B_e & alpha_e" as *rotational* constants and
// 'omega_e" and "omega_e*x_e" as vibrational constants
// and "T_0" as electronic energy, all in cm^-1
// I dunno - assume we want Allen's "B_e" values from Table 4.17  
// values for now - I don'r really know what's going on in Zeidler & Koester 82

   var B = [];
   B.length = 2;
   B[1] = 0.0; //Blow = B" - upper vibrational level 
   B[0] = 0.0; //Bup = B' - lower vibrational level


// I dunno - assume we want Allen's "B_e" values from Table 4.17  
// values for now - I don'r really know what's going on in Zeidler & Koester 82
// units: cm^-1
//
// Generally: Higher vibrational states have *smaller* B values
      if (system == "TiO_C3Delta_X3Delta"){
         B[1] = 0.489888; // upper
         B[0] = 0.535431; //lower
      }
      if (system == "TiO_c1Phi_a1Delta"){
         B[1] = 0.500000; // upper - NO DATA in Allen - make up a value for now (that's right!)
         B[0] = 0.537602; //lower
      }
      if (system == "TiO_A3Phi_X3Delta"){
         B[1] = 0.507390; // upper
         B[0] = 0.535431;; //lower
       }

/*
// Okay - try the omega_e values in Allen's Table 4.17
// units: cm^-1 - no!
      if ("TiO_C3Delta_X3Delta".equals(system)){
         B[1] = 838.2567; // upper
         B[0] = 1009.1697; //lower
      }
      if ("TiO_c1Phi_a1Delta".equals(system)){
         B[1] = 1018.273; // lower??
         B[0] = 1150.0; //lower NO DATA in Allen - make up a value for now (that's right!)
      }
      if ("TiO_A3Phi_X3Delta".equals(system)){
         B[1] = 867.7799; // upper 
         B[0] = 1009.1697;; //lower
       }
*/
//
    return B;

  };  //end of method getRotConst


   var getWaveRange = function(system){


// vibrational constant, B: // ??? what is this??? 
// //Allen's Astrophysical quantities, p. 87, Table 4.17

   var lambda = [];
   lambda.length = 2;
   lambda[1] = 0.0; // upper end of approx wavelength range of band (nm)  
   lambda[0] = 0.0; // lower end of approx wavelength range of band (nm)


      if (system == "TiO_C3Delta_X3Delta"){
         lambda[0] = 405.0;
         lambda[1] = 630.0;
      }
      if (system == "TiO_c1Phi_a1Delta"){
         lambda[0] = 490.0;
         lambda[1] = 580.0;
      }
      if (system == "TiO_A3Phi_X3Delta"){
         lambda[0] = 570.0;
         lambda[1] = 865.0;
       }

//
    return lambda;

  };  //end of method getWaveRange

     var getQuantumS = function(system){

//This is "script S" from Alles 4th Ed. p. 88 - Eq. for line strength, S
//Computed from a Wigner 6-j symbols - ??
//Here we tune the values by hand to make the band strengths look right
//  - TiO bands should start to rapidly develop below Teff=4250 at log(g) ~ 2.0
// - I just don't have the molecular data, or knowledge to use it, that I need
// Can anyone out there help, or am I really on my own??

      var jolaQuantumS = 1.0; //default for a multiplicative factor

      if (system == "TiO_C3Delta_X3Delta"){
         jolaQuantumS = 2.0e-14;
      }
      if (system == "TiO_c1Phi_a1Delta"){
         jolaQuantumS = 2.0e-14;
      }
      if (system == "TiO_A3Phi_X3Delta"){
         jolaQuantumS = 2.0e-14;
      }

      return jolaQuantumS;

  }; //end method getQuantumS


   var getOrigin = function(system){

// Wavenumber of band origin, omega_0 (cm^-1)
// //Allen's Astrophysical quantities, p. 91, Table 4.18

   var nu00 = 0.0; //

      if (system == "TiO_C3Delta_X3Delta"){
         nu00 = 19341.7;
      }
      if (system == "TiO_c1Phi_a1Delta"){
         nu00 = 17840.6;
      }
      if (system == "TiO_A3Phi_X3Delta"){
         nu00 = 14095.9;
       }

//Return frequency:
  //no!  double omega00 = Useful.c * nu00;
    return nu00;

  };  //end of method getOrigin

//
//Input data on water phase in temp-press place
// - only boiling point significantly affected
//
   var waterPhase = function(atmPresIn){

//Input: Planetary atmospheric surface pressure in kPa 
//Ouput: boiling point in K

//Data from
//The Engineering ToolBox
//http://www.engineeringtoolbox.com/boiling-point-water-d_926.html
//Water  Pressure and Boiling Point
//Pressure Boiling Point
// kPa     deg C

  var numDataPnts = 99;
  var atmPresKPa = [];
  atmPresKPa.length = numDataPnts;
  var boilTempC = [];
  boilTempC.length = numDataPnts;

 atmPresKPa[0] = 3.45   ; boilTempC[0] = 26.4 ;
 atmPresKPa[1] = 6.90   ; boilTempC[1] = 38.7 ;
 atmPresKPa[2] = 13.79  ; boilTempC[2] = 52.2 ;
 atmPresKPa[3] = 20.69  ; boilTempC[3] = 60.8 ;
 atmPresKPa[4] = 27.58  ; boilTempC[4] = 67.2 ;
 atmPresKPa[5] = 34.48  ; boilTempC[5] = 72.3 ;
 atmPresKPa[6] = 41.37  ; boilTempC[6] = 76.7 ;
 atmPresKPa[7] = 48.27  ; boilTempC[7] = 80.4 ;
 atmPresKPa[8] = 55.16  ; boilTempC[8] = 83.8 ;
 atmPresKPa[9] = 62.06  ; boilTempC[9] = 86.8 ;
 atmPresKPa[10] = 68.95  ; boilTempC[10] = 89.6 ;
 atmPresKPa[11] = 75.85  ; boilTempC[11] = 92.1 ;
 atmPresKPa[12] = 82.74  ; boilTempC[12] = 94.4 ;
 atmPresKPa[13] = 89.64  ; boilTempC[13] = 96.6 ;
 atmPresKPa[14] = 96.53  ; boilTempC[14] = 98.7 ;
 atmPresKPa[15] = 101.3  ; boilTempC[15] = 100 ;
 atmPresKPa[16] = 103.4  ; boilTempC[16] = 101 ;
 atmPresKPa[17] = 110.3  ; boilTempC[17] = 102 ;
 atmPresKPa[18] = 117.2  ; boilTempC[18] = 104 ;
 atmPresKPa[19] = 124.1  ; boilTempC[19] = 106 ;
 atmPresKPa[20] = 131.0  ; boilTempC[20] = 107 ;
 atmPresKPa[21] = 137.9  ; boilTempC[21] = 109 ;
 atmPresKPa[22] = 151.7  ; boilTempC[22] = 112 ;
 atmPresKPa[23] = 165.5  ; boilTempC[23] = 114 ;
 atmPresKPa[24] = 179.3  ; boilTempC[24] = 117 ;
 atmPresKPa[25] = 193.1  ; boilTempC[25] = 119 ;
 atmPresKPa[26] = 206.9  ; boilTempC[26] = 121 ;
 atmPresKPa[27] = 220.6  ; boilTempC[27] = 123 ;
 atmPresKPa[28] = 234.4  ; boilTempC[28] = 125 ;
 atmPresKPa[29] = 248.2  ; boilTempC[29] = 127 ;
 atmPresKPa[30] = 262.0  ; boilTempC[30] = 129 ;
 atmPresKPa[31] = 275.8  ; boilTempC[31] = 131 ;
 atmPresKPa[32] = 289.6  ; boilTempC[32] = 132 ;
 atmPresKPa[33] = 303.4  ; boilTempC[33] = 134 ;
 atmPresKPa[34] = 317.2  ; boilTempC[34] = 135 ;
 atmPresKPa[35] = 331.0  ; boilTempC[35] = 137 ;
 atmPresKPa[36] = 344.8  ; boilTempC[36] = 138 ;
 atmPresKPa[37] = 358.5  ; boilTempC[37] = 140 ;
 atmPresKPa[38] = 372.3  ; boilTempC[38] = 141 ;
 atmPresKPa[39] = 386.1  ; boilTempC[39] = 142 ;
 atmPresKPa[40] = 399.9  ; boilTempC[40] = 144 ;
 atmPresKPa[41] = 413.7  ; boilTempC[41] = 145 ;
 atmPresKPa[42] = 427.5  ; boilTempC[42] = 146 ;
 atmPresKPa[43] = 441.3  ; boilTempC[43] = 147 ;
 atmPresKPa[44] = 455.1  ; boilTempC[44] = 148 ;
 atmPresKPa[45] = 468.9  ; boilTempC[45] = 149 ;
 atmPresKPa[46] = 482.7  ; boilTempC[46] = 151 ;
 atmPresKPa[47] = 496.4  ; boilTempC[47] = 152 ;
 atmPresKPa[48] = 510.2  ; boilTempC[48] = 153 ;
 atmPresKPa[49] = 524.0  ; boilTempC[49] = 154 ;
 atmPresKPa[50] = 537.8  ; boilTempC[50] = 155 ;
 atmPresKPa[51] = 551.6  ; boilTempC[51] = 156 ;
 atmPresKPa[52] = 565.4  ; boilTempC[52] = 157 ;
 atmPresKPa[53] = 579.2  ; boilTempC[53] = 158 ;
 atmPresKPa[54] = 593.0  ; boilTempC[54] = 158 ;
 atmPresKPa[55] = 606.8  ; boilTempC[55] = 159 ;
 atmPresKPa[56] = 620.6  ; boilTempC[56] = 160 ;
 atmPresKPa[57] = 634.3  ; boilTempC[57] = 161 ;
 atmPresKPa[58] = 648.1  ; boilTempC[58] = 162 ;
 atmPresKPa[59] = 661.9  ; boilTempC[59] = 163 ;
 atmPresKPa[60] = 675.7  ; boilTempC[60] = 164 ;
 atmPresKPa[61] = 689.5  ; boilTempC[61] = 164 ;
 atmPresKPa[62] = 724.0  ; boilTempC[62] = 166 ;
 atmPresKPa[63] = 758.5  ; boilTempC[63] = 168 ;
 atmPresKPa[64] = 792.9  ; boilTempC[64] = 170 ;
 atmPresKPa[65] = 827.4  ; boilTempC[65] = 172 ;
 atmPresKPa[66] = 1034   ; boilTempC[66] = 181 ;
 atmPresKPa[67] = 1207   ; boilTempC[67] = 189 ;
 atmPresKPa[68] = 1379   ; boilTempC[68] = 194 ;
 atmPresKPa[69] = 1551   ; boilTempC[69] = 200 ;
 atmPresKPa[70] = 1724   ; boilTempC[70] = 205 ;
 atmPresKPa[71] = 1896   ; boilTempC[71] = 210 ;
 atmPresKPa[72] = 2069   ; boilTempC[72] = 214 ;
 atmPresKPa[73] = 2241   ; boilTempC[73] = 218 ;
 atmPresKPa[74] = 2413   ; boilTempC[74] = 222 ;
 atmPresKPa[75] = 2586   ; boilTempC[75] = 226 ;
 atmPresKPa[76] = 2758   ; boilTempC[76] = 229 ;
 atmPresKPa[77] = 2930   ; boilTempC[77] = 233 ;
 atmPresKPa[78] = 3103   ; boilTempC[78] = 236 ;
 atmPresKPa[79] = 3275   ; boilTempC[79] = 239 ;
 atmPresKPa[80] = 3448   ; boilTempC[80] = 242 ;
 atmPresKPa[81] = 3620   ; boilTempC[81] = 245 ;
 atmPresKPa[82] = 3792   ; boilTempC[82] = 247 ;
 atmPresKPa[83] = 3965   ; boilTempC[83] = 250 ;
 atmPresKPa[84] = 4137   ; boilTempC[84] = 252 ;
 atmPresKPa[85] = 4309   ; boilTempC[85] = 255 ;
 atmPresKPa[86] = 4482   ; boilTempC[86] = 257 ;
 atmPresKPa[87] = 4654   ; boilTempC[87] = 260 ;
 atmPresKPa[88] = 4827   ; boilTempC[88] = 262 ;
 atmPresKPa[89] = 4999   ; boilTempC[89] = 264 ;
 atmPresKPa[90] = 5171   ; boilTempC[90] = 266 ;
 atmPresKPa[91] = 5344   ; boilTempC[91] = 268 ;
 atmPresKPa[92] = 5516   ; boilTempC[92] = 270 ;
 atmPresKPa[93] = 5688   ; boilTempC[93] = 272 ;
 atmPresKPa[94] = 5861   ; boilTempC[94] = 274 ;
 atmPresKPa[95] = 6033   ; boilTempC[95] = 276 ;
 atmPresKPa[96] = 6206   ; boilTempC[96] = 278 ;
 atmPresKPa[97] = 6550   ; boilTempC[97] = 281 ;
 atmPresKPa[98] = 6895   ; boilTempC[98] = 285 ;

    var steamTempK, steamTempC;  

    //steamTempC = interpolV(boilTempC, atmPresKPa, atmPresIn);
    steamTempC = interpol(atmPresKPa, boilTempC, atmPresIn);
    steamTempK = steamTempC + 273.0; 

    return steamTempK;  

   }; //end function waterPhase


//
//Input data on solvent phase in temp-press space
// - only boiling point significantly affected
//

//Input: Planetary atmospheric surface pressure in kPa
//     : Antoine coefficients for approximation to temperature-vapor pressure relation, A, B, C 
//Ouput: boiling point in K


   var solventPhase = function(atmPresIn, A, B, C){

      //var pTorr = atmPresIn / 0.133322; //kPa to torr 
      var pBar = 0.01 * atmPresIn; //kPa to bar 

      //var steamTempC = ( B / (A - logTen(pBar) ) ) - C;    
      var steamTempK = ( B / (A - logTen(pBar) ) ) - C;    

      //var steamTempK = steamTempC + 273.0;

      return steamTempK;  

   }; //end function solventPhase

// Copied over getPartFn2 from Dr Short's PartitionFn.java file lburns

   var getPartFn2 = function(species){

// Diatomic Partition fn values, QAB, from
//http://vizier.cfa.harvard.edu/viz-bin/VizieR?-source=J/A+A/588/A96
//See: Barklem, P. S.; Collet, R., 2016, Astronomy & Astrophysics, Volume 588, id.A96
//Just do linear piecewise interpolation in log of to hottest five values for now:
    var logPartFn = [];
    logPartFn.length = 5;
    
     //default initialization
     logPartFn[0] = 0.0;  //for T = 130 K
     logPartFn[1] = 0.0;  //for T = 500 K
     logPartFn[2] = 0.0;  //for T = 3000 K
     logPartFn[3] = 0.0;  //for T = 8000 K
     logPartFn[4] = 0.0;  //for T = 10000 K

if (species == "HI"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00000e+00);
    logPartFn[3] = Math.log(2.00001e+00);
    logPartFn[4] = Math.log(2.00015e+00);
       }

if (species == "HII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

//dummy
if (species == "HIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

//dummy
if (species == "HIV"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "HII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "DI"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00000e+00);
    logPartFn[3] = Math.log(2.00001e+00);
    logPartFn[4] = Math.log(2.00014e+00);
       }

if (species == "DII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

//dummy
if (species == "DIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

//dummy
if (species == "DIV"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "HeI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "HeII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00000e+00);
    logPartFn[3] = Math.log(2.00000e+00);
    logPartFn[4] = Math.log(2.00000e+00);
       }

if (species == "HeIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

//dummy
if (species == "HeIV"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "LiI"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00473e+00);
    logPartFn[3] = Math.log(2.70188e+00);
    logPartFn[4] = Math.log(3.86752e+00);
       }

if (species == "LiII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "LiIII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00000e+00);
    logPartFn[3] = Math.log(2.00000e+00);
    logPartFn[4] = Math.log(2.00000e+00);
       }

//dummy
if (species == "LiIV"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "BeI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00024e+00);
    logPartFn[3] = Math.log(1.17655e+00);
    logPartFn[4] = Math.log(1.41117e+00);
       }

if (species == "BeII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00000e+00);
    logPartFn[3] = Math.log(2.01924e+00);
    logPartFn[4] = Math.log(2.06070e+00);
       }

if (species == "BeIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "BI"){
    logPartFn[0] = Math.log(5.37746e+00);
    logPartFn[1] = Math.log(5.82788e+00);
    logPartFn[2] = Math.log(5.97080e+00);
    logPartFn[3] = Math.log(6.06978e+00);
    logPartFn[4] = Math.log(6.27955e+00);
       }

if (species == "BII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.01090e+00);
    logPartFn[4] = Math.log(1.04184e+00);
       }

if (species == "BIII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00000e+00);
    logPartFn[3] = Math.log(2.00100e+00);
    logPartFn[4] = Math.log(2.00569e+00);
       }

if (species == "CI"){
    logPartFn[0] = Math.log(6.59516e+00);
    logPartFn[1] = Math.log(8.27478e+00);
    logPartFn[2] = Math.log(8.91124e+00);
    logPartFn[3] = Math.log(9.78474e+00);
    logPartFn[4] = Math.log(1.02090e+01);
       }

if (species == "CII"){
    logPartFn[0] = Math.log(3.98273e+00);
    logPartFn[1] = Math.log(5.33283e+00);
    logPartFn[2] = Math.log(5.88018e+00);
    logPartFn[3] = Math.log(5.95988e+00);
    logPartFn[4] = Math.log(5.98845e+00);
       }

if (species == "CIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00073e+00);
    logPartFn[4] = Math.log(1.00478e+00);
       }

if (species == "NI"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.00100e+00);
    logPartFn[3] = Math.log(4.34860e+00);
    logPartFn[4] = Math.log(4.72409e+00);
       }

if (species == "NII"){
    logPartFn[0] = Math.log(3.92596e+00);
    logPartFn[1] = Math.log(7.03961e+00);
    logPartFn[2] = Math.log(8.63000e+00);
    logPartFn[3] = Math.log(9.17980e+00);
    logPartFn[4] = Math.log(9.45305e+00);
       }

if (species == "NIII"){
    logPartFn[0] = Math.log(2.58062e+00);
    logPartFn[1] = Math.log(4.42179e+00);
    logPartFn[2] = Math.log(5.67908e+00);
    logPartFn[3] = Math.log(5.87690e+00);
    logPartFn[4] = Math.log(5.90406e+00);
       }

if (species == "OI"){
    logPartFn[0] = Math.log(5.60172e+00);
    logPartFn[1] = Math.log(7.42310e+00);
    logPartFn[2] = Math.log(8.68009e+00);
    logPartFn[3] = Math.log(9.16637e+00);
    logPartFn[4] = Math.log(9.41864e+00);
       }

if (species == "OII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.00003e+00);
    logPartFn[3] = Math.log(4.08460e+00);
    logPartFn[4] = Math.log(4.22885e+00);
       }

if (species == "OIII"){
    logPartFn[0] = Math.log(2.02626e+00);
    logPartFn[1] = Math.log(5.23819e+00);
    logPartFn[2] = Math.log(8.15906e+00);
    logPartFn[3] = Math.log(8.80275e+00);
    logPartFn[4] = Math.log(9.00956e+00);
       }

if (species == "FI"){
    logPartFn[0] = Math.log(4.02285e+00);
    logPartFn[1] = Math.log(4.62529e+00);
    logPartFn[2] = Math.log(5.64768e+00);
    logPartFn[3] = Math.log(5.85982e+00);
    logPartFn[4] = Math.log(5.88706e+00);
       }

if (species == "FII"){
    logPartFn[0] = Math.log(5.07333e+00);
    logPartFn[1] = Math.log(6.36892e+00);
    logPartFn[2] = Math.log(8.33830e+00);
    logPartFn[3] = Math.log(8.85472e+00);
    logPartFn[4] = Math.log(9.03812e+00);
       }

if (species == "FIII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.00000e+00);
    logPartFn[3] = Math.log(4.02228e+00);
    logPartFn[4] = Math.log(4.07763e+00);
       }

if (species == "NeI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "NeII"){
    logPartFn[0] = Math.log(4.00036e+00);
    logPartFn[1] = Math.log(4.21176e+00);
    logPartFn[2] = Math.log(5.37562e+00);
    logPartFn[3] = Math.log(5.73812e+00);
    logPartFn[4] = Math.log(5.78760e+00);
       }

if (species == "NeIII"){
    logPartFn[0] = Math.log(5.00248e+00);
    logPartFn[1] = Math.log(5.54261e+00);
    logPartFn[2] = Math.log(7.84726e+00);
    logPartFn[3] = Math.log(8.56792e+00);
    logPartFn[4] = Math.log(8.73276e+00);
       }

if (species == "NaI"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00178e+00);
    logPartFn[3] = Math.log(3.40984e+00);
    logPartFn[4] = Math.log(7.08960e+00);
       }

if (species == "NaII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "NaIII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.03921e+00);
    logPartFn[2] = Math.log(5.03856e+00);
    logPartFn[3] = Math.log(5.56425e+00);
    logPartFn[4] = Math.log(5.64305e+00);
       }

if (species == "MgI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00025e+00);
    logPartFn[3] = Math.log(1.21285e+00);
    logPartFn[4] = Math.log(1.64434e+00);
       }

if (species == "MgII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00000e+00);
    logPartFn[3] = Math.log(2.00976e+00);
    logPartFn[4] = Math.log(2.03571e+00);
       }

if (species == "MgIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "AlI"){
    logPartFn[0] = Math.log(3.15743e+00);
    logPartFn[1] = Math.log(4.89757e+00);
    logPartFn[2] = Math.log(5.79075e+00);
    logPartFn[3] = Math.log(6.19328e+00);
    logPartFn[4] = Math.log(7.05012e+00);
       }

if (species == "AlII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.01064e+00);
    logPartFn[4] = Math.log(1.04138e+00);
       }

if (species == "AlIII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00000e+00);
    logPartFn[3] = Math.log(2.00037e+00);
    logPartFn[4] = Math.log(2.00260e+00);
       }

if (species == "SiI"){
    logPartFn[0] = Math.log(2.70106e+00);
    logPartFn[1] = Math.log(6.03405e+00);
    logPartFn[2] = Math.log(8.62816e+00);
    logPartFn[3] = Math.log(1.04988e+01);
    logPartFn[4] = Math.log(1.13575e+01);
       }

if (species == "SiII"){
    logPartFn[0] = Math.log(2.16657e+00);
    logPartFn[1] = Math.log(3.75040e+00);
    logPartFn[2] = Math.log(5.48529e+00);
    logPartFn[3] = Math.log(5.80440e+00);
    logPartFn[4] = Math.log(5.86668e+00);
       }

if (species == "SiIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00066e+00);
    logPartFn[4] = Math.log(1.00443e+00);
       }

if (species == "PI"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.04361e+00);
    logPartFn[3] = Math.log(5.50312e+00);
    logPartFn[4] = Math.log(6.38380e+00);
       }

if (species == "PII"){
    logPartFn[0] = Math.log(1.51156e+00);
    logPartFn[1] = Math.log(4.16319e+00);
    logPartFn[2] = Math.log(7.83534e+00);
    logPartFn[3] = Math.log(9.54223e+00);
    logPartFn[4] = Math.log(1.00500e+01);
       }

if (species == "PIII"){
    logPartFn[0] = Math.log(2.00822e+00);
    logPartFn[1] = Math.log(2.80054e+00);
    logPartFn[2] = Math.log(5.05924e+00);
    logPartFn[3] = Math.log(5.61779e+00);
    logPartFn[4] = Math.log(5.69424e+00);
       }

if (species == "SI"){
    logPartFn[0] = Math.log(5.03922e+00);
    logPartFn[1] = Math.log(6.15186e+00);
    logPartFn[2] = Math.log(8.30016e+00);
    logPartFn[3] = Math.log(9.66532e+00);
    logPartFn[4] = Math.log(1.01385e+01);
       }

if (species == "SII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.00804e+00);
    logPartFn[3] = Math.log(4.76202e+00);
    logPartFn[4] = Math.log(5.35265e+00);
       }

if (species == "SIII"){
    logPartFn[0] = Math.log(1.11055e+00);
    logPartFn[1] = Math.log(2.72523e+00);
    logPartFn[2] = Math.log(6.97489e+00);
    logPartFn[3] = Math.log(8.80785e+00);
    logPartFn[4] = Math.log(9.31110e+00);
       }

if (species == "ClI"){
    logPartFn[0] = Math.log(4.00011e+00);
    logPartFn[1] = Math.log(4.15794e+00);
    logPartFn[2] = Math.log(5.31000e+00);
    logPartFn[3] = Math.log(5.70664e+00);
    logPartFn[4] = Math.log(5.76344e+00);
       }

if (species == "ClII"){
    logPartFn[0] = Math.log(5.00137e+00);
    logPartFn[1] = Math.log(5.46184e+00);
    logPartFn[2] = Math.log(7.78751e+00);
    logPartFn[3] = Math.log(9.10464e+00);
    logPartFn[4] = Math.log(9.53390e+00);
       }

if (species == "ClIII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.00171e+00);
    logPartFn[3] = Math.log(4.41428e+00);
    logPartFn[4] = Math.log(4.82231e+00);
       }

if (species == "ArI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00007e+00);
       }

if (species == "ArII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.03252e+00);
    logPartFn[2] = Math.log(5.00667e+00);
    logPartFn[3] = Math.log(5.54606e+00);
    logPartFn[4] = Math.log(5.62775e+00);
       }

if (species == "ArIII"){
    logPartFn[0] = Math.log(5.00001e+00);
    logPartFn[1] = Math.log(5.13320e+00);
    logPartFn[2] = Math.log(7.23696e+00);
    logPartFn[3] = Math.log(8.61527e+00);
    logPartFn[4] = Math.log(9.02887e+00);
       }

if (species == "KI"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.01222e+00);
    logPartFn[3] = Math.log(4.77353e+00);
    logPartFn[4] = Math.log(9.82105e+00);
       }

if (species == "KII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "KIII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00394e+00);
    logPartFn[2] = Math.log(4.70805e+00);
    logPartFn[3] = Math.log(5.35493e+00);
    logPartFn[4] = Math.log(5.46467e+00);
       }

if (species == "CaI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00701e+00);
    logPartFn[3] = Math.log(2.60365e+00);
    logPartFn[4] = Math.log(5.69578e+00);
       }

if (species == "CaII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.01415e+00);
    logPartFn[3] = Math.log(2.91713e+00);
    logPartFn[4] = Math.log(3.56027e+00);
       }

if (species == "CaIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "ScI"){
    logPartFn[0] = Math.log(4.93134e+00);
    logPartFn[1] = Math.log(7.69658e+00);
    logPartFn[2] = Math.log(9.68986e+00);
    logPartFn[3] = Math.log(2.16410e+01);
    logPartFn[4] = Math.log(3.31527e+01);
       }

if (species == "ScII"){
    logPartFn[0] = Math.log(6.34225e+00);
    logPartFn[1] = Math.log(1.13155e+01);
    logPartFn[2] = Math.log(1.78090e+01);
    logPartFn[3] = Math.log(2.94840e+01);
    logPartFn[4] = Math.log(3.36439e+01);
       }

if (species == "ScIII"){
    logPartFn[0] = Math.log(4.67343e+00);
    logPartFn[1] = Math.log(7.39773e+00);
    logPartFn[2] = Math.log(9.45747e+00);
    logPartFn[3] = Math.log(9.81083e+00);
    logPartFn[4] = Math.log(9.88331e+00);
       }

if (species == "TiI"){
    logPartFn[0] = Math.log(6.18965e+00);
    logPartFn[1] = Math.log(1.22473e+01);
    logPartFn[2] = Math.log(2.08195e+01);
    logPartFn[3] = Math.log(5.53232e+01);
    logPartFn[4] = Math.log(8.32038e+01);
       }

if (species == "TiII"){
    logPartFn[0] = Math.log(6.90468e+00);
    logPartFn[1] = Math.log(1.72793e+01);
    logPartFn[2] = Math.log(4.40264e+01);
    logPartFn[3] = Math.log(7.23680e+01);
    logPartFn[4] = Math.log(8.37248e+01);
       }

if (species == "TiIII"){
    logPartFn[0] = Math.log(5.99049e+00);
    logPartFn[1] = Math.log(1.17969e+01);
    logPartFn[2] = Math.log(1.89121e+01);
    logPartFn[3] = Math.log(2.32253e+01);
    logPartFn[4] = Math.log(2.49249e+01);
       }

if (species == "VI"){
    logPartFn[0] = Math.log(5.55703e+00);
    logPartFn[1] = Math.log(1.32751e+01);
    logPartFn[2] = Math.log(3.47920e+01);
    logPartFn[3] = Math.log(7.90427e+01);
    logPartFn[4] = Math.log(1.11459e+02);
       }

if (species == "VII"){
    logPartFn[0] = Math.log(5.45407e+00);
    logPartFn[1] = Math.log(1.46216e+01);
    logPartFn[2] = Math.log(3.18263e+01);
    logPartFn[3] = Math.log(6.43796e+01);
    logPartFn[4] = Math.log(8.08903e+01);
       }

if (species == "VIII"){
    logPartFn[0] = Math.log(5.39755e+00);
    logPartFn[1] = Math.log(1.28067e+01);
    logPartFn[2] = Math.log(2.40588e+01);
    logPartFn[3] = Math.log(3.19510e+01);
    logPartFn[4] = Math.log(3.59622e+01);
       }

if (species == "CrI"){
    logPartFn[0] = Math.log(7.00000e+00);
    logPartFn[1] = Math.log(7.00000e+00);
    logPartFn[2] = Math.log(7.65435e+00);
    logPartFn[3] = Math.log(2.01376e+01);
    logPartFn[4] = Math.log(3.31787e+01);
       }

if (species == "CrII"){
    logPartFn[0] = Math.log(6.00000e+00);
    logPartFn[1] = Math.log(6.00000e+00);
    logPartFn[2] = Math.log(6.08747e+00);
    logPartFn[3] = Math.log(1.21840e+01);
    logPartFn[4] = Math.log(1.84825e+01);
       }

if (species == "CrIII"){
    logPartFn[0] = Math.log(3.31635e+00);
    logPartFn[1] = Math.log(1.06851e+01);
    logPartFn[2] = Math.log(2.12330e+01);
    logPartFn[3] = Math.log(2.71108e+01);
    logPartFn[4] = Math.log(3.11257e+01);
       }

if (species == "MnI"){
    logPartFn[0] = Math.log(6.00000e+00);
    logPartFn[1] = Math.log(6.00000e+00);
    logPartFn[2] = Math.log(6.01140e+00);
    logPartFn[3] = Math.log(9.82265e+00);
    logPartFn[4] = Math.log(1.53539e+01);
       }

if (species == "MnII"){
    logPartFn[0] = Math.log(7.00000e+00);
    logPartFn[1] = Math.log(7.00000e+00);
    logPartFn[2] = Math.log(7.07640e+00);
    logPartFn[3] = Math.log(1.07144e+01);
    logPartFn[4] = Math.log(1.45638e+01);
       }

if (species == "MnIII"){
    logPartFn[0] = Math.log(6.00000e+00);
    logPartFn[1] = Math.log(6.00000e+00);
    logPartFn[2] = Math.log(6.00011e+00);
    logPartFn[3] = Math.log(6.46711e+00);
    logPartFn[4] = Math.log(7.39061e+00);
       }

if (species == "FeI"){
    logPartFn[0] = Math.log(9.07242e+00);
    logPartFn[1] = Math.log(1.20678e+01);
    logPartFn[2] = Math.log(2.19554e+01);
    logPartFn[3] = Math.log(4.28266e+01);
    logPartFn[4] = Math.log(5.96627e+01);
       }

if (species == "FeII"){
    logPartFn[0] = Math.log(1.01172e+01);
    logPartFn[1] = Math.log(1.40327e+01);
    logPartFn[2] = Math.log(3.43147e+01);
    logPartFn[3] = Math.log(5.64784e+01);
    logPartFn[4] = Math.log(6.69023e+01);
       }

if (species == "FeIII"){
    logPartFn[0] = Math.log(9.05759e+00);
    logPartFn[1] = Math.log(1.18492e+01);
    logPartFn[2] = Math.log(2.07199e+01);
    logPartFn[3] = Math.log(2.52719e+01);
    logPartFn[4] = Math.log(2.81882e+01);
       }

if (species == "CoI"){
    logPartFn[0] = Math.log(1.00010e+01);
    logPartFn[1] = Math.log(1.08918e+01);
    logPartFn[2] = Math.log(2.44719e+01);
    logPartFn[3] = Math.log(4.80929e+01);
    logPartFn[4] = Math.log(6.08394e+01);
       }

if (species == "CoII"){
    logPartFn[0] = Math.log(9.00019e+00);
    logPartFn[1] = Math.log(9.50563e+00);
    logPartFn[2] = Math.log(2.09531e+01);
    logPartFn[3] = Math.log(4.21891e+01);
    logPartFn[4] = Math.log(5.04464e+01);
       }

if (species == "CoIII"){
    logPartFn[0] = Math.log(1.00007e+01);
    logPartFn[1] = Math.log(1.08219e+01);
    logPartFn[2] = Math.log(1.99830e+01);
    logPartFn[3] = Math.log(2.65869e+01);
    logPartFn[4] = Math.log(2.93889e+01);
       }

if (species == "NiI"){
    logPartFn[0] = Math.log(9.72623e+00);
    logPartFn[1] = Math.log(1.34631e+01);
    logPartFn[2] = Math.log(2.63546e+01);
    logPartFn[3] = Math.log(3.63831e+01);
    logPartFn[4] = Math.log(4.15802e+01);
       }

if (species == "NiII"){
    logPartFn[0] = Math.log(6.00000e+00);
    logPartFn[1] = Math.log(6.05237e+00);
    logPartFn[2] = Math.log(8.29948e+00);
    logPartFn[3] = Math.log(1.57985e+01);
    logPartFn[4] = Math.log(1.94018e+01);
       }

if (species == "NiIII"){
    logPartFn[0] = Math.log(9.00000e+00);
    logPartFn[1] = Math.log(9.14687e+00);
    logPartFn[2] = Math.log(1.43380e+01);
    logPartFn[3] = Math.log(1.87862e+01);
    logPartFn[4] = Math.log(2.01688e+01);
       }

if (species == "CuI"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.03485e+00);
    logPartFn[3] = Math.log(3.25011e+00);
    logPartFn[4] = Math.log(4.17708e+00);
       }

if (species == "CuII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00032e+00);
    logPartFn[3] = Math.log(1.30264e+00);
    logPartFn[4] = Math.log(1.69815e+00);
       }

if (species == "CuIII"){
    logPartFn[0] = Math.log(6.00000e+00);
    logPartFn[1] = Math.log(6.01031e+00);
    logPartFn[2] = Math.log(7.48119e+00);
    logPartFn[3] = Math.log(8.75641e+00);
    logPartFn[4] = Math.log(8.97397e+00);
       }

if (species == "ZnI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.02806e+00);
    logPartFn[4] = Math.log(1.11187e+00);
       }

if (species == "ZnII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00000e+00);
    logPartFn[3] = Math.log(2.00099e+00);
    logPartFn[4] = Math.log(2.00625e+00);
       }

if (species == "ZnIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00001e+00);
    logPartFn[4] = Math.log(1.00021e+00);
       }

if (species == "GaI"){
    logPartFn[0] = Math.log(2.00043e+00);
    logPartFn[1] = Math.log(2.37127e+00);
    logPartFn[2] = Math.log(4.69154e+00);
    logPartFn[3] = Math.log(5.64961e+00);
    logPartFn[4] = Math.log(6.47300e+00);
       }

if (species == "GaII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00154e+00);
    logPartFn[4] = Math.log(1.00881e+00);
       }

if (species == "GaIII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00000e+00);
    logPartFn[3] = Math.log(2.00004e+00);
    logPartFn[4] = Math.log(2.00043e+00);
       }

if (species == "GeI"){
    logPartFn[0] = Math.log(1.00630e+00);
    logPartFn[1] = Math.log(1.69040e+00);
    logPartFn[2] = Math.log(6.00402e+00);
    logPartFn[3] = Math.log(9.09691e+00);
    logPartFn[4] = Math.log(1.01931e+01);
       }

if (species == "GeII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.02475e+00);
    logPartFn[2] = Math.log(3.71392e+00);
    logPartFn[3] = Math.log(4.91199e+00);
    logPartFn[4] = Math.log(5.10944e+00);
       }

if (species == "GeIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00010e+00);
    logPartFn[4] = Math.log(1.00101e+00);
       }

if (species == "AsI"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.05774e+00);
    logPartFn[3] = Math.log(5.65799e+00);
    logPartFn[4] = Math.log(6.57374e+00);
       }

if (species == "AsII"){
    logPartFn[0] = Math.log(1.00002e+00);
    logPartFn[1] = Math.log(1.14402e+00);
    logPartFn[2] = Math.log(4.31914e+00);
    logPartFn[3] = Math.log(7.47497e+00);
    logPartFn[4] = Math.log(8.25460e+00);
       }

if (species == "AsIII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00085e+00);
    logPartFn[2] = Math.log(2.97673e+00);
    logPartFn[3] = Math.log(4.35751e+00);
    logPartFn[4] = Math.log(4.62049e+00);
       }

if (species == "SeI"){
    logPartFn[0] = Math.log(5.00000e+00);
    logPartFn[1] = Math.log(5.01048e+00);
    logPartFn[2] = Math.log(6.50285e+00);
    logPartFn[3] = Math.log(8.64654e+00);
    logPartFn[4] = Math.log(9.28469e+00);
       }

if (species == "SeII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.01539e+00);
    logPartFn[3] = Math.log(4.96394e+00);
    logPartFn[4] = Math.log(5.62894e+00);
       }

if (species == "SeIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.02009e+00);
    logPartFn[2] = Math.log(3.06837e+00);
    logPartFn[3] = Math.log(6.14277e+00);
    logPartFn[4] = Math.log(6.95690e+00);
       }

if (species == "BrI"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00005e+00);
    logPartFn[2] = Math.log(4.34162e+00);
    logPartFn[3] = Math.log(5.03126e+00);
    logPartFn[4] = Math.log(5.18274e+00);
       }

if (species == "BrII"){
    logPartFn[0] = Math.log(5.00000e+00);
    logPartFn[1] = Math.log(5.00038e+00);
    logPartFn[2] = Math.log(5.84067e+00);
    logPartFn[3] = Math.log(7.78362e+00);
    logPartFn[4] = Math.log(8.38287e+00);
       }

if (species == "BrIII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.00537e+00);
    logPartFn[3] = Math.log(4.62671e+00);
    logPartFn[4] = Math.log(5.14171e+00);
       }

if (species == "KrI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00001e+00);
    logPartFn[4] = Math.log(1.00044e+00);
       }

if (species == "KrII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.15228e+00);
    logPartFn[3] = Math.log(4.76145e+00);
    logPartFn[4] = Math.log(4.92367e+00);
       }

if (species == "KrIII"){
    logPartFn[0] = Math.log(5.00000e+00);
    logPartFn[1] = Math.log(5.00001e+00);
    logPartFn[2] = Math.log(5.42146e+00);
    logPartFn[3] = Math.log(7.07047e+00);
    logPartFn[4] = Math.log(7.64176e+00);
       }

if (species == "RbI"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.01473e+00);
    logPartFn[3] = Math.log(5.41664e+00);
    logPartFn[4] = Math.log(1.13631e+01);
       }

if (species == "RbII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "RbIII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.05824e+00);
    logPartFn[3] = Math.log(4.53101e+00);
    logPartFn[4] = Math.log(4.69229e+00);
       }

if (species == "SrI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.01064e+00);
    logPartFn[3] = Math.log(2.98824e+00);
    logPartFn[4] = Math.log(6.20304e+00);
       }

if (species == "SrII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00865e+00);
    logPartFn[3] = Math.log(2.78698e+00);
    logPartFn[4] = Math.log(3.40185e+00);
       }

if (species == "SrIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "YI"){
    logPartFn[0] = Math.log(4.01695e+00);
    logPartFn[1] = Math.log(5.30447e+00);
    logPartFn[2] = Math.log(8.85992e+00);
    logPartFn[3] = Math.log(2.22176e+01);
    logPartFn[4] = Math.log(3.32369e+01);
       }

if (species == "YII"){
    logPartFn[0] = Math.log(1.00032e+00);
    logPartFn[1] = Math.log(1.62308e+00);
    logPartFn[2] = Math.log(1.09488e+01);
    logPartFn[3] = Math.log(2.25715e+01);
    logPartFn[4] = Math.log(2.70276e+01);
       }

if (species == "YIII"){
    logPartFn[0] = Math.log(4.00199e+00);
    logPartFn[1] = Math.log(4.74694e+00);
    logPartFn[2] = Math.log(8.29546e+00);
    logPartFn[3] = Math.log(9.79259e+00);
    logPartFn[4] = Math.log(1.01030e+01);
       }

if (species == "ZrI"){
    logPartFn[0] = Math.log(5.01271e+00);
    logPartFn[1] = Math.log(6.60966e+00);
    logPartFn[2] = Math.log(1.99689e+01);
    logPartFn[3] = Math.log(6.46409e+01);
    logPartFn[4] = Math.log(9.29133e+01);
       }

if (species == "ZrII"){
    logPartFn[0] = Math.log(4.18616e+00);
    logPartFn[1] = Math.log(7.54284e+00);
    logPartFn[2] = Math.log(2.91432e+01);
    logPartFn[3] = Math.log(6.73523e+01);
    logPartFn[4] = Math.log(8.12269e+01);
       }

if (species == "ZrIII"){
    logPartFn[0] = Math.log(5.00371e+00);
    logPartFn[1] = Math.log(6.10992e+00);
    logPartFn[2] = Math.log(1.49741e+01);
    logPartFn[3] = Math.log(2.35798e+01);
    logPartFn[4] = Math.log(2.64105e+01);
       }

if (species == "NbI"){
    logPartFn[0] = Math.log(2.80828e+00);
    logPartFn[1] = Math.log(8.30968e+00);
    logPartFn[2] = Math.log(3.50009e+01);
    logPartFn[3] = Math.log(9.41753e+01);
    logPartFn[4] = Math.log(1.32663e+02);
       }

if (species == "NbII"){
    logPartFn[0] = Math.log(1.55657e+00);
    logPartFn[1] = Math.log(5.28597e+00);
    logPartFn[2] = Math.log(2.62767e+01);
    logPartFn[3] = Math.log(7.22928e+01);
    logPartFn[4] = Math.log(9.34755e+01);
       }

if (species == "NbIII"){
    logPartFn[0] = Math.log(4.01990e+00);
    logPartFn[1] = Math.log(5.66842e+00);
    logPartFn[2] = Math.log(1.76187e+01);
    logPartFn[3] = Math.log(3.32180e+01);
    logPartFn[4] = Math.log(3.96549e+01);
       }

if (species == "MoI"){
    logPartFn[0] = Math.log(7.00000e+00);
    logPartFn[1] = Math.log(7.00000e+00);
    logPartFn[2] = Math.log(7.13826e+00);
    logPartFn[3] = Math.log(1.94435e+01);
    logPartFn[4] = Math.log(3.41087e+01);
       }

if (species == "MoII"){
    logPartFn[0] = Math.log(6.00000e+00);
    logPartFn[1] = Math.log(6.00000e+00);
    logPartFn[2] = Math.log(6.10323e+00);
    logPartFn[3] = Math.log(1.57858e+01);
    logPartFn[4] = Math.log(2.53531e+01);
       }

if (species == "MoIII"){
    logPartFn[0] = Math.log(1.20909e+00);
    logPartFn[1] = Math.log(3.47425e+00);
    logPartFn[2] = Math.log(1.49713e+01);
    logPartFn[3] = Math.log(2.84296e+01);
    logPartFn[4] = Math.log(3.53071e+01);
       }

if (species == "TcI"){
    logPartFn[0] = Math.log(6.00000e+00);
    logPartFn[1] = Math.log(6.00698e+00);
    logPartFn[2] = Math.log(1.26513e+01);
    logPartFn[3] = Math.log(4.01671e+01);
    logPartFn[4] = Math.log(5.99532e+01);
       }

if (species == "TcII"){
    logPartFn[0] = Math.log(7.00000e+00);
    logPartFn[1] = Math.log(7.00047e+00);
    logPartFn[2] = Math.log(1.05476e+01);
    logPartFn[3] = Math.log(2.00471e+01);
    logPartFn[4] = Math.log(2.31663e+01);
       }

if (species == "TcIII"){
    logPartFn[0] = Math.log(6.00000e+00);
    logPartFn[1] = Math.log(6.00000e+00);
    logPartFn[2] = Math.log(6.00000e+00);
    logPartFn[3] = Math.log(6.00000e+00);
    logPartFn[4] = Math.log(6.00000e+00);
       }

if (species == "RuI"){
    logPartFn[0] = Math.log(1.10000e+01);
    logPartFn[1] = Math.log(1.13122e+01);
    logPartFn[2] = Math.log(2.23319e+01);
    logPartFn[3] = Math.log(5.81063e+01);
    logPartFn[4] = Math.log(7.89315e+01);
       }

if (species == "RuII"){
    logPartFn[0] = Math.log(1.00000e+01);
    logPartFn[1] = Math.log(1.01050e+01);
    logPartFn[2] = Math.log(1.71302e+01);
    logPartFn[3] = Math.log(3.64331e+01);
    logPartFn[4] = Math.log(4.65540e+01);
       }

if (species == "RuIII"){
    logPartFn[0] = Math.log(9.00002e+00);
    logPartFn[1] = Math.log(9.28086e+00);
    logPartFn[2] = Math.log(1.64154e+01);
    logPartFn[3] = Math.log(2.09762e+01);
    logPartFn[4] = Math.log(2.17901e+01);
       }

if (species == "RhI"){
    logPartFn[0] = Math.log(1.00000e+01);
    logPartFn[1] = Math.log(1.01020e+01);
    logPartFn[2] = Math.log(1.86621e+01);
    logPartFn[3] = Math.log(3.88108e+01);
    logPartFn[4] = Math.log(4.81045e+01);
       }

if (species == "RhII"){
    logPartFn[0] = Math.log(9.00000e+00);
    logPartFn[1] = Math.log(9.00716e+00);
    logPartFn[2] = Math.log(1.22675e+01);
    logPartFn[3] = Math.log(2.08582e+01);
    logPartFn[4] = Math.log(2.51822e+01);
       }

if (species == "RhIII"){
    logPartFn[0] = Math.log(1.00000e+01);
    logPartFn[1] = Math.log(1.00168e+01);
    logPartFn[2] = Math.log(1.45746e+01);
    logPartFn[3] = Math.log(2.50952e+01);
    logPartFn[4] = Math.log(2.95669e+01);
       }

if (species == "PdI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.46384e+00);
    logPartFn[3] = Math.log(5.77132e+00);
    logPartFn[4] = Math.log(7.96499e+00);
       }

if (species == "PdII"){
    logPartFn[0] = Math.log(6.00000e+00);
    logPartFn[1] = Math.log(6.00015e+00);
    logPartFn[2] = Math.log(6.73288e+00);
    logPartFn[3] = Math.log(8.40680e+00);
    logPartFn[4] = Math.log(9.23953e+00);
       }

if (species == "PdIII"){
    logPartFn[0] = Math.log(9.00000e+00);
    logPartFn[1] = Math.log(9.00065e+00);
    logPartFn[2] = Math.log(1.10655e+01);
    logPartFn[3] = Math.log(1.69387e+01);
    logPartFn[4] = Math.log(1.89830e+01);
       }

if (species == "AgI"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00001e+00);
    logPartFn[3] = Math.log(2.07520e+00);
    logPartFn[4] = Math.log(2.29282e+00);
       }

if (species == "AgII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.01183e+00);
    logPartFn[4] = Math.log(1.05173e+00);
       }

if (species == "AgIII"){
    logPartFn[0] = Math.log(6.00000e+00);
    logPartFn[1] = Math.log(6.00001e+00);
    logPartFn[2] = Math.log(6.43868e+00);
    logPartFn[3] = Math.log(7.74647e+00);
    logPartFn[4] = Math.log(8.06409e+00);
       }

if (species == "CdI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.03706e+00);
    logPartFn[4] = Math.log(1.13787e+00);
       }

if (species == "CdII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00000e+00);
    logPartFn[3] = Math.log(2.00166e+00);
    logPartFn[4] = Math.log(2.00881e+00);
       }

if (species == "CdIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00001e+00);
    logPartFn[4] = Math.log(1.00013e+00);
       }

if (species == "InI"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00688e+00);
    logPartFn[2] = Math.log(3.38443e+00);
    logPartFn[3] = Math.log(4.93682e+00);
    logPartFn[4] = Math.log(5.96634e+00);
       }

if (species == "InII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00309e+00);
    logPartFn[4] = Math.log(1.01538e+00);
       }

if (species == "InIII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00000e+00);
    logPartFn[3] = Math.log(2.00013e+00);
    logPartFn[4] = Math.log(2.00111e+00);
       }

if (species == "SnI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.02333e+00);
    logPartFn[2] = Math.log(3.37985e+00);
    logPartFn[3] = Math.log(7.09384e+00);
    logPartFn[4] = Math.log(8.36474e+00);
       }

if (species == "SnII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00002e+00);
    logPartFn[2] = Math.log(2.52079e+00);
    logPartFn[3] = Math.log(3.86439e+00);
    logPartFn[4] = Math.log(4.18355e+00);
       }

if (species == "SnIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00033e+00);
    logPartFn[4] = Math.log(1.00255e+00);
       }

if (species == "SbI"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.12205e+00);
    logPartFn[3] = Math.log(6.14860e+00);
    logPartFn[4] = Math.log(7.20611e+00);
       }

if (species == "SbII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00046e+00);
    logPartFn[2] = Math.log(2.03582e+00);
    logPartFn[3] = Math.log(5.05509e+00);
    logPartFn[4] = Math.log(5.97984e+00);
       }

if (species == "SbIII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.17082e+00);
    logPartFn[3] = Math.log(3.22630e+00);
    logPartFn[4] = Math.log(3.55562e+00);
       }

if (species == "TeI"){
    logPartFn[0] = Math.log(5.00000e+00);
    logPartFn[1] = Math.log(5.00000e+00);
    logPartFn[2] = Math.log(5.44375e+00);
    logPartFn[3] = Math.log(7.47891e+00);
    logPartFn[4] = Math.log(8.22338e+00);
       }

if (species == "TeII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.04540e+00);
    logPartFn[3] = Math.log(5.38198e+00);
    logPartFn[4] = Math.log(6.15477e+00);
       }

if (species == "TeIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.40826e+00);
    logPartFn[3] = Math.log(3.64876e+00);
    logPartFn[4] = Math.log(4.47090e+00);
       }

if (species == "II"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.05220e+00);
    logPartFn[3] = Math.log(4.51156e+00);
    logPartFn[4] = Math.log(4.69382e+00);
       }

if (species == "III"){
    logPartFn[0] = Math.log(5.00000e+00);
    logPartFn[1] = Math.log(5.00000e+00);
    logPartFn[2] = Math.log(5.15261e+00);
    logPartFn[3] = Math.log(6.58097e+00);
    logPartFn[4] = Math.log(7.18642e+00);
       }

if (species == "IIII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.01931e+00);
    logPartFn[3] = Math.log(4.94321e+00);
    logPartFn[4] = Math.log(5.56234e+00);
       }

if (species == "XeI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00015e+00);
    logPartFn[4] = Math.log(1.00319e+00);
       }

if (species == "XeII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.01278e+00);
    logPartFn[3] = Math.log(4.30069e+00);
    logPartFn[4] = Math.log(4.43930e+00);
       }

if (species == "XeIII"){
    logPartFn[0] = Math.log(5.00000e+00);
    logPartFn[1] = Math.log(5.00000e+00);
    logPartFn[2] = Math.log(5.04902e+00);
    logPartFn[3] = Math.log(5.97976e+00);
    logPartFn[4] = Math.log(6.47644e+00);
       }

if (species == "CsI"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.03442e+00);
    logPartFn[3] = Math.log(7.88683e+00);
    logPartFn[4] = Math.log(1.69354e+01);
       }

if (species == "CsII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00001e+00);
       }

if (species == "CsIII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.00261e+00);
    logPartFn[3] = Math.log(4.16580e+00);
    logPartFn[4] = Math.log(4.27282e+00);
       }

if (species == "BaI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.21060e+00);
    logPartFn[3] = Math.log(8.29000e+00);
    logPartFn[4] = Math.log(1.66116e+01);
       }

if (species == "BaII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.78137e+00);
    logPartFn[3] = Math.log(5.96568e+00);
    logPartFn[4] = Math.log(6.97202e+00);
       }

if (species == "BaIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "LaI"){
    logPartFn[0] = Math.log(4.00005e+00);
    logPartFn[1] = Math.log(4.29315e+00);
    logPartFn[2] = Math.log(1.42312e+01);
    logPartFn[3] = Math.log(5.77343e+01);
    logPartFn[4] = Math.log(8.81122e+01);
       }

if (species == "LaII"){
    logPartFn[0] = Math.log(5.00009e+00);
    logPartFn[1] = Math.log(5.51405e+00);
    logPartFn[2] = Math.log(2.03638e+01);
    logPartFn[3] = Math.log(4.28241e+01);
    logPartFn[4] = Math.log(5.27740e+01);
       }

if (species == "LaIII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.05954e+00);
    logPartFn[2] = Math.log(7.09841e+00);
    logPartFn[3] = Math.log(1.19933e+01);
    logPartFn[4] = Math.log(1.34792e+01);
       }

if (species == "CeI"){
    logPartFn[0] = Math.log(9.39731e+00);
    logPartFn[1] = Math.log(1.20470e+01);
    logPartFn[2] = Math.log(7.59152e+01);
    logPartFn[3] = Math.log(4.66858e+02);
    logPartFn[4] = Math.log(7.08652e+02);
       }

if (species == "CeII"){
    logPartFn[0] = Math.log(8.00018e+00);
    logPartFn[1] = Math.log(8.83511e+00);
    logPartFn[2] = Math.log(8.20718e+01);
    logPartFn[3] = Math.log(3.70729e+02);
    logPartFn[4] = Math.log(4.91152e+02);
       }

if (species == "CeIII"){
    logPartFn[0] = Math.log(9.00000e+00);
    logPartFn[1] = Math.log(9.13795e+00);
    logPartFn[2] = Math.log(2.59288e+01);
    logPartFn[3] = Math.log(7.43305e+01);
    logPartFn[4] = Math.log(9.01542e+01);
       }

if (species == "PrI"){
    logPartFn[0] = Math.log(1.00000e+01);
    logPartFn[1] = Math.log(1.02326e+01);
    logPartFn[2] = Math.log(3.50798e+01);
    logPartFn[3] = Math.log(3.18645e+02);
    logPartFn[4] = Math.log(5.02583e+02);
       }

if (species == "PrII"){
    logPartFn[0] = Math.log(9.08268e+00);
    logPartFn[1] = Math.log(1.22739e+01);
    logPartFn[2] = Math.log(5.41964e+01);
    logPartFn[3] = Math.log(2.74460e+02);
    logPartFn[4] = Math.log(3.80580e+02);
       }

if (species == "PrIII"){
    logPartFn[0] = Math.log(1.00000e+01);
    logPartFn[1] = Math.log(1.02182e+01);
    logPartFn[2] = Math.log(2.19864e+01);
    logPartFn[3] = Math.log(6.64136e+01);
    logPartFn[4] = Math.log(9.66706e+01);
       }

if (species == "NdI"){
    logPartFn[0] = Math.log(9.00004e+00);
    logPartFn[1] = Math.log(9.44310e+00);
    logPartFn[2] = Math.log(2.95270e+01);
    logPartFn[3] = Math.log(3.13305e+02);
    logPartFn[4] = Math.log(5.42293e+02);
       }

if (species == "NdII"){
    logPartFn[0] = Math.log(8.03412e+00);
    logPartFn[1] = Math.log(1.05550e+01);
    logPartFn[2] = Math.log(4.95287e+01);
    logPartFn[3] = Math.log(3.20614e+02);
    logPartFn[4] = Math.log(5.04711e+02);
       }

if (species == "NdIII"){
    logPartFn[0] = Math.log(9.00004e+00);
    logPartFn[1] = Math.log(9.43038e+00);
    logPartFn[2] = Math.log(2.35346e+01);
    logPartFn[3] = Math.log(4.66105e+01);
    logPartFn[4] = Math.log(5.66490e+01);
       }

if (species == "PmI"){
    logPartFn[0] = Math.log(6.00110e+00);
    logPartFn[1] = Math.log(6.86120e+00);
    logPartFn[2] = Math.log(2.40772e+01);
    logPartFn[3] = Math.log(7.47623e+01);
    logPartFn[4] = Math.log(1.13054e+02);
       }

if (species == "PmII"){
    logPartFn[0] = Math.log(5.05009e+00);
    logPartFn[1] = Math.log(7.39584e+00);
    logPartFn[2] = Math.log(4.17360e+01);
    logPartFn[3] = Math.log(1.35782e+02);
    logPartFn[4] = Math.log(1.78314e+02);
       }

if (species == "PmIII"){
    logPartFn[0] = Math.log(6.00000e+00);
    logPartFn[1] = Math.log(6.00000e+00);
    logPartFn[2] = Math.log(6.00000e+00);
    logPartFn[3] = Math.log(6.00000e+00);
    logPartFn[4] = Math.log(6.00000e+00);
       }

if (species == "SmI"){
    logPartFn[0] = Math.log(1.11838e+00);
    logPartFn[1] = Math.log(2.88715e+00);
    logPartFn[2] = Math.log(1.84133e+01);
    logPartFn[3] = Math.log(1.09023e+02);
    logPartFn[4] = Math.log(1.89582e+02);
       }

if (species == "SmII"){
    logPartFn[0] = Math.log(2.10827e+00);
    logPartFn[1] = Math.log(4.26988e+00);
    logPartFn[2] = Math.log(3.12536e+01);
    logPartFn[3] = Math.log(1.19821e+02);
    logPartFn[4] = Math.log(1.75950e+02);
       }

if (species == "SmIII"){
    logPartFn[0] = Math.log(1.11724e+00);
    logPartFn[1] = Math.log(2.88059e+00);
    logPartFn[2] = Math.log(1.77904e+01);
    logPartFn[3] = Math.log(3.49109e+01);
    logPartFn[4] = Math.log(4.10217e+01);
       }

if (species == "EuI"){
    logPartFn[0] = Math.log(8.00000e+00);
    logPartFn[1] = Math.log(8.00000e+00);
    logPartFn[2] = Math.log(8.15223e+00);
    logPartFn[3] = Math.log(2.69921e+01);
    logPartFn[4] = Math.log(5.13327e+01);
       }

if (species == "EuII"){
    logPartFn[0] = Math.log(9.00000e+00);
    logPartFn[1] = Math.log(9.05745e+00);
    logPartFn[2] = Math.log(1.24460e+01);
    logPartFn[3] = Math.log(2.38118e+01);
    logPartFn[4] = Math.log(3.15054e+01);
       }

if (species == "EuIII"){
    logPartFn[0] = Math.log(8.00000e+00);
    logPartFn[1] = Math.log(8.00000e+00);
    logPartFn[2] = Math.log(8.00004e+00);
    logPartFn[3] = Math.log(8.65078e+00);
    logPartFn[4] = Math.log(1.03670e+01);
       }

if (species == "GdI"){
    logPartFn[0] = Math.log(5.67234e+00);
    logPartFn[1] = Math.log(1.14248e+01);
    logPartFn[2] = Math.log(3.48245e+01);
    logPartFn[3] = Math.log(1.36394e+02);
    logPartFn[4] = Math.log(2.17943e+02);
       }

if (species == "GdII"){
    logPartFn[0] = Math.log(6.45033e+00);
    logPartFn[1] = Math.log(1.18671e+01);
    logPartFn[2] = Math.log(4.85326e+01);
    logPartFn[3] = Math.log(1.46650e+02);
    logPartFn[4] = Math.log(1.95931e+02);
       }

if (species == "GdIII"){
    logPartFn[0] = Math.log(5.32234e+00);
    logPartFn[1] = Math.log(9.64026e+00);
    logPartFn[2] = Math.log(3.56490e+01);
    logPartFn[3] = Math.log(6.82437e+01);
    logPartFn[4] = Math.log(7.69994e+01);
       }

if (species == "TbI"){
    logPartFn[0] = Math.log(1.67331e+01);
    logPartFn[1] = Math.log(2.93841e+01);
    logPartFn[2] = Math.log(8.97544e+01);
    logPartFn[3] = Math.log(3.47204e+02);
    logPartFn[4] = Math.log(5.12797e+02);
       }

if (species == "TbII"){
    logPartFn[0] = Math.log(1.70002e+01);
    logPartFn[1] = Math.log(1.78116e+01);
    logPartFn[2] = Math.log(5.25407e+01);
    logPartFn[3] = Math.log(1.68157e+02);
    logPartFn[4] = Math.log(2.17753e+02);
       }

if (species == "TbIII"){
    logPartFn[0] = Math.log(1.60000e+01);
    logPartFn[1] = Math.log(1.60044e+01);
    logPartFn[2] = Math.log(2.36107e+01);
    logPartFn[3] = Math.log(7.90783e+01);
    logPartFn[4] = Math.log(1.08698e+02);
       }

if (species == "DyI"){
    logPartFn[0] = Math.log(1.70000e+01);
    logPartFn[1] = Math.log(1.70001e+01);
    logPartFn[2] = Math.log(2.11524e+01);
    logPartFn[3] = Math.log(1.37365e+02);
    logPartFn[4] = Math.log(2.61442e+02);
       }

if (species == "DyII"){
    logPartFn[0] = Math.log(1.80017e+01);
    logPartFn[1] = Math.log(1.94761e+01);
    logPartFn[2] = Math.log(3.37600e+01);
    logPartFn[3] = Math.log(1.26585e+02);
    logPartFn[4] = Math.log(2.08424e+02);
       }

if (species == "DyIII"){
    logPartFn[0] = Math.log(1.70000e+01);
    logPartFn[1] = Math.log(1.70000e+01);
    logPartFn[2] = Math.log(1.70000e+01);
    logPartFn[3] = Math.log(1.70000e+01);
    logPartFn[4] = Math.log(1.70000e+01);
       }

if (species == "HoI"){
    logPartFn[0] = Math.log(1.60000e+01);
    logPartFn[1] = Math.log(1.60000e+01);
    logPartFn[2] = Math.log(1.87758e+01);
    logPartFn[3] = Math.log(9.97150e+01);
    logPartFn[4] = Math.log(1.71521e+02);
       }

if (species == "HoII"){
    logPartFn[0] = Math.log(1.70130e+01);
    logPartFn[1] = Math.log(1.93968e+01);
    logPartFn[2] = Math.log(3.03102e+01);
    logPartFn[3] = Math.log(5.61173e+01);
    logPartFn[4] = Math.log(7.13807e+01);
       }

if (species == "HoIII"){
    logPartFn[0] = Math.log(1.60000e+01);
    logPartFn[1] = Math.log(1.60000e+01);
    logPartFn[2] = Math.log(1.73144e+01);
    logPartFn[3] = Math.log(3.55564e+01);
    logPartFn[4] = Math.log(5.14625e+01);
       }

if (species == "ErI"){
    logPartFn[0] = Math.log(1.30000e+01);
    logPartFn[1] = Math.log(1.30000e+01);
    logPartFn[2] = Math.log(1.62213e+01);
    logPartFn[3] = Math.log(1.03737e+02);
    logPartFn[4] = Math.log(1.94418e+02);
       }

if (species == "ErII"){
    logPartFn[0] = Math.log(1.40917e+01);
    logPartFn[1] = Math.log(1.73794e+01);
    logPartFn[2] = Math.log(2.71056e+01);
    logPartFn[3] = Math.log(9.05747e+01);
    logPartFn[4] = Math.log(1.40942e+02);
       }

if (species == "ErIII"){
    logPartFn[0] = Math.log(1.30000e+01);
    logPartFn[1] = Math.log(1.30000e+01);
    logPartFn[2] = Math.log(1.52920e+01);
    logPartFn[3] = Math.log(3.23775e+01);
    logPartFn[4] = Math.log(4.33307e+01);
       }

if (species == "TmI"){
    logPartFn[0] = Math.log(8.00000e+00);
    logPartFn[1] = Math.log(8.00000e+00);
    logPartFn[2] = Math.log(8.16070e+00);
    logPartFn[3] = Math.log(2.89498e+01);
    logPartFn[4] = Math.log(5.79555e+01);
       }

if (species == "TmII"){
    logPartFn[0] = Math.log(9.50853e+00);
    logPartFn[1] = Math.log(1.25401e+01);
    logPartFn[2] = Math.log(1.54699e+01);
    logPartFn[3] = Math.log(3.09619e+01);
    logPartFn[4] = Math.log(4.97225e+01);
       }

if (species == "TmIII"){
    logPartFn[0] = Math.log(8.00000e+00);
    logPartFn[1] = Math.log(8.00000e+00);
    logPartFn[2] = Math.log(8.08981e+00);
    logPartFn[3] = Math.log(1.09856e+01);
    logPartFn[4] = Math.log(1.49391e+01);
       }

if (species == "YbI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00151e+00);
    logPartFn[3] = Math.log(2.45238e+00);
    logPartFn[4] = Math.log(5.30693e+00);
       }

if (species == "YbII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00045e+00);
    logPartFn[3] = Math.log(2.90499e+00);
    logPartFn[4] = Math.log(4.84517e+00);
       }

if (species == "YbIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.10983e+00);
    logPartFn[4] = Math.log(1.44387e+00);
       }

if (species == "LuI"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.01936e+00);
    logPartFn[2] = Math.log(6.69800e+00);
    logPartFn[3] = Math.log(1.39052e+01);
    logPartFn[4] = Math.log(2.05472e+01);
       }

if (species == "LuII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.03231e+00);
    logPartFn[3] = Math.log(2.81256e+00);
    logPartFn[4] = Math.log(4.21040e+00);
       }

if (species == "LuIII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.35394e+00);
    logPartFn[3] = Math.log(4.70352e+00);
    logPartFn[4] = Math.log(5.50348e+00);
       }

if (species == "HfI"){
    logPartFn[0] = Math.log(5.00000e+00);
    logPartFn[1] = Math.log(5.00797e+00);
    logPartFn[2] = Math.log(8.96794e+00);
    logPartFn[3] = Math.log(2.73353e+01);
    logPartFn[4] = Math.log(4.03170e+01);
       }

if (species == "HfII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00104e+00);
    logPartFn[2] = Math.log(7.28122e+00);
    logPartFn[3] = Math.log(2.20042e+01);
    logPartFn[4] = Math.log(2.94434e+01);
       }

if (species == "HfIII"){
    logPartFn[0] = Math.log(5.00000e+00);
    logPartFn[1] = Math.log(5.00000e+00);
    logPartFn[2] = Math.log(5.00000e+00);
    logPartFn[3] = Math.log(5.00000e+00);
    logPartFn[4] = Math.log(5.00000e+00);
       }

if (species == "TaI"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.01856e+00);
    logPartFn[2] = Math.log(8.90727e+00);
    logPartFn[3] = Math.log(3.81227e+01);
    logPartFn[4] = Math.log(5.94676e+01);
       }

if (species == "TaII"){
    logPartFn[0] = Math.log(3.00006e+00);
    logPartFn[1] = Math.log(3.26126e+00);
    logPartFn[2] = Math.log(1.20456e+01);
    logPartFn[3] = Math.log(4.24778e+01);
    logPartFn[4] = Math.log(5.72237e+01);
       }

if (species == "TaIII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.00000e+00);
    logPartFn[3] = Math.log(4.00000e+00);
    logPartFn[4] = Math.log(4.00000e+00);
       }

if (species == "WI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.02634e+00);
    logPartFn[2] = Math.log(6.30546e+00);
    logPartFn[3] = Math.log(2.85590e+01);
    logPartFn[4] = Math.log(4.57837e+01);
       }

if (species == "WII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.05127e+00);
    logPartFn[2] = Math.log(6.98039e+00);
    logPartFn[3] = Math.log(2.94443e+01);
    logPartFn[4] = Math.log(4.35189e+01);
       }

if (species == "WIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00456e+00);
    logPartFn[2] = Math.log(3.26242e+00);
    logPartFn[3] = Math.log(1.74093e+01);
    logPartFn[4] = Math.log(2.62418e+01);
       }

if (species == "ReI"){
    logPartFn[0] = Math.log(6.00000e+00);
    logPartFn[1] = Math.log(6.00000e+00);
    logPartFn[2] = Math.log(6.10431e+00);
    logPartFn[3] = Math.log(1.55905e+01);
    logPartFn[4] = Math.log(2.56949e+01);
       }

if (species == "ReII"){
    logPartFn[0] = Math.log(7.00000e+00);
    logPartFn[1] = Math.log(7.00000e+00);
    logPartFn[2] = Math.log(7.02641e+00);
    logPartFn[3] = Math.log(1.17977e+01);
    logPartFn[4] = Math.log(1.72060e+01);
       }

if (species == "ReIII"){
    logPartFn[0] = Math.log(6.00000e+00);
    logPartFn[1] = Math.log(6.00000e+00);
    logPartFn[2] = Math.log(6.00000e+00);
    logPartFn[3] = Math.log(6.00000e+00);
    logPartFn[4] = Math.log(6.00000e+00);
       }

if (species == "OsI"){
    logPartFn[0] = Math.log(9.00000e+00);
    logPartFn[1] = Math.log(9.00193e+00);
    logPartFn[2] = Math.log(1.28046e+01);
    logPartFn[3] = Math.log(3.57251e+01);
    logPartFn[4] = Math.log(5.01909e+01);
       }

if (species == "OsII"){
    logPartFn[0] = Math.log(1.00000e+01);
    logPartFn[1] = Math.log(1.00003e+01);
    logPartFn[2] = Math.log(1.29335e+01);
    logPartFn[3] = Math.log(2.68382e+01);
    logPartFn[4] = Math.log(3.34231e+01);
       }

if (species == "OsIII"){
    logPartFn[0] = Math.log(7.00000e+00);
    logPartFn[1] = Math.log(7.00000e+00);
    logPartFn[2] = Math.log(7.00000e+00);
    logPartFn[3] = Math.log(7.00000e+00);
    logPartFn[4] = Math.log(7.00000e+00);
       }

if (species == "IrI"){
    logPartFn[0] = Math.log(1.00000e+01);
    logPartFn[1] = Math.log(1.00029e+01);
    logPartFn[2] = Math.log(1.43208e+01);
    logPartFn[3] = Math.log(3.28930e+01);
    logPartFn[4] = Math.log(4.25998e+01);
       }

if (species == "IrII"){
    logPartFn[0] = Math.log(1.10000e+01);
    logPartFn[1] = Math.log(1.10141e+01);
    logPartFn[2] = Math.log(1.64858e+01);
    logPartFn[3] = Math.log(3.43934e+01);
    logPartFn[4] = Math.log(4.27953e+01);
       }

if (species == "IrIII"){
    logPartFn[0] = Math.log(1.00000e+01);
    logPartFn[1] = Math.log(1.00000e+01);
    logPartFn[2] = Math.log(1.00000e+01);
    logPartFn[3] = Math.log(1.00000e+01);
    logPartFn[4] = Math.log(1.00000e+01);
       }

if (species == "PtI"){
    logPartFn[0] = Math.log(7.00192e+00);
    logPartFn[1] = Math.log(8.37770e+00);
    logPartFn[2] = Math.log(1.68661e+01);
    logPartFn[3] = Math.log(2.39027e+01);
    logPartFn[4] = Math.log(2.70210e+01);
       }

if (species == "PtII"){
    logPartFn[0] = Math.log(6.00000e+00);
    logPartFn[1] = Math.log(6.00001e+00);
    logPartFn[2] = Math.log(7.18367e+00);
    logPartFn[3] = Math.log(1.45322e+01);
    logPartFn[4] = Math.log(1.81439e+01);
       }

if (species == "PtIII"){
    logPartFn[0] = Math.log(9.00000e+00);
    logPartFn[1] = Math.log(9.00000e+00);
    logPartFn[2] = Math.log(9.00000e+00);
    logPartFn[3] = Math.log(9.00000e+00);
    logPartFn[4] = Math.log(9.00000e+00);
       }

if (species == "AuI"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.07431e+00);
    logPartFn[3] = Math.log(3.26015e+00);
    logPartFn[4] = Math.log(3.89945e+00);
       }

if (species == "AuII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00623e+00);
    logPartFn[3] = Math.log(1.73082e+00);
    logPartFn[4] = Math.log(2.36680e+00);
       }

if (species == "AuIII"){
    logPartFn[0] = Math.log(6.00000e+00);
    logPartFn[1] = Math.log(6.00000e+00);
    logPartFn[2] = Math.log(6.00000e+00);
    logPartFn[3] = Math.log(6.00000e+00);
    logPartFn[4] = Math.log(6.00000e+00);
       }

if (species == "HgI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00627e+00);
    logPartFn[4] = Math.log(1.03521e+00);
       }

if (species == "HgII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00000e+00);
    logPartFn[3] = Math.log(2.01083e+00);
    logPartFn[4] = Math.log(2.04111e+00);
       }

if (species == "HgIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00459e+00);
    logPartFn[4] = Math.log(1.02282e+00);
       }

if (species == "TlI"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.09532e+00);
    logPartFn[3] = Math.log(3.13616e+00);
    logPartFn[4] = Math.log(4.01172e+00);
       }

if (species == "TlII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00046e+00);
    logPartFn[4] = Math.log(1.00317e+00);
       }

if (species == "TlIII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00000e+00);
    logPartFn[3] = Math.log(2.00006e+00);
    logPartFn[4] = Math.log(2.00068e+00);
       }

if (species == "PbI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.10102e+00);
    logPartFn[3] = Math.log(2.61747e+00);
    logPartFn[4] = Math.log(3.50725e+00);
       }

if (species == "PbII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00467e+00);
    logPartFn[3] = Math.log(2.31815e+00);
    logPartFn[4] = Math.log(2.52964e+00);
       }

if (species == "PbIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00005e+00);
    logPartFn[4] = Math.log(1.00051e+00);
       }

if (species == "BiI"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.02047e+00);
    logPartFn[3] = Math.log(4.95911e+00);
    logPartFn[4] = Math.log(5.65786e+00);
       }

if (species == "BiII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00645e+00);
    logPartFn[3] = Math.log(1.51854e+00);
    logPartFn[4] = Math.log(1.91272e+00);
       }

if (species == "BiIII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.00019e+00);
    logPartFn[3] = Math.log(2.09519e+00);
    logPartFn[4] = Math.log(2.20117e+00);
       }

if (species == "PoI"){
    logPartFn[0] = Math.log(5.00000e+00);
    logPartFn[1] = Math.log(5.00000e+00);
    logPartFn[2] = Math.log(5.02832e+00);
    logPartFn[3] = Math.log(5.51747e+00);
    logPartFn[4] = Math.log(5.89033e+00);
       }

if (species == "PoII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.00000e+00);
    logPartFn[3] = Math.log(4.00000e+00);
    logPartFn[4] = Math.log(4.00000e+00);
       }

if (species == "PoIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "AtI"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.00000e+00);
    logPartFn[3] = Math.log(4.00297e+00);
    logPartFn[4] = Math.log(4.01505e+00);
       }

if (species == "AtII"){
    logPartFn[0] = Math.log(5.00000e+00);
    logPartFn[1] = Math.log(5.00000e+00);
    logPartFn[2] = Math.log(5.00000e+00);
    logPartFn[3] = Math.log(5.00000e+00);
    logPartFn[4] = Math.log(5.00000e+00);
       }

if (species == "AtIII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.00000e+00);
    logPartFn[3] = Math.log(4.00000e+00);
    logPartFn[4] = Math.log(4.00000e+00);
       }

if (species == "RnI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00086e+00);
    logPartFn[4] = Math.log(1.00996e+00);
       }

if (species == "RnII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.00000e+00);
    logPartFn[3] = Math.log(4.00773e+00);
    logPartFn[4] = Math.log(4.02348e+00);
       }

if (species == "RnIII"){
    logPartFn[0] = Math.log(5.00000e+00);
    logPartFn[1] = Math.log(5.00000e+00);
    logPartFn[2] = Math.log(5.00000e+00);
    logPartFn[3] = Math.log(5.00000e+00);
    logPartFn[4] = Math.log(5.00000e+00);
       }

if (species == "FrI"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.01509e+00);
    logPartFn[3] = Math.log(4.72683e+00);
    logPartFn[4] = Math.log(8.72909e+00);
       }

if (species == "FrII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "FrIII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.00000e+00);
    logPartFn[3] = Math.log(4.00000e+00);
    logPartFn[4] = Math.log(4.00000e+00);
       }

if (species == "RaI"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.02509e+00);
    logPartFn[3] = Math.log(3.46852e+00);
    logPartFn[4] = Math.log(5.89341e+00);
       }

if (species == "RaII"){
    logPartFn[0] = Math.log(2.00000e+00);
    logPartFn[1] = Math.log(2.00000e+00);
    logPartFn[2] = Math.log(2.02050e+00);
    logPartFn[3] = Math.log(3.04735e+00);
    logPartFn[4] = Math.log(3.76227e+00);
       }

if (species == "RaIII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "AcI"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00977e+00);
    logPartFn[2] = Math.log(6.29803e+00);
    logPartFn[3] = Math.log(1.61130e+01);
    logPartFn[4] = Math.log(2.21832e+01);
       }

if (species == "AcII"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.99066e+00);
    logPartFn[3] = Math.log(9.40315e+00);
    logPartFn[4] = Math.log(1.34413e+01);
       }

if (species == "AcIII"){
    logPartFn[0] = Math.log(2.00057e+00);
    logPartFn[1] = Math.log(2.39921e+00);
    logPartFn[2] = Math.log(5.52353e+00);
    logPartFn[3] = Math.log(8.45689e+00);
    logPartFn[4] = Math.log(9.28067e+00);
       }

if (species == "ThI"){
    logPartFn[0] = Math.log(5.00000e+00);
    logPartFn[1] = Math.log(5.00263e+00);
    logPartFn[2] = Math.log(1.10507e+01);
    logPartFn[3] = Math.log(4.50659e+01);
    logPartFn[4] = Math.log(5.99031e+01);
       }

if (species == "ThII"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.09432e+00);
    logPartFn[2] = Math.log(1.45463e+01);
    logPartFn[3] = Math.log(6.18533e+01);
    logPartFn[4] = Math.log(8.01502e+01);
       }

if (species == "ThIII"){
    logPartFn[0] = Math.log(9.00000e+00);
    logPartFn[1] = Math.log(9.00000e+00);
    logPartFn[2] = Math.log(9.00000e+00);
    logPartFn[3] = Math.log(9.00000e+00);
    logPartFn[4] = Math.log(9.00000e+00);
       }

if (species == "PaI"){
    logPartFn[0] = Math.log(1.20011e+01);
    logPartFn[1] = Math.log(1.30217e+01);
    logPartFn[2] = Math.log(4.32464e+01);
    logPartFn[3] = Math.log(1.22610e+02);
    logPartFn[4] = Math.log(1.49295e+02);
       }

if (species == "PaII"){
    logPartFn[0] = Math.log(9.00122e+00);
    logPartFn[1] = Math.log(1.01871e+01);
    logPartFn[2] = Math.log(4.27330e+01);
    logPartFn[3] = Math.log(9.03874e+01);
    logPartFn[4] = Math.log(1.01197e+02);
       }

if (species == "PaIII"){
    logPartFn[0] = Math.log(1.20000e+01);
    logPartFn[1] = Math.log(1.20000e+01);
    logPartFn[2] = Math.log(1.20000e+01);
    logPartFn[3] = Math.log(1.20000e+01);
    logPartFn[4] = Math.log(1.20000e+01);
       }

if (species == "UI"){
    logPartFn[0] = Math.log(1.30115e+01);
    logPartFn[1] = Math.log(1.48466e+01);
    logPartFn[2] = Math.log(3.35353e+01);
    logPartFn[3] = Math.log(1.07772e+02);
    logPartFn[4] = Math.log(1.36160e+02);
       }

if (species == "UII"){
    logPartFn[0] = Math.log(1.04902e+01);
    logPartFn[1] = Math.log(1.60511e+01);
    logPartFn[2] = Math.log(5.15324e+01);
    logPartFn[3] = Math.log(1.55945e+02);
    logPartFn[4] = Math.log(1.91265e+02);
       }

if (species == "UIII"){
    logPartFn[0] = Math.log(9.00000e+00);
    logPartFn[1] = Math.log(9.00000e+00);
    logPartFn[2] = Math.log(9.00000e+00);
    logPartFn[3] = Math.log(9.00000e+00);
    logPartFn[4] = Math.log(9.00000e+00);
       }

if (species == "H-"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "C-"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.08591e+00);
    logPartFn[3] = Math.log(5.67986e+00);
    logPartFn[4] = Math.log(6.40004e+00);
       }

if (species == "O-"){
    logPartFn[0] = Math.log(4.28183e+00);
    logPartFn[1] = Math.log(5.20160e+00);
    logPartFn[2] = Math.log(5.83718e+00);
    logPartFn[3] = Math.log(5.93732e+00);
    logPartFn[4] = Math.log(5.94969e+00);
       }

if (species == "F-"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

if (species == "Si-"){
    logPartFn[0] = Math.log(4.00000e+00);
    logPartFn[1] = Math.log(4.00000e+00);
    logPartFn[2] = Math.log(4.38825e+00);
    logPartFn[3] = Math.log(7.70408e+00);
    logPartFn[4] = Math.log(8.92238e+00);
       }
                                                                      
if (species == "S-"){
    logPartFn[0] = Math.log(4.00949e+00);
    logPartFn[1] = Math.log(4.49753e+00);
    logPartFn[2] = Math.log(5.58609e+00);
    logPartFn[3] = Math.log(5.83344e+00);
    logPartFn[4] = Math.log(5.86560e+00);
       }

if (species == "Cl-"){
    logPartFn[0] = Math.log(1.00000e+00);
    logPartFn[1] = Math.log(1.00000e+00);
    logPartFn[2] = Math.log(1.00000e+00);
    logPartFn[3] = Math.log(1.00000e+00);
    logPartFn[4] = Math.log(1.00000e+00);
       }

   return logPartFn;

   }; //end of method getPartFn2

