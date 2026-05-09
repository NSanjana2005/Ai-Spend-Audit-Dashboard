import { analyzeToolSpend, AuditInput, AuditContext } from './auditEngine';

describe('Audit Engine Optimization Logic', () => {
    let baseContext: AuditContext;

    beforeEach(() => {
        baseContext = { totalTeamSize: 10, primaryUseCase: 'Coding' };
    });

    test('1. Enterprise Overkill - suggests downgrade for small seat counts', () => {
        const input: AuditInput = { toolName: 'ChatGPT', currentPlan: 'Enterprise', monthlySpend: 60, users: 1 };
        const result = analyzeToolSpend(input, baseContext);
        
        expect(result.status).toBe('SAVINGS_FOUND');
        expect(result.recommendedPlan).toBe('Team'); // The tier below Enterprise
        expect(result.potentialSavings).toBeGreaterThan(0);
    });

    test('2. Checks strictly for actual Retail limits and flags phantom spend', () => {
        // Claude Pro standard is $20. User entered $100 for 1 user.
        const input: AuditInput = { toolName: 'Claude', currentPlan: 'Pro', monthlySpend: 100, users: 1 };
        const result = analyzeToolSpend(input, baseContext);
        
        expect(result.status).toBe('SAVINGS_FOUND');
        expect(result.recommendedSpend).toBe(20);
        expect(result.potentialSavings).toBe(80);
    });

    test('3. Evaluates Team Unnecessary logic correctly', () => {
        // 2 users on Team is overkill. Individual plans are better.
        const input: AuditInput = { toolName: 'Cursor', currentPlan: 'Business', monthlySpend: 80, users: 2 };
        const result = analyzeToolSpend(input, baseContext);
        
        expect(result.status).toBe('SAVINGS_FOUND');
        expect(result.recommendedPlan).toBe('Pro');
        expect(result.recommendedSpend).toBe(40);
        expect(result.potentialSavings).toBe(40);
    });

    test('4. Detects mismatch in Context Usage', () => {
        baseContext.primaryUseCase = 'Writing'; // Writer using coding tool
        const input: AuditInput = { toolName: 'GitHub Copilot', currentPlan: 'Individual', monthlySpend: 10, users: 1 };
        const result = analyzeToolSpend(input, baseContext);
        
        expect(result.status).toBe('SAVINGS_FOUND');
        expect(result.recommendedPlan).toBe('Cancel Plan');
        expect(result.potentialSavings).toBe(10);
    });

    test('5. Validates "Honest Optimization" without manufacturing savings', () => {
        // 5 users on Team $150 ($30/mo) is standard usage, no savings exists.
        const input: AuditInput = { toolName: 'Claude', currentPlan: 'Team', monthlySpend: 150, users: 5 };
        const result = analyzeToolSpend(input, baseContext);
        
        expect(result.status).toBe('OPTIMIZED');
        expect(result.potentialSavings).toBe(0);
    });

});
