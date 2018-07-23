#!/bin/bash
echo $DATE > run.log
pwd >> run.log
git pull || true
npm run start_dev &
cd frontend
npm run build &
