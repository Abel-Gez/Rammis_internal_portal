from django.shortcuts import render
from core.viewsets import BaseContentViewSet
from .models import HeroSlide
from .serializers import HeroSlideSerializer


# class HeroSlideViewSet(BaseContentViewSet):
#     queryset = HeroSlide.objects.filter(is_active=True).order_by("order")
#     serializer_class = HeroSlideSerializer
#     module_name = "hero"

#     def get_queryset(self):
#         qs = super().get_queryset()
#         return qs.filter(is_active=True)

from rest_framework.permissions import AllowAny, IsAuthenticated

class HeroSlideViewSet(BaseContentViewSet):
    queryset = HeroSlide.objects.all()
    serializer_class = HeroSlideSerializer
    module_name = "hero"

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]   # ✅ anyone can view slides
        return [IsAuthenticated()]  # or your custom permission