import {
  IonContent,
  IonPage,
  IonButton,
  IonItem,
  IonIcon,
  IonToast
} from '@ionic/react';
import { arrowUpOutline, arrowDownOutline } from 'ionicons/icons';
import React, {useEffect, useRef, useState} from 'react';
import { useParams } from 'react-router';
import './ProjectPage.css';
import DocumentList from '../components/DocumentList'
import Header from '../components/Header'
import { projectServices } from "../services/ProjectServices";
import { userService } from "../services/UserServices";
import { documentServices } from "../services/DocumentService"
import {Tooltip} from '@material-ui/core';

interface ProjectPageProps {
  firebase: any
}
const ProjectPage: React.FC<ProjectPageProps> = (props: ProjectPageProps) => {
  const { name } = useParams<{ name: string }>();
  const page_size = 10;
  const inputFile = useRef(null);
  const [downloadError, setDownloadError] = useState<string>();
  const [currentUser, setCurrentUser] = useState<any>({});
  
  const {
    firebase
  } = props;
  const downloadCSV = (projectName: string) => {
    try {
      projectServices.exportCsv(projectName)
    } catch(e) {
      setDownloadError(e)
    }
  }

  useEffect(() => {
    userService.getCurrentProjectUser(name)
    .then(data => {
      setCurrentUser(data)
    })
  }, [])

  // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    return (
    <IonPage>
      <Header routerLink={"/"} name={localStorage.getItem("email") || "User"}/>

      <IonContent>
        <div className="container">        
          <h1>{name}</h1>
          {currentUser.isAdmin
          ? <IonButton fill="outline" slot="end" routerLink={"/project/" + name + "/settings"}>Settings</IonButton>
          : <div/>}
          <DocumentList name={name} page_size={page_size} firebase= {firebase} currentUser={currentUser}/>
        </div>
        <div>
        <form className="uploadFile" onSubmit={() =>
            // @ts-ignore
            projectServices.uploadDocuments(name, inputFile.current.files[0], firebase)}>
            <IonItem>
            <input ref={inputFile} type="file" />
            </IonItem>
              <Tooltip title="The uploaded file should be CSV formatted. There should be two 'columns' in the following order: ID and BODY" placement="right">
                <IonButton fill="outline" className="ion-margin-top" type="submit" expand="block"><IonIcon icon={arrowUpOutline}/>
                upload
                </IonButton>
              </Tooltip>
        </form>
        </div>

        <div>
        <form className="downloadFile">
          <IonToast isOpen={!!downloadError} message={downloadError} duration={2000} />
            <Tooltip title="The downloaded file will be a CSV file. There will be three 'columns' in the following order: ID, BODY, and LABEL" placement="right">
            <IonButton fill="outline" className="ion-margin-top" type="button" expand="block" onClick={() => downloadCSV(name)}><IonIcon icon={arrowDownOutline}/>
                download
            </IonButton>
            </Tooltip>
        </form>
        </div>
      </IonContent>

    </IonPage>
  );
};

export default ProjectPage;
