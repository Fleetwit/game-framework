(function() {
	window.formjsFactory.plugin("fleetwit",function(formjs) {
		
		formjs.createLine = function(data) {
			var line 	= window.formjsFactory.dom("div", this.container);
			if (this.theme.line.classname) {
				line.addClass(this.theme.line.classname);
			}
			var label 	= window.formjsFactory.dom(this.theme.label.type, line);
				label.html(data.label);
			if (this.theme.label.classname) {
				label.addClass(this.theme.label.classname);
			}
			var field 	= window.formjsFactory.dom(this.theme.field.type, line);
			if (this.theme.field.classname) {
				field.addClass(this.theme.field.classname);
			}
			// Return the individual components (DOM nodes)
			return {
				line:	line,
				label:	label,
				field:	field
			};
		};
		
	}, {
		description:	"Accordion: Display the survey as an accordion",
		version:		1.0,
		author:			"Julien Loutre <julien@twenty-six-medias.com>"
	});
})();