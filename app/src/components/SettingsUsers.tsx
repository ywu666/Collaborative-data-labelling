import {
  IonButton,
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

    const initialUsers = [
        { id: 0, email: 'No users', isAdmin: false, isContributor: false}
    ]

  const [users, setUsers] = useState(initialUsers);
  useEffect(() => {
    try {
      console.log("firebase " + firebase.auth.currentUser)
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
    console.log("add user " + firebase.auth)
    projectServices.setProjectUsers(project, user, firebase);
  }

  return (
    <div className="container">
      <h2>Users</h2>
          {users.map((user, i: number) => {
            return (
                <SettingsUser key={i} user={user.email} admin={user.isAdmin} contributor={user.isContributor}></SettingsUser>
            );
          })}
        <IonRow>
        <IonInput type="text" placeholder="Enter user email..." onIonChange={e => setNewUser(e.detail.value!)}></IonInput>

        <IonButton size="small" fill="outline" onClick={() => {
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
