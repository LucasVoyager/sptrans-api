import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Agência de transporte (GTFS agency.txt)
 * Mapeia os dados da agência que opera o transporte público.
 */
@Entity('gtfs_agency')
export class GtfsAgency {
  @PrimaryColumn()
  agency_id: string;

  @Column()
  agency_name: string;

  @Column({ nullable: true })
  agency_url: string;

  @Column({ nullable: true })
  agency_timezone: string;

  @Column({ nullable: true })
  agency_lang: string;
}
