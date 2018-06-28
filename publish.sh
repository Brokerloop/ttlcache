#!/bin/bash

set -e

cd ./build/package && npm publish --access=public
