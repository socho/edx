var trackinglogs_to_mydataformat = function(dataArr) {
	var formattedArray = {};
	var quizProblems = [];

	for (var i in dataArr) {
		//the first item in the array of dictionaries should be a username
		if (!(dataArr[i].username in formattedArray)) {
			if (dataArr[i].event_type == "save_problem_check"){
					if (dataArr[i].event.success == "correct") {
						// { username: { problemID: attempts }}
						formattedArray[dataArr[i].username] = {};
						formattedArray[dataArr[i].username][dataArr[i].event.problem_id] = dataArr[i].event.attempts;

						if (quizProblems.indexOf(dataArr[i].event.problem_id) == -1) {
							quizProblems.push(dataArr[i].event.problem_id);
						}
					}
					 
			}
		}
		else if (dataArr[i].username in formattedArray) {
			if (dataArr[i].event_type == "save_problem_check"){
				if (dataArr[i].event.success == "correct") {
						// { username: { problemID: attempts } }
						if (dataArr[i].event.problem_id in formattedArray[dataArr[i].username]) {
							if ( dataArr[i].event.attempts <= formattedArray[dataArr[i].username][dataArr[i].event.problem_id]) {
								formattedArray[dataArr[i].username][dataArr[i].event.problem_id] = dataArr[i].event.attempts;
							}
						}
						else {
							if (quizProblems.indexOf(dataArr[i].event.problem_id) == -1) {
								quizProblems.push(dataArr[i].event.problem_id);
							}
							formattedArray[dataArr[i].username][dataArr[i].event.problem_id] = dataArr[i].event.attempts;					
						}
					}
			}
		}
	}
	quizProblems.sort();
	return [formattedArray, quizProblems];
}