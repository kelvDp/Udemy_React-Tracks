import React, { useState } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import AddIcon from "@material-ui/icons/Add";
import ClearIcon from "@material-ui/icons/Clear";
import LibraryMusicIcon from "@material-ui/icons/LibraryMusic";
import { Mutation } from "react-apollo";
import { gql } from "apollo-boost";
import Error from "../Shared/Error";
import axios from "axios";
import { GET_TRACKS_QUERY } from "../../pages/App";

const CreateTrack = ({ classes }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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

  // async function handleSubmit(event, createTrack) {
  //   event.preventDefault();
  //   setSubmitting(true);

  //   // upload audio file, get returned url from api
  //   const uploadedUrl = await handleAudioUpload();
  //   // createTrack({ variables: { title: title, description: description, url: uploadedUrl } });
  //   return uploadedUrl;
  // }

  const handleSubmit = async (event, createTrack) => {
    event.preventDefault();
    setSubmitting(true);
    const uploadedUrl = await handleAudioUpload();
    createTrack({ variables: { title, description, url: uploadedUrl } });
    setDescription("");
    setTitle("");
  };

  const handleUpdateCache = (cache, {data: {createTrack}}) => {
    const data = cache.readQuery({query: GET_TRACKS_QUERY});
    const tracks = data.tracks.concat(createTrack.track);
    
    // to update the tracks array in the cache, pass the new tracks array into the data obj:
    cache.writeQuery({query: GET_TRACKS_QUERY, data: {tracks:tracks}})
  }

  return (
    <>
      {/* create track button */}
      <Button
        onClick={() => setOpen(true)}
        variant="fab"
        className={classes.fab}
        color="secondary"
      >
        {open ? <ClearIcon /> : <AddIcon />}
      </Button>

      {/* create track dialog */}
      <Mutation
        mutation={CREATE_TRACK_MUTATION}
        onCompleted={() => {
          setSubmitting(false);
          setOpen(false);
          setFile("");
        }}
        update={handleUpdateCache}
        // refetchQueries={() => [{ query: GET_TRACKS_QUERY }]}
      >
        {(createTrack, { error }) => {
          if (error) {
            setOpen(false);
            return <Error error={error} />;
          }

          return (
            <Dialog open={open} className={classes.dialog}>
              <form onSubmit={(event) => handleSubmit(event, createTrack)}>
                <DialogTitle>Create Track</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Add a Title, Description & Audio File (Under 10MB)
                  </DialogContentText>
                  <FormControl fullWidth>
                    <TextField
                      onChange={(event) => setTitle(event.target.value)}
                      label="Title"
                      placeholder="Add title"
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
                      setTitle("");
                      setDescription("");
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

const CREATE_TRACK_MUTATION = gql`
    mutation($title: String!, $description: String!, $url: String!) {
      createTrack(title: $title, description: $description, url: $url) {
        track {
          id
          title
          description
          url
          likes {
            id
          }
          createdBy{
            id
            username
          }
        }
      }
    }
  `;

const styles = (theme) => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  dialog: {
    margin: "0 auto",
    maxWidth: 550,
  },
  textField: {
    margin: theme.spacing.unit,
  },
  cancel: {
    color: "red",
  },
  save: {
    color: "green",
  },
  button: {
    margin: theme.spacing.unit * 2,
  },
  icon: {
    marginLeft: theme.spacing.unit,
  },
  input: {
    display: "none",
  },
  fab: {
    position: "fixed",
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
    zIndex: "200",
  },
});

export default withStyles(styles)(CreateTrack);

// with all the above now, when you upload the track it won't show until you refresh site
// fix this like so :
// in the mutation tag , use the refetchQueries attribute and pass in a function
// import the get tracks query from wherever and use it in refetch function
// ... refetchQueries={() => [{query : GET_TRACKS_QUERY}]}  -- put in an array since there can be more than
// one query to be refetched.

// instead of refetchin queries and making another network request, it is much better to use the 
//update attribute on the mutation tags (update={}) in order to tapp into the apollo cache
