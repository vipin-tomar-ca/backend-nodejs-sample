import { IBusinessRule, IBusinessRuleContext, IBusinessRuleResult, BusinessRuleType } from '../types/global-payroll';
export declare class BusinessRuleEngine {
    private rules;
    private ruleSets;
    registerRule(rule: IBusinessRule): void;
    registerRules(rules: IBusinessRule[]): void;
    executeRules(ruleSet: string, context: IBusinessRuleContext): Promise<IBusinessRuleResult[]>;
    private executeRule;
    private evaluateCondition;
    private executeAction;
    loadRulesFromSource(source: string): Promise<void>;
    private fetchRulesFromSource;
    getRulesBySet(ruleSet: string): IBusinessRule[];
    getActiveRules(): IBusinessRule[];
    updateRule(ruleId: string, updates: Partial<IBusinessRule>): void;
    deactivateRule(ruleId: string): void;
    activateRule(ruleId: string): void;
    private generateRuleKey;
    getRuleStatistics(): {
        totalRules: number;
        activeRules: number;
        ruleSets: number;
        rulesByType: Record<BusinessRuleType, number>;
    };
}
//# sourceMappingURL=BusinessRuleEngine.d.ts.map