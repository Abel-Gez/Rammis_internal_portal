from django.contrib import admin

from reports.models import Report, ReportType

# Register your models here.
admin.site.register(ReportType)
admin.site.register(Report)
