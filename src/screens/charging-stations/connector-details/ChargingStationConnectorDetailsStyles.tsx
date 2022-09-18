import deepmerge from 'deepmerge';
import { Platform, StyleSheet } from 'react-native';
import ResponsiveStylesSheet from 'react-native-responsive-stylesheet';
import { ScaledSheet } from 'react-native-size-matters';

import Utils from '../../../utils/Utils';

export default function computeStyleSheet(): StyleSheet.NamedStyles<any> {
  const commonColor = Utils.getCurrentCommonColor();
  const commonStyles = ScaledSheet.create({
    text: {
      color: commonColor.textColor,
      textAlign: 'center'
    },
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      backgroundColor: commonColor.containerBgColor,
      width: '100%'
    },
    spinner: {
      flex: 1,
      backgroundColor: commonColor.containerBgColor
    },
    backgroundImage: {
      width: '100%',
      height: '135@s',
      alignItems: 'center',
      justifyContent: 'center',
      borderTopWidth: 0.5,
      borderTopColor: commonColor.disabledDark,
      backgroundColor: commonColor.headerBgColor,
    },
    imageInnerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      width: '100%'
    },
    lastTransactionContainer: {
      width: '50@s',
      height: '50@s',
      backgroundColor: 'transparent'
    },
    buttonLastTransaction: {
      width: '50@s',
      height: '50@s',
      borderRadius: '25@s',
      borderStyle: 'solid',
      borderWidth: '4@s',
      borderColor: commonColor.textColor,
      backgroundColor: commonColor.containerBgColor,
      justifyContent: 'center',
      alignItems: 'center'
    },
    reportErrorContainer: {
      width: '50@s',
      height: '50@s',
      justifyContent: 'center'
    },
    reportErrorButton: {
      width: '50@s',
      height: '50@s',
      borderRadius: '25@s',
      borderStyle: 'solid',
      borderWidth: '4@s',
      borderColor: commonColor.danger,
      backgroundColor: commonColor.containerBgColor,
      justifyContent: 'center',
      alignItems: 'center'
    },
    transactionContainer: {
      padding: '0@s',
      justifyContent: 'center',
      alignSelf: 'center'
    },
    buttonTransaction: {
      width: '90@s',
      height: '90@s',
      borderRadius: '45@s',
      borderStyle: 'solid',
      borderWidth: '4@s',
      borderColor: commonColor.textColor,
      backgroundColor: commonColor.containerBgColor,
      justifyContent: 'center',
      alignItems: 'center'
    },
    noButtonStopTransaction: {
      height: '15@s'
    },
    startTransaction: {
      borderColor: commonColor.success
    },
    stopTransaction: {
      borderColor: commonColor.danger
    },
    transactionIcon: {
      fontSize: '75@s'
    },
    lastTransactionIcon: {
      color: commonColor.textColor
    },
    reportErrorIcon: {
      fontSize: '25@s',
      color: commonColor.danger
    },
    startTransactionIcon: {
      color: commonColor.success
    },
    stopTransactionIcon: {
      color: commonColor.danger
    },
    buttonTransactionDisabled: {
      borderColor: commonColor.buttonDisabledBg
    },
    transactionDisabledIcon: {
      color: commonColor.buttonDisabledBg,
      backgroundColor: 'transparent'
    },
    selectUserCarBadgeContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      flex: 1,
      width: '100%'
    },
    connectorInfoSettingsContainer: {
      flex: 1,
      borderTopWidth: 0.5,
      borderTopColor: commonColor.disabledDark,
      backgroundColor: commonColor.headerBgColor,
    },
    scrollViewContainer: {
      width: '100%',
      height: 'auto',
      backgroundColor: commonColor.containerBgColor,
    },
    chargingSettingsContainer: {
      marginHorizontal: '2.5%',
      justifyContent: 'center',
      alignItems: 'center',
      height: 'auto',
      paddingTop: '10@s',
      paddingBottom: '20@s'
    },
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      height: '100@s',
      alignSelf: 'center',
      width: '100%'
    },
    rowUserCarBadgeContainer: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center'
    },
    columnContainer: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '50%'
    },
    connectorLetter: {
      marginTop: '5@s',
      marginBottom: '5@s'
    },
    label: {
      fontSize: '16@s',
      color: commonColor.textColor,
      alignSelf: 'center'
    },
    labelValue: {
      fontSize: '25@s',
      fontWeight: 'bold',
      color: commonColor.textColor
    },
    batteryStartValue: {
      fontSize: '18@s'
    },
    upToSymbol: {
      fontSize: '21@s'
    },
    labelUser: {
      fontSize: '11@s',
      paddingTop: '5@s',
      color: commonColor.textColor
    },
    subLabel: {
      fontSize: '10@s',
      marginTop: Platform.OS === 'ios' ? '0@s' : '-2@s',
      color: commonColor.textColor,
      alignSelf: 'center'
    },
    subLabelStatusError: {
      color: commonColor.danger,
      marginTop: '2@s'
    },
    subLabelUser: {
      fontSize: '8@s',
      marginTop: '0@s',
      color: commonColor.textColor
    },
    icon: {
      color: commonColor.textColor
    },
    downArrow: {
      fontSize: '30@s'
    },
    listContainer: {
      width: '100%',
      height: '100%'
    },
    info: {
      color: commonColor.textColor,
      borderColor: commonColor.textColor
    },
    success: {
      color: commonColor.success
    },
    warning: {
      color: commonColor.warning
    },
    danger: {
      color: commonColor.danger
    },
    disabled: {
      color: commonColor.buttonDisabledBg,
      borderColor: commonColor.buttonDisabledBg
    },
    messageText: {
      textAlign: 'left',
      fontSize: '13@s'
    },
    errorMessage: {
      color: commonColor.dangerLight,
      fontSize: '14@s'
    },
    noPaymentMethodIcon: {
      color: commonColor.dangerLight,
      marginHorizontal: '10@s',
      fontSize: '50@s'
    },
    itemContainer: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      backgroundColor: commonColor.containerBgColor,
      width: '100%'
    },
    noItemContainer: {
      minHeight: '90@s',
      padding: '10@s',
      marginBottom: '11@s',
      justifyContent: 'flex-start'
    },
    noCarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    noCarIcon: {
      color: commonColor.textColor,
      fontSize: '50@s',
      marginHorizontal: '10@s'
    },
    noItemDangerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderColor: commonColor.dangerLight,
      borderWidth: 0.8,
    },
    noTagIcon: {
      color: commonColor.dangerLight,
      fontSize: '50@s',
      marginHorizontal: '10@s'
    },
    adviceText: {
      fontSize: '12@s',
      textAlign: 'center',
      marginLeft: '10@s',
      color: commonColor.light
    },
    messageContainer: {
      backgroundColor: commonColor.listItemBackground,
      flexDirection: 'row',
      alignItems: 'center',
      padding: '12@s',
      width: '95%',
      borderRadius: '8@s',
      marginBottom: '10@s'
    },
    adviceMessageContainer: {
      backgroundColor: 'rgba(0,0,0,0.3)',
      padding: '3@s',
      marginBottom: 0,
      marginVertical: '4@s',
      justifyContent: 'center'
    },
    adviceMessageIcon: {
      fontSize: '25@s',
      color: commonColor.light
    },
    errorMessageContainer: {
      borderColor: commonColor.dangerLight,
      borderWidth: 0.8
    },
    inputContainer: {
      marginBottom: '7@s'
    },
    selectionContainer: {
      width: '100%'
    },
    column: {
      flexDirection: 'column',
      flex: 1
    },
    linkText: {
      color: commonColor.brandPrimaryLight,
      alignItems: 'center'
    },
    switchContainer: {
      flexDirection: 'row',
      marginTop: '5@s',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginBottom: '20@s',
      width: '100%',
      marginLeft: '5%'
    },
    switchLabel: {
      fontSize: '14@s',
      marginRight: '10@s'
    },
    errorAsterisk: {
      color: commonColor.danger,
      fontSize: '20@s'
    },
    plusSign: {
      fontSize: '25@s',
      color: commonColor.brandPrimaryLight,
      marginRight: '5@s'
    },
    addItemContainer: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'flex-start',
      alignItems: 'center'
    },
    linkLabel: {
      flex: 1
    },
    accordion: {
      width: '100%',
      marginBottom: '10@s',
      paddingLeft: '10@s',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    accordionText: {
      color: commonColor.textColor,
      fontSize: '15@s'
    },
    accordionIcon: {
      color: commonColor.textColor,
      fontSize: '35@s'
    },
    itemComponentContainer: {
      marginBottom: '10@s'
    },
    activityIndicator: {
      marginTop: '70@s',
      padding: '10@s',
      backgroundColor: commonColor.containerBgColor,
      zIndex: 2
    }
  });
  const portraitStyles = {};
  const landscapeStyles = {
    reportErrorContainer: {
      marginLeft: '84%'
    }
  };
  return ResponsiveStylesSheet.createOriented({
    landscape: deepmerge(commonStyles, landscapeStyles) as StyleSheet.NamedStyles<any>,
    portrait: deepmerge(commonStyles, portraitStyles) as StyleSheet.NamedStyles<any>
  });
}
