import {
    IonToolbar,
    IonTitle,
    IonSpinner,
    useIonViewWillEnter
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import '../../pages/ProjectPage.css';
import { EncryptionServices } from '../../services/EncryptionService';
import { userService } from '../../services/UserServices';
import DocumentList from '../DocumentList';
import Download from '../Download';
import Upload from '../Upload';

interface ProjectLabellingProps {
    firebase: any,
    projectId: any,
    encryptStatus:boolean,
}

const ProjectLabelling: React.FC<ProjectLabellingProps> = (props: ProjectLabellingProps) => {
    const [currentUser, setCurrentUser] = useState<any>({
        '_id': '',
        'isAdmin': false,
        'isContributor': false
    });
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState(false);
    const [uploadErrorMsg, setUploadErrorMsg] = useState("");
    const [encryptErrorMsg, setEncryptErrorMsg] = useState("");

    const { firebase,
        projectId,
        encryptStatus
    } = props;

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

    useEffect(() => {
        if (encryptStatus) {
            EncryptionServices.getEncryptedEntryKey(projectId, firebase)
            .then(() => {
                setEncryptErrorMsg("");
            })
            .catch(msg => {
                setEncryptErrorMsg(msg);
            })
        }
    }, [encryptStatus]);

    return (
        <div>

            <div className="fabHolder">
                <div className="fableft">
                    <Upload
                      projectId={projectId}
                      firebase={firebase}
                      isUploading={isUploading}
                      uploadError={isUploadError}
                      enable={currentUser.isAdmin && !uploading}
                    />
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

            <div className="document-list">
                {uploading && !uploadError ?
                    <div className="container">
                        <IonToolbar>
                            <IonTitle>Uploading...</IonTitle>
                        </IonToolbar>
                        <br />
                        <IonSpinner class="spinner" name="crescent" color="primary" /></div> :
                    encryptErrorMsg ?
                        <div className="container">
                            <IonToolbar>
                                <IonTitle>Waiting for the owner to share project data...</IonTitle>
                            </IonToolbar>
                            <br />
                            <IonSpinner class="spinner" name="crescent" color="primary" />
                        </div> :
                        <DocumentList projectId={projectId}
                            firebase={firebase}
                            currentUser={currentUser}
                            encryptStatus={encryptStatus} />
                }
            </div>
        </div>
    );
}

export default ProjectLabelling;
