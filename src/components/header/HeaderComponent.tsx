import { DrawerActions } from '@react-navigation/native';
import { IIconProps, Icon } from 'native-base';
import React from 'react';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { scale } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

import BaseProps from '../../types/BaseProps';
import Utils from '../../utils/Utils';
import ScreenFilters from '../search/filter/screen/ScreenFilters';
import computeStyleSheet from './HeaderComponentStyles';

export interface Props extends BaseProps {
  title: string;
  subTitle?: string;
  actions?: HeaderAction[];
  modalized?: boolean;
  backArrow?: boolean;
  backAction?: () => void;
  sideBar?: boolean;
  containerStyle?: ViewStyle;
}

interface State {
  hasFilter?: boolean;
}

export interface HeaderAction {
  onPress?: () => void;
  renderAction?: () => React.ReactElement;
}

export default class HeaderComponent extends React.Component<Props, State> {
  public static defaultProps = {
    leftActionIconType: 'MaterialIcons',
    rightActionIconType: 'MaterialIcons',
    displayTenantLogo: true,
    backArrow: true,
    sideBar: false
  };
  public state: State;
  public props: Props;
  private modalFilters: ScreenFilters<any>;

  public constructor(props: Props) {
    super(props);
    this.state = {
      hasFilter: false
    };
  }

  public setState = (
    state: State | ((prevState: Readonly<State>, props: Readonly<Props>) => State | Pick<State, never>) | Pick<State, never>,
    callback?: () => void
  ) => {
    super.setState(state, callback);
  };

  public getFilterModalContainerComponent(): ScreenFilters<any> {
    return this.modalFilters;
  }

  public setFilterModalContainerComponent(filterModalContainerComponent: ScreenFilters<any>) {
    this.modalFilters = filterModalContainerComponent;
    this.setState({
      hasFilter: true
    });
  }

  public render = () => {
    const style = computeStyleSheet();
    const { title, subTitle, navigation, modalized, actions, backArrow, sideBar, backAction, containerStyle } = this.props;
    const commonColors = Utils.getCurrentCommonColor();
    const HeaderIcon = (props: IIconProps) => <Icon {...props} size={scale(25)} color={commonColors.textColor}/>;
    return (
      <View style={[style.header, modalized && style.modalHeader, containerStyle]}>
        <View style={style.leftHeader}>
          {sideBar ? (
            <TouchableOpacity
              style={style.leftIconContainer}
              onPress={() => {
                navigation.dispatch(DrawerActions.openDrawer());
                return true;
              }}>
              <HeaderIcon as={SimpleLineIcons} name={'menu'} />
            </TouchableOpacity>
          ) : (
            backArrow && (
              <TouchableOpacity
                style={style.leftIconContainer}
                onPress={backAction ?? (() => navigation.goBack())}>
                <HeaderIcon as={Feather} name={'chevron-left'} />
              </TouchableOpacity>
            )
          )}
        </View>
        <View style={style.titleContainer}>
          <Text numberOfLines={1} ellipsizeMode={'tail'} style={style.title}>
            {title}
          </Text>
          <Text numberOfLines={1} style={style.subTitle}>
            {subTitle}
          </Text>
        </View>
        <View style={style.actionsContainer}>
          {actions?.map((action, index) => (
            <TouchableOpacity delayPressIn={0} style={style.action} key={index} onPress={action.onPress}>
              {action.renderAction?.()}
            </TouchableOpacity>
          ))}
          {this.modalFilters && this.modalFilters.canFilter() && (
            <TouchableOpacity
              style={style.rightIcon}
              onPress={() => {
                this.modalFilters?.openModal();
              }}>
              <HeaderIcon
                as={MaterialCommunityIcons}
                name={this.modalFilters?.areModalFiltersActive() ? 'filter' : 'filter-outline'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
}
