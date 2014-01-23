(function() {
	var game = function(gf, data) {
		var scope = this;
		this.gf 	= gf;
		this.data 	= data;
		
	}
	// Build the component
	game.prototype.build = function(layers) {
		var scope = this;
		
		layers.instructions.addClass("game-scramble");
		
		// Build the instructions
		layers.elements.instructions.container.addClass("instruction-tap");
		
		// Create the container
		var container	= gameElements.container(layers.elements.game.container);
		container.css("margin", "10px");
		
		// Generate the random word
		this.word		= this.data.data.word.split('');
		this.display	= _.shuffle(this.word);
		
		// Create the letter containers
		this.letters_display = gameElements.letterGroup(container, {
			number:			this.display.length,
			onClick:		function(index, letter, element) {
				scope.letters_display.empty(index);
				scope.letters_random.push(letter);
				scope.check();
			}
		});
		
		// Create the random letters
		this.letters_random = gameElements.letterGroup(container, {
			letters:		this.display,
			onClick:		function(index, letter, element) {
				scope.letters_random.empty(index);
				scope.letters_display.push(letter);
				scope.check();
			}
		});
	}
	game.prototype.check = function() {
		var i;
		var right = 0;
		var wrong = 0;
		for (i=0;i<this.word.length;i++) {
			var played = this.letters_display.get(i);
			if (played != "") {
				if (played == this.word[i]) {
					this.letters_display.reset(i);
					right++;
				} else {
					this.letters_display.wrong(i);
					wrong++;
					if (wrong == 1) {
						console.log("onError",this.letters_display.get());
						this.onError(this.letters_display.get());
					}
				}
			}
		}
		if (this.letters_display.get() == this.word.join('')) {
			this.end();
		}
	}
	game.prototype.init = function() {
		
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