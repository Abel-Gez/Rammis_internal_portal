from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Document
from .serializers import DocumentSerializer
from rest_framework.permissions import AllowAny
from core.viewsets import BaseContentViewSet


class DocumentViewSet(BaseContentViewSet):
    queryset = Document.objects.select_related(
        "department",
        "visibility_level",
        "created_by"
    )
    serializer_class = DocumentSerializer
    module_name = "documents"

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    filterset_fields = ["department", "visibility_level", "document_type"]
    search_fields = ["title", "description", "tags"]
    ordering_fields = ["created_at", "title"]
    ordering = ["-created_at"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return super().get_permissions()