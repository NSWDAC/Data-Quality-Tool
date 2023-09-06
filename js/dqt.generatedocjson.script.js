var identifySectionJSON = [];
var contactSectionJSON = [];

var overallStarsWordDoc = 0;

var a2AnswerWord = "yes";

var todayDoc = new Date();
var dayDoc = todayDoc.getDate();
var monthDoc = todayDoc.getMonth() + 1;
var yearDoc = todayDoc.getFullYear();


var allSectionsJSON = [
	
	{
		"section"	: 	"INSTITUTIONAL ENVIRONMENT",
		"score" 	: 	generateScoreWordDoc("Institutional Environment"),
		"star"		: 	generateStarsWordDoc("Institutional Environment"),
		"qa"		: 	[]
	},
	{
		"section"	: 	"ACCURACY",
		"score" 	: 	generateScoreWordDoc("Accuracy"),
		"star"		: 	generateStarsWordDoc("Accuracy"),
		"qa"		: 	[]
	},
	{
		"section"	: 	"COHERENCE",
		"score" 	: 	generateScoreWordDoc("Coherence"),
		"star"		: 	generateStarsWordDoc("Coherence"),
		"qa"		: 	[]
	},
	{
		"section"	: 	"INTERPRETABILITY",
		"score" 	: 	generateScoreWordDoc("Interpretability"),
		"star"		: 	generateStarsWordDoc("Interpretability"),
		"qa"		: 	[]
	},
	{
		"section"	: 	"ACCESSIBILITY",
		"score" 	: 	generateScoreWordDoc("Accessibility"),
		"star"		: 	generateStarsWordDoc("Accessibility"),
		"qa"		: 	[]
	},
	{
		"section"	: 	"RELEVANCE",
		"score" 	: 	"-",
		"star"		: 	null,
		"qa"		: 	[]
	}
];


function generateScoreWordDoc(dimension) {

	// Grab the current user data from localStorage
	var userData = JSON.parse(localStorage.getItem("setData"));

	if (userData == null) { var userData = ["0"]; }

	var userScoreWordDoc = 0;

	var institutionalEnviroPoint = 0;

	var accuracyPointWord = 0;

	// Loop through it and update as needed
	for (o = 0; o < userData.length; o++) {

		if (userData[o].dimension == "About" && userData[o].id == "A2") {
			institutionalEnviroPoint = 1;

		}

		if (userData[o].answer != null && userData[o].dimension == dimension) {

			if (userData[o].points != undefined) { userScoreWordDoc = userScoreWordDoc + parseInt(userData[o].points); }

		}

		if (userData[o].dimension == "Relevance" && userData[o].id == "2.5") {
			accuracyPointWord = parseInt(userData[o].points);
		}

	}

	if (dimension == "Institutional Environment") { userScoreWordDoc = userScoreWordDoc + institutionalEnviroPoint }
	if (dimension == "Accuracy") { userScoreWordDoc = userScoreWordDoc + accuracyPointWord }

	if (userScoreWordDoc <= 2) {
		return "LOW";
	}
	else if (userScoreWordDoc == 3 || userScoreWordDoc == 4) {
		return "MEDIUM";
	}
	else if (userScoreWordDoc == 5) {
		return "HIGH";
	}

}

function generateStarsWordDoc(dimension) {

	// Grab the current user data from localStorage
	var userData = JSON.parse(localStorage.getItem("setData"));

	if (userData == null) { var userData = ["0"]; }

	var userScoreWordDoc = 0;

	var institutionalEnviroPoint = 0;

	var accuracyPointWord = 0;

	// Loop through it and update as needed
	for (o = 0; o < userData.length; o++) {

		if (userData[o].dimension == "About" && userData[o].id == "A2") {
			institutionalEnviroPoint = 1;

		}

		if (userData[o].answer != null && userData[o].dimension == dimension) {

			if (userData[o].points != undefined) { userScoreWordDoc = userScoreWordDoc + parseInt(userData[o].points); }

		}

		if (userData[o].dimension == "Relevance" && userData[o].id == "2.5") {
			accuracyPointWord = parseInt(userData[o].points);
		}

	}

	if (dimension == "Institutional Environment") { userScoreWordDoc = userScoreWordDoc + institutionalEnviroPoint }
	if (dimension == "Accuracy") { userScoreWordDoc = userScoreWordDoc + accuracyPointWord }

	

	if (userScoreWordDoc <= 2) {
		return 'false';
	}
	else if (userScoreWordDoc == 3) {
		return 'false';
	}
	else if (userScoreWordDoc == 4) {
		overallStarsWordDoc = overallStarsWordDoc + 1;
		return 'true';
	}
	else if (userScoreWordDoc == 5) {
		overallStarsWordDoc = overallStarsWordDoc + 1;
		return 'true';
	}

}



function generateWordDocJSON() {
	
	// Grab the current user data from localStorage
	var userData = JSON.parse(localStorage.getItem("setData"));

	// Loop through it and update as needed
	for (i = 0; i < userData.length; i++) {

		// If the question is in the Indentify dimension and has been answered then add it to the JSON
		if (userData[i].answer != null && userData[i].dimension == "About" && userData[i].report != "null" && userData[i].inreport == true) { 
			
			if (userData[i].id == "A1") { }
			// If the question is A2, it means that they are the custodian of the dataset, so the answer they gave at A1 needs to be associated with this
			else if (userData[i].id == "A2") { 				

				if (userData[i].answer == "yes") {
					identifySectionJSON.push({"question": userData[i].report, "answer": userData[0].answer});
					for (j = 0; j < allSectionsJSON.length; j++) {

						if (allSectionsJSON[j].section == "INSTITUTIONAL ENVIRONMENT") { var jsonObject = {"type": "tick", "question": "null", "answer": "The agency publishing this data is the recognised data custodian."}; allSectionsJSON[j].qa.push(jsonObject);}
					}
				}
				else if (userData[i].answer == "no") {
					a2AnswerWord = "no";
					for (j = 0; j < allSectionsJSON.length; j++) {

						if (allSectionsJSON[j].section == "INSTITUTIONAL ENVIRONMENT") { var jsonObject = {"type": "cross", "question": "null", "answer": "The agency publishing this data is not the data custodian."}; allSectionsJSON[j].qa.push(jsonObject);}
					}
				}		

			}			
			else if (userData[i].id == "A6") { identifySectionJSON.unshift({"question": userData[i].report, "answer": userData[i].answer}); }
			else if (userData[i].id == "A2c") {
				if (a2AnswerWord == "no") {				

					for (j = 0; j < allSectionsJSON.length; j++) {

						if (allSectionsJSON[j].section == "INSTITUTIONAL ENVIRONMENT") { var jsonObject = {"type": "text", "question": "null", "answer": userData[i].report+userData[i].answer}; allSectionsJSON[j].qa.push(jsonObject);}
					}
				}

			}
			else { identifySectionJSON.push({"question": userData[i].report, "answer": userData[i].answer}); }		

		}

		// If the question is in the Indentify dimension and has been answered then add it to the JSON
		if (userData[i].answer != null && userData[i].dimension == "Contact" && userData[i].report != "null" && userData[i].inreport == true) { 
			
			
			contactSectionJSON.push({"question": userData[i].report, "answer": userData[i].answer});	


		}		

		// If the question isn't Identify and they've answered it, then it's one of the main dimensions
		if (userData[i].answer != null && userData[i].dimension != "About" && userData[i].dimension != "Contact" && userData[i].report != "null" && userData[i].inreport == true) {
			
			var findDivider = '[|]';
			var reDivider = new RegExp(findDivider, 'g');
			var findSingleQuote = /\&#39;/g;
			//var reSingleQuote = new RegExp(/\&#39;/g, 'g');
			var findDoubleQuote = /\&quot;/g; //'\&quot;';
			//var reDoubleQuote = new RegExp(/\&quot;/g, 'g');

			userData[i].answer = userData[i].answer.replace(reDivider, ', ');
			userData[i].answer = userData[i].answer.replace(findSingleQuote, "'");
			userData[i].answer = userData[i].answer.replace(findDoubleQuote, '"');

			for (p = 0; p < allSectionsJSON.length; p++) {

				if (userData[i].dimension.toUpperCase() === allSectionsJSON[p].section.toUpperCase()) {

					var jsonObject; 

					if (userData[i].id == "2.5") {					

						if (userData[i].answer == "If errors are identified, data is revised and the revision is publicised") { jsonObject = {"type": "tick", "question": "null", "answer": "Revision policy: "+userData[i].answer}; allSectionsJSON[1].qa.push(jsonObject); }
						else if (userData[i].answer == "Other") { jsonObject = {"type": "tick", "question": "null", "answer": "The revision policy is described below"}; allSectionsJSON[1].qa.push(jsonObject); }
						else { jsonObject = {"type": "cross", "question": "null", "answer": userData[i].answer}; allSectionsJSON[1].qa.push(jsonObject); }

					}

					if (userData[i].id == "2.5a") {

						jsonObject = {"type": "text", "question": "null", "answer": userData[i].report+userData[i].answer}; allSectionsJSON[1].qa.push(jsonObject);
					}

					// If it's "dots" then it'll be one of the dot points at the top of the section
					if (userData[i].qtype == "tick") {	jsonObject = {"type": "tick", "question": "null", "answer": userData[i].report}; allSectionsJSON[p].qa.push(jsonObject); }
					if (userData[i].qtype == "cross") {	jsonObject = {"type": "cross", "question": "null", "answer": userData[i].report}; allSectionsJSON[p].qa.push(jsonObject); }
					else if (userData[i].qtype == "text-report") { 

						if (userData[i].subdimension == "scope") { jsonObject = {"type": "scope", "question": "null", "answer": userData[i].report }; allSectionsJSON[p].qa.push(jsonObject); }
						else if (userData[i].subdimension == "geo") { jsonObject = {"type": "geo", "question": "null", "answer": userData[i].report }; allSectionsJSON[p].qa.push(jsonObject); }
						else if (userData[i].subdimension == "outputs") { jsonObject = {"type": "outputs", "question": "null", "answer": userData[i].report }; allSectionsJSON[p].qa.push(jsonObject); }
						else if (userData[i].subdimension == "other") { jsonObject = {"type": "other", "question": "null", "answer": userData[i].report }; allSectionsJSON[p].qa.push(jsonObject); }
						else if (userData[i].subdimension == "ref") { jsonObject = {"type": "ref", "question": "null", "answer": userData[i].report }; allSectionsJSON[p].qa.push(jsonObject); }
						else if (userData[i].subdimension == "timing") { jsonObject = {"type": "timing", "question": "null", "answer": userData[i].report }; allSectionsJSON[p].qa.push(jsonObject); }
						else if (userData[i].subdimension == "freq") { jsonObject = {"type": "freq", "question": "null", "answer": userData[i].report }; allSectionsJSON[p].qa.push(jsonObject); }						
						else { jsonObject = {"type": "text", "question": "null", "answer": userData[i].report }; allSectionsJSON[p].qa.push(jsonObject);} 
					}
						
					else if (userData[i].qtype == "text-answer") { 

						if (userData[i].subdimension == "scope") { jsonObject = {"type": "scope", "question": "null", "answer": userData[i].answer}; allSectionsJSON[p].qa.push(jsonObject); }
						else if (userData[i].subdimension == "geo") { jsonObject = {"type": "geo", "question": "null", "answer": userData[i].answer}; allSectionsJSON[p].qa.push(jsonObject); }
						else if (userData[i].subdimension == "outputs") { jsonObject = {"type": "outputs", "question": "null", "answer": userData[i].answer}; allSectionsJSON[p].qa.push(jsonObject); }
						else if (userData[i].subdimension == "other") { jsonObject = {"type": "other", "question": "null", "answer": userData[i].answer}; allSectionsJSON[p].qa.push(jsonObject); }
						else if (userData[i].subdimension == "ref") { jsonObject = {"type": "ref", "question": "null", "answer": userData[i].answer}; allSectionsJSON[p].qa.push(jsonObject); }
						else if (userData[i].subdimension == "timing") { jsonObject = {"type": "timing", "question": "null", "answer": userData[i].answer}; allSectionsJSON[p].qa.push(jsonObject); }
						else if (userData[i].subdimension == "freq") { jsonObject = {"type": "freq", "question": "null", "answer": userData[i].answer}; allSectionsJSON[p].qa.push(jsonObject);}						
						else { jsonObject = {"type": "text", "question": "null", "answer": userData[i].answer}; allSectionsJSON[p].qa.push(jsonObject);} 					


					}
					else if (userData[i].qtype == "text-report-answer") { 

						if (userData[i].subdimension == "scope") { jsonObject = {"type": "scope", "question": "null", "answer": userData[i].report+userData[i].answer}; allSectionsJSON[p].qa.push(jsonObject); }
						else if (userData[i].subdimension == "geo") { jsonObject = {"type": "geo", "question": "null", "answer": userData[i].report+userData[i].answer}; allSectionsJSON[p].qa.push(jsonObject); }
						else if (userData[i].subdimension == "outputs") { jsonObject = {"type": "outputs", "question": "null", "answer":userData[i].report+userData[i].answer}; allSectionsJSON[p].qa.push(jsonObject); }
						else if (userData[i].subdimension == "other") { jsonObject = {"type": "other", "question": "null", "answer": userData[i].report+userData[i].answer}; allSectionsJSON[p].qa.push(jsonObject); }
						else if (userData[i].subdimension == "ref") { jsonObject = {"type": "ref", "question": "null", "answer": userData[i].report+userData[i].answer}; allSectionsJSON[p].qa.push(jsonObject); }
						else if (userData[i].subdimension == "timing") { jsonObject = {"type": "timing", "question": "null", "answer": userData[i].report+userData[i].answer}; allSectionsJSON[p].qa.push(jsonObject); }
						else if (userData[i].subdimension == "freq") { jsonObject = {"type": "freq", "question": "null", "answer": userData[i].report+userData[i].answer}; allSectionsJSON[p].qa.push(jsonObject);}						
						else { jsonObject = {"type": "text", "question": "null", "answer": userData[i].report+userData[i].answer}; allSectionsJSON[p].qa.push(jsonObject);} 

					}
					else if (userData[i].qtype == "links") { jsonObject = {"type": "links", "question": "null", "answer": userData[i].answer}; allSectionsJSON[p].qa.push(jsonObject);}
					else if (userData[i].qtype == "tick-report-answer") { jsonObject = {"type": "tick", "question": "null", "answer": userData[i].report+userData[i].answer}; allSectionsJSON[p].qa.push(jsonObject);}
					else if (userData[i].qtype == "cross-report-answer") { jsonObject = {"type": "cross", "question": "null", "answer": userData[i].report+userData[i].answer}; allSectionsJSON[p].qa.push(jsonObject);}
					
					
				}

			}
		}

	}

	identifySectionJSON.push({"question": "Data quality rating:", "answer": overallStarsWordDoc});
	
	localStorage.setItem("wordDocIdentify", JSON.stringify(identifySectionJSON));
	localStorage.setItem("wordDocAllSections", JSON.stringify(allSectionsJSON));
	localStorage.setItem("wordDocContact",  JSON.stringify(contactSectionJSON))

}