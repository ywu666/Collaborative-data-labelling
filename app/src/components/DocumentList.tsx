import {
	IonModal,
	IonButton,
	IonList,
	IonItem,
	IonLabel,
	IonIcon,
	IonSkeletonText,
	IonRouterLink,
	IonText,
	IonInput,
	IonCol,
	IonRow,
	IonSegment,
	IonSegmentButton,
	IonAlert
} from '@ionic/react';
import { add, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons' 
import React, { useState, useEffect } from 'react';
import { documentServices } from '../services/DocumentService'
import { labelServices } from '../services/LabelServices'
import { isNullOrUndefined } from 'util';
import './DocumentList.css'

interface DocumentListProps {
  name: string,
  page_size: number,
  currentUser: any,
  firebase: any
}

const DocumentList: React.FC<DocumentListProps> = (props:DocumentListProps) => {
	const {
		name,
		page_size,
		currentUser,
		firebase,
	} = props;
	
  const [page, setPage] = useState(0);
	const [documents, setDocuments] = useState<any[]>([]);
	const [count, setCount] = useState(0);
	const [labels, setLabels] = useState<any[]>([]);
	const [documentIndex, setDocumentIndex] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [newDocument, setNewDocument] = useState<any>();
	const [docError, setDocError] = useState<any[]>([]);
	const [contributor, setContributor] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("all")
	const [showDocAlert, setShowDocAlert] = useState(false)

	useEffect(() => {
		if (filter === "unlabelled") {
			documentServices.getUnlabelledDocuments(name, page, page_size)
			.then(data => {
				setDocuments(data.docs)
				setCount(data.count)
				setLoading(false)
			})
		}
		else if (filter === "unconfirmed") {
			documentServices.getUnconfirmedDocuments(name, page, page_size)
			.then(data => {
				console.log(data)
				setDocuments(data.docs)
				setCount(data.count)
				setLoading(false)
			})
		} else {
			documentServices.getDocumentIds(name, page, page_size, firebase)
			.then(data => {
				setDocuments(data.docs)
				setCount(data.count)
				setLoading(false)
			})
		}
	}, [page, filter])
	
	useEffect(() => {
		labelServices.getLabels(name,firebase)
		.then(data => {
			setLabels(data)
		})
	}, [])

	useEffect(() => {
		documentServices.getNumberOfUnlabelledDocs(name)
		.then(data => {
		  setContributor(data)
		})
	}, [])

	useEffect(() => {
		setDocuments(
			documents.map((e) => {
				if (e._id === newDocument._id) return newDocument
				else return e 
			})
		)
	}, [newDocument])

	const renderLabelModal = (id:string) => {
		setShowModal(true)
		setDocumentIndex(id)
	}

	const changeTag = (documentIndex:any, label:any) => {
		let doc = documents.find(e => e._id === documentIndex)
		let email = localStorage.getItem("email")

		if (doc.user_and_labels.some((e: { email: string | null; }) => e.email === email))
			doc.user_and_labels.find((e: { email: string | null; }) => e.email === email).label = label._id 

		else doc.user_and_labels.push({'email': email, 'label':label._id})
		
		setNewDocument(doc)

		documentServices.postDocumentLabel(name, documentIndex, localStorage.getItem("email"), label._id, firebase)
		.then(() => { 
			return documentServices.getDocument(name, documentIndex, firebase)
		})
		.then(data => {
			console.log(data)
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
		let error = docError.find(e => e.doc_id === doc._id)
		let user_label = labels.find(e => e._id === doc.user_and_labels.find((e: { email: any | null; }) => e.email === email)?.label)

		return (
			<IonItem key = {index} >
				<IonLabel>
					{currentUser.isAdmin || (currentUser.isContributor && contributor.find(e => e.email === email)?.number_unlabelled === 0) || (!currentUser.isContributor && !currentUser.isAdmin)
					? <IonRouterLink color="dark" routerLink={"/project/" + name + "/document/" + doc._id}>{doc.data}</IonRouterLink>
					: <p className="document-text" onClick={() => setShowDocAlert(true)}>{doc.data}</p>}
				</IonLabel>
				{!isNullOrUndefined(error) && <IonLabel color="danger" slot="end">{error.error}</IonLabel>}
				{isNullOrUndefined(email)
					? <div/>
					: currentUser.isContributor
						? isNullOrUndefined(user_label)
							? <IonButton fill="outline" slot="end" onClick={() => renderLabelModal(doc._id)}><IonIcon icon={add}/></IonButton>
							: <IonButton fill="outline" slot="end" onClick={() => renderLabelModal(doc._id)}>{user_label.name}</IonButton>
						: <div/>	
				}
			</IonItem>
		)
	}

	const beforePage = () => {
		setLoading(true)
		setDocuments([])
		setPage(page - 1)
	}

	const nextPage = () => {
		setLoading(true)
		setDocuments([])
		setPage(page + 1)
	}

	const onPageNumberChange = (e: any) => {
		let v = parseInt(e.detail.value)
		if (v > Math.trunc(count/page_size)+1) {
			v = Math.trunc(count/page_size)+1
		} else if (v <= 0) {
			v = 1
		}

		if (!isNaN(v)) {
			if ((v - 1) !== page) {
				setLoading(true)
				setDocuments([])
			}
			setPage(v - 1)
		}
	}

	const filterOnChange = (value: string) => {
		if (value !== filter) {
			setLoading(true)
			setDocuments([])
			setFilter(value)
		}
	}

	return (
		<div>
			<div>
				{currentUser.isContributor
				?<IonSegment onIonChange={e => filterOnChange(e.detail.value ?? "")}>
					<IonSegmentButton value="all">
						<IonLabel>All</IonLabel>
					</IonSegmentButton>
					<IonSegmentButton value="unlabelled">
						<IonLabel>Unlabelled</IonLabel>
					</IonSegmentButton>
					<IonSegmentButton value="unconfirmed">
						<IonLabel>Unconfirmed</IonLabel>
					</IonSegmentButton>
				</IonSegment>
				:<></>}
				
			</div>
			<IonModal cssClass="auto-height" isOpen={showModal} onDidDismiss={e => setShowModal(false)}>
				<div className="inner-content">
					{labels.map((label, i) =>
						<IonButton fill="outline" key={i} slot="start" onClick={() => changeTag(documentIndex, label)}>{label.name}</IonButton>
					)}
				</div>
			</IonModal>
			<IonList>
				{loading
				? <IonItem>
					<IonSkeletonText animated style={{ width: '100%' }}></IonSkeletonText>
				</IonItem>
				:documents?.map((doc, index) =>
					documentItem(doc, index)
				)}
			</IonList>
			<IonItem lines="none">
				<IonText slot="start" color="medium">
					Number of Documents: {count}
				</IonText>
			</IonItem>
			<IonRow>
				<IonCol>
					<IonButton disabled={page <= 0} size="small" fill="clear" onClick={()=>beforePage()}><IonIcon icon={chevronBackOutline}/></IonButton>
				</IonCol>
				<IonCol>
					<IonInput debounce={800} max={(Math.trunc(count/page_size)+1).toString()} min={"1"} onIonChange={e => onPageNumberChange(e)} type="number" value={page + 1}/>
				</IonCol>
				<IonCol>
					<div className="text-align-bottom">
						/
					</div>
				</IonCol>
				<IonCol>
					<div className="text-align-bottom">
						{Math.trunc(count/page_size)+1}
					</div>
				</IonCol>
				<IonCol>
					<IonButton disabled={page >= Math.trunc(count/page_size)} size="small" fill="clear" onClick={()=>nextPage()}><IonIcon icon={chevronForwardOutline}/></IonButton>
				</IonCol>
			</IonRow>

			<IonAlert
				isOpen={showDocAlert}
				onDidDismiss={() => setShowDocAlert(false)}
				message={'All contributors must finish labelling all documents first.'}
				buttons={[
					{
						text: 'OK',
						role: 'cancel'
					}
				]}
			/>

		</div>
	)
}

export default DocumentList;