import I18n from 'i18n-js';
import { Container, Spinner, View } from 'native-base';
import React from 'react';
import { FlatList, Platform, RefreshControl } from 'react-native';
import { Location } from 'react-native-location';
import MapView, { Marker } from 'react-native-maps';
import { DrawerActions } from 'react-navigation-drawer';

import HeaderComponent from '../../components/header/HeaderComponent';
import ListEmptyTextComponent from '../../components/list/empty-text/ListEmptyTextComponent';
import ListFooterComponent from '../../components/list/footer/ListFooterComponent';
import SimpleSearchComponent from '../../components/search/simple/SimpleSearchComponent';
import SiteComponent from '../../components/site/SiteComponent';
import LocationManager from '../../location/LocationManager';
import ProviderFactory from '../../provider/ProviderFactory';
import BaseProps from '../../types/BaseProps';
import { DataResult } from '../../types/DataResult';
import { GlobalFilters } from '../../types/Filter';
import Site from '../../types/Site';
import Constants from '../../utils/Constants';
import SecuredStorage from '../../utils/SecuredStorage';
import Utils from '../../utils/Utils';
import BaseAutoRefreshScreen from '../base-screen/BaseAutoRefreshScreen';
import SitesFilters, { SitesFiltersDef } from './SitesFilters';
import computeStyleSheet from './SitesStyles';

export interface Props extends BaseProps {
}

interface State {
  sites?: Site[];
  loading?: boolean;
  refreshing?: boolean;
  skip?: number;
  limit?: number;
  initialFilters?: SitesFiltersDef;
  filters?: SitesFiltersDef;
  count?: number;
  showMap?: boolean;
}

export default class Sites extends BaseAutoRefreshScreen<Props, State> {
  public state: State;
  public props: Props;
  private searchText: string;
  private currentLocation: Location;
  private locationEnabled: boolean;

  constructor(props: Props) {
    super(props);
    this.state = {
      sites: [],
      loading: true,
      refreshing: false,
      skip: 0,
      initialFilters: {},
      limit: Constants.PAGING_SIZE,
      count: 0,
      showMap: false,
    };
  }

  public setState = (state: State | ((prevState: Readonly<State>, props: Readonly<Props>) => State | Pick<State, never>) | Pick<State, never>, callback?: () => void) => {
    super.setState(state, callback);
  }

  public async componentDidMount() {
    // Get initial filters
    await this.loadInitialFilters();
    // Call parent
    await super.componentDidMount();
    // No Site Management: Go to chargers
    const securityProvider = this.centralServerProvider.getSecurityProvider();
    if (securityProvider && !securityProvider.isComponentOrganizationActive()) {
      this.props.navigation.navigate('ChargingStations');
    }
  }

  public async loadInitialFilters() {
    const centralServerProvider = await ProviderFactory.getProvider();
    let location = Utils.convertToBoolean(await SecuredStorage.loadFilterValue(
      centralServerProvider.getUserInfo(), GlobalFilters.LOCATION));
    if (!location) {
      location = false;
    }
    this.setState({
      initialFilters: { location },
      filters: { location }
    });
  }

  public async getCurrentLocation(): Promise<Location> {
    const { filters } = this.state;
    // Get the current location
    let currentLocation = (await LocationManager.getInstance()).getLocation();
    this.locationEnabled = currentLocation ? true : false;
    // Bypass location
    if (!filters.location) {
      currentLocation = null;
    }
    return currentLocation;
  }

  public getSites = async (searchText = '', skip: number, limit: number): Promise<DataResult<Site>> => {
    let sites: DataResult<Site>;
    try {
      // Get current location
      this.currentLocation = await this.getCurrentLocation();
      // Get the Sites
      sites = await this.centralServerProvider.getSites({
        Search: searchText,
        Issuer: true,
        WithAvailableChargers: true,
        LocLatitude: this.currentLocation ? this.currentLocation.latitude : null,
        LocLongitude: this.currentLocation ? this.currentLocation.longitude : null,
        LocMaxDistanceMeters: this.currentLocation ? Constants.MAX_DISTANCE_METERS : null
      }, { skip, limit });
    } catch (error) {
      // Other common Error
      Utils.handleHttpUnexpectedError(this.centralServerProvider, error,
        'sites.siteUnexpectedError', this.props.navigation, this.refresh);
    }
    // Return
    return sites;
  };

  public onBack = () => {
    // Back mobile button: Force navigation
    this.props.navigation.navigate({ routeName: 'HomeNavigator' });
    // Do not bubble up
    return true;
  };

  public refresh = async () => {
    // Component Mounted?
    if (this.isMounted()) {
      const { skip, limit } = this.state;
      // Refresh All
      const sites = await this.getSites(this.searchText, 0, skip + limit);
      // Add sites
      this.setState({
        loading: false,
        count: sites ? sites.count : 0,
        sites: sites ? sites.result : []
      });
    }
  };

  public manualRefresh = async () => {
    // Display spinner
    this.setState({ refreshing: true });
    // Refresh
    await this.refresh();
    // Hide spinner
    this.setState({ refreshing: false });
  };

  public onEndScroll = async () => {
    const { count, skip, limit } = this.state;
    // No reached the end?
    if (skip + limit < count || count === -1) {
      // No: get next sites
      const sites = await this.getSites(this.searchText, skip + Constants.PAGING_SIZE, limit);
      // Add sites
      this.setState((prevState, props) => ({
        sites: sites ? [...prevState.sites, ...sites.result] : prevState.sites,
        skip: prevState.skip + Constants.PAGING_SIZE,
        refreshing: false
      }));
    }
  };

  public search = async (searchText: string) => {
    this.searchText = searchText;
    await this.refresh();
  }

  public render() {
    const style = computeStyleSheet();
    const { navigation } = this.props;
    const { loading, skip, count, limit, initialFilters, showMap } = this.state;
    const mapIsDisplayed = showMap && this.locationEnabled && !Utils.isEmptyArray(this.state.sites)
    return (
      <Container style={style.container}>
        <HeaderComponent
          navigation={navigation}
          title={I18n.t('sidebar.sites')}
          leftAction={this.onBack}
          leftActionIcon={'navigate-before'}
          rightAction={() => navigation.dispatch(DrawerActions.openDrawer())}
          rightActionIcon={'menu'}
          diplayMap={true}
          mapIsDisplayed={mapIsDisplayed}
          diplayMapAction={() => this.setState({ showMap: !showMap })}
        />
        {loading ? (
          <Spinner style={style.spinner} />
        ) : (
          mapIsDisplayed ?
            <View style={style.content}>
              <MapView
                style={style.map}
                initialRegion={{
                  longitude: Utils.containsAddressGPSCoordinates(this.state.sites[0].address) ?
                    this.state.sites[0].address.coordinates[0] : 2.3514616,
                  latitude: Utils.containsAddressGPSCoordinates(this.state.sites[0].address) ?
                    this.state.sites[0].address.coordinates[1] : 48.8566969,
                  latitudeDelta: 0.009,
                  longitudeDelta: 0.009,
                }}
              >
                {this.state.sites.map((site) => (
                  <Marker
                    key={site.id}
                    coordinate={{ longitude: site.address.coordinates[0], latitude: site.address.coordinates[1] }}
                    title={site.name}
                    description={site.name}
                  />
                ))}
              </MapView>
            </View>
          :
            <View style={style.content}>
              <SimpleSearchComponent
                onChange={(searchText) => this.search(searchText)}
                navigation={navigation}
              />
              <SitesFilters
                initialFilters={initialFilters} locationEnabled={this.locationEnabled}
                onFilterChanged={(newFilters: SitesFiltersDef) => this.setState({ filters: newFilters }, () => this.refresh())}
                ref={(sitesFilters: SitesFilters) =>
                  this.setScreenFilters(sitesFilters)}
              />
              <FlatList
                data={this.state.sites}
                renderItem={({ item }) => <SiteComponent site={item} navigation={this.props.navigation} />}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl onRefresh={this.manualRefresh} refreshing={this.state.refreshing} />}
                onEndReached={this.onEndScroll}
                onEndReachedThreshold={Platform.OS === 'android' ? 1 : 0.1}
                ListEmptyComponent={() => <ListEmptyTextComponent navigation={navigation} text={I18n.t('sites.noSites')} />}
                ListFooterComponent={() => <ListFooterComponent navigation={navigation} skip={skip} count={count} limit={limit} />}
              />
            </View>
          )
        }
      </Container>
    );
  }
}
