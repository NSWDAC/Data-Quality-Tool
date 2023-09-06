/*----

Javascript for Data Quality Tool

----*/

////////////////////////
// Set Variables
var $ = jQuery;
function possiblyRewriteNextQuestion(current, nextQuestion, otherNextQuestion) {
  if (otherNextQuestion != "linkfield") {
    return nextQuestion;
  }
	// Set the current question to the inactive state
	$(".question").attr("data-state", "").addClass("forceRedraw").removeClass("forceRedraw");
	$(".question[data-id='"+current+"']").attr("data-state", "active").addClass("forceRedraw").removeClass("forceRedraw");
	$(".question[data-id='"+current+"'] input.linkfield").attr("data-visible", "true").addClass("forceRedraw").removeClass("forceRedraw");
  return otherNextQuestion;
}
var dqt = {

	////////////////////////
	// Start all the things!
	init : function() {
    this.fixActiveTrail();
		this.checkDate();
		this.addDimensions();
		this.setupDropdowns();
		this.setupGlossary();
		this.setupFormFocus();
		this.startSurveyLogic();
		this.setupBackButton();
		getAgents();
		beginUserData();
		generateWordDocJSON();
		generateHTMLPDF();
		this.saveOutXML();

		this.replaceAgencyName();

	},

  fixActiveTrail: function() {
    $('#dqt-stages-menu ul li, #dqt-dimensions-menu')
      .find('.is-active')
      .parent()
      .addClass('active-trail');

  },

	////////////////////////
	// Check the date so we can clear the data if it's been longer than 24 hours
	checkDate : function() {

		var todayDate = new Date().getTime();

		// If no start date has been set, then this is the users first
		// time to the site, so set the date
		if (localStorage.getItem('startDate') == undefined) {

			localStorage.setItem('startDate', new Date().getTime());
		}
		// Otherwise, if we do have a start date
		else if (localStorage.getItem('startDate') != undefined) {

			// then we check how far today is from the start date
			var distanceFromStart = todayDate - localStorage.getItem('startDate');

			// if it's more than one day, then we clear the localStorage
			if (distanceFromStart > (24 * 60 * 60 * 1000)) {
				//localStorage.clear();
			}

		}
	},

	////////////////////////
	// Setup the dropdown menu to dropdown
	setupDropdowns : function() {

		$(".dropdown .sectionheader").click(function(){

			$(this).next().slideToggle();

		});

		// Add enter key press event for accessibility
		$(".dropdown .sectionheader").keypress(function(e){
			if(e.which == 13){//Enter key pressed
				$(".dropdown .sectionheader").click();//Trigger search button click event
			}
		});


		// Set up the menu to highlight the describe section when we're in any of the dimensions
		if ($("#dqt-dimensions-menu ul.nav li").hasClass("active-trail") == true) {
			$("#dqt-stages-menu ul.nav li.first.leaf").next().addClass("active-trail");
		}
	},

	////////////////////////
	// Setup the dropdown menu to dropdown
	setupGlossary : function() {

		var glossaryTable = $(".bottom.glossary").attr("data-terms");

		$(".bottom.glossary").click(function(){

			lb_info.show( { html: glossaryTable, autoSize: false, height: 500, width: 500 } );

		});

		// Add enter key press event for accessibility
		$(".bottom.glossary").keypress(function(e){
			if(e.which == 13){//Enter key pressed
				$(".bottom.glossary").click();//Trigger search button click event
			}
		});
	},

	////////////////////////
	// Setup the form focus backgrounds
	setupFormFocus : function() {

		$("input").focus(function()		{ addFocus(this); replaceAgencyName()});
		$("textarea").focus(function()	{ addFocus(this); replaceAgencyName()});
		$("select").focus(function() 	{ addFocus(this); });
		$(".checkbox").click(function() { addFocus(this); });

		// Add enter key press event for accessibility
		$(".checkbox").keypress(function(e){
			if(e.which == 13){//Enter key pressed
				$(".checkbox").click();//Trigger search button click event
			}
		});


		// Add the active state to the currently focussed element
		function addFocus(selectedElement) {

			// Remove the focus from the previous focussed element
			$(".question").removeAttr("data-state").addClass("forceRedraw").removeClass("forceRedraw");

			// Add the focus!
			$(selectedElement).parents(".question").attr("data-state", "active").addClass("forceRedraw");

			var yesnoQuestion = $(selectedElement).parent().attr("data-yesno");

			if (yesnoQuestion == "false") { $(".surveybtn.next").show(); }

		}

		function replaceAgencyName() {
			var agencyNameText = $(".question[data-id='A1'] input").val();

			if (agencyNameText != "") {
				var currentText = $(".question[data-id='A2c'] label").text();
				var replaceText = currentText.replace("[AgencyName]", agencyNameText);

				$(".question[data-id='A2c'] label").text(replaceText);

				var currentReport = $(".question[data-id='A2c']").find("textarea").attr("data-report");

				if (currentReport != undefined) {
					var replaceReport = currentReport.replace("[AgencyName]", agencyNameText);
					$(".question[data-id='A2c']").find("textarea").attr("data-report", replaceReport);
				}
			}
		}

		$("textarea[maxlength], input[maxlength]").bind('input propertychange', function() {
            var maxLength = $(this).attr('maxlength');

            if ($(this).val().length == maxLength) {
				$(".question[data-state='active'] .errortext").remove();
                $(this).parent(".question").append("<div class='errortext'>You've entered the maximum about of characters for this field.</div>");
            }
        });
	},

	////////////////////////
	// Place missing bits from the menus
	addDimensions : function() {

		$("#dqt-dimensions-menu ul.nav .leaf").append('<div class="progress" data-complete="false"></div>');

		$("#dqt-stages-menu ul.nav .leaf").append('<div class="icon"></div>');

		$("#dqt-stages-menu ul.nav .leaf a").attr("data-complete", "false");

		$("#dqt-stages-menu .leaf").each(function(){
			var location = $("a", this).attr("href");
			$("a", this).attr("data-url", location).removeAttr("href").attr("tabindex", "0");

		});

		$("#dqt-dimensions-menu .leaf").each(function(){
			var location = $("a", this).attr("href");
			$("a", this).attr("data-url", location).removeAttr("href").attr("tabindex", "0");

		});


	},

	setupBackButton : function() {
		var prevURL;
		var areWeInstitutionalEnviro = $("#dqt-dimensions-menu ul li.first.leaf").hasClass("active-trail");

		// If we're in the institutional environment section then we need to move to the Identify
		if (areWeInstitutionalEnviro == true) {

			prevURL = $("#dqt-stages-menu ul li.active-trail").prev().children().attr("data-url");

		}
		// Otherwise we're in general dimensions
		else {
			prevURL = $("#dqt-dimensions-menu ul li.active-trail").prev().children().attr("data-url");
		}


		$(".surveybtn.back").attr("data-href", prevURL);


	},

	////////////////////////
	// Place missing bits from the menus
	replaceAgencyName : function() {

		var agencyNameText = $(".question[data-id='A1'] input").val();

		if (agencyNameText != "") {
			var currentText = $(".question[data-id='A2c'] label").text();
			var replaceText = currentText.replace("[AgencyName]", agencyNameText);

			$(".question[data-id='A2c'] label").text(replaceText);

			var currentReport = $(".question[data-id='A2c']").find("textarea").attr("data-report");

			if (currentReport != undefined) {
				var replaceReport = currentReport.replace("[AgencyName]", agencyNameText);
				$(".question[data-id='A2c']").find("textarea").attr("data-report", replaceReport);
			}
		}

	},

	////////////////////////
	// Start the survey logic
	startSurveyLogic : function() {


		$(".surveybtn.next").click(function(){

			var current = $(".question[data-state='active']").attr("data-id");
			var nextQuestion = $(".question[data-state='active']").attr("data-goto");
			var nextYesNo = $(".question[data-id='"+nextQuestion+"']").attr("data-yesno");
			var nextEnterLink = $(".question[data-id='"+nextQuestion+"']").attr("data-enterlink");
			var userAnswer = $(".question[data-state='active'] input, .question[data-state='active'] textarea, .question[data-state='active'] select").val();
			var reportStatement = $(".question[data-state='active'] input, .question[data-state='active'] textarea, .question[data-state='active'] select").attr("data-report");
      var otherNextQuestion = $(".question[data-state='active']").attr("data-othergoto");


			if ($(this).attr("data-proceed") == "nextquestion") {
				nextQuestion = $(".question[data-state='active']").attr("data-othergoto");
				$(this).attr("data-proceed", "");
			}

			if ( canWeProceed(current) == true ) { proceedToNext(nextQuestion, nextYesNo, nextEnterLink, current, userAnswer, reportStatement) }
			else {
        if (!$(".question[data-state='active']").find('.errortext').length) {
          $(".question[data-state='active']").append('<div class="errortext">You must answer this question before you can proceed</div>');
        }

      }

		});

		// Add enter key press event for accessibility
		$(".surveybtn.next").keypress(function(e){
			if(e.which == 13){//Enter key pressed
				$(".surveybtn.next").click();//Trigger search button click event
			}
		});


		$(".surveybtn.yesno").click(function(){

			// Make this button the selected button
			$(this).addClass("selected").siblings(".yesno").removeClass("selected");

			var current = $(this).parent(".question").attr("data-id");
			var nextQuestion = $(this).attr("data-goto");
			var nextYesNo = $(".question[data-id='"+nextQuestion+"']").attr("data-yesno");
			var nextEnterLink = $(".question[data-id='"+nextQuestion+"']").attr("data-enterlink");
			var userAnswer = $(this).attr("data-answer");
			var reportStatement = $(this).attr("data-report");

			// Check if by selecting this answer we need to ignore any questions
			var ignoreTheseQuestions = $(this).attr("data-ignore");
			var ignoredQuestions = ignoreTheseQuestions.split(',');

			// Loop through the ignored questions and remove them if they're visible
			for (i=0; i < ignoredQuestions.length; i++) { $(".question[data-id='"+ignoredQuestions[i]+"']").attr("data-visible", "false"); }

			proceedToNext(nextQuestion, nextYesNo, nextEnterLink, current, userAnswer, reportStatement);

		});

		// Add enter key press event for accessibility
		$(".surveybtn.yesno").keypress(function(e){
			if(e.which == 13){//Enter key pressed
				$(".surveybtn.yesno").click();//Trigger search button click event
			}
		});

		$(".surveybtn.enterlink").click(function(){

			// Make this button the selected button
			$(this).addClass("selected").siblings(".enterlink").removeClass("selected");

			var current = $(this).parent(".question").attr("data-id");
			var nextQuestion = $(this).attr("data-goto");
			var nextYesNo = $(".question[data-id='"+nextQuestion+"']").attr("data-yesno");
			var nextEnterLink = $(".question[data-id='"+nextQuestion+"']").attr("data-enterlink");
			var userAnswer = $(this).attr("data-answer");
			var reportStatement = $(this).attr("data-report");

			// Empty out the field
			$(this).siblings("input").val("");

			// Check if by selecting this answer we need to ignore any questions
			var ignoreTheseQuestions = $(this).attr("data-ignore");
			var ignoredQuestions = ignoreTheseQuestions.split(',');

			// Loop through the ignored questions and remove them if they're visible
			for (i=0; i < ignoredQuestions.length; i++) { $(".question[data-id='"+current+"'] input.linkfield").attr("data-visible", "false"); }

			// If this question requires us to provide a link, then make a field appear for that
			if (nextQuestion == "linkfield") {

				// Set the current question to the inactive state
				$(".question").attr("data-state", "").addClass("forceRedraw").removeClass("forceRedraw");

				$(".question[data-id='"+current+"']").attr("data-state", "active").addClass("forceRedraw").removeClass("forceRedraw");
				$(".question[data-id='"+current+"'] input.linkfield").attr("data-visible", "true").addClass("forceRedraw").removeClass("forceRedraw");

			}
			else { proceedToNext(nextQuestion, nextYesNo, nextEnterLink, current, userAnswer, reportStatement); }

		});

		// Add enter key press event for accessibility
		$(".surveybtn.enterlink").keypress(function(e){
			if(e.which == 13){//Enter key pressed
				$(".surveybtn.enterlink").click();//Trigger search button click event
			}
		});

		$(".surveybtn.checkquestion").click(function(){

			// Make this button the selected button
			$(this).addClass("selected").siblings(".checkquestion").removeClass("selected");

			var current = $(this).parent(".question").attr("data-id");
			var nextQuestion = $(this).attr("data-goto");
			var nextYesNo = $(".question[data-id='"+nextQuestion+"']").attr("data-yesno");
			var nextEnterLink = $(".question[data-id='"+nextQuestion+"']").attr("data-enterlink");
			var userAnswer = $(this).attr("data-answer");
			var reportStatement = $(this).parent(".question").attr("data-report");
			var nextAnswerSet = $(this).attr("data-gotoanswerset");

			// Check if by selecting this answer we need to ignore any questions
			var ignoreTheseQuestions = $(this).attr("data-ignore");
			var ignoredQuestions = ignoreTheseQuestions.split(',');

			// Loop through the ignored questions and remove them if they're visible
			for (i=0; i < ignoredQuestions.length; i++) { $(".question[data-id='"+ignoredQuestions[i]+"']").attr("data-visible", "false"); }

			$(".question[data-id='"+current+"'] input.linkfield").attr("data-visible", "false")

			// If this question requires us to provide a link, then make a field appear for that
			if (nextQuestion == "linkfield") {

				// Set the current question to the inactive state
				$(".question").attr("data-state", "").addClass("forceRedraw").removeClass("forceRedraw");

				$(".question[data-id='"+current+"']").attr("data-state", "active").addClass("forceRedraw").removeClass("forceRedraw");
				$(".question[data-id='"+current+"'] input.linkfield").attr("data-visible", "true").addClass("forceRedraw").removeClass("forceRedraw");

			}
			else { proceedToNext(nextQuestion, nextYesNo, nextEnterLink, current, userAnswer, reportStatement, nextAnswerSet); }

		});

		// Add enter key press event for accessibility
		$(".surveybtn.checkquestion").keypress(function(e){
			if(e.which == 13){//Enter key pressed
				$(".surveybtn.checkquestion").click();//Trigger search button click event
			}
		});

		$("#dqt-stages-menu .leaf, #dqt-dimensions-menu .leaf").click(function(){

			if ($("#dqt-stages-menu ul li.last.leaf").hasClass("active-trail") != true) {

				var weCanProceed;

				$(".question[data-visible='true']").each(function(){

					var questionID = $(this).attr("data-id");

					if ( canWeProceed(questionID) == true ) {

						if (weCanProceed != false) { weCanProceed = true; }
						$(".question[data-id='"+questionID+"'] .errortext").remove();

					}
					else {
						$(".question[data-id='"+questionID+"'] .errortext").remove();
						weCanProceed = false;
						$(this).append('<div class="errortext">You must answer this question before you can proceed</div>');
					}
				});

				if (weCanProceed == true) {
					grabAndSaveAllData();

					goToURL = $("a", this).attr("data-url");

					window.location = goToURL;
				}
				else { $(".errortext").parent(".question").goTo(); }
			}
			else {
				grabAndSaveAllData();

				goToURL = $("a", this).attr("data-url");

				window.location = goToURL;
			}



		});

		// Add enter key press event for accessibility
		$("#dqt-stages-menu .leaf a, #dqt-dimensions-menu .leaf a").keypress(function(e){
			if(e.which == 13){//Enter key pressed

				grabAndSaveAllData();

				goToURL = $(this).attr("data-url");

				window.location = goToURL;

			}
		});

		$(".surveybtn.back").click(function(){

			grabAndSaveAllData();

			goToURL = $(this).attr("data-href");

			window.location = goToURL;

		});

		$('select[data-type="multiple"]').change(function(){

			var selectedAnswer = $(this).val();

			$(".option[data-name='"+selectedAnswer+"']").remove();

			$(this).after("<div class='option' data-name='"+selectedAnswer+"'>"+selectedAnswer+"</div>");

			$(".option").click(function(){	$(this).remove();});

			$(".surveybtn.next").show();
		});

		$('select[data-type="checkother"]').change(function(){

			var selectedAnswer = $(this).val();

			if (selectedAnswer == "Other" || selectedAnswer == "Other (please specify)") {

				$(this).siblings(".linkfield").attr("data-visible", "true");

			}
			else {
				$(this).siblings(".linkfield").attr("data-visible", "false");
			}

		});

		$(".question[data-id='5.1b'] select, .question[data-id='5.2'] select").change(function(){

			var current = $(".question[data-state='active']").attr("data-id");
			var nextQuestion = $(".question[data-state='active']").attr("data-goto");
			var nextYesNo = $(".question[data-id='"+nextQuestion+"']").attr("data-yesno");
			var nextEnterLink = $(".question[data-id='"+nextQuestion+"']").attr("data-enterlink");
			var userAnswer = $(".question[data-state='active'] input, .question[data-state='active'] textarea, .question[data-state='active'] select").val();
			var reportStatement = $(".question[data-state='active'] input, .question[data-state='active'] textarea, .question[data-state='active'] select").attr("data-report");
      var otherNextQuestion = $(".question[data-state='active']").attr("data-othergoto");
      nextQuestion = possiblyRewriteNextQuestion(current, nextQuestion, otherNextQuestion);
			proceedToNext(nextQuestion, nextYesNo, nextEnterLink, current, userAnswer, reportStatement);


		});

		$('select[data-type="proceed"]').change(function(){

			var selectedAnswer = $(this).val();

			$(this).parent(".question")

			if (selectedAnswer == "Other") {
				$(".surveybtn.next").attr("data-proceed", "nextquestion");
			}
			else {
				$(this).parent(".question").next().attr("data-visible", "");
			}

			if (selectedAnswer == "There is no revision policy") {
				$(this).parent(".question").attr("data-points", "0");

			}
			else {
				$(this).parent(".question").attr("data-points", "1");
			}

			if (selectedAnswer != "Other") {
				$(".question[data-id='2.5a']").attr("data-visible", "false");
			}

		});

		$(".checkbox").click(function(){

			$(this).toggleClass("selected");

			$(".surveybtn.next").show();

			var current = $(this).parent(".question").attr("data-id");
			var nextQuestion = $(this).attr("data-goto");

			if (nextQuestion == "linkfield") {

				// Check if a Other is selected
				var otherSelected = $(".question[data-id='"+current+"']").has(".checkbox[data-goto='linkfield'].selected").length;

				if (otherSelected == true) {
					// Set the current question to the inactive state
					$(".question").attr("data-state", "").addClass("forceRedraw").removeClass("forceRedraw");

					$(".question[data-id='"+current+"']").attr("data-state", "active").addClass("forceRedraw").removeClass("forceRedraw");
					$(".question[data-id='"+current+"'] input.linkfield").attr("data-visible", "true").addClass("forceRedraw").removeClass("forceRedraw");
				}
				else {
					$(".question[data-id='"+current+"'] input.linkfield").attr("data-visible", "false")
				}

			}

		});

		// Add enter key press event for accessibility
		$(".checkbox").keypress(function(e){
			if(e.which == 13){//Enter key pressed
				$(".checkbox").click();//Trigger search button click event
			}
		});

		$(".surveybtn[data-removeanswer]").click(function(){

			var answerToRemove = $(this).attr("data-removeanswer");
			var thisAnswer = $(this).attr("data-answer");

			if (thisAnswer == "no") { $(".surveybtn[data-removeid='"+answerToRemove+"']").attr("data-visible", "false"); }
			else { $(".surveybtn[data-removeid='"+answerToRemove+"']").attr("data-visible", "true").after("<br>"); $(".surveybtn[data-removeid]").prev().after("<br>"); }

		});

		// Add enter key press event for accessibility
		$(".surveybtn[data-removeanswer]").keypress(function(e){
			if(e.which == 13){//Enter key pressed
				$(".surveybtn[data-removeanswer]").click();//Trigger search button click event
			}
		});


		// Check if the question is required and if it's filled out
		function canWeProceed(current) {
			// Remove any existing error text
			//$(".question[data-state='active'] .errortext").remove();

			var isRequired = $(".question[data-id='"+current+"'] input, .question[data-id='"+current+"'] textarea, .question[data-id='"+current+"'] select").attr("data-required");

			var isOther = $(".question[data-id='"+current+"'] input").attr("data-visible");

			var isFilled = $(".question[data-id='"+current+"'] input, .question[data-id='"+current+"'] textarea, .question[data-id='"+current+"'] select").val();
			var typeOfField = $(".question[data-id='"+current+"'] input, .question[data-id='"+current+"'] select").attr("data-type");
			var mustBeInList = $(".question[data-id='"+current+"'] input").attr("data-list");
			var multipleFields = $(".question[data-id='"+current+"'] input").length;
			var hasInputs = $(".question[data-id='"+current+"'] input").length && $(".question[data-id='"+current+"'] select").length;

			if (isOther == "true" && isRequired == "true" && isFilled == "") {
				return false;
			}
			else if (isOther == "false") {
				return true;
			}
			// If this question is required and it's not filled out, don't proceed
			else if (isRequired == "true" && isFilled == "" && typeOfField != "email" && typeOfField != "tel" && typeOfField != "date" && typeOfField != "multiple") {
				return false;
			}
			else if (typeOfField == "multiple") {
				if ( $(".question[data-id='"+current+"'] .option").length > 0 ) { return true; }
			}
			// Otherwise, if it's an email field then check if it's an email that's been entered
			else if (typeOfField == "email") {

				var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

				var email = $(".question[data-id='"+current+"'] input").val();

				if (re.test(email) == true) { return true; }
				else {
          if (!$(".question[data-state='active']").find('.errortext').length) {
            $(".question[data-state='active']").append('<div class="errortext">You must enter a valid email address.</div>');
          }
        }

			}
			// Otherwise, if it's a telephone field then check if only numbers are entered
			else if (typeOfField == "tel") {

				//var re = /^(\d|,)+$/;
				var re = /^\(?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
				var retwo = /^\(?([0-9]{4})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{3})$/;

				var telephone = $(".question[data-id='"+current+"'] input").val();
        if (isRequired !== "true" && !telephone) { return true; }
				if (re.test(telephone) == true) { return true; }
				else if (retwo.test(telephone) == true) { return true; }
				else {
          if (!$(".question[data-state='active']").find('.errortext').length) {
            $(".question[data-state='active']").append('<div class="errortext">Please enter the phone number in the either of the following formats:<br> (##) #### #### OR #### ### ###</div>');
          }
        }
			}
			else if (hasInputs == true) {

				var selectAnswer = $(".question[data-id='"+current+"'] select").val();
				var textAnswer = $(".question[data-id='"+current+"'] input").val();

				if (selectAnswer == "Other (please specify)" || selectAnswer == "Other") {
					if (textAnswer == "") {	return false; }
				}
				else if (selectAnswer == "" && current != '5.1b' && current != '5.2') { return false; }

				return true;

			}
			else if (typeOfField == "date" && multipleFields > 1) {

				//var re = /^(\d|,)+$/;
				var re = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;

				var dateOne;
				var dateTwo;

				$(".question[data-id='"+current+"'] input").each(function(i){

					if (i == 0) { dateOne = $(".question[data-id='"+current+"'] input[data-inputnumber='0']").val(); }
					if (i == 1) { dateTwo = $(".question[data-id='"+current+"'] input[data-inputnumber='1']").val(); }

				});

				if (re.test(dateOne) == true && re.test(dateTwo) == true) { return true; }
				else {
          if (!$(".question[data-state='active']").find('.errortext').length) {
            $(".question[data-state='active']").append('<div class="errortext">Please enter the a valid date in the following format:<br> DD/MM/YYYY</div>');
          }

        }

			}
			// Otherwise, if it's a date field then check if only numbers are entered
			else if (typeOfField == "date") {

				//var re = /^(\d|,)+$/;
				var re = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;

				var date = $(".question[data-id='"+current+"'] input").val();

				if (re.test(date) == true) { return true; }
				else {
          if (!$(".question[data-state='active']").find('.errortext').length) {
            $(".question[data-state='active']").append('<div class="errortext">Please enter the a valid date in the following format:<br> DD/MM/YYYY</div>');
          }
        }
			}
			// Otherwise, the text that's typed must be in the list
			else if (mustBeInList == "true") {

				// Get the users answer
				var userAnswer = $(".question[data-id='"+current+"'] input").val();

				// Get the list of agencies we need to compare against and turn into an array
				var agencyNames = $("#autocompletePopup").attr("data-agencies");
				var agencySplit;
				if (agencyNames != undefined) { agencySplit = agencyNames.split("|"); }
				var agentNames	= agencySplit;
				var errorText;

				// Loop through the agencies and return true if the users answer is a match
				for (x = 0; x < agentNames.length; x++) {

					if (userAnswer == agentNames[x]) {	return true; }
					else { errorText = true; }

				}

				// The name didn't match, so append the error to the page.
				if (errorText = true) {
          if (!$(".question[data-state='active']").find('.errortext').length) {
					  $(".question[data-state='active']").append('<div class="errortext">The agency name must be listed in the dropdown list below.</div>');
          }
				}

			}
			// Otherwise, we're all good to go!
			else { return true; }

		}

		// Take the user to the next question
		function proceedToNext(nextQuestion, nextYesNo, nextEnterLink, currentQuestion, currentAnswer, reportStatement, nextAnswerSet) {

			// If it's the last question in the dimension then we go to the next section
			if (nextQuestion == "nextsection") {

				grabAndSaveAllData();

				var nextURL;

				var areWeIdentify = $("#dqt-stages-menu ul li.first.leaf").hasClass("active-trail");

				var areWeTimeliness = $("#dqt-dimensions-menu ul li.last.leaf").hasClass("active-trail");

				// If we're in the identify section then we need to move to the dimensions
				if (areWeIdentify == true) {

					setCompleteData("Identify", "true");

					nextURL = $("#dqt-stages-menu ul li.active-trail").next().children().attr("data-url");

					window.location = nextURL;
				}
				// If we're in the timeliness section then we need to move to the create statement [age]
				else if (areWeTimeliness == true) {

					setCompleteData("Timeliness", "true");

					nextURL = $("#dqt-stages-menu ul li.last.leaf").children().attr("data-url");

					window.location = nextURL;
				}
				// Otherwise, we're in general dimensions so just continue on
				else {

					var currentDimension = $("#dqt-dimensions-menu ul li.active-trail a").text().trim();

					setCompleteData(currentDimension, "true");

					nextURL = $("#dqt-dimensions-menu ul li.active-trail").next().children().attr("data-url");

					window.location = nextURL;
				}
			}
			// Otherwise, if we need to stop the quiz and open the popup
			else if (nextQuestion == "popup") {

				$(".surveybtn.next").css("display", "none");

				lb_info.show( { html: "Please use the data quality statement published by the Custodian agency.", autoSize: false, height: 80, confirmButton:true, confirmText: "Close and go to Home", onConfirm: function(){ localStorage.clear(); location.reload(); }, closeButton: false } );

			}
			// We need to check what the user answered so we can redirect them to the appropriate question / answer set
			else if (nextAnswerSet != undefined && nextAnswerSet != "") {

				// Set the current question to the inactive state
				$(".question").attr("data-state", "").addClass("forceRedraw").removeClass("forceRedraw");

				$(".question[data-id='"+currentQuestion+"'] .errortext").remove();

				// Set the next question to the active state
				$(".question[data-id='"+nextQuestion+"']").attr("data-visible", "true").attr("data-state", "active").addClass("myFakeIEredrawClass");

				$(".question[data-id='"+nextQuestion+"'] .answerset").attr("data-visible", "false").addClass("myFakeIEredrawClass");
				$(".question[data-id='"+nextQuestion+"'] .answerset[data-answerset='"+nextAnswerSet+"']").attr("data-visible", "true").addClass("myFakeIEredrawClass");

				$(".question[data-id='"+nextQuestion+"']").goTo();

			}
			// Otherwise, just continue on to the next question
			else {

				//$(".question[data-id='"+currentQuestion+"']").attr("data-state", "").addClass("forceRedraw");

				// Set the current question to the inactive state
				$(".question").attr("data-state", "").addClass("forceRedraw").removeClass("forceRedraw");

				$(".question[data-id='"+currentQuestion+"'] .errortext").remove();

				// Set the next question to the active state
				$(".question[data-id='"+nextQuestion+"']").attr("data-visible", "true").attr("data-state", "active").addClass("myFakeIEredrawClass");

				// If the next question is a yesno question, then hide the next button
				(nextYesNo == "true" || nextEnterLink == "true" || nextQuestion == "B10") ? $(".surveybtn.next").hide() : $(".surveybtn.next").show()

				//setTimeout(function(){

					$(".question[data-id='"+nextQuestion+"']").goTo();
				//}, 300);

			}
		}

		function grabAndSaveAllData() {

			// For all of the questions that are visible (means we've filled them out)
			$(".question[data-visible='true']").each(function(){

				var questionID = $(this).attr("data-id");
				var questionText = $("label", this).text();
				var dimensionName = $(this).attr("data-dimension");
				var subDimensionName = $(this).attr("data-subdimension");

				var hasField = $(this).has("input").length || $(this).has("textarea").length || $(this).has("select").length;
				var ignoreField = $(this).has(".enterlink.selected[data-ignore='linkfield']").length || $(this).has(".checkquestion.selected[data-ignore='linkfield']").length || $(this).has(".checkquestion.selected[data-ignore='B8,linkfield']").length;
				var hasCheckbox = $(this).has(".checkbox").length;
				var hasAnswerSet = $(this).has(".answerset[data-visible='true']").length;
				var multipleFields = $("input", this).length;
				var multipleSelect = $("select[data-type='multiple']", this).length

				if (questionText != undefined) { questionText = questionText.replace("\n", ""); }
				if (questionText != undefined) { questionText = questionText.replace("\r\n", ""); }
				if (questionText != undefined) { questionText = questionText.replace("\n\r", ""); }

				// If this question has a select option where you can have multiple answers
				if (multipleSelect == true) {

					var userAnswer;
					var reportStatement = $(this).attr("data-report");
					var questionType = $(this).attr("data-qtype");

					if (reportStatement != undefined) { reportStatement = reportStatement.replace("<p>", ""); }
					if (reportStatement != undefined) { reportStatement = reportStatement.replace("</p>", ""); }
					if (reportStatement != undefined) { reportStatement = reportStatement.replace("\n", ""); }
					if (reportStatement != undefined) { reportStatement = reportStatement.replace("\r\n", ""); }
					if (reportStatement != undefined) { reportStatement = reportStatement.replace("\n\r", ""); }

					$(".option", this).each(function(){
						(userAnswer != undefined) ? userAnswer = userAnswer + "|" + $(this).text() : userAnswer = $(this).text()

						setUserData(questionID, userAnswer, questionText, dimensionName, points, reportStatement, questionType, subDimensionName);

					});

				}
				// Otherwise, it might be a checkbox field
				else if (hasCheckbox == true) {	saveCheckboxAnswers(this, questionID, questionText, dimensionName, 0, subDimensionName);	}
				// Otherwise, if it has multiple input fields then we need to grab both of those
				else if ( hasField == true && multipleFields > 1 && ignoreField == false) {
					var points = $(this).attr("data-points");
					var reportStatement = $(this).find("input, select, textarea").attr("data-report");
					var questionType = $(this).find("input, select, textarea").attr("data-qtype");

					var answerOne;
					var answerTwo;

					$("input", this).each(function(p){

						if (p == 0) { answerOne = $(this).val(); }
						if (p == 1) { answerTwo = $(this).val(); }

					});

					var userAnswer = answerOne+" - "+answerTwo;

					if (reportStatement != undefined) { reportStatement = reportStatement.replace("<p>", ""); }
					if (reportStatement != undefined) { reportStatement = reportStatement.replace("</p>", ""); }
					if (reportStatement != undefined) { reportStatement = reportStatement.replace("\n", ""); }
					if (reportStatement != undefined) { reportStatement = reportStatement.replace("\r\n", ""); }
					if (reportStatement != undefined) { reportStatement = reportStatement.replace("\n\r", ""); }

					setUserData(questionID, userAnswer, questionText, dimensionName, points, reportStatement, questionType, subDimensionName);

				}
				// If this question has a field of any type, then that will be it's answer and we need to grab that data!
				else if ( hasField == true && ignoreField == false) {
					var userAnswer = $(this).find("input, select, textarea").val();
					var points = $(this).attr("data-points");
					var reportStatement = $(this).find("input, select, textarea").attr("data-report");
					var questionType = $(this).find("input, select, textarea").attr("data-qtype");

					if (reportStatement != undefined) { reportStatement = reportStatement.replace("<p>", ""); }
					if (reportStatement != undefined) { reportStatement = reportStatement.replace("</p>", ""); }
					if (reportStatement != undefined) { reportStatement = reportStatement.replace("\n", ""); }
					if (reportStatement != undefined) { reportStatement = reportStatement.replace("\r\n", ""); }
					if (reportStatement != undefined) { reportStatement = reportStatement.replace("\n\r", ""); }

					if (userAnswer != undefined) { userAnswer = userAnswer.replace("\n", ""); }
					if (userAnswer != undefined) { userAnswer = userAnswer.replace("\r\n", ""); }
					if (userAnswer != undefined) { userAnswer = userAnswer.replace("\n\r", ""); }




					setUserData(questionID, CleanWordHTML(userAnswer), questionText, dimensionName, points, reportStatement, questionType, subDimensionName);

					if ($(this).has("select").length && $(this).has(".linkfield[data-visible='true']").length) {
						var userAnswer = $(this).find("input.linkfield").val();
						setUserData(questionID, userAnswer, questionText, dimensionName, points, reportStatement, questionType, subDimensionName);
					}
				}

				// If it's neither of the above, then it's just a generic yes or no question
				else { saveYesNoAnswers(this, questionID, questionText, dimensionName, points, subDimensionName); }

			});


			// For all of the questions that aren't visible but have an answer in them
			// we need to remove from the saved answers
			$(".question[data-visible='false']").each(function(){

				var questionID = $(this).attr("data-id");
				var dimensionName = $(this).attr("data-dimension");

				setUserData(questionID, null, null, dimensionName, null, null, null);

			});

		}

		function saveCheckboxAnswers(thisElement, questionID, questionText, dimensionName, points, subDimensionName) {
			var userAnswer;
			var reportStatement = $(thisElement).attr("data-report");
			var questionType = $(thisElement).attr("data-qtype");

			var hasField = $(thisElement).has("input[data-visible='true']").length;

			if (reportStatement != undefined) { reportStatement = reportStatement.replace("<p>", ""); }
			if (reportStatement != undefined) { reportStatement = reportStatement.replace("</p>", ""); }
			if (reportStatement != undefined) { reportStatement = reportStatement.replace("\n", ""); }
			if (reportStatement != undefined) { reportStatement = reportStatement.replace("\r\n", ""); }
			if (reportStatement != undefined) { reportStatement = reportStatement.replace("\n\r", ""); }

			$(".checkbox.selected", thisElement).each(function(){

				// If the user answer already is filled out, then append this answer to the existing
				(userAnswer != undefined) ? userAnswer = userAnswer + "|" + $(".copy", this).text() : userAnswer = $(".copy", this).text()

				setUserData(questionID, userAnswer, questionText, dimensionName, points, reportStatement, questionType, subDimensionName);

			});

			// We check if there's a text field visible which means the user has selected an "other" option
			if (userAnswer != undefined && $("input[data-visible='true']", thisElement).val() != undefined) {
				userAnswer = userAnswer + "|" + $("input[data-visible='true']", thisElement).val();
				setUserData(questionID, userAnswer, questionText, dimensionName, points, reportStatement, questionType, subDimensionName);
			}
			else if ( $("input[data-visible='true']", thisElement).val() != undefined ){
				userAnswer = $("input[data-visible='true']", thisElement).val();
				setUserData(questionID, userAnswer, questionText, dimensionName, points, reportStatement, questionType, subDimensionName);
			}

		}

		function saveYesNoAnswers(thisElement, questionID, questionText, dimensionName, points, subDimensionName) {

			var userAnswer = $(".surveybtn.selected", thisElement).attr("data-answer");
			var points = $(".surveybtn.selected", thisElement).attr("data-points");
			var reportStatement = $(".surveybtn.selected", thisElement).attr("data-report");
			//if (reportStatement == undefined || reportStatement == '') { reportStatement = $(thisElement).attr("data-report"); }
			//if ( $(".surveybtn.selected", thisElement).has("data-report").length == 0) { reportStatement = $(thisElement).attr("data-report"); }
			var questionType = $(".surveybtn.selected", thisElement).attr("data-qtype");

			if (reportStatement != undefined) { reportStatement = reportStatement.replace("<p>", ""); }
			if (reportStatement != undefined) { reportStatement = reportStatement.replace("</p>", ""); }
			if (reportStatement != undefined) { reportStatement = reportStatement.replace("\n", ""); }
			if (reportStatement != undefined) { reportStatement = reportStatement.replace("\r\n", ""); }
			if (reportStatement != undefined) { reportStatement = reportStatement.replace("\n\r", ""); }


			setUserData(questionID, userAnswer, questionText, dimensionName, points, reportStatement, questionType, subDimensionName);
		}

	},

	saveOutXML : function() {

		// If we're on the last section then save out the userData as XML
		if ($("#dqt-stages-menu ul li.last.leaf").hasClass("active-trail") == true) {

			var savedUserData = JSON.parse(localStorage.getItem("setData"));
			var xmlDownloadString = convertToXML(savedUserData);

			// Save the XML output to the form field so we can grab it when we POST to the download script
			$("input[name='xml-download-data']").attr("value", xmlDownloadString);


			var savedPDFData = localStorage.getItem("pdfContent");

			// Save the PDF HTML output to the form field so we can grab it when we POST to the download script
			$("input[name='section_all']").attr("value", savedPDFData);


			var savedIdentifyJSONData 	 = localStorage.getItem("wordDocIdentify");
			var savedAllSectionsJSONData = localStorage.getItem("wordDocAllSections");
			var savedContactJSONData = localStorage.getItem("wordDocContact");
			var today = new Date();
			var day = today.getDate();
			var month = today.getMonth() + 1;
			var year = today.getFullYear();

			var todaysDate = day+'-'+month+'-'+year;

			$("input[name='doc-date']").attr("value", todaysDate);
			$("input[name='pdf-date']").attr("value", todaysDate);

			// Save the DOC JSON output to the form fields so we can grab it when we POST to the download script
			$("input[name='doc-identify-data']").attr("value", savedIdentifyJSONData);
			$("input[name='doc-allsections-data']").attr("value", savedAllSectionsJSONData);
			$("input[name='doc-contact-data']").attr("value", savedContactJSONData);

		}

		if ($(document).has("#section[data-page='preview']").length) { generateHTMLPreview(); }

		var savedPreviewData = localStorage.getItem("previewContent");

		$("#section[data-page='preview'] .sectionheader[data-section='understanding']").before(savedPreviewData);

	}
}


////////////////////////
// BEGIN WHEN READY! :D
$(document).ready(function(){
	dqt.init();
});
