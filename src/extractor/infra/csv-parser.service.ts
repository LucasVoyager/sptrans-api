import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { parse } from 'csv-parse';

/**
 * Serviço de parsing de arquivos CSV.
 *
 * Usa `csv-parse` em modo streaming para processar arquivos grandes
 * sem carregar tudo na memória. Suporta campos entre aspas (padrão GTFS).
 */
@Injectable()
export class CsvParserService {
  private readonly logger = new Logger(CsvParserService.name);

  /**
   * Parseia um arquivo CSV inteiro e retorna todos os registros.
   * Adequado para arquivos pequenos/médios (< 50MB).
   *
   * @param filePath Caminho absoluto do arquivo CSV
   * @param options Opções adicionais de parsing
   * @returns Array de objetos com chaves sendo os headers do CSV
   */
  async parseFile(
    filePath: string,
    options?: {
      delimiter?: string;
      skipLines?: number;
      encoding?: BufferEncoding;
    },
  ): Promise<Record<string, string>[]> {
    const records: Record<string, string>[] = [];

    for await (const record of this.parseFileStream(filePath, options)) {
      records.push(record);
    }

    this.logger.log(`Arquivo ${filePath}: ${records.length} registros parseados`);
    return records;
  }

  /**
   * Parseia um arquivo CSV em modo streaming.
   * Adequado para arquivos grandes (shapes.txt ~60MB).
   * Retorna um AsyncIterable para processar em chunks.
   *
   * @param filePath Caminho absoluto do arquivo CSV
   * @param options Opções adicionais de parsing
   */
  async *parseFileStream(
    filePath: string,
    options?: {
      delimiter?: string;
      skipLines?: number;
      encoding?: BufferEncoding;
    },
  ): AsyncIterable<Record<string, string>> {
    const delimiter = options?.delimiter ?? ',';
    const skipLines = options?.skipLines ?? 0;
    const encoding = options?.encoding ?? 'utf-8';

    const fileStream = fs.createReadStream(filePath, { encoding });

    const parser = fileStream.pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
        from_line: skipLines + 1, // csv-parse é 1-indexed, skipLines pula N linhas antes do header
        delimiter,
        relax_quotes: true,
        relax_column_count: true,
      }),
    );

    for await (const record of parser) {
      yield record as Record<string, string>;
    }
  }

  /**
   * Coleta registros do stream em chunks de tamanho fixo.
   * Ideal para inserção em batch no banco de dados.
   *
   * @param stream AsyncIterable de registros
   * @param chunkSize Tamanho de cada chunk (padrão: 500)
   */
  async *chunkStream<T>(
    stream: AsyncIterable<T>,
    chunkSize = 500,
  ): AsyncIterable<T[]> {
    let chunk: T[] = [];

    for await (const record of stream) {
      chunk.push(record);

      if (chunk.length >= chunkSize) {
        yield chunk;
        chunk = [];
      }
    }

    // Último chunk parcial
    if (chunk.length > 0) {
      yield chunk;
    }
  }
}
