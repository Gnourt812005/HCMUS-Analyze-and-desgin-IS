# System Mapping Summary: Admin Management

This document details the mapping between the Admin Management frontend components and the backend services.

---

## 1. Dormitory Management
**Pages:** `AdminDorm.tsx` (List) & `AdminDormDetail.tsx` (Detail)

### Frontend State & Hooks
| Component | State/Hook | Type | Description |
| :--- | :--- | :--- | :--- |
| **AdminDorm** | `dorms`, `setDorms` | `useState<DormDTO[]>` | List of dorms for the grid. |
| | `page`, `limit`, `total` | `useState<number>` | Pagination control states. |
| | `searchQuery` | `useState<string>` | Search filter input. |
| **AdminDormDetail** | `dorm`, `setDorm` | `useState<DormDTO \| null>` | Current dormitory details. |
| | `rooms`, `setRooms` | `useState<any[]>` | List of rooms within this dorm. |
| | `formData` | `useState<CreateDormDTO \| UpdateDormDTO>` | Form data for create/update. |

### Backend Interactions
| Frontend Method | Page | Backend Class | Backend Method | Database Call | DTO(s) Used |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fetchDorms` | List | `Dorm` (Control) | `getAll(query)` | `DormDB.fetchAll` | `GetDormsDto`, `DormDTO` |
| `handleDelete` | List | `Dorm` (Control) | `delete(id)` | `DormDB.fetchById`, `DormDB.delete` | -- |
| `fetchData` | Detail | `Dorm`, `Room` & `Utility` | `getById(id)`, `getAll()` | `DormDB.fetchById`, `RoomDB.fetchAll`, `UtilityDB.fetchAll` | `DormDTO`, `UtilityDTO` |
| `handleSave` | Detail | `Dorm` (Control) | `create()` / `update()` | `DormDB.insert` / `DormDB.update` | `CreateDormDTO`, `UpdateDormDTO` |

---

## 2. Room Management
**Pages:** `AdminRooms.tsx` (List) & `AdminRoomDetail.tsx` (Detail)

### Frontend State & Hooks
| Component | State/Hook | Type | Description |
| :--- | :--- | :--- | :--- |
| **AdminRooms** | `rooms`, `setRooms` | `useState<RoomDTO[]>` | List of rooms for the table. |
| | `filters`, `setFilters` | `useState<GetRoomDto>` | Pagination and filter states. |
| **AdminRoomDetail** | `room`, `setRoom` | `useState<RoomDTO \| null>` | Room details including beds. |
| | `dorms`, `setDorms` | `useState<DormDTO[]>` | Options for the Dormitory dropdown. |
| | `availableUtilities`| `useState<UtilityDTO[]>`| All available utility options. |
| | `formData`, `setFormData` | `useState<any>` | Room configuration form data (inc. `utilityIds`). |
| | `isBedModalOpen` | `useState<boolean>` | Controls if the Bed Modal is shown. |
| | `editingBed` | `useState<BedDTO \| null>` | The bed being edited (null if adding). |
| | `bedFormData` | `useState<any>` | Temporary form state for bed data. |

### Backend Interactions
| Frontend Method | Page | Backend Class | Backend Method | Database Call | DTO(s) Used |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fetchRooms` | List | `Room` (Business) | `getAll(query)` | `RoomDB.fetchAll` | `GetRoomDto`, `RoomDTO` |
| `fetchData` | Detail | `Room` (Business) | `getById(id)` | `RoomDB.fetchById` | `RoomDTO` |
|  | Detail | `Dorm` & `Utility` | `getAll()` & `fetchAll()` | `DormDB.fetchAll`, `UtilityDB.fetchAll` | `DormDTO`, `UtilityDTO` |
| `handleSave` | Detail | `Room` (Business) | `create()` / `update()` | `RoomDB.insert` / `RoomDB.update` | `CreateRoomDTO`, `UpdateRoomDTO` |
| `handleBedAction` | Detail | `Bed` (Business) | `addBed()` / `updateBed()` | `RoomDB.insertBed` / `RoomDB.updateBed` | `BedDTO` |
| `handleDeleteBed` | Detail | `Bed` (Business) | `deleteBed()` | `RoomDB.removeBed` | -- |

---

## 3. Staff Management
**Pages:** `AdminStaff.tsx` (List) & `AdminStaffDetail.tsx` (Detail)

### Frontend State & Hooks
| Component | State/Hook | Type | Description |
| :--- | :--- | :--- | :--- |
| **AdminStaff** | `staff`, `setStaff` | `useState<UserProfileDTO[]>` | List of all employees. |
| **AdminStaffDetail** | `formData`, `setFormData`| `useState<UserDTO>` | Comprehensive user/employee form data. |

### Backend Interactions
| Frontend Method | Page | Backend Class | Backend Method | Database Call | DTO(s) Used |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fetchStaff` | List | `User` (Control) | `getAllEmployees()` | `UserDB.fetchAllStaff` | `UserProfileDTO` |
| `handleDelete` | List | `User` (Control) | `deleteEmployee(email)` | `UserDB.delete` | -- |
| `fetchStaff` (Detail) | Detail | `User` (Control) | `getEmployeeByEmail()` | `UserDB.fetchCredentialByEmail` | `UserDTO` |
| `handleSubmit` (Detail) | Detail | `User` (Control) | `upsertEmployee(data)` | `UserDB.checkEmailExists`, `UserDB.update`, `UserDB.insert` | `UserDTO` |

---

## 4. Utility Management
**Page:** `AdminUtilities.tsx` (List with Modal)

### Frontend State & Hooks
| State/Hook | Type | Description |
| :--- | :--- | :--- |
| `utilities`, `setUtilities` | `useState<UtilityDTO[]>` | Comprehensive list of utilities. |
| `formData`, `setFormData` | `useState<CreateUtilityDto>` | Modal form state for adding/editing. |
| `editingId` | `useState<string \| null>` | Tracks if we are in Edit mode. |

### Backend Interactions
| Frontend Method | Backend Class | Backend Method | Database Call | DTO(s) Used |
| :--- | :--- | :--- | :--- | :--- |
| `fetchUtilities` | `Utility` (Control) | `fetchAll(query)` | `UtilityDB.fetchAll` | `GetUtilityDto`, `UtilityDTO` |
| `handleSave` | `Utility` (Control) | `create()` / `update()` | `UtilityDB.create` / `UtilityDB.update` | `CreateUtilityDto`, `UpdateUtilityDto`, `UtilityDTO` |
| `handleDelete` | `Utility` (Control) | `delete(id)` | `UtilityDB.isAttached`, `UtilityDB.delete` | -- |
