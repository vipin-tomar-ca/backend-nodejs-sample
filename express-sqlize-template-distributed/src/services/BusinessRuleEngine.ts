import { injectable } from '../container/ioc';
import { IBusinessRule, IBusinessRuleContext, IBusinessRuleResult, BusinessRuleType, BusinessRuleSeverity } from '../types';

@injectable()
export class BusinessRuleEngine {
  private rules: Map<string, IBusinessRule[]> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Register a business rule
   */
  public registerRule(rule: IBusinessRule): void {
    const ruleSet = rule.type;
    if (!this.rules.has(ruleSet)) {
      this.rules.set(ruleSet, []);
    }
    this.rules.get(ruleSet)!.push(rule);
  }

  /**
   * Register multiple business rules
   */
  public registerRules(rules: IBusinessRule[]): void {
    rules.forEach(rule => this.registerRule(rule));
  }

  /**
   * Execute business rules for a specific rule set
   */
  public async executeRules(ruleSet: string, context: IBusinessRuleContext): Promise<IBusinessRuleResult[]> {
    const rules = this.rules.get(ruleSet) || [];
    const results: IBusinessRuleResult[] = [];

    for (const rule of rules) {
      if (!rule.active) continue;

      try {
        const startTime = Date.now();
        
        // Evaluate the condition
        const conditionResult = this.evaluateCondition(rule.condition, context);
        
        // Execute the action if condition is true
        let actionResult = null;
        if (conditionResult) {
          actionResult = this.executeAction(rule.action, context);
        }

        const executionTime = Date.now() - startTime;

        results.push({
          ruleId: rule.id,
          passed: conditionResult,
          severity: rule.severity,
          message: conditionResult ? rule.message : `Rule failed: ${rule.message}`,
          context,
          timestamp: new Date(),
        });

      } catch (error) {
        results.push({
          ruleId: rule.id,
          passed: false,
          severity: BusinessRuleSeverity.ERROR,
          message: `Rule execution error: ${error.message}`,
          context,
          timestamp: new Date(),
        });
      }
    }

    return results;
  }

  /**
   * Get all rules for a specific rule set
   */
  public getRulesBySet(ruleSet: string): IBusinessRule[] {
    return this.rules.get(ruleSet) || [];
  }

  /**
   * Get all active rules
   */
  public getActiveRules(): IBusinessRule[] {
    const allRules: IBusinessRule[] = [];
    this.rules.forEach(rules => {
      allRules.push(...rules.filter(rule => rule.active));
    });
    return allRules;
  }

  /**
   * Get rule statistics
   */
  public getRuleStatistics(): {
    totalRules: number;
    activeRules: number;
    ruleSets: number;
    rulesByType: Record<BusinessRuleType, number>;
  } {
    const rulesByType: Record<BusinessRuleType, number> = {
      [BusinessRuleType.VALIDATION]: 0,
      [BusinessRuleType.BUSINESS]: 0,
      [BusinessRuleType.COMPLIANCE]: 0,
      [BusinessRuleType.SECURITY]: 0,
    };

    let totalRules = 0;
    let activeRules = 0;

    this.rules.forEach(rules => {
      rules.forEach(rule => {
        totalRules++;
        if (rule.active) {
          activeRules++;
          rulesByType[rule.type]++;
        }
      });
    });

    return {
      totalRules,
      activeRules,
      ruleSets: this.rules.size,
      rulesByType,
    };
  }

  /**
   * Evaluate a condition expression
   */
  private evaluateCondition(condition: string, context: IBusinessRuleContext): boolean {
    try {
      // Create a safe evaluation context
      const safeContext = {
        ...context,
        // Add utility functions
        isEmpty: (value: any) => !value || (typeof value === 'string' && value.trim() === ''),
        isNotEmpty: (value: any) => value && (typeof value !== 'string' || value.trim() !== ''),
        isEmail: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        isNumber: (value: any) => typeof value === 'number' && !isNaN(value),
        isString: (value: any) => typeof value === 'string',
        length: (value: any) => value ? value.length : 0,
        includes: (array: any[], item: any) => Array.isArray(array) && array.includes(item),
        startsWith: (str: string, prefix: string) => typeof str === 'string' && str.startsWith(prefix),
        endsWith: (str: string, suffix: string) => typeof str === 'string' && str.endsWith(suffix),
      };

      // Create a function from the condition string
      const conditionFunction = new Function(...Object.keys(safeContext), `return ${condition}`);
      
      // Execute the condition
      return conditionFunction(...Object.values(safeContext));
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  /**
   * Execute an action expression
   */
  private executeAction(action: string, context: IBusinessRuleContext): any {
    try {
      // Create a safe action context
      const safeContext = {
        ...context,
        // Add utility functions for actions
        log: (message: string) => console.log(`[BusinessRule] ${message}`),
        setValue: (obj: any, key: string, value: any) => {
          if (obj && typeof obj === 'object') {
            obj[key] = value;
          }
        },
        addError: (errors: string[], error: string) => {
          if (Array.isArray(errors)) {
            errors.push(error);
          }
        },
        addWarning: (warnings: string[], warning: string) => {
          if (Array.isArray(warnings)) {
            warnings.push(warning);
          }
        },
      };

      // Create a function from the action string
      const actionFunction = new Function(...Object.keys(safeContext), action);
      
      // Execute the action
      return actionFunction(...Object.values(safeContext));
    } catch (error) {
      console.error('Error executing action:', error);
      return null;
    }
  }

  /**
   * Initialize default business rules
   */
  private initializeDefaultRules(): void {
    // User creation rules
    this.registerRule({
      id: 'user-email-required',
      name: 'Email Required',
      type: BusinessRuleType.VALIDATION,
      severity: BusinessRuleSeverity.ERROR,
      condition: 'isEmpty(email)',
      action: 'addError(errors, "Email is required")',
      message: 'Email is required for user creation',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.registerRule({
      id: 'user-email-format',
      name: 'Email Format Validation',
      type: BusinessRuleType.VALIDATION,
      severity: BusinessRuleSeverity.ERROR,
      condition: 'isNotEmpty(email) && !isEmail(email)',
      action: 'addError(errors, "Invalid email format")',
      message: 'Email must be in valid format',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.registerRule({
      id: 'user-password-strength',
      name: 'Password Strength',
      type: BusinessRuleType.SECURITY,
      severity: BusinessRuleSeverity.WARNING,
      condition: 'isNotEmpty(password) && length(password) < 8',
      action: 'addWarning(warnings, "Password should be at least 8 characters long")',
      message: 'Password strength warning',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // User update rules
    this.registerRule({
      id: 'user-update-role-restriction',
      name: 'Role Update Restriction',
      type: BusinessRuleType.BUSINESS,
      severity: BusinessRuleSeverity.ERROR,
      condition: 'action === "update" && newData.role === "admin" && currentData.role !== "admin"',
      action: 'addError(errors, "Cannot promote user to admin role")',
      message: 'Role promotion restriction',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // User deletion rules
    this.registerRule({
      id: 'user-delete-admin-protection',
      name: 'Admin Deletion Protection',
      type: BusinessRuleType.SECURITY,
      severity: BusinessRuleSeverity.CRITICAL,
      condition: 'action === "delete" && userData.role === "admin"',
      action: 'addError(errors, "Cannot delete admin users")',
      message: 'Admin deletion protection',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
