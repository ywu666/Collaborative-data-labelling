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
  IonFabButton
} from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import onLogout from '../helpers/logout'
import firebase from "firebase";
import { arrowUpOutline, arrowDownOutline } from 'ionicons/icons';
import React, {useEffect, useRef, useState} from 'react';
import { useParams } from 'react-router';
import { projectServices } from "../services/ProjectServices";
import { userService } from "../services/UserServices";
import { documentServices } from "../services/DocumentService"
import {Tooltip, Fab, Button} from '@material-ui/core';
import AddIcon from "@material-ui/icons/Add";
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import { positions } from '@material-ui/system';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';


interface DownloadProps {
    name: string
}

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

const Download: React.FC<DownloadProps> = (props:DownloadProps) => {
  const {
    name,
  } = props;
  const [downloadError, setDownloadError] = useState<string>();



  const downloadCSV = (projectName: string) => {
    try {
      projectServices.exportCsv(projectName)
    } catch(e) {
      setDownloadError(e)
    }
  }

  return (

        <MuiThemeProvider theme={theme}>
        <IonToast isOpen={!!downloadError} message={downloadError} duration={2000} />
            <Tooltip title={<h5>The downloaded file will be a CSV file. There will be six 'columns' in the following
              order: ID, DOCUMENT, LABEL, LABEL STATUS, CONTRIBUTOR 1 LABEL, and CONTRIBUTOR 2 LABEL</h5>}
                     placement="top">
                <Fab color="primary" component="span" onClick={() => downloadCSV(name)}>
                    <ArrowDownwardIcon/>
                </Fab>
            </Tooltip>
        </MuiThemeProvider>





  );
}

export default Download;
/*<IonFab>
    <form className="downloadFile">
<IonFabButton onClick={() => downloadCSV(name)}>
            <IonIcon icon={arrowDownOutline} />
        </IonFabButton>
        </form>
        </IonFab>*/