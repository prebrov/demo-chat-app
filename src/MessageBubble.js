import React, { Component } from "react";

import Moment from "react-moment";

import { withStyles } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";

const styles = theme => ({
  container: {},
  message: props => ({
    padding: theme.spacing(
      0,
      props.direction === "incoming" ? 1 : 0,
      0,
      props.direction !== "incoming" ? 1 : 0
    ),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: "75%",
    float: props.direction === "incoming" ? "right" : "left"
  }),
  bubble: props => ({
    backgroundColor:
      props.direction === "incoming"
        ? theme.palette.grey["400"]
        : theme.palette.secondary.dark,
    borderRadius: "3px",
    color: theme.palette.getContrastText(
      props.direction === "incoming"
        ? theme.palette.grey["400"]
        : theme.palette.secondary.dark
    ),
    margin: "0",
    padding: theme.spacing(1, 2, 1, 2)
  }),
  time_date: props => ({
    color: "#747474",
    ...theme.typography.subtitle2,
    margin: theme.spacing(0, 0, 1),
    float: props.direction === "incoming" ? "right" : "left"
  }),
  image: {
    height: "100%",
    width: "100%",
    objectFit: "scale-down"
  }
});

class MessageBubble extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mediaDownloadFailed: false,
      mediaUrl: null
    };
  }

  componentDidMount = () => {
    if (this.props.message.type === "media") {
      this.props.message.media
        .getContentUrl()
        .then(url => {
          this.setState({ mediaUrl: url });
        })
        .catch(e => this.setState({ mediaDownloadFailed: true }));
    }
  };

  render = () => {
    const { classes } = this.props;
    const m = this.props.message;
    if (m.type === "media") {
      console.log("Message is media message");
      // log media properties
      console.log("Media properties", m.media);
    }
    const author = m.author.match(/(whatsapp:)?[+][0-9]+/) ? m.author.substring(0, m.author.length - 4) + "XXXX" : m.author;

    return (
      <div className={classes.container}>
        <div className={classes.message}>
          <Paper className={classes.bubble} elevation={2}>
            <strong>{author}</strong>
            <br />
            {m.type === "media" ? (
              <Media
                hasFailed={this.state.mediaDownloadFailed}
                url={this.state.mediaUrl}
              />
            ) : null}
            {m.body}
          </Paper>
          <span className={classes.time_date}>
            <Moment fromNow>{m.timestamp}</Moment>
          </span>
        </div>
      </div>
    );
  };
}

function MediaBase(props) {
  const { classes } = props;
  if (props.hasFailed) return <p>(Failed to download media!)</p>;
  else if (props.url === null) return <p>Downloading…</p>;
  // eslint-disable-next-line
  else return <img className={classes.image} src={props.url} />;
}

const Media = withStyles(styles)(MediaBase);

export default withStyles(styles)(MessageBubble);
