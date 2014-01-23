(function() {
	var game = function(gf, data) {
		var scope = this;
		this.gf 	= gf;
		this.data 	= data;
		
	}
	// Build the component
	game.prototype.build = function(layers) {
		var scope = this;
		
		layers.instructions.addClass("game-hangman");
		
		// Build the instructions
		layers.elements.instructions.container.addClass("instruction-tap");
		
		// Create the container
		var container	= gameElements.container(layers.elements.game.container);
		container.css("margin", "10px");
		
		// Generate the random word
		this.word		= this.data.data.word.split('');
		
		this.counter = 0;
		
		// Create the letter containers
		this.letters_display = gameElements.letterGroup(container, {
			number:			this.word.length,
			onClick:		function(index, letter, element) {
				
			}
		});
		
		// Create the keyboard
		this.keyboard = gameElements.keyboard(container, {
			layout:	"qwerty",
			onClick:	function(letter, key) {
				if (scope.counter < 8) {
					if (_.contains(scope.word, letter)) {
						var i;
						for (i=0;i<scope.word.length;i++) {
							if (scope.word[i].toLowerCase() == letter.toLowerCase()) {
								scope.letters_display.set(i, letter.toUpperCase());
								scope.counter++;
							}
						}
						scope.keyboard.inset(letter);
						scope.check();
					} else {
						scope.keyboard.wrong(letter);
						scope.onError(letter);
					}
					
				}
				if (scope.counter == 8) {
					scope.keyboard.disable();
				}
			}
		});
		this.keyboard.element.css("margin-top","10px");
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
	window.gfFactory.game("hangman", game, {
		description:	"Hangman",
		version:		1.0,
		author:			"Julien Loutre <julien@twenty-six-medias.com>"
	});
})();