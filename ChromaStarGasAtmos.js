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
// Atmosphere astrophysical functions:
//

//log_10 Rosseland optical depth scale  
// CAUTION: Here tau[1][] is log_10!
var tauScale = function(numDeps, log10MinDepth, log10MaxDepth) {

//log_10 Rosseland optical depth scale  
//Java: double tauRos[][] = new double[2][numDeps];
//var tauRos = new double[2][numDeps];
    var dummy0 = [];
    var dummy1 = [];
    dummy0.length = numDeps;
    dummy1.length = numDeps;
    var tauRos = [
        dummy0,
        dummy1
    ];
    // Construct the log Rosseland optical depth scale:
    // Try equal spacing in log depth

    var ln10 = Math.log(10.0);
    //   var log10MinDepth = -6.0;
    //   var log10MaxDepth = 2.0;
    var logMinDepth = log10MinDepth * ln10;
    var logMaxDepth = log10MaxDepth * ln10;
    var deltaLogTau = (logMaxDepth - logMinDepth) / (numDeps - 1.0);
    var ii;
    for (var i = 0; i < numDeps; i++) {

        ii = i * 1.0;
        //Java: tauRos[1][i] = logMinDepth + ii * deltaLogTau;
        //Java: tauRos[0][i] = Math.exp(tauRos[1][i]);
        tauRos[1][i] = logMinDepth + ii * deltaLogTau;
        tauRos[0][i] = Math.exp(tauRos[1][i]);
    }

    return tauRos;
};

var phxSunTeff = 5777.0;
var phxSunLogEg = Math.log(10.0) * 4.44; //base e!

//Corresponding Tau_1200 grid (ie. lambda_0 = 1200 nm):    
var phxSunTau64Fn = function() {
    var phxSunTau64 = [
        0.00000000000000000e+00, 9.99999999999999955e-07, 1.34596032415536424e-06,
        1.81160919420041334e-06, 2.43835409826882661e-06, 3.28192787251147086e-06,
        4.41734470314007309e-06, 5.94557070854439435e-06, 8.00250227816105150e-06,
        1.07710505603676912e-05, 1.44974067037263168e-05, 1.95129342263596224e-05,
        2.62636352765333536e-05, 3.53498110503010944e-05, 4.75794431400941376e-05,
        6.40400427119728256e-05, 8.61953566475303296e-05, 1.16015530173997152e-04,
        1.56152300600049664e-04, 2.10174801133248704e-04, 2.82886943462596928e-04,
        3.80754602122237184e-04, 5.12480587696093120e-04, 6.89778537938765824e-04,
        9.28414544519474432e-04, 1.24960914129198688e-03, 1.68192432488086880e-03,
        2.26380340952144672e-03, 3.04698957090350784e-03, 4.10112707055130048e-03,
        5.51995432128156800e-03, 7.42963950759494912e-03, 1.00000000000000002e-02,
        1.34596032415536416e-02, 1.81160919420041312e-02, 2.43835409826882656e-02,
        3.28192787251147072e-02, 4.41734470314006464e-02, 5.94557070854439424e-02,
        8.00250227816105216e-02, 1.07710505603676912e-01, 1.44974067037263136e-01,
        1.95129342263596224e-01, 2.62636352765332992e-01, 3.53498110503010240e-01,
        4.75794431400941440e-01, 6.40400427119728384e-01, 8.61953566475303168e-01,
        1.16015530173997152e+00, 1.56152300600049664e+00, 2.10174801133248704e+00,
        2.82886943462596640e+00, 3.80754602122236800e+00, 5.12480587696092608e+00,
        6.89778537938765824e+00, 9.28414544519474432e+00, 1.24960914129198672e+01,
        1.68192432488086880e+01, 2.26380340952144640e+01, 3.04698957090350528e+01,
        4.10112707055129536e+01, 5.51995432128157312e+01, 7.42963950759495040e+01,
        1.00000000000000000e+02
    ];
    return phxSunTau64;
};
var logPhxSunTau64 = function() {

    var phxSunTau64 = phxSunTau64Fn();

    var logE = logTen(Math.E);
    var numPhxDep = phxSunTau64.length;
    var logPhxSunTau64 = [];
    logPhxSunTau64.length = numPhxDep;
    for (var i = 1; i < numPhxDep; i++) {
        logPhxSunTau64[i] = Math.log(phxSunTau64[i]);
    }
    logPhxSunTau64[0] = logPhxSunTau64[1] - (logPhxSunTau64[numPhxDep - 1] - logPhxSunTau64[1]) / numPhxDep;
    return logPhxSunTau64;
};
var phxSunTemp = function(teff, numDeps, tauRos) {

    var phxSunTeff = 5777.0;
    var phxSunLogEg = Math.log(10.0) * 4.44; //base e!    

    var logE = logTen(Math.E);
    //Theoretical radiative/convective model from Phoenix V15:
    var phxSunTemp64 = [
        3.75778887392339840e+03, 3.75778887392339840e+03, 3.78480175327941504e+03,
        3.81385432525541760e+03, 3.84360130602512768e+03, 3.87340585446516608e+03,
        3.90300184305606656e+03, 3.93231689265254528e+03, 3.96137919852984000e+03,
        3.99027119028325824e+03, 4.01910484194699648e+03, 4.04798292490651008e+03,
        4.07699548886169152e+03, 4.10623218035810816e+03, 4.13574364539801920e+03,
        4.16548101060783104e+03, 4.19541371831173824e+03, 4.22551121760088000e+03,
        4.25571229065970624e+03, 4.28594188575783232e+03, 4.31613168919769152e+03,
        4.34620698440244928e+03, 4.37603327507328960e+03, 4.40564394765877952e+03,
        4.43507740841559296e+03, 4.46439148496796224e+03, 4.49375530130093952e+03,
        4.52341166116436480e+03, 4.55357281866347264e+03, 4.58446079852491520e+03,
        4.61663974201107520e+03, 4.65052341797810624e+03, 4.68623381803595456e+03,
        4.72408924142126144e+03, 4.76494152329308416e+03, 4.80984310271200128e+03,
        4.85897778977827584e+03, 4.91315894280032960e+03, 4.97390461818851328e+03,
        5.04531167969494336e+03, 5.12680296183560704e+03, 5.22061204180252480e+03,
        5.32918534350649152e+03, 5.46202432323604352e+03, 5.61966782651567040e+03,
        5.80986721241013376e+03, 6.03911828822760320e+03, 6.23433005487621120e+03,
        6.53458311644527488e+03, 6.87429103746811904e+03, 7.29999981509928192e+03,
        7.66682942009826304e+03, 7.94223816217841024e+03, 8.16133659245977728e+03,
        8.35020013757955200e+03, 8.52047273964030720e+03, 8.67812135633704064e+03,
        8.82687568743616768e+03, 8.96926538519515648e+03, 9.10706359999037824e+03,
        9.24154121553023488e+03, 9.37363000902155008e+03, 9.50427569030960000e+03,
        9.63219702937432192e+03
    ];
    // interpolate onto gS3 tauRos grid and re-scale with Teff:
    var phxSunTemp = [];
    phxSunTemp.length = numDeps;
    var scaleTemp = [];
    scaleTemp.length = 2;
    scaleTemp[0] = [];
    scaleTemp[1] = [];
    scaleTemp[0].length = numDeps;
    scaleTemp[1].length = numDeps;
    for (var i = 0; i < numDeps; i++) {
        phxSunTemp[i] = interpol(logPhxSunTau64(), phxSunTemp64, tauRos[1][i]);
        scaleTemp[0][i] = teff * phxSunTemp[i] / phxSunTeff;
        scaleTemp[1][i] = Math.log(scaleTemp[0][i]);
        //System.out.println("tauRos[1][i] " + logE * tauRos[1][i] + " scaleTemp[1][i] " + logE * scaleTemp[1][i]);
    }

    return scaleTemp;
};
var phxSunPGas = function(grav, numDeps, tauRos) {

    var phxSunTeff = 5777.0;
    var phxSunLogEg = Math.log(10.0) * 4.44; //base e!    

    var logE = logTen(Math.E);
    var logEg = Math.log(grav); //base e!

    //Theoretical radiative/convective model from Phoenix V15:
    var phxSunPGas64 = [
        1.00000000000000005e-04, 7.28828683006412544e+01, 8.61732126528505984e+01,
        1.01843641855932976e+02, 1.20317369304629504e+02, 1.42093296011949696e+02,
        1.67758727999644384e+02, 1.98004769223716256e+02, 2.33644726494082176e+02,
        2.75635953319757664e+02, 3.25104809120938880e+02, 3.83378880706399168e+02,
        4.52022443862726592e+02, 5.32877321364649344e+02, 6.28113128741022208e+02,
        7.40284569989930496e+02, 8.72399144145001216e+02, 1.02799724165148560e+03,
        1.21124571517496000e+03, 1.42704756928025427e+03, 1.68117132827309248e+03,
        1.98040330055171296e+03, 2.33272402439094176e+03, 2.74752260927171264e+03,
        3.23584954067544384e+03, 3.81071167175796544e+03, 4.48742481283848128e+03,
        5.28403135449994368e+03, 6.22178478543013120e+03, 7.32571484052561408e+03,
        8.62531818498740864e+03, 1.01553497268350960e+04, 1.19567104697253520e+04,
        1.40775115384306991e+04, 1.65743702896828832e+04, 1.95139034178162464e+04,
        2.29742653550211872e+04, 2.70468752817440448e+04, 3.18381441391788864e+04,
        3.74704748898233472e+04, 4.40799661582952512e+04, 5.18080650391892096e+04,
        6.07793647633492224e+04, 7.10351288049853440e+04, 8.24259773567987968e+04,
        9.44866985169806080e+04, 1.06329924298695632e+05, 1.17862219382348656e+05,
        1.28295128203359424e+05, 1.36933948396180352e+05, 1.43493910023715958e+05,
        1.48487688700034048e+05, 1.52795575243316608e+05, 1.56932489940248512e+05,
        1.61140965195830048e+05, 1.65564070780028256e+05, 1.70312554701480352e+05,
        1.75486986284790656e+05, 1.81187218697219744e+05, 1.87518050413513344e+05,
        1.94593473563783808e+05, 2.02540389901047584e+05, 2.11500759107428064e+05,
        2.21643078023966592e+05
    ];
    var numPhxDeps = phxSunPGas64.length; //yeah, I know, 64, but that could change!
    var logPhxSunPGas64 = [];
    logPhxSunPGas64.length = numPhxDeps;
    for (var i = 0; i < phxSunPGas64.length; i++) {
        logPhxSunPGas64[i] = Math.log(phxSunPGas64[i]);
    }

    // interpolate onto gS3 tauRos grid and re-scale with Teff:
    var phxSunPGas = [];
    phxSunPGas.length = numDeps;
    var logPhxSunPGas = [];
    logPhxSunPGas.length = numDeps;
    var scalePGas = [];
    scalePGas.length = 2;
    scalePGas[0] = [];
    scalePGas[1] = [];
    scalePGas[0].length = numDeps;
    scalePGas[1].length = numDeps;
    for (var i = 0; i < numDeps; i++) {
        logPhxSunPGas[i] = interpol(logPhxSunTau64(), logPhxSunPGas64, tauRos[1][i]);
        scalePGas[1][i] = logEg + logPhxSunPGas[i] - phxSunLogEg;
        scalePGas[0][i] = Math.exp(scalePGas[1][i]);
        //System.out.println("scalePGas[1][i] " + logE * scalePGas[1][i]);
    }

    return scalePGas;
};
var phxSunNe = function(grav, numDeps, tauRos, scaleTemp, zScale) {

    var phxSunTeff = 5777.0;
    var phxSunLogEg = Math.log(10.0) * 4.44; //base e!    

    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var logK = Math.log(k);

    var logE = logTen(Math.E);
    var logEg = Math.log(grav); //base e!
    var logEzScale = Math.log(zScale);
    //Theoretical radiative/convective model from Phoenix V15:
    var phxSunPe64 = [
        1.53086468021591745e-07, 5.66518458165471424e-03, 6.72808433760886656e-03,
        8.00271552708326656e-03, 9.51809762875982208e-03, 1.13117438884935648e-02,
        1.34299756939525680e-02, 1.59287848014678144e-02, 1.88751877391284448e-02,
        2.23491173128862976e-02, 2.64457686695698400e-02, 3.12779350532322240e-02,
        3.69791374171045888e-02, 4.37078139287801024e-02, 5.16503829681397248e-02,
        6.10221573903118336e-02, 7.20768505868849536e-02, 8.51123959415642752e-02,
        1.00475763241309840e-01, 1.18571138726675232e-01, 1.39870552376136714e-01,
        1.64923053015554560e-01, 1.94357063774820192e-01, 2.28928720249475840e-01,
        2.69525262128246720e-01, 3.17192228891198592e-01, 3.73192988074577856e-01,
        4.39058414038311360e-01, 5.16615873984964544e-01, 6.08066526878471680e-01,
        7.16264581324812416e-01, 8.44657163125294336e-01, 9.97267452897639808e-01,
        1.17915717019238848e+00, 1.39715732004723136e+00, 1.66026825646718432e+00,
        1.97886823850223904e+00, 2.36716912384854112e+00, 2.84540915928013805e+00,
        3.44853013665125120e+00, 4.21529199485384704e+00, 5.21488490421314560e+00,
        6.56660005867586432e+00, 8.55643059606379776e+00, 1.16931723772200080e+01,
        1.71629079266534368e+01, 2.75152019254691616e+01, 4.18720694941323264e+01,
        7.66283674228108288e+01, 1.45995186997127872e+02, 3.04766672331673792e+02,
        5.44151864837275328e+02, 8.17181982032739072e+02, 1.11216222784450608e+03,
        1.43633935534913856e+03, 1.79603721463325728e+03, 2.19692608617747040e+03,
        2.64548745663525184e+03, 3.14931730610757952e+03, 3.71721361233669376e+03,
        4.35932065708395904e+03, 5.08736399892079296e+03, 5.91634943413070720e+03,
        6.85104524590000384e+03
    ];
    var numPhxDeps = phxSunPe64.length; //yeah, I know, 64, but that could change!
    var logPhxSunPe64 = [];
    logPhxSunPe64.length = numPhxDeps;
    for (var i = 0; i < phxSunPe64.length; i++) {
        logPhxSunPe64[i] = Math.log(phxSunPe64[i]);
    }

    // interpolate onto gS3 tauRos grid and re-scale with Teff:
    var phxSunPe = [];
    phxSunPe.length = numDeps;
    var logPhxSunPe = [];
    logPhxSunPe.length = numDeps;
    var logScalePe = [];
    logScalePe.length = numDeps;
    var scaleNe = [];
    scaleNe.length = 2;
    scaleNe[0] = [];
    scaleNe[1] = [];
    scaleNe[0].length = numDeps;
    scaleNe[1].length = numDeps;
    for (var i = 0; i < numDeps; i++) {
        logPhxSunPe[i] = interpol(logPhxSunTau64(), logPhxSunPe64, tauRos[1][i]);
        logScalePe[i] = logEg + logPhxSunPe[i] - phxSunLogEg - logEzScale;
        scaleNe[1][i] = logScalePe[i] - scaleTemp[1][i] - logK;
        scaleNe[0][i] = Math.exp(scaleNe[1][i]);
        //System.out.println("scaleNe[1][i] " + logE * scaleNe[1][i]);
    }

    return scaleNe;
};
//Try to recover the opacity as lambda_0 = 1200 nm:
var phxSunKappa = function(numDeps, tauRos, zScale) {

    var phxSunTau64 = phxSunTau64Fn();

    var logEzScale = Math.log(zScale);
    //Theoretical radiative/convective model from Phoenix V15:
    var phxSunRho64 = [
        4.13782346832222649e-16, 3.02095569469690462e-10, 3.54633225055968270e-10,
        4.15928280610231993e-10, 4.87569895799879155e-10, 5.71381142733345291e-10,
        6.69468927495419999e-10, 7.84278468388299388e-10, 9.18654436245877140e-10,
        1.07590983297567878e-09, 1.25990158939278389e-09, 1.47513757382262481e-09,
        1.72688539188771193e-09, 2.02128936476074103e-09, 2.36554000030610158e-09,
        2.76809615861929229e-09, 3.23884396019102352e-09, 3.78934920783997866e-09,
        4.43317360103421215e-09, 5.18621173362546736e-09, 6.06707380164391496e-09,
        7.09757215466433105e-09, 8.30337600953291647e-09, 9.71426731449415417e-09,
        1.13650770268615465e-08, 1.32964932176367733e-08, 1.55557163673284530e-08,
        1.81974840999693492e-08, 2.12855768344032029e-08, 2.48940684847852482e-08,
        2.91068454381155637e-08, 3.40213170202104799e-08, 3.97519122004400661e-08,
        4.64290866159173997e-08, 5.41967343519845744e-08, 6.32144869975830899e-08,
        7.36729431582295057e-08, 8.57774421976652924e-08, 9.97399445761737017e-08,
        1.15721981027072251e-07, 1.33967659681056212e-07, 1.54620178670780798e-07,
        1.77690495649821781e-07, 2.02608223525831620e-07, 2.28481547026651195e-07,
        2.53309018291389784e-07, 2.74195019891415717e-07, 2.94373976046088894e-07,
        3.05614181338722779e-07, 3.09912387277346887e-07, 3.05484245799381785e-07,
        3.00519445088246902e-07, 2.98007120264342719e-07, 2.97336159154754909e-07,
        2.97854109132361140e-07, 2.99327766949861546e-07, 3.01691329467384893e-07,
        3.04944348605014908e-07, 3.09125225055924192e-07, 3.14302162196028050e-07,
        3.20569231575000568e-07, 3.28044919674719785e-07, 3.36858977566225440e-07,
        3.47271781807407172e-07
    ];
    var phxSunRadius64 = [
        9.98760000000000000e+10, 9.98660572490945152e+10, 9.98645871807186304e+10,
        9.98631098643980160e+10, 9.98616245003269760e+10, 9.98601306458076032e+10,
        9.98586280682994048e+10, 9.98571166428681216e+10, 9.98555962828737792e+10,
        9.98540668955362944e+10, 9.98525283799022080e+10, 9.98509805586940416e+10,
        9.98494232096872704e+10, 9.98478561022866944e+10, 9.98462789875034752e+10,
        9.98446916403608064e+10, 9.98430938763377024e+10, 9.98414855440511616e+10,
        9.98398665329129600e+10, 9.98382367818977152e+10, 9.98365962762478464e+10,
        9.98349450434777856e+10, 9.98332831693342848e+10, 9.98316107506358144e+10,
        9.98299278514395904e+10, 9.98282344996977408e+10, 9.98265306530218624e+10,
        9.98248161610832000e+10, 9.98230907740896512e+10, 9.98213541602841472e+10,
        9.98196058171550848e+10, 9.98178450629064448e+10, 9.98160711682936960e+10,
        9.98142833645708160e+10, 9.98124806655167488e+10, 9.98106617425436544e+10,
        9.98088251712680448e+10, 9.98069695137641728e+10, 9.98050931816160256e+10,
        9.98031941655960192e+10, 9.98012715884401664e+10, 9.97993275763000704e+10,
        9.97973698841808128e+10, 9.97954186071983616e+10, 9.97935139683624704e+10,
        9.97917197632915456e+10, 9.97901090800493440e+10, 9.97886636105590528e+10,
        9.97874361487011200e+10, 9.97864521731274880e+10, 9.97857037165240960e+10,
        9.97851119909964288e+10, 9.97845890321633152e+10, 9.97840832513957504e+10,
        9.97835682848038784e+10, 9.97830286360697344e+10, 9.97824528501662336e+10,
        9.97818311493811456e+10, 9.97811545315540224e+10, 9.97804143368400768e+10,
        9.97796020159347072e+10, 9.97787090120484864e+10, 9.97777268638511104e+10,
        9.97766460582020224e+10
    ];
    var numPhxDeps = phxSunRadius64.length;
    var phxSunKappa64 = [];
    phxSunKappa64.length = numPhxDeps;
    var logPhxSunKappa64 = [];
    logPhxSunKappa64.length = numPhxDeps;
    //double[] logPhxSunRho64 = new double[numPhxDeps];
    //double[] logPhxSunRadius64 = new double[numPhxDeps];

//Fix to get right depth scale and right line strengths:
// Yeah - everywhere ya go - opacity fudge
    var fudge = 0.25;
    var logFudge = Math.log(fudge);
    var deltaRho, deltaRadius, deltaTau, logDeltaRho, logDeltaRadius, logDeltaTau;
    var logE = logTen(Math.E);
    for (var i = 1; i < numPhxDeps; i++) {

//Renormalize radii before taking difference
//Caution: Radius *decreases* with increasing i (inward) and we'll be taking the log:
        deltaRadius = (1.0e-11 * phxSunRadius64[i - 1]) - (1.0e-11 * phxSunRadius64[i]);
        deltaRadius = Math.abs(deltaRadius);
        //restore to cm:
        deltaRadius = 1.0e11 * deltaRadius;
        //Renormalize before taking rho difference
        deltaRho = (1.0e9 * phxSunRho64[i]) - (1.0e9 * phxSunRho64[i - 1]);
        deltaRho = Math.abs(deltaRho);
        //Restore g/cm^3:
        deltaRho = 1.0e-9 * deltaRho;
        //Renormalize before taking rho difference
        deltaTau = (1.0e2 * phxSunTau64[i]) - (1.0e2 * phxSunTau64[i - 1]);
        deltaTau = Math.abs(deltaTau);
        deltaTau = 1.0e-2 * deltaTau;
        logDeltaRadius = Math.log(deltaRadius);
        logDeltaRho = Math.log(deltaRho);
        logDeltaTau = Math.log(deltaTau);
        logPhxSunKappa64[i] = logDeltaTau - logDeltaRho - logDeltaRadius - logEzScale + logFudge;
        phxSunKappa64[i] = Math.exp(logPhxSunKappa64[i]);
        //System.out.println("logPhxSunKappa64[i] " + logE*logPhxSunKappa64[i]);

    }

    logPhxSunKappa64[0] = logPhxSunKappa64[1];
    phxSunKappa64[0] = phxSunKappa64[1];
    // interpolate onto gS3 tauRos grid and re-scale with Teff:
    var phxSunKappa = [];
    phxSunKappa.length = 2;
    phxSunKappa[0] = [];
    phxSunKappa[1] = [];
    phxSunKappa[0].length = numDeps;
    phxSunKappa[1].length = numDeps;
    for (var i = 0; i < numDeps; i++) {
        phxSunKappa[1][i] = interpol(logPhxSunTau64(), logPhxSunKappa64, tauRos[1][i]);
        phxSunKappa[0][i] = Math.exp(phxSunKappa[1][i]);
        //System.out.println("phxSunKappa[1][i], i= " + i + " " + logE * phxSunKappa[1][i]);
    }

    return phxSunKappa;
};

/**
 * Solves the equation of state (EOS) for the mass density (rho) given total
 * pressure from HSE solution, for a mixture of ideal gas particles and photons
 *
 * Need to assume a mean molecular weight structure, mu(Tau)
 *
 */
var massDensity = function(numDeps, temp, press, mmw, zScale) {

    //press is a 4 x numDeps array:
    // rows 0 & 1 are linear and log *gas* pressure, respectively
    // rows 2 & 3 are linear and log *radiation* pressure
    // double c = 9.9989E+10; // light speed in vaccuum in cm/s
    // double sigma = 5.670373E-5;   //Stefan-Boltzmann constant ergs/s/cm^2/K^4   
    //Row 0 of mmwNe is Mean molecular weight in amu
    var logE = logTen(Math.E); // for debug output
    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var amu = 1.66053892E-24; // atomic mass unit in g
    var logK = Math.log(k);
    var logMuAmu;
    var logAmu = Math.log(amu);
    var dummy0 = [];
    var dummy1 = [];
    dummy0.length = numDeps;
    dummy1.length = numDeps;
    var rho = [dummy0, dummy1];
    // Declare scatch variables:
    // double logPrad, pRad, pGas, logPgas;
    for (var i = 0; i < numDeps; i++) {

        logMuAmu = Math.log(mmw[i]) + logAmu;
        // Compute LTE bolometric radiation contribution to total HSE pressure
        //logPrad = radFac + 4.0*temp[1][i] ;
        //pRad = Math.exp(logPrad);
        //pGas = press[0][i] - pRad;
        //logPgas = Math.log(pGas);
        rho[1][i] = press[1][i] - temp[1][i] + (logMuAmu - logK);
        rho[0][i] = Math.exp(rho[1][i]);
        //console.log("i " + i + " press[1] " + logE*press[1][i] + " mmw[i] " + mmw[i] + " rho " + logE * rho[1][i]);
    }

    return rho;
};
var mmwFn = function(numDeps, temp, zScale) {

    //Row 0 is linear mean molecular weight, "mu", in amu
    //Row 1 is log_e electron density in cm^-3


    var mmw = [];
    mmw.length = numDeps;
    var logE = logTen(Math.E); // for debug output

    var k = 1.3806488E-16; // Boltzmann constant in ergs/K               
    var logK = Math.log(k);
    var logMu, logMuN, logMuI, logTempN, logTempI;
    // Carrol & Ostlie 2nd Ed., p. 293: mu_N = 1.3, mu_I = 0.62
    logMuN = Math.log(1.3);
    logMuI = Math.log(0.62);
    logTempN = Math.log(4000.0); // Teff in K for fully neutral gas?
    logTempI = Math.log(10000.0); // Teff in K for *Hydrogen* fully ionized?

    //System.out.println("temp   logNe   mu");
    for (var id = 0; id < numDeps; id++) {

        //Give mu the same temperature dependence as 1/Ne between the fully neutral and fully ionized limits?? - Not yet! 
        if (temp[1][id] < logTempN) {
            mmw[id] = Math.exp(logMuN);
        } else if ((temp[1][id] > logTempN) && (temp[1][id] < logTempI)) {
            logMu = logMuN + ((temp[1][id] - logTempN) / (logTempI - logTempN)) * (logMuI - logMuN);
            //Mean molecular weight in amu
            mmw[id] = Math.exp(logMu);
        } else {
            mmw[id] = Math.exp(logMuI);
        }

    }

    return mmw;
};

/** 
 * Returns vector of numDep linear geometric DEPTHS below top of atmosphere - in
 * cm (cgs) for consistency with log(g) units
 *
 * *May not be useful - scale depends on log(g)
 */
var depthScale = function(numDeps, tauRos, kappa, rho) {

    var logE = logTen(Math.E); // for debug output
//double ln10 = Math.log(10.0); //handy wee quantity 
//log_10 Rosseland optical depth scale  
    var depths = [];
    depths.length = numDeps;
    // Upper bounday condition: 
    // Zero point at top of atmosphere - this can be shifted later?
    // log(z) cannot really correspond to zero 
    //double logZ1 = -10.0;  // log(cm)
    //depths[0] = Math.pow(10.0, logZ1);  //cm
    var iStart = 0;
    var z1 = 1.0e-19; //cm

    for (var i = 0; i <= iStart; i++) {
        depths[i] = z1;
    }
    //var minZ = 1.0E5; // = 1km - Minimum increase in depth from one point to the next

    // declare scratch variables
    //double deltaX, deltaZ, logZ2;
    var deltaX, deltaZ, z2, z3, help, logHelp, helpNext;
    //        h, k1, k2, k3, k4, logH, logK1, logK2, logK3, logK4;
    //Euler's method for depth at 2nd point in
    // Need to avoid using rho at upper boundary, so rho value must be taken at y_n+2 on all RHSs

    //z1 =z2;
    //Trapezoid rule:
    //First integrand:
    //deltaX = tauRos[1][iStart+1] - tauRos[1][iStart];
    logHelp = tauRos[1][iStart] - kappa[1][iStart] - rho[1][iStart];
    helpNext = Math.exp(logHelp);
    help = helpNext;
    for (var i = iStart + 1; i < numDeps; i++) {

//Trapezoid method:
        deltaX = tauRos[1][i] - tauRos[1][i - 1];
        logHelp = tauRos[1][i] - kappa[1][i] - rho[1][i];
        helpNext = Math.exp(logHelp);
        deltaZ = deltaX * (0.5 * (help + helpNext));
        //console.log("i " + i + " tauRos[1] " + logE*tauRos[1][i] + " kappa[1] " + logE*kappa[1][i] + " rho[1] " + logE*rho[1][i] + " deltaX " + deltaX + " deltaZ " + deltaZ);
        z2 = z1 + deltaZ;
        depths[i] = z2;
        z1 = z2;
        help = helpNext;
    }

    return depths;
};

    var phx5kRefTeff = 5000.0;
    var phx5kRefLogEg = Math.log(10.0) * 4.5;  //base e!
//He abundance from  Grevesse Asplund et al 2010
    var phx5kRefLogAHe = Math.log(10.0) * (10.93 - 12.0);  //base e "A_12" logarithmic abundance scale!

    //Corresponding Tau_12000 grid (ie. lambda_0 = 1200 nm):    
    var phx5kRefTau64 = [
      0.00000000000000000e+00, 9.99999999999999955e-07, 1.34596032415536424e-06,
      1.81160919420041334e-06, 2.43835409826882661e-06, 3.28192787251147086e-06,
      4.41734470314007309e-06, 5.94557070854439435e-06, 8.00250227816105150e-06,
      1.07710505603676914e-05, 1.44974067037263169e-05, 1.95129342263596216e-05,
      2.62636352765333530e-05, 3.53498110503010939e-05, 4.75794431400941383e-05,
      6.40400427119728238e-05, 8.61953566475303262e-05, 1.16015530173997159e-04,
      1.56152300600049659e-04, 2.10174801133248699e-04, 2.82886943462596935e-04,
      3.80754602122237182e-04, 5.12480587696093125e-04, 6.89778537938765847e-04,
      9.28414544519474451e-04, 1.24960914129198684e-03, 1.68192432488086874e-03,
      2.26380340952144670e-03, 3.04698957090350801e-03, 4.10112707055130046e-03,
      5.51995432128156785e-03, 7.42963950759494875e-03, 1.00000000000000002e-02,
      1.34596032415536422e-02, 1.81160919420041318e-02, 2.43835409826882663e-02,
      3.28192787251147047e-02, 4.41734470314006436e-02, 5.94557070854439401e-02,
      8.00250227816105275e-02, 1.07710505603676912e-01, 1.44974067037263149e-01,
      1.95129342263596212e-01, 2.62636352765332981e-01, 3.53498110503010221e-01,
      4.75794431400941464e-01, 6.40400427119728333e-01, 8.61953566475303190e-01,
      1.16015530173997150e+00, 1.56152300600049654e+00, 2.10174801133248712e+00,
      2.82886943462596641e+00, 3.80754602122236818e+00, 5.12480587696092638e+00,
      6.89778537938765801e+00, 9.28414544519474383e+00, 1.24960914129198670e+01,
      1.68192432488086894e+01, 2.26380340952144650e+01, 3.04698957090350540e+01,
      4.10112707055129562e+01, 5.51995432128157333e+01, 7.42963950759495049e+01,
      1.00000000000000000e+02
    ];

    var logPhxRefTau64 = function() {

        var logE = logTen(Math.E);

        var numPhxDep = phx5kRefTau64.length;
        var logPhxRefTau64 = []; 
        logPhxRefTau64.length = numPhxDep;
        for (var i = 1; i < numPhxDep; i++) {
            logPhxRefTau64[i] = Math.log(phx5kRefTau64[i]);
        }
        logPhxRefTau64[0] = logPhxRefTau64[1] - (logPhxRefTau64[numPhxDep - 1] - logPhxRefTau64[1]) / numPhxDep;
        return logPhxRefTau64;
    };

    var phx5kRefTemp = function(teff, numDeps, tauRos) {

        var logE = Math.log10(Math.E);

        //Theoretical radiative/convective model from Phoenix V15:
        var phx5kRefTemp64 = [
          3.15213572679982190e+03, 3.15213572679982190e+03, 3.17988621810632685e+03,
          3.21012887128011243e+03, 3.24126626267038500e+03, 3.27276078893546673e+03,
          3.30435725697820226e+03, 3.33589185632140106e+03, 3.36724151725549154e+03,
          3.39831714195318273e+03, 3.42906935013664861e+03, 3.45949368388945595e+03,
          3.48962758169505923e+03, 3.51953742647688796e+03, 3.54929791042697934e+03,
          3.57896962155466872e+03, 3.60858205550851335e+03, 3.63812646699481775e+03,
          3.66755983657917068e+03, 3.69681905522719444e+03, 3.72583932497757132e+03,
          3.75457006928661031e+03, 3.78298372918123914e+03, 3.81109104721021231e+03,
          3.83893072914395862e+03, 3.86656355962043835e+03, 3.89408059675027425e+03,
          3.92160316230741546e+03, 3.94927225929978204e+03, 3.97726284805320847e+03,
          4.00584847611869327e+03, 4.03531360317989993e+03, 4.06591896438200047e+03,
          4.09802860937899732e+03, 4.13221207874272022e+03, 4.16915227717330799e+03,
          4.20937593060261861e+03, 4.25369220113429128e+03, 4.30330739566306784e+03,
          4.36035870964639616e+03, 4.42601579216115442e+03, 4.50281614584142153e+03,
          4.59386420090837146e+03, 4.70448179136501403e+03, 4.83727710376560208e+03,
          4.99516189027659129e+03, 5.19102132587796405e+03, 5.40505223548941285e+03,
          5.67247302987449984e+03, 5.95695843497286933e+03, 6.27957483223234703e+03,
          6.71365960956718118e+03, 7.06828382342861460e+03, 7.34157936910693206e+03,
          7.56939938735570740e+03, 7.77138428264261165e+03, 7.95656000812699585e+03,
          8.13006721530056711e+03, 8.29523535580475982e+03, 8.45429779465689171e+03,
          8.60879260449185131e+03, 8.75981713693203528e+03, 8.90838141718757288e+03,
          9.05361290415211806e+03
        ];

        // interpolate onto gS3 tauRos grid and re-scale with Teff:
        var phx5kRefTemp = []; 
        phx5kRefTemp.length = numDeps;
        var scaleTemp = [];
        scaleTemp.length = 2;
        scaleTemp[0] = [];
        scaleTemp[1] = [];
        scaleTemp[0].length = numDeps;
        scaleTemp[1].length = numDeps;
        for (var i = 0; i < numDeps; i++) {
            phx5kRefTemp[i] = interpol(logPhxRefTau64(), phx5kRefTemp64, tauRos[1][i]);
            scaleTemp[0][i] = teff * phx5kRefTemp[i] / phx5kRefTeff;
            scaleTemp[1][i] = Math.log(scaleTemp[0][i]);
            //System.out.println("tauRos[1][i] " + logE * tauRos[1][i] + " scaleTemp[1][i] " + logE * scaleTemp[1][i]);
        }

        return scaleTemp;

    };

    var phx5kRefPGas = function(grav, zScale, logAHe, numDeps, tauRos) {

        //System.out.println("ScaleT5000.phx5kRefPGas called");

        var logE = Math.log10(Math.E);
        var logEg = Math.log(grav); //base e!
        var AHe = Math.exp(logAHe);
        var refAHe = Math.exp(phx5kRefLogAHe);
        var logZScale = Math.log(zScale);

        //Theoretical radiative/convective model from Phoenix V15:
        var phx5kRefPGas64 = [
         1.00000000000000005e-04, 1.03770217591881035e+02, 1.24242770084417913e+02,
         1.47686628640383276e+02, 1.74578854906314291e+02, 2.05506972274478784e+02,
         2.41168221287605292e+02, 2.82385081738383917e+02, 3.30127686150304896e+02,
         3.85540773715381306e+02, 4.49974446823229414e+02, 5.25018679681323647e+02,
         6.12542265074691159e+02, 7.14737800095933608e+02, 8.34175243666085407e+02,
         9.73867213356324669e+02, 1.13734973870022168e+03, 1.32878148706864113e+03,
         1.55306409432270971e+03, 1.81598529465124716e+03, 2.12438618583220841e+03,
         2.48635477283421324e+03, 2.91145034581766595e+03, 3.41095942605562823e+03,
         3.99819276314161607e+03, 4.68883438023894087e+03, 5.50134310662684311e+03,
         6.45741052408807354e+03, 7.58249196327514983e+03, 8.90641248566333525e+03,
         1.04639741154490002e+04, 1.22956502717452295e+04, 1.44484787849992390e+04,
         1.69769301182948657e+04, 1.99435621814443475e+04, 2.34195796692420117e+04,
         2.74860930366683497e+04, 3.22351125605895031e+04, 3.77699103578024442e+04,
         4.42033085085744533e+04, 5.16616495136288213e+04, 6.02879692077906366e+04,
         7.02475218656768702e+04, 8.17365047611011832e+04, 9.50146489805318997e+04,
         1.10441316485543124e+05, 1.28451318144638804e+05, 1.49415613553191157e+05,
         1.72877372164747008e+05, 1.96852852539717947e+05, 2.18808320050485723e+05,
         2.35794833242603316e+05, 2.48716041541587241e+05, 2.59902150512206339e+05,
         2.70560370352023339e+05, 2.81251297069544089e+05, 2.92310802132537181e+05,
         3.03988239352240635e+05, 3.16495216131040419e+05, 3.30029076402488339e+05,
         3.44786943994771456e+05, 3.60975297786138486e+05, 3.78815092131546407e+05,
         3.98560549755298765e+05
        ];

        var numPhxDeps = phx5kRefPGas64.length;  //yeah, I know, 64, but that could change!
        var logPhxRefPGas64 = []; 
        logPhxRefPGas64.length = numPhxDeps;
        for (var i = 0; i < numPhxDeps; i++) {
            logPhxRefPGas64[i] = Math.log(phx5kRefPGas64[i]);
        }

        // interpolate onto gS3 tauRos grid and re-scale with grav, metallicity and He abundance
        // From Gray 3rd Ed. Ch.9, esp p. 189, 196:
        var phx5kRefPGas = []; 
        phx5kRefPGas.length = numDeps;
        var logPhxRefPGas = []; 
        logPhxRefPGas.length = numDeps;
        var scalePGas = [];
        scalePGas.length = 2;
        scalePGas[0] = [];
        scalePGas[1] = [];
        scalePGas[0].length = numDeps;
        scalePGas[1].length = numDeps;
//exponents in scaling with g:
        var gexpTop = 0.54; //top of model
        var gexpBottom = 0.64; //bottom of model
        var gexpRange = (gexpBottom - gexpTop);
        var tauLogRange =  tauRos[1][numDeps-1] -  tauRos[1][0]; 
        var thisGexp;
// factor for scaling with A_He:
        var logHeDenom = 0.666667 * Math.log(1.0 + 4.0*refAHe);
        for (var i = 0; i < numDeps; i++) {
            logPhxRefPGas[i] = interpol(logPhxRefTau64(), logPhxRefPGas64, tauRos[1][i]);
            //System.out.println("After tau interpolation: pGas " + logPhxRefPGas[i]);
            thisGexp = gexpTop + gexpRange * (tauRos[1][i] - tauRos[1][0]) / tauLogRange;
            //scaling with g 
            //System.out.println("thisGexp " + thisGexp);
            scalePGas[1][i] = thisGexp*logEg + logPhxRefPGas[i] - thisGexp*phx5kRefLogEg;
            //System.out.println("After scaling with g: pGas " + scalePGas[1][i]);
            //scaling with zscl:
            //System.out.println("logZScale " + logZScale);
            scalePGas[1][i] = -0.333333*logZScale + scalePGas[1][i];
            //System.out.println("After scaling with z: pGas " + scalePGas[1][i]);
            //scaling with A_He:
            //System.out.println("Math.log(1.0 + 4.0*AHe) - logHeDenom " + (0.666667*Math.log(1.0 + 4.0*AHe) - logHeDenom));
            scalePGas[1][i] = 0.666667 * Math.log(1.0 + 4.0*AHe) + scalePGas[1][i] - logHeDenom;
            //System.out.println("After scaling with AHe: pGas " + scalePGas[1][i]);
            scalePGas[0][i] = Math.exp(scalePGas[1][i]);
            //System.out.println("scalePGas[1][i] " + logE * scalePGas[1][i]);
        }

       //Carefull here - P at upper boundary can be an underestimate, but it must not be greater than value at next depth in!
       if (scalePGas[0][0] >= scalePGas[0][1]){
           scalePGas[0][0] = 0.5 * scalePGas[0][1];
           scalePGas[1][0] = Math.log(scalePGas[0][0]);
       }

        return scalePGas;

    };

    var phx5kRefPe = function(teff, grav, numDeps, tauRos, zScale, logAHe) {

        var logE = Math.log10(Math.E);
        var logEg = Math.log(grav); //base e!
        var AHe = Math.exp(logAHe);
        var refAHe = Math.exp(phx5kRefLogAHe);
        var logZScale = Math.log(zScale);

        //Theoretical radiative/convective model from Phoenix V15:
        var phx5kRefPe64 = [
            1.17858427569630401e-08, 1.73073837795169436e-03, 2.13762360059438538e-03,
            2.64586145846806451e-03, 3.26749020460433354e-03, 4.02219945676032288e-03,
            4.93454747856481805e-03, 6.03357965110110344e-03, 7.35319802933484621e-03,
            8.93306098318919460e-03, 1.08200092390451780e-02, 1.30700158082515377e-02,
            1.57505131367194594e-02, 1.89428593874781982e-02, 2.27446519479000651e-02,
            2.72716961646799864e-02, 3.26596927620770305e-02, 3.90659173672675136e-02,
            4.66713907010225318e-02, 5.56843086932707065e-02, 6.63452384304821230e-02,
            7.89341909634427297e-02, 9.37792909747245523e-02, 1.11270186635302790e-01,
            1.31870014183696899e-01, 1.56130489360824298e-01, 1.84715397349025645e-01,
            2.18428766543559472e-01, 2.58245610307223983e-01, 3.05363622257444900e-01,
            3.61311333509324040e-01, 4.27990544717643029e-01, 5.07743853690445168e-01,
            6.03604039632526179e-01, 7.19674246257567152e-01, 8.61422066803848585e-01,
            1.03568172049434559e+00, 1.25187412720684454e+00, 1.52336996895144261e+00,
            1.87078029858400652e+00, 2.31893413667797388e+00, 2.90597658045488094e+00,
            3.68566481623166187e+00, 4.74110273402785865e+00, 6.16546324347510222e+00,
            8.08486709272609971e+00, 1.07959796585076546e+01, 1.46390000057528482e+01,
            2.17273927465764913e+01, 3.56194058574816239e+01, 6.57361652682183575e+01,
            1.48468954779851543e+02, 2.80489497081349555e+02, 4.46587250419467807e+02,
            6.46784311972032128e+02, 8.86744838282462069e+02, 1.17244960918767083e+03,
            1.51089748714632174e+03, 1.91050957850908458e+03, 2.38115682377229541e+03,
            2.93426662234414562e+03, 3.58305801646245618e+03, 4.34379670059742239e+03,
            5.22642525609140284e+03
        ];

        var numPhxDeps = phx5kRefPe64.length;  //yeah, I know, 64, but that could change!
        var logPhxRefPe64 = []; 
        logPhxRefPe64.length = numPhxDeps;
        for (var i = 0; i < phx5kRefPe64.length; i++) {
            logPhxRefPe64[i] = Math.log(phx5kRefPe64[i]);
        }

        // interpolate onto gS3 tauRos grid and re-scale with Teff:
        var phx5kRefPe = []; 
        phx5kRefPe.length = numDeps;
        var logPhxRefPe = []; 
        logPhxRefPe.length = numDeps;
        var scalePe = [];
        scalePe.length = 2;
        scalePe[0] = [];
        scalePe[1] = [];
        scalePe[0].length = numDeps;
        scalePe[1].length = numDeps;
//exponents in scaling with Teff ONLY VALID FOR Teff < 10000K:
        var omegaTaum1 = 0.0012; //log_10(tau) < 0.1
        var omegaTaup1 = 0.0015; //log_10(tau) > 1.0
        var omegaRange = (omegaTaup1-omegaTaum1);
        var lonOfM1 = Math.log(0.1);
//exponents in scaling with g:
        var gexpTop = 0.48; //top of model
        var gexpBottom = 0.33; //bottom of model
        var gexpRange = (gexpBottom - gexpTop);
        var tauLogRange =  tauRos[1][numDeps-1] -  tauRos[1][0]; 
        var thisGexp;
        var thisOmega = omegaTaum1; //default initialization
// factor for scaling with A_He:
        var logHeDenom = 0.333333 * Math.log(1.0 + 4.0*refAHe);

        for (var i = 0; i < numDeps; i++) {
            logPhxRefPe[i] = interpol(logPhxRefTau64(), logPhxRefPe64, tauRos[1][i]);
            thisGexp = gexpTop + gexpRange * (tauRos[1][i] - tauRos[1][0]) / tauLogRange;
            if (tauRos[0][i] < 0.1){
              thisOmega =  omegaTaum1;
            }
            if (tauRos[0][i] > 10.0){
              thisOmega =  omegaTaup1;
            }
            if ( (tauRos[0][i] >= 0.1) && (tauRos[0][i] <= 10.0) ){
                thisOmega = omegaTaum1 + omegaRange * (tauRos[1][i] - lonOfM1) / tauLogRange;
            }
            //System.out.println("thisGexp " + thisGexp + " thisOmega " + thisOmega);
            //scaling with g 
            scalePe[1][i] = thisGexp*logEg + logPhxRefPe[i] - thisGexp*phx5kRefLogEg;
            //System.out.println("After g scaling: pe " + logE*scalePe[1][i]);
            //scale with Teff:
            scalePe[1][i] = thisOmega*teff + scalePe[1][i] - thisOmega*phx5kRefTeff;
            //System.out.println("After Teff scaling: pe " + logE*scalePe[1][i]);
            //scaling with zscl:
            scalePe[1][i] = 0.333333*logZScale + scalePe[1][i];
            //System.out.println("After z scaling: pe " + logE*scalePe[1][i]);
            //scaling with A_He:
            scalePe[1][i] = 0.333333 * Math.log(1.0 + 4.0*AHe) + scalePe[1][i] - logHeDenom;
            //System.out.println("After A_He scaling: pe " + logE*scalePe[1][i]);
//
            scalePe[0][i] = Math.exp(scalePe[1][i]);
        }

        return scalePe;

    };

    var phx5kRefNe = function(numDeps, scaleTemp, scalePe) {

        var logE = logTen(Math.E);
        var scaleNe = [];
        scaleNe.length = 2;
        scaleNe[0] = [];
        scaleNe[1] = [];
        scaleNe[0].length = numDeps;
        scaleNe[1].length = numDeps;

        for (var i = 0; i < numDeps; i++){
            scaleNe[1][i] = scalePe[1][i] - scaleTemp[1][i] - logK;
            scaleNe[0][i] = Math.exp(scaleNe[1][i]);
        }

        return scaleNe;
    };

    var phx425g2RefTeff = 4250.0;
    var phx425g2RefLogEg = Math.log(10.0) * 4.5;  //base e!
//He abundance from  Grevesse Asplund et al 2010
    var phx425g2RefLogAHe = Math.log(10.0) * (10.93 - 12.0);  //base e "A_12" logarithmic abundance scale!

    //Corresponding Tau_12000 grid (ie. lambda_0 = 1200 nm):    
    var phx425g2RefTau64 = [
 0.00000000000000000e+00, 9.99999999999999955e-07, 1.34596032415536424e-06,
 1.81160919420041334e-06, 2.43835409826882661e-06, 3.28192787251147086e-06,
 4.41734470314007309e-06, 5.94557070854439435e-06, 8.00250227816105150e-06,
 1.07710505603676914e-05, 1.44974067037263169e-05, 1.95129342263596216e-05,
 2.62636352765333530e-05, 3.53498110503010939e-05, 4.75794431400941383e-05,
 6.40400427119728238e-05, 8.61953566475303262e-05, 1.16015530173997159e-04,
 1.56152300600049659e-04, 2.10174801133248699e-04, 2.82886943462596935e-04,
 3.80754602122237182e-04, 5.12480587696093125e-04, 6.89778537938765847e-04,
 9.28414544519474451e-04, 1.24960914129198684e-03, 1.68192432488086874e-03,
 2.26380340952144670e-03, 3.04698957090350801e-03, 4.10112707055130046e-03,
 5.51995432128156785e-03, 7.42963950759494875e-03, 1.00000000000000002e-02,
 1.34596032415536422e-02, 1.81160919420041318e-02, 2.43835409826882663e-02,
 3.28192787251147047e-02, 4.41734470314006436e-02, 5.94557070854439401e-02,
 8.00250227816105275e-02, 1.07710505603676912e-01, 1.44974067037263149e-01,
 1.95129342263596212e-01, 2.62636352765332981e-01, 3.53498110503010221e-01,
 4.75794431400941464e-01, 6.40400427119728333e-01, 8.61953566475303190e-01,
 1.16015530173997150e+00, 1.56152300600049654e+00, 2.10174801133248712e+00,
 2.82886943462596641e+00, 3.80754602122236818e+00, 5.12480587696092638e+00,
 6.89778537938765801e+00, 9.28414544519474383e+00, 1.24960914129198670e+01,
 1.68192432488086894e+01, 2.26380340952144650e+01, 3.04698957090350540e+01,
 4.10112707055129562e+01, 5.51995432128157333e+01, 7.42963950759495049e+01,
 1.00000000000000000e+02
    ];

    var logPhxRefTau64 = function() {

        var logE = logTen(Math.E);

        var numPhxDep = phx425g2RefTau64.length;
        var logPhxRefTau64 = []; 
        logPhxRefTau64.length = numPhxDep;
        for (var i = 1; i < numPhxDep; i++) {
            logPhxRefTau64[i] = Math.log(phx425g2RefTau64[i]);
        }
        logPhxRefTau64[0] = logPhxRefTau64[1] - (logPhxRefTau64[numPhxDep - 1] - logPhxRefTau64[1]) / numPhxDep;
        return logPhxRefTau64;
    };

    var phx425g2RefTemp = function(teff, numDeps, tauRos) {

        var logE = Math.log10(Math.E);

        //Theoretical radiative/convective model from Phoenix V15:
        var phx425g2RefTemp64 = [
 2.55177189467776134e+03, 2.55177189467776134e+03, 2.57792125655286191e+03,
 2.60758002435901381e+03, 2.64012742898025908e+03, 2.67432875475946230e+03,
 2.70893891273552163e+03, 2.74308870598832664e+03, 2.77632383320681129e+03,
 2.80848811483166946e+03, 2.83959882227651724e+03, 2.86975658734314266e+03,
 2.89908813206188461e+03, 2.92771359779851400e+03, 2.95573102630948051e+03,
 2.98321198037901013e+03, 3.01020749755630777e+03, 3.03675606855582828e+03,
 3.06288810300240721e+03, 3.08862982043339889e+03, 3.11400422160098924e+03,
 3.13903037085205142e+03, 3.16372090154785838e+03, 3.18810905092703479e+03,
 3.21223709737028685e+03, 3.23616013487906321e+03, 3.25997011697764810e+03,
 3.28379847029234497e+03, 3.30779792957306154e+03, 3.33215641253420881e+03,
 3.35718199939999613e+03, 3.38317056293436599e+03, 3.41035215459581877e+03,
 3.43904544965103469e+03, 3.46977882782005645e+03, 3.50316432370656776e+03,
 3.53952093749718961e+03, 3.57938756282554868e+03, 3.62358876591721355e+03,
 3.67390373594475159e+03, 3.73057002905895024e+03, 3.79526239264127798e+03,
 3.87014190881368677e+03, 3.96034605960104500e+03, 4.06785077337546363e+03,
 4.19530126018311603e+03, 4.35807101922509446e+03, 4.53128152603078979e+03,
 4.75647877892966608e+03, 4.99815140831592271e+03, 5.29640554819846147e+03,
 5.60111278999269234e+03, 6.01099379170666271e+03, 6.36043009619938857e+03,
 6.87521615935859882e+03, 7.26044412747461593e+03, 7.50448146936407466e+03,
 7.68547260686038317e+03, 7.83660366095023619e+03, 7.97031461253075395e+03,
 8.09288613904806061e+03, 8.20796577074222841e+03, 8.31800144917403668e+03,
 8.42235419676150195e+03
        ];

        // interpolate onto gS3 tauRos grid and re-scale with Teff:
        var phx425g2RefTemp = []; 
        phx425g2RefTemp.length = numDeps;
        var scaleTemp = [];
        scaleTemp.length = 2;
        scaleTemp[0] = [];
        scaleTemp[1] = [];
        scaleTemp[0].length = numDeps;
        scaleTemp[1].length = numDeps;
        for (var i = 0; i < numDeps; i++) {
            phx425g2RefTemp[i] = interpol(logPhxRefTau64(), phx425g2RefTemp64, tauRos[1][i]);
            scaleTemp[0][i] = teff * phx425g2RefTemp[i] / phx425g2RefTeff;
            scaleTemp[1][i] = Math.log(scaleTemp[0][i]);
            //System.out.println("tauRos[1][i] " + logE * tauRos[1][i] + " scaleTemp[1][i] " + logE * scaleTemp[1][i]);
        }

        return scaleTemp;

    };

    var phx425g2RefPGas = function(grav, zScale, logAHe, numDeps, tauRos) {

        //System.out.println("ScaleT4250g20.phx425g2RefPGas called");

        var logE = Math.log10(Math.E);
        var logEg = Math.log(grav); //base e!
        var AHe = Math.exp(logAHe);
        var refAHe = Math.exp(phx425g2RefLogAHe);
        var logZScale = Math.log(zScale);

        //Theoretical radiative/convective model from Phoenix V15:
        var phx425g2RefPGas64 = [
 1.00000000000000005e-04, 4.30797022881529035e+00, 5.23633209862413107e+00,
 6.35110679837766412e+00, 7.68415255320091806e+00, 9.26944725328996455e+00,
 1.11437944000671951e+01, 1.33486175933519231e+01, 1.59320732110696728e+01,
 1.89510405786159843e+01, 2.24729535630686001e+01, 2.65776121702747155e+01,
 3.13591521574494898e+01, 3.69283427891380711e+01, 4.34153596323810476e+01,
 5.09731596421035889e+01, 5.97815115471393099e+01, 7.00515965533140843e+01,
 8.20320988196306047e+01, 9.60157114466986172e+01, 1.12346894715709283e+02,
 1.31431137235228107e+02, 1.53746059612369663e+02, 1.79853925611152988e+02,
 2.10416068512255976e+02, 2.46209759085281831e+02, 2.88146638387011080e+02,
 3.37292455489998588e+02, 3.94889455574428723e+02, 4.62381218232488322e+02,
 5.41431239027500510e+02, 6.33944346680425951e+02, 7.42101436711750239e+02,
 8.68388258638872003e+02, 1.01559408923251908e+03, 1.18679360231291594e+03,
 1.38539626183849145e+03, 1.61516883770226173e+03, 1.88020120421177171e+03,
 2.18463232976707104e+03, 2.53293658371589027e+03, 2.93000255565556563e+03,
 3.38117288723951515e+03, 3.89194415900473678e+03, 4.46986439959823201e+03,
 5.12776215162745939e+03, 5.88482548647403291e+03, 6.77685699601984379e+03,
 7.85508152689431518e+03, 9.16793034379196797e+03, 1.06499829584269464e+04,
 1.20573723930509423e+04, 1.31104385587741126e+04, 1.38632723386838443e+04,
 1.43359336214159030e+04, 1.46332769212074945e+04, 1.48729928730357842e+04,
 1.50999078995603995e+04, 1.53309455833121519e+04, 1.55753421735992888e+04,
 1.58400487938745937e+04, 1.61313349003330495e+04, 1.64553234176194455e+04,
 1.68190844909027946e+04 
       ];

        var numPhxDeps = phx425g2RefPGas64.length;  //yeah, I know, 64, but that could change!
        var logPhxRefPGas64 = []; 
        logPhxRefPGas64.length = numPhxDeps;
        for (var i = 0; i < numPhxDeps; i++) {
            logPhxRefPGas64[i] = Math.log(phx425g2RefPGas64[i]);
        }

        // interpolate onto gS3 tauRos grid and re-scale with grav, metallicity and He abundance
        // From Gray 3rd Ed. Ch.9, esp p. 189, 196:
        var phx425g2RefPGas = []; 
        phx425g2RefPGas.length = numDeps;
        var logPhxRefPGas = []; 
        logPhxRefPGas.length = numDeps;
        var scalePGas = [];
        scalePGas.length = 2;
        scalePGas[0] = [];
        scalePGas[1] = [];
        scalePGas[0].length = numDeps;
        scalePGas[1].length = numDeps;
//exponents in scaling with g:
        var gexpTop = 0.54; //top of model
        var gexpBottom = 0.64; //bottom of model
        var gexpRange = (gexpBottom - gexpTop);
        var tauLogRange =  tauRos[1][numDeps-1] -  tauRos[1][0]; 
        var thisGexp;
// factor for scaling with A_He:
        var logHeDenom = 0.666667 * Math.log(1.0 + 4.0*refAHe);
        for (var i = 0; i < numDeps; i++) {
            logPhxRefPGas[i] = interpol(logPhxRefTau64(), logPhxRefPGas64, tauRos[1][i]);
            //System.out.println("After tau interpolation: pGas " + logPhxRefPGas[i]);
            thisGexp = gexpTop + gexpRange * (tauRos[1][i] - tauRos[1][0]) / tauLogRange;
            //scaling with g 
            //System.out.println("thisGexp " + thisGexp);
            scalePGas[1][i] = thisGexp*logEg + logPhxRefPGas[i] - thisGexp*phx425g2RefLogEg;
            //System.out.println("After scaling with g: pGas " + scalePGas[1][i]);
            //scaling with zscl:
            //System.out.println("logZScale " + logZScale);
            scalePGas[1][i] = -0.333333*logZScale + scalePGas[1][i];
            //System.out.println("After scaling with z: pGas " + scalePGas[1][i]);
            //scaling with A_He:
            //System.out.println("Math.log(1.0 + 4.0*AHe) - logHeDenom " + (0.666667*Math.log(1.0 + 4.0*AHe) - logHeDenom));
            scalePGas[1][i] = 0.666667 * Math.log(1.0 + 4.0*AHe) + scalePGas[1][i] - logHeDenom;
            //System.out.println("After scaling with AHe: pGas " + scalePGas[1][i]);
            scalePGas[0][i] = Math.exp(scalePGas[1][i]);
            //System.out.println("scalePGas[1][i] " + logE * scalePGas[1][i]);
        }

       //Carefull here - P at upper boundary can be an underestimate, but it must not be greater than value at next depth in!
       if (scalePGas[0][0] >= scalePGas[0][1]){
           scalePGas[0][0] = 0.5 * scalePGas[0][1];
           scalePGas[1][i] = Math.log(scalePGas[0][0]);
       }

        return scalePGas;

    };

    var phx425g2RefPe = function(teff, grav, numDeps, tauRos, zScale, logAHe) {

        var logE = Math.log10(Math.E);
        var logEg = Math.log(grav); //base e!
        var AHe = Math.exp(logAHe);
        var refAHe = Math.exp(phx425g2RefLogAHe);
        var logZScale = Math.log(zScale);

        //Theoretical radiative/convective model from Phoenix V15:
        var phx425g2RefPe64 = [
 8.82107332460937786e-09, 2.78937385278448721e-05, 3.47576301038577686e-05,
 4.35832572659463317e-05, 5.49376619037973015e-05, 6.94409656870532439e-05,
 8.77707903792445917e-05, 1.10693651821575575e-04, 1.39104108185757799e-04,
 1.74066374927776200e-04, 2.16859921028963076e-04, 2.69028731246404777e-04,
 3.32432061837431244e-04, 4.09296056659801003e-04, 5.02267654306449442e-04,
 6.14473664793957226e-04, 7.49597452349998888e-04, 9.11974871131562793e-04,
 1.10671154087655646e-03, 1.33981929191927902e-03, 1.61837137445693482e-03,
 1.95067571498008536e-03, 2.34645801822358068e-03, 2.81730972458459810e-03,
 3.37701527100230971e-03, 4.04206883240371042e-03, 4.83264944868273382e-03,
 5.77375902899801303e-03, 6.89635454260574543e-03, 8.23939377538898503e-03,
 9.85478499694628605e-03, 1.18084450314643753e-02, 1.41821928408006545e-02,
 1.70844502273588689e-02, 2.06675266544882504e-02, 2.51401461738746321e-02,
 3.07601652353682656e-02, 3.78883555684116358e-02, 4.70434551509077148e-02,
 5.90737609051253110e-02, 7.49278881219457016e-02, 9.61506501246208595e-02,
 1.25001054449255633e-01, 1.65469764331727026e-01, 2.21877141054763416e-01,
 2.99471993844184214e-01, 4.09463450124863737e-01, 5.44807309494293679e-01,
 7.32622090968494066e-01, 1.00147011151172505e+00, 1.61234892801148755e+00,
 3.05928587566573817e+00, 7.65951702544590596e+00, 1.63896549667325182e+01,
 4.47471354140328827e+01, 8.76262151753557248e+01, 1.30080006341931238e+02,
 1.72013432855285373e+02, 2.15462867458483203e+02, 2.61494582627386649e+02,
 3.10959654478989705e+02, 3.64658419590852475e+02, 4.23480004219150715e+02,
 4.87036243289867400e+02
        ];

        var numPhxDeps = phx425g2RefPe64.length;  //yeah, I know, 64, but that could change!
        var logPhxRefPe64 = []; 
        logPhxRefPe64.length = numPhxDeps;
        for (var i = 0; i < phx425g2RefPe64.length; i++) {
            logPhxRefPe64[i] = Math.log(phx425g2RefPe64[i]);
        }

        // interpolate onto gS3 tauRos grid and re-scale with Teff:
        var phx425g2RefPe = []; 
        phx425g2RefPe.length = numDeps;
        var logPhxRefPe = []; 
        logPhxRefPe.length = numDeps;
        var scalePe = [];
        scalePe.length = 2;
        scalePe[0] = [];
        scalePe[1] = [];
        scalePe[0].length = numDeps;
        scalePe[1].length = numDeps;
//exponents in scaling with Teff ONLY VALID FOR Teff < 10000K:
        var omegaTaum1 = 0.0012; //log_10(tau) < 0.1
        var omegaTaup1 = 0.0015; //log_10(tau) > 1.0
        var omegaRange = (omegaTaup1-omegaTaum1);
        var lonOfM1 = Math.log(0.1);
//exponents in scaling with g:
        var gexpTop = 0.48; //top of model
        var gexpBottom = 0.33; //bottom of model
        var gexpRange = (gexpBottom - gexpTop);
        var tauLogRange =  tauRos[1][numDeps-1] -  tauRos[1][0]; 
        var thisGexp;
        var thisOmega = omegaTaum1; //default initialization
// factor for scaling with A_He:
        var logHeDenom = 0.333333 * Math.log(1.0 + 4.0*refAHe);

        for (var i = 0; i < numDeps; i++) {
            logPhxRefPe[i] = interpol(logPhxRefTau64(), logPhxRefPe64, tauRos[1][i]);
            thisGexp = gexpTop + gexpRange * (tauRos[1][i] - tauRos[1][0]) / tauLogRange;
            if (tauRos[0][i] < 0.1){
              thisOmega =  omegaTaum1;
            }
            if (tauRos[0][i] > 10.0){
              thisOmega =  omegaTaup1;
            }
            if ( (tauRos[0][i] >= 0.1) && (tauRos[0][i] <= 10.0) ){
                thisOmega = omegaTaum1 + omegaRange * (tauRos[1][i] - lonOfM1) / tauLogRange;
            }
            //System.out.println("thisGexp " + thisGexp + " thisOmega " + thisOmega);
            //scaling with g 
            scalePe[1][i] = thisGexp*logEg + logPhxRefPe[i] - thisGexp*phx425g2RefLogEg;
            //System.out.println("After g scaling: pe " + logE*scalePe[1][i]);
            //scale with Teff:
            scalePe[1][i] = thisOmega*teff + scalePe[1][i] - thisOmega*phx425g2RefTeff;
            //System.out.println("After Teff scaling: pe " + logE*scalePe[1][i]);
            //scaling with zscl:
            scalePe[1][i] = 0.333333*logZScale + scalePe[1][i];
            //System.out.println("After z scaling: pe " + logE*scalePe[1][i]);
            //scaling with A_He:
            scalePe[1][i] = 0.333333 * Math.log(1.0 + 4.0*AHe) + scalePe[1][i] - logHeDenom;
            //System.out.println("After A_He scaling: pe " + logE*scalePe[1][i]);
//
            scalePe[0][i] = Math.exp(scalePe[1][i]);
        }

        return scalePe;

    };

    var phx425g2RefNe = function(numDeps, scaleTemp, scalePe) {

        var logE = logTen(Math.E);
        var scaleNe = [];
        scaleNe.length = 2;
        scaleNe[0] = [];
        scaleNe[1] = [];
        scaleNe[0].length = numDeps;
        scaleNe[1].length = numDeps;

        for (var i = 0; i < numDeps; i++){
            scaleNe[1][i] = scalePe[1][i] - scaleTemp[1][i] - logK;
            scaleNe[0][i] = Math.exp(scaleNe[1][i]);
        }

        return scaleNe;
    };

    var phx10kRefTeff = 10000.0;
    var phx10kRefLogEg = Math.log(10.0) * 4.0;  //base e!
//He abundance from  Grevesse Asplund et al 2010
    var phx10kRefLogAHe = Math.log(10.0) * (10.93 - 12.0);  //base e "A_12" logarithmic abundance scale!
    

    //Corresponding Tau_12000 grid (ie. lambda_0 = 1200 nm):    
    var phx10kRefTau64 = [
 0.00000000000000000E+00, 9.99999999999999955E-07, 1.34596032415536424E-06,
 1.81160919420041334E-06, 2.43835409826882661E-06, 3.28192787251147086E-06,
 4.41734470314007309E-06, 5.94557070854439435E-06, 8.00250227816105150E-06,
 1.07710505603676914E-05, 1.44974067037263169E-05, 1.95129342263596216E-05,
 2.62636352765333530E-05, 3.53498110503010939E-05, 4.75794431400941383E-05,
 6.40400427119728238E-05, 8.61953566475303262E-05, 1.16015530173997159E-04,
 1.56152300600049659E-04, 2.10174801133248699E-04, 2.82886943462596935E-04,
 3.80754602122237182E-04, 5.12480587696093125E-04, 6.89778537938765847E-04,
 9.28414544519474451E-04, 1.24960914129198684E-03, 1.68192432488086874E-03,
 2.26380340952144670E-03, 3.04698957090350801E-03, 4.10112707055130046E-03,
 5.51995432128156785E-03, 7.42963950759494875E-03, 1.00000000000000002E-02,
 1.34596032415536422E-02, 1.81160919420041318E-02, 2.43835409826882663E-02,
 3.28192787251147047E-02, 4.41734470314006436E-02, 5.94557070854439401E-02,
 8.00250227816105275E-02, 1.07710505603676912E-01, 1.44974067037263149E-01,
 1.95129342263596212E-01, 2.62636352765332981E-01, 3.53498110503010221E-01,
 4.75794431400941464E-01, 6.40400427119728333E-01, 8.61953566475303190E-01,
 1.16015530173997150E+00, 1.56152300600049654E+00, 2.10174801133248712E+00,
 2.82886943462596641E+00, 3.80754602122236818E+00, 5.12480587696092638E+00,
 6.89778537938765801E+00, 9.28414544519474383E+00, 1.24960914129198670E+01,
 1.68192432488086894E+01, 2.26380340952144650E+01, 3.04698957090350540E+01,
 4.10112707055129562E+01, 5.51995432128157333E+01, 7.42963950759495049E+01,
 1.00000000000000000E+02
    ];


   var phx10kRefTemp = function(teff, numDeps, tauRos) {

        var logE = logTen(Math.E);

        //Theoretical radiative/convective model from Phoenix V15:
        var phx10kRefTemp64 = [
 6.07574016685149309E+03, 6.07574016685149309E+03, 6.13264671606194861E+03,
 6.20030362747541585E+03, 6.27534705504544127E+03, 6.35396254937768026E+03,
 6.43299900128272293E+03, 6.51018808525609893E+03, 6.58411555606889124E+03,
 6.65406717610081068E+03, 6.71983498258185136E+03, 6.78154367852633823E+03,
 6.83954193198123903E+03, 6.89437231818902364E+03, 6.94676889243451842E+03,
 6.99759489202792247E+03, 7.04769490055547158E+03, 7.09773520027041195E+03,
 7.14812062339764907E+03, 7.19901426577775601E+03, 7.25041827414427917E+03,
 7.30225171801659872E+03, 7.35440093819652611E+03, 7.40675066225539558E+03,
 7.45920456139609178E+03, 7.51166464185182758E+03, 7.56404228766520191E+03,
 7.61627005664532771E+03, 7.66833575187113820E+03, 7.72034173334201841E+03,
 7.77258785750414881E+03, 7.82555139374063583E+03, 7.87986936059489017E+03,
 7.93639246968124371E+03, 7.99620846303960116E+03, 8.06052820253916161E+03,
 8.13047124123426238E+03, 8.20741189262034641E+03, 8.29307358429898159E+03,
 8.38980788216330802E+03, 8.49906053657168923E+03, 8.62314483632361771E+03,
 8.76456384216990409E+03, 8.92693370905029224E+03, 9.11177170396923248E+03,
 9.32167977041711492E+03, 9.56236981551314602E+03, 9.82432656703466455E+03,
 1.01311427939962559E+04, 1.04299661074183350E+04, 1.08355089220389909E+04,
 1.12094886773674716E+04, 1.16360710406256258E+04, 1.20991237739366334E+04,
 1.25891111265208237E+04, 1.31070008299570563E+04, 1.36522498965801387E+04,
 1.42233473670298790E+04, 1.48188302103200131E+04, 1.54423659243804523E+04,
 1.60892587452310745E+04, 1.67828517694842230E+04, 1.74930217234773954E+04,
 1.82922661949382236E+04
        ];

        // interpolate onto gS3 tauRos grid and re-scale with Teff:
        var phx10kRefTemp = []; 
        phx10kRefTemp.length = numDeps;
        var scaleTemp = [];
        scaleTemp.length = 2;
        scaleTemp[0] = [];
        scaleTemp[1] = [];
        scaleTemp[0].length = numDeps;
        scaleTemp[1].length = numDeps;
        for (var i = 0; i < numDeps; i++) {
            phx10kRefTemp[i] = interpol(logPhxRefTau64(), phx10kRefTemp64, tauRos[1][i]);
            scaleTemp[0][i] = teff * phx10kRefTemp[i] / phx10kRefTeff;
            scaleTemp[1][i] = Math.log(scaleTemp[0][i]);
            //System.out.println("tauRos[1][i] " + logE * tauRos[1][i] + " scaleTemp[1][i] " + logE * scaleTemp[1][i]);
        }

        return scaleTemp;

    };

    var phx10kRefPGas = function(grav, zScale, logAHe, numDeps, tauRos) {

        var logE = logTen(Math.E);
        var logEg = Math.log(grav); //base e!
        var AHe = Math.exp(logAHe);
        var refAHe = Math.exp(phx10kRefLogAHe);
        var logZScale = Math.log(zScale);

        //Theoretical radiative/convective model from Phoenix V15:
        var phx10kRefPGas64 = [
 1.00000000000000005E-04, 8.32127743125684882E-02, 1.29584527404206007E-01,
 1.94435381478779895E-01, 2.81524759872055830E-01, 3.94850766488002047E-01,
 5.39098197994885120E-01, 7.20109114447812781E-01, 9.45331395103965466E-01,
 1.22424260721948497E+00, 1.56877812718506826E+00, 1.99379948180689048E+00,
 2.51761637911653136E+00, 3.16251087800302599E+00, 3.95513966878889667E+00,
 4.92671520309637767E+00, 6.11303768406991388E+00, 7.55464145673977505E+00,
 9.29736005428628154E+00, 1.13934670418806956E+01, 1.39033471883101818E+01,
 1.68975909460311797E+01, 2.04594801623940121E+01, 2.46878880919212804E+01,
 2.97005964646718432E+01, 3.56383534114781142E+01, 4.26698208468708984E+01,
 5.09974403334007107E+01, 6.08640463074419387E+01, 7.25594340179816726E+01,
 8.64248329112294158E+01, 1.02854593091977520E+02, 1.22294652156180661E+02,
 1.45234045163109670E+02, 1.72184927273123520E+02, 2.03652334583264832E+02,
 2.40105656346438934E+02, 2.81936164286554344E+02, 3.29393094590693863E+02,
 3.82482413201705356E+02, 4.40963324580460835E+02, 5.04333229685725428E+02,
 5.71827998329611432E+02, 6.42424030136117835E+02, 7.15115448265608620E+02,
 7.89188190751975185E+02, 8.64179477829598227E+02, 9.41037808653716070E+02,
 1.02093026109089942E+03, 1.10808816566702853E+03, 1.20591338801728261E+03,
 1.32157321934523725E+03, 1.46400967396971282E+03, 1.64395527893530380E+03,
 1.87431044562489683E+03, 2.16986659968736876E+03, 2.54753164223200429E+03,
 3.02667796755900645E+03, 3.62964225373483487E+03, 4.38288420138537458E+03,
 5.31730879832813844E+03, 6.47251190142057658E+03, 7.89413608165941059E+03,
 9.64747840003540659E+03
        ];

        var numPhxDeps = phx10kRefPGas64.length;  //yeah, I know, 64, but that could change!
        var logPhxRefPGas64 = []; 
        logPhxRefPGas64.length = numPhxDeps;
        for (var i = 0; i < phx10kRefPGas64.length; i++) {
            logPhxRefPGas64[i] = Math.log(phx10kRefPGas64[i]);
        }

        // interpolate onto gS3 tauRos grid and re-scale with Teff:
        var phx10kRefPGas = [];
        phx10kRefPGas.length = numDeps;
        var logPhxRefPGas = [];
        logPhxRefPGas.length = numDeps;
        var scalePGas = [];
        scalePGas.length = 2;
        scalePGas[0] = [];
        scalePGas[1] = [];
        scalePGas[0].length = numDeps;
        scalePGas[1].length = numDeps;
//exponents in scaling with g:
        var gexpTop = 0.53; //top of model
        var gexpBottom = 0.85; //bottom of model
        var gexpRange = (gexpBottom - gexpTop);
        var tauLogRange =  tauRos[1][numDeps-1] -  tauRos[1][0];
        var thisGexp;
// factor for scaling with A_He:
        var logHeDenom = 0.666667 * Math.log(1.0 + 4.0*refAHe);
        for (var i = 0; i < numDeps; i++) {
            logPhxRefPGas[i] = interpol(logPhxRefTau64(), logPhxRefPGas64, tauRos[1][i]);
            thisGexp = gexpTop + gexpRange * (tauRos[1][i] - tauRos[1][0]) / tauLogRange;
            //scaling with g
            scalePGas[1][i] = thisGexp*logEg + logPhxRefPGas[i] - thisGexp*phx10kRefLogEg;
            //scaling with zscl:
            scalePGas[1][i] = -0.5*logZScale + scalePGas[1][i];
            //scaling with A_He:
            scalePGas[1][i] = 0.666667 * Math.log(1.0 + 4.0*AHe) + scalePGas[1][i] - logHeDenom; 
            scalePGas[0][i] = Math.exp(scalePGas[1][i]);
            //System.out.println("scalePGas[1][i] " + logE * scalePGas[1][i]);
        }

       //Carefull here - P at upper boundary can be an underestimate, but it must not be greater than value at next depth in!
       if (scalePGas[0][0] >= scalePGas[0][1]){
           scalePGas[0][0] = 0.5 * scalePGas[0][1];
           scalePGas[1][i] = Math.log(scalePGas[0][0]);
       }

        return scalePGas;

    };

    var phx10kRefPe = function(teff, grav, numDeps, tauRos, zScale, logAHe) {

        var logE = logTen(Math.E);
        var logEg = Math.log(grav); //base e!
        var AHe = Math.exp(logAHe);
        var refAHe = Math.exp(phx10kRefLogAHe);
        var logZScale = Math.log(zScale);

        //Theoretical radiative/convective model from Phoenix V15:
        var phx10kRefPe64 = [
 4.77258390479251340E-05, 1.54333794509103339E-02, 2.24384775218179552E-02,
 3.24056217848841463E-02, 4.62639509784656192E-02, 6.49897301016105072E-02,
 8.96001972148401798E-02, 1.21161157265374353E-01, 1.60825358340301261E-01,
 2.09891146620685975E-01, 2.69867426146356171E-01, 3.42538888354808724E-01,
 4.30045384007358256E-01, 5.35006986797593842E-01, 6.60704782988379868E-01,
 8.11262305821688567E-01, 9.91741961224463009E-01, 1.20813527252446407E+00,
 1.46731521914247520E+00, 1.77705126262480850E+00, 2.14614122290851617E+00,
 2.58462667298359561E+00, 3.10405210627260297E+00, 3.71777653138435804E+00,
 4.44135288803457673E+00, 5.29279499891786465E+00, 6.29303772366266312E+00,
 7.46652989782078702E+00, 8.84221515332682451E+00, 1.04552216626003140E+01,
 1.23496848557054300E+01, 1.45813048229500843E+01, 1.72206436663779385E+01,
 2.03589457441922157E+01, 2.41156208954111868E+01, 2.86442876094033458E+01,
 3.41355927487861948E+01, 4.08398462152914732E+01, 4.90908766488638761E+01,
 5.93486059459067832E+01, 7.21405304518226842E+01, 8.81824952094146681E+01,
 1.08367129768339950E+02, 1.33856171619767082E+02, 1.65693080738235807E+02,
 2.04943252558813072E+02, 2.52705001145053956E+02, 3.07224623951268654E+02,
 3.70334137141753217E+02, 4.33722318385145741E+02, 5.08910395587106336E+02,
 5.82220694357564639E+02, 6.65278728107771599E+02, 7.62124991657425880E+02,
 8.79654481582760809E+02, 1.02622262715821921E+03, 1.21099204341081804E+03,
 1.44432886438589208E+03, 1.73838904022049860E+03, 2.10808802008476914E+03,
 2.57102379769462232E+03, 3.14976025581092108E+03, 3.86645770963505538E+03,
 4.75493678618616923E+03
        ];

        var numPhxDeps = phx10kRefPe64.length;  //yeah, I know, 64, but that could change!
        var logPhxRefPe64 = []; 
        logPhxRefPe64.length = numPhxDeps;
        for (var i = 0; i < phx10kRefPe64.length; i++) {
            logPhxRefPe64[i] = Math.log(phx10kRefPe64[i]);
        }

        // interpolate onto gS3 tauRos grid and re-scale with Teff:
        var phx10kRefPe = []; 
        phx10kRefPe.length = numDeps;
        var logPhxRefPe = []; 
        logPhxRefPe.length = numDeps;
        var scalePe = [];
        scalePe.length = 2;
        scalePe[0] = [];
        scalePe[1] = [];
        scalePe[0].length = numDeps;
        scalePe[1].length = numDeps;
//exponents in scaling with Teff ONLY VALID FOR Teff < 10000K:
        var omegaTaum1 = 0.0012; //log_10(tau) < 0.1
        var omegaTaup1 = 0.0015; //log_10(tau) > 1.0
        var omegaRange = (omegaTaup1-omegaTaum1);
        var lonOfM1 = Math.log(0.1);
//exponents in scaling with g:
        var gexpTop = 0.53; //top of model
        var gexpBottom = 0.82; //bottom of model
        var gexpRange = (gexpBottom - gexpTop);
        var tauLogRange =  tauRos[1][numDeps-1] -  tauRos[1][0];
        var thisGexp;
        var thisOmega = omegaTaum1; //default initialization
// factor for scaling with A_He:
        var logHeDenom = 0.333333 * Math.log(1.0 + 4.0*refAHe);
        for (var i = 0; i < numDeps; i++) {
            logPhxRefPe[i] = interpol(logPhxRefTau64(), logPhxRefPe64, tauRos[1][i]);
            thisGexp = gexpTop + gexpRange * (tauRos[1][i] - tauRos[1][0]) / tauLogRange;
            //scaling with g
            scalePe[1][i] = thisGexp*logEg + logPhxRefPe[i] - thisGexp*phx10kRefLogEg;
            //scale with Teff:
            if (teff < 10000.0){
               if (tauRos[0][i] < 0.1){
                 thisOmega =  omegaTaum1;
               }
               if (tauRos[0][i] > 10.0){
                 thisOmega =  omegaTaup1;
               }
               if ( (tauRos[0][i] >= 0.1) && (tauRos[0][i] <= 10.0) ){
                   thisOmega = omegaTaum1 + omegaRange * (tauRos[1][i] - lonOfM1) / tauLogRange;
               }
               scalePe[1][i] = thisOmega*teff + scalePe[1][i] - thisOmega*phx10kRefTeff;
            }
            //scaling with zscl:
            scalePe[1][i] = 0.5*logZScale + scalePe[1][i];
            //scaling with A_He:
            scalePe[1][i] = 0.333333 * Math.log(1.0 + 4.0*AHe) + scalePe[1][i] - logHeDenom;
            scalePe[1][i] = logEg + logPhxRefPe[i] - phx10kRefLogEg;
            scalePe[0][i] = Math.exp(scalePe[1][i]);
            //System.out.println("scaleNe[1][i] " + logE * scaleNe[1][i]);
        }

        return scalePe;

    };

    var phx10kRefNe = function(numDeps, scaleTemp,  scalePe) {

        var logE = logTen(Math.E);
        var scaleNe = [];
        scaleNe.length = 2;
        scaleNe[0] = [];
        scaleNe[1] = [];
        scaleNe[0].length = numDeps;
        scaleNe[1].length = numDeps;
        for (var i = 0; i < numDeps; i++){
            scaleNe[1][i] = scalePe[1][i] - scaleTemp[1][i] - logK;
            scaleNe[0][i] = Math.exp(scaleNe[1][i]);
        }

        return scaleNe;
    };


   var getNz = function(numDeps, temp, pGas, pe, 
                            ATot, nelemAbnd, logAz){

   var logNz = [];
   logNz.length = nelemAbnd;
   for (var i = 0; i < nelemAbnd; i++){
      logNz[i] = [];
      logNz[i].length = numDeps;
   }
   
   var logATot = Math.log(ATot);

   var help, logHelp, logNumerator;

   for (var i = 0 ; i < numDeps; i++){

 // Initial safety check to avoid negative logNz as Pg and Pe each converge:
 // maximum physical Pe is about 0.5*PGas (complete ionization of pure H): 
      if (pe[0][i] > 0.5 * pGas[0][i]){
          pe[0][i] = 0.5 * pGas[0][i];
          pe[1][i] = Math.log(pe[0][i]);
      }
 // H (Z=1) is a special case: N_H(tau) = (Pg(tau)-Pe(tau))/{kTk(tau)A_Tot}
      logHelp = pe[1][i] - pGas[1][i];
      help = 1.0 - Math.exp(logHelp);
      logHelp = Math.log(help);
      logNumerator = pGas[1][i] + logHelp; 
      logNz[0][i] = logNumerator - logK - temp[1][i] - logATot;

// Remaining elements:
      for (var j = 0; j < nelemAbnd; j++){
         // N_z = A_z * N_H:
         logNz[j][i] = logAz[j] + logNz[0][i];
      } 
 
    } 

   return logNz; 

  };

   var massDensity2 = function(numDeps, nelemAbnd, logNz, cname){
   
     var rho = [];
     rho.length = 2;
     rho[0] = [];
     rho[1] = [];
     rho[0].length = numDeps;
     rho[1].length = numDeps;

     var logAddend, addend;
     var lAmu = logAmu;

//Prepare log atomic masses once for each element:
//atomic and ionic species
     var logAMass = [];
     logAMass.length = nelemAbnd;
     for (var j = 0; j < nelemAbnd; j++){
       logAMass[j] = Math.log(getMass(cname[j]));
       //System.out.println("j " + j + " logAMass " + logAMass[j]);
     }

//
     for (var i = 0; i < numDeps; i++){

       rho[0][i] = 0.0;
//atomic and ionic species:
       for (var j = 0; j < nelemAbnd; j++){
          logAddend = logNz[j][i] + lAmu + logAMass[j];
          rho[0][i] = rho[0][i] + Math.exp(logAddend); 
          rho[1][i] = Math.log(rho[0][i]);
       }

     } //numDeps loop, i
      return rho;  
      
   };
 
    
// This approach is based on integrating the formal solution of the hydrostaitc equilibrium equation
// on the otical depth (Tau) scale.  Advantage is that it makes better use of the itial guess at
// pgas    
//
//  Takes in *Gas* pressure, converts tot *total pressure*, then returns *Gas* pressure
//
    var hydroFormalSoln = function(numDeps, grav, tauRos, kappa, temp, guessPGas) {

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
   
        var press = [];
        press.length = 2;
        press[0] = [];
        press[1] = [];
        press[0].length = numDeps;
        press[1].length = numDeps;

        var radFac = Math.log(4.0) + logSigma - Math.log(3.0) - logC;

        var logEg = Math.log(grav); //Natural log g!! 
        // no needed if integrating in natural log?? //double logLogE = Math.log(Math.log10(Math.E));
        var log1p5 = Math.log(1.5);

//Compute radiation pressure for this temperature structure and add it to Pgas 
//
       var pT, pRad;
       var logPRad = []; 
       logPRad.length = numDeps;
       var logPTot = []; 
       logPTot.length = numDeps;
       for (var i = 0; i < numDeps; i++){
           logPRad[i] = radFac + 4.0 * temp[1][i];
           pRad = Math.exp(logPRad[i]);
      //System.out.println("i " + i + " pRad " + pRad);
           pT = guessPGas[0][i] + pRad;
           logPTot[i] = Math.log(pT);
       }

  var help, logHelp, logPress;
  var term, logSum, integ, logInteg, lastInteg;
  var deltaLogT; 
  var sum = []; 
  sum.length = numDeps;

//Upper boundary - inherit from intiial guess:
//Carefull here - P at upper boundary can be an underestimate, but it must not be greater than value at next depth in!
//  press[1][0] = logPTot[0];
//  press[1][0] = guessPGas[1][0];
//   press[1][0] = Math.log(1.0e-4); //try same upper boundary as Phoenix
//
//   press[0][0] = Math.exp(press[1][0]);
     //Dangerous - cumulative! press[0][0] = 0.1 * guessPGas[0][0];
     press[0][0] = guessPGas[0][0];
     press[1][0] = Math.log(press[0][0]);

//Corresponding value of basic integrated quantity at top of atmosphere:
  logSum = 1.5 * press[1][0] + Math.log(0.666667) - logEg;
  sum[0] = Math.exp(logSum); 
  
// Integrate inward on logTau scale

// CAUTION; This is not an integral for Delta P, but for P once integral at each tau is exponentiated by 2/3!
// Accumulate basic integral to be exponentiated, then construct pressure values later:

//Jump start integration with an Euler step:
    deltaLogT = tauRos[1][1] - tauRos[1][0];
// log of integrand
    logInteg = tauRos[1][1] + 0.5*logPTot[1] - kappa[1][1];
    lastInteg = Math.exp(logInteg);  
    sum[1] = sum[0] + lastInteg * deltaLogT; 

// Continue with extended trapezoid rule:
   
    for (var i = 2; i < numDeps; i++){

      deltaLogT = tauRos[1][i] - tauRos[1][i-1];
      logInteg = tauRos[1][i] + 0.5*logPTot[i] - kappa[1][i];
      integ = Math.exp(logInteg);
      term = 0.5 * (integ + lastInteg) * deltaLogT;
      sum[i] = sum[i-1] + term; //accumulate basic integrated quantity
      lastInteg = integ;  

    } 

    for (var i = 1; i < numDeps; i++){
//Evaluate total pressures from basic integrated quantity at edach depth 
// our integration variable is the natural log, so I don't think we need the 1/log(e) factor
       logPress = 0.666667 * (log1p5 + logEg + Math.log(sum[i]));
//Subtract radiation pressure:
       logHelp = logPRad[i] - logPress;
       help = Math.exp(logHelp);
// FOr hot and low g stars: limit Prad to 50% Ptot so we doen't get netaive Pgas and rho values:
       if (help > 0.5){
          help = 0.5;
       }
       press[1][i] = logPress + Math.log(1.0 - help);
       press[0][i] = Math.exp(press[1][i]);
    }

     return press;   //*Gas* pressure

 }; //end method hydroFormalSoln()
 

// Compute radiation pressure
    var radPress = function(numDeps, temp) {

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

        var pRad = [];
        pRad.length = 2;
        pRad[0] = [];
        pRad[1] = [];
        pRad[0].length = numDeps;
        pRad[1].length = numDeps;

        var logC = logC;
        var logSigma = logSigma;
        var radFac = Math.log(4.0) + logSigma - Math.log(3.0) - logC;
       for (var i = 0; i < numDeps; i++){
           pRad[1][i] = radFac + 4.0 * temp[1][i];
           pRad[0][i] = Math.exp( pRad[1][i]);
      } 

      return pRad;

    }; //end method radPress


var mgTCorr = function(numDeps, teff, tauRos, temp, rho, kappa) {


    // updated temperature structure

    var ntRow0 = [];
    var ntRow1 = [];
    ntRow0.length = numDeps;
    ntRow1.length = numDeps;
    var newTemp = [
        ntRow0,
        ntRow1
    ];
    //Teff boundary between early and late-type stars:
    var isCool = 6500.0;
    //Set up multi-gray opacity:
    // lambda break-points and gray levels:
    // No. multi-gray bins = num lambda breakpoints +1
    //double[] grayLams = {30.0, 1.0e6};  //nm //test
    //double[] grayLevel = {1.0};  //test
    // ***  Late type stars, Teff < 9500 K (???):
    //

    var minLambda = 30.0; //nm
    var maxLambda = 1.0e6; //nm
    var maxNumBins = 11;
    var grayLams = [];
    grayLams.length = maxNumBins + 1;
    var grayLevel = [];
    grayLevel.length = maxNumBins;
    var epsilon = [];
    epsilon.length = maxNumBins;
    //initialize everything first:
    for (var iB = 0; iB < maxNumBins; iB++) {
        grayLams[iB] = maxLambda;
        grayLevel[iB] = 1.0;
        epsilon[iB] = 0.99;
    }
    grayLams[maxNumBins] = maxLambda; //Set final wavelength

    var grayLevelsEpsilons = grayLevEps(maxNumBins, minLambda, maxLambda, teff, isCool);
    //Find actual number of multi-gray bins:
    var numBins = 0; //initialization
    for (var i = 0; i < maxNumBins; i++) {
        if (grayLevelsEpsilons[0][i] < maxLambda) {
            numBins++;
        }
    }

    /*
     if (teff < isCool) {
     // physically based wavelength break-points and gray levels for Sun from Rutten Fig. 8.6
     // H I Balmer and Lyman jumps for lambda <=3640 A, H^- b-f opacity hump in visible & hole at 1.6 microns, increasing f-f beyond that
     var lamSet = [minLambda, 91.1, 158.5, 364.0, 794.3, 1600.0, 3.0e3, 1.0e4, 3.3e4, 1.0e5, 3.3e5, maxLambda];
     var levelSet = [1000.0, 100.0, 5.0, 1.0, 0.3, 1.0, 3.0, 10.0, 30.0, 100.0, 1000.0];
     //photon *thermal* destruction and creation probability (as opposed to scattering)
     //WARNING:  THese cannot be set exactly = 1.0 or a Math.log() will blow up!!
     var epsilonSet = [0.50, 0.50, 0.50, 0.50, 0.50, 0.9, 0.99, 0.99, 0.99, 0.99, 0.99];
     var numBins = levelSet.length;
     for (var iB = 0; iB < numBins; iB++) {
     grayLams[iB] = lamSet[iB] * 1.0e-7;
     grayLevel[iB] = levelSet[iB];
     epsilon[iB] = epsilonSet[iB];
     }
     grayLams[numBins] = lamSet[numBins] * 1.0e-7; //Get final wavelength
     } else {
     // *** Early type stars, Teff > 9500 K (???)
     // It's all about H I b-f (??) What about Thomson scattering (gray)?
     // Lyman, Balmer, Paschen, Brackett jumps
     //Do we need He I features?
     var lamSet = [minLambda, 91.1, 364.0, 820.4, 1458.0, maxLambda];
     var levelSet = [100.0, 10.0, 2.0, 1.0, 1.0]; //???
     var epsilonSet = [0.5, 0.6, 0.7, 0.8, 0.5];
     var numBins = levelSet.length;
     for (var iB = 0; iB < numBins; iB++) {
     grayLams[iB] = lamSet[iB] * 1.0e-7;
     grayLevel[iB] = levelSet[iB];
     epsilon[iB] = epsilonSet[iB];
     }
     grayLams[numBins] = lamSet[numBins] * 1.0e-7; //Get final wavelength
     }
     
     
     //Find out how many bins we really have:
     var numBins = 0; //initialize
     for (var iB = 0; iB < maxNumBins; iB++) {
     if (grayLams[iB] < maxLambda) {
     numBins++;
     }
     }
     */
    for (var iB = 0; iB < numBins; iB++) {
        grayLams[iB] = grayLevelsEpsilons[0][iB];
        grayLevel[iB] = grayLevelsEpsilons[1][iB];
        epsilon[iB] = grayLevelsEpsilons[2][iB];
    }

    grayLams[numBins] = grayLevelsEpsilons[0][numBins]; //Get final wavelength

    //console.log("numBins: " + numBins);
    //Set overall gray-level - how emissive and absorptive the gas is overall
    // a necessary "fudge" because our kappa values are arbitrary rather than "in situ"
    var graySet = 1.0;
    //double tcDamp = 0.5; // damp the temperature corrections, Delta T, by this *multiplicative* factor
    var tcDamp = 1.0; // no damping - Lambda iteration is slow rather than oscillatory

    var logE = logTen(Math.E); // for debug output

    //double[][] planckBol = MulGrayTCorr.planckBin(numDeps, temp, lamStart, lamStop);
    var planckBol = []; //just for reference - not really needed - ??
    var jayBol = []; //just for reference - not really needed - ??
    var dBdTBol = []; //just for reference - not really needed - ??
    var cool = []; // cooling term in Stromgren equation
    var heat = []; // heating term in Stromgren equation
    var corrDenom = []; //denominator in 1st order temp correction
    planckBol.length = numDeps;
    jayBol.length = numDeps;
    dBdTBol.length = numDeps;
    cool.length = numDeps;
    heat.length = numDeps;
    corrDenom.length = numDeps;
    //double[] accumB = new double[numDeps]; //accumulator

    //CAUTION: planckBin[2][]: Row 0 is bin-integrated B_lambda; row 1 is bin integrated dB/dT_lambda
    // updated temperature structure


    var planckBin = [];
    planckBin.length = 2;
    planckBin[0] = [];
    planckBin[1] = [];
    planckBin[0].length = numDeps;
    planckBin[1].length = numDeps;
    var jayBin = [];
    jayBin.length = numDeps;
    var dBdTBin = [];
    dBdTBin.length = numDeps;
    var logCool, logHeat, logCorrDenom, logCoolTherm, logCoolScat;
    // initialize accumulators & set overell gray kappa level:
    for (var iTau = 0; iTau < numDeps; iTau++) {

        planckBol[iTau] = 0.0; //just for reference - not really needed - ??
        jayBol[iTau] = 0.0; //just for reference - not really needed - ??
        dBdTBol[iTau] = 0.0; //just for reference - not really needed - ??
        cool[iTau] = 0.0;
        heat[iTau] = 0.0;
        corrDenom[iTau] = 0.0;
        kappa[1][iTau] = kappa[1][iTau] + Math.log(graySet);
        kappa[0][iTau] = Math.exp(kappa[1][iTau]);
    }

    for (var iB = 0; iB < numBins; iB++) {
        //System.out.println("iB: " + iB + " grayLams[iB] " + grayLams[iB]);
        planckBin = planckBinner(numDeps, temp, grayLams[iB], grayLams[iB + 1]);
        // We are lambda-operating on a wavelength integrated B_lambda for each multi-gray bin
        jayBin = jayBinner(numDeps, tauRos, temp, planckBin, grayLevel[iB]);
        //System.out.println("tauRos[1][iTau]   planckBin[0]   planckBin[1]   jayBin");
        for (var iTau = 0; iTau < numDeps; iTau++) {
            //System.out.format("%12.8f   %12.8f   %12.8f   %12.8f%n",
            //        logE * tauRos[1][iTau], logE * Math.log(planckBin[0][iTau]), logE * Math.log(planckBin[1][iTau]), logE * Math.log(jayBin[iTau]));
            //CAUTION: planckBin[2][]: Row 0 is bin-integrated B_lambda; row 1 is bin integrated dB/dT_lambda
            //Net LTE volume cooling rate deltaE = Integ_lam=0^infnty(4*pi*kappa*rho*B_lam)dlam - Integ_lam=0^infnty(4*pi*kappa*rho*J_lam)dlam
            // where Jlam = LambdaO[B_lam] - Rutten Eq. 7.32, 7.33 
            // CAUTION: the 4pi and rho factors cancel out when diving B-J term by dB/dT term 
            planckBol[iTau] = planckBol[iTau] + planckBin[0][iTau]; //just for reference - not really needed - ??
            //logCool = Math.log(grayLevel[iB]) + kappa[1][iTau] + Math.log(planckBin[0][iTau]);  //no scatering
            //cool[iTau] = cool[iTau] + Math.exp(logCool);   //no scattering
            logCoolTherm = Math.log(grayLevel[iB]) + Math.log(epsilon[iB]) + kappa[1][iTau] + Math.log(planckBin[0][iTau]);
            logCoolScat = Math.log(grayLevel[iB]) + Math.log((1.0 - epsilon[iB])) + kappa[1][iTau] + Math.log(jayBin[iTau]);
            cool[iTau] = cool[iTau] + Math.exp(logCoolTherm) + Math.exp(logCoolScat);
            jayBol[iTau] = jayBol[iTau] + jayBin[iTau]; //just for reference - not really needed - ??
            logHeat = Math.log(grayLevel[iB]) + kappa[1][iTau] + Math.log(jayBin[iTau]);
            heat[iTau] = heat[iTau] + Math.exp(logHeat);
            dBdTBol[iTau] = dBdTBol[iTau] + planckBin[1][iTau]; //just for reference - not really needed - ??
            logCorrDenom = Math.log(grayLevel[iB]) + kappa[1][iTau] + Math.log(planckBin[1][iTau]);
            corrDenom[iTau] = corrDenom[iTau] + Math.exp(logCorrDenom);
            //if (iTau === 10) {
            //    console.log("iB " + iB + " " + logE*Math.log(planckBin[0][iTau]) + " " + logE*Math.log(cool[iTau]) + " " + logE*Math.log(heat[iTau]) + " " + logE*Math.log(corrDenom[iTau]));
            //}
        } //iTau
    }  //iB

    //console.log("i   tauRos[1][iTau]   planckBol[0]   planckBol[1]   jayBol      cool      heat      corrDenom");
    for (var iTau = 0; iTau < numDeps; iTau++) {
        //console.log("%02d   %12.8f   %12.8f   %12.8f   %12.8f   %12.8f   %12.8f   %12.8f%n", iTau,
        //        logE * tauRos[1][iTau], logE * Math.log(planckBol[iTau]), logE * Math.log(dBdTBol[iTau]), logE * Math.log(jayBol[iTau]),
        //        logE * Math.log(cool[iTau]), logE * Math.log(heat[iTau]), logE * Math.log(corrDenom[iTau]));
    }

    var logRatio, ratio, deltaTemp, logDeltaTemp;
    var sign = 1.0; //initialize for positive JminusB

    //System.out.println("tauRos[1][iTau]   deltaTemp[iTau]");
    for (var iTau = 0; iTau < numDeps; iTau++) {
        // Compute a 1st order T correction:  Compute J-B so that DeltaT < 0 if J < B:
// avoid direct subtraction of two large almost equal numbers, J & B:

        /* 
         //Gray method:
         
         double JminusB
         logRatio = Math.log(planckBol[iTau]) - Math.log(jayBol[iTau]);
         ratio = Math.exp(logRatio);
         JminusB = jayBol[iTau] * (1.0 - ratio);
         if (JminusB < 0.0) {
         sign = -1.0;
         }
         
         // DeltaB/DeltaT ~ dB/dT & dB/dT = (4/pi)sigma*T^3
         logDeltaTemp = Math.log(Math.abs(JminusB)) + Math.log(Math.PI) - Math.log(4.0) - logSigma - 3.0 * temp[1][iTau];
         deltaTemp[iTau] = sign * Math.exp(logDeltaTemp) * tcDamp;
         //System.out.format("%12.8f   %12.8f%n", tauRos[1][iTau], deltaTemp[iTau]);
         
         sign = 1.0; //reset sign
         */
        //Multi-Gray method:
        var deltaE;
        //double logHeatNorm, heatNorm, logCoolNorm, deltaENorm;

        ////Normalize numbers by dividing heat and cool terms each by common denominator derivative term first:
        //logHeatNorm = Math.log(heat[iTau]) - Math.log(corrDenom[iTau]);
        //heatNorm = Math.exp(logHeatNorm);
        //logCoolNorm = Math.log(cool[iTau]) - Math.log(corrDenom[iTau]);
        logRatio = Math.log(cool[iTau]) - Math.log(heat[iTau]);
        //logRatio = logCoolNorm - logHeatNorm;

        ratio = Math.exp(logRatio);
        deltaE = heat[iTau] * (1.0 - ratio);
        //deltaENorm = heatNorm * (1.0 - ratio);
        if (deltaE < 0.0) {
            sign = -1.0;
        }
        //CHEAT: Try a Tau-dependent deltaE damping here - things are flaky at tdepth where t(Tau) steepens
        deltaE = deltaE * Math.exp(1.0 * (tauRos[0][0] - tauRos[0][iTau]));
        // DeltaE/DeltaT ~ dB/dT_Bol
        logDeltaTemp = Math.log(Math.abs(deltaE)) - Math.log(corrDenom[iTau]);
        deltaTemp = sign * Math.exp(logDeltaTemp) * tcDamp;
        //deltaTemp = sign * deltaENorm * tcDamp;

        newTemp[0][iTau] = temp[0][iTau] + deltaTemp;
        newTemp[1][iTau] = Math.log(newTemp[0][iTau]);
    } //iTau loop

    return newTemp;
};
// method jayBolom computes bolometric angle-averaged mean intensity, J
// This is a Lambda operation, ie. the Schwartzschild equation
var jayBinner = function(numDeps, tauRos, temp, planckBin, grayLevel) {

    // For bolometric J on a Gray Tau scale in LTE: 
    // J(Tau) = 1/2 * Sigma_Tau=0^Infty { E_1(|t-Tau|)*Planck_Bol(Tau) }
    var logE = logTen(Math.E); // for debug output

    var E1; //E_1(x)

    //Set up local optical depth scale:

    var tauBin = [];
    tauBin.length = 2;
    tauBin[0] = [];
    tauBin[1] = [];
    tauBin[0].length = numDeps;
    tauBin[1].length = numDeps;
    var deltaTauRos;
    tauBin[0][0] = tauRos[0][0] * grayLevel; // Is this a good idea??
    tauBin[1][0] = Math.log(tauBin[0][0]);
    for (var iTau = 1; iTau < numDeps; iTau++) {
        deltaTauRos = tauRos[0][iTau] - tauRos[0][iTau - 1];
        //grayLevel *is*, by definition, the ratio kappa_Bin/kappaRos that we need here!
        tauBin[0][iTau] = tauBin[0][iTau - 1] + grayLevel * deltaTauRos;
        tauBin[1][iTau] = Math.log(tauBin[0][iTau]);
    }

    var logInteg, integ, integ1, integ2, logInteg1, logInteg2, meanInteg, logMeanInteg, term, logTerm;
    var deltaTau, logDeltaTau; //accumulator
    var accum = 0.0; //accumulator

    var jayBin = [];
    jayBin.length = numDeps;
    // if E_1(t-Tau) evaluated at Tau=bottom of atmosphere, then just set Jay=B at that Tau - we're deep enough to be thermalized
    // and we don't want to let lambda operation implicitly include depths below bottom of model where B=0 implicitly 
    var tiny = 1.0e-14; //tuned to around maxTauDIff at Tau_Ros ~ 3
    var maxTauDiff;
    //stipulate the {|t-Tau|} grid at which E_1(x)B will be evaluated - necessary to sample the 
    // sharply peaked integrand properly
    // ** CAUTION: minLog10TmTau and maxLog10TmTau are tau offsets from the centre of J integration, 
    //  NOT the optical depth scale of the atmosphere!
    //stipulate the {|t-Tau|} grid at which E_1(x)B will be evaluated - necessary to sample the 
    // sharply peaked integrand properly
    var fineFac = 3.0; // integrate E1 on a grid fineFac x finer in logTau space
    var E1Range = 36.0; // number of master tauBin intervals within which to integrate J 
    var numInteg = E1Range * fineFac; //
    var deltaLogTauE1 = (tauBin[1][numDeps - 1] - tauBin[1][0]) / numDeps;
    deltaLogTauE1 = deltaLogTauE1 / fineFac;
    var thisTau1, logThisTau1, thisTau2, logThisTau2, logE1, deltaTauE1, logThisPlanck, iFloat;
    //Prepare 1D vectors for Interpol.interpol:
    var logTauBin = [];
    logTauBin.length = numDeps;
    var logPlanck = [];
    logPlanck.length = numDeps;
    //System.out.println("logTauBin  logB");
    for (var k = 0; k < numDeps; k++) {
        logTauBin[k] = tauBin[1][k];
        logPlanck[k] = Math.log(planckBin[0][k]);
        //System.out.format("%12.8f   %12.8f%n", logE*logTauBin[k], logE*logPlanck[k]);
    }

    //Outer loop over Taus where Jay(Tau) being computed:
    // Start from top and work down to around tau=1 - below that assume we're thermalized with J=B
    //System.out.println("For logTauRos = " + logE*tauRos[1][40] + ": thisTau  E1xB  E1  B");
    //System.out.println("tauRos[1][iTau]   Math.log(planckBin[iTau])   jayBin[1][iTau]");
    for (var iTau = 0; iTau < numDeps; iTau++) {
        //System.out.println("jayBinner: iTau: " + iTau + " tauRos[0] " + tauRos[0][iTau] + " tauRos[1] " + logE * tauRos[1][iTau]);
        jayBin[iTau] = planckBin[0][iTau]; //default initialization J_bin = B_bin

        if (tauRos[0][iTau] <= 66.67) {
            //System.out.println("tauRos[0] < limit condition passed");
            // initial test - don't let E_1(x) factor in integrand run off bottom of atmosphere
            // - we have no emissivity down there and J will drop below B again, like at surface!
            maxTauDiff = Math.abs(tauBin[0][numDeps - 1] - tauBin[0][iTau]);
            //System.out.println("tauBin[0][numDeps - 1]: " + tauBin[0][numDeps - 1] + " tauBin[0][iTau] " + tauBin[0][iTau] + " maxTauDiff " + maxTauDiff);
            //System.out.println("maxTauDiff= " + maxTauDiff + " expOne(maxTauDiff)= " + expOne(maxTauDiff));
            if (expOne(maxTauDiff) < tiny) {

                //System.out.println("maxTauDiff < tiny condition passed, expOne(maxTauDiff): " + expOne(maxTauDiff));
// We're above thermalization depth: J may not = B:
                //Inner loop over depths contributing to each Jay(iTau):
                // work outward from t=Tau (ie. i=iTau) piece-wise  
                accum = 0.0;
                // conribution from depths above Tau:
                // start at i=1 instead of i=0 - cuts out troublesome central cusp of E_1(x) - but now we underestimate J!
                //initial integrand:
                logThisTau1 = tauBin[1][iTau] - deltaLogTauE1;
                thisTau1 = Math.exp(logThisTau1);
                deltaTauE1 = tauBin[0][iTau] - thisTau1;
                E1 = expOne(deltaTauE1);
                logE1 = Math.log(E1);
                logThisPlanck = interpol(logTauBin, logPlanck, logThisTau1);
                logInteg1 = logE1 + logThisPlanck;
                integ1 = Math.exp(logInteg1);
                for (var i = 2; i < numInteg - 1; i++) {

                    iFloat = 1.0 * i;
                    // Evaluate E_1(x) and log(E_1(x)) one and for all here

                    //System.out.format("%02d %12.8f %12.8f%n", j, tmTau[j], E1);
                    // LTE bolometric source function is Bolometric Planck function
                    // Extended trapezoidal rule for non-uniform abscissae - this is an exponential integrand!             
                    // We cannot evaluate E_1(x) at x=0 - singular:

                    logThisTau2 = tauBin[1][iTau] - iFloat + 1.0 * deltaLogTauE1;
                    thisTau2 = Math.exp(logThisTau2);
                    //if (i === numInteg - 2) {
                    //    System.out.println("i " + i + " logThisTau1 " + logE * logThisTau1 + " logThisTau2 " + logE * logThisTau2);
                    //}
                    // Make sure we're still in the atmosphere!
                    if (logThisTau2 > tauBin[1][0]) {
                        //if (i === numInteg - 2) {
                        //    System.out.println("thisTau2 > tauBin[0][0] condition passed");
                        //}
                        //if (iTau === 37) {
                        //    System.out.println("i " + i + " logThisTau1 " + logE * logThisTau1 + " logThisTau2 " + logE * logThisTau2);
                        //}

                        deltaTauE1 = tauBin[0][iTau] - thisTau2;
                        E1 = expOne(deltaTauE1);
                        logE1 = Math.log(E1);
                        // interpolate log(B(log(Tau)) to the integration abscissa
                        logThisPlanck = interpol(logTauBin, logPlanck, logThisTau2);
                        logInteg2 = logE1 + logThisPlanck;
                        integ2 = Math.exp(logInteg2);
                        logDeltaTau = Math.log(thisTau1 - thisTau2); // logDeltaTau *NOT* the same as deltaLogTau!!

                        meanInteg = 0.5 * (integ1 + integ2); //Trapezoid rule
                        logMeanInteg = Math.log(meanInteg);
                        //if (iTau === 40) {
                        //    System.out.format("%15.8f    %15.8f    %15.8f   %15.8f%n", logE*Math.log(thisTau1), logE*logMeanInteg, logE*logE1, logE*logThisPlanck);
                        //}

                        logTerm = logMeanInteg + logDeltaTau;
                        term = Math.exp(logTerm);
                        accum = accum + term;
                        integ1 = integ2;
                        thisTau1 = thisTau2;
                        //if (iTau === 41){
                        //    System.out.println("term " + term + " accum " + accum);
                        //}
                    } // thisTau > 0
                } // i ("t") loop, above iTau 

                jayBin[iTau] = 0.5 * accum; //store what we have.
                //test jayBin[iTau] = 0.5 * planckBin[0][iTau]; // fake upper half with isotropic result
                //test jayBin[iTau] = jayBin[iTau] + 0.5 * planckBin[0][iTau]; // test upper atmosphere part of J integration by fixing lower part with isotropic result

                // conribution from depths below Tau:
                // include iTau itself so we don't miss the area under the central peak of E_1(x) - the expOne function
                // will protect itself from the x=0 singularity using variable 'tiny'
                accum = 0.0;
                //initial integrand:
                // start at i=1 instead of i=0 - cuts out troublesome central cusp of E_1(x) - but now we underestimate J!
                logThisTau1 = tauBin[1][iTau] + deltaLogTauE1;
                thisTau1 = Math.exp(logThisTau1);
                deltaTauE1 = thisTau1 - tauBin[0][iTau];
                E1 = expOne(deltaTauE1);
                logE1 = Math.log(E1);
                logThisPlanck = interpol(logTauBin, logPlanck, logThisTau1);
                logInteg1 = logE1 + logThisPlanck;
                integ1 = Math.exp(logInteg1);
                for (var i = 2; i < numInteg - 1; i++) {

                    iFloat = 1.0 * i;
                    logThisTau2 = tauBin[1][iTau] + iFloat * deltaLogTauE1;
                    thisTau2 = Math.exp(logThisTau2);
                    // We cannot evaluate E_1(x) at x=0 - singular:
                    // Extended trapezoidal rule for non-uniform abscissae - the is an exponential integrand! 

                    // make sure we're still in the atmosphere!
                    if (logThisTau2 < tauBin[1][numDeps - 1]) {

                        deltaTauE1 = thisTau2 - tauBin[0][iTau];
                        E1 = expOne(deltaTauE1);
                        logE1 = Math.log(E1);
                        logThisPlanck = interpol(logTauBin, logPlanck, logThisTau2);
                        logInteg2 = logE1 + logThisPlanck;
                        integ2 = Math.exp(logInteg2);
                        logDeltaTau = Math.log(thisTau2 - thisTau1); // logDeltaTau *NOT* the same as deltaLogTau!!

                        meanInteg = 0.5 * (integ1 + integ2); //Trapezoid rule
                        logMeanInteg = Math.log(meanInteg);
                        //if (iTau === 40) {
                        //    System.out.format("%15.8f    %15.8f    %15.8f    %15.8f%n", logE*Math.log(thisTau1), logE*logMeanInteg, logE*logE1, logE*logThisPlanck);
                        //}

                        // LTE bolometric source function is Bolometric Plnack function
                        logTerm = logMeanInteg + logDeltaTau;
                        term = Math.exp(logTerm);
                        accum = accum + term;
                        integ1 = integ2;
                        thisTau1 = thisTau2;
                    }// if thisTau < tauBin[0][numDeps-1]
                } // i ("t") loop, below iTau

                jayBin[iTau] = jayBin[iTau] + 0.5 * accum;
            } //if branch for E_1(x) safely dwindling away before reaching bottom of atmosphere
        } // if branch for above thermalization depth of Tau=10? 

        //System.out.format("%12.8f   %12.8f  %12.8f%n",
        //       logE * tauRos[1][iTau], Math.log10(planckBin[iTau]), Math.log10(jayBin[iTau]));
    } //iTau loop

    return jayBin;
};
// Compute linear wave-bin-specific lambda-integrated Planck fn AND it's T derivative at all depths:
// Row 0: B_bin(tau);   Row 1: dB/dT_bin(tau);
var planckBinner = function(numDeps, temp, lamStart, lamStop) {


    var planckBin = [];
    planckBin.length = 2;
    planckBin[0] = [];
    planckBin[1] = [];
    planckBin[0].length = numDeps;
    planckBin[1].length = numDeps;
    var logE = logTen(Math.E); // for debug output

    //MultiGray-ready:
    // Parameters of overall lambda grid (nm):
    // Planck.planck() will convert nm to cm
    //double log10LamStart = 1.5;  //must be < first Gray lambda break point
    //double log10LamStop = 5.0;   //must be > last Gray lambda break point 
    var log10LamStart = logTen(lamStart);
    var log10LamStop = logTen(lamStop);
    var deltaLog10Lam = 0.1;
    var numLamAll;
    numLamAll = Math.floor(((log10LamStop - log10LamStart) / deltaLog10Lam));
    var lambda = [];
    lambda.length = numLamAll;
    //Generate lambda grid separately to avoid duplicate lambda generation
    var iFloat, thisLogLam;
    //System.out.println("lambdas");
    for (var i = 0; i < numLamAll; i++) {

        iFloat = 1.0 * i;
        thisLogLam = log10LamStart + iFloat * deltaLog10Lam;
        lambda[i] = Math.pow(10.0, thisLogLam);
        //System.out.format("%02d   %12.8f%n", i, lambda[i]);

    }

    var thisLam1, thisLam2, deltaLam, planck1, planck2, logPlanck1, logPlanck2;
    var term, integ, accum;
    var dBdT1, dBdT2, logdBdT1, logdBdT2, accum2;
    //trapezoid rule integration
    //System.out.println("Trapezoid: ");
    for (var iTau = 0; iTau < numDeps; iTau++) {
        //reset accumulators for new depth
        accum = 0.0;
        accum2 = 0.0;
        //initial integrands:
        logPlanck1 = planck(temp[0][iTau], lambda[0]);
        planck1 = Math.exp(logPlanck1);
        logdBdT1 = dBdT(temp[0][iTau], lambda[0]);
        dBdT1 = Math.exp(logdBdT1);
        for (var i = 1; i < numLamAll - 1; i++) {

            deltaLam = lambda[i + 1] - lambda[i];
            //deltaLam = deltaLam * 1.0e-7; //nm to cm

            //Planck.planck returns log(B_lambda)

            logPlanck2 = planck(temp[0][iTau], lambda[i]);
            planck2 = Math.exp(logPlanck2);
            //if (i === 20) {
            //    System.out.println("lambda " + thisLam1 + " temp[0][iTau] " + temp[0][iTau] + " logPlanck1 " + logE*logPlanck1);
            //}
            //trapezoid rule integration
            integ = 0.5 * (planck1 + planck2) * deltaLam;
            accum = accum + integ;
            planck1 = planck2;
            //Now do the same for dB/dT:
            //Planck.dBdT returns log(dB/dT_lambda)

            logdBdT2 = dBdT(temp[0][iTau], lambda[i]);
            dBdT2 = Math.exp(logdBdT2);
            //trapezoid rule integration
            integ = 0.5 * (dBdT1 + dBdT2) * deltaLam;
            accum2 = accum2 + integ;
            dBdT1 = dBdT2;
        } // lambda i loop
        planckBin[0][iTau] = accum;
        planckBin[1][iTau] = accum2;
        //System.out.format("%02d   %12.8f%n", iTau, planckBin[iTau]);

    } //iTau loop

    //// Gray only:
    ////if (lamStart === 1000.0) {  //Could be for any gray wavelength
    //double[][] planckBol = new double[2][numDeps];
    //double[][] dBdTBol = new double[2][numDeps];
    //System.out.println("Stefan-Boltzmann:  tauRos[1]  B_Bol   dBdT_Bol");
    //for (int i = 0; i < numDeps; i++) {
    //    planckBol[1][i] = logSigma + 4.0 * temp[1][i] - Math.log(Math.PI);
    //    planckBol[0][i] = Math.exp(planckBol[1][i]);
    //    dBdTBol[1][i] = Math.log(4.0) + logSigma + 3.0 * temp[1][i] - Math.log(Math.PI);
    //    dBdTBol[0][i] = Math.exp(dBdTBol[1][i]);
    //    System.out.format("%02d   %12.8f   %12.8f%n", i, logE * planckBol[1][i], logE * dBdTBol[1][i]);
    //}
    //}
    return planckBin;
};
// Approximate first exponential integral function E_1(x) = -Ei(-x)
var expOne = function(x) {

    // From http://en.wikipedia.org/wiki/Exponential_integral 
    // Series expansion for first exponential integral function, E_1(x) = -Ei(-x)
    // Ee_one(x) = -gamma - ln(abs(x)) - Sigma_k=1^infnty{(-x)^k)/(k*k!)}
    // where: gamma =  Euler�Mascheroni constant = 0.577215665...
    var E1;
    x = Math.abs(x); // x must be positive
    // E1(x) undefined at x=0 - singular:
    //double tiny = 1.25;  //tuned to give J ~ 0.5B @ tau=0
    var tiny = 1.0e-6;
    if (x < tiny) {
        x = tiny;
    }

    // Caution: even at 11th order acuracy (k=11), approximation starts to diverge for x . 3.0:
    if (x > 3.0) {

        E1 = Math.exp(-1.0 * x) / x; // large x approx

    } else {
        var gamma = 0.577215665; //Euler�Mascheroni constant
        var kTerm = 0.0;
        var order = 11; //order of approximation
        var kFloat;
        var accum = 0.0; //accumulator
        var kFac = 1.0; // initialize k! (k factorial)

        for (var k = 1; k <= order; k++) {
            kFloat = 1.0 * k;
            kFac = kFac * kFloat;
            accum = accum + Math.pow((-1.0 * x), kFloat) / (k * kFac);
            //System.out.println("k: " + k + " kFac: " + kFac);
            //System.out.println("k: " + k + " Math.pow(x, kFloat): " + Math.pow(x, kFloat));
        }
        kTerm = accum;
        E1 = -1.0 * gamma - Math.log(Math.abs(x)) - kTerm;
    }

    //System.out.println("x: " + x + " exp1(x): " + E1);
    return E1;
};
var grayLevEps = function(maxNumBins, minLambda, maxLambda, teff, isCool) {

    //double minLambda = 30.0;  //nm
    //double maxLambda = 1.0e6;  //nm
    //int maxNumBins = 11;
    //double[][] grayLevelsEpsilons = new double[3][maxNumBins + 1];
    var grayLevelsEpsilons = [];
    grayLevelsEpsilons.length = 3;
    grayLevelsEpsilons[0] = [];
    grayLevelsEpsilons[1] = [];
    grayLevelsEpsilons[2] = [];
    grayLevelsEpsilons[0].length = maxNumBins + 1;
    grayLevelsEpsilons[1].length = maxNumBins + 1;
    grayLevelsEpsilons[2].length = maxNumBins + 1;
    // The returned structure:
    //Row 0 is wavelength breakpoints
    //Row 1 is relative opacity gray levels
    //Row 2 is absolute thermal photon creation fractions, epsilon

    //initialize everything first:
    for (var iB = 0; iB < maxNumBins; iB++) {
        grayLevelsEpsilons[0][iB] = maxLambda;
        grayLevelsEpsilons[1][iB] = 1.0;
        grayLevelsEpsilons[2][iB] = 0.99;
    }
    grayLevelsEpsilons[0][maxNumBins] = maxLambda; //Set final wavelength

    if (teff < isCool) {
        // physically based wavelength break-points and gray levels for Sun from Rutten Fig. 8.6
        // H I Balmer, Lyman & Paschen jumps for lambda <=3640 A, H^- b-f opacity hump in visible & hole at 1.6 microns, increasing f-f beyond that
        var lamSet = [minLambda, 91.1, 158.5, 364.0, 820.4, 1600.0, 3.0e3, 1.0e4, 3.3e4, 1.0e5, 3.3e5, maxLambda]; //nm
        //var levelSet = [1000.0, 100.0, 5.0, 0.5, 0.3, 1.0, 3.0, 10.0, 30.0, 100.0, 1000.0];
        var levelSet = [1000.0, 100.0, 5.0, 1.0, 0.5, 0.1, 3.0, 10.0, 30.0, 100.0, 1000.0];
        //photon *thermal* destruction and creation probability (as opposed to scattering)
        //WARNING:  THese cannot be set exactly = 1.0 or a Math.log() will blow up!!
        //var epsilonSet = [0.50, 0.50, 0.50, 0.50, 0.50, 0.9, 0.99, 0.99, 0.99, 0.99, 0.99];
        var epsilonSet = [0.50, 0.50, 0.50, 0.99, 0.99, 0.99, 0.99, 0.99, 0.99, 0.99, 0.99];
        var numBins = levelSet.length;
        for (var iB = 0; iB < numBins; iB++) {
            grayLevelsEpsilons[0][iB] = lamSet[iB] * 1.0e-7;
            grayLevelsEpsilons[1][iB] = levelSet[iB];
            grayLevelsEpsilons[2][iB] = epsilonSet[iB];
        }
        grayLevelsEpsilons[0][numBins] = lamSet[numBins] * 1.0e-7; //Get final wavelength
    } else {
        // *** Early type stars, Teff > 9500 K (???)
        // It's all about H I b-f (??) What about Thomson scattering (gray)?
        // Lyman, Balmer, Paschen, Brackett jumps
        //What about He I features?
        var lamSet = [minLambda, 91.1, 364.0, 820.4, 1458.0, maxLambda]; //nm
        var levelSet = [100.0, 10.0, 2.0, 1.0, 1.0]; //???
        var epsilonSet = [0.9, 0.9, 0.9, 0.9, 0.9];
        var numBins = levelSet.length;
        for (var iB = 0; iB < numBins; iB++) {
            grayLevelsEpsilons[0][iB] = lamSet[iB] * 1.0e-7;
            ; //cm
            grayLevelsEpsilons[1][iB] = levelSet[iB];
            grayLevelsEpsilons[2][iB] = epsilonSet[iB];
        }
        grayLevelsEpsilons[0][numBins] = lamSet[numBins] * 1.0e-7; //Get final wavelength
    }

    return grayLevelsEpsilons;
};
var convec = function(numDeps, tauRos, temp, press, rho, kappa, kappaSun, zScale, teff, logg) {

    var logE = logTen(Math.E); // for debug output
    var ln10 = Math.log(10.0); //needed to convert logg from base 10 to base e

    var sigma = 5.670373E-5; //Stefan-Boltzmann constant ergs/s/cm^2/K^4  
    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var logAmu = Math.log(amu);
    var logSigma = Math.log(sigma);
    var logK = Math.log(k);
    var logAmu = Math.log(amu);
    var ctRow0 = [];
    var ctRow1 = [];
    ctRow0.length = numDeps;
    ctRow1.length = numDeps;
    var convTemp = [
        ctRow0,
        ctRow1
    ];
    //Schwarzschild criterion for convective instability:
    var gamma = 5.0 / 3.0; //adiabatic gamma for ideal monatomic gas - the photon gas is negligible in stars w convection
    var gammaFac = gamma / (gamma - 1.0); // yeah, yeah - I know it's 2.5, but let's show where it comes from for the record...
    var invGamFac = 1.0 / gammaFac;
    //CHEAT: Set gammaThing to value that makes convection just disappear at bottom of mid-F star (7000 K)
    //double gammaThing = 1.60;
    //double invGamThing = 1.0 / gammaThing;
    var invGamThing;
    //System.out.println("gammaThing " + gammaThing);

    var deltaP, deltaT; //, dlnPdlnT;
    var dlnTdlnP, dlnMudlnP, deltaMu;
    var Hp, logHp;
    //double HpSun = 1.2535465715411615E7;  //cm, as computed by GrayStar at depth index=36
    var HpSun = 2.0E7; //cm, approximately as computed by GrayStar at depth index=36
    var logHpSun = Math.log(HpSun);
    //Compute the presure scale height as a reality check:
    var HpRefDep = 36; //index of reference depth for computing pressure scale height
    logHp = press[1][HpRefDep] - rho[1][HpRefDep] - ln10 * logg;
    Hp = Math.exp(logHp);
    //Try scaling gamma to "fix" the convective boundary
    //invGamThing = invGamFac * HpSun/Hp;

    //System.out.println("Hp/HpSun " + Hp/HpSun);

    var mmw = mmwFn(numDeps, temp, zScale);
    //Search outward for top of convection zone
    var isStable = false;
    var iBound = numDeps - 1; //initialize index of depth where convection begins to bottom of atmosphere
    for (var i = numDeps - 2; i > 0; i--) {

        //System.out.println("Hp " + Hp);
        //1st order finite difference - erratic?
        //double deltaP = press[1][i] - press[1][i-1];
        //double deltaT = temp[1][i] - temp[1][i-1];
        //Try "2nd order" finite difference - non-uniform spacing in deltaT
        deltaP = press[1][i + 1] - press[1][i - 1];
        deltaT = temp[1][i + 1] - temp[1][i - 1];
        deltaMu = (mmw[i + 1] - mmw[i]) * amu;
        //dlnPdlnT = deltaP / deltaT;
        dlnTdlnP = deltaT / deltaP;
        dlnMudlnP = deltaMu / deltaP;
        //System.out.format("%12.8f   %12.8f%n", logE * tauRos[1][i], dlnPlndT);
        // This can be finicky - let's say we have not found the radiative zone unless two consecutive layers meet the criterion
        //if (dlnPdlnT > gammaThing) {
        if (dlnTdlnP < invGamFac + dlnMudlnP) {

            //Convectively stable
            if (!isStable) {
                //The previous convectively unstable layer was an isolated anomoly - we're have NOT found the zone!  Reset:
                isStable = true;
                iBound = i;
                //System.out.println("First stable layer was found, tauRos " + logE * tauRos[1][i] + " NOW: isStable " + isStable);
            }
        }
    }

    // console.log("Convec: iBound " + iBound);

    //Radiative zone - leave temperatures alone:
    for (var i = 0; i < iBound; i++) {
        convTemp[0][i] = temp[0][i];
        convTemp[1][i] = temp[1][i];
    }

    var baseTemp = temp[0][iBound];
    var baseLogTemp = temp[1][iBound];
    var baseTau = tauRos[0][iBound];
    var baseLogTau = tauRos[1][iBound];
    //double baseDepth = depths[iBound];

    var mixLSun = 1.0; // convective mixing length in pressure scale heights (H_P)

    var betaSun = 0.5; // factor for square of  convective bubble velocity (range: 0.0 - 1.0)

    var Cp, logCp; //Specific heat capacity at constant pressure
    var mixL = mixLSun; //initialization
    var beta = betaSun; //initialization
    var teffSun = 5778.0;
    var loggSun = 4.44;
    //Shameless fix:
    //It seems mixL and beta need to be temp and press dependent:
    if (teff < teffSun) {
        mixL = mixLSun * Math.pow(teff / teffSun, 4.0); //lower teff -> smaller mixL -> steeper SAdGrad
        beta = betaSun * Math.pow(teff / teffSun, 4.0); //lower teff -> smaller beta -> steeper SAdGrad
    }
    mixL = mixL * Math.pow(loggSun / logg, 2.0); // lower logg -> larger mixL -> smaller sAdGrad
    beta = beta * Math.pow(loggSun / logg, 2.0); // lower logg -> larger beta -> smaller sAdGrad

    /*
     //Shameless fix:
     beta = betaSun;  // no fix?
     mixL = mixLSun * Math.pow(Hp / HpSun, 4.0);  //lower teff -> smaller Hp -> smaller mixL -> steeper SAdGrad
     //mixL = mixL * Math.pow(logg / loggSun, 4.0); // lower logg -> smaller mixL -> larger sAdGrad
     */
    var logMixL = Math.log(mixL);
    var logBeta = Math.log(beta);
    var logFluxSurfBol = logSigma + 4.0 * Math.log(teff);
    // This will get hairy when we take it super-adiabatic so let's take it *really* easy and make every factor and term clear:
    var logInvGamFac = Math.log(invGamFac);
    //Get the mean molecular weight in amu from State - Row 0 is "mu" in amu:
    var mu, logMu, logFctr1, logFctr2, logFctr3;
    var nextTemp, lastTemp, nextTemp2;
    //Adiabatic dT/dx gradients in various coordinates
    //tau, logTau space
    var logAdGradTauMag, logAdGradLogTauMag, adGradLogTau;
    //SuperAdiabatic dT/dx gradients in various coordinates
    var deltaTau, logDeltaTau, deltaLogTau, logDeltaLogTau;
    var sAdGradLogTau, logSadGradR, logSadGradTau, logSadGradLogTau;
    var lastLogTau;
    //r space:
    var logAdGradRMag, adGradR;
    //SuperAdiabatic dT/dx gradients in various coordinates
    var deltaR, logDeltaR;
    /*
     double sAdGradR;
     double lastDepth;
     */

    lastTemp = baseTemp;
    lastLogTau = baseLogTau;
    //lastDepth = baseDepth;

    //console.log("tauRos[1][i]   (tauRos[1][i]-lastLogTau)   adGradLogTau   rho[1][i]   kappa[1][i]   lastTemp   nextTemp");
    for (var i = iBound; i < numDeps; i++) {

        mu = mmw[i];
        logMu = Math.log(mu);
        logFctr1 = logMu + logAmu - logK;
        //System.out.println("logFactr1 " + logE*logFctr1 + " logInvGamFac " + logE*logInvGamFac + " logg " + logg);
        logCp = Math.log(5.0 / 2.0) - logFctr1; //ideal monatomic gas - underestimate that neglects partial ionization

        // ** Caution: These are log_e of the *magnitude* of the temperature gradients!
        //The adiabatic dT/dTau in r space
        logAdGradRMag = logInvGamFac + logFctr1 + ln10 * logg; //logg is in base 10

        //This is baaad stuff - remember our tuaRos scale has *nothing* to do with our kappa values!
        //The adiabatic dT/dTau in tau space - divide dT/dr by rho and kappa and make it +ve becasue we're in tau-space:
        //Bad fake to fix artificially small dT/dr at low Teff - use kappaSun instead of kappa
        logAdGradTauMag = logAdGradRMag - rho[1][i] - kappa[1][i];
        //The adiabatic dT/dLnTau in log_e(tau) space
        logAdGradLogTauMag = tauRos[1][i] + logAdGradTauMag;
        //Build the T(tau) in the convection zone:
        // Work in logTau space - numerically safer??
        adGradLogTau = Math.exp(logAdGradLogTauMag); //No minus sign - logTau increases inward...
        nextTemp = lastTemp + adGradLogTau * (tauRos[1][i] - lastLogTau);
        //console.log(" " + logE * tauRos[1][i] + " " + logE*(tauRos[1][i]-lastLogTau) + " " + adGradLogTau + " " + logE*rho[1][i] + " " + logE*kappa[1][i] + " " + lastTemp + " " + nextTemp);
        /*
         // Do in geometric depth space
         adGradR = Math.exp(logAdGradRMag); // no minus sign - our depths *increase* inwards (they're NOT heights!)
         nextTemp = lastTemp + adGradR * (depths[i] - lastDepth);  
         
         //System.out.format("%12.8f   %12.8f   %12.8f   %7.1f   %7.1f%n", logE*tauRos[1][i], (depths[i] - lastDepth), adGradR, lastTemp, nextTemp);
         */
        //Okay - now the difference between the superadiabatic and adiabatic dT/dr:
        logFctr2 = rho[1][i] + logCp + 2.0 * logMixL;
        // ** NOTE ** Should temp in the following line be the *convective* temp of the last depth???
        // logg is in base 10 - convert to base e
        logFctr3 = 3.0 * (ln10 * logg - Math.log(lastTemp)) / 2.0;
        //Difference between SuperAdibatic dT/dr and Adiabtic dT/dr in r-space - Carroll & Ostlie 2nd Ed. p. 328
        //System.out.println("logFluxSurfBol " + logE * logFluxSurfBol + " logFctr2 " + logE * logFctr2 + " logFctr1 " + logE * logFctr1 + " logFctr3 " + logE * logFctr3 + " logBeta " + logE * logBeta);
        logDeltaR = logFluxSurfBol - logFctr2 + 2.0 * logFctr1 + logFctr3 - 0.5 * logBeta;
        logDeltaR = 2.0 * logDeltaR / 3.0; //DeltaR is above formula to the 2/3 power

        //This is baaad stuff - remember our tuaRos scale has *nothing* to do with our kappa values!
        //Bad fake to fix artificially small dT/dr at low Teff - use kappaSun instead of kappa
        logDeltaTau = logDeltaR - rho[1][i] - kappa[1][i];
        logDeltaLogTau = tauRos[1][i] + logDeltaTau;
        sAdGradLogTau = adGradLogTau + Math.exp(logDeltaLogTau);
        //System.out.format("%12.8f   %12.8f   %12.8f   %12.8f%n", logE*tauRos[1][i], logE*logDeltaR, logE*logDeltaTau, logE*logDeltaLogTau);
        nextTemp2 = lastTemp + sAdGradLogTau * (tauRos[1][i] - lastLogTau);
        /*
         // Do in geometric depth space
         sAdGradR = adGradR + Math.exp(logDeltaR);
         nextTemp2 = lastTemp + sAdGradR * (depths[i] - lastDepth);
         */
        // set everything to nextTemp2 for superadibatic dT/dr, and to nexTemp for adiabatic dT/dr 
        convTemp[0][i] = nextTemp2;
        convTemp[1][i] = Math.log(nextTemp2);
        lastTemp = nextTemp2;
        lastLogTau = tauRos[1][i];
        //lastDepth = depths[i];
    }

    return convTemp;
};

