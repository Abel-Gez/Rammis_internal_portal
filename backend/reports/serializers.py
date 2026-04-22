from rest_framework import serializers
from django.utils import timezone
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    approved_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Report
        fields = "__all__"
        read_only_fields = [
            "created_by",
            "created_at",
            "updated_at",
            "archived",
            "version",
        ]

    def validate(self, data):

        # Enforce reporting period logic
        start = data.get("reporting_period_start")
        end = data.get("reporting_period_end")

        if start and end and start > end:
            raise serializers.ValidationError(
                "Reporting period start cannot be after end date."
            )

        return data