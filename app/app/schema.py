import graphene
from tracks.schema import Query as initailQuery
from tracks.schema import Mutations as initialMutation
from users.schema import Mutation as userMutation
from users.schema import Query as userQuery
import graphql_jwt

class Query(initailQuery,userQuery, graphene.ObjectType):
    pass


class Mutations(initialMutation, userMutation, graphene.ObjectType):
    # pass
    # here are the JWS code to add for authentication:
    token_auth = graphql_jwt.ObtainJSONWebToken.Field() # provides an auth token
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()


schema = graphene.Schema(query=Query, mutation=Mutations)

# this is technically the root Query for our app, all of the other queries througout the app
# will be passed in here to be sent to the graphql schema 