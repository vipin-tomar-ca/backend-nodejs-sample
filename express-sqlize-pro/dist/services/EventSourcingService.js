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
exports.EventSourcingService = void 0;
const inversify_1 = require("inversify");
const models_1 = require("@/models");
const logger_1 = __importDefault(require("@/utils/logger"));
let EventSourcingService = class EventSourcingService {
    constructor() {
        this.eventStore = this.createEventStore();
    }
    createEventStore() {
        return {
            appendEvents: async (aggregateId, events) => {
                logger_1.default.info(`Appending ${events.length} events for aggregate ${aggregateId}`);
                for (const event of events) {
                    logger_1.default.debug(`Event: ${event.type} for ${event.aggregateId} at version ${event.version}`);
                }
            },
            getEvents: async (aggregateId, fromVersion = 0) => {
                logger_1.default.info(`Getting events for aggregate ${aggregateId} from version ${fromVersion}`);
                return [];
            },
            getEventsByType: async (type) => {
                logger_1.default.info(`Getting events of type ${type}`);
                return [];
            },
        };
    }
    async createPaymentEvents(jobId, clientId, contractorId, amount, correlationId) {
        const timestamp = new Date();
        const events = [];
        events.push({
            id: this.generateEventId(),
            type: 'PaymentInitiated',
            aggregateId: jobId.toString(),
            aggregateType: 'Job',
            data: {
                jobId,
                clientId,
                contractorId,
                amount,
            },
            metadata: {
                timestamp,
                userId: clientId.toString(),
                correlationId,
            },
            version: 1,
        });
        events.push({
            id: this.generateEventId(),
            type: 'BalanceDeducted',
            aggregateId: clientId.toString(),
            aggregateType: 'Profile',
            data: {
                profileId: clientId,
                amount: -amount,
                reason: 'Job payment',
                jobId,
            },
            metadata: {
                timestamp,
                userId: clientId.toString(),
                correlationId,
                causationId: events[0].id,
            },
            version: 1,
        });
        events.push({
            id: this.generateEventId(),
            type: 'BalanceAdded',
            aggregateId: contractorId.toString(),
            aggregateType: 'Profile',
            data: {
                profileId: contractorId,
                amount,
                reason: 'Job payment received',
                jobId,
            },
            metadata: {
                timestamp,
                userId: clientId.toString(),
                correlationId,
                causationId: events[0].id,
            },
            version: 1,
        });
        events.push({
            id: this.generateEventId(),
            type: 'JobPaid',
            aggregateId: jobId.toString(),
            aggregateType: 'Job',
            data: {
                jobId,
                paymentDate: timestamp,
                amount,
            },
            metadata: {
                timestamp,
                userId: clientId.toString(),
                correlationId,
                causationId: events[0].id,
            },
            version: 2,
        });
        return events;
    }
    async processPaymentWithEventSourcing(jobId, clientId, contractorId, amount) {
        const correlationId = this.generateCorrelationId();
        try {
            logger_1.default.info(`Processing payment with event sourcing. Correlation ID: ${correlationId}`);
            const validationResult = await this.validatePaymentOperation(jobId, clientId, contractorId, amount);
            if (!validationResult.valid) {
                throw new Error(validationResult.error);
            }
            const events = await this.createPaymentEvents(jobId, clientId, contractorId, amount, correlationId);
            await this.applyEvents(events);
            await this.eventStore.appendEvents(jobId.toString(), events);
            logger_1.default.info(`Payment processed successfully with event sourcing. Correlation ID: ${correlationId}`);
            return { success: true, events };
        }
        catch (error) {
            logger_1.default.error(`Payment processing failed with event sourcing. Correlation ID: ${correlationId}`, error);
            await this.createCompensationEvents(jobId, clientId, contractorId, amount, correlationId);
            return { success: false, events: [] };
        }
    }
    async applyEvents(events) {
        for (const event of events) {
            try {
                switch (event.type) {
                    case 'PaymentInitiated':
                        await this.applyPaymentInitiated(event);
                        break;
                    case 'BalanceDeducted':
                        await this.applyBalanceDeducted(event);
                        break;
                    case 'BalanceAdded':
                        await this.applyBalanceAdded(event);
                        break;
                    case 'JobPaid':
                        await this.applyJobPaid(event);
                        break;
                    default:
                        logger_1.default.warn(`Unknown event type: ${event.type}`);
                }
            }
            catch (error) {
                logger_1.default.error(`Error applying event ${event.type}:`, error);
                throw error;
            }
        }
    }
    async applyPaymentInitiated(event) {
        const { jobId } = event.data;
        await models_1.Job.update({
            paymentStatus: 'initiated',
            paymentInitiatedAt: event.metadata.timestamp,
        }, { where: { id: jobId } });
    }
    async applyBalanceDeducted(event) {
        const { profileId, amount } = event.data;
        await models_1.Profile.increment('balance', { by: amount, where: { id: profileId } });
    }
    async applyBalanceAdded(event) {
        const { profileId, amount } = event.data;
        await models_1.Profile.increment('balance', { by: amount, where: { id: profileId } });
    }
    async applyJobPaid(event) {
        const { jobId, paymentDate } = event.data;
        await models_1.Job.update({
            paid: true,
            paymentDate,
            paymentStatus: 'completed',
        }, { where: { id: jobId } });
    }
    async validatePaymentOperation(jobId, clientId, contractorId, amount) {
        try {
            const job = await models_1.Job.findOne({
                where: { id: jobId, paid: false },
                include: [{
                        model: models_1.Contract,
                        where: {
                            status: 'in_progress',
                            ClientId: clientId,
                        },
                    }],
            });
            if (!job) {
                return { valid: false, error: 'Job not found or not payable' };
            }
            const client = await models_1.Profile.findByPk(clientId);
            if (!client || parseFloat(client.balance.toString()) < amount) {
                return { valid: false, error: 'Insufficient balance' };
            }
            const contractor = await models_1.Profile.findByPk(contractorId);
            if (!contractor) {
                return { valid: false, error: 'Contractor not found' };
            }
            return { valid: true };
        }
        catch (error) {
            logger_1.default.error('Error validating payment operation:', error);
            return { valid: false, error: 'Validation failed' };
        }
    }
    async createCompensationEvents(jobId, clientId, contractorId, amount, correlationId) {
        logger_1.default.info(`Creating compensation events for failed payment. Correlation ID: ${correlationId}`);
        const compensationEvents = [
            {
                id: this.generateEventId(),
                type: 'PaymentCompensated',
                aggregateId: jobId.toString(),
                aggregateType: 'Job',
                data: {
                    jobId,
                    reason: 'Payment processing failed',
                },
                metadata: {
                    timestamp: new Date(),
                    userId: clientId.toString(),
                    correlationId,
                },
                version: 1,
            },
        ];
        await this.eventStore.appendEvents(jobId.toString(), compensationEvents);
    }
    async rebuildAggregate(aggregateId, aggregateType) {
        try {
            const events = await this.eventStore.getEvents(aggregateId);
            logger_1.default.info(`Rebuilding aggregate ${aggregateId} from ${events.length} events`);
            return {
                aggregateId,
                aggregateType,
                events,
                lastEventVersion: events.length > 0 ? events[events.length - 1].version : 0,
            };
        }
        catch (error) {
            logger_1.default.error(`Error rebuilding aggregate ${aggregateId}:`, error);
            throw error;
        }
    }
    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateCorrelationId() {
        return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async getEventsByCorrelationId(correlationId) {
        logger_1.default.info(`Getting events for correlation ID: ${correlationId}`);
        return [];
    }
    async getPaymentHistory(jobId) {
        return await this.eventStore.getEvents(jobId.toString());
    }
};
exports.EventSourcingService = EventSourcingService;
exports.EventSourcingService = EventSourcingService = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], EventSourcingService);
//# sourceMappingURL=EventSourcingService.js.map