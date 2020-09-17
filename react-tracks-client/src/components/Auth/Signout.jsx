import React from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import ExitToApp from "@material-ui/icons/ExitToApp";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { ApolloConsumer } from "react-apollo"; // allows you access to client state from anywhere

const Signout = ({ classes }) => {

  function handleSignout(client) {
    localStorage.removeItem("authToken");
    client.writeData({data : {isLoggedIn : false}});
    // use client.write.. to change state without refreshing page first
    console.log("Signed out user", client);
  }

  return (
    <ApolloConsumer>
      {(client) => (
        <Button onClick={() => handleSignout(client)}>
          <Typography
            variant="body1"
            color="secondary"
            className={classes.buttonText}
          >
            Signout
          </Typography>
          <ExitToApp color="secondary" className={classes.buttonIcon} />
        </Button>
      )}
    </ApolloConsumer>
  );
};

const styles = {
  root: {
    cursor: "pointer",
    display: "flex",
  },
  buttonIcon: {
    marginLeft: "5px",
  },
};

export default withStyles(styles)(Signout);
