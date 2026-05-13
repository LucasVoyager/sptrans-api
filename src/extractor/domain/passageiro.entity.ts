import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/**
 * Relatório de passageiros (PassageiroSpTransTotal.csv)
 * Dados diários de contagem de passageiros por linha/empresa.
 */
@Entity('passageiros')
@Index(['data', 'linha'], { unique: true })
export class Passageiro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  @Index()
  data: Date;

  @Column()
  grupo: string;

  @Column()
  lote: string;

  @Column()
  empresa: string;

  @Column()
  @Index()
  linha: string;

  @Column({ default: 0 })
  pagantes_dinheiro: number;

  @Column({ default: 0 })
  pagantes_comum_vt: number;

  @Column({ default: 0 })
  pagantes_bu_comum_mensal: number;

  @Column({ default: 0 })
  pagantes_estudante: number;

  @Column({ default: 0 })
  pagantes_bu_est_mensal: number;

  @Column({ default: 0 })
  pagantes_bu_vt_mensal: number;

  @Column({ default: 0 })
  pagantes_total: number;

  @Column({ default: 0 })
  integracao_onibus: number;

  @Column({ default: 0 })
  gratuidade: number;

  @Column({ default: 0 })
  gratuidade_estudante: number;

  @Column({ default: 0 })
  total_transportados: number;
}
