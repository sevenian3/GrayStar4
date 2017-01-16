/*
 * The MIT License (MIT)
 * Copyright (c) 2016 C. Ian Short 
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package graystar3server;

//import java.nio.file;
//import java.io.BufferedWriter;
import java.io.BufferedReader;
//import java.io.FileWriter;
import java.io.FileReader;
import java.io.IOException;
//import java.nio.file.Files;  //java.nio.file not available in Java 6
//import java.nio.file.Paths;  //java.nio.file not available in Java 6
//import java.nio.file.Path;  //java.nio.file not available in Java 6
import java.io.File;  
import java.nio.charset.Charset;
import java.text.*;
import java.text.DecimalFormat;

/**
 *
 * @author Ian
 */
public class GrayStar3Server {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {

        // Argument 0: Effective temperature, Teff, in K:
        String teffStr = args[0];
        //String teffStr = "5870"; //test
        double teff = (Double.valueOf(teffStr)).doubleValue();

        // Argument 1: Logarithmic surface gravity, g, in cm/s/s:
        String loggStr = args[1];
        //String loggStr = "4.4"; //test
        double logg = (Double.valueOf(loggStr)).doubleValue();

        //Argument 2: Linear sclae factor for solar Rosseland oapcity distribution
        // mimics "metallicity" parameter - ??  (unitless)
        String logZStr = args[2];
        //String logKappaStr = "0.0"; //test
        double log10ZScale = (Double.valueOf(logZStr)).doubleValue();

        //Argument 3: Stellar mass, M, in solar masses
        String massStarStr = args[3];
        //String massStarStr = "1.0"; //test
        double massStar = (Double.valueOf(massStarStr)).doubleValue();

        // Sanity check:
        double F0Vtemp = 7300.0;  // Teff of F0 V star (K)                           
        if (teff < 500.0) {
            teff = 500.0;
            teffStr = "500";
        }
        if (teff > 50000.0) {
            teff = 50000.0;
            teffStr = "50000";
        }
        //logg limit is strongly Teff-dependent:
        double minLogg = 3.0; //safe initialization
        String minLoggStr = "3.0";
        if (teff <= 4000.0) {
            minLogg = 0.0;
            minLoggStr = "0.0";
        } else if ((teff > 4000.0) && (teff <= 5000.0)) {
            minLogg = 0.5;
            minLoggStr = "0.5";
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
        if (logg < minLogg) {
            logg = minLogg;
            loggStr = minLoggStr;
        }
        if (logg > 7.0) {
            logg = 7.0;
            loggStr = "7.0";
        }
        if (log10ZScale < -3.0) {
            log10ZScale = -3.0;
            logZStr = "-3.0";
        }
        if (log10ZScale > 1.0) {
            log10ZScale = 1.0;
            logZStr = "1.0";
        }
        if (massStar < 0.1) {
            massStar = 0.1;
            massStarStr = "0.1";
        }
        if (massStar > 20.0) {
            massStar = 20.0;
            massStarStr = "20.0";
        }

        double grav = Math.pow(10.0, logg);
        double zScale = Math.pow(10.0, log10ZScale);

        // Argument 5: microturbulence, xi_T, in km/s:
           String xitStr = args[4];
           //String xitStr = "1.0"; //test
           double xiT = (Double.valueOf(xitStr)).doubleValue();

        if (xiT < 0.0) {
            xiT = 0.0;
            xitStr = "0.0";
        }
        if (xiT > 8.0) {
            xiT = 8.0;
            xitStr = "8.0";
        }

        // Argument 6: minimum ratio of monochromatic line center to background continuous
        // extinction for inclusion of linein spectrum 
           String lineThreshStr = args[5];
           //String xitStr = "1.0"; //test
           double lineThresh = (Double.valueOf(lineThreshStr)).doubleValue();

        if (lineThresh < -4.0) {
            lineThresh = -4.0;
            lineThreshStr = "-4.0";
        }
        if (lineThresh > 6.0) {
            lineThresh = 6.0;
            lineThreshStr = "6.0";
        }

        // Argument 7: minimum ratio of monochromatic line center to background continuous
        // extinction for treatmnt with Voigt profile 
           String voigtThreshStr = args[6];
           //String xitStr = "1.0"; //test
           double voigtThresh = (Double.valueOf(voigtThreshStr)).doubleValue();

        if (voigtThresh < lineThresh) {
            voigtThresh = lineThresh;
            voigtThreshStr = lineThreshStr;
        }
        if (voigtThresh > 6.0) {
            voigtThresh = 6.0;
            voigtThreshStr = "6.0";
        }

//User defined spetrum synthesis region:
        double lamUV = 300.0;
        double lamIR = 900.0;
        //// Ca II K to H-alpha
        //double lamUV = 390.0;  //testing
        //double lamIR = 660.0;  //testing
        // Argument 8: starting wavelength for spectrum synthesis 
           String lambdaStartStr = args[7];
           //String xitStr = "1.0"; //test
           double lambdaStart = (Double.valueOf(lambdaStartStr)).doubleValue();

        if (lambdaStart < lamUV) {
            lambdaStart = lamUV;
            lambdaStartStr = String.valueOf(lamUV);
        }
        if (lambdaStart > lamIR - 1.0) {
            lambdaStart = lamIR - 1.0;
            lambdaStartStr = String.valueOf(lamIR - 1.0);
        }
        // Argument 9: stopping wavelength for spectrum synthesis 
           String lambdaStopStr = args[8];
           //String xitStr = "1.0"; //test
           double lambdaStop = (Double.valueOf(lambdaStopStr)).doubleValue();

        if (lambdaStop < lamUV + 1.0) {
            lambdaStop = lamUV + 1.0;
            lambdaStartStr = String.valueOf(lamUV + 1.0);
        }
        if (lambdaStart > lamIR) {
            lambdaStart = lamIR;
            lambdaStartStr = String.valueOf(lamIR);
        }
        lambdaStart = 1.0e-7 * lambdaStart; //nm to cm 
        lambdaStop = 1.0e-7 * lambdaStop;  //nm to cm
        lamUV = 1.0e-7 * lamUV;
        lamIR = 1.0e-7 * lamIR;
       //double lineThresh = +5.0; 

//argument 10: line sampling selection (fine or coarse)
        String sampling = args[9];

// Argument 11: Lorentzian line broadening enhancement 
           String logGammaColStr = args[10];
           double logGammaCol = (Double.valueOf(logGammaColStr)).doubleValue();

        if (logGammaCol < 0.0) {
            logGammaCol = 0.0;
            logGammaColStr = "0.0";
        }
        if (logGammaCol > 1.0) {
            logGammaCol = 1.0;
            logGammaColStr = "1.0";
        }

// Argument 12: log_10 gray mass extinction fudge 
           String logKapFudgeStr = args[11];
           double logKapFudge = (Double.valueOf(logKapFudgeStr)).doubleValue();

        if (logKapFudge < -2.0) {
            logKapFudge = -2.0;
            logKapFudgeStr = "-2.0";
        }
        if (logKapFudge > 2.0) {
            logKapFudge = 2.0;
            logKapFudgeStr = "2.0";
        }

// Argument 13: macroturbulent velocity broadening parameter (sigma) (km/s) 
        String macroVStr = args[12];
        double macroV = (Double.valueOf(macroVStr)).doubleValue();
// Argument 14: surface equatorial linear rotational velocity (km/s) 
        String rotVStr = args[13];
        double rotV  = (Double.valueOf(rotVStr)).doubleValue();
// Argument 15: inclination of rotation axis wrt line-of-sight (degrees) 
        String rotIStr = args[14];
        double rotI  = (Double.valueOf(rotIStr)).doubleValue();

        if (macroV < 0.0) {
            macroV = 0.0;
            macroVStr = "0.0";
        }
        if (macroV > 8.0) {
            macroV = 8.0;
            macroVStr = "8.0";
        }

        if (rotV < 0.0) {
            rotV = 0.0;
            rotVStr = "0.0";
        }
        if (rotV > 20.0) {
            rotV = 20.0;
            rotVStr = "20.0";
        }

        if (rotI < 0.0) {
            rotI = 0.0;
            rotIStr = "0.0";
        }
        if (rotI > 90.0) {
            rotI = 90.0;
            rotIStr = "90.0";
        }


    //double rotV = 100.0;  //surface equatorial rotation velocity in km/s
    //double rotI = 90.0;  //angle of rotation axis wrt to line-of-sight in degrees
    //double macroV = 2.0;  //standard deviation of Gaussian macroturbulent velocity field in km/s

//For rotation:
    double inclntn = Math.PI * rotI / 180;  //degrees to radians
    double vsini = rotV * Math.sin(inclntn);
//

//

//
// ************************ 
//
//  OPACITY  PROBLEM #1 - logFudgeTune:  late type star coninuous oapcity needs to have by multiplied 
//  by 10.0^0.5 = 3.0 for T_kin(tau~1) to fall around Teff and SED to look like B_lmabda(Trad=Teff).
//   - related to Opacity problem #2 in LineKappa.lineKap() - ??
//
  double logFudgeTune = 0.0;
  //sigh - don't ask me - makes the Balmer lines show up around A0:
      if (teff <= F0Vtemp){
          logFudgeTune = 0.5;
      }
      if (teff > F0Vtemp){
          logFudgeTune = 0.0;
      }

   double logTotalFudge = logKapFudge + logFudgeTune;

        double logE = Math.log10(Math.E); // for debug output
        double logE10 = Math.log(10.0); //natural log of 10

        //Gray structure and Voigt line code code begins here:
// Initial set-up:
        // optical depth grid
        int numDeps = 48;
        double log10MinDepth = -6.0;
        double log10MaxDepth = 2.0;
        //int numThetas = 10;  // Guess

        //wavelength grid (cm):
        double[] lamSetup = new double[3];
        lamSetup[0] = 300.0 * 1.0e-7;  // test Start wavelength, cm
        //lamSetup[0] = 100.0 * 1.0e-7;  // test Start wavelength, cm
        lamSetup[1] = 1000.0 * 1.0e-7; // test End wavelength, cm
        lamSetup[2] = 250;  // test number of lambda
        //int numLams = (int) (( lamSetup[1] - lamSetup[0] ) / lamSetup[2]) + 1;  
        int numLams = (int) lamSetup[2];

        //CONTINUUM lambda scale (nm)
        double lambdaScale[] = LamGrid.lamgrid(numLams, lamSetup); //cm

// Solar parameters:
        double teffSun = 5778.0;
        double loggSun = 4.44;
        double gravSun = Math.pow(10.0, loggSun);
        double log10ZScaleSun = 0.0;
        double zScaleSun = Math.exp(log10ZScaleSun);

//Solar units:
        double massSun = 1.0;
        double radiusSun = 1.0;
        //double massStar = 1.0; //solar masses // test
        double logRadius = 0.5 * (Math.log(massStar) + Math.log(gravSun) - Math.log(grav));
        double radius = Math.exp(logRadius); //solar radii
        //double radius = Math.sqrt(massStar * gravSun / grav); // solar radii
        double logLum = 2.0 * Math.log(radius) + 4.0 * Math.log(teff / teffSun);
        double bolLum = Math.exp(logLum); // L_Bol in solar luminosities 
     //cgs units:
        double rSun = 6.955e10; // solar radii to cm

        double cgsRadius = radius * rSun;
        double omegaSini = (1.0e5 * vsini) / cgsRadius; // projected rotation rate in 1/sec
        double macroVkm = macroV * 1.0e5;  //km/s to cm/s

        //Composition by mass fraction - needed for opacity approximations
        //   and interior structure
        double massX = 0.70; //Hydrogen
        double massY = 0.28; //Helium
        double massZSun = 0.02; // "metals"
        double massZ = massZSun * zScale; //approximation


        //double logNH = 17.0;

//
////Detailed checmical composition:
//Abundance table adapted from PHOENIX V. 15 input bash file
// Grevesse Asplund et al 2010
//Solar abundances:
// c='abundances, Anders & Grevesse',

  int nelemAbnd = 40;
  int[] nome = new int[nelemAbnd];
  double[] eheu = new double[nelemAbnd]; //log_10 "A_12" values
  double[] logAz = new double[nelemAbnd]; //N_z/H_H for element z
  double[][] logNz = new double[nelemAbnd][numDeps]; //N_z for element z
  String[] cname = new String[nelemAbnd];
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
  int numAssocMols = 4; //max number of associated molecules
  String[][] cnameMols = new String[nelemAbnd][numAssocMols];
  for (int iElem = 0; iElem < nelemAbnd; iElem++){
     for (int iMol = 0; iMol < numAssocMols; iMol++){
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
 // int nMols = 18;
  int nMols = 1;
  String[] mname = new String[nMols];
  String[] mnameA = new String[nMols];
  String[] mnameB = new String[nMols];

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
  mnameB[15] = "O"; */
  mname[0] = "TiO";
  mnameA[0] = "Ti";
  mnameB[0] = "O";
/*  mname[17] = "VO";
  mnameA[17] = "V";
  mnameB[17] = "O"; */

  double ATot = 0.0;
  double thisAz, eheuScale;
  for (int i = 0; i < nelemAbnd; i++){
     eheuScale = eheu[i];  //default initialization //still base 10
     if (i > 1){ //if not H or He
        eheuScale = eheu[i] + log10ZScale; //still base 10  
     }
     //logAz[i] = logE10 * (eheu[i] - 12.0); //natural log
     logAz[i] = logE10 * (eheuScale - 12.0); //natural log
     thisAz = Math.exp(logAz[i]);
     ATot = ATot + thisAz;
     //System.out.println("i " + i + " logAz " + logE*logAz[i]);
  }
  double logATot = Math.log(ATot); //natural log
  //System.out.println("logATot " + logE*logATot);

        //double sedThresh = 4.0; //line to continuum extinction threshold for 
                                 // inclusion as low resolution line in overall SED
        ////Output files:
        //String outfile = "gray_structure."
        //        + teffStr + "-" + loggStr + "-" + logKappaStr + ".out";
        //String specFile = "gray_spectrum."
        //        + teffStr + "-" + loggStr + "-" + logKappaStr + ".out";
        //String lineFile = "voigt_line."
        //        + teffStr + "-" + loggStr + "-" + logKappaStr + "-" + xitStr + ".out";

        //log_10 Rosseland optical depth scale  
        double tauRos[][] = TauScale.tauScale(numDeps, log10MinDepth, log10MaxDepth);



   //Apr 2016: Replace the following initial guesses with the following PSEUDOCODE:
   //
   // PHOENIX models at Teff0=5000 K, log(g0)=4.5, M0=0.0 (linear "zscl" = 10.0^M)
   //                   Teff0=10000 K, log(g0)=4.0, M0=0.0 (linear "zscl" = 10.0^M)
   //                   --> Tk0(tau), Pe0(tau), Pg0(tau)
   //
   //From Gray 3rd Ed. Ch.9, esp p. 189, 196
   // 1) Tk(tau)=Teff/Teff0*tk0(tau)
   // 2) Pg(tau)=(g/g0)^exp * Pg0(tau); exp = 0.64(bottom) - 0.54(top) for "cool" models
   //                                   exp = 0.85(bottom) - 0.53(top) for "hotter" models
   //    Pg(tau)= zscl^-0.333*Pg0(tau) if metals neutral - cooler models  
   //    Pg(tau)= zscl^-0.5*Pg0(tau) if metals ionized - hotter models
   //    Pg(tau) = {(1+4A_He)/(1+4A_He0)}^2/3 * Pg0(tau)  

   // 3) Pe(tau)=(g/g0)^exp * Pe0(tau); exp = 0.33(bottom) - 0.48(top) for "cool" models
   //                                   exp = 0.82(bottom) - 0.53(top) for "hotter" models
   //    Pe(tau)=exp(omega*Teff)/exp(omega*Teff0)* Pe0(tau), Teff < 10000 K
   //             - omega = 0.0015@log(tau)=1.0 & 0.0012@log(tau)=-1 to -3   
   //    Pe(tau)= zscl^+0.333*Pe0(tau) if metals neutral - cooler models  
   //    Pe(tau)= zscl^+0.5*Pe0(tau) if metals ionized - hotter models  
   //    Pe(tau) = {(1+4A_He)/(1+4A_He0)}^1/3 * Pe0(tau)  

        //Now do the same for the Sun, for reference:
        double[][] tempSun = ScaleSolar.phxSunTemp(teffSun, numDeps, tauRos);
        //Now do the same for the Sun, for reference:
        double[][] pGasSunGuess = ScaleSolar.phxSunPGas(gravSun, numDeps, tauRos);
        double[][] NeSun = ScaleSolar.phxSunNe(gravSun, numDeps, tauRos, tempSun, zScaleSun);
        double[][] kappaSun = ScaleSolar.phxSunKappa(numDeps, tauRos, zScaleSun);
        double[] mmwSun = State.mmwFn(numDeps, tempSun, zScaleSun);
        double[][] rhoSun = State.massDensity(numDeps, tempSun, pGasSunGuess, mmwSun, zScaleSun);
        //double pressSun[][] = Hydrostat.hydrostatic(numDeps, gravSun, tauRos, kappaSun, tempSun);
        double pGasSun[][] = Hydrostat.hydroFormalSoln(numDeps, gravSun, tauRos, kappaSun, tempSun, pGasSunGuess);
    //System.out.println("Sun: ");
    //for (int i=0; i<numDeps; i++){
    //  System.out.println("i " + i + " tauRos[1][i] " + logE*tauRos[1][i] + " temp " + tempSun[0][i] + " pGasSun " + logE*pGasSun[1][i] + " NeSun " + logE*NeSun[1][i] + " rhoSun " + logE*rhoSun[1][i]);
   // }
        //
        // BEGIN Initial guess for Sun section:
        //
        //Rescaled  kinetic temeprature structure: 
        //double F0Vtemp = 7300.0;  // Teff of F0 V star (K)                           
        double[][] temp = new double[2][numDeps];
        if (teff < F0Vtemp) {
            //We're a cool star! - rescale from Teff=5000 reference model!
            temp = ScaleT5000.phxRefTemp(teff, numDeps, tauRos);
        } else if (teff >= F0Vtemp) {
            //We're a HOT star! - rescale from Teff=10000 reference model! 
            temp = ScaleT10000.phxRefTemp(teff, numDeps, tauRos);
        }

        //Scaled from Phoenix solar model:
        double[][] guessPGas = new double[2][numDeps];
        double[][] guessPe = new double[2][numDeps];
        double[][] guessNe = new double[2][numDeps];
        //double[][] guessKappa = new double[2][numDeps];
        if (teff < F0Vtemp) {
            //We're a cool star - rescale from  Teff=5000 reference model!
            // logAz[1] = log_e(N_He/N_H)
            guessPGas = ScaleT5000.phxRefPGas(grav, zScale, logAz[1], numDeps, tauRos);
            guessPe = ScaleT5000.phxRefPe(teff, grav, numDeps, tauRos, zScale, logAz[1]);
            guessNe = ScaleT5000.phxRefNe(numDeps, temp, guessPe); 
            //Ne = ScaleSolar.phxSunNe(grav, numDeps, tauRos, temp, kappaScale);
            //guessKappa = ScaleSolar.phxSunKappa(numDeps, tauRos, kappaScale);
        } else if (teff >= F0Vtemp) {
            //We're a HOT star!! - rescale from Teff=10000 reference model 
            // logAz[1] = log_e(N_He/N_H)
            guessPGas = ScaleT10000.phxRefPGas(grav, zScale, logAz[1], numDeps, tauRos);
            guessPe = ScaleT10000.phxRefPe(teff, grav, numDeps, tauRos, zScale, logAz[1]);
            guessNe = ScaleT10000.phxRefNe(numDeps, temp, guessPe);
            //logKapFudge = -1.5;  //sigh - don't ask me - makes the Balmer lines show up around A0 
        }

      //System.out.println("i     temp      guessPGas      guessPe      10^-9*guessNe");
      //for (int i = 0; i < numDeps; i+=10){
      //   System.out.format("%03d, %21.15f, %21.15f, %21.15f, %21.15f%n", i, temp[0][i], guessPGas[0][i], guessPe[0][i], (1.0e-9*guessNe[0][i]));
      //}
        //

        // END initial guess for Sun section
        //
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


//    **** STOP ****  No - do we *really* need N_HI, ... for kappa if we use rho in HSE? - Yes - needed even if kappa
//    is in cm^-1 instead of cm^2/g - sigh

        //
        // mean molecular weight and Ne for Star & Sun
        //double[] mmw = State.mmwFn(numDeps, temp, kappaScale);
//
 //       double[][] guessRho = State.massDensity(numDeps, temp, guessPGas, mmw, kappaScale);


  int numStages = 5;
  String species = " "; //default initialization
  double[] logNH = new double[numDeps];
  double rho[][] = new double[2][numDeps];
  double[][][] masterStagePops = new double[nelemAbnd][numStages][numDeps];
  double[][] tauOneStagePops = new double[nelemAbnd][numStages];
  double unity = 1.0;
  double zScaleList = 1.0; //initialization   
  double[][] log10UwAArr = new double[numStages][2];
  for (int i = 0; i < numStages; i++){
    log10UwAArr[i][0] = 0.0; //default initialization - logarithmic
    log10UwAArr[i][1] = 0.0; //default initialization - logarithmic
  }
//  double[] thisUw1V = new double[2];
 // double[] thisUw2V = new double[2];
 // double[] thisUw3V = new double[2];
 // double[] thisUw4V = new double[2];
 //Ground state ionization E - Stage I (eV) 
  double[] chiIArr = new double[numStages];
//  double thisChiI1;
// //Ground state ionization E - Stage II (eV)
//  double thisChiI2;
//  double thisChiI3;
//  double thisChiI4;
//
//For diatomic molecules:
 String speciesAB = " ";
 String speciesA = " ";
 String speciesB = " ";
 double massA, massB, logMuAB;
 double[][] masterMolPops = new double[nMols][numDeps];
//initialize masterMolPops for mass density (rho) calculation:
  for (int i = 0; i < nMols; i++){
    for (int j = 0; j < numDeps; j++){
       masterMolPops[i][j] = -49.0;  //these are logarithmic
    }
  }
//We will interpolate in atomic partition fns tabulated at two temperatures
  double[] thisUwAV = new double[2];
  double[] thisUwBV = new double[2];
//We will interpolate in molecular partition fns tabulated at five temperatures
  double[] thisQwAB = new double[5];
  double thisDissE;

//
  double[][] newNe = new double[2][numDeps]; 
  double[][] newPe = new double[2][numDeps]; 
  double[][] logNums = new double[numStages][numDeps]; 
// For diatomic molecules:
  double[] logNumA = new double[numDeps];
  double[] logNumB = new double[numDeps];
  double[] logNumFracAB = new double[numDeps];
//

  double[] Ng = new double[numDeps];
  double[] mmw = new double[numDeps];
  double logMmw;
  double[][] logKappa = new double[numLams][numDeps];
  double[][] logKappaHHe = new double[numLams][numDeps];
  double[][] logKappaMetalBF = new double[numLams][numDeps];
  double[][] logKappaRayl = new double[numLams][numDeps];
  double[][] kappaRos = new double[2][numDeps];
  double[][] kappa500 = new double[2][numDeps];
  double[][] pGas = new double[2][numDeps]; 
  double[][] pRad = new double[2][numDeps]; 
  double[] depths = new double[numDeps];
  double[][] newTemp = new double[2][numDeps];


//Variables for ionization/molecular equilibrium treatment:
//for diatomic molecules
  double[][] logNumBArr = new double[numAssocMols][numDeps];
//We will interpolate in atomic partition fns tabulated at two temperatures
  double[][] log10UwBArr = new double[numAssocMols][2]; //base 10 log

  double[] dissEArr = new double[numAssocMols];
//We will interpolate in molecular partition fns tabulated at five temperatures
  double[][] logQwABArr = new double[numAssocMols][5]; //natural log
  double[] logMuABArr = new double[numAssocMols];

// Arrays ofpointers into master molecule and element lists:
   int[] mname_ptr = new int[numAssocMols];
   int[] specB_ptr = new int[numAssocMols];
   int specA_ptr = 0;
   int specB2_ptr = 0;
   String mnameBtemplate = " ";

//
//
//We converge the Pgas - Pe relation first under the assumption that all free e^-s are from single ionizations
// a la David Gray Ch. 9.  
// This approach separates converging ionization fractions and Ne for spectrum synthesis purposes from
// converging the Pgas-Pe-N_H-N_He relation for computing the mean opacity for HSE
//
double[] thisTemp = new double[2];
double[] log10UwUArr = new double[2];
double[] log10UwLArr = new double[2];
double chiI, peNumerator, peDenominator, logPhi, logPhiOverPe, logOnePlusPhiOverPe, logPeNumerTerm, logPeDenomTerm;
//Begin Pgas-kapp iteration
    for (int pIter = 0; pIter < 5; pIter++){
//
       //System.out.println("pIter " + pIter);

//  Converge Pg-Pe relation starting from intital guesses at Pg and Pe
//  - assumes all free electrons are from single ionizations
//  - David Gray 3rd Ed. Eq. 9.8:

  for (int neIter = 0; neIter < 5; neIter++){
    //System.out.println("iD    logE*newPe[1][iD]     logE*guessPe[1]     logE*guessPGas[1]");
    for (int iD = 0; iD < numDeps; iD++){
    //re-initialize accumulators:
       thisTemp[0] = temp[0][iD];
       thisTemp[1] = temp[1][iD];
       peNumerator = 0.0; 
       peDenominator = 0.0;
       for (int iElem = 0; iElem < nelemAbnd; iElem++){
           species = cname[iElem] + "I";
           chiI = IonizationEnergy.getIonE(species);
    //THe following is a 2-element vector of temperature-dependent partitio fns, U, 
    // that are base 10 log_10 U
           log10UwLArr = PartitionFn.getPartFn(species); //base 10 log_10 U
           species = cname[iElem] + "II";
           log10UwUArr = PartitionFn.getPartFn(species); //base 10 log_10 U
           logPhi = LevelPopsServer.sahaRHS(chiI, log10UwUArr, log10UwLArr, thisTemp);
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

    for (int iD = 0; iD < numDeps; iD++){
       newNe[1][iD] = newPe[1][iD] - temp[1][iD] - Useful.logK();
    }

//
//Get the number densities of the chemical elements at all depths  
     logNz = State.getNz(numDeps, temp, guessPGas, guessPe, ATot, nelemAbnd, logAz);
     for (int i = 0 ; i < numDeps; i++){ 
        logNH[i] = logNz[0][i];
        //System.out.println("i " + i + " logNH[i] " + logE*logNH[i]);
     } 

//
//  Compute ionization fractions of H & He for kappa calculation 
//
//  Default inializations:
       zScaleList = 1.0; //initialization   
       //these 2-element temperature-dependent partition fns are logarithmic  

//Default initialization:
       for (int i = 0; i < numAssocMols; i++){
           for (int j = 0; j < numDeps; j++){
               logNumBArr[i][j] = -49.0;
           }
           log10UwBArr[i][0] = 0.0;
           log10UwBArr[i][1] = 0.0;
           dissEArr[i] = 29.0;  //eV
           for (int kk = 0; kk < 5; kk++){ 
               logQwABArr[i][kk] = Math.log(300.0);
           }
           logMuABArr[i] = Math.log(2.0) + Useful.logAmu();  //g
           mname_ptr[i] = 0;
           specB_ptr[i] = 0;
       }

       double defaultQwAB = Math.log(300.0); //for now
    //default that applies to most cases - neutral stage (I) forms molecules
       int specBStage = 0; //default that applies to most cases

   //For element A of main molecule being treated in *molecular* equilibrium:
   //For safety, assign default values where possible
       double nmrtrDissE = 15.0; //prohitively high by default
       double[] nmrtrLog10UwB = new double[2];
       nmrtrLog10UwB[0] = 0.0;
       nmrtrLog10UwB[1] = 0.0;
       double nmrtrLog10UwA = 0.0;
       double[] nmrtrLogQwAB = new double[5];
       for (int kk = 0; kk < 5; kk++){
          nmrtrLogQwAB[kk] = Math.log(300.0);
       }
       double nmrtrLogMuAB = Useful.logAmu();
       double[] nmrtrLogNumB = new double[numDeps];
       for (int i = 0; i < numDeps; i++){
          nmrtrLogNumB[i] = 0.0;
       }

     double totalIonic;
     double[] logGroundRatio = new double[numDeps];


//
////H & He only for now... we only compute H, He, and e^- opacity sources: 
   //for (int iElem = 0; iElem < 2; iElem++){
//H to Fe only for now... we only compute opacity sources for elements up to Fe: 
   for (int iElem = 0; iElem < 26; iElem++){
       species = cname[iElem] + "I";
       chiIArr[0] = IonizationEnergy.getIonE(species);
    //THe following is a 2-element vector of temperature-dependent partitio fns, U, 
    // that are base 10 log_10 U
       log10UwAArr[0] = PartitionFn.getPartFn(species); //base 10 log_10 U
       species = cname[iElem] + "II";
       chiIArr[1] = IonizationEnergy.getIonE(species);
       log10UwAArr[1] = PartitionFn.getPartFn(species); //base 10 log_10 U
       species = cname[iElem] + "III";
       chiIArr[2] = IonizationEnergy.getIonE(species);
       log10UwAArr[2] = PartitionFn.getPartFn(species); //base 10 log_10 U
       //double logN = (eheu[iElem] - 12.0) + logNH;

       int thisNumMols = 0; //default initialization
       for (int iMol = 0; iMol < numAssocMols; iMol++){
          //console.log("iMol " + iMol + " cnameMols " + cnameMols[iElem][iMol]);
          if (cnameMols[iElem][iMol] == "None"){
            break;
          }
          thisNumMols++;
       }
     //console.log("thisNumMols " + thisNumMols);
     if (thisNumMols > 0){
       //Find pointer to molecule in master mname list for each associated molecule:
       for (int iMol = 0; iMol < thisNumMols; iMol++){
          for (int jj = 0; jj < nMols; jj++){
             if (cnameMols[iElem][iMol] == mname[jj]){
                mname_ptr[iMol] = jj; //Found it!
                break;
             }
          } //jj loop in master mnames list
       } //iMol loop in associated molecules
//Now find pointer to atomic species B in master cname list for each associated molecule found in master mname list!
       for (int iMol = 0; iMol < thisNumMols; iMol++){
          for (int jj = 0; jj < nelemAbnd; jj++){
             if (mnameB[mname_ptr[iMol]] == cname[jj]){
                specB_ptr[iMol] = jj; //Found it!
                break;
             }
          } //jj loop in master cnames list
       } //iMol loop in associated molecules

//Now load arrays with molecular species AB and atomic species B data for method stagePops2()
       for (int iMol = 0; iMol < thisNumMols; iMol++){
  //special fix for H^+_2:
         if (mnameB[mname_ptr[iMol]] == "H2+"){
            specBStage = 1;
         } else {
            specBStage = 0;
         }
          for (int iTau = 0; iTau < numDeps; iTau++){
             //console.log("iMol " + iMol + " iTau " + iTau + " specB_ptr[iMol] " + specB_ptr[iMol]);
//Note: Here's one place where ionization equilibrium iteratively couples to molecular equilibrium!
             logNumBArr[iMol][iTau] = masterStagePops[specB_ptr[iMol]][specBStage][iTau];
          }
          dissEArr[iMol] = IonizationEnergy.getDissE(mname[mname_ptr[iMol]]);
          species = cname[specB_ptr[iMol]] + "I"; //neutral stage
          log10UwBArr[iMol] = PartitionFn.getPartFn(species); //base 10 log_10 U
          //logQwABArr[iMol] = defaultQwAB;
          logQwABArr[iMol] = PartitionFn.getMolPartFn(mname[mname_ptr[iMol]]);
          //Compute the reduced mass, muAB, in g:
          massA = AtomicMass.getMass(cname[iElem]);
          massB = AtomicMass.getMass(cname[specB_ptr[iMol]]);
          logMuABArr[iMol] = Math.log(massA) + Math.log(massB) - Math.log(massA + massB) + Useful.logAmu();
       }
   } //if thisNumMols > 0 condition

    //   logNums = LevelPopsServer.stagePops(logNz[iElem], guessNe, thisChiI1,
    //         thisChiI2, thisChiI3, thisChiI4, thisUw1V, thisUw2V, thisUw3V, thisUw4V, 
    //         numDeps, temp);
       logNums = LevelPopsServer.stagePops2(logNz[iElem], guessNe, chiIArr, log10UwAArr,
                     thisNumMols, logNumBArr, dissEArr, log10UwBArr, logQwABArr, logMuABArr,
                     numDeps, temp);

     //System.out.println("Main: Elem       iTau      logNz      logNums[0]      ppNums[0]");
     for (int iStage = 0; iStage < numStages; iStage++){
          for (int iTau = 0; iTau < numDeps; iTau++){
            //if ((cname[iElem].equals("O") == true) && (iStage == 0)){
            //   System.out.format("O, %03d, %21.15f, %21.15f, %21.15f%n", iTau, logE*logNz[iElem][iTau], logE*logNums[iStage][iTau],
            //     logE*(logNums[iStage][iTau]+Useful.logK()+temp[1][iTau]));
            //}
            //if ((cname[iElem].equals("Ti") == true) && (iStage == 0)){
            //   System.out.format("Ti, %03d, %21.15f, %21.15f, %21.15f%n", iTau, logE*logNz[iElem][iTau], logE*logNums[iStage][iTau],
            //     logE*(logNums[iStage][iTau]+Useful.logK()+temp[1][iTau]));
            //}
            masterStagePops[iElem][iStage][iTau] = logNums[iStage][iTau];
 //save ion stage populations at tau = 1:
       } //iTau loop
    } //iStage loop
            //System.out.println("iElem " + iElem);
            //if (iElem == 1){
            //  for (int iTau = 0; iTau < numDeps; iTau++){
            //   System.out.println("cname: " + cname[iElem] + " " + logE*list2LogNums[0][iTau] + " " + logE*list2LogNums[1][iTau]);
            //  } 
            // }
  } //iElem loop

    
//Get mass density from chemical composition: 
     rho = State.massDensity2(numDeps, nelemAbnd, logNz, cname);
      //System.out.println("i      logNz[0]      rho[1]");
      //for (int i = 0; i < numDeps; i+=10){
      //   System.out.format("%03d, %21.15f, %21.15f%n", i, logE*logNz[0][i], logE*rho[1][i]);
      //}
     //for (int i = 0 ; i < numDeps; i++){
       //System.out.println("i " + i + " rho " + logE*rho[1][i]);
     //}

//Total number density of gas particles: nuclear species + free electrons:
//AND
 //Compute mean molecular weight, mmw ("mu"):
    for (int i = 0; i < numDeps; i++){
      Ng[i] =  newNe[0][i]; //initialize accumulation with Ne 
    }
    for (int i = 0; i < numDeps; i++){
      for (int j = 0; j < nelemAbnd; j++){
         Ng[i] =  Ng[i] + Math.exp(logNz[j][i]); //initialize accumulation 
      }
     logMmw = rho[1][i] - Math.log(Ng[i]);  // in g
     mmw[i] = Math.exp(logMmw); 
       //System.out.println("i " + i + " Ng " + Math.log10(Ng[i]) + " mmw " + (mmw[i]/Useful.amu));
    }
      //System.out.println("i     10^-9*Ng     mmw");
      //for (int i = 0; i < numDeps; i+=10){
      //   System.out.format("%03d, %21.15f, %21.15f%n", i, (1.0e-9*Ng[i]), (mmw[i]/Useful.amu));
      //}


//H & He only for now... we only compute H, He, and e^- opacity sources: 
      logKappaHHe = Kappas.kappas2(numDeps, newPe, zScale, temp, rho,
                     numLams, lambdaScale, logAz[1],
                     masterStagePops[0][0], masterStagePops[0][1], 
                     masterStagePops[1][0], masterStagePops[1][1], newNe, 
                     teff, logTotalFudge);

//Add in metal b-f opacity from adapted Moog routines:
      //System.out.println("Calling masterMetal from GSS...");
      logKappaMetalBF = KappasMetal.masterMetal(numDeps, numLams, temp, lambdaScale, masterStagePops);
//Add in Rayleigh scattering opacity from adapted Moog routines:
      logKappaRayl = KappasRayl.masterRayl(numDeps, numLams, temp, lambdaScale, masterStagePops, masterMolPops);

//Convert metal b-f & Rayleigh scattering oapcities to cm^2/g and sum up total opacities
   double logKapMetalBF, logKapRayl, kapContTot;
   //System.out.println("i     tauRos      l      lamb     kappa    kappaHHe    kappaMtl     kappaRayl    kapContTot");
   for (int iL = 0; iL < numLams; iL++){
       for (int iD = 0; iD < numDeps; iD++){
          logKapMetalBF = logKappaMetalBF[iL][iD] - rho[1][iD]; 
          logKapRayl = logKappaRayl[iL][iD] - rho[1][iD]; 
          kapContTot = Math.exp(logKappaHHe[iL][iD]) + Math.exp(logKapMetalBF) + Math.exp(logKapRayl); 
          logKappa[iL][iD] = Math.log(kapContTot);
         // if ( (iD%10 == 1) && (iL%10 == 0) ){
         //    System.out.format("%03d, %21.15f, %03d, %21.15f, %21.15f, %21.15f, %21.15f, %21.15f %n", 
         //     iD, tauRos[0][iD], iL, lambdaScale[iL], logE*logKappaHHe[iL][iD], 
         //     logE*(logKapMetalBF), logE*(logKapRayl), logE*logKappa[iL][iD]);
         // }
       }
   } 

     // System.out.println("i     tauRos      l      lamb     kappa    kappaMtl     kappaRayl");
     // for (int i = 0; i < numDeps; i+=10){
     //    for (int l = 0; l < numLams; l+=10){
     //       System.out.format("%03d, %21.15f, %03d, %21.15f, %21.15f, %21.15f, %21.15f%n", 
     //        i, tauRos[0][i], l, lambdaScale[l], logE*logKappa[l][i], 
     //        logE*(logKappaMetalBF[l][i]-rho[1][i]), logE*(logKappaRayl[l][i]-rho[1][i]));
     //    }
     // }

      kappaRos = Kappas.kapRos(numDeps, numLams, lambdaScale, logKappa, temp); 
      //System.out.println("i     tauRos      logNH      kappa");
      //for (int i = 0; i < numDeps; i+=10){
      //      System.out.format("%03d, %21.15f, %21.15f, %21.15f%n", i, tauRos[0][i], logE*masterStagePops[0][0][i], logE*kappaRos[1][i]);
      //}

//Extract the "kappa_500" monochroamtic continuum oapcity scale
// - this means we'll try interpreting the prescribed tau grid (still called "tauRos")as the "tau500" scale
      int it500 = ToolBox.lamPoint(numLams, lambdaScale, 500.0e-7);
      //System.out.println("i         tauRos[1]        kap500");
    //  System.out.println("i         tauRos[1]        kapRos");
      for (int i = 0; i < numDeps; i++){
         kappa500[1][i] = logKappa[it500][i];
         kappa500[0][i] = Math.exp(kappa500[1][i]);
     //  if (i%10 == 0){
         //System.out.format("%03d, %21.15f, %21.15f%n", i, logE*tauRos[1][i], logE*kappa500[1][i]);
        // System.out.format("%03d, %21.15f, %21.15f%n", i, logE*tauRos[1][i], logE*kappaRos[1][i]);
      //               }
      }

        //press = Hydrostat.hydrostatic(numDeps, grav, tauRos, kappaRos, temp);
        pGas = Hydrostat.hydroFormalSoln(numDeps, grav, tauRos, kappaRos, temp, guessPGas);
        //pGas = Hydrostat.hydroFormalSoln(numDeps, grav, tauRos, kappa500, temp, guessPGas);
      //System.out.println("i        guessPGas         pGas");
     // for (int i = 0; i < numDeps; i+=10){
     //    System.out.format("%03d, %21.15f, %21.15f%n", i, logE*guessPGas[1][i], logE*pGas[1][i]);
     // }
        pRad = Hydrostat.radPress(numDeps, temp);

//Update Pgas guess for iteration:
    //  System.out.println("i        guessPe         newPe");
        for (int iTau = 0; iTau < numDeps; iTau++){
// Now we can update guessPGas:
            guessPGas[0][iTau] = pGas[0][iTau];
            guessPGas[1][iTau] = pGas[1][iTau];
            //System.out.println("iTau " + iTau + " pGas[0][iTau] " + logE*pGas[1][iTau] + " newPe[0][iTau] " + logE*newPe[1][iTau]);
        } 

 } //end Pgas-kappa iteration

        // Then construct geometric depth scale from tau, kappa and rho
        depths = DepthScale.depthScale(numDeps, tauRos, kappaRos, rho);
        //depths = DepthScale.depthScale(numDeps, tauRos, kappa500, rho);

        //int numTCorr = 10;  //test
        int numTCorr = 0;
        for (int i = 0; i < numTCorr; i++) {
            //newTemp = TCorr.tCorr(numDeps, tauRos, temp);
            newTemp = MulGrayTCorr.mgTCorr(numDeps, teff, tauRos, temp, rho, kappaRos);
            //newTemp = MulGrayTCorr.mgTCorr(numDeps, teff, tauRos, temp, rho, kappa500);
            for (int iTau = 0; iTau < numDeps; iTau++) {
                temp[1][iTau] = newTemp[1][iTau];
                temp[0][iTau] = newTemp[0][iTau];
            }
        }

        /*
         //Convection:
         // Teff below which stars are convective.  
         //  - has to be finessed because Convec.convec() does not work well :-(
         double convTeff = 6500.0;
         double[][] convTemp = new double[2][numDeps];
         if (teff < convTeff) {
         convTemp = Convec.convec(numDeps, tauRos, depths, temp, press, rho, kappaRos, kappaSun, zScale, teff, logg);

         for (int iTau = 0; iTau < numDeps; iTau++) {
         temp[1][iTau] = convTemp[1][iTau];
         temp[0][iTau] = convTemp[0][iTau];
         }
         }
         */
        boolean ifTcorr = false;
        boolean ifConvec = false;
        if ((ifTcorr == true) || (ifConvec == true)) {
            //Recall hydrostat with updates temps            
            //Recall state withupdated Press                    
            //recall kappas withupdates rhos
            //Recall depths with re-updated kappas
        }

//
// Now that the atmospheric structure is settled: 
// Separately converge the Ne-ionization-fractions-molecular equilibrium for
// all elements and populate the ionization stages of all the species for spectrum synthesis:
//
//stuff to save ion stage pops at tau=1:
  int iTauOne = ToolBox.tauPoint(numDeps, tauRos, unity);

//
//  Default inializations:
       zScaleList = 1.0; //initialization
       //these 2-element temperature-dependent partition fns are logarithmic

//Default initialization:
       for (int i = 0; i < numAssocMols; i++){
           for (int j = 0; j < numDeps; j++){
               logNumBArr[i][j] = -49.0;
           }
           log10UwBArr[i][0] = 0.0;
           log10UwBArr[i][1] = 0.0;
           dissEArr[i] = 29.0;  //eV
           for (int kk = 0; kk < 5; kk++){
               logQwABArr[i][kk] = Math.log(300.0);
           }
           logMuABArr[i] = Math.log(2.0) + Useful.logAmu();  //g
           mname_ptr[i] = 0;
           specB_ptr[i] = 0;
       }

       double defaultQwAB = Math.log(300.0); //for now
    //default that applies to most cases - neutral stage (I) forms molecules
       int specBStage = 0; //default that applies to most cases

   //For element A of main molecule being treated in *molecular* equilibrium:
   //For safety, assign default values where possible
       double nmrtrDissE = 15.0; //prohitively high by default
       double[] nmrtrLog10UwB = new double[2];
       nmrtrLog10UwB[0] = 0.0;
       nmrtrLog10UwB[1] = 0.0;
       double nmrtrLog10UwA = 0.0;
       double[] nmrtrLogQwAB = new double[5];
       for (int kk = 0; kk < 5; kk++){
          nmrtrLogQwAB[kk] = Math.log(300.0);
       }
       double nmrtrLogMuAB = Useful.logAmu();
       double[] nmrtrLogNumB = new double[numDeps];
       for (int i = 0; i < numDeps; i++){
          nmrtrLogNumB[i] = 0.0;
       }

     double totalIonic;
     double[] logGroundRatio = new double[numDeps];


//Iterate the electron densities, ionization fractions, and molecular densities:
//
 for (int neIter2 = 0; neIter2 < 5; neIter2++){

   //System.out.println("neIter2 " + neIter2);

   for (int iElem = 0; iElem < nelemAbnd; iElem++){
       species = cname[iElem] + "I";
       chiIArr[0] = IonizationEnergy.getIonE(species);
    //THe following is a 2-element vector of temperature-dependent partitio fns, U,
    // that are base 10 log_10 U
       log10UwAArr[0] = PartitionFn.getPartFn(species); //base 10 log_10 U
       species = cname[iElem] + "II";
       chiIArr[1] = IonizationEnergy.getIonE(species);
       log10UwAArr[1] = PartitionFn.getPartFn(species); //base 10 log_10 U
       species = cname[iElem] + "III";
       chiIArr[2] = IonizationEnergy.getIonE(species);
       log10UwAArr[2] = PartitionFn.getPartFn(species); //base 10 log_10 U
       species = cname[iElem] + "IV";
       chiIArr[3] = IonizationEnergy.getIonE(species);
       log10UwAArr[3]= PartitionFn.getPartFn(species); //base 10 log_10 U
       //double logN = (eheu[iElem] - 12.0) + logNH;

       int thisNumMols = 0; //default initialization
       for (int iMol = 0; iMol < numAssocMols; iMol++){
          //console.log("iMol " + iMol + " cnameMols " + cnameMols[iElem][iMol]);
          if (cnameMols[iElem][iMol] == "None"){
            break;
          }
          thisNumMols++;
       }
     //console.log("thisNumMols " + thisNumMols);
     if (thisNumMols > 0){
       //Find pointer to molecule in master mname list for each associated molecule:
       for (int iMol = 0; iMol < thisNumMols; iMol++){
          for (int jj = 0; jj < nMols; jj++){
             if (cnameMols[iElem][iMol] == mname[jj]){
                mname_ptr[iMol] = jj; //Found it!
                break;
             }
          } //jj loop in master mnames list
       } //iMol loop in associated molecules
//Now find pointer to atomic species B in master cname list for each associated molecule found in master mname list!
       for (int iMol = 0; iMol < thisNumMols; iMol++){
          for (int jj = 0; jj < nelemAbnd; jj++){
             if (mnameB[mname_ptr[iMol]] == cname[jj]){
                specB_ptr[iMol] = jj; //Found it!
                break;
             }
          } //jj loop in master cnames list
       } //iMol loop in associated molecules

//Now load arrays with molecular species AB and atomic species B data for method stagePops2()
       for (int iMol = 0; iMol < thisNumMols; iMol++){
  //special fix for H^+_2:
         if (mnameB[mname_ptr[iMol]] == "H2+"){
            specBStage = 1;
         } else {
            specBStage = 0;
         }
          for (int iTau = 0; iTau < numDeps; iTau++){
             //console.log("iMol " + iMol + " iTau " + iTau + " specB_ptr[iMol] " + specB_ptr[iMol]);
//Note: Here's one place where ionization equilibrium iteratively couples to molecular equilibrium!
             logNumBArr[iMol][iTau] = masterStagePops[specB_ptr[iMol]][specBStage][iTau];
          }
          dissEArr[iMol] = IonizationEnergy.getDissE(mname[mname_ptr[iMol]]);
          species = cname[specB_ptr[iMol]] + "I"; //neutral stage
          log10UwBArr[iMol] = PartitionFn.getPartFn(species); //base 10 log_10 U
          //logQwABArr[iMol] = defaultQwAB;
          logQwABArr[iMol] = PartitionFn.getMolPartFn(mname[mname_ptr[iMol]]);
          //Compute the reduced mass, muAB, in g:
          massA = AtomicMass.getMass(cname[iElem]);
          massB = AtomicMass.getMass(cname[specB_ptr[iMol]]);
          logMuABArr[iMol] = Math.log(massA) + Math.log(massB) - Math.log(massA + massB) + Useful.logAmu();
       }
   } //if thisNumMols > 0 condition

    //   logNums = LevelPopsServer.stagePops(logNz[iElem], guessNe, thisChiI1,
    //         thisChiI2, thisChiI3, thisChiI4, thisUw1V, thisUw2V, thisUw3V, thisUw4V,
    //         numDeps, temp);
       logNums = LevelPopsServer.stagePops2(logNz[iElem], guessNe, chiIArr, log10UwAArr,
                     thisNumMols, logNumBArr, dissEArr, log10UwBArr, logQwABArr, logMuABArr,
                     numDeps, temp);

     //System.out.println("Main: Elem       iTau      logNz      logNums[0]      ppNums[0]");
     for (int iStage = 0; iStage < numStages; iStage++){
          for (int iTau = 0; iTau < numDeps; iTau++){
            //if ((cname[iElem].equals("O") == true) && (iStage == 0)){
            //   System.out.format("O, %03d, %21.15f, %21.15f, %21.15f%n", iTau, logE*logNz[iElem][iTau], logE*logNums[iStage][iTau],
            //     logE*(logNums[iStage][iTau]+Useful.logK()+temp[1][iTau]));
            //}
            //if ((cname[iElem].equals("Ti") == true) && (iStage == 0)){
            //   System.out.format("Ti, %03d, %21.15f, %21.15f, %21.15f%n", iTau, logE*logNz[iElem][iTau], logE*logNums[iStage][iTau],
            //     logE*(logNums[iStage][iTau]+Useful.logK()+temp[1][iTau]));
            //}
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

// Compute all molecular populations:
//
// *** CAUTION: specB2_ptr refers to element B of main molecule being treated
// specB_ptr[] is an array of pointers to element B of all molecules associated with
// element A
// mname_ptr[] is an array of pointers pointing to the molecules themselves that are
// associated with element A
   double[] log10UwA = new double[2];
   for (int iMol = 0; iMol < nMols; iMol++){

 //Find elements A and B in master atomic element list:
 //console.log("iMol " + iMol + " mname[iMol] " + mname[iMol] + " mnameA[iMol] " + mnameA[iMol] + " mnameB[iMol] " + mnameB[iMol]);
    specA_ptr = 0;
    specB2_ptr = 0;
    for (int jj = 0; jj < nelemAbnd; jj++){
       if (mnameA[iMol] == cname[jj]){
         specA_ptr = jj;
         break;  //found it!
       }
    }
  //console.log("specA_ptr " + specA_ptr + " cname[specA_ptr] " + cname[specA_ptr]);
// Get its partition fn:
    species = cname[specA_ptr] + "I"; //neutral stage
    log10UwA = PartitionFn.getPartFn(species); //base 10 log_10 U
    for (int jj = 0; jj < nelemAbnd; jj++){
       if (mnameB[iMol] == cname[jj]){
         specB2_ptr = jj;
         break;  //found it!
       }
    }
  //console.log("specB2_ptr " + specB2_ptr + " cname[specB2_ptr] " + cname[specB2_ptr]);

//We will solve for N_AB/N_A - neutral stage of species A (AI) will be kept on LHS of molecular Saha equations -
// Therefore, we need ALL the molecules species A participates in - including the current molecule itself
// - at this point, it's just like setting up the ionization equilibrium to account for molecules as above...
       int thisNumMols = 0; //default initialization
       for (int im = 0; im < numAssocMols; im++){
          //console.log("iMol " + iMol + " cnameMols " + cnameMols[iElem][iMol]);
          if (cnameMols[specA_ptr][im] == "None"){
            break;
          }
          thisNumMols++;
       }
     //console.log("thisNumMols " + thisNumMols);
     if (thisNumMols > 0){
       //Find pointer to molecule in master mname list for each associated molecule:
       for (int im = 0; im < thisNumMols; im++){
          for (int jj = 0; jj < nMols; jj++){
             if (cnameMols[specA_ptr][im] == mname[jj]){
                mname_ptr[im] = jj; //Found it!
                break;
             }
          } //jj loop in master mnames list
   //console.log("im " + im + " mname_ptr[im] " + mname_ptr[im] + " mname[mname_ptr[im]] " + mname[mname_ptr[im]]);
       } //im loop in associated molecules

//Now find pointer to atomic species B in master cname list for each associated molecule found in master mname list!
       for (int im = 0; im < thisNumMols; im++){
          mnameBtemplate = " "; //initialization
// "Species B" is whichever element is NOT species "A" in master molecule
          if (mnameB[mname_ptr[im]] == mnameA[iMol]){
             //get the *other* atom
             mnameBtemplate = mnameA[mname_ptr[im]];
          } else {
             mnameBtemplate = mnameB[mname_ptr[im]];
          }
          //console.log("mnameA[mname_ptr[im]] " + mnameA[mname_ptr[im]] + " mnameB[mname_ptr[im]] " + mnameB[mname_ptr[im]] + " mnameBtemplate " + mnameBtemplate);
          for (int jj = 0; jj < nelemAbnd; jj++){
             if (mnameBtemplate == cname[jj]){
                //console.log("If condition met: jj " + jj + " cname[jj] " + cname[jj]);
                specB_ptr[im] = jj; //Found it!
                break;
             }
          } //jj loop in master cnames list
   //console.log("im " + im + " specB_ptr[im] " + specB_ptr[im] + " cname[specB_ptr[im]] " + cname[specB_ptr[im]]);
       } //iMol loop in associated molecules

//Now load arrays with molecular species AB and atomic species B data for method molPops()
       for (int im = 0; im < thisNumMols; im++){
      //special fix for H^+_2:
         if (mname[mname_ptr[im]] == "H2+"){
           specBStage = 1;
         } else {
           specBStage = 0;
         }
          for (int iTau = 0; iTau < numDeps; iTau++){
             //console.log("iMol " + iMol + " iTau " + iTau + " specB_ptr[iMol] " + specB_ptr[iMol]);
//Note: Here's one place where ionization equilibrium iteratively couples to molecular equilibrium!
             logNumBArr[im][iTau] = masterStagePops[specB_ptr[im]][specBStage][iTau];
          }
          dissEArr[im] = IonizationEnergy.getDissE(mname[mname_ptr[im]]);
          species = cname[specB_ptr[im]] + "I";
          log10UwBArr[im] = PartitionFn.getPartFn(species); //base 10 log_10 U
          //logQwABArr[im] = defaultQwAB;
          logQwABArr[im] = PartitionFn.getMolPartFn(mname[mname_ptr[im]]);
          //Compute the reduced mass, muAB, in g:
          massA = AtomicMass.getMass(cname[specA_ptr]);
          massB = AtomicMass.getMass(cname[specB_ptr[im]]);
          logMuABArr[im] = Math.log(massA) + Math.log(massB) - Math.log(massA + massB) + Useful.logAmu();
 // One of the species A-associated molecules will be the actual molecule, AB, for which we want
 // the population - pick this out for the numerator in the master fraction:
          if (mname[mname_ptr[im]] == mname[iMol]){
              nmrtrDissE = dissEArr[im];
 //console.log("Main: log10UwBArr[im][0] " + log10UwBArr[im][0] + " log10UwBArr[im][1] " + log10UwBArr[im][1]);
              nmrtrLog10UwB[0] = log10UwBArr[im][0];
              nmrtrLog10UwB[1] = log10UwBArr[im][1];
              for (int kk = 0; kk < 5; kk++){
                  nmrtrLogQwAB[kk] = logQwABArr[im][kk];
              }
              nmrtrLogMuAB = logMuABArr[im];
 //console.log("Main: nmrtrDissE " + nmrtrDissE + " nmrtrLogMuAB " + nmrtrLogMuAB);
              for (int iTau = 0; iTau < numDeps; iTau++){
                 nmrtrLogNumB[iTau] = logNumBArr[im][iTau];
              }
          }
       } //im loop
 //console.log("Main: nmrtrLog10UwB[0] " + nmrtrLog10UwB[0] + " nmrtrLog10UwB[1] " + nmrtrLog10UwB[1]);
//
   } //if thisNumMols > 0 condition
   //Compute total population of particle in atomic ionic stages over number in ground ionization stage
   //for master denominator so we don't have to re-compue it:
         //System.out.println("MAIN: iTau      nmrtrLogNumB      logNumBArr[0]      logGroundRatio");
         for (int iTau = 0; iTau < numDeps; iTau++){
           //initialization:
           totalIonic = 0.0;
           for (int iStage = 0; iStage < numStages; iStage++){
              totalIonic = totalIonic + Math.exp(masterStagePops[specA_ptr][iStage][iTau]);
           }
           logGroundRatio[iTau] = Math.log(totalIonic) - masterStagePops[specA_ptr][0][iTau];
           //System.out.format("%03d, %21.15f, %21.15f, %21.15f, %n", iTau, logE*nmrtrLogNumB[iTau], logE*logNumBArr[0][iTau], logE*logGroundRatio[iTau]);
         }
       //System.out.println("MAIN: nmrtrDissE " + nmrtrDissE + " log10UwA " + log10UwA[0] + " " + log10UwA[1] + " nmrtrLog10UwB " +
       //     nmrtrLog10UwB[0] + " " + nmrtrLog10UwB[1] + " nmrtrLog10QwAB[2] " + logE*nmrtrLogQwAB[2] + " nmrtrLogMuAB " + logE*nmrtrLogMuAB
       //     + " thisNumMols " + thisNumMols + " dissEArr " + dissEArr[0] + " log10UwBArr " + log10UwBArr[0][0] + " " + log10UwBArr[0][1] + " log10QwABArr " +
       //     logE*logQwABArr[0][2] + " logMuABArr " + logE*logMuABArr[0]);
       logNumFracAB = LevelPopsServer.molPops(nmrtrLogNumB, nmrtrDissE, log10UwA, nmrtrLog10UwB, nmrtrLogQwAB, nmrtrLogMuAB,
                     thisNumMols, logNumBArr, dissEArr, log10UwBArr, logQwABArr, logMuABArr,
                     logGroundRatio, numDeps, temp);

//Load molecules into master molecular population array:
     // System.out.println("cname[specA_ptr] " + cname[specA_ptr]);
      //System.out.println("iTau      temp     logNz[specA_ptr]      masterMolPops[iMol]      ppMol");
      for (int iTau = 0; iTau < numDeps; iTau++){
         masterMolPops[iMol][iTau] = logNz[specA_ptr][iTau] + logNumFracAB[iTau];
       //if (iTau%10 == 0){
         //System.out.format("%03d, %21.15f, %21.15f, %21.15f, %21.15f%n", iTau, temp[0][iTau], logE*logNz[specA_ptr][iTau], logE*masterMolPops[iMol][iTau],
          //logE*(masterMolPops[iMol][iTau]+Useful.logK()+temp[1][iTau]) );
           //             }
      }
  } //master iMol loop
//
//Compute updated Ne & Pe:
     //initialize accumulation of electrons at all depths
     for (int iTau = 0; iTau < numDeps; iTau++){
       newNe[0][iTau] = 0.0;
     }
     for (int iTau = 0; iTau < numDeps; iTau++){
     //  if (iTau%10 == 0){
     //System.out.println("iTau, iElem, masterStagePops[iElem][0], masterStagePops[iElem][1], masterStagePops[iElem][2]");
     //System.out.println("iTau, guessNe[1], newNe[1]");
     //                   }
        for (int iElem = 0; iElem < nelemAbnd; iElem++){
          newNe[0][iTau] = newNe[0][iTau]
                   + Math.exp(masterStagePops[iElem][1][iTau])   //1 e^- per ion
                   + 2.0 * Math.exp(masterStagePops[iElem][2][iTau]);   //2 e^- per ion
                   //+ 3.0 * Math.exp(masterStagePops[iElem][3][iTau])   //3 e^- per ion
                   //+ 4.0 * Math.exp(masterStagePops[iElem][4][iTau]);   //3 e^- per ion
        // if (iTau%10 == 0){
        //  System.out.format("%03d, %03d, %21.15f, %21.15f, %21.15f %n", iTau, iElem, logE*masterStagePops[iElem][0][iTau], logE*masterStagePops[iElem][1][iTau], logE*masterStagePops[iElem][2][iTau] );
         //     }
        }
        newNe[1][iTau] = Math.log(newNe[0][iTau]);
      // if (iTau%10 == 0){
      //  System.out.format("%03d, %21.15f, %21.15f %n", iTau, logE*guessNe[1][iTau], logE*newNe[1][iTau]);
      //                 }
// Update guess for iteration:
        guessNe[0][iTau] = newNe[0][iTau];
        guessNe[1][iTau] = newNe[1][iTau];
       //System.out.println("iTau " + iTau + " newNe " + logE*newNe[1][iTau] + " newPe " + logE*newPe[1][iTau]);
     }
      //System.out.println("i     guessPe      newPe      10^-9*newNe");
      //for (int i = 0; i < numDeps; i+=10){
      //   System.out.format("%03d, %21.15f, %21.15f, %21.15f%n", i, guessPe[0][i], newPe[0][i], (1.0e-9*newNe[0][i]));
      //}

  } //end Ne - ionzation fraction -molecular equilibrium iteration neIter2


//


        //Okay - Now all the emergent radiation stuff:
        // Set up theta grid
        //  cosTheta is a 2xnumThetas array:
        // row 0 is used for Gaussian quadrature weights
        // row 1 is used for cos(theta) values
        // Gaussian quadrature:
        // Number of angles, numThetas, will have to be determined after the fact
        double cosTheta[][] = Thetas.thetas();
        int numThetas = cosTheta[0].length;

//establish a phi grid for non-axi-symmetric situations (eg. spots, in situ rotation, ...)
//    //number of phi values per quandrant of unit circle centered on sub-stellar point
//        //    in plane of sky:
//        //For geometry calculations: phi = 0 is direction of positive x-axis of right-handed
//        // 2D Cartesian coord system in plane of sky with origin at sub-stellar point (phi
//        // increases CCW)
    int numPhiPerQuad = 9;
    int numPhi = 4 * numPhiPerQuad;
    double numPhiD = (double) numPhi;
    double[] phi = new double[numPhi];
    //Compute phi values in whole range (0 - 2pi radians):
    double delPhi = 2.0 * Math.PI / numPhiD;
    double ii;
    for (int i = 0; i < numPhi; i++){
      ii = (double) i;
      phi[i] = delPhi * ii;
    }
    

        boolean lineMode;

        //
        // ************
        //
        //  Spectrum synthesis section:
        // Set up multi-Gray continuum info:
        double isCool = 7300.0;  //Class A0

        //Set up multi-gray opacity:
        // lambda break-points and gray levels:
        // No. multi-gray bins = num lambda breakpoints +1
        double minLambda = 30.0;  //nm
        double maxLambda = 1.0e6;  //nm

//
//     FILE I/O Section
//External line list input file approach:
//
Charset charset = Charset.forName("US-ASCII");
String pattern = "0.0000000000000000";
//String pattern = "###.####";
DecimalFormat myFormatter = new DecimalFormat(pattern);
//
String dataPath = "./InputData/";
//
//
// **************  Atomic line list:
//
//
//Stuff for byte file method:
//
// *** NOTE: bArrSize must have been noted from the stadout of LineListServer and be consistent
// with whichever line list is linked to gsLineListBytes.dat, and be st manually here:
 String lineListBytes = dataPath + "gsLineListBytes.dat";
 File file = new File(lineListBytes);
 int bArrSize = (int) file.length();
 //System.out.println(" bArrSize =" +  bArrSize);
// int bArrSize = 484323;
 byte[] barray = new byte[bArrSize];
 barray = ByteFileRead.readFileBytes(lineListBytes, bArrSize);

//Path path = Paths.get(dataPath + lineListFile); //java.nio.file not available in Java 6

// We have Java SE 6 - we don't have the java.nio package!
//From http://www.deepakgaikwad.net/index.php/2009/11/23/reading-text-file-line-by-line-in-java-6.html
//

//System.out.println(" *********************************************** ");
//System.out.println("  ");
//System.out.println("  ");
//System.out.println("BEFORE FILE READ");
//System.out.println("  ");
//System.out.println("  ");
//System.out.println(" *********************************************** ");


 barray = ByteFileRead.readFileBytes(lineListBytes, bArrSize);
 String decoded = new String(barray, 0, bArrSize);  // example for one encoding type 
// String decoded = new String(barray, 0, bArrSize, "UTF-8") throws UnsupportedEncodingException;  // example for one encoding type 

//System.out.println(" *********************************************** ");
//System.out.println("  ");
//System.out.println("  ");
//System.out.println("AFTER FILE READ");
//System.out.println("  ");
//System.out.println("  ");
//System.out.println(" *********************************************** ");

//System.out.println("decoded " + decoded);
 String[] arrayLineString = decoded.split("%%"); 

//Number of lines MUST be the ONLY entry on the first line 

        int numLineList = arrayLineString.length;
        //System.out.println("arrayLineString[0] " + arrayLineString[0]);
//
//
// ************   Molecular line list:
//
//
//Stuff for byte file method:
//
// *** NOTE: bArrSize must have been noted from the stadout of LineListServer and be consistent
// with whichever line list is linked to gsLineListBytes.dat, and be st manually here:
 String molListBytes = dataPath + "gsMolListBytes.dat";
 File fileMol = new File(molListBytes);
 int bArrSizeMol = (int) fileMol.length();
 //System.out.println(" bArrSize =" +  bArrSize);
// int bArrSize = 484323;
 byte[] barrayMol = new byte[bArrSizeMol];
 int numMolList = 0;  //default initialization

 int maxMolLines = 100000; //sigh
 int molCount = 0;
 String[] arrayMolString = new String[maxMolLines];
//initialize:
 for (int i = 0; i < maxMolLines; i++){
    arrayMolString[i] = " ";
 }

boolean ifMolLines = false;  //for testing
//
if (ifMolLines == true){
 barrayMol = ByteFileRead.readFileBytes(molListBytes, bArrSizeMol);

//Path path = Paths.get(dataPath + lineListFile); //java.nio.file not available in Java 6

// We have Java SE 6 - we don't have the java.nio package!
//From http://www.deepakgaikwad.net/index.php/2009/11/23/reading-text-file-line-by-line-in-java-6.html
//

//System.out.println(" *********************************************** ");
//System.out.println("  ");
//System.out.println("  ");
//System.out.println("BEFORE MOLECULAR FILE READ");
//System.out.println("  ");
//System.out.println("  ");
//System.out.println(" *********************************************** ");


 barrayMol = ByteFileRead.readFileBytes(molListBytes, bArrSizeMol);
 String decodedMol = new String(barrayMol, 0, bArrSizeMol);  // example for one encoding type 
// String decoded = new String(barray, 0, bArrSize, "UTF-8") throws UnsupportedEncodingException;  // example for one encoding type 

//System.out.println(" *********************************************** ");
//System.out.println("  ");
//System.out.println("  ");
//System.out.println("AFTER MOLECULAR FILE READ");
//System.out.println("  ");
//System.out.println("  ");
//System.out.println(" *********************************************** ");

//System.out.println("decoded " + decoded);
  arrayMolString = decodedMol.split("%%");  //does this resize arrayMolString???

//Okay, how many molecular lines are there REALLY:

// Unnecessary - doesn't work??
//   molCount = 0;
//   for (int i = 0; i < maxMolLines; i++){
//       if (arrayMolString[i].equals(" ")){
//          break;
//       }
//       molCount++;
//   }
//    numMolList = molCount;

//Number of lines MUST be the ONLY entry on the first line 

         numMolList = arrayMolString.length;

        //System.out.println("numMolList " + numMolList); 
        //System.out.println("arrayMolString[0] " + arrayMolString[0]);
//        for (int i = 0; i < 5; i++){
//           System.out.println(arrayLineString[i]);
//        }
} //ifMolLines

//Atomic lines:
//Okay, here we go:
        //System.out.println("numLineList " + numLineList);
        double[] list2Lam0 = new double[numLineList];  // nm
        String[] list2Element = new String[numLineList]; //element
        String[] list2StageRoman = new String[numLineList]; //ion stage
        int[] list2Stage = new int[numLineList]; //ion stage
        double[] list2Mass = new double[numLineList]; // amu
        double[] list2LogGammaCol = new double[numLineList];
        //abundance in logarithmic A12 sysytem
        //double[] list2A12 = new double[numLineList]; //deprecated
        //Einstein coefficient for spontaneous de-exciation:
        double[] list2LogAij = new double[numLineList]; //log base 10
        //Log of unitless oscillator strength, f 
        double[] list2Logf = new double[numLineList];
        //Ground state ionization E - Stage I (eV) 
        double[] list2ChiI1 = new double[numLineList];
        //Ground state ionization E - Stage II (eV)
        double[] list2ChiI2 = new double[numLineList];
        //Ground state ionization E - Stage III (eV) 
        double[] list2ChiI3 = new double[numLineList];
        //Ground state ionization E - Stage IV (eV)
        double[] list2ChiI4 = new double[numLineList];
        //Excitation E of lower E-level of b-b transition (eV)
        double[] list2ChiL = new double[numLineList];
        //Unitless statisital weight, Ground state - Stage I
        //double[] list2Gw1 = new double[numLineList];
        //Unitless statisital weight, Ground state - Stage II
        //double[] list2Gw2 = new double[numLineList];
        //Unitless statisital weight, Ground state - Stage III
        //double[] list2Gw3 = new double[numLineList];
        //Unitless statisital weight, Ground state - Stage IV
        //double[] list2Gw4 = new double[numLineList];
        //double[] list2Gw4 = new double[numLineList];
        //Unitless statisital weight, lower E-level of b-b transition                 
        double[] list2GwL = new double[numLineList];
        //double[] list2GwU For now we'll just set GwU to 1.0
        // Is stage II?

        //Atomic Data sources:
 
 double thisF;
 int list2_ptr = 0; //pointer into line list2 that we're populating
 int numFields = 7; //number of field per record 
 // 0: element, 1: ion stage, 2: lambda_0, 3: logf, 4: g_l, 5: chi_l
 String[] thisRecord = new String[numFields]; 
    
 String myString;  //useful helper
 
     for (int iLine = 0; iLine < numLineList; iLine++){

        // "|" turns out to mean something in regexp, so we need to escape with '\\':
        //System.out.println("iLine " + iLine + " arrayLineString[iLine] " + arrayLineString[iLine]);
        thisRecord = arrayLineString[iLine].split("\\|");
        //System.out.println("thisRecord[0] " + thisRecord[0]
        //                 + "thisRecord[1] " + thisRecord[1] 
        //                 + "thisRecord[2] " + thisRecord[2] 
        //                 + "thisRecord[3] " + thisRecord[3] 
        //                 + "thisRecord[4] " + thisRecord[4] 
        //                 + "thisRecord[5] " + thisRecord[5]);
                 
       
        myString = thisRecord[0].trim(); 
        list2Element[iLine] = myString;
        myString = thisRecord[1].trim();
        list2StageRoman[iLine] = myString;  
        //System.out.println("iLine " + iLine + " thisRecord[2] " + thisRecord[2]);    
        myString = thisRecord[2].trim(); 
        //System.out.println("myString " + myString);
        list2Lam0[iLine] = Double.parseDouble(myString);
        myString = thisRecord[3].trim();
        list2LogAij[iLine] = Double.parseDouble(myString);
        //list2Aij[iLine] = Math.pow(10.0, thisLogAij);
        myString = thisRecord[4].trim();
        list2Logf[iLine] = Double.parseDouble(myString);
        //list2Logf[iLine] = Math.log10(thisF); 
        myString = thisRecord[5].trim();
        list2GwL[iLine] = Double.parseDouble(myString);
        myString = thisRecord[6].trim();
        list2ChiL[iLine] = Double.parseDouble(myString);
/* Currently not used
        myString = thisRecord[7].trim();
        list2ChiU = Double.parseDouble(myString);
        myString = thisRecord[8].trim();
        list2Jl = Double.parseDouble(myString);
        myString = thisRecord[9].trim();
        list2Ju = Double.parseDouble(myString);
*/
           
    //System.out.println("iLine " + iLine + " list2Element[iLine] " + list2Element[iLine] + " list2StageRoman " + list2StageRoman[iLine] + " list2Lam0[iLine] " + list2Lam0[iLine] + " list2Logf[iLine] " + list2Logf[iLine] + " list2GwL[iLine] " + list2GwL[iLine] + " list2ChiL[iLine] " + list2ChiL[iLine]);   
        
           //Get the chemical element symbol - we don't know if it's one or two characters
           //System.out.println("i " + i + " array_ptr " + array_ptr + " arrayLineString[array_ptr] " + arrayLineString[array_ptr]);
            if (list2StageRoman[list2_ptr].equals("I")){
              list2Stage[list2_ptr] = 0;
             }
            if (list2StageRoman[list2_ptr].equals("II")){
              list2Stage[list2_ptr] = 1;
             }
            if (list2StageRoman[list2_ptr].equals("III")){
              list2Stage[list2_ptr] = 2;
             }
            if (list2StageRoman[list2_ptr].equals("IV")){
              list2Stage[list2_ptr] = 3;
             }
            if (list2StageRoman[list2_ptr].equals("V")){
              list2Stage[list2_ptr] = 4;
             }
            //System.out.println("list2Stage[list2_ptr] " + list2Stage[list2_ptr]);
           //wavelength in nm starts at position 23 and is in %8.3f format - we're not expecting anything greater than 9999.999 nm

    // Some more processing:
           list2Mass[list2_ptr] = AtomicMass.getMass(list2Element[list2_ptr]);
           species = list2Element[list2_ptr] + "I";
           list2ChiI1[list2_ptr] = IonizationEnergy.getIonE(species); 
           species = list2Element[list2_ptr] + "II";
           list2ChiI2[list2_ptr] = IonizationEnergy.getIonE(species);
           species = list2Element[list2_ptr] + "III";
           list2ChiI3[list2_ptr] = IonizationEnergy.getIonE(species); 
           species = list2Element[list2_ptr] + "IV";
           list2ChiI4[list2_ptr] = IonizationEnergy.getIonE(species);

     //We're going to have to fake the ground state statistical weight for now - sorry:
           //list2Gw1[list2_ptr] = 1.0;
           //list2Gw2[list2_ptr] = 1.0; 
           //list2Gw3[list2_ptr] = 1.0;
           //list2Gw4[list2_ptr] = 1.0; 
           list2LogGammaCol[list2_ptr] = logGammaCol; 

//Deprecated:
     //// The base solar abundance for this species:
     //// Java has not intrinsic method for finding a vlaue in an array:
     //     //System.out.println("list2Element[list2_ptr]" + list2Element[list2_ptr]+"!");
     //     int iAbnd = 0; //initialization
     //     for (int jj = 0; jj < nelemAbnd; jj++){
     //        //System.out.println("jj " + jj + " cname[jj]" + cname[jj]+"!");
     //        if (list2Element[list2_ptr].equals(cname[jj])){
     //            break;   //we found it
     //            }
     //        iAbnd++;
     //       }
     //    if (iAbnd == nelemAbnd){
     //       //the element is not in out set - flag this with a special abundance value
     //       list2A12[list2_ptr] = 0.0;
     //          } else {
     //       list2A12[list2_ptr] = eheu[iAbnd]; 
     //          } 
 
    //We've gotten everything we need from the NIST line list:
           list2_ptr++;
        
       } //iLine loop 

  int numLines2 = list2_ptr;


//
//Molecular lines:
//Okay, here we go:
        //System.out.println("numMolList " + numMolList);
        double[] molList2Lam0 = new double[numMolList];  // nm
        double[] molList2Mass = new double[numMolList]; // amu
        double[] molList2LogGammaRad = new double[numMolList]; //log base 10
        //abundance in logarithmic A12 sysytem
        //double[] list2A12 = new double[numMolList]; //deprecated
        //Log of unitless oscillator strength, f 
        double[] molList2Log10gf = new double[numMolList];
        //Ground state ionization E - Stage I (eV) 
        double[] molList2DissE = new double[numMolList];
        //Excitation E of lower E-level of b-b transition (eV)
        double[] molList2ChiL = new double[numMolList];
        //Unitless statisital weight, lower E-level of b-b transition   
        // To be computed from v, J, and N??             
        double[] molList2GwL = new double[numMolList];
        //double[] list2GwU For now we'll just set GwU to 1.0
        //Name of molecule - for labeling
        String[] molList2Name = new String[numMolList];
        //Name of electronic transition system - for labeling 
        String[] molList2System = new String[numMolList];
        //Name of branch - for labeling 
        String[] molList2Branch = new String[numMolList];

        double molList2LogGammaCol = 0.0;

        //Atomic Data sources:
 
 int molList2_ptr = 0; //pointer into line list2 that we're populating
 int numMolFields = 8; //number of field per record 
 // 0: element, 1: ion stage, 2: lambda_0, 3: logf, 4: g_l, 5: chi_l
 String[] thisMolRecord = new String[numMolFields]; 
    
 //String myString;  //useful helper
 
     for (int iMolLine = 0; iMolLine < numMolList; iMolLine++){

        // "|" turns out to mean something in regexp, so we need to escape with '\\':
        //System.out.println("iMolLine " + iMolLine + " arrayLineString[iMolLine] " + arrayLineString[iMolLine]);
        thisMolRecord = arrayMolString[iMolLine].split("\\|");
        //System.out.println("thisMolRecord[0] " + thisMolRecord[0]
        //                 + "thisMolRecord[1] " + thisMolRecord[1] 
        //                 + "thisMolRecord[2] " + thisMolRecord[2] 
        //                 + "thisMolRecord[3] " + thisMolRecord[3] 
        //                 + "thisMolRecord[4] " + thisMolRecord[4] 
        //                 + "thisMolRecord[5] " + thisMolRecord[5]);
                 
       
        myString = thisMolRecord[0].trim(); 
        molList2Lam0[iMolLine] = Double.parseDouble(myString);
        myString = thisMolRecord[1].trim();
        molList2Log10gf[iMolLine] = Double.parseDouble(myString);  
        //System.out.println("iMolLine " + iMolLine + " thisMolRecord[2] " + thisMolRecord[2]);    
        myString = thisMolRecord[2].trim(); 
        //System.out.println("myString " + myString);
        molList2ChiL[iMolLine] = Double.parseDouble(myString);
        myString = thisMolRecord[3].trim();
//Probably don't need this - Plez' TiO list already has log(gf):
        molList2GwL[iMolLine] = Double.parseDouble(myString);
        myString = thisMolRecord[4].trim();
        molList2LogGammaRad[iMolLine] = Double.parseDouble(myString);
        myString = thisMolRecord[5].trim();
        molList2Name[iMolLine] = myString;
        myString = thisMolRecord[6].trim();
        molList2System[iMolLine] = myString;
        myString = thisMolRecord[7].trim();
        molList2Branch[iMolLine] = myString;
           
    //System.out.println("iMolLine " + iMolLine + " list2Element[iMolLine] " + list2Element[iMolLine] + " list2StageRoman " + list2StageRoman[iLine] + " list2Lam0[iMolLine] " + list2Lam0[iMolLine] + " list2Logf[iMolLine] " + list2Logf[iMolLine] + " list2GwL[iMolLine] " + list2GwL[iMolLine] + " list2ChiL[iMolLine] " + list2ChiL[iMolLine]);   
        
    // Some more processing:
           molList2Mass[molList2_ptr] = AtomicMass.getMolMass(molList2Name[molList2_ptr]);
           molList2DissE[molList2_ptr] = IonizationEnergy.getDissE(molList2Name[molList2_ptr]); 

    //We've gotten everything we need from the NIST line list:
           molList2_ptr++;
        
       } //iMolLine loop 

  int numMolLines2 = molList2_ptr;
  //System.out.println("numMolLines2 " + numMolLines2);
  //System.out.println("molList2Lam0 " + molList2Lam0[0] + " molList2Log10gf " + molList2Log10gf[0] + " molList2ChiL " + molList2ChiL[0] 
  //  + " molList2GwL " + molList2GwL[0] + " molList2LogGammaRad " + molList2LogGammaRad[0] + " molList2Name " + molList2Name[0] 
  //  + " molList2System " + molList2System[0] + " molList2Branch " + molList2Branch[0]
  //  + " molList2Mass " + molList2Mass[0] + " molList2DissE " + molList2DissE[0]);


//Okay - what kind of mess did we make...
 //System.out.println("We processed " +  numLines2 + " lines");
 //System.out.println("list2Element  list2Stage  list2Lam0  list2Logf  list2GwL  list2ChiL  list2ChiI1  list2ChiI2  list2Mass  list2A12");

//for (int i = 0; i < numLines2; i++){
// System.out.println(" " + list2Element[i] + " " + list2Stage[i] + " " + list2Lam0[i] + " " + list2Logf[i] + " " + list2GwL[i] + 
//    " " + list2ChiL[i] + " " + list2ChiI1[i] + " " + list2ChiI2[i] + " " + list2Mass[i] + " " + list2A12[i]);
//} 

// END FILE I/O SECTION


//System.out.println(" *********************************************** ");
//System.out.println("  ");
//System.out.println("  ");
//System.out.println("BEFORE TRIAGE");
//System.out.println("  ");
//System.out.println("  ");
//System.out.println(" *********************************************** ");
//
//Triage: For each line: Voigt, Gaussian, or negelct??
//
//
        int gaussLineCntr = 0; //initialize accumulator
        //int sedLineCntr = 0; //initialize accumulator
        //No! boolean[] ifThisLine = new boolean[numLines2]; //initialize line strength flag
        int gaussLine_ptr[] = new int[numLines2]; //array of pointers to lines that make the cut in the 
        //int sedLine_ptr[] = new int[numLines2]; //array of pointers to lines that make the cut in the 
                                                  // master line list  
        //System.out.println("sedThresh " + sedThresh + " lineThresh " + lineThresh 
        //   + " lamUV " + lamUV + " lamIR " + lamIR + " lambdaStart " + lambdaStart + " lambdaStop " + lambdaStop);
        boolean isFirstLine = true; //initialization
        int firstLine = 0; //default initialization
// This holds 2-element temperature-dependent base 10 logarithmic parition fn:
        double[] thisUwV = new double[2];
        thisUwV[0] = 0.0; //default initialization
        thisUwV[1] = 0.0;
        for (int iLine = 0; iLine < numLines2; iLine++) {

            //No! ifThisLine[iLine] = false;
            //if H or He, make sure kappaScale is unity:
            if ((list2Element[iLine].equals("H"))
                    || (list2Element[iLine].equals("He"))) {
                zScaleList = 1.0;
                //list2Gw1[iLine] = 2.0;  //fix for H lines
                if (list2Lam0[iLine] <= 657.0){
                list2GwL[iLine] = 8.0;  //fix for Balmer lines
                    } else {
                list2GwL[iLine] = 18.0;  //fix for Paschen lines
                    }
            } else {
                zScaleList = zScale;
            }

          list2Lam0[iLine] = list2Lam0[iLine] * 1.0e-7;  // nm to cm
          int iAbnd = 0; //initialization
          int logNums_ptr = 0;
            //System.out.println("iLine " + iLine + " list2Element[iLine] " + list2Element[iLine]);
          for (int jj = 0; jj < nelemAbnd; jj++){
             //System.out.println("jj " + jj + " cname[jj]" + cname[jj]+"!");
             if (list2Element[iLine].equals(cname[jj])){
                if (list2Stage[iLine] == 0){
                  species = cname[jj] + "I";
                  logNums_ptr = 0;
                }
                if (list2Stage[iLine] == 1){
                  species = cname[jj] + "II";
                  logNums_ptr = 1;
                }
                if (list2Stage[iLine] == 2){
                  species = cname[jj] + "III";
                  logNums_ptr = 4;
                }
                if (list2Stage[iLine] == 3){
                  species = cname[jj] + "IV";
                  logNums_ptr = 5;
                }
                if (list2Stage[iLine] == 4){
                  species = cname[jj] + "V";
                  logNums_ptr = 6;
                }
                thisUwV = PartitionFn.getPartFn(species); //base 10 log_10 U
                 break;   //we found it
             }
             iAbnd++;
          } //jj loop
          //System.out.println("iAbnd " + iAbnd); // + " cname[iAbnd] " + cname[iAbnd]);
           //System.out.println("list2Element[iLine] " + list2Element[iLine] + " cname[iAbnd] " + cname[iAbnd] + " list2Stage[iLine] " + list2Stage[iLine]);
           double[][] list2LogNums = new double[numStages+2][numDeps];
            for (int iTau = 0; iTau < numDeps; iTau++){
               list2LogNums[0][iTau] = masterStagePops[iAbnd][0][iTau];
               list2LogNums[1][iTau] = masterStagePops[iAbnd][1][iTau];
               //System.out.println("list2LogNums[1][iTau] " + list2LogNums[1][iTau] + " list2LogNums2[1][iTau] " + list2LogNums2[1][iTau]);
               list2LogNums[4][iTau] = masterStagePops[iAbnd][2][iTau];
               list2LogNums[5][iTau] = masterStagePops[iAbnd][3][iTau];
               list2LogNums[6][iTau] = masterStagePops[iAbnd][4][iTau];
            }
            //double[] numHelp = LevelPopsServer.levelPops(list2Lam0[iLine], list2LogNums[list2Stage[iLine]], list2ChiL[iLine], thisUwV, 
             //       list2GwL[iLine], numDeps, tauRos, temp);
          // System.out.println("iLine " + iLine + " list2Lam0nm " +  list2Lam0[iLine] + " list2ChiL " + list2ChiL[iLine] +
// " thisUwV[] " + thisUwV[0] + " " + thisUwV[1] + " list2GwL " + list2GwL[iLine]);
            double[] numHelp = LevelPopsServer.levelPops(list2Lam0[iLine], list2LogNums[logNums_ptr], list2ChiL[iLine], thisUwV, 
                    list2GwL[iLine], numDeps, temp);
            for (int iTau = 0; iTau < numDeps; iTau++){
               list2LogNums[2][iTau] = numHelp[iTau];
               //System.out.println("list2LogNums[2][iTau] " + list2LogNums[2][iTau] + " list2LogNums2[2][iTau] " + list2LogNums2[2][iTau]);
               list2LogNums[3][iTau] = numHelp[iTau] / 2.0; //fake for testing with gS3 line treatment
               //System.out.println("iTau " + iTau + " list2LogNums[2][iTau] " + list2LogNums[2][iTau] + " list2LogNumsOld[2][iTau] " + list2LogNumsOld[2][iTau]);
            } 

        //linePoints: Row 0 in cm (will need to be in nm for Plack.planck), Row 1 in Doppler widths
        //For now - initial strength check with delta fn profiles at line centre for triage:
        int listNumPointsDelta = 1;
           double[][] listLinePointsDelta = LineGrid.lineGridDelta(list2Lam0[iLine], list2Mass[iLine], xiT, numDeps, teff);
           double[][] listLineProfDelta = LineProf.delta(listLinePointsDelta, list2Lam0[iLine], numDeps, tauRos, list2Mass[iLine], xiT, teff); 
           double[][] listLogKappaLDelta = LineKappa.lineKap(list2Lam0[iLine], list2LogNums[2], list2Logf[iLine], listLinePointsDelta, listLineProfDelta,
                    numDeps, zScaleList, tauRos, temp, rho);
   /* Let's not do this - too slow:
            // Low resolution SED lines and high res spectrum synthesis region lines are mutually
            // exclusive sets in wavelength space:
            //Does line qualify for inclusion in SED as low res line at all??
            // Check ratio of line centre opacity to continuum at log(TauRos) = -5, -3, -1
            if ( (logE*(listLogKappaLDelta[0][6] - kappa[1][6]) > sedThresh)  
              || (logE*(listLogKappaLDelta[0][18] - kappa[1][18]) > sedThresh)  
              || (logE*(listLogKappaLDelta[0][30] - kappa[1][30]) > sedThresh) ){ 
                   if ( ( list2Stage[iLine] == 0) || (list2Stage[iLine] == 1) 
                    ||  ( list2Stage[iLine] == 2) || (list2Stage[iLine] == 3) ){
                        if ( (list2Lam0[iLine] > lamUV) && (list2Lam0[iLine] < lamIR) ){
                           if ( (list2Lam0[iLine] < lambdaStart) || (list2Lam0[iLine] > lambdaStop) ){ 
                      //No! ifThisLine[iLine] = true;
                      sedLine_ptr[sedLineCntr] = iLine;
                      sedLineCntr++;
      //System.out.println("SED passed, iLine= " + iLine + " sedLineCntr " + sedLineCntr 
      //   + " list2Lam0[iLine] " + list2Lam0[iLine] 
      //   + " list2Element[iLine] " + list2Element[iLine]
      //   + " list2Stage[iLine] " + list2Stage[iLine]); 
                                 }
                            }
                      } 
                }
  */
            //Does line qualify for inclusion in high res spectrum synthesis region??
            // Check ratio of line centre opacity to continuum at log(TauRos) = -5, -3, -1
           //Find local value of lambda-dependent continuum kappa - list2Lam0 & lambdaScale both in cm here: 
            int thisLambdaPtr = ToolBox.lamPoint(numLams, lambdaScale, list2Lam0[iLine]);
            if ( (logE*(listLogKappaLDelta[0][6] - logKappa[thisLambdaPtr][6]) > lineThresh)  
              || (logE*(listLogKappaLDelta[0][18] - logKappa[thisLambdaPtr][18]) > lineThresh)  
		      || (logE*(listLogKappaLDelta[0][30] - logKappa[thisLambdaPtr][30]) > lineThresh) ){ 
			   if ( ( list2Stage[iLine] == 0) || (list2Stage[iLine] == 1) 
			    ||  ( list2Stage[iLine] == 2) || (list2Stage[iLine] == 3) ){
				if ( (list2Lam0[iLine] > lambdaStart) && (list2Lam0[iLine] < lambdaStop) ){ 
			      //No! ifThisLine[iLine] = true;
			      gaussLine_ptr[gaussLineCntr] = iLine;
			      gaussLineCntr++;
                              if (isFirstLine == true){
                                 firstLine = iLine;
                                 isFirstLine = false;
                              } 
//	      System.out.println("specSyn passed, iLine= " + iLine + " gaussLineCntr " + gaussLineCntr 
//		 + " list2Lam0[iLine] " + list2Lam0[iLine] 
//		 + " list2Element[iLine] " + list2Element[iLine]
//		 + " list2Stage[iLine] " + list2Stage[iLine]); 
                            }
                      } 
                }
//
       } //iLine loop

//
//Now do same for molecules
//Triage: For each line: Voigt, Gaussian, or negelct??
//
//
        int molGaussLineCntr = 0; //initialize accumulator
        //int sedLineCntr = 0; //initialize accumulator
        //No! boolean[] ifThisLine = new boolean[numLines2]; //initialize line strength flag
        int molGaussLine_ptr[] = new int[numMolLines2]; //array of pointers to lines that make the cut in the 
        //int sedLine_ptr[] = new int[numLines2]; //array of pointers to lines that make the cut in the 
                                                  // master line list  
        //System.out.println("sedThresh " + sedThresh + " lineThresh " + lineThresh 
        //   + " lamUV " + lamUV + " lamIR " + lamIR + " lambdaStart " + lambdaStart + " lambdaStop " + lambdaStop);
        boolean isMolFirstLine = true; //initialization
        int firstMolLine = 0; //default initialization
// This holds 2-element temperature-dependent base 10 logarithmic molecular parition fn:
        double[] thisQwABv = new double[5];
        for (int kk = 0; kk < 5; kk++){
            thisQwABv[kk] = Math.log(300.0); //default initialization //base e log Q
        }
        for (int iMolLine = 0; iMolLine < numMolLines2; iMolLine++) {

          molList2Lam0[iMolLine] = molList2Lam0[iMolLine] * 1.0e-7;  // nm to cm
          int iMol = 0; //initialization
          int logMolNums_ptr = 0;
            //System.out.println("iMolLine " + iMolLine + " molList2Name[iMolLine] " + molList2Name[iMolLine]);
          for (int jj = 0; jj < nMols; jj++){
             //System.out.println("jj " + jj + " mname[jj]" + mname[jj]+"!");
             if (molList2Name[iMolLine].equals(mname[jj])){
                thisQwABv = PartitionFn.getMolPartFn(mname[jj]);  //base 10 log_10 Q
                 break;   //we found it
             }
             iMol++;
          } //jj loop
                zScaleList = zScale;
          //System.out.println("iMol " + iMol); // + " mname[iMol] " + cmame[iMol]);
           //System.out.println("molList2Name[iMolLine] " + molList2Name[iMolLine] + " cmame[iMol] " + cmame[iMol]);
//For molecular - row 0 holds total molecular number density, 
//              - row 1 holds number density in lower E-level
           double[][] molList2LogNums = new double[2][numDeps];
            for (int iTau = 0; iTau < numDeps; iTau++){
               molList2LogNums[0][iTau] = masterMolPops[iMol][iTau];
            }
            //double[] numHelp = LevelPopsServer.levelPops(molList2Lam0[iMolLine], molList2LogNums[molList2Stage[iMolLine]], molList2ChiL[iMolLine], thisUwV, 
             //       molList2GwL[iMolLine], numDeps, tauRos, temp);
          // System.out.println("iMolLine " + iMolLine + " molList2Lam0nm " +  molList2Lam0[iMolLine] + " molList2ChiL " + molList2ChiL[iMolLine] +
// " thisUwV[] " + thisUwV[0] + " " + thisUwV[1] + " molList2GwL " + molList2GwL[iMolLine]);
            double[] numHelp = LevelPopsServer.levelPops(molList2Lam0[iMolLine], molList2LogNums[0], molList2ChiL[iMolLine], thisQwABv, 
                    molList2GwL[iMolLine], numDeps, temp);
            for (int iTau = 0; iTau < numDeps; iTau++){
               molList2LogNums[1][iTau] = numHelp[iTau];
               //System.out.println("molList2LogNums[2][iTau] " + molList2LogNums[2][iTau] + " molList2LogNums2[2][iTau] " + molList2LogNums2[2][iTau]);
            } 

        //linePoints: Row 0 in cm (will need to be in nm for Plack.planck), Row 1 in Doppler widths
        //For now - initial strength check with delta fn profiles at line centre for triage:
        int listNumPointsDelta = 1;
           double[][] listLinePointsDelta = LineGrid.lineGridDelta(molList2Lam0[iMolLine], molList2Mass[iMolLine], xiT, numDeps, teff);
           double[][] listLineProfDelta = LineProf.delta(listLinePointsDelta, molList2Lam0[iMolLine], numDeps, tauRos, molList2Mass[iMolLine], xiT, teff); 
           double[][] listLogKappaLDelta = LineKappa.lineKap(molList2Lam0[iMolLine], molList2LogNums[1], molList2Log10gf[iMolLine], listLinePointsDelta, listLineProfDelta,
                    numDeps, zScaleList, tauRos, temp, rho);
   /* Let's not do this - too slow:
            // Low resolution SED lines and high res spectrum synthesis region lines are mutually
            // exclusive sets in wavelength space:
            //Does line qualify for inclusion in SED as low res line at all??
            // Check ratio of line centre opacity to continuum at log(TauRos) = -5, -3, -1
            if ( (logE*(listLogKappaLDelta[0][6] - kappa[1][6]) > sedThresh)  
              || (logE*(listLogKappaLDelta[0][18] - kappa[1][18]) > sedThresh)  
              || (logE*(listLogKappaLDelta[0][30] - kappa[1][30]) > sedThresh) ){ 
                   if ( ( molList2Stage[iMolLine] == 0) || (molList2Stage[iMolLine] == 1) 
                    ||  ( molList2Stage[iMolLine] == 2) || (molList2Stage[iMolLine] == 3) ){
                        if ( (molList2Lam0[iMolLine] > lamUV) && (molList2Lam0[iMolLine] < lamIR) ){
                           if ( (molList2Lam0[iMolLine] < lambdaStart) || (molList2Lam0[iMolLine] > lambdaStop) ){ 
                      //No! ifThisLine[iMolLine] = true;
                      sedLine_ptr[sedLineCntr] = iMolLine;
                      sedLineCntr++;
      //System.out.println("SED passed, iMolLine= " + iMolLine + " sedLineCntr " + sedLineCntr 
      //   + " molList2Lam0[iMolLine] " + molList2Lam0[iMolLine] 
      //   + " molList2Name[iMolLine] " + molList2Name[iMolLine]
      //   + " molList2Stage[iMolLine] " + molList2Stage[iMolLine]); 
                                 }
                            }
                      } 
                }
  */
            //Does line qualify for inclusion in high res spectrum synthesis region??
            // Check ratio of line centre opacity to continuum at log(TauRos) = -5, -3, -1
           //Find local value of lambda-dependent continuum kappa - molList2Lam0 & lambdaScale both in cm here: 
            int thisLambdaPtr = ToolBox.lamPoint(numLams, lambdaScale, molList2Lam0[iMolLine]);
            if ( (logE*(listLogKappaLDelta[0][6] - logKappa[thisLambdaPtr][6]) > lineThresh)  
              || (logE*(listLogKappaLDelta[0][18] - logKappa[thisLambdaPtr][18]) > lineThresh)  
		      || (logE*(listLogKappaLDelta[0][30] - logKappa[thisLambdaPtr][30]) > lineThresh) ){ 
				if ( (molList2Lam0[iMolLine] > lambdaStart) && (molList2Lam0[iMolLine] < lambdaStop) ){ 
			      //No! ifThisLine[iMolLine] = true;
			      molGaussLine_ptr[molGaussLineCntr] = iMolLine;
			      molGaussLineCntr++;
                              if (isFirstLine == true){
                                 firstLine = iMolLine;
                                 isFirstLine = false;
                              } 
//	      System.out.println("specSyn passed, iMolLine= " + iMolLine + " molGaussLineCntr " + molGaussLineCntr 
//		 + " molList2Lam0[iMolLine] " + molList2Lam0[iMolLine] 
//		 + " molList2Name[iMolLine] " + molList2Name[iMolLine]
//		 + " molList2Stage[iMolLine] " + molList2Stage[iMolLine]); 
                            }
                }
//
       } //iMolLine loop

//We need to have at least one line in rgion:
       boolean areNoLines = false; //initialization
       if (gaussLineCntr == 0){
            gaussLineCntr = 1;
            gaussLine_ptr[0] = firstLine;
            areNoLines = true;
             }

       int numGaussLines = gaussLineCntr;
       int numMolGaussLines = molGaussLineCntr;
      // System.out.println("numMolGaussLines " + numMolGaussLines);
       //int numSedLines = sedLineCntr; //Gauss lines double-counted
       //int numTotalLines = numGaussLines; // + numSedLines;
//       System.out.println("We found " + numGaussLines + " lines strong enough for Gaussian and " + numSedLines + " strong enough for blanketing SED");
//System.out.println(" *********************************************** ");
//System.out.println("  ");
//System.out.println("  ");
//System.out.println("AFTER TRIAGE");
//System.out.println("  ");
//System.out.println("  ");
//System.out.println(" *********************************************** ");

        //Notes
        //if Hydrogen or Helium, kappaScale should be unity for these purposes:
        //double kappaScaleList = 1.0; //initialization                   
        //

        int listNumCore = 3;  //half-core //default initialization
        //int sedNumCore = 3;  //half-core //default initialization
        int listNumWing = 1;  //per wing
        //int sedNumWing = 1;  //per wing
        int molListNumCore = 3;  //half-core //default initialization
        int molListNumWing = 1;  //per wing
        //int thisNumCore = sedNumCore; //default initialization
        //int thisNumWing = sedNumWing; //default initialization
        if (sampling.equals("coarse")){
           listNumCore = 3;  //half-core
           listNumWing = 3;  //per wing
           molListNumCore = 3;  //half-core //default initialization
           molListNumWing = 1;  //per wing
        } else {
           listNumCore = 5;  //half-core
           listNumWing = 9;  //per wing
           molListNumCore = 3;  //half-core //default initialization
           molListNumWing = 3;  //per wing
        } 
//Delta fn - for testing and strength triage
        //int listNumPoints = 1;
//All gaussian
        //int listNumPoints = 2 * listNumCore - 1; // + 1;  //Extra wavelength point at end for monochromatic continuum tau scale
////All full voigt:
        int listNumPoints = (2 * (listNumCore + listNumWing) - 1); // + 1;  //Extra wavelength point at end for monochromatic continuum tau scale
        int molListNumPoints = (2 * (molListNumCore + molListNumWing) - 1); // + 1;  //Extra wavelength point at end for monochromatic continuum tau scale
        //int sedNumPoints = (2 * (sedNumCore + sedNumWing) - 1); // + 1;  //Extra wavelength point at end for monochromatic continuum tau scale
        //int thisNumPoints = sedNumPoints; //default initialization
        int numNow = numLams;  //initialize dynamic counter of how many array elements are in use
        int numMaster = numLams + (numGaussLines * listNumPoints) + (numMolGaussLines * molListNumPoints); // + (numSedLines * sedNumPoints); //total size (number of wavelengths) of master lambda & total kappa arrays 
        double[] masterLams = new double[numMaster];
//Line blanketed opacity array:
        double[][] logMasterKaps = new double[numMaster][numDeps];
// Construct a continuum opacity array with same structure as logMasterKaps
        //double[][] logContKaps = new double[numLams][numDeps];  
        //seed masterLams and logMasterKaps with continuum SED lambdas and kappas:
        //This just initializes the first numLams of the numMaster elements

//Initialize monochromatic line blanketed opacity array:
// Seed first numLams wavelengths with continuum wavelength and kappa values 
        for (int iL = 0; iL < numLams; iL++) {
            masterLams[iL] = lambdaScale[iL];
            for (int iD = 0; iD < numDeps; iD++) {
                logMasterKaps[iL][iD] = logKappa[iL][iD]; 
            }
        }
        //initialize the remainder with dummy values - these values will be clobbered as line wavelengths are inserted, 
        // and don't matter
        for (int iL = numLams; iL < numMaster; iL++) {
            masterLams[iL] = lambdaScale[numLams - 1];
            for (int iD = 0; iD < numDeps; iD++) {
                logMasterKaps[iL][iD] = logKappa[numLams-1][iD];
            }
        }

        //Stuff for the the Teff recovery test:
        double lambda1, lambda2, fluxSurfBol, logFluxSurfBol;
        fluxSurfBol = 0;
 
 //Get the components for the power series expansion approximation of the Hjerting function
 //for treating Voigt profiles:
        double[][] hjertComp = HjertingComponents.hjertingComponents();

// This holds 2-element temperature-dependent base 10 logarithmic parition fn:
        thisUwV[0] = 0.0; //default initialization
        thisUwV[1] = 0.0;

        double[][] listLineProf = new double[listNumPoints][numDeps];

// Put in high res spectrum synthesis lines:
        for (int iLine = 0; iLine < numGaussLines; iLine++) {

            //if H or He, make sure kappaScale is unity:
            if ((list2Element[gaussLine_ptr[iLine]].equals("H"))
                    || (list2Element[gaussLine_ptr[iLine]].equals("He"))) {
                zScaleList = 1.0;
                //list2Gw1[gaussLine_ptr[iLine]] = 2.0;  //fix for H lines
                if (list2Lam0[gaussLine_ptr[iLine]] <= 657.0e-7){
                    list2GwL[gaussLine_ptr[iLine]] = 8.0;  //fix for Balmer lines
                } else {
                    list2GwL[gaussLine_ptr[iLine]] = 18.0;  //fix for Paschen lines
                } 
            } else {
                zScaleList = zScale;
            }


//
          int iAbnd = 0; //initialization
          int logNums_ptr = 0;
          for (int jj = 0; jj < nelemAbnd; jj++){
             if (list2Element[gaussLine_ptr[iLine]].equals(cname[jj])){
                if (list2Stage[gaussLine_ptr[iLine]] == 0){
                  species = cname[jj] + "I";
                  logNums_ptr = 0;
                }
                if (list2Stage[gaussLine_ptr[iLine]] == 1){
                  species = cname[jj] + "II";
                  logNums_ptr = 1;
                }
                if (list2Stage[gaussLine_ptr[iLine]] == 2){
                  species = cname[jj] + "III";
                  logNums_ptr = 4;
                }
                if (list2Stage[gaussLine_ptr[iLine]] == 3){
                  species = cname[jj] + "IV";
                  logNums_ptr = 5;
                }
                if (list2Stage[gaussLine_ptr[iLine]] == 4){
                  species = cname[jj] + "V";
                  logNums_ptr = 6;
                }
                thisUwV = PartitionFn.getPartFn(species); //base 10 log_10 U
                 break;   //we found it
                 }
             iAbnd++;
          } //jj loop
           double[][] list2LogNums = new double[numStages+2][numDeps];
            for (int iTau = 0; iTau < numDeps; iTau++){
               list2LogNums[0][iTau] = masterStagePops[iAbnd][0][iTau];
               list2LogNums[1][iTau] = masterStagePops[iAbnd][1][iTau];
               list2LogNums[4][iTau] = masterStagePops[iAbnd][2][iTau];
               list2LogNums[5][iTau] = masterStagePops[iAbnd][3][iTau];
               list2LogNums[6][iTau] = masterStagePops[iAbnd][4][iTau];
            }
            //double[] numHelp = LevelPopsServer.levelPops(list2Lam0[gaussLine_ptr[iLine]], list2LogNums[list2Stage[gaussLine_ptr[iLine]]], list2ChiL[gaussLine_ptr[iLine]], thisUwV,
             //       list2GwL[gaussLine_ptr[iLine]], numDeps, tauRos, temp);
//System.out.println("iLine " + iLine + " list2Lam0 " + list2Lam0[gaussLine_ptr[iLine]] + " list2ChiL" + list2ChiL[gaussLine_ptr[iLine]] +
// " thisUwV[] " + thisUwV[0] + " " + thisUwV[1] + " list2GwL " + list2GwL[gaussLine_ptr[iLine]]);
            double[] numHelp = LevelPopsServer.levelPops(list2Lam0[gaussLine_ptr[iLine]], list2LogNums[logNums_ptr], list2ChiL[gaussLine_ptr[iLine]], thisUwV,
                    list2GwL[gaussLine_ptr[iLine]], numDeps, temp);
            for (int iTau = 0; iTau < numDeps; iTau++){
               list2LogNums[2][iTau] = numHelp[iTau];
               list2LogNums[3][iTau] = -19.0; //upper E-level - not used - fake for testing with gS3 line treatment
              // if (iTau == 36){
               //  System.out.println("iLine " + iLine + " iTau " + iTau + " listLogNums[2] " + logE*list2LogNums[2][iTau]);
              // }
            } 

             //Proceed only if line strong enough: 
             // 
             //ifThisLine[gaussLine_ptr[iLine]] = true; //for testing
             //No! if (ifThisLine[gaussLine_ptr[iLine]] == true){
              
            // Gaussian only approximation to profile (voigt()):
//            double[][] listLinePoints = LineGrid.lineGridGauss(list2Lam0[gaussLine_ptr[iLine]], list2Mass[gaussLine_ptr[iLine]], xiT, numDeps, teff, listNumCore);
//            double[][] listLineProf = LineProf.gauss(listLinePoints, list2Lam0[gaussLine_ptr[iLine]],
//                    numDeps, teff, tauRos, temp, tempSun);
            // Gaussian + Lorentzian approximation to profile (voigt()):
            double[][] listLinePoints = LineGrid.lineGridVoigt(list2Lam0[gaussLine_ptr[iLine]], list2Mass[gaussLine_ptr[iLine]], xiT, numDeps, teff, listNumCore, listNumWing);
            if (species.equals("HI")){
 //System.out.println("Calling Stark...");
                 listLineProf = LineProf.stark(listLinePoints, list2Lam0[gaussLine_ptr[iLine]], list2LogAij[gaussLine_ptr[iLine]],
                    list2LogGammaCol[gaussLine_ptr[iLine]],
                    numDeps, teff, tauRos, temp, pGas, newNe, tempSun, pGasSun, hjertComp);
            } else {
                 listLineProf = LineProf.voigt(listLinePoints, list2Lam0[gaussLine_ptr[iLine]], list2LogAij[gaussLine_ptr[iLine]],
                    list2LogGammaCol[gaussLine_ptr[iLine]],
                    numDeps, teff, tauRos, temp, pGas, tempSun, pGasSun, hjertComp);
            } 
            double[][] listLogKappaL = LineKappa.lineKap(list2Lam0[gaussLine_ptr[iLine]], list2LogNums[2], list2Logf[gaussLine_ptr[iLine]], listLinePoints, listLineProf,
                    numDeps, zScaleList, tauRos, temp, rho);
            double[] listLineLambdas = new double[listNumPoints];
            for (int il = 0; il < listNumPoints; il++) {
                // // lineProf[gaussLine_ptr[iLine]][*] is DeltaLambda from line centre in cm
                listLineLambdas[il] = listLinePoints[0][il] + list2Lam0[gaussLine_ptr[iLine]];
            }

          //huh?  for (int ll = 0; ll < listNumPoints; ll++){
          //huh?   }  
            double[] masterLamsOut = SpecSyn.masterLambda(numLams, numMaster, numNow, masterLams, listNumPoints, listLineLambdas);
            double[][] logMasterKapsOut = SpecSyn.masterKappa(numDeps, numLams, numMaster, numNow, masterLams, masterLamsOut, logMasterKaps, listNumPoints, listLineLambdas, listLogKappaL);
            numNow = numNow + listNumPoints;

            //update masterLams and logMasterKaps:
            for (int iL = 0; iL < numNow; iL++) {
                masterLams[iL] = masterLamsOut[iL];
                for (int iD = 0; iD < numDeps; iD++) {
                    //Still need to put in multi-Gray levels here:
                    logMasterKaps[iL][iD] = logMasterKapsOut[iL][iD];
                   // if (iD == 36){
                   //    System.out.println("iL " + iL + " masterLams " + masterLams[iL] + " logMasterKaps " + logMasterKaps[iL][iD]);
                   // }
                }
            }
          //No! } //ifThisLine strength condition
        } //numLines loop
////

//
//Now the same for molecular lines:
// This holds 5-element temperature-dependent base e logarithmic parition fn:
        for (int kk = 0; kk < 5; kk++){
           thisQwABv[kk] = Math.log(300.0); //default initialization
        }

        double[][] molListLineProf = new double[molListNumPoints][numDeps];

// Put in high res spectrum synthesis lines:
        for (int iMolLine = 0; iMolLine < numMolGaussLines; iMolLine++) {

                zScaleList = zScale;

//
          int iMol = 0; //initialization
          int logMolNums_ptr = 0;
          for (int jj = 0; jj < nMols; jj++){
             if (molList2Name[molGaussLine_ptr[iMolLine]].equals(mname[jj])){
                  logMolNums_ptr = 0;  //may not be necessary - inherited from atom/ion treatment
                for (int kk = 0; kk < 5; kk++){
                   thisQwABv = PartitionFn.getMolPartFn(mname[jj]); //base e log Q
                }
                 break;   //we found it
                 }
             iMol++;
          } //jj loop
//For molecular - row 0 holds total molecular number density, 
//              - row 1 holds number density in lower E-level
           double[][] molList2LogNums = new double[2][numDeps];
            for (int iTau = 0; iTau < numDeps; iTau++){
               molList2LogNums[0][iTau] = masterMolPops[iMol][iTau];
            }
            //double[] numHelp = LevelPopsServer.levelPops(molList2Lam0[molGaussLine_ptr[iMolLine]], molList2LogNums[molList2Stage[molGaussLine_ptr[iMolLine]]], molList2ChiL[molGaussLine_ptr[iMolLine]], thisUwV,
             //       molList2GwL[molGaussLine_ptr[iMolLine]], numDeps, tauRos, temp);
//System.out.println("iMolLine " + iMolLine + " molList2Lam0 " + molList2Lam0[molGaussLine_ptr[iMolLine]] + " molList2ChiL" + molList2ChiL[molGaussLine_ptr[iMolLine]] +
// " thisUwV[] " + thisUwV[0] + " " + thisUwV[1] + " molList2GwL " + molList2GwL[molGaussLine_ptr[iMolLine]]);
            double[] numHelp = LevelPopsServer.levelPops(molList2Lam0[molGaussLine_ptr[iMolLine]], molList2LogNums[0], molList2ChiL[molGaussLine_ptr[iMolLine]], thisQwABv,
                    molList2GwL[molGaussLine_ptr[iMolLine]], numDeps, temp);
            for (int iTau = 0; iTau < numDeps; iTau++){
               molList2LogNums[1][iTau] = numHelp[iTau];
              // if (iTau == 36){
               //  System.out.println("iMolLine " + iMolLine + " iTau " + iTau + " listLogNums[2] " + logE*molList2LogNums[2][iTau]);
              // }
            } 

             //Proceed only if line strong enough: 
             // 
             //ifThisLine[molGaussLine_ptr[iMolLine]] = true; //for testing
             //No! if (ifThisLine[molGaussLine_ptr[iMolLine]] == true){
              
            // Gaussian only approximation to profile (voigt()):
//            double[][] listLinePoints = LineGrid.lineGridGauss(molList2Lam0[molGaussLine_ptr[iMolLine]], molList2Mass[molGaussLine_ptr[iMolLine]], xiT, numDeps, teff, listNumCore);
//            double[][] listLineProf = LineProf.molGauss(listLinePoints, molList2Lam0[molGaussLine_ptr[iMolLine]],
//                    numDeps, teff, tauRos, temp, tempSun);
            // Gaussian + Lorentzian approximation to profile (voigt()):
            double[][] listLinePoints = LineGrid.lineGridVoigt(molList2Lam0[molGaussLine_ptr[iMolLine]], molList2Mass[molGaussLine_ptr[iMolLine]], xiT, numDeps, teff, molListNumCore, molListNumWing);
                 listLineProf = LineProf.voigt(listLinePoints, molList2Lam0[molGaussLine_ptr[iMolLine]], molList2LogGammaRad[molGaussLine_ptr[iMolLine]],
                    molList2LogGammaCol,
                    numDeps, teff, tauRos, temp, pGas, tempSun, pGasSun, hjertComp);
            double[][] listLogKappaL = LineKappa.lineKap(molList2Lam0[molGaussLine_ptr[iMolLine]], molList2LogNums[1], molList2Log10gf[molGaussLine_ptr[iMolLine]], listLinePoints, listLineProf,
                    numDeps, zScaleList, tauRos, temp, rho);
            double[] listLineLambdas = new double[molListNumPoints];
            for (int il = 0; il < molListNumPoints; il++) {
                // // lineProf[molGaussLine_ptr[iMolLine]][*] is DeltaLambda from line centre in cm
                listLineLambdas[il] = listLinePoints[0][il] + molList2Lam0[molGaussLine_ptr[iMolLine]];
            }

            double[] masterLamsOut = SpecSyn.masterLambda(numLams, numMaster, numNow, masterLams, molListNumPoints, listLineLambdas);
            double[][] logMasterKapsOut = SpecSyn.masterKappa(numDeps, numLams, numMaster, numNow, masterLams, masterLamsOut, logMasterKaps, molListNumPoints, listLineLambdas, listLogKappaL);
            numNow = numNow + molListNumPoints;

            //update masterLams and logMasterKaps:
            for (int iL = 0; iL < numNow; iL++) {
                masterLams[iL] = masterLamsOut[iL];
                for (int iD = 0; iD < numDeps; iD++) {
                    //Still need to put in multi-Gray levels here:
                    logMasterKaps[iL][iD] = logMasterKapsOut[iL][iD];
                   // if (iD == 36){
                   //    System.out.println("iL " + iL + " masterLams " + masterLams[iL] + " logMasterKaps " + logMasterKaps[iL][iD]);
                   // }
                }
            }
          //No! } //ifThisLine strength condition
        } //numMolLines loop
//
////
//Continuum monochromatic optical depth array:
        double logTauCont[][] = LineTau2.tauLambdaCont(numLams, logKappa,
                 kappa500, numDeps, tauRos, logTotalFudge);

        //Evaluate formal solution of rad trans eq at each lambda 
        // Initial set to put lambda and tau arrays into form that formalsoln expects
        double[][] contIntens = new double[numLams][numThetas];
        double[] contIntensLam = new double[numThetas];

        double[][] contFlux = new double[2][numLams];
        double[] contFluxLam = new double[2];
        double[][] thisTau = new double[2][numDeps];

        lineMode = false;  //no scattering for overall SED

        for (int il = 0; il < numLams; il++) {

            for (int id = 0; id < numDeps; id++) {
                thisTau[1][id] = logTauCont[il][id];
                thisTau[0][id] = Math.exp(logTauCont[il][id]);
            } // id loop

            contIntensLam = FormalSoln.formalSoln(numDeps,
                    cosTheta, lambdaScale[il], thisTau, temp, lineMode);

            //contFluxLam = Flux.flux(contIntensLam, cosTheta);

            for (int it = 0; it < numThetas; it++) {
                contIntens[il][it] = contIntensLam[it];
            } //it loop - thetas

            //contFlux[0][il] = contFluxLam[0];
            //contFlux[1][il] = contFluxLam[1];

            //// Teff test - Also needed for convection module!:
            if (il > 1) {
                lambda2 = lambdaScale[il]; // * 1.0E-7;  // convert nm to cm
                lambda1 = lambdaScale[il - 1]; // * 1.0E-7;  // convert nm to cm
                fluxSurfBol = fluxSurfBol
                        + contFluxLam[0] * (lambda2 - lambda1);
            }
        } //il loop

        contFlux = Flux.flux3(contIntens, lambdaScale, cosTheta, phi, cgsRadius, omegaSini, macroVkm);

//Line blanketed monochromatic optical depth array:
       // double logTauMaster[][] = LineTau2.tauLambda(numMaster, masterLams, logMasterKaps,
       //         numLams, lambdaScale, logKappa, numDeps, logTauCont, kappa500, tauRos, logTotalFudge);
        double logTauMaster[][] = LineTau2.tauLambda(numMaster, masterLams, logMasterKaps,
                numDeps, kappa500, tauRos, logTotalFudge);

//Lin blanketed formal Rad Trans solution:
        //Evaluate formal solution of rad trans eq at each lambda throughout line profile
        // Initial set to put lambda and tau arrays into form that formalsoln expects
        double[][] masterIntens = new double[numMaster][numThetas];
        double[] masterIntensLam = new double[numThetas];

        double[][] masterFlux = new double[2][numMaster];
        double[] masterFluxLam = new double[2];

        lineMode = false;  //no scattering for overall SED

        for (int il = 0; il < numMaster; il++) {

//                        }
            for (int id = 0; id < numDeps; id++) {
                thisTau[1][id] = logTauMaster[il][id];
                thisTau[0][id] = Math.exp(logTauMaster[il][id]);
                //if (id == 36){
                //  System.out.println("il " + il + " masterLams " + masterLams[il] + " logMasterKaps " + logE*logMasterKaps[il][id] 
                //     + " logTauMaster " + logE*logTauMaster[il][id]); 
               // }
            } // id loop

            masterIntensLam = FormalSoln.formalSoln(numDeps,
                    cosTheta, masterLams[il], thisTau, temp, lineMode);

            //masterFluxLam = Flux.flux(masterIntensLam, cosTheta);

            for (int it = 0; it < numThetas; it++) {
                masterIntens[il][it] = masterIntensLam[it];
            } //it loop - thetas

            //masterFlux[0][il] = masterFluxLam[0];
            //masterFlux[1][il] = masterFluxLam[1];

            //// Teff test - Also needed for convection module!:
            if (il > 1) {
                lambda2 = masterLams[il]; // * 1.0E-7;  // convert nm to cm
                lambda1 = masterLams[il - 1]; // * 1.0E-7;  // convert nm to cm
                fluxSurfBol = fluxSurfBol
                        + masterFluxLam[0] * (lambda2 - lambda1);
            }
        } //il loop

        masterFlux = Flux.flux3(masterIntens, masterLams, cosTheta, phi, cgsRadius, omegaSini, macroVkm);

        logFluxSurfBol = Math.log(fluxSurfBol);
        double logTeffFlux = (logFluxSurfBol - Useful.logSigma()) / 4.0;
        double teffFlux = Math.exp(logTeffFlux);

//Extract linear monochromatic continuum limb darlening coefficients (LDCs) ("epsilon"s):
    double[] ldc = new double[numLams];
    ldc = LDC.ldc(numLams, lambdaScale, numThetas, cosTheta, contIntens);

        logFluxSurfBol = Math.log(fluxSurfBol);
        logTeffFlux = (logFluxSurfBol - Useful.logSigma()) / 4.0;
        teffFlux = Math.exp(logTeffFlux);
        //String pattern = "0000.00";
        ////String pattern = "#####.##";
        //DecimalFormat myFormatter = new DecimalFormat(pattern);

        //Do this photometry on client side:
        ////disk integrated colors:
        //double colors[] = Photometry.UBVRI(masterLams, masterFlux, numDeps, tauRos, temp);
        ////band-integrated  specific intensities :
        //double iColors[][] = Photometry.iColors(lambdaScale, intens, numDeps, numThetas, numLams, tauRos, temp);
//

// 
   //printout prepared for processing by server-side PHP script:

// Each 'value' (a scalar or a vector (1D array)) should have a unique corresponding text 'key'

// Just return basic modeling outputs - leave post-processing 
//of higher order observables to client-side to minimize amount of 
//data needing packing: 
//

  //Quality control:
     double tiny = 1.0e-19;
     double logTiny = Math.log(tiny);
     
   int iStart = ToolBox.lamPoint(numMaster, masterLams, lambdaStart);
   int iStop = ToolBox.lamPoint(numMaster, masterLams, lambdaStop);
   int numSpecSyn = iStop - iStart;
 
  int numSpecies = nelemAbnd * numStages; 
     //Block 1: Array dimensions
     //keys:
        //System.out.println("numDeps,numMaster,numThetas,numSpecSyn,numGaussLines,numLams,nelemAbnd,numSpecies"); 
        System.out.println("numDeps,numMaster,numThetas,numGaussLines,numLams,nelemAbnd,numSpecies"); 
     //values:
        //System.out.format("%03d,%07d,%03d,%07d,%06d,%07d,%05d,%04d%n", 
         //   numDeps, numMaster, numThetas, numSpecSyn, numGaussLines, numLams, nelemAbnd, numSpecies);
        System.out.format("%03d,%07d,%03d,%06d,%07d,%05d,%04d%n", 
            numDeps, numMaster, numThetas, numGaussLines, numLams, nelemAbnd, numSpecies);

    //Block 2: Atmosphere
     //keys:
        System.out.println("logTau,logZ,logTemp,logPGas,logPRad,logRho,logNe,logMmw,logKappa");
     //values:
        //Print out *NATURAL* logs - this is for communication between server & client: 
        for (int i = 0; i < numDeps; i++) {
            System.out.format("%13.8f,%13.8f,%13.8f,%13.8f,%13.8f,%13.8f,%13.8f,%13.8f,%13.8f%n", 
                    tauRos[1][i], Math.log(depths[i]), temp[1][i], pGas[1][i], pRad[1][i], 
                    rho[1][i], newNe[1][i], Math.log(mmw[i]), kappaRos[1][i] );
               }

   //Block 3: line blanketed flux spectrum (SED)
   //keys:
        System.out.println("logWave,logFlux");
   //values:
        for (int i = 0; i < numMaster; i++){
 //Do quality control here:
           if ( (masterFlux[1][i] < logTiny) || (masterFlux[0][i] < tiny) ){
              masterFlux[1][i] = logTiny;
              masterFlux[0][i] = tiny;
               }
           System.out.format("%13.8f,%13.8f%n", Math.log(masterLams[i]), masterFlux[1][i]); 
         }

//
   //Block 4: Line blanketed Specific intensity distribution: 
//
       //Structure: One major vectorized block per theta with the 
      // cos(theta) value followed by the intensity spectrum for that theta: 
        for (int i = 0; i < numThetas; i++){
        System.out.println("cosTheta" + i);  //key
           System.out.format("%11.6f%n", cosTheta[1][i]);  //value
            System.out.println("Intensity" + i); //key 
            for (int j = 0; j < numMaster; j++){
 //Do quality control here:
           if ( masterIntens[j][i] < tiny ){
              masterIntens[j][i] = tiny;
               }
               System.out.format("%13.8f%n", Math.log(masterIntens[j][i])); //value
            }
         }

////
//   //Block 5: approximately rectified flux spectrum in spectrum synthesis region: 
//   //keys:
//        System.out.println("logWaveSS,logFluxSS");
//        double[] specSynLams = new double[numSpecSyn];
//        double[][] specSynFlux = new double[2][numSpecSyn];
//   //values:
//        int iCount = 0; 
//        for (int i = iStart; i < iStop; i++){
//
//   //This doesn't seem very useful (yet), but let's do it anyway for clarity:
//           specSynLams[iCount] = masterLams[i]; 
// //Do quality control here:
//           if ( (masterFlux[1][i] < logTiny) || (masterFlux[0][i] < tiny) ){
//              masterFlux[1][i] = logTiny;
//              masterFlux[0][i] = tiny;
//               }
//           //approximate rectification:
//           specSynFlux[1][iCount] = masterFlux[1][i] - Planck.planck(teff, masterLams[i]);
//           specSynFlux[0][iCount] = Math.exp(specSynFlux[1][iCount]);
//           System.out.format("%13.8f,%13.8f%n", Math.log(specSynLams[iCount]), specSynFlux[1][iCount]); 
//           iCount++;
 //        }

//Block 6: line ID tags for lines included in spectrum:
        System.out.println("listElement,listStage,listLam0");
        for (int iGauss = 0; iGauss < numGaussLines; iGauss++) {
             System.out.format("%3s,%4s,%9.3f%n",list2Element[gaussLine_ptr[iGauss]], list2StageRoman[gaussLine_ptr[iGauss]], 
                                 1.0e7*list2Lam0[gaussLine_ptr[iGauss]]); 
                }


   //Block 7: continuum flux spectrum (SED)
   //keys:
        System.out.println("logWaveC,logFluxC");
   //values:
        for (int i = 0; i < numLams; i++){
 //Do quality control here:
           if ( (contFlux[1][i] < logTiny) || (contFlux[0][i] < tiny) ){
              contFlux[1][i] = logTiny;
              contFlux[0][i] = tiny;
               }
           System.out.format("%13.8f,%13.8f%n", Math.log(lambdaScale[i]), contFlux[1][i]); 
         }

   //Block 8: linear monochromatic continuum limb darkening coefficients (LDCs):
   //keys:
        System.out.println("LDC");
   //values:
        for (int i = 0; i < numLams; i++){
           System.out.format("%13.8f%n", ldc[i]);
         }

//
//Block 9: A12 abundances of chemical species
   //keys:
          System.out.println("element,abundance");
      //values:
       for (int i = 0; i < nelemAbnd; i++){
          System.out.format("%4s,%9.3f%n", cname[i], eheu[i]);  
       }

//
//Block 10: Ground state ionization Es & total ion stage log_e populations for chemical species (ionization stages)

   //keys:
        System.out.println("species,ionStage,chiI,logNumTau1");
   //values:
        //Ground state ionization E - Stage I (eV) 
   for (int iElem = 0; iElem < nelemAbnd; iElem++){
     for (int iStage = 0; iStage < numStages; iStage++){
       species = "HI"; //default initialization
       switch (iStage){
          case 0: species = cname[iElem] + "I";
          break;
          case 1: species = cname[iElem] + "II";
          break;
          case 2: species = cname[iElem] + "III";
          break;
          case 3: species = cname[iElem] + "IV";
          break;
          case 4: species = cname[iElem] + "V";
          break;
       }
       double thisChiI = IonizationEnergy.getIonE(species);  //ev
       System.out.format("%7s,%03d,%9.3f,%13.8f%n", cname[iElem], iStage, thisChiI, tauOneStagePops[iElem][iStage]);
    } //iStage loop
  } //iElem loop

           
   

//        System.out.println("areNoLines");
//        System.out.format("%b%n",areNoLines);

//
    } // end main()

        //

} //end class GrayStar3Server
