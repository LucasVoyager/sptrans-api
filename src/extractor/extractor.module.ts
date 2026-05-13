import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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

import { ZipExtractorService } from './infra/zip-extractor.service';
import { CsvParserService } from './infra/csv-parser.service';
import { ExtractorService } from './extractor.service';
import { ExtractorController } from './extractor.controller';

/**
 * Módulo Extrator — Pipeline ETL para dados GTFS e passageiros.
 *
 * Responsabilidades:
 * - Extrair ZIP GTFS e parsear CSVs
 * - Inserir dados formatados no banco PostgreSQL (Cloud SQL)
 * - Expor endpoints REST para triggerar processamento
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      GtfsAgency,
      GtfsRoute,
      GtfsStop,
      GtfsTrip,
      GtfsStopTime,
      GtfsShape,
      GtfsCalendar,
      GtfsFrequency,
      GtfsFareAttribute,
      GtfsFareRule,
      Passageiro,
    ]),
  ],
  providers: [ZipExtractorService, CsvParserService, ExtractorService],
  controllers: [ExtractorController],
  exports: [ExtractorService],
})
export class ExtractorModule {}
