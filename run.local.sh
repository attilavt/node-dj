#!/bin/bash
echo $DATE > run.log
pwd >> run.log
git pull || true
npm run start "/" "/media/attila/MYLINUXLIVE/altincamp" >> run.log
