#!/bin/bash
echo $DATE > run.log
pwd >> run.log
git pull || true
npm run start >> run.log
