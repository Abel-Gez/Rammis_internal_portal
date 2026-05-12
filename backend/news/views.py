from django.utils.timezone import now
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from django.db.models import Q

from audit_logs.utils import log_action

from .models import News
from .serializers import NewsSerializer
from rest_framework.permissions import AllowAny
from core.viewsets import BaseContentViewSet


class NewsViewSet(BaseContentViewSet):
    queryset = News.objects.select_related(
        "department",
        "visibility_level",
        "created_by"
    )

    serializer_class = NewsSerializer
    module_name = "news"

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    filterset_fields = ["department", "visibility_level"]
    search_fields = ["title", "content"]
    ordering_fields = ["published_date", "created_at"]
    ordering = ["-published_date"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        queryset = super().get_queryset()

        # Enforce publish date visibility
        if not self.request.user.is_superuser:
            queryset = queryset.filter(
                Q(published_date__lte=timezone.now()) | Q(published_date__isnull=True)
)
            # queryset = queryset.filter(
            #     published_date__isnull=False,
            #     published_date__lte=now().date()
            # )

        return queryset


    def perform_create(self, serializer):
        instance = serializer.save(
            created_by=self.request.user,
            published_date=timezone.now()  # ✅ auto publish
        )

        log_action(
            user=self.request.user,
            module_name=self.module_name,
            object_id=instance.id,
            action="create"
        )
    