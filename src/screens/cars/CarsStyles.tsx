import deepmerge from 'deepmerge';
import { StyleSheet } from 'react-native';
import ResponsiveStylesSheet from 'react-native-responsive-stylesheet';
import { ScaledSheet } from 'react-native-size-matters';

import Utils from '../../utils/Utils';

export default function computeStyleSheet(): StyleSheet.NamedStyles<any> {
  const commonColor = Utils.getCurrentCommonColor();
  const commonStyles = ScaledSheet.create({
    content: {
      flex: 1,
      marginHorizontal: '2.5%'
    },
    icon: {
      color: commonColor.textColor,
      fontSize: '27@s'
    },
    fab: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      margin: '16@s',
      zIndex: 1,
      elevation: 4,
      backgroundColor: commonColor.primary,
      shadowOffset: {
        width: 0,
        height: 1
      },
      shadowOpacity: 0.23,
      shadowRadius: 3.62
    },
    filtersContainer: {
      flexDirection: 'row',
      zIndex: 1,
      marginVertical: '10@s',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: '10@s'
    },
    filterButton: {
      borderRadius: '8@s',
      width: '45@s',
      height: '45@s',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: '10@s',
      backgroundColor: commonColor.listHeaderBgColor,
    },
    filterButtonIcon: {
      color: commonColor.textColor
    },
    searchBarComponent: {
      backgroundColor: commonColor.listHeaderBgColor,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    }
  });
  const portraitStyles = {};
  const landscapeStyles = {};
  return ResponsiveStylesSheet.createOriented({
    landscape: deepmerge(commonStyles, landscapeStyles) as StyleSheet.NamedStyles<any>,
    portrait: deepmerge(commonStyles, portraitStyles) as StyleSheet.NamedStyles<any>
  });
}
