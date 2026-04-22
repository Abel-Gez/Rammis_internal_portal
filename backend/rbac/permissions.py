from rest_framework.permissions import BasePermission


class HasModulePermission(BasePermission):

    def has_permission(self, request, view):
        
        if request.user.is_superuser:
            return True

        if not request.user.role:
            return False

        required_permission = getattr(view, "required_permission", None)

        if not required_permission:
            return True

        module_name, action = required_permission.split(".")

        return request.user.role.permissions.filter(
            module__name=module_name,
            action=action
        ).exists()