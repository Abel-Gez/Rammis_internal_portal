from django.http import FileResponse, Http404
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from core.mixins import VisibilityQuerysetMixin
from audit_logs.utils import log_action
from core.file_registry import FILE_MODELS


class SecureFileDownloadView(VisibilityQuerysetMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, module, object_id):
        model = FILE_MODELS.get(module)
        if not model:
            raise Http404("Invalid module")

        queryset = self.filter_by_visibility(model.objects.all())

        try:
            obj = queryset.get(id=object_id)
        except model.DoesNotExist:
            raise Http404("File not found or access denied")

        if not obj.file:
            raise Http404("No file attached to this record")

        # ?inline=true → serve for browser preview (PDF viewer, image display)
        # default (or ?inline=false) → force download with Content-Disposition: attachment
        inline = request.query_params.get("inline", "false").lower() == "true"

        log_action(
            user=request.user,
            module_name=module,
            object_id=obj.id,
            action="download" if not inline else "view",
        )

        return FileResponse(
            obj.file.open("rb"),
            as_attachment=not inline,
            filename=obj.file.name.split("/")[-1],
        )
