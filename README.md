# Collaborative_content_coding
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)  
Backend Status: [![Build Status](https://travis-ci.org/zyan225/Collaborative_content_coding.svg?branch=master)](https://travis-ci.org/zyan225/Collaborative_content_coding)

- **Project Number:** 76
- **Teammates:** 
  - Yujia Wu
  - Emily Yang
- **Supervisor:** Dr. Kelly Belincoe

## BEFORE RUN

#### 1. SET ENVIRONMENT FILES
- Put the environment files (.env) within the /app and the /backend directories
- App environment file should contain the following "REACT_APP_API_URL='URL FOR BACKEND API'"
- Backend environment file should contain the following "ATLAS_URI='URL FOR MONGODB DATABASE'"
- Backend should also have the file for firebase configurations
- Please contact cche381@aucklanduni.ac.nz for the environment files required to run the project if you are having trouble

#### 2. Installatoin
You must have the following installed
- Python Version: 3.9
- pip Version: 21
- npm Version: 14

## TO RUN LOCALLY
### Mac OS
- Run each component individually:
  - To run the frontend
    - Follow the steps in the tutorial to config the file and run app on https
    - The encryption algorithm only works on https
    - https://flaviocopes.com/react-how-to-configure-https-localhost/
    - then: 
    ```
    cd app  // move into app directory
    npm install   // install all necessary libraries
    npm start   // run the project   
    ```

  - To run the backend
    ```
    cd backend
    pip install -r requirements.txt
    python main.py
    ```

### Windows OS


## Project Requirements
Web based tool to label text documents, for machine learning tasks. Supervised machine learning with text requires manual labels to be assigned to many documents by human coders. This tool will facilitate human coders to privately (still online) assign predefined labels to a set of documents and then compare their labels with other coders to give an agreed label.

-  **Support Data privacy:** The tool has a database stored on the cloud, so you do not need to setup the database. Encryption is used to ensure the data is kept private from the tool maintainers.
- **Technologies:** Web based. Accessible from windows and MacOS
- **Lanuages:**
  - **Frontend:** HTML, CSS, Typescript, Ionic UI, Material ui
  - **Backend:** Python, Flask
  - **Database:** MongoDB

## General Features
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
