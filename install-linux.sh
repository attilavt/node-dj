#!/bin/bash
set -e
sudo apt-get install -y curl
curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
rm nodesource_setup.sh
sudo apt-get update
sudo apt-get install -y vim nodejs libasound2-dev make gcc g++
sudo npm install -g react-scripts
npm install
cd frontend && npm install
