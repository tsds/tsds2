# Files are manually downloaded on month at a time.
# Station information from http://www.carisma.ca/station-information

# TODO: Automate using

# curl https://carisma.ca/component/users/?view=login
# get cookie, e.g., 1bb73d140d3d6196ec4fb85783629f1d=8rjr7fovs3gacs4bsqmb0bke00; path=/
# get two input parameters from form in response body, e.g.,
# <input type="hidden" name="return" value="aW5kZXgucGhwP29wdGlvbj1jb21fdXNlcnMmdmlldz1wcm9maWxl" />
# <input type="hidden" name="b3dd9b9b81919a3813d710c478fd9b4b" value="1" />

# curl -k --cookie "1bb73d140d3d6196ec4fb85783629f1d=8rjr7fovs3gacs4bsqmb0bke00; path=/" 
#       -d "username=&password=&return=aW5kZXgucGhwP29wdGlvbj1jb21fdXNlcnMmdmlldz1wcm9maWxl&b3dd9b9b81919a3813d710c478fd9b4b=1" "https://carisma.ca/component/users/?task=user.login"

# curl -k --cookie "1bb73d140d3d6196ec4fb85783629f1d=do8jile6ifutflg4rqrbf8epf6" -d "have_user=1&user_id=270&selected_data=1&sites_set=1&instrument_type=fgm&start_date=2010-09-01&no_days=1&sites_req=all" "https://www.carisma.ca/index.php/index.php/carisma-data-repository"

# Repeat every 30 seconds until file exists on server:
# curl -k -H "Accept-Encoding: gzip,deflate,sdch" "https://www.carisma.ca/downloads/2010-09-01_to_2010-09-01_fgm_all_data.zip?" > zip/2010-09-01_to_2010-09-01_fgm_all_data.zip

# cd zip; unzip 2010-09-01_to_2010-09-01_fgm_all_data.zip

# Compress extracted file
# cd FGM; unzip -l ../zip/2010-09-01_to_2010-09-01_fgm_all_data.zip | grep F01 | perl -p -e "s/.*(\s2)/$1/" | xargs -i -P12 gzip --fast {}

# TODO: Request stations one-by-one for a given day instead of mirroring.

all:
	cd data/carisma.ca/FGM; find ../zip/ -name "2010*.zip" | xargs -i -P12 unzip -n {}
#	cd data/carisma.ca/FGM; find ../zip/ -name "*.zip" | xargs -i -P12 unzip -n {}
	cd data/carisma.ca/FGM; find . -name "*.F01" | xargs -i -P 12 gzip --fast {}

metadata:
	node metadata.js

