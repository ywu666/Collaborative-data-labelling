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
  IonLoading
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
    name: string,
    enable: boolean;
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
    enable,
  } = props;
  const [downloadError, setDownloadError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);



  const downloadCSV = (projectName: string) => {

    console.log("entering CSV")
    setIsLoading(true)
    console.log(isLoading)
    try {
      projectServices.exportCsv(projectName)
    } catch(e) {
    }
    console.log("finished function csv download")
    console.log(isLoading)
    
  }


  useEffect(() => {
    console.log(isLoading)
    console.log("loading changed")
    
  }, [isLoading])
  

  return (

        <MuiThemeProvider theme={theme}>
          <IonLoading
                isOpen={isLoading}
                message={'Please wait while your download starts...'}
                onDidDismiss={() => setIsLoading(false)}
                duration = {3000}
                />
        <IonToast isOpen={!!downloadError} message={downloadError} duration={2000} />
            <Tooltip title={<h5>The downloaded file will be a CSV file. There will be six 'columns' in the following
              order: ID, DOCUMENT, LABEL, LABEL STATUS, CONTRIBUTOR 1 LABEL, and CONTRIBUTOR 2 LABEL</h5>} placement="top">
                {enable ? <Fab color="primary" component="span" onClick={() => downloadCSV(name)}> <ArrowDownwardIcon/> </Fab>
                : <Fab disabled color="primary" component="span" onClick={() => downloadCSV(name)}> <ArrowDownwardIcon/> </Fab>
                }
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