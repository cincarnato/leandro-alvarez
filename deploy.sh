#!/bin/sh
echo "DEPLOY: INIT"

echo "DEPLOY: git checkout and pull"
git checkout .
git pull


echo "DEPLOY: Building"
sh build.sh


echo "DEPLOY: Install production dependencies"

cd out
npm install --omit=dev
cd ..

echo "DEPLOY: START SERVICE"
sh start.sh
