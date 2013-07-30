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
        +       '<div class="col-lg-4">2</div>'
        +   '</div>'
        +'</div>'
        );


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