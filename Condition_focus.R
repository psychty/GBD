# You need to download the Global Burden of Disease data manually - and the links expire after a time so it is impossible to automate the downloading (and I have tried a few ways).

options(scipen = 999)

# You cannot sum risk factor values across causes, but you can sum cause values across risk factors
library(easypackages)

libraries(c("readxl", "readr", "plyr", "dplyr", "ggplot2", "png", "tidyverse", "reshape2", "scales", "viridis", "rgdal", "officer", "flextable", "tmaptools", "lemon", "fingertipsR", "PHEindicatormethods", "jsonlite"))

Area_x = 'West Sussex'

# Incidence data published for 2017 - included in download
# Prevalence data published for 2017

GBD_2017_cause_hierarchy <- read_excel("~/Documents/GBD_data_download/IHME_GBD_2017_CAUSE_HIERARCHY_Y2018M11D18.xlsx", col_types = c("text", "text", "text", "text", "text", "numeric", "text", "text")) %>% 
  rename(Cause_name = cause_name,
         Cause_id = cause_id,
         Parent_id = parent_id,
         Cause_outline = cause_outline,
         Level = level)

Causes_in_each_level <- GBD_2017_cause_hierarchy %>% 
  select(Level) %>% 
  group_by(Level) %>% 
  summarise(n())

Condition_age <- unique(list.files("~/Documents/GBD_data_download")[grepl("b328ae1f", list.files("~/Documents/GBD_data_download/")) == TRUE]) %>% 
  map_df(~read_csv(paste0("~/Documents/GBD_data_download/",.), col_types = cols(measure = col_character(),location = col_character(),sex = col_character(),age = col_character(),cause = col_character(),metric = col_character(),year = col_double(),val = col_double(),upper = col_double(),lower = col_double()))) %>% 
  left_join(GBD_2017_cause_hierarchy[c("Cause_name", "Cause_outline", "Cause_id", "Parent_id", "Level")], by = c("cause" = "Cause_name")) %>% 
  left_join(GBD_2017_cause_hierarchy[c("Cause_name", "Cause_id")], by = c("Parent_id" = "Cause_id")) %>% 
  rename(`Cause group` = Cause_name,
         Area = location,
         Lower_estimate = lower,
         Upper_estimate = upper,
         Estimate = val,
         Year = year,
         Sex = sex,
         Age = age,
         Cause = cause,
         Measure = measure) %>% 
  mutate(Metric = ifelse(metric == "Rate", "Rate per 100,000 population", ifelse(metric == "Percent", "Proportion of total burden caused by this condition", metric))) %>% 
  mutate(Cause = factor(Cause, levels =  unique(Cause))) %>% 
  select(Area, Sex, Age, Year, Cause, Cause_outline, Cause_id, Level, Estimate, Lower_estimate, Upper_estimate, `Cause group`, Parent_id, Measure, Metric) %>% 
  filter(Age %in% c("Early Neonatal", "Late Neonatal",  "Post Neonatal",  "1 to 4", "5 to 9", "10 to 14", "15 to 19", "20 to 24", "25 to 29","30 to 34","35 to 39", "40 to 44","45 to 49","50 to 54","55 to 59","60 to 64","65 to 69","70 to 74","75 to 79", "80 to 84","85 to 89","90 to 94","95 plus")) %>%  
  mutate(Age = factor(Age, levels = c("Early Neonatal", "Late Neonatal",  "Post Neonatal",  "1 to 4", "5 to 9", "10 to 14", "15 to 19", "20 to 24", "25 to 29","30 to 34","35 to 39", "40 to 44","45 to 49","50 to 54","55 to 59","60 to 64","65 to 69","70 to 74","75 to 79", "80 to 84","85 to 89","90 to 94","95 plus"))) %>% 
  filter(Year %in% c(2007, 2012, 2017)) 

# Cause of mortality and morbidity ####
# This is 3.5 million records
All_ages_GBD_cause_data <- unique(list.files("~/Documents/GBD_data_download/")[grepl("e004c73d", list.files("~/Documents/GBD_data_download/")) == TRUE]) %>% 
  map_df(~read_csv(paste0("~/Documents/GBD_data_download/",.), col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_number()))) %>% 
  filter(age != 'Age-standardized') %>% 
  rename(Area = location,
         Lower_estimate = lower,
         Upper_estimate = upper,
         Estimate = val,
         Year = year,
         Sex = sex,
         Age = age,
         Cause = cause) %>% 
  mutate(metric = ifelse(metric == "Rate", "Rate per 100,000 population", ifelse(metric == "Percent", "Proportion of total burden caused by this condition", metric))) %>% 
  left_join(GBD_2017_cause_hierarchy[c("Cause_name", "Cause_outline", "Cause_id", "Parent_id", "Level")], by = c("Cause" = "Cause_name")) %>% 
  left_join(GBD_2017_cause_hierarchy[c("Cause_name", "Cause_id")], by = c("Parent_id" = "Cause_id")) %>% 
  rename(`Cause group` = Cause_name) %>% 
  mutate(Cause = factor(Cause, levels =  unique(Cause))) %>% 
  select(Area, Sex, Year, Cause, Cause_outline, Cause_id, Level, Estimate, Lower_estimate, Upper_estimate, `Cause group`, Parent_id, measure, metric) %>% 
  filter(Area %in% c(Area_x, 'England')) %>% 
  filter(Level == 3) %>% 
  filter(!(measure %in% c('Incidence', 'Prevalence')))

Condition_number <- All_ages_GBD_cause_data %>% 
  filter(metric == "Number") %>% 
  filter(Year %in% c(2017, 2012, 2007)) %>% 
  group_by(measure, Year, Area, Sex) %>%   
  select(-c(Lower_estimate, Upper_estimate, Cause_outline, Cause_id, metric, Parent_id)) %>% 
  spread(measure, Estimate) %>% 
  ungroup() %>% 
  rename(YLL = `YLLs (Years of Life Lost)`) %>% 
  rename(YLD = `YLDs (Years Lived with Disability)`) %>% 
  rename(DALY = `DALYs (Disability-Adjusted Life Years)`) %>% 
  mutate(Deaths = replace_na(Deaths, 0)) %>% 
  mutate(YLL = replace_na(YLL, 0)) %>% 
  mutate(YLD = replace_na(YLD, 0)) %>% 
  mutate(DALY = replace_na(DALY, 0)) 

Condition_number <- All_ages_GBD_cause_data %>% 
  filter(metric == "Number") %>% 
  filter(Year %in% c(2017, 2012, 2007)) %>% 
  select(-c(Lower_estimate, Upper_estimate, Cause_outline, Cause_id, metric, Parent_id)) %>% 
  mutate(measure = ifelse(measure == 'YLLs (Years of Life Lost)', 'YLL', ifelse(measure == 'YLDs (Years Lived with Disability)', 'YLD', ifelse(measure == 'DALYs (Disability-Adjusted Life Years)', 'DALY', measure)))) %>% 
  mutate(Estimate = replace_na(Estimate, 0))
 
# level 3 condition infographic
# number deaths etc
Condition_a <- Condition_number %>% 
  select(Year, Sex, Cause, `Cause group`, measure, Estimate) %>% 
  group_by(measure, Cause) %>% 
  spread(Sex, Estimate) %>% 
  mutate(Male_prop = ifelse(Both == 0, 0, Male/ Both)) %>% 
  mutate(Female_prop = ifelse(Both == 0, 0, Female/Both)) %>% 
  rename(Male_number = Male,
         Female_number = Female,
         Total_number = Both) %>% 
  mutate(higher_sex = ifelse(Total_number == 0, 'No estimated burden', ifelse(Male_number > Female_number, 'Male', 'Female')))

# highest deaths age (can you get an average age of death by condition??)

# This is the 5 year age group with the highest burden in the year
Highest_age <- Condition_age %>% 
  filter(Metric == 'Number') %>% 
  select(Sex, Age, Year, Cause, Estimate, Measure) %>% 
  group_by(Sex, Year, Cause, Measure) %>% 
  mutate(Proportion =  Estimate / sum(Estimate)) %>% 
  filter(Estimate == max(Estimate)) %>% 
  mutate(Age = ifelse(Estimate == 0, 'No estimated burden', as.character(Age))) %>% 
  rename(Highest_age = Age) %>% 
  ungroup()

High <- Highest_age %>% 
  select(-Proportion) %>% 
  group_by(Year, Cause, Measure) %>% 
  spread(Sex, Estimate)

?spread()
# rate per 100,000 deaths, yll, yld daly
# rank of deaths DALYs
# compare DALY to England and SE
# change since 07 and 12
# number of level 3 risk factors associated to condition
# top 5 contributing risk factors (note overlap unknown)
# how much of the burden is not attributed to a risk factor

# cancer
cancer <- Condition_number %>% 
  filter(`Cause group` == 'Neoplasms')

unique(cancer$Cause)

# cvd
cvd <- Condition_number %>% 
  filter(`Cause group` == 'Cardiovascular diseases')

unique(cvd$Cause)

# msk
msk <- Condition_number %>% 
  filter(`Cause group` == 'Musculoskeletal disorders')

unique(msk$Cause)



