import { RoomDB } from '../database/RoomDB';
import { DormDB } from '../database/DormDB';
import { FavouriteRoomsDB } from '../database/FavouriteRoomsDB';

export class Favourites {
    userId: string;
    roomId: string;

    constructor(userId: string, roomId: string) {
        this.userId = userId;
        this.roomId = roomId;
    }

    // Code:
    // 0: Success
    // 1: Internal Server Error
    static async getFavouritesByUserId(userId: string) {
        try {
            // Find favorited room IDs
            const roomIds = await FavouriteRoomsDB.getRoomIdsByUserId(userId);
            
            // Get all rooms and dorms (large limit to ensure favorites aren't cut off by pagination)
            const rooms = await RoomDB.fetchAll({ limit: 1000 });
            const dorms = await DormDB.getAll();
            const r = rooms.rooms;
        
            // Filter relevant rooms
            const favoritedRooms = r.filter(r => roomIds.includes(r.id!));
        
            // Map to full detailed structure mimicking RoomList.tsx needs
            const data = favoritedRooms.map(r => {
                const dormMatch = dorms.find(d => d.id === r.dormId);
                return {
                    ...r,
                    isFavorite: true,
                };
            });

            return {code: 0, data: data};
        }
        catch (error) {
            return {code: 1, data: null};
        }
    }

    // Returns:
    // 0: Success
    // 1: Already exists or failed to insert
    // 2: Internal Server Error
    static async addFavourite(userId: string, roomId: string) {
        try {
            const res =  await FavouriteRoomsDB.insert(userId, roomId);

            if (res) {
                return 0; // Success
            }
            else{
                return 1; // Already exists or failed to insert
            }
        } catch (error) {
            return 2; // Internal Server Error
        }
    }

    // Returns:
    // 0: Success
    // 1: Not exists
    // 2: Internal Server Error
    static async deleteFavourite(userId: string, roomId: string) {
        try {
            const res =  await FavouriteRoomsDB.delete(userId, roomId);

            if (res) {
                return 0; // Success
            }
            else{
                return 1; // Not exists
            }
        } catch (error) {
            return 2; // Internal Server Error
        }
    }

}