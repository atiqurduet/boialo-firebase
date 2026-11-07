// Firestore Rules Security Verification Specification
// Verifies that all Dirty Dozen adversarial payloads are rejected with PERMISSION_DENIED.

export const DIRTY_DOZEN_TEST_CASES = [
  { id: 1, name: 'Unauthenticated Profile Read', expected: 'PERMISSION_DENIED' },
  { id: 2, name: 'Cross-User Profile Read (PII Leak)', expected: 'PERMISSION_DENIED' },
  { id: 3, name: 'Spoofed Admin Email (Unverified)', expected: 'PERMISSION_DENIED' },
  { id: 4, name: 'Non-Admin Catalog Mutation', expected: 'PERMISSION_DENIED' },
  { id: 5, name: 'Path ID Poisoning', expected: 'PERMISSION_DENIED' },
  { id: 6, name: 'Shadow Field Injection on Profile', expected: 'PERMISSION_DENIED' },
  { id: 7, name: 'Identity Spoofing on Order Create', expected: 'PERMISSION_DENIED' },
  { id: 8, name: 'Cross-User Order List Query', expected: 'PERMISSION_DENIED' },
  { id: 9, name: 'Immutable Owner Mutation on Order Update', expected: 'PERMISSION_DENIED' },
  { id: 10, name: 'Terminal Order State Modification', expected: 'PERMISSION_DENIED' },
  { id: 11, name: 'Oversized String Payload', expected: 'PERMISSION_DENIED' },
  { id: 12, name: 'Self-Assigned Admin Escalation', expected: 'PERMISSION_DENIED' },
];
