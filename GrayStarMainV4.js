/*
 * The openStar project: stellar atmospheres and spectra
 *
 * grayStar
 * V3.0, May 2015
 * JQuery version
 * 
 * C. Ian Short
 * Saint Mary's University
 * Department of Astronomy and Physics
 * Institute for Computational Astrophysics (ICA)
 * Halifax, NS, Canada
 *  * ian.short@smu.ca
 * www.ap.smu.ca/~ishort/
 * 
 * Open source pedagogical computational stellar astrophysics
 *
 * 1D, static, plane-parallel, LTE, multi-gray stellar atmospheric model
 * Voigt spectral line profile
 *
 * Suitable for pedagogical purposes only
 * 
 * Logic developed in Java SE 8.0, JDK 1.8
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
 * The MIT License (MIT)
 * Copyright (c) 2016 C. Ian Short 
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
*
 */


// **********************************************

"use strict"; //testing only!

// Global variables - Doesn't work - scope not global!

var c = 2.9979249E+10; // light speed in vaccuum in cm/s
var sigma = 5.670373E-5; //Stefan-Boltzmann constant ergs/s/cm^2/K^4  
var wien = 2.8977721E-1; // Wien's displacement law constant in cm K
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
var au = 1.4960e13; // 1 AU in cm

//Methods:
//Natural logs more useful than base 10 logs - Eg. Formal soln module: 
// Fundamental constants
var logC = Math.log(c);
var logSigma = Math.log(sigma);
var logWien = Math.log(wien);
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
var logAu = Math.log(au);
// ********************************************

//***************************  Main ******************************



function main() {



//**********************************************************




// Input control:



    // Get the checkbox values controlling what's plotted:
//JQuery test code:
//    $("#btnId").click(function() {
    //       alert("Value: " + $("#Teff").val());
    //       //alert("Value: ");
    //   });

    //var settingsId = document.getElementById("settingsId");

    //var settingsId = document.getElementsByTagName("form");
    //var atmosSettingsId = document.getElementById("atmosSettingsId");

    // Button for re-computing everything - if stellar parameters have changed
    var btnId = document.getElementById("btnId");
    btnId.onClick = function() {
    };
//
    //default initializations:

    var ifLineOnly = false;
    if ($("#lineOnly").is(":checked")) {
//console.log("localStorage checked");
        ifLineOnly = true; // checkbox 
    }

    if (typeof (Storage) === "undefined") {
        ifLineOnly = false;
        console.log("No Web Storage support.  Everything will take longer...");
        window.alert("No Web Storage support. Re-setting 'line only' mode OFF");
    }

    //console.log("ifLineOnly " + ifLineOnly);

    //console.log(" settingsId[0].name " + settingsId[0].name + " settingsId[0].value " + settingsId[0].value);
    //console.log(" atmosSettingsId[0].name " + atmosSettingsId[0].name + " atmosSettingsId[0].value " + atmosSettingsId[0].value);
//JQuery:  Independent of order of switches in HTML file?
// Stellar atmospheric parameters
    var numInputs = 20;
//Make settingsId object array by hand:
// setId() is an object constructor
    function setId(nameIn, valueIn) {
        this.name = nameIn;
        this.value = valueIn;
    }
    //
    // settingId will be an array of objects
    var settingsId = [];
    settingsId.length = numInputs;
    //
    //1st version of each is of JQuery-ui round sliders not available
    //var teff = 1.0 * $("#Teff").val(); // K
    //var teff = 1.0 * $("#Teff").roundSlider("getValue");
    //Sigh - IE needs it this way...
    var teffObj = $("#Teff").data("roundSlider");
    var teff = 1.0 * teffObj.getValue();
    //console.log("Teff read: " + teff);
    //var logg = 1.0 * $("#logg").val(); // log cgs
    //var logg = 1.0 * $("#logg").roundSlider("getValue");
    var loggObj = $("#logg").data("roundSlider");
    var logg = 1.0 * loggObj.getValue();
    //var kappaScale = 1.0 * $("#kappaScale").val(); // linear factor
    //var kappaScale = 1.0 * $("#kappaScale").roundSlider("getValue");
    var kappaScaleObj = $("#kappaScale").data("roundSlider");
    var logKappaScale = 1.0 * kappaScaleObj.getValue();
    //var massStar = 1.0 * $("#starMass").val(); // solar masses
    //var massStar = 1.0 * $("#starMass").roundSlider("getValue");
    var massStarObj = $("#starMass").data("roundSlider");
    var massStar = 1.0 * massStarObj.getValue();
// Planetary parameters for habitable zone calculation
    //var greenHouse = 1.0 * $("#GHTemp").val(); // Delta T_Surf boost K
    //var greenHouse = 1.0 * $("#GHTemp").roundSlider("getValue");
    var greenHouseObj = $("#GHTemp").data("roundSlider");
    var greenHouse = 1.0 * greenHouseObj.getValue();
    //var albedo = 1.0 * $("#Albedo").val(); //unitless reflectivity
    //var albedo = 1.0 * $("#Albedo").roundSlider("getValue");
    var albedoObj = $("#Albedo").data("roundSlider");
    var albedo = 1.0 * albedoObj.getValue();
// Representative spectral line and associated atomic parameters
    var lam0 = 1.0 * $("#lambda_0").val(); //nm
    var A12 = 1.0 * $("#A12").val(); // A_12 logarithmic abundance = log_10(N/H_H) = 12
    var logF = 1.0 * $("#logf").val(); // log(f) oscillaotr strength // saturated line
    var chiI1 = 1.0 * $("#chi_I1").val(); // ground state chi_I, eV
    var chiI2 = 1.0 * $("#chi_I2").val(); // ground state chi_I, eV
    var chiL = 1.0 * $("#chi_L").val(); // lower atomic E-level, eV
    var gw1 = 1.0 * $("#gw_1").val(); // ground state state. weight or partition fn (stage I) - unitless
    var gw2 = 1.0 * $("#gw_2").val(); // ground state state. weight or partition fn (stage II) - unitless
    var gwL = 1.0 * $("#gw_L").val(); // lower E-level state. weight - unitless

    var xiT = 1.0 * $("#xi_T").val(); // km/s
    var mass = 1.0 * $("#mass").val(); //amu, Carbon
    var logGammaCol = 1.0 * $("#gammaCol").val(); // log VanderWaals enhancement
    //
    var diskLambda = 1.0 * $("#diskLam").val(); //nm
    var diskSigma = 1.0 * $("#diskSigma").val(); //nm

//    
    settingsId[0] = new setId("<em>T</em><sub>eff</sub>", teff);
    settingsId[1] = new setId("log <em>g</em>", logg);
    settingsId[2] = new setId("<em>&#954</em>", logKappaScale);
    settingsId[3] = new setId("<em>M</em>", massStar);
    settingsId[4] = new setId("<span style='color:green'>GHEff</span>", greenHouse);
    settingsId[5] = new setId("<span style='color:green'><em>A</em></span>", albedo);
    settingsId[6] = new setId("<em>&#955</em><sub>0</sub>", lam0);
    settingsId[7] = new setId("<em>A</em><sub>12</sub>", A12);
    settingsId[8] = new setId("log <em>f</em>", logF);
    settingsId[9] = new setId("<em>&#967</em><sub>I</sub>", chiI1);
    settingsId[10] = new setId("<em>&#967</em><sub>II</sub>", chiI2);
    settingsId[11] = new setId("<em>&#967</em><sub>l</sub>", chiL);
    settingsId[12] = new setId("<em>g</em><sub>I</sub>", gw1);
    settingsId[13] = new setId("<em>g</em><sub>II</sub>", gw2);
    settingsId[14] = new setId("<em>g</em><sub>l</sub>", gwL);
    settingsId[15] = new setId("<em>&#958</em><sub>T</sub>", xiT);
    settingsId[16] = new setId("<em>m</em>", mass);
    settingsId[17] = new setId("<em>&#947</em><sub>Col</sub>", logGammaCol);
    settingsId[18] = new setId("Disk<em>&#955</em><sub>Col</sub>", diskLambda);
    settingsId[19] = new setId("&#963<sub>Filter</sub>", diskSigma);
    //
    var numPerfModes = 8;
    var switchPerf = "Fast"; //default initialization
    //JQuery:
    //Fast and Real modes are raio switches - mutuallye xclusive:
// Fast: (default)
    if ($("#fastmode").is(":checked")) {
        switchPerf = $("#fastmode").val(); // radio 
    }
//Real:
    if ($("#realmode").is(":checked")) {
        switchPerf = $("#realmode").val(); // radio 
    }
//User select:
    if ($("#usermode").is(":checked")) {
        switchPerf = $("#usermode").val(); // radio 
    }
    //console.log("switchPerf " + switchPerf);
//
//default initializations:
    var ifTcorr = false;
    var ifConvec = false;
    var ifVoigt = false;
    var ifScatt = false;
    //
    var ifShowAtmos = false;
    var ifShowRad = false;
    var ifShowLine = false;
    //
    var ifPrintNone = true;
    var ifPrintAtmos = false;
    var ifPrintSED = false;
    var ifPrintIntens = false;
    var ifPrintLDC = false;
    var ifPrintLine = false;
    //
    //

//
//Over-rides:

//
    if (switchPerf === "Fast") {
//console.log("False branch");
        ifTcorr = false;
        $("#tcorr").removeAttr("checked");
        ifConvec = false;
        $("#convec").removeAttr("checked");
        ifVoigt = false;
        $("#voigt").removeAttr("checked");
        ifScatt = false;
        $("#scatter").removeAttr("checked");
    }
    if (switchPerf === "Real") {
        //console.log("Real branch");
        ifTcorr = true;
        $("#tcorr").attr("checked", ":checked");
        ifConvec = false;
        ifVoigt = true;
        $("#voigt").attr("checked", ":checked");
        ifScatt = true;
        $("#scatter").attr("checked", ":checked");
    }
    if (switchPerf === "User") {
//console.log("User branch");
//
// Individual modules are checkboxes:
//TCorr:
        if ($("#tcorr").is(":checked")) {
//console.log("Tcorr checked");
            ifTcorr = true; // checkbox 
        }
//Convec:
        if ($("#convec").is(":checked")) {
//console.log("convec checked");
            ifConvec = true; // checkbox
        }
//Voigt:
        if ($("#voigt").is(":checked")) {
//console.log("voigt checked");
            ifVoigt = true; // checkbox
        }
//Line scattering:
        if ($("#scatter").is(":checked")) {
//console.log("voigt checked");
            ifScatt = true; // checkbox
        }
    }

    // Display options:
    if ($("#showAtmos").is(":checked")) {
        ifShowAtmos = true; // checkbox
    }
    if ($("#showRad").is(":checked")) {
        ifShowRad = true; // checkbox
    }
    if ($("#showLine").is(":checked")) {
        ifShowLine = true; // checkbox
    }

    //Detailed print-out options:
    if ($("#printNone").is(":checked")) {
        ifPrintNone = true; // checkbox
    }
    if ($("#printAtmos").is(":checked")) {
        ifPrintAtmos = true; // checkbox
    }
    if ($("#printSED").is(":checked")) {
        ifPrintSED = true; // checkbox
    }
    if ($("#printIntens").is(":checked")) {
        ifPrintIntens = true; // checkbox
    }
    if ($("#printLDC").is(":checked")) {
        ifPrintLDC = true; // checkbox
    }
    if ($("#printLine").is(":checked")) {
        ifPrintLine = true; // checkbox
    }

    //       
//


    var switchStar = "None";
    var numPreStars = 7;
    //JQuery:
    // None: (default)
    if ($("#none").is(":checked")) {
        switchStar = $("#none").val(); // radio 
    }

// Sun
    if ($("#sun").is(":checked")) {
        switchStar = $("#sun").val(); // radio 
    }
// Vega
    if ($("#vega").is(":checked")) {
        switchStar = $("#vega").val(); // radio 
    }
// Arcturus
    if ($("#arcturus").is(":checked")) {
        switchStar = $("#arcturus").val(); // radio 
    }

// Procyon
    if ($("#procyon").is(":checked")) {
        switchStar = $("#procyon").val(); // radio 
    }

// Regulus
    if ($("#regulus").is(":checked")) {
        switchStar = $("#regulus").val(); // radio 
    }

// 61 Cygni A
    if ($("#61cygnia").is(":checked")) {
        switchStar = $("#61cygnia").val(); // radio 
    }

// 51 Pegasi
    if ($("#51pegasi").is(":checked")) {
        switchStar = $("#51pegasi").val(); // radio 
    }


//JQuery:
    if (switchStar === "Sun") {
        var teff = 5780.0;
        settingsId[0].value = 5780.0;
        //First version is if there's no JQuery-UI round sliders
        //$("#Teff").val(5780.0);
        $("#Teff").roundSlider("setValue", "5780.0");
        var logg = 4.4;
        settingsId[1].value = 4.4;
        //$("#logg").val(4.4);
        $("#logg").roundSlider("setValue", "4.4");
        var logKappaScale = 0.0;
        settingsId[2].value = 0.0;
        //$("#kappaScale").val(0.0);
        $("#kappaScale").roundSlider("setValue", "0.0");
        var massStar = 1.0;
        settingsId[3].value = 1.0;
        //$("#starMass").val(1.0);
        $("#massStar").roundSlider("setValue", "1.0");
    }

    if (switchStar === "Arcturus") {
        var teff = 4250.0;
        settingsId[0].value = 4250.0;
        //$("#Teff").val(4250.0);
        $("#Teff").roundSlider("setValue", "4250.0");
        var logg = 2.0;
        settingsId[1].value = 2.0;
        //$("#logg").val(2.0);
        $("#logg").roundSlider("setValue", "2.0");
        var logKappaScale = -0.5;
        settingsId[2].value = -0.5;
        //$("#kappaScale").val(-0.5);
        $("#kappaScale").roundSlider("setValue", "-0.5");
        var massStar = 1.1;
        settingsId[3].value = 1.1;
        //$("#starMass").val(1.1);
        $("#massStar").roundSlider("setValue", "1.1");
    }

    if (switchStar === "Vega") {
        var teff = 9550.0;
        settingsId[0].value = 9550.0;
        //$("#Teff").val(9550.0);
        $("#Teff").roundSlider("setValue", "9550.0");
        var logg = 3.95;
        settingsId[1].value = 3.95;
        //$("#logg").val(3.95);
        $("#logg").roundSlider("setValue", "3.95");
        var logKappaScale = -0.5;
        settingsId[2].value = -0.5;
        //$("#kappaScale").val(-0.5);
        $("#kappaScale").roundSlider("setValue", "-0.5");
        var massStar = 2.1;
        settingsId[3].value = 2.1;
        //$("#starMass").val(2.1);
        $("#massStar").roundSlider("setValue", "2.1");
    }

    if (switchStar === "Regulus") {
        var teff = 12460.0;
        settingsId[0].value = 12460.0;
        //$("#Teff").val(12460.0);
        $("#Teff").roundSlider("setValue", "12460.0");
        var logg = 3.5;
        settingsId[1].value = 3.5;
        //$("#logg").val(3.54);
        $("#logg").roundSlider("setValue", "3.5");
        var logKappaScale = 0.0;
        settingsId[2].value = 0.0;
        //$("#kappaScale").val(0.0);
        $("#kappaScale").roundSlider("setValue", "0.0");
        var massStar = 3.8;
        settingsId[3].value = 3.8;
        //$("#starMass").val(3.8);
        $("#massStar").roundSlider("setValue", "3.8");
    }

    if (switchStar === "Procyon") {
        var teff = 6530.0;
        settingsId[0].value = 6530.0;
        //$("#Teff").val(6530.0);
        $("#Teff").roundSlider("setValue", "6530.0");
        var logg = 4.0;
        settingsId[1].value = 4.0;
        //$("#logg").val(4.0);
        $("#logg").roundSlider("setValue", "4.0");
        var logKappaScale = 0.0;
        settingsId[2].value = 0.0;
        //$("#kappaScale").val(0.0);
        $("#kappaScale").roundSlider("setValue", "0.0");
        var massStar = 1.4;
        settingsId[3].value = 1.4;
        //$("#starMass").val(1.4);
        $("#massStar").roundSlider("setValue", "1.4");
    }

    if (switchStar === "61CygniA") {
        var teff = 4525.0;
        settingsId[0].value = 4525.0;
        //$("#Teff").val(4526.0);
        $("#Teff").roundSlider("setValue", "4525.0");
        var logg = 4.2;
        settingsId[1].value = 4.2;
        //$("#logg").val(4.2);
        $("#logg").roundSlider("setValue", "4.2");
        var logKappaScale = 0.0;
        settingsId[2].value = 0.0;
        //$("#kappaScale").val(0.0);
        $("#kappaScale").roundSlider("setValue", "0.0");
        var massStar = 0.6;
        settingsId[3].value = 0.6;
        //$("#starMass").val(0.63);
        $("#massStar").roundSlider("setValue", "0.6");
    }

    if (switchStar === "51Pegasi") {
        var teff = 5570.0;
        settingsId[0].value = 5570.0;
        //$("#Teff").val(5570.0);
        $("#Teff").roundSlider("setValue", "5570.0");
        var logg = 4.3;
        settingsId[1].value = 4.3;
        //$("#logg").val(4.33);
        $("#logg").roundSlider("setValue", "4.3");
        var logKappaScale = 0.0;
        settingsId[2].value = 0.0;
        //$("#kappaScale").val(0.0);
        $("#kappaScale").roundSlider("setValue", "0.0");
        var massStar = 1.1;
        settingsId[3].value = 1.1;
        //$("#starMass").val(1.11);
        $("#massStar").roundSlider("setValue", "1.1");
    }

    var switchPlanet = "None";
    var numPrePlanets = 1;
    //JQuery:
    // None: (default)
    if ($("#noneplanet").is(":checked")) {
        switchPlanet = $("#noneplanet").val(); // radio 
    }

// Earth
    if ($("#earth").is(":checked")) {
        switchPlanet = $("#earth").val(); // radio 
    }

    if (switchPlanet === "Earth") {
        var GHTemp = 20.0;
        settingsId[4].value = 20.0;
        //$("#GHTemp").val(20.0);
        $("#GHTemp").roundSlider("setValue", "20.0");
        var Albedo = 0.3;
        settingsId[5].value = 0.3;
        //$("#Albedo").val(0.3);
        $("#Albedo").roundSlider("setValue", "0.3");
    }


    var switchLine = "None";
    var numPreLines = 10;
    //var numPreLines = 0;


    // None: (default)
//    if (settingsId[17].checked) {
//        switchLine = settingsId[17].value; // radio 
//    }
    //JQuery:
    if ($("#noneline").is(":checked")) {
        switchLine = $("#noneline").val(); // radio 
    }
// NaI D_1
    if ($("#NaID1").is(":checked")) {
        switchLine = $("#NaID1").val(); // radio        
    }
// NaI D_2
    if ($("#NaID2").is(":checked")) {
        switchLine = $("#NaID2").val(); // radio 
    }
// MgI b_1
    if ($("#MgIb1").is(":checked")) {
        switchLine = $("#MgIb1").val(); // radio 
    }
// CaII K
    if ($("#CaIIK").is(":checked")) {
        switchLine = $("#CaIIK").val(); // radio        
    }
// CaII H
    if ($("#CaIIH").is(":checked")) {
        switchLine = $("#CaIIH").val(); // radio        
    }
// CaI 4227
    if ($("#CaI4227").is(":checked")) {
        switchLine = $("#CaI4227").val(); // radio        
    }
// FeI 4271 
    if ($("#FeI4271").is(":checked")) {
        switchLine = $("#FeI4271").val(); // radio        
    }
// FeI 4045 
    if ($("#FeI4045").is(":checked")) {
        switchLine = $("#FeI4045").val(); // radio        
    }
// HeI 4471
    if ($("#HeI4471").is(":checked")) {
        switchLine = $("#HeI4471").val(); // radio        
    }
// HeI 4387
    if ($("#HeI4387").is(":checked")) {
        switchLine = $("#HeI4387").val(); // radio        
    }

//JQuery:
    if (switchLine === "NaID1") {
        var lam0 = 589.592;
        settingsId[6].value = 589.592;
        $("#lambda_0").val(589.592);
        var A12 = 6.3; // Grevesse & Sauval 98
        settingsId[7].value = 6.3;
        $("#A12").val(6.3);
        var logF = -0.495;
        settingsId[8].value = -0.495;
        $("#logf").val(-0.495);
        var chiI1 = 5.139;
        settingsId[9].value = 5.139;
        $("#chi_I1").val(5.139);
        var chiI2 = 47.286;
        settingsId[10].value = 47.286;
        $("#chi_I2").val(47.286);
        var chiL = 0.0;
        settingsId[11].value = 0.0;
        $("#chi_L").val(0.0);
        var gw1 = 2.0;
        settingsId[12].value = 2.0;
        $("#gw_1").val(2.0);
        var gw2 = 1.0;
        //ettingsId[13].value = 1.0;
        $("#gw_2").val(1.0);
        var gwL = 2.0;
        settingsId[14].value = 2.0;
        $("#gw_L").val(2.0);
        var mass = 22.990;
        settingsId[16].value = 22.990;
        $("#mass").val(22.990);
        var logGammaCol = 1.0;
        settingsId[17].value = 1.0;
        $("#gammaCol").val(1.0);
    }

    if (switchLine === "NaID2") {
        var lam0 = 588.995;
        settingsId[6].value = 588.995;
        $("#lambda_0").val(588.995);
        var A12 = 6.3; // Grevesse & Sauval 98
        settingsId[7].value = 6.3;
        $("#A12").val(6.3);
        var logF = -0.193;
        settingsId[8].value = -0.193;
        $("#logf").val(-0.193);
        var chiI1 = 5.139;
        settingsId[9].value = 5.139;
        $("#chi_I1").val(5.139);
        var chiI2 = 47.286;
        settingsId[10].value = 47.286;
        $("#chi_I2").val(47.286);
        var chiL = 0.0;
        settingsId[11].value = 0.0;
        $("#chi_L").val(0.0);
        var gw1 = 2.0;
        settingsId[12].value = 2.0;
        $("#gw_1").val(2.0);
        var gw2 = 1.0;
        settingsId[13].value = 1.0;
        $("#gw_2").val(1.0);
        var gwL = 2.0;
        settingsId[14].value = 2.0;
        $("#gw_L").val(2.0);
        var mass = 22.990;
        settingsId[16].value = 22.990;
        $("#mass").val(22.990);
        var logGammaCol = 1.0;
        settingsId[17].value = 1.0;
        $("#gammaCol").val(1.0);
    }

    if (switchLine === "MgIb1") {
        var lam0 = 518.360;
        settingsId[6].value = 518.360;
        $("#lambda_0").val(518.360);
        var A12 = 7.6; // Grevesse & Sauval 98
        settingsId[7].value = 7.6;
        $("#A12").val(7.6);
        var logF = -0.867;
        settingsId[8].value = -0.867;
        $("#logf").val(-0.867);
        var chiI1 = 7.646;
        settingsId[9].value = 7.646;
        $("#chi_I1").val(7.646);
        var chiI2 = 15.035;
        settingsId[10].value = 15.035;
        $("#chi_I2").val(15.035);
        var chiL = 2.717;
        settingsId[11].value = 2.717;
        $("#chi_L").val(2.717);
        var gw1 = 1.0;
        settingsId[12].value = 1.0;
        $("#gw_1").val(1.0);
        var gw2 = 1.0;
        settingsId[13].value = 1.0;
        $("#gw_2").val(1.0);
        var gwL = 5.0;
        settingsId[14].value = 5.0;
        $("#gw_L").val(5.0);
        var mass = 24.305;
        settingsId[16].value = 24.305;
        $("#mass").val(24.305);
        var logGammaCol = 1.0;
        settingsId[17].value = 1.0;
        $("#gammaCol").val(1.0);
    }

    if (switchLine === "CaIIK") {
        var lam0 = 393.366;
        settingsId[6].value = 393.366;
        $("#lambda_0").val(393.366);
        var A12 = 6.34; // Grevesse & Sauval 98
        settingsId[7].value = 6.34;
        $("#A12").val(6.34);
        var logF = -0.166;
        settingsId[8].value = -0.166;
        $("#logf").val(-0.166);
        var chiI1 = 6.113;
        settingsId[9].value = 6.113;
        $("#chi_I1").val(6.113);
        var chiI2 = 11.872;
        settingsId[10].value = 11.872;
        $("#chi_I2").val(11.872);
        //This is necessary for consistency with Stage II treatment of user-defined spectral line:
        var chiL = 0.01 + chiI1;
        settingsId[11].value = 0.01 + chiI1;
        $("#chi_L").val(0.01 + chiI1);
        var gw1 = 1.0;
        settingsId[12].value = 1.0;
        $("#gw_1").val(1.0);
        var gw2 = 2.0;
        settingsId[13].value = 2.0;
        $("#gw_2").val(2.0);
        var gwL = 2.0;
        settingsId[14].value = 2.0;
        $("#gw_L").val(2.0);
        var mass = 40.078;
        settingsId[16].value = 40.078;
        $("#mass").val(40.078);
        var logGammaCol = 0.5;
        settingsId[17].value = 0.5;
        $("#gammaCol").val(0.5);
    }

    if (switchLine === "CaIIH") {
        var lam0 = 396.847;
        settingsId[6].value = 396.847;
        $("#lambda_0").val(396.847);
        var A12 = 6.34; // Grevesse & Sauval 98
        settingsId[7].value = 6.34;
        $("#A12").val(6.34);
        var logF = -0.482;
        settingsId[8].value = -0.482;
        $("#logf").val(-0.482);
        var chiI1 = 6.113;
        settingsId[9].value = 6.113;
        $("#chi_I1").val(6.113);
        var chiI2 = 11.872;
        settingsId[10].value = 11.872;
        $("#chi_I2").val(11.872);
        //This is necessary for consistency with Stage II treatment of user-defined spectral line:
        var chiL = 0.01 + chiI1;
        settingsId[11].value = 0.01 + chiI1;
        $("#chi_L").val(0.01 + chiI1);
        var gw1 = 1.0;
        settingsId[12].value = 1.0;
        $("#gw_1").val(1.0);
        var gw2 = 2.0;
        settingsId[13].value = 2.0;
        $("#gw_2").val(2.0);
        var gwL = 2.0;
        settingsId[14].value = 2.0;
        $("#gw_L").val(2.0);
        var mass = 40.078;
        settingsId[16].value = 40.078;
        $("#mass").val(40.078);
        var logGammaCol = 0.5;
        settingsId[17].value = 0.5;
        $("#gammaCol").val(0.5);
    }

    if (switchLine === "CaI4227") {
        var lam0 = 422.673;
        settingsId[6].value = 422.673;
        $("#lambda_0").val(422.673);
        var A12 = 6.34; // Grevesse & Sauval 98
        settingsId[7].value = 6.34;
        $("#A12").val(6.34);
        var logF = 0.243;
        settingsId[8].value = 0.243;
        $("#logf").val(0.243);
        var chiI1 = 6.113;
        settingsId[9].value = 6.113;
        $("#chi_I1").val(6.113);
        var chiI2 = 11.872;
        settingsId[10].value = 11.872;
        $("#chi_I2").val(11.872);
        var chiL = 0.0;
        settingsId[11].value = 0.0;
        $("#chi_L").val(0.0);
        var gw1 = 1.0;
        settingsId[12].value = 1.0;
        $("#gw_1").val(1.0);
        var gw2 = 1.0;
        settingsId[13].value = 1.0;
        $("#gw_2").val(1.0);
        var gwL = 1.0;
        settingsId[14].value = 1.0;
        $("#gw_L").val(1.0);
        var mass = 40.078;
        settingsId[16].value = 40.078;
        $("#mass").val(40.078);
        var logGammaCol = 1.0;
        settingsId[17].value = 1.0;
        $("#gammaCol").val(1.0);
    }

    if (switchLine === "FeI4045") {
        var lam0 = 404.581;
        settingsId[6].value = 404.581;
        $("#lambda_0").val(404.581);
        var A12 = 7.50; // Grevesse & Sauval 98
        settingsId[7].value = 7.50;
        $("#A12").val(7.50);
        var logF = -0.674;
        settingsId[8].value = -0.674;
        $("#logf").val(-0.674);
        var chiI1 = 7.902;
        settingsId[9].value = 7.902;
        $("#chi_I1").val(7.902);
        var chiI2 = 16.199;
        settingsId[10].value = 16.199;
        $("#chi_I2").val(16.199);
        var chiL = 1.485;
        settingsId[11].value = 1.485;
        $("#chi_L").val(1.485);
        var gw1 = 1.0;
        settingsId[12].value = 1.0;
        $("#gw_1").val(1.0);
        var gw2 = 1.0;
        settingsId[13].value = 1.0;
        $("#gw_2").val(1.0);
        var gwL = 9.0;
        settingsId[14].value = 9.0;
        $("#gw_L").val(9.0);
        var mass = 55.845;
        settingsId[16].value = 55.845;
        $("#mass").val(55.845);
        var logGammaCol = 0.0;
        settingsId[17].value = 0.0;
        $("#gammaCol").val(0.0);
    }

    if (switchLine === "FeI4271") {
        var lam0 = 427.176;
        settingsId[6].value = 427.176;
        $("#lambda_0").val(427.176);
        var A12 = 7.50; // Grevesse & Sauval 98
        settingsId[7].value = 7.50;
        $("#A12").val(7.50);
        var logF = -1.118;
        settingsId[8].value = -1.118;
        $("#logf").val(-1.118);
        var chiI1 = 7.902;
        settingsId[9].value = 7.902;
        $("#chi_I1").val(7.902);
        var chiI2 = 16.199;
        settingsId[10].value = 16.199;
        $("#chi_I2").val(16.199);
        var chiL = 1.485;
        settingsId[11].value = 1.485;
        $("#chi_L").val(1.485);
        var gw1 = 1.0;
        //ettingsId[12].value = 1.0;
        $("#gw_1").val(1.0);
        var gw2 = 1.0;
        settingsId[13].value = 1.0;
        $("#gw_2").val(1.0);
        var gwL = 9.0;
        settingsId[14].value = 9.0;
        $("#gw_L").val(9.0);
        var mass = 55.845;
        settingsId[16].value = 55.845;
        $("#mass").val(55.845);
        var logGammaCol = 0.0;
        settingsId[17].value = 0.0;
        $("#gammaCol").val(0.0);
    }

    if (switchLine === "HeI4387") {
        var lam0 = 438.793;
        settingsId[6].value = 438.793;
        $("#lambda_0").val(438.793);
        var A12 = 10.93; // Grevesse & Sauval 98
        settingsId[7].value = 10.93;
        $("#A12").val(10.93);
        var logF = -1.364;
        settingsId[8].value = -1.364;
        $("#logf").val(-1.364);
        var chiI1 = 24.587;
        settingsId[9].value = 24.587;
        $("#chi_I1").val(24.587);
        var chiI2 = 54.418;
        settingsId[10].value = 54.418;
        $("#chi_I2").val(54.418);
        var chiL = 21.218;
        settingsId[11].value = 21.218;
        $("#chi_L").val(21.218);
        var gw1 = 1.0;
        settingsId[12].value = 1.0;
        $("#gw_1").val(1.0);
        var gw2 = 1.0;
        settingsId[13].value = 1.0;
        $("#gw_2").val(1.0);
        var gwL = 3.0;
        settingsId[14].value = 3.0;
        $("#gw_L").val(3.0);
        var mass = 4.003;
        settingsId[16].value = 4.003;
        $("#mass").val(4.003);
        var logGammaCol = 0.0;
        settingsId[17].value = 0.0;
        $("#gammaCol").val(0.0);
    }

    if (switchLine === "HeI4471") {
        var lam0 = 447.147;
        settingsId[6].value = 447.147;
        $("#lambda_0").val(447.147);
        var A12 = 10.93; // Grevesse & Sauval 98
        settingsId[7].value = 10.93;
        $("#A12").val(10.93);
        var logF = -0.986;
        settingsId[8].value = -0.986;
        $("#logf").val(-0.986);
        var chiI1 = 24.587;
        settingsId[9].value = 24.587;
        $("#chi_I1").val(24.587);
        var chiI2 = 54.418;
        settingsId[10].value = 54.418;
        $("#chi_I2").val(54.418);
        var chiL = 20.964;
        settingsId[11].value = 20.964;
        $("#chi_L").val(20.964);
        var gw1 = 1.0;
        settingsId[12].value = 1.0;
        $("#gw_1").val(1.0);
        var gw2 = 1.0;
        settingsId[13].value = 1.0;
        $("#gw_2").val(1.0);
        var gwL = 5.0;
        settingsId[14].value = 5.0;
        $("#gw_L").val(5.0);
        var mass = 4.003;
        settingsId[16].value = 4.003;
        $("#mass").val(4.003);
        var logGammaCol = 0.0;
        settingsId[17].value = 0.0;
        $("#gammaCol").val(0.0);
    }



    //
    // Form validation and Initial sanity checks:
    // 

// Stellar parameters:
//
    var flagArr = [];
    flagArr.length = numInputs;
    flagArr[0] = false;
    var minTeff = 500.0;
    var maxTeff = 50000.0;
    if (teff === null || teff == "") {
        alert("Teff must be filled out");
        return;
    }
    if (teff < minTeff) {
        flagArr[0] = true;
        teff = minTeff;
        var teffStr = String(minTeff);
        settingsId[0].value = minTeff;
        //first version is if there's no JQuery-UI
        //$("#Teff").val(minTeff);
        $("#Teff").roundSlider("setValue", minTeff);
    }
    if (teff > maxTeff) {
        flagArr[0] = true;
        teff = maxTeff;
        var teffStr = String(maxTeff);
        settingsId[0].value = maxTeff;
        //$("#Teff").val(maxTeff);
        $("#Teff").roundSlider("setValue", maxTeff);
    }
//logg limit is strongly Teff-dependent:
    if (logg === null || logg === "") {
        alert("log(g) must be filled out");
        return;
    }
    var minLogg = 3.0; //safe initialization
    var minLoggStr = "3.0";
    if (teff <= 4000.0) {
        minLogg = 0.0;
        minLoggStr = "0.0";
    } else if ((teff > 4000.0) && (teff <= 5000.0)) {
        minLogg = 1.0;
        minLoggStr = "1.0";
    } else if ((teff > 5000.0) && (teff <= 6000.0)) {
        minLogg = 1.5;
        minLoggStr = "1.5";
    } else if ((teff > 6000.0) && (teff <= 7000.0)) {
        minLogg = 2.0;
        minLoggStr = "2.0";
    } else if ((teff > 7000.0) && (teff < 9000.0)) {
        minLogg = 2.5;
        minLoggStr = "2.5";
    } else if (teff >= 9000.0) {
        minLogg = 3.0;
        minLoggStr = "3.0";
    }
    flagArr[1] = false;
    if (logg < minLogg) {
        flagArr[1] = true;
        logg = minLogg;
        var loggStr = minLoggStr;
        settingsId[1].value = minLogg;
        //$("#logg").val(minLogg);
        $("#logg").roundSlider("setValue", minLogg);
    }
    if (logg > 7.0) {
        flagArr[1] = true;
        logg = 7.0;
        var loggStr = "7.0";
        settingsId[1].value = 7.0;
        //$("#logg").val(5.5);
        $("#logg").roundSlider("setValue", 7.0);
    }
    if (logKappaScale === null || logKappaScale === "") {
        alert("logKappaScale must be filled out");
        return;
    }
    flagArr[2] = false;
    if (logKappaScale < -3.0) {
        flagArr[2] = true;
        logKappaScale = -3.0;
        var logKappaStr = "-3.0";
        settingsId[2].value = -3.0;
        //$("#kappaScale").val(-2.0);
        $("#kappaScale").roundSlider("setValue", -3.0);
    }
    if (logKappaScale > 1.0) {
        flagArr[2] = true;
        logKappaScale = 1.0;
        var kappaStr = "1.0";
        settingsId[2].value = 1.0;
        //$("#kappaScale").val(0.5);
        $("#kappaScale").roundSlider("setValue", 1.0);
    }
    if (massStar === null || massStar == "") {
        alert("mass must be filled out");
        return;
    }
    flagArr[3] = false;
    if (massStar < 0.1) {
        flagArr[3] = true;
        massStar = 0.1;
        var massStarStr = "0.1";
        settingsId[3].value = 0.1;
        //$("#starMass").val(0.1);
        $("#starMass").roundSlider("setValue", 0.1);
    }
    if (massStar > 20.0) {
        flagArr[3] = true;
        massStar = 20.0;
        var massStarStr = "20.0";
        settingsId[3].value = 20.0;
        //$("#starMass").val(8.0);
        $("#starMass").roundSlider("setValue", 20.0);
    }

    var grav = Math.pow(10.0, logg);
    var kappaScale = Math.pow(10.0, logKappaScale);
    //console.log("logKappaScale " + logKappaScale + " kappaScale " + kappaScale);
    //

    // Planetary parameters for habitable zone calculation:
    //
    if (greenHouse === null || greenHouse === "") {
        alert("greenHouse must be filled out");
        return;
    }
    flagArr[4] = false;
    if (greenHouse < 0.0) {
        flagArr[4] = true;
        greenHouse = 0.0;
        var greenHouseStr = "0.0";
        settingsId[4].value = 0.0;
        //$("#GHTemp").val(0.0);
        $("#GHTemp").roundSlider("setValue", 0.0);
    }
    if (greenHouse > 200.0) {
        flagArr[4] = true;
        greenHouse = 200.0;
        var greenHouseStr = "200.0";
        settingsId[4].value = 200.0;
        //$("#GHTemp").val(200.0);
        $("#GHTemp").roundSlider("setValue", 200.0);
    }
    if (albedo === null || albedo === "") {
        alert("albedo must be filled out");
        return;
    }
    flagArr[5] = false;
    if (albedo < 0.0) {
        flagArr[5] = true;
        albedo = 0.0;
        var albedoStr = "0.0";
        settingsId[5].value = 0.0;
        //$("#Albedo").val(0.0);
        $("#Albedo").roundSlider("setValue", 0.0);
    }
    if (albedo > 1.0) {
        flagArr[5] = true;
        greenHouse = 1.0;
        var albedoStr = "1.0";
        settingsId[5].value = 1.0;
        //$("#Albedo").val(1.0);
        $("#Albedo").roundSlider("setValue", 1.0);
    }


// Representative spectral line and associated atomic parameters
//
    if (lam0 === null || lam0 == "") {
        alert("lam0 must be filled out");
        return;
    }
    flagArr[6] = false;
    if (lam0 < 350.0) {
        flagArr[6] = true;
        lam0 = 350.0;
        var lamStr = "350";
        settingsId[6].value = 350.0;
        $("#lambda_0").val(350.0);
    }
    if (lam0 > 1000.0) {
        flagArr[6] = true;
        lam0 = 1000.0;
        var lamStr = "10000";
        settingsId[6].value = 1000.0;
        $("#lambda_0").val(1000.0);
    }
    if (A12 === null || A12 == "") {
        alert("A12 must be filled out");
        return;
    }
    flagArr[7] = false;
    if (A12 < 2.0) {
        flagArr[7] = true;
        A12 = 2.0;
        var nStr = "2.0";
        settingsId[7].value = 2.0;
        $("#A12").val(2.0);
    }
    //Upper limit set high to accomodate Helium!:
    if (A12 > 11.0) {
        flagArr[7] = true;
        A12 = 11.0;
        var nStr = "11.0";
        settingsId[7].value = 11.0;
        $("#A12").val(11.0);
    }
    if (logF === null || logF === "") {
        alert("logF must be filled out");
        return;
    }
    flagArr[8] = false;
    if (logF < -6.0) {
        flagArr[8] = true;
        logF = -6.0;
        var fStr = "-6.0";
        settingsId[8].value = -6.0;
        $("#logf").val(-6.0);
    }
    if (logF > 1.0) {
        flagArr[8] = true;
        logF = 1.0;
        var fStr = "1.0";
        settingsId[8].value = 1.0;
        $("#logf").val(1.0);
    }
    if (chiI1 === null || chiI1 == "") {
        alert("chiI1 must be filled out");
        return;
    }
    if (chiI2 === null || chiI2 == "") {
        alert("chiI2 must be filled out");
        return;
    }
    if (chiL === null || chiL === "") {
        alert("chiL must be filled out");
        return;
    }
    flagArr[9] = false;
    if (chiI1 < 5.0) {
        flagArr[9] = true;
        chiI1 = 5.0;
        var ionStr = "5.0";
        settingsId[9].value = 5.0;
        $("#chi_I1").val(5.0);
    }
    if (chiI1 > 25.0) {
        flagArr[9] = true;
        chiI1 = 25.0;
        var ionStr = "25.0";
        settingsId[9].value = 25.0;
        $("#chi_I1").val(25.0);
    }

    flagArr[10] = false;
    if (chiI2 < 5.0) {
        flagArr[10] = true;
        chiI2 = 5.0;
        var ionStr = "5.0";
        settingsId[10].value = 5.0;
        $("#chi_I2").val(5.0);
    }
    if (chiI2 > 55.0) {
        flagArr[10] = true;
        chiI2 = 55.0;
        var ionStr = "55.0";
        settingsId[10].value = 55.0;
        $("#chi_I2").val(55.0);
    }

    var ionized = false;
    // Note: Upper limit of chiL depends on value of chiI1 above!
    flagArr[11] = false;
    if (chiL < 0.0) {
        flagArr[11] = true;
        chiL = 0.0; // Ground state case!
        var excStr = "0.0";
        settingsId[11].value = 0.0;
        $("#chi_L").val(0.0);
    }
// choice of neutral or singly ionized stage
    if (chiL < chiI1) {
        var ionized = false;
    }
    if (chiL === chiI1) {

        flagArr[11] = true;
        ionized = false;
        chiL = 0.9 * chiI1;
        var excStr = ionStr;
        settingsId[11].value = chiL;
        $("#chi_L").val(chiL);
    }
    if (chiL > chiI1) {
        ionized = true;
        // chiL = chiL - chiI1;  // No!  Not here!
        if (chiL > chiI1 + 50.0) {
            flagArr[11] = true;
            chiL = chiI1 + 50.0;
            var excStr = " " + chiL;
            settingsId[11].value = chiL;
            $("#chi_L").val(chiL);
        }
    }
    if (gw1 === null || gw1 == "") {
        alert("gw1 must be filled out");
        return;
    }
    if (gw2 === null || gw2 == "") {
        alert("gw2 must be filled out");
        return;
    }
    if (gwL === null || gwL == "") {
        alert("gwL must be filled out");
        return;
    }
    flagArr[12] = false;
    if (gw1 < 1.0) {
        flagArr[12] = true;
        gw1 = 1.0;
        var ionStr = "1";
        settingsId[12].value = 1.0;
        $("#gw_1").val(1.0);
    }
    if (gw1 > 100.0) {
        flagArr[12] = true;
        gw1 = 100.0;
        var ionStr = "100";
        settingsId[12].value = 100.0;
        $("#gw_1").val(100.0);
    }

    flagArr[13] = false;
    if (gw2 < 1.0) {
        flagArr[13] = true;
        gw2 = 1.0;
        var ionStr = "1";
        settingsId[13].value = 1.0;
        $("#gw_2").val(1.0);
    }
    if (gw2 > 100.0) {
        flagArr[13] = true;
        gw2 = 100.0;
        var ionStr = "100";
        settingsId[13].value = 100.0;
        $("#gw_2").val(100.0);
    }

    flagArr[14] = false;
    if (gwL < 1.0) {
        flagArr[14] = true;
        gwL = 1.0;
        var ionStr = "1";
        settingsId[14].value = 1.0;
        $("#gw_L").val(1.0);
    }
    if (gwL > 100.0) {
        flagArr[14] = true;
        gwL = 100.0;
        var ionStr = "100";
        settingsId[14].value = 100.0;
        $("#gw_L").val(100.0);
    }
    if (xiT === null || xiT == "") {
        alert("xiT must be filled out");
        return;
    }
    flagArr[15] = false;
    if (xiT < 0.0) {
        flagArr[15] = true;
        xiT = 0.0;
        var xitStr = "0.0";
        settingsId[15].value = 0.0;
        $("#xi_T").val(0.0);
    }
    if (xiT > 4.0) {
        flagArr[15] = true;
        xiT = 4.0;
        var xitStr = "4.0";
        settingsId[15].value = 4.0;
        $("#xi_T").val(4.0);
    }
    if (mass === null || mass == "") {
        alert("mass must be filled out");
        return;
    }
    flagArr[16] = false;
    if (mass < 1.0) {
        flagArr[16] = true;
        mass = 1.0;
        var massStr = "1.0";
        settingsId[16].value = 1.0;
        $("#mass").val(1.0);
    }
    if (mass > 60.0) {
        flagArr[16] = true;
        mass = 60.0;
        var massStr = "60";
        settingsId[16].value = 60.0;
        $("#mass").val(60.0);
    }
    if (logGammaCol === null || logGammaCol === "") {
        alert("logGammaCol must be filled out");
        return;
    }
    flagArr[17] = false;
    if (logGammaCol < 0.0) {
        flagArr[17] = true;
        logGammaCol = 0.0;
        var gamStr = "0.0";
        settingsId[17].value = 0.0;
        $("#gammaCol").val(0.0);
    }
    if (logGammaCol > 1.0) {
        flagArr[17] = true;
        logGammaCol = 1.0;
        var gamStr = "1.0";
        settingsId[17].value = 1.0;
        $("#gammaCol").val(1.0);
    }



//var ionized = false; // DEBUG


// This has to be up here for some reason:
// Get the ID of the container div:



    var textId = document.getElementById("outPanel"); // text output area

    //var masterId = document.getElementById("container"); // graphical output area
    var plotOneId = document.getElementById("plotOne");
    var cnvsOneId = document.getElementById("plotOneCnvs");
    var cnvsOneCtx = cnvsOneId.getContext("2d"); 
    var plotTwoId = document.getElementById("plotTwo");
    var cnvsTwoId = document.getElementById("plotTwoCnvs");
    var cnvsTwoCtx = cnvsTwoId.getContext("2d"); 
    var plotThreeId = document.getElementById("plotThree");
    var cnvsThreeId = document.getElementById("plotThreeCnvs");
    var cnvsThreeCtx = cnvsThreeId.getContext("2d"); 
    var plotFourId = document.getElementById("plotFour");
    var cnvsFourId = document.getElementById("plotFourCnvs");
    var cnvsFourCtx = cnvsFourId.getContext("2d"); 
    var plotFiveId = document.getElementById("plotFive");
    var cnvsFiveId = document.getElementById("plotFiveCnvs");
    var cnvsFiveCtx = cnvsFiveId.getContext("2d"); 
    var plotSixId = document.getElementById("plotSix");
    var cnvsSixId = document.getElementById("plotSixCnvs");
    var cnvsSixCtx = cnvsSixId.getContext("2d"); 
    var plotSevenId = document.getElementById("plotSeven");
    var cnvsSevenId = document.getElementById("plotSevenCnvs");
    var cnvsSevenCtx = cnvsSevenId.getContext("2d"); 
    var plotEightId = document.getElementById("plotEight");
    var cnvsEightId = document.getElementById("plotEightCnvs");
    var cnvsEightCtx = cnvsEightId.getContext("2d"); 
    var plotNineId = document.getElementById("plotNine");
    var cnvsNineId = document.getElementById("plotNineCnvs");
    var cnvsNineCtx = cnvsNineId.getContext("2d"); 
    var plotTenId = document.getElementById("plotTen");
    var cnvsTenId = document.getElementById("plotTenCnvs");
    var cnvsTenCtx = cnvsTenId.getContext("2d"); 
    var plotElevenId = document.getElementById("plotEleven");
    var cnvsElevenId = document.getElementById("plotElevenCnvs");
    var cnvsElevenCtx = cnvsElevenId.getContext("2d"); 
    var plotTwelveId = document.getElementById("plotTwelve");
    var cnvsTwelveId = document.getElementById("plotTwelveCnvs");
    var cnvsTwelveCtx = cnvsTwelveId.getContext("2d"); 
    var printModelId = document.getElementById("printModel"); //detailed model print-out area


    if (ifShowAtmos === true) {
        plotOneId.style.display = "block";
        plotTwoId.style.display = "block";
        plotThreeId.style.display = "block";
    }

    if (ifShowRad === true) {
        plotFourId.style.display = "block";
        plotFiveId.style.display = "block";
    }
    if (ifShowLine === true) {
        plotSixId.style.display = "block";
        plotEightId.style.display = "block";
    }

    if (ifShowAtmos === false) {
        plotOneId.style.display = "none";
        plotTwoId.style.display = "none";
//        plotThreeId.style.display = "none";
    }

    if (ifShowRad === false) {
        plotFourId.style.display = "none";
        plotFiveId.style.display = "none";
    }
    if (ifShowLine === false) {
        plotSixId.style.display = "none";
        plotEightId.style.display = "none";
    }
    if ((ifPrintAtmos === true) ||
            (ifPrintSED === true) ||
            (ifPrintIntens === true) ||
            (ifPrintLDC === true) ||
            (ifPrintLine === true)) {
        printModelId.style.display = "block";
    } else if (ifPrintNone === true) {
        printModelId.style.display = "none";
    }

    //printModelId.style.display = "block"; //for testing

    // Begin compute code:


    //Gray structure and Voigt line code code begins here:
    // Initial set-up:

    // optical depth grid
    var numDeps = 48;
    var log10MinDepth = -6.0;
    var log10MaxDepth = 2.0;
    //var numThetas = 10; // Guess

    var numLams = 250;
    //var numLams = 100;
    var lamUV = 300.0;
    var lamIR = 1000.0;
    var lamSetup = [lamUV * 1.0e-7, lamIR * 1.0e-7, numLams]; //Start, end wavelength (nm), number of lambdas
    lam0 = lam0 * 1.0e-7; // line centre lambda from nm to cm
    if (diskLambda === null || diskLambda == "") {
        alert("disk wavelength must be filled out");
        return;
    }
    flagArr[18] = false;
    if (diskLambda < lamUV) {
        flagArr[18] = true;
        diskLambda = lamUV;
        var diskLambdaStr = lamUV.toString(10);
        settingsId[18].value = lamUV;
        $("#diskLam").val(lamUV);
    }
    if (diskLambda > lamIR) {
        flagArr[18] = true;
        diskLambda = lamIR;
        var diskLambdaStr = lamIR.toString(10);
        settingsId[18].value = lamIR;
        $("#diskLam").val(lamIR);
    }

    if (diskSigma === null || diskSigma == "") {
        alert("filter sigma must be filled out");
        return;
    }
    flagArr[19] = false;
    if (diskSigma < 0.01) {
        flagArr[19] = true;
        diskSigma = 0.01;
        var diskSigmaStr = "0.01";
        settingsId[19].value = 0.01;
        $("#diskSigma").val(0.01);
    }
    if (diskSigma > 10.0) {
        flagArr[19] = true;
        diskSigma = 10.0;
        var diskSigmaStr = "10";
        settingsId[19].value = 10.0;
        $("#diskSigma").val(10.0);
    }


    // Solar parameters:
    var teffSun = 5778.0;
    var loggSun = 4.44;
    var gravSun = Math.pow(10.0, loggSun);
    var logKappaScaleSun = 0.0;
    var kappaScaleSun = Math.exp(logKappaScaleSun);
    //Solar units:
    var massSun = 1.0;
    var radiusSun = 1.0;
    var logRadius = 0.5 * (Math.log(massStar) + Math.log(gravSun) - Math.log(grav));
    var radius = Math.exp(logRadius);
    //var radius = Math.sqrt(massStar * gravSun / grav); // solar radii
    var logLum = 2.0 * Math.log(radius) + 4.0 * Math.log(teff / teffSun);
    var bolLum = Math.exp(logLum); // L_Bol in solar luminosities 

    //Composition by mass fraction - needed for opacity approximations
    //   and interior structure
    var massX = 0.70; //Hydrogen
    var massY = 0.28; //Helium
    var massZSun = 0.02; // "metals"
    var massZ = massZSun * kappaScale; //approximation

    var logNH = 17.0;
    var logN = (A12 - 12.0) + logNH;
    var logE = logTen(Math.E); // for debug output

    //Vega parameters (of Phoenix model- Teff not quite right!)
    var teffVega = 9950.0;
    var loggVega = 3.95;
    var gravVega = Math.pow(10.0, loggVega);
    var kappaScaleVega = 0.333;

// Is this the first computation *at all* in the current Web session??
// We only need to compute the Sun's structure once - ever
    //var isSunFirst = true; //initialization

    //Store basic stellar parameters that control atmospheric structure:


    //log_10 Rosseland optical depth scale  
    //Java: double tauRos[][] = TauScale.tauScale(numDeps);
    //var logTauRos = TauScale(numDeps);
    var tauRos = tauScale(numDeps, log10MinDepth, log10MaxDepth);
    //for (var iD = 0; iD < numDeps; iD++) {
    //    console.log(" iD " + iD + " tauRos[0][iD] " + tauRos[0][iD]);
    //}

    //Now do the same for the Sun, for reference:

// initializations:
    var mmwSun = [];
    mmwSun.length = numDeps;
    var tempSun = [];
    tempSun.length = 2;
    tempSun[0] = [];
    tempSun[1] = [];
    tempSun[0].length = numDeps;
    tempSun[1].length = numDeps;
    var kappaSun = [];
    kappaSun.length = 2;
    kappaSun[0] = [];
    kappaSun[1] = [];
    kappaSun[0].length = numDeps;
    kappaSun[1].length = numDeps;
    var pressSun = [];
    pressSun.length = 4;
    pressSun[0] = [];
    pressSun[1] = [];
    pressSun[2] = [];
    pressSun[3] = [];
    pressSun[0].length = numDeps;
    pressSun[1].length = numDeps;
    pressSun[2].length = numDeps;
    pressSun[3].length = numDeps;
    var rhoSun = [];
    rhoSun.length = 2;
    rhoSun[0] = [];
    rhoSun[1] = [];
    rhoSun[0].length = numDeps;
    rhoSun[1].length = numDeps;
    var NeSun = [];
    NeSun.length = 2;
    NeSun[0] = [];
    NeSun[1] = [];
    NeSun[0].length = numDeps;
    NeSun[1].length = numDeps;
    //
    var mmwVega = [];
    mmwVega.length = numDeps;
    var tempVega = [];
    tempVega.length = 2;
    tempVega[0] = [];
    tempVega[1] = [];
    tempVega[0].length = numDeps;
    tempVega[1].length = numDeps;
    var kappaVega = [];
    kappaVega.length = 2;
    kappaVega[0] = [];
    kappaVega[1] = [];
    kappaVega[0].length = numDeps;
    kappaVega[1].length = numDeps;
    //var pGasVega = [];
    //pGasVega.length = 2;
    // pGasVega[0] = [];
    // pGasVega[1] = [];
    // pGasVega[0].length = numDeps;
    // pGasVega[1].length = numDeps;
    var pressVega = [];
    pressVega.length = 4;
    pressVega[0] = [];
    pressVega[1] = [];
    pressVega[2] = [];
    pressVega[3] = [];
    pressVega[0].length = numDeps;
    pressVega[1].length = numDeps;
    pressVega[2].length = numDeps;
    pressVega[3].length = numDeps;
    var rhoVega = [];
    rhoVega.length = 2;
    rhoVega[0] = [];
    rhoVega[1] = [];
    rhoVega[0].length = numDeps;
    rhoVega[1].length = numDeps;
    var NeVega = [];
    NeVega.length = 2;
    NeVega[0] = [];
    NeVega[1] = [];
    NeVega[0].length = numDeps;
    NeVega[1].length = numDeps;

    if (ifLineOnly === true) {

        var teff = Number(sessionStorage.getItem("teff"));
        settingsId[0].value = Number(sessionStorage.getItem("teff"));
        $("#Teff").val(Number(sessionStorage.getItem("teff")));
        var logg = Number(sessionStorage.getItem("logg"));
        settingsId[1].value = Number(sessionStorage.getItem("logg"));
        $("#logg").val(Number(sessionStorage.getItem("logg")));
        var kappaScale = Number(sessionStorage.getItem("kappaScale"));
        settingsId[2].value = Number(sessionStorage.getItem("kappaScale"));
        $("#kappaScale").val(Number(sessionStorage.getItem("kappaScale")));
        var massStar = Number(sessionStorage.getItem("starMass"));
        settingsId[3].value = Number(sessionStorage.getItem("starMass"));
        $("#starMass").val(Number(sessionStorage.getItem("starMass")));
        //console.log("ifLineOnly mode - solar structure, ifLineOnly: " + ifLineOnly);

        //We've already stored the solar structure - just retrieve logarithmic quantities
        // and reconstruct linear quantities

        for (var i = 0; i < numDeps; i++) {
            //console.log(keyTemp[i]);
            storeName = "tempSun" + String(i);
            tempSun[1][i] = Number(sessionStorage.getItem(storeName));
            tempSun[0][i] = Math.exp(tempSun[1][i]);
            storeName = "kappSun" + String(i);
            kappaSun[1][i] = Number(sessionStorage.getItem(storeName));
            kappaSun[0][i] = Math.exp(kappaSun[1][i]);
            storeName = "pressSun" + String(i);
            pressSun[1][i] = Number(sessionStorage.getItem(storeName));
            pressSun[0][i] = Math.exp(pressSun[1][i]);
            pressSun[2][i] = 0.0; // Don't need Sun's radiation pressure??
            pressSun[3][i] = -99.0; // Don't need Sun's radiation pressure??             
            storeName = "rhoSun" + String(i);
            rhoSun[1][i] = Number(sessionStorage.getItem(storeName));
            rhoSun[0][i] = Math.exp(rhoSun[1][i]);
            storeName = "mmwSun" + String(i);
            mmwSun[i] = Number(sessionStorage.getItem(storeName));
            storeName = "NeSun" + String(i);
            NeSun[1][i] = Number(sessionStorage.getItem(storeName));
            NeSun[0][i] = Math.exp(NeSun[1][i]);
        }

        for (var i = 0; i < numDeps; i++) {
            //console.log(keyTemp[i]);
            storeName = "tempVega" + String(i);
            tempVega[1][i] = Number(sessionStorage.getItem(storeName));
            tempVega[0][i] = Math.exp(tempVega[1][i]);
            storeName = "kappVega" + String(i);
            kappaVega[1][i] = Number(sessionStorage.getItem(storeName));
            kappaVega[0][i] = Math.exp(kappaVega[1][i]);
            storeName = "pressVega" + String(i);
            pressVega[1][i] = Number(sessionStorage.getItem(storeName));
            pressVega[0][i] = Math.exp(pressVega[1][i]);
            pressVega[2][i] = 0.0; // Don't need Sun's radiation pressure??
            pressVega[3][i] = -99.0; // Don't need Sun's radiation pressure??             
            storeName = "rhoVega" + String(i);
            rhoVega[1][i] = Number(sessionStorage.getItem(storeName));
            rhoVega[0][i] = Math.exp(rhoVega[1][i]);
            storeName = "mmwVega" + String(i);
            mmwVega[i] = Number(sessionStorage.getItem(storeName));
            storeName = "NeVega" + String(i);
            NeVega[1][i] = Number(sessionStorage.getItem(storeName));
            NeVega[0][i] = Math.exp(NeVega[1][i]);
        }

    } else {

        //console.log("normal mode - solar structure, ifLineOnly: " + ifLineOnly);
        var k = 1.3806488E-16; // Boltzmann constant in ergs/K
        var logK = Math.log(k);
        //console.log("teffSun " + teffSun);
        //Gray solution
        //tempSun = temperature(numDeps, teffSun, tauRos);
        //Rescaled  kinetic temeprature structure: 
        var tempSun = phxSunTemp(teffSun, numDeps, tauRos);
        //
        // BEGIN Initial guess for Sun section:
        //Now do the same for the Sun, for reference:
        var pGasSun = phxSunPGas(gravSun, numDeps, tauRos);
        var NeSun = phxSunNe(gravSun, numDeps, tauRos, tempSun, kappaScaleSun);
        var kappaSun = phxSunKappa(numDeps, tauRos, kappaScaleSun);
        //Get H I n=2 & n=3 number densities for Balmer and Pashen continuum  for kappa calculation
        // Paschen:
        var ionizedHI = false;
        var chiI1H = 13.6; //eV
        var chiI2H = 1.0e6; //eV //H has no third ionization stage!
        var gw1H = 2.0;
        var gw2H = 1.0; // umm... doesn't exist - no "HIII"
        // n=3 level - Paschen jump
        var lamJump3 = 820.4 * 1.0e-7; //Paschen jump - cm
        var chiLH3 = 12.1; //eV
        var gwLH3 = 2 * 3 * 3; // 2n^2
        var logNumsH3 = [];
        logNumsH3.length = 4;
        logNumsH3[0] = [];
        logNumsH3[1] = [];
        logNumsH3[2] = [];
        logNumsH3[3] = [];
        logNumsH3[0].length = numDeps;
        logNumsH3[1].length = numDeps;
        logNumsH3[2].length = numDeps;
        logNumsH3[3].length = numDeps;
        // n=2 level - Balmer jump
        var lamJump2 = 364.0 * 1.0e-7; //Paschen jump - cm
        var chiLH2 = 10.2; //eV
        var gwLH2 = 2 * 2 * 2; // 2n^2   
        var logNumsH2 = [];
        logNumsH2.length = 4;
        logNumsH2[0] = [];
        logNumsH2[1] = [];
        logNumsH2[2] = [];
        logNumsH2[3] = [];
        logNumsH2[0].length = numDeps;
        logNumsH2[1].length = numDeps;
        logNumsH2[2].length = numDeps;
        logNumsH2[3].length = numDeps;
        var mode;
        mode = 1; //call kappas *with* knowledge of who 
        //console.log("numDeps " + numDeps + " kappaScaleSun " + kappaScaleSun);
        mmwSun = mmwFn(numDeps, tempSun, kappaScaleSun);
        //Now do same for Sun:
        var rhoSun = massDensity(numDeps, tempSun, pGasSun, mmwSun, kappaScaleSun);
        //logNumsH3 = levelPops(lamJump3, logNH, NeSun, ionizedHI, chiI1H, chiI2H, chiLH3, gw1H, gw2H, gwLH3,
        //        numDeps, kappaScale, tauRos, tempSun, rhoSun);
        //logNumsH2 = levelPops(lamJump2, logNH, NeSun, ionizedHI, chiI1H, chiI2H, chiLH2, gw1H, gw2H, gwLH2,
        //        numDeps, kappaScale, tauRos, tempSun, rhoSun);
        //kappaSun = kappas(mode, numDeps, rhoSun, rhoSun, kappaSun, kappaScaleSun, loggSun, loggSun, teffSun, teffSun, radiusSun, massX, massZSun, tauRos, tempSun, tempSun, logNumsH3, logNumsH2);
//               function(mode, numDeps, rho,     rhoSun,  kappaRosSun, kappaScale,    logg,    loggSun, teff,    teffSun, radius,    massX, massZ,    tauRos, temp,    tempSun)
        pressSun = hydrostatic(numDeps, gravSun, tauRos, kappaSun, tempSun);
        //rhoSun = massDensity(numDeps, tempSun, pressSun, mmwSun, kappaScaleSun);
        //for (var i = 0; i < numDeps; i++) {
        //console.log(" i " + i + " tauRos[1][i] " + logE*tauRos[1][i] + " mmwSun[i] " + mmwSun[i] + " tempSun[0][i] " + tempSun[0][i] + " pressSun[1][i] " + logE*pressSun[1][i] + " kappaSun[1][i] " + logE*kappaSun[1][i] + " rhoSun[1][i] " + logE*rhoSun[1][i]);
        //}
        //Rescaled  kinetic temeprature structure: 
        var tempVega = phxVegaTemp(teffVega, numDeps, tauRos);
        //
        // BEGIN Initial guess for Sun section:
        //Now do the same for the Sun, for reference:
        var pGasVega = phxVegaPGas(gravVega, numDeps, tauRos);
        var NeVega = phxVegaNe(gravVega, numDeps, tauRos, tempVega, kappaScaleVega);
        var kappaVega = phxVegaKappa(numDeps, tauRos, kappaScaleVega);
        mode = 1; //call kappas *with* knowledge of who 
        //console.log("numDeps " + numDeps + " kappaScaleSun " + kappaScaleSun);
        mmwVega = mmwFn(numDeps, tempVega, kappaScaleVega);
        //Now do same for Sun:
        var rhoVega = massDensity(numDeps, tempVega, pGasVega, mmwVega, kappaScaleVega);

        pressVega = hydrostatic(numDeps, gravVega, tauRos, kappaVega, tempVega);
        //
    } //end solar structure ifLineOnly




//Stellar structure:
//
// initializations:
    var mmw = [];
    mmw.length = numDeps;
    var temp = [];
    temp.length = 2;
    temp[0] = [];
    temp[1] = [];
    temp[0].length = numDeps;
    temp[1].length = numDeps;
    var kappa = [];
    kappa.length = 2;
    kappa[0] = [];
    kappa[1] = [];
    kappa[0].length = numDeps;
    kappa[1].length = numDeps;
    var press = [];
    press.length = 4;
    press[0] = [];
    press[1] = [];
    press[2] = [];
    press[3] = [];
    press[0].length = numDeps;
    press[1].length = numDeps;
    press[2].length = numDeps;
    press[3].length = numDeps;
    var rho = [];
    rho.length = 2;
    rho[0] = [];
    rho[1] = [];
    rho[0].length = numDeps;
    rho[1].length = numDeps;
    var Ne = [];
    Ne.length = 2;
    Ne[0] = [];
    Ne[1] = [];
    Ne[0].length = numDeps;
    Ne[1].length = numDeps;

//
    if (ifLineOnly === true) {

        //console.log("ifLineOnly mode - stellar structure, ifLineOnly: " + ifLineOnly);

        //We've already stored the stellar structure - just retrieve logarithmic quantities
        // and reconstruct linear quantities

        for (var i = 0; i < numDeps; i++) {
            //console.log(keyTemp[i]);
            storeName = "temp" + String(i);
            temp[1][i] = Number(sessionStorage.getItem(storeName));
            temp[0][i] = Math.exp(temp[1][i]);
            storeName = "kapp" + String(i);
            kappa[1][i] = Number(sessionStorage.getItem(storeName));
            kappa[0][i] = Math.exp(kappa[1][i]);
            storeName = "press" + String(i);
            press[1][i] = Number(sessionStorage.getItem(storeName));
            press[0][i] = Math.exp(press[1][i]);
            storeName = "pRad" + String(i);
            press[3][i] = Number(sessionStorage.getItem(storeName));
            press[2][i] = Math.exp(press[3][i]);
            storeName = "rho" + String(i);
            rho[1][i] = Number(sessionStorage.getItem(storeName));
            rho[0][i] = Math.exp(rho[1][i]);
            storeName = "mmw" + String(i);
            mmw[i] = Number(sessionStorage.getItem(storeName));
            storeName = "Ne" + String(i);
            Ne[1][i] = Number(sessionStorage.getItem(storeName));
            Ne[0][i] = Math.exp(Ne[1][i]);
        }

    } else {

        //console.log("normal mode - stellar structure, ifLineOnly: " + ifLineOnly);

        ////Gray kinetic temeprature structure:
        //temp = temperature(numDeps, teff, tauRos);
        //Rescaled  kinetic temeprature structure: 
        var F0Vtemp = 7300.0;  // Teff of F0 V star (K)       
        if (teff < F0Vtemp) {
            //We're a cool star! - rescale from Sun!
            temp = phxSunTemp(teff, numDeps, tauRos);
        } else if (teff >= F0Vtemp) {
            //We're a HOT star! - rescale from Vega
            temp = phxVegaTemp(teff, numDeps, tauRos);
        }

        //Scaled from Phoenix solar model:
        var guessKappa = [];
        guessKappa.length = 2;
        guessKappa[0] = [];
        guessKappa[1] = [];
        guessKappa[0].length = numDeps;
        guessKappa[1].length = numDeps;
        var guessPGas = [];
        guessPGas.length = 2;
        guessPGas[0] = [];
        guessPGas[1] = [];
        guessPGas[0].length = numDeps;
        guessPGas[1].length = numDeps;
        var guessRho = [];
        guessRho.length = 2;
        guessRho[0] = [];
        guessRho[1] = [];
        guessRho[0].length = numDeps;
        guessRho[1].length = numDeps;



        if (teff < F0Vtemp) {
            //We're a cool star - rescale from Sun!
            guessPGas = phxSunPGas(grav, numDeps, tauRos);
            Ne = phxSunNe(grav, numDeps, tauRos, temp, kappaScale);
            guessKappa = phxSunKappa(numDeps, tauRos, kappaScale);
        } else if (teff >= F0Vtemp) {
            //We're a HOT star!! - rescale from Vega
            guessPGas = phxVegaPGas(grav, numDeps, tauRos);
            Ne = phxVegaNe(grav, numDeps, tauRos, temp, kappaScale);
            guessKappa = phxVegaKappa(numDeps, tauRos, kappaScale);
        }

        //        
// mean molecular weight and Ne for Star & Sun
        mmw = mmwFn(numDeps, temp, kappaScale);
        var guessRho = massDensity(numDeps, temp, guessPGas, mmw, kappaScale);
        /*
         mode = 0;  //call kappas without knowledge of rho
         
         var kappa = kappas(mode, numDeps, rho, rhoSun, kappaScale, logg, loggSun, teff, teffSun, radius, massX, massZ, tauRos, temp, tempSun);
         var kappaSun = kappas(mode, numDeps, rho, rhoSun, kappaScaleSun, loggSun, loggSun, teffSun, teffSun, radiusSun, massX, massZSun, tauRos, tempSun, tempSun);
         */
        mode = 1; //call kappas with knowledge of rho
        logNumsH3 = levelPops(lamJump3, logNH, Ne, ionizedHI, chiI1H, chiI2H, chiLH3, gw1H, gw2H, gwLH3,
                numDeps, kappaScale, tauRos, temp, guessRho);
        logNumsH2 = levelPops(lamJump2, logNH, Ne, ionizedHI, chiI1H, chiI2H, chiLH2, gw1H, gw2H, gwLH2,
                numDeps, kappaScale, tauRos, temp, guessRho);
        if (teff < F0Vtemp) {
            //console.log(" ************** Main kappa cool branch");
            kappa = kappas(mode, numDeps, guessRho, rhoSun, kappaSun, kappaScale, logg, loggSun,
                    teff, teffSun, radius, massX, massZ, tauRos, temp, tempSun, logNumsH3, logNumsH2);
        } else if (teff >= F0Vtemp) {
           //console.log("Call 1: Hot branch taken");
            kappa = kappas(mode, numDeps, guessRho, rhoVega, kappaVega, kappaScale, logg, loggSun,
                    teff, teffSun, radius, massX, massZ, tauRos, temp, tempVega, logNumsH3, logNumsH2);
        }
        ////Test:
        //var kappa = [];
        //kappa.length = 2;
        //kappa[0] = [];
        //kappa[1] = [];
        //kappa[0].length = numDeps;
        //kappa[1].length = numDeps;
       // for (var i = 0; i < numDeps; i++) {
            //kappa[0][i] = guessKappa[0][i];
            //kappa[1][i] = guessKappa[1][i];
            //console.log(" " + i + " " + logE * guessRho[1][i] + " " + logE * rhoVega[1][i] + " " + logE * kappaVega[1][i] +
            //        " " + temp[0][i] + " " + tempVega[0][i] + " " + logE * kappa[1][i]
             //       + " Ne " + logE * Ne[1][i] + " logNumsH3 " + logE * logNumsH3[1][i] + " logNumsH2 " + logE * logNumsH2[1][i]);
       // }
        //Next solve hydrostatic eq for P scale on the tau scale - need to pick a depth dependent kappa value!
        //   - scale kapp_Ross with log(g) from solar value? - Kramers opacity law?
        //   - dP/dTau = g/kappa
        //press is a 4 x numDeps array:
        // rows 0 & 1 are linear and log *gas* pressure, respectively
        // rows 2 & 3 are linear and log *radiation* pressure
       // console.log("Calling hydrostat for target:");
        press = hydrostatic(numDeps, grav, tauRos, kappa, temp);
        // Then solve eos for the rho scale - need to pick a mean molecular weight, mu
        rho = massDensity(numDeps, temp, press, mmw, kappaScale);
        // Then construct geometric depth scale from tau, kappa and rho
        //for (var i = 0; i < numDeps; i++) {
        //    console.log(" i " + i + " tauRos[1][i] " + logE*tauRos[1][i] + " mmw[i] " + mmwSun[i] + " temp[0][i] " + temp[0][i] + " press[1][i] " + logE*press[1][i] + " kappa[1][i] " + logE*kappa[1][i] + " rho[1][i] " + logE*rho[1][i]);
        //}
        //compute kappas again with in situ densities thsi time:
        mode = 1; //call kappas ** with ** knowledge of rho
        logNumsH3 = levelPops(lamJump3, logNH, Ne, ionizedHI, chiI1H, chiI2H, chiLH3, gw1H, gw2H, gwLH3,
               numDeps, kappaScale, tauRos, temp, rho);
        logNumsH2 = levelPops(lamJump2, logNH, Ne, ionizedHI, chiI1H, chiI2H, chiLH2, gw1H, gw2H, gwLH2,
                numDeps, kappaScale, tauRos, temp, rho);
         if (teff < F0Vtemp) {
             kappa = kappas(mode, numDeps, rho, rhoSun, kappaSun, kappaScale, logg, loggSun,
                     teff, teffSun, radius, massX, massZ, tauRos, temp, tempSun, logNumsH3, logNumsH2);
        } else if (teff >= F0Vtemp) {
            //console.log("Call 2: Hot branch taken");
            kappa = kappas(mode, numDeps, rho, rhoVega, kappaVega, kappaScale, logg, loggSun,
                    teff, teffSun, radius, massX, massZ, tauRos, temp, tempVega, logNumsH3, logNumsH2);
         }
        //double kappaSun[][] = Kappas.kappas(numDeps, kappaScaleSun, teffSun, teffSun, loggSun, loggSun);
        //kappaSun = kappas(mode, numDeps, rho, rhoSun, kappaScaleSun, loggSun, loggSun, teffSun, teffSun, radiusSun, massX, massZSun, tauRos, tempSun, tempSun);
        // Then construct geometric depth scale from tau, kappa and rho

        var depths = depthScale(numDeps, tauRos, kappa, rho);
        //for (var i = 0; i < numDeps; i++) {
        //    console.log("depths[i] " + (1.0e-5 * depths[i]));
        //}
        var numTCorr = 0; //test

        // updated temperature structure
        var newTemp = [];
        newTemp.length = 2;
        newTemp[0] = [];
        newTemp[1] = [];
        newTemp[0].length = numDeps;
        newTemp[1].length = numDeps;
        if (ifTcorr === true) {
//console.log(" " + logE * tauRos[1][iTau] + " " + temp[0][iTau]);
            for (var i = 0; i < numTCorr; i++) {
//newTemp = TCorr.tCorr(numDeps, tauRos, temp);
                newTemp = mgTCorr(numDeps, teff, tauRos, temp, rho, kappa);
                for (var iTau = 0; iTau < numDeps; iTau++) {
//console.log(" " + logE*tauRos[1][iTau] + " " + temp[0][iTau]);
                    temp[1][iTau] = newTemp[1][iTau];
                    temp[0][iTau] = newTemp[0][iTau];
                    //console.log(" " + logE*tauRos[1][iTau] + " " + temp[0][iTau]);
                }
            }
        }

        if (ifConvec === true) {
//Convection:
// Teff below which stars are convective.  
//  - has to be finessed because Convec.convec() does not work well :-(
            var convTeff = 6500.0;
            var convTemp = [];
            convTemp.length = 2;
            convTemp[0] = [];
            convTemp[1] = [];
            convTemp[0].length = numDeps;
            convTemp[1].length = numDeps;
            if (teff < convTeff) {
                convTemp = convec(numDeps, tauRos, temp, press, rho, kappa, kappaSun, kappaScale, teff, logg);
                for (var iTau = 0; iTau < numDeps; iTau++) {
                    temp[1][iTau] = convTemp[1][iTau];
                    temp[0][iTau] = convTemp[0][iTau];
                }

            }
        }


        if ((ifTcorr === true) || (ifConvec === true)) {
//Recall hydrostat with updates temps            
//Recall state withupdated Press                    
//recall kappas withupdates rhos
//Recall depths with re-updated kappas
            press = hydrostatic(numDeps, grav, tauRos, kappa, temp);
            rho = massDensity(numDeps, temp, press, mmw, kappaScale);
            //pressSun = hydrostatic(numDeps, gravSun, tauRos, kappaSun, tempSun, logRadius);
            //rhoSun = massDensity(numDeps, tempSun, pressSun, kappaScaleSun);
            mode = 1; //call kappas ** with ** knowledge of rho
            logNumsH3 = levelPops(lamJump3, logNH, Ne, ionizedHI, chiI1H, chiI2H, chiLH3, gw1H, gw2H, gwLH3,
                    numDeps, kappaScale, tauRos, temp, rho);
            logNumsH2 = levelPops(lamJump2, logNH, Ne, ionizedHI, chiI1H, chiI2H, chiLH2, gw1H, gw2H, gwLH2,
                    numDeps, kappaScale, tauRos, temp, rho);
            if (teff < F0Vtemp) {
                kappa = kappas(mode, numDeps, rho, rhoSun, kappaSun, kappaScale, logg, loggSun,
                        teff, teffSun, radius, massX, massZ, tauRos, temp, tempSun, logNumsH3, logNumsH2);
            } else if (teff >= F0Vtemp) {
                kappa = kappas(mode, numDeps, rho, rhoVega, kappaVega, kappaScale, logg, loggSun,
                        teff, teffSun, radius, massX, massZ, tauRos, temp, tempVega, logNumsH3, logNumsH2);
            }
            //double kappaSun[][] = Kappas.kappas(numDeps, kappaScaleSun, teffSun, teffSun, loggSun, loggSun);
            //kappaSun = kappas(mode, numDeps, rho, rhoSun, kappaScaleSun, loggSun, loggSun, teffSun, teffSun, radiusSun, massX, massZSun, tauRos, tempSun, tempSun);
            //depths = depthScale(numDeps, tauRos, kappa, rho);
        }

    } // end stellar struture ifLineOnly



//
//
// var depthsSun = depthScale(numDeps, tauRos, kappaSun, rhoSun);

// Set up theta grid
//  cosTheta is a 2xnumThetas array:
// row 0 is used for Gaussian quadrature weights
// row 1 is used for cos(theta) values
// Gaussian quadrature:
// Number of angles, numThetas, will have to be determined after the fact
    var cosTheta = thetas();
    var numThetas = cosTheta[0].length;
    // Solve formal sol of rad trans eq for outgoing surfaace I(0, theta)

    var lineMode;
    //
    // ************
    //
    //  Spectrum synthesis section:
    //  
    //  
    //  
    // Limb darkening:
    // Establish continuum wavelength grid:
    var lambdaScale = lamgrid(numLams, lamSetup); //nm
    // Set up multi-Gray continuum info:
    var isCool = 7300.0; //Class A0


    //Set up multi-gray opacity:
    // lambda break-points and gray levels:
    // No. multi-gray bins = num lambda breakpoints +1
    var minLambda = 30.0; //nm
    var maxLambda = 1.0e6; //nm
    var maxNumBins = 11;
    var grayLevelsEpsilons = grayLevEps(maxNumBins, minLambda, maxLambda, teff, isCool);
    //Find actual number of multi-gray bins:
    var numBins = 0; //initialization
    for (var i = 0; i < maxNumBins; i++) {
        if (grayLevelsEpsilons[0][i] < maxLambda) {
            numBins++;
        }
    }

//
//Line list:
    var numLines = 14;
    //var numLines = 1;  //debug
    var listName = [];
    listName.length = numLines;
    var listElement = [];
    listElement.length = numLines;
    var listLam0 = []; // nm
    listLam0.length = numLines;
    var listMass = []; // amu
    listMass.length = numLines;
    var listLogGammaCol = [];
    listLogGammaCol.length = numLines;
    //abundance in logarithmic A12 sysytem
    var listA12 = [];
    listA12.length = numLines;
    //Log of unitless oscillator strength, f 
    var listLogf = [];
    listLogf.length = numLines;
    //Einstein coefficient for spontaneous de-excitation, A 
    var listLogAij = [];
    listLogAij.length = numLines;
    //Ground state ionization E - Stage I (eV) 
    var listChiI1 = [];
    listChiI1.length = numLines;
    //Ground state ionization E - Stage II (eV)
    var listChiI2 = [];
    listChiI2.length = numLines;
    //Excitation E of lower E-level of b-b transition (eV)
    var listChiL = [];
    listChiL.length = numLines;
    //Unitless statisital weight, Ground state ionization E - Stage I
    var listGw1 = [];
    listGw1.length = numLines;
    //Unitless statisital weight, Ground state ionization E - Stage II
    var listGw2 = [];
    listGw2.length = numLines;
    //Unitless statisital weight, lower E-level of b-b transition                 
    var listGwL = [];
    listGwL.length = numLines;
    //double[] listGwU For now we'll just set GwU to 1.0
    // Is stage II?
    var listIonized = [];
    listIonized.length = numLines;
    //
    //Atomic Data sources:
    //http://www.nist.gov/pml/data/asd.cfm
    // Masses: http://www.chemicalelements.com/show/mass.html
    //Solar abundances: http://arxiv.org/pdf/0909.0948.pdf
    //   - Asplund, M., Grevesse, N., Sauval, A., Scott, P., 2009, arXiv:0909.0948v1
    //   
    //   
    //    *** CAUTION: THese should be in order of increasing wavelength (lam0) for labeling purposes in graphical output
    //    
    //    
    //    
    //    
    //CaII K
    listName[0] = "Ca II K";
    listElement[0] = "Ca";
    listLam0[0] = 393.366;
    listA12[0] = 6.34;
    listLogf[0] = -0.166;
    listLogAij[0] = Math.log(1.47e+08);
    listChiI1[0] = 6.113;
    listChiI2[0] = 11.872;
    //This is necessary for consistency with Stage II treatment of user-defined spectral line:
    listChiL[0] = 0.01 + listChiI1[0];
    listMass[0] = 40.078;
    listLogGammaCol[0] = 0.5;
    listGw1[0] = 1.0;
    listGw2[0] = 2.0;
    listGwL[0] = 2.0;
    listIonized[0] = true;
    
     //CaII H
     listName[1] = "Ca II H";
     listElement[1] = "Ca";
     listLam0[1] = 396.847;
     listA12[1] = 6.34;
     listLogf[1] = -0.482;
     listLogAij[1] = Math.log(1.4e+08);
     listChiI1[1] = 6.113;
     listChiI2[1] = 11.872;
     //This is necessary for consistency with Stage II treatment of user-defined spectral line:
     listChiL[1] = 0.01 + listChiI1[1];
     listMass[1] = 40.078;
     listLogGammaCol[1] = 0.5;
     listGw1[1] = 1.0;
     listGw2[1] = 2.0;
     listGwL[1] = 2.0;
     listIonized[1] = true;
     //Fe I 4045
     listName[2] = "Fe I";
     listElement[2] = "Fe";
     listLam0[2] = 404.581;
     listA12[2] = 7.50; //??????
     listLogf[2] = -0.674;
     listLogAij[2] = Math.log(8.62e+07);
     listChiI1[2] = 7.902;
     listChiI2[2] = 16.199;
     listChiL[2] = 1.485;
     listMass[2] = 55.845;
     listLogGammaCol[2] = 0.0;
     listGw1[2] = 1.0;
     listGw2[2] = 1.0;
     listGwL[2] = 9.0;
     listIonized[2] = false;
     //Hdelta
     listName[3] = "H I <em>&#948</em>";
     listElement[3] = "H";
     listLam0[3] = 410.174;
     listA12[3] = 12.0; //By definition - it's Hydrogen
     listLogf[3] = -1.655;
     listLogAij[3] = Math.log(9.7320e+05);
     listChiI1[3] = 13.6;
     listChiI2[3] = 1.0e6; //Set very high arbitrary value - there is no "H III"!
     listChiL[3] = 10.2;
     listMass[3] = 1.0;
     listLogGammaCol[3] = 1.0;
     listGw1[3] = 2.0; // 2n^2
     listGw2[3] = 1.0;
     listGwL[3] = 8.0; // 2n^2
     listIonized[3] = false;
     //CaI 4227
     listName[4] = "Ca I";
     listElement[4] = "Ca";
     listLam0[4] = 422.673;
     listA12[4] = 6.34;
     listLogf[4] = 0.243;
     listLogAij[4] = Math.log(2.18e+08);
     listChiI1[4] = 6.113;
     listChiI2[4] = 11.872;
     listChiL[4] = 0.00;
     listMass[4] = 40.078;
     listLogGammaCol[4] = 1.0;
     listGw1[4] = 1.0;
     listGw2[4] = 1.0;
     listGwL[4] = 1.0;
     listIonized[4] = false;
     //Fe I 4271
     listName[5] = "Fe I";
     listElement[5] = "Fe";
     listLam0[5] = 427.176;
     listA12[5] = 7.50; //??????
     listLogf[5] = -1.118;
     listLogAij[5] = Math.log(2.28e+07);
     listChiI1[5] = 7.902;
     listChiI2[5] = 16.199;
     listChiL[5] = 1.485;
     listMass[5] = 55.845;
     listLogGammaCol[5] = 0.0;
     listGw1[5] = 1.0;
     listGw2[5] = 1.0;
     listGwL[5] = 9.0;
     listIonized[5] = false;
     //Hgamma
     listName[6] = "H I <em>&#947</em>";
     listElement[6] = "H";
     listLam0[6] = 434.047;
     listA12[6] = 12.0; //By definition - it's Hydrogen
     listLogf[6] = -1.350;
     listLogAij[6] = Math.log(2.5304e+06);
     listChiI1[6] = 13.6;
     listChiI2[6] = 1.0e6; //Set very high arbitrary value - there is no "H III"!
     listChiL[6] = 10.2;
     listMass[6] = 1.0;
     listLogGammaCol[6] = 1.0;
     listGw1[6] = 2.0; // 2n^2
     listGw2[6] = 1.0;
     listGwL[6] = 8.0; // 2n^2
     listIonized[6] = false;
     //He I 4387
     listName[7] = "He I";
     listElement[7] = "He";
     listLam0[7] = 438.793;
     listA12[7] = 10.93; //??????
     listLogf[7] = -1.364;
     listLogAij[7] = Math.log(8.9889e+06);
     listChiI1[7] = 24.587;
     listChiI2[7] = 54.418;
     listChiL[7] = 21.218;
     listMass[7] = 4.003;
     listLogGammaCol[7] = 0.0;
     listGw1[7] = 1.0;
     listGw2[7] = 1.0;
     listGwL[7] = 3.0;
     listIonized[7] = false;
     //He I 4471
     listName[8] = "He I";
     listElement[8] = "He";
     listLam0[8] = 447.147;
     listA12[8] = 10.93; //??????
     listLogf[8] = -0.986;
     listLogAij[8] = Math.log(2.4579e+07);
     listChiI1[8] = 24.587;
     listChiI2[8] = 54.418;
     listChiL[8] = 20.964;
     listMass[8] = 4.003;
     listLogGammaCol[8] = 0.0;
     listGw1[8] = 1.0;
     listGw2[8] = 1.0;
     listGwL[8] = 5.0;
     listIonized[8] = false;
     //Hbeta
     listName[9] = "H I <em>&#946</em>";
     listElement[9] = "H";
     listLam0[9] = 486.128;
     listA12[9] = 12.0; //By definition - it's Hydrogen
     listLogf[9] = -0.914;
     listLogAij[9] = Math.log(9.6683e+06);
     listChiI1[9] = 13.6;
     listChiI2[9] = 1.0e6; //Set very high arbitrary value - there is no "H III"!
     listChiL[9] = 10.2;
     listMass[9] = 1.0;
     listLogGammaCol[9] = 1.0;
     listGw1[9] = 2.0; // 2n^2
     listGw2[9] = 1.0;
     listGwL[9] = 8.0; // 2n^2
     listIonized[9] = false;
     //MgIb1
     listName[10] = "Mg I <em>b</em><sub>1</sub>";
     listElement[10] = "Mg";
     listLam0[10] = 518.360; //nm
     listA12[10] = 7.60; // Grevesse & Sauval 98
     listLogf[10] = -0.867;
     listLogAij[10] = Math.log(5.61e+07);
     listChiI1[10] = 7.646;
     listChiI2[10] = 15.035;
     listChiL[10] = 2.717;
     listMass[10] = 24.305;
     listLogGammaCol[10] = 1.0;
     listGw1[10] = 1.0;
     listGw2[10] = 1.0;
     listGwL[10] = 5.0;
     listIonized[10] = false;
     //NaID2
     listName[11] = "Na I <em>D</em><sub>2</sub>";
     listElement[11] = "Na";
     listLam0[11] = 588.995;
     listA12[11] = 6.24; // Grevesse & Sauval 98
     listLogf[11] = -0.193;
     listLogAij[11] = Math.log(6.16e+07);
     listChiI1[11] = 5.139;
     listChiI2[11] = 47.286;
     listChiL[11] = 0.0;
     listMass[11] = 22.990;
     listLogGammaCol[11] = 1.0;
     listGw1[11] = 2.0;
     listGw2[11] = 1.0;
     listGwL[11] = 2.0;
     listIonized[11] = false;
     //NaID1
     listName[12] = "Na I <em>D</em><sub>1</sub>";
     listElement[12] = "Na";
     listLam0[12] = 589.592; //nm
     listA12[12] = 6.24; // Grevesse & Sauval 98    
     listLogf[12] = -0.495;
     listLogAij[12] = Math.log(6.14e+07);
     listChiI1[12] = 5.139;
     listChiI2[12] = 47.286;
     listChiL[12] = 0.0;
     listMass[12] = 22.990;
     listLogGammaCol[12] = 1.0;
     listGw1[12] = 2.0;
     listGw2[12] = 1.0;
     listGwL[12] = 2.0;
     listIonized[12] = false;
     //Halpha
     listName[13] = "H I <em>&#945</em>";
     listElement[13] = "H";
     listLam0[13] = 656.282;
     listA12[13] = 12.0; //By definition - it's Hydrogen
     listLogf[13] = -0.193;
     listLogAij[13] = Math.log(6.4651e+07);
     listChiI1[13] = 13.598434005136;
     listChiI2[13] = 1.0e6; //Set very high arbitrary value - there is no "H III"!
     listChiL[13] = 10.1988357;
     listMass[13] = 1.0;
     listLogGammaCol[13] = 1.0;
     listGw1[13] = 2.0; // 2n^2
     listGw2[13] = 1.007;
     listGwL[13] = 8.0; // 2n^2
     listIonized[13] = false;
     
//
//
//
//   **** END line list
//
//
//
    //if Hydrogen or Helium, kappaScale should be unity for these purposes:
    var kappaScaleList = 1.0; //initialization

    //Notes
    //
    //CAUTION: This treatment expects numPoints (number of wavelengths, lambda) to be the same for *all* spectral lines!
    var listNumCore = 5; //per wing
    var listNumWing = 10; // half-core
    //int numWing = 0;  //debug
    var listNumPoints = 2 * (listNumCore + listNumWing) - 1; // + 1;  //Extra wavelength point at end for monochromatic continuum tau scale

    //default initializations:

    var numMaster = numLams + (numLines * listNumPoints); //total size (number of wavelengths) of master lambda & total kappa arrays 
    var masterLams = [];
    masterLams.length = numMaster;
    var masterIntens = [];
    masterIntens.length = numMaster;
    //Can't avoid Array constructor here:
    for (var i = 0; i < numMaster; i++) {
        masterIntens[i] = [];
        masterIntens[i].lenght = numThetas;
    }

    var contFlux = [];
    contFlux.length = 2;
    contFlux[0] = [];
    contFlux[0].length = numLams;
    contFlux[1] = [];
    contFlux[1].length = numLams;
    var ldc = [];
    ldc.length = numLams;
    var masterFlux = [];
    masterFlux.length = 2;
    masterFlux[0] = [];
    masterFlux[0].length = numMaster;
    masterFlux[1] = [];
    masterFlux[1].length = numMaster;
    var numColors = 5;
    var colors = [];
    colors.length = numColors;
    var thisTau = [];
    thisTau.length = 2;
    thisTau[0] = [];
    thisTau[0].length = numDeps;
    thisTau[1] = [];
    thisTau[1].length = numDeps;
    if (ifLineOnly === true) {

        //console.log("ifLineOnly mode - rad field, ifLineOnly: " + ifLineOnly);

        for (var il = 0; il < numMaster; il++) {
            //console.log(keyTemp[i]);
            storeName = "lambda" + String(il);
            masterLams[il] = Number(sessionStorage.getItem(storeName));
            storeName = "fLambda" + String(il);
            masterFlux[1][il] = Number(sessionStorage.getItem(storeName));
            masterFlux[0][il] = Math.exp(masterFlux[1][il]);
            for (var it = 0; it < numThetas; it++) {
                storeName = "iLambda" + String(il) + "_" + String(it);
                masterIntens[il][it] = Number(sessionStorage.getItem(storeName));
                masterIntens[il][it] = Math.exp(masterIntens[il][it]); //logs were stores
            }
        }
        for (var il = 0; il < numLams; il++) {
            storeName = "fCont" + String(il);
            contFlux[1][il] = Number(sessionStorage.getItem(storeName));
            contFlux[0][il] = Math.exp(contFlux[1][il]);
            storeName = "ldc" + String(il);
            ldc[il] = Number(sessionStorage.getItem(storeName));
         }

        colors[0] = Number(sessionStorage.getItem("UxmBx"));
        colors[1] = Number(sessionStorage.getItem("BmV"));
        colors[2] = Number(sessionStorage.getItem("VmR"));
        colors[3] = Number(sessionStorage.getItem("VmI"));
        colors[4] = Number(sessionStorage.getItem("RmI"));
        //We've already stored the overall intensity and flux distributions - just retrieve the quantities

    } else {

        //console.log("normal mode - rad field, ifLineOnly: " + ifLineOnly);

        var numNow = numLams; //initialize dynamic counter of how many array elements are in use
        //double[][] logMasterKaps = new double[numMaster][numDeps];
//Line blanketed opacity array:
        var logMasterKaps = [];
        logMasterKaps.length = numMaster;
        for (var i = 0; i < numMaster; i++) {
            logMasterKaps[i] = [];
            logMasterKaps[i].length = numDeps;
        }
// Construct a continuum opacity array with same structure as logMasterKaps
        var logContKaps = [];
        logContKaps.length = numLams;
        for (var i = 0; i < numLams; i++) {
            logContKaps[i] = [];
            logContKaps[i].length = numDeps;
        }

//System.out.println("numLams " + numLams + " numLines " + numLines + " listNumPoints " + listNumPoints);
//System.out.println("numMaster " + numMaster + " numNow " + numNow);
//seed masterLams and logMasterKaps with continuum SED lambdas and kapaps:
//This just initializes the first numLams of the numMaster elements
//Also - put in multi-Gray opacities here:
//Find which gray level bin the spectrum synthesis region starts in - assume that the first gray-level bin
// is always at a shorter wavelength than the start of the synthesis region:
        var whichBin = 0; //initialization
        for (var iB = 0; iB < numBins; iB++) {
            if (grayLevelsEpsilons[0][iB] >= lambdaScale[0]) {
                whichBin = iB; //found it!
                break;
            }
        }
//System.out.println("starting whichBin " + whichBin);

//First wavelength definitely falls in first found bin:
        masterLams[0] = lambdaScale[0];
        for (var iD = 0; iD < numDeps; iD++) {
            logMasterKaps[0][iD] = kappa[1][iD]; // + Math.log(grayLevelsEpsilons[1][0]);
            //console.log(" iD " + iD + " tempSun[0][i] " + tempSun[0][i] + " pressSun[0][i] " + pressSun[0][i] + " kappaSun[0][iD] " + kappaSun[0][iD] + " rhoSun[0][iD] " + rhoSun[0][iD]);
        }
        for (var iL = 1; iL < numLams; iL++) {
            masterLams[iL] = lambdaScale[iL];
            //System.out.println("iL " + iL + " lambdaScale[iL] " + lambdaScale[iL] + " whichBin+1 " + (whichBin + 1) + " grayLevelsEpsilons[0][whichBin + 1] " + grayLevelsEpsilons[0][whichBin + 1]);
            if ((lambdaScale[iL] >= grayLevelsEpsilons[0][whichBin + 1])
                    && (lambdaScale[iL - 1] < grayLevelsEpsilons[0][whichBin + 1])
                    && (whichBin < numBins - 1)) {
                whichBin++;
                //System.out.println("whichBin " + whichBin);
            }
            for (var iD = 0; iD < numDeps; iD++) {
                logMasterKaps[iL][iD] = kappa[1][iD]; // + Math.log(grayLevelsEpsilons[1][whichBin]);
            }
        }
//initialize the rest with dummy values
        for (var iL = numLams; iL < numMaster; iL++) {
            masterLams[iL] = lambdaScale[numLams - 1];
            for (var iD = 0; iD < numDeps; iD++) {
                logMasterKaps[iL][iD] = kappa[1][iD];
            }
        }

//Initialize monochromatic continuum opacity array:
////This is a fake for now - it's just th gray opacity at every wavelength
        for (var iL = 0; iL < numLams; iL++) {
            for (var iD = 0; iD < numDeps; iD++) {
                logContKaps[iL][iD] = kappa[1][iD]; // + Math.log(grayLevelsEpsilons[1][whichBin]);
            }
        }


//Stuff for the the Teff recovery test:
        var lambda1, lambda2, fluxSurfBol, logFluxSurfBol, listLam0nm;
        fluxSurfBol = 0;
        for (var iLine = 0; iLine < numLines; iLine++) {

            //if H or He, make sure kappaScale is unity:
            if ((listElement[iLine] === "H") ||
                    (listElement[iLine] === "He")) {
                kappaScaleList = 1.0;
            } else {
                kappaScaleList = kappaScale;
            }
//System.out.println("iLine " + iLine + " numNow " + numNow);
            var listLogN = (listA12[iLine] - 12.0) + logNH;
            listLam0nm = listLam0[iLine] * 1.0e-7; // nm to cm
            //console.log("listElement[i] " + listElement[iLine] + " listLam0[i] " + listLam0[iLine]);
            var listLinePoints = lineGrid(listLam0nm, listMass[iLine], xiT, numDeps, teff, listNumCore, listNumWing,
                    logGammaCol, tauRos, temp, press, tempSun, pressSun);
            // Gaussian + Lorentzian approximation to profile (voigt()):
            //var listLineProf = voigt(listLinePoints, listLam0nm, listLogGammaCol[iLine],
            //        numDeps, teff, tauRos, temp, press, tempSun, pressSun);
            // // Real Voigt fn profile (voigt2()):        
            var listLineProf = voigt(listLinePoints, listLam0nm, listLogAij[iLine], listLogGammaCol[iLine],
                    numDeps, teff, tauRos, temp, press, tempSun, pressSun);
            //double[][] listLogNums = LevelPops.levelPops(listLam0nm, listLogN, Ne, ionized, listChiI[iLine], listChiL[iLine], 
            //        numDeps, kappaScale, tauRos, temp, rho);
            var listLogNums = levelPops(listLam0nm, listLogN, Ne, listIonized[iLine], listChiI1[iLine],
                    listChiI2[iLine], listChiL[iLine], listGw1[iLine], listGw2[iLine], listGwL[iLine],
                    numDeps, kappaScaleList, tauRos, temp, rho);
            var listLogKappaL = lineKap(listLam0nm, listLogNums, listLogf[iLine], listLinePoints, listLineProf,
                    numDeps, kappaScaleList, tauRos, temp, rhoSun);
            //int listNumPoints = listLinePoints[0].length; // + 1;  //Extra wavelength point at end for monochromatic continuum tau scale
            //double logTauL[][] = LineTau2.tauLambda(numDeps, listNumPoints, logKappaL,
            //        kappa, tauRos, rho, logg);
            var listLineLambdas = [];
            listLineLambdas.length = listNumPoints;
            for (var il = 0; il < listNumPoints; il++) {
// // lineProf[iLine][*] is DeltaLambda from line centre in cm
// if (il === listNumPoints - 1) {
//    listLineLambdas[il] = listLam0nm; // Extra row for line centre continuum taus scale
// } else {
//lineLambdas[il] = (1.0E7 * linePoints[iLine][il]) + lam0; //convert to nm
                listLineLambdas[il] = listLinePoints[0][il] + listLam0nm;
                // }
            }

            var masterLamsOut = masterLambda(numLams, numMaster, numNow, masterLams, listNumPoints, listLineLambdas);
            var logMasterKapsOut = masterKappa(numDeps, numLams, numMaster, numNow, masterLams, masterLamsOut, logMasterKaps, listNumPoints, listLineLambdas, listLogKappaL);
            numNow = numNow + listNumPoints;
            //update masterLams and logMasterKaps:
            for (var iL = 0; iL < numNow; iL++) {
                masterLams[iL] = masterLamsOut[iL];
                for (var iD = 0; iD < numDeps; iD++) {
//Still need to put in multi-Gray levels here:
                    logMasterKaps[iL][iD] = logMasterKapsOut[iL][iD];
                    //if (iD === 36) {
                    //    System.out.println("iL " + iL + " masterLams[iL] " + masterLams[iL] + " logMasterKaps[iL][iD] " + logMasterKaps[iL][iD]);
                    //}
                }
            }
        } //numLines loop

//int numMaster = masterLams.length;
        var logTauMaster = tauLambda(numDeps, numMaster, logMasterKaps,
                kappa, tauRos);
        //Evaluate formal solution of rad trans eq at each lambda throughout line profile
        // Initial set to put lambda and tau arrays into form that formalsoln expects
        //double[] masterLambdas = new double[numMaster];
        //double[][] masterIntens = new double[numMaster][numThetas];

        var masterIntensLam = [];
        masterIntensLam.length = numThetas;
        var masterFluxLam = [];
        masterFluxLam.length = 2;
        //
        lineMode = false; //no scattering for overall SED

        for (var il = 0; il < numMaster; il++) {

//                        // lineProf[0][*] is DeltaLambda from line centre in cm
//                        if (il === listNumPoints - 1) {
//                            lineLambdas[il] = lam0; // Extra row for line centre continuum taus scale
//                        } else {
//lineLambdas[il] = (1.0E7 * linePoints[0][il]) + lam0; //convert to nm
//masterLambdas[il] = masterLams[il];
//                        }
            for (var id = 0; id < numDeps; id++) {
                thisTau[1][id] = logTauMaster[il][id];
                thisTau[0][id] = Math.exp(logTauMaster[il][id]);
            } // id loop

            masterIntensLam = formalSoln(numDeps,
                    cosTheta, masterLams[il], thisTau, temp, lineMode);
            masterFluxLam = flux2(masterIntensLam, cosTheta);
            for (var it = 0; it < numThetas; it++) {
                masterIntens[il][it] = masterIntensLam[it];
                //System.out.println(" il " + il + " it " + it + " logIntens " + logE*Math.log(lineIntensLam[it]) );
            } //it loop - thetas

            masterFlux[0][il] = masterFluxLam[0];
            masterFlux[1][il] = masterFluxLam[1];
            //System.out.println("il " + il + " masterLams[il] " + masterLams[il] + " masterFlux[1][il] " + logE * masterFlux[1][il]);
            //// Teff test - Also needed for convection module!:
            if (il > 1) {
                lambda2 = masterLams[il]; // * 1.0E-7;  // convert nm to cm
                lambda1 = masterLams[il - 1]; // * 1.0E-7;  // convert nm to cm
                fluxSurfBol = fluxSurfBol
                        + masterFluxLam[0] * (lambda2 - lambda1);
            }
        } //il loop
        var sigma = 5.670373E-5; //Stefan-Boltzmann constant ergs/s/cm^2/K^4  
        var logSigma = Math.log(sigma);
        logFluxSurfBol = Math.log(fluxSurfBol);
        var logTeffFlux = (logFluxSurfBol - logSigma) / 4.0;
        var teffFlux = Math.exp(logTeffFlux);
        ////Teff test
        //console.log("FLUX: Recovered Teff = " + teffFlux);
        //Compute JOhnson-Cousins photometric color indices:
        // Disk integrated Flux

//Continuum monochromatic optical depth array:
        var logTauCont = tauLambda(numDeps, numLams, logContKaps,
                kappa, tauRos);
        //Evaluate formal solution of rad trans eq at each lambda
        //        // Initial set to put lambda and tau arrays into form that formalsoln expects
        var contIntens = [];
        contIntens.length = numLams;
        for (var i = 0; i < numLams; i++){
           contIntens[i] = [];
           contIntens[i].length = numThetas;
        }
        var contIntensLam = [];
        contIntensLam.length = numThetas;

        var contFlux = [];
        contFlux.length = 2;
        contFlux[0] = [];
        contFlux[1] = [];
        contFlux[0].length = numLams;  
        contFlux[1].length = numLams;
        var contFluxLam = [];
        contFluxLam.length = 2;  

        lineMode = false;  //no scattering for overall SED

        for (var il = 0; il < numLams; il++) {

            for (var id = 0; id < numDeps; id++) {
                thisTau[1][id] = logTauCont[il][id];
                thisTau[0][id] = Math.exp(logTauCont[il][id]);
            } // id loop

            contIntensLam = formalSoln(numDeps,
                    cosTheta, lambdaScale[il], thisTau, temp, lineMode);

            contFluxLam = flux2(contIntensLam, cosTheta);

            for (var it = 0; it < numThetas; it++) {
                contIntens[il][it] = contIntensLam[it];
            } //it loop - thetas

            contFlux[0][il] = contFluxLam[0];
            contFlux[1][il] = contFluxLam[1];


            //// Teff test - Also needed for convection module!:
            if (il > 1) {
                lambda2 = lambdaScale[il]; // * 1.0E-7;  // convert nm to cm
                lambda1 = lambdaScale[il - 1]; // * 1.0E-7;  // convert nm to cm
                fluxSurfBol = fluxSurfBol
                        + contFluxLam[0] * (lambda2 - lambda1);
            }
        } //il loop

//Extract linear monochromatic continuum limb darlening coefficients (LDCs) ("epsilon"s):
    var ldc = [];
    ldc.length = numLams;
    ldc = ldCoeffs(numLams, lambdaScale, numThetas, cosTheta, contIntens);

        //logFluxSurfBol = Math.log(fluxSurfBol);
        //logTeffFlux = (logFluxSurfBol - Useful.logSigma()) / 4.0;
        //teffFlux = Math.exp(logTeffFlux);


        colors = UBVRI(masterLams, masterFlux, numDeps, tauRos, temp);
//
    } // ifLineOnly condition

    // intensity annuli - for disk rendering:


    // Try HTML session storage object to save the solar and stellar structure.  Stored values must be stringified.

    // Store the target solar structure:
    //console.log("typeof(Storage) " + typeof (Storage));
    if (typeof (Storage) !== "undefined") {
        //Generate the keys - we need one for every single scalar data value
        // and stringify and store the corresponding array element:
        //Store logarithmic values - we can reconstruct lienar values
        var storeValue, storeName;
        for (var i = 0; i < numDeps; i++) {
            //console.log(keyTemp[i]);
            storeName = "tempSun" + String(i);
            storeValue = String(tempSun[1][i]);
            window.sessionStorage.setItem(storeName, storeValue);
            storeName = "kappSun" + String(i);
            storeValue = String(kappaSun[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            // store Sun's gas pressure only - Don't need Sun's radiation pressure??
            storeName = "pressSun" + String(i);
            storeValue = String(pressSun[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "rhoSun" + String(i);
            storeValue = String(rhoSun[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "mmwSun" + String(i);
            storeValue = String(mmwSun[i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "NeSun" + String(i);
            storeValue = String(NeSun[1][i]);
            sessionStorage.setItem(storeName, storeValue);
        }

        for (var i = 0; i < numDeps; i++) {
            //console.log(keyTemp[i]);
            storeName = "tempVega" + String(i);
            storeValue = String(tempVega[1][i]);
            window.sessionStorage.setItem(storeName, storeValue);
            storeName = "kappVega" + String(i);
            storeValue = String(kappaVega[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            // store Sun's gas pressure only - Don't need Sun's radiation pressure??
            storeName = "pressVega" + String(i);
            storeValue = String(pressVega[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "rhoVega" + String(i);
            storeValue = String(rhoVega[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "mmwVega" + String(i);
            storeValue = String(mmwVega[i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "NeVega" + String(i);
            storeValue = String(NeVega[1][i]);
            sessionStorage.setItem(storeName, storeValue);
        }

        // Store the target stellar structure:

        //Generate the keys - we need one for every single scalar data value
        // and stringify and store the corresponding array element:
        //Store logarithmic values - we can reconstruct lienar values

        for (var i = 0; i < numDeps; i++) {
            //console.log(keyTemp[i]);
            storeName = "temp" + String(i);
            storeValue = String(temp[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "kapp" + String(i);
            storeValue = String(kappa[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            //Gas pressure
            storeName = "press" + String(i);
            storeValue = String(press[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            //Radiation pressure
            storeName = "pRad" + String(i);
            storeValue = String(press[3][i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "rho" + String(i);
            storeValue = String(rho[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "mmw" + String(i);
            storeValue = String(mmw[i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "Ne" + String(i);
            storeValue = String(Ne[1][i]);
            sessionStorage.setItem(storeName, storeValue);
        }

        // Store the target SED intensity and flux distributions and colors:

        //Generate the keys - we need one for every single scalar data value
        // and stringify and store the corresponding array element:

        for (var il = 0; il < numMaster; il++) {
            //console.log(keyTemp[i]);
            storeName = "lambda" + String(il);
            storeValue = String(masterLams[il]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "fLambda" + String(il);
            storeValue = String(masterFlux[1][il]);
            sessionStorage.setItem(storeName, storeValue);
            for (var it = 0; it < numThetas; it++) {
                storeName = "iLambda" + String(il) + "_" + String(it);
                storeValue = String(Math.log(masterIntens[il][it]));
                sessionStorage.setItem(storeName, storeValue);
            }
        }

        for (var il = 0; il < numLams; il++) {
            //console.log(keyTemp[i]);
            storeName = "fCont" + String(il);
            storeValue = String(contFlux[1][il]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "ldc" + String(il);
            storeValue = String(ldc[il]);
            sessionStorage.setItem(storeName, storeValue);
        }

        sessionStorage.setItem("UxmBx", colors[0]);
        sessionStorage.setItem("BmV", colors[1]);
        sessionStorage.setItem("VmR", colors[2]);
        sessionStorage.setItem("VmI", colors[3]);
        sessionStorage.setItem("RmI", colors[4]);
        // Store the target stellar parameters:

        //Generate the keys - we need one for every single scalar data value
        // and stringify and store the corresponding array element:

        storeName = "teff";
        storeValue = String(teff);
        sessionStorage.setItem(storeName, storeValue);
        storeName = "logg";
        storeValue = String(logg);
        sessionStorage.setItem(storeName, storeValue);
        storeName = "kappaScale";
        storeValue = String(kappaScale);
        sessionStorage.setItem(storeName, storeValue);
        storeName = "massStar";
        storeValue = String(massStar);
        sessionStorage.setItem(storeName, storeValue);
    } else {
        //
        //console.log("No Web Storage support.  Everything will take longer...");
        //
    }


//
//
//
// *****************************
// 
//
    // Line profile section:
//
//
//
//


    // Set up grid of line lambda points sampling entire profile (cm):
    var numCore = 5; //per wing
    var numWing = 15; // half-core
    //var numWing = 0;  //debug
    var numPoints = 2 * (numCore + numWing) - 1; // + 1;  //Extra wavelength point at end for monochromatic continuum tau scale
    //linePoints: Row 0 in cm (will need to be in nm for Plack.planck), Row 1 in Doppler widths
    var linePoints = lineGrid(lam0, mass, xiT, numDeps, teff, numCore, numWing,
            logGammaCol, tauRos, temp, press, tempSun, pressSun); //cm

// Get Einstein coefficinet for spontaneous de-excitation from f_ij to compute natural 
// (radiation) roadening:  Assumes ration of statisitcal weight, g_j/g_i is unity
    var logAij = Math.log(6.67e13) + Math.log(10.0)*logF - 2.0*Math.log(1.0e7*lam0);
    //console.log("logAij " + logE*logAij);
    ////
    //Compute area-normalized depth-independent line profile "phi_lambda(lambda)"
    if (ifVoigt === true) {
        //console.log("voigt2 called");
        var lineProf = voigt2(linePoints, lam0, logAij, logGammaCol,
                numDeps, teff, tauRos, temp, press, tempSun, pressSun);
    } else {
        //console.log("voigt called");
        var lineProf = voigt(linePoints, lam0, logAij, logGammaCol,
                numDeps, teff, tauRos, temp, press, tempSun, pressSun);
    }

//
// Level population now computed in LevelPops.levelPops()

//
//var logNums = levelPops(lam0, logN, Ne, ionized, chiI, chiL, linePoints, lineProf,
//        numDeps, kappaScale, tauRos, temp, rho);
    var logNums = levelPops(lam0, logN, Ne, ionized, chiI1, chiI2, chiL, gw1, gw2, gwL,
            numDeps, kappaScale, tauRos, temp, rho);
    //
    //Compute depth-dependent logarithmic monochromatic extinction co-efficient, kappa_lambda(lambda, tauRos):
    //Handing in rhoSun instead of rho here is a *weird* fake to get line broadening to scale with logg 
    //approximately okay for saturated lines:   There's something wrong!              
    var logKappaL = lineKap(lam0, logNums, logF, linePoints, lineProf,
            numDeps, kappaScale, tauRos, temp, rhoSun);
    var logTotKappa = lineTotalKap(linePoints, logKappaL, numDeps, kappaScale, kappa);
    //
    //Compute monochromatic optical depth scale, Tau_lambda throughout line profile
    //CAUTION: Returns numPoints+1 x numDeps array: the numPoints+1st row holds the line centre continuum tau scale
    // Method 1: double logTauL[][] = LineTau.tauLambda(numDeps, lineProf, logKappaL,
    // Method 1:        kappa, tauRos, rho, depths);
    // Method 2:
    //var logTauL = tauLambda(numDeps, linePoints, logKappaL,
    //        kappa, tauRos, rhoSun);
    var logTauL = tauLambda(numDeps, numPoints, logTotKappa,
            kappa, tauRos);
    //Evaluate formal solution of rad trans eq at each lambda throughout line profile
    // Initial set to put lambda and tau arrays into form that formalsoln expects
    //var numPoints = linePoints[0].length + 1; //Extra wavelength point at end for monochromatic continuum tau scale

    var lineLambdas = [];
    lineLambdas.length = numPoints;
    //Can't avoid Array constructor here:
    var lineIntens = new Array(numPoints);
    for (var row = 0; row < numPoints; row++) {
        lineIntens[row] = new Array(numThetas);
    }

    var lineIntensLam = [];
    lineIntensLam.length = numThetas;
    var lineFlux = [];
    lineFlux.length = 2;
    lineFlux[0] = [];
    lineFlux[0].length = numPoints;
    lineFlux[1] = [];
    lineFlux[1].length = numPoints;
    var lineFluxLam = [];
    lineFluxLam.length = 2;
    if (ifScatt === true) {
        lineMode = true;
    } else {
        lineMode = false;
    }
    for (var il = 0; il < numPoints; il++) {


//if (il ==== numPoints - 1) {
//    lineLambdas[il] = lam0; // Extra row for line centre continuum taus scale
//} else {
//lineLambdas[il] = (1.0E7 * linePoints[0][il]) + lam0; //convert back to nm
        lineLambdas[il] = linePoints[0][il] + lam0;
        //}

        for (var id = 0; id < numDeps; id++) {
            thisTau[1][id] = logTauL[il][id];
            thisTau[0][id] = Math.exp(logTauL[il][id]);
        } // id loop

        lineIntensLam = formalSoln(numDeps,
                cosTheta, lineLambdas[il], thisTau, temp, lineMode);
        lineFluxLam = flux2(lineIntensLam, cosTheta);
        for (var it = 0; it < numThetas; it++) {
            lineIntens[il][it] = lineIntensLam[it];
        } //it loop - thetas

        lineFlux[0][il] = lineFluxLam[0];
        lineFlux[1][il] = lineFluxLam[1];
    } //il loop

//Continuum rectify line spectrum:
//
  var contFlux2 = interpolV(contFlux[0], lambdaScale, lineLambdas);
  var lineFlux2 = [];
  lineFlux2.length = 2;
  lineFlux2[0] = []; 
  lineFlux2[1] = []; 
  lineFlux2[0].length = numPoints;
  lineFlux2[1].length = numPoints;
  for (var i = 0; i < numPoints; i++){
     lineFlux2[0][i] = lineFlux[0][i] / contFlux2[i];
     lineFlux2[1][i] = Math.log(lineFlux2[0][i]);
   }


//Continuum flux at line centre for Eq width calculation:
//var ilLam0 = lamPoint(numLams, lambdaScale, lam0);
// Solve formal sol of rad trans eq for outgoing surfaace I(0, theta)

//var intensCont = [];
//intensCont.length = numThetas;
//var fluxCont = [];
//fluxCont.length = 2;
//double[][] intens = new double[numLams][numThetas];
//double[][] flux = new double[2][numLams];
//  double[][] intens = new double[3][numThetas];
//double[][] flux = new double[2][3];
//double lambda1, lambda2, fluxSurfBol, logFluxSurfBol;
//fluxSurfBol = 0;
    //lineMode = false;
    //for (int il = ilLam0-1; il <= ilLam0+1; il++) {
    //System.out.println("il " + il + " lambdaScale[il] " + lambdaScale[il]);
    //intensCont = formalSoln(numDeps,
    //         cosTheta, lambdaScale[ilLam0], tauRos, temp, lineMode);
    //fluxCont = flux2(intensCont, cosTheta);
//Get equivalent width, W_lambda, in pm - picometers:
    var Wlambda = eqWidth(lineFlux2, linePoints, lam0); //, fluxCont);
//
//
//
//
    // if JQuery-UI round sliders not available:  
    // displayAll();

// *********************



// Text output section:

//    
// Set up the canvas:
//

    // **********  Basic canvas parameters: These are numbers in px - needed for calculations:
    // All plots and other output must fit within this region to be white-washed between runs

    var xRangeT = 1550;
    var yRangeT = 65;
    var xOffsetT = 10;
    var yOffsetT = 10;
    var charToPxT = 4; // width of typical character font in pixels - CAUTION: finesse!

    var zeroInt = 0;
    //these are the corresponding strings ready to be assigned to HTML style attributes


    var xRangeTStr = numToPxStrng(xRangeT);
    var yRangeTStr = numToPxStrng(yRangeT);
    var xOffsetTStr = numToPxStrng(xOffsetT);
    var yOffsetTStr = numToPxStrng(yOffsetT);
    // Very first thing on each load: White-wash the canvas!!
    var roundNum, remain;
    // R & L_Bol:
    var colr = 0;
    var xTab = 60;

    roundNum = radius.toPrecision(3);
    txtPrint("<span title='Stellar radius'><em>R</em> = </span> "
            + roundNum
            + " <span title='Solar radii'>\n\
<a href='http://en.wikipedia.org/wiki/Solar_radius' target='_blank'><em>R</em><sub>Sun</sub></a>\n\
</span> ",
            20 + colr * xTab, 15, lineColor, textId);
    roundNum = bolLum.toPrecision(3);
    txtPrint("<span title='Bolometric luminosity'>\n\
<a href='http://en.wikipedia.org/wiki/Luminosity' target='_blank'><em>L</em><sub>Bol</sub></a> = \n\
</span> "
            + roundNum
            + " <span title='Solar luminosities'>\n\
<a href='http://en.wikipedia.org/wiki/Solar_luminosity' target='_blank'><em>L</em><sub>Sun</sub></a>\n\
</span> ",
            20 + colr * xTab, 40, lineColor, textId);
// 
// Equivalent width:
    roundNum = Wlambda.toFixed(2);
    txtPrint("<span title='Equivalent width: A measure of spectral line strength'>\n\
Spectral line \n\
<a href='http://en.wikipedia.org/wiki/Equivalent_width' target='_blank'>W<sub><em>&#955</em></sub></a>: \n\
</span>"
            + roundNum
            + " <span title='picometers'>\n\
<a href='http://en.wikipedia.org/wiki/Picometre' target='_blank'>pm</a>\n\
</span>",
            180, 40, lineColor, textId);
    ////remain = (Wlambda * 1000.0) % 10;
    ////roundNum = (Wlambda) - (remain / 1000.0);

    //roundNum = Wlambda.toFixed(2);
    //numPrint(roundNum, 330, 40, zeroInt, zeroInt, zeroInt, textId); //debug
    //txtPrint("<span title='picometers'><a href='http://en.wikipedia.org/wiki/Picometre' target='_blank'>pm</a></span>", 370, 40, zeroInt, zeroInt, zeroInt, textId);

    // UBVRI indices
    var xTab = 80;
    var colr = 0;
    var roundNum0 = colors[0].toFixed(2);
    var roundNum1 = colors[1].toFixed(2);
    var roundNum2 = colors[2].toFixed(2);
    var roundNum3 = colors[3].toFixed(2);
    var roundNum4 = colors[4].toFixed(2);
    txtPrint("<a href='http://en.wikipedia.org/wiki/UBV_photometric_system' title='Johnson-Cousins U-B photometric color index' target='_blank'>\n\
<span style='color:purple'>U</span>-" +
            "<span style='color:blue'>B\n\
</span>\n\
</a>: " + roundNum0
            + " <a href='http://en.wikipedia.org/wiki/UBV_photometric_system' title='Johnson-Cousins B-V photometric color index' target='_blank'>\n\
<span style='color:blue'>B\n\
</span>-" +
            "<span style='color:#00FF88'>V</span></a>: " + roundNum1
            + " <a href='http://en.wikipedia.org/wiki/UBV_photometric_system' title='Johnson-Cousins V-R photometric color index' target='_blank'>\n\
<span style='color:#00FF88'>V\n\
</span>-" +
            "<span style='color:red'>R\n\
</span>\n\
</a>: " + roundNum2
            + " <a href='http://en.wikipedia.org/wiki/UBV_photometric_system' title='Johnson-Cousins V-I photometric color index' target='_blank'>\n\
<span style='color:#00FF88'>V\n\
</span>-" +
            "<span style='color:red'>I\n\
</span>\n\
</a>: " + roundNum3
            + " <a href='http://en.wikipedia.org/wiki/UBV_photometric_system' title='Johnson-Cousins R-I photometric color index' target='_blank'>\n\
<span style='color:red'>R</span>-" +
            "<span style='color:brown'>I\n\
</span>\n\
</a>: " + roundNum4, 180 + colr * xTab, 15, lineColor, textId);
    // Echo back the *actual* input parameters:
    var warning = "";
    if (teff < 6000) {
        //warning = "<span style='color:red'><em>T</em><sub>eff</sub> < 6000 K <br />Cool star mode";
        warning = "<span style='color:red'>Cool star mode</span>";
        txtPrint(warning, 600, 10, lineColor, textId);
    } else {
        //warning = "<span style='color:blue'><em>T</em><sub>eff</sub> > 6000 K <br />Hot star mode</span>";
        warning = "<span style='color:blue'>Hot star mode</span>";
        txtPrint(warning, 600, 10, lineColor, textId);
    }

    var spectralClass = " ";
    var luminClass = "V";
    if (teff < 3000.0) {
        spectralClass = "L";
    } else if ((teff >= 3000.0) && (teff < 3900.0)) {
        spectralClass = "M";
    } else if ((teff >= 3900.0) && (teff < 5200.0)) {
        spectralClass = "K";
    } else if ((teff >= 5200.0) && (teff < 5950.0)) {
        spectralClass = "G";
    } else if ((teff >= 5950.0) && (teff < 7300.0)) {
        spectralClass = "F";
    } else if ((teff >= 7300.0) && (teff < 9800.0)) {
        spectralClass = "A";
    } else if ((teff >= 9800.0) && (teff < 30000.0)) {
        spectralClass = "B";
    } else if (teff >= 30000.0) {
        spectralClass = "O";
    }

    if ((logg >= 0.0) && (logg < 1.0)) {
        luminClass = "I";
    } else if ((logg >= 1.0) && (logg < 1.5)) {
        luminClass = "II";
    } else if ((logg >= 1.5) && (logg < 3.0)) {
        luminClass = "III";
    } else if ((logg >= 3.0) && (logg < 4.0)) {
        luminClass = "IV";
    } else if ((logg >= 4.0) && (logg < 5.0)) {
        luminClass = "V";
    } else if ((logg >= 5.0) && (logg < 6.0)) {
        luminClass = "VI";
    } else if ((logg >= 5.0)){
        luminClass = "WD";
    }

    var spectralType = "<a href='https://en.wikipedia.org/wiki/Stellar_classification' title='MK Spectral type' target='_blank'>" +
            spectralClass + " " + luminClass +
            "</a>";
    txtPrint(spectralType, 600, 40, lineColor, textId);
    xTab = 140;
    var outString, fullNum, j;
    //var numReportable = numInputs - numPreStars - numPreLines - -numPrePlanets - numPerfModes - 1;
    var echoText = "<table><tr>  ";
    //  var setName = ""; //initialization

    for (var i = 0; i < numInputs - 1; i++) {

        var fullNum = settingsId[i].value;
        //roundNum = fullNum.toPrecision(2);
        roundNum = fullNum;
        //console.log("i " + i + " settingsId[i].name " + settingsId[i].name + " settingsId[i].value " + settingsId[i].value + " fullNum " + fullNum + " roundNum " + roundNum);
        if (flagArr[i]) {
            outString = "<td>   <span style='color:red'>   " + settingsId[i].name + "</br>" + roundNum.toString(10) + "   </span>   </td>";
            //outString = "<td>   <span style='color:red'>   " + setName + "</br>" + roundNum.toString(10) + "   </span>   </td>";
        } else {
            outString = "<td>   <span style='color:black'>   " + settingsId[i].name + "</br>" + roundNum.toString(10) + "   </span>   </td>";
            //outString = "<td>   <span style='color:black'>   " + setName + "</br>" + roundNum.toString(10) + "   </span>   </td>";
        }
        //if (i === numReportable / 2){
        //    echoText = echoText + "</tr><tr>";  // New row
        //};
        echoText = echoText + "   " + outString + "   ";
    }  // i loop

    echoText = echoText + "  </tr></table>";
    txtPrint(echoText, 750, 10, lineColor, textId);

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
    var wColor = "#F0F0F0";  

    var charToPx = 4; // width of typical character font in pixels - CAUTION: finesse!

//
//  function washer() creates and inserts a panel into the HTML doc 
//   AND erases it by "gray-washing" it upon each re-execution of the script 
    var washer = function(plotRow, plotCol, wColor, areaId, cnvsId) {
        // Very first thing on each load: gray-wash the canvas!!

// Browser viewport coordinates for upper left corner of panel:
        panelX = xOffset + plotCol * spacingX; 
        panelY = yOffsetT + yRangeT +
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
        cnvsId.style.position = "absolute";
        cnvsId.style.width = panelWidthStr;
        cnvsId.style.height = panelHeightStr;
        //cnvsId.style.marginTop = panelYStr;
        //cnvsId.style.marginLeft = panelXStr;
        cnvsId.style.opacity = "1.0";
        cnvsId.style.backgroundColor = wColor;
        cnvsId.style.zIndex = 0;
        //cnvsId.style.border = "1px gray solid";
        //Wash the canvas:
        areaId.appendChild(cnvsId);

        var panelOrigin = [panelX, panelY];

        return panelOrigin;

    };

//
//
// These global parameters are for the HTML5 <canvas> element 
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
//Default one thickness of plot elements:
  var lineThick = 1;
//
    //
    //
    //
    //
    // *******************************************
    //
    //
    //  This section has global physics related quantities needed for content of plots
    //
    // Line center, lambda_0 

    var keyLambds = halfPower(numPoints, lineFlux2);
    var numDeps = tauRos[0].length;

    //
    //Initialize *physical* quantities needed for various plots - plots are now all in if(){} blocks
    // so all this now has to be initialized ahead of time:
    // Will need this in some if blocks below:
    var tTau1 = tauPoint(numDeps, tauRos, 1.0);
    var iLamMinMax = minMax2(masterFlux);
    var iLamMax = iLamMinMax[1];
    var norm = 1.0e15; // y-axis normalization
    var wien = 2.8977721E-1; // Wien's displacement law constant in cm K
    var lamMax = 1.0e7 * (wien / teff);
    lamMax = lamMax.toPrecision(5);
    var lamMaxStr = lamMax.toString(10);
    var bandIntens = iColors(masterLams, masterIntens, numThetas, numMaster);

    var tuneBandIntens = tuneColor(masterLams, masterIntens, numThetas, numMaster, diskLambda, diskSigma, lamUV, lamIR);

    //Vega's disk center values of B, V, R intensity normalized by B+V+R:
    //var vegaBVR = [1.0, 1.0, 1.0]; //for now
    //console.log("Vega: rr " + vegaBVR[2] +
    //        " gg " + vegaBVR[1] +
    //        " bb " + vegaBVR[0]);
    var rgbVega = [183.0 / 255.0, 160.0 / 255.0, 255.0 / 255.0];
    var bvr = bandIntens[2][0] + bandIntens[3][0] + bandIntens[4][0];
    //console.log("bandIntens[2][0]/bvr " + bandIntens[2][0] / bvr + " bandIntens[3][0]/bvr " + bandIntens[3][0] / bvr + " bandIntens[4][0]/bvr " + bandIntens[4][0] / bvr);
    //console.log("Math.max(bandIntens[2][0]/bvr, bandIntens[3][0]/bvr, bandIntens[4][0]/bvr) " + Math.max(bandIntens[2][0] / bvr, bandIntens[3][0] / bvr, bandIntens[4][0] / bvr));
    var brightScale = 255.0 / Math.max(bandIntens[2][0] / bvr, bandIntens[3][0] / bvr, bandIntens[4][0] / bvr);
    var saveRGB = []; //intialize
    var saveRadius = 0.0; //initialize
    var radiusScale = 10; //solar_radii-to-pixels!
    var logScale = 50; //amplification factor for log pixels
    // 
    // Star radius in pixels:
    //    var radiusPx = (radiusScale * radius);  //linear radius
    var radiusPx = logScale * logTen(radiusScale * radius); //logarithmic radius
    radiusPx = Math.ceil(radiusPx);
    var i = 3;
    var ii = 1.0 * i;
    // LTE Eddington-Barbier limb darkening: I(Tau=0, cos(theta)=t) = B(T(Tau=t))
    var cosFctr = cosTheta[1][i];
    var radiusPxI = Math.ceil(radiusPx * Math.sin(Math.acos(cosFctr)));
    var radiusStr = numToPxStrng(radiusPxI);
    saveRadius = radiusPxI; // For HRD, plot nine
    var i = Math.ceil(numThetas / 2);
    var rrI = Math.ceil(brightScale * (bandIntens[4][i] / bvr) / rgbVega[0]); // / vegaBVR[2]);
    var ggI = Math.ceil(brightScale * (bandIntens[3][i] / bvr) / rgbVega[1]); // / vegaBVR[1]);
    var bbI = Math.ceil(brightScale * (bandIntens[2][i] / bvr) / rgbVega[2]); // / vegaBVR[0]);
    //console.log(" rrI: " + rrI + " ggI: " + ggI + " bbI: " + bbI + " dark: " + dark);
    var RGBArr = [];
    RGBArr.length = 3;
    RGBArr[0] = rrI;
    RGBArr[1] = ggI;
    RGBArr[2] = bbI;
    saveRGB = RGBArr; // For HRD, plot nine

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
            xFinesse, color, areaId, cnvsCtx) {

        var yBarPosCnvs = yAxisLength * (yVal - minYDataIn) / (maxYDataIn - minYDataIn);
        //       xTickPos = xTickPos;

        var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yBarPosCnvs;

// Make the y-tick mark, Teff:
        cnvsCtx.beginPath();
        cnvsCtx.strokeStyle=color; 
        cnvsCtx.moveTo(yAxisXCnvs, yShiftCnvs);
        cnvsCtx.lineTo(yAxisXCnvs + barWidthCnvs, yShiftCnvs);
        cnvsCtx.stroke();  
//
        return yShiftCnvs;
    };
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
            yFinesse, color, areaId, cnvsCtx) {

        var xBarPosCnvs = xAxisLength * (xVal - minXDataIn) / (maxXDataIn - minXDataIn);
        var xShiftCnvs = xAxisXCnvs + xBarPosCnvs;
        var yBarPosCnvs = yAxisYCnvs + yFinesse; 

// Make the x-tick mark, Teff:
        cnvsCtx.beginPath();
        cnvsCtx.strokeStyle=color; 
        cnvsCtx.moveTo(xShiftCnvs, yBarPosCnvs);
        cnvsCtx.lineTo(xShiftCnvs, yBarPosCnvs + barHeightCnvs);
        cnvsCtx.stroke();  
        
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
            areaId, cnvsCtx) {

        var axisParams = [];
        axisParams.length = 8;
        // Variables to handle normalization and rounding:
        var numParts = [];
        numParts.length = 2;

        //axisParams[5] = xLowerYOffset;
//
        cnvsCtx.beginPath();
        cnvsCtx.strokeStyle=lineColor; //black
        cnvsCtx.fillStyle=lineColor; //black
        cnvsCtx.moveTo(xAxisXCnvs, xAxisYCnvs);
        cnvsCtx.lineTo(xAxisXCnvs + xAxisLength, xAxisYCnvs);
        cnvsCtx.stroke();  
//
        numParts = standForm(minXDataIn);
        //mantissa = rounder(numParts[0], 1, "down");
        //minXData = mantissa * Math.pow(10.0, numParts[1]);
        var mantissa0 = numParts[0];
        var exp0 = numParts[1];
        //numParts = standForm(maxXDataIn);
        //mantissa = rounder(numParts[0], 1, "up");
        //maxXData = mantissa * Math.pow(10.0, numParts[1]);
        var mantissa1 = maxXDataIn / Math.pow(10.0, exp0);
        //var rangeXData = maxXData - minXData;
        var reverse = false; //initialization
        var rangeXData = mantissa1 - mantissa0;
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
        } else if ((rangeXData >= 1000.0) && (rangeXData < 20000.0)) {
            deltaXData = 2000.0;
        } else if ((rangeXData >= 250.0) && (rangeXData < 1000.0)) {
            deltaXData = 200.0;
        } else if ((rangeXData >= 100.0) && (rangeXData < 250.0)) {
            deltaXData = 20.0;
        } else if ((rangeXData >= 50.0) && (rangeXData < 100.0)) {
            deltaXData = 10.0;
        } else if ((rangeXData >= 20.0) && (rangeXData < 50.0)) {
            deltaXData = 5.0;
        } else if ((rangeXData >= 8.0) && (rangeXData < 20.0)) {
            deltaXData = 2.0;
        } else if ((rangeXData > 5.0) && (rangeXData <= 8.0)) {
            deltaXData = 0.5;
        } else if ((rangeXData > 2.0) && (rangeXData <= 5.0)) {
            deltaXData = 0.5;
        } else if ((rangeXData > 0.5) && (rangeXData <= 2.0)) {
            deltaXData = 0.5;
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
        //numParts = standForm(deltaXData);
        //mantissa = rounder(numParts[0], 1, "down");
        //deltaXData = mantissa * Math.pow(10.0, numParts[1]);
        var deltaXPxl = panelWidth / (numXTicks - 1);
        var deltaXPxlCnvs = xAxisLength / (numXTicks - 1);

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

            cnvsCtx.beginPath();
            cnvsCtx.fillStyle=lineColor; //black
            cnvsCtx.strokeStyle=lineColor; //black
            cnvsCtx.moveTo(xShiftCnvs, xAxisYCnvs + xTickYOffset);
            cnvsCtx.lineTo(xShiftCnvs, xAxisYCnvs + xTickYOffset + tickLength);
            cnvsCtx.stroke();            //test

            //Make the tick label, Teff:
            cnvsCtx.font="normal normal normal 8pt arial";
            cnvsCtx.fillText(xTickValStr, xShiftCnvs, xAxisYCnvs + xValYOffset);
            
        }  // end x-tickmark loop


// Add name of x-axis:
//Axis label still needs to be html so we can use mark-up
        xAxisNameX = panelX + xAxisNameOffsetX;
        xAxisNameY = panelY + xAxisNameOffsetY;
        txtPrint("<span style='font-size:small'>" + xAxisName + "</span>",
                xAxisNameOffsetX, xAxisNameOffsetY, lineColor, areaId);

     // cnvsCtx.font="normal normal normal 12pt arial";
     // cnvsCtx.fillText(xAxisName, xNameXOffsetThisCnvs, xNameYOffsetCnvs);
        
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
            areaId, cnvsCtx) {

        var axisParams = [];
        axisParams.length = 8;
        // Variables to handle normalization and rounding:
        var numParts = [];
        numParts.length = 2;

        //axisParams[5] = xLowerYOffset;
        // Create the LEFT y-axis element and set its style attributes:

        cnvsCtx.beginPath();
        cnvsCtx.fillStyle=lineColor; //black
        cnvsCtx.strokeStyle=lineColor; //black
        cnvsCtx.moveTo(yAxisXCnvs, yAxisYCnvs);
        cnvsCtx.lineTo(yAxisXCnvs, yAxisYCnvs + yAxisLength);
        cnvsCtx.stroke();  
        
        numParts = standForm(minYDataIn);
        //mantissa = rounder(numParts[0], 1, "down");
        //minYData = mantissa * Math.pow(10.0, numParts[1]);
        var mantissa0 = numParts[0];
        var exp0 = numParts[1];
        //numParts = standForm(maxYDataIn);
        //mantissa = rounder(numParts[0], 1, "up");
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
        } else if (rangeYData <= 0.1) {
            deltaYData = 0.02;
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
        //numParts = standForm(deltaYData);
        //mantissa = rounder(numParts[0], 1, "down");
        //deltaYData = mantissa * Math.pow(10.0, numParts[1]);
        var deltaYPxl = panelHeight / (numYTicks - 1);
        var deltaYPxlCnvs = yAxisLength / (numYTicks - 1);
        axisParams[1] = rangeYData2;
        axisParams[2] = deltaYData;
        axisParams[3] = deltaYPxl;
        axisParams[6] = minYData2;
        axisParams[7] = maxYData2;
        //
        cnvsCtx.fillStyle=lineColor; //black
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
           cnvsCtx.beginPath();
           cnvsCtx.fillStyle=lineColor; //black
           cnvsCtx.strokeStyle=lineColor; //black
           cnvsCtx.moveTo(yAxisXCnvs + yTickXOffset, yShiftCnvs);
           cnvsCtx.lineTo(yAxisXCnvs + yTickXOffset + tickLength, yShiftCnvs);
           cnvsCtx.stroke();    
            

            //Make the y-tick label:
         cnvsCtx.font="normal normal normal 8pt arial";
         cnvsCtx.fillText(yTickValStr, yAxisXCnvs + yValXOffset, yShiftCnvs);

        }  // end y-tickmark loop, j

// Add name of LOWER y-axis:

//Axis label still need to be html so we can use mark-up
        yAxisNameX = panelX + yAxisNameOffsetX;
        yAxisNameY = panelY + yAxisNameOffsetY;
        txtPrint("<span style='font-size:x-small'>" + yAxisName + "</span>",
                yAxisNameOffsetX, yAxisNameOffsetY, lineColor, areaId);

        return axisParams;

    };

    //   var testVal = -1.26832e7;
    //   var numParts = standForm(testVal);
//
    //   var roundVal = rounder(numParts[0], 1, "up");

    var xFinesse = 0.0; //default initialization
    var yFinesse = 0.0; //default initialization

    //
//
//  *****   PLOT SEVEN / PLOT 7
//
//

// Plot seven - image of limb-darkened and limb-colored WHITE LIGHT stellar disk
//
    if (ifLineOnly === false) {

        var plotRow = 0;
        var plotCol = 0;

        var panelOrigin = washer(plotRow, plotCol, wColor, plotSevenId, cnvsSevenId);
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
        cnvsSevenCtx.fillStyle = wColor;
        cnvsSevenCtx.fillRect(0, 0, panelWidth, panelHeight);

        var thet1, thet2;
        var thet3;

        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Limb_darkening' target='_blank'>White light disk</a></span> <br />\n\
     <span style='font-size:small'>(Logarithmic radius) </span>",
                titleOffsetX, titleOffsetY, lineColor, plotSevenId);
            txtPrint("<span style='font-size:normal; color:black'><em>&#952</em> = </span>",
                150 + titleOffsetX, titleOffsetY, lineColor, plotSevenId);

// Adjust position to center star:
// Radius is really the *diameter* of the symbol
            var yCenterCnvs = panelHeight / 2; 
            var xCenterCnvs = panelWidth / 2; 
        //  Loop over limb darkening sub-disks - largest to smallest
        for (var i = numThetas - 1; i >= 1; i--) {

            ii = 1.0 * i;
            // LTE Eddington-Barbier limb darkening: I(Tau=0, cos(theta)=t) = B(T(Tau=t))
            var cosFctr = cosTheta[1][i];
            var radiusPxICnvs = Math.ceil(radiusPx * Math.sin(Math.acos(cosFctr)));
            var cosFctrNext = cosTheta[1][i-1];
            var radiusPxICnvsNext = Math.ceil(radiusPx * Math.sin(Math.acos(cosFctrNext)));

            rrI = Math.ceil(brightScale * (bandIntens[4][i] / bvr) / rgbVega[0]); // / vegaBVR[2]);
            ggI = Math.ceil(brightScale * (bandIntens[3][i] / bvr) / rgbVega[1]); // / vegaBVR[1]);
            bbI = Math.ceil(brightScale * (bandIntens[2][i] / bvr) / rgbVega[2]); // / vegaBVR[0]);
            var rrINext = Math.ceil(brightScale * (bandIntens[4][i-1] / bvr) / rgbVega[0]); // / vegaBVR[2]);
            var ggINext = Math.ceil(brightScale * (bandIntens[3][i-1] / bvr) / rgbVega[1]); // / vegaBVR[1]);
            var bbINext = Math.ceil(brightScale * (bandIntens[2][i-1] / bvr) / rgbVega[2]); // / vegaBVR[0]);

            var RGBHex = colHex(rrI, ggI, bbI);
            var RGBHexNext = colHex(rrINext, ggINext, bbINext);
            cnvsSevenCtx.beginPath();
            //cnvsSevenCtx.strokeStyle = RGBHex;
            var grd=cnvsSevenCtx.createRadialGradient(xCenterCnvs, yCenterCnvs, radiusPxICnvs,
                      xCenterCnvs, yCenterCnvs, radiusPxICnvsNext);
            grd.addColorStop(0, RGBHex);
            grd.addColorStop(1, RGBHexNext);
//            cnvsSevenCtx.fillStyle=RGBHex;
            cnvsSevenCtx.fillStyle = grd;
            cnvsSevenCtx.arc(xCenterCnvs, yCenterCnvs, radiusPxICnvs, 0, 2*Math.PI);
            //cnvsSevenCtx.stroke();
            cnvsSevenCtx.fill();
            //
            //Angle indicators
            if ((i % 2) === 0) {
                thet1 = 180.0 * Math.acos(cosTheta[1][i]) / Math.PI;
                thet2 = thet1.toPrecision(2);
                thet3 = thet2.toString(10);
                txtPrint("<span style='font-size:small; background-color:#888888'>" + thet3 + "</span>",
                        150 + titleOffsetX + (i + 2) * 10, titleOffsetY, RGBHex, plotSevenId);
            }
//
        }

    }

//
//  *****   PLOT TWELVE / PLOT 12
//
//

// Plot twelve - image of limb-darkened and limb-colored TUNABLE MONOCHROMATIC stellar disk

    if (ifLineOnly === false) {

        var plotRow = 1;
        var plotCol = 0;

//radius parameters in pixel all done above now:
//        var radiusScale = 20; //solar_radii-to-pixels!
//        var logScale = 100; //amplification factor for log pixels
//        // 
//        // Star radius in pixels:
//        //    var radiusPx = (radiusScale * radius);  //linear radius
//        var radiusPx = logScale * logTen(radiusScale * radius); //logarithmic radius
//        radiusPx = Math.ceil(radiusPx);
        var thet1, thet2;
        var thet3;
        var panelOrigin = washer(plotRow, plotCol, wColor, plotTwelveId, cnvsTwelveId);
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
        cnvsTwelveCtx.fillStyle = wColor;
        cnvsTwelveCtx.fillRect(0, 0, panelWidth, panelHeight);
        // Add title annotation:

        //var titleYPos = xLowerYOffset - 1.15 * yRange;
        //var titleXPos = 1.02 * xOffset;

        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Limb_darkening' target='_blank'>Gaussian filter</a></span><span style='font-size:small'> &#955 = " + diskLambda + " nm</span> </br>\n\
     <span style='font-size:small'>(Logarithmic radius) </span>",
                titleOffsetX, titleOffsetY + 20, lineColor, plotTwelveId);
        txtPrint("<span style='font-size:normal; color:black'><em>&#952</em> = </span>",
                220 + titleOffsetX, titleOffsetY + 20, lineColor, plotTwelveId);
        var ilLam0 = lamPoint(numMaster, masterLams, 1.0e-7 * diskLambda);
        var lambdanm = masterLams[ilLam0] * 1.0e7; //cm to nm
        //console.log("PLOT TWELVE: ilLam0=" + ilLam0 + " lambdanm " + lambdanm);
        var minZData = 0.0;
        //var maxZData = masterIntens[ilLam0][0] / norm;
        var maxZData = tuneBandIntens[0] / norm;
        var rangeZData = maxZData - minZData;

// Adjust position to center star:
// Radius is really the *diameter* of the symbol
            var yCenterCnvs = panelHeight / 2; 
            var xCenterCnvs = panelWidth / 2; 
        //  Loop over limb darkening sub-disks - largest to smallest
        for (var i = numThetas - 1; i >= 1; i--) {

            ii = 1.0 * i;
            // LTE Eddington-Barbier limb darkening: I(Tau=0, cos(theta)=t) = B(T(Tau=t))
            var cosFctr = cosTheta[1][i];
            var radiusPxICnvs = Math.ceil(radiusPx * Math.sin(Math.acos(cosFctr)));
            var cosFctrNext = cosTheta[1][i-1];
            var radiusPxICnvsNext = Math.ceil(radiusPx * Math.sin(Math.acos(cosFctrNext)));
            //logarithmic z:
            //zLevel = (logE * masterIntens[1lLam0][i] - minZData) / rangeZData;
//linear z:


            //var zLevel = ((masterIntens[ilLam0][i] / norm) - minZData) / rangeZData;
            //var zLevelNext = ((masterIntens[ilLam0][i-1] / norm) - minZData) / rangeZData;
            var zLevel = ((tuneBandIntens[i] / norm) - minZData) / rangeZData;
            var zLevelNext = ((tuneBandIntens[i-1] / norm) - minZData) / rangeZData;

            //console.log("lambdanm " + lambdanm + " zLevel " + zLevel);

            RGBHex = lambdaToRGB(lambdanm, zLevel);
            RGBHexNext = lambdaToRGB(lambdanm, zLevelNext);

            cnvsTwelveCtx.beginPath();
            //cnvsSevenCtx.strokeStyle = RGBHex;
            var grd=cnvsTwelveCtx.createRadialGradient(xCenterCnvs, yCenterCnvs, radiusPxICnvs,
                      xCenterCnvs, yCenterCnvs, radiusPxICnvsNext);
            grd.addColorStop(0, RGBHex);
            grd.addColorStop(1, RGBHexNext);
//            cnvsSevenCtx.fillStyle=RGBHex;
            cnvsTwelveCtx.fillStyle = grd;
            cnvsTwelveCtx.arc(xCenterCnvs, yCenterCnvs, radiusPxICnvs, 0, 2*Math.PI);
            //cnvsSevenCtx.stroke();
            cnvsTwelveCtx.fill();
            //
            //Angle indicators
            if ((i % 2) === 0) {
                thet1 = 180.0 * Math.acos(cosTheta[1][i]) / Math.PI;
                thet2 = thet1.toPrecision(2);
                thet3 = thet2.toString(10);
                txtPrint("<span style='font-size:small; background-color:#888888'>" + thet3 + "</span>",
                       220 + titleOffsetX + (i + 2) * 10, titleOffsetY + 20, RGBHex, plotTwelveId);
            }
//
        }
    }

    //
    //
    //  *****   PLOT TEN / PLOT 10
    //
    //
    // Plot Ten: Spectrum image

    if (ifLineOnly === false) {

        var plotRow = 0;
        var plotCol = 1;

        var minXData = 380.0; // (nm) blue
        var maxXData = 680.0; // (nm) red
        //var midXData = (minXData + maxXData) / 2.0;  // "green"


        //var xAxisName = "&#955 (nm)";
        var xAxisName = " ";
        //now done above var norm = 1.0e15; // y-axis normalization
        //var minYData = 0.0;
        // iLamMax established in PLOT TWO above:
        //var maxYData = masterFlux[0][iLamMax] / norm;
        // y-axis is just the arbitrary vertical scale - has no data significance
        var minYData = 0.0;
        var maxYData = 1.0;
        //
        //z-axiz (out of the screen) is really intensity level
        //Logarithmic z:
        //var minZData = 12.0;
        //var maxZData = logE * masterFlux[1][iLamMax];
        //Linear z:
        var ilLam0 = lamPoint(numMaster, masterLams, 1.0e-7 * minXData);
        var ilLam1 = lamPoint(numMaster, masterLams, 1.0e-7 * maxXData);
        var minZData = 0.0;
        var maxZData = masterFlux[0][iLamMax] / norm;
        //Make sure spectrum is normalized to brightest displayed lambda haveing level =255
        // even when lambda_Max is outside displayed lambda range:
        if (iLamMax < ilLam0) {
            maxZData = masterFlux[0][ilLam0] / norm;
        }
        if (iLamMax > ilLam1) {
            maxZData = masterFlux[0][ilLam1] / norm;
        }
        var rangeZData = maxZData - minZData;
        //var yAxisName = "<span title='Monochromatic surface flux'><a href='http://en.wikipedia.org/wiki/Spectral_flux_density' target='_blank'>Log<sub>10</sub> <em>F</em><sub>&#955</sub> <br /> ergs s<sup>-1</sup> cm<sup>-3</sup></a></span>";

        
        var fineness = "normal";
        var panelOrigin = washer(plotRow, plotCol, wColor, plotTenId, cnvsTenId);
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
        cnvsTenCtx.fillStyle = wColor;
        cnvsTenCtx.fillRect(0, 0, panelWidth, panelHeight);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotTenId, cnvsTenCtx);

        // var yAxisParams = YAxis(plotRow, plotCol,
        //        minYData, maxYData, yAxisName,
        //        plotTenId);

        //var zRange = 255.0;  //16-bit each for RGB (48-bit colour??)

        //var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        //var rangeYData = yAxisParams[1];
        //var deltaYData = yAxisParams[2];
        //var deltaYPxl = yAxisParams[3];
        //var xLowerYOffset = xAxisParams[5];
        //minXData = xAxisParams[6];  //updated value
        //minYData = yAxisParams[6];  //updated value


        //txtPrint(" ", legendXPos, legendYPos + 10, zeroInt, zeroInt, zeroInt, plotTenId);
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
        txtPrint("<span style='font-size:normal; color:blue'><a href='https://en.wikipedia.org/wiki/Visible_spectrum' target='_blank'>\n\
     Visual spectrum</a></span>",
                titleOffsetX, titleOffsetY, lineColor, plotTenId);
        var xShift, zShift, xShiftDum, zLevel;
        var RGBHex; //, r255, g255, b255;
        var rangeXData = 1.0e7 * (masterLams[ilLam1] - masterLams[ilLam0]);
        //console.log("minXData " + minXData + " ilLam0 " + ilLam0 + " masterLams[ilLam0] " + masterLams[ilLam0]);

        var barWidth, xBarShift0, xBarShift1, xPos, yPos, nameLbl, lamLbl, lamLblStr, lamLblNum;
        var barHeight = 75.0;

//We can only palce vertical bars by setting marginleft, so search *AHEAD* in wavelength to find width
// of *CURRENT* bar.
        var lambdanm = masterLams[ilLam0] * 1.0e7; //cm to nm
        //console.log("ilLam0 " + ilLam0 + " ilLam1 " + ilLam1);
        yFinesse = -160;
        var thisYPos = xAxisYCnvs + yFinesse;
        for (var i = ilLam0 + 1; i < ilLam1; i++) {

            var nextLambdanm = masterLams[i] * 1.0e7; //cm to nm
            //logLambdanm = 7.0 + logTen(masterLams[i]);

            //barWidth = Math.max(1, Math.ceil(xRange * (lambdanm - lastLambdanm) / rangeXData));
            //barWidth = xRange * (nextLambdanm - lambdanm) / rangeXData;
            //Try calculating the barWidth (device coordinates) in *EXACTLY* the same way as YBar calcualtes its x-position:
            //xBarShift0 = xRange * (lambdanm - minXData) / (maxXData - minXData);
            //xBarShift1 = xRange * (nextLambdanm - minXData) / (maxXData - minXData);
            xBarShift0 = xAxisLength * (lambdanm - minXData) / (maxXData - minXData);
            xBarShift1 = xAxisLength * (nextLambdanm - minXData) / (maxXData - minXData);
            barWidth = xBarShift1 - xBarShift0; //in device pixels

            if (barWidth > 0.5) {

                barWidth = barWidth + 1.0;
//logarithmic z:
                //zLevel = (logE * masterFlux[1][i] - minZData) / rangeZData;
//linear z:


                zLevel = ((masterFlux[0][i] / norm) - minZData) / rangeZData;
                //console.log("lambdanm " + lambdanm + " zLevel " + zLevel);

            var nextRGBHex = lambdaToRGB(lambdanm, zLevel);

        var xTickPosCnvs = xAxisLength * (lambdanm - minXData) / (maxXData - minXData);
        var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;
        var grd = cnvsTenCtx.createLinearGradient(xShiftCnvs, thisYPos, xShiftCnvs+barWidth, thisYPos);
        grd.addColorStop(0, RGBHex);
        grd.addColorStop(1, nextRGBHex);
        cnvsTenCtx.fillStyle = grd;

        cnvsTenCtx.fillRect(xShiftCnvs, thisYPos, barWidth, barHeight);
                //console.log("lambdanm " + lambdanm + " nextLambdanm " + nextLambdanm + " xShiftDum " + xShiftDum + " barWidth " + barWidth);

                lambdanm = nextLambdanm;
                RGBHex = nextRGBHex;
            }  //barWidth condition

        }  // i loop (wavelength)

//Spectral line labels and pointers:
        barWidth = 1.0;
        barHeight = 20; //initialize
        RGBHex = "#000000"; //black
        //
        for (var i = 0; i < numLines; i++) {

            if ((i % 4) === 0) {
                yPos = thisYPos - 25;
                barHeight = 20;
            } else if ((i % 4) === 1) {
                yPos = thisYPos + 85;
                barHeight = 20;
            } else if ((i % 4) === 2) {
                yPos = thisYPos - 45;
                barHeight = 50;
            } else {
                yPos = thisYPos + 105;
                barHeight = 50;
            }

            xPos = xAxisLength * (listLam0[i] - minXData) / (maxXData - minXData);
            xPos = xAxisXCnvs + xPos - 5; // finesse
            //console.log("xPos " + xPos + " xLabelYOffset " + xLabelYOffset);

            nameLbl = "<span style='font-size: xx-small'>" + listName[i] + "</span>";
            lamLblNum = listLam0[i].toPrecision(4);
            lamLblStr = lamLblNum.toString(10);
            lamLbl = "<span style='font-size: xx-small'>" + lamLblStr + "</span>";
            txtPrint(nameLbl, xPos, yPos, RGBHex, plotTenId);
            txtPrint(lamLbl, xPos, yPos + 10, RGBHex, plotTenId);
            //Make the tick label, Teff:

            //cnvsTenCtx.fillStyle = lineColor;
            //cnvsTenCtx.font="normal normal normal 8pt arial";
            //cnvsTenCtx.fillText(listName[i], xPos, yPos);
            //cnvsTenCtx.fillText(lamLblStr, xPos, yPos+10);

        }
    }

//
//
//  *****   PLOT ELEVEN / PLOT 11
//
//
// Plot Eleven: Life Zone

    if (ifLineOnly === false) {

        var plotRow = 0;
        var plotCol = 2;

        // Calculation of steam line and ice line:

        //Assuming liquid salt-free water at one atmospheric pressure is necessary:
        var steamTemp = 373.0; // K = 100 C
        var iceTemp = 273.0; //K = 0 C

        steamTemp = steamTemp - greenHouse;
        iceTemp = iceTemp - greenHouse;
        var logSteamLine, logIceLine;
        var au = 1.4960e13; // 1 AU in cm
        var rSun = 6.955e10; // solar radii to cm
        //Steam line:
        //Set steamTemp equal to planetary surface temp and find distance that balances stellar irradiance 
        //absorbed by planetary cross-section with planet's bolometric thermal emission:
        //Everything in solar units -> distance, d, in solar radii
        logSteamLine = 2.0 * (Math.log(teff) - Math.log(steamTemp)) + logRadius + 0.5 * Math.log(1.0 - albedo);
        //now the same for the ice line:
        logIceLine = 2.0 * (Math.log(teff) - Math.log(iceTemp)) + logRadius + 0.5 * Math.log(1.0 - albedo);
        var iceLineAU = Math.exp(logIceLine) * rSun / au;
        var steamLineAU = Math.exp(logSteamLine) * rSun / au;
        iceLineAU = iceLineAU.toPrecision(3);
        steamLineAU = steamLineAU.toPrecision(3);

        // Convert solar radii to pixels:

        var radiusScale = 20; //solar_radii-to-pixels!
        var logScale = 20; //amplification factor for log pixels

        // 
        // Star radius in pixels:

        //    var radiusPx = (radiusScale * radius);  //linear radius
        var radiusPx = logScale * logTen(radiusScale * radius); //logarithmic radius

        radiusPx = Math.ceil(radiusPx);
        var radiusPxSteam = logScale * logTen(radiusScale * radius * Math.exp(logSteamLine));
        radiusPxSteam = Math.ceil(radiusPxSteam);
        var radiusPxIce = logScale * logTen(radiusScale * radius * Math.exp(logIceLine));
        radiusPxIce = Math.ceil(radiusPxIce);
        // Key raii in order of *DECREASING* size (important!):
        var radii = [radiusPxIce + 2, radiusPxIce, radiusPxSteam, radiusPxSteam - 2, radiusPx];
        //
        rrI = saveRGB[0];
        ggI = saveRGB[1];
        bbI = saveRGB[2];
        var starRGBHex = "rgb(" + rrI + "," + ggI + "," + bbI + ")";
        var colors = ["#0000FF", "#00FF88", "#FF0000", wColor, starRGBHex];
        var numZone = radii.length;
        //var titleYPos = xLowerYOffset - yRange + 40;
        //var cnvsCtx = washer(xOffset - xRange / 2, yOffset, wColor, plotElevenId);
        var panelOrigin = washer(plotRow, plotCol, wColor, plotElevenId, cnvsElevenId);
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
        cnvsElevenCtx.fillStyle = wColor;
        cnvsElevenCtx.fillRect(0, 0, panelWidth, panelHeight);
        // Add title annotation:

        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;

        txtPrint("<span style='font-size:normal; color:blue' title='Assumes liquid salt-free water at one Earth atmosphere pressure needed for life'><a href='https://en.wikipedia.org/wiki/Circumstellar_habitable_zone' target='_blank'>Life zone for habitable planets</a></span><br />\n\
     <span style='font-size:small'>(Logarithmic radius)</span>",
                titleOffsetX, titleOffsetY, lineColor, plotElevenId);
        var legendY = titleOffsetY;
        var legendX = titleOffsetX + 320;
        txtPrint("<span style='font-size:small'>"
                + " <span style='color:#FF0000'>Steam line</span> " + steamLineAU + " <a href='https://en.wikipedia.org/wiki/Astronomical_unit' title='1 AU = Earths average distance from center of Sun'> AU</a><br /> "
                + " <span style='color:#00FF88'><strong>Life zone</strong></span><br /> "
                + " <span style='color:#0000FF'>Ice line</span> " + iceLineAU + " <a href='https://en.wikipedia.org/wiki/Astronomical_unit' title='1 AU = Earths average distance from center of Sun'> AU</a>"
                + " </span>",
                legendX, legendY, lineColor, plotElevenId);
        //Get the Vega-calibrated colors from the intensity spectrum of each theta annulus:    
        // moved earlier var intcolors = iColors(lambdaScale, intens, numDeps, numThetas, numLams, tauRos, temp);

        //  Loop over radial zones - largest to smallest
        for (var i = 0; i < radii.length; i++) {

            var radiusStr = numToPxStrng(radii[i]);
            // Adjust position to center star:
            // Radius is really the *diameter* of the symbol

// Adjust position to center star:
// Radius is really the *diameter* of the symbol
            var yCenterCnvs = panelHeight / 2; 
            var xCenterCnvs = panelWidth / 2; 

            cnvsElevenCtx.beginPath();
            //cnvsSevenCtx.strokeStyle = RGBHex;
            //var grd=cnvsElevenCtx.createRadialGradient(xOffsetICnvs, xLowerYOffsetICnvs, radiusPxICnvs,
            //          xOffsetICnvs, xLowerYOffsetICnvs, radiusPxICnvsNext);
            //grd.addColorStop(0, RGBHex);
            //grd.addColorStop(1, RGBHexNext);
            cnvsElevenCtx.fillStyle=colors[i];
//            cnvsElevenCtx.fillStyle = grd;
            cnvsElevenCtx.arc(xCenterCnvs, yCenterCnvs, radii[i], 0, 2*Math.PI);
            //cnvsSevenCtx.stroke();
            cnvsElevenCtx.fill();
            //
        }  //i loop (thetas)

    }

    //
    //
    //  *****   PLOT NINE / PLOT 9
    //
    //
    // Plot Nine: HRDiagram

    if (ifLineOnly === false) {

        var plotRow = 1;
        var plotCol = 1;
        // WARNING: Teff axis is backwards!!
        var minXData = logTen(100000.0); //K
        var maxXData = logTen(1000.0); //K


        var xAxisName = "<span title='Logarithmic surface temperature of spherical blackbody radiation emitter of equivalent bolometric surface flux, in Kelvins (K)'> \n\
     <a href='http://en.wikipedia.org/wiki/Effective_temperature' target='_blank'>\n\
     Log<sub>10</sub> <em>T</em><sub>eff</sub></a> \n\
     (<a href='http://en.wikipedia.org/wiki/Kelvin' target='_blank'>K</a>)</span>";
        //var numYTicks = 6;
        var minYData = -6.0; //solar luminosities;
        var maxYData = 7.0; //solar luminosities


        var yAxisName = "<span title='Logarithmic Bolometric luminosity'>\n\
     <a href='http://en.wikipedia.org/wiki/Luminosity' target='_blank'>\n\
     Log<sub>10</sub><em>L</em><sub>Bol</sub></a></span><br />  \n\
     <span title='Solar luminosities'>\n\
     <a href='http://en.wikipedia.org/wiki/Solar_luminosity' target='_blank'>\n\
     <em>L</em><sub>Sun</sub></a></span> ";
        //
        var fineness = "fine";
        var panelOrigin = washer(plotRow, plotCol, wColor, plotNineId, cnvsNineId);
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
        cnvsNineCtx.fillStyle = wColor;
        cnvsNineCtx.fillRect(0, 0, panelWidth, panelHeight);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotNineId, cnvsNineCtx);

        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                plotNineId, cnvsNineCtx);

        //
//        xOffset = xAxisParams[0];
//        yOffset = yAxisParams[4];
        var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        var rangeYData = yAxisParams[1];
        var deltaYData = yAxisParams[2];
        var deltaYPxl = yAxisParams[3];
//        var xLowerYOffset = xAxisParams[5];
        minXData = xAxisParams[6]; //updated value
        minYData = yAxisParams[6]; //updated value
        maxXData = xAxisParams[7]; //updated value
        maxYData = yAxisParams[7]; //updated value     
        //
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://www.ap.smu.ca/~ishort/hrdtest3.html' target='_blank'>H-R Diagram</a></span>",
                titleOffsetX, titleOffsetY, lineColor, plotNineId);
        // *********  Input stellar data

        //Sun

        var sunClass = "G2";
        var sunTeff = 5778;
        // var sunTeff = 10000; //debug test
        var sunB_V = 0.656;
        var sunM_v = 4.83;
        var sunM_Bol = 4.75;
        var sunRad = 1.0;
        // var sunRad = 10.0; //debug test
        var logSunLum = 2.5 * logTen(1.0); //log Suns luminosity in solar luminosities 


        // Carroll & Ostlie, 2nd Ed. , Appendix G:

        //Main sequence

        var msClass = ["O5", "O6", "O7", "O8", "B0", "B1", "B2", "B3", "B5", "B6", "B7", "B8", "B9", "A0", "A1", "A2", "A5", "A8", "F0", "F2", "F5", "F8", "G0", "G2", "G8", "K0", "K1", "K3", "K4", "K5", "K7", "M0", "M1", "M2", "M3", "M4", "M5", "M6", "M7"];
        var msTeffs = [42000, 39500, 37500, 35800, 30000, 25400, 20900, 18800, 15200, 13700, 12500, 11400, 10500, 9800, 9400, 9020, 8190, 7600, 7300, 7050, 6650, 6250, 5940, 5790, 5310, 5150, 4990, 4690, 4540, 4410, 4150, 3840, 3660, 3520, 3400, 3290, 3170, 3030, 2860];
        var msB_V = [-0.33, -0.33, -0.32, -0.32, -0.30, -0.26, -0.24, -0.20, -0.17, -0.15, -0.13, -0.11, -0.07, -0.02, +0.01, +0.05, +0.15, +0.25, +0.30, +0.35, +0.44, +0.52, +0.58, +0.63, +0.74, +0.81, +0.86, +0.96, +1.05, +1.15, +1.33, +1.40, +1.46, +1.49, +1.51, +1.54, +1.64, +1.73, +1.80];
        var msM_v = [-5.1, -5.1, -4.9, -4.6, -3.4, -2.6, -1.6, -1.3, -0.5, -0.1, +0.3, +0.6, +0.8, +1.1, +1.3, +1.5, +2.2, +2.7, +3.0, +3.4, +3.9, +4.3, +4.7, +4.9, +5.6, +5.7, +6.0, +6.5, +6.7, +7.1, +7.8, +8.9, +9.6, 10.4, 11.1, 11.9, 12.8, 13.8, 14.7];
        var msBC = [-4.40, -3.93, -3.68, -3.54, -3.16, -2.70, -2.35, -1.94, -1.46, -1.21, -1.02, -0.80, -0.51, -0.30, -0.23, -0.20, -0.15, -0.10, -0.09, -0.11, -0.14, -0.16, -0.18, -0.20, -0.40, -0.31, -0.37, -0.50, -0.55, -0.72, -1.01, -1.38, -1.62, -1.89, -2.15, -2.38, -2.73, -3.21, -3.46];
        var msMass = [60, 37, 29, 23, 17.5, 13.0, 10.0, 7.6, 5.9, 4.8, 4.3, 3.8, 3.2, 2.9, 2.5, 2.2, 2.0, 1.7, 1.6, 1.5, 1.4, 1.2, 1.05, 0.90, 0.83, 0.79, 0.75, 0.72, 0.69, 0.67, 0.55, 0.51, 0.43, 0.40, 0.33, 0.26, 0.21, 0.13, 0.10];
        //var msRads = [13.4 ,12.2 ,11.0 ,10.0 , 6.7 , 5.2 , 4.1 , 3.8 , 3.2 , 2.9 , 2.7 , 2.5 , 2.3 , 2.2 , 2.1 , 2.0 , 1.8 , 1.5 , 1.4 , 1.3 , 1.2 , 1.1 , 1.06, 1.03, 0.96, 0.93, 0.91, 0.86, 0.83, 0.80, 0.74, 0.63, 0.56, 0.48, 0.41, 0.35, 0.29, 0.24, 0.20];
        //var msM_Bol = [-9.51,-9.04,-8.60,-8.18,-6.54,-5.26,-3.92,-3.26,-1.96,-1.35,-0.77,-0.22,+0.28,+0.75,+1.04,+1.31,+2.02,+2.61,+2.95,+3.27,+3.72,+4.18,+4.50,+4.66,+5.20,+5.39,+5.58,+5.98,+6.19,+6.40,+6.84,+7.52,+7.99,+8.47,+8.97,+9.49,10.1 ,10.6 ,11.3];

        // Main sequence data processing:

        var msNum = msClass.length;
        var msM_Bol = [];
        var logR45 = [];
        var logR = [];
        var msRads = [];
        var msLogLum = [];
        msM_Bol.length = msNum;
        logR45.length = msNum;
        logR.length = msNum;
        msRads.length = msNum;
        msLogLum.length = msNum;
        // Calculate radii in solar radii:
        // For MS stars, do the Luminosity as well

        for (var i = 0; i < msNum; i++) {

            msM_Bol[i] = msM_v[i] + msBC[i];
            var msTeffSol = msTeffs[i] / sunTeff;
            logR45[i] = 2.5 * logSunLum + sunM_Bol - 10.0 * logTen(msTeffSol) - msM_Bol[i];
            logR[i] = logR45[i] / 4.5;
            msRads[i] = Math.exp(Math.LN10 * logR[i]); //No base ten exponentiation in JS!
            var msLogL = (sunM_Bol - msM_Bol[i]) / 2.5;
            // Round log(Lum) to 1 decimal place:
            msLogL = 10.0 * msLogL;
            msLogL = Math.floor(msLogL);
            msLogLum[i] = msLogL / 10.0;
        } // end i loop


// Giants:

        var rgbClass = ["O5", "O6", "O7", "O8", "B0", "B1", "B2", "B3", "B5", "B6", "B7", "B8", "B9", "A0", "A1", "A2", "A5", "A8", "F0", "F2", "F5", "G0", "G2", "G8", "K0", "K1", "K3", "K4", "K5", "K7", "M0", "M1", "M2", "M3", "M4", "M5", "M6"];
        var rgbTeffs = [39400, 37800, 36500, 35000, 29200, 24500, 20200, 18300, 15100, 13800, 12700, 11700, 10900, 10200, 9820, 9460, 8550, 7830, 7400, 7000, 6410, 5470, 5300, 4800, 4660, 4510, 4260, 4150, 4050, 3870, 3690, 3600, 3540, 3480, 3440, 3380, 3330];
        var rgbB_V = [-0.32, -0.32, -0.32, -0.31, -0.29, -0.26, -0.24, -0.20, -0.17, -0.15, -0.13, -0.11, -0.07, -0.03, +0.01, +0.05, +0.15, +0.25, +0.30, +0.35, +0.43, +0.65, +0.77, +0.94, +1.00, +1.07, +1.27, +1.38, +1.50, +1.53, +1.56, +1.58, +1.60, +1.61, +1.62, +1.63, +1.52];
        var rgbM_v = [-5.9, -5.7, -5.6, -5.5, -4.7, -4.1, -3.4, -3.2, -2.3, -1.8, -1.4, -1.0, -0.6, -0.4, -0.2, -0.1, +0.6, +1.0, +1.3, +1.4, +1.5, +1.3, +1.3, +1.0, +1.0, +0.9, +0.8, +0.8, +0.7, +0.4, +0.0, -0.2, -0.4, -0.4, -0.4, -0.4, -0.4];
        var rgbBC = [-4.05, -3.80, -3.58, -3.39, -2.88, -2.43, -2.02, -1.60, -1.30, -1.13, -0.97, -0.82, -0.71, -0.42, -0.29, -0.20, -0.14, -0.10, -0.11, -0.11, -0.14, -0.20, -0.27, -0.42, -0.50, -0.55, -0.76, -0.94, -1.02, -1.17, -1.25, -1.44, -1.62, -1.87, -2.22, -2.48, -2.73];
        //var rgbRads = [18.5,16.8,15.4,14.3,11.4,10.0, 8.6, 8.0, 6.7, 6.1, 5.5, 5.0, 4.5, 4.1, 3.9, 3.7, 3.3, 3.1, 3.2, 3.3, 3.8, 6.0, 6.7, 9.6,10.9,12.5,16.4,18.7,21.4,27.6,39.3,48.6,58.5,69.7,82.0,96.7,16];
        //var rgbM_Bol = [-9.94,-9.55,-9.20,-8.87,-7.58,-6.53,-5.38,-4.78,-3.56,-2.96,-2.38,-1.83,-1.31,-0.83,-0.53,-0.26,+0.44,+0.95,+1.17,+1.31,+1.37,+1.10,+1.00,+0.63,+0.48,+0.32,-0.01,-0.18,-0.36,-0.73,-1.28,-1.64,-1.97,-2.28,-2.57,-2.86,-3.18];

        // RGB sequence data processing:

        var rgbNum = rgbClass.length;
        var rgbM_Bol = [];
        var logR45 = [];
        var logR = [];
        var rgbRads = [];
        var rgbLogLum = [];
        rgbM_Bol.length = rgbNum;
        logR45.length = rgbNum;
        logR.length = rgbNum;
        rgbRads.length = rgbNum;
        // Calculate radii in solar radii:

        for (var i = 0; i < rgbNum; i++) {

            rgbM_Bol[i] = rgbM_v[i] + rgbBC[i];
            var rgbTeffSol = rgbTeffs[i] / sunTeff;
            logR45[i] = 2.5 * logSunLum + sunM_Bol - 10.0 * logTen(rgbTeffSol) - rgbM_Bol[i];
            logR[i] = logR45[i] / 4.5;
            rgbRads[i] = Math.exp(Math.LN10 * logR[i]); //No base ten exponentiation in JS!

            var rgbLogL = (sunM_Bol - rgbM_Bol[i]) / 2.5;
            // Round log(Lum) to 1 decimal place:
            rgbLogL = 10.0 * rgbLogL;
            rgbLogL = Math.floor(rgbLogL);
            rgbLogLum[i] = rgbLogL / 10.0;
        } // end i loop


// No! Too bright for what GrayStar can model!
// //Supergiants:
//
 var sgbClass = ["O5", "O6", "O7", "O8", "B0", "B1", "B2", "B3", "B5", "B6", "B7", "B8", "B9", "A0", "A1", "A2", "A5", "A8", "F0", "F2", "F5", "F8", "G0", "G2", "G8", "K0", "K1", "K3", "K4", "K5", "K7", "M0", "M1", "M2", "M3", "M4", "M5", "M6"];
 var sgbTeffs = [40900, 38500, 36200, 34000, 26200, 21400, 17600, 16000, 13600, 12600, 11800, 11100, 10500, 9980, 9660, 9380, 8610, 7910, 7460, 7030, 6370, 5750, 5370, 5190, 4700, 4550, 4430, 4190, 4090, 3990, 3830, 3620, 3490, 3370, 3210, 3060, 2880, 2710];
 var sgbB_V = [-0.31, -0.31, -0.31, -0.29, -0.23, -0.19, -0.17, -0.13, -0.10, -0.08, -0.05, -0.03, -0.02, -0.01, +0.02, +0.03, +0.09, +0.14, +0.17, +0.23, +0.32, +0.56, +0.76, +0.87, +1.15, +1.24, +1.30, +1.46, +1.53, +1.60, +1.63, +1.67, +1.69, +1.71, +1.69, +1.76, +1.80, +1.86];
  var sgbM_v = [-6.5, -6.5, -6.6, -6.6, -6.9, -6.9, -6.7, -6.7, -6.6, -6.4, -6.3, -6.3, -6.3, -6.3, -6.3, -6.3, -6.3, -6.4, -6.4, -6.4, -6.4, -6.4, -6.3, -6.3, -6.1, -6.1, -6.0, -5.9, -5.8, -5.7, -5.6, -5.8, -5.8, -5.8, -5.5, -5.2, -4.8, -4.9];
 var sgbBC = [-3.87, -3.74, -3.48, -3.35, -2.49, -1.87, -1.58, -1.26, -0.95, -0.88, -0.78, -0.66, -0.52, -0.41, -0.32, -0.28, -0.13, -0.03, -0.01, 0.00, -0.03, -0.09, -0.15, -0.21, -0.42, -0.50, -0.56, -0.75, -0.90, -1.01, -1.20, -1.29, -1.38, -1.62, -2.13, -2.75, -3.47, -3.90];
//  
//  //var sgbRads = [21,  22,  23,  25,  31,  37,  42,  45,  51,  53,  56,  58,  61,  64,  67,  69,  78,  91, 102, 114, 140, 174, 202, 218, 272, 293, 314, 362, 386, 415, 473, 579, 672, 791, 967,1220,1640,2340];
//  //var sgbM_Bol = [-10.4,-10.2,-10.1, -9.9, -9.3, -8.8, -8.2, -7.9, -7.5, -7.3, -7.1, -6.9, -6.8, -6.7, -6.6, -6.5, -6.4, -6.4, -6.4, -6.4, -6.4, -6.4, -6.4, -6.4, -6.5, -6.5, -6.5, -6.6, -6.7, -6.7, -6.8, -7.0, -7.2, -7.4, -7.6, -7.9, -8.3, -8.8];
// 
  // SGB sequence data processing:
 
  var sgbNum = sgbClass.length;
 
  var sgbM_Bol = [];
  var logR45 = [];
  var logR = [];
  var sgbRads = [];
  var sgbLogLum = [];
  
 sgbM_Bol.length = sgbNum;
  logR45.length = sgbNum;
  logR.length = sgbNum;
   sgbRads.length = sgbNum;
  
   
  // Calculate radii in solar radii:
   
  for (var i = 0; i < sgbNum; i++) {
  
 sgbM_Bol[i] = sgbM_v[i] + sgbBC[i];
  var sgbTeffSol = sgbTeffs[i] / sunTeff;
  
  logR45[i] = 2.5 * logSunLum + sunM_Bol - 10.0 * logTen(sgbTeffSol) - sgbM_Bol[i];
  logR[i] = logR45[i] / 4.5;
  sgbRads[i] = Math.exp(Math.LN10 * logR[i]);  //No base ten exponentiation in JS!
  
  var sgbLogL = (sunM_Bol - sgbM_Bol[i]) / 2.5;
  // Round log(Lum) to 1 decimal place:
  sgbLogL = 10.0 * sgbLogL;
  sgbLogL = Math.floor(sgbLogL);
  sgbLogLum[i] = sgbLogL / 10.0;
  
  } // end i loop
 

//Data loops - plot the result!

//MS stars

        var dSizeCnvs = 2.0; //plot point size
        var opac = 0.7; //opacity
        // RGB color
        var r255 = 50;
        var g255 = 50;
        var b255 = 50; //dark gray
        var RGBHex = colHex(r255, r255, r255);

        var ii;
        //for (var i = 5; i < msNum - 3; i++) {
        for (var i = 4; i < msNum - 1; i++) {

            ii = 1.0 * i;
            var xTickPosCnvs = xAxisLength * (logTen(msTeffs[i]) - minXData) / rangeXData; // pixels   

            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            var yTickPosCnvs = yAxisLength * (msLogLum[i] - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

            cnvsNineCtx.fillStyle = RGBHex;
            cnvsNineCtx.strokeStyle = RGBHex;
            cnvsNineCtx.beginPath();
            cnvsNineCtx.arc(xShiftCnvs, yShiftCnvs, dSizeCnvs, 0, 2*Math.PI);
            cnvsNineCtx.stroke();
        }


//RGB stars

// RGB color
        var r255 = 100;
        var g255 = 100;
        var b255 = 100; //gray
        var RGBHex = colHex(r255, r255, r255);

        var ii;
        //for (var i = 4; i < rgbNum - 2; i++) {
        for (var i = 3; i < rgbNum - 1; i++) {

            ii = 1.0 * i;
            var xTickPosCnvs = xAxisLength * (logTen(rgbTeffs[i]) - minXData) / rangeXData; // pixels   

            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            var yTickPosCnvs = yAxisLength * (rgbLogLum[i] - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

            cnvsNineCtx.fillStyle = RGBHex;
            cnvsNineCtx.strokeStyle = RGBHex;
            cnvsNineCtx.beginPath();
            cnvsNineCtx.arc(xShiftCnvs, yShiftCnvs, dSizeCnvs, 0, 2*Math.PI);
            cnvsNineCtx.stroke();
        }


// No! Too bright for what GrayStar can model!
// //SGB stars
// 
// // RGB color
 var r255 = 150;
 var g255 = 150;
 var b255 = 150; //light gray
 var RGBHex = colHex(r255, r255, r255);
  
 var ii;
 for (var i = 4; i < sgbNum - 3; i++) {
  
  ii = 1.0 * i;
  var xTickPosCnvs = xAxisLength * (logTen(sgbTeffs[i]) - minXData) / rangeXData; // pixels   
  
  // horizontal position in pixels - data values increase rightward:
 var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;
 
  var yTickPosCnvs = yAxisLength * (sgbLogLum[i] - minYData) / rangeYData;
 // vertical position in pixels - data values increase upward:
  var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
 
            cnvsNineCtx.fillStyle = RGBHex;
            cnvsNineCtx.strokeStyle = RGBHex;
            cnvsNineCtx.beginPath();
            cnvsNineCtx.arc(xShiftCnvs, yShiftCnvs, dSizeCnvs, 0, 2*Math.PI);
            cnvsNineCtx.stroke();
 
  }


// Now overplot our star:
        var xTickPosCnvs = xAxisLength * (logTen(teff) - minXData) / rangeXData; // pixels   
        // horizontal position in pixels - data values increase rightward:
        var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;
//
        var yTickPosCnvs = yAxisLength * (logTen(bolLum) - minYData) / rangeYData;
        // vertical position in pixels - data values increase upward:
        var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
        //Take color and radius from the last step of the star rendering loop (plot Seve) - that should be the inner-most disk:
        var radiusPxThis = saveRadius / 5;
        if (radiusPxThis < 1){
            radiusPxThis = 1;
            }
        var rrI = saveRGB[0];
        var ggI = saveRGB[1];
        var bbI = saveRGB[2];
//
            cnvsNineCtx.beginPath();
            cnvsNineCtx.strokeStyle="#000000";
            cnvsNineCtx.arc(xShiftCnvs, yShiftCnvs, 1.1 * radiusPxThis, 0, 2*Math.PI);
            cnvsNineCtx.stroke();
            cnvsNineCtx.fill();
        //plotPnt(xShift, yShift, rrI, ggI, bbI, opac, radiusPxThis, plotNineId);
            var RGBHex = colHex(rrI, ggI, bbI);
            cnvsNineCtx.beginPath();
            cnvsNineCtx.strokeStyle=RGBHex;
            cnvsNineCtx.fillStyle=RGBHex;
            cnvsNineCtx.arc(xShiftCnvs, yShiftCnvs, 1.05 * radiusPxThis, 0, 2*Math.PI);
            cnvsNineCtx.stroke();
            cnvsNineCtx.fill();
        //Now overplot Luminosity class markers:

            //I
        var xShift = xAxisXCnvs + xAxisLength * (logTen(sgbTeffs[sgbNum-1]) - minXData) / rangeXData; // pixels 
        var yShift = (yAxisYCnvs + yAxisLength) - (yAxisLength * (sgbLogLum[sgbNum - 1] - minYData) / rangeYData);
        txtPrint("<span style='font-size:normal'><a href='http://en.wikipedia.org/wiki/Stellar_classification' target='_blank'>\n\
         I</a></span>", xShift, yShift, lineColor, plotNineId);
        //III
        xShift = xAxisXCnvs + xAxisLength * (logTen(rgbTeffs[rgbNum-1]) - minXData) / rangeXData; // pixels 
        yShift = (yAxisYCnvs + yAxisLength) - (yAxisLength * (rgbLogLum[rgbNum - 8] - minYData) / rangeYData);
        txtPrint("<span style='font-size:normal'><a href='http://en.wikipedia.org/wiki/Stellar_classification' title='Giants' target='_blank'>\n\
     III</a></span>", xShift, yShift, lineColor, plotNineId);
        //V
        xShift = xAxisXCnvs + xAxisLength * (logTen(msTeffs[msNum-1]) - minXData) / rangeXData; // pixels 
        yShift = (yAxisYCnvs + yAxisLength) - (yAxisLength * (msLogLum[msNum - 8] - minYData) / rangeYData);
        txtPrint("<span style='font-size:normal'><a href='http://en.wikipedia.org/wiki/Stellar_classification' title='Main Sequence, Dwarfs' target='_blank'>\n\
     V</a></span>", xShift, yShift, lineColor, plotNineId);
    }



// ****************************************
    //
    //
    //  *****   PLOT ONE / PLOT 1
    //

    // Plot one: log(Tau) vs log(rho)
    // 
    if ((ifLineOnly === false) && (ifShowAtmos === true)) {
//
        var plotRow = 3;
        var plotCol = 2;
        var minXData = logE * tauRos[1][0] - 2.0;
        var maxXData = logE * tauRos[1][numDeps - 1];
        var xAxisName = "<span title='Rosseland mean optical depth'><a href='http://en.wikipedia.org/wiki/Optical_depth_%28astrophysics%29' target='_blank'>Log<sub>10</sub> <em>&#964</em><sub>Ros</sub></a></span>";
        // Don't use upper boundary condition as lower y-limit - use a couple of points below surface:
        //var numYTicks = 6;
        // Build total P from P_Gas & P_Rad:

        var minYData = logE * rho[1][1]; // Avoid upper boundary condition [i]=0
        var maxYData = logE * rho[1][numDeps - 1];
        var yAxisName = "Log<sub>10</sub> <em>&#961</em> <br />(g cm<sup>-3</sup>)";

        var fineness = "normal";
        //var cnvsCtx = washer(xOffset, yOffset, wColor, plotOneId, cnvsId);
        //var cnvsCtx = washer(plotRow, plotCol, wColor, plotOneId, cnvsOneId);
        var panelOrigin = washer(plotRow, plotCol, wColor, plotOneId, cnvsOneId);
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
        cnvsOneCtx.fillStyle = wColor;
        cnvsOneCtx.fillRect(0, 0, panelWidth, panelHeight);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotOneId, cnvsOneCtx);
        //xOffset = xAxisParams[0];
        var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        //yOffset = xAxisParams[4];
        var xLowerYOffset = xAxisParams[5];
        minXData = xAxisParams[6]; //updated value
        maxXData = xAxisParams[7]; //updated value
        //no! var cnvsCtx = xAxisParams[8];
        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                plotOneId, cnvsOneCtx);
        var rangeYData = yAxisParams[1];
        var deltaYData = yAxisParams[2];
        var deltaYPxl = yAxisParams[3];
        minYData = yAxisParams[6]; //updated value
        maxYData = yAxisParams[7]; //updated value 

        yFinesse = 0;       
        xFinesse = 0;       
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
        txtPrint("log<sub>10</sub> <a href='http://en.wikipedia.org/wiki/Gas_laws' title='mass density' target='_blank'>Density</a>",
                titleOffsetX, titleOffsetY, lineColor, plotOneId);

        //Data loop - plot the result!

        //var dSizeG = 2.0;
        var dSizeCnvs = 1.0;
        var opac = 1.0; //opacity
        // RGB color
        // PTot:
        var r255 = 0;
        var g255 = 0;
        var b255 = 255; //blue 
        // PGas:
        var r255G = 0;
        var g255G = 255;
        var b255G = 100; //green
        // PRad:
        var r255R = 255;
        var g255R = 0;
        var b255R = 0; //red

        var ii;
            var xTickPosCnvs = xAxisLength * (logE * tauRos[1][0] - minXData) / rangeXData; // pixels   
            // horizontal position in pixels - data values increase rightward:
            var lastXxShiftCnvs = xAxisXCnvs + xTickPosCnvs;
            var yTickPosCnvs = yAxisLength * (logE * rho[1][0] - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

        for (var i = 2; i < numDeps; i++) {

            ii = 1.0 * i;
            var xTickPosCnvs = xAxisLength * (logE * tauRos[1][i] - minXData) / rangeXData; // pixels   

            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            var yTickPosCnvs = yAxisLength * (logE * rho[1][i] - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

//Plot points
            cnvsOneCtx.beginPath();
            cnvsOneCtx.strokeStyle=lineColor; 
            cnvsOneCtx.arc(xShiftCnvs, yShiftCnvs, dSizeCnvs, 0, 2*Math.PI);
            cnvsOneCtx.stroke();
//Line plot 
            cnvsOneCtx.beginPath();
            cnvsOneCtx.strokeStyle=lineColor; 
            cnvsOneCtx.moveTo(lastXShiftCnvs, lastYShiftCnvs);
            cnvsOneCtx.lineTo(xShiftCnvs, yShiftCnvs);
            cnvsOneCtx.stroke();  
            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
        }

// Tau=1 cross-hair

        var barWidth = 1.0;
        var barColor = "#777777";
        var xShift = YBar(logE * tauRos[1][tTau1], minXData, maxXData, barWidth, yAxisLength,
                yFinesse, barColor, plotOneId, cnvsOneCtx);

        var barHeight = 1.0;
        var yShift = XBar(logE * rho[1][tTau1], minYData, maxYData, xAxisLength, barHeight,
                xFinesse, barColor, plotOneId, cnvsOneCtx);
        txtPrint("<span style='font-size:small; color:#444444'><em>&#964</em><sub>Ros</sub>=1</span>",
                xShift, yShift, lineColor, plotOneId);
    }

//
//
//  *****   PLOT TWO / PLOT 2
//
//

// Plot two: log(Tau) vs Temp
// 
    if ((ifLineOnly === false) && (ifShowAtmos === true)) {

        var plotRow = 1;
        var plotCol = 2;
        var minXData = logE * tauRos[1][0];
        var maxXData = logE * tauRos[1][numDeps - 1];
        var xAxisName = "<span title='Rosseland mean optical depth'><a href='http://en.wikipedia.org/wiki/Optical_depth_%28astrophysics%29' target='_blank'>Log<sub>10</sub> <em>&#964</em><sub>Ros</sub></a></span>";
        var minYData = temp[0][0];
        var maxYData = temp[0][numDeps - 1];
        var yAxisName = "<em>T</em><sub>Kin</sub> (K)";
        var fineness = "normal";

        var panelOrigin = washer(plotRow, plotCol, wColor, plotTwoId, cnvsTwoId);
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
        cnvsTwoCtx.fillStyle = wColor;
        cnvsTwoCtx.fillRect(0, 0, panelWidth, panelHeight);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotTwoId, cnvsTwoCtx);
        //no! var cnvsCtx = xAxisParams[8];
        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                plotTwoId, cnvsTwoCtx);
        //
        //xOffset = xAxisParams[0];
        //yOffset = xAxisParams[4];
        var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        var rangeYData = yAxisParams[1];
        var deltaYData = yAxisParams[2];
        var deltaYPxl = yAxisParams[3];
        //var xLowerYOffset = xAxisParams[5];
        minXData = xAxisParams[6]; //updated value
        minYData = yAxisParams[6]; //updated value
        maxXData = xAxisParams[7]; //updated value
        maxYData = yAxisParams[7]; //updated value    
        yFinesse = 0;       
        xFinesse = 0;       
        //
        // Tau=1 cross-hair

        var barWidth = 1.0;
        var barColor = "#777777";
        var tTau1 = tauPoint(numDeps, tauRos, 1.0);
        xShift = YBar(logE * tauRos[1][tTau1], minXData, maxXData, barWidth, yAxisLength,
                yFinesse, barColor, plotTwoId, cnvsTwoCtx);

        yShift = XBar(temp[0][tTau1], minYData, maxYData, xAxisLength, barHeight,
                xFinesse, barColor, plotTwoId, cnvsTwoCtx);
        barHeight = 1.0;
        // Add label
        txtPrint("<span style='font-size:small; color:#444444'><em>&#964</em><sub>Ros</sub>=1</span>",
                xShift, yShift, lineColor, plotTwoId);
        // Tau_lambda(lambda_0) = 1 cross-hair

        // Get depth index where monochromatic line center Tau_l ~ 1:
        var indxLam0 = keyLambds[0]; // line center
        var tauLam0 = [];
        tauLam0.length = 2;
        tauLam0[0] = [];
        tauLam0[1] = [];
        tauLam0[0].length = numDeps;
        tauLam0[1].length = numDeps;
        for (var i = 0; i < numDeps - 1; i++) {
            tauLam0[0][i] = Math.exp(logTauL[indxLam0][i]);
            tauLam0[1][i] = logTauL[indxLam0][i];
        }
        var tTauL1 = tauPoint(numDeps, tauLam0, 1.0);
        var barWidth = 1.0;
        var barColor = "#00FF77";
        //console.log("logE * tauRos[1][tTauL1] " + logE * tauRos[1][tTauL1]);

        xShift = YBar(logE * tauRos[1][tTauL1], minXData, maxXData, barWidth, yAxisLength,
                yFinesse, barColor, plotTwoId, cnvsTwoCtx);
        //console.log("Bar: xShift = " + xShift);

        barHeight = 1.0;
        yShift = XBar(temp[0][tTauL1], minYData, maxYData, xAxisLength, barHeight,
                xFinesse, barColor, plotTwoId, cnvsTwoCtx);
        // Add label
        RGBHex = colHex(0, 255, 100);
        txtPrint("<span style='font-size:small'><em>&#964</em><sub><em>&#955</em>_0</sub>=1</span>",
                xShift+150, yShift, RGBHex, plotTwoId);
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
        //        titleXPos, titleYPos - 40, zeroInt, zeroInt, zeroInt, masterId);
        txtPrint("<span style='font-size:normal; color:blue'>Gas temperature </span>",
                titleOffsetX, titleOffsetY, lineColor, plotTwoId);
        //Data loop - plot the result!

        //var dSize = 5.0; //plot point size
        var dSizeCnvs = 1.0; //plot point size
        var opac = 1.0; //opacity
        // RGB color
        var r255 = 0;
        var g255 = 0;
        var b255 = 255; //blue

        var ii;
        var xTickPosCnvs = xAxisLength * (logE * tauRos[1][0] - minXData) / rangeXData; // pixels   

        // horizontal position in pixels - data values increase rightward:
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;

        var yTickPosCnvs = yAxisLength * (temp[0][0] - minYData) / rangeYData;
        // vertical position in pixels - data values increase upward:
        var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

        for (var i = 0; i < numDeps; i++) {

            ii = 1.0 * i;
            var xTickPosCnvs = xAxisLength * (logE * tauRos[1][i] - minXData) / rangeXData; // pixels   

            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            var yTickPosCnvs = yAxisLength * (temp[0][i] - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

//Plot points
            cnvsTwoCtx.strokeStyle=lineColor; 
            cnvsTwoCtx.beginPath();
            cnvsTwoCtx.arc(xShiftCnvs, yShiftCnvs, dSizeCnvs, 0, 2*Math.PI);
            cnvsTwoCtx.stroke();
//Line plot
            cnvsTwoCtx.beginPath();
            cnvsTwoCtx.strokeStyle=lineColor; 
            cnvsTwoCtx.moveTo(lastXShiftCnvs, lastYShiftCnvs);
            cnvsTwoCtx.lineTo(xShiftCnvs, yShiftCnvs);
            cnvsTwoCtx.stroke();  
            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
        }

//  Loop over limb darkening sub-disks - largest to smallest, and add color-coded Tau(theta) = 1 markers

        //dSize = 8.0;
        dSizeCnvs = 4.0;

        // Disk centre:
        //This approach does not allow for calibration easily:
        //now done earlier var bvr = bandIntens[2][0] + bandIntens[3][0] + bandIntens[4][0];
        var brightScale = 255.0 / Math.max(bandIntens[2][0] / bvr, bandIntens[3][0] / bvr, bandIntens[4][0] / bvr);
        // *Raw* Vega: r g b 183 160 255
        //now down above: var rgbVega = [183.0 / 255.0, 160.0 / 255.0, 255.0 / 255.0];
        for (var i = numThetas - 1; i >= 0; i--) {

            ii = 1.0 * i;
            //     iCosThetaI = limbTheta1 - ii * limbDelta;
            //     iIntMaxI = interpol(iCosTheta, iIntMax, iCosThetaI);

            //numPrint(i, 50, 100 + i * 20, zeroInt, zeroInt, zeroInt, masterId);
            // LTE Eddington-Barbier limb darkening: I(Tau=0, cos(theta)=t) = B(T(Tau=t))
            var cosFctr = cosTheta[1][i];
            //  var cosFctr = iCosThetaI;
            //numPrint(cosFctr, 100, 100+i*20, zeroInt, zeroInt, zeroInt, masterId);
            var dpthIndx = tauPoint(numDeps, tauRos, cosFctr);
            //numPrint(dpthIndx, 100, 100+i*20, zeroInt, zeroInt, zeroInt, masterId);

            r255 = Math.ceil(brightScale * (bandIntens[4][i] / bvr) / rgbVega[0]); // / vegaBVR[2]);
            g255 = Math.ceil(brightScale * (bandIntens[3][i] / bvr) / rgbVega[1]); // / vegaBVR[1]);
            b255 = Math.ceil(brightScale * (bandIntens[2][i] / bvr) / rgbVega[2]); // / vegaBVR[0]);

            var xTickPosCnvs = xAxisLength * (logE * tauRos[1][dpthIndx] - minXData) / rangeXData; // pixels   

            // horizontal position in pixels - data values increase rightward:
            //var xShift = xOffset + xTickPos;
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;// + 200;
            ////stringify and add unit:
            //        var xShiftStr = numToPxStrng(xShift);

            //var yTickPos = yRange * (temp[0][dpthIndx] - minYData) / rangeYData;
            var yTickPosCnvs = yAxisLength * (temp[0][dpthIndx] - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

            var RGBHex = colHex(r255, g255, b255);
            cnvsTwoCtx.beginPath();
            cnvsTwoCtx.arc(xShiftCnvs, yShiftCnvs, dSizeCnvs, 0, 2*Math.PI);
            cnvsTwoCtx.strokeStyle = RGBHex;
            cnvsTwoCtx.fillStyle = RGBHex;
            //cnvsCtx.strokeStyle = "rgba(r255, g255, b255, 1.0)";
            //cnvsCtx.strokeStyle = "#FF0000"; //test
            cnvsTwoCtx.stroke();
            cnvsTwoCtx.fill();
        }

// legend using dot of last color in loop directly above:
        //plotPnt(titleX, titleY + 10, r255, g255, b255, opac, dSize, plotTwoId);
            cnvsTwoCtx.beginPath();
            cnvsTwoCtx.strokeStyle = RGBHex;
            cnvsTwoCtx.fillStyle = RGBHex;
            cnvsTwoCtx.arc(titleOffsetX + 365, titleOffsetY+10, dSizeCnvs, 0, 2*Math.PI);
            cnvsTwoCtx.stroke();
            cnvsTwoCtx.fill();
        txtPrint("<span title='Limb darkening depths of &#964_Ros(&#952) = 1'><em>&#964</em><sub>Ros</sub>(0 < <em>&#952</em> < 90<sup>o</sup>) = 1</span>",
                titleOffsetX + 200, titleOffsetY, lineColor, plotTwoId);

    }

    //
    //
    //  *****   PLOT THREE / PLOT 3
    //
    //
    // Plot three: log(Tau) vs log(Pressure)

    if ((ifLineOnly === false) && (ifShowAtmos === true)) {

        var plotRow = 2;
        var plotCol = 2;
        var minXData = logE * tauRos[1][0];
        var maxXData = logE * tauRos[1][numDeps - 1];
        var xAxisName = "<span title='Rosseland mean optical depth'><a href='http://en.wikipedia.org/wiki/Optical_depth_%28astrophysics%29' target='_blank'>Log<sub>10</sub> <em>&#964</em><sub>Ros</sub></a></span>";
        // From Hydrostat.hydrostat:
        //press is a 4 x numDeps array:
        // rows 0 & 1 are linear and log *gas* pressure, respectively
        // rows 2 & 3 are linear and log *radiation* pressure
        // Don't use upper boundary condition as lower y-limit - use a couple of points below surface:
        //var numYTicks = 6;
        // Build total P from P_Gas & P_Rad:
        var logPTot = [];
        logPTot.length = numDeps;
        for (var i = 0; i < numDeps; i++) {
            logPTot[i] = Math.log(press[0][i] + press[2][i]);
            //console.log(logPTot[i]);
        }
        //var minYData = logE * logPTot[0] - 2.0; // Avoid upper boundary condition [i]=0
        var minYData = logE * Math.min(press[1][0], press[3][0]) - 1.0;
        var maxYData = logE * logPTot[numDeps - 1];
        var yAxisName = "Log<sub>10</sub> <em>P</em> <br />(dynes <br />cm<sup>-2</sup>)";
        //washer(xRange, xOffset, yRange, yOffset, wColor, plotThreeId);

        var fineness = "normal";
        //var cnvsCtx = washer(plotRow, plotCol, wColor, plotThreeId, cnvsId);
        var panelOrigin = washer(plotRow, plotCol, wColor, plotThreeId, cnvsThreeId);
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
        cnvsThreeCtx.fillStyle = wColor;
        cnvsThreeCtx.fillRect(0, 0, panelWidth, panelHeight);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotThreeId, cnvsThreeCtx);
        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                plotThreeId, cnvsThreeCtx);
        //xOffset = xAxisParams[0];
        //yOffset = xAxisParams[4];
        var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        var rangeYData = yAxisParams[1];
        var deltaYData = yAxisParams[2];
        var deltaYPxl = yAxisParams[3];
        var xLowerYOffset = xAxisParams[5];
        minXData = xAxisParams[6]; //updated value
        minYData = yAxisParams[6]; //updated value
        maxXData = xAxisParams[7]; //updated value
        maxYData = yAxisParams[7]; //updated value        
        yFinesse = 0;       
        xFinesse = 0;       
        //
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
        txtPrint("log Pressure: <span style='color:blue' title='Total pressure'><strong><em>P</em><sub>Tot</sub></strong></span> "
                + " <a href='http://en.wikipedia.org/wiki/Gas_laws' target='_blank'><span style='color:#00FF88' title='Gas pressure'><em>P</em><sub>Gas</sub></span></a> "
                + " <a href='http://en.wikipedia.org/wiki/Radiation_pressure' target='_blank'><span style='color:red' title='Radiation pressure'><em>P</em><sub>Rad</sub></span></a>",
                titleOffsetX, titleOffsetY, lineColor, plotThreeId);

        //Data loop - plot the result!

        var dSizeCnvs = 2.0; //plot point size
        var dSizeGCnvs = 1.0;
        var opac = 1.0; //opacity
        // RGB color
        // PTot:
        var r255 = 0;
        var g255 = 0;
        var b255 = 255; //blue 
        // PGas:
        var r255G = 0;
        var g255G = 255;
        var b255G = 100; //green
        // PRad:
        var r255R = 255;
        var g255R = 0;
        var b255R = 0; //red

        var ii;
        var xTickPosCnvs = xAxisLength * (logE * tauRos[1][0] - minXData) / rangeXData; // pixels   

        // horizontal position in pixels - data values increase rightward:
         var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;

         var lastYTickPosCnvs = yAxisLength * (logE * logPTot[0] - minYData) / rangeYData;
         var lastYTickPosGCnvs = yAxisLength * (logE * press[1][0] - minYData) / rangeYData;
         var lastYTickPosRCnvs = yAxisLength * (logE * press[3][0] - minYData) / rangeYData;
         // vertical position in pixels - data values increase upward:
         var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
         var lastYShiftGCnvs = (yAxisYCnvs + yAxisLength) - yTickPosGCnvs;
         var lastYShiftRCnvs = (yAxisYCnvs + yAxisLength) - yTickPosRCnvs;
        // Avoid upper boundary at i=0
        for (var i = 1; i < numDeps; i++) {

            ii = 1.0 * i;
            var xTickPosCnvs = xAxisLength * (logE * tauRos[1][i] - minXData) / rangeXData; // pixels   

            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            var yTickPosCnvs = yAxisLength * (logE * logPTot[i] - minYData) / rangeYData;
            var yTickPosGCnvs = yAxisLength * (logE * press[1][i] - minYData) / rangeYData;
            var yTickPosRCnvs = yAxisLength * (logE * press[3][i] - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
            var yShiftGCnvs = (yAxisYCnvs + yAxisLength) - yTickPosGCnvs;
            var yShiftRCnvs = (yAxisYCnvs + yAxisLength) - yTickPosRCnvs;

//Plot points
            cnvsThreeCtx.beginPath();
            cnvsThreeCtx.arc(xShiftCnvs, yShiftCnvs, dSizeCnvs, 0, 2*Math.PI);
            cnvsThreeCtx.strokeStyle = "#0000FF";
            cnvsThreeCtx.stroke();
//Line plots
            cnvsThreeCtx.beginPath();
            cnvsThreeCtx.strokeStyle="#0000FF"; 
            cnvsThreeCtx.moveTo(lastXShiftCnvs, lastYShiftCnvs);
            cnvsThreeCtx.lineTo(xShiftCnvs, yShiftCnvs);
            cnvsThreeCtx.stroke();  
//
            cnvsThreeCtx.beginPath();
            cnvsThreeCtx.arc(xShiftCnvs, yShiftGCnvs, dSizeGCnvs, 0, 2*Math.PI);
            cnvsThreeCtx.strokeStyle = "#00FF00";
            cnvsThreeCtx.stroke();
            cnvsThreeCtx.beginPath();
            cnvsThreeCtx.strokeStyle="#00FF00"; 
            cnvsThreeCtx.moveTo(lastXShiftCnvs, lastYShiftGCnvs);
            cnvsThreeCtx.lineTo(xShiftCnvs, yShiftGCnvs);
            cnvsThreeCtx.stroke();  
//
            cnvsThreeCtx.beginPath();
            cnvsThreeCtx.arc(xShiftCnvs, yShiftRCnvs, dSizeGCnvs, 0, 2*Math.PI);
            cnvsThreeCtx.strokeStyle = "#FF0000";
            cnvsThreeCtx.stroke();
            cnvsThreeCtx.beginPath();
            cnvsThreeCtx.strokeStyle="#FF0000"; 
            cnvsThreeCtx.moveTo(lastXShiftCnvs, lastYShiftRCnvs);
            cnvsThreeCtx.lineTo(xShiftCnvs, yShiftRCnvs);
            cnvsThreeCtx.stroke();  
//
            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
            lastYShiftGCnvs = yShiftGCnvs;
            lastYShiftRCnvs = yShiftRCnvs;
        }

// Tau=1 cross-hair

        var tTau1 = tauPoint(numDeps, tauRos, 1.0);
        var barWidth = 1.0;
        var barColor = "#777777";
        yFinesse = 0.0;
        xShift = YBar(logE * tauRos[1][tTau1], minXData, maxXData, barWidth, yAxisLength,
                yFinesse, barColor, plotThreeId, cnvsThreeCtx);
        //console.log("Bar: xShift = " + xShift);

        //console.log("PLOT THREE: logE*logPTot[tTau1] " + logE * logPTot[tTau1]);
        barHeight = 1.0;
        yShift = XBar(logE * logPTot[tTau1], minYData, maxYData, xAxisLength, barHeight,
                xFinesse, barColor, plotThreeId, cnvsThreeCtx);
        txtPrint("<span style='font-size:small; color:#444444'><em>&#964</em><sub>Ros</sub>=1</span>",
                xShift, yShift, lineColor, plotThreeId);
    }

    //
    //
    //  *****   PLOT FOUR / PLOT 4
    //
    //
    // Plot four: Limb darkening
 
   if ((ifLineOnly === false) && (ifShowRad === true)) {

        var plotRow = 3;
        var plotCol = 1;
//
        var minXData = 180.0 * Math.acos(cosTheta[1][0]) / Math.PI;
        var maxXData = 180.0 * Math.acos(cosTheta[1][numThetas - 1]) / Math.PI;
        var xAxisName = "<em>&#952</em> (<sup>o</sup>)";
        var minYData = 0.0;
        var maxYData = 1.0;
        var yAxisName = "<span title='Monochromatic surface specific intensity'><a href='http://en.wikipedia.org/wiki/Specific_radiative_intensity' target='_blank'><em>I</em><sub>&#955</sub>(<em>&#952</em>)/<br /><em>I</em><sub>&#955</sub>(0)</a></span>";

        var fineness = "normal";
//
        var panelOrigin = washer(plotRow, plotCol, wColor, plotFourId, cnvsFourId);
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
        cnvsFourCtx.fillStyle = wColor;
        cnvsFourCtx.fillRect(0, 0, panelWidth, panelHeight);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotFourId, cnvsFourCtx);
        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                plotFourId, cnvsFourCtx);
        var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        var rangeYData = yAxisParams[1];
        var deltaYData = yAxisParams[2];
        var deltaYPxl = yAxisParams[3];
        minXData = xAxisParams[6]; //updated value
        minYData = yAxisParams[6]; //updated value
        maxXData = xAxisParams[7]; //updated value
        maxYData = yAxisParams[7]; //updated value        
        //
        // Add legend annotation:

        //var iLamMinMax = minMax2(masterFlux);
        //var iLamMax = iLamMinMax[1];
        //var lamMax = (1.0e7 * masterLams[iLamMax]).toPrecision(3);

        var lam1 = (1.0e7 * masterLams[0]).toPrecision(3);
        var lam1Str = lam1.toString(10);
        var lamN = (1.0e7 * masterLams[numMaster - 1]).toPrecision(3);
        var lamNStr = lamN.toString(10);
        var lam0r = (1.0e7 * lam0).toPrecision(3);
        var lam0rStr = lam0r.toString(10);
//
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
        txtPrint("<span style='font-size:small'><span style='color:#00FF88'><em>&#955</em><sub>Max</sub> = " + lamMaxStr + "nm</span><br /> "
                + " <span style='color:blue'><em>&#955</em> = " + lam1Str + "nm</span><br /> "
                + " <span style='color:red'><em>&#955</em> = " + lamNStr + "nm</span><br />"
                + " <span style='color:#444444'>line <em>&#955</em><sub>0</sub> = " + lam0rStr + "nm</span></span>",
                xAxisXCnvs+10, titleOffsetY+yAxisLength-20, lineColor, plotFourId);
        // Add title annotation:


        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Limb_darkening' target='_blank'>Limb darkening and reddening</a></span>",
                titleOffsetX, titleOffsetY, lineColor, plotFourId);
        //Data loop - plot the result!

        var dSizeCnvs = 2.0; //plot point size
        var dSize0Cnvs = 1.0;
        var opac = 1.0; //opacity
        // RGB color
        // PTot:
        var r255 = 0;
        var g255 = 255;
        var b255 = 100; //green 
        // PGas:
        var r2550 = 0;
        var g2550 = 0;
        var b2550 = 255; //blue
        // PRad:
        var r255N = 255;
        var g255N = 0;
        var b255N = 0; //red


        var xTickPosCnvs = xAxisLength * (180.0 * Math.acos(cosTheta[1][0]) / Math.PI - minXData) / rangeXData; // pixels   
        // horizontal position in pixels - data values increase rightward:
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
        var yTickPosCnvs = yAxisLength * ((masterIntens[iLamMax][0] / masterIntens[iLamMax][0]) - minYData) / rangeYData;
        var yTickPos0Cnvs = yAxisLength * ((masterIntens[0][0] / masterIntens[0][0]) - minYData) / rangeYData;
        var yTickPosNCnvs = yAxisLength * ((masterIntens[numMaster - 1][0] / masterIntens[numMaster - 1][0]) - minYData) / rangeYData;
        var yTickPosLnCnvs = yAxisLength * ((lineIntens[keyLambds[0]][0] / lineIntens[keyLambds[0]][0]) - minYData) / rangeYData;

        // vertical position in pixels - data values increase upward:
        var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
        var lastYShift0Cnvs = (yAxisYCnvs + yAxisLength) - yTickPos0Cnvs;
        var lastYShiftNCnvs = (yAxisYCnvs + yAxisLength) - yTickPosNCnvs;
        var lastYShiftLnCnvs = (yAxisYCnvs + yAxisLength) - yTickPosLnCnvs;
//
        for (var i = 1; i < numThetas; i++) {

            xTickPosCnvs = xAxisLength * (180.0 * Math.acos(cosTheta[1][i]) / Math.PI - minXData) / rangeXData; // pixels   
            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            yTickPosCnvs = yAxisLength * ((masterIntens[iLamMax][i] / masterIntens[iLamMax][0]) - minYData) / rangeYData;
            yTickPos0Cnvs = yAxisLength * ((masterIntens[0][i] / masterIntens[0][0]) - minYData) / rangeYData;
            yTickPosNCnvs = yAxisLength * ((masterIntens[numMaster - 1][i] / masterIntens[numMaster - 1][0]) - minYData) / rangeYData;
            yTickPosLnCnvs = yAxisLength * ((lineIntens[keyLambds[0]][i] / lineIntens[keyLambds[0]][0]) - minYData) / rangeYData;

            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
            var yShift0Cnvs = (yAxisYCnvs + yAxisLength) - yTickPos0Cnvs;
            var yShiftNCnvs = (yAxisYCnvs + yAxisLength) - yTickPosNCnvs;
            var yShiftLnCnvs = (yAxisYCnvs + yAxisLength) - yTickPosLnCnvs;

//Plot points
            cnvsFourCtx.beginPath();
            cnvsFourCtx.arc(xShiftCnvs, yShiftCnvs, dSizeCnvs, 0, 2*Math.PI);
            RGBHex = colHex(r255, g255, b255);
            cnvsFourCtx.strokeStyle = RGBHex;
            cnvsFourCtx.stroke();
//line plot
            cnvsFourCtx.beginPath();
            cnvsFourCtx.strokeStyle = RGBHex;
            cnvsFourCtx.moveTo(lastXShiftCnvs, lastYShiftCnvs);
            cnvsFourCtx.lineTo(xShiftCnvs, yShiftCnvs);
            cnvsFourCtx.stroke();  
            //
            cnvsFourCtx.beginPath();
            cnvsFourCtx.arc(xShiftCnvs, yShift0Cnvs, dSize0Cnvs, 0, 2*Math.PI);
            RGBHex = colHex(r2550, g2550, b2550);
            cnvsFourCtx.strokeStyle = RGBHex;
            cnvsFourCtx.stroke();
//
            cnvsFourCtx.beginPath();
            cnvsFourCtx.strokeStyle = RGBHex;
            cnvsFourCtx.moveTo(lastXShiftCnvs, lastYShift0Cnvs);
            cnvsFourCtx.lineTo(xShiftCnvs, yShift0Cnvs);
            cnvsFourCtx.stroke();  
//
            cnvsFourCtx.beginPath();
            cnvsFourCtx.arc(xShiftCnvs, yShiftNCnvs, dSize0Cnvs, 0, 2*Math.PI);
            RGBHex = colHex(r255N, g255N, b255N);
            cnvsFourCtx.strokeStyle = RGBHex;
            cnvsFourCtx.stroke();
//
            cnvsFourCtx.beginPath();
            RGBHex = colHex(r255N, g255N, b255N);
            cnvsFourCtx.strokeStyle = RGBHex;
            cnvsFourCtx.moveTo(lastXShiftCnvs, lastYShiftNCnvs);
            cnvsFourCtx.lineTo(xShiftCnvs, yShiftNCnvs);
            cnvsFourCtx.stroke(); 
// 
            cnvsFourCtx.beginPath();
            cnvsFourCtx.arc(xShiftCnvs, yShiftLnCnvs, dSize0Cnvs, 0, 2*Math.PI);
            RGBHex = colHex(100, 100, 100);
            cnvsFourCtx.strokeStyle = RGBHex;
            cnvsFourCtx.stroke();
//
            cnvsFourCtx.beginPath();
            RGBHex = colHex(100, 100, 100);
            cnvsFourCtx.strokeStyle = RGBHex;
            cnvsFourCtx.moveTo(lastXShiftCnvs, lastYShiftLnCnvs);
            cnvsFourCtx.lineTo(xShiftCnvs, yShiftLnCnvs);
            cnvsFourCtx.stroke();  

            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
            lastYShift0Cnvs = yShift0Cnvs;
            lastYShiftNCnvs = yShiftNCnvs;
            lastYShiftLnCnvs = yShiftLnCnvs;
        }
    }

//
//
//  *****   PLOT FIVE / PLOT 5
//
//

// Plot five: SED
// 
    if ((ifLineOnly === false) && (ifShowRad === true)) {

        var plotRow = 2;
        var plotCol = 1;
//
        var minXData = 1.0e7 * masterLams[0];
        var maxXData = 1.0e7 * masterLams[numMaster - 1];
        var xAxisName = "<em>&#955</em> (nm)";
        //    ////Logarithmic x:
        //var minXData = 7.0 + logTen(masterLams[0]);
        //var maxXData = 7.0 + logTen(masterLams[numMaster - 1]);
        //var maxXData = 3.0; //finesse - Log10(lambda) = 3.5 nm
        //var xAxisName = "Log<sub>10</sub> &#955 (nm)";
        //var numYTicks = 4;
        //now done above var norm = 1.0e15; // y-axis normalization
        var minYData = 0.0;
        // iLamMax established in PLOT TWO above:
        var maxYData = masterFlux[0][iLamMax] / norm;
        var yAxisName = "<span title='Monochromatic surface flux'><a href='http://en.wikipedia.org/wiki/Spectral_flux_density' target='_blank'> <em>F</em><sub>&#955</sub> x 10<sup>15</sup><br />ergs s<sup>-1</sup> <br />cm<sup>-3</sup></a></span>";
        ////Logarithmic y:
        //var minYData = 12.0;
        //var maxYData = logE * masterFlux[1][iLamMax];
        //var yAxisName = "<span title='Monochromatic surface flux'><a href='http://en.wikipedia.org/wiki/Spectral_flux_density' target='_blank'>Log<sub>10</sub> <em>F</em><sub>&#955</sub> <br /> ergs s<sup>-1</sup> cm<sup>-3</sup></a></span>";
        //(xRange, xOffset, yRange, yOffset, wColor, plotFiveId);

        var fineness = "coarse";
        //var cnvsCtx = washer(plotRow, plotCol, wColor, plotFiveId, cnvsId);
        var panelOrigin = washer(plotRow, plotCol, wColor, plotFiveId, cnvsFiveId);
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
        cnvsFiveCtx.fillStyle = wColor;
        cnvsFiveCtx.fillRect(0, 0, panelWidth, panelHeight);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotFiveId, cnvsFiveCtx);

        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                plotFiveId, cnvsFiveCtx);
        //xOffset = xAxisParams[0];
        //yOffset = xAxisParams[4];
        var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        var rangeYData = yAxisParams[1];
        var deltaYData = yAxisParams[2];
        var deltaYPxl = yAxisParams[3];
        minXData = xAxisParams[6]; //updated value
        minYData = yAxisParams[6]; //updated value
        maxXData = xAxisParams[7]; //updated value
        maxYData = yAxisParams[7]; //updated value        
        //
        // Add legend annotation:

        var thet0 = 180.0 * Math.acos(cosTheta[1][0]) / Math.PI;
        var thet0lbl = thet0.toPrecision(2);
        var thet0Str = thet0lbl.toString();
        var thetN = 180.0 * Math.acos(cosTheta[1][numThetas - 2]) / Math.PI;
        var thetNlbl = thetN.toPrecision(2);
        var thetNStr = thetNlbl.toString();
//
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Spectral_energy_distribution' target='_blank'>\n\
     Spectral energy distribution (SED)</a></span>",
                titleOffsetX, titleOffsetY, lineColor, plotFiveId);
        txtPrint("<span style='font-size:small'>"
                + "<span><em>F</em><sub>&#955</sub> (<em>&#955</em><sub>Max</sub> = " + lamMaxStr + " nm)</span>, "
                + " <span><em>I</em><sub>&#955</sub>,</span> <span style='color:#444444'> <em>&#952</em> = " + thet0Str + "<sup>o</sup></span>,  "
                + " <span style='color:#444444'><em>&#952</em> = " + thetNStr + "<sup>o</sup></span></span>",
                titleOffsetX, titleOffsetY+35, lineColor, plotFiveId);
//
        // Photometric bands centers

        var opac = 0.5;
        var opacStr = "0.5";
//        var yTickPos = 0;
//        var yShift = (xLowerYOffset - yRange) + yTickPos;
//        var yShiftStr = numToPxStrng(yShift);
        var vBarWidth = 2; //pixels 
        var vBarHeight = yAxisLength;
//        var vBarWidthStr = numToPxStrng(vBarWidth);
//        var vBarHeightStr = numToPxStrng(vBarHeight);
        //
        yFinesse = 0; 
        var UBVRIBands = function(r255, g255, b255, band0) {

            var RGBHex = colHex(r255, g255, b255);
            //var RGBHex = "#FF0000";
            // Vertical bar:
//            var xTickPos = xRange * (band0 - minXData) / rangeXData; // pixels    
 //           var xShift = xOffset + xTickPos;
 //  
        xShift = YBar(band0, minXData, maxXData, vBarWidth, yAxisLength,
                yFinesse, RGBHex, plotFiveId, cnvsFiveCtx);
        }; //end function UBVRIbands


//
        //
        var filters = filterSet();
        var lam0_ptr = 11; // approximate band centre
        var numBands = filters.length;
        var lamUBVRI = [];
        lamUBVRI.length = numBands;
        for (var ib = 0; ib < numBands; ib++) {
            lamUBVRI[ib] = 1.0e7 * filters[ib][0][lam0_ptr]; //linear lambda
            //lamUBVRI[ib] = 7.0 + logTen(filters[ib][0][lam0_ptr]);  //logarithmic lambda
        }

        //Ux:
        var r255 = 155;
        var g255 = 0;
        var b255 = 155; // violet
        UBVRIBands(r255, g255, b255, lamUBVRI[0]);
        //B:
        var r255 = 0;
        var g255 = 0;
        var b255 = 255; // blue
        UBVRIBands(r255, g255, b255, lamUBVRI[2]);
        //V:
        var r255 = 0;
        var g255 = 255;
        var b255 = 100; // green
        UBVRIBands(r255, g255, b255, lamUBVRI[3]);
        //R:
        var r255 = 255;
        var g255 = 0;
        var b255 = 0; // red
        UBVRIBands(r255, g255, b255, lamUBVRI[4]);
        //I:
        var r255 = 255;
        var g255 = 40;
        var b255 = 40; // dark red / brown ??
        UBVRIBands(r255, g255, b255, lamUBVRI[5]);
        //Data loop - plot the result!

        var dSizeCnvs = 1.0; //plot point size
        var dSize0Cnvs = 1.0;
        var opac = 1.0; //opacity
        // RGB color
        // PTot:
        var r255 = 0;
        var g255 = 0;
        var b255 = 0; //black
        // PGas:
        var r2550 = 90;
        var g2550 = 90;
        var b2550 = 90; //dark gray
        // PRad:
        var r255N = 120;
        var g255N = 120;
        var b255N = 120; //light gray

        // Avoid upper boundary at i=0

        //var logLambdanm = 7.0 + logTen(masterLams[0]);  //logarithmic
        var lambdanm = 1.0e7 * masterLams[0];
        var xTickPosCnvs = xAxisLength * (lambdanm - minXData) / rangeXData; // pixels
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
//Logarithmic y:
        var yTickPosCnvs = yAxisLength * ((masterFlux[0][0] / norm) - minYData) / rangeYData;
        var yTickPos0Cnvs = yAxisLength * ((masterIntens[0][0] / norm) - minYData) / rangeYData;
        var yTickPosNCnvs = yAxisLength * ((masterIntens[0][numThetas - 2] / norm) - minYData) / rangeYData;
        // vertical position in pixels - data values increase upward:
        var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
        var lastYShift0Cnvs = (yAxisYCnvs + yAxisLength) - yTickPos0Cnvs;
        var lastYShiftNCnvs = (yAxisYCnvs + yAxisLength) - yTickPosNCnvs;
        var xShift, yShift;
        for (var i = 1; i < numMaster; i++) {

            lambdanm = masterLams[i] * 1.0e7; //cm to nm //linear
            //logLambdanm = 7.0 + logTen(masterLams[i]);  //logarithmic
            ii = 1.0 * i;
            xTickPosCnvs = xAxisLength * (lambdanm - minXData) / rangeXData; // pixels   //linear

            // horizontal position in pixels - data values increase rightward:
            xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

//logarithmic y:
            yTickPosCnvs = yAxisLength * ((masterFlux[0][i] / norm) - minYData) / rangeYData;
            yTickPos0Cnvs = yAxisLength * ((masterIntens[i][0] / norm) - minYData) / rangeYData;
            yTickPosNCnvs = yAxisLength * ((masterIntens[i][numThetas - 2] / norm) - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
            yShift0Cnvs = (yAxisYCnvs + yAxisLength) - yTickPos0Cnvs;
            yShiftNCnvs = (yAxisYCnvs + yAxisLength) - yTickPosNCnvs;

//plot points
            //cnvsFiveCtx.beginPath();
            //cnvsFiveCtx.arc(xShiftCnvs, yShiftCnvs, dSizeCnvs, 0, 2*Math.PI);
            //RGBHex = colHex(r255, g255, b255);
            //cnvsFiveCtx.strokeStyle = RGBHex;
            //cnvsFiveCtx.stroke();
//line plot
            cnvsFiveCtx.beginPath();
            RGBHex = colHex(r255, g255, b255);
            cnvsFiveCtx.strokeStyle=RGBHex; 
            cnvsFiveCtx.moveTo(lastXShiftCnvs, lastYShiftCnvs);
            cnvsFiveCtx.lineTo(xShiftCnvs, yShiftCnvs);
            cnvsFiveCtx.stroke();  
            //cnvsFiveCtx.beginPath();
            //cnvsFiveCtx.arc(xShiftCnvs, yShift0Cnvs, dSize0Cnvs, 0, 2*Math.PI);
            //RGBHex = colHex(r2550, g2550, b2550);
            //cnvsFiveCtx.strokeStyle = RGBHex;
            //cnvsFiveCtx.stroke();
            cnvsFiveCtx.beginPath();
            RGBHex = colHex(r2550, g2550, b2550);
            cnvsFiveCtx.strokeStyle=RGBHex; 
            cnvsFiveCtx.moveTo(lastXShiftCnvs, lastYShift0Cnvs);
            cnvsFiveCtx.lineTo(xShiftCnvs, yShift0Cnvs);
            cnvsFiveCtx.stroke();  
            //cnvsFiveCtx.beginPath();
            //cnvsFiveCtx.arc(xShiftCnvs, yShiftNCnvs, dSize0Cnvs, 0, 2*Math.PI);
            //RGBHex = colHex(r255N, g255N, b255N);
            //cnvsFiveCtx.strokeStyle = RGBHex;
            //cnvsFiveCtx.stroke();
            cnvsFiveCtx.beginPath();
            RGBHex = colHex(r255N, g255N, b255N);
            cnvsFiveCtx.strokeStyle=RGBHex; 
            cnvsFiveCtx.moveTo(lastXShiftCnvs, lastYShiftNCnvs);
            cnvsFiveCtx.lineTo(xShiftCnvs, yShiftNCnvs);
            cnvsFiveCtx.stroke();  

            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
            lastYShift0Cnvs = yShift0Cnvs;
            lastYShiftNCnvs = yShiftNCnvs;
        }
           //monochromatic disk lambda
                yFinesse = 0.0;
                barHeight = 200;
                barWidth = 2;
                RGBHex = "#000000";
                var xShiftDum = YBar(diskLambda, minXData, maxXData, barWidth, barHeight,
                        yFinesse, RGBHex, plotFiveId, cnvsFiveCtx);
        txtPrint("<span style='font-size:xx-small'>Filter</span>",
                xShiftDum, titleOffsetY+60, lineColor, plotFiveId);
    }

//
//
//  *****   PLOT SIX / PLOT 6
//
//
// Plot six: Line profile

    if (ifShowLine === true) {

        var plotRow = 2;
        var plotCol = 0;
        //w.r.t. line center lambda:
        //Find where line profile climbs up to 95% of continuum in red half iof line:
        var iCount = Math.floor(numPoints / 2) - 1; //initialize

        for (var il = Math.floor(numPoints / 2); il < numPoints; il++) {
            if (lineFlux2[0][il] < 0.95 * lineFlux2[0][numPoints - 1]) {
                iCount++;
            }
        }
//One to three more if we can accomodate them:
        if (iCount < numPoints - 1) {
            iCount++;
        }
        if (iCount < numPoints - 1) {
            iCount++;
        }
        if (iCount < numPoints - 1) {
            iCount++;
        }

        var iStart = numPoints - iCount - 1;
        var iStop = iCount;
        //Set minimum range of x-axis to 0.1 nm:
        while ((lineLambdas[iStop] - lineLambdas[iStart]) < 1.0e-7 * 0.1) {
            iStart--;
            iStop++;
        }
////over-ride x-axis scaling while debugging:
// iStart = 0;
// iStop = numPoints-1;

//Try to scale x-range to width of line:
        var maxXData = 1.0e7 * (lineLambdas[iStop] - lam0);
        var minXData = 1.0e7 * (lineLambdas[iStart] - lam0);
        //   
        var xAxisName = "<em>&#916</em> <em>&#955</em> (nm)";
        //var numYTicks = 6;
        //var minYData = intens[0][0];  // 
        //var maxYData = intens[numLams - 1][0];
        var minYData = 0.0;
        var maxYData = 1.0;
        var yAxisName = "<span title='Continuum normalized flux'><a href='http://en.wikipedia.org/wiki/Spectral_flux_density' target='_blank'><em>F</em><sub>&#955</sub>/<br /><em>F</em><sup>C</sup><sub>&#955 0</sub></a></span>";

        var fineness = "fine";
        var panelOrigin = washer(plotRow, plotCol, wColor, plotSixId, cnvsSixId);
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
        cnvsSixCtx.fillStyle = wColor;
        cnvsSixCtx.fillRect(0, 0, panelWidth, panelHeight);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotSixId, cnvsSixCtx);
        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                plotSixId, cnvsSixCtx);
        //xOffset = xAxisParams[0];
        //yOffset = xAxisParams[4];
        var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        var rangeYData = yAxisParams[1];
        var deltaYData = yAxisParams[2];
        var deltaYPxl = yAxisParams[3];
        var xLowerYOffset = xAxisParams[5];
        minXData = xAxisParams[6]; //updated value
        //minXData = xAxisParams[6] - 1.0e7*lam0; //updated value
        minYData = yAxisParams[6]; //updated value
        maxXData = xAxisParams[7]; //updated value
        maxYData = yAxisParams[7]; //updated value        
        //
        // Add legend annotation:


        var lam0lbl = (1.0e7 * lam0).toPrecision(3);
        var lam0Str = lam0lbl.toString();
        var thetN = 180.0 * Math.acos(cosTheta[1][5]) / Math.PI;
        var thetNlbl = thetN.toPrecision(5);
        var thetNStr = thetNlbl.toString();
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
        txtPrint("<span style='font-size:small'><span><em>F</em><sub>&#955</sub>, <em>&#955</em><sub>0</sub> = " + lam0Str + " nm</span><br /> ",
                // + " <span><em>I</em><sub>&#955</sub>,</span> <span style='color:green'> &#955 = " + thet0Str + "<sup>o</sup></span>,  "
                // + " <span style='color:red'>&#952 = " + thetNStr + "<sup>o</sup></span></span>",
                titleOffsetX, titleOffsetY + 35, lineColor, plotSixId);
//
        var dSizeCnvs = 2.0; //plot point size
        var dSizeSymCnvs = 2.0;
        var dSize0Cnvs = 1.0;
        var opac = 1.0; //opacity
        // RGB color
        // PTot:
        var r255 = 0;
        var g255 = 0;
        var b255 = 0; //black
        // PGas:
        var r2550 = 0;
        var g2550 = 255;
        var b2550 = 100; // green
        // PRad:
        var r255N = 255;
        var g255N = 0;
        var b255N = 0; //red

        // Continuum:

        var opac = 0.5;
        var opaccStr = numToPxStrng(opac);
        var r255c = 130;
        var g255c = 130;
        var b255c = 130; // gray
        var RGBHexc = colHex(r255c, g255c, b255c);
        // Horizontal bar:

        var one = 1.0;
        barHeight = 1.0;
        yShift = XBar(one, minYData, maxYData, barWidth, barHeight,
                xFinesse, RGBHexc, plotSixId, cnvsSixCtx);
        //   

        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Spectral_line' target='_blank'>Spectral line profile </a></span>",
                titleOffsetX, titleOffsetY, lineColor, plotSixId);
// Equivalent width:
    roundNum = Wlambda.toFixed(2);
    txtPrint("<span style='font-size:small' title='Equivalent width: A measure of spectral line strength'>\n\
<a href='http://en.wikipedia.org/wiki/Equivalent_width' target='_blank'>W<sub><em>&#955</em></sub></a>: \n\
</span>"
            + roundNum
            + " <span style='font-size:small' title='picometers'>\n\
<a href='http://en.wikipedia.org/wiki/Picometre' target='_blank'>pm</a>\n\
</span>",
            titleOffsetX+150, titleOffsetY, lineColor, plotSixId);
        // Data loop below in here instead
// Spectrum not normalized - try this instead (redefines input parameter fluxCont):
        //lineFLux2 now continuum rectified: var fluxCont = (lineFlux[0][0] + lineFlux[0][numPoints - 1]) / 2.0;
        //Data loop - plot the result!

        // Interpolation variables:
        // CAUTION; numPoints-1st value holds the line centre monochromatic *continuum* flux for normalization: -Not any more!
        var lnFlx = [];
        //var lnInt0 = [];
        //var lnIntN = [];
        var lnLam = [];
        lnFlx.length = numPoints;
        //lnInt0.length = numPoints;
        //lnIntN.length = numPoints;
        lnLam.length = numPoints;
        var ii;
        for (var i = 0; i < numPoints; i++) {
            lnFlx[i] = lineFlux2[0][i]; // / fluxCont  lineFLux2 now continuum rectified 
            // lnInt0[i] = lineIntens[i][5] / lineIntens[numPoints - 1][5];
            // lnIntN[i] = lineIntens[i][numThetas - 2] / lineIntens[numPoints - 1][numThetas - 2];
            // w.r.t. line center lambda
            lnLam[i] = 1.0e7 * (lineLambdas[i] - lam0);
        }


// CAUTION; numPoints-1st value holds the line centre monochromatic *continuum* flux for normalization:
        var xTickPosCnvs = xAxisLength * (lnLam[iStart] - minXData) / rangeXData; // pixels   
        // horizontal position in pixels - data values increase rightward:
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
        var yTickPosCnvs = yAxisLength * (lnFlx[iStart] - minYData) / rangeYData;
        //var yTickPos0 = yRange * (lnInt0[i] - minYData) / rangeYData;
        //var yTickPosN = yRange * (lnIntN[i] - minYData) / rangeYData;
        // vertical position in pixels - data values increase upward:
        //var lastYShift = xLowerYOffset - yTickPos;
        var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
        //var lastYShift0 = xLowerYOffset - yTickPos0;
        //var lastYShiftN = xLowerYOffset - yTickPosN;

        for (var i = iStart; i <= iStop; i++) {

            xTickPosCnvs = xAxisLength * (lnLam[i] - minXData) / rangeXData; // pixels  

            // horizontal position in pixels - data values increase rightward:

            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            yTickPosCnvs = yAxisLength * (lnFlx[i] - minYData) / rangeYData;
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

// plot point
            cnvsSixCtx.beginPath();
            cnvsFiveCtx.strokeStyle=lineColor; 
            cnvsSixCtx.arc(xShiftCnvs, yShiftCnvs, dSizeSymCnvs, 0, 2*Math.PI);
            cnvsSixCtx.stroke();
//line plot
            cnvsSixCtx.beginPath();
            cnvsSixCtx.strokeStyle=lineColor; 
            cnvsSixCtx.moveTo(lastXShiftCnvs, lastYShiftCnvs);
            cnvsSixCtx.lineTo(xShiftCnvs, yShiftCnvs);
            cnvsSixCtx.stroke();  

            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
            //lastYShift0 = yShift0;
            //lastYShiftN = yShiftN;
        }
    }



//
//
//  *****   PLOT EIGHT / PLOT 8
//
//
// Plot eight - Grotrian diagram for ionization stage and excitation level selected
//
//

// Always do this line-related stuff anyway...
    var c = 2.9979249E+10; // light speed in vaccuum in cm/s
    var h = 6.62606957E-27; //Planck's constant in ergs sec
    var logC = Math.log(c);
    var logH = Math.log(h);
    var eV = 1.602176565E-12; // eV in ergs
    var logEv = Math.log(eV);
    //Log of line-center wavelength in cm
    var logLam0 = Math.log(lam0);
    // energy of b-b transition

    var logTransE = logH + logC - logLam0 - logEv; // last term converts back to cgs units

    // Energy of upper E-level of b-b transition
    var chiU = chiL + Math.exp(logTransE);
    if (ifShowLine === true) {
//
        var plotRow = 3;
        var plotCol = 0;
        // Determine which ionization stage gas the majority population and scale the axis 
        /// with that population
        // From function levelPops():
        // logNums is a 2D 3 x numDeps array of logarithmic number densities
        // Row 0: neutral stage ground state population
        // Row 1: ionized stage ground state population
        // Row 2: level population of lower level of bb transition (could be in either stage I or II!) 
        // Row 3: level population of upper level of bb transition (could be in either stage I or II!) 
        // Row 4: doubly ionized stage ground state population
        //minXData = Math.min(logNums[0][tTau1], logNums[1][tTau1], logNums[4][tTau1]); 
        maxXData = Math.max(logNums[0][tTau1], logNums[1][tTau1], logNums[4][tTau1]);
        //minXData = logE * minXData; 
        maxXData = logE * maxXData; 
        minXData = 0.0;

        var xAxisName = "<span title='Logarithmic number density of particles in lower E-level of b-b transition at <em>&#964</em>_Ros=1'>Log<sub>10</sub> <em>N</em><sub>l</sub>(<em>&#964</em><sub>Ros</sub>=1) cm<sup>-3</sup></span>";
        var minYData = 0.0;
        //if (ionized) {
        //    var maxYData = chiI1 + chiU + 1.0; //eV
        //} else {
        //    var maxYData = chiI1 + 1.0;
        //}
        var maxYData = chiI1+chiI2;

        var yAxisName = "<span title='Atomic excitation energy'><a href='http://en.wikipedia.org/wiki/Excited_state' target='_blank'>Excitation<br /> E</a> (<a href='http://en.wikipedia.org/wiki/Electronvolt' target='_blank'>eV</a>)</span>";
        //(xRange, xOffset, yRange, yOffset, wColor, plotEightId);

        var fineness = "coarse";
        //var cnvsCtx = washer(plotRow, plotCol, wColor, plotEightId, cnvsId);
        var panelOrigin = washer(plotRow, plotCol, wColor, plotEightId, cnvsEightId);
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
        cnvsEightCtx.fillStyle = wColor;
        cnvsEightCtx.fillRect(0, 0, panelWidth, panelHeight);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotEightId, cnvsEightCtx);
        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                plotEightId, cnvsEightCtx);
        //
        //xOffset = xAxisParams[0];
        //yOffset = xAxisParams[4];
        var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        var rangeYData = yAxisParams[1];
        var deltaYData = yAxisParams[2];
        var deltaYPxl = yAxisParams[3];
        var xLowerYOffset = xAxisParams[5];
        minXData = xAxisParams[6]; //updated value
        minYData = yAxisParams[6]; //updated value
        maxXData = xAxisParams[7]; //updated value
        maxYData = yAxisParams[7]; //updated value        
      
        // Add title annotation:

        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Grotrian_diagram' target='_blank'>Grotrian diagram</a></span>",
                titleOffsetX, titleOffsetY, lineColor, plotEightId);
    
        //
        // Second special "y-ticks" for lower and upper E-levels of b-b transition, and ground-state
        // ionization energy

        //var yLabelXOffset = xOffset - 3 * tickLength; //height & width reversed for y-ticks
        //var yLabelXOffsetStr = numToPxStrng(yLabelXOffset);
        // From function levelPops():
        // logNums is a 2D 3 x numDeps array of logarithmic number densities
        // Row 0: neutral stage ground state population
        // Row 1: singly ionized stage ground state population
        // Row 2: level population of lower level of bb transition (could be in either stage I or II!) 
        // Row 3: level population of upper level of bb transition (could be in either stage I or II!)
        // Row 4: doubly ionized stage ground state population
        var yData = [0.0, chiI1, chiL, chiU, chiI1+chiI2];
        var yRightTickValStr = ["<em>&#967</em><sub>I</sub>", "<em>&#967</em><sub>II</sub>", "<span style='color:red'><em>&#967</em><sub>l</sub></span>", "<em>&#967</em><sub>u</sub>", "<em>&#967</em><sub>III</sub>"];
        // Offset for labelling on right of plot
        var yRightLabelXOffset0 = xAxisXCnvs + xAxisLength;
        var yRightLabelXOffset = [yRightLabelXOffset0 + 5, 
                                  yRightLabelXOffset0 + 5, 
                                  yRightLabelXOffset0 + 30, 
                                  yRightLabelXOffset0 + 30, 
                                  yRightLabelXOffset0 + 5];
        // No!:
        // Pointers into logNums rows must be in order of increasing atomic E:
        //   var lPoint = []; // declaration
        //   if (ionized) {
        //      lPoint = [0, 1, 2, 3];
        //   } else {
        //       lPoint = [0, 2, 3, 1];
        //   }

            var RGBHex = "#FF0000";
            var tickWidthPops = 2;
        xFinesse = 0;
        yFinesse = 0;
        var yShiftL = 0;
        var yShiftU = 0;
        for (var i = 0; i < yData.length; i++) {

            ii = 1.0 * i;

        //barHeight = 1.0;
        //barWidth = xRange;
            yShift = XBar(yData[i], minYData, maxYData, xAxisLength, tickLength,
                xFinesse, lineColor, plotEightId, cnvsEightCtx);
            
            // Now over-plot with the width of the "y-tickmark" scaled by the 
            // log number density in each E-level:
            //var xRangePops = Math.floor(xRange * (logE*logNums[lPoint[i]][tTau1] / maxXData));
            var xRangePops = Math.floor(xAxisLength * ( (logE * logNums[i][tTau1] - minXData) / (maxXData - minXData)));
            var tickWidthPops = 2;

 // Energy level logarithmic population horizontal bars:
           yShift = XBar(yData[i], minYData, maxYData, xRangePops, tickWidthPops,
                    xFinesse, RGBHex, plotEightId, cnvsEightCtx);

// yShift values for b-b transtion marker: 
           if (i === 2){
              yShiftL = yShift;  //lower transition level
                      }
           if (i === 3){
              yShiftU = yShift;  //lower transition level
                      }
            //Make the y-tick label:

           txtPrint(yRightTickValStr[i], yRightLabelXOffset[i], 
                yShift, lineColor, plotEightId);
         //cnvsEightCtx.font="normal normal normal 8pt arial";
         //cnvsEightCtx.fillText(yRightTickValStr[i], yRightLabelXOffset, yShift);
        }  // end y-tickmark loop, i

// Add ionization stage labels:

        //txtPrint("<span title='Singly ionized stage'>II</span>", xAxisXCnvs + xAxisLength - 15, 
        //        (yAxisYCnvs + yAxisLength) - yAxisLength, lineColor, plotEightId);
        //txtPrint("<span title='Neutral stage'>I</span>", xAxisXCnvs + xAxisLength - 15, 
        //        (yAxisYCnvs + yAxisLength) - yAxisLength / 2, lineColor, plotEightId);

        // b-b Transition indicator:

        var opac = 1.0;
        var opacStr = numToPxStrng(opac);
        var r255 = 0;
        var g255 = 100;
        var b255 = 255; // gray
        var RGBHex = colHex(r255, g255, b255);
        // Vertical bar:
        var vBarHeightCnvs = Math.floor(yShiftU - yShiftL);
        var xTickPosCnvs = (maxXData - minXData) / 3; // pixels
        var vBarWidth = 2; //pixels 
        var yFinesse = Math.floor(yShiftL - yAxisYCnvs); 
        xShiftDum = YBar(xTickPosCnvs, minXData, maxXData, vBarWidth, vBarHeightCnvs,
                         yFinesse, RGBHex, plotEightId, cnvsEightCtx); 
    }

// Detailed model output section:

//    
// Set up the canvas:
//

    // **********  Basic canvas parameters: These are numbers in px - needed for calculations:
    // All plots and other output must fit within this region to be white-washed between runs

    var xRangeT = 1750;
    var yRangeT = 10000;
    var xOffsetT = 10;
    var yOffsetT = 1500;
    var charToPxT = 4; // width of typical character font in pixels - CAUTION: finesse!

    var zeroInt = 0;
    //these are the corresponding strings ready to be assigned to HTML style attributes


    var xRangeTStr = numToPxStrng(xRangeT);
    var yRangeTStr = numToPxStrng(yRangeT);
    var xOffsetTStr = numToPxStrng(xOffsetT);
    var yOffsetTStr = numToPxStrng(yOffsetT);
    // Very first thing on each load: White-wash the canvas!!

    var washTId = document.createElement("div");
    var washTWidth = xRangeT + xOffsetT;
    var washTHeight = yRangeT + yOffsetT;
    var washTTop = yOffsetT;
    var washTWidthStr = numToPxStrng(washTWidth);
    var washTHeightStr = numToPxStrng(washTHeight);
    var washTTopStr = numToPxStrng(washTTop);

    washTId.id = "washT";
    washTId.style.position = "absolute";
    washTId.style.width = washTWidthStr;
    washTId.style.height = washTHeightStr;
    washTId.style.marginTop = washTTopStr;
    washTId.style.marginLeft = "0px";
    washTId.style.opacity = 1.0;
    washTId.style.backgroundColor = "#FFFFFF";
    //washId.style.zIndex = -1;
    washTId.style.zIndex = 0;
    //washTId.style.border = "2px blue solid";

    //Wash the canvas:
    printModelId.appendChild(washTId);

    // R & L_Bol:
    var colr = 0;
    var lineHeight = 17;
    var value, yTab;
    var vOffset = 60;
    var txtColor = "#000000"; //black

    if (ifPrintAtmos == true) {

        txtPrint("Vertical atmospheric structure", 10, yOffsetT, txtColor, printModelId);
        //Column headings:

        var xTab = 190;
        txtPrint("i", 10, yOffsetT + lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>&#964</em><sub>Rosseland</sub>", 10 + xTab, yOffsetT + lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>T</em><sub>Kin</sub> (K)", 10 + 2 * xTab, yOffsetT + lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>P</em><sub>Gas</sub> (dynes cm<sup>-2</sup>)", 10 + 3 * xTab, yOffsetT + lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>P</em><sub>Rad</sub> (dynes cm<sup>-2</sup>)", 10 + 4 * xTab, yOffsetT + lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>&#961</em> (g cm<sup>-3</sup>)", 10 + 5 * xTab, yOffsetT + lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>N</em><sub>e</sub> (cm<sup>-3</sup>)", 10 + 6 * xTab, yOffsetT + lineHeight, txtColor, printModelId);
        txtPrint("<em>&#956</em> (a.m.u.)", 10 + 7 * xTab, yOffsetT + lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>&#954</em> (cm<sup>2</sup> g<sup>-1</sup>)", 10 + 8 * xTab, yOffsetT + lineHeight, txtColor, printModelId);

        for (var i = 0; i < numDeps; i++) {
            yTab = yOffsetT + vOffset + i * lineHeight;
            numPrint(i, 10, yTab, txtColor, printModelId);
            value = logE * tauRos[1][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + xTab, yTab, txtColor, printModelId);
            value = logE * temp[1][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 2 * xTab, yTab, txtColor, printModelId);
            value = logE * press[1][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 3 * xTab, yTab, txtColor, printModelId);
            value = logE * press[3][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 4 * xTab, yTab, txtColor, printModelId);
            value = logE * rho[1][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 5 * xTab, yTab, txtColor, printModelId);
            value = logE * Ne[1][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 6 * xTab, yTab, txtColor, printModelId);
            value = mmw[i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 7 * xTab, yTab, txtColor, printModelId);
            value = logE * kappa[1][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 8 * xTab, yTab, txtColor, printModelId);

        }

    }


    if (ifPrintSED == true) {

        txtPrint("Monochromatic surface flux spectral energy distribution (SED)", 10, yOffsetT, txtColor, printModelId);
        //Column headings:

        var xTab = 190;
        txtPrint("log<sub>10</sub> <em>&#955</em> (cm)", 10, yOffsetT + lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>F</em><sub>&#955</sub> (ergs s<sup>-1</sup> cm<sup>-2</sup> cm<sup>-1</sup>)", 10 + xTab, yOffsetT + lineHeight, txtColor, printModelId);
        for (var i = 0; i < numMaster; i++) {
            yTab = yOffsetT + vOffset + i * lineHeight;
            value = logE * Math.log(masterLams[i]);
            value = value.toPrecision(9);
            numPrint(value, 10, yTab, txtColor, printModelId);
            value = logE * masterFlux[1][i];
            value = value.toPrecision(7);
            numPrint(value, 10 + xTab, yTab, txtColor, printModelId);
        }
    }


    if (ifPrintIntens == true) {

        txtPrint("Monochromatic specific intensity distribution", 10, yOffsetT, txtColor, printModelId);
        //Column headings:

        var xTab = 100;
        txtPrint("log<sub>10</sub><em>&#955</em> (cm)", 10, yOffsetT + lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub><em>I</em><sub>&#955</sub>(<em>&#952</em>) (ergs s<sup>-1</sup> cm<sup>-2</sup> cm<sup>-1</sup> steradian<sup>-1</sup>)",
                10 + xTab, yOffsetT + lineHeight, txtColor, printModelId);
        for (var j = 0; j < numThetas; j += 2) {
            value = cosTheta[1][j].toPrecision(5);
            txtPrint("cos <em>&#952</em>=" + value, 10 + (j + 1) * xTab, yOffsetT + 3 * lineHeight, txtColor, printModelId);
        }

        for (var i = 0; i < numMaster; i++) {
            yTab = yOffsetT + vOffset + (i+1) * lineHeight;
            value = logE * Math.log(masterLams[i]);
            value = value.toPrecision(9);
            numPrint(value, 10, yTab, txtColor, printModelId);
            for (var j = 0; j < numThetas; j += 2) {
                value = logE * masterIntens[i][j];
                value = value.toPrecision(7);
                numPrint(value, 10 + (j + 1) * xTab, yTab, txtColor, printModelId);
            }
        }
    }


    if (ifPrintLine == true) {

        txtPrint("Monochromatic line flux and atomic <em>E</em>-level populations", 10, yOffsetT, txtColor, printModelId);
        var xTab = 190;
        //Column headings:

        txtPrint("log<sub>10</sub> <em>&#955</em> (cm)", 10, yOffsetT + lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>F</em><sub>&#955</sub> (ergs s<sup>-1</sup> cm<sup>-2</sup> cm<sup>-1</sup>)",
                10 + xTab, yOffsetT + lineHeight, txtColor, printModelId);
        for (var i = 0; i < numPoints; i++) {
            yTab = yOffsetT + vOffset + i * lineHeight;
            value = logE * Math.log(lineLambdas[i]);
            value = value.toPrecision(9);
            numPrint(value, 10, yTab, txtColor, printModelId);
            value = logE * lineFlux2[1][i];
            value = value.toPrecision(7);
            numPrint(value, 10 + xTab, yTab, txtColor, printModelId);
        }


        var atomOffset = 750;
        var xTab = 200;
//From PLOT EIGHT (Grotrian diagram):

        var yData = [0.0, chiI1, chiL, chiU, chiI2];
        //console.log("yDatda[0] " + yData[0] + " yDatda[1] " + yData[1] + " yDatda[2] " + yData[2] + " yDatda[3] " + yData[3]);
        //console.log("chiI1 " + chiI1 + " chiL " + chiL + " chiU " + chiU);
        var yRightTickValStr = ["<em>&#967</em><sub>I</sub>", "<em>&#967</em><sub>II</sub>", "<span style='color:red'><em>&#967</em><sub>l</sub></span>", "<em>&#967</em><sub>u</sub>", "<em>&#967</em><sub>III</sub>"];
        //Column headings:
        txtPrint("log<sub>10</sub> <em>N</em><sub>i</sub> (cm<sup>-3</sup>)", 10, atomOffset + yOffsetT, txtColor, printModelId);
        txtPrint("i", 10, atomOffset + yOffsetT + 2 * lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>&#964</em><sub>Ross</sub>", 10 + xTab, atomOffset + yOffsetT + 2 * lineHeight, txtColor, printModelId);
        for (var j = 0; j < 5; j++) {
            yTab = atomOffset + yOffsetT + 2 * lineHeight;
            value = yRightTickValStr[j];
            txtPrint(value, 400 + j * xTab, yTab, txtColor, printModelId);
            value = yData[j].toPrecision(5);
            numPrint(value, 400 + j * xTab + 30, yTab, txtColor, printModelId);
            txtPrint("eV", 400 + j * xTab + 90, yTab, txtColor, printModelId);
        }

        for (var i = 0; i < numDeps; i++) {
            yTab = atomOffset + yOffsetT + (i + 4) * lineHeight;
            numPrint(i, 10, yTab, txtColor, printModelId);
            value = logE * tauRos[1][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + xTab, yTab, txtColor, printModelId);
            for (var j = 0; j < 5; j++) {
                value = logE * logNums[j][i];
                value = value.toPrecision(5);
                numPrint(value, 400 + j * xTab, yTab, txtColor, printModelId);
            }
        }
    } //printLine condition

    if (ifPrintLDC == true) {

        txtPrint("Linear monochromatic continuum limb darkening coefficients (LCD)", 10, yOffsetT, txtColor, printModelId);
        //Column headings:

        var xTab = 190;
        txtPrint("log<sub>10</sub> <em>&#955</em> (cm)", 10, yOffsetT + lineHeight, txtColor, printModelId);
        txtPrint("LDC", 10 + xTab, yOffsetT + lineHeight, txtColor, printModelId);
        for (var i = 0; i < numLams; i++) {
            yTab = yOffsetT + vOffset + i * lineHeight;
            value = logE * Math.log(lambdaScale[i]);
            value = value.toPrecision(9);
            numPrint(value, 10, yTab, txtColor, printModelId);
            value = ldc[i];
            value = value.toPrecision(7);
            numPrint(value, 10 + xTab, yTab, txtColor, printModelId);
        }
    }



//
//
//  *******    END CODE
// 
//
    return;
}
; //end function main()
