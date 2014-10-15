# TODO: Create update target that gets latest data.

all:
	node mirror.js orig_int "2014-10-01/2014-10-10"
	make metadata.js PT20S
	make metadata.js PT10S
	node mirror.js one_min "2014-10-01/2014-10-10"
	make metadata.js PT1M
	find space.fmi.fi.processed/ -name "*.col2" | xargs -P 12 -i gzip --fast {}

metadata:
	make metadata.js PT20S
	make metadata.js PT10S
	make metadata.js PT1M

rsync:
	rsync -av data/space.fmi.fi weigel@mag.gmu.edu:/media/disk/Data/tsds/original-s0/
