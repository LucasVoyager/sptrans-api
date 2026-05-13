import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Viagens (GTFS trips.txt)
 * Cada trip é uma instância de operação de uma rota.
 */
@Entity('gtfs_trips')
export class GtfsTrip {
  @PrimaryColumn()
  trip_id: string;

  @Column()
  route_id: string;

  @Column()
  service_id: string;

  @Column({ nullable: true })
  trip_headsign: string;

  @Column()
  direction_id: number;

  @Column({ nullable: true })
  shape_id: string;
}
