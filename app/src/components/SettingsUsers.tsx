import {
    IonButton,
    IonAlert,
    IonItem,
    IonLabel,
    IonModal,
    IonList
  } from '@ionic/react';
import React, {useState} from 'react';

interface ContainerProps {
    users: string[];
}

const SettingsTags: React.FC<ContainerProps> = ({ users }) => {
    const [showUserModal, setShowUserModal] = useState(false);
    const [newTag, setNewTag] = useState<string>();

    const allusers = ["one", "two", "four"];

  return (
    <div className="container">
      <h2>Users</h2>
          {users.map((user, index) => {
            return (
            <IonItem>
                <IonLabel>{user}</IonLabel>
                <IonButton slot="end">Permissions</IonButton>
            </IonItem>
            );
          })}

        <IonButton size="small" color="light" fill="solid" onClick={() => setShowUserModal(true)}>
            + Add user
        </IonButton>

          <IonModal isOpen={showUserModal}>
              <IonList>
              {allusers.map((user, index) => {
                  return (
                      <IonItem button onClick={() => {}}>{user}</IonItem>
                  );
              })}
              </IonList>
              <IonButton onClick={() => setShowUserModal(false)}>Close</IonButton>
        </IonModal>
    </div>
  );
};

export default SettingsTags;
