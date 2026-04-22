from django.db import models

# Create your models here.
class VisibilityLevel(models.Model):
    name = models.CharField(max_length=100, unique=True)
    order = models.IntegerField(unique=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name