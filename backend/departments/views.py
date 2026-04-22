from django.shortcuts import render
from rest_framework import viewsets
from .models import Department
from .serializers import DepartmentSerializer

# Create your views here.
class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer