from django.db import models
from access_control.base_models import BaseContent

# Create your models here.

class HeroSlide(BaseContent):
    image = models.ImageField(upload_to="hero/")
    subtitle = models.TextField(blank=True, null=True)

    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "-created_at"]

    def __str__(self):
        return self.title