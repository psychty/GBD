
# Notes

# You need to download the Global Burden of Disease data manually - and the links expire after a time so it is impossible to automate the downloading (and I have tried a few ways).

# You cannot sum risk factor values across causes, but you can sum cause values across risk factors

# Incidence data published for 2017 - included in download
# Prevalence data published for 2017

Area_x <- "West Sussex"
Age_x <- "All Ages"

# Load useful libraries

# This uses the easypackages package to load several libraries at once. Note: it should only be used when you are confident that all packages are installed as it will be more difficult to spot load errors compared to loading each one individually.

library(easypackages)

libraries(c("readxl", "readr", "plyr", "dplyr", "ggplot2", "png", "tidyverse", "reshape2", "scales", "viridis", "rgdal", "officer", "flextable", "tmaptools", "lemon", "fingertipsR", "PHEindicatormethods"))

stack_theme = function(){
  theme( 
    axis.text.y = element_text(colour = "#000000", size = 9), 
    axis.text.x = element_text(colour = "#000000", angle = 0, hjust = 1, vjust = .5, size = 8), 
    axis.title =  element_text(colour = "#000000", size = 9, face = "bold"),     
    plot.title = element_text(colour = "#000000", face = "bold", size = 10),    
    plot.subtitle = element_text(colour = "#000000", size = 9),
    panel.grid.major.x = element_blank(), 
    panel.grid.minor.x = element_blank(),
    panel.background = element_rect(fill = "#FFFFFF"), 
    panel.grid.major.y = element_line(colour = "#E7E7E7", size = .3),
    panel.grid.minor.y = element_blank(), 
    strip.text = element_text(colour = "#000000", size = 10, face = "bold"), 
    strip.background = element_blank(), 
    axis.ticks = element_line(colour = "#E7E7E7"), 
    legend.position = "bottom", 
    legend.title = element_text(colour = "#000000", size = 10, face = "bold"), 
    legend.background = element_rect(fill = "#ffffff"), 
    legend.key = element_rect(fill = "#ffffff", colour = "#ffffff"), 
    legend.text = element_text(colour = "#000000", size = 9), 
    axis.line = element_line(colour = "#dbdbdb")
  ) 
}

slope_theme = function(){
  theme(axis.text = element_blank(),
  plot.title = element_text(colour = "#000000", face = "bold", size = 10),    
  plot.subtitle = element_text(colour = "#000000", size = 9),
  strip.text = element_text(colour = "#000000", size = 10, face = "bold"),
  plot.margin = unit(c(0,2,0,0), "cm"),
  # legend.position = c(.75,-.1), 
  legend.position = "top", 
  legend.title = element_text(colour = "#000000", size = 10, face = "bold"), 
  legend.background = element_blank(), 
  legend.key = element_rect(fill = "#ffffff", colour = "#ffffff"), 
  legend.text = element_text(colour = "#000000", size = 8),
  panel.grid.major = element_blank(), 
  panel.grid.minor = element_blank(),
  panel.background = element_blank(), 
  panel.border = element_blank(),
  strip.background = element_blank(), 
  axis.ticks = element_blank(), 
  axis.line = element_blank()
  )}


# Nearest neighbours #### 

if(!(file.exists("~/GBD/Area_lookup_table.csv") & file.exists("~/GBD/Area_types_table.csv"))){
  LAD <- read_csv(url("https://opendata.arcgis.com/datasets/a267b55f601a4319a9955b0197e3cb81_0.csv"), col_types = cols(LAD17CD = col_character(),LAD17NM = col_character(),  LAD17NMW = col_character(),  FID = col_integer()))
  
  Counties <- read_csv(url("https://opendata.arcgis.com/datasets/7e6bfb3858454ba79f5ab3c7b9162ee7_0.csv"), col_types = cols(CTY17CD = col_character(),  CTY17NM = col_character(),  Column2 = col_character(),  Column3 = col_character(),  FID = col_integer()))
  
  lookup <- read_csv(url("https://opendata.arcgis.com/datasets/41828627a5ae4f65961b0e741258d210_0.csv"), col_types = cols(LTLA17CD = col_character(),  LTLA17NM = col_character(),  UTLA17CD = col_character(),  UTLA17NM = col_character(),  FID = col_integer()))
  # This is a lower tier LA to upper tier LA lookup
  UA <- subset(lookup, LTLA17NM == UTLA17NM)
  
  CCG <- read_csv(url("https://opendata.arcgis.com/datasets/4010cd6fc6ce42c29581c4654618e294_0.csv"), col_types = cols(CCG18CD = col_character(),CCG18CDH = col_skip(),CCG18NM = col_character(), FID = col_skip())) %>% 
    rename(Area_Name = CCG18NM,
           Area_Code = CCG18CD) %>% 
    mutate(Area_Type = "Clinical Commissioning Group (2018)")
  
  Region <- read_csv(url("https://opendata.arcgis.com/datasets/cec20f3a9a644a0fb40fbf0c70c3be5c_0.csv"), col_types = cols(RGN17CD = col_character(),  RGN17NM = col_character(),  RGN17NMW = col_character(),  FID = col_integer()))
  colnames(Region) <- c("Area_Code", "Area_Name", "Area_Name_Welsh", "FID")
  
  Region$Area_Type <- "Region"
  Region <- Region[c("Area_Code", "Area_Name", "Area_Type")]
  
  LAD <- subset(LAD, substr(LAD$LAD17CD, 1, 1) == "E")
  LAD$Area_Type <- ifelse(LAD$LAD17NM %in% UA$LTLA17NM, "Unitary Authority", "District")
  colnames(LAD) <- c("Area_Code", "Area_Name", "Area_Name_Welsh", "FID", "Area_Type")
  LAD <- LAD[c("Area_Code", "Area_Name", "Area_Type")]
  
  Counties$Area_type <- "County"
  colnames(Counties) <- c("Area_Code", "Area_Name", "Col2", "Col3", "FID", "Area_Type")
  Counties <- Counties[c("Area_Code", "Area_Name", "Area_Type")]
  
  England <- data.frame(Area_Code = "E92000001", Area_Name = "England", Area_Type = "Country")
  
  Areas <- rbind(LAD, CCG, Counties, Region, England)
  rm(LAD, CCG, Counties, Region, England, UA)
  
  write.csv(lookup, "~/GBD/Area_lookup_table.csv", row.names = FALSE)
  write.csv(Areas, "~/GBD/Area_types_table.csv", row.names = FALSE)
}

Lookup <- read_csv("~/GBD/Area_lookup_table.csv", col_types = cols(LTLA17CD = col_character(),LTLA17NM = col_character(), UTLA17CD = col_character(),  UTLA17NM = col_character(), FID = col_character()))
Areas <- read_csv("~/GBD/Area_types_table.csv", col_types = cols(Area_Code = col_character(), Area_Name = col_character(), Area_Type = col_character()))

WSx_NN <- data.frame(Area_Code = nearest_neighbours(AreaCode = "E10000032", AreaTypeID = "102", measure = "CIPFA")) %>%   mutate(Neighbour_rank = row_number()) %>% 
  left_join(Areas, by = "Area_Code") %>% 
  bind_rows(data.frame(Area_Code = "E10000032", Neighbour_rank = 0, Area_Name = "West Sussex", Area_Type = "County"))

# http://ghdx.healthdata.org/gbd-results-tool
# http://www.healthdata.org/united-kingdom
# http://www.who.int/quantifying_ehimpacts/publications/en/9241546204chap3.pdf

GBD_2017_cause_hierarchy <- read_excel("~/GBD data downloads/IHME_GBD_2017_CAUSE_HIERARCHY_Y2018M11D18.xlsx", col_types = c("text", "text", "text", "text", "text", "numeric", "text", "text"))

GBD_cause_codebook <- read_csv("~/GBD data downloads/IHME_GBD_2017_CODEBOOK_Y2018M11D18.csv", col_types = cols_only(cause_id = col_character(), cause_name = col_character())) %>% 
  filter(cause_id != "Cause ID")

gbd_rei_hierarchy <- read_excel("~/GBD data downloads/IHME_GBD_2017_REI_HIERARCHY_Y2018M11D18.xlsx", col_types = c("text", "text", "text", "text", "text", "numeric"))

# GBD_cause_group_lv1 <- GBD_2017_cause_hierarchy %>% 
#   filter(level == 1)
# GBD_cause_group_lv2 <- GBD_2017_cause_hierarchy %>% 
#   filter(level == 2)
# GBD_cause_group_lv3 <- GBD_2017_cause_hierarchy %>% 
#   filter(level == 3)
# GBD_cause_group_lv4 <- GBD_2017_cause_hierarchy %>% 
#   filter(level == 4)
# 
# GBD_risk_group_lv1 <- gbd_rei_hierarchy %>% 
#   filter(level == 1 & rei_type == "Risk")
# GBD_risk_group_lv2 <- gbd_rei_hierarchy %>% 
#   filter(level == 2 & rei_type == "Risk")
# GBD_risk_group_lv3 <- gbd_rei_hierarchy %>% 
#   filter(level == 3 & rei_type == "Risk")
# GBD_risk_group_lv4 <- gbd_rei_hierarchy %>% 
#   filter(level == 4 & rei_type == "Risk")
# 
# GBD_impairment_group_lv1 <- gbd_rei_hierarchy %>% 
#   filter(level == 1 & rei_type == "Impairment")
# GBD_impairment_group_lv2 <- gbd_rei_hierarchy %>% 
#   filter(level == 2 & rei_type == "Impairment")
# 
# GBD_etiology_group_lv1 <- gbd_rei_hierarchy %>% 
#   filter(level == 1 & rei_type == "Etiology")
# GBD_etiology_group_lv2 <- gbd_rei_hierarchy %>% 
#   filter(level == 2 & rei_type == "Etiology")

# Cause of mortality and morbidity ####
# All causes, 2002, 2007-17, all ages and age standardised, deaths, YLL, YLD, DALYs, West Sussex and cipfa neighbours

GBD_cause_data <- unique(list.files("~/GBD data downloads")[grepl("e004c73d", list.files("~/GBD data downloads/")) == TRUE]) %>% 
  map_df(~read_csv(paste0("~/GBD data downloads/",.), col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_number())))

Measures_cause_number <- GBD_cause_data %>% 
  #filter(year %in% c(max(year)-10, max(year)-5, max(year))) %>% 
  filter(metric == "Number",
         age == Age_x) %>% 
  left_join(GBD_2017_cause_hierarchy[c("cause_name", "cause_outline", "cause_id", "parent_id", "level")], by = c("cause" = "cause_name")) %>% 
  left_join(GBD_2017_cause_hierarchy[c("cause_name", "cause_id")], by = c("parent_id" = "cause_id")) %>% 
  rename(Parent_cause = cause_name) %>% 
  arrange(cause_outline) %>% 
  mutate(cause = ifelse(nchar(cause) < 40, cause, sub('(.{1,40})(\\s|$)', '\\1\n', cause))) %>%
  mutate(cause = factor(cause, levels =  unique(cause))) %>% 
  group_by(measure, year, location, sex, age) %>%   
  select(-c(lower, upper)) %>% 
  spread(measure, val) %>% 
  ungroup() 

Measures_cause_rate <- GBD_cause_data %>% 
 # filter(year %in% c(max(year)-10, max(year)-5, max(year))) %>% 
  filter(metric == "Rate",
         age == Age_x) %>% 
  left_join(GBD_2017_cause_hierarchy[c("cause_name", "cause_outline", "cause_id", "parent_id", "level")], by = c("cause" = "cause_name")) %>% 
  left_join(GBD_2017_cause_hierarchy[c("cause_name", "cause_id")], by = c("parent_id" = "cause_id")) %>% 
  rename(Parent_cause = cause_name) %>% 
  arrange(cause_outline) %>% 
  mutate(cause = ifelse(nchar(cause) < 40, cause, sub('(.{1,40})(\\s|$)', '\\1\n', cause))) %>%
  mutate(cause = factor(cause, levels =  unique(cause))) %>% 
  group_by(measure, year, location, sex, age) %>%   
  select(-c(lower, upper)) %>% 
  spread(measure, val) %>% 
  ungroup() 

# Proportions of morbidity, mortality and dalys due to particular causes ####
Measures_cause_perc <- GBD_cause_data %>% 
 # filter(year %in% c(max(year)-10, max(year)-5, max(year))) %>% 
  filter(metric == "Percent",
         age == Age_x) %>% 
  filter(!(measure %in% c("Incidence", "Prevalence"))) %>% 
  left_join(GBD_2017_cause_hierarchy[c("cause_name", "cause_outline", "cause_id", "parent_id", "level")], by = c("cause" = "cause_name")) %>% 
  left_join(GBD_2017_cause_hierarchy[c("cause_name", "cause_id")], by = c("parent_id" = "cause_id")) %>% 
  rename(Parent_cause = cause_name) %>% 
  arrange(cause_outline) %>% 
  mutate(cause = ifelse(nchar(cause) < 40, cause, sub('(.{1,40})(\\s|$)', '\\1\n', cause))) %>%
  mutate(cause = factor(cause, levels =  unique(cause))) %>% 
  group_by(measure, year, location, sex, age) %>%   
  select(-c(lower, upper)) %>% 
  spread(measure, val) %>% 
  ungroup() %>% 
  rename(Percent_DALYs = `DALYs (Disability-Adjusted Life Years)`) %>% 
  rename(Percent_Deaths = Deaths) %>% 
  rename(Percent_YLD = `YLDs (Years Lived with Disability)`) %>% 
  rename(Percent_YLL = `YLLs (Years of Life Lost)`)

# Rate is per 100,000 population
# Percent is the proportion of the deaths in the given location for the given sex, year, and level.
# Number is the count of deaths

Area_x_cause_number <- Measures_cause_number %>% 
  filter(location == Area_x) %>% 
  arrange(sex, year, cause_outline)

Area_x_cause_rate <- Measures_cause_rate %>% 
  filter(location == Area_x) %>% 
  arrange(sex, year, cause_outline)

Area_x_cause_perc <- Measures_cause_perc %>% 
  filter(location == Area_x) %>% 
  arrange(sex, year, cause_outline)

# Deaths by cause ####

Deaths_x <- Area_x_cause_number %>% 
  filter(sex == "Both") %>% 
  filter(level == 3) %>% 
  filter(year == max(year))

write.csv(Deaths_x, "~/GBD/Latest_deaths_cause_x.csv", row.names = FALSE)


# Years of life lost ####

# YLL is a measure of premature mortality within a group of people. YLLs are calculated by starting with the life expectancy of a given age group in a given year, then subtracting the age at which a person in that age group dies. Greater emphasis is  placed on deaths of younger people.

YLL_area_x <- GBD_cause_data %>% 
  filter(year %in% max(GBD_cause_data$year),
         measure == "YLLs (Years of Life Lost)",
         metric == "Number",
         age == "All Ages",
         location == Area_x) %>%  
  left_join(GBD_2017_cause_hierarchy[c("cause_name", "cause_outline", "cause_id", "parent_id", "level")], by = c("cause" = "cause_name")) %>% 
  left_join(GBD_2017_cause_hierarchy[c("cause_name", "cause_id")], by = c("parent_id" = "cause_id")) %>% 
  rename(Parent_cause = cause_name) %>% 
 # mutate(cause = capwords(cause, strict = TRUE)) %>% 
 # mutate(Parent_cause = capwords(Parent_cause, strict = TRUE)) %>% 
  select(location, sex, Parent_cause, year, age, cause, cause_outline, val, lower, upper) %>% 
  rename(Years_of_life_lost = val) %>% 
  arrange(desc(Years_of_life_lost))

write.csv(Deaths_area_x, "~/GBD/Deaths_area_x.csv", row.names = FALSE)

r2d3(data = YLL_wsx_js, script = "./Javascripts/gbd_cause_yll_bubbles.js")

# Note - this is age-standardised

YLL_rate_rank <- GBD_cause_data %>% 
  filter(year %in% c(2007,2017),
         measure == "YLLs (Years of Life Lost)",
         age == "Age-standardized",
         metric == "Rate") %>%  
  select(location, sex, age, year, val, cause) %>% 
  spread(year, val) %>% 
  mutate(change = (`2017`-`2007`)/`2007`) %>% 
  gather(`2007`:`2017`, key = year, value = val) %>% 
  left_join(GBD_2017_cause_hierarchy, by = c("cause" = "cause_name")) %>% 
  filter(level == 3) %>% 
  group_by(location, sex, year) %>% 
  arrange(desc(val)) %>% 
  mutate(rank = row_number()) %>% 
  select(location, sex, age, year, rank, change, cause, cause_outline) %>% 
  spread(year, rank) %>% 
  mutate(cause_group_code = substr(cause_outline, 1,1)) %>% 
  left_join(GBD_2017_cause_hierarchy[c("cause_outline", "cause_name")], by = c("cause_group_code" = "cause_outline")) %>% 
  rename(cause_group = cause_name) %>% 
  mutate(cause_group = factor(cause_group, levels = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"))) %>% 
  ungroup() %>% 
  mutate(location = factor(location, levels = c("West Sussex","Cambridgeshire","Devon","East Sussex", "Essex","Gloucestershire","Hampshire", "Kent","North Yorkshire","Northamptonshire","Oxfordshire","Somerset","Staffordshire","Suffolk","Warwickshire","Worcestershire", "South East region", "England", "United Kingdom"))) %>% 
  rename(Rank_2007 = `2007`,
         Rank_2017 = `2017`)

YLL_rate_label <- GBD_cause_data %>% 
  filter(year %in% c(2007,2017),
         measure == "YLLs (Years of Life Lost)",
         age == "Age-standardized",
         metric == "Rate") %>%  
  left_join(GBD_2017_cause_hierarchy, by = c("cause" = "cause_name")) %>% 
  filter(level == 3) %>% 
  mutate(Rate_label = paste0(format(round(val,0),big.mark = ",", trim = TRUE), " (", format(round(lower,0),big.mark = ",", trim = TRUE),"-", format(round(upper,0),big.mark = ",", trim = TRUE), ")")) %>% 
  select(location, sex, age, year, Rate_label, cause) %>% 
  spread(year, Rate_label)  %>% 
  rename(Label_2007 = `2007`,
         Label_2017 = `2017`) %>% 
  mutate(location = factor(location, levels = c("West Sussex","Cambridgeshire","Devon","East Sussex", "Essex","Gloucestershire","Hampshire", "Kent","North Yorkshire","Northamptonshire","Oxfordshire","Somerset","Staffordshire","Suffolk","Warwickshire","Worcestershire", "South East region", "England", "United Kingdom"))) %>% 
  left_join(YLL_rate_rank, by = c("location", "sex", "age","cause"))

rm(YLL_rate_rank)

YLL_males <- YLL_rate_label %>% 
  filter(location == "West Sussex",
         sex == "Male",
         Rank_2007 <= 10 | Rank_2017 <= 10)
  
YLL_males_top_10 <- ggplot(YLL_males) + 
  geom_segment(aes(x = 1, xend = 2, y = Rank_2007, yend = Rank_2017), size = .7, lty = "dashed", show.legend = FALSE) +
  geom_point(aes(x = 1, y = Rank_2007, col = cause_group), size = 7) +
  geom_text(aes(x = 1, y = Rank_2007, label = paste0(Rank_2007)), col = "#ffffff", fontface = "bold") +
  geom_point(aes(x = 2, y = Rank_2017, col = cause_group), size = 7) +
  geom_text(aes(x = 2, y = Rank_2017, label = paste0(Rank_2017)), col = "#ffffff", fontface = "bold") +
  scale_colour_manual(values = c("#C2464F", "#62A7B9", "#9DCB9C"), 
                      breaks = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"), 
                      limits = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"), 
                      labels = c("Communicable, maternal,\nneonatal, and nutritional diseases", "Non-communicable\ndiseases", "Injuries\n"),
                      name = "Cause\ngrouping") +
  labs(title = paste0("Ten biggest contributors to premature mortality among ",tolower(unique(YLL_males$sex)), "s;"),
       subtitle = paste0(unique(YLL_males$location), "; age-standardised rate"), 
       caption = "Measure: Years of Life Lost (YLL)\nRate per 100,000 and 95% uncertainty interval given under each cause.",
       x = "",
       y = "") +
  scale_y_reverse() +
  scale_x_continuous(limits = c(-1,6)) +
  geom_text(aes(label = "2007 ranking", y = 0, x = 1), size = 3.5, col = "#000000", hjust = 0.5, fontface = "bold") +
  geom_text(aes(label = "2017 ranking", y = 0, x = 2), size = 3.5, col = "#000000", hjust = 0.5, fontface = "bold") +
  geom_text(aes(label = "% change 2007-2017", y = 0, x = 6), size = 3.5, col = "#000000", hjust = 1, fontface = "bold") +
  geom_text(aes(label = paste0(cause, "\n", Label_2007), y = Rank_2007, x = 0.8), size = 3.5, col = "#000000", hjust = 1) +
  geom_text(aes(label = paste0(cause, "\n", Label_2017), y = Rank_2017, x = 2.2), size = 3.5, col = "#000000", hjust = 0) +
  geom_text(data = subset(YLL_males, change <= 0), aes(label = paste0(abs(round(change*100,1)), "% ", ifelse(change == 0, "(no change)\n", ifelse(change < 0, "decline in\nrate per 100,000", "increase in\nrate per 100,000"))), y = Rank_2017, x = 6), size = 3.5, col = "#000000", hjust = 1) +
  geom_text(data = subset(YLL_males, change > 0), aes(label = paste0(abs(round(change*100,1)), "% ", ifelse(change == 0, "(no change)\n", ifelse(change < 0, "decline in\nrate per 100,000", "increase in\nrate per 100,000"))), y = Rank_2017, x = 6), size = 3.5, col = "#cc0000", hjust = 1) +
  slope_theme()

Top_10_YLL_males <- Measures_perc_level_3 %>% 
  select(location, age, sex, cause_outline, cause, cause_id, level, Parent_cause, year, `YLLs (Years of Life Lost)`) %>% 
  filter(location %in% YLL_males$location,
         sex %in% YLL_males$sex,
         cause %in% YLL_males$cause) %>% 
  spread(year, `YLLs (Years of Life Lost)`) %>% 
  select(location, age, sex, cause_outline, cause, cause_id, level, Parent_cause, `2007`,`2012`,`2017`) %>% 
  left_join(YLL_males[c("cause_outline", "Rank_2007", "Rank_2017", "cause_group")], by = "cause_outline") %>% 
  arrange(Rank_2017)

paste0("The top 10 causes of age standardised premature mortality for males in 2017 accounted for ", round(sum(subset(Top_10_YLL_males, Rank_2017 <= 10, select = "2017"))*100,1), "% of the total years of life lost among males in 2017.")

paste0(subset(YLL_males, Rank_2017 == 1, select = "cause"), " was the top cause of premature mortality among males in West Sussex in 2017, contributing ", round(subset(Top_10_YLL_males, cause == as.character(subset(YLL_males, Rank_2017 == 1, select = "cause")), select = "2017")*100,1), "% of the total number of years of life lost among males in this year. This cause of premature mortality was ", ifelse(as.numeric(subset(YLL_males, Rank_2017 == 1, select = "Rank_2007")) == 1, "also the top contributor to premature mortality 10 years ago.", paste0(ifelse(as.numeric(subset(YLL_males, Rank_2017 == 1, select = "Rank_2007")) < 10, paste0("ranked ", tolower(as.character(subset(number_names, Number == as.numeric(subset(YLL_males, Rank_2017 == 1, select = "Rank_2007")), select = "Rank"))), " a decade ago."), ifelse(as.numeric(subset(YLL_males, Rank_2017 == 1, select = "Rank_2007") == 10, "ranked tenth a decade ago.", " was not in the top ten ranking a decade ago."))))), " The overall proportion of years of life lost due to ", tolower(as.character(subset(YLL_males, Rank_2017 == 1, select = "cause"))), " has ", as.character(ifelse(round(subset(Top_10_YLL_males, cause == as.character(subset(YLL_males, Rank_2017 == 1, select = "cause")), select = "2017")*100,1) == round(subset(Top_10_YLL_males, cause == as.character(subset(YLL_males, Rank_2017 == 1, select = "cause")), select = "2007")*100,1), paste0("stayed the same as in 2017"), ifelse(round(subset(Top_10_YLL_males, cause == as.character(subset(YLL_males, Rank_2017 == 1, select = "cause")), select = "2017")*100,1) > round(subset(Top_10_YLL_males, cause == as.character(subset(YLL_males, Rank_2017 == 1, select = "cause")), select = "2007")*100,1), paste0("increased since 2007 (", round(subset(Top_10_YLL_males, cause == as.character(subset(YLL_males, Rank_2017 == 1, select = "cause")), select = "2007")*100,1) ,"%)."), paste0("decreased since 2007 (", round(subset(Top_10_YLL_males, cause == as.character(subset(YLL_males, Rank_2017 == 1, select = "cause")), select = "2007")*100,1) ,"%).")))))

YLL_females <- YLL_rate_label %>% 
  filter(location == "West Sussex",
         sex == "Female",
         Rank_2007 <= 10 | Rank_2017 <= 10)

YLL_females_top_10 <- ggplot(YLL_females) + 
  geom_segment(aes(x = 1, xend = 2, y = Rank_2007, yend = Rank_2017), size = .7, lty = "dashed", show.legend = FALSE) +
  geom_point(aes(x = 1, y = Rank_2007, col = cause_group), size = 7) +
  geom_text(aes(x = 1, y = Rank_2007, label = paste0(Rank_2007)), col = "#ffffff", fontface = "bold") +
  geom_point(aes(x = 2, y = Rank_2017, col = cause_group), size = 7) +
  geom_text(aes(x = 2, y = Rank_2017, label = paste0(Rank_2017)), col = "#ffffff", fontface = "bold") +
  scale_colour_manual(values = c("#C2464F", "#62A7B9", "#9DCB9C"), 
                      breaks = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"), 
                      limits = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"), 
                      labels = c("Communicable, maternal,\nneonatal, and nutritional diseases", "Non-communicable\ndiseases", "Injuries\n"),
                      name = "Cause\ngrouping") +
  labs(title = paste0("Ten biggest contributors to premature mortality among ",tolower(unique(YLL_females$sex)), "s;"),
       subtitle = paste0(unique(YLL_females$location), "; age-standardised rate"), 
       caption = "Measure: Years of Life Lost (YLL)\nRate per 100,000 and 95% uncertainty interval given under each cause.",
       x = "",
       y = "") +
  scale_y_reverse() +
  scale_x_continuous(limits = c(-1,6)) +
  geom_text(aes(label = "2007 ranking", y = 0, x = 1), size = 3.5, col = "#000000", hjust = 0.5, fontface = "bold") +
  geom_text(aes(label = "2017 ranking", y = 0, x = 2), size = 3.5, col = "#000000", hjust = 0.5, fontface = "bold") +
  geom_text(aes(label = "% change 2007-2017", y = 0, x = 6), size = 3.5, col = "#000000", hjust = 1, fontface = "bold") +
  geom_text(aes(label = paste0(cause, "\n", Label_2007), y = Rank_2007, x = 0.8), size = 3.5, col = "#000000", hjust = 1) +
  geom_text(aes(label = paste0(cause, "\n", Label_2017), y = Rank_2017, x = 2.2), size = 3.5, col = "#000000", hjust = 0) +
  geom_text(data = subset(YLL_females, change <= 0),aes(label = paste0(abs(round(change*100,1)), "% ", ifelse(change == 0, "(no change)\n", ifelse(change < 0, "decline in\nrate per 100,000", "increase in\nrate per 100,000"))), y = Rank_2017, x = 6), size = 3.5, col = "#000000", hjust = 1) +
  geom_text(data = subset(YLL_females, change > 0), aes(label = paste0(abs(round(change*100,1)), "% ", ifelse(change == 0, "(no change)\n", ifelse(change < 0, "decline in\nrate per 100,000", "increase in\nrate per 100,000"))), y = Rank_2017, x = 6), size = 3.5, col = "#cc0000", hjust = 1) +
  slope_theme()

Top_10_YLL_females <- Measures_perc_level_3 %>% 
  select(location, age, sex, cause_outline, cause, cause_id, level, Parent_cause, year, `YLLs (Years of Life Lost)`) %>% 
  filter(location %in% YLL_females$location,
         sex %in% YLL_females$sex,
         cause %in% YLL_females$cause) %>% 
  spread(year, `YLLs (Years of Life Lost)`) %>% 
  select(location, age, sex, cause_outline, cause, cause_id, level, Parent_cause, `2007`,`2012`,`2017`) %>% 
  left_join(YLL_females[c("cause_outline", "Rank_2007", "Rank_2017", "cause_group")], by = "cause_outline") %>% 
  arrange(Rank_2017)

paste0("The top 10 causes of age standardised premature mortality for females in 2017 accounted for ", round(sum(subset(Top_10_YLL_females, Rank_2017 <= 10, select = "2017"))*100,1), "% of the total years of life lost among females in 2017.")

paste0(subset(YLL_females, Rank_2017 == 1, select = "cause"), " was the top cause of premature mortality among females in West Sussex in 2017, contributing ", round(subset(Top_10_YLL_females, cause == as.character(subset(YLL_females, Rank_2017 == 1, select = "cause")), select = "2017")*100,1), "% of the total number of years of life lost among females in this year. This cause of premature mortality was ", ifelse(as.numeric(subset(YLL_females, Rank_2017 == 1, select = "Rank_2007")) == 1, "also the top contributor to premature mortality 10 years ago.", paste0(ifelse(as.numeric(subset(YLL_females, Rank_2017 == 1, select = "Rank_2007")) < 10, paste0("ranked ", tolower(as.character(subset(number_names, Number == as.numeric(subset(YLL_females, Rank_2017 == 1, select = "Rank_2007")), select = "Rank"))), " a decade ago."), ifelse(as.numeric(subset(YLL_females, Rank_2017 == 1, select = "Rank_2007") == 10, "ranked tenth a decade ago.", " was not in the top ten ranking a decade ago."))))), " The overall proportion of years of life lost due to ", tolower(as.character(subset(YLL_females, Rank_2017 == 1, select = "cause"))), " has ", as.character(ifelse(round(subset(Top_10_YLL_females, cause == as.character(subset(YLL_females, Rank_2017 == 1, select = "cause")), select = "2017")*100,1) == round(subset(Top_10_YLL_females, cause == as.character(subset(YLL_females, Rank_2017 == 1, select = "cause")), select = "2007")*100,1), paste0("stayed the same as in 2017"), ifelse(round(subset(Top_10_YLL_females, cause == as.character(subset(YLL_females, Rank_2017 == 1, select = "cause")), select = "2017")*100,1) > round(subset(Top_10_YLL_females, cause == as.character(subset(YLL_females, Rank_2017 == 1, select = "cause")), select = "2007")*100,1), paste0("increased since 2007 (", round(subset(Top_10_YLL_females, cause == as.character(subset(YLL_females, Rank_2017 == 1, select = "cause")), select = "2007")*100,1) ,"%)."), paste0("decreased since 2007 (", round(subset(Top_10_YLL_females, cause == as.character(subset(YLL_females, Rank_2017 == 1, select = "cause")), select = "2007")*100,1) ,"%).")))))

png(paste0("./GBD/YLL_males_top_10.png"), width = 800, height = 500, res = 72, units = "px")
YLL_males_top_10
dev.off()

png(paste0("./GBD/YLL_females_top_10.png"), width = 800, height = 500, res = 72, units = "px")
YLL_females_top_10
dev.off()

# YLD Years lived with disability ####

# YLD is a measure of the amount of time lived with a disability. This is calculated by multiplying the severity of a disability by its duration. Severe, short-term illness can therefore have the same number of YLDs as a chronic but mild health condition.

YLD_rate_rank <- GBD_cause_data %>% 
  filter(year %in% c(2006,2016),
         measure == "YLDs (Years Lived with Disability)",
         age == "Age-standardized",
         metric == "Rate") %>%  
  select(location, sex, age, year, val, cause) %>% 
  spread(year, val) %>% 
  mutate(change = (`2016`-`2006`)/`2006`) %>% 
  gather(`2006`:`2016`, key = year, value = val) %>% 
  left_join(GBD_2016_cause_hierarchy, by = c("cause" = "cause_name")) %>% 
  filter(level == 3) %>% 
  group_by(location, sex, year) %>% 
  arrange(desc(val)) %>% 
  mutate(rank = row_number()) %>% 
  select(location, sex, age, year, rank, change, cause, cause_outline) %>% 
  spread(year, rank) %>% 
  mutate(cause_group_code = substr(cause_outline, 1,1)) %>% 
  left_join(GBD_2016_cause_hierarchy[c("cause_outline", "cause_name")], by = c("cause_group_code" = "cause_outline")) %>% 
  rename(cause_group = cause_name) %>% 
  mutate(cause_group = factor(cause_group, levels = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"))) %>% 
  ungroup() %>% 
  mutate(location = factor(location, levels = c("West Sussex","Cambridgeshire","Devon","East Sussex", "Essex","Gloucestershire","Hampshire", "Kent","North Yorkshire","Northamptonshire","Oxfordshire","Somerset","Staffordshire","Suffolk","Warwickshire","Worcestershire", "South East region", "England", "United Kingdom"))) %>% 
  rename(Rank_2006 = `2006`,
         Rank_2016 = `2016`)

YLD_rate_label <- GBD_cause_data %>% 
  filter(year %in% c(2006,2016),
         measure == "YLDs (Years Lived with Disability)",
         age == "Age-standardized",
         metric == "Rate") %>%  
  left_join(GBD_2016_cause_hierarchy, by = c("cause" = "cause_name")) %>% 
  filter(level == 3) %>% 
  mutate(Rate_label = paste0(format(round(val,0),big.mark = ",", trim = TRUE), " (", format(round(lower,0),big.mark = ",", trim = TRUE),"-", format(round(upper,0),big.mark = ",", trim = TRUE), ")")) %>% 
  select(location, sex, age, year, Rate_label, cause) %>% 
  spread(year, Rate_label)  %>% 
  rename(Label_2006 = `2006`,
         Label_2016 = `2016`) %>% 
  mutate(location = factor(location, levels = c("West Sussex","Cambridgeshire","Devon","East Sussex", "Essex","Gloucestershire","Hampshire", "Kent","North Yorkshire","Northamptonshire","Oxfordshire","Somerset","Staffordshire","Suffolk","Warwickshire","Worcestershire", "South East region", "England", "United Kingdom"))) %>% 
  left_join(YLD_rate_rank, by = c("location", "sex", "age","cause"))

rm(YLD_rate_rank)

YLD_males <- YLD_rate_label %>% 
  filter(location == "West Sussex",
         sex == "Male",
         Rank_2006 <= 10 | Rank_2016 <= 10)

YLD_males_top_10 <- ggplot(YLD_males) + 
  geom_segment(aes(x = 1, xend = 2, y = Rank_2006, yend = Rank_2016), size = .7, lty = "dashed", show.legend = FALSE) +
  geom_point(aes(x = 1, y = Rank_2006, col = cause_group), size = 7) +
  geom_text(aes(x = 1, y = Rank_2006, label = paste0(YLD_males$Rank_2006)), col = "#ffffff", fontface = "bold") +
  geom_point(aes(x = 2, y = Rank_2016, col = cause_group), size = 7) +
  geom_text(aes(x = 2, y = Rank_2016, label = paste0(Rank_2016)), col = "#ffffff", fontface = "bold") +
  scale_colour_manual(values = c("#C2464F", "#62A7B9", "#9DCB9C"), 
                      breaks = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"), 
                      limits = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"), 
                      labels = c("Communicable, maternal,\nneonatal, and nutritional diseases", "Non-communicable\ndiseases", "Injuries\n"),
                      name = "Cause\ngrouping") +
  labs(title = paste0("Ten biggest contributors to disability among ",tolower(unique(YLD_males$sex)), "s;"),
       subtitle = paste0(unique(YLD_males$location), "; age-stadardised rate"),
       caption = "Measure: Years lived with disability (YLD)\nRate per 100,000 and 95% uncertainty interval given under each cause",
       x = "",
       y = "") +
  scale_y_reverse() +
  scale_x_continuous(limits = c(-1,6)) +
  geom_text(aes(label = "2006 ranking", y = 0, x = 1), size = 3.5, col = "#000000", hjust = 0.5, fontface = "bold") +
  geom_text(aes(label = "2016 ranking", y = 0, x = 2), size = 3.5, col = "#000000", hjust = 0.5, fontface = "bold") +
  geom_text(aes(label = "% change 2006-2016", y = 0, x = 6), size = 3.5, col = "#000000", hjust = 1, fontface = "bold") +
  geom_text(aes(label = paste0(cause, "\n",Label_2006), y = Rank_2006, x = 0.8), size = 3.5, col = "#000000", hjust = 1) +
  geom_text(aes(label = paste0(cause, "\n", Label_2016), y = Rank_2016, x = 2.2), size = 3.5, col = "#000000", hjust = 0) +
  geom_text(data = subset(YLD_males, change <= 0),aes(label = paste0(abs(round(change*100,1)), "% ", ifelse(change == 0, "(no change)\n", ifelse(change < 0, "decline in\nrate per 100,000", "increase in\nrate per 100,000"))), y = Rank_2016, x = 6), size = 3.5, col = "#000000", hjust = 1) +
  geom_text(data = subset(YLD_males, change > 0), aes(label = paste0(abs(round(change*100,1)), "% ", ifelse(change == 0, "(no change)\n", ifelse(change < 0, "decline in\nrate per 100,000", "increase in\nrate per 100,000"))), y = Rank_2016, x = 6), size = 3.5, col = "#cc0000", hjust = 1) +
  slope_theme()


Top_10_YLD_males <- Measures_perc_level_3 %>% 
  select(location, age, sex, cause_outline, cause, cause_id, level, Parent_cause, year, `YLDs (Years Lived with Disability)`) %>% 
  filter(location %in% YLD_males$location,
         sex %in% YLD_males$sex,
         cause %in% YLD_males$cause) %>% 
  spread(year, `YLDs (Years Lived with Disability)`) %>% 
  select(location, age, sex, cause_outline, cause, cause_id, level, Parent_cause, `2006`,`2011`,`2016`) %>% 
  left_join(YLD_males[c("cause_outline", "Rank_2006", "Rank_2016", "cause_group")], by = "cause_outline") %>% 
  arrange(Rank_2016)

paste0("The top 10 causes of age standardised years lived with disability for males in 2016 accounted for ", round(sum(subset(Top_10_YLD_males, Rank_2016 <= 10, select = "2016"))*100,1), "% of the total burden of disability among males in 2016.")

paste0(subset(YLD_males, Rank_2016 == 1, select = "cause"), " was the top cause of morbidity among males in West Sussex in 2016, contributing ", round(subset(Top_10_YLD_males, cause == as.character(subset(YLD_males, Rank_2016 == 1, select = "cause")), select = "2016")*100,1), "% of the total number of years lived with disability among males in this year. This cause of morbidity was ", ifelse(as.numeric(subset(YLD_males, Rank_2016 == 1, select = "Rank_2006")) == 1, "also the top contributor to morbidity 10 years ago.", paste0(ifelse(as.numeric(subset(YLD_males, Rank_2016 == 1, select = "Rank_2006")) < 10, paste0("ranked ", tolower(as.character(subset(number_names, Number == as.numeric(subset(YLD_males, Rank_2016 == 1, select = "Rank_2006")), select = "Rank"))), " a decade ago."), ifelse(as.numeric(subset(YLD_males, Rank_2016 == 1, select = "Rank_2006") == 10, "ranked tenth a decade ago.", " was not in the top ten ranking a decade ago."))))), " The overall proportion of years of life lived with disability due to ", tolower(as.character(subset(YLD_males, Rank_2016 == 1, select = "cause"))), " has ", as.character(ifelse(round(subset(Top_10_YLD_males, cause == as.character(subset(YLD_males, Rank_2016 == 1, select = "cause")), select = "2016")*100,1) == round(subset(Top_10_YLD_males, cause == as.character(subset(YLD_males, Rank_2016 == 1, select = "cause")), select = "2006")*100,1), paste0("stayed the same as in 2016"), ifelse(round(subset(Top_10_YLD_males, cause == as.character(subset(YLD_males, Rank_2016 == 1, select = "cause")), select = "2016")*100,1) > round(subset(Top_10_YLD_males, cause == as.character(subset(YLD_males, Rank_2016 == 1, select = "cause")), select = "2006")*100,1), paste0("increased since 2006 (", round(subset(Top_10_YLD_males, cause == as.character(subset(YLD_males, Rank_2016 == 1, select = "cause")), select = "2006")*100,1) ,"%)."), paste0("decreased since 2006 (", round(subset(Top_10_YLD_males, cause == as.character(subset(YLD_males, Rank_2016 == 1, select = "cause")), select = "2006")*100,1) ,"%).")))))

YLD_females <- YLD_rate_label %>% 
  filter(location == "West Sussex",
         sex == "Female",
         Rank_2006 <= 10 | Rank_2016 <= 10)

YLD_females_top_10 <- ggplot(YLD_females) + 
  geom_segment(aes(x = 1, xend = 2, y = Rank_2006, yend = Rank_2016), size = .7, lty = "dashed", show.legend = FALSE) +
  geom_point(aes(x = 1, y = Rank_2006, col = cause_group), size = 7) +
  geom_text(aes(x = 1, y = Rank_2006, label = paste0(YLD_females$Rank_2006)), col = "#ffffff", fontface = "bold") +
  geom_point(aes(x = 2, y = Rank_2016, col = cause_group), size = 7) +
  geom_text(aes(x = 2, y = Rank_2016, label = paste0(Rank_2016)), col = "#ffffff", fontface = "bold") +
  scale_colour_manual(values = c("#C2464F", "#62A7B9", "#9DCB9C"), 
                      breaks = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"), 
                      limits = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"), 
                      labels = c("Communicable, maternal,\nneonatal, and nutritional diseases", "Non-communicable\ndiseases", "Injuries\n"),
                      name = "Cause\ngrouping") +
  labs(title = paste0("Ten biggest contributors to disability among ",tolower(unique(YLD_females$sex)), "s;"),
       subtitle = paste0(unique(YLD_females$location), "; age-stadardised rate"),
       caption = "Measure: Years lived with disability (YLD)\nRate per 100,000 and 95% uncertainty interval given under each cause",
       x = "",
       y = "") +
  scale_y_reverse() +
  scale_x_continuous(limits = c(-1,6)) +
  geom_text(aes(label = "2006 ranking", y = 0, x = 1), size = 3.5, col = "#000000", hjust = 0.5, fontface = "bold") +
  geom_text(aes(label = "2016 ranking", y = 0, x = 2), size = 3.5, col = "#000000", hjust = 0.5, fontface = "bold") +
  geom_text(aes(label = "% change 2006-2016", y = 0, x = 6), size = 3.5, col = "#000000", hjust = 1, fontface = "bold") +
  geom_text(aes(label = paste0(cause, "\n",Label_2006), y = Rank_2006, x = 0.8), size = 3.5, col = "#000000", hjust = 1) +
  geom_text(aes(label = paste0(cause, "\n", Label_2016), y = Rank_2016, x = 2.2), size = 3.5, col = "#000000", hjust = 0) +
  geom_text(data = subset(YLD_females, change <= 0),aes(label = paste0(abs(round(change*100,1)), "% ", ifelse(change == 0, "(no change)\n", ifelse(change < 0, "decline in\nrate per 100,000", "increase in\nrate per 100,000"))), y = Rank_2016, x = 6), size = 3.5, col = "#000000", hjust = 1) +
  geom_text(data = subset(YLD_females, change > 0), aes(label = paste0(abs(round(change*100,1)), "% ", ifelse(change == 0, "(no change)\n", ifelse(change < 0, "decline in\nrate per 100,000", "increase in\nrate per 100,000"))), y = Rank_2016, x = 6), size = 3.5, col = "#cc0000", hjust = 1) +
  slope_theme()

Top_10_YLD_females <- Measures_perc_level_3 %>% 
  select(location, age, sex, cause_outline, cause, cause_id, level, Parent_cause, year, `YLDs (Years Lived with Disability)`) %>% 
  filter(location %in% YLD_females$location,
         sex %in% YLD_females$sex,
         cause %in% YLD_females$cause) %>% 
  spread(year, `YLDs (Years Lived with Disability)`) %>% 
  select(location, age, sex, cause_outline, cause, cause_id, level, Parent_cause, `2006`,`2011`,`2016`) %>% 
  left_join(YLD_females[c("cause_outline", "Rank_2006", "Rank_2016", "cause_group")], by = "cause_outline") %>% 
  arrange(Rank_2016)

paste0("The top 10 causes of age standardised years lived with disability for females in 2016 accounted for ", round(sum(subset(Top_10_YLD_females, Rank_2016 <= 10, select = "2016"))*100,1), "% of the total burden of disability among females in 2016.")

paste0(subset(YLD_females, Rank_2016 == 1, select = "cause"), " was the top cause of morbidity among females in West Sussex in 2016, contributing ", round(subset(Top_10_YLD_females, cause == as.character(subset(YLD_females, Rank_2016 == 1, select = "cause")), select = "2016")*100,1), "% of the total number of years lived with disability among females in this year. This cause of morbidity was ", ifelse(as.numeric(subset(YLD_females, Rank_2016 == 1, select = "Rank_2006")) == 1, "also the top contributor to morbidity 10 years ago.", paste0(ifelse(as.numeric(subset(YLD_females, Rank_2016 == 1, select = "Rank_2006")) < 10, paste0("ranked ", tolower(as.character(subset(number_names, Number == as.numeric(subset(YLD_females, Rank_2016 == 1, select = "Rank_2006")), select = "Rank"))), " a decade ago."), ifelse(as.numeric(subset(YLD_females, Rank_2016 == 1, select = "Rank_2006") == 10, "ranked tenth a decade ago.", " was not in the top ten ranking a decade ago."))))), " The overall proportion of years of life lived with disability due to ", tolower(as.character(subset(YLD_females, Rank_2016 == 1, select = "cause"))), " has ", as.character(ifelse(round(subset(Top_10_YLD_females, cause == as.character(subset(YLD_females, Rank_2016 == 1, select = "cause")), select = "2016")*100,1) == round(subset(Top_10_YLD_females, cause == as.character(subset(YLD_females, Rank_2016 == 1, select = "cause")), select = "2006")*100,1), paste0("stayed the same as in 2016"), ifelse(round(subset(Top_10_YLD_females, cause == as.character(subset(YLD_females, Rank_2016 == 1, select = "cause")), select = "2016")*100,1) > round(subset(Top_10_YLD_females, cause == as.character(subset(YLD_females, Rank_2016 == 1, select = "cause")), select = "2006")*100,1), paste0("increased since 2006 (", round(subset(Top_10_YLD_females, cause == as.character(subset(YLD_females, Rank_2016 == 1, select = "cause")), select = "2006")*100,1) ,"%)."), paste0("decreased since 2006 (", round(subset(Top_10_YLD_females, cause == as.character(subset(YLD_females, Rank_2016 == 1, select = "cause")), select = "2006")*100,1) ,"%).")))))

png(paste0("./GBD/YLD_males_top_10.png"), width = 800, height = 500, res = 72, units = "px")
YLD_males_top_10
dev.off()

png(paste0("./GBD/YLD_females_top_10.png"), width = 800, height = 500, res = 72, units = "px")
YLD_females_top_10
dev.off()

# Disability adjusted life years ####

# DALY is a measure of overall disease burden. This aims to quantify premature mortality (YLL) and years lived in less than full health (YLD) to produce a metric of years lost due to ill-health, disability or premature death. Ranking the causes of DALYs in a population helps to identify health problems that have the biggest negative impact on society.

# This is where we should culminate the focus of the briefing. 

DALYs_rate_rank <- GBD_cause_data %>% 
  filter(year %in% c(2006,2011,2016),
         measure == "DALYs (Disability-Adjusted Life Years)",
         age == "Age-standardized",
         metric == "Rate") %>%  
  select(location, sex, age, year, val, cause) %>% 
  spread(year, val) %>% 
  mutate(change_10_year = (`2016`-`2006`)/`2006`,
         change_5_year = (`2016`-`2011`)/`2011`) %>% 
  gather(`2006`:`2016`, key = year, value = val) %>% 
  left_join(GBD_2016_cause_hierarchy, by = c("cause" = "cause_name")) %>% 
  filter(level == 3) %>% 
  group_by(location, sex, year) %>% 
  arrange(desc(val)) %>% 
  mutate(rank = row_number()) %>% 
  select(location, sex, age, year, rank, change_5_year, change_10_year, cause, cause_outline) %>% 
  spread(year, rank) %>% 
  mutate(cause_group_code = substr(cause_outline, 1,1)) %>% 
  left_join(GBD_2016_cause_hierarchy[c("cause_outline", "cause_name")], by = c("cause_group_code" = "cause_outline")) %>% 
  rename(cause_group = cause_name) %>% 
  mutate(cause_group = factor(cause_group, levels = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"))) %>% 
  ungroup() %>% 
 mutate(location = factor(location, levels = c("West Sussex","Cambridgeshire","Devon","East Sussex", "Essex","Gloucestershire","Hampshire", "Kent","North Yorkshire","Northamptonshire","Oxfordshire","Somerset","Staffordshire","Suffolk","Warwickshire","Worcestershire", "South East England", "England", "United Kingdom"))) %>%
  rename(Rank_2006 = `2006`,
         Rank_2011 = `2011`,
         Rank_2016 = `2016`)

DALYs_rate_label <- GBD_cause_data %>% 
  filter(year %in% c(2006,2011,2016),
         measure == "DALYs (Disability-Adjusted Life Years)",
         age == "Age-standardized",
         metric == "Rate") %>%  
  left_join(GBD_2016_cause_hierarchy, by = c("cause" = "cause_name")) %>% 
  filter(level == 3) %>% 
  mutate(Rate_label = paste0(format(round(val,0),big.mark = ",", trim = TRUE), " (", format(round(lower,0),big.mark = ",", trim = TRUE),"-", format(round(upper,0),big.mark = ",", trim = TRUE), ")")) %>% 
  select(location, sex, age, year, Rate_label, cause) %>% 
  spread(year, Rate_label)  %>% 
  rename(Label_2006 = `2006`,
         Label_2011 = `2011`,
         Label_2016 = `2016`) %>% 
  mutate(location = factor(location, levels = c("West Sussex","Cambridgeshire","Devon","East Sussex", "Essex","Gloucestershire","Hampshire", "Kent","North Yorkshire","Northamptonshire","Oxfordshire","Somerset","Staffordshire","Suffolk","Warwickshire","Worcestershire", "South East England", "England", "United Kingdom"))) %>% 
  left_join(DALYs_rate_rank, by = c("location", "sex", "age","cause"))

rm(DALYs_rate_rank)

DALYs_males <- DALYs_rate_label %>% 
  filter(location == "West Sussex",
         sex == "Male",
         Rank_2006 <= 10 | Rank_2011 <= 10 | Rank_2016 <= 10)

DALYs_males_top_10 <- ggplot(DALYs_males) + 
  geom_segment(aes(x = 1, xend = 2, y = Rank_2006, yend = Rank_2016), size = .7, lty = "dashed", show.legend = FALSE) +
  geom_point(aes(x = 1, y = Rank_2006, col = cause_group), size = 7) +
  geom_text(aes(x = 1, y = Rank_2006, label = paste0(Rank_2006)), col = "#ffffff", fontface = "bold") +
  geom_point(aes(x = 2, y = Rank_2016, col = cause_group), size = 7) +
  geom_text(aes(x = 2, y = Rank_2016, label = paste0(Rank_2016)), col = "#ffffff", fontface = "bold") +
  scale_colour_manual(values = c("#C2464F", "#62A7B9", "#9DCB9C"), 
                      breaks = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"), 
                      limits = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"), 
                      labels = c("Communicable, maternal,\nneonatal, and nutritional diseases", "Non-communicable\ndiseases", "Injuries\n"),
                      name = "Cause\ngrouping") +
  labs(title = paste0("Ten biggest contributors to disability and mortality combined among ", tolower(unique(DALYs_males$sex)), "s;"),
       subtitle = paste0(unique(DALYs_males$location), "; age-standardised rate"), 
       caption = "Measure: Disability-adjusted Life Years (DALYs)\nRate per 100,000 and 95% uncertainty interval given under each cause",
       x = "",
       y = "") +
  scale_y_reverse() +
  scale_x_continuous(limits = c(-1,6)) +
  geom_text(aes(label = "2006 ranking", y = 0, x = 1), size = 3.5, col = "#000000", hjust = 0.5, fontface = "bold") +
  geom_text(aes(label = "2016 ranking", y = 0, x = 2), size = 3.5, col = "#000000", hjust = 0.5, fontface = "bold") +
  geom_text(aes(label = "% change 2006-2016", y = 0, x = 6), size = 3.5, col = "#000000", hjust = 1, fontface = "bold") +
  geom_text(aes(label = paste0(cause, "\n", Label_2006), y = Rank_2006, x = 0.8), size = 3.5, col = "#000000", hjust = 1) +
  geom_text(aes(label = paste0(cause, "\n", Label_2016), y = Rank_2016, x = 2.2), size = 3.5, col = "#000000", hjust = 0) +
  geom_text(data = subset(DALYs_males, change_10_year <= 0),aes(label = paste0(abs(round(change_10_year*100,1)), "% ", ifelse(change_10_year == 0, "(no change)\n", ifelse(change_10_year < 0, "decline in\nrate per 100,000", "increase in\nrate per 100,000"))), y = Rank_2016, x = 6), size = 3.5, col = "#000000", hjust = 1) +
  geom_text(data = subset(DALYs_males, change_10_year > 0), aes(label = paste0(abs(round(change_10_year*100,1)), "% ", ifelse(change_10_year == 0, "(no change)\n", ifelse(change_10_year < 0, "decline in\nrate per 100,000", "increase in\nrate per 100,000"))), y = Rank_2016, x = 6), size = 3.5, col = "#cc0000", hjust = 1) +
  slope_theme()

Top_10_DALYs_males <- Measures_perc_level_3 %>% 
  select(location, age, sex, cause_outline, cause, cause_id, level, Parent_cause, year, `DALYs (Disability-Adjusted Life Years)`) %>% 
  filter(location %in% DALYs_males$location,
         sex %in% DALYs_males$sex,
         cause %in% DALYs_males$cause) %>% 
  spread(year, `DALYs (Disability-Adjusted Life Years)`) %>% 
  select(location, age, sex, cause_outline, cause, cause_id, level, Parent_cause, `2006`,`2011`,`2016`) %>% 
  left_join(DALYs_males[c("cause_outline", "Rank_2006", "Rank_2016", "cause_group")], by = "cause_outline") %>% 
  arrange(Rank_2016)

paste0("The top 10 causes of age standardised disability adjusted life years for males in 2016 accounted for ", round(sum(subset(Top_10_DALYs_males, Rank_2016 <= 10, select = "2016"))*100,1), "% of the total burden of disability and mortality combined among males in 2016.")

paste0(subset(DALYs_males, Rank_2016 == 1, select = "cause"), " was the top cause of disability adjusted life years lost among males in West Sussex in 2016, contributing ", round(subset(Top_10_DALYs_males, cause == as.character(subset(DALYs_males, Rank_2016 == 1, select = "cause")), select = "2016")*100,1), "% of the total number of disability adjusted life years among males in this year. This cause of disability adjusted life years lost was ", ifelse(as.numeric(subset(DALYs_males, Rank_2016 == 1, select = "Rank_2006")) == 1, "also the top contributor to morbidity and mortality combined 10 years ago.", paste0(ifelse(as.numeric(subset(DALYs_males, Rank_2016 == 1, select = "Rank_2006")) < 10, paste0("ranked ", tolower(as.character(subset(number_names, Number == as.numeric(subset(DALYs_males, Rank_2016 == 1, select = "Rank_2006")), select = "Rank"))), " a decade ago."), ifelse(as.numeric(subset(DALYs_males, Rank_2016 == 1, select = "Rank_2006") == 10, "ranked tenth a decade ago.", " was not in the top ten ranking a decade ago."))))), " The overall proportion of years of life lost or lived with disability due to ", tolower(as.character(subset(DALYs_males, Rank_2016 == 1, select = "cause"))), " has ", as.character(ifelse(round(subset(Top_10_DALYs_males, cause == as.character(subset(DALYs_males, Rank_2016 == 1, select = "cause")), select = "2016")*100,1) == round(subset(Top_10_DALYs_males, cause == as.character(subset(DALYs_males, Rank_2016 == 1, select = "cause")), select = "2006")*100,1), paste0("stayed the same as in 2016"), ifelse(round(subset(Top_10_DALYs_males, cause == as.character(subset(DALYs_males, Rank_2016 == 1, select = "cause")), select = "2016")*100,1) > round(subset(Top_10_DALYs_males, cause == as.character(subset(DALYs_males, Rank_2016 == 1, select = "cause")), select = "2006")*100,1), paste0("increased since 2006 (", round(subset(Top_10_DALYs_males, cause == as.character(subset(DALYs_males, Rank_2016 == 1, select = "cause")), select = "2006")*100,1) ,"%)."), paste0("decreased since 2006 (", round(subset(Top_10_DALYs_males, cause == as.character(subset(DALYs_males, Rank_2016 == 1, select = "cause")), select = "2006")*100,1) ,"%).")))))

DALYs_females <- DALYs_rate_label %>% 
  filter(location == "West Sussex",
         sex == "Female",
         Rank_2006 <= 10 | Rank_2011 <= 10 | Rank_2016 <= 10)

DALYs_females_top_10 <- ggplot(DALYs_females) + 
  geom_segment(aes(x = 1, xend = 2, y = Rank_2006, yend = Rank_2016), size = .7, lty = "dashed", show.legend = FALSE) +
  geom_point(aes(x = 1, y = Rank_2006, col = cause_group), size = 7) +
  geom_text(aes(x = 1, y = Rank_2006, label = paste0(Rank_2006)), col = "#ffffff", fontface = "bold") +
  geom_point(aes(x = 2, y = Rank_2016, col = cause_group), size = 7) +
  geom_text(aes(x = 2, y = Rank_2016, label = paste0(Rank_2016)), col = "#ffffff", fontface = "bold") +
  scale_colour_manual(values = c("#C2464F", "#62A7B9", "#9DCB9C"), 
                      breaks = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"), 
                      limits = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"), 
                      labels = c("Communicable, maternal,\nneonatal, and nutritional diseases", "Non-communicable\ndiseases", "Injuries\n"),
                      name = "Cause\ngrouping") +
  labs(title = paste0("Ten biggest contributors to disability and mortality combined among ", tolower(unique(DALYs_females$sex)), "s;"),
       subtitle = paste0(unique(DALYs_females$location), "; age-standardised rate"), 
       caption = "Measure: Disability-adjusted Life Years (DALYs)\nRate per 100,000 and 95% uncertainty interval given under each cause",
       x = "",
       y = "") +
  scale_y_reverse() +
  scale_x_continuous(limits = c(-1,6)) +
  geom_text(aes(label = "2006 ranking", y = 0, x = 1), size = 3.5, col = "#000000", hjust = 0.5, fontface = "bold") +
  geom_text(aes(label = "2016 ranking", y = 0, x = 2), size = 3.5, col = "#000000", hjust = 0.5, fontface = "bold") +
  geom_text(aes(label = "% change 2006-2016", y = 0, x = 6), size = 3.5, col = "#000000", hjust = 1, fontface = "bold") +
  geom_text(aes(label = paste0(cause, "\n", Label_2006), y = Rank_2006, x = 0.8), size = 3.5, col = "#000000", hjust = 1) +
  geom_text(aes(label = paste0(cause, "\n", Label_2016), y = Rank_2016, x = 2.2), size = 3.5, col = "#000000", hjust = 0) +
  geom_text(data = subset(DALYs_females, change_10_year <= 0),aes(label = paste0(abs(round(change_10_year*100,1)), "% ", ifelse(change_10_year == 0, "(no change)\n", ifelse(change_10_year < 0, "decline in\nrate per 100,000", "increase in\nrate per 100,000"))), y = Rank_2016, x = 6), size = 3.5, col = "#000000", hjust = 1) +
  geom_text(data = subset(DALYs_females, change_10_year > 0), aes(label = paste0(abs(round(change_10_year*100,1)), "% ", ifelse(change_10_year == 0, "(no change)\n", ifelse(change_10_year < 0, "decline in\nrate per 100,000", "increase in\nrate per 100,000"))), y = Rank_2016, x = 6), size = 3.5, col = "#cc0000", hjust = 1) +
  slope_theme()

Top_10_DALYs_females <- Measures_perc_level_3 %>% 
  select(location, age, sex, cause_outline, cause, cause_id, level, Parent_cause, year, `DALYs (Disability-Adjusted Life Years)`) %>% 
  filter(location %in% DALYs_females$location,
         sex %in% DALYs_females$sex,
         cause %in% DALYs_females$cause) %>% 
  spread(year, `DALYs (Disability-Adjusted Life Years)`) %>% 
  select(location, age, sex, cause_outline, cause, cause_id, level, Parent_cause, `2006`,`2011`,`2016`) %>% 
  left_join(DALYs_females[c("cause_outline", "Rank_2006", "Rank_2016", "cause_group")], by = "cause_outline") %>% 
  arrange(Rank_2016)

paste0("The top 10 causes of age standardised disability adjusted life years for females in 2016 accounted for ", round(sum(subset(Top_10_DALYs_females, Rank_2016 <= 10, select = "2016"))*100,1), "% of the total burden of disability and mortality combined among females in 2016.")

paste0(subset(DALYs_females, Rank_2016 == 1, select = "cause"), " was the top cause of disability adjusted life years lost among females in West Sussex in 2016, contributing ", round(subset(Top_10_DALYs_females, cause == as.character(subset(DALYs_females, Rank_2016 == 1, select = "cause")), select = "2016")*100,1), "% of the total number of disability adjusted life years among females in this year. This cause of disability adjusted life years lost was ", ifelse(as.numeric(subset(DALYs_females, Rank_2016 == 1, select = "Rank_2006")) == 1, "also the top contributor to morbidity and mortality combined 10 years ago.", paste0(ifelse(as.numeric(subset(DALYs_females, Rank_2016 == 1, select = "Rank_2006")) < 10, paste0("ranked ", tolower(as.character(subset(number_names, Number == as.numeric(subset(DALYs_females, Rank_2016 == 1, select = "Rank_2006")), select = "Rank"))), " a decade ago."), ifelse(as.numeric(subset(DALYs_females, Rank_2016 == 1, select = "Rank_2006") == 10, "ranked tenth a decade ago.", " was not in the top ten ranking a decade ago."))))), " The overall proportion of years of life lost or lived with disability due to ", tolower(as.character(subset(DALYs_females, Rank_2016 == 1, select = "cause"))), " has ", as.character(ifelse(round(subset(Top_10_DALYs_females, cause == as.character(subset(DALYs_females, Rank_2016 == 1, select = "cause")), select = "2016")*100,1) == round(subset(Top_10_DALYs_females, cause == as.character(subset(DALYs_females, Rank_2016 == 1, select = "cause")), select = "2006")*100,1), paste0("stayed the same as in 2016"), ifelse(round(subset(Top_10_DALYs_females, cause == as.character(subset(DALYs_females, Rank_2016 == 1, select = "cause")), select = "2016")*100,1) > round(subset(Top_10_DALYs_females, cause == as.character(subset(DALYs_females, Rank_2016 == 1, select = "cause")), select = "2006")*100,1), paste0("increased since 2006 (", round(subset(Top_10_DALYs_females, cause == as.character(subset(DALYs_females, Rank_2016 == 1, select = "cause")), select = "2006")*100,1) ,"%)."), paste0("decreased since 2006 (", round(subset(Top_10_DALYs_females, cause == as.character(subset(DALYs_females, Rank_2016 == 1, select = "cause")), select = "2006")*100,1) ,"%).")))))

png(paste0("./GBD/DALYs_males_top_10.png"), width = 800, height = 500, res = 72, units = "px")
DALYs_males_top_10
dev.off()

png(paste0("./GBD/DALYs_females_top_10.png"), width = 800, height = 500, res = 72, units = "px")
DALYs_females_top_10
dev.off()

# DALYs comparison CIPFA neighbours ####

Eng_DALYs <- GBD_cause_data %>% 
  filter(year == max(GBD_cause_data$year, na.rm = TRUE),
         measure == "DALYs (Disability-Adjusted Life Years)",
         age == "Age-standardized",
         metric == "Rate",
         location %in% c("England")) %>%
  left_join(WSx_NN, by = c("location" = "Area_Name")) %>% 
  left_join(GBD_2016_cause_hierarchy, by = c("cause" = "cause_name")) %>% 
  filter(level == 2) %>% 
  select(measure, sex, age, cause, cause_outline, metric, year, val, lower, upper) %>% 
  rename(Eng_val = val,
         Eng_lower = lower,
         Eng_upper = upper) %>% 
  group_by(year, age, sex) %>% 
  arrange(desc(Eng_val)) %>% 
  mutate(Eng_Rate_rank = row_number())

CIPFA_DALYs <- GBD_cause_data %>% 
  filter(year == max(GBD_cause_data$year, na.rm = TRUE),
         measure == "DALYs (Disability-Adjusted Life Years)",
         age == "Age-standardized",
         metric == "Rate",
         location %in% c(WSx_NN$Area_Name, "West Sussex")) %>%
  left_join(WSx_NN, by = c("location" = "Area_Name")) %>% 
  left_join(GBD_2016_cause_hierarchy, by = c("cause" = "cause_name")) %>% 
  filter(level == 2) %>% 
  group_by(location, year, age, sex) %>% 
  arrange(desc(val)) %>% 
  mutate(Rate_rank = row_number()) %>% 
  left_join(Eng_DALYs, by = c("measure", "sex", "age", "cause", "cause_outline", "metric", "year")) %>% 
  mutate(sig_diff_eng = ifelse(lower > Eng_upper, "Significantly higher", ifelse(upper < Eng_lower, "Significantly lower", "Similar"))) %>% 
  mutate(Rate_label = paste0(format(round(val,0),big.mark = ",", trim = TRUE), "\n(", format(round(lower,0),big.mark = ",", trim = TRUE),"-", format(round(upper,0),big.mark = ",", trim = TRUE), ")")) %>% 
  ungroup()

DALYs_rate_rank_table <- CIPFA_DALYs %>% 
  mutate(Neighbour_rank = factor(Neighbour_rank, levels = c(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15))) %>% 
  arrange(Neighbour_rank) %>% 
  filter(sex == "Male") %>% 
  mutate(location = factor(location, levels = unique(location))) %>% 
  select(location, cause, val, sig_diff_eng) %>% 
  spread(cause, round(val,1))

write.csv(DALYs_rate_rank_table, "./GBD/DALYs_rate_rank_table.csv", row.names = FALSE, na = "")

# The quickest thing to do here would be to export the DALYs_rate_rank_table into excel, colour the cells manually (the significance is denoted by the row they are in).

# Over the lifecourse - West Sussex 2006, 2011, 2016 ####

# https://gbd2016.healthdata.org/gbd-search?params=gbd-api-2016-permalink/5fddda23d8d8f1a899a3ea8ee4be8a76
# download.file("http://s3.healthdata.org/gbd-api-2016-public/60faf82f867e12682f9c94d679142f98_files/IHME-GBD_2016_DATA-60faf82f-1.zip", "./GBD/UK_overlifecourse_part_1.zip", mode = "wb")
# download.file("http://s3.healthdata.org/gbd-api-2016-public/60faf82f867e12682f9c94d679142f98_files/IHME-GBD_2016_DATA-60faf82f-2.zip", "./GBD/UK_overlifecourse_part_2.zip", mode = "wb")
# 
# unzip("./GBD/UK_overlifecourse_part_1.zip", exdir = "./GBD")
# unzip("./GBD/UK_overlifecourse_part_2.zip", exdir = "./GBD")
# 
# file.remove(c("./GBD/UK_overlifecourse_part_1.zip", "./GBD/UK_overlifecourse_part_2.zip"))

gbd_age_data <- read_csv("./GBD/IHME-GBD_2016_DATA-60faf82f-1.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_number())) %>% 
  bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-60faf82f-2.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_number())))

# http://www.healthdata.org/sites/default/files/files/infographics/Infographic_GBD2016-YLDs-Highlights_2018_Page_1.png

yld_age_level_1 <- gbd_age_data %>% 
  filter(measure == "YLDs (Years Lived with Disability)",
         metric == "Number",
         year == max(year),
         age %in% c("Early Neonatal", "Late Neonatal",  "Post Neonatal",  "1 to 4", "5 to 9", "10 to 14", "15 to 19", "20 to 24", "25 to 29","30 to 34","35 to 39", "40 to 44","45 to 49","50 to 54","55 to 59","60 to 64","65 to 69","70 to 74","75 to 79", "80 to 84","85 to 89","90 to 94","95 plus")) %>%  
  mutate(age = factor(age, levels = c("Early Neonatal", "Late Neonatal",  "Post Neonatal",  "1 to 4", "5 to 9", "10 to 14", "15 to 19", "20 to 24", "25 to 29","30 to 34","35 to 39", "40 to 44","45 to 49","50 to 54","55 to 59","60 to 64","65 to 69","70 to 74","75 to 79", "80 to 84","85 to 89","90 to 94","95 plus"))) %>% 
  left_join(GBD_2016_cause_hierarchy, by = c("cause" = "cause_name")) %>% 
  filter(sex != "Both") %>% 
  filter(level == 1) %>% 
  mutate(cause = factor(cause, levels = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries")))

yld_age_level_1_plot <- ggplot(yld_age_level_1, aes(x = age,  y = val, fill = cause)) +
  geom_bar(position = "stack", stat = "identity") +
  scale_y_continuous(limits = c(0,6000), breaks = seq(0,6000, 500), labels = comma) +
  scale_fill_manual(values = c("#C2464F", "#62A7B9", "#9DCB9C"), 
                    breaks = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"), 
                    limits = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"), 
                    labels = c("Communicable, maternal, neonatal,\nand nutritional diseases", "Non-communicable\ndiseases", "Injuries\n"),
                    name = "Cause group\n(level 1)") +
  labs(title = paste0("Total number of years lived with disability; by age group and sex; ", unique(yld_age_level_1$year)),
       subtitle = paste0(unique(yld_age_level_1$location)),
       caption = "Measure: Years lived with disability (YLD)",
       x = "Age group",
       y = "Number") +
  stack_theme() +
  theme(axis.text.x = element_text(angle = 90),
        legend.position = "top",
        legend.key.height = unit(0.4, "cm"),
        legend.key.width = unit(0.2, "cm")) +
  facet_rep_wrap(~sex, repeat.tick.labels = TRUE)

png(paste0("./GBD/yld_age_level_1_plot.png"), width = 800, height = 500, res = 92, units = "px")
yld_age_level_1_plot
dev.off()

yld_age_level_2 <- gbd_age_data %>% 
  filter(measure == "YLDs (Years Lived with Disability)",
         metric == "Number",
         year == max(year),
         age %in% c("Early Neonatal", "Late Neonatal",  "Post Neonatal",  "1 to 4", "5 to 9", "10 to 14", "15 to 19", "20 to 24", "25 to 29","30 to 34","35 to 39", "40 to 44","45 to 49","50 to 54","55 to 59","60 to 64","65 to 69","70 to 74","75 to 79", "80 to 84","85 to 89","90 to 94","95 plus")) %>%  
  mutate(age = factor(age, levels = c("Early Neonatal", "Late Neonatal",  "Post Neonatal",  "1 to 4", "5 to 9", "10 to 14", "15 to 19", "20 to 24", "25 to 29","30 to 34","35 to 39", "40 to 44","45 to 49","50 to 54","55 to 59","60 to 64","65 to 69","70 to 74","75 to 79", "80 to 84","85 to 89","90 to 94","95 plus"))) %>% 
  left_join(GBD_2016_cause_hierarchy, by = c("cause" = "cause_name")) %>% 
  filter(sex != "Both") %>% 
  filter(level == 2) %>%
  arrange(cause_outline) %>% 
  mutate(cause = ifelse(nchar(cause) < 40, cause, sub('(.{1,40})(\\s|$)', '\\1\n', cause))) %>% 
  mutate(cause = factor(cause, levels =  unique(cause))) %>% 
  ungroup() 

yld_age_level_2_js <- gbd_age_data %>% 
  filter(measure == "YLDs (Years Lived with Disability)",
         metric == "Number",
         year == max(year),
         age == "All Ages") %>% 
  left_join(GBD_2016_cause_hierarchy[c("cause_name", "cause_id","cause_outline", "parent_id", "level")], by = c("cause" = "cause_name")) %>% 
  filter(level == 2) %>% 
  left_join(GBD_2016_cause_hierarchy[c("cause_name", "cause_id")], by = c("parent_id" = "cause_id")) %>% 
  rename(Parent_cause = cause_name) %>% 
  filter(sex == "Both") %>% 
  arrange(cause_outline) %>% 
  mutate(cause = capwords(cause, strict = TRUE)) %>%
  mutate(cause = factor(cause, levels =  unique(cause))) %>% 
  ungroup() %>%  
  mutate(Parent_cause = capwords(Parent_cause, strict = TRUE)) %>% 
  mutate(id = paste0(Parent_cause, ".", cause)) %>% 
  select(Parent_cause, cause, id, val, year, location) %>% 
  rename(value = val) %>% 
  arrange(desc(value))

r2d3(data = yld_age_level_2_js, script = "./Javascripts/bubbles_yld_level_2.js")

yld_age_level_2_plot <- ggplot(yld_age_level_2, aes(x = age,  y = val, fill = cause)) +
  geom_bar(position = "stack", stat = "identity") +
  scale_y_continuous(limits = c(0,6000), breaks = seq(0,6000, 500), labels = comma) +
  scale_fill_manual(values = c("#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d", '#a6bddb','#74a9cf','#3690c0','#0570b0','#034e7b',"#063367", '#9e9ac8','#807dba','#6a51a3','#54278f', "#bae4b3", "#74c476", "#31a354", "#22723a"), name = "Cause group\n(level 2)") +
  labs(title = paste0("Total number of years lived with disability; by age group and sex; ", unique(yld_age_level_2$year)),
       subtitle = paste0(unique(yld_age_level_2$location)),
       caption = "Measure: Years lived with disability (YLD)",
       x = "Age group",
       y = "Number of years lived with\ndisability (YLDs)") +
  stack_theme() +
  theme(axis.text.x = element_text(size = 7, angle = 90),
        legend.position = "right",
        legend.key.height = unit(0.4, "cm"),
        legend.key.width = unit(0.2, "cm"),
        legend.text = element_text(size = 8)) +
  guides(fill = guide_legend(ncol = 1)) +
  facet_rep_wrap(~sex, repeat.tick.labels = TRUE)

png(paste0("./GBD/yld_age_level_2_plot.png"), width = 800, height = 500, res = 92, units = "px")
yld_age_level_2_plot
dev.off()

daly_age_level_1 <- gbd_age_data %>% 
  filter(measure == "DALYs (Disability-Adjusted Life Years)",
         metric == "Number",
         year == max(year),
         age %in% c("Early Neonatal", "Late Neonatal",  "Post Neonatal",  "1 to 4", "5 to 9", "10 to 14", "15 to 19", "20 to 24", "25 to 29","30 to 34","35 to 39", "40 to 44","45 to 49","50 to 54","55 to 59","60 to 64","65 to 69","70 to 74","75 to 79", "80 to 84","85 to 89","90 to 94","95 plus")) %>%  
  mutate(age = factor(age, levels = c("Early Neonatal", "Late Neonatal",  "Post Neonatal",  "1 to 4", "5 to 9", "10 to 14", "15 to 19", "20 to 24", "25 to 29","30 to 34","35 to 39", "40 to 44","45 to 49","50 to 54","55 to 59","60 to 64","65 to 69","70 to 74","75 to 79", "80 to 84","85 to 89","90 to 94","95 plus"))) %>% 
  left_join(GBD_2016_cause_hierarchy, by = c("cause" = "cause_name")) %>% 
  filter(sex != "Both") %>% 
  filter(level == 1) %>% 
  mutate(cause = factor(cause, levels = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries")))

daly_age_level_1_plot <- ggplot(daly_age_level_1, aes(x = age,  y = val, fill = cause)) +
  geom_bar(position = "stack", stat = "identity") +
  scale_y_continuous(limits = c(0,14000), breaks = seq(0,14000, 1000), labels = comma) +
  scale_fill_manual(values = c("#C2464F", "#62A7B9", "#9DCB9C"), 
                    breaks = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"), 
                    limits = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"), 
                    labels = c("Communicable, maternal, neonatal,\nand nutritional diseases", "Non-communicable\ndiseases", "Injuries\n"),
                    name = "Cause group\n(level 1)") +
  labs(title = paste0("Total number of disability adjusted life years (ill health and premature mortality combined);\nby age group and sex; ", unique(daly_age_level_1$year)),
       subtitle = paste0(unique(daly_age_level_1$location)),
       caption = "Measure: DALYs (Disability-Adjusted Life Years)",
       x = "Age group",
       y = "Number") +
  stack_theme() +
  theme(axis.text.x = element_text(angle = 90),
        legend.position = "right",
        legend.key.height = unit(0.4, "cm"),
        legend.key.width = unit(0.2, "cm")) +
  facet_rep_wrap(~sex, repeat.tick.labels = TRUE)


png(paste0("./GBD/daly_age_level_1_plot.png"), width = 800, height = 500, res = 92, units = "px")
daly_age_level_1_plot
dev.off()

daly_age_level_2 <- gbd_age_data %>% 
  filter(measure == "DALYs (Disability-Adjusted Life Years)",
         metric == "Number",
         year == max(year),
         age %in% c("Early Neonatal", "Late Neonatal",  "Post Neonatal",  "1 to 4", "5 to 9", "10 to 14", "15 to 19", "20 to 24", "25 to 29","30 to 34","35 to 39", "40 to 44","45 to 49","50 to 54","55 to 59","60 to 64","65 to 69","70 to 74","75 to 79", "80 to 84","85 to 89","90 to 94","95 plus")) %>%  
  mutate(age = factor(age, levels = c("Early Neonatal", "Late Neonatal",  "Post Neonatal",  "1 to 4", "5 to 9", "10 to 14", "15 to 19", "20 to 24", "25 to 29","30 to 34","35 to 39", "40 to 44","45 to 49","50 to 54","55 to 59","60 to 64","65 to 69","70 to 74","75 to 79", "80 to 84","85 to 89","90 to 94","95 plus"))) %>% 
  left_join(GBD_2016_cause_hierarchy, by = c("cause" = "cause_name")) %>% 
  filter(sex != "Both") %>% 
  filter(level == 2) %>%
  arrange(cause_outline) %>% 
  mutate(cause = ifelse(nchar(cause) < 40, cause, sub('(.{1,40})(\\s|$)', '\\1\n', cause))) %>% 
  mutate(cause = factor(cause, levels =  unique(cause))) %>% 
  ungroup()

daly_age_level_2_plot <- ggplot(daly_age_level_2, aes(x = age,  y = val, fill = cause)) +
  geom_bar(position = "stack", stat = "identity") +
  scale_y_continuous(limits = c(0,14000), breaks = seq(0,14000, 1000), labels = comma) +
  scale_fill_manual(values = c("#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d", '#a6bddb','#74a9cf','#3690c0','#0570b0','#034e7b',"#063367", '#9e9ac8','#807dba','#6a51a3','#54278f', "#bae4b3", "#74c476", "#31a354", "#22723a"), name = "Cause group\n(level 2)") +
  labs(title = paste0("Total number of disability adjusted life years (ill health and premature mortality combined);\nby age group and sex; ", unique(daly_age_level_2$year)),
       subtitle = paste0(unique(daly_age_level_2$location)),
       caption = "Measure: DALYs (Disability-Adjusted Life Years)",
       x = "Age group",
       y = "Number") +
  stack_theme() +
  theme(axis.text.x = element_text(angle = 90),
        legend.position = "right",
        legend.key.height = unit(0.4, "cm"),
        legend.key.width = unit(0.2, "cm")) +
  guides(fill = guide_legend(ncol = 1)) +
  facet_rep_wrap(~sex, repeat.tick.labels = TRUE)

png(paste0("./GBD/daly_age_level_2_plot.png"), width = 800, height = 500, res = 92, units = "px")
daly_age_level_2_plot
dev.off()

# Cause proportion contributing to DALYs by age  ####
daly_age_perc_level_1 <- gbd_age_data %>% 
  filter(measure == "DALYs (Disability-Adjusted Life Years)",
         metric == "Percent",
         year == max(year),
         age %in% c("Early Neonatal", "Late Neonatal",  "Post Neonatal",  "1 to 4", "5 to 9", "10 to 14", "15 to 19", "20 to 24", "25 to 29","30 to 34","35 to 39", "40 to 44","45 to 49","50 to 54","55 to 59","60 to 64","65 to 69","70 to 74","75 to 79", "80 to 84","85 to 89","90 to 94","95 plus")) %>%  
  mutate(age = factor(age, levels = c("Early Neonatal", "Late Neonatal",  "Post Neonatal",  "1 to 4", "5 to 9", "10 to 14", "15 to 19", "20 to 24", "25 to 29","30 to 34","35 to 39", "40 to 44","45 to 49","50 to 54","55 to 59","60 to 64","65 to 69","70 to 74","75 to 79", "80 to 84","85 to 89","90 to 94","95 plus"))) %>% 
  left_join(GBD_2016_cause_hierarchy, by = c("cause" = "cause_name")) %>% 
  filter(sex != "Both") %>% 
  filter(level == 1) %>% 
  arrange(cause_outline) %>% 
  mutate(cause = ifelse(nchar(cause) < 35, cause, sub('(.{1,35})(\\s|$)', '\\1\n', cause))) %>%
  mutate(cause = factor(cause, levels =  unique(cause)))

daly_age_perc_level_1_plot <- ggplot(daly_age_perc_level_1, aes(x = age,  y = val, fill = cause)) +
  geom_bar(position = "stack", stat = "identity") +
  scale_y_continuous(breaks = seq(0,1, 0.1), labels = percent, expand = c(0,0.02)) +
  scale_fill_manual(values = c("#C2464F", "#62A7B9", "#9DCB9C"), 
                    name = "Cause group\n(level 1)") +
  labs(title = paste0("Contribution of causes towards disability adjusted life years (ill health and premature mortality combined);\nby age group and sex; ", unique(daly_age_perc_level_1$year)),
       subtitle = paste0(unique(daly_age_perc_level_1$location)),
       caption = "Measure: DALYs (Disability-Adjusted Life Years)",
       x = "Age group",
       y = "Number") +
  stack_theme() +
  theme(axis.text.x = element_text(angle = 90),
        legend.position = "right",
        legend.key.height = unit(0.4, "cm"),
        legend.key.width = unit(0.2, "cm")) +
  facet_rep_wrap(~sex, repeat.tick.labels = TRUE)

png(paste0("./GBD/daly_age_perc_level_1_plot.png"), width = 800, height = 500, res = 92, units = "px")
daly_age_perc_level_1_plot
dev.off()

daly_age_perc_level_2 <- gbd_age_data %>% 
  filter(measure == "DALYs (Disability-Adjusted Life Years)",
         metric == "Percent",
         year == max(year),
         age %in% c("Early Neonatal", "Late Neonatal",  "Post Neonatal",  "1 to 4", "5 to 9", "10 to 14", "15 to 19", "20 to 24", "25 to 29","30 to 34","35 to 39", "40 to 44","45 to 49","50 to 54","55 to 59","60 to 64","65 to 69","70 to 74","75 to 79", "80 to 84","85 to 89","90 to 94","95 plus")) %>%  
  mutate(age = factor(age, levels = c("Early Neonatal", "Late Neonatal",  "Post Neonatal",  "1 to 4", "5 to 9", "10 to 14", "15 to 19", "20 to 24", "25 to 29","30 to 34","35 to 39", "40 to 44","45 to 49","50 to 54","55 to 59","60 to 64","65 to 69","70 to 74","75 to 79", "80 to 84","85 to 89","90 to 94","95 plus"))) %>% 
  left_join(GBD_2016_cause_hierarchy, by = c("cause" = "cause_name")) %>% 
  filter(sex != "Both") %>% 
  filter(level == 2) %>% 
  arrange(cause_outline) %>% 
  mutate(cause = ifelse(nchar(cause) < 35, cause, sub('(.{1,35})(\\s|$)', '\\1\n', cause))) %>%
  mutate(cause = factor(cause, levels =  unique(cause)))

daly_age_perc_level_2_plot <- ggplot(daly_age_perc_level_2, aes(x = age,  y = val, fill = cause)) +
  geom_bar(position = "stack", stat = "identity") +
  scale_y_continuous(breaks = seq(0,1, 0.1), labels = percent, expand = c(0,0.02)) +
  scale_fill_manual(values = c("#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d", '#a6bddb','#74a9cf','#3690c0','#0570b0','#034e7b',"#063367", '#9e9ac8','#807dba','#6a51a3','#54278f', "#bae4b3", "#74c476", "#31a354", "#22723a"), name = "Cause group\n(level 2)") +
  labs(title = paste0("Contribution of causes towards disability adjusted life years (ill health and premature mortality combined);\nby age group and sex; ", unique(daly_age_perc_level_2$year)),
       subtitle = paste0(unique(daly_age_perc_level_2$location)),
       caption = "Measure: DALYs (Disability-Adjusted Life Years)",
       x = "Age group",
       y = "Number") +
  stack_theme() +
  theme(axis.text.x = element_text(angle = 90),
        legend.position = "right",
        legend.key.height = unit(0.4, "cm"),
        legend.key.width = unit(0.2, "cm")) +
  guides(fill = guide_legend(ncol = 1)) +
  facet_rep_wrap(~sex, repeat.tick.labels = TRUE)

png(paste0("./GBD/daly_age_perc_level_2_plot.png"), width = 800, height = 500, res = 92, units = "px")
daly_age_perc_level_2_plot
dev.off()

# West Sussex Cause Trends ####

# download.file("http://s3.healthdata.org/gbd-api-2016-public/acb9352741f3471dded02667e2a2d181_files/IHME-GBD_2016_DATA-acb93527-1.zip", "./GBD/Query_3_trend_part_1.zip", mode = "wb")
# download.file("http://s3.healthdata.org/gbd-api-2016-public/acb9352741f3471dded02667e2a2d181_files/IHME-GBD_2016_DATA-acb93527-2.zip", "./GBD/Query_3_trend_part_2.zip", mode = "wb")
 
# unzip("./GBD/Query_3_trend_part_1.zip", exdir = "./GBD")
# unzip("./GBD/Query_3_trend_part_2.zip", exdir = "./GBD")

GBD_cause_trend_data <- read_csv("./GBD/IHME-GBD_2016_DATA-acb93527-1.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), sex = col_character(), upper = col_double(), val = col_double(),year = col_integer())) %>% 
  bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-acb93527-2.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), sex = col_character(), upper = col_double(), val = col_double(),year = col_integer())))

# total change in disability for wsx ####

total_dalys_trend <- GBD_cause_trend_data %>% 
  filter(cause == "All causes", 
         measure == "DALYs (Disability-Adjusted Life Years)",
         sex != "Both",
         age == "Age-standardized",
         metric == "Rate")

ggplot(total_dalys_trend, aes(x = year, y = val, group = sex)) +
  geom_line(col = "#cc0000") +
  facet_rep_wrap(~ sex, ncol = 2, repeat.tick.labels = TRUE) +
  theme_minimal() +
  scale_y_continuous(limits = c(0, 35000), breaks = seq(0,35000,5000), labels = comma) +
  scale_x_continuous(breaks = seq(min(total_dalys_trend$year),max(total_dalys_trend$year), 1)) +
  geom_ribbon(aes(ymin = lower, ymax = upper), linetype = 2, alpha = 0.2)  +
  labs(title = paste0("Change in burden of disability and mortality combined among males and females; ", min(total_dalys_trend$year), "-", max(total_dalys_trend$year), ";"),
     subtitle = paste0(unique(total_dalys_trend$location), "; age-standardised rate"), 
     caption = "Measure: Disability-adjusted Life Years (DALYs)\nRate per 100,000 and 95% uncertainty interval given under each cause",
     x = "",
     y = "") +
  stack_theme() +
  theme(axis.text.x = element_text(angle = 90))

# Change in top ten causes males west sussex ####

download.file("http://s3.healthdata.org/gbd-api-2016-public/a368f2978aefd2505878d85e4009fc59_files/IHME-GBD_2016_DATA-a368f297-1.zip", "./GBD/UK_trend.zip", mode = "wb")
unzip("./GBD/UK_trend.zip", exdir = "./GBD")

Area_rate <- read_csv("./GBD/IHME-GBD_2016_DATA-a368f297-1.csv") %>% 
  group_by(cause) %>% 
  arrange(year) %>% 
  mutate(Perc_change_rate = (val - lag(val))/lag(val),
         LCI_change_rate = (lower - lag(lower))/lag(lower),
         UCI_change_rate = (upper - lag(upper))/lag(upper)) %>%
  ungroup() %>% 
  mutate(cause = factor(cause, levels = c("All causes", "Alzheimer disease and other dementias","Breast cancer", "Chronic obstructive pulmonary disease","Cirrhosis and other chronic liver diseases", "Colon and rectum cancer" , "Ischemic heart disease", "Lower respiratory infections", "Stroke",  "Tracheal, bronchus, and lung cancer"))) 

ggplot(Area_rate, aes(x = year, y = val, group = cause), fill = "#c8c8c8", col = "#ffffff") +
  geom_line(col = "#cc0000") +
  scale_x_continuous(breaks = seq(min(total_dalys_trend$year),max(total_dalys_trend$year), 1)) +
  facet_rep_wrap(~ cause, ncol = 2, repeat.tick.labels = TRUE, scales = "free") +
  geom_ribbon(aes(ymin = lower, ymax = upper), linetype = 2, alpha = 0.1) +  
  labs(title = paste0("Change in burden of disability and mortality combined among males and females; ", min(Area_rate$year), "-", max(Area_rate$year), ";"),
       subtitle = paste0(unique(Area_rate$location), "; age-standardised rate"), 
       caption = "Measure: Disability-adjusted Life Years (DALYs)\nRate per 100,000 and 95% uncertainty interval given under each cause\nNOTE: y axis are not consistent across each figure.",
       x = "",
       y = "") +
  stack_theme() +
  theme(axis.text.x = element_text(angle = 90))



paste0("A striking finding from the report is that on a day-to-day basis, the most common causes of burden for people are back pain, poor mental health, skin conditions and sight and hearing loss. These problems tend to attract less attention than causes of early death such as heart disease and cancer, but together they account for a huge amount of ill health and of course place a massive burden on the NHS and other care services.")

# age standardised comparisons with nearest neighbours, add deprivation.


ggplot(YLD_females) + 
  geom_segment(aes(x = 1, xend = 2, y = Rank_2006, yend = Rank_2016), size = .7, lty = "dashed", show.legend = FALSE) +
  geom_point(aes(x = 1, y = Rank_2006, col = cause_group), size = 7) +
  geom_text(aes(x = 1, y = Rank_2006, label = paste0(YLD_females$Rank_2006)), col = "#ffffff", fontface = "bold") +
  geom_point(aes(x = 2, y = Rank_2016, col = cause_group), size = 7) +
  geom_text(aes(x = 2, y = Rank_2016, label = paste0(YLD_females$Rank_2016)), col = "#ffffff", fontface = "bold") +
  scale_colour_manual(values = c("#C2464F", "#62A7B9", "#9DCB9C"), breaks = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"), limits = c("Communicable, maternal, neonatal, and nutritional diseases", "Non-communicable diseases", "Injuries"), name = "Cause\ngrouping") +
  labs(title = paste0("Ten biggest contributors to disability; ","West Sussex and CIPFA Neighbours", "; ", unique(YLD_females$age)),
       subtitle = "Measure: Years lived with disability (YLD)",
       x = "",
       y = "") +
  scale_y_reverse() +
  scale_x_continuous(limits = c(-1,6)) +
  geom_text(aes(label = "2006 ranking", y = 0, x = 1), size = 3.5, col = "#000000", hjust = 0.5, fontface = "bold") +
  geom_text(aes(label = "2016 ranking", y = 0, x = 2), size = 3.5, col = "#000000", hjust = 0.5, fontface = "bold") +
  geom_text(aes(label = "% change 2006-2016", y = 0, x = 6), size = 3.5, col = "#000000", hjust = 1, fontface = "bold") +
  geom_text(aes(label = YLD_females$cause, y = YLD_females$Rank_2006, x = 0.8), size = 3.5, col = "#000000", hjust = 1, fontface = "bold") +
  geom_text(aes(label = YLD_females$cause, y = YLD_females$Rank_2016, x = 2.2), size = 3.5, col = "#000000", hjust = 0, fontface = "bold") +
  geom_text(aes(label = paste0(round(YLD_females$change*100,1), "%"), y = YLD_females$Rank_2016, x = 6), size = 3.5, col = "#000000", hjust = 1) +
  theme(axis.text = element_blank(),
        plot.title = element_text(colour = "#000000", face = "bold", size = 10),    
        plot.subtitle = element_text(colour = "#000000", size = 9),
        strip.text = element_text(colour = "#000000", size = 10, face = "bold"),
        plot.margin = unit(c(0,2,0,0), "cm"),
        # legend.position = c(.75,-.1), 
        legend.position = "bottom", 
        legend.title = element_text(colour = "#000000", size = 10, face = "bold"), 
        legend.background = element_blank(), 
        legend.key = element_rect(fill = "#ffffff", colour = "#ffffff"), 
        legend.text = element_text(colour = "#000000", size = 8),
        panel.grid.major = element_blank(), 
        panel.grid.minor = element_blank(),
        panel.background = element_blank(), 
        panel.border = element_blank(),
        strip.background = element_blank(), 
        axis.ticks = element_blank(), 
        axis.line = element_blank()) +
  facet_wrap(~ location)

paste0("The same causes feature as the most ")

# age-standardised YLDs per 100,000

# annual changes in YLDs for 10 latest leading causes 

# Track changes over time

# what are the key points from all this... 10-20 messages.

# data source variation and unavailability of quality data could be a source of variation, as well as explain the limited variation compared to ylls


# Risks

# Risk - cause pairs look at risks all cause ylds

# Risks related to top 10 causes of ylds

# download.file("http://s3.healthdata.org/gbd-api-2016-public/dfc1ea5299093e3a0e04df5eda95b29f_files/IHME-GBD_2016_DATA-dfc1ea52-1.zip", "./GBD/Query_2_n_part_1.zip", mode = "wb")
# download.file("http://s3.healthdata.org/gbd-api-2016-public/dfc1ea5299093e3a0e04df5eda95b29f_files/IHME-GBD_2016_DATA-dfc1ea52-2.zip", "./GBD/Query_2_n_part_2.zip", mode = "wb")
# download.file("http://s3.healthdata.org/gbd-api-2016-public/dfc1ea5299093e3a0e04df5eda95b29f_files/IHME-GBD_2016_DATA-dfc1ea52-3.zip", "./GBD/Query_2_n_part_3.zip", mode = "wb")
# download.file("http://s3.healthdata.org/gbd-api-2016-public/dfc1ea5299093e3a0e04df5eda95b29f_files/IHME-GBD_2016_DATA-dfc1ea52-4.zip", "./GBD/Query_2_n_part_4.zip", mode = "wb")
# download.file("http://s3.healthdata.org/gbd-api-2016-public/dfc1ea5299093e3a0e04df5eda95b29f_files/IHME-GBD_2016_DATA-dfc1ea52-5.zip", "./GBD/Query_2_n_part_5.zip", mode = "wb")
# download.file("http://s3.healthdata.org/gbd-api-2016-public/dfc1ea5299093e3a0e04df5eda95b29f_files/IHME-GBD_2016_DATA-dfc1ea52-6.zip", "./GBD/Query_2_n_part_6.zip", mode = "wb")
# download.file("http://s3.healthdata.org/gbd-api-2016-public/dfc1ea5299093e3a0e04df5eda95b29f_files/IHME-GBD_2016_DATA-dfc1ea52-7.zip", "./GBD/Query_2_n_part_7.zip", mode = "wb")
# download.file("http://s3.healthdata.org/gbd-api-2016-public/dfc1ea5299093e3a0e04df5eda95b29f_files/IHME-GBD_2016_DATA-dfc1ea52-8.zip", "./GBD/Query_2_n_part_8.zip", mode = "wb")
# download.file("http://s3.healthdata.org/gbd-api-2016-public/dfc1ea5299093e3a0e04df5eda95b29f_files/IHME-GBD_2016_DATA-dfc1ea52-9.zip", "./GBD/Query_2_n_part_9.zip", mode = "wb")
# download.file("http://s3.healthdata.org/gbd-api-2016-public/dfc1ea5299093e3a0e04df5eda95b29f_files/IHME-GBD_2016_DATA-dfc1ea52-10.zip", "./GBD/Query_2_n_part_10.zip", mode = "wb")
# download.file("http://s3.healthdata.org/gbd-api-2016-public/dfc1ea5299093e3a0e04df5eda95b29f_files/IHME-GBD_2016_DATA-dfc1ea52-11.zip", "./GBD/Query_2_n_part_11.zip", mode = "wb")
# download.file("http://s3.healthdata.org/gbd-api-2016-public/dfc1ea5299093e3a0e04df5eda95b29f_files/IHME-GBD_2016_DATA-dfc1ea52-12.zip", "./GBD/Query_2_n_part_12.zip", mode = "wb")
# download.file("http://s3.healthdata.org/gbd-api-2016-public/dfc1ea5299093e3a0e04df5eda95b29f_files/IHME-GBD_2016_DATA-dfc1ea52-13.zip", "./GBD/Query_2_n_part_13.zip", mode = "wb")

# unzip("./GBD/Query_2_n_part_1.zip", exdir = "./GBD")
# unzip("./GBD/Query_2_n_part_2.zip", exdir = "./GBD")
# unzip("./GBD/Query_2_n_part_3.zip", exdir = "./GBD")
# unzip("./GBD/Query_2_n_part_4.zip", exdir = "./GBD")
# unzip("./GBD/Query_2_n_part_5.zip", exdir = "./GBD")
# unzip("./GBD/Query_2_n_part_6.zip", exdir = "./GBD")
# unzip("./GBD/Query_2_n_part_7.zip", exdir = "./GBD")
# unzip("./GBD/Query_2_n_part_8.zip", exdir = "./GBD")
# unzip("./GBD/Query_2_n_part_9.zip", exdir = "./GBD")
# unzip("./GBD/Query_2_n_part_10.zip", exdir = "./GBD")
# unzip("./GBD/Query_2_n_part_11.zip", exdir = "./GBD")
# unzip("./GBD/Query_2_n_part_12.zip", exdir = "./GBD")
# unzip("./GBD/Query_2_n_part_13.zip", exdir = "./GBD")

# file.remove("./GBD/Query_2_n_part_1.zip","./GBD/Query_2_n_part_2.zip","./GBD/Query_2_n_part_3.zip","./GBD/Query_2_n_part_4.zip","./GBD/Query_2_n_part_5.zip","./GBD/Query_2_n_part_6.zip","./GBD/Query_2_n_part_7.zip","./GBD/Query_2_n_part_8.zip","./GBD/Query_2_n_part_9.zip","./GBD/Query_2_n_part_10.zip","./GBD/Query_2_n_part_11.zip","./GBD/Query_2_n_part_12.zip","./GBD/Query_2_n_part_13.zip")


GBD_risk_data <- read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-1.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character())) %>% 
  bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-2.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
  bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-3.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
  bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-4.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
  bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-5.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
  bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-6.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
  bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-7.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
  bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-8.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
  bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-9.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
  bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-10.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
  bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-11.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
  bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-12.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
  bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-13.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character())))

GBD_risk_group <- gbd_rei_hierarchy %>% 
  filter(level == 1, parent_id == 169)

Risk_DALY_1 <- GBD_risk_data %>% 
  filter(location == "West Sussex",
         year %in% c(2006, 2016),
         measure == "DALYs (Disability-Adjusted Life Years)",
         sex == "Female",
         age == "Age-standardized",
         metric == "Rate",
         cause == "All causes") %>% 
  select(location, sex, age, year, val, cause, rei) %>% 
  spread(year, val)  %>% 
  mutate(change = (Rank_2016-Rank_2006)/Rank_2006) %>% 
  gather(Rank_2006:Rank_2016, key = year, value = val) %>% 
  left_join(gbd_rei_hierarchy, by = c("rei" = "rei_name")) %>% 
  filter(level == 2) %>% 
  group_by(year) %>% 
  arrange(desc(val)) %>% 
  mutate(rank = row_number()) %>% 
  select(location, sex, age, year, rank, change, cause, rei, parent_id) %>% 
  spread(year, rank) %>% 
  filter(Rank_2006 <= 10 | Rank_2016 <= 10) %>% 
  left_join(GBD_risk_group[c("rei_id", "rei_name")], by = c("parent_id" = "rei_id")) %>% 
  rename(risk_group = rei_name) %>% 
  mutate(risk_group = factor(risk_group, levels = c("Behavioral risks","Environmental/occupational risks", "Metabolic risks")))

# Metabolic = "#F7DBBB"
# envrionment = "#B2EBDE"
# behaviour = "#CEB2EB"

ggplot(Risk_DALY_1) + 
  geom_segment(aes(x = 1, xend = 2, y = Rank_2006, yend = Rank_2016), size = .7, lty = "dashed", show.legend = FALSE) +
  geom_point(aes(x = 1, y = Rank_2006, col = risk_group), size = 7) +
  geom_text(aes(x = 1, y = Rank_2006, label = paste0(Risk_DALY_1$Rank_2006)), col = "#ffffff", fontface = "bold") +
  geom_point(aes(x = 2, y = Rank_2016, col = risk_group), size = 7) +
  geom_text(aes(x = 2, y = Rank_2016, label = paste0(Risk_DALY_1$Rank_2016)), col = "#ffffff", fontface = "bold") +
  scale_colour_manual(values = c("#CEB2EB", "#B2EBDE", "#F7DBBB"), breaks = c("Behavioral risks","Environmental/occupational risks", "Metabolic risks"), limits = c("Behavioral risks","Environmental/occupational risks", "Metabolic risks"), name = "Risk grouping") +
  labs(title = paste0("Ten biggest risk factors for disability; ",unique(Risk_DALY_1$location), "; ", unique(Risk_DALY_1$age)),
       subtitle = "Measure: Disability Adjusted Life Years (DALYs)",
       x = "",
       y = "") +
  scale_y_reverse() +
  scale_x_continuous(limits = c(-1,6)) +
  geom_text(aes(label = "2006 ranking", y = 0, x = 1), size = 3.5, col = "#000000", hjust = 0.5, fontface = "bold") +
  geom_text(aes(label = "2016 ranking", y = 0, x = 2), size = 3.5, col = "#000000", hjust = 0.5, fontface = "bold") +
  geom_text(aes(label = "% change 2006-2016", y = 0, x = 6), size = 3.5, col = "#000000", hjust = 1, fontface = "bold") +
  geom_text(aes(label = Risk_DALY_1$rei, y = Risk_DALY_1$Rank_2006, x = 0.8), size = 3.5, col = "#000000", hjust = 1, fontface = "bold") +
  geom_text(aes(label = Risk_DALY_1$rei, y = Risk_DALY_1$Rank_2016, x = 2.2), size = 3.5, col = "#000000", hjust = 0, fontface = "bold") +
  geom_text(aes(label = paste0(round(Risk_DALY_1$change*100,1), "%"), y = Risk_DALY_1$Rank_2016, x = 6), size = 3.5, col = "#000000", hjust = 1) +
  theme(axis.text = element_blank(),
        plot.title = element_text(colour = "#000000", face = "bold", size = 10),    
        plot.subtitle = element_text(colour = "#000000", size = 9),
        strip.text = element_text(colour = "#000000", size = 10, face = "bold"),
        plot.margin = unit(c(0,2,0,0), "cm"),
        # legend.position = c(.75,-.1), 
        legend.position = "bottom", 
        legend.title = element_text(colour = "#000000", size = 10, face = "bold"), 
        legend.background = element_blank(), 
        legend.key = element_rect(fill = "#ffffff", colour = "#ffffff"), 
        legend.text = element_text(colour = "#000000", size = 8),
        panel.grid.major = element_blank(), 
        panel.grid.minor = element_blank(),
        panel.background = element_blank(), 
        panel.border = element_blank(),
        strip.background = element_blank(), 
        axis.ticks = element_blank(), 
        axis.line = element_blank())


