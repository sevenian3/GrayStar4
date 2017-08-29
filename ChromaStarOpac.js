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

"use strict"; //testing only!

// Global variables - Doesn't work - scope not global!

var c = 2.9979249E+10; // light speed in vaccuum in cm/s
var sigma = 5.670373E-5; //Stefan-Boltzmann constant ergs/s/cm^2/K^4  
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var h = 6.62606957E-27; //Planck's constant in ergs sec
var ee = 4.80320425E-10; //fundamental charge unit in statcoulombs (cgs)
var mE = 9.10938291E-28; //electron mass (g)
var GConst = 6.674e-8; //Newton's gravitational constant (cgs)
//Conversion factors
var amu = 1.66053892E-24; // atomic mass unit in g
var eV = 1.602176565E-12; // eV in ergs
var rSun = 6.955e10; // solar radii to cm
var mSun = 1.9891e33; // solar masses to g
var lSun = 3.846e33; // solar bolometric luminosities to ergs/s

//Methods:
//Natural logs more useful than base 10 logs - Eg. Formal soln module: 
// Fundamental constants
var logC = Math.log(c);
var logSigma = Math.log(sigma);
var logK = Math.log(k);
var logH = Math.log(h);
var logEe = Math.log(ee); //Named so won't clash with log_10(e)
var logMe = Math.log(mE);
var logGConst = Math.log(GConst);
//Conversion factors
var logAmu = Math.log(amu);
var logEv = Math.log(eV);
var logRSun = Math.log(rSun);
var logMSun = Math.log(mSun);
var logLSun = Math.log(lSun);
// ********************************************

// *********************************************************
// 
// 
// Opacity package:
//

  var kappas2 = function(numDeps, pe, zScale, temp, rho,
                                  numLams, lambdas, logAHe,
                                  logNH1, logNH2, logNHe1, logNHe2, Ne, teff,
                                  logKapFudge){


//
//  *** CAUTION:
//
//  This return's "kappa" as defined by Gray 3rd Ed. - cm^2 per *relelvant particle* where the "releveant particle"
//  depends on *which* kappa

     var log10E = logTen(Math.E); //needed for g_ff
     var logLog10E = Math.log(log10E);
     var logE10 = Math.log(10.0);
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var logK = Math.log(k);
     var logNH = []; 
     logNH.length = numDeps; //Total H particle number density cm^-3
     var logPH1, logPH2, logPHe1, logPHe2;
     for (var i=0; i<numDeps; i++){
         logNH[i] = Math.exp(logNH1[i]) + Math.exp(logNH2[i]);
         logNH[i] = Math.log(logNH[i]);

  //      console.log("i " + i + " logNH1 " + log10E*logNH1[i] + " logNH2 " + log10E*logNH2[i] 
  //  + " logNHe1 " + log10E*logNHe1[i] + " logNHe2 " + log10E*logNHe2[i] + " logPe " + log10E*pe[1][i]);
        //logPH1 = logNH1[i] + temp[1][i] + logK;
        //logPH2 = logNH2[i] + temp[1][i] + logK;
        //logPHe1 = logNHe1[i] + temp[1][i] + logK;
        //logPHe2 = logNHe2[i] + temp[1][i] + logK;
        //console.log("i " + i + " logPH1 " + log10E*logPH1 + " logPH2 " + log10E*logPH2 
       //+ " logPHe1 " + log10E*logPHe1 + " logPHe2 " + log10E*logPHe2 + " logPe " + log10E*pe[1][i]);
     }

     var logKappa = [];
     logKappa.length = numLams;
     for (var i = 0; i < numLams; i++){
        logKappa[i] = [];
        logKappa[i].length = numDeps;
     }
     
     var kappa; //helper
     var stimEm; //temperature- and wavelength-dependent stimulated emission correction  
     var stimHelp, logStimEm;
 
     var ii; //useful for converting integer loop counter, i, to float
//
//
//Input data and variable declarations:
//
//
// H I b-f & f-f
     var chiIH = 13.598433;  //eV
     var Rydberg = 1.0968e-2;  // "R" in nm^-1
     //Generate threshold wavelengths and b-f Gaunt (g_bf) helper factors up to n=10:
     var n; //principle quantum number of Bohr atom E-level
     var numHlevs = 10;
     var invThresh = [];
     invThresh.length = numHlevs; //also serves as g_bf helper factor
     var threshLambs = [];
     threshLambs.length = numHlevs;
     var chiHlev = [];
     chiHlev.length = numHlevs;
     var logChiHlev;
     for (var i = 0; i < numHlevs; i++){
        n = 1.0 + 1.0*i;
        invThresh[i] = Rydberg / n / n; //nm^-1; also serves as g_bf helper factor 
        threshLambs[i] = 1.0 / invThresh[i]; //nm
        logChiHlev = logH + logC + Math.log(invThresh[i]) + 7.0*logE10; // ergs
        chiHlev[i] = Math.exp(logChiHlev - logEv); //eV
        chiHlev[i] = chiIH - chiHlev[i];
//        System.out.println("i " + i + " n " + n + " invThresh " + invThresh[i] + " threshLambs[i] " + threshLambs[i] + " chiHlev " + chiHlev[i]);
     } 

     var logGauntPrefac = Math.log(0.3456) - 0.333333*Math.log(Rydberg);

     // ****  Caution: this will require lamba in A!:
     var a0 = 1.0449e-26;  //if lambda in A 
     var logA0 = Math.log(a0);
// Boltzmann const "k" in eV/K - needed for "theta"
     var logKeV = logK - logEv; 

     //g_bf Gaunt factor - depends on lower E-level, n:
     var loggbf = [];
     loggbf.length = numHlevs;

     //initialize quantities that depend on lowest E-level contributing to opacity at current wavelength:
     for (var iThresh = 0; iThresh < numHlevs; iThresh++){
        loggbf[iThresh] = 0.0;
     }
     var logGauntHelp, gauntHelp; 
     var gbf, gbfHelp, loggbfHelp;
     var gff, gffHelp, loggffHelp, logffHelp, loggff;
     var help, logHelp3;
     var chiLambda, logChiLambda;
     var bfTerm, logbfTerm, bfSum, logKapH1bf, logKapH1ff;
 
//initial defaults:
   gbf = 1.0;
   gff = 1.0;
   loggff = 0.0;
 
     var logChiFac = Math.log(1.2398e3); // eV per lambda, for lambda in nm

// Needed for kappa_ff: 
  var ffBracket; 
     logffHelp = logLog10E - Math.log(chiIH) - Math.log(2.0);
     //logHelp = logffHelp - Math.log(2.0);

//
//Hminus:
//
// H^- b-f
//This is for the sixth order polynomial fit to the cross-section's wavelength dependence
  var numHmTerms = 7;
  var logAHm = []; 
  logAHm.length = numHmTerms;
  var signAHm = [];
  signAHm.length = numHmTerms;
 
  var aHmbf = 4.158e-10;
  //double logAHmbf = Math.log(aHmbf);
  //Is the factor of 10^-18cm^2 from the polynomial fit to alpha_Hmbf missing in Eq. 8.12 on p. 156 of Gray 3rd Ed??
  var logAHmbf = Math.log(aHmbf) - 18.0*logE10;
  var alphaHmbf, logAlphaHmbf, logTermHmbf, logKapHmbf; 

  //Computing each polynomial term logarithmically
     logAHm[0] = Math.log(1.99654);
     signAHm[0] = 1.0;
     logAHm[1] = Math.log(1.18267e-5);
     signAHm[1] = -1.0;
     logAHm[2] = Math.log(2.64243e-6);
     signAHm[2] = 1.0;
     logAHm[3] = Math.log(4.40524e-10);
     signAHm[3] = -1.0;
     logAHm[4] = Math.log(3.23992e-14);
     signAHm[4] = 1.0;
     logAHm[5] = Math.log(1.39568e-18);
     signAHm[5] = -1.0;
     logAHm[6] = Math.log(2.78701e-23);
     signAHm[6] = 1.0;
     alphaHmbf = Math.exp(logAHm[0]); //initialize accumulator

// H^- f-f:

  var logAHmff = -26.0*logE10;
  var numHmffTerms = 5;
  var fPoly, logKapHmff, logLambdaAFac; 
    var fHmTerms = [];
    fHmTerms.length = 3;
    fHmTerms[0] = [];
    fHmTerms[1] = [];
    fHmTerms[2] = [];
    fHmTerms[0].length = numHmffTerms; 
    fHmTerms[1].length = numHmffTerms; 
    fHmTerms[2].length = numHmffTerms; 
    var fHm = []; 
    fHm.length = 3;
    fHmTerms[0][0] = -2.2763;
    fHmTerms[0][1] = -1.6850;
    fHmTerms[0][2] = 0.76661;
    fHmTerms[0][3] = -0.053346;
    fHmTerms[0][4] = 0.0;
    fHmTerms[1][0] = 15.2827;
    fHmTerms[1][1] = -9.2846;
    fHmTerms[1][2] = 1.99381;
    fHmTerms[1][3] = -0.142631;
    fHmTerms[1][4] = 0.0;
    fHmTerms[2][0] = -197.789;
    fHmTerms[2][1] = 190.266;
    fHmTerms[2][2] = -67.9775;
    fHmTerms[2][3] = 10.6913;
    fHmTerms[2][4] = -0.625151;

//
//H_2^+ molecular opacity - cool stars
// scasles with proton density (H^+)
//This is for the third order polynomial fit to the "sigma_l(lambda)" and "U_l(lambda)"
//terms in the cross-section
     var numH2pTerms = 4;
     var sigmaH2pTerm = [];
     sigmaH2pTerm.length = numH2pTerms;
     var UH2pTerm = []; 
     UH2pTerm.length = numH2pTerms;
     var logSigmaH2p, sigmaH2p, UH2p, logKapH2p;  
     var aH2p = 2.51e-42;
     var logAH2p = Math.log(aH2p);
       sigmaH2pTerm[0] = -1040.54;
       sigmaH2pTerm[1] = 1345.71;
       sigmaH2pTerm[2] = -547.628;
       sigmaH2pTerm[3] = 71.9684;
       //UH2pTerm[0] = 54.0532;
       //UH2pTerm[1] = -32.713;
       //UH2pTerm[2] = 6.6699;
       //UH2pTerm[3] = -0.4574;
      //Reverse signs on U_1 polynomial expansion co-efficients - Dave Gray private communcation 
      //based on Bates (1952)
       UH2pTerm[0] = -54.0532;
       UH2pTerm[1] = 32.713;
       UH2pTerm[2] = -6.6699;
       UH2pTerm[3] = 0.4574;
 

// He I b-f & ff: 
       var totalH1Kap, logTotalH1Kap, helpHe, logKapHe;

//
//He^- f-f
  
  var AHe = Math.exp(logAHe); 
     var logKapHemff, nHe, logNHe, thisTerm, thisLogTerm, alphaHemff, log10AlphaHemff;

// Gray does not have this pre-factor, but PHOENIX seems to and without it
// the He opacity is about 10^26 too high!:
  var logAHemff = -26.0*logE10;

     var numHemffTerms = 5;
     var logC0HemffTerm = []; logC0HemffTerm.length = numHemffTerms;
     var logC1HemffTerm = []; logC1HemffTerm.length = numHemffTerms;
     var logC2HemffTerm = []; logC2HemffTerm.length = numHemffTerms;
     var logC3HemffTerm = []; logC3HemffTerm.length = numHemffTerms;
     var signC0HemffTerm = []; signC0HemffTerm.length = numHemffTerms;
     var signC1HemffTerm = []; signC1HemffTerm.length = numHemffTerms;
     var signC2HemffTerm = []; signC2HemffTerm.length = numHemffTerms;
     var signC3HemffTerm = []; signC3HemffTerm.length = numHemffTerms;

//we'll be evaluating the polynominal in theta logarithmically by adding logarithmic terms - 
     logC0HemffTerm[0] = Math.log(9.66736); 
     signC0HemffTerm[0] = 1.0;
     logC0HemffTerm[1] = Math.log(71.76242); 
     signC0HemffTerm[1] = -1.0;
     logC0HemffTerm[2] = Math.log(105.29576); 
     signC0HemffTerm[2] = 1.0;
     logC0HemffTerm[3] = Math.log(56.49259); 
     signC0HemffTerm[3] = -1.0;
     logC0HemffTerm[4] = Math.log(10.69206); 
     signC0HemffTerm[4] = 1.0;
     logC1HemffTerm[0] = Math.log(10.50614); 
     signC1HemffTerm[0] = -1.0;
     logC1HemffTerm[1] = Math.log(48.28802); 
     signC1HemffTerm[1] = 1.0;
     logC1HemffTerm[2] = Math.log(70.43363); 
     signC1HemffTerm[2] = -1.0;
     logC1HemffTerm[3] = Math.log(37.80099); 
     signC1HemffTerm[3] = 1.0;
     logC1HemffTerm[4] = Math.log(7.15445);
     signC1HemffTerm[4] = -1.0;
     logC2HemffTerm[0] = Math.log(2.74020); 
     signC2HemffTerm[0] = 1.0;
     logC2HemffTerm[1] = Math.log(10.62144); 
     signC2HemffTerm[1] = -1.0;
     logC2HemffTerm[2] = Math.log(15.50518); 
     signC2HemffTerm[2] = 1.0;
     logC2HemffTerm[3] = Math.log(8.33845); 
     signC2HemffTerm[3] = -1.0;
     logC2HemffTerm[4] = Math.log(1.57960);
     signC2HemffTerm[4] = 1.0;
     logC3HemffTerm[0] = Math.log(0.19923); 
     signC3HemffTerm[0] = -1.0;
     logC3HemffTerm[1] = Math.log(0.77485); 
     signC3HemffTerm[1] = 1.0;
     logC3HemffTerm[2] = Math.log(1.13200); 
     signC3HemffTerm[2] = -1.0;
     logC3HemffTerm[3] = Math.log(0.60994); 
     signC3HemffTerm[3] = 1.0;
     logC3HemffTerm[4] = Math.log(0.11564);
     signC3HemffTerm[4] = -1.0;
     //initialize accumulators:
     var cHemff = [];
     cHemff.length = 4;
     cHemff[0] = signC0HemffTerm[0] * Math.exp(logC0HemffTerm[0]);   
     cHemff[1] = signC1HemffTerm[0] * Math.exp(logC1HemffTerm[0]);   
     cHemff[2] = signC2HemffTerm[0] * Math.exp(logC2HemffTerm[0]);   
     cHemff[3] = signC3HemffTerm[0] * Math.exp(logC3HemffTerm[0]);   
//
// electron (e^-1) scattering (Thomson scattering)

    var kapE, logKapE;
    var alphaE = 0.6648e-24; //cm^2/e^-1
    var logAlphaE = Math.log(0.6648e-24);
  

//Universal:
//
     var theta, logTheta, log10Theta, log10ThetaFac;
     var logLambda, lambdaA, logLambdaA, log10LambdaA, lambdanm, logLambdanm;
//Okay - here we go:
//Make the wavelength loop the outer loop - lots of depth-independnet lambda-dependent quantities:
//
//
//
//  **** START WAVELENGTH LOOP iLam
//
//
//
     for (var iLam = 0; iLam < numLams; iLam++){
 //
 //Re-initialize all accumulators to be on safe side:
           kappa = 0.0;
           logKapH1bf = -99.0; 
           logKapH1ff = -99.0;
           logKapHmbf = -99.0; 
           logKapHmff = -99.0;
           logKapH2p = -99.0;
           logKapHe = -99.0;
           logKapHemff = -99.0;
           logKapE = -99.0;
 //
//*** CAUTION: lambda MUST be in nm here for consistency with Rydbeg 
        logLambda = Math.log(lambdas[iLam]);  //log cm
        lambdanm = 1.0e7 * lambdas[iLam];
        logLambdanm = Math.log(lambdanm);
        lambdaA = 1.0e8 * lambdas[iLam]; //Angstroms
        logLambdaA = Math.log(lambdaA);
        log10LambdaA = log10E * logLambdaA;

        logChiLambda = logChiFac - logLambdanm;
        chiLambda = Math.exp(logChiLambda);   //eV

// Needed for both g_bf AND g_ff: 
        logGauntHelp = logGauntPrefac - 0.333333*logLambdanm; //lambda in nm here
        gauntHelp = Math.exp(logGauntHelp);

              //if (iLam == 142){
              if (iLam == 142){
    //console.log("lambdaA " + lambdaA);
            }

//HI b-f depth independent factors:
//Start at largest threshold wavelength and break out of loop when next threshold lambda is less than current lambda:
        for (var iThresh = numHlevs-1; iThresh >= 0; iThresh--){
           if (threshLambs[iThresh] < lambdanm){
              break;
           }
           if (lambdanm <= threshLambs[iThresh]){
           //this E-level contributes
              loggbfHelp = logLambdanm + Math.log(invThresh[iThresh]); //lambda in nm here; invThresh here as R/n^2
              gbfHelp = Math.exp(loggbfHelp);
              gbf = 1.0 - (gauntHelp * (gbfHelp - 0.5));
//              if (iLam == 1){
//    System.out.println("iThresh " + iThresh + " threshLambs " + threshLambs[iThresh] +  " gbf " + gbf);
//              }
              loggbf[iThresh] = Math.log(gbf);
           }
        }  //end iThresh loop 

//HI f-f depth independent factors:
        //logChi = logLog10E + logLambdanm - logChiFac; //lambda in nm here
        //chi = Math.exp(logChi);
        loggffHelp = logLog10E - logChiLambda;

//
//
//
//  ******  Start depth loop iTau ******
//
//
//
//
        for (var iTau = 0; iTau < numDeps; iTau++){
//
 //Re-initialize all accumulators to be on safe side:
           kappa = 0.0;
           logKapH1bf = -99.0; 
           logKapH1ff = -99.0;
           logKapHmbf = -99.0; 
           logKapHmff = -99.0;
           logKapH2p = -99.0;
           logKapHe = -99.0;
           logKapHemff = -99.0;
           logKapE = -99.0;
//
//
//if (iTau == 36 && iLam == 142){
//    System.out.println("lambdanm[142] " + lambdanm + " temp[0][iTau=36] " + temp[0][iTau=36]);
// }
//This is "theta" ~ 5040/T:
           logTheta = logLog10E - logKeV - temp[1][iTau];
           log10Theta = log10E * logTheta;
           theta = Math.exp(logTheta);
           //System.out.println("theta " + theta + " logTheta " + logTheta);

// temperature- and wavelength-dependent stimulated emission coefficient:
           stimHelp = -1.0 * theta * chiLambda * logE10;
           stimEm = 1.0 - Math.exp(stimHelp); 
           logStimEm = Math.log(stimEm);
    //       if (iTau == 36 && iLam == 70){
   // console.log("stimEm " + stimEm);
 //}


           ffBracket = Math.exp(loggffHelp - logTheta) + 0.5; 
           gff = 1.0 + (gauntHelp*ffBracket);


//if (iTau == 36 && iLam == 1){
//    System.out.println("gff " + gff);
// }
           loggff = Math.log(gff);

//H I b-f:
//Start at largest threshold wavelength and break out of loop when next threshold lambda is less than current lambda:
           bfSum = 0.0; //initialize accumulator
// *** DEBUG!  ***
         // ****  Following line is Debug artificial "fix" 
           //logA0 = logA0 - logE10*1.0;  // **** Debug artificial "fix" 
// *** DEBUG!  ***
           logHelp3 = logA0 + 3.0*logLambdaA; //lambda in A here
           for (var iThresh = numHlevs-1; iThresh >= 0; iThresh--){
              if (threshLambs[iThresh] < lambdanm){
                 break;
              }
              n = 1.0 + 1.0*iThresh; 
              if (lambdanm <= threshLambs[iThresh]){
                //this E-level contributes
                logbfTerm = loggbf[iThresh] - 3.0*Math.log(n); 
                logbfTerm = logbfTerm - (theta*chiHlev[iThresh])*logE10; 
                bfSum = bfSum + Math.exp(logbfTerm);
//if (iTau == 36 && iLam == 142){
  //System.out.println("lambdanm " + lambdanm + " iThresh " + iThresh + " threshLambs[iThresh] " + threshLambs[iThresh]);
  //System.out.println("loggbf " + loggbf[iThresh] + " theta " + theta + " chiHlev " + chiHlev[iThresh]);
  //System.out.println("bfSum " + bfSum + " logbfTerm " + logbfTerm);
//  }
              }
           }  //end iThresh loop 

// cm^2 per *neutral* H atom
           logKapH1bf = logHelp3 + Math.log(bfSum); 

//Stimulated emission correction
           logKapH1bf = logKapH1bf + logStimEm;

//Add it in to total - opacity per neutral HI atom, so multiply by logNH1 
// This is now linear opacity in cm^-1
           logKapH1bf = logKapH1bf + logNH1[iTau];
// *** DEBUG!  ***
         // ****  Following line is Debug artificial "fix"
     //    // Nasty fix to make Balmer lines show up in A0 stars!!
     //   if (teff > 8000.0){ 
      //   logKapH1bf = logKapH1bf - logE10*1.5;
       //                   }
                     kappa = Math.exp(logKapH1bf); 
  //System.out.println("HIbf " + log10E*logKapH1bf);
//if (iTau == 36 && iLam == 70){
//if (iLam == 70){
           //console.log("logKapH1bf " + log10E*(logKapH1bf)); //-rho[1][iTau]));
//}
//H I f-f:
// cm^2 per *neutral* H atom
           logKapH1ff = logHelp3 + loggff + logffHelp - logTheta - (theta*chiIH)*logE10;

//Stimulated emission correction
           logKapH1ff = logKapH1ff + logStimEm;
//Add it in to total - opacity per neutral HI atom, so multiply by logNH1 
// This is now linear opacity in cm^-1
           logKapH1ff = logKapH1ff + logNH1[iTau];
// *** DEBUG!  ***
         // ****  Following line is Debug artificial "fix" 
        // // Nasty fix to make Balmer lines show up in A0 stars!!
       // if (teff > 8000.0){ 
        // logKapH1ff = logKapH1ff - logE10*1.5;
        //   }
                  kappa = kappa + Math.exp(logKapH1ff); 
       //System.out.println("HIff " + log10E*logKapH1ff);

//if (iTau == 36 && iLam == 70){
//if (iTau == 36 && iLam == 70){
//if (iLam == 70){
           //console.log("logKapH1ff " + log10E*(logKapH1ff)); //-rho[1][iTau]));
//}

//
//Hminus:
//
// H^- b-f:
//if (iTau == 36 && iLam == 142){
 // System.out.println("temp " + temp[0][iTau] + " lambdanm " + lambdanm);
 // }
          logKapHmbf =  -99.0; //initialize default
          //if ( (temp[0][iTau] > 2500.0) && (temp[0][iTau] < 10000.0) ){
          //Try lowering lower Teff limit to avoid oapcity collapse in outer layers of late-type stars
          //if ( (temp[0][iTau] > 2500.0) && (temp[0][iTau] < 10000.0) ){
          if ( (temp[0][iTau] > 1000.0) && (temp[0][iTau] < 10000.0) ){
          //if ( (temp[0][iTau] > 2500.0) && (temp[0][iTau] < 7000.0) ){
             if ((lambdanm > 225.0) && (lambdanm < 1500.0) ){ //nm 
//if (iTau == 36 && iLam == 142){
 //              System.out.println("In KapHmbf condition...");
//}
                ii = 0.0;
                alphaHmbf = signAHm[0]*Math.exp(logAHm[0]); //initialize accumulator
                for (var i = 1; i < numHmTerms; i++){
                   ii = 1.0*i;
//if (iTau == 36 && iLam == 142){
//                   System.out.println("ii " + ii);
//}
                   logTermHmbf = logAHm[i] + ii*logLambdaA; 
                   alphaHmbf = alphaHmbf + signAHm[i]*Math.exp(logTermHmbf);  
//if (iTau == 36 && iLam == 142){
//                  System.out.println("logTermHmbf " + log10E*logTermHmbf + " i " + i + " logAHm " + log10E*logAHm[i]); 
//}
                }
                logAlphaHmbf = Math.log(alphaHmbf);
// cm^2 per neutral H atom
// *** DEBUG!  ***
         // ****  Following line is Debug artificial "fix" 
         //  logAHmbf = logAHmbf - logE10*1.0;  // **** Debug artificial "fix" 
// *** DEBUG!  ***
                logKapHmbf = logAHmbf + logAlphaHmbf + pe[1][iTau] + 2.5*logTheta + (0.754*theta)*logE10; 
//Stimulated emission correction
           logKapHmbf = logKapHmbf + logStimEm;
//if (iTau == 36 && iLam == 142){
//  System.out.println("alphaHmbf " + alphaHmbf);
//  System.out.println("logKapHmbf " + log10E*logKapHmbf + " logAHmbf " + log10E*logAHmbf + " logAlphaHmbf " + log10E*logAlphaHmbf);
//  }

//Add it in to total - opacity per neutral HI atom, so multiply by logNH1 
// This is now linear opacity in cm^-1
           logKapHmbf = logKapHmbf + logNH1[iTau];
// *** DEBUG!  ***
         // ****  Following line is Debug artificial "fix" 
         //logKapHmbf = logKapHmbf - logE10*1.0;
                  kappa = kappa + Math.exp(logKapHmbf); 
       //System.out.println("Hmbf " + log10E*logKapHmbf);
//if (iTau == 36 && iLam == 70){
//if (iLam == 70){
         ////console.log("logE10*1.0 " + (logE10*1.0));
           //console.log("logKapHmbf " + log10E*(logKapHmbf)); //-rho[1][iTau]));
//}
             } //wavelength condition
          } // temperature condition

// H^- f-f:
          logKapHmff = -99.0; //initialize default
          //if ( (temp[0][iTau] > 2500.0) && (temp[0][iTau] < 10000.0) ){
          //Try lowering lower Teff limit to avoid oapcity collapse in outer layers of late-type stars
          //if ( (temp[0][iTau] > 2500.0) && (temp[0][iTau] < 10000.0) ){
          if ( (temp[0][iTau] > 1000.0) && (temp[0][iTau] < 10000.0) ){
             if ((lambdanm > 260.0) && (lambdanm < 11390.0) ){ //nm 
                 //construct "f_n" polynomials in log(lambda)
                 for (var j = 0; j < 3; j++){
                     fHm[j] = fHmTerms[j][0];  //initialize accumulators
                 }    
                 ii = 0.0;               
                 for (var i = 1; i < numHmffTerms; i++){
                     ii = 1.0*i;
                     logLambdaAFac = Math.pow(log10LambdaA, ii);
                     for (var j = 0; j < 3; j++){
                        fHm[j] = fHm[j] + (fHmTerms[j][i]*logLambdaAFac);    
                     } // i
                  } // j
// 
     fPoly = fHm[0] + fHm[1]*log10Theta + fHm[2]*log10Theta*log10Theta;
// In cm^2 per neutral H atom:
// Stimulated emission alreadya ccounted for
          logKapHmff = logAHmff + pe[1][iTau] + fPoly*logE10;

//Add it in to total - opacity per neutral HI atom, so multiply by logNH1 
// This is now linear opacity in cm^-1
           logKapHmff = logKapHmff + logNH1[iTau];
                  kappa = kappa + Math.exp(logKapHmff); 
       //System.out.println("Hmff " + log10E*logKapHmff);
//if (iTau == 36 && iLam == 70){
//if (iLam == 70){
           //console.log("logKapHmff " + log10E*(logKapHmff)); //-rho[1][iTau]));
//}
             } //wavelength condition
          } // temperature condition


// H^+_2:
//
       logKapH2p = -99.0; //initialize default 
       if ( temp[0][iTau] < 4000.0 ){
          if ((lambdanm > 380.0) && (lambdanm < 2500.0) ){ //nm 
             sigmaH2p = sigmaH2pTerm[0]; //initialize accumulator
             UH2p = UH2pTerm[0]; //initialize accumulator
             ii = 0.0;
             for (var i = 1; i < numH2pTerms; i++){
                ii = 1.0*i; 
                logLambdaAFac = Math.pow(log10LambdaA, ii);
                // kapH2p way too large with lambda in A - try cm:  No! - leads to negative logs
                //logLambdaAFac = Math.pow(logLambda, ii);
                sigmaH2p = sigmaH2p +  sigmaH2pTerm[i] * logLambdaAFac; 
                UH2p = UH2p +  UH2pTerm[i] * logLambdaAFac; 
             }
             logSigmaH2p = Math.log(sigmaH2p);
             logKapH2p = logAH2p + logSigmaH2p - (UH2p*theta)*logE10 + logNH2[iTau]; 
//Stimulated emission correction
           logKapH2p = logKapH2p + logStimEm;

//Add it in to total - opacity per neutral HI atom, so multiply by logNH1 
// This is now linear opacity in cm^-1
           logKapH2p = logKapH2p + logNH1[iTau];
           kappa = kappa + Math.exp(logKapH2p); 
  //System.out.println("H2p " + log10E*logKapH2p);
//if (iTau == 36 && iLam == 70){
//if (iLam == 70){
           //console.log("logKapH2p " + log10E*(logKapH2p)); //-rho[1][iTau]) + " logAH2p " + log10E*logAH2p
// + " logSigmaH2p " + log10E*logSigmaH2p + " (UH2p*theta)*logE10 " + log10E*((UH2p*theta)*logE10) + " logNH2[iTau] " + log10E*logNH2[iTau]);
//}
          } //wavelength condition
       } // temperature condition


//He I 
//
//  HeI b-f + f-f
  //Scale sum of He b-f and f-f with sum of HI b-f and f-f 

//wavelength condition comes from requirement that lower E level be greater than n=2 (edge at 22.78 nm)
       logKapHe = -99.0; //default intialization
       if ( temp[0][iTau] > 10000.0 ){
          if (lambdanm > 22.8){ //nm  
             totalH1Kap = Math.exp(logKapH1bf) + Math.exp(logKapH1ff);
             logTotalH1Kap = Math.log(totalH1Kap); 
             helpHe = k * temp[0][iTau];
// cm^2 per neutral H atom (after all, it's scaled wrt kappHI
// Stimulated emission already accounted for
//
//  *** CAUTION: Is this *really* the right thing to do???
//    - we're re-scaling the final H I kappa in cm^2/g corrected for stim em, NOT the raw cross section
             logKapHe = Math.log(4.0) - (10.92 / helpHe) + logTotalH1Kap;

//Add it in to total - opacity per neutral HI atom, so multiply by logNH1 
// This is now linear opacity in cm^-1
           logKapHe = logKapHe + logNH1[iTau];
                kappa = kappa + Math.exp(logKapHe); 
       //System.out.println("He " + log10E*logKapHe);
//if (iTau == 36 && iLam == 70){
//if (iLam == 70){
           //console.log("logKapHe " + log10E*(logKapHe)); //-rho[1][iTau]));
//}
          } //wavelength condition
       } // temperature condition


//
//He^- f-f:
       logKapHemff = -99.0; //default initialization
       if ( (theta > 0.5) && (theta < 2.0) ){
          if ((lambdanm > 500.0) && (lambdanm < 15000.0) ){ //nm 

// initialize accumulators:
     cHemff[0] = signC0HemffTerm[0]*Math.exp(logC0HemffTerm[0]);   
     //System.out.println("C0HemffTerm " + signC0HemffTerm[0]*Math.exp(logC0HemffTerm[0]));
     cHemff[1] = signC1HemffTerm[0]*Math.exp(logC1HemffTerm[0]);   
     //System.out.println("C1HemffTerm " + signC1HemffTerm[0]*Math.exp(logC1HemffTerm[0]));
     cHemff[2] = signC2HemffTerm[0]*Math.exp(logC2HemffTerm[0]);   
     //System.out.println("C2HemffTerm " + signC2HemffTerm[0]*Math.exp(logC2HemffTerm[0]));
     cHemff[3] = signC3HemffTerm[0]*Math.exp(logC3HemffTerm[0]);   
     //System.out.println("C3HemffTerm " + signC3HemffTerm[0]*Math.exp(logC3HemffTerm[0]));
//build the theta polynomial coefficients
     ii = 0.0;
     for (var i = 1; i < numHemffTerms; i++){
        ii = 1.0*i;
        thisLogTerm = ii*logTheta + logC0HemffTerm[i]; 
        cHemff[0] = cHemff[0] + signC0HemffTerm[i]*Math.exp(thisLogTerm); 
        //System.out.println("i " + i + " ii " + ii + " C0HemffTerm " + signC0HemffTerm[i]*Math.exp(logC0HemffTerm[i]));
        thisLogTerm = ii*logTheta + logC1HemffTerm[i]; 
        cHemff[1] = cHemff[1] + signC1HemffTerm[i]*Math.exp(thisLogTerm); 
        //System.out.println("i " + i + " ii " + ii + " C1HemffTerm " + signC1HemffTerm[i]*Math.exp(logC1HemffTerm[i]));
        thisLogTerm = ii*logTheta + logC2HemffTerm[i]; 
        cHemff[2] = cHemff[2] + signC2HemffTerm[i]*Math.exp(thisLogTerm); 
        //System.out.println("i " + i + " ii " + ii + " C2HemffTerm " + signC2HemffTerm[i]*Math.exp(logC2HemffTerm[i]));
        thisLogTerm = ii*logTheta + logC3HemffTerm[i]; 
        cHemff[3] = cHemff[3] + signC3HemffTerm[i]*Math.exp(thisLogTerm); 
        //System.out.println("i " + i + " ii " + ii + " C3HemffTerm " + signC3HemffTerm[i]*Math.exp(logC3HemffTerm[i]));
     }
     
//Build polynomial in logLambda for alpha(He^1_ff):
       log10AlphaHemff = cHemff[0]; //initialize accumulation
       //System.out.println("cHemff[0] " + cHemff[0]);
       ii = 0.0;
       for (var i = 1; i <= 3; i++){
          //System.out.println("i " + i + " cHemff[i] " + cHemff[i]);
          ii = 1.0*i;
          thisTerm = cHemff[i] * Math.pow(log10LambdaA, ii);
          log10AlphaHemff = log10AlphaHemff + thisTerm; 
       } 
       //System.out.println("log10AlphaHemff " + log10AlphaHemff);
       alphaHemff = Math.pow(10.0, log10AlphaHemff); //gives infinite alphas!
       // alphaHemff = log10AlphaHemff; // ?????!!!!!
       //System.out.println("alphaHemff " + alphaHemff);

// Note: this is the extinction coefficient per *Hydrogen* particle (NOT He- particle!)
       //nHe = Math.exp(logNHe1[iTau]) + Math.exp(logNHe2[iTau]);
       //logNHe = Math.log(nHe);
       //logKapHemff = Math.log(alphaHemff) + Math.log(AHe) + pe[1][iTau] + logNHe1[iTau] - logNHe;
       logKapHemff = logAHemff + Math.log(alphaHemff) + pe[1][iTau] + logNHe1[iTau] - logNH[iTau];

//Stimulated emission already accounted for
//Add it in to total - opacity per H particle, so multiply by logNH 
// This is now linear opacity in cm^-1
           logKapHemff = logKapHemff + logNH[iTau];
                   kappa = kappa + Math.exp(logKapHemff); 
       //System.out.println("Hemff " + log10E*logKapHemff);
//if (iTau == 36 && iLam == 70){
//if (iLam == 70){
//if (iLam == 155){
           //console.log("logKapHemff " + log10E*(logKapHemff)); //-rho[1][iTau]));
//}
 
             } //wavelength condition
          } // temperature condition

//
// electron (e^-1) scattering (Thomson scattering)

//coefficient per *"hydrogen atom"* (NOT per e^-!!) (neutral or total H??):
    logKapE = logAlphaE + Ne[1][iTau] - logNH[iTau];

//Stimulated emission not relevent 
//Add it in to total - opacity per H particle, so multiply by logNH 
// This is now linear opacity in cm^-1
    //I know, we're adding logNH right back in after subtracting it off, but this is for dlarity and consistency for now... :
           logKapE = logKapE + logNH[iTau];   
               kappa = kappa + Math.exp(logKapE); 
       //System.out.println("E " + log10E*logKapE);
//if (iTau == 36 && iLam == 70){
//if (iLam == 70){
           //console.log("logKapE " + log10E*(logKapE)); //-rho[1][iTau]));
//}

//Metal b-f
//Fig. 8.6 Gray 3rd Ed.
//

//
// This is now linear opacity in cm^-1
// Divide by mass density
// This is now mass extinction in cm^2/g
//
// *** DEBUG!  ***
         // ****  Following line is Debug artificial "fix"
         //kappa = kappa / 100.0; 
// *** DEBUG!  ***
   logKappa[iLam][iTau] = Math.log(kappa) - rho[1][iTau];
// Fudge is in cm^2/g:  Converto to natural log:
 //console.log("base10 logKapFudge " + logKapFudge);
   var logEKapFudge = logE10 * logKapFudge;
//console.log("baseE logKapFudge " + logKapFudge);
   logKappa[iLam][iTau] = logKappa[iLam][iTau] + logEKapFudge;
//if (iTau == 36 && iLam == 70){
//if (iLam == 142){
//console.log("baseE logKapFudge " + logKapFudge);
      //console.log(" " + log10E*(logKappa[iLam][iTau]+rho[1][iTau]));
//      console.log(" " + iTau + " " + Math.exp(logKappa[iLam][iTau]+rho[1][iTau]));
//}

//

        } // close iTau depth loop
//
     } //close iLam wavelength loop 

      return logKappa;

  }; //end method kappas2

   var kapRos = function(numDeps, numLams, lambdas, logKappa, temp){

     var kappaRos = [];
     kappaRos.length = 2;
     kappaRos[0] = [];
     kappaRos[1] = [];
     kappaRos[0].length = numDeps;
     kappaRos[1].length = numDeps;

     var numerator, denominator, deltaLam, logdBdTau, logNumerator, logDenominator;
     var logTerm, logDeltaLam, logInvKap, logInvKapRos;
     var logE = logTen(Math.E);

     for (var iTau = 0; iTau < numDeps; iTau++){

        numerator = 0.0; //initialize accumulator
        denominator = 0.0;

        for (var iLam = 1; iLam < numLams; iLam++){
          
           deltaLam = lambdas[iLam] - lambdas[iLam-1];  //lambda in cm
           logDeltaLam = Math.log(deltaLam);

           logInvKap = -1.0 * logKappa[iLam][iTau];
           logdBdTau = dBdT(temp[0][iTau], lambdas[iLam]);
           logTerm = logdBdTau + logDeltaLam;
           denominator = denominator + Math.exp(logTerm); 
           logTerm = logTerm + logInvKap;
           numerator = numerator + Math.exp(logTerm);

        }

        logNumerator = Math.log(numerator);
        logDenominator = Math.log(denominator);
        logInvKapRos = logNumerator - logDenominator; 
        kappaRos[1][iTau] = -1.0 * logInvKapRos; //logarithmic
        kappaRos[0][iTau] = Math.exp(kappaRos[1][iTau]);

        //console.log("iTau " + iTau + " kappaRos " + logE*kappaRos[1][iTau]);
     }

     return kappaRos;

  }; //end method kapRos  
    

// Metal b-f opacity routines taken from Moog (moogjul2014/, MOOGJUL2014.tar)
//Chris Sneden (Universtiy of Texas at Austin)  and collaborators
//http://www.as.utexas.edu/~chris/moog.html
//From Moog source file Opacitymetals.f



//c******************************************************************************
//c  The subroutines needed to calculate the Mg I, Mg II, Al I, Si I, Si II,
//c  and Fe I b-f opacities are in this file.  These are from ATLAS9.
//c******************************************************************************


      var masterMetal = function(numDeps, numLams, temp, lambdaScale, stagePops){

    //System.out.println("masterMetal called...");

//From Moog source file Opacitymetals.f
// From how values such as aC1[] are used in Moog file Opacit.f to compute the total opacity
// and then the optical depth scale, I infer that they are extinction coefficients 
// in cm^-1 
// There does not seem to be any correction for stimulated emission 

var c = 2.9979249E+10; // light speed in vaccuum in cm/s
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var h = 6.62606957E-27; //Planck's constant in ergs sec
var logC = Math.log(c);
var logK = Math.log(k);
var logH = Math.log(h);
         var logE = Math.log10(Math.E);

         var masterBF = [];
         masterBF.length = numLams;
         for (var i = 0; i < numLams; i++){
            masterBF[i] = [];
            masterBF[i].length = numDeps;
         }

         var logUC1 = [];
         logUC1.length = 5;
         var logUMg1 = [];
         logUMg1.length = 5;
         var logUMg2 = [];
         logUMg2.length = 5;
         var logUAl1 = [];
         logUAl1.length = 5;
         var logUSi1 = [];
         logUSi1.length = 5;
         var logUSi2 = [];
         logUSi2.length = 5;
         var logUFe1 = [];
         logUFe1.length = 5;

         var logStatWC1 = 0.0;
         var logStatWMg1 = 0.0;
         var logStatWMg2 = 0.0;
         var logStatWAl1 = 0.0;
         var logStatWSi1 = 0.0;
         var logStatWSi2 = 0.0;
         var logStatWFe1 = 0.0;

         var theta = 1.0;
         var species = "";
         var logGroundPopsC1  = [];
         logGroundPopsC1.length = numDeps;
         var logGroundPopsMg1  = [];
         logGroundPopsMg1.length = numDeps;
         var logGroundPopsMg2  = [];
         logGroundPopsMg2.length = numDeps;
         var logGroundPopsAl1  = [];
         logGroundPopsAl1.length = numDeps;
         var logGroundPopsSi1  = [];
         logGroundPopsSi1.length = numDeps;
         var logGroundPopsSi2  = [];
         logGroundPopsSi2.length = numDeps;
         var logGroundPopsFe1  = [];
         logGroundPopsFe1.length = numDeps;
//
// C I: Z=6 --> iZ=5:
         var aC1 = [];
         aC1.length = numDeps;
// Mg I: Z=12 --> iZ=11:
         var aMg1 = [];
         aMg1.length = numDeps;
// Mg II: Z=12 --> iZ=11:
         var aMg2 = [];
         aMg1.length = numDeps;
// Al I: Z=13 --> iZ=12:
         var aAl1 = [];
         aAl1.length = numDeps;
// Si I: Z=14 --> iZ=13:
         var aSi1 = [];
         aSi1.length = numDeps;
// Si II: Z=14 --> iZ =13:
         var aSi2 = [];
         aSi1.length = numDeps;
// Fe I: Z=26 --> iZ=25
         var aFe1 = [];
         aFe1.length = numDeps;

         species = "CI";
         logUC1 = getPartFn2(species);
         species = "MgI";
         logUMg1 = getPartFn2(species);
         species = "MgII";
         logUMg2 = getPartFn2(species);
         species = "AlI";
         logUAl1 = getPartFn2(species);
         species = "SiI";
         logUSi1 = getPartFn2(species);
         species = "SiII";
         logUSi2 = getPartFn2(species);
         species = "FeI";
         logUFe1 = getPartFn2(species);

         for (var iD = 0; iD < numDeps; iD++){
// NEW Interpolation involving temperature for new partition function: lburns
            var thisTemp = temp[0][iD];
            if (thisTemp <= 130){
               logStatWC1 = logUC1[0];
               logStatWMg1 = logUMg1[0];
               logStatWMg2 = logUMg2[0];
               logStatWAl1 = logUAl1[0];
               logStatWSi1 = logUSi1[0];
               logStatWSi2 = logUSi2[0];
               logStatWFe1 = logUFe1[0];
            } else if (thisTemp > 130 && thisTemp <= 500){
                // Add in interpolation here lburns
                logStatWC1 = logUC1[1] * (thisTemp - 130)/(500 - 130)
                           + logUC1[0] * (500 - thisTemp)/(500 - 130);
                logStatWMg1 = logUMg1[1] * (thisTemp - 130)/(500 - 130)
                            + logUMg1[0] * (500 - thisTemp)/(500 - 130);
                logStatWMg2 = logUMg2[1] * (thisTemp - 130)/(500 - 130)
                            + logUMg2[0] * (500 - thisTemp)/(500 - 130);
                logStatWAl1 = logUAl1[1] * (thisTemp - 130)/(500 - 130)
                            + logUAl1[0] * (500 - thisTemp)/(500 - 130);
                logStatWSi1 = logUSi1[1] * (thisTemp - 130)/(500 - 130)
                            + logUSi1[0] * (500 - thisTemp)/(500 - 130);
                logStatWSi2 = logUSi2[1] * (thisTemp - 130)/(500 - 130)
                            + logUSi2[0] * (500 - thisTemp)/(500 - 130);
                logStatWFe1 = logUFe1[1] * (thisTemp - 130)/(500 - 130)
                            + logUFe1[0] * (500 - thisTemp)/(500 - 130);
            } else if (thisTemp > 500 && thisTemp <= 3000){
                logStatWC1 = logUC1[2] * (thisTemp - 500)/(3000 - 500)
                           + logUC1[1] * (3000 - thisTemp)/(3000 - 500);
                logStatWMg1 = logUMg1[2] * (thisTemp - 500)/(3000 - 500)
                            + logUMg1[1] * (3000 - thisTemp)/(3000 - 500);
                logStatWMg2 = logUMg2[2] * (thisTemp - 500)/(3000 - 500)
                            + logUMg2[1] * (3000 - thisTemp)/(3000 - 500);
                logStatWAl1 = logUAl1[2] * (thisTemp - 500)/(3000 - 500)
                            + logUAl1[1] * (3000 - thisTemp)/(3000 - 500);
                logStatWSi1 = logUSi1[2] * (thisTemp - 500)/(3000 - 500)
                            + logUSi1[1] * (3000 - thisTemp)/(3000 - 500);
                logStatWSi2 = logUSi2[2] * (thisTemp - 500)/(3000 - 500)
                            + logUSi2[1] * (3000 - thisTemp)/(3000 - 500);
                logStatWFe1 = logUFe1[2] * (thisTemp - 500)/(3000 - 500)
                            + logUFe1[1] * (3000 - thisTemp)/(3000 - 500);
            } else if (thisTemp > 3000 && thisTemp <= 8000){
                logStatWC1 = logUC1[3] * (thisTemp - 3000)/(8000 - 3000)
                           + logUC1[2] * (8000 - thisTemp)/(8000 - 3000);
                logStatWMg1 = logUMg1[3] * (thisTemp - 3000)/(8000 - 3000)
                            + logUMg1[2] * (8000 - thisTemp)/(8000 - 3000);
                logStatWMg2 = logUMg2[3] * (thisTemp - 3000)/(8000 - 3000)
                            + logUMg2[2] * (8000 - thisTemp)/(8000 - 3000);
                logStatWAl1 = logUAl1[3] * (thisTemp - 3000)/(8000 - 3000)
                            + logUAl1[2] * (8000 - thisTemp)/(8000 - 3000);
                logStatWSi1 = logUSi1[3] * (thisTemp - 3000)/(8000 - 3000)
                            + logUSi1[2] * (8000 - thisTemp)/(8000 - 3000);
                logStatWSi2 = logUSi2[3] * (thisTemp - 3000)/(8000 - 3000)
                            + logUSi2[2] * (8000 - thisTemp)/(8000 - 3000);
                logStatWFe1 = logUFe1[3] * (thisTemp - 3000)/(8000 - 3000)
                            + logUFe1[2] * (8000 - thisTemp)/(8000 - 3000);
            } else if (thisTemp > 8000 && thisTemp < 10000){
                logStatWC1 = logUC1[4] * (thisTemp - 8000)/(10000 - 8000)
                           + logUC1[3] * (10000 - thisTemp)/(10000 - 8000);
                logStatWMg1 = logUMg1[4] * (thisTemp - 8000)/(10000 - 8000)
                            + logUMg1[3] * (10000 - thisTemp)/(10000 - 8000);
                logStatWMg2 = logUMg2[4] * (thisTemp - 8000)/(10000 - 8000)
                            + logUMg2[3] * (10000 - thisTemp)/(10000 - 8000);
                logStatWAl1 = logUAl1[4] * (thisTemp - 8000)/(10000 - 8000)
                            + logUAl1[3] * (10000 - thisTemp)/(10000 - 8000);
                logStatWSi1 = logUSi1[4] * (thisTemp - 8000)/(10000 - 8000)
                            + logUSi1[3] * (10000 - thisTemp)/(10000 - 8000);
                logStatWSi2 = logUSi2[4] * (thisTemp - 8000)/(10000 - 8000)
                            + logUSi2[3] * (10000 - thisTemp)/(10000 - 8000);
                logStatWFe1 = logUFe1[4] * (thisTemp - 8000)/(10000 - 8000)
                            + logUFe1[3] * (10000 - thisTemp)/(10000 - 8000);
            } else {
            // for temperatures greater than or equal to 10000
               logStatWC1 = logUC1[4];
               logStatWMg1 = logUMg1[4];
               logStatWMg2 = logUMg2[4];
               logStatWAl1 = logUAl1[4];
               logStatWSi1 = logUSi1[4];
               logStatWSi2 = logUSi2[4];
               logStatWFe1 = logUFe1[4];
            }

            logGroundPopsC1[iD] = stagePops[5][0][iD] - logStatWC1;
            logGroundPopsMg1[iD] = stagePops[11][0][iD] - logStatWMg1;
            //console.log("iD " + iD + " stagePops[11][0] " + logE*(stagePops[11][0][iD]+temp[1][iD]+logK));
           // console.log("iD " + iD + " stagePops[11][0] " + Math.exp(stagePops[11][0][iD]+temp[1][iD]+logK));
            logGroundPopsMg2[iD] = stagePops[11][1][iD] - logStatWMg2;
            logGroundPopsAl1[iD] = stagePops[12][0][iD] - logStatWAl1;
            logGroundPopsSi1[iD] = stagePops[13][0][iD] - logStatWSi1;
            logGroundPopsSi2[iD] = stagePops[13][1][iD] - logStatWSi2;
            logGroundPopsFe1[iD] = stagePops[25][0][iD] - logStatWFe1;

         }   
        
         var waveno;  //cm?? 
         var freq, logFreq, kapBF;
         var stimEmExp, stimEmLogExp, stimEmLogExpHelp, stimEm;
  
         //System.out.println("iD    iL    lambda    stimEm    aC1     aMg1     aMg2     aAl1    aSi1    aSi2    aFe1 ");
         for (var iL = 0; iL < numLams; iL++){
//
//initialization:
            for (var i = 0; i < numDeps; i++){
               aC1[i] = 0.0;
               aMg1[i] = 0.0;
               aMg2[i] = 0.0;
               aAl1[i] = 0.0;
               aSi1[i] = 0.0;
               aSi2[i] = 0.0;
               aFe1[i] = 0.0;
            }
 
            waveno = 1.0 / lambdaScale[iL];  //cm^-1??
            logFreq = logC - Math.log(lambdaScale[iL]); 
            freq = Math.exp(logFreq);
        
            stimEmLogExpHelp = logH + logFreq - logK;   

            //System.out.println("Calling opacC1 from masterMetal..."); 
            if (freq >= 2.0761e15) { 
               aC1 = opacC1(numDeps, temp, lambdaScale[iL], logGroundPopsC1);
            }
            if (freq >= 2.997925e+14) {
               aMg1 = opacMg1(numDeps, temp, lambdaScale[iL], logGroundPopsMg1);
            }
            if (freq >= 2.564306e15) {
               aMg2 = opacMg2(numDeps, temp, lambdaScale[iL], logGroundPopsMg2);
            }
            if (freq >= 1.443e15) {
               aAl1 = opacAl1(numDeps, temp, lambdaScale[iL], logGroundPopsAl1);
            }
            if (freq >= 2.997925e+14) {
               aSi1 = opacSi1(numDeps, temp, lambdaScale[iL], logGroundPopsSi1);
            }
            if (freq >= 7.6869872e14) {
               aSi2 = opacSi2(numDeps, temp, lambdaScale[iL], logGroundPopsSi2);
            }
            if (waveno >= 21000.0) { 
               aFe1 = opacFe1(numDeps, temp, lambdaScale[iL], logGroundPopsFe1);
            }

            for (var iD = 0; iD < numDeps; iD++){

               kapBF = 1.0e-99; //minimum safe value
               stimEmLogExp = stimEmLogExpHelp - temp[1][iD];
               stimEmExp = -1.0 * Math.exp(stimEmLogExp);
               stimEm = ( 1.0 - Math.exp(stimEmExp) ); //LTE correction for stimulated emission  

               //kapBF = aC1[iD] + aMg1[iD] + aMg2[iD] + aAl1[iD] + aSi1[iD] + aSi2[iD] + aFe1[iD] ;
               kapBF = kapBF + aC1[iD] + aMg1[iD] + aMg2[iD] + aAl1[iD] + aSi1[iD] + aSi2[iD] + aFe1[iD]; // + aMg1[iD] + aMg2[iD] + aAl1[iD] + aSi1[iD] + aSi2[iD];  //debug
               masterBF[iL][iD] = Math.log(kapBF) + Math.log(stimEm);
             //  if ( (iD%10 == 0) && (iL%10 == 0) ) {
             //    System.out.format("%03d, %03d, %21.15f, %21.15f, %21.15f, %21.15f, %21.15f, %21.15f, %21.15f, %21.15f, %21.15f, %n", 
             //       iD, iL, lambdaScale[iL], Math.log10(stimEm), Math.log10(aC1[iD]), Math.log10(aMg1[iD]), Math.log10(aMg2[iD]), Math.log10(aAl1[iD]), Math.log10(aSi1[iD]), Math.log10(aSi2[iD]), Math.log10(aFe1[iD]));
             //  }

            } //iD
 
         } //iL

         return masterBF;

      }; //end method masterMetal

      var opacC1 = function(numDeps, temp, lambda, logGroundPops){

//c******************************************************************************
//c     This routine computes the bound-free absorption due to C I.
//c******************************************************************************

  //System.out.println("opacC1 called...");
     // include 'Atmos.com'
     // include 'Kappa.com'
var c = 2.9979249E+10; // light speed in vaccuum in cm/s
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var eV = 1.602176565E-12; // eV in ergs
var logC = Math.log(c);
var logK = Math.log(k);
var logEv = Math.log(eV);

      var sigma = 0.0;
      var aC1 = [];
      aC1.length = numDeps;
//cross-section is zero below threshold, so initialize:
      for (var i = 0; i < numDeps; i++){
         aC1[i] = 0.0;
      }

      var waveno = 1.0 / lambda;  //cm^-1?? 
      var freq = c / lambda;  
    
      var arg; 
      var c1240 = [];
      c1240.length = numDeps; 
      var c1444 = [];
      c1444.length = numDeps;
      var freq1 = 0.0;
      var logTkev;
      var tkev = [];
      tkev.length = numDeps; 

//      int modcount = 0;
      for (var i = 0; i < numDeps; i++){
         logTkev = temp[1][i] + logK - logEv;
         tkev[i] = Math.exp(logTkev);
      }

//c  initialize some quantities for each new model atmosphere
      for (var i = 0; i < numDeps; i++){
         c1240[i] = 5.0 * Math.exp(-1.264/tkev[i]);
         c1444[i] = Math.exp(-2.683/tkev[i]);
      }

//c  initialize some quantities for each new model atmosphere or new frequency;
//c  Luo, D. and Pradhan, A.K. 1989, J.Phys. B, 22, 3377-3395.
//c  Burke, P.G. and Taylor, K.T. 1979, J. Phys. B, 12, 2971-2984.
//      if (modelnum.ne.modcount .or. freq.ne.freq1) then
        
         var aa, bb, eeps;
         freq1 = freq;
         var ryd = 109732.298; //Rydberg constant in cm^-1
         //waveno = freq/2.99792458d10
         var xs0 = 0.0;
         var xs1 = 0.0;
         var xd0 = 0.0;
         var xd1 = 0.0;
         var xd2 = 0.0;
         var x1444 = 0.0;
         var x1240 = 0.0;
         var x1100 = 0.0;
//c        P2 3P   1
//c  I AM NOT SURE WHETHER THE CALL TO SEATON IN THE NEXT STATEMENT IS
//c  CORRECT, BUT IT ONLY AFFECTS THINGS BELOW 1100A
         if (freq >= 2.7254e15) {
           arg = -16.80 - ( (waveno-90777.000)/3.0/ryd );
            x1100 = Math.pow(10.0, arg)
              * seaton (2.7254e15, 1.219e-17, 2.0e0, 3.317e0, freq);
         }
//c        P2 1D   2
         if (freq >= 2.4196e15) { 
            arg = -16.80 - ( (waveno-80627.760)/3.0/ryd );
            xd0 = Math.pow(10.0, arg);
            eeps = (waveno-93917.0) * 2.0/9230.0;
            aa = 22.0e-18;
            bb = 26.0e-18;
            xd1 = ((aa*eeps) + bb) / (Math.pow(eeps, 2)+1.0);
            eeps = (waveno-111130.0) * 2.0/2743.0;
            aa = -10.5e-18;
            bb = 46.0e-18;
            xd2 = ( (aa*eeps) + bb) / (Math.pow(eeps, 2)+1.0);
            x1240 = xd0 + xd1 + xd2;
         } 
//c        P2 1S   3
         if (freq >= 2.0761e15) { 
            arg = -16.80 - ( (waveno-69172.400)/3.0/ryd );
            xs0 = Math.pow(10.0, arg);
            eeps = (waveno-97700.0) * 2.0/2743.0;
            aa = 68.0e-18;
            bb = 118.0e-18;
            xs1 = ( (aa*eeps) + bb) / (Math.pow(eeps, 2)+1.0);
            x1444 = xs0 + xs1;
         } 

      //System.out.println("freq " + freq + " lambda " + lambda);
      for (var i = 0; i < numDeps; i++){
         if (freq >= 2.0761e15) { 
            aC1[i] = (x1100*9.0 + x1240*c1240[i] 
             + x1444*c1444[i]) * Math.exp(logGroundPops[i]); //last factor is total neutral stage pop over the partn fn
           // System.out.println("i " + i + " logPop " + logGroundPops[i] + " aC1 " + aC1[i]);
         } 
      } 

      return aC1;

}; //end method opacC1


      var seaton = function(freq0, xsect, power, a, freq){
//c******************************************************************************
//c     This function is a general representation for b-f absorption above
//c     a given ionization limit freq0, using cross-section xsect, 
//c******************************************************************************

      //include 'Kappa.com'
      var freqratio = freq0 / freq;
      var seaton;
      var help;

      help = Math.floor( (2.0*power) + 0.01 );

      seaton = xsect * (a + freqratio*(1.0-a))*
              Math.sqrt( Math.pow(freqratio, help) );

      return seaton;

}; //end method seaton


//c******************************************************************************
//c     This routine computes the bound-free absorption due to Mg I.  
//c******************************************************************************

      var opacMg1 = function(numDeps, temp, lambda, logGroundPops){
  //System.out.println("opacMg1 called...");
var c = 2.9979249E+10; // light speed in vaccuum in cm/s
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var h = 6.62606957E-27; //Planck's constant in ergs sec
var logC = Math.log(c);
var logK = Math.log(k);
var logH = Math.log(h);

      var sigma = 0.0;
      var aMg1 = [];
      aMg1.length = numDeps;

//cross-section is zero below threshold, so initialize:
      for (var i = 0; i < numDeps; i++){
         aMg1[i] = 0.0;
      }

      var freq = c / lambda;  
      var freqlg = Math.log(freq); //base e?


//      include 'Atmos.com'
//      include 'Kappa.com'
//      real*8 flog(9), freqMg(7), peach(7,15), xx(7), tlg(7)
//      real*8 dt(100)
//      integer nt(100)

      var xx = [];
      xx.length = 7;
      var dt = [];
      dt.length = 100;
      var nt = [];
      nt.length = 100; 

//      data peach/
      //double[][] peach = new double[7][15];
//c         4000 K 
     var peach0 = [ -42.474, -41.808, -41.273, -45.583, -44.324, -50.969, -50.633, -53.028, -51.785, -52.285, -52.028, -52.384, -52.363, -54.704, -54.359 ]; 
//c          5000 K  
     var peach1 = [ -42.350, -41.735, -41.223, -44.008, -42.747, -48.388, -48.026, -49.643, -48.352, -48.797, -48.540, -48.876, -48.856, -50.772, -50.349 ]; 
//c          6000 K  
     var peach2 = [ -42.109, -41.582, -41.114, -42.957, -41.694, -46.630, -46.220, -47.367, -46.050, -46.453, -46.196, -46.513, -46.493, -48.107, -47.643 ]; 
//c         7000 K 
     var peach3 = [ -41.795, -41.363, -40.951, -42.205, -40.939, -45.344, -44.859, -45.729, -44.393, -44.765, -44.507, -44.806, -44.786, -46.176, -45.685 ]; 
//c         8000 K 
     var peach4 = [ -41.467, -41.115, -40.755, -41.639, -40.370, -44.355, -43.803, -44.491, -43.140, -43.486, -43.227, -43.509, -43.489, -44.707, -44.198 ]; 
//c         9000 K 
     var peach5 = [ -41.159, -40.866, -40.549, -41.198, -39.925, -43.568, -42.957, -43.520, -42.157, -42.480, -42.222, -42.488, -42.467, -43.549, -43.027 ]; 
//c        10000 K 
     var peach6 = [ -40.883, -40.631, -40.347, -40.841, -39.566, -42.924, -42.264, -42.736, -41.363, -41.668, -41.408, -41.660, -41.639, -42.611, -42.418 ];

     var peach = [ peach0, peach1, peach2, peach3, peach4, peach5, peach6 ];

     // double[] freqMg = new double[7];
      var freqMg = [ 1.9341452e15, 1.8488510e15, 1.1925797e15,
                  7.9804046e14, 4.5772110e14, 4.1440977e14,
                  4.1113514e14 ];
     // double[] flog = new double[9];
      var flog = [ 35.23123, 35.19844, 35.15334, 34.71490, 34.31318,
                33.75728, 33.65788, 33.64994, 33.43947 ];
     // double[] tlg = new double[7];
      var tlg = [ 8.29405, 8.51719, 8.69951, 8.85367, 8.98720, 9.10498, 
               9.21034 ]; //base e?
      var freq1 = 0.0; 
//modcount/0/

   var thelp, nn;
   var dd, dd1;
   //double log10E = Math.log10(Math.E);

//c  initialize some quantities for each new model atmosphere
//      if (modelnum .ne. modcount) then
//         modcount = modelnum
         for (var i = 0; i < numDeps; i++){
            thelp = Math.floor(temp[0][i]/1000.0) - 3;
            //n = Math.max( Math.min(6, thelp-3), 1 );
            // -1 term to adjust from FORTRAN to Java subscripting
            nn = Math.max( Math.min(6, thelp), 1 ) - 1; // -1 term to adjust from FORTRAN to Java subscripting
            nt[i] = nn;
            dt[i] = (temp[1][i]-tlg[nn]) / (tlg[nn+1]-tlg[nn]); //base e?
         }
//      endif
   
//c  initialize some quantities for each new model atmosphere or new frequency;
      //if (modelnum.ne.modcount .or. freq.ne.freq1) then
         freq1 = freq;
       //  do n=1,7
       //     if (freq .gt. freqMg(n)) go to 23
       //  enddo
       //n = 7;
         nn = 0;
        // while ( (freq <= freqMg[n]) && (n < 6) ) {
        //    n++;
        // }
         nn = 0;
         for (var n = 0; n < 7; n++){
            //System.out.println("freq " + freq + " n " + n + " freqMg[n] " + freqMg[n]);
            if (freq > freqMg[n]){
               break;
            }
            nn++;
         }
         if (freq <= freqMg[6]){
            nn = 7;
         }

         dd = (freqlg-flog[nn]) / (flog[nn+1]-flog[nn]);
         //if (n .gt. 2) n = 2*n -2
            // -1 term to adjust from FORTRAN to Java subscripting
         //if (n > 2){
         if (nn > 1){
            // -1 term to adjust from FORTRAN to Java subscripting
            //n = 2*n - 2 - 1;
            nn = 2*nn - 2; // - 1;
         }
         dd1 = 1.0 - dd;
         //do it=1,7
         for (var it = 0; it < 7; it++){
            xx[it] = peach[it][nn+1]*dd + peach[it][nn]*dd1;
         }
         //enddo
      //endif

      //do i=1,ntau
      for (var i = 0; i < numDeps; i++){
         //if (freq .ge. 2.997925d+14) then
         if (freq >= 2.997925e+14) {
            nn = nt[i];
            aMg1[i] = Math.exp( (xx[nn]*(1.0e0-dt[i])) + (xx[nn+1]*dt[i]) ) *
                     Math.exp(logGroundPops[i]);
         //endif
         }
      }
      //enddo

      return aMg1;

 }; //end method opacMg1






//c******************************************************************************
//c     This routine computes the bound-free absorption due to Mg II.  
//c******************************************************************************

      var opacMg2 = function(numDeps, temp, lambda, logGroundPops){
  //System.out.println("opacMg2 called...");
var c = 2.9979249E+10; // light speed in vaccuum in cm/s
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var h = 6.62606957E-27; //Planck's constant in ergs sec
var logC = Math.log(c);
var logK = Math.log(k);
var logH = Math.log(h);

      var sigma = 0.0;
      var aMg2 = [];
      aMg2.length = numDeps;
//cross-section is zero below threshold, so initialize:
      for (var i = 0; i < numDeps; i++){
         aMg2[i] = 0.0;
      }

      var freq = c / lambda;  

      var logTkev;
      var tkev = []; 
      tkev.length = numDeps;

//      include 'Atmos.com'
//      include 'Kappa.com'
      var c1169 = []; 
      c1169.length = 100;
      var freq1 = 0.0;
      var x824 = 0.0;
      var x1169 = 0.0;
 //data modcount/0/

//  initialize some quantities for each new model atmosphere
//      if (modelnum .ne. modcount) then
//         modcount = modelnum
      for (var i = 0; i < numDeps; i++){
         logTkev = temp[1][i] + logK - logEv;
         tkev[i] = Math.exp(logTkev);
      }
         //do i=1,ntau
         for (var i = 0; i < numDeps; i++){
            c1169[i] = 6.0 * Math.exp(-4.43e+0/tkev[i]);
         }
//      endif

//c  initialize some quantities for each new model atmosphere or new frequency;
//c  there are two edges, one at 824 A and the other at 1169 A
//      if (modelnum.ne.modcount .or. freq.ne.freq1) then
         freq1 = freq;
         if (freq >= 3.635492e15) {
            x824 = seaton(3.635492e15, 1.40e-19, 4.0e0, 6.7e0, freq);
         } else {
            x824 = 1.0e-99;
         }
         if (freq >= 2.564306e15) {
            x1169 = 5.11e-19 * Math.pow( (2.564306e15/freq), 3.0);
         } else {
            x1169 = 1.0e-99;
         }
//      endif
      
      for (var i = 0; i < numDeps; i++){
         if (x1169 >= 1.0e-90) {
            aMg2[i] = (x824*2.0 + x1169*c1169[i])*
                     Math.exp(logGroundPops[i]);
         }
      }

      return aMg2;

    }; //end method opacMg2



//c******************************************************************************
//c     This routine computes the bound-free absorption due to Al I.
//c******************************************************************************

      var opacAl1 = function(numDeps, temp, lambda, logGroundPops){
  //System.out.println("opacAl1 called...");
var c = 2.9979249E+10; // light speed in vaccuum in cm/s
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var h = 6.62606957E-27; //Planck's constant in ergs sec
var logC = Math.log(c);
var logK = Math.log(k);
var logH = Math.log(h);
 
      var sigma = 0.0;
     var aAl1 = [];
     aAl1.length = numDeps;
//cross-section is zero below threshold, so initialize:
      for (var i = 0; i < numDeps; i++){
         aAl1[i] = 0.0;
      }

      var freq = c / lambda;  

//      include 'Atmos.com'
//      include 'Kappa.com'
   
      //do i=1,ntau
      for (var i = 0; i < numDeps; i++){
         //if (freq .ge. 1.443d15) then
         if (freq >= 1.443e15) {
            aAl1[i] = 6.0 * 6.5e-17 * Math.pow((1.443e15/freq), 5.0) *
                      Math.exp(logGroundPops[i]); 
         }
      }

      return aAl1;
      }; //end method opacAl1




//c******************************************************************************
//c     This routine computes the bound-free absorption due to Si I.  
//c******************************************************************************

      var opacSi1 = function(numDeps, temp, lambda, logGroundPops){
  //System.out.println("opacSi1 called...");
var c = 2.9979249E+10; // light speed in vaccuum in cm/s
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var h = 6.62606957E-27; //Planck's constant in ergs sec
var logC = Math.log(c);
var logK = Math.log(k);
var logH = Math.log(h);

      var sigma = 0.0;
      var aSi1 = [];
      aSi1.length = numDeps;
//cross-section is zero below threshold, so initialize:
      for (var i = 0; i < numDeps; i++){
         aSi1[i] = 0.0;
      }

      var freq = c / lambda;  
      var freqlg = Math.log(freq); //base e?


  //    include 'Atmos.com'
  //    include 'Kappa.com'
      var xx = [];
      xx.length = 9;
      var dt = [];
      dt.length = 100;
      var nt = [];
      nt.length = 100;
//      save
//c       4000  
      var peach0 = [ 38.136, 37.834, 37.898, 40.737, 40.581, 45.521, 45.520, 55.068, 53.868, 54.133, 54.051, 54.442, 54.320, 55.691, 55.661, 55.973, 55.922, 56.828, 56.657 ];
//c       5000  
      var peach1 = [ 38.138, 37.839, 37.898, 40.319, 40.164, 44.456, 44.455, 51.783, 50.369, 50.597, 50.514, 50.854, 50.722, 51.965, 51.933, 52.193, 52.141, 52.821, 52.653 ];
//c       6000  
      var peach2 = [ 38.140, 37.843, 37.897, 40.047, 39.893, 43.753, 43.752, 49.553, 48.031, 48.233, 48.150, 48.455, 48.313, 49.444, 49.412, 49.630, 49.577, 50.110, 49.944 ];
//c       7000  
      var peach3 = [ 38.141, 37.847, 37.897, 39.855, 39.702, 43.254, 43.251, 47.942, 46.355, 46.539, 46.454, 46.733, 46.583, 47.615, 47.582, 47.769, 47.715, 48.146, 47.983 ];
//c       8000   
      var peach4 = [ 38.143, 37.850, 37.897, 39.714, 39.561, 42.878, 42.871, 46.723, 45.092, 45.261, 45.176, 45.433, 45.277, 46.221, 46.188, 46.349, 46.295, 46.654, 46.491 ];
//c       9000  
      var peach5 = [ 38.144, 37.853, 37.896, 39.604, 39.452, 42.580, 42.569, 45.768, 44.104, 44.262, 44.175, 44.415, 44.251, 45.119, 45.085, 45.226, 45.172, 45.477, 45.315 ];
//c       10000 
      var peach6 = [ 38.144, 37.855, 37.895, 39.517, 39.366, 42.332, 42.315, 44.997, 43.308, 43.456, 43.368, 43.592, 43.423, 44.223, 44.189, 44.314, 44.259, 44.522, 44.360 ];
//c       11000 
      var peach7 = [ 38.145, 37.857, 37.895, 39.445, 39.295, 42.119, 42.094, 44.360, 42.652, 42.790, 42.702, 42.912, 42.738, 43.478, 43.445, 43.555, 43.500, 43.730, 43.569 ];
//c       12000 
      var peach8 = [ 38.145, 37.858, 37.894, 39.385, 39.235, 41.930, 41.896, 43.823, 42.100, 42.230, 42.141, 42.340, 42.160, 42.848, 42.813, 42.913, 42.858, 43.061, 42.901 ];
//      real*8 peach(9,19)
      //double[][] peach = new double[9][19];
      var peach = [ peach0, peach1, peach2, peach3, peach4, peach5, peach6, peach7, peach8 ];

//c     3P, 1D, 1S, 1D, 3D, 3F, 1D, 3P
      //double[] freqSi = new double[9];
      var freqSi = [ 2.1413750e15, 1.9723165e15, 1.7879689e15,
                  1.5152920e15, 5.5723927e14, 5.3295914e14,
                  4.7886458e14, 4.7216422e14, 4.6185133e14 ];
      //double[] flog = new double[11];
      var flog = [ 35.45438, 35.30022, 35.21799, 35.11986, 34.95438,
                33.95402, 33.90947, 33.80244, 33.78835, 33.76626,
                33.70518 ];
      //double[] tlg = new double[9]; 
      var tlg = [ 8.29405, 8.51719, 8.69951, 8.85367, 8.98720, 9.10498,
               9.21034, 9.30565, 9.39266 ];
      var freq1 = 0.0;
//, modcount/0/

   var thelp, nn;
   var dd, dd1;
//c  initialize some quantities for each new model atmosphere
//      if (modelnum .ne. modcount) then
//         modcount = modelnum
         //do i=1,ntau
         for (var i = 0; i < numDeps; i++){
            thelp = Math.floor(temp[0][i]/1000.0) - 3;
            // -1 term to adjust from FORTRAN to Java subscripting
            //n = Math.max( Math.min(8, thelp-3), 1 );
            nn = Math.max( Math.min(8, thelp), 1 ) - 1;
            nt[i] = nn;
            dt[i] = (temp[1][i]-tlg[nn]) / (tlg[nn+1]-tlg[nn]);
         }
//      endif

//  initialize some quantities for each new model atmosphere or new frequency
      //if (modelnum.ne.modcount .or. freq.ne.freq1) then
         freq1 = freq;
//         do n=1,9
//            if (freq .gt. freqSi(n)) go to 23
//         enddo
//         n = 9;
         nn = 0;
        // while ( (freq <= freqSi[n]) && (n < 8) ) {
        //    n++;
        // }
         nn = 0;
         for (var n = 0; n < 9; n++){
            if (freq > freqSi[n]){
               break;
            }
            nn++;
         }
         if (freq <= freqSi[8]){
           nn = 9;
         }

//
         dd = (freqlg-flog[nn]) / (flog[nn+1]-flog[nn]);
            // -1 term to adjust from FORTRAN to Java subscripting
         //if (n > 2) { 
         if (nn > 1) { 
            // -1 term to adjust from FORTRAN to Java subscripting
            nn = 2*nn - 2; // - 1; // n already adjusted by this point?
         }
         dd1 = 1.0 - dd;
         for (var it = 0; it < 9; it++){
            xx[it] = peach[it][nn+1]*dd + peach[it][nn]*dd1;
         }
      //endif

      for (var i=0; i < numDeps; i++){
         if (freq >= 2.997925e+14) {
            nn = nt[i];
            aSi1[i] = ( 9.0 * Math.exp( -(xx[nn]*(1.-dt[i]) + xx[nn+1]*dt[i]) ) ) *
                      Math.exp(logGroundPops[i]); 
         }
      }

      return aSi1;

      };  //end method opacSi1




//c******************************************************************************
//c     This routine computes the bound-free absorption due to Si II.
//c******************************************************************************

      var opacSi2 = function(numDeps, temp, lambda, logGroundPops){
  //System.out.println("opacSi2 called...");
var c = 2.9979249E+10; // light speed in vaccuum in cm/s
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var h = 6.62606957E-27; //Planck's constant in ergs sec
var logC = Math.log(c);
var logK = Math.log(k);
var logH = Math.log(h);

      var sigma = 0.0;
      var aSi2 = [];
      aSi2.length = numDeps;
//cross-section is zero below threshold, so initialize:
      for (var i = 0; i < numDeps; i++){
         aSi2[i] = 0.0;
      }

      var freq = c / lambda;  
      var freqlg = Math.log(freq); //base e?

   var thelp, nn;
   var dd, dd1;

//      include 'Atmos.com'
//      include 'Kappa.com'
      var xx = [];
      xx.length = 6;
      var dt = [];
      dt.length = 100;
      var nt = [];
      nt.length = 100;
      //double peach = new double[6][14]; 
//c        10000
      var peach0 = [ -43.8941, -42.2444, -40.6054, -54.2389, -50.4108, -52.0936, -51.9548, -54.2407, -52.7355, -53.5387, -53.2417, -53.5097, -54.0561, -53.8469 ];
//c        12000 
      var peach1 = [ -43.8941, -42.2444, -40.6054, -52.2906, -48.4892, -50.0741, -49.9371, -51.7319, -50.2218, -50.9189, -50.6234, -50.8535, -51.2365, -51.0256 ];
//c        14000 
      var peach2 = [ -43.8941, -42.2444, -40.6054, -50.8799, -47.1090, -48.5999, -48.4647, -49.9178, -48.4059, -49.0200, -48.7252, -48.9263, -49.1980, -48.9860 ];
//c        16000 
      var peach3 = [ -43.8941, -42.2444, -40.6054, -49.8033, -46.0672, -47.4676, -47.3340, -48.5395, -47.0267, -47.5750, -47.2810, -47.4586, -47.6497, -47.4368 ];
//c        18000 
      var peach4 = [ -43.8941, -42.2444, -40.6054, -48.9485, -45.2510, -46.5649, -46.4333, -47.4529, -45.9402, -46.4341, -46.1410, -46.2994, -46.4302, -46.2162 ];
//c        20000  
      var peach5 = [ -43.8941, -42.2444, -40.6054, -48.2490, -44.5933, -45.8246, -45.6947, -46.5709, -45.0592, -45.5082, -45.2153, -45.3581, -45.4414, -45.2266 ];
 
      var peach = [ peach0, peach1, peach2, peach3, peach4, peach5 ];

      //double[] freqSi = new double[7];
      var freqSi = [ 4.9965417e15, 3.9466738e15, 1.5736321e15,
                  1.5171539e15, 9.2378947e14, 8.3825004e14,
                  7.6869872e14 ];
//c     2P, 2D, 2P, 2D, 2P
      //double[] flog = new double[9]; 
      var flog = [ 36.32984, 36.14752, 35.91165, 34.99216, 34.95561,
                34.45951, 34.36234, 34.27572, 34.20161 ];
      //double[] tlg = new double[6];
      var tlg = [ 9.21034, 9.39266, 9.54681, 9.68034, 9.79813, 9.90349 ];
      var freq1 = 0.0;
 // modcount/0/

//c  set up some data upon first entrance with a new model atmosphere
//      if (modelnum .ne. modcount) then
//         modcount = modelnum
         for (var i = 0; i < numDeps; i++){
            thelp = Math.floor(temp[0][i]/2000.0) - 4;
            // -1 term to adjust from FORTRAN to Java subscripting
            //n = Math.max( Math.min(5, thelp-4), 1 );
            nn = Math.max( Math.min(5, thelp), 1 ) - 1;
            nt[i] = nn;
            dt[i] = (temp[1][i]-tlg[nn]) / (tlg[nn+1]-tlg[nn]);
         }
//      endif

//c  initialize some quantities for each new model atmosphere or new frequency
//      if (modelnum.ne.modcount .or. freq.ne.freq1) then
         freq1 = freq;
//         do n=1,7
//            if (freq .gt. freqSi(n)) go to 23
//         enddo
//         n = 8
         nn = 0;
        // while ( (freq <= freqSi[n]) && (n < 6) ) {
        //    n++;
        // }
         nn = 0;
         for (var n = 0; n < 7; n++){
            if (freq > freqSi[n]){
               break;
            }
            nn++;
         }
         if (freq <= freqSi[6]){
           nn = 7;
         }

//
         dd = (freqlg-flog[nn]) / (flog[nn+1]-flog[nn]);
            // -1 term to adjust from FORTRAN to Java subscripting
         //if (n > 2){
         if (nn > 1){
            // -1 term to adjust from FORTRAN to Java subscripting
            //n = 2*n - 2;
            nn = 2*nn - 2; // - 1; //n already adjusted by this point?
         }
            // -1 term to adjust from FORTRAN to Java subscripting
         //if (n == 14){
         if (nn == 13){
            // -1 term to adjust from FORTRAN to Java subscripting
            //n = 13;
            nn = 12;
         }
         dd1 = 1.0 - dd;
         for (var it = 0; it < 6; it++){
            xx[it] = peach[it][nn+1]*dd + peach[it][nn]*dd1;
         }
//      endif

      for (var i = 0; i < numDeps; i++){
         if (freq >= 7.6869872e14) {
            nn = nt[i];
            aSi2[i] = ( 6.0 * Math.exp(xx[nn]*(1.0-dt[i]) + xx[nn+1]*dt[i]) ) *
                      Math.exp(logGroundPops[i]);
         }
      }

      return aSi2;

      }; //end method opacSi2


//c******************************************************************************
//c     This routine computes the bound-free absorption due to Fe I.
//c******************************************************************************


      var opacFe1 = function(numDeps, temp, lambda, logGroundPops){
  //System.out.println("opacFe1 called...");
var c = 2.9979249E+10; // light speed in vaccuum in cm/s
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var h = 6.62606957E-27; //Planck's constant in ergs sec
var logC = Math.log(c);
var logK = Math.log(k);
var logH = Math.log(h);

      var sigma = 0.0;
      var aFe1 = []; 
      aFe1.length = numDeps;
//cross-section is zero below threshold, so initialize:
      for (var i = 0; i < numDeps; i++){
         aFe1[i] = 0.0;
      }

      var waveno = 1.0 / lambda;  //cm^-1?? 
      var freq = c / lambda;  

//      include 'Atmos.com'
//      include 'Kappa.com'
      //real*8 bolt(48,100), gg(48), ee(48), wno(48), xsect(48)
      var bolt = [];
      bolt.length = 48;
      for (var i = 0; i < 48; i++){
         bolt[i] = [];
         bolt[i].length = 100;
      }
      var xsect = [];
      xsect.length = 48;
// double[] gg = new double[48];
      var gg = 
     [25.0, 35.0, 21.0, 15.0, 9.0,  35.0, 33.0, 21.0, 27.0, 49.0, 9.0,  21.0, 27.0, 9.0,  9.0,
      25.0, 33.0, 15.0, 35.0, 3.0,   5.0, 11.0, 15.0, 13.0, 15.0, 9.0,  21.0, 15.0, 21.0, 25.0, 35.0,
      9.0,  5.0,  45.0, 27.0, 21.0, 15.0, 21.0, 15.0, 25.0, 21.0, 35.0, 5.0,  15.0, 45.0, 35.0, 55.0, 25.0];
// double[] ee = new double[48];
      var ee = 
     [500.0,   7500.0,  12500.0, 17500.0, 19000.0, 19500.0, 19500.0, 21000.0,
      22000.0, 23000.0, 23000.0, 24000.0, 24000.0, 24500.0, 24500.0, 26000.0, 26500.0,
      26500.0, 27000.0, 27500.0, 28500.0, 29000.0, 29500.0, 29500.0, 29500.0, 30000.0,
      31500.0, 31500.0, 33500.0, 33500.0, 34000.0, 34500.0, 34500.0, 35000.0, 35500.0,
      37000.0, 37000.0, 37000.0, 38500.0, 40000.0, 40000.0, 41000.0, 41000.0, 43000.0,
      43000.0, 43000.0, 43000.0, 44000.0];

// double[] wno = new double[48];
      var wno = 
      [63500.0, 58500.0, 53500.0, 59500.0, 45000.0, 44500.0, 44500.0, 43000.0,
       58000.0, 41000.0, 54000.0, 40000.0, 40000.0, 57500.0, 55500.0, 38000.0, 57500.0,
       57500.0, 37000.0, 54500.0, 53500.0, 55000.0, 34500.0, 34500.0, 34500.0, 34000.0,
       32500.0, 32500.0, 32500.0, 32500.0, 32000.0, 29500.0, 29500.0, 31000.0, 30500.0,
       29000.0, 27000.0, 54000.0, 27500.0, 24000.0, 47000.0, 23000.0, 44000.0, 42000.0,
       42000.0, 21000.0, 42000.0, 42000.0];

      //data freq1, modcount/0., 0/
      var freq1 = 0.0;
 
      var hkt;

//c  set up some data upon first entrance with a new model atmosphere
//      if (modelnum .ne. modcount) then
//         modcount = modelnum
         for (var i = 0; i < numDeps; i++){
            hkt = 6.6256e-27 / (1.38054e-16*temp[0][i]);
            //do k=1,48
            for (var k = 0; k < 48; k++){
               bolt[k][i] = gg[k] * Math.exp(-ee[k]*2.99792458e10*hkt);
            }
         }
//      endif

//c  initialize some quantities for each new model atmosphere or new frequency;
//c  the absorption begins at 4762 A.
//      if (modelnum.ne.modcount .or. freq.ne.freq1) then
         freq1 = freq;
         //waveno = freq/2.99792458d10
         //if (waveno .ge. 21000.) then
         if (waveno >= 21000.0){ 
            //do k=1,48
            for (var k = 0; k < 48; k++){
               xsect[k] = 0.0;
               //if (wno(k) .lt. waveno){ 
               if (wno[k] < waveno){ 
                  xsect[k]= 3.0e-18 /
                           ( 1.0 + Math.pow( (wno[k]+3000.0-waveno)/wno[k]/0.1, 4 ) );
               }
            }
         }
//      endif

      //do i=1,ntau
      for (var i = 0; i < numDeps; i++){
//aFe1 seems to be cumulative.  Moog does not seem to have this reset for each depth, but my aFe is blowing up, so let's try it...
         aFe1[i] = 0.0; //reset accumulator each depth- ???
         //if (waveno .ge. 21000.) then
         if (waveno >= 21000.0) { 
            //do k=1,48
              for (var k = 0; k < 48; k++){
               aFe1[i] = 0.0; //reset accumulator each 'k' - ??? (like removing aFe1 term in expression below...
               aFe1[i] = aFe1[i] + xsect[k]*bolt[k][i] *
                     Math.exp(logGroundPops[i]);
              }
            }
         }
            
      return aFe1;

   }; // end opacFe1 method




// Rayleigh scattering opacity routines taken from Moog (moogjul2014/, MOOGJUL2014.tar)
//Chris Sneden (Universtiy of Texas at Austin)  and collaborators
//http://www.as.utexas.edu/~chris/moog.html
////From Moog source file Opacscat.f





//c******************************************************************************
//c  The subroutines needed to calculate the opacities from scattering by
//c  H I, H2, He I, are in this file.  These are from ATLAS9.
//c******************************************************************************


      var masterRayl = function(numDeps, numLams, temp, lambdaScale, stagePops, molPops){

    //System.out.println("masterRayl called...");
var c = 2.9979249E+10; // light speed in vaccuum in cm/s
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var h = 6.62606957E-27; //Planck's constant in ergs sec
var logC = Math.log(c);
var logK = Math.log(k);
var logH = Math.log(h);

//From Moog source file Opacitymetals.f
// From how values such as aC1[] are used in Moog file Opacit.f to compute the total opacity
// and then the optical depth scale, I infer that they are extinction coefficients 
// in cm^-1 
//
// There does not seem to be any correction for stimulated emission 

         var masterRScat = [];
         masterRScat.length = numLams;
         for (var i = 0; i < numLams; i++){
            masterRScat[i] = [];
            masterRScat[i].length = numDeps;
         }

         var logUH1 = [];
         logUH1.length = 5;
         var logUHe1 = [];
         logUHe1.length = 5;

         var logStatWH1 = 0.0;
         var logStatWHe1 = 0.0;

         var theta = 1.0;
         var species = "";
         var logGroundPopsH1 = [];
         logGroundPopsH1.length = numDeps;
         var logGroundPopsHe1 = [];
         logGroundPopsHe1.length = numDeps;
//
// H I: Z=1 --> iZ=0:
         var sigH1 = [];
         sigH1.length = numDeps;
// He I: Z=2 --> iZ=1:
         var sigHe1 = [];
         sigHe1.length = numDeps;

         species = "HI";
         logUH1 = getPartFn2(species);
         species = "HeI";
         logUHe1 = getPartFn2(species);

         for (var iD = 0; iD < numDeps; iD++){
// NEW Interpolation with temperature for new partition function: lburns
            var thisTemp = temp[0][iD];
            if (thisTemp <= 130){
                logStatWH1 = logUH1[0];
                logStatWHe1 = logUHe1[0];
            } else if (thisTemp > 130 && thisTemp <= 500){
                logStatWH1 = logUH1[1] * (thisTemp - 130)/(500 - 130)
                           + logUH1[0] * (500 - thisTemp)/(500 - 130);
                logStatWHe1 = logUHe1[1] * (thisTemp - 130)/(500 - 130)
                            + logUHe1[0] * (500 - thisTemp)/(500 - 130);
            } else if (thisTemp > 500 && thisTemp <= 3000){
                logStatWH1 = logUH1[2] * (thisTemp - 500)/(3000 - 500)
                           + logUH1[1] * (3000 - thisTemp)/(3000 - 500);
                logStatWHe1 = logUHe1[2] * (thisTemp - 500)/(3000 - 500)
                            + logUHe1[1] * (3000 - thisTemp)/(3000 - 500);
            } else if (thisTemp > 3000 && thisTemp <= 8000){
                logStatWH1 = logUH1[3] * (thisTemp - 3000)/(8000 - 3000)
                           + logUH1[2] * (8000 - thisTemp)/(8000 - 3000);
                logStatWHe1 = logUHe1[3] * (thisTemp - 3000)/(8000 - 3000)
                            + logUHe1[2] * (8000 - thisTemp)/(8000 - 3000);
            } else if (thisTemp > 8000 && thisTemp < 10000){
                logStatWH1 = logUH1[4] * (thisTemp - 8000)/(10000 - 8000)
                           + logUH1[3] * (10000 - thisTemp)/(10000 - 8000);
                logStatWHe1 = logUHe1[4] * (thisTemp - 8000)/(10000 - 8000)
                            + logUHe1[3] * (10000 - thisTemp)/(10000 - 8000);
            } else {
            // for temperatures of greater than or equal to 10000K lburns
                logStatWH1 = logUH1[4];
                logStatWHe1 = logUHe1[4];
            }
            logGroundPopsH1[iD] = stagePops[0][0][iD] - logStatWH1; 
            logGroundPopsHe1[iD] = stagePops[1][0][iD] - logStatWHe1; 
         }   
       
         var kapRScat = 0.0; 
         //System.out.println("iD    iL    lambda    sigH1    sigHe1 ");
         for (var iL = 0; iL < numLams; iL++){
//
            for (var i = 0; i < numDeps; i++){
               sigH1[i] = 0.0;
               sigHe1[i] = 0.0;
            }

            //System.out.println("Calling opacH1 from masterMetal..."); 
            sigH1 = opacHscat(numDeps, temp, lambdaScale[iL], logGroundPopsH1);
            sigHe1 = opacHescat(numDeps, temp, lambdaScale[iL], logGroundPopsHe1);

            for (var iD = 0; iD < numDeps; iD++){
               kapRScat = sigH1[iD] + sigHe1[iD];
               masterRScat[iL][iD] = Math.log(kapRScat);
               //if ( (iD%10 == 0) && (iL%10 == 0) ) {
               //  System.out.format("%03d, %03d, %21.15f, %21.15f, %21.15f %n",
               //     iD, iL, lambdaScale[iL], Math.log10(sigH1[iD]), Math.log10(sigHe1[iD]));
               //}

            } //iD
 
         } //iL

         return masterRScat;

      }; //end method masterRScat


      var opacHscat = function(numDeps, temp, lambda, logGroundPops){

      //System.out.println("opacHscat called");
var c = 2.9979249E+10; // light speed in vaccuum in cm/s
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var h = 6.62606957E-27; //Planck's constant in ergs sec
var logC = Math.log(c);
var logK = Math.log(k);
var logH = Math.log(h);

      var sigH = [];
      sigH.length = numDeps;

//cross-section is zero below threshold, so initialize:
      for (var i = 0; i < numDeps; i++){
         sigH[i] = 0.0;
      }

      var freq = c / lambda;  

//c******************************************************************************
//c  This routine computes H I Rayleigh scattering opacities.
//c******************************************************************************

//      include 'Atmos.com'
//      include 'Kappa.com'
//      include 'Linex.com'

      var wavetemp = 2.997925e18 / Math.min(freq, 2.463e15);
      var ww = Math.pow(wavetemp, 2);
      var sig = ( 5.799e-13 + (1.422e-6/ww) + (2.784/(ww*ww)) ) / (ww*ww);
      for (var i = 0; i < numDeps; i++){
         sigH[i] = sig * 2.0 * Math.exp(logGroundPops[i]);
      }

      return sigH;

  }; //end method opacHscat


      var opacHescat = function(numDeps, temp, lambda, logGroundPops){

      //System.out.println("opacHescat called");
var c = 2.9979249E+10; // light speed in vaccuum in cm/s
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var h = 6.62606957E-27; //Planck's constant in ergs sec
var logC = Math.log(c);
var logK = Math.log(k);
var logH = Math.log(h);

      var sigHe = [];
      sigHe.length = numDeps;

//cross-section is zero below threshold, so initialize:
      for (var i = 0; i < numDeps; i++){
         sigHe[i] = 0.0;
      }

      var freq = c / lambda;  

//c******************************************************************************
//c  This routine computes He I Rayleigh scattering opacities.
//c******************************************************************************

//      include 'Atmos.com'
//      include 'Kappa.com'
//      include 'Linex.com'

      var wavetemp = 2.997925e18 / Math.min(freq, 5.15e15);
      var ww = Math.pow(wavetemp, 2);
      var sig = (5.484e-14/ww/ww) * Math.pow( ( 1.0 + ((2.44e5 + (5.94e10/(ww-2.90e5)))/ww) ), 2 );
      for (var i = 0; i < numDeps; i++){
         sigHe[i] = sig * Math.exp(logGroundPops[i]); 
      }

      return sigHe;

   }; //end method opacHescat



/* Need molecular H_2 number density for this:
 *
      var opacH2scat = function(numDeps, temp, lambda, molPops){

var c = 2.9979249E+10; // light speed in vaccuum in cm/s
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var h = 6.62606957E-27; //Planck's constant in ergs sec
var logC = Math.log(c);
var logK = Math.log(k);
var logH = Math.log(h);

      var sigH2 = [];
      sigH2.length = numDeps;

//cross-section is zero below threshold, so initialize:
      for (var i = 0; i < numDeps; i++){
         sigH2[i] = 0.0;
      }

      var freq = c / lambda;  

//c******************************************************************************
//c  This routine computes H2 I Rayleigh scattering opacities.
//c******************************************************************************

//      include 'Atmos.com'
//      include 'Kappa.com'
//      include 'Linex.com'

      var wavetemp = 2.997925e18 / Math.min(freq, 2.463e15);
      var ww = Math.pow(wavetemp, 2);
      var sig = ( 8.14e-13 + (1.28d-6/ww) + (1.61/(ww*ww)) ) / (ww*ww);
      for (var i = 0; i < numDeps; i++){
       sigH2[i] = sig * Math.exp(molPops);
      }

      return sigH2;

      }; //end method opacH2scat
*/

