/*# -*- coding: utf-8 -*-
"""
Created on Thu May  9 10:09:02 2019

@author: 
"""
*/

/* 
 * Consists of original BlockData, GasData, GsRead2, and GsCalc driver program
 * almagamated
 */



var kbol = 1.3806e-16;

var hmass = 1.66053e-24;
var t0 = 5039.93e0;
     
     
/*
public static String[] name = makeName();

public static String[] makeName(){
  
   String[] name = new String[150];
   for (int i = 0; i < 150; i++){
      name[i] = "";
   } 

   return name;

}
*/    
var gsinit = true; 
var print0 = false;
    
var itab = 
       [1,  7,  0,  0,  0,  2,  3,  4,  0,  8,
        9,  10, 11, 12, 0,  5,  6,  0, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  23, 24, 25,
        0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0]; 

//#ntab = [4, 26, 7, 5, 2]
var ntab = [3, 25, 6, 4, 1];


/*
#c
#c Initialize block of flags and control parameters.
#c
#c  The list of species for which partial pressures are
#c  explicitly referenced (for opacity calculations and general
#c  interest) are defined by the array IXA below. These are:
#c
#c    1. H      2. H+     3. H-     4. H2     5. H2+    6. He
#c    7. He+    8. C      9. C+    10. N     11. N+    12. O
#c   13. O+    14. Ne    15. Na    16. Na+   17. Mg    18. Mg+
#c   19. Mg++  20. Al    21. Al+   22. Si    23. Si+   24. S
#c   25. S+    26. K     27. K+    28. Ca    29. Ca+   30. Ca++
#c   31. Ti    32. Ti+   33. V     34. V+    35. Fe    36. Fe+
#c   37. CO    38. N2    39. OH    40. H2O   41. SiO   42. TiO
#c   43. VO    44. CN    45. CH    46. NH    47. HCO   48. HCN
#c   49. C2H2  50. HS    51. MgH   52. AlH   53. SiH   54. CaH
#c   55. C2    56. C3    57. CS    58. SiS   59. SiC   60. SiC2
#c
*/

var nix = 60;
    
var ixaTranspose = 
               [[1, 1,0,0,0],  [2, 1,0,0,0],  [0, 1,0,0,0],  [1, 1,1,0,0],
                [2, 1,1,0,0],  [1, 7,0,0,0],  [2, 7,0,0,0],  [1, 2,0,0,0],
                [2, 2,0,0,0],  [1, 3,0,0,0],  [2, 3,0,0,0],  [1, 4,0,0,0],
                [2, 4,0,0,0],  [1, 8,0,0,0],  [1, 9,0,0,0],  [2, 9,0,0,0],
                [1,10,0,0,0],  [2,10,0,0,0],  [3,10,0,0,0],  [1,11,0,0,0],
                [2,11,0,0,0],  [1,12,0,0,0],  [2,12,0,0,0],  [1, 5,0,0,0],
                [2, 5,0,0,0],  [1,13,0,0,0],  [2,13,0,0,0],  [1,14,0,0,0],
                [2,14,0,0,0],  [3,14,0,0,0],  [1,16,0,0,0],  [2,16,0,0,0],
                [1,17,0,0,0],  [2,17,0,0,0],  [1,20,0,0,0],  [2,20,0,0,0],
                [1, 4,2,0,0],  [1, 3,3,0,0],  [1, 4,1,0,0],  [1, 4,1,1,0],
                [1,12,4,0,0],  [1,16,4,0,0],  [1,17,4,0,0],  [1, 3,2,0,0],
                [1, 2,1,0,0],  [1, 3,1,0,0],  [1, 4,2,1,0],  [1, 3,2,1,0],
                [1, 2,2,1,1],  [1, 5,1,0,0],  [1,10,1,0,0],  [1,11,1,0,0],
                [1,12,1,0,0],  [1,14,1,0,0],  [1, 2,2,0,0],  [1, 2,2,2,0],
                [1, 5,2,0,0],  [1,12,5,0,0],  [1,12,2,0,0],  [1,12,2,2,0]];


var makeIxa = function(ixaTranspose){
   
  var ixa = [];
  ixa.length = 5;
  for (var i = 0; i < 5; i++){
     ixa[i]= [];
     ixa.length = 60;
     for (var j = 0; j < 60; j++){
        ixa[i][j] = ixaTranspose[j][i];
        //System.out.println("i " + i + " j " + j + " ixa " + ixa[i][j]);
     }
  }
 
  return ixa;

}; //end method makeIxa

var ixa = makeIxa(ixaTranspose);
            
var chix = 
       ["H       ", "H+      ", "H-      ", "H2      ",
        "H2+     ", "He      ", "He+     ", "C       ",
        "C+      ", "N       ", "N+      ", "O       ",
        "O+      ", "Ne      ", "Na      ", "Na+     ",
        "Mg      ", "Mg+     ", "Mg++    ", "Al      ",
        "Al+     ", "Si      ", "Si+     ", "S       ",
        "S+      ", "K       ", "K+      ", "Ca      ",
        "Ca+     ", "Ca++    ", "Ti      ", "Ti+     ",
        "V       ", "V+      ", "Fe      ", "Fe+     ",
        "CO      ", "N2      ", "OH      ", "H2O     ",
        "SiO     ", "TiO     ", "VO      ", "CN      ",
        "CH      ", "NH      ", "HCO     ", "HCN     ",
        "C2H2    ", "HS      ", "MgH     ", "AlH     ",
        "SiH     ", "CaH     ", "C2      ", "C3      ",
        "CS      ", "SiS     ", "SiC     ", "SiC2    "];
   

    var iprint = 0;

