import {
    IonButton,
    IonAlert,
  } from '@ionic/react';
import React, {useState} from 'react';
import './SettingsTags.css';

interface ContainerProps {
  tags: string[];
}

const SettingsTags: React.FC<ContainerProps> = ({ tags }) => {
    const [showNewTag, setShowNewTag] = useState(false);
    const [newTag, setNewTag] = useState<string>();

  return (
    <div className="container">
      <h2>Tags</h2>
          {tags.map((tag, index) => {
            return (
            <IonButton size="small">{tag}</IonButton>
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
                    // test if name is valid, can add more
                    if (alertData.newTag.length > 0) {
                        // add to database here
                        tags.push(alertData.newTag);
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
