#!/bin/bash

set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1

cd ../basic-network
./stop.sh

docker rm $(docker ps -qa)
docker rmi `docker images | awk '$1 ~ /dev-*/ {print $3}'`