import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/**
 * Horários de chegada/partida em cada parada (GTFS stop_times.txt)
 * Usa PrimaryGeneratedColumn pois não há PK natural — a combinação
 * (trip_id, stop_sequence) é a chave lógica.
 */
@Entity('gtfs_stop_times')
@Index(['trip_id', 'stop_sequence'], { unique: true })
export class GtfsStopTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  trip_id: string;

  @Column()
  arrival_time: string;

  @Column()
  departure_time: string;

  @Column()
  @Index()
  stop_id: string;

  @Column()
  stop_sequence: number;
}
