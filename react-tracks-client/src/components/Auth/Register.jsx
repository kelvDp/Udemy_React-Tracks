import React, { useState } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import FormControl from "@material-ui/core/FormControl";
import Paper from "@material-ui/core/Paper";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
// import Slide from "@material-ui/core/Slide";
import Gavel from "@material-ui/icons/Gavel";
import VerifiedUserTwoTone from "@material-ui/icons/VerifiedUserTwoTone";

// since we're performing a mutation when registering a new user , import tools to do so:
import { Mutation } from "react-apollo";
import { gql } from "apollo-boost";
import { Slide } from "@material-ui/core";

// The error snackbar:
import Error from "../Shared/Error";

// creating the transition component for presentation:
function Transition(props){
  return <Slide direction="up" {...props} />
}

// the onject ({classes}) is a prop i.e = props.classes
const Register = ({ classes, setNewUser }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);

  // when performing a mutation you get access to the mutation name to use as a function
  // here it is the createUser mutation
  // for some reason this does not seem to work!!!
  //  function handleSubmit(event, createUser) {
  //   event.preventDefault();
  //    createUser({
  //       username :username,
  //       email: email,
  //       password: password
  //    }); // these are the variable names and values passed into the mutation
  // }
  // you can either perfrom this as a function, or simply put the variables in the mutation tag:
  // <Mutation ... variables={{username: username, email: email ...}}

  async function handleSubmit(event, createUser) {
    event.preventDefault();
    const res = await createUser();
    console.log(res);
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Avatar className={classes.avatar}>
          <Gavel />
        </Avatar>

        <Typography variant="headline">Register</Typography>

        <Mutation
          mutation={REGISTER_MUTATION}
          variables={{ username: username, email: email, password: password }}
          onCompleted={() => setOpen(true)}
        >
          {(createUser, { loading, error }) => {
            return (
              <form
                onSubmit={(event) => handleSubmit(event, createUser)}
                className={classes.form}
              >
                <FormControl margin="normal" required fullWidth>
                  <InputLabel htmlFor="username">Username</InputLabel>
                  <Input
                    id="username"
                    type="text"
                    onChange={(event) => setUsername(event.target.value)}
                  />
                </FormControl>
                <FormControl margin="normal" required fullWidth>
                  <InputLabel htmlFor="email">Email</InputLabel>
                  <Input
                    id="email"
                    type="email"
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </FormControl>
                <FormControl margin="normal" required fullWidth>
                  <InputLabel htmlFor="password">Password</InputLabel>
                  <Input
                    id="password"
                    type="password"
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </FormControl>

                <Button
                  type="submit"
                  fullwidth
                  variant="contained"
                  color="secondary"
                  className={classes.submit}
                  disabled={
                    loading ||
                    !username.trim() ||
                    !email.trim() ||
                    !password.trim()
                  }
                >
                  Register
                </Button>
                <Button color="primary" variant="outlined" fullwidth onClick={() => setNewUser(false)}>
                  Previous user ? Log in here
                </Button>

                {/* error handling */}
                {error && <Error error={error} />}
              </form>
            );
          }}
        </Mutation>
      </Paper>

      {/* Success dialog */}

      <Dialog open={open} disableBackdropClick={true} TransitionComponent={Transition}>
        <DialogTitle>
          <VerifiedUserTwoTone className={classes.icon} />
          New Account
        </DialogTitle>

        <DialogContent>
          <DialogContentText>User successfully created!</DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            color="primary"
            variant="contained"
            onClick={() => setNewUser(false)}
          >
            Login
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const REGISTER_MUTATION = gql`
  mutation($username: String!, $email: String!, $password: String!) {
    createUser(username: $username, email: $email, password: $password) {
      user {
        id
        username
        email
        password
      }
    }
  }
`;

const styles = (theme) => ({
  root: {
    width: "auto",
    display: "block",
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up("md")]: {
      width: 400,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing.unit * 2,
  },
  title: {
    marginTop: theme.spacing.unit * 2,
    color: theme.palette.openTitle,
  },
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%",
    marginTop: theme.spacing.unit,
  },
  submit: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
  icon: {
    padding: "0px 2px 2px 0px",
    verticalAlign: "middle",
    color: "green",
  },
});

export default withStyles(styles)(Register);
