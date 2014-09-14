# Read data downloaded from http://epp.eurostat.ec.europa.eu/portal/page/portal/product_details/dataset?p_product_code=MIGR_ASYDCFSTA
# on numbers of asylum application, and numbers of accepted refugees.
# Reshape table in handy format.
# Compute acceptance rates by country of origin and destination and puts it in a CSV.

# Read data
data <- read.csv("Data/migr_asydcfsta_1_DataDecisionsAll.csv")
data$Value <- as.numeric(gsub(",", "", data$Value))

#make some country names shorter
levelsGEO<-levels(data$GEO)
levelsGEO[levelsGEO=="Germany (until 1990 former territory of the FRG)"]<-"Germany"
levels(data$GEO)<-levelsGEO
levelsCITIZEN<-levels(data$CITIZEN)
levelsCITIZEN[levelsCITIZEN=="Kosovo (under United Nations Security Council Resolution 1244/99)"]<-"Kosovo"
levelsCITIZEN[levelsCITIZEN=="China (including Hong Kong)"]<-"China"
levels(data$CITIZEN)<-levelsCITIZEN

#reshape column in a better version
library(reshape2)
datatemp <- dcast(data, GEO + CITIZEN + SEX + AGE + TIME ~ DECISION, value.var="Value")

#Exclude Total, Extra EU-28, Extra EU-27
datawide <- datatemp[datatemp$CITIZEN != "Extra EU-27" & datatemp$CITIZEN != "Extra EU-28" & datatemp$CITIZEN != "TotalBLAH" & datatemp$GEO != "European Union (28 countries)" & datatemp$GEO != "European Union (27 countries)" & datatemp$GEO != "Total", ]

#Give better names to columns
namescolumns<-names(datawide)
namescolumns[7]<-"Total"
namescolumns[8]<-"Positive"
names(datawide)<-namescolumns

#Compute Percentage of Accepted Refugees
datawide$Percentage <- datawide$Positive/datawide$Total
notNA<-!is.na(datawide$Percentage)

#Per each combination of country of origin (CITIZEN) and destination (GEO), compute the acceptance rate of refugees
TotalGEOCITIZEN<-tapply(datawide$Total[notNA],list(datawide$GEO[notNA],datawide$CITIZEN[notNA]), sum)
PositiveGEOCITIZEN<-tapply(datawide$Positive[notNA],list(datawide$GEO[notNA],datawide$CITIZEN[notNA]),sum)
PercentageGEOCITIZEN<-PositiveGEOCITIZEN/TotalGEOCITIZEN

#Total number of refugees, Accepted refugees, Percentage of Acceptance by country of destination
TotalGEO<-tapply(datawide$Total[notNA],list(datawide$GEO[notNA]), sum)
PositiveGEO<-tapply(datawide$Positive[notNA],list(datawide$GEO[notNA]),sum)
PercentageGEO<-PositiveGEO/TotalGEO
ok<-!is.na(PercentageGEO)

#Total number of refugees, Accepted refugees, Percentage of Acceptance by country of origin
TotalCITIZEN<-tapply(datawide$Total[notNA],list(datawide$CITIZEN[notNA]), sum)
PositiveCITIZEN<-tapply(datawide$Positive[notNA],list(datawide$CITIZEN[notNA]),sum)
PercentageCITIZEN<-PositiveCITIZEN/TotalCITIZEN

#Selects Citizenships with more than 25000 refugees
selectCITIZEN <- TotalCITIZEN > 25000 & !is.na(TotalCITIZEN)

#Writes outputs
output<-TotalGEOCITIZEN[ok,selectCITIZEN]
output_perc<-PercentageGEOCITIZEN[ok,selectCITIZEN]
write.csv(output, file = "FormattedData/totalgeocitizen.csv") # number of asylum applications by origin and destination
write.csv(output_perc, file = "FormattedData/percentagegeocitizen.csv")  # acceptance rate of asylum applications by origin and destination
