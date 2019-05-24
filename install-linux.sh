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
echo "Please enter the library root path:"
read LIBRARY_PATH
echo "(optional) Please enter the name of your wifi adapters chip (e.g. 'RT5370')"
read WIFI_CHIP
rm run.sh || true
touch run.sh || true
echo "#!/bin/bash" >> run.sh
echo 'DATE=$(date "+%Y-%m-%d_%H-%M-%S")' >> run.sh
echo 'echo "============================================================" >> run.log' >> run.sh
echo 'echo "" >> run.log' >> run.sh
echo 'echo "Starting run.sh at $DATE" >> run.log' >> run.sh
echo "pwd >> run.log" >> run.sh
echo '' >> run.sh
echo 'LSUSB=$(lsusb)' >> run.sh
echo 'if [ $USB'" == *\"$WIFI_CHIP\"* ]" >> run.sh
echo 'then' >> run.sh
echo '    echo "USB wifi adapter found" >> run.log' >> run.sh
echo 'else' >> run.sh
echo '    echo "USB wifi adapter not found!" >> run.log' >> run.sh
echo 'fi' >> run.sh
echo "git pull >> run.log || true" >> run.sh
echo "npm run start \"/\" \"$LIBRARY_PATH\" >> run.log" >> run.sh