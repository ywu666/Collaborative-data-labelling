from enum import Enum

class UserRole(Enum):
    OWNER = 'owner'
    READER = 'reader'
    COLLABORATOR = 'collaborator'