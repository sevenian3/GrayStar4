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
 * Philip D. Bennett
 * Saint Mary's University
 * Department of Astronomy and Physics
 * Institute for Computational Astrophysics (ICA)
 * Halifax, NS, Canada
 *
 *
 * Co-developers:
 *
 * Lindsey Burns (SMU) - 2017 - "lburns"
 * Jason Bayer (SMU) - 2017 - "JB"
 * 
 * Open source pedagogical computational stellar astrophysics
 *
 * 1D, static, plane-parallel, LTE stellar atmospheric model
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
var kBoltz = 1.3806488E-16; // Boltzmann constant in ergs/K
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
var logKBoltz = Math.log(kBoltz);
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
                      //
//Public static (ie. global) variable declaration and set-up for Phil Bennett's GAS
//chemical-equilibrium/ionizatio-equilibrium/EOS package:

var nameGs = [];
nameGs.length = 150;
var ipr = [];
ipr.length = 150;
var nch = [];
nch.length = 150;
var nel = [];
nel.length = 150;
//These need to be initialized:
for (var j = 0; j < 150; j++){
   ipr[j] = 0;
   nch[j] = 0;
   nel[j] = 0;
}

var nat = [];
nat.length = 5;
for (var i = 0; i < 5; i++){
   nat[i] = [];
   nat[i].length = 150;
}

var zat = [];
zat.length = 5;
for (var i = 0; i < 5; i++){
   zat[i] = [];
   zat[i].length = 150;
}
//These need to be initialized:
for (var i = 0; i < 5; i++){
   for (var j = 0; j < 150; j++){
      nat[i][j] = 0;
      zat[i][j] = 0;
   }
}

var ip = [];
ip.length = 150;
var comp = [];
comp.length = 40;
var awt = [];
awt.length = 150;
//These needs to be initialized:
for (var j = 0; j < 150; j++){
   ip[j] = 0.0;
   awt[j] = 0.0;
}
for (var j = 0; j < 40; j++){
   comp[j] = 0.0;
}

var logk = [];
logk.length = 5;
for (var i = 0; i < 5; i++){
   logk[i] = [];
   logk[i].length = 150;
}
//This needs to be initialized:
for (var i = 0; i < 5; i++){
   for (var j = 0; j < 150; j++){
      logk[i][j] = 0.0;
   }
}

var logwt = [];
logwt.length = 150;
for (var i = 0; i < 150; i++){
   logwt[i] = 0.0;
}

var ntot = [];
ntot.length = 150;
var neut = [];
neut.length = 150;
var idel = [];
idel.length = 150;
var natsp = [];
natsp.length = 150;
for (var i = 0; i < 150; i++){
   ntot[i] = 0;
   neut[i] = 0;
   idel[i] = 0;
   natsp[i] = 0;
}

var iatsp = [];
iatsp.length = 40;
for (var i = 0; i < 40; i++){
   iatsp[i] = [];
   iatsp[i].length = 40;
}
for (var i = 0; i < 40; i++){
   for (var j = 0; j < 40; j++){
      iatsp[i][j] = 0;  
   }
}

var makeIndx = function(){

   var indx = [];
   indx.length = 4;
   for (var i = 0; i < 4; i++){
       indx[i] = [];
       indx[i].length = 26;
       for (var j = 0; j < 26; j++){
           indx[i][j] = [];
           indx[i][j].length = 7;
           for (var k = 0; k < 7; k++){
               indx[i][j][k] = [];
               indx[i][j][k].length = 5;
               for (var l = 0; l < 5; l++){
                  indx[i][j][k][l] = [];
                  indx[i][j][k][l].length = 2;
                  for (var m = 0; m < 2; m++){
                     indx[i][j][k][l][m] = 149;
                  }
               }
           }
       }
   }

   return indx;

}; //end method makeIndx


var indx = makeIndx();

//Initialization:

var makeIat = function(){
   var iat = [];
   iat.length = 150;
   for (var i = 0; i < 150; i++){
      iat[i] = 39;
   }
   return iat;
};//end method

var makeIndsp = function(){
    var indsp = [];
    indsp.length = 40;
    for (var i = 0; i < 40; i++){
       indsp[i] = 149;
    }
    return indsp;
}; //end method

var makeIndzat = function(){
    var indzat = [];
    indzat.length = 100;
    for (var i = 0; i < 100; i++){
       indzat[i] = 39;
    }
    return indzat;
}; //end method

var iat = makeIat();
var indsp = makeIndsp();
var indzat = makeIndzat();

var ixn = [];
ixn.length = 70;
//initialize:
for (var i = 0; i < 70; i++){
   ixn[i] = 0;
}


var lin1 = [];
lin1.length = 40;
var lin2 = [];
lin2.length = 40;
var linv1 = [];
linv1.length = 40;
var linv2 = [];
linv2.length = 40;

//initialize:
for (var i = 0; i < 40; i++){
   lin1[i] = 0;
   linv1[i] = 0;
   lin2[i] = 0;
   linv2[i] = 0;
}

var nspec;
var natom;   //#neutral atomic species counter
var nlin1;
var nlin2;

var type0 = [];
type0.length = 150;
//initialize:
for (var i = 0; i < 150; i++){
   type0[i] = 0;
}

//Special variables to hold values returned by gas() and gasest()
//Must be initialized:

var returnGasEst = [];
returnGasEst.length = 42;
for (var i = 0; i < 42; i++){
   returnGasEst[i] = 0.0;
}
var returnGas = [];
returnGas.length = 153;
for (var i = 0; i < 153; i++){
   returnGas[i] = 0.0;
}


var lineColor = "#000000"; //black
var lineThick = 1;
var xTickPosCnvs = 0;
var yTickPosCnvs = 0;
var xShiftCnvs = 0;
var yShiftCnvs = 0;
var xPhys = 0;
var yPhys = 0;
//We think everything will be a line or a circle:
    var listOfLineNodes = document.querySelectorAll("line");
    var listOfCircNodes = document.querySelectorAll("circle");

    //var numSVGNodes = listOfSVGNodes.length;
    var numLineNodes = listOfLineNodes.length;
    var numCircNodes = listOfCircNodes.length;

//We have to be prepared that this might be our first time through - ??:
    //if (numSVGNodes > 0){

//Remove line elements (axues, tickmarks, barns, etc.)
       if (numLineNodes > 0){
           for (var iNode = 0; iNode < numLineNodes; iNode++){
               listOfLineNodes[iNode].parentNode.removeChild(listOfLineNodes[iNode]);
           }
       } //numLineNodes > 0 condition


//function to output physical data coordinates at clicked cursor location
var dataCoords = function(eventObj, cnvsId,
                          xAxisLength, minXData, rangeXData, xAxisXCnvs,
                          yAxisLength, minYData, rangeYData, yAxisYCnvs){

   //console.log("eventObj.offsetX " + eventObj.offsetX + " eventObj.offsetY " + eventObj.offsetY);
   //console.log("eventObj.pageX " + eventObj.pageX + " eventObj.pageY " + eventObj.pageY);
   //console.log("eventObj.clientX " + eventObj.clientX + " eventObj.clientY " + eventObj.clientY);
   //console.log("eventObj.screenX " + eventObj.screenX + " eventObj.screenY " + eventObj.screenY);
   //var offsetStr = String(eventObj.pageX) + " " + String(eventObj.pageY); 
   //var offsetStr = String(eventObj.clientX) + " " + String(eventObj.clientY); 

//First, erase the previous dataCoords output so output is not clobbered:
   var coordElId;
   if (document.getElementById("coordId") != null){
      //cnvsId.getElementsById("coordId").innerHTML="";
      //console.log("Removing...");
      coordElId = document.getElementById("coordId");
      coordElId.innerHTML=" ";
      coordElId.parentNode.removeChild(coordElId);
   }
   xShiftCnvs = eventObj.offsetX;
   xTickPosCnvs = xShiftCnvs - xAxisXCnvs;
   xPhys = (xTickPosCnvs * rangeXData / xAxisLength) + minXData;
   xPhys = xPhys.toFixed(2);
   yShiftCnvs = eventObj.offsetY;
   yTickPosCnvs = (yAxisYCnvs + yAxisLength) - yShiftCnvs
   yPhys = (yTickPosCnvs * rangeYData / yAxisLength) + minYData;
   yPhys = yPhys.toFixed(2);
   //var offsetStr = String(eventObj.offsetX) + " " + String(eventObj.offsetY); 
   var offsetStr = "<span id='coordId' style='font-size:small'>x,y: " + String(xPhys) + " " + String(yPhys) + "</span>";
   //console.log("offsetStr " + offsetStr);
   //txtPrint(offsetStr, eventObj.pageX, eventObj.pageY, lineColor, cnvsId);
   //txtPrint(offsetStr, eventObj.clientX, eventObj.clientY, lineColor, cnvsId);
   //txtPrint(offsetStr, eventObj.offsetX, eventObj.offsetY, lineColor, cnvsId);
   //txtPrint(offsetStr, 100, 100, lineColor, cnvsId);
   //coordBoxId.innerHTML = offsetStr;

   return offsetStr;

};



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
    var ifShowLogPP = false;
    var ifShowLogNums = false;
    //
    var ifPrintNone = true;
    var ifPrintAtmos = false;
    var ifPrintSED = false;
    var ifPrintIntens = false;
    var ifPrintLDC = false;
    var ifPrintPP = false;
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

    var ppSpecies = "None"; //default
    ppSpecies = $("#showLogPP").val();
    if (ppSpecies != "None") {
        ifShowLogPP = true; // checkbox
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
    if ($("#printPP").is(":checked")) {
        ifPrintPP = true; // checkbox
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
        greenHouse = 12.0;
        var GHTemp = 12.0; 
        settingsId[4].value = 12.0;
        //$("#GHTemp").val(12.0);
        $("#GHTemp").roundSlider("setValue", "12.0");
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
  var nelemAbnd = 41;
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
 eheu[40]=  3.65; // Ge - out of sequence

//CAUTION: cnameMols names should match mnames names in general list of molecules blow
//List the four molecular species most likely to deplete the atomic species A
  cname[0]="H";
  cname[1]="He";
  cname[2]="Li";
  cname[3]="Be";
  cname[4]="B";
  cname[5]="C";
  cname[6]="N";
  cname[7]="O";
  cname[8]="F";
  cname[9]="Ne";
  cname[10]="Na";
  cname[11]="Mg";
  cname[12]="Al";
  cname[13]="Si";
  cname[14]="P";
  cname[15]="S";
  cname[16]="Cl";
  cname[17]="Ar";
  cname[18]="K";
  cname[19]="Ca";
  cname[20]="Sc";
  cname[21]="Ti";
  cname[22]="V";
  cname[23]="Cr";
  cname[24]="Mn";
  cname[25]="Fe";
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
  cname[40]="Ge";

//Variable declaration and set-up for Phil Bennett's GAS package
/*
var kbol = CSGasInit.kbol;
var hmass = CSGasInit.hmass;
var print0 = CSGasInit.print0;
var itab = CSGasInit.itab;
var ntab = CSGasInit.ntab;
var nix = CSGasInit.nix;
var ixa = CSGasInit.ixa;
var chix = CSGasInit.chix;
var iprint = CSGasInit.iprint;
*/

//console.log("itab[0] " + itab[0]);

/* Main "Gas data" table for input to GAS package (Phil Bennett) */
//This would require substantial re-arranging to put into a Class :

nameGs[0] = "H";      ipr[0] = 1; nch[0] =  0; nel[0] = 1; nat[0][0] = 1;  zat[0][0] = 1;  awt[0] =  1.008; comp[0] = 9.32e-01;
nameGs[1] = "H+";     ipr[1] = 1; nch[1] = +1; ip[1] = 13.598;  logwt[1] = 0.000;
nameGs[2] = "H-";     ipr[2] = 1; nch[2] = -1; ip[2] =  0.754;  logwt[2] = 0.600;
nameGs[3] = "He";     ipr[3] = 2; nch[3] =  0; nel[3] = 1; nat[0][3] = 1;  zat[0][3] = 2;  awt[3] =  4.003; comp[1] = 6.53e-02;
nameGs[4] = "He+";    ipr[4] = 2; nch[4] = +1; ip[4] = 24.587;  logwt[4] = 0.600;
nameGs[5] = "C";      ipr[5] = 1; nch[5] =  0; nel[5] = 1; nat[0][5] = 1;  zat[0][5] = 6;  awt[5] = 12.011; comp[2] = 4.94e-04;
nameGs[6] = "C+";     ipr[6] = 1; nch[6] = +1; ip[6] = 11.260;  logwt[6] = 0.100;
nameGs[7] = "N";      ipr[7] = 1; nch[7] =  0; nel[7] = 1; nat[0][7] = 1;  zat[0][7] = 7;  awt[7] = 14.007; comp[3] = 8.95e-04;
nameGs[8] = "N+";     ipr[8] = 1; nch[8] = +1; ip[8] = 14.534;  logwt[8] = 0.650;
nameGs[9] = "O";      ipr[9] = 1; nch[9] =  0; nel[9] = 1; nat[0][9] = 1;  zat[0][9] = 8;  awt[9] = 16.000; comp[4] = 8.48e-04;
nameGs[10] = "O+";    ipr[10] = 1; nch[10] = +1; ip[10] = 13.618; logwt[10] = -0.050;
nameGs[11] = "Ne";    ipr[11] = 2; nch[11] =  0; nel[11] = 1; nat[0][11] = 1;  zat[0][11] = 10; awt[11] = 20.179; comp[5] = 7.74e-05;
nameGs[12] = "Ne+";   ipr[12] = 2; nch[12] = +1; ip[12] = 21.564;  logwt[12] = 1.080;
nameGs[13] = "Na";    ipr[13] = 2; nch[13] =  0; nel[13] = 1; nat[0][13] = 1;  zat[0][13] = 11; awt[13] = 22.990; comp[6] = 1.68e-06;
nameGs[14] = "Na+";   ipr[14] = 2; nch[14] = +1; ip[14] =  5.139;  logwt[14] = 0.000;
nameGs[15] = "Mg";    ipr[15] = 2; nch[15] =  0; nel[15] = 1; nat[0][15] = 1;  zat[0][15] = 12; awt[15] = 24.305; comp[7] = 2.42e-05;
nameGs[16] = "Mg+";   ipr[16] = 2; nch[16] = +1; ip[16] =  7.644;  logwt[16] = 0.600;
nameGs[17] = "Mg++";  ipr[17] = 2; nch[17] = +2; ip[17] = 15.031;  logwt[17] = 0.000;
nameGs[18] = "Al";    ipr[18] = 2; nch[18] =  0; nel[18] = 1; nat[0][18] = 1;  zat[0][18] = 13; awt[18] = 26.982; comp[8] = 2.24e-06;
nameGs[19] = "Al+";   ipr[19] = 2; nch[19] = +1; ip[19] =  5.984; logwt[19] = -0.480;
nameGs[20] = "Si";    ipr[20] = 1; nch[20] =  0; nel[20] = 1; nat[0][20] = 1;  zat[0][20] = 14; awt[20] = 28.086; comp[9] = 3.08e-05;
nameGs[21] = "Si+";   ipr[21] = 1; nch[21] = +1; ip[21] =  8.149;  logwt[21] = 0.120;
nameGs[22] = "S";     ipr[22] = 1; nch[22] =  0; nel[22] = 1; nat[0][22] = 1;  zat[0][22] = 16; awt[22] = 32.060; comp[10] = 1.49e-05;
nameGs[23] = "S+";    ipr[23] = 1; nch[23] = +1; ip[23] = 10.360; logwt[23] = -0.050;
nameGs[24] = "Cl";    ipr[24] = 3; nch[24] =  0; nel[24] = 1; nat[0][24] = 1;  zat[0][24] = 17; awt[24] = 35.453; comp[11] = 3.73e-07;
nameGs[25] = "Cl-";   ipr[25] = 3; nch[25] = -1; ip[25] =  3.613;  logwt[25] = 1.080;
nameGs[26] = "K";     ipr[26] = 2; nch[26] =  0; nel[26] = 1; nat[0][26] = 1;  zat[0][26] = 19; awt[26] = 39.102; comp[12] = 8.30e-08;
nameGs[27] = "K+";    ipr[27] = 2; nch[27] = +1; ip[27] =  4.339;  logwt[27] = 0.000;
nameGs[28] = "Ca";    ipr[28] = 2; nch[28] =  0; nel[28] = 1; nat[0][28] = 1;  zat[0][28] = 20; awt[28] = 40.080; comp[13] = 1.86e-06;
nameGs[29] = "Ca+";   ipr[29] = 2; nch[29] = +1; ip[29] =  6.111;  logwt[29] = 0.600;
nameGs[30] = "Ca++";  ipr[30] = 2; nch[30] = +2; ip[30] = 11.868;  logwt[30] = 0.000;
nameGs[31] = "Sc";    ipr[31] = 3; nch[31] =  0; nel[31] = 1; nat[0][31] = 1;  zat[0][31] = 21; awt[31] = 44.956; comp[14] = 1.49e-09;
nameGs[32] = "Sc+";   ipr[32] = 3; nch[32] = +1; ip[32] =  6.540;  logwt[32] = 0.480;
nameGs[33] = "Ti";    ipr[33] = 3; nch[33] =  0; nel[33] = 1; nat[0][33] = 1;  zat[0][33] = 22; awt[33] = 47.900; comp[15] = 1.21e-07;
nameGs[34] = "Ti+";   ipr[34] = 3; nch[34] = +1; ip[34] =  6.820;  logwt[34] = 0.430;
nameGs[35] = "V";     ipr[35] = 3; nch[35] =  0; nel[35] = 1; nat[0][35] = 1;  zat[0][35] = 23; awt[35] = 50.941; comp[16] = 2.33e-08;
nameGs[36] = "V+";    ipr[36] = 3; nch[36] = +1; ip[36] =  6.740;  logwt[36] = 0.250;
nameGs[37] = "Cr";    ipr[37] = 3; nch[37] =  0; nel[37] = 1; nat[0][37] = 1;  zat[0][37] = 24; awt[37] = 51.996; comp[17] = 6.62e-07;
nameGs[38] = "Cr+";   ipr[38] = 3; nch[38] = +1; ip[38] =  6.766;  logwt[38] = 0.230;
nameGs[39] = "Mn";    ipr[39] = 3; nch[39] =  0; nel[39] = 1; nat[0][39] = 1;  zat[0][39] = 25; awt[39] = 54.938; comp[18] = 2.33e-07;
nameGs[40] = "Mn+";   ipr[40] = 3; nch[40] = +1; ip[40] =  7.435;  logwt[40] = 0.370;
nameGs[41] = "Fe";    ipr[41] = 2; nch[41] =  0; nel[41] = 1; nat[0][41] = 1;  zat[0][41] = 26; awt[41] = 55.847; comp[19] = 3.73e-05;
nameGs[42] = "Fe+";   ipr[42] = 2; nch[42] = +1; ip[42] =  7.870;  logwt[42] = 0.380;
nameGs[43] = "Co";    ipr[43] = 3; nch[43] =  0; nel[43] = 1; nat[0][43] = 1;  zat[0][43] = 27; awt[43] = 58.933; comp[20] = 1.12e-07;
nameGs[44] = "Co+";   ipr[44] = 3; nch[44] = +1; ip[44] =  7.860;  logwt[44] = 0.180;
nameGs[45] = "Ni";    ipr[45] = 2; nch[45] =  0; nel[45] = 1; nat[0][45] = 1;  zat[0][45] = 28; awt[45] = 58.710; comp[21] = 1.86e-06;
nameGs[46] = "Ni+";   ipr[46] = 2; nch[46] = +1; ip[46] =  7.635; logwt[46] = -0.020;
nameGs[47] = "Sr";    ipr[47] = 3; nch[47] =  0; nel[47] = 1; nat[0][47] = 1;  zat[0][47] = 38; awt[47] = 87.620; comp[22] = 6.62e-10;
nameGs[48] = "Sr+";   ipr[48] = 3; nch[48] = +1; ip[48] =  5.695;  logwt[48] = 0.500;
nameGs[49] = "Y";     ipr[49] = 3; nch[49] =  0; nel[49] = 1; nat[0][49] = 1;  zat[0][49] = 39; awt[49] = 88.906; comp[23] = 5.87e-11;
nameGs[50] = "Y+";    ipr[50] = 3; nch[50] = +1; ip[50] =  6.380;  logwt[50] = 0.500;
nameGs[51] = "Zr";    ipr[51] = 3; nch[51] =  0; nel[51] = 1; nat[0][51] = 1;  zat[0][51] = 40; awt[51] = 91.220; comp[24] = 2.98e-10;
nameGs[52] = "Zr+";   ipr[52] = 3; nch[52] = +1; ip[52] =  6.840;  logwt[52] = 0.420;
nameGs[53] = "H2";    ipr[53] = 1; nch[53] =  0; nel[53] = 1; nat[0][53] = 2;  zat[0][53] = 1;           logk[0][53] = 12.739; logk[1][53] = -5.1172;  logk[2][53] = 0.12572; logk[3][53] = -1.4149e-02; logk[4][53] = 6.3021e-04;
nameGs[54] = "H2+";   ipr[54] = 1; nch[54] = +1; ip[54] = 15.422;  logwt[54] = 0.600;
nameGs[55] = "C2";    ipr[55] = 1; nch[55] =  0; nel[55] = 1; nat[0][55] = 2;  zat[0][55] = 6;           logk[0][55] = 12.804; logk[1][55] = -6.5178;  logk[2][55] = .097719; logk[3][55] = -1.2739e-02;  logk[4][55] = 6.2603e-04;
nameGs[56] = "C3";    ipr[56] = 1; nch[56] =  0; nel[56] = 1; nat[0][56] = 3;  zat[0][56] = 6;           logk[0][56] = 25.230; logk[1][56] = -14.445;  logk[2][56] = 0.12547; logk[3][56] = -1.7390e-02;  logk[4][56] = 8.8594e-04;
nameGs[57] = "N2";    ipr[57] = 1; nch[57] =  0; nel[57] = 1; nat[0][57] = 2; zat[0][57] = 7;           logk[0][57] = 13.590; logk[1][57] = -10.585;  logk[2][57] = 0.22067; logk[3][57] = -2.9997e-02;  logk[4][57] = 1.4993e-03;
nameGs[58] = "O2";    ipr[58] = 1; nch[58] =  0; nel[58] = 1; nat[0][58] = 2; zat[0][58] = 8;           logk[0][58] = 13.228; logk[1][58] = -5.5181;  logk[2][58] = .069935; logk[3][58] = -8.1511e-03;  logk[4][58] = 3.7970e-04;
nameGs[59] = "CH";    ipr[59] = 1; nch[59] =  0; nel[59] = 2; nat[0][59] = 1; zat[0][59] = 6;  nat[1][59] = 1;  zat[1][59] = 1;  nat[2][59] = 0;  zat[2][59] = 0; logk[0][59] = 12.135; logk[1][59] = -4.0760; logk[2][59] =  0.12768; logk[3][59] = -1.5473e-02; logk[4][59] =  7.2661e-04;
nameGs[60] = "C2H2";  ipr[60] = 1; nch[60] =  0; nel[60] = 2; nat[0][60] = 2; zat[0][60] = 6;  nat[1][60] = 2;  zat[1][60] = 1;  nat[2][60] = 0;  zat[2][60] = 0; logk[0][60] = 38.184; logk[1][60] = -17.365; logk[2][60] =  .021512; logk[3][60] = -8.8961e-05; logk[4][60] = -2.8720e-05;
nameGs[61] = "NH";    ipr[61] = 1; nch[61] =  0; nel[61] = 2; nat[0][61] = 1; zat[0][61] = 7;  nat[1][61] = 1;  zat[1][61] = 1;  nat[2][61] = 0;  zat[2][61] = 0; logk[0][61] = 12.033; logk[1][61] = -3.8435; logk[2][61] =  0.13629; logk[3][61] = -1.6643e-02; logk[4][61] =  7.8691e-04;
nameGs[62] = "NH2";   ipr[62] = 1; nch[62] =  0; nel[62] = 2; nat[0][62] = 1; zat[0][62] = 7;  nat[1][62] = 2;  zat[1][62] = 1;  nat[2][62] = 0;  zat[2][62] = 0; logk[0][62] = 24.603; logk[1][62] = -8.6300; logk[2][62] =  0.20048; logk[3][62] = -2.4124e-02; logk[4][62] =  1.1484e-03;
nameGs[63] = "NH3";   ipr[63] = 1; nch[63] =  0; nel[63] = 2; nat[0][63] = 1; zat[0][63] = 7;  nat[1][63] = 3;  zat[1][63] = 1;  nat[2][63] = 0;  zat[2][63] = 0; logk[0][63] = 37.554; logk[1][63] = -13.059; logk[2][63] =  0.12910; logk[3][63] = -1.2338e-02; logk[4][63] =  5.3429e-04;
nameGs[64] = "OH";    ipr[64] = 1; nch[64] =  0; nel[64] = 2; nat[0][64] = 1; zat[0][64] = 8;  nat[1][64] = 1;  zat[1][64] = 1;  nat[2][64] = 0;  zat[2][64] = 0; logk[0][64] = 12.371; logk[1][64] = -5.0578; logk[2][64] =  0.13822; logk[3][64] = -1.6547e-02; logk[4][64] =  7.7224e-04;
nameGs[65] = "H2O";   ipr[65] = 1; nch[65] =  0; nel[65] = 2; nat[0][65] = 1; zat[0][65] = 8;  nat[1][65] = 2;  zat[1][65] = 1;  nat[2][65] = 0;  zat[2][65] = 0; logk[0][65] = 25.420; logk[1][65] = -10.522; logk[2][65] =  0.16939; logk[3][65] = -1.8368e-02; logk[4][65] =  8.1730e-04;
nameGs[66] = "MgH";   ipr[66] = 2; nch[66] =  0; nel[66] = 2; nat[0][66] = 1; zat[0][66] = 12; nat[1][66] = 1;  zat[1][66] = 1;  nat[2][66] = 0;  zat[2][66] = 0; logk[0][66] = 11.285; logk[1][66] = -2.7164; logk[2][66] =  0.19658; logk[3][66] = -2.7310e-02; logk[4][66] =  1.3816e-03;
nameGs[67] = "AlH";   ipr[67] = 2; nch[67] =  0; nel[67] = 2; nat[0][67] = 1; zat[0][67] = 13; nat[1][67] = 1;  zat[1][67] = 1;  nat[2][67] = 0;  zat[2][67] = 0; logk[0][67] = 12.191; logk[1][67] = -3.7636; logk[2][67] =  0.25557; logk[3][67] = -3.7261e-02; logk[4][67] =  1.9406e-03;
nameGs[68] = "SiH";   ipr[68] = 1; nch[68] =  0; nel[68] = 2; nat[0][68] = 1; zat[0][68] = 14; nat[1][68] = 1;  zat[1][68] = 1;  nat[2][68] = 0;  zat[2][68] = 0; logk[0][68] = 11.852; logk[1][68] = -3.7418; logk[2][68] =  0.15999; logk[3][68] = -2.0629e-02; logk[4][68] =  9.9897e-04;
nameGs[69] = "HS";    ipr[69] = 1; nch[69] =  0; nel[69] = 2; nat[0][69] = 1; zat[0][69] = 16; nat[1][69] = 1;  zat[1][69] = 1;  nat[2][69] = 0;  zat[2][69] = 0; logk[0][69] = 12.019; logk[1][69] = -4.2922; logk[2][69] =  0.14913; logk[3][69] = -1.8666e-02; logk[4][69] =  8.9438e-04;
nameGs[70] = "H2S";   ipr[70] = 1; nch[70] =  0; nel[70] = 2; nat[0][70] = 1; zat[0][70] = 16; nat[1][70] = 2;  zat[1][70] = 1;  nat[2][70] = 0;  zat[2][70] = 0; logk[0][70] = 24.632; logk[1][70] = -8.4616; logk[2][70] =  0.17014; logk[3][70] = -2.0236e-02; logk[4][70] =  9.5782e-04;
nameGs[71] = "HCl";   ipr[71] = 3; nch[71] =  0; nel[71] = 2; nat[0][71] = 1; zat[0][71] = 17; nat[1][71] = 1;  zat[1][71] = 1;  nat[2][71] = 0;  zat[2][71] = 0; logk[0][71] = 12.528; logk[1][71] = -5.1827; logk[2][71] =  0.18117; logk[3][71] = -2.4014e-02; logk[4][71] =  1.1994e-03;
nameGs[72] = "CaH";   ipr[72] = 3; nch[72] =  0; nel[72] = 2; nat[0][72] = 1; zat[0][72] = 20; nat[1][72] = 1;  zat[1][72] = 1;  nat[2][72] = 0;  zat[2][72] = 0; logk[0][72] = 11.340; logk[1][72] = -3.0144; logk[2][72] =  0.42349; logk[3][72] = -6.1467e-02; logk[4][72] =  3.1639e-03;
nameGs[73] = "CN";    ipr[73] = 1; nch[73] =  0; nel[73] = 2; nat[0][73] = 1; zat[0][73] = 7;  nat[1][73] = 1;  zat[1][73] = 6;  nat[2][73] = 0;  zat[2][73] = 0; logk[0][73] = 12.805; logk[1][73] = -8.2793; logk[2][73] =  .064162; logk[3][73] = -7.3627e-03; logk[4][73] =  3.4666e-04;
nameGs[74] = "NO";    ipr[74] = 1; nch[74] =  0; nel[74] = 2; nat[0][74] = 1; zat[0][74] = 8;  nat[1][74] = 1;  zat[1][74] = 7;  nat[2][74] = 0;  zat[2][74] = 0; logk[0][74] = 12.831; logk[1][74] = -7.1964; logk[2][74] =  0.17349; logk[3][74] = -2.3065e-02; logk[4][74] =  1.1380e-03;
nameGs[75] = "CO";    ipr[75] = 1; nch[75] =  0; nel[75] = 2; nat[0][75] = 1; zat[0][75] = 8;  nat[1][75] = 1;  zat[1][75] = 6;  nat[2][75] = 0;  zat[2][75] = 0; logk[0][75] = 13.820; logk[1][75] = -11.795; logk[2][75] =  0.17217; logk[3][75] = -2.2888e-02; logk[4][75] =  1.1349e-03;
nameGs[76] = "CO2";   ipr[76] = 1; nch[76] =  0; nel[76] = 2; nat[0][76] = 2; zat[0][76] = 8;  nat[1][76] = 1;  zat[1][76] = 6;  nat[2][76] = 0;  zat[2][76] = 0; logk[0][76] = 27.478; logk[1][76] = -17.098; logk[2][76] =  .095012; logk[3][76] = -1.2579e-02; logk[4][76] =  6.4058e-04;
nameGs[77] = "MgO";   ipr[77] = 3; nch[77] =  0; nel[77] = 2; nat[0][77] = 1; zat[0][77] = 12; nat[1][77] = 1;  zat[1][77] = 8;  nat[2][77] = 0;  zat[2][77] = 0; logk[0][77] = 11.702; logk[1][77] = -5.0326; logk[2][77] =  0.29641; logk[3][77] = -4.2811e-02; logk[4][77] =  2.2023e-03;
nameGs[78] = "AlO";   ipr[78] = 2; nch[78] =  0; nel[78] = 2; nat[0][78] = 1; zat[0][78] = 13; nat[1][78] = 1;  zat[1][78] = 8;  nat[2][78] = 0;  zat[2][78] = 0; logk[0][78] = 12.739; logk[1][78] = -5.2534; logk[2][78] =  0.18218; logk[3][78] = -2.5793e-02; logk[4][78] =  1.3185e-03;
nameGs[79] = "SiO";   ipr[79] = 1; nch[79] =  0; nel[79] = 2; nat[0][79] = 1; zat[0][79] = 14; nat[1][79] = 1;  zat[1][79] = 8;  nat[2][79] = 0;  zat[2][79] = 0; logk[0][79] = 13.413; logk[1][79] = -8.8710; logk[2][79] =  0.15042; logk[3][79] = -1.9581e-02; logk[4][79] =  9.4828e-04;
nameGs[80] = "SO";    ipr[80] = 1; nch[80] =  0; nel[80] = 2; nat[0][80] = 1; zat[0][80] = 16; nat[1][80] = 1;  zat[1][80] = 8;  nat[2][80] = 0;  zat[2][80] = 0; logk[0][80] = 12.929; logk[1][80] = -6.0100; logk[2][80] =  0.16253; logk[3][80] = -2.1665e-02; logk[4][80] =  1.0676e-03;
nameGs[81] = "CaO";   ipr[81] = 2; nch[81] =  0; nel[81] = 2; nat[0][81] = 1; zat[0][81] = 20; nat[1][81] = 1;  zat[1][81] = 8;  nat[2][81] = 0;  zat[2][81] = 0; logk[0][81] = 12.260; logk[1][81] = -6.0525; logk[2][81] =  0.58284; logk[3][81] = -8.5805e-02; logk[4][81] =  4.4425e-03;
nameGs[82] = "ScO";   ipr[82] = 3; nch[82] =  0; nel[82] = 2; nat[0][82] = 1; zat[0][82] = 21; nat[1][82] = 1;  zat[1][82] = 8;  nat[2][82] = 0;  zat[2][82] = 0; logk[0][82] = 13.747; logk[1][82] = -8.6420; logk[2][82] =  0.48072; logk[3][82] = -6.9670e-02; logk[4][82] =  3.5747e-03;
nameGs[83] = "ScO2";  ipr[83] = 3; nch[83] =  0; nel[83] = 2; nat[0][83] = 1; zat[0][83] = 21; nat[1][83] = 2;  zat[1][83] = 8;  nat[2][83] = 0;  zat[2][83] = 0; logk[0][83] = 26.909; logk[1][83] = -15.824; logk[2][83] =  0.39999; logk[3][83] = -5.9363e-02; logk[4][83] =  3.0875e-03;
nameGs[84] = "TiO";   ipr[84] = 2; nch[84] =  0; nel[84] = 2; nat[0][84] = 1; zat[0][84] = 22; nat[1][84] = 1;  zat[1][84] = 8;  nat[2][84] = 0;  zat[2][84] = 0; logk[0][84] = 13.398; logk[1][84] = -8.5956; logk[2][84] =  0.40873; logk[3][84] = -5.7937e-02; logk[4][84] =  2.9287e-03;
nameGs[85] = "VO";    ipr[85] = 3; nch[85] =  0; nel[85] = 2; nat[0][85] = 1; zat[0][85] = 23; nat[1][85] = 1;  zat[1][85] = 8;  nat[2][85] = 0;  zat[2][85] = 0; logk[0][85] = 13.811; logk[1][85] = -7.7520; logk[2][85] =  0.37056; logk[3][85] = -5.1467e-02; logk[4][85] =  2.5861e-03;
nameGs[86] = "VO2";   ipr[86] = 3; nch[86] =  0; nel[86] = 2; nat[0][86] = 1; zat[0][86] = 23; nat[1][86] = 2;  zat[1][86] = 8;  nat[2][86] = 0;  zat[2][86] = 0; logk[0][86] = 27.754; logk[1][86] = -14.040; logk[2][86] =  0.33613; logk[3][86] = -4.8215e-02; logk[4][86] =  2.4780e-03;
nameGs[87] = "YO";    ipr[87] = 3; nch[87] =  0; nel[87] = 2; nat[0][87] = 1; zat[0][87] = 39; nat[1][87] = 1;  zat[1][87] = 8;  nat[2][87] = 0;  zat[2][87] = 0; logk[0][87] = 13.514; logk[1][87] = -8.7775; logk[2][87] =  0.40700; logk[3][87] = -5.8053e-02; logk[4][87] =  2.9535e-03;
nameGs[88] = "YO2";   ipr[88] = 3; nch[88] =  0; nel[88] = 2; nat[0][88] = 1; zat[0][88] = 39; nat[1][88] = 2;  zat[1][88] = 8;  nat[2][88] = 0;  zat[2][88] = 0; logk[0][88] = 26.764; logk[1][88] = -16.447; logk[2][88] =  0.39991; logk[3][88] = -5.8916e-02; logk[4][88] =  3.0506e-03;
nameGs[89] = "ZrO";   ipr[89] = 3; nch[89] =  0; nel[89] = 2; nat[0][89] = 1; zat[0][89] = 40; nat[1][89] = 1;  zat[1][89] = 8;  nat[2][89] = 0;  zat[2][89] = 0; logk[0][89] = 13.296; logk[1][89] = -9.0129; logk[2][89] =  0.19562; logk[3][89] = -2.9892e-02; logk[4][89] =  1.6010e-03;
nameGs[90] = "ZrO2";  ipr[90] = 3; nch[90] =  0; nel[90] = 2; nat[0][90] = 1; zat[0][90] = 40; nat[1][90] = 2;  zat[1][90] = 8;  nat[2][90] = 0;  zat[2][90] = 0; logk[0][90] = 26.793; logk[1][90] = -16.151; logk[2][90] =  0.46988; logk[3][90] = -6.4636e-02; logk[4][90] =  3.2277e-03;
nameGs[91] = "CS";    ipr[91] = 1; nch[91] =  0; nel[91] = 2; nat[0][91] = 1; zat[0][91] = 16; nat[1][91] = 1;  zat[1][91] = 6;  nat[2][91] = 0;  zat[2][91] = 0; logk[0][91] = 13.436; logk[1][91] = -8.5574; logk[2][91] =  0.18754; logk[3][91] = -2.5507e-02; logk[4][91] =  1.2735e-03;
nameGs[92] = "SiS";   ipr[92] = 1; nch[92] =  0; nel[92] = 2; nat[0][92] = 1; zat[0][92] = 14; nat[1][92] = 1;  zat[1][92] = 16; nat[2][92] = 0;  zat[2][92] = 0; logk[0][92] = 13.182; logk[1][92] = -7.1147; logk[2][92] =  0.19300; logk[3][92] = -2.5826e-02; logk[4][92] =  1.2648e-03;
nameGs[93] = "TiS";   ipr[93] = 2; nch[93] =  0; nel[93] = 2; nat[0][93] = 1; zat[0][93] = 22; nat[1][93] = 1;  zat[1][93] = 16; nat[2][93] = 0;  zat[2][93] = 0; logk[0][93] = 13.316; logk[1][93] = -6.2216; logk[2][93] =  0.45829; logk[3][93] = -6.4903e-02; logk[4][93] =  3.2788e-03;
nameGs[94] = "SiC";   ipr[94] = 1; nch[94] =  0; nel[94] = 2; nat[0][94] = 1; zat[0][94] = 14; nat[1][94] = 1;  zat[1][94] = 6;  nat[2][94] = 0;  zat[2][94] = 0; logk[0][94] = 12.327; logk[1][94] = -5.0419; logk[2][94] =  0.13941; logk[3][94] = -1.9363e-02; logk[4][94] =  9.6202e-04;
nameGs[95] = "SiC2";  ipr[95] = 1; nch[95] =  0; nel[95] = 2; nat[0][95] = 1; zat[0][95] = 14; nat[1][95] = 2;  zat[1][95] = 6;  nat[2][95] = 0;  zat[2][95] = 0; logk[0][95] = 25.623; logk[1][95] = -13.085; logk[2][95] = -.055227; logk[3][95] =  9.3363e-03; logk[4][95] = -4.9876e-04;
nameGs[96] = "NaCl";  ipr[96] = 2; nch[96] =  0; nel[96] = 2; nat[0][96] = 1; zat[0][96] = 11; nat[1][96] = 1;  zat[1][96] = 17; nat[2][96] = 0;  zat[2][96] = 0; logk[0][96] = 11.768; logk[1][96] = -4.9884; logk[2][96] =  0.23975; logk[3][96] = -3.4837e-02; logk[4][96] =  1.8034e-03;
nameGs[97] = "MgCl";  ipr[97] = 2; nch[97] =  0; nel[97] = 2; nat[0][97] = 1; zat[0][97] = 12; nat[1][97] = 1;  zat[1][97] = 17; nat[2][97] = 0;  zat[2][97] = 0; logk[0][97] = 11.318; logk[1][97] = -4.2224; logk[2][97] =  0.21137; logk[3][97] = -3.0174e-02; logk[4][97] =  1.5480e-03;
nameGs[98] = "AlCl";  ipr[98] = 2; nch[98] =  0; nel[98] = 2; nat[0][98] = 1; zat[0][98] = 13; nat[1][98] = 1;  zat[1][98] = 17; nat[2][98] = 0;  zat[2][98] = 0; logk[0][98] = 11.976; logk[1][98] = -5.2228; logk[2][98] = -.010263; logk[3][98] =  3.9344e-03; logk[4][98] = -2.6236e-04;
nameGs[99] = "CaCl";  ipr[99] = 2; nch[99] =  0; nel[99] = 2; nat[0][99] = 1; zat[0][99] = 20; nat[1][99] = 1;  zat[1][99] = 17; nat[2][99] = 0;  zat[2][99] = 0; logk[0][99] = 12.314; logk[1][99] = -5.1814; logk[2][99] =  0.56532; logk[3][99] = -8.2868e-02; logk[4][99] =  4.2822e-03;
nameGs[100] = "HCN";  ipr[100] = 1; nch[100] =  0; nel[100] = 3; nat[0][100] = 1; zat[0][100] = 7;  nat[1][100] = 1;  zat[1][100] = 6;  nat[2][100] = 1;  zat[2][100] = 1; logk[0][100] = 25.635; logk[1][100] = -13.833; logk[2][100] =  0.13827; logk[3][100] = -1.8122e-02; logk[4][100] =  9.1645e-04;
nameGs[101] = "HCO";  ipr[101] = 1; nch[101] =  0; nel[101] = 3; nat[0][101] = 1; zat[0][101] = 8;  nat[1][101] = 1;  zat[1][101] = 6;  nat[2][101] = 1;  zat[2][101] = 1; logk[0][101] = 25.363; logk[1][101] = -13.213; logk[2][101] =  0.18451; logk[3][101] = -2.2973e-02; logk[4][101] =  1.1114e-03;
nameGs[102] = "MgOH"; ipr[102] = 2; nch[102] =  0; nel[102] = 3; nat[0][102] = 1; zat[0][102] = 12; nat[1][102] = 1;  zat[1][102] = 8;  nat[2][102] = 1;  zat[2][102] = 1; logk[0][102] = 24.551; logk[1][102] = -9.3818; logk[2][102] =  0.19666; logk[3][102] = -2.7178e-02; logk[4][102] =  1.3887e-03;
nameGs[103] = "AlOH"; ipr[103] = 2; nch[103] =  0; nel[103] = 3; nat[0][103] = 1; zat[0][103] = 13; nat[1][103] = 1;  zat[1][103] = 8;  nat[2][103] = 1;  zat[2][103] = 1; logk[0][103] = 25.707; logk[1][103] = -10.624; logk[2][103] =  .097901; logk[3][103] = -1.1835e-02; logk[4][103] =  5.8121e-04;
nameGs[104] = "CaOH"; ipr[104] = 2; nch[104] =  0; nel[104] = 3; nat[0][104] = 1; zat[0][104] = 20; nat[1][104] = 1;  zat[1][104] = 8;  nat[2][104] = 1;  zat[2][104] = 1; logk[0][104] = 24.611; logk[1][104] = -10.910; logk[2][104] =  0.60803; logk[3][104] = -8.7197e-02; logk[4][104] =  4.4736e-03;

    var nelt, nat1, nleft, nats, nsp1;
    var gsJ, gsK, kp, nn;

    var sum0;

    //double[] it = new double[150]; //needed
    //double[] kt = new double[150]; //needed


    //int[] type0 = new int[150];

    var iprt = 0;
    var ncht = 0;
    var ix = [];
    ix.length = 5;

    //#blank = ' '
    var ename = "e-";
    var mxatom = 30;
    var mxspec = 150;

    var n = 0;   //#record counter
    var np = 0;
    natom = -1;   //#neutral atomic species counter
    nlin1 = -1;
    nlin2 = -1;
    var tcomp = 0.0e0;

    //#nspec = len(name)
    //#print("nspec ", nspec)
    while (nameGs[n] != null){

    //console.log("master nameGS while loop, n ", n);
    //#for n in range(nspec):
        //#c
        //#c Each following input line specifies a distinct chemical species.
        //#c

    //#1
        //#namet = nameGs[n]
        iprt = ipr[n];
        ncht = nch[n];
        idel[n] = 1;
        //#print("iprt ", iprt, " ncht ", ncht)
    //#c
    //#c Determine the species type:
    //#c TYPE(N) = 1 --> Neutral atom
    //#c         = 2 --> Neutral molecule
    //#c         = 3 --> Negative ion
    //#c         = 4 --> Positive ion
    //#c

        if (nch[n] == 0){
//#c
//#c Species is neutral
//#c
            np = n;
            nelt = nel[n];
            nat1 = nat[0][n];

            if (nelt <= 1 && nat1 <= 1){
//#c
//#c Neutral atom (one atom of single element Z present)
//#c
                type0[n] = 1;
                natom = natom + 1;
                if (natom >= mxatom){
                    console.log(" *20 Error: Too many elements specified. " + "  Limit is " + mxatom);
                }

                iat[n] = natom;
                //#print("Setting indsp, n: ", n, " natom ", natom)
                indsp[natom] = n;  //#pointer to iat[], etc....
                //console.log("n " + n + " zat[0][n] " + zat[0][n]);
                indzat[zat[0][n]-1] = natom;   //#indzat's index is atomic number - 1
                ntot[n] = 1;
                neut[n] = n;

                tcomp = tcomp + comp[natom];
                iprt = ipr[n];
                if (iprt == 1){
                    nlin1 = nlin1 + 1;
                    lin1[natom] = nlin1;
                    linv1[nlin1] = natom;
                }

                if ( (iprt == 1) || (iprt == 2) ){
                    nlin2 = nlin2 + 1;
                    lin2[natom] = nlin2;
                    linv2[nlin2] = natom;
                }

            } else{  // <= 1 and nat1 <= 1 <= 1 and nat1 <= 1 condition

//#c
//#c Neutral molecule ( >1 atom present in species)
//#c
                type0[n] = 2;
                ntot[n] = nat1;
                neut[n] = n;

                nleft = (nelt - 1)*2;
                //#print("Neutral mol: n ", n, " name ", nameGs[n], " nelt ", nelt, " nleft ", nleft)

                if (nleft > 0){
                    for (var ii = 1; ii < 3; ii++){
                        ntot[n] = ntot[n] + nat[ii][n];
                    }
                }
            //#print("5: n ", n, " logk ", logk[0][n], " ", logk[1][n], " ", logk[2][n], " ", logk[3][n], " ", logk[4][n])
            }   // <= 1 and nat1 <= 1 <= 1 and nat1 <= 1 condition
        } else {  //nch[n]=0 condition
//#c
//#c Ionic species (nch .ne. 0)
//#c

            if (np <= -1){
                console.log(" *** error: ionic species encountered out of " + " sequence");
            }

            if (ncht < 0){
                type0[n] = 3;
            } else if (ncht > 0){
                type0[n] = 4;
            }

            neut[n] = np;
            nel[n] = nel[np];
            nelt = nel[n];
            for (var i = 0; i < nelt; i++){
                nat[i][n] = nat[i][np];
                zat[i][n] = zat[i][np];
            }

            ntot[n] = ntot[np];
         }  //nch[n]=0 condition

//#print("6: n ", n, " ip ", ip[n], " logwt ", logwt[n])

//#c
//#c Generate master array tying chemical formula of species to
//#c its table index. A unique index is generated for a given
//#c (possibly charged) species containing up to 4 atoms.
//#c
//#c Index #1 <--  Ionic charge + 2  (dim. 4, allows chg -1 to +2)
//#c       #2 <--> Index to Z of 1st atom in species (23 allowed Z)
//#c       #3 <-->    "          2nd        "        ( 6 allowed Z)
//#c       #4 <-->    "          3rd        "        ( 4 allowed Z)
//#c       #5 <-->    "          4th        "        ( 1 allowed Z)
//#c

        //#ix[0] = nch[n] + 2;
        ix[0] = nch[n] + 1;
        nelt = nel[n];
        //#k = 1;
        gsK = 0;

        //#print("n ", n, " name ", nameGs[n])
        for (var i = 0; i < nelt; i++){

            nats = nat[i][n];
            for (var j99 = 0; j99 < nats; j99++){

                gsK = gsK + 1;
                if (gsK > 4){
                    console.log(" *21 Error: species " + " contains > 4 atoms " + nameGs[n]);
                }

                ix[gsK] = itab[zat[i][n]-1];
                //console.log("n "+ n + " name "+ nameGs[n]+ " k "+ k+ " i "+ i+ " n "+ n+ " zat "+ zat[i][n]+ " itab "+ itab[zat[i][n]-1]);
                //#print("i ", i, " j ", j, " k ", k, " ix ", ix[k], "ntab ", ntab[k])
                //#print("zat-1 ", zat[i][n]-1, "itab ", itab[zat[i][n]-1])
                if ( (ix[gsK] <= 0) || (ix[gsK] > ntab[gsK]) ){
                    //console.log(" *22 Error: species atom z= not in allowed element list"
                    //  + nameGs[n] + " " + (zat[i][n]-1).toString());
                }
            }
        }

        if (gsK < 4){
            //console.log("k < 4, k= "+ k );
            kp = gsK + 1;
            for (var kk = kp; kk < 5; kk++){
                //console.log("kk "+ kk);
                ix[kk] = 0;
            }
            //#print("kk ", kk, " ix ", ix[kk])
        }


        indx[ix[0]][ix[1]][ix[2]][ix[3]][ix[4]] = n;
        //console.log("n " + n + " name " + nameGs[n] + " ix[] " + ix[0] + " " + ix[1] + " " + ix[2] + " " + ix[3] + " " + ix[4]);
        n = n + 1;
            //#print("n ", n, " name ", nameGs[n], " ix ", ix[0], ix[1], ix[2], ix[3], ix[4],\
            //#      " indx ", indx[ix[0]][ix[1]][ix[2]][ix[3]][ix[4]])

    }//end while
    //#go to 1
    //#Ends if namet != ''??

    //#Get next line of data and test of end-of-file:
    //#gsline = inputHandle.readline()
    //#lineLength = len(gsline)
            //#print("lineLength = ", lineLength)
    //#Ends file read loop "with open(infile...??)

    //#After read loop:
//#c
//#c Normalize abundances such that SUM(COMP) = 1
//#c
    nspec = n;
    //#nameGs[nspec+1] = ename
    nameGs[nspec] = ename;
    iat[mxspec-1] = mxatom;
    comp[mxatom-1] = 0.0e0;
    neut[mxspec-1] = mxspec;
    nsp1 = nspec + 1;

    for (var n99 = nsp1-1; n99 < mxspec; n99++){
        idel[n99] = 0;
    }


    //#print("GsRead: nspec ", nspec, " natom ", natom)
    if (nspec != 0){

        console.log("natom ", natom);
        for (var j99 = 0; j99 < natom; j99++){
            natsp[j99] = -1;
            comp[j99] = comp[j99]/tcomp;
        }

//#c
//#c Calculate the atomic (molecular) weight of each constituent
//#c
        for (var n99 = 0; n99 < nspec; n99++){

            //#print("name ", nameGs[n], " nel ", nel[n])
            nelt = nel[n99];
            sum0 = 0.0e0;
            iprt = ipr[n99];

            console.log("nelt " , nelt);
            for (var i = 0; i < nelt; i++){

                //#print("i ", i, " n ", n, " zat ", zat[i][n]-1, " indzat ", indzat[zat[i][n]-1])
                gsJ = indzat[zat[i][n99]-1];
                //#print("j ", j)
                nn = indsp[gsJ];
                //#print(" nn ", nn)
                natsp[gsJ] = natsp[gsJ] + 1;
                //console.log("gsJ " , gsJ, " natsp " , natsp[gsJ]); 
                iatsp[gsJ][natsp[gsJ]] = n99;
                sum0 = sum0 + nat[i][n99]*awt[nn];
                if (ipr[nn] > iprt){
                    iprt = ipr[nn];
                }
            }
            awt[n99] = sum0;
            ipr[n99] = iprt;
        }
//#c
//#c Fill array of direct indices of species needed for opacity
//#c calculations.
//#c
        if (nix > 0){
            for (var i = 0; i < nix; i++){
                ixn[i] = indx[ixa[0][i]][ixa[1][i]][ixa[2][i]][ixa[3][i]][ixa[4][i]];
                //console.log("i "+ i+ " indx " +
                //  indx[ixa[0][i]][ixa[1][i]][ixa[2][i]][ixa[3][i]][ixa[4][i]] +
                //  " ixa[] "+ ixa[0][i]+ " " + ixa[1][i]+ " " + ixa[2][i]+ " " + ixa[3][i]+ " " + ixa[4][i]);
                if (ixn[i] == 149){
                    console.log("0*** Warning: Opacity source " + " not included in GAS data tables " + chix[i]);
                }
            }
        }

        //#cis: Try this:
        nlin1+=1;
        nlin2+=1;
        natom+=1;

    } // if nspec !=0 condition

var gsNspec = nspec;
var gsName = [];
gsName.length = nspec;
for (var i = 0; i < nspec; i++){
   gsName[i] = nameGs[i];
}
//#GAS composition should be corrected to CSPy values at this point:
//# Number of atomic elements in GAS package:
var gsNumEls = comp.length;
var gsComp = [];
gsComp.length = gsNumEls;

for (var i = 0; i < gsNumEls; i++){
   gsComp[i] = comp[i];
}

//#Array of pointers FROM CSPy elements TO GAS elements
//#CAUTION: elements are not contiguous in GAS' species array (are
//# NOT the first gsNumEls entries!)

//#Default value of -1 means CSPy element NOT in GAS package
var csp2gas = [];
csp2gas.length = nelemAbnd;
for (var i = 0; i < nelemAbnd; i++){
   csp2gas[i] = -1;
}
var csp2gasIon1 = [];
csp2gasIon1.length = nelemAbnd;
for (var i = 0; i < nelemAbnd; i++){
   csp2gasIon1[i] = -1;
}

var csp2gasIon2 = [];
csp2gasIon2.length = nelemAbnd;
for (var i = 0; i < nelemAbnd; i++){
   csp2gasIon2[i] = -1;
}

for (var i = 0; i < nelemAbnd; i++){
    for (var j = 0; j < gsNspec; j++){
        if ( cname[i].trim() == (gsName[j].trim()) ){
            csp2gas[i] = j;
        }
        if ( (cname[i].trim()+"+") == (gsName[j].trim()) ){
            csp2gasIon1[i] = j;
        }
        if ( (cname[i].trim()+"++") == (gsName[j].trim()) ){
            csp2gasIon2[i] = j;
        }
    }
}

//#print("csp2gas ", csp2gas)

var gsLogk = [];
gsLogk.length = 5;
for (var i = 0; i < 5; i++){
   gsLogk[i] = [];
   gsLogk[i].length = 150;
}
for (var i = 0; i < 5; i++){
   for (var j = 0; j < 150; j++){
      //console.log("i, j " + i + " " + j + " logk[][] " + logk[i][j]);
      gsLogk[i][j] = logk[i][j];
   }
}

var gsFirstMol = -1; //  # index of 1st molecular species in Gas' species list
for (var i = 0; i < gsNspec; i++){
    gsFirstMol+=1;
    //console.log("i " + i + " gsLogk[0] " + gsLogk[0][i]);
    if (gsLogk[0][i] != 0.0){
        break;
    }
}

//# Number of molecular species in GAS package:
var gsNumMols = gsNspec - gsFirstMol;

//# Number of ionic species in GAS package:
var gsNumMols = gsNspec - gsFirstMol;

//# Number of ionic species in GAS package:
var gsNumIons = gsNspec - gsNumEls - gsNumMols;
//#print("gsNspec ", gsNspec, " gsFirstMol ", gsFirstMol, " gsNumMols ",
//      #gsNumMols, " gsNumIon ", gsNumIons)

console.log("gsNspec " + gsNspec + " gsNumEls " + gsNumEls + " gsFirstMol " + gsFirstMol + " gsNumMols " + gsNumMols + " gsNumIons " + gsNumIons); 

 
//Set up for molecules with JOLA bands:
   var jolaTeff = 5000.0;
   //var jolaTeff = 1500.0; //test
   var numJola = 7; //for now
   //var numJola = 2; // test
   var jolaSpecies = []; // molecule name
   jolaSpecies.length = numJola;
   var jolaSystem = []; //band system
   jolaSystem.length = numJola;
   //var jolaDeltaLambda = []; //band system
   //jolaDeltaLambda.length = numJola;
   var jolaWhichF = []; // molecule name
   jolaWhichF.length = numJola;


   if (teff <= jolaTeff){

     jolaSpecies[0] = "TiO"; // molecule name
     jolaSystem[0] = "TiO_C3Delta_X3Delta"; //band system //DeltaLambda=0
     jolaWhichF[0] = "Jorgensen";
     //jolaDeltaLambda[0] = 0;
     jolaSpecies[1] = "TiO"; // molecule name
     jolaSystem[1] = "TiO_c1Phi_a1Delta"; //band system //DeltaLambda=1
     jolaWhichF[1] = "Jorgensen";
     //jolaDeltaLambda[1] = 1;
     jolaSpecies[2] = "TiO"; // molecule name
     jolaSystem[2] = "TiO_A3Phi_X3Delta"; //band system //DeltaLambda=0
     jolaWhichF[2] = "Jorgensen";
     //jolaDeltaLambda[2] = 0;
     jolaSpecies[3] = "TiO"; // molecule name
     jolaSystem[3] = "TiO_B3Pi_X3Delta"; //band system 
     jolaWhichF[3] = "Jorgensen";
     jolaSpecies[4] = "TiO"; // molecule name
     jolaSystem[4] = "TiO_E3Pi_X3Delta"; //band system  
     jolaWhichF[4] = "Jorgensen";
     jolaSpecies[5] = "TiO"; // molecule name
     jolaSystem[5] = "TiO_b1Pi_a1Delta"; //band system 
     jolaWhichF[5] = "Jorgensen";
     jolaSpecies[6] = "TiO"; // molecule name
     jolaSystem[6] = "TiO_b1Pi_d1Sigma"; //band system
     jolaWhichF[6] = "Jorgensen";

    //#"G-band" at 4300 A - MK classification diagnostic:
    //#Needs Allen's approach to getting f
    //#jolaSpecies[7] = "CH" #// molecule name
    //#jolaSystem[7] = "CH_A2Delta_X2Pi" #//band system  
    //#jolaWhichF[7] = "Allen"

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
     //console.log("i " + i + " logAz " + logE*logAz[i]);
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

    var plotOneId = document.getElementById("plotOne");
    var cnvsOneId = document.getElementById("plotOneCnvs");
    var plotTwoId = document.getElementById("plotTwo");
    var cnvsTwoId = document.getElementById("plotTwoCnvs");
    var plotThreeId = document.getElementById("plotThree");
    var cnvsThreeId = document.getElementById("plotThreeCnvs");
    var plotFourId = document.getElementById("plotFour");
    var cnvsFourId = document.getElementById("plotFourCnvs");
    var plotFiveId = document.getElementById("plotFive");
    var cnvsFiveId = document.getElementById("plotFiveCnvs");
    var plotSixId = document.getElementById("plotSix");
    var cnvsSixId = document.getElementById("plotSixCnvs");
    var plotSevenId = document.getElementById("plotSeven");
    var cnvsSevenId = document.getElementById("plotSevenCnvs");
    var plotEightId = document.getElementById("plotEight");
    var cnvsEightId = document.getElementById("plotEightCnvs");
    var plotNineId = document.getElementById("plotNine");
    var cnvsNineId = document.getElementById("plotNineCnvs");
    var plotTenId = document.getElementById("plotTen");
    var cnvsTenId = document.getElementById("plotTenCnvs");
    var plotElevenId = document.getElementById("plotEleven");
    var cnvsElevenId = document.getElementById("plotElevenCnvs");
    var plotTwelveId = document.getElementById("plotTwelve");
    var cnvsTwelveId = document.getElementById("plotTwelveCnvs");
    var plotThirteenId = document.getElementById("plotThirteen");
    var cnvsThirteenId = document.getElementById("plotThirteenCnvs");
    var plotFourteenId = document.getElementById("plotFourteen");
    var cnvsFourteenId = document.getElementById("plotFourteenCnvs");
    var plotFifteenId = document.getElementById("plotFifteen");
    var cnvsFifteenId = document.getElementById("plotFifteenCnvs");
    var plotSixteenId = document.getElementById("plotSixteen");
    var cnvsSixteenId = document.getElementById("plotSixteenCnvs");
    var plotSeventeenId = document.getElementById("plotSeventeen");
    var cnvsSeventeenId = document.getElementById("plotSeventeenCnvs");
    var plotEighteenId = document.getElementById("plotEighteen");
    var cnvsEighteenId = document.getElementById("plotEighteenCnvs");


    var printModelId = document.getElementById("printModel"); //detailed model print-out area


    if (ifShowAtmos === true) {
        //plotOneId.style.display = "block";
        plotTwoId.style.display = "block";
        plotThreeId.style.display = "block";
        plotFourteenId.style.display = "block";
        plotFifteenId.style.display = "block";
        if($("#showLogNums").val()=="None"){
          plotSixteenId.style.display = "none";
        }
        if($("#showLogPP").val()=="None"){
           plotEighteenId.style.display = "none";
        }
        plotSeventeenId.style.display ="none";
    }

    if (ifShowRad === true) {
        plotFourId.style.display = "block";
        plotFiveId.style.display = "block";
        plotSeventeenId.style.display = "block";
        plotSixteenId.style.display="block";
        if($("#showLogNums").val()=="None"){
          plotSixteenId.style.display = "none";
        }
        if($("#showLogPP").val()=="None"){
           plotEighteenId.style.display = "block";
        }
    }
    if (ifShowLine === true) {
        plotSixId.style.display = "block";
        plotEightId.style.display = "block";
                if($("#showLogNums").val()=="None"){
        plotSixteenId.style.display = "none";
        }
    }
    if (ifShowLogNums === true) {
        //plotSixId.style.display = "block";
        plotEightId.style.display = "block";
        if($("#showLogNums").val()=="None"){
        plotSixteenId.style.display = "none";
        }
    }

    if (ifShowAtmos === false) {
        //plotOneId.style.display = "none";
        plotTwoId.style.display = "none";
        plotThreeId.style.display = "none";
        plotFourteenId.style.display = "none";
        plotFifteenId.style.display = "none";
        plotSixteenId.style.display = "none";
    }

    if (ifShowRad === false) {
        plotFourId.style.display = "none";
       // plotFiveId.style.display = "none";
    }
    if (ifShowLine === false) {
        plotSixId.style.display = "none";
        plotEightId.style.display = "none";
    }
    if ((ifPrintAtmos === true) ||
            (ifPrintSED === true) ||
            (ifPrintIntens === true) ||
            (ifPrintLDC === true) ||
            (ifPrintChem === true) ||
            (ifPrintPP === true) ||
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

        var kBoltz = 1.3806488E-16; // Boltzmann constant in ergs/K
        var logKBoltz = Math.log(kBoltz);
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
         //console.log("i " + i + " logNH[i] " + logE*logNH[i]);
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
 var masterMolPops = [];
 masterMolPops.length = gsNumMols; 
 for (var i = 0; i < gsNumMols; i++){
    masterMolPops[i] = [];
    masterMolPops[i].length = numDeps;
 }
//initialize masterMolPops for mass density (rho) calculation:
  for (var i = 0; i < gsNumMols; i++){
    for (var j = 0; j < numDeps; j++){
       masterMolPops[i][j] = -49.0;  //these are logarithmic
    }
  }
  //var thisUwAV = [];
  //thisUwAV.length = 2;
  //var thisUwBV = [];
  //thisUwBV.length = 2;
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

var log300 = Math.log(300.0);
var log2 = Math.log(2.0);

//#GAS package parameters:
var isolv = 1;
var tol = 1.0e-2;
var maxit = 10;

//#GAS package interface variables:
var neq;
var gsPe0, gsPe, gsMu, gsRho;

var gsP0 = [];
gsP0.length = 40;
var topP0 = [];
topP0.length = 40;
var gsPp = [];
gsPp.length = 150;

//#For reporting purposes only:
var log10MasterGsPp = [];
log10MasterGsPp.length = gsNspec;
for (var iSpec = 0; iSpec < gsNspec; iSpec++){
   log10MasterGsPp[iSpec] = [];
   log10MasterGsPp[iSpec].length = numDeps;
   for (var iD = 0; iD < numDeps; iD++){
       log10MasterGsPp[iSpec][iD] = -99.0;
   }
}
var thisN;

var GAStemp = 6000.0;


//Begin Pgas-kapp iteration

//
    var maxZDonor = 28; //Nickel
//DEBUG 
//console.log(" *** DEBUG mode:  nOuterIter = 1 hardwired !!!");
//console.log(" *** DEBUG mode:  nOuterIter = 1 hardwired !!!");
//console.log(" *** DEBUG mode:  nOuterIter = 1 hardwired !!!");
//nOuterIter = 5;
    for (var pIter = 0; pIter < nOuterIter; pIter++){

    //console.log("pIter " + pIter);

    if (teff <= GAStemp){
    //#if (teff <= 100000.0):   #test

        for (var iD = 0; iD < numDeps; iD++){
            //console.log("isolv "+ isolv+ " temp "+ temp[0][iD]+ " guessPe "+ guessPe[0][iD] +  " guessPGas "+ guessPGas[0][iD]);

            var returnGasEst = gasest(isolv, temp[0][iD], guessPGas[0][iD]);
         // Unpack structure returned by GasEst - sigh!
            neq = returnGasEst[0];
            gsPe0 = returnGasEst[1];
            //console.log("neq " + neq + " gsPe0 " + gsPe0);
            for (var k99 = 2; k99 < 42; k99++){
               gsP0[k99-2] = returnGasEst[k99];
            }

            if (iD == 1){
                for (var iSpec = 0; iSpec < 40; iSpec++){
                   topP0[iSpec] = 0.5 * gsP0[iSpec];
                }
            }

            //#Upper boundary causes problems:
            if (pIter > 0 && iD == 0){
                gsPe0 = 0.5 * newPe[0][1];
                for (var iSpec = 0; iSpec < 40; iSpec++){
                   gsP0[iSpec] = topP0[iSpec];
                }
            }

            //console.log("Before 1st gas() iD "+ iD+ " gsPe0 "+ gsPe0+ " gsP0[0] "+ gsP0[0]+ " neq "+ neq);

            var returnGas = gas(isolv, temp[0][iD], guessPGas[0][iD], gsPe0, gsP0, neq, tol, maxit);

            gsPe = returnGas[0];
            gsRho = returnGas[1];
            gsMu = returnGas[2];
            //console.log("gsPe " + gsPe + " gsRho " + gsRho + " gsMu " + gsMu);
            for (var k99 = 3; k99 < 153; k99++){
               gsPp[k99-3] = returnGas[k99];
               //if ( (iD == 0) || (iD == 47) ){
               //   console.log("iD "+ iD+ " k99 " + k99 + " gsPp "+ gsPp[k99-3]);
               //}
            }

            //console.log("iD "+ iD+ " gsPe "+ gsPe+ " gsPp[0] "+ gsPp[0]+ " gsMu "+ gsMu+ " gsRho "+ gsRho);

            //console.log("k " + k);
            newPe[0][iD] = gsPe;
            newPe[1][iD] = Math.log(gsPe);
            newNe[0][iD] = gsPe / kBoltz / temp[0][iD];
            newNe[1][iD] = Math.log(newNe[0][iD]);
            guessPe[0][iD] = newPe[0][iD];
            guessPe[1][iD] = newPe[1][iD];
            guessNe[0][iD] = newNe[0][iD];
            guessNe[1][iD] = newNe[1][iD];

            rho[0][iD] = gsRho;
            rho[1][iD] = Math.log(gsRho);
            mmw[iD] = gsMu * amu;
            //console.log("iD "+ iD+ " guessNe "+ guessNe[0][iD]+ " gsNH[0] "+ gsPp[0]/k/temp[0][iD]+ " mmw "+ mmw[iD] + " rho "+ rho[0][iD]);

            //#Take neutral stage populations for atomic species from GAS:
            for (var iElem = 0; iElem < nelemAbnd; iElem++){

                if (csp2gas[iElem] != -1){
                    //#element is in GAS package:
                    thisN = gsPp[csp2gas[iElem]] / kBoltz / temp[0][iD];
                    masterStagePops[iElem][0][iD] = Math.log(thisN);
                    //if (iD == 20 && iElem == 0){
                    //   console.log("iD " + iD + " iElem " + iElem + " mSP[][] " + masterStagePops[iElem][0][iD]);
                    //} 
                }
            }

            //#print("iD ", iD, cname[19], gsName[csp2gas[19]], " logNCaI ", logE*masterStagePops[19][0][iD])
            for (var i = 0; i < gsNumMols; i++){
                thisN = gsPp[i+gsFirstMol] / kBoltz / temp[0][iD];
                masterMolPops[i][iD] = Math.log(thisN);
            }

            //#Needed  now GAS??
            for (var iA = 0; iA < nelemAbnd; iA++){
                if (csp2gas[iA] != -1){
                    //#element is in GAS package:
                    logNz[iA][iD] = Math.log10(gsPp[csp2gas[iA]]) - logK - temp[1][iD];
                }
            }

        } //iD loop

        for (var iElem = 0; iElem < 26; iElem++){
            species = cname[iElem] + "I";
            chiIArr[0] = getIonE(species);
            //THe following is a 2-element vector of temperature-dependent partitio fns, U,
            // that are base e log_e U
            log10UwAArr[0] = getPartFn2(species); //base e log_e U
            species = cname[iElem] + "II";
            chiIArr[1] = getIonE(species);
            log10UwAArr[1] = getPartFn2(species); //base e log_e U
            species = cname[iElem] + "III";
            chiIArr[2] = getIonE(species);
            log10UwAArr[2] = getPartFn2(species); //base e log_e U
            species = cname[iElem] + "IV";
            chiIArr[3] = getIonE(species);
            log10UwAArr[3] = getPartFn2(species); //base e log_e U
            species = cname[iElem] + "V";
            chiIArr[4] = getIonE(species);
            log10UwAArr[4] = getPartFn2(species); //base e log_e U
            species = cname[iElem] + "VI";
            chiIArr[5] = getIonE(species);
            log10UwAArr[5] = getPartFn2(species); //base e log_e U
            //double logN = (eheu[iElem] - 12.0) + logNH;



            //#Neeed?  Now GAS:
            logNums = stagePops3(masterStagePops[iElem][0], guessNe, chiIArr, log10UwAArr,
                                //#thisNumMols, logNumBArr, dissEArr, log10UwBArr, logQwABArr, logMuABArr, \
                                numDeps, temp);

        for (var iStage = 0; iStage < numStages; iStage++){
            for (var iTau = 0; iTau < numDeps; iTau++){

                masterStagePops[iElem][iStage][iTau] = logNums[iStage][iTau];

            }
        }
     }

   } // end teff <= GAStemp

   if (teff > GAStemp){  //#teff > FoVtemp:

//  Converge Pg-Pe relation starting from intital guesses at Pg and Pe
//  - assumes all free electrons are from single ionizations
//  - David Gray 3rd Ed. Eq. 9.8:

      for (var neIter = 0; neIter < nInnerIter; neIter++){
    //console.log("iD    logE*newPe[1][iD]     logE*guessPe[1]     logE*guessPGas[1]");
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
    // that are base e log_e U
           log10UwLArr = getPartFn2(species); //base e log_e U
           species = cname[iElem] + "II";
           log10UwUArr = getPartFn2(species); //base e log_e U
           logPhi = sahaRHS(chiI, log10UwUArr, log10UwLArr, thisTemp);
           logPhiOverPe = logPhi - guessPe[1][iD];
           logOnePlusPhiOverPe = Math.log(1.0 + Math.exp(logPhiOverPe));
           logPeNumerTerm = logAz[iElem] + logPhiOverPe - logOnePlusPhiOverPe;
           peNumerator = peNumerator + Math.exp(logPeNumerTerm);
           logPeDenomTerm = logAz[iElem] + Math.log(1.0 + Math.exp(logPeNumerTerm));
           peDenominator = peDenominator + Math.exp(logPeDenomTerm);
       } //iElem chemical element loop
       newPe[1][iD] = guessPGas[1][iD] + Math.log(peNumerator) - Math.log(peDenominator);
       newPe[0][iD] = Math.exp(newPe[1][iD]);
       guessPe[1][iD] = newPe[1][iD];
       guessPe[0][iD] = Math.exp(guessPe[1][iD]);
    } //iD depth loop

  } //end Pg_Pe iteration neIter

    for (var iD = 0; iD < numDeps; iD++){
       newNe[1][iD] = newPe[1][iD] - temp[1][iD] - logK;
       newNe[0][iD] = Math.exp(newNe[1][iD]);
       guessNe[1][iD] = newNe[1][iD];
       guessNe[0][iD] = newNe[0][iD];
    }

//
//Refine the number densities of the chemical elements at all depths
     logNz = getNz(numDeps, temp, guessPGas, guessPe, ATot, nelemAbnd, logAz);
     for (var i = 0 ; i < numDeps; i++){
        logNH[i] = logNz[0][i];
        //console.log("i " + i + " logNH[i] " + logE*logNH[i]);
     }


//
//  Compute ionization fractions of H & He for kappa calculation
//
//  Default inializations:
       zScaleList = 1.0; //initialization
       //these 2-element temperature-dependent partition fns are logarithmic

//
////H & He only for now... we only compute H, He, and e^- opacity sources:
   //for (var iElem = 0; iElem < 2; iElem++){
//H to Fe only for now... we only compute opacity sources for elements up to Fe:
//FLAG!
   for (var iElem = 0; iElem < 26; iElem++){
   //for (var iElem = 0; iElem < 2; iElem++){
       species = cname[iElem] + "I";
       chiIArr[0] = getIonE(species);
    //THe following is a 2-element vector of temperature-dependent partitio fns, U,
    // that are base e log_e U
       log10UwAArr[0] = getPartFn2(species); //base e log_e U
       species = cname[iElem] + "II";
       chiIArr[1] = getIonE(species);
       log10UwAArr[1] = getPartFn2(species); //base e log_e U
       species = cname[iElem] + "III";
       chiIArr[2] = getIonE(species);
       log10UwAArr[2] = getPartFn2(species); //base e log_e U
       species = cname[iElem] + "IV";
       chiIArr[3] = getIonE(species);
       log10UwAArr[3] = getPartFn2(species); //base e log_e U
       species = cname[iElem] + "V";
       chiIArr[4] = getIonE(species);
       log10UwAArr[4] = getPartFn2(species); //base e log_e U
       species = cname[iElem] + "VI";
       chiIArr[5] = getIonE(species);
       log10UwAArr[5] = getPartFn2(species); //base e log_e U
       //double logN = (eheu[iElem] - 12.0) + logNH;

       logNums = stagePops(logNz[iElem], guessNe, chiIArr, log10UwAArr,
                     numDeps, temp);

     for (var iStage = 0; iStage < numStages; iStage++){
          for (var iTau = 0; iTau < numDeps; iTau++){

            masterStagePops[iElem][iStage][iTau] = logNums[iStage][iTau];
 //save ion stage populations at tau = 1:
       } //iTau loop
    } //iStage loop
  } //iElem loop

//Get mass density from chemical composition:
     rho = massDensity2(numDeps, nelemAbnd, logNz, cname);

//Total number density of gas particles: nuclear species + free electrons:
//AND
 //Compute mean molecular weight, mmw ("mu"):
    for (var i = 0; i < numDeps; i++){
      Ng[i] =  newNe[0][i]; //initialize accumulation with Ne
    }
    for (var i = 0; i < numDeps; i++){
      for (var j = 0; j < nelemAbnd; j++){
         Ng[i] =  Ng[i] + Math.exp(logNz[j][i]); //initialize accumulation
      }
     logMmw = rho[1][i] - Math.log(Ng[i]);  // in g
     mmw[i] = Math.exp(logMmw);
    }

 } //end teff > GAStemp

//H & He only for now... we only compute H, He, and e^- opacity sources:
      logKappaHHe = kappas2(numDeps, newPe, zScale, temp, rho,
                     numLams, lambdaScale, logAz[1],
                     masterStagePops[0][0], masterStagePops[0][1],
                     masterStagePops[1][0], masterStagePops[1][1], newNe, teff, logTotalFudge);

//Add in metal b-f opacity from adapted Moog routines:
      logKappaMetalBF = masterMetal(numDeps, numLams, temp, lambdaScale, masterStagePops);
//Add in Rayleigh scattering opacity from adapted Moog routines:
      logKappaRayl = masterRaylGas(numDeps, numLams, temp, lambdaScale, masterStagePops, gsName, gsFirstMol, masterMolPops);

//Convert metal b-f & Rayleigh scattering oapcities to cm^2/g and sum up total opacities
   var logKapMetalBF, logKapRayl, kapContTot;
   //console.log("i     tauRos      l      lamb     kappa    kappaHHe    kappaMtl     kappaRayl    kapContTot");
   for (var iL = 0; iL < numLams; iL++){
       for (var iD = 0; iD < numDeps; iD++){
          logKapMetalBF = logKappaMetalBF[iL][iD] - rho[1][iD];
          logKapRayl = logKappaRayl[iL][iD] - rho[1][iD];
          kapContTot = Math.exp(logKappaHHe[iL][iD]) + Math.exp(logKapMetalBF) + Math.exp(logKapRayl); //debug
          logKappa[iL][iD] = Math.log(kapContTot);
         // if ( (iD%10 == 1) && (iL%10 == 0) ){
         //    console.log("%03d, %21.15f, %03d, %21.15f, %21.15f, %21.15f, %21.15f, %21.15f %n",
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

var amu = 1.66053892E-24; // atomic mass unit in g
var logAmu = Math.log(amu);


//###################################################
//#
//#
//#
//# Re-converge Ionization/chemical equilibrium WITH molecules
//#
//#
//#
//####################################################

//
// Now that the atmospheric structure is settled:
// Separately converge the Ne-ionization-fractions-molecular equilibrium for
// all elements and populate the ionization stages of all the species for spectrum synthesis:
//
//stuff to save ion stage pops at tau=1:
  var iTauOne = tauPoint(numDeps, tauRos, unity);

//
//  Default inializations:
       zScaleList = 1.0; //initialization
       //these 2-element temperature-dependent partition fns are logarithmic

//#Final run through Phil's GAS EOS/Chemic equil. for consistency with last HSE call above:


if (teff <= GAStemp){

    for (var iD = 0; iD < numDeps; iD++){

        //#print("isolv ", isolv, " temp ", temp[0][iD], " guessPGas ", guessPGas[0][iD])
        var returnGasEst = gasest(isolv, temp[0][iD], guessPGas[0][iD]);
        // Unpack structure returned by GasEst - sigh!
        neq = returnGasEst[0];
        gsPe0 = returnGasEst[1];
        for (var k99 = 2; k99 < 42; k99++){
           gsP0[k99-2] = returnGasEst[k99];
        }

        //#print("iD ", iD, " gsPe0 ", gsPe0, " gsP0 ", gsP0, " neq ", neq)

        //console.log("Before 2nd gas() iD "+ iD+ " gsPe0 "+ gsPe0+ " gsP0[0] "+ gsP0[0]+ " neq "+ neq);
        var returnGas = gas(isolv, temp[0][iD], guessPGas[0][iD], gsPe0, gsP0, neq, tol, maxit);

        gsPe = returnGas[0];
        gsRho = returnGas[1];
        gsMu = returnGas[2];
        for (var k99 = 3; k99 < 153; k99++){
            gsPp[k99-3] = returnGas[k99];
            //if ( (iD == 0) || (iD == 47) ){
            //   console.log("Take 2 iD "+ iD+ " k99 " + k99 + " gsPp "+ gsPp[k99-3]);
            //}
        }

        for (var iSpec = 0; iSpec < gsNspec; iSpec++){
            log10MasterGsPp[iSpec][iD] = Math.log10(gsPp[iSpec]);
        }
        //console.log("Take 2: iD "+ iD+ " gsPe "+ gsPe+ " gsPp[0] "+ gsPp[0]+ " gsMu "+ gsMu+ " gsRho "+ gsRho);

        newPe[0][iD] = gsPe;
        newPe[1][iD] = Math.log(gsPe);
        newNe[0][iD] = gsPe / kBoltz / temp[0][iD];
        newNe[1][iD] = Math.log(newNe[0][iD]);
        guessPe[0][iD] = newPe[0][iD];
        guessPe[1][iD] = newPe[1][iD];

        rho[0][iD] = gsRho;
        rho[1][iD] = Math.log(gsRho);
        mmw[iD] = gsMu * amu;

        //#print("iD ", iD, " logT ", logE*temp[1][iD], " logNe ", logE*newNe[1][iD], " logRho ", logE*rho[1][iD], " mmw ", logE*math.log(mmw[iD]*Useful.amu()) )


        //#Take neutral stage populations for atomic species from GAS:
        for (var iElem = 0; iElem < nelemAbnd; iElem++){

            if (csp2gas[iElem] != -1){
                //#element is in GAS package:
                thisN = gsPp[csp2gas[iElem]] / kBoltz / temp[0][iD];
                masterStagePops[iElem][0][iD] = Math.log(thisN);
            }

         }

        //#print("iD ", iD, cname[19], gsName[csp2gas[19]], " logNCaI ", logE*masterStagePops[19][0][iD])
        for (var i = 0; i < gsNumMols; i++){
            thisN = gsPp[i+gsFirstMol] / kBoltz / temp[0][iD];
            masterMolPops[i][iD] = Math.log(thisN);
        }

        //#Needed  now GAS??
        for (var iA = 0; iA < nelemAbnd; iA++){
            if (csp2gas[iA] != -1){
                //#element is in GAS package:
                logNz[iA][iD] = Math.log10(gsPp[csp2gas[iA]]) - logK - temp[1][iD];
            }
        }

    } //#end iD loop

    //#Catch species NOT in Phil's GAS Chem. Equil. package
    for (var iElem = 0; iElem < nelemAbnd; iElem++){

        if (csp2gas[iElem] == -1){

            species = cname[iElem] + "I";
            chiIArr[0] = getIonE(species);
            //The following is a 2-element vector of temperature-dependent partitio fns, U,
            // that are base e log_e U
            log10UwAArr[0] = getPartFn2(species); //base e log_e U
            species = cname[iElem] + "II";
            chiIArr[1] = getIonE(species);
            log10UwAArr[1] = getPartFn2(species); //base e log_e U
            species = cname[iElem] + "III";
            chiIArr[2] = getIonE(species);
            log10UwAArr[2] = getPartFn2(species); //base e log_e U
            species = cname[iElem] + "IV";
            chiIArr[3] = getIonE(species);
            log10UwAArr[3]= getPartFn2(species); //base 1e log_e U
            species = cname[iElem] + "V";
            chiIArr[4] = getIonE(species);
            log10UwAArr[4]= getPartFn2(species); //base 1e log_e U
            species = cname[iElem] + "VI";
            chiIArr[5] = getIonE(species);
            log10UwAArr[5]= getPartFn2(species); //base e log_e U



            //#Element NOT in GAS package - compute ionization equilibrium:
            logNums = stagePops(logNz[iElem], guessNe, chiIArr, log10UwAArr,
                                                   //#thisNumMols, logNumBArr, dissEArr, log10UwBArr, logQwABArr, logMuABArr, \
                            numDeps, temp);

            for (var iStage = 0; iStage < numStages; iStage++){
               for (var iTau = 0; iTau < numDeps; iTau++){
                  masterStagePops[iElem][iStage][iTau] = logNums[iStage][iTau];
                  //save ion stage populations at tau = 1:
               } //iTau loop
             tauOneStagePops[iElem][iStage] = logNums[iStage][iTauOne];
            } //iStage loop

     } //csp2gas = -1 if

 } //iElem loop

} //end if teff <= GAStemp

if (teff > GAStemp){

//Iterate the electron densities, ionization fractions, and molecular densities:
//
//FLAG!
 //for (var neIter2 = 0; neIter2 < 3; neIter2++){
 for (var neIter2 = 0; neIter2 < nInnerIter; neIter2++){

   //console.log("neIter2 " + neIter2);

   for (var iElem = 0; iElem < nelemAbnd; iElem++){
       species = cname[iElem] + "I";
       chiIArr[0] = getIonE(species);
    //THe following is a 2-element vector of temperature-dependent partitio fns, U,
    // that are base e log_e U
       log10UwAArr[0] = getPartFn2(species); //base e log_e U
       species = cname[iElem] + "II";
       chiIArr[1] = getIonE(species);
       log10UwAArr[1] = getPartFn2(species); //base e log_e U
       species = cname[iElem] + "III";
       chiIArr[2] = getIonE(species);
       log10UwAArr[2] = getPartFn2(species); //base e log_e U
       species = cname[iElem] + "IV";
       chiIArr[3] = getIonE(species);
       log10UwAArr[3]= getPartFn2(species); //base e log_e U
       species = cname[iElem] + "V";
       chiIArr[4] = getIonE(species);
       log10UwAArr[4]= getPartFn2(species); //base e log_e U
       species = cname[iElem] + "VI";
       chiIArr[5] = getIonE(species);
       log10UwAArr[5]= getPartFn2(species); //base e log_e U


       logNums = stagePops(logNz[iElem], guessNe, chiIArr, log10UwAArr,
                     numDeps, temp);

     for (var iStage = 0; iStage < numStages; iStage++){
          for (var iTau = 0; iTau < numDeps; iTau++){
            masterStagePops[iElem][iStage][iTau] = logNums[iStage][iTau];
 //save ion stage populations at tau = 1:
       } //iTau loop
       tauOneStagePops[iElem][iStage] = logNums[iStage][iTauOne];
    } //iStage loop

    // #Fill in in PP report:
    for (var iTau = 0; iTau < numDeps; iTau++){

       if (csp2gas[iElem] != -1){
          log10MasterGsPp[csp2gas[iElem]][iTau] = logE*(logNums[0][iTau] + temp[1][iTau] + logK);
       }
       if (csp2gasIon1[iElem] != -1){
          log10MasterGsPp[csp2gasIon1[iElem]][iTau] = logE*(logNums[1][iTau] + temp[1][iTau] + logK);
       }
       if (csp2gasIon2[iElem] != -1){
          log10MasterGsPp[csp2gasIon2[iElem]][iTau] = logE*(logNums[2][iTau] + temp[1][iTau] + logK);
       }

    } //iTau loop

  } //iElem loop

   var log10UwA = [];
   log10UwA.length = 5;

//Compute updated Ne & Pe:
     //initialize accumulation of electrons at all depths
     for (var iTau = 0; iTau < numDeps; iTau++){
       newNe[0][iTau] = 0.0;
     }
     for (var iTau = 0; iTau < numDeps; iTau++){
        for (var iElem = 0; iElem < nelemAbnd; iElem++){
          newNe[0][iTau] = newNe[0][iTau]
                   + Math.exp(masterStagePops[iElem][1][iTau])   //1 e^- per ion
                   + 2.0 * Math.exp(masterStagePops[iElem][2][iTau]);   //2 e^- per ion
                   //+ 3.0 * Math.exp(masterStagePops[iElem][3][iTau])   //3 e^- per ion
                   //+ 4.0 * Math.exp(masterStagePops[iElem][4][iTau]);   //3 e^- per ion
        }
        newNe[1][iTau] = Math.log(newNe[0][iTau]);
// Update guess for iteration:
        guessNe[0][iTau] = newNe[0][iTau];
        guessNe[1][iTau] = newNe[1][iTau];
     }

  } //end Ne - ionzation fraction -molecular equilibrium iteration neIter2

} // end teff > GAStemp if

//


    } // end stellar structure ifLineOnly

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
    // Set up continuum info:
    var isCool = 7300.0; //Class A0


    //Set up opacity:
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
        var jolaDeltaLambda;
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

console.log("Initial masterLams[0] " + masterLams[0] + " [1] " + masterLams[1] + " [2] " + masterLams[2]);

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
            }
           //console.log("iLine " + iLine + " listLam0nm " + listLam0nm + " listLineLambdas[0] " + listLineLambdas[0]);

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
//console.log("Line list: masterLams[0] " + masterLams[0] + " [1] " + masterLams[1] + " [2] " + masterLams[2]);

 if (teff <= jolaTeff){
//Begin loop over JOLA bands - isert JOLA oapcity into opacity spectum...
   var helpJolaSum = 0.0;

 if (ifTiO == 1){

   for (var iJola = 0; iJola < numJola; iJola++){

      //Find species in molecule set:
      for (var iMol = gsFirstMol; iMol < gsNspec; iMol++){
        if (gsName[iMol] == jolaSpecies[iJola]){
          //console.log("mname " + mname[iMol]);
          for (var iTau= 0; iTau < numDeps; iTau++){
             logNumJola[iTau] = masterMolPops[iMol-gsFirstMol][iTau];
             //var logTiOpp = logNumJola[iTau] + temp[1][iTau] + logK;
             //console.log("TiO pp " + logE*logTiOpp);
          }
        }
      }

        jolaOmega0 = getOrigin(jolaSystem[iJola]);  //band origin ?? //Freq in Hz OR waveno in cm^-1 ??
        //jolaRSqu = getSqTransMoment(jolaSystem[iJola]); //needed for total vibrational band oscillator strength (f_v'v")
        jolaB = getRotConst(jolaSystem[iJola]); // B' and b" values of upper and lower vibational state
        jolaLambda = getWaveRange(jolaSystem[iJola]); //approx wavelength range of band
        jolaDeltaLambda = getDeltaLambda(jolaSystem[iJola]);
        //Line strength factor from Allen's 4th Ed., p. 88, "script S":
        //jolaQuantumS = getQuantumS(jolaSystem[iJola]);

        jolaLogF = -99.0; // #Default

      if (jolaWhichF[iJola] == "Allen"){

        jolaRSqu = getSqTransMoment(jolaSystem[iJola]); //needed for total vibrational band oscillator strength (f_v'v")
        jolaQuantumS = getQuantumS(jolaSystem[iJola]);

//Compute line strength, S, Allen, p. 88:
        jolaS = jolaRSqu * jolaQuantumS; //may not be this simple (need q?)
//Compute logf , Allen, p. 61 Section 4.4.2 - for atoms or molecules - assumes g=1 so logGf = logF:
        //jolaLogF = logSTofHelp + Math.log(jolaOmega0) + Math.log(jolaS); //if omega0 is a freq in Hz
        //Gives wrong result?? jolaLogF = logSTofHelp + logC + Math.log(jolaOmega0) + Math.log(jolaS); //if omega0 is a waveno in cm^-1
        var checkgf = 303.8*jolaS/(10.0*jolaLambda[0]); //"Numerical relation", Allen 4th, p. 62 - lambda in A
        //console.log("jolaLogF " + logE*jolaLogF + " log checkgf " + Math.log10(checkgf) + " jolaOmega0 " + jolaOmega0[iJola]);
        jolaLogF = Math.log(checkgf); //better??
        //console.log("jolaLogF " + jolaLogF);
        //jolaLogF = -999.0; //test
     }

     var jolaRawF = 0.0;
     var jolaF = 0.0;

     if (jolaWhichF[iJola] == "Jorgensen"){
         //#Band strength: Jorgensen, 1994, A&A, 284, 179 approach - we have the f values directly:

         //#This is practically the astrophysical tuning factor:
         jolaQuantumS = getQuantumS(jolaSystem[iJola]);

         jolaRawF = getFel(jolaSystem[iJola]);
         jolaF = jolaRawF * jolaQuantumS;
         //#print(iJola, " jQS ", jolaQuantumS, " jRF ", jolaRawF, " jF ", jolaF)
         jolaLogF = Math.log(jolaF);
         //#print("iJola ", iJola, " logF ", 10.0**(logE*jolaLogF+14) )
     }


        if (jolaDeltaLambda == 0){
           jolaAlphP = jolaAlphP_DL0; // alpha_P - weight of P branch (Delta J = 1)
           jolaAlphR = jolaAlphR_DL0; // alpha_R - weight of R branch (Delta J = -1)
           jolaAlphQ = jolaAlphQ_DL0; // alpha_Q - weight of Q branch (Delta J = 0)
        }
        if (jolaDeltaLambda != 0){
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
             // //       //console.log("iW " + iW + " iD " + iD + " jolaLogKappaL " + jolaLogKappaL[iW][iD]);
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
            //console.log("iJola " + iJola);
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
var kBoltz = 1.3806488E-16; // Boltzmann constant in ergs/K
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
var logKBoltz = Math.log(kBoltz);
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
    console.log("radius " + radius + " roundNum " + roundNum);
    console.log("colr " + colr + " xTab " + xTab + " lineColor " + lineColor);
    console.log("textId " + textId);

    txtPrint("<span title='Stellar radius'><em>R</em> = </span> "
            + roundNum
            + " <span title='Solar radii'>\n\
<a href='http://en.wikipedia.org/wiki/Solar_radius' target='_blank'><em>R</em><sub>Sun</sub></a>\n\
</span> ",
            20 + colr * xTab, 15, 200, lineColor, textId);
    roundNum = bolLum.toPrecision(3);
    txtPrint("<span title='Bolometric luminosity'>\n\
<a href='http://en.wikipedia.org/wiki/Luminosity' target='_blank'><em>L</em><sub>Bol</sub></a> = \n\
</span> "
            + roundNum
            + " <span title='Solar luminosities'>\n\
<a href='http://en.wikipedia.org/wiki/Solar_luminosity' target='_blank'><em>L</em><sub>Sun</sub></a>\n\
</span> ",
            20 + colr * xTab, 40, 200, lineColor, textId);
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
            360, 40, 200, lineColor, textId);
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
       + roundNum4, 180 + colr * xTab, 15, 400, lineColor, textId);
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
</a>: " + roundNum6, 180, 40, 400, lineColor, textId);

    // Echo back the *actual* input parameters:
    var warning = "";
    if (teff < 6000) {
        //warning = "<span style='color:red'><em>T</em><sub>eff</sub> < 6000 K <br />Cool star mode";
        warning = "<span style='color:red'>Cool star mode</span>";
        txtPrint(warning, 600, 10, 200, lineColor, textId);
    } else {
        //warning = "<span style='color:blue'><em>T</em><sub>eff</sub> > 6000 K <br />Hot star mode</span>";
        warning = "<span style='color:blue'>Hot star mode</span>";
        txtPrint(warning, 600, 10, 200, lineColor, textId);
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
    txtPrint(spectralType, 600, 40, 200, lineColor, textId);
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
    txtPrint(echoText, 750, 10, 200, lineColor, textId);

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

//First, remove all SVG elements:
    //var listOfSVGNodes = document.querySelectorAll("svg");
//We think everything will be a line or a circle:
    var listOfLineNodes = document.querySelectorAll("line");
    var listOfCircNodes = document.querySelectorAll("circle");

    //var numSVGNodes = listOfSVGNodes.length;
    var numLineNodes = listOfLineNodes.length;
    var numCircNodes = listOfCircNodes.length;

//We have to be prepared that this might be our first time through - ??:
    //if (numSVGNodes > 0){

//Remove line elements (axues, tickmarks, barns, etc.)
       if (numLineNodes > 0){
           for (var iNode = 0; iNode < numLineNodes; iNode++){
               listOfLineNodes[iNode].parentNode.removeChild(listOfLineNodes[iNode]);
           }
       } //numLineNodes > 0 condition

//Remove circle elements (axes, tickmarks, barns, etc.)
       if (numCircNodes > 0){
           for (var iNode = 0; iNode < numCircNodes; iNode++){
               listOfCircNodes[iNode].parentNode.removeChild(listOfCircNodes[iNode]);
           }
       } //numCircNodes > 0 condition

    //} //numSVGNdodes > 0 condition


//
//  function washer() creates and inserts a panel into the HTML doc 
//   AND erases it by "gray-washing" it upon each re-execution of the script 

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
    //
    //Leave uncommented:
    var bNormVega, vNormVega, rNormVega;
    ////Uncomment this block and set input stellar parameters to Vega to re-calibrate 
    //// colors to make Vega's disk centre intensity white 
    var bvrVega0 = bandIntens[2][0] + bandIntens[3][0] + bandIntens[4][0];
    var bNormVega = bvrVega0 / bandIntens[2][0]; 
    var vNormVega = bvrVega0 / bandIntens[3][0]; 
    var rNormVega = bvrVega0 / bandIntens[4][0]; 
    //console.log("bNormVega " + bNormVega + " vNormVega  " + vNormVega + " rNormVega " + rNormVega);
//Set Vega disk centre intensity calibration factors (reciprocals of these should total to 1.0):
    bNormVega = 2.223444;
    vNormVega = 3.813167;
    rNormVega = 3.472246;
   
// Total B + V + R band intensity of prgram object at disk centre: 
    var bvr0 = bandIntens[2][0] + bandIntens[3][0] + bandIntens[4][0];
    //console.log("bvr0 " + bvr0);
//Find greatest disk-centre band-integrated I value among B, V, and R for final renormalization:
    var rrI = bandIntens[4][0] / bvr0 * rNormVega;  
    var ggI = bandIntens[3][0] / bvr0 * vNormVega;  
    var bbI = bandIntens[2][0] / bvr0 * bNormVega; 
    //console.log("rrI " + rrI + " ggI " + ggI + " bbI " + bbI);
    var rrggbbI = [rrI, ggI, bbI];
    var minmaxI = minMax(rrggbbI);
    var maxI = minmaxI[1];
    var renormI = rrggbbI[maxI]; 
    //console.log("rrggbbI " + rrggbbI + " minmaxI " + minmaxI + " maxI " + maxI + " renormI " + renormI);
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
    rrI = bandIntens[4][i] / bvr0 * rNormVega;  
    ggI = bandIntens[3][i] / bvr0 * vNormVega;  
    bbI = bandIntens[2][i] / bvr0 * bNormVega; 
    //console.log("i = 3:");
    //console.log("Before renorm: rrI " + rrI + " ggI " + ggI + " bbI " + bbI);
//Renormalize:
    rrI = rrI /renormI; 
    ggI = ggI /renormI; 
    bbI = bbI /renormI; 
    //console.log("After renorm: rrI " + rrI + " ggI " + ggI + " bbI " + bbI);
    
    var RGBArr = [];
    RGBArr.length = 3;
    RGBArr[0] = Math.ceil(255.0 * rrI);
    RGBArr[1] = Math.ceil(255.0 * ggI);
    RGBArr[2] = Math.ceil(255.0 * bbI);
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
        var panelOrigin = washer(plotRow, plotCol, wDiskColor, plotSevenId, cnvsSevenId);
				//JB
	panelX = panelOrigin[0];
        panelY = panelOrigin[1];
 //console.log("plotRow, plotCol,panelX panelY " + plotRow + " " + plotCol + " " + panelX + " " + panelY);
				//JB
	cnvsSevenId.setAttribute('fill', wDiskColor);

        var thet1, thet2;
        var thet3;

        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Limb_darkening' target='_blank'>White light disk</a></span> <br />\n\
     <span style='font-size:small'>(Logarithmic radius) </span>",
                titleOffsetX, titleOffsetY, 300, lineColor, plotSevenId);
            txtPrint("<span style='font-size:normal; color:black'><em>&#952</em> = </span>",
                150 + titleOffsetX, titleOffsetY, 300, lineColor, plotSevenId);
                                //JB
            var yCenterCnvs = panelHeight / 2; 
            var xCenterCnvs = panelWidth / 2;
				//JB

	var limbRadius = Math.ceil(radiusPx * Math.sin(Math.acos(cosTheta[1][numThetas-1])));

                        
				//JB
//console.log(numThetas);
				
// Adjust position to center star:
// Radius is really the *diameter* of the symbol

        //  Loop over limb darkening sub-disks - largest to smallest
         for (var i = numThetas - 1; i >= 1; i--) {
         //for (var i = numThetas - 1; i >= numThetas - 1; i--) {
//	for (var i = numThetas - 1; i <= 1; i++) {
	
            ii = 1.0 * i;

            // LTE Eddington-Barbier limb darkening: I(Tau=0, cos(theta)=t) = B(T(Tau=t))
            var cosFctr = cosTheta[1][i];

            var cosFctrNext = cosTheta[1][i-1];
			
            var radiusPxICnvs = Math.ceil(radiusPx * Math.sin(Math.acos(cosFctr)));
            var radiusPxICnvsNext = Math.ceil(radiusPx * Math.sin(Math.acos(cosFctrNext)));

            rrI = bandIntens[4][i] / bvr0 * rNormVega;
            ggI = bandIntens[3][i] / bvr0 * vNormVega;
            bbI = bandIntens[2][i] / bvr0 * bNormVega;
            //console.log("ii " + ii + " rrI " + rrI + " ggI " + ggI + " bbI " + bbI);
            rrI = Math.ceil(255.0 * rrI / renormI);
            ggI = Math.ceil(255.0 * ggI / renormI);
            bbI = Math.ceil(255.0 * bbI / renormI);
            //console.log("Renormalized: rrI " + rrI + " ggI " + ggI + " bbI " + bbI);
            var rrINext = bandIntens[4][i-1] / bvr0 * rNormVega;
            var ggINext = bandIntens[3][i-1] / bvr0 * vNormVega;
            var bbINext = bandIntens[2][i-1] / bvr0 * bNormVega;
            rrINext = Math.ceil(255.0 * rrINext / renormI);
            ggINext = Math.ceil(255.0 * ggINext / renormI);
            bbINext = Math.ceil(255.0 * bbINext / renormI);


            var RGBHex = colHex(rrI, ggI, bbI);
            var RGBHexNext = colHex(rrINext, ggINext, bbINext);
 				//JB
            //console.log("RGBHex " + RGBHex + " RGBHexNext "  + RGBHexNext);

//	if((radiusPxICnvs==radiusPxICnvsNext)){ radiusPxICnvsNext = radiusPxICnvs - 0.9*i/3;}

//create gradient for each circle
        var thisCircR = radiusPxICnvsNext/radiusPxICnvs;
        //console.log("thisCircR " + thisCircR);
/* Can't get radial gradient to work
	var grd = document.createElementNS(xmlW3, 'radialGradient');
	grd.setAttributeNS(null, 'id', 'grdId');
        grd.setAttributeNS(null, 'cx', "50%");
        grd.setAttributeNS(null, 'cy', "50%");
        grd.setAttributeNS(null, 'r', thisCircR);
        //grd.setAttributeNS(null, 'r', 0.5);
        //grd.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);			

       // console.log(radiusPxICnvsNext/radius);
	
        var stop0 = document.createElementNS(xmlW3, 'stop');
        //stop0.setAttributeNS(null, 'offset', 0.0);
        stop0.setAttributeNS(null, 'offset', thisCircR);
        stop0.setAttributeNS(null, 'stop-color', RGBHexNext);
	stop0.setAttributeNS(null, 'stop-opacity', 1.0);
        grd.appendChild(stop0);

       //  console.log(radiusPxICnvsNext/radiusPxICnvs);

        var stop1 = document.createElementNS(xmlW3, 'stop');
        stop1.setAttributeNS(null, 'offset', 1.0);
        stop1.setAttributeNS(null, 'stop-color', RGBHex);
	stop1.setAttributeNS(null, 'stop-opacity', 1.0);
        grd.appendChild(stop1);

	//gradN1.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
        //gradN2.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
				//JB
*/
//create circle for each theta
        var circ = document.createElementNS(xmlW3, 'circle');
        circ.setAttributeNS(null, 'cx', xCenterCnvs);
        circ.setAttributeNS(null, 'cy', yCenterCnvs);
        circ.setAttributeNS(null, 'r', radiusPxICnvs);
        //circ.setAttributeNS(null, 'fill', 'url(#grdId)');
        circ.setAttributeNS(null, 'fill', RGBHexNext);
        //circ.setAttributeNS(xmlns, xmlnsLink, xmlnsLink2);

        //cnvsSevenId.appendChild(grd);
        cnvsSevenId.appendChild(circ);
       
 				//JB
            //
            //Angle indicators
            if ((i % 2) === 0) {
                thet1 = 180.0 * Math.acos(cosTheta[1][i]) / Math.PI;
                thet2 = thet1.toPrecision(2);
                thet3 = thet2.toString(10);
				//JB
                txtPrint("<span style='font-size:small; background-color:#888888'>" + thet3 + "</span>",
                        150 + titleOffsetX + (i + 2) * 10, titleOffsetY, 50, RGBHex, plotSevenId);

				//JB    
	    }
//
        }  // numThetas loop, i
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
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, plotTwelveId, cnvsTwelveId);
				
				//JB
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
				//JB
				//JB
        // Add title annotation:

        //var titleYPos = xLowerYOffset - 1.15 * yRange;
        //var titleXPos = 1.02 * xOffset;

        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
					//JB
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Limb_darkening' target='_blank'>Gaussian filter</a></span><span style='font-size:small'> &#955 = " + diskLambda + " nm</span> </br>\n\
     <span style='font-size:small'>(Logarithmic radius) </span>",
                titleOffsetX, titleOffsetY + 20, 300, lineColor, plotTwelveId);
        txtPrint("<span style='font-size:normal; color:black'><em>&#952</em> = </span>",
                220 + titleOffsetX, titleOffsetY + 20, 300, lineColor, plotTwelveId);
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

            thisCircR = radiusPxICnvsNext/radiusPxICnvs;
				//JB

/* Can't get SVG ring gradients to work
//create gradient for each circle
	var grd = document.createElementNS(xmlW3,'radialGradient');
	grd.setAttributeNS(null, 'id', 'grdId');
        grd.setAttributeNS(null, 'cx', 0.5);
        grd.setAttributeNS(null, 'cy', 0.5);
        grd.setAttributeNS(null, 'r', 0.5);
        //grd.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);			

       // console.log(radiusPxICnvsNext/radius);
	
        var stop0 = document.createElementNS(xmlW3, 'stop');
        stop0.setAttributeNS(null, 'offset', 1.0);
        stop0.setAttributeNS(null, 'stop-color', RGBHex);
	stop0.setAttributeNS(null, 'stop-opacity', 1);
        grd.appendChild(stop0);

       //  console.log(radiusPxICnvsNext/radiusPxICnvs);

        var stop1 = document.createElementNS(xmlW3, 'stop');
        stop1.setAttributeNS(null, 'offset', radiusPxICnvsNext/radiusPxICnvs)//"0%");
        stop1.setAttributeNS(null, 'stop-color', RGBHexNext);
	stop1.setAttributeNS(null, 'stop-opacity', 1);
        grd.appendChild(stop1);

	//gradN1.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
        //gradN2.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
				//JB
*/
//create circle for each theta
        var circ = document.createElementNS(xmlW3, 'circle');
        circ.setAttributeNS(null, 'cx',xCenterCnvs);
        circ.setAttributeNS(null, 'cy',yCenterCnvs);
        circ.setAttributeNS(null, 'r',radiusPxICnvs);
   //     circ.setAttributeNS(null, 'fill', 'url(grdId)');
        circ.setAttributeNS(null, 'fill', RGBHex);
        //circ.setAttributeNS(xmlns, xmlnsLink, xmlnsLink2);

        //cnvsTwelveId.appendChild(grd);
        cnvsTwelveId.appendChild(circ);
       
				//JB
        //
       //Angle indicators
        if ((i % 2) === 0) {
           thet1 = 180.0 * Math.acos(cosTheta[1][i]) / Math.PI;
           thet2 = thet1.toPrecision(2);
           thet3 = thet2.toString(10);
				//JB
           txtPrint("<span style='font-size:small; background-color:#888888'>" + thet3 + "</span>",
                   220 + titleOffsetX + (i + 2) * 10, titleOffsetY + 20, 300, RGBHex, plotTwelveId);

                             }
//
        } //numThetas loop, i
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
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, plotTenId, cnvsTenId);
				//JB

        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
				//JB
//	SVGTen.setAttribute('fill',wDefaultColor);
				//JB
        var xAxisParams = XAxis(panelX, panelY, minXData, maxXData, xAxisName, fineness, plotTenId, cnvsTenId);

				//JB
        //xOffset = xAxisParams[0];
        //yOffset = xAxisParams[4];
        var rangeXData10 = xAxisParams[1];
        var deltaXData10 = xAxisParams[2];
        var deltaXPxl10 = xAxisParams[3];
        var minXData10 = xAxisParams[6]; //updated value
        var maxXData10 = xAxisParams[7]; //updated value
        var xAxisLength10 = xAxisLength; //special case
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
                titleOffsetX, titleOffsetY, 300, lineColor, plotTenId);
					//JB
     var TiOString = "Off";
     if (ifTiO == 1){
        TiOString = "On";
     }
					//JB
     txtPrint("TiO bands: " + TiOString, titleOffsetX + 10, titleOffsetY+35, 300, lineColor, plotTenId);
					//JB
        var xShift, zShift, xShiftDum, zLevel;
        var RGBHex; //, r255, g255, b255;
        //var rangeXData10 = 1.0e7 * (masterLams[ilLam1] - masterLams[ilLam0]); //already consistenty computed by XAxis()
        //console.log("minXData " + minXData + " ilLam0 " + ilLam0 + " masterLams[ilLam0] " + masterLams[ilLam0]);

        var barWidth, xBarShift0, xBarShift1, xPos, yPos, nameLbl, lamLbl, lamLblStr, lamLblNum;
        var barHeight = 75.0;

//We can only palce vertical bars by setting marginleft, so search *AHEAD* in wavelength to find width
// of *CURRENT* bar.
        var lambdanm = masterLams[ilLam0] * 1.0e7; //cm to nm
        //console.log("ilLam0 " + ilLam0 + " ilLam1 " + ilLam1);
        yFinesse = -160;
        var thisYPos = xAxisYCnvs + yFinesse;


//variables needed in the loop, mostly for scaling/converting to nm

                              //JB
        for (var i = ilLam0 - 1; i < ilLam1 + 1; i++) {
        //for (var i = ilLam0 - 1; i < ilLam0 + 5; i++) {

            var nextLambdanm = masterLams[i] * 1.0e7; //cm to nm

            xBarShift0 = xAxisLength10 * (lambdanm - minXData10) / (maxXData10 - minXData10);
            xBarShift1 = xAxisLength10 * (nextLambdanm - minXData10) / (maxXData10 - minXData10);
            barWidth = xBarShift1 - xBarShift0; //in device pixels

if (barWidth > 0.5) {
//count ++;     
                barWidth = barWidth + 1.0;
                zLevel = ((masterFlux[0][i] / norm) - minZData) / rangeZData;
            var nextRGBHex = lambdaToRGB(lambdanm, zLevel);

        var xTickPosCnvs = xAxisLength10 * (lambdanm - minXData10) / (maxXData10 - minXData10);
        var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;
/*
 * Gradients not working
//create gradient for each bar 
	var grd = document.createElementNS(xmlW3, 'linearGradient');
	grd.setAttributeNS(null, 'id', 'grdId');
        grd.setAttributeNS(null, 'x1', 0.0);
        grd.setAttributeNS(null, 'x2', 1.0);
        grd.setAttributeNS(null, 'y1', 0.0);
        grd.setAttributeNS(null, 'y2', 0.0);
        //grd.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);			

//create TWO stops per loop and add the to the gradient
        var stop0 = document.createElementNS(xmlW3, 'stop');
        stop0.setAttributeNS(null, 'offset', 0.0);
        //stop0.setAttributeNS(null, 'stop-color', RGBHex);
        stop0.setAttributeNS(null, 'stop-color', '#FF0000');
	//stop0.setAttributeNS(null, 'stop-opacity', 1);
        grd.appendChild(stop0);

        var stop1 = document.createElementNS(xmlW3, 'stop');
        stop1.setAttributeNS(null, 'offset', 1.0);
        //stop1.setAttributeNS(null, 'stop-color', RGBHexNext);
        stop1.setAttributeNS(null, 'stop-color', '#FF0000');
	//stop1.setAttributeNS(null, 'stop-opacity', 1);
        grd.appendChild(stop1);

        console.log("stop0 " + stop0 + " stop1 " + stop1 + " grd " + grd);
*/
				//JB
//create rectangle for each theta
  //console.log("xShiftCnvs " + xShiftCnvs + " thisYPos " + thisYPos + " barWidth " + barWidth + " barHeight " + barHeight);
  //console.log("RGBHex " + RGBHex + " RGBHexNext " + RGBHexNext);
        var rect = document.createElementNS(xmlW3, 'rect');
        rect.setAttributeNS(null, 'x', xShiftCnvs);
        rect.setAttributeNS(null, 'y', thisYPos);
        rect.setAttributeNS(null, 'width', barWidth);
        rect.setAttributeNS(null, 'height', barHeight);
        //rect.setAttributeNS(null, 'fill', 'url(grdId)');
        rect.setAttributeNS(null, 'fill', RGBHex);
        //rect.setAttributeNS(xmlns, xmlnsLink, xmlnsLink2);

        //cnvsTenId.appendChild(grd);
        cnvsTenId.appendChild(rect);
       
                      //JB

                //console.log("lambdanm " + lambdanm + " nextLambdanm " + nextLambdanm + " xShiftDum " + xShiftDum + " barWidth " + barWidth);

                lambdanm = nextLambdanm;
                RGBHex = nextRGBHex;
            }  //barWidth condition
        }  // i loop (wavelength)


       var yAxisLength10 = 1.0;  //special
       var minYData10 = -0.5;
       var rangeYData10 = 1.0; 
    //cnvsTenId.addEventListener("mouseover", function() { 
    cnvsTenId.addEventListener("click", function() {
       //dataCoords(event, plotTenId);
       //Fix - this is an image, not a plot - the y-axis doesn't mean anything:
       var xyString = dataCoords(event, cnvsTenId, xAxisLength10, minXData10, rangeXData10, xAxisXCnvs,
                               yAxisLength10, minYData10, rangeYData10, yAxisYCnvs);
       //console.log("PLOT 10: xyString: " + xyString);
       txtPrint(xyString, titleOffsetX+200, titleOffsetY+320, 150, lineColor, plotTenId);
    });


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

            xPos = xAxisLength10 * (listLam0[i] - minXData10) / (maxXData10 - minXData10);
            xPos = xAxisXCnvs + xPos - 5; // finesse
            //console.log("xPos " + xPos + " xLabelYOffset " + xLabelYOffset);

            nameLbl = "<span style='font-size: xx-small'>" + listName[i] + "</span>";
            lamLblNum = listLam0[i].toPrecision(4);
            //lamLblStr = lamLblNum.toString(10);
            //lamLbl = "<span style='font-size: xx-small'>" + lamLblStr + "</span>";
            lamLbl = "<span style='font-size: xx-small'>" + listLamLbl[i] + "</span>";

                                      //JB
            if (listLam0[i].toPrecision(4) < 380){
            //  xPos = 25;
            //  yPos = 100 + 10*i;
      //var nmLbl = "<span style='font-size: xx-small'>  (" + lamLblNum + "[nm])</span>";       
        //  txtPrintYAx(nameLbl , xPos, yPos, RGBHex, plotTenId);
         // txtPrintYAx(nmLbl , xPos+25, yPos, RGBHex, plotTenId);
              }else{

          txtPrint(nameLbl , xPos, yPos, 50, RGBHex, plotTenId);
          txtPrint(lamLbl, xPos, yPos + 10, 50, RGBHex, plotTenId);
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
     //jolaDeltaLambda[0] = 0;
     jolaSpecies[1] = "TiO"; // molecule name
     jolaSystem[1] = "TiO_c1Phi_a1Delta"; //band system //DeltaLambda=1
     jolaLabel[1] = "TiO c<sup>1</sup>&#934-a<sup>1</sup>&#916"; //band system //DeltaLambda=1
     //jolaDeltaLambda[1] = 1;
     jolaSpecies[2] = "TiO"; // molecule name
     jolaSystem[2] = "TiO_A3Phi_X3Delta"; //band system //DeltaLambda=0
     jolaLabel[2] = "TiO_A3Phi_X3Delta";
     //jolaDeltaLambda[2] = 0;
     jolaSpecies[3] = "TiO"; // molecule name
     jolaSystem[3] = "TiO_B3Pi_X3Delta"; //band system 
     jolaLabel[3] = "TiO_B3Pi_X3Delta";
     jolaSpecies[4] = "TiO"; // molecule name
     jolaSystem[4] = "TiO_E3Pi_X3Delta"; //band system  
     jolaLabel[4] = "TiO_E3Pi_X3Delta";
     jolaSpecies[5] = "TiO"; // molecule name
     jolaSystem[5] = "TiO_b1Pi_a1Delta"; //band system 
     jolaLabel[5] = "TiO_b1Pi_a1Delta";
     jolaSpecies[6] = "TiO"; // molecule name
     jolaSystem[6] = "TiO_b1Pi_d1Sigma"; //band system
     jolaLabel[6] = "TiO_b1Pi_d1Sigma";

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
            xPos = xAxisLength10 * (lambda0 - minXData10) / (maxXData10 - minXData10);
            xPos = xPos - 5; // finesse
            //xPos = xAxisXCnvs + xPos - 5; // finesse

            nameLbl = "<span style='font-size: xx-small'>" + jolaLabel[i] + "</span>";
            //lamLblNum = listLams[i].toPrecision(6);
            //lamLblStr = lamLblNum.toString(10);
            //lamLbl = "<span style='font-size: xx-small'>" + lamLblStr + "</span>";
            //RGBHex = colHex(r255, g255, b255);
					//JB

            txtPrint(nameLbl, xPos + xAxisXCnvs, (yPos - 10), 100, RGBHex, plotTenId);

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

           if ( (diskLambda > 380.0) && (diskLambda < 680.0) ){
                 xShiftDum = YBar(diskLambda, minXData, maxXData,
                               barWidth, barHeight,
                               barFinesse-60, RGBHex, plotTenId, cnvsTenId);
                 txtPrint("<span style='font-size:xx-small'>Filter</span>",
                       xShiftDum, yAxisYCnvs, 100, RGBHex, plotTenId);
            }

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
       var panelOrigin = washer(plotRow, plotCol, wDiskColor, plotNineId, cnvsNineId);

				//JB
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];

				//JB
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotNineId, cnvsNineId);

        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName, fineness,
                plotNineId, cnvsNineId);
				//JB
        //
//        xOffset = xAxisParams[0];
//        yOffset = yAxisParams[4];
        var rangeXData9 = xAxisParams[1];
        var deltaXData9 = xAxisParams[2];
        var deltaXPxl9 = xAxisParams[3];
        var rangeYData9 = yAxisParams[1];
        var deltaYData9 = yAxisParams[2];
        var deltaYPxl9 = yAxisParams[3];
//        var xLowerYOffset = xAxisParams[5];
        var minXData9 = xAxisParams[6]; //updated value
        var minYData9 = yAxisParams[6]; //updated value
        var maxXData9 = xAxisParams[7]; //updated value
        var maxYData9 = yAxisParams[7]; //updated value     
        //
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
				//JB
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://www.ap.smu.ca/~ishort/hrdtest3.html' target='_blank'>H-R Diagram</a></span>",
                titleOffsetX, titleOffsetY, 300, lineColor, plotNineId);
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

//Lines of constant radius first
//
     var RGBHex = colHex(100, 100, 100);
     var dSizeCnvs = 2;
     var deltaLog10Teff = 0.2;  //Delta Log(Teff) in K
     var numRadLine = (maxXData9 - minXData9) / deltaLog10Teff;
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
        thisLog10Teff = minXData9; //K
        thisLog10TeffSol = thisLog10Teff - log10TeffSun; //solar units  
        var xTickPosCnvs = xAxisLength * (thisLog10Teff - minXData9) / rangeXData9; // pixels
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
        log10L = (4.0*thisLog10TeffSol) + (2.0*thisLog10Rad);
        var yTickPosCnvs = yAxisLength * (log10L - minYData9) / rangeYData9;
        var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

    for (var i = 1; i < numRadLine; i++){
   //Caution: Teff axis backwards so minXData > maxXData:
        thisLog10Teff = minXData9 - (i * deltaLog10Teff); //K
        thisLog10TeffSol = thisLog10Teff - log10TeffSun; //solar units  
        log10L = (4.0*thisLog10TeffSol) + (2.0*thisLog10Rad);

        //console.log("thisLog10Teff " + thisLog10Teff + " log10L " + log10L);
 
          var xTickPosCnvs = xAxisLength * (thisLog10Teff - minXData9) / rangeXData9; // pixels   

          // horizontal position in pixels - data values increase rightward:
          var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

          var yTickPosCnvs = yAxisLength * (log10L - minYData9) / rangeYData9;
          // vertical position in pixels - data values increase upward:
          var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

           var thisLine = document.createElementNS(xmlW3, 'line');
           thisLine.setAttributeNS(null, 'x1', lastXShiftCnvs);
           thisLine.setAttributeNS(null, 'x2', xShiftCnvs); 
           thisLine.setAttributeNS(null, 'y1', lastYShiftCnvs);
           thisLine.setAttributeNS(null, 'y2', yShiftCnvs); 
           thisLine.setAttributeNS(null, 'stroke', 'black');
           thisLine.setAttributeNS(null, 'stroke-width', 1);

           cnvsNineId.appendChild(thisLine);

           
            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
  } //i loop over Teff
				//JB
          txtPrint("<span style='font-size:xx-small'>" + HRradii[r] + " R<sub>Sun</sub></span>",
                    xShiftCnvs+5, yShiftCnvs-5, 300, RGBHex, plotNineId);
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
            var xTickPosCnvs = xAxisLength * (logTen(msTeffs[i]) - minXData9) / rangeXData9; // pixels   

            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            var yTickPosCnvs = yAxisLength * (msLogLum[i] - minYData9) / rangeYData9;
        //console.log("logTen(msTeffs[i] " + logTen(msTeffs[i]) + " msLogLum[i] " + msLogLum[i]);
            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
				//JB
//plot MS stars
	    var dot = document.createElementNS(xmlW3, 'circle');
	    dot.setAttributeNS(null, 'cx', xShiftCnvs);
            dot.setAttributeNS(null, 'cy', yShiftCnvs);
            dot.setAttributeNS(null, 'r', dSizeCnvs);
            dot.setAttributeNS(null, 'stroke', RGBHex);
            dot.setAttributeNS(null, 'fill', wDefaultColor);
            dot.setAttributeNS(null, 'id', "dot"+i);
	    //dot.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
	    cnvsNineId.appendChild(dot);
				//JB

} // msNum loop, i


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
            var xTickPosCnvs = xAxisLength * (logTen(rgbTeffs[i]) - minXData9) / rangeXData9; // pixels   

            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            var yTickPosCnvs = yAxisLength * (rgbLogLum[i] - minYData9) / rangeYData9;
            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

				//JB
            var dot = document.createElementNS(xmlW3, 'circle');
            dot.setAttributeNS(null, 'cx', xShiftCnvs);
            dot.setAttributeNS(null, 'cy', yShiftCnvs);
            dot.setAttributeNS(null, 'r', dSizeCnvs);
            dot.setAttributeNS(null, 'stroke', RGBHex);
            dot.setAttributeNS(null, 'fill', wDefaultColor);
            dot.setAttributeNS(null, 'id', "dotTwo"+i);
            //dot.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            cnvsNineId.appendChild(dot);
                                //JB

 }  //rgbNum loop, i


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
  var xTickPosCnvs = xAxisLength * (logTen(sgbTeffs[i]) - minXData9) / rangeXData9; // pixels   
  
  // horizontal position in pixels - data values increase rightward:
 var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;
 
  var yTickPosCnvs = yAxisLength * (sgbLogLum[i] - minYData9) / rangeYData9;
 // vertical position in pixels - data values increase upward:
  var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
				
				//JB
            var dot = document.createElementNS(xmlW3, 'circle');
            dot.setAttributeNS(null, 'cx', xShiftCnvs);
            dot.setAttributeNS(null, 'cy', yShiftCnvs);
            dot.setAttributeNS(null, 'r', dSizeCnvs);
            dot.setAttributeNS(null, 'stroke', RGBHex);
            dot.setAttributeNS(null, 'fill', wDefaultColor);
            dot.setAttributeNS(null, 'id', "dotThree"+i);
            //dot.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            cnvsNineId.appendChild(dot);

				//JB
  } //sgbNum loop, i

    //cnvsNineId.addEventListener("mouseover", function() { 
    cnvsNineId.addEventListener("click", function() {
       //dataCoords(event, plotNineId);
       var xyString = dataCoords(event, cnvsNineId, xAxisLength, minXData9, rangeXData9, xAxisXCnvs,
                               yAxisLength, minYData9, rangeYData9, yAxisYCnvs);
       txtPrint(xyString, titleOffsetX+200, titleOffsetY+320, 150, lineColor, plotNineId);
    });



// Now overplot our star:
        var xTickPosCnvs = xAxisLength * (logTen(teff) - minXData9) / rangeXData9; // pixels   
        // horizontal position in pixels - data values increase rightward:
        var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;
//
        var yTickPosCnvs = yAxisLength * (logTen(bolLum) - minYData9) / rangeYData9;
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
	    var dot = document.createElementNS(xmlW3, 'circle');
	    dot.setAttributeNS(null, 'cx', xShiftCnvs);
            dot.setAttributeNS(null, 'cy', yShiftCnvs);
            dot.setAttributeNS(null, 'r', 1.1 * radiusPxThis);
            dot.setAttributeNS(null, 'stroke', "white");
            dot.setAttributeNS(null, 'fill', wDefaultColor);
            dot.setAttributeNS(null, 'opacity', 0.5);
            cnvsNineId.appendChild(dot);

	    //dot4.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);

//create another circle behind our star to make it more visable

	    var dot = document.createElementNS(xmlW3, 'circle');
            dot.setAttributeNS(null, 'cx', xShiftCnvs);
            dot.setAttributeNS(null, 'cy', yShiftCnvs);
            dot.setAttributeNS(null, 'r', 1.05 * radiusPxThis);
	    dot.setAttributeNS(null, 'stroke', RGBHex);
            dot.setAttributeNS(null, 'fill', RGBHex);
            dot.setAttributeNS(null, 'opacity', 0.5);
//event listeners added directly onto the one circle
	    //dot5.setAttributeNS(xmlns,xmlnsLink,xmlnsLink2);
            cnvsNineId.appendChild(dot);
	    

			//JB

        //Now overplot Luminosity class markers:

            //I
        var xShift = xAxisXCnvs + xAxisLength * (logTen(sgbTeffs[sgbNum-1]) - minXData9) / rangeXData9; // pixels 
        var yShift = (yAxisYCnvs + yAxisLength) - (yAxisLength * (sgbLogLum[sgbNum - 1] - minYData9) / rangeYData9);
				//JB
        txtPrint("<span style='font-size:normal'><a href='http://en.wikipedia.org/wiki/Stellar_classification' target='_blank'>\n\
I</a></span>", xShift, yShift, 300, lineColor, plotNineId);
				//JB
        //III
        xShift = xAxisXCnvs + xAxisLength * (logTen(rgbTeffs[rgbNum-1]) - minXData9) / rangeXData9; // pixels 
        yShift = (yAxisYCnvs + yAxisLength) - (yAxisLength * (rgbLogLum[rgbNum - 8] - minYData9) / rangeYData9);
				//JB
        txtPrint("<span style='font-size:normal'><a href='http://en.wikipedia.org/wiki/Stellar_classification' title='Giants' target='_blank'>\n\
     III</a></span>", xShift, yShift, 300, lineColor, plotNineId);
				//JB
        //V
        xShift = xAxisXCnvs + xAxisLength * (logTen(msTeffs[msNum-1]) - minXData9) / rangeXData9; // pixels 
        yShift = (yAxisYCnvs + yAxisLength) - (yAxisLength * (msLogLum[msNum - 8] - minYData9) / rangeYData9);
				//JB
        txtPrint("<span style='font-size:normal'><a href='http://en.wikipedia.org/wiki/Stellar_classification' title='Main Sequence, Dwarfs' target='_blank'>\n\
     V</a></span>", xShift, yShift, 300, lineColor, plotNineId);

    }

					
/*
// ****************************************
    //
    //
    //  *****   PLOT ONE / PLOT 1
    //

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

    //cnvsOneId.addEventListener("mouseover", function() { 
    cnvsOneId.addEventListener("click", function() {
       //dataCoords(event, plotOneId);
       dataCoords(event, p1Id, xAxisLength, minXData, rangeXData, xAxisXCnvs,
                               yAxisLength, minYData, rangeYData, yAxisYCnvs);
       txtPrint(xyString, titleOffsetX+120, titleOffsetY+300, 150, lineColor, plotTenId);
    });


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
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, plotThreeId, cnvsThreeId);
				//JB
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
	cnvsThreeId.setAttribute('fill', wDefaultColor);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotThreeId, cnvsThreeId);
        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                fineness, plotThreeId, cnvsThreeId);

        //xOffset = xAxisParams[0];
        //yOffset = xAxisParams[4];
        var rangeXData3 = xAxisParams[1];
        var deltaXData3 = xAxisParams[2];
        var deltaXPxl3 = xAxisParams[3];
        var rangeYData3 = yAxisParams[1];
        var deltaYData3 = yAxisParams[2];
        var deltaYPxl3 = yAxisParams[3];
        var xLowerYOffset3 = xAxisParams[5];
        var minXData3 = xAxisParams[6]; //updated value
        var minYData3 = yAxisParams[6]; //updated value
        var maxXData3 = xAxisParams[7]; //updated value
        var maxYData3 = yAxisParams[7]; //updated value        
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
                titleOffsetX, titleOffsetY, 300, lineColor, plotThreeId);

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

//initializations:
        var ii;
        var xTickPosCnvs = xAxisLength * (logE * tauRos[1][0] - minXData3) / rangeXData3; // pixels   
        var yTickPosCnvs = yAxisLength * (logE * pGas[1][0] - minYData3) / rangeYData3; // pixels   
        var yTickPosGCnvs = yAxisLength * (logE * pGas[1][0] - minYData3) / rangeYData3; // pixels   
        var yTickPosBCnvs = yAxisLength * (logE * newPe[1][0] - minYData3) / rangeYData3; // pixels   
        var yTickPosRCnvs = yAxisLength * (logE * pRad[1][0] - minYData3) / rangeYData3; // pixels   

        // horizontal position in pixels - data values increase rightward:
         var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;

         var lastYTickPosCnvs = yAxisLength * (logE * logPTot[0] - minYData3) / rangeYData3;
         var lastYTickPosGCnvs = yAxisLength * (logE * pGas[1][0] - minYData3) / rangeYData3;
         var lastYTickPosRCnvs = yAxisLength * (logE * pRad[1][0] - minYData3) / rangeYData3;
         var lastYTickPosBCnvs = yAxisLength * (logE * newPe[1][0] - minYData3) / rangeYData3;
         // vertical position in pixels - data values increase upward:
         var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
         var lastYShiftGCnvs =(yAxisYCnvs + yAxisLength) - yTickPosGCnvs;
         var lastYShiftRCnvs = (yAxisYCnvs + yAxisLength) - yTickPosRCnvs;
         var lastYShiftBCnvs = (yAxisYCnvs + yAxisLength) - yTickPosBCnvs;

        // Avoid upper boundary at i=0
        for (var i = 1; i < numDeps; i++) {

            ii = 1.0 * i;
            var xTickPosCnvs = xAxisLength * (logE * tauRos[1][i] - minXData3) / rangeXData3; // pixels   

            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            var yTickPosCnvs = yAxisLength * (logE * logPTot[i] - minYData3) / rangeYData3;
	    var yTickPosGCnvs = yAxisLength * (logE * pGas[1][i] - minYData3) / rangeYData3;
            var yTickPosRCnvs = yAxisLength * (logE * pRad[1][i] - minYData3) / rangeYData3;
            var yTickPosBCnvs = yAxisLength * (logE * newPe[1][i] - minYData3) / rangeYData3;
            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
            var yShiftGCnvs = (yAxisYCnvs + yAxisLength) - yTickPosGCnvs;
            var yShiftRCnvs = (yAxisYCnvs + yAxisLength) - yTickPosRCnvs;
            var yShiftBCnvs = (yAxisYCnvs + yAxisLength) - yTickPosBCnvs;

		
            		
            //console.log("lastXShiftCnvs " + lastXShiftCnvs + " lastYShiftCnvs " + lastYShiftGCnvs + " xShiftCnvs " + xShiftCnvs + " yShiftCnvs " + yShiftGCnvs);

            var thisLine = document.createElementNS(xmlW3, 'line');
            thisLine.setAttributeNS(null, 'x1', lastXShiftCnvs);
            thisLine.setAttributeNS(null, 'x2', xShiftCnvs);
            thisLine.setAttributeNS(null, 'y1', lastYShiftCnvs);
            thisLine.setAttributeNS(null, 'y2', yShiftCnvs);
            thisLine.setAttributeNS(null, 'stroke', "#0000FF");
            thisLine.setAttributeNS(null, 'stroke-width', 2);
            cnvsThreeId.appendChild(thisLine);

            var thisLine = document.createElementNS(xmlW3, 'line');
            thisLine.setAttributeNS(null, 'x1', lastXShiftCnvs);
            thisLine.setAttributeNS(null, 'x2', xShiftCnvs);
            thisLine.setAttributeNS(null, 'y1', lastYShiftGCnvs);
            thisLine.setAttributeNS(null, 'y2', yShiftGCnvs);
            thisLine.setAttributeNS(null, 'stroke', "#00FF00");
            thisLine.setAttributeNS(null, 'stroke-width', 2);
            cnvsThreeId.appendChild(thisLine);

            var thisLine = document.createElementNS(xmlW3, 'line');
            thisLine.setAttributeNS(null, 'x1', lastXShiftCnvs);
            thisLine.setAttributeNS(null, 'x2', xShiftCnvs);
            thisLine.setAttributeNS(null, 'y1', lastYShiftRCnvs);
            thisLine.setAttributeNS(null, 'y2', yShiftRCnvs);
            thisLine.setAttributeNS(null, 'stroke', "#FF0000");
            thisLine.setAttributeNS(null, 'stroke-width', 2);
            cnvsThreeId.appendChild(thisLine);

            var thisLine = document.createElementNS(xmlW3, 'line');
            thisLine.setAttributeNS(null, 'x1', lastXShiftCnvs);
            thisLine.setAttributeNS(null, 'x2', xShiftCnvs);
            thisLine.setAttributeNS(null, 'y1', lastYShiftBCnvs);
            thisLine.setAttributeNS(null, 'y2', yShiftBCnvs);
            thisLine.setAttributeNS(null, 'stroke', "#000000");
            thisLine.setAttributeNS(null, 'stroke-width', 2);
            cnvsThreeId.appendChild(thisLine);
           
  
				//JB
            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
            lastYShiftGCnvs = yShiftGCnvs;
            lastYShiftRCnvs = yShiftRCnvs;
            lastYShiftBCnvs = yShiftBCnvs;
        }

    //cnvsThreeId.addEventListener("mouseover", function() { 
    cnvsThreeId.addEventListener("click", function() {
       //dataCoords(event, plotThreeId);
       var xyString = dataCoords(event, cnvsThreeId, xAxisLength, minXData3, rangeXData3, xAxisXCnvs,
                               yAxisLength, minYData3, rangeYData3, yAxisYCnvs);
       txtPrint(xyString, titleOffsetX+200, titleOffsetY+320, 150, lineColor, plotThreeId);
    }); 


// Tau=1 cross-hair

        var tTau1 = tauPoint(numDeps, tauRos, 1.0);
        var barWidth = 1.0;
        var barColor = "#777777";
        yFinesse = 0.0;
				//JB
        xShift = YBar(logE * tauRos[1][tTau1], minXData3, maxXData3, barWidth, yAxisLength,
                yFinesse, barColor, plotThreeId, cnvsThreeId);
        barHeight = 1.0;
        yShift = XBar(logE * logPTot[tTau1], minYData3, maxYData3, xAxisLength, barHeight,
                xFinesse, barColor, plotThreeId, cnvsThreeId);
        txtPrint("<span style='font-size:small; color:#444444'><em>&#964</em><sub>Ros</sub>=1</span>",
                xShift, yShift, 300, lineColor, plotThreeId);

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
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, plotFourId, cnvsFourId);
				//JB
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
				//JB
	cnvsFourId.setAttribute('fill', wDefaultColor);
 var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotFourId, cnvsFourId);
        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                fineness,plotFourId, cnvsFourId);
				//JB
        var rangeXData4 = xAxisParams[1];
        var deltaXData4 = xAxisParams[2];
        var deltaXPxl4 = xAxisParams[3];
        var rangeYData4 = yAxisParams[1];
        var deltaYData4 = yAxisParams[2];
        var deltaYPxl4 = yAxisParams[3];
        var minXData4 = xAxisParams[6]; //updated value
        var minYData4 = yAxisParams[6]; //updated value
        var maxXData4 = xAxisParams[7]; //updated value
        var maxYData4 = yAxisParams[7]; //updated value        
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
                xAxisXCnvs+10, titleOffsetY+20, 300, lineColor, plotFourId);
        // Add title annotation:
                 txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Limb_darkening' target='_blank'>Limb darkening </a></span>",
        titleOffsetX, titleOffsetY, 300, lineColor, plotFourId);
					//JB
        //Data loop - plot the result!

        var dSizeCnvs = 4.0; //plot point size
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

        var xTickPosCnvs = xAxisLength * (180.0 * Math.acos(cosTheta[1][0]) / Math.PI - minXData4) / rangeXData4; // pixels   
        // horizontal position in pixels - data values increase rightward:
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
        var yTickPosCnvs = yAxisLength * ((tuneBandIntens[0] / tuneBandIntens[0]) - minYData4) / rangeYData4;

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
                              

//
        for (var i = 1; i < numThetas; i++) {

//other variables required to create an array of colors based
// on the gaussian filter
//
var zLevel = ((tuneBandIntens[i]/norm)-minZData)/rangeZData;

var RGBHex = lambdaToRGB(lambdanm,zLevel);
//console.log (RGBHex);


            xTickPosCnvs = xAxisLength * (180.0 * Math.acos(cosTheta[1][i]) / Math.PI - minXData4) / rangeXData4; // pixels   
            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            yTickPosCnvs = yAxisLength * ((tuneBandIntens[i] / tuneBandIntens[0]) - minYData4) / rangeYData4;

            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

//Plot points
			//JB
            //RGBHex = colHex(0, 0, 0);
	    var circle = document.createElementNS(xmlW3, 'circle');
	    circle.setAttributeNS(null, 'cx', xShiftCnvs);
            circle.setAttributeNS(null, 'cy', yShiftCnvs);
            circle.setAttributeNS(null, 'r', dSizeCnvs);
            circle.setAttributeNS(null, 'stroke', RGBHex);
            circle.setAttributeNS(null, 'fill', RGBHex);
            cnvsFourId.appendChild(circle);
			//JB
//line plot
			//JB
	    var line = document.createElementNS(xmlW3, 'line');
            line.setAttributeNS(null, 'x1', lastXShiftCnvs);
            line.setAttributeNS(null, 'x2', xShiftCnvs);
            line.setAttributeNS(null, 'y1', lastYShiftCnvs);
            line.setAttributeNS(null, 'y2', yShiftCnvs);
            line.setAttributeNS(null, 'stroke', 'black');
            line.setAttributeNS(null, 'stroke-width', 2);
	    cnvsFourId.appendChild(line);
			//JB
            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
        }

    //cnvsFourId.addEventListener("mouseover", function() { 
    cnvsFourId.addEventListener("click", function() {
       //dataCoords(event, plotFourId);
       var xyString = dataCoords(event, cnvsFourId, xAxisLength, minXData4, rangeXData4, xAxisXCnvs,
                               yAxisLength, minYData4, rangeYData4, yAxisYCnvs);
       txtPrint(xyString, titleOffsetX+200, titleOffsetY+320, 150, lineColor, plotFourId);
    });


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
       //console.log("masterLams[0] " + masterLams[0] + " [1] " + masterLams[1]);
        //var minXData = 1.0e7 * masterLams[0];
        //var maxXData = 1.0e7 * masterLams[numMaster - 1];
        //var xAxisName = "<em>&#955</em> (nm)";
            ////Logarithmic x:
        var minXData = 7.0 + logTen(masterLams[0]);
        var maxXData = 7.0 + logTen(masterLams[numMaster - 1]);
        //var maxXData = 3.0; //finesse - Log10(lambda) = 3.5 nm
        var xAxisName = "Log<sub>10</sub> &#955 (nm)";
        //var numYTicks = 4;
        //now done above var norm = 1.0e15; // y-axis normalization
        //var minYData = 0.0;
        //// iLamMax established in PLOT TWO above:
        //var maxYData = masterFlux[0][iLamMax] / norm;
        //var yAxisName = "<span title='Monochromatic surface flux'><a href='http://en.wikipedia.org/wiki/Spectral_flux_density' target='_blank'> <em>F</em><sub>&#955</sub> x 10<sup>15</sup><br />ergs s<sup>-1</sup> <br />cm<sup>-3</sup></a></span>";
        //Logarithmic y:
        var minYData = 12.0;
        var maxYData = logE * masterFlux[1][iLamMax];
        var yAxisName = "<span title='Monochromatic surface flux'><a href='http://en.wikipedia.org/wiki/Spectral_flux_density' target='_blank'>Log<sub>10</sub> <em>F</em><sub>&#955</sub> <br /> ergs s<sup>-1</sup> cm<sup>-3</sup></a></span>";
        //(xRange, xOffset, yRange, yOffset, wDefaultColor, plotFiveId);

        //var fineness = "ultrafine";
        //var cnvsCtx = washer(plotRow, plotCol, wDefaultColor, plotFiveId, cnvsId);

					//JB
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, plotFiveId, cnvsFiveId);
					//JB

        panelX = panelOrigin[0];
        panelY = panelOrigin[1];


		//console.log(SVGFive); is good, created fine
		//console.log("Before: minXData, maxXData " + minXData + ", " + maxXData);
                //console.log("XAxis called from PLOT 5:");
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotFiveId, cnvsFiveId);

        var yAxisParams = YAxis(panelX, panelY,
                 minYData, maxYData, yAxisName, 
                 fineness, plotFiveId, cnvsFiveId);   

        //xOffset = xAxisParams[0];
        //yOffset = xAxisParams[4];
        var rangeXData5 = xAxisParams[1];
        var deltaXData5 = xAxisParams[2];
        var deltaXPxl5 = xAxisParams[3];
        var rangeYData5 = yAxisParams[1];
        var deltaYData5 = yAxisParams[2];
        var deltaYPxl5 = yAxisParams[3];
        var minXData5 = xAxisParams[6]; //updated value
        var minYData5 = yAxisParams[6]; //updated value
        var maxXData5 = xAxisParams[7]; //updated value
        var maxYData5 = yAxisParams[7]; //updated value        
		//console.log("After : minXData, maxXData " + minXData + ", " + maxXData + " rangeXData " + rangeXData);
        console.log("2:  minXData5 " + minXData5);
        //
        var thet0 = 180.0 * Math.acos(cosTheta[1][0]) / Math.PI;
        var thet0lbl = thet0.toPrecision(2);
        var thet0Str = thet0lbl.toString();
        var thetN = 180.0 * Math.acos(cosTheta[1][numThetas - 2]) / Math.PI;
        var thetNlbl = thetN.toPrecision(2);
        var thetNStr = thetNlbl.toString();
//
        // Add legend annotation:
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
					//JB
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Spectral_energy_distribution' target='_blank'>\n\
     Spectral energy distribution (SED)</a></span>",
                titleOffsetX, titleOffsetY, 300, lineColor, plotFiveId);
        txtPrint("<span style='font-size:small'>"
                + "<span><em>F</em><sub>&#955</sub> (<em>&#955</em><sub>Max</sub> = " + lamMaxStr + " nm)</span>, "
                + " <span><em>I</em><sub>&#955</sub>,</span> <span style='color:#444444'> <em>&#952</em> = " + thet0Str + "<sup>o</sup></span>,  "
                + " <span style='color:#444444'><em>&#952</em> = " + thetNStr + "<sup>o</sup></span></span>",
                titleOffsetX, titleOffsetY+35, 250, lineColor, plotFiveId);
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
        xShift = YBar(band0, minXData5, maxXData5, vBarWidth, yAxisLength,
                yFinesse, RGBHex, plotFiveId, cnvsFiveId);
        }; //end function UBVRIbands
					

//
        //
        var filters = filterSet();
        var lam0_ptr = 11; // approximate band centre
        var numBands = filters.length;
        var lamUBVRI = [];
        lamUBVRI.length = numBands;

        
        for (var ib = 0; ib < numBands; ib++) {
            //lamUBVRI[ib] = 1.0e7 * filters[ib][0][lam0_ptr]; //linear lambda
            lamUBVRI[ib] = 7.0 + logTen(filters[ib][0][lam0_ptr]);  //logarithmic lambda
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

//linear x:
        var yShiftCnvs, yShiftCCnvs, yShift0Cnvs, yShiftNCnvs;
        //var logLambdanm = 7.0 + logTen(masterLams[0]);  //logarithmic
        //var lambdanm = 1.0e7 * masterLams[0];
        //var xTickPosCnvs = xAxisLength * (lambdanm - minXData5) / rangeXData5; // pixels
//Logarithmic x:
        var logLambdanm = 7.0 + logTen(masterLams[0]);  //logarithmic
        var xTickPosCnvs = xAxisLength * (logLambdanm - minXData5) / rangeXData5; // pixels
//
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
//linear y:
        //var yTickPosCnvs = yAxisLength * ((masterFlux[0][0] / norm) - minYData5) / rangeYData5;
        //var yTickPosCCnvs = yAxisLength * ((contFlux3[0] / norm) - minYData) / rangeYData;
        //var yTickPos0Cnvs = yAxisLength * ((masterIntens[0][0] / norm) - minYData5) / rangeYData5;
        //var yTickPosNCnvs = yAxisLength * ((masterIntens[0][numThetas - 2] / norm) - minYData5) / rangeYData5;
//Logarithmic y:
        var yTickPosCnvs = yAxisLength * ((logE*masterFlux[1][0]) - minYData5) / rangeYData5;
        //var yTickPosCCnvs = yAxisLength * ((contFlux3[0] / norm) - minYData) / rangeYData;
        var yTickPos0Cnvs = yAxisLength * ((logE*masterIntens[1][0]) - minYData5) / rangeYData5;
        var yTickPosNCnvs = yAxisLength * ((logE*masterIntens[1][numThetas - 2]) - minYData5) / rangeYData5;
//
        // vertical position in pixels - data values increase upward:
        console.log("yAxisYCnvs " + yAxisYCnvs + " yAxisLength " + yAxisLength + " yTickPosCnvs " + yTickPosCnvs);
        var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
        //var lastYShiftCCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCCnvs;
        var lastYShift0Cnvs = (yAxisYCnvs + yAxisLength) - yTickPos0Cnvs;
        var lastYShiftNCnvs = (yAxisYCnvs + yAxisLength) - yTickPosNCnvs;
        var xShift, yShift;

    //cnvsFiveId.addEventListener("mouseover", function() { 
    cnvsFiveId.addEventListener("click", function() {
       //dataCoords(event, plotFiveId);
       var xyString = dataCoords(event, cnvsFiveId, xAxisLength, minXData5, rangeXData5, xAxisXCnvs,
                               yAxisLength, minYData5, rangeYData5, yAxisYCnvs);
       txtPrint(xyString, titleOffsetX+200, titleOffsetY+320, 150, lineColor, plotFiveId);
    });


        for (var i = 1; i < numMaster; i++) {

            //lambdanm = masterLams[i] * 1.0e7; //cm to nm //linear
            //xTickPosCnvs = xAxisLength * (lambdanm - minXData5) / rangeXData5; // pixels   //linear
            logLambdanm = 7.0 + logTen(masterLams[i]);  //logarithmic
            xTickPosCnvs = xAxisLength * (logLambdanm - minXData5) / rangeXData5; // pixels   //logarithmic
            ii = 1.0 * i;

            // horizontal position in pixels - data values increase rightward:
            xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

//linear y:
            //yTickPosCnvs = yAxisLength * ((masterFlux[0][i] / norm) - minYData5) / rangeYData5;
            ////yTickPosCCnvs = yAxisLength * ((contFlux3[i] / norm) - minYData) / rangeYData;
            //yTickPos0Cnvs = yAxisLength * ((masterIntens[i][0] / norm) - minYData5) / rangeYData5;
            //yTickPosNCnvs = yAxisLength * ((masterIntens[i][numThetas - 2] / norm) - minYData5) / rangeYData5;
//logarithmic y:
            yTickPosCnvs = yAxisLength * ((logE*masterFlux[1][i]) - minYData5) / rangeYData5;
            //yTickPosCCnvs = yAxisLength * ((contFlux3[i] / norm) - minYData) / rangeYData;
            yTickPos0Cnvs = yAxisLength * ((logE*Math.log(masterIntens[i][0])) - minYData5) / rangeYData5;
            yTickPosNCnvs = yAxisLength * ((logE*Math.log(masterIntens[i][numThetas - 2])) - minYData5) / rangeYData5;
            // vertical position in pixels - data values increase upward:
            yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
            //yShiftCCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCCnvs;
            yShift0Cnvs = (yAxisYCnvs + yAxisLength) - yTickPos0Cnvs;
            yShiftNCnvs = (yAxisYCnvs + yAxisLength) - yTickPosNCnvs;

//line plot
            var RGBHex = colHex(r255, g255, b255);

            var thisLine = document.createElementNS(xmlW3, 'line');
            thisLine.setAttributeNS(null, 'x1', lastXShiftCnvs);
            thisLine.setAttributeNS(null, 'x2', xShiftCnvs);
            thisLine.setAttributeNS(null, 'y1', lastYShiftCnvs);
            thisLine.setAttributeNS(null, 'y2', yShiftCnvs);
            thisLine.setAttributeNS(null, 'stroke', RGBHex);
            thisLine.setAttributeNS(null, 'stroke-width', 2);
            cnvsFiveId.appendChild(thisLine);

            var RGBHex = colHex(r2550, g2550, b2550);

            var thisLine = document.createElementNS(xmlW3, 'line');
            thisLine.setAttributeNS(null, 'x1', lastXShiftCnvs);
            thisLine.setAttributeNS(null, 'x2', xShiftCnvs);
            thisLine.setAttributeNS(null, 'y1', lastYShift0Cnvs);
            thisLine.setAttributeNS(null, 'y2', yShift0Cnvs);
            thisLine.setAttributeNS(null, 'stroke', RGBHex);
            thisLine.setAttributeNS(null, 'stroke-width', 2);
            cnvsFiveId.appendChild(thisLine);

            var RGBHex = colHex(r255N, g255N, b255N);

            var thisLine = document.createElementNS(xmlW3, 'line');
            thisLine.setAttributeNS(null, 'x1', lastXShiftCnvs);
            thisLine.setAttributeNS(null, 'x2', xShiftCnvs);
            thisLine.setAttributeNS(null, 'y1', lastYShiftNCnvs);
            thisLine.setAttributeNS(null, 'y2', yShiftNCnvs);
            thisLine.setAttributeNS(null, 'stroke', RGBHex);
            thisLine.setAttributeNS(null, 'stroke-width', 2);


            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
            //lastYShiftCCnvs = yShiftCCnvs;
            lastYShift0Cnvs = yShift0Cnvs;
            lastYShiftNCnvs = yShiftNCnvs;

        }


        //monochromatic disk lambda
           yFinesse = 0.0;
           barHeight = 200;
           barWidth = 2;
           RGBHex = "#000000";
		//JB

   //linear wavelength
          //var xShiftDum = YBar(diskLambda, minXData5, maxXData5, barWidth, barHeight,
          //      yFinesse, RGBHex, plotFiveId, cnvsFiveId);
   //logarithmic wavelength
          var logDiskLambda = logTen(diskLambda);
          var xShiftDum = YBar(logDiskLambda, minXData5, maxXData5, barWidth, barHeight,
                yFinesse, RGBHex, plotFiveId, cnvsFiveId);

        txtPrint("<span style='font-size:xx-small'>Filter</span>",
                xShiftDum, titleOffsetY+60, 100, lineColor, plotFiveId);

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

//create an array of colors for all possible points on the spectral line
      for(var k = 0; k < halfPoints; k++){
//colors become more blue, and less green toward the center (toward end of loop)
         var greenN = greenG - (k)*(greenG/halfPoints);
         var blueN = blueB + (k)*(greenG/(halfPoints));
         var redN = redR;
         var blue = colHex(parseInt(Math.abs(blueN)));
         var green = colHex(parseInt(Math.abs(greenN)));
         var red = colHex(parseInt(Math.abs(redN)));

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
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, plotSixId, cnvsSixId);

				//JB
	 panelX = panelOrigin[0];
        panelY = panelOrigin[1];
				//JB
	cnvsSixId.setAttribute("fill",wDefaultColor);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotSixId, cnvsSixId);
        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                fineness,plotSixId, cnvsSixId);

				//JB
        //xOffset = xAxisParams[0];
        //yOffset = xAxisParams[4];
        var rangeXData6 = xAxisParams[1];
        var deltaXData6 = xAxisParams[2];
        var deltaXPxl6 = xAxisParams[3];
        var rangeYData6 = yAxisParams[1];
        var deltaYData6 = yAxisParams[2];
        var deltaYPxl6 = yAxisParams[3];
        var xLowerYOffset6 = xAxisParams[5];
        var minXData6 = xAxisParams[6]; //updated value
        //minXData = xAxisParams[6] - 1.0e7*lam0; //updated value
        var minYData6 = yAxisParams[6]; //updated value
        var maxXData6 = xAxisParams[7]; //updated value
        var maxYData6 = yAxisParams[7]; //updated value        
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
                titleOffsetX, titleOffsetY + 35, 65, lineColor, plotSixId);

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
        yShift = XBar(one, minYData6, maxYData6, barWidth, barHeight,
                xFinesse, RGBHexc, plotSixId, cnvsSixId);

        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Spectral_line' target='_blank'>2-level atom: Spectral line profile </a></span>",
                titleOffsetX, titleOffsetY, 300, lineColor, plotSixId);
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
            titleOffsetX+250, titleOffsetY, 300, lineColor, plotSixId);
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
        var xTickPosCnvs = xAxisLength * (lnLam[iStart] - minXData6) / rangeXData6; // pixels   
        // horizontal position in pixels - data values increase rightward:
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
        var yTickPosCnvs = yAxisLength * (lnFlx[iStart] - minYData6) / rangeYData6;
        //var yTickPos0 = yRange * (lnInt0[i] - minYData) / rangeYData;
        //var yTickPosN = yRange * (lnIntN[i] - minYData) / rangeYData;
        // vertical position in pixels - data values increase upward:
        //var lastYShift = xLowerYOffset - yTickPos;
        var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
        //var lastYShift0 = xLowerYOffset - yTickPos0;
        //var lastYShiftN = xLowerYOffset - yTickPosN;


//counters for the iterations of the following loop and the number
// of times the if statement is entered (to know how far
// along the second half of the spectral line we are)

var iterCounter = 0;
var ifCounter =0;
var circClr = colHex(0, 70, 70); //go for aquamarine/turquoise/cyan

        for (var i = iStart; i < iStop; i++) {

            xTickPosCnvs = xAxisLength * (lnLam[i] - minXData6) / rangeXData6; // pixels  

            // horizontal position in pixels - data values increase rightward:

            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            yTickPosCnvs = yAxisLength * (lnFlx[i] - minYData6) / rangeYData6;
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

            var line = document.createElementNS(xmlW3, 'line');

            line.setAttributeNS(null, 'x1', lastXShiftCnvs);
            line.setAttributeNS(null, 'x2', xShiftCnvs);
            line.setAttributeNS(null, 'y1', lastYShiftCnvs);
            line.setAttributeNS(null, 'y2', yShiftCnvs);
            line.setAttributeNS(null, 'stroke', 'black');
            line.setAttributeNS(null, 'stroke-width', 2);
            cnvsSixId.appendChild(line);
  
      
//plots dots along the line
          circClr = colHex(0, (100+5*i), (100+5*i)); //go for aquamarine/turquoise/cyan
          //console.log("PLOT 6: i " + i + " circClr " + circClr);

          var dot = document.createElementNS(xmlW3, 'circle');
          dot.setAttributeNS(null, 'cx', xShiftCnvs);
          dot.setAttributeNS(null, 'cy', yShiftCnvs);
          dot.setAttributeNS(null, 'r', "4");
          dot.setAttributeNS(null, 'fill', "none");
          dot.setAttributeNS(null, 'stroke', circClr);
          dot.setAttributeNS(null, 'stroke-width', "3");
//console.log(iStart);
//console.log(iStop);

//if there is an odd number of points on the line, add one to lineCenter
// after the integer division. this determines how many times the loop
// iterates.

var mid = (iStop-iStart)/2;

//check if iStop is odd
      if((iStop-iStart) % 2 != 0){
              mid = Math.floor((iStop-iStart)/2)+1;
      }

//console.log(mid);
//console.log(iterCounter);

//after the center circle, loop through the array holding the colors backwards
      if(iterCounter >= mid){
//            console.log(ifCounter);
                  dot.setAttributeNS(null, 'stroke', circClr);
              ifCounter++;
      }

          dot.setAttributeNS(null, 'id', "dotP6 "+i);

          cnvsSixId.appendChild(dot);

iterCounter += 1;
//counter ++;

				//JB
            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
            //lastYShift0 = yShift0;
            //lastYShiftN = yShiftN;
        }


    //cnvsSixId.addEventListener("mouseover", function() { 
    cnvsSixId.addEventListener("click", function() {
       //dataCoords(event, plotSixId);
       var xyString = dataCoords(event, cnvsSixId, xAxisLength, minXData6, rangeXData6, xAxisXCnvs,
                               yAxisLength, minYData6, rangeYData6, yAxisYCnvs);
       txtPrint(xyString, titleOffsetX+200, titleOffsetY+320, 150, lineColor, plotSixId);
    });


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
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, plotEightId, cnvsEightId);
					//JB
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
				//JB
	cnvsEightId.setAttribute('fill',wDefaultColor);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotEightId, cnvsEightId);
        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                fineness, plotEightId, cnvsEightId);
				//JB
        //
        //xOffset = xAxisParams[0];
        //yOffset = xAxisParams[4];
        var rangeXData8 = xAxisParams[1];
        var deltaXData8 = xAxisParams[2];
        var deltaXPxl8 = xAxisParams[3];
        var rangeYData8 = yAxisParams[1];
        var deltaYData8 = yAxisParams[2];
        var deltaYPxl8 = yAxisParams[3];
        var xLowerYOffset8 = xAxisParams[5];
        var minXData8 = xAxisParams[6]; //updated value
        var minYData8 = yAxisParams[6]; //updated value
        var maxXData8 = xAxisParams[7]; //updated value
        var maxYData8 = yAxisParams[7]; //updated value        
      
        // Add title annotation:

        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
					//JB
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Grotrian_diagram' target='_blank'>2-level atom: E-level diagram</a></span>",
                titleOffsetX, titleOffsetY, 300, lineColor, plotEightId);

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
            yShift = XBar(yData[i], minYData8, maxYData8, xAxisLength, tickLength,
                xFinesse, lineColor, plotEightId, cnvsEightId);
					//JB
            // Now over-plot with the width of the "y-tickmark" scaled by the 
            // log number density in each E-level:
            //var xRangePops = Math.floor(xRange * (logE*logNums[lPoint[i]][tTau1] / maxXData));
            var xRangePops = Math.floor(xAxisLength * ( (logE * logNums[i][tTau1] - minXData8) / (maxXData8 - minXData8)));
            var tickWidthPops = 6;

 // Energy level logarithmic population horizontal bars:
					//JB
           yShift = XBar(yData[i], minYData8, maxYData8, xRangePops, tickWidthPops,
                    xFinesse, RGBHex, plotEightId, cnvsEightId);
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
                yShift, 65, lineColor, plotEightId);
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

        xShiftDum = YBar(xTickPosCnvs, minXData8, maxXData8, vBarWidth, vBarHeightCnvs,
                         yFinesse, RGBHex, plotEightId, cnvsEightId);

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
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, plotTwoId, cnvsTwoId);
					//JB
        panelX = panelOrigin[0];
        panelY = panelOrigin[1];
					//JB
	cnvsTwoId.setAttribute('fill', wDefaultColor);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotTwoId, cnvsTwoId);
            var cnvsCtx = xAxisParams[8];
            var yAxisParams = YAxis(panelX, panelY, minYData, maxYData, yAxisName,fineness, plotTwoId, cnvsTwoId);
                                                
					//JB

        //
        //xOffset = xAxisParams[0];
        //yOffset = xAxisParams[4];
        var rangeXData2 = xAxisParams[1];
        var deltaXData2 = xAxisParams[2];
        var deltaXPxl2 = xAxisParams[3];
        var rangeYData2 = yAxisParams[1];
        var deltaYData2 = yAxisParams[2];
        var deltaYPxl2 = yAxisParams[3];
        //var xLowerYOffset = xAxisParams[5];
        var minXData2 = xAxisParams[6]; //updated value
        var minYData2 = yAxisParams[6]; //updated value
        var maxXData2 = xAxisParams[7]; //updated value
        var maxYData2 = yAxisParams[7]; //updated value    
        yFinesse = 0;       
        xFinesse = 0;       
        //
        // Tau=1 cross-hair

        var barWidth = 1.0;
        var barColor = "#777777";
        var tTau1 = tauPoint(numDeps, tauRos, 1.0);
					//JB
        xShift = YBar(logE * tauRos[1][tTau1], minXData2, maxXData2, barWidth, yAxisLength,
                yFinesse, barColor, plotTwoId, cnvsTwoId);

        yShift = XBar(temp[0][tTau1], minYData2, maxYData2, xAxisLength, barHeight,
                xFinesse, barColor, plotTwoId, cnvsTwoId);
        barHeight = 1.0;
        // Add label
                 txtPrint("<span style='font-size:small; color:#444444'><em>&#964</em><sub>Ros</sub>=1</span>", xShift, yShift, 300, lineColor, plotTwoId);
					//JB
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
        txtPrint("<span style='font-size:normal; color:blue'>Gas temperature </span>",
                titleOffsetX, titleOffsetY, 300, lineColor, plotTwoId);
					//JB
        //var dSize = 5.0; //plot point size
        var dSizeCnvs = 1.0; //plot point size
        var opac = 1.0; //opacity
        // RGB color
        var r255 = 0;
        var g255 = 0;
        var b255 = 255; //blue

        var ii;
        var xTickPosCnvs = xAxisLength * (logE * tauRos[1][0] - minXData2) / rangeXData2; // pixels   

        // horizontal position in pixels - data values increase rightward:
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;

        var yTickPosCnvs = yAxisLength * (temp[0][0] - minYData2) / rangeYData2;
        // vertical position in pixels - data values increase upward:
        var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;


       for (var i = 0; i < numDeps; i++) {
              

            ii = 1.0 * i;
            var xTickPosCnvs = xAxisLength * (logE * tauRos[1][i] - minXData2) / rangeXData2; // pixels   

            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            var yTickPosCnvs = yAxisLength * (temp[0][i] - minYData2) / rangeYData2;
            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;


           var thisLine = document.createElementNS(xmlW3, 'line');
            thisLine.setAttributeNS(null, 'x1', lastXShiftCnvs);
            thisLine.setAttributeNS(null, 'x2', xShiftCnvs);
            thisLine.setAttributeNS(null, 'y1', lastYShiftCnvs);
            thisLine.setAttributeNS(null, 'y2', yShiftCnvs);
            thisLine.setAttributeNS(null, 'stroke', lineColor);
            thisLine.setAttributeNS(null, 'stroke-width', 2);
            cnvsTwoId.appendChild(thisLine);

            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;

        }

    cnvsTwoId.addEventListener("click", function() {
       //dataCoords(event, plotTwoId);
       var xyString = dataCoords(event, cnvsTwoId, xAxisLength, minXData2, rangeXData2, xAxisXCnvs,
                               yAxisLength, minYData2, rangeYData2, yAxisYCnvs);
       //console.log("PLOT TWO INSIDE: xAxisLength " + xAxisLength + " minXData " + minXData2 + " rangeXData " + rangeXData2 + " xAxisXCnvs " + xAxisXCnvs2);
       txtPrint(xyString, titleOffsetX+200, titleOffsetY+320, 150, lineColor, plotTwoId);
    });


//  Loop over limb darkening sub-disks - largest to smallest, and add color-coded Tau(theta) = 1 markers

        //dSize = 8.0;
        dSizeCnvs = 4.0;

        // Disk centre:
        //This approach does not allow for calibration easily:
        //now done earlier var bvr = bandIntens[2][0] + bandIntens[3][0] + bandIntens[4][0];
        //now down above: var rgbVega = [183.0 / 255.0, 160.0 / 255.0, 255.0 / 255.0];
    //console.log("PLOT TWO OUTSIDE: xAxisLength " + xAxisLength + " minXData " + minXData2 + " rangeXData " + rangeXData2 + " xAxisXCnvs " + xAxisXCnvs);
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

            rrI = bandIntens[4][i] / bvr0 * rNormVega; 
            r255 = Math.ceil(255.0 * rrI / renormI); 
            ggI = bandIntens[3][i] / bvr0 * vNormVega; 
            g255 = Math.ceil(255.0 * ggI / renormI); 
            bbI = bandIntens[2][i] / bvr0 * bNormVega; 
            b255 = Math.ceil(255.0 * bbI / renormI); 

            var xTickPosCnvs = xAxisLength * (logE * tauRos[1][dpthIndx] - minXData2) / rangeXData2; // pixels   

            // horizontal position in pixels - data values increase rightward:
            //var xShift = xOffset + xTickPos;
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;// + 200;
            ////stringify and add unit:
            //        var xShiftStr = numToPxStrng(xShift);

            //var yTickPos = yRange * (temp[0][dpthIndx] - minYData) / rangeYData;
            var yTickPosCnvs = yAxisLength * (temp[0][dpthIndx] - minYData2) / rangeYData2;
            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

            var RGBHex = colHex(r255, g255, b255);

            var thisCirc = document.createElementNS(xmlW3, 'circle');
            thisCirc.setAttributeNS(null, 'cx', xShiftCnvs);
            thisCirc.setAttributeNS(null, 'cy', yShiftCnvs);
            thisCirc.setAttributeNS(null, 'r', dSizeCnvs);
            thisCirc.setAttributeNS(null, 'stroke', RGBHex);
            thisCirc.setAttributeNS(null, 'fill', RGBHex);
            thisCirc.setAttributeNS(null, 'stroke-width', 2);
            cnvsTwoId.appendChild(thisCirc);

        }

// legend using dot of last color in loop directly above:

            var thisCirc = document.createElementNS(xmlW3, 'circle');
            thisCirc.setAttributeNS(null, 'cx', titleOffsetX + 365);
            thisCirc.setAttributeNS(null, 'cy', titleOffsetY + 10);
            thisCirc.setAttributeNS(null, 'r', dSizeCnvs);
            thisCirc.setAttributeNS(null, 'stroke', RGBHex);
            thisCirc.setAttributeNS(null, 'fill', RGBHex);
            thisCirc.setAttributeNS(null, 'stroke-width', 2);
            cnvsTwoId.appendChild(thisCirc);
                              
                              //JB
                              
        txtPrint("<span title='Limb darkening depths of &#964_Ros(&#952) = 1'><em>&#964</em><sub>Ros</sub>(0 < <em>&#952</em> < 90<sup>o</sup>) = 1</span>",
                titleOffsetX + 200, titleOffsetY, 300, lineColor, plotTwoId);
//legend for the colored dots corresponding with the spectral line (Plot 6)
        txtPrint("<span title='Limb darkening depths of &#964_Ros(&#952) = 1'>Specral Line <em>&#964</em><sub>&#955</sub>= 1</span>",
                titleOffsetX + 200, titleOffsetY+25, 300, lineColor, plotTwoId);

//Now overplot symbols for T_Ros values of 2-level atom monochromatic line depth = 1
//
//
    if (ifShowLine === true) {
//    console.log("Condition reached, numPoints " + numPoints);
//    for (var jj = 0; jj < numDeps; jj++){
//       console.log("logTauL[19] " + logTauL[19][jj]);
//    }

       circClr = colHex(0, 70, 70);

       var midPoint = iStart + ( (iStop - iStart) / 2 );
       midPoint = Math.round(midPoint);
       //for (var i = 0; i < Math.round(numPoints/2); i++) {
       for (var i = iStart; i < midPoint; i++) {

            ii = 1.0 * i;
            //     iCosThetaI = limbTheta1 - ii * limbDelta;
            //     iIntMaxI = interpol(iCosTheta, iIntMax, iCosThetaI);

            //numPrint(i, 50, 100 + i * 20, zeroInt, zeroInt, zeroInt, masterId);
            // LTE Eddington-Barbier limb darkening: I(Tau=0, lambda) = B(T(Tau_lambda=t))
            for (var jj = 0; jj < numDeps; jj++){
               thisTau[0][jj] = Math.exp(logTauL[i][jj]);
               thisTau[1][jj] = logTauL[i][jj];
            }
            var dpthIndx = tauPoint(numDeps, thisTau, one);
            //console.log("dpthIndx " + dpthIndx);
            //numPrint(dpthIndx, 100, 100+i*20, zeroInt, zeroInt, zeroInt, masterId);


            var xTickPosCnvs = xAxisLength * (logE * tauRos[1][dpthIndx] - minXData2) / rangeXData2; // pixels   

            // horizontal position in pixels - data values increase rightward:
            //var xShift = xOffset + xTickPos;
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;// + 200;
            ////stringify and add unit:
            //        var xShiftStr = numToPxStrng(xShift);

            //var yTickPos = yRange * (temp[0][dpthIndx] - minYData) / rangeYData;
            var yTickPosCnvs = yAxisLength * (temp[0][dpthIndx] - minYData2) / rangeYData2;
            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

            circClr = colHex(0, (100 + 5*i), (100 + 5*i));
            //console.log("PLOT 2: i " + i + " circClr " + circClr);

            var thisCirc = document.createElementNS(xmlW3, 'circle');
            thisCirc.setAttributeNS(null, 'cx', xShiftCnvs);
            thisCirc.setAttributeNS(null, 'cy', yShiftCnvs);
            thisCirc.setAttributeNS(null, 'r', dSizeCnvs);
            thisCirc.setAttributeNS(null, 'stroke', circClr);
            thisCirc.setAttributeNS(null, 'fill', "none");
            thisCirc.setAttributeNS(null, 'stroke-width', 2);
            cnvsTwoId.appendChild(thisCirc);

        }

      } // end ifShowLine condition on plot symbols

    } //End plot two

					
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
           //console.log("If branch 1");
           //console.log("radii " + radii);
        }
        if ( (radiusPx1AU >= radiusPxIce) && (radiusPx1AU < (radiusPxIce + 3)) ){
           radii = [radiusPxIce + 3, radiusPx1AU, radiusPx1AU-1, radiusPxIce, radiusPxSteam, radiusPxSteam - 3, radiusPx];
           colors = ["#0000FF", "#000000", "#0000FF", "#00FF88", "#FF0000", wDiskColor, starRGBHex];
           //console.log("If branch 2");
           //console.log("radii " + radii);
        }
        if ( (radiusPx1AU >= radiusPxSteam) && (radiusPx1AU < radiusPxIce) ){
           radii = [radiusPxIce + 3, radiusPxIce, radiusPx1AU+1, radiusPx1AU, radiusPxSteam, radiusPxSteam - 3, radiusPx];
           colors = ["#0000FF", "#00FF88", "#000000", "#00FF88", "#FF0000", wDiskColor, starRGBHex];
           //console.log("If branch 3");
           //console.log("radii " + radii);
        }
        if ( (radiusPx1AU >= (radiusPxSteam - 3)) && (radiusPx1AU < radiusPxSteam) ){
           radii = [radiusPxIce + 3, radiusPxIce, radiusPxSteam, radiusPx1AU+1, radiusPx1AU, radiusPxSteam - 3, radiusPx];
           colors = ["#0000FF", "#00FF88", "#FF0000", "#000000", "#FF0000", wDiskColor, starRGBHex];
           //console.log("If branch 4");
           //console.log("radii " + radii);
        }
        if ( (radiusPx1AU >= radiusPx) && (radiusPx1AU < (radiusPxSteam - 3)) ){
           radii = [radiusPxIce + 3, radiusPxIce, radiusPxSteam, radiusPxSteam - 3, radiusPx1AU, radiusPx1AU-1,  radiusPx];
           colors = ["#0000FF", "#00FF88", "#FF0000", wDiskColor, "#000000", wDiskColor, starRGBHex];
           //console.log("If branch 5");
           //console.log("radii " + radii);
        }
        if (radiusPx1AU <= radiusPx){
           radii = [radiusPxIce + 3, radiusPxIce, radiusPxSteam, radiusPxSteam - 3, radiusPx, radiusPx1AU, radiusPx1AU-1];
           colors = ["#0000FF", "#00FF88", "#FF0000", wDiskColor, starRGBHex, "#000000", starRGBHex];
           //console.log("If branch 6");
           //console.log("radii " + radii);
        }

     //console.log("radii " + radii)
        //
        //var titleYPos = xLowerYOffset - yRange + 40;
					//JB
      var panelOrigin = washer(plotRow, plotCol, wDiskColor, plotElevenId, cnvsElevenId);
					//JB
	panelX = panelOrigin[0];
        panelY = panelOrigin[1];
	cnvsElevenId.setAttribute('fill', wDiskColor);
        // Add title annotation:

        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
			//JB
      
        txtPrint("<span style='font-size:normal; color:blue' title='Assumes liquid salt-free water at one Earth atmosphere pressure needed for life'><a href='https://en.wikipedia.org/wiki/Circumstellar_habitable_zone' target='_blank'>Life zone for habitable planets</a></span><br />\n\
     <span style='font-size:small'>(Logarithmic radius)</span>",
                titleOffsetX, titleOffsetY, 300, lineColor, plotElevenId);
        var legendY = titleOffsetY;
        var legendX = titleOffsetX + 320;
        txtPrint("<span style='font-size:small'>"
                + " <span style='color:#FF0000'>Steam line</span> " + steamLineAU + " <a href='https://en.wikipedia.org/wiki/Astronomical_unit' title='1 AU = Earths average distance from center of Sun'> AU</a><br /> "
                + " <span style='color:#00FF88'><strong>Life zone</strong></span><br /> "
                + " <span style='color:#0000FF'>Ice line</span> " + iceLineAU + " <a href='https://en.wikipedia.org/wiki/Astronomical_unit' title='1 AU = Earths average distance from center of Sun'> AU</a><br /> " 
                + " <span style='color:#000000'>Reference line: 1 <a href='https://en.wikipedia.org/wiki/Astronomical_unit' title='1 AU = Earths average distance from center of Sun'>AU</a></span>",
                legendX, legendY, 300, lineColor, plotElevenId);
//
        txtPrint("<span style='font-size:small'>" + solvent + " boiling temp = " + steamTempRound + " K</span>", 
          (legendX-75), (legendY+300), 300, lineColor, plotElevenId);
        //Get the Vega-calibrated colors from the intensity spectrum of each theta annulus:    
        // moved earlier var intcolors = iColors(lambdaScale, intens, numDeps, numThetas, numLams, tauRos, temp);
			//JB

        //  Loop over radial zones - largest to smallest
   //console.log("cx " + xCenterCnvs + " cy " + yCenterCnvs);
        for (var i = 0; i < radii.length; i++) { // for (var i = parseFloat(radii.length); i > 2; i--) {
       //console.log(i, radii[i])
            var radiusStr = numToPxStrng(radii[i]);
            // Adjust position to center star:
            // Radius is really the *diameter* of the symbol

// Adjust position to center star:
// Radius is really the *diameter* of the symbol
            var yCenterCnvs = panelHeight / 2; 
            var xCenterCnvs = panelWidth / 2; 
				
				//JB
	
                //console.log("i " + i + " radii " + radii[i] + " colors " + colors[i]);
	
		var thisCirc = document.createElementNS(xmlW3, 'circle');
		//cric.setAttribute('id',"circ"+i);
		thisCirc.setAttributeNS(null, 'cx', xCenterCnvs);
                thisCirc.setAttributeNS(null, 'cy', yCenterCnvs);
		thisCirc.setAttributeNS(null, 'r', radii[i]);
                thisCirc.setAttributeNS(null, 'stroke', colors[i]);
                thisCirc.setAttributeNS(null, 'stroke-width', 2);
		thisCirc.setAttributeNS(null, 'fill', colors[i]);
		cnvsElevenId.appendChild(thisCirc);
				
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
	        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, plotFourteenId, cnvsFourteenId);

				//JB        
panelX = panelOrigin[0];
        panelY = panelOrigin[1];
				//JB
        cnvsFourteenId.setAttribute('fill', wDefaultColor); 
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotFourteenId, cnvsFourteenId);
				//JB
        //xOffset = xAxisParams[0];
        var rangeXData14 = xAxisParams[1];
        var deltaXData14 = xAxisParams[2];
        var deltaXPxl14 = xAxisParams[3];
        //yOffset = xAxisParams[4];
        var xLowerYOffset14 = xAxisParams[5];
        var minXData14 = xAxisParams[6]; //updated value
        var maxXData14 = xAxisParams[7]; //updated value
			//JB
	        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                fineness, plotFourteenId, cnvsFourteenId);
			//JB
        var rangeYData14 = yAxisParams[1];
        var deltaYData14 = yAxisParams[2];
        var deltaYPxl14 = yAxisParams[3];
        var minYData14 = yAxisParams[6]; //updated value
        var maxYData14 = yAxisParams[7]; //updated value 

        yFinesse = 0;       
        xFinesse = 0;       
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
				//JB
        txtPrint("log<sub>10</sub> <a href='https://en.wikipedia.org/wiki/Absorption_(electromagnetic_radiation)' title='mass extinction coefficient' target='_blank'>Extinction</a>",
                titleOffsetX, titleOffsetY, 300, lineColor, plotFourteenId);
        txtPrint("<span style='font-size:small'>"
                + "<span><em>&#954</em><sub>Ros</sub></span>,  "
                + " <span style='color:#0000FF'><em>&#954<sub>&#955</sub></em> 360 nm</span>,  "
                + " <span style='color:#00FF00'><em>&#954<sub>&#955</sub></em> 500 nm</span>,  "
               // + " <span style='color:#FF0000'><em>&#954<sub>&#955</sub></em> 1640 nm</span> ",
                + " <span style='color:#FF0000'><em>&#954<sub>&#955</sub></em> 1000 nm</span> ",
                   titleOffsetX, titleOffsetY+35, 350, lineColor, plotFourteenId);
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
       var xTickPosCnvs = xAxisLength * (logE * tauRos[1][0] - minXData14) / rangeXData14; // pixels   
       // horizontal position in pixels - data values increase rightward:
       var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
       // vertical position in pixels - data values increase upward:
       var yTickPosCnvs = yAxisLength * (logE * kappaRos[1][0] - minYData14) / rangeYData14;
       var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
       var yTickPosCnvs360 = yAxisLength * (logE * logKappa[it360][0] - minYData14) / rangeYData14;
       var lastYShiftCnvs360 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs360;
       var yTickPosCnvs500 = yAxisLength * (logE * logKappa[it500][0] - minYData14) / rangeYData14;
       var lastYShiftCnvs500 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs500;
       // var yTickPosCnvs1600 = yAxisLength * (logE * logKappa[it1600][0] - minYData) / rangeYData;
       // var lastYShiftCnvs1600 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs1600;
       var yTickPosCnvs1000 = yAxisLength * (logE * logKappa[it1000][0] - minYData14) / rangeYData14;
       var lastYShiftCnvs1000 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs1000;


        for (var i = 1; i < numDeps; i++) {

            ii = 1.0 * i;
            var xTickPosCnvs = xAxisLength * (logE * tauRos[1][i] - minXData14) / rangeXData14; // pixels   

            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            // vertical position in pixels - data values increase upward:
            var yTickPosCnvs = yAxisLength * (logE * kappaRos[1][i] - minYData14) / rangeYData14;
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
            var yTickPosCnvs360 = yAxisLength * (logE * logKappa[it360][i] - minYData14) / rangeYData14;
            var yShiftCnvs360 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs360;
            var yTickPosCnvs500 = yAxisLength * (logE * logKappa[it500][i] - minYData14) / rangeYData14;
            var yShiftCnvs500 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs500;
            //var yTickPosCnvs1600 = yAxisLength * (logE * logKappa[it1600][i] - minYData) / rangeYData;
            //var yShiftCnvs1600 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs1600;
            var yTickPosCnvs1000 = yAxisLength * (logE * logKappa[it1000][i] - minYData14) / rangeYData14;
            var yShiftCnvs1000 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs1000;

 //console.log("i " + i + " lastXShiftCnvs " + lastXShiftCnvs);

//log kappa_Ros
//line plot
				//JB
	    var line = document.createElementNS(xmlW3, 'line');
            line.setAttributeNS(null, 'x1', lastXShiftCnvs);
            line.setAttributeNS(null, 'x2', xShiftCnvs);
            line.setAttributeNS(null, 'y1', lastYShiftCnvs);
            line.setAttributeNS(null, 'y2', yShiftCnvs);
	    line.setAttributeNS(null, 'stroke', lineColor);
	    line.setAttributeNS(null, 'stroke-width', 2);
	    cnvsFourteenId.appendChild(line);
				//JB
//log kappa_lambda = 360 nm
	    var line = document.createElementNS(xmlW3, 'line');
            line.setAttributeNS(null, 'x1', lastXShiftCnvs);
            line.setAttributeNS(null, 'x2', xShiftCnvs);
            line.setAttributeNS(null, 'y1', lastYShiftCnvs360);
            line.setAttributeNS(null, 'y2', yShiftCnvs360);
	    line.setAttributeNS(null, 'stroke', '#0000FF');
	    line.setAttributeNS(null, 'stroke-width', 2);
	    cnvsFourteenId.appendChild(line);
				//JB
				//JB
//log kappa_lambda = 500 nm
				//JB
	    var line = document.createElementNS(xmlW3, 'line');
            line.setAttributeNS(null, 'x1', lastXShiftCnvs);
            line.setAttributeNS(null, 'x2', xShiftCnvs);
            line.setAttributeNS(null, 'y1', lastYShiftCnvs500);
            line.setAttributeNS(null, 'y2', yShiftCnvs500);
	    line.setAttributeNS(null, 'stroke', '#00FF00');
	    line.setAttributeNS(null, 'stroke-width', 2);
	    cnvsFourteenId.appendChild(line);
				//JB
	    var line = document.createElementNS(xmlW3, 'line');
            line.setAttributeNS(null, 'x1', lastXShiftCnvs);
            line.setAttributeNS(null, 'x2', xShiftCnvs);
            line.setAttributeNS(null, 'y1', lastYShiftCnvs1000);
            line.setAttributeNS(null, 'y2', yShiftCnvs1000);
	    line.setAttributeNS(null, 'stroke', '#FF0000');
	    line.setAttributeNS(null, 'stroke-width', 2);
	    cnvsFourteenId.appendChild(line);
				//JB
            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
            lastYShiftCnvs360 = yShiftCnvs360;
            lastYShiftCnvs500 = yShiftCnvs500;
            lastYShiftCnvs1000 = yShiftCnvs1000;
        }


    //cnvsFourteenId.addEventListener("mouseover", function() { 
    cnvsFourteenId.addEventListener("click", function() {
       //dataCoords(event, plotFourteenId);
       var xyString = dataCoords(event, cnvsFourteenId, xAxisLength, minXData14, rangeXData14, xAxisXCnvs,
                               yAxisLength, minYData14, rangeYData14, yAxisYCnvs);
       txtPrint(xyString, titleOffsetX+200, titleOffsetY+320, 150, lineColor, plotFourteenId);
    });


// Tau=1 cross-hair

        var barWidth = 1.0;
        var barColor = "#777777";
					//JB
        var xShift = YBar(logE * tauRos[1][tTau1], minXData14, maxXData14, barWidth, yAxisLength,
                yFinesse, barColor, plotFourteenId, cnvsFourteenId);

        var barHeight = 1.0;
        var yShift = XBar(logE * kappaRos[1][tTau1], minYData14, maxYData14, xAxisLength, barHeight,
                xFinesse, barColor, plotFourteenId, cnvsFourteenId);
        txtPrint("<span style='font-size:small; color:#444444'><em>&#964</em><sub>Ros</sub>=1</span>",
                xShift, yShift, 65, lineColor, plotFourteen);
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
//Linear wavelength
//        var minXData = 1.0e7 * lambdaScale[0];
//        var maxXData = 1.0e7 * lambdaScale[numLams - 1];
//        var xAxisName = "<em>&#955</em> (nm)";
//Logarithmic wavelength
        var minXData = 7.0 + logTen(lambdaScale[0]);
        var maxXData = 7.0 + logTen(lambdaScale[numLams - 1]);
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

        var fineness = "ultrafine";
        //var cnvsCtx = washer(plotRow, plotCol, wDefaultColor, plotFiveId, cnvsId);
					//JB
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, plotFifteenId, cnvsFifteenId);
					//JB
	panelX = panelOrigin[0];
        panelY = panelOrigin[1];
					//JB
	cnvsFifteenId.setAttribute('fill',wDefaultColor);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotFifteenId, cnvsFifteenId);

        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                fineness, plotFifteenId, cnvsFifteenId);

					//JB
        //xOffset = xAxisParams[0];
        //yOffset = xAxisParams[4];
        var rangeXData15 = xAxisParams[1];
        var deltaXData15 = xAxisParams[2];
        var deltaXPxl15 = xAxisParams[3];
        var rangeYData15 = yAxisParams[1];
        var deltaYData15 = yAxisParams[2];
        var deltaYPxl15 = yAxisParams[3];
        var minXData15 = xAxisParams[6]; //updated value
        var minYData15 = yAxisParams[6]; //updated value
        var maxXData15 = xAxisParams[7]; //updated value
        var maxYData15 = yAxisParams[7]; //updated value        
        //
        // Add legend annotation:

//
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
					//JB
        txtPrint("log<sub>10</sub> <a href='https://en.wikipedia.org/wiki/Absorption_(electromagnetic_radiation)' title='mass extinction coefficient' target='_blank'>Extinction</a>",
                titleOffsetX, titleOffsetY, 300, lineColor, plotFifteenId);
        txtPrint("<span style='font-size:small'>"
                + " <span style='color:#0000FF'><em>&#954<sub>&#955</sub> &#964 =</em> 1.0 </span>,  "
                + " <span style='color:#00FF00'><em>&#954<sub>&#955</sub> &#964 =</em> 0.01</span>, "
                + "<span><em>&#954</em><sub>Ros</sub></span>  ",
                titleOffsetX, titleOffsetY+35, 65, lineColor, plotFifteenId);
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
        //linear wavelength
        //var lambdanm = 1.0e7 * lambdaScale[0];
        //var xTickPosCnvs = xAxisLength * (lambdanm - minXData15) / rangeXData15; // pixels
        //logarithmic wavelength
        var logLambdanm = 7.0 + logTen(lambdaScale[0]);
        var xTickPosCnvs = xAxisLength * (logLambdanm - minXData15) / rangeXData15; // pixels
//
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
//Logarithmic y:
        var yTickPosCnvsM2 = yAxisLength * ((logE*logKappa[0][tTauM2]) - minYData15) / rangeYData15;
        var yTickPosCnvs1 = yAxisLength * ((logE*logKappa[0][tTau1]) - minYData15) / rangeYData15;
        //var yTickPosCnvsRM2 = yAxisLength * ((kappaRos[1][tTauM2]) - minYData) / rangeYData;
        //var yTickPosCnvsR1 = yAxisLength * ((kappaRos[1][tTau1]) - minYData) / rangeYData;
        // vertical position in pixels - data values increase upward:
        var lastYShiftCnvsM2 = (yAxisYCnvs + yAxisLength) - yTickPosCnvsM2;
        var lastYShiftCnvs1 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs1;
        //var lastYShiftCnvsRM2 = (yAxisYCnvs + yAxisLength) - yTickPosCnvsRM2;
        //var lastYShiftCnvsR1 = (yAxisYCnvs + yAxisLength) - yTickPosCnvsR1;
        var xShift, yShift;


//console.log(minXData);
//console.log(maxXData);


        for (var i = 1; i < numLams; i++) {

            //lambdanm = lambdaScale[i] * 1.0e7; //cm to nm //linear
            //xTickPosCnvs = xAxisLength * (lambdanm - minXData15) / rangeXData15; // pixels   //linear
            logLambdanm = 7.0 + logTen(lambdaScale[i]);  //logarithmic
            xTickPosCnvs = xAxisLength * (logLambdanm - minXData15) / rangeXData15; // pixels   //linear
//
            xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

//logarithmic y:
            yTickPosCnvsM2 = yAxisLength * ((logE*logKappa[i][tTauM2]) - minYData15) / rangeYData15;
            yTickPosCnvs1 = yAxisLength * ((logE*logKappa[i][tTau1]) - minYData15) / rangeYData15;
            //yTickPosCnvsRM2 = yAxisLength * ((kappaRos[1][tTauM2]) - minYData) / rangeYData;
            //yTickPosCnvsR1 = yAxisLength * ((kappaRos[1][tTau1]) - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            var yShiftCnvsM2 = (yAxisYCnvs + yAxisLength) - yTickPosCnvsM2;
            var yShiftCnvs1 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs1;
            //var yShiftCnvsRM2 = (yAxisYCnvs + yAxisLength) - yTickPosCnvsRM2;
            //var yShiftCnvsR1 = (yAxisYCnvs + yAxisLength) - yTickPosCnvsR1;

            RGBHex = colHex(0, 0, 255);

				//JB
	    var line = document.createElementNS(xmlW3, 'line');
            line.setAttributeNS(null, 'x1', lastXShiftCnvs); 
            line.setAttributeNS(null, 'x2', xShiftCnvs); 
            line.setAttributeNS(null, 'y1', lastYShiftCnvs1); 
            line.setAttributeNS(null, 'y2', yShiftCnvs1); 
	    line.setAttributeNS(null, 'stroke', RGBHex);
	    line.setAttributeNS(null, 'stroke-width', 2);
	    cnvsFifteenId.appendChild(line);

				//JB
  
            RGBHex = colHex(0, 255, 0);
	    var line = document.createElementNS(xmlW3, 'line');
            line.setAttributeNS(null, 'x1', lastXShiftCnvs); 
            line.setAttributeNS(null, 'x2', xShiftCnvs); 
            line.setAttributeNS(null, 'y1', lastYShiftCnvsM2); 
            line.setAttributeNS(null, 'y2', yShiftCnvsM2); 
	    line.setAttributeNS(null, 'stroke', RGBHex);
	    line.setAttributeNS(null, 'stroke-width', 2);
	    cnvsFifteenId.appendChild(line);

			//JB

			//JB
            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvsM2 = yShiftCnvsM2;
            lastYShiftCnvs1 = yShiftCnvs1;
            //lastYShiftCnvsRM2 = yShiftCnvsRM2;
            //lastYShiftCnvsR1 = yShiftCnvsR1;
        }


    //cnvsFifteenId.addEventListener("mouseover", function() { 
    cnvsFifteenId.addEventListener("click", function() {
       //dataCoords(event, plotFifteenId);
       var xyString = dataCoords(event, cnvsFifteenId, xAxisLength, minXData15, rangeXData15, xAxisXCnvs,
                               yAxisLength, minYData15, rangeYData15, yAxisYCnvs);
       txtPrint(xyString, titleOffsetX+200, titleOffsetY+320, 150, lineColor, plotFifteenId);
    });


 //Rosseland mean oapcity lines
 //Tau = 1.0 line::
        var lambdanm = 1.0e7 * lambdaScale[0];
        var xTickPosCnvs = xAxisLength * (lambdanm - minXData15) / rangeXData15; // pixels
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
        var yTickPosCnvsR1 = yAxisLength * ((logE*kappaRos[1][tTau1]) - minYData15) / rangeYData15;
				//JB
        var yShiftCnvsR1 = (yAxisYCnvs + yAxisLength) - yTickPosCnvsR1;
        RGBHex = colHex(0, 0, 0);
        lambdanm = lambdaScale[numLams-1] * 1.0e7; //cm to nm //linear
    xTickPosCnvs = xAxisLength * (lambdanm - minXData15) / rangeXData15; // pixels   //linear
        xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

	    var line = document.createElementNS(xmlW3, 'line');
            line.setAttributeNS(null, 'x1', lastXShiftCnvs); 
            line.setAttributeNS(null, 'x2', xShiftCnvs); 
            line.setAttributeNS(null, 'y1', yShiftCnvsR1); 
            line.setAttributeNS(null, 'y2', yShiftCnvsR1); 
	    line.setAttributeNS(null, 'stroke', RGBHex);
	    line.setAttributeNS(null, 'stroke-width', 2);
	    cnvsFifteenId.appendChild(line);


 //Tau = 0.01 line::
        var lambdanm = 1.0e7 * lambdaScale[0];
        var xTickPosCnvs = xAxisLength * (lambdanm - minXData15) / rangeXData15; // pixels
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
        var yTickPosCnvsRM2 = yAxisLength * ((logE*kappaRos[1][tTauM2]) - minYData15) / rangeYData15;
 				//JB
        var yShiftCnvsRM2 = (yAxisYCnvs + yAxisLength) - yTickPosCnvsRM2;
        RGBHex = colHex(0, 0, 0);
 lambdanm = lambdaScale[numLams-1] * 1.0e7; //cm to nm //linear
        xTickPosCnvs = xAxisLength * (lambdanm - minXData15) / rangeXData15; // pixels   //linear
        xShiftCnvs = xAxisXCnvs + xTickPosCnvs;
	    var line = document.createElementNS(xmlW3, 'line');
            line.setAttributeNS(null, 'x1', lastXShiftCnvs); 
            line.setAttributeNS(null, 'x2', xShiftCnvs); 
            line.setAttributeNS(null, 'y1', yShiftCnvsRM2); 
            line.setAttributeNS(null, 'y2', yShiftCnvsRM2); 
	    line.setAttributeNS(null, 'stroke', RGBHex);
	    line.setAttributeNS(null, 'stroke-width', 2);
	    cnvsFifteenId.appendChild(line);

 				//JB
           //monochromatic disk lambda
                yFinesse = 0.0;
                barHeight = 200;
                barWidth = 2;
                RGBHex = "#000000";
					//JB

//linear wavelength
//        var xShiftDum = YBar(diskLambda, minXData15, maxXData15, barWidth, barHeight,
//                           yFinesse, RGBHex, plotFifteenId, cnvsFifteenId);
//logarithmic wavelength
        var logDiskLambda = logTen(diskLambda);
        var xShiftDum = YBar(logDiskLambda, minXData15, maxXData15, barWidth, barHeight,
                           yFinesse, RGBHex, plotFifteenId, cnvsFifteenId);
        txtPrint("<span style='font-size:xx-small'>Filter</span>",
                xShiftDum, titleOffsetY+60, 100, lineColor, plotFifteenId);

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
             for (var jj = gsFirstMol; jj < gsNspec; jj++){
                if (ionEqElement == gsName[jj]){
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
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, plotSixteenId, cnvsSixteenId);
					//JB
	panelX = panelOrigin[0];
        panelY = panelOrigin[1];
				//JB
	cnvsSixteenId.setAttribute('fill',wDefaultColor);
	        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotSixteenId, cnvsSixteenId);
				//JB
        //xOffset = xAxisParams[0];
        var rangeXData16 = xAxisParams[1];
        var deltaXData16 = xAxisParams[2];
        var deltaXPxl16 = xAxisParams[3];
        //yOffset = xAxisParams[4];
        var xLowerYOffset16 = xAxisParams[5];
        var minXData16 = xAxisParams[6]; //updated value
        var maxXData16 = xAxisParams[7]; //updated value
        //no! var cnvsCtx = xAxisParams[8];
        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                fineness, plotSixteenId, cnvsSixteenId);

        var rangeYData16 = yAxisParams[1];
        var deltaYData16 = yAxisParams[2];
        var deltaYPxl16 = yAxisParams[3];
        var minYData16 = yAxisParams[6]; //updated value
        var maxYData16 = yAxisParams[7]; //updated value 

        yFinesse = 0;       
        xFinesse = 0;       
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
					//JB
        txtPrint("<a href='https://en.wikipedia.org/wiki/Saha_ionization_equation' target='_blank'>Ionization equilibrium</a> of " + ionEqElement,
                titleOffsetX, titleOffsetY, 300, lineColor, plotSixteenId);
        txtPrint("<span style='font-size:small'>"
                + "<span><em>N</em><sub>I</sub></span>,  "
                + " <span style='color:#0000FF'><em>N</em><sub>II</sub></span>,  "
                + " <span style='color:#00FF00'><em>N</em><sub>III</sub></span> ",
                titleOffsetX, titleOffsetY+35, 150, lineColor, plotSixteenId);

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

            var xTickPosCnvs = xAxisLength * (logE * tauRos[1][0] - minXData16) / rangeXData16; // pixels   
            // horizontal position in pixels - data values increase rightward:
            var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;


       var yTickPosCnvs0, lastYShiftCnvs0, yTickPosCnvs1, lastYShiftCnvs1, yTickPosCnvs2, lastYShiftCnvs2, yShiftCnvs2;


       if (ifMolPlot == true){
          yTickPosCnvs0 = yAxisLength * (plotLogNumsAB[0] - minYData16) / rangeYData16;
          lastYShiftCnvs0 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs0;
       } else {

            yTickPosCnvs0 = yAxisLength * (plotLogNums[0][0] - minYData16) / rangeYData16;
            // vertical position in pixels - data values increase upward:
            lastYShiftCnvs0 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs0;
            yTickPosCnvs1 = yAxisLength * (plotLogNums[1][0] - minYData16) / rangeYData16;
            lastYShiftCnvs1 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs1;

            if (ionEqElement != "H"){
               yTickPosCnvs2 = yAxisLength * (plotLogNums[4][0] - minYData16) / rangeYData16;
               lastYShiftCnvs2 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs2;
            }
       } //ifMolPlot
//
        var yShiftCnvs0, yShiftCnvs1, yShiftCnvs2; 
        for (var i = 1; i < numDeps; i++) {

            var xTickPosCnvs = xAxisLength * (logE * tauRos[1][i] - minXData16) / rangeXData16; // pixels   
            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            if (ifMolPlot == true){
               yTickPosCnvs0 = yAxisLength * (plotLogNumsAB[i] - minYData16) / rangeYData16;
            // vertical position in pixels - data values increase upward:
               yShiftCnvs0 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs0;
            } else {
               yTickPosCnvs0 = yAxisLength * (plotLogNums[0][i] - minYData16) / rangeYData16;
            // vertical position in pixels - data values increase upward:
               yShiftCnvs0 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs0;
               yTickPosCnvs1 = yAxisLength * (plotLogNums[1][i] - minYData16) / rangeYData16;
               yShiftCnvs1 = (yAxisYCnvs + yAxisLength) - yTickPosCnvs1;
               if (ionEqElement != "H"){
                  yTickPosCnvs2 = yAxisLength * (plotLogNums[4][i] - minYData16) / rangeYData16;
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
	    var line = document.createElementNS(xmlW3, 'line');
            line.setAttributeNS(null, 'x1', lastXShiftCnvs); 
            line.setAttributeNS(null, 'x2', xShiftCnvs); 
            line.setAttributeNS(null, 'y1', lastYShiftCnvs0); 
            line.setAttributeNS(null, 'y2', yShiftCnvs0); 
	    line.setAttributeNS(null, 'stroke', lineColor);
	    line.setAttributeNS(null, 'stroke-width', 2);
	    cnvsSixteenId.appendChild(line);

            lastYShiftCnvs0 = yShiftCnvs0;

    if (ifMolPlot == false){
//Stage II
	    var line = document.createElementNS(xmlW3, 'line');
            line.setAttributeNS(null, 'x1', lastXShiftCnvs); 
            line.setAttributeNS(null, 'x2', xShiftCnvs); 
            line.setAttributeNS(null, 'y1', lastYShiftCnvs1); 
            line.setAttributeNS(null, 'y2', yShiftCnvs1); 
	    line.setAttributeNS(null, 'stroke', "#0000FF");
	    line.setAttributeNS(null, 'stroke-width', 2);
	    cnvsSixteenId.appendChild(line);

            lastYShiftCnvs1 = yShiftCnvs1;
 
//Stage III 
            if (ionEqElement != "H"){
				//JB
	    var line = document.createElementNS(xmlW3, 'line');
            line.setAttributeNS(null, 'x1', lastXShiftCnvs); 
            line.setAttributeNS(null, 'x2', xShiftCnvs); 
            line.setAttributeNS(null, 'y1', lastYShiftCnvs2); 
            line.setAttributeNS(null, 'y2', yShiftCnvs2); 
	    line.setAttributeNS(null, 'stroke', "#00FF00");
	    line.setAttributeNS(null, 'stroke-width', 2);
	    cnvsSixteenId.appendChild(line);
				//JB
               lastYShiftCnvs2 = yShiftCnvs2;
            }

    } //ifMolPlot
            lastXShiftCnvs = xShiftCnvs;
    } // plot loop, i


    //cnvsSixteenId.addEventListener("mouseover", function() { 
    cnvsSixteenId.addEventListener("click", function() {
       //dataCoords(event, plotSixteenId);
       var xyString = dataCoords(event, cnvsSixteenId, xAxisLength, minXData16, rangeXData16, xAxisXCnvs,
                               yAxisLength, minYData16, rangeYData16, yAxisYCnvs);
       txtPrint(xyString, titleOffsetX+200, titleOffsetY+320, 150, lineColor, plotSixteenId);
    });


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
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, plotSeventeenId, cnvsSeventeenId);
				//JB
	panelX = panelOrigin[0];
        panelY = panelOrigin[1];
				//JB
	cnvsSeventeenId.setAttribute('fill',wDefaultColor);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotSeventeenId, cnvsSeventeenId);
        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                fineness, plotSeventeenId, cnvsSeventeenId);
				//JB
        var rangeXData17 = xAxisParams[1];
        var deltaXData17 = xAxisParams[2];
        var deltaXPxl17 = xAxisParams[3];
        var rangeYData17 = yAxisParams[1];
        var deltaYData17 = yAxisParams[2];
        var deltaYPxl17 = yAxisParams[3];
        var minXData17 = xAxisParams[6]; //updated value
        var minYData17 = yAxisParams[6]; //updated value
        var maxXData17 = xAxisParams[7]; //updated value
        var maxYData17 = yAxisParams[7]; //updated value        
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
                xAxisXCnvs+10, titleOffsetY+20, 150, lineColor, plotSeventeenId);
         //Add title annotation:


        txtPrint("<span style='font-size:normal; color:blue'><a href='https://en.wikipedia.org/wiki/Discrete_Fourier_transform' target='_blank'> Fourier transform of <em>I</em><sub>&#955</sub>(<em>&#952</em>)/ <em>I</em><sub>&#955</sub>(0)</a> </a></span>",
                titleOffsetX, titleOffsetY, 100, lineColor, plotSeventeenId);
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


        var xTickPosCnvs = xAxisLength * (ft[0][0] - minXData17) / rangeXData17; // pixels   
        // horizontal position in pixels - data values increase rightward:
        var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;
//logarithmic        var yTickPosCnvs = yAxisLength * (logE*Math.log(ft[1][0]) - minYData) / rangeYData; //logarithmic
       var yTickPosCnvs = yAxisLength * (ft[1][0] - minYData17) / rangeYData17;
       //var yTickPos2Cnvs = yAxisLength * (ft[2][0] - minYData) / rangeYData;

        // vertical position in pixels - data values increase upward:
        var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
        //var lastYShift2Cnvs = (yAxisYCnvs + yAxisLength) - yTickPos2Cnvs;
//

        for (var i = 1; i < numK; i++) {

  //console.log("i " + i + " ft[0] " + ft[0][i] + " ft[1] " + ft[1][i]);
            xTickPosCnvs = xAxisLength * (ft[0][i] - minXData17) / rangeXData17; // pixels   
            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

//logarithmic            yTickPosCnvs = yAxisLength * (logE*Math.log(ft[1][i]) - minYData) / rangeYData; //logarithmic
            yTickPosCnvs = yAxisLength * (ft[1][i] - minYData17) / rangeYData17;
           // yTickPos2Cnvs = yAxisLength * (ft[2][i] - minYData) / rangeYData;

            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;
           // var yShift2Cnvs = (yAxisYCnvs + yAxisLength) - yTickPos2Cnvs;

			//JB
            RGBHex = colHex(0, 0, 0);

 	    var line = document.createElementNS(xmlW3, 'line');
            line.setAttributeNS(null, 'x1', lastXShiftCnvs); 
            line.setAttributeNS(null, 'x2', xShiftCnvs); 
            line.setAttributeNS(null, 'y1', lastYShiftCnvs); 
            line.setAttributeNS(null, 'y2', yShiftCnvs); 
	    line.setAttributeNS(null, 'stroke',  RGBHex);
	    line.setAttributeNS(null, 'stroke-width', 2);
	    cnvsSeventeenId.appendChild(line);
	//

            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
           // lastYShift2Cnvs = yShift2Cnvs;
        }


    //cnvsSeventeenId.addEventListener("mouseover", function() { 
    cnvsSeventeenId.addEventListener("click", function() {
       //dataCoords(event, plotSeventeenId);
       var xyString = dataCoords(event, cnvsSeventeenId, xAxisLength, minXData17, rangeXData17, xAxisXCnvs,
                               yAxisLength, minYData17, rangeYData17, yAxisYCnvs);
       txtPrint(xyString, titleOffsetX+200, titleOffsetY+320, 150, lineColor, plotSeventeenId);
    });

    }

//ifShowRad = true; //For movie 


//
//
//
    //  *****   PLOT EIGHTEEN / PLOT 18
    //
    //
    // Plot eighteen: log(Tau) vs log(Species Partial Pressure)


    console.log("Before PLOT 18 ppSpecies " + ppSpecies);
    if ( (ifShowAtmos === true) && (ppSpecies != "None") ) {

        console.log("PLOT 18 entered");

        var plotRow = 5;
        var plotCol = 0;
        var minXData = logE * tauRos[1][0];
        var maxXData = logE * tauRos[1][numDeps - 1];
        var xAxisName = "<span title='Rosseland mean optical depth'><a href='http://en.wikipedia.org/wiki/Optical_depth_%28astrophysics%29' target='_blank'>Log<sub>10</sub> <em>&#964</em><sub>Ros</sub></a></span>";

//Find the GAS package species we want to plot:

          var iPP = 0; //initialization
          for (var jj = 0; jj < gsNspec; jj++){
             if (ppSpecies.trim() == nameGs[jj].trim()){
                   break;   //we found it
                 }
             iPP++;
          } //jj loop
          console.log("ppSpecies "+ ppSpecies + " iPP " + iPP + " nameGs " + nameGs[iPP]);

        var log10P = [];
        log10P.length = numDeps;
        for (var i = 0; i < numDeps; i++) {
            log10P[i] = log10MasterGsPp[iPP][i];
            //console.log(" i " + i + " log10P " + log10P[i]);
        }
       var iPPMinMax = minMax(log10P);
       //var iLamMinMaxBroad = minMax2(masterFluxBroad2);
       var iPPMax = iPPMinMax[1];
       var iPPMin = iPPMinMax[0];
        //var minYData = logE * logPTot[0] - 2.0; // Avoid upper boundary condition [i]=0
        var minYData = log10P[iPPMin] - 1.0;
        var maxYData = log10P[iPPMax] + 1.0;
        var yAxisName = "Log<sub>10</sub> <em>P</em> <br />(dynes <br />cm<sup>-2</sup>)";
        console.log("minYData " + minYData + " maxYData " + maxYData);
        //washer(xRange, xOffset, yRange, yOffset, wDefaultColor, plotThreeId);

        var fineness = "normal";
        //var cnvsCtx = washer(plotRow, plotCol, wDefaultColor, plotThreeId, cnvsId);
                                //JB
        var panelOrigin = washer(plotRow, plotCol, wDefaultColor, plotEighteenId, cnvsEighteenId);
                                //JB
       panelX = panelOrigin[0];
        panelY = panelOrigin[1];
        cnvsEighteenId.setAttribute('fill', wDefaultColor);
        var xAxisParams = XAxis(panelX, panelY,
                minXData, maxXData, xAxisName, fineness,
                plotEighteenId, cnvsEighteenId);
        var yAxisParams = YAxis(panelX, panelY,
                minYData, maxYData, yAxisName,
                fineness, plotEighteenId, cnvsEighteenId);

        //xOffset = xAxisParams[0];
        //yOffset = xAxisParams[4];
        var rangeXData18 = xAxisParams[1];
        var deltaXData18 = xAxisParams[2];
        var deltaXPxl18 = xAxisParams[3];
        var rangeYData18 = yAxisParams[1];
        var deltaYData18 = yAxisParams[2];
        var deltaYPxl18 = yAxisParams[3];
        var xLowerYOffset18 = xAxisParams[5];
        var minXData18 = xAxisParams[6]; //updated value
        var minYData18 = yAxisParams[6]; //updated value
        var maxXData18 = xAxisParams[7]; //updated value
        var maxYData18 = yAxisParams[7]; //updated value
        yFinesse = 0;
        xFinesse = 0;
        //
        titleX = panelX + titleOffsetX;
        titleY = panelY + titleOffsetY;
                                        //JB
        txtPrint("log Pressure: <span style='color:blue' title='Partial pressure'><strong><em>P</em><sub>i</sub></strong></span> "
                + nameGs[iPP],
                titleOffsetX, titleOffsetY, 300, lineColor, plotEighteenId);

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

//initializations:
        var ii;
        var xTickPosCnvs = xAxisLength * (logE*tauRos[1][0] - minXData18) / rangeXData18; // pixels
        var yTickPosCnvs = yAxisLength * (log10P[0] - minYData18) / rangeYData18; // pixels

        // horizontal position in pixels - data values increase rightward:
         var lastXShiftCnvs = xAxisXCnvs + xTickPosCnvs;

         var lastYTickPosCnvs = yAxisLength * (log10P[0] - minYData18) / rangeYData18;
         // vertical position in pixels - data values increase upward:
         var lastYShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;

        // Avoid upper boundary at i=0
        for (var i = 1; i < numDeps; i++) {

            ii = 1.0 * i;
            var xTickPosCnvs = xAxisLength * (logE*tauRos[1][i] - minXData18) / rangeXData18; // pixels

            // horizontal position in pixels - data values increase rightward:
            var xShiftCnvs = xAxisXCnvs + xTickPosCnvs;

            var yTickPosCnvs = yAxisLength * (logE * log10P[i] - minYData18) / rangeYData18;
            // vertical position in pixels - data values increase upward:
            var yShiftCnvs = (yAxisYCnvs + yAxisLength) - yTickPosCnvs;



            //console.log("lastXShiftCnvs " + lastXShiftCnvs + " lastYShiftCnvs " + lastYShiftGCnvs + " xShiftCnvs " + xShiftCnvs + " yShiftCnvs " + yShiftGCnvs);

            var thisLine = document.createElementNS(xmlW3, 'line');
            thisLine.setAttributeNS(null, 'x1', lastXShiftCnvs);
            thisLine.setAttributeNS(null, 'x2', xShiftCnvs);
            thisLine.setAttributeNS(null, 'y1', lastYShiftCnvs);
            thisLine.setAttributeNS(null, 'y2', yShiftCnvs);
            thisLine.setAttributeNS(null, 'stroke', "#0000FF");
            thisLine.setAttributeNS(null, 'stroke-width', 2);
            cnvsEighteenId.appendChild(thisLine);

                                //JB
            lastXShiftCnvs = xShiftCnvs;
            lastYShiftCnvs = yShiftCnvs;
        }

    //cnvsThreeId.addEventListener("mouseover", function() {
    cnvsEighteenId.addEventListener("click", function() {
       //dataCoords(event, plotThreeId);
       var xyString = dataCoords(event, cnvsEighteenId, xAxisLength, minXData18, rangeXData18, xAxisXCnvs,
                               yAxisLength, minYData18, rangeYData18, yAxisYCnvs);
       txtPrint(xyString, titleOffsetX+200, titleOffsetY+320, 150, lineColor, plotEighteenId);
    });


// Tau=1 cross-hair

        var tTau1 = tauPoint(numDeps, tauRos, 1.0);
        var barWidth = 1.0;
        var barColor = "#777777";
        yFinesse = 0.0;
                                //JB
        xShift = YBar(logE * tauRos[1][tTau1], minXData18, maxXData18, xAxisLength, barWidth, yAxisLength,
                yFinesse, barColor, plotEighteenId, cnvsEighteenId);
        barHeight = 1.0;
        yShift = XBar(logE * logPTot[tTau1], minYData18, maxYData18, xAxisLength, barHeight,
                xFinesse, barColor, plotEighteenId, cnvsEighteenId);
        txtPrint("<span style='font-size:small; color:#444444'><em>&#964</em><sub>Ros</sub>=1</span>",
                xShift, yShift, 300, lineColor, plotEighteenId);

                                //JB
    }



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
        txtPrint(modelBanner, 10, yOffsetT, 500, txtColor, printModelId);  
        txtPrint("Vertical atmospheric structure", 10, yOffsetT + lineHeight, 200, txtColor, printModelId);
        //Column headings:

        var xTab = 190;
        txtPrint("i", 10, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>&#964</em><sub>Rosseland</sub>", 10 + xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
        txtPrint("log<sub>10</sub> depth (cm)", 10 + 2 * xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>T</em><sub>Kin</sub> (K)", 10 + 3 * xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>P</em><sub>Gas</sub> (dynes cm<sup>-2</sup>)", 10 + 4 * xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>P</em><sub>Rad</sub> (dynes cm<sup>-2</sup>)", 10 + 5 * xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>&#961</em> (g cm<sup>-3</sup>)", 10 + 6 * xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>N</em><sub>e</sub> (cm<sup>-3</sup>)", 10 + 7 * xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>N</em><sub>H</sub> (cm<sup>-3</sup>)", 10 + 8 * xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>&#956</em> (g)", 10 + 9 * xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>&#954</em><sub>Ros</sub> (cm<sup>2</sup> g<sup>-1</sup>)", 10 + 10 * xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>&#954</em><sub>500</sub> (cm<sup>2</sup> g<sup>-1</sup>)", 10 + 11 * xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);

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
        txtPrint(modelBanner, 10, yOffsetT, 500, txtColor, printModelId);  
        txtPrint("Monochromatic surface flux spectral energy distribution (SED)", 10, yOffsetT + lineHeight, 400, txtColor, printModelId);
        //Column headings:

        var xTab = 190;
        txtPrint("log<sub>10</sub> <em>&#955</em> (cm)", 10, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>F</em><sub>&#955</sub> (ergs s<sup>-1</sup> cm<sup>-2</sup> cm<sup>-1</sup>)", 10 + xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
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
        txtPrint(modelBanner, 10, yOffsetT, 500, txtColor, printModelId);  
        txtPrint("Monochromatic specific intensity distribution", 10, yOffsetT + lineHeight, 400, txtColor, printModelId);
        //Column headings:

        var xTab = 100;
        txtPrint("log<sub>10</sub><em>&#955</em> (cm)", 10, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
        txtPrint("log<sub>10</sub><em>I</em><sub>&#955</sub>(<em>&#952</em>) (ergs s<sup>-1</sup> cm<sup>-2</sup> cm<sup>-1</sup> steradian<sup>-1</sup>)",
                10 + xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
        for (var j = 0; j < numThetas; j += 2) {
            value = cosTheta[1][j].toPrecision(5);
            txtPrint("cos <em>&#952</em>=" + value, 10 + (j + 1) * xTab, yOffsetT + 3 * lineHeight, 400, txtColor, printModelId);
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
        txtPrint(modelBanner, 10, yOffsetT, 500, txtColor, printModelId);  
        txtPrint("Monochromatic line flux and atomic <em>E</em>-level populations", 10, yOffsetT + lineHeight, 400, txtColor, printModelId);
        var xTab = 190;
        //Column headings:

        txtPrint("log<sub>10</sub> <em>&#955</em> (cm)", 10, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>F</em><sub>&#955</sub> (ergs s<sup>-1</sup> cm<sup>-2</sup> cm<sup>-1</sup>)",
                10 + xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
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
        txtPrint("log<sub>10</sub> <em>N</em><sub>i</sub> (cm<sup>-3</sup>)", 10, atomOffset + yOffsetT, 400, txtColor, printModelId);
        txtPrint("i", 10, atomOffset + yOffsetT + 3 * lineHeight, 400, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>&#964</em><sub>Ross</sub>", 10 + xTab, atomOffset + yOffsetT + 3 * lineHeight, 400, txtColor, printModelId);
        for (var j = 0; j < 5; j++) {
            yTab = atomOffset + yOffsetT + 3 * lineHeight;
            value = yRightTickValStr[j];
            txtPrint(value, 400 + j * xTab, yTab, 400, txtColor, printModelId);
            value = yData[j].toPrecision(5);
            numPrint(value, 400 + j * xTab + 30, yTab, txtColor, printModelId);
            txtPrint("eV", 400 + j * xTab + 90, yTab, 400, txtColor, printModelId);
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
        txtPrint(modelBanner, 10, yOffsetT, 500, txtColor, printModelId);  
        txtPrint("Linear monochromatic continuum limb darkening coefficients (LCD)", 10, yOffsetT + lineHeight, 500, txtColor, printModelId);
        //Column headings:

        var xTab = 190;
        txtPrint("log<sub>10</sub> <em>&#955</em> (cm)", 10, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
        txtPrint("LDC", 10 + xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
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
          var iAbndMol = 0;
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
             for (var jj = gsFirstMol; jj < gsNspec; jj++){
                if (ionEqElement == gsName[jj]){
                   break;
                }
               iAbndMol++;
             } 
         }

        var modelBanner = "Model: Teff " + teff + " K, log(g) " + logg + " log cm/s/s, [A/H] " + zScale + ", mass " + massStar + " M_Sun";
        txtPrint(modelBanner, 10, yOffsetT, 500, txtColor, printModelId);  
        txtPrint("Chemical equilibrium population for " + ionEqElement + " (cm<sup>-3</sup>)",
                   10, yOffsetT + lineHeight, 400, txtColor, printModelId);
        //Column headings:
        var xTab = 190;
        txtPrint("i", 10, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
        txtPrint("log<sub>10</sub> <em>&#964</em><sub>Rosseland</sub>", 10 + xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
        if (ifMolPlot != true){
           txtPrint("log<sub>10</sub> <em>N</em><sub>I</sub>", 10 + 2 * xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
           txtPrint("log<sub>10</sub> <em>N</em><sub>II</sub>", 10 + 3 * xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
           txtPrint("log<sub>10</sub> <em>N</em><sub>III</sub>", 10 + 4 * xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
        } else {
           txtPrint("log<sub>10</sub> <em>N</em><sub>Mol</sub>", 10 + 2 * xTab, yOffsetT + 2*lineHeight, 400, txtColor, printModelId);
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
               //value = logE * masterMolPops[iAbndMol][i];
               value = logE * masterMolPops[0][i]; //Fix to one molecule (TiO) for now
               value = value.toPrecision(5);
               numPrint(value, 10 + 2 * xTab, yTab, txtColor, printModelId);
            }
        }

    } //end ifPrint

    if (ifPrintPP == true) {

        var modelBanner = "Model: Teff " + teff + " K, log(g) " + logg + " log cm/s/s, [A/H] " + zScale + ", mass " + massStar + " M_Sun";
        txtPrint(modelBanner, 10, yOffsetPrint, 500, txtColor, printModelId);
        txtPrint("Partial pressures every 4th depth", 10, yOffsetPrint + lineHeight, 400, txtColor, printModelId);
        //Column headings:

        var xTab = 100;
        txtPrint("log<sub>10</sub><em>&#964</em> ", 10, yOffsetPrint + 2*lineHeight, 400, txtColor, printModelId);
        txtPrint("log<sub>10</sub><em>P</em><sub>i</sub>(<em>&#964</em>) (log<sub>10</sub> dynes cm<sup>-2</sup>)",
                200 + xTab, yOffsetPrint + lineHeight, 400, txtColor, printModelId);
        for (var j = 0; j < gsNspec; j++) {
            value = nameGs[j];
            txtPrint(value, 10 + (j + 1) * xTab, yOffsetPrint + 3 * lineHeight, 400, txtColor, printModelId);
        }

        for (var i = 0; i < numDeps; i++) {
            yTab = yOffsetPrint + vOffset + (i+2) * lineHeight;
            value = logE*tauRos[1][i];
            value = value.toPrecision(5);
            numPrint(value, 10, yTab, txtColor, printModelId);
            for (var j = 0; j < gsNspec; j ++) {
                value = log10MasterGsPp[j][i];
                value = value.toPrecision(7);
                numPrint(value, 10 + (j + 1) * xTab, yTab, txtColor, printModelId);
            }
        }
    }





//
//
//  *******    END CODE
// 
//
    return;
}; //end function main()
