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
})();