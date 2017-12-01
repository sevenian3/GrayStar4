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
        numDeps, teff, numCore, numWing, species){
        //logGammaCol, tauRos, temp, press, tempSun, pressSun) {

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

      if(species=="HI" && teff>=7000){ 
              maxCoreV = 3.5; 
              minWingDeltaLogV = Math.log(maxCoreV + 1.5);
              maxWingDeltaLogV = 12.0 + minWingDeltaLogV;

//console.log("2)"+maxWingDeltaLogV);
      }



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
        tempSun, pressSun, hjertComp) {

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
    var sqRtPi = Math.sqrt(Math.PI);
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
// For Hjerting function approximation:
   var vSquare, vFourth, vAbs, a2, a3, a4, Hjert0, Hjert1, Hjert2, Hjert3, Hjert4, hjertFn;
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
// Powers of a needed for Hjerting function power expansion approximation:
        a2 = Math.exp(2.0*logA);
        a3 = Math.exp(3.0*logA);
        a4 = Math.exp(4.0*logA);
        //    if (id === 12) {
        //console.log("LineGrid: lam0 " + lam0 +  " logGam " + logE * logGamma + " logA " + logE * logA);
        //   }
        for (var il = 0; il < numPoints; il++) {

            v[il] = linePoints[1][il];
            vAbs = Math.abs(v[il]);
            vSquare = vAbs * vAbs;
            vFourth = vSquare * vSquare;

//Approximate Hjerting fn from tabulated expansion coefficients:
// Interpolate in Hjerting table to exact "v" value for each expanstion coefficient:
// Row 0 of Hjerting component table used for tabulated abscissae, Voigt "v" parameter
            if (vAbs <= 12.0){
              //we are within abscissa domain of table
              Hjert0 = interpol(hjertComp[0], hjertComp[1], vAbs);
              Hjert1 = interpol(hjertComp[0], hjertComp[2], vAbs);
              Hjert2 = interpol(hjertComp[0], hjertComp[3], vAbs);
              Hjert3 = interpol(hjertComp[0], hjertComp[4], vAbs);
              Hjert4 = interpol(hjertComp[0], hjertComp[5], vAbs);
           } else {
              // We use the analytic expansion
              Hjert0 = 0.0;
              Hjert1 = (0.56419 / vSquare) + (0.846 / vFourth); 
              Hjert2 = 0.0;
              Hjert3 = -0.56 / vFourth;
              Hjert4 = 0.0;
           }
//Approximate Hjerting fn with power expansion in Voigt "a" parameter 
// "Observation & Analysis of Stellar Photospeheres" (D. Gray), 3rd Ed., p. 258:
          hjertFn = Hjert0 + a*Hjert1 + a2*Hjert2 + a3*Hjert3 + a4*Hjert4; 

/* Gaussian + Lorentzian approximation:    
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
*/
//System.out.println("LINEGRID: il, v[il]: " + il + " " + v[il] + " lineProf[0][il]: " + lineProf[0][il]);
//System.out.println("LINEGRID: il, Voigt, H(): " + il + " " + voigt);
//Convert from H(a,v) in dimensionless voigt untis to physical phi(Delta almbda) profile 
           // if (id === 20) {
           //     console.log("lam0In " + lam0In);
           //     console.log("il " + il + " linePoints " + 1.0e7 * linePoints[0][il] + " v " + v[il] + " voigt " + voigt + " hjertFn " + hjertFn);
           // }
            //logVoigt = Math.log(voigt) + 2.0 * logLam0 - lnSqRtPi - logDopp - logC;
            //logVoigt = Math.log(hjertFn) + 2.0 * logLam0 - lnSqRtPi - logDopp - logC;
            voigt = hjertFn * Math.pow(lam0, 2) /sqRtPi / doppler / c;
            //lineProf[il][id] = Math.exp(logVoigt);
            lineProf[il][id] = voigt;
            if (lineProf[il][id] <= 0.0){
                lineProf[il][id] = -49.0;
             }

           // if (id === 20) {
           //     console.log("lam0In " + lam0In);
           //     console.log("il " + il + " linePoints " + 1.0e7 * linePoints[0][il] + " id " + id + " lineProf[il][id] " + lineProf[il][id]);
           // }
        } // il lambda loop

    } //id loop


    return lineProf;
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
var stark = function(linePoints, lam0In, logAij, logGammaCol,
        numDeps, teff, tauRos, temp, press, Ne,
        tempSun, pressSun, hjertComp, lineName) {

    var c = 2.9979249E+10; // light speed in vaccuum in cm/s
    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var logC = Math.log(c);
    var logK = Math.log(k);

    var lam0 = lam0In; // * 1.0E-7; //nm to cm
    var logLam0 = Math.log(lam0);
    var logLam0A = Math.log(lam0) + 8.0*Math.log(10.0); //cm to A
    var ln10 = Math.log(10.0);
    var ln2 = Math.log(2.0);
    var ln4pi = Math.log(4.0 * Math.PI);
    var lnSqRtPi = 0.5 * Math.log(Math.PI);
    var sqRtPi = Math.sqrt(Math.PI);
    var sqPi = Math.sqrt(Math.PI);

    var logE = logTen(Math.E); // for debug output
    // linePoints Row 0 : Delta lambdas in cm - will need to be in nm for Planck and Rad Trans?
    //            Row 1 : Delta lambdas in Doppler widths
    //
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
        lineProf[row] = [];
        lineProf[row].length = numDeps;
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
// For Hjerting function approximation:
   var vSquare, vFourth, vAbs, a2, a3, a4, Hjert0, Hjert1, Hjert2, Hjert3, Hjert4, hjertFn;
    //console.log("il " + il + " temp[il] " + temp[0][il] + " press[il] " + logE*press[1][il]);
   
   //Parameters for linear Stark broadening:
   //Assymptotic ("far wing") "K" parameters
   //Stehle & Hutcheon, 1999, A&A Supp Ser, 140, 93 and CDS data table
   //http://vizier.cfa.harvard.edu/viz-bin/VizieR?-source=VI/98A
   //Assume K has something to do with "S" and proceed as in Observation and Analysis of
   // Stellar Photosphere, 3rd Ed. (D. Gray), Eq. 11.50,
   // Tuning value fitted to Phoenix Vega model by JB
   var logTuneStark = Math.log(3.1623e7); //convert DeltaI K parameters to deltaS Stark profile parameters 
   var logKStark = [];
   logKStark.length = 11; //For now: Halpha to Hepsilon 
   logKStark[0] = Math.log(2.56e-03) + logTuneStark;  //Halpha
   logKStark[1] = Math.log(7.06e-03) + logTuneStark;   //Hbeta
   logKStark[2] = Math.log(1.19e-02) + logTuneStark;  //Hgamma
   logKStark[3] = Math.log(1.94e-02) + logTuneStark;  //Hdelta
   logKStark[4] = Math.log(2.95e-02) + logTuneStark;  //Hepsilon
   logKStark[5] = Math.log(4.62e-02) + logTuneStark;  //H8 JB
   logKStark[6] = Math.log(6.38e-02) + logTuneStark;  //H9 JB
   logKStark[7] = Math.log(8.52e-02) + logTuneStark;  //H10 JB
   logKStark[8] = Math.log(1.12e-01) + logTuneStark;  //H11 JB
   logKStark[9] = Math.log(1.43e-01) + logTuneStark;  //H12 JB
   logKStark[10] = Math.log(1.80e-01) + logTuneStark;  //H13 JB
   //logKStark[11] = Math.log(2.11) + logTuneStark; //H30 JB

   var thisLogK = logKStark[10]; //default initialization
   //which Balmer line are we?  crude but effective:
   if (lam0In > 650.0e-7){
    //  console.log("Halpha");
      thisLogK = logKStark[0];  //Halpha
   } 
   if ( (lam0In > 480.0e-7) && (lam0In < 650.0e-7) ){
    //  console.log("Hbeta");
      thisLogK = logKStark[1];  //Hbeta
   }
   if ( (lam0In > 420.0e-7) && (lam0In < 470.0e-7) ){
    //  console.log("Hgamma");
      thisLogK = logKStark[2];  //Hgamma
   }
   if ( (lam0In > 400.0e-7) && (lam0In < 450.0e-7) ){
   //   console.log("Hdelta");
      thisLogK = logKStark[3];  //Hdelta
   }
   if ( (lam0In > 390.0e-7) && (lam0In < 400.0e-7) ){
   //   console.log("Hepsilon");
      thisLogK = logKStark[4];  //Hepsilon
   }
//JB
   if ((lam0In < 390.0e-7)){

      var numberInName = parseInt(lineName.substring("HI".length),10);
      console.log(numberInName);
      thisLogK = logKStark[numberInName-3];
   }



//
   var F0, logF0, lamOverF0, logLamOverF0; //electrostatic field strength (e.s.u.)
   var deltaAlpha, logDeltaAlpha, logStark, logStarkTerm; //reduced wavelength de-tuning parameter (Angstroms/e.s.u.)
   var logF0Fac = Math.log(1.249e-9);
// log wavelength de-tunings in A:
   var logThisPoint, thisPoint;
//   var logLinePoints = [];
//   logLinePoints.length = numPoints;
//   for (var i = 0; i < numPoints; i++){
//     console.log("i " + i + " linePoints[0][i] " + linePoints[0][i]);
//     logLinePoints[i] = Math.log(linePoints[0][i]) - Math.log(8.0); 
//   }
 
    for (var id = 0; id < numDeps; id++) {

//linear Stark broadening stuff:
        logF0 = logF0Fac + (0.666667)*Ne[1][id];
        logLamOverF0 = logLam0A - logF0; 
        lamOverF0 = Math.exp(logLamOverF0);

  //console.log("id " + id + " logF0 " + logE*logF0 + " logLamOverF0 " + logE*logLamOverF0 + " lamOverF0 " + lamOverF0);

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
// Powers of a needed for Hjerting function power expansion approximation:
        a2 = Math.exp(2.0*logA);
        a3 = Math.exp(3.0*logA);
        a4 = Math.exp(4.0*logA);
        //    if (id === 12) {
        //console.log("LineGrid: lam0 " + lam0 +  " logGam " + logE * logGamma + " logA " + logE * logA);
        //   }
        for (var il = 0; il < numPoints; il++) {

            v[il] = linePoints[1][il];
            vAbs = Math.abs(v[il]);
            vSquare = vAbs * vAbs;
            vFourth = vSquare * vSquare;

//Approximate Hjerting fn from tabulated expansion coefficients:
// Interpolate in Hjerting table to exact "v" value for each expanstion coefficient:
// Row 0 of Hjerting component table used for tabulated abscissae, Voigt "v" parameter
            if (vAbs <= 12.0){
              //we are within abscissa domain of table
              Hjert0 = interpol(hjertComp[0], hjertComp[1], vAbs);
              Hjert1 = interpol(hjertComp[0], hjertComp[2], vAbs);
              Hjert2 = interpol(hjertComp[0], hjertComp[3], vAbs);
              Hjert3 = interpol(hjertComp[0], hjertComp[4], vAbs);
              Hjert4 = interpol(hjertComp[0], hjertComp[5], vAbs);
           } else {
              // We use the analytic expansion
              Hjert0 = 0.0;
              Hjert1 = (0.56419 / vSquare) + (0.846 / vFourth); 
              Hjert2 = 0.0;
              Hjert3 = -0.56 / vFourth;
              Hjert4 = 0.0;
           }
//Approximate Hjerting fn with power expansion in Voigt "a" parameter 
// "Observation & Analysis of Stellar Photospeheres" (D. Gray), 3rd Ed., p. 258:
          hjertFn = Hjert0 + a*Hjert1 + a2*Hjert2 + a3*Hjert3 + a4*Hjert4; 
          logStark = -49.0; //re-initialize
            //System.out.println("LineProf: il, v[il]: " + il + " " + v[il]);
//linear Stark wings
            if (vAbs > 2.0) {

               thisPoint = 1.0e8 * Math.abs(linePoints[0][il]); //cm to A
               logThisPoint = Math.log(thisPoint); 
               logDeltaAlpha = logThisPoint - logF0;
               deltaAlpha = Math.exp(logDeltaAlpha);
               logStarkTerm = ( Math.log(lamOverF0 + deltaAlpha) - logLamOverF0 );
               logStark = thisLogK + 0.5*logStarkTerm - 2.5*logDeltaAlpha; 

               //console.log("il " + il + " logDeltaAlpha " + logE*logDeltaAlpha + " logStarkTerm " + logE*logStarkTerm  + " logStark " + logE*logStark);

               //not here! hjertFn = hjertFn + Math.exp(logStark);
               //console.log("hjertFn " + hjertFn + " Math.exp(logStark) " + Math.exp(logStark));
            } 
//System.out.println("LINEGRID: il, v[il]: " + il + " " + v[il] + " lineProf[0][il]: " + lineProf[0][il]);
//System.out.println("LINEGRID: il, Voigt, H(): " + il + " " + voigt);
//Convert from H(a,v) in dimensionless voigt untis to physical phi(Delta almbda) profile 
           // if (id === 20) {
           //     console.log("lam0In " + lam0In);
           //     console.log("il " + il + " linePoints " + 1.0e7 * linePoints[0][il] + " v " + v[il] + " voigt " + voigt + " hjertFn " + hjertFn);
           // }
            //logVoigt = Math.log(voigt) + 2.0 * logLam0 - lnSqRtPi - logDopp - logC;
            //logVoigt = Math.log(hjertFn) - lnSqRtPi - logDopp;
            voigt = hjertFn / sqRtPi / doppler;
            logStark = logStark - logF0;
            if (vAbs > 2.0){
            //if (id === 24) {
            //   console.log("il " + il + " v[il] " + v[il] + " logVoigt " + logE*logVoigt + " logStark " + logE*logStark);
            //}
               //voigt = Math.exp(logVoigt) + Math.exp(logStark);
               voigt = voigt + Math.exp(logStark);
               //logVoigt = Math.log(voigt);
            }
            //logVoigt = logVoigt + 2.0 * logLam0 - logC;
            voigt = voigt * Math.pow(lam0, 2) / c;
            //lineProf[il][id] = Math.exp(logVoigt);
            lineProf[il][id] = voigt;
            if (lineProf[il][id] <= 0.0){
                lineProf[il][id] = -49.0;
            }
            //if (id === 24) {
            //    console.log("lam0In " + lam0In);
            //    console.log("il " + il + " linePoints " + 1.0e7 * linePoints[0][il] + " id " + id + " lineProf[il][id] " + lineProf[il][id]);
            //}
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

var lineKap = function(lam0In, logNums, logFluIn, linePoints, lineProf,
        numDeps, zScale, tauRos, temp, rho, logFudgeTune) {

    var logE10 = Math.log(10.0); //natural log of 10

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

        logNum = logNums[id];

        //if (id === refRhoIndx) {
        //    System.out.println("LINEKAPPA: logStimEm " + logE*logStimEm);
        //}
        for (var il = 0; il < numPoints; il++) {

            // From Radiative Transfer in Stellar Atmospheres (Rutten), p.31
            // This is a *volume* co-efficient ("alpha_lambda") in cm^-1:
            logKappaL[il][id] = logPreFac + logStimEm + logNum + Math.log(lineProf[il][id]);

            //if (id == 35) {
            //    console.log("il " + il + " logNum " + logE*logNum + " Math.log(lineProf[il][id]) " + logE*Math.log(lineProf[il][id])
            //         + " logKappaL[il][id] " + logE*logKappaL[il][id]);
                ////    console.log("logPreFac " + logPreFac + " logStimEm " + logStimEm);
            //}

            //console.log("LineKap: il, id: " + il + " " + id + " logPreFac " + logE*logPreFac + " logStimEm " + logE*logStimEm + 
            //        " logNum " + logE*logNum + " lineProf " + logE * Math.log(lineProf[il][id]));

            //Convert to mass co-efficient in g/cm^2:          
            // This direct approach won't work - is not consistent with fake Kramer's law scaling of Kapp_Ros with g instead of rho
            logKappaL[il][id] = logKappaL[il][id] - rho[1][id];
//Try something...
//
//// **********************
////  Opacity problem #2
////
//  #//Line opacity needs to be enhanced by same factor as the conitnuum opacity
//  #//  - related to Opacity problem #1 (logFudgeTune in GrayStarServer3.java) - ??
//  #//
            logKappaL[il][id] = logKappaL[il][id] + logE10*logFudgeTune;
////
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
 * 
 * Compute the monochromatic optical depth scale, tau_lambda, at each
 * lambda across the line profile 
 * 
 * Inputs: lineGrid -only neded for row 0 - wavelengths logKappaL - monochromatic line extinction
 * co-efficients kappa - we need the background continuum extinction
 * co-efficients, too!
 */
/* This version is for computing the monochromatic optical depth distribution from a line blanketed
 *  * and a continuum monochromatic extinction distribution */
/* logTauCont is the optical depth scale corresponding to the continuum extinction logKappa*/

/* This might be the wrong approach - using the *local* monochromatic continuum optical depth and extinction
 *  * scale for reference at each wavelength - the alternative is to use a universal tau and kappa scale
 *   * for reference, like Rosseland tau and kappa (or those at 500 nm)*/

//var tauLambda = function(numPoints, lambdaPoints, logKappaL,
//      numLams, lambdaScale, logKappa, numDeps, logTauCont, logKappaRef, tauRef, logTotalFudge) {
var tauLambda = function(numPoints, lambdaPoints, logKappaL,
       numDeps, logKappaRef, tauRef, logTotalFudge) {

    //No monochromatic optical depth can be less than the Rosseland optical depth,
    // so prevent zero tau_lambda values by setting each tau_lambda(lambda) at the 
    //top of the atmosphere to the tau_Ross value at the top 
    // - prevents trying to take a log of zero!
    var logE = logTen(Math.E); // for debug output
    var logE10 = Math.log(10.0); 
    var minTauL = tauRef[0][0];
    var minLogTauL = tauRef[1][0];

    //var numPoints = linePoints[0].length;

    //NOT TRUE ANY LONGER?? // returns numPoints+1 x numDeps array: the numPoints+1st row holds the line centre continuum tau scale
    var logTauL = [];
    logTauL.length = numPoints; // + 1;
    //Must use Array constructor here:
    for (var row = 0; row < numPoints; row++) {
        logTauL[row] = [];
        logTauL[row].length = numDeps;
    }

    var tau1, tau2, delta, tauL, thisTau, lastTau,
            integ, logKapRat, lastLogKapRat, kapTot;

/*
//Interpolate continuum opacity and corresponding optical depth scale onto onto line-blanketed opacity lambda array:
        var logKappaC = [];
        logKappaC.length = numLams;
        var logKappaC2 = [];
        logKappaC2.length = numPoints;
        var logKappa2 = [];
        logKappa2.length = numPoints;
        for (var i = 0; i < numPoints; i++){
           logKappa2[i] = [];
           logKappa2[i].length = numDeps;
        }
        var logTauC = [];
        logTauC.length = numLams;
        var logTauC2 = [];
        logTauC2.length = numPoints;
        var logTau2 = [];
        logTau2.length = numPoints;
        for (var i = 0; i < numPoints; i++){
           logTau2[i] = [];
           logTau2[i].length = numDeps;
        }
        for (var id = 0; id < numDeps; id++) {
           for (var il = 0; il < numLams; il++) {
    //         console.log("id " + id + " il " + il + " kappa[il][id] " + kappa[il][id]);
              logKappaC[il] = logKappa[il][id];
              logTauC[il] = logTauCont[il][id];
           }
           logKappaC2 = interpolV(logKappaC, lambdaScale, lambdaPoints);
           logTauC2 = interpolV(logTauC, lambdaScale, lambdaPoints);
           for (var il = 0; il < numPoints; il++){
              logKappa2[il][id] = logKappaC2[il];
              logTau2[il][id] = logTauC2[il];
           }
        }
*/
    for (var il = 0; il < numPoints; il++) {

        tau1 = minTauL; //initialize accumulator
        logTauL[il][0] = minLogTauL; // Set upper boundary TauL           

        //
        //Trapezoid method: first integrand:
        //total extinction co-efficient


        //// With local monochromatic optical depth scale as reference scale:
        //lastLogKapRat = logKappaL[il][0] - logKappa2[il][0];
        //lastLogKapRat = lastLogKapRat + logE10*logTotalFudge;
        //With Rosseland optical depth scale as reference scale:
        ////lastLogKapRat = Math.log(kapTot) - kappaRef[1][0];
        lastLogKapRat = logKappaL[il][0] - logKappaRef[1][0];
        lastLogKapRat = lastLogKapRat + logE10*logTotalFudge;


        for (var id = 1; id < numDeps; id++) {


            // To test: continue with Euler's method:

            //// With local monochromatic optical depth scale as reference scale:
            //thisTau = Math.exp(logTau2[il][id]);
            //lastTau = Math.exp(logTau2[il][id - 1]);
            //With Rosseland optical depth scale as reference scale:
             thisTau = tauRef[0][id];
             lastTau = tauRef[0][id-1];

            delta = thisTau - lastTau;
            // With local monochromatic optical depth scale as reference scale:
            //logKapRat = logKappaL[il][id] - logKappa2[il][id];
           // logKapRat = logKapRat + logE10*logTotalFudge;
            //With Rosseland optical depth scale as reference scale:
            logKapRat = logKappaL[il][id] - logKappaRef[1][id];
            logKapRat = logKapRat + logE10*logTotalFudge;
            //opacity being handed in is now total oppcity: line plux continuum:
            integ = 0.5 * (Math.exp(logKapRat) + Math.exp(lastLogKapRat));
            tau2 = tau1 + (integ * delta);

            logTauL[il][id] = Math.log(tau2);
            tau1 = tau2;
            lastLogKapRat = logKapRat;

        } //id loop

    } //il loop
    return logTauL;

};

/* This version is for computing the monochromatic optical depth distribution from a continuum monochromatic extinction
 * distribution and a reference extinction scale */
//
// kappaRef is usual 2 x numDeps array with linear (row 0) and logarithmic (row 1) reference extinction coefficient
// values
// tauRef is the optical depth distribution corresponding to the extinction distribution kappaRef
    var tauLambdaCont = function(numCont, logKappaCont,
             logKappaRef, numDeps, tauRef, logTotalFudge) {

        //No monochromatic optical depth can be less than the Rosseland optical depth,
        // so prevent zero tau_lambda values by setting each tau_lambda(lambda) at the
        //top of the atmosphere to the tau_Ross value at the top
        // - prevents trying to take a log of zero!
        var logE = Math.log10(Math.E); // for debug output
        var logE10 = Math.log(10.0); 
        var minTauC = tauRef[0][0];
        var minLogTauC = tauRef[1][0];

        //int numPoints = linePoints[0].length;
        // returns numPoints+1 x numDeps array: the numPoints+1st row holds the line centre continuum tau scale
        //double[][] logTauC = new double[numCont][numDeps];
        var logTauC = [];
        logTauC.length = numCont;
        for (var i = 0; i < numCont; i++){
           logTauC[i] = [];
           logTauC[i].length = numDeps;
        }

        var tau1, tau2, delta, tauL,
                integ, logKapRat, lastLogKapRat;

//Interpolate continuum opacity onto onto line-blanketed opacity lambda array:
//
        for (var il = 0; il < numCont; il++) {

            tau1 = minTauC; //initialize accumulator
            logTauC[il][0] = minLogTauC; // Set upper boundary TauL

            lastLogKapRat = logKappaCont[il][0] - logKappaRef[1][0];
            lastLogKapRat = lastLogKapRat + logE10*logTotalFudge;

            for (var id = 1; id < numDeps; id++) {

                delta = tauRef[0][id] - tauRef[0][id - 1];
                logKapRat = logKappaCont[il][id] - logKappaRef[1][id];
                logKapRat = logKapRat + logE10*logTotalFudge;

                //trapezoid rule:
                integ = 0.5 * (Math.exp(logKapRat) + Math.exp(lastLogKapRat));
                tau2 = tau1 + (integ * delta);

                logTauC[il][id] = Math.log(tau2);
                tau1 = tau2;
                lastLogKapRat = logKapRat;

            } //id loop

        } //il loop

        return logTauC;

    }; //end method tauLambda


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
            if ((masterLams[nextCntPtr] <= listLineLambdas[nextLinePtr])
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
    for (var i = 0; i < numTot; i++) {
        logMasterKapsOut[i] = [];
        logMasterKapsOut[i].length = numDeps;
    }
    //double[][] kappa2 = new double[2][numTot];
    //double[][] lineKap2 = new double[2][numTot];
    //var kappa2, lineKap2, totKap;
    //lineKap2 = 1.0e-49; //initialization
    var totKap;
    var logKappa2 = [];
    var logLineKap2 = [];
    logKappa2.length = numTot;
    logLineKap2.length = numTot;

    //int numCnt = lambdaScale.length;
    //int numLine = lineLambdas.length - 1;
    //var kappa1D = [];
    //kappa1D.length = numNow;
    //var lineKap1D = [];
    //lineKap1D.length = numPoints;
    var logKappa1D = [];
    logKappa1D.length = numNow;
    var logLineKap1D = [];
    logLineKap1D.length = numPoints;
    var thisMasterLams = [];
    thisMasterLams.length = numNow;

        for (var k =0; k < numNow; k++){
           thisMasterLams[k] = masterLams[k];
        }

    //console.log("iL   masterLams    logMasterKappa");
    for (var iD = 0; iD < numDeps; iD++) {

        //Extract 1D *linear* opacity vectors for interpol()
        for (var k = 0; k < numNow; k++) {
            //kappa1D[k] = Math.exp(logMasterKaps[k][iD]); //actually wavelength independent - for now
            logKappa1D[k] = logMasterKaps[k][iD]; //actually wavelength independent - for now
        }

        for (var k = 0; k < numPoints; k++) {
            //lineKap1D[k] = Math.exp(listLogKappaL[k][iD]);
            logLineKap1D[k] = listLogKappaL[k][iD];
        }

        //Interpolate continuum and line opacity onto master lambda scale, and add them lambda-wise:
        for (var iL = 0; iL < numTot; iL++) {
            logLineKap2[iL] = -49.0; //re-initialization
        }
 
        logKappa2 = interpolV(logKappa1D, thisMasterLams, masterLamsOut);
        logLineKap2 = interpolV(logLineKap1D, listLineLambdas, masterLamsOut);

        for (var iL = 0; iL < numTot; iL++) {
            totKap = Math.exp(logKappa2[iL]) + Math.exp(logLineKap2[iL]);
            logMasterKapsOut[iL][iD] = Math.log(totKap);
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

    //var levelPops = function(lam0In, logNStage, chiL, log10UwStage, 
    //                gwL, numDeps, temp) {
    var levelPops = function(lam0In, logNStage, chiL, logUw, 
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


// Partition functions passed in are 5-element vectors with temperature-dependent base 10 log Us
// Convert to natural logs:
        var thisLogUw, Ttheta;
        thisLogUw = 0.0; //default initialization
        //var logUw = [];  
        //logUw.length = 5;
        var logE10 = Math.log(10.0);
        //for (var k = 0; k < logUw.length; k++){
        //    logUw[k] = logE10*log10UwStage[k]; // lburns new loop
        //}
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

        if (chiL <= 0.0){
            chiL = 1.0e-49;
         }
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


//NEW Determine temperature dependent partition functions Uw: lburns
        var thisTemp = temp[0][id];

        if (thisTemp >= 10000){
            thisLogUw = logUw[4];
        }
        if (thisTemp <= 130){
            thisLogUw = logUw[0];
        }
        if (thisTemp > 130 && thisTemp <= 500){
            thisLogUw = logUw[1] * (thisTemp - 130)/(500 - 130)
                      + logUw[0] * (500 - thisTemp)/(500 - 130);
        }
        if (thisTemp > 500 && thisTemp <= 3000){
            thisLogUw = logUw[2] * (thisTemp - 500)/(3000 - 500)
                      + logUw[1] * (3000 - thisTemp)/(3000 - 500);
        }
        if (thisTemp > 3000 && thisTemp <= 8000){
            thisLogUw = logUw[3] * (thisTemp - 3000)/(8000 - 3000)
                      + logUw[2] * (8000 - thisTemp)/(8000 - 3000);
        }
        if (thisTemp > 8000 && thisTemp < 10000){
            thisLogUw = logUw[4] * (thisTemp - 8000)/(10000 - 8000)
                      + logUw[3] * (10000 - thisTemp)/(10000 - 8000);
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

    //var stagePops2 = function(logNum, Ne, chiIArr, log10UwAArr,  //species A data - ionization equilibrium of A
    //             numMols, logNumB, dissEArr, log10UwBArr, logQwABArr, logMuABArr,  //data for set of species "B" - molecular equlibrium for set {AB}
    //             numDeps, temp) {
    var stagePops2 = function(logNum, Ne, chiIArr, logUw,  //species A data - ionization equilibrium of A
                 numMols, logNumB, dissEArr, logUwB, logQwABArr, logMuABArr,  //data for set of species "B" - molecular equlibrium for set {AB}
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
        var Ttheta, thisTemp;
  //Default initializations:
        var thisLogUw = [];
//We need one more stage in size of saha factor than number of stages we're actualy populating
        thisLogUw.length = numStages+1;
        for (var i = 0; i < numStages+1; i++){
           thisLogUw[i] = 0.0;
        }

        var logE10 = Math.log(10.0);
        //var logUw = [];
//We need one more stage in size of saha factor than number of stages we're actualy populating
        //logUw.length = numStages+1;
        //for (var i  = 0; i < numStages+1; i++){
        //   logUw[i] = [];
        //   logUw[i].length = 5;
        //} 
        //for (var i  = 0; i < numStages; i++){
        //   for (var k = 0; k < 5; k++){
        //        logUw[i][k] = logE10*log10UwAArr[i][k];
        //   } // lburns- what variable can we use instead of 5?
        //} 
        //Assume ground state statistical weight (or partition fn) of highest stage is 1.0;
        //var logGw5 = 0.0;
        //for (var k = 0; k < 5; k++){
        //    logUw[numStages][k] = 0.0;
        //} // lburns

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
   var ifMols = true;
   if (numMols == 0){
       ifMols = false;
       numMols = 1;
//This should be inherited, but let's make sure: 
       dissEArr[0] = 19.0; //eV
   }

//Molecular partition functions - default initialization:
       var thisLogUwB = [];
       thisLogUwB.length = numMols;
       for (var iMol = 0; iMol < numMols; iMol++){
          thisLogUwB[iMol] = 0.0; // variable for temp-dependent computed partn fn of array element B 
       }
         var thisLogUwA = 0.0; // element A 
         var thisLogQwAB = Math.log(300.0);

//For clarity: neutral stage of atom whose ionization equilibrium is being computed is element A
// for molecule formation:
        var logUwA = [];
      if (numMols > 0){
        logUwA.length = 5;
        for (var k = 0; k < logUwA.length; k++){
            logUwA[k] = logUw[0][k];
        } // lburns
      }
// Array of elements B for all molecular species AB:
      // var logUwB = [];
      //if (numMols > 0){
      // logUwB.length = numMols;
      // for (var iMol = 0; iMol < numMols; iMol++){
      //    logUwB[iMol] = [];
      //    logUwB[iMol].length = 5;
      // } 
      //  for (var iMol  = 0; iMol < numMols; iMol++){
      //     for (var k = 0; k < 5; k++){
      //          logUwB[iMol][k] = logE10*log10UwBArr[iMol][k];
      //     } // lburns
      //  }
      //}
//// Molecular partition functions:
//       var logQwAB = [];
//      //if (numMols > 0){
//       logQwAB.length = numMols;
//       for (var iMol = 0; iMol < numMols; iMol++){
//          logQwAB[iMol] = logE10*logQwABArr[iMol];
//       }
//      //}
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
            thisTemp = temp[0][id];

// NEW Determine temperature dependent partition functions Uw: lburns
        if (thisTemp <= 130){
            for (var iStg = 0; iStg < numStages; iStg++){
                thisLogUw[iStg] = logUw[iStg][0];
            }
            for (var iMol = 0; iMol < numMols; iMol++){
                thisLogUwB[iMol] = logUwB[iMol][0];
            }
        }
        if (thisTemp > 130 && thisTemp <= 500){
            for (var iStg = 0; iStg < numStages; iStg++){
                thisLogUw[iStg] = logUw[iStg][1] * (thisTemp - 130)/(500 - 130)
                                + logUw[iStg][0] * (500 - thisTemp)/(500 - 130);
            }
            for (var iMol = 0; iMol < numMols; iMol++){
                thisLogUwB[iMol] = logUwB[iMol][1] * (thisTemp - 130)/(500 - 130)
                                 + logUwB[iMol][0] * (500 - thisTemp)/(500 - 130);
            }
        }
        if (thisTemp > 500 && thisTemp <= 3000){
            for (var iStg = 0; iStg < numStages; iStg++){
                thisLogUw[iStg] = logUw[iStg][2] * (thisTemp - 500)/(3000 - 500)
                                + logUw[iStg][1] * (3000 - thisTemp)/(3000 - 500);
            }
            for (var iMol = 0; iMol < numMols; iMol++){
                thisLogUwB[iMol] = logUwB[iMol][2] * (thisTemp - 500)/(3000 - 500)
                                 + logUwB[iMol][1] * (3000 - thisTemp)/(3000 - 500);
            }
        }
        if (thisTemp > 3000 && thisTemp <= 8000){
            for (var iStg = 0; iStg < numStages; iStg++){
                thisLogUw[iStg] = logUw[iStg][3] * (thisTemp - 3000)/(8000 - 3000)
                                + logUw[iStg][2] * (8000 - thisTemp)/(8000 - 3000);
            }
            for (var iMol = 0; iMol < numMols; iMol++){
                thisLogUwB[iMol] = logUwB[iMol][3] * (thisTemp - 3000)/(8000 - 3000)
                                 + logUwB[iMol][2] * (8000 - thisTemp)/(8000 - 3000);
            }
        }
        if (thisTemp > 8000 && thisTemp < 10000){
            for (var iStg = 0; iStg < numStages; iStg++){
                thisLogUw[iStg] = logUw[iStg][4] * (thisTemp - 8000)/(10000 - 8000)
                                + logUw[iStg][3] * (10000 - thisTemp)/(10000 - 8000);
            }
            for (var iMol = 0; iMol < numMols; iMol++){
                thisLogUwB[iMol] = logUwB[iMol][4] * (thisTemp - 8000)/(10000 - 8000)
                                 + logUwB[iMol][3] * (10000 - thisTemp)/(10000 - 8000);
            }
        }
        if (thisTemp >= 10000){
            for (var iStg = 0; iStg < numStages; iStg++){
                thisLogUw[iStg] = logUw[iStg][4];
            }
            for (var iMol = 0; iMol < numMols; iMol++){
                thisLogUwB[iMol] = logUwB[iMol][4];
            }
        }

         thisLogUw[numStages] = 0.0;
      for (var iMol = 0; iMol < numMols; iMol++){
         if (thisTemp < 3000.0){
            thisLogQwAB = ( logQwABArr[iMol][1] * (3000.0 - thisTemp)/(3000.0 - 500.0) )
                        + ( logQwABArr[iMol][2] * (thisTemp - 500.0)/(3000.0 - 500.0) );
         }
         if ( (thisTemp >= 3000.0) && (thisTemp <= 8000.0) ){
            thisLogQwAB = ( logQwABArr[iMol][2] * (8000.0 - thisTemp)/(8000.0 - 3000.0) )
                        + ( logQwABArr[iMol][3] * (thisTemp - 3000.0)/(8000.0 - 3000.0) );
         }
         if ( thisTemp > 8000.0 ){
            thisLogQwAB = ( logQwABArr[iMol][3] * (10000.0 - thisTemp)/(10000.0 - 8000.0) )
                        + ( logQwABArr[iMol][4] * (thisTemp - 8000.0)/(10000.0 - 8000.0) );
         }
      } // iMol loop

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
             logSahaMol[iMol] = logMolSahaFac[iMol] - logNumB[iMol][id] - (boltzFacIAB[iMol] / temp[0][id]) + (3.0 * temp[1][id] / 2.0) + thisLogUwB[iMol] + thisLogUwA - thisLogQwAB;
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
           if (ifMols == true){
              for (var iMol = 0; iMol < numMols; iMol++){
                denominator = denominator + invSahaMol[iMol];
              }
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
    }; //end method stagePops2    
   

// RHS of partial pressure formulation of Saha equation in standard form (N_U*P_e/N_L on LHS)
 // Returns depth distribution of LHS: Phi(T) === N_U*P_e/N_L (David Gray notation)

// Input parameters:
// chiI - ground state ionization energy of lower stage
// log10UwUArr, log10UwLArr - array of temperature-dependent partition function for upper and lower ionization stage
// Also needs atsmopheric structure information:
// numDeps
// temp structure
//
// Atomic element "A" is the one whose ionization fractions are being computed
//  Element "B" refers to array of other species with which A forms molecules "AB"

    //public static double[] sahaRHS(double chiI, double[] log10UwUArr, double[] log10UwLArr,
    //             int numDeps, double[][] temp) {
  //  var sahaRHS = function(chiI, log10UwUArr, log10UwLArr,
  //                temp) {
    var sahaRHS = function(chiI, logUwU, logUwL,
                  temp) {


        var ln10 = Math.log(10.0);
        var logE = Math.log10(Math.E); // for debug output
        var log2pi = Math.log(2.0 * Math.PI);
        var log2 = Math.log(2.0);


//    var numMols = dissEArr.length;


// Parition functions passed in are 2-element vectore with remperature-dependent base 10 log Us
// Convert to natural logs:
        var Ttheta, thisTemp;
  //Default initializations:
//We need one more stage in size of saha factor than number of stages we're actualy populating
        var thisLogUwU = 0.0;
        var thisLogUwL = 0.0;

        var logE10 = Math.log(10.0);
//We need one more stage in size of saha factor than number of stages we're actualy populating
       // var logUwU = [];
       // logUwU.length = 5;
       // var logUwL = [];
       // logUwL.length = 5;
        // For logUwL AND logUwU: new lburns
           for (var k = 0; k < logUwL.length; k++){
                logUwU[k] = logUwL[k];
                //logUwL[k] = logE10*log10UwLArr[k];
           }


        //System.out.println("chiL before: " + chiL);
        // If we need to subtract chiI from chiL, do so *before* converting to tiny numbers in ergs!

//atomic ionization stage Boltzmann factors:
        var logChiI, logBoltzFacI;
        var boltzFacI;
           logChiI = Math.log(chiI) + logEv;
           logBoltzFacI = logChiI  - logK;
           boltzFacI = Math.exp(logBoltzFacI);

//Extra factor of k to get k^5/2 in the P_e formulation of Saha Eq.
        var logSahaFac = log2 + (3.0 / 2.0) * (log2pi + logMe + logK - 2.0 * logH) + logK;

        //double[] logLHS = new double[numDeps];
        var logLHS;

//   For atomic ionization stages:
        var logSaha, saha, expFac;

//        for (int id = 0; id < numDeps; id++) {

//
//Determine temperature dependent partition functions Uw:
            thisTemp = temp[0];

// NEW Determine temperature dependent partition functions Uw: lburns
            thisTemp = temp[0];

        if (thisTemp <= 130){
            thisLogUwU = logUwU[0];
            thisLogUwL = logUwL[0];
        }
        if (thisTemp > 130 && thisTemp <= 500){
            thisLogUwU = logUwU[1] * (thisTemp - 130)/(500 - 130)
                       + logUwU[0] * (500 - thisTemp)/(500 - 130);
            thisLogUwL = logUwL[1] * (thisTemp - 130)/(500 - 130)
                       + logUwL[0] * (500 - thisTemp)/(500 - 130);
        }
        if (thisTemp > 500 && thisTemp <= 3000){
            thisLogUwU = logUwU[2] * (thisTemp - 500)/(3000 - 500)
                       + logUwU[1] * (3000 - thisTemp)/(3000 - 500);
            thisLogUwL = logUwL[2] * (thisTemp - 500)/(3000 - 500);
                       + logUwL[1] * (3000 - thisTemp)/(3000 - 500);
        }
        if (thisTemp > 3000 && thisTemp <= 8000){
            thisLogUwU = logUwU[3] * (thisTemp - 3000)/(8000 - 3000)
                       + logUwU[2] * (8000 - thisTemp)/(8000 - 3000);
            thisLogUwL = logUwL[3] * (thisTemp - 3000)/(8000 - 3000)
                       + logUwL[2] * (8000 - thisTemp)/(8000 - 3000);
        }
        if (thisTemp > 8000 && thisTemp < 10000){
            thisLogUwU = logUwU[4] * (thisTemp - 8000)/(10000 - 8000)
                       + logUwU[3] * (10000 - thisTemp)/(10000 - 8000);
            thisLogUwL = logUwL[4] * (thisTemp - 8000)/(10000 - 8000)
                       + logUwL[3] * (10000 - thisTemp)/(10000 - 8000);
        }
        if (thisTemp >= 10000){
            thisLogUwU = logUwU[4];
            thisLogUwL = logUwL[4];
        }

   //Ionization stage Saha factors:

//Need T_kin^5/2 in the P_e formulation of Saha Eq.
               logSaha = logSahaFac - (boltzFacI /temp[0]) + (5.0 * temp[1] / 2.0) + thisLogUwU - thisLogUwL;
              // saha = Math.exp(logSaha);

                 //logLHS[id] = logSaha;
                 logLHS = logSaha;
 //       } //id loop

        return logLHS;
//
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

    //var molPops = function(nmrtrLogNumB, nmrtrDissE, log10UwA, nmrtrLog10UwB, nmrtrLogQwAB, nmrtrLogMuAB,  //species A data - ionization equilibrium of A
    //             numMolsB, logNumB, dissEArr, log10UwBArr, logQwABArr, logMuABArr,  //data for set of species "B" - molecular equlibrium for set {AB}
    //             logGroundRatio, numDeps, temp) {
    var molPops = function(nmrtrLogNumB, nmrtrDissE, logUwA, nmrtrLogUwB, nmrtrLogQwAB, nmrtrLogMuAB,  //species A data - ionization equilibrium of A
                 numMolsB, logNumB, dissEArr, logUwB, logQwABArr, logMuABArr,  //data for set of species "B" - molecular equlibrium for set {AB}
                 logGroundRatio, numDeps, temp) {
        //           molPops(nmrtrLogNumB, nmrtrDissE, log10UwA, nmrtrLog10UwB, nmrtrLogQwAB, nmrtrLogMuAB, 
         //    thisNumMols, logNumBArr, dissEArr, log10UwBArr, logQwABArr, logMuABArr,
          //           logGroundRatio, numDeps, temp)

        var logE = logTen(Math.E); // for debug output
 //console.log("Line: nmrtrLog10UwB[0] " + logE*nmrtrLog10UwB[0] + " nmrtrLog10UwB[1] " + logE*nmrtrLog10UwB[1]);

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
        var log2pi = Math.log(2.0 * Math.PI);
        var log2 = Math.log(2.0);

        var logE10 = Math.log(10.0);
// Convert to natural logs:
        var Ttheta, thisTemp;

//Treat at least one molecule - if there are really no molecules for an atomic species, 
//there will be one phantom molecule in the denominator of the ionization fraction
//with an impossibly high dissociation energy
   if (numMolsB == 0){
       numMolsB = 1;
//This should be inherited, but let's make sure: 
       dissEArr[0] = 29.0; //eV
   }

//Molecular partition functions - default initialization:
       var thisLogUwB = [];
       thisLogUwB.length = numMolsB;
       for (var iMol = 0; iMol < numMolsB; iMol++){
          thisLogUwB[iMol] = 0.0; // variable for temp-dependent computed partn fn of array element B 
       }
         var thisLogUwA = 0.0; // element A 
         var nmrtrThisLogUwB = 0.0; // element A
         var thisLogQwAB = Math.log(300.0);
         var nmrtrThisLogQwAB = Math.log(300.0);

//For clarity: neutral stage of atom whose ionization equilibrium is being computed is element A
// for molecule formation:
      //  var logUwA = [];
      //  logUwA.length = 5;
      //  var nmrtrLogUwB = [];
      //  nmrtrLogUwB.length = 5;
      //  for (var k = 0; k < logUwA.length; k++){
      //      logUwA[k] = logE10*log10UwA[k];
      //      nmrtrLogUwB[k] = logE10*nmrtrLog10UwB[k];
      //  } // lburns new loop

// Array of elements B for all molecular species AB:
     //  var logUwB = [];
     // //if (numMolsB > 0){
     //  logUwB.length = numMolsB;
     //  for (var iMol = 0; iMol < numMolsB; iMol++){
     //     logUwB[iMol] = [];
     //     logUwB[iMol].length = 5;
     //  } 
     //   for (var iMol  = 0; iMol < numMolsB; iMol++){
     //      for (var k = 0; k < 5; k++){
     //           logUwB[iMol][k] = logE10*log10UwBArr[iMol][k];
     //      } // lburns new loop
     //   }
      //}
//// Molecular partition functions:
//       var nmrtrLogQwAB = logE10*nmrtrLog10QwAB;
//       var logQwAB = [];
//      //if (numMolsB > 0){
//       logQwAB.length = numMolsB;
//       for (var iMol = 0; iMol < numMolsB; iMol++){
//          logQwAB[iMol] = logE10*logQwABArr[iMol];
//       }
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
        var nmrtrSaha, nmrtrLogSahaMol, nmrtrLogInvSahaMol; //, nmrtrInvSahaMol;
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

//Determine temperature dependent partition functions Uw:
            thisTemp = temp[0][id];

// NEW Determine temperature dependent partition functions Uw: lburns
        thisTemp = temp[0][id];
        if (thisTemp <= 130){
            thisLogUwA = logUwA[0];
            nmrtrThisLogUwB = nmrtrLogUwB[0];
            for (var iMol = 0; iMol < numMolsB; iMol++){
                thisLogUwB[iMol] = logUwB[iMol][0];
            }
        }
        if (thisTemp > 130 && thisTemp <= 500){
            thisLogUwA = logUwA[1] * (thisTemp - 130)/(500 - 130)
                       + logUwA[0] * (500 - thisTemp)/(500 - 130);
            nmrtrThisLogUwB = nmrtrLogUwB[1] * (thisTemp - 130)/(500 - 130)
                            + nmrtrLogUwB[0] * (500 - thisTemp)/(500 - 130);
            for (var iMol = 0; iMol < numMolsB; iMol++){
                thisLogUwB[iMol] = logUwB[iMol][1] * (thisTemp - 130)/(500 - 130)
                                 + logUwB[iMol][0] * (500 - thisTemp)/(500 - 130);
            }
        }
        if (thisTemp > 500 && thisTemp <= 3000){
            thisLogUwA = logUwA[2] * (thisTemp - 500)/(3000 - 500)
                       + logUwA[1] * (3000 - thisTemp)/(3000 - 500);
            nmrtrThisLogUwB = nmrtrLogUwB[2] * (thisTemp - 500)/(3000 - 500)
                            + nmrtrLogUwB[1] * (3000 - thisTemp)/(3000 - 500);
            for (var iMol = 0; iMol < numMolsB; iMol++){
                thisLogUwB[iMol] = logUwB[iMol][2] * (thisTemp - 500)/(3000 - 500)
                                 + logUwB[iMol][1] * (3000 - thisTemp)/(3000 - 500);
            }
        }
        if (thisTemp > 3000 && thisTemp <= 8000){
            thisLogUwA = logUwA[3] * (thisTemp - 3000)/(8000 - 3000)
                       + logUwA[2] * (8000 - thisTemp)/(8000 - 3000);
            nmrtrThisLogUwB = nmrtrLogUwB[3] * (thisTemp - 3000)/(8000 - 3000)
                            + nmrtrLogUwB[2] * (8000 - thisTemp)/(8000 - 3000);
            for (var iMol = 0; iMol < numMolsB; iMol++){
                thisLogUwB[iMol] = logUwB[iMol][3] * (thisTemp - 3000)/(8000 - 3000)
                                 + logUwB[iMol][2] * (8000 - thisTemp)/(8000 - 3000);
            }
        }
        if (thisTemp > 8000 && thisTemp < 10000){
            thisLogUwA = logUwA[4] * (thisTemp - 8000)/(10000 - 8000)
                       + logUwA[3] * (10000 - thisTemp)/(10000 - 8000);
            nmrtrThisLogUwB = nmrtrLogUwB[4] * (thisTemp - 8000)/(10000 - 8000)
                            + nmrtrLogUwB[3] * (10000 - thisTemp)/(10000 - 8000);
            for (var iMol = 0; iMol < numMolsB; iMol++){
                thisLogUwB[iMol] = logUwB[iMol][4] * (thisTemp - 8000)/(10000 - 8000)
                                 + logUwB[iMol][3] * (10000 - thisTemp)/(10000 - 8000);
            }
        }
        if (thisTemp >= 10000){
            thisLogUwA = logUwA[4];
            nmrtrThisLogUwB = nmrtrLogUwB[4];
            for (var iMol = 0; iMol < numMolsB; iMol++){
                thisLogUwB[iMol] = logUwB[iMol][4];
            }
        }

      for (var iMol = 0; iMol < numMolsB; iMol++){
         if (thisTemp < 3000.0){
            thisLogQwAB = ( logQwABArr[iMol][1] * (3000.0 - thisTemp)/(3000.0 - 500.0) )
                        + ( logQwABArr[iMol][2] * (thisTemp - 500.0)/(3000.0 - 500.0) );
         }
         if ( (thisTemp >= 3000.0) && (thisTemp <= 8000.0) ){
            thisLogQwAB = ( logQwABArr[iMol][2] * (8000.0 - thisTemp)/(8000.0 - 3000.0) )
                        + ( logQwABArr[iMol][3] * (thisTemp - 3000.0)/(8000.0 - 3000.0) );
         }
         if ( thisTemp > 8000.0 ){
            thisLogQwAB = ( logQwABArr[iMol][3] * (10000.0 - thisTemp)/(10000.0 - 8000.0) )
                        + ( logQwABArr[iMol][4] * (thisTemp - 8000.0)/(10000.0 - 8000.0) );
         }
         if (thisTemp < 3000.0){
            nmrtrThisLogQwAB = ( nmrtrLogQwAB[1] * (3000.0 - thisTemp)/(3000.0 - 500.0) )
                             + ( nmrtrLogQwAB[2] * (thisTemp - 500.0)/(3000.0 - 500.0) );
         }
         if ( (thisTemp >= 3000.0) && (thisTemp <= 8000.0) ){
            nmrtrThisLogQwAB = ( nmrtrLogQwAB[2] * (8000.0 - thisTemp)/(8000.0 - 3000.0) )
                             + ( nmrtrLogQwAB[3] * (thisTemp - 3000.0)/(8000.0 - 3000.0) );
         }
         if ( thisTemp > 8000.0 ){
            nmrtrThisLogQwAB = ( nmrtrLogQwAB[3] * (10000.0 - thisTemp)/(10000.0 - 8000.0) )
                             + ( nmrtrLogQwAB[4] * (thisTemp - 8000.0)/(10000.0 - 8000.0) );
         }
      } //iMol loop

//For clarity: neutral stage of atom whose ionization equilibrium is being computed is element A
// for molecule formation:

   //Ionization stage Saha factors: 
//          if (id == 16){
//console.log("id " + id + " nmrtrLogNumB[id] " + logE*nmrtrLogNumB[id] + " pp nmrtB " + (logE*(nmrtrLogNumB[id]+temp[1][id]+logK)) + " nmrtrThisLogUwB " + logE*nmrtrThisLogUwB + " thisLogUwA " + logE*thisLogUwA + " nmrtrLogQwAB " + logE*nmrtrThisLogQwAB);             
//   }
               nmrtrLogSahaMol = nmrtrLogMolSahaFac - nmrtrLogNumB[id] - (nmrtrBoltzFacIAB / temp[0][id]) + (3.0 * temp[1][id] / 2.0) + nmrtrThisLogUwB + thisLogUwA - nmrtrThisLogQwAB;
               nmrtrLogInvSahaMol = -1.0 * nmrtrLogSahaMol;
               //nmrtrInvSahaMol = Math.exp(nmrtrLogSahaMol);
          //if (id == 16){
          //    console.log("nmrtrLogInvSahaMol " + logE*nmrtrLogInvSahaMol);
          //}
          //if (id == 16){
          //     console.log("nmrtrBoltzFacIAB " + nmrtrBoltzFacIAB + " nmrtrThisLogUwB " + logE*nmrtrThisLogUwB + " thisLogUwA " + logE*thisLogUwA + " nmrtrLogQwAB " + nmrtrLogQwAB);   
          //     console.log("nmrtrLogSahaMol " + logE*nmrtrLogSahaMol); // + " nmrtrInvSahaMol " + nmrtrInvSahaMol);
          //}

//Molecular Saha factors:
         for (var iMol = 0; iMol < numMolsB; iMol++){
//console.log("iMol " + iMol + " id " + id + " logNumB[iMol][id] " + logE*nmrtrLogNumB[id]);             
             logSahaMol[iMol] = logMolSahaFac[iMol] - logNumB[iMol][id] - (boltzFacIAB[iMol] / temp[0][id]) + (3.0 * temp[1][id] / 2.0) + thisLogUwB[iMol] + thisLogUwA - thisLogQwAB;
//For denominator of ionization fraction, we need *inverse* molecular Saha factors (N_AB/NI):
             logSahaMol[iMol] = -1.0 * logSahaMol[iMol];
             invSahaMol[iMol] = Math.exp(logSahaMol[iMol]);
             //TEST invSahaMol[iMol] = 1.0e-99; //test
         // if (id == 16){
         //     console.log("iMol " + iMol + " boltzFacIAB[iMol] " + boltzFacIAB[iMol] + " thisLogUwB[iMol] " + logE*thisLogUwB[iMol] + " logQwAB[iMol] " + logE*thisLogQwAB + " logNumB[iMol][id] " + logE*logNumB[iMol][id] + " logMolSahaFac[iMol] " + logE*logMolSahaFac[iMol]);   
         //     console.log("iMol " + iMol + " logSahaMol " + logE*logSahaMol[iMol] + " invSahaMol[iMol] " + invSahaMol[iMol]);
         // }
         }

//Compute log of denominator is ionization fraction, f_stage 
        //default initialization 
        //  - ratio of total atomic particles in all ionization stages to number in ground state: 
            var denominator = Math.exp(logGroundRatio[id]); //default initialization - ratio of total atomic particles in all ionization stages to number in ground state 
//molecular contribution
           for (var iMol = 0; iMol < numMolsB; iMol++){
         // if (id == 16){
         //     console.log("iMol " + iMol + " invSahaMol " + invSahaMol[iMol] + " denominator " + denominator);
         // } 
              denominator = denominator + invSahaMol[iMol];
           }
// 
            var logDenominator = Math.log(denominator); 
         // if (id == 16){
         //   console.log("id " + id + " logGroundRatio " + logE*logGroundRatio[id] + " logDenominator " + logE*logDenominator);
         // }  
         // if (id == 16){
         //      console.log("logDenominator " + logE*logDenominator);
         // }
            //var logDenominator = Math.log( 1.0 + saha21 + (saha32 * saha21) + (saha43 * saha32 * saha21) + (saha54 * saha43 * saha32 * saha21) );

          logMolFrac[id] = nmrtrLogInvSahaMol - logDenominator;
         // if (id == 16){
         //      console.log("id " + id + " logMolFrac[id] " + logE*logMolFrac[id]);
         // }

            //logNums[id] = logNum[id] + logMolFrac;
        } //id loop

        return logMolFrac;
    }; //end method molPops    


 /**
 * Collection of methods for computing molecular band opacity in the
 * Just-overlapping-line approximation (JOLA)
 * Just-overlapping line approximation treats molecular ro-vibrational bands as pseudo-continuum
 * opacity sources by "smearing" out the individual rotational fine-structure lines
 *See 1982A&A...113..173Z, Zeidler & Koestler, 1982
 */

    var jolaGrid = function(jolaLambda, jolaNumPoints){

     //Try linear wavelength sampling of JOLA band for now...

      var jolaPoints = [];
      jolaPoints.length = jolaNumPoints;

      var iLambD = 0.0;
      var deltaLamb = (jolaLambda[1] - jolaLambda[0]) / jolaNumPoints;

      for (var iL = 0; iL < jolaNumPoints; iL++){
         iLambD = 1.0*iL;
         jolaPoints[iL] = jolaLambda[0] + iLambD*deltaLamb; //nm
        // console.log("iL: " + iL + " jolaPoints " + jolaPoints[iL]);
      }

      return jolaPoints; //nm

    }; //end method jolaGrid

//
//JOLA profile for P (Delta J = 1) and R (Delta J = 1) branches
//Equation 19 from Zeidler & Koestler
    var jolaProfilePR = function(omega0, logf, vibConst,
                    jolaPoints, alphP, alphR, numDeps, temp) {

        var log10E = logTen(Math.E);

          var numPoints = jolaPoints.length;
 // derivative of rotational-line oscillator strength with respect to frequency
          var dfBydw = [];
          dfBydw.length = numPoints;
          for (var ii = 0; ii < numPoints; ii++){
             dfBydw[ii] = [];
             dfBydw[ii].length = numDeps;
          }
          var fvv = Math.exp(logf);

          var logHcBbyK = logH + logC + Math.log(vibConst[0]) - logK;

 //System.out.println("omega0 " + omega0 + " logf " + log10E*logf + " vibConst " + vibConst[0] + " " + vibConst[1] + " alphP " + alphP + " alphR " + alphR);

          var Bsum = vibConst[1] + vibConst[0];
          var Bdiff = vibConst[1] - vibConst[0];

//value of J-related "m" at band-head:
          var mH = -1.0 * Bsum / (2.0*Bdiff); //Eq. 14
//Frequency (or wavenumber??) at band head:
          var wH = ( -1.0 * Bdiff * mH*mH ) + omega0; //Eq. 15  
          //System.out.println("1.0/wH " + 1.0/wH + " 1.0/omega0 " + 1.0/omega0);

          var mTheta1 = 1.0; //R branch?
          var mTheta2 = 1.0; //P branch?

          var m1, m2; // related to J, for R & P branches, respectively
          var alpha1 = 1.0;
          var alpha2 = 1.0;

 //value of m is closely related to rotational quantum number J,
 //Near band origin, frequency, w, range should correspond to -1 <= m <= 1 - ???:
          //double wMin = Useful.c / (1.0e-7*jolaPoints[numPoints-1]); //first frequency omega
          //double wMax = Useful.c / (1.0e-7*jolaPoints[0]); //last frequency omega
          //double deltaW = 0.02;
          var w, logW, m1Fctr, m2Fctr, mHelp, wMinuswHOverBDiff;
          var denom1, denom2, m1Term, m2Term;
          var help1, logHcBbyKt, hcBbyKt;

//Outer loop over frequency omega 
         // for (int iW = -1; iW <= 1; iW++){
          for (var iW = numPoints-1; iW >= 0; iW--){

             //dW = 1.0 * iW; 
             //w = wMin + (dW*deltaW); 
             //logW = Useful.logC - Math.log(1.0e-7*jolaPoints[iW]); //if w is freq in Hz
             logW = 0.0 - Math.log(1.0e-7*jolaPoints[iW]); //if w is waveno in cm^-1 
             w = Math.exp(logW);
             //System.out.println("logW " + log10E*logW);
             //I have no idea if this is right...
             wMinuswHOverBDiff = (w - wH) / Bdiff;
             mHelp = Math.sqrt(Math.abs(wMinuswHOverBDiff));  //Eq. 17
             m1 = mH + mHelp;
             m2 = mH - mHelp; //Eq. 18
             //System.out.println("mH " + mH + " m1 " + m1 + " m2 " + m2);
             m1Fctr = (m1*m1 - m1);
             m2Fctr = (m2*m2 - m2);
//The following association between the sign of m1 or m2 and whether 
//it's the P or the R branch might be backwards:
             if (m1 < 0){
               alpha1 = alphP;
             }
             if (m1 >= 0){
               alpha1 = alphR;
             }
             if (m2 < 0){
               alpha2 = alphP;
             }
             if (m2 >= 0){
               alpha2 = alphR;
             }

             denom1 = Math.abs(Bsum + 2.0*m1*Bdiff);
             denom2 = Math.abs(Bsum + 2.0*m2*Bdiff);

             for (var iD = 0; iD < numDeps; iD++){

               if (wMinuswHOverBDiff > 0){
                 logHcBbyKt = logHcBbyK - temp[1][iD];
                 hcBbyKt = Math.exp(logHcBbyKt);

                 help1 = -1.0 * hcBbyKt * m1Fctr;
                 m1Term = alpha1 * mTheta1 * Math.exp(help1) / denom1;

                 help1 = -1.0 * hcBbyKt * m2Fctr;
                 m2Term = alpha2 * mTheta2 * Math.exp(help1) / denom2;

//Can this be used like a differential cross-section (once converted to sigma)?  
                 //console.log("fvv " + fvv + " hcBbyKt " + hcBbyKt + " m1Term " + m1Term + " m2Term " + m2Term); 
                 dfBydw[iW][iD] = fvv * hcBbyKt * ( m1Term + m2Term );  // Eq. 19     
               } else {
                 dfBydw[iW][iD] = 0.0;
               }
               //if (iD%10 == 1){
               //  console.log("PR iD " + iD + " iW " + iW + " dfBydw " + dfBydw[iW][iD]);
               //}

             } //iD - depth loop 

          } //iW - frequency loop

       return dfBydw;

    }; //end method jolaProfilePR 
//

//JOLA profile for Q (Delta J = 0) branch
//Equation 24 from Zeidler & Koestler
    var jolaProfileQ = function(omega0, logf, vibConst,
                     jolaPoints, alphQ, numDeps, temp){

          var numPoints = jolaPoints.length;
 // derivative of rotational-line oscillator strength with respect to frequency
          var dfBydw = [];
          dfBydw.length = numPoints;
          for (var ii = 0; ii < numPoints; ii++){
             dfBydw[ii] = [];
             dfBydw[ii].length = numDeps;
          }
          var fvv = Math.exp(logf);
          var logHcBbyK = logH + logC + Math.log(vibConst[0]) - logK;

          var Bsum = vibConst[1] + vibConst[0];
          var Bdiff = vibConst[1] - vibConst[0];

          var mQ; // related to J, for R & P branches, respectively

 //value of m is closely related to rotational quantum number J,
 //Near band origin, frequency, w, range should correspond to -1 <= m <= 1 - ???:
    //      double wMin = Useful.c / (1.0e-7*lambda[1]); //first frequency omega
     //     double wMax = Useful.c / (1.0e-7*lambda[0]); //last frequency omega
      //    double deltaW = 0.02;
          var w, logW, mQFctr, mHelp;
          var denom, mQTerm, wMinusw0OverBDiff;
          var help1, logHcBbyKt, hcBbyKt;

//Outer loop over frequency omega 
          //for (int iW = -1; iW <= 1; iW++){
          for (var iW = numPoints-1; iW >= 0; iW--){

             //dW = 1.0 * iW; 
             //w = wMin + (dW*deltaW); 
             //logW = Useful.logC - Math.log(1.0e-7*jolaPoints[iW]); //if w is freq in Hz
             logW = 0.0 - Math.log(1.0e-7*jolaPoints[iW]); //if w is waveno in cm^-1 
             w = Math.exp(logW);

             //I have no idea if this is right...
             wMinusw0OverBDiff = (w - omega0) / Bdiff;
             mHelp = 0.25 + Math.abs(wMinusw0OverBDiff);
             mHelp = Math.sqrt(mHelp);  //Eq. 17
             mQ = -0.5 + mHelp;
             mQFctr = (mQ*mQ - mQ);
             denom = Math.abs(Bdiff);

             for (var iD = 0; iD < numDeps; iD++){

               if (wMinusw0OverBDiff > 0){

                 logHcBbyKt = logHcBbyK - temp[1][iD];
                 hcBbyKt = Math.exp(logHcBbyKt);

                 help1 = -1.0 * hcBbyKt * mQFctr;
                 mQTerm = Math.exp(help1) / denom;


//Can this be used like a differential cross-section (once converted to sigma)?  
                 //System.out.println("alphQ " + alphQ + " fvv " + " logHcBbyKt " + logHcBbyKt + " mQTerm " + mQTerm);
                 dfBydw[iW][iD] = alphQ * fvv * hcBbyKt * mQTerm;  // Eq. 24      

               } else {

                  dfBydw[iW][iD] = 0.0;

               }

               //if (iD%10 == 1){
                 //System.out.println("Q iD " + iD + " iW " + iW + " dfBydw " + dfBydw[iW][iD]);
               //}

             } //iD - depth loop 

          } //iW - frequency loop

       return dfBydw;


    }; //end method jolaProfileQ 
  //

    var jolaKap = function(jolaLogNums, dfBydw, jolaPoints,
                     numDeps, temp, rho){

      var log10E = logTen(Math.E);

      var numPoints = jolaPoints.length;

      var logKappaJola = [];
      logKappaJola.length = numPoints;
      for (var ii = 0; ii < numPoints; ii++){
          logKappaJola[ii] = [];
          logKappaJola[ii].length = numDeps;
      }
//Initialize this carefully:

     for (var iD = 0; iD < numDeps; iD++){
       for (var iW = 0; iW < numPoints; iW++){
          logKappaJola[iW][iD] = -999.0;
       }
     }

      var stimEmExp, stimEmLogExp, stimEmLogExpHelp, stimEm;
      var freq, lastFreq, w, lastW, deltaW, thisDeltaF;
      var logSigma = -999.0;
      var logFreq = logC - Math.log(1.0e-7 * jolaPoints[0]);
      var logW = 0.0 - Math.log(1.0e-7 * jolaPoints[0]); //if w is waveno in cm^-1
      //lastFreq = Math.exp(logFreq); 
      lastW = Math.exp(logW);

//try accumulating oscillator strenth, f, across band - assumes f = 0 at first (largest) lambda- ??
     var thisF = 0.0;

//if f is cumulative in wavenumber, we have to make the depth loop the outer loop even
//if it means re-computing depth-independent quantities each time:
     for (var iD = 0; iD < numDeps; iD++){

       thisF = 0.0; //reset accumulator

//loop in order of *increasing* wavenumber
       for (var iW = numPoints-1; iW >=1; iW--){

//df/dv is a differential oscillator strength in *frequency* space:
        logFreq = logC - Math.log(1.0e-7*jolaPoints[iW]);
        freq = Math.exp(logFreq);
        logW = 0.0 - Math.log(1.0e-7 * jolaPoints[iW]); //if w is waveno in cm^-1
        w = Math.exp(logW); //if w is waveno in cm^-1
        //deltaW = Math.abs(freq - lastFreq);
        deltaW = Math.abs(w - lastW);

//For LTE stimulated emission correction:
        stimEmLogExpHelp = logH + logFreq - logK;

        //for (var iD = 0; iD < numDeps; iD++){

          thisDeltaF = deltaW * dfBydw[iW][iD];
          if (thisDeltaF > 0.0){
            thisF += thisDeltaF; //cumulative
            //thisF = thisDeltaF; //non-cumulative
            logSigma = Math.log(thisF) + Math.log(Math.PI) + 2.0*logEe - logMe - logC;
          } else {
            logSigma = -999.0;
          }

// LTE stimulated emission correction:
          stimEmLogExp = stimEmLogExpHelp - temp[1][iD];
          stimEmExp = -1.0 * Math.exp(stimEmLogExp);
          stimEm = ( 1.0 - Math.exp(stimEmExp) );

//extinction coefficient in cm^2 g^-1:
          logKappaJola[iW][iD] = logSigma + jolaLogNums[iD] - rho[1][iD] + Math.log(stimEm);
          if (logKappaJola[iW][iD] > 49.0){
            logKappaJola[iW][iD] = 49.0;
          }
          //logKappaJola[iW][iD] = -999.0; 
          //if (iD%10 == 1){
          //  console.log("iD " + iD + " iW " + iW + " logFreq " + log10E*logFreq + " logW " + log10E*logW + " logStimEm " + log10E*Math.log(stimEm));
          //  console.log("iD " + iD + " iW " + iW + " thisDeltaF " + thisDeltaF + " logSigma " + log10E*logSigma + " jolaLogNums " + log10E*jolaLogNums[iD] + " rho " + log10E*rho[1][iD] + " logKappaJola " + log10E*logKappaJola[iW][iD]);
          //} 

    //    } //iD loop - depths

          lastFreq = freq;
        } //iW loop - wavelength
      } //iD loop - depths

      return logKappaJola;

    }; //end method jolaKap


    
