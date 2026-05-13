import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Pontos de parada (GTFS stops.txt)
 * Coordenadas geográficas e nome de cada parada.
 */
@Entity('gtfs_stops')
export class GtfsStop {
  @PrimaryColumn()
  stop_id: string;

  @Column()
  stop_name: string;

  @Column({ nullable: true })
  stop_desc: string;

  @Column('double precision')
  stop_lat: number;

  @Column('double precision')
  stop_lon: number;
}
