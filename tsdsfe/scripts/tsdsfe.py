# Tested in Python 2.7.
# __COMMENT__
import csv
import urllib2

url = '__SERVER__?__QUERYSTRING__'
response = urllib2.urlopen(url)
cr = csv.reader(response, delimiter=' ')
D = [row for row in cr]
L = ['Year','Month','Day','Hour','Minute','Second',__LABELS__]

print "Labels and first/last line."
print (D)
print D[0]
print D[-1]