import { injectable } from '../container/ioc';
import {
  Jurisdiction,
  EmployeeType,
  Currency,
  IBusinessRule,
  IBusinessRuleContext,
  IBusinessRuleResult,
  BusinessRuleType,
  BusinessRuleSeverity
} from '../types/global-payroll';
import logger from '../utils/logger';

@injectable()
export class BusinessRuleEngine {
  private rules: Map<string, IBusinessRule> = new Map();
  private ruleSets: Map<string, string[]> = new Map();

  /**
   * Register a business rule
   */
  public registerRule(rule: IBusinessRule): void {
    const ruleKey = this.generateRuleKey(rule);
    this.rules.set(ruleKey, rule);

    // Add to rule set
    if (!this.ruleSets.has(rule.ruleSet)) {
      this.ruleSets.set(rule.ruleSet, []);
    }
    this.ruleSets.get(rule.ruleSet)!.push(ruleKey);

    logger.info(`Registered business rule: ${rule.name} in rule set: ${rule.ruleSet}`);
  }

  /**
   * Register multiple business rules
   */
  public registerRules(rules: IBusinessRule[]): void {
    rules.forEach(rule => this.registerRule(rule));
  }

  /**
   * Execute business rules for a specific context
   */
  public async executeRules(
    ruleSet: string,
    context: IBusinessRuleContext,
  ): Promise<IBusinessRuleResult[]> {
    const ruleKeys = this.ruleSets.get(ruleSet) || [];
    const results: IBusinessRuleResult[] = [];

    logger.info(`Executing ${ruleKeys.length} rules for rule set: ${ruleSet}`);

    for (const ruleKey of ruleKeys) {
      const rule = this.rules.get(ruleKey);
      if (!rule) continue;

      try {
        const result = await this.executeRule(rule, context);
        results.push(result);
      } catch (error) {
        logger.error(`Error executing rule ${rule.name}:`, error);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          passed: false,
          severity: BusinessRuleSeverity.ERROR,
          message: `Rule execution failed: ${(error as Error).message}`,
          context: context,
          timestamp: new Date(),
        });
      }
    }

    return results;
  }

  /**
   * Execute a single business rule
   */
  private async executeRule(
    rule: IBusinessRule,
    context: IBusinessRuleContext,
  ): Promise<IBusinessRuleResult> {
    const startTime = Date.now();

    try {
      // Execute the rule condition
      const conditionResult = await this.evaluateCondition(rule.condition, context);

      // Execute the action if condition is true
      let actionResult = null;
      if (conditionResult) {
        actionResult = await this.executeAction(rule.action, context);
      }

      const executionTime = Date.now() - startTime;

      return {
        ruleId: rule.id,
        ruleName: rule.name,
        passed: conditionResult,
        severity: rule.severity,
        message: conditionResult ? rule.successMessage : rule.failureMessage,
        context: context,
        actionResult,
        executionTime,
        timestamp: new Date(),
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;

      return {
        ruleId: rule.id,
        ruleName: rule.name,
        passed: false,
        severity: BusinessRuleSeverity.ERROR,
        message: `Rule execution error: ${(error as Error).message}`,
        context: context,
        executionTime,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Evaluate rule condition
   */
  private async evaluateCondition(
    condition: string,
    context: IBusinessRuleContext,
  ): Promise<boolean> {
    try {
      // Create a safe evaluation context
      const evalContext = {
        ...context,
        // Add helper functions
        isJurisdiction: (jurisdiction: Jurisdiction) => context.jurisdiction === jurisdiction,
        isEmployeeType: (type: EmployeeType) => context.employeeType === type,
        isCurrency: (currency: Currency) => context.currency === currency,
        amountBetween: (min: number, max: number) => context.amount >= min && context.amount <= max,
        hasDocument: (documentType: string) => context.documents?.includes(documentType) || false,
        isCompliant: () => context.complianceStatus === 'compliant',
        // Add date helpers
        isCurrentYear: (year: number) => new Date().getFullYear() === year,
        isWithinDays: (days: number) => {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);
          return context.paymentDate >= cutoffDate;
        },
      };

      // Use Function constructor for safe evaluation (in production, use a proper rule engine)
      const conditionFunction = new Function('context', `return ${condition}`);
      return conditionFunction(evalContext);

    } catch (error) {
      logger.error(`Error evaluating condition: ${condition}`, error);
      throw new Error(`Condition evaluation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Execute rule action
   */
  private async executeAction(
    action: string,
    context: IBusinessRuleContext,
  ): Promise<any> {
    try {
      // Create a safe action context
      const actionContext = {
        ...context,
        // Add action helpers
        setComplianceStatus: (status: string) => {
          context.complianceStatus = status as any;
        },
        addWarning: (message: string) => {
          if (!context.warnings) context.warnings = [];
          context.warnings.push(message);
        },
        addError: (message: string) => {
          if (!context.errors) context.errors = [];
          context.errors.push(message);
        },
        setTaxRate: (rate: number) => {
          context.taxRate = rate;
        },
        setExchangeRate: (rate: number) => {
          context.exchangeRate = rate;
        },
        requireDocument: (documentType: string) => {
          if (!context.requiredDocuments) context.requiredDocuments = [];
          if (!context.requiredDocuments.includes(documentType)) {
            context.requiredDocuments.push(documentType);
          }
        },
      };

      // Use Function constructor for safe execution (in production, use a proper rule engine)
      const actionFunction = new Function('context', action);
      return actionFunction(actionContext);

    } catch (error) {
      logger.error(`Error executing action: ${action}`, error);
      throw new Error(`Action execution failed: ${(error as Error).message}`);
    }
  }

  /**
   * Load business rules from external source (database, file, API)
   */
  public async loadRulesFromSource(source: string): Promise<void> {
    try {
      logger.info(`Loading business rules from source: ${source}`);

      // In a real implementation, this would load from:
      // - Database table
      // - JSON/YAML files
      // - External API
      // - Rule management system

      const rules = await this.fetchRulesFromSource(source);
      this.registerRules(rules);

      logger.info(`Loaded ${rules.length} business rules from ${source}`);
    } catch (error) {
      logger.error(`Error loading rules from source ${source}:`, error);
      throw error;
    }
  }

  /**
   * Fetch rules from external source
   */
  private async fetchRulesFromSource(source: string): Promise<IBusinessRule[]> {
    // Mock implementation - in production, this would fetch from actual source
    const mockRules: IBusinessRule[] = [
      // US Compliance Rules
      {
        id: 'US_001',
        name: 'US Contractor Payment Limit',
        ruleSet: 'US_COMPLIANCE',
        type: BusinessRuleType.COMPLIANCE,
        severity: BusinessRuleSeverity.ERROR,
        condition: 'context.isJurisdiction("US") && context.isEmployeeType("contractor") && context.amount > 100000',
        action: 'context.addError("US contractor payments cannot exceed $100,000"); context.setComplianceStatus("non-compliant");',
        successMessage: 'US contractor payment limit check passed',
        failureMessage: 'US contractor payment exceeds limit',
        jurisdiction: 'US',
        employeeType: 'contractor',
        version: '1.0',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'US_002',
        name: 'US W9 Document Required',
        ruleSet: 'US_COMPLIANCE',
        type: BusinessRuleType.DOCUMENTATION,
        severity: BusinessRuleSeverity.ERROR,
        condition: 'context.isJurisdiction("US") && context.isEmployeeType("contractor") && !context.hasDocument("w9")',
        action: 'context.requireDocument("w9"); context.addError("W9 form is required for US contractors");',
        successMessage: 'W9 document requirement satisfied',
        failureMessage: 'W9 document is required for US contractors',
        jurisdiction: 'US',
        employeeType: 'contractor',
        version: '1.0',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // UK Compliance Rules
      {
        id: 'UK_001',
        name: 'UK Contractor Payment Limit',
        ruleSet: 'UK_COMPLIANCE',
        type: BusinessRuleType.COMPLIANCE,
        severity: BusinessRuleSeverity.ERROR,
        condition: 'context.isJurisdiction("UK") && context.isEmployeeType("contractor") && context.amount > 50000',
        action: 'context.addError("UK contractor payments cannot exceed £50,000"); context.setComplianceStatus("non-compliant");',
        successMessage: 'UK contractor payment limit check passed',
        failureMessage: 'UK contractor payment exceeds limit',
        jurisdiction: 'UK',
        employeeType: 'contractor',
        version: '1.0',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Currency Rules
      {
        id: 'CURRENCY_001',
        name: 'High Value Currency Conversion',
        ruleSet: 'CURRENCY_COMPLIANCE',
        type: BusinessRuleType.CURRENCY,
        severity: BusinessRuleSeverity.WARNING,
        condition: 'context.amount > 10000 && context.sourceCurrency !== context.targetCurrency',
        action: 'context.addWarning("High value currency conversion requires additional verification");',
        successMessage: 'Currency conversion check passed',
        failureMessage: 'High value currency conversion requires verification',
        version: '1.0',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Tax Rules
      {
        id: 'TAX_001',
        name: 'US Federal Tax Rate',
        ruleSet: 'TAX_CALCULATION',
        type: BusinessRuleType.TAX,
        severity: BusinessRuleSeverity.INFO,
        condition: 'context.isJurisdiction("US") && context.amount > 0',
        action: 'context.setTaxRate(0.22);',
        successMessage: 'US federal tax rate applied',
        failureMessage: 'Failed to apply US federal tax rate',
        jurisdiction: 'US',
        version: '1.0',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return mockRules;
  }

  /**
   * Get all rules for a specific rule set
   */
  public getRulesBySet(ruleSet: string): IBusinessRule[] {
    const ruleKeys = this.ruleSets.get(ruleSet) || [];
    return ruleKeys.map(key => this.rules.get(key)!).filter(Boolean);
  }

  /**
   * Get all active rules
   */
  public getActiveRules(): IBusinessRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.active);
  }

  /**
   * Update a business rule
   */
  public updateRule(ruleId: string, updates: Partial<IBusinessRule>): void {
    const ruleKey = Array.from(this.rules.keys()).find(key => key.includes(ruleId));
    if (!ruleKey) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    const existingRule = this.rules.get(ruleKey)!;
    const updatedRule = { ...existingRule, ...updates, updatedAt: new Date() };

    this.rules.set(ruleKey, updatedRule);
    logger.info(`Updated business rule: ${ruleId}`);
  }

  /**
   * Deactivate a business rule
   */
  public deactivateRule(ruleId: string): void {
    this.updateRule(ruleId, { active: false });
  }

  /**
   * Activate a business rule
   */
  public activateRule(ruleId: string): void {
    this.updateRule(ruleId, { active: true });
  }

  /**
   * Generate unique rule key
   */
  private generateRuleKey(rule: IBusinessRule): string {
    return `${rule.ruleSet}_${rule.id}_${rule.version}`;
  }

  /**
   * Get rule execution statistics
   */
  public getRuleStatistics(): {
    totalRules: number;
    activeRules: number;
    ruleSets: number;
    rulesByType: Record<BusinessRuleType, number>;
  } {
    const activeRules = this.getActiveRules();
    const rulesByType: Record<BusinessRuleType, number> = {
      [BusinessRuleType.COMPLIANCE]: 0,
      [BusinessRuleType.TAX]: 0,
      [BusinessRuleType.CURRENCY]: 0,
      [BusinessRuleType.DOCUMENTATION]: 0,
      [BusinessRuleType.BUSINESS]: 0,
    };

    activeRules.forEach(rule => {
      rulesByType[rule.type]++;
    });

    return {
      totalRules: this.rules.size,
      activeRules: activeRules.length,
      ruleSets: this.ruleSets.size,
      rulesByType,
    };
  }
}
