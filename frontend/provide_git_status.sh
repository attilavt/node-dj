#!/bin/bash
echo "Last git commit: " > build/static/version.txt
echo "" >> build/static/version.txt
git log -n 1 >> build/static/version.txt