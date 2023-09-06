function getAgents() {

	if (!Array.prototype.indexOf)
	{
	  Array.prototype.indexOf = function(elt /*, from*/)
	  {
	    var len = this.length >>> 0;

	    var from = Number(arguments[1]) || 0;
	    from = (from < 0)
	         ? Math.ceil(from)
	         : Math.floor(from);
	    if (from < 0)
	      from += len;

	    for (; from < len; from++)
	    {
	      if (from in this &&
	          this[from] === elt)
	        return from;
	    }
	    return -1;
	  };
	}

	if (!Array.prototype.filter)
	{
	  Array.prototype.filter = function(fun /*, thisp */)
	  {
	    "use strict";

	    if (this === void 0 || this === null)
	      throw new TypeError();

	    var t = Object(this);
	    var len = t.length >>> 0;
	    if (typeof fun !== "function")
	      throw new TypeError();

	    var res = [];
	    var thisp = arguments[1];
	    for (var i = 0; i < len; i++)
	    {
	      if (i in t)
	      {
	        var val = t[i]; // in case fun mutates this
	        if (fun.call(thisp, val, i, t))
	          res.push(val);
	      }
	    }

	    return res;
	  };
	}

	if (!('forEach' in Array.prototype)) {
		Array.prototype.forEach= function(action, that /*opt*/) {
		  for (var i= 0, n= this.length; i<n; i++)
		      if (i in this)
		          action.call(that, this[i], i, this);
		};
	}

	/////////////// Agents List
	var agencyNames = $("#autocompletePopup").attr("data-agencies");

	var agencySplit;

	if (agencyNames != undefined) { agencySplit = agencyNames.split("|"); }

	var agentNames	= agencySplit;


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////// Controls
	///////////////
	jQuery("#field-A1").on('input', lookupAgency);
	jQuery("#field-A1").on('propertychange input', lookupAgency);
	jQuery("#field-A1").on('keydown', switchAgency);
	jQuery("#field-A1").on('focus', lookupAgency);
	jQuery("#field-A1").on('blur', function() { setTimeout(function() { jQuery("#autocompletePopup").css('display', 'none'); }, 200) });

	jQuery("#field-A2b").on('input', lookupAgency2);
	jQuery("#field-A2b").on('propertychange input', lookupAgency2);
	jQuery("#field-A2b").on('keydown', switchAgency2);
	jQuery("#field-A2b").on('focus', lookupAgency2);
	jQuery("#field-A2b").on('blur', function() { setTimeout(function() { jQuery("#autocompletePopup2").css('display', 'none'); }, 200) });
	//jQuery("#field-A1").on('focus', function() { jQuery("body").animate({ scrollTop:jQuery(this).offset().top - 20 }), 500 });

	jQuery("#autocompletePopup").on("mousedown", ".clickableAgent", useThisAgent);
	jQuery("#autocompletePopup2").on("mousedown", ".clickableAgent", useThisAgent2);

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////// Agency - Lookup agency names
	///////////////
	var previousMatches = "";
	function lookupAgency (e)
	{
		jQuery("#autocompletePopup").addClass("forceRedraw").removeClass("forceRedraw");
		jQuery(".clickableAgent").addClass("forceRedraw").removeClass("forceRedraw");

		// Instantiation
		var numMatches	= 0;
		var maxMatches	= 100;
		var launcher	= this;
		var launcherPos	= jQuery(launcher).offset();

		// Return if the val is empty
		if (!jQuery("#field-A1").val()) return;

		// Determine matches
		var value	= new RegExp(jQuery("#field-A1").val(), 'gi');
		var matches = agentNames.filter(function(el) {
			if (numMatches >= maxMatches) return false;
			if (el.search(value) != -1) numMatches++;
			return el.search(value) != -1;
		});

		// Check if the matches have changed
		if (matches.join("") == previousMatches) return;

		// Prepare a document fragment
		var popup	 = document.querySelector('#autocompletePopup');
		var fragment = document.createDocumentFragment();

		// Add instructions
		var div = document.createElement('div');
		div.innerHTML = "Please choose a matching agency below:";
		div.className = "instructions";
		fragment.appendChild(div);



		// Create matches and append to the document fragment
		matches.forEach(function(match) {
			var div = document.createElement('DIV');
			div.className	= "clickableAgent";
			div.innerHTML = match;
			div.setAttribute('name', match);
			fragment.appendChild(div);
			jQuery("#autocompletePopup").addClass("forceRedraw").removeClass("forceRedraw");
			jQuery(".clickableAgent").addClass("forceRedraw").removeClass("forceRedraw");
		});

		// Clear the popup
		while (popup.firstChild) { popup.removeChild(popup.firstChild); }


		// Write the document fragment into the popup and reveal
		popup.appendChild(fragment);

		jQuery("#autocompletePopup").css('display', 'block');

		// Place the match buttons underneath the input
		/*
		popup.style.top	= launcherPos.top + jQuery(launcher).outerHeight() + "px";
		popup.style.left= launcherPos.left + "px";*/

		// Store matches to compare and save rewriting
		previousMatches = matches.join("");
	}

	function switchAgency (e)
	{
		// Stop auto behaviour if up, down or enter
		if ([40, 38, 13].indexOf(e.keyCode) != -1) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
		}

		setTimeout(function ()
		{
			// Instantiation
			var selectedItem = document.querySelector("#autocompletePopup .selected") || document.querySelector("#autocompletePopup .instructions");

			// Down
			if (e.keyCode == 40) {
				jQuery("#autocompletePopup").children().removeClass('selected');
				var nextItem = selectedItem.nextSibling || null;
				jQuery(nextItem).addClass('selected');
			}
			// Up
			if (e.keyCode == 38) {
				jQuery("#autocompletePopup").children().removeClass('selected');
				var prevItem = selectedItem.previousSibling || null;
				jQuery(prevItem).addClass('selected');
			}
			// Enter
			if (e.keyCode == 13) {

				jQuery("#autocompletePopup .selected").trigger('mousedown');
				jQuery("#frm_branch").focus();

				return false;
			}

		}, 100);
	}

	function useThisAgent ()
	{
		jQuery("#field-A1").val( this.getAttribute('name') );
		jQuery("#field-A1").focus();

		localStorage.setItem("agencyName", this.getAttribute('name'));

		var agencyNameText = this.getAttribute('name');

		var currentText = $(".question[data-id='A2c'] label").text();
		var replaceText = currentText.replace("[AgencyName]", agencyNameText);

		$(".question[data-id='A2c'] label").text(replaceText);

		var currentReport = $(".question[data-id='A2c']").find("textarea").attr("data-report");

		if (currentReport != undefined) {
			var replaceReport = currentReport.replace("[AgencyName]", agencyNameText);
			$(".question[data-id='A2c']").find("textarea").attr("data-report", replaceReport);
		}
	}


	function lookupAgency2 (e)
	{

		// Instantiation
		var numMatches	= 0;
		var maxMatches	= 100;
		var launcher	= this;
		var launcherPos	= jQuery(launcher).offset();

		// Return if the val is empty
		if (!jQuery("#field-A2b").val()) return;

		// Determine matches
		var value	= new RegExp(jQuery("#field-A2b").val(), 'gi');
		var matches = agentNames.filter(function(el) {
			if (numMatches >= maxMatches) return false;
			if (el.search(value) != -1) numMatches++;
			return el.search(value) != -1;
		});

		// Check if the matches have changed
		if (matches.join("") == previousMatches) return;

		// Prepare a document fragment
		var popup	 = document.querySelector('#autocompletePopup2');
		var fragment = document.createDocumentFragment();

		// Add instructions
		var div = document.createElement('div');
		div.textContent = "Please choose a matching agency below:";
		div.className = "instructions";
		fragment.appendChild(div);

		// Create matches and append to the document fragment
		matches.forEach(function(match) {
			var div = document.createElement('DIV');
			div.className	= "clickableAgent";
			div.textContent = match;
			div.setAttribute('name', match);
			fragment.appendChild(div);
		});

		// Clear the popup
		while (popup.firstChild) { popup.removeChild(popup.firstChild); }

		// Write the document fragment into the popup and reveal
		popup.appendChild(fragment);

		jQuery("#autocompletePopup2").css('display', 'block');

		// Place the match buttons underneath the input
		/*
		popup.style.top	= launcherPos.top + jQuery(launcher).outerHeight() + "px";
		popup.style.left= launcherPos.left + "px";*/

		// Store matches to compare and save rewriting
		previousMatches = matches.join("");
	}

	function switchAgency2 (e)
	{
		// Stop auto behaviour if up, down or enter
		if ([40, 38, 13].indexOf(e.keyCode) != -1) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
		}

		setTimeout(function ()
		{
			// Instantiation
			var selectedItem = document.querySelector("#autocompletePopup2 .selected") || document.querySelector("#autocompletePopup2 .instructions");

			// Down
			if (e.keyCode == 40) {
				jQuery("#autocompletePopup2").children().removeClass('selected');
				var nextItem = selectedItem.nextSibling || null;
				jQuery(nextItem).addClass('selected');
			}
			// Up
			if (e.keyCode == 38) {
				jQuery("#autocompletePopup2").children().removeClass('selected');
				var prevItem = selectedItem.previousSibling || null;
				jQuery(prevItem).addClass('selected');
			}
			// Enter
			if (e.keyCode == 13) {

				jQuery("#autocompletePopup2 .selected").trigger('mousedown');
				jQuery("#frm_branch").focus();

				return false;
			}

		}, 100);
	}

	function useThisAgent2 ()
	{
		jQuery("#field-A2b").val( this.getAttribute('name') );
		jQuery("#field-A2b").focus();
	}
}
