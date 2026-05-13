import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Rotas/linhas de transporte (GTFS routes.txt)
 * Cada rota é uma linha de ônibus com cor e tipo de serviço.
 */
@Entity('gtfs_routes')
export class GtfsRoute {
  @PrimaryColumn()
  route_id: string;

  @Column()
  agency_id: string;

  @Column()
  route_short_name: string;

  @Column()
  route_long_name: string;

  @Column()
  route_type: number;

  @Column({ nullable: true })
  route_color: string;

  @Column({ nullable: true })
  route_text_color: string;
}
