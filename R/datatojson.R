# ----------------
# Take as input country borders in TopoJSON format (from https://github.com/mbostock/world-atlas) 
# and data on refugees acceptance rates (from EuroStat).
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
# Probably doable with a join / R merge too...

for (i in 1:length(csvtable$country))
        {
        indexmatch <- jsonin$objects$countries$geometries$properties$name == as.character(csvtable$country[i])
        jsonin$objects$countries$geometries$properties$testnames[indexmatch] <- as.character(csvtable$country[i])
        jsonin$objects$countries$geometries$properties$Syria[indexmatch] <- csvtable$Syria[i]
        jsonin$objects$countries$geometries$properties$Afghanistan[indexmatch] <- csvtable$Afghanistan[i]
        jsonin$objects$countries$geometries$properties$Somalia[indexmatch] <- csvtable$Somalia[i]
        jsonin$objects$countries$geometries$properties$SomaliaTotal[indexmatch] <- csvtable_total$Somalia[i]
        jsonin$objects$countries$geometries$properties$AfghanistanTotal[indexmatch] <- csvtable_total$Afghanistan[i]
        jsonin$objects$countries$geometries$properties$SyriaTotal[indexmatch] <- csvtable_total$Syria[i]
        jsonin$objects$countries$geometries$properties$TotalTotal[indexmatch] <- csvtable_total$Total[i]
        jsonin$objects$countries$geometries$properties$Total[indexmatch] <- csvtable$Total[i]
        jsonin$objects$countries$geometries$properties$RussiaTotal[indexmatch] <- csvtable_total$Russia[i]
        jsonin$objects$countries$geometries$properties$Russia[indexmatch] <- csvtable$Russia[i]
        jsonin$objects$countries$geometries$properties$ChinaTotal[indexmatch] <- csvtable_total$China[i]
        jsonin$objects$countries$geometries$properties$China[indexmatch] <- csvtable$China[i]
        jsonin$objects$countries$geometries$properties$PakistanTotal[indexmatch] <- csvtable_total$Pakistan[i]
        jsonin$objects$countries$geometries$properties$Pakistan[indexmatch] <- csvtable$Pakistan[i]
        jsonin$objects$countries$geometries$properties$EritreaTotal[indexmatch] <- csvtable_total$Eritrea[i]
        jsonin$objects$countries$geometries$properties$Eritrea[indexmatch] <- csvtable$Eritrea[i]
        jsonin$objects$countries$geometries$properties$IranTotal[indexmatch] <- csvtable_total$Iran[i]
        jsonin$objects$countries$geometries$properties$Iran[indexmatch] <- csvtable$Iran[i]
        jsonin$objects$countries$geometries$properties$BangladeshTotal[indexmatch] <- csvtable_total$Bangladesh[i]
        jsonin$objects$countries$geometries$properties$Bangladesh[indexmatch] <- csvtable$Bangladesh[i]
        jsonin$objects$countries$geometries$properties$GuineaTotal[indexmatch] <- csvtable_total$Guinea[i]
        jsonin$objects$countries$geometries$properties$Guinea[indexmatch] <- csvtable$Guinea[i]
        jsonin$objects$countries$geometries$properties$CongoTotal[indexmatch] <- csvtable_total$Democratic.Republic.of.the.Congo[i]
        jsonin$objects$countries$geometries$properties$Congo[indexmatch] <- csvtable$Democratic.Republic.of.the.Congo[i]
        jsonin$objects$countries$geometries$properties$IraqTotal[indexmatch] <- csvtable_total$Iraq[i]
        jsonin$objects$countries$geometries$properties$Iraq[indexmatch] <- csvtable$Iraq[i]
        jsonin$objects$countries$geometries$properties$KosovoTotal[indexmatch] <- csvtable_total$Kosovo[i]
        jsonin$objects$countries$geometries$properties$Kosovo[indexmatch] <- csvtable$Kosovo[i]
        jsonin$objects$countries$geometries$properties$SerbiaTotal[indexmatch] <- csvtable_total$Serbia[i]
        jsonin$objects$countries$geometries$properties$Serbia[indexmatch] <- csvtable$Serbia[i]
        jsonin$objects$countries$geometries$properties$NigeriaTotal[indexmatch] <- csvtable_total$Nigeria[i]
        jsonin$objects$countries$geometries$properties$Nigeria[indexmatch] <- csvtable$Nigeria[i]
        jsonin$objects$countries$geometries$properties$GeorgiaTotal[indexmatch] <- csvtable_total$Georgia[i]
        jsonin$objects$countries$geometries$properties$Georgia[indexmatch] <- csvtable$Georgia[i]
        jsonin$objects$countries$geometries$properties$TurkeyTotal[indexmatch] <- csvtable_total$Turkey[i]
        jsonin$objects$countries$geometries$properties$Turkey[indexmatch] <- csvtable$Turkey[i]
        jsonin$objects$countries$geometries$properties$ArmeniaTotal[indexmatch] <- csvtable_total$Armenia[i]
        jsonin$objects$countries$geometries$properties$Armenia[indexmatch] <- csvtable$Armenia[i]
        jsonin$objects$countries$geometries$properties$MacedoniaTotal[indexmatch] <- csvtable_total$Former.Yugoslav.Republic.of.Macedonia..the[i]
        jsonin$objects$countries$geometries$properties$Macedonia[indexmatch] <- csvtable$Former.Yugoslav.Republic.of.Macedonia..the[i]
        
        }
# 



# EXPORT JSON
myjson <- toJSON(jsonin, pretty=FALSE,auto_unbox=FALSE) 
myjson<-gsub('[\"GeometryCollection\"]', '\"GeometryCollection\"', as.character(myjson), fixed=TRUE) # R doesn't format this correctly by default
myjson<-gsub('[\"Topology\"]', '\"Topology\"', as.character(myjson), fixed=TRUE) # R doesn't format this correctly by default
cat(myjson,file="TopoJson/world-topo-min-2.json")
cat(myjson,file="../D3/js/world-topo-min-2.json")


