var attempts = (function() {
  
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



        var peopleData = makeFullData(200);
        console.log(peopleData);

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
            console.log(assignment,numPeople,avr,sd);
            return [numPeople, avr, sd];           
        }

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

        function getInfoOverAll() {
            var sum = 0; var numPeople = 0;
            for (var person in peopleData) {
                sum += parseFloat(peopleData[person]["avr"]);
                // console.log(person,'avr',peopleData[person]["avr"]);
                numPeople += 1;
            }
            // console.log('sum',sum,'numpeople',numPeople)
            var avr = sum / numPeople;

            //sd
            var sqDiffSum = 0;
            for (var person in peopleData) {
                sqDiffSum += Math.pow(peopleData[person]["avr"]-avr,2);
            }
            var sd = Math.sqrt(sqDiffSum / numPeople);
            // console.log(avr,sd);
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
        +           '<button id="asgn-nav" type = "button" class="btn btn-default dropdown-toggle" data-toggle = "dropdown">Ex 1<span class="caret"></span></button>'
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



       ////////
       //NAVIGATION
       ////////
        var dropdown = $('.dropdown-menu');
        for (var i = 0; i < problemIDs.length; i++) {
            var key = problemIDs[i]
            var link = $('<li id="' + key + '"><a>' + key + '</a></li>');
            dropdown.append(link);
        } 

        var tooltip = d3.select("body").append("div")   
            .attr("class", "tooltip")               
            .style("opacity", 0);

        ////////
        //setup variables for Graph
        ////////
        var outerWidth = parseInt($('#column1').css("width"))-parseInt($('#column1').css("padding-left"))-parseInt($('#column1').css("padding-right"));
        var outerHeight = 600;

        var margin = { top: 20, right: 20, bottom: 60, left: 50 };

        var chartWidth = outerWidth - margin.left - margin.right;
        var chartHeight = outerHeight - margin.top - margin.bottom;


        

        model.calcAverage();
        drawGraph("Ex 1");


        function drawGraph(quizname) {
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
            // for (var i = -2; i <= 2; i++) {
            //     xaxisData.push(avrOverall + i * sdOverall);
            //     //yaxisData.push(Math.max(Math.min((info[1] + i * info[2])*10,100),0));
            //     yaxisData.push(info[1] + i * info[2]);
            // }
            // console.log(xaxisData,yaxisData);
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

            var svg = d3.select(".chart-container").append("svg")
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
                    // console.log(d);   
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

            // //x ticks description
            // var desc = ["avr-2sd","avr-sd","avr","avr+sd","avr+2sd"]
            // for (var i = 0; i < xaxisData.length; i++) {
            //     svg.append("text")
            //         .attr("class", "ticks-desc")
            //         .attr("x", xScale(xaxisData[i]))
            //         .attr("y", chartHeight+margin.top)
            //         .attr("dy", $('.xaxis-label').height()*2)
            //         .attr("text-anchor", "middle")
            //         .text(desc[i]);
            //     }
            // //y ticks description
            // for (var i = 0; i < yaxisData.length; i++) {
            //     svg.append("text")
            //         .attr("class", "ticks-desc")
            //         .attr("x", margin.left)
            //         .attr("dx", -margin.left*0.4)
            //         .attr("y", yScale(yaxisData[i]))
            //         .attr("dy", $('.yaxis-label').height()+2)
            //         .attr("text-anchor", "middle")
            //         .text(desc[i]);
            //     }
        }

        var legend = $('<div id="legend"></div>');

        var totalLabel = $('<div id="total"><div>Number of Students: </div><p></p></div>');
        var averageLabel = $('<div id="average"><div style="display: inline;">Average: </div><p></p></div>');
        var sdLabel = $('<div id="sd"><div style="display: inline;">Standard Deviation: </div><p></p></div>');

        
        legend.append(totalLabel, averageLabel, sdLabel);
       
        var lowerLabel = $('<div id="lowerLabel"></div>');
        var upperLabel = $('<div id="upperLabel"></div>');



        $('#column2').append(legend); // legend, checkboxes
        // $('#sliderbg').append(labelSlider, sliderObj,lowerLabel, upperLabel);
        // $('ui-slider-range ui-widget-header ui-corner-all').css("background", "darkgray");

        $("#lowerLabel").text(25);
        $("#lowerLabel").css('top',"-10px");
        $("#lowerLabel").css('left', String(0.01 * 25 * parseFloat($('#slider').css("width")) - 0.5 * parseFloat($("#lowerLabel").css("width")))+"px"); 
        $("#upperLabel").text(75);
        $("#upperLabel").css('top',"-10px");
        $("#upperLabel").css('left', String(0.01 * 75 * parseFloat($('#slider').css("width")) - parseFloat($("#lowerLabel").css("width")) - 0.5 * parseFloat($("#upperLabel").css("width")))+"px");
        
        function displayBasicInfo(assignment) {
            var info = model.getBasicInfo(assignment); 
            $('#total p').text(info[0]);
            $('#average p').text(info[1].toFixed(3));
            $('#sd p').text(info[2].toFixed(3));
        }

        displayBasicInfo("Ex 1");

        ///////
        ///EVENT LISTENERS
        ///////
        dropdown.find('li').each(function() {
            $(this).on('click', function() {
                //inNav = true;
                var quizname = String($(this).attr('id'));
                $('#asgn-nav').html(quizname+"<span class='caret'></span>");
                drawGraph(quizname);
            });
        });

        $('.btn-l').on('click', function(){
            var quizzesArray = model.getQuizzesArray();
            var index = quizzesArray.indexOf($('#asgn-nav').text());
            if (index != 0){
                $('#asgn-nav').html(quizzesArray[index-1]+"<span class='caret'></span>");
                displayBasicInfo(quizzesArray[index-1]);
                drawGraph(quizzesArray[index-1]);
            }
        });

        $('.btn-r').on('click', function(){
            var quizzesArray = model.getQuizzesArray();
            var index = quizzesArray.indexOf($('#asgn-nav').text());
            if (index != quizzesArray.length-1){
                $('#asgn-nav').html(quizzesArray[index+1]+"<span class='caret'></span>");
                displayBasicInfo(quizzesArray[index+1]);
                drawGraph(quizzesArray[index+1])
            }
        });

        var modes = $('<ul class="nav nav-tabs"></ul>');
        var leftButton = $('<li class="active"><a href="#">Scatter Plot View</a></li>');
        var rightButton = $('<li><a href="#">Bar Graph View</a></li>');

        modes.append(leftButton, rightButton);
        modes.css('padding', 'auto auto');
        $('#column2').prepend(modes, '<br>');

        leftButton.on('click', function() {
            leftButton.attr("class","active");
            rightButton.attr("class","");
            drawGraph($('#asgn-nav').text());
        });

        rightButton.on('click', function() {
            leftButton.attr("class","");
            rightButton.attr("class","active");
            changeToBar();
        });

        function changeToBar() {
            $('svg').remove();
            var dataset = [];
            var dataDict = model.getPeopleData();
            var counter = 0;
            var quiz = $('#asgn-nav').text();
            var attemptsarray = [0,0,0,0,0,0,0,0,0,0,0];
            var maxattempt = 0;
            for (var person in dataDict) {
                
                if (quiz in dataDict[person]){
                    //pushes in the person's score on problem and attempts
                    dataset.push({"username": person ,"attempts": dataDict[person][quiz], "avrattempts": dataDict[person]["avr"]});

                }
            }

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
            console.log('attempt array', attemptsarray);

            //variables for bar chart
            var attemptsbar_outerWidth = parseInt($('#column1').css("width"))-parseInt($('#column1').css("padding-left"))-parseInt($('#column1').css("padding-right"));
            var attemptsbar_outerHeight = 600;

            var attemptsbar_margin = { top: 10, right: 20, bottom: 50, left: 30 };

            var attemptsbar_chartWidth = attemptsbar_outerWidth - attemptsbar_margin.left - attemptsbar_margin.right;
            var attemptsbar_chartHeight = attemptsbar_outerHeight - attemptsbar_margin.top - attemptsbar_margin.bottom;
            console.log('outer',attemptsbar_outerWidth,'inner',attemptsbar_chartWidth);

            var info = model.getBasicInfo(quiz);
            var infoOverall = model.getInfoOverAll();
            var avrOverall = infoOverall[0];
            var sdOverall = infoOverall[1];

            var maxgradezscore = d3.max(dataset, function(d){return Math.abs(d["attempts"]-info[1])/info[2];});
            var maxavrzscore = d3.max(dataset, function(d){return Math.abs(d["avrattempts"]-avrOverall)/sdOverall;});
            var maxzscore = Math.max(maxavrzscore, maxgradezscore);

            // console.log(maxgradezscore, maxavrzscore, maxzscore);

            var xScale = d3.scale.linear() //scale is a function!!!!!
                            .domain([0, attemptsarray.length])
                            .range([attemptsbar_margin.left+10,attemptsbar_outerWidth-attemptsbar_margin.right]);
            var yScale = d3.scale.linear() //scale is a function!!!!!
                            .domain([0, Math.max.apply(Math,attemptsarray)])
                            .range([attemptsbar_margin.top,attemptsbar_outerHeight-attemptsbar_margin.bottom]);
            console.log(Math.max.apply(Math,attemptsarray));
            

            var yscaleticks = d3.scale.linear() //scale is a function!!!!!
                                .domain([Math.max.apply(Math,attemptsarray),0])
                                .range([attemptsbar_margin.top,attemptsbar_outerHeight-attemptsbar_margin.bottom]);           
            var barPadding = 2;



            var xAxis = d3.svg.axis()
                            .scale(xScale)
                            .orient("bottom")
                            .ticks(11)
            var yAxis = d3.svg.axis()
                            .scale(yscaleticks)
                            .orient("left")
                            .ticks(5);

            var svg = d3.select(".chart-container").append("svg")
                        .attr("width",attemptsbar_outerWidth)
                        .attr("height",attemptsbar_outerHeight);

            svg.selectAll('rect')
                .data(attemptsarray)
                .enter()
                .append("rect")
                .attr("x", function(d,i) {
                    return xScale(i);
                })
                .attr("y", function(d) {
                    return attemptsbar_margin.top+attemptsbar_chartHeight-(yScale(d)); //because the svg's will be upside down; height-data value
                })
                .attr("width", attemptsbar_chartWidth / attemptsarray.length - barPadding)
                .attr("height", function(d) {
                    return yScale(d)
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

            // svg.selectAll("text")
            //     .data(attemptsarray)
            //     .enter()
            //     .append("text")
            //     .text(function(d) {
            //         return d;
            //     })
            //     .attr("x", function(d, i) {
            //         return i * (attemptsbar_chartWidth / attemptsarray.length) + (attemptsbar_chartWidth / attemptsarray.length - barPadding) / 2;
            //     })
            //     .attr("y", function(d) {
            //         return attemptsbar_margin.top + attemptsbar_chartHeight - yScale(d) + 14;
            //     })
                

                //Y-AXIS LABEL
            svg.append("text")
                .attr("class", "yaxis-label")
                .attr("x",0)
                .attr("y", 0)
                .attr("transform", function(d) {return "rotate(-90)" })
                .attr("dx", -attemptsbar_margin.top-chartHeight/2)
                .attr("dy", margin.left*0.2)
                .attr("font-weight", "bold")
                .attr("text-anchor", "middle")
                .text("# Number of Students");



            //X-AXIS LABEL
            svg.append("text")
                .attr("class", "xaxis-label")
                // .attr("x",chartWidth/2)
                .attr("x", chartWidth/2)
                .attr("y", chartHeight+attemptsbar_margin.top)
                .attr("dy", attemptsbar_margin.bottom+10)
                .attr("font-weight", "bold")
                .attr("text-anchor", "middle")
                .text("# Number of Attempts");

            //xaxis
            svg.append("g")
                .attr("class","axis")
                .attr("transform", "translate(0,"+(attemptsbar_chartHeight + attemptsbar_margin.top)+")")
                .call(xAxis);

            //yaxis
            svg.append("g")
                .attr("class","axis")
                .attr("transform", "translate("+(attemptsbar_margin.left+10)+",0)")
                .call(yAxis);


        }

            

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
    attempts.setup($('.attempts'));

});