var html = "";
var identifySection = "";

var overallStars = '';

var a2Answer = "yes";
var revisionPolicyDone = false;

var today = new Date();
var day = today.getDate();
var month = today.getMonth() + 1;
var year = today.getFullYear();

var todaysDate = day+'-'+month+'-'+year;

var header = '<div style="text-align: center; font-weight: bold; margin-bottom: 30px; font-size: 12px">NSW Government Data Quality Statement: '+todaysDate+'</div>'

var pointsEnd = '</ul></div>';
var textBegin = '<div class="points">';
var textEnd = '</div>';

var institutionalEnviroBegin = '<div class="sectionheader" data-type="dimension" data-first="true"><div class="heading">Institutional Environment</div><div class="result" data-star="'+generateStars("Institutional Environment")+'" data-section="Institutional Environment">'+generateScore("Institutional Environment")+'</div><div class="icon" data-icon="describe"></div></div><div class="points ticks"><ul>';
var institutionalEnviroTicks = '';
var institutionalEnviroCross = '<div class="points cross"><ul>';
var institutionalEnviroText = '';
var institutionalEnviroLinks = 'Links to more information:<br>';

var accuracyBegin = '<div class="sectionheader" data-type="dimension"><div class="heading">Accuracy</div><div class="result" data-star="'+generateStars("Accuracy")+'" data-section="Accuracy">'+generateScore("Accuracy")+'</div><div class="icon" data-icon="describe"></div></div><div class="points ticks"><ul>'
var accuracyTicks = '';
var accuracyCross = '<div class="points cross"><ul>';
var accuracyText = '';
var accuracyLinks = 'Links to more information:<br>';

var coherenceBegin = '<div class="sectionheader" data-type="dimension"><div class="heading">Coherence</div><div class="result" data-star="'+generateStars("Coherence")+'" data-section="Coherence">'+generateScore("Coherence")+'</div><div class="icon" data-icon="describe"></div></div><div class="points ticks"><ul>'
var coherenceTicks = '';
var coherenceCross = '<div class="points cross"><ul>';
var coherenceText = '';
var coherenceLinks = 'Links to more information:<br>';

var interpretabilityBegin = '<div class="sectionheader" data-type="dimension"><div class="heading">Interpretability</div><div class="result" data-star="'+generateStars("Interpretability")+'" data-section="Interpretability">'+generateScore("Interpretability")+'</div><div class="icon" data-icon="describe"></div></div><div class="points ticks"><ul>'
var interpretabilityTicks = '';
var interpretabilityCross = '<div class="points cross"><ul>';
var interpretabilityText = '';
var interpretabilityLinks = 'Links to more information:<br>';

var accessibilityBegin = '<div class="sectionheader" data-type="dimension"><div class="heading">Accessibility</div><div class="result" data-star="'+generateStars("Accessibility")+'" data-section="Accessibility">'+generateScore("Accessibility")+'</div><div class="icon" data-icon="describe"></div></div><div class="points ticks"><ul>'
var accessibilityTicks = '';
var accessibilityCross = '<div class="points cross"><ul>';
var accessibilityText = '';
var accessibilityLinks = 'Links to more information:<br>';

var relevanceBegin = '<div class="heading_dql">Information to help users evaluate relevance</div><div class="content">';
var relevanceScope = '<p><strong><em>Scope &amp; Coverage:</em></strong></p>';
var relevanceGeo = '<p><strong><em>Geographic detail:</em></strong></p>';
var relevanceOutputs = '<p><strong><em>Outputs:</em></strong></p>';
var relevanceOther = '<p><strong><em>Other cautions:</em></strong></p>';
var relevanceRef = '<p><strong><em>Reference period:</em></strong></p>';
var relevanceTimingBegin = '<p><strong><em>Timing:</em></strong></p>';
var relevanceTiming = '';
var relevanceFreq = '<p><strong><em>Frequency of production:</em></strong></p>';
var relevanceEnd = '</div>';

var contactSection = '';

var dataDisclaimer = '<br><div class="content"><div class="disclaimer">DATA DISCLAIMER<br>NSW Government is committed to producing data that is accurate, complete and useful. Notwithstanding its commitment to data quality, NSW Government gives no warranty as to the fitness of this data for a particular purpose. While every effort is made to ensure data quality, the data is provided “as is”. The burden for fitness of the data relies completely with the User. NSW Government shall not be held liable for improper or incorrect use of the data.</div></div><br>';

var dataQualityRatingByDimensions = '<div class="star-dimension">'+getStarDetailsByDimension()+'</div>';
var dataQualityRating = '<div class="questionanswer"><div class="question">Data quality rating:</div><div class="answer">'+dataQualityRatingByDimensions+'</div></div>';

function getStarDetailsByDimension() {
	return getDimensionStar('Institutional Environment')+
			getDimensionStar('Accuracy')+
			getDimensionStar('Coherence')+
			getDimensionStar('Interpretability')+
			getDimensionStar('Accessibility');
}

function getDimensionStar(dimension) {
	if (generateStars(dimension) == "true") {
		return '<div class="star-dimension-item"><div class="star single-item"></div>'+dimension+'</div>';
	}
	else {
		return '<div class="star-dimension-item"><div class="star-dash"></div>'+dimension+'</div>';
	}
}

function generateScore(dimension) {

	// Grab the current user data from localStorage
	var userData = JSON.parse(localStorage.getItem("setData"));

	if (userData == null) { var userData = ["0"]; }

	var userScore = 0;

	var institutionalEnviroPoint = 0;

	var accuracyPoint = 0;

	// Loop through it and update as needed
	for (o = 0; o < userData.length; o++) {

		if (userData[o].dimension == "About" && userData[o].id == "A2") {
			institutionalEnviroPoint = 1;

		}

		if (userData[o].answer != null && userData[o].dimension == dimension) {

			if (userData[o].points != undefined) { userScore = userScore + parseInt(userData[o].points); }

		}

		if (userData[o].dimension == "Relevance" && userData[o].id == "2.5") {
			accuracyPoint = parseInt(userData[o].points);
		}

		
	}

	if (dimension == "Institutional Environment") { userScore = userScore + institutionalEnviroPoint }
	if (dimension == "Accuracy") { userScore = userScore + accuracyPoint; }


	if (userScore <= 2) {
		return "Low";
	}
	else if (userScore == 3 || userScore == 4) {
		return "Medium";
	}
	else if (userScore >= 5) {
		return "High";
	}

}

function generateStars(dimension) {

	// Grab the current user data from localStorage
	var userData = JSON.parse(localStorage.getItem("setData"));

	if (userData == null) { var userData = ["0"]; }

	var userScore = 0;

	var institutionalEnviroPoint = 0;

	var accuracyPoint = 0;

	// Loop through it and update as needed
	for (o = 0; o < userData.length; o++) {

		if (userData[o].dimension == "About" && userData[o].id == "A2") {
			institutionalEnviroPoint = 1;

		}

		if (userData[o].answer != null && userData[o].dimension == dimension) {

			if (userData[o].points != undefined) { userScore = userScore + parseInt(userData[o].points); }

		}

		if (userData[o].dimension == "Relevance" && userData[o].id == "2.5") {
			accuracyPoint = parseInt(userData[o].points);
		}

	}

	if (dimension == "Institutional Environment") { userScore = userScore + institutionalEnviroPoint }
	if (dimension == "Accuracy") { userScore = userScore + accuracyPoint }

	if (userScore <= 2) {
		return "false";
	}
	else if (userScore == 3) {
		return "false";
	}
	else if (userScore == 4) {
		overallStars = overallStars + '<div class="star"></div>';
		return "true";
	}
	else if (userScore == 5) {
		overallStars = overallStars + '<div class="star"></div>';
		return "true";
	}

}

function checkOverallStars(){
	if (overallStars == "") {
		return "No Stars";
	}
	else { return overallStars; }
}

function generateHTMLPreview() {


	
	// Grab the current user data from localStorage
	var userData = JSON.parse(localStorage.getItem("setData"));

	// Loop through it and update as needed
	for (i = 0; i < userData.length; i++) {

		var bsevenanswer;


		if (userData[i].id == "B7") {
			bsevenanswer = userData[i].answer;
		}

		// If the question is in the Indentify dimension and has been answered then add it to the HTML
		if (userData[i].answer != null && userData[i].dimension == "About" && userData[i].report != "null" && userData[i].inreport == true) {



			if (userData[i].id == "A1") { }
			else if (userData[i].id == "A2") {

				if (userData[i].answer == "yes") { 

					identifySection = identifySection + '<div class="questionanswer" data-id="'+userData[i].id+'"><div class="question">'+userData[i].report+'</div><div class="answer">'+userData[0].answer+'</div></div>';

					institutionalEnviroTicks = institutionalEnviroTicks + "<li>The agency publishing this data is the recognised data custodian.</li>";

				}
				if (userData[i].answer == "no") {
					a2Answer = "no"; 
					institutionalEnviroCross = institutionalEnviroCross + "<li>The agency publishing this data is <u>not</u> the data custodian.</li>";				

				}			

			}
			else if (userData[i].id == "A6") {
				identifySection = '<div class="questionanswer" data-id="'+userData[i].id+'"><div class="question">'+userData[i].report+'</div><div class="answer">'+userData[i].answer+'</div></div>' + identifySection;
			}
			else if (userData[i].id == "A2c") {
				if (a2Answer == "no") {
					institutionalEnviroText = institutionalEnviroText + "<p>"+userData[i].report+"<br>"+userData[i].answer+"</p>";
				}

			}
			else {
				identifySection = identifySection + '<div class="questionanswer" data-id="'+userData[i].id+'"><div class="question">'+userData[i].report+'</div><div class="answer">'+userData[i].answer+'</div></div>';
			}

		}

		if (userData[i].answer != null && userData[i].dimension != "About" && userData[i].dimension != "Contact" && userData[i].report != "null" && userData[i].inreport == true) {

			
			var stopBEight = false;

			if (userData[i].id == "B5") {

				var htmlString = "<p>"+userData[i].report+userData[i].answer+"</p>";

				relevanceTiming = htmlString + relevanceTiming;

			}

			if (userData[i].id == "2.5") {

				var htmlString = "<li>"+userData[i].answer+"</li>";
				var revisionHTMLString = "<li>Revision policy: "+userData[i].answer+"</li>";

				if (userData[i].answer == "If errors are identified, data is revised and the revision is publicised") { accuracyTicks = accuracyTicks + revisionHTMLString; }
				else if (userData[i].answer == "Other") { accuracyTicks = accuracyTicks + "<li>The revision policy is described below.</li>"; }
				else { accuracyCross = accuracyCross + htmlString; }

			}

			if (userData[i].id == "2.5a") {		

				if (revisionPolicyDone == false) {
					var htmlString = "<p>"+userData[i].report+userData[i].answer+"</p>";
					accuracyText = accuracyText + htmlString;
					revisionPolicyDone = true;
				}
			}			

			if (userData[i].id == "B8") {

				if (userData[i].answer == "State") {

					var htmlString = "<p>"+userData[i].report+bsevenanswer+"</p>";

					relevanceGeo = relevanceGeo + htmlString;

					stopBEight = true;

				}
			}

			

			if (userData[i].qtype == "tick") {

				var htmlString = "<li>"+userData[i].report+"</li>";
				
				if 		(userData[i].dimension == "Institutional Environment") { institutionalEnviroTicks = institutionalEnviroTicks + htmlString; }
				else if (userData[i].dimension == "Accuracy") { accuracyTicks = accuracyTicks + htmlString; }
				else if (userData[i].dimension == "Coherence") { coherenceTicks = coherenceTicks + htmlString; }
				else if (userData[i].dimension == "Interpretability") { interpretabilityTicks = interpretabilityTicks + htmlString; }
				else if (userData[i].dimension == "Accessibility") { accessibilityTicks = accessibilityTicks + htmlString; }
				

			}
			else if (userData[i].qtype == "cross") {

				var htmlString = "<li>"+userData[i].report+"</li>";
				
				if 		(userData[i].dimension == "Institutional Environment") { institutionalEnviroCross = institutionalEnviroCross + htmlString; }
				else if (userData[i].dimension == "Accuracy") { accuracyCross = accuracyCross + htmlString; }
				else if (userData[i].dimension == "Coherence") { coherenceCross = coherenceCross + htmlString; }
				else if (userData[i].dimension == "Interpretability") { interpretabilityCross = interpretabilityCross + htmlString; }
				else if (userData[i].dimension == "Accessibility") { accessibilityCross = accessibilityCross + htmlString; }
				

			}
			else if (userData[i].qtype == "text-report") {

				var htmlString = "<p>"+userData[i].report+"</p>";
				
				if 		(userData[i].dimension == "Institutional Environment") { institutionalEnviroText = institutionalEnviroText + htmlString; }
				else if (userData[i].dimension == "Accuracy") { accuracyText = accuracyText + htmlString; }
				else if (userData[i].dimension == "Coherence") { coherenceText = coherenceText + htmlString; }
				else if (userData[i].dimension == "Interpretability") { interpretabilityText = interpretabilityText + htmlString; }
				else if (userData[i].dimension == "Accessibility") { accessibilityText = accessibilityText + htmlString; }
				else if (userData[i].dimension == "Relevance") { 
					
					if (userData[i].subdimension == "scope") { relevanceScope = relevanceScope + htmlString;	}
					else if (userData[i].subdimension == "geo") { relevanceGeo = relevanceGeo + htmlString; }
					else if (userData[i].subdimension == "outputs") { relevanceOutputs = relevanceOutputs + htmlString; }
					else if (userData[i].subdimension == "other") { relevanceOther = relevanceOther + htmlString; }
					else if (userData[i].subdimension == "ref") { relevanceRef = relevanceRef + htmlString; }
					else if (userData[i].subdimension == "timing") { relevanceTiming = relevanceTiming + htmlString; }
					else if (userData[i].subdimension == "freq") { relevanceFreq = relevanceFreq + htmlString; }

				}	
				

			}
			else if (userData[i].qtype == "text-answer") {

				var htmlString = "<p>"+userData[i].answer+"</p>";
				
				if 		(userData[i].dimension == "Institutional Environment") { institutionalEnviroText = institutionalEnviroText + htmlString; }
				else if (userData[i].dimension == "Accuracy") { accuracyText = accuracyText + htmlString; }
				else if (userData[i].dimension == "Coherence") { coherenceText = coherenceText + htmlString; }
				else if (userData[i].dimension == "Interpretability") { interpretabilityText = interpretabilityText + htmlString; }
				else if (userData[i].dimension == "Accessibility") { accessibilityText = accessibilityText + htmlString; }
				else if (userData[i].dimension == "Relevance") { 
					
					if (userData[i].subdimension == "scope") { relevanceScope = relevanceScope + htmlString;	}
					else if (userData[i].subdimension == "geo") { relevanceGeo = relevanceGeo + htmlString; }
					else if (userData[i].subdimension == "outputs") { relevanceOutputs = relevanceOutputs + htmlString; }
					else if (userData[i].subdimension == "other") { relevanceOther = relevanceOther + htmlString; }
					else if (userData[i].subdimension == "ref") { relevanceRef = relevanceRef + htmlString; }
					else if (userData[i].subdimension == "timing") { relevanceTiming = relevanceTiming + htmlString; }
					else if (userData[i].subdimension == "freq") { relevanceFreq = relevanceFreq + htmlString; }

				}				

			}
			else if (userData[i].qtype == "text-report-answer") {

				var htmlString = "<p>"+userData[i].report+userData[i].answer+"</p>";
				
				if 		(userData[i].dimension == "Institutional Environment") { institutionalEnviroText = institutionalEnviroText + htmlString; }
				else if (userData[i].dimension == "Accuracy") { accuracyText = accuracyText + htmlString; }
				else if (userData[i].dimension == "Coherence") { coherenceText = coherenceText + htmlString; }
				else if (userData[i].dimension == "Interpretability") { interpretabilityText = interpretabilityText + htmlString; }
				else if (userData[i].dimension == "Accessibility") { accessibilityText = accessibilityText + htmlString; }
				else if (userData[i].dimension == "Relevance") { 
					
					if (userData[i].subdimension == "scope") { relevanceScope = relevanceScope + htmlString;	}
					else if (userData[i].subdimension == "geo") { 
						if (userData[i].id != "B8") { relevanceGeo = relevanceGeo + htmlString; }						
					}
					else if (userData[i].subdimension == "outputs") { relevanceOutputs = relevanceOutputs + htmlString; }
					else if (userData[i].subdimension == "other") { relevanceOther = relevanceOther + htmlString; }
					else if (userData[i].subdimension == "ref") { relevanceRef = relevanceRef + htmlString; }
					else if (userData[i].subdimension == "timing") { if (userData[i].id != "B5") { relevanceTiming = relevanceTiming + htmlString; } }
					else if (userData[i].subdimension == "freq") { relevanceFreq = relevanceFreq + htmlString; }

				}				

			}
			else if (userData[i].qtype == "links") {

				var htmlString = userData[i].answer+"<br>";
				
				if 		(userData[i].dimension == "Institutional Environment") { institutionalEnviroLinks = institutionalEnviroLinks + htmlString; }
				else if (userData[i].dimension == "Accuracy") { accuracyLinks = accuracyLinks + htmlString; }
				else if (userData[i].dimension == "Coherence") { coherenceLinks = coherenceLinks + htmlString; }
				else if (userData[i].dimension == "Interpretability") { interpretabilityLinks = interpretabilityLinks + htmlString; }
				else if (userData[i].dimension == "Accessibility") { accessibilityLinks = accessibilityLinks + htmlString; }
				

			}
			else if (userData[i].qtype == "tick-report-answer") {

				var htmlString = "<li>"+userData[i].report+userData[i].answer+"</li>";
				
				if 		(userData[i].dimension == "Institutional Environment") { institutionalEnviroTicks = institutionalEnviroTicks + htmlString; }
				else if (userData[i].dimension == "Accuracy") { accuracyTicks = accuracyTicks + htmlString; }
				else if (userData[i].dimension == "Coherence") { coherenceTicks = coherenceTicks + htmlString; }
				else if (userData[i].dimension == "Interpretability") { interpretabilityTicks = interpretabilityTicks + htmlString; }
				else if (userData[i].dimension == "Accessibility") { accessibilityTicks = accessibilityTicks + htmlString; }
				

			}
			else if (userData[i].qtype == "cross-report-answer") {

				var htmlString = "<li>"+userData[i].report+userData[i].answer+"</li>";
				
				if 		(userData[i].dimension == "Institutional Environment") { institutionalEnviroCross = institutionalEnviroCross + htmlString; }
				else if (userData[i].dimension == "Accuracy") { accuracyCross = accuracyCross + htmlString; }
				else if (userData[i].dimension == "Coherence") { coherenceCross = coherenceCross + htmlString; }
				else if (userData[i].dimension == "Interpretability") { interpretabilityCross = interpretabilityCross + htmlString; }
				else if (userData[i].dimension == "Accessibility") { accessibilityCross = accessibilityCross + htmlString; }
				

			}

		}

		// If the question is in the Indentify dimension and has been answered then add it to the HTML
		if (userData[i].answer != null && userData[i].dimension == "Contact" && userData[i].report != "null" && userData[i].inreport == true) {
		
			contactSection = contactSection + '<div class="questionanswer"><div class="question">'+userData[i].report+'</div><div class="answer">'+userData[i].answer+'</div></div>';		

		}

	}

	html = header + identifySection + dataQualityRating
		   + institutionalEnviroBegin + institutionalEnviroTicks + pointsEnd + institutionalEnviroCross + pointsEnd + textBegin + institutionalEnviroLinks + institutionalEnviroText + textEnd 
		   + accuracyBegin + accuracyTicks + pointsEnd + accuracyCross + pointsEnd + textBegin + accuracyLinks + accuracyText + textEnd
		   + coherenceBegin + coherenceTicks + pointsEnd + coherenceCross + pointsEnd + textBegin + coherenceLinks + coherenceText + textEnd 
		   + interpretabilityBegin + interpretabilityTicks + pointsEnd + interpretabilityCross + pointsEnd + textBegin + interpretabilityLinks + interpretabilityText + textEnd 
		   + accessibilityBegin + accessibilityTicks + pointsEnd + accessibilityCross + pointsEnd + textBegin + accessibilityLinks + accessibilityText + textEnd 
		   + relevanceBegin + relevanceScope + relevanceGeo + relevanceOutputs + relevanceOther + relevanceRef + relevanceTimingBegin + relevanceTiming + relevanceFreq + relevanceEnd
		   + dataDisclaimer + contactSection + '<br>';

	var findBlankTicks = '<div class="points ticks"><ul></ul></div>';
	var reBlankTicks = new RegExp(findBlankTicks, 'g');
	var findBlankCross = '<div class="points cross"><ul></ul></div>';
	var reBlankCross = new RegExp(findBlankCross, 'g');
	var findBlank = '<div class="points"><ul></ul></div>';
	var reBlank = new RegExp(findBlank, 'g');
	var findBlankLinks = 'Links to more information:<br><p>';
	var reBlankLinks = new RegExp(findBlankLinks, 'g');
	var findDivider = '[|]';
	var reDivider = new RegExp(findDivider, 'g');
	var noTextAtAll =  '<div class="points">Links to more information:<br></div>';
	var reNoTextAtAll = new RegExp(noTextAtAll, 'g');

	html = html.replace(reBlank, '');
	html = html.replace(reBlankTicks, '');
	html = html.replace(reBlankCross, '');
	html = html.replace(reBlankLinks, '');
	html = html.replace(reNoTextAtAll, '');
	html = html.replace(reDivider, ', ');

	localStorage.setItem("previewContent", html);

}