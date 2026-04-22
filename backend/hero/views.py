from django.shortcuts import render
from core.viewsets import BaseContentViewSet
from .models import HeroSlide
from .serializers import HeroSlideSerializer


class HeroSlideViewSet(BaseContentViewSet):
    queryset = HeroSlide.objects.filter(is_active=True)
    serializer_class = HeroSlideSerializer
    module_name = "hero"

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(is_active=True)