import { Currency, ICurrencyConversion, IExchangeRate, IMultiCurrencyBalance, ICurrencyService } from '@/types/global-payroll';
export declare class CurrencyService implements ICurrencyService {
    private exchangeRates;
    private readonly DEFAULT_FEES;
    convertCurrency(amount: number, fromCurrency: Currency, toCurrency: Currency, exchangeRateSource?: 'real-time' | 'daily-fix' | 'manual'): Promise<ICurrencyConversion>;
    getExchangeRate(fromCurrency: Currency, toCurrency: Currency, source?: 'real-time' | 'daily-fix' | 'manual'): Promise<IExchangeRate>;
    updateMultiCurrencyBalance(profileId: number, currency: Currency, amount: number): Promise<void>;
    getBalanceInCurrency(profileId: number, currency: Currency): Promise<number>;
    getAllBalances(profileId: number): Promise<IMultiCurrencyBalance>;
    convertBalance(profileId: number, fromCurrency: Currency, toCurrency: Currency): Promise<{
        originalBalance: number;
        convertedBalance: number;
        exchangeRate: number;
    }>;
    private fetchExchangeRate;
    private fetchRealTimeRate;
    private fetchDailyFixRate;
    private getManualRate;
    private calculateExchangeFees;
    clearExpiredRates(): void;
    getCacheStats(): {
        totalRates: number;
        activeRates: number;
        expiredRates: number;
    };
    private generateCorrelationId;
}
//# sourceMappingURL=CurrencyService.d.ts.map