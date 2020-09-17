import React from "react";
import withRoot from "./withRoot";
// we will execute queries with the help of react-apollo:
import { Query } from "react-apollo";
// in order to parse our queries correctly, have to use this :
import { gql } from "apollo-boost";
import {BrowserRouter, Switch, Route} from "react-router-dom";
import Header from "./components/Shared/Header";
import App from "./pages/App";
import Profile from "./pages/Profile";
import Loading from "./components/Shared/Loading";
import Error from "./components/Shared/Error";

// instead of passing something through components for several levels up or down, for them to not use it,
// can use react context to send through the piece of data that you want to wthout going down the component tree
// const {Provider, Consumer} = React.createContext() // returns an obj so can destructure like this
// but we'll pass over whole object:

export const UserContext = React.createContext();

const Root = () => (

  // the data you recieve here to be passed into the arrow func needs to be in the form of an obj
  // <Query query={ME_QUERY}>
  //   {({ data, loading, error }) => {
  //     if (loading) return <div>Loading</div>;
  //     if (error) return <div>Error</div>;

  //     return <div>{JSON.stringify(data)}</div>;
  //   }}
  // </Query>

  // the fetchPolicy will tell the browser where to look for data 
  <Query query={ME_QUERY} fetchPolicy="cache-and-network">
    {({ data, loading, error }) => {
      if (loading) return <Loading />;
      if (error) return <Error error={error} />;
      const currentUser = data.me;

// to pass data from usercontext to other parts of the app, put it in place of the react fragments
// since its a whole object, have to say .provider , since we provide the info from here
      return (
        <BrowserRouter>
          <UserContext.Provider value={currentUser}>
            <Header currentUser={currentUser} />
            <Switch>
              <Route exact path="/" component={App}/>
              <Route path="/profile/:id" component={Profile} />
            </Switch>
          </UserContext.Provider>
        </BrowserRouter>
      )
    }}
  </Query>
); // the <> thats empty is a shorthand for a react fragment

// this is how to write out the graphql query:
// const GET_TRACKS_QUERY = gql`
//   {
//     tracks {
//       id
//       title
//       description
//       url
//     }
//   }
// `;

export const ME_QUERY = gql`
{
  me{
    id
    username
    email
    likeSet{
      track{
        id
      }
    }
  }
}
`;

export default withRoot(Root);
