// This is so IE8 won't freak out
if (!('forEach' in Array.prototype)) {
	Array.prototype.forEach= function(action, that /*opt*/) {
	  for (var i= 0, n= this.length; i<n; i++)
	      if (i in this)
	          action.call(that, this[i], i, this);
	};
}

var popover = (function ()
{

	// Contains a number of useful popups that can be created for use in projects
	//
	// -------------------------------------------------
	// POPUPS:
	//
	// LIGHTBOX:
	//
	// Usage:
	// scaf("popups:lightbox", "lightboxName");
	//
	// Methods:
	// scaf("lightboxName:setOptions", { options });
	// scaf("lightboxName:setDefault", "defaultName"); // Sets the current options as a default set, using the defaultName
	// scaf("lightboxName:useDefault", "defaultName"); // Changes the options to those set in setDefault
	// scaf("lightboxName:html", '<a href="http://www.google.com">Visit Google</a>"); // Writes any html to the lightbox contents
	// scaf("lightboxName:show");
	// scaf("lightboxName:hide");
	//
	// LOADING SPINNER
	//
	// Usage:
	// scaf("popups:loadingSpinner", "loadingSpinnerName");
	//
	// Methods:
	// scaf("loadingSpinnerName:show");
	// scaf("loadingSpinnerName:hide");
	// scaf("loadingSpinnerName:setOptions", { options } ); // Options coming soon.  Currently just a pentagon made of circles

	var def = function() {};
	var init = function() {};

	///////////////////////////////////////////
	//// Initialises a Lightbox
	///  Create: var popName = popover.lightbox("name");
	///  Setngs: popName.setOptions( { key:value } );
	///  Showng: popName.show();
	///  Hiding: popName.hide();
	var lightbox = function()
	{
		var buildOptions = (typeof(arguments[0]) == "object") ? arguments[0]: { name:arguments[0] };

		this.construct = function(buildOptions)
		{
			var lightbox = new Lightbox(buildOptions);
			
			// Setup your new lightbox
			lightbox.init();
			lightbox.setOptions(buildOptions);
			
			// Ensure that the stylesheet reference exists
			/*var cssLoaded = false;
			[].forEach.call(document.styleSheets, function (el)
			{
				if (el.href !== null && el.href.indexOf('popover.lightbox.styles.css') != -1) cssLoaded = true;
			});
			
			if (!cssLoaded)
			{
				var styleSheet = document.createElement('link');
				styleSheet.setAttribute('type', 'text/css');
				styleSheet.setAttribute('rel', 'stylesheet');
				styleSheet.setAttribute('href', lightbox.options.cssPath+'popover.lightbox.styles.css');
				styleSheet.setAttribute('media', 'all');
				document.getElementsByTagName('head')[0].appendChild(styleSheet);
			}*/
			
			return lightbox;
		};

		///////////////////////////////////////////
		//// A Lightbox class for instantiation
		var Lightbox = function(buildOptions)
		{
			var self = this;
			
			// Contains default options
			this.options = {
				showMethod		: 'default',
				hideMethod		: 'default',
				contentAlign	: 'center',
				windowAlign		: 'center',
				closeButton		: true,
				closeColor 		: 'black',
				closeText		: "Close",
				confirmButton	: false,
				cancelButton	: false,
				confirmText		: "OK",
				cancelText		: "Cancel",
				cssPath			: "style/",
				onConfirm		: null,
				onCancel		: null,
				onShow			: null,
				onHide			: null,
				background		: true,
				border			: true,
				blackener		: false,
				blackenerColor	: "black",
				autoSize		: false,
				width			: 400,
				height			: 300,
				blackenerCloses : true
			};

			// Stores default option sets
			this.defaults = {};

			///////////////////////////////////////////
			//// Initialises the Lightbox
			this.init = function() {
				this.create();
			}

			this.setup = function(buildOptions) {
				this.id = "lightbox"+genRandomString(6);
				this.options = shallowMerge(this.options, buildOptions);
			}

			///////////////////////////////////////////
			//// Creates the html for the lightbox
			this.create = function()
			{
				// Instantiation
				var template	= this.getLightboxTemplate().replace("[%-id-%]", this.id);
				//var touchEvent	= getTouchEvents().fullEvent;
				var self		= this;
			
				// Append the new lightbox to the body
				jQuery("body").append(template);
				
				// Setup Controls
				var controls = [{ target: "#"+self.id + " .popover-lightbox-close",		callback: self.actions.BTCloseLightbox, 		 evnt: "click", controlName: "BTCloseLightbox"+this.id },
								{ target: "#"+self.id + " .popover-lightbox-blackener",	callback: self.actions.BTCloseLightboxBlackener, evnt: "click", controlName: "BTCloseLightboxBlackener"+this.id }]

				// Attach controls
				controls.forEach(function (el)
				{
					// ignore event and tagert both - touch enables laptops have bugs
					jQuery(el.target).on(el.evnt, el.callback);
					
					if (!document.querySelector(el.target).addEventListener) {

						// Add a new touch event listener
						document.querySelector(el.target).attachEvent('touchend', function(e)
						{
							// prevent delay and simulated mouse events */
							e.preventDefault();
							// trigger the actual behavior we bound to the 'click' event
							e.target.click();
						});

					}
					else {
						// Add a new touch event listener
						document.querySelector(el.target).addEventListener('touchend', function(e)
						{
							// prevent delay and simulated mouse events */
							e.preventDefault();
							// trigger the actual behavior we bound to the 'click' event
							e.target.click();
						})
					}

					
				});

				// Remove the initial display:none style attribute, to stop flicker
				setTimeout(function() { jQuery(".popover-lightbox").removeAttr('style'); }, 500);
			}

			///////////////////////////////////////////
			//// Shows the lightbox
			this.show = function(/* optional options { [regular options] + html:"string" } */) {

				// Instantiation
				var self = this;
				
				// Update the options and html, if requested
				if (arguments[0] && typeof(arguments[0]) == "object")	this.setOptions(arguments[0]);
				if (arguments[0] && arguments[0].html)					this.html(arguments[0].html);

				// Update any settings
				this.update();

				// Launch an onShow if it exists
				if (this.options.onShow) this.options.onShow();
				
				var popup	= document.querySelector("#"+this.id);
				var popState= popup.getAttribute('data-state') || "";
				popup.setAttribute('data-state', popState = popState.replace('-animatingout', ''));
				popup.setAttribute('data-state', popState+'-animatingin');
				jQuery("#"+this.id).attr('data-transition', this.options.showMethod || "");

				// This is added so it'll appear on IE8
				jQuery("#"+this.id).css("display", "block");

				// If this is autosizing, autosize it
				if (self.options.autoSize === true) self.autoSizeLB(true); else self.autoSizeLB(false);
			}

			///////////////////////////////////////////
			//// Hides the lightbox
			this.hide = function() {

				// Instantiation
				var self = this;

				// Launch an onHide if it exists
				if (this.options.onHide) this.options.onHide();
				
				var popup	= document.querySelector("#"+this.id);
				var popState= popup.getAttribute('data-state') || "";
				popup.setAttribute('data-state', popState = popState.replace('-animatingin', ''));
				popup.setAttribute('data-state', popState+'-animatingout');
				jQuery("#"+this.id).attr('data-transition', this.options.hideMethod || "");

				// This is added so it'll disappear on IE8
				jQuery("#"+this.id).css("display", "none");
			}

			///////////////////////////////////////////
			//// Toggles the visibility of the lightbox
			this.toggle = function() {
				jQuery("#"+this.id).toggleClass('on');
			}

			///////////////////////////////////////////
			//// Changes the HTML content of the lightbox
			this.html = function(content) {
				jQuery("#"+this.id).children('.popover-lightbox-content').css( { width:this.options.width, height:this.options.height } );
				jQuery("#"+this.id).find('.popover-lightbox-content .content').html(content);
			}

			///////////////////////////////////////////
			//// Users can provide an object to update the lightbox object
			this.setOptions = function() {
				var options = arguments[0] || {};
				this.options = shallowMerge(this.options, options);
				this.update();
			}

			///////////////////////////////////////////
			//// Returns the options for this object
			this.getOptions = function() {
				return this.options;
			}

			///////////////////////////////////////////
			//// Saves a default set of options to save users constantly redefining the options
			this.saveDefault = function() {
				var defaultName = arguments[0].name || arguments[0] || "default";
				this.defaults[defaultName] = JSON.parse(JSON.stringify(this.options));
			}

			///////////////////////////////////////////
			//// Restores a default set of options
			this.useDefault = this.restoreDefault = function() {
				var defaultName = arguments[0].name || arguments[0] || "default";
				this.setOptions(this.defaults[defaultName]);
			}

			///////////////////////////////////////////
			//// Create template for the lightbox
			this.getLightboxTemplate = function() {

				var template = '';

				template += '<div class="popover-lightbox" id="[%-id-%]" data-name="%-name-%" style="display:none;">';
				template += '	<div class="popover-lightbox-content background border">';
				template += '		<div class="feedbackButtons"><div class="popover-lightbox-cancel BTLightbox" data-display="false">Cancel ✘</div><div class="popover-lightbox-confirm BTLightbox" data-display="false">Confirm ✔</div></div>';
				template += '		<div class="popover-lightbox-close BTLightbox" data-display="true">Close</div>';
				template += '		<div class="content"></div>';
				template += '	</div>';
				template += '	<div class="popover-lightbox-blackener off"></div>';
				template += '</div>';

				template = template.replace("%-name-%", this.options.name);

				return template;

			}


			///////////////////////////////////////////
			//// Updates the lightbox with new options
			this.update = function() {
				//var touchEvents = getTouchEvents();
				for (prop in this.options) {
					var self	= this;
					var opt		= this.options[prop];
					var lb		= jQuery("#"+this.id);
					var lbc		= jQuery("#"+this.id).children('.popover-lightbox-content');
					
					switch (prop) {
						case "closeButton"		: lbc.children('.popover-lightbox-close').attr('data-display', opt);													break;
						case "confirmButton"	: lbc.find('.popover-lightbox-confirm').attr('data-display', opt);														break;
						case "cancelButton"		: lbc.find('.popover-lightbox-cancel').attr('data-display', opt);														break;
						case "closeText"		: lbc.children('.popover-lightbox-close').text(opt);																	break;
						case "closeColor"		: lbc.children('.popover-lightbox-close').css('background-color',opt);													break;
						case "confirmText"		: lbc.find('.popover-lightbox-confirm').text(opt);																		break;
						case "cancelText"		: lbc.find('.popover-lightbox-cancel').text(opt);																		break;
						case "width"			: if (!this.autoSize) lbc.css('width', opt);																			break;
						case "height"			: if (!this.autoSize) lbc.css('height', opt);																			break;
						case "autoSize"			: if (opt) this.autoSizeLB(true); else this.autoSizeLB(false);															break;
						case "contentAlign"		: lb.attr('data-contentAlign',opt);																						break;
						case "windowAlign"		: lb.attr('data-align',opt);																							break;
						case "background"		: lbc.css('background',opt);																							break;
						case "border"			: lbc.removeClass('border'); if (opt) lbc.addClass('border');															break;
						case "blackener"		: if (opt) lb.children('.popover-lightbox-blackener').removeClass('off').addClass('on');
													else lb.children('.popover-lightbox-blackener').removeClass('on').addClass('off');									break;
						case "blackenerColor"	: lb.children('.popover-lightbox-blackener').attr('data-color',opt);													break;
						case "onConfirm"		: var cnf = opt;
												lb.find('.popover-lightbox-confirm').unbind().on("click",		function(e) { e.preventDefault(); e.stopImmediatePropagation(); cnf && cnf(self); });
												lb.find('.popover-lightbox-confirm').on("touchend",	function(e) { e.preventDefault(); e.target.click(); });
												break;
						case "onCancel"			: var cnc = opt;
												lb.find('.popover-lightbox-cancel').unbind().on("click", function(e) { e.preventDefault(); e.stopImmediatePropagation(); cnc && cnc(self); });
												lb.find('.popover-lightbox-cancel').on("touchend", function(e) { e.preventDefault(); e.target.click(); });
												break;
					}
				}
			}


			///////////////////////////////////////////
			//// Auto sizes the lightbox - MODE true turns on autoSize, false removes styles used for autoSize
			this.autoSizeLB = function(turnOn) {

				// Instantiation
				var lbc = jQuery("#"+this.id).children('.popover-lightbox-content');
				var chld = lbc.children('.content')[0];
				var size = { width: chld.scrollWidth, height: chld.scrollHeight };

				// Add element styles
				if (turnOn) {
					lbc.css('width', size.width); lbc.css('height', size.height);
					lbc.children('.content').addClass('autoSize');
				}
				// Remove element styles
				else {
					lbc.children('.content').removeClass('autoSize');
					lbc.css( { height:this.options.height, width:this.options.width  } );
				}
			}


			///////////////////////////////////////////
			//// Destroy this lightbox and any click events
			this.destroy = function(id) {
				jQuery("#"+this.id).remove();
			}


			///////////////////////////////////////////
			//// Actions for button clicks
			this.actions = {
				BTCloseLightbox : function(e) {
					e.preventDefault();
					e.stopImmediatePropagation();
					var name = jQuery(this).closest('.popover-lightbox').attr('data-name');
					self.hide();
				},
				BTCloseLightboxBlackener : function(e) {
					var master = this.parentNode.getAttribute('data-name');
					var options = self.getOptions();
					if (!options.blackenerCloses) return;
					e.preventDefault();
					e.stopImmediatePropagation();
					var name = jQuery(this).closest('.popover-lightbox').attr('data-name');
					self.hide();
				}
			}
			

			///////////////////////////////////////////
			//// Sets up the object
			this.setup(buildOptions);
		}

		// Return the lightbox to the user
		return this.construct(buildOptions);

	};


	///////////////////////////////////////////
	//// Initialises a Loading Spinner
	//// Usage: scaf("popups:loadingSpinner", { "loadingSpinnerName" });
	var loadingSpinner = function() {

		var options = (typeof(arguments[0]) == "object") ? arguments[0]: { name:arguments[0] };

		this.construct = function(options) {
			var loadingSpinner = new LoadingSpinner(options);
			scaf("plugin:register", loadingSpinner, options.name);
			scaf(options.name+":setOptions", options);
		};

		///////////////////////////////////////////
		//// A LoadingSpinner class for instantiation
		var LoadingSpinner = function(options) {

			this.options = shallowMerge({
				arrangement		: 'circle',
				animates		: 'sequential',
				color			: 'white'
			}, options);

			///////////////////////////////////////////
			//// Initialises the LoadingSpinner
			this.init = function() {
				this.create();
			}

			this.setup = function(options) {
				this.id = genRandomString(6);
				this.options = shallowMerge(options, this.options);
			}

			///////////////////////////////////////////
			//// Creates the html for the LoadingSpinner
			this.create = function() {
				var template = this.getLoadingSpinnerTemplate().replace("[%-id-%]", this.id).replace("%-name-%", this.options.name);
				jQuery("body").append(template);
			}

			///////////////////////////////////////////
			//// Shows the LoadingSpinner
			this.show = function() {

				// Update any settings
				//this.update();

				// Display the spinner
				jQuery("#"+this.id).addClass('on');
			}

			///////////////////////////////////////////
			//// Hides the LoadingSpinner
			this.hide = function() {
				jQuery("#"+this.id).removeClass('on');
			}

			///////////////////////////////////////////
			//// Create template for the LoadingSpinner
			this.getLoadingSpinnerTemplate = function() {

				var template = '';
				template += '<div class="scaf-loadingSpinner" data-arrangement="%-arrangement-%" data-animates="%-animates-%" data-color="%-color-%" id="[%-id-%]" data-name="%-name-%">';
				template += '	<div class="scaf-loadingSpinner-content"><div class="scaf-loadingImage"></div><div class="scaf-loadingBubble"></div><div class="scaf-loadingBubble"></div><div class="scaf-loadingBubble"></div><div class="scaf-loadingBubble"></div><div class="scaf-loadingBubble"></div></div>';
				template += '	<div class="scaf-loadingSpinner-blackener"></div>';
				template += '</div>';

				return template;
			}

			///////////////////////////////////////////
			//// Users can provide an object to update the lightbox object
			this.setOptions = function() {
				var options = arguments[0] || {};
				this.options = shallowMerge(this.options, options);
				this.update();
			}

			///////////////////////////////////////////
			//// Updates the loadingSpinner with options
			this.update = function() {
				for (prop in this.options) {
					var self	= this;
					var opt		= this.options[prop];
					var ls		= jQuery("#"+this.id);
					var lsb		= jQuery("#"+this.id).find('.scaf-loadingBubble');
					switch (prop) {
						case "arrangement"	: ls.attr('data-arrangement', opt);	break;
						case "animates"		: ls.attr('data-animates', opt);	break;
						case "color"		: ls.attr('data-color', opt);		break;
					}
				}
			}

			///////////////////////////////////////////
			//// Destroy this LoadingSpinner and any click events
			this.destroy = function(id) {
				jQuery("#"+this.id).remove();
				eLog("loadingSpinner:destroy","Should be deregistering loadingSpinners here");
			}

			///////////////////////////////////////////
			//// Sets up the object
			this.setup(options);

		}


		this.construct(options);

	}
	
	
	///////////////////////////////////////////
	//// Handy Helper Methods
	var genRandomString = function(/* length=6, numbers=true, letters=false, symbols=false */) {
		var includes = {
			letters : "abcdefghijklmnopqrstuvwxyz",
			numbers : "0123456789",
			symbols : "`~!@#$%^&*()_-+={[}]:;<,>.?/"
		};

		var length  	= arguments[0] || 6;
		var chooseFrom  = "";
		chooseFrom	   += (arguments[1] == false)	? "" : includes.numbers;
		chooseFrom	   += (arguments[2])			? includes.letters : "";
		chooseFrom	   += (arguments[3])			? includes.symbols : "";

		var randomStr  = "";
		for (var i=0; i<length; i++) randomStr += chooseFrom[Math.floor(Math.random()*chooseFrom.length)];

		return randomStr;
	}
	
	// Merges 2 objects with no regard to the to object's current keys and values
	shallowMerge = function(to, from) {
		for (property in from) {
			to[property] = from[property];
		}
		return to;
	}
	
	// Returns the event elements
	/*function getTouchEvents ()
	{
		var touch		= ("ontouchend" in document);
		var down		= (touch) ? "touchstart": "mousedown";
		var move		= (touch) ? "touchmove": "mousemove";
		var up			= (touch) ? "touchend": "mouseup";
		var fullEvent	= (touch) ? "touchend": "click";
		
		return { down:down, move:move, up:up, fullEvent:fullEvent };
	}*/
	
	
	///////////////////////////////////////////
	//// Returns a public interface
	return { lightbox: lightbox, loadingSpinner:loadingSpinner };
	
})();
