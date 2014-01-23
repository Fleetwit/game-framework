(function($){
 	$.extend({
 		create: function(nodeType, appendTo, raw) {
			var element = document.createElement(nodeType);
			if (appendTo != undefined) {
				$(appendTo).append($(element));
			}
			return (raw === true)?element:$(element);
		}
 	});
})(jQuery);

