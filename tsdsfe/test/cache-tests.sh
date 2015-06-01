rm -f ../cache/*json*

./curl-test.sh "http://tsds.org/get/?catalog=SSCWeb&dataset=ace&parameters=X_TOD&return=data&format=0"

###########################################################

rm -f ../cache/*json*

# No cache hit
./curl-test.sh "http://tsds.org/get/?catalog=SSCWeb&dataset=ace&parameters=X_TOD"

# Cache hit
./curl-test.sh "http://tsds.org/get/?catalog=SSCWeb&dataset=ace&parameters=X_TOD"

touch ../catalogs/SSCWeb/SSCWeb.xml

# Cache hit, but update needed
./curl-test.sh "http://tsds.org/get/?catalog=SSCWeb&dataset=ace&parameters=X_TOD"

# Cache hit, but update needed
touch ../catalogs/all.thredds

# Cache hit, but update needed
./curl-test.sh "http://tsds.org/get/?catalog=SSCWeb&dataset=ace&parameters=X_TOD"

# Cache hit, but update needed
./curl-test.sh "http://tsds.org/get/?catalog=SSCWeb&dataset=ace&parameters=X_TOD&usemetadatacache=false"

###########################################################

rm -f ../cache/*json*

# No cache hit
./curl-test.sh "http://tsds.org/get/?catalog=SSCWeb&dataset=ace&parameters=X_TOD"

# Cache hit
./curl-test.sh "http://tsds.org/get/?catalog=SSCWeb&dataset=ace&parameters=X_TOD"

# Cache hit, but update forced
./curl-test.sh "http://tsds.org/get/?catalog=SSCWeb&dataset=ace&parameters=X_TOD&usemetadatacache=false"

###########################################################

#  Remove all cached images
rm -f ../test/*image.*

#  Image is cached and returned
./curl-test.sh "http://tsds.org/get/?catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=-P3D&stop=2014-08-17&return=image&format=png&type=timeseries&style=1&useimagecache=false"

#  Should be cache hit
./curl-test.sh "http://tsds.org/get/?catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=-P3D&stop=2014-08-17&return=image&format=png&type=timeseries&style=1&useimagecache=true"

#  Should be cache hit
./curl-test.sh "http://tsds.org/get/?catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=-P3D&stop=2014-08-17&return=image&format=png&type=timeseries&style=1"

###########################################################

#  Remove all cached images
rm -f ../test/*image.*

#  Image is cached and returned
./curl-test.sh "http://tsds.org/get/?catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=-P3D&stop=2014-08-17&return=image&format=png&type=timeseries&style=1"

#  Should be cache hit
./curl-test.sh "http://tsds.org/get/?catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=-P3D&stop=2014-08-17&return=image&format=png&type=timeseries&style=1&useimagecache=true"

#  Should be cache hit
./curl-test.sh "http://tsds.org/get/?catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=-P3D&stop=2014-08-17&return=image&format=png&type=timeseries&style=1"

###########################################################

