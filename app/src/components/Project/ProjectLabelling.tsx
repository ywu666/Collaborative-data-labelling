import React from 'react';
import '../../pages/ProjectPage.css';

interface ProjectLabellingProps {
    firebase: any
}

const ProjectLabelling: React.FC<ProjectLabellingProps> = (props: ProjectLabellingProps) => {
    return (
        <div>
            This is the labelling page
            <br/>
            <br/><br/><br/><br/><br/><br/><br/><br/>
        </div>
        // <IonPage>
        //     <Header routerLink={"/"} name={currentDisplayName} />
        //     <IonContent>
        //         <div className="container">
        //             <h1>{name}</h1>
        //             {currentUser.isAdmin ? <IonButton fill="outline" slot="end" routerLink={"/project/" + name + "/settings"}>Settings</IonButton> : <div />}
        //         </div>
        //         <div className="fabHolder">
        //             <div className="fableft">
        //                 <Upload name={name} firebase={firebase} isUploading={isUploading} uploadError={isUploadError} enable={(currentUser.isAdmin || currentUser.isContributor) && !uploading} />

        //             </div>
        //             <div className="fabright">
        //                 <Download name={name} enable={!uploading} />
        //             </div>
        //         </div>
        //         <div>
        //             {uploadError ?
        //                 <div className="container">
        //                     <IonToolbar>
        //                         <IonTitle color="danger">Error: uploaded file is invalid.</IonTitle>
        //                     </IonToolbar></div>
        //                 : <div></div>}
        //         </div>
        //         <div className="document-list">
        //             {uploading && !uploadError ?
        //                 <div className="container">
        //                     <IonToolbar>
        //                         <IonTitle>Uploading...</IonTitle>
        //                     </IonToolbar>
        //                     <br />
        //                     <IonSpinner class="spinner" name="crescent" color="primary" /></div>
        //                 : <DocumentList name={name} firebase={firebase} currentUser={currentUser} />}
        //         </div>

        //     </IonContent>
        // </IonPage>
    );
}

export default ProjectLabelling;
