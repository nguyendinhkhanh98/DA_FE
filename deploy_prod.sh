#!/bin/bash
yarn build-prod
scp -r dist/* honglm1011@34.126.157.89:/var/www/qcd/