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
    isUploading(val:boolean): any;
}

const Upload: React.FC<UploadProps> = (props:UploadProps) => {
    const {
        name,
        firebase,
        isUploading,
    } = props;
    const inputFile = useRef(null);
    const [data, setData] = useState("");
    const [upload, setUpload] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if(upload === true){
            try {
                isUploading(true);

                // @ts-ignore
                projectServices.uploadDocuments(name, inputFile.current.files[0], firebase).then(data => {
                console.log(data);
                isUploading(false);})
            } catch (e) {
                console.log(e)

            }
            setUpload(false)
        }
    }, [upload])

  return (
    <Tooltip title={<h5>The uploaded file should be CSV formatted. There should be two 'columns' in the following order: ID and BODY</h5>} placement="top">
    <label htmlFor="upload-button">
        <input
        style={{ display: 'none' }}
        id="upload-button"
        name="upload-button"
        type="file"
        ref={inputFile}
        onChange={e => setUpload(true)}
        />

            <MuiThemeProvider theme={theme}>
            <Fab color="primary" component="span" aria-label="add">
                <AddIcon/>
            </Fab>
            </MuiThemeProvider>

    </label>
    </Tooltip>
  );
}

export default Upload;

