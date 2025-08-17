import { Currency, ICurrencyService, ICurrencyConversion, IMultiCurrencyBalance, IExchangeRate } from '../types/global-payroll';
export declare class CurrencyService implements ICurrencyService {
    private exchangeRates;
    private readonly supportedCurrencies;
    constructor();
    private initializeExchangeRates;
    convertCurrency(amount: number, fromCurrency: Currency, toCurrency: Currency, exchangeRateSource?: 'real-time' | 'daily-fix' | 'manual'): Promise<ICurrencyConversion>;
    private getExchangeRate;
    private fetchExchangeRate;
    private calculateConversionFees;
    updateMultiCurrencyBalance(profileId: number, currency: Currency, amount: number): Promise<void>;
    getBalanceInCurrency(profileId: number, currency: Currency): Promise<number>;
    getAllBalances(profileId: number): Promise<IMultiCurrencyBalance>;
    convertBalance(profileId: number, fromCurrency: Currency, toCurrency: Currency): Promise<ICurrencyConversion>;
    getSupportedCurrencies(): Currency[];
    getCurrentExchangeRates(): IExchangeRate[];
    updateExchangeRate(fromCurrency: Currency, toCurrency: Currency, rate: number, source?: 'manual'): void;
    getConversionStatistics(): {
        totalConversions: number;
        totalVolume: number;
        averageRate: number;
        mostConvertedFrom: Currency;
        mostConvertedTo: Currency;
    };
}
//# sourceMappingURL=CurrencyService.d.ts.map