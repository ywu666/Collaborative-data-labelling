import {
	IonModal,
	IonButton,
	IonLabel,
	IonIcon,
	IonSkeletonText,
	IonRouterLink,
	IonSegment,
	IonSegmentButton,
	IonAlert,
  useIonViewWillEnter,
} from '@ionic/react';
import { add } from 'ionicons/icons' 
import React, { useState, useEffect } from 'react';
import { documentServices } from '../services/DocumentService'
import { labelServices } from '../services/LabelServices'
import { isNullOrUndefined } from 'util';
import { TableBody, TableCell, TableHead, Table, TableFooter, TableRow, TablePagination, TableContainer, Paper } from '@material-ui/core';

import './DocumentList.css'

interface DocumentListProps {
  name: string,
  currentUser: any,
  firebase: any
}

const DocumentList: React.FC<DocumentListProps> = (props:DocumentListProps) => {
	const {
		name,
		currentUser,
		firebase,
	} = props;
	const [page, setPage] = useState(0);
	const [page_size, setPageSize] = useState(10);
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

	useIonViewWillEnter(() => {
		setLoading(true)
        labelServices.getLabels(name,firebase)
		.then(data => {
			setLabels(data)
		})
		documentUpdate()
	},[]);

	useEffect(() => {
		documentUpdate()
	}, [page, page_size, filter])

	const documentUpdate = () => {
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
	}

	useEffect(() => {
		documentServices.getNumberOfUnlabelledDocs(name, firebase)
		.then(data => {
			console.log(data)
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

		if (contributor.some(e => e.email === email)) {
			let contributor_temp = contributor
			contributor_temp.find(e => e.email === email).number_unlabelled = contributor_temp.find(e => e.email === email).number_unlabelled - 1
			setContributor(contributor_temp)
		}

		documentServices.postDocumentLabel(name, documentIndex, localStorage.getItem("email"), label._id, firebase)
		.then(() => { 
			documentServices.getNumberOfUnlabelledDocs(name, firebase)
			.then(data => {
			  setContributor(data)
			})
			return documentServices.getDocument(name, documentIndex, firebase)
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
			if (e === "Label already confirmed") {
				error.error = e
			}
			setDocError(err => [...err, error])
		})
		setShowModal(false)
	}

	const documentItem = (doc: any, index: any) => {
		let email = localStorage.getItem("email")
		let error = docError?.find(e => e.doc_id === doc._id)
		let user_label = labels?.find(e => e._id === doc.user_and_labels?.find((e: { email: any | null; }) => e.email === email)?.label)
		let user_label_confirmed = doc.user_and_labels?.find((e: { email: any | null; }) => e.email === email)?.label_confirmed
		let total_unlabelled = 0

		contributor.forEach(e => {
			total_unlabelled = total_unlabelled + e.number_unlabelled;
		})
		
		return (
			<TableRow key = {index} >
				<TableCell colSpan={1}>
					<IonLabel>
						{doc.display_id ?? doc._id}
					</IonLabel>
				</TableCell>
				<TableCell colSpan={5}>
					<IonLabel>
						{ (total_unlabelled <= 0)
						? <IonRouterLink color="dark" routerLink={"/project/" + name + "/document/" + doc._id}>{doc.data}</IonRouterLink>
						: <p className="document-text" onClick={() => setShowDocAlert(true)}>{doc.data}</p>}
					</IonLabel>
					{!isNullOrUndefined(error) && <IonLabel color="danger" slot="end">{error.error}</IonLabel>}
				</TableCell>
				<TableCell colSpan={2}>
					{isNullOrUndefined(email)
						? <div/>
						: currentUser.isContributor
							? isNullOrUndefined(user_label)
								? <IonButton fill="outline" slot="end" onClick={() => renderLabelModal(doc._id)}><IonIcon icon={add}/></IonButton>
								: user_label_confirmed
									? <IonButton disabled={true} color="success" fill="outline" slot="end">{user_label.name} </IonButton> 
									: <IonButton fill="outline" slot="end" onClick={() => renderLabelModal(doc._id)}>{user_label.name}</IonButton>
							: <div/>	
					}
				</TableCell>
			</TableRow>
		)
	}

	const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
		setLoading(true)
		setDocuments([])
		setPage(newPage);
	};

	const handleChangePageSize = (event: any) => {
		setLoading(true)
		setDocuments([])
		setPage(0);
		setPageSize(parseInt(event?.target.value, 10));
	};

	const filterOnChange = (value: string) => {
		if (value !== filter) {
			setLoading(true)
			setDocuments([])
			setFilter(value)
			setPage(0)
		}
	}

	return (
		<div className="table">
			<div>
				<IonSegment disabled={!currentUser.isContributor} onIonChange={e => filterOnChange(e.detail.value ?? "")} value={filter}>
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
			</div>
			<IonModal cssClass="auto-height" isOpen={showModal} onDidDismiss={e => setShowModal(false)}>
				<div className="inner-content">
					{labels.map((label, i) =>
						<IonButton fill="outline" key={i} slot="start" onClick={() => changeTag(documentIndex, label)}>{label.name}</IonButton>
					)}
				</div>
			</IonModal>
			<TableContainer component={Paper}>
				<Table size="small">
        			<TableHead className="user-table-head">
        				<TableRow className="add-user">
        				    <TableCell colSpan={1}>
								Id
        				    </TableCell>
        				    <TableCell colSpan={5}>
								Document
        				    </TableCell>
							{currentUser.isContributor
							? <TableCell colSpan={2}>
								Labels
							</TableCell>
							: <div/>	
							}
          				</TableRow>
					</TableHead>
					<TableBody>
						{loading
						? <TableRow>
							<IonSkeletonText animated style={{ width: '100%' }}></IonSkeletonText>
						</TableRow>
						: isNaN(count) || count === 0
							? <TableRow className="center-align"> No Documents to show</TableRow>
							:documents?.map((doc, index) =>
								documentItem(doc, index)
							)}
					</TableBody>
			
					<TableFooter>
          				<TableRow>
							<TableCell>
								Number of Documents: {count ?? 0}
							</TableCell>
          					<TablePagination
          						count={count ?? 0}
          						rowsPerPage={page_size}
          						rowsPerPageOptions={[10,20,50,100]}
          						page={page}
								onChangePage={handleChangePage}
								onChangeRowsPerPage={handleChangePageSize}
          					/>
          				</TableRow>
        			</TableFooter>
				</Table>
			</TableContainer>

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