/**
 * Leitura da planilha + cálculo de diff.
 *
 * Mantido sem dependência do Prisma para que possa ser testado em
 * isolamento (recebe os produtos atuais como argumento, em vez de
 * consultá-los).
 */
import * as ExcelJS from "exceljs";
import { z } from "zod";
import { readFile } from "node:fs/promises";

// ---------------------------------------------------------------------------
// Schema de uma linha da planilha (após normalização dos cabeçalhos)
// ---------------------------------------------------------------------------
export const LinhaPlanilhaSchema = z.object({
  produto: z.string().trim().min(1, "produto vazio"),
  categoria: z.string().trim().min(1, "categoria vazia"),
  tamanho: z.string().trim().default(""),
  preco: z
    .number({ invalid_type_error: "preço não numérico" })
    .nonnegative("preço negativo"),
});

export type LinhaPlanilha = z.infer<typeof LinhaPlanilhaSchema>;

// ---------------------------------------------------------------------------
// Mapeamento flexível de cabeçalhos
// ---------------------------------------------------------------------------
// A planilha pode chegar com variações ("Produto" / "produto" / "Nome").
// Tudo é normalizado (lower, sem acento) antes de comparar.
const ALIASES: Record<keyof LinhaPlanilha, string[]> = {
  produto: ["produto", "nome", "nome do produto"],
  categoria: ["categoria", "categoria do produto"],
  tamanho: ["tamanho", "tamanhos", "tam"],
  preco: ["preco", "preco (rs)", "preco r$", "preco (r$)", "valor", "preco rs"],
};

function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function mapearCabecalhos(cabecalhos: string[]): Record<keyof LinhaPlanilha, number> {
  const normMap = new Map<string, number>();
  cabecalhos.forEach((c, i) => normMap.set(normalizar(c), i));

  const resultado: Partial<Record<keyof LinhaPlanilha, number>> = {};
  for (const [campo, aliases] of Object.entries(ALIASES) as [
    keyof LinhaPlanilha,
    string[],
  ][]) {
    for (const alias of aliases) {
      const idx = normMap.get(alias);
      if (idx !== undefined) {
        resultado[campo] = idx;
        break;
      }
    }
  }

  // Validação: produto, categoria e preco são obrigatórios
  const faltando = (["produto", "categoria", "preco"] as const).filter(
    (c) => resultado[c] === undefined,
  );
  if (faltando.length > 0) {
    throw new Error(
      `Cabeçalhos obrigatórios não encontrados: ${faltando.join(", ")}. ` +
        `Cabeçalhos da planilha: ${cabecalhos.join(", ")}`,
    );
  }

  return resultado as Record<keyof LinhaPlanilha, number>;
}

// ---------------------------------------------------------------------------
// Leitura
// ---------------------------------------------------------------------------
export async function lerPlanilha(caminho: string): Promise<LinhaPlanilha[]> {
  const ext = caminho.toLowerCase().split(".").pop();
  if (ext === "xlsx" || ext === "xlsm") return lerXlsx(caminho);
  if (ext === "csv") return lerCsv(caminho);
  throw new Error(`Formato não suportado: .${ext}. Use .xlsx ou .csv.`);
}

async function lerXlsx(caminho: string): Promise<LinhaPlanilha[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(caminho);
  const ws = wb.worksheets[0];
  if (!ws) throw new Error("Planilha sem abas.");

  // Cabeçalhos
  const headerRow = ws.getRow(1);
  const cabecalhos: string[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell) => {
    cabecalhos.push(String(cell.value ?? "").trim());
  });
  const mapa = mapearCabecalhos(cabecalhos);

  const linhas: LinhaPlanilha[] = [];
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const valores = row.values as (string | number | null | undefined)[];
    // ExcelJS usa índice 1-based para .values, então normalizamos
    const get = (idx: number) => valores[idx + 1];

    const produto = get(mapa.produto);
    if (produto === null || produto === undefined || String(produto).trim() === "") {
      return; // linha vazia
    }

    try {
      const linha = LinhaPlanilhaSchema.parse({
        produto: String(produto),
        categoria: String(get(mapa.categoria) ?? ""),
        tamanho: String(get(mapa.tamanho) ?? ""),
        preco: Number(get(mapa.preco)),
      });
      linhas.push(linha);
    } catch (err) {
      const detalhe = err instanceof z.ZodError ? err.issues : err;
      throw new Error(
        `Linha ${rowNumber} inválida: ${JSON.stringify(detalhe)}`,
      );
    }
  });

  return linhas;
}

async function lerCsv(caminho: string): Promise<LinhaPlanilha[]> {
  // Parser CSV minimalista: tab, vírgula ou ponto-e-vírgula como separador.
  // Para CSVs complexos (campos com aspas e vírgulas dentro), use papaparse.
  const buf = await readFile(caminho);
  // Tenta UTF-8; se houver caractere de substituição (U+FFFD), usa latin1 (ISO-8859-1).
  let conteudo = buf.toString("utf-8");
  if (conteudo.includes("�")) conteudo = buf.toString("latin1");
  const linhasBrutas = conteudo
    .replace(/\r/g, "")
    .split("\n")
    .filter((l) => l.trim() !== "");

  if (linhasBrutas.length === 0) return [];

  const sep = detectarSeparador(linhasBrutas[0]!);
  const cabecalhos = parseCsvRow(linhasBrutas[0]!, sep).map((s) => s.trim());
  const mapa = mapearCabecalhos(cabecalhos);

  const resultado: LinhaPlanilha[] = [];
  for (let i = 1; i < linhasBrutas.length; i++) {
    const cols = parseCsvRow(linhasBrutas[i]!, sep);
    const produto = cols[mapa.produto];
    if (!produto || produto.trim() === "") continue;

    try {
      resultado.push(
        LinhaPlanilhaSchema.parse({
          produto: produto,
          categoria: cols[mapa.categoria] ?? "",
          tamanho: cols[mapa.tamanho] ?? "",
          // Strip "R$ " prefix e normaliza vírgula decimal
          preco: Number(
            String(cols[mapa.preco] ?? "0")
              .replace(/R\$\s*/i, "")
              .replace(",", ".")
              .trim(),
          ),
        }),
      );
    } catch (err) {
      const detalhe = err instanceof z.ZodError ? err.issues : err;
      throw new Error(`Linha ${i + 1} inválida: ${JSON.stringify(detalhe)}`);
    }
  }
  return resultado;
}

function parseCsvRow(linha: string, sep: string): string[] {
  const cols: string[] = [];
  let col = "";
  let inQuotes = false;
  for (let i = 0; i < linha.length; i++) {
    const ch = linha[i]!;
    if (inQuotes) {
      if (ch === '"' && linha[i + 1] === '"') { col += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { col += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === sep) { cols.push(col); col = ""; }
      else { col += ch; }
    }
  }
  cols.push(col);
  return cols;
}

function detectarSeparador(linha: string): string {
  const counts: Record<string, number> = {
    ",": (linha.match(/,/g) ?? []).length,
    ";": (linha.match(/;/g) ?? []).length,
    "\t": (linha.match(/\t/g) ?? []).length,
  };
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]![0];
}

// ---------------------------------------------------------------------------
// Conversão para forma do banco
// ---------------------------------------------------------------------------
/**
 * Converte uma linha da planilha em um objeto pronto para o Prisma.
 * Campos sem fonte na planilha (description, emoji, etc) ficam com defaults
 * SOMENTE em INSERTs — em UPDATEs, esses campos não são tocados.
 */
export interface ProdutoCarga {
  name: string;
  category: string;
  priceInCents: number;
  sizes: string[];
}

export function paraProduto(linha: LinhaPlanilha): ProdutoCarga {
  return {
    name: linha.produto.trim(),
    category: linha.categoria.trim(),
    // Preço * 100 com Math.round pra evitar 19.99 * 100 = 1998.9999...
    priceInCents: Math.round(linha.preco * 100),
    sizes: parsearTamanhos(linha.tamanho),
  };
}

function parsearTamanhos(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;|/\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// ---------------------------------------------------------------------------
// Diff
// ---------------------------------------------------------------------------
/**
 * Produto vindo do banco (subset que comparamos).
 * Os campos extras do schema (emoji, gradientKey, etc) são intencionalmente
 * omitidos: a planilha não os define, então não entram no diff.
 */
export interface ProdutoBanco {
  id: string | number;
  name: string;
  category: string;
  priceInCents: number;
  sizes: string[];
}

export interface Diff {
  inserts: ProdutoCarga[];
  updates: { id: string | number; antes: ProdutoBanco; depois: ProdutoCarga }[];
  deletes: ProdutoBanco[];
  inalterados: number;
}

/** Chave de match: name normalizado (lower + sem acento). */
function chave(s: string): string {
  return normalizar(s);
}

function arrayIgual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

function precisaUpdate(banco: ProdutoBanco, planilha: ProdutoCarga): boolean {
  return (
    banco.category !== planilha.category ||
    banco.priceInCents !== planilha.priceInCents ||
    !arrayIgual(banco.sizes, planilha.sizes)
  );
}

export function calcularDiff(
  banco: ProdutoBanco[],
  planilha: ProdutoCarga[],
): Diff {
  const indiceBanco = new Map<string, ProdutoBanco>();
  for (const p of banco) indiceBanco.set(chave(p.name), p);

  const chavesPlanilha = new Set<string>();
  const inserts: ProdutoCarga[] = [];
  const updates: Diff["updates"] = [];
  let inalterados = 0;

  // Detecta colisões na planilha (dois produtos com mesmo nome) — é erro.
  const colisoes = new Map<string, number>();
  for (const p of planilha) {
    const k = chave(p.name);
    colisoes.set(k, (colisoes.get(k) ?? 0) + 1);
  }
  const duplicados = Array.from(colisoes.entries()).filter(([, n]) => n > 1);
  if (duplicados.length > 0) {
    throw new Error(
      `Planilha tem nomes duplicados (após normalização): ` +
        duplicados.map(([k, n]) => `'${k}' (${n}x)`).join(", "),
    );
  }

  for (const p of planilha) {
    const k = chave(p.name);
    chavesPlanilha.add(k);
    const existente = indiceBanco.get(k);
    if (!existente) {
      inserts.push(p);
    } else if (precisaUpdate(existente, p)) {
      updates.push({ id: existente.id, antes: existente, depois: p });
    } else {
      inalterados++;
    }
  }

  const deletes = banco.filter((p) => !chavesPlanilha.has(chave(p.name)));

  return { inserts, updates, deletes, inalterados };
}
