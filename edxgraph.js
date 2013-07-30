$(document).ready(function() {
	// var counter = 0;
	// for (var i = 0; i < quizdata["Quiz 21"].length; i++){
	// 	if (quizdata["Quiz 21"][i].reason && i != 0) {
	// 		counter++
	// 	}
		
	// }
	// console.log(counter);
	var gradeArray = []
	for (var i = 0; i < quizdata["Quiz 21"].length; i++) {
		if (quizdata["Quiz 21"][i].grade != null && i > 0 ) {
			gradeArray.push(parseInt(quizdata["Quiz 21"][i].grade));
		}
		
	}


	console.log(quizdata["Quiz 21"][0]);
	console.log(gradeArray);

	var studentGroups = { A: 0, B: 0, C: 0, D: 0, F: 0 };
	for (var i = 0; i < gradeArray.length; i++ ) {
		if (gradeArray[i] <= 5) {
			studentGroups["F"]++;
		}
		else if (gradeArray[i] == 6) {
			studentGroups["D"]++;
		}
		else if (gradeArray[i] == 7) {
			studentGroups["C"]++;
		}
		else if (gradeArray[i] == 8 ) {
			studentGroups["B"]++;
		}
		else if (gradeArray[i] >= 9 ) {
			studentGroups["A"]++;
		}
	}
	var values = []
	for (var key in studentGroups) {
		values.push(studentGroups[key]);
	}
	console.log(values);

	var w = 150;
	var h = 400;
	var barPadding = 1;
	var svg = d3.select('body').append('svg');

	svg.attr("width", w)
		.attr("height", h);

	svg.selectAll('rect')
		.data(values)
		.enter()
		.append("rect")
		.attr("x", function(d,i) {
			return i* (w / values.length);
		})
		.attr("y", function(d) {
			return h-(d*5); //because the svg's will be upside down; height-data value
		})
		.attr("width", w / values.length - barPadding)
		.attr("height", function(d) {
			return d*5;
		})
		.attr('fill', function(d) {
			return "rgb(0, 0, " + (d*10) + ")";
		});

	svg.selectAll("text")
		.data(values)
		.enter()
		.append("text")
		.text(function(d) {
			return d;
		})
		.attr("x", function(d, i) {
        	return i * (w / values.length) + (w / values.length - barPadding) / 2;
   		})
   		.attr("y", function(d) {
        	return h - (d * 5) + 10;
   		})
   		.attr('font-family', 'sans-serif')
   		.attr('font-size', '11px')
   		.attr('fill', 'white')
   		.attr('text-anchor', 'middle');
 
});