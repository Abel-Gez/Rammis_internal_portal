from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import QuickLink


class QuickLinksView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        links = QuickLink.objects.filter(active=True).order_by("order")

        data = [
            {
                "id": link.id,
                "name": link.name,
                "url": link.url,
                "icon": link.icon
            }
            for link in links
        ]

        return Response(data)