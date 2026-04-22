from rest_framework import serializers
from .models import VisibilityLevel


class VisibilityLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisibilityLevel
        fields = ["id", "name"]