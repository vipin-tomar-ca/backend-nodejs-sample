import { Jurisdiction, EmployeeType, IComplianceService, IComplianceValidation, IJurisdictionInfo, IGlobalPayment } from '../types/global-payroll';
export declare class ComplianceService implements IComplianceService {
    private jurisdictionRules;
    constructor();
    private initializeJurisdictionRules;
    validatePayment(amount: number, jurisdiction: Jurisdiction, employeeType: EmployeeType): Promise<IComplianceValidation>;
    generateTaxDocuments(payment: IGlobalPayment, jurisdiction: Jurisdiction): Promise<string[]>;
    validateProfileCompliance(profileId: number, jurisdiction: Jurisdiction): Promise<IComplianceValidation>;
    getJurisdictionInfo(jurisdiction: Jurisdiction): Promise<IJurisdictionInfo>;
    private getProfileComplianceDocuments;
    private calculateTaxObligations;
    getSupportedJurisdictions(): Jurisdiction[];
    getComplianceStatistics(): {
        totalValidations: number;
        compliantValidations: number;
        nonCompliantValidations: number;
        complianceRate: number;
        mostCommonIssues: string[];
    };
}
//# sourceMappingURL=ComplianceService.d.ts.map