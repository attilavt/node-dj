#!/bin/bash
set -e
sudo apt-get install -y git openssh-server

# enable ssh access from outside
sudo ssh-keygen -t rsa -f /etc/ssh/ssh_host_rsa_key
sudo ssh-keygen -t ecdsa -f /etc/ssh/ssh_host_ecdsa_key
sudo ssh-keygen -t ed25519 -f /etc/ssh/ssh_host_ed25519_key
sudo systemctl status ssh
sudo systemctl enable ssh


cd
git clone https://github.com/attilavt/node-dj.git
cd node-dj
bash install-linux.sh
