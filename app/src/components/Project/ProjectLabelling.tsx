import { IonPage, IonContent, IonButton, IonToolbar, IonTitle, IonSpinner, useIonViewWillEnter } from '@ionic/react';
import firebase from 'firebase';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../pages/ProjectPage.css';
import { userService } from '../../services/UserServices';
import DocumentList from '../DocumentList';
import Download from '../Download';
import Upload from '../Upload';

interface ProjectLabellingProps {
    firebase: any,
    projectId: any
}

const ProjectLabelling: React.FC<ProjectLabellingProps> = (props: ProjectLabellingProps) => {
    const [currentUser, setCurrentUser] = useState<any>({
        '_id': '',
        'isAdmin': false
    });
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState(false);
    const [uploadErrorMsg, setUploadErrorMsg] = useState("");
    const { firebase, projectId } = props;

    function isUploading(val: boolean) {
        setUploading(val);
    }

    function isUploadError(val: boolean, message: string) {        
        setUploadError(val);
        if(val) {
            setUploadErrorMsg(message);
        }
    }

    useIonViewWillEnter(() => {
        userService.getCurrentProjectUser(projectId)
            .then(data => {
                setCurrentUser(data)
            })
    }, []);

    return (
        <div>

            <div className="fabHolder">
                <div className="fableft">
                    <Upload projectId={projectId} firebase={firebase} isUploading={isUploading} uploadError={isUploadError} enable={currentUser.isAdmin && !uploading} />
                </div>
                <div className="fabright">
                    <Download name={'name'} enable={!uploading} />
                </div>
            </div>
            <div>
                {uploadError ?
                    <div className="container">
                        <IonToolbar>
                            <IonTitle color="danger">{uploadErrorMsg}</IonTitle>
                        </IonToolbar></div>
                    : <div></div>}
            </div>

            {/* TODO: this div causes the whole page to refresh when changing from insight/setting to labelling, need to figure out why - emily */}
            {/* <div className="document-list">
                {uploading && !uploadError ?
                    <div className="container">
                        <IonToolbar>
                            <IonTitle>Uploading...</IonTitle>
                        </IonToolbar>
                        <br />
                        <IonSpinner class="spinner" name="crescent" color="primary" /></div>
                    : <DocumentList name={'name'} firebase={firebase} currentUser={currentUser} />}
            </div> */}
        </div>
    );
}

export default ProjectLabelling;
