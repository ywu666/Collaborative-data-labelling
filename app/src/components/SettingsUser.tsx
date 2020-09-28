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
    firebase:any
}


const SettingsUser: React.FC<ContainerProps> = ({ project, user, isContributor, isAdmin, firebase }) => {

    const [showPermissions, setShowPermissions] = useState(false);

    // set perms here
    function setPermissions() {
          projectServices.setUserPermissions(project, user, isAdmin, isContributor, firebase);
        }

    return (
        <div>

            <IonItem>
                <IonLabel>{user}</IonLabel>
                <IonButton fill="clear" slot="end" onClick={() => setShowPermissions(true)}>
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
        </div>
    );
}

export default SettingsUser;