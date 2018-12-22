import { ResponsiveStyleSheet } from "react-native-responsive-ui";
import commonColor from "../../theme/variables/commonColor";
import deepmerge from "deepmerge";

const commonStyles = {
  nodisplay: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "black"
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.1)"
  },
  content: {
    height: "100%",
    width: "100%"
  },
  container: {
    flex: 1,
    width: "100%",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "stretch"
  },
  logo: {
    resizeMode: "contain",
    alignSelf: "center",
    flexGrow: 1
  },
  form: {
    paddingLeft: 15,
    paddingRight: 15,
    flexGrow: 2
  },
  button: {
    alignSelf: "center",
    marginBottom: 15,
    backgroundColor: "rgba(255,255,255,0.30)"
  },
  buttonText: {
    color: commonColor.textColor
  },
  inputGroup: {
    backgroundColor: "rgba(255,255,255,0.3)",
    marginBottom: 15,
    alignSelf: "center",
    borderWidth: 0,
    borderColor: "transparent"
  },
  formErrorText: {
    color: commonColor.brandDanger,
    textAlign: "left",
    top: -5
  },
  eulaContainer : {
    alignSelf: "center",
    borderBottomWidth: 0,
    paddingTop: 0,
    paddingBottom: 5,
    margin: 5
  },
  eulaText: {
    alignSelf: "flex-start",
    marginLeft: 15,
    color: commonColor.textColor
  },
  eulaLink: {
    color: commonColor.textColor,
    textDecorationLine: "underline"
  },
  spinner: {
    color: commonColor.brandDanger
  },
  linksButtonLeft: {
    alignSelf: "flex-start"
  },
  linksButtonRight: {
    alignSelf: "flex-end"
  },
  linksTextButton: {
    opacity: 0.9,
    fontWeight: "bold",
    color: commonColor.textColor
  }
};

const portraitStyles = {
  logo: {
    height: "25%",
    width: "50%"
  },
  formErrorText: {
    marginLeft: "5%"
  },
  eulaContainer: {
    width: "95%"
  },
  button: {
    width: "95%"
  },
  inputGroup: {
    width: "95%"
  }
};

const landscapeStyles = {
  logo: {
    height: "15%",
    width: "25%"
  },
  formErrorText: {
    marginLeft: "18%"
  },
  eulaContainer: {
    width: "65%"
  },
  button: {
    width: "65%"
  },
  inputGroup: {
    width: "65%"
  }
};

export default function computeStyleSheet() {
  return ResponsiveStyleSheet.select([
    {
      query: { orientation: "landscape" },
      style: deepmerge(commonStyles, landscapeStyles)
    },
    {
      query: { orientation: "portrait" },
      style: deepmerge(commonStyles, portraitStyles)
    }
  ]);
}
