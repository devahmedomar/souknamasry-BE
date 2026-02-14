import { SiteSettings } from '../models/SiteSettings.js';
import { DEFAULT_THEMES } from '../schemas/siteSettings.schema.js';
import type { ITheme } from '../types/siteSettings.types.js';

export class SiteSettingsService {
  /**
   * Returns the singleton SiteSettings document.
   * Creates it with defaults if it doesn't exist yet.
   */
  static async getSettings() {
    let settings = await SiteSettings.findOne().lean();
    if (!settings) {
      const created = await SiteSettings.create({
        activeTheme: 'normal',
        themes: DEFAULT_THEMES,
      });
      settings = created.toObject();
    }
    return settings;
  }

  /**
   * Returns only the active theme info (for public use).
   */
  static async getActiveTheme() {
    const settings = await SiteSettingsService.getSettings();
    const theme = settings.themes.find((t) => t.key === settings.activeTheme);
    return {
      activeTheme: settings.activeTheme,
      theme: theme ?? null,
    };
  }

  /**
   * Sets the active theme.
   * Validates that the theme key exists and is enabled.
   */
  static async setActiveTheme(themeKey: string, adminId: string) {
    const settings = await SiteSettingsService.getSettings();
    const theme = settings.themes.find((t) => t.key === themeKey);

    if (!theme) {
      throw new Error(`Theme "${themeKey}" not found`);
    }
    if (!theme.isEnabled) {
      throw new Error(`Theme "${themeKey}" is disabled`);
    }

    const updated = await SiteSettings.findOneAndUpdate(
      {},
      { activeTheme: themeKey, updatedBy: adminId },
      { new: true, lean: true }
    );
    return updated;
  }

  /**
   * Adds a new custom theme.
   * Key must be unique.
   */
  static async addTheme(theme: ITheme, adminId: string) {
    const settings = await SiteSettingsService.getSettings();
    const exists = settings.themes.some((t) => t.key === theme.key);

    if (exists) {
      throw new Error(`Theme key "${theme.key}" already exists`);
    }

    const updated = await SiteSettings.findOneAndUpdate(
      {},
      { $push: { themes: theme }, $set: { updatedBy: adminId } },
      { new: true, lean: true }
    );
    return updated;
  }

  /**
   * Updates an existing theme's name or enabled status.
   * Cannot change the key.
   */
  static async updateTheme(
    themeKey: string,
    updates: Partial<Omit<ITheme, 'key'>>,
    adminId: string
  ) {
    const settings = await SiteSettingsService.getSettings();
    const themeIndex = settings.themes.findIndex((t) => t.key === themeKey);

    if (themeIndex === -1) {
      throw new Error(`Theme "${themeKey}" not found`);
    }

    // Cannot disable the currently active theme
    if (
      updates.isEnabled === false &&
      settings.activeTheme === themeKey
    ) {
      throw new Error(`Cannot disable the currently active theme`);
    }

    const setFields: Record<string, unknown> = { updatedBy: adminId };
    if (updates.nameAr !== undefined) setFields[`themes.${themeIndex}.nameAr`] = updates.nameAr;
    if (updates.nameEn !== undefined) setFields[`themes.${themeIndex}.nameEn`] = updates.nameEn;
    if (updates.isEnabled !== undefined) setFields[`themes.${themeIndex}.isEnabled`] = updates.isEnabled;

    const updated = await SiteSettings.findOneAndUpdate(
      {},
      { $set: setFields },
      { new: true, lean: true }
    );
    return updated;
  }

  /**
   * Removes a custom theme.
   * Cannot remove built-in themes or the currently active theme.
   */
  static async deleteTheme(themeKey: string, adminId: string) {
    const builtInKeys = DEFAULT_THEMES.map((t) => t.key);

    if (builtInKeys.includes(themeKey)) {
      throw new Error(`Cannot delete built-in theme "${themeKey}"`);
    }

    const settings = await SiteSettingsService.getSettings();

    if (settings.activeTheme === themeKey) {
      throw new Error(`Cannot delete the currently active theme`);
    }

    const exists = settings.themes.some((t) => t.key === themeKey);
    if (!exists) {
      throw new Error(`Theme "${themeKey}" not found`);
    }

    const updated = await SiteSettings.findOneAndUpdate(
      {},
      { $pull: { themes: { key: themeKey } }, $set: { updatedBy: adminId } },
      { new: true, lean: true }
    );
    return updated;
  }
}
