from rest_framework import serializers
from django.utils import timezone
from .models import EmploymentType, Vacancy
from access_control.models import VisibilityLevel




class VacancySerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    employment_type_name = serializers.CharField(
        source="employment_type.name", read_only=True)

    class Meta:
        model = Vacancy
        fields = "__all__"

        read_only_fields = [
            "created_by",
            "created_at",
            "updated_at",
            "archived",
            "posted_date",
        ]


    def validate(self, data):
        """
        Enterprise validation rules
        """

        deadline = data.get("application_deadline")

        # Prevent past deadlines
        if deadline and deadline < timezone.now().date():
            raise serializers.ValidationError(
                "Application deadline cannot be in the past."
            )

        return data
    
    def create(self, validated_data):
        if not validated_data.get("visibility_level"):
            public = VisibilityLevel.objects.filter(name="Public").first()
            validated_data["visibility_level"] = public

        return super().create(validated_data)

    
class EmploymentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmploymentType
        fields = ["id", "name"]
    