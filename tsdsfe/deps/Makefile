
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Linux)
bin/pngquant:
	echo $(UNAME_S)
	echo "--- Attempting to build pngquant."
	echo "--- If this fails, you may need to install libpng."
	- git clone https://github.com/pornel/pngquant.git
	cd pngquant; ./configure CFLAGS="-I../libpng12/"; make;
	mkdir -p bin; mv pngquant/pngquant bin
endif

ifeq ($(UNAME_S),Darwin)
bin/pngquant:
	mkdir -p pngquant
	mkdir -p bin
	cd pngquant; tar zxvf ../pngquant.tar.gz
	cp pngquant/pngquant bin

# TODO: Install imagemagick locally?
# No: see /usr/local section of
# https://github.com/Homebrew/homebrew/blob/master/share/doc/homebrew/FAQ.md

imagemagick:
	brew install ImageMagick

# If above fails with Cowardly refusing to `sudo brew install`
imagemagick2:
	sudo chown root:wheel `which brew`
	sudo brew install ImageMagick

endif

clean:
	rm -f bin/*
	rm -rf pngquant


