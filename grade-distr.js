var gradeDistr = (function() {
  
    var exports = {};
  
////////////////////////////////// global variables 
//stuff goes here    
////////////////////////////////// helper functions
//stuff goes here

    function UpdateHandler() {
        var handlers = {};
        
        
        /*
        creates a new listener request
        event = event to listen to 
        callback = function to call in the case of the event
        */
        function on(event, callback) {
            var callbacks = handlers[event];
            if (callbacks === undefined) {
                callbacks = [];
            }
            callbacks.push(callback);
            handlers[event] = callbacks;
        }
        
         /*
        calls all functions that are listeners
        event = event that occured
        data = data to pass to the callback functions.
        */
        function trigger(event, data) {
            var callbacks = handlers[event];
            if (callbacks !== undefined) {
                for (var i = 0; i < callbacks.length; i += 1)
                    callbacks[i](data);
            }
        }
        
        return {on: on, trigger: trigger};
    }

    function Model(){
        var handler = UpdateHandler();


        //define peopleData
        var peopleData = {};
        for (var quiz in quizzes){
            console.log(quiz);
            var sheet = quizzes[quiz];
            for (var i = 0; i < sheet.length; i++) {
                var row = sheet[i];
                var name = row["username"];
                if (name in peopleData) {
                    peopleData[name][quiz] = row;
                }
                else {
                    peopleData[name]= {};
                    peopleData[name][quiz] = row;
                }
            }
        }

        function getPeopleData(){
            handler.trigger('getting ppl data', peopleData);
        }

        function getQuizData(quizname) {
            handler.trigger('getting quiz data', quizzes[quizname]);
        }

        /**
        bottomPct, topPct in percentage(%).
        **/
        function groupPeopleByAvr(assignment, lowPct, highPct) {
            var peopleArray = [];
            var bottomArray = [];
            var middleArray = [];
            var topArray = [];

            for (var key in peopleData) {
                if (assignment in peopleData[key]) {
                    peopleArray.push(peopleData[key]);
                }
            }

            //setup sorting function
            function orderByAvrAscending(a,b) {
                handler.trigger('avg asc', a["avr"] - b["avr"]);
            }
            peopleArray.sort(orderByAvrAscending); //sort
            // for (var i = 0; i < peopleArray.length; i++) {
            //     console.log(peopleArray[i]["avr"]);
            // }

            var totalNumPeople = peopleArray.length;
            for (var i = 0; i < totalNumPeople; i++){
                if (i < Math.round(totalNumPeople*lowPct/100)){bottomArray.push(peopleArray[i]);}
                else if (i < Math.round(totalNumPeople*highPct/100)){middleArray.push(peopleArray[i]);}
                else {topArray.push(peopleArray[i]);}
            }

            var threeArrays = [bottomArray,middleArray,topArray];
            var newThreeArrays = [[],[],[]];
            for (var index = 0; index < threeArrays.length; index++) {
                var thisArray = threeArrays[index];
                counter = [0,0,0,0,0,0,0,0,0,0];
                for (var i = 0; i < thisArray.length; i++){
                    var grade = parseInt(thisArray[i][assignment]["grade"]);
                    if (grade == 10) {counter[9] += 1;}
                    else {counter[grade] += 1;}
                }
                for (var i = 0; i < 10; i++){
                    newThreeArrays[index].push({"y":counter[i]});
                }
            }
           return newThreeArrays;
        }

        function calcAverage(quizzesOfInterest) {
            for (var person in peopleData){
                var personData = peopleData[person];
                personData["avr"] = 0;
                var sum = 0;
                for (var i = 0; i < quizzesOfInterest.length; i++){
                    var quizname = quizzesOfInterest[i];
                    if (quizname in personData) {
                        sum += parseFloat(personData[quizname]["grade"]);
                    }
                }
                var avr = sum / quizzesOfInterest.length;
                personData["avr"] = avr;
            }
            // console.log(peopleData["abundantchatter"]["avr"]);
        }

        return {getPeopleData: getPeopleData, getQuizData: getQuizData, calcAverage: calcAverage, groupPeopleByAvr: groupPeopleByAvr};
    }

    function Controller(model){


        function getPeopleData() {
            model.getPeopleData();
        }

        function getQuizData() {
            model.getQuizData();
        }

        function calcAverage(selectedQuizzes) {
            model.calcAverage(selectedQuizzes);
        }

        function groupPeopleByAvr(assignment, lowPct, highPct) {
            groupPeopleByAvr(assignment, lowPct, highPct);
        }
        
        return {getPeopleData: getPeopleData, getQuizData: getQuizData, calcAverage: calcAverage, groupPeopleByAvr: groupPeopleByAvr};
    }

    function View(div, model, controller){


        div.append(
         '<div class="container">'
        +   '<div class = "assignment-row">'
        +   '<div class = "btn-group">'
        +       '<button type = "button" class="btn btn-default btn-l"><span class="glyphicon glyphicon-chevron-left"></span></button>'
        +       '<div class = "btn-group">'
        +           '<button type = "button" class="btn btn-default dropdown-toggle" data-toggle = "dropdown">Assignment<span class="caret"></span></button>'
        +           '<ul class="dropdown-menu">'
        +           '</ul>'
        +       '</div>'
        +       '<button type = "button" class="btn btn-default btn-r"><span class="glyphicon glyphicon-chevron-right"></span></button>'
        +   '</div>'
        +'</div>'
        +'<div class = "body-content">'
        +   '<div class = "row">'
        +       '<div class="col-lg-8" id="column1"></div>'
        +       '<div class="col-lg-4" id="column2"></div>'
        +   '</div>'
        +'</div>'
        );

        // COLUMN 2

        var legend = $('<div id="legend"></div>');
        var labelLegend = $('<label for="legend"><h4>Legend:</h4></label>');
        var legendTable = $('<div id="legend-list"></div>')
        legend.css( {
            'background-color': '#fff',
            'border-radius': '10px',
            'width': '300px',
            'height': '150px',
            'padding': '5px',
            'margin-top': '5px'
        });

        var topBlock = $('<div id="topblock"><div style="float: left; margin-right: 15px; width: 20px; height: 20px; background-color: lightblue;"></div><p style="margin-left: 15px;"></p></div>');
        var middleBlock = $('<div id="middleblock"><div style="float: left; margin-right: 15px; width: 20px; height: 20px; background-color: darkgray;"></div><p style="margin-left: 15px;"></p></div>');
        var bottomBlock = $('<div id="bottomblock"><div style="float: left; margin-right: 15px; width: 20px; height: 20px; background-color: lightpink;"></div><p style="margin-left: 15px;"></p></div>');
        
        legendTable.css( {'margin-left': '20px', 'margin-top': '10px'} );
        legendTable.append(topBlock, middleBlock, bottomBlock);


        var checkboxes = $('<div id="checkboxes-div"></div>');
        var labelQuiz = $('<label for="ops"><h4>Averaged Over:</h4></label><br>');
        checkboxes.css( {
            'background-color': '#fff',
            'border-radius': '10px',
            'width': '300px',
            'height': '200px',
            'padding': '5px',
            'margin-top': '5px'
        });


        //slider
        var sliderDiv = $('<div id="sliderbg">');
        sliderDiv.css({ 
            'background-color': '#fff', 
            'border-radius': '10px', 
            'width': '300px', 
            'height': '95px',
            'padding': '0px 15px 0px 7px',
            'margin-top': '5px',
            'margin-bottom': '40px'
        });

        var sliderObj = $('<div id="slider">');
        var labelSlider = $('<p><label for="amount"><h4>Grade Range:</h4></label>\
            <input id="amount" style="width: 250px;\
                    border: 0;\
                    background-color: #fff;\
                    color: #f6931f;\
                    font-size: 12px;\
                    font-weight: bold;\
                    margin-bottom: -100px" /></p>');

        $('#column2').append(sliderDiv, legend, checkboxes);
        $('#sliderbg').append(labelSlider, sliderObj);
        $('#legend').append(labelLegend, legendTable);
        $('#checkboxes-div').append(labelQuiz);
        for (var key in quizzes) {
            var noSpaceKey = key.replace(/\s+/g, '');
            $('#checkboxes-div').append('<input style="margin-left: 20px; margin-bottom: 5px;" type="checkbox" value="' + noSpaceKey + '" name="' + noSpaceKey + '"> ' + key +  '<br>');
        }

        //adjusts the div height for the checkbox area
        var checkboxHeight = parseInt($('#checkboxes-div input').css('height').replace(/\D+/, ''));
        console.log($('#checkboxes-div').css('height', checkboxHeight* 15));


        sliderObj.slider({
            range: true,
            min: 0,
            max: 100,
            values: [ 25, 75 ],
            slide: function( event, ui ) {
                var min = 0;
                var max = 100;
                var mid = Math.abs(ui.values[1] - ui.values[0]);
                $( "#amount" ).val( "Bottom: %" + Math.abs(ui.values[0] - min) + ", Mid: %" + mid + ", Top: %" + Math.abs(max - ui.values[1]));
                $('#topblock p').html('Top ' + Math.abs(max - ui.values[1]) + '%');
                $('#middleblock p').html('Middle ' + mid + '%');
                $('#bottomblock p').html('Bottom ' + Math.abs(ui.values[0] - min) + '%');

                
            
            }
        }).slider('pips', {
             first: 'label',
            last: 'label',
            rest: false,
        });
        var bottom = Math.abs(sliderObj.slider("values", 0) - 0);
        var middle = Math.abs(sliderObj.slider("values", 1) - sliderObj.slider("values", 0));
        var top = Math.abs(100 - sliderObj.slider("values", 1));
        $( "#amount" ).val( "Bottom: %" + bottom + ", Mid: %" + middle + ", Top: %" + top );
        $('#topblock p').append('Top ' + top + '%');
        $('#middleblock p').append('Middle ' + middle + '%');
        $('#bottomblock p').append('Bottom ' + bottom + '%');

        
        

       //NAVIGATION
        var dropdown = $('.dropdown-menu');
        for (var key in quizzes) {
            var link = $('<li id="' + key + '"><a>' + key + '</a></li>');
            dropdown.append(link);
        } 

        ////////
        //temporary Column 1 stuff
        ////////
        $('#column1').append("<div class='chart-container'></div>");
        controller.calcAverage(["Quiz 21", "Quiz 22"]);
        var data = controller.groupPeopleByAvr("Quiz 25",30,70);

        var outerWidth = parseInt($('#column1').css("width"))-parseInt($('#column1').css("padding-left"))-parseInt($('#column1').css("padding-right"));
        var outerHeight = 600;

        var margin = { top: 20, right: 20, bottom: 40, left: 40 };

        var chartWidth = outerWidth - margin.left - margin.right;
        var chartHeight = outerHeight - margin.top - margin.bottom;

        var color_scale = d3.scale.ordinal().range(["lightpink", "darkgray", "lightblue"]);
        
        var stack = d3.layout.stack();
        var stackedData = stack(data);

        var yGroupMax = d3.max(stackedData, function(layer) { 
                            return d3.max(layer, function(d) { return d.y; })
                        });

        var yStackMax = d3.max(stackedData, function(layer) { 
                            return d3.max(layer, function(d) { return d.y + d.y0; })
                        });

        var xScale = d3.scale.ordinal()
            .domain(d3.range(data[0].length)).rangeBands([0, chartWidth]);

        var yScale = d3.scale.linear()
            .domain([0, yStackMax]).range([chartHeight, 0]);

        //INITIALIZE THE CHART

        var chart = d3.select(".chart-container")
            .append("svg")  
                .attr("class", "chart")
                .attr("height", outerHeight)
                .attr("width", outerWidth)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Y AXIS GRID LINES
        chart.selectAll("line").data(yScale.ticks(10))
            .enter().append("line")
            .attr("x1", 0)
            .attr("x2", chartWidth)
            .attr("y1", yScale)
            .attr("y2", yScale);

        //Y AXIS LABELS
        chart.selectAll(".yscale-label").data(yScale.ticks(10))
            .enter().append("text")
            .attr("class", "yscale-label")
            .attr("x", 0)
            .attr("y", yScale)
            .attr("dx", -margin.left/8)
            .attr("text-anchor", "end")
            .attr("dy", "0.3em")
            .text(String);
        
        chart.append("text")
            .attr("class", "yaxis-label")
            .attr("x",0)
            .attr("dx", -margin.left/4)
            .attr("y", chartHeight/2)
            .text("#Students");

        //X AXIS LABELS
        chart.selectAll(".xscale-label").data(xScale.domain())
            .enter().append("text")
            .attr("class", "xscale-label")
            .attr("x", function(d){return xScale(d);})
            .attr("y", chartHeight)
            .attr("text-anchor", "center")
            // .attr("dx", function(d){return xScale.rangeBand()/2;})
            .attr("dy", margin.bottom*0.5)
            .text(String);
        
        chart.append("text")
            .attr("class", "xaxis-label")
            .attr("x",chartWidth/2)
            .attr("y", chartHeight)
            .attr("dy", margin.bottom)
            .text("Grade");


        //grabs all the layers and forms groups out of them
        var layerGroups = chart.selectAll(".layer").data(stackedData)
            .enter().append("g")
            .attr("class", "layer")
            .style("fill", function(d,i){return color_scale(i);});

        //THE BARS (FOR STACKED BAR CHARTS)
        var rects = layerGroups.selectAll("rect").data(function(d) { return d; })
            .enter().append("rect")
            .attr("x", function(d, i) { return xScale(i); })
            .attr("y", function(d) { return yScale(d.y + d.y0) })
            .attr("width", xScale.rangeBand())
            .attr("height", function(d) { return yScale(d.y0) - yScale(d.y0 + d.y) });


        model.on()
    }

  //setup main structure of app
    function setup(div) {

        var model = Model();
        var controller = Controller(model);
        view = View(div, model, controller);
        
        exports.view = view; //delete later

    }
   
    exports.setup = setup;

    exports.model = Model; //delete later
    exports.control = Controller; //delete later

    return exports;

}());

$(document).ready(function() {
    gradeDistr.setup($('.gradeDistr'));

});