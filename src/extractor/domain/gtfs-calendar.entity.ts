import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Calendário de operação (GTFS calendar.txt)
 * Define quais dias da semana cada service_id opera.
 */
@Entity('gtfs_calendar')
export class GtfsCalendar {
  @PrimaryColumn()
  service_id: string;

  @Column()
  monday: number;

  @Column()
  tuesday: number;

  @Column()
  wednesday: number;

  @Column()
  thursday: number;

  @Column()
  friday: number;

  @Column()
  saturday: number;

  @Column()
  sunday: number;

  @Column()
  start_date: string;

  @Column()
  end_date: string;
}
