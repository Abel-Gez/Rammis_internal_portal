from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from rest_framework.views import APIView, csrf_exempt
from rest_framework.response import Response
from rest_framework import status
from rbac.models import Permission

from rest_framework.permissions import IsAuthenticated

# Create your views here.
@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {"error": "Invalid credentials"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        login(request, user)
        return Response(
            {"message": "Login successful"}, 
            status=status.HTTP_200_OK
            )
    
class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response(
            {"message": "Logout successful"}, 
            status=status.HTTP_200_OK
        )

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        permissions = []

        if user.role:
            permissions = [
                f"{perm.module.name}.{perm.action}"
                for perm in user.role.permissions.all()
            ]

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "role": user.role.name if user.role else None,
                "department": user.department.name if user.department else None,
                "is_superuser": user.is_superuser,
                "permissions": permissions
            },
            status=status.HTTP_200_OK
        )
    
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response(
                {"error": "Old password is incorrect"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        return Response(
            {"message": "Password changed successfully"}, 
            status=status.HTTP_200_OK
        )