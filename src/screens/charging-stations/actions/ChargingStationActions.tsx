import I18n from 'i18n-js';
import React from 'react';
import {ActivityIndicator, Alert, ScrollView, View} from 'react-native';

import HeaderComponent from '../../../components/header/HeaderComponent';
import BaseProps from '../../../types/BaseProps';
import ChargingStation, { ChargePointStatus } from '../../../types/ChargingStation';
import Message from '../../../utils/Message';
import Utils from '../../../utils/Utils';
import BaseAutoRefreshScreen from '../../base-screen/BaseAutoRefreshScreen';
import computeStyleSheet from './ChargingStationActionsStyles';
import { scale } from 'react-native-size-matters';
import {Button, Icon} from 'react-native-elements';
import computeFormStyle from '../../../FormStyles';

export interface Props extends BaseProps {}

interface State {
  loading?: boolean;
  chargingStation: ChargingStation;
  spinnerResetHard?: boolean;
  spinnerResetSoft?: boolean;
  spinnerClearCache?: boolean;
  spinnerConnectors: Map<number, boolean>;
  connectorsInactive?: boolean;
}

export default class ChargingStationActions extends BaseAutoRefreshScreen<Props, State> {
  public state: State;
  public props: Props;
  private chargingStationID: string;

  public constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      chargingStation: null,
      spinnerResetHard: false,
      spinnerResetSoft: false,
      spinnerClearCache: false,
      spinnerConnectors: new Map(),
      connectorsInactive: false
    };
  }

  public setState = (
    state: State | ((prevState: Readonly<State>, props: Readonly<Props>) => State | Pick<State, never>) | Pick<State, never>,
    callback?: () => void
  ) => {
    super.setState(state, callback);
  };

  public async componentDidMount() {
    // Add ChargingStations
    this.chargingStationID = Utils.getParamFromNavigation(this.props.route, 'chargingStationID', null) as string;
    await super.componentDidMount();
  }

  public getChargingStation = async (): Promise<ChargingStation> => {
    try {
      // Get Charger
      const chargingStation = await this.centralServerProvider.getChargingStation(this.chargingStationID);
      return chargingStation;
    } catch (error) {
      // Other common Error
      await Utils.handleHttpUnexpectedError(
        this.centralServerProvider,
        error,
        'chargers.chargerUnexpectedError',
        this.props.navigation,
        this.refresh.bind(this)
      );
    }
    return null;
  };

  public resetHardConfirm() {
    const { chargingStation } = this.state;
    Alert.alert(I18n.t('chargers.resetHard'), I18n.t('chargers.resetHardMessage', { chargeBoxID: chargingStation.id }), [
      { text: I18n.t('general.yes'), onPress: async () => this.reset(chargingStation.id, 'Hard') },
      { text: I18n.t('general.cancel') }
    ]);
  }

  public resetSoftConfirm() {
    const { chargingStation } = this.state;
    Alert.alert(I18n.t('chargers.resetSoft'), I18n.t('chargers.resetSoftMessage', { chargeBoxID: chargingStation.id }), [
      { text: I18n.t('general.yes'), onPress: async () => this.reset(chargingStation.id, 'Soft') },
      { text: I18n.t('general.cancel') }
    ]);
  }

  public async reset(chargeBoxID: string, type: 'Soft' | 'Hard') {
    try {
      if (type === 'Hard') {
        this.setState({ spinnerResetHard: true });
      } else {
        this.setState({ spinnerResetSoft: true });
      }
      // Start the Transaction
      const status = await this.centralServerProvider.reset(chargeBoxID, type);
      // Check
      if (status.status && status.status === 'Accepted') {
        Message.showSuccess(I18n.t('details.accepted'));
      } else {
        Message.showError(I18n.t('details.denied'));
      }
      this.setState({
        spinnerResetHard: false,
        spinnerResetSoft: false
      });
    } catch (error) {
      this.setState({
        spinnerResetHard: false,
        spinnerResetSoft: false
      });
      // Other common Error
      await Utils.handleHttpUnexpectedError(
        this.centralServerProvider,
        error,
        type === 'Hard' ? 'chargers.chargerRebootUnexpectedError' : 'chargers.chargerResetUnexpectedError',
        this.props.navigation
      );
    }
  }

  public clearCacheConfirm() {
    const { chargingStation } = this.state;
    Alert.alert(I18n.t('chargers.clearCache'), I18n.t('chargers.clearCacheMessage', { chargeBoxID: chargingStation.id }), [
      { text: I18n.t('general.yes'), onPress: async () => this.clearCache(chargingStation.id) },
      { text: I18n.t('general.cancel') }
    ]);
  }

  public async clearCache(chargeBoxID: string) {
    try {
      this.setState({ spinnerClearCache: true });
      // Clear Cache
      const status = await this.centralServerProvider.clearCache(chargeBoxID);
      // Check
      if (status.status && status.status === 'Accepted') {
        Message.showSuccess(I18n.t('details.accepted'));
      } else {
        Message.showError(I18n.t('details.denied'));
      }
      this.setState({ spinnerClearCache: false });
    } catch (error) {
      this.setState({ spinnerClearCache: false });
      Message.showError(I18n.t('details.denied'));
      // Other common Error
      await Utils.handleHttpUnexpectedError(
        this.centralServerProvider,
        error,
        'chargers.chargerClearCacheUnexpectedError',
        this.props.navigation
      );
    }
  }

  public unlockConnectorConfirm(connectorId: number) {
    const { chargingStation } = this.state;
    Alert.alert(
      I18n.t('chargers.unlockConnector', { connectorId: Utils.getConnectorLetterFromConnectorID(connectorId) }),
      I18n.t('chargers.unlockConnectorMessage', {
        chargeBoxID: chargingStation.id,
        connectorId: Utils.getConnectorLetterFromConnectorID(connectorId)
      }),
      [
        { text: I18n.t('general.yes'), onPress: async () => this.unlockConnector(chargingStation.id, connectorId) },
        { text: I18n.t('general.cancel') }
      ]
    );
  }

  public async unlockConnector(chargeBoxID: string, connectorID: number) {
    const spinnerConnectors = this.state.spinnerConnectors;
    try {
      spinnerConnectors.set(connectorID, true);
      this.setState({
        spinnerConnectors,
        connectorsInactive: true
      });
      // Unlock Connector
      const status = await this.centralServerProvider.unlockConnector(chargeBoxID, connectorID);
      // Check
      if (status.status && status.status === 'Unlocked') {
        Message.showSuccess(I18n.t('details.accepted'));
      } else {
        Message.showError(I18n.t('details.denied'));
      }
      spinnerConnectors.set(connectorID, false);
      this.setState({
        spinnerConnectors,
        connectorsInactive: false
      });
    } catch (error) {
      spinnerConnectors.set(connectorID, false);
      this.setState({
        spinnerConnectors,
        connectorsInactive: false
      });
      // Other common Error
      await Utils.handleHttpUnexpectedError(
        this.centralServerProvider,
        error,
        'chargers.chargerUnlockUnexpectedError',
        this.props.navigation
      );
    }
  }

  public refresh = async () => {
    if (this.isMounted()) {
      const spinnerConnectors = new Map();
      // Get Charger
      const chargingStation = await this.getChargingStation();
      if (chargingStation) {
        chargingStation.connectors.map((connector) => {
          spinnerConnectors.set(connector.connectorId, false);
        });
        this.setState(() => ({
          loading: false,
          chargingStation,
          spinnerConnectors
        }));
      }
    }
  };

  public render() {
    const style = computeStyleSheet();
    const formStyle = computeFormStyle();
    const { loading, chargingStation, spinnerResetHard, spinnerResetSoft, spinnerConnectors, spinnerClearCache, connectorsInactive } =
      this.state;
    const chargingStationIsDisabled = chargingStation
      ? chargingStation.inactive || spinnerResetHard || spinnerResetSoft || spinnerClearCache || connectorsInactive
      : false;
    return loading ? (
      <ActivityIndicator size={scale(30)} style={style.spinner} color="grey" />
    ) : (
      <View style={style.container}>
        <HeaderComponent
          navigation={this.props.navigation}
          title={chargingStation ? chargingStation.id : I18n.t('connector.unknown')}
          subTitle={chargingStation && chargingStation.inactive ? `(${I18n.t('details.inactive')})` : null}
          containerStyle={style.headerContainer}
        />
        <ScrollView contentContainerStyle={style.scrollViewContainer}>
          <View style={style.viewContainer}>
            <View style={style.actionContainer}>
              <Button
                title={I18n.t('chargers.resetHard')}
                disabled={chargingStationIsDisabled}
                disabledStyle={formStyle.buttonDisabled}
                disabledTitleStyle={formStyle.buttonTextDisabled}
                loading={spinnerResetHard}
                buttonStyle={[style.actionButton, chargingStationIsDisabled ? null : style.resetButton]}
                icon={<Icon size={scale(20)} iconStyle={style.actionButtonIcon} type={'material'} name="repeat" />}
                iconPosition={'left'}
                onPress={() => this.resetHardConfirm()}
              />
            </View>
            {chargingStation &&
              chargingStation.connectors.map((connector) => (
                <View key={connector.connectorId} style={style.actionContainer}>
                  <Button
                    title={I18n.t('chargers.unlockConnector', { connectorId: Utils.getConnectorLetterFromConnectorID(connector.connectorId) })}
                    disabled={chargingStationIsDisabled || connector.status === ChargePointStatus.AVAILABLE}
                    disabledStyle={formStyle.buttonDisabled}
                    disabledTitleStyle={formStyle.buttonTextDisabled}
                    loading={spinnerConnectors.get(connector.connectorId)}
                    buttonStyle={[style.actionButton, (!chargingStationIsDisabled && connector.status !== ChargePointStatus.AVAILABLE) && {backgroundColor: Utils.getCurrentCommonColor().warning} ]}
                    icon={<Icon size={scale(20)} iconStyle={style.actionButtonIcon} type={'material'} name="lock-open" />}
                    iconPosition={'left'}
                    onPress={() => this.unlockConnectorConfirm(connector.connectorId)}
                  />
                </View>
              ))}
            <View style={style.actionContainer}>
              <Button
                title={I18n.t('chargers.resetSoft')}
                disabled={chargingStationIsDisabled}
                disabledStyle={formStyle.buttonDisabled}
                disabledTitleStyle={formStyle.buttonTextDisabled}
                loading={spinnerResetSoft}
                buttonStyle={[style.actionButton, chargingStationIsDisabled ? null : style.warningButton]}
                icon={<Icon size={scale(20)} iconStyle={style.actionButtonIcon} type={'material'} name="layers-clear" />}
                iconPosition={'left'}
                onPress={() => this.resetSoftConfirm()}
              />
            </View>
            <View style={style.actionContainer}>
              <Button
                title={I18n.t('chargers.clearCache')}
                disabled={chargingStationIsDisabled}
                disabledStyle={formStyle.buttonDisabled}
                disabledTitleStyle={formStyle.buttonTextDisabled}
                loading={spinnerClearCache}
                buttonStyle={[style.actionButton, chargingStationIsDisabled ? null : style.warningButton]}
                icon={<Icon size={scale(20)} iconStyle={style.actionButtonIcon} type={'material'} name="refresh" />}
                iconPosition={'left'}
                onPress={() => this.clearCacheConfirm()}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}
