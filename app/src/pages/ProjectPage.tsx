import {
  IonContent,
  IonPage,
  IonButton,
  IonItem,
  IonIcon,
  IonToast,
  IonGrid,
  IonRow,
  IonCol,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonFab,
  IonFabButton,
  IonSpinner,
  IonLoading,
  useIonViewWillEnter
} from '@ionic/react';
import { arrowUpOutline, arrowDownOutline } from 'ionicons/icons';
import React, {useEffect, useRef, useState, useCallback, } from 'react';
import { useParams } from 'react-router';
import './ProjectPage.css';
import DocumentList from '../components/DocumentList'
import Download from '../components/Download'
import Upload from '../components/Upload'
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
  const [downloadError, setDownloadError] = useState<string>();
  const [currentUser, setCurrentUser] = useState<any>({});
  const [currentDisplayName,setCurrentDisplayName] = useState("");
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(false);

  const {
    firebase
  } = props;


   const isUploading = useCallback(val => {
    setUploading(val);
    console.log("uploading "+ uploading)
  }, [setUploading]);

  const isUploadError = useCallback(val => {
    setUploadError(val)
    console.log("error "+ uploadError)
  }, [setUploadError]);

  /*useEffect(() => {


  }, [])*/

    useIonViewWillEnter(() => {
        userService.getCurrentProjectUser(name)
        .then(data => {
            setCurrentUser(data)
        })
    },[]);

  useEffect(() => {
    try{
      userService.getCurrentUser(localStorage.getItem("email"), firebase)
      .then(data => {
        setCurrentDisplayName(data.username)
      })
    } catch (e) {
      console.log(e)
    }
  }, [])

    return (
    <IonPage>
      <Header routerLink={"/"} name={currentDisplayName}/>
      <IonContent>
        <div className="container">
            <h1>{name}</h1>
          {currentUser.isAdmin ? <IonButton fill="outline" slot="end" routerLink={"/project/" + name + "/settings"}>Settings</IonButton> : <div/>}
        </div>
        <div className="fabHolder">
            <div className="fableft">
                <Upload name={name} firebase={firebase} isUploading={isUploading} uploadError={isUploadError} enable={(currentUser.isAdmin || currentUser.isContributor) && !uploading}/>

            </div>
            <div className="fabright">
                <Download name={name} enable={!uploading}/>
            </div>
        </div>
        <div>
            {uploadError ?
                <div className="container">
                <IonToolbar>
                <IonTitle color="danger">Error: uploaded file is invalid.</IonTitle>
                </IonToolbar></div>
            : <div></div> }
        </div>
        <div className="document-list">
            {uploading && !uploadError ?
                <div className="container">
                <IonToolbar>
                <IonTitle>Uploading...</IonTitle>
                </IonToolbar>
                <br/>
                <IonSpinner class="spinner" name="crescent" color="primary"/></div>
            : <DocumentList name={name} firebase= {firebase} currentUser={currentUser}/>}
        </div>

      </IonContent>
    </IonPage>
  );
};

export default ProjectPage;
