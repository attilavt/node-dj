#!/bin/bash
echo $DATE > run.log
pwd >> run.log
git pull || true
npm run start_dev "/" "/home/attila/Music/node-dj-long/"
