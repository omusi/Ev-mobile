import deepmerge from 'deepmerge';
import { StyleSheet } from 'react-native';
import ResponsiveStylesSheet from 'react-native-responsive-stylesheet';
import { ScaledSheet } from 'react-native-size-matters';

import Utils from './utils/Utils';

export default function computeStyleSheet(): StyleSheet.NamedStyles<any> {
  const commonColor = Utils.getCurrentCommonColor();
  const commonStyles = ScaledSheet.create({
    spinner: {
      flex: 1,
      backgroundColor: commonColor.containerBgColor
    },
    formContainer: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    },
    formHeader: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    },
    form: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center'
    },
    button: {
      width: '90%',
      alignSelf: 'center',
      justifyContent: 'center',
      height: '40@s',
      marginBottom: '10@s',
      backgroundColor: commonColor.buttonBg
    },
    buttonDisabled: {
      opacity: 0.4
    },
    buttonText: {
      width: '100%',
      textAlign: 'center',
      fontSize: '15@s',
      color: commonColor.textColor
    },
    inputGroup: {
      height: '40@s',
      width: '90%',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginBottom: '10@s',
      marginLeft: 0,
      paddingLeft: '10@s',
      paddingRight: '10@s',
      backgroundColor: commonColor.buttonBg,
      borderColor: 'transparent'
    },
    inputIcon: {
      color: commonColor.textColor,
      alignSelf: 'center',
      textAlign: 'center',
      width: '25@s'
    },
    inputField: {
      flex: 1,
      fontSize: '15@s',
      color: commonColor.textColor
    },
    formErrorText: {
      fontSize: '12@s',
      marginLeft: '20@s',
      color: commonColor.danger,
      alignSelf: 'flex-start',
      top: '-5@s'
    },
    formCheckboxContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '20@s',
      marginTop: '10@s'
    },
    checkbox: {
      borderColor: commonColor.textColor,
      backgroundColor: commonColor.containerBgColor,
      height: '21@s',
      width: '21@s',
      alignItems: 'center',
      marginRight: '10@s'
    },
    checkboxText: {
      fontSize: '13@s',
      color: commonColor.textColor
    }
  });
  const portraitStyles = {};
  const landscapeStyles = {};
  return ResponsiveStylesSheet.createOriented({
    landscape: deepmerge(commonStyles, landscapeStyles) as StyleSheet.NamedStyles<any>,
    portrait: deepmerge(commonStyles, portraitStyles) as StyleSheet.NamedStyles<any>
  });
}
