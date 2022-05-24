import { StatusCodes } from 'http-status-codes';
import I18n from 'i18n-js';
import { Container, Icon, Spinner, Text, View } from 'native-base';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  ImageStyle,
  RefreshControl,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import Orientation from 'react-native-orientation-locker';

import noSite from '../../../../assets/no-site.png';
import CarComponent from '../../../components/car/CarComponent';
import ChargingStationConnectorComponent
  from '../../../components/charging-station/connector/ChargingStationConnectorComponent';
import ConnectorStatusComponent
  from '../../../components/connector-status/ConnectorStatusComponent';
import HeaderComponent from '../../../components/header/HeaderComponent';
import { ItemSelectionMode } from '../../../components/list/ItemsList';
import computeListItemCommonStyle from '../../../components/list/ListItemCommonStyle';
import DialogModal from '../../../components/modal/DialogModal';
import computeModalCommonStyle from '../../../components/modal/ModalCommonStyle';
import ModalSelect from '../../../components/modal/ModalSelect';
import TagComponent from '../../../components/tag/TagComponent';
import UserAvatar from '../../../components/user/avatar/UserAvatar';
import UserComponent from '../../../components/user/UserComponent';
import I18nManager from '../../../I18n/I18nManager';
import BaseProps from '../../../types/BaseProps';
import Car from '../../../types/Car';
import ChargingStation, { ChargePointStatus, Connector, OCPPGeneralResponse } from '../../../types/ChargingStation';
import { HTTPAuthError } from '../../../types/HTTPError';
import Tag from '../../../types/Tag';
import Transaction, { StartTransactionErrorCode } from '../../../types/Transaction';
import User, { UserDefaultTagCar, UserStatus } from '../../../types/User';
import UserToken from '../../../types/UserToken';
import Constants from '../../../utils/Constants';
import Message from '../../../utils/Message';
import Utils from '../../../utils/Utils';
import BaseAutoRefreshScreen from '../../base-screen/BaseAutoRefreshScreen';
import Cars from '../../cars/Cars';
import Tags from '../../tags/Tags';
import Users from '../../users/list/Users';
import computeStyleSheet from './ChargingStationConnectorDetailsStyles';
import { StatusCodes } from 'http-status-codes';
import { scale } from 'react-native-size-matters'
import computeActivityIndicatorCommonStyles from '../../../components/activity-indicator/ActivityIndicatorCommonStyle';

const START_TRANSACTION_NB_TRIAL = 4;

export interface Props extends BaseProps {}

export type SettingsErrors = {
  noBadgeError?: boolean,
  inactiveBadgeError?: boolean,
  billingError?: boolean,
  inactiveUserError?: boolean
}

export interface State {
  loading?: boolean;
  chargingStation?: ChargingStation;
  connector?: Connector;
  transaction?: Transaction;
  isAdmin?: boolean;
  isSiteAdmin?: boolean;
  canStartTransaction?: boolean;
  canStopTransaction?: boolean;
  canDisplayTransaction?: boolean;
  siteImage?: string;
  elapsedTimeFormatted?: string;
  totalInactivitySecs?: number;
  inactivityFormatted?: string;
  startTransactionNbTrial?: number;
  isPricingActive?: boolean;
  buttonDisabled?: boolean;
  refreshing?: boolean;
  userDefaultTagCar?: UserDefaultTagCar;
  showStartTransactionDialog: boolean;
  showStopTransactionDialog: boolean;
  selectedUser?: User;
  selectedCar?: Car;
  selectedTag?: Tag;
  tagCarLoading?: boolean;
  settingsErrors?: SettingsErrors,
  transactionPending?: boolean;
  didPreparing?: boolean;
  showAdviceMessage?: boolean;
  transactionPendingTimesUp?: boolean;
  showChargingSettings?: boolean;
}

export default class ChargingStationConnectorDetails extends BaseAutoRefreshScreen<Props, State> {
  public state: State;
  public props: Props;
  private currentUser: UserToken;
  private carModalRef = React.createRef<ModalSelect<Car>>();
  private tagModalRef = React.createRef<ModalSelect<Tag>>();

  public constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      chargingStation: null,
      userDefaultTagCar: null,
      connector: null,
      transaction: null,
      isAdmin: false,
      buttonDisabled: true,
      isSiteAdmin: false,
      canStartTransaction: false,
      canStopTransaction: false,
      canDisplayTransaction: false,
      siteImage: null,
      elapsedTimeFormatted: '-',
      totalInactivitySecs: 0,
      inactivityFormatted: '-',
      startTransactionNbTrial: 0,
      isPricingActive: false,
      refreshing: false,
      showStartTransactionDialog: undefined,
      showStopTransactionDialog: false,
      selectedUser: null,
      selectedCar: null,
      selectedTag: null,
      tagCarLoading: false,
      settingsErrors: {},
      transactionPending: false,
      showAdviceMessage: false,
      didPreparing: false,
      transactionPendingTimesUp: false,
      showChargingSettings: undefined
    };
  }

  public setState = (
    state: State | ((prevState: Readonly<State>, props: Readonly<Props>) => State | Pick<State, never>) | Pick<State, never>,
    callback?: () => void
  ) => {
    super.setState(state, callback);
  };

  public async componentDidMount(): Promise<void> {
    await super.componentDidMount(false);
    this.currentUser = this.centralServerProvider.getUserInfo();
    const userFromNavigation = Utils.getParamFromNavigation(this.props.route, 'user', null) as unknown as User;
    const tagFromNavigation = Utils.getParamFromNavigation(this.props.route, 'tag', null) as unknown as Tag;
    const currentUser = {
      id: this.currentUser?.id,
      firstName: this.currentUser?.firstName,
      name: this.currentUser?.name,
      status: UserStatus.ACTIVE,
      role: this.currentUser.role,
      email: this.currentUser.email
    } as User;
    const selectedUser = userFromNavigation ?? currentUser;
    await this.loadSelectedUserDefaultTagAndCar(selectedUser);
    const selectedTag = tagFromNavigation ?? this.state.selectedTag;
    this.setState({ selectedUser, selectedTag }, async() => this.refresh());
  }

  public componentDidFocus(): void {
    super.componentDidFocus();
    Orientation.lockToPortrait();
  }

  public componentDidBlur(): void {
    super.componentDidBlur();
    Orientation.unlockAllOrientations();
  }

  public componentWillUnmount(): void {
    super.componentWillUnmount();
    Orientation.unlockAllOrientations();
  }

  public getSiteImage = async (siteID: string): Promise<string> => {
    try {
      // Get Site
      const siteImage = await this.centralServerProvider.getSiteImage(siteID);
      return siteImage;
    } catch (error) {
      if (error.request.status !== StatusCodes.NOT_FOUND) {
        // Other common Error
        await Utils.handleHttpUnexpectedError(
          this.centralServerProvider,
          error,
          'sites.siteUnexpectedError',
          this.props.navigation,
          this.refresh.bind(this)
        );
      }
    }
    return null;
  };

  public getChargingStation = async (chargingStationID: string): Promise<ChargingStation> => {
    try {
      // Get Charger
      const chargingStation = await this.centralServerProvider.getChargingStation(chargingStationID);
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

  public getTransaction = async (transactionID: number): Promise<Transaction> => {
    try {
      // Get Transaction
      const transaction = await this.centralServerProvider.getTransaction(transactionID);
      return transaction;
    } catch (error) {
      // Check if HTTP?
      if (!error.request || error.request.status !== HTTPAuthError.FORBIDDEN) {
        await Utils.handleHttpUnexpectedError(
          this.centralServerProvider,
          error,
          'transactions.transactionUnexpectedError',
          this.props.navigation,
          this.refresh.bind(this)
        );
      }
    }
    return null;
  };

  public getLastTransaction = async (chargeBoxID: string, connectorId: number): Promise<Transaction> => {
    try {
      // Get Transaction
      const transaction = await this.centralServerProvider.getLastTransaction(chargeBoxID, connectorId);
      return transaction;
    } catch (error) {
      // Check if HTTP?
      if (!error.request || error.request.status !== HTTPAuthError.FORBIDDEN) {
        await Utils.handleHttpUnexpectedError(
          this.centralServerProvider,
          error,
          'transactions.transactionUnexpectedError',
          this.props.navigation,
          this.refresh.bind(this)
        );
      }
    }
    return null;
  };

  public showLastTransaction = async () => {
    const { navigation } = this.props;
    const chargingStationID = Utils.getParamFromNavigation(this.props.route, 'chargingStationID', null) as string;
    const connectorID: number = Utils.convertToInt(Utils.getParamFromNavigation(this.props.route, 'connectorID', null) as string);
    // Get the last session
    const transaction = await this.getLastTransaction(chargingStationID, connectorID);
    if (transaction) {
      // Navigate
      navigation.navigate('TransactionDetailsTabs', {
        params: { transactionID: transaction.id },
        key: `${Utils.randomNumber()}`
      });
    } else {
      Alert.alert(I18n.t('chargers.noSession'), I18n.t('chargers.noSessionMessage'));
    }
  };

  public showReportError = async () => {
    const { navigation } = this.props;
    const chargingStationID = Utils.getParamFromNavigation(this.props.route, 'chargingStationID', null) as string;
    const connectorID: number = Utils.convertToInt(Utils.getParamFromNavigation(this.props.route, 'connectorID', null) as string);
    // Get the last session
    // Navigate
    navigation.navigate('ReportError', {
      params: {
        chargingStationID,
        connectorID
      },
      key: `${Utils.randomNumber()}`
    });
  };

  public isTransactionStillPending(connector: Connector): boolean {
    const { transactionPending, transactionPendingTimesUp, didPreparing } = this.state;
    if (transactionPending) {
      if (connector?.status === ChargePointStatus.PREPARING) {
        this.setState({ didPreparing: true });
        return true;
      } else if (connector?.status === ChargePointStatus.AVAILABLE && !didPreparing && !transactionPendingTimesUp) {
        return true;
      }
    }
    return false;
  }

  // eslint-disable-next-line complexity
  public async refresh(showSpinner = false): Promise<void> {
    const newState = showSpinner ? {refreshing: true} : this.state;
    this.setState(newState, async () => {
      let siteImage = this.state.siteImage;
      let transaction = null;
      const settingsErrors: SettingsErrors = {};
      let showStartTransactionDialog: boolean;
      let showAdviceMessage = false;
      let buttonDisabled = false;
      const chargingStationID = Utils.getParamFromNavigation(this.props.route, 'chargingStationID', null) as string;
      const connectorID = Utils.convertToInt(Utils.getParamFromNavigation(this.props.route, 'connectorID', null) as string);
      const startTransactionFromQRCode = Utils.getParamFromNavigation(this.props.route, 'startTransaction', null, true) as boolean;
      // Get Charging Station
      const chargingStation = await this.getChargingStation(chargingStationID);
      // Get Connector from Charging Station
      const connector = chargingStation ? Utils.getConnectorFromID(chargingStation, connectorID) : null;

      const transactionStillPending = this.isTransactionStillPending(connector);
      if (transactionStillPending) {
        buttonDisabled = true;
      } else {
        // if the transaction is no longer pending, reset the flags
        this.setState({ transactionPending: false, didPreparing: false });
      }

      // When Scanning a QR-Code, redirect if a session is already in progress. (if the connector has a non null userID)
      if (startTransactionFromQRCode && connector?.currentUserID) {
        Message.showWarning(I18n.t('transactions.sessionAlreadyInProgressError'));
        this.props.navigation.goBack();
        return;
      }
      // Get the site image if not already fetched
      if (!siteImage && chargingStation?.siteArea) {
        siteImage = await this.getSiteImage(chargingStation?.siteArea?.siteID);
      }
      // Get Current Transaction
      if (connector?.currentTransactionID) {
        transaction = await this.getTransaction(connector.currentTransactionID);
      }
      const { selectedUser, selectedTag } = this.state;
      // Check selected user is active
      console.log(selectedUser.status);
      console.log(selectedUser.status === UserStatus.ACTIVE);
      if (selectedUser?.status !== UserStatus.ACTIVE) {
        buttonDisabled = true;
        settingsErrors.inactiveUserError = true;
      }
      // Get the default tag and car of the selected user (only to get errors codes)
      const userDefaultTagCar = await this.getUserDefaultTagAndCar(selectedUser, chargingStationID);
      // If error codes, disabled the button
      if (!Utils.isEmptyArray(userDefaultTagCar?.errorCodes)) {
        buttonDisabled = true;
        settingsErrors.billingError = true;
      }

      // If the selected user has no badge, disable the button
      if (!userDefaultTagCar?.tag) {
        buttonDisabled = true;
        settingsErrors.noBadgeError = true;
      }
      // Check if the selected badge is active
      if (selectedTag && !selectedTag?.active) {
        buttonDisabled = true;
        settingsErrors.inactiveBadgeError = true;
      }
      if (
        connector?.status === ChargePointStatus.FINISHING ||
        connector?.status === ChargePointStatus.FAULTED ||
        connector?.status === ChargePointStatus.UNAVAILABLE ||
        chargingStation?.inactive
      ) {
        buttonDisabled = true;
      }
      // // Compute Duration
      const durationInfos = this.getDurationInfos(transaction, connector);
      // Set
      if (
        startTransactionFromQRCode &&
        (connector?.status === ChargePointStatus.AVAILABLE || connector?.status === ChargePointStatus.PREPARING) &&
        !buttonDisabled
      ) {
        showStartTransactionDialog = true;
      }

      // Show a message to advice to check that the cable is connected to both car and CS
      if (!buttonDisabled && (connector?.status === ChargePointStatus.AVAILABLE || connector?.status === ChargePointStatus.PREPARING)) {
        showAdviceMessage = true;
      }

      // await this.loadSelectedUserDefaultTagAndCar(this.state.selectedUser);

      this.setState({
        showStartTransactionDialog: this.state.showStartTransactionDialog ?? showStartTransactionDialog,
        showAdviceMessage,
        buttonDisabled,
        chargingStation,
        connector,
        transaction,
        settingsErrors,
        userDefaultTagCar,
        siteImage,
        refreshing: false,
        showChargingSettings:
          this.state.showChargingSettings ?? Object.values(settingsErrors ?? {}).some(error => error === true),
        isAdmin: this.securityProvider ? this.securityProvider.isAdmin() : false,
        isSiteAdmin: this.securityProvider?.isSiteAdmin(chargingStation?.siteArea?.siteID) ?? false,
        canDisplayTransaction: chargingStation ? this.securityProvider?.canReadTransaction() : false,
        canStartTransaction: chargingStation ? this.canStartTransaction(chargingStation, connector) : false,
        canStopTransaction: chargingStation ? this.canStopTransaction(chargingStation, connector) : false,
        isPricingActive: this.securityProvider?.isComponentPricingActive(),
        ...durationInfos,
        loading: false
      });
    })
  };

  public getStartStopTransactionButtonStatus(
    connector: Connector,
    userDefaultTagCar: UserDefaultTagCar
  ): { buttonDisabled?: boolean; startTransactionNbTrial?: number } {
    const { startTransactionNbTrial } = this.state;
    // Check if error codes
    if (userDefaultTagCar && !Utils.isEmptyArray(userDefaultTagCar?.errorCodes)) {
      return {
        buttonDisabled: true
      };
    }
    if (!userDefaultTagCar?.tag) {
      return {
        buttonDisabled: true
      };
    }
    // Check if the Start/Stop Button should stay disabled
    if (
      (connector?.status === ChargePointStatus.AVAILABLE && startTransactionNbTrial <= START_TRANSACTION_NB_TRIAL - 2) ||
      (connector?.status === ChargePointStatus.PREPARING && startTransactionNbTrial === 0)
    ) {
      // Button are set to available after the nbr of trials
      return {
        buttonDisabled: false
      };
      // Still trials? (only for Start Transaction)
    } else if (startTransactionNbTrial > 0) {
      // Trial - 1
      return {
        startTransactionNbTrial: startTransactionNbTrial > 0 ? startTransactionNbTrial - 1 : 0
      };
      // Transaction ongoing
    } else if (connector && connector.currentTransactionID !== 0) {
      // Transaction has started, enable the buttons again
      return {
        startTransactionNbTrial: 0,
        buttonDisabled: false
      };
      // Transaction is stopped (currentTransactionID == 0)
    } else if (connector && connector?.status === ChargePointStatus.FINISHING) {
      // Disable the button until the user unplug the cable
      return {
        buttonDisabled: true
      };
    }
    return {};
  }

  public canStopTransaction = (chargingStation: ChargingStation, connector: Connector): boolean => {
    // Transaction?
    if (connector && connector.currentTransactionID !== 0) {
      // Check Auth
      return this.securityProvider?.canStopTransaction(chargingStation?.siteArea, connector.currentTagID);
    }
    return false;
  };

  public canStartTransaction(chargingStation: ChargingStation, connector: Connector): boolean {
    // Transaction?
    if (connector && connector.currentTransactionID === 0) {
      // Check Auth
      return this.securityProvider?.canStartTransaction(chargingStation?.siteArea);
    }
    return false;
  }

  public manualRefresh = async () => {
    // Display spinner
    this.setState({ refreshing: true });
    // Refresh
    await this.refresh();
    // Hide spinner
    this.setState({ refreshing: false });
  };

  public startTransactionConfirm = () => {
    this.setState({ showStartTransactionDialog: true });
  };

  public async startTransaction(): Promise<void> {
    await this.refresh();
    const { chargingStation, connector, selectedTag, selectedCar, selectedUser, buttonDisabled, canStartTransaction } = this.state;
    try {
      if (buttonDisabled || !canStartTransaction) {
        Message.showError(I18n.t('general.notAuthorized'));
        return;
      }
      // Check already in use
      if (connector?.status !== ChargePointStatus.AVAILABLE && connector?.status !== ChargePointStatus.PREPARING) {
        Message.showError(I18n.t('transactions.connectorNotAvailable'));
        return;
      }
      // Disable the button
      this.setState({ buttonDisabled: true });
      // Start the Transaction
      const response = await this.centralServerProvider.startTransaction(
        chargingStation.id,
        connector.connectorId,
        selectedTag?.visualID,
        selectedCar?.id as string,
        selectedUser?.id as string
      );
      if (response?.status === OCPPGeneralResponse.ACCEPTED) {
        // Show success message
        Message.showSuccess(I18n.t('details.accepted'));
        // Nb trials the button stays disabled
        this.setState({ transactionPending: true, buttonDisabled: true, transactionPendingTimesUp: false });
        setTimeout(() => this.setState({ transactionPendingTimesUp: true }), 40000);
        await this.refresh();
      } else {
        // Re-enable the button
        this.setState({ buttonDisabled: false });
        // Show message
        if (this.state.connector?.status === ChargePointStatus.AVAILABLE) {
          Message.showError(I18n.t('transactions.carNotConnectedError'));
        } else {
          Message.showError(I18n.t('details.denied'));
        }
      }
    } catch (error) {
      // Enable the button
      this.setState({ buttonDisabled: false });
      // Other common Error
      await Utils.handleHttpUnexpectedError(
        this.centralServerProvider,
        error,
        'transactions.transactionStartUnexpectedError',
        this.props.navigation,
        this.refresh.bind(this)
      );
    }
  }

  public renderStopTransactionDialog() {
    const { chargingStation } = this.state;
    const modalCommonStyle = computeModalCommonStyle();
    return (
      <DialogModal
        withCloseButton={true}
        close={() => this.setState({ showStopTransactionDialog: false })}
        title={I18n.t('details.stopTransaction')}
        description={I18n.t('details.stopTransactionMessage', { chargeBoxID: chargingStation.id })}
        buttons={[
          {
            text: I18n.t('general.yes'),
            action: () => {
              this.stopTransaction();
              this.setState({ showStopTransactionDialog: false });
            },
            buttonStyle: modalCommonStyle.primaryButton,
            buttonTextStyle: modalCommonStyle.primaryButtonText
          },
          {
            text: I18n.t('general.no'),
            action: () => this.setState({ showStopTransactionDialog: false }),
            buttonStyle: modalCommonStyle.primaryButton,
            buttonTextStyle: modalCommonStyle.primaryButtonText
          }
        ]}
      />
    );
  }

  public stopTransaction = async () => {
    const { chargingStation, connector } = this.state;
    try {
      // Disable button
      this.setState({ buttonDisabled: true });
      // Remote Stop the Transaction
      if (connector?.status !== ChargePointStatus.AVAILABLE) {
        const response = await this.centralServerProvider.stopTransaction(chargingStation.id, connector.currentTransactionID);
        if (response?.status === 'Accepted') {
          Message.showSuccess(I18n.t('details.accepted'));
          await this.refresh();
        } else {
          Message.showError(I18n.t('details.denied'));
        }
        // Soft Stop Transaction
      } else {
        const response = await this.centralServerProvider.softStopTransaction(connector.currentTransactionID);
        if (response?.status === 'Invalid') {
          Message.showError(I18n.t('details.denied'));
        } else {
          Message.showSuccess(I18n.t('details.accepted'));
          await this.refresh();
        }
      }
    } catch (error) {
      // Other common Error
      await Utils.handleHttpUnexpectedError(
        this.centralServerProvider,
        error,
        'transactions.transactionStopUnexpectedError',
        this.props.navigation,
        this.refresh.bind(this)
      );
    }
  };

  public getDurationInfos = (
    transaction: Transaction,
    connector: Connector
  ): { totalInactivitySecs?: number; elapsedTimeFormatted?: string; inactivityFormatted?: string } => {
    // Transaction loaded?
    if (transaction) {
      let elapsedTimeFormatted = Constants.DEFAULT_DURATION;
      let inactivityFormatted = Constants.DEFAULT_DURATION;
      // Elapsed Time?
      if (transaction.timestamp) {
        // Format
        const durationSecs = (Date.now() - new Date(transaction.timestamp).getTime()) / 1000;
        elapsedTimeFormatted = Utils.formatDurationHHMMSS(durationSecs, false);
      }
      // Inactivity?
      if (transaction.currentTotalInactivitySecs) {
        // Format
        inactivityFormatted = Utils.formatDurationHHMMSS(transaction.currentTotalInactivitySecs, false);
      }
      // Set
      return {
        totalInactivitySecs: transaction.currentTotalInactivitySecs,
        elapsedTimeFormatted,
        inactivityFormatted
      };
      // Basic User: Use the connector data
    } else if (connector && connector.currentTransactionID) {
      let elapsedTimeFormatted = Constants.DEFAULT_DURATION;
      let inactivityFormatted = Constants.DEFAULT_DURATION;
      // Elapsed Time?
      if (connector.currentTransactionDate) {
        // Format
        const durationSecs = (Date.now() - new Date(connector.currentTransactionDate).getTime()) / 1000;
        elapsedTimeFormatted = Utils.formatDurationHHMMSS(durationSecs, false);
      }
      // Inactivity?
      if (connector && connector.currentTotalInactivitySecs) {
        // Format
        inactivityFormatted = Utils.formatDurationHHMMSS(connector.currentTotalInactivitySecs, false);
      }
      // Set
      return {
        totalInactivitySecs: connector ? connector.currentTotalInactivitySecs : 0,
        elapsedTimeFormatted,
        inactivityFormatted
      };
    }
    return {
      elapsedTimeFormatted: Constants.DEFAULT_DURATION
    };
  };

  public renderConnectorStatus = (style: any) => {
    const { chargingStation, connector, isAdmin, isSiteAdmin } = this.state;
    return (
      <View style={style.columnContainer}>
        <ConnectorStatusComponent navigation={this.props.navigation} connector={connector} inactive={chargingStation?.inactive} />
        {(isAdmin || isSiteAdmin) && connector?.status === ChargePointStatus.FAULTED && (
          <Text style={[style.subLabel, style.subLabelStatusError]}>({connector.errorCode})</Text>
        )}
      </View>
    );
  };

  public renderUserInfo = (style: any) => {
    const { transaction } = this.state;
    return transaction ? (
      <View style={style.columnContainer}>
        <UserAvatar size={45} user={transaction.user} navigation={this.props.navigation} />
        <Text numberOfLines={1} style={[style.label, style.labelUser, style.info]}>
          {Utils.buildUserName(transaction.user)}
        </Text>
      </View>
    ) : (
      <View style={style.columnContainer}>
        <UserAvatar size={44} navigation={this.props.navigation} />
        <Text style={[style.label, style.disabled]}>-</Text>
      </View>
    );
  };

  public renderPrice = (style: any) => {
    const { transaction, connector } = this.state;
    let price = 0;
    if (transaction) {
      price = Utils.roundTo(transaction.currentCumulatedPrice, 2);
    }
    return connector && connector.currentTransactionID && transaction && !isNaN(price) ? (
      <View style={style.columnContainer}>
        <Icon type="FontAwesome" name="money" style={[style.icon, style.info]} />
        <Text style={[style.label, style.labelValue, style.info]}>{price}</Text>
        <Text style={[style.subLabel, style.info]}>({transaction.stop ? transaction.stop.priceUnit : transaction.priceUnit})</Text>
      </View>
    ) : (
      <View style={style.columnContainer}>
        <Icon type="FontAwesome" name="money" style={[style.icon, style.disabled]} />
        <Text style={[style.label, style.labelValue, style.disabled]}>-</Text>
      </View>
    );
  };

  public renderInstantPower = (style: any) => {
    const { connector } = this.state;
    return connector && connector.currentTransactionID && !isNaN(connector.currentInstantWatts) ? (
      <View style={style.columnContainer}>
        <Icon type="FontAwesome" name="bolt" style={[style.icon, style.info]} />
        <Text style={[style.label, style.labelValue, style.info]}>
          {connector.currentInstantWatts / 1000 > 0 ? I18nManager.formatNumber(Math.round(connector.currentInstantWatts / 10) / 100) : 0}
        </Text>
        <Text style={[style.subLabel, style.info]}>{I18n.t('details.instant')} (kW)</Text>
      </View>
    ) : (
      <View style={style.columnContainer}>
        <Icon type="FontAwesome" name="bolt" style={[style.icon, style.disabled]} />
        <Text style={[style.label, style.labelValue, style.disabled]}>-</Text>
      </View>
    );
  };

  public renderElapsedTime = (style: any) => {
    const { elapsedTimeFormatted, connector } = this.state;
    return connector && connector.currentTransactionID ? (
      <View style={style.columnContainer}>
        <Icon type="MaterialIcons" name="timer" style={[style.icon, style.info]} />
        <Text style={[style.label, style.labelValue, style.info]}>{elapsedTimeFormatted}</Text>
        <Text style={[style.subLabel, style.info]}>{I18n.t('details.duration')}</Text>
      </View>
    ) : (
      <View style={style.columnContainer}>
        <Icon type="MaterialIcons" name="timer" style={[style.icon, style.disabled]} />
        <Text style={[style.label, style.labelValue, style.disabled]}>-</Text>
      </View>
    );
  };

  public renderInactivity = (style: any) => {
    const { connector, inactivityFormatted } = this.state;
    const inactivityStyle = connector ? Utils.computeInactivityStyle(connector.currentInactivityStatus) : '';
    return connector && connector.currentTransactionID ? (
      <View style={style.columnContainer}>
        <Icon type="MaterialIcons" name="timer-off" style={[style.icon, inactivityStyle]} />
        <Text style={[style.label, style.labelValue, inactivityStyle]}>{inactivityFormatted}</Text>
        <Text style={[style.subLabel, inactivityStyle]}>{I18n.t('details.duration')}</Text>
      </View>
    ) : (
      <View style={style.columnContainer}>
        <Icon type="MaterialIcons" name="timer-off" style={[style.icon, style.disabled]} />
        <Text style={[style.label, style.labelValue, style.disabled]}>-</Text>
      </View>
    );
  };

  public renderTotalConsumption = (style: any) => {
    const { connector } = this.state;
    return connector && connector.currentTransactionID && !isNaN(connector.currentTotalConsumptionWh) ? (
      <View style={style.columnContainer}>
        <Icon style={[style.icon, style.info]} type="MaterialIcons" name="ev-station" />
        <Text style={[style.label, style.labelValue, style.info]}>
          {connector ? I18nManager.formatNumber(Math.round(connector.currentTotalConsumptionWh / 10) / 100) : ''}
        </Text>
        <Text style={[style.subLabel, style.info]}>{I18n.t('details.total')} (kW.h)</Text>
      </View>
    ) : (
      <View style={style.columnContainer}>
        <Icon style={[style.icon, style.disabled]} type="MaterialIcons" name="ev-station" />
        <Text style={[style.label, style.labelValue, style.disabled]}>-</Text>
      </View>
    );
  };

  public renderBatteryLevel = (style: any) => {
    const { transaction, connector } = this.state;
    return connector && connector.currentStateOfCharge && !isNaN(connector.currentStateOfCharge) ? (
      <View style={style.columnContainer}>
        <Icon type="MaterialIcons" name="battery-charging-full" style={[style.icon, style.info]} />
        <Text style={[style.label, style.labelValue, style.info]}>
          {transaction ? `${transaction.stateOfCharge} > ${transaction.currentStateOfCharge}` : connector.currentStateOfCharge}
        </Text>
        <Text style={[style.subLabel, style.info]}>(%)</Text>
      </View>
    ) : (
      <View style={style.columnContainer}>
        <Icon type="MaterialIcons" name="battery-charging-full" style={[style.icon, style.disabled]} />
        <Text style={[style.label, style.labelValue, style.disabled]}>-</Text>
      </View>
    );
  };

  public renderShowLastTransactionButton = (style: any) => {
    const { isAdmin, isSiteAdmin, connector } = this.state;
    if ((isAdmin || isSiteAdmin) && connector) {
      return (
        <TouchableOpacity style={style.lastTransactionContainer} onPress={async () => this.showLastTransaction()}>
          <View style={style.buttonLastTransaction}>
            <Icon style={style.lastTransactionIcon} type="MaterialCommunityIcons" name="history" />
          </View>
        </TouchableOpacity>
      );
    }
    return <View style={[style.lastTransactionContainer]} />;
  };

  public renderReportErrorButton = (style: any) => {
    const { connector } = this.state;
    if (connector) {
      return (
        <TouchableOpacity style={[style.reportErrorContainer]} onPress={async () => this.showReportError()}>
          <View style={style.reportErrorButton}>
            <Icon style={style.reportErrorIcon} type="MaterialIcons" name="error-outline" />
          </View>
        </TouchableOpacity>
      );
    }
    return <View style={[style.lastTransactionContainer]} />;
  };

  public renderStartTransactionButton = (style: any) => {
    const { buttonDisabled } = this.state;
    return (
      <TouchableOpacity disabled={buttonDisabled} onPress={() => this.startTransactionConfirm()}>
        <View
          style={
            buttonDisabled
              ? [style.buttonTransaction, style.startTransaction, style.buttonTransactionDisabled]
              : [style.buttonTransaction, style.startTransaction]
          }>
          <Icon
            style={
              buttonDisabled
                ? [style.transactionIcon, style.startTransactionIcon, style.transactionDisabledIcon]
                : [style.transactionIcon, style.startTransactionIcon]
            }
            type="MaterialIcons"
            name="play-arrow"
          />
        </View>
      </TouchableOpacity>
    );
  };

  public renderStopTransactionButton = (style: any) => {
    const { canStopTransaction } = this.state;
    return (
      <TouchableOpacity onPress={() => this.setState({ showStopTransactionDialog: true })} disabled={!canStopTransaction}>
        <View
          style={
            !canStopTransaction
              ? [style.buttonTransaction, style.stopTransaction, style.buttonTransactionDisabled]
              : [style.buttonTransaction, style.stopTransaction]
          }>
          <Icon
            style={
              !canStopTransaction
                ? [style.transactionIcon, style.stopTransactionIcon, style.transactionDisabledIcon]
                : [style.transactionIcon, style.stopTransactionIcon]
            }
            type="MaterialIcons"
            name="stop"
          />
        </View>
      </TouchableOpacity>
    );
  };

  public render() {
    const { showChargingSettings } = this.state;
    const style = computeStyleSheet();
    const {
      connector,
      canStopTransaction,
      canStartTransaction,
      chargingStation,
      loading,
      siteImage,
      isPricingActive,
      showStartTransactionDialog,
      showStopTransactionDialog,
      showAdviceMessage,
      refreshing
    } = this.state;
    const commonColors = Utils.getCurrentCommonColor();
    const activityIndicatorCommonStyles = computeActivityIndicatorCommonStyles();
    const connectorLetter = Utils.getConnectorLetterFromConnectorID(connector ? connector.connectorId : null);
    return loading ? (
      <Spinner style={style.spinner} color="grey" />
    ) : (
      <Container style={style.container}>
        {showStartTransactionDialog && this.renderStartTransactionDialog()}
        {showStopTransactionDialog && this.renderStopTransactionDialog()}
        <HeaderComponent
          navigation={this.props.navigation}
          title={chargingStation ? chargingStation.id : '-'}
          subTitle={connectorLetter ? `(${I18n.t('details.connector')} ${connectorLetter})` : ''}
        />
        {/* Site Image */}
        <ImageBackground source={siteImage ? { uri: siteImage } : noSite} style={style.backgroundImage as ImageStyle}>
          <View style={style.imageInnerContainer}>
            {/* Show Last Transaction */}
            {this.renderShowLastTransactionButton(style)}
            {/* Start/Stop Transaction */}
            {canStartTransaction && connector?.currentTransactionID === 0 ? (
              <View style={style.transactionContainer}>{this.renderStartTransactionButton(style)}</View>
            ) : canStopTransaction && connector?.currentTransactionID > 0 ? (
              <View style={style.transactionContainer}>{this.renderStopTransactionButton(style)}</View>
            ) : (
              <View style={style.noButtonStopTransaction} />
            )}
            {/* Report Error */}
            {this.renderReportErrorButton(style)}
          </View>
          {showAdviceMessage && this.renderAdviceMessage(style)}
        </ImageBackground>
        {/* Details */}
        {connector?.status === ChargePointStatus.AVAILABLE || connector?.status === ChargePointStatus.PREPARING ? (
          <View style={style.connectorInfoSettingsContainer}>
            {this.renderConnectorInfo(style)}
            {refreshing && <ActivityIndicator
              size={scale(18)}
              color={commonColors.textColor}
              style={[activityIndicatorCommonStyles.activityIndicator, style.activityIndicator]}
              animating={true}
            /> }
            {this.renderAccordion(style)}
            {showChargingSettings && (
              <ScrollView
                persistentScrollbar={true}
                style={style.scrollviewContainer}
                contentContainerStyle={style.chargingSettingsContainer}
                keyboardShouldPersistTaps={'always'}
              >
                {/* User */}
                {this.renderUserSelection(style)}
                {/* Badge */}
                {this.renderTagSelection(style)}
                {/* Car */}
                {this.securityProvider?.isComponentCarActive() && this.renderCarSelection(style)}
              </ScrollView>
            )}
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={style.scrollViewContainer}
            refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.manualRefresh} />}>
            <View style={style.rowContainer}>
              {this.renderConnectorStatus(style)}
              {this.renderUserInfo(style)}
            </View>
            <View style={style.rowContainer}>
              {this.renderInstantPower(style)}
              {this.renderTotalConsumption(style)}
            </View>
            <View style={style.rowContainer}>
              {this.renderElapsedTime(style)}
              {this.renderInactivity(style)}
            </View>
            <View style={style.rowContainer}>
              {this.renderBatteryLevel(style)}
              {isPricingActive ? this.renderPrice(style) : <View style={style.columnContainer} />}
            </View>
          </ScrollView>
        )}
      </Container>
    );
  }

  private renderAccordion(style: any) {
    const { showChargingSettings, settingsErrors } = this.state;
    console.log(settingsErrors);
    return (
      <TouchableOpacity onPress={() => this.setState({ showChargingSettings: !showChargingSettings })} style={style.accordion}>
        <Text style={style.accordionText}>
          {I18n.t('transactions.chargingSettings')}
          {Object.values(settingsErrors ?? {}).some(error => error) && (
            <Text style={style.errorAsterisk}>*</Text>
          )}
        </Text>
        {showChargingSettings ? (
          <Icon style={style.accordionIcon} type={'MaterialIcons'} name={'arrow-drop-up'} />
        ) : (
          <Icon style={style.accordionIcon} type={'MaterialIcons'} name={'arrow-drop-down'} />
        )}
      </TouchableOpacity>
    );
  }

  private renderConnectorInfo(style: any) {
    return (
      <View style={style.connectorInfoContainer}>
        <ChargingStationConnectorComponent
          listed={false}
          chargingStation={this.state.chargingStation}
          connector={this.state.connector}
          navigation={this.props.navigation}
        />
      </View>
    );
  }

  private async getUserDefaultTagAndCar(user: User, chargingStationID: string): Promise<UserDefaultTagCar> {
    try {
      return this.centralServerProvider?.getUserDefaultTagCar(user?.id as string, chargingStationID);
    } catch (error) {
      await Utils.handleHttpUnexpectedError(
        this.centralServerProvider,
        error,
        'invoices.chargerUnexpectedError',
        this.props.navigation,
        this.refresh.bind(this)
      );
      return null;
    }
  }

  private renderAdviceMessage(style: any) {
    return (
      <View style={[style.messageContainer, style.adviceMessageContainer]}>
        <Icon style={style.adviceMessageIcon} type={'MaterialCommunityIcons'} name={'power-plug'} />
        <Text numberOfLines={1} ellipsizeMode={'tail'} style={style.adviceText}>
          {I18n.t('transactions.adviceMessage')}
        </Text>
      </View>
    );
  }

  private renderBillingErrorMessages(style: any) {
    const { userDefaultTagCar, selectedUser } = this.state;
    const { navigation } = this.props;
    const listItemCommonStyle = computeListItemCommonStyle();
    // Check the error code
    const errorCode = userDefaultTagCar.errorCodes[0];
    switch (errorCode) {
      case StartTransactionErrorCode.BILLING_NO_PAYMENT_METHOD:
        return (
          <View style={[listItemCommonStyle.container, style.noItemContainer, style.noTagContainer]}>
            <Icon style={style.noPaymentMethodIcon} type={'MaterialCommunityIcons'} name={'credit-card-off'} />
            <View style={style.column}>
              <Text ellipsizeMode={'tail'} numberOfLines={2} style={style.errorMessage}>
                {I18n.t('transactions.noPaymentMethodError')}
              </Text>
              {selectedUser?.id === this.currentUser.id && (
                <TouchableOpacity onPress={() => navigation.navigate('AddPaymentMethod')}>
                  <View style={style.addItemContainer}>
                    <Text style={[style.linkText, style.plusSign]}>+</Text>
                    <Text ellipsizeMode={'tail'} style={[style.messageText, style.linkText, style.linkLabel]}>
                      {I18n.t('paymentMethods.addPaymentMethod')}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      default:
        return null;
    }
  }

  private renderUserSelection(style: any) {
    const { navigation } = this.props;
    const { selectedUser, isAdmin, connector, settingsErrors } = this.state;
    const disabled = connector?.status !== ChargePointStatus.PREPARING && connector?.status !== ChargePointStatus.AVAILABLE;
    const listItemCommonStyles = computeListItemCommonStyle();
    return (
      <View style={style.rowUserCarBadgeContainer}>
        {this.securityProvider?.canListUsers() && (
          <ModalSelect<User>
            disabled={disabled}
            openable={isAdmin}
            renderItem={(user) =>
              <UserComponent containerStyle={[user.status !== UserStatus.ACTIVE && listItemCommonStyles.outlinedError, style.itemComponentContainer]} user={selectedUser} navigation={navigation} />}
            defaultItems={[selectedUser]}
            onItemsSelected={this.onUserSelected.bind(this)}
            navigation={navigation}
            selectionMode={ItemSelectionMode.SINGLE}>
            <Users filters={{issuer: true}} navigation={navigation} />
          </ModalSelect>
        )}
        {settingsErrors.billingError && this.renderBillingErrorMessages(style)}
      </View>
    );
  }

  private renderCarSelection(style: any) {
    const { navigation } = this.props;
    const { tagCarLoading, selectedUser, selectedCar, connector } = this.state;
    const disabled = connector?.status !== ChargePointStatus.PREPARING && connector?.status !== ChargePointStatus.AVAILABLE;
    return (
      <View style={style.rowUserCarBadgeContainer}>
        <ModalSelect<Car>
          disabled={disabled}
          openable={true}
          renderNoItem={this.renderNoCar.bind(this)}
          clearable={true}
          renderItem={() => <CarComponent car={selectedCar} navigation={navigation} />}
          ref={this.carModalRef}
          defaultItems={[selectedCar]}
          renderItemPlaceholder={this.renderCarPlaceholder.bind(this)}
          defaultItemLoading={tagCarLoading}
          onItemsSelected={(selectedCars: Car[]) => this.setState({ selectedCar: selectedCars?.[0] })}
          navigation={navigation}
          selectionMode={ItemSelectionMode.SINGLE}>
          <Cars userIDs={[selectedUser?.id as string]} navigation={navigation} />
        </ModalSelect>
      </View>
    );
  }

  private renderCarPlaceholder() {
    const listItemCommonStyle = computeListItemCommonStyle();
    const style = computeStyleSheet();
    return (
      <View style={[listItemCommonStyle.container, style.noItemContainer, style.noCarContainer]}>
        <Icon style={style.noCarIcon} type={'MaterialCommunityIcons'} name={'car'} />
        <View style={style.column}>
          <Text style={style.messageText}>{I18n.t('cars.noCarMessageTitle')}</Text>
        </View>
      </View>
    );
  }

  private renderNoCar() {
    const listItemCommonStyle = computeListItemCommonStyle();
    const style = computeStyleSheet();
    const { selectedUser } = this.state;
    const { navigation } = this.props;
    return (
      <View style={[listItemCommonStyle.container, style.noItemContainer, style.noCarContainer]}>
        <Icon style={style.noCarIcon} type={'MaterialCommunityIcons'} name={'car'} />
        <View style={style.column}>
          <Text style={style.messageText}>{I18n.t('cars.noCarMessageTitle')}</Text>
          {(this.currentUser?.id === selectedUser?.id || this.securityProvider.canListUsers()) && (
            <TouchableOpacity
              onPress={() => navigation.navigate('AddCar', { params: { user: selectedUser } })}
              style={style.addItemContainer}>
              <Text style={[style.linkText, style.plusSign]}>+</Text>
              <Text style={[style.messageText, style.linkText, style.linkLabel]}>{I18n.t('cars.addCarTitle')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  private renderTagSelection(style: any) {
    const { navigation } = this.props;
    const { tagCarLoading, selectedUser, selectedTag, connector } = this.state;
    const disabled = connector?.status !== ChargePointStatus.PREPARING && connector?.status !== ChargePointStatus.AVAILABLE;
    const listItemCommonStyles = computeListItemCommonStyle();
    return (
      <View style={style.rowUserCarBadgeContainer}>
        <ModalSelect<Tag>
          renderItem={(tag) => <TagComponent containerStyle={[!tag.active && listItemCommonStyles.outlinedError, style.itemComponentContainer]} tag={selectedTag} navigation={navigation} />}
          disabled={disabled}
          openable={true}
          renderNoItem={this.renderNoTag.bind(this)}
          itemsEquals={(a, b) => a?.visualID === b?.visualID}
          ref={this.tagModalRef}
          defaultItems={[selectedTag]}
          defaultItemLoading={tagCarLoading}
          onItemsSelected={(selectedTags: Tag[]) => this.setState({ selectedTag: selectedTags?.[0] })}
          navigation={navigation}
          selectionMode={ItemSelectionMode.SINGLE}>
          <Tags disableInactive={true} sorting={'-active'} userIDs={[selectedUser?.id as string]} navigation={navigation} />
        </ModalSelect>
      </View>
    );
  }

  private renderNoTag() {
    const listItemCommonStyle = computeListItemCommonStyle();
    const style = computeStyleSheet();
    return (
      <View style={[listItemCommonStyle.container, style.noItemContainer, style.noTagContainer]}>
        <Icon type={'MaterialCommunityIcons'} name={'credit-card-off'} style={style.noTagIcon} />
        <View style={style.column}>
          <Text style={style.errorMessage}>{I18n.t('tags.noTagMessageTitle')}</Text>
          <Text style={style.errorMessage}>{I18n.t('tags.noTagMessageSubtitle')}</Text>
        </View>
      </View>
    );
  }

  private onUserSelected(selectedUsers: User[]): void {
    const selectedUser = selectedUsers?.[0];
    // Reset errors and selected fields when new user selected
    this.setState(
      {
        selectedUser,
        selectedCar: null,
        selectedTag: null,
        userDefaultTagCar: null,
        settingsErrors: {},
        buttonDisabled: true
      },
      async () => {
        await this.loadSelectedUserDefaultTagAndCar(selectedUser);
        this.refresh(true);
      }
    );
  }

  private async loadSelectedUserDefaultTagAndCar(selectedUser: User): Promise<void> {
    this.setState({ tagCarLoading: true });
    try {
      const userDefaultTagCar = await this.getUserDefaultTagAndCar(selectedUser, this.state.chargingStation?.id);
      this.carModalRef.current?.resetInput();
      this.tagModalRef.current?.resetInput();
      // Temporary workaround to ensure that the default property is set (server-side changes are to be done)
      if (userDefaultTagCar?.tag) {
        userDefaultTagCar.tag.default = true;
      }
      // Temporary workaround to ensure that the default car has all the needed properties (server-side changes are to be done)
      if (userDefaultTagCar?.car) {
        userDefaultTagCar.car.user = selectedUser;
      }
      this.setState({ selectedCar: userDefaultTagCar?.car, selectedTag: userDefaultTagCar?.tag, tagCarLoading: false });
    } catch (error) {
      this.setState({ tagCarLoading: false });
    }
  }

  private renderStartTransactionDialog() {
    const chargingStationID = Utils.getParamFromNavigation(this.props.route, 'chargingStationID', null) as string;
    const modalCommonStyle = computeModalCommonStyle();
    return (
      <DialogModal
        title={I18n.t('details.startTransaction')}
        withCloseButton={true}
        close={() => this.setState({ showStartTransactionDialog: false })}
        renderIcon={(style) => <Icon style={style} type={'MaterialIcons'} name={'play-circle-outline'} />}
        description={I18n.t('details.startTransactionMessage', { chargeBoxID: chargingStationID })}
        buttons={[
          {
            text: I18n.t('general.yes'),
            action: () => this.setState({ showStartTransactionDialog: false }, async () => this.startTransaction()),
            buttonTextStyle: modalCommonStyle.primaryButtonText,
            buttonStyle: modalCommonStyle.primaryButton
          },
          {
            text: I18n.t('general.no'),
            action: () => this.setState({ showStartTransactionDialog: false }),
            buttonTextStyle: modalCommonStyle.primaryButtonText,
            buttonStyle: modalCommonStyle.primaryButton
          }
        ]}
      />
    );
  }
}
