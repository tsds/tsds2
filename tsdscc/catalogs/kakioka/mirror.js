var catalog = "CARISMA";
//var catalog = "CANOPUS";

var request = require('request');
var jsdom   = require("jsdom");
var fs      = require('fs');
var moment  = require('moment');
var unzip   = require('unzip');
//var zlib    = require('zlib');

login();
//<meta content="qpP6L7P6asIceqigmR2odIPj4MAC+RafTDQP2Qlz9n0=" name="csrf-token" />

function login() {
			// Read page with jQuery.
			jsdom.env(
				"http://www.kakioka-jma.go.jp/metadata/orders/new?id=864&locale=en",
				['http://code.jquery.com/jquery-1.6.min.js'],
				function (err, window) {

					//if (err) console.log(err);
					// Extract 
					var $ = window.jQuery;

					//var hidden = $("fieldset input[type*='hidden']");
					//console.log($("li"))
					console.log($("input[name='authenticity_token']").attr('value'));
				});
}