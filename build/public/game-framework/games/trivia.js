(function() {
	var game = function(gf, data) {
		var scope = this;
		this.gf 	= gf;
		this.data 	= data;
		
		this.data.buttons = [{
			name:		"submit",
			label:		"Submit",
			onClick:	function() {
				scope.formjs.submit();
			}
		}];		
	}
	// Build the component
	game.prototype.build = function(line) {
		console.log("line",line, this.data);
		var scope = this;
		
		// Display the question, with the bootstrap plugin
		this.formjs = new window.formjs(line.game, ['bootstrap']).build({
			form:		[_.extend({},this.data.data,{
				name:		"question",
				required:	true
			})],
			onSubmit:	function(data, formjs) {	// Executed when the entire form validates.
				line.container.removeClass("has-error");
				if (data.question == scope.data.data.answer) {
					scope.end();
				} else {
					scope.saveError(data.question);
					line.container.addClass("has-error");
				}
				
			},
			onError:	function(data, formjs) {	// Executed when at least one question didn't validate.
				line.container.removeClass("has-error");
				line.container.addClass("has-error");
			}
		});
	}
	game.prototype.init = function() {
		
	} 
	game.prototype.hide = function() {
		
	}
	// Register the component
	window.gfFactory.game("trivia", game, {
		description:	"Trivia, a FormJS adapter.",
		version:		1.0,
		author:			"Julien Loutre <julien@twenty-six-medias.com>"
	});
})();