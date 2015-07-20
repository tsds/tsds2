
# TODO: Install imagemagick locally?
# No: see /usr/local section of
# https://github.com/Homebrew/homebrew/blob/master/share/doc/homebrew/FAQ.md

pngquant:
	mkdir -p deps/pngquant
	cd deps/pngquant; tar zxvf ../pngquant.tar.gz; make
	cd deps/pngquant; cp pngquant ../bin

imagemagick:
	brew install ImageMagick

# If above fails with Cowardly refusing to `sudo brew install`
imagemagick2:
	sudo chown root:wheel `which brew`
	sudo brew install ImageMagick

