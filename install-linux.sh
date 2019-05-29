#!/bin/bash
set -e

# install dependencies
sudo apt-get install -y curl
curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
rm nodesource_setup.sh
sudo apt-get update
sudo apt-get install -y vim nodejs libasound2-dev make gcc g++
sudo npm install -g react-scripts

# build node-dj
npm install

# build node-dj-controller
cd frontend && npm install

# Generate run.sh
bash install-linux-generate-run-script.sh

# Reference run.sh in crontab
echo "Please enter into crontab: '@reboot /home/$USER/node-dj/run.sh'"
crontab -e
sudo update-rc.d cron defaults # activate crontab (will prompt for password)

