(function() {
	var game = function(gf, data) {
		var scope = this;
		this.gf 	= gf;
		this.data 	= data;
		
		/*
		this.data.buttons = [{
			name:		"submit",
			label:		"Submit",
			onClick:	function() {
				scope.formjs.submit();
			}
		}];	*/
	}
	// Build the component
	game.prototype.build = function(line) {
		var scope = this;
		
		console.info("Building level.");
		
		line.container.addClass("game-trivia");
		
		// Build the instructions
		switch (this.data.data.type) {
			default:
			case "radio":
				line.layer.instructions.bg.addClass("instruction-tap");
			break;
			case "varchar":
				line.layer.instructions.bg.addClass("instruction-input");
			break;
		}
		
		
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
					// Remove the focus! (bugfix!)
					$("input").blur();
					line.container.addClass("has-error");
					scope.gf.showPenalty(3, function() {
						// Register the error after the penalty
						scope.onError(data.question);
					});
				}
				
			},
			onChange:	function(data, formjs) {
				// Submit the form for any change detected
				scope.formjs.submit();
			},
			onError:	function(data, formjs) {	// Executed when at least one question didn't validate.
				console.log("Error!",data, formjs);
				line.container.removeClass("has-error");
				line.container.addClass("has-error");
				scope.gf.showPenalty();
			}
		});
	}
	game.prototype.init = function() {
		console.info("Game initialized.");
		this.formjs.focus();
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