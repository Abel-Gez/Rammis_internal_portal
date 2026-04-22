from django.db import migrations


def create_visibility_levels(apps, schema_editor):
    VisibilityLevel = apps.get_model("access_control", "VisibilityLevel")

    levels = [
        ("PUBLIC", 1),
        ("MIDDLE", 2),
        ("EXECUTIVE_COMMITTEE", 3),
        ("TOP_MANAGEMENT", 4),
    ]

    for name, order in levels:
        VisibilityLevel.objects.update_or_create(
            name=name,
            defaults={"order": order}
        )


def reverse_visibility_levels(apps, schema_editor):
    VisibilityLevel = apps.get_model("access_control", "VisibilityLevel")
    VisibilityLevel.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("access_control", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_visibility_levels, reverse_visibility_levels),
    ]
