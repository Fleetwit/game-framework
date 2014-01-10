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
		if (plugins) {
			this.use		= plugins;
		} else {
			this.use		= [];
		}
		
		this.container 	= container;
		
		var scope = this;
		
		// Import the plugins
		_.each(this.use, function(pluginName) {
			console.log("Loading ",pluginName);
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
				var containers = scope.createLevelContainer(item);
				
				
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
					containers.container.slideUp();
					
					// Call the hide method on the game
					instance.hide();
					
					// Hide the buttons
					if (obj.buttons) {
						var btn;
						for (btn in obj.buttons) {
							obj.buttons[btn].hide();
						}
					}
					
					// Launch the next level
					if (obj.level+1 < scope.levels.length) {
						scope.launch(obj.level+1);
					} else {
						console.log("Game completed");
					}
				}
				
				// Build the game in the level container
				instance.build(containers);
				
				// Set the label
				containers.label.html(item.label);
				
				// Hide the container
				containers.container.hide();
				
				// Save the level
				scope.levels.push(obj);
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
		if (this.levels[levelNumber]) {
			// Show the buttons
			if (this.levels[levelNumber].buttons) {
				var btn;
				for (btn in this.levels[levelNumber].buttons) {
					this.levels[levelNumber].buttons[btn].show();
				}
			}
			this.levels[levelNumber].containers.container.slideDown();
			this.levels[levelNumber].instance.init();
			if (this.levels[levelNumber].display) {
				this.levels[levelNumber].display.init();
			}
		}
	};
	
	// Create a form line (DOM), based on the theme (this.theme)
	gameFramework.prototype.createLevelContainer = function(data) {
		var container 	= window.gfFactory.dom("div", this.container);
		var label 		= window.gfFactory.dom("div", container);
			label.addClass("gf-label");
		var display 	= window.gfFactory.dom("div", container);
		var game 		= window.gfFactory.dom("div", container);
		
		// Return the individual games (DOM nodes)
		return {
			container:	container,
			label:		label,
			display:	display,
			game:		game
		};
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