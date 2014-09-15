
data <- read.csv("Data/migr_asydcfsta_1_DataAgeSex.csv")
data$Value <- as.numeric(gsub(",", "", data$Value))

#make some names shorter
levelsGEO<-levels(data$GEO)
#reshape column in a better version
library(reshape2)
datawide <- dcast(data, GEO + CITIZEN + SEX + AGE + TIME ~ DECISION, value.var="Value")
namescolumns<-names(datawide)
namescolumns[6]<-"Total"
namescolumns[7]<-"Positive"
names(datawide)<-namescolumns
notNA <- !is.na(datawide$Total)

TotalGEO<-tapply(datawide$Total[notNA],list(datawide$GEO[notNA]), sum)
PositiveGEO<-tapply(datawide$Positive[notNA],list(datawide$GEO[notNA]),sum)
PositiveGEO<-data.frame(PositiveGEO)
PositiveGEO$GEO<-rownames(PositiveGEO)
TotalGEO<-data.frame(TotalGEO)
TotalGEO$GEO<-rownames(TotalGEO)

GDPdata <- read.csv("Data/nama_gdp_c_1_Data.csv")
GDPdata$Value <- as.numeric(gsub(",", "", GDPdata$Value))
GDPdata<-GDPdata[GDPdata$TIME == 2012 & GDPdata$GEO %in% levelsGEO,]
datatemp <- dcast(GDPdata, GEO + INDIC_NA + TIME   ~ UNIT, value.var="Value")
GDPdata <- datatemp
colnames(GDPdata) <- c("GEO","INDIC_NA","TIME","GDP_pc", "GDP", "GDPnormEU27","PPS_pc")
GDPdata<-GDPdata[,-c(2)]
GDPdata$Pop <- GDPdata$GDP*1000000 / GDPdata$GDP_pc


UNEMPdata <- read.csv("Data/une_rt_a_1_Data.csv")
UNEMPdata$Value <- as.numeric(gsub(",", "", UNEMPdata$Value))
UNEMPdata<-UNEMPdata[UNEMPdata$TIME == 2012 & UNEMPdata$AGE == "Total" & UNEMPdata$GEO %in% levelsGEO,]
UNEMPdata<-UNEMPdata[,c(2,6)]
colnames(UNEMPdata)[2]<-'Unemployment'


filein<-read.csv(file = "GPDpeoplein.csv")
filein<-filein[,c(1,7)]

mergedtable <- merge(PositiveGEO, GDPdata, by='GEO')
mergedtable <- merge(mergedtable, UNEMPdata, by='GEO', all.x = "TRUE")
mergedtable <- merge(mergedtable, TotalGEO, by='GEO')

mergedtable$GEO[mergedtable$GEO == "Germany (until 1990 former territory of the FRG)"] <- 'Germany'
mergedtable$GEO[mergedtable$GEO == "United Kingdom"] <- 'UnitedKingdom'
mergedtable$GEO[mergedtable$GEO == "Czech Republic"] <- 'CzechRepublic'


mergedtable <- merge(mergedtable, filein, by='GEO')
mergedtable<-mergedtable[order(mergedtable$PositiveGEO),]
mergedtableOUT <-  mergedtable[,c(1,8,5,4,2,9,10,11)]

write.csv(mergedtableOUT, file = "GPDpeoplein3.csv",row.names = FALSE)


mergedtable.pca <- prcomp(mergedtable.short , center = TRUE, scale = TRUE )
