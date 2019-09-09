import React, { Component } from "react";
import ChatApp from "./ChatApp";
import SignIn from "./SignIn";

import AppIcon from "./AppIcon";
import AppBar from "@material-ui/core/AppBar";

import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";

import MenuIcon from "@material-ui/icons/Menu";

import { withStyles } from "@material-ui/styles";
import Box from "@material-ui/core/Box";

const styles = {
  root: {
    height: "100vh"
  },
  spacer: {
    flexGrow: 1
  },
  appIcon: {
    width: "10rem",
    margin: "1.0em",
    height: "auto"
  }
};

class App extends Component {
  constructor(props) {
    super(props);
    const name = localStorage.getItem("name") || "";
    const loggedIn = name !== "";
    this.state = {
      loggedIn: loggedIn,
      name: name
    };
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
            <div className={classes.appIcon}>
              <AppIcon />
            </div>
            <div className={classes.spacer} />
            {this.state.loggedIn && (
              <form onSubmit={this.logOut}>
                <Button
                  variant="outlined"
                  type="submit"
                  color="default"
                  className={classes.logout}
                >
                  Log out
                </Button>
              </form>
            )}
          </Toolbar>
        </AppBar>
        <Toolbar id="back-to-top-anchor" />
        <Box>
          {this.state.loggedIn && <ChatApp name={this.state.name} />}
          {!this.state.loggedIn && (
            <SignIn
              name={this.state.name}
              onNameChanged={this.onNameChanged}
              logIn={this.logIn}
            />
          )}
        </Box>
      </div>
    );
  }

  onNameChanged = event => {
    this.setState({ name: event.target.value });
  };

  logIn = event => {
    event.preventDefault();
    if (this.state.name !== "") {
      localStorage.setItem("name", this.state.name);
      this.setState({ loggedIn: true }, this.getToken);
    }
  };

  logOut = event => {
    this.setState({
      name: "",
      loggedIn: false
    });
    localStorage.removeItem("name");
  };
}

export default withStyles(styles)(App);
