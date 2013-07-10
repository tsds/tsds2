import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.text.*;
import java.util.*; 
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.StringTokenizer;


public class SuperMAG {
	public  static String compactString(String str){
		StringTokenizer stringTokenizer = new StringTokenizer(str);
		String list=new String();
		while(stringTokenizer.hasMoreTokens()){
			  list+=stringTokenizer.nextToken()+"/";
			  }				
		return list;
	}
	public static HashMap getTime(String timefile) throws Exception{
		BufferedReader in =  new BufferedReader(new FileReader(timefile));
        HashMap<String, String> table=new HashMap<String,String>();
		  String inputLine;
		  
		  while ((inputLine = in.readLine()) != null){  
			  String[] temp=inputLine.split(" ");
			  table.put(temp[0], temp[1]);
		  }      
		  in.close();
		  return table;
	}
	public  static String bookmark(String str, String timefile) throws Exception{
		 HashMap table=getTime(timefile);
        String[] temp=str.split("/");
        String location=new String();
        if(temp.length>3){
       	 for(int i=3;i<temp.length;i++)
       		 location+=temp[i];
        }
		 String bookmark="<bookmark>"+"\n";
		 bookmark+="<title>";
		 bookmark+=temp[0];
		 bookmark+="</title>"+"\n";	 
		 bookmark+="<description>";
		 bookmark+=location+" Geographic Lat, Long = "+temp[1]+","+temp[2];
		 bookmark+="</description>"+"\n";
		 
		 bookmark+="<url>";
		  if(table.containsKey(temp[0])){
	        	String[] timeRange=((String)table.get(temp[0])).split("/");
	        	 if(Integer.parseInt(timeRange[1])==0){
	        		   return "";
	        	   }
	        	bookmark+="http://autoplot.org/data/jyds/supermag.jyds?station="+temp[0]+"&amp;timeRange="+timeRange[1]+"1231";
		  }else{
		 bookmark+="http://autoplot.org/data/jyds/supermag.jyds?station="+temp[0]+"&amp;timeRange=20111231";
		  }
		 bookmark+="</url>"+"\n";
		 
		 bookmark+="</bookmark>"+"\n";
		 return bookmark;
	}
	public  static String process(String[] datas, String timefile) throws Exception{
		
		String result="<bookmark-list version=\"1.1\">"+"\n"+"<bookmark-folder>"+"\n"+"<title>SuperMAG</title>"+"\n"+"<bookmark-list>";
		String preBookmarkFolder=datas[0].substring(0, 1);
		String folder="<bookmark-folder>"+"\n"+"<title>"+preBookmarkFolder+"</title>"+"\n"+"<bookmark-list>"+"\n";
		for(String data:datas){			
			String currentBookmarkFolder=data.substring(0, 1);
			if(currentBookmarkFolder.equals(preBookmarkFolder)){
				String bookmark=bookmark(data, timefile);
				folder+=bookmark;
			}else{
				folder+="</bookmark-list>"+"\n"+"</bookmark-folder>"+"\n"+"<bookmark-folder>"+"\n"+"<title>"+currentBookmarkFolder+"</title>"+"\n"+"<bookmark-list>"+"\n";
				preBookmarkFolder=currentBookmarkFolder;
			}
			
		}
		folder+="</bookmark-list>"+"\n"+"</bookmark-folder>"+"\n";
		result+=folder+"</bookmark-list>"+"\n"+"</bookmark-folder>"+"\n"+"</bookmark-list>";
		return result;
	}
	public static String dataset(String str, String timefile) throws Exception{
		 HashMap table=getTime(timefile);
	     String[] temp=str.split("/");
	     String location=new String();     
	     
         for(int i=0;i<temp.length;i++)
	     location+=temp[i]+" ";    

	 String name = "";
	 if (temp.length > 3) {
	     name = temp[3];
	 } else {
	     name = "";
	 }
        String dataset="<dataset name=\""+name+"\" ID=\""+temp[0]+"\">"+"\n"+"<access serviceName=\"tss\" urlPath=\""+temp[0]+"\"> </access>"+"\n";
        dataset+="<access serviceName=\"ncml\" urlPath=\""+temp[0]+"\"> </access>"+"\n";
        dataset+="<geospatialCoverage><northsouth><start>"+temp[1]+"</start><size>0</size><units>degrees_north</units></northsouth><eastwest><start>"+temp[2]+"</start><size>0</size><units>degrees_east</units></eastwest></geospatialCoverage>";
        dataset+="<documentation xlink:href=\"http://supermag.jhuapl.edu/info/coordinates.html\" xlink:title=\"Coordinate system information\"/>";
		dataset+="<documentation xlink:href=\"http://supermag.uib.no/info/rulesoftheroad.html/\" xlink:title=\"Acknowledging SuperMAG's data providers\"/>"+"\n";        
		dataset+="<documentation xlink:href=\"http://supermag.uib.no/info/acknowledgement.html/\" xlink:title=\"Acknowledging the SuperMAG data service\"/>"+"\n";        

        if(table.containsKey(temp[0])){
        	 String[] timeRange=((String)table.get(temp[0])).split("/");
        	 if(Integer.parseInt(timeRange[1])==0){
        		   return "";
        	   }
     		System.out.println(timeRange[2]);

                 dataset+="<groups><group id=\"B_NEZ\" names=\"B_N,B_E,B_Z\" units=\"nT,nT,nT\"></group></groups>";
                 dataset+="<variables><variable id=\"B_N\" name=\"B_N\" label=\"B_N\" units=\"nT\"></variable><variable id=\"B_E\" name=\"B_E\" label=\"B_E\" units=\"nT\"></variable><variable id=\"B_Z\" name=\"B_Z\" label=\"B_Z\" units=\"nT\"></variable></variables>";
        	 dataset+="<timeCoverage>"+"\n"+"<Start>"+timeRange[1]+"-01-01</Start><End>2013-01-31</End>"+"\n"+"</timeCoverage>"+"\n";
        }else{
	    dataset+="<timeCoverage>"+"\n"+"<Start>2011-12-31</Start><End>2013-01-31</End>"+"\n"+"</timeCoverage>"+"\n";
        }
        dataset+="</dataset>"+"\n";
        return dataset;	
     
	}
	public  static String thredProcess(String[] datas, String timefile) throws Exception{
		 
		Date now = new Date();
		
		SimpleDateFormat sdf = new SimpleDateFormat("EEE, d MMM HH:mm:ss 'UTC' yyyy"); 
		sdf.setTimeZone(TimeZone.getTimeZone("GMT"));
		String stamp = sdf.format(now); 
		
		String result="<catalog xmlns=\"http://www.unidata.ucar.edu/namespaces/thredds/InvCatalog/v1.0\"  xmlns:xlink=\"http://www.w3.org/1999/xlink\" name=\"SuperMag Catalog\">"+"\n";
		result+="<service name=\"tss\" serviceType=\"OpenDAP\" base=\"http://tsds.net/tsdsdev/supermag/\"> </service>"+"\n";	
		result+="<documentation xlink:href=\"http://supermag.jhuapl.edu/\" xlink:title=\"SuperMAG web page\"/>"+"\n";
		result+="<documentation xlink:href=\"/\" xlink:title=\"Catalog generation date: " + stamp + "\"/>"+"\n";        
		result+="<documentation xlink:href=\"http://supermag.jhuapl.edu/info/station_location_ascii_file.txt\" xlink:title=\"Catalog derived from http://supermag.jhuapl.edu/info/station_location_ascii_file.txt\"/>"+"\n";
		result+="<documentation xlink:href=\"/http://tsds.org/code#SuperMAG\" xlink:title=\"Catalog generation software\"/>"+"\n";        
			
		for(String data:datas){
			result+=dataset(data, timefile);
		}
		result+="</catalog>";
		return result;
	}
	
	public static String convert(String file, String timefile, String type) throws Exception{
		  BufferedReader in =  new BufferedReader(new FileReader(file));

		  String inputLine;
		  ArrayList<String> list=new ArrayList<String>();
		  
		  while ((inputLine = in.readLine()) != null){
			  if(inputLine.equalsIgnoreCase("IAGA     GLON     GLAT   STATION-NAME")){
				  inputLine = in.readLine();
				  while ((inputLine = in.readLine()) != null){
					  String temp=compactString(inputLine);
					  list.add(temp);
				  }
			  }


		  }      
		  String[] temp=new String[list.size()];
		  for(int i=0;i<list.size();i++)
			  temp[i]=list.get(i).toString();
		  Arrays.sort(temp);	  

		  if(type.equalsIgnoreCase("autoplot"))
			  return process(temp, timefile);			  
		  else if(type.equalsIgnoreCase("thredds"))
			  return thredProcess(temp, timefile);
		  else
			  return "output file format must be assigned either autoplot or thredds";
	}
	      
	public static void main(String[] args) throws Exception{
        String result = convert(args[0],args[1],args[2]);
        System.out.print(result);
		
	}

}
