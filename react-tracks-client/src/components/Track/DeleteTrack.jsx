import React, { useContext } from "react";
import IconButton from "@material-ui/core/IconButton";
import TrashIcon from "@material-ui/icons/DeleteForeverOutlined";
import { UserContext } from "../../Root";
import { Mutation } from "react-apollo";
import { gql } from "apollo-boost";
import { GET_TRACKS_QUERY } from "../../pages/App";

const DeleteTrack = ({ track }) => {
  const currentUser = useContext(UserContext);
  const isCurrentUser = currentUser.id === track.createdBy.id;

  function handleCacheDelete(cache, {data: {deleteTrack}}){
    const data = cache.readQuery({query: GET_TRACKS_QUERY});
    const index = data.tracks.findIndex(track => Number(track.id) === deleteTrack.trackId);

    // to make a new array with the values from data up until the index:
    // this makes an array with all prev values but not the index value, and adds all new 
    // values at end of array but also not the index value being deleted
    const tracks = [...data.tracks.slice(0, index), ...data.tracks.slice(index +1)]
    cache.writeQuery({query: GET_TRACKS_QUERY, data: {tracks: tracks}});
  }

  return (
    isCurrentUser && (
      <Mutation
        mutation={DELETE_TRACK_MUTATION}
        variables={{ trackId: track.id }}
        update={handleCacheDelete}
        // refetchQueries={() => [{query: GET_TRACKS_QUERY}]}
      >
        {(deleteTrack) => (
          <IconButton onClick={deleteTrack}>
            <TrashIcon />
          </IconButton>
        )}
      </Mutation>
    )
  );
};

const DELETE_TRACK_MUTATION = gql`
  mutation($trackId: Int!) {
    deleteTrack(trackId: $trackId) {
      trackId
    }
  }
`;

export default DeleteTrack;
