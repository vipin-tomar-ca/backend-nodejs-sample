import { IBusinessRule, IBusinessRuleContext, IBusinessRuleResult, BusinessRuleType } from '../types';
export declare class BusinessRuleEngine {
    private rules;
    constructor();
    registerRule(rule: IBusinessRule): void;
    registerRules(rules: IBusinessRule[]): void;
    executeRules(ruleSet: string, context: IBusinessRuleContext): Promise<IBusinessRuleResult[]>;
    getRulesBySet(ruleSet: string): IBusinessRule[];
    getActiveRules(): IBusinessRule[];
    getRuleStatistics(): {
        totalRules: number;
        activeRules: number;
        ruleSets: number;
        rulesByType: Record<BusinessRuleType, number>;
    };
    private evaluateCondition;
    private executeAction;
    private initializeDefaultRules;
}
//# sourceMappingURL=BusinessRuleEngine.d.ts.map