import java.io.*;
import java.lang.*;
import javax.script.*;
import java.util.Arrays;
import java.util.List;

public class App
{
    public static void main(String[] args) throws Exception
    {
        try
        {
            ScriptEngine engine = 
                new ScriptEngineManager().getEngineByName("javascript");
                
            for (String arg : args)
            {
                Bindings bindings = new SimpleBindings();
                //bindings.put("author", new Person("Ted", "Neward", 39));
                bindings.put("title", "5 Things You Didn't Know");
                System.out.println("App.java: Evaluating " + arg);
                //FileReader fr = new FileReader(arg);
                //engine.eval(fr, bindings);

                // the .js is in the classpath
        			engine.eval(new InputStreamReader (App.class.getResourceAsStream(arg)));

        			@SuppressWarnings("unchecked")
        			List <Double> listDouble = (List <Double>) engine.get("listDouble");
        			if (listDouble != null) {
        				for (double s : (List <Double>) listDouble) {
        					System.out.println("App.java: " + s);
        				}
        			}

        			@SuppressWarnings("unchecked")
                List <String> listString = (List <String>) engine.get("listString");
        			if (listString != null) {
        				for (String s : (List<String>) listString) {
        					System.out.println("App.java: " + s);
        				}
        			}

        			// call a javascript function to retrieve an object
        			if (engine instanceof Invocable){
        				Invocable engineInv = (Invocable)engine;
        				Object obj = engine.get("listObject");
        				Object list2 = engineInv.invokeMethod(obj, "getList2");
        				//System.out.println(list2);
        				if (list2 != null) {
        					for (String s : (List<String>) list2) {
        						System.out.println("App.java: " + s);
        					}
        				}
        			}

            }
        }
        catch(ScriptException scrEx)
        {
            scrEx.printStackTrace();
        }
    }
}