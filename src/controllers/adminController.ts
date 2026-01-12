import type { Request, Response } from 'express';
import { UserService } from '../services/userService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { HttpStatusCode } from '../utils/errors/error.types.js';
import { UserRole } from '../types/user.types.js';

/**
 * Admin Controller
 * Handles HTTP requests for admin user management operations
 */
export class AdminController {
  /**
   * Get all users with pagination and filtering
   * @route GET /api/admin/users
   * @query page - Page number (default: 1)
   * @query limit - Items per page (default: 20)
   * @query role - Optional role filter (admin/customer)
   * @query isActive - Optional active status filter (true/false)
   * @query search - Optional search query
   * @access Admin only
   */
  static async getAllUsers(req: Request, res: Response): Promise<Response> {
    try {
      const {
        page = 1,
        limit = 20,
        role,
        isActive,
        search,
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const roleFilter = role as UserRole | undefined;
      const isActiveFilter =
        isActive === 'true' ? true : isActive === 'false' ? false : undefined;
      const searchQuery = search as string | undefined;

      const result = await UserService.getAllUsers(
        pageNum,
        limitNum,
        roleFilter,
        isActiveFilter,
        searchQuery
      );

      return ResponseUtil.success(res, result);
    } catch (error) {
      return ResponseUtil.error(
        res,
        'Failed to retrieve users',
        'USER_FETCH_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get user by ID
   * @route GET /api/admin/users/:id
   * @param id - User ID
   * @access Admin only
   */
  static async getUserById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['User ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      const user = await UserService.getUserById(id);
      return ResponseUtil.success(res, { user });
    } catch (error) {
      if (error instanceof Error && error.message === 'user.userNotFound') {
        return ResponseUtil.fail(
          res,
          { user: ['User not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to retrieve user',
        'USER_FETCH_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Create a new user
   * @route POST /api/admin/users
   * @access Admin only
   */
  static async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const userData = req.body;
      const user = await UserService.createUser(userData);

      return ResponseUtil.success(res, { user }, HttpStatusCode.CREATED);
    } catch (error) {
      if (error instanceof Error && error.message === 'user.emailAlreadyExists') {
        return ResponseUtil.fail(
          res,
          { email: ['Email already exists'] },
          HttpStatusCode.CONFLICT
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to create user',
        'USER_CREATE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Update user
   * @route PUT /api/admin/users/:id
   * @param id - User ID
   * @access Admin only
   */
  static async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['User ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      const user = await UserService.updateUser(id, updateData);
      return ResponseUtil.success(res, { user });
    } catch (error) {
      if (error instanceof Error && error.message === 'user.userNotFound') {
        return ResponseUtil.fail(
          res,
          { user: ['User not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      if (error instanceof Error && error.message === 'user.emailAlreadyExists') {
        return ResponseUtil.fail(
          res,
          { email: ['Email already exists'] },
          HttpStatusCode.CONFLICT
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to update user',
        'USER_UPDATE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Delete user permanently
   * @route DELETE /api/admin/users/:id
   * @param id - User ID
   * @access Admin only
   */
  static async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['User ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      await UserService.deleteUser(id);
      return ResponseUtil.success(res, { message: 'User deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'user.userNotFound') {
        return ResponseUtil.fail(
          res,
          { user: ['User not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to delete user',
        'USER_DELETE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Deactivate user (soft delete)
   * @route PATCH /api/admin/users/:id/deactivate
   * @param id - User ID
   * @access Admin only
   */
  static async deactivateUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['User ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      const user = await UserService.deactivateUser(id);
      return ResponseUtil.success(res, { user });
    } catch (error) {
      if (error instanceof Error && error.message === 'user.userNotFound') {
        return ResponseUtil.fail(
          res,
          { user: ['User not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to deactivate user',
        'USER_UPDATE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Activate user
   * @route PATCH /api/admin/users/:id/activate
   * @param id - User ID
   * @access Admin only
   */
  static async activateUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['User ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      const user = await UserService.activateUser(id);
      return ResponseUtil.success(res, { user });
    } catch (error) {
      if (error instanceof Error && error.message === 'user.userNotFound') {
        return ResponseUtil.fail(
          res,
          { user: ['User not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to activate user',
        'USER_UPDATE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Update user role
   * @route PATCH /api/admin/users/:id/role
   * @param id - User ID
   * @body role - New role (admin/customer)
   * @access Admin only
   */
  static async updateUserRole(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['User ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      if (!role) {
        return ResponseUtil.fail(
          res,
          { role: ['Role is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      const user = await UserService.updateUserRole(id, role);
      return ResponseUtil.success(res, { user });
    } catch (error) {
      if (error instanceof Error && error.message === 'user.userNotFound') {
        return ResponseUtil.fail(
          res,
          { user: ['User not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to update user role',
        'USER_UPDATE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get user statistics for dashboard
   * @route GET /api/admin/users/statistics
   * @access Admin only
   */
  static async getUserStatistics(req: Request, res: Response): Promise<Response> {
    try {
      const statistics = await UserService.getUserStatistics();
      return ResponseUtil.success(res, statistics);
    } catch (error) {
      return ResponseUtil.error(
        res,
        'Failed to retrieve user statistics',
        'STATISTICS_FETCH_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
