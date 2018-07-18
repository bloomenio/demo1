#!/bin/bash
set -e  # To exit on first error.

# Cleaning.
if [ "$(docker ps -aq --filter 'exited=255')" > /dev/null ];then docker rm $(docker ps -aq --filter 'exited=255'); fi
if [ "$(docker ps -aq --filter 'exited=137')" > /dev/null ];then docker rm $(docker ps -aq --filter 'exited=137'); fi
if [ "$(docker ps -aq --filter 'exited=2')" > /dev/null ];then docker rm $(docker ps -aq --filter 'exited=2'); fi
if [ "$(docker ps -aq)" > /dev/null ];then docker kill $(docker ps -aq); docker rm $(docker ps -aq); fi
# docker rmi $(docker images dev-* -q)
# Shutdown any programs listening on ports 3000, 9090, of localhost.
# if [ "$(lsof -ti :80)" > /dev/null ];then kill -9 $(lsof -ti :80); fi
if [ "$(lsof -ti :9090)" > /dev/null ];then kill -9 $(lsof -ti :9090); fi
if [ "$(lsof -ti :3000)" > /dev/null ];then kill -9 $(lsof -ti :3000); fi

echo "Running Demonstrator of first Technical Review in Brussels, April 2018..."
wd=$PWD
cd hyperledger_composer_demo/
if [ -f nohup.out ];then rm nohup.out; fi
nohup /bin/bash ./run.sh &
while [ "$(tail -1 nohup.out)" != "Browse your REST API at http://localhost:3000/explorer" ];do sleep 5; done
nohup /bin/bash ./run-explorer.sh &
while [ "$(tail -1 nohup.out)" != "Please open Internet explorer to access ：http://localhost:9090/" ];do sleep 5; done
cd $wd/frontend/
/bin/bash run-frontend.sh &
