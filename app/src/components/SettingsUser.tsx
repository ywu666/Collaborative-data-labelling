import {
  IonButton,
  IonItem,
  IonLabel,
  IonAlert,
  IonIcon
} from '@ionic/react';
import React, { useState } from 'react';
import { eyeOutline, peopleOutline, buildOutline} from 'ionicons/icons';
import { projectServices } from '../services/ProjectServices'

interface ContainerProps {
  project: string;
  user: string;
  isContributor: boolean;
  isAdmin: boolean;
  canEdit: boolean;
  firebase:any
}


const SettingsUser: React.FC<ContainerProps> = ({ project, user, isContributor, isAdmin, canEdit, firebase }) => {

  const [showPermissions, setShowPermissions] = useState(false);
  const [localIsContributor, setLocalIsContributor] = useState<boolean>(isContributor);
  const [localIsAdmin, setLocalIsAdmin] = useState<boolean>(isAdmin);

  var currentRole = "Observer";

  const alert = 
  <IonAlert
    isOpen={showPermissions}
    onDidDismiss={() => setShowPermissions(false)}
    header={'Assign Privileges:'}
    message={''}
    inputs={[
      {
        type: 'checkbox',
        label: 'Contributor',
        value: 'Contributor',
        checked: localIsContributor
      },
      {
        type: 'checkbox',
        label: 'Admin',
        value: 'Admin',
        checked: localIsAdmin
      }
    ]}
    buttons={[
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Confirm',
        handler: (data) => {
          if (data.includes("Contributor")) {
            setLocalIsContributor(true);
          } else {
            setLocalIsContributor(false);
          }
          if (data.includes("Admin")) {
            setLocalIsAdmin(true);
          } else {
            setLocalIsAdmin(false);
          }
          setPermissions()
          }
      }
    ]}
  />

  function setPermissions() {
    isContributor = localIsContributor;
    isAdmin = localIsAdmin;
    projectServices.setUserPermissions(project, user, isAdmin, isContributor, firebase);
  }

    if (localIsAdmin) {
    currentRole = "Admin";
  } else if (localIsContributor) {
    currentRole = "Contributor";
  }

if (canEdit) {
  return (
    <div>
    <IonItem>
        <IonLabel>{user}</IonLabel>
        <IonLabel slot="end"><IonIcon icon = {buildOutline} hidden={!isAdmin}></IonIcon><IonIcon icon = {peopleOutline} hidden={!isContributor}></IonIcon><IonIcon icon = {eyeOutline}></IonIcon></IonLabel>
        <IonButton fill="outline" slot="end" onClick={() => setShowPermissions(true)}>
        {currentRole}
        </IonButton>
    </IonItem>
    {alert}
    </div>
  );
} else {
  return (
    <div>
    <IonItem>
        <IonLabel>{user}</IonLabel>
        <IonButton fill="outline" slot="end" onClick={() => setShowPermissions(true)} disabled>
        {currentRole}
        </IonButton>
    </IonItem>
    {alert}
    </div>
  );
}
}

export default SettingsUser;