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
	const [count, setCount] = useState(0);
	const [labels, setLabels] = useState<any[]>([]);
  const [documentIndex, setDocumentIndex] = useState("");
  const [showModal, setShowModal] = useState(false);
	const [newDocument, setNewDocument] = useState<any>();
	const [docError, setDocError] = useState<any[]>([]);

  useEffect(() => {
    documentServices.getDocumentIds(name, page, page_size)
    .then(data => {
			console.log(data)
			setDocuments(data.docs)
			setCount(data.count)
    })
  }, [page])
	
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
		let doc = documents.find(e => e._id == documentIndex)
		let email = localStorage.getItem("email")

		if (doc.user_and_labels.some((e: { email: string | null; }) => e.email === email))
			doc.user_and_labels.find((e: { email: string | null; }) => e.email === email).label = label._id 

		else doc.user_and_labels.push({'email': email, 'label':label._id})

		setNewDocument(doc)

		documentServices.postDocumentLabel(name, documentIndex, localStorage.getItem("email"), label._id)
		.then(() => { 
			return documentServices.getDocument(name, documentIndex)
		})
		.then(data => {
			data.id = documentIndex
			setNewDocument(data)
			setDocError(err => err.filter(e => e.doc_id !== documentIndex))
		})
		.catch(e => {
			let error = {
				'doc_id':documentIndex,
				'error':'There was an error updating label'
			}
			setDocError(err => [...err, error])
		})
		setShowModal(false)
	}

	const documentItem = (doc: any, index: any) => {
		let email = localStorage.getItem("email")
		let document = documents.find(e => e._id === doc._id)
		let error = docError.find(e => e.doc_id === doc._id)
		let user_label = labels.find(e => e._id === document.user_and_labels.find((e: { email: any | null; }) => e.email === email)?.label)
		
		return (
			<IonItem key = {index}>
				<IonLabel>{document?.data}</IonLabel>
				{!isNullOrUndefined(error) && <IonLabel color="danger" slot="end">{error.error}</IonLabel>}
				{isNullOrUndefined(email)
				? <div/>
				:	isNullOrUndefined(user_label)
					? <IonButton fill="outline" slot="end" onClick={() => renderLabelModal(document.id)}><IonIcon icon={add}/></IonButton>
					: <IonButton fill="outline" slot="end" onClick={() => renderLabelModal(document.id)}>{user_label.name}</IonButton>
				}
			</IonItem>
		)
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
				{documents.length !== 0
				? documents.map((doc, index) =>
						documentItem(doc, index)
				)
				:<IonItem>
					<IonSkeletonText animated style={{ width: '100%' }}></IonSkeletonText>
				</IonItem>
				}
			</IonList>
			<p className="item_count" color="medium">Number of Documents: {count}</p>
		</div>
	)
}

export default DocumentList;