// Get the supported locales for moment
import 'moment/locale/de';
import 'moment/locale/en-gb';
import 'moment/locale/es';
import 'moment/locale/fr';
import 'moment/locale/it';
import 'moment/locale/pt-br';

import i18n from 'i18n-js';
import moment from 'moment';
import { I18nManager as I18nReactNativeManager } from 'react-native';
import * as RNLocalize from 'react-native-localize';

import Constants from '../utils/Constants';
import Utils from '../utils/Utils';
import deJsonLanguage from './languages/de.json';
import enJsonLanguage from './languages/en.json';
import esJsonLanguage from './languages/es.json';
import frJsonLanguage from './languages/fr.json';
import itJsonLanguage from './languages/it.json';
import ptJsonLanguage from './languages/pt.json';

export interface FormatNumberOptions extends Intl.NumberFormatOptions {
  compactThreshold?: number;
  compactStyle?: NumberFormatCompactStyleEnum;
}

export enum NumberFormatCompactStyleEnum {
  METRIC = 'metric',
  FINANCE = 'finance'
}

export enum NumberFormatSymbolsEnum {
  PERCENT_SIGN = 'percentSign',
  UNIT = 'unit',
  CURRENCY = 'currency',
  COMPACT = 'compact'
}

export enum MetricCompactEnum {
  KILO = 'k',
  MEGA = 'M',
  GIGA = 'G',
  TERA = 'T'
}

export interface FormatNumberResult {
  unit?: string;
  currency?: string;
  compact?: string;
  percentSign?: string;
  value?: string;
}

export enum NumberFormatNotationEnum {
  SCIENTIFIC = 'scientific',
  ENGINEERING = 'engineering',
  COMPACT = 'compact',
  STANDARD = 'standard'
}

export enum NumberFormatStyleEnum {
  DECIMAL = 'decimal',
  CURRENCY = 'currency',
  PERCENT = 'percent',
  UNIT = 'unit'
}

export default class I18nManager {
  private static currency: string;

  public static initialize(): void {
    // Translation files
    const translationGetters: any = {
      en: () => enJsonLanguage,
      fr: () => frJsonLanguage,
      de: () => deJsonLanguage,
      es: () => esJsonLanguage,
      pt: () => ptJsonLanguage,
      it: () => itJsonLanguage
    };
    // Fallback if no available language fits
    i18n.fallbacks = true;
    const fallback = { languageTag: Constants.DEFAULT_LANGUAGE, isRTL: false };
    // Get current locale
    const { languageTag, isRTL } = RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) || fallback;
    // Set translation files
    i18n.translations.en = enJsonLanguage;
    i18n.translations.fr = frJsonLanguage;
    i18n.translations.de = deJsonLanguage;
    i18n.translations.es = esJsonLanguage;
    i18n.translations.pt = ptJsonLanguage;
    i18n.translations.it = itJsonLanguage;
    // Update layout direction
    I18nReactNativeManager.forceRTL(isRTL);
    // Default
    i18n.locale = languageTag;
    moment.locale(languageTag);
  }

  public static switchLanguage(language: string, currency: string) {
    // Supported languages?
    if (Constants.SUPPORTED_LANGUAGES.includes(language)) {
      i18n.locale = language;
      moment.locale(language);
    }
    // Keep the currency
    I18nManager.currency = currency;
  }

  public static formatNumber(value: number): string {
    if (!isNaN(value)) {
     return Intl.NumberFormat(i18n.locale).format(value);
    }
    return '-';
  }

  public static formatNumberWithCompacts(value: number, options: FormatNumberOptions = {}): FormatNumberResult {
    const isCompactForm =
      options.notation === NumberFormatNotationEnum.COMPACT &&
      (!options.compactThreshold || (options.compactThreshold && value > options.compactThreshold));
    const isCurrency = options.currency && options.style === NumberFormatStyleEnum.CURRENCY;
    options.currency = options.currency || I18nManager.currency;
    const isUnit = options.unit && options.style === NumberFormatStyleEnum.UNIT;
    const isPercent = options.style === NumberFormatStyleEnum.PERCENT;

    if (!isCompactForm) {
      delete options.notation;
    }
    // Format the given value with the given options
    const parts = Intl.NumberFormat(i18n.locale, options).formatToParts(value);

    // Compute the compact (prefix) if needed (Intl namespace does not supports metric compacts yet)
    let compact = this.getNumberFormatPartValue(parts, NumberFormatSymbolsEnum.COMPACT);
    if (isCompactForm && options.compactStyle === NumberFormatCompactStyleEnum.METRIC) {
      compact = this.computeMetricCompact(value);
    }
    return {
      value: this.concatenateNumberFormatParts(parts),
      currency: isCurrency && this.getNumberFormatPartValue(parts, NumberFormatSymbolsEnum.CURRENCY),
      unit: isUnit && this.getNumberFormatPartValue(parts, NumberFormatSymbolsEnum.UNIT),
      compact: isCompactForm && compact,
      percentSign: isPercent && this.getNumberFormatPartValue(parts, NumberFormatSymbolsEnum.PERCENT_SIGN)
    };
  }

  public static formatCurrency(value: number, currency?: string): string {
    currency = currency ? currency.toUpperCase() : I18nManager.currency;
    if (!isNaN(value)) {
      if (currency) {
        return new Intl.NumberFormat(i18n.locale, { style: 'currency', currency }).format(value);
      }
      return I18nManager.formatNumber(Utils.roundTo(value, 2));
    }
    return '-';
  }

  public static formatPercentage(value: number): string {
    if (isNaN(value)) {
      value = 0;
    }
    return new Intl.NumberFormat(i18n.locale, { style: 'percent' }).format(value);
  }

  public static isMetricsSystem(): boolean {
    return RNLocalize.usesMetricSystem();
  }

  public static formatDateTime(value: Date, format: string = 'LLL'): string {
    if (I18nManager.isValidDate(value)) {
      return moment(value).format(format);
    }
    return '-';
  }

  private static isValidDate(date: Date): boolean {
    return !isNaN(new Date(date).getTime());
  }

  private static concatenateNumberFormatParts(parts: Intl.NumberFormatPart[] = []): string {
    return parts
      .filter((p) => !(p.type.toUpperCase() in NumberFormatSymbolsEnum))
      .map((p) => p.value)
      .join('');
  }

  private static getNumberFormatPartValue(parts: Intl.NumberFormatPart[], type: string) {
    return parts.find((p) => p.type === type)?.value;
  }

  private static computeMetricCompact(value: number): MetricCompactEnum {
    if (value < 1000) {
      return null;
    }
    if (value >= 1000 && value < 1000000) {
      return MetricCompactEnum.KILO;
    }
    if (value >= 1000000 && value < 1000000000) {
      return MetricCompactEnum.MEGA;
    }
    if (value >= 1000000000 && value < 1000000000000) {
      return MetricCompactEnum.GIGA;
    }
    return MetricCompactEnum.TERA;
  }
}
