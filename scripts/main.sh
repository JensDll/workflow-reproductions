#!/bin/bash

id=$(uuidgen)

git add -A && git commit -m "$id" && git push origin staging
