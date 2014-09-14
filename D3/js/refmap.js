
colorconnection='#FFF0A5'

//domainperc=[0,0.15,0.25,0.5,0.625,0.75,0.875,1]
domainperc=[0,0.2,0.4, 0.6,0.8,1.0]
domainperc=d3.range(0,1, 1/8)
var colorperc = d3.scale.linear()
    .domain(domainperc)
    .range(["#008837",
"#a6dba0",
"#f7f7f7",
"#f4a582",
"#ca0020"].reverse())
.range(colorbrewer.RdBu[8])//    .range(["#d73027","#fc8d59","#fee08b","#ffffbf","#d9ef8b","#91cf60","#1a9850"]); // Colorbrewer2.0 scale
//var width = document.getElementById().width;
//var height =document.getElementById('containerd3').height; //width / 2;

width=950;
height=600;
d3.select("containerd3").style("height", height).style("width", width);


var graticule = d3.geo.graticule();

var topo,projection,path,svg,g;

var tooltip = d3.select("#containerd3").append("div").attr("class", 'tooltip hidden');




setup(width,height);
function setup(width,height){
	projection = d3.geo.equirectangular()//.translate([(width/2), (height/2)])//  
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
  
  draw(topo); //draw maps with colors

	
 }); //end d3.json





function draw(topo) {




		       		

var country = g.selectAll(".countries").data(topo);

var scalecircles = 18 // 1
var scalelog = 400 // 7.5
g.selectAll("circle").remove(); //remove all size circles
g.selectAll("text").remove(); //remove all size circles
var total_per_origin = 0



  paths = country.enter().insert("path")
      .attr("id", function(d,i) { return ''+d.properties.name ; })
      .attr("class", "country")
      .attr("d", path)
      .attr("title", function(d,i) { return d.properties.name; })
      .style("visibility", function(d,i){
      		
              if(d.properties.Visible == 1){return "visible"};
              if(d.properties.Visible == 0){return "hidden"};}
                )
      .style("fill", '#000000')
      .style("opacity", 1);
                    

 var metric = document.getElementById('metric').selectedOptions[0].value;


   g.selectAll("path")
       .style("fill", function(d,i) {
	        thisperc = d.properties[metric] ;
                if (thisperc > -0.00001 & thisperc < 1.00001 ) {return colorperc(thisperc)}; //FIND A WAY TO CUT NAN!
                if (thisperc = -1) {return '#7D8E9C'}; //FIND A WAY TO CUT NAN!
        })      	

console.log(total_per_origin);

//ADDS  CIRCLES, SIZE ~ LOG OF NUMBER OF REFUGEES
 centers = country.enter().append("svg:circle")
        .attr("id",function(d){return "center_" + d.properties.name})
        .attr("cx", function(d){return path.centroid(d)[0]})
        .attr("cy", function(d){return path.centroid(d)[1]})
        .attr("class","pointmap")
        .style("visibility", function(d,i){
              if(d.properties.Visible == 1){return "visible"};
              if(d.properties.Visible == 0){return "hidden"};})
        .attr("r", function(d){measuresize = d.properties[metric+"Total"];
             if(d.properties[metric+"Total"] > 0) {total_per_origin = total_per_origin + d.properties[metric+"Total"]}; 

               return Math.log(measuresize/scalelog)/ Math.log(10) * scalecircles})

//move centroid of Norway
d3.select("#center_Norway").attr("cx",550).attr("cy",140)

     //offsets for tooltips
	 var offsetL = document.getElementById('containerd3').offsetLeft+20;
	 var offsetT = document.getElementById('containerd3').offsetTop+10;
   
    paths.on("mouseover", function(d,i) {
		    var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
			d3.select(this).attr("class","highlight"); //highlights the country 
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
//				        variablehtml = variablehtml +  '<br>applied for asylum status<br><b>' + acc_formatted  +  '</b> of them were accepted.  ';
				        variablehtml = variablehtml +'<br>Acceptance rate: <b><big>' + acc_formatted  +  '</big></b>';
				         
				         return variablehtml;
				         }
						             ); // end html modification
             
    	     }) // end mouseon    	

    
    paths.on("mouseout", function(d,i) {
    		d3.select(this).attr("class","country"); //if you want to highlight that

		    tooltip.attr("class", 'tooltip hidden');
             }) // end mouseon    	



// LEGEND

var legend=g.append("legend")
var nnn=16, shift=2; var suffix='min'
var heightlegend =80
var sizey = heightlegend/(nnn)
var ytext = sizey/(4-1)*0.95
var position_legend_color_x = 30
var position_legend_color_y = 190


keys = legend.selectAll("key").data(colorperc.range())
rangecols=d3.range(0,1, d3.max(domainperc)/(nnn))
g.selectAll("key").data(rangecols).enter().append("svg:rect") //for continuus values
		.attr("x",position_legend_color_x)
		.attr("y",function(d,i){return position_legend_color_y+heightlegend-sizey-i*sizey})
		.attr("height",sizey)
		.attr("width",25)
                .attr("fill", function(d,i){return colorperc(rangecols[i])})

legendvalues = [0,0.25,0.5,0.75,1]
nlegend=5

g.append("svg:text").attr("x",position_legend_color_x).attr("y",position_legend_color_y-40).text("Acceptance").attr("font-size","15pt");
g.append("svg:text").attr("x",position_legend_color_x).attr("y",position_legend_color_y-20).text("Rate").attr("font-size","15pt");

g.append("svg:text").attr("x",150).attr("y",50).text(total_per_origin).attr("text-anchor","end").attr("font-size","30pt");
g.append("svg:text").attr("x",160).attr("y",50).text("refugees").attr("font-size","18pt");
g.append("svg:text").attr("x",160).attr("y",70).text("(2008-2013)").attr("font-size","12pt");



var formatperc = d3.format('%');
var legendtext= g.selectAll("key").data(legendvalues).enter().append("svg:text") // text
        	.attr("x",position_legend_color_x+28)
		.attr("y",function(d,i){return position_legend_color_y+heightlegend-i*heightlegend/(nlegend-1)})
		.attr("font-size","15pt")
                .html(function(d){return formatperc(d)})


var sizes_circles=[1000,10000,100000]
keys_circles = legend.selectAll("keycircles").data(sizes_circles)

var position_legend_circle_x = 50
var position_legend_circle_y = 450

g.selectAll("keycircles").data(sizes_circles).enter().append("svg:circle")
        .attr("cx", position_legend_circle_x)
        .attr("cy", position_legend_circle_y)
        .attr("class","pointmap")
        .attr("r", function(d,i){var radius = Math.log(d/scalelog)/ Math.log(10)*scalecircles;
        						return radius});

g.append("svg:rect")
        .attr("x",position_legend_circle_x)
		.attr("y",position_legend_circle_y-Math.log(sizes_circles[2]/scalelog)/ Math.log(10)*scalecircles*1.05)
		.attr("height",Math.log(sizes_circles[2]/scalelog)/ Math.log(10)*scalecircles*1.05)
	    .attr("width",Math.log(sizes_circles[2]/scalelog)/ Math.log(10)*scalecircles*2)
        .attr("fill", "#7D8E9C")

var legendcircles= g.selectAll("keycircles").data(sizes_circles).enter().append("svg:text") // text
                .attr("x",position_legend_circle_x)
		.attr("y",function(d,i){return position_legend_circle_y-Math.log(d/scalelog)/ Math.log(10)*scalecircles+2})
		.attr("font-size","13pt")
         //       .html(function(d){console.log(d); return d}) // this doesn't work in Safari?
                .text(function(d){return d})

g.append("svg:text").attr("x",position_legend_circle_x-30).attr("y",position_legend_circle_y-90)
				.html('<tspan x="0" dy="15"># of refugees</tspan> <tspan x="0" dy="15"></tspan>').attr("font-size","15pt");

       	

} // end of function draw(topo)



