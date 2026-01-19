import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { OrderStatus, PaymentStatus } from '../types/order.types.js';

/**
 * Analytics Service
 * Provides dashboard statistics and analytics for admin
 */
export class AnalyticsService {
  /**
   * Get comprehensive dashboard statistics
   * @returns Dashboard overview statistics
   */
  static async getDashboardStats(): Promise<{
    revenue: RevenueStats;
    orders: OrderStats;
    products: ProductStats;
    users: UserStats;
    recentOrders: any[];
    topProducts: any[];
  }> {
    const [revenue, orders, products, users, recentOrders, topProducts] =
      await Promise.all([
        this.getRevenueStats(),
        this.getOrderStats(),
        this.getProductStats(),
        this.getUserStats(),
        this.getRecentOrders(5),
        this.getTopSellingProducts(5),
      ]);

    return {
      revenue,
      orders,
      products,
      users,
      recentOrders,
      topProducts,
    };
  }

  /**
   * Get revenue statistics
   * @returns Revenue statistics including total, monthly, daily
   */
  static async getRevenueStats(): Promise<RevenueStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));

    // Aggregate revenue from completed orders
    const [totalRevenue, monthlyRevenue, lastMonthRevenue, dailyRevenue] =
      await Promise.all([
        Order.aggregate([
          {
            $match: {
              paymentStatus: PaymentStatus.PAID,
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalAmount' },
            },
          },
        ]),
        Order.aggregate([
          {
            $match: {
              paymentStatus: PaymentStatus.PAID,
              createdAt: { $gte: startOfMonth },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalAmount' },
            },
          },
        ]),
        Order.aggregate([
          {
            $match: {
              paymentStatus: PaymentStatus.PAID,
              createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalAmount' },
            },
          },
        ]),
        Order.aggregate([
          {
            $match: {
              paymentStatus: PaymentStatus.PAID,
              createdAt: { $gte: startOfToday },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalAmount' },
            },
          },
        ]),
      ]);

    const currentMonthRevenue = monthlyRevenue[0]?.total || 0;
    const previousMonthRevenue = lastMonthRevenue[0]?.total || 0;
    const monthlyGrowth =
      previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
          100
        : 0;

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: currentMonthRevenue,
      dailyRevenue: dailyRevenue[0]?.total || 0,
      monthlyGrowth: parseFloat(monthlyGrowth.toFixed(2)),
    };
  }

  /**
   * Get order statistics
   * @returns Order statistics including counts by status
   */
  static async getOrderStats(): Promise<OrderStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      monthlyOrders,
      dailyOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: OrderStatus.PENDING }),
      Order.countDocuments({ orderStatus: OrderStatus.PROCESSING }),
      Order.countDocuments({ orderStatus: OrderStatus.DELIVERED }),
      Order.countDocuments({ orderStatus: OrderStatus.CANCELLED }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      monthlyOrders,
      dailyOrders,
    };
  }

  /**
   * Get product statistics
   * @returns Product statistics including counts and inventory info
   */
  static async getProductStats(): Promise<ProductStats> {
    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      inStockProducts,
      outOfStockProducts,
      lowStockProducts,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: false }),
      Product.countDocuments({ inStock: true }),
      Product.countDocuments({ inStock: false }),
      Product.countDocuments({ stockQuantity: { $lte: 10, $gt: 0 } }),
    ]);

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      inStockProducts,
      outOfStockProducts,
      lowStockProducts,
    };
  }

  /**
   * Get user statistics
   * @returns User statistics
   */
  static async getUserStats(): Promise<UserStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, activeUsers, monthlyNewUsers] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', isActive: true }),
      User.countDocuments({
        role: 'customer',
        createdAt: { $gte: startOfMonth },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      monthlyNewUsers,
    };
  }

  /**
   * Get recent orders
   * @param limit - Number of orders to retrieve
   * @returns Recent orders with user and product details
   */
  static async getRecentOrders(limit: number = 10): Promise<any[]> {
    return await Order.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(
        'orderNumber totalAmount orderStatus paymentStatus createdAt items'
      )
      .lean();
  }

  /**
   * Get top selling products
   * @param limit - Number of products to retrieve
   * @returns Top selling products
   */
  static async getTopSellingProducts(limit: number = 10): Promise<any[]> {
    const topProducts = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: OrderStatus.CANCELLED },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          _id: '$productDetails._id',
          name: '$productDetails.name',
          nameAr: '$productDetails.nameAr',
          price: '$productDetails.price',
          image: { $arrayElemAt: ['$productDetails.images', 0] },
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
    ]);

    return topProducts;
  }

  /**
   * Get revenue trends over time
   * @param days - Number of days to analyze
   * @returns Daily revenue data
   */
  static async getRevenueTrend(days: number = 30): Promise<RevenueTrend[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenueTrend = await Order.aggregate([
      {
        $match: {
          paymentStatus: PaymentStatus.PAID,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          revenue: 1,
          orders: 1,
        },
      },
    ]);

    return revenueTrend;
  }

  /**
   * Get sales by category
   * @returns Category-wise sales data
   */
  static async getSalesByCategory(): Promise<CategorySales[]> {
    const categorySales = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: OrderStatus.CANCELLED },
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category._id',
          categoryName: { $first: '$category.name' },
          totalRevenue: { $sum: '$items.totalPrice' },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          categoryName: 1,
          totalRevenue: 1,
          totalOrders: 1,
          totalQuantity: 1,
        },
      },
    ]);

    return categorySales;
  }
}

// Type definitions
export interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  monthlyGrowth: number;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  monthlyOrders: number;
  dailyOrders: number;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  monthlyNewUsers: number;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
  orders: number;
}

export interface CategorySales {
  categoryId: string;
  categoryName: string;
  totalRevenue: number;
  totalOrders: number;
  totalQuantity: number;
}
