import React from "react";
import { Switch, NavLink, Route, withRouter } from "react-router-dom";

import { Client as ChatClient } from "twilio-chat";

import { withStyles } from "@material-ui/styles";

import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import AddIcon from "@material-ui/icons/Add";

import ErrorIcon from "@material-ui/icons/Error";

import ChatChannel from "./ChatChannel";
import ChannelDialog from "./ChannelDialog";
import ChannelTile from "./ChannelTile";
import { Modal, CircularProgress } from "@material-ui/core";

const ForwardNavLink = React.forwardRef((props, ref) => (
  <NavLink {...props} innerRef={ref} />
));

const styles = theme => ({
  margin: {
    margin: theme.spacing(2)
  },
  new: {
    padding: theme.spacing(2),
    borderWidth: "2px",
    borderStyle: "dashed",
    borderColor: theme.palette.text.hint,
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.secondary
  },
  centered: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  row: {
    margin: theme.spacing(2)
  },
  toolbar: theme.mixins.toolbar
});

class ChatApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
      statusString: null,
      chatReady: false,
      channels: [],
      messages: [],
      channelDialogOpen: false
    };
    this.channelName = "general";
  }

  componentDidMount = () => {
    this.getToken();
    setTimeout(() => {
      this.setState({ timeout: true });
    }, 5000);
    this.setState({ statusString: "Fetching credentials…" });
  };

  componentWillUnmount = () => {
    if (this.chatClient) {
      this.chatClient.shutdown();
    }
    this.channel = null;
  };

  getToken = async () => {
    // Paste your unique Chat token function
    const response = await fetch(
      process.env.REACT_APP_CHAT_BACKEND +
        "chat/token?Identity=" +
        this.props.name
    );
    const myToken = await response.json();
    this.setState({ token: myToken.token }, this.initChat);
  };

  initChat = async () => {
    window.chatClient = ChatClient;
    this.chatClient = await ChatClient.create(this.state.token, {
      logLevel: "info"
    });
    this.setState({ statusString: "Connecting to Twilio…" });

    this.chatClient.on("connectionStateChanged", state => {
      if (state === "connecting")
        this.setState({ statusString: "Connecting to Twilio…" });
      if (state === "connected") {
        this.setState({ statusString: "You are connected.", chatReady: true });
      }
      if (state === "disconnecting")
        this.setState({
          statusString: "Disconnecting from Twilio…",
          chatReady: false
        });
      if (state === "disconnected")
        this.setState({ statusString: "Disconnected.", chatReady: false });
      if (state === "denied")
        this.setState({ statusString: "Failed to connect.", chatReady: false });
    });
    this.chatClient.on("channelJoined", function(channel) {
      console.log("channelJoined", channel.friendlyName);
      if (this.props.location.pathname.endsWith(channel.sid)) {
        this.props.onChannelSelected && this.props.onChannelSelected(channel);
      }
      this.setState({ channels: [...this.state.channels, channel] });
    }.bind(this));
    this.chatClient.on("channelLeft", thisChannel => {
      this.setState({
        channels: [...this.state.channels.filter(it => it !== thisChannel)]
      });
    });
  };

  messagesLoaded = messagePage => {
    this.setState({ messages: messagePage.items });
  };

  openChannelDialog = () => {
    this.setState({ channelDialogOpen: true });
  };

  render() {
    const { classes } = this.props;

    return (
      <div>
        <div className={classes.toolbar} id="back-to-top-anchor" />
        <div className={classes.row}>
          <div id="SelectedChannel">
            <Switch>
              <Route
                path="/channels/:selected_channel"
                render={({ match }) => {
                  let selectedChannelSid = match.params.selected_channel;
                  if (!this.state.chatReady) {
                    return (
                      <Modal open={!this.state.chatReady} keepMounted>
                        <Grid
                          container
                          justify="center"
                          direction="column"
                          alignItems="center"
                          style={{ minHeight: "100vh" }}
                        >
                          <CircularProgress />
                        </Grid>
                      </Modal>
                    );
                  }
                  let selectedChannel = this.state.channels.find(
                    it => it.sid === selectedChannelSid
                  );
                  if (selectedChannel) {
                    return (
                      <ChatChannel
                        channelProxy={selectedChannel}
                        myIdentity={this.props.name}
                      />
                    );
                  }
                  if (this.state.timeout) {
                    return (
                      <Link to="/" component={ForwardNavLink}>
                        <Grid
                          container
                          justify="center"
                          direction="column"
                          alignItems="center"
                          style={{ minHeight: "100vh" }}
                        >
                          <ErrorIcon />
                          <Typography variant="h4">
                            Unable to load channel
                          </Typography>
                        </Grid>
                      </Link>
                    );
                  }
                }}
              />
              <Route
                exact
                path="/"
                render={match => {
                  return (
                    <Container>
                      <Box pt={2}>
                        <Typography variant="h4" gutterBottom>
                          Open Conversations
                        </Typography>
                        <Grid container spacing={3}>
                          {this.state.channels.map(channel => (
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              lg={3}
                              key={"grid-" + channel.sid}
                            >
                              <Link
                                component={ForwardNavLink}
                                style={{ textDecoration: "none" }}
                                key={"link-" + channel.sid}
                                to={`/channels/${channel.sid}`}
                              >
                                <ChannelTile
                                  key={channel.sid}
                                  channel={channel}
                                />
                              </Link>
                            </Grid>
                          ))}
                          {this.state.chatReady && (
                            <Grid
                              item
                              xs={12}
                              key="new"
                              onClick={this.openChannelDialog}
                            >
                              <Paper className={classes.new} elevation={0}>
                                <Typography
                                  variant="h5"
                                  className={classes.centered}
                                >
                                  <AddIcon />
                                  Start New Conversation
                                </Typography>
                              </Paper>
                            </Grid>
                          )}
                        </Grid>
                        <h4>
                          {this.state.statusString} [{this.props.name}]
                        </h4>
                        <ChannelDialog
                          myIdentity={this.props.name}
                          open={this.state.channelDialogOpen}
                          onClose={() => {
                            this.setState({ channelDialogOpen: false });
                          }}
                        />
                      </Box>
                    </Container>
                  );
                }}
              />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(ChatApp));
