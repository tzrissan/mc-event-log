#!/bin/bash

git branch

DIR=mc-x

echo "Deploying to ~/sites/tzrissan.kapsi.fi/www/${DIR}"

ssh tzrissan@lakka.kapsi.fi "rm -rv ~/sites/tzrissan.kapsi.fi/www/${DIR}/*"
rsync -vrut --exclude data dist/* tzrissan@lakka.kapsi.fi:~/sites/tzrissan.kapsi.fi/www/${DIR}
