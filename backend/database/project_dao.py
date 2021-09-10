from database.user_dao import get_user_from_database_by_email
from enums.user_role import UserRole
from database.model import Collaborator, Project, Data, DataLabelResult


def get_project_by_name(name):
    try:
        project = Project.objects(project_name=name).get_or_404()
        return project
    except:
        return None


def get_project_by_id(id):
    try:
        project = Project.objects(id=id).get_or_404()
        return project
    except:
        return None


def create_new_project(requestor_email, project, encryption_key=None):
    db_ser = get_user_from_database_by_email(requestor_email)
    collaborator = Collaborator(user=db_ser, role=UserRole.OWNER)
    if encryption_key is not None:
        collaborator.entry_key = encryption_key

    project = Project(**project)
    project.collaborators.append(collaborator)
    project.save()

    db_ser.projects.append(project)
    db_ser.save()


def get_all_users_associated_with_a_project(project_id):
    try:
        project = Project.objects(id=project_id).get_or_404()
        collaborators = project.collaborators
        return collaborators
    except:
        return None


def get_users_associated_with_a_project(project_id, page, page_limite):
    collaborators = Project.objects(id=project_id).fields(slice__collaborators=[page * page_limite, page_limite]).get().collaborators
    return collaborators


def add_collaborator_to_encrypt_project(project_id, db_collaborator, en_entry_key):
    project = Project.objects(id=project_id).get()
    collaborator = Collaborator(
        user=db_collaborator, role=UserRole.READER, entry_key=en_entry_key)
    project.collaborators.append(collaborator)
    project.save()

    db_collaborator.projects.append(project)
    db_collaborator.save()


def add_collaborator_to_project(project_id, db_collaborator):
    project = Project.objects(id=project_id).get()
    collaborator = Collaborator(user=db_collaborator, role=UserRole.READER)
    project.collaborators.append(collaborator)
    project.save()

    db_collaborator.projects.append(project)
    db_collaborator.save()


def change_collaborator_permission(project_id, email, permission):
    project = Project.objects(id=project_id).get()
    collaborator = list(filter(lambda collaborator: collaborator.user.email == email, project.collaborators))[0]
    collaborator.role = permission
    project.save()


def get_all_projects_of_a_user(requestor_email):
    db_user = get_user_from_database_by_email(requestor_email)
    return db_user.projects


def get_owner_of_the_project(project):
    owner = list(filter(lambda collaborator: collaborator.role.value == 'owner', project.collaborators))[0]
    return owner.user


def get_single_document_of_a_project(project_id, document_index):
    data = Project.objects(id=project_id).only('data').get().data[int(document_index)]
    return data


def get_document_of_a_project(project_id, page, page_limite):
    project = Project.objects(id=project_id).fields(
        slice__data=[page * page_limite, page_limite]).get()
    return project.data


def create_new_document(display_id, value):
    document = Data(display_id=display_id, value=value)
    return document


def add_documents_to_database(project, data_array):
    project.data.extend(data_array)
    project.save()


def get_all_labels_of_a_project(project_id):
    project = Project.objects(id=project_id).only('labels').get()
    return project.labels


def is_valid_label(project_id, label):
    labels = Project.objects(id=project_id).only('labels').get().labels

    if len(labels.filter(value=label)) > 0:
        return True

    return False


def is_label_confirmed(project_id, document_index):
    data = Project.objects(id=project_id).get().data[int(document_index)]
    if data.final_label:
        return True
    else:
        return False


def get_all_label_result_for_a_data(project_id, document_index):
    label_results = Project.objects(id=project_id).get().data[int(document_index)].labels
    return label_results


def update_confirmed_label_for_data(project_id, document_index, label):
    db_project = Project.objects(id=project_id).get()
    db_project.data[int(document_index)].final_label = label
    db_project.save()


def update_user_document_label(project_id, document_index, label, requestor_email):
    document_index = int(document_index)
    db_project = Project.objects(id=project_id).get()
    label_results = db_project.data[document_index].labels

    for idx, label_result in enumerate(label_results):
        if requestor_email == label_result.user.email:
            db_project.data[document_index].labels[idx].label = label
            db_project.save()
            return

    new_label_result = DataLabelResult(user=get_user_from_database_by_email(requestor_email), label=label)
    db_project.data[document_index].labels.append(new_label_result)
    db_project.save()


def count_number_of_unlabelled_docs(project_id, requestor_email):
    db_data = Project.objects(id=project_id).only('data__labels').get().data
    count = 0
    for data in db_data:
        labelled = False

        # check if this user labelled this data 
        label_results = data.labels
        for label_result in label_results:
            if label_result.user.email == requestor_email:
                labelled = True
                break

        if not labelled:
            count = count + 1

    return count
