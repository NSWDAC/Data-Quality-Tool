
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////// Setup Lightboxes
///////////////

jQuery(document).ready(function ()
{

	/////////////// Info
	window.lb_info		= popover.lightbox({ name:"lb_info",	cssPath:"sites/all/themes/dqtTheme/css/", contentAlign:"left", blackener:true, autoSize:true });
	
	/////////////// Confirms
	window.lb_confirm	= popover.lightbox({ name:"lb_confirm",	cssPath:"sites/all/themes/dqtTheme/css/", contentAlign:"left", blackener:true, autoSize:true, confirmButton:true, cancelButton:true, closeButton:false });

	/////////////// Loading
	window.lb_loading	= popover.lightbox({ name:"lb_loading", cssPath:"sites/all/themes/dqtTheme/css/", contentAlign:"left", blackener:true, blackenerCloses:false, autoSize:false, width:"200px", height:"200px", closeButton:false, background:"transparent", border:false, onShow:showLoading, onHide:hideLoading });
	window.lb_loading.html('<div class="logo_buenos-agents"></div><div class="label">Loading</div>');
});

function showLoading ()
{
	var target = document.querySelector('[data-name="lb_loading"] .content');
	//target.style.backgroundPosition = Math.ceil(Math.random() * -290)+"px "+Math.ceil(Math.random() * -300)+"px";
	
	// Animate
	//jQuery(target).animate( { 'background-position-x': '-500px', 'background-position-y':"-570px", 'background-size':"400%" }, 15000);
	
	setTimeout(function() { target.className = target.className + " animating"; }, 120);
}

function hideLoading ()
{}