var gradeDistr = (function() {
  
    var exports = {};

    var inNav = false; //checks to see if the user is clicking a link in the navigation box
  
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

        //////////////////////////////////////////////////////
        ////////////////Need to Manually Change///////////////
        //////////////////////////////////////////////////////

        //the student module file
        var courseware_studentmodule = dummymodule;
        //course_id you're interested in
        var course_id = "6.813";
        //an array of module_types you're interested in visualizing
        var module_type_array = ["problem"];

        //////////////////////////////////////////////////////
        /////////////////////////END//////////////////////////
        //////////////////////////////////////////////////////


        var quizzes = edxStudentModuleToMyFormat(courseware_studentmodule, course_id, module_type_array);

        //define peopleData
        var peopleData = {};
        for (var quiz in quizzes){
            var sheet = quizzes[quiz];
            for (var i = 0; i < sheet.length; i++) {
                var row = sheet[i];
                var name = row["student_id"];
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
            return peopleData;
        }

        function getQuizData(quizname) {
            
        }

        function getQuizzesArray() {
            var quizzesArray = [];
            for (var quiz in quizzes){
                quizzesArray.push(quiz);
            }
            return quizzesArray.sort();
        }

        /**
        Function that takes in the assignment name and
        returns an array of the assignment's [total number of people, average, st. dev.]
        **/
        function getBasicInfo(assignment) {
            //calc total num of students who completed the assignment
            var numPeople = 0;
            var sum = 0;
            for (var key in peopleData) {
                if (assignment in peopleData[key]) {
                    numPeople++;
                    sum += peopleData[key][assignment]["grade"];
                }
            }
            //calc average grade
            var avr = sum/numPeople;

            //calc std dev
            var sqDiffSum = 0;
            for (var key in peopleData) {
                if (assignment in peopleData[key]) {
                    sqDiffSum += Math.pow(parseFloat(peopleData[key][assignment]["grade"])-avr,2);
                }
            }
            var sd = Math.sqrt(sqDiffSum / numPeople);

            return [numPeople, avr*10, sd*10];           
        }

        /**
        Function that returns an array of
        [mean of all students' "avr" attribute, sd of all students' "avr" attributes]
        **/
        function getInfoOverAll() {
            var sum = 0; var numPeople = 0;
            for (var person in peopleData) {
                sum += peopleData[person]["avr"];
                numPeople += 1;
            }
            var avr = sum / numPeople;

            //sd
            var sqDiffSum = 0;
            for (var person in peopleData) {
                sqDiffSum += Math.pow(peopleData[person]["avr"]-avr,2);
            }
            var sd = Math.sqrt(sqDiffSum / numPeople);
            return [avr, sd];            
        }

        /**
        Function that returns data needed for d3 stacked bar graph.
        assignment the assignment name in String.
        bottomPct, topPct in percentage(%).
        returns an array of three arrays that represent each layer of the stacked bar graph.
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
                return a["avr"] - b["avr"];
            }
            peopleArray.sort(orderByAvrAscending);

            var totalNumPeople = peopleArray.length;
            for (var i = 0; i < totalNumPeople; i++){
                if (i < Math.round((totalNumPeople*lowPct)/100)){bottomArray.push(peopleArray[i]);}
                else if (i < Math.round((totalNumPeople*highPct)/100)){middleArray.push(peopleArray[i]);}
                else {topArray.push(peopleArray[i]);}
            }

            var threeArrays = [bottomArray,middleArray,topArray];
            var newThreeArrays = [[],[],[]];
            for (var index = 0; index < threeArrays.length; index++) {
                var thisArray = threeArrays[index];
                var counter = [];
                var groupedPeople = []; 
                for (var i = 0; i < 10; i++) {
                    counter.push(0);
                    groupedPeople.push([]);
                }
                for (var i = 0; i < thisArray.length; i++){
                    var grade = parseInt(thisArray[i][assignment]["grade"]);
                    if (grade == 10) {
                        counter[9] += 1;
                        groupedPeople[9].push(thisArray[i]);
                    }
                    else {
                        counter[grade] += 1;
                        groupedPeople[grade].push(thisArray[i]);
                    }
                }
                for (var i = 0; i < 10; i++){
                    newThreeArrays[index].push({"y":counter[i], "people": groupedPeople[i]});
                }
            }
            //handler.trigger('changed', [newThreeArrays, assignment]);
            return newThreeArrays;
        }

        /**
        Function that calculates each student's average grade, and store it as each student's "avr" attribute;
        the average grade is averaged over the quizzes in quizzesOfInterest (in this case, all the quizzes).
        If a student didn't take the quiz, give him a zero and calculate average.
        **/
        function calcAverage(quizzesOfInterest) {
            quizzesOfInterest = getQuizzesArray();
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
                if (quizzesOfInterest.length != 0){
                    var avr = sum / quizzesOfInterest.length;
                    personData["avr"] = avr;
                }
            }
        }

        /**
        Function that calculates each student's average grade, and store it as each student's "avr" attribute;
        the average grade is averaged over only the quizzes the students took.
        **/
        function calcAverage_nozeros() {
            var quizzesOfInterest = getQuizzesArray();
            for (var person in peopleData){
                var personData = peopleData[person];
                personData["avr"] = 0;
                var sum = 0;
                var numQuizzes = 0;
                for (var i = 0; i < quizzesOfInterest.length; i++){
                    var quizname = quizzesOfInterest[i];
                    if (quizname in personData) {
                        numQuizzes += 1;
                        sum += parseFloat(personData[quizname]["grade"]);
                    }
                }
                var avr = sum / numQuizzes;
                personData["avr"] = avr;
            }
        }

        // function updateRankScatterPlot(quizname) {
        //     handler.trigger('rank mode', [peopleData, quizname]);
        // }

        function updateAvrScatterPlot(quizname, parentDiv, outerWidth, outerHeight, margin, isSmall) {
            handler.trigger('avr mode', [quizname,parentDiv,outerWidth,outerHeight,margin,isSmall]);
        }
        
        function drawAllBarGraphs() {
            handler.trigger('view all bar');
        }
        function drawAllRankScatterPlots() {
            handler.trigger('view all rank scatter');
        }
        function drawAllAvrScatterPlots() {
            handler.trigger('view all avr scatter');
        }

        return {getInfoOverAll: getInfoOverAll, updateAvrScatterPlot: updateAvrScatterPlot, getPeopleData: getPeopleData, getQuizData: getQuizData, getQuizzesArray: getQuizzesArray, getBasicInfo: getBasicInfo, calcAverage: calcAverage, calcAverage_nozeros: calcAverage_nozeros, groupPeopleByAvr: groupPeopleByAvr, drawAllBarGraphs: drawAllBarGraphs, drawAllAvrScatterPlots: drawAllAvrScatterPlots, drawAllRankScatterPlots: drawAllRankScatterPlots, on: handler.on};
        //updateRankScatterPlot: updateRankScatterPlot
    }

    function Controller(model){
        function drawAllBarGraphs() {
            model.drawAllBarGraphs();
        }
        
        function updateAvrScatterPlot(quizname, parentDiv, outerWidth, outerHeight, margin, isSmall) {
            model.updateAvrScatterPlot(quizname, parentDiv, outerWidth, outerHeight, margin, isSmall);
        }

        function drawAllAvrScatterPlots() {
            model.drawAllAvrScatterPlots();
        }

        // function updateRankScatterPlot(quizname) {
        //     model.updateRankScatterPlot(quizname);
        // }

        function drawAllRankScatterPlots() {
            model.drawAllRankScatterPlots();
        }

        function getPeopleData() {
            model.getPeopleData();
        }

        function getQuizData() {
            model.getQuizData();
        }

        function getQuizzesArray() {
           return model.getQuizzesArray();
        }

        function getBasicInfo(assignment) {
            return model.getBasicInfo(assignment);
        }

        function calcAverage(selectedQuizzes) {
            model.calcAverage(selectedQuizzes);
        }

        function groupPeopleByAvr(assignment, lowPct, highPct) {
            return model.groupPeopleByAvr(assignment, lowPct, highPct);
        }
        
        return {drawAllBarGraphs: drawAllBarGraphs, updateAvrScatterPlot: updateAvrScatterPlot, drawAllAvrScatterPlots: drawAllAvrScatterPlots, drawAllRankScatterPlots: drawAllRankScatterPlots, getPeopleData: getPeopleData, getQuizData: getQuizData, getQuizzesArray: getQuizzesArray, getBasicInfo: getBasicInfo, calcAverage: calcAverage, groupPeopleByAvr: groupPeopleByAvr};
        //updateRankScatterPlot: updateRankScatterPlot,
    }

    function View(div, model, controller){


        div.append(
         '<div class="container">'
        +   '<div class = "assignment-row">'
        +   '<div class = "btn-group">'
        +       '<button type = "button" class="btn btn-default btn-l"><span class="glyphicon glyphicon-chevron-left"></span></button>'
        +       '<div class = "btn-group">'
        +           '<button id="asgn-nav" type = "button" class="btn btn-default dropdown-toggle" data-toggle = "dropdown">Quiz 21<span class="caret"></span></button>'
        +           '<ul class="dropdown-menu">'
        +           '</ul>'
        +       '</div>'
        +       '<button type = "button" class="btn btn-default btn-r"><span class="glyphicon glyphicon-chevron-right"></span></button>'
        +   '</div>'
        +'</div>'
        +'<div class = "body-content">'
        +   '<div class = "row">'
        +       '<div class="col-lg-8" id="column1">'
        // +           '<div class="chart-container"></div>'
        +       '</div>'
        +       '<div class="col-lg-4" id="column2"></div>'
        +   '</div>'
        +'</div>'
        );

        // COLUMN 2

        //slider
        var sliderDiv = $('<div id="sliderbg">');
 
        var sliderObj = $('<div id="slider">');

        //basic info
        var legend = $('<div id="legend"></div>');

        var totalLabel = $('<div id="total"><div>Number of Students: </div><p></p></div>');
        var averageLabel = $('<div id="average"><div style="display: inline;">Average: </div><p></p></div>');
        var sdLabel = $('<div id="sd"><div style="display: inline;">Standard Deviation: </div><p></p></div>');

        
        legend.append(totalLabel, averageLabel, sdLabel);
       
        var lowerLabel = $('<div id="lowerLabel"></div>');
        var upperLabel = $('<div id="upperLabel"></div>');



        $('#column2').append(sliderDiv, legend); // legend, checkboxes
        $('#sliderbg').append(sliderObj,lowerLabel, upperLabel);
        $('ui-slider-range ui-widget-header ui-corner-all').css("background", "darkgray");

        $("#lowerLabel").text(25);
        $("#lowerLabel").css('top',"-10px");
        $("#lowerLabel").css('left', String(0.01 * 25 * parseFloat($('#slider').css("width")) - 0.5 * parseFloat($("#lowerLabel").css("width")))+"px"); 
        $("#upperLabel").text(75);
        $("#upperLabel").css('top',"-10px");
        $("#upperLabel").css('left', String(0.01 * 75 * parseFloat($('#slider').css("width")) - parseFloat($("#lowerLabel").css("width")) - 0.5 * parseFloat($("#upperLabel").css("width")))+"px"); 

        
        function updateColors(values) {
            var colorstops = colors[0] + ", "; // start left with the first color
            for (var i=0; i< values.length; i++) {
                colorstops += colors[i] + " " + values[i] + "%,";
                colorstops += colors[i+1] + " " + values[i] + "%,";
            }
            // end with the last color to the right
            colorstops += colors[colors.length-1];

            /* Safari 5.1, Chrome 10+ */
            var css = '-webkit-linear-gradient(left,' + colorstops + ')';
            sliderObj.css('background-image', css);
        }

        var handlers = [25, 75]
        var colors = ["lightpink", "darkgray", "lightblue"];
        updateColors(handlers);

        sliderObj.slider({
            range: true,
            min: 0,
            max: 100,
            values: handlers,
            slide: function( event, ui ) {
                var min = 0;
                var max = 100;
                var bottom = Math.abs(ui.values[0] - min);
                var mid = Math.abs(ui.values[1]-ui.values[1]);
                var top = Math.abs(max - ui.values[1]);
                $("#lowerLabel").text(bottom);
                $("#lowerLabel").css('top',"-10px");
                $("#lowerLabel").css('left', String(0.01 * bottom * parseFloat($('#slider').css("width")) - 0.5 * parseFloat($("#lowerLabel").css("width")))+"px"); 
                $("#upperLabel").text(max-top);
                $("#upperLabel").css('top',"-10px");
                $("#upperLabel").css('left', String(0.01 * (max-top) * parseFloat($('#slider').css("width")) - parseFloat($("#lowerLabel").css("width")) - 0.5 * parseFloat($("#upperLabel").css("width")))+"px"); 
                updateColors(ui.values);
                var currentQuiz = $('#asgn-nav').text();
                if (currentQuiz != "ViewAll") {updateBarGraph([controller.groupPeopleByAvr($('#asgn-nav').text(), bottom, max-top),$('#asgn-nav').text()]);}
                else { //when clicks View All
                    controller.drawAllBarGraphs();
                }
            }
        }).slider('pips', {
             first: 'label',
            last: 'label',
            rest: false,
        });
        var bottom = Math.abs(sliderObj.slider("values", 0) - 0);
        var middle = Math.abs(sliderObj.slider("values", 1) - sliderObj.slider("values", 0));
        var top = Math.abs(100 - sliderObj.slider("values", 1));
        


        function displayBasicInfo(assignment) {
            var info = controller.getBasicInfo(assignment); 
            $('#total p').text(info[0]);
            $('#average p').text(info[1].toFixed(3));
            $('#sd p').text(info[2].toFixed(3));
        }

        displayBasicInfo("Quiz 21");

        //.css({ 'border': '1px solid #aaaaaa', 'background': 'lightpink' });
        // #slider-container #slider-max-value {float:right;margin-top:6px;}


        //MODE BUTTONS
        var modes = $('<ul class="nav nav-tabs"></ul>');
        var leftButton = $('<li class="active"><a href="#">Percentiles</a></li>');
        // var middleButton = $('<li><a href="#">Ranking</a></li>');
        var rightButton = $('<li><a href="#">Normalized</a></li>');

        modes.append(leftButton, rightButton); //middleButton, 
        modes.css('padding', 'auto auto');
        $('#column2').prepend(modes);

        var modeBools = [true, false, false];

        leftButton.on('click', function() {
            leftButton.attr("class","active");
            // middleButton.attr("class","");
            rightButton.attr("class","");
            modeBools[0] = true;
            modeBools[1] = false;
            modeBools[2] = false;
            sliderDiv.show();
            var quizname = $('#asgn-nav').text();
            if (quizname == "ViewAll") {
                controller.drawAllBarGraphs();
            }
            else {
                controller.calcAverage();
                bottom = Math.abs(sliderObj.slider("values", 0) - 0);
                top = Math.abs(100 - sliderObj.slider("values", 1));
                controller.groupPeopleByAvr(quizname, bottom, 100-top);
                displayBasicInfo(quizname);
                drawInitialGraph(quizname, "#column1", bar_outerWidth, bar_outerHeight, bar_margin, 0, false);
            }
        });

        // middleButton.on('click', function() {
        //     middleButton.attr("class","active");
        //     leftButton.attr("class","");
        //     rightButton.attr("class","");
        //     modeBools[0] = false;
        //     modeBools[1] = true;
        //     modeBools[2] = false;
        //     sliderDiv.hide();
        //     var quizname = $('#asgn-nav').text();
        //     if (quizname == "ViewAll") {
        //         quizname = model.getQuizzesArray()[0];
        //     }
        //     controller.calcAverage();
        //     controller.updateRankScatterPlot(quizname);
        //     displayBasicInfo(quizname);
        //     $('#asgn-nav').html(quizname+"<span class='caret'></span>");
        // });

        rightButton.on('click', function() {
            rightButton.attr("class","active");
            // middleButton.attr("class","");
            leftButton.attr("class","");
            modeBools[0] = false;
            modeBools[1] = false;
            modeBools[2] = true;
            sliderDiv.hide();
            var quizname = $('#asgn-nav').text();
            if (quizname == "ViewAll") {
                controller.drawAllAvrScatterPlots();
            }
            else {         
                $('.btn-l').attr("disabled",false); $('.btn-r').attr("disabled",false);
                displayBasicInfo(quizname);
                controller.updateAvrScatterPlot(quizname,'#column1',avr_outerWidth,avr_outerHeight,avr_margin,false);
            }
        })

       //NAVIGATION
        var dropdown = $('.dropdown-menu');
        for (var i = 0; i < model.getQuizzesArray().length; i++) {
            var key = model.getQuizzesArray()[i];
            var link = $('<li id="' + key + '"><a>' + key + '</a></li>');
            dropdown.append(link);
        }
        dropdown.append("<li id='ViewAll'><a>View All</a></li>");

        ////////
        //setup variables for Graph
        ////////

        //variables for bar graph
        var bar_outerWidth = parseInt($('#column1').css("width"))-parseInt($('#column1').css("padding-left"))-parseInt($('#column1').css("padding-right"));
        var bar_outerHeight = $(document).height()-$('.assignment-row').height()-parseInt($('.container').css("margin-top"))-parseInt($('#column1').css("padding-top"));

        var bar_margin = { top: 20, right: 20, bottom: 40, left: 40 };

        var bar_chartWidth = bar_outerWidth - bar_margin.left - bar_margin.right;
        var bar_chartHeight = bar_outerHeight - bar_margin.top - bar_margin.bottom;

        var bar_color_scale = d3.scale.ordinal().range(["lightpink", "darkgray", "lightblue"]);

        //variables for rank graph
        var rank_outerWidth = parseInt($('#column1').css("width"))-parseInt($('#column1').css("padding-left"))-parseInt($('#column1').css("padding-right"));
        var rank_outerHeight = $(document).height()-$('.assignment-row').height()-parseInt($('.container').css("margin-top"))-parseInt($('#column1').css("padding-top"));

        var rank_margin = { top: 20, right: 20, bottom: 40, left: 40 };

        var rank_chartWidth = rank_outerWidth - rank_margin.left - rank_margin.right;
        var rank_chartHeight = rank_outerHeight - rank_margin.top - rank_margin.bottom;

        //variables for avr scatter
        var avr_outerWidth = parseInt($('#column1').css("width"))-parseInt($('#column1').css("padding-left"))-parseInt($('#column1').css("padding-right"));
        var avr_outerHeight = $(document).height()-$('.assignment-row').height()-parseInt($('.container').css("margin-top"))-parseInt($('#column1').css("padding-top"));

        var avr_margin = { top: 20, right: 20, bottom: 60, left: 50 };

        //"#column1", bar_outerWidth, bar_outerHeight, bar_margin
        function drawInitialGraph(quizname, parentDiv, outerWidth, outerHeight, margin, maxY, isSmall) { //assignment, quizzesOfInterest, lowPct, highPct,             
            var chartWidth = outerWidth - margin.left - margin.right;
            var chartHeight = outerHeight - margin.top - margin.bottom;
            
            if (!isSmall) {
                $('#column1').children().remove();
                $('#legend').show();
            }
            //INITIALIZE THE CHART
            var chart = d3.select(parentDiv)
                .append("svg")  
                    .attr("class", "chart")
                    .attr("height", outerHeight)
                    .attr("width", outerWidth)
                .append("g")
                    .attr("class", "innerChart")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //Y-AXIS LABEL
            if (!isSmall) {
                chart.append("text")
                .attr("class", "yaxis-label")
                .attr("x",0)
                .attr("y", 0)
                .attr("transform", function(d) {return "rotate(-90)" })
                .attr("dx", -chartHeight/2)
                .attr("dy", -margin.left*0.75)
                .attr("font-weight", "bold")
                .attr("text-anchor", "middle")
                .text("Number of Students");
            }

            controller.calcAverage(quizname);

            var data = model.groupPeopleByAvr(quizname, bottom, 100-top); //need to ask question
            // console.log('data: ', data);
            var stack = d3.layout.stack();
            var stackedData = stack(data);

            var yStackMax = d3.max(stackedData, function(layer) { 
                                return d3.max(layer, function(d) { return d.y + d.y0; })
                            });

            var xScale = d3.scale.ordinal()
                .domain(d3.range(data[0].length)).rangeBands([0, chartWidth]);

            if (isSmall){yStackMax = maxY;}
            var yScale = d3.scale.linear()
                .domain([0, yStackMax]).range([chartHeight, 0]);

            // Y AXIS GRID LINES
            chart.selectAll("line").data(yScale.ticks(10))
                .enter().append("line")
                .attr("x1", 0)
                .attr("x2", chartWidth)
                .attr("y1", yScale)
                .attr("y2", yScale);

            //Y TICK MARKS
            var yscale_label = chart.selectAll(".yscale-label").data(yScale.ticks(10))
                                    .enter().append("text")
                                    .attr("x", 0)
                                    .attr("y", yScale)
                                    .attr("dx", -margin.left/8)
                                    .attr("text-anchor", "end")
                                    .attr("dy", "0.3em")
                                    .text(String);  
            if (!isSmall) {
                yscale_label.attr("class", "yscale-label")
            }else {
                yscale_label.attr("class", "small-yscale-label")
            }       

            //X TICK MARKS
            var xscale_label = chart.selectAll(".xscale-label").data(xScale.domain())
                                    .enter().append("text")
                                    .attr("x", function(d){return xScale(d);})
                                    .attr("y", chartHeight)
                                    .attr("text-anchor", "center")
                                    // .attr("dx", function(d){return xScale.rangeBand()/2;})
                                    .attr("dy", margin.bottom*0.4)
                                    .text(function(d){return String(d*10);});
            if (!isSmall) {
                xscale_label.attr("class", "xscale-label");
            }else {
                xscale_label.attr("class", "small-xscale-label");
            }

            //X-AXIS LABEL
            if (!isSmall) {
                chart.append("text")
                .attr("class", "xaxis-label")
                .attr("x", chartWidth/2)
                .attr("y", chartHeight)
                .attr("dy", margin.bottom*0.85)
                .attr("font-weight", "bold")
                .attr("text-anchor", "middle")
                .text("Grade for " + quizname + " (%)");
            }
            
            //grabs all the layers and forms groups out of them
            var layerGroups = chart.selectAll(".layer").data(stackedData)
                .enter().append("g")
                .attr("class", "layer")
                .style("fill", function(d,i){return bar_color_scale(i);});

            //THE BARS (FOR STACKED BAR CHARTS)
            var rects = layerGroups.selectAll("rect").data(function(d) { return d; })
                .enter().append("rect")
                .attr("x", function(d, i) { return xScale(i); })
                .attr("y", function(d) { return yScale(d.y + d.y0) })
                .attr("width", xScale.rangeBand())
                .attr("height", function(d) { return yScale(d.y0) - yScale(d.y0 + d.y) });

            // Title
            if (isSmall){   
                chart.append("text")
                    .attr("class","title")
                    .attr("x", chartWidth/2)
                    .attr("y", chartHeight*0.03)
                    .text(quizname);
            }

        }

        drawInitialGraph($('#asgn-nav').text(),"#column1", bar_outerWidth, bar_outerHeight, bar_margin, 0, false);

        function updateBarGraph(dataArray){
            var quizname = dataArray[1];
            var data = dataArray[0];
            var stack = d3.layout.stack();
            var stackedData = stack(data);

        
            var yGroupMax = d3.max(stackedData, function(layer) { 
                                return d3.max(layer, function(d) { return d.y; })
                            });

            var yStackMax = d3.max(stackedData, function(layer) { 
                                return d3.max(layer, function(d) { return d.y + d.y0; })
                            });

            var xScale = d3.scale.ordinal()
                .domain(d3.range(data[0].length)).rangeBands([0, bar_chartWidth]);

            var yScale = d3.scale.linear()
                .domain([0, yStackMax]).range([bar_chartHeight, 0]);


            // Y AXIS GRID LINES
            var chart = d3.select('g');
            if (chart.selectAll("line")[0].length > yScale.ticks(10).length){
                chart.selectAll("line").data(yScale.ticks(10))
                    .exit()
                    .remove();

                chart.selectAll("line").data(yScale.ticks(10))
                    .transition()
                    .attr("x1", 0)
                    .attr("x2", bar_chartWidth)
                    .attr("y1", yScale)
                    .attr("y2", yScale)
                }
            else {
                chart.selectAll("line").data(yScale.ticks(10))
                    .enter().append("line");

                chart.selectAll("line")
                    .transition()
                    .attr("x1", 0)
                    .attr("x2", bar_chartWidth)
                    .attr("y1", yScale)
                    .attr("y2", yScale)
              
            }

            //Y TICK MARKS
            chart.selectAll(".yscale-label").remove();
            chart.selectAll(".yscale-label").data(yScale.ticks(10))
                .enter().append("text")
                .attr("class", "yscale-label")
                .attr("x", 0)
                .attr("y", yScale)
                .attr("dx", -bar_margin.left/8)
                .attr("text-anchor", "end")
                .attr("dy", "0.3em")
                .text(String);            

            //X TICK MARKS
            chart.selectAll(".xscale-label").remove();
            chart.selectAll(".xscale-label").data(xScale.domain())
                .enter().append("text")
                .attr("class", "xscale-label")
                .attr("x", function(d){return xScale(d);})
                .attr("y", bar_chartHeight)
                .attr("text-anchor", "center")
                // .attr("dx", function(d){return xScale.rangeBand()/2;})
                .attr("dy", bar_margin.bottom*0.5)
                .text(function(d){return String(d*10);});

            //X-AXIS LABEL
            $('.xaxis-label').remove();
            chart.append("text")
                .attr("class", "xaxis-label")
                .attr("x",bar_chartWidth/2)
                .attr("y", bar_chartHeight)
                .attr("dy", bar_margin.bottom*0.85)
                .attr("font-weight", "bold")
                .attr("text-anchor", "middle")
                .text("Grade for " + quizname + " (%)");
            
            //grabs all the layers and forms groups out of them
            var layerGroups = chart.selectAll(".layer").data(stackedData)
                .style("fill", function(d,i){return bar_color_scale(i);});

            //THE BARS (FOR STACKED BAR CHARTS)
            var rects = layerGroups.selectAll("rect").data(function(d) { return d; })
                .transition().duration(500)
                .attr("x", function(d, i) { return xScale(i); })
                .attr("y", function(d) { return yScale(d.y + d.y0) })
                .attr("width", xScale.rangeBand())
                .attr("height", function(d) { return yScale(d.y0) - yScale(d.y0 + d.y) });
        }

        function drawAllBarGraphs(){
            $('#legend').hide();
            $('#column1').children().remove();
            var quizzesArray = controller.getQuizzesArray();

            var numCols = 3;
            var numRows = Math.ceil(quizzesArray.length/numCols);

            for (var i = 0; i < numRows; i++) {
                var thisrow = $("<div class='bar-row-"+i+"'></div>");
                for (var j=0; j < numCols; j++) {
                    if (i*numCols+j < quizzesArray.length) {
                        thisrow.append("<div class='col-lg-4 bar-col-"+j+"'></div>");
                    }
                }
                $('#column1').append(thisrow);
            }

            //calculate absolute max y value of all plots
            var overallMaxYStack = 0;
            for (var i = 0; i < numRows; i++) {
                for (var j=0; j < numCols; j++) {
                    if (i*numCols+j < quizzesArray.length) {
                        var thisQuiz = quizzesArray[i*numCols+j];
                        controller.calcAverage(thisQuiz);
                        bottom = Math.abs(sliderObj.slider("values", 0) - 0);
                        top = Math.abs(100 - sliderObj.slider("values", 1));
                        var data = model.groupPeopleByAvr(thisQuiz, bottom, 100-top); //need to ask question
                        var stack = d3.layout.stack();
                        var stackedData = stack(data);
                        var yStackMax = d3.max(stackedData, function(layer) { 
                                            return d3.max(layer, function(d) { return d.y + d.y0; })
                                        });
                        if (yStackMax > overallMaxYStack) {overallMaxYStack = yStackMax;}
                    }
                }
            }

            //iterate through each grid div and append a bar graph to each
            for (var i = 0; i < numRows; i++) {
                for (var j=0; j < numCols; j++) {
                    if (i*numCols+j < quizzesArray.length) {
                        var quizname = quizzesArray[i*numCols+j];
                        var parentDiv = ".bar-row-"+i+" .bar-col-"+j;
                        var outerWidth = parseInt($('.bar-row-'+i+' .bar-col-'+j).css("width"));
                        var outerHeight = $(document).height()/3;
                        var margin = { top: 10, right: 5, bottom: 20, left: 10};
                        drawInitialGraph(quizname, parentDiv, outerWidth, outerHeight, margin, overallMaxYStack, true);
                    }
                }
            }
            //x and y axes labels
            var allbars_xaxislabel = d3.select('#column1').append("div")
                            .attr("class", "viewall-xaxislabel")
                            .text("Grade for Each Quiz (%)");   
            // allbars_xaxislabel.attr();        
            d3.select('#column1').append("div")
                            .attr("class", "viewall-yaxislabel")
                            .text("Number of Students");            
        }

        // function updateRankScatterPlot(dataArray) {
        //     $('#legend').show();
        //     var quizname = dataArray[1]; 

        //     function sortByRank(object) {
        //         var sorted = [];
        //         var sorted2 = [];
        //         var result = [];
        //         for (var obj in object) {
        //             sorted.push([object[obj].username, [object[obj].avr, object[obj].grade]]);
        //             sorted2.push([object[obj].username, object[obj].avr]);
        //         }
        //         sorted.sort(function(a,b) {return a[1][1]-b[1][1]});
        //         sorted2.sort(function(a,b) {return a[1]-b[1]});

        //         for (var i = 0; i < sorted.length; i++) {
        //             result.push({"username": sorted[i][0], "avr": sorted[i][1][0], "grade": sorted[i][1][1], "graderank": sorted.length-i});
        //         }

        //         result.sort(function(a,b) {return a["avr"]-b["avr"]});

        //         for (var index in result) {
        //             result[index]["avrrank"] = result.length-index;
        //         }
                
        //         return result;
        //     }
            
        //     d3.select("svg").remove();

        //     var dataset = [];
        //     var dataDict = dataArray[0];

        //     for (var person in dataDict) {
        //         if (quizname in dataDict[person]){
        //         dataset.push({"username": person ,"grade": dataDict[person][quizname]["grade"], "avr": dataDict[person]["avr"]});
                
        //         }
        //     }
            


        //     var info = controller.getBasicInfo(quizname);
        //     // var result = sortByRank(dataset, "avr"); //sorted by avg
        //     var result2 = sortByRank(dataset); //sorted by grade

        //     var tooltip = d3.select("body").append("div")   
        //         .attr("class", "tooltip")               
        //         .style("opacity", 0);

        //     var xScale = d3.scale.linear() //scale is a function!!!!!
        //                     .domain([info[0], 0])
        //                     .range([rank_margin.left,rank_outerWidth-rank_margin.right]);
        //     var yScale = d3.scale.linear() //scale is a function!!!!!
        //                     .domain([info[0], 0])
        //                     .range([rank_outerHeight-rank_margin.bottom,rank_margin.top]);

        //     var xAxis = d3.svg.axis()
        //                     .scale(xScale)
        //                     .orient("bottom")
        //                     .ticks(10);
        //     var yAxis = d3.svg.axis()
        //                     .scale(yScale)
        //                     .orient("left")
        //                     .ticks(10);


        //     var svg = d3.select("#column1").append("svg")
        //                 .attr("width",rank_outerWidth)
        //                 .attr("height",rank_outerHeight);



        //     svg.append("line")
        //         .attr("class", "diagonal")
        //         .attr('x1', rank_margin.left)
        //         .attr('x2', rank_outerWidth-rank_margin.right)
        //         .attr('y1', rank_outerHeight-rank_margin.bottom)
        //         .attr('y2', rank_margin.top)

        //     //help text
        //     var helptext = svg.append("g")
        //                         .attr("class", "helptext");
        //     var x = $('.diagonal').attr("x2");
        //     var y = $('.diagonal').attr("y2");

        //     helptext.append("text")
        //             .attr("x", x)
        //             .attr("y", y)
        //             .attr("dx", -rank_chartWidth/10)
        //             .attr("dy", 20)
        //             .text("better than")
        //             .append("tspan")
        //             .text("usual")
        //             .attr("x",x)
        //             .attr("dx", -rank_chartWidth/10)
        //             .attr("dy", 12);
        //     helptext.append("text")
        //             .attr("x", x)
        //             .attr("y", y)
        //             .attr("dx", -0.5 * $('text').width())
        //             .attr("dy", 0.15*rank_chartHeight)
        //             .text("worse than")
        //             .append("tspan")
        //             .text("usual")
        //             .attr("x", x)
        //             .attr("dx", -0.5 * $('text').width())
        //             .attr("dy", 12);


        //     svg.selectAll("circle")
        //         .data(result2)
        //         .enter()
        //         .append("circle")
        //         .attr("class","datapoints")
        //         .attr("cx", function(d){
        //             return xScale(d["avrrank"]);
        //         })
        //         .attr("cy", function(d){
        //             return yScale(d["graderank"]);
        //         })
        //         .attr("r", 3);

        //     $('svg circle').tipsy({ 
        //         gravity: 's', 
        //         html: true, 
        //         title: function() {
        //             var d = this.__data__;
        //             return d["username"] + "<br/>Rank for " + quizname +": "  + d["graderank"] + "<br/>Avg Quiz Score: "  + d["avr"].toFixed(2) + "<br/>Grade For " + quizname+ ": "  + parseFloat(d["grade"]); 
        //         }
        //     });

        //     svg.append("g")
        //         .attr("class","axis")
        //         .attr("transform", "translate(0,"+(rank_outerHeight-rank_margin.bottom)+")")
        //         .call(xAxis);

        //     svg.append("g")
        //         .attr("class","axis")
        //         .attr("transform", "translate("+rank_margin.left+",0)")
        //         .call(yAxis);

        //     //X-AXIS LABEL
        //     svg.append("text")
        //         .attr("class", "xaxis-label")
        //         // .attr("x",chartWidth/2)
        //         .attr("x", rank_outerWidth/2)
        //         .attr("y", rank_chartHeight+avr_margin.top)
        //         .attr("dy", rank_margin.bottom*0.9)
        //         .attr("font-weight", "bold")
        //         .attr("text-anchor", "middle")
        //         .text("Overall Rank");

        //     //Y-AXIS LABEL
        //     svg.append("text")
        //         .attr("class", "yaxis-label")
        //         .attr("x",0)
        //         .attr("y", 0)
        //         .attr("transform", function(d) {return "rotate(-90)" })
        //         .attr("dx", -rank_margin.top-rank_chartHeight/2)
        //         .attr("dy", rank_margin.left*0.2)
        //         .attr("font-weight", "bold")
        //         .attr("text-anchor", "middle")
        //         .text("Rank for "+ quizname);
        // }

        // function drawAllRankScatterPlots() {

        // }

        function updateAvrScatterPlot(quizname, parentDiv, outerWidth, outerHeight, margin, isSmall) {
            var chartWidth = outerWidth - margin.left - margin.right;
            var chartHeight = outerHeight - margin.top - margin.bottom;

            if (!isSmall) {
                $('#column1').children().remove();
                $('#legend').show();
            } //remove previous existing svg if drawing big plot

            model.calcAverage_nozeros();
            var dataset = [];
            var dataDict = model.getPeopleData();
            for (var person in dataDict) {
                if (quizname in dataDict[person]){
                    dataset.push({"student_id": person ,"grade": dataDict[person][quizname]["grade"], "avr": dataDict[person]["avr"]});
                }
            }

            var tooltip = d3.select("body").append("div")   
                .attr("class", "tooltip")               
                .style("opacity", 0);

            var info = model.getBasicInfo(quizname);
            var infoOverall = model.getInfoOverAll();
            var avrOverall = infoOverall[0];
            var sdOverall = infoOverall[1];

            var maxgradezscore = d3.max(dataset, function(d){return Math.abs(10*d["grade"]-info[1])/info[2];});
            var maxavrzscore = d3.max(dataset, function(d){return Math.abs(d["avr"]-avrOverall)/sdOverall;});
            var maxzscore = Math.max(maxavrzscore, maxgradezscore);

            var xScale = d3.scale.linear() //scale is a function!!!!!
                            .domain([10*(avrOverall-maxzscore*sdOverall),10*(avrOverall+maxzscore*sdOverall)])
                            .range([margin.left,outerWidth-margin.right])
                            .clamp(true);
            var yScale = d3.scale.linear() //scale is a function!!!!!
                            //.domain([Math.max(0,10*(info[1]-d3.max(dataset, function(d){return Math.abs(info[1]-d["grade"]);}))),Math.min(100,10*(info[1]+d3.max(dataset, function(d){return Math.abs(info[1]-d["grade"]);})))])
                            .domain([info[1]-maxzscore*info[2],info[1]+maxzscore*info[2]])
                            .range([outerHeight-margin.bottom,margin.top])
                            .clamp(true);

            var xtoyScale = d3.scale.linear()
                                .domain([10*(avrOverall-3*sdOverall),10*(avrOverall+3*sdOverall)])
                                .range([(info[1]-3*info[2]),(info[1]+3*info[2])]);
            var xaxisData = [];
            var yaxisData = [];
            for (var i = -2; i <= 2; i++) {
                xaxisData.push(Math.max(Math.min((avrOverall + i * sdOverall)*10,100),0));
                //yaxisData.push(Math.max(Math.min((info[1] + i * info[2])*10,100),0));
                yaxisData.push((info[1] + i * info[2]));
            }

            var xAxis = d3.svg.axis()
                            .scale(xScale)
                            .orient("bottom")
                            .tickValues(xaxisData)

            var yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient("left")
                            .tickValues(yaxisData)

            var svg = d3.select(parentDiv).append("svg")
                        .attr("width",outerWidth)
                        .attr("height",outerHeight);

            //diagonal line
            var diag = svg.append("line")
                .attr("class","diagonal")
                .attr("id", "diagonal");
            var xmin = xScale.domain()[0];
            var xmax = xScale.domain()[1];
            var ymin = yScale.domain()[0];
            var ymax = yScale.domain()[1];
            if (xtoyScale(xmin) < ymin) {
                diag.attr("x1", xScale(xtoyScale.invert(ymin)));
                diag.attr("y1", yScale(ymin));
            }
            else {
                diag.attr("x1", xScale(xmin));
                diag.attr("y1", yScale(xtoyScale(xmin)));                
            }
            if (xtoyScale(xmax) < ymax) {
                diag.attr("x2", xScale(xmax));
                diag.attr("y2", yScale(xtoyScale(xmax)));
            }
            else {
                diag.attr("x2", xScale(xtoyScale.invert(ymax)));
                diag.attr("y2", yScale(ymax));                
            }

            //help text only when drawing big plot
            if (!isSmall) {
                //help text
                var helptext = svg.append("g")
                                    .attr("class", "helptext");
                var x = $('.diagonal').attr("x2");
                var y = $('.diagonal').attr("y2");

                helptext.append("text")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dx", -chartWidth/10)
                        .attr("dy", chartHeight/30)
                        .text("better than")
                        .append("tspan")
                        .text("usual")
                        .attr("x",x)
                        .attr("dx", -chartWidth/10)
                        .attr("dy", 12);
                helptext.append("text")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dx", -0.5 * $('text').width())
                        .attr("dy", 0.15*chartHeight)
                        .text("worse than")
                        .append("tspan")
                        .text("usual")
                        .attr("x", x)
                        .attr("dx", -0.5 * $('text').width())
                    .attr("dy", 12);
            }

            //dots with jittering
            svg.selectAll("circle")
                .data(dataset)
                .enter()
                .append("circle")
                .attr("class","datapoints")
                .attr("cx", function(d){
                    return xScale(10*d["avr"]+Math.random()/2);
                })
                .attr("cy", function(d){
                    return yScale(10*d["grade"]+Math.random()/2);
                })
                .attr("r", 3);

            //max line
            svg.append("line")
                .attr("class","maxline")
                .attr("x1",xScale.range()[0])
                .attr("y1",yScale(100+0.5))
                .attr("x2",xScale.range()[1])
                .attr("y2",yScale(100+0.5));

            //max label
            var maxlabel = svg.append("text")
                .attr("x",xScale.range()[0])
                .attr("y",yScale(100+0.5))
                .attr("dx",5)
                .attr("dy",-5)
                .text("max possible grade")
            if (!isSmall) {
                maxlabel.attr("class", "maxlabel")
            }else {
                maxlabel.attr("class","small-maxlabel")
            }

            //x and y axes for big plot
            if (!isSmall) {
                //xaxis
                svg.append("g")
                    .attr("class","axis")
                    .attr("transform", "translate(0,"+(outerHeight-margin.bottom)+")")
                    .call(xAxis);

                //yaxis
                svg.append("g")
                    .attr("class","axis")
                    .attr("transform", "translate("+margin.left+",0)")
                    .call(yAxis);
            }

            //x and y axes for mini plots
            else {
                //xaxis
                svg.append("g")
                    .attr("class","small-axis")
                    .attr("transform", "translate(0,"+(outerHeight-margin.bottom)+")")
                    .call(xAxis);

                //yaxis
                svg.append("g")
                    .attr("class","small-axis")
                    .attr("transform", "translate("+margin.left+",0)")
                    .call(yAxis);                
            }

            //x and y axes labels only when drawing big plot
            if (!isSmall) {
                //Y-AXIS LABEL
                svg.append("text")
                    .attr("class", "yaxis-label")
                    .attr("x",0)
                    .attr("y", 0)
                    .attr("transform", function(d) {return "rotate(-90)" })
                    .attr("dx", -margin.top-chartHeight/2)
                    .attr("dy", margin.left*0.2)
                    .attr("font-weight", "bold")
                    .attr("text-anchor", "middle")
                    .text("Grade for "+quizname);

                //X-AXIS LABEL
                svg.append("text")
                    .attr("class", "xaxis-label")
                    // .attr("x",chartWidth/2)
                    .attr("x", outerWidth/2)
                    .attr("y", chartHeight+margin.top)
                    .attr("dy", margin.bottom*0.9)
                    .attr("font-weight", "bold")
                    .attr("text-anchor", "middle")
                    .text("Overall grade");
            }

            //x ticks description
            var desc = ["avr-2sd","avr-sd","avr","avr+sd","avr+2sd"]
            for (var i = 0; i < xaxisData.length; i++) {
                var ticks_desc = svg.append("text")
                    .attr("x", xScale(xaxisData[i]))
                    .attr("y", chartHeight+margin.top)
                    .attr("text-anchor", "middle")
                    .text(desc[i]);
                if (!isSmall) {
                    ticks_desc.attr("class", "ticks-desc")
                        .attr("dy", $('.axis text').height()*2);
                }
                else {
                    ticks_desc.attr("class","small-ticks-desc")
                        .attr("dy", $('.small-axis text').height()*2);
                }
            }

            //y ticks description
            for (var i = 0; i < yaxisData.length; i++) {
                var ticks_desc = svg.append("text")
                        .attr("class", "ticks-desc")
                        .attr("x", margin.left)
                        .attr("dx", -margin.left*0.4)
                        .attr("y", yScale(yaxisData[i]))
                        .attr("text-anchor", "middle")
                        .text(desc[i]);
                if (!isSmall) {
                    ticks_desc.attr("class", "ticks-desc")
                        .attr("dy", $('.axis text').height()+2);
                }
                else {
                    ticks_desc.attr("class","small-ticks-desc")
                        .attr("dy", $('.small-axis text').height()+2);
                }
            }

            // Title for mini plots
            if (isSmall) {
                svg.append("text")
                        .attr("class","title")
                        .attr("x", "50%")
                        .attr("y", 0)
                        .attr("dy", 12)
                        .text(quizname);
            }


            $('svg circle').tipsy({ 
                gravity: 's', 
                html: true, 
                title: function() {
                    var d = this.__data__;
                    return d["student_id"] + "<br/> Grade in Class: "  + d["avr"].toFixed(1)*10 + "<br/>Grade For " + quizname+ ": " + d["grade"].toFixed(1)*10; 
                }
            });
        }

        function drawAllAvrScatterPlots() {
            $('#legend').hide();
            $('#column1').children().remove();
            var quizzesArray = controller.getQuizzesArray();

            var numCols = 3;
            var numRows = Math.ceil(quizzesArray.length/numCols);

            for (var i = 0; i < numRows; i++) {
                var thisrow = $("<div class='avr-scatter-row-"+i+"'></div>");
                for (var j=0; j < numCols; j++) {
                    if (i*numCols+j < quizzesArray.length) {
                        thisrow.append("<div class='col-lg-4 avr-scatter-col-"+j+"'></div>");
                    }
                }
                $('#column1').append(thisrow);
            }

            for (var i = 0; i < numRows; i++) {
                for (var j=0; j < numCols; j++) {
                    if (i*numCols+j < quizzesArray.length) {
                        var quizname = quizzesArray[i*numCols+j]
                        var parentDiv = ".avr-scatter-row-"+i+" .avr-scatter-col-"+j;
                        var outerWidth = parseInt($('.avr-scatter-row-'+i+' .avr-scatter-col-'+j).css("width"));
                        var outerHeight = $(document).height()/3;
                        var margin = { top: 0, right: 5, bottom: 20, left: 25};
                        updateAvrScatterPlot(quizname,parentDiv,outerWidth,outerHeight,margin,true);
                    }
                }
            }
            //x and y axes labels
            var allbars_xaxislabel = d3.select('#column1').append("div")
                            .attr("class", "viewall-xaxislabel")
                            .text("Overall Grade");   
            // allbars_xaxislabel.attr();        
            d3.select('#column1').append("div")
                            .attr("class", "viewall-yaxislabel")
                            .text("Grade for Each Quiz");            
        }
        /* 
            
                EVENT LISTENERS

        */
        

        dropdown.find('li').each(function() {
            $(this).on('click', function() {
                //inNav = true;
                var quizname = String($(this).attr('id'));

                $('#asgn-nav').html(quizname+"<span class='caret'></span>");
                if (quizname != "ViewAll") {
                    displayBasicInfo(quizname);
                    if (modeBools[0]) {
                        if ($('.btn-l').attr("disabled")=="disabled") {
                            $('.btn-l').attr("disabled",false); $('.btn-r').attr("disabled",false);
                            drawInitialGraph(quizname, "#column1", bar_outerWidth, bar_outerHeight, bar_margin, 0, false);
                        }
                        else {
                            bottom = Math.abs(sliderObj.slider("values", 0) - 0);
                            top = Math.abs(100 - sliderObj.slider("values", 1));
                            updateBarGraph([controller.groupPeopleByAvr(quizname, bottom, 100-top),quizname])
                        }
                    }
                    // else if (modeBools[1]) {
                    //     if ($('.btn-l').attr("disabled")=="disabled") {
                    //         $('.btn-l').attr("disabled",false); $('.btn-r').attr("disabled",false);
                    //     }
                    //     controller.calcAverage();
                    //     controller.updateRankScatterPlot(quizname)
                    // }
                    else if (modeBools[2]) {
                        if ($('.btn-l').attr("disabled")=="disabled") {
                            $('.btn-l').attr("disabled",false); $('.btn-r').attr("disabled",false);
                        }
                        controller.updateAvrScatterPlot(quizname,"#column1",avr_outerWidth,avr_outerHeight,avr_margin,false);
                    }
                }
                else { //when clicks View All
                    $('.btn-l').attr("disabled", true);
                    $('.btn-r').attr("disabled", true);
                    if (modeBools[0]){
                        controller.drawAllBarGraphs();
                    }
                    else if (modeBools[1]){
                        controller.drawAllRankScatterPlots();
                    }
                    else if (modeBools[2]){
                        controller.drawAllAvrScatterPlots();
                    }
                }
            });
        });

        $('.btn-l').on('click', function(){
            var quizzesArray = controller.getQuizzesArray();
            var index = quizzesArray.indexOf($('#asgn-nav').text());
            if (index != 0){
                var quizname = quizzesArray[index-1];
                $('#asgn-nav').html(quizname+"<span class='caret'></span>");
                    displayBasicInfo(quizname);
                if (modeBools[0]) { //if in percent mode
                    bottom = Math.abs(sliderObj.slider("values", 0) - 0);
                    top = Math.abs(100 - sliderObj.slider("values", 1));
                    updateBarGraph([controller.groupPeopleByAvr(quizname, bottom, 100-top),quizname])
                }
                // else if (modeBools[1]) {
                //     controller.calcAverage();
                //     controller.updateRankScatterPlot(quizname);
                // }
                else if (modeBools[2]) {
                    controller.updateAvrScatterPlot(quizname,"#column1",avr_outerWidth,avr_outerHeight,avr_margin,false);
                }
            }
        });

        $('.btn-r').on('click', function(){
            var quizzesArray = controller.getQuizzesArray();
            var index = quizzesArray.indexOf($('#asgn-nav').text());
            if (index != quizzesArray.length-1){
                var quizname = quizzesArray[index+1];
                $('#asgn-nav').html(quizname+"<span class='caret'></span>");
                displayBasicInfo(quizname);
                if (modeBools[0]) { //if in percent mode
                    bottom = Math.abs(sliderObj.slider("values", 0) - 0);
                    top = Math.abs(100 - sliderObj.slider("values", 1));
                    updateBarGraph([controller.groupPeopleByAvr(quizname, bottom, 100-top),quizname])
                }
                // else if (modeBools[1]) {
                //     controller.calcAverage();
                //     controller.updateRankScatterPlot(quizname);
                // }
                else if (modeBools[2]){
                    controller.updateAvrScatterPlot(quizname,"#column1",avr_outerWidth,avr_outerHeight,avr_margin,false);
                }
            }
        });


        model.on('changed', function(data) {
            // inNav = false;
            updateBarGraph(data);
        });

        // model.on('rank mode', function(data) {
        //     updateRankScatterPlot(data);
        // });

        model.on('avr mode', function(data) {
            updateAvrScatterPlot(data[0],data[1],data[2],data[3],data[4],data[5]);
        });

        model.on('view all bar', function() {
            drawAllBarGraphs();
        });

        model.on('view all rank scatter', function() {
            drawAllRankScatterPlots();
        });

        model.on('view all avr scatter', function() {
            drawAllAvrScatterPlots();
        });
    }

  //setup main structure of app
    function setup(div) {

        var model = Model();
        var controller = Controller(model);
        view = View(div, model, controller);
        
        // exports.view = view; //delete later

    }
   
    exports.setup = setup;

    // exports.model = Model; //delete later
    // exports.control = Controller; //delete later

    return exports;

}());

$(document).ready(function() {
    gradeDistr.setup($('.gradeDistr'));

});



/* ideas 
    remove legend and average over sections
    diagonal scatter plot (ex. the sequal plot of movies)
    view of multiple quizzes
    textual visualization, a matrix  where students are on thy y axis, quiz is the x axis
        grade in each cell, and color based on the percentages
        can zoom in and zoom out
*/