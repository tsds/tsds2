import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.util.StringTokenizer;


public class xmlcatalog {

	public static String Parameter(String id, String longName,String cadence,String start,String end){
		String temp="<Parameter>"+"\n";
		temp+="<Id>"+id+"</Id>"+"\n";
		temp+="<LongName>"+longName+"</LongName>"+"\n";
		temp+="<Cadence>"+cadence+"</Cadence>"+"\n";
		temp+="<Units>"+"</Units>"+"\n";
		temp+="<TimeInterval>"+"\n";
		temp+="<Start>"+start+"</Start>"+"\n";
		temp+="<End>"+end+"</End>"+"\n";
		temp+="</TimeInterval>"+"\n";
		temp+="</Parameter>"+"\n";
		return temp;
	}
	
	public static void main(String[] args) {

		try{
			BufferedReader in = new BufferedReader(new FileReader(args[0]));

			String inputLine;
			String output="<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>"+"\n";
			output+="<TS_Catalog xmlns=\"http://sscweb.gsfc.nasa.gov\">"+"\n";
			while ((inputLine = in.readLine()) != null){
				if(inputLine.equalsIgnoreCase("Satellites:")){

					while (!inputLine.contains("Time to execute getAllSatellites")){
						inputLine = in.readLine();
						if(!inputLine.contains("Time to execute getAllSatellites")){
							StringTokenizer stringTokenizer = new StringTokenizer(inputLine);
							if(stringTokenizer.countTokens()>5){
								String temp=new String();
								while(stringTokenizer.hasMoreTokens()){
									String token=stringTokenizer.nextToken();
									if(!token.contains("("))
										temp+=token+"%";				    		 					   		 
								}
								String[] result=temp.split("%");
								if(result.length>8)
									output+=Parameter(result[0],result[1],result[3],result[4],result[6]);
								else
									output+=Parameter(result[0],result[1],result[2],result[3],result[5]);
							}
						}
					}

				}

			}

			in.close();
			output+="</TS_Catalog>";
			//BufferedWriter out = new BufferedWriter(new FileWriter("catalog.xml"));
			System.out.print(output);
		}catch(Exception e){
			System.out.print(e);
		}

	}

}
