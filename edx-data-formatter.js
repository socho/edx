var trackinglogs_to_mydataformat = function(dataArr) {
	var formattedArray = {};

	for (var i in dataArr) {
		//the first item in the array of dictionaries should be a username
		if (!(dataArr[i].username in formattedArray)) {
			formattedArray[dataArr[i].username] = {};
			if (dataArr[i].event_type == "save_problem_check"){
					if (dataArr[i].event.success == "correct") {
						// { username: { problemID: attempts }}
						formattedArray[dataArr[i].username][dataArr[i].event.problem_id] = dataArr[i].event.attempts;
					}
					 
			}
		}
		else if (dataArr[i].username in formattedArray) {
			if (dataArr[i].event_type == "save_problem_check"){
				if (dataArr[i].event.success == "correct") {
						// { username: { problemID: attempts } }
						formattedArray[dataArr[i].username][dataArr[i].event.problem_id] = dataArr[i].event.attempts;
					}
			}
		}
	}
	return formattedArray;
}