import { IonTabBar, IonTabButton, IonIcon, IonLabel, IonText, useIonViewWillEnter } from '@ionic/react';
import { analytics, folderOpen, pricetags, settings } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { projectServices } from '../../services/ProjectServices';
import { userService } from '../../services/UserServices';
import styles from './ProjectHeader.module.css';

interface ProjectHeaderProps {
    firebase: any
}

const ProjectHeader: React.FC<ProjectHeaderProps> = (props: ProjectHeaderProps) => {

    const { id } = useParams<{ id: string }>();
    const { firebase } = props;
    const [project, setProject] = useState({
        '_id': '',
        'owner': '',
        'name': '',
        'state': '',
        'encryption_state': ''
    });
    const [labellingSituation, setLabellingSituation] = useState({
        "agreed_number": 0,
        "not_agreed_number": 0,
        "analysed_number": 0,
        "total_number": 0
    });
    
    const [currentUser, setCurrentUser] = useState<any>({
        '_id': '',
        'isAdmin': false,
        'isContributor': false
    });

    useEffect(() => {
        try {
            projectServices.getDescriptionOfAProject(firebase, id)
                .then(data => {
                    setProject(data);
                })
        } catch (e) { 
            console.log(e);
        }
    }, [])

    useEffect(() => {
        try {
            console.log("use effect called")
            projectServices.getProjectAgreementScore(id, firebase)
                .then(data => {
                    setLabellingSituation(data);
                })
        } catch (e) {
            console.log(e);
        }
    }, []);

    useIonViewWillEnter(() => {
        userService.getCurrentProjectUser(id)
            .then(data => {
                setCurrentUser(data)
            })
    }, []);

    const getProjectAgreementScore = () => {
        let agreed_number = (labellingSituation.agreed_number / labellingSituation.analysed_number) * 100;
        if (labellingSituation.total_number != labellingSituation.analysed_number) {
            return "labelling is not finished";
        } else if (agreed_number < 1) {
            return 'Agreement score: ~0%';
        } else if (agreed_number > 99) {
            return 'Agreement score: ~100%';
        } else {
            return 'Agreement score: ' + Math.round(agreed_number).toString() + '%';
        }
    }
    
    return (
        <div className={styles.projectDiv}>
            <div className={styles.headerDiv}>
                <IonIcon icon={folderOpen} className={styles.folderIcon}/>
                <IonText className={styles.projectName}>
                    {project.owner + "/" + project.name + " (" + getProjectAgreementScore() + ") "}
                </IonText>
            </div>

            <IonTabBar className={styles.tabBar}>
                <IonTabButton tab="tab1" href={`/project/${id}/labelling`} className={styles.tabButton}>
                    <IonIcon icon={pricetags} className={styles.tabIcon}/>
                    <IonLabel className={styles.tabLabel}>Labelling</IonLabel>
                </IonTabButton>
                <IonTabButton 
                    tab="tab3" href={`/project/${id}/setting`} 
                    className={styles.tabButton}
                    disabled={!currentUser.isAdmin}
                >
                    <IonIcon icon={settings} className={styles.tabIcon}/>
                    <IonLabel className={styles.tabLabel}>Settings</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </div>
    );
};

export default ProjectHeader;
