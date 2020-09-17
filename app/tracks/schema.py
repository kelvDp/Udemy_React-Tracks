import graphene
from graphene_django import DjangoObjectType
from .models import Track, Like
from users.schema import UserType
# allows you to create more complex queries : see under resolve_tracks
from django.db.models import Q

# this is how to integrate Django into Graphql


class TrackType(DjangoObjectType):
    class Meta:
        model = Track
# here we pass in the Track model to convert it into a graphene schema

# since we want to be able to see the likes in a query, we have to make a liketype:


class LikeType(DjangoObjectType):
    class Meta:
        model = Like


class Query(graphene.ObjectType):
    # tells the tracks query which structure to use
    tracks = graphene.List(TrackType, search=graphene.String(required=False))

    # now we can add likes to our root query
    likes = graphene.List(LikeType)

    def resolve_tracks(self, info, search=None):
        filter = (
            Q(title__icontains=search) |  # or
            Q(description__icontains=search) |
            Q(url__icontains=search) |
            # more method available --> icontains = insensitive case contains
            Q(created_by__username__icontains=search)
        )
        if search:
            return Track.objects.filter(filter)
        return Track.objects.all()  # returns all the tracks when running tracks query

    def resolve_likes(self, info):
        return Like.objects.all()

# we're not going to create the schema here , but in the main app folder

# next we can add mutations so that users can enter their own tracks


class CreateTrack(graphene.Mutation):
    track = graphene.Field(TrackType)

    class Arguments:
        title = graphene.String()
        description = graphene.String()
        url = graphene.String()


    def mutate(self, info, title, description, url):
        user = info.context.user
        if user.is_anonymous:
            raise Exception("Log in to add a song")

        track = Track(title=title, description=description, url=url, created_by=user)
        track.save()  # this seems to save the track just created to the data in the schema
        return CreateTrack(track=track)


# how to update tracks -- will only be able to do if 'signed in'
class UpdateTrack(graphene.Mutation):
    track = graphene.Field(TrackType)

    class Arguments:
        track_id = graphene.Int(required=True)
        title = graphene.String()
        description = graphene.String()
        url = graphene.String()


    def mutate(self, info, **kwargs):
        # get user who is signed in and who's track it is:
        user = info.context.user
        track = Track.objects.get(id=kwargs.get("track_id"))
        if track.created_by != user:
            raise Exception("Not allowed to change this track!")
        else:
            track.title = kwargs.get("title")
            track.description = kwargs.get("description")
            track.url = kwargs.get("url")

            track.save()
            return UpdateTrack(track=track)


class DeleteTrack(graphene.Mutation):
    track_id = graphene.Int() # since we only want the track id back when deleted and not whole field


    class Arguments:
        track_id = graphene.Int(required=True)

  
    def mutate(self, info, track_id):
        user = info.context.user
        track = Track.objects.get(id=track_id)

        if track.created_by != user:
            raise Exception("Not permitted to delete this track")

        track.delete()
        return DeleteTrack(track_id=track_id) # only pass in the id here


class CreateLike(graphene.Mutation):
    user = graphene.Field(UserType)
    track = graphene.Field(TrackType)

    class Arguments:
        track_id = graphene.Int(required=True)

    def mutate(self, info, track_id):
        user = info.context.user
        if user.is_anonymous:
            raise Exception("Please log in to like tracks")

        track = Track.objects.get(id=track_id)
        if not track:
            raise Exception("No such track in database currently")

        Like.objects.create(user=user, track=track)
        return CreateLike(user=user, track=track)


class Mutations(graphene.ObjectType):
    create_track = CreateTrack.Field()
    update_track = UpdateTrack.Field()
    delete_track = DeleteTrack.Field()
    create_like = CreateLike.Field()
