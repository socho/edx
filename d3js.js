$(document).ready(function() {

	// d3.select("body")
	// 	.append('p')
	// 	.text("New paragraph!");

	var dataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13, 
					11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];                       //Initialize empty array
	

	console.log(dataset);
	// d3.select('body').selectAll('p')
	// 	.data(dataset)
	// 	.enter()
	// 	.append('p')
	// 	.text(function(d) { 
	// 		return "I can count up to " + d; 
	// 	})
	// 	.style("color", function(d) {
	// 		if (d > 15) {
	// 			return "red";
	// 		} else {
	// 			return "black";
	// 		}
	// 	});

	// d3.select('body').selectAll('div')
	// 	.data(dataset)
	// 	.enter()
	// 	.append('div')
	// 	.attr('class', 'bar')
	// 	.style('height', function(d) {
	// 		var barHeight = d*5;
	// 		return barHeight + "px";
	// 	});

	var w = 500;
	var h = 100;
	var barPadding = 1;
	var svg = d3.select('body').append('svg');

	svg.attr("width", w)
		.attr("height", h);

	svg.selectAll('rect')
		.data(dataset)
		.enter()
		.append("rect")
		.attr("x", function(d,i) {
			return i* (w / dataset.length);
		})
		.attr("y", function(d) {
			return h-(d*4); //because the svg's will be upside down; height-data value
		})
		.attr("width", w / dataset.length - barPadding)
		.attr("height", function(d) {
			return d*4;
		})
		.attr('fill', function(d) {
			return "rgb(0, 0, " + (d*10) + ")";
		});

	svg.selectAll("text")
		.data(dataset)
		.enter()
		.append("text")
		.text(function(d) {
			return d;
		})
		.attr("x", function(d, i) {
        	return i * (w / dataset.length) + (w / dataset.length - barPadding) / 2;
   		})
   		.attr("y", function(d) {
        	return h - (d * 4) + 14;
   		})
   		.attr('font-family', 'sans-serif')
   		.attr('font-size', '11px')
   		.attr('fill', 'white')
   		.attr('text-anchor', 'middle');

	// var circles = svg.selectAll('circle')
	// 	.data(dataset)
	// 	.enter()
	// 	.append("circle");

	// circles.attr('cx', function(d,i) {
	// 	return (i*50) + 25;
	// 	})
	// 	.attr("cy", h/2)
	// 	.attr("r", function(d) {
	// 		return d;
	// 	})
	// 	.attr("fill", "yellow")
	// 	.attr("stroke", "orange")
	// 	.attr("stroke-width", function(d) {
 //    		return d/2;
	// 	});


	var dataset2 = [
	                  [ 5,     20 ],
	                  [ 480,   90 ],
	                  [ 250,   50 ],
	                  [ 100,   33 ],
	                  [ 330,   95 ],
	                  [ 410,   12 ],
	                  [ 475,   44 ],
	                  [ 25,    67 ],
	                  [ 85,    21 ],
	                  [ 220,   88 ]
              	];

    var svg2 = d3.select("body")
    				.append("svg")
    				.attr("width", w)
    				.attr("height", h);

    svg2.selectAll("circle")
    	.data(dataset2)
    	.enter()
    	.append("circle")
    	.attr("cx", function(d) {
    		return d[0];
    	})
    	.attr("cy", function(d) {
    		return d[1];
    	})
    	.attr("r", function(d) {
    		return Math.sqrt(h-d[1]);
    	});

    svg2.selectAll("text")
    	.data(dataset2)
    	.enter()
    	.append("text")
    	.text(function(d) {
    		return d[0] + "," + d[1];
    	})
    	.attr("x", function(d) {
    		return d[0];
    	})
    	.attr("y", function(d) {
    		return d[1];
    	})
    	.attr("font-family", "sans-serif")
    	.attr("font-size", "11px")
    	.attr("fill", "red");
});

