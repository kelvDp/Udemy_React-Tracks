import React, {useState, useContext} from "react";
import { Mutation } from "react-apollo";
import { gql } from "apollo-boost";
import Error from "../Shared/Error";
import axios from "axios";
import {UserContext} from "../../Root";  // context from root
import withStyles from "@material-ui/core/styles/withStyles";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from "@material-ui/icons/Edit";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import LibraryMusicIcon from "@material-ui/icons/LibraryMusic";
require("dotenv").config();

// to use UserContext here, you can either use it as a render component (not recommended):
// <UserContext.Consumer>{(currentUser => ...)}</UserContext.Consumer>  -- since we consume the data passed here
// OR we can use a special react hook called useContext which returns the value passed in to Provider
// const currentUser = useContext(UserContext);

const UpdateTrack = ({ classes, track}) => {
  const currentUser = useContext(UserContext);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(track.title);
  const [description, setDescription] = useState(track.description);
  const [file, setFile] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fileError, setFileError] = useState("");

  function handleAudioChange(event) {
    const selectedFile = event.target.files[0];
    const fileSizeLimit = 10000000; //10mb

    if (selectedFile && selectedFile.size > fileSizeLimit) {
      setFileError(`${selectedFile.name} : File is too large to upload`);
    } else {
      setFile(selectedFile);
    }
  }

  async function handleAudioUpload() {
    try {
      // this function will allow us to connext to cloudinary api
      const data = new FormData();
      data.append("file", file);
      data.append("resource_type", "raw");
      data.append("upload_preset", "react-tracks");
      data.append("cloud_name", "kelvdp");

      const res = await axios.post(
        process.env.REACT_APP_CLOUDINARY,
        data
      );

      return res.data.url;
    } catch (err) {
      console.error("Error uploading file", err);
      setSubmitting(false);
    }
  }

  async function handleSubmit(event, updateTrack) {
    event.preventDefault();
    setSubmitting(true);

    // upload audio file, get returned url from api
    const uploadedUrl = await handleAudioUpload();
    updateTrack({ variables: { trackId: track.id, title: title, description: description, url: uploadedUrl }});
  }

  const isCurrentUser = currentUser.id === track.createdBy.id;

  // will only show button etc if currentUser is true
  return isCurrentUser && (
    <>
      {/* UPDATE track button */}
      <IconButton onClick={() => setOpen(true)}>
          <EditIcon />
      </IconButton>

      {/* update track dialog */}
      <Mutation
        mutation={UPDATE_TRACK_MUTATION}
        onCompleted={() => {
          setSubmitting(false);
          setOpen(false);
          setFile("");
        }}
        // refetchQueries={() => [{ query: GET_TRACKS_QUERY }]}
      >
        {(updateTrack, { error }) => {
          if (error) {
            setOpen(false);
            return <Error error={error} />;
          }

          return (
            <Dialog open={open} className={classes.dialog}>
              <form onSubmit={(event) => handleSubmit(event, updateTrack)}>
                <DialogTitle>Update Track</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Add a Title, Description & Audio File (Under 10MB)
                  </DialogContentText>
                  <FormControl fullWidth>
                    <TextField
                      onChange={(event) => setTitle(event.target.value)}
                      label="Title"
                      placeholder="Update title"
                      className={classes.textField}
                      value={title}
                    />
                  </FormControl>

                  <FormControl fullWidth>
                    <TextField
                      onChange={(event) => setDescription(event.target.value)}
                      multiline
                      rows="2"
                      label="Description"
                      placeholder="Add description"
                      className={classes.textField}
                      value={description}
                    />
                  </FormControl>

                  <FormControl error={!!fileError}>
                    <input
                      onChange={handleAudioChange}
                      id="audio"
                      required
                      type="file"
                      accept="audio/mp3, audio/wav"
                      className={classes.input}
                    />
                    <label htmlFor="audio">
                      <Button
                        variant="outlined"
                        color={file ? "secondary" : "inherit"}
                        component="span"
                        className={classes.button}
                      >
                        Audio file <LibraryMusicIcon className={classes.icon} />
                      </Button>
                      {file && file.name}
                      <FormHelperText>{fileError}</FormHelperText>
                    </label>
                  </FormControl>
                </DialogContent>

                <DialogActions>
                  <Button
                    disabled={submitting}
                    onClick={() => {
                      setOpen(false);
                      setFile("");
                    }}
                    className={classes.cancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={
                      submitting ||
                      !title.trim() ||
                      !description.trim() ||
                      !file
                    }
                    type="submit"
                    className={classes.save}
                  >
                    {submitting ? (
                      <CircularProgress className={classes.save} size={24} />
                    ) : (
                      "Add Track"
                    )}
                  </Button>
                </DialogActions>
              </form>
            </Dialog>
          );
        }}
      </Mutation>
    </>
  );
};

const UPDATE_TRACK_MUTATION = gql`
    mutation($trackId: Int!, $title: String, $description: String, $url: String) {
      updateTrack(trackId: $trackId, title: $title, description: $description, url: $url) {
        track {
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
    }
  `;

const styles = theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  dialog: {
    margin: "0 auto",
    maxWidth: 550
  },
  textField: {
    margin: theme.spacing.unit
  },
  cancel: {
    color: "red"
  },
  save: {
    color: "green"
  },
  button: {
    margin: theme.spacing.unit * 2
  },
  icon: {
    marginLeft: theme.spacing.unit
  },
  input: {
    display: "none"
  }
});

export default withStyles(styles)(UpdateTrack);
