import {
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonToast,
  IonCard,
  IonContent,
  IonPage,
  IonItem,
  IonFab,
  IonFabButton,
  IonInput
} from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import onLogout from '../helpers/logout';
import firebase from "firebase";
import { arrowUpOutline, arrowDownOutline } from 'ionicons/icons';
import React, {useEffect, useRef, useState} from 'react';
import { useParams } from 'react-router';
import { projectServices } from "../services/ProjectServices";
import { userService } from "../services/UserServices";
import { documentServices } from "../services/DocumentService";
import {Tooltip, Fab, Button} from '@material-ui/core';
import AddIcon from "@material-ui/icons/Add";
import { positions } from '@material-ui/system';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#3880ff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
});


interface UploadProps {
    name: string;
    firebase: any;
}

const Upload: React.FC<UploadProps> = (props:UploadProps) => {
    const {
        name,
        firebase,
    } = props;
    const inputFile = useRef(null);

    function handleUpload() {
        console.log("upload")
        try {
            // @ts-ignore
            projectServices.uploadDocuments(name, inputFile.current.files[0], firebase)

        } catch (e) {
            console.log(e)
        }
    }

  return (

    <label htmlFor="upload-button">
        <input
        style={{ display: 'none' }}
        id="upload-button"
        name="upload-button"
        type="file"
        ref={inputFile}
        onChange={handleUpload}
        />
        <Tooltip title="The uploaded file should be CSV formatted. There should be two 'columns' in the following order: ID and BODY" placement="right">
            <MuiThemeProvider theme={theme}>
            <Fab color="primary" component="span" aria-label="add">
                <AddIcon/>
            </Fab>
            </MuiThemeProvider>
        </Tooltip>
    </label>
  );
}

export default Upload;


/*<form className="uploadFile" onSubmit={handleUpload}>
            <IonItem>
            <input ref={inputFile} type="file" />
            </IonItem>
              <Tooltip title="The uploaded file should be CSV formatted. There should be two 'columns' in the following order: ID and BODY" placement="right">
                <IonButton  style={{ maxWidth: '400px', minWidth: '270px' }} fill="outline" className="ion-margin-top" onClick={handleUpload} expand="block"><IonIcon icon={arrowUpOutline}/>
                upload
                </IonButton>
              </Tooltip>
        </form>*/