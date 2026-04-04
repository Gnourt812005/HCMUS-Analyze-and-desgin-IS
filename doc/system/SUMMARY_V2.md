# Standardized Class Inventory - V2 (Standardized)

This document serves as the final source of truth for the system design after the standardization process (English naming, 3-layer architecture, Screen/DB naming conventions).

## 1. Presentation Layer (Boundaries/Screens)

| Standardized Class Name | Main Methods | UC Reference |
| :--- | :--- | :--- |
| **ScreenLogin** | `btnLoginClick()` | UC12 |
| **ScreenRegister** | `btnRegisterClick()` | UC11 |
| **ScreenHome** | `btnLogoutClick()` | UC13 |
| **ScreenEmployeeManagement** | `dgvEmployeeLoad()`, `btnSearchClick()`, `btnAddNewClick()` | UC17 |
| **ScreenEmployeeDetail** | `btnSaveClick()`, `btnCancelClick()` | UC17 |
| **ScreenDormManagement** | `dgvDormLoad()`, `btnSearchClick()`, `btnAddNewClick()` | UC18 |
| **ScreenDormDetail** | `btnUpdateClick()`, `btnHideClick()`, `btnAddNewRoomClick()` | UC18 |
| **ScreenRoomManagement** | `dgvRoomLoad()`, `btnSearchClick()`, `btnAddNewClick()` | UC19 |
| **ScreenRoomDetail** | `btnUpdateClick()`, `btnDeleteClick()`, `btnAddNewBedClick()` | UC19 |
| **ScreenContractManagement** | `dgvContractLoad()`, `btnSearchClick()`, `btnAddNewClick()` | UC20 |
| **ScreenContractDetail** | `btnUpdateClick()`, `btnCancelContractClick()`, `btnHandoverReportClick()` | UC20 |
| **ScreenReportList** | `loadReports()`, `btnAddNewClick()` | UC21 |
| **ScreenReportForm** | `btnSaveAndSignClick()` | UC21 |
| **ScreenDeposit** | `calculateDeposit()`, `btnConfirmClick()` | UC14 |
| **ScreenConditionCheck** | `showContent()`, `btnAgreeClick()` | UC15 |
| **ScreenPayment** | `selectMethod()`, `showQRCode()`, `notifyResult()` | UC16 |
| **ScreenDormsView** | `showDormsList()`, `gridDormsCellClick()` | UC1 |
| **ScreenRoomsView** | `showRoomsList()`, `btnSearchRoomClick()` | UC1, UC2 |
| **ScreenRoomDetails** | `showRoomDetails()`, `btnFavoriteClick()`, `btnPreviewRequestClick()` | UC2, UC3, UC6 |
| **ScreenFavoriteRooms** | `showFavoriteRooms()`, `listFavoriteRoomsItemClick()` | UC7 |
| **ScreenViewingSchedule** | `showClientPreviewSchedules()`, `listPreviewSchedulesItemClick()` | UC4, UC5 |
| **ScreenCheckoutRequest** | `btnSubmitClick()`, `btnCancelClick()` | UC22 |
| **ScreenCheckoutRequestList** | `loadRequests()`, `btnViewDetailClick()` | UC23, UC26 |
| **ScreenContractTermination** | `btnCompleteClick()`, `loadCalculation()` | UC25 |
| **ScreenRefundCalculation** | `btnCalculateClick()`, `btnSaveClick()` | UC24 |

## 2. Business Layer (Controls/Models)

| Class Name | Key Responsibilities | Standardized Methods |
| :--- | :--- | :--- |
| **User** | Auth and Profile | `login()`, `register()`, `logout()` |
| **Employee** | Staff Management | `getAll()`, `create()`, `update()`, `delete()` |
| **Dorm** | Building/KTX Logic | `getAll()`, `getById()`, `create()`, `update()`, `hide()` |
| **Room** | Room & Bed Logic | `getRooms()`, `getRoomDetail()`, `addBed()`, `updateBed()` |
| **Contract** | Lease Agreement | `getContracts()`, `createContract()`, `cancelContract()`, `liquidateContract()` |
| **Report** | Handover Documentation | `getReportsByContract()`, `createHandoverReport()` |
| **Deposit** | Booking/Rent Initial | `calculateDeposit()`, `createDepositRecord()` |
| **Payment** | Transaction Processing | `generatePaymentCode()`, `verifyTransaction()` |
| **FavoriteRequest** | Interested Room Logic | `addFavoriteRoom()`, `removeFavoriteRoom()` |
| **ViewingSchedule** | Room Viewing Logic | `getViewingSchedules()`, `createPreviewForm()`, `assignStaff()` |
| **CheckoutRequest** | Room Return Logic | `createRequest()`, `cancelRequest()`, `updateStatus()` |
| **RefundCalculator** | Financial Settlement | `calculateTotal()`, `saveCalculation()` |

## 3. Database Layer (Entities/DAOs)

All classes follow the `*DB` postfix for Entity/Data Access.

| Class Name | Methods |
| :--- | :--- |
| **UserDB** | `checkCredentials()`, `insert()`, `checkEmailExists()` |
| **EmployeeDB** | `findAll()`, `insert()`, `update()`, `delete()` |
| **DormDB** | `findAll()`, `findById()`, `insert()`, `updateStatus()` |
| **RoomDB** | `findAll()`, `findById()`, `insert()`, `update()`, `delete()` |
| **ContractDB** | `findAll()`, `findById()`, `insert()`, `updateStatus()` |
| **ReportDB** | `fetchByContractId()`, `insert()` |
| **DepositDB** | `insert()`, `fetchByCustomerId()` |
| **PaymentDB** | `insert()`, `updateStatus()` |
| **RoomSearchDB** | `search(criteria)` |
| **FavoriteRoomDB** | `addFavorite()`, `removeFavorite()`, `fetchByUserId()` |
| **ViewingScheduleDB** | `insert()`, `fetchByUserId()`, `checkConflicts()` |
| **CheckoutRequestDB** | `insert()`, `removeById()`, `fetchByCustomer()` |
| **RefundCalculationDB** | `insert()`, `fetchByRequestId()` |

## 4. Design Decisions & Guidelines

- **Architecture**: Strict 3-layer separation (Boundary -> Control -> Entity).
- **Naming**: 
  - Boundary: `Screen*` (CamelCase)
  - Control: Business name (CamelCase). Methods use **<<static>>**. Properties are **non-static**.
  - Entity: `*DB` (CamelCase). Methods use **<<static>>**.
  - Methods/Properties: `camelCase` (English)
- [Login](dang_nhap/DangNhap_SequenceDiagram.wsd)
- [Logout](dang_xuat/DangXuat_SequenceDiagram.wsd)
- [Edit Profile](chinh_sua_thong_tin_ca_nhan/ChinhSuaThongTinCaNhan_ClassDiagram.wsd)
- **Language**:
  - Technical identifiers (Classes, Methods, Variables): **English**
  - Labels and Annotations (Arrows, Headers, Notes): **Vietnamese** (to map with specifications)

---
*Last Updated: 2026-04-03*
