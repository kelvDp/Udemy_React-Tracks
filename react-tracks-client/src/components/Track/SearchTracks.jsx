import React, { useState, useRef} from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import TextField from "@material-ui/core/TextField";
import ClearIcon from "@material-ui/icons/Clear";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import { ApolloConsumer } from "react-apollo";
import { gql } from "apollo-boost";

const SearchTracks = ({ classes, setResults }) => {

  const [search, setSearch] = useState("");
  // the useRef hook needs to be set in a var that you want to reference
  const refElement = useRef();

  // just like using normal queries, can access the client to perform them:
  async function handleSubmit(event, client) {
    event.preventDefault();
    const res = await client.query({
      query: SEARCH_TRACKS_QUERY,
      variables: {search}
    })
    setResults(res.data.tracks);
  }

  function resetSearch() {
    setResults([]);
    setSearch("");

    // if you want to , you can make the search box focused when clearing search
    // with the help of a useRef hook from react
    refElement.current.focus();
  }

  return (
    <ApolloConsumer>
      {(client) => (
        <form onSubmit={event => handleSubmit(event, client)}>
          <Paper className={classes.root} elevation={1}>
            <IconButton onClick={resetSearch}>
              <ClearIcon />
            </IconButton>
            <TextField
              fullWidth
              placeholder="Search all tracks"
              // inputProps={{ disabledunderline: true }}
              onChange={event => setSearch(event.target.value)}
              value={search}
              inputRef={refElement}
            />
            <IconButton type="submit">
              <SearchIcon />
            </IconButton>
          </Paper>
        </form>
      )}
    </ApolloConsumer>
  );
};

const SEARCH_TRACKS_QUERY = gql`
    query($search: String){
      tracks(search: $search) {
        id
        title
        description
        url 
        likes {
          id
        }
        createdBy {
          id
          username
        }
      }
    }
  `;

const styles = (theme) => ({
  root: {
    padding: "2px 4px",
    margin: theme.spacing.unit,
    display: "flex",
    alignItems: "center",
  },
});

export default withStyles(styles)(SearchTracks);
