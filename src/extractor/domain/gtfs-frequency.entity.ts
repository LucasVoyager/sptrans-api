import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/**
 * Frequências de operação (GTFS frequencies.txt)
 * Define o intervalo entre viagens (headway) por faixa horária.
 */
@Entity('gtfs_frequencies')
@Index(['trip_id', 'start_time'], { unique: true })
export class GtfsFrequency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  trip_id: string;

  @Column()
  start_time: string;

  @Column()
  end_time: string;

  @Column()
  headway_secs: number;
}
