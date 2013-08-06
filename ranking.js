var rankingPlot = (function() {
  
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
            var sd = Math.sqrt(sqDiffSum / sum);

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

        function calcAvrOfAvr() {
            var sum = 0; var numPeople = 0;
            for (var person in peopleData) {
                sum += peopleData[person]["avr"];
                numPeople += 1;
            }
            return sum / numPeople;
        }

        function printInfo() {
            for (var person in peopleData) {
                var info = peopleData[person]["Quiz 25"];
                var avg = peopleData[person].avr;
                if (info != undefined) {
                    console.log('Grade on Quiz 25: ', peopleData[person]["Quiz 25"].grade);
                    console.log('Over all avg grade in class', avg);
                }
                
            }
        }

        return {printInfo: printInfo, getPeopleData: getPeopleData, getQuizzesArray: getQuizzesArray, getBasicInfo: getBasicInfo, calcAverage: calcAverage, calcAvrOfAvr: calcAvrOfAvr, on: handler.on};
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
        //setup variables for Graph
        ////////
        var outerWidth = parseInt($('#column1').css("width"))-parseInt($('#column1').css("padding-left"))-parseInt($('#column1').css("padding-right"));
        var outerHeight = 600;

        var margin = { top: 20, right: 20, bottom: 40, left: 40 };

        var chartWidth = outerWidth - margin.left - margin.right;
        var chartHeight = outerHeight - margin.top - margin.bottom;


        model.calcAverage();
        var dataset = [];
        var data = [];
        var dataDict = model.getPeopleData();
        for (var person in dataDict) {
            if ("Quiz 25" in dataDict[person]){
                dataset.push({"username": person ,"grade": dataDict[person]["Quiz 25"]["grade"], "avr": dataDict[person]["avr"]});
            }
        }

        for (var person in dataset) {
            data.push({ "grade": dataset[person].grade , "avg": dataset[person].avr })
        
            // data.push(String('(' + dataset[person].grade + ', ' + dataset[person].avr + ')'));
        }


        function sortByRank(object, val2sort) {
            console.log(object[0]);
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
                    object[i]["avr-rank"] = i+1;
                }
            }
            else {
                for (var i = 0; i < object.length; i++) {
                    object[i]["grade-rank"] = i+1;
                }
            }
            
            return object;

        }

        
        var info = model.getBasicInfo("Quiz 25");
        var result = sortByRank(dataset, "avr"); //sorted by avg
        var result2 = sortByRank(result, "grade"); //sorted by grade
        console.log(result2);
        console.log('num of students', info[0]);

        
        var avrOfAvr = model.calcAvrOfAvr();

        var xScale = d3.scale.linear() //scale is a function!!!!!
                        .domain([0, info[0]])
                        .range([margin.left,outerWidth-margin.right]);
        var yScale = d3.scale.linear() //scale is a function!!!!!
                        .domain([0, info[0]])
                        .range([outerHeight-margin.bottom,margin.top]);

        var xAxis = d3.svg.axis()
                        .scale(xScale)
                        .orient("bottom")
                        .ticks(10);
        var yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient("left")
                        .ticks(10);

        var svg = d3.select(".chart-container").append("svg")
                    .attr("width",outerWidth)
                    .attr("height",outerHeight);

        svg.selectAll("circle")
            .data(result2)
            .enter()
            .append("circle")
            .attr("class","datapoints")
            .attr("cx", function(d){
                return xScale(d["avr-rank"]);
            })
            .attr("cy", function(d){
                return yScale(d["grade-rank"]);
            })
            .attr("r", 2);

        // svg.selectAll("text")
        //  .data(dataset)
        //  .enter()
        //  .append("text")
        //  .text(function(d){
        //      return d[0] + ", " + d[1];
        //  })
        //  .attr("x", function(d){
        //      return xScale(d[0]);
        //  })
        //  .attr("y", function(d){
        //      return yScale(d[1]);
        //  })
        //  .attr("font-size",11)
        //  .attr("fill","red");

        svg.append("g")
            .attr("class","axis")
            .attr("transform", "translate(0,"+(outerHeight-margin.bottom)+")")
            .call(xAxis);

        svg.append("g")
            .attr("class","axis")
            .attr("transform", "translate("+margin.left+",0)")
            .call(yAxis);

        svg.append("line")
            .attr('x1', margin.left)
            .attr('x2', outerWidth-margin.right)
            .attr('y1', outerHeight-margin.bottom)
            .attr('y2', margin.top)
            .style("stroke", "red")
            .style("stroke-dasharray", ("5, 5"));

        //top students should be above the line and more towards the right 
        //if they did well on this specific exam
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
    rankingPlot.setup($('.ranking'));

});