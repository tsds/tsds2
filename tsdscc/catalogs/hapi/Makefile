all:
	cdaweb2
	datashop

faden:
	node hapi2tsds.js "http://jfaden.net/HapiServerDemo/hapi/" Faden > Faden.json

cdaweb2:
	node hapi2tsds.js "http://voyager.gsfc.nasa.gov/hapiproto/hapi/" CDAWeb2 > CDAWeb2.json

datashop:
	node hapi2tsds.js "http://datashop.elasticbeanstalk.com/hapi/" DataShop > DataShop.json
