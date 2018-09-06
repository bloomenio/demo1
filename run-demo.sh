#!/bin/bash
set -e  # To exit on first error.

# Cleaning.
if [ "$(docker ps -q)" > /dev/null ];then docker kill $(docker ps -q); fi
if [ "$(docker ps -aq)" > /dev/null ];then docker rm $(docker ps -aq); fi
# docker rmi $(docker images dev-* -q)
# Shutdown any programs listening on ports 3000, 9090, of localhost.
if [ "$(sudo lsof -ti :80,3000,9090)" > /dev/null ];then kill -9 $(sudo lsof -ti :80,3000,9090); fi

echo "Running Demonstrator of first Technical Review in Brussels, April 2018..."
wd=$PWD
cd hyperledger_composer_demo/
if [ -f nohup.out ];then rm nohup.out; fi
nohup /bin/bash ./run.sh &
sleep 1
while [ "$(tail -1 nohup.out)" != "Browse your REST API at http://localhost:3000/explorer" ];do sleep 5; done
/bin/bash ./run-explorer.sh &
cd $wd/frontend/
/bin/bash input-users.sh &
sleep 6
/bin/bash run-frontend.sh &
