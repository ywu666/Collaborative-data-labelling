# Collaborative_content_coding
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)  
Backend Status: [![Build Status](https://travis-ci.org/zyan225/Collaborative_content_coding.svg?branch=master)](https://travis-ci.org/zyan225/Collaborative_content_coding)

ENVIRONMENT FILES:
- Put the environment files (.env) within the /app and the /backend directories
- App environment file should contain the following "REACT_APP_API_URL='URL FOR BACKEND API'"
- Backend environment file should contain the following "ATLAS_URI='URL FOR MONGODB DATABASE'"
- Backend should also have the file for firebase configurations
- Please contact cche381@aucklanduni.ac.nz for the environment files required to run the project if you are having trouble

TO RUN (DOCKER):  
You must have Docker Desktop installed (With educational license): https://www.docker.com/  
Or you must have Docker toolbox: https://docs.docker.com/toolbox/toolbox_install_windows/  
Then run:  

"docker-compose up"

If you do not have docker, run each component individually (backend/main.py, and "npm run start" in app/):

To run the frontend, run 'npm install' then 'npm start' within the 'app' directory: https://www.npmjs.com/   
To run the backend, run "pip install -r requirements.txt" then 'python main.py' within the 'backend' directory   
You must have the following installed:
- Python 3
- pip
- npm

## Project Requirements
Web based tool to label text documents, for machine learning tasks. Supervised machine learning with text requires manual labels to be assigned to many documents by human coders. This tool will facilitate human coders to privately (still online) assign predefined labels to a set of documents and then compare their labels with other coders to give an agreed label. 

Technologies: Web based. Accessible from windows and MacOS

Lanuages: 

front end - HTML CSS Javascript, ionic, material ui

back end - optional (maybe python)

database - MongoDB: please note that there must be a database named "users" with a collection named "users" existing within the database before running the project


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

