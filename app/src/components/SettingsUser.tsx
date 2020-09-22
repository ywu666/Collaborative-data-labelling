import {
    IonButton,
    IonItem,
    IonLabel,
    IonModal,
    IonList,
    IonAlert
} from '@ionic/react';
import React, { useState } from 'react';

interface ContainerProps {
    user: string;
}


const SettingsUser: React.FC<ContainerProps> = ({ user }) => {

    const [showPermissions, setShowPermissions] = useState(false);


    return (
        <div>

            <IonItem>
                <IonLabel>{user}</IonLabel>
                <IonButton slot="end" onClick={() => setShowPermissions(true)}>
                    Permissions
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