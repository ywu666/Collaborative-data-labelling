import {
    IonButton,
    IonAlert,
  } from '@ionic/react';
  import React, { useState, useEffect } from 'react';
  import { labelServices } from '../services/LabelServices'
import './SettingsTags.css';

interface ContainerProps {
  project: string;
  firebase:any
}

const SettingsTags: React.FC<ContainerProps> = ({ project, firebase }) => {
    const [showNewTag, setShowNewTag] = useState(false);
    const [showUpdateTag, setShowUpdateTag] = useState(false);

    const [tagID, setTagID] = useState(0);

  const initialTags = [
    { _id: 0, name: '' }
  ]

  const [tags, setTags] = useState(initialTags);
  useEffect(() => {
    try {
      labelServices.getLabels(project)
      .then(data => {
        setTags(data)
      })
    } catch (e) {
      
    }
  }, [])

  function addTag(tag: string) {
    labelServices.setLabels(project, tag, firebase);
    setTags(tags => [...tags, { _id: 0, name: tag }])
  }

  function updateTag(label_name: string){
    console.log(tagID)
    console.log(label_name)
    labelServices.updateLabel(project, tagID, label_name);
  }

  function updateButtonClick(_id: number){
    setShowUpdateTag(true)
    setTagID(_id)
  }

  return (
    <div className="container">
      <h2>Tags</h2>
      {tags.map((tag) => {
        if (tag.name.length != 0) {
          return (
            <IonButton key={tag.name} fill="outline" size="small" onClick={(e) => updateButtonClick(tag._id)}>{tag.name}</IonButton>
          );
        }
      })}

        <IonButton size="small" fill="clear" onClick={() => setShowNewTag(true)}>
            + Add new tag
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
              if (alertData.newTag.length > 0
                && !tags.some(check => check.name === alertData.newTag)) {
                addTag(alertData.newTag);
              } else {
                alert('Name is invalid');
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
              if (alertData.updateTag.length > 0
                && !tags.some(check => check.name === alertData.updateTag)) {
                //let tag = tags.find(e => e.id === doc_id._id);
                updateTag(alertData.updateTag);
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
