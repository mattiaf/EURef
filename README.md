This repo includes the file used for creating the visualizations at www.mfumagalli.com/EURef/
where I analyze the flux of refugees in Europe, and in particular try to answer the following questions: 

* What are their chances of getting asylum status granted?
* Do those depend on the country of destination, their nationality, their age?
* Which European countries accept more refugees? Is there any correlation with the economic situation of the countries itself?
* Do refugees tend to go to countries where there is already a community of immigrants from their home nation?

# R
The R folder includes the codes used for wrangling/analysing the data.

#### Codes
*datatojson.R* takes as input a TopoJSON map of the world and fills the properties of countries with data on refugees acceptances.
The code generates the json used in http://www.mfumagalli.com/EURef/map.html

*refugees_citizens.R* matches statistics on refugees with number of foreign citizens already living in the destination country
The code generates the CSV used in http://www.mfumagalli.com/EURef/table.html?CITIZEN=Afghanistan&SEX=Males&AGE=0-14


# D3
The D3 folder includes the scripts used for the online visualizations.

### Credits
These visualizations could have not existed without the marvellous plethora of tutorial for D3 available on the web, and in particular 

* D3 tutorials, by Scott Murray http://alignedleft.com/tutorials/d3
* Let's Make a Map, by Mike Bostock(http://bost.ocks.org/mike/map/)
* Sortable Table, by devforrest (http://devforrest.com/examples/table/table.php)
