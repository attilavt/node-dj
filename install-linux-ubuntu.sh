#!/bin/bash
set -e
echo "This script contains the sudo command and will prompt for your password."
echo "It needs to be run with a user authorized for sudo, but it shall not be run using sudo!"
echo ""

# read target user name
echo "The program will be set up for user $USER. Press enter to continue"
# compgen -u || true
read USER_CONFIRM
TARGET_USER="$USER"

echo "Do you want to install using snap or downloaded script?"
echo "Type \"snap\" to continue with snap and anything else to continue with script downloaded from nodesource.com"
read INSTALL_VIA_SNAP
if [[ $INSTALL_VIA_SNAP == "snap" ]]
then
  echo "Installing node using snap"
  sudo snap install node --classic --channel=10
else
  echo "Installing node using script downloaded from nodesource.com"
  LANG=en_US.utf8 curl -fsSL https://deb.nodesource.com/setup_10.x > temp_setup_10.sh
  echo "if your distribution is not supported, add it to the check_alt commands"
  sudo bash temp_setup_10.sh
  rm temp_setup_10.sh
fi

sudo apt-get update
sudo apt-get install -y openssh-server vim nodejs libasound2-dev make gcc g++ mpg123 net-tools wireless-tools
sudo npm install -g react-scripts

# enable ssh access from outside
sudo ssh-keygen -t rsa -f /etc/ssh/ssh_host_rsa_key
sudo ssh-keygen -t ecdsa -f /etc/ssh/ssh_host_ecdsa_key
sudo ssh-keygen -t ed25519 -f /etc/ssh/ssh_host_ed25519_key
sudo systemctl status ssh
sudo systemctl enable ssh

# switch branch if arm-64
echo "Are you running the program on a armv8 / arm64 architecture? (e.g. raspberry pi 4)"
echo "Type \"yes\" to continue with arm64 and anything else to continue without arm64"
read IS_ARM64
if [[ $IS_ARM64 == "yes" ]]
then
	echo "Continuing with arm64-specific branch"
  git checkout master-arm64
else
  echo "Continuing with normal branch (not arm64-specific)"
fi

# build node-dj
npm install

# build node-dj-controller
cd frontend && npm install && npm run build && cd ..

# query startup type
echo "How do you want to make the program run at startup?"
echo "Type \"cron\" to continue with cron setup or anything else for systemd (default)"
read STARTUP_BY_CRON

# query optional maxoldspacesize parameter
echo "Do you want the run script to set the max-old-space-size parameter to solve npm install bugs?"
echo "Type \"setparam\" to continue with cron setup or anything else for no (default)"
read SET_MAX_OLD_SPACE_SIZE_PARAM

# query whether there should be a wait when starting
echo "Do you want the run script to contain a _sleep_ command to allow the system to boot completely?"
echo "Type \"yes\" to continue with sleep command or anything else for no (default)"
read ADD_SLEEP_COMMAND

# Generate run.sh
echo "Please enter the library root path:"
read LIBRARY_PATH
rm run.sh 2> /dev/null || true
touch run.sh 2> /dev/null || true
echo "#!/bin/bash" >> run.sh
echo '' >> run.sh
echo '# check for workingdir, might be ~ due to crontab execution' >> run.sh
echo 'WORKINGDIR=$(pwd)' >> run.sh
if [[ $STARTUP_BY_CRON == "cron" ]]
then
  echo '# add PATH to in case cron doesnt have it' >> run.sh
  echo "export PATH=\"$PATH\"" >> run.sh
  echo "export XDG_RUNTIME_DIR=\"/run/user/1000\"" >> run.sh
fi
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
echo '' >> run.sh
echo '# manage run.log and run_archive.log' >> run.sh
echo 'touch run_archive.log || true' >> run.sh
echo 'echo "" >> run_archive.log' >> run.sh
echo 'echo "============================================================" >> run_archive.log' >> run.sh
echo 'echo "" >> run_archive.log' >> run.sh
echo 'cat run.log >> run_archive.log' >> run.sh
if [[ $ADD_SLEEP_COMMAND == "yes" ]]
then
  echo "" >> run.sh
  echo '# sleep command for allowing boot up' >> run.sh
  echo "sleep 30" >> run.sh
  echo "" >> run.sh
fi
echo '' >> run.sh
echo '# startup and debugging messages' >> run.sh
echo 'echo "Starting run.sh at $DATE as $USER" > run.log' >> run.sh
echo 'echo "$STARTUP_MSG" >> run.log' >> run.sh
echo "pwd >> run.log" >> run.sh
echo '' >> run.sh
echo 'LSHWNET=$(lshw -C network 2> /dev/null)' >> run.sh
echo 'if [[ "$LSHWNET"'" = *\"Wireless interface\"* ]]" >> run.sh
echo 'then' >> run.sh
echo '    echo "USB wifi adapter found" >> run.log' >> run.sh
echo 'else' >> run.sh
echo '    echo "USB wifi adapter not found!" >> run.log' >> run.sh
echo 'fi' >> run.sh
echo 'echo "Network configuration:" >> run.log' >> run.sh
echo 'ifconfig -a >> run.log 2>> run.log || true' >> run.sh
echo '' >> run.sh
echo '# check for newer versions' >> run.sh
echo 'echo "Pulling latest version from server..." >> run.log' >> run.sh
echo "git pull >> run.log 2>> run.log || true" >> run.sh
echo 'echo "Finished pulling latest version from server. Booting node-dj..." >> run.log' >> run.sh
echo '' >> run.sh
echo '# run the program' >> run.sh
if [[ $SET_MAX_OLD_SPACE_SIZE_PARAM == "setparam" ]]
then
  echo '# set param to solve mystery bug in npm install' >> run.sh
  echo 'export NODE_OPTIONS="--max-old-space-size=8192"' >> run.sh
fi
echo "npm run start \"/\" \"$LIBRARY_PATH\" >> run.log 2>> run.log" >> run.sh
chmod +x run.sh

# Boot on startup
if [[ $STARTUP_BY_CRON == "cron" ]]
then
	echo "Please enter into crontab:"
  echo "SHELL=/bin/bash"
  echo "'@reboot /home/$TARGET_USER/node-dj/run.sh'"
  echo "Press enter to continue..."
  read UNUSED
  crontab -e
  sudo update-rc.d cron defaults # activate crontab (will prompt for password)
else
  echo "Setting up systemd..."
  SYSTEMD_SERVICE_FILE = "/etc/systemd/system/nodedj.service"
  sudo touch $SYSTEMD_SERVICE_FILE
  sudo echo "[Unit]" >> $SYSTEMD_SERVICE_FILE
  
  sudo echo "Description=Jukebox for playing music" >> $SYSTEMD_SERVICE_FILE
  sudo echo "After=network.target" >> $SYSTEMD_SERVICE_FILE

  sudo echo "[Service]" >> $SYSTEMD_SERVICE_FILE
  sudo echo "ExecStart=/bin/bash /home/altin/node-dj/run.sh" >> $SYSTEMD_SERVICE_FILE
  sudo echo "RestartSec=10" >> $SYSTEMD_SERVICE_FILE
  sudo echo "User=$TARGET_USER" >> $SYSTEMD_SERVICE_FILE

  sudo echo "[Install]" >> $SYSTEMD_SERVICE_FILE
  sudo echo "WantedBy=default.target" >> $SYSTEMD_SERVICE_FILE
  sudo systemctl enable nodedj
fi

echo "Do you want to write ~/.asoundrc to avoid playback errors when switching songs?"
echo "Type \"yes\" to continue"
read WRITE_ASOUNDRC
if [[ $WRITE_ASOUNDRC == "yes" ]]
then
  rm /home/$TARGET_USER/.asoundrc 2> /dev/null || true
  touch /home/$TARGET_USER/.asoundrc 2> /dev/null || true
  echo "pcm.!default {" >> /home/$TARGET_USER/.asoundrc
  echo "        type hw" >> /home/$TARGET_USER/.asoundrc
  echo "        card 1" >> /home/$TARGET_USER/.asoundrc
  echo "}" >> /home/$TARGET_USER/.asoundrc
  echo "" >> /home/$TARGET_USER/.asoundrc
  echo "ctl.!default {" >> /home/$TARGET_USER/.asoundrc
  echo "        type hw" >> /home/$TARGET_USER/.asoundrc
  echo "        card 0" >> /home/$TARGET_USER/.asoundrc
  echo "}" >> /home/$TARGET_USER/.asoundrc
	echo "Finished writing ~/.asoundrc"
fi

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

#
# FROM HERE ON: UBUNTU MATE FOR RASPBERRY SPECIFIC!
#

# see dedoimedo.com/computers/rpi4-ubuntu-mate-audio.html
echo "Add the following line to /boot/firmware/usercfg.txt"
echo "dtparam=audio=on"
echo "Press enter to edit file"
read UNUSED
sudo vim /boot/firmware/usercfg.txt

sudo usermod -a -G audio "$TARGET_USER"

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

