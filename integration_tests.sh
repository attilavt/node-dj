#!/bin/bash

function wait_until_up {
    FOUND="0"

    while [ $FOUND -lt 1 ]
    do
        sleep 0.5
        RES=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)
        echo "RES $RES"
        if [ $RES -eq "200" ]
        then
            FOUND="1"
            echo "FOUND!"
        fi
    done
}

function kill_running_server {
    SERVER=$(ps -A | grep node)
    echo "Killing $SERVER"
    kill -9 $SERVER || true
}

kill_running_server
echo "starting"
npm run start_dev "/" "/home/attila/Music/node-dj-long/" &
#npm run start_dev "/" "/home/attila/Music/node-dj-long/" >/dev/null 2>/dev/null &
wait_until_up
npm run test-integration
kill_running_server