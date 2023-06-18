#!/bin/bash
yarn build-it
scp -r dist arrow@192.168.1.4:/home/arrow/projects/jira_qcd_test/jira_qcd_client
