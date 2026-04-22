from django.db import models


class Module(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Permission(models.Model):
    ACTION_CHOICES = [
        ("view", "View"),
        ("create", "Create"),
        ("update", "Update"),
        ("delete", "Delete"),
        ("archive", "Archive"),
        ("approve", "Approve"),
    ]

    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)

    class Meta:
        unique_together = ("module", "action")

    def __str__(self):
        return f"{self.module.name} - {self.action}"