#!/bin/bash
pwd >> run.log
git pull || true
npm run start "/" "/media/eltern/MYLINUXLIVE/altincamp" >> run.log
