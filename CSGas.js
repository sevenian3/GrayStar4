/*# -*- coding: utf-8 -*-
"""
Created on Thu May  2 10:00:46 2019

@author: Philip D. Bennett
Port from FORTRAN to Python: Ian Short
"""

"""
This is the main source file for GAS.

"""
*/

/*
 * The openStar project: stellar atmospheres and spectra
 *
 * ChromaStarPy/GAS
 *
 * Version 2019-05-02
 * Use date based versioning with ISO 8601 date (YYYY-MM-DD)
 *
 * May 2019
 * 
 * C. Ian Short
 * Philip D. Bennett
 *
 * Saint Mary's University
 * Department of Astronomy and Physics
 * Institute for Computational Astrophysics (ICA)
 * Halifax, NS, Canada
 *  * ian.short@smu.ca
 * www.ap.smu.ca/~ishort/
 *
 *
 * Ported from FORTRAN77
 *
 *
 * Code provided "as is" - there is no formal support 
 *
 */


/*
 * The MIT License (MIT)
 * Copyright (c) 2019 C. Ian Short 
 *
 * Permission is hereby granted, free of charge, to any person 
 obtaining a copy of this software and associated documentation 
 files (the "Software"), to deal in the Software without 
 restriction, including without limitation the rights to use, 
 copy, modify, merge, publish, distribute, sublicense, and/or 
 sell copies of the Software, and to permit persons to whom the 
 Software is furnished to do so, subject to the following 
 conditions:
 *
 * The above copyright notice and this permission notice shall 
 be included in all copies or substantial portions of the 
 Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY 
 KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE 
 WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE 
 AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR 
 OTHER DEALINGS IN THE SOFTWARE.
*
 */


//#from decimal import Decimal as D

//#plotting:
//#import matplotlib
//#import matplotlib.pyplot as plt
//#%matplotlib inline
//import math
//import numpy
//#from scipy.linalg.blas import daxpy
//#from scipy.linalg.blas import ddot
//#from scipy.linalg.blas import dscal
//#from scipy.linalg.blas import idamax

//from Documents.ChromaStarPy.GAS.linpack.Dgesl import dgesl
//from Documents.ChromaStarPy.GAS.linpack.Dgefa import dgefa

//#from Documents.ChromaStarPy.GAS.blas.Daxpy import daxpy
//#from Documents.ChromaStarPy.GAS.blas.Ddot import ddot
//#from Documents.ChromaStarPy.GAS.blas.Dscal import dscal
//#from Documents.ChromaStarPy.GAS.blas.Idamax import idamax
 
//#from Documents.ChromaStarPy.GAS.BlockData import *
//#from Documents.ChromaStarPy.GAS.GsRead2 import 
//import BlockData
//#import GsRead
//import GsRead2

/*      
    var kbol = CSGasInit.kbol;
    var hmass = CSGasInit.hmass;
    var t0 = CSGasInit.t0;
//#c
      
    var  ip = ChromaStarGasServer.ip;
    var  comp = ChromaStarGasServer.comp;
    var  awt = ChromaStarGasServer.awt;
    
    var  itab = CSGasInit.itab;
    var  indx = ChromaStarGasServer.indx;

    var  name = ChromaStarGasServer.name;
    
    var print0 = CSGasInit.print0;
    var iprint = CSGasInit.iprint;
     
    var  ipr = ChromaStarGasServer.ipr;
    var  nch = ChromaStarGasServer.nch;
    var  nel = ChromaStarGasServer.nel;
    var  ntot = ChromaStarGasServer.ntot;
    var  nat = ChromaStarGasServer.nat;
    var  zat = ChromaStarGasServer.zat;
    var  neut = ChromaStarGasServer.neut;
    var  indsp = ChromaStarGasServer.indsp;
    var  indzat = ChromaStarGasServer.indzat;
    var  iat = ChromaStarGasServer.iat;
    var  natsp = ChromaStarGasServer.natsp;
    var  iatsp = ChromaStarGasServer.iatsp;
//#c
      
    var  lin1 = ChromaStarGasServer.lin1;
    var  lin2 = ChromaStarGasServer.lin2;
    var  linv1 = ChromaStarGasServer.linv1;
    var  linv2 = ChromaStarGasServer.linv2;
    
    var nlin1 = ChromaStarGasServer.nlin1;
    var nlin2 = ChromaStarGasServer.nlin2;
//#c
    var  type0 = ChromaStarGasServer.type0;
    
//#c
    var  ixn = ChromaStarGasServer.ixn;
    var nix = CSGasInit.nix;
    
    var natom = ChromaStarGasServer.natom;
    var nspec = ChromaStarGasServer.nspec;
    
    var  logk = ChromaStarGasServer.logk;
    var  logwt = ChromaStarGasServer.logwt;
*/

// Main variables to be prepared for ChromaStarGasPy() 
// (or other callin g program):

/* No!
 //return a, ngit, pe, pd, pp, ppix, gmu, rho
   public static double pe;
   public static double rho;
   public static double gmu;
   public static double[] pp = new double[150];
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

    

var gas = function(isolv, temp, pt, pe0, p0, neq, tol, maxit){

//console.log("Gas called!");
//, outFile):

/*    
    #Returned structure
    # a, ngit, pe, pd, pp, ppix, gmu, rho
    
    #c cis: parameter tol is argument GTOL
    #c cis: parameter * is argument PRINT - !!??
    #c cis: INPUT: ISOLV,T,P, PE0,P0,NEQ, GTOL,MAXGIT, PRINT (??)
    #c cis: OUTPUT: A, NGIT, PE,PD,PP,PPIX,GMU,RHO (??)
    #c
    #c GAS: Calculates the equilibrium abundances of each molecular and ionic
    #c species specified in "gsread", at the given temperature T and
    #c pressure P.
    #c
*/
 
/*   
    #FORTRAN commons - needed
    #common /consts/ pi,sbcon,kbol,cvel,gcon,hpl,hmass,t0,everg
    #common /gasp/ name,ip,comp,awt,nspec,natom,itab,ntab,indx,
     #    iprint,gsinit,print1
    #common /gasp2/ ipr,nch,nel,ntot,nat,zat,neut,idel,indsp,
     #    indzat,iat,natsp,iatsp
    #common /lin/ nlin1,lin1,linv1,nlin2,lin2,linv2
    #common /equil/ logk,logwt,it,kt,type
    #common /opacty/ chix,nix,nopac,ixa,ixn,opinit,opflag,opchar,iopt
*/

/*    
    #Try this:
    #global pi, sbcon, kbol, cvel, gcon, hpl, hmass, t0, everg # /consts/
    global kbol, hmass, t0 # /consts/
    global name, ip, comp, awt, nspec, natom, itab, ntab, indx, iprint, gsinit, print0 #/gasp/
    global ipr, nch, nel, ntot, nat, zat, neut, idel, indsp, indzat, iat, natsp, iatsp #/gasp2/
    global nlin1, lin1, linv1, nlin2, lin2, linv2 #/lin/
    global logk, logwt, it, kt, type0 #equil
    #global chix, nix, nopac, ixa, ixn, opinit, opflag, opchar, iopt #/opacty/
    global chix, nix, ixa, ixn  #/opacty/
*/    
//#c
    var outString="";
/*      
    kbol = BlockData.kbol
    hmass = BlockData.hmass
    t0 = BlockData.t0
//#c
      
    ip = GsRead2.ip
    comp = GsRead2.comp
    awt = GsRead2.awt
    
    itab = BlockData.itab
    indx = GsRead2.indx

    name = GsRead2.name
    
    print0 = BlockData.print0
    iprint = GsRead2.iprint
     
    ipr = GsRead2.ipr
    nch = GsRead2.nch
    nel = GsRead2.nel
    ntot = GsRead2.ntot
    nat = GsRead2.nat
    zat = GsRead2.zat
    neut = GsRead2.neut
    indsp = GsRead2.indsp
    indzat = GsRead2.indzat
    iat = GsRead2.iat
    natsp = GsRead2.natsp
    iatsp = GsRead2.iatsp
//#c
      
    lin1 = GsRead2.lin1
    lin2 = GsRead2.lin2
    linv1 = GsRead2.linv1
    linv2 = GsRead2.linv2
    
    nlin1 = GsRead2.nlin1
    nlin2 = GsRead2.nlin2
//#c
    type0 = GsRead2.type0
    
//#c
    ixn = GsRead2.ixn
    nix = BlockData.nix
    
    natom = GsRead2.natom
    nspec = GsRead2.nspec
    
    logk = GsRead2.logk
    logwt = GsRead2.logwt
*/
// Main variables to be prepared for ChromaStarGasPy() 
// (or other calling program):

   var pe;
   var rho;
   var gmu;
   var  pp = [];
   pp.length = 150;
//initialize:
for (var i = 0; i < 150; i++){
    pp[i] = 0.0;
}

    var  dgefaReturn = [];
    dgefaReturn.length = neq+2;
    for (var i = 0; i < neq+2; i++){
       dgefaReturn[i] = [];
       dgefaReturn[i].length = neq;
    }
    //int[] ipvt = new int[neq];
 
    var  it = [];
    it.length = 150;
    var  kt = [];
    kt.length = 150;
//initialize:
for (var i = 0; i < 150; i++){
    it[i] = 0.0;
    kt[i] = 0.0;
}

    //#ixa = [ [0 for i in range(70)] for j in range(5) ]
    //#chix = [' ' for i in range(70)]
    //#opchar = [' ' for i in range(25)]
    //#opflag = [False for i in range(25)]
    //#opinit = False    
//#c
    //#print("GAS: neq ", neq, " nlin1 ", nlin1, " nlin2 ", nlin2)
    
    //#p0 = [0.0e0 for i in range(40)]
    var  a = [];
    a.length = neq;
    for (var i = 0; i < neq; i++){
       a[i] = [];
       a[i].length = neq;
    }
    var  b = [];
    b.length = 40;
    var  p = [];
    p.length = 40;
//initialize:
for (var i = 0; i < 40; i++){
    b[i] = 0.0;
    p[i] = 0.0;
}
    //double[] pp = new double[150];
    var  pp0 = [];
    pp0.length = 150;
//initialize:
for (var i = 0; i < 150; i++){
    pp0[i] = 0.0;
}
    var  al = [];
    al.length = 25;
    for (var i = 0; i < 25; i++){
       al[i] = 0.0;
    }
    var  ppix = [];
    ppix.length = 70;
    for (var i = 0; i < 70; i++){
       ppix[i] = 0.0;
    }
    var nd = 0.0e0;
    var logt = 0.0e0;
    var logit = 0.0e0;
    var logkt = 0.0e0;
   
    var namet = "";
    var namemx = "";

    var  iperm = [];
    iperm.length = 180;
    var info;
       
    var metals = "Z";
    var ename = "e-";
    var blank = " ";
    var rhs = "rhs";
    var job = 0;
    
    //#c
    //#c Calculate equilibrium constants for each species in table.
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
        
        ityp = type0[n99];
        nq = nch[n99];
        ich = isign(1, nq);
        
        if (ityp == 3 || ityp == 4){
            
            kt[n99] = kt[neut[n99]];
            if ( ((nch[n99] - nch[n99-1]) != ich) || (nch[n99-1] == 0) ){
                logit = 0.0e0;
            }
            logit = logit + ich*(-th*ip[n99] + logt + logwt[n99] - 0.48e0);
            it[n99] = ten(logit);
        } else if (ityp == 2){
            logkt = ( ((logk[4][n99]*th + logk[3][n99])*th + logk[2][n99])*th + logk[1][n99] )*th + logk[0][n99];
            kt[n99] = ten(logkt);
            it[n99] = 1.0e0;
        } else{
            kt[n99] = 1.0e0;
            it[n99] = 1.0e0;
        }
    }
//#c
//#c Update main arrays 
//#c
    pe = pe0;
    //System.out.println("pe0 "+ pe0);
    for (var j99 = 0; j99 < natom; j99++){
        p[j99] = p0[j99];
        //console.log("j99 ", j99, " p0 ", p0[j99]);
    }

    var ngit = 0;
    namemx = blank;
    var delmax = 0.0e0;
   var nn, nnp, nlin, nelt, neq1, nsp;
   var ii, j, jj, kk, jjj, kkk, n, np;
    var pf, pn, penq, at;
    var sum1, sum2, fact;
    var compz, pzs, pzsrat, pnew, penew, pznew, dp, dpe, delp, delpe, dpz, delpz;
    var pd, pu, ptot, ppt, pfp, psp, pq, dpq, dptot, pdtot, pf0, denom;

    compz = 0.0e0;
    pzs = 0.0e0;
    j = 0;
    jj = 0;
    
    if (isolv != 0){
        
        if (isolv == 1){
        
            compz = 0.0e0;
            pzs = 0.0e0;
            
            for (var j99 = 0; j99 < natom; j99++){

                nn = indsp[j99];
                if (ipr[nn] == 2){
                
                    nnp = indx[2][itab[zat[0][nn]-1]][0][0][0];
                    compz = compz + comp[j99];
                    
                    if (pe > 0.0e0){
                        pzs = pzs + (1.0e0 + it[nnp]/pe) * p[j99];
                    } else{
                        pzs = pzs + p[j99];
                    }
                }
            }
        }
             
        //#print("print0 ", print0)
        if (print0){
            
            //#print("T ", "P ", t, pt)
            
            if (isolv == 1){
                
                console.log("0 #  Name     Delmax   ");
                for (var k99 = 0; k99 < nlin1; k99++){
                    console.log(nameGs[indsp[linv1[k99]]]);
                }
                console.log("ngit "+ "namemx "+ "delmax "+ " " + ngit+ " " + namemx+ " " + delmax);
                for (var k99 = 0; k99 < nlin1; k99++){
                    console.log(p[linv1[k99]]);
                }
                    
            } else if (isolv == 2){
                
                console.log("0 #  Name     Delmax   ");
                for (var k99 = 0; k99 < nlin2; k99++){
                    console.log(nameGs[indsp[linv2[k99]]]);
                }
                console.log("ngit "+ "namemx "+ "delmax "+ ngit+ " " + namemx+ " " + delmax);
                for (var k99 = 0; k99 < nlin2; k99++){
                    console.log(p[linv2[k99]]);
                }
            }
        
        }
        /*"""        
        c
        c Main loop: fill linearized coefficient matrix and rhs vector, and
        c solve system for partial pressure corrections. 
        c ISOLV = 1: Linearize only the partial pressures of the neutral atoms
        c for which IPR(j) = 1 (major species). The electron pressure Pe is
        c assumed to be given in this case, and so is not included in the
        c linearization. this is necessary since most of these electrons
        c (at cool temps.) originate from elements not considered in the
        c linearization. In order to obtain a good value for Pe in the first
        c place, it is necessary to call GAS with ISOLV = 2.
        c ISOLV = 2: This linearizes the partial pressures of the neutraL atoms
        c for which IPR(j) = 1 OR 2. This list of elements should include all
        c the significant contributors to the total pressure Pt, as well as the
        c electon pressure Pe. Any element (IPR(j) = 3) not included is assumed
        c to have a negligible effect on both P and Pe.
        c In both cases, the partial pressures of the neutral atoms for elements
        c not included in the linearization are calculated directly from the now
        c determined pressures of the linearized elements.
        c
        """*/
    
        //#316   
        var firstTime = true;
        
        while( (delmax > tol) || (firstTime == true) ){
            
            firstTime = false;
        
            if (ngit >= maxit){
                console.log(" *15 Error: Too many iterations in routine GAS");
                console.log(" for Isolv, T, P, Pe0= ");
                console.log(isolv+ " " +  t + " " +  pt + " " +  pe0);
                //#return 1
            }
        
            ngit = ngit + 1;
    
        //#c
        //#c Zero coefficient matrix and rhs vector
        //#c
            if (isolv == 1){
                nlin = nlin1;
            } else if (isolv == 2){
                nlin = nlin2;
            }

            for (var jj99 = 0; jj99 < neq; jj99++){
                for (var j99 = 0; j99 < neq; j99++){

                    a[j99][jj99] = 0.0e0;
                }

                b[jj99] = 0.0e0;
            }

            if (isolv == 2){
        
                //#c
                //#c Here the isolv = 2 case is handled. This includes linearization of Pe.
                //#c
        
                //#a[neq][neq] = -1.0e0
                a[neq-1][neq-1] = -1.0e0;
                b[0] = pt;
                //#b[neq] = pe
                b[neq-1] = pe;
        
                for (var n99 = 0; n99 < nspec; n99++){
            
                    if (ipr[n99] <= 2){
                
                        nq = nch[n99];
                        pf = 1.0e0;
                        nelt = nel[n99];
                
                        for (var i99 = 0; i99 < nelt; i99++){
                            j = indzat[zat[i99][n99]-1];
                            pf = pf * Math.pow(p[j], nat[i99][n99]);
                        }

                        penq = 1.0e0;
                        if (pe > 0.0e0){
                            penq = Math.pow(pe, nq);
                        }
                        pn = it[n99]*pf/kt[n99]/penq;

                        //#c
                        //#c Now fill the matrix and rhs vector of linearized equations
                        //#c

                        for (var i99 = 0; i99 < nelt; i99++){
                            jj = indzat[zat[i99][n99]-1];
                            at = pn*nat[i99][n99]/p[jj];
                            kk = lin2[jj];
                    
                            //#if (kk == 0):
                            if (kk < 0){    
                                console.log(" *16 Error: Inconsistency in priority "+ "tables");
                                console.log(" for Isolv, T, P, Pe0= ");
                                console.log(isolv + " " + t + " " + pt + " " + pe0);
                                //#return 1
                            }
                            a[0][kk] = a[0][kk] + (nq + 1)*at;
                            //#print("n ", n, " i ", i, " jj ", jj, " kk ", kk)
                            //#print("zat ", zat[i][n]-1, " nat ", nat[i][n], " p ", p[jj], " at ", at, " nq ", nq)
                            //#print("a ", a[0][kk])
                            if (nlin2 >= 1){    
                                //#for k in range(1, nlin2+1):
                                for (var k99 = 1; k99 < nlin2; k99++){    
                                    j = linv2[k99];
                                    a[k99][kk] = a[k99][kk] + comp[j]*ntot[n99]*at;
                                    //#print("n ", n, " k ", k, " j ", j, " comp ", comp[j], " ntot ", ntot[n], " at ", at)
                                    //#print("a ", a[k][kk]);
                                }
                            }
                            
                            for (var ii99 = 0; ii99 < nelt; ii99++){
                                jjj = indzat[zat[ii99][n99]-1];
                                kkk = lin2[jjj];
                                if (kkk != 0){
                                    a[kkk][kk] = a[kkk][kk] - nat[ii99][n99]*at;
                                    //#print("n ", n, " kk ", kk, " ii ", ii, " jjj ", jjj, " kkk ", kkk, " nat ", nat[ii][n], " at ", at)
                                    //#print("a ", a[kkk][kk]);
                                }
                            }
                            //#a[neq][kk] = a[neq][kk] + nq*at
                            a[neq-1][kk] = a[neq-1][kk] + nq*at;

                        }                            
                        at = 0.0e0;
                        if (pe > 0.0e0){
                            at = nq*pn/pe;
                        }
                        a[0][neq-1] = a[0][neq-1] - (nq + 1)*at;
                        b[0] = b[0] - (nq + 1)*pn;
                
                        if (nlin2 >= 1){
                            //#for k in range(1, nlin2+1):
                            for (var k99 = 1; k99 < nlin2; k99++){    
                                j = linv2[k99];
                                a[k99][neq-1] = a[k99][neq-1] - comp[j]*ntot[n99]*at;
                                b[k99] = b[k99] - comp[j]*ntot[n99]*pn;
                                //#print("b ", b[k]);
                            }
                        }

                        for (var ii99 = 0; ii99 < nelt; ii99++){
                            jjj = indzat[zat[ii99][n99]-1];
                            kkk = lin2[jjj];
                    
                            if (kkk != 0){
                                a[kkk][neq-1] = a[kkk][neq-1] + nat[ii99][n99]*at;
                                b[kkk] = b[kkk] + nat[ii99][n99]*pn;
                                //#print("b ", b[kkk]);
                            }

                        }

                        //#a[neq][neq] = a[neq][neq] - nq*at
                        a[neq-1][neq-1] = a[neq-1][neq-1] - nq*at;
                        b[neq-1] = b[neq-1] - nq*pn;
                        //#print("a ", a[neq-1][neq-1], " b ", b[neq-1])
                    }
                } 
            } else{
        
                //#c
                //#c Here the isolv = 1 case is treated. the electron pressure Pe
                //#c is assumed gven and is not included in the linearization. 
                //#c
                //#print("******  isolve ne 2 brnach! isolv ", isolv)
                sum1 = 0.0e0;
                sum2 = 0.0e0;
        
                for (var j99 = 0; j99 < natom; j99++){
                    nn = indsp[j99];
                    //#print("j ", j, " nn ", nn)
                    if (ipr[nn] == 2){
                        nnp = indx[2][itab[zat[0][nn]-1]][0][0][0];
                        //#print("zat ", zat[0][nn]-1, " itab ", itab[zat[0][nn]-1],\
                        //#     " nnp ", nnp)
                        fact = it[nnp] + pe;
                        sum1 = sum1 + comp[j99]*it[nnp]/fact;
                        sum2 = sum2 + comp[j99]*it[nnp]/fact/fact;
                        //#print("comp ", comp[j], " it ", it[nnp],
                        //#      " fact ", fact, " sum1 ", sum1)
                    }
                }
 
                b[0] = pt - pzs - pe;
                a[0][nlin1] = 1.0e0;
                a[0][nlin1+1] = 1.0e0;
                //#print("pt ", pt, " pzs ", pzs, " pe ", pe)
                //#print("nlin1 ", nlin1, " b[0] ", b[0], " a[0][] ", a[0][nlin1+1], a[0][nlin1+2])
        
                if (nlin1 >= 1){
                    //#for k in range(1, nlin1+1):
                    for (var k99 = 1; k99 < nlin1; k99++){    
                        j = linv1[k99];
                        a[k99][nlin1] = comp[j];
                        b[k99] = -1.0*comp[j]*pzs;
                        //#print("k ", k, " j ", j, " comp ", comp[j], " a () ", a[k][nlin1+1])
                    }
                }

                pzsrat = 0.0e0;
                if (compz > 0.0e0){
                    pzsrat = pzs/compz;
                }
                a[nlin1][nlin1] = compz - 1.0e0;
                b[nlin1] = (1.0e0 - compz)*pzs;
                a[nlin1+1][nlin1] = 0.0e0;
                if (compz > 0.0e0){
                    a[nlin1+1][nlin1] = sum1/compz;
                }
                a[nlin1+1][nlin1+1] = -1.0e0 - sum2*pzsrat;
                b[nlin1+1] = pe - sum1*pzsrat;
                //#print("compz ", compz, " sum1 ", sum1, " sum2 ", sum2,\
                //#      " pzsrat ", pzsrat)
                //#print("nlin1+1 ", nlin1+1, " nlin1+2 ", nlin1+2)
                //#print("a(nlin1+1,nlin1+1) ", a[nlin1+1][nlin1+1],\
                //#      " b(nlin1+1) ", b[nlin1+1],\
                //#      " a(nlin1+2,nlin1+1) ", a[nlin1+2][nlin1+1],\
                //#      " a(nlin1+2,nlin1+2) ", a[nlin1+2][nlin1+2],\
                //#      " b(nlin1+2) ", b[nlin1+2])
                

                for (var n99 = 0; n99 < nspec; n99++){
            
                    if (ipr[n99] <= 1){
                
                        nq = nch[n99];
                        pf = 1.0e0;
                        nelt = nel[n99];
                
                        for (var i99 = 0; i99 < nelt; i99++){
                            j = indzat[zat[i99][n99]-1];
                            pf = pf * Math.pow(p[j], nat[i99][n99]);
                        }

                        penq = 1.0e0;
                        if (pe > 0.0e0){
                            penq = Math.pow(pe, nq);
                        }
                        pn = it[n99]*pf/kt[n99]/penq;
                
                        //#c
                        //#c Fill the coefficient matrix and rhs vector of linearized eqns
                        //#c

                        for (var i99 = 0; i99 < nelt; i99++){
                            jj = indzat[zat[i99][n99]-1];
                            //#print("GAS: n ", n, " name ", nameGs[n], " i ", i," jj ", jj, " p ", p[jj])
                            at = pn*nat[i99][n99]/p[jj];
                            kk = lin1[jj];
                            //#print("i ", i, " jj ", jj, " kk ", kk, " at ", at)
                            //#if (kk == 0):
                            if (kk < 0){
                                console.log(" *17 Error: Inconsistency in priority tables");
                                console.log(" for Isolv, T, P, Pe0 = " + isolv + " " + t + " " + pt + " " + pe0);
                                //#return 1
                            }
                        
                            //#print("Before: n ", n, " i ", i, " kk ", kk, " a[0][kk] ", a[0][kk])
                            a[0][kk] = a[0][kk] + at;
                            //#print("a[0][kk] ", a[0][kk])
                            //#print("n ", n, " ntot[n] ", ntot[n])
                            if (nlin1 >= 1){
                                //#for k in range(1,nlin1+1):
                                for (var k = 1; k < nlin1; k++){
                                    j = linv1[k];
                                    a[k][kk] = a[k][kk] + comp[j]*ntot[n99]*at;
                                }
                            }

                            for (var ii99 = 0; ii99 < nelt; ii99++){
                                jjj = indzat[zat[ii99][n99]-1];
                                kkk = lin1[jjj];
                                if (kkk != 0){
                                    a[kkk][kk] = a[kkk][kk] - nat[ii99][n99]*at;
                                }
                            }

                            a[nlin1][kk] = a[nlin1][kk] + compz*ntot[n99]*at;
                            a[nlin1+1][kk] = a[nlin1+1][kk] + nq*at;
               
                        }
 
                        at = 0.0e0;
                        if (pe > 0.0e0){ 
                            at = nq*pn/pe;
                        }
                        a[0][nlin1+1] = a[0][nlin1+1] - at;
                        b[0] = b[0] - pn;
                
                        if (nlin1 >= 1){
                            //#for k in range(1, nlin1+1):
                            for (var k99 = 1; k99 < nlin1; k99++){    
                                j = linv1[k99];
                                a[k99][nlin1+1] = a[k99][nlin1+1] - comp[j]*ntot[n99]*at;
                                b[k99] = b[k99] - comp[j]*ntot[n99]*pn;
                            }
                        }
                        
                        for (var ii99 = 0; ii99 < nelt; ii99++){
                            jjj = indzat[zat[ii99][n99]-1];
                            kkk = lin1[jjj];
                            if (kkk != 0){
                                a[kkk][nlin1+1] = a[kkk][nlin1+1] + nat[ii99][n99]*at;
                                b[kkk] = b[kkk] + nat[ii99][n99]*pn;
                            }
                        }

                        a[nlin1][nlin1+1] = a[nlin1][nlin1+1] - compz*ntot[n99]*at;
                        b[nlin1] = b[nlin1] - compz*ntot[n99]*pn;
                        a[nlin1+1][nlin1+1] = a[nlin1+1][nlin1+1] - nq*at;
                        b[nlin1+1] = b[nlin1+1] - nq*pn;

                    }
                }
            } 
            if (print0){
                
                console.log("0 Log of coefficient matrix at iteration # "+ ngit);
                if (isolv == 1){ 
                    for (var k99 = 0; k99 < nlin1; k99++){
                        console.log(nameGs[indsp[linv1[k99]]]);
                    }
                    console.log(metals + " " + ename + " " + rhs);
                }
                if (isolv == 2){
                    //#       (nameGs(indsp(linv2(k))),k = 1,nlin2),ename,rhs
                    for (var k99 = 0; k99 < nlin2; k99++){
                        console.log(nameGs[indsp[linv2[k99]]]);
                    }
                    console.log(ename + " " + rhs);
                }
            
                console.log(" ");
                
                neq1 = neq + 1;
          
                for (var i99 = 0; i99 < neq; i99++){            
                    for (var j99 = 0; j99 < neq; j99++){ 
                        al[j99] = Math.log10(Math.abs(a[j99][i99]) + 1.0e-70);
                    }
                    al[neq1] = Math.log10(Math.abs(b[i99]) + 1.0e-70);
                    if (isolv == 1){
                        if (i99 <= nlin1){
                            namet = nameGs[indsp[linv1[i99]]];
                        }
                        if (i99 == nlin1+1){
                            namet = metals;
                        }
                        if (i99 == nlin1+2){ 
                            namet = ename;
                        }
                    } 
                    if (isolv == 2){
                        if (i99 <= nlin2){
                            namet = nameGs[indsp[linv2[i99]]];
                        }
                        if (i99 == nlin2+1){
                            namet = ename;
                        }
                    }
           
                    //#print('(" ")', namet)
                    //#for j in range(neq1):
                    //    #print(al[j])
               }
                //#print('(" ")')
            }
 
            //#c
            //#c Now solve the linearized equations.
            //#c
            //#FORTRAN subroutine dgefa(a, neq, neq, iperm, info)
            //#pythonized dgefa returns a tuple:
            //#print("Before dgefa, a is:")
            //#for idum in range(neq):
            //    #print("idum ", idum, [a[idum][jdum] for jdum in range(neq)])
            //#print("b ", [b[kk] for kk in range(neq)])

            //System.out.println("Dgefa 1: neq "+ neq);
            //for (int k99 = 0; k99 < neq; k99++){
            //    for (int j99 = 0; j99 < neq; j99++){
            //        System.out.println("k99 "+ k99+ " j99 "+ j99+ " a "+ a[k99][j99]);
            //    }
            //}
            dgefaReturn = dgefa(a, neq, neq);
            //Dgefa.dgefa(a, neq, neq);
            //a = dgefaReturn[0];
            //iperm = dgefaReturn[1];
            //info = dgefaReturn[2];
            //a = Dgefa.a;
            //iperm = Dgefa.iperm;

            //Unpack "super-thing" returned by Dgefa - sigh!
            for (var j99 = 0; j99 < neq; j99++){
               for (var k99 = 0; k99 < neq; k99++){
                   a[j99][k99] = dgefaReturn[j99][k99];
               }
               iperm[j99] = dgefaReturn[neq][j99];
            }

            info = dgefaReturn[neq+1][0];

            //info = Dgefa.info;
            //System.out.println("Dgefa 2: info "+ info);
            //for (int k99 = 0; k99 < neq; k99++){
            //    System.out.println("k99 "+ k99+ " iperm "+ iperm[k99]);
            //    for (int j99 = 0; j99 < neq; j99++){
            //        System.out.println("k99 "+ k99+ " j99 "+ j99+ " a "+ a[k99][j99]);
            //    }
            //}
            
            //#print("After dgefa, a is:")
            //#for idum in range(neq):
            //    #print("idum ", idum, [a[idum][jdum] for jdum in range(neq)])
            //#print("b ", [b[kk] for kk in range(neq)])
            //#print("iperm ", [iperm[kk] for kk in range(neq)])
            //#print("info ", info, " iperm ", iperm)
            

            if (info != 0){
                console.log(" Info =  returned from DGEFA in GAS "+ info);
            }
            //#return 1
        
            //#Fortanized call call dgesl(a,neq,neq,iperm,b,job)
            //#print("Before ddgesl, b is:")
            //#print("b ", b)
            //System.out.println("Dgesl: neq "+ neq+ " job "+ job);
            //for (int k99 = 0; k99 < neq; k99++){
            //    System.out.println("k99 "+ k99+ " iperm "+ iperm[k99]+ " b "+ b[k99]);
            //    for (int j99 = 0; j99 < neq; j99++){
            //        System.out.println("k99 "+ k99+ " j99 "+ j99+ " a "+ a[k99][j99]);
            //    }
            //}
            b = dgesl(a, neq, neq, iperm, b, job);
            //System.out.println("After Dgesl");
            //for (int k99 = 0; k99 < neq; k99++){
            //    System.out.println("k99 "+ k99+ " b "+ b[k99]);
            //}
            //#print("After dgesl, a is:")
            //#for idum in range(neq):
            //    #print("idum ", idum, [a[idum][jdum] for jdum in range(neq)])
            //#print("b ", [b[kk] for kk in range(neq)])
            //#print("iperm ", [iperm[kk] for kk in range(neq)])            
            
            //#print("After ddgesl, b is:")
            //#print("b ", b)            
            delmax = 0.0e0;
        
            //#c
            //#c First, update the partial pressures for the major species by adding
            //#c the pressure corrections obtained for each atom from the linearization
            //#c procedure.
            //#c
            for (var k99 = 0; k99 < nlin1; k99++){
                if (isolv == 1){ 
                    j = linv1[k99];
                }
                if (isolv == 2){
                    j = linv2[k99];
                }
                n = indsp[j];
                pnew = p[j] + b[k99];
                if (pnew < 0.0e0){
                    pnew = Math.abs(pnew);
                }
                dp = pnew - p[j];
                //#print("GAS: k ", k, " j ", j, " n ", n,\
                //#      " b ", b[k], " pnew ", pnew, " p ", p[j], " dp ", dp)
                p[j] = pnew;
               //if ( (j >= 47) && (j <= 52) ){
                //console.log("j ", j, " p ", p[j]);
               //}
                if (Math.abs(p[j]/pt) >= 1.0e-15){
                    delp = Math.abs(dp/p[j]);
                    if (delp > delmax){
                        namemx = nameGs[n];
                        delmax = delp;
                    }
                }
            }
         
            if (isolv == 2){
            
                penew = pe + b[nlin2];
                if (penew < 0.0e0){
                    penew = Math.abs(penew);
                }
                dpe = penew - pe;
                pe = penew;
                //System.out.println("penew " + penew);
                if (Math.abs(pe/pt) >= 1.0e-15){
                    delpe = Math.abs(dpe/pe);
                    if (delpe > delmax){
                        namemx = ename;
                        delmax = delpe;
                    }
                } 
          
            } else if (isolv == 1){
        
                pznew = pzs + b[nlin1];
                if (pznew < 0.0e0){ 
                    pznew = Math.abs(pznew);
                }
                dpz = pznew - pzs;
                pzs = pznew;
                if (Math.abs(pzs/pt) >= 1.0e-15){
                    delpz = Math.abs(dpz/pzs);
                    if (delpz > delmax){
                        namemx = metals;
                        delmax = delpz;
                    }
                }

                penew = pe + b[nlin1+1];
                //System.out.println("nlin1 " + nlin1 + " b " + b[nlin1+1]); 
                if (penew < 0.0e0){ 
                    penew = Math.abs(penew);
                }
                dpe = penew - pe;
                pe = penew;
                //System.out.println("penew " + penew);
                if (Math.abs(pe/pt) >= 1.0e-15){
                    delpe = Math.abs(dpe/pe);
                    if (delpe > delmax){
                        namemx = ename;
                        delmax = delpe;
                    }
                }

            }

            //#c
            //#c Print out summary line  for each iteration
            //#c
            
            if (print0){
                if (isolv == 1){ 
                    console.log(" "+ ngit+ " " + namemx+ " " + delmax+ " " + pzs+ " " + pe);
                    for (var k99 = 0; k99 < nlin1; k99++){
                        console.log(p[linv1[k99]]);
                    }
                }
                if (isolv == 2){
                    console.log(" "+ ngit+ " " + namemx+ " " + delmax+ " " + pe);
                    for (var k99 = 0; k99 < nlin2; k99++){
                        console.log(p[linv2[k99]]);
                    }
                }
            } 
            
            //#print("firstTime ", firstTime)
            //#print("*** !!! *** ngit ", ngit, " delmax ", delmax, " tol ", tol)
        } //#End while loop 316
            
        //#c
        //#c Calculate the partial pressures of the species included in the above
        //#c linearization, and also the fictitious total pressure Pd of the gas.
        //#c


        
        if (isolv == 1){
            for (var j99 = 0; j99 < natom; j99++){
                n = indsp[j99];
                if (ipr[n] == 2){
                    np = indx[2][itab[zat[0][n]-1]][0][0][0];
                    p[j99] = comp[j99]*pzs*pe/compz/(it[np] + pe);
                    //if ( (j99 >= 47) && (j99 <= 52) ){
                    //  console.log("GAS: j99 ", j99, " n ", n, " name[j99] ", nameGs[j99], " np ", np, " comp ", comp[j99],
                    //     " pzs ", pzs, " pe ", pe, " compz ", compz, " it ", it[np], " p ", p[j99]);
                    //}
                }
            }
        }

    } // # I *think* this ends the (isolv != 0) condition on line 290
    
    pd = 0.0e0;
    pu = 0.0e0;
    ptot = pe;
    
    //#print("GAS: pe ", pe)
    for (var n99 = 0; n99 < nspec; n99++){
        
        ppt = 0.0e0;
        if (ipr[n99] <= 2){
            nelt = nel[n99];
            nq = nch[n99];
            pf = 1.0e0;
            for (var i99 = 0; i99 < nelt; i99++){
                j = indzat[zat[i99][n99]-1];
                pf = pf * Math.pow(p[j], nat[i99][n99]);
            }

            penq = 1.0e0;
            if (pe > 0.0e0){
                penq = Math.pow(pe, nq);
            }
            ppt = it[n99]*pf/kt[n99]/penq;
            //#print("1: n ", n, " it ", it[n], " kt ", kt[n], " penq ", penq, " pf ", pf, " ppt ", ppt)
            ptot = ptot + ppt;
            pd = pd + ntot[n99]*ppt;
            pu = pu + awt[n99]*ppt;

        }
        pp[n99] = ppt;
        //if ( (n99 >= 47) && (n99 <= 52) ){
        //  console.log("GAS: 1st pp: n99 ", n99, " name ", nameGs[n99], " pp ", pp[n99], " it ", it[n99], " pf ", pf, " kt ", kt[n99], " penq ", penq); 
        //}
        
    }

    gmu = pu/ptot;
    nd = ptot/kbol/t;
    rho = nd*gmu*hmass;

    //console.log("hmass " + hmass + " kbol " + kbol);
    //console.log("GAS main: gmu " + gmu + " nd " + nd + " rho " + rho);
    //console.log("pu " + pu + " ptot " + ptot + " t " + t + " nd " + nd);
 
    /* """
    c
    c     return
    c
    c  The following ENTRY point has been removed for the time being,
    c  so that the partial pressures of all species are always 
    c  calculated automatically, as needed for opacity calculations.
    c                                                     29 June/90
    c                                                            PDB
    c
    c Entry point "GASPP" calculates partial pressures of all
    c species present in the gas.
    c
    c     entry gaspp(pp)
    c cis
    c      entry gaspp(pp)
    c
    c Now  calculate the partial pressure of the remaining atomic
    c species. some restrictions apply here. these are:
        c  1) Each element being considered here is restricted to a
    c     single atom per species.
    c  2) The other elements appearing in a given species must all
    c     be major elements, that is, the partial pressure for each 
    c     has already been found by the preceding linearization
    c     procedure.
    c
    """*/
    
    for (var j99 = 0; j99 < natom; j99++){
        
        n = indsp[j99];
        //#print("j ", j, " n ", n, " ipr ", ipr[n])
        if (ipr[n] >= 3){
            nsp = natsp[j99];
            //#print("nsp ", nsp)
            denom = 0.0e0;

            //console.log("j99 " , j99 + " nsp " + nsp);
            for (var k99 = 0; k99 < nsp+1; k99++){
                //console.log("k99 " + k99);
                nn = iatsp[j99][k99];
                nq = nch[nn];
                nelt = nel[nn];
                pfp = 1.0e0;
                //#print(" k ", k, " nn ", nn, " nq ", nq, " nelt ", nelt)
                for (var i99 = 0; i99 < nelt; i99++){
                    jj = indzat[zat[i99][nn]-1];
                    //#print(" i ", i, " zat ", zat[i][nn]-1, " jj ", jj)
                    if (jj == j99){
                        //#print("jj == j99")
                        if (nat[i99][nn] > 1){
                            console.log(" *18 Error: 2 or more atoms of same element in species");
                            console.log(" for Isolv, T, P, Pe0= "+ " " + isolv+ " " + t+ " " + pt+ " " + pe0);
                            //#return 1
                        }
             
                    } else{
                        
                        //#print("jj !=j")
                        
                        //#if (ipr[indsp[jj]] >= 3):
                            //#print("Going to 363")
                        if (ipr[indsp[jj]] < 3){
                            //#print("pfp=")
                            pfp = pfp * Math.pow(p[jj], nat[i99][nn]);
                            //#print(" nat ", nat[i][nn], " p ", p[jj])
                        }
                    }
                }
                //console.log("j99 ", j99, " jj ", jj, " indsp ", indsp[jj], " ipr ", ipr[indsp[jj]]);
                if ( (ipr[indsp[jj]] < 3) || (jj == j99) ){
                    //#print("penq, psp denom=")
                    penq = 1.0e0;

                    if (pe > 0.0e0){ 
                        penq = Math.pow(pe, nq);
                    }
                    psp = it[nn]*pfp/kt[nn]/penq;
                    denom = denom + psp;
                    //if ( (j99 >= 22) && (j99 <= 24) ){
                     // console.log("j99 ", j99, " nn ", nn, " it ", it[nn], " pfp ", pfp, " kt ", kt[nn], " penq ", penq, 
                     //     " psp ", psp, " denom ", denom);
                    //}
                }

            }
            //#print("FINAL: j ", j, " comp ", comp[j], " pd ", pd, " denom ", denom)
            p[j99] = comp[j99]*pd/denom;
            //if ( (j99 >= 47) && (j99 <= 52) ){
               //console.log("GAS 2: name[j99]??? ", nameGs[j99], " j99 ", j99, " comp ", comp[j99], " pd ", pd, " denom ", denom, " p ", p[j99]);
            //}
            //#print("pfp ", pfp, " psp ", psp)
        }
    }

    //#c
    //#c Calculate final partial pressures after convergence obtained
    //#c
    //console.log("GAS: Entry: pe "+ pe);
    ptot = pe;
    pd = 0.0e0;
    pu = 0.0e0;
    pq = 0.0e0;

    for (var n99 = 0; n99 < nspec; n99++){
        
        nelt = nel[n99];
        nq = nch[n99];
        pf0 = 1.0e0;
        pf = 1.0e0;

        for (var i99 = 0; i99 < nelt; i99++){
            
            j = indzat[zat[i99][n99]-1];
            pf0 = pf0 * Math.pow(p0[j], nat[i99][n99]);
            pf = pf * Math.pow(p[j], nat[i99][n99]);
        //if ( (n99 >= 47) && (n99 <= 52) ){
        //    console.log("GAS 2: n99 ", n99, " name ", nameGs[n99], " j ", j, " p ", p[j], " i99 ", i99, " nat ", nat[i99][n99]);
        //}
        }

        penq = 1.0e0;

        if (pe > 0.0e0){
            penq = Math.pow(pe, nq);
        }
        pp[n99] = it[n99]*pf/kt[n99]/penq;
        //if ( (n99 >= 47) && (n99 <= 52) ){
        //   console.log("GAS: 2nd pp: n99 ", n99, " name ", nameGs[n99], " pp ", pp[n99], " it ", it[n99], " pf ", pf, " kt ", kt[n99], " penq ", penq);
        //}
        penq = 1.0e0;
            
        if (pe0 > 0.0e0){
            penq = Math.pow(pe0, nq);
        }
        pp0[n99] = it[n99]*pf0/kt[n99]/penq;
        ptot = ptot + pp[n99];
        pd = pd + ntot[n99]*pp[n99];
        pq = pq + nq*pp[n99];
        pu = pu + awt[n99]*pp[n99];
        //if ( (n99 >= 47) && (n99 <= 52) ){
        //   console.log("ptot " + ptot + " pu " + pu);
        //}
    }

    pdtot = pd + pe;
    //System.out.println("pd " + pd + " pe " + pe);
    dptot = Math.abs(ptot - pt)/pt;
    dpq = Math.abs(pq - pe)/pt;
    gmu = pu/ptot;
    nd = ptot/kbol/t;
    rho = nd*gmu*hmass;

    //console.log("GAS entry: gmu " + gmu + " nd " + nd + " rho " + rho);
    //console.log("pu " + pu + " ptot " + ptot + " t " + t + " nd " + nd);
    //#c
    //#c Fill the array "PPIX" with the partial pressures of the
    //#c specified species.
    //#c
    if (nix > 0){
        for (var i99 = 0; i99 < nix; i99++){
            ppix[i99] = 0.0e0;
            ii = ixn[i99];
            //#print("i ", i, " ixn ", ixn[i])
            if (ii < 150){
                ppix[i99] = pp[ixn[i99]];
            }
        }
    }

 /*   
    //#c
    //#c Write out final partial pressures 
    //#c
   
   var nsp1; 
    //print0 = true;
    
    if (print0){    
        //#print('("1After ",i3," iterations, with ISOLV =",i2,":", "0T=","   P=", "   Pdtot=","   dPtot=","   dPq="," Number Dens.="," /cm**3    Mean At.Wt.=","   Density="," g/cm**3"/, "0  #  Species      Abundance   Initial P     Final P", "      iT           kT     "//)',\
        //#        ngit, isolv, t, pt, pdtot, dptot, dpq, nd, gmu, rho)
        outString = String.format("%6s %4d %25s %2d %1s\n",
              "1After ", ngit, " iterations, with ISOLV =", isolv, ":");
        //outFile.write(outString)
        try{
           Files.write( path, outString.getBytes(), StandardOpenOption.APPEND);
           } catch (Exception e) {
           System.out.println("path: Caught exception");
           }

        outString =String.format("%3s %12.3e %3s %12.3e %7s %12.3e %7s %12.3e %5s %10.3e\n",
              "0T=", t, "   P=", pt, "   Pdtot=", pdtot, "   dPtot=", dptot, "   dPq=", dpq);
        //outFile.write(outString)
        try{
           Files.write( path, outString.getBytes(), StandardOpenOption.APPEND);
           } catch (Exception e) {
           System.out.println("path: Caught exception");
           }
        outString = String.format("%14s %10.3e %24s %8.3f %9s %10.3e %8s\n",
              " Number Dens.=", nd, " /cm**3    Mean At.Wt.=", gmu, "   Density=", rho, "g/cm**3");
        //outFile.write(outString)
        try{
           Files.write( path, outString.getBytes(), StandardOpenOption.APPEND);
           } catch (Exception e) {
           System.out.println("path: Caught exception");
           }
        nsp1 = nspec + 1;

        outString = String.format("%4s %14s %12s %11s %13s %12s %10s\n",
              "0  #", "  Species     ", " Abundance  ", "   Initial P    ", "    Final P ", "     iT     ", "     kT    ");
        //outFile.write(outString)
        try{
           Files.write( path, outString.getBytes(), StandardOpenOption.APPEND);
           } catch (Exception e) {
           System.out.println("path: Caught exception");
           }
        for (int n99 = 0; n99 < nspec; n99++){
            //#if (pp[n] <= 0.0e0):
            //#    pp[n] = 1.0e-19
            if (type0[n99] != 1){
                //#print(n, nameGs[n], pp0[n], Math.log10(Math.abs(pp[n])/pt) ,it[n], kt[n])
                outString = String.format("%4d %14s %24.3e %12.3e %12.3e %12.3e\n",
                      n99, nameGs[n99], pp0[n99], pp[n99] ,it[n99], kt[n99]);
                //outFile.write(outString)
                try{
                   Files.write( path, outString.getBytes(), StandardOpenOption.APPEND);
                } catch (Exception e) {
                   System.out.println("path: Caught exception");
                }
            } else{
                j = iat[n99];
                //#print(n, nameGs[n], comp[j], pp0[n], Math.log10(Math.abs(pp[n])/pt), it[n], kt[n])
                outString = String.format("%4d %14s %12.3e %12.3e %12.3e %12.3e %12.3e\n",
                      n99, nameGs[n99], comp[j], pp0[n99], pp[n99], it[n99], kt[n99]);
                //outFile.write(outString)
                try{
                   Files.write( path, outString.getBytes(), StandardOpenOption.APPEND);
                } catch (Exception e) {
                   System.out.println("path: Caught exception");
                }
            }
        }

        if (iprint < 0){
            print0 = false;
        }
        //#print(nsp1, ename, pe0, pe)
        outString = String.format("%4d %14s %24.3e %12.3e\n", nsp1, ename, pe0, pe);
        //outFile.write(outString)
        try{
           Files.write( path, outString.getBytes(), StandardOpenOption.APPEND);
        } catch (Exception e) {
           System.out.println("path: Caught exception");
        }
    }
*/
    
    //#Try returning a tuple:
    //return a, ngit, pe, pd, pp, ppix, gmu, rho
   //public static double pe;
   //public static double rho;
   //public static double gmu;
   //public static double[] pp = new double[150];
    //pack up the main variables to be Returned - sigh!
   //
   var returnStruc = [];
   returnStruc.length = 153;
   returnStruc[0] = pe;
   returnStruc[1] = rho;
   returnStruc[2] = gmu;
   for (var k99 = 3; k99 < 153; k99++){
      //System.out.println("k99 "+ k99);
      returnStruc[k99] = pp[k99-3];
   }

    return returnStruc;
 

   }; //end method gas()

