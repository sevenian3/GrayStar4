
/**** Routines for client side post-processing of raw model atmosphere/spectrum
 * synthesis output from server to produce synthetic observables
 */

/**
 * First, reality check raw colours, THEN Run Vega model and subtract off Vega
 * colours for single-point calibration
 */
var UBVRI = function(lambdaScale, flux, numDeps, tauRos, temp) {

    var filters = filterSet();

    var numCols = 5;  //five band combinations in Johnson-Bessell UxBxBVRI: Ux-Bx, B-V, V-R, V-I, R-I
    var colors = [];
    colors.length = numCols;

    var numBands = filters.length;
    var numLambdaFilt;

    var bandFlux = [];
    bandFlux.length = numBands;


    // Single-point calibration to Vega:
    // Vega colours computed self-consistntly with GrayFox 1.0 using 
    // Stellar parameters of Castelli, F.; Kurucz, R. L., 1994, A&A, 281, 817
    // Teff = 9550 K, log(g) = 3.95, ([Fe/H] = -0.5 - not directly relevent):

    //var vegaColors = [0.0, 0.0, 0.0, 0.0, 0.0]; //For re-calibrating with raw Vega colours
    // Aug 2015 - with 14-line linelist:
    //var vegaColors = [0.289244, -0.400324, 0.222397, -0.288568, -0.510965];
    var vegaColors = [0.163003, -0.491341, 0.161940, -0.464265, -0.626204];

    var deltaLam, newY, product;

    for (var ib = 0; ib < numBands; ib++) {

        bandFlux[ib] = 0.0; //initialization
        numLambdaFilt = filters[ib][0].length;
        //console.log("ib " + ib + " numLambdaFilt " + numLambdaFilt);
        //wavelength loop is over photometric filter data wavelengths

        for (var il = 1; il < numLambdaFilt; il++) {

            //In this case - interpolate model SED onto wavelength grid of given photometric filter data

            deltaLam = filters[ib][0][il] - filters[ib][0][il - 1];  //nm
            //deltaLam = 1.0e-7 * deltaLam;  //cm
            //console.log("ib: " + ib + " il: " + il + " filters[ib][0][il] " + filters[ib][0][il] + " deltaLam: " + deltaLam + " filters[ib][1][il] " + filters[ib][1][il]);

            //hand log flux (row 1) to interpolation routine: 
            newY = interpol(lambdaScale, flux[1], filters[ib][0][il]);
            // linearize interpolated flux: - fluxes add *linearly*
            newY = Math.exp(newY);

            product = filters[ib][1][il] * newY;
            if (ib === 2) {
                //console.log("Photometry: il: " + il + " newY: " + newY + " filterLamb: " + filters[ib][0][il] + " filterTrans: " + filters[ib][1][il] + " product " + product);
            }
            //System.out.println("Photometry: filtertrans: " + filters[ib][1][il] + " product: " + product + " deltaLam: " + deltaLam);
            //Rectangular picket integration
            bandFlux[ib] = bandFlux[ib] + (product * deltaLam);
            //console.log("Photometry: ib: " + ib + " deltaLam " + deltaLam + " bandFlux: " + bandFlux[ib]);

        } //il loop - lambdas
        //console.log("Photometry: ib: " + ib + " bandFlux: " + bandFlux[ib], " product " + product + " deltaLam " + deltaLam);

    }  //ib loop - bands

    var raw;

    // Ux-Bx: 
    raw = 2.5 * logTen(bandFlux[1] / bandFlux[0]);
    colors[0] = raw - vegaColors[0];
    //console.log("U-B: " + colors[0] + " raw " + raw + " bandFlux[1] " + bandFlux[1] + " bandFlux[0] " + bandFlux[0]);

    // B-V:
    raw = 2.5 * logTen(bandFlux[3] / bandFlux[2]);
    colors[1] = raw - vegaColors[1];
    //console.log("B-V: " + colors[1]);

    // V-R:
    raw = 2.5 * logTen(bandFlux[4] / bandFlux[3]);
    colors[2] = raw - vegaColors[2];
    //console.log("V-R: " + colors[2]);

    // V-I:
    raw = 2.5 * logTen(bandFlux[5] / bandFlux[3]);
    colors[3] = raw - vegaColors[3];
    //console.log("V-I: " + colors[3]);

    // R-I:
    raw = 2.5 * logTen(bandFlux[5] / bandFlux[4]);
    colors[4] = raw - vegaColors[4];
    //console.log("R-I: " + colors[4]);

    return colors;

}; //UBVRI

//
//

var iColors = function(lambdaScale, intens, numThetas, numLams) {
    //No! iColors now returns band-integrated intensities

    var filters = filterSet();
    var numCols = 5; //five band combinations in Johnson-Bessell UxBxBVRI: Ux-Bx, B-V, V-R, V-I, R-I

    var numBands = filters.length;
    var numLambdaFilt = filters[0][0].length;

    //var colors = [];
    //colors.length = numCols;
    //// Have to use Array constructor here:
    //for (var i = 0; i < numCols; i++) {
    //    colors[i] = new Array(numThetas);
    //}


    var bandIntens = [];
    bandIntens.length = numBands;
    // Have to use Array constructor here:
    for (var i = 0; i < numBands; i++) {
        bandIntens[i] = new Array(numThetas);
    }


//Unnecessary:
//Note: Calibration must be re-done!  May 2015
// Single-point Johnson UBVRI calibration to Vega:
// Vega colours computed self-consistntly with GrayFox 1.0 using 
// Stellar parameters of Castelli, F.; Kurucz, R. L., 1994, A&A, 281, 817
// Teff = 9550 K, log(g) = 3.95, ([Fe/H] = -0.5 - not directly relevent):
    var vegaColors = [0.163003, -0.491341, 0.161940, -0.464265, -0.626204];

    var deltaLam, newY, product, raw;
    var intensLam = [];
    intensLam.length = numLams;

    //Now same for each intensity spectrum:
    for (var it = 0; it < numThetas; it++) {

//Caution: This loop is over *model SED* lambdas!
        for (var jl = 0; jl < numLams; jl++) {
            intensLam[jl] = intens[jl][it];
            //System.out.println("it: " + it + " jl: " + jl + " intensLam[jl]: " + intensLam[jl]);
        }

        for (var ib = 0; ib < numBands; ib++) {

            bandIntens[ib][it] = 0.0; //initialization

//wavelength loop is over photometric filter data wavelengths

            for (var il = 1; il < numLambdaFilt; il++) {

//In this case - interpolate model SED onto wavelength grid of given photometric filter data

                deltaLam = filters[ib][0][il] - filters[ib][0][il - 1]; //nm
                //deltaLam = 1.0e-7 * deltaLam; //cm
                //hand log flux (row 1) to interpolation routine: 
                newY = interpol(lambdaScale, intensLam, filters[ib][0][il]);
                //System.out.println("Photometry: newFlux: " + newFlux + " filterlamb: " + filters[ib][0][il]);
                product = filters[ib][1][il] * newY;
                //System.out.println("Photometry: filtertrans: " + filters[ib][1][il] + " product: " + product + " deltaLam: " + deltaLam);
                //Rectangular picket integration
                bandIntens[ib][it] = bandIntens[ib][it] + (product * deltaLam);
                //console.log("Photometry: ib: " + ib + " bandIntens: " + bandIntens[ib][it]);
            } //il wavelength loop

//System.out.println("Photometry: ib: " + ib + " it: " + it + " bandIntens: " + bandIntens[ib][it]);
        }  //ib band loop

        //necessary
        //Make the colors! :-)
        //console.log("it: " + it);

        // Ux-Bx: 
        //raw = 2.5 * logTen(bandIntens[1][it] / bandIntens[0][it]);
        //colors[0][it] = raw - vegaColors[0];
        //console.log("U-B: " + colors[0][it]);

        // B-V:
        //raw = 2.5 * logTen(bandIntens[3][it] / bandIntens[2][it]);
        //colors[1][it] = raw - vegaColors[1];
        //console.log("B-V: " + colors[1][it]);

        // V-R:
        //raw = 2.5 * logTen(bandIntens[4][it] / bandIntens[3][it]);
        //colors[2][it] = raw - vegaColors[2];
        //console.log("V-R: " + colors[2][it]);

        // V-I:
        // raw = 2.5 * logTen(bandIntens[5][it] / bandIntens[3][it]);
        //colors[3][it] = raw - vegaColors[3];
        //console.log("V-I: " + colors[3][it]);

        // R-I:
        //raw = 2.5 * logTen(bandIntens[5][it] / bandIntens[4][it]);
        //colors[4][it] = raw - vegaColors[4];
        //console.log("R-I: " + colors[4][it]);
        //necessary

    } //theta it loop

    //return colors;
    return bandIntens;

}; //iColours

//
//

var filterSet = function() {

    var numBands = 6; // Bessell-Johnson UxBxBVRI
    var numLambdaFilt = 25; //test for now

    //double[][][] filterCurves = new double[numBands][2][numLambdaFilt];

    var filterCurves = [];
    filterCurves.length = numBands;
    // Have to use Array constructor here:
    for (var i = 0; i < numBands; i++) {
        filterCurves[i] = new Array(2);
    }
    // Have to use Array constructor here:
    for (var i = 0; i < numBands; i++) {
        filterCurves[i][0] = new Array(numLambdaFilt);
        filterCurves[i][1] = new Array(numLambdaFilt);
    }

    //Initialize all filterCurves - the real data below won't fill in all the array elements:
    for (var ib = 0; ib < numBands; ib++) {
        for (var il = 0; il < numLambdaFilt; il++) {
            filterCurves[ib][0][il] = 1000.0; //placeholder wavelength (nm)
            filterCurves[ib][1][il] = 0.0e0; // initialize filter transparency to 0.0
        }
    }

    //http://ulisse.pd.astro.it/Astro/ADPS/Systems/Sys_136/index_136.html
//Bessell, M. S., 1990, PASP, 102, 1181
//photometric filter data for Bessell UxBxBVRI system from Asiago database in Java & JavaScript syntax
//Individual bands are below master table
//        UX
    filterCurves[0][0][0] = 300.0;
    filterCurves[0][1][0] = 0.000;
    filterCurves[0][0][1] = 305.0;
    filterCurves[0][1][1] = 0.016;
    filterCurves[0][0][2] = 310.0;
    filterCurves[0][1][2] = 0.068;
    filterCurves[0][0][3] = 315.0;
    filterCurves[0][1][3] = 0.167;
    filterCurves[0][0][4] = 320.0;
    filterCurves[0][1][4] = 0.287;
    filterCurves[0][0][5] = 325.0;
    filterCurves[0][1][5] = 0.423;
    filterCurves[0][0][6] = 330.0;
    filterCurves[0][1][6] = 0.560;
    filterCurves[0][0][7] = 335.0;
    filterCurves[0][1][7] = 0.673;
    filterCurves[0][0][8] = 340.0;
    filterCurves[0][1][8] = 0.772;
    filterCurves[0][0][9] = 345.0;
    filterCurves[0][1][9] = 0.841;
    filterCurves[0][0][10] = 350.0;
    filterCurves[0][1][10] = 0.905;
    filterCurves[0][0][11] = 355.0;
    filterCurves[0][1][11] = 0.943;
    filterCurves[0][0][12] = 360.0;
    filterCurves[0][1][12] = 0.981;
    filterCurves[0][0][13] = 365.0;
    filterCurves[0][1][13] = 0.993;
    filterCurves[0][0][14] = 370.0;
    filterCurves[0][1][14] = 1.000;
    filterCurves[0][0][15] = 375.0;
    filterCurves[0][1][15] = 0.989;
    filterCurves[0][0][16] = 380.0;
    filterCurves[0][1][16] = 0.916;
    filterCurves[0][0][17] = 385.0;
    filterCurves[0][1][17] = 0.804;
    filterCurves[0][0][18] = 390.0;
    filterCurves[0][1][18] = 0.625;
    filterCurves[0][0][19] = 395.0;
    filterCurves[0][1][19] = 0.423;
    filterCurves[0][0][20] = 400.0;
    filterCurves[0][1][20] = 0.238;
    filterCurves[0][0][21] = 405.0;
    filterCurves[0][1][21] = 0.114;
    filterCurves[0][0][22] = 410.0;
    filterCurves[0][1][22] = 0.051;
    filterCurves[0][0][23] = 415.0;
    filterCurves[0][1][23] = 0.019;
    filterCurves[0][0][24] = 420.0;
    filterCurves[0][1][24] = 0.000;
//BX
    filterCurves[1][0][0] = 360.0;
    filterCurves[1][1][0] = 0.000;
    filterCurves[1][0][1] = 370.0;
    filterCurves[1][1][1] = 0.026;
    filterCurves[1][0][2] = 380.0;
    filterCurves[1][1][2] = 0.120;
    filterCurves[1][0][3] = 390.0;
    filterCurves[1][1][3] = 0.523;
    filterCurves[1][0][4] = 400.0;
    filterCurves[1][1][4] = 0.875;
    filterCurves[1][0][5] = 410.0;
    filterCurves[1][1][5] = 0.956;
    filterCurves[1][0][6] = 420.0;
    filterCurves[1][1][6] = 1.000;
    filterCurves[1][0][7] = 430.0;
    filterCurves[1][1][7] = 0.998;
    filterCurves[1][0][8] = 440.0;
    filterCurves[1][1][8] = 0.972;
    filterCurves[1][0][9] = 450.0;
    filterCurves[1][1][9] = 0.901;
    filterCurves[1][0][10] = 460.0;
    filterCurves[1][1][10] = 0.793;
    filterCurves[1][0][11] = 470.0;
    filterCurves[1][1][11] = 0.694;
    filterCurves[1][0][12] = 480.0;
    filterCurves[1][1][12] = 0.587;
    filterCurves[1][0][13] = 490.0;
    filterCurves[1][1][13] = 0.470;
    filterCurves[1][0][14] = 500.0;
    filterCurves[1][1][14] = 0.362;
    filterCurves[1][0][15] = 510.0;
    filterCurves[1][1][15] = 0.263;
    filterCurves[1][0][16] = 520.0;
    filterCurves[1][1][16] = 0.169;
    filterCurves[1][0][17] = 530.0;
    filterCurves[1][1][17] = 0.107;
    filterCurves[1][0][18] = 540.0;
    filterCurves[1][1][18] = 0.049;
    filterCurves[1][0][19] = 550.0;
    filterCurves[1][1][19] = 0.010;
    filterCurves[1][0][20] = 560.0;
    filterCurves[1][1][20] = 0.000;
    filterCurves[1][0][21] = 560.0;
    filterCurves[1][1][21] = 0.000;
    filterCurves[1][0][22] = 560.0;
    filterCurves[1][1][22] = 0.000;
    filterCurves[1][0][23] = 560.0;
    filterCurves[1][1][23] = 0.000;
    filterCurves[1][0][24] = 560.0;
    filterCurves[1][1][24] = 0.000;
//B
    filterCurves[2][0][0] = 360.0;
    filterCurves[2][1][0] = 0.000;
    filterCurves[2][0][1] = 370.0;
    filterCurves[2][1][1] = 0.030;
    filterCurves[2][0][2] = 380.0;
    filterCurves[2][1][2] = 0.134;
    filterCurves[2][0][3] = 390.0;
    filterCurves[2][1][3] = 0.567;
    filterCurves[2][0][4] = 400.0;
    filterCurves[2][1][4] = 0.920;
    filterCurves[2][0][5] = 410.0;
    filterCurves[2][1][5] = 0.978;
    filterCurves[2][0][6] = 420.0;
    filterCurves[2][1][6] = 1.000;
    filterCurves[2][0][7] = 430.0;
    filterCurves[2][1][7] = 0.978;
    filterCurves[2][0][8] = 440.0;
    filterCurves[2][1][8] = 0.935;
    filterCurves[2][0][9] = 450.0;
    filterCurves[2][1][9] = 0.853;
    filterCurves[2][0][10] = 460.0;
    filterCurves[2][1][10] = 0.740;
    filterCurves[2][0][11] = 470.0;
    filterCurves[2][1][11] = 0.640;
    filterCurves[2][0][12] = 480.0;
    filterCurves[2][1][12] = 0.536;
    filterCurves[2][0][13] = 490.0;
    filterCurves[2][1][13] = 0.424;
    filterCurves[2][0][14] = 500.0;
    filterCurves[2][1][14] = 0.325;
    filterCurves[2][0][15] = 510.0;
    filterCurves[2][1][15] = 0.235;
    filterCurves[2][0][16] = 520.0;
    filterCurves[2][1][16] = 0.150;
    filterCurves[2][0][17] = 530.0;
    filterCurves[2][1][17] = 0.095;
    filterCurves[2][0][18] = 540.0;
    filterCurves[2][1][18] = 0.043;
    filterCurves[2][0][19] = 550.0;
    filterCurves[2][1][19] = 0.009;
    filterCurves[2][0][20] = 560.0;
    filterCurves[2][1][20] = 0.000;
    filterCurves[2][0][21] = 560.0;
    filterCurves[2][1][21] = 0.000;
    filterCurves[2][0][22] = 560.0;
    filterCurves[2][1][22] = 0.000;
    filterCurves[2][0][23] = 560.0;
    filterCurves[2][1][23] = 0.000;
    filterCurves[2][0][24] = 560.0;
    filterCurves[2][1][24] = 0.000;
//V
    filterCurves[3][0][0] = 470.0;
    filterCurves[3][1][0] = 0.000;
    filterCurves[3][0][1] = 480.0;
    filterCurves[3][1][1] = 0.030;
    filterCurves[3][0][2] = 490.0;
    filterCurves[3][1][2] = 0.163;
    filterCurves[3][0][3] = 500.0;
    filterCurves[3][1][3] = 0.458;
    filterCurves[3][0][4] = 510.0;
    filterCurves[3][1][4] = 0.780;
    filterCurves[3][0][5] = 520.0;
    filterCurves[3][1][5] = 0.967;
    filterCurves[3][0][6] = 530.0;
    filterCurves[3][1][6] = 1.000;
    filterCurves[3][0][7] = 540.0;
    filterCurves[3][1][7] = 0.973;
    filterCurves[3][0][8] = 550.0;
    filterCurves[3][1][8] = 0.898;
    filterCurves[3][0][9] = 560.0;
    filterCurves[3][1][9] = 0.792;
    filterCurves[3][0][10] = 570.0;
    filterCurves[3][1][10] = 0.684;
    filterCurves[3][0][11] = 580.0;
    filterCurves[3][1][11] = 0.574;
    filterCurves[3][0][12] = 590.0;
    filterCurves[3][1][12] = 0.461;
    filterCurves[3][0][13] = 600.0;
    filterCurves[3][1][13] = 0.359;
    filterCurves[3][0][14] = 610.0;
    filterCurves[3][1][14] = 0.270;
    filterCurves[3][0][15] = 620.0;
    filterCurves[3][1][15] = 0.197;
    filterCurves[3][0][16] = 630.0;
    filterCurves[3][1][16] = 0.135;
    filterCurves[3][0][17] = 640.0;
    filterCurves[3][1][17] = 0.081;
    filterCurves[3][0][18] = 650.0;
    filterCurves[3][1][18] = 0.045;
    filterCurves[3][0][19] = 660.0;
    filterCurves[3][1][19] = 0.025;
    filterCurves[3][0][20] = 670.0;
    filterCurves[3][1][20] = 0.017;
    filterCurves[3][0][21] = 680.0;
    filterCurves[3][1][21] = 0.013;
    filterCurves[3][0][22] = 690.0;
    filterCurves[3][1][22] = 0.009;
    filterCurves[3][0][23] = 700.0;
    filterCurves[3][1][23] = 0.000;
    filterCurves[3][0][24] = 700.0;
    filterCurves[3][1][24] = 0.000;
//R
    filterCurves[4][0][0] = 550.0;
    filterCurves[4][1][0] = 0.00;
    filterCurves[4][0][1] = 560.0;
    filterCurves[4][1][1] = 0.23;
    filterCurves[4][0][2] = 570.0;
    filterCurves[4][1][2] = 0.74;
    filterCurves[4][0][3] = 580.0;
    filterCurves[4][1][3] = 0.91;
    filterCurves[4][0][4] = 590.0;
    filterCurves[4][1][4] = 0.98;
    filterCurves[4][0][5] = 600.0;
    filterCurves[4][1][5] = 1.00;
    filterCurves[4][0][6] = 610.0;
    filterCurves[4][1][6] = 0.98;
    filterCurves[4][0][7] = 620.0;
    filterCurves[4][1][7] = 0.96;
    filterCurves[4][0][8] = 630.0;
    filterCurves[4][1][8] = 0.93;
    filterCurves[4][0][9] = 640.0;
    filterCurves[4][1][9] = 0.90;
    filterCurves[4][0][10] = 650.0;
    filterCurves[4][1][10] = 0.86;
    filterCurves[4][0][11] = 660.0;
    filterCurves[4][1][11] = 0.81;
    filterCurves[4][0][12] = 670.0;
    filterCurves[4][1][12] = 0.78;
    filterCurves[4][0][13] = 680.0;
    filterCurves[4][1][13] = 0.72;
    filterCurves[4][0][14] = 690.0;
    filterCurves[4][1][14] = 0.67;
    filterCurves[4][0][15] = 700.0;
    filterCurves[4][1][15] = 0.61;
    filterCurves[4][0][16] = 710.0;
    filterCurves[4][1][16] = 0.56;
    filterCurves[4][0][17] = 720.0;
    filterCurves[4][1][17] = 0.51;
    filterCurves[4][0][18] = 730.0;
    filterCurves[4][1][18] = 0.46;
    filterCurves[4][0][19] = 740.0;
    filterCurves[4][1][19] = 0.40;
    filterCurves[4][0][20] = 750.0;
    filterCurves[4][1][20] = 0.35;
    filterCurves[4][0][21] = 800.0;
    filterCurves[4][1][21] = 0.14;
    filterCurves[4][0][22] = 850.0;
    filterCurves[4][1][22] = 0.03;
    filterCurves[4][0][23] = 900.0;
    filterCurves[4][1][23] = 0.00;
    filterCurves[4][0][24] = 900.0;
    filterCurves[4][1][24] = 0.000;

//I
    filterCurves[5][0][0] = 700.0;
    filterCurves[5][1][0] = 0.000;
    filterCurves[5][0][1] = 710.0;
    filterCurves[5][1][1] = 0.024;
    filterCurves[5][0][2] = 720.0;
    filterCurves[5][1][2] = 0.232;
    filterCurves[5][0][3] = 730.0;
    filterCurves[5][1][3] = 0.555;
    filterCurves[5][0][4] = 740.0;
    filterCurves[5][1][4] = 0.785;
    filterCurves[5][0][5] = 750.0;
    filterCurves[5][1][5] = 0.910;
    filterCurves[5][0][6] = 760.0;
    filterCurves[5][1][6] = 0.965;
    filterCurves[5][0][7] = 770.0;
    filterCurves[5][1][7] = 0.985;
    filterCurves[5][0][8] = 780.0;
    filterCurves[5][1][8] = 0.990;
    filterCurves[5][0][9] = 790.0;
    filterCurves[5][1][9] = 0.995;
    filterCurves[5][0][10] = 800.0;
    filterCurves[5][1][10] = 1.000;
    filterCurves[5][0][11] = 810.0;
    filterCurves[5][1][11] = 1.000;
    filterCurves[5][0][12] = 820.0;
    filterCurves[5][1][12] = 0.990;
    filterCurves[5][0][13] = 830.0;
    filterCurves[5][1][13] = 0.980;
    filterCurves[5][0][14] = 840.0;
    filterCurves[5][1][14] = 0.950;
    filterCurves[5][0][15] = 850.0;
    filterCurves[5][1][15] = 0.910;
    filterCurves[5][0][16] = 860.0;
    filterCurves[5][1][16] = 0.860;
    filterCurves[5][0][17] = 870.0;
    filterCurves[5][1][17] = 0.750;
    filterCurves[5][0][18] = 880.0;
    filterCurves[5][1][18] = 0.560;
    filterCurves[5][0][19] = 890.0;
    filterCurves[5][1][19] = 0.330;
    filterCurves[5][0][20] = 900.0;
    filterCurves[5][1][20] = 0.150;
    filterCurves[5][0][21] = 910.0;
    filterCurves[5][1][21] = 0.030;
    filterCurves[5][0][22] = 920.0;
    filterCurves[5][1][22] = 0.000;
    filterCurves[5][0][23] = 920.0;
    filterCurves[5][1][23] = 0.000;
    filterCurves[5][0][24] = 920.0;
    filterCurves[5][1][24] = 0.000;
    //
    //Check that we set up the array corectly:
//    for (var ib = 0; ib < numBands; ib++) {
//    var ib = 0;
//    for (var il = 0; il < numLambdaFilt; il++) {
//        console.log("ib: " + ib + " il: " + il + " filterCurves[ib][0][il]: " + filterCurves[0][0][il]);
//       console.log("ib: " + ib + " il: " + il + " filterCurves[ib][1][il]: " + filterCurves[0][1][il]);
//   }
//    }

    for (var ib = 0; ib < numBands; ib++) {
//wavelength loop is over photometric filter data wavelengths
        for (var il = 0; il < numLambdaFilt; il++) {
            filterCurves[ib][0][il] = filterCurves[ib][0][il] * 1.0e-7; // nm to cm
        }
    }


    return filterCurves;
}; //filterSet





/**
 * Compute the equivalent width of the Voigt line in pm - picometers NOTE: The
 * input parameter 'flux' should be a 2 x (numPoints+1) array where the
 * numPoints+1st value is the line centre monochromatic Continuum flux
 */
var eqWidth = function(flux, linePoints, lam0) { //, fluxCont) {

    var logE = logTen(Math.E); // for debug output

    var Wlambda = 0.0; // Equivalent width in pm - picometers

    var numPoints = linePoints[0].length;

    var delta, logDelta, term, normFlux, logNormFlux, integ, integ2, logInteg, lastInteg, lastTerm, term2;

// Spectrum not normalized - try this instead (redefines input parameter fluxCont):
    var logFluxCont = Math.log((flux[0][0] + flux[0][numPoints - 1]) / 2.0);
    //console.log("logFluxCont " + logE * logFluxCont);

    var iCount = Math.floor(numPoints / 2) - 1; //initialize
    //console.log("numPoints " + numPoints + " iCount " + iCount);
    for (var il = Math.floor(numPoints / 2); il < numPoints; il++) {
        //console.log("il " + il + " flux[0][il]/flux[0][numPoints - 1] " + flux[0][il]/flux[0][numPoints - 1]);
        if (flux[0][il] < 0.99 * flux[0][numPoints - 1]) {
            //console.log("Condition triggered");
            iCount++;
            //console.log("iCount " + iCount);
        }
    }
    //console.log("iCount " + iCount);
    //One more or two more if we can accomodate them:
    if (iCount < numPoints - 1) {
        iCount++;
    }
    if (iCount < numPoints - 1) {
        iCount++;
    }
    var iStart = numPoints - iCount;
    var iStop = iCount;
    //console.log("eqwidth: numPoints " + numPoints + " iStart " + iStart + " iStop " + iStop);

    //Trapezoid rule:       
    // First integrand:

    // Single-point normalization to line-centre flux suitable for narrow lines:
    //normFlux = flux[0][il] / flux[0][numPoints];
    logNormFlux = flux[1][iStart] - logFluxCont;
    //logNormFlux = flux[1][0] - fluxCont[1];
    //normFlux = flux[0][il] / fluxCont[0];
    //System.out.println("flux[0][iStart] " + flux[0][iStart] + " fluxCont " + fluxCont);
    // flux should be less than 0.99 of continuum flux:
    if (logNormFlux >= -0.01) {
        lastInteg = 1.0e-99;
    } else {
        lastInteg = 1.0 - Math.exp(logNormFlux);
    }
    lastTerm = lastInteg; //initialization

    for (var il = iStart + 1; il < iStop; il++) {

        // // To avoid problems, only compute the area of the red half of the line, and double:
        // //Thsi means we have to double compute every point for trapezoid rule instead of recycling...

        // if (linePoints[0][il - 1] > 0.0) {

        //       logNormFlux = flux[1][il - 1] - fluxCont;
        //     //logNormFlux = flux[1][0] - fluxCont[1];
        //     //normFlux = flux[0][il] / fluxCont[0];
        //     //System.out.println("flux[0][il] " + flux[0][il] + " fluxCont[0] " + fluxCont[0]);
        //     if (logNormFlux >= -0.01) {
        //         lastInteg = 1.0e-99;
        //     } else {
        //         lastInteg = 1.0 - Math.exp(logNormFlux);
        //     }

        delta = linePoints[0][il] - linePoints[0][il - 1];
        delta = delta * 1.0E+7;  // cm to nm - W_lambda in pm
        logDelta = Math.log(delta);

        // Single-point normalization to line-centre flux suitable for narrow lines:
        //normFlux = flux[0][il] / fluxCont[0];
        logNormFlux = flux[1][il] - logFluxCont;
        //console.log("il " + il + " flux[1][il] " + logE * flux[1][il]);
        //console.log("il " + il + " normFlux " + Math.exp(logNormFlux));
        //logNormFlux = flux[1][il] - fluxCont[1];


        //term = 1.0 - normFlux;

// flux should be less than 0.99 of continuum flux:
        if (logNormFlux >= -0.01) {
            //console.log("logNormFlux condition FAILED, il: " + il);
            integ = 1.0e-99;
        } else {
            integ = 1.0 - Math.exp(logNormFlux);
        }


        //Trapezoid rule:
        integ2 = 0.5 * (lastInteg + integ);
        logInteg = Math.log(integ2);
        term = Math.exp(logInteg + logDelta);

        //Make sure weird features near the red edge don't pollute our Wlambda:
        // for lambda > line centre, area sould be monotically *decreasing*
        //console.log("il " + il + " linePoints[0][il] " + linePoints[0][il] + " lam0 " + lam0 + " integ " + integ + " lastInteg " + lastInteg);
        if ((linePoints[0][il] > 0.0) && (term > lastTerm)) {
            //console.log("term condition FAILED, il: " + il);
            //term2 = lastTerm / 2.0;
            term2 = term; //the above condition giving too small EWs
        } else {
            term2 = term;
        }


        //console.log("il " + il + " logNormFlux " + logE * logNormFlux + " integ " + integ + " term " + term);

        //Wlambda = Wlambda + (term * delta);
        Wlambda = Wlambda + term2;

        lastTerm = term; //For catching problems
        lastInteg = integ;

        //System.out.println("EqWidth: il " + il + " delta " + delta + " term " + term + " normFlux " + normFlux );
        //System.out.println("EqWidth: Wlambda: " + Wlambda);
        //} // if condition for red half of line only
    }

    // Double to pick up blue half and Convert area in nm to pm - picometers
    Wlambda = Wlambda * 1.0E3;

    return Wlambda;

};

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
    //Do macroturbulent and rotational broadening together because they both require
    //same interpolation onto finer wavelength scals 
    // Input parameters:
    // macroV in km/s
    // equatorial rotational surface velocity in km/s
    // rotation axis inclination wrt to line-of-sight ("i"; i=90 is equator-on)
    // local linear monochromatic limb-darkening coefficient (LDC), "epsilon" 
    //    - computed in class GrayStarServer from monochromatic speecific intensity dist
    //     I_lambda(theta)
    var macroRot = function(flux, lambda, numLams, iStart, iStop, macroV, surfEquRotV) {


////data structure to be returned
//   double[][] fluxBroad = new double[3][numLams];
////Default initialization
//   for (int i = 0; i < numLams; i++){
//      fluxBroad[0][i] = flux[0][i];
//      fluxBroad[1][i] = flux[1][i];
//   }

//wavelength sampling interval in nm for interpolation 
    var deltaLam = 0.001;  //nm

// Leave convolution margin around spectrum synthesis region:
   iStart = iStart - 1;
   iStop = iStop + 1;
   var numSpecSyn = iStop - iStart + 1;

//Wavelengths bounding specrum synthesis region of SED:

     var lamStart = 1.0e7 * lambda[iStart]; 
     var lamStop = 1.0e7 * lambda[iStop];

     var numFine = Math.floor((lamStop - lamStart) / deltaLam); 

//data structure to be returned
   var numTot = (iStart+1) + numFine + ((numLams-1) - iStop);
   var fluxBroad = [];
   fluxBroad.length = 3;
   fluxBroad[0] = [];
   fluxBroad[1] = [];
   fluxBroad[2] = [];
   fluxBroad[0].length = numTot;
   fluxBroad[1].length = numTot;
   fluxBroad[2].length = numTot;
   
//   System.out.println("macroRot(): numTot " + numTot);
////Default initialization
//   for (int i = 0; i < numTot; i++){
//      fluxBroad[0][i] = flux[0][i];
//      fluxBroad[1][i] = flux[1][i];
//   }

//     System.out.println("numSpecSyn " + numSpecSyn + " numFine " + numFine);
//
//Create uniformly finely sampled wavelenth vector covering specrum synthesis region of SED:
     var fineLam = [];
     fineLam.length = numFine;
     var ii;
     for (var i = 0; i < numFine; i++){
         ii = 1.0*i;
         fineLam[i] = lamStart + (ii * deltaLam); 
         //System.out.println("i " + i + " fineLam[i] " + fineLam[i]);
         } 

//extract input log flux in spectrum synthesis region:
//  - interpolate in *log* flux
    var snipFlux = [];
    snipFlux.length = numSpecSyn;
    var snipLam = [];
    snipLam.length = numSpecSyn;
    for (var i = 0; i < numSpecSyn; i++){
       snipFlux[i] = flux[1][iStart+i]; //log flux
       snipFlux[i] = flux[0][iStart+i]; //linear flux
       snipLam[i] = 1.0e7 * lambda[iStart+i];
       //System.out.println("i " + i + " snipLam[i] " + snipLam[i] + " snipFlux[i] " + Math.log10(snipFlux[i]));
    } 
  
//Interpolate input spectrum sythesis region onto finely sampled wavelength vector:

  var fineFlux = interpolV(snipFlux, snipLam, fineLam); 
////Convert back to linear flux:
//  for (int i = 0; i < numFine; i++){
//     fineFlux[i] = Math.exp(fineFlux[i]);
//  }

  if (macroV > 0.0){
//Make an area-normalized Gaussian broadning kernel of FWHM = macroturbulence:

// Find representative wavelength in middle of region to be broadened
       var iMid = Math.floor(numFine / 2);
       var midLam = fineLam[iMid];  //nm
   
       var ckm = 1.0e-5 * c; //light speed in vacuum in km/s 
  
//Convert macroV to a corrsponding Doppler shift:
      var doppShift = midLam * (macroV / ckm);  //sigma of Gaussian in nm
      var sigma = doppShift / deltaLam; //sigma of Gaussian in pixels 
      //System.out.println("iMid " + iMid + " midLam " + midLam + " macroV " + macroV + " ckm " + ckm + " doppShift " + doppShift + " sigma " + sigma);
   //double fwhm = 2.0 * doppShift; // Is this right?? red shift & blue shift

//Number of wavelength elements for Gaussian
       var numGauss = Math.ceil(5.0 * sigma);
 //ensure odd number of elements in Gausian kernal
       if ((numGauss % 2) == 0){
          numGauss++;
       }
       var gauss = [];
       gauss.length = numGauss;
       var midPix = Math.floor(numGauss/2);

//Area normalization factors:
       var rootTwoPi = Math.sqrt(2.0 * Math.PI);
       var prefac = 1.0 / (sigma * rootTwoPi); 

       var x, expFac;
//Construct Gaussian in pixel space:
       //double sum = 0.0;  //test
       for (var i = 0; i < numGauss; i++){
          x = (i - midPix);
          expFac = x / sigma; 
          expFac = expFac * expFac; 
          gauss[i] = Math.exp(-0.5 * expFac); 
          gauss[i] = prefac * gauss[i];
          //sum+= gauss[i];   //test
          //System.out.println("i " + i + " gauss[i] " + gauss[i]);  //test
          } 
       //System.out.println("Gaussian area: " + sum); 
//Convolution
//
     //double[] fineFluxConv = convol(fineFlux, gauss);
     var fineFluxConv = [];
     fineFluxConv.length = numFine; 
     for (var i = 0; i < numFine; i++){    //test only
        //System.out.println("i " + i + " fineLam[i] " + fineLam[i]  + " fineFlux[i]: " + Math.log10(fineFlux[i]));    //test only
        fineFluxConv[i] = fineFlux[i];    //test only
     }                                    //test only

////Convert to log flux for interpolation:
//  for (int i = 0; i < numFine; i++){
//     fineFluxConv[i] = Math.log(fineFluxConv[i]);
//  }

//Interpolate broadened spectrum back onto original sparse lambda grid:
     var coarseFlux = interpolV(fineFluxConv, fineLam, snipLam); 

////Convert back to linear flux for interpolation:
//  for (int i = 0; i < numSpecSyn; i++){
//     coarseFlux[i] = Math.exp(coarseFlux[i]);
//     //System.out.println("i " + i + " coarseFlux[i] " + coarseFlux[i]);
//  }
//
////Put broadened  spectrum synthesis region back into overall SED:
//   for (int i = 0; i < numLams; i++){
//      if (i <= iStart){
//          fluxBroad[0][i] = flux[0][i]; //original value
//      }
//      if ((i > iStart) && (i < iStop)){
//          fluxBroad[0][i] = coarseFlux[(i-iStart)-1];
//          //System.out.println("i " + i + " (i-iStart)-1 " + ((i-iStart)-1) + " coarseFlux[(i-iStart)-1] " + Math.log10(coarseFlux[(i-iStart)-1]));
//      }
//      if (i >= iStop){
//          fluxBroad[0][i] = flux[0][i]; //original value
//      }
//      fluxBroad[1][i] = Math.log(fluxBroad[0][i]);
//     //System.out.println("i " + i + " fluxBroad[0][i] " + fluxBroad[0][i] + " fluxBroad[1][i] " + fluxBroad[1][i]);
//   }
//
//Put broadened  spectrum synthesis region back into overall SED:
   for (var i = 0; i < iStart; i++){
          fluxBroad[0][i] = flux[0][i]; //original value
          fluxBroad[1][i] = Math.log(fluxBroad[0][i]);
          fluxBroad[2][i] = lambda[i]; //original value
      }
   for (var i = 0; i < numFine; i++){
          //fluxBroad[0][i] = coarseFlux[(i-iStart)-1];
          fluxBroad[0][iStart+i] = fineFlux[i];
          fluxBroad[1][iStart+i] = Math.log(fluxBroad[0][iStart+i]);
          fluxBroad[2][iStart+i] = 1.0e-7 * fineLam[i];
          //System.out.println("i " + i + " (i-iStart)-1 " + ((i-iStart)-1) + " coarseFlux[(i-iStart)-1] " + Math.log10(coarseFlux[(i-iStart)-1]));
      }
   var count = 0; 
   for (var i = iStop+1; i < numLams; i++){
          fluxBroad[0][iStart+numFine+count] = flux[0][i]; //original value
          fluxBroad[1][iStart+numFine+count] = Math.log(fluxBroad[0][i]);
          fluxBroad[2][iStart+numFine+count] = lambda[i]; //original value
          count++;
      }
     //System.out.println("i " + i + " fluxBroad[0][i] " + fluxBroad[0][i] + " fluxBroad[1][i] " + fluxBroad[1][i]);


} //if macroV > 0.0 condition


if (surfEquRotV > 0.0){

////Interpolate broadened spectrum back onto original sparse lambda grid:
//  double[] coarseFlux = ToolBox.interpolV(fineFluxConv, fineLam, snipLam); 

////Put broadened  spectrum synthesis region back into overall SED:
//   for (int i = 0; i < numLams; i++){
//      if (i <= iStart){
//          fluxBroad[0][i] = flux[0][i]; //original value
//      }
//      if ((i > iStart) && (i < iStop)){
//          fluxBroad[0][i] = coarseFlux[(i-iStart)-1];
//      }
//      if (i >= iStop){
//          fluxBroad[0][i] = flux[0][i]; //original value
//      }
//      fluxBroad[1][i] = Math.log(fluxBroad[0][i]);
   }

        return fluxBroad;

 }; //end method macroRot



//General convolution method
// ***** Function to be convolved and kernel function are expected to *already* be 
// interpolated onto same abssica grid!
//
   var convol = function(yFunction, kernel) {

      var ySize = yFunction.length;
      var kernelSize = kernel.length;
      var halfKernelSize = Math.ceil(kernelSize / 2);
  
      var yFuncConv = [];
      yFuncConv.lngth = ySize;

//First kernelSize/2 elements of yFunction cannot be convolved
      for (var i = 0; i < halfKernelSize; i++){
         yFuncConv[i] = yFunction[i];
        }
//Convolution:
      var offset = 0; //initialization
      for (var i = halfKernelSize; i < ySize - (halfKernelSize); i++){
         var accum = 0; //accumulator
         for (var j = 0; j < kernelSize; j++){ 
            accum = accum + (kernel[j] * yFunction[j+offset]); 
         }  //inner loop, j	
         yFuncConv[i] = accum;
         offset++;
       } //outer loop, i
//Last kernelSize/2 elements of yFunction cannot be convolved
      for (var i = (ySize - halfKernelSize - 1); i < ySize; i++){
         yFuncConv[i] = yFunction[i];
       }

  return yFuncConv; 

  }; //end method convol
*/   

var tuneColor = function(lambdaScale, intens, numThetas, numLams, diskLambda, diskSigma, lamUV, lamIR) {
    //No! iColors now returns band-integrated intensities

  //diskSigma = 10.0;  //test
  //diskSigma = 0.01;  //test
//wavelength sampling interval in nm for interpolation 
    var deltaLam = 0.001;  //nm
      var sigma = diskSigma / deltaLam; //sigma of Gaussian in pixels 
//Number of wavelength elements for Gaussian
       var numSigmas = 2.5; //+/- 2.5 sigmas
       var numGauss = Math.ceil(2.0 * numSigmas * sigma);  //+/- 2.5 sigmas
 //ensure odd number of elements in Gausian kernal
       if ((numGauss % 2) == 0){
          numGauss++;
       }
       var gauss = [];
       gauss.length = numGauss;
       var midPix = Math.floor(numGauss/2);

////Area normalization factors:
//       var rootTwoPi = Math.sqrt(2.0 * Math.PI);
//       var prefac = 1.0 / (sigma * rootTwoPi); 

       var x, expFac;
//Construct Gaussian in pixel space:
       //var sum = 0.0;  //test
       for (var i = 0; i < numGauss; i++){
          x = (i - midPix);
          expFac = x / sigma; 
          expFac = expFac * expFac; 
          gauss[i] = Math.exp(-0.5 * expFac); 
          //gauss[i] = prefac * gauss[i];
          //sum+= gauss[i];   //test
          //console.log("i " + i + " gauss[i] " + gauss[i]);  //test
          } 
       //console.log("Gaussian area: " + sum); 

//establish filter lambda scale:
   var filterLam = [];
   filterLam.length = numGauss;
   lamStart = diskLambda - (numSigmas * diskSigma); //nm
   var ii = 0; 
   for (var i = 0; i < numGauss; i++){
      ii = 1.0 * i;
      filterLam[i] = lamStart + (ii * deltaLam); //nm
      filterLam[i] = 1.0e-7 * filterLam[i]; //cm for reference to lambdaScale
  //Keep wthin limits of treated SED:
    if (filterLam[i] < 1.0e-7*lamUV){
      gauss[i] = 0.0;
     }  
    if (filterLam[i] > 1.0e-7*lamIR){
      gauss[i] = 0.0;
     }  
   } 
       for (var i = 0; i < numGauss; i++){
          //console.log("i " + i + " filterLam[i] " + filterLam[i] + " gauss[i] " + gauss[i]);  //test
          } 

  //console.log("numGauss " + numGauss + " sigma " + sigma + " lamStart " + lamStart);

    var bandIntens = [];
    bandIntens.length = numThetas;

    var product;
    var intensLam = [];
    intensLam.length = numLams;

    //Now same for each intensity spectrum:
    for (var it = 0; it < numThetas; it++) {

//Caution: This loop is over *model SED* lambdas!
        for (var jl = 0; jl < numLams; jl++) {
            intensLam[jl] = intens[jl][it];
            //System.out.println("it: " + it + " jl: " + jl + " intensLam[jl]: " + intensLam[jl]);
        }

    //    for (var ib = 0; ib < numBands; ib++) {

            bandIntens[it] = 0.0; //initialization
            var newY = interpolV(intensLam, lambdaScale, filterLam);

//wavelength loop is over photometric filter data wavelengths

            for (var il = 1; il < numGauss; il++) {

//In this case - interpolate model SED onto wavelength grid of tunable filter 

                product = gauss[il] * newY[il];
                //Rectangular picket integration
                bandIntens[it] = bandIntens[it] + (product * deltaLam);
                //console.log("Photometry: ib: " + ib + " bandIntens: " + bandIntens[ib][it]);
            } //il wavelength loop

  //console.log("tuneColor: it: " + it + " bandIntens: " + bandIntens[it]);
     //   }  //ib band loop

    } //theta it loop

    //return colors;
    return bandIntens;

}; //iColours

// Extract linear monochromatic continuum limb darkening coefficients (LDCs, "epsilon"s)
// // from intensity distribution (needeed for rotational broadening kernel on client side)
//
// Linear limb darkning law:
// //   Each lambda: I(theta)/I(0) = 1 - epsilon +epsilon*cos(theta)
// //   --> Each lambda & theta: "trial" epsilon(theta) = {(I(theta)/I) - 1}/{cos(theta) - 1}
// //   --> each lambda: LDC = mean epsilon for all thetas

  var ldCoeffs = function(numLams, lambdaScale, numThetas, cosTheta, contIntens) {

        var ldc = [];
        ldc.length = numLams;

        var epsilon, meanEpsilon, y;

         for (var iL = 0; iL < numLams; iL++){

            meanEpsilon = 0.0; //initialize accumulator

            for (var iT = 1; iT < numThetas; iT++){

               y = contIntens[iL][iT]/contIntens[iL][0];
               epsilon = (y - 1.0) / (cosTheta[1][iT] - 1.0);
               meanEpsilon += epsilon;

            } //iT theta loop

            ldc[iL] = meanEpsilon / numThetas;

         } //iL lambda loop

        return ldc;

 };  //end method ldc


