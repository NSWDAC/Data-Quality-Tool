var htmlPDF = "";
var identifySectionPDF = "";

var overallStarsPDF = '';

var a2AnswerPDF = "yes";

var todayPDF = new Date();
var dayPDF = todayPDF.getDate();
var monthPDF = todayPDF.getMonth() + 1;
var yearPDF = todayPDF.getFullYear();

var pointsEndPDF = '</ul></div>';
var textBeginPDF = '<div class="points">';
var textEndPDF = '</div>';

var institutionalEnviroBeginPDF = '<div class="heading_dimension"><div class="title">INSTITUTIONAL ENVIRONMENT</div><div class="result">'+generateScorePDF("Institutional Environment")+'</div><div class="image">'+generateStarsPDF("Institutional Environment")+'</div></div><div class="points"><ul class="ticks">';
var institutionalEnviroTicksPDF = '';
var institutionalEnviroCrossPDF = '<div class="points"><ul class="cross">';
var institutionalEnviroTextPDF = '';
var institutionalEnviroLinksPDF = 'Links to more information:<br>';

var accuracyBeginPDF = '<div class="heading_dimension"><div class="title">ACCURACY</div><div class="result">'+generateScorePDF("Accuracy")+'</div><div class="image">'+generateStarsPDF("Accuracy")+'</div></div><div class="points"><ul class="ticks">'
var accuracyTicksPDF = '';
var accuracyCrossPDF = '<div class="points"><ul class="cross">';
var accuracyTextPDF = '';
var accuracyLinksPDF = 'Links to more information:<br>';

var coherenceBeginPDF = '<div class="heading_dimension"><div class="title">COHERENCE</div><div class="result">'+generateScorePDF("Coherence")+'</div><div class="image">'+generateStarsPDF("Coherence")+'</div></div><div class="points"><ul class="ticks">'
var coherenceTicksPDF = '';
var coherenceCrossPDF = '<div class="points"><ul class="cross">';
var coherenceTextPDF = '';
var coherenceLinksPDF = 'Links to more information:<br>';

var interpretabilityBeginPDF = '<div class="heading_dimension"><div class="title">INTERPRETABILITY</div><div class="result">'+generateScorePDF("Interpretability")+'</div><div class="image">'+generateStarsPDF("Interpretability")+'</div></div><div class="points"><ul class="ticks">'
var interpretabilityTicksPDF = '';
var interpretabilityCrossPDF = '<div class="points"><ul class="cross">';
var interpretabilityTextPDF = '';
var interpretabilityLinksPDF = 'Links to more information:<br>';

var accessibilityBeginPDF = '<div class="heading_dimension"><div class="title">ACCESSIBILITY</div><div class="result">'+generateScorePDF("Accessibility")+'</div><div class="image">'+generateStarsPDF("Accessibility")+'</div></div><div class="points"><ul class="ticks">'
var accessibilityTicksPDF = '';
var accessibilityCrossPDF = '<div class="points"><ul class="cross">';
var accessibilityTextPDF = '';
var accessibilityLinksPDF = 'Links to more information:<br>';

var relevanceBeginPDF = '<div class="heading_dql">Information to help users evaluate relevance</div><div class="content">'
var relevanceScopePDF = '<p><strong><em>Scope &amp; Coverage:</em></strong></p>';
var relevanceGeoPDF = '<p><strong><em>Geographic detail:</em></strong></p>';
var relevanceOutputsPDF = '<p><strong><em>Outputs:</em></strong></p>';
var relevanceOtherPDF = '<p><strong><em>Other cautions:</em></strong></p>';
var relevanceRefPDF = '<p><strong><em>Reference period:</em></strong></p>';
var relevanceTimingPDF = '<p><strong><em>Timing:</em></strong></p>';
var relevanceFreqPDF = '<p><strong><em>Frequency of production:</em></strong></p>';
var relevanceEndPDF = '</div>';

var contactSectionPDF = '';

var dataQualityRatingByDimensionsPDF = '<div><table width="100%" class="star-dimension"><tbody>'+getStarDetailsByDimensionPDF()+'</tbody></table></div>';
var dataQualityRatingPDF = '<div class="questionanswer" style="background-color: #002664;"><div class="question">Data quality rating:</div><div class="answer" style="background-color: #eeeeee;">'+dataQualityRatingByDimensionsPDF+'</div></div>';

var dataDisclaimer = '<br><div class="disclaimer">DATA DISCLAIMER<br>NSW Government is committed to producing data that is accurate, complete and useful. Notwithstanding its commitment to data quality, NSW Government gives no warranty as to the fitness of this data for a particular purpose. While every effort is made to ensure data quality, the data is provided “as is”. The burden for fitness of the data relies completely with the User. NSW Government shall not be held liable for improper or incorrect use of the data.</div><br>'


function getStarDetailsByDimensionPDF() {
	return getDimensionStarPDF('Institutional Environment')+
		getDimensionStarPDF('Accuracy')+
		getDimensionStarPDF('Coherence')+
		getDimensionStarPDF('Interpretability')+
		getDimensionStarPDF('Accessibility');
}

function getDimensionStarPDF(dimension) {
	if (dimensionHasStarPDF(dimension)) {
		return '<tr class="star-dimension-item"><td width="4%" class="staritem"><img src="/themes/custom/datansw/images/star_red.png" width="13" height="13" align="right"></td><td class="label-text">'+dimension+'</td></tr>';
	}
	else {
		return '<tr class="star-dimension-item"><td width="4%" class="staritem"><span class="star-dash">-</span></td><td class="label-text">'+dimension+'</td></tr>';
	}
}

function generateScorePDF(dimension) {

	// Grab the current user data from localStorage
	var userData = JSON.parse(localStorage.getItem("setData"));

	if (userData == null) { var userData = ["0"]; }

	var userScorePDF = 0;

	var institutionalEnviroPointPDF = 0;

	var accuracyPointPDF = 0;

	// Loop through it and update as needed
	for (o = 0; o < userData.length; o++) {

		if (userData[o].dimension == "About" && userData[o].id == "A2") {
			institutionalEnviroPointPDF = 1;

		}

		if (userData[o].answer != null && userData[o].dimension == dimension) {

			if (userData[o].points != undefined) { userScorePDF = userScorePDF + parseInt(userData[o].points); }

		}

		if (userData[o].dimension == "Relevance" && userData[o].id == "2.5") {
			accuracyPointPDF = parseInt(userData[o].points);
		}

	}

	if (dimension == "Institutional Environment") { userScorePDF = userScorePDF + institutionalEnviroPointPDF }
	if (dimension == "Accuracy") { userScorePDF = userScorePDF + accuracyPointPDF }


	if (userScorePDF <= 2) {
		return "Low";
	}
	else if (userScorePDF == 3 || userScorePDF == 4) {
		return "Medium";
	}
	else if (userScorePDF == 5) {
		return "High";
	}

}

function generateStarsPDF(dimension) {
	if (dimensionHasStarPDF(dimension)) {
		return '<img src="/themes/custom/datansw/images/star_red.png" width="20" height="20" align="right"> ';
	}
	else {
		return '<img src="/themes/custom/datansw/images/star_grey.png" width="20" height="20" align="right"> ';
	}
}

function dimensionHasStarPDF(dimension) {
	// Grab the current user data from localStorage
	var userData = JSON.parse(localStorage.getItem("setData"));

	if (userData == null) { var userData = ["0"]; }

	var userScorePDF = 0;

	var institutionalEnviroPointPDF = 0;

	var accuracyPointPDF = 0;

	// Loop through it and update as needed
	for (o = 0; o < userData.length; o++) {

		if (userData[o].dimension == "About" && userData[o].id == "A2") {
			institutionalEnviroPointPDF = 1;

		}

		if (userData[o].answer != null && userData[o].dimension == dimension) {

			if (userData[o].points != undefined) { userScorePDF = userScorePDF + parseInt(userData[o].points); }

		}

		if (userData[o].dimension == "Relevance" && userData[o].id == "2.5") {
			accuracyPointPDF = parseInt(userData[o].points);
		}

	}

	if (dimension == "Institutional Environment") { userScorePDF = userScorePDF + institutionalEnviroPointPDF }
	if (dimension == "Accuracy") { userScorePDF = userScorePDF + accuracyPointPDF }

	if (userScorePDF <= 2) {
		return false;
	}
	else if (userScorePDF == 3) {
		return false;
	}
	else if (userScorePDF == 4) {
		overallStarsPDF = overallStarsPDF + '<img src="/themes/custom/datansw/images/star_red.png" width="20" height="20" align="right"> ';
		return true
	}
	else if (userScorePDF == 5) {
		overallStarsPDF = overallStarsPDF + '<img src="/themes/custom/datansw/images/star_red.png" width="20" height="20" align="right"> ';
		return true;
	}
}

function checkOverallStarsPDF(){
	if (overallStarsPDF == "") {
		return "No Stars";
	}
	else { return overallStarsPDF; }
}


function generateHTMLPDF() {

	// Grab the current user data from localStorage
	var userData = JSON.parse(localStorage.getItem("setData"));

	// Loop through it and update as needed
	for (i = 0; i < userData.length; i++) {

		// If the question is in the Indentify dimension and has been answered then add it to the HTML
		if (userData[i].answer != null && userData[i].dimension == "About" && userData[i].report != "null" && userData[i].inreport == true) {


			if (userData[i].id == "A1") { }
			else if (userData[i].id == "A2") {

				if (userData[i].answer == "yes") {
					institutionalEnviroTicksPDF = institutionalEnviroTicksPDF + "<li>The agency publishing this data is the recognised data custodian.</li>";
					identifySectionPDF = identifySectionPDF + '<div class="questionanswer" data-id="'+userData[i].id+'"><div class="question">'+userData[i].report+'</div><div class="answer">'+userData[0].answer+'</div></div>';
				}
				if (userData[i].answer == "no") { a2AnswerPDF = "no"; institutionalEnviroCrossPDF = institutionalEnviroCrossPDF + "<li>The agency publishing this data is <u>not</u> the data custodian.</li>"; }

			}
			else if (userData[i].id == "A6") {
				identifySectionPDF = '<div class="questionanswer" data-id="'+userData[i].id+'"><div class="question">'+userData[i].report+'</div><div class="answer">'+userData[i].answer+'</div></div>' + identifySectionPDF;
			}
			else if (userData[i].id == "A2c") {
				if (a2AnswerPDF == "no") {
					institutionalEnviroTextPDF = institutionalEnviroTextPDF + "<p>"+userData[i].report+"<br>"+userData[i].answer+"</p>";
				}

			}
			else {
				identifySectionPDF = identifySectionPDF + '<div class="questionanswer" data-id="'+userData[i].id+'"><div class="question">'+userData[i].report+'</div><div class="answer">'+userData[i].answer+'</div></div>';
			}

		}

		if (userData[i].answer != null && userData[i].dimension != "About" && userData[i].dimension != "Contact" && userData[i].report != "null" && userData[i].inreport == true) {



			if (userData[i].id == "2.5") {

				var htmlString = "<li>"+userData[i].answer+"</li>";
				var revisionHTMLString = "<li>Revision policy: "+userData[i].answer+"</li>";

				if (userData[i].answer == "If errors are identified, data is revised and the revision is publicised") { accuracyTicksPDF = accuracyTicksPDF + revisionHTMLString; }
				else if (userData[i].answer == "Other") { accuracyTicksPDF = accuracyTicksPDF + "<li>The revision policy is described below</li>"; }
				else { accuracyCrossPDF = accuracyCrossPDF + htmlString; }

			}

			if (userData[i].id == "2.5a") {

				var htmlString = "<p>"+userData[i].report+userData[i].answer+"</p>";

				accuracyTextPDF = accuracyTextPDF + htmlString;

			}

			if (userData[i].qtype == "tick") {

				var htmlString = "<li>"+userData[i].report+"</li>";


				if 		(userData[i].dimension == "Institutional Environment") { institutionalEnviroTicksPDF = institutionalEnviroTicksPDF + htmlString; }
				else if (userData[i].dimension == "Accuracy") { accuracyTicksPDF = accuracyTicksPDF + htmlString; }
				else if (userData[i].dimension == "Coherence") { coherenceTicksPDF = coherenceTicksPDF + htmlString; }
				else if (userData[i].dimension == "Interpretability") { interpretabilityTicksPDF = interpretabilityTicksPDF + htmlString; }
				else if (userData[i].dimension == "Accessibility") { accessibilityTicksPDF = accessibilityTicksPDF + htmlString; }


			}
			else if (userData[i].qtype == "cross") {

				var htmlString = "<li>"+userData[i].report+"</li>";

				if 		(userData[i].dimension == "Institutional Environment") { institutionalEnviroCrossPDF = institutionalEnviroCrossPDF + htmlString; }
				else if (userData[i].dimension == "Accuracy") { accuracyCrossPDF = accuracyCrossPDF + htmlString; }
				else if (userData[i].dimension == "Coherence") { coherenceCrossPDF = coherenceCrossPDF + htmlString; }
				else if (userData[i].dimension == "Interpretability") { interpretabilityCrossPDF = interpretabilityCrossPDF + htmlString; }
				else if (userData[i].dimension == "Accessibility") { accessibilityCrossPDF = accessibilityCrossPDF + htmlString; }


			}
			else if (userData[i].qtype == "text-report") {

				var htmlString = "<p>"+userData[i].report+"</p>";

				if 		(userData[i].dimension == "Institutional Environment") { institutionalEnviroTextPDF = institutionalEnviroTextPDF + htmlString; }
				else if (userData[i].dimension == "Accuracy") { accuracyTextPDF = accuracyTextPDF + htmlString; }
				else if (userData[i].dimension == "Coherence") { coherenceTextPDF = coherenceTextPDF + htmlString; }
				else if (userData[i].dimension == "Interpretability") { interpretabilityTextPDF = interpretabilityTextPDF + htmlString; }
				else if (userData[i].dimension == "Accessibility") { accessibilityTextPDF = accessibilityTextPDF + htmlString; }
				else if (userData[i].dimension == "Relevance") {

					if (userData[i].subdimension == "scope") { relevanceScopePDF = relevanceScopePDF + htmlString;	}
					else if (userData[i].subdimension == "geo") { relevanceGeoPDF = relevanceGeoPDF + htmlString; }
					else if (userData[i].subdimension == "outputs") { relevanceOutputsPDF = relevanceOutputsPDF + htmlString; }
					else if (userData[i].subdimension == "other") { relevanceOtherPDF = relevanceOtherPDF + htmlString; }
					else if (userData[i].subdimension == "ref") { relevanceRefPDF = relevanceRefPDF + htmlString; }
					else if (userData[i].subdimension == "timing") { relevanceTimingPDF = relevanceTimingPDF + htmlString; }
					else if (userData[i].subdimension == "freq") { relevanceFreqPDF = relevanceFreqPDF + htmlString; }

				}


			}
			else if (userData[i].qtype == "text-answer") {

				var htmlString = "<p>"+userData[i].answer+"</p>";

				if 		(userData[i].dimension == "Institutional Environment") { institutionalEnviroTextPDF = institutionalEnviroTextPDF + htmlString; }
				else if (userData[i].dimension == "Accuracy") { accuracyTextPDF = accuracyTextPDF + htmlString; }
				else if (userData[i].dimension == "Coherence") { coherenceTextPDF = coherenceTextPDF + htmlString; }
				else if (userData[i].dimension == "Interpretability") { interpretabilityTextPDF = interpretabilityTextPDF + htmlString; }
				else if (userData[i].dimension == "Accessibility") { accessibilityTextPDF = accessibilityTextPDF + htmlString; }
				else if (userData[i].dimension == "Relevance") {

					if (userData[i].subdimension == "scope") { relevanceScopePDF = relevanceScopePDF + htmlString;	}
					else if (userData[i].subdimension == "geo") { relevanceGeoPDF = relevanceGeoPDF + htmlString; }
					else if (userData[i].subdimension == "outputs") { relevanceOutputsPDF = relevanceOutputsPDF + htmlString; }
					else if (userData[i].subdimension == "other") { relevanceOtherPDF = relevanceOtherPDF + htmlString; }
					else if (userData[i].subdimension == "ref") { relevanceRefPDF = relevanceRefPDF + htmlString; }
					else if (userData[i].subdimension == "timing") { relevanceTimingPDF = relevanceTimingPDF + htmlString; }
					else if (userData[i].subdimension == "freq") { relevanceFreqPDF = relevanceFreqPDF + htmlString; }

				}

			}
			else if (userData[i].qtype == "text-report-answer") {

				var htmlString = "<p>"+userData[i].report+userData[i].answer+"</p>";

				if 		(userData[i].dimension == "Institutional Environment") { institutionalEnviroTextPDF = institutionalEnviroTextPDF + htmlString; }
				else if (userData[i].dimension == "Accuracy") { accuracyTextPDF = accuracyTextPDF + htmlString; }
				else if (userData[i].dimension == "Coherence") { coherenceTextPDF = coherenceTextPDF + htmlString; }
				else if (userData[i].dimension == "Interpretability") { interpretabilityTextPDF = interpretabilityTextPDF + htmlString; }
				else if (userData[i].dimension == "Accessibility") { accessibilityTextPDF = accessibilityTextPDF + htmlString; }
				else if (userData[i].dimension == "Relevance") {

					if (userData[i].subdimension == "scope") { relevanceScopePDF = relevanceScopePDF + htmlString;	}
					else if (userData[i].subdimension == "geo") { relevanceGeoPDF = relevanceGeoPDF + htmlString; }
					else if (userData[i].subdimension == "outputs") { relevanceOutputsPDF = relevanceOutputsPDF + htmlString; }
					else if (userData[i].subdimension == "other") { relevanceOtherPDF = relevanceOtherPDF + htmlString; }
					else if (userData[i].subdimension == "ref") { relevanceRefPDF = relevanceRefPDF + htmlString; }
					else if (userData[i].subdimension == "timing") { relevanceTimingPDF = relevanceTimingPDF + htmlString; }
					else if (userData[i].subdimension == "freq") { relevanceFreqPDF = relevanceFreqPDF + htmlString; }

				}


			}
			else if (userData[i].qtype == "links") {

				var htmlString = userData[i].answer+"<br>";

				if 		(userData[i].dimension == "Institutional Environment") { institutionalEnviroLinksPDF = institutionalEnviroLinksPDF + htmlString; }
				else if (userData[i].dimension == "Accuracy") { accuracyLinksPDF = accuracyLinksPDF + htmlString; }
				else if (userData[i].dimension == "Coherence") { coherenceLinksPDF = coherenceLinksPDF + htmlString; }
				else if (userData[i].dimension == "Interpretability") { interpretabilityLinksPDF = interpretabilityLinksPDF + htmlString; }
				else if (userData[i].dimension == "Accessibility") { accessibilityLinksPDF = accessibilityLinksPDF + htmlString; }


			}
			else if (userData[i].qtype == "tick-report-answer") {

				var htmlString = "<li>"+userData[i].report+userData[i].answer+"</li>";

				if 		(userData[i].dimension == "Institutional Environment") { institutionalEnviroTicksPDF = institutionalEnviroTicksPDF + htmlString; }
				else if (userData[i].dimension == "Accuracy") { accuracyTicksPDF = accuracyTicksPDF + htmlString; }
				else if (userData[i].dimension == "Coherence") { coherenceTicksPDF = coherenceTicksPDF + htmlString; }
				else if (userData[i].dimension == "Interpretability") { interpretabilityTicksPDF = interpretabilityTicksPDF + htmlString; }
				else if (userData[i].dimension == "Accessibility") { accessibilityTicksPDF = accessibilityTicksPDF + htmlString; }


			}
			else if (userData[i].qtype == "cross-report-answer") {

				var htmlString = "<li>"+userData[i].report+userData[i].answer+"</li>";

				if 		(userData[i].dimension == "Institutional Environment") { institutionalEnviroCrossPDF = institutionalEnviroCrossPDF + htmlString; }
				else if (userData[i].dimension == "Accuracy") { accuracyCrossPDF = accuracyCrossPDF + htmlString; }
				else if (userData[i].dimension == "Coherence") { coherenceCrossPDF = coherenceCrossPDF + htmlString; }
				else if (userData[i].dimension == "Interpretability") { interpretabilityCrossPDF = interpretabilityCrossPDF + htmlString; }
				else if (userData[i].dimension == "Accessibility") { accessibilityCrossPDF = accessibilityCrossPDF + htmlString; }


			}

		}

		// If the question is in the Indentify dimension and has been answered then add it to the HTML
		if (userData[i].answer != null && userData[i].dimension == "Contact" && userData[i].report != "null" && userData[i].inreport == true) {


			contactSectionPDF = contactSectionPDF + '<div class="questionanswer"><div class="question">'+userData[i].report+'</div><div class="answer">'+userData[i].answer+'</div></div>';


		}

	}

	if ( institutionalEnviroLinksPDF == 'Links to more information:<br>') { institutionalEnviroLinksPDF = ''; }
	if ( accuracyLinksPDF == 'Links to more information:<br>') { accuracyLinksPDF = ''; }
	if ( coherenceLinksPDF == 'Links to more information:<br>') { coherenceLinksPDF = ''; }
	if ( interpretabilityLinksPDF == 'Links to more information:<br>') { interpretabilityLinksPDF = ''; }
	if ( accessibilityLinksPDF == 'Links to more information:<br>') { accessibilityLinksPDF = ''; }

	htmlPDF = identifySectionPDF + dataQualityRatingPDF
		   + institutionalEnviroBeginPDF + institutionalEnviroTicksPDF + pointsEndPDF + institutionalEnviroCrossPDF + pointsEndPDF + textBeginPDF + institutionalEnviroLinksPDF + institutionalEnviroTextPDF + textEndPDF
		   + accuracyBeginPDF + accuracyTicksPDF + pointsEndPDF + accuracyCrossPDF + pointsEndPDF + textBeginPDF + accuracyLinksPDF + accuracyTextPDF + textEndPDF
		   + coherenceBeginPDF + coherenceTicksPDF + pointsEndPDF + coherenceCrossPDF + pointsEndPDF + textBeginPDF + coherenceLinksPDF + coherenceTextPDF + textEndPDF
		   + interpretabilityBeginPDF + interpretabilityTicksPDF + pointsEndPDF + interpretabilityCrossPDF + pointsEndPDF + textBeginPDF + interpretabilityLinksPDF + interpretabilityTextPDF + textEndPDF
		   + accessibilityBeginPDF + accessibilityTicksPDF + pointsEndPDF + accessibilityCrossPDF + pointsEndPDF + textBeginPDF + accessibilityLinksPDF + accessibilityTextPDF + textEndPDF
		   + relevanceBeginPDF + relevanceScopePDF + relevanceGeoPDF + relevanceOutputsPDF + relevanceOtherPDF + relevanceRefPDF + relevanceTimingPDF + relevanceFreqPDF + relevanceEndPDF
		   + dataDisclaimer + contactSectionPDF + '<br>';

	var findBlankTicks = '<div class="points"><ul class="ticks"></ul></div>';
	var reBlankTicks = new RegExp(findBlankTicks, 'g');
	var findBlankCross = '<div class="points"><ul class="cross"></ul></div>';
	var reBlankCross = new RegExp(findBlankCross, 'g');
	var findBlank = '<div class="points"><ul></ul></div>';
	var reBlank = new RegExp(findBlank, 'g');
	var findDivider = '[|]';
	var reDivider = new RegExp(findDivider, 'g');
	var noTextAtAll =  '<div class="points"></div>';
	var reNoTextAtAll = new RegExp(noTextAtAll, 'g');

	htmlPDF = htmlPDF.replace(reBlank, '');
	htmlPDF = htmlPDF.replace(reBlankTicks, '');
	htmlPDF = htmlPDF.replace(reBlankCross, '');
	htmlPDF = htmlPDF.replace(reNoTextAtAll, '');
	htmlPDF = htmlPDF.replace(reDivider, ', ');

	//localStorage.clear();

	localStorage.setItem("pdfContent", htmlPDF);

}
