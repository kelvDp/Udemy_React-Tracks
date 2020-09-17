import React, { useContext } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import IconButton from "@material-ui/core/IconButton";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import { Mutation } from "react-apollo";
import { gql } from "apollo-boost";
import { UserContext } from "../../Root";
import { ME_QUERY } from "../../Root";

// to stop the whole dropdown from opening when clicking on the like button, use stopPropagation

const LikeTrack = ({ classes, trackId, likeCount }) => {
  const currentUser = useContext(UserContext);

  function handleDisabledLike() {
    const userLikes = currentUser.likeSet;
    const isTrackLiked =
      userLikes.findIndex((like) => like.track.id === trackId) > -1; //  > -1 will turn into bool

    return isTrackLiked;
  }

  return (
    <Mutation
      mutation={CREATE_LIKE_MUTATION}
      variables={{ trackId: trackId }}
      refetchQueries={() => [{ query: ME_QUERY }]}
    >
      {(createLike) => (
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            createLike();
          }}
          className={classes.iconButton}
          disabled={handleDisabledLike()}
        >
          {likeCount}
          <ThumbUpIcon className={classes.icon} />
        </IconButton>
      )}
    </Mutation>
  );
};

const CREATE_LIKE_MUTATION = gql`
  mutation($trackId: Int!) {
    createLike(trackId: $trackId) {
      track {
        id
        likes {
          id
        }
      }
    }
  }
`;

const styles = (theme) => ({
  iconButton: {
    color: "deeppink",
  },
  icon: {
    marginLeft: theme.spacing.unit / 2,
  },
});

export default withStyles(styles)(LikeTrack);
