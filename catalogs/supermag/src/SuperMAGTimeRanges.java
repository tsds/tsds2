import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.ArrayList;
import java.io.*;
import java.awt.*;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.util.*;

// S. Li, 06/01/2013.
// Reads inventory images to determine start and stop year.
// Inventory images have green pixels when data are available.

public class SuperMAGTimeRanges {
	static int startYear = 1980;
	static int endYear   = 2020;

	public static boolean isExist(String url){
    	try{
    		URL oracle = new URL(url);
    	    InputStream input=oracle.openStream();
    	}
    	catch(Exception e){
    		return false;
    	}
    	return true;
    }
    
	public static int getStartYear(String STA){
		int start=0;
		for(int i=startYear;i<=endYear;i++){
			String fileUrl="http://supermag.uib.no/inventory/img/png/"+i+"."+STA+".png";
			System.err.println("Requesting: " + fileUrl);
			// Set<Integer> colors = new HashSet<Integer>();
			BufferedImage image = null;
			try {
				Set<Integer> colors = new HashSet<Integer>();

				URL url = new URL(fileUrl);
				image = ImageIO.read(url);
				int w = image.getWidth();
				int h = image.getHeight();
				int pixel  = image.getRGB(w/2, h/2);     
				int  red   = (pixel & 0x00ff0000) >> 16;
				int  green = (pixel & 0x0000ff00) >> 8;
				int  blue  =  pixel & 0x000000ff;
				if(green>red&&green>blue)
					colors.add(pixel);
				//System.err.println("There are "+colors.size()+" colors");
				if(colors.size()>0){
					start=i;
					break;
				}
			} catch (IOException e) {}
		}
		return start;
	}

    public static int getEndYear(String STA){
    	int end=0;
   	 for(int i=endYear;i>=startYear;i--){
		 String fileUrl="http://supermag.uib.no/inventory/img/png/"+i+"."+STA+".png";
		 System.err.println("Requesting: " + fileUrl);

		 // Set<Integer> colors = new HashSet<Integer>();
 		 BufferedImage image = null;
 			try {
 				Set<Integer> colors = new HashSet<Integer>();
 				
 			    URL url = new URL(fileUrl);
 			    image = ImageIO.read(url);
 			    int w = image.getWidth();
 			    int h = image.getHeight();
 			//    for(int y = 0; y < h; y++) {
 			//        for(int x = 0; x < w; x++) {
 			            int pixel = image.getRGB(w/2, h/2);     
 			            int  red   = (pixel & 0x00ff0000) >> 16;
 			            int  green = (pixel & 0x0000ff00) >> 8;
 			            int  blue  =  pixel & 0x000000ff;
 			            if(green>red&&green>blue)
 			            	colors.add(pixel);
 			//        }
 			//    }
 			  //  System.out.println("There are "+colors.size()+" colors");
 			    if(colors.size()>0){
 			    	end=i;
     				break;
 			    }
 			    	
 			} catch (IOException e) {
 			}		
 			
 	 }
    	return end;   	
    }
    
	public static void main(String[] args) throws Exception{
			BufferedReader in =  new BufferedReader(new FileReader(args[0]));
			String inputLine;		 		  
			while ((inputLine = in.readLine()) != null){
				if(inputLine.equalsIgnoreCase("IAGA     GLON     GLAT   STATION-NAME")){
					inputLine = in.readLine();
					System.err.println(inputLine);
					while ((inputLine = in.readLine()) != null){
						String name = inputLine.substring(0, 3);
						int start = getStartYear(name);
						System.err.print(name+" Start="+start+"\n");
						int end = getEndYear(name);
						System.err.print(name+" End="+end+"\n");

						System.out.println(name+" "+start+"/"+end+"\r\n");
					}
				}
			}      
			in.close();
	}

}
