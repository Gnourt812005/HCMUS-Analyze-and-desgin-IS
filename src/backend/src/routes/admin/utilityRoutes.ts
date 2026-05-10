import { Router } from 'express';
import { Utility } from '../../business/Utility';
import { authorize } from '../../middleware/authMiddleware';
import { UserRole } from '@dormarch/shared';

export const utilityRoutes = Router();

// GET / - List utilities (Managers and Admins)
utilityRoutes.get('/', authorize(UserRole.MANAGER), async (req, res) => {
    try {
        const query = {
            page: req.query.page ? parseInt(req.query.page as string) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
            search: req.query.search as string
        };
        const result = await Utility.fetchAll(query);
        res.json({ message: 'Success', status: 200, data: result });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Internal Server Error', status: 500 });
    }
});

// GET /:id - Get utility detail (Managers and Admins)
utilityRoutes.get('/:id', authorize(UserRole.MANAGER), async (req, res) => {
    try {
        const utility = await Utility.fetchById(req.params.id);
        if (!utility) {
            return res.status(404).json({ message: 'Không tìm thấy tiện ích', status: 404 });
        }
        res.json({ message: 'Success', status: 200, data: utility });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Internal Server Error', status: 500 });
    }
});

// POST / - Create utility (ADMIN ONLY)
utilityRoutes.post('/', async (req, res) => {
    try {
        const result = await Utility.create(req.body);
        res.json({ message: 'Thêm mới thành công', status: 201, data: result });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Internal Server Error', status: 500 });
    }
});

// PUT /:id - Update utility (ADMIN ONLY)
utilityRoutes.put('/:id', async (req, res) => {
    try {
        const success = await Utility.update(req.params.id, req.body.title);
        res.json({ message: 'Cập nhật thành công', status: 200, data: success });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Internal Server Error', status: 500 });
    }
});

// DELETE /:id - Delete utility (ADMIN ONLY)
utilityRoutes.delete('/:id', async (req, res) => {
    try {
        const success = await Utility.delete(req.params.id);
        res.json({ message: 'Xóa thành công', status: 200, data: success });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Internal Server Error', status: 400 });
    }
});
