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
import { TableBody, TableCell, TableHead, Table, TableFooter, TableRow, TablePagination } from '@material-ui/core';

import '../pages/SettingsPage.css';

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

  const [page, setPage] = React.useState(0);
  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="container">

      <Table size="small">
        <TableHead className="user-table-head">
          <TableCell><IonLabel>User Email</IonLabel></TableCell>
          <TableCell colSpan={3} align="center"><IonLabel>Permissions</IonLabel></TableCell>
          <TableCell></TableCell>
        </TableHead>
        <TableBody>
          {(users.slice(page * 5, page * 5 + 5)
          ).map((user, i: number) => {
            return (
              <SettingsUser key={i} project={project} user={user.email}
                isAdmin={user.isAdmin} isContributor={user.isContributor} canEdit={canEdit}
                firebase={firebase}></SettingsUser>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow className="add-user">
            <TableCell colSpan={4}>
              <IonInput value={newUser} type="text" placeholder="Enter user email..." onIonChange={e => setNewUser(e.detail.value!)}></IonInput>
            </TableCell>
            <TableCell align="right">
              <IonButton disabled={newUser == "" || newUser == null} size="small" fill="clear" onClick={() => {
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
                + Add User
              </IonButton>
            </TableCell>
          </TableRow>
          <TableRow>
            <TablePagination
              colSpan={5}
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
    </div>
  );
};

export default SettingsUsers;
