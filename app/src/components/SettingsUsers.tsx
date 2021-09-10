import {
  IonButton,
  IonLabel,
  IonAlert,
  IonInput,
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import SettingsUser from '../components/SettingsUser';
import { projectServices } from '../services/ProjectServices'
import { userService } from '../services/UserServices'
import {
  TableBody,
  TableCell,
  TableHead,
  Table,
  TableFooter,
  TableRow, TablePagination,
  TableContainer,
  Paper
}
  from '@material-ui/core';

import './Project/ProjectSettings.css';
import { EncryptionServices } from '../services/EncryptionService';

interface ContainerProps {
  project: string;
  firebase: any
}

const SettingsUsers: React.FC<ContainerProps> = ({ project, firebase }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [newUser, setNewUser] = useState<string>();

  const [page, setPage] = React.useState(0);
  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };
  
    var canEdit = true; // can the current user edit permissions?

    const initialUsers = [
        { id: 0, email: 'No users', isAdmin: false, isContributor: false }
    ]

    const [users, setUsers] = useState(initialUsers);
    useEffect(() => {
      try {
        projectServices.getProjectUsers(project, firebase, page, 5)
        .then(data => {
          setUsers(data)
        })
    } catch (e) {
    }
  }, [])

  function addUser(user: string) {
    try {
      // check if user exists
      userService.getUser(user)
      .then(async () => {
        const isEncrypted = await projectServices.isProjectEncrypted(project, firebase);
        if (isEncrypted) {
          // get public key for the collaborator, this will throw exception if collaborator does 
          // not have a key 
          const collaboratorKey = await EncryptionServices.getUserKeys(firebase, user)
          projectServices.setProjectUsers(project, user, firebase, collaboratorKey.public_key);
        }
        else {
          projectServices.setProjectUsers(project, user, firebase);
        }
        setUsers([...users, {id: 0, email: user, isAdmin: false, isContributor: false}])
        setNewUser("")
      })
      .catch(e => {
        // TODO: handle the situation when the collaborator does not have account
        // TODO: handle the situation when collaborator does not have key 
        setErrorMessage(e);
        setShowAlert(true);
      })

    } catch (e) {
    }
  }

  return (
    <TableContainer component={Paper}>

      <Table size="small">
        <TableHead className="user-table-head">
        <TableRow className="add-user">
            <TableCell colSpan={5}>
              <IonInput value={newUser}
                        type="text"
                        placeholder="Enter user email..."
                        onIonChange={e => setNewUser(e.detail.value!)}/>
            </TableCell>
            <TableCell align="right">
              <IonButton disabled={newUser == "" || newUser == null} size="small" fill="clear" onClick={() => {
                if (typeof newUser !== 'undefined' && newUser) {
                  if (users.some(check => check.email === newUser)) {
                    setErrorMessage('User has already been added');
                    setShowAlert(true);
                  } else {
                    addUser(newUser)
                  }
                } else {
                  setErrorMessage('Please enter a user email');
                  setShowAlert(true);
                }
              }}>
                + Add
              </IonButton>
            </TableCell>
          </TableRow>
        <TableCell><IonLabel>User Name</IonLabel></TableCell>
          <TableCell><IonLabel>User Email</IonLabel></TableCell>
          <TableCell colSpan={3} align="center"><IonLabel>Permissions</IonLabel></TableCell>
          <TableCell></TableCell>
        </TableHead>
        <TableBody>
          {(users.slice(page * 5, page * 5 + 5)
          ).map((user, i: number) => {
            return (
              <SettingsUser key={i}
                            project={project}
                            user={user.email}
                            isAdmin={user.isAdmin}
                            isContributor={user.isContributor}
                            canEdit={canEdit}
                            firebase={firebase}/>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              colSpan={6}
              count={users.length}
              rowsPerPage={5}
              rowsPerPageOptions={[5]}
              page={page}
              onChangePage={handleChangePage}
            />
          </TableRow>
        </TableFooter>
      </Table>

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
    </TableContainer>
  );
};

export default SettingsUsers;
