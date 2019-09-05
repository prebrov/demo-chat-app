import React, { Component } from "react";
import ChatApp from "./ChatApp";
import "./App.css";

import AppIcon from "./AppIcon";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";

import { withStyles, ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";

const styles = {
  appIcon: {
    width: "10em",
    margin: "1.0em",
    height: "auto"
  }
};

const theme = createMuiTheme({
  palette: {
    primary: { main: "#1f77bc" }
  },
  images: {
    signIn: "https://www.deputy.com/static/homepage-052019/why-deputy@2x.jpg"
  }
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { classes } = this.props;
    return (
      <ThemeProvider theme={theme}>
        <div className="App">
          <AppBar position="static">
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
            </Toolbar>
          </AppBar>
          <ChatApp />
        </div>
      </ThemeProvider>
    );
  }
}

export default withStyles(styles)(App);
