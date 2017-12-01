/*
 * The openStar project: stellar atmospheres and spectra
 *
 * ChromaStar
 * formerly known as GrayStar
 * March 2017
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
 *
 * Co-developers:
 *
 * Lindsey Burns (SMU) - 2017 - "lburns"
 * Jason Bayer (SMU) - 2017 - "JB"
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

//Links required to create elements easily
                      //JB
    var xmlns = "http://www.w3.org/2000/xmlns/";
    var xmlnsLink = "xmlns:xlink";
    var xmlnsLink2 = "http://w3.org/1999/xlink"; 
    var xmlW3 = "http://www.w3.org/2000/svg";    
                      //JB


// ********************************************

//***************************  Main ******************************



function main() {



//**********************************************************




// Input control:



    // Get the checkbox values controlling what's plotted:

    // Button for re-computing everything - if stellar parameters have changed
    var btnId = document.getElementById("btnId");
    btnId.onClick = function() {
    };
//
    //default initializations:

    var ifLineOnly = false;
    if ($("#lineOnly").is(":checked")) {
        ifLineOnly = true; // checkbox 
    }

    if (typeof (Storage) === "undefined") {
        ifLineOnly = false;
        console.log("No Web Storage support.  Everything will take longer...");
        window.alert("No Web Storage support. Re-setting 'line only' mode OFF");
    }

//JQuery:  Independent of order of switches in HTML file?
// Stellar atmospheric parameters
    var numInputs = 33;
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
    // jquery-ui round sliders -->
    //Round sliders Copyright (c) 2015-2016, Soundar
    //      http://roundsliderui.com/
      
    //var teff = 1.0 * $("#Teff").val(); // K
    //var teff = 1.0 * $("#Teff").roundSlider("getValue");
    var teffObj = $("#Teff").data("roundSlider");
    var teff = 1.0 * teffObj.getValue();
    //console.log("Teff read: " + teff);
    //var logg = 1.0 * $("#logg").val(); // log cgs
    //var logg = 1.0 * $("#logg").roundSlider("getValue");
    var loggObj = $("#logg").data("roundSlider");
    var logg = 1.0 * loggObj.getValue();
    //var zScale = 1.0 * $("#zScale").val(); // linear factor
    //var zScale = 1.0 * $("#zScale").roundSlider("getValue");
    var zScaleObj = $("#zScale").data("roundSlider");
    var log10ZScale = 1.0 * zScaleObj.getValue();
    //var massStar = 1.0 * $("#starMass").val(); // solar masses
    //var massStar = 1.0 * $("#starMass").roundSlider("getValue");
    var massStarObj = $("#starMass").data("roundSlider");
    var massStar = 1.0 * massStarObj.getValue();
// Planetary parameters for habitable zone calculation
    //var greenHouse = 1.0 * $("#GHTemp").val(); // Delta T_Surf boost K
    //var greenHouse = 1.0 * $("#GHTemp").roundSlider("getValue");
    var atmosPressObj = $("#AtmPress").data("roundSlider");
    var atmosPress = 1.0 * atmosPressObj.getValue();
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
    var stage = 1.0 * $("#stage").val(); //ionization stage of user species (0 (I) - 3 (IV)
    var chiI1 = 1.0 * $("#chi_I1").val(); // ground state chi_I, eV
    var chiI2 = 1.0 * $("#chi_I2").val(); // 1st ionized state chi_I, eV
    var chiI3 = 1.0 * $("#chi_I3").val(); // 2nd ionized state chi_I, eV
    var chiI4 = 1.0 * $("#chi_I4").val(); // 3rd ionized state chi_I, eV
    var chiL = 1.0 * $("#chi_L").val(); // lower atomic E-level, eV
    var gw1 = 1.0 * $("#gw_1").val(); // ground state state. weight or partition fn (stage I) - unitless
    var gw2 = 1.0 * $("#gw_2").val(); // ground state state. weight or partition fn (stage II) - unitless
    var gw3 = 1.0 * $("#gw_3").val(); // ground state state. weight or partition fn (stage III) - unitless
    var gw4 = 1.0 * $("#gw_4").val(); // ground state state. weight or partition fn (stage IV) - unitless
    var gwL = 1.0 * $("#gw_L").val(); // lower E-level state. weight - unitless

    var xiT = 1.0 * $("#xi_T").val(); // km/s
    var mass = 1.0 * $("#mass").val(); //amu, Carbon
    var logGammaCol = 1.0 * $("#gammaCol").val(); // log VanderWaals enhancement
    //
    var diskLambda = 1.0 * $("#diskLam").val(); //nm
    var diskSigma = 1.0 * $("#diskSigma").val(); //nm
    var logKapFudge = 1.0 * $("#logKapFudge").val(); //log_10 cm^2/g mass extinction fudge
    var macroV = 1.0 * $("#macroV").val(); // km/s
    var rotV = 1.0 * $("#rotV").val(); // km/s
    var rotI = 1.0 * $("#rotI").val(); // degrees
    var nOuterIter = $("#nOuterIter").val(); //number of outer HSE-EOS-Opacity iterations
    var nInnerIter = $("#nInnerIter").val(); //number of inner Pe-(ion. fraction) iterations
    // Add new variables to hold values for new metallicity controls lburns
    var logHeFe = 1.0 * $("#logAlphaFe").val(); // lburns
    var logCO = 1.0 * $("#logCO").val(); // lburns
    var logAlphaFe = 1.0 * $("#logAlphaFe").val(); // lburns
//    
    settingsId[0] = new setId("<em>T</em><sub>eff</sub>", teff);
    settingsId[1] = new setId("log <em>g</em>", logg);
    settingsId[2] = new setId("<em>&#954</em>", log10ZScale);
    settingsId[3] = new setId("<em>M</em>", massStar);
    settingsId[4] = new setId("<span style='color:green'>GHEff</span>", greenHouse);
    settingsId[5] = new setId("<span style='color:green'><em>A</em></span>", albedo);
    settingsId[6] = new setId("<em>&#955</em><sub>0</sub>", lam0);
    settingsId[7] = new setId("<em>A</em><sub>12</sub>", A12);
    settingsId[8] = new setId("log <em>f</em>", logF);
    settingsId[9] = new setId("stage", stage);
    settingsId[10] = new setId("<em>&#967</em><sub>I</sub>", chiI1);
    settingsId[11] = new setId("<em>&#967</em><sub>II</sub>", chiI2);
    settingsId[12] = new setId("<em>&#967</em><sub>III</sub>", chiI3);
    settingsId[13] = new setId("<em>&#967</em><sub>IV</sub>", chiI4);
    settingsId[14] = new setId("<em>&#967</em><sub>l</sub>", chiL);
    settingsId[15] = new setId("<em>g</em><sub>I</sub>", gw1);
    settingsId[16] = new setId("<em>g</em><sub>II</sub>", gw2);
    settingsId[17] = new setId("<em>g</em><sub>III</sub>", gw3);
    settingsId[18] = new setId("<em>g</em><sub>IV</sub>", gw4);
    settingsId[19] = new setId("<em>g</em><sub>l</sub>", gwL);
    settingsId[20] = new setId("<em>&#958</em><sub>T</sub>", xiT);
    settingsId[21] = new setId("<em>m</em>", mass);
    settingsId[22] = new setId("<em>&#947</em><sub>Col</sub>", logGammaCol);
    settingsId[23] = new setId("Disk<em>&#955</em><sub>0</sub>", diskLambda);
    settingsId[24] = new setId("&#963<sub>Filter</sub>", diskSigma);
    settingsId[25] = new setId("&#954<sub>Fudge</sub>", logKapFudge);
    settingsId[26] = new setId("<em>v</em><sub>Macro</sub>", macroV);
    settingsId[27] = new setId("<em>v</em><sub>Rot</sub>", rotV);
    settingsId[28] = new setId("<em>i</em><sub>Rot</sub>", rotI);
    settingsId[29] = new setId("<span style='color:green'>AtmP</span>", atmosPress);
    settingsId[30] = new setId("<em>[He/Fe]</em>", logHeFe); // lburns
    settingsId[31] = new setId("<em>[C/O]</em>", logCO); // lburns
    settingsId[32] = new setId("<em>[&#945/Fe]</em>", logAlphaFe); // lburns

    var solvent = "water"; //default intialization
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
    var ifShowLogNums = false;
    //
    var ifPrintNone = true;
    var ifPrintAtmos = false;
    var ifPrintSED = false;
    var ifPrintIntens = false;
    var ifPrintLDC = false;
    var ifPrintLine = false;
    var ifPrintChem = false;
    //
    var ifTiO = 0;

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
//
// Individual modules are checkboxes:
//TCorr:
        if ($("#tcorr").is(":checked")) {
            ifTcorr = true; // checkbox 
        }
//Convec:
        if ($("#convec").is(":checked")) {
            ifConvec = true; // checkbox
        }
//Voigt:
        if ($("#voigt").is(":checked")) {
            ifVoigt = true; // checkbox
        }
//Line scattering:
        if ($("#scatter").is(":checked")) {
            ifScatt = true; // checkbox
        }
    }

    if ($("#ifTiO").is(":checked")) {
        ifTiO = 1; // checkbox
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
    var ionEqElement = "None"; //default
    ionEqElement = $("#showLogNums").val();
    if (ionEqElement != "None") {
        ifShowLogNums = true; // checkbox
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
    if ($("#printChem").is(":checked")) {
        ifPrintChem = true; // checkbox
    }

    //       
//


    var switchStar = "None";
    var numPreStars = 9;
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
// Proxima Centauri (lburns)
    if ($("#alphacentc").is(":checked")) {
	switchStar = $("#alphacentc").val(); // radio
    }

// Fomalhaut (lburns)
    if ($("#fomalhaut").is(":checked")) {
	switchStar = $("#fomalhaut").val(); // radio
    }

//JQuery:
    if (switchStar === "Sun") {
        var teff = 5780.0;
        settingsId[0].value = 5780.0;
        //First version is if there's no JQuery-UI round sliders
        //
        //$("#Teff").val(5780.0);
        $("#Teff").roundSlider("setValue", "5780.0");
        var logg = 4.4;
        settingsId[1].value = 4.4;
        //$("#logg").val(4.4);
        $("#logg").roundSlider("setValue", "4.4");
        var log10ZScale = 0.0;
        settingsId[2].value = 0.0;
        //$("#zScale").val(0.0);
        $("#zScale").roundSlider("setValue", "0.0");
        var massStar = 1.0;
        settingsId[3].value = 1.0;
        //$("#starMass").val(1.0);
        $("#starMass").roundSlider("setValue", "1.0");
        var logKapFudge = 0.0;
        settingsId[25].value = 0.0;
        $("#logKapFudge").val(0.0);
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
        var log10ZScale = -0.5;
        settingsId[2].value = -0.5;
        //$("#zScale").val(-0.5);
        $("#zScale").roundSlider("setValue", "-0.5");
        var massStar = 1.1;
        settingsId[3].value = 1.1;
        //$("#starMass").val(1.1);
        $("#starMass").roundSlider("setValue", "1.1");
        var logKapFudge = 0.0;
        settingsId[25].value = 0.0;
        $("#logKapFudge").val(0.0);
        logAlphaFe = 0.3;
        settingsId[32].value = 0.3;
        $("#logAlphaFe").val(0.3);
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
        var log10ZScale = -0.5;
        settingsId[2].value = -0.5;
        //$("#zScale").val(-0.5);
        $("#zScale").roundSlider("setValue", "-0.5");
        var massStar = 2.1;
        settingsId[3].value = 2.1;
        //$("#starMass").val(2.1);
        $("#starMass").roundSlider("setValue", "2.1");
        var logKapFudge = 0.0;
        settingsId[25].value = 0.0;
        $("#logKapFudge").val(0.0);
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
        var log10ZScale = 0.0;
        settingsId[2].value = 0.0;
        //$("#zScale").val(0.0);
        $("#zScale").roundSlider("setValue", "0.0");
        var massStar = 3.8;
        settingsId[3].value = 3.8;
        //$("#starMass").val(3.8);
        $("#starMass").roundSlider("setValue", "3.8");
        var logKapFudge = 0.0;
        settingsId[25].value = 0.0;
        $("#logKapFudge").val(0.0);
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
        var log10ZScale = 0.0;
        settingsId[2].value = 0.0;
        //$("#zScale").val(0.0);
        $("#zScale").roundSlider("setValue", "0.0");
        var massStar = 1.4;
        settingsId[3].value = 1.4;
        //$("#starMass").val(1.4);
        $("#starMass").roundSlider("setValue", "1.4");
        var logKapFudge = 0.0;
        settingsId[25].value = 0.0;
        $("#logKapFudge").val(0.0);
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
        var log10ZScale = 0.0;
        settingsId[2].value = 0.0;
        //$("#zScale").val(0.0);
        $("#zScale").roundSlider("setValue", "0.0");
        var massStar = 0.6;
        settingsId[3].value = 0.6;
        //$("#starMass").val(0.63);
        $("#starMass").roundSlider("setValue", "0.6");
        var logKapFudge = 0.0;
        settingsId[25].value = 0.0;
        $("#logKapFudge").val(0.0);
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
        var log10ZScale = 0.0;
        settingsId[2].value = 0.0;
        //$("#zScale").val(0.0);
        $("#zScale").roundSlider("setValue", "0.0");
        var massStar = 1.1;
        settingsId[3].value = 1.1;
        //$("#starMass").val(1.11);
        $("#starMass").roundSlider("setValue", "1.1");
        var logKapFudge = 0.0;
        settingsId[25].value = 0.0;
        $("#logKapFudge").val(0.0);
    }
//Alpha Centauri C added 05/24 lburns
    if (switchStar === "Alpha Centauri C") {
	var teff = 3050.0;
	settingsId[0].value = 3050.0;
	//$("#Teff").val(3050.0);
	$("#Teff").roundSlider("setValue", "3050.0");
	var logg = 4.6;
	settingsId[1].value = 4.6;
	//$("#logg").val(4.6);
	$("#logg").roundSlider("setValue", "4.6");
	var log10ZScale = 0.0;
	settingsId[2].value = 0.0;
	//$("#zScale").val(0.0);
	$("#zScale").roundSlider("setValue", "0.0");
	var massStar = 0.1;
	settingsId[3].value = 0.1;
	//$("#starMass").val(0.12);
	$("#starMass").roundSlider("setValue", "0.1");
	var logKapFudge = 0.0;
	settingsId[25].value = 0.0;
	$("#logKapFudge").val(0.0);
    } 

//Fomalhaut added 06/15 lburns
    if (switchStar === "Fomalhaut") {
	var teff = 8590.0;
	settingsId[0].value = 8590.0;
	//$("#Teff").val(8590.0);
	$("#Teff").roundSlider("setValue", "8590.0");
	var logg = 4.2;
	settingsId[1].value = 4.2;
	//$("#logg").val(4.2);
	$("#logg").roundSlider("setValue", "4.2");
	var log10ZScale = 0.0;
	settingsId[2].value = 0.0;
	//$("#zScale").val(0.0);
	$("#zScale").roundSlider("setValue", "0.0");
	var massStar = 1.9;
	settingsId[3].value = 1.9;
	//$("#starMass").val(1.92);
	$("#starMass").roundSlider("setValue", "1.9");
	var logKapFudge = 0.0;
        settingsId[25].value = 0.0;
        $("#logKapFudge").val(0.0);	
    }


    var switchSolvent = "Water";
    var numSolvents = 4;

// Water 
    if ($("#water").is(":checked")) {
        switchSolvent = $("#water").val(); // radio 
        solvent = "water";
    }
// Methane 
    if ($("#methane").is(":checked")) {
        switchSolvent = $("#methane").val(); // radio 
        solvent = "methane";
    }
// Ammonia 
    if ($("#ammonia").is(":checked")) {
        switchSolvent = $("#ammonia").val(); // radio 
        solvent = "ammonia";
    }
// Carbon dioxide 
    if ($("#carbonDioxide").is(":checked")) {
        switchSolvent = $("#carbonDioxide").val(); // radio 
        solvent = "carbonDioxide";
    }
   

    var switchPlanet = "None";
    var numPrePlanets = 4;
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
        var solvent = "water";
        $('input[name="switchSolvent"]').val(["water"]);
        atmosPress = 101.3;
        var AtmPress = 101.3;
        settingsId[29].value = 101.3;
        //$("#AtmPress").val(101.3);
        $("#AtmPress").roundSlider("setValue", "100.0");
        greenHouse = 33.0;
        var GHTemp = 33.0;
        settingsId[4].value = 33.0;
        //$("#GHTemp").val(33.0);
        $("#GHTemp").roundSlider("setValue", "33.0");
        var albedo = 0.3;
        var Albedo = 0.3;
        settingsId[5].value = 0.3;
        //$("#Albedo").val(0.3);
        $("#Albedo").roundSlider("setValue", "0.3");
    }

// Mars 
    if ($("#mars").is(":checked")) {
        switchPlanet = $("#mars").val(); // radio 
    }

    if (switchPlanet === "Mars") {
        var solvent = "water";
        $('input[name="switchSolvent"]').val(["water"]);
        atmosPress = 0.6;
        var AtmPress = 0.6; //kPa
        settingsId[29].value = 0.6;
        //$("#AtmPress").val(0.6);
        $("#AtmPress").roundSlider("setValue", "0.6");
        greenHouse = 5.0;
        var GHTemp = 5.0;
        settingsId[4].value = 5.0;
        //$("#GHTemp").val(5.0);
        $("#GHTemp").roundSlider("setValue", "5.0");
        albedo = 0.25;
        var Albedo = 0.25;
        settingsId[5].value = 0.25;
        //$("#Albedo").val(0.25);
        $("#Albedo").roundSlider("setValue", "0.25");
    }

// Venus 
    if ($("#venus").is(":checked")) {
        switchPlanet = $("#venus").val(); // radio 
    }

    if (switchPlanet === "Venus") {
        solvent = "water";
        $('input[name="switchSolvent"]').val(["water"]);
        atmosPress = 9300.0;
        var AtmPress = 9300.0;
        settingsId[29].value = 9300;
        //$("#AtmPress").val(9300);
        $("#AtmPress").roundSlider("setValue", "9300");
        greenHouse = 510.0;
        var GHTemp = 510.0;
        settingsId[4].value = 510.0;
        //$("#GHTemp").val(510.0);
        $("#GHTemp").roundSlider("setValue", "510.0");
        albedo = 0.75;
        var Albedo = 0.75;
        settingsId[5].value = 0.75;
        //$("#Albedo").val(0.75);
        $("#Albedo").roundSlider("setValue", "0.75");
    }

// Titan
    if ($("#titan").is(":checked")) {
        switchPlanet = $("#titan").val(); // radio 
    }

    if (switchPlanet === "Titan") {
        var solvent = "methane";
        $('input[name="switchSolvent"]').val(["methane"]);
        atmosPress = 145.0;
        var AtmPress = 145.0;
        settingsId[29].value = 145.0;
        //$("#AtmPress").val(145.0);
        $("#AtmPress").roundSlider("setValue", "145.0");
        greenHouse = -10.0;
        var GHTemp = -10.0; 
        settingsId[4].value = -10.0;
        //$("#GHTemp").val(-10.0);
        $("#GHTemp").roundSlider("setValue", "-10.0");
        albedo = 0.75;
        var Albedo = 0.21;
        settingsId[5].value = 0.21;
        //$("#Albedo").val(0.21);
        $("#Albedo").roundSlider("setValue", "0.21");
    }

//console.log("solvent = " + solvent);

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

//
////Detailed checmical composition:
//Abundance table adapted from PHOENIX V. 15 input bash file
// Grevesse Asplund et al 2010
//Solar abundances:
// c='abundances, Anders & Grevesse',

    var numDeps = 48;
  var nelemAbnd = 40;
  var numStages = 7;
//  var nome = [];
//  nome.length = nelemAbnd;
  var eheu = []; 
  eheu.length = nelemAbnd; //log_10 "A_12" values
  var logAz = []; 
  logAz.length = nelemAbnd; //N_z/H_H for element z
  var logNz = [];
  logNz.length = nelemAbnd;
  for (var i = 0 ; i < nelemAbnd; i++){
     logNz[i] = [];
     logNz[i].length = numDeps;
  }
    var logNH = []; 
    logNH.length = numDeps;
//One more than stage than actual number populated:
  var masterStagePops = [];
  masterStagePops.length = nelemAbnd;
  for (var i = 0; i < nelemAbnd; i++){
     masterStagePops[i] = [];
     masterStagePops[i].length = numStages;
     for (var j = 0; j < numStages; j++){
        masterStagePops[i][j] = [];
        masterStagePops[i][j].length = numDeps;
     }
  }
//Default initialization of  masterStagePops - now necessary for iterative coupling of ionization
// and molecular equilibria
  for (var i = 0; i < nelemAbnd; i++){
     for (var j = 0; j < numStages; j++){
        for (var k = 0; k < numDeps; k++){
           masterStagePops[i][j][k] = -49.0; //logarithmic!
        }
     }
  }
  var cname = [];
  cname.length = nelemAbnd;
/*
//nome is the Kurucz code - in case it's ever useful
  nome[0]=   100;
  nome[1]=   200;
  nome[2]=   300;
  nome[3]=   400;
  nome[4]=   500;
  nome[5]=   600;
  nome[6]=   700;
  nome[7]=   800;
  nome[8]=   900;
  nome[9]=  1000;
  nome[10]=  1100;
  nome[11]=  1200;
  nome[12]=  1300;
  nome[13]=  1400;
  nome[14]=  1500;
  nome[15]=  1600;
  nome[16]=  1700;
  nome[17]=  1800;
  nome[18]=  1900;
  nome[19]=  2000;
  nome[20]=  2100;
  nome[21]=  2200;
  nome[22]=  2300;
  nome[23]=  2400;
  nome[24]=  2500;
  nome[25]=  2600;
  nome[26]=  2700;
  nome[27]=  2800;
  nome[28]=  2900;
  nome[29]=  3000;
  nome[30]=  3100;
  nome[31]=  3600;
  nome[32]=  3700;
  nome[33]=  3800;
  nome[34]=  3900;
  nome[35]=  4000;
  nome[36]=  4100;
  nome[37]=  5600;
  nome[38]=  5700;
  nome[39]=  5500;
*/
//log_10 "A_12" values:
 eheu[0]= 12.00;
 eheu[1]= 10.93;
 eheu[2]=  1.05;
 eheu[3]=  1.38;
 eheu[4]=  2.70;
 eheu[5]=  8.43;
 eheu[6]=  7.83;
 eheu[7]=  8.69;
 eheu[8]=  4.56;
 eheu[9]=  7.93;
 eheu[10]=  6.24;
 eheu[11]=  7.60;
 eheu[12]=  6.45;
 eheu[13]=  7.51;
 eheu[14]=  5.41;
 eheu[15]=  7.12;
 eheu[16]=  5.50;
 eheu[17]=  6.40;
 eheu[18]=  5.03;
 eheu[19]=  6.34;
 eheu[20]=  3.15;
 eheu[21]=  4.95;
 eheu[22]=  3.93;
 eheu[23]=  5.64;
 eheu[24]=  5.43;
 eheu[25]=  7.50;
 eheu[26]=  4.99;
 eheu[27]=  6.22;
 eheu[28]=  4.19;
 eheu[29]=  4.56;
 eheu[30]=  3.04;
 eheu[31]=  3.25;
 eheu[32]=  2.52;
 eheu[33]=  2.87;
 eheu[34]=  2.21;
 eheu[35]=  2.58;
 eheu[36]=  1.46;
 eheu[37]=  2.18;
 eheu[38]=  1.10;
 eheu[39]=  1.12;
//Associate diatomic molecules with each element that forms significant molecules:
//Initialize arrays:
  var numAssocMols = 4; //max number of associated molecules
  var cnameMols = [];
  cnameMols.length = nelemAbnd;
  for (var iElem = 0; iElem < nelemAbnd; iElem++){
     cnameMols[iElem] = [];
     cnameMols[iElem].length = numAssocMols;
     for (var iMol = 0; iMol < numAssocMols; iMol++){
         cnameMols[iElem][iMol] = "None";
     }  //iMol loop
  } //iElem loop
//CAUTION: cnameMols names should match mnames names in general list of molecules blow
//List the four molecular species most likely to deplete the atomic species A
  cname[0]="H";
  cnameMols[0][0] = "H2";
  cnameMols[0][1] = "H2+";
  cnameMols[0][2] = "CH";
  cnameMols[0][3] = "OH";
  cname[1]="He";
  cname[2]="Li";
  cname[3]="Be";
  cname[4]="B";
  cname[5]="C";
  cnameMols[5][0] = "CH";
  cnameMols[5][1] = "CO";
  cnameMols[5][2] = "CN";
  cnameMols[5][3] = "C2";
  cname[6]="N";
  cnameMols[6][0] = "NH";
  cnameMols[6][1] = "NO";
  cnameMols[6][2] = "CN";
  cnameMols[6][3] = "N2";
  cname[7]="O";
  cnameMols[7][0] = "OH";
  cnameMols[7][1] = "CO";
  cnameMols[7][2] = "NO";
  cnameMols[7][3] = "O2";
  cname[8]="F";
  cname[9]="Ne";
  cname[10]="Na";
  cname[11]="Mg";
  cnameMols[11][0] = "MgH";
  cname[12]="Al";
  cname[13]="Si";
  cnameMols[13][0] = "SiO";
  cname[14]="P";
  cname[15]="S";
  cname[16]="Cl";
  cname[17]="Ar";
  cname[18]="K";
  cname[19]="Ca";
  cnameMols[19][0] = "CaH";
  cnameMols[19][1] = "CaO";
  cname[20]="Sc";
  cname[21]="Ti";
  cnameMols[21][0] = "TiO";
  cname[22]="V";
  cnameMols[22][0] = "VO";
  cname[23]="Cr";
  cname[24]="Mn";
  cname[25]="Fe";
  cnameMols[25][0] = "FeO";
  cname[26]="Co";
  cname[27]="Ni";
  cname[28]="Cu";
  cname[29]="Zn";
  cname[30]="Ga";
  cname[31]="Kr";
  cname[32]="Rb";
  cname[33]="Sr";
  cname[34]="Y";
  cname[35]="Zr";
  cname[36]="Nb";
  cname[37]="Ba";
  cname[38]="La";
  cname[39]="Cs";

//Diatomic molecules:
//  var nMols = 18;
  var nMols = 1;
  var mname = [];
  var mnameA = [];
  var mnameB = [];
  mname.length = nMols;
  mnameA.length = nMols;
  mnameB.length = nMols;

//CAUTION: The molecular number densities, N_AB, will be computed, and will deplete the atomic species, in this order!
// Put anything where A or B is Hydrogen FIRST - HI is an inexhaustable reservoir at low T
// Then rank molecules according to largest of A and B abundance, "weighted" by dissociation energy - ??
//
// For constituent atomic species, A and B, always designate as 'A' whichever element participates in the 
//  *fewest other* molecuels - we'll put A on the LHS of the molecular Saha equation

/*  mname[0] = "H2";
  mnameA[0] = "H"; 
  mnameB[0] = "H"; 
  mname[1] = "H2+";
  mnameA[1] = "H"; 
  mnameB[1] = "H"; 
  mname[2] = "OH";
  mnameA[2] = "O"; 
  mnameB[2] = "H"; 
  mname[3] = "CH";
  mnameA[3] = "C"; 
  mnameB[3] = "H"; 
  mname[4] = "NH";
  mnameA[4] = "N"; 
  mnameB[4] = "H"; 
  mname[5] = "MgH";
  mnameA[5] = "Mg"; 
  mnameB[5] = "H"; 
  mname[6] = "CaH";
  mnameA[6] = "Ca"; 
  mnameB[6] = "H"; 
  mname[7] = "O2";
  mnameA[7] = "O"; 
  mnameB[7] = "O"; 
  mname[8] = "CO";
  mnameA[8] = "C"; 
  mnameB[8] = "O"; 
  mname[9] = "C2";
  mnameA[9] = "C"; 
  mnameB[9] = "C"; 
  mname[10] = "NO";
  mnameA[10] = "N"; 
  mnameB[10] = "O"; 
  mname[11] = "CN";
  mnameA[11] = "C"; 
  mnameB[11] = "N"; 
  mname[12] = "N2";
  mnameA[12] = "N"; 
  mnameB[12] = "N"; 
  mname[13] = "FeO";
  mnameA[13] = "Fe"; 
  mnameB[13] = "O"; 
  mname[14] = "SiO";
  mnameA[14] = "Si"; 
  mnameB[14] = "O"; 
  mname[15] = "CaO";
  mnameA[15] = "Ca"; 
  mnameB[15] = "O";  */
  mname[0] = "TiO";
  mnameA[0] = "Ti"; 
  mnameB[0] = "O"; 
/*  mname[17] = "VO";
  mnameA[17] = "V"; 
  mnameB[17] = "O";  */


//Set up for molecules with JOLA bands:
   var jolaTeff = 5000.0;
   //var jolaTeff = 1500.0; //test
   var numJola = 2; //for now
   //var numJola = 2; // test
   var jolaSpecies = []; // molecule name
   jolaSpecies.length = numJola;
   var jolaSystem = []; //band system
   jolaSystem.length = numJola;
   var jolaDeltaLambda = []; //band system
   jolaDeltaLambda.length = numJola;

   if (teff <= jolaTeff){

     jolaSpecies[0] = "TiO"; // molecule name
     jolaSystem[0] = "TiO_C3Delta_X3Delta"; //band system //DeltaLambda=0
     jolaDeltaLambda[0] = 0;
     jolaSpecies[1] = "TiO"; // molecule name
     jolaSystem[1] = "TiO_c1Phi_a1Delta"; //band system //DeltaLambda=1
     jolaDeltaLambda[1] = 1;
     //jolaSpecies[2] = "TiO"; // molecule name
     //jolaSystem[2] = "TiO_A3Phi_X3Delta"; //band system //DeltaLambda=0
     //jolaDeltaLambda[2] = 0;

   }

// For new metallicity commands lburns
// For logHeFe: (lburns)
    var flagArr = [];
    flagArr.length = numInputs;
    if (logHeFe === null || logHeFe === "") {
	alert("logHeFe must be filled out");
	return;
    }
    flagArr[30] = false;
    if (logHeFe < -1.0) {
	flagArr[30] = true;
	logHeFe = -1.0;
	var logHeFeStr = "-1.0";
	settingsId[30].value = -1.0;
	$("#logHeFe").val(-1.0);
    }
    if (logHeFe > 1.0) {
	flagArr[30] = true;
	logHeFe = 1.0;
	var logHeFeStr = "1.0";
	settingsId[30].value = 1.0;
	$("#logHeFe").val(1.0);
    }
// For logCO: (lburns)
    if (logCO === null || logCO === "") {
	alert("logCO must be filled out");
	return;
    }
    flagArr[31] = false;
    if (logCO < -2.0) {
	flagArr[31] = true;
	logCO = -2.0;
	var logCOStr = "-2.0";
	settingsId[31].value = -2.0;
	$("#logCO").val(-2.0);
    }
    if (logCO > 2.0) {
	flagArr[31] = true;
	logCO = 2.0;
	var logCOStr = "2.0";
	settingsId[31].value = 2.0;
	$("#logCO").val(2.0);
    }
// For logAlphaFe: (lburns)
    if (logAlphaFe === null || logAlphaFe === "") {
	alert("logAlphaFe must be filled out");
	return;
    }
    flagArr[32] = false;
    if (logAlphaFe < -0.5) {
	flagArr[32] = true;
	logAlphaFe = -0.5;
	var logAlphaFeStr = "-0.5";
	settingsId[32].value = -0.5;
	$("#logAlphaFe").val(-0.5);
    }
    if (logAlphaFe > 0.5) {
	flagArr[32] = true;
	logAlphaFe = 0.5;
	var logAlphaFeStr = "0.5";
	settingsId[32].value = 0.5;
	$("#logAlphaFe").val(0.5);
    }



  var logE = logTen(Math.E); // for debug output
  var logE10 = Math.log(10.0);
  var ATot = 0.0;
  var thisAz, eheuScale;

     // Set value of eheuScale for new metallicity options. 06/17 lburns
      if (logHeFe != 0.0) {
           eheu[1] = eheu[1] + logHeFe;
        }
        if (logAlphaFe != 0.0) {
           eheu[7] = eheu[7] + logAlphaFe;
           eheu[9] = eheu[9] + logAlphaFe;
           eheu[11] = eheu[11] + logAlphaFe;
           eheu[13] = eheu[13] + logAlphaFe;
           eheu[15] = eheu[15] + logAlphaFe;
           eheu[17] = eheu[17] + logAlphaFe;
           eheu[19] = eheu[19] + logAlphaFe;
           eheu[21] = eheu[21] + logAlphaFe;
        }
        if (logCO > 0.0) {
           eheu[5] = eheu[5] + logCO;
           //console.log("logCO " + logCO);
        }
        if (logCO < 0.0) {
           eheu[7] = eheu[7] + Math.abs(logCO);
	   //console.log("logCO " + logCO);
        }
	//console.log("logCO " + logCO);

  for (var i = 0; i < nelemAbnd; i++){
     eheuScale = eheu[i]; //default intialization // still base 10
     if (i > 1){  //if not H or He
        eheuScale = eheu[i] + log10ZScale;  //stil base 10
     }
     //logAz[i] = logE10 * (eheu[i] - 12.0); //natural log
     logAz[i] = logE10 * (eheuScale - 12.0); //natural log
     thisAz = Math.exp(logAz[i]);
     ATot = ATot + thisAz;
     //System.out.println("i " + i + " logAz " + logE*logAz[i]);
  }
  var logATot = Math.log(ATot); //natural log

    //The following is a 5-element vector of temperature-dependent partition fns, U,
    // that are base e10 log_10 U, a la Allen's Astrophysical Quantities
       var log10Gw1V = [];
       log10Gw1V.length = 5;
       var log10Gw2V = [];
       log10Gw2V.length = 5;
       var log10Gw3V = [];
       log10Gw3V.length = 5;
       var log10Gw4V = [];
       log10Gw4V.length = 5;
//Default is to set both temperature-dependent values to to the user-input value:
// Loop that defaults the temperature dependent values to user input, now with 5 temperatures lburns
for (var i = 0; i < log10Gw1V.length; i++) {
    log10Gw1V[i] = logTen(gw1);
    log10Gw2V[i] = logTen(gw2);
    log10Gw3V[i] = logTen(gw3);
    log10Gw4V[i] = logTen(gw4);
}

    var thisCname = " ";

    var ifPreSetSpecies = false; // default
//JQuery:
    if (switchLine === "NaID1") {
        ifPreSetSpecies = true; 
        thisCname = "Na";
        var lam0 = 589.592;
        settingsId[6].value = 589.592;
        $("#lambda_0").val(589.592);
        var A12 = eheu[10]; // Grevesse & Sauval 98
        settingsId[7].value = eheu[10];
        $("#A12").val(eheu[10]);
        var logF = -0.495;
        settingsId[8].value = -0.495;
        $("#logf").val(-0.495);
        var stage = 0;
        settingsId[9].value = 0;
        $("#stage").val(0);
        var chiL = 0.0;
        settingsId[14].value = 0.0;
        $("#chi_L").val(0.0);
        var gwL = 2.0;
        settingsId[19].value = 2.0;
        $("#gw_L").val(2.0);
        var logGammaCol = 1.0;
        settingsId[22].value = 1.0;
        $("#gammaCol").val(1.0);
    }

    if (switchLine === "NaID2") {
        ifPreSetSpecies = true; 
        thisCname = "Na";
        var lam0 = 588.995;
        settingsId[6].value = 588.995;
        $("#lambda_0").val(588.995);
        var A12 = eheu[10]; // Grevesse & Sauval 98
        settingsId[7].value = eheu[10];
        $("#A12").val(eheu[10]);
        var logF = -0.193;
        settingsId[8].value = -0.193;
        $("#logf").val(-0.193);
        var stage = 0;
        settingsId[9].value = 0;
        $("#stage").val(0);
        var chiL = 0.0;
        settingsId[14].value = 0.0;
        $("#chi_L").val(0.0);
        var gwL = 2.0;
        settingsId[19].value = 2.0;
        $("#gw_L").val(2.0);
        var logGammaCol = 1.0;
        settingsId[22].value = 1.0;
        $("#gammaCol").val(1.0);
    }

    if (switchLine === "MgIb1") {
        ifPreSetSpecies = true; 
        thisCname = "Mg";
        var lam0 = 518.360;
        settingsId[6].value = 518.360;
        $("#lambda_0").val(518.360);
        var A12 = eheu[11]; // Grevesse & Sauval 98
        settingsId[7].value = eheu[11];
        $("#A12").val(eheu[11]);
        var logF = -0.867;
        settingsId[8].value = -0.867;
        $("#logf").val(-0.867);
        var stage = 0;
        settingsId[9].value = 0;
        $("#stage").val(0);
        var chiL = 2.717;
        settingsId[14].value = 2.717;
        $("#chi_L").val(2.717);
        var gwL = 5.0;
        settingsId[19].value = 5.0;
        $("#gw_L").val(5.0);
        var logGammaCol = 1.0;
        settingsId[22].value = 1.0;
        $("#gammaCol").val(1.0);
    }

    if (switchLine === "CaIIK") {
        ifPreSetSpecies = true; 
        thisCname = "Ca";
        var lam0 = 393.366;
        settingsId[6].value = 393.366;
        $("#lambda_0").val(393.366);
        var A12 = eheu[19]; // Grevesse & Sauval 98
        settingsId[7].value = eheu[19];
        $("#A12").val(eheu[19]);
        var logF = -0.166;
        settingsId[8].value = -0.166;
        $("#logf").val(-0.166);
        var stage = 1;
        settingsId[9].value = 1;
        $("#stage").val(1);
        //This is necessary for consistency with Stage II treatment of user-defined spectral line:
        var chiL = 0.0;
        settingsId[14].value = 0.0;
        $("#chi_L").val(0.0);
        var gwL = 2.0;
        settingsId[19].value = 2.0;
        $("#gw_L").val(2.0);
        var logGammaCol = 0.0;
        settingsId[22].value = 0.0;
        $("#gammaCol").val(0.0);
    }

    if (switchLine === "CaIIH") {
        ifPreSetSpecies = true; 
        thisCname = "Ca";
        var lam0 = 396.847;
        settingsId[6].value = 396.847;
        $("#lambda_0").val(396.847);
        var A12 = eheu[19]; // Grevesse & Sauval 98
        settingsId[7].value = eheu[19];
        $("#A12").val(eheu[19]);
        var logF = -0.482;
        settingsId[8].value = -0.482;
        $("#logf").val(-0.482);
        var stage = 1;
        settingsId[9].value = 1;
        $("#stage").val(1);
        //This is necessary for consistency with Stage II treatment of user-defined spectral line:
        var chiL = 0.0;
        settingsId[14].value = 0.0;
        $("#chi_L").val(0.0);
        var gwL = 2.0;
        settingsId[19].value = 2.0;
        $("#gw_L").val(2.0);
        var logGammaCol = 0.0;
        settingsId[22].value = 0.0;
        $("#gammaCol").val(0.0);
    }

    if (switchLine === "CaI4227") {
        ifPreSetSpecies = true; 
        thisCname = "Ca";
        var lam0 = 422.673;
        settingsId[6].value = 422.673;
        $("#lambda_0").val(422.673);
        var A12 = eheu[19]; // Grevesse & Sauval 98
        settingsId[7].value = eheu[19];
        $("#A12").val(eheu[19]);
        var logF = 0.243;
        settingsId[8].value = 0.243;
        $("#logf").val(0.243);
        var stage = 0;
        settingsId[9].value = 0;
        $("#stage").val(0);
        var chiL = 0.0;
        settingsId[14].value = 0.0;
        $("#chi_L").val(0.0);
        var gwL = 1.0;
        settingsId[19].value = 1.0;
        $("#gw_L").val(1.0);
        var logGammaCol = 0.0;
        settingsId[22].value = 0.0;
        $("#gammaCol").val(0.0);
    }

    if (switchLine === "FeI4045") {
        ifPreSetSpecies = true; 
        thisCname = "Fe";
        var lam0 = 404.581;
        settingsId[6].value = 404.581;
        $("#lambda_0").val(404.581);
        var A12 = eheu[25]; // Grevesse & Sauval 98
        settingsId[7].value = eheu[25];
        $("#A12").val(eheu[25]);
        var logF = -0.674;
        settingsId[8].value = -0.674;
        $("#logf").val(-0.674);
        var stage = 0;
        settingsId[9].value = 0;
        $("#stage").val(0);
        var chiL = 1.485;
        settingsId[14].value = 1.485;
        $("#chi_L").val(1.485);
        var gwL = 9.0;
        settingsId[19].value = 9.0;
        $("#gw_L").val(9.0);
        var logGammaCol = 0.0;
        settingsId[22].value = 0.0;
        $("#gammaCol").val(0.0);
    }

    if (switchLine === "FeI4271") {
        ifPreSetSpecies = true; 
        thisCname = "Fe";
        var lam0 = 427.176;
        settingsId[6].value = 427.176;
        $("#lambda_0").val(427.176);
        var A12 = eheu[25]; // Grevesse & Sauval 98
        settingsId[7].value = eheu[25];
        $("#A12").val(eheu[25]);
        var logF = -1.118;
        settingsId[8].value = -1.118;
        $("#logf").val(-1.118);
        var stage = 0;
        settingsId[9].value = 0;
        $("#stage").val(0);
        var chiL = 1.485;
        settingsId[14].value = 1.485;
        $("#chi_L").val(1.485);
        var gwL = 9.0;
        settingsId[19].value = 9.0;
        $("#gw_L").val(9.0);
        var logGammaCol = 0.0;
        settingsId[22].value = 0.0;
        $("#gammaCol").val(0.0);
    }

    if (switchLine === "HeI4387") {
        ifPreSetSpecies = true; 
        thisCname = "He";
        var lam0 = 438.793;
        settingsId[6].value = 438.793;
        $("#lambda_0").val(438.793);
        var A12 = eheu[1]; // Grevesse & Sauval 98
        settingsId[7].value = eheu[1];
        $("#A12").val(eheu[1]);
        var logF = -1.364;
        settingsId[8].value = -1.364;
        $("#logf").val(-1.364);
        var stage = 0;
        settingsId[9].value = 0;
        $("#stage").val(0);
        var chiL = 21.218;
        settingsId[14].value = 21.218;
        $("#chi_L").val(21.218);
        var gwL = 3.0;
        settingsId[19].value = 3.0;
        $("#gw_L").val(3.0);
        var logGammaCol = 0.0;
        settingsId[22].value = 0.0;
        $("#gammaCol").val(0.0);
    }

    if (switchLine === "HeI4471") {
        ifPreSetSpecies = true; 
        thisCname = "He";
        var lam0 = 447.147;
        settingsId[6].value = 447.147;
        $("#lambda_0").val(447.147);
        var A12 = eheu[1]; // Grevesse & Sauval 98
        settingsId[7].value = eheu[1];
        $("#A12").val(eheu[1]);
        var logF = -0.986;
        settingsId[8].value = -0.986;
        $("#logf").val(-0.986);
        var stage = 0;
        settingsId[9].value = 0;
        $("#stage").val(0);
        var chiL = 20.964;
        settingsId[14].value = 20.964;
        $("#chi_L").val(20.964);
        var gwL = 5.0;
        settingsId[19].value = 5.0;
        $("#gw_L").val(5.0);
        var logGammaCol = 0.0;
        settingsId[22].value = 0.0;
        $("#gammaCol").val(0.0);
    }

//
        if (ifPreSetSpecies == true){ 
         //console.log("thisCname " + thisCname);
         var thisGw1, thisGw2;
         species = thisCname + "I";
         chiI1 = getIonE(species);
         settingsId[10].value = chiI1;
         $("#chi_I1").val(chiI1);
      //THe following is a 2-element vector of temperature-dependent partitio fns, U,
      // that are base e log_e U, a la Allen's Astrophysical Quantities
         //log10Gw1V = getPartFn(species); //base 10 log_10 U
         log10Gw1V = getPartFn2(species); //lburns
         thisGw1 = Math.pow(10.0, log10Gw1V[0]);
         settingsId[15].value = thisGw1;
         $("#gw_1").val(thisGw1);
         species = thisCname + "II";
         chiI2 = getIonE(species);
         settingsId[11].value = chiI2;
         $("#chi_I2").val(chiI2);
         //log10Gw2V = getPartFn(species); //base 10 log_10 U
         log10Gw2V = getPartFn2(species);//lburns
         thisGw2 = Math.pow(10.0, log10Gw2V[0]);
         settingsId[16].value = thisGw2;
         $("#gw_2").val(thisGw2);
         species = thisCname + "III";
         chiI3 = getIonE(species);
         //log10Gw3V = getPartFn(species); //base 10 log_10 U
         log10Gw3V = getPartFn2(species);//lburns
         species = thisCname + "IV";
         chiI4 = getIonE(species);
         //log10Gw4V = getPartFn(species); //base 10 log_10 U
         log10Gw4V = getPartFn2(species); //lburns
         mass = getMass(thisCname);
         settingsId[21].value = mass;
         $("#mass").val(mass);
}

    //
    // Form validation and Initial sanity checks:
    // 

// Stellar parameters:
//
    flagArr[0] = false;
    var F0Vtemp = 7300.0;  // Teff of F0 V star (K)       
    var minTeff = 3000.0;
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
    if (log10ZScale === null || log10ZScale === "") {
        alert("log10ZScale must be filled out");
        return;
    }
    flagArr[2] = false;
    if (log10ZScale < -3.0) {
        flagArr[2] = true;
        log10ZScale = -3.0;
        var logZStr = "-3.0";
        settingsId[2].value = -3.0;
        //$("#zScale").val(-2.0);
        $("#zScale").roundSlider("setValue", -3.0);
    }
    if (log10ZScale > 1.0) {
        flagArr[2] = true;
        log10ZScale = 1.0;
        var zStr = "1.0";
        settingsId[2].value = 1.0;
        //$("#zScale").val(0.5);
        $("#zScale").roundSlider("setValue", 1.0);
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
    var zScale = Math.pow(10.0, log10ZScale);
    //

    // Planetary parameters for habitable zone calculation:
    //
    
        var earthP = 101.3; //Earth sea level pressure in kPa
//initialize variables with values for water:
       var phaseA = 4.6543;
       var phaseB = 1435.264;
       var phaseC = -64.848; 
       var criticalTemp = 647.096; //K 
       var criticalPress = 22.06e3; //kPa 
       var criticalPressStr = "22060"; //kPa 
       var tripleTemp = 273.16; //K 
       var triplePress = 0.611657; //kPa 
       var triplePressStr = "0.62"; //kPa 
//Solvent blocks with Antoine coefficients (A, B, C) for approximate relation between 
//temperature in K and vapor pressure bar 
// and critical- and triple- point temperatures and pressures
//- taken from NIST Chemistry WebBook
//Brown, R.L. & Stein, S.E., "Boiling Point Data" in NIST Chemistry WebBook, NIST Standard Reference Database Number 69, Eds. P.J. Linstrom and W.G. Mallard, National Institute of Standards and Technology, Gaithersburg MD, 20899, doi:10.18434/T4D303, (retrieved April 12, 2017).
   if (solvent == "water"){
//  Values for T below 100 C = 373 K 
       if (atmosPress <= earthP){
         phaseA = 4.6543;
         phaseB = 1435.264;
         phaseC = -64.848; 
       } else {
         phaseA = 3.55959;
         phaseB = 643.748;
         phaseC = -198.043;
       }
       criticalTemp = 647.096; //K 
       criticalPress = 22.06e3; //kPa 
       criticalPressStr = "22060"; //kPa 
       tripleTemp = 273.16; //K 
       triplePress = 0.611657; //kPa 
       triplePressStr = "0.62"; //kPa 
   } //water block
   if (solvent == "methane"){
       phaseA = 3.9895;
       phaseB = 443.028;
       phaseC = -0.49; 
       criticalTemp = 190.8; //K 
       criticalPress = 4640.0; //kPa 
       criticalPressStr = "4640"; //kPa 
       tripleTemp = 90.68; //K 
       triplePress = 11.7; //kPa 
       triplePressStr = "12"; //kPa 
   } //methane block
   if (solvent == "ammonia"){
//  Values for T below ??? K 
      // if (atmosPress <= ????){
         phaseA = 3.18757;
         phaseB = 506.713;
         phaseC = -80.78; 
      // } else {
      //   phaseA = 4.86886;
      //   phaseB = 1113.928;
      //   phaseC = -10.409;
      // }
       criticalTemp = 405.5; //K 
       criticalPress = 11280; //kPa 
       criticalPressStr = "11280"; //kPa 
       tripleTemp = 195.40; //K 
       triplePress = 6.076; //kPa 
       triplePressStr = "6.1"; //kPa 
   } //ammonia block
   if (solvent == "carbonDioxide"){
       phaseA = 6.81228;
       phaseB = 1301.679;
       phaseC = -3.494; 
       criticalTemp = 304.19; //K 
       criticalPress = 7380; //kPa 
       criticalPressStr = "7380"; //kPa 
       tripleTemp = 216.55; //K 
       triplePress = 517.0; //kPa 
       triplePressStr = "517"; //kPa 
   } //carbonDioxide block
  
    if (atmosPress === null || atmosPress === "") {
        alert("atmosPress must be filled out");
        return;
    }
    flagArr[29] = false;
    if (atmosPress < triplePress) {
        flagArr[29] = true;
        atmosPress = triplePress;
        var atmosPressStr = triplePressStr;
        settingsId[29].value = triplePress;
        //$("#AtmPress").val(triplePress);
        $("#AtmPress").roundSlider("setValue", triplePress);
    }
    if (atmosPress > criticalPress) {
        flagArr[29] = true;
        atmosPress = criticalPress;
        var atmosPressStr = criticalPressStr;
        settingsId[29].value = criticalPress;
        //$("#AtmPress").val(criticalPress);
        $("#AtmPress").roundSlider("setValue", criticalPress);
    }
    flagArr[4] = false;
    if (greenHouse < -200.0) {
        flagArr[4] = true;
        greenHouse = -200.0;
        var greenHouseStr = "-200.0";
        settingsId[4].value = -200.0;
        //$("#GHTemp").val(-200.0);
        $("#GHTemp").roundSlider("setValue", -200.0);
    }
    if (greenHouse > 600.0) {
        flagArr[4] = true;
        greenHouse = 600.0;
        var greenHouseStr = "600.0";
        settingsId[4].value = 600.0;
        //$("#GHTemp").val(600.0);
        $("#GHTemp").roundSlider("setValue", 600.0);
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
    if (albedo > 0.95) {
        flagArr[5] = true;
        albedo = 0.95;
        var albedoStr = "0.95";
        settingsId[5].value = 0.95;
        //$("#Albedo").val(0.95);
        $("#Albedo").roundSlider("setValue", 0.95);
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
        var lamStr = "1000";
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
    if (stage === null || stage === "") {
        alert("stage must be filled out");
        return;
    }
    flagArr[9] = false;
    if ( (stage != 0) && (stage != 1) && (stage != 2) && (stage != 3) ) {
        flagArr[9] = true;
        stage = 0;
        var stageStr = "I";
        settingsId[9].value = 0;
        $("#stage").val(0);
    }
    if (chiI1 === null || chiI1 == "") {
        alert("chiI1 must be filled out");
        return;
    }
    if (chiI2 === null || chiI2 == "") {
        alert("chiI2 must be filled out");
        return;
    }
    if (chiI3 === null || chiI3 == "") {
        alert("chiI3 must be filled out");
        return;
    }
    if (chiI4 === null || chiI4 == "") {
        alert("chiI4 must be filled out");
        return;
    }
    if (chiL === null || chiL === "") {
        alert("chiL must be filled out");
        return;
    }
    flagArr[10] = false;
    if (chiI1 < 3.0) {
        flagArr[10] = true;
        chiI1 = 3.0;
        var ionStr = "3.0";
        settingsId[10].value = 3.0;
        $("#chi_I1").val(3.0);
    }
    if (chiI1 > 25.0) {
        flagArr[10] = true;
        chiI1 = 25.0;
        var ionStr = "25.0";
        settingsId[10].value = 25.0;
        $("#chi_I1").val(25.0);
    }

    flagArr[11] = false;
    if (chiI2 < 5.0) {
        flagArr[11] = true;
        chiI2 = 5.0;
        var ionStr = "5.0";
        settingsId[11].value = 5.0;
        $("#chi_I2").val(5.0);
    }
    if (chiI2 > 55.0) {
        flagArr[11] = true;
        chiI2 = 55.0;
        var ionStr = "55.0";
        settingsId[11].value = 55.0;
        $("#chi_I2").val(55.0);
    }


    flagArr[12] = false;
    if (chiI3 < 5.0) {
        flagArr[12] = true;
        chiI3 = 5.0;
        var ionStr = "5.0";
        settingsId[12].value = 5.0;
        $("#chi_I3").val(5.0);
    }
    if (chiI3 > 55.0) {
        flagArr[12] = true;
        chiI3 = 55.0;
        var ionStr = "55.0";
        settingsId[12].value = 55.0;
        $("#chi_I3").val(55.0);
    }


    flagArr[13] = false;
    if (chiI4 < 5.0) {
        flagArr[13] = true;
        chiI4 = 5.0;
        var ionStr = "5.0";
        settingsId[13].value = 5.0;
        $("#chi_I4").val(5.0);
    }
    if (chiI4 > 55.0) {
        flagArr[13] = true;
        chiI4 = 55.0;
        var ionStr = "55.0";
        settingsId[13].value = 55.0;
        $("#chi_I4").val(55.0);
    }

    // Note: Upper limit of chiL depends on value of chiI1 above!
    flagArr[14] = false;
    if (chiL < 0.0) {
        flagArr[14] = true;
        chiL = 0.0; // Ground state case!
        var excStr = "0.0";
        settingsId[14].value = 0.0;
        $("#chi_L").val(0.0);
    }
    if ( (stage == 0) && (chiL >= chiI1) ) {
        flagArr[14] = true;
        //ionized = false;
        chiL = 0.9 * chiI1;
        var excStr = ionStr;
        settingsId[14].value = chiL;
        $("#chi_L").val(chiL);
    }
    if ( (stage == 1) && (chiL >= chiI2) ) {
        flagArr[14] = true;
        //ionized = false;
        chiL = 0.9 * chiI2;
        var excStr = ionStr;
        settingsId[14].value = chiL;
        $("#chi_L").val(chiL);
    }
    if ( (stage == 2) && (chiL >= chiI3) ) {
        flagArr[14] = true;
        //ionized = false;
        chiL = 0.9 * chiI3;
        var excStr = ionStr;
        settingsId[14].value = chiL;
        $("#chi_L").val(chiL);
    }
    if ( (stage == 3) && (chiL >= chiI4) ) {
        flagArr[14] = true;
        //ionized = false;
        chiL = 0.9 * chiI4;
        var excStr = ionStr;
        settingsId[14].value = chiL;
        $("#chi_L").val(chiL);
    }

    if (gw1 === null || gw1 == "") {
        alert("gw1 must be filled out");
        return;
    }
    if (gw2 === null || gw2 == "") {
        alert("gw2 must be filled out");
        return;
    }
    if (gw3 === null || gw2 == "") {
        alert("gw2 must be filled out");
        return;
    }
    if (gw4 === null || gw2 == "") {
        alert("gw2 must be filled out");
        return;
    }
    if (gwL === null || gwL == "") {
        alert("gwL must be filled out");
        return;
    }
    flagArr[15] = false;
    if (gw1 < 1.0) {
        flagArr[15] = true;
        gw1 = 1.0;
        var ionStr = "1";
        settingsId[15].value = 1.0;
        $("#gw_1").val(1.0);
    }
    if (gw1 > 100.0) {
        flagArr[15] = true;
        gw1 = 100.0;
        var ionStr = "100";
        settingsId[15].value = 100.0;
        $("#gw_1").val(100.0);
    }

    flagArr[16] = false;
    if (gw2 < 1.0) {
        flagArr[16] = true;
        gw2 = 1.0;
        var ionStr = "1";
        settingsId[16].value = 1.0;
        $("#gw_2").val(1.0);
    }
    if (gw2 > 100.0) {
        flagArr[16] = true;
        gw2 = 100.0;
        var ionStr = "100";
        settingsId[16].value = 100.0;
        $("#gw_2").val(100.0);
    }

    flagArr[17] = false;
    if (gw3 < 1.0) {
        flagArr[17] = true;
        gw3 = 1.0;
        var ionStr = "1";
        settingsId[17].value = 1.0;
        $("#gw_3").val(1.0);
    }
    if (gw3 > 100.0) {
        flagArr[17] = true;
        gw3 = 100.0;
        var ionStr = "100";
        settingsId[17].value = 100.0;
        $("#gw_3").val(100.0);
    }

    flagArr[18] = false;
    if (gw4 < 1.0) {
        flagArr[18] = true;
        gw4 = 1.0;
        var ionStr = "1";
        settingsId[18].value = 1.0;
        $("#gw_4").val(1.0);
    }
    if (gw4 > 100.0) {
        flagArr[18] = true;
        gw4 = 100.0;
        var ionStr = "100";
        settingsId[18].value = 100.0;
        $("#gw_4").val(100.0);
    }

    flagArr[19] = false;
    if (gwL < 1.0) {
        flagArr[19] = true;
        gwL = 1.0;
        var ionStr = "1";
        settingsId[19].value = 1.0;
        $("#gw_L").val(1.0);
    }
    if (gwL > 100.0) {
        flagArr[19] = true;
        gwL = 100.0;
        var ionStr = "100";
        settingsId[19].value = 100.0;
        $("#gw_L").val(100.0);
    }
    if (xiT === null || xiT === "") {
        alert("xiT must be filled out");
        return;
    }
    flagArr[20] = false;
    if (xiT < 0.0) {
        flagArr[20] = true;
        xiT = 0.0;
        var xitStr = "0.0";
        settingsId[20].value = 0.0;
        $("#xi_T").val(0.0);
    }
    if (xiT > 4.0) {
        flagArr[20] = true;
        xiT = 4.0;
        var xitStr = "4.0";
        settingsId[20].value = 4.0;
        $("#xi_T").val(4.0);
    }
    if (mass === null || mass == "") {
        alert("mass must be filled out");
        return;
    }
    flagArr[21] = false;
    if (mass < 1.0) {
        flagArr[21] = true;
        mass = 1.0;
        var massStr = "1.0";
        settingsId[21].value = 1.0;
        $("#mass").val(1.0);
    }
    if (mass > 200.0) {
        flagArr[21] = true;
        mass = 200.0;
        var massStr = "200";
        settingsId[21].value = 200.0;
        $("#mass").val(200.0);
    }
    if (logGammaCol === null || logGammaCol === "") {
        alert("logGammaCol must be filled out");
        return;
    }
    flagArr[22] = false;
    if (logGammaCol < 0.0) {
        flagArr[22] = true;
        logGammaCol = 0.0;
        var gamStr = "0.0";
        settingsId[22].value = 0.0;
        $("#gammaCol").val(0.0);
    }
    if (logGammaCol > 1.0) {
        flagArr[22] = true;
        logGammaCol = 1.0;
        var gamStr = "1.0";
        settingsId[22].value = 1.0;
        $("#gammaCol").val(1.0);
    }
    if (logKapFudge === null || logKapFudge === "") {
        alert("logKapFudge must be filled out");
        return;
    }
    flagArr[25] = false;
    if (logKapFudge < -2.0) {
        flagArr[25] = true;
        logKapFudge = -2.0;
        var logKapFudgeStr = "-2.0";
        settingsId[25].value = -2.0;
        $("#logKapFudge").val(-2.0);
    }
    if (logKapFudge > 2.0) {
        flagArr[25] = true;
        logKapFudge = 2.0;
        var logKapFudgeStr = "2.0";
        settingsId[25].value = 2.0;
        $("#logKapFudge").val(2.0);
    }


    if (macroV === null || macroV === "") {
        alert("macroV must be filled out");
        return;
    }
    flagArr[26] = false;
    if (macroV < 0.0) {
        flagArr[26] = true;
        macroV = 0.0;
        var macroVStr = "0.0";
        settingsId[26].value = 0.0;
        $("#macroV").val(0.0);
    }
    if (macroV > 8.0) {
        flagArr[26] = true;
        macroV = 8.0;
        var macroVStr = "8.0";
        settingsId[26].value = 8.0;
        $("#macroV").val(8.0);
    }

    if (rotV === null || rotV === "") {
        alert("rotV must be filled out");
        return;
    }
    flagArr[27] = false;
    if (rotV < 0.0) {
        flagArr[27] = true;
        rotV = 0.0;
        var rotVStr = "0.0";
        settingsId[27].value = 0.0;
        $("#rotV").val(0.0);
    }
    if (rotV > 20.0) {
        flagArr[27] = true;
        rotV = 20.0;
        var rotVStr = "20.0";
        settingsId[27].value = 20.0;
        $("#rotV").val(20.0);
    }

    if (rotI === null || rotI === "") {
        alert("rotI must be filled out");
        return;
    }
    flagArr[28] = false;
    if (rotI < 0.0) {
        flagArr[28] = true;
        rotI = 0.0;
        var rotIStr = "0.0";
        settingsId[28].value = 0.0;
        $("#rotI").val(0.0);
    }
    if (rotI > 90.0) {
        flagArr[28] = true;
        rotI = 90.0;
        var rotIStr = "90.0";
        settingsId[28].value = 90.0;
        $("#rotI").val(90.0);
    }

    if (nOuterIter === null || nOuterIter === "") {
        alert("nOuterIter must be filled out");
        return;
    }
    //flagArr[28] = false;
    if (nOuterIter < 5) {
        //flagArr[28] = true;
        nOuterIter = 5;
        var nOuterIterStr = "5";
        //settingsId[28].value = 0.0;
        $("#nOuterIter").val(5);
    }
    if (nOuterIter > 12) {
        //flagArr[28] = true;
        nOuterIter = 12;
        var nOuterIterStr = "12";
        //settingsId[28].value = 90.0;
        $("#nOuterIter").val(12);
    }

    if (nInnerIter === null || nInnerIter === "") {
        alert("nInnerIter must be filled out");
        return;
    }
    //flagArr[28] = false;
    if (nInnerIter < 5) {
        //flagArr[28] = true;
        nInnerIter = 5;
        var nInnerIterStr = "5";
        //settingsId[28].value = 0.0;
        $("#nInnerIter").val(5);
    }
    if (nInnerIter > 12) {
        //flagArr[28] = true;
        nInnerIter = 12;
        var nInnerIterStr = "12";
        //settingsId[28].value = 90.0;
        $("#nInnerIter").val(12);
    }


//For rotation:
  var inclntn = Math.PI * rotI / 180;  //degrees to radians
  var vsini = rotV * Math.sin(inclntn);


//
//// ************************
////
////  OPACITY  PROBLEM #1 - logFudgeTune:  late type star coninuous oapcity needs to have by multiplied
////  by 10.0^0.5 = 3.0 for T_kin(tau~1) to fall around Teff and SED to look like B_lmabda(Trad=Teff).
////   - related to Opacity problem #2 in LineKappa.lineKap() - ??
////
//
  var logFudgeTune = 0.0;
  //sigh - don't ask me - makes the Balmer lines show up around A0:
      if (teff <= F0Vtemp){
          logFudgeTune = 0.5;
      }
      if (teff > F0Vtemp){
          logFudgeTune = 0.0;
      }
     
   var logTotalFudge = logKapFudge + logFudgeTune;


// This has to be up here for some reason:
// Get the ID of the container div:


    var textId = document.getElementById("outPanel"); // text output area

    //var masterId = document.getElementById("container"); // graphical output area
   // var plotOneId = document.getElementById("plotOne");
   // var cnvsOneId = document.getElementById("plotOneCnvs");
   // var cnvsOneCtx = cnvsOneId.getContext("2d"); 

                        //JB
    var newPlotTwoId = document.getElementById("newPlotTwo");
    var SVGTwo = document.getElementById("SVG2");
                        //JB    
                        //JB
    var newPlotThreeId = document.getElementById("newPlotThree");
    var SVGThree = document.getElementById("SVG3");
                        //JB
                        //JB
    var newPlotFourId = document.getElementById("newPlotFour");
    var SVGFour = document.getElementById("SVG4");
                        //JB
    //JB
    var newPlotFiveId = document.getElementById("newPlot5");
    var SVGFive = document.getElementById("SVG5");

    var newPlotSixId = document.getElementById("newPlotSix");
    var SVGSix = document.getElementById("SVG6");
                                //JB
    var newPlotSevenId = document.getElementById("newPlotSeven");
    var SVGSeven = document.getElementById("SVG7");
                                //JB
    var newPlotEightId = document.getElementById("newPlotEight");
    var SVGEight = document.getElementById("SVG8");
                                //JB
    var newPlotNineId = document.getElementById("newPlotNine");
    var SVGNine = document.getElementById("SVG9");
                                //JB
    var newPlotTenId = document.getElementById("newPlotTen");
    var SVGTen = document.getElementById("SVG10");
                                //JB
    var newPlotElevenId = document.getElementById("newPlotEleven");
    var SVGEleven = document.getElementById("SVG11");
                                //JB
    var newPlotTwelveId = document.getElementById("newPlotTwelve");
    var SVGTwelve = document.getElementById("SVG12");
                                //JB
    var printModelId = document.getElementById("printModel"); //detailed model print-out area
                                //JB
    var newPlotFourteenId=document.getElementById("newPlotFourteen");
    var SVGFourteen = document.getElementById("SVG14");
                                //JB
    var newPlotFifteenId=document.getElementById("newPlotFifteen");
    var SVGFifteen = document.getElementById("SVG15");
                                //JB
    var newPlotSixteenId = document.getElementById("newPlotSixteen");
    var SVGSixteen = document.getElementById("SVG16");
                                //JB
    var newPlotSeventeenId=document.getElementById("newPlotSeventeen");
    var SVGSeventeen = document.getElementById("SVG17");
                                //JB

    var printModelId = document.getElementById("printModel"); //detailed model print-out area


    if (ifShowAtmos === true) {
        //plotOneId.style.display = "block";
        newPlotTwoId.style.display = "block";
        newPlotThreeId.style.display = "block";
        newPlotFourteenId.style.display = "block";
        newPlotFifteenId.style.display = "block";
        if($("#showLogNums").val()=="None"){
        newPlotSixteenId.style.display = "none";
        }
        newPlotSeventeenId.style.display ="none";
    }

    if (ifShowRad === true) {
        newPlotFourId.style.display = "block";
        newPlotFiveId.style.display = "block";
        newPlotSeventeenId.style.display = "block";
        newPlotSixteenId.style.display="block";
                if($("#showLogNums").val()=="None"){
        newPlotSixteenId.style.display = "none";
        }
    }
    if (ifShowLine === true) {
        newPlotSixId.style.display = "block";
        newPlotEightId.style.display = "block";
                if($("#showLogNums").val()=="None"){
        newPlotSixteenId.style.display = "none";
        }
    }
    if (ifShowLogNums === true) {
        //plotSixId.style.display = "block";
        newPlotEightId.style.display = "block";
        if($("#showLogNums").val()=="None"){
        newPlotSixteenId.style.display = "none";
        }
    }

    if (ifShowAtmos === false) {
        //plotOneId.style.display = "none";
        newPlotTwoId.style.display = "none";
        newPlotThreeId.style.display = "none";
        newPlotFourteenId.style.display = "none";
        newPlotFifteenId.style.display = "none";
        newPlotSixteenId.style.display = "none";
    }

    if (ifShowRad === false) {
        newPlotFourId.style.display = "none";
       // plotFiveId.style.display = "none";
    }
    if (ifShowLine === false) {
        newPlotSixId.style.display = "none";
        newPlotEightId.style.display = "none";
    }
    if ((ifPrintAtmos === true) ||
            (ifPrintSED === true) ||
            (ifPrintIntens === true) ||
            (ifPrintLDC === true) ||
            (ifPrintChem === true) ||
            (ifPrintLine === true)) {
        printModelId.style.display = "block";
    } else if (ifPrintNone === true) {
        printModelId.style.display = "none";
    }

    // Begin compute code:


    //Atmospheric structure and Voigt line code code begins here:
    // Initial set-up:

    // optical depth grid
    var log10MinDepth = -6.0;
    var log10MaxDepth = 2.0;

    //var numLams = 250;
    var numLams = 200;
    //var lamUV = 300.0;
    var lamUV = 260.0;
    //var lamIR = 1000.0;
    var lamIR = 2600.0;
    var lamSetup = [lamUV * 1.0e-7, lamIR * 1.0e-7, numLams]; //Start, end wavelength (nm), number of lambdas
 
    var lambdaScale = lamgrid(numLams, lamSetup); //nm

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
    var log10ZScaleSun = 0.0;
    var zScaleSun = Math.exp(log10ZScaleSun);

    //Solar units:
    var massSun = 1.0;
    var radiusSun = 1.0;
    var logRadius = 0.5 * (Math.log(massStar) + Math.log(gravSun) - Math.log(grav));
    var radius = Math.exp(logRadius);
    //var radius = Math.sqrt(massStar * gravSun / grav); // solar radii
    var logLum = 2.0 * Math.log(radius) + 4.0 * Math.log(teff / teffSun);
    var bolLum = Math.exp(logLum); // L_Bol in solar luminosities 

    //cgs units:
    var rSun = 6.955e10; // solar radii to cm
    //console.log("radius " + radius + " rSun " + rSun + " cgsRadius " + cgsRadius);
    var cgsRadius = radius * rSun;
    var omegaSini = (1.0e5 * vsini) / cgsRadius; // projected rotation rate in 1/sec
    var macroVkm = macroV * 1.0e5;  //km/s to cm/s

    //Composition by mass fraction - needed for opacity approximations
    //   and interior structure
    var massX = 0.70; //Hydrogen
    var massY = 0.28; //Helium
    var massZSun = 0.02; // "metals"
    var massZ = massZSun * zScale; //approximation

// Is this the first computation *at all* in the current Web session??
// We only need to compute the Sun's structure once - ever

    //Store basic stellar parameters that control atmospheric structure:


    //log_10 Rosseland optical depth scale  
    var tauRos = tauScale(numDeps, log10MinDepth, log10MaxDepth);

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
    var pGasSun = [];
    pGasSun.length = 2;
    pGasSun[0] = [];
    pGasSun[1] = [];
    pGasSun[0].length = numDeps;
    pGasSun[1].length = numDeps;
    var pGasSunGuess = [];
    pGasSunGuess.length = 2;
    pGasSunGuess[0] = [];
    pGasSunGuess[1] = [];
    pGasSunGuess[0].length = numDeps;
    pGasSunGuess[1].length = numDeps;
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
  var numStages = 4;

    if (ifLineOnly === true) {

        var teff = Number(sessionStorage.getItem("teff"));
        settingsId[0].value = Number(sessionStorage.getItem("teff"));
        $("#Teff").val(Number(sessionStorage.getItem("teff")));
        var logg = Number(sessionStorage.getItem("logg"));
        settingsId[1].value = Number(sessionStorage.getItem("logg"));
        $("#logg").val(Number(sessionStorage.getItem("logg")));
        var zScale = Number(sessionStorage.getItem("zScale"));
        settingsId[2].value = Number(sessionStorage.getItem("zScale"));
        $("#zScale").val(Number(sessionStorage.getItem("zScale")));
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
            storeName = "pGasSun" + String(i);
            pGasSun[1][i] = Number(sessionStorage.getItem(storeName));
            pGasSun[0][i] = Math.exp(pGasSun[1][i]);
            storeName = "rhoSun" + String(i);
            rhoSun[1][i] = Number(sessionStorage.getItem(storeName));
            rhoSun[0][i] = Math.exp(rhoSun[1][i]);
            storeName = "mmwSun" + String(i);
            mmwSun[i] = Number(sessionStorage.getItem(storeName));
            storeName = "NeSun" + String(i);
            NeSun[1][i] = Number(sessionStorage.getItem(storeName));
            NeSun[0][i] = Math.exp(NeSun[1][i]);
        }


    } else {

        var k = 1.3806488E-16; // Boltzmann constant in ergs/K
        var logK = Math.log(k);
        //Rescaled  kinetic temeprature structure: 
        var tempSun = phxSunTemp(teffSun, numDeps, tauRos);
        //
        // BEGIN Initial guess for Sun section:
        //Now do the same for the Sun, for reference:
        var pGasSunGuess = phxSunPGas(gravSun, numDeps, tauRos);
        var NeSun = phxSunNe(gravSun, numDeps, tauRos, tempSun, zScaleSun);
        var kappaSun = phxSunKappa(numDeps, tauRos, zScaleSun);
        mmwSun = mmwFn(numDeps, tempSun, zScaleSun);
        var rhoSun = massDensity(numDeps, tempSun, pGasSunGuess, mmwSun, zScaleSun);
        pGasSun = hydroFormalSoln(numDeps, gravSun, tauRos, kappaSun, tempSun, pGasSunGuess);
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
    var depths = [];
    depths.length = numDeps;
    var logKappa = [];
    logKappa.length = numLams;
    for (var i = 0; i < numLams; i++){
       logKappa[i] = [];
       logKappa[i].length = numDeps;
    }
    var logKappaHHe = [];
    logKappaHHe.length = numLams;
    for (var i = 0; i < numLams; i++){
       logKappaHHe[i] = [];
       logKappaHHe[i].length = numDeps;
    }
    var logKappaMetalBF = [];
    logKappaMetalBF.length = numLams;
    for (var i = 0; i < numLams; i++){
       logKappaMetalBF[i] = [];
       logKappaMetalBF[i].length = numDeps;
    }
    var logKappaRayl = [];
    logKappaRayl.length = numLams;
    for (var i = 0; i < numLams; i++){
       logKappaRayl[i] = [];
       logKappaRayl[i].length = numDeps;
    }

    var pGas = [];
    var pRad = [];
    pGas.length = 2;
    pRad.length = 2;
    pGas[0] = [];
    pGas[1] = [];
    pRad[0] = [];
    pRad[1] = [];
    pGas[0].length = numDeps;
    pGas[1].length = numDeps;
    pRad[0].length = numDeps;
    pRad[1].length = numDeps;
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
    var logNH = []; 
    logNH.length = numDeps;
    var thisLogN = [];
    thisLogN.length = numDeps;
    var newNe = [];
    newNe.length = 2;
    newNe[0] = [];
    newNe[1] = [];
    newNe[0].length = numDeps;
    newNe[1].length = numDeps;
  var kappaRos = [];
  kappaRos.length = 2;
  kappaRos[0] = [];
  kappaRos[1] = [];
  kappaRos[0].length = numDeps;
  kappaRos[1].length = numDeps;
  var kappa500 = [];
  kappa500.length = 2;
  kappa500[0] = [];
  kappa500[1] = [];
  kappa500[0].length = numDeps;
  kappa500[1].length = numDeps;

  var chiIArr = [];
  chiIArr.length = numStages;
// safe initialization:
  for (var i; i < numStages; i++){
      chiIArr[i] = 999999.0;
  }
  var log10UwAArr = [];
  log10UwAArr.length = numStages;
  for (var i = 0; i < numStages; i++){
    log10UwAArr[i] = [];
    log10UwAArr[i].length = 5;
    for (var k = 0; k < log10UwAArr[0].length; k++){
        log10UwAArr[i][k] = 0.0; //lburns default initialization - logarithmic
    }
  }
// This holds 2-element temperature-dependent base e logarithmic parition fn:
// Change this to hold a five-element temp-dependent base e log part fn lburns
        var thisUwV = []; 
        thisUwV.length = 5;
   // Below created a loop to initialize each value to zero for the five temperatures lburns
   for (i = 0; i < thisUwV.length; i++) {
        thisUwV[i] = 0.0;
   }

//
    if (ifLineOnly === true) {

        //We've already stored the stellar structure - just retrieve logarithmic quantities
        // and reconstruct linear quantities

        for (var i = 0; i < numDeps; i++) {
            storeName = "temp" + String(i);
            temp[1][i] = Number(sessionStorage.getItem(storeName));
            temp[0][i] = Math.exp(temp[1][i]);
            storeName = "depth" + String(i);
            depths[i] = Number(sessionStorage.getItem(storeName));
            for (var iL = 0; iL < numLams; iL++){
               storeName = "kapp" + String(iL) + "_" + String(i);
               logKappa[iL][i] = Number(sessionStorage.getItem(storeName));
            }
            storeName = "pGas" + String(i);
            pGas[1][i] = Number(sessionStorage.getItem(storeName));
            pGas[0][i] = Math.exp(pGas[1][i]);
            storeName = "pRad" + String(i);
            pRad[1][i] = Number(sessionStorage.getItem(storeName));
            pRad[0][i] = Math.exp(pRad[1][i]);
            storeName = "rho" + String(i);
            rho[1][i] = Number(sessionStorage.getItem(storeName));
            rho[0][i] = Math.exp(rho[1][i]);
            storeName = "mmw" + String(i);
            mmw[i] = Number(sessionStorage.getItem(storeName));
            storeName = "Ne" + String(i);
            Ne[1][i] = Number(sessionStorage.getItem(storeName));
            Ne[0][i] = Math.exp(Ne[1][i]);
            storeName = "newNe" + String(i);
            newNe[1][i] = Number(sessionStorage.getItem(storeName));
            newNe[0][i] = Math.exp(newNe[1][i]);
            storeName = "logNH" + String(i);
            logNH[i] = Number(sessionStorage.getItem(storeName));
            storeName = "kappaRos" + String(i);
            kappaRos[1][i] = Number(sessionStorage.getItem(storeName));
            kappaRos[0][i] = Math.exp(kappaRos[1][i]);
            storeName = "kappa500" + String(i);
            kappa500[1][i] = Number(sessionStorage.getItem(storeName));
            kappa500[0][i] = Math.exp(kappa500[1][i]);
        }

    } else {

        ////Gray kinetic temeprature structure: - deprecated
        //Rescaled  kinetic temeprature structure: 
        //var F0Vtemp = 7300.0;  // Teff of F0 V star (K)       
        if (teff < F0Vtemp) {
            //We're a cool star! - rescale from 5000 K reference model 
            temp = phx5kRefTemp(teff, numDeps, tauRos);
        } else if (teff >= F0Vtemp) {
            //We're a HOT star! - rescale from 10000 K reference model 
            temp = phx10kRefTemp(teff, numDeps, tauRos);
        }

        //Scaled from Phoenix solar model:
        var guessPGas = [];
        guessPGas.length = 2;
        guessPGas[0] = [];
        guessPGas[1] = [];
        guessPGas[0].length = numDeps;
        guessPGas[1].length = numDeps;
        var guessPe = [];
        guessPe.length = 2;
        guessPe[0] = [];
        guessPe[1] = [];
        guessPe[0].length = numDeps;
        guessPe[1].length = numDeps;
        var guessNe = [];
        guessNe.length = 2;
        guessNe[0] = [];
        guessNe[1] = [];
        guessNe[0].length = numDeps;
        guessNe[1].length = numDeps;


        if (teff < F0Vtemp) {
            //We're a cool star - rescale from 5000 K reference model! 
            guessPGas = phx5kRefPGas(grav, zScale, logAz[1], numDeps, tauRos);
            guessPe = phx5kRefPe(teff, grav, numDeps, tauRos, zScale, logAz[1]);
            guessNe = phx5kRefNe(numDeps, temp, guessPe);
        } else if (teff >= F0Vtemp) {
            //We're a HOT star!! - rescale from 10000 K reference model 
            guessPGas = phx10kRefPGas(grav, zScale, logAz[1], numDeps, tauRos);
            guessPe = phx10kRefPe(teff, grav, numDeps, tauRos, zScale, logAz[1]);
            guessNe = phx10kRefNe(numDeps, temp, guessPe);
        }

      logNz = getNz(numDeps, temp, guessPGas, guessPe, ATot, nelemAbnd, logAz);
      for (var i = 0 ; i < numDeps; i++){ 
         logNH[i] = logNz[0][i];
  //set the initial guess H^+ number density to the e^-1 number density
         masterStagePops[0][1][i] = guessPe[1][i]; //iElem = 0: H; iStage = 1: II
         //System.out.println("i " + i + " logNH[i] " + logE*logNH[i]);
      } 
 
 //Load the total no. density of each element into the nuetral stage slots of the masterStagePops array as a first guess at "species B" neutral
 //populations for the molecular Saha eq. - Reasonable first guess at low temp where molecuales form
 
    for (var iElem = 0; iElem < nelemAbnd; iElem++){
       for (var iD = 0; iD < numDeps; iD++){
          masterStagePops[iElem][0][iD] = logNz[iElem][iD];
       }
    }
 

        // *********************
   //Jul 2016: Replace the following procedure for model building with the following PSEUDOCODE:
   //
   // 1st guess Tk(tau), Pe(tau), Pg(tau) from rescaling reference hot or cool model above
   // 1) Converge Pg-Pe relation for Az abundance distribution and  T_Kin(Tau)
   //   assuming all free e^-s from single ionizations - *inner* convergence
   // 2) Compute N_H from converged Pg-Pe relation
   //    A_Tot = Sigma_z(A_z)
   //         -> N_H(tau) = (Pg(tau)-Pe(tau))/{kTk(tau)A_Tot}
   //         -> N_z(tau) = A_z * N_H(tau)
   // 3) Obtain N_HI, N_HII, N_HeI, and N_HeII at all depths
   // 4)Get rho(tau) = Sigma_z(m_z*N_z(tau)) and mu(tau) = rho(tau) / N(tau)
   //    - needed for kappa in cm^2/g
   // 5) kappa(tau) from Gray Ch. 8 sources - H, He, and e^- oapcity sources only
   // 6) P_Tot(tau) from HSE on tau scale with kappa from 4)
   //    - PRad(tau) from Tk(tau)
   //    - New Pg(tau) from P_Tot(tau)-PRad(tau)
   // 7) Iterate Pg - kappa relation to convergence - *outer* convergence
   // 8)Get rho(tau) = Sigma_z(m_z*N_z(tau)) and mu(tau) = rho(tau) / N(tau)
   //   and depth scale
   //
   //  ** Atmospheric structure converged **
   //
   // THEN for spectrum synthesis:
   //
   // 1) Separate iteration of Ne against ionization fractions fI(tau), fII, fIII, fIV, fV(tau)
   // from Saha(Tk(tau), Pe(tau))
   //   AND coupled molecualr equilibrium
   //    -  LevelPops.stagePops2()
   // 2) new Ne(tau) from Sigma_z{fI(tau) .... 5*fV(tau) * N_z}
   // 3) Iterate
   // 4) Temp correction??


//One more than stage than actual number populated:
  var species = " "; //default initialization
  var tauOneStagePops = [];
  tauOneStagePops.length = nelemAbnd;
  for (var i = 0; i < nelemAbnd; i++){
     tauOneStagePops[i] = [];
     tauOneStagePops[i].length = numStages;
  }
  var unity = 1.0;
  var zScaleList = 1.0; //initialization
//
//For diatomic molecules:
 var speciesAB = " ";
 var speciesA = " ";
 var speciesB = " ";
 var massA, massB, logMuAB;
 var masterMolPops = [];
 masterMolPops.length = nMols; 
 for (var i = 0; i < nMols; i++){
    masterMolPops[i] = [];
    masterMolPops[i].length = numDeps;
 }
//initialize masterMolPops for mass density (rho) calculation:
  for (var i = 0; i < nMols; i++){
    for (var j = 0; j < numDeps; j++){
       masterMolPops[i][j] = -49.0;  //these are logarithmic
    }
  }
  //var thisUwAV = [];
  //thisUwAV.length = 2;
  //var thisUwBV = [];
  //thisUwBV.length = 2;
  var thisQwAB;
  var thisDissE;
//
  var newPe = [];
  newPe.length = 2;
  newPe[0] = [];
  newPe[1] = [];
  newPe[0].length = numDeps;
  newPe[1].length = numDeps;
//For atomic and ionic species:
  var logNums = [];
  logNums.length = numStages;
  for (var i = 0; i < numStages; i++){
    logNums[i] = [];
    logNums[i].length = numDeps;
  }
// For diatomic molecules:
  var logNumA = [];
  logNumA.length = numDeps;
  var logNumB = [];
  logNumB.length = numDeps;
  var logNumFracAB = [];
  logNumFracAB.length = numDeps;
//
  var Ng = []; 
  Ng.length = numDeps;
  //var mmw = []; 
  //mmw.length = numDeps;
  var logMmw;
  var newTemp = [];
  newTemp.length = 2;
  newTemp[0] = [];
  newTemp[1] = [];
  newTemp[0].length = numDeps;
  newTemp[1].length = numDeps;

//Variables for ionization/molecular equilibrium treatment:
//for diatomic molecules
       var logNumBArr = [];
       logNumBArr.length = numAssocMols;
       var log10UwBArr = [];
       log10UwBArr.length = numAssocMols;

       for (var i = 0; i < numAssocMols; i++){
          logNumBArr[i] = [];
          logNumBArr[i].length = numDeps;
          log10UwBArr[i] = [];
          log10UwBArr[i].length = 5;
       }
       var dissEArr = [];
       dissEArr.length = numAssocMols;
       var logQwABArr = [];
       logQwABArr.length = numAssocMols;
       for (var kk = 0; kk < numAssocMols; kk++){
          logQwABArr[kk] = [];
          logQwABArr[kk].length = 5;
       }
       var logMuABArr = [];
       logMuABArr.length = numAssocMols;

// Arrays of pointers into master molecule and element lists:
   var mname_ptr = [];
   mname_ptr.length = numAssocMols;
   var specB_ptr = [];
   specB_ptr.length = numAssocMols;
   var specA_ptr = 0;
   var specB2_ptr = 0;
   var mnameBtemplate = " ";

//
//We converge the Pgas - Pe relation first under the assumption that all free e^-s are from single ionizations
// a la David Gray Ch. 9.
// This approach separates converging ionization fractions and Ne for spectrum synthesis purposes from
// converging the Pgas-Pe-N_H-N_He relation for computing the mean opacity for HSE
//
var thisTemp = [];
thisTemp.length = 2;
var log10UwUArr = [];
log10UwUArr.length = 5;
var log10UwLArr = [];
log10UwLArr.length = 5;
var chiI, peNumerator, peDenominator, logPhi, logPhiOverPe, logOnePlusPhiOverPe, logPeNumerTerm, logPeDenomTerm;
//Begin Pgas-kapp iteration

//
    var maxZDonor = 28; //Nickel
    for (var pIter = 0; pIter < nOuterIter; pIter++){

//  Converge Pg-Pe relation starting from intital guesses at Pg and Pe
//  - assumes all free electrons are from single ionizations
//  - David Gray 3rd Ed. Eq. 9.8:

  for (var neIter = 0; neIter < nInnerIter; neIter++){
    //System.out.println("iD    logE*newPe[1][iD]     logE*guessPe[1]     logE*guessPGas[1]");
    for (var iD = 0; iD < numDeps; iD++){
    //re-initialize accumulators:
       thisTemp[0] = temp[0][iD];
       thisTemp[1] = temp[1][iD];
       peNumerator = 0.0;
       peDenominator = 0.0;
       for (var iElem = 0; iElem < nelemAbnd; iElem++){
           species = cname[iElem] + "I";
           chiI = getIonE(species);
    //THe following is a 2-element vector of temperature-dependent partitio fns, U,
    // that are base e log_10 U
           //log10UwLArr = getPartFn(species); //base 10 log_10 U
           log10UwLArr = getPartFn2(species); //lburns
           species = cname[iElem] + "II";
           //log10UwUArr = getPartFn(species); //base 10 log_10 U
           log10UwUArr = getPartFn2(species); //lburns
           logPhi = sahaRHS(chiI, log10UwUArr, log10UwLArr, thisTemp);
           logPhiOverPe = logPhi - guessPe[1][iD];
           logOnePlusPhiOverPe = Math.log(1.0 + Math.exp(logPhiOverPe));
           logPeNumerTerm = logAz[iElem] + logPhiOverPe - logOnePlusPhiOverPe;
           peNumerator = peNumerator + Math.exp(logPeNumerTerm);
           logPeDenomTerm = logAz[iElem] + Math.log(1.0 + Math.exp(logPeNumerTerm));
           peDenominator = peDenominator + Math.exp(logPeDenomTerm);
       } //iElem chemical element loop
       newPe[1][iD] = guessPGas[1][iD] + Math.log(peNumerator) - Math.log(peDenominator);
       //System.out.format("%03d, %21.15f, %21.15f, %21.15f%n", iD, logE*newPe[1][iD], logE*guessPe[1][iD], logE*guessPGas[1][iD]);
       guessPe[1][iD] = newPe[1][iD];
       guessPe[0][iD] = Math.exp(guessPe[1][iD]);
    } //iD depth loop

} //end Pg_Pe iteration neIter

    for (var iD = 0; iD < numDeps; iD++){
       newNe[1][iD] = newPe[1][iD] - temp[1][iD] - logK;
       newNe[0][iD] = Math.exp(newNe[1][iD]);
    }

//
//
//Get the number densities of the chemical elements at all depths
     logNz = getNz(numDeps, temp, guessPGas, guessPe, ATot, nelemAbnd, logAz);
     for (var i = 0 ; i < numDeps; i++){
        logNH[i] = logNz[0][i];
        //System.out.println("i " + i + " logNH[i] " + logE*logNH[i]);
     }

//
//  Compute ionization fractions of H & He for kappa calculation
//
//  Default inializations:
       zScaleList = 1.0; //initialization

var amu = 1.66053892E-24; // atomic mass unit in g
var logAmu = Math.log(amu);

//Default initialization:
       for (var i = 0; i < numAssocMols; i++){ 
           for (var j = 0; j < numDeps; j++){
               logNumBArr[i][j] = -49.0; 
           }
           for (var k = 0; k < log10UwBArr[i].length; k++){
                log10UwBArr[i][k] = 0.0; // default initialization lburns
           }
           dissEArr[i] = 29.0;  //eV
           for (var kk = 0; kk < 5; kk++){
               logQwABArr[i][kk] = Math.log(300.0);
           }
           logMuABArr[i] = Math.log(2.0) + logAmu;  //g
           mname_ptr[i] = 0;
           specB_ptr[i] = 0;
       }
        
       var defaultQwAB = Math.log(300.0); //for now
    //default that applies to most cases - neutral stage (I) forms molecules
       var specBStage = 0; //default that applies to most cases
      
   //For element A of main molecule being treated in *molecular* equilibrium:
   //For safety, assign default values where possible
       var nmrtrDissE = 15.0; //prohitively high by default
       var nmrtrLog10UwB = [];
       nmrtrLog10UwB.length = 5;
       for (var k = 0; k < nmrtrLog10UwB.length; k++){
            nmrtrLog10UwB[k] = 0.0; // default initialization lburns
       }
       var nmrtrLog10UwA = 0.0;
       var nmrtrLogQwAB = [];
       nmrtrLogQwAB.length = 5;
       for (var kk = 0; kk < 5; kk++){
          nmrtrLogQwAB[kk] = Math.log(300.0);
       }

       var nmrtrLogMuAB = logAmu;
       var nmrtrLogNumB = [];
       nmrtrLogNumB.length = numDeps;
       for (var i = 0; i < numDeps; i++){
          nmrtrLogNumB[i] = 0.0;
       }

     var totalIonic;
     var logGroundRatio = [];
     logGroundRatio.length = numDeps;


   //console.log(" iTau " + " logNums[iStage][iTau]");
   //console.log(" species " + " thisChiI " + " thisUwV");
   ////H & He only for now - just opacity due to H, He & free e^-s
   //for (var iElem = 0; iElem < 2; iElem++){
   // only up to Fe - only compute opacities for elements up Fe I b-f 
   for (var iElem = 0; iElem < 26; iElem++){
       //console.log("iElem " + iElem);
       species = cname[iElem] + "I";
       chiIArr[0] = getIonE(species);
    //THe following is a 2-element vector of temperature-dependent partitio fns, U,
    // that are base e log_e U, a la Allen's Astrophysical Quantities
       log10UwAArr[0] = getPartFn2(species); //base e log_10 U
       //console.log(" " + species + " " + thisChiI1 + " " + thisUw1V);
       species = cname[iElem] + "II";
       chiIArr[1] = getIonE(species);
       log10UwAArr[1] = getPartFn2(species); //base e log_10 U
       //console.log(" " + species + " " + thisChiI2 + " " + thisUw2V);
       species = cname[iElem] + "III";
       chiIArr[2] = getIonE(species);
       log10UwAArr[2] = getPartFn2(species); //base e log_10 U
       //console.log(" " + species + " " + thisChiI3 + " " + thisUw3V);
       species = cname[iElem] + "IV";
       chiIArr[3] = getIonE(species);
       log10UwAArr[3] = getPartFn2(species); //base e log_10 U
       //console.log(" " + species + " " + thisChiI4 + " " + thisUw4V);
       //double logN = (eheu[iElem] - 12.0) + logNH;
       //Find any associated molecular species in which element A can participate:
       //console.log("iElem " + iElem + " cname " + cname[iElem]);
       //console.log("numAssocMols " + numAssocMols);
    //numAssocMols = 0; //Diagnostic 
       var thisNumMols = 0; //default initialization
       for (var iMol = 0; iMol < numAssocMols; iMol++){
          //console.log("iElem " + iElem + " iMol " + iMol + " cnameMols " + cnameMols[iElem][iMol]);
          if (cnameMols[iElem][iMol] == "None"){
            break;
          }
          thisNumMols++;
       }
    // console.log("iElem " + iElem + " iMol " + iMol + " cnameMols " + cnameMols[iElem][iMol]);
    // console.log("thisNumMols " + thisNumMols);
    //Trying to account for mols in ionization eq destabilized everything
     thisNumMols = 0;
     if (thisNumMols > 0){
       //Find pointer to molecule in master mname list for each associated molecule:
       for (var iMol = 0; iMol < thisNumMols; iMol++){
          for (var jj = 0; jj < nMols; jj++){
             if (cnameMols[iElem][iMol] == mname[jj]){
                mname_ptr[iMol] = jj; //Found it!
                break;
             }
          } //jj loop in master mnames list
       } //iMol loop in associated molecules
   //console.log("iMol " + iMol + " mname_ptr " + mname_ptr[iMol] + " mname[mname_ptr] " + mname[mname_ptr[iMol]]);
//Now find pointer to atomic species B in master cname list for each associated molecule found in master mname list!
       for (var iMol = 0; iMol < thisNumMols; iMol++){
          for (var jj = 0; jj < nelemAbnd; jj++){
             if (mnameB[mname_ptr[iMol]] == cname[jj]){
                specB_ptr[iMol] = jj; //Found it!
                break;
             }
          } //jj loop in master cnames list
       } //iMol loop in associated molecules
     // console.log("specB_ptr " + specB_ptr + " cname[specB_ptr] " + cname[specB_ptr[iMol]]);
//Now load arrays with molecular species AB and atomic species B data for method stagePops2()  
       for (var iMol = 0; iMol < thisNumMols; iMol++){
  //special fix for H^+_2:
         if (mnameB[mname_ptr[iMol]] == "H2+"){
            specBStage = 1;
         } else {
            specBStage = 0;
         }
          for (var iTau = 0; iTau < numDeps; iTau++){
             //console.log("iMol " + iMol + " iTau " + iTau + " specB_ptr[iMol] " + specB_ptr[iMol]);
//Note: Here's one place where ionization equilibrium iteratively couples to molecular equilibrium!
             logNumBArr[iMol][iTau] = masterStagePops[specB_ptr[iMol]][specBStage][iTau];
          }
          dissEArr[iMol] = getDissE(mname[mname_ptr[iMol]]);
          species = cname[specB_ptr[iMol]] + "I"; //neutral stage
          log10UwBArr[iMol] = getPartFn2(species); //base e log_10 U 
          //logQwABArr[iMol] = defaultQwAB;
          logQwABArr[iMol] = getMolPartFn(mname[mname_ptr[iMol]]);
          //Compute the reduced mass, muAB, in g:
          massA = getMass(cname[iElem]);
          massB = getMass(cname[specB_ptr[iMol]]);
          logMuABArr[iMol] = Math.log(massA) + Math.log(massB) - Math.log(massA + massB) + logAmu;
       }
   } //if thisNumMols > 0 condition
      // console.log("numAssocMols " + numAssocMols);
       logNums = stagePops2(logNz[iElem], guessNe, chiIArr, log10UwAArr, 
                     thisNumMols, logNumBArr, dissEArr, log10UwBArr, logQwABArr, logMuABArr,
                     numDeps, temp)

     for (var iStage = 0; iStage < numStages; iStage++){
       //console.log("iStage " + iStage);
          for (var iTau = 0; iTau < numDeps; iTau++){
       //console.log(" " + iTau + " " + " logNz " + logE*logNz[iElem][iTau] + " " + logNums[iStage][iTau]);
            masterStagePops[iElem][iStage][iTau] = logNums[iStage][iTau];
 //save ion stage populations at tau = 1:
       } //iTau loop
       tauOneStagePops[iElem][iStage] = logNums[iStage][iTauOne];
    } //iStage loop
            //System.out.println("iElem " + iElem);
            //if (iElem == 1){
            //  for (int iTau = 0; iTau < numDeps; iTau++){
            //   System.out.println("cname: " + cname[iElem] + " " + logE*list2LogNums[0][iTau] + " " + logE*list2LogNums[1][iTau]);
            //  }
            // }
  } //iElem loop
//


//Get mass density from chemical composition:
     rho = massDensity2(numDeps, nelemAbnd, logNz, cname,
                                 nMols, masterMolPops, mname, mnameA, mnameB);


//Total number density of gas particles: nuclear species + free electrons:
//AND
 //Compute mean molecular weight, mmw ("mu"):
    for (var i = 0; i < numDeps; i++){
      Ng[i] =  newNe[0][i]; //initialize accumulation with Ne
      //console.log("i " + i + " Ng=newNe " + logE*Math.log(Ng[i]));
    }
    for (var i = 0; i < numDeps; i++){
      //atomic & ionic sepies:
      for (var j = 0; j < nelemAbnd; j++){
         Ng[i] =  Ng[i] + Math.exp(logNz[j][i]); 
      }
     logMmw = rho[1][i] - Math.log(Ng[i]);  // in g
     mmw[i] = Math.exp(logMmw);
    }


//H & He only for now... we only compute H, He, and e^- opacity sources:
      logKappaHHe = kappas2(numDeps, newPe, zScale, temp, rho,
                     numLams, lambdaScale, logAz[1],
                     masterStagePops[0][0], masterStagePops[0][1],
                     masterStagePops[1][0], masterStagePops[1][1], newNe, teff, logTotalFudge);

//Add in metal b-f opacity from adapted Moog routines:
      logKappaMetalBF = masterMetal(numDeps, numLams, temp, lambdaScale, masterStagePops);
//Add in Rayleigh scattering opacity from adapted Moog routines:
      logKappaRayl = masterRayl(numDeps, numLams, temp, lambdaScale, masterStagePops, masterMolPops);

//Convert metal b-f & Rayleigh scattering oapcities to cm^2/g and sum up total opacities
   var logKapMetalBF, logKapRayl, kapContTot;
   //System.out.println("i     tauRos      l      lamb     kappa    kappaHHe    kappaMtl     kappaRayl    kapContTot");
   for (var iL = 0; iL < numLams; iL++){
       for (var iD = 0; iD < numDeps; iD++){
          logKapMetalBF = logKappaMetalBF[iL][iD] - rho[1][iD];
          logKapRayl = logKappaRayl[iL][iD] - rho[1][iD];
          kapContTot = Math.exp(logKappaHHe[iL][iD]) + Math.exp(logKapMetalBF) + Math.exp(logKapRayl); //debug
          logKappa[iL][iD] = Math.log(kapContTot);
         // if ( (iD%10 == 1) && (iL%10 == 0) ){
         //    System.out.format("%03d, %21.15f, %03d, %21.15f, %21.15f, %21.15f, %21.15f, %21.15f %n",
         //     iD, tauRos[0][iD], iL, lambdaScale[iL], logE*logKappaHHe[iL][iD],
         //     logE*(logKapMetalBF), logE*(logKapRayl), logE*logKappa[iL][iD]);
         // }
       }
   }


      kappaRos = kapRos(numDeps, numLams, lambdaScale, logKappa, temp);

//Extract the "kappa_500" monochroamtic continuum oapcity scale
// - this means we'll try interpreting the prescribed tau grid (still called "tauRos")as the "tau500" scale 
      var it500 = lamPoint(numLams, lambdaScale, 500.0e-7);
      for (var i = 0; i < numDeps; i++){
         kappa500[1][i] = logKappa[it500][i];
         kappa500[0][i] = Math.exp(kappa500[1][i]);
      } 

        //pGas = hydroFormalSoln(numDeps, grav, tauRos, kappaRos, temp, guessPGas);
        pGas = hydroFormalSoln(numDeps, grav, tauRos, kappa500, temp, guessPGas);
        pRad = radPress(numDeps, temp);


//Update Pgas and Pe guesses for iteration:
        for (var iTau = 0; iTau < numDeps; iTau++){
// Now we can update guessPGas:
            guessPGas[0][iTau] = pGas[0][iTau];
            guessPGas[1][iTau] = pGas[1][iTau];
            //console.log("iTau " + iTau + " pGas[0][iTau] " + logE*pGas[1][iTau] + " newPe[0][iTau] " + logE*newPe[1][iTau]);
        }

 }  //end Pgas-kappa iteration

    //console.log("teff " + teff + " temp[0][36] " + temp[0][36] + 
     //    " masterStagePops[0][0][36]/NH " + logE*(masterStagePops[0][0][36]-logNH[36]) +
      //   " masterStagePops[0][1][36]/NH " + logE*(masterStagePops[0][1][36]-logNH[36]) +
      //   " masterStagePops[0][2][36]/NH " + logE*(masterStagePops[0][2][36]-logNH[36]) +
      //   " masterStagePops[0][3][36]/NH " + logE*(masterStagePops[0][3][36]-logNH[36]));

        // Then construct geometric depth scale from tau, kappa and rho
        //var depths = depthScale(numDeps, tauRos, kappaRos, rho);
        var depths = depthScale(numDeps, tauRos, kappa500, rho);
        //for (var i = 0; i < numDeps; i++) {
        //    console.log("depths[i] " + (1.0e-5 * depths[i]));
        //}
// console.log("logNH " + " rho[1] " + " newNe[1] " + " newPe[1] " + " kappaRos[1] " + " pGas[1] " + " depth" );
// for (var i = 0; i < numDeps; i++){
//    console.log(" " + logE*logNH[i] + " " + logE*rho[1][i] + " " + logE*newNe[1][i] + " " + logE*newPe[1][i] + 
//     " " + logE*kappaRos[1][i] + " " + logE*pGas[1][i] + " " + (depths[i]/1.0e5));
// }
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
                //newTemp = mgTCorr(numDeps, teff, tauRos, temp, rho, kappaRos);
                newTemp = mgTCorr(numDeps, teff, tauRos, temp, rho, kappa500);
                for (var iTau = 0; iTau < numDeps; iTau++) {
//console.log(" " + logE*tauRos[1][iTau] + " " + temp[0][iTau]);
                    temp[1][iTau] = newTemp[1][iTau];
                    temp[0][iTau] = newTemp[0][iTau];
                    //console.log(" " + logE*tauRos[1][iTau] + " " + temp[0][iTau]);
                }
            }
        }

/*
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
                convTemp = convec(numDeps, tauRos, temp, pGas, rho, kappaRos, kappaSun, zScale, teff, logg);
                for (var iTau = 0; iTau < numDeps; iTau++) {
                    temp[1][iTau] = convTemp[1][iTau];
                    temp[0][iTau] = convTemp[0][iTau];
                }

            }
        }
*/
ifTcorr = false;
ifConvec = false;
        if ((ifTcorr === true) || (ifConvec === true)) {
//Recall hydrostat with updates temps            
//Recall state withupdated Press                    
//recall kappas withupdates rhos
//Recall depths with re-updated kappas
        }


//
// Now that the atmospheric structure is settled:
// Separately converge the Ne-ionization-fractions-molecular equilibrium for
// all elements and populate the ionization stages of all the species for spectrum synthesis:

//stuff to save ion stage pops at tau=1:
  var iTauOne = tauPoint(numDeps, tauRos, unity);
//
//  Default inializations:
       zScaleList = 1.0; //initialization

var amu = 1.66053892E-24; // atomic mass unit in g
var logAmu = Math.log(amu);

//Default initialization:
       for (var i = 0; i < numAssocMols; i++){ 
           for (var j = 0; j < numDeps; j++){
               logNumBArr[i][j] = -49.0; 
           }
           for (var k = 0; k < log10UwBArr[i].length; k++){
                log10UwBArr[i][k] = 0.0; // default initialization lburns
           }
           dissEArr[i] = 29.0;  //eV
           for (var kk = 0; kk < 5; kk++){
               logQwABArr[i][kk] = Math.log(300.0);
           }
           logMuABArr[i] = Math.log(2.0) + logAmu;  //g
           mname_ptr[i] = 0;
           specB_ptr[i] = 0;
       }
        
       var defaultQwAB = Math.log(300.0); //for now
    //default that applies to most cases - neutral stage (I) forms molecules
       var specBStage = 0; //default that applies to most cases
      
   //For element A of main molecule being treated in *molecular* equilibrium:
   //For safety, assign default values where possible
       var nmrtrDissE = 15.0; //prohitively high by default
       var nmrtrLog10UwB = [];
       nmrtrLog10UwB.length = 5;
       for (var k = 0; k < nmrtrLog10UwB.length; k++){
            nmrtrLog10UwB[k] = 0.0; // default initialization lburns
       }
       var nmrtrLog10UwA = 0.0;
       var nmrtrLogQwAB = [];
       nmrtrLogQwAB.length = 5;
       for (var kk = 0; kk < 5; kk++){
          nmrtrLogQwAB[kk] = Math.log(300.0);
       }

       var nmrtrLogMuAB = logAmu;
       var nmrtrLogNumB = [];
       nmrtrLogNumB.length = numDeps;
       for (var i = 0; i < numDeps; i++){
          nmrtrLogNumB[i] = 0.0;
       }

     var totalIonic;
     var logGroundRatio = [];
     logGroundRatio.length = numDeps;

// Iteration *within* the outer Pe-Pgas iteration:
//Iterate the electron densities and ionization fractions:
//
 //for (var neIter2 = 0; neIter2 < 3; neIter2++){
 for (var neIter2 = 0; neIter2 < nInnerIter; neIter2++){

   for (var iElem = 0; iElem < maxZDonor; iElem++){
       //console.log("iElem " + iElem);
       species = cname[iElem] + "I";
       chiIArr[0] = getIonE(species);
    //THe following is a 2-element vector of temperature-dependent partitio fns, U,
    // that are base e log_e U, a la Allen's Astrophysical Quantities
       log10UwAArr[0] = getPartFn2(species); //base e log_10 U
       //console.log(" " + species + " " + thisChiI1 + " " + thisUw1V);
       species = cname[iElem] + "II";
       chiIArr[1] = getIonE(species);
       log10UwAArr[1] = getPartFn2(species); //base e log_10 U
       //console.log(" " + species + " " + thisChiI2 + " " + thisUw2V);
       species = cname[iElem] + "III";
       chiIArr[2] = getIonE(species);
       log10UwAArr[2] = getPartFn2(species); //base e log_10 U
       //console.log(" " + species + " " + thisChiI3 + " " + thisUw3V);
       species = cname[iElem] + "IV";
       chiIArr[3] = getIonE(species);
       log10UwAArr[3] = getPartFn2(species); //base e log_10 U
       //console.log(" " + species + " " + thisChiI4 + " " + thisUw4V);
       //double logN = (eheu[iElem] - 12.0) + logNH;
       //Find any associated moleculear species in which element A can participate:
       //console.log("iElem " + iElem + " cname " + cname[iElem]);
       //console.log("numAssocMols " + numAssocMols);
       var thisNumMols = 0; //default initialization
       for (var iMol = 0; iMol < numAssocMols; iMol++){
          //console.log("iMol " + iMol + " cnameMols " + cnameMols[iElem][iMol]);
          if (cnameMols[iElem][iMol] == "None"){
            break;
          }
          thisNumMols++;
       }
     //console.log("thisNumMols " + thisNumMols);
     if (thisNumMols > 0){
       //Find pointer to molecule in master mname list for each associated molecule:
       for (var iMol = 0; iMol < thisNumMols; iMol++){
          for (var jj = 0; jj < nMols; jj++){
             if (cnameMols[iElem][iMol] == mname[jj]){
                mname_ptr[iMol] = jj; //Found it!
                break;
             }
          } //jj loop in master mnames list
       } //iMol loop in associated molecules
//Now find pointer to atomic species B in master cname list for each associated molecule found in master mname list!
       for (var iMol = 0; iMol < thisNumMols; iMol++){
          for (var jj = 0; jj < nelemAbnd; jj++){
             if (mnameB[mname_ptr[iMol]] == cname[jj]){
                specB_ptr[iMol] = jj; //Found it!
                break;
             }
          } //jj loop in master cnames list
       } //iMol loop in associated molecules

//Now load arrays with molecular species AB and atomic species B data for method stagePops2()  
       for (var iMol = 0; iMol < thisNumMols; iMol++){
  //special fix for H^+_2:
         if (mnameB[mname_ptr[iMol]] == "H2+"){
            specBStage = 1;
         } else {
            specBStage = 0;
         }
          for (var iTau = 0; iTau < numDeps; iTau++){
             //console.log("iMol " + iMol + " iTau " + iTau + " specB_ptr[iMol] " + specB_ptr[iMol]);
//Note: Here's one place where ionization equilibrium iteratively couples to molecular equilibrium!
             logNumBArr[iMol][iTau] = masterStagePops[specB_ptr[iMol]][specBStage][iTau];
          }
          dissEArr[iMol] = getDissE(mname[mname_ptr[iMol]]);
          species = cname[specB_ptr[iMol]] + "I"; //neutral stage
          log10UwBArr[iMol] = getPartFn2(species); //base e log_e U 
          //logQwABArr[iMol] = defaultQwAB;
          logQwABArr[iMol] = getMolPartFn(mname[mname_ptr[iMol]]);
          //Compute the reduced mass, muAB, in g:
          massA = getMass(cname[iElem]);
          massB = getMass(cname[specB_ptr[iMol]]);
          logMuABArr[iMol] = Math.log(massA) + Math.log(massB) - Math.log(massA + massB) + logAmu;
       }
   } //if thisNumMols > 0 condition
       logNums = stagePops2(logNz[iElem], guessNe, chiIArr, log10UwAArr, 
                     thisNumMols, logNumBArr, dissEArr, log10UwBArr, logQwABArr, logMuABArr,
                     numDeps, temp)

     for (var iStage = 0; iStage < numStages; iStage++){
       //console.log("iStage " + iStage);
          for (var iTau = 0; iTau < numDeps; iTau++){
       //console.log(" " + iTau + " " + " logNz " + logE*logNz[iElem][iTau] + " " + logNums[iStage][iTau]);
            masterStagePops[iElem][iStage][iTau] = logNums[iStage][iTau];
 //save ion stage populations at tau = 1:
       } //iTau loop
       tauOneStagePops[iElem][iStage] = logNums[iStage][iTauOne];
    } //iStage loop
            //System.out.println("iElem " + iElem);
            //if (iElem == 1){
            //  for (int iTau = 0; iTau < numDeps; iTau++){
            //   System.out.println("cname: " + cname[iElem] + " " + logE*list2LogNums[0][iTau] + " " + logE*list2LogNums[1][iTau]);
            //  }
            // }
  } //iElem loop
//


// Compute all molecular populations:
//
// *** CAUTION: specB2_ptr refers to element B of main molecule being treated
// specB_ptr[] is an array of pointers to element B of all molecules associated with
// element A 
// mname_ptr[] is an array of pointers pointing to the molecules themselves that are 
// associated with element A
   for (var iMol = 0; iMol < nMols; iMol++){

 //Find elements A and B in master atomic element list:  
 //console.log("iMol " + iMol + " mname[iMol] " + mname[iMol] + " mnameA[iMol] " + mnameA[iMol] + " mnameB[iMol] " + mnameB[iMol]);
    specA_ptr = 0;
    specB2_ptr = 0;  
    for (var jj = 0; jj < nelemAbnd; jj++){
       if (mnameA[iMol] == cname[jj]){
         specA_ptr = jj;
         break;  //found it!
       }
    }
// Get its partition fn:
    species = cname[specA_ptr] + "I"; //neutral stage
    var log10UwA = getPartFn2(species); //base e log_10 U
  //console.log("specA_ptr " + specA_ptr + " cname[specA_ptr] " + cname[specA_ptr]); 
  //console.log("log10UwA " + log10UwA[0] + " " + log10UwA[1]);
//
    for (var jj = 0; jj < nelemAbnd; jj++){
       if (mnameB[iMol] == cname[jj]){
         specB2_ptr = jj;
         break;  //found it!
       }
    } 
  //console.log("specB2_ptr " + specB2_ptr + " cname[specB2_ptr] " + cname[specB2_ptr]); 
  
//We will solve for N_AB/N_A - neutral stage of species A (AI) will be kept on LHS of molecular Saha equations -
// Therefore, we need ALL the molecules species A participates in - including the current molecule itself  
// - at this point, it's just like setting up the ionization equilibrium to account for molecules as above...    
       var thisNumMols = 0; //default initialization
       for (var im = 0; im < numAssocMols; im++){
          //console.log("iMol " + iMol + " cnameMols " + cnameMols[iElem][iMol]);
          if (cnameMols[specA_ptr][im] == "None"){
            break;
          }
          thisNumMols++;
       }
     //console.log("thisNumMols " + thisNumMols);
     if (thisNumMols > 0){
       //Find pointer to molecule in master mname list for each associated molecule:
       for (var im = 0; im < thisNumMols; im++){
          for (var jj = 0; jj < nMols; jj++){
             if (cnameMols[specA_ptr][im] == mname[jj]){
                mname_ptr[im] = jj; //Found it!
                break;
             }
          } //jj loop in master mnames list
   //console.log("im " + im + " mname_ptr[im] " + mname_ptr[im] + " mname[mname_ptr[im]] " + mname[mname_ptr[im]]);
       } //im loop in associated molecules

//Now find pointer to atomic species B in master cname list for each associated molecule found in master mname list!
       for (var im = 0; im < thisNumMols; im++){
          mnameBtemplate = " "; //initialization
// "Species B" is whichever element is NOT species "A" in master molecule
          if (mnameB[mname_ptr[im]] == mnameA[iMol]){
             //get the *other* atom
             mnameBtemplate = mnameA[mname_ptr[im]];
          } else {
             mnameBtemplate = mnameB[mname_ptr[im]];
          }
          //console.log("mnameA[mname_ptr[im]] " + mnameA[mname_ptr[im]] + " mnameB[mname_ptr[im]] " + mnameB[mname_ptr[im]] + " mnameBtemplate " + mnameBtemplate); 
          for (var jj = 0; jj < nelemAbnd; jj++){
             if (mnameBtemplate == cname[jj]){
                //console.log("If condition met: jj " + jj + " cname[jj] " + cname[jj]);
                specB_ptr[im] = jj; //Found it!
                break;
             }
          } //jj loop in master cnames list
   //console.log("im " + im + " specB_ptr[im] " + specB_ptr[im] + " cname[specB_ptr[im]] " + cname[specB_ptr[im]]);
       } //im loop in associated molecules
   
//Now load arrays with molecular species AB and atomic species B data for method molPops()  
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var logK = Math.log(k);
       for (var im = 0; im < thisNumMols; im++){
      //special fix for H^+_2:
         if (mname[mname_ptr[im]] == "H2+"){
           specBStage = 1;
         } else {
           specBStage = 0;
         }
          for (var iTau = 0; iTau < numDeps; iTau++){
//Note: Here's one place where ionization equilibrium iteratively couples to molecular equilibrium!
             logNumBArr[im][iTau] = masterStagePops[specB_ptr[im]][specBStage][iTau];
         //if (mname[iMol] == "TiO"){
         //    console.log("iMol " + iMol + " iTau " + iTau + " specB_ptr[im] " + specB_ptr[im]);
         //   console.log(" " + iTau + " tau " + tauRos[0][iTau] + " temp " + temp[0][iTau] + " logNumBArr " + logE*logNumBArr[im][iTau] 
         //      + " pp " + (logE*(logNumBArr[im][iTau]+temp[1][iTau]+logK)));
         //}
             
          }
          dissEArr[im] = getDissE(mname[mname_ptr[im]]);
          //console.log("im " + im + " dissEArr " + dissEArr[im]);
          species = cname[specB_ptr[im]] + "I";
          log10UwBArr[im] = getPartFn2(species); //base e log_10 U 
          //logQwABArr[im] = defaultQwAB;
          logQwABArr[im] = getMolPartFn(mname[mname_ptr[im]]);
          //Compute the reduced mass, muAB, in g:
          massA = getMass(cname[specA_ptr]);
          massB = getMass(cname[specB_ptr[im]]);
          logMuABArr[im] = Math.log(massA) + Math.log(massB) - Math.log(massA + massB) + logAmu;
   //      if (mname[iMol] == "TiO"){
  //console.log("im " + im + " log10UwBArr " + log10UwBArr[im][0] + " " + log10UwBArr[im][1] + " logMuABArr " + logE*logMuABArr[im]);
   //  }
 // One of the species A-associated molecules will be the actual molecule, AB, for which we want
 // the population - pick this out for the numerator in the master fraction:
          if (mname[mname_ptr[im]] == mname[iMol]){
              nmrtrDissE = dissEArr[im];
 //console.log("Main: log10UwBArr[im][0] " + log10UwBArr[im][0] + " log10UwBArr[im][1] " + log10UwBArr[im][1]);
               for (var k = 0; k < nmrtrLog10UwB.length; k++){
                   nmrtrLog10UwB[k] = log10UwBArr[im][k]; // default initialization lburns
              }
              for (var kk = 0; kk < 5; kk++){
                  nmrtrLogQwAB[kk] = logQwABArr[im][kk];
                  //console.log("logQwABArr[im] " + logE*logQwABArr[im][0] + " " + logE*logQwABArr[im][1] + " " + logE*logQwABArr[im][2] + " " + logE*logQwABArr[im][3] + " " + logE*logQwABArr[im][4]);
              }
              nmrtrLogMuAB = logMuABArr[im];
 //console.log("Main: nmrtrDissE " + nmrtrDissE + " nmrtrLogMuAB " + nmrtrLogMuAB);
              for (var iTau = 0; iTau < numDeps; iTau++){
                 nmrtrLogNumB[iTau] = logNumBArr[im][iTau];
              }
          }
     //    if (mname[iMol] == "TiO"){
     //         console.log("nmrtrDissE " + nmrtrDissE + " nmrtrLogMuAB " + logE*nmrtrLogMuAB);
      //   }
       } //im loop
 //console.log("Main: nmrtrLog10UwB[0] " + nmrtrLog10UwB[0] + " nmrtrLog10UwB[1] " + nmrtrLog10UwB[1]);
//
   } //if thisNumMols > 0 condition
   //
   //Compute total population of particle in atomic ionic stages over number in ground ionization stage
   //for master denominator so we don't have to re-compue it:
         //console.log("MAIN: iTau      nmrtrLogNumB      logNumBArr[0]      logGroundRatio    masterStagePops[specA_ptr][0]");
         for (var iTau = 0; iTau < numDeps; iTau++){
           //initialization: 
           totalIonic = 0.0;  
           for (var iStage = 0; iStage < numStages; iStage++){
              totalIonic = totalIonic + Math.exp(masterStagePops[specA_ptr][iStage][iTau]);
           }
           logGroundRatio[iTau] = Math.log(totalIonic) - masterStagePops[specA_ptr][0][iTau];    
        // if (mname[iMol] == "TiO"){
        //  if (iTau%10 == 5){
       //console.log(" " + iTau + " " + logE*nmrtrLogNumB[iTau] + " " + logE*logNumBArr[0][iTau] + " " + logE*logGroundRatio[iTau] + " " + logE*masterStagePops[specA_ptr][0][iTau]);
       //console.log("MAIN: nmrtrDissE " + nmrtrDissE + " log10UwA " + log10UwA[0] + " " + log10UwA[1] + " nmrtrLog10UwB " +
       //     nmrtrLog10UwB[0] + " " + nmrtrLog10UwB[1] + " nmrtrLog10QwAB[2] " + logE*nmrtrLogQwAB[2] + " nmrtrLogMuAB " + logE*nmrtrLogMuAB
       //     + " thisNumMols " + thisNumMols + " dissEArr " + dissEArr[0] + " log10UwBArr " + log10UwBArr[0][0] + " " + log10UwBArr[0][1] + " log10QwABArr " +
       //     logE*logQwABArr[0][2] + " logMuABArr " + logE*logMuABArr[0]);
       //     console.log("logtotalIonic " + logE*Math.log(totalIonic) + " logGroundRatio " + logE*logGroundRatio[iTau] + " pp totalionic " + 
       //           (logE*(Math.log(totalIonic)+temp[1][iTau]+logK)) );
       //     }
       //    }
         }
       logNumFracAB = molPops(nmrtrLogNumB, nmrtrDissE, log10UwA, nmrtrLog10UwB, nmrtrLogQwAB, nmrtrLogMuAB, 
                     thisNumMols, logNumBArr, dissEArr, log10UwBArr, logQwABArr, logMuABArr,
                     logGroundRatio, numDeps, temp)

//Load molecules into master molecular population array:
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var logK = Math.log(k);
 //console.log("cname[specA_ptr] " + cname[specA_ptr] + " cname[specB2_ptr] " + cname[specB2_ptr]);
 //console.log("iTau      temp     logNz[specA_ptr]    logNz[specB2_ptr]    logppMol    logNumFracAB");
      for (var iTau = 0; iTau < numDeps; iTau++){
         masterMolPops[iMol][iTau] = logNz[specA_ptr][iTau] + logNumFracAB[iTau];
        //  if (iTau%10 == 5){
        //  console.log(" " + iTau + " " + temp[0][iTau] + " " +
        //  logE*(logNz[specA_ptr][iTau]+logK+temp[1][iTau]) + " " +
        //  logE*(logNz[specB2_ptr][iTau]+logK+temp[1][iTau]) + " " +
        //  logE*(masterMolPops[iMol][iTau]+logK+temp[1][iTau]) + " " +
        //  logE*logNumFracAB[iTau] );
        //  }
        // if (mname[iMol] == "TiO"){
        //  if (iTau == 24){
        //    console.log(" " + iTau + " tau " + tauRos[0][iTau] + " temp " + temp[0][iTau] + " pe " + (logE*(newNe[1][iTau]+temp[1][iTau]+logK))  + " masterMolPops " + logE*masterMolPops[iMol][iTau]
        //       + " pp " + (logE*(masterMolPops[iMol][iTau]+temp[1][iTau]+logK))
        //       + " ppA " + (logE*(logNz[specA_ptr][iTau]+temp[1][iTau]+logK)) 
        //       + " logNumFracAB " + logE*logNumFracAB[iTau]);
       //     }
       // }
      }
  } //master iMol loop

//
//Compute updated Ne & Pe:
     //initialize accumulation of electrons at all depths
     for (var iTau = 0; iTau < numDeps; iTau++){
       newNe[0][iTau] = 0.0;
     }
     for (var iTau = 0; iTau < numDeps; iTau++){
        for (var iElem = 0; iElem < maxZDonor; iElem++){
          newNe[0][iTau] = newNe[0][iTau]
                   + Math.exp(masterStagePops[iElem][1][iTau])   //1 e^- per ion
                   + 2.0 * Math.exp(masterStagePops[iElem][2][iTau]);   //2 e^- per ion
                   //+ 3.0 * Math.exp(masterStagePops[iElem][3][iTau]);   //3 e^- per ion
                   //+ 4.0 * Math.exp(masterStagePops[iElem][4][iTau]);   //4 e^- per ion
        }
        newNe[1][iTau] = Math.log(newNe[0][iTau]);
// Update guess for iteration:
        guessNe[0][iTau] = newNe[0][iTau];
        guessNe[1][iTau] = newNe[1][iTau];
       //console.log("iTau " + iTau + " newNe " + logE*newNe[1][iTau] + " newPe " + logE*newPe[1][iTau]);
     }

  } //end Ne - ionzation fraction iteration -molecular equilibrium iteration neIter2

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
//establish a phi grid for non-axi-symmetric situations (eg. spots, in situ rotation, ...)
    //number of phi values per quandrant of unit circle centered on sub-stellar point
    //    in plane of sky:
//For geometry calculations: phi = 0 is direction of positive x-axis of right-handed 
// 2D Cartesian coord system in plane of sky with origin at sub-stellar point (phi 
// increases CCW)
    var numPhiPerQuad = 6;  
    var numPhi = 4 * numPhiPerQuad; 
    var phi = [];
    phi.length = numPhi;
    //Compute phi values in whole range (0 - 2pi radians):
    var delPhi = 2.0 * Math.PI / numPhi;
    var ii;
    for (var i = 0; i < numPhi; i++){
      ii = 1.0 * i;
      phi[i] = delPhi * ii; 
    }
   
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
    //var lambdaScale = lamgrid(numLams, lamSetup); //nm
    // Set up multi-Gray continuum info:
    var isCool = 7300.0; //Class A0


    //Set up multi-gray opacity:
    // lambda break-points and gray levels:
    // No. multi-gray bins = num lambda breakpoints +1
    var minLambda = 30.0; //nm
    var maxLambda = 1.0e6; //nm

// JOLA molecular bands here:
// Just-overlapping line approximation treats molecular ro-vibrational bands as pseudo-continuum
//opacity sources by "smearing" out the individual rotational fine-structure lines
//See 1982A&A...113..173Z, Zeidler & Koester, 1982


        var jolaOmega0;  //band origin ?? //Hz OR waveno in cm^-1 ??
        //double[] jolaLogF; //total vibrational band oscillator strength (f_v'v")
        var jolaRSqu; //needed for total vibrational band oscillator strength (f_v'v")
        var jolaB = []; // B' value of upper vibational state (energy in cm^-1)??
        jolaB.length = 2; 
        var jolaLambda = [];
        jolaLambda.length = 2;
        var jolaAlphP = 0.0; // alpha_P - weight of P branch (Delta J = -1)
        var jolaAlphR = 0.0; // alpha_R - weight of R branch (Delta J = 1)
        var jolaAlphQ = 0.0; // alpha_Q - weight of Q branch (Delta J = 0)
//Allen's Astrophysical quantities, 4th Ed., 4.12.2 - 4.13.1:
// Electronic transition moment, Re
//"Line strength", S = |R_e|^2*q_v'v" or just |R_e|^2 (R_00 is for the band head)
//Section 4.4.2 - for atoms or molecules:
// then: gf = (8pi^2m_e*nu/3he^2) * S
//
// ^48Ti^16O systems: Table 4.18, p. 91
//  C^3Delta - X^3Delta ("alpha system") (Delta Lambda = 0??, p. 84 - no Q branch??)
//  c^1Phi - a^1Delta ("beta system") (Delta Lambda = 1??, p. 84)
//  A^3Phi - X^3Delta ("gamma system") (Delta Lambda = 0??, p. 84 - no Q branch??)
// //
// Rotational & vibrational constants for TiO states:, p. 87, Table 4.17
// C^3Delta, X^3Delta a^1Delta, -- No "c^1Phi" - ??
//
//General TiO molecular rotational & vibrational constants - Table 3.12, p. 47

//Zeidler & Koester 1982 p. 175, Sect vi):
//If Q branch (deltaLambda = +/-1): alpP = alpR = 0.25, alpQ = 0.5
//If NO Q branch (deltaLambda = 0): alpP = alpR = 0.5, alpQ = 0.0

  //number of wavelength point sampling a JOLA band
  //var jolaNumPoints = 100;
  var jolaNumPoints = 50;
  //var jolaNumPoints = 10;  //test

// branch weights for transitions of DeltaLambda = +/- 1
  var jolaAlphP_DL1 = 0.25;
  var jolaAlphR_DL1 = 0.25;
  var jolaAlphQ_DL1 = 0.5;
// branch weights for transitions of DeltaLambda = 0
  var jolaAlphP_DL0 = 0.5;
  var jolaAlphR_DL0 = 0.5;
  var jolaAlphQ_DL0 = 0.0; //no Q branch in this case

  var jolaS; //line strength
  var jolaLogF; //line strength


   var logSTofHelp = Math.log(8.0/3.0) + 2.0*Math.log(Math.PI) + logMe - logH - 2.0*logEe;
  //Hand-tuned for now - Maybe this is the "script S" factor in Allen 4th Ed., p. 88 (S = |R|^2*q_v'v"*scriptS)
   var jolaQuantumS = 1.0; //default for multiplicative factor
   var logNumJola = [];
   logNumJola.length = numDeps;
   var jolaProfPR = []; // For unified P & R branch
   jolaProfPR.length = jolaNumPoints;
   for (var ii = 0; ii < jolaNumPoints; ii++){
      jolaProfPR[ii] = [];
      jolaProfPR[ii].length = numDeps;
   }
   var jolaProfQ = []; //For Q branch
   jolaProfQ.length = jolaNumPoints;
   for (var ii = 0; ii < jolaNumPoints; ii++){
      jolaProfQ[ii] = [];
      jolaProfQ[ii].length = numDeps;
   }
//Differential cross-section - the main "product" of the JOLA approximation:
   var dfBydv = [];
   dfBydv.length = jolaNumPoints;
   for (var ii = 0; ii < jolaNumPoints; ii++){
      dfBydv[ii] = [];
      dfBydv[ii].length = numDeps;
   }


//
//Line list:
    var maxNumLines = 18;
    var numLines = maxNumLines; //default intialization
    //var numLines = 1;  //debug
    var listName = [];
    listName.length = maxNumLines;
    var listLamLbl = [];
    listLamLbl.length = maxNumLines;
    var listElement = [];
    listElement.length = maxNumLines;
    var listLam0 = []; // nm
    listLam0.length = maxNumLines;
    var listMass = []; // amu
    listMass.length = maxNumLines;
    var listLogGammaCol = [];
    listLogGammaCol.length = maxNumLines;
    //abundance in logarithmic A12 sysytem
    var listA12 = [];
    listA12.length = maxNumLines;
    //Log of unitless oscillator strength, f 
    var listLogf = [];
    listLogf.length = maxNumLines;
    //Einstein coefficient for spontaneous de-excitation, A 
    var listLogAij = [];
    listLogAij.length = maxNumLines;
    //Ground state ionization E - Stage I (eV) 
    var listChiI1 = [];
    listChiI1.length = maxNumLines;
    //Ground state ionization E - Stage II (eV)
    var listChiI2 = [];
    listChiI2.length = maxNumLines;
    //Excitation E of lower E-level of b-b transition (eV)
    var listChiL = [];
    listChiL.length = maxNumLines;
    //Unitless statisital weight, Ground state ionization E - Stage I
    var listGw1 = [];
    listGw1.length = maxNumLines;
    //Unitless statisital weight, Ground state ionization E - Stage II
    var listGw2 = [];
    listGw2.length = maxNumLines;
    //Unitless statisital weight, lower E-level of b-b transition                 
    var listGwL = [];
    listGwL.length = maxNumLines;
    //double[] listGwU For now we'll just set GwU to 1.0
    // Is stage II?
    //var listIonized = [];
    //listIonized.length = maxNumLines;
    var listStage = [];
    listStage.length = maxNumLines;
    var InvCmToEv = 1.23984e-4;

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

    //Late-type star line list:
  if (teff <= F0Vtemp){ 

    numLines = 17; 
        
    //CaII K
    listName[0] = "CaIIHK";
    listElement[0] = "Ca";
    listLamLbl[0] = " ";
    listLam0[0] = 393.366;
    listA12[0] = eheu[19];
    listLogf[0] = -0.166;
    listLogAij[0] = Math.log(1.47e+08);
    listChiL[0] = 0.0;
    listMass[0] = getMass(listElement[0]);
    listLogGammaCol[0] = 0.5;
    listGw1[0] = 1.0;
    listGw2[0] = 2.0;
    listGwL[0] = 2.0;
    listStage[0] = 1;
    
     //CaII H
     //listName[1] = "Ca II H";
     listName[1] = " ";
     listElement[1] = "Ca";
     listLamLbl[1] = " ";
     listLam0[1] = 396.847;
     listA12[1] = eheu[19];
     listLogf[1] = -0.482;
     listLogAij[1] = Math.log(1.4e+08);
     listChiL[1] = 0.0;
     listMass[1] = getMass(listElement[1]);
     listLogGammaCol[1] = 0.5;
     listGw1[1] = 1.0;
     listGw2[1] = 2.0;
     listGwL[1] = 2.0;
     listStage[1] = 1;
     
     //Hepsilon
     //listName[2] = "H I <em>&#949</em>";
     listName[2] = " ";
     listElement[2] = "H";
     listLamLbl[2] = " ";
     listLam0[2] = 397.1198;
     listA12[2] = 12.0; //By definition - it's Hydrogen
     listLogf[2] = logE*Math.log(1.2711e-02);
     listLogAij[2] = Math.log(4.3889e+05);
     listChiL[2] = 10.2;
     listMass[2] = getMass(listElement[2]);
     listLogGammaCol[2] = 1.0;
     listGw1[2] = 2.0; // 2n^2
     listGw2[2] = 1.0;
     listGwL[2] = 8.0; // 2n^2
     listStage[2] = 0;

    //Mn I 4032
     //listName[3] = "Fe I";
     listName[3] = "Mn I";
     listElement[3] = "Mn";
     listLamLbl[3] = "4032 ";
     listLam0[3] = 403.190;
     listA12[3] = eheu[24]; 
     listLogf[3] = logE*Math.log(5.5e-02);
     listLogAij[3] = Math.log(1.7e+07);
     listChiL[3] = 0.00000;
     listMass[3] = getMass(listElement[3]);
     listLogGammaCol[3] = 0.5;
     listGw1[3] = 1.0;
     listGw2[3] = 1.0;
     listGwL[3] = 5.0;
     listStage[3] = 0;


     //Fe I 4045
     //listName[3] = "Fe I";
     listName[4] = " ";
     listElement[4] = "Fe";
     listLamLbl[4] = " ";
     listLam0[4] = 404.581;
     listA12[4] = eheu[25]; 
     listLogf[4] = -0.674;
     listLogAij[4] = Math.log(8.62e+07);
     listChiL[4] = 1.485;
     listMass[4] = getMass(listElement[4]);
     listLogGammaCol[4] = 0.0;
     listGw1[4] = 1.0;
     listGw2[4] = 1.0;
     listGwL[4] = 9.0;
     listStage[4] = 0;
     
     //Hdelta
     listName[5] = "HI<em>&#948</em>";
     listElement[5] = "H";
     listLamLbl[5] = " ";
     listLam0[5] = 410.174;
     listA12[5] = 12.0; //By definition - it's Hydrogen
     listLogf[5] = -1.655;
     listLogAij[5] = Math.log(9.7320e+05);
     listChiL[5] = 10.2;
     listMass[5] = getMass(listElement[5]);
     listLogGammaCol[5] = 1.0;
     listGw1[5] = 2.0; // 2n^2
     listGw2[5] = 1.0;
     listGwL[5] = 8.0; // 2n^2
     listStage[5] = 0;
     
     //CaI 4227
     listName[6] = "CaI";
     listElement[6] = "Ca";
     listLamLbl[6] = "4227";
     listLam0[6] = 422.673;
     listA12[6] = eheu[19];
     listLogf[6] = 0.243;
     listLogAij[6] = Math.log(2.18e+08);
     listChiL[6] = 0.00;
     listMass[6] = getMass(listElement[6]);
     listLogGammaCol[6] = 1.0;
     listGw1[6] = 1.0;
     listGw2[6] = 1.0;
     listGwL[6] = 1.0;
     listStage[6] = 0;

     //Fe I 4271
     //listName[6] = "Fe I";
     listName[7] = " ";
     listElement[7] = "Fe";
     listLamLbl[7] = " ";
     listLam0[7] = 427.176;
     listA12[7] = eheu[25]; 
     listLogf[7] = -1.118;
     listLogAij[7] = Math.log(2.28e+07);
     listChiL[7] = 1.485;
     listMass[7] = getMass(listElement[7]);
     listLogGammaCol[7] = 0.0;
     listGw1[7] = 1.0;
     listGw2[7] = 1.0;
     listGwL[7] = 9.0;
     listStage[7] = 0;
    
     //Hgamma
     listName[8] = "HI<em>&#947</em>";
     listElement[8] = "H";
     listLamLbl[8] = " ";
     listLam0[8] = 434.047;
     listA12[8] = 12.0; //By definition - it's Hydrogen
     listLogf[8] = -1.350;
     listLogAij[8] = Math.log(2.5304e+06);
     listChiL[8] = 10.2;
     listMass[8] = getMass(listElement[8]);
     listLogGammaCol[8] = 1.0;
     listGw1[8] = 2.0; // 2n^2
     listGw2[8] = 1.0;
     listGwL[8] = 8.0; // 2n^2
     listStage[8] = 0;

     //Fe I 4384 
     //listName[8] = "Fe I";
     listName[9] = " ";
     listElement[9] = "Fe";
     listLamLbl[9] = " ";
     listLam0[9] = 438.47763;
     listA12[9] = eheu[25]; 
     listLogf[9] = logE*Math.log(1.76e-01);
     listLogAij[9] = Math.log(5.00e+07);
     listChiL[9] = 1.4848644;
     listMass[9] = getMass(listElement[9]);
     listLogGammaCol[9] = 0.0;
     listGw1[9] = 1.0;
     listGw2[9] = 1.0;
     listGwL[9] = 4.0;
     listStage[9] = 0;


     //Hbeta
     listName[10] = "HI<em>&#946</em>";
     listElement[10] = "H";
     listLamLbl[10] = " ";
     listLam0[10] = 486.128;
     listA12[10] = 12.0; //By definition - it's Hydrogen
     listLogf[10] = -0.914;
     listLogAij[10] = Math.log(9.6683e+06);
     listChiL[10] = 10.2;
     listMass[10] = getMass(listElement[10]);
     listLogGammaCol[10] = 1.0;
     listGw1[10] = 2.0; // 2n^2
     listGw2[10] = 1.0;
     listGwL[10] = 8.0; // 2n^2
     listStage[10] = 0;

     //MgIb complex
     listName[11] = " ";
     listElement[11] = "Mg";
     listLamLbl[11] = " ";
     listLam0[11] = 516.876; //nm
     listA12[11] = eheu[11]; // Grevesse & Sauval 98
     listLogf[11] = logE*Math.log(1.35e-01);
     listLogAij[11] = Math.log(1.13e+07);
     listChiL[11] = 2.709;
     listMass[11] = getMass(listElement[11]);
     listLogGammaCol[11] = 1.0;
     listGw1[11] = 1.0;
     listGw2[11] = 1.0;
     listGwL[11] = 5.0;
     listStage[11] = 0;


     //MgIb complex
     listName[12] = " ";
     listElement[12] = "Mg";
     listLamLbl[12] = " ";
     listLam0[12] = 517.413; //nm
     listA12[12] = eheu[11]; // Grevesse & Sauval 98
     listLogf[12] = logE*Math.log(1.35e-01);
     listLogAij[12] = Math.log(3.37e+07);
     listChiL[12] = 2.712;
     listMass[12] = getMass(listElement[12]);
     listLogGammaCol[12] = 1.0;
     listGw1[12] = 1.0;
     listGw2[12] = 1.0;
     listGwL[12] = 5.0;
     listStage[12] = 0;

     //MgIb1
     //listName[14] = "Mg I <em>b</em><sub>1</sub>";
     listName[13] = "MgI<em>b</em>";
     listElement[13] = "Mg";
     listLamLbl[13] = " ";
     listLam0[13] = 518.505; //nm
     listA12[13] = eheu[11]; // Grevesse & Sauval 98
     listLogf[13] = logE*Math.log(1.36e-01);
     listLogAij[13] = Math.log(5.61e+07);
     listChiL[13] = 2.717;
     listMass[13] = getMass(listElement[13]);
     listLogGammaCol[13] = 1.0;
     listGw1[13] = 1.0;
     listGw2[13] = 1.0;
     listGwL[13] = 5.0;
     listStage[13] = 0;

     //NaID2
     //listName[15] = "Na I <em>D</em><sub>2</sub>";
     listName[14] = " ";
     listElement[14] = "Na";
     listLamLbl[14] = " ";
     listLam0[14] = 588.995;
     listA12[14] = eheu[10]; // Grevesse & Sauval 98
     //listLogf[14] = -0.193;
     listLogf[14] = logE*Math.log(0.641);
     listLogAij[14] = Math.log(6.16e+07);
     listChiL[14] = 0.0;
     listMass[14] = getMass(listElement[14]);
     listLogGammaCol[14] = 1.0;
     listGw1[14] = 2.0;
     listGw2[14] = 1.0;
     listGwL[14] = 2.0;
     listStage[14] = 0;
     
     //NaID1
     //listName[16] = "NaI<em>D</em><sub>1, 2</sub>";
     listName[15] = "NaI<em>D</em>";
     listElement[15] = "Na";
     listLamLbl[15] = " ";
     listLam0[15] = 589.592; //nm
     listA12[15] = eheu[10]; // Grevesse & Sauval 98    
     //listLogf[15] = -0.495;
     listLogf[15] = logE*Math.log(0.320);
     listLogAij[15] = Math.log(6.14e+07);
     listChiL[15] = 0.0;
     listMass[15] = getMass(listElement[15]);
     listLogGammaCol[15] = 1.0;
     listGw1[15] = 2.0;
     listGw2[15] = 1.0;
     listGwL[15] = 2.0;
     listStage[15] = 0;

     //Halpha
     listName[16] = "HI<em>&#945</em>";
     listElement[16] = "H";
     listLamLbl[16] = " ";
     listLam0[16] = 656.282;
     listA12[16] = 12.0; //By definition - it's Hydrogen
     listLogf[16] = -0.193;
     listLogAij[16] = Math.log(6.4651e+07);
     listChiL[16] = 10.1988357;
     listMass[16] = getMass(listElement[16]);
     listLogGammaCol[16] = 1.0;
     listGw1[16] = 2.0; // 2n^2
     listGw2[16] = 1.007;
     listGwL[16] = 8.0; // 2n^2
     listStage[16] = 0;
  

  } //end late-type star line list

    //Early-type star line list:
  if (teff > F0Vtemp){ 

 //JB   numLines = 12; 

        numLines = 14;


                        //JB
//
//a variables to count the index it will fall in the numLines array
                var n = 0;
/*     //H (37->2) say HOmega
     listName[n] = "HI<em>&#969</em>";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 365.665;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = Math.log(6.841e-3);
     listLogAij[n] = Math.log(9.9657e+01);
     listChiL[n] = 10.2;
     listMass[n] = getMass(listElement[4]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.0;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;
     
        //console.log("HOmega//  nm: " + listLam0[n]  + " fij: " + listLogf[n]  + " aij: " + listLogAij[n]);
     n++;
*/
/*
    //H (30->2) say HUpshi
          listName[n] = "HI30";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 366.222;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = Math.log(1.2889e-4);
     listLogAij[n] = Math.log(2.8474e+02);
     listChiL[n] = 10.2;
     listMass[n] = getMass(listElement[4]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.0;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;
     
        //console.log("HUpshi//  nm: " + listLam0[n]  + " fij: " + listLogf[n]  + " aij: " + listLogAij[n]);
     n++;

    //H (27->2) say HPsi
          listName[n] = "HI27";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 366.608;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = Math.log(3.807e-4);
     listLogAij[n] = Math.log(4.8261e+02);
     listChiL[n] = 10.2;
     listMass[n] = getMass(listElement[4]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.0;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;
     
        //console.log("HPsi//  nm: " + listLam0[n]  + " fij: " + listLogf[n]  + " aij: " + listLogAij[n]);
     n++;

    //H (26->2) say HSigma
          listName[n] = "HI26";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 366.773;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = Math.log(1.9882e-4);
     listLogAij[n] = Math.log(5.80304e+02);
     listChiL[n] = 10.2;
     listMass[n] = getMass(listElement[4]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.0;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;
     
        //console.log("HSigma//  nm: " + listLam0[n]  + " fij: " + listLogf[n]  + " aij: " + listLogAij[n]);
     n++;

    //H (24->2) say HChi
          listName[n] = "HI24";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 367.14823;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = Math.log(2.5352e-4);
     listLogAij[n] = Math.log(8.7069e+02);
     listChiL[n] = 10.2;
     listMass[n] = getMass(listElement[4]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.0;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;
     
        //console.log("HChi//  nm: " + listLam0[n]  + " fij: " + listLogf[n]  + " aij: " + listLogAij[n]);
     n++;


        //H (17->2) say HOmicron
          listName[n] = "HI17";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 369.7157;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = Math.log(7.2738e-4);
     listLogAij[n] = Math.log(4.9101e+03);
     listChiL[n] = 10.2;
     listMass[n] = getMass(listElement[4]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.0;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;
     
        //console.log("HOmicron//  nm: " + listLam0[n]  + " fij: " + listLogf[n]  + " aij: " + listLogAij[n]);
     n++;

    //H (16->2) say HXi
          listName[n] = "HI16";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 370.3859;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = Math.log(8.769e-4);
     listLogAij[n] = Math.log(6.6583e+03);
     listChiL[n] = 10.2;
     listMass[n] = getMass(listElement[4]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.0;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;
     
        //console.log("HXi//  nm: " + listLam0[n]  + " fij: " + listLogf[n]  + " aij: " + listLogAij[n]);
     n++;

    //H (15->2) say HNu
          listName[n] = "HI15";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 371.1978;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = Math.log(1.0708e-3);
     listLogAij[n] = Math.log(9.2102e+03);
     listChiL[n] = 10.2;
     listMass[n] = getMass(listElement[4]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.0;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;
     
        //console.log("HNu//  nm: " + listLam0[n]  + " fij: " + listLogf[n]  + " aij: " + listLogAij[n]);
     n++;

        //console.log("HNu//  nm: " + listLam0[n]  + " fij: " + listLogf[n]  + " aij: " + listLogAij[n]);
     n++;

    //H (14->2) say HMu
          listName[n] = "HI14";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 372.1946;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = Math.log(1.3269e-3);
     listLogAij[n] = Math.log(1.3032e+04);
     listChiL[n] = 10.2;
     listMass[n] = getMass(listElement[4]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.0;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;
     
   //console.log("HMu//  nm: " + listLam0[n]  + " fij: " + listLogf[n]  + " aij: " + listLogAij[n]);
     n++;


     //H (13->2) say HLambda
          listName[n] = "HI13";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 373.4369;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = Math.log(1.6728e-3);
     listLogAij[n] = Math.log(1.8927e+04);
     listChiL[n] = 10.2;
     listMass[n] = getMass(listElement[4]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.0;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;

        //console.log("HLambda//  nm: " + listLam0[n]  + " fij: " + listLogf[n]  + " aij: " + listLogAij[n]);
     n++;

        //H (12->2) say HKappa
     listName[n] = "HI12";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 375.0151;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = Math.log(2.1521e-3);
     listLogAij[n] = Math.log(2.8337e+04);
     listChiL[n] = 10.2;
     listMass[n] = getMass(listElement[4]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.0;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;

        //console.log("HKappa//  nm: " + listLam0[n]  + " fij: " + listLogf[n]  + " aij: " + listLogAij[n]);
        n++;

        //H (11->2) say HIota
     listName[n] = "HI11";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 377.0633;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = Math.log(2.8368e-3);
     listLogAij[n] = Math.log(4.3972e+04);
     listChiL[n] = 10.2;
     listMass[n] = getMass(listElement[4]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.0;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;

        //console.log("Htheta//  nm: " + listLam0[n]  + " fij: " + listLogf[n]  + " aij: " + listLogAij[n]);
        n++;

        //H (10->2) say HTheta
     listName[n] = "HI10";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 379.7909;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = Math.log(3.8526e-3);
     listLogAij[n] = Math.log(7.1725e+04);
     listChiL[n] = 10.2;
     listMass[n] = getMass(listElement[4]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.0;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;

        //console.log("Htheta//  nm: " + listLam0[n]  + " fij: " + listLogf[n]  + " aij: " + listLogAij[n]);
        n++;
*/
                        //JB
//
     //H (9->2) say Heta
     listName[n] = "HI9";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 383.5397;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = Math.log(5.4317e-3);
     listLogAij[n] = Math.log(1.2156e+05);
     listChiL[n] = 10.2;
     listMass[n] = getMass(listElement[4]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.0;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;

        //console.log("Heta//  nm: " + listLam0[n]  + " fij: " + listLogf[n]  + " aij: " + listLogAij[n]);
        n++;
                        //JB

                        //JB
//
     //H (8->2) say Hzeta
     listName[n] = "HI8";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 388.9064;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = Math.log(8.0397e-3);
     listLogAij[n] = Math.log(2.2148e+05);
     listChiL[n] = 10.2;
     listMass[n] = getMass(listElement[4]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.0;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;

        //console.log("Hzeta//  nm: " + listLam0[n]  + " fij: " + listLogf[n]  + " aij: " + listLogAij[n]);
        n++;
                        //JB

    //CaII K
    listName[n] = "CaIIHK";
    listElement[n] = "Ca";
    listLamLbl[n] = " ";
    listLam0[n] = 393.366;
    listA12[n] = eheu[19];
    listLogf[n] = -0.166;
    listLogAij[n] = Math.log(1.47e+08);
    listChiL[n] = 0.0;
    listMass[n] = getMass(listElement[0]);
    listLogGammaCol[n] = 0.5;
    listGw1[n] = 1.0;
    listGw2[n] = 2.0;
    listGwL[n] = 2.0;
    listStage[n] = 1;
        //JB
         n++;

     //CaII H
     //listName[1] = "Ca II H";
     listName[n] = " ";
     listElement[n] = "Ca";
     listLamLbl[n] = " ";
     listLam0[n] = 396.847;
     listA12[n] = eheu[19];
     listLogf[n] = -0.482;
     listLogAij[n] = Math.log(1.4e+08);
     listChiL[n] = 0.0;
     listMass[n] = getMass(listElement[1]);
     listLogGammaCol[n] = 0.5;
     listGw1[n] = 1.0;
     listGw2[n] = 2.0;
     listGwL[n] = 2.0;
     listStage[n] = 1;
        //JB
         n++;

     //Hepsilon
     //listName[2] = "H I <em>&#949</em>";
     listName[n] = "HI<em>&#949</em>";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 397.1198;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = logE*Math.log(1.2711e-02);
     listLogAij[n] = Math.log(4.3889e+05);
     listChiL[n] = 10.2;
     listMass[n] = getMass(listElement[2]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.0;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;
        //JB
          n++;

    //He I 4026
     listName[n] = "HeI";
     listElement[n] = "He";
     listLamLbl[n] = "4026";
     listLam0[n] = 402.73292;
     listA12[n] = eheu[1];
     listLogf[n] = logE*Math.log(3.9492e-02);
     listLogAij[n] = Math.log(1.1601e+07);
     listChiL[n] = 20.964087;
     listMass[n] = getMass(listElement[3]);
     listLogGammaCol[n] = 0.0;
     listGw1[n] = 1.0;
     listGw2[n] = 1.0;
     listGwL[n] = 2.0;
     listStage[n] = 0;
        //JB
        n++;

     //Hdelta
     listName[n] = "HI<em>&#948</em>";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 410.174;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = -1.655;
     listLogAij[n] = Math.log(9.7320e+05);
     listChiL[n] = 10.2;
     listMass[n] = getMass(listElement[4]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.0;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;
        //JB
     n++;

     //Hgamma
     listName[n] = "HI<em>&#947</em>";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 434.047;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = -1.350;
     listLogAij[n] = Math.log(2.5304e+06);
     listChiL[n] = 10.2;
     listMass[n] = getMass(listElement[5]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.0;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;
        //JB
        n++;

     //He I 4387
     listName[n] = "HeI";
     listElement[n] = "He";
     listLamLbl[n] = "4388";
     listLam0[n] = 438.793;
     listA12[n] = eheu[1];
     listLogf[n] = -1.364;
     listLogAij[n] = Math.log(8.9889e+06);
     listChiL[n] = 21.218;
     listMass[n] = getMass(listElement[6]);
     listLogGammaCol[n] = 0.0;
     listGw1[n] = 1.0;
     listGw2[n] = 1.0;
     listGwL[n] = 3.0;
     listStage[n] = 0;
        //JB
        n++;

     //He I 4471
     listName[n] = "HeI";
     listElement[n] = "He";
     listLamLbl[n] = "4471";
     listLam0[n] = 447.147;
     listA12[n] = eheu[1];
     listLogf[n] = -0.986;
     listLogAij[n] = Math.log(2.4579e+07);
     listChiL[n] = 20.964;
     listMass[n] = getMass(listElement[7]);
     listLogGammaCol[n] = 0.0;
     listGw1[n] = 1.0;
     listGw2[n] = 1.0;
     listGwL[n] = 5.0;
     listStage[n] = 0;
        //JB
        n++;

     //Mg II 4482.2387
     //listName[11] = "4482.387";
     listName[n] = " ";
     listElement[n] = "Mg";
     listLamLbl[n] = " ";
     listLam0[n] = 448.2387; //nm
     listA12[n] = eheu[11]; // Grevesse & Sauval 98
     listLogf[n] = logE*Math.log(9.35e-01);
     listLogAij[n] = Math.log(2.33e+08);
     listChiL[n] = 8.863654;
     listMass[n] = getMass(listElement[8]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 1.0;
     listGw2[n] = 1.0;
     listGwL[n] = 5.0;
     listStage[n] = 1;
        //JB
        n++;

     //Mg II 4482.2387
     listName[n] = "MgII";
     listElement[n] = "Mg";
     listLamLbl[n] = "4482";
     listLam0[n] = 448.2584; //nm
     listA12[n] = eheu[11]; // Grevesse & Sauval 98
     listLogf[n] = logE*Math.log(9.81e-01);
     listLogAij[n] = Math.log(2.17e+08);
     listChiL[n] = 8.863762;
     listMass[n] = getMass(listElement[9]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 1.0;
     listGw2[n] = 1.0;
     listGwL[n] = 3.0;
     listStage[n] = 1;
        //JB
        n++;

     //Hbeta
     listName[n] = "HI<em>&#946</em>";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 486.128;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = -0.914;
     listLogAij[n] = Math.log(9.6683e+06);
     listChiL[n] = 10.2;
     listMass[n] = getMass(listElement[10]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.0;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;
        //JB
        n++;

     //Halpha
     listName[n] = "HI<em>&#945</em>";
     listElement[n] = "H";
     listLamLbl[n] = " ";
     listLam0[n] = 656.282;
     listA12[n] = 12.0; //By definition - it's Hydrogen
     listLogf[n] = -0.193;
     listLogAij[n] = Math.log(6.4651e+07);
     listChiL[n] = 10.1988357;
     listMass[n] = getMass(listElement[11]);
     listLogGammaCol[n] = 1.0;
     listGw1[n] = 2.0; // 2n^2
     listGw2[n] = 1.007;
     listGwL[n] = 8.0; // 2n^2
     listStage[n] = 0;


    
  } //end early-type star line list


//
//
//
//   **** END line list
//
//
// Get parameters for power-law expansion of Hjerting function for the Voigt profile
// approximation:
        var hjertComp = hjertingComponents();
    //if Hydrogen or Helium, zScale should be unity for these purposes:
    var zScaleList = 1.0; //initialization

    //Notes
    //
    //CAUTION: This treatment expects numPoints (number of wavelengths, lambda) to be the same for *all* spectral lines!
    var listNumCore = 5; // half core
    var listNumWing = 10; // per wing 
    //int numWing = 0;  //debug
    var listNumPoints = 2 * (listNumCore + listNumWing) - 1; // + 1;  //Extra wavelength point at end for monochromatic continuum tau scale

    //default initializations:

        var numMaster;
        if (ifTiO == 1){
            numMaster = numLams + (numLines * listNumPoints) + (numJola * jolaNumPoints); // + (numSedLines * sedNumPoints); //total size (number of wavelengths) of master lambda & total kappa arrays
        } else {
            numMaster = numLams + (numLines * listNumPoints);
        }
 
    var masterLams = [];
    masterLams.length = numMaster;
    var masterIntens = [];
    masterIntens.length = numMaster;
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

//seed masterLams and logMasterKaps with continuum SED lambdas and kapaps:
//This just initializes the first numLams of the numMaster elements

//Initialize monochromatic line blanketed opacity array:
//// Seed first numLams wavelengths with continuum wavelength and kappa values
//
        for (var iL = 0; iL < numLams; iL++) {
        //    console.log("iL " + iL + " lambdaScale[iL] " + lambdaScale[iL]);
            masterLams[iL] = lambdaScale[iL];
            for (var iD = 0; iD < numDeps; iD++) {
                logMasterKaps[iL][iD] = logKappa[iL][iD]; 
            }
        }
//initialize the rest with dummy values
        for (var iL = numLams; iL < numMaster; iL++) {
            masterLams[iL] = lambdaScale[numLams - 1];
            for (var iD = 0; iD < numDeps; iD++) {
                logMasterKaps[iL][iD] = logKappa[numLams-1][iD];
            }
        }

//Initialize monochromatic continuum opacity array:
////This is a fake for now - it's just th gray opacity at every wavelength
        for (var iL = 0; iL < numLams; iL++) {
            for (var iD = 0; iD < numDeps; iD++) {
                logContKaps[iL][iD] = logKappa[iL][iD]; 
            }
        }


//Stuff for the the Teff recovery test:
        var lambda1, lambda2, fluxSurfBol, logFluxSurfBol, listLam0nm;
        fluxSurfBol = 0;


//
             //Get the components for the power series expansion approximation of the Hjerting function
             // for treating Voigt profiles:
        var listLineProf = [];
        listLineProf.length = listNumPoints;
        for (var i = 0; i < listNumPoints; i++){
           listLineProf[i] = [];
           listLineProf[i].length = numDeps;
        }


//Begin numLines loop:
  
  var doLines = 1;   //diagnostic
  if (doLines == 1){   //diagnostic
        for (var iLine = 0; iLine < numLines; iLine++) {
        //for (var iLine = 0; iLine < 1; iLine++) {
        //console.log("iLine " + iLine);

            //if H or He, make sure zScale is unity:
            if ((listElement[iLine] === "H") ||
                    (listElement[iLine] === "He")) {
                zScaleList = 1.0;
                if (listLam0[iLine] <= 657.0){
                    listGwL[iLine] = 8.0;  //fix for Balmer lines
                } else {
                    listGwL[iLine] = 18.0;  //fix for Paschen lines
                }
            } else {
                zScaleList = zScale;
            }
          var iAbnd = 0; //initialization
          var logNums_ptr = 0;
          for (var jj = 0; jj < nelemAbnd; jj++){
             if (listElement[iLine] == cname[jj]){
                if (listStage[iLine] == 0){
                  species = cname[jj] + "I";
                  logNums_ptr = 0;
                }
                if (listStage[iLine] == 1){
                  species = cname[jj] + "II";
                  logNums_ptr = 1;
                }
                if (listStage[iLine] == 2){
                  species = cname[jj] + "III";
                  logNums_ptr = 4;
                }
                if (listStage[iLine] == 3){
                  species = cname[jj] + "IV";
                  logNums_ptr = 5;
                }
                if (listStage[iLine] == 4){
                  species = cname[jj] + "V";
                  logNums_ptr = 6;
                }
                thisUwV = getPartFn2(species); //base e log_10 U
                 break;   //we found it
                 }
             iAbnd++;
          } //jj loop
           var listLogNums = [];
           listLogNums.length = numStages+2;
           for (var i = 0; i < (numStages+2); i++){
              listLogNums[i] = [];
              listLogNums[i].length = numDeps;
           }
            for (var iTau = 0; iTau < numDeps; iTau++){
               listLogNums[0][iTau] = masterStagePops[iAbnd][0][iTau];
               listLogNums[1][iTau] = masterStagePops[iAbnd][1][iTau];
               listLogNums[4][iTau] = masterStagePops[iAbnd][2][iTau];
               listLogNums[5][iTau] = masterStagePops[iAbnd][3][iTau];
               //listLogNums[6][iTau] = masterStagePops[iAbnd][4][iTau];
            }

            listLam0nm = listLam0[iLine] * 1.0e-7; // nm to cm
            var numHelp = levelPops(listLam0nm, listLogNums[logNums_ptr], listChiL[iLine], thisUwV,
                     listGwL[iLine], numDeps, temp);

           for (var iTau = 0; iTau < numDeps; iTau++){
               listLogNums[2][iTau] = numHelp[iTau];
               listLogNums[3][iTau] = -49.0; //upper E-level - not used - fake for testing with gS3 line treatment
            }
            var listLinePoints = lineGrid(listLam0nm, listMass[iLine], xiT, numDeps, teff, listNumCore, listNumWing, species);
                    //logGammaCol, tauRos, temp, pGas, tempSun, pGasSun, species);
            // Gaussian + Lorentzian approximation to profile (voigt()):
            // // Real Voigt fn profile (voigt2()):   
            if (species == "HI"){
               listLineProf = stark(listLinePoints, listLam0nm, listLogAij[iLine], listLogGammaCol[iLine],
                    numDeps, teff, tauRos, temp, pGas, newNe, tempSun, pGasSun, hjertComp, listName[iLine]); 
            } else {
               listLineProf = voigt(listLinePoints, listLam0nm, listLogAij[iLine], listLogGammaCol[iLine],
                    numDeps, teff, tauRos, temp, pGas, tempSun, pGasSun, hjertComp);
            }
            var listLogKappaL = lineKap(listLam0nm, listLogNums[2], listLogf[iLine], listLinePoints, listLineProf,
                    numDeps, zScaleList, tauRos, temp, rho, logFudgeTune);
            var listLineLambdas = [];
            listLineLambdas.length = listNumPoints;
            for (var il = 0; il < listNumPoints; il++) {
// // lineProf[iLine][*] is DeltaLambda from line centre in cm
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
                }
            }
        } //numLines loop
      } //end if doLines condition - diagnostic

 if (teff <= jolaTeff){
//Begin loop over JOLA bands - isert JOLA oapcity into opacity spectum...
   var helpJolaSum = 0.0;

 if (ifTiO == 1){

   for (var iJola = 0; iJola < numJola; iJola++){

      //Find species in molecule set:
      for (var iMol = 0; iMol < nMols; iMol++){
        if (mname[iMol] == jolaSpecies[iJola]){
          //console.log("mname " + mname[iMol]);
          for (var iTau= 0; iTau < numDeps; iTau++){
             logNumJola[iTau] = masterMolPops[iMol][iTau];
             //var logTiOpp = logNumJola[iTau] + temp[1][iTau] + logK;
             //console.log("TiO pp " + logE*logTiOpp);
          }
        }
      }

        jolaOmega0 = getOrigin(jolaSystem[iJola]);  //band origin ?? //Freq in Hz OR waveno in cm^-1 ??
        jolaRSqu = getSqTransMoment(jolaSystem[iJola]); //needed for total vibrational band oscillator strength (f_v'v")
        jolaB = getRotConst(jolaSystem[iJola]); // B' and b" values of upper and lower vibational state
        jolaLambda = getWaveRange(jolaSystem[iJola]); //approx wavelength range of band
        //Line strength factor from Allen's 4th Ed., p. 88, "script S":
        jolaQuantumS = getQuantumS(jolaSystem[iJola]);

//Compute line strength, S, Allen, p. 88:
        jolaS = jolaRSqu * jolaQuantumS; //may not be this simple (need q?)
//Compute logf , Allen, p. 61 Section 4.4.2 - for atoms or molecules - assumes g=1 so logGf = logF:
        //jolaLogF = logSTofHelp + Math.log(jolaOmega0) + Math.log(jolaS); //if omega0 is a freq in Hz
        //Gives wrong result?? jolaLogF = logSTofHelp + logC + Math.log(jolaOmega0) + Math.log(jolaS); //if omega0 is a waveno in cm^-1
        var checkgf = 303.8*jolaS/(10.0*jolaLambda[0]); //"Numerical relation", Allen 4th, p. 62 - lambda in A
        //System.out.println("jolaLogF " + logE*jolaLogF + " log checkgf " + Math.log10(checkgf) + " jolaOmega0 " + jolaOmega0[iJola]);
        jolaLogF = Math.log(checkgf); //better??
        //console.log("jolaLogF " + jolaLogF);
        //jolaLogF = -999.0; //test

        if (jolaDeltaLambda[iJola] == 0){
           jolaAlphP = jolaAlphP_DL0; // alpha_P - weight of P branch (Delta J = 1)
           jolaAlphR = jolaAlphR_DL0; // alpha_R - weight of R branch (Delta J = -1)
           jolaAlphQ = jolaAlphQ_DL0; // alpha_Q - weight of Q branch (Delta J = 0)
        }
        if (jolaDeltaLambda[iJola] != 0){
           jolaAlphP = jolaAlphP_DL1; // alpha_P - weight of P branch (Delta J = 1)
           jolaAlphR = jolaAlphR_DL1; // alpha_R - weight of R branch (Delta J = -1)
           jolaAlphQ = jolaAlphQ_DL1; // alpha_Q - weight of Q branch (Delta J = 0)
        }

 //console.log("jolaOmega0 " + jolaOmega0 + " jolaRSqu " + jolaRSqu + " jolaB " + jolaB[0] + " " + jolaB[1] + " jolaLambda " + jolaLambda[0] + " " + jolaLambda[1] + " jolaQuantumS " + jolaQuantumS + " jolaS " + jolaS + " jolaLogF " + logE*jolaLogF + " jolaAlphP " + jolaAlphP + " jolaAlphR " + jolaAlphR);

        var jolaPoints = jolaGrid(jolaLambda, jolaNumPoints);

//This sequence of methods might not be the best way, but it's based on the procedure for atomic lines
// Put in JOLA bands:

//P & R brnaches in every case:
        dfBydv = jolaProfilePR(jolaOmega0, jolaLogF, jolaB,
                                     jolaPoints, jolaAlphP, jolaAlphR, numDeps, temp);

        var jolaLogKappaL = jolaKap(logNumJola, dfBydv, jolaPoints,
                  numDeps, temp, rho);

        //for (var iW = 0; iW < jolaNumPoints; iW++){
        //   for (var iD = 0; iD < numDeps; iD++){
        //      if (iD%10 == 1){
        //         console.log("iW " + iW + " iD " + iD + " jolaLogKappaL " + logE*jolaLogKappaL[iW][iD]);
        //      }
        //   }
        //}
//Q branch if DeltaLambda not equal to 0
        // if (jolaDeltaLambda[iJola] != 0){
         //   dfBydv = jolaProfileQ(jolaOmega0, jolaLogF, jolaB,
          //                            jolaPoints, jolaAlphQ, numDeps, temp);
 //
         //   var jolaLogKappaQL = jolaKap(logNumJola, dfBydv, jolaPoints,
           //        numDeps, temp, rho);
          //  //Now add it to the P & R branch opacity:
          //  for (var iW = 0; iW < jolaNumPoints; iW++){
           //    for (var iD = 0; iD < numDeps; iD++){
            // //   //  if (iD%10 == 1){
             // //       //System.out.println("iW " + iW + " iD " + iD + " jolaLogKappaL " + jolaLogKappaL[iW][iD]);
              // //  // }
              //     helpJolaSum = Math.exp(jolaLogKappaL[iW][iD]) + Math.exp(jolaLogKappaQL[iW][iD]);
              //     jolaLogKappaL[iW][iD] = Math.log(helpJolaSum);
           //    } //iD loop
          //  } //iW loop
       //  }

            var jolaLambdas = [];
            jolaLambdas.length = jolaNumPoints;
            for (var il = 0; il < jolaNumPoints; il++) {
                // // lineProf[gaussLine_ptr[iLine]][*] is DeltaLambda from line centre in cm
                jolaLambdas[il] = 1.0e-7 * jolaPoints[il];
            }
            //System.out.println("iJola " + iJola);
         //   for (var ll = 0; ll < jolaNumPoints; ll++){
          //     console.log("ll " + ll + " jolaLambdas " + jolaLambdas[ll]);
          //  }

            var masterLamsOut = masterLambda(numLams, numMaster, numNow, masterLams, jolaNumPoints, jolaLambdas);
            var logMasterKapsOut = masterKappa(numDeps, numLams, numMaster, numNow, masterLams, masterLamsOut, logMasterKaps, jolaNumPoints, jolaLambdas, jolaLogKappaL);
            numNow = numNow + jolaNumPoints;
            //console.log("iJola " + iJola + " numNow " + numNow);
            //update masterLams and logMasterKaps:
            for (var iL = 0; iL < numNow; iL++) {
                masterLams[iL] = masterLamsOut[iL];
                for (var iD = 0; iD < numDeps; iD++) {
                    //Still need to put in multi-Gray levels here:
                    logMasterKaps[iL][iD] = logMasterKapsOut[iL][iD];
                    //if (iL%50 == 5){
                    // if (iD%5 == 1){
                    //   console.log("iL " + iL + " masterLams " + masterLams[iL] + " logMasterKaps " + logE*logMasterKaps[iL][iD]);
                    // }
                    //}
                } //iD loop
            } //iL loop

    } //iJola JOLA band loop

  } //ifTiO condition

 } //jolaTeff condition

////Diagnostic:
//       for (var iL = 0; iL < numNow; iL++) {
//           for (var iD = 0; iD < numDeps; iD++) {
//               if (iL%50 == 5){
//               if (iD%5 == 1){
//               console.log("iL " + iL + " masterLams " + masterLams[iL] + " logMasterKaps " + logE*logMasterKaps[iL][iD]);
//                  }
//             }
//          }
//       }


//Continuum monochromatic optical depth array:
        var logTauCont = tauLambdaCont(numLams, logKappa,
                 kappa500, numDeps, tauRos, logTotalFudge);
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


            for (var it = 0; it < numThetas; it++) {
                contIntens[il][it] = contIntensLam[it];
            } //it loop - thetas


            //// Teff test - Also needed for convection module!:
            if (il > 1) {
                lambda2 = lambdaScale[il]; // * 1.0E-7;  // convert nm to cm
                lambda1 = lambdaScale[il - 1]; // * 1.0E-7;  // convert nm to cm
                fluxSurfBol = fluxSurfBol
                        + contFluxLam[0] * (lambda2 - lambda1);
            }
        } //il loop
        contFlux = flux3(contIntens, lambdaScale, cosTheta, phi, cgsRadius, omegaSini, macroVkm);

//int numMaster = masterLams.length;
        var logTauMaster = tauLambda(numMaster, masterLams, logMasterKaps,
                numDeps, kappa500, tauRos, logTotalFudge);
        //Evaluate formal solution of rad trans eq at each lambda throughout line profile
        // Initial set to put lambda and tau arrays into form that formalsoln expects

        var masterIntensLam = [];
        masterIntensLam.length = numThetas;
        var masterFluxLam = [];
        masterFluxLam.length = 2;
        //
        lineMode = false; //no scattering for overall SED

        for (var il = 0; il < numMaster; il++) {

            for (var id = 0; id < numDeps; id++) {
                //console.log("il " + il + " id " + id + " logTauMaster " + logTauMaster[il][id]);
                thisTau[1][id] = logTauMaster[il][id];
                thisTau[0][id] = Math.exp(logTauMaster[il][id]);
            } // id loop

            masterIntensLam = formalSoln(numDeps,
                    cosTheta, masterLams[il], thisTau, temp, lineMode);
            //masterFluxLam = flux2(masterIntensLam, cosTheta);
            for (var it = 0; it < numThetas; it++) {
                masterIntens[il][it] = masterIntensLam[it];
            } //it loop - thetas
        } //il loop
            masterFlux = flux3(masterIntens, masterLams, cosTheta, phi, cgsRadius, omegaSini, macroVkm);

            //// Teff test - Also needed for convection module!:
        for (var il = 1; il < numMaster; il++) {
            if (il > 1) {
                lambda2 = masterLams[il]; // * 1.0E-7;  // convert nm to cm
                lambda1 = masterLams[il - 1]; // * 1.0E-7;  // convert nm to cm
                fluxSurfBol = fluxSurfBol
                        + masterFluxLam[0] * (lambda2 - lambda1);
            }
        } 
        var sigma = 5.670373E-5; //Stefan-Boltzmann constant ergs/s/cm^2/K^4  
        var logSigma = Math.log(sigma);
        logFluxSurfBol = Math.log(fluxSurfBol);
        var logTeffFlux = (logFluxSurfBol - logSigma) / 4.0;
        var teffFlux = Math.exp(logTeffFlux);
        ////Teff test
        //console.log("FLUX: Recovered Teff = " + teffFlux);
        //Compute JOhnson-Cousins photometric color indices:
        // Disk integrated Flux

//Extract linear monochromatic continuum limb darlening coefficients (LDCs) ("epsilon"s):
    var ldc = [];
    ldc.length = numLams;
    ldc = ldCoeffs(numLams, lambdaScale, numThetas, cosTheta, contIntens);


        colors = UBVRI(masterLams, masterFlux, numDeps, tauRos, temp);
//
    } // ifLineOnly condition


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
            storeName = "pGasSun" + String(i);
            storeValue = String(pGasSun[1][i]);
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

        // Store the target stellar structure:

        //Generate the keys - we need one for every single scalar data value
        // and stringify and store the corresponding array element:
        //Store logarithmic values - we can reconstruct lienar values

        for (var i = 0; i < numDeps; i++) {
            //console.log(keyTemp[i]);
            storeName = "temp" + String(i);
            storeValue = String(temp[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "depth" + String(i);
            storeValue = String(depths[i]);
            sessionStorage.setItem(storeName, storeValue);
            for (var iL = 0; iL < numLams; iL++){
               storeName = "kapp" + String(iL) + "_" + String(i);
               storeValue = String(logKappa[iL][i]);
               sessionStorage.setItem(storeName, storeValue);
            }
            //Gas pressure
            storeName = "pGas" + String(i);
            storeValue = String(pGas[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            //Radiation pressure
            storeName = "pRad" + String(i);
            storeValue = String(pRad[1][i]);
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
            storeName = "newNe" + String(i);
            storeValue = String(newNe[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "logNH" + String(i);
            storeValue = String(logNH[i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "kappaRos" + String(i);
            storeValue = String(kappaRos[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "kappa500" + String(i);
            storeValue = String(kappa500[1][i]);
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
        storeName = "zScale";
        storeValue = String(zScale);
        sessionStorage.setItem(storeName, storeValue);
        storeName = "starMass";
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
    // User line profile section:
//
//
//
//


    // Set up grid of line lambda points sampling entire profile (cm):
    var numCore = 5; //half-core
    var numWing = 15; //per wing 
    var numPoints = 2 * (numCore + numWing) - 1; // + 1;  //Extra wavelength point at end for monochromatic continuum tau scale
    //linePoints: Row 0 in cm (will need to be in nm for Plack.planck), Row 1 in Doppler widths
    species = "Ca"; //Anything but H - doesn't really matter for now - ??
    var linePoints = lineGrid(lam0, mass, xiT, numDeps, teff, numCore, numWing,
            logGammaCol, tauRos, temp, pGas, tempSun, pGasSun, species); //cm

// Get Einstein coefficinet for spontaneous de-excitation from f_ij to compute natural 
// (radiation) roadening:  Assumes ration of statisitcal weight, g_j/g_i is unity
    var logAij = Math.log(6.67e13) + Math.log(10.0)*logF - 2.0*Math.log(1.0e7*lam0);
    ////
    //Compute area-normalized depth-independent line profile "phi_lambda(lambda)"
    if (ifVoigt === true) {
        var lineProf = voigt2(linePoints, lam0, logAij, logGammaCol,
                numDeps, teff, tauRos, temp, pGas, tempSun, pGasSun);
    } else {
        var lineProf = voigt(linePoints, lam0, logAij, logGammaCol,
                numDeps, teff, tauRos, temp, pGas, tempSun, pGasSun, hjertComp);
    }

//
// Level population now computed in LevelPops.levelPops()

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

//
   var logNums = [];
   logNums.length = numStages+2;
   for (var i = 0; i < (numStages+2); i++){
      logNums[i] = [];
      logNums[i].length = numDeps;
   }
   for (var i = 0; i < numDeps; i++){
      thisLogN[i] = logE10*(A12 - 12.0) + logNH[i];
   }
//Below need to make log10UwAArr a 2 by 5 array instead of 2 by 2 lburns
//load arrays for stagePops2():
       chiIArr[0] = chiI1;
       chiIArr[1] = chiI2;
       chiIArr[2] = chiI3;
       chiIArr[3] = chiI4;
    // NEW All 4 Ionization Stages assigned values here: lburns 
       for (var k = 0; k < log10Gw1V.length; k++){
           log10UwAArr[0][k] = log10Gw1V[k];
           log10UwAArr[1][k] = log10Gw2V[k];
           log10UwAArr[2][k] = log10Gw3V[k];
           log10UwAArr[3][k] = log10Gw4V[k];
       }


//One phantom molecule:
    var fakeNumMols = 1;
    var fakeLogNumB = [];
    fakeLogNumB.length = 1;
    fakeLogNumB[0] = [];
    fakeLogNumB[0].length = numDeps;
    for (var i = 0; i < numDeps; i++){
      fakeLogNumB[0][i] = -49.0;
    }
    var fakeDissEArr = [];
    fakeDissEArr.length = 1;
    fakeDissEArr[0] = 29.0; //eV
    var fakeLog10UwBArr = [];
    fakeLog10UwBArr.length = 1;
    fakeLog10UwBArr[0] = [];
    fakeLog10UwBArr[0].length = 5;
    for (var k = 0; k < fakeLog10UwBArr[0].length; k++){
       fakeLog10UwBArr[0][k] = 0.0;
    }
    var fakeLogQwABArr = [];
    fakeLogQwABArr.length = fakeNumMols;
    for (var im = 0; im < fakeNumMols; im++){
        fakeLogQwABArr[im] = [];
        fakeLogQwABArr[im].length = 5;
    }
    for (var im = 0; im < fakeNumMols; im++){
       for (var kk = 0; kk < 5; kk++){
           fakeLogQwABArr[im][kk] = Math.log(300.0);
       }        
    }
    var fakeLogMuABArr = [];
    fakeLogMuABArr.length = 1;
    fakeLogMuABArr[0] = Math.log(2.0) + logAmu; //g 
    var logN = stagePops2(thisLogN, newNe, chiIArr, log10UwAArr, 
                fakeNumMols, fakeLogNumB, fakeDissEArr, fakeLog10UwBArr, fakeLogQwABArr, fakeLogMuABArr, 
                numDeps, temp);
    for (var iTau = 0; iTau < numDeps; iTau++){
         logNums[0][iTau] = logN[0][iTau];
         logNums[1][iTau] = logN[1][iTau];
         logNums[4][iTau] = logN[2][iTau];
         logNums[5][iTau] = logN[3][iTau];
         //logNums[6][iTau] = logN[4][iTau];
       }

    var stage_ptr = 0; //default initialization is neutral stage
    if (stage == 0){
       stage_ptr = 0;
    }
    if (stage == 1){
       stage_ptr = 1;
    }
    if (stage == 2){
       stage_ptr = 4;
    }
    if (stage == 3){
       stage_ptr = 5;
    }
    numHelp = levelPops(lam0, logN[stage_ptr], chiL, thisUwV, gwL,
         numDeps, temp);
    for (var iTau = 0; iTau < numDeps; iTau++){
        logNums[2][iTau] = numHelp[iTau];
    //Log of line-center wavelength in cm
    }
    var logLam0 = Math.log(lam0);
    // energy of b-b transition
    var logTransE = logH + logC - logLam0 - logEv; // last term converts back to cgs units
    // Energy of upper E-level of b-b transition
    var chiU = chiL + Math.exp(logTransE);
    numHelp = levelPops(lam0, logN[stage_ptr], chiU, thisUwV, gwL,
         numDeps, temp);
    for (var iTau = 0; iTau < numDeps; iTau++){
        logNums[3][iTau] = numHelp[iTau]; //upper E-level - not used - fake for testing with gS3 line treatment
    }
    //
    //Compute depth-dependent logarithmic monochromatic extinction co-efficient, kappa_lambda(lambda, tauRos):
    var lineLambdas = [];
    lineLambdas.length = numPoints;
            for (var il = 0; il < numPoints; il++) {
                lineLambdas[il] = linePoints[0][il] + lam0;
            }
    var logKappaL = lineKap(lam0, logNums[2], logF, linePoints, lineProf,
            numDeps, zScale, tauRos, temp, rho, logFudgeTune);
    var logTotKappa = lineTotalKap(lineLambdas, logKappaL, numDeps, logKappa, 
         numPoints, numLams, lambdaScale);
    //
    //Compute monochromatic optical depth scale, Tau_lambda throughout line profile
    //CAUTION: Returns numPoints+1 x numDeps array: the numPoints+1st row holds the line centre continuum tau scale
    var logTauL = tauLambda(numPoints, lineLambdas, logTotKappa,
            numDeps, kappa500, tauRos, logTotalFudge);
    //Evaluate formal solution of rad trans eq at each lambda throughout line profile
    // Initial set to put lambda and tau arrays into form that formalsoln expects

    var lineIntens = [];
    lineIntens.length = numPoints;
    for (var row = 0; row < numPoints; row++) {
        lineIntens[row] = [];
        lineIntens[row].length = numThetas;
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

        for (var id = 0; id < numDeps; id++) {
            thisTau[1][id] = logTauL[il][id];
            thisTau[0][id] = Math.exp(logTauL[il][id]);
            //console.log("il " + il + " id " + id + " logTauL[il][id] " + logE*logTauL[il][id]);
        } // id loop

        lineIntensLam = formalSoln(numDeps,
                cosTheta, lineLambdas[il], thisTau, temp, lineMode);
        //lineFluxLam = flux2(lineIntensLam, cosTheta);
        for (var it = 0; it < numThetas; it++) {
            lineIntens[il][it] = lineIntensLam[it];
            //console.log("il " + il + " it " + it + "lineIntensLam[it] " + lineIntensLam[it]);
        } //it loop - thetas
    } //il loop
        lineFlux = flux3(lineIntens, lineLambdas, cosTheta, phi, cgsRadius, omegaSini, macroVkm);

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


//Get equivalent width, W_lambda, in pm - picometers:
    var Wlambda = eqWidth(lineFlux2, linePoints, lam0); //, fluxCont);
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

    var xRangeText = 2050;
    var yRangeText = 65;
    var xOffsetText = 10;
    var yOffsetText = 10;
    var charToPxText = 4; // width of typical character font in pixels - CAUTION: finesse!

    var zeroInt = 0;
    //these are the corresponding strings ready to be assigned to HTML style attributes


    var xRangeTextStr = numToPxStrng(xRangeText);
    var yRangeTextStr = numToPxStrng(yRangeText);
    var xOffsetTextStr = numToPxStrng(xOffsetText);
    var yOffsetTextStr = numToPxStrng(yOffsetText);
    // Very first thing on each load: White-wash the canvas!!


    var washTId = document.createElement("div");
    var washTWidth = xRangeText + xOffsetText;
    var washTHeight = yRangeText + yOffsetText;
    var washTTop = yOffsetText;
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
    washTId.style.backgroundColor = "#EEEEEE";
    washTId.style.zIndex = 0;
    textId.appendChild(washTId);


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
            360, 40, lineColor, textId);
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
    var roundNum5 = colors[5].toFixed(2);// lburns
    var roundNum6 = colors[6].toFixed(2);//lburns
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
</a>: " 
       + roundNum4, 180 + colr * xTab, 15, lineColor, textId);
//Added another txtPrint function to display V-K and J-K. Adjusted spectralLine over to fit in these new colors. lburns 06
    txtPrint("<a href='http://en.wikipedia.org/wiki/UBV_photometric_system' title='Johnson-Cousins V-K photometric color index' target='_blank'>\n\
<span style='color:#00FF88'>V</span>-" +
            "<span style='color:sienna'>K\n\
</span>\n\
</a>: " + roundNum5
            + " <a href='http://en.wikipedia.org/wiki/UBV_photometric_system' title='Johnson-Cousins J-K photometric color index' target='_blank'>\n\
<span style='color:firebrick'>J</span>-" +
            "<span style='color:sienna'>K\n\
</span>\n\
</a>: " + roundNum6, 180, 40, lineColor, textId);

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
    //Add subclass to each spectral class (lburns)
    var spectralClass = " ";
    var subClass = " ";	//Create a variable for the subclass of the star. lburns
    var luminClass = "V";//defaults to V
//Determine the spectralClass and subClass of main sequence stars, subdwarfs and white dwarfs
//var luminClass = "V" or luminClass = "VI" or luminClass = "WD"
//#// Based on the data in Appendix G of An Introduction to Modern Astrophysics, 2nd Ed. by
//#// Carroll & Ostlie
if (((logg >= 4.0) && (logg < 5.0)) || ((logg >= 5.0) && (logg < 6.0)) || (logg >= 5.0)) {
    if (teff < 3000.0) {
        spectralClass = "L";
    } else if ((teff >= 3000.0) && (teff < 3900.0)) {
        spectralClass = "M";
	if ((teff >= 3000.0) && (teff <= 3030.0)) {
	    subClass = "6";
	} else if ((teff > 3030.0) && (teff <= 3170.0)) {
	    subClass = "5";
	} else if ((teff > 3170.0) && (teff <= 3290.0)) {
	    subClass = "4";
	} else if ((teff > 3290.0) && (teff <= 3400.0)) {
	    subClass = "3";
	} else if ((teff > 3400.0) && (teff <= 3520.0)) {
	    subClass = "2";
	} else if ((teff > 3520.0) && (teff <= 3660.0)) {
	    subClass = "1";
	} else if ((teff > 3660.0) && (teff < 3900.0)) {
	    subClass = "0";
	}
    } else if ((teff >= 3900.0) && (teff < 5200.0)) {
        spectralClass = "K";
	if ((teff >= 3900.0) && (teff <= 4150.0)) {
	    subClass = "7";
	} else if ((teff > 4150.0) && (teff <= 4410.0)) {
	    subClass = "5";
	} else if ((teff > 4410.0) && (teff <= 4540.0)) {
	    subClass = "4";
	} else if ((teff > 4540.0) && (teff <= 4690.0)) {
	    subClass = "3";
	} else if ((teff > 4690.0) && (teff <= 4990.0)) {
	    subClass = "1";
	} else if ((teff > 4990.0) && (teff < 5200.0)) {
	    subClass = "0";
	}
    } else if ((teff >= 5200.0) && (teff < 5950.0)) {
        spectralClass = "G";
	if ((teff >= 5200.0) && (teff <= 5310.0)) {
	    subClass = "8";
	} else if ((teff > 5310.0) && (teff <= 5790.0)) {
	    subClass = "2";
	} else if ((teff > 5790.0) && (teff < 5950.0)) {
	    subClass = "0";
	}
    } else if ((teff >= 5950.0) && (teff < 7300.0)) {
        spectralClass = "F";
	if ((teff >= 5950.0) && (teff <= 6250.0)) {
	    subClass = "8";
	} else if ((teff > 6250.0) && (teff <= 6650.0)) {
	    subClass = "5";
	} else if ((teff > 6650.0) && (teff <= 7050.0)) {
	    subClass = "2";
	} else if ((teff > 7050.0) && (teff < 7300.0)) {
	    subClass = "0";
	}
    } else if ((teff >= 7300.0) && (teff < 9800.0)) {
        spectralClass = "A";
	if ((teff >= 7300.0) && (teff <= 7600.0)) {
	    subClass = "8";
	} else if ((teff > 7600.0) && (teff <= 8190.0)) {
	    subClass = "5";
	} else if ((teff > 8190.0) && (teff <= 9020.0)) {
	    subClass = "2";
	} else if ((teff > 9020.0) && (teff <= 9400.0)) {
	    subClass = "1";
	} else if ((teff > 9400.0) && (teff < 9800.0)) {
	    subClass = "0";
	}
    } else if ((teff >= 9800.0) && (teff < 30000.0)) {
        spectralClass = "B";
	if ((teff >= 9300.0) && (teff <= 10500.0)) {
	    subClass = "9";
	} else if ((teff > 10500.0) && (teff <= 11400.0)) {
	    subClass = "8";
	} else if ((teff > 11400.0) && (teff <= 12500.0)) {
	    subClass = "7";
	} else if ((teff > 12500.0) && (teff <= 13700.0)) {
	    subClass = "6";
	} else if ((teff > 13700.0) && (teff <= 15200.0)) {
	    subClass = "5";
	} else if ((teff > 15200.0) && (teff <= 18800.0)) {
	    subClass = "3";
	} else if ((teff > 18800.0) && (teff <= 20900.0)) {
	    subClass = "2";
	} else if ((teff > 20900.0) && (teff <= 25400.0)) {
	    subClass = "1";
	} else if ((teff > 25400.0) && (teff < 30000.0)) {
	    subClass = "0";
	}
    } else if (teff >= 30000.0) {
        spectralClass = "O";
	if ((teff >= 30000.0) && (teff <= 35800.0)) {
	    subClass = "8";
	} else if ((teff > 35800.0) && (teff <= 37500.0)) {
	    subClass = "7";
	} else if ((teff > 37500.0) && (teff <= 39500.0)) {
	    subClass = "6";
	} else if ((teff > 39500.0) && (teff <= 42000.0)) {
	    subClass = "5"; 
	} 
    }
}
//Determine the spectralClass and subClass of giants and subgiants. lburns
//var luminClass = "III" or luminClass = "IV"
if (((logg >= 1.5) && (logg < 3.0)) || ((logg >= 3.0) && (logg < 4.0))) { 
    if (teff < 3000.0) {
	spectralClass = "L";
	} else if ((teff >= 3000.0) && (teff < 3700.0))  {
	spectralClass = "M";
	if ((teff >= 3000.0) && (teff <= 3330.0)) {
	    subClass = "6";
	} else if ((teff > 3330.0) && (teff <= 3380.0)) {
	    subclass = "5";
	} else if ((teff > 3380.0) && (teff <= 3440.0)) {
	    subClass = "4";
	} else if ((teff > 3440.0) && (teff <= 3480.0)) {
	    subClass = "3";
	} else if ((teff > 3480.0) && (teff <= 3540.0)) {
	    subClass = "2";
	} else if ((teff > 3540.0) && (teff <= 3600.0)) {
	    subClass = "1";
	} else if ((teff > 3600.0) && (teff < 3700.0)) {
	    subClass = "0";
	}
    } else if ((teff >= 3700.0) && (teff < 4700.0)) {
	spectralClass = "K";
	if ((teff >= 3700.0) && (teff <= 3870.0)) {
	    subClass = "7";
	} else if ((teff > 3870.0) && (teff <= 4050.0)) {
	    subClass = "5";
	} else if ((teff > 4050.0) && (teff <= 4150.0)) {
	    subClass = "4";
	} else if ((teff > 4150.0) && (teff <= 4260.0)) {
	    subClass = "3";
	} else if ((teff > 4260.0) && (teff <= 4510.0)) {
	    subClass = "1";
	} else if ((teff > 4510.0) && (teff < 4700.0)) {
	    subClass = "0";
	}
    } else if ((teff >= 4700.0) && (teff < 5500.0)) {
	spectralClass = "G";
	if ((teff >= 4700.0) && (teff <= 4800.0)) {
	    subClass = "8";
	} else if ((teff > 4800.0) && (teff <= 5300.0)) {
	    subClass = "2";
	} else if ((teff > 5300.0) && (teff < 5500.0)) {
	    subClass = "0";
	}
    } else if ((teff >= 5500.0) && (teff < 7500.0)) {
	spectralClass = "F";
	if ((teff >= 5500.0) && (teff <= 6410.0)) {
	    subClass = "5";
	} else if ((teff > 6410.0) && (teff <= 7000.0)) {
	    subClass = "2";
	} else if ((teff > 7000.0) && (teff < 7500.0)) {
	    subClass = "0";
	}
    } else if ((teff >= 7500.0) && (teff < 10300.0)) {
	spectralClass = "A";
	if ((teff >= 7500.0) && (teff <= 7830.0)) {
	    subClass = "8";
	} else if ((teff > 7830.0) && (teff <= 8550.0)) {
	    subClass = "5";
	} else if ((teff > 8550.0) && (teff <= 9460.0)) {
	    subClass = "2";
	} else if ((teff > 9460.0) && (teff <= 9820.0)) {
	    subClass = "1";
	} else if ((teff > 9820.0) && (teff < 10300.0)) {
	    subClass = "0";
	}
    } else if ((teff >= 10300.0) && (teff < 29300.0)) {
	spectralClass = "B";
	if ((teff >= 10300.0) && (teff <= 10900.0)) {
	    subClass = "9";
	} else if ((teff > 10900.0) && (teff <= 11700.0)) {
	    subClass = "8";
	} else if ((teff > 11700.0) && (teff <= 12700.0)) {
	    subClass = "7";
	} else if ((teff > 12700.0) && (teff <= 13800.0)) {
	    subClass = "6";
	} else if ((teff > 13800.0) && (teff <= 15100.0)) {
	    subClass = "5";
	} else if ((teff > 15100.0) && (teff <= 18300.0)) {
	    subClass = "3";
	} else if ((teff > 18300.0) && (teff <= 20200.0)) {
	    subClass = "2";
	} else if ((teff > 20200.0) && (teff <= 24500.0)) {
	    subClass = "1";
	} else if ((teff > 24500.0) && (teff < 29300.0)) {
	    subClass = "0";
	}
    } else if ((teff >= 29300.0) && (teff < 40000.0)) {
	spectralClass = "O";
	if ((teff >= 29300.0) && (teff <= 35000.0)) {
	    subClass = "8";
	} else if ((teff > 35000.0) && (teff <= 36500.0)) {
	    subClass = "7";
	} else if ((teff > 36500.0) && (teff <= 37800.0)) {
	    subClass = "6";
	} else if ((teff > 37800.0) && (teff < 40000.0)) {
	    subClass = "5"; 
	}
    }
} 

//Determine the spectralClass and subClass of supergiants and bright giants. lburns
//var luminClass = "I" or luminClass = "II"
if (((logg >= 0.0) && (logg < 1.0)) || ((logg >= 1.0) && (logg < 1.5))) {
    if (teff < 2700.0) {
	spectralClass = "L";
	} else if ((teff >= 2700.0) && (teff < 3650.0)) {
	spectralClass = "M";
	if ((teff >= 2700.0) && (teff <= 2710.0)) {
	    subClass = "6";
	} else if ((teff > 2710.0) && (teff <= 2880.0)) {
	    subClass = "5";
	} else if ((teff > 2880.0) && (teff <= 3060.0)) {
	    subClass = "4";
	} else if ((teff > 3060.0) && (teff <= 3210.0)) {
	    subClass = "3";
	} else if ((teff > 3210.0) && (teff <= 3370.0)) {
	    subClass = "2";
	} else if ((teff > 3370.0) && (teff <= 3490.0)) {
	    subClass = "1";
	} else if ((teff > 3490.0) && (teff < 3650.0)) {
	    subClass = "0";
	}
    } else if ((teff >= 3650.0) && (teff < 4600.0)) {
	spectralClass = "K"; 
	if ((teff >= 3650.0) && (teff <= 3830.0)) {
	    subClass = "7";
	} else if ((teff > 3830.0) && (teff <= 3990.0)) {
	    subClass = "5";
	} else if ((teff > 3990.0) && (teff <= 4090.0)) {
	    subClass = "4";
	} else if ((teff > 4090.0) && (teff <= 4190.0)) {
	    subClass = "3";
	} else if ((teff > 4190.0) && (teff <= 4430.0)) {
	    subClass = "1";
	} else if ((teff > 4430.0) && (teff < 4600.0)) {
	    subClass = "0";
	}
    } else if ((teff >= 4600.0) && (teff < 5500.0)) {
	spectralClass = "G";
	if ((teff >= 4600.0) && (teff <= 4700.0)) {
	    subClass = "8";
	} else if ((teff > 4700.0) && (teff <= 5190.0)) {
	    subClass = "2";
	} else if ((teff > 5190.0) && (teff < 5500.0)) {
	    subClass = "0";
	}
    } else if ((teff >= 5500.0) && (teff < 7500.0)) {
	spectralClass = "F";
	if ((teff >= 5500.0) && (teff <= 5750.0)) {
	    subClass = "8";
	} else if ((teff > 5750.0) && (teff <= 6370.0)) {
	    subClass = "5";
	} else if ((teff > 6370.0) && (teff <= 7030.0)) {
	    subClass = "2";
	} else if ((teff > 7030.0) && (teff < 7500.0)) {
	    subClass = "0";
	}
    } else if ((teff >= 7500.0) && (teff < 10000.0)) {
	spectralClass = "A";
	if ((teff >= 7500.0) && (teff <= 7910.0)) {
	    subClass = "8";
	} else if ((teff > 7910.0) && (teff <= 8610.0)) {
	    subClass = "5";
	} else if ((teff > 8610.0) && (teff <= 9380.0)) {
	    subClass = "2";
	} else if ((teff > 9380.0) && (teff < 10000.0)) {
	    subClass = "0";
	}
    } else if ((teff >= 10000.0) && (teff < 27000.0)) {
	spectralClass = "B";
	if ((teff >= 10000.0) && (teff <= 10500.0)) {
	    subClass = "9";
	} else if ((teff > 10500.0) && (teff <= 11100.0)) {
	    subClass = "8";
	} else if ((teff > 11100.0) && (teff <= 11800.0)) {
	    subClass = "7";
	} else if ((teff > 11800.0) && (teff <= 12600.0)) {
	    subClass = "6";
	} else if ((teff > 12600.0) && (teff <= 13600.0)) {
	    subClass = "5";
	} else if ((teff > 13600.0) && (teff <= 16000.0)) {
	    subClass = "3";
	} else if ((teff > 16000.0) && (teff <= 17600.0)) {
	    subClass = "2";
	} else if ((teff > 17600.0) && (teff <= 21400.0)) {
	    subClass = "1";
	} else if ((teff > 21400.0) && (teff < 27000.0)) {
	    subClass = "0";
	}
    } else if ((teff >= 27000.0) && (teff < 42000.0)) {
	spectralClass = "O";
	if ((teff >= 27000.0) && (teff <= 34000.0)) {
	    subClass = "8";
	} else if ((teff > 34000.0) && (teff <= 36200.0)) {
	    subClass = "7";
	} else if ((teff > 36200.0) && (teff <= 38500.0)) {
	    subClass = "6";
	} else if ((teff > 38500.0) && (teff < 42000.0)) {
	    subClass = "5";
	}
    } 	     
}

//Determine luminClass based on logg
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
            spectralClass + subClass +  " " + luminClass +
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

//
//  function washer() creates and inserts a panel into the HTML doc 
//   AND erases it by "gray-washing" it upon each re-execution of the script 

        var washer = function(plotRow, plotCol, wColor, areaId, SVGId) {
                                //JB
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
        SVGId.style.position = "absolute";
        SVGId.style.width = panelWidthStr;
        SVGId.style.height = panelHeightStr;
        SVGId.style.opacity = "1.0";
        SVGId.style.backgroundColor = wColor;
        SVGId.style.zIndex = 0;
        areaId.appendChild(SVGId);

//loop through all children of the SVG and remove them
//        while(SVGId.lastChild){
//                SVGId.removeChild(SVGId.lastChild);
//        }

//.empty() rids of all children
                $("#"+SVGId.id).empty();

        areaId.appendChild(SVGId);

        document.body.appendChild(areaId);
                        //JB
        var panelOrigin = [panelX, panelY];

        return panelOrigin;

    };

//function to rid of the coordinate display
function deleteText(SVG){
if(SVG.contains(document.getElementById("subtext"))){
SVG.removeChild(document.getElementById("subtext"));
};

}


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

    //var tuneBandIntens = tuneColor(masterLams, masterIntens, numThetas, numMaster, diskLambda, diskSigma, lamUV, lamIR);
    var gaussFilter = gaussian(masterLams, numMaster, diskLambda, diskSigma, lamUV, lamIR);
    var tuneBandIntens = tuneColor(masterLams, masterIntens, numThetas, numMaster, gaussFilter, lamUV, lamIR);

    //Fourier transform of narrow band image:
    var ft = fourier(numThetas, cosTheta, tuneBandIntens);
    var numK = ft[0].length;

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
    var XBar = function(yVal, minYDataIn, maxYDataIn, barWidthCnvs, barHeightCnvs,xFinesse, color, areaId, SVG) {
                                        //JB
        var yBarPosCnvs = yAxisLength * (yVal - minYDataIn) / (maxYDataIn - minYDataIn);
        //       xTickPos = xTickPos;

        //JB var xBarPosCnvs = xAxisLength * (xVal - minXDataIn) / (maxXDataIn - minXDataIn) ;
        var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yBarPosCnvs;

// Make the y-tick mark, Teff:
                                //JB
        var tickY = document.createElementNS(xmlW3,'polyline');
        tickY.setAttribute('stroke',color);
        //set points the line will follow
        var pointsTY=yAxisXCnvs+","+yShiftCnvs+" "+(yAxisXCnvs + barWidthCnvs)+","+yShiftCnvs+" ";
        tickY.setAttribute('points',(yAxisXCnvs+","+yShiftCnvs+" "+(yAxisXCnvs + barWidthCnvs)+","+yShiftCnvs) + " " );
        //console.log(pointsTY);
        //console.log(typeof(pointsTY));
    tickY.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
        SVG.appendChild(tickY);
                                //JB
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
            yFinesse, color, areaId, SVG) {
                                        //JB
        var xBarPosCnvs = xAxisLength * (xVal - minXDataIn) / (maxXDataIn - minXDataIn);
        var xShiftCnvs = xAxisXCnvs + xBarPosCnvs;
        var yBarPosCnvs = yAxisYCnvs + yFinesse;

// Make the x-tick mark, Teff:
                                        //JB
        var tickX = document.createElementNS(xmlW3,'polyline');
        tickX.setAttribute('stroke',color);
//set points the line will follow
        tickX.setAttribute('points',(xShiftCnvs+","+yBarPosCnvs+" "+xShiftCnvs+","+(yBarPosCnvs + barHeightCnvs)));
if(SVG==SVGTen){
tickX.setAttribute('id','plineP10');
}
        tickX.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
        SVG.appendChild(tickX);
                                        //JB
        return xShiftCnvs;
    };

//return the x position without creating a bar
    var YBarXVal = function(xVal, minXDataIn, maxXDataIn, barWidthCnvs, barHeightCnvs,yFinesse, color, areaId, SVG) {
                                        //JB
        var xBarPosCnvs = xAxisLength * (xVal - minXDataIn) / (maxXDataIn - minXDataIn);
        var xShiftCnvs = xAxisXCnvs + xBarPosCnvs;
        var yBarPosCnvs = yAxisYCnvs + yFinesse;

// Make the x-tick mark, Teff:
        return xShiftCnvs;
    };
                                        //JB



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
            areaId, SVG) {
                                //JB
        var axisParams = [];
        axisParams.length = 8;
        // Variables to handle normalization and rounding:
        var numParts = [];
        numParts.length = 2;

        //axisParams[5] = xLowerYOffset;

                                //JB
        var XAx = document.createElementNS(xmlW3,'polyline');
        XAx.setAttribute('stroke',lineColor);
//set points the line will follow
        XAx.setAttribute('points',xAxisXCnvs+","+xAxisYCnvs+" "+(xAxisXCnvs+xAxisLength)+","+xAxisYCnvs)
//      XAx.setAttribute('x0',xAxisXCnvs);
//        XAx.setAttribute('x1',xAxisXCnvs+xAxisLength,);
//        XAx.setAttribute('y0',xAxisYCnvs);
//        XAx.setAttribute('y1',xAxisYCnvs);
        XAx.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
        SVG.appendChild(XAx);
                                //JB
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
            deltaXData = 500.0;
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

                                //JB
        var Xt = document.createElementNS(xmlW3,'polyline');
        Xt.setAttribute('stroke',lineColor);
//set points the line will follow
        Xt.setAttribute('points',xShiftCnvs+","+(xAxisYCnvs + xTickYOffset)+" "+xShiftCnvs+","+(xAxisYCnvs + xTickYOffset + tickLength));
//      Xt.setAttribute('x0',xShiftCnvs);
//      Xt.setAttribute('x1',xShiftCnvs);
//      Xt.setAttribute('y0',xAxisYCnvs + xTickYOffset);
//      Xt.setAttribute('y1',xAxisYCnvs + xTickYOffset + tickLength);
    Xt.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
        SVG.appendChild(Xt);
                                //JB

            //Make the tick label, Teff:
                                //JB
            var text2 = document.createElementNS(xmlW3,'text');
            text2.setAttribute('x', xShiftCnvs);
            text2.setAttribute('y',  xAxisYCnvs + xValYOffset);
            text2.setAttribute('id',('text'+(i).toString()));
            text2.setAttribute('style', "font-style:normal;font-size:8px;");
            text2.textContent=xTickValStr;
            text2.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            SVG.appendChild(text2);

                                //JB

        }  // end x-tickmark loop


// Add name of x-axis:
//Axis label still needs to be html so we can use mark-up
        xAxisNameX = panelX + xAxisNameOffsetX;
        xAxisNameY = panelY + xAxisNameOffsetY;
        txtPrint("<span style='font-size:small'>" + xAxisName + "</span>",
                xAxisNameOffsetX, xAxisNameOffsetY, lineColor, areaId);

        return axisParams;

    };


    //
    //
    //
    //  ***** YAxis()
    //
    //
    //

                        var pointsYA = "";
    var YAxis = function(panelX, panelY,minYDataIn, maxYDataIn, yAxisName, fineness,areaId, SVG) {
                        //JB
        var axisParams = [];
        axisParams.length = 8;
        // Variables to handle normalization and rounding:
        var numParts = [];
        numParts.length = 2;

        //axisParams[5] = xLowerYOffset;
        // Create the LEFT y-axis element and set its style attributes:
                                //JB
        var YAx = document.createElementNS(xmlW3,'polyline');
        YAx.setAttribute('stroke',lineColor);
//set the points that the line will follow
        pointsYA = yAxisXCnvs+","+yAxisYCnvs+" "+yAxisXCnvs+","+(yAxisYCnvs+yAxisLength);
        YAx.setAttribute('points',pointsYA);
        //console.log(pointsYA);
        //console.log(typeof(pointsYA));

    YAx.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
        SVG.appendChild(YAx);
                                //JB
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
        //deltaYData = mantissa * Math.pow(10.0, numParts[1]);
        var deltaYPxl = panelHeight / (numYTicks - 1);
        var deltaYPxlCnvs = yAxisLength / (numYTicks - 1);
        axisParams[1] = rangeYData2;
        axisParams[2] = deltaYData;
        axisParams[3] = deltaYPxl;
        axisParams[6] = minYData2;
        axisParams[7] = maxYData2;
        //
        SVG.setAttribute('fill',lineColor);
        var ii;
        var pointsYt="";
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
                                //JB
        var Yt = document.createElementNS(xmlW3,'polyline');
        Yt.setAttribute('id',"Yt"+i);
        Yt.setAttribute('stroke',lineColor);
//set the points that the line will follow
        Yt.setAttribute('points', ((yAxisXCnvs + yTickXOffset)+","+yShiftCnvs+" "+(yAxisXCnvs + yTickXOffset + tickLength)+","+yShiftCnvs));
//        Yt.setAttribute('x0',yAxisXCnvs+yTickXOffset);
//        Yt.setAttribute('x1',yAxisXCnvs+yTickXOffset+tickLength);
//        Yt.setAttribute('y0',yShiftCnvs);
//        Yt.setAttribute('y1',yShiftCnvs);
    Yt.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
        SVG.appendChild(Yt);
                                //JB
            //Make the y-tick label:
            var text3 = document.createElementNS(xmlW3,'text');
            //text3.setAttribute('id',text3);
            text3.setAttribute('x',yAxisXCnvs + yValXOffset);
            text3.setAttribute('y',yShiftCnvs);
            text3.setAttribute('id','text'+(i+4));
            text3.setAttribute('style', "front-style:normal;font-size:8px;");
            text3.textContent=yTickValStr;
            text3.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            SVG.appendChild(text3);

        }  // end y-tickmark loop, j

// Add name of LOWER y-axis:

//Axis label still need to be html so we can use mark-up
        yAxisNameX = panelX + yAxisNameOffsetX;
        yAxisNameY = panelY + yAxisNameOffsetY;


//    txtPrint("<span style='font-size:x-small'>" + yAxisName + "</span>",         yAxisNameOffsetX, yAxisNameOffsetY, lineColor, areaId);
    txtPrintYAx("<span style='font-size:x-small'>" + yAxisName + "</span>",         yAxisNameOffsetX, yAxisNameOffsetY, lineColor, areaId);

        return axisParams;

    };


    //   var testVal = -1.26832e7;
//

    var xFinesse = 0.0; //default initialization
    var yFinesse = 0.0; //default initialization

// PLOT GRID PLAN as of 20 Jul 2016:
//    Cell entries:  Plot number Plot contents 
//
//  Col           0                 |  1                |  2
//
//  Row: 0        7 Whte Lght Img   |  10 Spctrm Img    |  11 Life Zn
//
//       1       12 Gauss Filt      |   5 SED           |   9 HRD          
//
//       2        6 Spctrl line     |  17 Four trnsfrm  |   2 T_kin(tau)
//
//       3        8 Grtrn diag      |   4 Limb darkng   |   3 P(tau)
//
//       4       16 Ioniz Eq        |  15 kap(lambda)   |  14 kap(tau) 
//      
//
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

//background color needs to be finessed so that white-ish stars will stand out:
       if (teff > 6000.0){
  //hotter white or blue-white star - darken the background (default background in #F0F0F0
           wDiskColor = "#808080";  
       } else {
           wDiskColor = wDefaultColor;
       }
				//JB
        var panelOrigin = washer(plotRow, plotCol, wDiskColor, newPlotSevenId, SVGSeven);
				//JB
	panelX = panelOrigin[0];
        panelY = panelOrigin[1];
				//JB
	SVGSeven.setAttribute('fill',wDiskColor);

        var thet1, thet2;
        var thet3;

        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Limb_darkening' target='_blank'>White light disk</a></span> <br />\n\
     <span style='font-size:small'>(Logarithmic radius) </span>",
                titleOffsetX, titleOffsetY, lineColor, newPlotSevenId);
            txtPrint("<span style='font-size:normal; color:black'><em>&#952</em> = </span>",
                150 + titleOffsetX, titleOffsetY, lineColor, newPlotSevenId);
                                //JB
            var yCenterCnvs = panelHeight / 2; 
            var xCenterCnvs = panelWidth / 2;
				//JB

	var radius = Math.ceil(radiusPx * Math.sin(Math.acos(cosTheta[1][10])));

                        
				//JB
//console.log(numThetas);
				
// Adjust position to center star:
// Radius is really the *diameter* of the symbol

        //  Loop over limb darkening sub-disks - largest to smallest
         for (var i = numThetas - 1; i >= 1; i--) {
//	for (var i = numThetas - 1; i <= 1; i++) {
	
            ii = 1.0 * i;

            // LTE Eddington-Barbier limb darkening: I(Tau=0, cos(theta)=t) = B(T(Tau=t))
            var cosFctr = cosTheta[1][i];

            var cosFctrNext = cosTheta[1][i-1];
			
            var radiusPxICnvs = Math.ceil(radiusPx * Math.sin(Math.acos(cosFctr)));
            var radiusPxICnvsNext = Math.ceil(radiusPx * Math.sin(Math.acos(cosFctrNext)));

            rrI = Math.ceil(brightScale * (bandIntens[4][i] / bvr) / rgbVega[0]); // / vegaBVR[2]);
            ggI = Math.ceil(brightScale * (bandIntens[3][i] / bvr) / rgbVega[1]); // / vegaBVR[1]);
            bbI = Math.ceil(brightScale * (bandIntens[2][i] / bvr) / rgbVega[2]); // / vegaBVR[0]);
            var rrINext = Math.ceil(brightScale * (bandIntens[4][i-1] / bvr) / rgbVega[0]); // / vegaBVR[2]);
            var ggINext = Math.ceil(brightScale * (bandIntens[3][i-1] / bvr) / rgbVega[1]); // / vegaBVR[1]);
            var bbINext = Math.ceil(brightScale * (bandIntens[2][i-1] / bvr) / rgbVega[2]); // / vegaBVR[0]);

            var RGBHex = colHex(rrI, ggI, bbI);
            var RGBHexNext = colHex(rrINext, ggINext, bbINext);
 				//JB
 				

//	if((radiusPxICnvs==radiusPxICnvsNext)){ radiusPxICnvsNext = radiusPxICnvs - 0.9*i/3;}

//create circle for each theta
        var circ = document.createElementNS(xmlW3,'circle');
        circ.setAttribute('cx',xCenterCnvs);
        circ.setAttribute('cy',yCenterCnvs);
        circ.setAttribute('r',radiusPxICnvs);
        circ.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);

//create gradient for each circle
	var grd = document.createElementNS(xmlW3,'radialGradient');
	grd.setAttribute('id','grd'+i);
        grd.setAttribute('cx',.5);
        grd.setAttribute('cy',.5);
        grd.setAttribute('r',.5);
        grd.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);			

       // console.log(radiusPxICnvsNext/radius);
	
        var gradN1 = document.createElementNS(xmlW3,'stop');
        gradN1.setAttribute('offset',1);
        gradN1.setAttribute('stop-color',RGBHex);
	gradN1.setAttribute('stop-opacity',1);

        // console.log(radiusPxICnvsNext/radiusPxICnvs);

        var gradN2 = document.createElementNS(xmlW3,'stop');
        gradN2.setAttribute('offset',radiusPxICnvsNext/radiusPxICnvs)//"0%");
        gradN2.setAttribute('stop-color',RGBHexNext);
	gradN2.setAttribute('stop-opacity',1);

	gradN1.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
        gradN2.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);

        SVGSeven.appendChild(grd);
        grd.appendChild(gradN2);
        grd.appendChild(gradN1);
       
 SVGSeven.appendChild(grd);

 circ.setAttribute('fill',"url(#grd"+i+")");

 SVGSeven.appendChild(circ);
       
 				//
 				//JB
            //
            //Angle indicators
            if ((i % 2) === 0) {
                thet1 = 180.0 * Math.acos(cosTheta[1][i]) / Math.PI;
                thet2 = thet1.toPrecision(2);
                thet3 = thet2.toString(10);
				//JB
                txtPrint("<span style='font-size:small; background-color:#888888'>" + thet3 + "</span>",
                        150 + titleOffsetX + (i + 2) * 10, titleOffsetY, RGBHex, newPlotSevenId);

				//JB    

	}
//
        }
//	document.body.appendChild(SVGSeven);

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
				//JB
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, newPlotTwelveId, SVGTwelve);
				
				//JB
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
				//JB
	SVGTwelve.setAttribute('fill',wDefaultColor);
				//JB
        // Add title annotation:

        //var titleYPos = xLowerYOffset - 1.15 * yRange;
        //var titleXPos = 1.02 * xOffset;

        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
					//JB
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Limb_darkening' target='_blank'>Gaussian filter</a></span><span style='font-size:small'> &#955 = " + diskLambda + " nm</span> </br>\n\
     <span style='font-size:small'>(Logarithmic radius) </span>",
                titleOffsetX, titleOffsetY + 20, lineColor, newPlotTwelveId);
        txtPrint("<span style='font-size:normal; color:black'><em>&#952</em> = </span>",
                220 + titleOffsetX, titleOffsetY + 20, lineColor, newPlotTwelveId);
        var ilLam0 = lamPoint(numMaster, masterLams, 1.0e-7 * diskLambda);
        var lambdanm = masterLams[ilLam0] * 1.0e7; //cm to nm
        //console.log("PLOT TWELVE: ilLam0=" + ilLam0 + " lambdanm " + lambdanm);
 
					//JB
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
				//JB
//create circle for each theta
        var circ = document.createElementNS(xmlW3,'circle');
        circ.setAttribute('cx',xCenterCnvs);
        circ.setAttribute('cy',yCenterCnvs);
        circ.setAttribute('r',radiusPxICnvs);
        circ.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);

//create gradient for each circle
	var grd = document.createElementNS(xmlW3,'radialGradient');
	grd.setAttribute('id','grd'+i+20);
        grd.setAttribute('cx',.5);
        grd.setAttribute('cy',.5);
        grd.setAttribute('r',.5);
        grd.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);			

       // console.log(radiusPxICnvsNext/radius);
	
        var gradN1 = document.createElementNS(xmlW3,'stop');
        gradN1.setAttribute('offset',1);
        gradN1.setAttribute('stop-color',RGBHex);
	gradN1.setAttribute('stop-opacity',1);

       //  console.log(radiusPxICnvsNext/radiusPxICnvs);

        var gradN2 = document.createElementNS(xmlW3,'stop');
        gradN2.setAttribute('offset',radiusPxICnvsNext/radiusPxICnvs)//"0%");
        gradN2.setAttribute('stop-color',RGBHexNext);
	gradN2.setAttribute('stop-opacity',1);

	gradN1.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
        gradN2.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);

        SVGTwelve.appendChild(grd);
        grd.appendChild(gradN2);
        grd.appendChild(gradN1);
       
 
 SVGTwelve.appendChild(grd);

 circ.setAttribute('fill',"url(#grd"+i+20+")");

 SVGTwelve.appendChild(circ);
       
				//JB
            //
            //Angle indicators
            if ((i % 2) === 0) {
                thet1 = 180.0 * Math.acos(cosTheta[1][i]) / Math.PI;
                thet2 = thet1.toPrecision(2);
                thet3 = thet2.toString(10);
					//JB
                txtPrint("<span style='font-size:small; background-color:#888888'>" + thet3 + "</span>",
                       220 + titleOffsetX + (i + 2) * 10, titleOffsetY + 20, RGBHex, newPlotTwelveId);

					//JB
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
        if($("[name='Teff']").val() >= 7000){
         minXData = 360.0;
        }
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
        var xAxisName = "<em>&#955</em> (nm)";

        
        var fineness = "normal";
				//JB
	        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, newPlotTenId, SVGTen);
				//JB

        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
				//JB
//	SVGTen.setAttribute('fill',wDefaultColor);
				//JB
				//JB
        var xAxisParams = XAxis(panelX, panelY, minXData, maxXData, xAxisName, fineness, newPlotTenId, SVGTen);

				//JB
        //xOffset = xAxisParams[0];
        //yOffset = xAxisParams[4];
        var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        minXData = xAxisParams[6]; //updated value
        maxXData = xAxisParams[7]; //updated value
        //

        // var yAxisParams = YAxis(plotRow, plotCol,
        //        minYData, maxYData, yAxisName,
        //        plotTenId);

        //var zRange = 255.0;  //16-bit each for RGB (48-bit colour??)

        //var rangeXData = xAxisParams[1];
        //var rangeYData = yAxisParams[1];
        //var deltaYData = yAxisParams[2];
        //var deltaYPxl = yAxisParams[3];
        //var xLowerYOffset = xAxisParams[5];
        //minXData = xAxisParams[6];  //updated value
        //minYData = yAxisParams[6];  //updated value


        //txtPrint(" ", legendXPos, legendYPos + 10, zeroInt, zeroInt, zeroInt, plotTenId);
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
					//JB
        txtPrint("<span style='font-size:normal; color:blue'><a href='https://en.wikipedia.org/wiki/Visible_spectrum' target='_blank'>\n\
     Visual spectrum</a></span>",
                titleOffsetX, titleOffsetY, lineColor, newPlotTenId);
					//JB
     var TiOString = "Off";
     if (ifTiO == 1){
        TiOString = "On";
     }
					//JB
     txtPrint("TiO bands: " + TiOString, titleOffsetX + 10, titleOffsetY+35, lineColor, newPlotTenId);
					//JB
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

                              //JB

//create a single rectangle to hold the gradient of the spectrum
//create said gradient
        var grd = document.createElementNS(xmlW3,'linearGradient');
        var rect = document.createElementNS(xmlW3,'rect');

        grd.setAttribute('id','grd');
        var grdId = document.getElementById(grd);

        rect.setAttribute('x',0);
        rect.setAttribute('y',125);
        rect.setAttribute('height',75);
        rect.setAttribute('id','rect');
        var rectId = document.getElementById('rect');
        rect.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);

        SVGTen.appendChild(rect);


        grd.setAttribute('x1',0);
        grd.setAttribute('x2',"1");
        grd.setAttribute('y1',0);
        grd.setAttribute('y2',0);
        grd.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);




/*create text box that displays the coordinates and set the coordinates 
 * (x position in nm)  equal to the text content
*/
      var textP10 = document.createElementNS(xmlW3,'text');
//    textP10.setAttribute('id',"textP10");
      textP10.setAttribute('x',275);
        textP10.setAttribute('y',275);
        textP10.setAttribute('font-size',"10");
      textP10.setAttribute('id',"subtext");
      textP10.textContent=("(?[nm])");
      textP10.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
      SVGTen.appendChild(textP10);



//function that sets the text content to the x postion (in nm) on the spectrum
      function convertTextP10(X){
      
      //var Y = y;
      if(X!=0){

      textP10.textContent=("("+X.toFixed(4).toString()+" [nm])");
      //console.log(text.textContent)
      SVGTen.appendChild(textP10);
      }else{

        textP10.textContent="(?[nm])";
        SVGTen.appendChild(textP10);
      
      }
              }


//variables specifically for plot 10
var xMinP10 = minXData;
var xMaxP10 = maxXData;
var yMinP10 = minYData;
var yMaxP10 = maxYData;
var scaleP10 = (xMaxP10-xMinP10)/xAxisLength; 

//create event listeners that display the x position (in nm) in the text box
 rect.addEventListener("mousemove",function(){convertTextP10(xMinP10+scaleP10*(event.offsetX-xAxisXCnvs));},false);
 rect.addEventListener("mouseout",function(){convertTextP10(0);},false);
                              
                              
////variable to get the text input box's value for the filter                   
//        var filter = document.getElementById('diskLam');

//function to set filter input box. Is called upon click
      function setP10 (XV){
//set x value in nm of the filter bar to diskLam, the input box
              filter.value = XV.toFixed(4);
                      
}

////set x position of the filter label  
//      t.style.marginLeft=xPosition;

                              
                              //JB

//variables needed in the loop, mostly for scaling/converting to nm
var firstNm = 0;//masterLams[ilLam0-1]*1.0e7;
var offset = 0;//xAxisXCnvs +  xAxisLength * (firstNm*1.25 - minXData) / (maxXData - minXData);
//var max = 0;//.75*(lastNm-firstNm);
var lastNm = masterLams[ilLam1]*1.0e7;
var count = 0;

                              //JB
        for (var i = ilLam0 - 1; i < ilLam1+1; i++) {

            var nextLambdanm = masterLams[i] * 1.0e7; //cm to nm

            xBarShift0 = xAxisLength * (lambdanm - minXData) / (maxXData - minXData);
            xBarShift1 = xAxisLength * (nextLambdanm - minXData) / (maxXData - minXData);
            barWidth = xBarShift1 - xBarShift0; //in device pixels

if (barWidth > 0.5) {
count ++;     
                barWidth = barWidth + 1.0;
                zLevel = ((masterFlux[0][i] / norm) - minZData) / rangeZData;
            var nextRGBHex = lambdaToRGB(lambdanm, zLevel);

        var xTickPosCnvs = xAxisLength * (lambdanm - minXData) / (maxXData - minXData);
        var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

                              //JB
/*for the first iteration, make the offest equal to its xShift 
 *(for the rectangle)
*/
      if(count==1){
              firstNm = lambdanm;
              offset = xShiftCnvs;
      }

                              //JB


//create TWO stops per loop and add the to the gradient


/*the .75 is equivilant to ((maxXData-minXData)/xAxisLength),
 * but for some reason this caused an issue, therefore the .75 was hard set.
 * ALSO, max was needed to accurately determine the where the offset 
 * started/ended, but it couldn't be set until the last interation of the loop,
 * therefore it is also hard set.
*/

        var gradN = document.createElementNS(xmlW3,'stop');
        gradN.setAttribute('offset',((xShiftCnvs-offset)/(.75*(lastNm-firstNm))));
        gradN.setAttribute('stop-color',RGBHex);
        gradN.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);

        var gradN2 = document.createElementNS(xmlW3,'stop');
        gradN2.setAttribute('offset',((xShiftCnvs+barWidth-offset)/(.75*(lastNm-firstNm))));
        gradN2.setAttribute('stop-color',nextRGBHex);
        gradN2.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);

        grd.appendChild(gradN);
        grd.appendChild(gradN2);
        SVGTen.appendChild(grd);

                      //JB
//
/*THIS CODE IS USED TO CREATE SEPERATE RECTANGLES WITH THEIR OWN GRADIENTS 
 * (ABOVE HAS MANY STOPS AND A SINGLE GRADIENT)
*/
//
//!function I(ii){
//        var   trueCoord = lastNm;
//}(i);
//                lambdanm = nextLambdanm;
//                RGBHex = nextRGBHex;
//            }  //barWidth condition
//        }  // i loop (wavelength)

                              //JB

                //console.log("lambdanm " + lambdanm + " nextLambdanm " + nextLambdanm + " xShiftDum " + xShiftDum + " barWidth " + barWidth);





                lambdanm = nextLambdanm;
                RGBHex = nextRGBHex;
            }  //barWidth condition
        }  // i loop (wavelength)

/*lastly, fill the rect element with the appropriate gradient and set the 
 *  *starting and stopping postions of the rect on the SVG
 *  */
//console.log(offset);
        rect.setAttribute('x',offset);
        rect.setAttribute('width',xShiftCnvs-offset);
        rect.setAttribute('fill',"url(#grd)");
        SVGTen.appendChild(rect);


//Spectral line labels and pointers:
        barWidth = 1.0;
        barHeight = 20; //initialize
        RGBHex = "#000000"; //black
        //
        var iCount = 0;
        for (var i = 0; i < numLines; i++) {

            if ((iCount % 4) === 0) {
                yPos = thisYPos - 25;
                barHeight = 20;
            } else if ((iCount % 4) === 1) {
                yPos = thisYPos + 85;
                barHeight = 20;
            } else if ((iCount % 4) === 2) {
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
            //lamLblStr = lamLblNum.toString(10);
            //lamLbl = "<span style='font-size: xx-small'>" + lamLblStr + "</span>";
            lamLbl = "<span style='font-size: xx-small'>" + listLamLbl[i] + "</span>";

                                      //JB
            if (listLam0[i].toPrecision(4)<380){
            //  xPos = 25;
            //  yPos = 100 + 10*i;
      //var nmLbl = "<span style='font-size: xx-small'>  (" + lamLblNum + "[nm])</span>";       
        //  txtPrintYAx(nameLbl , xPos, yPos, RGBHex, newPlotTenId);
         // txtPrintYAx(nmLbl , xPos+25, yPos, RGBHex, newPlotTenId);
              }else{

          txtPrintYAx(nameLbl , xPos, yPos, RGBHex, newPlotTenId);
          txtPrintYAx(lamLbl, xPos, yPos + 10, RGBHex, newPlotTenId);
              }
          
                                      //JB

            //Make the tick label, Teff:

            if (listName[i] != " "){
               iCount++;
            }

        }

//Label TiO band origins:
//Set up for molecules with JOLA bands:
   var jolaTeff = 5000.0;
   var numJola = 2; //for now
   var jolaSpecies = [];
   jolaSpecies.length = numJola; // molecule name
   var jolaSystem = []
   jolaSystem.length = numJola; //band system
   var jolaLabel = []
   jolaLabel.length = numJola; //band system

   jolaSpecies[0] = "TiO"; // molecule name
   jolaSystem[0] = "TiO_C3Delta_X3Delta"; //band system //DeltaLambda=0
   jolaLabel[0] = "TiO C<sup>3</sup>&#916-X<sup>3</sup>&#916"; //band system //DeltaLambda=0
   jolaSpecies[1] = "TiO"; // molecule name
   jolaSystem[1] = "TiO_c1Phi_a1Delta"; //band system //DeltaLambda=1
   jolaLabel[1] = "TiO c<sup>1</sup>&#934-a<sup>1</sup>&#916"; //band system //DeltaLambda=1
   //jolaSpecies[2] = "TiO"; // molecule name
   //jolaSystem[2] = "TiO_A3Phi_X3Delta"; //band system //DeltaLambda=0
   //jolaLabel[2] = "TiO A<sup>3</sup>&#934_X<sup>3</sup>&#934"; //band system //DeltaLambda=0
   RGBHex = colHex(50 , 50, 255);
   if (ifTiO == 1){
   if (teff <= jolaTeff){

        for (var i = 0; i < numJola; i++) {

            if ((i % 4) === 0) {
                yPos = thisYPos - 5;
                barHeight = 30;
                barFinesse = 60;
            } else if ((i % 4) === 1) {
                yPos = thisYPos - 15;
                barHeight = 10;
                barFinesse = 80;
            } else if ((i % 4) === 2) {
                yPos = thisYPos - 25;
                barHeight = 30;
                barFinesse = 60;
            } else {
                yPos = thisYPos + 35;
                barHeight = 10;
                barFinesse = 80;
            }

            var jolaOmega0 = getOrigin(jolaSystem[i]);
            var lambda0 = 1.0e7 / jolaOmega0;
            //console.log("lambda0 " + lambda0);
            xPos = xAxisLength * (lambda0 - minXData) / (maxXData - minXData);
            xPos = xPos - 5; // finesse
            //xPos = xAxisXCnvs + xPos - 5; // finesse

            nameLbl = "<span style='font-size: xx-small'>" + jolaLabel[i] + "</span>";
            //lamLblNum = listLams[i].toPrecision(6);
            //lamLblStr = lamLblNum.toString(10);
            //lamLbl = "<span style='font-size: xx-small'>" + lamLblStr + "</span>";
            //RGBHex = colHex(r255, g255, b255);
					//JB

            txtPrint(nameLbl, xPos + xAxisXCnvs, (yPos - 10), RGBHex, newPlotTenId);

					//JB
            //txtPrint(nameLbl, xPos, yPos, RGBHex, plotTenId);
            //txtPrint(lamLbl, xPos + xAxisXCnvs, yPos, RGBHex, plotTenId);
            //xShiftDum = YBar(lambda0, minXData, maxXData, thisXAxisLength, barWidth, barHeight,
            //        barFinesse, RGBHex, plotTenId, cnvsTenCtx);
        }
     } //jolaTeff condition
   } // ifTiO condition


           //monochromatic disk lambda
            var barFinesse = yAxisYCnvs;
            barHeight = 108;
            barWidth = 2;
            RGBHex = "#FF0000";

                                      //JB

/*variables needed to create the filter bar on the SVG 
 * (need to be different form the variables already declared
*/
var barFinesseFilter = yAxisYCnvs;
var barHeightFilter = 108;
var barWidthFilter = 2;
var RGBHexFilter = "#FF0000";
var barYStart = 110;
var barYEnd = 218;
var xPosition = "225px";//((filter.value/scaleP10)-xAxisXCnvs).toString();

/*function to change the points/positon of the filter text (p element) and
 *  the filter bar (polyline created onLoad and initialized based on a 500nm filter) 
*/
function animateLine(line){

line.setAttribute('points', event.offsetX.toFixed(4) + "," + barYStart + " " + event.offsetX.toFixed(4) + "," + barYEnd);
//console.log(event.offsetX.toFixed(4));

t.style.marginLeft=((event.offsetX).toString())+"px";

xPosition = (event.offsetX).toString()+"px";

//console.log(xPosition);

newPlotTenId.appendChild(t);

//SVG10.appendChild(rect);
}

                                      //JB

            if ( (diskLambda > minXData) && (diskLambda < maxXData) ){

                 xShiftDum = YBar(diskLambda, minXData, maxXData, barWidth, barHeight, yAxisYCnvs-60, RGBHex, newPlotTenId, SVGTen);
//console.log(rectId);


//variable to get the text input box's value for the filter                   
        var filter = document.getElementById('diskLam');

//create a p element the display the word Filter above the filter line
      var t = document.createElement("p");
      t.style.position="absolute";
      t.style.display="block";
      t.style.width="750px";
      t.style.marginTop=yAxisYCnvs.toString()+"px";   
      t.style.color="red";
 //set the x position of the filter label                             
      t.style.marginLeft=YBarXVal(diskLambda, minXData, maxXData, barWidth, barHeight, yAxisYCnvs-60, RGBHex, newPlotTenId, SVGTen).toString()+"px";
      t.innerHTML="<span style='font-size:xx-small'>Filter</span>";
      newPlotTenId.appendChild(t);                            
      document.body.appendChild(newPlotTenId);
//console.log(YBarXVal(diskLambda, minXData, maxXData, barWidth, barHeight, yAxisYCnvs-60, RGBHex, newPlotTenId, SVGTen));

                                      //JB

              } else if (diskLambda>maxXData){
                              //JB

                 xShiftDum = YBar(680, minXData, maxXData, barWidth, barHeight, yAxisYCnvs-60, RGBHex, newPlotTenId, SVGTen);
//variable to get the text input box's value for the filter                   
        var filter = document.getElementById('diskLam');

//create a p element the display the word Filter above the filter line
      var t = document.createElement("p");
      t.style.position="absolute";
      t.style.display="block";
      t.style.width="750px";
      t.style.marginTop=yAxisYCnvs.toString()+"px";   
      t.style.color="red";
 //set the x position of the filter label                             
      t.style.marginLeft=YBarXVal(680, minXData, maxXData, barWidth, barHeight, yAxisYCnvs-60, RGBHex, newPlotTenId, SVGTen).toString()+"px";
      t.innerHTML="<span style='font-size:xx-small'>Filter</span>";
      newPlotTenId.appendChild(t);                            
      document.body.appendChild(newPlotTenId);
console.log(YBarXVal(680, minXData, maxXData, barWidth, barHeight, yAxisYCnvs-60, RGBHex, newPlotTenId, SVGTen));


      } else {
                              //JB

                 xShiftDum = YBar(minXData, minXData, maxXData, barWidth, barHeight, yAxisYCnvs-60, RGBHex, newPlotTenId, SVGTen);
//variable to get the text input box's value for the filter                   
        var filter = document.getElementById('diskLam');

//create a p element the display the word Filter above the filter line
      var t = document.createElement("p");
      t.style.position="absolute";
      t.style.display="block";
      t.style.width="750px";
      t.style.marginTop=yAxisYCnvs.toString()+"px";   
      t.style.color="red";
 //set the x position of the filter label                             
      t.style.marginLeft=YBarXVal(minXData, minXData, maxXData, barWidth, barHeight, yAxisYCnvs-60, RGBHex, newPlotTenId, SVGTen).toString()+"px";
      t.innerHTML="<span style='font-size:xx-small'>Filter</span>";
      newPlotTenId.appendChild(t);                            
      document.body.appendChild(newPlotTenId);
console.log(YBarXVal(minXData, minXData, maxXData, barWidth, barHeight, yAxisYCnvs-60, RGBHex, newPlotTenId, SVGTen));


              }

                                      //JB

/*Take the line created with YBar (has a given Id) and add an event listener
 *  to the rectangle that changes the postition of the line and also sets the
 *  filter input text box.
*/
var lineIn = document.getElementById("plineP10");
//console.log(lineIn);
 rect.addEventListener("click",function(){setP10(xMinP10+scaleP10*(event.offsetX-xAxisXCnvs));animateLine(lineIn);},false);
                              //JB
////a header for all lines with wavelengths less than 360 nm
//          txtPrint("<span style='font-size:x-small'> <u>Lines with &#955</u> <sub>0</sub> <u><= 380[nm]</u></span>" , 15, 85, "black", newPlotTenId);
//                              //JB



    } //end PLOT TEN


				
    //
    //
    //  *****   PLOT NINE / PLOT 9
    //
    //
    // Plot Nine: HRDiagram

    if (ifLineOnly === false) {

        var plotRow = 1;
        var plotCol = 2;

//background color needs to be finessed so that white-ish stars will stand out:
       if (teff > 6000.0){
  //hotter white or blue-white star - darken the background (default background in #F0F0F0
           wDiskColor = "#808080";  
       } else {
           wDiskColor = wDefaultColor;
       }
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
				//JB
       var panelOrigin = washer(plotRow, plotCol, wDiskColor, newPlotNineId, SVGNine);

				//JB
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];

				//JB
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                newPlotNineId, SVGNine);

        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName, fineness,
                newPlotNineId, SVGNine);
				//JB
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
				//JB
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://www.ap.smu.ca/~ishort/hrdtest3.html' target='_blank'>H-R Diagram</a></span>",
                titleOffsetX, titleOffsetY, lineColor, newPlotNineId);
				//JB
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


                              //JB
                              //
//create text box that displays the coordinates (in units of the x and y axes) and set the coordinates equal to the text content
      var textP9 = document.createElementNS(xmlW3,'text');
//    textP9.setAttribute('id',"textP9");
      textP9.setAttribute('x',180);
        textP9.setAttribute('y',325);
        textP9.setAttribute('font-size',"10");
      textP9.textContent="(?,?)";
      textP9.setAttribute('id',"subtext");
      textP9.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
      SVGNine.appendChild(textP9);

//function that sets the text content to the x and y positions (in the graph's units)
      function convertTextP9(X,Y){
      //var X = x;
      //var Y = y;
      if(X!=0){

      textP9.textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      //console.log(text.textContent)
      SVGNine.appendChild(textP9);
      //console.log(text.textContent);
      }else{

        textP9.textContent="(?,?)";
        SVGNine.appendChild(textP9);
      
      }
              }

      function check(x,y){
      console.log(x+","+y);
              }
                              //
                              //
                              //JB
//function to set dials. Is called upon click.
      function set (XV,YV){
//convert the x value into units of Kelvin and set
              var HRDX = Math.pow(10,XV);
              var XStr = String(HRDX);
              settingsId[0].value=HRDX;
              $("#Teff").roundSlider("setValue",HRDX);
              
              var logSunG = 4.44;
              var teffSun = 5777;
              var massIn = document.getElementsByName("starMass")[0];
              var radiusCal = (.5)*logTen((Math.pow(10,YV))*(Math.pow(teffSun/HRDX,4)));
//use y value and mass to determine log(g) and set the surface gravity dial
              var logMassIn = logTen(massIn.value);
              var HRDY = logMassIn-radiusCal+logSunG;
                var YStr = String(HRDY);
                settingsId[1].value=HRDY;
                $("#logg").roundSlider("setValue",HRDY);
      //console.log(logMassIn);
}



//Varibles needed specifically for this plot.
var minX = minXData;
var maxX = maxXData;
var minY = minYData;
var maxY = maxYData;
var scaleXPx = (minX-maxX)/xAxisLength ;
//var offsetX = (event.offsetX)+xAxisXCnvs;
var scaleYPx = (maxY-minY)/ (yAxisLength) ;
//var offsetYP9 = (-event.offsetY+yAxisYCnvs+yAxisLength);


/*create event listeners that change the text box's tect content when the 
 * mouse is moved over
*/
      SVGNine.addEventListener("mousemove",function(){convertTextP9(minX-scaleXPx*(event.offsetX-xAxisLength-xAxisXCnvs)-1.5, minY+scaleYPx*(-event.offsetY+yAxisYCnvs+yAxisLength));});
//document.addEventListener("mousemove",function(){console.log(event.offsetY)});
      SVGNine.addEventListener("mouseout",function(){convertTextP9(0, 0);});
SVGNine.appendChild;
                              //JB



//Lines of constant radius first
//
     var RGBHex = colHex(100, 100, 100);
     var dSizeCnvs = 2;
     var deltaLog10Teff = 0.2;  //Delta Log(Teff) in K
     var numRadLine = (maxXData - minXData) / deltaLog10Teff;
     numRadLine = Math.abs(Math.ceil(numRadLine));
     //console.log(numRadLine);
     var log10TeffSun = logTen(teffSun);
     var thisLog10Teff, thisLog10TeffSol, log10L;

     var thisLog10Rad;
     var HRradii = [0.01, 0.1, 1.0, 10.0, 100.0, 1000.0]; //solar radii
     var numRad = HRradii.length;
     //console.log("numRad " + numRad);

     for (var r = 0; r < numRad; r++){
 
       thisLog10Rad = logTen(HRradii[r]); //solar units
//Seed first data point
        thisLog10Teff = minXData; //K
        thisLog10TeffSol = thisLog10Teff - log10TeffSun; //solar units  
        var xTickPosCnvs = xAxisLength * (thisLog10Teff - minXData) / rangeXData; // pixels
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
        log10L = (4.0*thisLog10TeffSol) + (2.0*thisLog10Rad);
        var yTickPosCnvs = yAxisLength * (log10L - minYData) / rangeYData;
        var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

    for (var i = 1; i < numRadLine; i++){
   //Caution: Teff axis backwards so minXData > maxXData:
        thisLog10Teff = minXData - (i * deltaLog10Teff); //K
        thisLog10TeffSol = thisLog10Teff - log10TeffSun; //solar units  
        log10L = (4.0*thisLog10TeffSol) + (2.0*thisLog10Rad);

        //console.log("thisLog10Teff " + thisLog10Teff + " log10L " + log10L);
 
          var xTickPosCnvs = xAxisLength * (thisLog10Teff - minXData) / rangeXData; // pixels   

          // horizontal position in pixels - data values increase rightward:
          var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

          var yTickPosCnvs = yAxisLength * (log10L - minYData) / rangeYData;
          // vertical position in pixels - data values increase upward:
          var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
				//JB
	  var line = document.createElementNS(xmlW3,'polyline');
//set the points that the line will follow
	  line.setAttribute('points',(lastXShiftCnvs+","+ lastYShiftCnvs+" "+xShiftCnvs+","+yShiftCnvs+" "));
	  line.setAttribute('stroke',"black");


	  line.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
	  SVGNine.appendChild(line);
				//JB
            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
  } //i loop over Teff
				//JB
          txtPrint("<span style='font-size:xx-small'>" + HRradii[r] + " R<sub>Sun</sub></span>",
                    xShiftCnvs+5, yShiftCnvs-5, RGBHex, newPlotNineId);
				//JB
 } //r loop over radii
 

//Data loops - plot the result!

//MS stars

        var dSizeCnvs = 2.0; //plot point size
        var opac = 0.7; //opacity
        // RGB color
        var r255 = 0;
        var g255 = 0;
        var b255 = 0; 
        var RGBHex = colHex(r255, r255, r255);

        var ii;
        //for (var i = 5; i < msNum - 3; i++) {
        for (var i = 4; i < msNum - 1; i++) {

            ii = 1.0 * i;
            var xTickPosCnvs = xAxisLength * (logTen(msTeffs[i]) - minXData) / rangeXData; // pixels   

            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            var yTickPosCnvs = yAxisLength * (msLogLum[i] - minYData) / rangeYData;
        //console.log("logTen(msTeffs[i] " + logTen(msTeffs[i]) + " msLogLum[i] " + msLogLum[i]);
            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
				//JB
//plot MS stars
	    var dot = document.createElementNS(xmlW3,'circle');
	    dot.setAttribute('cx',xShiftCnvs);
            dot.setAttribute('cy',yShiftCnvs);
            dot.setAttribute('r',dSizeCnvs);
            dot.setAttribute('stroke',RGBHex);
            dot.setAttribute('fill',wDefaultColor);
            dot.setAttribute('id',"dot"+i);
	    dot.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
	    SVGNine.appendChild(dot);
				//JB

var dotId = document.getElementById("dot"+i);//+","+;
/*Function needed to be able to have values update for each 
 * iteration of the loop. This is done because any value that is passed on 
 * to the event listener doesn't get updated until the end of the loop
 * (scope issue).
 * Otherwise it attaches an event to all elements using only final 
 * values used during LAST iteration of the loop.
 *
*/
!function I(ii){
 
        var   x = logTen(msTeffs[ii]);
        var   y = msLogLum[ii];  
      
/*Get a specific MS star element and add event listeners that return the 
 * center position of the circle (setting text content). Also, an event
 * listener created that sets the dials on click.
 */ 
 dotId.addEventListener("mouseover",function(){convertTextP9(x,y);},false);
 dotId.addEventListener("mouseout",function(){convertTextP9(0, 0);},false);
 dotId.addEventListener("click",function(){set(x,y);},false);     
//check(x,y);
}(i);
//  SVGNine.appendChild(dot);
}


//RGB stars

// RGB color
        var r255 = 0;
        var g255 = 0;
        var b255 = 0; 
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

				//JB
            var dot2 = document.createElementNS(xmlW3,'circle');
            dot2.setAttribute('cx',xShiftCnvs);
            dot2.setAttribute('cy',yShiftCnvs);
            dot2.setAttribute('r',dSizeCnvs);
            dot2.setAttribute('stroke',RGBHex);
            dot2.setAttribute('fill',wDefaultColor);
            dot2.setAttribute('id',"dotTwo"+i);
            dot2.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            SVGNine.appendChild(dot2);
                                //JB

var dotId2 = document.getElementById("dotTwo"+i);//+","+;
/*Function needed to be able to have values update for each 
 *  iteration of the loop. This is done because any value that is passed on 
 *  to the event listener doesn't get updated until the end of the loop 
 *  (scope issue).
 *  Otherwise it attaches an event to all elements using only final 
 *  values used during LAST iteration of the loop.
 *  
 */ 
        !function I2(ii){
            var x2 = logTen(rgbTeffs[i]);
            var y2 = rgbLogLum[i];


/*Get a specific RGB star element and add event listeners that return the 
 *  center position of the circle (setting text content). Also, an event
 *  listener created that sets the dials on click.
 *  */
 dotId2.addEventListener("mouseover",function(){convertTextP9(x2,y2);},false);
 dotId2.addEventListener("mouseout",function(){convertTextP9(0, 0);},false);
 dotId2.addEventListener("click",function(){set(x2,y2);console.log(1);},false);
//check(x2,y2);
}(i);


 }


// //SGB stars
// 
// // RGB color
 var r255 = 0;
 var g255 = 0;
 var b255 = 0; 
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
				
				//JB
            var dot3 = document.createElementNS(xmlW3,'circle');
            dot3.setAttribute('cx',xShiftCnvs);
            dot3.setAttribute('cy',yShiftCnvs);
            dot3.setAttribute('r',dSizeCnvs);
            dot3.setAttribute('stroke',RGBHex);
            dot3.setAttribute('fill',wDefaultColor);
            dot3.setAttribute('id',"dotThree"+i);
            dot3.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            SVGNine.appendChild(dot3);

				//JB

  /*Function needed to be able to have values update for each 
 * iteration of the loop. This is done because any value that is passed on 
 * to the event listener doesn't get updated until the end of the loop 
 * (scope issue).
 * Otherwise it attaches an event to all elements using only final 
 * values used during LAST iteration of the loop.
 *
*/

var dotId3 = document.getElementById("dotThree"+i);//+","+;
!function I3(){
            var x3 = logTen(sgbTeffs[i]);
            var y3 = sgbLogLum[i];

/*Get a specific SGB star element and add event listeners that return the 
 * center position of the circle (setting text content). Also, an event
 * listener created that sets the dials on click.
 */
//check(x3,y3);

 dotId3.addEventListener("mouseover",function(){convertTextP9(x3,y3);},false);
 dotId3.addEventListener("mouseout",function(){convertTextP9(0, 0);},false);
 dotId3.addEventListener("click",function(){set(x3,y3);console.log(1);},false);
             SVGNine.appendChild(dot3);
//check(x3,y3);
}(i);


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
        var RGBHex = colHex(rrI, ggI, bbI);

//
			//JB
            var x4 = logTen(teff);
            var y4 = logTen(bolLum);
//create a circle representing our star
	    var dot4 = document.createElementNS(xmlW3,'circle');
	    dot4.setAttribute('cx',xShiftCnvs);
            dot4.setAttribute('cy',yShiftCnvs);
            dot4.setAttribute('r',1.1 * radiusPxThis);
            dot4.setAttribute('stroke',"white");
            dot4.setAttribute('fill',wDefaultColor);

//event listeners added directly onto the one circle
            dot4.addEventListener("mouseover",function(){convertTextP9(x4, y4);});
 dot4.addEventListener("click",function(){set(x4,y4);console.log(1);},false);
            dot4.addEventListener("mouseout",function(){convertTextP9(0, 0);});

	    dot4.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);

//create another circle behind our star to make it more visable

	    var dot5 = document.createElementNS(xmlW3,'circle');
            dot5.setAttribute('cx',xShiftCnvs);
            dot5.setAttribute('cy',yShiftCnvs);
            dot5.setAttribute('r',1.05 * radiusPxThis);
	    dot5.setAttribute('stroke',RGBHex);
            dot5.setAttribute('fill',RGBHex);
//event listeners added directly onto the one circle
            dot5.addEventListener("mouseover",function(){convertTextP9(x4, y4);});
            dot5.addEventListener("mouseout",function(){convertTextP9(0, 0);});
 dot5.addEventListener("click",function(){set(x4,y4);console.log(1);},false);
	    dot5.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);

		SVGNine.appendChild(dot4);
	    
	                SVGNine.appendChild(dot5);

			//JB

        //Now overplot Luminosity class markers:

            //I
        var xShift = xAxisXCnvs + xAxisLength * (logTen(sgbTeffs[sgbNum-1]) - minXData) / rangeXData; // pixels 
        var yShift = (yAxisYCnvs + yAxisLength) - (yAxisLength * (sgbLogLum[sgbNum - 1] - minYData) / rangeYData);
				//JB
        txtPrint("<span style='font-size:normal'><a href='http://en.wikipedia.org/wiki/Stellar_classification' target='_blank'>\n\
I</a></span>", xShift, yShift, lineColor, newPlotNineId);
				//JB
        //III
        xShift = xAxisXCnvs + xAxisLength * (logTen(rgbTeffs[rgbNum-1]) - minXData) / rangeXData; // pixels 
        yShift = (yAxisYCnvs + yAxisLength) - (yAxisLength * (rgbLogLum[rgbNum - 8] - minYData) / rangeYData);
				//JB
        txtPrint("<span style='font-size:normal'><a href='http://en.wikipedia.org/wiki/Stellar_classification' title='Giants' target='_blank'>\n\
     III</a></span>", xShift, yShift, lineColor, newPlotNineId);
				//JB
        //V
        xShift = xAxisXCnvs + xAxisLength * (logTen(msTeffs[msNum-1]) - minXData) / rangeXData; // pixels 
        yShift = (yAxisYCnvs + yAxisLength) - (yAxisLength * (msLogLum[msNum - 8] - minYData) / rangeYData);
				//JB
        txtPrint("<span style='font-size:normal'><a href='http://en.wikipedia.org/wiki/Stellar_classification' title='Main Sequence, Dwarfs' target='_blank'>\n\
     V</a></span>", xShift, yShift, lineColor, newPlotNineId);
    }

				//JB
					
					

// ****************************************
    //
    //
    //  *****   PLOT ONE / PLOT 1
    //
/*
    // Plot one: log(Tau) vs log(rho)
    // 
    if ((ifLineOnly === false) && (ifShowAtmos === true)) {
//
  // console.log("PLOT ONE");
        var plotRow = 3;
        var plotCol = 2;
        var minXData = logE * tauRos[1][0] - 0.0;
        var maxXData = logE * tauRos[1][numDeps - 1];
        var xAxisName = "<span title='Rosseland mean optical depth'><a href='http://en.wikipedia.org/wiki/Optical_depth_%28astrophysics%29' target='_blank'>Log<sub>10</sub> <em>&#964</em><sub>Ros</sub></a></span>";
        // Don't use upper boundary condition as lower y-limit - use a couple of points below surface:
        //var numYTicks = 6;
        // Build total P from P_Gas & P_Rad:

        var minYData = logE * rho[1][1] - 1.0; // Avoid upper boundary condition [i]=0
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
            var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
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
*/

    //
    //
    //  *****   PLOT THREE / PLOT 3
    //
    //
    // Plot three: log(Tau) vs log(Pressure)

    if ((ifLineOnly === false) && (ifShowAtmos === true)) {

        var plotRow = 3;
        var plotCol = 2;
        var minXData = logE * tauRos[1][0];
        var maxXData = logE * tauRos[1][numDeps - 1];
        var xAxisName = "<span title='Rosseland mean optical depth'><a href='http://en.wikipedia.org/wiki/Optical_depth_%28astrophysics%29' target='_blank'>Log<sub>10</sub> <em>&#964</em><sub>Ros</sub></a></span>";
        // From Hydrostat.hydrostat:
        //pGas is a 2 x numDeps array:
        // rows 0 & 1 are linear and log *gas* pressure, respectively
        // Don't use upper boundary condition as lower y-limit - use a couple of points below surface:
        //var numYTicks = 6;
        // Build total P from P_Gas & P_Rad:
        var logPTot = [];
        logPTot.length = numDeps;
        for (var i = 0; i < numDeps; i++) {
            logPTot[i] = Math.log(pGas[0][i] + pRad[0][i]);
            //console.log(" i " + i + " logPTot[i] " + logPTot[i] + " pGas[0][i] " + pGas[0][i] + " pRad[0][i] " + pRad[0][i]);
        }
        //var minYData = logE * logPTot[0] - 2.0; // Avoid upper boundary condition [i]=0
        var minYData = logE * Math.min(pGas[1][0], pRad[1][0], newPe[1][0]) - 1.0;
        var maxYData = logE * logPTot[numDeps - 1];
        var yAxisName = "Log<sub>10</sub> <em>P</em> <br />(dynes <br />cm<sup>-2</sup>)";
        //console.log("minYData " + minYData + " maxYData " + maxYData);
        //washer(xRange, xOffset, yRange, yOffset, wDefaultColor, plotThreeId);

        var fineness = "normal";
        //var cnvsCtx = washer(plotRow, plotCol, wDefaultColor, plotThreeId, cnvsId);
				//JB
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, newPlotThreeId, SVGThree);
				//JB
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
	SVGThree.setAttribute('fill',wDefaultColor);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                newPlotThreeId, SVGThree);
        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                fineness,newPlotThreeId, SVGThree);

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
					//JB
        txtPrint("log Pressure: <span style='color:blue' title='Total pressure'><strong><em>P</em><sub>Tot</sub></strong></span> "
                + " <a href='http://en.wikipedia.org/wiki/Gas_laws' target='_blank'><span style='color:#00FF88' title='Gas pressure'><em>P</em><sub>Gas</sub></span></a> "
                + " <a href='http://en.wikipedia.org/wiki/Radiation_pressure' target='_blank'><span style='color:red' title='Radiation pressure'><em>P</em><sub>Rad</sub></span></a> " +
                  " <span style='color:black' title='Partial electron pressure'><em>P</em><sub>e</sub></span>",
                titleOffsetX, titleOffsetY, lineColor, newPlotThreeId);

					//JB
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
         var lastYTickPosGCnvs = yAxisLength * (logE * pGas[1][0] - minYData) / rangeYData;
         var lastYTickPosRCnvs = yAxisLength * (logE * pRad[1][0] - minYData) / rangeYData;
         var lastYTickPosBCnvs = yAxisLength * (logE * newPe[1][0] - minYData) / rangeYData;
         // vertical position in pixels - data values increase upward:
         var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
         var lastYShiftGCnvs =(yAxisYCnvs + yAxisLength) - yTickPosGCnvs;
         var lastYShiftRCnvs = (yAxisYCnvs + yAxisLength) - yTickPosRCnvs;
         var lastYShiftBCnvs = (yAxisYCnvs + yAxisLength) - yTickPosBCnvs;

        



                                      //JB
/*text box that will have text content equal to the 
 * x and y coordinates on the SVG
*/
      var textP3 = document.createElementNS(xmlW3,'text');
      textP3.setAttribute('x',325);
        textP3.setAttribute('y',325);
        textP3.setAttribute('font-size',"10");
      textP3.setAttribute('id',"subtextP3");
      textP3.setAttribute('name',"subtextP3");
      textP3.textContent = "(?,?)";
      textP3.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);

      SVGThree.appendChild(textP3);


/*to account for the fact that UPON MOVEMENT IN THE SVG,
 * A NEW TEXT ELEMENT IS CREATED UP TO N TIMES WHERE N
 *  IS THE NUMBER TIMES THE MODEL BUTTON HAS BEEN PRESSED SINCE
 *  THE CACHE WAS CLEARED, these variables were created to keep
 *  track of the single text element that is wanted to display
 *  the coordinates.
*/


      var nTextsP3 = 0;//document.getElementsByName("subtextP6").length;

//function to convert x and y values from the loop into text
      function convertTextP3(X,Y){
      //var X = x;
      //var Y = y;
      if(X!=0){
      nTextsP3 = document.getElementsByName("subtextP3").length;

      //var wantedText = document.getElementsByName("subtextP6")[0];
      //console.log(nTexts);
      //console.log(document.getElementsByName("subtextP6"));
      if(nTextsP3==1){
      document.getElementsByName("subtextP3")[0].textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      
      SVGThree.appendChild(textP3);
      
      }else if(nTextsP3>1){
      for(var i = 0; i < nTextsP3; i++){
      var extraText = document.getElementsByName("subtextP3")[i];
//For some reason, deleteing the textbox does not work...
      //$("#SVGSix").remove("#"+extraText.id.toString());
//but setting the text to nothing does...     
      extraText.textContent="";
      //nTexts = document.getElementsByName("subtextP6").length;      
      SVGThree.appendChild(textP3);
      }//end for loop

      document.getElementsByName("subtextP3")[0].textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      
      SVGThree.appendChild(textP3);
      }//end else if
      
      
      }else{
        
      //var wantedText = document.getElementsByName("subtextP6")[0];
      document.getElementsByName("subtextP3")[0].textContent="(?,?)";
        SVGThree.appendChild(textP3);
//    newPlotSixId.appendChild(SVGSix);
//    document.body.appendChild(newPlotSixId);
      }//end else
      }//end function



/*function that sets that sets the text content 
 * to the x and y coordinates on the SVG
*/
/*      function convertTextP3(X,Y){
      //var X = x;
      //var Y = y;
      if(X!=0){

      textP3.textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      //console.log(text.textContent)
      SVGThree.appendChild(textP3);
      }else{

        textP3.textContent="(?,?)";
        SVGThree.appendChild(textP3);
      
      }
              }
*/
//variables needed specifiaclly for this plot
var minXP3 = minXData;
var maxXP3 = maxXData;
var minYP3 = minYData;
var maxYP3 = maxYData;
//these scales determine the number of units per pixel in x and y
var scaleXPxP3 = Math.abs((maxXP3-minXP3)/xAxisLength) ;
//var offsetXP3 = ($("#SVG3").offset().left)+xAxisXCnvs;
var scaleYPxP3 = (maxYP3-minYP3)/yAxisLength ;
//var offsetYP3 = ($("#SVG3").offset().top+yAxisYCnvs);



/*event listeners created to change the text content to the x and y position of 
 * the mouse (in units on the plot) of the text element.
*/


      SVGThree.addEventListener("mousemove",function(){convertTextP3(minXP3+scaleXPxP3*(event.offsetX-xAxisXCnvs), minYP3+scaleYPxP3*(-event.offsetY+yAxisYCnvs+yAxisLength));});
      
      
      SVGThree.addEventListener("mouseout",function(){convertTextP3(0, 0);});

                                      //JB



      // Avoid upper boundary at i=0


        // Avoid upper boundary at i=0
        for (var i = 1; i < numDeps; i++) {

            ii = 1.0 * i;
            var xTickPosCnvs = xAxisLength * (logE * tauRos[1][i] - minXData) / rangeXData; // pixels   

            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            var yTickPosCnvs = yAxisLength * (logE * logPTot[i] - minYData) / rangeYData;
	    var yTickPosGCnvs = yAxisLength * (logE * pGas[1][i] - minYData) / rangeYData;
            var yTickPosRCnvs = yAxisLength * (logE * pRad[1][i] - minYData) / rangeYData;
            var yTickPosBCnvs = yAxisLength * (logE * newPe[1][i] - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
            var yShiftGCnvs = (yAxisYCnvs + yAxisLength) - yTickPosGCnvs;
            var yShiftRCnvs = (yAxisYCnvs + yAxisLength) - yTickPosRCnvs;
            var yShiftBCnvs = (yAxisYCnvs + yAxisLength) - yTickPosBCnvs;

				//JB
				
//plot points
	    var dot = document.createElementNS(xmlW3, 'circle');	    
	    dot.setAttribute('cx',xShiftCnvs);
            dot.setAttribute('cy',yShiftCnvs);
            dot.setAttribute('r',dSizeCnvs);
            dot.setAttribute('fill',"none");
            dot.setAttribute('stroke',"#0000FF");
	    dot.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
	    SVGThree.appendChild(dot);
//plot line points
	    var pline = document.createElementNS(xmlW3, 'polyline'); 
	    pline.setAttribute('points',(lastXShiftCnvs+","+lastYShiftCnvs+" "+xShiftCnvs+","+yShiftCnvs+" "));
            pline.setAttribute('stroke',"#0000FF");
            pline.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            SVGThree.appendChild(pline);

            var dot2 = document.createElementNS(xmlW3, 'circle');
            dot2.setAttribute('cx',xShiftCnvs);
            dot2.setAttribute('cy',yShiftGCnvs);
            dot2.setAttribute('r',dSizeGCnvs);
	    dot2.setAttribute('fill',"none");
            dot2.setAttribute('stroke',"#00FF00");
            dot2.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);

            var dot3 = document.createElementNS(xmlW3, 'circle');
            dot3.setAttribute('cx',xShiftCnvs);
            dot3.setAttribute('cy',yShiftRCnvs);
            dot3.setAttribute('r',dSizeGCnvs);
	    dot3.setAttribute('fill',"red");
            dot3.setAttribute('stroke',"#FF0000");
            dot3.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);

            var dot4 = document.createElementNS(xmlW3, 'circle');
            dot4.setAttribute('cx',xShiftCnvs);
            dot4.setAttribute('cy',yShiftBCnvs);
            dot4.setAttribute('r',dSizeGCnvs);
            dot4.setAttribute('stroke',"#000000");
            dot4.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
 SVGThree.appendChild(dot2);
 SVGThree.appendChild(dot3);
 SVGThree.appendChild(dot4);

//for all but the first iteration of the loop

//creates colored dots and lines for each function on the graph


if(i!==1){
            var pline2 = document.createElementNS(xmlW3, 'polyline');
	    pline2.setAttribute('points',(lastXShiftCnvs+","+lastYShiftGCnvs+" "+xShiftCnvs+","+yShiftGCnvs+" "));
	    pline2.setAttribute('stroke',"#00FF00");
            pline2.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);

            SVGThree.appendChild(pline2);
	    
            var pline3 = document.createElementNS(xmlW3, 'polyline');
            pline3.setAttribute('points',(lastXShiftCnvs+","+lastYShiftRCnvs+" "+xShiftCnvs+","+yShiftRCnvs+" "));
            pline3.setAttribute('stroke',"#FF0000");
            pline3.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);

            SVGThree.appendChild(pline3);
                       var pline4 = document.createElementNS(xmlW3, 'polyline');
            pline4.setAttribute('points',(lastXShiftCnvs+","+lastYShiftBCnvs+" "+xShiftCnvs+","+yShiftBCnvs+" "));
            pline4.setAttribute('stroke',"#000000");
            pline4.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);

            SVGThree.appendChild(pline4);
           }

				//JB
            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
            lastYShiftGCnvs = yShiftGCnvs;
            lastYShiftRCnvs = yShiftRCnvs;
            lastYShiftBCnvs = yShiftBCnvs;
        }

// Tau=1 cross-hair

        var tTau1 = tauPoint(numDeps, tauRos, 1.0);
        var barWidth = 1.0;
        var barColor = "#777777";
        yFinesse = 0.0;
				//JB
        xShift = YBar(logE * tauRos[1][tTau1], minXData, maxXData, barWidth, yAxisLength,
                yFinesse, barColor, newPlotThreeId, SVGThree);
        barHeight = 1.0;
        yShift = XBar(logE * logPTot[tTau1], minYData, maxYData, xAxisLength, barHeight,
                xFinesse, barColor, newPlotThreeId, SVGThree);
        txtPrint("<span style='font-size:small; color:#444444'><em>&#964</em><sub>Ros</sub>=1</span>",
                xShift, yShift, lineColor, newPlotThreeId);

				//JB
    }

    //
    //
    //  *****   PLOT FOUR / PLOT 4
    //
    //
    // Plot four: Limb darkening
//ifShowRad = false; //For movie 
   if ((ifLineOnly === false) && (ifShowRad === true)) {

        var plotRow = 3;
        var plotCol = 1;
        // For movie:
        //var plotRow = 3;
        //var plotCol = 1;
//
        var minXData = 180.0 * Math.acos(cosTheta[1][0]) / Math.PI;
        var maxXData = 180.0 * Math.acos(cosTheta[1][numThetas - 1]) / Math.PI;
        var xAxisName = "<em>&#952</em> (<sup>o</sup>)";
        var minYData = 0.0;
        var maxYData = 1.0;
        //var maxYData = tuneBandIntens[0] / norm;
        var yAxisName = "<span title='Monochromatic surface specific intensity'><a href='http://en.wikipedia.org/wiki/Specific_radiative_intensity' target='_blank'><em>I</em><sub>&#955</sub>(<em>&#952</em>)/<br /><em>I</em><sub>&#955</sub>(0)</a></span>";

        var fineness = "normal";
//
				//JB
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, newPlotFourId, SVGFour);
				//JB
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
				//JB
	SVGFour.setAttribute('fill',wDefaultColor);
 var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                newPlotFourId, SVGFour);
        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                fineness,newPlotFourId, SVGFour);
				//JB
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

//
        lineColor = "#000000";
        var diskLamLbl = diskLambda.toPrecision(3);
        var diskLamStr = diskLamLbl.toString(10);
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
					//JB
        txtPrint("<span style='font-size:small'><span style='color:#000000'><em>&#955</em><sub>Filter</sub> = " + diskLamStr + "nm</span><br /> ",
                xAxisXCnvs+10, titleOffsetY+20, lineColor, newPlotFourId);
        // Add title annotation:
                 txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Limb_darkening' target='_blank'>Limb darkening </a></span>",
        titleOffsetX, titleOffsetY, lineColor, newPlotFourId);
					//JB
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
        var yTickPosCnvs = yAxisLength * ((tuneBandIntens[0] / tuneBandIntens[0]) - minYData) / rangeYData;

        // vertical position in pixels - data values increase upward:
        var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

//


//variables required to create an array of colors based on the gaussian filter
var ilLam0 = lamPoint(numMaster,masterLams,1.0e-7 * diskLambda);
var lambdanm = masterLams[ilLam0]*1.0e7;
var minZData = 0.0;
var maxZData = tuneBandIntens[0]/norm;
var rangeZData = maxZData - minZData;
//console.log(diskLambda);
                              
                              //JB


//
        for (var i = 1; i < numThetas; i++) {

/*other variables required to create an array of colors based
 * on the gaussian filter
*/
var zLevel = ((tuneBandIntens[i]/norm)-minZData)/rangeZData;

var RGBHex = lambdaToRGB(lambdanm,zLevel);
//console.log (RGBHex);


            xTickPosCnvs = xAxisLength * (180.0 * Math.acos(cosTheta[1][i]) / Math.PI - minXData) / rangeXData; // pixels   
            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            yTickPosCnvs = yAxisLength * ((tuneBandIntens[i] / tuneBandIntens[0]) - minYData) / rangeYData;

            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

//Plot points
			//JB
            //RGBHex = colHex(0, 0, 0);
	    var circle = document.createElementNS(xmlW3,'circle');
	    circle.setAttribute('cx',xShiftCnvs);
            circle.setAttribute('cy',yShiftCnvs);
            circle.setAttribute('r',dSizeCnvs);
            circle.setAttribute('stroke',RGBHex);
            circle.setAttribute('fill',RGBHex);
            circle.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            SVGFour.appendChild(circle);
			//JB
//line plot
			//JB
	    var line = document.createElementNS(xmlW3,'polyline');
            line.setAttribute('stroke',"black");
	    line.setAttribute('points',(lastXShiftCnvs+","+lastYShiftCnvs+" "+xShiftCnvs+","+yShiftCnvs+" "));
	    line.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
	    SVGFour.appendChild(line);
			//JB
            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
        }
                              //JB
// text element that holds the x and y coordinates of the cursor on the SVG
      var textP4 = document.createElementNS(xmlW3,'text');
      textP4.setAttribute('x',325);
        textP4.setAttribute('y',325);
        textP4.setAttribute('font-size',"10");
      textP4.setAttribute('id',"subtextP4");
      textP4.setAttribute('name',"subtextP4");
      textP4.textContent="(?,?)";
      textP4.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
      SVGFour.appendChild(textP4);


/*to account for the fact that UPON MOVEMENT IN THE SVG,
 * A NEW TEXT ELEMENT IS CREATED UP TO N TIMES WHERE N
 *  IS THE NUMBER TIMES THE MODEL BUTTON HAS BEEN PRESSED SINCE
 *  THE CACHE WAS CLEARED, these variables were created to keep
 *  track of the single text element that is wanted to display
 *  the coordinates.
*/


      var nTextsP4 = 0;//document.getElementsByName("subtextP6").length;

//function to convert x and y values from the loop into text
      function convertTextP4(X,Y){
      //var X = x;
      //var Y = y;
      if(X!=0){
      nTextsP4 = document.getElementsByName("subtextP4").length;

      //var wantedText = document.getElementsByName("subtextP6")[0];
      //console.log(nTexts);
      //console.log(document.getElementsByName("subtextP6"));
      if(nTextsP4==1){
      document.getElementsByName("subtextP4")[0].textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      
      SVGFour.appendChild(textP4);
      
      }else if(nTextsP4>1){
      for(var i = 0; i < nTextsP4; i++){
      var extraText = document.getElementsByName("subtextP4")[i];
//For some reason, deleteing the textbox does not work...
      //$("#SVGSix").remove("#"+extraText.id.toString());
//but setting the text to nothing does...     
      extraText.textContent="";
      //nTexts = document.getElementsByName("subtextP6").length;      
      SVGFour.appendChild(textP4);
      }//end for loop

      document.getElementsByName("subtextP4")[0].textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      
      SVGFour.appendChild(textP4);
      }//end else if
      
      
      }else{
        
      //var wantedText = document.getElementsByName("subtextP6")[0];
      document.getElementsByName("subtextP4")[0].textContent="(?,?)";
        SVGFour.appendChild(textP4);
//    newPlotSixId.appendChild(SVGSix);
//    document.body.appendChild(newPlotSixId);
      }//end else
      }//end function


/* a function that sets the text content to the x and y cursor
 * positons on the SVG (in units of he x and y axis)
*/
/*    
      function convertTextP4(X,Y){
      //var X = x;
      //var Y = y;
      if(X!=0){

      textP4.textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      //console.log(text.textContent)
      SVGFour.appendChild(textP4);
      //console.log(text.textContent);
      }else{

        textP4.textContent="(?,?)";
        SVGFour.appendChild(textP4);
      
      }
              }
*/
//console.log(minXData);
//console.log(maxXData);
//
//
//variables specifically for this plot
var minXP4 = minXData;
var maxXP4 = maxXData;
var minYP4 = minYData;
var maxYP4 = maxYData;

//these scales determine the number of units per pixel in x and y
var scaleXPxP4 = Math.abs((maxXP4-minXP4)/xAxisLength) ;
//var offsetXP4 = ($("#SVG4").offset().left)+xAxisXCnvs;
var scaleYPxP4 = (maxYP4-minYP4)/yAxisLength ;
//var offsetYP4 = ($("#SVG4").offset().top+yAxisYCnvs);



/*event listeners created to change the text content to the x and y position of 
 * the mouse (in units on the plot) of the text element.
*/


      SVGFour.addEventListener("mousemove",function(){convertTextP4(minXP4+scaleXPxP4*(event.offsetX-xAxisXCnvs), minYP4+scaleYPxP4*(-event.offsetY+yAxisYCnvs+yAxisLength));});      
      SVGFour.addEventListener("mouseout",function(){convertTextP4(0, 0);});

    }
//ifShowRad = true; //For movie 

//
//
//  *****   PLOT FIVE / PLOT 5
//
//

// Plot five: SED
// 
    //if ((ifLineOnly === false) && (ifShowRad === true)) { 
    //if ((ifLineOnly === false)) { 
//    //For movie:
//    if (ifLineOnly === false) { 

        var plotRow = 1;
        var plotCol = 1;
        ////For movie:
        //var plotRow = 1;
        //var plotCol = 1;
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
        //(xRange, xOffset, yRange, yOffset, wDefaultColor, plotFiveId);

        //var fineness = "coarse";
        //var cnvsCtx = washer(plotRow, plotCol, wDefaultColor, plotFiveId, cnvsId);

					//JB
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, newPlotFiveId, SVGFive);
					//JB

        panelX = panelOrigin[0];
        panelY = panelOrigin[1];

				//JB
	SVGFive.setAttribute("fill",wDefaultColor);
				//JB

				//JB
		//console.log(SVGFive); is good, created fine
		//console.log("Before: minXData, maxXData " + minXData + ", " + maxXData);
                //console.log("XAxis called from PLOT 5:");
	        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                newPlotFiveId, SVGFive);
				//JB

                                //JB
        var yAxisParams = YAxis(panelX, panelY,minYData, maxYData, yAxisName, fineness, newPlotFiveId, SVGFive);                                                                       //JB

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
		//console.log("After : minXData, maxXData " + minXData + ", " + maxXData + " rangeXData " + rangeXData);
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
					//JB
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Spectral_energy_distribution' target='_blank'>\n\
     Spectral energy distribution (SED)</a></span>",
                titleOffsetX, titleOffsetY, lineColor, newPlotFiveId);
        txtPrint("<span style='font-size:small'>"
                + "<span><em>F</em><sub>&#955</sub> (<em>&#955</em><sub>Max</sub> = " + lamMaxStr + " nm)</span>, "
                + " <span><em>I</em><sub>&#955</sub>,</span> <span style='color:#444444'> <em>&#952</em> = " + thet0Str + "<sup>o</sup></span>,  "
                + " <span style='color:#444444'><em>&#952</em> = " + thetNStr + "<sup>o</sup></span></span>",
                titleOffsetX, titleOffsetY+35, lineColor, newPlotFiveId);
					//JB
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

					//JB
        xShift = YBar(band0, minXData, maxXData, vBarWidth, yAxisLength,
                yFinesse, RGBHex, newPlotFiveId, SVGFive);
        }; //end function UBVRIbands
					
					//JB

//
        //
        var filters = filterSet();
        var lam0_ptr = 11; // approximate band centre
        var numBands = filters.length;
        var lamUBVRI = [];
        lamUBVRI.length = numBands;

        
                                      //JB
//a text box that holds the x and y positons on the SVG
      var textP5 = document.createElementNS(xmlW3,'text');
      textP5.setAttribute('x',325);
      textP5.setAttribute('y',325);
      textP5.setAttribute('font-size',"10");
      textP5.setAttribute('id',"subtextP5");
      textP5.setAttribute('name',"subtextP5");
      //textP5.textContent="(?,?)";
      textP5.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
//console.log(window.devicePixelRatio);
      SVGFive.appendChild(textP5);

/*to account for the fact that UPON MOVEMENT IN THE SVG,
 * A NEW TEXT ELEMENT IS CREATED UP TO N TIMES WHERE N
 *  IS THE NUMBER TIMES THE MODEL BUTTON HAS BEEN PRESSED SINCE
 *  THE CACHE WAS CLEARED, these variables were created to keep
 *  track of the single text element that is wanted to display
 *  the coordinates.
*/


      var nTextsP5 = 0;//document.getElementsByName("subtextP6").length;

//function to convert x and y values from the loop into text
      function convertTextP5(X,Y){
      //var X = x;
      //var Y = y;
      if(X!=0){
      nTextsP5 = document.getElementsByName("subtextP5").length;

      //var wantedText = document.getElementsByName("subtextP6")[0];
      //console.log(nTexts);
      //console.log(document.getElementsByName("subtextP6"));
      if(nTextsP5==1){
      document.getElementsByName("subtextP5")[0].textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      
      SVGFive.appendChild(textP5);
      
      }else if(nTextsP5>1){
      for(var i = 0; i < nTextsP5; i++){
      var extraText = document.getElementsByName("subtextP5")[i];
//For some reason, deleteing the textbox does not work...
      //$("#SVGSix").remove("#"+extraText.id.toString());
//but setting the text to nothing does...     
      extraText.textContent="";
      //nTexts = document.getElementsByName("subtextP6").length;      
      SVGFive.appendChild(textP5);
      }//end for loop

      document.getElementsByName("subtextP5")[0].textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      
      SVGFive.appendChild(textP5);
      }//end else if
      
      
      }else{
        
      //var wantedText = document.getElementsByName("subtextP6")[0];
      document.getElementsByName("subtextP5")[0].textContent="(?,?)";
        SVGFive.appendChild(textP5);
//    newPlotSixId.appendChild(SVGSix);
//    document.body.appendChild(newPlotSixId);
      }//end else
      }//end function


/* a function that sets the text content to the x and y 
 * cursor positons on the SVG (in units of he x and y axis)
*/ 

/*   
      function convertTextP5(X,Y){
      //var X = x;
      //var Y = y;
      if(X!=0){

      textP5.textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      //console.log(text.textContent)
      SVGFive.appendChild(textP5);
      //console.log(text.textContent);
      }else{

        textP5.textContent="(?,?)";
        SVGFive.appendChild(textP5);
      
      }
              }
*/
//console.log(minXData);
//console.log(maxXData);


//variables specifically for this plot
var minXP5 = minXData;
var maxXP5 = maxXData;
var minYP5 = minYData;
var maxYP5 = maxYData;

//these scales determine the number of units per pixel in x and y
var scaleXPxP5 = Math.abs((maxXP5-minXP5)/xAxisLength) ;
//var offsetXP5 = ($("#SVG5").offset().left)+xAxisXCnvs;
var scaleYPxP5 = (maxYP5-minYP5)/yAxisLength ;
//var offsetYP5 = ($("#SVG5").offset().top+yAxisYCnvs);


/*event listeners that change the text content on the text element
 *  on mouse over
*/

      SVGFive.addEventListener("mousemove",function(){convertTextP5(minXP5+scaleXPxP5*(event.offsetX-xAxisXCnvs), minYP5+scaleYPxP5*(-event.offsetY+yAxisYCnvs+yAxisLength));});
      
      SVGFive.addEventListener("mouseout",function(){convertTextP5(0, 0);});




                                      //JB




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
	//J: (lburns)
	var r255 = 178;
	var g255 = 34;
	var b255 = 34; // firebrick 
	UBVRIBands(r255, g255, b255, lamUBVRI[6]);
	//H: (lburns)
	var r255 = 128;
	var g255 = 0;
	var b255 = 0; // maroon
	UBVRIBands(r255, g255, b255, lamUBVRI[7]);
	//K: (lburns)
	var r255 = 160;
	var g255 = 82;
	var b255 = 45; // sienna
	UBVRIBands(r255, g255, b255, lamUBVRI[8]);
        //Data loop - plot the result!

//Continuum spectrum - For testing: 
//        var contFlux3 = interpolV(contFlux[0], lambdaScale, masterLams);

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

        var yShiftCnvs, yShiftCCnvs, yShift0Cnvs, yShiftNCnvs;
        //var logLambdanm = 7.0 + logTen(masterLams[0]);  //logarithmic
        var lambdanm = 1.0e7 * masterLams[0];
        var xTickPosCnvs = xAxisLength * (lambdanm - minXData) / rangeXData; // pixels
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
//Logarithmic y:
        var yTickPosCnvs = yAxisLength * ((masterFlux[0][0] / norm) - minYData) / rangeYData;
        //var yTickPosCCnvs = yAxisLength * ((contFlux3[0] / norm) - minYData) / rangeYData;
        var yTickPos0Cnvs = yAxisLength * ((masterIntens[0][0] / norm) - minYData) / rangeYData;
        var yTickPosNCnvs = yAxisLength * ((masterIntens[0][numThetas - 2] / norm) - minYData) / rangeYData;
        // vertical position in pixels - data values increase upward:
        var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
        //var lastYShiftCCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCCnvs;
        var lastYShift0Cnvs = (yAxisYCnvs + yAxisLength) - yTickPos0Cnvs;
        var lastYShiftNCnvs = (yAxisYCnvs + yAxisLength) - yTickPosNCnvs;
        var xShift, yShift;

				//JB
//initalized points for all the lines to be plotted
			var points = "";
			var points2 = "";
			var points3 = "";
				//JB

        for (var i = 1; i < numMaster; i++) {

            lambdanm = masterLams[i] * 1.0e7; //cm to nm //linear
            //logLambdanm = 7.0 + logTen(masterLams[i]);  //logarithmic
            ii = 1.0 * i;
            xTickPosCnvs = xAxisLength * (lambdanm - minXData) / rangeXData; // pixels   //linear

            // horizontal position in pixels - data values increase rightward:
            xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

//logarithmic y:
            yTickPosCnvs = yAxisLength * ((masterFlux[0][i] / norm) - minYData) / rangeYData;
            //yTickPosCCnvs = yAxisLength * ((contFlux3[i] / norm) - minYData) / rangeYData;
            yTickPos0Cnvs = yAxisLength * ((masterIntens[i][0] / norm) - minYData) / rangeYData;
            yTickPosNCnvs = yAxisLength * ((masterIntens[i][numThetas - 2] / norm) - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
            //yShiftCCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCCnvs;
            yShift0Cnvs = (yAxisYCnvs + yAxisLength) - yTickPos0Cnvs;
            yShiftNCnvs = (yAxisYCnvs + yAxisLength) - yTickPosNCnvs;

          //  lastXShiftCnvs = xShiftCnvs;
          //  lastYShiftCnvs = yShiftCnvs;
            //lastYShiftCCnvs = yShiftCCnvs;
          //  lastYShift0Cnvs = yShift0Cnvs;
          //  lastYShiftNCnvs = yShiftNCnvs;

//JB create points
           
//points+=(lastXShiftCnvs+","+lastYShiftCnvs+" ");
//points2+=(lastXShiftCnvs+","+lastYShift0Cnvs+" ");
//points3+=(lastXShiftCnvs+","+lastYShiftNCnvs+" ");

points += xShiftCnvs+","+(yShiftCnvs)+" ";
points2 += xShiftCnvs+","+(yShift0Cnvs)+" ";
points3 += xShiftCnvs+","+(yShiftNCnvs)+" ";
		
    lastXShiftCnvs = xShiftCnvs;
      lastYShiftCnvs = yShiftCnvs;
        //lastYShiftCCnvs = yShiftCCnvs;
          lastYShift0Cnvs = yShift0Cnvs;
            lastYShiftNCnvs = yShiftNCnvs;
        }

//JB create lines to be plotted

var pline = document.createElementNS(xmlW3,'polyline');
var pline2 = document.createElementNS(xmlW3,'polyline');
var pline3 = document.createElementNS(xmlW3,'polyline');

pline.setAttribute('stroke',"black");
pline2.setAttribute('stroke',"blue");
pline3.setAttribute('stroke',"green");

pline.setAttribute('fill',"none");
pline2.setAttribute('fill',"none");
pline3.setAttribute('fill',"none");

pline.setAttribute('points',points);
pline2.setAttribute('points',points2);
pline3.setAttribute('points',points3);

//event listener only needed on the SVG and not the lines (useless code)

            pline.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            pline2.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            pline3.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);

            SVGFive.appendChild(pline);
            SVGFive.appendChild(pline2);
            SVGFive.appendChild(pline3);

//	console.log(points);
//	console.log(points2);
//	console.log(points3);

           //monochromatic disk lambda
                yFinesse = 0.0;
                barHeight = 200;
                barWidth = 2;
                RGBHex = "#000000";
					//JB

                var xShiftDum = YBar(diskLambda, minXData, maxXData, barWidth, barHeight,yFinesse, RGBHex, newPlotFiveId, SVGFive);

        txtPrint("<span style='font-size:xx-small'>Filter</span>",
                xShiftDum, titleOffsetY+60, lineColor, newPlotFiveId);

					//JB    
//} 

//
//
//  *****   PLOT SIX / PLOT 6
//
//
// Plot six: Line profile

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

                              //JB

//variables needed to create an array of colors
var counter = 0;
var arrayLambda = [];

var halfPoints = Math.floor(numPoints/2);
arrayLambda.length=halfPoints;

//colors initalized on/for the fringes of the spectral line
var RGBHex = "";
var greenG = 175;
var blueB = 125;
var redR = 0;

//a function to convert RGB values to hexidecimals
      function hexConvert(v){
      var hex = v.toString(16);
      return(hex.length == 1) ? "0" + hex : hex;
      }

//create an array of colors for all possible points on the spectral line
      for(var k = 0; k < halfPoints; k++){
//colors become more blue, and less green toward the center (toward end of loop)
      var greenN = greenG - (k)*(greenG/halfPoints);
      var blueN = blueB + (k)*(greenG/(halfPoints));
      var redN = redR;        
      var blue = hexConvert(parseInt(Math.abs(blueN)));
      var green = hexConvert(parseInt(Math.abs(greenN)));
      var red = hexConvert(parseInt(Math.abs(redN)));
      
      arrayLambda[k]=("#"+ red + green + blue);
              
      
      }       
              //JB



////over-ride x-axis scaling while debugging:
// var iStart = 0;
// var iStop = numPoints-1;

//Try to scale x-range to width of line:
//        var maxXData = 1.0e7 * (lineLambdas[iStop] - lam0);
//        var minXData = 1.0e7 * (lineLambdas[iStart] - lam0);
//console.log("lam0 " + lam0 + " lineLambdas[iStart] " + lineLambdas[iStart] + " lineLambdas[iStop] " + lineLambdas[iStop]);

    if (ifShowLine === true) {

        var plotRow = 2;
        var plotCol = 0;

        var maxXData = 1.0e7 * linePoints[0][iStop];
        var minXData = 1.0e7 * linePoints[0][iStart];
        ////Special setting for movie:
        //iStart = 0;
        //iStop = numPoints-1;
        //var maxXData = 0.5;
        //var minXData = -0.5;
//console.log("numPoints " + numPoints + " linePoints[iStart] " + linePoints[0][iStart] + " linePoints[iStop] " + linePoints[0][iStop]);
//console.log("minXData " + minXData + " maxXData " + maxXData);
        //   
        var xAxisName = "<em>&#916</em> <em>&#955</em> (nm)";
        //var numYTicks = 6;
        //var minYData = intens[0][0];  // 
        //var maxYData = intens[numLams - 1][0];
        var minYData = 0.0;
        var maxYData = 1.1;
        var yAxisName = "<span title='Continuum normalized flux'><a href='http://en.wikipedia.org/wiki/Spectral_flux_density' target='_blank'><em>F</em><sub>&#955</sub>/<br /><em>F</em><sup>C</sup><sub>&#955 0</sub></a></span>";

        var fineness = "fine";
				//JB
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, newPlotSixId, SVGSix);

				//JB
	 panelX = panelOrigin[0];
        panelY = panelOrigin[1];
				//JB
	SVGSix.setAttribute("fill",wDefaultColor);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                newPlotSixId, SVGSix);
        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                fineness,newPlotSixId, SVGSix);

				//JB
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
        //console.log("minXData " + minXData + " maxXData " + maxXData);
        //
        // Add legend annotation:


        var lam0lbl = (1.0e7 * lam0).toPrecision(3);
        var lam0Str = lam0lbl.toString();
        var thetN = 180.0 * Math.acos(cosTheta[1][5]) / Math.PI;
        var thetNlbl = thetN.toPrecision(5);
        var thetNStr = thetNlbl.toString();
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
				//JB
        txtPrint("<span style='font-size:small'><span><em>F</em><sub>&#955</sub>, <em>&#955</em><sub>0</sub> = " + lam0Str + " nm</span><br /> ",
                titleOffsetX, titleOffsetY + 35, lineColor, newPlotSixId);

				//JB
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
				//JB
        yShift = XBar(one, minYData, maxYData, barWidth, barHeight,
                xFinesse, RGBHexc, newPlotSixId, SVGSix);

        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Spectral_line' target='_blank'>2-level atom: Spectral line profile </a></span>",
                titleOffsetX, titleOffsetY, lineColor, newPlotSixId);
				//JB
// Equivalent width:
    roundNum = Wlambda.toFixed(2);
					//JB
    txtPrint("<span style='font-size:small' title='Equivalent width: A measure of spectral line strength'>\n\
<a href='http://en.wikipedia.org/wiki/Equivalent_width' target='_blank'>W<sub><em>&#955</em></sub></a>: \n\
</span>"
            + roundNum
            + " <span style='font-size:small' title='picometers'>\n\
<a href='http://en.wikipedia.org/wiki/Picometre' target='_blank'>pm</a>\n\
</span>",
            titleOffsetX+250, titleOffsetY, lineColor, newPlotSixId);
					//JB
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

                      //JB



        for (var i = 0; i < numPoints; i++) {


            lnFlx[i] = lineFlux2[0][i]; // / fluxCont  lineFLux2 now continuum rectified 
            // lnInt0[i] = lineIntens[i][5] / lineIntens[numPoints - 1][5];
            // lnIntN[i] = lineIntens[i][numThetas - 2] / lineIntens[numPoints - 1][numThetas - 2];
            // w.r.t. line center lambda
            //lnLam[i] = 1.0e7 * (lineLambdas[i] - lam0);
            lnLam[i] = 1.0e7 * (linePoints[0][i]);
            //console.log("PLOT SIX: i " + i + " linePoints[i] " + linePoints[0][i] + " lnLam[i] " + lnLam[i] + " lnFlx[i] " + lnFlx[i]);
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

//console.log(arrayLambda);

/*counters for the iterations of the following loop and the number
 * of times the if statement is entered (to know how far
 * along the second half of the spectral line we are)
*/
var iterCounter = 0;
var ifCounter =0;

        for (var i = iStart; i < iStop; i++) {

            xTickPosCnvs = xAxisLength * (lnLam[i] - minXData) / rangeXData; // pixels  

            // horizontal position in pixels - data values increase rightward:

            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            yTickPosCnvs = yAxisLength * (lnFlx[i] - minYData) / rangeYData;
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

				//JB
	    var pline = document.createElementNS(xmlW3,'polyline');
	    pline.setAttribute('stroke',lineColor);
	    pline.setAttribute('points',lastXShiftCnvs+","+lastYShiftCnvs+" "+xShiftCnvs+","+yShiftCnvs+" ");
	    pline.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
	    SVGSix.appendChild(pline);

      
//plots dots along the polyline
          var dot = document.createElementNS(xmlW3,'circle');
          dot.setAttribute('cx',xShiftCnvs);
            dot.setAttribute('cy',yShiftCnvs);
            dot.setAttribute('r',"4");
            dot.setAttribute('fill',"none");
          dot.setAttribute('stroke-width',"3");
//console.log(iStart);
//console.log(iStop);



//set the color of the circle to be getting darker toward the center (works)
           dot.setAttribute('stroke',arrayLambda[iterCounter]);

/*if there is an odd number of points on the line, add one to lineCenter
 * after the integer division. this determines how many times the loop
 * iterates.
*/
var mid = (iStop-iStart)/2;

//check if iStop is odd
      if((iStop-iStart) % 2 != 0){
              mid = Math.floor((iStop-iStart)/2)+1;
      }

//console.log(mid);
//console.log(iterCounter);

//after the center circle, loop through the array holding the colors backwards
      if(iterCounter>=mid){
//            console.log(ifCounter);
                  dot.setAttribute('stroke',arrayLambda[mid-ifCounter]);
              ifCounter++;
      }

          dot.setAttribute('id',"dotP6 "+i);
            dot.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);

          SVGSix.appendChild(dot);

iterCounter += 1;
//counter ++;

				//JB
            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
            //lastYShift0 = yShift0;
            //lastYShiftN = yShiftN;
        }

/*to account for the fact that UPON MOVEMENT IN THE SVG,
 * A NEW TEXT ELEMENT IS CREATED UP TO N TIMES WHERE N
 *  IS THE NUMBER TIMES THE MODEL BUTTON HAS BEEN PRESSED SINCE
 *  THE CACHE WAS CLEARED, these variables were created to keep
 *  track of the single text element that is wanted to display
 *  the coordinates.
*/


      var nTextsP6 = 0;//document.getElementsByName("subtextP6").length;

// text element that holds the x and y coordinates of the cursor on the SVG

      var textP6 = document.createElementNS(xmlW3,'text');
      textP6.setAttribute('x',325);
        textP6.setAttribute('y',325);
        textP6.setAttribute('font-size',"10");
      textP6.setAttribute('id',"subtextP6");
      textP6.setAttribute('name',"subtextP6");
      textP6.textContent=("(?,?)");
      textP6.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
      SVGSix.appendChild(textP6);
//function to convert x and y values from the loop into text
      function convertTextP6(X,Y){
      //var X = x;
      //var Y = y;
      if(X!=0){
      nTextsP6 = document.getElementsByName("subtextP6").length;

      //var wantedText = document.getElementsByName("subtextP6")[0];
      //console.log(nTexts);
      //console.log(document.getElementsByName("subtextP6"));
      if(nTextsP6==1){
      document.getElementsByName("subtextP6")[0].textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      
      SVGSix.appendChild(textP6);
      
      }else if(nTextsP6>1){
      for(var i = 0; i < nTextsP6; i++){
      var extraText = document.getElementsByName("subtextP6")[i];
//For some reason, deleteing the textbox does not work...
      //$("#SVGSix").remove("#"+extraText.id.toString());
//but setting the text to nothing does...     
      extraText.textContent="";
      //nTexts = document.getElementsByName("subtextP6").length;      
      SVGSix.appendChild(textP6);
      }//end for loop

      document.getElementsByName("subtextP6")[0].textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      
      SVGSix.appendChild(textP6);
      }//end else if
      
      
      }else{
        
      //var wantedText = document.getElementsByName("subtextP6")[0];
      document.getElementsByName("subtextP6")[0].textContent="(?,?)";
        SVGSix.appendChild(textP6);
//    newPlotSixId.appendChild(SVGSix);
//    document.body.appendChild(newPlotSixId);
      }//end else
      }//end function

//console.log(minXData);
//console.log(maxXData);

//variables created specifcally for this plot
var minXP6 = minXData;
var maxXP6 = maxXData;
var minYP6 = minYData;
var maxYP6 = maxYData;

//these scales determine the number of units per pixel in x and y
var scaleXPxP6 = Math.abs((maxXP6-minXP6)/xAxisLength) ;
//var offsetXP6 = ($("#SVG6").offset().left)+xAxisXCnvs;
var scaleYPxP6 = (maxYP6-minYP6)/yAxisLength ;
//var offsetYP6 = ($("#SVG6").offset().top+yAxisYCnvs);


/*event listeners created to change the text content to the x and y position of 
 * the mouse (in units on the plot) of the text element.
*/

      SVGSix.addEventListener("mousemove",function(){convertTextP6(minXP6+scaleXPxP6*(event.offsetX-xAxisXCnvs), minYP6+scaleYPxP6*(-event.offsetY+yAxisYCnvs+yAxisLength));});
      SVGSix.addEventListener("mouseout",function(){convertTextP6(0,0);});
                                      //JB



}


//
//
//  *****   PLOT EIGHT / PLOT 8
//
//
// Plot eight - 2-level atom E-level diagram for ionization stage and excitation level selected
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
        // Row 5: triply ionized stage ground state population
        // Row 6: quadruply ionized stage ground state population
        //minXData = Math.min(logNums[0][tTau1], logNums[1][tTau1], logNums[4][tTau1]); 
        maxXData = Math.max(logNums[0][tTau1], logNums[1][tTau1], logNums[4][tTau1]);
        minXData = logE * minXData; 
        maxXData = logE * maxXData; 
        //maxXData = 15.0; 
        //minXData = 0.0;

        var xAxisName = "<span title='Logarithmic number density of particles in lower E-level of b-b transition at <em>&#964</em>_Ros=1'>Log<sub>10</sub> <em>N</em><sub>l</sub>(<em>&#964</em><sub>Ros</sub>=1) cm<sup>-3</sup></span>";
        var minYData = 0.0;
        //if (ionized) {
        //    var maxYData = chiI1 + chiU + 1.0; //eV
        //} else {
        //    var maxYData = chiI1 + 1.0;
        //}
        var maxYData = chiI1+chiI2;

        var yAxisName = "<span title='Atomic excitation energy'><a href='http://en.wikipedia.org/wiki/Excited_state' target='_blank'>Excitation<br /> E</a> (<a href='http://en.wikipedia.org/wiki/Electronvolt' target='_blank'>eV</a>)</span>";
        //(xRange, xOffset, yRange, yOffset, wDefaultColor, plotEightId);

        var fineness = "coarse";
        //var cnvsCtx = washer(plotRow, plotCol, wDefaultColor, plotEightId, cnvsId);
					//JB
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, newPlotEightId, SVGEight);
					//JB
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
				//JB
	SVGEight.setAttribute('fill',wDefaultColor);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                newPlotEightId, SVGEight);
        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                fineness,newPlotEightId, SVGEight);
				//JB
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
					//JB
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Grotrian_diagram' target='_blank'>2-level atom: E-level diagram</a></span>",
                titleOffsetX, titleOffsetY, lineColor, newPlotEightId);

					//JB
    
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
            var tickWidthPops = 4;
        xFinesse = 0;
        yFinesse = 0;
        var yShiftL = 0;
        var yShiftU = 0;
        for (var i = 0; i < yData.length; i++) {

            ii = 1.0 * i;

        //barHeight = 1.0;
        //barWidth = xRange;
					//JB
            yShift = XBar(yData[i], minYData, maxYData, xAxisLength, tickLength,
                xFinesse, lineColor, newPlotEightId, SVGEight);
					//JB
            // Now over-plot with the width of the "y-tickmark" scaled by the 
            // log number density in each E-level:
            //var xRangePops = Math.floor(xRange * (logE*logNums[lPoint[i]][tTau1] / maxXData));
            var xRangePops = Math.floor(xAxisLength * ( (logE * logNums[i][tTau1] - minXData) / (maxXData - minXData)));
            var tickWidthPops = 6;

 // Energy level logarithmic population horizontal bars:
					//JB
           yShift = XBar(yData[i], minYData, maxYData, xRangePops, tickWidthPops,
                    xFinesse, RGBHex, newPlotEightId, SVGEight);
					//JB
// yShift values for b-b transtion marker: 
           if (i === 2){
              yShiftL = yShift;  //lower transition level
                      }
           if (i === 3){
              yShiftU = yShift;  //lower transition level
                      }
            //Make the y-tick label:
				//JB
           txtPrint(yRightTickValStr[i], yRightLabelXOffset[i],
                yShift, lineColor, newPlotEightId);
				//JB
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
        var vBarWidth = 4; //pixels 
        var yFinesse = Math.floor(yShiftL - yAxisYCnvs);
					//JB

        xShiftDum = YBar(xTickPosCnvs, minXData, maxXData, vBarWidth, vBarHeightCnvs,
                         yFinesse, RGBHex, newPlotEightId, SVGEight);

					//JB
    }


//
//
//  *****   PLOT TWO / PLOT 2
//
//

// Plot two: log(Tau) vs Temp
// 
    if ((ifLineOnly === false) && (ifShowAtmos === true)) {

        var plotRow = 2;
        var plotCol = 2;
        var minXData = logE * tauRos[1][0];
        var maxXData = logE * tauRos[1][numDeps - 1];
        var xAxisName = "<span title='Rosseland mean optical depth'><a href='http://en.wikipedia.org/wiki/Optical_depth_%28astrophysics%29' target='_blank'>Log<sub>10</sub> <em>&#964</em><sub>Ros</sub></a></span>";
        var minYData = temp[0][0];
        var maxYData = temp[0][numDeps - 1];
        var yAxisName = "<em>T</em><sub>Kin</sub> (K)";
        var fineness = "normal";
					//JB
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, newPlotTwoId, SVGTwo);
					//JB
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
					//JB
	SVGTwo.setAttribute('fill',wDefaultColor);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                newPlotTwoId, SVGTwo);
            var cnvsCtx = xAxisParams[8];
            var yAxisParams = YAxis(panelX, panelY, minYData, maxYData, yAxisName,fineness,newPlotTwoId, SVGTwo);
                                                
					//JB

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
					//JB
        xShift = YBar(logE * tauRos[1][tTau1], minXData, maxXData, barWidth, yAxisLength,
                yFinesse, barColor, newPlotTwoId, SVGTwo);

        yShift = XBar(temp[0][tTau1], minYData, maxYData, xAxisLength, barHeight,
                xFinesse, barColor, newPlotTwoId, SVGTwo);
        barHeight = 1.0;
        // Add label
                 txtPrint("<span style='font-size:small; color:#444444'><em>&#964</em><sub>Ros</sub>=1</span>", xShift, yShift, lineColor, newPlotTwoId);
					//JB

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


					//JB
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
        txtPrint("<span style='font-size:normal; color:blue'>Gas temperature </span>",
                titleOffsetX, titleOffsetY, lineColor, newPlotTwoId);
					//JB
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


                              //JB
// text element that holds the x and y coordinates of the cursor on the SVG
      var textP2 = document.createElementNS(xmlW3,'text');
      textP2.setAttribute('x',325);
      textP2.setAttribute('y',325);
      textP2.setAttribute('font-size',"10");
      textP2.setAttribute('id',"subtextP2");
      textP2.setAttribute('name',"subtextP2");
      textP2.textContent=("(?,?)");
      textP2.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
      SVGTwo.appendChild(textP2);

/*to account for the fact that UPON MOVEMENT IN THE SVG,
 * A NEW TEXT ELEMENT IS CREATED UP TO N TIMES WHERE N
 *  IS THE NUMBER TIMES THE MODEL BUTTON HAS BEEN PRESSED SINCE
 *  THE CACHE WAS CLEARED, these variables were created to keep
 *  track of the single text element that is wanted to display
 *  the coordinates.
*/


      var nTextsP2 = 0;//document.getElementsByName("subtextP6").length;

//function to convert x and y values from the loop into text
      function convertTextP2(X,Y){
      //var X = x;
      //var Y = y;
      if(X!=0){
      nTextsP2 = document.getElementsByName("subtextP2").length;

      //var wantedText = document.getElementsByName("subtextP6")[0];
      //console.log(nTexts);
      //console.log(document.getElementsByName("subtextP6"));
      if(nTextsP2==1){
      document.getElementsByName("subtextP2")[0].textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      
      SVGTwo.appendChild(textP2);
      
      }else if(nTextsP2>1){
      for(var i = 0; i < nTextsP2; i++){
      var extraText = document.getElementsByName("subtextP2")[i];
//For some reason, deleteing the textbox does not work...
      //$("#SVGSix").remove("#"+extraText.id.toString());
//but setting the text to nothing does...     
      extraText.textContent="";
      //nTexts = document.getElementsByName("subtextP6").length;      
      SVGTwo.appendChild(textP2);
      }//end for loop

      document.getElementsByName("subtextP2")[0].textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      
      SVGTwo.appendChild(textP2);
      }//end else if
      
      
      
      }else{
        
      //var wantedText = document.getElementsByName("subtextP6")[0];
      document.getElementsByName("subtextP2")[0].textContent="(?,?)";
        SVGTwo.appendChild(textP2);
//    newPlotSixId.appendChild(SVGSix);
//    document.body.appendChild(newPlotSixId);
      }//end else
      }//end function



//console.log(minXData);
//console.log(maxXData);

//variables needed for this specific plot
var minXP2 = minXData;
var maxXP2 = maxXData;
var minYP2 = minYData;
var maxYP2 = maxYData;

//these scales determine the number of units per pixel in x and y
var scaleXPxP2 = Math.abs((maxXP2-minXP2)/xAxisLength) ;
//var offsetXP2 = ($("#SVG2").offset().left)+xAxisXCnvs;
var scaleYPxP2 = (maxYP2-minYP2)/yAxisLength ;
//var offsetYP2 = (-event.offsetY+yAxisYCnvs+yAxisLength);

/*create evernts that change the text content of the text element
 * on mouse movement
*/

      SVGTwo.addEventListener("mousemove",function(){convertTextP2(minXP2+scaleXPxP2*(event.offsetX-xAxisXCnvs), minYP2+scaleYPxP2*(-event.offsetY+yAxisYCnvs+yAxisLength));});
      
      SVGTwo.addEventListener("mouseout",function(){convertTextP2(0, 0);});
                                      //JB

//JB
//array to hold the indacies that make logTau[i][] closest to 0
var indacies = [];
//JB
       for (var i = 0; i < numDeps; i++) {
              

            ii = 1.0 * i;
            var xTickPosCnvs = xAxisLength * (logE * tauRos[1][i] - minXData) / rangeXData; // pixels   

            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            var yTickPosCnvs = yAxisLength * (temp[0][i] - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

        //create circles (not colored)
	    var points = document.createElementNS(xmlW3,'circle');
	    points.setAttribute('cx',xShiftCnvs);
            points.setAttribute('cy',yShiftCnvs);
            points.setAttribute('r',dSizeCnvs);
            points.setAttribute('fill',lineColor);
	    points.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
	    SVGTwo.appendChild(points);
//line plot

//create polyline for the graph
	    var pline = document.createElementNS(xmlW3,'polyline');
	    pline.setAttribute('stroke',lineColor);
//set the points that the line will follow
            pline.setAttribute('points',(lastXShiftCnvs+","+lastYShiftCnvs+" "+xShiftCnvs+","+yShiftCnvs+" "));
            pline.setAttribute('fill',"none");
	    pline.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
	    SVGTwo.appendChild(pline);

            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;

        }


/*create array of indacies that have a log(tau) values close to 0
 *  for every numPoint.
*/
      for(var j = 0; j < numPoints; j ++){
      //console.log(logTauL[i][j]);
      indacies.push(tauPointP2(numDeps, logTauL, j, 0));
      }

//console.log(numPoints);

//if($("#linePlot").is(':checked')){

    if (ifShowLine === true) {
/*find the middle iteration of the value j in the loop 
 *(the middle of iStart and iStop)
*/
var mid2  = iStart+(iStop-iStart)/2;
if((iStop-iStart)%2!=0){
mid2 = Math.floor(((iStop-iStart)/2))+1+iStart;
}     
var counter2 = 0;
var lastX = 0;
var lastY = 0;
        for(var j = iStart; j <= mid2; j ++){ 


            jj = 1.0 * j;
           // var cosFctr = cosTheta[1][i];
            var dpthIndx = indacies[j];
            var xTickPosCnvs = xAxisLength * (logE * tauRos[1][dpthIndx] - minXData) / rangeXData; // pixels   

            // horizontal position in pixels - data values increase rightward:
            //var xShift = xOffset + xTickPos;
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;// + 200;
            ////stringify and add unit:
            var yTickPosCnvs = yAxisLength * (temp[0][dpthIndx] - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;



/*for each index in indacies (or at least the ones use to create the 
 *spectral line in Plot 2), create an open circle on the plot with the
 *same color as that in Plot 2 for corresponding indacies.
*/
      if(lastY!=yShiftCnvs){
          var pointsC = document.createElementNS(xmlW3,'circle');
          pointsC.setAttribute('cx',xShiftCnvs);
            pointsC.setAttribute('cy',yShiftCnvs);
            pointsC.setAttribute('r','5');
          //pointsC.setAttribute('stroke',arrayLambda[j-iStart]);
          pointsC.setAttribute('stroke-width',"2.2");
          pointsC.setAttribute('fill',"none");
          //console.log(counter2);
/*set color of the stroke equal to the kth color in arrayLambda,
 * starting from k=0.
*/
            pointsC.setAttribute('stroke',arrayLambda[counter2]);
          pointsC.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
          SVGTwo.appendChild(pointsC);
      }

lastX = xShiftCnvs;
lastY = yShiftCnvs;
counter2 +=1;

      }

}

//console.log(indacies);



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

                                //JB
        //create colored dots
	    var cDot = document.createElementNS(xmlW3,'circle');
	    cDot.setAttribute('cx',xShiftCnvs);
            cDot.setAttribute('cy',yShiftCnvs);
            cDot.setAttribute('r',dSizeCnvs);
            cDot.setAttribute('fill',RGBHex);
	    cDot.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
	    SVGTwo.appendChild(cDot);
        }

// legend using dot of last color in loop directly above:
                              
                              //JB
//create a single dot for the legend  (based on Plot 7)
            var dotL = document.createElementNS(xmlW3,'circle');
            dotL.setAttribute('cx',titleOffsetX + 365);
            dotL.setAttribute('cy',titleOffsetY+10);
            dotL.setAttribute('r',dSizeCnvs);
            dotL.setAttribute('fill',RGBHex);
            dotL.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            SVGTwo.appendChild(dotL);

//create a single dot for the legend  (based on Plot 6)
            var dotL2 = document.createElementNS(xmlW3,'circle');
            dotL2.setAttribute('cx',titleOffsetX + 365);
            dotL2.setAttribute('cy',titleOffsetY+35);
            dotL2.setAttribute('r',dSizeCnvs);
            dotL2.setAttribute('fill',arrayLambda[0]);
            dotL2.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            SVGTwo.appendChild(dotL2);
                              //JB
                              


					//JB
        txtPrint("<span title='Limb darkening depths of &#964_Ros(&#952) = 1'><em>&#964</em><sub>Ros</sub>(0 < <em>&#952</em> < 90<sup>o</sup>) = 1</span>",
                titleOffsetX + 200, titleOffsetY, lineColor, newPlotTwoId);
//legend for the colored dots corresponding with the spectral line (Plot 6)
        txtPrint("<span title='Limb darkening depths of &#964_Ros(&#952) = 1'>Specral Line <em>&#964</em><sub>&#955</sub>= 1</span>",
                titleOffsetX + 200, titleOffsetY+25, lineColor, newPlotTwoId);




					//JB
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

//background color needs to be finessed so that white-ish stars will stand out:
       if (teff > 6000.0){
  //hotter white or blue-white star - darken the background (default background in #F0F0F0
           wDiskColor = "#808080";  
       } else {
           wDiskColor = wDefaultColor;
       }

        // Calculation of steam line and ice line:

        //Assuming liquid salt-free water at one atmospheric pGasressure is necessary:
        //var atmosPres = 101.0;  // test - kPa
//        var steamTemp = waterPhase(atmosPress);
       var steamTemp = solventPhase(atmosPress, phaseA, phaseB, phaseC);
        //console.log("steamTemp " + steamTemp); // + " steamTemp2 " + steamTemp2);
        //var steamTemp = 373.0; // K = 100 C
        //var iceTemp = 273.0; //K = 0 C
        var iceTemp = tripleTemp; 

        steamTemp = steamTemp - greenHouse;
        iceTemp = iceTemp - greenHouse;
        var logSteamLine, logIceLine;
        var au = 1.4960e13; // 1 AU in cm
        var rSun = 6.955e10; // solar radii to cm
        var log1AULine = logAu - logRSun; // 1 AU in solar radii
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
        var steamTempRound = steamTemp.toPrecision(3);

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
        var radiusPx1AU = logScale * logTen(radiusScale * radius * Math.exp(log1AULine));
        radiusPx1AU = Math.ceil(radiusPx1AU);
    //console.log("radius " + radius + " radiusPx " + radiusPx + " radiusPxSteam " + radiusPxSteam + " radiusPxIce " + radiusPxIce + " radiusPx1AU " + radiusPx1AU)
        // Key radii in order of *DECREASING* size (important!):
        var numZone = 7;
        var radii = [];
        radii.length = numZone;
// Safety defaults:
        radii = [radiusPx1AU, radiusPx1AU, radiusPx1AU, radiusPx1AU, radiusPx1AU, radiusPx1AU, radiusPx1AU]
        rrI = saveRGB[0];
        ggI = saveRGB[1];
        bbI = saveRGB[2];
        var starRGBHex = "rgb(" + rrI + "," + ggI + "," + bbI + ")";
        var colors = [];
        colors.length = numZone;

        if (radiusPx1AU >= (radiusPxIce + 3)){
           radii = [radiusPx1AU+1, radiusPx1AU, radiusPxIce + 3, radiusPxIce, radiusPxSteam, radiusPxSteam - 3, radiusPx];
           colors = ["#000000", wDiskColor, "#0000FF", "#00FF88", "#FF0000", wDiskColor, starRGBHex];
        }
        if ( (radiusPx1AU >= radiusPxIce) && (radiusPx1AU < (radiusPxIce + 3)) ){
           radii = [radiusPxIce + 3, radiusPx1AU, radiusPx1AU-1, radiusPxIce, radiusPxSteam, radiusPxSteam - 3, radiusPx];
           colors = ["#0000FF", "#000000", "#0000FF", "#00FF88", "#FF0000", wDiskColor, starRGBHex];
        }
        if ( (radiusPx1AU >= radiusPxSteam) && (radiusPx1AU < radiusPxIce) ){
           radii = [radiusPxIce + 3, radiusPxIce, radiusPx1AU+1, radiusPx1AU, radiusPxSteam, radiusPxSteam - 3, radiusPx];
           colors = ["#0000FF", "#00FF88", "#000000", "#00FF88", "#FF0000", wDiskColor, starRGBHex];
        }
        if ( (radiusPx1AU >= (radiusPxSteam - 3)) && (radiusPx1AU < radiusPxSteam) ){
           radii = [radiusPxIce + 3, radiusPxIce, radiusPxSteam, radiusPx1AU+1, radiusPx1AU, radiusPxSteam - 3, radiusPx];
           colors = ["#0000FF", "#00FF88", "#FF0000", "#000000", "#FF0000", wDiskColor, starRGBHex];
        }
        if ( (radiusPx1AU >= radiusPx) && (radiusPx1AU < (radiusPxSteam - 3)) ){
           radii = [radiusPxIce + 3, radiusPxIce, radiusPxSteam, radiusPxSteam - 3, radiusPx1AU, radiusPx1AU-1,  radiusPx];
           colors = ["#0000FF", "#00FF88", "#FF0000", wDiskColor, "#000000", wDiskColor, starRGBHex];
        }
        if (radiusPx1AU <= radiusPx){
           radii = [radiusPxIce + 3, radiusPxIce, radiusPxSteam, radiusPxSteam - 3, radiusPx, radiusPx1AU, radiusPx1AU-1];
           colors = ["#0000FF", "#00FF88", "#FF0000", wDiskColor, starRGBHex, "#000000", starRGBHex];
        }
     //console.log("radii " + radii)
        //
        //var titleYPos = xLowerYOffset - yRange + 40;
					//JB
      var panelOrigin = washer(plotRow, plotCol, wDiskColor, newPlotElevenId, SVGEleven);
					//JB
	panelX = panelOrigin[0];
        panelY = panelOrigin[1];
	SVGEleven.setAttribute('fill',wDiskColor);
        // Add title annotation:

        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
			//JB
      
        txtPrint("<span style='font-size:normal; color:blue' title='Assumes liquid salt-free water at one Earth atmosphere pressure needed for life'><a href='https://en.wikipedia.org/wiki/Circumstellar_habitable_zone' target='_blank'>Life zone for habitable planets</a></span><br />\n\
     <span style='font-size:small'>(Logarithmic radius)</span>",
                titleOffsetX, titleOffsetY, lineColor, newPlotElevenId);
        var legendY = titleOffsetY;
        var legendX = titleOffsetX + 320;
        txtPrint("<span style='font-size:small'>"
                + " <span style='color:#FF0000'>Steam line</span> " + steamLineAU + " <a href='https://en.wikipedia.org/wiki/Astronomical_unit' title='1 AU = Earths average distance from center of Sun'> AU</a><br /> "
                + " <span style='color:#00FF88'><strong>Life zone</strong></span><br /> "
                + " <span style='color:#0000FF'>Ice line</span> " + iceLineAU + " <a href='https://en.wikipedia.org/wiki/Astronomical_unit' title='1 AU = Earths average distance from center of Sun'> AU</a><br /> " 
                + " <span style='color:#000000'>Reference line: 1 <a href='https://en.wikipedia.org/wiki/Astronomical_unit' title='1 AU = Earths average distance from center of Sun'>AU</a></span>",
                legendX, legendY, lineColor, newPlotElevenId);
//
        txtPrint("<span style='font-size:small'>" + solvent + " boiling temp = " + steamTempRound + " K</span>", 
          (legendX-75), (legendY+300), lineColor, newPlotElevenId);
        //Get the Vega-calibrated colors from the intensity spectrum of each theta annulus:    
        // moved earlier var intcolors = iColors(lambdaScale, intens, numDeps, numThetas, numLams, tauRos, temp);
			//JB

        //  Loop over radial zones - largest to smallest
        for (var i = 0; i < radii.length; i++) {
   // for (var i = parseFloat(radii.length); i > 2; i--) {
       //console.log(i, radii[i])
            var radiusStr = numToPxStrng(radii[i]);
            // Adjust position to center star:
            // Radius is really the *diameter* of the symbol

// Adjust position to center star:
// Radius is really the *diameter* of the symbol
            var yCenterCnvs = panelHeight / 2; 
            var xCenterCnvs = panelWidth / 2; 
				
				//JB
		
		var circ = document.createElementNS(xmlW3,'circle');
		//cric.setAttribute('id',"circ"+i);
		circ.setAttribute('cx',xCenterCnvs);
                circ.setAttribute('cy',yCenterCnvs);
		circ.setAttribute('r',radii[i]-33);
		circ.setAttribute('fill',colors[i]);
		circ.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
		SVGEleven.appendChild(circ);
				
//console.log(radii[i]-33);
				//JB
				
        }  //i loop (thetas)

    }
					

// ****************************************
    //
    //
    //  *****   PLOT FOURTEEN / PLOT 14
    //

    // Plot fourteen : log(Tau) vs log(kappa)
    // 
    if ((ifLineOnly === false) && (ifShowAtmos === true)) {
//
        var plotRow = 4;
        var plotCol = 2;
        var minXData = logE * tauRos[1][0] - 0.0;
        var maxXData = logE * tauRos[1][numDeps - 1];
        var xAxisName = "<span title='Rosseland mean optical depth'><a href='http://en.wikipedia.org/wiki/Optical_depth_%28astrophysics%29' target='_blank'>Log<sub>10</sub> <em>&#964</em><sub>Ros</sub></a></span>";
        // Don't use upper boundary condition as lower y-limit - use a couple of points below surface:
        //var numYTicks = 6;
        // Build total P from P_Gas & P_Rad:

        //var minYData = logE * kappaRos[1][1] - 1.0; // Avoid upper boundary condition [i]=0
        //var maxYData = logE * kappaRos[1][numDeps - 1];
        var minYData = logE*logKappa[numLams-10][4];
        var maxYData = logE*logKappa[10][numDeps-2];
        var yAxisName = "Log<sub>10</sub> <em>&#954<sub>&#955</sub></em> <br />(cm<sup>2</sup> g<sup>-1</sup>)";

        var fineness = "normal";
				//JB
	        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, newPlotFourteenId, SVGFourteen);

				//JB        
panelX = panelOrigin[0];
        panelY = panelOrigin[1];
				//JB
        SVGFourteen.setAttribute('fill',wDefaultColor); 
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                newPlotFourteenId, SVGFourteen);
				//JB
        //xOffset = xAxisParams[0];
        var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        //yOffset = xAxisParams[4];
        var xLowerYOffset = xAxisParams[5];
        minXData = xAxisParams[6]; //updated value
        maxXData = xAxisParams[7]; //updated value
			//JB
	        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                fineness,newPlotFourteenId, SVGFourteen);
			//JB
        var rangeYData = yAxisParams[1];
        var deltaYData = yAxisParams[2];
        var deltaYPxl = yAxisParams[3];
        minYData = yAxisParams[6]; //updated value
        maxYData = yAxisParams[7]; //updated value 

        yFinesse = 0;       
        xFinesse = 0;       
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
				//JB
        txtPrint("log<sub>10</sub> <a href='https://en.wikipedia.org/wiki/Absorption_(electromagnetic_radiation)' title='mass extinction coefficient' target='_blank'>Extinction</a>",
                titleOffsetX, titleOffsetY, lineColor, newPlotFourteenId);
        txtPrint("<span style='font-size:small'>"
                + "<span><em>&#954</em><sub>Ros</sub></span>,  "
                + " <span style='color:#0000FF'><em>&#954<sub>&#955</sub></em> 360 nm</span>,  "
                + " <span style='color:#00FF00'><em>&#954<sub>&#955</sub></em> 500 nm</span>,  "
               // + " <span style='color:#FF0000'><em>&#954<sub>&#955</sub></em> 1640 nm</span> ",
                + " <span style='color:#FF0000'><em>&#954<sub>&#955</sub></em> 1000 nm</span> ",
                   titleOffsetX, titleOffsetY+35, lineColor, newPlotFourteenId);
               			//JB
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

       var it360 = lamPoint(numLams, lambdaScale, 1.0e-7*360.0);
       var it500 = lamPoint(numLams, lambdaScale, 1.0e-7*500.0);
//Good odea, but spectrum currently doesn't go out this far:
       //var it1600 = lamPoint(numLams, lambdaScale, 1.0e-7*1642.0);
       var it1000 = lamPoint(numLams, lambdaScale, 1.0e-7*1000.0);

        var ii;
            var xTickPosCnvs = xAxisLength * (logE * tauRos[1][0] - minXData) / rangeXData; // pixels   
            // horizontal position in pixels - data values increase rightward:
            var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
            // vertical position in pixels - data values increase upward:
            var yTickPosCnvs = yAxisLength * (logE * kappaRos[1][0] - minYData) / rangeYData;
            var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
            var yTickPosCnvs360 = yAxisLength * (logE * logKappa[it360][0] - minYData) / rangeYData;
            var lastYShiftCnvs360 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs360;
            var yTickPosCnvs500 = yAxisLength * (logE * logKappa[it500][0] - minYData) / rangeYData;
            var lastYShiftCnvs500 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs500;
           // var yTickPosCnvs1600 = yAxisLength * (logE * logKappa[it1600][0] - minYData) / rangeYData;
           // var lastYShiftCnvs1600 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs1600;
            var yTickPosCnvs1000 = yAxisLength * (logE * logKappa[it1000][0] - minYData) / rangeYData;
            var lastYShiftCnvs1000 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs1000;





        for (var i = 1; i < numDeps; i++) {

            ii = 1.0 * i;
            var xTickPosCnvs = xAxisLength * (logE * tauRos[1][i] - minXData) / rangeXData; // pixels   

            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            // vertical position in pixels - data values increase upward:
            var yTickPosCnvs = yAxisLength * (logE * kappaRos[1][i] - minYData) / rangeYData;
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
            var yTickPosCnvs360 = yAxisLength * (logE * logKappa[it360][i] - minYData) / rangeYData;
            var yShiftCnvs360 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs360;
            var yTickPosCnvs500 = yAxisLength * (logE * logKappa[it500][i] - minYData) / rangeYData;
            var yShiftCnvs500 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs500;
            //var yTickPosCnvs1600 = yAxisLength * (logE * logKappa[it1600][i] - minYData) / rangeYData;
            //var yShiftCnvs1600 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs1600;
            var yTickPosCnvs1000 = yAxisLength * (logE * logKappa[it1000][i] - minYData) / rangeYData;
            var yShiftCnvs1000 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs1000;

 //console.log("i " + i + " lastXShiftCnvs " + lastXShiftCnvs);

//log kappa_Ros
//line plot
				//JB
	    var line = document.createElementNS(xmlW3,'polyline');
	    line.setAttribute('stroke',lineColor);
            line.setAttribute('points',(lastXShiftCnvs+","+lastYShiftCnvs+" "+xShiftCnvs+","+yShiftCnvs+" "));
            line.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
	    SVGFourteen.appendChild(line);
				//JB
//log kappa_lambda = 360 nm
				//JB
            var line2 = document.createElementNS(xmlW3,'polyline');
            line2.setAttribute('stroke',"blue");
            line2.setAttribute('points',(lastXShiftCnvs+","+lastYShiftCnvs360+" "+xShiftCnvs+","+yShiftCnvs360+" "));
            line2.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            SVGFourteen.appendChild(line2);
				//JB
//log kappa_lambda = 500 nm
				//JB
            var line3 = document.createElementNS(xmlW3,'polyline');
            line3.setAttribute('stroke',"#00FF00");
            line3.setAttribute('points',(lastXShiftCnvs+","+lastYShiftCnvs500+" "+xShiftCnvs+","+yShiftCnvs500+" "));
            line3.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            SVGFourteen.appendChild(line3);
				//JB
//log kappa_lambda = 1600 nm
				//JB
            var line4 = document.createElementNS(xmlW3,'polyline');
            line4.setAttribute('stroke',"red");
            line4.setAttribute('points',(lastXShiftCnvs+","+lastYShiftCnvs1000+" "+xShiftCnvs+","+yShiftCnvs1000+" "));
            line4.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            SVGFourteen.appendChild(line4);
				//JB
            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
            lastYShiftCnvs360 = yShiftCnvs360;
            lastYShiftCnvs500 = yShiftCnvs500;
            //lastYShiftCnvs1600 = yShiftCnvs1600;
            lastYShiftCnvs1000 = yShiftCnvs1000;
        }

// Tau=1 cross-hair

        var barWidth = 1.0;
        var barColor = "#777777";
					//JB
        var xShift = YBar(logE * tauRos[1][tTau1], minXData, maxXData, barWidth, yAxisLength,
                yFinesse, barColor, newPlotFourteenId, SVGFourteen);

        var barHeight = 1.0;
        var yShift = XBar(logE * kappaRos[1][tTau1], minYData, maxYData, xAxisLength, barHeight,
                xFinesse, barColor, newPlotFourteenId, SVGFourteen);
        txtPrint("<span style='font-size:small; color:#444444'><em>&#964</em><sub>Ros</sub>=1</span>",
                xShift, yShift, lineColor, newPlotFourteen);
					//JB

// text element that holds the x and y coordinates of the cursor on the SVG
      var textP14 = document.createElementNS(xmlW3,'text');
      textP14.setAttribute('x',325);
        textP14.setAttribute('y',325);
        textP14.setAttribute('font-size',"10");
      textP14.setAttribute('id',"subtextP14");
      textP14.setAttribute('name',"subtextP14");
      textP14.textContent=("(?,?)");
      textP14.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
      SVGFourteen.appendChild(textP14);


/*to account for the fact that UPON MOVEMENT IN THE SVG,
 * A NEW TEXT ELEMENT IS CREATED UP TO N TIMES WHERE N
 *  IS THE NUMBER TIMES THE MODEL BUTTON HAS BEEN PRESSED SINCE
 *  THE CACHE WAS CLEARED, these variables were created to keep
 *  track of the single text element that is wanted to display
 *  the coordinates.
*/


      var nTextsP14 = 0;//document.getElementsByName("subtextP6").length;

//function to convert x and y values from the loop into text
      function convertTextP14(X,Y){
      //var X = x;
      //var Y = y;
      if(X!=0){
      nTextsP14 = document.getElementsByName("subtextP14").length;

      //var wantedText = document.getElementsByName("subtextP6")[0];
      //console.log(nTexts);
      //console.log(document.getElementsByName("subtextP6"));
      if(nTextsP14==1){
      document.getElementsByName("subtextP14")[0].textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      
      SVGFourteen.appendChild(textP14);
      
      }else if(nTextsP14>1){
      for(var i = 0; i < nTextsP14; i++){
      var extraText = document.getElementsByName("subtextP14")[i];
//For some reason, deleteing the textbox does not work...
      //$("#SVGSix").remove("#"+extraText.id.toString());
//but setting the text to nothing does...     
      extraText.textContent="";
      //nTexts = document.getElementsByName("subtextP6").length;      
      SVGFourteen.appendChild(textP14);
      }//end for loop

      document.getElementsByName("subtextP14")[0].textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      
      SVGFourteen.appendChild(textP14);
      }//end else if
      
      
      }else{
        
      //var wantedText = document.getElementsByName("subtextP6")[0];
      document.getElementsByName("subtextP14")[0].textContent="(?,?)";
        SVGFourteen.appendChild(textP14);
//    newPlotSixId.appendChild(SVGSix);
//    document.body.appendChild(newPlotSixId);
      }//end else
      }//end function

        SVGFourteen.appendChild(textP14);

/* a function that sets the text content to the x and y cursor
 * positons on the SVG (in units of he x and y axis)
*/
/*
      function convertTextP14(X,Y){
      //var X = x;
      //var Y = y;
      if(X!=0){

      textP14.textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      //console.log(text.textContent)
      SVGFourteen.appendChild(textP14);
      //console.log(text.textContent);
      }else{

        textP14.textContent="(?,?)";
        SVGFourteen.appendChild(textP14);
      
      }
              }
*/
//console.log(minXData);
//console.log(maxXData);

//variables created specifically for this plot
var minXP14 = minXData;
var maxXP14 = maxXData;
var minYP14 = minYData;
var maxYP14 = maxYData;

//these scales determine the number of units per pixel in x and y
var scaleXPxP14 = Math.abs((maxXP14-minXP14)/xAxisLength) ;
//var offsetXP14 = ($("#SVG14").offset().left)+xAxisXCnvs;
var scaleYPxP14 = (maxYP14-minYP14)/yAxisLength ;
//var offsetYP14 = ($("#SVG14").offset().top+yAxisYCnvs);


/*event listeners created to change the text content to the x and y position of 
 * the mouse (in units on the plot) of the text element.
*/


      SVGFourteen.addEventListener("mousemove",function(){convertTextP14(minXP14+scaleXPxP14*(event.offsetX-xAxisXCnvs), minYP14+scaleYPxP14*(-event.offsetY+yAxisYCnvs+yAxisLength));});
      
      SVGFourteen.addEventListener("mouseout",function(){convertTextP14(0, 0);});
                                      //JB

}

//
//
//  *****   PLOT FIFTEEN / PLOT 15
//
//

// Plot fifteen: kappa vs lambda 
// 
    if ((ifLineOnly === false) && (ifShowAtmos === true)) {

        var plotRow = 4;
        var plotCol = 1;
//
        var minXData = 1.0e7 * lambdaScale[0];
        var maxXData = 1.0e7 * lambdaScale[numLams - 1];
        var xAxisName = "log<sub>10</sub><em>&#955</em> (nm)";
        //    ////Logarithmic x:
        //var minXData = 7.0 + logTen(masterLams[0]);
        //var maxXData = 7.0 + logTen(masterLams[numMaster - 1]);
        //var maxXData = 3.0; //finesse - Log10(lambda) = 3.5 nm
        //var xAxisName = "Log<sub>10</sub> &#955 (nm)";
        //var numYTicks = 4;
        //now done above var norm = 1.0e15; // y-axis normalization
        var minYData = logE*logKappa[numLams-10][4];
        var maxYData = logE*logKappa[10][numDeps-2];
        var yAxisName = "Log<sub>10</sub> <em>&#954<sub>&#955</sub></em> <br />(cm<sup>2</sup> g<sup>-1</sup>)";
        ////Logarithmic y:
        //var minYData = 12.0;
        //var maxYData = logE * masterFlux[1][iLamMax];
        //var yAxisName = "<span title='Monochromatic surface flux'><a href='http://en.wikipedia.org/wiki/Spectral_flux_density' target='_blank'>Log<sub>10</sub> <em>F</em><sub>&#955</sub> <br /> ergs s<sup>-1</sup> cm<sup>-3</sup></a></span>";
        //(xRange, xOffset, yRange, yOffset, wDefaultColor, plotFiveId);

        var fineness = "coarse";
        //var cnvsCtx = washer(plotRow, plotCol, wDefaultColor, plotFiveId, cnvsId);
					//JB
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, newPlotFifteenId, SVGFifteen);
					//JB
	panelX = panelOrigin[0];
        panelY = panelOrigin[1];
					//JB
	SVGFifteen.setAttribute('fill',wDefaultColor);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                newPlotFifteenId, SVGFifteen);

        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                fineness,newPlotFifteenId, SVGFifteen);

					//JB
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

//
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
					//JB
        txtPrint("log<sub>10</sub> <a href='https://en.wikipedia.org/wiki/Absorption_(electromagnetic_radiation)' title='mass extinction coefficient' target='_blank'>Extinction</a>",
                titleOffsetX, titleOffsetY, lineColor, newPlotFifteenId);
        txtPrint("<span style='font-size:small'>"
                + " <span style='color:#0000FF'><em>&#954<sub>&#955</sub> &#964 =</em> 1.0 </span>,  "
                + " <span style='color:#00FF00'><em>&#954<sub>&#955</sub> &#964 =</em> 0.01</span>, "
                + "<span><em>&#954</em><sub>Ros</sub></span>  ",
                titleOffsetX, titleOffsetY+35, lineColor, newPlotFifteenId);
					//JB
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

//
      var tTauM2 = tauPoint(numDeps, tauRos, 0.01);
        // Avoid upper boundary at i=0

        //var logLambdanm = 7.0 + logTen(masterLams[0]);  //logarithmic
        var lambdanm = 1.0e7 * lambdaScale[0];
        var xTickPosCnvs = xAxisLength * (lambdanm - minXData) / rangeXData; // pixels
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
//Logarithmic y:
        var yTickPosCnvsM2 = yAxisLength * ((logE*logKappa[0][tTauM2]) - minYData) / rangeYData;
        var yTickPosCnvs1 = yAxisLength * ((logE*logKappa[0][tTau1]) - minYData) / rangeYData;
        //var yTickPosCnvsRM2 = yAxisLength * ((kappaRos[1][tTauM2]) - minYData) / rangeYData;
        //var yTickPosCnvsR1 = yAxisLength * ((kappaRos[1][tTau1]) - minYData) / rangeYData;
        // vertical position in pixels - data values increase upward:
        var lastYShiftCnvsM2 = (yAxisYCnvs + yAxisLength) - yTickPosCnvsM2;
        var lastYShiftCnvs1 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs1;
        //var lastYShiftCnvsRM2 = (yAxisYCnvs + yAxisLength) - yTickPosCnvsRM2;
        //var lastYShiftCnvsR1 = (yAxisYCnvs + yAxisLength) - yTickPosCnvsR1;
        var xShift, yShift;


                              //JB
// text element that holds the x and y coordinates of the cursor on the SVG
      var textP15 = document.createElementNS(xmlW3,'text');
      textP15.setAttribute('x',325);
      textP15.setAttribute('y',325);
      textP15.setAttribute('font-size',"10");
      textP15.setAttribute('id',"subtextP15");
      textP15.setAttribute('name',"subtextP15");
      textP15.textContent="(?,?)";
      textP15.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
      SVGFifteen.appendChild(textP15);


/*to account for the fact that UPON MOVEMENT IN THE SVG,
 * A NEW TEXT ELEMENT IS CREATED UP TO N TIMES WHERE N
 *  IS THE NUMBER TIMES THE MODEL BUTTON HAS BEEN PRESSED SINCE
 *  THE CACHE WAS CLEARED, these variables were created to keep
 *  track of the single text element that is wanted to display
 *  the coordinates.
*/


      var nTextsP15 = 0;//document.getElementsByName("subtextP6").length;

//function to convert x and y values from the loop into text
      function convertTextP15(X,Y){
      //var X = x;
      //var Y = y;
      if(X!=0){
      nTextsP15 = document.getElementsByName("subtextP15").length;

      //var wantedText = document.getElementsByName("subtextP6")[0];
      //console.log(nTexts);
      //console.log(document.getElementsByName("subtextP6"));
      if(nTextsP15==1){
      document.getElementsByName("subtextP15")[0].textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      
      SVGFifteen.appendChild(textP15);
      
      }else if(nTextsP15>1){
      for(var i = 0; i < nTextsP15; i++){
      var extraText = document.getElementsByName("subtextP15")[i];
//For some reason, deleteing the textbox does not work...
      //$("#SVGSix").remove("#"+extraText.id.toString());
//but setting the text to nothing does...     
      extraText.textContent="";
      //nTexts = document.getElementsByName("subtextP6").length;      
      SVGFifteen.appendChild(textP15);
      }//end for loop

      document.getElementsByName("subtextP15")[0].textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      
      SVGFifteen.appendChild(textP15);
      }//end else if
      
      
      }else{
        
      //var wantedText = document.getElementsByName("subtextP6")[0];
      document.getElementsByName("subtextP15")[0].textContent="(?,?)";
        SVGFifteen.appendChild(textP15);
//    newPlotSixId.appendChild(SVGSix);
//    document.body.appendChild(newPlotSixId);
      }//end else
      }//end function





//variables created specifically for this plot
var minXP15 = minXData;
var maxXP15 = maxXData;
var minYP15 = minYData;
var maxYP15 = maxYData;

//these scales determine the number of units per pixel in x and y
var scaleXPxP15 = Math.abs((maxXP15-minXP15)/xAxisLength) ;
//var offsetXP15 = ($("#SVG15").offset().left)+xAxisXCnvs;
var scaleYPxP15 = (maxYP15-minYP15)/yAxisLength ;
//var offsetYP15 = ($("#SVG15").offset().top+yAxisYCnvs);

/*event listeners created to change the text content to the x and y position of 
 * the mouse (in units on the plot) of the text element.
*/




      SVGFifteen.addEventListener("mousemove",function(){convertTextP15(minXP15+scaleXPxP15*(event.offsetX-xAxisXCnvs), minYP15+scaleYPxP15*(-event.offsetY+yAxisYCnvs+yAxisLength));});
      
      SVGFifteen.addEventListener("mouseout",function(){convertTextP15(0, 0);});


//console.log(minXData);
//console.log(maxXData);
                                      //JB





        for (var i = 1; i < numLams; i++) {

            lambdanm = lambdaScale[i] * 1.0e7; //cm to nm //linear
            //logLambdanm = 7.0 + logTen(masterLams[i]);  //logarithmic
            xTickPosCnvs = xAxisLength * (lambdanm - minXData) / rangeXData; // pixels   //linear
            xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

//logarithmic y:
            yTickPosCnvsM2 = yAxisLength * ((logE*logKappa[i][tTauM2]) - minYData) / rangeYData;
            yTickPosCnvs1 = yAxisLength * ((logE*logKappa[i][tTau1]) - minYData) / rangeYData;
            //yTickPosCnvsRM2 = yAxisLength * ((kappaRos[1][tTauM2]) - minYData) / rangeYData;
            //yTickPosCnvsR1 = yAxisLength * ((kappaRos[1][tTau1]) - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            var yShiftCnvsM2 = (yAxisYCnvs + yAxisLength) - yTickPosCnvsM2;
            var yShiftCnvs1 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs1;
            //var yShiftCnvsRM2 = (yAxisYCnvs + yAxisLength) - yTickPosCnvsRM2;
            //var yShiftCnvsR1 = (yAxisYCnvs + yAxisLength) - yTickPosCnvsR1;

            RGBHex = colHex(0, 0, 255);

				//JB
	    var line = document.createElementNS(xmlW3,'polyline');
	    line.setAttribute('stroke',RGBHex);
            line.setAttribute('points',(lastXShiftCnvs+","+lastYShiftCnvs1+" "+xShiftCnvs+","+yShiftCnvs1+" "));
            line.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
	    SVGFifteen.appendChild(line);

				//JB
  
            RGBHex = colHex(0, 255, 0);

			//JB
            var line2 = document.createElementNS(xmlW3,'polyline');
            line2.setAttribute('stroke',RGBHex);
            line2.setAttribute('points',(lastXShiftCnvs+","+lastYShiftCnvsM2+" "+xShiftCnvs+","+yShiftCnvsM2+" "));
            line2.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            SVGFifteen.appendChild(line2);

			//JB
            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvsM2 = yShiftCnvsM2;
            lastYShiftCnvs1 = yShiftCnvs1;
            //lastYShiftCnvsRM2 = yShiftCnvsRM2;
            //lastYShiftCnvsR1 = yShiftCnvsR1;
        }
 //Rosseland mean oapcity lines
 //Tau = 1.0 line::
        var lambdanm = 1.0e7 * lambdaScale[0];
        var xTickPosCnvs = xAxisLength * (lambdanm - minXData) / rangeXData; // pixels
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
        var yTickPosCnvsR1 = yAxisLength * ((logE*kappaRos[1][tTau1]) - minYData) / rangeYData;
				//JB
        var yShiftCnvsR1 = (yAxisYCnvs + yAxisLength) - yTickPosCnvsR1;
        RGBHex = colHex(0, 0, 0);
        lambdanm = lambdaScale[numLams-1] * 1.0e7; //cm to nm //linear
    xTickPosCnvs = xAxisLength * (lambdanm - minXData) / rangeXData; // pixels   //linear
        xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            var line3 = document.createElementNS(xmlW3,'polyline');
            line3.setAttribute('stroke',RGBHex);
            line3.setAttribute('points',(lastXShiftCnvs+","+yShiftCnvsR1+" "+xShiftCnvs+","+yShiftCnvsR1+" "));
            line3.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            SVGFifteen.appendChild(line3);


 //Tau = 0.01 line::
        var lambdanm = 1.0e7 * lambdaScale[0];
        var xTickPosCnvs = xAxisLength * (lambdanm - minXData) / rangeXData; // pixels
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
        var yTickPosCnvsRM2 = yAxisLength * ((logE*kappaRos[1][tTauM2]) - minYData) / rangeYData;
 				//JB
        var yShiftCnvsRM2 = (yAxisYCnvs + yAxisLength) - yTickPosCnvsRM2;
        RGBHex = colHex(0, 0, 0);
 lambdanm = lambdaScale[numLams-1] * 1.0e7; //cm to nm //linear
        xTickPosCnvs = xAxisLength * (lambdanm - minXData) / rangeXData; // pixels   //linear
        xShiftCnvs = xAxisXCnvs + xTickPosCnvs;
            var line4 = document.createElementNS(xmlW3,'polyline');
            line4.setAttribute('stroke',RGBHex);
            line4.setAttribute('points',(lastXShiftCnvs+","+yShiftCnvsRM2+" "+xShiftCnvs+","+yShiftCnvsRM2+" "));
            line4.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            SVGFifteen.appendChild(line4);

 				//JB
           //monochromatic disk lambda
                yFinesse = 0.0;
                barHeight = 200;
                barWidth = 2;
                RGBHex = "#000000";
					//JB
                var xShiftDum = YBar(diskLambda, minXData, maxXData, barWidth, barHeight,
                        yFinesse, RGBHex, newPlotFifteenId, SVGFifteen);
        txtPrint("<span style='font-size:xx-small'>Filter</span>",
                xShiftDum, titleOffsetY+60, lineColor, newPlotFifteenId);

					//JB
    }

// ****************************************
    //
    //
    //  *****   PLOT SIXTEEN / PLOT 16
    //

    // Plot sixteen: ionization equlibrium: logNums vs tau 
    // 
    if ( (ifLineOnly === false) && ((ifShowAtmos === true) && (ionEqElement != "None")) ) {
//
  console.log("PLOT 16 reached");
        var ifMolPlot = false; //initial default value

        var plotRow = 4;
        var plotCol = 0;
        var minXData = logE * tauRos[1][0] - 0.0;
        var maxXData = logE * tauRos[1][numDeps - 1];
        var xAxisName = "<span title='Rosseland mean optical depth'><a href='http://en.wikipedia.org/wiki/Optical_depth_%28astrophysics%29' target='_blank'>Log<sub>10</sub> <em>&#964</em><sub>Ros</sub></a></span>";
        // Don't use upper boundary condition as lower y-limit - use a couple of points below surface:
        //var numYTicks = 6;
          var iAbnd = 0; //initialization
          for (var jj = 0; jj < nelemAbnd; jj++){
             if (ionEqElement == cname[jj]){
                   break;   //we found it
                 }
             iAbnd++;
          } //jj loop

         if (iAbnd == nelemAbnd){
// we have a molecule!
             ifMolPlot = true;
             var iAbndMol = 0;
             for (var jj = 0; jj < nMols; jj++){
                if (ionEqElement == mname[jj]){
                   break;
                }
               iAbndMol++;
             } 
         }
       // console.log("iAbndMol " + iAbndMol);

       var minYData, maxYData;
       var plotLogNums = []; 
       plotLogNums.length = numStages+2;
       for (var i = 0; i < (numStages+2); i++){
          plotLogNums[i] = [];
          plotLogNums[i].length = numDeps;
       }
       var plotLogNumsAB = [];
       plotLogNumsAB.length = numDeps;
       if (ifMolPlot == true){
          for (var iTau = 0; iTau < numDeps; iTau++){
             plotLogNumsAB[iTau] = logE * masterMolPops[iAbndMol][iTau];
        //     console.log("iTau " + iTau + " plotLogNumsAB " + plotLogNumsAB[iTau]);
          }
           var minMaxPoint = minMax(plotLogNumsAB);
           minYData = plotLogNumsAB[minMaxPoint[0]] - 1.0; // Avoid upper boundary condition [i]=0
           maxYData = plotLogNumsAB[minMaxPoint[1]] + 1.0;
       } else { 
           plotLogNums.length = numStages+2;
           for (var i = 0; i < (numStages+2); i++){
              plotLogNums[i] = [];
              plotLogNums[i].length = numDeps;
           }
            for (var iTau = 0; iTau < numDeps; iTau++){
               plotLogNums[0][iTau] = logE * masterStagePops[iAbnd][0][iTau];
               plotLogNums[1][iTau] = logE * masterStagePops[iAbnd][1][iTau];
               plotLogNums[4][iTau] = logE * masterStagePops[iAbnd][2][iTau];
               plotLogNums[5][iTau] = logE * masterStagePops[iAbnd][3][iTau];
               //plotLogNums[6][iTau] = logE * masterStagePops[iAbnd][4][iTau];
            }
           minYData = Math.min(plotLogNums[0][3], plotLogNums[1][3]) - 1.0; // Avoid upper boundary condition [i]=0
           maxYData = Math.max(plotLogNums[0][numDeps-1], plotLogNums[1][numDeps-1]);
      }

        var yAxisName = "Log<sub>10</sub> <em>N</em> <br />(cm<sup>-3</sup>)";

        var fineness = "normal";
        //var cnvsCtx = washer(xOffset, yOffset, wDefaultColor, plotOneId, cnvsId);
        //var cnvsCtx = washer(plotRow, plotCol, wDefaultColor, plotOneId, cnvsOneId);
					//JB
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, newPlotSixteenId, SVGSixteen);
					//JB
	panelX = panelOrigin[0];
        panelY = panelOrigin[1];
				//JB
	SVGSixteen.setAttribute('fill',wDefaultColor);
	        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                newPlotSixteenId, SVGSixteen);
				//JB
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
                fineness,newPlotSixteenId, SVGSixteen);

        var rangeYData = yAxisParams[1];
        var deltaYData = yAxisParams[2];
        var deltaYPxl = yAxisParams[3];
        minYData = yAxisParams[6]; //updated value
        maxYData = yAxisParams[7]; //updated value 

        yFinesse = 0;       
        xFinesse = 0;       
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
					//JB
        txtPrint("<a href='https://en.wikipedia.org/wiki/Saha_ionization_equation' target='_blank'>Ionization equilibrium</a> of " + ionEqElement,
                titleOffsetX, titleOffsetY, lineColor, newPlotSixteenId);
        txtPrint("<span style='font-size:small'>"
                + "<span><em>N</em><sub>I</sub></span>,  "
                + " <span style='color:#0000FF'><em>N</em><sub>II</sub></span>,  "
                + " <span style='color:#00FF00'><em>N</em><sub>III</sub></span> ",
                titleOffsetX, titleOffsetY+35, lineColor, newPlotSixteenId);

					//JB
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

            var xTickPosCnvs = xAxisLength * (logE * tauRos[1][0] - minXData) / rangeXData; // pixels   
            // horizontal position in pixels - data values increase rightward:
            var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;


       var yTickPosCnvs0, lastYShiftCnvs0, yTickPosCnvs1, lastYShiftCnvs1, yTickPosCnvs2, lastYShiftCnvs2, yShiftCnvs2;



                      //JB

// a text box created to hold the x and y positions of the mouse on the SVG
      var textP16 = document.createElementNS(xmlW3,'text');
      textP16.setAttribute('id',"textP16");
      textP16.setAttribute('x',275);
      textP16.setAttribute('y',325);
      textP16.setAttribute('font-size',"10");
      textP16.setAttribute('id',"subtextP16");
      textP16.setAttribute('name',"subtextP16");
      textP16.textContent="(?,?)";
      textP16.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
      SVGSixteen.appendChild(textP16);


/*to account for the fact that UPON MOVEMENT IN THE SVG,
 * A NEW TEXT ELEMENT IS CREATED UP TO N TIMES WHERE N
 *  IS THE NUMBER TIMES THE MODEL BUTTON HAS BEEN PRESSED SINCE
 *  THE CACHE WAS CLEARED, these variables were created to keep
 *  track of the single text element that is wanted to display
 *  the coordinates.
*/


      var nTextsP16 = 0;//document.getElementsByName("subtextP6").length;

//function to convert x and y values from the loop into text
      function convertTextP16(X,Y){
      //var X = x;
      //var Y = y;
      if(X!=0){
      nTextsP16 = document.getElementsByName("subtextP16").length;

      //var wantedText = document.getElementsByName("subtextP6")[0];
      //console.log(nTexts);
      //console.log(document.getElementsByName("subtextP6"));
      if(nTextsP16==1){
      document.getElementsByName("subtextP16")[0].textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      
      SVGSixteen.appendChild(textP16);
      
      }else if(nTextsP16>1){
      for(var i = 0; i < nTextsP16; i++){
      var extraText = document.getElementsByName("subtextP16")[i];
//For some reason, deleteing the textbox does not work...
      //$("#SVGSix").remove("#"+extraText.id.toString());
//but setting the text to nothing does...     
      extraText.textContent="";
      //nTexts = document.getElementsByName("subtextP6").length;      
      SVGSixteen.appendChild(textP16);
      }//end for loop

      document.getElementsByName("subtextP16")[0].textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      
      SVGSixteen.appendChild(textP16);
      }//end else if
      
      
      }else{
        
      //var wantedText = document.getElementsByName("subtextP6")[0];
      document.getElementsByName("subtextP16")[0].textContent="(?,?)";
        SVGSixteen.appendChild(textP16);
//    newPlotSixId.appendChild(SVGSix);
//    document.body.appendChild(newPlotSixId);
      }//end else
      }//end function



//variables created specifically for this plot
var xMinP16 = minXData;
var xMaxP16 = maxXData;
var yMinP16 = minYData;
var yMaxP16 = maxYData;
//scale required to convert x values to pixels
var scaleP16 = (xMaxP16-xMinP16)/xAxisLength; 

/*event listeners created to change the text content to the x and y position of 
 * the mouse (in units on the plot) of the text element.
*/
 SVGSixteen.addEventListener("mousemove",function(){convertTextP16(xMinP16+scaleP16*(event.offsetX-xAxisXCnvs), yMinP16+scaleP16*(event.offsetY-yAxisYCnvs-yAxisLength));},false);
 SVGSixteen.addEventListener("mouseout",function(){convertTextP16(0,0);},false);
                      //JB





       if (ifMolPlot == true){
          yTickPosCnvs0 = yAxisLength * (plotLogNumsAB[0] - minYData) / rangeYData;
          lastYShiftCnvs0 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs0;
       } else {

            yTickPosCnvs0 = yAxisLength * (plotLogNums[0][0] - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            lastYShiftCnvs0 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs0;
            yTickPosCnvs1 = yAxisLength * (plotLogNums[1][0] - minYData) / rangeYData;
            lastYShiftCnvs1 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs1;

            if (ionEqElement != "H"){
               yTickPosCnvs2 = yAxisLength * (plotLogNums[4][0] - minYData) / rangeYData;
               lastYShiftCnvs2 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs2;
            }
       } //ifMolPlot
//
        var yShiftCnvs0, yShiftCnvs1, yShiftCnvs2; 
        for (var i = 1; i < numDeps; i++) {

            var xTickPosCnvs = xAxisLength * (logE * tauRos[1][i] - minXData) / rangeXData; // pixels   
            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            if (ifMolPlot == true){
               yTickPosCnvs0 = yAxisLength * (plotLogNumsAB[i] - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
               yShiftCnvs0 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs0;
            } else {
               yTickPosCnvs0 = yAxisLength * (plotLogNums[0][i] - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
               yShiftCnvs0 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs0;
               yTickPosCnvs1 = yAxisLength * (plotLogNums[1][i] - minYData) / rangeYData;
               yShiftCnvs1 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs1;
               if (ionEqElement != "H"){
                  yTickPosCnvs2 = yAxisLength * (plotLogNums[4][i] - minYData) / rangeYData;
                  yShiftCnvs2 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs2;
               }
            } //ifMolPlot
   //console.log(" i " + i + " xShiftCnvs " + xShiftCnvs + " yShiftCnvs0 " + yShiftCnvs0);

//Stage I
	    //var line = document.createElementNS(xmlW3,'polyline');
	    //line.setAttribute('stroke',lineColor);
            //line.setAttribute('points',lastXShiftCnvs+","+lastYShiftCnvs0+" "+xShiftCnvs+","+yShiftCnvs0+" ");
            //line.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
	    //SVGSixteen.appendChild(line);
//Line plot
                      //JB
          var line1P16 = document.createElementNS(xmlW3,'polyline');
          line1P16.setAttribute('stroke',lineColor);
            line1P16.setAttribute('points',lastXShiftCnvs+","+lastYShiftCnvs0+" "+xShiftCnvs+","+yShiftCnvs0+" ");
            line1P16.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
          SVGSixteen.appendChild(line1P16);
                      //JB


            lastYShiftCnvs0 = yShiftCnvs0;

    if (ifMolPlot == false){
//Stage II
			//JB
	    var line2 = document.createElementNS(xmlW3,'polyline');
	    line2.setAttribute('stroke',"#0000FF");
            line2.setAttribute('points',lastXShiftCnvs+","+lastYShiftCnvs1+" "+xShiftCnvs+","+yShiftCnvs1+" ");
            line2.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            SVGSixteen.appendChild(line2);
            lastYShiftCnvs1 = yShiftCnvs1;
			//JB
 
//Stage III 
            if (ionEqElement != "H"){
				//JB
	    var line3 = document.createElementNS(xmlW3,'polyline');
            line3.setAttribute('stroke',"#00FF00");
            line3.setAttribute('points',lastXShiftCnvs+","+lastYShiftCnvs2+" "+xShiftCnvs+","+yShiftCnvs2+" ");
            line3.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            SVGSixteen.appendChild(line3);
				//JB
               lastYShiftCnvs2 = yShiftCnvs2;
            }

    } //ifMolPlot
            lastXShiftCnvs = xShiftCnvs;
    } // plot loop, i

  } 


    //
    //
    //  *****   PLOT SEVENTEEN / PLOT 17
    //
    //
    // Plot seventeen:  Fourier (cosine) transform of Intensity profile across disk (I(theta/(pi/2)))
 
//ifShowRad = false; //For movie 
   if ((ifLineOnly === false) && (ifShowRad === true)) {

        var plotRow = 2;
        var plotCol = 1;
//
        var minXData = ft[0][0];
        var maxXData = ft[0][numK-1];
// console.log("minXData " + minXData + " maxXData " + maxXData);
        var xAxisName = "<em>k</em> (RAD/RAD)";
        var iFtMinMax = minMax(ft[1]);
// console.log("iFtMinMax[1] " + iFtMinMax[1] + " ft[1][iFtMinMax[1]] " + ft[1][iFtMinMax[1]]);
//logarithmic        var minYData = -2.0;  //logarithmic
//logarithmic        var maxYData = logE*Math.log(ft[1][iFtMinMax[1]]);  //logarithmic
        var minYData = ft[1][iFtMinMax[0]];  //logarithmic
        var maxYData = ft[1][iFtMinMax[1]];  //logarithmic
        //var maxYData = tuneBandIntens[0] / norm;
        var yAxisName = "<span title='Monochromatic surface specific intensity'><a href='http://en.wikipedia.org/wiki/Specific_radiative_intensity' target='_blank'><em>I</em><sub>&#955</sub>(<em>k</em>)/<br /><em>I</em><sub>&#955</sub>(0)</a></span>";

        var fineness = "normal";
//
				//JB
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, newPlotSeventeenId, SVGSeventeen);
				//JB
	panelX = panelOrigin[0];
        panelY = panelOrigin[1];
				//JB
	SVGSeventeen.setAttribute('fill',wDefaultColor);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                newPlotSeventeenId, SVGSeventeen);
        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                fineness,newPlotSeventeenId, SVGSeventeen);
				//JB
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
// console.log("minXData " + minXData + " maxXData " + maxXData);
        //
        // Add legend annotation:

        //var iLamMinMax = minMax2(masterFlux);
        //var iLamMax = iLamMinMax[1];
        //var lamMax = (1.0e7 * masterLams[iLamMax]).toPrecision(3);

//
        lineColor = "#000000";
        var diskLamLbl = diskLambda.toPrecision(3);
        var diskLamStr = diskLamLbl.toString(10);
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
				//JB
				
        txtPrint("<span style='font-size:small'><span style='color:#000000'><em>&#955</em><sub>Filter</sub> = " + diskLamStr + "nm</span><br /> ",
                xAxisXCnvs+10, titleOffsetY+20, lineColor, newPlotSeventeenId);
         //Add title annotation:


        txtPrint("<span style='font-size:normal; color:blue'><a href='https://en.wikipedia.org/wiki/Discrete_Fourier_transform' target='_blank'> Fourier transform of <em>I</em><sub>&#955</sub>(<em>&#952</em>)/ <em>I</em><sub>&#955</sub>(0)</a> </a></span>",
                titleOffsetX, titleOffsetY, lineColor, newPlotSeventeenId);
				//JB

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


        var xTickPosCnvs = xAxisLength * (ft[0][0] - minXData) / rangeXData; // pixels   
        // horizontal position in pixels - data values increase rightward:
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
//logarithmic        var yTickPosCnvs = yAxisLength * (logE*Math.log(ft[1][0]) - minYData) / rangeYData; //logarithmic
       var yTickPosCnvs = yAxisLength * (ft[1][0] - minYData) / rangeYData;
       //var yTickPos2Cnvs = yAxisLength * (ft[2][0] - minYData) / rangeYData;

        // vertical position in pixels - data values increase upward:
        var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
        //var lastYShift2Cnvs = (yAxisYCnvs + yAxisLength) - yTickPos2Cnvs;
//

//

                              //JB
// text element that holds the x and y coordinates of the cursor on the SVG
      var textP17 = document.createElementNS(xmlW3,'text');
      textP17.setAttribute('x',325);
      textP17.setAttribute('y',325);
      textP17.setAttribute('font-size',"10");
      textP17.setAttribute('id',"subtextP17");
      textP17.setAttribute('name',"subtextP17");
      textP17.textContent="(?,?)";
      textP17.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
      SVGSeventeen.appendChild(textP17);


      var nTextsP17 = 0;//document.getElementsByName("subtextP6").length;

//function to convert x and y values from the loop into text
      function convertTextP17(X,Y){
      //var X = x;
      //var Y = y;
      if(X!=0){
      nTextsP17 = document.getElementsByName("subtextP6").length;

      //var wantedText = document.getElementsByName("subtextP6")[0];
      //console.log(nTexts);
      //console.log(document.getElementsByName("subtextP6"));
      if(nTextsP17==1){
      document.getElementsByName("subtextP17")[0].textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      
      SVGSeventeen.appendChild(textP17);
      
      }else if(nTextsP17>1){
      for(var i = 0; i < nTextsP17; i++){
      var extraText = document.getElementsByName("subtextP17")[i];
//For some reason, deleteing the textbox does not work...
      //$("#SVGSix").remove("#"+extraText.id.toString());
//but setting the text to nothing does...     
      extraText.textContent="";
      //nTexts = document.getElementsByName("subtextP6").length;      
      SVGSeventeen.appendChild(textP17);
      }//end for loop

      document.getElementsByName("subtextP17")[0].textContent="("+X.toFixed(3).toString()+","+Y.toFixed(3).toString()+")";
      
      SVGSeventeen.appendChild(textP17);
      }//end else if
      
      
      }else{
        
      //var wantedText = document.getElementsByName("subtextP6")[0];
      document.getElementsByName("subtextP17")[0].textContent="(?,?)";
        SVGSeventeen.appendChild(textP17);
//    newPlotSixId.appendChild(SVGSix);
//    document.body.appendChild(newPlotSixId);
      }//end else
      }//end function



//console.log(minXData);
//console.log(maxXData);

//variables created specifically for this plot
var minXP17 = minXData;
var maxXP17 = maxXData;
var minYP17 = minYData;
var maxYP17 = maxYData;

//these scales determine the number of units per pixel in x and y
var scaleXPxP17 = Math.abs((maxXP17-minXP17)/xAxisLength) ;
//var offsetXP17 = ($("#SVG17").offset().left)+xAxisXCnvs;
var scaleYPxP17 = (maxYP17-minYP17)/yAxisLength ;
//var offsetYP17 = ($("#SVG17").offset().top+yAxisYCnvs);


/*event listeners created to change the text content to the x and y position of 
 * the mouse (in units on the plot) of the text element.
*/
      SVGSeventeen.addEventListener("mousemove",function(){convertTextP17(minXP17+scaleXPxP17*(event.offsetX-xAxisXCnvs), minYP17+scaleYPxP17*(-event.offsetY+yAxisYCnvs+yAxisLength));});
      
      SVGSeventeen.addEventListener("mouseout",function(){convertTextP17(0, 0);});
                                      //JB



        for (var i = 1; i < numK; i++) {

  //console.log("i " + i + " ft[0] " + ft[0][i] + " ft[1] " + ft[1][i]);
            xTickPosCnvs = xAxisLength * (ft[0][i] - minXData) / rangeXData; // pixels   
            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

//logarithmic            yTickPosCnvs = yAxisLength * (logE*Math.log(ft[1][i]) - minYData) / rangeYData; //logarithmic
            yTickPosCnvs = yAxisLength * (ft[1][i] - minYData) / rangeYData;
           // yTickPos2Cnvs = yAxisLength * (ft[2][i] - minYData) / rangeYData;

            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
           // var yShift2Cnvs = (yAxisYCnvs + yAxisLength) - yTickPos2Cnvs;

			//JB
            RGBHex = colHex(0, 0, 0);
	    var pline = document.createElementNS(xmlW3,'polyline');
	    pline.setAttribute('stroke',RGBHex);
            pline.setAttribute('points',lastXShiftCnvs+","+lastYShiftCnvs+" "+xShiftCnvs+","+yShiftCnvs+" ");
            pline.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
	    SVGSeventeen.appendChild(pline);
			//JB    
	//

            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
           // lastYShift2Cnvs = yShift2Cnvs;
        }
    }
//ifShowRad = true; //For movie 



// Detailed model output section:

//    
// Set up the canvas:
//

    // **********  Basic canvas parameters: These are numbers in px - needed for calculations:
    // All plots and other output must fit within this region to be white-washed between runs

    var xRangeT = 2250;
    var yRangeT = 20000;
    var xOffsetT = 10;
    var yOffsetT = 2000;
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

        var modelBanner = "Model: Teff " + teff + " K, log(g) " + logg + " log cm/s/s, [A/H] " + zScale + ", mass " + massStar + " M_Sun";
        txtPrint(modelBanner, 10, yOffsetT, txtColor, printModelId);  
        txtPrint("Vertical atmospheric structure", 10, yOffsetT + lineHeight, txtColor, printModelId);
        //Column headings:

        var xTab = 190;
        txtPrint("i", 10, yOffsetT + 2*lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>&#964</em><sub>Rosseland</sub>", 10 + xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> depth (cm)", 10 + 2 * xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>T</em><sub>Kin</sub> (K)", 10 + 3 * xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>P</em><sub>Gas</sub> (dynes cm<sup>-2</sup>)", 10 + 4 * xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>P</em><sub>Rad</sub> (dynes cm<sup>-2</sup>)", 10 + 5 * xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>&#961</em> (g cm<sup>-3</sup>)", 10 + 6 * xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>N</em><sub>e</sub> (cm<sup>-3</sup>)", 10 + 7 * xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>N</em><sub>H</sub> (cm<sup>-3</sup>)", 10 + 8 * xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>&#956</em> (g)", 10 + 9 * xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>&#954</em><sub>Ros</sub> (cm<sup>2</sup> g<sup>-1</sup>)", 10 + 10 * xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>&#954</em><sub>500</sub> (cm<sup>2</sup> g<sup>-1</sup>)", 10 + 11 * xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);

        for (var i = 0; i < numDeps; i++) {
            yTab = yOffsetT + vOffset + (i+1) * lineHeight;
            numPrint(i, 10, yTab, txtColor, printModelId);
            value = logE * tauRos[1][i];
            //value = tauRos[0][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + xTab, yTab, txtColor, printModelId);
            value = logE * Math.log(depths[i]);
            //value = (depths[i]);
            value = value.toPrecision(5);
            numPrint(value, 10 + 2 * xTab, yTab, txtColor, printModelId);
            value = logE * temp[1][i];
            //value = temp[0][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 3 * xTab, yTab, txtColor, printModelId);
            value = logE * pGas[1][i];
            //value = pGas[0][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 4 * xTab, yTab, txtColor, printModelId);
            value = logE * pRad[1][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 5 * xTab, yTab, txtColor, printModelId);
            value = logE * rho[1][i];
            //value = rho[0][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 6 * xTab, yTab, txtColor, printModelId);
            value = logE * newNe[1][i];
            //value =  newNe[0][i] * k * temp[0][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 7 * xTab, yTab, txtColor, printModelId);
            value = logE * logNH[i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 8 * xTab, yTab, txtColor, printModelId);
            value = logE * Math.log(mmw[i]);
            value = value.toPrecision(5);
            numPrint(value, 10 + 9 * xTab, yTab, txtColor, printModelId);
            value = logE * kappaRos[1][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 10 * xTab, yTab, txtColor, printModelId);
            value = logE * kappa500[1][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 11 * xTab, yTab, txtColor, printModelId);

        }

    }


    if (ifPrintSED == true) {

        var modelBanner = "Model: Teff " + teff + " K, log(g) " + logg + " log cm/s/s, [A/H] " + zScale + ", mass " + massStar + " M_Sun";
        txtPrint(modelBanner, 10, yOffsetT, txtColor, printModelId);  
        txtPrint("Monochromatic surface flux spectral energy distribution (SED)", 10, yOffsetT + lineHeight, txtColor, printModelId);
        //Column headings:

        var xTab = 190;
        txtPrint("log<sub>10</sub> <em>&#955</em> (cm)", 10, yOffsetT + 2*lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>F</em><sub>&#955</sub> (ergs s<sup>-1</sup> cm<sup>-2</sup> cm<sup>-1</sup>)", 10 + xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);
        for (var i = 0; i < numMaster; i++) {
            yTab = yOffsetT + vOffset + (i+1) * lineHeight;
            value = logE * Math.log(masterLams[i]);
            value = value.toPrecision(9);
            numPrint(value, 10, yTab, txtColor, printModelId);
            value = logE * masterFlux[1][i];
            value = value.toPrecision(7);
            numPrint(value, 10 + xTab, yTab, txtColor, printModelId);
        }
    }


    if (ifPrintIntens == true) {

        var modelBanner = "Model: Teff " + teff + " K, log(g) " + logg + " log cm/s/s, [A/H] " + zScale + ", mass " + massStar + " M_Sun";
        txtPrint(modelBanner, 10, yOffsetT, txtColor, printModelId);  
        txtPrint("Monochromatic specific intensity distribution", 10, yOffsetT + lineHeight, txtColor, printModelId);
        //Column headings:

        var xTab = 100;
        txtPrint("log<sub>10</sub><em>&#955</em> (cm)", 10, yOffsetT + 2*lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub><em>I</em><sub>&#955</sub>(<em>&#952</em>) (ergs s<sup>-1</sup> cm<sup>-2</sup> cm<sup>-1</sup> steradian<sup>-1</sup>)",
                10 + xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);
        for (var j = 0; j < numThetas; j += 2) {
            value = cosTheta[1][j].toPrecision(5);
            txtPrint("cos <em>&#952</em>=" + value, 10 + (j + 1) * xTab, yOffsetT + 3 * lineHeight, txtColor, printModelId);
        }

        for (var i = 0; i < numMaster; i++) {
            yTab = yOffsetT + vOffset + (i+2) * lineHeight;
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

        var modelBanner = "Model: Teff " + teff + " K, log(g) " + logg + " log cm/s/s, [A/H] " + zScale + ", mass " + massStar + " M_Sun";
        txtPrint(modelBanner, 10, yOffsetT, txtColor, printModelId);  
        txtPrint("Monochromatic line flux and atomic <em>E</em>-level populations", 10, yOffsetT + lineHeight, txtColor, printModelId);
        var xTab = 190;
        //Column headings:

        txtPrint("log<sub>10</sub> <em>&#955</em> (cm)", 10, yOffsetT + 2*lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>F</em><sub>&#955</sub> (ergs s<sup>-1</sup> cm<sup>-2</sup> cm<sup>-1</sup>)",
                10 + xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);
        for (var i = 0; i < numPoints; i++) {
            yTab = yOffsetT + vOffset + (i+1) * lineHeight;
            value = logE * Math.log(lineLambdas[i]);
            value = value.toPrecision(9);
            numPrint(value, 10, yTab, txtColor, printModelId);
            value = logE * lineFlux2[1][i];
            value = value.toPrecision(7);
            numPrint(value, 10 + xTab, yTab, txtColor, printModelId);
        }


        var atomOffset = 750;
        var xTab = 200;
//From PLOT EIGHT (2-level atom: E-level diagram):

        var yData = [0.0, chiI1, chiL, chiU, chiI2];
        //console.log("yDatda[0] " + yData[0] + " yDatda[1] " + yData[1] + " yDatda[2] " + yData[2] + " yDatda[3] " + yData[3]);
        //console.log("chiI1 " + chiI1 + " chiL " + chiL + " chiU " + chiU);
        var yRightTickValStr = ["<em>&#967</em><sub>I</sub>", "<em>&#967</em><sub>II</sub>", "<span style='color:red'><em>&#967</em><sub>l</sub></span>", "<em>&#967</em><sub>u</sub>", "<em>&#967</em><sub>III</sub>"];
        //Column headings:
        txtPrint("log<sub>10</sub> <em>N</em><sub>i</sub> (cm<sup>-3</sup>)", 10, atomOffset + yOffsetT, txtColor, printModelId);
        txtPrint("i", 10, atomOffset + yOffsetT + 3 * lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>&#964</em><sub>Ross</sub>", 10 + xTab, atomOffset + yOffsetT + 3 * lineHeight, txtColor, printModelId);
        for (var j = 0; j < 5; j++) {
            yTab = atomOffset + yOffsetT + 3 * lineHeight;
            value = yRightTickValStr[j];
            txtPrint(value, 400 + j * xTab, yTab, txtColor, printModelId);
            value = yData[j].toPrecision(5);
            numPrint(value, 400 + j * xTab + 30, yTab, txtColor, printModelId);
            txtPrint("eV", 400 + j * xTab + 90, yTab, txtColor, printModelId);
        }

        for (var i = 0; i < numDeps; i++) {
            yTab = atomOffset + yOffsetT + (i + 5) * lineHeight;
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

        var modelBanner = "Model: Teff " + teff + " K, log(g) " + logg + " log cm/s/s, [A/H] " + zScale + ", mass " + massStar + " M_Sun";
        txtPrint(modelBanner, 10, yOffsetT, txtColor, printModelId);  
        txtPrint("Linear monochromatic continuum limb darkening coefficients (LCD)", 10, yOffsetT + lineHeight, txtColor, printModelId);
        //Column headings:

        var xTab = 190;
        txtPrint("log<sub>10</sub> <em>&#955</em> (cm)", 10, yOffsetT + 2*lineHeight, txtColor, printModelId);
        txtPrint("LDC", 10 + xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);
        for (var i = 0; i < numLams; i++) {
            yTab = yOffsetT + vOffset + (i+1) * lineHeight;
            value = logE * Math.log(lambdaScale[i]);
            value = value.toPrecision(9);
            numPrint(value, 10, yTab, txtColor, printModelId);
            value = ldc[i];
            value = value.toPrecision(7);
            numPrint(value, 10 + xTab, yTab, txtColor, printModelId);
        }
    }


    if (ifPrintChem == true){

          ifMolPlot = false; //default initialization
          var iAbnd = 0; //initialization
          for (var jj = 0; jj < nelemAbnd; jj++){
             if (ionEqElement == cname[jj]){
                   break;   //we found it
                 }
             iAbnd++;
          } //jj loop

         if (iAbnd == nelemAbnd){
// we have a molecule!
             ifMolPlot = true;
             var iAbndMol = 0;
             for (var jj = 0; jj < nMols; jj++){
                if (ionEqElement == mname[jj]){
                   break;
                }
               iAbndMol++;
             } 
         }

        var modelBanner = "Model: Teff " + teff + " K, log(g) " + logg + " log cm/s/s, [A/H] " + zScale + ", mass " + massStar + " M_Sun";
        txtPrint(modelBanner, 10, yOffsetT, txtColor, printModelId);  
        txtPrint("Chemical equilibrium population for " + ionEqElement + " (cm<sup>-3</sup>)",
                   10, yOffsetT + lineHeight, txtColor, printModelId);
        //Column headings:
        var xTab = 190;
        txtPrint("i", 10, yOffsetT + 2*lineHeight, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>&#964</em><sub>Rosseland</sub>", 10 + xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);
        if (ifMolPlot != true){
           txtPrint("log<sub>10</sub> <em>N</em><sub>I</sub>", 10 + 2 * xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);
           txtPrint("log<sub>10</sub> <em>N</em><sub>II</sub>", 10 + 3 * xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);
           txtPrint("log<sub>10</sub> <em>N</em><sub>III</sub>", 10 + 4 * xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);
        } else {
           txtPrint("log<sub>10</sub> <em>N</em><sub>Mol</sub>", 10 + 2 * xTab, yOffsetT + 2*lineHeight, txtColor, printModelId);
        }   

        for (var i = 0; i < numDeps; i++) {
            yTab = yOffsetT + vOffset + (i+1) * lineHeight;
            numPrint(i, 10, yTab, txtColor, printModelId);
            value = logE * tauRos[1][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + xTab, yTab, txtColor, printModelId);
            if (ifMolPlot != true){
               value = logE * masterStagePops[iAbnd][0][i];
               value = value.toPrecision(5);
               numPrint(value, 10 + 2 * xTab, yTab, txtColor, printModelId);
               value = logE * masterStagePops[iAbnd][1][i];
               value = value.toPrecision(5);
               numPrint(value, 10 + 3 * xTab, yTab, txtColor, printModelId);
               value = logE * masterStagePops[iAbnd][2][i];
               value = value.toPrecision(5);
               numPrint(value, 10 + 4 * xTab, yTab, txtColor, printModelId);
            } else {
               value = logE * masterMolPops[iAbndMol][i];
               value = value.toPrecision(5);
               numPrint(value, 10 + 2 * xTab, yTab, txtColor, printModelId);
            }
        }

    } //end ifPrint



//
//
//  *******    END CODE
// 
//
    return;
}; //end function main()
