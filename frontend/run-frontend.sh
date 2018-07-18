#!/bin/bash

npm start &
firefox -new-tab -url http://localhost:80 -new-tab -url http://localhost:3000/explorer -new-tab -url http://localhost:9090 &
