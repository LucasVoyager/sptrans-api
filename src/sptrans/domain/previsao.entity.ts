import { Veiculo, LinhaVeiculos } from './posicao.entity';

export class ParadaPrevisao {
  /** Código identificador da parada */
  cp: number;

  /** Nome da parada */
  np: string;

  /** Latitude */
  py: number;

  /** Longitude */
  px: number;

  /** Linhas com previsões */
  l: LinhaVeiculos[];
}

/** Retorno de GET /Previsao e GET /Previsao/Parada */
export class PrevisaoParada {
  /** Horário de referência */
  hr: string;

  /** Informações da parada com previsões */
  p: ParadaPrevisao;
}

export class ParadaPrevisaoPorLinha {
  cp: number;
  np: string;
  py: number;
  px: number;
  vs: Veiculo[];
}

/** Retorno de GET /Previsao/Linha */
export class PrevisaoPorLinha {
  /** Horário de referência */
  hr: string;

  /** Paradas com veículos previstos */
  ps: ParadaPrevisaoPorLinha[];
}
