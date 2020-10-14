# Collaborative_content_coding
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)  
Backend Status: [![Build Status](https://travis-ci.com/saddboys/Collaborative_content_coding.svg?branch=master)](https://travis-ci.com/saddboys/Collaborative_content_coding)

## TO RUN (DOCKER):  
You must have Docker Desktop installed (With educational license): https://www.docker.com/  
Or you must have Docker toolbox: https://docs.docker.com/toolbox/toolbox_install_windows/  
Then run:  

"docker-compose up"

## TO RUN (NOT DOCKER):
To run the backend server: 
* backend/main.py

To run the frontend server: 
* Navigate to `app/`
* `npm run start`

## Project Requirements
Web based tool to label text documents, for machine learning tasks. Supervised machine learning with text requires manual labels to be assigned to many documents by human coders. This tool will facilitate human coders to privately (still online) assign predefined labels to a set of documents and then compare their labels with other coders to give an agreed label. 

Technologies: Web based. Accessible from windows and MacOS

Lanuages: 

front end - HTML CSS Javascript, ionic, material ui

back end - optional (maybe python)


### Desired Features

- User accounts (sign in/out)
- Shared projects (datasets) between users
- Create predefined labels in the project
- Each user can assign a predfined label to each document
- Data import and export as .sqlite 
- Automatic label compare between users
- Calculate agreement score between users (http://dfreelon.org/utils/recalfront/recal2/)
- Facilitate label disagreement resolution. Including comments on documents
- Modify labels -> rename, parent/child associations 
- modified labels should be automatically propagated
- user edit access levels-> creating labels etc
- Update db often

