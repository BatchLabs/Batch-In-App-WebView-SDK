function sendSurveyResult(result) {
	// here, you would call fetch() and call your survey result API
	return Promise.resolve();
}

function trackSurveyResultInBatch(response) {
    // Get the survey ID from the custom payload, in the "survey_id" key.
    batchInAppSDK.getCustomPayload().then((payload) => {
        // https://doc.batch.com/ios/advanced/custom-actions
        let eventParameters = {
            e: "survey_reply", // Event name
            a: { // Event attributes
                response: response
            }
        }

        // If we have a survey ID, set it as the event's label
        if (typeof payload["survey_id"] === "string") {
            eventParameters.l = payload["survey_id"];
        }
        batchInAppSDK.performAction("batch.user.event", eventParameters, response)
    });
}

function onSurveyButtonClick(result) {
    if (!result) {
        return;
    }
	sendSurveyResult(result)
		.catch(() => {})
		.then(() => {
			console.log("Dismissing");
            // Use 'result' (which is the button's "value" tag) for simplicity
            // In production, you should define proper analytics IDs as Batch
            // has the length of this identifier.

            if (result !== "later") {
                trackSurveyResultInBatch(result);
            } else {
			    batchInAppSDK.dismiss(result);
            }
		});
}

document.querySelectorAll("button").forEach(function(e) {
    e.addEventListener("click", function() {
        onSurveyButtonClick(e.value);
    });
});