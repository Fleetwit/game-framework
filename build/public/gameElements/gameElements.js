(function() {
	
	
	// Utility, to create new dom elements
	var dom = function(nodeType, appendTo, raw) {
		var element = document.createElement(nodeType);
		if (appendTo != undefined) {
			$(appendTo).append($(element));
		}
		return (raw === true)?element:$(element);
	};
	
	
	var gameElements = {
		letterGroup:	function(container, options) {
			options = _.extend({
				gravity:	false,
				squeeze:	false,
				onClick:	function() {
					
				}
			},options);
			
			var output = {
				letters:	[]
			};
			
			output.build = function() {
				var i;
				var ul = dom("ul", container);
					ul.addClass("gameElements letterGroup");
					
				
				ul.addClass("regular");
				if (options.number) {
					for (i=0;i<options.number;i++) {
						(function(i) {
							var li = dom("li", ul);
								li.addClass("inset");
								li.click(function() {
									if (!$(this).hasClass("inset")) {
										options.onClick(i, $(this).text().toLowerCase(), li);
										if (options.gravity) {
											output.gravityStep();
										}
									}
								});
							output.letters.push(li);
						})(i);
					}
				} else if (options.letters) {
					if (typeof options.letters == "string") {
						options.letters = options.letters.split('');
					}
					for (i=0;i<options.letters.length;i++) {
						(function(i) {
							var li = dom("li", ul);
								li.html(options.letters[i].toUpperCase());
								li.click(function() {
									if (!$(this).hasClass("inset")) {
										options.onClick(i, $(this).text().toLowerCase(), li);
										if (options.gravity) {
											output.gravityStep();
										}
									}
								});
							output.letters.push(li);
						})(i);
					}
				}
			}
			output.gravityStep = function() {
				for (i=1;i<output.letters.length;i++) {
					// If the current letter is filled and previous one is empty...
					if (!output.letters[i].hasClass("inset") && output.letters[i-1].hasClass("inset")) {
						output.set(i-1, output.letters[i].text());
						output.empty(i);
					}
				}
			}
			output.set = function(pos, letter) {
				output.letters[pos].removeClass("inset").html(letter.toUpperCase());
				return output;
			}
			output.get = function(pos) {
				if (!pos && pos !== 0) {
					var i;
					var word = "";
					for (i=0;i<output.letters.length;i++) {
						var content = output.letters[i].text().toLowerCase();
						if (content != "") {
							word += content;
						}
					}
					return word;
				} else {
					return output.letters[pos].text().toLowerCase();
				}
			}
			output.push = function(letter) {
				for (i=0;i<output.letters.length;i++) {
					if (output.letters[i].hasClass("inset")) {
						output.set(i, letter);
						return output;
					}
				}
				return output;
			}
			output.empty = function(pos) {
				output.letters[pos].removeClass("wrong").addClass("inset").empty();
				return output;
			}
			output.wrong = function(pos) {
				output.letters[pos].removeClass("inset").addClass("wrong");
				return output;
			}
			output.reset = function(pos) {
				output.letters[pos].removeClass("inset").removeClass("wrong");
				return output;
			}
			output.build();
			
			return output;
		},
		keyboard:	function(container, options) {
			options = _.extend({
				layout:		"qwerty",
				onClick:	function() {
					
				}
			},options);
			
			var output = {};
			
			var layout	= {
				qwerty:	[
					'qwertyuiop',
					'asdfghjkl',
					'zxcvbnm'
				]
			};
			
			var index	=  {};
			
			output.build = function() {
				var i,j;
				var keyboard = dom("div", container);
					keyboard.addClass("gameElements keyboard");
				output.element = keyboard;
				if (_.isArray(options.layout)) {
					var keys = options.layout;
				} else {
					var keys = layout[options.layout];
				}
				
				for (i=0;i<keys.length;i++) {
					if (typeof keys[i] == "string") {
						keys[i] = keys[i].split('');
					}
					var line	= dom("ul", keyboard);
					for (j=0;j<keys[i].length;j++) {
						(function(i,j,line) {
							var key = dom("li", line);
								key.html(keys[i][j].toUpperCase());
								key.click(function() {
									if (!$(this).hasClass("disabled") && !$(this).hasClass("inset")) {
										options.onClick(keys[i][j].toLowerCase(), key);
									}
								});
								// Same size for all keys on a line
								key.css("width", (100/keys[i].length)+"%");
							if (index[keys[i][j]]) {
								index[keys[i][j]] = index[keys[i][j]].add(key);
							} else {
								index[keys[i][j]] = key;
							}
							
						})(i,j,line);
					}
				}
			}
			output.disable = function(letters) {
				if (!letters || letters === true) {
					var group = $();
					for (i in index) {
						group = group.add(index[i]);
					}
					if (letters === true) {
						group.removeClass("inset").addClass("disabled");
					} else {
						group.each(function(idx, element) {
							element = $(element);
							if (!element.hasClass("inset")) {
								element.addClass("disabled");
							}
						});
					}
				} else {
					letters = letters.split('');
					_.each(letters, function(letter) {
						index[letter].removeClass("inset").removeClass("wrong").removeClass("disabled");
						index[letter].addClass("disabled");
					});
				}
			}
			output.enable = function(letters) {
				if (!letters || letters === true) {
					var group = $();
					for (i in index) {
						group = group.add(index[i]);
					}
					if (letters === true) {
						group.removeClass("inset").removeClass("disabled");
					} else {
						group.each(function(idx, element) {
							element = $(element);
							if (!element.hasClass("inset")) {
								element.removeClass("disabled");
							}
						});
					}
				} else {
					letters = letters.split('');
					_.each(letters, function(letter) {
						index[letter].removeClass("inset").removeClass("wrong").removeClass("disabled");
					});
				}
			}
			output.inset = function(letters) {
				letters = letters.split('');
				_.each(letters, function(letter) {
					index[letter].removeClass("inset").removeClass("wrong").removeClass("disabled");
					index[letter].addClass("inset");
				});
			}
			output.wrong = function(letters) {
				letters = letters.split('');
				_.each(letters, function(letter) {
					index[letter].removeClass("inset").removeClass("wrong").removeClass("disabled");
					index[letter].addClass("wrong");
				});
			}
			output.build();
			
			return output;
		},
		container:	function(container, options) {
			options = _.extend({
				square:	false
			},options);
			
			var output = {};
			
			output.build = function() {
				output.div = dom("div", container);
					output.div.addClass("gameElements ge-container");
			}
			output.build();
			
			output.setSquare = function() {
				var size = {
					container:	{
						width:	container.width(),
						height:	container.height()
					}
				};
				size.div = {
					width:	Math.min(size.container.width,size.container.height),
					height:	Math.min(size.container.width,size.container.height)
				};
				var ratio = {
					container:	size.container.width/size.container.height,
					div:		1
				};
				output.div.css({
					width:	size.div.width,
					height:	size.div.height
				});
			}
			
			
			if (options.square) {
				setInterval(function() {
					output.setSquare();
				}, 300);
			}
			
			return output.div;
		},
		grid:	function(container, options) {
			
			options = _.extend({
				width:		3,
				height:		3,
				square:		false
			},options);
			
			var output = {
				cells:	{}
			};
			
			output.group = $();
			
			output.build = function() {
				output.element = dom("table", container);
				output.element.addClass("gameElements ge-grid");
				var tbody = dom("tbody", output.element);
				var x;
				var y;
				for (y=0;y<options.height;y++) {
					(function(y) {
						output.cells[y] = {};
						var tr = dom("tr", tbody);
						for (x=0;x<options.width;x++) {
							(function(x) {
								var td = dom("td", tr);
									td.css({
										height:	(100/options.height)+"%",
										width:	(100/options.width)+"%"
									});
								output.cells[y][x] = td;
								output.group = output.group.add(td);
							})(x);
						}
					})(y);
				}
			}
			output.build();
			
			output.get = function(x, y) {
				if (output.cells[y] && output.cells[y][x]) {
					return output.cells[y][x];
				}
				return false;
			}
			
			output.setSquare = function() {
				var size = {
					container:	{
						width:	container.width(),
						height:	container.height()
					}
				};
				size.div = {
					width:	Math.min(size.container.width,size.container.height),
					height:	Math.min(size.container.width,size.container.height)
				};
				var ratio = {
					container:	size.container.width/size.container.height,
					div:		1
				};
				output.element.css({
					width:	size.div.width,
					height:	size.div.height
				});
				
				// Resize the cells
				output.group.css({
					height:	(size.div.width*(100/options.height)/100)+"px",
					width:	(size.div.width*(100/options.width)/100)+"px"
				});
			}
			
			
			if (options.square) {
				setInterval(function() {
					output.setSquare();
				}, 300);
			}
			
			return output;
		},
		wordlist:	function(container, options) {
			
			options = _.extend({
				number:	4,
				empty:	"",
				words:	["hello","world","fleetwit"],
				block:	false
			},options);
			
			var output = {
				words:	{}
			};
			
			output.group = $();
			
			output.build = function() {
				output.element = dom("ul", container);
				output.element.addClass("gameElements wordlist");
				if (options.block) {
					output.element.addClass("block");
				}
			}
			output.build();
			
			output.shuffle = function() {
				var elems = output.element.children();
				elems.sort(function() { return (Math.round(Math.random())-0.5); });
				elems.detach();
				for(var i=0; i < elems.length; i++) {
					output.element.append(elems[i]);
				}
				return output;
			}
			output.addWord = function(word) {
				var li = dom("li",output.element);
				if (word) {
					li.html(word);
				}
				var wid = _.uniqueId('word');
				output.words[wid] = li;
				
				return {
					empty:	function() {
						li.addClass("empty").removeClass("wrong").removeClass("inset");
					},
					inset:	function() {
						li.removeClass("empty").removeClass("wrong").addClass("inset");
					},
					wrong:	function() {
						li.removeClass("empty").addClass("wrong").removeClass("inset");
					},
					show:	function() {
						li.removeClass("empty").removeClass("wrong").removeClass("inset");
					},
					set:	function(word) {
						li.html(word);
					},
					element:	li
				};
			}
			
			return output;
		},
		wordpart:	function(container, options) {
			
			options = _.extend({
				empty:	"",
				n:		2
			},options);
			
			var output = {
				blocks:	{}
			};
			
			output.group = $();
			
			output.build = function() {
				output.element = dom("ul", container);
				output.element.addClass("gameElements wordpart");
				var i;
				for (i=0;i<options.n;i++) {
					(function(i) {
						output.blocks[i] = dom("li",output.element);
						output.blocks[i].addClass("inset").html(options.empty);
					})(i);
				}
			}
			output.build();
			
			output.set = function(index, content) {
				if (output.blocks[index]) {
					output.reset(index);
					output.blocks[index].html(content);
				}
				return output;
			}
			output.get = function(index) {
				if (output.blocks[index]) {
					return output.blocks[index]
				}
				return false;
			}
			output.wrong = function(index) {
				if (output.blocks[index]) {
					output.blocks[index].removeClass("inset").addClass("wrong");
				}
				return output;
			}
			output.inset = function(index) {
				if (output.blocks[index]) {
					output.blocks[index].addClass("inset").removeClass("wrong");
				}
				return output;
			}
			output.reset = function(index) {
				if (output.blocks[index]) {
					output.blocks[index].removeClass("inset").removeClass("wrong");
					output.blocks[index].html(options.empty);
				}
				return output;
			}
			
			
			return output;
		},
		imageContainer:	function(container, options) {
			
			options = _.extend({
				src:		"",
				autosize:	true
			},options);
			
			var output = {
				
			};
			
			output.build = function() {
				output.container = dom("div", container);
				output.container.addClass("gameElements imageContainer");
				
				output.shadow = dom("div", output.container);
				output.shadow.addClass("shadow");
				
				output.image = dom("img", output.shadow);
				output.image.attr('src', options.src);
				
				
				output.overlay = dom("div", output.container);
				output.overlay.addClass("overlay");
				
				output.clear = dom("div", container);
				output.clear.addClass("clearfix");
				
			}
			output.build();
			
			output.label = function(str) {
				output.overlay.fadeIn();
				output.overlay.html(str);
			}
			
			return output;
		}
	};
	
	
	function css(element) {
		var dom = element.get(0);
		var style;
		var returns = {};
		if(window.getComputedStyle){
			var camelize = function(a,b){
				return b.toUpperCase();
			};
			style = window.getComputedStyle(dom, null);
			for(var i = 0, l = style.length; i < l; i++){
				var prop = style[i];
				var camel = prop.replace(/\-([a-z])/g, camelize);
				var val = style.getPropertyValue(prop);
				returns[camel] = val;
			};
			return returns;
		};
		if(style = dom.currentStyle){
			for(var prop in style){
				returns[prop] = style[prop];
			};
			return returns;
		};
		return this.css();
	}
	
	var element2D = function(element) {
		this.element = element;
	}
	element2D.prototype.hittest = function(target) {
		if (_.isObject(target) && _.isNumber(target.x) && _.isNumber(target.y)) {
			var offset = this.element.offset();
			if (target.x >= offset.left && target.x <= offset.left+this.element.outerWidth() && target.y >= offset.top && target.y <= offset.top+this.element.outerHeight()) {
				return true;
			}
		}
		return false;
	}
	
	var spacialUtils = {
		hittest: {
			point:	function() {
				
			}
		}
	};
	
	var scrollOffset = function(element) {
		var total = {
			x:	0,
			y:	0
		};
		while(element.parent().length > 0) {
			total.x += element.parent().scrollLeft();
			total.y += element.parent().scrollTop();
			element = element.parent();
		}
		return total;
	}
	
	
	var drag = function(options) {
		this.options = _.extend({
			element:	$(),
			target:		$(),
			parent:		$(),
			onStart:	function() {},
			onDrag:		function() {},
			onEnd:		function() {},
			onDrop:		function() {}
		},options);
		
		// Variables
		this.mousedown 	= false;
		this.clone		= $();
		this.offset		= {x:0, y:0};
		
		this.init();
	}
	drag.prototype.remove = function() {
		this.touchEvent.unbind();
	}
	drag.prototype.init = function() {
		var scope = this;
		this.touchEvent = new touchEvent(this.options.parent, function(touchData) {
			
			var e2d_element 	= new element2D(scope.options.element);
			var hit_element		= e2d_element.hittest({
				x:	touchData.pos.x,
				y:	touchData.pos.y
			});
			
			
			var hit_target		= false;
			var drop_target		= $();
			scope.options.target.each(function(idx, target) {
				var e2d_target 		= new element2D($(target));
				var hit = e2d_target.hittest({
					x:	touchData.pos.x,
					y:	touchData.pos.y
				});
				hit_target |= hit;
				if (hit) {
					drop_target = $(target);
				}
			});
			
			
			switch (touchData.type) {
				case "mousedown":
					if (hit_element) {
						
						// Calculate the offset
						var pos 			= scope.options.element.position();
						scope.offset.x 		= touchData.pos.x-pos.left;
						scope.offset.y 		= touchData.pos.y-pos.top;
						var scroll_offset 	= scrollOffset(scope.options.element);
						
						scope.mousedown = true;
						
						// Force the CSS, ignore classes
						scope.options.element.css(css(scope.options.element));
						
						// Clone the element
						scope.clone = scope.options.element.clone().appendTo(scope.options.element.parent());
						scope.clone.data('clone',true);
						
						scope.options.element.css('opacity', 0.2);
						scope.clone.css('opacity', 0.9);
						scope.clone.css({
							position:	'absolute',
							width:		scope.options.element.outerWidth(),
							height:		scope.options.element.outerHeight(),
							left:		touchData.pos.x-scope.offset.x+scroll_offset.x,
							top:		touchData.pos.y-scope.offset.y+scroll_offset.y
						});
						
						
						
						// Callback
						scope.options.onStart();
					}
				break;
				case "mouseup":
					if (scope.mousedown) {
						
						scope.mousedown = false;
						
						
						scope.options.element.css('opacity', 1);
						
						// Remove the clone
						scope.clone.remove();
						
						// Reset the hard styles
						scope.options.element.get(0).style = "";
						
						if (hit_target) {
							scope.options.onDrop(drop_target);
						}
						
						// Callback
						scope.options.onEnd();
					}
				break;
				case "mousedrag":
					if (scope.mousedown) {
						// Get Scroll Offset
						var scroll_offset 	= scrollOffset(scope.options.element);
						
						// Move the clone
						scope.clone.css({
							left:		touchData.pos.x-scope.offset.x+scroll_offset.x,
							top:		touchData.pos.y-scope.offset.y+scroll_offset.y
						});
						
						// Callback
						scope.options.onDrag();
					}
				break;
			}
		}, true);
	}
	
	
	
	
	var sortlist = function(options) {
		this.options = _.extend({
			element:	$(),
			parent:		$(),
			onStart:	function() {},
			onSort:		function() {},
			onEnd:		function() {},
			restrict:	"y"
		},options);
		
		// Variables
		this.mousedown 	= false;
		this.offset		= {x:0, y:0};
		this.clone		= $();
		this.selected	= $();
		this.items		= this.options.element.children();
		this.items.css("cursor","move");
		console.log("this.items",this.items);
		
		this.init();
	}
	sortlist.prototype.serialize = function(attr) {
		var output = [];
		this.options.element.children().each(function(idx, el) {
			if (!$(el).data('clone')) {
				if (!attr) {
					output.push($(el).text());
				} else {
					output.push($(el).attr(attr));
				}
			}
		});
		return output;
	}
	sortlist.prototype.remove = function() {
		this.touchEvent.unbind();
	}
	sortlist.prototype.init = function() {
		var scope = this;
		
		this.touchEvent = new touchEvent(this.options.parent, function(touchData) {
			/*
			var e2d_element 	= new element2D(scope.options.element);
			var hit_element		= e2d_element.hittest({
				x:	touchData.pos.x,
				y:	touchData.pos.y
			});
			*/
			
			switch (touchData.type) {
				case "mousedown":
					// Check which element we just clicked
					_.each(scope.items, function(item) {
						item = $(item);
						
						// Get Scroll Offset
						var scroll_offset 	= scrollOffset(item);
						
						// Check if we hit the element
						var e2d 			= new element2D(item);
						var hit				= e2d.hittest({
							x:	touchData.pos.x,
							y:	touchData.pos.y
						});
						
						
						
						if (hit) {
							
							console.log("hit",item, touchData.pos.x+scroll_offset.x,touchData.pos.y+scroll_offset.y);
							
							// Select the element
							scope.selected	= item;
							
							// Calculate the offset
							var pos = item.position();
							scope.offset.x = touchData.pos.x-pos.left;
							scope.offset.y = touchData.pos.y-pos.top;
							
							scope.mousedown = true;
							
							// Force the CSS, ignore classes
							item.css(css(item));
							
							// Clone the element
							scope.clone = item.clone().appendTo(item.parent());
							scope.clone.data('clone',true);
							
							item.css('opacity', 0.2);
							scope.clone.css('opacity', 0.9);
							scope.clone.css({
								position:	'absolute',
								width:		item.outerWidth(),
								height:		item.outerHeight(),
								left:		touchData.pos.x-scope.offset.x+scroll_offset.x,
								top:		touchData.pos.y-scope.offset.y+scroll_offset.y
							});
							
							// Callback
							scope.options.onStart();
							
							return false;
						}
					});
				break;
				case "mouseup":
					if (scope.mousedown) {
						
						scope.mousedown = false;
						
						
						scope.options.element.css('opacity', 1);
						
						// Remove the clone
						scope.clone.remove();
						
						// Reset the hard styles
						scope.selected.get(0).style = "";
						
						
						// Callback
						scope.options.onEnd();
					}
				break;
				case "mousedrag":
					if (scope.mousedown) {
						// Get Scroll Offset
						var scroll_offset 	= scrollOffset(scope.selected);
						
						
						// Get the position of the real element
						var itemOffset = scope.selected.offset();
						
						// Get the position of the clone
						var cloneOffset = scope.clone.offset();
						
						// Correct to get the scroll into account
						//itemOffset.x = itemOffset.left+scroll_offset.x;
						//itemOffset.y = itemOffset.top+scroll_offset.y;
						
						// Move the clone
						if (scope.options.restrict && scope.options.restrict == "y") {
							scope.clone.css({
								top:		touchData.pos.y-scope.offset.y+scroll_offset.y
							});
						} else if (scope.options.restrict && scope.options.restrict == "x") {
							scope.clone.css({
								left:		touchData.pos.x-scope.offset.x+scroll_offset.x,
							});
						} else {
							scope.clone.css({
								left:		touchData.pos.x-scope.offset.x+scroll_offset.x,
								top:		touchData.pos.y-scope.offset.y+scroll_offset.y
							});
						}
						
						
						// Now we compare the position of the elements
						// Assuming the sort is restricted on Y axis only for now
						
						var children = scope.selected.parent().children();
						
						// Get the position of the current element
						var currentIndex = 0;
						children.each(function(idx, el) {
							if ($(el).is(scope.selected)) {
								currentIndex = idx;
							}
						})
						
						var itemHeight = scope.selected.outerHeight();
						
						if (cloneOffset.top < itemOffset.top-(itemHeight/2)) {
							// If the element is not the first child
							if (currentIndex > 0) {
								scope.selected.insertBefore($(children.get(currentIndex-1)));
								scope.options.onSort();
							}
						}
						if (cloneOffset.top > itemOffset.top+scope.selected.outerHeight()-(itemHeight/2)) {
							// If the element is not the last child-1 (clone is last, always)
							if (currentIndex < children.length-1) {
								scope.selected.insertAfter($(children.get(currentIndex+1)));
								scope.options.onSort();
							}
						}
					}
				break;
			}
		}, true);
	}
	
	gameElements.drag 		= drag;
	gameElements.sortlist 	= sortlist;
	
	// Global scope
	window.gameElements 		= gameElements;
})();