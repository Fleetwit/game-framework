(function() {
	var game = function(gf, data) {
		var scope = this;
		this.gf 	= gf;
		this.data 	= data;
		
	}
	// Build the component
	game.prototype.build = function(layers) {
		var scope = this;
		
		console.log("layers",layers);
		
		layers.instructions.addClass("game-wordsearch");
		layers.game.addClass("game-wordsearch");
		
		// Build the instructions
		layers.elements.instructions.container.addClass("instruction-tap");
		
		// Create the container
		this.container	= gameElements.container(layers.elements.game.container,{
			square:	true
		});
		this.container.addClass("ge-grid");
		this.container.parent().css("padding", "10px");
		
		this.listContainer	= window.gfFactory.dom("div", layers.elements.game.container);
		this.listContainer.css("margin-top", "5px");
	}
	game.prototype.init = function() {
		var scope = this;
		console.log("Words: ",this.data.data.words);
		this.container.game_words({
			"words": 		this.data.data.words,
			listContainer:	this.listContainer,
			onEnd:			function() {
				console.log("FOUND!");
				scope.end();
			},
			onError:	function(e) {
				console.log("error",e);
				scope.onError(e);
			}
		});
	}
	game.prototype.hide = function() {
		
	}
	// Register the component
	window.gfFactory.game("wordsearch", game, {
		description:	"Wordsearch",
		version:		1.0,
		author:			"Julien Loutre <julien@twenty-six-medias.com>"
	});
})();