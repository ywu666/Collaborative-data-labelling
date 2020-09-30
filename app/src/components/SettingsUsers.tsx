import {
  IonButton,
  IonItem,
  IonModal,
  IonList,
  IonLabel,
  IonAlert,
  IonInput,
  IonRow
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import SettingsUser from '../components/SettingsUser';
import { projectServices } from '../services/ProjectServices'
import { userService } from '../services/UserServices'

interface ContainerProps {
  project: string;
  firebase: any
}

const SettingsUsers: React.FC<ContainerProps> = ({ project, firebase }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [newUser, setNewUser] = useState<string>();

    var canEdit = true; // can the current user edit permissions?

    const initialUsers = [
        { id: 0, email: 'No users', isAdmin: false, isContributor: false }
    ]

    const [users, setUsers] = useState(initialUsers);
    useEffect(() => {
      try {
        projectServices.getProjectUsers(project, firebase)
        .then(data => {
          setUsers(data)
        })
    } catch (e) {
    }
  }, [])

    const [allUsers, setAllUsers] = useState(initialUsers);
    useEffect(() => {
      try {
        userService.getAllUsersInDatabase() //change when creating tables of user
        .then(data => {
            setAllUsers(data)
            console.log(data)
        })
    } catch (e) {

    }
  }, [])

  function addUser(user: string) {
    try {
      projectServices.setProjectUsers(project, user, firebase);
      setUsers([...users, {id: 0, email: user, isAdmin: false, isContributor: false}])
      setNewUser("")
    } catch (e) {

    }
  }

  return (
    <div className="container">
      <h2>Users</h2>
        <IonItem>
          <IonLabel slot="start">User Email</IonLabel>
          <IonLabel>Permissions</IonLabel>
          <IonLabel slot="end">Edit Permissions</IonLabel>
        </IonItem>
          {users.map((user, i: number) => {
            return (
                <SettingsUser key={i} project={project} user={user.email} 
                isAdmin={user.isAdmin} isContributor={user.isContributor} canEdit={canEdit}
                firebase={firebase}></SettingsUser>
            );
          })}
        <IonRow>
        <IonInput value={newUser} type="text" placeholder="Enter user email..." onIonChange={e => setNewUser(e.detail.value!)}></IonInput>

        <IonButton disabled={newUser == "" || newUser == null} size="small" fill="outline" onClick={() => {
          if (typeof newUser !== 'undefined' && newUser) {
            if (users.some(check => check.email === newUser)) {
              setErrorMessage('User has already been added');
              setShowAlert(true);
            } else if (!allUsers.some(check => check.email === newUser)) {
              setErrorMessage('User does not exist');
              setShowAlert(true);
            } else {
              addUser(newUser)
            }
          } else {
            setErrorMessage('Please enter a user email');
            setShowAlert(true);
          }
        }}>
          + Add user
        </IonButton>

      </IonRow>

        <IonAlert 
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        message={errorMessage}
        buttons={[
          {
            text: 'OK',
            role: 'cancel'
          }
        ]}/>
    </div>
  );
};

export default SettingsUsers;
