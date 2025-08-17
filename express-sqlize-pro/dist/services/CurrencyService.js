"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyService = void 0;
const ioc_1 = require("../container/ioc");
const models_1 = require("../models");
const global_payroll_1 = require("../types/global-payroll");
const logger_1 = __importDefault(require("../utils/logger"));
let CurrencyService = class CurrencyService {
    constructor() {
        this.exchangeRates = new Map();
        this.supportedCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'CHF'];
        this.initializeExchangeRates();
    }
    initializeExchangeRates() {
        const defaultRates = {
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
            const [from, to] = pair.split('_');
            this.exchangeRates.set(pair, {
                fromCurrency: from,
                toCurrency: to,
                rate,
                source: 'daily-fix',
                timestamp: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });
        });
        logger_1.default.info(`Initialized ${this.exchangeRates.size} exchange rates`);
    }
    async convertCurrency(amount, fromCurrency, toCurrency, exchangeRateSource = 'daily-fix') {
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
            const conversion = {
                fromCurrency,
                toCurrency,
                originalAmount: amount,
                convertedAmount,
                exchangeRate: exchangeRate.rate,
                fees,
                totalAmount,
                timestamp: new Date(),
            };
            logger_1.default.info(`Currency conversion: ${amount} ${fromCurrency} = ${totalAmount} ${toCurrency} (rate: ${exchangeRate.rate})`);
            return conversion;
        }
        catch (error) {
            logger_1.default.error(`Currency conversion failed: ${fromCurrency} to ${toCurrency}`, error);
            throw new global_payroll_1.CurrencyConversionError(`Failed to convert ${amount} ${fromCurrency} to ${toCurrency}`, fromCurrency, toCurrency);
        }
    }
    async getExchangeRate(fromCurrency, toCurrency, source) {
        const pair = `${fromCurrency}_${toCurrency}`;
        let exchangeRate = this.exchangeRates.get(pair);
        if (!exchangeRate || exchangeRate.expiresAt < new Date()) {
            exchangeRate = await this.fetchExchangeRate(fromCurrency, toCurrency, source);
            this.exchangeRates.set(pair, exchangeRate);
        }
        return exchangeRate;
    }
    async fetchExchangeRate(fromCurrency, toCurrency, source) {
        const mockRates = {
            'USD_EUR': 0.85 + (Math.random() - 0.5) * 0.02,
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
            expiresAt: new Date(Date.now() + (source === 'real-time' ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000)),
        };
    }
    calculateConversionFees(amount, fromCurrency, toCurrency) {
        const baseFee = 2.50;
        const percentageFee = 0.01;
        let baseFeeInSourceCurrency = baseFee;
        if (fromCurrency !== 'USD') {
            const usdToSourceRate = this.exchangeRates.get(`USD_${fromCurrency}`)?.rate || 1;
            baseFeeInSourceCurrency = baseFee * usdToSourceRate;
        }
        const percentageAmount = amount * percentageFee;
        return Math.max(baseFeeInSourceCurrency, percentageAmount);
    }
    async updateMultiCurrencyBalance(profileId, currency, amount) {
        try {
            const profile = await models_1.Profile.findByPk(profileId);
            if (!profile) {
                throw new Error(`Profile ${profileId} not found`);
            }
            let balances = {};
            if (profile.balances) {
                try {
                    balances = JSON.parse(profile.balances);
                }
                catch (error) {
                    logger_1.default.warn(`Invalid balances JSON for profile ${profileId}, resetting`);
                    balances = {};
                }
            }
            balances[currency] = (balances[currency] || 0) + amount;
            if (balances[currency] < 0) {
                balances[currency] = 0;
                logger_1.default.warn(`Balance for ${currency} would be negative, setting to 0`);
            }
            profile.balances = JSON.stringify(balances);
            profile.version += 1;
            await profile.save();
            logger_1.default.info(`Updated ${currency} balance for profile ${profileId}: ${amount} (new balance: ${balances[currency]})`);
        }
        catch (error) {
            logger_1.default.error(`Failed to update multi-currency balance for profile ${profileId}`, error);
            throw error;
        }
    }
    async getBalanceInCurrency(profileId, currency) {
        try {
            const profile = await models_1.Profile.findByPk(profileId);
            if (!profile) {
                throw new Error(`Profile ${profileId} not found`);
            }
            if (!profile.balances) {
                return 0;
            }
            const balances = JSON.parse(profile.balances);
            return balances[currency] || 0;
        }
        catch (error) {
            logger_1.default.error(`Failed to get ${currency} balance for profile ${profileId}`, error);
            return 0;
        }
    }
    async getAllBalances(profileId) {
        try {
            const profile = await models_1.Profile.findByPk(profileId);
            if (!profile) {
                throw new Error(`Profile ${profileId} not found`);
            }
            if (!profile.balances) {
                return {};
            }
            return JSON.parse(profile.balances);
        }
        catch (error) {
            logger_1.default.error(`Failed to get all balances for profile ${profileId}`, error);
            return {};
        }
    }
    async convertBalance(profileId, fromCurrency, toCurrency) {
        const balance = await this.getBalanceInCurrency(profileId, fromCurrency);
        return this.convertCurrency(balance, fromCurrency, toCurrency);
    }
    getSupportedCurrencies() {
        return [...this.supportedCurrencies];
    }
    getCurrentExchangeRates() {
        return Array.from(this.exchangeRates.values()).filter(rate => rate.expiresAt > new Date());
    }
    updateExchangeRate(fromCurrency, toCurrency, rate, source = 'manual') {
        const pair = `${fromCurrency}_${toCurrency}`;
        const exchangeRate = {
            fromCurrency,
            toCurrency,
            rate,
            source,
            timestamp: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
        this.exchangeRates.set(pair, exchangeRate);
        logger_1.default.info(`Updated exchange rate: ${fromCurrency}_${toCurrency} = ${rate} (${source})`);
    }
    getConversionStatistics() {
        return {
            totalConversions: 150,
            totalVolume: 500000,
            averageRate: 1.15,
            mostConvertedFrom: 'USD',
            mostConvertedTo: 'EUR',
        };
    }
};
exports.CurrencyService = CurrencyService;
exports.CurrencyService = CurrencyService = __decorate([
    (0, ioc_1.injectable)(),
    __metadata("design:paramtypes", [])
], CurrencyService);
//# sourceMappingURL=CurrencyService.js.map