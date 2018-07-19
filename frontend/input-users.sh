#!/bin/bash

curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{ \ 
   "$class": "org.acme.sample.User", \ 
   "userId": "1", \ 
   "firstName": "Larry", \ 
   "lastName": "Brown", \ 
   "balance": 10, \ 
   "reputation": 2 \ 
 }' 'http://demo1.bloomen.io:3000/api/User'

 curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{ \ 
   "$class": "org.acme.sample.User", \ 
   "userId": "2", \ 
   "firstName": "Cameron", \ 
   "lastName": "Fox", \ 
   "balance": 20, \ 
   "reputation": 3 \ 
 }' 'http://demo1.bloomen.io:3000/api/User'

