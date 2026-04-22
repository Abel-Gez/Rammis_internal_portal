from django.db import models
from django.conf import settings
from access_control.base_models import BaseContent


User = settings.AUTH_USER_MODEL


class ReportType(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Report(BaseContent):
    file = models.FileField(upload_to="reports/", null=True, blank=True)
    description = models.TextField(null=True, blank=True)

    reporting_period_start = models.DateField(blank=True, null=True)
    reporting_period_end = models.DateField(blank=True, null=True)

    report_type = models.ForeignKey(
        ReportType, null=True, blank=True,
        on_delete=models.PROTECT
    )

    version = models.PositiveIntegerField(default=1)


    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title