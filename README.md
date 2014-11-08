This repo includes the file used for creating the visualizations at www.mfumagalli.com/EURef/
where I analyze the flux of refugees in Europe, and in particular try to answer the following questions: 

* What are their chances of getting asylum status granted?
* Do those depend on the country of destination, their nationality, their age?
* Which European countries accept more refugees? Is there any correlation with the economic situation of the countries itself?
* Do refugees tend to go to countries where there is already a community of immigrants from their home nation?

# Data Sources

*Eurostat: Decisions on applications by citizenship, age and sex Annual aggregated data*
http://appsso.eurostat.ec.europa.eu/nui/show.do?dataset=migr_asydcfsta&lang=en
Contains Total Number of Applications / Positive Applications divided by sex, age, citizenship, country of destination

*Eurostat: Decisions on applications by citizenship, age and sex Annual aggregated data*
http://appsso.eurostat.ec.europa.eu/nui/show.do?dataset=migr_pop1ctz&lang=en
Contains number of citizens of various countries live in each European country

# R
The R folder includes the codes used for wrangling/analysing the data.

#### Codes
*refugees_destination.R* reads stats of asylum applications and puts acceptance rates by country of origin and destination in a CSV

*datatojson.R* takes as input a TopoJSON map of the world and adds to the properties of countries number of refugees application received and accepted.
The code generates the json used in http://www.mfumagalli.com/EURef/map.html

*refugees_citizens.R* matches statistics on refugees with number of foreign citizens already living in the destination country
The code generates the CSV used in http://www.mfumagalli.com/EURef/table.html?CITIZEN=Afghanistan&SEX=Males&AGE=0-14

*gender_age_analysis.R* compares acceptance rates by gender / age

# Web
The Web folder includes the js/D3 scripts used for the online visualizations, and the twitter bootstrap framework of the website.

### Credits
These visualizations could have not existed without the marvellous plethora of tutorial for D3 available on the web, and in particular 

* D3 tutorials, by Scott Murray (http://alignedleft.com/tutorials/d3)
* Let's Make a bar chart, by Mike Bostock (http://bost.ocks.org/mike/bar/)
* Let's Make a Map, by Mike Bostock (http://bost.ocks.org/mike/map/)
* Sortable Table, by devforrest (http://devforrest.com/examples/table/table.php)
* D3 scatterplot example, by weiglmc (http://bl.ocks.org/weiglemc/6185069)
