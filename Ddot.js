/*
 * # -*- coding: utf-8 -*-
"""
Created on Fri May 17 17:11:14 2019

@author: 
"""
*/
/*
import math

"""
*> \brief \b DDOT
*
*  =========== DOCUMENTATION ===========
*
* Online html documentation available at
*            http://www.netlib.org/lapack/explore-html/
*
*  Definition:
*  ===========
*
*       DOUBLE PRECISION FUNCTION DDOT(N,DX,INCX,DY,INCY)
*
*       .. Scalar Arguments ..
*       INTEGER INCX,INCY,N
*       ..
*       .. Array Arguments ..
*       DOUBLE PRECISION DX(*),DY(*)
*       ..
*
*
*> \par Purpose:
*  =============
*>
*> \verbatim
*>
*>    DDOT forms the dot product of two vectors.
*>    uses unrolled loops for increments equal to one.
*> \endverbatim
*
*  Arguments:
*  ==========
*
*> \param[in] N
*> \verbatim
*>          N is INTEGER
*>         number of elements in input vector(s)
*> \endverbatim
*>
*> \param[in] DX
*> \verbatim
*>          DX is DOUBLE PRECISION array, dimension ( 1 + ( N - 1
*)*abs( INCX ) )
*> \endverbatim
*>
*> \param[in] INCX
*> \verbatim
*>          INCX is INTEGER
*>         storage spacing between elements of DX
*> \endverbatim
*>
*> \param[in] DY
*> \verbatim
*>          DY is DOUBLE PRECISION array, dimension ( 1 + ( N - 1
*)*abs( INCY ) )
*> \endverbatim
*>
*> \param[in] INCY
*> \verbatim
*>          INCY is INTEGER
*>         storage spacing between elements of DY
*> \endverbatim
*
*  Authors:
*  ========
*
*> \author Univ. of Tennessee
*> \author Univ. of California Berkeley
*> \author Univ. of Colorado Denver
*> \author NAG Ltd.
*
*> \date November 2017
*
*> \ingroup double_blas_level1
*
*> \par Further Details:
*  =====================
*>
*> \verbatim
*>
*>     jack dongarra, linpack, 3/11/78.
*>     modified 12/3/93, array(1) declarations changed to array(*)
*> \endverbatim
*>
*  =====================================================================
"""
*/

//#DOUBLE PRECISION FUNCTION ddot(N,DX,INCX,DY,INCY)


  var ddot = function(n, dx, incx, dy, incy){
    
    //#*
    //#*  -- Reference BLAS level1 routine (version 3.8.0) --
    //#*  -- Reference BLAS is a software package provided by Univ. of
    //#*  Tennessee,    --
    //#*  -- Univ. of California Berkeley, Univ. of Colorado Denver and NAG
    //#*  Ltd..--
    //#*     November 2017
    //#*
    //#*     .. Scalar Arguments ..
    //#INTEGER INCX,INCY,N
    //#*     ..
    //#*     .. Array Arguments ..
    //#DOUBLE PRECISION DX(*),DY(*)
    //#*     ..
    //#*
    //#*  =====================================================================
    //#*
    //#*     .. Local Scalars ..
    var dtemp = 0.0e0;
    var i = 0;
    var ix = 0;
    var iy = 0;
    var m = 0;
    var mp1 = 0;
    
    //#DOUBLE PRECISION DTEMP
    //#INTEGER I,IX,IY,M,MP1
    //#*     ..
    //#*     .. Intrinsic Functions ..
    //#INTRINSIC mod
    //#*     ..
    //#ddot = 0.0d0
    var returnValue = 0.0e0;
    dtemp = 0.0e0;
    
    //#IF (n.LE.0) RETURN
    if (n > 0){
        
        //#IF (incx.EQ.1 .AND. incy.EQ.1) THEN
        if (incx == 1 && incy == 1){
            //#*
            //#*        code for both increments equal to 1
            //#*
            //#*
            //#*        clean-up loop
            //#*
            m = n % 5;
            
            //#IF (m.NE.0) THEN
            if (m != 0){
                
                //#DO i = 1,m
                for (var i99 = 0; i99 < m; i99++){
                    dtemp = dtemp + dx[i99]*dy[i99];
                }
            
                //#IF (n.LT.5) THEN
                if (n < 5){
                    
                    //#ddot=dtemp
                    returnValue = dtemp;
                    //#RETURN
                }
            }           
 
            if (n >= 5){
             
                mp1 = m + 1;
             
                //#DO i = mp1,n,5
                for (var i99 = mp1-1; i99 < n; i99+=5){
                 
                    dtemp = dtemp + dx[i99]*dy[i99] + dx[i99+1]*dy[i99+1] +
                       dx[i99+2]*dy[i99+2] + dx[i99+3]*dy[i99+3] + dx[i99+4]*dy[i99+4];
                }
            }        
 
        } else{
            //#*
            //#*        code for unequal increments or equal increments
            //#*          not equal to 1
            //#*
            //#ix = 1
            //#iy = 1
            ix = 0;
            iy = 0;      
            if (incx < 0){
                ix = ((-1*n)+1)*incx + 1;
            }
            if (incy < 0){
                iy = ((-1*n)+1)*incy + 1;
            }
            //#DO i = 1,n
            for (var i99 = 0; i99 < n; i99++){
                dtemp = dtemp + dx[ix]*dy[iy];
                ix = ix + incx;
                iy = iy + incy;
            }
        }
    }

    //#ddot = dtemp
    returnValue = dtemp;
      
    return returnValue;

  }; //end method ddot()
      


