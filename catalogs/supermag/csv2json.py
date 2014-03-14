import csv
import json

f = open( 'SuperMAG.txt', 'r' )
reader = csv.DictReader( f, fieldnames = ( "id","lat","lng","start","stop","name" ) )
out = json.dumps( [ row for row in reader ] )
print out