import { createDrawerNavigator } from '@react-navigation/drawer';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { InitialState, NavigationContainer, NavigationState } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import I18n from 'i18n-js';
import { Icon } from 'native-base';
import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { RootSiblingParent } from 'react-native-root-siblings';
import { scale } from 'react-native-size-matters';

import DeepLinkingManager from './deeplinking/DeepLinkingManager';
import I18nManager from './I18n/I18nManager';
import LocationManager from './location/LocationManager';
import MigrationManager from './migration/MigrationManager';
import NotificationManager from './notification/NotificationManager';
import CentralServerProvider from './provider/CentralServerProvider';
import ProviderFactory from './provider/ProviderFactory';
import Eula from './screens/auth/eula/Eula';
import Login from './screens/auth/login/Login';
import ResetPassword from './screens/auth/reset-password/ResetPassword';
import RetrievePassword from './screens/auth/retrieve-password/RetrievePassword';
import SignUp from './screens/auth/sign-up/SignUp';
import Cars from './screens/cars/Cars';
import ChargingStationActions from './screens/charging-stations/actions/ChargingStationActions';
import ChargingStationConnectorDetails from './screens/charging-stations/connector-details/ChargingStationConnectorDetails';
import ChargingStations from './screens/charging-stations/list/ChargingStations';
import ChargingStationOcppParameters from './screens/charging-stations/ocpp/ChargingStationOcppParameters';
import ChargingStationProperties from './screens/charging-stations/properties/ChargingStationProperties';
import Invoices from './screens/invoices/Invoices';
import PaymentMethods from './screens/payment-methods/PaymentMethods';
import StripePaymentMethodCreationForm from './screens/payment-methods/stripe/StripePaymentMethodCreationForm';
import ReportError from './screens/report-error/ReportError';
import Sidebar from './screens/sidebar/SideBar';
import SiteAreas from './screens/site-areas/SiteAreas';
import Sites from './screens/sites/Sites';
import Statistics from './screens/statistics/Statistics';
import Tags from './screens/tags/Tags';
import Tenants from './screens/tenants/Tenants';
import TransactionChart from './screens/transactions/chart/TransactionChart';
import TransactionDetails from './screens/transactions/details/TransactionDetails';
import TransactionsHistory from './screens/transactions/history/TransactionsHistory';
import TransactionsInProgress from './screens/transactions/in-progress/TransactionsInProgress';
import Users from './screens/users/list/Users';
import BaseProps from './types/BaseProps';
import SecuredStorage from './utils/SecuredStorage';
import Utils from './utils/Utils';
import { checkVersion, CheckVersionResponse } from 'react-native-check-version';
import AppUpdateDialog from './components/modal/app-update/AppUpdateDialog';
import AddCar from './screens/cars/AddCar';
import ChargingStationQrCode from './screens/home/ChargingStationQrCode';
import ThemeManager from './custom-theme/ThemeManager';
import { PLATFORM } from './theme/variables/commonColor';
import TenantQrCode from './screens/tenants/TenantQrCode';

// Init i18n
I18nManager.initialize();

// Navigation Stack variable
const AuthStack = createStackNavigator();
const StatsStack = createStackNavigator();
const ReportErrorStack = createStackNavigator();
const SitesStack = createStackNavigator();
const ChargingStationsStack = createStackNavigator();
const TransactionHistoryStack = createStackNavigator();
const TransactionInProgressStack = createStackNavigator();
const rootStack = createStackNavigator();
const UsersStack = createStackNavigator();
const TagsStack = createStackNavigator();
const CarsStack = createStackNavigator();
const InvoicesStack = createStackNavigator();
const PaymentMethodsStack = createStackNavigator();

// Navigation Tab variable
const ChargingStationDetailsTabs = createMaterialBottomTabNavigator();
const ChargingStationConnectorDetailsTabs = createMaterialBottomTabNavigator();
const TransactionDetailsTabs = createMaterialBottomTabNavigator();

// Navigation Drawer variable
const AppDrawer = createDrawerNavigator();

type TabBarIconType =
  | 'AntDesign'
  | 'Entypo'
  | 'EvilIcons'
  | 'Feather'
  | 'FontAwesome'
  | 'FontAwesome5'
  | 'Foundation'
  | 'Ionicons'
  | 'MaterialCommunityIcons'
  | 'MaterialIcons'
  | 'Octicons'
  | 'SimpleLineIcons'
  | 'Zocial';

const createTabBarIcon = (
  props: { focused: boolean; tintColor?: string; horizontal?: boolean },
  type: TabBarIconType,
  name: string
): React.ReactNode => {
  const commonColor = Utils.getCurrentCommonColor();
  return (
    <Icon
      style={{
        color: props.focused ? commonColor.textColor : commonColor.disabledDark,
        paddingBottom: 10,
        fontSize: scale(25),
        height: scale(30)
      }}
      type={type}
      name={name}
    />
  );
};

const persistNavigationState = async (navigationState: NavigationState) => {
  try {
    await SecuredStorage.saveNavigationState(navigationState);
  } catch (error) {
    console.log(error);
  }
};

function createAuthNavigator(props: BaseProps) {
  return (
    <AuthStack.Navigator initialRouteName={'Login'} screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={Login} initialParams={props?.route?.params?.params} />
      <AuthStack.Screen name="Tenants" component={Tenants} initialParams={props?.route?.params?.params} />
      <AuthStack.Screen name="TenantQrCode" component={TenantQrCode} initialParams={props?.route?.params?.params} />
      <AuthStack.Screen name="Eula" component={Eula} initialParams={props?.route?.params?.params} />
      <AuthStack.Screen name="SignUp" component={SignUp} initialParams={props?.route?.params?.params} />
      <AuthStack.Screen name="ResetPassword" component={ResetPassword} initialParams={props?.route?.params?.params} />
      <AuthStack.Screen name="RetrievePassword" component={RetrievePassword} initialParams={props?.route?.params?.params} />
    </AuthStack.Navigator>
  );
}

function createStatsNavigator(props: BaseProps) {
  return (
    <StatsStack.Navigator initialRouteName="Statistics" screenOptions={{ headerShown: false }}>
      <StatsStack.Screen name="Statistics" component={Statistics} initialParams={props?.route?.params?.params} />
    </StatsStack.Navigator>
  );
}

function createReportErrorNavigator(props: BaseProps) {
  return (
    <ReportErrorStack.Navigator initialRouteName="ReportError" screenOptions={{ headerShown: false }}>
      <ReportErrorStack.Screen name="ReportError" component={ReportError} initialParams={props?.route?.params?.params} />
    </ReportErrorStack.Navigator>
  );
}

function getTabStyle(): any {
  const commonColor = Utils.getCurrentCommonColor();
  return {
    backgroundColor: commonColor.containerBgColor,
    borderTopWidth: 1,
    borderTopColor: 'darkgray',
    paddingTop: 0,
    marginTop: 0,
    paddingBottom: PLATFORM.IOS === Platform.OS ? scale(10) : 0
  };
}

function createChargingStationDetailsTabsNavigator(props: BaseProps) {
  const commonColor = Utils.getCurrentCommonColor();
  const barStyle = getTabStyle();
  return (
    <ChargingStationDetailsTabs.Navigator
      initialRouteName="ChargingStationActions"
      activeColor={commonColor.topTabBarActiveTextColor}
      inactiveColor={commonColor.topTabBarActiveTextColor}
      barStyle={barStyle}
      labeled
      shifting={true}
      backBehavior="history"
    >
      <ChargingStationDetailsTabs.Screen
        name="ChargingStationActions"
        component={ChargingStationActions}
        initialParams={props?.route?.params?.params}
        options={{
          title: I18n.t('chargers.actions'),
          tabBarIcon: (iconProps) => createTabBarIcon(iconProps, 'MaterialIcons', 'build')
        }}
      />
      <ChargingStationDetailsTabs.Screen
        name="ChargingStationOcppParameters"
        component={ChargingStationOcppParameters}
        initialParams={props?.route?.params?.params}
        options={{
          title: I18n.t('chargers.ocpp'),
          tabBarIcon: (iconProps) => createTabBarIcon(iconProps, 'MaterialIcons', 'format-list-bulleted')
        }}
      />
      <ChargingStationDetailsTabs.Screen
        name="ChargingStationProperties"
        component={ChargingStationProperties}
        initialParams={props?.route?.params?.params}
        options={{
          title: I18n.t('chargers.properties'),
          tabBarIcon: (iconProps) => createTabBarIcon(iconProps, 'MaterialIcons', 'info')
        }}
      />
    </ChargingStationDetailsTabs.Navigator>
  );
}

function createChargingStationConnectorDetailsTabsNavigator(props: BaseProps) {
  const commonColor = Utils.getCurrentCommonColor();
  const barStyle = getTabStyle();
  return (
    <ChargingStationConnectorDetailsTabs.Navigator
      initialRouteName="ChargingStationConnectorDetails"
      activeColor={commonColor.topTabBarActiveTextColor}
      inactiveColor={commonColor.topTabBarActiveTextColor}
      barStyle={barStyle}
      labeled
      shifting={true}
      backBehavior="history"
    >
      <ChargingStationConnectorDetailsTabs.Screen
        name="ChargingStationConnectorDetails"
        component={ChargingStationConnectorDetails}
        initialParams={props?.route?.params?.params}
        options={{
          title: I18n.t('sites.chargePoint'),
          tabBarIcon: (iconProps) => createTabBarIcon(iconProps, 'FontAwesome', 'bolt')
        }}
      />
      <ChargingStationConnectorDetailsTabs.Screen
        name="TransactionChart"
        component={TransactionChart}
        initialParams={props?.route?.params?.params}
        options={{
          title: I18n.t('details.graph'),
          tabBarIcon: (iconProps) => createTabBarIcon(iconProps, 'MaterialCommunityIcons', 'chart-line')
        }}
      />
    </ChargingStationConnectorDetailsTabs.Navigator>
  );
}

function createTransactionDetailsTabsNavigator(props: BaseProps) {
  const commonColor = Utils.getCurrentCommonColor();
  const barStyle = getTabStyle();
  return (
    <TransactionDetailsTabs.Navigator
      initialRouteName="TransactionDetails"
      shifting={true}
      activeColor={commonColor.topTabBarActiveTextColor}
      inactiveColor={commonColor.topTabBarTextColor}
      barStyle={barStyle}
      labeled
      backBehavior="history"
    >
      <TransactionDetailsTabs.Screen
        name="TransactionDetails"
        component={TransactionDetails}
        initialParams={props?.route?.params?.params}
        options={{
          title: I18n.t('transactions.transaction'),
          tabBarIcon: (iconProps) => createTabBarIcon(iconProps, 'FontAwesome', 'bolt')
        }}
      />
      <TransactionDetailsTabs.Screen
        name="TransactionChart"
        component={TransactionChart}
        initialParams={props?.route?.params?.params}
        options={{
          title: I18n.t('details.graph'),
          tabBarIcon: (iconProps) => createTabBarIcon(iconProps, 'MaterialCommunityIcons', 'chart-line')
        }}
      />
    </TransactionDetailsTabs.Navigator>
  );
}

function createSitesNavigator(props: BaseProps) {
  return (
    <SitesStack.Navigator initialRouteName="Sites" screenOptions={{ headerShown: false }}>
      <SitesStack.Screen
        name="Sites"
        component={Sites}
        initialParams={props?.route?.params?.params}
      />
      <SitesStack.Screen
        name="SiteAreas"
        component={SiteAreas}
        initialParams={props?.route?.params?.params}
      />
      <SitesStack.Screen
        name="ChargingStations"
        component={ChargingStations}
        initialParams={props?.route?.params?.params}
      />
      <SitesStack.Screen
        name="AddCar" component={AddCar}
        initialParams={props?.route?.params?.params}
      />
      <SitesStack.Screen
        name="AddPaymentMethod"
        component={StripePaymentMethodCreationForm}
        initialParams={props?.route?.params?.params}
      />
      <SitesStack.Screen name="ChargingStationDetailsTabs"
        component={createChargingStationDetailsTabsNavigator}
        initialParams={props?.route?.params?.params}
      />
      <SitesStack.Screen
        name="ChargingStationConnectorDetailsTabs"
        component={createChargingStationConnectorDetailsTabsNavigator}
        initialParams={props?.route?.params?.params}
      />
      <SitesStack.Screen
        name="TransactionDetailsTabs"
        component={createTransactionDetailsTabsNavigator}
        initialParams={props?.route?.params?.params}
      />
      <SitesStack.Screen
        name="ReportError"
        component={ReportError}
        initialParams={props?.route?.params?.params}
      />
    </SitesStack.Navigator>
  );
}

function createChargingStationsNavigator(props: BaseProps) {
  return (
    <ChargingStationsStack.Navigator initialRouteName="ChargingStations" screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <ChargingStationsStack.Screen
        name="ChargingStations"
        component={ChargingStations}
        initialParams={props?.route?.params?.params}
      />
      <ChargingStationsStack.Screen
        name="ChargingStationDetailsTabs"
        component={createChargingStationDetailsTabsNavigator}
        initialParams={props?.route?.params?.params}
      />
      <ChargingStationsStack.Screen
        name="ChargingStationConnectorDetailsTabs"
        component={createChargingStationConnectorDetailsTabsNavigator}
        initialParams={props?.route?.params?.params}
      />
      <ChargingStationsStack.Screen name="AddCar" component={AddCar} initialParams={props?.route?.params?.params} />
      <ChargingStationsStack.Screen
        name="AddPaymentMethod"
        component={StripePaymentMethodCreationForm}
        initialParams={props?.route?.params?.params}
      />
      <ChargingStationsStack.Screen name="QRCodeScanner" component={ChargingStationQrCode} initialParams={props?.route?.params?.params} />
      <ChargingStationsStack.Screen
        name="TransactionDetailsTabs"
        component={createTransactionDetailsTabsNavigator}
        initialParams={props?.route?.params?.params}
      />
      <ChargingStationsStack.Screen
        name="ReportError"
        component={ReportError}
        initialParams={props?.route?.params?.params}
      />
    </ChargingStationsStack.Navigator>
  );
}

function createTransactionHistoryNavigator(props: BaseProps) {
  return (
    <TransactionHistoryStack.Navigator initialRouteName="TransactionsHistory" screenOptions={{ headerShown: false }}>
      <TransactionHistoryStack.Screen
        name="TransactionsHistory"
        component={TransactionsHistory}
        initialParams={props?.route?.params?.params}
      />
      <TransactionHistoryStack.Screen
        name="TransactionDetailsTabs"
        component={createTransactionDetailsTabsNavigator}
        initialParams={props?.route?.params?.params}
      />
    </TransactionHistoryStack.Navigator>
  );
}

function createTransactionInProgressNavigator(props: BaseProps) {
  return (
    <TransactionInProgressStack.Navigator initialRouteName="TransactionsInProgress" screenOptions={{ headerShown: false }}>
      <TransactionInProgressStack.Screen
        name="TransactionsInProgress"
        component={TransactionsInProgress}
        initialParams={props?.route?.params?.params}
      />
      <TransactionInProgressStack.Screen
        name="ChargingStationConnectorDetailsTabs"
        component={createChargingStationConnectorDetailsTabsNavigator}
        initialParams={props?.route?.params?.params}
      />
    </TransactionInProgressStack.Navigator>
  );
}

function createUsersNavigator(props: BaseProps) {
  return (
    <UsersStack.Navigator initialRouteName="Users" screenOptions={{ headerShown: false }}>
      <UsersStack.Screen name="Users" component={Users} initialParams={props?.route?.params?.params} />
    </UsersStack.Navigator>
  );
}

function createTagsNavigator(props: BaseProps) {
  return (
    <TagsStack.Navigator initialRouteName="Tags" screenOptions={{ headerShown: false }}>
      <TagsStack.Screen name="Tags" component={Tags} initialParams={props?.route?.params?.params} />
    </TagsStack.Navigator>
  );
}

function createCarsNavigator(props: BaseProps) {
  return (
    <CarsStack.Navigator initialRouteName="Cars" screenOptions={{ headerShown: false }}>
      <CarsStack.Screen name="Cars" component={Cars} initialParams={props?.route?.params?.params} />
      <CarsStack.Screen name={'AddCar'} component={AddCar} initialParams={props?.route?.params?.params} />
    </CarsStack.Navigator>
  );
}

function createInvoicesNavigator(props: BaseProps) {
  return (
    <InvoicesStack.Navigator initialRouteName="Invoices" screenOptions={{ headerShown: false }}>
      <InvoicesStack.Screen name="Invoices" component={Invoices} initialParams={props?.route?.params?.params} />
    </InvoicesStack.Navigator>
  );
}

function createPaymentMethodsNavigator(props: BaseProps) {
  return (
    <PaymentMethodsStack.Navigator initialRouteName="PaymentMethods" screenOptions={{ headerShown: false }}>
      <PaymentMethodsStack.Screen
        name="PaymentMethods"
        component={PaymentMethods}
        initialParams={props?.route?.params?.params}
      />
      <PaymentMethodsStack.Screen
        name="StripePaymentMethodCreationForm"
        component={StripePaymentMethodCreationForm}
        initialParams={props?.route?.params?.params}
      />
    </PaymentMethodsStack.Navigator>
  );
}

function createAppDrawerNavigator(props: BaseProps) {
  return (
    <AppDrawer.Navigator
      initialRouteName="ChargingStationsNavigator"
      screenOptions={(drawerProps) => ({
        headerShown: false,
        drawerType: 'front',
        swipeEnabled: false,
        swipeEdgeWidth: scale(50),
        unmountOnBlur: false
      })}
      backBehavior={'history'}
      drawerPosition="left"
      drawerContent={(drawerProps) => <Sidebar {...drawerProps} />}>
      <AppDrawer.Screen name="ChargingStationsNavigator" component={createChargingStationsNavigator} initialParams={props?.route?.params?.params}/>
      <AppDrawer.Screen name="QRCodeScanner" component={ChargingStationQrCode} initialParams={props?.route?.params?.params} />
      <AppDrawer.Screen name="SitesNavigator" component={createSitesNavigator} initialParams={props?.route?.params?.params} />
      <AppDrawer.Screen name="StatisticsNavigator" component={createStatsNavigator} initialParams={props?.route?.params?.params} />
      <AppDrawer.Screen name="ReportErrorNavigator" component={createReportErrorNavigator} initialParams={props?.route?.params?.params} />
      <AppDrawer.Screen name="TransactionHistoryNavigator" component={createTransactionHistoryNavigator} initialParams={props?.route?.params?.params}/>
      <AppDrawer.Screen name="TransactionInProgressNavigator" component={createTransactionInProgressNavigator} initialParams={props?.route?.params?.params}/>
      <AppDrawer.Screen name="UsersNavigator" component={createUsersNavigator} initialParams={props?.route?.params?.params} />
      <AppDrawer.Screen name="TagsNavigator" component={createTagsNavigator} initialParams={props?.route?.params?.params} />
      <AppDrawer.Screen name="CarsNavigator" component={createCarsNavigator} initialParams={props?.route?.params?.params} />
      <AppDrawer.Screen name="InvoicesNavigator" component={createInvoicesNavigator} initialParams={props?.route?.params?.params} />
      <AppDrawer.Screen name="PaymentMethodsNavigator" component={createPaymentMethodsNavigator} initialParams={props?.route?.params?.params}/>
    </AppDrawer.Navigator>
  );
}

export interface Props {}
interface State {
  switchTheme?: boolean;
  isNavigationStateLoaded?: boolean;
  navigationState?: InitialState;
  showAppUpdateDialog?: boolean;
}

export default class App extends React.Component<Props, State> {
  public state: State;
  public props: Props;
  public notificationManager: NotificationManager;
  public deepLinkingManager: DeepLinkingManager;
  public centralServerProvider: CentralServerProvider;
  private location: LocationManager;
  private appVersion: CheckVersionResponse;

  public constructor(props: Props) {
    super(props);
    this.state = {
      switchTheme: false,
      navigationState: null,
      isNavigationStateLoaded: false,
      showAppUpdateDialog: false
    };
  }

  public setState = (
    state: State | ((prevState: Readonly<State>, props: Readonly<Props>) => State | Pick<State, never>) | Pick<State, never>,
    callback?: () => void
  ) => {
    super.setState(state, callback);
  };

  public async componentDidMount() {
    // Load Navigation State
    const navigationState = await SecuredStorage.getNavigationState();
    // Get the central server
    this.centralServerProvider = await ProviderFactory.getProvider();
    // Init Notification --------------------------------------
    this.notificationManager = NotificationManager.getInstance();
    this.notificationManager.setCentralServerProvider(this.centralServerProvider);
    await this.notificationManager.start();
    // Assign
    this.centralServerProvider.setNotificationManager(this.notificationManager);
    // Init Deep Linking ---------------------------------------
    this.deepLinkingManager = DeepLinkingManager.getInstance();
    // Activate Deep links
    this.deepLinkingManager.startListening();
    // Location ------------------------------------------------
    this.location = await LocationManager.getInstance();
    this.location.startListening();
    // Check migration
    const migrationManager = MigrationManager.getInstance();
    migrationManager.setCentralServerProvider(this.centralServerProvider);
    await migrationManager.migrate();
    // Check for app updates
    await this.checkForUpdates();
    // Set
    this.setState({
      navigationState,
      isNavigationStateLoaded: true,
      showAppUpdateDialog: !!this.appVersion?.needsUpdate
    });
  }

  private async checkForUpdates(){
    try {
      this.appVersion = await checkVersion();
    } catch ( error ) {
      // If version check fail, do nothing (user cannot do anything)
    }
  }

  public componentWillUnmount() {
    // Deactivate Deep links
    this.deepLinkingManager?.stopListening();
    // Stop Notifications
    this.notificationManager?.stop();
    // Stop Location
    this.location?.stopListening();
  }

  public render() {
    const { showAppUpdateDialog } = this.state;
    return (
      this.state.isNavigationStateLoaded && (
        <RootSiblingParent>
          {showAppUpdateDialog && (
            <AppUpdateDialog appVersion={this.appVersion} close={() => this.setState({ showAppUpdateDialog: false })} />
          )}
          <StatusBar barStyle={ThemeManager.getInstance()?.isThemeTypeIsDark() ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
          {this.createRootNavigator()}
        </RootSiblingParent>
      )
    );
  }

  private createRootNavigator() {
    return (
      <NavigationContainer
        ref={(navigatorRef) => {
          if (navigatorRef) {
            this.notificationManager?.initialize(navigatorRef);
            this.notificationManager.checkOnHoldNotification();
            this.deepLinkingManager?.initialize(navigatorRef, this.centralServerProvider);
          }
        }}
        onStateChange={persistNavigationState}
        initialState={this.state.navigationState}>
        <rootStack.Navigator initialRouteName="AuthNavigator" screenOptions={{ headerShown: false }}>
          <rootStack.Screen name="AuthNavigator" component={createAuthNavigator} />
          <rootStack.Screen name="AppDrawerNavigator" component={createAppDrawerNavigator} />
        </rootStack.Navigator>
      </NavigationContainer>
    );
  }
}
