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
import {Tooltip} from '@material-ui/core';


interface DownloadProps {
    name: string
}

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
  <IonFab>
    <form className="downloadFile">
        <IonToast isOpen={!!downloadError} message={downloadError} duration={2000} />
        <Tooltip title="The downloaded file will be a CSV file. There will be three 'columns' in the following order: ID, BODY, and LABEL" placement="right">
        <IonFabButton onClick={() => downloadCSV(name)}>
            <IonIcon icon={arrowDownOutline} />
        </IonFabButton>
        </Tooltip>
        </form>
  </IonFab>



  );
}

export default Download;