#!/bin/bash

cd fabric-dev-servers/
./startFabric.sh 
./createPeerAdminCard.sh 
cd ../news-composer/
composer runtime install --card PeerAdmin@hlfv1 --businessNetworkName news-network
composer network start --card PeerAdmin@hlfv1 --networkAdmin admin --networkAdminEnrollSecret adminpw --archiveFile news-network@1.1.0.bna --file admin@news-network
composer card import --file admin@news-network
composer-rest-server -c admin@news-network -n never -w true
