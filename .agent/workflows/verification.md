---
description: How to verify implementation matches system design
---

# Design Verification Workflow

This workflow ensures that the implemented codebase accurately reflects the UML design documentation (Class Diagrams, Sequence Diagrams, etc.) in the `doc/system/` folder.

## Rules
- Every time a feature implementation or refactor is complete, you MUST verify it against the design documents.
- If there is a discrepancy between the implementation and the design, the design MUST be updated so that they match exactly.

## Steps

1. **Verify Shared DTOs (`src/shared/`)**:
   - Check the class diagrams and sequence diagrams to find all expected DTOs.
   - Verify that all DTO fields in `src/shared/*.ts` exactly match the fields defined in the design diagrams.

2. **Verify Business Classes (`src/backend/src/business/`)**:
   - Verify that the class name exists in the class diagram.
   - Verify that ALL fields (properties) and their types defined in the design are correctly implemented in the Business model.
   - Verify that ALL methods (including `static` methods like `login`, `register`) match the exact signature (arguments and return types) defined in the design.

3. **Verify Database Classes (`src/backend/src/database/`)**:
   - Verify that the corresponding DB class (e.g., `UserDB`) exists.
   - Verify that the methods implemented in the DB class align with the data access operations described in the sequence diagrams and class diagrams.

4. **Reconcile Discrepancies**:
   - If the implementation has more fields/methods or different names than the design, explicitly ask the user whether to modify the implementation or to update the `.wsd` design files.
   - NEVER leave the design out of sync with the implementation.
