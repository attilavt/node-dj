#!/bin/bash
echo "Please enter the library root path:"
read LIBRARY_PATH
echo "(optional) Please enter the name of your wifi adapters chip (e.g. 'RT5370')"
read WIFI_CHIP
rm run.sh || true
touch run.sh || true
echo "#!/bin/bash" >> run.sh
echo '' >> run.sh
echo '# check for workingdir, might be ~ due to crontab execution'
echo 'WORKINGDIR=$(pwd)' >> run.sh
echo 'STARTUP_MSG=""' >> run.sh
echo 'if [ "$WORKINGDIR" == "*node-dj" ]' >> run.sh
echo 'then' >> run.sh
echo '    STARTUP_MSG="Already in folder $WORKINGDIR"' >> run.sh
echo 'else' >> run.sh
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
echo 'if [ "$LSUSB"'" == *\"$WIFI_CHIP\"* ]" >> run.sh
echo 'then' >> run.sh
echo '    echo "USB wifi adapter found" >> run.log' >> run.sh
echo 'else' >> run.sh
echo '    echo "USB wifi adapter not found!" >> run.log' >> run.sh
echo 'fi' >> run.sh
echo "git pull >> run.log || true" >> run.sh
echo "npm run start \"/\" \"$LIBRARY_PATH\" >> run.log" >> run.sh
chmod +x run.sh

