import React, { Component } from "react";

import { NavLink, withRouter } from "react-router-dom";

import { withStyles } from "@material-ui/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Typography from "@material-ui/core/Typography";

import MenuIcon from "@material-ui/icons/Menu";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";

import ChatApp from "./ChatApp";
import SignIn from "./SignIn";

const ForwardNavLink = React.forwardRef((props, ref) => (
  <NavLink {...props} innerRef={ref} />
));

const styles = theme => ({
  root: {
    height: "100vh"
  },
  spacer: {
    flexGrow: 1
  },
  subtitle: {
    fontFamily: "Racing Sans One"
  },
  appIcon: {
    width: "10rem",
    margin: "-0.5rem",
    minHeight: "48px",
    [theme.breakpoints.down("xs")]: {
      width: "6rem"
    },
    backgroundImage: `url(${theme.images.logo})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    backgroundPosition: "left"
  },
  title: {
    color: theme.palette.getContrastText(theme.palette.primary.main)
  },
  titleWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  }
});

class App extends Component {
  constructor(props) {
    super(props);
    const name = localStorage.getItem("name") || "";
    const loggedIn = name !== "";
    this.state = {
      loggedIn: loggedIn,
      name: name,
      selectedChannel: null
    };
  }

  render() {
    const { classes } = this.props;
    const thread = this.props.location.state
      ? this.props.location.state.channelName
      : this.state.selectedChannel ? this.state.selectedChannel.friendlyName : null;
    return (
      <div className={classes.root}>
        <AppBar position="fixed">
          <Toolbar variant="dense">
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>

            <Breadcrumbs
              className={classes.title}
              aria-label="breadcrumb"
              separator={<NavigateNextIcon fontSize="small" />}
            >
              <Link
                color="inherit"
                to="/"
                component={ForwardNavLink}
                className={classes.titleWrapper}
              >
                <div className={classes.appIcon}></div>
                <Typography variant="h4" className={classes.subtitle}>
                  Driver
                </Typography>
              </Link>
              {this.state.loggedIn && thread && (
                <Typography variant="h5" noWrap>
                  {thread}
                </Typography>
              )}
            </Breadcrumbs>
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
        {this.state.loggedIn && (
          <ChatApp
            name={this.state.name}
            onChannelSelected={this.onChannelSelected}
          />
        )}
        {!this.state.loggedIn && (
          <SignIn
            name={this.state.name}
            onNameChanged={this.onNameChanged}
            logIn={this.logIn}
          />
        )}
      </div>
    );
  }

  onChannelSelected = channel => {
    this.setState({ selectedChannel: channel });
  };

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
    this.props.history.push("/");
  };
}

export default withRouter(withStyles(styles)(App));
