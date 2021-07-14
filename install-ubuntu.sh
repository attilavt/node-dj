#!/bin/bash
set -e
echo "Prerequisite: _snap_ command usable, git already installed"
sudo snap install node --classic --channel=14
sudo apt-get update
sudo apt-get install -y openssh-server vim nodejs libasound2-dev make gcc g++ mpg123 net-tools wireless-tools
sudo npm install -g react-scripts

# enable ssh access from outside
sudo ssh-keygen -t rsa -f /etc/ssh/ssh_host_rsa_key
sudo ssh-keygen -t ecdsa -f /etc/ssh/ssh_host_ecdsa_key
sudo ssh-keygen -t ed25519 -f /etc/ssh/ssh_host_ed25519_key
sudo systemctl status ssh
sudo systemctl enable ssh

# build node-dj
npm install

# build node-dj-controller
cd frontend && npm install && npm run build && cd ..

# Generate run.sh

# Reference run.sh in crontab
echo "Please enter into crontab: '@reboot /home/$USER/node-dj/run.sh'"
crontab -e
sudo update-rc.d cron defaults # activate crontab (will prompt for password)


echo "Please enter the library root path:"
read LIBRARY_PATH
echo "(optional) Please enter the name of your wifi adapters chip (e.g. 'RT5370')"
read WIFI_CHIP
rm run.sh || true
touch run.sh || true
echo "#!/bin/bash" >> run.sh
echo '' >> run.sh
echo '# check for workingdir, might be ~ due to crontab execution' >> run.sh
echo 'WORKINGDIR=$(pwd)' >> run.sh
echo 'STARTUP_MSG=""' >> run.sh
echo 'if [ "$WORKINGDIR" == "*node-dj" ]' >> run.sh
echo 'then' >> run.sh
echo '    STARTUP_MSG="Already in folder $WORKINGDIR"' >> run.sh
echo 'else' >> run.sh
echo '    cd ' >> run.sh
echo '    cd node-dj' >> run.sh
echo '    STARTUP_MSG="Switched to node-dj folder from $WORKINGDIR"' >> run.sh
echo 'fi' >> run.sh


echo 'DATE=$(date "+%Y-%m-%d_%H-%M-%S")' >> run.sh
echo 'echo "============================================================" >> run.log' >> run.sh
echo 'echo "" >> run.log' >> run.sh
echo 'echo "$STARTUP_MSG" >> run.log' >> run.sh
echo 'echo "Starting run.sh at $DATE" >> run.log' >> run.sh
echo "pwd >> run.log" >> run.sh
echo '' >> run.sh
echo 'LSUSB=$(lsusb)' >> run.sh
echo 'if [[ "$LSUSB"'" = *\"$WIFI_CHIP\"* ]]" >> run.sh
echo 'then' >> run.sh
echo '    echo "USB wifi adapter found" >> run.log' >> run.sh
echo 'else' >> run.sh
echo '    echo "USB wifi adapter not found!" >> run.log' >> run.sh
echo 'fi' >> run.sh
echo 'ifconfig -a >> run.log' >> run.sh
echo "git pull >> run.log || true" >> run.sh
echo "npm run start \"/\" \"$LIBRARY_PATH\" >> run.log" >> run.sh
chmod +x run.sh

echo "Are you running this program on a raspberry pi? If so, press enter to continue and configure the audio output"
read UNUSED2
sudo raspi-config
