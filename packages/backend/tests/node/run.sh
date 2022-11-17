#!/bin/bash

current_folder=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

node -r esbuild-register "$current_folder/run.ts"
