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

        var trackingLogs; 

        // load appropriate json file
        $.ajax({
            url: 'dummyTrackingLogs.json', ////////////change url for your use///////////////
            async: false,
            dataType: 'json',
            success: function (response) {
                trackingLogs = response;
            }
        });

        // uncomment this to test on local server
        // comment this to test on actual server
        // trackingLogs = makeDummyTrackingLogs(10000);

        var myDataFormat = trackinglogs_to_mydataformat(trackingLogs);
        // var peopleData = $.extend({}, myDataFormat[0]);
        // var problemIDs = $.extend([], myDataFormat[1]);
        var peopleData = myDataFormat[0];
        var problemIDs = myDataFormat[1];

        /**
        returns a dictionary with keys of all usernames, 
        the corresponding value for a username are a dictionary with keys of all assignments he/she took,
        and the corresponding values for an assignment is number of attempts.
        **/
        function getPeopleData(){
            return peopleData;
        }

        /**
        returns an array of all quiznames in the json file.
        **/
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

        /**
        returns an array of number of students for each # of attempts. 
        **/
        function computeBarHeights(quizname) {
            var quiz = quizname;
            var attemptsarray = []; var dataset = [];
            var maxattempt = 0;
            var dataDict = getPeopleData();
            for (var person in dataDict) {                
                if (quiz in dataDict[person]){
                    //pushes in the person's score on problem and attempts
                    var numAttempts = dataDict[person][quiz];
                    dataset.push({"username": person ,"attempts": numAttempts, "avrattempts": dataDict[person]["avr"]});
                    if (maxattempt < numAttempts) {maxattempt = numAttempts;}
                }
            }
            for (var i = 0; i < maxattempt; i++) {attemptsarray.push(0);}

            //counts the students' attempts
            for (var person in dataset) {
                var attempt = dataset[person].attempts;
                attemptsarray[attempt-1]++;                
            } 
            return attemptsarray;
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

        return {getPeopleData: getPeopleData, getQuizzesArray: getQuizzesArray, getBasicInfo: getBasicInfo, calcAverage: calcAverage, computeBarHeights: computeBarHeights, getInfoOverAll: getInfoOverAll, on: handler.on};
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
        +       '</div>'
        +       '<div class="col-lg-4" id="column2"></div>'
        +   '</div>'
        +'</div>'
        );
        
        //MODE BOOLS 
        var modeBools = [true, false];

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
        dropdown.append("<li id='ViewAll'><a>ViewAll</a></li>");


        var tooltip = d3.select("body").append("div")   
            .attr("class", "tooltip")               
            .style("opacity", 0);

        ////////
        //setup variables for Graph
        ////////
        var scatter_outerWidth = parseInt($('#column1').css("width"))-parseInt($('#column1').css("padding-left"))-parseInt($('#column1').css("padding-right"));
        var scatter_outerHeight = $(document).height()-$('.assignment-row').height()-parseInt($('.container').css("margin-top"))-parseInt($('#column1').css("padding-top"));
        var scatter_margin = { top: 20, right: 20, bottom: 60, left: 50 };

        /*
        removes previous plots and
        draws the scatter plot graph everytime when called
        */
        function drawAttemptsScatter(quizname, parentDiv, outerWidth, outerHeight, margin, isSmall) {
            var chartWidth = outerWidth - margin.left - margin.right;
            var chartHeight = outerHeight - margin.top - margin.bottom;

            if (!isSmall) {$('#column1').children().remove();} //remove previous plots only if it's drawing the big plot.
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

            // var maxgradezscoreAbove = d3.max(dataset, function(d){return (d["attempts"]-info[1])/info[2];});
            // var maxgradezscoreBelow = Math.abs(d3.min(dataset, function(d){return (d["attempts"]-info[1])/info[2];}));
            // var maxavrzscoreAbove = d3.max(dataset, function(d){return (d["avrattempts"]-avrOverall)/sdOverall;});
            // var maxavrzscoreBelow = Math.abs(d3.min(dataset, function(d){return (d["avrattempts"]-avrOverall)/sdOverall;}));
            // var maxzscoreAbove = Math.max(maxgradezscoreAbove,maxavrzscoreAbove);
            // var maxzscoreBelow = Math.max(maxgradezscoreBelow,maxavrzscoreBelow);

            var maxgradezscore = d3.max(dataset, function(d){return Math.abs(d["attempts"]-info[1])/info[2];});
            var maxavrzscore = d3.max(dataset, function(d){return Math.abs(d["avrattempts"]-avrOverall)/sdOverall;});
            var maxzscore = Math.max(maxavrzscore, maxgradezscore);

            var xScale = d3.scale.linear() //scale is a function!!!!!
                            .domain([avrOverall+maxzscore*sdOverall,avrOverall-maxzscore*sdOverall])
                            .range([margin.left,outerWidth-margin.right])
                            .clamp(true);
            var yScale = d3.scale.linear() //scale is a function!!!!!
                            .domain([info[1]+maxzscore*info[2],info[1]-maxzscore*info[2]])
                            .range([outerHeight-margin.bottom,margin.top])
                            .clamp(true);
            // var xScale = d3.scale.linear() //scale is a function!!!!!
            //                 .domain([avrOverall+maxzscoreAbove*sdOverall,avrOverall-maxzscoreBelow*sdOverall])
            //                 .range([margin.left,outerWidth-margin.right])
            //                 .clamp(true);
            // var yScale = d3.scale.linear() //scale is a function!!!!!
            //                 .domain([info[1]+maxzscoreAbove*info[2],info[1]-maxzscoreBelow*info[2]])
            //                 .range([outerHeight-margin.bottom,margin.top])
            //                 .clamp(true);

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
                        .attr("class", "chart")
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
            if (!isSmall) {
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
            }
            else {
                svg.append("text")
                    .attr("class", "viewall-guidelinelabel")
                    .attr("x",xScale.range()[0])
                    .attr("y",yScale(info[1]))
                    .attr("dx", 5)
                    .attr("dy", -5)
                    .text("Avr of # attempts");

                svg.append("text")
                    .attr("class", "viewall-guidelinelabel")
                    .attr("x",xScale(avrOverall))
                    .attr("y",yScale.range()[0])
                    .attr("dx",5)
                    .attr("dy", -5)
                    .text("Avr of overall")                
            }

            //help text only for big plot
            if (!isSmall) {
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
            }

            //dots
            svg.selectAll("circle")
                .data(dataset)
                .enter()
                .append("circle")
                .attr("class","datapoints")
                .attr("cx", function(d){
                    return xScale(d["avrattempts"]+Math.random()/4);
                })
                .attr("cy", function(d){
                    return yScale(d["attempts"]+Math.random()/4);
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

            //x and y axes
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

            //Y-AXIS and X-AXIS LABELS
            if (!isSmall) {
                //X-AXIS LABEL
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

            // Title for mini plots
            if (isSmall) {
                svg.append("text")
                        .attr("class","title")
                        .attr("x", "50%")
                        .attr("y", 0)
                        .attr("dy", 12)
                        .text(quizname);
            }
        }

        /**
        hides the legend, remove previous plots,
        and draw viewall mode for attempts scatter plot
        **/
        function drawAllAttemptsScatter(){
            $('#legend').hide();
            $('#column1').children().remove();
            var quizzesArray = model.getQuizzesArray();

            var numCols = 3;
            var numRows = Math.ceil(quizzesArray.length/numCols);

            //create smaller divs for each mini plot
            for (var i = 0; i < numRows; i++) {
                var thisrow = $("<div class='scatter-row-"+i+"'></div>");
                for (var j=0; j < numCols; j++) {
                    if (i*numCols+j < quizzesArray.length) {
                        thisrow.append("<div class='col-lg-4 scatter-col-"+j+"'></div>");
                    }
                }
                $('#column1').append(thisrow);
            }

            //iterate through each grid div and append a bar graph to each
            for (var i = 0; i < numRows; i++) {
                for (var j=0; j < numCols; j++) {
                    if (i*numCols+j < quizzesArray.length) {
                        var quizname = quizzesArray[i*numCols+j];
                        var parentDiv = ".scatter-row-"+i+" .scatter-col-"+j;
                        var outerWidth = parseInt($('.scatter-row-'+i+' .scatter-col-'+j).css("width"));
                        var outerHeight = $(document).height()/3;
                        var margin = { top: 10, right: 5, bottom: 20, left: 15};
                        drawAttemptsScatter(quizname, parentDiv, outerWidth, outerHeight, margin, true);
                    }
                }
            }
            //x and y axes labels
            var allbars_xaxislabel = d3.select('#column1').append("div")
                            .attr("class", "viewall-xaxislabel")
                            .text("# Attempts for Each Quiz");   
            // allbars_xaxislabel.attr();        
            d3.select('#column1').append("div")
                            .attr("class", "viewall-yaxislabel")
                            .text("Overall # Attempts");            
        }

        //setup legend
        var legend = $('<div id="legend"></div>');

        var totalLabel = $('<div id="total"><div>Number of Students: </div><p></p></div>');
        var averageLabel = $('<div id="average"><div style="display: inline;">Average Number of Attempts: </div><p></p></div>');
        var sdLabel = $('<div id="sd"><div style="display: inline;">Standard Deviation of Attempts: </div><p></p></div>');

        legend.append(totalLabel, averageLabel, sdLabel);
       
        var lowerLabel = $('<div id="lowerLabel"></div>');
        var upperLabel = $('<div id="upperLabel"></div>');

        $('#column2').append(legend); 
        
        /*
        Displays the number of students who took the quiz, the standard dev, and the
        grade average of the class for the assignment
        */
        function displayBasicInfo(assignment) {
            var info = model.getBasicInfo(assignment); 
            $('#total p').text(info[0]);
            // $('#total p').css({"margin-left": "20px", 'font-weight':'normal'});
            $('#average p').text(info[1].toFixed(1));
            // $('#average p').css({"margin-left": "20px", 'font-weight':'normal'});
            $('#sd p').text(info[2].toFixed(1));
            // $('#sd p').css({"margin-left": "20px", 'font-weight':'normal'});
        }

        //displays initial info for the graph
        displayBasicInfo(model.getQuizzesArray()[0]);

        ///////
        ///EVENT LISTENERS
        ///////

        //dropdown list event listener
        dropdown.find('li').each(function() {
            $(this).on('click', function() {
                var quizname = String($(this).attr('id'));
                $('#asgn-nav').html(quizname+"<span class='caret'></span>");
                if (quizname == "ViewAll") {
                    $('.btn-l').attr("disabled", true);
                    $('.btn-r').attr("disabled", true);
                    if (modeBools[0]){
                        drawAllAttemptsScatter();
                    }
                    else if (modeBools[1]){
                        drawAllAttemptsBarGraphs();
                    }
                }
                else {
                    $('#legend').show();
                    $('.btn-l').attr("disabled", false);
                    $('.btn-r').attr("disabled", false);
                    displayBasicInfo(quizname);
                    if (modeBools[0]) {
                        drawAttemptsScatter(quizname, '#column1', scatter_outerWidth, scatter_outerHeight, scatter_margin, false);
                    }
                    else if (modeBools[1]) {
                        drawAttemptsBarGraph(quizname, '#column1', attemptsbar_outerWidth, attemptsbar_outerHeight, attemptsbar_margin, 0, 0, false);
                    }
                    var listOfQuizzes = model.getQuizzesArray();
                    if (quizname == listOfQuizzes[0]) {
                        $('.btn-l').attr("disabled", true);
                        $('.btn-r').attr("disabled", false);
                    }
                    else if (quizname == listOfQuizzes[listOfQuizzes.length-1]){
                        $('.btn-r').attr("disabled", true);
                        $('.btn-l').attr("disabled", false);
                    }
                    else {
                        //renable the buttons
                        $('.btn-l').attr("disabled", false);
                        $('.btn-r').attr("disabled", false);
                    }
                }
            });
        });

        $('.btn-l').attr("disabled", true); //initial button state;

        //left arrow button event listener
        $('.btn-l').on('click', function(){
            var quizzesArray = model.getQuizzesArray();
            var index = quizzesArray.indexOf($('#asgn-nav').text());
            if ($('#asgn-nav').text() == quizzesArray[1]) {
                $(this).attr("disabled", true);
                $('.btn-r').attr("disabled", false);
            } else {
                $(this).attr("disabled", false);
                $('.btn-r').attr("disabled", false);

            }
            if (index != 0){
                $('#asgn-nav').html(quizzesArray[index-1]+"<span class='caret'></span>");
                displayBasicInfo(quizzesArray[index-1]);
                if (modeBools[0]) {
                    drawAttemptsScatter(quizzesArray[index-1], '#column1', scatter_outerWidth, scatter_outerHeight, scatter_margin, false);   
                }
                else if (modeBools[1]) {
                    drawAttemptsBarGraph(quizzesArray[index-1], '#column1', attemptsbar_outerWidth, attemptsbar_outerHeight, attemptsbar_margin, 0, 0, false);
                }
            }
        });
        
        //right arrow button event listener
        $('.btn-r').on('click', function(){
            var quizzesArray = model.getQuizzesArray();
            var index = quizzesArray.indexOf($('#asgn-nav').text());
            if ($('#asgn-nav').text() == quizzesArray[quizzesArray.length-2]) {
                $(this).attr("disabled", true);
                $('.btn-l').attr("disabled", false);
            } else {
                $(this).attr("disabled", false);
                $('.btn-l').attr("disabled", false);
            }
            if (index != quizzesArray.length-1){
                $('#asgn-nav').html(quizzesArray[index+1]+"<span class='caret'></span>");
                displayBasicInfo(quizzesArray[index+1]);
                if (modeBools[0]) {
                    drawAttemptsScatter(quizzesArray[index+1], '#column1', scatter_outerWidth, scatter_outerHeight, scatter_margin, false);   
                }
                else if (modeBools[1]) {
                    drawAttemptsBarGraph(quizzesArray[index+1], '#column1', attemptsbar_outerWidth, attemptsbar_outerHeight, attemptsbar_margin, 0, 0, false)
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

        //scatter mode button
        leftButton.on('click', function() {
            leftButton.attr("class","active");
            rightButton.attr("class","");
            modeBools[0] = true;
            modeBools[1] = false;
            var quizname = $('#asgn-nav').text();
            if (quizname == "ViewAll") {
                drawAllAttemptsScatter();
            }
            else {
                drawAttemptsScatter(quizname, '#column1', scatter_outerWidth, scatter_outerHeight, scatter_margin, false);
            }
        });

        //bar graph mode button
        rightButton.on('click', function() {
            leftButton.attr("class","");
            rightButton.attr("class","active");
            modeBools[0] = false;
            modeBools[1] = true;
            var quizname = $('#asgn-nav').text();
            if (quizname == "ViewAll") {
                drawAllAttemptsBarGraphs();
            }
            else {
                drawAttemptsBarGraph(quizname, '#column1', attemptsbar_outerWidth, attemptsbar_outerHeight, attemptsbar_margin, 0, 0, false);
            }
        });

        //variables for bar chart
        var attemptsbar_outerWidth = parseInt($('#column1').css("width"))-parseInt($('#column1').css("padding-left"))-parseInt($('#column1').css("padding-right"));
        var attemptsbar_outerHeight = $(document).height()-$('.assignment-row').height()-parseInt($('.container').css("margin-top"))-parseInt($('#column1').css("padding-top"));

        var attemptsbar_margin = { top: 20, right: 20, bottom: 50, left: 50 };

        //graphs the bar chart when called or in barchart mode
        function drawAttemptsBarGraph(quizname, parentDiv, outerWidth, outerHeight, margin, maxX, maxY, isSmall) {
            var chartWidth = outerWidth - margin.left - margin.right;
            var chartHeight = outerHeight - margin.top - margin.bottom;
            if (!isSmall) {$('#column1').children().remove();}
            var quiz = quizname;
            var attemptsarray = model.computeBarHeights(quiz);
            var info = model.getBasicInfo(quiz);
            var infoOverall = model.getInfoOverAll();
            var avrOverall = infoOverall[0];
            var sdOverall = infoOverall[1];

            var xScaleDomain = [];

            if (!isSmall) {
                for (var i = 1; i <= attemptsarray.length; i++) {
                    xScaleDomain.push(i);
                }

                var xScale = d3.scale.ordinal()
                                .domain(xScaleDomain)
                                .rangeRoundBands([margin.left,outerWidth-margin.right],0.05);

                var yScale = d3.scale.linear()
                                .domain([0, Math.max.apply(Math,attemptsarray)])
                                .range([outerHeight - margin.bottom, margin.top]);

                var yscaleticks = d3.scale.linear() //scale is a function!!!!!
                                    .domain([Math.max.apply(Math,attemptsarray),0])
                                    .range([margin.top,outerHeight-margin.bottom]);           
            }
            else {
                for (var i = 1; i <= maxX; i++) {
                    xScaleDomain.push(i);
                }

                var xScale = d3.scale.ordinal()
                                .domain(xScaleDomain)
                                .rangeRoundBands([margin.left,outerWidth-margin.right],0.05);

                var yScale = d3.scale.linear()
                                .domain([0, maxY])
                                .range([outerHeight - margin.bottom, margin.top]);

                var yscaleticks = d3.scale.linear() //scale is a function!!!!!
                                    .domain([maxY,0])
                                    .range([margin.top,outerHeight-margin.bottom]);           

            }
            var xAxis = d3.svg.axis()
                            .scale(xScale)
                            .orient("bottom");
            var yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient("left")
                            .ticks(5);

            var svg = d3.select(parentDiv).append("svg")
                        .attr("class", "chart")
                        .attr("width",outerWidth)
                        .attr("height",outerHeight);

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
            }

            if (!isSmall) {
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

            else {
                //xaxis
                svg.append("g")
                    .attr("class","small-axis")
                    .attr("transform", "translate(0,"+(chartHeight + margin.top)+")")
                    .call(xAxis);

                //yaxis
                svg.append("g")
                    .attr("class","small-axis")
                    .attr("transform", "translate("+(margin.left)+",0)")
                    .call(yAxis);                
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
        }

        /**
        hides the legend, removes previous plots,
        and draw viewall mode of bar graphs
        **/
        function drawAllAttemptsBarGraphs(){
            $('#column1').children().remove();
            $('#legend').hide();
            var quizzesArray = model.getQuizzesArray();

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
            var overallMaxY = 0; var overallMaxX = 0;
            for (var i = 0; i < numRows; i++) {
                for (var j=0; j < numCols; j++) {
                    if (i*numCols+j < quizzesArray.length) {
                        var thisQuiz = quizzesArray[i*numCols+j];
                        var barHeights = model.computeBarHeights(thisQuiz);
                        if (barHeights.length > overallMaxX) {overallMaxX = barHeights.length;}
                        for (var k in barHeights) {
                            if (barHeights[k] > overallMaxY) {overallMaxY = barHeights[k];}
                        }
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
                        var margin = { top: 10, right: 5, bottom: 20, left: 25};
                        drawAttemptsBarGraph(quizname, parentDiv, outerWidth, outerHeight, margin, overallMaxX, overallMaxY, true);
                    }
                }
            }
            //x and y axes labels
            var allbars_xaxislabel = d3.select('#column1').append("div")
                            .attr("class", "viewall-xaxislabel")
                            .text("Number of Attempts for Each Assignment");   
            // allbars_xaxislabel.attr();        
            d3.select('#column1').append("div")
                            .attr("class", "viewall-yaxislabel")
                            .text("Number of Students");            
        }

        //initial graph
        model.calcAverage();
        drawAttemptsScatter(model.getQuizzesArray()[0], '#column1', scatter_outerWidth, scatter_outerHeight, scatter_margin, false);
            
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