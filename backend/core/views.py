from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        permissions = []

        return Response({
            "id": user.id,
            "username": user.username,
            "full_name": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "role": user.role.name if user.role else None,
            "department": user.department.name if user.department else None,
        })


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CSRFTokenView(APIView):

    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response({"detail": "CSRF cookie set"})