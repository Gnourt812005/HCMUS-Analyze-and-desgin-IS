# System Mapping Summary: Authentication & User Profile

This document details the mapping between frontend components and backend services for the Authentication and Profile modules.

---

## 1. Login.tsx
**Route:** `/login`

### Frontend State & Hooks
| State/Hook | Type | Description |
| :--- | :--- | :--- |
| `showPassword`, `setShowPassword` | `useState<boolean>` | Toggles visibility of the password field. |
| `navigate` | `useNavigate` | Handles redirection after successful login. |

### Backend Interactions
| Frontend Method | Description | Backend Class | Backend Method | Database Call | DTO(s) Used |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `handleLogin` | `/auth/sign-in` (POST) | `User` (Control) | `signIn(data)` | `UserDB.fetchCredentialByEmail` | `SignInDTO`, `SignInResponseDTO` |

**Details:**
- **Input:** Email/Phone and Password from form.
- **Process:** Calls `/auth/sign-in`.
- **Side Effect:** Stores the returned JWT token using `AuthService.setToken`.

---

## 2. Register.tsx
**Route:** `/register`

### Frontend State & Hooks
| State/Hook | Type | Description |
| :--- | :--- | :--- |
| `showPassword`, `setShowPassword` | `useState<boolean>` | Toggles visibility of the password fields. |
| `navigate` | `useNavigate` | Handles redirection to login after registration. |

### Backend Interactions
| Frontend Method | Description | Backend Class | Backend Method | Database Call | DTO(s) Used |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `handleRegister` | `/auth/sign-up` (POST) | `User` (Control) | `signUp(data)` | `UserDB.checkEmailExists`, `UserDB.insert` | `SignUpDTO` |

**Details:**
- **Input:** Email, Password, and Confirmation.
- **Process:** Calls `/auth/sign-up`.
- **Success:** Redirects to `/login`.

---

## 3. ProfilePage.tsx
**Route:** `/profile`

### Frontend State & Hooks
| State/Hook | Type | Description |
| :--- | :--- | :--- |
| `profile`, `setProfile` | `useState<UserProfileDTO \| null>` | Stores the current user's profile data. |
| `isLoading`, `setIsLoading` | `useState<boolean>` | Manages the display of the loading spinner. |

### Backend Interactions
| Frontend Method | Description | Backend Class | Backend Method | Database Call | DTO(s) Used |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fetchProfile` | `/users/profile` (GET) | `User` (Control) | `getProfile(email)` | `UserDB.fetchCredentialByEmail` | `UserProfileDTO` |
| `handleUpdate` | `/users/profile` (PUT) | `User` (Control) | `updateProfile(email, data)` | `UserDB.update` | `UserProfileDTO` |
| `handlePasswordChange` | `/users/profile/password` (PATCH) | `User` (Control) | `changePassword(email, data)` | `UserDB.fetchCredentialByEmail`, `UserDB.updatePassword` | `ChangePasswordDTO` |

**Details:**
- **fetchProfile**: Uses the email extracted from the decoded JWT token (via `authMiddleware`).
- **handleUpdate**: Updates non-sensitive fields in the `users` table.
- **handlePasswordChange**: Requires `oldPassword` and `newPassword` for verification.
