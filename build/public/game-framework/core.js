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
	
	
	var gameFramework = function(container, plugins) {
		this.levels		= [];
		this.data		= {};
		this.errors		= [];
		this.formErrors = [];
		this.slideDuration	= 500;
		
		if (plugins) {
			this.use		= plugins;
		} else {
			this.use		= [];
		}
		
		this.container 	= container;
		
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
			form:		{},
			submit:		$(),
			onSubmit:	function() {},
			onError:	function() {},
			onInit:		function() {}
		}, options);
		
		// Build the penalty layer
		this.buildPenalty();
		
		// Build the penalty layer
		this.buildPenalty();
		
		// Build the levels (game screens)
		var levelNumber = 0;
		_.each(this.options.levels, function(item) {
			if (!window.gfFactory.games[item.type]) {
				console.info("/!\ Game '"+item.type+"' doesn't exist on ", item);
				scope.formErrors.push("Game '"+item.type+"' doesn't exist.");
				return this;
			} else {
				
				// Create a new instance of the question type
				var instance 		= new window.gfFactory.games[item.type](scope, item);
				
				// Create a new line (HTML form line)
				var containers 		= scope.createLevelContainer(item);
				
				// Set the game name
				containers.layer.instructions.header.html("Level "+(levelNumber+1)+": "+item.title);
				
				// Set the game hint
				if (!item.hint) {
					item.hint = "You're on your own for this one!";
				}
				containers.layer.hint.bg.html(item.hint);
				
				// Create the object
				var obj 	= {
					level:		levelNumber,
					factory:	window.gfFactory.games[item.type],
					instance:	instance,
					data:		item,
					containers:	containers,
					errors:		[]
				};
				
				
				// Manage the display
				if (item.display) {
					if (!window.gfFactory.displays[item.display.type]) {
						console.info("/!\ Display '"+item.display.type+"' doesn't exist on ", item);
						scope.formErrors.push("Display '"+item.display.type+"' doesn't exist.");
					} else {
						obj.display = new window.gfFactory.displays[item.display.type](scope, item);
						obj.display.build(containers);
					}
				}
				
				// Create the buttons
				if (item.buttons) {
					obj.buttons = scope.createButtons(item.buttons);
				}
				
				// Set the callbacks
				// Save the errors, to find trends in user inputs
				instance.saveError = function(error) {
					obj.errors.push(error);
				}
				instance.end = function(error) {
					console.log("level ended");
					
					// Hide the level
					// Save it as the current screen
					scope.currentScreen = {
						container:	containers.container,
						onEnd:		function() {
							// Call the hide method on the game
							instance.hide();
							
							// Hide the buttons
							if (obj.buttons) {
								var btn;
								for (btn in obj.buttons) {
									obj.buttons[btn].hide();
								}
							}
						}
					};
					
					
					// Launch the next level
					if (obj.level+1 < scope.levels.length) {
						scope.launch(obj.level+1);
					} else {
						console.log("Game completed");
					}
				}
				
				// Set the label
				containers.label.html(item.label);
				
				// Hide the container
				containers.container.hide();
				
				// Hide the game within the container
				containers.layer.game.hide();
				
				// Save the level
				scope.levels.push(obj);
				
				// Level will be built when it's time to display it.
			}
			levelNumber++;
			return this;
		});
		
		
		
		scope.options.onInit(this);
		
		return this;
	};
	
	// Start the game
	gameFramework.prototype.start = function(data) {
		this.launch(0);
	};
	
	// Launch a level
	gameFramework.prototype.launch = function(levelNumber) {
		var scope 	= this;
		// If the level exists
		if (this.levels[levelNumber]) {
			this.currentLevel = levelNumber;
			// Show the buttons
			if (this.levels[levelNumber].buttons) {
				var btn;
				for (btn in this.levels[levelNumber].buttons) {
					this.levels[levelNumber].buttons[btn].show();
				}
			}
			
			// Display the level container
			this.levels[levelNumber].containers.container.show();
			
			// Display the instructions
			this.levels[levelNumber].containers.layer.instructions.container.show();
			
			// Hide the hint
			this.levels[levelNumber].containers.layer.hint.container.hide();
			
			// Build the level
			this.levels[levelNumber].instance.build(this.levels[levelNumber].containers);
			
			// Trigger the screen transition
			if (this.currentScreen) {
				this.slideScreen(this.currentScreen.container, this.levels[levelNumber].containers.container, function() {
					scope.currentScreen.onEnd();
				});
			}
			
		} else {
			this.currentLevel = false;
		}
	};
	
	// Slide transition between 2 screens (from A to B)
	gameFramework.prototype.slideScreen = function(screenA, screenB, callback) {
		console.log("slideScreen",screenA, screenB, screenA.width());
		screenB.css({
			top:		0,
			left:		screenA.width()
		});
		screenA.animate({
			top:		0,
			left:		0-screenA.width()
		}, this.slideDuration, function() {
			screenA.hide();
		});
		screenB.animate({
			top:		0,
			left:		0
		}, this.slideDuration, function() {
			callback();
		});
		
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
	
	
	
	// Build the penalty layer
	gameFramework.prototype.buildPenalty = function() {
		var scope 		= this;
		var container 	= window.gfFactory.dom("table", this.container);
			container.addClass("screen").addClass("gf-penalty");
			var tbody 	= window.gfFactory.dom("tbody", container);
			var tr 		= window.gfFactory.dom("tr", tbody);
			var td 		= window.gfFactory.dom("td", tr);
			var label 	= window.gfFactory.dom("div", td);
				label.addClass("gf-label");
				label.html("Wrong!");
			var timer 	= window.gfFactory.dom("div", td);
				timer.addClass("gf-timer");
				timer.html("3");
		container.hide();
		this.penaltyScreen = container;
	};
	
	// Display the penalty screen
	gameFramework.prototype.showPenalty = function(sec) {
		if (!sec) {
			var sec = 3;
		}
		var scope 	= this;
		this.penaltyScreen.show();
		var countdown 	= new window.gf_countdown({
			update:	function(t) {
				scope.penaltyScreen.find(".gf-timer").html(t);
			},
			end:	function() {
				countdown.stop();
				scope.penaltyScreen.fadeOut();
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
	
	
	
	
	
	
	
	
	
	// Show the instructions
	gameFramework.prototype.showInstructions = function() {
		if (this.currentLevel !== false) {
			// Hide the instructions
			this.levels[this.currentLevel].containers.layer.instructions.container.fadeIn();
			this.levels[this.currentLevel].containers.layer.game.fadeIn();
		}
	};
	// Hide the instructions
	gameFramework.prototype.hideInstructions = function() {
		if (this.currentLevel !== false) {
			// Hide the instructions
			this.levels[this.currentLevel].containers.layer.instructions.container.fadeOut();
			this.levels[this.currentLevel].containers.layer.game.fadeIn();
			
			if (!this.levels[this.currentLevel].init) {
				// If there is a display, init the display
				if (this.levels[this.currentLevel].display) {
					this.levels[this.currentLevel].display.init();
				}
				
				// Init the game
				this.levels[this.currentLevel].instance.init();
				
				this.levels[this.currentLevel].init = true;
			}
			
		}
	};
	
	// Show the hint
	gameFramework.prototype.showHint = function() {
		if (this.currentLevel !== false) {
			// Hide the instructions
			this.levels[this.currentLevel].containers.layer.hint.container.fadeIn();
		}
	};
	// Hide the hint
	gameFramework.prototype.hideHint = function() {
		if (this.currentLevel !== false) {
			// Hide the instructions
			this.levels[this.currentLevel].containers.layer.hint.container.fadeOut();
		}
	};
	
	
	
	
	// Stringify the form data in JSON.
	// Useful to save the levels in a database for example
	gameFramework.prototype.stringify = function(format) {
		var output = [];
		_.each(this.options.form, function(field) {
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
})();