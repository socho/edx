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