import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { AssetType } from '../entities/asset-type.entity';

@Injectable()
export class AssetCodeService {

  constructor(
    private readonly dataSource: DataSource,
  ){}
  
  async generateCode(assetType: AssetType ,regionCode: string, manager?: EntityManager ) {
    const normalizedRegion = regionCode.trim().toUpperCase();

    if(!/^[A-Z]{2,4}$/.test(normalizedRegion)){
      throw new BadRequestException('Region code must contain 2 to 4 uppercase letters.')
    }

    const sequence = await this.getNextSequence(assetType.id, normalizedRegion, manager);

    return this.formatCode(assetType.qualifier, normalizedRegion, sequence )
    
  }

  private async getNextSequence( assetTypeId: string, regionCode: string, manager?: EntityManager): Promise<number> {

    const sql = `
      INSERT INTO asset_code_sequences (
        asset_type_id,
        region_code,
        last_sequence
      )
      VALUES ($1, $2, 1)

      ON CONFLICT (asset_type_id, region_code)

      DO UPDATE SET
        last_sequence = asset_code_sequences.last_sequence + 1,
        updated_at = NOW()

      RETURNING last_sequence
    `;

    const result = manager ? 
      await manager.query(sql, [assetTypeId, regionCode])
      : await this.dataSource.query(sql, [assetTypeId, regionCode]);

    return Number(result[0].last_sequence);
  }

  private formatCode( qualifier: string, regionCode: string, sequence: number,): string {
    const normalizedQualifer = qualifier.trim().toUpperCase();

    if(!normalizedQualifer) {
      throw new BadRequestException(
        `Asset Type qulaifier is required for code generation.`
      );
    }
    
    return `${normalizedQualifer}-${regionCode}-${this.pad(sequence,3)}`
  }

  private pad( value: number, length: number ): string {
    return value.toString().padStart(length, '0');
  }

}