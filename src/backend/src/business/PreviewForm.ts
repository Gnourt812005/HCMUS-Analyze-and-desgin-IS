import { PreviewFormDB } from '../database/PreviewFormDB';
import { RoomDB } from '../database/RoomDB';
import { DormDB } from '../database/DormDB';
import { UserDB } from '../database/UserDB';
import { UserRole } from '@dormarch/shared';


export class PreviewForm {
  formId: string;
  roomId: string;
  userId: string;
  previewDatetime: string;
  createdDatetime: string;
  status: 'pending' | 'rejected' | 'approved' | 'cancelled';
  staffId: string | null;

  constructor(data: Partial<PreviewForm>) {
    this.formId = data.formId || '';
    this.roomId = data.roomId || '';
    this.userId = data.userId || '';
    this.previewDatetime = data.previewDatetime || '';
    this.createdDatetime = data.createdDatetime || new Date().toISOString();
    this.status = data.status || 'pending';
    this.staffId = data.staffId || null;
  }

  // Helper function to extract Room and Dorm details
  static async getRoomAndDormInfo(roomId: string) {
    const dorms = await DormDB.fetchAll({});
    for (const dorm of dorms.dorms) {
      if (!dorm.id) continue;
      const result = await RoomDB.fetchAll({ dormId: dorm.id });
      const rooms = result.rooms;
      const match = rooms.find((r) => r.id === roomId);
      if (match) {
        return {
          roomName: match.name || '',
          dormId: dorm.id,
          dormName: dorm.name || '',
          dormAddress: dorm.address || ''
        };
      }
    }
    return { roomName: '', dormId: '', dormName: '', dormAddress: '' };
  }

  // Returns:
  // 0: Success
  // 1: Room already booked for this time
  // 2: User already has a booking for this time
  // 3: No available staff for this time
  // 4: Internal Server Error
  static async createPreviewForm(userId: string, roomId: string, previewDatetime: string) {
    try {
      const allForms = await PreviewFormDB.getAll();
      const newFormDate = new Date(previewDatetime);

      // Helper: check if two dates are functionally identically close (e.g. within an hour or exactly same date to avoid double booking)
      const isSameDate = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString() && d1.getHours() === d2.getHours();

      // 1. Check room availability
      const roomConflict = allForms.find(f => 
        f.roomId === roomId && 
        isSameDate(new Date(f.previewDatetime), newFormDate) && 
        f.status === 'pending'
      );

      if (roomConflict) {
        return {code: 1, data: null }; // Room already booked for this time
      }

      // 2. Check guest availability
      const userConflict = allForms.find(f => 
        f.userId === userId && 
        isSameDate(new Date(f.previewDatetime), newFormDate) && 
        f.status === 'pending'
      );

      if (userConflict) {
        return {code: 2, data: null }; // User already has a booking for this time
      }

      // 3. Automatic Employee Assignment
      const staffs = await UserDB.fetchEmployeesByRole(UserRole.SALE_STAFF);
      let assignedStaffId = null;

      // Find a staff member that does NOT have a scheduling conflict
      for (const staff of staffs) {
        const staffConflict = allForms.find(f => 
          f.staffId === staff.email && 
          isSameDate(new Date(f.previewDatetime), newFormDate) && 
          f.status === 'pending'
        );
        if (!staffConflict) {
          assignedStaffId = staff.email;
          break;
        }
      }

      if (!assignedStaffId) {
        return {code: 3, data: null }; // No available staff for this time
      }
      
      const newForm = new PreviewForm({
        formId: `prev-${Date.now()}`,
        roomId,
        userId,
        previewDatetime,
        status: 'pending',
        staffId: assignedStaffId
      });

      await PreviewFormDB.insert(newForm);
      return {code: 0, data: newForm }; // Success
    }
    catch (error) {
      return {code: 4, data: null }; // Internal Server Error
    }
  }

  // Returns:
  // 0: Success
  // 1: Internal Server Error
  static async getPreviewsByUserId(userId: string) {
    try {
      // Find preview forms for this user directly from PreviewFormDB
      const allForms = await PreviewFormDB.getAll();
      const userForms = allForms.filter(f => f.userId === userId);

      // Map to PreviewBriefDTO
      const data = await Promise.all(userForms.map(async (f) => {
        const { roomName, dormName, dormAddress } = await this.getRoomAndDormInfo(f.roomId);

        return {
          id: f.formId,
          roomName,
          dormName,
          dormAddress,
          previewDate: f.previewDatetime.split('T')[0],
          previewTime: f.previewDatetime.split('T')[1].substring(0, 5),
          status: f.status
        };
      }));

      return {code: 0, data: data }; // Success
    }
    catch (error) {
      return {code: 1, data: null }; // Internal Server Error
    }
  }

  // Returns:
  // 0: Success
  // 1: Internal Server Error
  static async getPreviewsByStaffId(staffId: string) {
    try {
      const allForms = await PreviewFormDB.getAll();
      const staffForms = allForms.filter((f) => f.staffId === staffId);

      const data = await Promise.all(staffForms.map(async (f) => {
        const { roomName, dormName, dormAddress } = await this.getRoomAndDormInfo(f.roomId);

        return {
          id: f.formId,
          roomName,
          dormName,
          dormAddress,
          previewDate: f.previewDatetime.split('T')[0],
          previewTime: f.previewDatetime.split('T')[1].substring(0, 5),
          status: f.status
        };
      }));
      return { code: 0, data }; // Success
    } 
    catch (error) {
      return { code: 1, data: null }; // Internal Server Error
    }
  }

  static async getStaffPreviewDetails(formId: string, staffId: string) {
    try {
    const form = await PreviewFormDB.getById(formId);
      if (!form) return {code: 1, data: null}; // Not found

      if (form.staffId !== staffId) {
        return {code: 2, data: null}; // Forbidden
      }

      const { roomName, dormId, dormName, dormAddress } = await this.getRoomAndDormInfo(form.roomId);

      let customerInfo = null;
      if (form.userId) {
        const customer = await UserDB.fetchCredentialByEmail(form.userId);
        if (customer) {
          customerInfo = {
            name: customer.fullName,
            phone: customer.phone || 'Chưa cung cấp'
          };
        }
      }

      const data = {
        id: form.formId,
        roomId: form.roomId,
        roomName,
        dormId,
        dormName,
        dormAddress,
        date: form.previewDatetime.split('T')[0],
        time: form.previewDatetime.split('T')[1].substring(0, 5),
        customerInfo,
        createdAt: form.createdDatetime
      };
      return {code: 0, data}; // Success
    }
    catch (error) {
      return {code: 3, data: null}; // Internal Server Error
    }
  }


  // Returns:
  // 0: Success
  // 1: Not found
  // 2: Forbidden
  // 3: Internal Server Error
  static async getUserPreviewDetails(formId: string, userId: string) {
    try {
      const form = await PreviewFormDB.getById(formId);
      if (!form) return {code: 1, data: null}; // Not found

      if (form.userId !== userId) {
        return {code: 2, data: null}; // Forbidden
      }

      const { roomName, dormId, dormName, dormAddress } = await this.getRoomAndDormInfo(form.roomId);

      let salesStaff = null;
      if (form.staffId) {
        const staff = await UserDB.fetchCredentialByEmail(form.staffId);
        if (staff) {
          salesStaff = {
            name: staff.fullName,
            phone: staff.phone
          };
        }
      }

      const data = {
        id: form.formId,
        roomId: form.roomId,
        roomName,
        dormId,
        dormName,
        dormAddress,
        date: form.previewDatetime.split('T')[0],
        time: form.previewDatetime.split('T')[1].substring(0, 5),
        salesStaff,
        createdAt: form.createdDatetime,
        status: form.status
      };

      return {code: 0, data}; // Success
    }
    catch (error) {
      return {code: 3, data: null}; // Internal Server Error
    }
  }
    
  // Returns:
  // 0: Success
  // 1: Not found
  // 2: Forbidden
  // 3: Cannot reschedule non-pending forms
  // 4: Failed to update
  // 5: Internal Server Error
  static async reschedulePreviewByStaff(formId: string, staffId: string, wantedPreviewDate: string, wantedPreviewTime: string) {
    try {
      const form = await PreviewFormDB.getById(formId);
      if (!form) return { code: 1, data: null }; // Not found

      if (form.staffId !== staffId) {
        return { code: 2, data: null }; // Forbidden
      }

      if (form.status !== 'pending') {
        return { code: 3, data: null }; // Cannot reschedule non-pending forms
      }

      const newDatetime = `${wantedPreviewDate}T${wantedPreviewTime}:00`;
      const success = await PreviewFormDB.updateDatetime(formId, newDatetime);
      if (!success) {
        return { code: 4, data: null }; // Failed to update
      }
      
      return { code: 0, data: null }; // Success\
    }
    catch (error) {
      return { code: 5, data: null }; // Internal Server Error
    }
  }

  // Returns:
  // 0: Success
  // 1: Not found
  // 2: Forbidden
  // 3: Cannot cancel non-pending forms
  // 4: Failed to update
  // 5: Internal Server Error 
  static async cancelPreviewByUser(formId: string, userId: string) {
    try {
      const form = await PreviewFormDB.getById(formId);
      if (!form) return { code: 1, data: null }; // Not found

      if (form.userId !== userId) {
        return { code: 2, data: null }; // Forbidden
      }

      // Only allow canceling if status is pending
      if (form.status !== 'pending') {
        return { code: 3, data: null }; // Cannot cancel non-pending forms
      }

      const success = await PreviewFormDB.updateStatus(formId, 'cancelled');
      if (!success) {
        return { code: 4, data: null }; // Failed to update
      }

      return { code: 0, data: null }; // Success
    }
    catch (error) {
      return { code: 5, data: null }; // Internal Server Error 
    }
  }
}
