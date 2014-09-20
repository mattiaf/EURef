var margin = {top: 20, right: 50, bottom: 50, left: 80},
    width = 450 //- margin.left - margin.right,
    height = 450 //- margin.top - margin.bottom;


// setup fill color
var domainperc = d3.range(0,100,100/8)
var cValue = d3.scale.linear()
    .domain(domainperc).range(colorbrewer.RdBu[8]);

// add the graph canvas to the body of the webpage
var svg = d3.select("#area2").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .attr("fill", "#7D8E9C")//7D8E9C
    .style("opacity", 0);




//var PopValue = function(d) { return  d.citizens_value ;}, // data -> value
//    PopScale = d3.scale.log().range([0, width]), // value -> display
//    PopMap = function(d) { return PopScale(PopValue(d));}, // data -> display
//    PopAxis = d3.svg.axis().scale(PopScale).tickFormat(function(d){return PopScale.tickFormat(4,d3.format(",d"))(d)}).orient("bottom");
//
//	
//var GDPpcValue = function(d) { return  d.GDP_pc  ;}, // data -> value
//    GDPpcScale = d3.scale.linear().range([height, 0]), // value -> display
//    GDPpcMap = function(d) { return GDPpcScale(GDPpcValue(d));}, // data -> display
//    GDPpcAxis = d3.svg.axis().scale(GDPpcScale).orient("left");


// y axis
var PopValue = function(d) { return  d.citizens_value ;}, // data -> value
    PopScale = d3.scale.log().range([height,1]), // value -> display
    PopMap = function(d) { return PopScale(PopValue(d));}, // data -> display
    PopAxis = d3.svg.axis().scale(PopScale).tickFormat(function(d){return PopScale.tickFormat(4,d3.format(",d"))(d)}).orient("left");

// x axis	
var GDPpcValue = function(d) { return  +d.GDP_pc  ;}, // data -> value
    GDPpcScale = d3.scale.linear().range([0, width]), // value -> display
    GDPpcMap = function(d) { return GDPpcScale(GDPpcValue(d));}, // data -> display
    GDPpcAxis = d3.svg.axis().scale(GDPpcScale).orient("bottom");


// load data
d3.csv("data/destinations_immigrants.csv", function(error, data) {


	//FILTER SELECTION
    data = data.filter(function(row) {
        return row['AGE'] == AGE & row['CITIZEN'] == CITIZEN  & row['SEX'] == SEX;
    })

console.log(data.length);



data.forEach(function(d) {
    d.Percentage = +d.Percentage;
    d.Total = +d.Total;

    d.Unemployment = +d.Unemployment;
    d.citizens_value = +d.citizens_value;
    d.GDP_pc = +d.GDP_pc;

     d.SEX = ''; // DON'T PRINT SEX, CITIZEN, AGE
     d.CITIZEN = '';
     d.AGE = '';

  	}); //end forEach

 
 
var minpop = d3.min(data, PopValue)/3
if (minpop == 0) {minpop = 1}
    // don't want dots overlapping axis, so add in buffer to data domain
  PopScale.domain([minpop, d3.max(data, PopValue)*3.5]);
  GDPpcScale.domain([d3.min(data, GDPpcValue)/3, d3.max(data, GDPpcValue)+15000]);


// GRAPH 1

	//background
	svg.append("svg:rect")
	.attr("x", -100)
	.attr("y", -20)

	.attr("width", width+ margin.left + margin.right +110)
   .attr("height", height + margin.top + margin.bottom+20)
    .attr("fill", "#ffffff")

// IF NOT ENOUGH DATA, DISPLAY AN ERROR MESSAGE
if (data.length < 2){svg.append("svg:text").attr("x",10).attr("y",height/2)
	.style("fill","#21262B")
	.style("font-size","18px")
	.html('<tspan x="30" dy="15">NOT ENOUGH DATA for ' + CITIZEN + " (" + SEX + ", " + AGE + 
	') </tspan><tspan x="30" dy="15">Please select a different combination of </tspan><tspan x="30" dy="15">Country of Origin, Sex and Age Group</tspan>' )}



var scalelog= 2
var scalecircles=10
var legend=svg.append("legend")
var nnn=16, shift=2; var suffix='min'
var heightlegend =80
var sizey = heightlegend/(nnn)
var ytext = sizey/(4-1)*0.95
var position_legend_color_x = width-30
var position_legend_color_y = 40


keys = legend.selectAll("key").data(cValue.range())
rangecols=d3.range(0,100, d3.max(domainperc)/(nnn))
svg.selectAll("key").data(rangecols).enter().append("svg:rect") //for continuus values
		.attr("x",position_legend_color_x)
		.attr("y",function(d,i){return position_legend_color_y+heightlegend-sizey-i*sizey})
		.attr("height",sizey)
		.attr("width",25)
                .attr("fill", function(d,i){return cValue(rangecols[i])})

legendvalues = [0,25,50,75,100]
nlegend=5

svg.append("svg:text").attr("x",position_legend_color_x-40).attr("y",position_legend_color_y-30).text("Acceptance").attr("font-size","15pt");



var formatperc = d3.format('f');
var legendtext= svg.selectAll("key").data(legendvalues).enter().append("svg:text") // text
        	.attr("x",position_legend_color_x+28)
		.attr("y",function(d,i){return position_legend_color_y+heightlegend-i*heightlegend/(nlegend-1)})
		.attr("font-size","15pt")
                .text(function(d){return formatperc(d)+'%'})




var sizes_circles=[10,100, 1000,10000]
keys_circles = legend.selectAll("keycircles").data(sizes_circles)

var position_legend_circle_x = 45
var position_legend_circle_y = 100


svg.append("svg:text").attr("x",15).attr("y",position_legend_circle_y-85).style("font-weight","bold")
				.text('Refugees ('+SEX+','+AGE+')').attr("font-size","15pt");

svg.append("svg:text").attr("x",15).attr("y",position_legend_circle_y-65).style("font-weight","bold")
				.text('from '+CITIZEN).attr("font-size","15pt");




  // y-axis
  svg.append("g").attr("class", "y axis")
	.call(PopAxis).append("text").attr("class", "label").attr("transform", "rotate(-90)")
    .attr("y", -74).attr("dy", ".71em").style("text-anchor", "end")

	.text("Citizens of " + CITIZEN + " living in the country").style("font-size", "14pt");

//x axis
  svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + (height-margin.top-24) + ")")
	.call(GDPpcAxis).append("text").attr("class", "label")
     .attr("x", width).attr("y", 40).style("text-anchor", "end")

	.text("GDP pro capita").style("font-size", "14pt");


svg.selectAll("keycircles").data(sizes_circles).enter().append("svg:circle")
        .attr("cx", position_legend_circle_x)
        .attr("cy", position_legend_circle_y)
        .attr("class","pointmap")
        .attr("r", function(d,i){var radius = Math.log(d/scalelog)/ Math.log(10)*scalecircles;
        						return radius});

svg.append("svg:rect")
        .attr("x",position_legend_circle_x)
		.attr("y",position_legend_circle_y-Math.log(sizes_circles[2]/scalelog)/ Math.log(10)*scalecircles*1.6)
		.attr("height",Math.log(sizes_circles[2]/scalelog)/ Math.log(10)*scalecircles*1.55)
	    .attr("width",Math.log(sizes_circles[2]/scalelog)/ Math.log(10)*scalecircles*2)
        .attr("fill", "#ffffff")//7D8E9C

var legendcircles= svg.selectAll("keycircles").data(sizes_circles).enter().append("svg:text") // text
                .attr("x",position_legend_circle_x)
		.attr("y",function(d,i){return position_legend_circle_y-Math.log(d/scalelog)/ Math.log(10)*scalecircles+2})
		.attr("font-size","13pt")
                .text(function(d){return d})


// draw dots
svg.selectAll(".dot").data(data).enter().append("circle")
	.attr("class", "dot")
	.attr("id", function(d) { return d.GEO}) 
	.attr("r", function(d) { return Math.log(d.Total/scalelog)/Math.log(10) * scalecircles })
	.attr("cx", GDPpcMap)
	.attr("cy" ,  PopMap)
	.style("fill", function(d) {return cValue(d.Percentage);}) 
    .on("mouseover", function(d) {
	var name_dest = d3.select(this).attr("id") 
	var a = d3.selectAll('#'+name_dest)
	var formatpop = d3.format('.1f');
	var formatref = d3.format('.0f');
	var pop_formatted = formatpop(PopValue(d))

	tooltip.transition()
	   .duration(200)
	   .style("opacity", 1);
	   d3.select(this).attr("r", function(d) { return Math.log(d.Total/scalelog)/Math.log(10) * scalecircles*1.5 })

	    tooltip.html("<big>" + d.GEO + "</big> <small> (GDP:" + GDPpcValue(d) + "E pro capita) </small>" 
		  + "<small><br/>" + PopValue(d) + " people from " + CITIZEN + " living in the country  "
		  + "<br/>"+ d.Total + " refugees from " + CITIZEN + " (" + SEX + ", " + AGE + ")"  
		  + "<br/>Accepted: "  + d.Percentage   
		   + "% <br/></small>"
		  
		  )
	   .style("left", (d3.event.pageX + 35) + "px")
	   .style("top", (d3.event.pageY - 28) + "px");
	   
	 })


.on("mouseout", function(d) {
    tooltip.transition()
   .duration(500)
   .style("opacity", 0);
  d3.select(this).attr("r", function(d) { return Math.log(d.Total/scalelog)/Math.log(10) * scalecircles })
	
   var name_dest = d3.select(this).attr("id") 
	  var a = d3.selectAll('#'+name_dest)


});









});