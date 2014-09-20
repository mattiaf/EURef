# Read data downloaded from http://epp.eurostat.ec.europa.eu/portal/page/portal/product_details/dataset?p_product_code=MIGR_ASYDCFSTA
# on numbers of asylum application, and numbers of accepted refugees.
# Reshape table in handy format.
# Compute acceptance rates by country of origin and destination and puts it in a CSV.

# Read data
data <- read.csv("EurostatData/migr_asydcfsta_1_DataDecisionsAll.csv")
data$Value <- as.numeric(gsub(",", "", data$Value))

# Make some country names shorter
levelsGEO<-levels(data$GEO)
levelsGEO[levelsGEO=="Germany (until 1990 former territory of the FRG)"]<-"Germany"
levels(data$GEO)<-levelsGEO
levelsCITIZEN<-levels(data$CITIZEN)
levelsCITIZEN[levelsCITIZEN=="Kosovo (under United Nations Security Council Resolution 1244/99)"]<-"Kosovo"
levelsCITIZEN[levelsCITIZEN=="China (including Hong Kong)"]<-"China"
levels(data$CITIZEN)<-levelsCITIZEN

# Reshape data  in a better version
library(reshape2)
datatemp <- dcast(data, GEO + CITIZEN + SEX + AGE + TIME ~ DECISION, value.var="Value")

# Exclude Total, Extra EU-28, Extra EU-27
datawide <- datatemp[datatemp$CITIZEN != "Extra EU-27" & datatemp$CITIZEN != "Extra EU-28" & datatemp$CITIZEN != "Total" & datatemp$GEO != "European Union (28 countries)" & datatemp$GEO != "European Union (27 countries)" & datatemp$GEO != "Total", ]

# Give names to columns
namescolumns<-names(datawide)
namescolumns[7]<-"Total"
namescolumns[8]<-"Positive"
names(datawide)<-namescolumns

# Compute Percentage of Accepted Refugees
datawide$Percentage <- datawide$Positive/datawide$Total
notNA<-!is.na(datawide$Percentage)

# Per each combination of country of origin (CITIZEN) and destination (GEO), compute the acceptance rate of refugees over the 2008-13 period
TotalGEOCITIZEN<-tapply(datawide$Total[notNA],list(datawide$GEO[notNA],datawide$CITIZEN[notNA]), sum) # sum total applications
PositiveGEOCITIZEN<-tapply(datawide$Positive[notNA],list(datawide$GEO[notNA],datawide$CITIZEN[notNA]),sum) # sum acceptances
PercentageGEOCITIZEN<-PositiveGEOCITIZEN/TotalGEOCITIZEN # ratio

# Total number of refugees, Accepted refugees, Percentage of Acceptance by country of destination over the 2008-13 period
TotalGEO<-tapply(datawide$Total[notNA],list(datawide$GEO[notNA]), sum) # sum total applications
PositiveGEO<-tapply(datawide$Positive[notNA],list(datawide$GEO[notNA]),sum) # sum acceptances
PercentageGEO<-PositiveGEO/TotalGEO  # ratio
notNaGEO<-!is.na(PercentageGEO)

# Total number of refugees, Accepted refugees, Percentage of Acceptance by country of origin over the 2008-13 period
TotalCITIZEN<-tapply(datawide$Total[notNA],list(datawide$CITIZEN[notNA]), sum) # sum total applications
PositiveCITIZEN<-tapply(datawide$Positive[notNA],list(datawide$CITIZEN[notNA]),sum) # sum acceptances
PercentageCITIZEN<-PositiveCITIZEN/TotalCITIZEN  # ratio

# Selects Citizenships with more than 25000 refugees
selectCITIZEN <- TotalCITIZEN > 25000 & !is.na(TotalCITIZEN)

# Writes outputs
output<-TotalGEOCITIZEN[notNaGEO,selectCITIZEN]
output_perc<-PercentageGEOCITIZEN[notNaGEO,selectCITIZEN]
write.csv(output, file = "FormattedData/totalgeocitizen.csv") # number of asylum applications by origin and destination
write.csv(output_perc, file = "FormattedData/percentagegeocitizen.csv")  # acceptance rate of asylum applications by origin and destination

colnames(output_perc)<-paste(colnames(output_perc),'_perc', sep="")
output_perc<-cbind(seq(dim(output_perc)[1],1),output_perc) #add a column for alphabetic sorting
colnames(output_perc)[1]<-'Destination_perc'
output<-cbind(seq(dim(output)[1],1),output) #add a column for alphabetic sorting
colnames(output)[1]<-'Destination_sort'


output_totperc<-cbind(output,output_perc)
output_totperc[is.na(output_totperc)]<-0
write.csv(output_totperc, file = "FormattedData/origin_destination.csv")  # acceptance rate of asylum applications by origin and destination
write.csv(output_totperc, file = "../Web/data/origin_destination.csv")  # acceptance rate of asylum applications by origin and destination