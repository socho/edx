var gradeDistr = (function() {
    
    var exports = {};
    
////////////////////////////////// global variables 
//stuff goes here    
////////////////////////////////// helper functions
Object.prototype.keys = function ()
{
  var keys = [];
  for(var i in this) if (this.hasOwnProperty(i))
  {
    keys.push(i);
  }
  return keys;
}  
//stuff goes here


    function Model(){
        function getQuizData(quizname) {
            return quizzes[quizname];
        }

        function getQuizNames() {
            return quizzes.keys();
        }

        function getPeopleData() {}
        return {getQuizData: getQuizData, getQuizNames: getQuizNames};

    }

    function Controller(model){

    }

    function View(div, model, controller){
        console.log(quizzes["Quiz 21"].length)
        console.log(quizzes["Quiz 22"].length)
        console.log(quizzes["Quiz 23"].length)
        console.log(quizzes["Quiz 24"].length)
        console.log(quizzes["Quiz 25"].length)



        div.append(
         '<div class="container">'
        +   '<div class = "assignment-row">'
        +   '<div class = "btn-group">'
        +       '<button type = "button" class="btn btn-default btn-l">L</button>'
        +       '<div class = "btn-group">'
        +           '<button type = "button" class="btn btn-default dropdown-toggle" data-toggle = "dropdown">Assignment<span class="caret"></span></button>'
        +           '<ul class="dropdown-menu">'
        +               '<li><a> first link </a></li>'
        +           '</ul>'
        +       '</div>'
        +       '<button type = "button" class="btn btn-default btn-r">R</button>'
        +   '</div>'
        +'</div>'
        +'<div class = "body-content">'
        +   '<div class = "row">'
        +       '<div class="col-lg-8">1</div>'
        +       '<div class="col-lg-4">2</div>'
        +   '</div>'
        +'</div>'
        );

        $('.col-lg-8').append('<div class = "graph-container"></div>')
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
      " - %" + $( "#slider" ).slider( "values", 1 ) )

        var legend = $('<div id="legend"></div>');
        var labelLegend = $('<label for="legend">Legend:</label>')
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
        $('#legend').append(labelLegend);
        $('#sliderbg').append(labelSlider, sliderObj);
        $('#checkboxes-div').append(labelQuiz);
        for (var key in quizzes) {
            var noSpaceKey = key.replace(/\s+/g, '');
            $('#checkboxes-div').append('<input style="margin-left: 20px; margin-bottom: 5px;" type="checkbox" value="' + noSpaceKey + '" name="' + noSpaceKey + '">' + key +  '<br>');
        }


    }


    //setup main structure of app
    function setup(div) {

        var model = Model();
        var controller = Controller(model);
        view = View(div, model, controller);
        exports.view = view;

    }; 
    
    exports.setup = setup;
    exports.model = Model;

    exports.controller = Controller;

    return exports;
}());

$(document).ready(function() {
    gradeDistr.setup($('.gradeDistr'));
});