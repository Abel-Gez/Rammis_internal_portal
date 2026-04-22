from django.db import models

# Create your models here.
class Department(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def _str_(self):
        return self.name