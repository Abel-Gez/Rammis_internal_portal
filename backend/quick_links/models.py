from django.db import models

# Create your models here.
class QuickLink(models.Model):
    name = models.CharField(max_length=255)
    url = models.URLField()
    icon = models.CharField(max_length=255, blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name