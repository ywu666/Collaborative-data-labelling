import {
    IonButton,
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

    const allusers = ["user1", "user2", "user3"]; //TODO: backend

    function addUser(user: string) {
        users.push(user); //TODO: backend
        setShowUserModal(false)
      }

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
          <IonItem text-align="center"><h3>Add user to project</h3></IonItem>
              <IonList>
              {allusers.map((user, index) => {
                  if (!users.includes(user)) {
                      return (
                          <IonItem button onClick={() => { addUser(user) }}>{user}</IonItem>
                      );
                  }
              })}
              </IonList>
              <IonButton onClick={() => setShowUserModal(false)}>Close</IonButton>
        </IonModal>
    </div>
  );
};

export default SettingsTags;
