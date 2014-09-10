// Set defaults using
//$('#debug').each(function(){ this.checked = false; });
//$('#previewimgcheckbox').each(function(){ this.checked = true; });

// See Harris' post at http://stackoverflow.com/questions/426258/how-do-i-check-a-checkbox-with-jquery-or-javascript
(function( $ ) {
	$.fn.checked = function(value) {
		if(value === true || value === false) {
			// Set the value of the checkbox
			$(this).each(function(){ this.checked = value; });
		} 
		else if(value === undefined || value === 'toggle') {
			// Toggle the checkbox
			$(this).each(function(){ this.checked = !this.checked; });
		}
	};
})( jQuery );

