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
	game.prototype.build = function(layers) {
		var scope = this;
		
		console.info("Building level.");
		
		this.layers = layers;
		
		layers.instructions.addClass("game-trivia");
		
		// Build the instructions
		switch (this.data.data.type) {
			default:
			case "radio":
				layers.elements.instructions.container.addClass("instruction-tap");
			break;
			case "varchar":
				layers.elements.instructions.container.addClass("instruction-input");
			break;
		}
		
		
		// Display the question, with the bootstrap plugin
		this.formjs = new window.formjs(this.layers.elements.game.container, ['bootstrap']).build({
			showLabel:	false,
			form:		[_.extend({},this.data.data,{
				name:		"question",
				required:	true
			})],
			onSubmit:	function(data, formjs) {	// Executed when the entire form validates.
				scope.layers.elements.game.container.removeClass("has-error");
				if (data.question.toLowerCase() == scope.data.data.answer.toLowerCase()) {
					scope.end();
				} else {
					// Remove the focus! (bugfix!)
					$("input").blur();
					scope.layers.elements.game.container.addClass("has-error");
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
				scope.layers.elements.game.container.removeClass("has-error");
				scope.layers.elements.game.container.addClass("has-error");
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