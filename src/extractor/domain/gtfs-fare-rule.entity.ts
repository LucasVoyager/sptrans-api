import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/**
 * Regras de tarifa (GTFS fare_rules.txt)
 * Associa tarifas a rotas e zonas.
 */
@Entity('gtfs_fare_rules')
@Index(['fare_id', 'route_id'])
export class GtfsFareRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fare_id: string;

  @Column({ nullable: true })
  route_id: string;

  @Column({ nullable: true })
  origin_id: string;

  @Column({ nullable: true })
  destination_id: string;

  @Column({ nullable: true })
  contains_id: string;
}
