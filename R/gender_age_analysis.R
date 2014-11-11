# ----------------
# This code compares acceptance rates of citizens of different age / gender
# ----------------

### ----- READ / FORMAT DATA ------- #####

# read data from Eurostat
data <- read.csv("EurostatData/migr_asydcfsta_1_DataAgeSex.csv")
data$Value <- as.numeric(gsub(",", "", data$Value))

#make some names shorter
levelsGEO<-levels(data$GEO)
levelsGEO[levelsGEO=="Germany (until 1990 former territory of the FRG)"]<-"Germany"
levels(data$GEO)<-levelsGEO
levelsCITIZEN<-levels(data$CITIZEN)
levelsCITIZEN[levelsCITIZEN=="Democratic Republic of the Congo"]<-"Congo"
levelsCITIZEN[levelsCITIZEN=="Kosovo (under United Nations Security Council Resolution 1244/99)"]<-"Kosovo"
levelsCITIZEN[levelsCITIZEN=="China (including Hong Kong)"]<-"China"
levels(data$CITIZEN)<-levelsCITIZEN
levels(data$AGE) <- c('65-...','14-17','18-34','35-64','0-14')

#reshape column in a better version
library(reshape2)
datatemp <- dcast(data, GEO + CITIZEN + SEX + AGE + TIME ~ DECISION, value.var="Value")

#Exclude Total, Extra EU-28, Extra EU-27
datawide <- datatemp[datatemp$CITIZEN != "Extra EU-27" & datatemp$CITIZEN != "Extra EU-28" & datatemp$CITIZEN != "Total" & datatemp$GEO != "European Union (28 countries)" & datatemp$GEO != "European Union (27 countries)" & datatemp$GEO != "Total", ]


# datawide is our final table with Total application, Positive applications, and Percentage of success 
namescolumns<-names(datawide)
namescolumns[6]<-"Total"
namescolumns[7]<-"Positive"
names(datawide)<-namescolumns
datawide$Percentage <- datawide$Positive/datawide$Total
notNA<-!is.na(datawide$Percentage)


### ----- CALCULATIONS ------- #####

# for each combination of origin, destination how many refugees arrived in the 2008-13 period? 
# and how many were accepted?

TotalGEOCITIZEN<-tapply(datawide$Total[notNA],list(datawide$GEO[notNA],datawide$CITIZEN[notNA]), sum)
PositiveGEOCITIZEN<-tapply(datawide$Positive[notNA],list(datawide$GEO[notNA],datawide$CITIZEN[notNA]),sum)
PercentageGEOCITIZEN<-PositiveGEOCITIZEN/TotalGEOCITIZEN

# combinations of origin, destination, sex
TotalGEOCITIZENSEX<-tapply(datawide$Total[notNA],list(datawide$GEO[notNA],datawide$CITIZEN[notNA],datawide$SEX[notNA]), sum)
PositiveGEOCITIZENSEX<-tapply(datawide$Positive[notNA],list(datawide$GEO[notNA],datawide$CITIZEN[notNA],datawide$SEX[notNA]),sum)
PercentageGEOCITIZENSEX<-PositiveGEOCITIZENSEX/TotalGEOCITIZENSEX

# by origin
TotalCITIZEN<-tapply(datawide$Total[notNA],list(datawide$CITIZEN[notNA]), sum)
PositiveCITIZEN<-tapply(datawide$Positive[notNA],list(datawide$CITIZEN[notNA]),sum)
PercentageCITIZEN<-PositiveCITIZEN/TotalCITIZEN
selectCITIZEN <- TotalCITIZEN > 25000 & !is.na(TotalCITIZEN) # select only countries with more than 25000 citizens

# combinations of origin, destination, age
TotalGEOCITIZENAGE<-tapply(datawide$Total[notNA],list(datawide$GEO[notNA],datawide$CITIZEN[notNA], datawide$AGE[notNA]), sum)
PositiveGEOCITIZENAGE<-tapply(datawide$Positive[notNA],list(datawide$GEO[notNA],datawide$CITIZEN[notNA], datawide$AGE[notNA]),sum)
PercentageGEOCITIZENAGE<-PositiveGEOCITIZENAGE/TotalGEOCITIZENAGE

# combinations of origin, destination, age, sex
TotalGEOCITIZENAGESEX<-tapply(datawide$Total[notNA],list(datawide$GEO[notNA],datawide$CITIZEN[notNA], datawide$AGE[notNA], datawide$SEX[notNA]), sum)
PositiveGEOCITIZENAGESEX<-tapply(datawide$Positive[notNA],list(datawide$GEO[notNA],datawide$CITIZEN[notNA], datawide$AGE[notNA], datawide$SEX[notNA]),sum)
PercentageGEOCITIZENAGESEX<-PositiveGEOCITIZENAGESEX/TotalGEOCITIZENAGESEX

# P(Y|age,dest,origin,sex) | P(Y|orig,dest)
IncreaseProb <- PercentageGEOCITIZENAGESEX
for (i in 1:dim(PercentageGEOCITIZENAGESEX)[3])
        for (k in 1:dim(PercentageGEOCITIZENAGESEX)[4])
        {       
                {
                        IncreaseProb[,,i,k]=PercentageGEOCITIZENAGESEX[,,i,k]/PercentageGEOCITIZEN[,]
                }
        }

#sort everything by age
age <-c(75,16.5,26,50,7)
IncreaseProb<-IncreaseProb[,,order(age),]
TotalGEOCITIZENAGESEX<-TotalGEOCITIZENAGESEX[,,order(age),]
PercentageGEOCITIZENAGESEX<-PercentageGEOCITIZENAGESEX[,,order(age),]
PositiveGEOCITIZENAGESEX<-PercentageGEOCITIZENAGESEX[,,order(age),]
age<-age[order(age)]


### ----- Difference with Gender ------- #####
# are women more likely to be accepted than men?

# make color scale
library(RColorBrewer)
colorscale<-(PercentageGEOCITIZENSEX[,,"Females"]-PercentageGEOCITIZENSEX[,,"Males"])/(PercentageGEOCITIZENSEX[,,"Females"]+PercentageGEOCITIZENSEX[,,"Males"])
mincol<-min(colorscale[is.finite(colorscale)])
maxcol<-max(colorscale[is.finite(colorscale)])
colorscale <- (colorscale-mincol)/(maxcol-mincol)
colorscale[is.na(colorscale)]<-0
colorscale[is.infinite(colorscale)]<-1

#plot
jpeg('Plots/MaleFemaleAcceptance.jpg',width = 503, height = 503, units = "px")
        plot(as.vector(PercentageGEOCITIZENSEX[,,"Males"]), 
             as.vector(PercentageGEOCITIZENSEX[,,"Females"]), xlim=c(-0.1,1),ylim=c(-0.1,1),
             bty="l", axes=FALSE, ann=TRUE,
             cex=log10(TotalGEOCITIZEN[,]/100) *3  ,xlab='Acceptance, Male', ylab='Acceptance, Female', col=hsv( (colorscale+0.8)/1.8,1,1),asp=TRUE)
        axis(side = 1, lwd = 3,at=c(0,0.25,0.50,0.75,1.00))
        axis(side = 2, lwd = 3,at=c(0,0.25,0.50,0.75,1.00))
        
        #legend and lines
        points(c(0.85,0.85,0.85), c(0.1,0.1,0.1), cex=log10(c(1000,10000,100000)/100) *3)
        rect(0.85, 0.1, 1, 0.3, density = NULL,
             col = 'white',border=NULL,lwd=0,lty=0)
        lines(c(0,1),c(0,1), lwd=3)
        text(c(0.835,0.835,0.835), c(0.15,0.2,0.25), c("1000","10000","100000"),cex=0.7,pos=4)
        text(c(0.74), c(0.38), c("Total Number"),cex=0.85,pos=4)
        text(c(0.74), c(0.32), c("of Applicants"),cex=0.85,pos=4)
dev.off()



### ----- Acceptance Rate by Sex / Age, for given Origin / Destination ------- #####
# are children more likely to be accepted than adults?


# this function plots Acceptance Rate divided by age/gender for a combination of origin country and destination country.
# it computes pvalues for the null hypothesys 'there is no difference depending on age'
gender_age <- function(orig,dest){
        nameoutput <- paste('Plots/',orig,dest,'.jpeg',sep='',collapse='')
        jpeg(nameoutput,width = 503, height = 437, units = "px")
        plot(c(-1),c(-1),col="#304E67", 
                     ylim=c(0, 1), xlim=c(0,80),lwd=3,
                     bty="l", axes=FALSE, ann=TRUE, cex=1.0, tck=1, xlab='Age', ylab='Acceptance Rate', main=paste(orig, ' -> ', dest), cex.lab=1.25, cex.main=1.25)
                mtext("(2008-2013)")
                axis(1, lwd=3, at=c(0,20,40,60,80))
                axis(2, lwd=3, las=1, at=c(0,0.25,0.50,0.75,1.00), yaxp=c(0,100,4))
                for(y in c(0.25, 0.50, 0.75, 1.00)) {
                        lines(age, rep(y, length(PercentageGEOCITIZENAGESEX[dest,orig,,"Males"])), type="l", col="gray", lwd=1)
                        }
                lines(age,PercentageGEOCITIZENAGESEX[dest,orig,,"Males"], type="b", col="#304E67", lwd=3)#, cex=log10(TotalGEOCITIZENAGESEX[dest,orig,,"Males"]))
                lines(age,PercentageGEOCITIZENAGESEX[dest,orig,,"Females"], type="b", col="#974449", lwd=3)#,cex=log10(TotalGEOCITIZENAGESEX[dest,orig,,"Females"]))
                legend(55, 0.2, c("Males","Females"), cex=1, 
                       col=c("#304E67" ,"#974449"), 
                       pch=1:1, # circles
                       lty=1:1, # solid 
                       lwd=3, # line width
                       bty="n") # no box around
        dev.off()
        
        # null hypothesys testing "age/gender don't matter"
        # compares P(Y|age,sex)/P(Y) with 1

        sigma<-IncreaseProb[dest,orig,,]*sqrt(1/TotalGEOCITIZEN[dest,orig]+1/PositiveGEOCITIZEN[dest,orig] + 1/TotalGEOCITIZENAGESEX[dest,orig,,]+1/PositiveGEOCITIZENAGESEX[dest,orig,,]) # from poisson stats
        zscores<-(IncreaseProb[dest,orig,,] - 1) /sigma  *sqrt(TotalGEOCITIZENAGESEX[dest,orig,,]) # z = mean / sigma * sqrt(N)
        
        pvalue2sided<-2*pnorm(-abs(zscores))
        options(scipen=1)
        print(paste(orig, '->',dest))
        print('Null Hypothesis excluded at... (%)')
        print((1-pvalue2sided)*100)
}



gender_age('Somalia','Netherlands')
gender_age('Afghanistan','Germany')
gender_age('Somalia','Sweden')
gender_age('Syria','Sweden')




### ----- Acceptance Rate by Sex / Age, for all combinations of Origin/Destination ------- #####

# format in long form
meltedTotal <- melt(TotalGEOCITIZENAGESEX[,,,"Males"]) # number of male citizens
good<-meltedTotal$value > 100 & !is.na(meltedTotal$value) # to exclude cases with low statistics
melted <- melt(IncreaseProb[,,,"Males"]) #  P(Y|sex,age,origin,destination) / P(Y|origin,destination)
names(melted) <- c("GEO","CITIZEN","AGE","Value") 
melted<-melted[good,]  # exclude low statistics
meltedMales<-melted[!is.na(melted$Value) & melted$Value > 0,]

means<-tapply(meltedMales$Value, meltedMales$AGE,mean)
sds<-tapply(meltedMales$Value, meltedMales$AGE,sd)
counts<-tapply(meltedMales$Value, meltedMales$AGE,length)
zval <- (means-means[3])/ sqrt(sds^2/counts + sds[3]^2/counts[3])
pvalue2sided<-2*pnorm(-abs(zval))
print('Men')
print('Null Hypothesys (no dependence on age) rejected at..[%]')
print((1-pvalue2sided)*100)

meltedTotal <- melt(TotalGEOCITIZENAGESEX[,,,"Females"]) # number of female citizens
good<-meltedTotal$value > 100 & !is.na(meltedTotal$value) # to exclude cases with low statistics
melted <- melt(IncreaseProb[,,,"Females"]) #  P(Y|sex,age,origin,destination) / P(Y|origin,destination)
names(melted) <- c("GEO","CITIZEN","AGE","Value")
melted<-melted[good,] # exclude low statistics
meltedFemales<-melted[!is.na(melted$Value) & melted$Value > 0,]

means<-tapply(meltedFemales$Value, meltedFemales$AGE,mean)
sds<-tapply(meltedFemales$Value, meltedFemales$AGE,sd)
counts<-tapply(meltedFemales$Value, meltedFemales$AGE,length)
zval <- (means-means[3])/ sqrt(sds^2/counts + sds[3]^2/counts[3])
pvalue2sided<-2*pnorm(-abs(zval))


print('Women')
print('Null Hypothesys (no dependence on age) rejected at...[%]')
print((1-pvalue2sided)*100)




jpeg('Plots/MalesAge.jpeg',width = 503, height = 437, units = "px")
        boxplot(meltedMales$Value ~ meltedMales$AGE,outline=FALSE, xlab='Age', ylab='P(A->B,age) / P(A->B)', ylim=c(0,3.5), lwd=2., border='#304E67', axes=FALSE)
        mtext("Males",col='#304E67',lwd=3)
        axis(side = 1, lwd = 3,at=c(0,1,2,3,4,5,6), labels=c("","0-14","14-18","18-35","24-65","65+",""))
        axis(side = 2, lwd = 3,at=c(0,1,2,3,4))
        for(y in c(1,2,3,4)) {
                lines(c(0,6),rep(y,2), type="l", col="gray", lwd=2)
        }
dev.off()




jpeg('Plots/FemalesAge.jpeg',width = 503, height = 437, units = "px")
#        boxplot(meltedMales$Value ~ meltedMales$AGE,outline=FALSE, xlab='Age', ylab='P(A->B,age) / P(A->B)', ylim=c(0,3.5), lwd=2., border='#304E67', axes=FALSE)
        boxplot(meltedFemales$Value ~ meltedFemales$AGE,outline=FALSE, xlab='Age', ylab='P(A->B,age) / P(A->B)', ylim=c(0,3.5), lwd=2.5, border='#974449', axes=FALSE)
        mtext("FEMALES",col='#974449',lwd=3)
        axis(side = 1, lwd = 3,at=c(0,1,2,3,4,5,6), labels=c("","0-14","14-18","18-35","24-65","65+",""))
        axis(side = 2, lwd = 3,at=c(0,1,2,3,4))
        for(y in c(1,2,3,4)) {
                lines(c(0,6),rep(y,2), type="l", col="gray", lwd=2)
        }
dev.off()


