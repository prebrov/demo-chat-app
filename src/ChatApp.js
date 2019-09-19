import React from "react";
import { Client as ChatClient } from "twilio-chat";
import ChatChannel from "./ChatChannel";

import { withStyles } from "@material-ui/styles";

import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

import ChannelTile from "./ChannelTile";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";

import Paper from "@material-ui/core/Paper";
import AddIcon from "@material-ui/icons/Add";

// import './Chat.css';
import { NavLink, Route, Redirect } from "react-router-dom";

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
      messages: []
    };
    this.channelName = "general";
  }

  componentDidMount = () => {
    this.getToken();
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
    this.chatClient.on("channelJoined", channel => {
      this.setState({ channels: [...this.state.channels, channel] });
    });
    this.chatClient.on("channelLeft", thisChannel => {
      this.setState({
        channels: [...this.state.channels.filter(it => it !== thisChannel)]
      });
    });
  };

  messagesLoaded = messagePage => {
    this.setState({ messages: messagePage.items });
  };

  render() {
    const { classes } = this.props;

    return (
      <div>
        <div className={classes.toolbar} id="back-to-top-anchor" />
        <div className={classes.row}>
          <div id="SelectedChannel">
            <Route
              path="/channels/:selected_channel"
              render={({ match }) => {
                let selectedChannelSid = match.params.selected_channel;
                let selectedChannel = this.state.channels.find(
                  it => it.sid === selectedChannelSid
                );

                if (selectedChannel)
                  return (
                    <ChatChannel
                      channelProxy={selectedChannel}
                      myIdentity={this.props.name}
                    />
                  );
                else return <Redirect to="/" />;
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
                            md={3}
                            key={"grid-" + channel.sid}
                          >
                            <Link
                              component={ForwardNavLink}
                              style={{ textDecoration: "none" }}
                              key={"link-" + channel.sid}
                              to={{
                                pathname: `/channels/${channel.sid}`,
                                state: { channelName: channel.friendlyName }
                              }}
                            >
                              <ChannelTile
                                key={channel.sid}
                                channel={channel}
                              />
                            </Link>
                          </Grid>
                        ))}
                        {this.state.chatReady && (
                          <Grid item xs={12} key="new">
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

                      {/* <List>
                        {this.state.channels.map(channel => (
                          <Link
                            component={ForwardNavLink}
                            key={channel.sid}
                            to={`/channels/${channel.sid}`}
                            color="secondary"
                          >
                            <ListItem button className={classes.channels}>
                              <ListItemText primary={channel.friendlyName} />
                            </ListItem>
                          </Link>
                        ))}
                      </List> */}
                      <h4>{this.state.statusString}</h4>
                    </Box>
                  </Container>
                );
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ChatApp);
