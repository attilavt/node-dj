#!/bin/bash
echo "Last git commit: " || true > build/static/version.txt
echo "" || true >> build/static/version.txt
git log -n 1 || true >> build/static/version.txt