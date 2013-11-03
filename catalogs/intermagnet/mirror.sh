#!/bin/bash
cd data
pwd
curl http://www.intermagnet.org/apps/download/products//$1 > $1.zip;
unzip -o $1.zip;
