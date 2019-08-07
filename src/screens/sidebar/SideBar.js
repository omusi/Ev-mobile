import React from "react";
import { ResponsiveComponent } from "react-native-responsive-ui";
import { ImageBackground, TouchableOpacity, Image } from "react-native";
import { Container, Content, Text, Icon, ListItem, Thumbnail, View } from "native-base";
import computeStyleSheet from "./SideBarStyles";
import I18n from "../../I18n/I18n";
import Utils from "../../utils/Utils";
import DeviceInfo from "react-native-device-info";
import BackgroundComponent from "../../components/background/BackgroundComponent";
import moment from "moment";
import BaseScreen from "../base-screen/BaseScreen";

const noPhoto = require("../../../assets/no-photo-inverse.png");
const logo = require("../../../assets/logo-low.png");

class SideBar extends BaseScreen {
  constructor(props) {
    super(props);
    this.state = {
      userName: "",
      userID: "",
      userImage: "",
      isComponentOrganizationActive: false
    };
  }

  async componentDidMount() {
    // Call parent
    await super.componentDidMount();
    // Logoff
    const userInfo = this.centralServerProvider.getUserInfo();
    // Add sites
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState(
      {
        userName: `${userInfo.name} ${userInfo.firstName}`,
        userID: `${userInfo.id}`,
        isComponentOrganizationActive : (this.securityProvider ? this.securityProvider.isComponentOrganizationActive() : false)
      },
      async () => {
        await this._getUserImage();
      }
    );
  }

  async refresh() {
    await this._getUserImage();
  }

  async _getUserImage() {
    const { userID } = this.state;
    try {
      const result = await this.centralServerProvider.getUserImage({ ID: userID });
      if (result) {
        this.setState({ userImage: result.image });
      }
    } catch (error) {
      // Other common Error
      Utils.handleHttpUnexpectedError(error, this.props.navigation, this.refresh);
    }
  }

  async _logoff() {
    // Logoff
    this.centralServerProvider.logoff();
    // Back to login
    this.props.navigation.navigate("AuthNavigator");
  }

  _navigateTo = (screen, params = {}) => {
    // Navigate
    this.props.navigation.navigate({ routeName: screen, params });
    // Close
    this.props.navigation.closeDrawer();
  };

  render() {
    const style = computeStyleSheet();
    const navigation = this.props.navigation;
    const { userName, userImage, isComponentOrganizationActive } = this.state;
    return (
      <Container style={style.container}>
        <BackgroundComponent>
          <Content style={style.drawerContent}>
            <View style={style.logoContainer}>
              <Image source={logo} style={style.logo} />
              <Text style={style.versionText}>
                {`${I18n.t("general.version")} ${DeviceInfo.getVersion()}`}
              </Text>
              {DeviceInfo.getLastUpdateTime() ?
                <Text style={style.versionDate}>
                  {moment(DeviceInfo.getLastUpdateTime()).format("LL")}
                </Text>
              :
                undefined
              }
            </View>
            {isComponentOrganizationActive ? (
              <ListItem
                style={style.links}
                button
                iconLeft
                onPress={() => this._navigateTo("Sites")}
              >
                <Icon style={style.linkIcon} type="MaterialIcons" name="store-mall-directory" />
                <Text style={style.linkText}>{I18n.t("sidebar.sites")}</Text>
              </ListItem>
            ) : (
              undefined
            )}
            <ListItem
              style={style.links}
              button
              iconLeft
              onPress={() => this._navigateTo("AllChargers")}
            >
              <Icon style={style.linkIcon} type="MaterialIcons" name="ev-station" />
              <Text style={style.linkText}>{I18n.t("sidebar.chargers")}</Text>
            </ListItem>
            {/* <ListItem button onPress={() => navigation.navigate("Settings")} iconLeft style={style.links}>
              <Icon name="ios-settings-outline" />
              <Text style={style.linkText}>SETTINGS</Text>
            </ListItem> */}
            {/* <ListItem button onPress={() => navigation.navigate("Feedback")} iconLeft style={style.links}>
              <Icon name="ios-paper-outline" />
              <Text style={style.linkText}>FEEDBACK</Text>
            </ListItem> */}
          </Content>
          <View style={style.logoutContainer}>
            <View style={style.logoutButton} foregroundColor={"white"}>
              <View style={style.gridLogoutContainer}>
                <View style={style.columnAccount}>
                  <TouchableOpacity style={style.buttonLogout} onPress={() => this._logoff()}>
                    <Text style={style.logoutText}>{I18n.t("authentication.logOut")}</Text>
                    <Text note style={style.userName}>
                      {userName}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={style.columnThumbnail}>
                  <TouchableOpacity
                    style={style.buttonThumbnail}
                    onPress={() => navigation.navigate("Profile")}
                  >
                    <Thumbnail
                      style={style.profilePic}
                      source={userImage ? { uri: userImage } : noPhoto}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </BackgroundComponent>
      </Container>
    );
  }
}

export default SideBar;
