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


        //define peopleData
        var peopleData = {};
        for (var quiz in quizzes){
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
            return peopleData;
        }

        function getQuizData(quizname) {
            
        }

        function getQuizzesArray() {
            var quizzesArray = [];
            for (var quiz in quizzes){
                quizzesArray.push(quiz);
            }
            return quizzesArray;
        }

        /**
        returns an array of [total number of people, average, ]
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

        function getInfoOverAll() {
            var sum = 0; var numPeople = 0;
            for (var person in peopleData) {
                console.log('person',person,'avr',peopleData[person]["avr"])
                sum += peopleData[person]["avr"];
                numPeople += 1;
            }
            console.log('sum',sum,'numpeople',numPeople);
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
                return a["avr"] - b["avr"];
            }
            peopleArray.sort(orderByAvrAscending); //sort
            // for (var i = 0; i < peopleArray.length; i++) {
            //     console.log(peopleArray[i]["avr"]);
            // }

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
            handler.trigger('changed', [newThreeArrays, assignment]);
            return newThreeArrays;
        }

        function calcAverage(quizzesOfInterest) {
            quizzesOfInterest = getQuizzesArray();
            console.log('getting sent', quizzesOfInterest);
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
            // console.log(peopleData["abundantchatter"]["avr"]);
        }

        function calcAverage_nozeros() {
            var quizzesOfInterest = getQuizzesArray();
            console.log('getting sent', quizzesOfInterest);
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

        function calcAvrOfAvr() {
            var sum = 0; var numPeople = 0;
            for (var person in peopleData) {
                sum += peopleData[person]["avr"];
                numPeople += 1;
            }
            return sum / numPeople;
        }

        function updateRankScatterPlot(quizname) {
            handler.trigger('rank mode', [peopleData, quizname]);
        }

        function updateAvrScatterPlot(quizname) {
            handler.trigger('avr mode', quizname);

        }
        

        return {getInfoOverAll: getInfoOverAll, updateAvrScatterPlot: updateAvrScatterPlot, updateRankScatterPlot: updateRankScatterPlot, calcAvrOfAvr: calcAvrOfAvr, getPeopleData: getPeopleData, getQuizData: getQuizData, getQuizzesArray: getQuizzesArray, getBasicInfo: getBasicInfo, calcAverage: calcAverage, calcAverage_nozeros: calcAverage_nozeros, groupPeopleByAvr: groupPeopleByAvr, on: handler.on};
    }

    function Controller(model){
        
        function updateAvrScatterPlot(quizname) {
            model.updateAvrScatterPlot(quizname);
        }
        function updateRankScatterPlot(quizname) {
            model.updateRankScatterPlot(quizname);
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
            model.groupPeopleByAvr(assignment, lowPct, highPct);
        }
        
        return {updateAvrScatterPlot: updateAvrScatterPlot, updateRankScatterPlot: updateRankScatterPlot, getPeopleData: getPeopleData, getQuizData: getQuizData, getQuizzesArray: getQuizzesArray, getBasicInfo: getBasicInfo, calcAverage: calcAverage, groupPeopleByAvr: groupPeopleByAvr};
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
        +           '<div class="chart-container"></div>'
        +       '</div>'
        +       '<div class="col-lg-4" id="column2"></div>'
        +   '</div>'
        +'</div>'
        );

        // COLUMN 2

        //slider
        var sliderDiv = $('<div id="sliderbg">');
 
        var sliderObj = $('<div id="slider">');
        var labelSlider = $('<p><h4>Overall Percentile (%):</h4>\
            <input id="amount" style="width: 250px;\
                    border: 0;\
                    background-color: #fff;\
                    color: #f6931f;\
                    font-size: 12px;\
                    font-weight: bold;\
                    margin-bottom: -100px" /></p>');

        //basic info
        var legend = $('<div id="legend"></div>');

        var totalLabel = $('<div id="total"><div>Number of Students: </div><p></p></div>');
        var averageLabel = $('<div id="average"><div style="display: inline;">Average: </div><p></p></div>');
        var sdLabel = $('<div id="sd"><div style="display: inline;">Standard Deviation: </div><p></p></div>');

        
        legend.append(totalLabel, averageLabel, sdLabel);

        

        // // checkboxes

        // var checkboxes = $('<div id="checkboxes-div"></div>');
        // var labelQuiz = $('<label for="ops"><h4>Averaged Over:</h4></label><br>');
        // checkboxes.css( {
        //     'background-color': '#fff',
        //     'border-radius': '10px',
        //     'width': '300px',
        //     'height': '200px',
        //     'padding': '5px',
        //     'margin-top': '5px'
        // });

        
        var lowerLabel = $('<div id="lowerLabel"></div>');
        var upperLabel = $('<div id="upperLabel"></div>');



        $('#column2').append(sliderDiv, legend); // legend, checkboxes
        $('#sliderbg').append(labelSlider, sliderObj,lowerLabel, upperLabel);
        // $('#checkboxes-div').append(labelQuiz);
        // for (var key in quizzes) {
        //     var checkbox = $('<input style="margin-left: 20px; margin-bottom: 5px;" type="checkbox" value="' + key + '" name="' + key + '"> ' + key +  '<br>');
        //     $('#checkboxes-div').append(checkbox);
        // }

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

                // var listOfQuizzes = selectedBoxes;
                // var curAsgn = $('#asgn-nav').text();
                // if ($.inArray(curAsgn, listOfQuizzes) == -1) {
                //     listOfQuizzes.push(curAsgn);
                // }
                
                // controller.calcAverage(listOfQuizzes);
                updateColors(ui.values);
                controller.groupPeopleByAvr($('#asgn-nav').text(), bottom, max-top);
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

        
        console.log($('#slider-container .ui-widget-header'));
        //.css({ 'border': '1px solid #aaaaaa', 'background': 'lightpink' });
        // #slider-container #slider-max-value {float:right;margin-top:6px;}


        //MODE BUTTONS
        var modes = $('<ul class="nav nav-tabs"></ul>');
        var leftButton = $('<li class="active"><a href="#">Percentiles</a></li>');
        var middleButton = $('<li><a href="#">Ranking</a></li>');
        var rightButton = $('<li><a href="#">Normalized</a></li>');

        // var modes = $('<div class="btn-group btn-group" id="mode-group"></div>');
        // var leftButton = $('<button type="button" class="btn btn-default">Percentiles</button>');
        // var middleButton = $('<button type="button" class="btn btn-default">Ranking</button>');
        // var rightButton = $('<button type="button" class="btn btn-default">Overall Average</button>');

        modes.append(leftButton, middleButton, rightButton);
        modes.css('padding', 'auto auto');
        $('#column2').prepend(modes);

        var modeBools = [true, false, false];

        leftButton.on('click', function() {
            leftButton.attr("class","active");
            middleButton.attr("class","");
            rightButton.attr("class","");
            modeBools[0] = true;
            modeBools[1] = false;
            modeBools[2] = false;
            sliderDiv.show();
            var quizname = $('#asgn-nav').text();
            controller.calcAverage();
            // controller.groupPeopleByAvr(quizname, bottom, 100-top);
            displayBasicInfo(quizname);
            drawInitialGraph(quizname);
        });

        middleButton.on('click', function() {
            middleButton.attr("class","active");
            leftButton.attr("class","");
            rightButton.attr("class","");
            modeBools[0] = false;
            modeBools[1] = true;
            modeBools[2] = false;
            sliderDiv.hide();
            var quizname = $('#asgn-nav').text();
            controller.calcAverage();
            controller.updateRankScatterPlot(quizname);
            displayBasicInfo(quizname);
        });

        rightButton.on('click', function() {
            rightButton.attr("class","active");
            middleButton.attr("class","");
            leftButton.attr("class","");
            modeBools[0] = false;
            modeBools[1] = false;
            modeBools[2] = true;
            sliderDiv.hide();
            var quizname = $('#asgn-nav').text();
            displayBasicInfo(quizname);
            controller.updateAvrScatterPlot(quizname);
        })




       //NAVIGATION
        var dropdown = $('.dropdown-menu');
        for (var key in quizzes) {
            var link = $('<li id="' + key + '"><a>' + key + '</a></li>');
            dropdown.append(link);
        } 

        

        ////////
        //setup variables for Graph
        ////////

        //variables for bar graph
        var bar_outerWidth = parseInt($('#column1').css("width"))-parseInt($('#column1').css("padding-left"))-parseInt($('#column1').css("padding-right"));
        var bar_outerHeight = 600;

        var bar_margin = { top: 20, right: 20, bottom: 40, left: 40 };

        var bar_chartWidth = bar_outerWidth - bar_margin.left - bar_margin.right;
        var bar_chartHeight = bar_outerHeight - bar_margin.top - bar_margin.bottom;

        var bar_color_scale = d3.scale.ordinal().range(["lightpink", "darkgray", "lightblue"]);

        //variables for rank graph
        var rank_outerWidth = parseInt($('#column1').css("width"))-parseInt($('#column1').css("padding-left"))-parseInt($('#column1').css("padding-right"));
        var rank_outerHeight = 600;

        var rank_margin = { top: 20, right: 20, bottom: 40, left: 40 };

        var rank_chartWidth = rank_outerWidth - rank_margin.left - rank_margin.right;
        var rank_chartHeight = rank_outerHeight - rank_margin.top - rank_margin.bottom;

        //variables for avr scatter
        var avr_outerWidth = parseInt($('#column1').css("width"))-parseInt($('#column1').css("padding-left"))-parseInt($('#column1').css("padding-right"));
        var avr_outerHeight = 600;

        var avr_margin = { top: 20, right: 20, bottom: 60, left: 50 };

        var avr_chartWidth = avr_outerWidth - avr_margin.left - avr_margin.right;
        var avr_chartHeight = avr_outerHeight - avr_margin.top - avr_margin.bottom;

        // //INITIALIZE THE CHART
        // var chart = d3.select(".chart-container")
        //     .append("svg")  
        //         .attr("class", "chart")
        //         .attr("height", outerHeight)
        //         .attr("width", outerWidth)
        //     .append("g")
        //         .attr("class", "innerChart")
        //         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // //Y-AXIS LABEL
        // chart.append("text")
        //     .attr("class", "yaxis-label")
        //     .attr("x",0)
        //     .attr("y", 0)
        //     .attr("transform", function(d) {return "rotate(-90)" })
        //     .attr("dx", -chartHeight/2)
        //     .attr("dy", -margin.left*0.75)
        //     .attr("font-weight", "bold")
        //     .attr("text-anchor", "middle")
        //     .text("Number of Students");

        ///////////////////

        function drawInitialGraph(quizname) { //assignment, quizzesOfInterest, lowPct, highPct,             
            $('svg').remove();
            //INITIALIZE THE CHART
            var chart = d3.select(".chart-container")
                .append("svg")  
                    .attr("class", "chart")
                    .attr("height", bar_outerHeight)
                    .attr("width", bar_outerWidth)
                .append("g")
                    .attr("class", "innerChart")
                    .attr("transform", "translate(" + bar_margin.left + "," + bar_margin.top + ")");

            //Y-AXIS LABEL
            chart.append("text")
                .attr("class", "yaxis-label")
                .attr("x",0)
                .attr("y", 0)
                .attr("transform", function(d) {return "rotate(-90)" })
                .attr("dx", -bar_chartHeight/2)
                .attr("dy", -bar_margin.left*0.75)
                .attr("font-weight", "bold")
                .attr("text-anchor", "middle")
                .text("Number of Students");

            controller.calcAverage(quizname);

            var data = model.groupPeopleByAvr(quizname, bottom, 100-top); //need to ask question
            // console.log('data: ', data);
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

            console.log(chart);
            // Y AXIS GRID LINES
            chart.selectAll("line").data(yScale.ticks(10))
                .enter().append("line")
                .attr("x1", 0)
                .attr("x2", bar_chartWidth)
                .attr("y1", yScale)
                .attr("y2", yScale);

            //Y TICK MARKS
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
            chart.selectAll(".xscale-label").data(xScale.domain())
                .enter().append("text")
                .attr("class", "xscale-label")
                .attr("x", function(d){return xScale(d);})
                .attr("y", bar_chartHeight)
                .attr("text-anchor", "center")
                // .attr("dx", function(d){return xScale.rangeBand()/2;})
                .attr("dy", bar_margin.bottom*0.4)
                .text(function(d){return String(d*10);});

            //X-AXIS LABEL
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
        }

        drawInitialGraph($('#asgn-nav').text());

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

        function updateRankScatterPlot(dataArray) {
            var quizname = dataArray[1]; 

            function sortByRank(object, val2sort) {
                    n = object.length;
                    swapped = true;
                    while (swapped) {
                        swapped = false;
                        for (var i = 1; i < n; i++) {
                            if (object[i-1][val2sort] > object[i][val2sort]) {
                                var temp = object[i];
                                object[i] = object[i-1];
                                object[i-1] = temp;
                                swapped = true;
                           }
                        }
                        n = n-1;
                    }
                    if (val2sort == "avr") { 
                        for (var i = 0; i < object.length; i++) {
                            object[i]["avr-rank"] = [i+1, object.length-i];
                        }
                    } else {
                        for (var i = 0; i < object.length; i++) {
                            object[i]["grade-rank"] = [i+1, object.length-i];
                        }
                    }return object;

                }

            d3.select("svg").remove();

            var dataset = [];
            var dataDict = dataArray[0];
            console.log('datadict: ', dataDict);

            for (var person in dataDict) {
                if (quizname in dataDict[person]){
                    console.log('made it');
                    dataset.push({"username": person ,"grade": dataDict[person][quizname]["grade"], "avr": dataDict[person]["avr"]});
                    
                }
            }
            
            console.log('dataset: ', dataset);


            var info = controller.getBasicInfo(quizname);
            var result = sortByRank(dataset, "avr"); //sorted by avg
            var result2 = sortByRank(result, "grade"); //sorted by grade
            console.log(result2);
            console.log('num of students', info[0]);

            var tooltip = d3.select("body").append("div")   
                .attr("class", "tooltip")               
                .style("opacity", 0);

            var avrOfAvr = model.calcAvrOfAvr();

            var xScale = d3.scale.linear() //scale is a function!!!!!
                            .domain([info[0], 0])
                            .range([rank_margin.left,rank_outerWidth-rank_margin.right]);
            var yScale = d3.scale.linear() //scale is a function!!!!!
                            .domain([info[0], 0])
                            .range([rank_outerHeight-rank_margin.bottom,rank_margin.top]);

            var xAxis = d3.svg.axis()
                            .scale(xScale)
                            .orient("bottom")
                            .ticks(10);
            var yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient("left")
                            .ticks(10);

            var svg = d3.select(".chart-container").append("svg")
                        .attr("width",rank_outerWidth)
                        .attr("height",rank_outerHeight);

            svg.append("line")
                .attr('x1', rank_margin.left)
                .attr('x2', rank_outerWidth-rank_margin.right)
                .attr('y1', rank_outerHeight-rank_margin.bottom)
                .attr('y2', rank_margin.top)
                .style("stroke", "black")
                .style("stroke-width", 2)
                .style("stroke-dasharray", ("10, 10"));

            svg.selectAll("circle")
                .data(result2)
                .enter()
                .append("circle")
                .attr("class","datapoints")
                .attr("cx", function(d){
                    return xScale(d["avr-rank"][1]);
                })
                .attr("cy", function(d){
                    return yScale(d["grade-rank"][1]);
                })
                .attr("r", 3)
                .on("mouseover", function(d) {      
                    tooltip.transition()        
                        .duration(100)      
                        .style("opacity", .9);      
                    tooltip.html(d["username"] + "<br/>Avg Rank: "  + d["avr-rank"][1] + "<br/>Grade Rank: "  + d["grade-rank"][1] + "<br/>Avg: "  + d["avr"].toFixed(2) + "<br/>Grade: "  + parseFloat(d["grade"]))  
                        .style("left", (d3.event.pageX) + "px")     
                        .style("top", (d3.event.pageY - 28) + "px");    
                })                  
                .on("mouseout", function(d) {       
                    tooltip.transition()        
                        .duration(500)      
                        .style("opacity", 0);   
                });

            svg.append("g")
                .attr("class","axis")
                .attr("transform", "translate(0,"+(rank_outerHeight-rank_margin.bottom)+")")
                .call(xAxis);

            svg.append("g")
                .attr("class","axis")
                .attr("transform", "translate("+rank_margin.left+",0)")
                .call(yAxis);

            //X-AXIS LABEL
            svg.append("text")
                .attr("class", "xaxis-label")
                // .attr("x",chartWidth/2)
                .attr("x", avr_outerWidth/2)
                .attr("y", avr_chartHeight+avr_margin.top)
                .attr("dy", avr_margin.bottom*0.9)
                .attr("font-weight", "bold")
                .attr("text-anchor", "middle")
                .text("Overall Rank");

            //Y-AXIS LABEL
            svg.append("text")
                .attr("class", "yaxis-label")
                .attr("x",0)
                .attr("y", 0)
                .attr("transform", function(d) {return "rotate(-90)" })
                .attr("dx", -avr_margin.top-avr_chartHeight/2)
                .attr("dy", avr_margin.left*0.2)
                .attr("font-weight", "bold")
                .attr("text-anchor", "middle")
                .text("Rank for "+ quizname);
        }

        function updateAvrScatterPlot(quizname) {
            $('svg').remove();
            model.calcAverage_nozeros();
            var dataset = [];
            var dataDict = model.getPeopleData();
            for (var person in dataDict) {
                if (quizname in dataDict[person]){
                    dataset.push({"username": person ,"grade": dataDict[person][quizname]["grade"], "avr": dataDict[person]["avr"]});
                }
            }

            var tooltip = d3.select("body").append("div")   
                .attr("class", "tooltip")               
                .style("opacity", 0);

            var info = model.getBasicInfo(quizname);
            var infoOverall = model.getInfoOverAll();
            var avrOverall = infoOverall[0];
            var sdOverall = infoOverall[1];

            var xScale = d3.scale.linear() //scale is a function!!!!!
                            .domain([10*(avrOverall-d3.max(dataset, function(d){return Math.abs(avrOverall-d["avr"]);})),10*(avrOverall+d3.max(dataset, function(d){return Math.abs(avrOverall-d["avr"]);}))])
                            .range([avr_margin.left,avr_outerWidth-avr_margin.right]);
            var yScale = d3.scale.linear() //scale is a function!!!!!
                            //.domain([Math.max(0,10*(info[1]-d3.max(dataset, function(d){return Math.abs(info[1]-d["grade"]);}))),Math.min(100,10*(info[1]+d3.max(dataset, function(d){return Math.abs(info[1]-d["grade"]);})))])
                            .domain([(info[1]-d3.max(dataset, function(d){return Math.abs(info[1]-d["grade"]*10);})),(info[1]+d3.max(dataset, function(d){return Math.abs(info[1]-d["grade"]*10);}))])
                            .range([avr_outerHeight-avr_margin.bottom,avr_margin.top]);

            var xtoyScale = d3.scale.linear()
                                .domain([10*(avrOverall-3*sdOverall),10*(avrOverall+3*sdOverall)])
                                .range([(info[1]-3*info[2]),(info[1]+3*info[2])]);
            console.log('domain', xtoyScale.domain(), 'range', xtoyScale.range());
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

            var svg = d3.select(".chart-container").append("svg")
                        .attr("width",avr_outerWidth)
                        .attr("height",avr_outerHeight);

            //diagonal line
            var diag = svg.append("line")
                .attr("class","diagonal")
                .attr("id", "diagonal");
            var xmin = xScale.domain()[0];
            var xmax = xScale.domain()[1];
            var ymin = yScale.domain()[0];
            var ymax = yScale.domain()[1];
            console.log(xmin,xmax,ymin,ymax);
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

            //help text
            var helptext = svg.append("g")
                                .attr("class", "helptext");
            var x = $('.diagonal').attr("x2");
            var y = $('.diagonal').attr("y2");

            // helptext.append("text")
            //         .append("textPath")

            helptext.append("text")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dx", -avr_chartWidth/10)
                    .text("better than")
                    .append("tspan")
                    .text("usual")
                    .attr("x",x)
                    .attr("dx", -avr_chartWidth/10)
                    .attr("dy", 12);
            helptext.append("text")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dx", -0.5 * $('text').width())
                    .attr("dy", 0.15*avr_chartHeight)
                    .text("worse than")
                    .append("tspan")
                    .text("usual")
                    .attr("x", x)
                    .attr("dx", -0.5 * $('text').width())
                    .attr("dy", 12);

            //dots
            svg.selectAll("circle")
                .data(dataset)
                .enter()
                .append("circle")
                .attr("class","datapoints")
                .attr("cx", function(d){
                    return xScale(10*d["avr"]);
                })
                .attr("cy", function(d){
                    return yScale(10*d["grade"]);
                })
                .attr("r", 3)
                .on("mouseover", function(d) {
                    console.log(d);   
                    tooltip.transition()        
                        .duration(100)      
                        .style("opacity", .9);      
                    tooltip.html(d["username"] + "<br/>Avg: "  + d["avr"].toFixed(1)*10 + "<br/>Grade: "  + d["grade"].toFixed(1)*10)  
                        .style("left", (d3.event.pageX) + "px")     
                        .style("top", (d3.event.pageY - 42) + "px");    
                })                  
                .on("mouseout", function(d) {       
                    tooltip.transition()        
                        .duration(500)      
                        .style("opacity", 0);   
                });

            //xaxis
            svg.append("g")
                .attr("class","axis")
                .attr("transform", "translate(0,"+(avr_outerHeight-avr_margin.bottom)+")")
                .call(xAxis);

            //yaxis
            svg.append("g")
                .attr("class","axis")
                .attr("transform", "translate("+avr_margin.left+",0)")
                .call(yAxis);

            //Y-AXIS LABEL
            svg.append("text")
                .attr("class", "yaxis-label")
                .attr("x",0)
                .attr("y", 0)
                .attr("transform", function(d) {return "rotate(-90)" })
                .attr("dx", -avr_margin.top-avr_chartHeight/2)
                .attr("dy", avr_margin.left*0.2)
                .attr("font-weight", "bold")
                .attr("text-anchor", "middle")
                .text("Grade for "+quizname);

            //X-AXIS LABEL
            svg.append("text")
                .attr("class", "xaxis-label")
                // .attr("x",chartWidth/2)
                .attr("x", avr_outerWidth/2)
                .attr("y", avr_chartHeight+avr_margin.top)
                .attr("dy", avr_margin.bottom*0.9)
                .attr("font-weight", "bold")
                .attr("text-anchor", "middle")
                .text("Overall grade");
            //x ticks description
            var desc = ["avr-2sd","avr-sd","avr","avr+sd","avr+2sd"]
            for (var i = 0; i < xaxisData.length; i++) {
                svg.append("text")
                    .attr("class", "ticks-desc")
                    .attr("x", xScale(xaxisData[i]))
                    .attr("y", avr_chartHeight+avr_margin.top)
                    .attr("dy", $('.xaxis-label').height()*2)
                    .attr("text-anchor", "middle")
                    .text(desc[i]);
                }
            //y ticks description
            for (var i = 0; i < yaxisData.length; i++) {
                svg.append("text")
                    .attr("class", "ticks-desc")
                    .attr("x", avr_margin.left)
                    .attr("dx", -avr_margin.left*0.4)
                    .attr("y", yScale(yaxisData[i]))
                    .attr("dy", $('.yaxis-label').height()+2)
                    .attr("text-anchor", "middle")
                    .text(desc[i]);
                }
        }

        /* 
            
                EVENT LISTENERS

        */
        

        dropdown.find('li').each(function() {
            $(this).on('click', function() {
                //inNav = true;
                var quizname = String($(this).attr('id'));

                $('#asgn-nav').html(quizname+"<span class='caret'></span>");
                displayBasicInfo(quizname);
                console.log(modeBools);
                if (modeBools[0]) {
                    bottom = Math.abs(sliderObj.slider("values", 0) - 0);
                    top = Math.abs(100 - sliderObj.slider("values", 1));
                    controller.groupPeopleByAvr(quizname, bottom, 100-top);
                }
                else if (modeBools[1]) {
                    controller.calcAverage();
                    controller.updateRankScatterPlot(quizname)
                }
                else if (modeBools[2]) {
                    controller.updateAvrScatterPlot(quizname);
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
                    controller.groupPeopleByAvr(quizname, bottom, 100-top);
                }
                else if (modeBools[1]) {
                    console.log("!!!!!!!!!!!")
                    controller.calcAverage();
                    controller.updateRankScatterPlot(quizname);
                }
                else if (modeBools[2]) {
                    controller.updateAvrScatterPlot(quizname);
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
                    controller.groupPeopleByAvr(quizname, bottom, 100-top);
                }
                else if (modeBools[1]) {
                    controller.calcAverage();
                    controller.updateRankScatterPlot(quizname);
                }
                else if (modeBools[2]){
                    controller.updateAvrScatterPlot(quizname);
                }
            }
        });


        model.on('changed', function(data) {
            // inNav = false;
            updateBarGraph(data);
            console.log('here')
        });

        model.on('rank mode', function(data) {
            updateRankScatterPlot(data);
        });

        model.on('avr mode', function(quizname) {
            updateAvrScatterPlot(quizname);
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