(function() {
	var display = function(gf, data) {
		this.gf 	= gf;
		this.data 	= data;
	}
	// Build the display
	display.prototype.build = function(line) {
		this.line		= line;
		this.img 		= window.formjsFactory.dom("img", line.display);
		this.img.css("width", "100%");
		this.img.attr('src', this.data.display.image)
		console.log("this.line",this.line);
	}
	display.prototype.init = function() {
		
	}
	display.prototype.hide = function() {
		
	}
	// Register the display
	window.gfFactory.display("image", display, {
		description:	"Display a static adaptive image",
		version:		1.0,
		author:			"Julien Loutre <julien@fleetwit.com>"
	});
})();