from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from core.mixins import VisibilityQuerysetMixin
from rbac.permissions import HasModulePermission
from audit_logs.utils import log_action


class BaseContentViewSet(VisibilityQuerysetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, HasModulePermission]

    module_name = None  # must be defined in child class

    def get_queryset(self):
        queryset = self.queryset.filter(archived=False)
        return self.filter_by_visibility(queryset)

    def perform_create(self, serializer):
        from access_control.models import VisibilityLevel

        public = VisibilityLevel.objects.filter(name="Public").first()

        instance = serializer.save(
            created_by=self.request.user,
            visibility_level=serializer.validated_data.get("visibility_level", public),
            department=serializer.validated_data.get("department", None),
        )

        log_action(
            user=self.request.user,
            module_name=self.module_name,
            object_id=instance.id,
            action="create"
        )

    def perform_destroy(self, instance):
        # Log first — save the id before the row is removed from the DB
        object_id = instance.id
        log_action(
            user=self.request.user,
            module_name=self.module_name,
            object_id=object_id,
            action="delete"
        )
        # Hard delete: permanently removes the record from the database.
        # Previously this used soft-delete (archived=True) but that caused
        # dashboard counts to include deleted items.
        instance.delete()

    def perform_update(self, serializer):
        # Pass visibility_level and department explicitly so custom serializer
        # update() methods don't have to rediscover them from validated_data.
        save_kwargs = {}
        if "visibility_level" in serializer.validated_data:
            save_kwargs["visibility_level"] = serializer.validated_data["visibility_level"]
        if "department" in serializer.validated_data:
            save_kwargs["department"] = serializer.validated_data["department"]

        instance = serializer.save(**save_kwargs)

        log_action(
            user=self.request.user,
            module_name=self.module_name,
            object_id=instance.id,
            action="update"
        )
        
    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)

        log_action(
            user=request.user,
            module_name=self.module_name,
            object_id=kwargs.get("pk"),
            action="view"
        )

        return response

    def get_permissions(self):
        if not self.module_name:
            raise ValueError("module_name must be defined in the ViewSet")

        if self.action in ["list", "retrieve"]:
            self.required_permission = f"{self.module_name}.view"

        elif self.action == "create":
            self.required_permission = f"{self.module_name}.create"

        elif self.action in ["update", "partial_update"]:
            self.required_permission = f"{self.module_name}.update"

        elif self.action == "destroy":
            self.required_permission = f"{self.module_name}.delete"

        return [permission() for permission in self.permission_classes]