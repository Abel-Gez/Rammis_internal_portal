from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.viewsets import BaseContentViewSet
from .models import Vacancy, EmploymentType
from .serializers import VacancySerializer, EmploymentTypeSerializer

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import serializers


class VacancyViewSet(BaseContentViewSet):
    queryset = Vacancy.objects.select_related(
        "department",
        "visibility_level",
        "created_by",
        "employment_type"
    )

    serializer_class = VacancySerializer
    module_name = "vacancies"

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter
    ]

    filterset_fields = [
        "department",
        "visibility_level",
        "employment_type"
    ]

    search_fields = [
        "title",
        "description",
        "requirements",
        "responsibilities",
        "location"
    ]

    ordering_fields = [
        "created_at",
        "application_deadline"
    ]

    ordering = ["-created_at"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return super().get_permissions()

class EmploymentTypeViewSet(viewsets.ModelViewSet):
    queryset = EmploymentType.objects.all()
    serializer_class = EmploymentTypeSerializer
    permission_classes = [IsAuthenticated]