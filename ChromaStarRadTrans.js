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
// // *********************************************************
// 
// 
// Radiative transfer astrophysical functions:
//

var lamgrid = function(numLams, lamSetup) {


    var lambdaScale = [];
    lambdaScale.length = numLams;
    var logLambda;
    // Space lambdas logarithmically:
    var logLam1 = logTen(lamSetup[0]);
    var logLam2 = logTen(lamSetup[1]);
    var delta = (logLam2 - logLam1) / numLams;
    var ii;
    for (var i = 0; i < numLams; i++) {

        ii = 1.0 * i;
        logLambda = logLam1 + (ii * delta);
        lambdaScale[i] = Math.pow(10.0, logLambda);
        //System.out.println("il " + i + " lambda: " + lambdaScale[i]); //debug

    }

    return lambdaScale;
};


var thetas = function() {

    //int numThetas = 10; // guess
    //double[] cosTheta = new double[numThetas];
    // Try equal distribution in cos(theta) space (rather than Gaussian quadrature)

    //  cosTheta is a 2xnumThetas array:
    // row 0 is used for Gaussian quadrature weights
    // row 1 is used for cos(theta) values
    // Gaussian quadrature:


    /* ***************
     "n = 21" Gaussian quadrature weights, w_i, and abscissae from 
     http://pomax.github.io/bezierinfo/legendre-gauss.html
     - ie. 11 point among 0 and positive abcissae
     
     This 11/21 of a 21-point formula: 0 plus the positive abscissae ,
     so I *think* it represents *half* the integral on the interval [-1,1],
     ie., on the interval[0,1].   SO: Divide the first weight (x=0) by 2 so 
     that the quadrature sum is exactly half the integral on [-1,1]. 
     ********** */


    var nGauss = 11;
    var theta = [];
    theta.length = nGauss;
    var weight = [];
    weight.length = nGauss;
    var cosTheta = [weight, theta];
    // I *think* the "thetas" being assigned here (abcissae) are fractional
    // angles, theta/(pi/2).

    // For nGauss = 7;
    //           // 7 points on [0,1] from 13 point Gaussian quadrature on [-1,1]
    // weight[0] = 0.2325515532308739;  // disk center
    //  theta[0] = 0.0000000000000000;
    // weight[1] = 0.2262831802628972;
    //  theta[1] = 0.2304583159551348;
    //  weight[2] = 0.2078160475368885;
    //  theta[2] = 0.4484927510364469;
    //   weight[3] = 0.1781459807619457;
    //   theta[3] = 0.6423493394403402;
    //   weight[4] = 0.1388735102197872;
    //   theta[4] = 0.8015780907333099;
    //   weight[5] = 0.0921214998377285;
    //   theta[5] = 0.9175983992229779;
    //   weight[6] = 0.0404840047653159;
    //  theta[6] = 0.9841830547185881;   //limb

    // For nGauss = 9;
    // 9 points on [0,1] from 17 point Gaussian quadrature on [-1,1]    
    //weight[0] = 0.1794464703562065;  //disk center
    //theta[0] = 0.0000000000000000;
    //weight[1] = 0.1765627053669926;
    //theta[1] = 0.1784841814958479;
    //weight[2] = 0.1680041021564500;
    //theta[2] = 0.3512317634538763;
    //weight[3] = 0.1540457610768103;
    //theta[3] = 0.5126905370864769;
    //weight[4] = 0.1351363684685255;
    //theta[4] = 0.6576711592166907;
    //weight[5] = 0.1118838471934040;
    //theta[5] = 0.7815140038968014;
    //weight[6] = 0.0850361483171792;
    //theta[6] = 0.8802391537269859;
    //weight[7] = 0.0554595293739872;
    //theta[7] = 0.9506755217687678;
    //weight[8] = 0.0241483028685479;
    //theta[8] = 0.9905754753144174;  //limb


    // For nGauss = 11;
    // 11 points on [0,1] from 21 point Gaussian quadrature on [-1,1]    
    // // No? weight[0] = 0.5 * 0.1460811336496904;  // Divide the weight of the x=0 point by 2!  
    weight[0] = 0.1460811336496904;
    theta[0] = 0.0000000000000000; //disk centre
    weight[1] = 0.1445244039899700;
    theta[1] = 0.1455618541608951;
    weight[2] = 0.1398873947910731;
    theta[2] = 0.2880213168024011;
    weight[3] = 0.1322689386333375;
    theta[3] = 0.4243421202074388;
    weight[4] = 0.1218314160537285;
    theta[4] = 0.5516188358872198;
    weight[5] = 0.1087972991671484;
    theta[5] = 0.6671388041974123;
    weight[6] = 0.0934444234560339;
    theta[6] = 0.7684399634756779;
    weight[7] = 0.0761001136283793;
    theta[7] = 0.8533633645833173;
    weight[8] = 0.0571344254268572;
    theta[8] = 0.9200993341504008;
    weight[9] = 0.0369537897708525;
    theta[9] = 0.9672268385663063;
    weight[10] = 0.0160172282577743;
    theta[10] = 0.9937521706203895; //limb

    // For nGauss = 15;
    // 15 points on [0,1] from 29 point Gaussian quadrature on [-1,1]    
//weight[0] = 0.1064793817183142
//theta[0] = 0.0000000000000000
//weight[1] = 0.1058761550973209
//theta[1] = 0.1062782301326792
//weight[2] = 0.1040733100777294
//theta[2] = 0.2113522861660011
//weight[3] = 0.1010912737599150
//theta[3] = 0.3140316378676399
//weight[4] = 0.0969638340944086
//theta[4] = 0.4131528881740086
//weight[5] = 0.0917377571392588
//theta[5] = 0.5075929551242276
//weight[6] = 0.0854722573661725
//theta[6] = 0.5962817971382278
//weight[7] = 0.0782383271357638
//theta[7] = 0.6782145376026865
//weight[8] = 0.0701179332550513
//theta[8] = 0.7524628517344771
//weight[9] = 0.0612030906570791
//theta[9] = 0.8181854876152524
//weight[10] = 0.0515948269024979
//theta[10] = 0.8746378049201028
//weight[11] = 0.0414020625186828
//theta[11] = 0.9211802329530587
//weight[12] = 0.0307404922020936
//theta[12] = 0.9572855957780877
//weight[13] = 0.0197320850561227
//theta[13] = 0.9825455052614132
//weight[14] = 0.0085169038787464
//theta[14] = 0.9966794422605966


    // For nGauss = 17;
    // 15 points on [0,1] from 33 point Gaussian quadrature on [-1,1]    
//weight[0] = 0.0937684461602100
//theta[0] = 0.0000000000000000
//weight[1] = 0.0933564260655961
//theta[1] = 0.0936310658547334
//weight[2] = 0.0921239866433168
//theta[2] = 0.1864392988279916
//weight[3] = 0.0900819586606386
//theta[3] = 0.2776090971524970
//weight[4] = 0.0872482876188443
//theta[4] = 0.3663392577480734
//weight[5] = 0.0836478760670387
//theta[5] = 0.4518500172724507
//weight[6] = 0.0793123647948867
//theta[6] = 0.5333899047863476
//weight[7] = 0.0742798548439541
//theta[7] = 0.6102423458363790
//weight[8] = 0.0685945728186567
//theta[8] = 0.6817319599697428
//weight[9] = 0.0623064825303175
//theta[9] = 0.7472304964495622
//weight[10] = 0.0554708466316636
//theta[10] = 0.8061623562741665
//weight[11] = 0.0481477428187117
//theta[11] = 0.8580096526765041
//weight[12] = 0.0404015413316696
//theta[12] = 0.9023167677434336
//weight[13] = 0.0323003586323290
//theta[13] = 0.9386943726111684
//weight[14] = 0.0239155481017495
//theta[14] = 0.9668229096899927
//weight[15] = 0.0153217015129347
//theta[15] = 0.9864557262306425
//weight[16] = 0.0066062278475874
//theta[16] = 0.9974246942464552

//
    // For nGauss = 21;
    // 11 points on [0,1] from 41 point Gaussian quadrature on [-1,1]    
//    weight[0] = 0.0756955356472984;
//    theta[0] = 0.0000000000000000;
//    weight[1] = 0.0754787470927158;
//    theta[1] = 0.0756232589891630;
//    weight[2] = 0.0748296231762215;
//    theta[2] = 0.1508133548639922;
//    weight[3] = 0.0737518820272235;
//    theta[3] = 0.2251396056334228;
//    weight[4] = 0.0722516968610231;
//    theta[4] = 0.2981762773418249;
//    weight[5] = 0.0703376606208175;
//    theta[5] = 0.3695050226404815;
//    weight[6] = 0.0680207367608768;
//    theta[6] = 0.4387172770514071;
//    weight[7] = 0.0653141964535274;
//    theta[7] = 0.5054165991994061;
//    weight[8] = 0.0622335425809663;
//    theta[8] = 0.5692209416102159;
//    weight[9] = 0.0587964209498719;
//    theta[9] = 0.6297648390721963;
//    weight[10] = 0.0550225192425787;
//    theta[10] = 0.6867015020349513;
//    weight[11] = 0.0509334542946175;
//    theta[11] = 0.7397048030699261;
//    weight[12] = 0.0465526483690143;
//    theta[12] = 0.7884711450474093;
//    weight[13] = 0.0419051951959097;
//    theta[13] = 0.8327212004013613;
//    weight[14] = 0.0370177167035080;
//    theta[14] = 0.8722015116924414;
//    weight[15] = 0.0319182117316993;
//    theta[15] = 0.9066859447581012;
//    weight[16] = 0.0266358992071104;
//    theta[16] = 0.9359769874978539;
//    weight[17] = 0.0212010633687796;
//    theta[17] = 0.9599068917303463;
//    weight[18] = 0.0156449384078186;
//    theta[18] = 0.9783386735610834;
//    weight[19] = 0.0099999387739059;
//    theta[19] = 0.9911671096990163;
//    weight[20] = 0.0043061403581649;
//    theta[20] = 0.9983215885747715;


    for (var it = 0; it < nGauss; it++) {
        cosTheta[0][it] = weight[it];
        theta[it] = theta[it] * Math.PI / 2.0;
        cosTheta[1][it] = Math.cos(theta[it]);
    }


    return cosTheta;
};


/**
 * Formal solution of the LTE radiative transfer for the monochromatic *surface*
 * intensity, I_lambda(Tau=0, theta) at wavelength lambda
 *
 * Calls Planck.planck(lambda, temp) to get the LTE source function 
 * //Input lambda in nm for Planck
 */
var formalSoln = function(numDeps, cosTheta, lambda, tau, temp, lineMode) {

    var logE = logTen(Math.E); //for debug output

    var cutoff = 0.001; // tolerance for stopping deeper contriibutions to I(Tau=0)
    //  cosTheta is a 2xnumThetas array:
    // row 0 is used for Gaussian quadrature weights
    // row 1 is used for cos(theta) values
    // Gaussian quadrature:
    // Number of angles, numThetas, will have to be determined after the fact
    var numThetas = cosTheta[0].length;
    //System.out.println("FORMALSOLN: numThetas= " + numThetas);
    //double[][] intens = new double[numLams][numThetas];
    var intens = [];
    intens.length = numThetas;
    //double[] intens = new double[numThetas];

    // scratch variables:
    var logSource, lnInteg, integrand, invCosTheta, delta, newInt, increment;
    var lineSourceVec = [];
    lineSourceVec.length = numDeps;

    //Get line source function vector, of needed:
    if (lineMode) {
        lineSourceVec = lineSource(numDeps, tau, temp, lambda);
    }
    //for (int il = 0; il < numLams; il++ ) {
    for (var it = 0; it < numThetas; it++) {

        invCosTheta = 1.0 / cosTheta[1][it];
        newInt = 0;
        // Extended Simpson's Rule - Numerical Recipes in F77, 2nd Ed., p. 128
        // First point in formula:
        //lnSource = planck(temp[0][0], lambda);
        //lnInteg = lnSource - (tau[0][0] * invCosTheta);
        //integrand = Math.exp(lnInteg) * invCosTheta;
        //delta = (tau[0][1] - tau[0][0]);
        //increment = (1.0 / 3.0) * integrand * delta;
        //newInt = newInt + increment;
        // for (var id = 1; id < numDeps - 1; id++) {  // Extended Simpson's Rule
        for (var id = 1; id < numDeps; id++) {   // Extended rectangle Rule

            if (lineMode) {
                //Line mode mode - ETLA + coherent scattering: S_lambda = (1-eps)*J_lambda + eps*B_lambda
                logSource = lineSourceVec[id];
                //if (id === 5 && it === 0) {
                 //   console.log("logSource scat " + logE * logSource);
                //}
                ////logSource = planck(temp[0][id], lambda);
                //if (id === 5 && it === 0) {
                //    console.log("logSource therm " + logE * logSource);
                //}
            } else {
                //Continuum mode - S_lambda = B_lambda
                logSource = planck(temp[0][id], lambda);
            }

            logSource = planck(temp[0][id], lambda);
            lnInteg = logSource - (tau[0][id] * invCosTheta);
            integrand = Math.exp(lnInteg) * invCosTheta;
            delta = (tau[0][id] - tau[0][id - 1]);

// Extended Simpson's Rule
            //if ((id % 2) === 1) {
            //    increment = (4.0 / 3.0) * integrand * delta;
            //    newInt = newInt + increment;
            //}
//
            //          if ((id % 2) === 0) {
            //            increment = (2.0 / 3.0) * integrand * delta;
            //          newInt = newInt + increment;
            //    }

            // Extended rectangle rule:
            increment = integrand * delta;
            newInt = newInt + increment;

            // the following break-out condition is not so simple if using a closed formula: 
            // //Only keep adding contributions from deper layers if the contribution
            // // is significant

            if (tau[0][id] > 2.0 / 3.0) {
                if (newInt > 0) {
                    if (increment / newInt < cutoff) {
                        break;
                    }
                }
            }
        } //id - depth loop

        ////Last point: Extended Simpson's Rule
        //lnSource = planck(temp[0][numDeps - 1], lambda);
        //lnInteg = lnSource - (tau[0][numDeps - 1] * invCosTheta);
        //integrand = Math.exp(lnInteg) * invCosTheta;
        //delta = (tau[0][numDeps - 1] - tau[0][numDeps - 2]);
        //increment = (1.0 / 3.0) * integrand * delta;
        //newInt = newInt + increment;

        intens[it] = newInt;
    }   //it - theta loop

    //} // il - lambda loop
    return intens;
};


/**
 * Inputs: lambda: a single scalar wavelength in nm temp: a single scalar
 * temperature in K Returns log of Plank function in logBBlam - B_lambda
 * distribution in pure cgs units: ergs/s/cm^2/ster/cm
 */
var planck = function(temp, lambda) {

    //int numLams = (int) (( lamSetup[1] - lamSetup[0] ) / lamSetup[2]) + 1; 
    var logBBlam; //, BBlam;

    var c = 2.9979249E+10; // light speed in vaccuum in cm/s
    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var h = 6.62606957E-27; //Planck's constant in ergs sec
    var logC = Math.log(c);
    var logK = Math.log(k);
    var logH = Math.log(h);
    var logPreFac = Math.log(2.0) + logH + 2.0 * logC; //log
    var logExpFac = logH + logC - logK; //log
    //double preFac = 2.0 * h * ( c * c );  //linear
    //double expFac = ( h / k ) * c;      //linear

    //System.out.println("logC " + logC + " logK " + logK + " logH " + logH);
    //System.out.println("logPreFac " + logPreFac + " logExpFac " + logExpFac);
    //Declare scratch variables:
    var logLam, logPreLamFac, logExpLamFac, expon, logExpon, denom, logDenom; //log
    //double preLamFac, expLamFac, expon, denom; //linear

    //for (int il = 0; il < numLams; il++){
    //lambda = lambda[il] * 1.0E-7;  // convert nm to cm
    //lambda = lambda * 1.0E-7; // convert nm to cm
    logLam = Math.log(lambda); // Do the call to log for lambda once //log
    //System.out.println("lambda " + lambda + " logLam " + logLam);

    logPreLamFac = logPreFac - 5.0 * logLam; //log
    logExpLamFac = logExpFac - logLam; //log
    //System.out.println("logPreLamFac " + logPreLamFac + " logExpLamFac " + logExpLamFac);
    // Be VERY careful about how we divide by lambda^5:
    //preLamFac = preFac / ( lambda * lambda ); //linear
    //preLamFac = preLamFac / ( lambda * lambda );  //linear
    //preLamFac = preLamFac / lambda;   //linear
    //expLamFac = expFac / lambda;

    //for (int id = 0; id < numDeps; id++){
    //logExpon = logExpLamFac - temp[1][id];
    logExpon = logExpLamFac - Math.log(temp); //log
    //System.out.println("temp " + temp + " logTemp " + Math.log(temp));
    expon = Math.exp(logExpon); //log
    //System.out.println("logExpon " + logExpon + " expon " + expon + " denom " + denom);
    // expon = expLamFac / temp;  //linear
    denom = Math.exp(expon);
    denom = denom - 1.0;
    logDenom = Math.log(denom); //log

    //BBlam[1][id][il] = logPreLamFac - logDenom;
    //BBlam[0][id][il] = Math.exp(BBlam[1][id][il]);
    logBBlam = logPreLamFac - logDenom; //log
    // Not needed? BBlam = Math.exp(logBBlam);  //log
    //BBlam = preLamFac / denom;  //linear

    // } //id loop - depths
    // } //il loop - lambdas
    return logBBlam;
};

// Computes the first partial derivative of B(T) wrt T, dB/dT:
var dBdT = function(temp, lambda) {

    var logdBdTlam;

    var c = 2.9979249E+10; // light speed in vaccuum in cm/s
    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var h = 6.62606957E-27; //Planck's constant in ergs sec
    var logC = Math.log(c);
    var logK = Math.log(k);
    var logH = Math.log(h);

    var logPreFac = Math.log(2.0) + logH + 2.0 * logC;  //log
    var logExpFac = logH + logC - logK;      //log

    //Declare scratch variables:
    var logLam, logTemp, logPreLamFac, logExpLamFac, expon, logExpon, eTerm, denom, logDenom;  //log

    //lambda = lambda * 1.0E-7;  // convert nm to cm
    logLam = Math.log(lambda); // Do the call to log for lambda once //log
    logTemp = Math.log(temp);

    logPreLamFac = logPreFac + logExpFac - 6.0 * logLam - 2.0 * logTemp;  //log

    logExpLamFac = logExpFac - logLam;    //log

    //This is very subtle and dangerous!
    logExpon = logExpLamFac - logTemp;  // log of hc/kTlambda
    expon = Math.exp(logExpon);  // hc/kTlambda

    eTerm = Math.exp(expon); // e^hc/ktlambda
    denom = eTerm - 1.0; // e^hc/ktlambda - 1
    logDenom = Math.log(denom); // log(e^hc/ktlambda - 1)


    logdBdTlam = logPreLamFac + expon - 2.0 * logDenom;  //log

    return logdBdTlam;
};

/* Repalced with non-axisymmeti flux3()...
 *
// For some weird reason, JavaScript does not like the function name flux()!!! - Change to flux2()

//This version assumes axi-symmetry about positive z^ pointing at observer from substellar point
var flux2 = function(intens, cosTheta) {

    var fluxSurfSpec = [];
    fluxSurfSpec.length = 2;
    // returns surface flux as a 2XnumLams vector
    //  - Row 0 linear flux (cgs units)
    //  - Row 1 log_e flux
    //  cosTheta is a 2xnumThetas array:
    // row 0 is used for Gaussian quadrature weights
    // row 1 is used for cos(theta) values
    // Gaussian quadrature:
    // Number of angles, numThetas, will have to be determined after the fact


    var numThetas = cosTheta[0].length;
    //var numThetas = 11;

    var flx = 0.0;
    for (var it = 0; it < numThetas; it++) {

        flx = flx + intens[it] * cosTheta[1][it] * cosTheta[0][it];
        //flx = 1.E14;  //debug
    }  // it - theta loop

    fluxSurfSpec[0] = 2.0 * Math.PI * flx;
    fluxSurfSpec[1] = Math.log(fluxSurfSpec[0]);
    //DEBUG: fluxSurfSpec[0] = 1.0E14;
    //DEBUG: fluxSurfSpec[1] = 14.0;

    return fluxSurfSpec;
};
*/

//This version of flux() does not assume axi-symmetry about z^, and provides for macro-turbulent and rotational
// broadening without post-convolution of the flux spectrum

var flux3 = function(intens, lambdas, cosTheta, phi, radius, omegaSini, macroV) {

    //console.log("Entering flux3");

   var numLams = lambdas.length;

    var fluxSurfSpec = [];
    fluxSurfSpec.length = 2;
    fluxSurfSpec[0] = [];
    fluxSurfSpec[1] = [];
    fluxSurfSpec[0].length = numLams;
    fluxSurfSpec[1].length = numLams;
    // returns surface flux as a 2XnumLams vector
    //  - Row 0 linear flux (cgs units)
    //  - Row 1 log_e flux
    //  cosTheta is a 2xnumThetas array:
    // row 0 is used for Gaussian quadrature weights
    // row 1 is used for cos(theta) values
    // Gaussian quadrature:
    // Number of angles, numThetas, will have to be determined after the fact


//For geometry calculations: phi = 0 is direction of positive x-axis of right-handed
// 2D Cartesian coord system in plane of sky with origin at sub-stellar point (phi
// increases CCW)

    var numThetas = cosTheta[0].length;
    var thisThetFctr;
    //var numThetas = 11;
    var numPhi = phi.length;
    var delPhi = 2.0 * Math.PI / numPhi;
    //console.log("delPhi " + delPhi);

//macroturbulent broadening helpers:
  var uRnd1, uRnd2, ww, arg, gRnd1, gRnd2;

 //For macroturbulent broadening, we need to transform uniformly
//generated random numbers on [0, 1] to a Gaussian distribution
// with a mean of 0.0 and a sigma of 1.0 
//Use the polar form of the Box-Muller transformation
// http://www.design.caltech.edu/erik/Misc/Gaussian.html
// Everett (Skip) Carter, Taygeta Scientific Inc.
//// Original code in c:
//    ww = Math.sqrt  
//         do {
//                 x1 = 2.0 * ranf() - 1.0;
//                 x2 = 2.0 * ranf() - 1.0;
//                 w = x1 * x1 + x2 * x2;
//         } while ( w >= 1.0 );
//
//         w = sqrt( (-2.0 * log( w ) ) / w );
//         y1 = x1 * w;
//         y2 = x2 * w;


  //helpers for rotational broadening
    var x, opposite, theta; //, delLam;  
    var thisIntens = [];
    thisIntens.length = numLams;
    var intensLam = [];
    intensLam.length = numLams;

//This might not be the smartest approach, but, for now, compute the 
//Doppler shifted wavelength scale across the whole tiled projected disk:

//   
    //var shiftedLam = 0.0;
    var shiftedLamV = [];
    shiftedLamV.length = numLams;
    var vRad = [];
    vRad.length = numThetas;
    for (var it = 0; it < numThetas; it++){
       vRad[it] = [];
       vRad[it].length = numPhi; 
    }

    var sinTheta;
//For each (theta, phi) tile, compute the contributions to radial velocity 
// from rotational broadening and macoturbulent broadening:
   for (var it = 0; it < numThetas; it++){
      //theta = Math.acos(cosTheta[1][it]);
      //opposite = radius * Math.sin(theta);
      //faster??
      sinTheta = Math.sqrt( 1.0 - (cosTheta[1][it]*cosTheta[1][it]) );
      opposite = radius * sinTheta;
      for (var ip = 0; ip < numPhi; ip++){
         
// x-position of each (theta, phi) point:
         x = opposite * Math.cos(phi[ip]);
         vRad[it][ip] = x * omegaSini; // should be in cm/s   
         //console.log("it " + it + " ip " + ip + " x " + (x/1.0e5) + " vRad " + (vRad[it][ip]/1.0e5));
        
 //For macroturbulent broadening, we need to transform uniformly
//generated random numbers on [0, 1] to a Gaussian distribution
// with a mean of 0.0 and a sigma of 1.0 
//Use the polar form of the Box-Muller transformation
// http://www.design.caltech.edu/erik/Misc/Gaussian.html
// Everett (Skip) Carter, Taygeta Scientific Inc.

  //initialization that guarantees at least one cycle of the while loop
  ww = 2.0; 

//cycle through pairs of uniform random numbers until we get a 
//ww value that is less than unity
  while (ww >= 1.0){
    // range [0, 1]
    uRnd1 = Math.random(); 
    uRnd2 = Math.random();
    // range [-1, 1]
    uRnd1 = (2.0 * uRnd1) - 1.0;
    uRnd2 = (2.0 * uRnd2) - 1.0;
    ww = (uRnd1 * uRnd1) + (uRnd2 * uRnd2);
  } 

// We have a valid ww value - transform the uniform random numbers
// to Gaussian random numbers with sigma = macroturbulent velocity broadening
    arg = (-2.0 * Math.log(ww)) / ww;
    gRnd1 = macroV * arg * uRnd1;
    //gRnd2 = macroV * arg * uRnd2; //not needed?

    //console.log("gRnd1 " + gRnd1);

    vRad[it][ip] = vRad[it][ip] + gRnd1; // should be in cm/s   

      } //ip loop - phi 
   } //it loop - theta

    var flx = [];
    flx.length = numLams;
 //Inititalize flux acumulator:
    for (var il = 0; il < numLams; il++){
      flx[il] = 0.0;
    } 
    for (var it = 0; it < numThetas; it++) {

        //flx = flx + ( intens[it] * cosTheta[1][it] * cosTheta[0][it] ); //axi-symmetric version
        //non-axi-symmetric version:
        thisThetFctr = cosTheta[1][it] * cosTheta[0][it];
        //console.log("it " + it + " cosTheta[1] " + cosTheta[1][it] + " cosTheta[0] " + cosTheta[0][it]);
        //console.log("thisThetFctr " + thisThetFctr);
        for (var il = 0; il < numLams; il++){
           intensLam[il] = intens[il][it];
        }
        for (var ip = 0; ip < numPhi; ip++){
           for (var il = 0; il < numLams; il++){
              //delLam = lambdas[il] * vRad[it][ip] / c;
              //shiftedLamV[il] = lambdas[il] + delLam; 
              shiftedLamV[il] = lambdas[il] * ( (vRad[it][ip]/c) + 1.0 );     
              //shiftedLamV[il] = shiftedLam;
              //console.log("ip " + ip + " il " + il + " delLam " + delLam + " shiftedLam " + shiftedLam + " shiftedLamV " + shiftedLamV[il]);
           }
          // for (var il = 0; il < numLams; il++){
          //    intensLam[il] = intens[il][it];
          // }
           thisIntens = interpolV(intensLam, shiftedLamV, lambdas);     
           //flx = flx + ( intens[it] * thisThetFctr * delPhi ); 
           for (var il = 0; il < numLams; il++){
              flx[il] = flx[il] + ( thisIntens[il] * thisThetFctr * delPhi ); 
              //console.log("il " + il + " thisIntens " + thisIntens[il] + " flx " + flx[il]);
           }
        } //ip - phi loop
    }  // it - theta loop

    //fluxSurfSpec[0] = 2.0 * Math.PI * flx; //axi-symmetric version
    for (var il = 0; il < numLams; il++){
       fluxSurfSpec[0][il] = flx[il]; // non-axi-symmetric version
       fluxSurfSpec[1][il] = Math.log(fluxSurfSpec[0][il]);
    }

    return fluxSurfSpec;
};

