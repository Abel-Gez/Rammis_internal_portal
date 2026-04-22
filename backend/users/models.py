from django.db import models
from django.contrib.auth.models import AbstractUser

from access_control.models import VisibilityLevel
from departments.models import Department
from rbac.models import Permission

# Create your models here.

class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    visibility_level = models.ForeignKey(
        "access_control.VisibilityLevel",
        on_delete=models.SET_NULL,
        null=True
    )

    permissions = models.ManyToManyField(
        Permission,
        blank=True
    )

    def __str__(self):
        return self.name

class User(AbstractUser):
    full_name = models.CharField(max_length=255)

    department = models.ForeignKey(Department, 
                                   on_delete=models.SET_NULL, 
                                   null=True,
                                   blank=True,
                                   related_name='users'
                                   )
    

    role = models.ForeignKey(Role, 
                             on_delete=models.SET_NULL, 
                             null=True,
                             related_name='users'
                             )