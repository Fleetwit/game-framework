(function() {
	var game = function(gf, data) {
		var scope = this;
		this.gf 	= gf;
		this.data 	= data;
		
	}
	// Build the component
	game.prototype.build = function(line) {
		var scope = this;
		
		console.info("Building level.");
		
		line.container.addClass("game-scramble");
		
		// Build the instructions
		line.layer.instructions.bg.addClass("instruction-tap");
		
		// Generate the random word
		var display	= _.shuffle(this.data.data.word.split(''));
		console.log("display",display);
	}
	game.prototype.init = function() {
		console.info("Game initialized.");
	}
	game.prototype.hide = function() {
		
	}
	// Register the component
	window.gfFactory.game("scramble", game, {
		description:	"Scramble",
		version:		1.0,
		author:			"Julien Loutre <julien@twenty-six-medias.com>"
	});
})();