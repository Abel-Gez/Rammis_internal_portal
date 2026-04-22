from django.db import models
from access_control.base_models import BaseContent


class EmploymentType(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Vacancy(BaseContent):
    description = models.TextField(null=True, blank=True)

    requirements = models.TextField(blank=True, null=True)

    responsibilities = models.TextField(blank=True, null=True)

    location = models.CharField(max_length=255, blank=True, null=True)

    employment_type = models.ForeignKey(
        EmploymentType,
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )

    application_deadline = models.DateField(
        blank=True,
        null=True
    )

    posted_date = models.DateField(null=True, blank=True,
        auto_now_add=True
    )

    file = models.FileField(
        upload_to="vacancies/",
        blank=True,
        null=True
    )

    class Meta:
        ordering = ["-posted_date"]

    def __str__(self):
        return self.title