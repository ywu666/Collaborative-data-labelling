import {
    IonButton,
    IonAlert,
  } from '@ionic/react';
  import React, { useState, useEffect } from 'react';
  import { projectServices } from '../services/ProjectServices'
import './SettingsTags.css';

interface ContainerProps {
  project: string;
}

const SettingsTags: React.FC<ContainerProps> = ({ project }) => {
    const [showNewTag, setShowNewTag] = useState(false);

    const initialUsers = [
      { id: 0, label_name: 'No tags'}
  ]

  const [tags, setTags] = useState(initialUsers);
  useEffect(() => {
    try {
      projectServices.getProjectTags(project)
      .then(data => {
        setTags(data)
      })
    } catch (e) {
      
    }
  }, [])

  function addTag(tag: any) {
    projectServices.setProjectTags(project, tag);
  }

  return (
    <div className="container">
      <h2>Tags</h2>
          {tags.map((tag) => {
            return (
            <IonButton key="name" size="small">{tag.label_name}</IonButton>
            );
          })}

        <IonButton size="small" color="light" fill="solid" onClick={() => setShowNewTag(true)}>
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
                || !tags.some(check => check.label_name === alertData.newTag)) {
                addTag(alertData.newTag);
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
