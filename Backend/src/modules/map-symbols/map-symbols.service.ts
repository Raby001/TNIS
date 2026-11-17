import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { existsSync, unlinkSync } from 'fs';
import { basename, join } from 'path';

import { AssetType } from '../assets/entities/asset-type.entity';
import { Site } from '../sites/entities/site.entity';

import { AssetTypeIcon } from './entities/asset-type-icon.entity';
import { SiteIconSetting } from './entities/site-icon-setting.entity';
import { SiteIconOverride } from './entities/site-icon-override.entity';
import type { Multer } from 'multer';

@Injectable()
export class MapSymbolsService {
  private readonly uploadDirectory = join(
    process.cwd(),
    'uploads',
    'map-symbols',
  );

  constructor(
    @InjectRepository(AssetType)
    private readonly assetTypeRepository: Repository<AssetType>,

    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,

    @InjectRepository(AssetTypeIcon)
    private readonly assetTypeIconRepository: Repository<AssetTypeIcon>,

    @InjectRepository(SiteIconSetting)
    private readonly siteIconSettingRepository: Repository<SiteIconSetting>,

    @InjectRepository(SiteIconOverride)
    private readonly siteIconOverrideRepository: Repository<SiteIconOverride>,
  ) {}

  private getIconUrl(filename: string): string {
    return `/uploads/map-symbols/${filename}`;
  }

  private deleteIconFile(iconUrl?: string | null): void {
    if (!iconUrl) {
      return;
    }

    const filename = basename(iconUrl);

    const filePath = join(
      this.uploadDirectory,
      filename,
    );

    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }

  // =========================================================
  // Asset type icons
  // =========================================================

  async findAllAssetTypeIcons() {
    const assetTypes = await this.assetTypeRepository.find({
      order: {
        name: 'ASC',
      },
    });

    const icons = await this.assetTypeIconRepository.find();

    const iconMap = new Map(
      icons.map((icon) => [
        icon.assetTypeId,
        icon,
      ]),
    );

    return assetTypes.map((assetType) => {
      const icon = iconMap.get(assetType.id);

      return {
        assetTypeId: assetType.id,
        assetType: assetType.name,
        qualifier: assetType.qualifier,
        icon: icon
          ? {
              url: icon.iconUrl,
              mimeType: icon.mimeType,
            }
          : null,
      };
    });
  }

  async findAssetTypeIcon(assetTypeId: string) {
    const assetType = await this.assetTypeRepository.findOne({
      where: {
        id: assetTypeId,
      },
    });

    if (!assetType) {
      throw new NotFoundException(
        `Asset type with ID ${assetTypeId} not found.`,
      );
    }

    const icon = await this.assetTypeIconRepository.findOne({
      where: {
        assetTypeId,
      },
    });

    return {
      assetTypeId: assetType.id,
      assetType: assetType.name,
      qualifier: assetType.qualifier,
      icon: icon
        ? {
            url: icon.iconUrl,
            mimeType: icon.mimeType,
          }
        : null,
    };
  }

  async updateAssetTypeIcon(
    assetTypeId: string,
    file: Express.Multer.File,
    userId: string,
  ) {
    const assetType = await this.assetTypeRepository.findOne({
      where: {
        id: assetTypeId,
      },
    });

    if (!assetType) {
      throw new NotFoundException(
        `Asset type with ID ${assetTypeId} not found.`,
      );
    }

    const existingIcon = await this.assetTypeIconRepository.findOne({
      where: {
        assetTypeId,
      },
    });

    const iconUrl = this.getIconUrl(file.filename);

    const icon = existingIcon
      ? this.assetTypeIconRepository.merge(existingIcon, {
          iconUrl,
          mimeType: file.mimetype,
          updatedById: userId,
        })
      : this.assetTypeIconRepository.create({
          assetTypeId,
          iconUrl,
          mimeType: file.mimetype,
          updatedById: userId,
        });

    const savedIcon = await this.assetTypeIconRepository.save(icon);

    if (existingIcon) {
      this.deleteIconFile(existingIcon.iconUrl);
    }

    return {
      message: 'Asset type icon updated successfully.',
      assetTypeId,
      assetType: assetType.name,
      icon: {
        url: savedIcon.iconUrl,
        mimeType: savedIcon.mimeType,
      },
    };
  }

  async resetAssetTypeIcon(assetTypeId: string) {
    const assetType = await this.assetTypeRepository.findOne({
      where: {
        id: assetTypeId,
      },
    });

    if (!assetType) {
      throw new NotFoundException(
        `Asset type with ID ${assetTypeId} not found.`,
      );
    }

    const existingIcon = await this.assetTypeIconRepository.findOne({
      where: {
        assetTypeId,
      },
    });

    if (existingIcon) {
      await this.assetTypeIconRepository.remove(existingIcon);
      this.deleteIconFile(existingIcon.iconUrl);
    }

    return {
      message: 'Asset type icon reset successfully.',
      assetTypeId,
      assetType: assetType.name,
      icon: null,
    };
  }

  // =========================================================
  // Global default site icon
  // =========================================================

  async findDefaultSiteIcon() {
    const setting = await this.siteIconSettingRepository.findOne({
      where: {
        settingKey: 'DEFAULT',
      },
    });

    return {
      icon: setting
        ? {
            url: setting.iconUrl,
            mimeType: setting.mimeType,
          }
        : null,
    };
  }

  async updateDefaultSiteIcon(
    file: Express.Multer.File,
    userId: string,
  ) {
    const existingSetting = await this.siteIconSettingRepository.findOne({
      where: {
        settingKey: 'DEFAULT',
      },
    });

    const iconUrl = this.getIconUrl(file.filename);

    const setting = existingSetting
      ? this.siteIconSettingRepository.merge(existingSetting, {
          iconUrl,
          mimeType: file.mimetype,
          updatedById: userId,
        })
      : this.siteIconSettingRepository.create({
          settingKey: 'DEFAULT',
          iconUrl,
          mimeType: file.mimetype,
          updatedById: userId,
        });

    const savedSetting = await this.siteIconSettingRepository.save(setting);

    if (existingSetting) {
      this.deleteIconFile(existingSetting.iconUrl);
    }

    return {
      message: 'Default site icon updated successfully.',
      icon: {
        url: savedSetting.iconUrl,
        mimeType: savedSetting.mimeType,
      },
    };
  }

  // =========================================================
  // Individual site icon
  // =========================================================

  async findSiteIcon(siteId: string) {
    const site = await this.siteRepository.findOne({
      where: {
        id: siteId,
      },
    });

    if (!site) {
      throw new NotFoundException(
        `Site with ID ${siteId} not found.`,
      );
    }

    const override = await this.siteIconOverrideRepository.findOne({
      where: {
        siteId,
      },
    });

    if (override) {
      return {
        siteId,
        siteName: site.name,
        source: 'SITE_OVERRIDE',
        icon: {
          url: override.iconUrl,
          mimeType: override.mimeType,
        },
      };
    }

    const defaultSetting = await this.siteIconSettingRepository.findOne({
      where: {
        settingKey: 'DEFAULT',
      },
    });

    return {
      siteId,
      siteName: site.name,
      source: 'DEFAULT',
      icon: defaultSetting
        ? {
            url: defaultSetting.iconUrl,
            mimeType: defaultSetting.mimeType,
          }
        : null,
    };
  }

  async updateSiteIcon(
    siteId: string,
    file: Express.Multer.File,
    userId: string,
  ) {
    const site = await this.siteRepository.findOne({
      where: {
        id: siteId,
      },
    });

    if (!site) {
      throw new NotFoundException(
        `Site with ID ${siteId} not found.`,
      );
    }

    const existingOverride = await this.siteIconOverrideRepository.findOne({
      where: {
        siteId,
      },
    });

    const iconUrl = this.getIconUrl(file.filename);

    const override = existingOverride
      ? this.siteIconOverrideRepository.merge(existingOverride, {
          iconUrl,
          mimeType: file.mimetype,
          updatedById: userId,
        })
      : this.siteIconOverrideRepository.create({
          siteId,
          iconUrl,
          mimeType: file.mimetype,
          updatedById: userId,
        });

    const savedOverride = await this.siteIconOverrideRepository.save(override);

    if (existingOverride) {
      this.deleteIconFile(existingOverride.iconUrl);
    }

    return {
      message: 'Site icon updated successfully.',
      siteId,
      siteName: site.name,
      source: 'SITE_OVERRIDE',
      icon: {
        url: savedOverride.iconUrl,
        mimeType: savedOverride.mimeType,
      },
    };
  }

  async resetSiteIcon(siteId: string) {
    const site = await this.siteRepository.findOne({
      where: {
        id: siteId,
      },
    });

    if (!site) {
      throw new NotFoundException(
        `Site with ID ${siteId} not found.`,
      );
    }

    const existingOverride = await this.siteIconOverrideRepository.findOne({
      where: {
        siteId,
      },
    });

    if (existingOverride) {
      await this.siteIconOverrideRepository.remove(existingOverride);
      this.deleteIconFile(existingOverride.iconUrl);
    }

    return {
      message: 'Site icon reset successfully. The default site icon will be used.',
      siteId,
      siteName: site.name,
      source: 'DEFAULT',
    };
  }
}