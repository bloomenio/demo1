#!/bin/bash

# Install MySQL Server.
# sudo apt-get update
# sudo apt-get install mysql-server -y
# mysql_secure_installation
# service mysql status

echo "Change mysql connection password, admin's paths for 'key' & 'cert'."
cd blockchain-explorer/
# nano config.json

echo "If password changed, then up Fabric Explorer."
mysql -uroot -p < db/fabricexplorer.sql
npm install
npm audit fix
./start.sh
