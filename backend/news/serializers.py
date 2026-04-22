import datetime

from rest_framework import serializers

from .models import News


class NewsSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    published_date = serializers.SerializerMethodField()

    class Meta:
        model = News
        fields = "__all__"
        read_only_fields = ["created_by", "created_at", "updated_at", "archived"]

    def get_published_date(self, obj):
        value = obj.published_date

        if isinstance(value, datetime.datetime):
            return value.date()  # Return only the date part
        return value
    
    def create(self, validated_data):
        import datetime

        value = validated_data.get("published_date")

        if isinstance(value, datetime.datetime):
            validated_data["published_date"] = value.date()

        return super().create(validated_data)
