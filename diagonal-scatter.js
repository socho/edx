var diagScatter = (function() {
  
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

        function getQuizzesArray() {
            var quizzesArray = [];
            for (var quiz in quizzes){
                console.log(quiz);
                quizzesArray.push(quiz);
            }
            return quizzesArray;
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

            return [numPeople, avr, sd];           
        }

        function calcAverage() {
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


        // model.on('changed', function(data) {
        //     updateGraph(data);
        //     //updateGraph(data);
        // });

       ////////
       //NAVIGATION
       ////////
        var dropdown = $('.dropdown-menu');
        for (var key in quizzes) {
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
        drawGraph("Quiz 21");


        function drawGraph(quizname) {
            $('svg').remove();
            var dataset = [];
            var dataDict = model.getPeopleData();
            for (var person in dataDict) {
                if (quizname in dataDict[person]){
                    dataset.push({"username": person ,"grade": dataDict[person][quizname]["grade"], "avr": dataDict[person]["avr"]});
                }
            }

            var info = model.getBasicInfo(quizname);
            var infoOverall = model.getInfoOverAll();
            var avrOverall = infoOverall[0];
            var sdOverall = infoOverall[1];

            var xScale = d3.scale.linear() //scale is a function!!!!!
                            .domain([10*(avrOverall-d3.max(dataset, function(d){return Math.abs(avrOverall-d["avr"]);})),10*(avrOverall+d3.max(dataset, function(d){return Math.abs(avrOverall-d["avr"]);}))])
                            .range([margin.left,outerWidth-margin.right]);
            var yScale = d3.scale.linear() //scale is a function!!!!!
                            //.domain([Math.max(0,10*(info[1]-d3.max(dataset, function(d){return Math.abs(info[1]-d["grade"]);}))),Math.min(100,10*(info[1]+d3.max(dataset, function(d){return Math.abs(info[1]-d["grade"]);})))])
                            .domain([10*(info[1]-d3.max(dataset, function(d){return Math.abs(info[1]-d["grade"]);})),10*(info[1]+d3.max(dataset, function(d){return Math.abs(info[1]-d["grade"]);}))])
                            .range([outerHeight-margin.bottom,margin.top]);

            var xtoyScale = d3.scale.linear()
                                .domain([10*(avrOverall-3*sdOverall),10*(avrOverall+3*sdOverall)])
                                .range([10*(info[1]-3*info[2]),10*(info[1]+3*info[2])]);

            var xaxisData = [];
            var yaxisData = [];
            for (var i = -2; i <= 2; i++) {
                xaxisData.push(Math.max(Math.min((avrOverall + i * sdOverall)*10,100),0));
                //yaxisData.push(Math.max(Math.min((info[1] + i * info[2])*10,100),0));
                yaxisData.push(10*(info[1] + i * info[2]));
            }

            var xAxis = d3.svg.axis()
                            .scale(xScale)
                            .orient("bottom")
                            .tickValues(xaxisData)
                            // .tickFormat(function(d,i){
                            //     switch(i)
                            //     {
                            //     case 0:
                            //         return parseInt(d) + " (avr-2*sd)";
                            //     case 1:
                            //         return parseInt(d) + " (avr-1*sd)";
                            //     case 2:
                            //         return parseInt(d) + " (avr)";
                            //     case 3:
                            //         return parseInt(d) + " (avr+1*sd)";
                            //     case 4:
                            //         return parseInt(d) + " (avr+2*sd)";
                            //     }
                            // });
            var yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient("left")
                            .tickValues(yaxisData)
                            // .tickFormat(function(d,i){
                            //     switch(i)
                            //     {
                            //     case 0:
                            //         return parseInt(d) + " (avr-2*sd)";
                            //     case 1:
                            //         return parseInt(d) + " (avr-1*sd)";
                            //     case 2:
                            //         return parseInt(d) + " (avr)";
                            //     case 3:
                            //         return parseInt(d) + " (avr+1*sd)";
                            //     case 4:
                            //         return parseInt(d) + " (avr+2*sd)";
                            //     }
                            // });

            var svg = d3.select(".chart-container").append("svg")
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
                    .attr("dx", -chartWidth/10)
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
            //x ticks description
            var desc = ["avr-2sd","avr-sd","avr","avr+sd","avr+2sd"]
            for (var i = 0; i < xaxisData.length; i++) {
                svg.append("text")
                    .attr("class", "ticks-desc")
                    .attr("x", xScale(xaxisData[i]))
                    .attr("y", chartHeight+margin.top)
                    .attr("dy", $('.xaxis-label').height()*2)
                    .attr("text-anchor", "middle")
                    .text(desc[i]);
                }
            //y ticks description
            for (var i = 0; i < yaxisData.length; i++) {
                svg.append("text")
                    .attr("class", "ticks-desc")
                    .attr("x", margin.left)
                    .attr("dx", -margin.left*0.4)
                    .attr("y", yScale(yaxisData[i]))
                    .attr("dy", $('.yaxis-label').height()+2)
                    .attr("text-anchor", "middle")
                    .text(desc[i]);
                }
        }
        

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
                //displayBasicInfo(quizzesArray[index-1]);
                drawGraph(quizzesArray[index-1]);
            }
        });

        $('.btn-r').on('click', function(){
            var quizzesArray = model.getQuizzesArray();
            var index = quizzesArray.indexOf($('#asgn-nav').text());
            if (index != quizzesArray.length-1){
                $('#asgn-nav').html(quizzesArray[index+1]+"<span class='caret'></span>");
//                displayBasicInfo(quizzesArray[index+1]);
            drawGraph(quizzesArray[index+1])
            }
        });

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
    diagScatter.setup($('.diagScatter'));

});