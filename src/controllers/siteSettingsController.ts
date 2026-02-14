import type { Request, Response, NextFunction } from 'express';
import { SiteSettingsService } from '../services/siteSettingsService.js';
import { ResponseUtil } from '../utils/response.util.js';

export class SiteSettingsController {
  // ── Public ──────────────────────────────────────────────

  /** GET /api/settings/theme */
  static async getActiveTheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await SiteSettingsService.getActiveTheme();
      ResponseUtil.success(res, data);
    } catch (err) {
      next(err);
    }
  }

  // ── Admin ────────────────────────────────────────────────

  /** GET /api/admin/settings */
  static async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await SiteSettingsService.getSettings();
      ResponseUtil.success(res, { settings });
    } catch (err) {
      next(err);
    }
  }

  /** PATCH /api/admin/settings/theme  body: { activeTheme: string } */
  static async setActiveTheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { activeTheme } = req.body as { activeTheme: string };
      const adminId = (req as any).user!.userId as string;
      const settings = await SiteSettingsService.setActiveTheme(activeTheme, adminId);
      ResponseUtil.success(res, { settings });
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/admin/settings/themes  body: { key, nameAr, nameEn, isEnabled? } */
  static async addTheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = (req as any).user!.userId as string;
      const theme = {
        key: req.body.key as string,
        nameAr: req.body.nameAr as string,
        nameEn: req.body.nameEn as string,
        isEnabled: req.body.isEnabled !== false,
      };
      const settings = await SiteSettingsService.addTheme(theme, adminId);
      ResponseUtil.success(res, { settings }, 201);
    } catch (err) {
      next(err);
    }
  }

  /** PUT /api/admin/settings/themes/:key  body: { nameAr?, nameEn?, isEnabled? } */
  static async updateTheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const themeKey = req.params['key'] as string;
      const adminId = (req as any).user!.userId as string;
      const updates: Record<string, unknown> = {};
      if (req.body.nameAr !== undefined)    updates.nameAr    = req.body.nameAr;
      if (req.body.nameEn !== undefined)    updates.nameEn    = req.body.nameEn;
      if (req.body.isEnabled !== undefined) updates.isEnabled = req.body.isEnabled;
      const settings = await SiteSettingsService.updateTheme(themeKey, updates, adminId);
      ResponseUtil.success(res, { settings });
    } catch (err) {
      next(err);
    }
  }

  /** DELETE /api/admin/settings/themes/:key */
  static async deleteTheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const themeKey = req.params['key'] as string;
      const adminId = (req as any).user!.userId as string;
      const settings = await SiteSettingsService.deleteTheme(themeKey, adminId);
      ResponseUtil.success(res, { settings });
    } catch (err) {
      next(err);
    }
  }
}
