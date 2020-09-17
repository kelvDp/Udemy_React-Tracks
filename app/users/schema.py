# we're not making a whole new users app like we did with tracks
# because django already has a pre-built users module that we can simply
# incorporate into our app 

from django.contrib.auth import get_user_model
import graphene
from graphene_django import DjangoObjectType


class UserType(DjangoObjectType):
    class Meta:
        model = get_user_model()


class Query(graphene.ObjectType):
    users = graphene.Field(UserType, id=graphene.ID())

    # query for 'me' -- authentication:
    me = graphene.Field(UserType)

    def resolve_users(self, info, id=None):


        return get_user_model().objects.get(id=id)
    # this will allow you to search for a user by their id

    def resolve_me(self, info):
        user = info.context.user
        if user.is_anonymous:
            raise Exception("Not logged in!")
        return user
        # this will throw an exception by default if no valid jwt token is passed in

class CreateUser(graphene.Mutation):
    user = graphene.Field(UserType)
    # this model gives quite a lot of fields that you can use
    # if you only want certain fields to be available in the query:
    only_fields = ("id", "email", "password", "username")

    class Arguments:
        username = graphene.String(required=True)
        email = graphene.String(required=True)
        password = graphene.String(required=True)

# if you don't want to pass in every single arg, use the **kwargs method below:
    def mutate(self, info, **kwargs):
        user = get_user_model()(
            username = kwargs.get("username"),
            email = kwargs.get("email")
        )
        user.set_password(kwargs.get("password")) # password is set like this
        user.save()
        return CreateUser(user=user)

class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()

