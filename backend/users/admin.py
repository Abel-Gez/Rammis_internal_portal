from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from users.models import Role, User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User

    list_display = (
        "username",
        "full_name",
        "email",
        "department",
        "role",
        "is_staff",
        "is_active",
    )

    fieldsets = UserAdmin.fieldsets + (
        (
            "Additional Info",
            {
                "fields": (
                    "full_name",
                    "department",
                    "role",
                )
            },
        ),
    )


admin.site.register(Role)