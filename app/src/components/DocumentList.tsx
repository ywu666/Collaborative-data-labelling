import {
	IonModal,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonSkeletonText
} from '@ionic/react';
import { add } from 'ionicons/icons' 
import React, { useState, useEffect } from 'react';
import { documentServices } from '../services/DocumentService'
import { labelServices } from '../services/LabelServices'
import { isNullOrUndefined } from 'util';

const labels: string[] = [
  "tag1",
  "tag2",
  "tag3",
]

interface DocumentListProbs {
	name: string,
  page: number,
  page_size: number
}

const DocumentList: React.FC<DocumentListProbs> = (props:DocumentListProbs) => {
  const {
		name,
	  page,
  	page_size
	} = props;
	
  const [documents, setDocuments] = useState<any[]>([]);
	const [document_ids, setDocumentsIds] = useState<any[]>([]);
	const [labels, setLabels] = useState<any[]>([]);
  const [labelIndex, setLabelIndex] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    documentServices.getDocumentIds(name, page, page_size)
    .then(data => {
      setDocumentsIds(data)
    })
  }, [])

  useEffect(() => {
    for (let child of document_ids) {
      documentServices.getDocument(name, child._id)
      .then(data => {
				console.log(data)
				data.id = child._id
				setDocuments(doc => [...doc, data])
      })
    }
	}, [document_ids])
	
	useEffect(() => {
		labelServices.getLabels(name)
		.then(data => {
			console.log(data)
			setLabels(data)
		})
	}, [])

  const renderLabelModal = (id:string) => {
    setShowModal(true)
    setLabelIndex(id)
  }

  const changeTag = (i:any, label:string) => {
    //TODO: connect with backend to update tags /
    //documents[i].tag = label
    setShowModal(false)
  }

	const documentItem = (doc_id: any, index: any) => {
		let email = localStorage.getItem("email")
		if (documents.some(e=> e.id == doc_id._id)) {
			let document = documents.find(e => e.id == doc_id._id)
			return (
				<IonItem key = {index}>
					<IonLabel>{document.data}</IonLabel>
					{isNullOrUndefined(email)
					? <div/>
					:	document.user_and_labels.length === 0
						? <IonButton fill="outline" slot="end" onClick={() => renderLabelModal(document.index)}><IonIcon icon={add}/></IonButton>
						: <IonButton fill="outline" slot="end" onClick={() => renderLabelModal(document.index)}>{labels.find(e => e._id == document.user_and_labels[0].label).name}</IonButton>
					}
				</IonItem>
			)
		}
		else {
			return (
				<IonItem key = {index}>
					<IonSkeletonText animated style={{ width: '100%' }}></IonSkeletonText>
				</IonItem>
			)
		}
	}

	return (
		<div>
			<IonModal cssClass="auto-height" isOpen={showModal} onDidDismiss={e => setShowModal(false)}>
				<div className="inner-content">
					{labels.map((label, i) =>
						<IonButton fill="outline" key={i} slot="start" onClick={() => changeTag(labelIndex, label)}>{label}</IonButton>
					)}
				</div>
			</IonModal>
			<IonList>
				{document_ids.map((doc_id, index) =>
						documentItem(doc_id, index)
				)}
			</IonList>
		</div>
	)
}

export default DocumentList;