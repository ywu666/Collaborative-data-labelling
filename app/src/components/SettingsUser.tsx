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
                <IonLabel><IonIcon icon = {buildOutline} hidden={!admin}></IonIcon></IonLabel>
                <IonLabel><IonIcon icon = {peopleOutline} hidden={!contributor}></IonIcon></IonLabel>
                <IonLabel><IonIcon icon = {eyeOutline}></IonIcon></IonLabel>
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