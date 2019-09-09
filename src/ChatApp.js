import React from "react";
import { Client as ChatClient } from "twilio-chat";
import ChatChannel from "./ChatChannel";

import { withStyles } from "@material-ui/styles";

import List from "@material-ui/core/List";
import Link from "@material-ui/core/Link";

import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import theme from "./theme";

// import './Chat.css';
import {
  BrowserRouter as Router,
  NavLink,
  Route,
  Redirect
} from "react-router-dom";

const ForwardNavLink = React.forwardRef((props, ref) => (
  <NavLink {...props} innerRef={ref} />
));

const styles = {
  channels: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  }
};

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
      process.env.REACT_APP_CHAT_BACKEND + "?Identity=" + this.props.name
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
        this.setState({ statusString: "You are connected." });
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
        <Router>
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
                    <div>
                      <h3>Open Conversations</h3>
                      <List>
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
                      </List>
                      <h4>{this.state.statusString}</h4>
                    </div>
                  );
                }}
              />
            </div>
          </div>
        </Router>
      </div>
    );
  }
}

export default withStyles(styles)(ChatApp);
