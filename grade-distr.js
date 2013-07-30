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