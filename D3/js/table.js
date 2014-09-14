var previousSort = null;
var format = d3.time.format("%a %b %d %Y");


var margin = {top: 5, right: 10, bottom: 50, left: 90};
var width1 = 500*1.05 - margin.left - margin.right;
var height1 = 450*1.05 - margin.top - margin.bottom;

//var svg2 = d3.select("#area2").append("svg")
//    .attr("width", width1)
 //   .attr("height", height1)
 // .append("g");

 //background
	//svg2.append("svg:rect").attr("width", width1 )
    //.attr("height", height1 )
    //.attr("fill", "#ffffff");
    
    

    
    
// LOADS VARIABLE FROM URL LINE
function GetUrlValue(VarSearch){
	var SearchString = window.location.search.substring(1);
	var VariableArray = SearchString.split('&');
	for(var i = 0; i < VariableArray.length; i++){
		var KeyValuePair = VariableArray[i].split('=');
		if(KeyValuePair[0] == VarSearch){
			return KeyValuePair[1];
		}
	}
}
var CITIZEN=GetUrlValue('CITIZEN');
var GEO=GetUrlValue('GEO');
var SEX=GetUrlValue('SEX');
var AGE=GetUrlValue('AGE');



var PopValue = function(d) { return d.citizens_value;}, // data -> value
    PopScale = d3.scale.log().range([1, width1]), // value -> display
    PopMap = function(d) { return PopScale(PopValue(d));}, // data -> display
    PopAxis = d3.svg.axis().scale(PopScale).tickFormat(function(d){return PopScale.tickFormat(4,d3.format(",d"))(d)}).orient("bottom");

	
var GDPpcValue = function(d) { return d.GDP_pc;}, // data -> value
    GDPpcScale = d3.scale.linear().range([height1, 0]), // value -> display
    GDPpcMap = function(d) { return GDPpcScale(GDPpcValue(d));}, // data -> display
    GDPpcAxis = d3.svg.axis().scale(GDPpcScale).orient("left");



d3.csv("data/destinations_immigrants.csv", function(error, data) {


	//FILTER SELECTION
    data = data.filter(function(row) {
        return row['AGE'] == AGE & row['CITIZEN'] == CITIZEN  & row['SEX'] == SEX;
    })


data.forEach(function(d) {
    d.Percentage = +d.Percentage;
    d.Unemployment = +d.Unemployment;
    d.citizens_value = +d.citizens_value;
    d.GDP_pc = +d.GDP_pc;

     d.SEX = ''; // DON'T PRINT SEX, CITIZEN, AGE
     d.CITIZEN = '';
     d.AGE = '';

  	}); //end forEach

  






refreshTable(null);


function refreshTable(sortOn){
	// create the table header
//	console.log(d3.keys(data[0]))
	
	var thead = d3.select("thead").selectAll("th")
		.data(d3.keys(data[0]) )
//		.data(headertext)
		.enter().append("th").text(function(d){if (d=="SEX" | d=="CITIZEN" | d=="AGE"){ return '';}
											   if (d=="citizens_value"){ return 'Citizens of ' + CITIZEN + ' in the country';}
											   if (d=="GEO"){ return 'Country of Destination';}
											   if (d=="GDP_pc"){ return 'GDP pro capita';}
											   if (d=="Unemployment"){ return 'Unemployment Rate';}
											   if (d=="Percentage"){ return 'Acceptance rate for ' + CITIZEN + ' ('+ SEX + ', ' + AGE +')';}
											   if (d=="Total"){ return '# of refugees from ' + CITIZEN + ' ('+ SEX + ', ' + AGE +')';}

												return d;
											    })
		.on("click", function(d){ return refreshTable(d);});
		
	// fill the table	
	// create rows
	var tr = d3.select("tbody").selectAll("tr").data(data);	
	tr.enter().append("tr");

	// create cells
	var td = tr.selectAll("td").data(function(d){return d3.values(d);});	
	td.enter().append("td")
		.attr("id", function(d,i){return d3.keys(data[0])[i];}  ) // gives id to cells by column name 
		.style('font-weight', function(d,i){if(d3.keys(data[0])[i]=="GEO"){return 'bold';}})   // make only country names bold

		.text(function(d) {return d ;});
	
	//update?
	if(sortOn !== null) {			
			// update rows
			if(sortOn != previousSort){
				tr.sort(function(a,b){return sort(a[sortOn], b[sortOn]);});
				previousSort = sortOn;
			}
			else{
				tr.sort(function(a,b){return sort(b[sortOn], a[sortOn]);});
				previousSort = null;
			}
			
			//update cells
			td.text(function(d) {return d;});
	}
}

function sort(a,b){
	if(typeof a == "string"){
		var parseA = format.parse(a);
		if(parseA){
			var timeA = parseA.getTime();
			var timeB = format.parse(b).getTime();
			return timeA > timeB ? 1 : timeA == timeB ? 0 : -1;
		}
		else 
			return a.localeCompare(b);
	}
	else if(typeof a == "number"){
		return a > b ? 1 : a == b ? 0 : -1;
	}
	else if(typeof a == "boolean"){
		return b ? 1 : a ? -1 : 0;
	}
}

})

