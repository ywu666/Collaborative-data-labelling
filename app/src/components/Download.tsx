import {
  IonToast,
  IonLoading
} from '@ionic/react';
import React, {useState} from 'react';
import { projectServices } from "../services/ProjectServices";
import {Tooltip, Fab} from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';


interface DownloadProps {
    name: string,
    enable: boolean;
    projectId: string,
    firebase: any
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
    projectId,
    firebase
  } = props;
  const [downloadError, setDownloadError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const downloadCSV = (projectName: string) => {
    setIsLoading(true)
    try {
      projectServices.exportCsv(projectName, projectId)
      setIsLoading(false)
    } catch(e) {
      setDownloadError("Downloading Error")
      setIsLoading(false)
    }
  }

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