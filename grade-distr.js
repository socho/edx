var gradeDistr = (function() {
    
    var exports = {};
    
////////////////////////////////// global variables 
//stuff goes here    
////////////////////////////////// helper functions    
//stuff goes here

    function Model(){


    }

    function Controller(model){

    }

    function View(div, model, controller){
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
        +       '<div class="col-lg-4" id="column2"></div>'
        +   '</div>'
        +'</div>'
        );

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

        var quizzes = $('<div id="quizzes"></div>');
        var labelQuiz = $('<label for="ops">Averaged Over:</label><br>');
        quizzes.css( {
            'border': '1px solid black',
            'border-radius': '10px',
            'width': '300px',
            'height': '200px',
            'padding': '5px',
            'margin-top': '5px'
        });


        
        $('#column2').append(sliderDiv, legend, quizzes);
        $('#legend').append(labelLegend);
        $('#sliderbg').append(labelSlider, sliderObj);
        $('#quizzes').append(labelQuiz);
        for (var key in quizdata) {
            var noSpaceKey = key.replace(/\s+/g, '');
            $('#quizzes').append('<input style="margin-left: 20px; margin-bottom: 5px;" type="checkbox" value="' + noSpaceKey + '" name="' + noSpaceKey + '">' + key +  '<br>');
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