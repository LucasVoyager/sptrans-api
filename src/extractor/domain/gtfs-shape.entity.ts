import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/**
 * Traçados geográficos das linhas (GTFS shapes.txt)
 * Arquivo grande (~60MB, ~1M+ linhas). Inserido em batch.
 */
@Entity('gtfs_shapes')
@Index(['shape_id', 'shape_pt_sequence'], { unique: true })
export class GtfsShape {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  shape_id: string;

  @Column('double precision')
  shape_pt_lat: number;

  @Column('double precision')
  shape_pt_lon: number;

  @Column()
  shape_pt_sequence: number;

  @Column('double precision', { nullable: true })
  shape_dist_traveled: number;
}
