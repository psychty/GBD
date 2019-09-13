
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

# http://ghdx.healthdata.org/gbd-results-tool
# http://www.healthdata.org/united-kingdom
# http://www.who.int/quantifying_ehimpacts/publications/en/9241546204chap3.pdf

# You need to download the Global Burden of Disease data manually - and the links expire after a time so it is impossible to automate the downloading (and I have tried a few ways).

# You cannot sum risk factor values across causes, but you can sum cause values across risk factors

# Incidence data published for 2017 - included in download
# Prevalence data published for 2017

# This uses the easypackages package to load several libraries at once. Note: it should only be used when you are confident that all packages are installed as it will be more difficult to spot load errors compared to loading each one individually.
library(easypackages)

libraries(c("readxl", "readr", "plyr", "dplyr", "ggplot2", "png", "tidyverse", "reshape2", "scales", "viridis", "rgdal", "officer", "flextable", "tmaptools", "lemon", "fingertipsR", "PHEindicatormethods", "jsonlite"))

Area_x <- "West Sussex"
options(scipen = 999)

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
  # mutate(Cause = ifelse(nchar(Cause) < 40, Cause, sub('(.{1,40})(\\s|$)', '\\1\n', Cause))) %>%
  mutate(Cause = factor(Cause, levels =  unique(Cause))) %>% 
  select(Area, Sex, Year, Cause, Cause_outline, Cause_id, Level, Estimate, Lower_estimate, Upper_estimate, `Cause group`, Parent_id, measure, metric)


Cause_number <- All_ages_GBD_cause_data %>% 
  filter(metric == "Number") %>% 
  group_by(measure, Year, Area, Sex) %>%   
  select(-c(Lower_estimate, Upper_estimate)) %>% 
  spread(measure, Estimate) %>% 
  ungroup() 

# Percent is the proportion of the deaths in the given location for the given sex, year, and level.
Cause_perc <- All_ages_GBD_cause_data %>% 
  filter(metric == "Proportion of total burden caused by this condition") %>% 
  group_by(measure, Year, Area, Sex) %>%   
  select(-c(Lower_estimate, Upper_estimate)) %>% 
  spread(measure, Estimate) %>% 
  ungroup()

# Rate is per 100,000 population
# Number is the count of deaths

Area_x_cause_number <- Cause_number %>% 
  filter(Area == Area_x) %>% 
  arrange(Sex, Year, Cause_outline) 

Area_x_cause_perc <- Cause_perc %>% 
  filter(Area == Area_x) %>% 
  arrange(Sex, Year, Cause_outline)

# We need to remove the NAs and replace them with zeros (otherwise the JSON file we are about to export won't be read properly)
Area_x_cause <- Area_x_cause_number %>% 
  bind_rows(Area_x_cause_perc) %>% 
  mutate(Deaths = replace_na(Deaths, 0)) %>% 
  mutate(Incidence = replace_na(Incidence, 0)) %>% 
  mutate(Prevalence = replace_na(Prevalence, 0)) %>% 
  mutate(`YLDs (Years Lived with Disability)` = replace_na(`YLDs (Years Lived with Disability)`, 0)) %>% 
  mutate(`YLLs (Years of Life Lost)` = replace_na(`YLLs (Years of Life Lost)`, 0))

# This exports a JSON file of the total number of deaths and YLLs by sex in the most recent year for our chosen area
Area_x_cause %>% 
  filter(Level == 0) %>%
  filter(Year %in% c(max(Year))) %>% 
  filter(metric == "Number") %>% 
  select(Year, Sex, Cause, Deaths, `YLLs (Years of Life Lost)`) %>% 
  toJSON() %>% 
  write_lines(paste0('/Users/richtyler/Documents/Repositories/GBD/Total_deaths_yll_2017_', gsub(" ", "_", tolower(Area_x)), '.json'))

Area_x_cause <- Area_x_cause %>% 
  select(-c(Area, Cause_outline, Cause_id, Parent_id))

# Change over time for deaths at all levels by sex ####
Area_deaths_2017 <- Area_x_cause %>% 
  filter(Level %in% c(2,3)) %>% 
  filter(Year == 2017) %>% 
  rename(Deaths_2017 = Deaths)

Area_deaths_2017_a <- Area_x_cause %>% 
  filter(Level %in% c(2,3)) %>% 
  filter(Year %in% c(1997, 2002, 2007, 2012, 2017)) %>% 
  select(Sex, Year, Cause, Level,`Cause group`, metric, Deaths) %>% 
  group_by(Sex, Level, metric) %>% 
  mutate(Rank = rank(-Deaths)) %>% 
  left_join(Area_deaths_2017[c('Sex', 'Cause', 'Cause group', 'Level', 'metric','Deaths_2017')], by = c('Sex', 'Cause', 'Cause group','metric', 'Level')) %>% 
  ungroup() %>% 
  mutate(Change_to_2017 = ifelse(metric == 'Number', ((Deaths_2017 - Deaths) / Deaths)*100, ifelse(metric == 'Proportion of total burden caused by this condition', Deaths_2017 - Deaths, NA))) %>%
  mutate(Change_label = paste0('Change since ', Year)) %>% 
  mutate(Rank_label = paste0('Rank in ', Year)) %>% 
  mutate(Death_label = paste0('Deaths in ', Year))
  
Area_deaths_2017_b <- Area_deaths_2017_a %>% 
  select(Sex, Cause, metric, Change_to_2017, Change_label) %>% 
  filter(Change_label != 'Change since 2017') %>% 
  spread(Change_label, Change_to_2017)

Area_deaths_2017_c <- Area_deaths_2017_a %>% 
  select(Sex, Cause, metric, Rank, Rank_label) %>% 
  spread(Rank_label, Rank)

Area_deaths_2017_d <- Area_deaths_2017_a %>% 
  select(Sex, Cause, metric, Deaths, Death_label) %>% 
  spread(Death_label, Deaths)

Area_deaths_2017 <- Area_deaths_2017 %>% 
  left_join(Area_deaths_2017_b, by = c('Sex', 'Cause', 'metric')) %>% 
  select(-c('DALYs (Disability-Adjusted Life Years)', "Incidence",'Prevalence','YLDs (Years Lived with Disability)', "YLLs (Years of Life Lost)")) %>% 
  left_join(Area_deaths_2017_c, by = c('Sex', 'Cause', 'metric')) %>% 
  left_join(Area_deaths_2017_d, by = c('Sex', 'Cause', 'metric')) %>% 
  select(-Deaths_2017) %>% 
  mutate(`Change since 1997` = replace_na(`Change since 1997`, 0)) %>% 
  mutate(`Change since 2002` = replace_na(`Change since 2002`, 0)) %>% 
  mutate(`Change since 2007` = replace_na(`Change since 2007`, 0)) %>% 
  mutate(`Change since 2012` = replace_na(`Change since 2012`, 0)) 

rm(Area_deaths_2017_a, Area_deaths_2017_b, Area_deaths_2017_c, Area_deaths_2017_d)

# This is the change over time for deaths at all levels by sex - show change in number and change in proportion
Area_deaths_2017 %>% 
  toJSON() %>% 
  write_lines(paste0('/Users/richtyler/Documents/Repositories/GBD/Number_proportion_cause_death_2017_', gsub(" ", "_", tolower(Area_x)), '.json'))

Deaths_10 <- Area_x_cause %>% 
  filter(Year == 2017,
         Level == 2,) %>%
  group_by(Sex) %>% 
  mutate(Rank = rank(-Deaths)) %>% 
  filter(Rank <= 10) %>% 
  rename(`Cause of death` = Cause) %>%
  select(Sex, Rank, `Cause of death`, Deaths) %>% 
  arrange(Sex,Rank)

YLL_10 <- Area_x_cause %>% 
  filter(Year == 2017,
         Level == 2,) %>%
  group_by(Sex) %>% 
  mutate(Rank = rank(-`YLLs (Years of Life Lost)`)) %>% 
  filter(Rank <= 10) %>% 
  rename(`Cause of years of life lost` = Cause) %>%
  select(Sex, Rank, `Cause of years of life lost`, `YLLs (Years of Life Lost)`) %>% 
  arrange(Sex,Rank)

YLD_10 <- Area_x_cause %>% 
  filter(Year == 2017,
         Level == 2,) %>%
  group_by(Sex) %>% 
  mutate(Rank = rank(-`YLDs (Years Lived with Disability)`)) %>% 
  filter(Rank <= 10) %>% 
  rename(`Cause of years lived with disability` = Cause) %>%
  select(Sex, Rank, `Cause of years lived with disability`, `YLDs (Years Lived with Disability)`) %>% 
  arrange(Sex, Rank)

DALY_10 <- Area_x_cause %>% 
  filter(Year == 2017,
         Level == 2,) %>%
  group_by(Sex) %>% 
  mutate(Rank = rank(-`DALYs (Disability-Adjusted Life Years)`)) %>% 
  filter(Rank <= 10) %>% 
  rename(`Cause of disability adjusted life years lost` = Cause) %>%
  select(Sex, Rank, `Cause of disability adjusted life years lost`, `DALYs (Disability-Adjusted Life Years)`) %>% 
  arrange(Sex, Rank)

WSx_top_10 <- Deaths_10 %>% 
  left_join(YLL_10, by = c('Sex', 'Rank')) %>% 
  left_join(YLD_10, by = c('Sex', 'Rank')) %>% 
  left_join(DALY_10, by = c('Sex', 'Rank')) 

rm(DALY_10, Deaths_10, YLD_10, YLL_10)

WSx_top_10 %>% 
  toJSON() %>% 
  write_lines(paste0('/Users/richtyler/Documents/Repositories/GBD/Top_10_YLL_YLD_DALY_2017_', gsub(" ", "_", tolower(Area_x)), '.json'))
  
# Explore the top ten causes of death (numbers), YLL (numbers), YLDs (numbers) and DALYs.
# Explore all level 2 causes for West Sussex ####
level_1_cause_df_a <- Area_x_cause %>% 
  filter(Level == 1,
         Year == 2017) %>%
  group_by(Sex, metric) %>% 
  mutate(Death_rank =  rank(-Deaths, ties.method = "first")) %>% # The - indicates descending order
  mutate(YLL_rank =  rank(-`YLLs (Years of Life Lost)`, ties.method = "first")) %>% 
  mutate(YLD_rank =  rank(-`YLDs (Years Lived with Disability)`, ties.method = "first")) %>% 
  mutate(DALY_rank =  rank(-`DALYs (Disability-Adjusted Life Years)`, ties.method = "first")) %>% 
  select(-c(Incidence, Prevalence)) %>% 
  ungroup()

level_1_cause_df_b <- level_1_cause_df_a %>% 
  filter(metric == 'Proportion of total burden caused by this condition') %>% 
  rename(DALY_proportion = `DALYs (Disability-Adjusted Life Years)`,
         Deaths_proportion = Deaths,
         YLD_proportion = `YLDs (Years Lived with Disability)`,
         YLL_proportion = `YLLs (Years of Life Lost)`) %>% 
  select(Sex, Cause, Deaths_proportion, YLL_proportion, YLD_proportion, DALY_proportion)

level_1_cause_df <- level_1_cause_df_a %>% 
  filter(metric == 'Number') %>% 
  rename(DALY_number = `DALYs (Disability-Adjusted Life Years)`,
         Deaths_number = Deaths,
         YLD_number = `YLDs (Years Lived with Disability)`,
         YLL_number = `YLLs (Years of Life Lost)`) %>% 
  left_join(level_1_cause_df_b, by = c('Sex', 'Cause')) %>% 
  select(Sex, Cause, Year, `Cause group`, Deaths_number, Deaths_proportion, Death_rank, YLL_number, YLL_proportion, YLL_rank, YLD_number, YLD_proportion, YLD_rank, DALY_number, DALY_proportion, DALY_rank)

rm(level_1_cause_df_a, level_1_cause_df_b)

level_1_cause_df %>% 
  toJSON() %>% 
  write_lines(paste0('/Users/richtyler/Documents/Repositories/GBD/Number_cause_level_1_2017_', gsub(" ", "_", tolower(Area_x)), '.json'))

level_1_summary <- level_1_cause_df %>% 
  filter(Sex == 'Both') %>% 
  mutate(deaths_label = paste0('This group of causes was estimated to be responsible for ', format(round(Deaths_number,0), big.mark = ',', trim = TRUE), ' deaths which represents ', round(Deaths_proportion * 100,1), '% of all deaths in ', Year, '.')) %>%
  mutate(yll_label = paste0('This group of causes was estimated to be responsible for ', format(round(YLL_number,0), big.mark = ',', trim = TRUE), ' years of life lost which represents ', round(YLL_proportion * 100,1), '% of all YLLs in ', Year, '.')) %>% 
  mutate(yld_label = paste0('This group of causes was estimated to be responsible for ', format(round(YLD_number,0), big.mark = ',', trim = TRUE), ' years of life lived with disability which represents ', round(YLD_proportion * 100,1), '% of all YLDs in ', Year, '.')) %>% 
  mutate(daly_label = paste0('This group of causes was estimated to be responsible for ', format(round(DALY_number,0), big.mark = ',', trim = TRUE), ' disability adjusted life years lost which represents ', round(DALY_proportion * 100,1), '% of all DALYs in ', Year, '.')) %>% 
  select(Cause, deaths_label, yll_label, yld_label, daly_label) %>% 
  mutate(Cause = factor(Cause, levels = c('Communicable, maternal, neonatal, and nutritional diseases', 'Non-communicable diseases', 'Injuries'))) %>% 
  arrange(Cause)

level_1_summary %>% 
  toJSON() %>% 
  write_lines(paste0('/Users/richtyler/Documents/Repositories/GBD/level_1_2017_', gsub(" ", "_", tolower(Area_x)), '_summary.json'))

# Explore all level 2 causes for West Sussex ####
level_2_cause_df_a <- Area_x_cause %>% 
  filter(Level == 2,
         Year == 2017) %>%
  group_by(Sex, metric) %>% 
  mutate(Death_rank =  rank(-Deaths, ties.method = "first")) %>% # The - indicates descending order
  mutate(YLL_rank =  rank(-`YLLs (Years of Life Lost)`, ties.method = "first")) %>% 
  mutate(YLD_rank =  rank(-`YLDs (Years Lived with Disability)`, ties.method = "first")) %>% 
  mutate(DALY_rank =  rank(-`DALYs (Disability-Adjusted Life Years)`, ties.method = "first")) %>% 
  select(-c(Incidence, Prevalence)) %>% 
  ungroup()

level_2_cause_df_b <- level_2_cause_df_a %>% 
  filter(metric == 'Proportion of total burden caused by this condition') %>% 
  rename(DALY_proportion = `DALYs (Disability-Adjusted Life Years)`,
         Deaths_proportion = Deaths,
         YLD_proportion = `YLDs (Years Lived with Disability)`,
         YLL_proportion = `YLLs (Years of Life Lost)`) %>% 
  select(Sex, Cause, Deaths_proportion, YLL_proportion, YLD_proportion, DALY_proportion)

level_2_cause_df <- level_2_cause_df_a %>% 
  filter(metric == 'Number') %>% 
  rename(DALY_number = `DALYs (Disability-Adjusted Life Years)`,
         Deaths_number = Deaths,
         YLD_number = `YLDs (Years Lived with Disability)`,
         YLL_number = `YLLs (Years of Life Lost)`) %>% 
  left_join(level_2_cause_df_b, by = c('Sex', 'Cause')) %>% 
  select(Sex, Cause, Year, `Cause group`, Deaths_number, Deaths_proportion, Death_rank, YLL_number, YLL_proportion, YLL_rank, YLD_number, YLD_proportion, YLD_rank, DALY_number, DALY_proportion, DALY_rank)

rm(level_2_cause_df_a, level_2_cause_df_b)

level_2_cause_df %>% 
  toJSON() %>% 
  write_lines(paste0('/Users/richtyler/Documents/Repositories/GBD/Number_cause_level_2_2017_', gsub(" ", "_", tolower(Area_x)), '.json'))

cause_description <- data.frame(Cause = c("HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence")) %>% 
  bind_cols(Description = c("This disease group includes HIV/AIDS and sexually transmitted infections such as Syphilis, Chlamydia and Gonorrhea.", "This disease group includes lower and upper respiratory infections, Otitis media (inflamatory diseases of the middle ear) and Tuberculosis.", "Enteric infections include Diarrheal diseases, Typhoid, Salmonella and other intestinal infectious diseases.", "This disease group includes Malaria, Leishmaniasis, Yellow fever, Rabies, Food-borne trematodiases, Leprosy, Ebola, Zika virus and other neglected tropical diseases.", "Other infectious disease include Meningitis, Encephalitis, Diphtheria, Whooping Cough, Tetanus, Measles, Acute hepatitis and other unspecified infectious diseases.", "Maternal and neonatal disorders include maternal hemorrhage, sepsis, hypertensive disorders, obstructed labor, abortion or miscariage, as well as Ectopic pregnancies, preterm birth, encephalopathy due to asphyxia and trauma during birth.", "Nutritional deficiencies include protein-energy malnutrition, as well as deficiencies in Iodine, Vitamin A, and dietary iron.", "Neoplasms (cancer) include all sites as well as malignant and non-melanoma cancers.", "Cardiovascular diseases include Ischemic heart disease, Stroke, Hypertensive heart disease, Atrial fibrillation, Aortic aneurysm, Peripheral Artery Disease and other circulatory diseases.", "Chronic respiratory diseases include Chronic Obstructive Pulmonary Disease (COPD), Pneumoconiosis (e.g. Silicosis and Asbestosis), Asthma, and Interstitial lung disease and pulmonary sarcoidosis.", "Digestive diseases include Cirrhosis and other chronic liver diseases, Appendicitis, Inflammatory bowel disease, Vascular intestinal disorders, Gallblader and biliary diseases, and Pancreatitis.", "Neurological disorders include Alzheimer's and other dementias, Parkinson's disease, Epilepsy, Multiple sclerosis, Motor neuron disease, Migraine and tension headaches and other neurological disorders.", "Mental disorders include Schizophrenia, Depressive, Bipolar, Anxiety, and Eating disorders as well as Autism Spectrum, Attention-deficit/hyperactivity, and Conduct disorders.", "Substance use disorders include Alcohol, Opioid, Cocaine, Amphetamine, Cannabis and other drug use disorders", "Diabetes and kidney diseases include both Type 1 and Type 2 Diabetes mellitus, Chronic Kidney Disease and Acute Glomerulonephritis.", "Skin and subcutaneous disease include Dermatitis, Psoriasis, Bacterial, Fungal and Viral skin diseases, Alopecia areata, and Acne.", "Sense organ disease include blindness and visual impairment caused by Glaucoma, Cataract, and Macular degeneration as well as hearing loss and other sense organ diseases.", "Musculoskeletal disorders include Rheumatoid arthritis, Osteoarthritis, Low back pain, Neck pain and Gout.", "Other non-communicable diseases include congenital birth defects, urinary diseases, male infertility and other gynecological diseases, as well as Endocrine, metabolic, blood, and immune disorders, Oral disorders and Sudden Infant Death Syndrome.", "Transport injuries include injuries on the road involving pedestrains, cyclists, motorcyclist and motor vehicle road injuries.", "Unintentional injuries include falls, drowning, poisonings, exposure to mechanical forces, fire, heat and hot substances as well as adverse effects of medical treatment, animal contact, foreign bodies or forces of nature.", "Self-harm and interpersonal violence includes conflict and terrorism, physical and sexual violence as well as self-harm and executions."))

level_2_summary <- level_2_cause_df %>% 
  filter(Sex == 'Both') %>% 
  mutate(deaths_label = paste0('This group of causes was estimated to be responsible for ', format(round(Deaths_number,0), big.mark = ',', trim = TRUE), ' deaths which represents ', round(Deaths_proportion * 100,1), '% of all deaths in ', Year, '. ', Cause, ' had the ', ifelse(Death_rank == 1, ' highest ', ifelse(Death_rank == 22, ' lowest ', paste0(ordinal_format()(Death_rank), ' highest '))), 'number of deaths out of the 22 cause groups.')) %>% 
  mutate(yll_label = paste0('This group of causes was estimated to be responsible for ', format(round(YLL_number,0), big.mark = ',', trim = TRUE), ' years of life lost which represents ', round(YLL_proportion * 100,1), '% of all YLLs in ', Year, '. ', Cause, ' had the ', ifelse(YLL_rank == 1, ' highest ', ifelse(YLL_rank == 22, ' lowest ', paste0(ordinal_format()(YLL_rank), ' highest '))), 'number of YLLs out of the 22 cause groups.')) %>% 
  mutate(yld_label = paste0('This group of causes was estimated to be responsible for ', format(round(YLD_number,0), big.mark = ',', trim = TRUE), ' years of life lived with disability which represents ', round(YLD_proportion * 100,1), '% of all YLDs in ', Year, '. ', Cause, ' had the ', ifelse(YLD_rank == 1, ' highest ', ifelse(YLD_rank == 22, ' lowest ', paste0(ordinal_format()(YLD_rank), ' highest '))), 'number of YLDs out of the 22 cause groups.')) %>% 
  mutate(daly_label = paste0('This group of causes was estimated to be responsible for ', format(round(DALY_number,0), big.mark = ',', trim = TRUE), ' disability adjusted life years lost which represents ', round(DALY_proportion * 100,1), '% of all DALYs in ', Year, '. ', Cause, ' had the ', ifelse(DALY_rank == 1, ' highest ', ifelse(DALY_rank == 22, ' lowest ', paste0(ordinal_format()(DALY_rank), ' highest '))), 'number of DALYs out of the 22 cause groups.')) %>% 
  mutate(Parent = paste0('This group is part of the ', `Cause group`, ' main group of causes.')) %>% 
  left_join(cause_description, by = 'Cause') %>% 
  select(Cause, Parent, Description, deaths_label, yll_label, yld_label, daly_label) %>% 
  mutate(Cause = factor(Cause, levels = c("HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"))) %>% 
  arrange(Cause)

level_2_summary %>% 
  toJSON() %>% 
  write_lines(paste0('/Users/richtyler/Documents/Repositories/GBD/level_2_2017_', gsub(" ", "_", tolower(Area_x)), '_summary.json'))
  

# Data for cause size bubbles 

# area, sex, year, measure, value - switch between deaths, yll, yld and daly - number
Area_x_cause %>% 
  filter(Level == 3,
         metric == 'Number',
         Year == max(Year)) %>% 
  select(-c(Prevalence, Incidence, metric, Level)) %>% 
  gather(`DALYs (Disability-Adjusted Life Years)`:`YLLs (Years of Life Lost)`, key = 'Measure', val = "Value") %>% 
  toJSON() %>% 
  write_lines(paste0('/Users/richtyler/Documents/Repositories/GBD/Number_bubbles_df_level_3_2017_', gsub(" ", "_", tolower(Area_x)), '.json'))

rm(Area_deaths_2017, Area_x_cause, Area_x_cause_number, Area_x_cause_perc, Cause_number, Cause_perc, level_2_cause_df, WSx_top_10, All_ages_GBD_cause_data)

# Over the lifecourse ####

lifecourse_wsx_df <- unique(list.files("~/Documents/GBD_data_download")[grepl("b328ae1f", list.files("~/Documents/GBD_data_download/")) == TRUE]) %>% 
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
  filter(Year == max(Year))

# http://www.healthdata.org/sites/default/files/files/infographics/Infographic_GBD2017-YLDs-Highlights_2018_Page_1.png

lifecourse_numbers <- lifecourse_wsx_df %>% 
  filter(Metric == 'Number')

ages_summary <- lifecourse_numbers %>% 
  filter(Level == 0) 



lifecourse_prop <- lifecourse_wsx_df %>% 
  filter(Metric == "Proportion of total burden caused by this condition")

lifecourse_age <- lifecourse_numbers %>% 
  filter(Level == 2,
         Sex == 'Both') %>% 
  select(Age, Cause, Measure, Estimate) %>% 
  mutate(Cause = factor(Cause, levels = c("HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"))) %>%
  arrange(Cause) %>% 
  spread(Cause, Estimate) %>% 
  arrange(Measure, Age) %>% 
  mutate(`Neglected tropical diseases and malaria` = replace_na(`Neglected tropical diseases and malaria`, 0)) %>% 
  mutate(`Chronic respiratory diseases` = replace_na(`Chronic respiratory diseases`, 0)) %>% 
  mutate(`Digestive diseases` = replace_na(`Digestive diseases`, 0)) %>% 
  mutate(`Cardiovascular diseases` = replace_na(`Cardiovascular diseases`, 0)) %>% 
  mutate(`Nutritional deficiencies` = replace_na(`Nutritional deficiencies`, 0)) %>% 
  mutate(`Other non-communicable diseases` = replace_na(`Other non-communicable diseases`, 0)) %>% 
  mutate(`Skin and subcutaneous diseases` = replace_na(`Skin and subcutaneous diseases`, 0)) %>% 
  mutate(`Neurological disorders` = replace_na(`Neurological disorders`, 0)) %>% 
  mutate(`Transport injuries` = replace_na(`Transport injuries`, 0)) %>% 
  mutate(`Unintentional injuries` = replace_na(`Unintentional injuries`, 0)) %>% 
  mutate(`Mental disorders` = replace_na(`Mental disorders`, 0)) %>% 
  mutate(`Sense organ diseases` = replace_na(`Sense organ diseases`, 0)) %>% 
  mutate(`Musculoskeletal disorders` = replace_na(`Musculoskeletal disorders`, 0)) %>% 
  mutate(`Neoplasms` = replace_na(`Neoplasms`, 0)) %>% 
  mutate(`Self-harm and interpersonal violence` = replace_na(`Self-harm and interpersonal violence`, 0)) %>% 
  mutate(`HIV/AIDS and sexually transmitted infections` = replace_na(`HIV/AIDS and sexually transmitted infections`, 0)) %>% 
  mutate(`Respiratory infections and tuberculosis` = replace_na(`Respiratory infections and tuberculosis`, 0)) %>% 
  mutate(`Enteric infections` = replace_na(`Enteric infections`, 0)) %>% 
  mutate(`Other infectious diseases` = replace_na(`Other infectious diseases`, 0)) %>% 
  mutate(`Maternal and neonatal disorders` = replace_na(`Maternal and neonatal disorders`, 0)) %>% 
  mutate(`Substance use disorders` = replace_na(`Substance use disorders`, 0)) %>% 
  mutate(`Diabetes and kidney diseases` = replace_na(`Diabetes and kidney diseases`, 0)) 

lifecourse_age %>% 
  toJSON() %>% 
  write_lines(paste0('/Users/richtyler/Documents/Repositories/GBD/Numbers_lifecourse_persons_level_2_2017_', gsub(" ", "_", tolower(Area_x)), '.json'))

lifecourse_age %>% 
  mutate(Total_in_age = rowSums(.[3:ncol(.)])) %>% 
  select(Age, Measure, Total_in_age) %>% 
  group_by(Measure) %>% 
  filter(Total_in_age == max(Total_in_age)) %>% 
  select(-Age) %>% 
  mutate(rounded_Total_in_age = round_any(Total_in_age, 500, ceiling)) %>% 
  toJSON() %>% 
  write_lines(paste0('/Users/richtyler/Documents/Repositories/GBD/Numbers_lifecourse_persons_level_2_2017_', gsub(" ", "_", tolower(Area_x)), '_max_value.json'))

lifecourse_condition <- lifecourse_numbers %>% 
  filter(Level == 2,
         Sex == 'Both') %>% 
  select(Age, Cause, Measure, Estimate) %>% 
  arrange(Age) %>% 
  spread(Age, Estimate) %>% 
  arrange(Measure, Cause) %>% 
  mutate(`Early Neonatal` = replace_na(`Early Neonatal`, 0)) %>% 
  mutate(`Late Neonatal` = replace_na(`Late Neonatal`, 0)) %>% 
  mutate(`Post Neonatal` = replace_na(`Post Neonatal`, 0)) %>% 
  mutate(`1 to 4` = replace_na(`1 to 4`, 0)) %>%  
  mutate(`5 to 9` = replace_na(`5 to 9`, 0)) %>%  
  mutate(`10 to 14` = replace_na(`10 to 14`, 0)) %>%  
  mutate(`15 to 19` = replace_na(`15 to 19`, 0)) %>%  
  mutate(`20 to 24` = replace_na(`20 to 24`, 0)) %>%  
  mutate(`25 to 29` = replace_na(`25 to 29`, 0)) %>%  
  mutate(`30 to 34` = replace_na(`30 to 34`, 0)) %>%  
  mutate(`35 to 39` = replace_na(`35 to 39`, 0)) %>%  
  mutate(`40 to 44` = replace_na(`40 to 44`, 0)) %>%  
  mutate(`45 to 49` = replace_na(`45 to 49`, 0)) %>%  
  mutate(`50 to 54` = replace_na(`50 to 54`, 0)) %>%  
  mutate(`55 to 59` = replace_na(`55 to 59`, 0)) %>%  
  mutate(`60 to 64` = replace_na(`60 to 64`, 0)) %>%  
  mutate(`65 to 69` = replace_na(`65 to 69`, 0)) %>%  
  mutate(`70 to 74` = replace_na(`70 to 74`, 0)) %>%  
  mutate(`75 to 79` = replace_na(`75 to 79`, 0)) %>%  
  mutate(`80 to 84` = replace_na(`80 to 84`, 0)) %>%  
  mutate(`85 to 89` = replace_na(`85 to 89`, 0)) %>%  
  mutate(`90 to 94` = replace_na(`90 to 94`, 0)) %>%  
  mutate(`95 plus` = replace_na(`95 plus`, 0)) %>% 
  mutate(Cause = factor(Cause, levels = c("HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"))) %>%
  arrange(Cause)
  
lifecourse_condition %>% 
  toJSON() %>% 
  write_lines(paste0('/Users/richtyler/Documents/Repositories/GBD/Numbers_lifecourse_persons_by_condition_level_2_2017_', gsub(" ", "_", tolower(Area_x)), '.json'))

lifecourse_condition %>% 
  mutate(Total_in_condition = rowSums(.[3:ncol(.)])) %>% 
  select(Cause, Measure, Total_in_condition) %>% 
  group_by(Measure) %>% 
  filter(Total_in_condition == max(Total_in_condition)) %>% 
  select(-Cause) %>% 
  mutate(rounded_Total_in_condition = round_any(Total_in_condition, 500, ceiling))

lifecourse_condition_prop <- lifecourse_condition %>%
  mutate(Total_in_condition = rowSums(.[3:ncol(.)])) %>% 
  mutate(`Early Neonatal` = `Early Neonatal` / Total_in_condition) %>% 
  mutate(`Late Neonatal` = `Late Neonatal` / Total_in_condition) %>% 
  mutate(`Post Neonatal` = `Post Neonatal` / Total_in_condition) %>% 
  mutate(`1 to 4` = `1 to 4` / Total_in_condition) %>%  
  mutate(`5 to 9` = `5 to 9` / Total_in_condition) %>%  
  mutate(`10 to 14` = `10 to 14` / Total_in_condition) %>%  
  mutate(`15 to 19` = `15 to 19` / Total_in_condition) %>%  
  mutate(`20 to 24` = `20 to 24` / Total_in_condition) %>%  
  mutate(`25 to 29` = `25 to 29` / Total_in_condition) %>%  
  mutate(`30 to 34` = `30 to 34` / Total_in_condition) %>%  
  mutate(`35 to 39` = `35 to 39` / Total_in_condition) %>%  
  mutate(`40 to 44` = `40 to 44` / Total_in_condition) %>%  
  mutate(`45 to 49` = `45 to 49` / Total_in_condition) %>%  
  mutate(`50 to 54` = `50 to 54` / Total_in_condition) %>%  
  mutate(`55 to 59` = `55 to 59` / Total_in_condition) %>%  
  mutate(`60 to 64` = `60 to 64` / Total_in_condition) %>%  
  mutate(`65 to 69` = `65 to 69` / Total_in_condition) %>%  
  mutate(`70 to 74` = `70 to 74` / Total_in_condition) %>%  
  mutate(`75 to 79` = `75 to 79` / Total_in_condition) %>%  
  mutate(`80 to 84` = `80 to 84` / Total_in_condition) %>%  
  mutate(`85 to 89` = `85 to 89` / Total_in_condition) %>%  
  mutate(`90 to 94` = `90 to 94` / Total_in_condition) %>%  
  mutate(`95 plus` = `95 plus` / Total_in_condition) %>% 
  select(-Total_in_condition) %>% 
  mutate(Cause = factor(Cause, levels = c("HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"))) %>%
  arrange(Cause)

lifecourse_condition_prop %>% 
  toJSON() %>% 
  write_lines(paste0('/Users/richtyler/Documents/Repositories/GBD/Proportion_lifecourse_persons_by_condition_level_2_2017_', gsub(" ", "_", tolower(Area_x)), '.json'))

# Age standardising ####

# To compare over areas or time we could use age_standardised data

# top 10 slope chart

# line charts 

# Rate is per 100,000 population
Age_standardised_NN_ts_data <- unique(list.files("~/Documents/GBD_data_download/")[grepl("85cc91d0", list.files("~/Documents/GBD_data_download/")) == TRUE]) %>% 
  map_df(~read_csv(paste0("~/Documents/GBD_data_download/",.), col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_number()))) %>%
  filter(age == 'Age-standardized') %>%
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
  select(Area, Sex, Year, Cause, Cause_outline, Cause_id, Level, Estimate, Lower_estimate, Upper_estimate, `Cause group`, Parent_id, measure, metric)

# There are no raw counts in the standardised set - only rates

# we will be comparing our area against the region and england, and our nearest neighbours. 
# Nearest neighbours
LAD <- read_csv(url("https://opendata.arcgis.com/datasets/a267b55f601a4319a9955b0197e3cb81_0.csv"), col_types = cols(LAD17CD = col_character(),LAD17NM = col_character(),  LAD17NMW = col_character(),  FID = col_integer()))

Counties <- read_csv(url("https://opendata.arcgis.com/datasets/7e6bfb3858454ba79f5ab3c7b9162ee7_0.csv"), col_types = cols(CTY17CD = col_character(),  CTY17NM = col_character(),  Column2 = col_character(),  Column3 = col_character(),  FID = col_integer()))

lookup <- read_csv(url("https://opendata.arcgis.com/datasets/41828627a5ae4f65961b0e741258d210_0.csv"), col_types = cols(LTLA17CD = col_character(),  LTLA17NM = col_character(),  UTLA17CD = col_character(),  UTLA17NM = col_character(),  FID = col_integer()))

# This is a lower tier LA to upper tier LA lookup
UA <- subset(lookup, LTLA17NM == UTLA17NM)

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

Areas <- rbind(LAD, Counties, Region, England)
rm(LAD, Counties, Region, England, UA)

WSx_NN <- data.frame(Area_Code = nearest_neighbours(AreaCode = "E10000032", AreaTypeID = "102", measure = "CIPFA")) %>%   
  mutate(Neighbour_rank = row_number()) %>% 
  left_join(Areas, by = "Area_Code") %>% 
  select(Area_Name, Neighbour_rank) 

Area_rank = data.frame(Area_Name = c('West Sussex','South East England',"England"), Neighbour_rank = c(0,1,2)) %>% 
  bind_rows(WSx_NN) %>% 
  mutate(Neighbour_rank = row_number()) %>% 
  rename(Area = Area_Name)

Age_standardised_NN_ts_data %>% 
  filter(Level == 0) %>% 
  filter(Sex == 'Both') %>% 
  left_join(Area_rank, by = 'Area') %>% 
  toJSON() %>% 
  write_lines(paste0('/Users/richtyler/Documents/Repositories/GBD/Rate_totals_1990_2017_all_areas.json'))

Age_standardised_NN_ts_data %>% 
  filter(Level == 2) %>% 
  filter(Sex == 'Both') %>%
  filter(Area %in% c(Area_x, 'England', 'South East England')) %>%
  select(Area, Sex, Year, Cause,Estimate, Lower_estimate, Upper_estimate, measure) %>%
  toJSON() %>% 
  write_lines(paste0('/Users/richtyler/Documents/Repositories/GBD/Rate_level_2_1990_2017_', gsub(" ", "_", tolower(Area_x)), '_region_england.json'))

# My thoughts are to do the analysis here, include columns for % change compared to 5 years (2012), 10 years (2007), and compared to 20 years (1997).

Age_standardised_change_data <- unique(list.files("~/Documents/GBD_data_download/")[grepl("7d0121c1", list.files("~/Documents/GBD_data_download/")) == TRUE]) %>% 
  map_df(~read_csv(paste0("~/Documents/GBD_data_download/",.), col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_number()))) %>%
  filter(age == 'Age-standardized') %>%
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
  select(Area, Sex, Year, Cause, Cause_outline, Cause_id, Level, Estimate, Lower_estimate, Upper_estimate, `Cause group`, Parent_id, measure, metric)

# Change over time for deaths at all levels by sex ####
Change_over_time_latest <- Age_standardised_change_data %>% 
  filter(Year == 2017) %>% 
  rename(Estimate_2017 = Estimate) %>% 
  mutate(Label_2017 = paste0(format(round(Estimate_2017,0), big.mark = ',', trim = TRUE), ' (', format(round(Lower_estimate,0), big.mark = ',', trim = TRUE), '-', format(round(Upper_estimate,0), big.mark = ',', trim = TRUE), ')')) %>% 
  group_by(Area, Sex, Level, measure) %>% 
  mutate(`Rank_in_2017` = rank(-Estimate_2017))

Change_over_time_a <- Age_standardised_change_data %>%
  filter(Year %in% c(1997, 2002, 2007, 2012)) %>% 
  select(Area, Sex, Year, Cause, Level, measure, Estimate) %>% 
  group_by(Area, Sex, Year, Level, measure) %>% 
  mutate(Rank = rank(-Estimate)) %>% 
  left_join(Change_over_time_latest[c('Area', 'Sex', 'Cause', 'measure','Estimate_2017', 'Label_2017')], by = c('Area','Sex', 'Cause', 'measure')) %>% 
  ungroup() %>% 
  mutate(Change_to_2017 = (Estimate_2017 - Estimate) / Estimate *100) %>%
  mutate(Change_label = paste0('Change_since_', Year)) %>% 
  mutate(Rank_label = paste0('Rank_in_', Year)) %>% 
  mutate(Estimate_label = paste0('Estimate_in_', Year))

Change_over_time_b <- Change_over_time_a %>% 
  select(Area, Sex, Cause, measure, Change_to_2017, Change_label) %>% 
  filter(Change_label != 'Change_since_2017') %>% 
  spread(Change_label, Change_to_2017)

Change_over_time_c <- Change_over_time_a %>% 
  select(Area, Sex, Cause, measure, Rank, Rank_label) %>% 
  spread(Rank_label, Rank)

Change_over_time_d <- Change_over_time_a %>% 
  select(Area, Sex, Cause, measure, Estimate, Estimate_label) %>% 
  spread(Estimate_label, Estimate)

Change_over_time <- Change_over_time_latest %>% 
  left_join(Change_over_time_b, by = c('Area','Sex', 'Cause', 'measure')) %>% 
  left_join(Change_over_time_c, by = c('Area','Sex', 'Cause', 'measure')) %>% 
  left_join(Change_over_time_d, by = c('Area','Sex', 'Cause', 'measure')) %>% 
  select(-c(Year, Cause_id, Cause_outline, Parent_id, metric)) %>% 
  mutate(Change_since_1997 = replace_na(Change_since_1997, 0)) %>% 
  mutate(Change_since_2002 = replace_na(Change_since_2002, 0)) %>% 
  mutate(Change_since_2007 = replace_na(Change_since_2007, 0)) %>% 
  mutate(Change_since_2012 = replace_na(Change_since_2012, 0)) %>% 
  mutate(Rank_in_1997 = replace_na(Rank_in_1997, 0)) %>% 
  mutate(Rank_in_2002 = replace_na(Rank_in_2002, 0)) %>% 
  mutate(Rank_in_2007 = replace_na(Rank_in_2007, 0)) %>%  
  mutate(Rank_in_2012 = replace_na(Rank_in_2012, 0)) %>% 
  mutate(Estimate_in_1997 = replace_na(Estimate_in_1997, 0)) %>% 
  mutate(Estimate_in_2002 = replace_na(Estimate_in_2002, 0)) %>% 
  mutate(Estimate_in_2007 = replace_na(Estimate_in_2007, 0)) %>% 
  mutate(Estimate_in_2012 = replace_na(Estimate_in_2012, 0)) 

rm(Change_over_time_a, Change_over_time_b, Change_over_time_c, Change_over_time_d)

Change_over_time %>% 
  filter(Cause == 'Sense organ diseases') %>% 
  View()

Change_over_time %>% 
  filter(Area == 'West Sussex') %>%
  filter(Level == 2) %>% 
  mutate(Cause = factor(Cause, levels = c("HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"))) %>%
  arrange(Area, Sex, measure, Cause) %>% 
  View()


# This is the change over time for deaths at all levels by sex - show change in number and change in proportion
Change_over_time %>% 
  filter(Rank_in_2017 <= 10 | Rank_in_2012 <= 10 | Rank_in_2007 <= 10 | Rank_in_2002 <= 10 | Rank_in_1997 <= 10) %>% 
  toJSON() %>% 
  write_lines(paste0('/Users/richtyler/Documents/Repositories/GBD/Rate_change_over_time_levels_0_1_2_for_slope.json'))

Change_over_time %>% 
  filter(Area == 'West Sussex') %>%
  filter(Level == 2) %>% 
  mutate(Cause = factor(Cause, levels = c("HIV/AIDS and sexually transmitted infections", "Respiratory infections and tuberculosis", "Enteric infections", "Neglected tropical diseases and malaria", "Other infectious diseases", "Maternal and neonatal disorders", "Nutritional deficiencies", "Neoplasms", "Cardiovascular diseases", "Chronic respiratory diseases", "Digestive diseases", "Neurological disorders", "Mental disorders", "Substance use disorders", "Diabetes and kidney diseases", "Skin and subcutaneous diseases", "Sense organ diseases", "Musculoskeletal disorders", "Other non-communicable diseases", "Transport injuries", "Unintentional injuries", "Self-harm and interpersonal violence"))) %>%
  arrange(Area, Sex, measure, Cause) %>% 
  toJSON() %>% 
  write_lines(paste0('/Users/richtyler/Documents/Repositories/GBD/Rate_change_over_time_level_2_', gsub(" ", "_", tolower(Area_x)), '.json'))



read_csv('/Users/richtyler/Documents/Repositories/Testies/data.csv') %>% 
  toJSON() %>% 
  write_lines('/Users/richtyler/Documents/Repositories/Testies/data.json')


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

# Comparing to other areas ####

# Area codes #### 

if(!(file.exists("~/Documents/Repositories/GBD/Area_lookup_table.csv") & file.exists("~/Documents/Repositories/GBD/Area_types_table.csv"))){
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
  
  write.csv(lookup, "~/Documents/Repositories/GBD/Area_lookup_table.csv", row.names = FALSE)
  write.csv(Areas, "~/Documents/Repositories/GBD/Area_types_table.csv", row.names = FALSE)
}

Lookup <- read_csv("~/Documents/Repositories/GBD/Area_lookup_table.csv", col_types = cols(LTLA17CD = col_character(),LTLA17NM = col_character(), UTLA17CD = col_character(),  UTLA17NM = col_character(), FID = col_character()))
Areas <- read_csv("~/Documents/Repositories/GBD/Area_types_table.csv", col_types = cols(Area_Code = col_character(), Area_Name = col_character(), Area_Type = col_character()))

# WSx_NN <- data.frame(Area_Code = nearest_neighbours(AreaCode = "E10000032", AreaTypeID = "102", measure = "CIPFA")) %>%   mutate(Neighbour_rank = row_number()) %>% 
#   left_join(Areas, by = "Area_Code") %>% 
#   bind_rows(data.frame(Area_Code = "E10000032", Neighbour_rank = 0, Area_Name = "West Sussex", Area_Type = "County"))


# Risks ####

GBD_2017_rei_hierarchy <- read_excel("~/Documents/GBD_data_download/IHME_GBD_2017_REI_HIERARCHY_Y2018M11D18.xlsx", col_types = c("text", "text", "text", "text", "text", "numeric"))

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

# GBD_risk_data <- read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-1.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character())) %>% 
#   bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-2.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
#   bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-3.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
#   bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-4.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
#   bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-5.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
#   bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-6.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
#   bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-7.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
#   bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-8.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
#   bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-9.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
#   bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-10.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
#   bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-11.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
#   bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-12.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character()))) %>% 
#   bind_rows(read_csv("./GBD/IHME-GBD_2016_DATA-dfc1ea52-13.csv", col_types = cols(age = col_character(), cause = col_character(), location = col_character(), lower = col_double(), measure = col_character(), metric = col_character(), rei = col_character(), sex = col_character(), upper = col_double(), val = col_double(), year = col_character())))
# 
# GBD_risk_group <- gbd_rei_hierarchy %>% 
#   filter(level == 1, parent_id == 169)
# 
# Risk_DALY_1 <- GBD_risk_data %>% 
#   filter(location == "West Sussex",
#          year %in% c(2006, 2016),
#          measure == "DALYs (Disability-Adjusted Life Years)",
#          sex == "Female",
#          age == "Age-standardized",
#          metric == "Rate",
#          cause == "All causes") %>% 
#   select(location, sex, age, year, val, cause, rei) %>% 
#   spread(year, val)  %>% 
#   mutate(change = (Rank_2016-Rank_2006)/Rank_2006) %>% 
#   gather(Rank_2006:Rank_2016, key = year, value = val) %>% 
#   left_join(gbd_rei_hierarchy, by = c("rei" = "rei_name")) %>% 
#   filter(level == 2) %>% 
#   group_by(year) %>% 
#   arrange(desc(val)) %>% 
#   mutate(rank = row_number()) %>% 
#   select(location, sex, age, year, rank, change, cause, rei, parent_id) %>% 
#   spread(year, rank) %>% 
#   filter(Rank_2006 <= 10 | Rank_2016 <= 10) %>% 
#   left_join(GBD_risk_group[c("rei_id", "rei_name")], by = c("parent_id" = "rei_id")) %>% 
#   rename(risk_group = rei_name) %>% 
#   mutate(risk_group = factor(risk_group, levels = c("Behavioral risks","Environmental/occupational risks", "Metabolic risks")))
# 
# # Metabolic = "#F7DBBB"
# # envrionment = "#B2EBDE"
# # behaviour = "#CEB2EB"
# 
# ggplot(Risk_DALY_1) + 
#   geom_segment(aes(x = 1, xend = 2, y = Rank_2006, yend = Rank_2016), size = .7, lty = "dashed", show.legend = FALSE) +
#   geom_point(aes(x = 1, y = Rank_2006, col = risk_group), size = 7) +
#   geom_text(aes(x = 1, y = Rank_2006, label = paste0(Risk_DALY_1$Rank_2006)), col = "#ffffff", fontface = "bold") +
#   geom_point(aes(x = 2, y = Rank_2016, col = risk_group), size = 7) +
#   geom_text(aes(x = 2, y = Rank_2016, label = paste0(Risk_DALY_1$Rank_2016)), col = "#ffffff", fontface = "bold") +
#   scale_colour_manual(values = c("#CEB2EB", "#B2EBDE", "#F7DBBB"), breaks = c("Behavioral risks","Environmental/occupational risks", "Metabolic risks"), limits = c("Behavioral risks","Environmental/occupational risks", "Metabolic risks"), name = "Risk grouping") +
#   labs(title = paste0("Ten biggest risk factors for disability; ",unique(Risk_DALY_1$location), "; ", unique(Risk_DALY_1$age)),
#        subtitle = "Measure: Disability Adjusted Life Years (DALYs)",
#        x = "",
#        y = "") +
#   scale_y_reverse() +
#   scale_x_continuous(limits = c(-1,6)) +
#   geom_text(aes(label = "2006 ranking", y = 0, x = 1), size = 3.5, col = "#000000", hjust = 0.5, fontface = "bold") +
#   geom_text(aes(label = "2016 ranking", y = 0, x = 2), size = 3.5, col = "#000000", hjust = 0.5, fontface = "bold") +
#   geom_text(aes(label = "% change 2006-2016", y = 0, x = 6), size = 3.5, col = "#000000", hjust = 1, fontface = "bold") +
#   geom_text(aes(label = Risk_DALY_1$rei, y = Risk_DALY_1$Rank_2006, x = 0.8), size = 3.5, col = "#000000", hjust = 1, fontface = "bold") +
#   geom_text(aes(label = Risk_DALY_1$rei, y = Risk_DALY_1$Rank_2016, x = 2.2), size = 3.5, col = "#000000", hjust = 0, fontface = "bold") +
#   geom_text(aes(label = paste0(round(Risk_DALY_1$change*100,1), "%"), y = Risk_DALY_1$Rank_2016, x = 6), size = 3.5, col = "#000000", hjust = 1) +
#   theme(axis.text = element_blank(),
#         plot.title = element_text(colour = "#000000", face = "bold", size = 10),    
#         plot.subtitle = element_text(colour = "#000000", size = 9),
#         strip.text = element_text(colour = "#000000", size = 10, face = "bold"),
#         plot.margin = unit(c(0,2,0,0), "cm"),
#         # legend.position = c(.75,-.1), 
#         legend.position = "bottom", 
#         legend.title = element_text(colour = "#000000", size = 10, face = "bold"), 
#         legend.background = element_blank(), 
#         legend.key = element_rect(fill = "#ffffff", colour = "#ffffff"), 
#         legend.text = element_text(colour = "#000000", size = 8),
#         panel.grid.major = element_blank(), 
#         panel.grid.minor = element_blank(),
#         panel.background = element_blank(), 
#         panel.border = element_blank(),
#         strip.background = element_blank(), 
#         axis.ticks = element_blank(), 
#         axis.line = element_blank())


