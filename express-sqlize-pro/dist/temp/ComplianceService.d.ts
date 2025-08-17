import { BusinessRuleEngine } from './BusinessRuleEngine';
import { Jurisdiction, EmployeeType, IComplianceValidation, IGlobalPayment, IComplianceService, ComplianceStatus } from '@/types/global-payroll';
export declare class ComplianceService implements IComplianceService {
    private jurisdictionRules;
    private businessRuleEngine;
    constructor(businessRuleEngine: BusinessRuleEngine);
    validatePayment(amount: number, jurisdiction: Jurisdiction, employeeType: EmployeeType): Promise<IComplianceValidation>;
    generateTaxDocuments(payment: IGlobalPayment, jurisdiction: Jurisdiction): Promise<string[]>;
    validateProfileCompliance(profileId: number, jurisdiction: Jurisdiction): Promise<IComplianceValidation>;
    private performTraditionalValidation;
    private getJurisdictionRules;
    private loadJurisdictionRules;
    private getRequiredDocuments;
    private checkMissingDocuments;
    private calculateTaxObligations;
    private getEmployeeType;
    updateProfileComplianceStatus(profileId: number, jurisdiction: Jurisdiction, status: ComplianceStatus): Promise<void>;
}
//# sourceMappingURL=ComplianceService.d.ts.map