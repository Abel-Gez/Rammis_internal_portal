from django.db import models

from access_control.models import VisibilityLevel
from departments.models import Department
from django.conf import settings


User = settings.AUTH_USER_MODEL

class BaseContent(models.Model):
    title = models.CharField(max_length=255)

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    visibility_level = models.ForeignKey(
        VisibilityLevel,
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_created"
    )  
    
    archived = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

