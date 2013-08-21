var attempts = (function() {
  
    var exports = {};


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



        //var peopleData = makeFullData(200); //comment this out when ready for deployment
        var dummyTrackingLogs = makeDummyTrackingLogs(10000);
        // var myDataFormat = trackinglogs_to_mydataformat(dummyTrackingLogs); 
        // var peopleData = myDataFormat[0];
        // var problemIDs = myDataFormat[1];
        
        // var peopleData = dataExport.exports.extract(jsonarray); uncomment this when ready for deployment
        // var jsonarray = 
        // [
        // {"username": "socho",
        // "event_type": "save_problem_check",
        // "event" : {"problem_id": "p1","success": "correct", "attempts": 4}
        // },
        // {"username": "socho",
        // "event_type": "save_problem_check",
        // "event" : {"problem_id": "p1","success": "correct", "attempts": 5}
        // },
        // {"username": "socho",
        // "event_type": "save_problem_check",
        // "event" : {"problem_id": "p3","success": "correct", "attempts": 2}
        // },
        // {"username": "socho",
        // "event_type": "save_problem_check",
        // "event" : {"problem_id": "p1","success": "incorrect", "attempts": 3}
        // },
        // {"username": "mich",
        // "event_type": "save_problem_check",
        // "event" : {"problem_id": "p2","success": "correct", "attempts": 7}
        // },
        // ];

        var myDataFormat = trackinglogs_to_mydataformat(dummyTrackingLogs);
        var peopleData = $.extend({}, myDataFormat[0]);
        var problemIDs = $.extend([], myDataFormat[1]);
        // var peopleData = $(myDataFormat[0]).clone();
        // var problemIDs = myDataFormat[1].clone();

        function getPeopleData(){
            return peopleData;
        }

        function getQuizzesArray() {
            return problemIDs;
        }

        /**
        returns an array of [total number of people, average, standard deviation]
        **/
        function getBasicInfo(assignment) {
            //calc total num of students who completed the assignment
            var numPeople = 0;
            var sum = 0;
            for (var key in peopleData) {
                if (assignment in peopleData[key]) {
                    numPeople++;
                    sum += peopleData[key][assignment];
                }
            }
            //calc average grade
            var avr = sum/numPeople;
            //calc std dev
            var sqDiffSum = 0;
            for (var key in peopleData) {
                if (assignment in peopleData[key]) {
                    sqDiffSum += Math.pow(parseFloat(peopleData[key][assignment])-avr,2);
                }
            }
            var sd = Math.sqrt(sqDiffSum / numPeople);
            return [numPeople, avr, sd];           
        }

        /*
        calculates student's grade average in the class
        */
        function calcAverage() {
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
                        sum += parseFloat(personData[quizname]);
                    }
                }
                var avr = sum / numQuizzes;
                personData["avr"] = avr;
            }
        }


        /*
        Calculates the average grade on the quiz, the standard deviation and the number of 
        students who took the quiz
        */
        function getInfoOverAll() {
            var sum = 0; var numPeople = 0;
            for (var person in peopleData) {
                sum += parseFloat(peopleData[person]["avr"]);
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

        return {getPeopleData: getPeopleData, getQuizzesArray: getQuizzesArray, getBasicInfo: getBasicInfo, calcAverage: calcAverage, getInfoOverAll: getInfoOverAll, on: handler.on};
    }

    function Controller(model){
        return {};
    }

    function View(div, model, controller){

        div.append(
         '<div class="container">'
        +   '<div class = "assignment-row">'
        +   '<div class = "btn-group">'
        +       '<button type = "button" class="btn btn-default btn-l"><span class="glyphicon glyphicon-chevron-left"></span></button>'
        +       '<div class = "btn-group">'
        +           '<button id="asgn-nav" type = "button" class="btn btn-default dropdown-toggle" data-toggle = "dropdown">'+model.getQuizzesArray()[0]+'<span class="caret"></span></button>'
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
        
        //MODE BOOLS 

        var modeBool = [true, false];




       ////////
       //NAVIGATION
       ////////
        var dropdown = $('.dropdown-menu');
        var quizzesArray = model.getQuizzesArray();
        for (var i = 0; i < quizzesArray.length; i++) {
            var key = quizzesArray[i]
            var link = $('<li id="' + key + '"><a>' + key + '</a></li>');
            dropdown.append(link);
        } 
        // dropdown.append("<li id='ViewAll'><a>ViewAll</a></li>");


        var tooltip = d3.select("body").append("div")   
            .attr("class", "tooltip")               
            .style("opacity", 0);

        ////////
        //setup variables for Graph
        ////////
        var scatter_outerWidth = parseInt($('#column1').css("width"))-parseInt($('#column1').css("padding-left"))-parseInt($('#column1').css("padding-right"));
        var scatter_outerHeight = 600;
        var scatter_margin = { top: 20, right: 20, bottom: 60, left: 50 };

       /*
        draws the scatter plot graph everytime when called
        */
        function drawAttemptsScatter(quizname, parentDiv, outerWidth, outerHeight, margin, isSmall) {
            var chartWidth = outerWidth - margin.left - margin.right;
            var chartHeight = outerHeight - margin.top - margin.bottom;

            $('svg').remove();
            var dataset = [];
            var dataDict = model.getPeopleData();
            for (var person in dataDict) {
                if (quizname in dataDict[person]){
                    //pushes in the person's score on problem and attempts
                    dataset.push({"username": person ,"attempts": dataDict[person][quizname], "avrattempts": dataDict[person]["avr"]});
                }
            }
            var info = model.getBasicInfo(quizname);
            var infoOverall = model.getInfoOverAll();
            var avrOverall = infoOverall[0];
            var sdOverall = infoOverall[1];

            var maxgradezscore = d3.max(dataset, function(d){return Math.abs(d["attempts"]-info[1])/info[2];});
            var maxavrzscore = d3.max(dataset, function(d){return Math.abs(d["avrattempts"]-avrOverall)/sdOverall;});
            var maxzscore = Math.max(maxavrzscore, maxgradezscore);

            var xScale = d3.scale.linear() //scale is a function!!!!!
                            .domain([avrOverall+maxzscore*sdOverall,avrOverall-maxzscore*sdOverall])
                            .range([margin.left,outerWidth-margin.right]);
            var yScale = d3.scale.linear() //scale is a function!!!!!
                            .domain([info[1]+maxzscore*info[2],info[1]-maxzscore*info[2]])
                            .range([outerHeight-margin.bottom,margin.top]);

            var xtoyScale = d3.scale.linear()
                                .domain([10*(avrOverall-3*sdOverall),10*(avrOverall+3*sdOverall)])
                                .range([10*(info[1]-3*info[2]),10*(info[1]+3*info[2])]);

            var xaxisData = [];
            var yaxisData = [];
            
            for (var i = 1; i<xScale.domain()[0]; i++) {
                xaxisData.push(i);
            }            
            for (var i = 1; i<yScale.domain()[0]; i++) {
                yaxisData.push(i);
            }            
         
            var xAxis = d3.svg.axis()
                            .scale(xScale)
                            .orient("bottom")
                            .tickValues(xaxisData)
                            //.tickFormat(d3.format(".1f"))
            var yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient("left")
                            .tickValues(yaxisData)
                            //.tickFormat(d3.format(".1f"))

            var svg = d3.select(parentDiv).append("svg")
                        .attr("width",outerWidth)
                        .attr("height",outerHeight);

            //diagonal line
            var diag = svg.append("line")
                .attr("class","diagonal")
                .attr("id", "diagonal")
                .attr("x1",xScale.range()[0])
                .attr("y1",yScale.range()[0])
                .attr("x2",xScale.range()[1])
                .attr("y2",yScale.range()[1]);

            //avr guidelines
            svg.append("line")
                .attr("class","guideline")
                .attr("x1",xScale.range()[0])
                .attr("y1",yScale(info[1]))
                .attr("x2",xScale.range()[1])
                .attr("y2",yScale(info[1]))
            svg.append("line")
                .attr("class","guideline")
                .attr("x1",xScale(avrOverall))
                .attr("y1",yScale.range()[0])
                .attr("x2",xScale(avrOverall))
                .attr("y2",yScale.range()[1])

            //avr guidelines label
            svg.append("text")
                .attr("class", "guidelinelabel")
                .attr("x",xScale.range()[0])
                .attr("y",yScale(info[1]))
                .attr("dx", 5)
                .attr("dy", -5)
                .text("Avr of # attempts");

            svg.append("text")
                .attr("class", "guidelinelabel")
                .attr("x",xScale(avrOverall))
                .attr("y",yScale.range()[0])
                .attr("dx",5)
                .attr("dy", -5)
                .text("Avr of overall")

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
                    .attr("dy", 0.16*chartHeight)
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
                    return xScale(d["avrattempts"]);
                })
                .attr("cy", function(d){
                    return yScale(d["attempts"]);
                })
                .attr("r", 3)
                .on("mouseover", function(d) {  
                    tooltip.transition()        
                        .duration(100)      
                        .style("opacity", .9);      
                    tooltip.html(d["username"] + "<br/>Avg # attempts: "  + d["avrattempts"].toFixed(1) + "<br/># Attempts: "  + d["attempts"].toFixed(1))  
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
                .attr("transform", "translate(0,"+(outerHeight-margin.bottom)+")")
                .call(xAxis);

            //yaxis
            svg.append("g")
                .attr("class","axis")
                .attr("transform", "translate("+margin.left+",0)")
                .call(yAxis);

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
                .text("# Attempts for "+quizname);

            //X-AXIS LABEL
            svg.append("text")
                .attr("class", "xaxis-label")
                // .attr("x",chartWidth/2)
                .attr("x", outerWidth/2)
                .attr("y", chartHeight+margin.top)
                .attr("dy", margin.bottom*0.9)
                .attr("font-weight", "bold")
                .attr("text-anchor", "middle")
                .text("Overall # Attempts");
        }

        var legend = $('<div id="legend"></div>');

        var totalLabel = $('<div id="total"><div>Number of Students: </div><p></p></div>');
        var averageLabel = $('<div id="average"><div style="display: inline;">Average: </div><p></p></div>');
        var sdLabel = $('<div id="sd"><div style="display: inline;">Standard Deviation: </div><p></p></div>');

        totalLabel.css('font-weight', 'bold');
        averageLabel.css('font-weight', 'bold');
        sdLabel.css('font-weight', 'bold');
        
        legend.append(totalLabel, averageLabel, sdLabel);
       
        var lowerLabel = $('<div id="lowerLabel"></div>');
        var upperLabel = $('<div id="upperLabel"></div>');



        $('#column2').append(legend); 
        $("#lowerLabel").text(25);
        $("#lowerLabel").css('top',"-10px");
        $("#lowerLabel").css('left', String(0.01 * 25 * parseFloat($('#slider').css("width")) - 0.5 * parseFloat($("#lowerLabel").css("width")))+"px"); 
        $("#upperLabel").text(75);
        $("#upperLabel").css('top',"-10px");
        $("#upperLabel").css('left', String(0.01 * 75 * parseFloat($('#slider').css("width")) - parseFloat($("#lowerLabel").css("width")) - 0.5 * parseFloat($("#upperLabel").css("width")))+"px");
        
        /*
        Displays the number of students who took the quiz, the standard dev, and the
        grade average of the class for the assignment
        */
        function displayBasicInfo(assignment) {
            var info = model.getBasicInfo(assignment); 
            $('#total p').text(info[0]);
            $('#total p').css({"margin-left": "20px", 'font-weight':'normal'});
            $('#average p').text(info[1].toFixed(3));
            $('#average p').css({"margin-left": "20px", 'font-weight':'normal'});
            $('#sd p').text(info[2].toFixed(3));
            $('#sd p').css({"margin-left": "20px", 'font-weight':'normal'});
        }

        //displays initial info for the graph
        displayBasicInfo(model.getQuizzesArray()[0]);

        ///////
        ///EVENT LISTENERS
        ///////
        dropdown.find('li').each(function() {
            $(this).on('click', function() {
                var quizname = String($(this).attr('id'));
                $('#asgn-nav').html(quizname+"<span class='caret'></span>");
                displayBasicInfo(quizname);
                if (modeBool[0]) {
                    drawAttemptsScatter(quizname, '.chart-container', scatter_outerWidth, scatter_outerHeight, scatter_margin, false);
                }
                else if (modeBool[1]) {
                    drawAttemptsBarGraph(quizname, '.chart-container', attemptsbar_outerWidth, attemptsbar_outerHeight, attemptsbar_margin, false);
                }
                
            });
        });

        $('.btn-l').on('click', function(){
            var quizzesArray = model.getQuizzesArray();
            var index = quizzesArray.indexOf($('#asgn-nav').text());
            if (index != 0){
                $('#asgn-nav').html(quizzesArray[index-1]+"<span class='caret'></span>");
                displayBasicInfo(quizzesArray[index-1]);
                if (modeBool[0]) {
                    drawAttemptsScatter(quizzesArray[index-1], '.chart-container', scatter_outerWidth, scatter_outerHeight, scatter_margin, false);   
                }
                else if (modeBool[1]) {
                    drawAttemptsBarGraph(quizzesArray[index-1], '.chart-container', attemptsbar_outerWidth, attemptsbar_outerHeight, attemptsbar_margin, false);
                }
            }
        });

        $('.btn-r').on('click', function(){
            var quizzesArray = model.getQuizzesArray();
            var index = quizzesArray.indexOf($('#asgn-nav').text());
            if (index != quizzesArray.length-1){
                $('#asgn-nav').html(quizzesArray[index+1]+"<span class='caret'></span>");
                displayBasicInfo(quizzesArray[index+1]);
                if (modeBool[0]) {
                    drawAttemptsScatter(quizzesArray[index+1], '.chart-container', scatter_outerWidth, scatter_outerHeight, scatter_margin, false);   
                }
                else if (modeBool[1]) {
                    drawAttemptsBarGraph(quizzesArray[index+1], '.chart-container', attemptsbar_outerWidth, attemptsbar_outerHeight, attemptsbar_margin, false)
                }
                
            }
        });

        //sets up tab views
        var modes = $('<ul class="nav nav-tabs"></ul>');
        var leftButton = $('<li class="active"><a href="#">Scatter Plot View</a></li>');
        var rightButton = $('<li><a href="#">Bar Graph View</a></li>');

        modes.append(leftButton, rightButton);
        modes.css('padding', 'auto auto');
        $('#column2').prepend(modes, '<br>');

        leftButton.on('click', function() {
            leftButton.attr("class","active");
            rightButton.attr("class","");
            modeBool[0] = true;
            modeBool[1] = false;
            drawAttemptsScatter($('#asgn-nav').text(), '.chart-container', scatter_outerWidth, scatter_outerHeight, scatter_margin, false);
        });

        rightButton.on('click', function() {
            leftButton.attr("class","");
            rightButton.attr("class","active");
            modeBool[0] = false;
            modeBool[1] = true;
            drawAttemptsBarGraph($('#asgn-nav').text(), '.chart-container', attemptsbar_outerWidth, attemptsbar_outerHeight, attemptsbar_margin, false);
        });

        //variables for bar chart
        var attemptsbar_outerWidth = parseInt($('#column1').css("width"))-parseInt($('#column1').css("padding-left"))-parseInt($('#column1').css("padding-right"));
        var attemptsbar_outerHeight = 600;

        var attemptsbar_margin = { top: 20, right: 20, bottom: 50, left: 50 };

        //graphs the bar chart when called or in barchart mode
        function drawAttemptsBarGraph(quizname, parentDiv, outerWidth, outerHeight, margin, isSmall) {
            var chartWidth = outerWidth - margin.left - margin.right;
            var chartHeight = outerHeight - margin.top - margin.bottom;
            $('svg').remove();
            var dataset = [];
            var dataDict = model.getPeopleData();
            var counter = 0;
            var quiz = quizname;
            var attemptsarray = [0,0,0,0,0,0,0,0,0,0,0];
            var maxattempt = 0;
            for (var person in dataDict) {
                
                if (quiz in dataDict[person]){
                    //pushes in the person's score on problem and attempts
                    dataset.push({"username": person ,"attempts": dataDict[person][quiz], "avrattempts": dataDict[person]["avr"]});

                }
            }

            //counts the students' attempts
            for (var person in dataset) {
                var attempt = dataset[person].attempts;
                switch(attempt) {
                    case 1:
                        attemptsarray[0]++;
                        break;
                    case 2:
                        attemptsarray[1]++;
                        break;
                    case 3:
                        attemptsarray[2]++;
                        break;
                    case 4:
                        attemptsarray[3]++;
                        break;
                    case 5:
                        attemptsarray[4]++;
                        break;
                    case 6:
                        attemptsarray[5]++;
                        break;
                    case 7:
                        attemptsarray[6]++;
                        break;
                    case 8:
                        attemptsarray[7]++;
                        break;
                    case 9:
                        attemptsarray[8]++;
                        break;
                    case 10:
                        attemptsarray[9]++;
                        break;
                    case 11:
                        attemptsarray[10]++;
                        break;
                }
                
                
            }           

            var info = model.getBasicInfo(quiz);
            var infoOverall = model.getInfoOverAll();
            var avrOverall = infoOverall[0];
            var sdOverall = infoOverall[1];

            var xScale = d3.scale.ordinal()
                            .domain([1,2,3,4,5,6,7,8,9,10,11])
                            .rangeRoundBands([attemptsbar_margin.left,attemptsbar_outerWidth-attemptsbar_margin.right],0.05);

            var yScale = d3.scale.linear()
                            .domain([0, Math.max.apply(Math,attemptsarray)])
                            .range([attemptsbar_outerHeight - attemptsbar_margin.bottom, attemptsbar_margin.top]);

            var yscaleticks = d3.scale.linear() //scale is a function!!!!!
                                .domain([Math.max.apply(Math,attemptsarray),0])
                                .range([attemptsbar_margin.top,attemptsbar_outerHeight-attemptsbar_margin.bottom]);           

            var xAxis = d3.svg.axis()
                            .scale(xScale)
                            .orient("bottom");
            var yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient("left")
                            .ticks(5);

            var svg = d3.select(parentDiv).append("svg")
                        .attr("width",attemptsbar_outerWidth)
                        .attr("height",attemptsbar_outerHeight);

            // Y AXIS GRID LINES
            svg.selectAll("line").data(yScale.ticks(5))
                .enter().append("line")
                .attr("class", "horizontal_line")
                .attr("x1", margin.left)
                .attr("x2", chartWidth + margin.left)
                .attr("y1", yScale)
                .attr("y2", yScale);
          

            svg.selectAll('rect')
                .data(attemptsarray)
                .enter()
                .append("rect")
                .attr("x", function(d,i) {
                    return xScale(i+1);
                })
                .attr("y", function(d) {
                    return yScale(d); //because the svg's will be upside down; height-data value
                })
                .attr("width", xScale.rangeBand())
                .attr("height", function(d) {
                    return chartHeight + margin.top - yScale(d);
                })
                .attr('fill', 'lightblue');

            $('svg rect').tipsy({ 
                gravity: 's', 
                html: true, 
                title: function() {
                    var d = this.__data__;
                    return d; 
                }
            });
                
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
                .text("Number of Students");

            //X-AXIS LABEL
            svg.append("text")
                .attr("class", "xaxis-label")
                // .attr("x",chartWidth/2)
                .attr("x", chartWidth/2)
                .attr("y", chartHeight+margin.top)
                .attr("dy", margin.bottom*.75)
                .attr("font-weight", "bold")
                .attr("text-anchor", "middle")
                .text("Number of Attempts");

            //xaxis
            svg.append("g")
                .attr("class","axis")
                .attr("transform", "translate(0,"+(chartHeight + margin.top)+")")
                .call(xAxis);

            //yaxis
            svg.append("g")
                .attr("class","axis")
                .attr("transform", "translate("+(margin.left)+",0)")
                .call(yAxis);

        }

        //initial graph
        model.calcAverage();
        drawAttemptsScatter(model.getQuizzesArray()[0], '.chart-container', scatter_outerWidth, scatter_outerHeight, scatter_margin, false);
            
    }

  //setup main structure of app
    function setup(div) {

        var model = Model();
        var controller = Controller(model);
        var view = View(div, model, controller);

    }
   
    exports.setup = setup;

    return exports;

}());

$(document).ready(function() {
    attempts.setup($('.attempts'));

});