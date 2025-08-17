import { injectable } from '../container/ioc';
import { Profile } from '../models';
import {
  Currency,
  ICurrencyService,
  ICurrencyConversion,
  IMultiCurrencyBalance,
  IExchangeRate,
  CurrencyConversionError
} from '../types/global-payroll';
import logger from '../utils/logger';

@injectable()
export class CurrencyService implements ICurrencyService {
  private exchangeRates: Map<string, IExchangeRate> = new Map();
  private readonly supportedCurrencies: Currency[] = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'CHF'];

  constructor() {
    this.initializeExchangeRates();
  }

  /**
   * Initialize default exchange rates
   */
  private initializeExchangeRates(): void {
    const defaultRates: Record<string, number> = {
      'USD_EUR': 0.85,
      'USD_GBP': 0.73,
      'USD_INR': 74.5,
      'USD_CAD': 1.25,
      'USD_AUD': 1.35,
      'USD_JPY': 110.0,
      'USD_CHF': 0.92,
      'EUR_USD': 1.18,
      'EUR_GBP': 0.86,
      'EUR_INR': 87.6,
      'EUR_CAD': 1.47,
      'EUR_AUD': 1.59,
      'EUR_JPY': 129.4,
      'EUR_CHF': 1.08,
      'GBP_USD': 1.37,
      'GBP_EUR': 1.16,
      'GBP_INR': 101.9,
      'GBP_CAD': 1.71,
      'GBP_AUD': 1.85,
      'GBP_JPY': 150.7,
      'GBP_CHF': 1.26,
    };

    Object.entries(defaultRates).forEach(([pair, rate]) => {
      const [from, to] = pair.split('_') as [Currency, Currency];
      this.exchangeRates.set(pair, {
        fromCurrency: from,
        toCurrency: to,
        rate,
        source: 'daily-fix',
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });
    });

    logger.info(`Initialized ${this.exchangeRates.size} exchange rates`);
  }

  /**
   * Convert currency with exchange rate
   */
  public async convertCurrency(
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency,
    exchangeRateSource: 'real-time' | 'daily-fix' | 'manual' = 'daily-fix'
  ): Promise<ICurrencyConversion> {
    try {
      if (fromCurrency === toCurrency) {
        return {
          fromCurrency,
          toCurrency,
          originalAmount: amount,
          convertedAmount: amount,
          exchangeRate: 1,
          fees: 0,
          totalAmount: amount,
          timestamp: new Date(),
        };
      }

      const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency, exchangeRateSource);
      const convertedAmount = amount * exchangeRate.rate;
      const fees = this.calculateConversionFees(amount, fromCurrency, toCurrency);
      const totalAmount = convertedAmount - fees;

      const conversion: ICurrencyConversion = {
        fromCurrency,
        toCurrency,
        originalAmount: amount,
        convertedAmount,
        exchangeRate: exchangeRate.rate,
        fees,
        totalAmount,
        timestamp: new Date(),
      };

      logger.info(`Currency conversion: ${amount} ${fromCurrency} = ${totalAmount} ${toCurrency} (rate: ${exchangeRate.rate})`);

      return conversion;
    } catch (error) {
      logger.error(`Currency conversion failed: ${fromCurrency} to ${toCurrency}`, error);
      throw new CurrencyConversionError(
        `Failed to convert ${amount} ${fromCurrency} to ${toCurrency}`,
        fromCurrency,
        toCurrency
      );
    }
  }

  /**
   * Get exchange rate for currency pair
   */
  private async getExchangeRate(
    fromCurrency: Currency,
    toCurrency: Currency,
    source: 'real-time' | 'daily-fix' | 'manual'
  ): Promise<IExchangeRate> {
    const pair = `${fromCurrency}_${toCurrency}`;
    let exchangeRate = this.exchangeRates.get(pair);

    if (!exchangeRate || exchangeRate.expiresAt < new Date()) {
      // In production, this would fetch from external API
      exchangeRate = await this.fetchExchangeRate(fromCurrency, toCurrency, source);
      this.exchangeRates.set(pair, exchangeRate);
    }

    return exchangeRate;
  }

  /**
   * Fetch exchange rate from external source
   */
  private async fetchExchangeRate(
    fromCurrency: Currency,
    toCurrency: Currency,
    source: 'real-time' | 'daily-fix' | 'manual'
  ): Promise<IExchangeRate> {
    // Mock implementation - in production, this would call external APIs like:
    // - Fixer.io
    // - ExchangeRate-API
    // - CurrencyLayer
    // - European Central Bank

    const mockRates: Record<string, number> = {
      'USD_EUR': 0.85 + (Math.random() - 0.5) * 0.02, // ±1% variation
      'USD_GBP': 0.73 + (Math.random() - 0.5) * 0.02,
      'USD_INR': 74.5 + (Math.random() - 0.5) * 2,
      'USD_CAD': 1.25 + (Math.random() - 0.5) * 0.02,
      'USD_AUD': 1.35 + (Math.random() - 0.5) * 0.02,
      'USD_JPY': 110.0 + (Math.random() - 0.5) * 2,
      'USD_CHF': 0.92 + (Math.random() - 0.5) * 0.01,
    };

    const pair = `${fromCurrency}_${toCurrency}`;
    const rate = mockRates[pair] || 1.0;

    return {
      fromCurrency,
      toCurrency,
      rate,
      source,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + (source === 'real-time' ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000)), // 5 min for real-time, 24h for others
    };
  }

  /**
   * Calculate conversion fees
   */
  private calculateConversionFees(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
    // Fee structure (in production, this would be configurable)
    const baseFee = 2.50; // USD
    const percentageFee = 0.01; // 1%
    
    // Convert base fee to source currency if needed
    let baseFeeInSourceCurrency = baseFee;
    if (fromCurrency !== 'USD') {
      const usdToSourceRate = this.exchangeRates.get(`USD_${fromCurrency}`)?.rate || 1;
      baseFeeInSourceCurrency = baseFee * usdToSourceRate;
    }

    const percentageAmount = amount * percentageFee;
    return Math.max(baseFeeInSourceCurrency, percentageAmount);
  }

  /**
   * Update multi-currency balance for a profile
   */
  public async updateMultiCurrencyBalance(profileId: number, currency: Currency, amount: number): Promise<void> {
    try {
      const profile = await Profile.findByPk(profileId);
      if (!profile) {
        throw new Error(`Profile ${profileId} not found`);
      }

      let balances: IMultiCurrencyBalance = {};
      if (profile.balances) {
        try {
          balances = JSON.parse(profile.balances);
        } catch (error) {
          logger.warn(`Invalid balances JSON for profile ${profileId}, resetting`);
          balances = {};
        }
      }

      balances[currency] = (balances[currency] || 0) + amount;
      
      // Ensure balance doesn't go negative
      if (balances[currency] < 0) {
        balances[currency] = 0;
        logger.warn(`Balance for ${currency} would be negative, setting to 0`);
      }

      profile.balances = JSON.stringify(balances);
      profile.version += 1;
      await profile.save();

      logger.info(`Updated ${currency} balance for profile ${profileId}: ${amount} (new balance: ${balances[currency]})`);
    } catch (error) {
      logger.error(`Failed to update multi-currency balance for profile ${profileId}`, error);
      throw error;
    }
  }

  /**
   * Get balance in specific currency
   */
  public async getBalanceInCurrency(profileId: number, currency: Currency): Promise<number> {
    try {
      const profile = await Profile.findByPk(profileId);
      if (!profile) {
        throw new Error(`Profile ${profileId} not found`);
      }

      if (!profile.balances) {
        return 0;
      }

      const balances: IMultiCurrencyBalance = JSON.parse(profile.balances);
      return balances[currency] || 0;
    } catch (error) {
      logger.error(`Failed to get ${currency} balance for profile ${profileId}`, error);
      return 0;
    }
  }

  /**
   * Get all balances for a profile
   */
  public async getAllBalances(profileId: number): Promise<IMultiCurrencyBalance> {
    try {
      const profile = await Profile.findByPk(profileId);
      if (!profile) {
        throw new Error(`Profile ${profileId} not found`);
      }

      if (!profile.balances) {
        return {};
      }

      return JSON.parse(profile.balances);
    } catch (error) {
      logger.error(`Failed to get all balances for profile ${profileId}`, error);
      return {};
    }
  }

  /**
   * Convert balance from one currency to another
   */
  public async convertBalance(
    profileId: number,
    fromCurrency: Currency,
    toCurrency: Currency
  ): Promise<ICurrencyConversion> {
    const balance = await this.getBalanceInCurrency(profileId, fromCurrency);
    return this.convertCurrency(balance, fromCurrency, toCurrency);
  }

  /**
   * Get supported currencies
   */
  public getSupportedCurrencies(): Currency[] {
    return [...this.supportedCurrencies];
  }

  /**
   * Get current exchange rates
   */
  public getCurrentExchangeRates(): IExchangeRate[] {
    return Array.from(this.exchangeRates.values()).filter(rate => rate.expiresAt > new Date());
  }

  /**
   * Update exchange rate manually
   */
  public updateExchangeRate(
    fromCurrency: Currency,
    toCurrency: Currency,
    rate: number,
    source: 'manual' = 'manual'
  ): void {
    const pair = `${fromCurrency}_${toCurrency}`;
    const exchangeRate: IExchangeRate = {
      fromCurrency,
      toCurrency,
      rate,
      source,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    this.exchangeRates.set(pair, exchangeRate);
    logger.info(`Updated exchange rate: ${fromCurrency}_${toCurrency} = ${rate} (${source})`);
  }

  /**
   * Get currency conversion statistics
   */
  public getConversionStatistics(): {
    totalConversions: number;
    totalVolume: number;
    averageRate: number;
    mostConvertedFrom: Currency;
    mostConvertedTo: Currency;
  } {
    // Mock statistics - in production, this would track actual conversions
    return {
      totalConversions: 150,
      totalVolume: 500000,
      averageRate: 1.15,
      mostConvertedFrom: 'USD',
      mostConvertedTo: 'EUR',
    };
  }
}
