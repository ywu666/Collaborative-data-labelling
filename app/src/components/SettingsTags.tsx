import {
  IonButton,
  IonAlert
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { labelServices } from '../services/LabelServices';
import {
  TableBody,
  TableCell,
  TableHead,
  Table,
  TableFooter,
  TableRow,
  TablePagination,
  TableContainer,
  Paper } from '@material-ui/core';
import './SettingsTags.css';

interface ContainerProps {
  project: string;
  firebase:any
}

const SettingsTags: React.FC<ContainerProps> = (props: ContainerProps) => {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [showNewTag, setShowNewTag] = useState(false);
  const [showUpdateTag, setShowUpdateTag] = useState(false);
  const [tagID, setTagID] = useState(0);

  const {
    project,
    firebase
  } = props;

  const initialTags = [
    { _id: 0, name: '' }
  ]

  const [tags, setTags] = useState(initialTags);
  useEffect(() => {
    try {
      labelServices.getLabels(project, firebase)
      .then(data => {
        setTags(data)
      })
    } catch (e) {}
  }, [])

  function addTag(tag: string) {
    labelServices.setLabels(project, tag, firebase);
    setTags(tags => [...tags, { _id: 0, name: tag }])
  }

  function updateTag(label_name: string){
    let tag = tags.find(check => check._id === tagID);
    if(tag != undefined){
        tag.name = label_name;
    }
    labelServices.updateLabel(project, tagID, label_name, firebase);
  }

  function updateButtonClick(_id: number){
    setShowUpdateTag(true)
    setTagID(_id)
  }

  const [page, setPage] = React.useState(0);
  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  return (
    <TableContainer component={Paper}>

      <Table size="small">
        <TableHead className="user-table-head">
          <TableRow>
            <TableCell align="center" colSpan={3}>
              <IonButton size="small" fill="clear" onClick={() => setShowNewTag(true)}>
                + Add new label
              </IonButton>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell align="left" colSpan={2}>Name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(tags.slice(page * 5, page * 5 + 5)
          ).map((tag, i: number) => {
            if (tag.name.length != 0) {
              return (
                <TableRow key={i}>
                  <TableCell style={ {width: '60px'} }>{1 + i + page * 5}</TableCell>
                  <TableCell align="left">
                    <IonButton class="tag" fill="outline" size="small" disabled>{tag.name}</IonButton>
                  </TableCell>
                  <TableCell align="right" style={ {width: '60px'} }>
                    <IonButton  fill="clear" size="small" 
                    onClick={(e) => updateButtonClick(tag._id)}>Edit</IonButton>
                  </TableCell>
                </TableRow>
              );
            }
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              colSpan={6}
              count={tags.length}
              rowsPerPage={5}
              rowsPerPageOptions={[5]}
              page={page}
              onChangePage={handleChangePage}
            />
          </TableRow>
        </TableFooter>
      </Table>

      <IonAlert
        isOpen={showError}
        onDidDismiss={() => setShowError(false)}
        message={errorMessage}
        buttons={[
          {
            text: 'OK',
            role: 'cancel'
          }
        ]}
      />

      <IonAlert
        isOpen={showNewTag}
        onDidDismiss={() => setShowNewTag(false)}
        header={'Add new label:'}
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
              if (alertData.newTag == '' || alertData.newTag == null) {
                setErrorMessage('Label cannot be empty');
                setShowError(true);
                return false;
              } else if (!tags.some(check => check.name === alertData.newTag)) {
                addTag(alertData.newTag);
              } else {
                setErrorMessage('A label with this name already exists');
                setShowError(true);
                return false;
              }
            }
          }
        ]}
        />

       <IonAlert
        isOpen={showUpdateTag}
        onDidDismiss={() => setShowUpdateTag(false)}
        header={'Enter new name:'}
        message={''}
        inputs={[
            {
            name: 'updateTag',
            type: 'text',
            id: 'tagName',
            placeholder: 'Update Tag' }
        ]}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Confirm',
            handler: (alertData) => {
              if (alertData.updateTag == '' || alertData.updateTag == null) {
                setErrorMessage('Label cannot be empty');
                setShowError(true);
                return false;
              } else if (!tags.some(check => check.name === alertData.updateTag)) {
                updateTag(alertData.updateTag);
              } else {
                setErrorMessage('A label with this name already exists');
                setShowError(true);
                return false;
              }
            }
          }
        ]}
      />

    </TableContainer>
  );
};

export default SettingsTags;
