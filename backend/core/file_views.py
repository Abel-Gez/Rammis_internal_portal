from django.http import FileResponse, Http404
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from core.mixins import VisibilityQuerysetMixin
from reports.models import Report
from documents.models import Document
from audit_logs.utils import log_action
from core.file_registry import FILE_MODELS


class SecureFileDownloadView(VisibilityQuerysetMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, module, object_id):

        model_map = {
            "reports": Report,
            "documents": Document,
        }

        model = FILE_MODELS.get(module)

        if not model:
            raise Http404("Invalid module")

        queryset = self.filter_by_visibility(model.objects.all())

        try:
            obj = queryset.get(id=object_id)
        except model.DoesNotExist:
            raise Http404("File not found")

        if not obj.file:
            raise Http404("No file attached")

        # ✅ LOG DOWNLOAD EVENT
        log_action(
            user=request.user,
            module_name=module,
            object_id=obj.id,
            action="download"
        )

        return FileResponse(
            obj.file.open("rb"),
            as_attachment=True,
            filename=obj.file.name.split("/")[-1]
        )