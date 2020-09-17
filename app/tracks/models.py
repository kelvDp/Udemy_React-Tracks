from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.

class Track(models.Model):
    title = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

    # we want to be able to tie users to tracks, so we have to connect them with foreign key:
    created_by = models.ForeignKey(get_user_model(), null=True, on_delete=models.CASCADE)


# we want to create a likes model to see who likes which track etc
# instead of making a seperate folder and model for like we'll do it here , since it 
# relates to the users and tracks here :

class Like(models.Model):
    user = models.ForeignKey(get_user_model(), null=True, on_delete=models.CASCADE)
    track = models.ForeignKey("tracks.Track", related_name="likes", on_delete=models.CASCADE)


# this is how to create the initial model for grapql to use in django
# the graphiql viewer will convert this into a schema
