from django.db import models
from access_control.base_models import BaseContent


class Document(BaseContent):
    file = models.FileField(upload_to="documents/")
    description = models.TextField(blank=True, null=True)

    document_type = models.CharField(max_length=100, blank=True, null=True)

    # Optional (Enterprise)
    tags = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title