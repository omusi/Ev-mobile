import React from "react";
import { ScrollView } from "react-native";
import { Container, View, Text, Spinner } from "native-base";
import { ResponsiveComponent } from "react-native-responsive-ui";
import I18n from "../../../I18n/I18n";
import computeStyleSheet from "./styles";
import ChargerHeader from "../ChargerHeader";
import Utils from "../../../utils/Utils";
import ProviderFactory from "../../../provider/ProviderFactory";

const _provider = ProviderFactory.getProvider();

class ChargerDetails extends ResponsiveComponent {
  constructor(props) {
    super(props);
    this.state = {
      chargerID: this.props.navigation.dangerouslyGetParent().state.params.chargerID,
      connectorID: this.props.navigation.dangerouslyGetParent().state.params.connectorID,
      charger: null,
      connector: null,
      firstLoad: true,
    };
  }

  async componentDidMount() {
    // Refresh Charger
    await this._getCharger();
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({
      firstLoad: false
    });
  }

  _getCharger = async () => {
    try {
      let charger = await _provider.getCharger(
        { ID: this.state.chargerID }
      );
      this.setState({
        charger: charger,
        connector: charger.connectors[this.state.connectorID - 1]
      });
    } catch (error) {
      // Other common Error
      Utils.handleHttpUnexpectedError(error, this.props);
    }
  }

  render() {
    const style = computeStyleSheet();
    const { navigation } = this.props;
    const { charger, connector, firstLoad } = this.state;
    return (
      <Container>
        {firstLoad ?
          <Spinner color="white" style={style.spinner} />
        :
          <View>
            <ChargerHeader charger={charger} connector={connector} navigation={navigation} />
            <ScrollView style={style.scrollViewContainer}>
              <View style={style.container}>
                <View style={style.columnContainer}>
                  <Text style={style.label}>{I18n.t("details.vendor")}</Text>
                  <Text style={style.value}>{charger.chargePointVendor ? charger.chargePointVendor : "-"}</Text>
                </View>
                <View style={style.columnContainer}>
                  <Text style={style.label}>{I18n.t("details.model")}</Text>
                  <Text style={style.value}>{charger.chargePointModel ? charger.chargePointModel : "-"}</Text>
                </View>
                <View style={style.columnContainer}>
                  <Text style={style.label}>{I18n.t("details.ocppVersion")}</Text>
                  <Text style={style.value}>{charger.ocppVersion ? charger.ocppVersion : "-"}</Text>
                </View>
                <View style={style.columnContainer}>
                  <Text style={style.label}>{I18n.t("details.firmwareVersion")}</Text>
                  <Text style={style.value}>{charger.firmwareVersion ? charger.firmwareVersion : "-"}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        }
      </Container>
    );
  }
}

export default ChargerDetails;
