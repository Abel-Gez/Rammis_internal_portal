from django.shortcuts import render
from rest_framework import viewsets
from .models import VisibilityLevel
from .serializers import VisibilityLevelSerializer

# Create your views here.
# access_control/views.py
class VisibilityLevelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VisibilityLevel.objects.all()
    serializer_class = VisibilityLevelSerializer