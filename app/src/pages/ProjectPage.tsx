import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonIcon,
  IonModal,
  IonSkeletonText,
  IonToast
} from '@ionic/react';
import { arrowUpOutline, arrowDownOutline } from 'ionicons/icons';
import React, {useRef, useState} from 'react';
import { useParams } from 'react-router';
import './ProjectPage.css';
import * as request from 'request';
import onLogout from '../helpers/logout'
import DocumentList from '../components/DocumentList'
import Header from '../components/Header'
import {projectServices} from "../services/ProjectServices";

interface ProjectPageProps {
  firebase: any
}
const ProjectPage: React.FC<ProjectPageProps> = (props: ProjectPageProps) => {
  const { name } = useParams<{ name: string }>();
  const page_size = 10;
  const [pageIndex] = useState(0);
  const inputFile = useRef(null);
  const [downloadError, setDownloadError] = useState<string>();
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
          <IonButton fill="outline" slot="end" routerLink={"/project/" + name + "/settings"}>Settings</IonButton>
          <DocumentList name={name} page={pageIndex} page_size={page_size} firebase= {firebase}/>
        </div>
        <div>
        <form className="uploadFile" onSubmit={() =>
            // @ts-ignore
            projectServices.uploadDocuments(name, inputFile.current.files[0], firebase)}>
            <IonItem>
            <input ref={inputFile} type="file" />
            </IonItem>
            <IonButton fill="outline" className="ion-margin-top" type="submit" expand="block"><IonIcon icon={arrowUpOutline}/>
                upload
            </IonButton>
        </form>
        <p className="note">The uploaded file should be CSV formatted.<br/>There should be two 'columns' in the<br/>following order: ID and BODY</p>

        </div>

        <div>
        <form className="downloadFile">
          <IonToast isOpen={!!downloadError} message={downloadError} duration={2000} />
            <IonButton fill="outline" className="ion-margin-top" type="button" expand="block" onClick={() => downloadCSV(name)}><IonIcon icon={arrowDownOutline}/>
                download
            </IonButton>
        </form>
        <p className="note">The downloaded file will be a CSV file.<br/>There will be three 'columns' in the following<br/>order: ID, BODY, and LABEL</p>

        </div>
      </IonContent>

    </IonPage>
  );
};

export default ProjectPage;
