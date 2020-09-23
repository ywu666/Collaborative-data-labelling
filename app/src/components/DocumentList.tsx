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

interface DocumentListProps {
	name: string,
  page: number,
  page_size: number
}

const DocumentList: React.FC<DocumentListProps> = (props:DocumentListProps) => {
  const {
		name,
	  page,
  	page_size
	} = props;
	
  const [documents, setDocuments] = useState<any[]>([]);
	const [document_ids, setDocumentsIds] = useState<any[]>([]);
	const [labels, setLabels] = useState<any[]>([]);
  const [documentIndex, setDocumentIndex] = useState("");
  const [showModal, setShowModal] = useState(false);
	const [newDocument, setNewDocument] = useState<any>();

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
				data.id = child._id
				setDocuments(doc => [...doc, data])
      })
    }
	}, [document_ids])
	
	useEffect(() => {
		labelServices.getLabels(name)
		.then(data => {
			setLabels(data)
		})
	}, [])

	useEffect(() => {
		setDocuments(
			documents.map((e) => {
				if (e.id === newDocument.id) return newDocument
				else return e 
			})
		)
	}, [newDocument])

  const renderLabelModal = (id:string) => {
    setShowModal(true)
    setDocumentIndex(id)
  }

  const changeTag = (documentIndex:any, label:any) => {
		documentServices.postDocumentLabel(name, documentIndex, localStorage.getItem("email"), label._id)
		.then(() => { return documentServices.getDocument(name, documentIndex) })
		.then(data => {
			data.id = documentIndex
			return data
		})
		.then(data => {
			setNewDocument(data)
		})
		setShowModal(false)
	}

	const documentItem = (doc_id: any, index: any) => {
		let email = localStorage.getItem("email")
		if (documents.some(e=> e.id === doc_id._id)) {
			let document = documents.find(e => e.id === doc_id._id)
			let user_label = labels.find(e => e._id === document.user_and_labels.find((e: { email: any | null; }) => e.email === email)?.label)
			
			return (
				<IonItem key = {index}>
					<IonLabel>{document.data}</IonLabel>
					{isNullOrUndefined(email)
					? <div/>
					:	isNullOrUndefined(user_label)
						? <IonButton fill="outline" slot="end" onClick={() => renderLabelModal(document.id)}><IonIcon icon={add}/></IonButton>
						: <IonButton fill="outline" slot="end" onClick={() => renderLabelModal(document.id)}>{user_label.name}</IonButton>
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
						<IonButton fill="outline" key={i} slot="start" onClick={() => changeTag(documentIndex, label)}>{label.name}</IonButton>
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