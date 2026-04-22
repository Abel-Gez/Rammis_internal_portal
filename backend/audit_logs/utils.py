from .models import AuditLog


def log_action(user, module_name, object_id, action):
    AuditLog.objects.create(
        user=user,
        module=module_name,
        object_id=object_id,
        action=action
    )