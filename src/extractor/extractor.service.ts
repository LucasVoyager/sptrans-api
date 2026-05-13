import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as path from 'path';

import { ZipExtractorService } from './infra/zip-extractor.service';
import { CsvParserService } from './infra/csv-parser.service';

import { GtfsAgency } from './domain/gtfs-agency.entity';
import { GtfsRoute } from './domain/gtfs-route.entity';
import { GtfsStop } from './domain/gtfs-stop.entity';
import { GtfsTrip } from './domain/gtfs-trip.entity';
import { GtfsStopTime } from './domain/gtfs-stop-time.entity';
import { GtfsShape } from './domain/gtfs-shape.entity';
import { GtfsCalendar } from './domain/gtfs-calendar.entity';
import { GtfsFrequency } from './domain/gtfs-frequency.entity';
import { GtfsFareAttribute } from './domain/gtfs-fare-attribute.entity';
import { GtfsFareRule } from './domain/gtfs-fare-rule.entity';
import { Passageiro } from './domain/passageiro.entity';

/** Resultado do processamento de um arquivo */
export interface ProcessingResult {
  tabela: string;
  registros: number;
  duracao_ms: number;
  status: 'ok' | 'erro';
  erro?: string;
}

/** Status geral do pipeline */
export interface PipelineStatus {
  inicio: Date;
  fim?: Date;
  duracao_total_ms?: number;
  resultados: ProcessingResult[];
  total_registros: number;
  status: 'em_andamento' | 'concluido' | 'erro';
}

/**
 * Serviço que orquestra o pipeline ETL:
 * 1. Extrai ZIP (se GTFS) ou lê CSV direto (se passageiros)
 * 2. Parseia cada arquivo CSV em streaming
 * 3. Mapeia para entidades TypeORM
 * 4. Insere no banco em batches
 */
@Injectable()
export class ExtractorService {
  private readonly logger = new Logger(ExtractorService.name);
  private lastStatus: PipelineStatus | null = null;

  /** Mapeamento: nome do arquivo GTFS → { repositório, mapeador } */
  private readonly gtfsMapping: Record<string, {
    repo: Repository<any>;
    mapper: (row: Record<string, string>) => any;
    tableName: string;
  }>;

  constructor(
    @InjectRepository(GtfsAgency) private agencyRepo: Repository<GtfsAgency>,
    @InjectRepository(GtfsRoute) private routeRepo: Repository<GtfsRoute>,
    @InjectRepository(GtfsStop) private stopRepo: Repository<GtfsStop>,
    @InjectRepository(GtfsTrip) private tripRepo: Repository<GtfsTrip>,
    @InjectRepository(GtfsStopTime) private stopTimeRepo: Repository<GtfsStopTime>,
    @InjectRepository(GtfsShape) private shapeRepo: Repository<GtfsShape>,
    @InjectRepository(GtfsCalendar) private calendarRepo: Repository<GtfsCalendar>,
    @InjectRepository(GtfsFrequency) private frequencyRepo: Repository<GtfsFrequency>,
    @InjectRepository(GtfsFareAttribute) private fareAttrRepo: Repository<GtfsFareAttribute>,
    @InjectRepository(GtfsFareRule) private fareRuleRepo: Repository<GtfsFareRule>,
    @InjectRepository(Passageiro) private passageiroRepo: Repository<Passageiro>,
    private readonly zipExtractor: ZipExtractorService,
    private readonly csvParser: CsvParserService,
    private readonly dataSource: DataSource,
  ) {
    this.gtfsMapping = {
      'agency.txt': {
        repo: this.agencyRepo,
        tableName: 'gtfs_agency',
        mapper: (row) => ({
          agency_id: row.agency_id,
          agency_name: row.agency_name,
          agency_url: row.agency_url || null,
          agency_timezone: row.agency_timezone || null,
          agency_lang: row.agency_lang || null,
        }),
      },
      'routes.txt': {
        repo: this.routeRepo,
        tableName: 'gtfs_routes',
        mapper: (row) => ({
          route_id: row.route_id,
          agency_id: row.agency_id,
          route_short_name: row.route_short_name,
          route_long_name: row.route_long_name,
          route_type: parseInt(row.route_type, 10) || 0,
          route_color: row.route_color || null,
          route_text_color: row.route_text_color || null,
        }),
      },
      'stops.txt': {
        repo: this.stopRepo,
        tableName: 'gtfs_stops',
        mapper: (row) => ({
          stop_id: row.stop_id,
          stop_name: row.stop_name,
          stop_desc: row.stop_desc || null,
          stop_lat: parseFloat(row.stop_lat) || 0,
          stop_lon: parseFloat(row.stop_lon) || 0,
        }),
      },
      'trips.txt': {
        repo: this.tripRepo,
        tableName: 'gtfs_trips',
        mapper: (row) => ({
          trip_id: row.trip_id,
          route_id: row.route_id,
          service_id: row.service_id,
          trip_headsign: row.trip_headsign || null,
          direction_id: parseInt(row.direction_id, 10) || 0,
          shape_id: row.shape_id || null,
        }),
      },
      'stop_times.txt': {
        repo: this.stopTimeRepo,
        tableName: 'gtfs_stop_times',
        mapper: (row) => ({
          trip_id: row.trip_id,
          arrival_time: row.arrival_time,
          departure_time: row.departure_time,
          stop_id: row.stop_id,
          stop_sequence: parseInt(row.stop_sequence, 10) || 0,
        }),
      },
      'shapes.txt': {
        repo: this.shapeRepo,
        tableName: 'gtfs_shapes',
        mapper: (row) => ({
          shape_id: row.shape_id,
          shape_pt_lat: parseFloat(row.shape_pt_lat) || 0,
          shape_pt_lon: parseFloat(row.shape_pt_lon) || 0,
          shape_pt_sequence: parseInt(row.shape_pt_sequence, 10) || 0,
          shape_dist_traveled: row.shape_dist_traveled ? parseFloat(row.shape_dist_traveled) : null,
        }),
      },
      'calendar.txt': {
        repo: this.calendarRepo,
        tableName: 'gtfs_calendar',
        mapper: (row) => ({
          service_id: row.service_id,
          monday: parseInt(row.monday, 10) || 0,
          tuesday: parseInt(row.tuesday, 10) || 0,
          wednesday: parseInt(row.wednesday, 10) || 0,
          thursday: parseInt(row.thursday, 10) || 0,
          friday: parseInt(row.friday, 10) || 0,
          saturday: parseInt(row.saturday, 10) || 0,
          sunday: parseInt(row.sunday, 10) || 0,
          start_date: row.start_date,
          end_date: row.end_date,
        }),
      },
      'frequencies.txt': {
        repo: this.frequencyRepo,
        tableName: 'gtfs_frequencies',
        mapper: (row) => ({
          trip_id: row.trip_id,
          start_time: row.start_time,
          end_time: row.end_time,
          headway_secs: parseInt(row.headway_secs, 10) || 0,
        }),
      },
      'fare_attributes.txt': {
        repo: this.fareAttrRepo,
        tableName: 'gtfs_fare_attributes',
        mapper: (row) => ({
          fare_id: row.fare_id,
          price: parseFloat(row.price) || 0,
          currency_type: row.currency_type,
          payment_method: parseInt(row.payment_method, 10) || 0,
          transfers: row.transfers || null,
          transfer_duration: row.transfer_duration ? parseInt(row.transfer_duration, 10) : null,
        }),
      },
      'fare_rules.txt': {
        repo: this.fareRuleRepo,
        tableName: 'gtfs_fare_rules',
        mapper: (row) => ({
          fare_id: row.fare_id,
          route_id: row.route_id || null,
          origin_id: row.origin_id || null,
          destination_id: row.destination_id || null,
          contains_id: row.contains_id || null,
        }),
      },
    };
  }

  /**
   * Processa o ZIP GTFS completo.
   * Extrai → parseia cada CSV → insere no banco em batch.
   */
  async processGtfs(zipPath: string): Promise<PipelineStatus> {
    const status: PipelineStatus = {
      inicio: new Date(),
      resultados: [],
      total_registros: 0,
      status: 'em_andamento',
    };
    this.lastStatus = status;

    this.logger.log(`═══ Iniciando processamento GTFS: ${zipPath} ═══`);

    try {
      // 1. Extrair ZIP
      const extractedFiles = this.zipExtractor.extract(zipPath);

      // 2. Processar cada arquivo na ordem correta (agency primeiro, dependências depois)
      const processingOrder = [
        'agency.txt',
        'calendar.txt',
        'fare_attributes.txt',
        'routes.txt',
        'stops.txt',
        'trips.txt',
        'shapes.txt',
        'frequencies.txt',
        'stop_times.txt',
        'fare_rules.txt',
      ];

      for (const fileName of processingOrder) {
        const filePath = extractedFiles.find((f) => path.basename(f) === fileName);

        if (!filePath) {
          this.logger.warn(`Arquivo ${fileName} não encontrado no ZIP. Pulando.`);
          continue;
        }

        const mapping = this.gtfsMapping[fileName];
        if (!mapping) continue;

        const result = await this.processGtfsCsv(filePath, mapping, fileName);
        status.resultados.push(result);
        status.total_registros += result.registros;
      }

      // 3. Limpar temporários
      this.zipExtractor.cleanup();

      status.fim = new Date();
      status.duracao_total_ms = status.fim.getTime() - status.inicio.getTime();
      status.status = 'concluido';

      this.logger.log(
        `═══ GTFS processado com sucesso! ${status.total_registros} registros em ${status.duracao_total_ms}ms ═══`,
      );
    } catch (error) {
      status.status = 'erro';
      status.fim = new Date();
      status.duracao_total_ms = status.fim.getTime() - status.inicio.getTime();
      this.logger.error('Erro no pipeline GTFS:', error);

      status.resultados.push({
        tabela: 'pipeline',
        registros: 0,
        duracao_ms: status.duracao_total_ms,
        status: 'erro',
        erro: error instanceof Error ? error.message : String(error),
      });
    }

    return status;
  }

  /**
   * Processa um único arquivo CSV GTFS e insere no banco em batch.
   */
  private async processGtfsCsv(
    filePath: string,
    mapping: { repo: Repository<any>; mapper: (row: Record<string, string>) => any; tableName: string },
    fileName: string,
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    let totalRecords = 0;

    this.logger.log(`── Processando ${fileName}...`);

    try {
      // Limpa a tabela antes de inserir (full refresh)
      await mapping.repo.clear();

      const stream = this.csvParser.parseFileStream(filePath);
      const batchSize = fileName === 'shapes.txt' ? 1000 : 500;

      for await (const chunk of this.csvParser.chunkStream(stream, batchSize)) {
        const entities = chunk.map(mapping.mapper);

        // Usa insert em vez de save para performance (skip de select antes do insert)
        await mapping.repo
          .createQueryBuilder()
          .insert()
          .into(mapping.tableName)
          .values(entities)
          .orIgnore() // ignora duplicatas silenciosamente
          .execute();

        totalRecords += entities.length;

        if (totalRecords % 10000 === 0) {
          this.logger.log(`  ${fileName}: ${totalRecords} registros inseridos...`);
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(`  ✓ ${fileName}: ${totalRecords} registros em ${duration}ms`);

      return {
        tabela: mapping.tableName,
        registros: totalRecords,
        duracao_ms: duration,
        status: 'ok',
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`  ✗ ${fileName}: erro após ${totalRecords} registros — ${errorMsg}`);

      return {
        tabela: mapping.tableName,
        registros: totalRecords,
        duracao_ms: duration,
        status: 'erro',
        erro: errorMsg,
      };
    }
  }

  /**
   * Processa o CSV de passageiros da SPTrans.
   * O arquivo tem 3 linhas de cabeçalho antes do header real (linha 4).
   */
  async processPassageiros(csvPath: string): Promise<PipelineStatus> {
    const status: PipelineStatus = {
      inicio: new Date(),
      resultados: [],
      total_registros: 0,
      status: 'em_andamento',
    };
    this.lastStatus = status;

    this.logger.log(`═══ Iniciando processamento de Passageiros: ${csvPath} ═══`);

    const startTime = Date.now();
    let totalRecords = 0;

    try {
      // Limpa tabela (full refresh)
      await this.passageiroRepo.clear();

      // O arquivo tem 3 linhas de header de relatório antes do header real do CSV
      const stream = this.csvParser.parseFileStream(csvPath, { skipLines: 3 });

      for await (const chunk of this.csvParser.chunkStream(stream, 200)) {
        const entities = chunk.map((row) => this.mapPassageiro(row));

        // Filtra registros inválidos (sem data ou linha)
        const valid = entities.filter((e) => e !== null);

        if (valid.length > 0) {
          await this.passageiroRepo
            .createQueryBuilder()
            .insert()
            .into('passageiros')
            .values(valid)
            .orIgnore()
            .execute();

          totalRecords += valid.length;
        }
      }

      const duration = Date.now() - startTime;

      status.resultados.push({
        tabela: 'passageiros',
        registros: totalRecords,
        duracao_ms: duration,
        status: 'ok',
      });

      status.total_registros = totalRecords;
      status.fim = new Date();
      status.duracao_total_ms = duration;
      status.status = 'concluido';

      this.logger.log(
        `═══ Passageiros processados! ${totalRecords} registros em ${duration}ms ═══`,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error('Erro ao processar passageiros:', error);

      status.resultados.push({
        tabela: 'passageiros',
        registros: totalRecords,
        duracao_ms: duration,
        status: 'erro',
        erro: errorMsg,
      });

      status.status = 'erro';
      status.fim = new Date();
      status.duracao_total_ms = duration;
    }

    return status;
  }

  /**
   * Mapeia uma linha do CSV de passageiros para a entidade Passageiro.
   * Converte data do formato "M/D/YYYY" para Date e valores numéricos.
   */
  private mapPassageiro(row: Record<string, string>): Partial<Passageiro> | null {
    try {
      const dataField = row['Data'] || row['data'];
      if (!dataField) return null;

      // Formato do CSV: "2/15/2026" (M/D/YYYY)
      const [month, day, year] = dataField.split('/').map(Number);
      const data = new Date(year, month - 1, day);

      if (isNaN(data.getTime())) return null;

      // Pega os valores por posição já que os headers podem ter encoding issues
      const values = Object.values(row);

      return {
        data,
        grupo: row['Grupo'] || values[1] || '',
        lote: row['Lote'] || values[2] || '',
        empresa: row['Empresa'] || values[3] || '',
        linha: row['Linha'] || values[4] || '',
        pagantes_dinheiro: this.safeInt(values[5]),
        pagantes_comum_vt: this.safeInt(values[6]),
        pagantes_bu_comum_mensal: this.safeInt(values[7]),
        pagantes_estudante: this.safeInt(values[8]),
        pagantes_bu_est_mensal: this.safeInt(values[9]),
        pagantes_bu_vt_mensal: this.safeInt(values[10]),
        pagantes_total: this.safeInt(values[11]),
        integracao_onibus: this.safeInt(values[12]),
        gratuidade: this.safeInt(values[13]),
        gratuidade_estudante: this.safeInt(values[14]),
        total_transportados: this.safeInt(values[15]),
      };
    } catch {
      return null;
    }
  }

  private safeInt(value: string | undefined): number {
    if (!value) return 0;
    const parsed = parseInt(value.trim(), 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Retorna o status/resultado da última execução do pipeline.
   */
  getStatus(): PipelineStatus | { message: string } {
    if (!this.lastStatus) {
      return { message: 'Nenhum processamento foi executado ainda.' };
    }
    return this.lastStatus;
  }
}
