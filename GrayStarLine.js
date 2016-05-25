/*
 * GrayStar
 * V1.0, June 2014
 * 
 * C. Ian Short
 * Saint Mary's University
 * Department of Astronomy and Physics
 * Institute for Computational Astrophysics (ICA)
 * Halifax, NS, Canada
 * ian.short@smu.ca
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

// *********************************************************
// 
// 
// Spectral line astrophysical functions:

/**
 * Line profile, phi_lambda(lambda): Assume Voigt function profile - need H(a,v)
 * Assumes CRD, LTE, ??? 
 * Input parameters: lam0 - line center wavelength in nm
 * mass - mass of absorbing particle (amu) logGammaCol - log_10(gamma) - base 10
 * logarithmic collisional (pressure) damping co-efficient (s^-1) epsilon -
 * convective microturbulence- non-thermal broadening parameter (km/s) 
 * Also needs
 * atmospheric structure information: numDeps WON'T WORK - need observer's frame
 * fixed lambda at all depths: temp structure for depth-dependent thermal line
 * broadening Teff as typical temp instead of above pressure structure, pGas, if
 * scaling gamma
 */
var lineGrid = function(lam0In, massIn, xiTIn,
        numDeps, teff, numCore, numWing,
        logGammaCol, tauRos, temp, press, tempSun, pressSun) {

    var c = 2.9979249E+10; // light speed in vaccuum in cm/s
    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var amu = 1.66053892E-24; // atomic mass unit in g
    var logC = Math.log(c);
    var logK = Math.log(k);
    var ln10 = Math.log(10.0);
    var ln2 = Math.log(2.0);
    var logE = logTen(Math.E); // for debug output
    var ln4pi = Math.log(4.0 * Math.PI);

    //Put input parameters into linear cgs units:
    //double gammaCol = Math.pow(10.0, logGammaCol);
    var logTeff = Math.log(teff);
    var xiT = xiTIn * 1.0E5; //km/s to cm/s
    var lam0 = lam0In; // * 1.0E-7; //nm to cm
    var logLam0 = Math.log(lam0);
    var logMass = Math.log(massIn * amu); //amu to g 

    // Compute depth-independent Doppler width, Delta_lambda_D:
    var doppler, logDopp, logHelp, help;
    logHelp = ln2 + logK + logTeff - logMass; // M-B dist, square of v_mode
    help = Math.exp(logHelp) + xiT * xiT; // quadratic sum of thermal v and turbulent v
    logHelp = 0.5 * Math.log(help);
    logDopp = logHelp + logLam0 - logC;
    doppler = Math.exp(logDopp); // cm

    //Set up a half-profile Delta_lambda grid in Doppler width units 
    //from line centre to wing
    //var numCore = 5;
    //var numWing = 5;
    //int numWing = 0;  //debug
    var numPoints = numCore + numWing;
    //console.log("numPoints " + numPoints + " numCore " + numCore + " numWing " + numWing);
    // a 2D 2 X numPoints array of Delta Lambdas 
    // Row 0 : Delta lambdas in cm - will need to be in nm for Planck and Rad Trans?
    // Row 1 : Delta lambdas in Doppler widths

    var linePoints = [];
    linePoints.length = 2;

    linePoints[0] = [];
    linePoints[1] = [];
    linePoints[0].length = numPoints;
    linePoints[1].length = numPoints;

    // Line profile points in Doppler widths - needed for Voigt function, H(a,v):
    var v = [];
    v.length = numPoints;
    //var maxCoreV = 7.5; //core half-width ~ in Doppler widths
    var maxCoreV = 3.5; //core half-width ~ in Doppler widths - 3.5 sigmas of the Gaussian
    //var maxWingDeltaLogV = 1.7 * ln10; //maximum base e logarithmic shift from line centre in Doppler widths
    //var maxWingDeltaLogV = 3.5 * ln10; //maximum base e logarithmic shift from line centre in Doppler widths
    var minWingDeltaLogV = Math.log(maxCoreV + 1.5);
    //console.log("minWingDeltaLogV " + minWingDeltaLogV);

// Compute Voigt "a" parameer to scale line wing points:
    //var logGammaSun = 9.0 * ln10; // Convert to base e 
    //var gamma, logGamma, logA, voigt, core, wing, logWing, logVoigt, a;
    ////Get index of depth nearest to tauRos=1:
    //var tau1 = tauPoint(numDeps, tauRos, 1.0);
//
    ////Variables for managing honest Voigt profile convolution:
    ////Find value of damping a parameter around tauRos=1.0 for guidance:
    //logGamma = press[1][tau1] - pressSun[1][tau1] + 0.7 * (tempSun[1][tau1] - temp[1][tau1]) + logGammaSun;
    //logGamma = logGamma + logGammaCol;
    ////Voigt "a" parameter in Doppler widths with line centre wavelength:
    //logA = 2.0 * logLam0 + logGamma - ln4pi - logC - logDopp;
    ////logA = Math.max(0.0, 2.0 * logLam0 + logGamma - ln4pi - logC - logDopp);
    ////a = Math.exp(logA);
    ////console.log("a " + a);


    // No! var maxWingDeltaLogV = (2.0 + logA) + minWingDeltaLogV; //maximum base e logarithmic shift from line centre in Doppler widths
    var maxWingDeltaLogV = 9.0 + minWingDeltaLogV;
    //console.log("First value: " + 3.5 * ln10);
    //console.log("Second value: " + (8.0 + minWingDeltaLogV) );

    var logV, ii, jj;
    for (var il = 0; il < numPoints; il++) {

        ii = 1.0 * il;
        if (il < numCore) {

            // In core, space v points linearly:
            // Voigt "v" parameter
            // v > 0 --> This is the *red* wing:
            v[il] = ii * maxCoreV / (numCore - 1);
            linePoints[0][il] = doppler * v[il];
            //console.log("Core il " + il + " v[il] " + v[il] + " linePoints[0][il] " + 1.0e7 * linePoints[0][il]);
            linePoints[1][il] = v[il];
        } else {

            //Space v points logarithmically in wing
            jj = ii - numCore;
            logV = (jj * (maxWingDeltaLogV - minWingDeltaLogV) / (numPoints - 1)) + minWingDeltaLogV;

            v[il] = Math.exp(logV);
            linePoints[0][il] = doppler * v[il];
            //console.log("Wing il " + il + " v[il] " + v[il] + " linePoints[0][il] " + 1.0e7 * linePoints[0][il]);
            linePoints[1][il] = v[il];
        } // end else

        //System.out.println("LineGrid: il, lam, v: " + il + " " + 
        //        linePoints[0][il] + " " + linePoints[1][il]);

    } // il lambda loop

    // Add the negative DeltaLambda half of the line:
    var numPoints2 = (2 * numPoints) - 1;
    //System.out.println("LineGrid: numpoints2: " + numPoints2);

    // Return a 2D 2 X (2xnumPoints-1) array of Delta Lambdas 
    // Row 0 : Delta lambdas in cm - will need to be in nm for Planck and Rad Trans?
    // Row 1 : Delta lambdas in Doppler widths

    var linePoints2 = [];
    linePoints2.length = 2;
    linePoints2[0] = [];
    linePoints2[1] = [];
    linePoints2[0].length = numPoints2;
    linePoints2[1].length = numPoints2;

    //wavelengths are depth-independent - just put them in the 0th depth slot:
    for (var il2 = 0; il2 < numPoints2; il2++) {

        if (il2 < numPoints - 1) {

            var il = (numPoints - 1) - il2;
            linePoints2[0][il2] = -1.0 * linePoints[0][il];
            linePoints2[1][il2] = -1.0 * linePoints[1][il];

            //console.log("Blue: LineGrid: il2 " + il2 + " lambda " +
            //        1.0e7*linePoints2[0][il2] + " v " + linePoints2[1][il2]);

        } else {

            //Positive DelataLambda half:   
            var il = il2 - (numPoints - 1);
            linePoints2[0][il2] = linePoints[0][il];
            linePoints2[1][il2] = linePoints[1][il];

            //console.log("Red: LineGrid: il2 " + il2 + " lambda " +
            //        1.0e7*linePoints2[0][il2] + " v " + linePoints2[1][il2]);
        }



    } //il2 loop


    return linePoints2;
};


/**
 * Line profile, phi_lambda(lambda): Assume Voigt function profile - need H(a,v)
 * Assumes CRD, LTE, ??? 
 * Input parameters: lam0 - line center wavelength in nm
 * mass - mass of absorbing particle (amu) logGammaCol - log_10(gamma) - base 10
 * logarithmic collisional (pressure) damping co-efficient (s^-1) epsilon -
 * convective microturbulence- non-thermal broadening parameter (km/s) 
 * Also needs
 * atmospheric structure information: numDeps WON'T WORK - need observer's frame
 * fixed lambda at all depths: temp structure for depth-dependent thermal line
 * broadening Teff as typical temp instead of above pressure structure, pGas, if
 * scaling gamma
 */
var voigt = function(linePoints, lam0In, logAij, logGammaCol,
        numDeps, teff, tauRos, temp, press,
        tempSun, pressSun) {

    var c = 2.9979249E+10; // light speed in vaccuum in cm/s
    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var logC = Math.log(c);
    var logK = Math.log(k);

    var lam0 = lam0In; // * 1.0E-7; //nm to cm
    var logLam0 = Math.log(lam0);
    var ln10 = Math.log(10.0);
    var ln2 = Math.log(2.0);
    var ln4pi = Math.log(4.0 * Math.PI);
    var lnSqRtPi = 0.5 * Math.log(Math.PI);
    var sqPi = Math.sqrt(Math.PI);

    var logE = logTen(Math.E); // for debug output

    var doppler = linePoints[0][1] / linePoints[1][1];
    var logDopp = Math.log(doppler);
    //System.out.println("LineProf: doppler, logDopp: " + doppler + " " + logE*logDopp);

    //Put input parameters into linear cgs units:
    //double gammaCol = Math.pow(10.0, logGammaCol);

    // Lorentzian broadening:
    // Assumes Van der Waals dominates radiative damping
    // log_10 Gamma_6 for van der Waals damping around Tau_Cont = 1 in Sun 
    //  - p. 57 of Radiative Transfer in Stellar Atmospheres (Rutten)
    var logGammaSun = 9.0 * ln10; // Convert to base e 
    //double logFudge = Math.log(2.5);  // Van der Waals enhancement factor

    var tau1 = tauPoint(numDeps, tauRos, 1.0);
    //System.out.println("LINEGRID: Tau1: " + tau1);
    //logA = 2.0 * logLam0 + logGamma - ln4pi - logC - logDopp;
    //a = Math.exp(logA);
    //System.out.println("LINEGRID: logA: " + logE * logA);
    //Set up a half-profile Delta_lambda grid in Doppler width units 
    //from line centre to wing

    var numPoints = linePoints[0].length;
    //System.out.println("LineProf: numPoints: " + numPoints);

    // Return a 2D numPoints X numDeps array of normalized line profile points (phi)

    var lineProf = [];
    lineProf.length = numPoints;
    //Have to use Array constructor here:
    for (var row = 0; row < numPoints; row++) {
        lineProf[row] = new Array(numDeps);
    }
    //Java: double[][] lineProf = new double[numPoints][numDeps];

    // Line profiel points in Doppler widths - needed for Voigt function, H(a,v):
    var v = [];
    v.length = numPoints;
    var logV, ii;
//        lineProf[0][0] = 0.0; v[0] = 0.0; //Line centre - cannot do logaritmically!
    var gamma, logGamma, a, logA, voigt, core, wing, logWing, logVoigt;
    var Aij = Math.exp(logAij);
    var il = 36;
    //console.log("il " + il + " temp[il] " + temp[0][il] + " press[il] " + logE*press[1][il]);
    for (var id = 0; id < numDeps; id++) {

//Formula from p. 56 of Radiative Transfer in Stellar Atmospheres (Rutten),
// logarithmically with respect to solar value:
        logGamma = press[1][id] - pressSun[1][tau1] + 0.7 * (tempSun[1][tau1] - temp[1][id]) + logGammaSun;
        //logGamma = logGamma + logFudge + logGammaCol;
        logGamma = logGamma + logGammaCol;
   //Add radiation (natural) broadning:
        gamma = Math.exp(logGamma) + Aij;
        logGamma = Math.log(gamma); 
            //        if (id == 12){
            //console.log("LineGrid: logGamma: " + id + " " + logE * logGamma + " press[1][id] " + press[1][id] + " pressSun[1][tau1] "
            // + pressSun[1][tau1] + " temp[1][id] " + temp[1][id] + " tempSun[1][tau1] " + tempSun[1][tau1]);
            //     }

        //if (id == 16) {
        //    console.log("lam0In " + lam0In);
        //    console.log("tau1, press[1][id], pressSun[1][tau1], tempSun[1][tau1], temp[1][id], logGammaSun " +
         //           tau1 + " " + " " + logE*press[1][id] + " " + logE*pressSun[1][tau1] + " " + tempSun[1][tau1] + " " + temp[1][id] + " " + logE*logGammaSun);
        //    console.log("LineGrid: logGamma: " + id + " " + logE * logGamma);
       // }

        //Voigt "a" parameter with line centre wavelength:
        logA = 2.0 * logLam0 + logGamma - ln4pi - logC - logDopp;
        a = Math.exp(logA);
        //    if (id === 12) {
        //console.log("LineGrid: lam0 " + lam0 +  " logGam " + logE * logGamma + " logA " + logE * logA);
        //   }
        for (var il = 0; il < numPoints; il++) {

            v[il] = linePoints[1][il];
            //System.out.println("LineProf: il, v[il]: " + il + " " + v[il]);
            if (v[il] <= 2.0 && v[il] >= -2.0) {

// - Gaussian ONLY - at line centre Lorentzian will diverge!
                core = Math.exp(-1.0 * (v[il] * v[il]));
                voigt = core;
                //System.out.println("LINEGRID- CORE: core: " + core);

            } else {

                logV = Math.log(Math.abs(v[il]));
                //Gaussian core:
                core = Math.exp(-1.0 * (v[il] * v[il]));
            //if (id === 12) {
                //console.log("LINEGRID- WING: core: " + core);
             //   }
                //Lorentzian wing:
                logWing = logA - lnSqRtPi - (2.0 * logV);
                wing = Math.exp(logWing);
                voigt = core + wing;
                //voigt = core;  //debug
           // if (id === 12) {
            //    console.log("LINEGRID- WING: wing: " + wing + " logV " + logV);
             //}
            } // end else

//System.out.println("LINEGRID: il, v[il]: " + il + " " + v[il] + " lineProf[0][il]: " + lineProf[0][il]);
//System.out.println("LINEGRID: il, Voigt, H(): " + il + " " + voigt);
//Convert from H(a,v) in dimensionless voigt untis to physical phi(Delta almbda) profile 
            logVoigt = Math.log(voigt) + 2.0 * logLam0 - lnSqRtPi - logDopp - logC;
            lineProf[il][id] = Math.exp(logVoigt);
           // if (id === 12) {
                //console.log("lam0In " + lam0In);
            //    console.log("il " + il + " linePoints " + 1.0e7 * linePoints[0][il] + " id " + id + " lineProf[il][id] " + lineProf[il][id]);
           // }
        } // il lambda loop

    } //id loop


    return lineProf;
};

var voigt2 = function(linePoints, lam0In, Aij, logGammaCol,
        numDeps, teff, tauRos, temp, press,
        tempSun, pressSun) {

    var c = 2.9979249E+10; // light speed in vaccuum in cm/s
    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var logC = Math.log(c);
    var logK = Math.log(k);

    var lam0 = lam0In; // * 1.0E-7; //nm to cm
    var logLam0 = Math.log(lam0);
    var ln10 = Math.log(10.0);
    var ln2 = Math.log(2.0);
    var ln4pi = Math.log(4.0 * Math.PI);
    var lnSqRtPi = 0.5 * Math.log(Math.PI);
    var sqPi = Math.sqrt(Math.PI);

    var logE = logTen(Math.E); // for debug output

    var doppler = linePoints[0][1] / linePoints[1][1];
    var logDopp = Math.log(doppler);

    //System.out.println("LineProf: doppler, logDopp: " + doppler + " " + logE*logDopp);

    //Put input parameters into linear cgs units:
    //double gammaCol = Math.pow(10.0, logGammaCol);
    // Lorentzian broadening:
    // Assumes Van der Waals dominates radiative damping
    // log_10 Gamma_6 for van der Waals damping around Tau_Cont = 1 in Sun 
    //  - p. 57 of Radiative Transfer in Stellar Atmospheres (Rutten)
    var logGammaSun = 9.0 * ln10; // Convert to base e 
    //double logFudge = Math.log(2.5);  // Van der Waals enhancement factor

    //Get index of depth nearest to tauRos=1:
    var tau1 = tauPoint(numDeps, tauRos, 1.0);

    //System.out.println("LINEGRID: Tau1: " + tau1);
    //logA = 2.0 * logLam0 + logGamma - ln4pi - logC - logDopp;
    //a = Math.exp(logA);
    //System.out.println("LINEGRID: logA: " + logE * logA);
    //Set up a half-profile Delta_lambda grid in Doppler width units 
    //from line centre to wing
    var numPoints = linePoints[0].length;
    //double maxV = linePoints[1][numPoints - 1]; //maximum value of v in Doppler widths
    //System.out.println("LineProf: numPoints: " + numPoints);

    // Return a 2D numPoints X numDeps array of normalized line profile points (phi)
    var lineProf = [];
    lineProf.length = numPoints;
    //Must use the Array constructor here:
    for (var row = 0; row < numPoints; row++) {
        lineProf[row] = new Array(numDeps);
    }


    // Line profiel points in Doppler widths - needed for Voigt function, H(a,v):
    var v = [];
    v.length = numPoints;
    var logV, ii;

//        lineProf[0][0] = 0.0; v[0] = 0.0; //Line centre - cannot do logaritmically!
    var gamma, logGamma, a, logA, voigt, core, wing, logWing, logVoigt;
    var logAij = Math.log(Aij);

    //Variables for managing honest Voigt profile convolution:
    //Find value of damping a parameter around tauRos=1.0 for guidance:
    logGamma = press[1][tau1] - pressSun[1][tau1] + 0.7 * (tempSun[1][tau1] - temp[1][tau1]) + logGammaSun;
    logGamma = logGamma + logGammaCol + logAij;
    //Voigt "a" parameter in Doppler widths with line centre wavelength:
    logA = 2.0 * logLam0 + logGamma - ln4pi - logC - logDopp;
    a = Math.exp(logA);
    var yLim0, yLim2, nApprox, deltaY, yLimLower;
    var deltaYApprox = 0.2;
    //var deltaYApprox = 4.0;
    var numY0, numY1, numY2, numY;
    //yLim0 = Math.max(3.5 * a, 3.5); //"a" is characteristic width of Lorentizian in Doppler widths
    yLim0 = Math.max(a, 1.0); //"a" is characteristic width of Lorentizian in Doppler widths
    //CAUTION: integration variable, y, is in Doppler widths
    numY0 = Math.round(yLim0 / deltaYApprox);
    //System.out.println("a " + a + " yLim0 " + yLim0 + " numY0 " + numY0);
    yLim2 = Math.max(3.0 * a, 3.0); //"a" is characteristic width of Lorentizian
    numY2 = Math.round(yLim2 / deltaYApprox);
    var y, logNumerator, logDenominator, logDenomTerm1, logDenomTerm2, denomTerm1, denomTerm2;
    var integ, logInteg, logNextInteg, nextInteg, term;

    for (var id = 0; id < numDeps; id++) {

        //Formula from p. 56 of Radiative Transfer in Stellar Atmospheres (Rutten),
        // logarithmically with respect to solar value:
        logGamma = press[1][id] - pressSun[1][tau1] + 0.7 * (tempSun[1][tau1] - temp[1][id]) + logGammaSun;
        //logGamma = logGamma + logFudge + logGammaCol;
        logGamma = logGamma + logGammaCol;
        //System.out.println("LineGrid: logGamma: " + id + " " + logE * logGamma);

        //Voigt "a" parameter in Doppler widths with line centre wavelength:
        logA = 2.0 * logLam0 + logGamma - ln4pi - logC - logDopp;
        a = Math.exp(logA);

        //System.out.println("LineGrid: logGamma: " + id + " " + logE * logGamma + " " + logE * logA);
        //limits and sampling of integration variable y=(xi/c)*(lambda0/Doppler) (Rutten p. 59) - is this Doppler shift in Doppler widths?
        //Notes: the e^-y^2 numerator is even about y=0, BUT the ((v-y)^2 + a^2 denominator is even about y=v!
        //In the sum over y, the leading term according the numerator alone is always at y=0, 
        // BUT the leading term according to the denominator alone is always at y=v
        // --> Therefore the y integration range should always include both y=0 and y=v (for both +ve and -ve v)
        // --> Adapt y range to each v??
        // Can the y sampling be uniform???
        //int numY = 2 * (int) (yLim / deltaY);
        //System.out.println("numY " + numY);
//            int numY = 20; //I dunno - this is how many i want :-)
//            double deltaY = 2.0 * yLim / ((double) numY);
        //double yMin = -1.0 * yLim;
        //if (id === 30) {
        //    System.out.println("il   v[il]  iy   y   logNumerator   logDenominator   logInteg ");
        //    //System.out.println("voigt2:   v   logVoigt: ");
        //}
        //for (int il = 0; il < numPoints; il++) {
        //Negative half of profiel only - numPoints is always odd and symmetrical about lambda=lambda0
        for (var il = 0; il < (numPoints / 2) + 1; il++) {

            v[il] = linePoints[1][il];
            //System.out.println("LineProf: il, v[il]: " + il + " " + v[il]);
            if (Math.abs(v[il]) < deltaYApprox) {
                numY1 = 0;
                deltaY = deltaYApprox;
            } else {
                nApprox = -1.0 * v[il] / deltaYApprox; // -1.0* becasue we are only treating v<=0 half of profile
                numY1 = Math.round(nApprox);
                deltaY = -1.0 * v[il] / numY1;
            }
            yLimLower = v[il] - deltaY * numY0;
            //yLimUpper = deltaY * numY2; //Do we need this??

            //Total integration range is from yLimLower to v[il] to 0 to yLim:
            numY = numY0 + numY1 + numY2;
            var yLimUpper = yLimLower + numY * deltaY;
            // if (id === 2) {
            //     if (v[il] === -4.0) {
            //         System.out.println("il " + il + " v " + v[il] + " numY0 " + numY0 + " numY1 " + numY1 + " numY2 " + numY2 + " numY " + numY);
            //         System.out.println("il " + il + " v " + v[il] + " yLimLower " + yLimLower + " deltaY " + deltaY + " yLimUpper "
            //                 + yLimUpper);
            //    }
            // }
            voigt = 0.0;// re-initialize H(a,v):
            // loop over 
            //if (id === 35) {
            //    System.out.println("il " + il + " v " + v[il]);
            //}

            // Trapezoid integration: Compute integrand at first y point:
            y = yLimLower;
            logNumerator = -1.0 * y * y;
            logDenomTerm1 = 2.0 * Math.log(Math.abs(v[il] - y));
            logDenomTerm2 = 2.0 * logA;
            denomTerm1 = Math.exp(logDenomTerm1);
            denomTerm2 = Math.exp(logDenomTerm2);
            logDenominator = Math.log(denomTerm1 + denomTerm2);

            logInteg = logNumerator - logDenominator;
            integ = Math.exp(logInteg);

            for (var iy = 1; iy < numY; iy++) {

                y = (1.0 * iy) * deltaY + yLimLower;

                logNumerator = -1.0 * y * y;
                logDenomTerm1 = 2.0 * Math.log(Math.abs(v[il] - y));
                logDenomTerm2 = 2.0 * logA;
                denomTerm1 = Math.exp(logDenomTerm1);
                denomTerm2 = Math.exp(logDenomTerm2);
                logDenominator = Math.log(denomTerm1 + denomTerm2);

                logNextInteg = logNumerator - logDenominator;
                nextInteg = Math.exp(logNextInteg);
                //Trapezoid integration:
                term = 0.5 * (integ + nextInteg) * deltaY;

                // Rectangular pick integration for now:
                //Skip Lorentzian peak - it may be giving us too large a line opacity:
                if (Math.abs(v[il] - y) > 2.0 * deltaYApprox) {
                    voigt = voigt + term;
                    //voigt = voigt + integ * deltaY;
                }

                // if (id === 2) {
                //     if (v[il] === -4.0) {
                //         System.out.println("il, v[il], iy, y, logNumerator, logDenominator, logInteg");
                //         System.out.format("%02d   %12.8f  %02d   %12.8f   %12.8f   %12.8f   %12.8f%n", il, v[il], iy, y, logNumerator, logDenominator, logInteg);
                //         System.out.println("iy, y, logE*logInteg");
                //        System.out.format("%03d   %12.8f   %12.8f%n", iy, y, logE * logInteg);
                //    }
                // }
                //Only treating negative v half of profile, so Lorentzian denominator is always minimal at negative or zero y
                // --> If y > 0 be prepared to stop when contribution becomes negligible:
                //if (y > 0 && (term / voigt < 0.01)) {
                //     break;  //break out of iy loop
                //}
                integ = nextInteg;
            }  //iy loop

            //Pre-factor for H(a,v) integral
            logVoigt = Math.log(voigt) + logA - Math.log(Math.PI);

            //System.out.println("LINEGRID: il, v[il]: " + il + " " + v[il] + " lineProf[0][il]: " + lineProf[0][il]);
            //System.out.println("LINEGRID: il, Voigt, H(): " + il + " " + voigt);
            //Convert from H(a,v) in dimensionless Voigt units to physical phi((Delta lambda) profile:
            logVoigt = logVoigt + 2.0 * logLam0 - lnSqRtPi - logDopp - logC;
            //if (id === 35) {
            //    System.out.format("%12.8f   %12.8f%n", v[il], logE * logVoigt);
            //}
            lineProf[il][id] = Math.exp(logVoigt);

            //Copy over to positive half of profile - avoid doubling the central wavelength!
            if (il != ((numPoints - 1) - il)) {
                lineProf[(numPoints - 1) - il][id] = Math.exp(logVoigt);
            }
            //System.out.println("LineProf: il, id, lineProf[il][id]: " + il + " " + id + " " + lineProf[il][id]);
        } // il lambda loop

        //if (id === 20) {
        //    for (int il = 0; il < numPoints; il++) {
        //        System.out.format("Voigt2: %20.16f   %20.16f%n", linePoints[1][il], logE * Math.log(lineProf[il][id]));
        //    }
        //}
    } //id loop

    return lineProf;

};

// Make line source function:
// Equivalenth two-level atom (ETLA) approx
//CAUTION: input lambda in nm
var lineSource = function(numDeps, tau, temp, lambda) {

    var lineSource = [];
    lineSource.length = numDeps;

    //thermal photon creation/destruction probability
    var epsilon = 0.01; //should decrease with depth??

    //This is an artifact of jayBinner's original purpose:
    var grayLevel = 1.0;

    //int iLam0 = numLams / 2; //+/- 1 deltaLambda
    //double lam0 = linePoints[0][iLam0];  //line centre lambda in cm - not needed:
    //double lamStart = lambda - 0.1; // nm
    //double lamStop = lambda + 0.1; // nm
    //double lamRange = (lamStop - lamStart) * 1.0e-7; // line width in cm

    //System.out.println("lamStart " + lamStart + " lamStop " + lamStop + " lamRange " + lamRange);
    var jayLambda = [];
    jayLambda.length = numDeps;


    var BLambda = [];
    BLambda.length = 2;
    BLambda[0] = [];
    BLambda[1] = [];
    BLambda[0].length = numDeps;
    BLambda[1].length = numDeps;
    var linSrc;

    // Dress up Blambda to look like what jayBinner expects:
    for (var i = 0; i < numDeps; i++) {
        //Planck.planck return log(B_lambda):
        BLambda[0][i] = Math.exp(planck(temp[0][i], lambda));
        BLambda[1][i] = 1.0;  //supposed to be dB/dT, but not needed. 
    }

    //CAUTION: planckBin Row 0 is linear lambda-integrated B_lambda; Row 1 is same for dB_lambda/dT
    //planckBin = MulGrayTCorr.planckBinner(numDeps, temp, lamStart, lamStop);
    jayLambda = jayBinner(numDeps, tau, temp, BLambda, grayLevel);
    //To begin with, coherent scattering - we're not computing line profile-weighted average Js and Bs
    for (var i = 0; i < numDeps; i++) {

        //planckBin[0][i] = planckBin[0][i] / lamRange;  //line average
        //jayBin[i] = jayBin[i];  
        linSrc = (1.0 - epsilon) * jayLambda[i] + epsilon * BLambda[0][i];
        lineSource[i] = Math.log(linSrc);
    }

    return lineSource;
};



// **************************************

// Returns depth distribution of occupation numbers in lower level of b-b transition,
// and in ground states of neutral and singly ionized stages for reference

// Input parameters:
// lam0 - line centre wavelength in nm
// logNl - log_10 column density of absorbers in lower E-level, l (cm^-2)
// logFlu - log_10 oscillator strength (unitless)
// chiL - energy of lower atomic E-level of b-b transition in eV
// chiI - ground state ionization energy to niext higher stage in (ev)
//   - we are assuming this is the neutral stage
// Also needs atsmopheric structure information:
// numDeps
// tauRos structure
// temp structure 
// rho structure
/*
var levelPops = function(lam0In, logNlIn, Ne, ionized, chiI1, chiI2, chiL, gw1, gw2, gwL,
        numDeps, zScale, tauRos, temp, rho) {


    var c = 2.9979249E+10; // light speed in vaccuum in cm/s
    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var h = 6.62606957E-27; //Planck's constant in ergs sec
    var ee = 4.80320425E-10; //fundamental charge unit in statcoulombs (cgs)
    var mE = 9.10938291E-28; //electron mass (g)
//Conversion factors
    var eV = 1.602176565E-12; // eV in ergs

//Methods:
//Natural logs more useful than base 10 logs - Eg. Formal soln module: 
// Fundamental constants
    var logC = Math.log(c);
    var logK = Math.log(k);
    var logH = Math.log(h);
    var logEe = Math.log(ee); //Named so won't clash with log_10(e)
    var logMe = Math.log(mE);
//Conversion factors
    var logEv = Math.log(eV);


    var ln10 = Math.log(10.0);
    var logE = logTen(Math.E); // for debug output
    var log2pi = Math.log(2.0 * Math.PI);
    var log2 = Math.log(2.0);

    var logNl = logNlIn * ln10;  // Convert to base e
    var logKScale = Math.log(zScale);
    //console.log("levelPops: logKScale: " + logKScale);

    //Assume ground state statistical weight (or partition fn) of Stage III is 1.0;
    var logGw3 = 0.0;

    //For now:
    //double gw1 = 1.0;  //stat weight ground state of Stage I
    //double gw2 = 1.0;  //stat weight ground state of Stage II
    //double gwL = 1.0;  //stat weight lower E-level
    var gwU = 1.0;  //stat weight upper E-level 

    var logGw1 = Math.log(gw1);
    var logGw2 = Math.log(gw2);
    var logGwL = Math.log(gwL);
    var logGwU = Math.log(gwU);

    // If we need to subtract chiI from chiL, do so *before* converting to tiny numbers in ergs!
    if (ionized) {
        chiL = chiL - chiI1;
    }

    //chiI = chiI * eV;  // Convert lower E-level from eV to ergs
    chiI1 = chiI1 * eV;  // Convert lower E-level from eV to ergs
    chiI2 = chiI2 * eV;  // Convert lower E-level from eV to ergs

    //var boltzFacI = chiI / k; // Pre-factor for exponent of excitation Boltzmann factor
    var boltzFacI1 = chiI1 / k; // Pre-factor for exponent of ionization Boltzmann factor for ion stage I
    var boltzFacI2 = chiI2 / k; // Pre-factor for exponent of ionization Boltzmann factor for ion stage I
    //console.log("boltzFacI1 " + boltzFacI1 + " boltzFacI2 " + boltzFacI2 + " chiI1 " + chiI1 + " chiI2 " + chiI2);

    var logSahaFac = log2 + (3.0 / 2.0) * (log2pi + logMe + logK - 2.0 * logH);

    chiL = chiL * eV;  // Convert lower E-level from eV to ergs

    //Log of line-center wavelength in cm
    var logLam0 = Math.log(lam0In); // * 1.0e-7);

    // energy of b-b transition
    var logTransE = logH + logC - logLam0; //ergs
    // Energy of upper E-level of b-b transition
    var chiU = chiL + Math.exp(logTransE);  //ergs

    var boltzFacL = chiL / k; // Pre-factor for exponent of excitation Boltzmann factor
    var boltzFacU = chiU / k; // Pre-factor for exponent of excitation Boltzmann factor

    var boltzFacGround = 0.0 / k; //I know - its zero, but let's do it this way anyway'

    var refRhoIndx = tauPoint(numDeps, tauRos, 1.0);
    var refLogRho = rho[1][refRhoIndx];
    //System.out.println("LINEKAPPA: refRhoIndx, refRho " + refRhoIndx + " " + logE*refRho);

    // return a 2D 3 x numDeps array of logarithmic number densities
    // Row 0: neutral stage ground state population
    // Row 1: singly ionized stage ground state population
    // Row 2: level population of lower level of bb transition (could be in either stage I or II!) 
    // Row 3: level population of upper level of bb transition (could be in either stage I or II!) 
    // Row 4: doubly ionized stage ground state population
    var logNums = [];
    logNums.length = 5;
    for (var i = 0; i < logNums.length; i++) {
        logNums[i] = [];
        logNums[i].length = numDeps;
    }

    var num, logNum, expFac, logSaha, saha, logIonFracI, logIonFracII, logIonFracIII, logNumI, logNumII;
    var saha21, logSaha21, saha32, logSaha32;
    logNumI = 0.0;
    logNumII = 0.0;
    var logNe;

    for (var id = 0; id < numDeps; id++) {

        // reduce or enhance number density by over-all Rosseland opcity scale parameter
        logNum = logNl + logKScale;
       // if (id == 16) {
       //     console.log("lam0In " + lam0In);
        //    console.log("logNum 1 " + logE * logNum);
       // }
        // scale numer density by relative depth variation of mass density
        logNum = logNum + rho[1][id] - refLogRho;

        //// reduce number density by temperature-dependent factor of Saha equation:
        // Normalize wrt to solar Teff so we don't have to evaluate all the other stuff

        //Row 1 of Ne is log_e Ne in cm^-3
        logNe = Ne[1][id];
      //  if (id == 16) {
      //      console.log("lam0In " + lam0In);
       //     console.log("logNum 2 " + logE * logNum + " logNe " + logE * logNe + " rho[1][id] " + logE * rho[1][id] + " refLogRho " + logE * refLogRho);
       // }
        //
        // ********** Accounting for THREE ionization stages (I, II, III):
        //
        logSaha21 = logSahaFac - logNe - boltzFacI1 / temp[0][id] + (3.0 * temp[1][id] / 2.0) + logGw2 - logGw1; // log(RHS) of standard Saha equation
        saha21 = Math.exp(logSaha21);   //RHS of standard Saha equation
        logSaha32 = logSahaFac - logNe - boltzFacI2 / temp[0][id] + (3.0 * temp[1][id] / 2.0) + logGw3 - logGw2; // log(RHS) of standard Saha equation
        saha32 = Math.exp(logSaha32);   //RHS of standard Saha equation
        //System.out.println("logSahaFac, logNe, logSaha= " + logE*logSahaFac + " " + logE*logNe + " " + logE*logSaha);

        logIonFracII = logSaha21 - Math.log(1.0 + saha21 + saha32 * saha21); // log ionization fraction in stage II
        logIonFracI = -1.0 * Math.log(1.0 + saha21 + saha32 * saha21);     // log ionization fraction in stage I
        logIonFracIII = logSaha32 + logSaha21 - Math.log(1.0 + saha21 + saha32 * saha21); //log ionization fraction in stage III
        //if (id == 36) {
        //    console.log("logSaha21 " + logE*logSaha21 + " logSaha32 " + logE*logSaha32);
        //    console.log("IonFracII " + Math.exp(logIonFracII) + " IonFracI " + Math.exp(logIonFracI) + " logNe " + logE * logNe);
        //}

        // System.out.println("LevelPops: id, ionFracI, ionFracII: " + id + " " + Math.exp(logIonFracI) + " " + Math.exp(logIonFracII) );
        if (ionized) {
          //  console.log("LevPops: ionized branch taken, ionized =  " + ionized);

            logNums[0][id] = logNum + logIonFracI; // Ascribe entire neutral stage pop to its ground level
            logNumII = logNum + logIonFracII;
            logNums[1][id] = logNumII - boltzFacGround / temp[0][id] + logGw2; // ground level of ionized stage
            logNums[2][id] = logNumII - boltzFacL / temp[0][id] + logGwL - logGw2; // lower level of b-b transition
            logNums[3][id] = logNumII - boltzFacU / temp[0][id] + logGwU - logGw2; // upper level of b-b transition

        } else {
          //  console.log("LevPops: neutral branch taken, ionized =  " + ionized);

            logNumI = logNum + logIonFracI;
            logNums[0][id] = logNumI - boltzFacGround / temp[0][id] + logGw1;  // ground level of neutral stage
            logNums[1][id] = logNum + logIonFracII; // Ascribe entire ionized stage pop to its ground level
            logNums[2][id] = logNumI - boltzFacL / temp[0][id] + logGwL - logGw1; // lower level of b-b transition
            logNums[3][id] = logNumI - boltzFacU / temp[0][id] + logGwU - logGw1; // upper level of b-b transition

        }

        logNums[4][id] = logNum + logIonFracIII; // Ascribe entire doubly ionized stage pop to its ground level        

       // if (id == 16) {
         //   console.log("lam0In " + lam0In);
           // console.log("LevelPops: id, logNums[0][id], logNums[1][id], logNums[2][id], logNums[3][id], logNums[4][id]: " + id + " "
           //         + logE * (logNums[0][id]) + " "
           //         + logE * (logNums[1][id]) + " "
           //         + logE * (logNums[2][id]) + " "
           //         + logE * (logNums[3][id]) + " "
           //         + logE * (logNums[4][id]));
        //}

    } //id loop

    return logNums;
};
*/

// Assumes CRD, LTE, ???
// Input parameters:
// lam0 - line centre wavelength in nm
// logNl - log_10 column density of absorbers in lower E-level, l (cm^-2)
// logFlu - log_10 oscillator strength (unitless)
// chiL - energy of lower atomic E-level of b-b transition in eV
// chiI - ground state ionization energy to niext higher stage in (ev)
//
//   //     * PROBLEM: line kappaL values converted to mass extinction by division by rho() are 
// * not consistent with fake Kramer's Law based scaling of kappa_Ros with g.
//*   Try leaving kappaLs as linear extinctions and converting the scaled kappa_Ros back to linear units
// * with solar rho() in LineTau2
// 
// Also needs atsmopheric structure information:
// numDeps
// tauRos structure
// temp structure 
// rho structure
//var lineKap = function(lam0In, logNlIn, logFluIn, ionized, chiI, chiL, linePoints, lineProf,
//        numDeps, zScale, tauRos, temp, rho) {
// Level population now computed in LevelPops.levelPops():
var lineKap = function(lam0In, logNums, logFluIn, linePoints, lineProf,
        numDeps, zScale, tauRos, temp, rho) {

    var c = 2.9979249E+10; // light speed in vaccuum in cm/s
    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var h = 6.62606957E-27; //Planck's constant in ergs sec
    var ee = 4.80320425E-10; //fundamental charge unit in statcoulombs (cgs)
    var mE = 9.10938291E-28; //electron mass (g)
    var eV = 1.602176565E-12; // eV in ergs
    var logC = Math.log(c);
    var logK = Math.log(k);
    var logH = Math.log(h);
    var logEe = Math.log(ee); //Named so won't clash with log_10(e)
    var logMe = Math.log(mE);

    var ln10 = Math.log(10.0);
    var logE = logTen(Math.E); // for debug output
    var log2pi = Math.log(2.0 * Math.PI);
    var log2 = Math.log(2.0);

    var lam0 = lam0In; // * 1.0E-7; //nm to cm
    var logLam0 = Math.log(lam0);
    //var logNl = logNlIn * ln10;  // Convert to base e
    var logFlu = logFluIn * ln10; // Convert to base e
    var logKScale = Math.log(zScale);
    //console.log("lineKap: logKScale: " + logKScale);

    // chiI = chiI * eV;  // Convert lower E-level from eV to ergs
    // var boltzFacI = chiI / k; // Pre-factor for exponent of excitation Boltzmann factor
//
    // var logSahaFac = log2 + (3.0 / 2.0) * (log2pi + logMe + logK - 2.0 * logH);
//
    //chiL = chiL * eV;  // Convert lower E-level from eV to ergs
    // var boltzFac = chiL / k; // Pre-factor for exponent of excitation Boltzmann factor

    var numPoints = linePoints[0].length;
    //System.out.println("LineKappa: numPoints: " + numPoints);

    var logPreFac;
    //This converts f_lu to a volume extinction coefficient per particle - Rutten, p. 23
    logPreFac = logFlu + Math.log(Math.PI) + 2.0 * logEe - logMe - logC;
    //System.out.println("LINEKAPPA: logPreFac " + logPreFac);

    //Assume wavelength, lambda, is constant throughout line profile for purpose
    // of computing the stimulated emission correction
    var logExpFac;
    logExpFac = logH + logC - logK - logLam0;
    //System.out.println("LINEKAPPA: logExpFac " + logExpFac);

    // var refRhoIndx = tauPoint(numDeps, tauRos, 1.0);
    // var refLogRho = rho[1][refRhoIndx];
    //System.out.println("LINEKAPPA: refRhoIndx, refRho " + refRhoIndx + " " + logE*refRho);

    // return a 2D numPoints x numDeps array of monochromatic extinction line profiles
    var logKappaL = [];
    logKappaL.length = numPoints;
    //Must use Array constructor here:
    for (var row = 0; row < numPoints; row++) {
        logKappaL[row] = new Array(numDeps);
    }
    //double[][] logKappaL = new double[numPoints][numDeps];

    var num, logNum, logExpFac2, expFac, stimEm, logStimEm, logSaha, saha, logIonFrac;
    var logNe;

    for (var id = 0; id < numDeps; id++) {

        logExpFac2 = logExpFac - temp[1][id];
        expFac = -1.0 * Math.exp(logExpFac2);

        stimEm = 1.0 - Math.exp(expFac);
        logStimEm = Math.log(stimEm);

        // logNums is a 2D 3 x numDeps array of logarithmic number densities
        // Row 0: neutral stage ground state population
        // Row 1: ionized stage ground state population
        // Row 2: level population of lower level of bb transition (could be in either stage I or II!) 
        // Row 3: level population of upper level of bb transition (could be in either stage I or II!) 
        logNum = logNums[2][id];

        //if (id === refRhoIndx) {
        //    System.out.println("LINEKAPPA: logStimEm " + logE*logStimEm);
        //}
        for (var il = 0; il < numPoints; il++) {

            // From Radiative Transfer in Stellar Atmospheres (Rutten), p.31
            // This is a *volume* co-efficient ("alpha_lambda") in cm^-1:
            logKappaL[il][id] = logPreFac + logStimEm + logNum + Math.log(lineProf[il][id]);

            //if (id == 36) {
            //    console.log("il " + il + " logNum " + logE*logNum + " Math.log(lineProf[il][id]) " + logE*Math.log(lineProf[il][id]));
            //    ////    console.log("logPreFac " + logPreFac + " logStimEm " + logStimEm);
            //}

            //console.log("LineKap: il, id: " + il + " " + id + " logPreFac " + logE*logPreFac + " logStimEm " + logE*logStimEm + 
            //        " logNum " + logE*logNum + " lineProf " + logE * Math.log(lineProf[il][id]));

            //Convert to mass co-efficient in g/cm^2:          
            // This direct approach won't work - is not consistent with fake Kramer's law scaling of Kapp_Ros with g instead of rho
            logKappaL[il][id] = logKappaL[il][id] - rho[1][id];
            //var refRhoIndx = 16;
          //  if (id == 12) {
           //     console.log("LINEKAPPA: id, il " + id + " " + il + " logKappaL " + logE * logKappaL[il][id]
            //            + " logPreFac " + logE * logPreFac + " logStimEm " + logE * logStimEm + " logNum " + logE * logNum
             //           + " log(lineProf[il]) " + logE * Math.log(lineProf[il][id]) + " rho[1][id] " + logE * rho[1][id]);
           //  }
            //if (id === 36) {
            //    console.log("il " + il + " linePoints[0][il] " + 1.0e7*linePoints[0][il] + " id " + id + " logKappaL " + logE*logKappaL[il][id]);
            //}
        } // il - lambda loop

    } // id - depth loop

    return logKappaL;

};

//Create total extinction throughout line profile:
var lineTotalKap = function(linePoints, logKappaL,
        numDeps, kappa, numPoints, numLams, lambdaScale) {

    var logE = logTen(Math.E); // for debug output

    // return a 2D numPoints x numDeps array of monochromatic *TOTAL* extinction line profiles
    // return a 2D numPoints x numDeps array of monochromatic extinction line profiles
    var logTotKappa = [];
    logTotKappa.length = numPoints;
    //Must use Array constructor here:
    for (var row = 0; row < numPoints; row++) {
        logTotKappa[row] = [];
        logTotKappa[row].length = numDeps;
    }
    //double[][] logTotKappa = new double[numPoints][numDeps];

//Interpolate continuum opacity onto onto line-blanketed opacity lambda array:
        var kappaC = [];
        kappaC.length = numLams;
        var kappaC2 = [];
        kappaC2.length = numPoints;
        var kappa2 = [];
        kappa2.length = numPoints;
        for (var i = 0; i < numPoints; i++){
           kappa2[i] = [];
           kappa2[i].length = numDeps;
        }
        for (var id = 0; id < numDeps; id++) {
           for (var il = 0; il < numLams; il++) {
              kappaC[il] = kappa[il][id];
              //if (id == 36){
                //console.log("il " + il + " lambdaScale " + lambdaScale[il] + " kappaC[il] " + kappaC[il]);
              //}
           }
           kappaC2 = interpolV(kappaC, lambdaScale, linePoints);
           for (var il = 0; il < numPoints; il++){
              kappa2[il][id] = kappaC2[il];
              //if (id == 36){
                //console.log("il " + il + " linePoints " + linePoints[il] + " kappaC2[il] " + kappaC2[il]);
              //}
           }
        } // id loop


    var kappaL;

    for (var id = 0; id < numDeps; id++) {
        for (var il = 0; il < numPoints; il++) {
            //Both kappaL and kappa (continuum) are *mass* extinction (cm^2/g) at thsi point: 
            //kappaL = Math.exp(logKappaL[il][id]) + kappa[0][id];
            kappaL = Math.exp(logKappaL[il][id]) + Math.exp(kappa2[il][id]);
            logTotKappa[il][id] = Math.log(kappaL);
            //if (id === 36) {
            //console.log("il " + il + " linePoints[il] " + 1.0e7*linePoints[il] + " logKappaL[il][id] " + logE*logKappaL[il][id] + " kappa2[il][id] " + logE*kappa2[il][id]);
            //}
        }
    }

    return logTotKappa;

};

/**
 * Method 2: Compute monochromatic tau scales by re-scaling from Tau_Ross -
 * PROBLEM: the approximate, scaled solar kappa_Ros values are not consistent
 * with the prescribed Tau_Ros values HOWEVER: this method removes dependence on
 * the flaky depth scale calculation and vulnerability to low rho value at the
 * surface 
 * 
 * Compute the monochromatic optical depth scale, tau_lambda, at each
 * lambda across the line profile 
 * Also computes line centre Continuum
 * monochromatic optical dpeth scale for continuum rectification And stores it
 * in array element numPoints+1 This may differ from the prescribed Tau_Ross
 * because kappa_Ross was NOT computed consistently with it 
 * 
 * * PROBLEM: line kappaL values converted to mass extinction by division by rho()
 * are not consistent with fake Kramer's Law based scaling of kappa_Ros with g.
 * Try leaving kappaLs as linear extinctions and converting the scaled kappa_Ros
 * back to linear units with solar rho()
 * 
 * Inputs: lineGrid -only neded for row 0 - wavelengths logKappaL - monochromatic line extinction
 * co-efficients kappa - we need the background continuum extinction
 * co-efficients, too!
 */
var tauLambda = function(numDeps, numPoints, logKappaL,
        kappa, tauRos, numLams, lambdaScale, lambdaPoints) {

    //No monochromatic optical depth can be less than the Rosseland optical depth,
    // so prevent zero tau_lambda values by setting each tau_lambda(lambda) at the 
    //top of the atmosphere to the tau_Ross value at the top 
    // - prevents trying to take a log of zero!
    var logE = logTen(Math.E); // for debug output
    var minTauL = tauRos[0][0];
    var minLogTauL = tauRos[1][0];

    //var numPoints = linePoints[0].length;

    // returns numPoints+1 x numDeps array: the numPoints+1st row holds the line centre continuum tau scale
    var logTauL = [];
    logTauL.length = numPoints + 1;
    //Must use Array constructor here:
    for (var row = 0; row < numPoints + 1; row++) {
        logTauL[row] = [];
        logTauL[row].length = numDeps;
    }

    var tau1, tau2, delta, tauL,
            integ, logKapRat, logKappaC, lastLogKapRat;

//Interpolate continuum opacity onto onto line-blanketed opacity lambda array:
        var kappaC = [];
        kappaC.length = numLams;
        var kappaC2 = [];
        kappaC2.length = numPoints;
        var kappa2 = [];
        kappa2.length = numPoints;
        for (var i = 0; i < numPoints; i++){
           kappa2[i] = [];
           kappa2[i].length = numDeps;
        }
        for (var id = 0; id < numDeps; id++) {
           for (var il = 0; il < numLams; il++) {
    //         console.log("id " + id + " il " + il + " kappa[il][id] " + kappa[il][id]);
              kappaC[il] = kappa[il][id];
           }
           kappaC2 = interpolV(kappaC, lambdaScale, lambdaPoints);
           for (var il = 0; il < numPoints; il++){
              kappa2[il][id] = kappaC2[il];
           }
        }


    for (var il = 0; il < numPoints; il++) {

        tau1 = minTauL; //initialize accumulator
        logTauL[il][0] = minLogTauL; // Set upper boundary TauL           

        //System.out.println("LineTau: minTauL: " + minTauL);
        //
        //Trapezoid method: first integrand:
        //total extinction co-efficient

        // Convert kappa_Ros to cm^-1 for consistency with kappaL:
        //logKappaC = kappa[1][0] + rhoSun[1][0];
        //logKappaC = kappa[1][0];

        //delta = tauRos[0][1] - tauRos[0][0];
        //logKapRat = logKappaL[il][0] - kappa[1][0];
        //console.log(" il " + il + " logKappaL[il][0] " + logKappaL[il][0] + " kappa2[il][0] " + kappa2[il][0]);
        //lastLogKapRat = logKappaL[il][0] - logKappaC;
        lastLogKapRat = logKappaL[il][0] - kappa2[il][0];

        //tau2 = tau1 + ((Math.exp(logKapRat) + 1.0) * delta);
        //opacity being handed in is now total oppcity: line plux continuum:
        //tau2 = tau1 + (Math.exp(logKapRat) * delta);

        //logTauL[il][1] = Math.log(tau2);
        //tau1 = tau2;

        for (var id = 1; id < numDeps; id++) {


            // To test: continue with Euler's method:

            // Convert kappa_Ros to cm^-1 for consistency with kappaL:
            //logKappaC = kappa[1][id] + rhoSun[1][id];
            //logKappaC = kappa[1][id];

            delta = tauRos[0][id] - tauRos[0][id - 1];
            //logKapRat = logKappaL[il][id] - kappa[1][id];
            //logKapRat = logKappaL[il][id] - logKappaC;
            logKapRat = logKappaL[il][id] - kappa2[il][id];

            //tau2 = tau1 + ((Math.exp(logKapRat) + 1.0) * delta);
            //opacity being handed in is now total oppcity: line plux continuum:
            integ = 0.5 * (Math.exp(logKapRat) + Math.exp(lastLogKapRat));
            tau2 = tau1 + (integ * delta);
            //tau2 = tau1 + (Math.exp(logKapRat) * delta);

            logTauL[il][id] = Math.log(tau2);
            tau1 = tau2;
            lastLogKapRat = logKapRat;

           // if (id === 12) {
            //    console.log("il " + il + " id " + id + " logTauL[il][id] " + logE * logTauL[il][id]);
             //console.log("tauLambda: il, id, lambdaPoints, logKappaL, logKappa2, logKapRat, logTauL : " 
              //   + il + " " + id + " " + lambdaPoints[il] + " " + logE*logKappaL[il][id] + " " + logE*kappa2[il][id] + " " + logE*logKapRat + " " + logE*logTauL[il][id] );
           // }

        } //id loop

    } //il loop
    /* No!
     //This is probably superfluous here, but let's do it this way for consistency with code that was
     // dependent on Method 1:
     //Now compute the monochromatic line centre continuum optical depth scale and store it in an numPoints+1st column of
     // logTauL array:
     for (var id = 0; id < numDeps; id++) {
     
     logTauL[numPoints][id] = tauRos[1][id];
     
     }
     */
    return logTauL;

};

/**
 *
 * Create master kappa_lambda(lambda) and tau_lambda(lambda) for
 * FormalSoln.formalSoln()
 *
 * @author Ian
 */

//Merge comntinuum and line wavelength scales - for one line
//This expects *pure* line opacity - no continuum opacity pre-added!
var masterLambda = function(numLams, numMaster, numNow, masterLams, numPoints, listLineLambdas) {
    //                                 

    //int numCnt = lambdaScale.length;
    //skip the last wavelength point in the line lambda grid - it holds the line centre wavelength
    //int numLine = lineLambdas.length - 1;

    var numTot = numNow + numPoints; //current dynamic total

    //System.out.println("numCnt " + numCnt + " numLine " + numLine + " numTot " + numTot);
    /*
     for (int i = 0; i < numCnt; i++) {
     System.out.println("i " + i + " lambdaScale[i] " + lambdaScale[i]);
     }
     for (int i = 0; i < numLine; i++) {
     System.out.println("i " + i + " lineLambdas[i] " + lineLambdas[i]);
     }
     */
    //Row 0 is merged lambda scale
    //Row 1 is log of *total* (line plus continuum kappa
    var masterLamsOut = [];
    masterLamsOut.length = numTot;

    // Merge wavelengths into a sorted master list
    //initialize with first continuum lambda:
    var lastLam = masterLams[0];
    masterLamsOut[0] = masterLams[0];
    var nextCntPtr = 1;
    var nextLinePtr = 0;
    for (var iL = 1; iL < numTot; iL++) {
        if (nextCntPtr < numNow) {
            //System.out.println("nextCntPtr " + nextCntPtr + " lambdaScale[nextCntPtr] " + lambdaScale[nextCntPtr]);
            //System.out.println("nextLinePtr " + nextLinePtr + " lineLambdas[nextLinePtr] " + lineLambdas[nextLinePtr]);
            if ((masterLams[nextCntPtr] < listLineLambdas[nextLinePtr])
                    || (nextLinePtr >= numPoints - 1)) {
                //Next point is a continuum point:
                masterLamsOut[iL] = masterLams[nextCntPtr];
                nextCntPtr++;

            } else if ((listLineLambdas[nextLinePtr] < masterLams[nextCntPtr])
                    && (nextLinePtr < numPoints - 1)) {
                //Next point is a line point:
                masterLamsOut[iL] = listLineLambdas[nextLinePtr];
                nextLinePtr++;

            }
        }
        //System.out.println("iL " + iL + " masterLamsOut[iL] " + masterLamsOut[iL]);
    } //iL loop
    //Make sure final wavelength point in masterLams is secured:
    masterLamsOut[numTot - 1] = masterLams[numNow - 1];

    return masterLamsOut;
};

var masterKappa = function(numDeps, numLams, numMaster, numNow, masterLams, masterLamsOut, logMasterKaps, numPoints, listLineLambdas, listLogKappaL) {
//                                          
    var logE = logTen(Math.E); // for debug output

    //int numLams = masterLams.length;
    var numTot = numNow + numPoints;

    var logMasterKapsOut = [];
    logMasterKapsOut.length = numTot;
    //Must use Array constructor here:
    for (var i = 0; i < numTot; i++) {
        logMasterKapsOut[i] = [];
        logMasterKapsOut[i].length = numDeps;
    }
    //double[][] kappa2 = new double[2][numTot];
    //double[][] lineKap2 = new double[2][numTot];
    var kappa2, lineKap2, totKap;
    lineKap2 = 1.0e-49; //initialization

    //int numCnt = lambdaScale.length;
    //int numLine = lineLambdas.length - 1;
    var kappa1D = [];
    kappa1D.length = numNow;
    var lineKap1D = [];
    lineKap1D.length = numPoints;
    //console.log("iL   masterLams    logMasterKappa");
    for (var iD = 0; iD < numDeps; iD++) {

        //Extract 1D *linear* opacity vectors for interpol()
        for (var k = 0; k < numNow; k++) {
            kappa1D[k] = Math.exp(logMasterKaps[k][iD]); //actually wavelength independent - for now
        }

        for (var k = 0; k < numPoints; k++) {
            lineKap1D[k] = Math.exp(listLogKappaL[k][iD]);
        }

        //Interpolate continuum and line opacity onto master lambda scale, and add them lambda-wise:
        for (var iL = 0; iL < numTot; iL++) {
            kappa2 = interpol(masterLams, kappa1D, masterLamsOut[iL]);
            lineKap2 = 1.0e-49; //re-initialization
            if ((masterLamsOut[iL] >= listLineLambdas[0]) && (masterLamsOut[iL] <= listLineLambdas[numPoints - 1])) {
                lineKap2 = interpol(listLineLambdas, lineKap1D, masterLamsOut[iL]);
                //lineKap2 = 1.0e-99;  //test
            }
            //test lineKap2 = 1.0e-99;  //test
            totKap = kappa2 + lineKap2;
            logMasterKapsOut[iL][iD] = Math.log(totKap);
           // if (iD === 36) {
            //    console.log("iL " + iL + " masterLamsOut " + masterLamsOut[iL] + " lineKap2 " + logE*Math.log(lineKap2) 
             //    + " kappa2 " + logE*Math.log(kappa2) 
              //   + " lineKap/kappa " + logE*(Math.log(lineKap2)-Math.log(kappa2)));
            //}
        }
    }

    return logMasterKapsOut;
};




 // Returns depth distribution of occupation numbers in lower level of b-b transition,

// Input parameters:
// lam0 - line centre wavelength in nm
// logNStage - log_e density of absorbers in relevent ion stage (cm^-3)
// logFlu - log_10 oscillator strength (unitless)
// chiL - energy of lower atomic E-level of b-b transition in eV
// Also needs atsmopheric structure information:
// numDeps
// tauRos structure
// temp structure 
// rho structure

    var levelPops = function(lam0In, logNStage, chiL, log10UwStage, 
                    gwL, numDeps, temp) {


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

        var ln10 = Math.log(10.0);
        var logE = logTen(Math.E); // for debug output
        var log2pi = Math.log(2.0 * Math.PI);
        var log2 = Math.log(2.0);

        //double logNl = logNlIn * ln10;  // Convert to base e


// Parition functions passed in are 2-element vectore with remperature-dependent base 10 log Us
// Convert to natural logs:
        var thisLogUw, Ttheta;
        thisLogUw = 0.0; //default initialization
        var logUw = [];  
        logUw.length = 2;
        var logE10 = Math.log(10.0);
        logUw[0] = logE10*log10UwStage[0];
        logUw[1] = logE10*log10UwStage[1];
        var logGwL = Math.log(gwL);

        //System.out.println("chiL before: " + chiL);
        // If we need to subtract chiI from chiL, do so *before* converting to tiny numbers in ergs!
        ////For testing with Ca II lines using gS3 internal line list only:
        //boolean ionized = true;
        //if (ionized) {
        //    //System.out.println("ionized, doing chiL - chiI: " + ionized);
        //    //         chiL = chiL - chiI;
        //             chiL = chiL - 6.113;
        //          }
         //   //

        var logChiL = Math.log(chiL) + logEv;
        //chiL = chiL * eV;  // Convert lower E-level from eV to ergs

        //Log of line-center wavelength in cm
        var logLam0 = Math.log(lam0In); // * 1.0e-7);

        // energy of b-b transition
        var logTransE = logH + logC - logLam0; //ergs

        var logBoltzFacL = logChiL - logK;
        var boltzFacL = Math.exp(logBoltzFacL);
        //var boltzFacL = chiL / k; // Pre-factor for exponent of excitation Boltzmann factor

        var boltzFacGround = 0.0 / k; //I know - its zero, but let's do it this way anyway'


        // return a 1D numDeps array of logarithmic number densities
        // level population of lower level of bb transition (could be in either stage I or II!) 
        var logNums = []; 
        logNums.length = numDeps;

        var num, logNum, expFac;

        for (var id = 0; id < numDeps; id++) {


//Determine temeprature dependenet aprtition functions Uw:
        Ttheta = 5040.0 / temp[0][id];

        if (Ttheta >= 1.0){
            thisLogUw = logUw[0];
        }
        if (Ttheta <= 0.5){
            thisLogUw = logUw[1];
        }
        if (Ttheta > 0.5 && Ttheta < 1.0){
            thisLogUw = 0.5 * (Ttheta - 0.5) * logUw[1]
                + 0.5 * (1.0 - Ttheta) * logUw[0];
        }

                //System.out.println("LevPops: ionized branch taken, ionized =  " + ionized);
// Take stat weight of ground state as partition function:
                logNums[id] = logNStage[id] - boltzFacL / temp[0][id] + logGwL - thisLogUw; // lower level of b-b transition
                //System.out.println("LevelPopsServer.stagePops id " + id + " logNStage[id] " + logNStage[id] + " boltzFacL " + boltzFacL + " temp[0][id] " + temp[0][id] + " logGwL " + logGwL + " logGwStage " + logGwStage + " logNums[id] " + logNums[id]);

            // System.out.println("LevelPops: id, logNums[0][id], logNums[1][id], logNums[2][id], logNums[3][id]: " + id + " "
            //          + Math.exp(logNums[0][id]) + " "
            //         + Math.exp(logNums[1][id]) + " "
            //          + Math.exp(logNums[2][id]) + " "
            //        + Math.exp(logNums[3][id]));
            //System.out.println("LevelPops: id, logNums[0][id], logNums[1][id], logNums[2][id], logNums[3][id], logNums[4][id]: " + id + " "
            //        + logE * (logNums[0][id]) + " "
            //        + logE * (logNums[1][id]) + " "
            //        + logE * (logNums[2][id]) + " "
            //        + logE * (logNums[3][id]) + " "
            //        + logE * (logNums[4][id]) );
            //System.out.println("LevelPops: id, logIonFracI, logIonFracII: " + id + " " + logE*logIonFracI + " " + logE*logIonFracII
            //        + "logNum, logNumI, logNums[0][id], logNums[1][id] "
            //        + logE*logNum + " " + logE*logNumI + " " + logE*logNums[0][id] + " " + logE*logNums[1][id]);
            //System.out.println("LevelPops: id, logIonFracI: " + id + " " + logE*logIonFracI
            //        + "logNums[0][id], boltzFacL/temp[0][id], logNums[2][id]: " 
            //        + logNums[0][id] + " " + boltzFacL/temp[0][id] + " " + logNums[2][id]);
        } //id loop

        return logNums;
    }; //end method levelPops    
    

 // Returns depth distribution of ionization stage populations,

// Input parameters:
// logNum - array with depth-dependent total element number densities (cm^-3) 
// chiI1 - ground state ionization energy of neutral stage 
// chiI2 - ground state ionization energy of singly ionized stage 
// Also needs atsmopheric structure information:
// numDeps
// temp structure 
// rho structure

    var stagePops = function(logNum, Ne, chiI1, chiI2, chiI3, chiI4,
            log10Uw1, log10Uw2, log10Uw3, log10Uw4, 
            numDeps, temp) {

   //console.log("In stagePops()");

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


        var ln10 = Math.log(10.0);
        var logE = logTen(Math.E); // for debug output
        var log2pi = Math.log(2.0 * Math.PI);
        var log2 = Math.log(2.0);

        //double logNl = logNlIn * ln10;  // Convert to base e

        //Assume ground state statistical weight (or partition fn) of Stage III is 1.0;
        var logGw5 = 0.0;

        //double logUw1 = Math.log(uw1);
        //double logUw2 = Math.log(uw2);
        //double logUw3 = Math.log(uw3);
        //double logUw4 = Math.log(uw4);

// Parition functions passed in are 2-element vectore with remperature-dependent base 10 log Us
// Convert to natural logs:
        var thisLogUw1, thisLogUw2, thisLogUw3, thisLogUw4, Ttheta;
  //Default initializations:
        thisLogUw1 = 0.0;
        thisLogUw2 = 0.0;
        thisLogUw3 = 0.0;
        thisLogUw4 = 0.0;
        var logUw1 = []; 
        logUw1.length = 2;
        var logUw2 = []; 
        logUw2.length = 2;
        var logUw3 = []; 
        logUw3.length = 2;
        var logUw4 = []; 
        logUw4.length = 2;
        var logE10 = Math.log(10.0);
        logUw1[0] = logE10*log10Uw1[0];
        logUw1[1] = logE10*log10Uw1[1];
        logUw2[0] = logE10*log10Uw2[0];
        logUw2[1] = logE10*log10Uw2[1];
        logUw3[0] = logE10*log10Uw3[0];
        logUw3[1] = logE10*log10Uw3[1];
        logUw4[0] = logE10*log10Uw4[0];
        logUw4[1] = logE10*log10Uw4[1];

        //System.out.println("chiL before: " + chiL);
        // If we need to subtract chiI from chiL, do so *before* converting to tiny numbers in ergs!

        var logChiI1 = Math.log(chiI1) + logEv;
        var logChiI2 = Math.log(chiI2) + logEv;
        var logChiI3 = Math.log(chiI3) + logEv;
        var logChiI4 = Math.log(chiI4) + logEv;

        //chiI1 = chiI1 * eV;  // Convert lower E-level from eV to ergs
        //chiI2 = chiI2 * eV;  // Convert lower E-level from eV to ergs
        //chiI3 = chiI3 * eV;  // Convert lower E-level from eV to ergs
        //chiI4 = chiI4 * eV;  // Convert lower E-level from eV to ergs

        var logBoltzFacI1 = logChiI1 - logK;
        var logBoltzFacI2 = logChiI2 - logK;
        var logBoltzFacI3 = logChiI3 - logK;
        var logBoltzFacI4 = logChiI4 - logK;
        var boltzFacI1 = Math.exp(logBoltzFacI1); 
        var boltzFacI2 = Math.exp(logBoltzFacI2); 
        var boltzFacI3 = Math.exp(logBoltzFacI3); 
        var boltzFacI4 = Math.exp(logBoltzFacI4); 

        //var boltzFacI1 = chiI1 / k; // Pre-factor for exponent of ionization Boltzmann factor for ion stage I
        //var boltzFacI2 = chiI2 / k; // Pre-factor for exponent of ionization Boltzmann factor for ion stage II
        //var boltzFacI3 = chiI3 / k; // Pre-factor for exponent of ionization Boltzmann factor for ion stage III
        //var boltzFacI4 = chiI4 / k; // Pre-factor for exponent of ionization Boltzmann factor for ion stage IV
        //System.out.println("boltzFacI1 " + boltzFacI1 + " boltzFacI2 " + boltzFacI2 + " chiI1 " + chiI1 + " chiI2 " + chiI2);

        var logSahaFac = log2 + (3.0 / 2.0) * (log2pi + logMe + logK - 2.0 * logH);


        // return a 2D 5 x numDeps array of logarithmic number densities
        // Row 0: neutral stage ground state population
        // Row 1: singly ionized stage ground state population
        // Row 2: doubly ionized stage ground state population        
        // Row 3: triply ionized stage ground state population        
        // Row 4: quadruply ionized stage ground state population        
        var logNums = [];
        logNums.length = 5;
        for (var i = 0; i < 5; i++){
           logNums[i] = [];
           logNums[i].length = numDeps;
        }

        var num, expFac, logSaha, saha, logIonFracI, logIonFracII, logIonFracIII, logIonFracIV, logIonFracV;  
        var saha21, logSaha21, saha32, logSaha32, saha43, logSaha43, saha54, logSaha54;
        var logNe;

        for (var id = 0; id < numDeps; id++) {

            //// reduce or enhance number density by over-all Rosseland opcity scale parameter
            //logNum = logNl + logKScale;
//
            //Row 1 of Ne is log_e Ne in cm^-3
            logNe = Ne[1][id];

//Determine temeprature dependenet aprtition functions Uw:
    Ttheta = 5040.0 / temp[0][id];

       if (Ttheta >= 1.0){
           thisLogUw1 = logUw1[0];
           thisLogUw2 = logUw2[0];
           thisLogUw3 = logUw3[0];
           thisLogUw4 = logUw4[0];
       }
       if (Ttheta <= 0.5){
           thisLogUw1 = logUw1[1];
           thisLogUw2 = logUw2[1];
           thisLogUw3 = logUw3[1];
           thisLogUw4 = logUw4[1];
       }
       if (Ttheta > 0.5 && Ttheta < 1.0){
           thisLogUw1 = 0.5 * (Ttheta - 0.5) * logUw1[1]
               + 0.5 * (1.0 - Ttheta) * logUw1[0];
           thisLogUw2 = 0.5 * (Ttheta - 0.5) * logUw2[1]
               + 0.5 * (1.0 - Ttheta) * logUw2[0];
           thisLogUw3 = 0.5 * (Ttheta - 0.5) * logUw3[1]
               + 0.5 * (1.0 - Ttheta) * logUw3[0];
           thisLogUw4 = 0.5 * (Ttheta - 0.5) * logUw4[1]
               + 0.5 * (1.0 - Ttheta) * logUw4[0];
       }
       //System.out.println("thisLogUw1, ... thisLogUw4 " + logE*thisLogUw1 + " " + logE*thisLogUw2 + " " + logE*thisLogUw3 + " " + logE*thisLogUw4);
       var thisLogUw5 = 0.0; //ionization stage V partition fn, U = 1.0

            //
            // ********** Accounting for FOUR ionization stages (I, II, III, IV):
            //
            logSaha21 = logSahaFac - logNe - (boltzFacI1 / temp[0][id]) + (3.0 * temp[1][id] / 2.0) + thisLogUw2 - thisLogUw1; // log(RHS) of standard Saha equation
            saha21 = Math.exp(logSaha21);   //RHS of standard Saha equation
            logSaha32 = logSahaFac - logNe - (boltzFacI2 / temp[0][id]) + (3.0 * temp[1][id] / 2.0) + thisLogUw3 - thisLogUw2; // log(RHS) of standard Saha equation
            saha32 = Math.exp(logSaha32);   //RHS of standard Saha equation
            logSaha43 = logSahaFac - logNe - (boltzFacI3 / temp[0][id]) + (3.0 * temp[1][id] / 2.0) + thisLogUw4 - thisLogUw3; // log(RHS) of standard Saha equation
            saha43 = Math.exp(logSaha43);   //RHS of standard Saha equation
            logSaha54 = logSahaFac - logNe - (boltzFacI4 / temp[0][id]) + (3.0 * temp[1][id] / 2.0) + thisLogUw5 - thisLogUw4; // log(RHS) of standard Saha equation
            saha54 = Math.exp(logSaha54);   //RHS of standard Saha equation
            //console.log("logSahaFac, logNe, logSaha21, logSaha32, logSaha43, logSaha54 = " + logE*logSahaFac + " " + logE*logNe 
   // + " " + logE*logSaha21 + " " + logE*logSaha32 + " " + logE*logSaha43 + " " + logE*logSaha54);

//System.out.println("LevelPopsServer: id " + id + " logSaha21 " + logSaha21 + " logSaha32 " + logSaha32 + " logNe " + logNe + " boltzFacI1 " + boltzFacI1 + " boltzFacI2 " + boltzFacI2 + " temp[0][id] " + temp[0][id] + " temp[1][id] " + temp[1][id] + " logGw2 " + logGw2 + " logGw1 " + logGw1 + " logGw3 " + logGw3); 

            var logDenominator = Math.log( 1.0 + saha21 + (saha32 * saha21) + (saha43 * saha32 * saha21) + (saha54 * saha43 * saha32 * saha21) );
            logIonFracI = -1.0 * logDenominator;     // log ionization fraction in stage I
            logIonFracII = logSaha21 - logDenominator; // log ionization fraction in stage II
            logIonFracIII = logSaha32 + logSaha21 - logDenominator; //log ionization fraction in stage III
            logIonFracIV = logSaha43 + logSaha32 + logSaha21 - logDenominator; //log ionization fraction in stage III
            logIonFracV = logSaha54 + logSaha43 + logSaha32 + logSaha21 - logDenominator; //log ionization fraction in stage III

            //if (id == 36) {
            //    System.out.println("logSaha21 " + logE*logSaha21 + " logSaha32 " + logE*logSaha32);
            //    System.out.println("IonFracII " + Math.exp(logIonFracII) + " IonFracI " + Math.exp(logIonFracI) + " logNe " + logE*logNe);
            //}
            //System.out.println("LevelPops: id, ionFracI, ionFracII: " + id + " " + Math.exp(logIonFracI) + " " + Math.exp(logIonFracII) );
                //System.out.println("LevPops: ionized branch taken, ionized =  " + ionized);

                logNums[0][id] = logNum[id] + logIonFracI; // neutral stage pop 
                //System.out.println("LevelPopsServer.stagePops id " + id + " logNum " + logNum + " logIonFracI " + logIonFracI 
                 //      + " logNums[0][id] " + logNums[0][id]);
                logNums[1][id] = logNum[id] + logIonFracII; // singly ionized stage pop 
                //System.out.println("LevelPopsServer.stagePops id " + id + " logNum " + logNum + " logIonFracII " + logIonFracII 
                 //      + " logNums[1][id] " + logNums[1][id]);
                logNums[2][id] = logNum[id] + logIonFracIII; // doubly ionized stage pop                 
                logNums[3][id] = logNum[id] + logIonFracIV; // triply ionized stage pop                 
                logNums[4][id] = logNum[id] + logIonFracV; // triply ionized stage pop                 

            // console.log("id, logIonFracI, logIonFracII, logIonFracIII, logIonFracIV, logIonFracV " + id + " " +
             //       logIonFracI + " " + logIonFracII + " " + logIonFracIII + " " + logIonFracIV + " " + logIonFracV);
           //  console.log("id, logNums[0][id], logNums[1][id], logNums[2][id], logNums[3][id], logNums[4][id]: " + id + " "
            //          + Math.exp(logNums[0][id]) + " "
             //        + Math.exp(logNums[1][id]) + " "
              //        + Math.exp(logNums[2][id]) + " "
               //     + Math.exp(logNums[3][id])  + " "
                //    + Math.exp(logNums[4][id]));
            //System.out.println("LevelPops: id, logNums[0][id], logNums[1][id], logNums[2][id], logNums[3][id], logNums[4][id]: " + id + " "
            //        + logE * (logNums[0][id]) + " "
            //        + logE * (logNums[1][id]) + " "
            //        + logE * (logNums[2][id]) + " "
            //        + logE * (logNums[3][id]) + " "
            //        + logE * (logNums[4][id]) );
            //System.out.println("LevelPops: id, logIonFracI, logIonFracII: " + id + " " + logE*logIonFracI + " " + logE*logIonFracII
            //        + "logNum, logNumI, logNums[0][id], logNums[1][id] "
            //        + logE*logNum + " " + logE*logNumI + " " + logE*logNums[0][id] + " " + logE*logNums[1][id]);
            //System.out.println("LevelPops: id, logIonFracI: " + id + " " + logE*logIonFracI
            //        + "logNums[0][id], boltzFacL/temp[0][id], logNums[2][id]: " 
            //        + logNums[0][id] + " " + boltzFacL/temp[0][id] + " " + logNums[2][id]);
        } //id loop

        return logNums;
    }; //end method stagePops    
    

//Ionization equilibrium routine that accounts for molecule formation:
 // Returns depth distribution of ionization stage populations 

// Input parameters:
// logNum - array with depth-dependent total element number densities (cm^-3) 
// chiI1 - ground state ionization energy of neutral stage 
// chiI2 - ground state ionization energy of singly ionized stage 
// Also needs atsmopheric structure information:
// numDeps
// temp structure 
// rho structure
//
// Atomic element "A" is the one whose ionization fractions are being computed
//  Element "B" refers to array of other species with which A forms molecules "AB" 

    var stagePops2 = function(logNum, Ne, chiIArr, log10UwAArr,  //species A data - ionization equilibrium of A
                 numMols, logNumB, dissEArr, log10UwBArr, log10QwABArr, logMuABArr,  //data for set of species "B" - molecular equlibrium for set {AB}
                 numDeps, temp) {


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


        var ln10 = Math.log(10.0);
        var logE = logTen(Math.E); // for debug output
        var log2pi = Math.log(2.0 * Math.PI);
        var log2 = Math.log(2.0);

    var numStages = chiIArr.length;// + 1; //need one more stage above the highest stage to be populated

//    var numMols = dissEArr.length;


// Parition functions passed in are 2-element vectore with remperature-dependent base 10 log Us
// Convert to natural logs:
        var Ttheta;
  //Default initializations:
        var thisLogUw = [];
//We need one more stage in size of saha factor than number of stages we're actualy populating
        thisLogUw.length = numStages+1;
        for (var i = 0; i < numStages+1; i++){
           thisLogUw[i] = 0.0;
        }

        var logE10 = Math.log(10.0);
        var logUw = [];
//We need one more stage in size of saha factor than number of stages we're actualy populating
        logUw.length = numStages+1;
        for (var i  = 0; i < numStages+1; i++){
           logUw[i] = [];
           logUw[i].length = 2;
        } 
        for (var i  = 0; i < numStages; i++){
           logUw[i][0] = logE10*log10UwAArr[i][0];
           logUw[i][1] = logE10*log10UwAArr[i][1];
        } 
        //Assume ground state statistical weight (or partition fn) of highest stage is 1.0;
        //var logGw5 = 0.0;
        logUw[numStages][0] = 0.0;
        logUw[numStages][1] = 0.0;

        //System.out.println("chiL before: " + chiL);
        // If we need to subtract chiI from chiL, do so *before* converting to tiny numbers in ergs!

//atomic ionization stage Boltzmann factors:
        var boltzFacI = [];
        boltzFacI.length = numStages;
        for (var i = 0; i < numStages; i++){
           var logChiI = Math.log(chiIArr[i]) + logEv; 
           var logBoltzFacI = logChiI  - logK;
           boltzFacI[i] = Math.exp(logBoltzFacI);
        }

        var logSahaFac = log2 + (3.0 / 2.0) * (log2pi + logMe + logK - 2.0 * logH);

        // return a 2D 5 x numDeps array of logarithmic number densities
        // Row 0: neutral stage ground state population
        // Row 1: singly ionized stage ground state population
        // Row 2: doubly ionized stage ground state population        
        // Row 3: triply ionized stage ground state population        
        // Row 4: quadruply ionized stage ground state population        
        var logNums = [];
        logNums.length = numStages;
        for (var i = 0; i < numStages; i++){
           logNums[i] = [];
           logNums[i].length = numDeps;
        }

//We need one more stage in size of saha factor than number of stages we're actualy populating
//   for index accounting pirposes
//   For atomic ionization stages:
        var logSaha = []; 
        var saha = [];
        saha.length = numStages+1;
        logSaha.length = numStages+1;
        for (var iStg = 0; iStg < numStages+1; iStg++){
           saha[iStg] = [];
           saha[iStg].length = numStages+1;
           logSaha[iStg] = [];
           logSaha[iStg].length = numStages+1;
        }
//
        var logIonFrac = [];
        logIonFrac.length = numStages; 
        var num, expFac; 
        var logNe;

// Now - molecular variables:

//Treat at least one molecule - if there are really no molecules for an atomic species, 
//there will be one phantom molecule in the denominator of the ionization fraction
//with an impossibly high dissociation energy
   if (numMols == 0){
       numMols = 1;
//This should be inherited, but let's make sure: 
       dissEArr[0] = 29.0; //eV
   }

//Molecular partition functions - default initialization:
       var thisLogUwB = [];
       thisLogUwB.length = numMols;
       for (var iMol = 0; iMol < numMols; iMol++){
          thisLogUwB[iMol] = 0.0; // variable for temp-dependent computed partn fn of array element B 
       }
         var thisLogUwA = 0.0; // element A 

//For clarity: neutral stage of atom whose ionization equilibrium is being computed is element A
// for molecule formation:
        var logUwA = [];
      if (numMols > 0){
        logUwA.length = 2;
        logUwA[0] = logUw[0][0];
        logUwA[1] = logUw[0][1];
      }
// Array of elements B for all molecular species AB:
       var logUwB = [];
      //if (numMols > 0){
       logUwB.length = numMols;
       for (var iMol = 0; iMol < numMols; iMol++){
          logUwB[iMol] = [];
          logUwB[iMol].length = 2;
       } 
        for (var iMol  = 0; iMol < numMols; iMol++){
           logUwB[iMol][0] = logE10*log10UwBArr[iMol][0];
           logUwB[iMol][1] = logE10*log10UwBArr[iMol][1];
        }
      //}
// Molecular partition functions:
       var logQwAB = [];
      //if (numMols > 0){
       logQwAB.length = numMols;
       for (var iMol = 0; iMol < numMols; iMol++){
          logQwAB[iMol] = logE10*log10QwABArr[iMol];
       }
      //}
//Molecular dissociation Boltzmann factors:
        var boltzFacIAB = [];
        var logMolSahaFac = [];
      //if (numMols > 0){
        boltzFacIAB.length = numMols;
        logMolSahaFac.length = numMols;
        for (var iMol = 0; iMol < numMols; iMol++){
           var logDissE = Math.log(dissEArr[iMol]) + logEv; 
           var logBoltzFacIAB = logDissE  - logK;
           boltzFacIAB[iMol] = Math.exp(logBoltzFacIAB);
           logMolSahaFac[iMol] = (3.0 / 2.0) * (log2pi + logMuABArr[iMol] + logK - 2.0 * logH);
  //console.log("iMol " + iMol + " dissEArr[iMol] " + dissEArr[iMol] + " logDissE " + logE*logDissE + " logBoltzFacIAB " + logE*logBoltzFacIAB + " boltzFacIAB[iMol] " + boltzFacIAB[iMol] + " logMuABArr " + logE*logMuABArr[iMol] + " logMolSahaFac " + logE*logMolSahaFac[iMol]);
        }
       //}
//   For molecular species:
        var logSahaMol = []; 
        var invSahaMol = [];
      //if (numMols > 0){
        invSahaMol.length = numMols;
        logSahaMol.length = numMols;
      //}

        for (var id = 0; id < numDeps; id++) {

            //// reduce or enhance number density by over-all Rosseland opcity scale parameter
//
            //Row 1 of Ne is log_e Ne in cm^-3
            logNe = Ne[1][id];

//Determine temeprature dependenet aprtition functions Uw:
            Ttheta = 5040.0 / temp[0][id];

       if (Ttheta >= 1.0){
           for (var iStg = 0; iStg < numStages; iStg++){
              thisLogUw[iStg] = logUw[iStg][0];
           }
           for (var iMol = 0; iMol < numMols; iMol++){
              thisLogUwB[iMol] = logUwB[iMol][0];
           }
       }
       if (Ttheta <= 0.5){
           for (var iStg = 0; iStg < numStages; iStg++){
              thisLogUw[iStg] = logUw[iStg][1];
           }
           for (var iMol = 0; iMol < numMols; iMol++){
              thisLogUwB[iMol] = logUwB[iMol][1];
           }
       }
       if (Ttheta > 0.5 && Ttheta < 1.0){
           for (var iStg = 0; iStg < numStages; iStg++){
              thisLogUw[iStg] = 0.5 * (Ttheta - 0.5) * logUw[iStg][1]
                + 0.5 * (1.0 - Ttheta) * logUw[iStg][0];
           }
           for (var iMol = 0; iMol < numMols; iMol++){
              thisLogUwB[iMol] = 0.5 * (Ttheta - 0.5) * logUwB[iMol][1]
                + 0.5 * (1.0 - Ttheta) * logUwB[iMol][0];
           }
       }
         thisLogUw[numStages] = 0.0;
//For clarity: neutral stage of atom whose ionization equilibrium is being computed is element A
// for molecule formation:
     thisLogUwA = thisLogUw[0];

   //Ionization stage Saha factors: 
            for (var iStg = 0; iStg < numStages; iStg++){
             
               logSaha[iStg+1][iStg] = logSahaFac - logNe - (boltzFacI[iStg] /temp[0][id]) + (3.0 * temp[1][id] / 2.0) + thisLogUw[iStg+1] - thisLogUw[iStg];
               saha[iStg+1][iStg] = Math.exp(logSaha[iStg+1][iStg]);
         // if (id == 36){
              // console.log("iStg " + iStg + " boltzFacI[iStg] " + boltzFacI[iStg] + " thisLogUw[iStg] " + logE*thisLogUw[iStg] + " thisLogUw[iStg+1] " + logE*thisLogUw[iStg+1]);   
              // console.log("iStg+1 " + (iStg+1) + " iStg " + iStg + " logSahaji " + logE*logSaha[iStg+1][iStg] + " saha[iStg+1][iStg] " + saha[iStg+1][iStg]);
         // }
            }

//Molecular Saha factors:
         for (var iMol = 0; iMol < numMols; iMol++){
             logSahaMol[iMol] = logMolSahaFac[iMol] - logNumB[iMol][id] - (boltzFacIAB[iMol] / temp[0][id]) + (3.0 * temp[1][id] / 2.0) + thisLogUwB[iMol] + thisLogUwA - logQwAB[iMol];
//For denominator of ionization fraction, we need *inverse* molecular Saha factors (N_AB/NI):
             logSahaMol[iMol] = -1.0 * logSahaMol[iMol];
             invSahaMol[iMol] = Math.exp(logSahaMol[iMol]);
             //TEST invSahaMol[iMol] = 1.0e-99; //test
         // if (id == 36){
         //     console.log("iMol " + iMol + " boltzFacIAB[iMol] " + boltzFacIAB[iMol] + " thisLogUwB[iMol] " + logE*thisLogUwB[iMol] + " logNumB[iMol][id] " + logE*logNumB[iMol][id] + " logMolSahaFac[iMol] " + logMolSahaFac[iMol]);   
         //     console.log("iMol " + iMol + " logSahaMol " + logE*logSahaMol[iMol] + " invSahaMol[iMol] " + invSahaMol[iMol]);
         // }
         }
            //logSaha32 = logSahaFac - logNe - (boltzFacI2 / temp[0][id]) + (3.0 * temp[1][id] / 2.0) + thisLogUw3 - thisLogUw2; // log(RHS) of standard Saha equation
            //saha32 = Math.exp(logSaha32);   //RHS of standard Saha equation

//Compute log of denominator is ionization fraction, f_stage 
            var denominator = 1.0; //default initialization - leading term is always unity 
//ion stage contributions:
            for (var jStg = 1; jStg < numStages+1; jStg++){
               var addend = 1.0; //default initialization for product series
               for (var iStg = 0; iStg < jStg; iStg++){
                  //console.log("jStg " + jStg + " saha[][] indices " + (iStg+1) + " " + iStg); 
                  addend = addend * saha[iStg+1][iStg]; 
               }
               denominator = denominator + addend; 
            }
//molecular contribution
           for (var iMol = 0; iMol < numMols; iMol++){
              denominator = denominator + invSahaMol[iMol];
           }
// 
            var logDenominator = Math.log(denominator); 
          //if (id == 36){
          //     console.log("logDenominator " + logE*logDenominator);
         // }
            //var logDenominator = Math.log( 1.0 + saha21 + (saha32 * saha21) + (saha43 * saha32 * saha21) + (saha54 * saha43 * saha32 * saha21) );

            logIonFrac[0] = -1.0 * logDenominator;     // log ionization fraction in stage I
          //if (id == 36){
               //console.log("jStg 0 " + " logIonFrac[jStg] " + logE*logIonFrac[0]);
          //}
            for (var jStg = 1; jStg < numStages; jStg++){
               var addend = 0.0; //default initialization for product series
               for (var iStg = 0; iStg < jStg; iStg++){
                  //console.log("jStg " + jStg + " saha[][] indices " + (iStg+1) + " " + iStg); 
                  addend = addend + logSaha[iStg+1][iStg];
               }
               logIonFrac[jStg] = addend - logDenominator;
          //if (id == 36){
           //    console.log("jStg " + jStg + " logIonFrac[jStg] " + logE*logIonFrac[jStg]);
          //}
            }

            //logIonFracI = -1.0 * logDenominator;     // log ionization fraction in stage I
            //logIonFracII = logSaha21 - logDenominator; // log ionization fraction in stage II
            //logIonFracIII = logSaha32 + logSaha21 - logDenominator; //log ionization fraction in stage III
            //logIonFracIV = logSaha43 + logSaha32 + logSaha21 - logDenominator; //log ionization fraction in stage III

            //if (id == 36) {
            //    System.out.println("logSaha21 " + logE*logSaha21 + " logSaha32 " + logE*logSaha32);
            //    System.out.println("IonFracII " + Math.exp(logIonFracII) + " IonFracI " + Math.exp(logIonFracI) + " logNe " + logE*logNe);
            //}
            //System.out.println("LevelPops: id, ionFracI, ionFracII: " + id + " " + Math.exp(logIonFracI) + " " + Math.exp(logIonFracII) );
                //System.out.println("LevPops: ionized branch taken, ionized =  " + ionized);

              for (var iStg = 0; iStg < numStages; iStg++){
                 logNums[iStg][id] = logNum[id] + logIonFrac[iStg];
              }
        } //id loop

        return logNums;
    }; //end method stagePops    
    

//Diatomic molecular equilibrium routine that accounts for molecule formation:
 // Returns depth distribution of molecular population 

// Input parameters:
// logNum - array with depth-dependent total element number densities (cm^-3) 
// chiI1 - ground state ionization energy of neutral stage 
// chiI2 - ground state ionization energy of singly ionized stage 
// Also needs atsmopheric structure information:
// numDeps
// temp structure 
// rho structure
//
// Atomic element "A" is the one kept on the LHS of the master fraction, whose ionization fractions are included 
//   in the denominator of the master fraction
//  Element "B" refers to array of other species with which A forms molecules "AB" 

    var molPops = function(nmrtrLogNumB, nmrtrDissE, log10UwA, nmrtrLog10UwB, nmrtrLog10QwAB, nmrtrLogMuAB,  //species A data - ionization equilibrium of A
                 numMolsB, logNumB, dissEArr, log10UwBArr, log10QwABArr, logMuABArr,  //data for set of species "B" - molecular equlibrium for set {AB}
                 logGroundRatio, numDeps, temp) {


 //console.log("Line: nmrtrLog10UwB[0] " + nmrtrLog10UwB[0] + " nmrtrLog10UwB[1] " + nmrtrLog10UwB[1]);

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


        var ln10 = Math.log(10.0);
        var logE = logTen(Math.E); // for debug output
        var log2pi = Math.log(2.0 * Math.PI);
        var log2 = Math.log(2.0);

        var logE10 = Math.log(10.0);
// Convert to natural logs:
        var Ttheta;

//Treat at least one molecule - if there are really no molecules for an atomic species, 
//there will be one phantom molecule in the denominator of the ionization fraction
//with an impossibly high dissociation energy
   if (numMolsB == 0){
       numMolsB = 1;
//This should be inherited, but let's make sure: 
       dissEArr[0] = 29.0; //eV
   }

    //var molPops = function(logNum, numeratorLogNumB, numeratorDissE, numeratorLog10UwA, numeratorLog10QwAB, numeratorLogMuAB,  //species A data - ionization equilibrium of A
//Molecular partition functions - default initialization:
       var thisLogUwB = [];
       thisLogUwB.length = numMolsB;
       for (var iMol = 0; iMol < numMolsB; iMol++){
          thisLogUwB[iMol] = 0.0; // variable for temp-dependent computed partn fn of array element B 
       }
         var thisLogUwA = 0.0; // element A 
         var nmrtrThisLogUwB = 0.0; // element A 

//For clarity: neutral stage of atom whose ionization equilibrium is being computed is element A
// for molecule formation:
        var logUwA = [];
        logUwA.length = 2;
        logUwA[0] = logE10*log10UwA[0];
        logUwA[1] = logE10*log10UwA[1];
        var nmrtrLogUwB = [];
        nmrtrLogUwB.length = 2;
        nmrtrLogUwB[0] = logE10*nmrtrLog10UwB[0];
        nmrtrLogUwB[1] = logE10*nmrtrLog10UwB[1];
// Array of elements B for all molecular species AB:
       var logUwB = [];
      //if (numMolsB > 0){
       logUwB.length = numMolsB;
       for (var iMol = 0; iMol < numMolsB; iMol++){
          logUwB[iMol] = [];
          logUwB[iMol].length = 2;
       } 
        for (var iMol  = 0; iMol < numMolsB; iMol++){
           logUwB[iMol][0] = logE10*log10UwBArr[iMol][0];
           logUwB[iMol][1] = logE10*log10UwBArr[iMol][1];
        }
      //}
// Molecular partition functions:
       var nmrtrLogQwAB = logE10*nmrtrLog10QwAB;
       var logQwAB = [];
      //if (numMolsB > 0){
       logQwAB.length = numMolsB;
       for (var iMol = 0; iMol < numMolsB; iMol++){
          logQwAB[iMol] = logE10*log10QwABArr[iMol];
       }
      //}
//Molecular dissociation Boltzmann factors:
        var nmrtrBoltzFacIAB = 0.0;
        var nmrtrLogMolSahaFac = 0.0;
        var logDissE = Math.log(nmrtrDissE)  + logEv;
        var logBoltzFacIAB = logDissE  - logK;
        nmrtrBoltzFacIAB = Math.exp(logBoltzFacIAB);
        nmrtrLogMolSahaFac = (3.0 / 2.0) * (log2pi + nmrtrLogMuAB  + logK - 2.0 * logH);
  //console.log("nmrtrDissE " + nmrtrDissE + " logDissE " + logE*logDissE + " logBoltzFacIAB " + logE*logBoltzFacIAB + " nmrtrBoltzFacIAB " + nmrtrBoltzFacIAB + " nmrtrLogMuAB " + logE*nmrtrLogMuAB + " nmrtrLogMolSahaFac " + logE*nmrtrLogMolSahaFac);
        var boltzFacIAB = [];
        var logMolSahaFac = [];
      //if (numMolsB > 0){
        boltzFacIAB.length = numMolsB;
        logMolSahaFac.length = numMolsB;
        for (var iMol = 0; iMol < numMolsB; iMol++){
           var logDissE = Math.log(dissEArr[iMol]) + logEv; 
           var logBoltzFacIAB = logDissE  - logK;
           boltzFacIAB[iMol] = Math.exp(logBoltzFacIAB);
           logMolSahaFac[iMol] = (3.0 / 2.0) * (log2pi + logMuABArr[iMol] + logK - 2.0 * logH);
  //console.log("iMol " + iMol + " dissEArr[iMol] " + dissEArr[iMol] + " logDissE " + logE*logDissE + " logBoltzFacIAB " + logE*logBoltzFacIAB + " boltzFacIAB[iMol] " + boltzFacIAB[iMol] + " logMuABArr " + logE*logMuABArr[iMol] + " logMolSahaFac " + logE*logMolSahaFac[iMol]);
        }
       
      //var logNums = [];
      //logNums.length = numDeps;
 
       //}
//   For molecular species:
        var nmrtrSaha, nmrtrLogSahaMol, nmrtrInvSahaMol;
        var logMolFrac = [];
        logMolFrac.length = numDeps;
        var logSahaMol = []; 
        var invSahaMol = [];
      //if (numMolsB > 0){
        invSahaMol.length = numMolsB;
        logSahaMol.length = numMolsB;
      //}

        for (var id = 0; id < numDeps; id++) {

            //// reduce or enhance number density by over-all Rosseland opcity scale parameter

//Determine temeprature dependenet aprtition functions Uw:
            Ttheta = 5040.0 / temp[0][id];

       if (Ttheta >= 1.0){
           thisLogUwA = logUwA[0];
           nmrtrThisLogUwB = nmrtrLogUwB[0];
           for (var iMol = 0; iMol < numMolsB; iMol++){
              thisLogUwB[iMol] = logUwB[iMol][0];
           }
       }
       if (Ttheta <= 0.5){
           thisLogUwA = logUwA[1];
           nmrtrThisLogUwB = nmrtrLogUwB[1];
           for (var iMol = 0; iMol < numMolsB; iMol++){
              thisLogUwB[iMol] = logUwB[iMol][1];
           }
       }
       if (Ttheta > 0.5 && Ttheta < 1.0){
           thisLogUwA = 0.5 * (Ttheta - 0.5) * logUwA[1]
                + 0.5 * (1.0 - Ttheta) * logUwA[0];
           nmrtrThisLogUwB = 0.5 * (Ttheta - 0.5) * nmrtrLogUwB[1]
                + 0.5 * (1.0 - Ttheta) * nmrtrLogUwB[0];
           for (var iMol = 0; iMol < numMolsB; iMol++){
              thisLogUwB[iMol] = 0.5 * (Ttheta - 0.5) * logUwB[iMol][1]
                + 0.5 * (1.0 - Ttheta) * logUwB[iMol][0];
           }
       }
//For clarity: neutral stage of atom whose ionization equilibrium is being computed is element A
// for molecule formation:

   //Ionization stage Saha factors: 
//console.log("id " + id + " nmrtrLogNumB[id] " + logE*nmrtrLogNumB[id]);             
               nmrtrLogSahaMol = nmrtrLogMolSahaFac - nmrtrLogNumB[id] - (nmrtrBoltzFacIAB / temp[0][id]) + (3.0 * temp[1][id] / 2.0) + nmrtrThisLogUwB + thisLogUwA - nmrtrLogQwAB;
               nmrtrLogSahaMol = -1.0 * nmrtrLogSahaMol;
               nmrtrInvSahaMol = Math.exp(nmrtrLogSahaMol);

          //if (id == 36){
          //     console.log("nmrtrBoltzFacIAB " + nmrtrBoltzFacIAB + " nmrtrThisLogUwB " + logE*nmrtrThisLogUwB + " thisLogUwA " + logE*thisLogUwA + " nmrtrLogQwAB " + nmrtrLogQwAB);   
          //     console.log("nmrtrLogSahaMol " + logE*nmrtrLogSahaMol + " nmrtrInvSahaMol " + nmrtrInvSahaMol);
         // }

//Molecular Saha factors:
         for (var iMol = 0; iMol < numMolsB; iMol++){
//console.log("iMol " + iMol + " id " + id + " logNumB[iMol][id] " + logE*nmrtrLogNumB[id]);             
             logSahaMol[iMol] = logMolSahaFac[iMol] - logNumB[iMol][id] - (boltzFacIAB[iMol] / temp[0][id]) + (3.0 * temp[1][id] / 2.0) + thisLogUwB[iMol] + thisLogUwA - logQwAB[iMol];
//For denominator of ionization fraction, we need *inverse* molecular Saha factors (N_AB/NI):
             logSahaMol[iMol] = -1.0 * logSahaMol[iMol];
             invSahaMol[iMol] = Math.exp(logSahaMol[iMol]);
             //TEST invSahaMol[iMol] = 1.0e-99; //test
          //if (id == 36){
              //console.log("iMol " + iMol + " boltzFacIAB[iMol] " + boltzFacIAB[iMol] + " thisLogUwB[iMol] " + logE*thisLogUwB[iMol] + " logQwAB[iMol] " + logE*logQwAB[iMol] + " logNumB[iMol][id] " + logE*logNumB[iMol][id] + " logMolSahaFac[iMol] " + logE*logMolSahaFac[iMol]);   
              //console.log("iMol " + iMol + " logSahaMol " + logE*logSahaMol[iMol] + " invSahaMol[iMol] " + invSahaMol[iMol]);
          //}
         }

//Compute log of denominator is ionization fraction, f_stage 
        //default initialization 
        //  - ratio of total atomic particles in all ionization stages to number in ground state: 
            var denominator = Math.exp(logGroundRatio[id]); //default initialization - ratio of total atomic particles in all ionization stages to number in ground state 
//molecular contribution
           for (var iMol = 0; iMol < numMolsB; iMol++){
              denominator = denominator + invSahaMol[iMol];
           }
// 
            var logDenominator = Math.log(denominator); 
            //console.log("id " + id + " logGroundRatio " + logGroundRatio[id] + " logDenominator " + logDenominator);
            
          //if (id == 36){
          //     console.log("logDenominator " + logE*logDenominator);
         // }
            //var logDenominator = Math.log( 1.0 + saha21 + (saha32 * saha21) + (saha43 * saha32 * saha21) + (saha54 * saha43 * saha32 * saha21) );

          logMolFrac[id] = nmrtrInvSahaMol - logDenominator;
          //if (id == 36){
           //    console.log("jStg " + jStg + " logIonFrac[jStg] " + logE*logIonFrac[jStg]);
          //}

            //if (id == 36) {
            //    System.out.println("logSaha21 " + logE*logSaha21 + " logSaha32 " + logE*logSaha32);
            //    System.out.println("IonFracII " + Math.exp(logIonFracII) + " IonFracI " + Math.exp(logIonFracI) + " logNe " + logE*logNe);
            //}
            //System.out.println("LevelPops: id, ionFracI, ionFracII: " + id + " " + Math.exp(logIonFracI) + " " + Math.exp(logIonFracII) );
                //System.out.println("LevPops: ionized branch taken, ionized =  " + ionized);

            //logNums[id] = logNum[id] + logMolFrac;
        } //id loop

        return logMolFrac;
    }; //end method stagePops    
    
