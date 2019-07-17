
library(plyr) 
library(tidyverse)
library(readxl)
library(readr)

if(file.exists("~/GBD data downloads") == FALSE){
  dir.create("~/GBD data downloads")}

# impairment data

if(!(file.exists("~/GBD data downloads/IHME-GBD_2017_DATA-0f178e33-34.csv"))){
impairment_files = 34

for(i in 1:impairment_files){
download.file(paste0("http://s3.healthdata.org/gbd-api-2017-public/0f178e33785a9f50c01c9def1c03dfb9_files/IHME-GBD_2017_DATA-0f178e33-", i , ".zip"), paste0("~/GBD data downloads/impairment_file_",i,".zip"), mode = "wb")
  unzip(paste0("~/GBD data downloads/impairment_file_",i,".zip"), exdir = "~/GBD data downloads")
  file.remove(paste0("~/GBD data downloads/impairment_file_",i,".zip"))
}

}

# impairment_df <- unique(list.files("~/GBD data downloads")[grepl("0f178e33", list.files("~/GBD data downloads/")) == TRUE]) %>%
#  map_df(~read_csv(paste0("~/GBD data downloads/",.)))

if(!(file.exists("~/GBD data downloads/IHME-GBD_2017_DATA-e004c73d-11.csv"))){
mortality_files = 11 

for(i in 1:mortality_files){
  download.file(paste0("http://s3.healthdata.org/gbd-api-2017-public/e004c73d48d84b69fc85d6d3955a93e1_files/IHME-GBD_2017_DATA-e004c73d-", i , ".zip"), paste0("~/GBD data downloads/mortality_file_",i,".zip"), mode = "wb")
  unzip(paste0("~/GBD data downloads/mortality_file_",i,".zip"), exdir = "~/GBD data downloads")
  file.remove(paste0("~/GBD data downloads/mortality_file_",i,".zip"))
}
}

# mortality_df <- unique(list.files("~/GBD data downloads")[grepl("e004c73d", list.files("~/GBD data downloads/")) == TRUE]) %>% 
#   map_df(~read_csv(paste0("~/GBD data downloads/",.)))

if(!(file.exists("~/GBD data downloads/IHME-GBD_2017_DATA-24a46006-15.csv"))){
  mortality_wsx_files = 15
for(i in 1:mortality_wsx_files){
  download.file(paste0("http://s3.healthdata.org/gbd-api-2017-public/24a4600648092a3e00cb6f752a2b8269_files/IHME-GBD_2017_DATA-24a46006-", i , ".zip"), paste0("~/GBD data downloads/mortality_wsx_files",i,".zip"), mode = "wb")
  unzip(paste0("~/GBD data downloads/mortality_wsx_files",i,".zip"), exdir = "~/GBD data downloads")
  file.remove(paste0("~/GBD data downloads/mortality_wsx_files",i,".zip"))
}
}

# mortality_wsx_df <- unique(list.files("~/GBD data downloads")[grepl("24a46006", list.files("~/GBD data downloads/")) == TRUE]) %>% 
#   map_df(~read_csv(paste0("~/GBD data downloads/",.)))

# if(!(file.exists("~/GBD data downloads/IHME-GBD_2017_DATA-0f1da8e2-231.csv"))){
#   mortality_files_all_age = 231   
# for(i in 88:mortality_files_all_age){
#   download.file(paste0("http://s3.healthdata.org/gbd-api-2017-public/0f1da8e2f4a06cae620ed9b9feb55600_files/IHME-GBD_2017_DATA-0f1da8e2-", i , ".zip"), paste0("~/GBD data downloads/mortality_files_all_age",i,".zip"), mode = "wb")
#   unzip(paste0("~/GBD data downloads/mortality_files_all_age",i,".zip"), exdir = "~/GBD data downloads")
#   file.remove(paste0("~/GBD data downloads/mortality_files_all_age",i,".zip"))
# }
# }

# mortality_df <- unique(list.files("~/GBD data downloads")[grepl("0f1da8e2", list.files("~/GBD data downloads/")) == TRUE]) %>% 
#   map_df(~read_csv(paste0("~/GBD data downloads/",.)))

if(!(file.exists("./GBD data downloads/IHME-GBD_2017_DATA-b475904c-22.csv"))){
risk_files = 22
for(i in 1:risk_files){
  download.file(paste0("http://s3.healthdata.org/gbd-api-2017-public/b475904cadeca9cccc4b12c1a7a72197_files/IHME-GBD_2017_DATA-b475904c-", i , ".zip"), paste0("~/GBD data downloads/risk_files",i,".zip"), mode = "wb")
  unzip(paste0("./GBD data downloads/risk_files",i,".zip"), exdir = "./GBD data downloads")
  file.remove(paste0("./GBD data downloads/risk_files",i,".zip"))
}
}

# risk_df <- unique(list.files("~/GBD data downloads")[grepl("b475904c", list.files("~/GBD data downloads/")) == TRUE]) %>% 
#   map_df(~read_csv(paste0("~/GBD data downloads/",.)))


if(!(file.exists("~/GBD data downloads/IHME-GBD_2017_DATA-d07dcbe7-19.csv"))){
  risk_files = 19
  for(i in 1:risk_files){
    download.file(paste0("http://s3.healthdata.org/gbd-api-2017-public/d07dcbe7dd7b0fc33d6ccc179360edad_files/IHME-GBD_2017_DATA-d07dcbe7-", i , ".zip"), paste0("~/GBD data downloads/risk_files",i,".zip"), mode = "wb")
    unzip(paste0("~/GBD data downloads/risk_files",i,".zip"), exdir = "~/GBD data downloads")
    file.remove(paste0("~/GBD data downloads/risk_files",i,".zip"))
  }
}

# risk_wsx_df <- unique(list.files("~/GBD data downloads")[grepl("d07dcbe7", list.files("~/GBD data downloads/")) == TRUE]) %>%
#   map_df(~read_csv(paste0("~/GBD data downloads/",.)))

# Create a GBD directory ####

if(!(file.exists("~/GBD data downloads/IHME_GBD_2017_CAUSE_HIERARCHY_Y2018M11D18.xlsx"))){
  download.file("http://ghdx.healthdata.org/sites/default/files/ihme_query_tool/IHME_GBD_2017_CODEBOOK.zip", "~/GBD data downloads/Codebook.zip", mode = "wb")
  unzip("~/GBD data downloads/Codebook.zip", exdir = "~/GBD data downloads")
  file.remove("~/GBD data downloads/Codebook.zip")}
