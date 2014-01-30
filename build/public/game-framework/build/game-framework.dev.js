;

/*** ../bower_components/game-framework/core.js ***/
(function() {
	var gfFactory = function() {
		this.games 			= {};
		this.displays 		= {};
		this.plugins 		= {};
	};
	// Register a new game type
	gfFactory.prototype.game = function(name, factory, about) {
		if (this.games[name]) {
			console.info("/!\ Game '"+name+"' is already defined. Duplicate:", about);
			this.formErrors.push("/!\ Game '"+name+"' is already defined.");
			return false;
		} else {
			this.games[name] = factory;
			return true;
		}
	};
	// Register a new display type
	gfFactory.prototype.display = function(name, factory, about) {
		if (this.displays[name]) {
			console.info("/!\ Display '"+name+"' is already defined. Duplicate:", about);
			this.formErrors.push("/!\ Display '"+name+"' is already defined.");
			return false;
		} else {
			this.displays[name] = factory;
			return true;
		}
	};
	// Register a new plugin
	gfFactory.prototype.plugin = function(name, data, about, overwrite) {
		if (this.plugins[name] && !overwrite) {
			console.info("/!\ Plugin '"+name+"' is already defined. Duplicate:", about);
			this.formErrors.push("/!\ Plugin '"+name+"' is already defined.");
			return false;
		} else {
			this.plugins[name] = data;
			return true;
		}
	};
	// Utility, to create new dom elements
	gfFactory.prototype.dom = function(nodeType, appendTo, raw) {
		var element = document.createElement(nodeType);
		if (appendTo != undefined) {
			$(appendTo).append($(element));
		}
		return (raw === true)?element:$(element);
	};
	
	
	var gameFramework = function($scope, container, plugins) {
		this.container 		= container;
		this.levels			= [];
		this.data			= {};
		this.errors			= [];
		this.formErrors 	= [];
		this.slideDuration	= 500;
		this.startPoints	= 1000;
		this.lossPerError	= this.startPoints/10;
		this.$scope			= $scope;
		
		this.screens		= new window.screenjs(this.container);
		
		this.timer 			= {
			global:		new window.stopwatch(),
			level:		new window.stopwatch()
		};
		
		if (plugins) {
			this.use		= plugins;
		} else {
			this.use		= [];
		}
		
		
		var scope = this;
		
		// Import the plugins
		_.each(this.use, function(pluginName) {
			if (window.gfFactory.plugins[pluginName]) {
				// Executre the plugin, pass as an argument the gameFramework instance
				window.gfFactory.plugins[pluginName](scope);
			} else {
				console.error("/!\ Plugin '"+pluginName+"' is missing.");
				this.formErrors.push("Plugin '"+pluginName+"' is missing.");
			}
		});
		
	};
	
	// Build the form
	gameFramework.prototype.build = function(options) {
		
		var scope = this;
		
		this.options 	= _.extend({
			levels:		{},
			submit:		$(),
			onInit:		function() {
				console.info("GF Init");
			},
			onLevelUp:	function(data) {
				console.info("GF Level Up");
			},
			onFinish:	function() {
				console.info("GF Finish");
			}
		}, options);
		
		if (!this.$scope) {
			console.log("AngularJS $scope not defined!");
			return false;
		}
		
		// Build the levels (game screens)
		var levelNumber = 0;
		_.each(this.options.levels, function(item) {
			if (!window.gfFactory.games[item.type]) {
				console.info("/!\ Game '"+item.type+"' doesn't exist on ", item);
				scope.formErrors.push("Game '"+item.type+"' doesn't exist.");
				return this;
			} else {
				
				scope.$scope.gf.levels[levelNumber] = item;
				scope.$scope.$apply();
				
				// Re-detect the screens
				scope.screens.refresh();
				
				// Create a new instance of the question type
				var instance 		= new window.gfFactory.games[item.type](scope, item);
				
				var screenid 		= "level"+levelNumber;
				
				// Create a new line (HTML form line)
				var layers		= scope.getLayers(scope.screens.get(screenid));
				
				// If there is no label, we switch the game container to height: 1000%
				if (item.label === false) {
					layers.elements.game.label.css({height:0,padding:0});
					layers.elements.game.container.css("height","100%");
				}
				
				// Create the object
				var obj 	= {
					level:			levelNumber,
					factory:		window.gfFactory.games[item.type],
					instance:		instance,
					data:			_.extend({time: 180},item),
					layers:			layers,
					errors:			[],
					lossPerError:	(scope.startPoints/item.errors) || scope.lossPerError,
					points:			scope.startPoints,
					screenid:		screenid,
					built:			false
				};
				
				// Setup the Angular click events
				scope.$scope.gf.levels[levelNumber].evt_instructions = {
					show:	function() {
						layers.show("instructions");
					},
					hide:	function() {
						layers.show("game", function() {
							if (!obj.built) {
								obj.instance.init();
								obj.built = true;
							}
						});
						
					}
				};
				scope.$scope.gf.levels[levelNumber].evt_hint = {
					show:	function() {
						layers.show("hint");
					},
					hide:	function() {
						layers.show("game", function() {
							if (!obj.built) {
								obj.instance.init();
								obj.built = true;
							}
						});
					}
				};
				
				// Manage the display
				if (item.display) {
					if (!window.gfFactory.displays[item.display.type]) {
						console.info("/!\ Display '"+item.display.type+"' doesn't exist on ", item);
						scope.formErrors.push("Display '"+item.display.type+"' doesn't exist.");
					} else {
						obj.display = new window.gfFactory.displays[item.display.type](scope, item);
						obj.display.build(layers.elements.game.display);
					}
				}
				
				// Set the callbacks
				// Save the errors, to find trends in user inputs
				instance.onError = function(error) {
					obj.errors.push(error);
					obj.points -= obj.lossPerError;
					obj.points	= Math.max(obj.points, 0);
					if (obj.points == 0) {
						//@TODO: display loss animation
						instance.end();
					}
				}
				instance.end = function(error) {
					console.log("level ended");
					
					// Save the end time
					obj.ended = new Date().getTime();
					
					// Stop the level's timeout timer
					scope.timer.level.reset();
					scope.timer.level.pause();
					
					// Update AngularJS
					console.log("error", obj.errors, obj.points);
					scope.$scope.gf.score.current 	= obj.points;
					scope.$scope.gf.score.total 	+= obj.points;
					scope.$scope.$apply();
					
					
					// Show the level screen
					scope.screens.show('level-score');
					
					// Set the countdown
					var countdown 	= new window.gf_countdown({
						update:	function(t) {
							scope.screens.get('level-score').find(".gf-timer").html(t);
						},
						end:	function() {
							// Stop the countdown
							countdown.stop();
							
							// Level Up callback
							scope.options.onLevelUp(scope, obj);
							
							// Launch the next level
							if (obj.level+1 < scope.levels.length) {
								scope.launch(obj.level+1);
							} else {
								console.log("Game completed");
								
								// Stop the global timer
								scope.timer.global.pause();
								
								// Finish callback
								scope.options.onFinish(scope, scope.timer.global.current());
								
								// Show the survey screen
								scope.screens.show("survey");
							}
						}
					});
					countdown.set(3);
					countdown.start();
					
				}
				
				// Save the level
				scope.levels.push(obj);
				
				// Level will be built when it's time to display it.
			}
			levelNumber++;
			return this;
		});
		
		// Update the AngularJS object
		scope.$scope.$apply();
		
		scope.options.onInit(this);
		
		
		return this;
	};
	
	
	// Start the game
	gameFramework.prototype.start = function(data) {
		this.timer.global.start();
		this.launch(0);
	};
	
	// Launch a level
	gameFramework.prototype.launch = function(levelNumber) {
		var scope 	= this;
		// If the level exists
		if (this.levels[levelNumber]) {
			this.currentLevel = levelNumber;
			
			// Reset the level timer by creating a new Stopwatch instance
			this.timer.level = new window.stopwatch();
			
			// Start the timer
			this.timer.level.start();
			
			// Add a timeout at 180sec by default, else set to level's allowed time.
			this.timer.level.addCue(this.levels[levelNumber].data.time, function() {
				// Timeout, no points!
				scope.levels[levelNumber].points = 0;
				// End the level
				scope.levels[levelNumber].instance.end();
			});
			
			// Save the time at which it was started
			this.levels[levelNumber].started	= new Date().getTime();
			
			// Display the instructions layer first
			this.levels[levelNumber].layers.show("instructions");
			
			// Build the level
			this.levels[levelNumber].instance.build(this.levels[levelNumber].layers);
			
			// Trigger the screen transition
			this.screens.show(this.levels[levelNumber].screenid,null,{
				onComplete:	function() {
					
				}
			});
			
			
			// Manage AngularJS
			this.$scope.gf.currentLevel 	= levelNumber+1;
			
			_.each(scope.levels, function(level) {
				if (level.level < levelNumber) {
					scope.$scope.gf.levels[level.level].passed 	= true;
					scope.$scope.gf.levels[level.level].current 	= false;
				}
				if (level.level == levelNumber) {
					scope.$scope.gf.levels[level.level].passed 	= false;
					scope.$scope.gf.levels[level.level].current 	= true;
				}
				if (level.level > levelNumber) {
					scope.$scope.gf.levels[level.level].passed 	= false;
					scope.$scope.gf.levels[level.level].current 	= false;
				}
			});
			
			
			// Update the timer display
			clearInterval(this.levelInterval);
			this.levelInterval = setInterval(function() {
				scope.$scope.gf.levelTimer 		= scope.timer.level.current();
				scope.$scope.gf.globalTimer 	= scope.timer.global.current();
				scope.$scope.$apply();
			}, 100);
			
			
			// Update the AngularJS object
			this.$scope.$apply();
			
		} else {
			this.currentLevel = false;
		}
	};
	
	// Create a level container (DOM)
	gameFramework.prototype.createLevelContainer = function(data) {
		var scope 	= this;
		var container 	= window.gfFactory.dom("div", this.container);
			container.addClass("screen");
			var layers 	= window.gfFactory.dom("div", container);
				layers.addClass("layers");
				
				
				// Instructions
				var instructionLayer	= window.gfFactory.dom("table", layers);
					instructionLayer.addClass("layer").addClass("layer-instructions");
					var tbody 			= window.gfFactory.dom("tbody", instructionLayer);
						var tr1 		= window.gfFactory.dom("tr", tbody);
							var header 	= window.gfFactory.dom("td", tr1);
								header.addClass("gf-header");
						var tr2 		= window.gfFactory.dom("tr", tbody);
							var instructionBg 		= window.gfFactory.dom("td", tr2);
								instructionBg.addClass("gf-bg");
						var tr3 		= window.gfFactory.dom("tr", tbody);
							var footer 	= window.gfFactory.dom("td", tr3);
								footer.addClass("gf-footer");
								// Build the instruction button
								var instructionButton = window.gfFactory.dom("div", footer);
									instructionButton.addClass("gf-btn");
									instructionButton.html("Got it");
									instructionButton.add(instructionBg).click(function() {
										scope.hideInstructions();
									});
				
				
				// Hint
				var hintLayer			= window.gfFactory.dom("table", layers);
					hintLayer.addClass("layer").addClass("layer-hint");
					var tbody 			= window.gfFactory.dom("tbody", hintLayer);
						var tr1 		= window.gfFactory.dom("tr", tbody);
							var hintBg 		= window.gfFactory.dom("td", tr1);
								hintBg.addClass("gf-bg");
						var tr2 		= window.gfFactory.dom("tr", tbody);
							var footer 	= window.gfFactory.dom("td", tr2);
								footer.addClass("gf-footer");
								// Build the instruction button
								var hintButton = window.gfFactory.dom("div", footer);
									hintButton.addClass("gf-btn");
									hintButton.html("Got it");
									hintButton.add(hintBg).click(function() {
										scope.hideHint();
									});
				
				
				// Game
				var gameLayer	= window.gfFactory.dom("table", layers);
					gameLayer.addClass("layer").addClass("layer-game");
					var tbody 		= window.gfFactory.dom("tbody", gameLayer);
						var tr1 		= window.gfFactory.dom("tr", tbody);
							var display 	= window.gfFactory.dom("td", tr1);
								display.addClass("gf-display");
								display.attr('colspan', 2);
						var tr2 		= window.gfFactory.dom("tr", tbody);
							var label 		= window.gfFactory.dom("td", tr2);
								label.addClass("gf-label");
								label.attr('colspan', 2);
						var tr3 		= window.gfFactory.dom("tr", tbody);
							var game 		= window.gfFactory.dom("td", tr3);
								game.addClass("gf-game");
								game.attr('colspan', 2);
						var tr4 		= window.gfFactory.dom("tr", tbody);
							var td1 		= window.gfFactory.dom("td", tr4);
								td1.addClass("gf-footer");
								td1.css("width", "50%");
								// Build the instruction button
								var btn1 = window.gfFactory.dom("div", td1);
									btn1.addClass("gf-btn").addClass("gf-secondary").css("border-right", 0);
									btn1.html("How to play");
									btn1.click(function() {
										scope.showInstructions();
									});
							var td2 		= window.gfFactory.dom("td", tr4);
								td2.addClass("gf-footer");
								td2.css("width", "50%");
								// Build the hint button
								var btn2 = window.gfFactory.dom("div", td2);
									btn2.addClass("gf-btn").addClass("gf-secondary");
									btn2.html("Hint");
									btn2.click(function() {
										scope.showHint();
									});
		
		// Return the individual games (DOM nodes)
		return {
			container:	container,
			layer:		{
				game:			gameLayer,
				instructions:	{
					container:	instructionLayer,
					bg:			instructionBg,
					header:		header
				},
				hint:			{
					container:	hintLayer,
					bg:			hintBg
				}
			},
			label:		label,
			display:	display,
			game:		game
		};
	};
	
	// 
	gameFramework.prototype.getLayers = function(element) {
		var output 		= {};
		output.elements	= {};
		var group		= $();
		element.find("[data-layerid]").each(function(idx, el) {
			
			// Add to the layer list
			output[$(el).attr('data-layerid')] = $(el);
			
			// Add to the jQuery group
			group = group.add($(el));
			
			// Create the element list
			output.elements[$(el).attr('data-layerid')] = {};
			
			// List the elements
			$(el).find("[data-element]").each(function(idx2, el2) {
				output.elements[$(el).attr('data-layerid')][$(el2).attr('data-element')] = $(el2);
			});
		});
		output.show = function(layerid, cb) {
			group.fadeOut();
			output[layerid].fadeIn(function() {
				if (cb) {
					cb();
				}
			});
		}
		return output;
	};
	
	
	
	// Display the penalty screen
	gameFramework.prototype.showPenalty = function(sec, cb) {
		if (!sec) {
			var sec = 3;
		}
		var scope 	= this;
		this.screens.show("penalty");
		//this.penaltyScreen.show();
		var countdown 	= new window.gf_countdown({
			update:	function(t) {
				scope.screens.get("penalty").find(".gf-timer").html(t);
			},
			end:	function() {
				countdown.stop();
				cb();
				scope.screens.back();
				/*scope.penaltyScreen.fadeOut(function() {
					cb();
				});*/
			}
		});
		countdown.set(sec);
		countdown.start();
	};
	
	// Create the buttons for a level
	gameFramework.prototype.createButtons = function(buttons) {
		var scope 	= this;
		var output 	= {};
		_.each(buttons, function(button) {
			var btn = window.gfFactory.dom("div", scope.options.buttons);
				btn.addClass("btn").addClass("btn-primary");
				btn.html(button.label);
				btn.click(button.onClick);
				btn.hide();	// Hide the buttons by default
			output[button.name] = btn;
		});
		return output;
	};
	
	
	// Stringify the form data in JSON.
	// Useful to save the levels in a database for example
	gameFramework.prototype.stringify = function(format) {
		var output = [];
		_.each(this.options.levels, function(field) {
			var fieldcopy = _.extend({}, field); // We make a deep-copy of the object
			output.push(fieldcopy);
		});
		// Format the output?
		if (format) {
			return JSON.stringify(output, null, 4);
		} else {
			return JSON.stringify(output);
		}
	};
	
	// Global scope
	window.gfFactory			= new gfFactory();
	window.gameFramework 		= gameFramework;
})();;

/*** ../bower_components/game-framework/games/trivia/trivia.js ***/
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
})();;

/*** ../bower_components/game-framework/games/scramble/scramble.js ***/
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
})();;

/*** ../bower_components/game-framework/games/memory/memory.js ***/
(function() {
	var game = function(gf, data) {
		var scope = this;
		this.gf 	= gf;
		this.data 	= data;
		
		this.data.data = _.extend({
			width:		4,
			height:		4
		},this.data.data);
		
	}
	// Build the component
	game.prototype.build = function(layers) {
		var scope = this;
		
		layers.instructions.addClass("game-memory");
		
		// Build the instructions
		layers.elements.instructions.container.addClass("instruction-tap");
		
		// Create the container
		var container	= gameElements.container(layers.elements.game.container,{
			square:		true
		});
		container.parent().css("padding", "10px");
		
		// Create the grid
		this.grid = gameElements.grid(container, {
			width:		this.data.data.width,
			height:		this.data.data.height,
			square:		true
		});
		
		// Game settings
		this.images 		= new Array();
		this.found			= new Array();
		this.turnedStack	= new Array();	// List the cards turned
		this.locked			= false;
		
		// List all images in an array (to pick random ones later in the code)
		var i;
		for (i=0;i<(this.data.data.width*this.data.data.height/2);i++) {
			this.images.push("pic"+(i+1)+".png");
			this.images.push("pic"+(i+1)+".png");
		}
		
		// Create the images
		var x;
		var y;
		for (y=0;y<this.data.data.height;y++) {
			for (x=0;x<this.data.data.width;x++) {
				this.initImage(x, y);
			}
		}
	}
	game.prototype.initImage = function(x, y) {
		var scope = this;
		
		// Get a random image
		var src 	= this.getRandomImage();
		
		// Create the 2 images
		// Create the div, since TDs can't be position: relative
		var div 	= window.gfFactory.dom("div", this.grid.get(x, y));
			div.css({
				width:	"100%",
				height:	"100%"
			});
		// Cover
		var cover 	= window.gfFactory.dom("img", div);
			cover.attr('src', this.data.data.images+"pic0.png");
			cover.attr('data-screenid', 'cover');
		// Cover
		var image 	= window.gfFactory.dom("img", div);
			image.attr('src', this.data.data.images+src);
			image.attr('data-screenid', 'image');
		
		// Set as screen using screenjs
		div.addClass("screen")
		this.grid.get(x, y).css({
			padding:	"1px"
		});
		var screens	= new window.screenjs(div);
		screens.show('cover');
		
		var data	= {
			screenjs:	screens,
			x:			x,
			y:			y,
			src:		src,
			turned:		false,
			found:		false
		}
		
		this.grid.get(x, y).data('memory-data', data);
		
		// Set the events
		cover.click(function() {
			// if the game is locked or if there are already 2 cards turned, no click allowed
			if (scope.locked || scope.turnedStack.length >= 2 || data.turned) {
				return false;
			}
			// Add the card to the turned stack
			scope.turnedStack.push(data);
			
			// If this is the 2nd card, lock the game (We unlock once the card couple is verified
			if (scope.turnedStack.length == 2) {
				scope.locked = true;
			}
			
			// Show the card
			screens.show('image','top', {
				onComplete:	function() {
					data.turned = true;
					
					if (scope.turnedStack.length == 2 && scope.turnedStack[1].x == data.x && scope.turnedStack[1].y == data.y) {
						if (scope.turnedStack[0].src == scope.turnedStack[1].src) {
							// We found a pair!
							
							// Unlock the game
							scope.locked = false;
							
							// Set both cards as turned
							scope.turnedStack[0].found = true;
							scope.turnedStack[1].found = true;
							
							// Save the pair
							scope.found.push(scope.turnedStack[1].src);
							
							// Empty the stack
							scope.turnedStack = [];
							
							// Are we done, did we find every pairs?
							if (scope.found.length == (scope.data.data.width*scope.data.data.height/2)) {
								scope.end();
							}
						} else {
							// Turned both cards
							scope.turnedStack[0].screenjs.show('cover',null,{
								onComplete:	function() {
									
								}
							});
							scope.turnedStack[1].screenjs.show('cover',null,{
								onComplete:	function() {
									// Unlock the game
									scope.locked = false;
								}
							});
							scope.turnedStack[0].turned = false;
							scope.turnedStack[1].turned = false;
							
							// Empty the stack
							scope.turnedStack 	= [];
							
							// Save the error
							scope.onError(false);
							
						}
					}
					
				}
			});
		});
	}
	game.prototype.getRandomImage = function() {
		var scope = this;
		
		var len 	= this.images.length;
		var rnd		= Math.floor((Math.random()*len+Math.random()*len)/2);
		var pic		= this.images[rnd].toString();
		this.images.splice(rnd,1);
		return pic;
	}
	game.prototype.init = function() {
		// Display the animation
		var scope = this;
		var finished = 0;
		this.locked	= true;
		var x;
		var y;
		for (y=0;y<this.data.data.height;y++) {
			for (x=0;x<this.data.data.width;x++) {
				(function(x,y) {
					setTimeout(function() {
						scope.grid.get(x, y).data('memory-data').screenjs.show('image');
						setTimeout(function() {
							scope.grid.get(x, y).data('memory-data').screenjs.show('cover',null,{
								onComplete:	function() {
									finished++;
									if (finished == (scope.data.data.width*scope.data.data.height/2)) {
										// Unlock the game
										scope.locked = false;
									}
								}
							});
							
						}, 3000);
					}, Math.random()*1500);
				})(x,y);
			}
		}
	}
	game.prototype.hide = function() {
		
	}
	// Register the component
	window.gfFactory.game("memory", game, {
		description:	"Memory",
		version:		1.0,
		author:			"Julien Loutre <julien@twenty-six-medias.com>"
	});
})();;

/*** ../bower_components/game-framework/games/wordsearch/init.js ***/
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
})();;

/*** ../bower_components/game-framework/games/hangman/hangman.js ***/
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
		this.keyboard = gameElements.keyboard(layers.elements.game.container, {
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
})();;

/*** ../bower_components/game-framework/games/brokenword/brokenword.js ***/
(function() {
	var game = function(gf, data) {
		var scope = this;
		this.gf 	= gf;
		this.data 	= data;
		this.data.data = _.extend({
			words: ["hello|world","I love|javascript"]
		},this.data.data);
		
		this.found = 0;
	}
	// Build the component
	game.prototype.build = function(layers) {
		var scope = this;
		
		layers.instructions.addClass("game-brokenword");
		layers.game.addClass("game-brokenword");
		
		this.words = [];
		_.each(this.data.data.words, function(word) {
			scope.words.push(word.split('|'));
		});
		
		// Build the instructions
		layers.elements.instructions.container.addClass("instruction-tap");
		
		// Create the container
		this.container	= gameElements.container(layers.elements.game.container);
		this.container.parent().css("padding", "10px");
		
		this.drop_containers = $();
		
		this.wordlist = gameElements.wordlist(this.container);
		
		// Create the wordparts
		_.each(this.words, function(word) {
			
			var wordpart = gameElements.wordpart(scope.container, {
				empty:	"drop here"
			}).set(0, word[0]);
			
			scope.drop_containers = scope.drop_containers.add(wordpart.get(1));
			
			wordpart.get(1).data("word", word[1]);
			wordpart.get(1).data("wordpart", wordpart);
			
		});
		
		// Create the word list
		_.each(this.words, function(word) {
			
			var wordContainer = scope.wordlist.addWord(word[1]);
			wordContainer.element.css('cursor','move');
			
			var dropped = false;
			var drag = new gameElements.drag({
				element:	wordContainer.element,
				target:		scope.drop_containers,
				parent:		scope.container,
				onStart:	function() {
					console.log("Starting the drag...");
				},
				onDrag:		function() {
					console.log("Dragging...");
				},
				onEnd:		function() {
					console.log("...And we're done.");
				},
				onDrop:		function(target) {
					if (target.data("word") == word[1]) {
						target.data("wordpart").set(1, word[1]);
						wordContainer.empty();
						drag.remove();
						scope.found++;
						if (scope.found == scope.data.data.words.length) {
							scope.end();
						}
					} else {
						scope.gf.showPenalty(3, function() {
							// Register the error after the penalty
							scope.onError([word[0],target.data("word")]);
						});
					}
				}
			})
		});
		
		this.wordlist.shuffle();
		
		var clearDiv = window.gfFactory.dom("div", this.container);
			clearDiv.addClass("clearfix");
		
	}
	game.prototype.init = function() {
		var scope = this;
		
	}
	game.prototype.hide = function() {
		
	}
	// Register the component
	window.gfFactory.game("brokenword", game, {
		description:	"Brokenword",
		version:		1.0,
		author:			"Julien Loutre <julien@twenty-six-medias.com>"
	});
})();;

/*** ../bower_components/game-framework/games/imagelabel/imagelabel.js ***/
(function() {
	var game = function(gf, data) {
		var scope = this;
		this.gf 	= gf;
		this.data 	= data;
		this.data.data = _.extend({
			images: []
		},this.data.data);
		
		this.found = 0;
	}
	// Build the component
	game.prototype.build = function(layers) {
		var scope = this;
		
		layers.instructions.addClass("game-imagelabel");
		layers.game.addClass("game-imagelabel");
		
		// Build the instructions
		layers.elements.instructions.container.addClass("instruction-tap");
		
		// Create the container
		this.container	= gameElements.container(layers.elements.game.container);
		//this.container.parent().css("padding", "10px");
		
		this.drop_containers = $();
		
		
		// Create the word list
		this.wordlist = gameElements.wordlist(this.container);
		
		// Create the 2 2x1 grid
		this.grid = gameElements.grid(this.container, {
			width:	2,
			height:	2
		});
		var coords = {
			0:	[0,0],
			1:	[1,0],
			2:	[0,1],
			3:	[1,1]
		};
		
		var count = 0;
		_.each(this.data.data.images, function(item) {
			
			// Add the label in the wordlist
			var wordContainer = scope.wordlist.addWord(item.label);
			wordContainer.element.css('cursor','move').css('z-index','1000');
			
			// Create the image
			var cell 	= scope.grid.get(coords[count][0], coords[count][1]);
				cell.css('padding','2px');
			var img 	= gameElements.imageContainer(cell, {
				src:		item.image,
				autosize:	true
			});
			img.container.data('img', item.image)
			
			scope.drop_containers = scope.drop_containers.add(img.container);
			
			var dropped = false;
			var drag = new gameElements.drag({
				element:	wordContainer.element,
				target:		scope.drop_containers,
				parent:		scope.container,
				onStart:	function() {
					console.log("Starting the drag...");
				},
				onDrag:		function() {
					console.log("Dragging...");
				},
				onEnd:		function() {
					console.log("...And we're done.");
				},
				onDrop:		function(target) {
					console.log("Dropped!",target);
					if (target.is(img.container)) {
						wordContainer.empty();
						drag.remove();
						scope.found++;
						img.label(item.label);
						if (scope.found == scope.data.data.images.length) {
							scope.end();
						}
					} else {
						scope.gf.showPenalty(3, function() {
							// Register the error after the penalty
							scope.onError([item.label, target.data('img')]);
						});
					}
				}
			});
			
			count++;
		});
		
		this.wordlist.shuffle();
		
		var clearDiv = window.gfFactory.dom("div", this.container);
			clearDiv.addClass("clearfix");
		
	}
	game.prototype.init = function() {
		var scope = this;
		
	}
	game.prototype.hide = function() {
		
	}
	// Register the component
	window.gfFactory.game("imagelabel", game, {
		description:	"Imagelabel",
		version:		1.0,
		author:			"Julien Loutre <julien@twenty-six-medias.com>"
	});
})();;

/*** ../bower_components/game-framework/plugins/fleetwit.js ***/
(function() {
	window.gfFactory.plugin("fleetwit",function(gf) {
		
		
	}, {
		description:	"Fleetwit: idk yet",
		version:		1.0,
		author:			"Julien Loutre <julien@fleetwit.com>"
	});
})();;

/*** ../bower_components/game-framework/displays/image.js ***/
(function() {
	var display = function(gf, data) {
		this.gf 	= gf;
		this.data 	= data;
	}
	// Build the display
	display.prototype.build = function(container) {
		this.container	= container;
		this.img 		= window.formjsFactory.dom("img", container);
		this.img.css("width", "100%");
		this.img.attr('src', this.data.display.image);
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