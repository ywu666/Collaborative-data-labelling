import {
  IonButton,
  IonItem,
  IonLabel,
  IonAlert
} from '@ionic/react';
import React, { useState } from 'react';
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
        checked: isContributor
      },
      {
        type: 'checkbox',
        label: 'Admin',
        value: 'Admin',
        checked: isAdmin
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
            isContributor = true;
          } else {
            isContributor = false;
          }
          if (data.includes("Admin")) {
            isAdmin = true;
          } else {
            isAdmin = false;
          }
          setPermissions()
          }
      }
    ]}
  />

  function setPermissions() {
    projectServices.setUserPermissions(project, user, isAdmin, isContributor, firebase);
  }

  if (isAdmin) {
    currentRole = "Admin";
  } else if (isContributor) {
    currentRole = "Contributor";
  }

if (canEdit) {
  return (
    <div>
    <IonItem>
        <IonLabel>{user}</IonLabel>
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