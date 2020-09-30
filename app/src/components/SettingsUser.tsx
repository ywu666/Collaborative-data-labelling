import {
  IonButton,
  IonItem,
  IonLabel,
  IonAlert,
  IonIcon
} from '@ionic/react';
import React, { useState, useRef } from 'react';
import { eyeOutline, peopleOutline, buildOutline} from 'ionicons/icons';
import { Tooltip } from '@material-ui/core';
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
  const [showError, setShowError] = useState(false);
  const [localIsContributor, setLocalIsContributor] = useState(isContributor);
  const [localIsAdmin, setLocalIsAdmin] = useState(isAdmin);
  const refContributor = useRef(localIsContributor)
  const refAdmin = useRef(localIsAdmin)

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
        checked: refContributor.current
      },
      {
        type: 'checkbox',
        label: 'Admin',
        value: 'Admin',
        checked: refAdmin.current
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
            refContributor.current = true
          } else {
            setLocalIsContributor(false);
            refContributor.current = false
          }
          if (data.includes("Admin")) {
            setLocalIsAdmin(true);
            refAdmin.current = true
          } else {
            setLocalIsAdmin(false);
            refAdmin.current = false
          }
          projectServices.setUserPermissions(project, user, refAdmin.current, refContributor.current, firebase)
            .catch(e => {
            setLocalIsContributor(isContributor)
            setLocalIsAdmin(isAdmin)
            setShowError(true)
        })
          }
      }
    ]}
  />

  const errorAlert = 
    <IonAlert 
    isOpen={showError}
    onDidDismiss={() => setShowError(false)}
    message={'You can only add 2 contributors'}
    buttons={[
        {
          text: 'OK',
          role: 'cancel'
        }
    ]}
    />



if (canEdit) {
  return (
    <div>
    <IonItem>
      <IonLabel slot="start">{user}</IonLabel>
                <IonLabel>
                    <Tooltip title="User has administrative permissions">
                        <IonIcon icon = {buildOutline} hidden={!isAdmin}></IonIcon>
                    </Tooltip>
                </IonLabel>
                <IonLabel>
                    <Tooltip title="User has collaborator permissions">
                        <IonIcon icon = {peopleOutline} hidden={!isContributor}></IonIcon>
                    </Tooltip>
                </IonLabel>
                <IonLabel>
                    <Tooltip title="User has observer permissions">
                        <IonIcon icon = {eyeOutline}></IonIcon>
                    </Tooltip>
                </IonLabel>
        <IonButton fill="clear" slot="end" onClick={() => setShowPermissions(true)}>
          Edit Permissions
        </IonButton>
    </IonItem>
    {alert}
    {errorAlert}
    </div>
  );
} else {
  return (
    <div>
    <IonItem>
        <IonLabel>{user}</IonLabel>
        <IonButton fill="clear" slot="end" onClick={() => setShowPermissions(true)} disabled>
        Edit Permissions
        </IonButton>
    </IonItem>
    {alert}
    {errorAlert}
    </div>
  );
}
}

export default SettingsUser;