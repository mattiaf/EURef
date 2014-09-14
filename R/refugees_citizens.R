# ----------------
# This code matches the number of refugees of nationality X going to country Y with
# _ economy stats of country Y (GDP, Unemployment)
# _ how many people with citizenship X already live in country Y
# ----------------


### ----- USEFUL FUNCTIONS  ------- #####

#Given a country and a nationality, gives back the most recent data for the amount of citizens living that country
lastvaluecitizen <- function(a,b)
{
        test2<-Citizens_wide[Citizens_wide$GEO == a & Citizens_wide$CITIZEN == b, ]
        test2<-test2[seq(3,14)]
        values2<-test2[!is.na(test2)]
        last2<-values2[length(values2)]
        return(as.numeric(last2))
}

#given a country and a nationality, gives back the most recent year with available data
lastyearcitizen <- function(a,b)
{
        test2<-Citizens_wide[Citizens_wide$GEO == a & Citizens_wide$CITIZEN == b, ]
        test2<-test2[seq(3,14)]
        years2<-colnames(test2)[!is.na(test2)]
        lasty2<-years2[length(years2)]
        return(lasty2)
}


### ----- CITIZENS STATISTICS ------- #####
data <- read.csv("Data/migr_pop1ctz_1_DataLong.csv")
data$Value <- as.numeric(gsub(",", "", data$Value))

#make some names shorter
levelsGEO<-levels(data$GEO)
levelsGEO[levelsGEO=="Germany (until 1990 former territory of the FRG)"]<-"Germany"
levelsGEO[levelsGEO=="Czech Republic"]<- "CzechRepublic"
levelsGEO[levelsGEO=="United Kingdom"]<- "UnitedKingdom"
levels(data$GEO)<-levelsGEO
levelsCITIZEN<-levels(data$CITIZEN)
levelsCITIZEN[levelsCITIZEN=="Kosovo (under United Nations Security Council Resolution 1244/99)"]<-"Kosovo"
levelsCITIZEN[levelsCITIZEN=="China (including Hong Kong)"]<-"China"
levels(data$CITIZEN)<-levelsCITIZEN

#reshape data in a more handy version
library(reshape2)
Citizens <- data
Citizens_wide <- dcast(data, GEO + CITIZEN  ~ TIME, value.var="Value")

#saves most recent data available
Citizens_wide$citizens_value<-mapply(lastvaluecitizen, Citizens_wide$GEO, Citizens_wide$CITIZEN)
Citizens_wide$citizens_value<-as.numeric(Citizens_wide$citizens_value)
Citizens_wide$citizens_year<-mapply(lastyearcitizen, Citizens_wide$GEO, Citizens_wide$CITIZEN)
Citizens_wide$citizens_year<-as.numeric(Citizens_wide$citizens_year)

#final vestion of birth statistics
Citizens<-Citizens_wide[,c(1,2,15,16)]

### ----- UNEMPLOYMENT / ECONOMY DATA -----###
nationsSTAT<-read.csv('GPDpeoplein3.csv') # just read


### ----- REFUGEES DATA ------- #####

data <- read.csv("Data/migr_asydcfsta_1_DataAgeSex2.csv")
data$Value <- as.numeric(gsub(",", "", data$Value))

#make some names shorter
levelsGEO<-levels(data$GEO)
levelsGEO[levelsGEO=="Germany (until 1990 former territory of the FRG)"]<-"Germany"
levelsGEO[levelsGEO=="Czech Republic"]<- "CzechRepublic"
levelsGEO[levelsGEO=="United Kingdom"]<- "UnitedKingdom"
levels(data$GEO)<-levelsGEO
levelsCITIZEN<-levels(data$CITIZEN)
levelsCITIZEN[levelsCITIZEN=="Kosovo (under United Nations Security Council Resolution 1244/99)"]<-"Kosovo"
levelsCITIZEN[levelsCITIZEN=="China (including Hong Kong)"]<-"China"
levels(data$CITIZEN)<-levelsCITIZEN
levels(data$AGE) <- c('65-...','14-17','18-34','35-64','0-14')

#reshape column in a better version
library(reshape2)
datatemp <- dcast(data, GEO + CITIZEN + SEX + AGE + TIME ~ DECISION, value.var="Value")
namescolumns<-names(datatemp)
namescolumns[6]<-"Total"
namescolumns[7]<-"Positive"
names(datatemp)<-namescolumns

#sum over years
datatemp_Positive <- tapply(datatemp$Positive,list(datatemp$GEO,datatemp$CITIZEN,datatemp$SEX,datatemp$AGE), sum)
datatemp_Total <- tapply(datatemp$Total,list(datatemp$GEO,datatemp$CITIZEN,datatemp$SEX,datatemp$AGE), sum)
datatemp_Perc <- datatemp_Positive/datatemp_Total
datalong_Total <- melt(datatemp_Total)
names(datalong_Total)<-c("GEO","CITIZEN","SEX","AGE","Total")

#reshape in long format
datalong <- melt(datatemp_Perc)
names(datalong)<-c("GEO","CITIZEN","SEX","AGE","Percentage")
datalong$Total<-datalong_Total$Total


### ----- MORE OPERATIONS ------- #####
# adds to every line the Unemployment and GDP pro capite of the destination country (GEO)
datalong$Unemployment <- sapply(datalong$GEO, function(x){as.numeric(nationsSTAT$Unemployment[nationsSTAT$GEO == as.character(x)])})
datalong$Unemployment<-as.numeric(datalong$Unemployment)
datalong$GDP_pc <- sapply(datalong$GEO, function(x){as.numeric(nationsSTAT$GDP_pc[nationsSTAT$GEO == as.character(x)])})
datalong$GDP_pc<-as.numeric(datalong$GDP_pc)


### ----- JOIN REFUGEES DATA AND CITIZENS DATA ---- ####
datalong$COLMERGE <- paste(datalong$GEO, datalong$CITIZEN)
Citizens$COLMERGE <- paste(Citizens$GEO, Citizens$CITIZEN)
datalong2 <- merge(x = datalong, y = Citizens, by = "COLMERGE", all.x=TRUE)


#final version, writes output
output<-datalong2[,c(2,3,4,5,6,7,8,9,12)] # exclude some columns
names(output)[1]<-'GEO'
names(output)[2]<-'CITIZEN'
output<-output[,c(5,6,1,9,7,8,2,3,4)]
notNa<-!is.na(output$Percentage) & !is.na(output$citizens_value)  & !is.na(output$GDP_pc) 
outputnoNA<-output[notNa,]
orderout<-order(outputnoNA$citizens_value,decreasing = TRUE)
outputnoNA$Percentage<-100*as.numeric(outputnoNA$Percentage) # format percentages
outputnoNA$Percentage<-format(outputnoNA$Percentage, digits=0, nsmall=0)
write.csv(outputnoNA[orderout,], file='FormattedOutput/destinations_immigrants.csv',row.names=FALSE)
write.csv(outputnoNA[orderout,], file='../D3/data/destinations_immigrants.csv',row.names=FALSE)

#test
test<-output[output$CITIZEN == "Iraq" & output$AGE == "18-34" & !is.na(output$citizens_value),]
noNa <- !is.na(test$GDP_pc) & !is.na(test$Percentage)
plot(test$GDP_pc[noNa], test$citizens_value[noNa], cex=log10(test$Total[noNa]/100)*3, log='y', ylim=c(100,max( test$citizens_value[noNa])), 
     xlab='GDP_per_capita', ylab='Citizens in the Country', main="Refugees from Iraq",
     col=grey(test$Percentage[noNa]))
