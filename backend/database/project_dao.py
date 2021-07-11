from database.user_dao import get_user_from_database_by_email
from enums.user_role import UserRole
from database.model import Collaborator, Project


def get_project_by_name(name):
    try:
        project = Project.objects(project_name=name).get_or_404()
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
    project = Project.objects(id=project_id).only('collaborators').paginate(page=page, per_page=page_limite)
    collaborators = project.items[0].collaborators
    return collaborators


def get_projects_names_of_the_user(requestor_email):
    db_ser = get_user_from_database_by_email(requestor_email)
    return db_ser.projects


def get_owner_of_the_project(project):
    owner = list(filter(lambda collaborator: collaborator.role.value == 'owner', project.collaborators))[0]
    return owner.user

