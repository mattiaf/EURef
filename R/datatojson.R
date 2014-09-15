# ----------------
# This code takes as input:
# _country borders in TopoJSON format (from https://github.com/mbostock/world-atlas) 
# _ data on refugees acceptance rates (from EuroStat).
#  
# For each European country add to the TopoJSON variables representing 
# how many refugees from different countries have arrived.
# ----------------

library(jsonlite)
#OPEN TOPO-JSON WITH BORDERS
jsonin<-fromJSON("TopoJson/world-topo-min.json")

#OPEN REFUGEES DATA
csvtable<-read.csv("FormattedData/percentagegeocitizen.csv") # percentages of acceptance
names(csvtable)[1]<-"country"
csvtable_total<-read.csv("FormattedData/totalgeocitizen.csv") # total applications
names(csvtable_total)<-paste(names(csvtable_total),"Total",sep="")
names(csvtable_total)[1]<-"country"
csvtable[is.na(csvtable)]<--1
rownames(csvtable)<-csvtable$country

# MAKE ONLY EUROPEAN COUNTRIES VISIBLE
# add a property "visible" for each country object in the json 
# visible=1 if country name is found in the csvtable (therefore in Europe) 
names<-jsonin$objects$countries$geometries$properties$name 
EUROCOUNTRIES <- names %in% csvtable$country
visible<-rep(0,242)
visible[EUROCOUNTRIES]<-1 
jsonin$objects$countries$geometries$properties$Visible <- visible

# INSERT DATA
# Add to each country object in the JSON a property for each citizenship of refugees coming in
# Probably doable with a join / R merge too..

for (i in 1:length(csvtable$country)) # loop on destination countries
        {
        indexmatch <- jsonin$objects$countries$geometries$properties$name == as.character(csvtable$country[i])  # finds destination country in refugees database
        #adds variable to json 
        stringtorun <- paste('jsonin$objects$countries$geometries$properties$',country[i],'[indexmatch] <- csvtable$',country[i],'[i]',sep='')
        eval(parse(text=stringtorun)
        stringtorun <- paste('jsonin$objects$countries$geometries$properties$',country[i],'Total[indexmatch] <- csvtable_total$',country[i],'[i]',sep='')
        eval(parse(text=stringtorun)
        }
 



# EXPORT JSON
myjson <- toJSON(jsonin, pretty=FALSE,auto_unbox=FALSE) 
myjson<-gsub('[\"GeometryCollection\"]', '\"GeometryCollection\"', as.character(myjson), fixed=TRUE) # R doesn't format this correctly by default
myjson<-gsub('[\"Topology\"]', '\"Topology\"', as.character(myjson), fixed=TRUE) # R doesn't format this correctly by default
cat(myjson,file="TopoJson/world-topo-min-2.json")
cat(myjson,file="../D3/js/world-topo-min-2.json")


