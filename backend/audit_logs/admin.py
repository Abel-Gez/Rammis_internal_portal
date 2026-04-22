from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("user", "module", "action", "timestamp")
    list_filter = ("module", "action", "timestamp")
    search_fields = ("user__username", "module")