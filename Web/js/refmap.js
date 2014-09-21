width=950;
height=600;


//prepare container
d3.select("containerd3").style("height", height).style("width", width); 

var topo,projection,path,svg,g;

//prepare tooltip (hidden for the time being)
var tooltip = d3.select("#containerd3").append("div").attr("class", 'tooltip hidden');


//setup projection
setup(width,height);
function setup(width,height){
	projection = d3.geo.equirectangular()  
	  .center([4.9, 55]) 
	  .scale(920) // 600 europe
	  .rotate([0,0]);
	
	path = d3.geo.path().projection(projection);
	svg = d3.select("#containerd3").append("svg")
	      .attr("width", width)
	      .attr("height", height);
	      
	
	g = svg.append("g");
}

    
d3.json("js/world-topo-min-2.json", function(error, world) {

 
  var countries = topojson.feature(world, world.objects.countries).features;
  topo = countries; 
  draw(topo); //draw map with colors

	
 }); //end d3.json





function draw(topo) {
		       		
	var country = g.selectAll(".countries").data(topo);
	
	//scaling of circles (size = number of refugees) 
	var scalecircles = 16 
	var scalelog = 400 // 7.5
	
	//when redrawing, removes circles and text
	g.selectAll("circle").remove(); 
	g.selectAll("text").remove();

	//useful later	
	var total_per_origin = 0 // sum here the total number of refugees
	var maxperc = 0; // put here the maximum acceptance rate
	var maxnumber = 0; // put here the maximum number of refugees
	var scale_number = 1;
	
	
	//gets country of origin from dropdown menu in the HTML
	var metric = document.getElementById('metric').selectedOptions[0].value;
	
	//gets value of checkbox (do you want to see the number of applicants per country?)
	var checkboxvalue = document.getElementById('checkpop').checked;

	//draw countries
	paths = country.enter().insert("path")
	      .attr("id", function(d,i) { return ''+d.properties.name ; })
	      .attr("class", "country")
	      .attr("d", path)
	      .attr("title", function(d,i) { return d.properties.name; })
	      .style("visibility", function(d,i){
	      		if (d.properties[metric] > maxperc & d.properties.name != "Malta") {maxperc = d.properties[metric]}; // find maximum acceptance
	            if (d.properties[metric+"Total"] > maxnumber) {maxnumber = d.properties[metric+"Total"]}; // find maximum number of refugees
		        if(d.properties.Visible == 1){return "visible"}; // visible only if it's in Europe (Visible property defined in the json with R code datatojson.R)
	            if(d.properties.Visible == 0){return "hidden"};}
	                )
	      .style("fill", '#000000') // just for the moment!
	      .style("opacity", 1);
	                    
	//sets domain for color scale. maximum = maximum acceptance rate
	domainperc=d3.range(0,1*maxperc, 1*maxperc/8)
	
	var colorperc = d3.scale.linear()
	    .domain(domainperc)
		.range(colorbrewer.RdBu[8])
		
	
	// fill color of countries
	g.selectAll("path")
	       .style("fill", function(d,i) {
		        thisperc = d.properties[metric] ; // acceptance rate of origin chosen in the dropdown menu
	                if (thisperc > -0.00001 & thisperc < 1.00001 ) {return colorperc(thisperc)}; 
	                if (thisperc = -1) {return '#7D8E9C'}; // if NA fill like background
	        })      	
	

	// sets scale of circles representing number of applicants
	if(maxnumber <= 50000 ){console.log("maxnumber"); scale_number = 10};
	if(maxnumber <= 5000 ){console.log("maxnumber"); scale_number = 100};

		
	//ADDS  CIRCLES, SIZE ~ LOG OF NUMBER OF REFUGEES
	 centers = country.enter().append("svg:circle")
	        .attr("id",function(d){return "center_" + d.properties.name})
	        .attr("cx", function(d){return path.centroid(d)[0]}) // puts circle on centroid of the country
	        .attr("cy", function(d){return path.centroid(d)[1]}) // puts circle on centroid of the country
	        .attr("class","pointmap")
	        .style("visibility", function(d,i){
	              if(d.properties.Visible == 1){return "visible"}; // only for countries in Europe
	              if(d.properties.Visible == 0){return "hidden"};})
	        .attr("r", function(d){measuresize = d.properties[metric+"Total"]; // number of applicants from country selected in the dropdown menu
	             if(d.properties[metric+"Total"] > 0) {total_per_origin = total_per_origin + d.properties[metric+"Total"]}; 
				 measuresize = measuresize * scale_number;
				 if(checkboxvalue == false) {return 0;} // if checkbox negative
	             return Math.log(measuresize/scalelog)/ Math.log(10) * scalecircles})
	
	//move centroid of Norway
	d3.select("#center_Norway").attr("cx",550).attr("cy",140)
	
	
	//offsets for tooltips
	var offsetL = document.getElementById('containerd3').offsetLeft+20;
	var offsetT = document.getElementById('containerd3').offsetTop+10;
	   
	paths.on("mouseover", function(d,i) {
			    var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
				d3.select(this).attr("class","highlight"); //highlights the country 
				
				//useful formatting
				var formatperc = d3.format('%'); 
				var acc_formatted = formatperc(d.properties[metric] )
				var name_dest = d3.select(this).attr("id") 
				var num_refugees = d.properties[metric+"Total"] 
				
			    if (typeof(d.properties[metric+"Total"])=="undefined") {num_refugees = 0; acc_formatted = 'not available'} // set undefined to 0
	
			    tooltip.classed("hidden", false)
			             .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
			             .html( function(d,i){
							 var variablehtml = '<b><big>' + name_dest + '</big></b><br><b>' + 
	                         num_refugees +  '</b> refugees' ;
	                        if (metric != 'Total') {variablehtml = variablehtml + ' from <b><big>' + metric  + '</big></b>';}
					        variablehtml = variablehtml +'<br>Acceptance rate: <b><big>' + acc_formatted  +  '</big></b>';
					         
					         return variablehtml;
					         }
							             ); // end html modification
	             
	    	     }) // end mouseon    	
	
	    
	paths.on("mouseout", function(d,i) {
	    		d3.select(this).attr("class","country"); //if you want to highlight that
	
			    tooltip.attr("class", 'tooltip hidden');
	             }) // end mouseout    	
	
	
	
	// DRAW LEGEND
	
	var legend=g.append("legend")
	var nnn=16, shift=2; var suffix='min'
	var heightlegend =80
	var sizey = heightlegend/(nnn)
	var ytext = sizey/(4-1)*0.95
	var position_legend_color_x = 30
	var position_legend_color_y = 190
	
	// make continuous bar
	keys = legend.selectAll("key").data(colorperc.range())
	rangecols=d3.range(0,1*maxperc, d3.max(domainperc)/(nnn-1))
	g.selectAll("key").data(rangecols).enter().append("svg:rect") //for continuus values
			.attr("x",position_legend_color_x)
			.attr("y",function(d,i){return position_legend_color_y+heightlegend-sizey-i*sizey})
			.attr("height",sizey)
			.attr("width",25)
	                .attr("fill", function(d,i){return colorperc(rangecols[i])})
	
	// values to display
	legendvalues = [0*maxperc,0.25*maxperc,0.5*maxperc,0.75*maxperc,1*maxperc]
	nlegend=5
	
	g.append("svg:text").attr("x",position_legend_color_x).attr("y",position_legend_color_y-40).text("Acceptance").attr("font-size","15pt");
	g.append("svg:text").attr("x",position_legend_color_x).attr("y",position_legend_color_y-20).text("Rate").attr("font-size","15pt");
	g.append("svg:text").attr("x",150).attr("y",50).text(total_per_origin).attr("text-anchor","end").attr("font-size","30pt");
	g.append("svg:text").attr("x",160).attr("y",50).text("refugees").attr("font-size","18pt");
	g.append("svg:text").attr("x",160).attr("y",70).text("(2008-2013)").attr("font-size","12pt");
	
	
	// text for legend
	var formatperc = d3.format('%');
	var legendtext= g.selectAll("key").data(legendvalues).enter().append("svg:text") // text
	        	.attr("x",position_legend_color_x+28)
			.attr("y",function(d,i){return position_legend_color_y+heightlegend-i*heightlegend/(nlegend-1)})
			.attr("font-size","15pt")
	                .html(function(d){return formatperc(d)})
	
	
	// LEGEND SIZE
	if (checkboxvalue == true){ // only if checkbox is active
		var sizes_circles=[1000/scale_number,10000/scale_number,100000/scale_number] 
		keys_circles = legend.selectAll("keycircles").data(sizes_circles)
		
		var position_legend_circle_x = 50
		var position_legend_circle_y = 450
		
		// legend circles
		g.selectAll("keycircles").data(sizes_circles).enter().append("svg:circle")
		        .attr("cx", position_legend_circle_x)
		        .attr("cy", position_legend_circle_y)
		        .attr("class","pointmap")
		        .attr("r", function(d,i){var radius = Math.log(d*scale_number/scalelog)/ Math.log(10)*scalecircles;
		        						return radius});
		// hide 1/4 of the circles
		g.append("svg:rect")
		        .attr("x",position_legend_circle_x)
				.attr("y",position_legend_circle_y-Math.log(sizes_circles[2]*scale_number/scalelog)/ Math.log(10)*scalecircles*1.05)
				.attr("height",Math.log(sizes_circles[2]*scale_number/scalelog)/ Math.log(10)*scalecircles*1.05)
			    .attr("width",Math.log(sizes_circles[2]*scale_number/scalelog)/ Math.log(10)*scalecircles*2)
		        .attr("fill", "#7D8E9C")
		
		// write text on circle legend
		var legendcircles= g.selectAll("keycircles").data(sizes_circles).enter().append("svg:text") // text
		                .attr("x",position_legend_circle_x)
				.attr("y",function(d,i){return position_legend_circle_y-Math.log(d*scale_number/scalelog)/ Math.log(10)*scalecircles+2})
				.attr("font-size","13pt")
		                .text(function(d){return d})
		
		// text
		g.append("svg:text").attr("x",position_legend_circle_x-30).attr("y",position_legend_circle_y-90)
						.html('<tspan x="0" dy="15"># of asylum applications</tspan> <tspan x="0" dy="15"></tspan>').attr("font-size","15pt");
	}
	



} // end of function draw(topo)



