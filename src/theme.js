import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles";

import signInBackdrop from "./img/owlshoes-hero.jpg"
import logo from "./img/owl-shoes-logo.png"

let theme = createMuiTheme({
  palette: {
    primary: {
      main: "#488EA1"
    },
    secondary: {
      main: "#2E7386"
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
  },
  strings: {
    loginTitle: "Driver communications system",
    openTitle: "Current deliveries",
    archivedTitle: "Past deliveries"
  }
});

theme = responsiveFontSizes(theme);


export default theme;
