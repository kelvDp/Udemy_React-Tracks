import React from "react";
import ReactDOM from "react-dom";
import Root from "./Root";
import Auth from "./components/Auth";

// we will be using apollo to interact with our backend
import { ApolloProvider, Query } from "react-apollo";
import ApolloClient, { gql } from "apollo-boost";

const client = new ApolloClient({
  uri: "http://localhost:8000/graphql",
  // this is how to add jwt headers to apollo in order to auth a user so that they have access to all mutations:
  fetchOptions: {
    credentials: "include",
  },
  request: (operation) => {
    const token = localStorage.getItem("authToken") || "";
    operation.setContext({
      headers: {
        Authorization: `JWT ${token}`,
      },
    });
  },
  // apolloclient gives us the functionality to add state to our whole app and manage it in one place:
  clientState: {
    defaults: {
      isLoggedIn: !!localStorage.getItem("authToken"),
    },
  },
}); // tells apollo the location of our db
// putting the !! in front of the localstorage turns it into a boolean, so if there is a value = true

// now we can query whether is logged in true etc in order to render a page conditionally:
// have to add @client to tell apollo where to look for query
const IS_LOGGED_IN_QUERY = gql`
  {
    isLoggedIn @client
  }
`;

ReactDOM.render(
  <ApolloProvider client={client}>
    <Query query={IS_LOGGED_IN_QUERY}>
      {({ data }) => (data.isLoggedIn ? <Root /> : <Auth />)}
    </Query>
  </ApolloProvider>,
  document.getElementById("root")
);

// we wrap the root tag here with the apollo provider tags in order to inject in into all of our code
// and we set the client to the client variable created
