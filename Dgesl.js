/*
 * # -*- coding: utf-8 -*-
"""
Created on Mon May  6 11:42:29 2019

@author: 
"""

import math
import numpy
#from scipy.linalg.blas import daxpy
#from scipy.linalg.blas import ddot
#from scipy.linalg.blas import dscal
#from scipy.linalg.blas import idamax
from Documents.ChromaStarPy.GAS.blas.Daxpy import daxpy
from Documents.ChromaStarPy.GAS.blas.Ddot import ddot
from Documents.ChromaStarPy.GAS.blas.Dscal import dscal
from Documents.ChromaStarPy.GAS.blas.Idamax import idamax
*/


  var dgesl = function(a, lda, n, ipvt, b, job){
    
    
    //#integer lda,n,ipvt(1),job
    //#double precision a(lda,1),b(1)
    
    /*"""
c
c     dgesl solves the double precision system
c     a * x = b  or  trans(a) * x = b
c     using the factors computed by dgeco or dgefa.
c
c     on entry
c
c        a       double precision(lda, n)
c                the output from dgeco or dgefa.
c
c        lda     integer
c                the leading dimension of the array  a .
c
c        n       integer
c                the order of the matrix  a .
c
c        ipvt    integer(n)
c                the pivot vector from dgeco or dgefa.
c
c        b       double precision(n)
c                the right hand side vector.
c
c        job     integer
c                = 0         to solve  a*x = b ,
c                = nonzero   to solve  trans(a)*x = b  where
c                            trans(a)  is the transpose.
c
c     on return
c
c        b       the solution vector  x .
c
c     error condition
c
c        a division by zero will occur if the input factor contains a
c        zero on the diagonal.  technically this indicates singularity
c        but it is often caused by improper arguments or improper
c        setting of lda .  it will not occur if the subroutines are
c        called correctly and if dgeco has set rcond .gt. 0.0
c        or dgefa has set info .eq. 0 .
c
c     to compute  inverse(a) * c  where  c  is a matrix
c     with  p  columns
c           call dgeco(a,lda,n,ipvt,rcond,z)
c           if (rcond is too small) go to ...
c           do 10 j = 1, p
c              call dgesl(a,lda,n,ipvt,c(1,j),0)
c        10 continue
c
c     linpack. this version dated 08/14/78 .
c     cleve moler, university of new mexico, argonne national lab.
c
c     subroutines and functions
c
c     blas daxpy,ddot
c
c     internal variables
c
    """ */
    
    //#double precision ddot,t
    //#integer k,kb,l,nm1
    
    //#c
    //
    var count = 0;

    var nm1 = n - 1;

    var l, k, kb;
    var t;
    var daxpyCount;


    if (job == 0){

        //#c
        //#c        job = 0 , solve  a * x = b
        //#c        first solve  l*y = b
        //#c
        if (nm1 >= 1){
              
            for (var k99 = 0; k99 < nm1; k99++){

                var daxpyIn1 = [];
                daxpyIn1.length = n-(k99+1);
                var daxpyIn2 = [];
                daxpyIn2.length = n-(k99+1);
                var daxpyOut = [];
                daxpyOut.length = n-(k99+1);

                l = ipvt[k99];
                t = b[l];
                if (l != k99){
                    //#print("DGESL if triggered")
                    b[l] = b[k99];
                    b[k99] = t;
                }
                //#print("DGESL 1: l ", l, " k, ", k, " b ", b[k])

                //#FORTRAN call call daxpy(n-k, t, a[k+1][k], 1, b[k+1], 1)
                //#5th parameter is in/out:
                //#b[k+1] = daxpy(n-k, t, a[k+1][k], 1, b[k+1], 1)
                //#[b[kk+1] for kk in range(k, n)] = daxpy(n-k, t,\
                //# [a[k+1][kk] for kk in range(k, n)], 1, [b[kk+1] for kk in range(k, n)], 1)
                count = 0;
                //System.out.println("DAXPY 1: k99 " + k99 + " l " + l + " t " + t);
                for (var kk = k99+1; kk < n; kk++){
                    daxpyIn1[count] = a[kk][k99];
                    daxpyIn2[count] = b[kk];
                    //System.out.println("count " + count + " kk " + kk + " In1 " + daxpyIn1[count] + " In2 " + daxpyIn2[count]);
                    count++;
                }

                //daxpyOut =
                //daxpy(n-k-1, t, [a[kk][k] for kk in range(k+1, n)], 1, [b[kk] for kk in range(k+1, n)], 1);
                daxpyOut = daxpy(n-k99-1, t, daxpyIn1, 1, daxpyIn2, 1);
                daxpyCount = 0;
                for (var kk = k99+1; kk < n; kk++){
                    b[kk] = daxpyOut[daxpyCount];
                    //System.out.println("daxpyCount " + daxpyCount + " kk " + kk + " Out " + daxpyOut[daxpyCount]);
                    daxpyCount+=1;
                }
                //#print("DGESL 2: k ", k, " b ", b[k])
                //#scipy: b[k+1] = daxpy(t, a[k+1][k], n-k, 1, 1)
            } 
          //#c
          //#c        now solve  u*x = y
          //#c
        } // for (int k = 0; k < nm1; k++)
        //#print("DGESL: Before 2nd DAXPY call n ", n)
        for (var kb99 = 0; kb99 < n; kb99++){

            //#k = n + 1 - kb99
            k = (n-1) - kb99;

            var daxpyIn1 = [];
            daxpyIn1.length = k+1;
            var daxpyIn2 = [];
            daxpyIn2.length = k+1;
            var daxpyOut = [];
            daxpyOut.length = k+1;

            //#print("DGESL: kb ", kb, " k ", k, " b ", b[k], " a ", a[k][k])
            b[k] = b[k]/a[k][k];
            t = -b[k];
            //#FORTRAN call: call daxpy(k-1, t, a[1][k], 1, b[1], 1)
            //#b[1] = daxpy(k-1, t, a[1][k], 1, b[1], 1)
            //#[b[kk] for kk in range(1, k)] = daxpy(k-1, t,\
            //# [a[1][kk] for kk in range(1, k)], 1, [b[kk] for kk in range(1, k)], 1)
            //#print("DGESL: Before DAPXPY 2:")
            //#print("a ", [a[kk][k] for kk in range(0, k+1)])
            //#print("b ", [b[kk] for kk in range(0, k+1)])
            count = 0;
            //System.out.println("DAXPY 2: k " + k + " b " + b[k] + " a " + a[k][k] + " t " + t);
            for (var kk = 0; kk < k+1; kk++){
                daxpyIn1[count] = a[kk][k];
                daxpyIn2[count] = b[kk];
                //System.out.println("count " + count + " kk " + kk + " In1 " + daxpyIn1[count] + " In2 " + daxpyIn2[count]);
                count++;
            }
            //daxpyOut =
            //   daxpy(k, t, [a[kk][k] for kk in range(0, k+1)], 1, [b[kk] for kk in range(0, k+1)], 1);
            daxpyOut = daxpy(k, t, daxpyIn1, 1, daxpyIn2, 1);
            daxpyCount = 0;
            for (var kk = 0; kk < k+1; kk++){
                b[kk] = daxpyOut[daxpyCount];
                //System.out.println("daxpyCount " + daxpyCount + " kk " + kk + " Out " + daxpyOut[daxpyCount]);
                daxpyCount+=1;
            }
            //#print("DGESL: After DAPXPY 2:")
            //#print("b ", [b[kk] for kk in range(0, k+1)])             
            //#scipy: b[0] = daxpy(t, a[0][k], k-1, 1, 1)
              
          //# **** goto 100 !!!  Oh-oh!!
        }  
    //#c
    //#c        job = nonzero, solve  trans(a) * x = b
    //#c        first solve  trans(u)*y = b
    //#c

   
    } //end job=0 

 
    if (job != 0){
        
        for (var k99 = 0; k99 < n; k99++){

            var ddotIn1 = [];
            ddotIn1.length = k99;
            var ddotIn2 = [];
            ddotIn2.length = k99;

            //#t = ddot(k-1, a[1][k], 1, b[1], 1)
            //t = ddot(k, [a[kk][k] for kk in range(0, k)],\
            //                 1, [b[kk] for kk in range(0, k)], 1)
            count = 0;
            for (var kk = 0; kk < k99; kk++){
                ddotIn1[count] = a[kk][k99];
                ddotIn2[count] = b[kk];
                count++;
            }
            //t = ddot(k, [a[kk][k] for kk in range(0, k)],\
            //                 1, [b[kk] for kk in range(0, k)], 1)
            t = ddot(k99, ddotIn1, 1, ddotIn2, 1);
            b[k99] = (b[k99] - t)/a[k99][k99];
            //#print("DDOT 1: t ", t)
        
            //#c
            //#c        now solve trans(l)*x = y
            //#c
        }
        if (nm1 >= 1){
            for (var kb99 = 0; kb99 < nm1; kb99++){
                //#k = n - kb
                k = n - kb99 - 1;

                var ddotIn1 = [];
                ddotIn1.length = n-k;
                var ddotIn2 = [];
                ddotIn2.length = n-k;

                //#b[k] = b[k] + ddot(n-k, a[k+1][k], 1, b[k+1], 1)
                //b[k] = b[k] + ddot(n-k, [a[kk][k] for kk in range(k, n)],\
                //  1, [b[kk] for kk in range(k, n)], 1)
                count++;
                for (var kk = k; kk < n; kk++){
                   ddotIn1[count] = a[kk][k];
                   ddotIn2[count] = b[kk];
                   count++;
                }

                //b[k] = b[k] + ddot(n-k, [a[kk][k] for kk in range(k, n)],\
                //  1, [b[kk] for kk in range(k, n)], 1)
                b[k] = b[k] + ddot(n-k, ddotIn1, 1, ddotIn2, 1);
                //#print("DDOT 2: t ", t)
                l = ipvt[k];
                if (l != k){
                    t = b[l];
                    b[l] = b[k];
                    b[k] = t;
                }
            }
       }
    } //end job!=0

    return b;

    }; // end method dgesl

