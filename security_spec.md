# Security Specification (Payload-First Security TDD)

## 1. Data Invariants
1. **Default-Deny Catch-All**: Unmatched paths (`/{document=**}`) deny all reads and writes.
2. **Path Variable Hardening**: Every single-document ID (`{docId}`, `{userId}`) must match `^[a-zA-Z0-9_\-]+$` and be at most 128 characters.
3. **Catalog Write Protection**: Only verified admins (`help.boialo@gmail.com` with `email_verified == true` or a document in `/admins/{uid}`) may create, update, or delete storefront catalog documents.
4. **PII Isolation**: `/profiles/{userId}` and `/orders/{docId}` containing customer PII are strictly restricted to the document owner (`request.auth.uid`) or a verified admin. No blanket `isSignedIn()` reads are permitted.
5. **Identity Integrity & Immutability**: `id` and `user_id` fields cannot be spoofed on creation and remain immutable on updates.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Profile Read**: `GET /profiles/user_1` with `auth = null` -> `PERMISSION_DENIED`
2. **Cross-User Profile Read (PII Leak)**: `GET /profiles/user_2` as `auth.uid = "user_1"` -> `PERMISSION_DENIED`
3. **Spoofed Admin Email (Unverified)**: `POST /products/prod_1` with `email = "help.boialo@gmail.com"`, `email_verified = false` -> `PERMISSION_DENIED`
4. **Non-Admin Catalog Mutation**: `PATCH /site_settings/1` as normal user `auth.uid = "user_1"` -> `PERMISSION_DENIED`
5. **Path ID Poisoning**: `GET /products/invalid$id!@#` -> `PERMISSION_DENIED`
6. **Shadow Field Injection on Profile**: `POST /profiles/user_1` with `{ id: "user_1", email: "a@b.com", isAdmin: true }` -> `PERMISSION_DENIED`
7. **Identity Spoofing on Order Create**: `POST /orders/ord_1` as `user_1` with `{ id: "ord_1", user_id: "user_2", status: "pending" }` -> `PERMISSION_DENIED`
8. **Cross-User Order List Query**: `LIST /orders` without `where("user_id", "==", auth.uid)` -> `PERMISSION_DENIED`
9. **Immutable Owner Mutation on Order Update**: `PATCH /orders/ord_1` changing `user_id` from `user_1` to `user_2` -> `PERMISSION_DENIED`
10. **Terminal Order State Modification**: `PATCH /orders/ord_1` by customer when `existing().status == "delivered"` -> `PERMISSION_DENIED`
11. **Oversized String Payload (Denial of Wallet)**: `POST /profiles/user_1` with 10,000-char `full_name` -> `PERMISSION_DENIED`
12. **Self-Assigned Admin Escalation**: `POST /admins/user_1` as non-admin `user_1` -> `PERMISSION_DENIED`
