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

# install dependency _devowlio/node-lame_ that is not published in npmjs
cd ..
git clone https://github.com/devowlio/node-lame.git
mv node-lame devowlio-node-lame
cd devowlio-node-lame
npm install
npm run build
cd ..
cd node-dj


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
echo 'echo "Pulling latest version from server..." >> run.log' >> run.sh
echo "git pull >> run.log 2>> run.log || true" >> run.sh
echo 'echo "Finished pulling latest version from server. Booting node-dj..." >> run.log' >> run.sh
echo "npm run start \"/\" \"$LIBRARY_PATH\" >> run.log 2>> run.log" >> run.sh
chmod +x run.sh

# see dedoimedo.com/computers/rpi4-ubuntu-mate-audio.html
echo "If you are on Ubuntu mate for raspberry, add the following line"
echo "dtparam=audio=on"
echo "Press enter to edit file"
read UNUSED
sudo vim /boot/firmware/usercfg.txt

sudo usermod -a -G audio "$USER"

# aplay -l # for checking alsa device list


# not necessary, sound already working.
# 1 for headphones, but gives error:
# amixer: cannot find the given element from control default
# sudo amixer cset numid=3 1

# not necessary, sound already working.
# as seen on raspberrypi.stackexchange.com/questions/113997/sound-output-stuck-on-hdmi-working
# echo "Add the following line"
# echo "hdmi_ignore_edid_audio=1"
# echo "Press enter to continue"
# read UNUSED
# sudo vim /boot/config.txt

