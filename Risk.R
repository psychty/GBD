library(easypackages)

libraries(c("readxl", "readr", "plyr", "dplyr", "ggplot2", "png", "tidyverse", "reshape2", "scales", "viridis", "rgdal", "officer", "flextable", "tmaptools", "lemon", "fingertipsR", "PHEindicatormethods", "jsonlite"))

options(scipen = 999)

# This is 1.2 million records
GBD_risk_data_wsx <- unique(list.files("~/Documents/GBD_data_download/Risk/")[grepl("efaea572", list.files("~/Documents/GBD_data_download/Risk/")) == TRUE]) %>% 
  map_df(~read_csv(paste0("~/Documents/GBD_data_download/Risk/",.), col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_number()))) %>% 
  rename(Area = location,
         Lower_estimate = lower,
         Upper_estimate = upper,
         Estimate = val,
         Year = year,
         Sex = sex,
         Age = age,
         Cause = cause) %>% 
  mutate(metric = ifelse(metric == "Rate", "Rate per 100,000 population", ifelse(metric == "Percent", "Proportion of total burden caused by this condition", metric)))

GBD_risk_data_all_cause_NN <- unique(list.files("~/Documents/GBD_data_download/Risk/")[grepl("defcbaed", list.files("~/Documents/GBD_data_download/Risk/")) == TRUE]) %>% 
  map_df(~read_csv(paste0("~/Documents/GBD_data_download/Risk/",.), col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_number()))) 

unique(GBD_risk_data$cause)
unique(GBD_risk_data$location)
unique(GBD_risk_data$rei)
unique(GBD_risk_data$year)


Risk_all_cause <- GBD_risk_data %>% 
  filter(cause == 'All causes')



