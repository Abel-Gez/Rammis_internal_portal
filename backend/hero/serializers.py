from rest_framework import serializers
from django.db.models import Max
from .models import HeroSlide


class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = "__all__"
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def create(self, validated_data):
        if not validated_data.get("order"):
            last = HeroSlide.objects.aggregate(Max("order"))["order__max"] or 0
            validated_data["order"] = last + 1

        if "is_active" not in validated_data:
            validated_data["is_active"] = True

        return super().create(validated_data)

    def update(self, instance, validated_data):
        instance.title           = validated_data.get("title",            instance.title)
        instance.subtitle        = validated_data.get("subtitle",         instance.subtitle)
        instance.image           = validated_data.get("image",            instance.image)
        instance.is_active       = validated_data.get("is_active",        instance.is_active)
        instance.order           = validated_data.get("order",            instance.order)
        # visibility_level and department were previously missing — both are now updated
        instance.visibility_level = validated_data.get("visibility_level", instance.visibility_level)
        instance.department       = validated_data.get("department",       instance.department)
        instance.save()
        return instance
