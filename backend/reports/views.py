from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.exceptions import PermissionDenied

from core.viewsets import BaseContentViewSet
from .models import Report
from .serializers import ReportSerializer


class ReportViewSet(BaseContentViewSet):
    queryset = Report.objects.select_related(
        "department",
        "visibility_level",
        "created_by",
        "report_type"
    )

    serializer_class = ReportSerializer
    module_name = "reports"

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    filterset_fields = ["department", "visibility_level", "report_type"]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "reporting_period_start", "reporting_period_end"]
    ordering = ["-created_at"]
