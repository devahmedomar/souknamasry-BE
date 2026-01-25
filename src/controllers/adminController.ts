import type { Request, Response } from 'express';
import { UserService } from '../services/userService.js';
import { ProductService } from '../services/productService.js';
import { OrderService } from '../services/orderService.js';
import { AnalyticsService } from '../services/analyticsService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { HttpStatusCode } from '../utils/errors/error.types.js';
import { UserRole } from '../types/user.types.js';
import { OrderStatus, PaymentStatus } from '../types/order.types.js';

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

  // ============== DASHBOARD STATISTICS ==============

  /**
   * Get comprehensive dashboard statistics
   * @route GET /api/admin/statistics/dashboard
   * @access Admin only
   */
  static async getDashboardStatistics(req: Request, res: Response): Promise<Response> {
    try {
      const statistics = await AnalyticsService.getDashboardStats();
      return ResponseUtil.success(res, statistics);
    } catch (error) {
      return ResponseUtil.error(
        res,
        'Failed to retrieve dashboard statistics',
        'STATISTICS_FETCH_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get revenue trends
   * @route GET /api/admin/statistics/revenue-trend
   * @access Admin only
   */
  static async getRevenueTrend(req: Request, res: Response): Promise<Response> {
    try {
      const { days = 30 } = req.query;
      const trends = await AnalyticsService.getRevenueTrend(Number(days));
      return ResponseUtil.success(res, { trends });
    } catch (error) {
      return ResponseUtil.error(
        res,
        'Failed to retrieve revenue trends',
        'STATISTICS_FETCH_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get sales by category
   * @route GET /api/admin/statistics/sales-by-category
   * @access Admin only
   */
  static async getSalesByCategory(req: Request, res: Response): Promise<Response> {
    try {
      const salesData = await AnalyticsService.getSalesByCategory();
      return ResponseUtil.success(res, { salesData });
    } catch (error) {
      return ResponseUtil.error(
        res,
        'Failed to retrieve sales by category',
        'STATISTICS_FETCH_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ============== PRODUCT MANAGEMENT ==============

  /**
   * Get all products (Admin)
   * @route GET /api/admin/products
   * @access Admin only
   */
  static async getAllProducts(req: Request, res: Response): Promise<Response> {
    try {
      const { page = 1, limit = 20, isActive, inStock, category, search } = req.query;

      const filters: any = {};
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (inStock !== undefined) filters.inStock = inStock === 'true';
      if (category) filters.category = category as string;
      if (search) filters.search = search as string;

      const result = await ProductService.getAllProductsAdmin(
        Number(page),
        Number(limit),
        filters
      );

      return ResponseUtil.success(res, result);
    } catch (error) {
      return ResponseUtil.error(
        res,
        'Failed to retrieve products',
        'PRODUCT_FETCH_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Create product
   * @route POST /api/admin/products
   * @access Admin only
   */
  static async createProduct(req: Request, res: Response): Promise<Response> {
    try {
      const product = await ProductService.createProduct(req.body);
      return ResponseUtil.success(res, { product }, HttpStatusCode.CREATED);
    } catch (error) {
      return ResponseUtil.error(
        res,
        'Failed to create product',
        'PRODUCT_CREATE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Update product
   * @route PUT /api/admin/products/:id
   * @access Admin only
   */
  static async updateProduct(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['Product ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }
      const product = await ProductService.updateProduct(id, req.body);
      return ResponseUtil.success(res, { product });
    } catch (error) {
      if (error instanceof Error && error.message === 'product.productNotFound') {
        return ResponseUtil.fail(
          res,
          { product: ['Product not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to update product',
        'PRODUCT_UPDATE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Delete product
   * @route DELETE /api/admin/products/:id
   * @access Admin only
   */
  static async deleteProduct(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['Product ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }
      await ProductService.deleteProduct(id);
      return ResponseUtil.success(res, { message: 'Product deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'product.productNotFound') {
        return ResponseUtil.fail(
          res,
          { product: ['Product not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to delete product',
        'PRODUCT_DELETE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Update product stock
   * @route PATCH /api/admin/products/:id/stock
   * @access Admin only
   */
  static async updateProductStock(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['Product ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }
      const { stockQuantity } = req.body;
      const product = await ProductService.updateStock(id, stockQuantity);
      return ResponseUtil.success(res, { product });
    } catch (error) {
      if (error instanceof Error && error.message === 'product.productNotFound') {
        return ResponseUtil.fail(
          res,
          { product: ['Product not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to update stock',
        'PRODUCT_UPDATE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Toggle product active status
   * @route PATCH /api/admin/products/:id/toggle-active
   * @access Admin only
   */
  static async toggleProductActive(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['Product ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }
      const { isActive } = req.body;
      const product = await ProductService.toggleActiveStatus(id, isActive);
      return ResponseUtil.success(res, { product });
    } catch (error) {
      if (error instanceof Error && error.message === 'product.productNotFound') {
        return ResponseUtil.fail(
          res,
          { product: ['Product not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to toggle product status',
        'PRODUCT_UPDATE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Toggle product featured status
   * @route PATCH /api/admin/products/:id/featured
   * @access Admin only
   */
  static async toggleProductFeatured(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['Product ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }
      const { isFeatured } = req.body;
      const product = await ProductService.toggleFeaturedStatus(id, isFeatured);
      return ResponseUtil.success(res, { product });
    } catch (error) {
      if (error instanceof Error && error.message === 'product.productNotFound') {
        return ResponseUtil.fail(
          res,
          { product: ['Product not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to toggle product featured status',
        'PRODUCT_UPDATE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Toggle product sponsored status
   * @route PATCH /api/admin/products/:id/sponsored
   * @access Admin only
   */
  static async toggleProductSponsored(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['Product ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }
      const { isSponsored } = req.body;
      const product = await ProductService.toggleSponsoredStatus(id, isSponsored);
      return ResponseUtil.success(res, { product });
    } catch (error) {
      if (error instanceof Error && error.message === 'product.productNotFound') {
        return ResponseUtil.fail(
          res,
          { product: ['Product not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to toggle product sponsored status',
        'PRODUCT_UPDATE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ============== ORDER MANAGEMENT ==============

  /**
   * Get all orders (Admin)
   * @route GET /api/admin/orders
   * @access Admin only
   */
  static async getAllOrders(req: Request, res: Response): Promise<Response> {
    try {
      const {
        page = 1,
        limit = 20,
        orderStatus,
        paymentStatus,
        search,
        startDate,
        endDate,
      } = req.query;

      const filters: any = {};
      if (orderStatus) filters.orderStatus = orderStatus as OrderStatus;
      if (paymentStatus) filters.paymentStatus = paymentStatus as PaymentStatus;
      if (search) filters.search = search as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const result = await OrderService.getAllOrdersAdmin(
        Number(page),
        Number(limit),
        filters
      );

      return ResponseUtil.success(res, result);
    } catch (error) {
      return ResponseUtil.error(
        res,
        'Failed to retrieve orders',
        'ORDER_FETCH_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get order by ID (Admin)
   * @route GET /api/admin/orders/:id
   * @access Admin only
   */
  static async getOrderById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['Order ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }
      const order = await OrderService.getOrderByIdAdmin(id);
      return ResponseUtil.success(res, { order });
    } catch (error) {
      if (error instanceof Error && error.message === 'order.orderNotFound') {
        return ResponseUtil.fail(
          res,
          { order: ['Order not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to retrieve order',
        'ORDER_FETCH_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Update order status
   * @route PATCH /api/admin/orders/:id/status
   * @access Admin only
   */
  static async updateOrderStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['Order ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }
      const { orderStatus } = req.body;
      const order = await OrderService.updateOrderStatus(id, orderStatus);
      return ResponseUtil.success(res, { order });
    } catch (error) {
      if (error instanceof Error && error.message === 'order.orderNotFound') {
        return ResponseUtil.fail(
          res,
          { order: ['Order not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to update order status',
        'ORDER_UPDATE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Update payment status
   * @route PATCH /api/admin/orders/:id/payment-status
   * @access Admin only
   */
  static async updatePaymentStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['Order ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }
      const { paymentStatus } = req.body;
      const order = await OrderService.updatePaymentStatus(id, paymentStatus);
      return ResponseUtil.success(res, { order });
    } catch (error) {
      if (error instanceof Error && error.message === 'order.orderNotFound') {
        return ResponseUtil.fail(
          res,
          { order: ['Order not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to update payment status',
        'ORDER_UPDATE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Delete order
   * @route DELETE /api/admin/orders/:id
   * @access Admin only
   */
  static async deleteOrder(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['Order ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }
      await OrderService.deleteOrder(id);
      return ResponseUtil.success(res, { message: 'Order deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'order.orderNotFound') {
        return ResponseUtil.fail(
          res,
          { order: ['Order not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to delete order',
        'ORDER_DELETE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
