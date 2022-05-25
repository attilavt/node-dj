#!/bin/bash

sudo apt-get update
sudo apt-get install -y git curl vim
git clone https://github.com/attilavt/node-dj.git
cd node-dj
bash install-linux-ubuntu.sh
