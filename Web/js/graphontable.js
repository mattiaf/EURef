// setup margins and size of plots
var margin = {top: 20, right: 50, bottom: 50, left: 80},
    width = 450 
    height = 450 
    

// setup scale of fill color (linearly proportional to acceptance rate, 0 to 100)
var domainperc = d3.range(0,100,100/8)
var cValue = d3.scale.linear()
    .domain(domainperc).range(colorbrewer.RdBu[8]);

// add the graph canvas to the body of the webpage
var svg = d3.select("#area2").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// add the tooltip area to the webpage, hidden for the moment
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .attr("fill", "#7D8E9C")//7D8E9C
    .style("opacity", 0);

// set up axis and values
// Population on x axis
var PopValue = function(d) { return  d.citizens_value ;}, // data -> value
    PopScale = d3.scale.log().range([0, width]), // value -> display
    PopMap = function(d) { return PopScale(PopValue(d));}, // data -> display
    PopAxis = d3.svg.axis().scale(PopScale).tickFormat(function(d){return PopScale.tickFormat(4,d3.format(",d"))(d)}).orient("bottom");

// set up axis and values	
// GDP pro capita on y axis
var GDPpcValue = function(d) { return  d.GDP_pc  ;}, // data -> value
    GDPpcScale = d3.scale.linear().range([height, 0]), // value -> display
    GDPpcMap = function(d) { return GDPpcScale(GDPpcValue(d));}, // data -> display
    GDPpcAxis = d3.svg.axis().scale(GDPpcScale).orient("left");


// load data
d3.csv("data/destinations_immigrants.csv", function(error, data) {

	//filter selection
    data = data.filter(function(row) {
        return row['AGE'] == AGE & row['CITIZEN'] == CITIZEN  & row['SEX'] == SEX;
    })


data.forEach(function(d) { // all values must be numeric
    d.Percentage = +d.Percentage;
    d.Total = +d.Total;

    d.Unemployment = +d.Unemployment;
    d.citizens_value = +d.citizens_value;
    d.GDP_pc = +d.GDP_pc;

  	}); //end forEach

 
// set up range of axis , leave some space left and right
var minpop = d3.min(data, PopValue)/3 // minimum population
PopScale.domain([minpop, d3.max(data, PopValue)*3.5]);
GDPpcScale.domain([0, d3.max(data, GDPpcValue)+15000]);



// creates a background
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


// ---- CREATE A LEGEND ---- //
var legend=svg.append("legend")

// some constants
var scalelog= 2
var scalecircles=10
var nnn=16, shift=2; var suffix='min'
var heightlegend =80
var sizey = heightlegend/(nnn)
var ytext = sizey/(4-1)*0.95
var position_legend_color_x = width-30
var position_legend_color_y = 40

// color legend
keys = legend.selectAll("key").data(cValue.range())
rangecols=d3.range(0,100, d3.max(domainperc)/(nnn))
svg.selectAll("key").data(rangecols).enter().append("svg:rect")
		.attr("x",position_legend_color_x)
		.attr("y",function(d,i){return position_legend_color_y+heightlegend-sizey-i*sizey})
		.attr("height",sizey)
		.attr("width",25)
        .attr("fill", function(d,i){return cValue(rangecols[i])})

legendvalues = [0,25,50,75,100]
nlegend=5

// text for color legend
svg.append("svg:text").attr("x",position_legend_color_x-40).attr("y",position_legend_color_y-30).text("Acceptance").attr("font-size","15pt");
var formatperc = d3.format('f');
var legendtext= svg.selectAll("key").data(legendvalues).enter().append("svg:text") // text
        .attr("x",position_legend_color_x+28)
		.attr("y",function(d,i){return position_legend_color_y+heightlegend-i*heightlegend/(nlegend-1)})
		.attr("font-size","15pt")
        .text(function(d){return formatperc(d)+'%'})


// text on top
svg.append("svg:text").attr("x",15).attr("y",position_legend_circle_y-85).style("font-weight","bold")
				.text('Refugees ('+SEX+','+AGE+')').attr("font-size","15pt");

svg.append("svg:text").attr("x",15).attr("y",position_legend_circle_y-65).style("font-weight","bold")
				.text('from '+CITIZEN).attr("font-size","15pt");

// circles legend
var sizes_circles=[10,100, 1000,10000]
keys_circles = legend.selectAll("keycircles").data(sizes_circles)
var position_legend_circle_x = 45
var position_legend_circle_y = 100

// circles legend
svg.selectAll("keycircles").data(sizes_circles).enter().append("svg:circle")
        .attr("cx", position_legend_circle_x)
        .attr("cy", position_legend_circle_y)
        .attr("class","pointmap")
        .attr("r", function(d,i){var radius = Math.log(d/scalelog)/ Math.log(10)*scalecircles;
        						return radius});

// makes a square to hide 1 quarter of the circles
svg.append("svg:rect")
        .attr("x",position_legend_circle_x)
		.attr("y",position_legend_circle_y-Math.log(sizes_circles[2]/scalelog)/ Math.log(10)*scalecircles*1.6)
		.attr("height",Math.log(sizes_circles[2]/scalelog)/ Math.log(10)*scalecircles*1.55)
	    .attr("width",Math.log(sizes_circles[2]/scalelog)/ Math.log(10)*scalecircles*2)
        .attr("fill", "#ffffff")//7D8E9C

// text for circles
var legendcircles= svg.selectAll("keycircles").data(sizes_circles).enter().append("svg:text") // text
                .attr("x",position_legend_circle_x)
		.attr("y",function(d,i){return position_legend_circle_y-Math.log(d/scalelog)/ Math.log(10)*scalecircles+2})
		.attr("font-size","13pt")
                .text(function(d){return d})


// ---- END LEGEND ---- //


// ---- DRAW AXIS ---- //

// x-axis
svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + (height-margin.top-24) + ")")
	.call(PopAxis).append("text").attr("class", "label")
	.attr("x", width).attr("y", 40).style("text-anchor", "end")
	.text("Citizens of " + CITIZEN + " living in the country").style("font-size", "14pt");

// y-axis
svg.append("g").attr("class", "y axis")
	.call(GDPpcAxis).append("text").attr("class", "label").attr("transform", "rotate(-90)")
	.attr("y", -74).attr("dy", ".71em").style("text-anchor", "end")
	.text("GDP pro capita").style("font-size", "14pt");


// ---- DRAW DATA ---- //

svg.selectAll(".dot").data(data).enter().append("circle")
	.attr("class", "dot")
	
	// id is name of country of destination
	.attr("id", function(d) { return d.GEO})
	
	// size of dots = number of refugees 
	.attr("r", function(d) { return Math.log(d.Total/scalelog)/Math.log(10) * scalecircles })
	
	// x is size of the ethnic community (citizens of country of origin already living in country of destination)
	// y is GDP pro capita of host country
	.attr("cx", PopMap)
	.attr("cy" , GDPpcMap )
	
	// color is acceptance rate
	.style("fill", function(d) {return cValue(d.Percentage);}) 

	// when mouse is over, visualize tooltip
    .on("mouseover", function(d) {
    		// some usefuful variables and formats
    		
			var name_dest = d3.select(this).attr("id") 
			var formatpop = d3.format('.1f');
			var formatref = d3.format('.0f');
			var pop_formatted = formatpop(PopValue(d))
		
			tooltip.transition()
			   .duration(200)
			   .style("opacity", 1);
			   
			tooltip.html("<big>" + d.GEO + "</big> <small> (GDP:" + GDPpcValue(d) + "E pro capita) </small>" 
				  + "<small><br/>" + PopValue(d) + " people from " + CITIZEN + " living in the country  "
				  + "<br/>"+ d.Total + " refugees from " + CITIZEN + " (" + SEX + ", " + AGE + ")"  
				  + "<br/>Accepted: "  + d.Percentage   
				   + "% <br/></small>"
				  
				  )
			   .style("left", (d3.event.pageX + 35) + "px")
			   .style("top", (d3.event.pageY - 28) + "px");

			   //.. and slightly increases size of dot
			   d3.select(this).attr("r", function(d) { return Math.log(d.Total/scalelog)/Math.log(10) * scalecircles*1.5 })

	   
	 }) // end of mouseover

	// goes back to normality
	.on("mouseout", function(d) {
		    tooltip.transition()
				   .duration(500)
				   .style("opacity", 0);
		 	d3.select(this).attr("r", function(d) { return Math.log(d.Total/scalelog)/Math.log(10) * scalecircles })
			
		   var name_dest = d3.select(this).attr("id") 
			  var a = d3.selectAll('#'+name_dest)


	}); // end of mouseout









}); // end of d3.csv read data