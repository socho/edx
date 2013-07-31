var gradeDistr = (function() {
  
    var exports = {};
  
////////////////////////////////// global variables 
//stuff goes here    
////////////////////////////////// helper functions
//stuff goes here
    function Model(){
        //define peopleDict
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

        function getPeopleData(){return peopleData;}

        function getQuizData(quizname) {
            return quizzes[quizname];
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
                if (i < Math.round(totalNumPeople*lowPct/100)){bottomArray.push(peopleArray[i]);}
                else if (i < Math.round(totalNumPeople*highPct/100)){middleArray.push(peopleArray[i]);}
                else {topArray.push(peopleArray[i]);}
            }

            bottomArray
            return [bottomArray,middleArray,topArray];
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

    }

    function View(div, model, controller){


        div.append(
         '<div class="container">'
        +   '<div class = "assignment-row">'
        +   '<div class = "btn-group">'
        +       '<button type = "button" class="btn btn-default btn-l"><span class="glyphicon glyphicon-arrow-left"></span></button>'
        +       '<div class = "btn-group">'
        +           '<button type = "button" class="btn btn-default dropdown-toggle" data-toggle = "dropdown">Assignment<span class="caret"></span></button>'
        +           '<ul class="dropdown-menu">'
        +           '</ul>'
        +       '</div>'
        +       '<button type = "button" class="btn btn-default btn-r"><span class="glyphicon glyphicon-arrow-right"></span></button>'
        +   '</div>'
        +'</div>'
        +'<div class = "body-content">'
        +   '<div class = "row">'
        +       '<div class="col-lg-8">1</div>'
        +       '<div class="col-lg-4" id="column2"></div>'
        +   '</div>'
        +'</div>'
        );

        // $('.col-lg-8').append('<div class = "graph-container"></div>');
           //  var svg_w = 700;
           //  var svg_h = 100;

           //  var dataset = quizdata["Quiz 21"];
           //  var bardata = dataset.map(function(item){
           //      return item.grade;
           //  });
           // console.log(bardata);

           //  var x = d3.scale.linear()
           //          .domain([0,10])
           //          .range([0,svg_w]);

           //  var histogramData = d3.layout.histogram()
           //              .bins(5)(bardata);

           //  console.log(histogramData);

           //  var svg = d3.select(".graph-container").append("svg")
           //          .attr("width",svg_w)
           //          .attr("height",svg_h)
           //          .append("g");
           //  var bars = svg.selectAll(".bar")
           //          .data(histogramData)
           //          .enter().append("g")
           //          .attr("class","bar")
            
           //  bars.append("rect")
           //      .attr("x", function(d){
           //          return d.x*20;
           //      })
           //      .attr("y", 0)
           //      .attr("width", function(d){return (d.dx*20-5)})
           //      .attr("height", function(d){return d.y;});


        // COLUMN 2
        //slider
        var sliderDiv = $('<div id="sliderbg">');
        sliderDiv.css({ 
            'background-color': '#fff', 
            'border': 'solid 1px black',
            'border-radius': '10px', 
            'width': '300px', 
            'height': '95px',
            'padding': '0px 15px 0px 7px',
            'margin-top': '5px'
        });

        var sliderObj = $('<div id="slider">')
        var labelSlider = $('<p><label for="amount">Grade range:</label><input id="amount" style="border: 0; background-color: #fff; color: #f6931f; font-weight: bold;" /></p>');
        sliderObj.slider({
            range: "min",
            min: 0,
            max: 100,
            values: [ 25, 75 ],
            slide: function( event, ui ) {
                $( "#amount" ).val( " %" + ui.values[ 0 ] + " - %" + ui.values[ 1 ] );
            }
        }).slider('pips', {
             first: 'label',
            last: 'label',
            rest: false,
        });

        $( "#amount" ).val( " %" + $( "#slider" ).slider( "values", 0 ) +
      " - %" + $( "#slider" ).slider( "values", 1 ) );

        var legend = $('<div id="legend"></div>');
        var labelLegend = $('<label for="legend">Legend:</label>');
        legend.css( {
            'border': '1px solid black',
            'border-radius': '10px',
            'width': '300px',
            'height': '200px',
            'padding': '5px',
            'margin-top': '5px'
        });

        var checkboxes = $('<div id="checkboxes-div"></div>');
        var labelQuiz = $('<label for="ops">Averaged Over:</label><br>');
        checkboxes.css( {
            'border': '1px solid black',
            'border-radius': '10px',
            'width': '300px',
            'height': '200px',
            'padding': '5px',
            'margin-top': '5px'
        });


        
        $('#column2').append(sliderDiv, legend, checkboxes);
        $('#sliderbg').append(labelSlider, sliderObj);
        $('#legend').append(labelLegend);
        $('#checkboxes-div').append(labelQuiz);
        for (var key in quizzes) {
            var noSpaceKey = key.replace(/\s+/g, '');
            $('#checkboxes-div').append('<input style="margin-left: 20px; margin-bottom: 5px;" type="checkbox" value="' + noSpaceKey + '" name="' + noSpaceKey + '">' + key +  '<br>');
        }

       //NAVIGATION
        var dropdown = $('.dropdown-menu');
        for (var key in quizzes) {
            var link = $('<li id="' + key + '"><a>' + key + '</a></li>');
            dropdown.append(link);
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
    gradeDistr.setup($('.gradeDistr'));

});