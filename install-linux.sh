#!/bin/bash
curl -sL https://deb.nodesource.com/setup_9.x -o nodesource_setup.sh
sudo nodesource_setup.sh
rm nodesource_setup.sh
sudo apt-get update
sudo apt-get install -y nodejs libasound2-dev make gcc g++
npm install -g react-scripts
npm install
cd frontend && npm install