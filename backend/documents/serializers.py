from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Document
        fields = "__all__"
        read_only_fields = ["created_by", "created_at", "updated_at", "archived"]