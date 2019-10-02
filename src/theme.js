import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles";

import signInBackdrop from "./img/engage-syd-backdrop.jpg"
import logo from "./img/twilio-logo-white.svg"

let theme = createMuiTheme({
  palette: {
    primary: {
      main: "#F22F46"
    },
    secondary: {
      main: "#008CFF"
    },
    type: "dark"
  },
  overrides: {
    MuiButton: {
      outlined: {
        color: "white"
      }
    },
    MuiBreadcrumbs: {
      ol: {
        flexWrap: "nowrap"
      }
    }
  },
  images: {
    logo: logo,
    signIn: signInBackdrop
  }
});

theme = responsiveFontSizes(theme);


export default theme;
