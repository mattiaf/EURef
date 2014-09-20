var margin = {top: 5, right: 10, bottom: 50, left: 90},
    width = 500*1.05 - margin.left - margin.right,
    height = 450*1.05 - margin.top - margin.bottom;

/* //inspired by
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */ 

// SETUP AXIS AND VALUES

var PopValue = function(d) { return d.Pop;}, // data -> value
    PopScale = d3.scale.log().range([1, width]), // value -> display
    PopMap = function(d) { return PopScale(PopValue(d));}, // data -> display
    PopAxis = d3.svg.axis().scale(PopScale).tickFormat(function(d){return PopScale.tickFormat(4,d3.format(",d"))(d)}).orient("bottom");

var GDPValue = function(d) { return d.GDP;}, // data -> value
    GDPScale = d3.scale.linear().range([height, 1]), // value -> display
    GDPMap = function(d) { return GDPScale(GDPValue(d));}, // data -> display
    GDPAxis = d3.svg.axis().scale(GDPScale).orient("left");

var PositiveValue = function(d) { return d.PositiveGEO;}, // data -> value
    PositiveScale = d3.scale.log().range([height, 1]), // value -> display
    PositiveMap = function(d) { return PositiveScale(PositiveValue(d));}, // data -> display
    PositiveAxis = d3.svg.axis().scale(PositiveScale).tickFormat(function(d){return PopScale.tickFormat(4,d3.format(",d"))(d)}).orient("bottom").orient("left")
    //.tickValues([10000, 1000, 100000,100]);


var UnemploymentValue = function(d) { return d.Unemployment;}, // data -> value
    UnemploymentScale = d3.scale.linear().range([1, width]), // value -> display
    UnemploymentMap = function(d) { return UnemploymentScale(UnemploymentValue(d));}, // data -> display
    UnemploymentAxis = d3.svg.axis().scale(UnemploymentScale).tickValues([0,5, 10, 15, 20, 25]).orient("bottom");
	
	
	
	
var GDPpcValue = function(d) { return d.GDP_pc;}, // data -> value
    GDPpcScale = d3.scale.linear().range([height, 0]), // value -> display
    GDPpcMap = function(d) { return GDPpcScale(GDPpcValue(d));}, // data -> display
    GDPpcAxis = d3.svg.axis().scale(GDPpcScale).orient("left");




// setup fill color
var cValue = function(d) { return d.Group;},
    color = d3.scale.category20();
    color =  d3.scale.ordinal()
    .range(colorbrewer.Spectral[4]);

// add the graph canvas to the body of the webpage
var svg = d3.select("#area1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svg2 = d3.select("#area2").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


// load data
d3.csv("data/GPDpeoplein3.csv", function(error, data) {


  // change string (from CSV) into number format
  data.forEach(function(d) {
    d.Pop = +d.Pop/1000000;
    d.GDP = +d.GDP;
    d.PositiveGEO = +d.PositiveGEO;
    d.TotalGEO = +d.TotalGEO;

    d.Unemployment = +d.Unemployment;
    d.GEO = d.GEO;
    d.GDP_pc = +d.GDP_pc;

  });

  // don't want dots overlapping axis, so add in buffer to data domain
  PopScale.domain([d3.min(data, PopValue)/2, d3.max(data, PopValue)*2*3]);
  GDPScale.domain([d3.min(data, GDPValue)/2, d3.max(data, GDPValue)*2]);
  GDPpcScale.domain([d3.min(data, GDPpcValue)/2, d3.max(data, GDPpcValue)*2]);
  GDPpcScale.domain([d3.min(data, GDPpcValue)-10000, d3.max(data, GDPpcValue)+12000]);

  PositiveScale.domain([d3.min(data, PositiveValue)/2, d3.max(data, PositiveValue)*2]);
  UnemploymentScale.domain([0, d3.max(data, UnemploymentValue)+1]);


// GRAPH 1

	//background
	svg.append("svg:rect").attr("width", width )
    .attr("height", height )
    .attr("fill", "#ffffff")


	//make lines showing ratio of citizens to refugees
	var ratioref = [100,1000,10000]
	
	var lines = svg.selectAll("ratioline").data(ratioref).enter().append("line")
	                         .attr("x1", function(d,i){return PopScale(0.3)})
	                         .attr("y1",  function(d,i){return PositiveScale(3e5/d)})
	                         .attr("x2",  function(d,i){return PopScale(4e2)})
	                         .attr("y2",  function(d,i){return PositiveScale(4e8/d)})
	                          .attr("stroke-width", 2)
	                         .attr("stroke", "#cccccc");
	
	var texts = svg.selectAll("textratio").data(ratioref).enter().append("svg:text")
	                         .attr("x", function(d){return PopScale(0.3)})
	                         .attr("y",  function(d){return PositiveScale(3e5/d)})
							 .text(function(d){return "1 refugee every " + d + " citizens";})
							 .attr("transform",function(d,i){var stringrotate ="rotate(-41 " +PopScale(0.3)+","+PositiveScale(3e5/d)+")";
							 return stringrotate;
							 })
							  .style("font-size","12pt")
							 .attr("stroke", "#888888");
	


  // x-axis
  svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")")
	.call(PopAxis).append("text").attr("class", "label")
	.attr("x", width).attr("y", 40).style("text-anchor", "end")
	.text("Population (millions)").style("font-size", "14pt"); //WHAT CLASS IS THIS?

  // y-axis
  svg.append("g").attr("class", "y axis")
	.call(PositiveAxis).append("text").attr("class", "label").attr("transform", "rotate(-90)")
	.attr("y", -85).attr("dy", ".71em").style("text-anchor", "end")
	.text("Accepted Refugees (2008-2013)").style("font-size", "14pt");


  // draw dots
  svg.selectAll(".dot").data(data).enter().append("circle")
	.attr("class", "dot")
	.attr("id", function(d) { return d.GEO}) 
	.attr("r", 5.5)
	.attr("cx", PopMap)
	.attr("cy", PositiveMap)
	.style("fill", function(d) { return color(cValue(d));}) 
.on("mouseover", function(d) {
	var name_dest = d3.select(this).attr("id") 
	var a = d3.selectAll('#'+name_dest)
	a.attr("r",18)
	var formatpop = d3.format('.1f');
	var formatref = d3.format('.0f');
	var pop_formatted = formatpop(PopValue(d))
	var ref_formatted = formatref(PositiveValue(d))

	tooltip.transition()
	   .duration(200)
	   .attr("r",6)
	   .style("opacity", 1);
	    tooltip.html("<big>" + d.GEO + "</big><br/>" + "Population: "+ pop_formatted + ' millions'
		  + "<br/>Accepted " + ref_formatted + " refugees"
		  + "<br/>GDP " + GDPpcValue(d) + "E pro capita"
		  + "<br/>Unemployment rate " + UnemploymentValue(d) + " %"
		  
		  )
	   .style("left", (d3.event.pageX + 15) + "px")
	   .style("top", (d3.event.pageY - 28) + "px");
	   
	   
	   
})


.on("mouseout", function(d) {
    tooltip.transition()
   .duration(500)
   .style("opacity", 0);
	
   var name_dest = d3.select(this).attr("id") 
	  var a = d3.selectAll('#'+name_dest)
	  a.attr("r",5.5)


});





// GRAPH 2

	//background
	svg2.append("svg:rect").attr("width", width )
    .attr("height", height )
    .attr("fill", "#ffffff")

	//lines
	var lineshoriz = [0,20000,40000,60000,80000]
	
	var lines = svg2.selectAll("linehoriz").data(lineshoriz).enter().append("line")
	                         .attr("x1", function(d){return UnemploymentScale(1)})
	                         .attr("y1",  function(d){return GDPpcScale(d)})
	                         .attr("x2",  function(d){return UnemploymentScale(25)})
	                         .attr("y2",  function(d){return GDPpcScale(d)})
	                          .attr("stroke-width", 2)
	                         .attr("stroke", "#ccc");

	var linesvert = [0,5,10,15,20]

	var lines = svg2.selectAll("linevert").data(linesvert).enter().append("line")
	                         .attr("x1", function(d){return UnemploymentScale(d)})
	                         .attr("y1",  function(d){return GDPpcScale(-5000)})
	                         .attr("x2",  function(d){return UnemploymentScale(d)})
	                         .attr("y2",  function(d){return GDPpcScale(90000)})
	                          .attr("stroke-width", 2)
	                         .attr("stroke", "#ccc");


  svg2.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(UnemploymentAxis)
	.append("text")
	.attr("class", "label")
	.attr("x", width)
	.attr("y", 42)
	.style("text-anchor", "end")
	.text("Unemployment Rate (%)")
	.style("font-size", "14pt");

	  // y-axis
	  svg2.append("g")
	.attr("class", "y axis")
	.call(GDPpcAxis).attr("class", "axis")
	 .append("text")
	.attr("class", "label")
	.attr("transform", "rotate(-90)")
	.attr("y", -80)
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.text("GDP per capita (Euro)")
	.style("font-size", "14pt");
	
	  // draw dots
	  svg2.selectAll(".dot")
	.data(data)
	    .enter().append("circle")
	.attr("class", "dot")
	.attr("id", function(d) { return d.GEO}) 
	.attr("r", 5.5)
	.attr("cx", UnemploymentMap)
	.attr("cy", GDPpcMap)
	.style("fill", function(d) { return color(cValue(d));}) 
	.on("mouseover", function(d) {
		var name_dest = d3.select(this).attr("id") 
		var a = d3.selectAll('#'+name_dest)
		a.attr("r",18)
		var formatpop = d3.format('.1f');
		var formatref = d3.format('.0f');
		var pop_formatted = formatpop(PopValue(d))
		var ref_formatted = formatref(PositiveValue(d))
	
		tooltip.transition()
	   .duration(200)
	   .attr("r",6)
	   .style("opacity", 1);
	    tooltip.html("<big>" + d.GEO + "</big><br/>" + "Population: "+ pop_formatted + ' millions'
		  + "<br/>Accepted " + ref_formatted + " refugees"
		  + "<br/>GDP " + GDPpcValue(d) + "E pro capita"
		  + "<br/>Unemployment rate " + UnemploymentValue(d) + " %"
		  
		  )
	   .style("left", (d3.event.pageX + 5) + "px")
	   .style("top", (d3.event.pageY - 28) + "px");
	})
	
	.on("mouseout", function(d) {
		
	   var name_dest = d3.select(this).attr("id") 
		  var a = d3.selectAll('#'+name_dest)
		  a.attr("r",5.5)
	
		
	    tooltip.transition()
	   .duration(500)
	   .style("opacity", 0);
	});
	
	
	 // draw legend for graph 1
	var legend = svg.selectAll(".legend")
	.data(color.domain())
	.enter().append("g")
	.attr("class", "legend")
	.attr("transform", function(d, i) {var posy =   i * 20 +  height *0.7 ; return "translate(0," +posy+ ")"; });
	
	  // draw legend colored rectangles
	legend.append("rect")
	.attr("x", width - 28)
	.attr("width", 18)
	.attr("height", 18)
	.style("fill", color);
	
	  // draw legend text
	legend.append("text")
	.attr("x", width - 32)
	.attr("y", 9)
	.attr("dy", ".35em")
	.style("text-anchor", "end")
	.text(function(d) { return d;})

	  // draw legend for graph 2
	var legend2 = svg2.selectAll(".legend")
	.data(color.domain())
	.enter().append("g")
	.attr("class", "legend")
	.attr("transform", function(d, i) {var posy =   i * 20 +  height *0.05 ; return "translate(0," +posy+ ")"; });
	
	  // draw legend colored rectangles
	legend2.append("rect")
	.attr("x", width - 28)
	.attr("width", 18)
	.attr("height", 18)
	.style("fill", color);
	
	  // draw legend text
	legend2.append("text")
	.attr("x", width - 32)
	.attr("y", 9)
	.attr("dy", ".35em")
	.style("text-anchor", "end")
	.text(function(d) { return d;})
	



});