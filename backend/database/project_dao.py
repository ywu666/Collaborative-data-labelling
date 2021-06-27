from database.user_dao import get_user_from_database_by_email
from flask.globals import request
from enums.user_role import UserRole
from database.model.model import Collaborator, User, Project
from enums.project_state import ProjectState

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
        collaborator.entry_key = project.entry_key
    
    project = Project(**project)
    project.collaborators.append(collaborator)
    project.save()

    db_ser.projects.append(project)
    db_ser.save()

