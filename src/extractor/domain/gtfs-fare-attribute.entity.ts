import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Atributos de tarifa (GTFS fare_attributes.txt)
 * Define preço, moeda e regras de transferência.
 */
@Entity('gtfs_fare_attributes')
export class GtfsFareAttribute {
  @PrimaryColumn()
  fare_id: string;

  @Column('decimal', { precision: 10, scale: 6 })
  price: number;

  @Column()
  currency_type: string;

  @Column()
  payment_method: number;

  @Column({ nullable: true })
  transfers: string;

  @Column({ nullable: true })
  transfer_duration: number;
}
