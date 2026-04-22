from django.db import models

from access_control.base_models import BaseContent

# Create your models here.
class News(BaseContent):
    content = models.TextField()
    image = models.ImageField(upload_to="news/", null=True, blank=True)
    published_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["-published_date"]

    def __str__(self):  
        return self.title