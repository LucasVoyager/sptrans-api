import { Injectable, Logger } from '@nestjs/common';
import AdmZip from 'adm-zip';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Serviço responsável por extrair arquivos ZIP do GTFS.
 * Extrai os CSVs para um diretório temporário dentro do projeto.
 */
@Injectable()
export class ZipExtractorService {
  private readonly logger = new Logger(ZipExtractorService.name);

  /**
   * Extrai todos os arquivos de um ZIP para o diretório de destino.
   * @param zipPath Caminho absoluto do arquivo ZIP
   * @param outputDir Diretório de saída (padrão: ./tmp/gtfs-extracted)
   * @returns Lista de caminhos absolutos dos arquivos extraídos
   */
  extract(zipPath: string, outputDir?: string): string[] {
    const targetDir = outputDir ?? path.resolve(process.cwd(), 'tmp', 'gtfs-extracted');

    // Garante que o diretório de saída existe
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    this.logger.log(`Extraindo ZIP: ${zipPath} → ${targetDir}`);

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(targetDir, true); // overwrite = true

    const entries = zip.getEntries();
    const extractedFiles: string[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory) {
        const filePath = path.join(targetDir, entry.entryName);
        extractedFiles.push(filePath);
        this.logger.log(`  Extraído: ${entry.entryName} (${entry.header.size} bytes)`);
      }
    }

    this.logger.log(`Total de arquivos extraídos: ${extractedFiles.length}`);
    return extractedFiles;
  }

  /**
   * Remove o diretório temporário de extração.
   */
  cleanup(outputDir?: string): void {
    const targetDir = outputDir ?? path.resolve(process.cwd(), 'tmp', 'gtfs-extracted');

    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
      this.logger.log(`Diretório temporário removido: ${targetDir}`);
    }
  }
}
