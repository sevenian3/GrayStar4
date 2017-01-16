
/*
 *  * To change this license header, choose License Headers in Project Properties.
 *   * To change this template file, choose Tools | Templates
 *    * and open the template in the editor.
 *     */

package graystar3server;

/* Rayleigh scattering opacity routines taken from Moog (moogjul2014/, MOOGJUL2014.tar)
Chris Sneden (Universtiy of Texas at Austin)  and collaborators
http://www.as.utexas.edu/~chris/moog.html
//From Moog source file Opacscat.f
*/

public class KappasRayl{


/*
c******************************************************************************
c  The subroutines needed to calculate the opacities from scattering by
c  H I, H2, He I, are in this file.  These are from ATLAS9.
c******************************************************************************
*/

      public static double[][] masterRayl(int numDeps, int numLams, double[][] temp, double[] lambdaScale, double[][][] stagePops, double[][] molPops){

    //System.out.println("masterRayl called...");

//From Moog source file Opacitymetals.f
// From how values such as aC1[] are used in Moog file Opacit.f to compute the total opacity
// and then the optical depth scale, I infer that they are extinction coefficients 
// in either cm^-1 or m^-1 OR  cm^2/g or m^2/kg
//
// There does not seem to be any correction for stimulated emission 

         double[][] masterRScat = new double[numLams][numDeps];

         double[] logUH1 = new double[2];
         double[] logUHe1 = new double[2];

         double logStatWH1 = 0.0;
         double logStatWHe1 = 0.0;

         double theta = 1.0;
         String species = "";
         double[] logGroundPopsH1  = new double[numDeps];
         double[] logGroundPopsHe1  = new double[numDeps];
//
// H I: Z=1 --> iZ=0:
         double[] sigH1 = new double[numDeps];
// He I: Z=2 --> iZ=1:
         double[] sigHe1 = new double[numDeps];

         species = "HI";
         logUH1 = PartitionFn.getPartFn(species);
         species = "HeI";
         logUHe1 = PartitionFn.getPartFn(species);

         for (int iD = 0; iD < numDeps; iD++){
//neutral stage
//Assumes ground state stat weight, g_1, is 1.0
            theta = 5040.0 / temp[0][iD];
// U[0]: theta = 1.0, U[1]: theta = 0.5
            if (theta <= 0.5){
               logStatWH1 = logUH1[1];
               logStatWHe1 = logUHe1[1];
            } else if ( (theta < 1.0) && (theta > 0.5) ){
               logStatWH1 = ( (theta-0.5) * logUH1[0] ) + ( (1.0-theta) * logUH1[1] );
               logStatWHe1 = ( (theta-0.5) * logUHe1[0] ) + ( (1.0-theta) * logUHe1[1] );
               //divide by common factor of interpolation interval of 0.5 = (1.0 - 0.5):
               logStatWH1 = 2.0 * logStatWH1; 
               logStatWHe1 = 2.0 * logStatWHe1; 
            } else {
               logStatWH1 = logUH1[0];
               logStatWHe1 = logUHe1[0];
            }  
            logGroundPopsH1[iD] = stagePops[0][0][iD] - logStatWH1; 
            logGroundPopsHe1[iD] = stagePops[1][0][iD] - logStatWHe1; 
         }   
        
         //System.out.println("iD    iL    lambda    sigH1    sigHe1 ");
         for (int iL = 0; iL < numLams; iL++){
//
            for (int i = 0; i < numDeps; i++){
               sigH1[i] = 0.0;
            }
            for (int i = 0; i < numDeps; i++){
               sigHe1[i] = 0.0;
            }

            //System.out.println("Calling opacH1 from masterMetal..."); 
            sigH1 = opacHscat(numDeps, temp, lambdaScale[iL], logGroundPopsH1);
            sigHe1 = opacHescat(numDeps, temp, lambdaScale[iL], logGroundPopsHe1);

            for (int iD = 0; iD < numDeps; iD++){
               masterRScat[iL][iD] = sigH1[iD] + sigHe1[iD];
               masterRScat[iL][iD] = Math.log(masterRScat[iL][iD]);
               //if ( (iD%10 == 0) && (iL%10 == 0) ) {
               //  System.out.format("%03d, %03d, %21.15f, %21.15f, %21.15f %n",
               //     iD, iL, lambdaScale[iL], Math.log10(sigH1[iD]), Math.log10(sigHe1[iD]));
               //}

            } //iD
 
         } //iL

         return masterRScat;

      } //end method masterMetal


      public static double[] opacHscat(int numDeps, double[][] temp, double lambda, double[] logGroundPops){

      //System.out.println("opacHscat called");

      double[] sigH = new double[numDeps];

//cross-section is zero below threshold, so initialize:
      for (int i = 0; i < numDeps; i++){
         sigH[i] = 0.0;
      }

      double freq = Useful.c / lambda;  

//c******************************************************************************
//c  This routine computes H I Rayleigh scattering opacities.
//c******************************************************************************

//      include 'Atmos.com'
//      include 'Kappa.com'
//      include 'Linex.com'

      double wavetemp = 2.997925e18 / Math.min(freq, 2.463e15);
      double ww = Math.pow(wavetemp, 2);
      double sig = ( 5.799e-13 + (1.422e-6/ww) + (2.784/(ww*ww)) ) / (ww*ww);
      for (int i = 0; i < numDeps; i++){
         sigH[i] = sig * 2.0 * Math.exp(logGroundPops[i]);
      }

      return sigH;

  } //end method opacHscat


      public static double[] opacHescat(int numDeps, double[][] temp, double lambda, double[] logGroundPops){

      //System.out.println("opacHescat called");

      double[] sigHe = new double[numDeps];

//cross-section is zero below threshold, so initialize:
      for (int i = 0; i < numDeps; i++){
         sigHe[i] = 0.0;
      }

      double freq = Useful.c / lambda;  

//c******************************************************************************
//c  This routine computes He I Rayleigh scattering opacities.
//c******************************************************************************

//      include 'Atmos.com'
//      include 'Kappa.com'
//      include 'Linex.com'

      double wavetemp = 2.997925e18 / Math.min(freq, 5.15e15);
      double ww = Math.pow(wavetemp, 2);
      double sig = (5.484e-14/ww/ww) * Math.pow( ( 1.0 + ((2.44e5 + (5.94e10/(ww-2.90e5)))/ww) ), 2 );
      for (int i = 0; i < numDeps; i++){
         sigHe[i] = sig * Math.exp(logGroundPops[i]); 
      }

      return sigHe;

   } //end method opacHescat


/* Need molecular H_2 number density for this:
 *
      public static double[] opacH2scat(int numDeps, double[][] temp, double lambda, double[] molPops){

      double[] sigH2 = new double[numDeps];

//cross-section is zero below threshold, so initialize:
      for (int i = 0; i < numDeps; i++){
         sigH2[i] = 0.0;
      }

      double freq = Useful.c / lambda;  

//c******************************************************************************
//c  This routine computes H2 I Rayleigh scattering opacities.
//c******************************************************************************

//      include 'Atmos.com'
//      include 'Kappa.com'
//      include 'Linex.com'

      double wavetemp = 2.997925e18 / Math.min(freq, 2.463e15);
      double ww = Math.pow(wavetemp, 2);
      double sig = ( 8.14e-13 + (1.28d-6/ww) + (1.61/(ww*ww)) ) / (ww*ww);
      for (int i = 0; i < numDeps; i++){
       sigH2[i] = sig * Math.exp(molPops);
      }

      return sigH2;

      } //end method opacH2scat
*/

} //end class KappasRayl
