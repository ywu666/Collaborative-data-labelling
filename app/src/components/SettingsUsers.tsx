import {
    IonButton,
    IonAlert,
    IonItem,
    IonLabel
  } from '@ionic/react';
import React, {useState} from 'react';

interface ContainerProps {
    users: string[];
}

const SettingsTags: React.FC<ContainerProps> = ({ users }) => {
    const [showNewTag, setShowNewTag] = useState(false);
    const [newTag, setNewTag] = useState<string>();

  return (
    <div className="container">
      <h2>Users</h2>
          {users.map((user, index) => {
            return (
            <IonItem>
                <IonLabel slot="start">{user}</IonLabel>
                <IonButton slot="end">Permissions</IonButton>
                </IonItem>
            );
          })}

        <IonButton size="small" color="light" fill="solid" onClick={() => setShowNewTag(true)}>
            + Add user
        </IonButton>

        <IonAlert 
        isOpen={showNewTag}
        onDidDismiss={() => setShowNewTag(false)}
        header={'Enter new name:'}
        message={''}
        inputs={[
            { 
            name: 'newTag',
            type: 'text',
            id: 'tagName',
            placeholder: 'New Tag' }
        ]}
        buttons={[
            {
                text: 'Cancel',
                role: 'cancel'
            },
            {
                text: 'Confirm',
                handler: (alertData) => {
                    // test if name is valid, can add more
                    if (alertData.newTag.length > 0) {
                        // add to database here
                    } else {
                        alert('Name is invalid');
                        return false;
                    }
                }
            }
        ]}
        />
    </div>
  );
};

export default SettingsTags;
