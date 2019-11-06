//# -*- coding: utf-8 -*-
/*
 * """
Created on Tue May  7 11:25:12 2019

@author: Philip D. Bennett
Port from FORTRAN to Python: Ian Short
"""
*/

//import math
//import numpy
//#from scipy.linalg.blas import daxpy
//#from scipy.linalg.blas import ddot
//#from scipy.linalg.blas import dscal
//#from scipy.linalg.blas import idamax

//#import Documents.ChromaStarPy.GAS.BlockData
//#from Documents.ChromaStarPy.GAS.GsRead import gsread
//import BlockData
//#import GsRead
//import GsRead2


/*
    var t0 = CSGasInit.t0;
    
    var  ip = ChromaStarGas.ip;
    var  comp = ChromaStarGas.comp;
    
    var  itab = CSGasInit.itab;
    var  indx = ChromaStarGas.indx;
    
    
//#c
    var  ipr = ChromaStarGas.ipr;
    var  nch = ChromaStarGas.nch;
    var  zat = ChromaStarGas.zat;
    var  neut = ChromaStarGas.neut;
    var  idel = ChromaStarGas.idel;
    var  indsp = ChromaStarGas.indsp;
    var  iat = ChromaStarGas.iat;
    
//#c
    
    var natom = ChromaStarGas.natom;
    var nspec = ChromaStarGas.nspec;
    var nlin1 = ChromaStarGas.nlin1;
    var nlin2 = ChromaStarGas.nlin2;
    
//#c
    var  logk = ChromaStarGas.logk;
    var  logwt = ChromaStarGas.logwt;

    var  type0 = ChromaStarGas.type0;
*/
/* No!
// Main variables to be prepared for Gas.gas():

   public static int neq;
   public static double pe;
   public static double[] p = new double[40];
*/

var ten = function(xdum){
    var x = 2.302585093e0*xdum;
    var x2 = Math.exp(x);
    return x2;
};

var isign = function(a, b){
    
    //#default:
    var c = a;
    
    if ( (Math.sign(b) == -1) && (Math.sign(a) == 1) ){
        c = -1 * a;
    }
            
    if ( (Math.sign(b) == 1) && (Math.sign(a) == -1) ){
        c = -1 * a;
    }
        
    if ( (Math.sign(b) == 0) && (Math.sign(a) == -1) ){
        c = -1 * a;
    }
        
    return c;

};
            

//#def gasest(isolv, temp, pt, peIn):
  var gasest = function(isolv, temp, pt){
 
    /*   
    """
    #c
    #c cis: Inputs: isolv, temp, pt, pe
    #c cis: Ouput: p, neq  ??
    #
    #c
    #c GASEST: Returns an estimate of the fractional abundances of
    #c each chemical species for a given T, P, and composition.
    #c ISOLV=1: Calculate initial estimates only for species with
    #c          IPR=1, ie. major species. 
    #c      =2: Calculate initial estimates for species with IPR=1
    #c          or 2, ie. major and minor constituents.
    #c Initial estimates are not calculated for IPR=3 species since
    #c these are never needed. 
    #c
    """
    */
    //#Try this:
    ////#global pi, sbcon, kbol, cvel, gcon, hpl, hmass, t0, everg # /consts/
    //global kbol, hmass, t0 # /consts/
    //global name, ip, comp, awt, nspec, natom, itab, ntab, indx, iprint, gsinit, print0 #/gasp/
    //global ipr, nch, nel, ntot, nat, zat, neut, idel, indsp, indzat, iat, natsp, iatsp #/gasp2/
    //global nlin1, lin1, linv1, nlin2, lin2, linv2 #/lin/
    //global logk, logwt, it, kt, type0 #equil
    
//#c
/*
    public static double t0 = BlockData.t0
    
    public static double[] ip = GsRead2.ip
    public static double[] comp = GsRead2.comp
    
    public static int[] itab = BlockData.itab
    public static int[][][][][] indx = GsRead2.indx
    
    
//#c
    public static int[] ipr = GsRead2.ipr
    public static int[] nch = GsRead2.nch
    public static int[][] zat = GsRead2.zat
    public static int[] neut = GsRead2.neut
    public static int[] idel = GsRead2.idel
    public static int[] indsp = GsRead2.indsp
    public static int[] iat = GsRead2.iat
    
//#c
    
    public static int natom = GsRead2.natom
    public static int nspec = GsRead2.nspec
    public static int nlin1 = GsRead2.nlin1
    public static int nlin2 = GsRead2.nlin2
    
//#c
    public static double[][] logk = GsRead2.logk
    public static double[] logwt = GsRead2.logwt

    public static int[] type0 = GsRead2.type0
*/

// Main variables to be prepared for Gas.gas():
   var neq = 0;
   var pe;
   var p = [];
   p.length = 40;
//initialize:
  for (var i = 0; i < 40; i++){
     p[i] = 0.0;
  }

    var it = [];
    it.length = 150;
    var kt = [];
    kt.length = 150;
//initialize:
  for (var i = 0; i < 150; i++){
     it[i] = 0.0;
     kt[i] = 0.0;
  }
    
    
//#c
    
   // p = [0.0e0 for i in range(40)]
    var logt = 0.0e0;
    var logit = 0.0e0;
    var logkt = 0.0e0;
    var ipeff = 0.0e0;
    var imp = 0.0e0;
    var ihp = 0.0e0;
    var ihm = 0.0e0;
    var icp = 0.0e0;
    var inp = 0.0e0;
    var iop = 0.0e0;
    var isip = 0.0e0;
    var isp = 0.0e0;
    var iclm = 0.0e0;
    var iscp = 0.0e0;
    var itip = 0.0e0;
    var ivp = 0.0e0;
    var iyp = 0.0e0;
    var izrp = 0.0e0;
    var kh2 = 0.0e0;
    var kch = 0.0e0;
    var koh = 0.0e0;
    var knh = 0.0e0;
    var kco = 0.0e0;
    var kn2 = 0.0e0;
    var kh2o = 0.0e0;
    var ksio = 0.0e0;
    var ksis = 0.0e0;
    var ksih = 0.0e0;
    var khs = 0.0e0;
    var kh2s = 0.0e0;
    var khcl = 0.0e0;
    var ksco = 0.0e0;
    var ksco2 = 0.0e0;
    var ktio = 0.0e0;
    var kvo = 0.0e0;
    var kyo = 0.0e0;
    var kyo2 = 0.0e0;
    var kzro = 0.0e0;
    var kzro2 = 0.0e0;
    
    
    //#izmet = [1, 2, 6, 11, 12, 13, 14, 19, 20, 26]
    var izmet = [0, 1, 5, 10, 11, 12, 13, 18, 19, 25];
    var nummet = 10;
    var mxspec = 150;
    
    //#c
    //#c Calculate equilibrium constants for each species in table
    //#c N.B. Freeze the chemical equilibrium for T < 1200K.
    //#c
    
    var t = temp;

    if (t < 1200.0e0){
        t = 1200.0e0;
    }
        
    var th = t0/t;
    logt = 2.5e0*Math.log10(t);
    var ityp, nq, ich;  
 
    for (var n99 = 0; n99 < nspec; n99++){
        
        if (ipr[n99] <= 2){
            
            ityp = type0[n99];
            nq = nch[n99];
            ich = isign(1, nq);
            
            if ( (ityp == 3) || (ityp == 4) ){

                kt[n99] = kt[neut[n99]];
                if ( ((nch[n99] - nch[n99-1]) != ich) || (nch[n99-1] == 0) ){
                    logit = 0.0e0;
                }
                logit = logit + ich*(-th*ip[n99] + logt + logwt[n99] - 0.48e0);
                it[n99] = ten(logit);
            } else if (ityp == 2){
                logkt = (((logk[4][n99]*th + logk[3][n99])*th + logk[2][n99])*th + logk[1][n99])*th + logk[0][n99];
                kt[n99] = ten(logkt);
                it[n99] = 1.0e0;
            } else{
                kt[n99] = 1.0e0;
                it[n99] = 1.0e0;
            }
        }
     }       


    kt[mxspec-1] = 1.0e0;
    it[mxspec-1] = 1.0e0;
    
    //#c
    //#c ISOLV=1: Calculate initial estimates of major species 
    //#c          and for a fictitous electron donor Z as well as Pe
    //#c ISOLV=2: Calculate initial estimates of both major and minor
    //#c          species as well as for pe.
    //#c
    var jh = iat[indx[1][1][0][0][0]];
    var comph = comp[jh];
    ihp = it[indx[2][1][0][0][0]];
    var dhp = idel[indx[2][1][0][0][0]];
    kh2 = kt[indx[1][1][1][0][0]];
    var dh2 = idel[indx[1][1][1][0][0]];
    //#print("jh ", jh, " comph ", comph, " kh2 ", kh2, " dh2 ", dh2)
    
    var peh = 0.0e0;
    var term, rat, omrat;
    if (dhp != 0.0e0){
        term = (1.0e0 + comph)*ihp;
        rat = -4.0e0*comph*ihp*pt/term/term;
        omrat = 1.0e0 - rat;
        if (omrat < 0.0e0){ 
            omrat = 0.0e0;
        }
        if (Math.abs(rat) >= 1.0e-10){
            peh = (-term + Math.abs(term)*Math.sqrt(omrat))/2.0e0;
        } else{
            peh = comph*ihp*pt/term;
        }
    }    
    
    ipeff = 7.3e0;
    imp = ten(-ipeff*th + logt - 0.48e0);
    
    //#c
    //#c Estimate PH2 since Pd = PH + PH2 in the cool temperature
    //#c limit where the metals provide most of the electrons. We
    //#c then use this Pd value to estimate this electron pressure.
    //#c
    var ph2 = 0.0e0;
    var fact, fact2, terma, termb, termc;
    if (dh2 != 0.0e0){
        fact = 2.0e0 - comph;
        terma = fact*fact;
        termb = 2.0e0*comph*pt*fact + kh2;
        fact2 = comph*pt;
        termc = fact2*fact2;
        rat = 4.0e0*terma*termc/termb/termb;
        omrat = 1.0e0 - rat;
        if (omrat < 0.0e0){ 
            omrat = 0.0e0;
        }
        ph2 = termb*(1.0e0 - Math.sqrt(omrat))/2.0e0/terma;
    }
        
    //#c
    //#c Include metals with low ionization potential in initial guess
    //#c Na (Z=11), Mg (Z=12), Al (Z=13), K (Z=19), Ca (Z=20), Fe(Z=26)
    //#c also Si (Z=14)
    //#c
    var compm = 0.0e0;
    var ind, j;
    for (var i99 = 2; i99 < nummet; i99++){
        ind = itab[izmet[i99]];
        j = iat[indx[1][ind][0][0][0]];
        compm = compm + comp[j]*idel[indx[2][ind][0][0][0]];
    }
        
    var pem2 = imp*imp + 4.0e0*compm*(pt + ph2)*imp;
    if (pem2 < 0.0e0){
        pem2 = 0.0e0;
    }
    var pem = (Math.sqrt(pem2) - imp)/2.0e0;

    //#c
    //#c Estimate total electron pressure
    //#c
    var pe0 = Math.max(peh, pem);
    //#print("peh ", peh, " pem ", pem, " pe0 ", pe0)
    //#c
    //#c Having obtained a crude estimate of electron pressure,
    //#c we now use a linearization approach to obtain a good value.
    //#c
    var firstTime = true;
    var neit = 0;
    
    //#215
    //#sum1 = 0.0e0
    //#sum2 = 0.0e0
    //#pd = pt + ph2 - pe0
    //#dpe = (pd*sum1 - pe0)/(1.0e0 + sum1 + pd*sum2)
    //#pe0 = pe0 + dpe
    var dpe = 1.1e-3 * pe0; // #initial dummy value
    var sum1, sum2, fact3, pd;
    var ii;  
   
    while( ( (neit <= 15) && (Math.abs(pe0/pt) > 1.0e-20) && (Math.abs(dpe/pe0) > 1.0e-3) ) || firstTime == true){
    
        firstTime = false;
    
        neit = neit + 1;
        sum1 = 0.0e0;
        sum2 = 0.0e0;
    
        //#c
        //#c Consider H, He, C, Na, Mg, Al, Si, K, Ca and Fe as electron donors
        //#c
        for (var i99 = 0; i99 < nummet; i99++){
            ind = itab[izmet[i99]];
            j = iat[indx[1][ind][0][0][0]];
            ii = indx[2][ind][0][0][0];
            //#print("i99 ", i99, " ind ", ind, " j ", j, " ii ", ii, " idel ", idel[ii])
            if (idel[ii] == 1){
                fact3 = it[ii] + pe0;
                //#print("it ", it[ii], " fact3 ", fact3);
                sum1 = sum1 + comp[j]*it[ii]/fact3;
                sum2 = sum2 + comp[j]*it[ii]/fact3/fact3;
            }
        }
       
        pd = pt + ph2 - pe0;
        dpe = (pd*sum1 - pe0)/(1.0e0 + sum1 + pd*sum2);
        //#print("sum1 ", sum1, " sum2 ", sum2, " pd ", pd);
        pe0 = pe0 + dpe;
        //#print("neit ", neit, " dpe ", dpe, " pe0 ", pe0)
        //#Original FORTRAN go to logic replaced by while condition above
        //#if (neit .le. 15 .AND. dabs(pe0/pt) .gt. 1.0d-20
        //#    .AND. dabs(dpe/pe0) .gt. 1.0e-3) go to 215
    }

    pe = pe0;
    //#print("Final pe0 ", pe0)
    if (Math.abs(pe/pt) < 1.0e-20){
        pe = pt*1.0e-20;
    }
    //#c
    //#c Estimate partial pressures of major atomic species, ie.
    //#c H, C, N, O, S, and Si.
    //#c These are the only initial estimates required if ISOLV=1.
    //#c
    //#c First estimate partial pressure of atomic hydrogen
    //#c
    ihm = it[indx[0][1][0][0][0]];
    var dhm = idel[indx[0][1][0][0][0]];
    terma = (2.0e0 - comph)*dh2/kh2;
    termb = 1.0e0;
    if (pe > 0.0e0){
        //#print("dhp ", dhp, " ihp ", ihp, " dhm ", dhm, " ihm ", ihm, " pe ", pe)
        termb = 1.0e0 + dhp*ihp/pe + dhm*ihm*pe;
    }
    termc = -(pt - pe)*comph;
    rat = 4.0e0*terma*termc/termb/termb;
    omrat = 1.0e0 - rat;
    if (omrat < 0.0e0){
        omrat = 0.0e0;
    }
    //#print("abs(rat) ", abs(rat))
    var ph;
    if (Math.abs(rat) >= 1.0e-10){
        ph = ( (-1.0*termb) + Math.abs(termb)*Math.sqrt(omrat))/2.0e0/terma;
        //#print("terma ", terma, " termb ", termb, " omrat ", omrat, " ph ", ph);
    } else{
        ph = -1.0*termc/termb;
        //#print(" termb ", termb, " termc ", termc, " ph ", ph)
    }
      
    ph2 = dh2*ph*ph/kh2;
    pd = pt + ph2 - pe;
    
    //#c
    //#c Now that Pd, the total fictitious pressure is known, we can
    //#c estimate the partial pressure of the other major
    //#c atomic species C,N,O,Si,S
    //#c
    var jc = iat[indx[1][2][0][0][0]];
    var jn = iat[indx[1][3][0][0][0]];
    var jo = iat[indx[1][4][0][0][0]];
    var jsi = iat[indx[1][12][0][0][0]];
    var js = iat[indx[1][5][0][0][0]];
    var compc = comp[jc];
    var compn = comp[jn];
    var compo = comp[jo];
    var compsi = comp[jsi];
    var comps = comp[js];
    icp = it[indx[2][2][0][0][0]];
    inp = it[indx[2][3][0][0][0]];
    iop = it[indx[2][4][0][0][0]];
    isip = it[indx[2][12][0][0][0]];
    isp = it[indx[2][5][0][0][0]];
    kch = kt[indx[1][2][1][0][0]];
    koh = kt[indx[1][4][1][0][0]];
    knh = kt[indx[1][3][1][0][0]];
    kco = kt[indx[1][4][2][0][0]];
    kn2 = kt[indx[1][3][3][0][0]];
    kh2o = kt[indx[1][4][1][1][0]];
    ksio = kt[indx[1][12][4][0][0]];
    ksis = kt[indx[1][12][5][0][0]];
    //#c   ksih = kt[indx[1][12][1][0][0]];
    khs = kt[indx[1][5][1][0][0]];
    kh2s = kt[indx[1][5][1][1][0]];
    var dcp = idel[indx[2][2][0][0][0]];
    var dnp = idel[indx[2][3][0][0][0]];
    var dop = idel[indx[2][4][0][0][0]];
    var dsip = idel[indx[2][12][0][0][0]];
    var dsp = idel[indx[2][5][0][0][0]];
    var dch = idel[indx[1][2][1][0][0]];
    var doh = idel[indx[1][4][1][0][0]];
    var dnh = idel[indx[1][3][1][0][0]];
    var dco = idel[indx[1][4][2][0][0]];
    var dn2 = idel[indx[1][3][3][0][0]];
    var dh2o = idel[indx[1][4][1][1][0]];
    var dsio = idel[indx[1][12][4][0][0]];
    var dsis = idel[indx[1][12][5][0][0]];
    //#c     dsih = idel[indx[1][12][1][0][0]];
    var dhs = idel[indx[1][5][1][0][0]];
    var dh2s = idel[indx[1][5][1][1][0]];
    ksih = 1.0e0;
    var dsih = 0.0e0;
      
    //#c
    //#c Estimate C and O partial pressures
    //#c
    var fact1 = 1.0e0 + doh*ph/koh + dh2o*ph*ph/kh2o + dop*iop/pe;
    fact2 = 1.0e0 + dch*ph/kch + dcp*icp/pe;
    terma = fact1*dco/kco;
    termb = fact1*fact2 + (compc - compo)*pd*dco/kco;
    termc = -compo*pd*fact2;
    rat = 4.0e0*terma*termc/termb/termb;
    omrat = 1.0e0 - rat;
   
    var po, pc, pn, pnnn, psi; 
    if (omrat < 0.0e0){
        omrat = 0.0e0;
    }
    if (Math.abs(rat) >= 1.0e-10){
        po = (-termb + Math.abs(termb)*Math.sqrt(omrat))/(2.0e0*terma);
    } else{
        if (termb <= 0.0e0){
            po = -termb/terma;
        } else{
            po = -termc/termb;
        }
    }
    
     
    pc = compc*pd/(fact2 + dco*po/kco);

    //#c
    //#c Estimate N partial pressure 
    //#c
    terma = 2.0e0*dn2/kn2;
    termb = 1.0e0 + dnh*ph/knh + dnp*inp/pe;
    termc = -compn*pd;
    pn = compn*pd/termb;
    if ( (dn2 != 0.0e0) && (kn2 < 1.0e6) ){
        pnnn = termb*termb - 4.0e0*terma*termc;
        if (pnnn < 0.0e0){ 
            pnnn = 0.0e0;
        }
        pn = (-termb + Math.sqrt(pnnn))/2.0e0/terma;
    }

    //#c
    //#c Estimate Si and S partial pressures
    //#c
    fact1 = 1.0e0 + dsio*po/ksio + dsih*ph/ksih + dsip*isip/pe;
    fact2 = 1.0e0 + dhs*ph/khs + dh2s*ph*ph/kh2s + dsp*isp/pe;
    terma = fact1*dsis/ksis;
    termb = fact1*fact2 + (comps - compsi)*pd*dsis/ksis;
    termc = -compsi*pd*fact2;
    rat = 4.0e0*terma*termc/termb/termb;
    omrat = 1.0e0 - rat;
    
    if (omrat < 0.0e0){
        omrat = 0.0e0;
    }
    if (Math.abs(rat) >= 1.0e-10){
        psi = (-termb + Math.abs(termb)*Math.sqrt(omrat))/2.0e0/terma;
    } else{
        if (termb <= 0.0e0){
            psi = -termb/terma;
        } else{
            psi = -termc/termb;
        }
    }
    
     
    var ps = comps*pd/(fact2 + dsis*psi/ksis);

    //#c
    //#c Fill array of initial partial pressure estimates for H, C, N, O 
    //#c
    p[jh] = ph;
    p[jc] = pc;
    p[jn] = pn;
    p[jo] = po;
    p[jsi] = psi;
    p[js] = ps;
    
    //#print("jh ", jh, " p[jh] ", p[jh])

    //#c
    //#c Make initial estimates for any other elements to be
    //#c included in linearizaton.
    //#c
    var n, iz;
    var jcl, dclm, dhcl;
    var jsc, dscp, dsco, dsco2;
    var jti, dtip, dtio;
    var jv, dvp, dvo;
    var jy, dyp, dyo, dyo2;
    var jzr, dzrp, dzro, dzro2;

    for (var j99 = 0; j99 < natom; j99++){
        n = indsp[j99];
        if (ipr[n] > 2){
            p[j99] = 0.0e0;
        } else{
            //#iz = zat[0][indsp[j99]]
            iz = zat[0][indsp[j99]]-1;
            
            //#Original FORTRAN "computed go to":
            //#  go to (230, 400, 400, 400, 400, 230, 230, 230, 400, 400,
            //#         400, 400, 400, 230, 400, 230, 317, 400, 400, 400,
            //#         321, 322, 323, 400, 400, 400, 400, 400, 400, 400,
            //#         400, 400, 400, 400, 400, 400, 400, 400, 339, 340), iz

            if ( iz==1 || iz==2 || iz==3 || iz==4
                || iz==8 || iz==9 || iz==10 || iz==11 || iz==12
                || iz==14 || iz==17 || iz==18 || iz==19
                || (iz>=23 && iz<=37) ){
                
                //#c
                //#c Estimate partial pressure of neutral atomic species considering all
                //#c atoms are present only as neutral atoms or singly charged ions.
                //#c Elements for which the above statement is inaccurate
                //#c (eg., molecular association is appreciable) are treated
                //#c separately below. These elements are He,Ne,Cl,Sc,Ti,V,Y,Zr.
                //#c
                
                //#400    
                n = indx[2][itab[iz]][0][0][0];
                p[j99] = pd*comp[j99]/(1.0e0 + idel[n]*it[n]/pe);
                //#go to 230
                
            } else if(iz == 16){
                
                //#c
                //#c Estimate Cl partial pressure 
                //#c
                //#317    
                jcl = iat[indx[1][6][0][0][0]];
                iclm = it[indx[0][6][0][0][0]];
                khcl = kt[indx[1][6][1][0][0]];
                dclm = idel[indx[0][6][0][0][0]];
                dhcl = idel[indx[1][6][1][0][0]];
                p[jcl] = comp[jcl]*pd/(1.0e0 + dhcl*ph/khcl + dclm*iclm*pe);
                //#go to 230
                
//#c
//#c Estimate Sc partial pressure
//#c
//#  321   
            } else if(iz == 20){
                jsc = iat[indx[1][15][0][0][0]];
                iscp = it[indx[2][15][0][0][0]];
                dscp = idel[indx[2][15][0][0][0]];
                ksco = kt[indx[1][15][4][0][0]];
                dsco = idel[indx[1][15][4][0][0]];
                ksco2 = kt[indx[1][15][4][4][0]];
                dsco2 = idel[indx[1][15][4][4][0]];
                p[jsc] = comp[jsc]*pd/(1.0e0 + dsco*po/ksco + dsco2*po*po/ksco2 + dscp*iscp/pe);
                //#go to 230
            //#c
            //#c Estimate Ti partial pressure 
            //#c
  //#322    
            } else if(iz == 21){          
                jti = iat[indx[1][16][0][0][0]];
                itip = it[indx[2][16][0][0][0]];
                dtip = idel[indx[2][16][0][0][0]];
                ktio = kt[indx[1][16][4][0][0]];
                dtio = idel[indx[1][16][4][0][0]];
                p[jti] = comp[jti]*pd/(1.0e0 + dtio*po/ktio + dtip*itip/pe);
                //#go to 230
            //#c
            //#c Estimate V partial pressure 
            //#c
  //#323    
            } else if(iz == 21){          
                jv = iat[indx[1][17][0][0][0]];
                ivp = it[indx[2][17][0][0][0]];
                dvp = idel[indx[2][17][0][0][0]];
                kvo = kt[indx[1][17][4][0][0]];
                dvo = idel[indx[1][17][4][0][0]];
                p[jv] = comp[jv]*pd/(1.0e0 + dvo*po/kvo + dvp*ivp/pe);
                //#go to 230
            //#c
            //#c Estimate Y partial pressure
            //#c
  //#339    
            } else if(iz == 38){          
                jy = iat[indx[1][24][0][0][0]];
                iyp = it[indx[2][24][0][0][0]];
                dyp = idel[indx[2][24][0][0][0]];
                kyo = kt[indx[1][24][4][0][0]];
                dyo = idel[indx[1][24][4][0][0]];
                kyo2 = kt[indx[1][24][4][4][0]];
                dyo2 = idel[indx[1][24][4][4][0]];
                p[jy] = comp[jy]*pd/(1.0e0 + dyo*po/kyo + dyo2*po*po/kyo2 + dyp*iyp/pe);
                //#go to 230
                
                //#c
                //#c Estimate Zr partial pressure
                //#c
  //#340    
            } else if(iz == 39){     
                jzr = iat[indx[1][25][0][0][0]];
                izrp = it[indx[2][25][0][0][0]];
                dzrp = idel[indx[2][25][0][0][0]];
                kzro = kt[indx[1][25][4][0][0]];
                dzro = idel[indx[1][25][4][0][0]];
                kzro2 = kt[indx[1][25][4][4][0]];
                dzro2 = idel[indx[1][25][4][4][0]];
                p[jzr] = comp[jzr]*pd/(1.0e0 + dzro*po/kzro + dzro2*po*po/kzro2 + dzrp*izrp/pe);
            }

       } // ipr[n] <= 2 else clause
    } //j99 loop

    if (isolv == 0){
        //#neq = 1;
        neq = 1 + 1;
    } else if (isolv == 1){
        neq = nlin1 + 2;
        //#neq = nlin1 + 2 + 1;
    } else if (isolv == 2){
        neq = nlin2 + 1;
        //#neq = nlin2 + 1 + 1;
    }
        
//    #print("GasEst: isolv ", isolv, " nlin2 ", nlin2, " neq ", neq)
//#Try returning a tuple:
    //return pe, p, neq
   //public static int neq;
   //public static double pe;
   //public static double[] p = new double[40];
 
   //pack up the main variables to be Returned - sigh!
   //
   var returnStruc = [];
   returnStruc.length = 42;
   returnStruc[0] = 1.0*neq;
   returnStruc[1] = pe;
   for (var k99 = 2; k99 < 42; k99++){
      returnStruc[k99] = p[k99-2];
   }
   
    return returnStruc;

  }; //end method gasest()

