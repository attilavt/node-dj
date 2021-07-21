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
echo "Please enter into crontab:"
echo "SHELL=/bin/bash"
echo "'@reboot /home/$USER/node-dj/run.sh'"
echo "Press enter to continue..."
read UNUSED
crontab -e
sudo update-rc.d cron defaults # activate crontab (will prompt for password)


echo "Please enter the library root path:"
read LIBRARY_PATH
rm run.sh || true
touch run.sh || true
echo "#!/bin/bash" >> run.sh
echo '' >> run.sh
echo '# check for workingdir, might be ~ due to crontab execution' >> run.sh
echo 'WORKINGDIR=$(pwd)' >> run.sh
echo '# add PATH to in case cron doesnt have it' >> run.sh
echo "export PATH=\"$PATH\"" >> run.sh
echo "export XDG_RUNTIME_DIR=\"/run/user/1000\"" >> run.sh
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
echo 'LSHWNET=$(lshw -C network 2> /dev/null)' >> run.sh
echo 'if [[ "$LSHWNET"'" = *\"Wireless interface\"* ]]" >> run.sh
echo 'then' >> run.sh
echo '    echo "USB wifi adapter found" >> run.log' >> run.sh
echo 'else' >> run.sh
echo '    echo "USB wifi adapter not found!" >> run.log' >> run.sh
echo 'fi' >> run.sh
echo 'echo "Network configuration:"' >> run.sh
echo 'ifconfig -a >> run.log 2>> run.log || true' >> run.sh
echo 'echo "Pulling latest version from server..." >> run.log' >> run.sh
echo "git pull >> run.log 2>> run.log || true" >> run.sh
echo 'echo "Finished pulling latest version from server. Booting node-dj..." >> run.log' >> run.sh
echo "npm run start \"/\" \"$LIBRARY_PATH\" >> run.log 2>> run.log" >> run.sh
chmod +x run.sh

echo "Are you running the program on Ubuntu mate for raspberry?"
echo "Type \"yes\" to continue"
read IS_UBUNTU_RPI
if [[ $IS_UBUNTU_RPI == "yes" ]]
then
	echo "Continuing with ubuntu mate raspberry specific setup"
else
  echo "Finished setup."
	exit 0
fi

# see dedoimedo.com/computers/rpi4-ubuntu-mate-audio.html
echo "Add the following line to /boot/firmware/usercfg.txt"
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

# see stackoverflow.com/questions/62585077/how-do-i-get-amixer-pcm-numid-3-to-work-on-raspberry-pi-4
# sudo bash -c 'echo -e " defaults.pcm.card 1 \ndefaults.ctl.card 1"> /etc/asound.conf'

