function head(url, proxy, success, error) {

ASYNC = true;
if (arguments.length < 3) {
	ASYNC = false;
}

proxy = "http://localhost:8002/proxy";
if (arguments.length > 1)
	url = proxy + "?" + url;
}

$.ajax({
    		type: "HEAD",
    		async: ASYNC,
    		url: url,
    		error: function(message,text,response){
			if (!ASYNC) {return head};  
    			error(message,text,response);
    		},
    		success: function(message,text,response){
			if (!ASYNC) {return head};  
    			success(message,text,response);
    		}
    	});

}