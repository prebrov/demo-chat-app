import { makeStyles, CircularProgress, Modal, Grid } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import Slide from "@material-ui/core/Slide";
import TextField from "@material-ui/core/TextField";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import CloseIcon from "@material-ui/icons/Close";
import React, { useEffect } from "react";
import AddressInput from "./AddressInput";
import theme from "./theme";
import StatusMessage from "./StatusMessage";

require("promise.allsettled").shim();

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles(theme => ({
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flex: "0 1"
  },
  form: {
    display: "flex",
    flex: "1 1 auto",
    flexDirection: "column",
    padding: theme.spacing(3),
    width: "100%"
  },
  dialog: {
    padding: theme.spacing(4)
  }
}));

export default function ChannelDialog(props) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(
    props.channel ? props.channel.friendlyName : ""
  );
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState(null);
  const [addresses, setAddresses] = React.useState([props.myIdentity]);

  useEffect(() => {
    if (props.members) {
      setAddresses(props.members.map(i => i.identity));
    }
    setOpen(props.open);
  }, [props.members, props.open]);

  const classes = useStyles();

  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  function handleClose() {
    setLoading(false);
    setOpen(false);
    props.onClose && props.onClose();
  }

  async function handleCreate() {
    const response = await fetch(
      process.env.REACT_APP_CHAT_BACKEND + "chat/create?ChannelName=" + encodeURIComponent(name)
    );
    const channel = await response.json();
    const promises = addresses.map(addr => {
      const party =
        addr.startsWith("+") ||
        addr.startsWith("messenger") ||
        addr.startsWith("whatsapp")
          ? `Address=${encodeURIComponent(addr)}`
          : `Identity=${encodeURIComponent(addr)}`;
      const url = `${process.env.REACT_APP_CHAT_BACKEND}chat/create?Channel=${channel.sid}&${party}`;
      return new Promise( async (resolve, reject) => {
        const result = await fetch(url);
        if (result.ok) {
          resolve(await result.json());
        } else {
          reject((await result.json()).error);
        }
      });
    });
    setLoading(true);
    Promise.allSettled(promises).then(result => {
      let failed = result.find(r => r.status === "rejected");
      if (failed) {
        console.log(failed.reason);
        setStatus({ message: failed.reason, variant: "error" });
      } else { 
        setStatus({
          message: `Conversation '${name}' created`,
          variant: "success"
        });
      }
      handleClose();
    });
  }

  async function handleUpdate() {
    try {
      await fetch(
        `${process.env.REACT_APP_CHAT_BACKEND}chat/create?Channel=${props.channel.sid}&ChannelName=${encodeURIComponent(name)}`
      )
    } catch (err) {
      console.error(err);
      setStatus({ message: err, variant: "error" });
      return;
    }
    const memberAddresses = props.members.map(m => m.identity);
    // get added parties
    let added = addresses.filter(x => !memberAddresses.includes(x));
    console.log("added: ", added);

    // get removed parties
    let removed = props.members.filter(x => !addresses.includes(x.identity));
    console.log("removed: ", removed);

    let promises = added.map(addr => {
      const party =
        addr.startsWith("+") ||
        addr.startsWith("messenger") ||
        addr.startsWith("whatsapp")
          ? `Address=${encodeURIComponent(addr)}`
          : `Identity=${encodeURIComponent(addr)}`;
      const url = `${process.env.REACT_APP_CHAT_BACKEND}chat/create?Channel=${props.channel.sid}&${party}`;
      return new Promise( async (resolve, reject) => {
        const result = await fetch(url);
        if (result.ok) {
          resolve(await result.json());
        } else {
          reject((await result.json()).error);
        }
      });
    });
    promises.concat(removed.map(member => {
      const url = `${process.env.REACT_APP_CHAT_BACKEND}chat/remove?Channel=${props.channel.sid}&Participant=${member.state.sid}`;
      return new Promise( async (resolve, reject) => {
        const result = await fetch(url);
        if (result.ok) {
          resolve(await result.json());
        } else {
          reject((await result.json()).error);
        }
      });
    }))
    Promise.allSettled(promises).then(result => {
      props.onMembersChanged && props.onMembersChanged(addresses);
      let failed = result.find(r => r.status === "rejected");
      if (failed) {
        console.log(failed.reason);
        setStatus({ message: failed.reason, variant: "error" });
      } else {
        setStatus({ message: `Conversation '${name}' updated`, variant: "success" });
      }
      handleClose();
    });
  }

  return (
    <div>
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        fullScreen={fullScreen}
        fullWidth={true}
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        aria-labelledby="form-dialog-title"
      >
        <Container>
          <DialogTitle
            disableTypography
            id="form-dialog-title"
            className={classes.dialogTitle}
          >
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Conversation Name"
              type="text"
              fullWidth
              required
              value={name}
              onChange={event => {
                setName(event.target.value);
              }}
            />
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className={classes.form}>
            <AddressInput onChange={setAddresses} addresses={addresses} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            {props.channel ? (
              <Button onClick={handleUpdate} color="primary">
                Update Conversation
              </Button>
            ) : (
              <Button onClick={handleCreate} color="primary">
                Create Conversation
              </Button>
            )}
          </DialogActions>
        </Container>
        <Modal open={loading} keepMounted>
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
      </Dialog>
      {status && <StatusMessage open={status !== null} message={status.message} variant={status.variant} onClose={() => { setStatus(null) }} />}
    </div>
  );
}
