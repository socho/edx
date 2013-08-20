var edxStudentModuleToMyFormat = function(courseware_studentmodule, course_id, module_type_array) {
	var data = {};
	for (var i = 0; i < courseware_studentmodule.length; i++) {
		var thisModule = courseware_studentmodule[i];
		if (thisModule["course_id"] == course_id) {
			for (var j = 0; j < module_type_array.length; j++) {
				var thisModuleType = module_type_array[j];
				if (thisModule["module_type"] == thisModuleType) {
					//if module_id not in data dictionary
					if (!(thisModule["module_id"] in data)) {
						data[thisModule["module_id"]] = [thisModule];
					}
					//if module_id already in data dictionary
					else {
						data[thisModule["module_id"]].push(thisModule);
					}
				}
			}
		}
	}
	return data;
}