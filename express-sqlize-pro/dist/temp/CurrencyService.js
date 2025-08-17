"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyService = void 0;
const inversify_1 = require("inversify");
const models_1 = require("@/models");
const global_payroll_1 = require("@/types/global-payroll");
const logger_1 = __importDefault(require("@/utils/logger"));
let CurrencyService = class CurrencyService {
    constructor() {
        this.exchangeRates = new Map();
        this.DEFAULT_FEES = 0.025;
    }
    async convertCurrency(amount, fromCurrency, toCurrency, exchangeRateSource = 'real-time') {
        try {
            if (fromCurrency === toCurrency) {
                return {
                    originalAmount: amount,
                    originalCurrency: fromCurrency,
                    convertedAmount: amount,
                    targetCurrency: toCurrency,
                    exchangeRate: 1,
                    exchangeRateSource: 'manual',
                    exchangeRateTimestamp: new Date(),
                    fees: 0,
                    netAmount: amount,
                    correlationId: this.generateCorrelationId(),
                };
            }
            const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency, exchangeRateSource);
            const convertedAmount = amount * exchangeRate.rate;
            const fees = this.calculateExchangeFees(amount, fromCurrency, toCurrency);
            const netAmount = convertedAmount - fees;
            const conversion = {
                originalAmount: amount,
                originalCurrency: fromCurrency,
                convertedAmount,
                targetCurrency: toCurrency,
                exchangeRate: exchangeRate.rate,
                exchangeRateSource: exchangeRate.source,
                exchangeRateTimestamp: exchangeRate.timestamp,
                fees,
                netAmount,
                correlationId: this.generateCorrelationId(),
            };
            logger_1.default.info(`Currency conversion: ${amount} ${fromCurrency} = ${netAmount} ${toCurrency} (rate: ${exchangeRate.rate})`);
            return conversion;
        }
        catch (error) {
            logger_1.default.error(`Error converting currency from ${fromCurrency} to ${toCurrency}:`, error);
            throw new global_payroll_1.CurrencyConversionError(`Failed to convert ${amount} ${fromCurrency} to ${toCurrency}`, fromCurrency, toCurrency);
        }
    }
    async getExchangeRate(fromCurrency, toCurrency, source = 'real-time') {
        const rateKey = `${fromCurrency}-${toCurrency}`;
        const cachedRate = this.exchangeRates.get(rateKey);
        if (cachedRate && cachedRate.isActive && cachedRate.validUntil > new Date()) {
            return cachedRate;
        }
        const exchangeRate = await this.fetchExchangeRate(fromCurrency, toCurrency, source);
        this.exchangeRates.set(rateKey, exchangeRate);
        return exchangeRate;
    }
    async updateMultiCurrencyBalance(profileId, currency, amount) {
        try {
            const profile = await models_1.Profile.findByPk(profileId);
            if (!profile) {
                throw new Error(`Profile ${profileId} not found`);
            }
            const balances = profile.balances ? JSON.parse(profile.balances) : {};
            const currentBalance = balances[currency] || 0;
            const newBalance = currentBalance + amount;
            if (newBalance < 0) {
                throw new Error(`Insufficient balance in ${currency}`);
            }
            balances[currency] = newBalance;
            await models_1.Profile.update({
                balances: JSON.stringify(balances),
                version: profile.version + 1,
                updatedAt: new Date(),
            }, {
                where: {
                    id: profileId,
                    version: profile.version,
                },
            });
            logger_1.default.info(`Updated ${currency} balance for profile ${profileId}: ${currentBalance} -> ${newBalance}`);
        }
        catch (error) {
            logger_1.default.error(`Error updating ${currency} balance for profile ${profileId}:`, error);
            throw error;
        }
    }
    async getBalanceInCurrency(profileId, currency) {
        try {
            const profile = await models_1.Profile.findByPk(profileId);
            if (!profile) {
                throw new Error(`Profile ${profileId} not found`);
            }
            const balances = profile.balances ? JSON.parse(profile.balances) : {};
            return balances[currency] || 0;
        }
        catch (error) {
            logger_1.default.error(`Error getting ${currency} balance for profile ${profileId}:`, error);
            throw error;
        }
    }
    async getAllBalances(profileId) {
        try {
            const profile = await models_1.Profile.findByPk(profileId);
            if (!profile) {
                throw new Error(`Profile ${profileId} not found`);
            }
            return profile.balances ? JSON.parse(profile.balances) : {};
        }
        catch (error) {
            logger_1.default.error(`Error getting all balances for profile ${profileId}:`, error);
            throw error;
        }
    }
    async convertBalance(profileId, fromCurrency, toCurrency) {
        try {
            const originalBalance = await this.getBalanceInCurrency(profileId, fromCurrency);
            const conversion = await this.convertCurrency(originalBalance, fromCurrency, toCurrency);
            return {
                originalBalance,
                convertedBalance: conversion.netAmount,
                exchangeRate: conversion.exchangeRate,
            };
        }
        catch (error) {
            logger_1.default.error(`Error converting balance for profile ${profileId}:`, error);
            throw error;
        }
    }
    async fetchExchangeRate(fromCurrency, toCurrency, source) {
        try {
            let rate;
            let rateSource;
            switch (source) {
                case 'real-time':
                    rate = await this.fetchRealTimeRate(fromCurrency, toCurrency);
                    rateSource = 'real-time';
                    break;
                case 'daily-fix':
                    rate = await this.fetchDailyFixRate(fromCurrency, toCurrency);
                    rateSource = 'daily-fix';
                    break;
                case 'manual':
                    rate = this.getManualRate(fromCurrency, toCurrency);
                    rateSource = 'manual';
                    break;
                default:
                    throw new Error(`Unsupported exchange rate source: ${source}`);
            }
            const now = new Date();
            const validUntil = new Date(now.getTime() + (source === 'real-time' ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000));
            return {
                fromCurrency,
                toCurrency,
                rate,
                source: rateSource,
                timestamp: now,
                validUntil,
                isActive: true,
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching exchange rate for ${fromCurrency}-${toCurrency}:`, error);
            throw error;
        }
    }
    async fetchRealTimeRate(fromCurrency, toCurrency) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const mockRates = {
            'USD-EUR': 0.85,
            'EUR-USD': 1.18,
            'USD-GBP': 0.73,
            'GBP-USD': 1.37,
            'USD-CAD': 1.25,
            'CAD-USD': 0.80,
            'USD-AUD': 1.35,
            'AUD-USD': 0.74,
            'USD-INR': 75.0,
            'INR-USD': 0.013,
            'USD-BRL': 5.2,
            'BRL-USD': 0.19,
            'USD-MXN': 20.5,
            'MXN-USD': 0.049,
        };
        const rateKey = `${fromCurrency}-${toCurrency}`;
        const rate = mockRates[rateKey];
        if (!rate) {
            return 1.0;
        }
        const variation = (Math.random() - 0.5) * 0.02;
        return rate * (1 + variation);
    }
    async fetchDailyFixRate(fromCurrency, toCurrency) {
        await new Promise(resolve => setTimeout(resolve, 50));
        const mockRates = {
            'USD-EUR': 0.85,
            'EUR-USD': 1.18,
            'USD-GBP': 0.73,
            'GBP-USD': 1.37,
            'USD-CAD': 1.25,
            'CAD-USD': 0.80,
            'USD-AUD': 1.35,
            'AUD-USD': 0.74,
            'USD-INR': 75.0,
            'INR-USD': 0.013,
            'USD-BRL': 5.2,
            'BRL-USD': 0.19,
            'USD-MXN': 20.5,
            'MXN-USD': 0.049,
        };
        const rateKey = `${fromCurrency}-${toCurrency}`;
        return mockRates[rateKey] || 1.0;
    }
    getManualRate(fromCurrency, toCurrency) {
        const manualRates = {
            'USD-EUR': 0.85,
            'EUR-USD': 1.18,
            'USD-GBP': 0.73,
            'GBP-USD': 1.37,
        };
        const rateKey = `${fromCurrency}-${toCurrency}`;
        return manualRates[rateKey] || 1.0;
    }
    calculateExchangeFees(amount, fromCurrency, toCurrency) {
        const feeRates = {
            'USD-EUR': 0.025,
            'EUR-USD': 0.025,
            'USD-GBP': 0.03,
            'GBP-USD': 0.03,
            'USD-INR': 0.02,
            'INR-USD': 0.02,
            'USD-BRL': 0.035,
            'BRL-USD': 0.035,
        };
        const feeKey = `${fromCurrency}-${toCurrency}`;
        const feeRate = feeRates[feeKey] || this.DEFAULT_FEES;
        return amount * feeRate;
    }
    clearExpiredRates() {
        const now = new Date();
        for (const [key, rate] of this.exchangeRates.entries()) {
            if (rate.validUntil <= now) {
                this.exchangeRates.delete(key);
            }
        }
    }
    getCacheStats() {
        const now = new Date();
        let activeRates = 0;
        let expiredRates = 0;
        for (const rate of this.exchangeRates.values()) {
            if (rate.validUntil > now) {
                activeRates++;
            }
            else {
                expiredRates++;
            }
        }
        return {
            totalRates: this.exchangeRates.size,
            activeRates,
            expiredRates,
        };
    }
    generateCorrelationId() {
        return `curr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.CurrencyService = CurrencyService;
exports.CurrencyService = CurrencyService = __decorate([
    (0, inversify_1.injectable)()
], CurrencyService);
//# sourceMappingURL=CurrencyService.js.map