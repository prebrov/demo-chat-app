import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles";

import signInBackdrop from "./img/engage-syd-backdrop.jpg"

let theme = createMuiTheme({
  palette: {
    primary: {
      main: "#F22F46"
    },
    secondary: {
      main: "#565B73"
    },
    type: "light"
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
    signIn: signInBackdrop
  }
});

theme = responsiveFontSizes(theme);


export default theme;
