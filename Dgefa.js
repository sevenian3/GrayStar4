/*
 * # -*- coding: utf-8 -*-
"""
Created on Fri May  3 12:09:11 2019

@author: 
"""

import math
import numpy
#from scipy.linalg.blas import daxpy
#from scipy.linalg.blas import ddot
#from scipy.linalg.blas import dscal
#from scipy.linalg.blas import idamax

from Documents.ChromaStarPy.GAS.blas.Ddot import ddot
from Documents.ChromaStarPy.GAS.blas.Dscal import dscal
from Documents.ChromaStarPy.GAS.blas.Idamax import idamax
from Documents.ChromaStarPy.GAS.blas.Daxpy import daxpy
*/

  var info; 

  var dgefa = function(a, lda, n){

//Main variables to be "return"ed

    //double[][] a = new double[n][n];
    var ipvt= [];
    ipvt.length = n;

    //System.out.println("lda "+ lda+ " n "+ n);
    //System.out.println("a[0][:]: ");
    //for (int k99 = 0; k99 < n; k99++){
    //  System.out.println(a[0][k99]);
    //} 
    //System.out.println("a[:][0]: ");
    //for (int k99 = 0; k99 < n; k99++){
    //  System.out.println(a[k99][0]);
    //} 
    
    //#aOut = [ [a[j][i] for i in range(n)] for j in range(n) ]
    
    /* """
c
c     dgefa factors a double precision matrix by gaussian elimination.
c
c     dgefa is usually called by dgeco, but it can be called
c     directly with a saving in time if  rcond  is not needed.
c     (time for dgeco) = (1 + 9/n)*(time for dgefa) .
c
c     on entry
c
c        a       double precision(lda, n)
c                the matrix to be factored.
c
c        lda     integer
c                the leading dimension of the array  a .
c
c        n       integer
c                the order of the matrix  a .
c
c     on return
c
c        a       an upper triangular matrix and the multipliers
c                which were used to obtain it.
c                the factorization can be written  a = l*u  where
c                l  is a product of permutation and unit lower
c                triangular matrices and  u  is upper triangular.
c
c        ipvt    integer(n)
c                an integer vector of pivot indices.
c
c        info    integer
c                = 0  normal value.
c                = k  if  u(k,k) .eq. 0.0 .  this is not an error
c                     condition for this subroutine, but it does
c                     indicate that dgesl or dgedi will divide by zero
c                     if called.  use  rcond  in dgeco for a reliable
c                     indication of singularity.
c
c     linpack. this version dated 08/14/78 .
c     cleve moler, university of new mexico, argonne national lab.
c
c     subroutines and functions
c
c     blas daxpy,dscal,idamax
c
c     internal variables
c
    """ */

    /* """
    Port to python --> Java by Ian Short
    Saint Mary's University
    May 2019
    """ */
    
    //#c
    //#c
    //#c     gaussian elimination with partial pivoting
    //#c
   
    var count = 0;
 
    info = 0;
    var nm1 = n - 1;
    
    var kp1, l;
    var dscalCount, daxpyCount;
    var t; 
    
    //#print("DGEFA: n ", n, " nm1 ", nm1)
    //double[] idamaxIn = new double[n-k];
    //double[] dscalIn = new double[n-(k+1)];
    //double[] daxpyIn1 = new double[n-(k+1)];
    //double[] daxpyIn2 = new double[n-(k+1)];
    
    if (nm1 >= 1){
        
        for (var k = 0; k < nm1; k++){

            var idamaxIn = [];
            idamaxIn.length = n-k;
            var dscalIn = [];
            dscalIn.length = n-(k+1);
            //System.out.println("n-(k+1) "+ ( n-(k+1) ) );
            var daxpyIn1 = [];
            daxpyIn1.length = n-(k+1);
            var daxpyIn2 = [];
            daxpyIn2.length = n-(k+1);

            var dscalOut = [];
            dscalOut.length = n-(k+1)
            var daxpyOut = [];
            daxpyOut.length = n-(k+1);
            
            //#print("DGEFA: k ", k, " n-k ", n-k)
            
            kp1 = k + 1;
            //#c
            //#c        find l = pivot index
            //#c
            //#l = idamax(n-k+1, a[k][k], 1) + k - 1
            //#l = idamax(n-k+1, [a[kk][k] for kk in range(k, n)], 1) + k - 1
            //#print("IDAMAX: a ", [a[kk][k] for kk in range(k, n)])
            count = 0;
            for (var kk = k; kk < n; kk++){
               idamaxIn[count] = a[kk][k];
               count++;
            }  
            //l = Idamax.idamax(n-k, [a[kk][k] for kk in range(k, n)], 1) + k;
            l = idamax(n-k, idamaxIn, 1) + k;
            //#print("l ", l)
            ipvt[k] = l;
            
            //#c
            //#c        zero pivot implies this column already triangularized
            //#c
            
            //#if (a[l][k] != 0.0e0):
            if (a[l][k] != 0.0e0){
                //#c
                //#c           interchange if necessary
                //#c
                if (l != k){
                    //#print("l != k")
                    //#t = a[l][k]
                    //#a[l][k] = a[k][k]
                    //#a[k][k] = t
                    t = a[l][k];
                    a[l][k] = a[k][k];
                    a[k][k] = t; 
                }                   
                    
                //#c
                //#c           compute multipliers
                //#c
                //#t = -1.0e0/a[k][k]
                t = -1.0e0/a[k][k];
                //#FORTRAN: call dscal(n-k, t, a[k+1][k], 1)
                //#3rd parameter is in/out
                //#a[k+1][k] = dscal(n-k, t, a[k+1][k], 1)
                //#[a[k+1][kk] for kk in range(k, n)] =\
                //#dscal(n-k, t, [a[k+1][kk] for kk in range(k, n)], 1)
                //#print("BEFORE DSCAL: t ", t, " a ", [a[kk][k] for kk in range(k+1, n)])
                //System.out.println("k "+ k);
                count = 0;
                for (var kk = k+1; kk < n; kk++){
                    //System.out.println("kk "+ kk);
                    dscalIn[count] = a[kk][k];
                    count++;
                }
                //dscalOut =
                //   Dscal.dscal(n-k-1, t, [a[kk][k] for kk in range(k+1, n)], 1);
                dscalOut =
                   dscal(n-k-1, t, dscalIn, 1);
                //#dscalSize = len(dscalOut)
                //#[a[k+1][kk] for kk in range(k, n)] = [dscalOut[ll] for ll in range(dscalSize)]
                dscalCount = 0;
                for (var kk = k+1; kk < n; kk++){
                    a[kk][k] = dscalOut[dscalCount];
                    dscalCount+=1;
                }
                //#print("AFTER DSCAL: a ", [a[kk][k] for kk in range(n)])
                //#scipy: a[k+1][k] = dscal(t, a[k+1][k], n-k, 1)
                //#c
                //#c           row elimination with column indexing
                //#c
                
                for (var j = kp1; j < n; j++){
                    //#t = a[l][j]
                    t = a[l][j];
                    if (l != k){
                        //#a[l][j] = a[k][j]
                        //#a[k][j] = t
                        a[l][j] = a[k][j];
                        a[k][j] = t;
                    }                        

                    //#FORTRAN call daxpy(n-k, t, a[k+1][k] ,1, a[k+1][j], 1)
                    //#5th parameter is in/out
                    //#a[k+1][j] = daxpy(n-k, t, a[k+1][k] ,1, a[k+1][j], 1)
                    //#[a[k+1][jj] for jj in range(j, n)] =\
                    //#daxpy(n-k, t, [a[k+1][kk] for kk in range(k, n)], 1, [a[k+1][jj] for jj in range(j, n)], 1)
                    //#print("k ", k, " j ", j, " l ", l, " t ", t)
                    //#print("Before DAXPY: [a[kk][j] for kk in range(k+1, n)] ",\
                    //#                      [a[kk][j] for kk in range(k+1, n)]) 
                    count = 0;
                    for (var kk = k+1; kk < n; kk++){
                        daxpyIn1[count] = a[kk][k]; 
                        daxpyIn2[count] = a[kk][j];
                        count++;
                    } 
                    //daxpyOut =
                    //   Daxpy.daxpy(n-k-1, t, [a[kk][k] for kk in range(k+1, n)], 1, [a[kk][j] for kk in range(k+1, n)], 1);
                    daxpyOut =
                       daxpy(n-k-1, t, daxpyIn1, 1, daxpyIn2, 1);
                    //#daxpySize = len(daxpyOut)
                    daxpyCount = 0;
                    for (var kk = k+1; kk < n; kk++){
                        a[kk][j] = daxpyOut[daxpyCount];
                        daxpyCount+=1;
                    }
                   
                    //#print("After DAXPY: [a[kk][j] for kk in range(k+1, n)] ",\
                    //#                      [a[kk][j] for kk in range(k+1, n)])                     
                    
                    //#scipy library: a[k+1][j] = daxpy(t, a[k+1][k], n-k, 1, 1)
                } 
            } // closes if (a[l][k] != 0.0e0){
        
            if (a[l][k] == 0.0e0){
                info = k;
            }
        } // closes for (var k = 0; k < nm1; k++){
    } //closes if (nm1 >= 1):
 
    //#print("DGEFA final n ", n)
    //#ipvt[n-1] = n
    ipvt[n-1] = n-1;
    if (a[n-1][n-1] == 0.0e0){
        //#info = n;
        info = n-1;
    }
        
// Try packing everything up into a super array that can be returned as one "thing" - sigh!
    var returnStruc = [];
    returnStruc.length = n+2;
    for (var i = 0; i < n+2; i++){
       returnStruc[i] = [];
       returnStruc[i].length = n;
    }
    
    for (var jjj = 0; jjj < n; jjj++){
       for (var kkk = 0; kkk < n; kkk++){
           returnStruc[jjj][kkk] = a[jjj][kkk];
       }
       returnStruc[n][jjj] = 1.0*ipvt[jjj];
    }
   
    returnStruc[n+1][0] = info; 
        
    return returnStruc; // a, ipvt, info
 
    }; //end public class dgefa()
  
