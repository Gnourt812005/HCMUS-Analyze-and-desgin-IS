---
description: How to implement a new feature (Backend to Frontend)
---
# Feature Implementation Workflow

This workflow strictly defines the steps required whenever the user asks to implement a new feature in the DormArch system.

1. **Verify the Design First**
   - Check the class and sequence diagrams inside the `doc/system/` folder related to the requested feature.
   - Analyze the diagrams. Does it contain sufficient detail (methods, parameters, flow) to implement?
   - **IF NOT ENOUGH DETAIL**: Immediately notify the user what is missing and ask them to edit the design. **DO NOT CODE**. Wait until the user confirms the design is good.
   - **IF GOOD**: Proceed to the next step.

2. **Backend Logic & Business Class (Mock Data)**
   - Locate or create the corresponding Business class in `src/backend/src/business/`.
   - This class acts as both Model and Service (like in MVC) and uses **`static`** methods.
   - If the class already exists, check if you need to enhance it (add new methods or fields/properties).
   - Implement the logic returning mock data (interfacing with `src/backend/src/database/*DB.ts` with static methods).

3. **Shared DTO**
   - Locate the corresponding interface in `src/shared/index.ts`.
   - Ensure a proper DTO (Data Transfer Object) exists for this feature (e.g. `RoomDTO`).
   - If it doesn't exist, create it. If it needs new fields according to the design, enhance it.

4. **Frontend UI**
   - Implement the UI page in `src/frontend/src/pages/[PageName].tsx` (or whatever structure applies).
   - Each page should ideally be in its own `.tsx` file.
   - Strictly follow the verified design from the `doc/system/`.

**Expected Data Flow**:
`Frontend Page -> Shared DTO -> Backend Route -> Backend Business Class (Static) -> Backend DB Class (Static Mock)`
