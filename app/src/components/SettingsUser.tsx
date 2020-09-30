import {
    IonButton,
    IonItem,
    IonLabel,
    IonModal,
    IonList,
    IonAlert,
    IonIcon
} from '@ionic/react';
import { eyeOutline, peopleOutline, buildOutline} from 'ionicons/icons';
import React, { useState } from 'react';
import { Tooltip } from '@material-ui/core';

interface ContainerProps {
    user: string;
    admin: boolean;
    contributor: boolean;
}


const SettingsUser: React.FC<ContainerProps> = ({ user, admin, contributor }) => {

    const [showPermissions, setShowPermissions] = useState(false);


    return (
        <div>
            <IonItem >
                <IonLabel slot="start">{user}</IonLabel>
                <IonLabel>
                    <Tooltip title="User has administrative permissions">
                        <IonIcon icon = {buildOutline} hidden={!admin}></IonIcon>
                    </Tooltip>
                </IonLabel>
                <IonLabel>
                    <Tooltip title="User has collaborator permissions">
                        <IonIcon icon = {peopleOutline} hidden={!contributor}></IonIcon>
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
            <IonAlert
                isOpen={showPermissions}
                onDidDismiss={() => setShowPermissions(false)}
                header={'Assign Privileges:'}
                message={''}
                inputs={[
                    {
                        name: 'labelling',
                        type: 'checkbox',
                        label: 'Allow Labelling',
                    },
                    {
                        name: 'upload',
                        type: 'checkbox',
                        label: 'Allow Upload',
                    },
                    {
                        name: 'newTag',
                        type: 'checkbox',
                        label: 'Can Assign Privileges',
                    }
                ]}
                buttons={[
                    {
                        text: 'Cancel',
                        role: 'cancel'
                    },
                    {
                        text: 'Confirm',
                        handler: (alertData) => {

                        }
                    }
                ]}
            />
        </div>
    );
}

export default SettingsUser;