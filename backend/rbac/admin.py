from django.contrib import admin
from .models import Module, Permission


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ("id", "name")


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ("id", "module", "action")
    list_filter = ("module", "action")