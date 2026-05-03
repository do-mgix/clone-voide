/**
 * Seed de produtos via Prisma.
 *
 * Por padrão é DRY-RUN: imprime o diff e sai sem tocar no banco.
 * Use --apply para executar; --apply-deletes habilita os DELETEs.
 *
 * Uso:
 *   pnpm ts-node prisma/seed.ts --input planilha.xlsx
 *   pnpm ts-node prisma/seed.ts --input planilha.xlsx --apply
 *   pnpm ts-node prisma/seed.ts --input planilha.xlsx --apply --apply-deletes
 */
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import {
  calcularDiff,
  lerPlanilha,
  paraProduto,
  type Diff,
  type ProdutoBanco,
} from "./seedCore";

interface Args {
  input: string;
  apply: boolean;
  applyDeletes: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { input: "", apply: false, applyDeletes: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--input" || a === "-i") {
      args.input = argv[++i] ?? "";
    } else if (a === "--apply") {
      args.apply = true;
    } else if (a === "--apply-deletes") {
      args.applyDeletes = true;
    } else if (a === "--help" || a === "-h") {
      console.log(
        "Uso: ts-node prisma/seed.ts --input <planilha> [--apply] [--apply-deletes]",
      );
      process.exit(0);
    }
  }
  if (!args.input) {
    console.error("Erro: --input <planilha.xlsx|csv> é obrigatório");
    process.exit(1);
  }
  return args;
}

function imprimirDiff(diff: Diff, applyDeletes: boolean): void {
  const linha = "─".repeat(70);
  console.log(linha);
  console.log("DIFF (planilha vs banco)");
  console.log(linha);
  console.log(`  Inalterados : ${diff.inalterados}`);
  console.log(`  INSERT      : ${diff.inserts.length}`);
  console.log(`  UPDATE      : ${diff.updates.length}`);
  console.log(
    `  DELETE      : ${diff.deletes.length}` +
      (diff.deletes.length > 0 && !applyDeletes
        ? "  (preservados — use --apply-deletes para remover)"
        : ""),
  );
  console.log(linha);

  if (diff.inserts.length > 0) {
    console.log("\nINSERT:");
    for (const p of diff.inserts) {
      console.log(
        `  + ${p.name}  [${p.category}]  R$ ${(p.priceInCents / 100).toFixed(2)}` +
          (p.sizes.length ? `  tam=${p.sizes.join(",")}` : ""),
      );
    }
  }

  if (diff.updates.length > 0) {
    console.log("\nUPDATE:");
    for (const u of diff.updates) {
      const mudancas: string[] = [];
      if (u.antes.category !== u.depois.category) {
        mudancas.push(`category: '${u.antes.category}' → '${u.depois.category}'`);
      }
      if (u.antes.priceInCents !== u.depois.priceInCents) {
        mudancas.push(
          `price: R$${(u.antes.priceInCents / 100).toFixed(2)} → R$${(u.depois.priceInCents / 100).toFixed(2)}`,
        );
      }
      if (u.antes.sizes.join(",") !== u.depois.sizes.join(",")) {
        mudancas.push(`sizes: [${u.antes.sizes}] → [${u.depois.sizes}]`);
      }
      console.log(`  ~ ${u.depois.name}  (${mudancas.join("; ")})`);
    }
  }

  if (diff.deletes.length > 0) {
    console.log("\nDELETE:");
    for (const p of diff.deletes) {
      console.log(`  - ${p.name}  [${p.category}]  (id=${p.id})`);
    }
  }
  console.log();
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const prisma = new PrismaClient();

  try {
    // 1) Lê e valida a planilha (falha cedo se cabeçalho/linha inválida)
    const linhas = await lerPlanilha(args.input);
    const planilhaProdutos = linhas.map(paraProduto);
    console.log(`Planilha: ${planilhaProdutos.length} produtos lidos.`);

    // 2) Lê os produtos atuais do banco
    //    Selecionamos só os campos que entram no diff — assim alterações
    //    em campos cosméticos (emoji, gradientKey, etc) não são detectadas
    //    como UPDATE, preservando customizações manuais.
    const bancoRaw = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        priceInCents: true,
        sizes: true,
      },
    });
    const banco: ProdutoBanco[] = bancoRaw.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category ?? "",
      priceInCents: p.priceInCents,
      sizes: p.sizes ?? [],
    }));
    console.log(`Banco: ${banco.length} produtos atuais.\n`);

    // 3) Diff
    const diff = calcularDiff(banco, planilhaProdutos);
    imprimirDiff(diff, args.applyDeletes);

    // 4) Aplica (ou não)
    if (!args.apply) {
      console.log("DRY-RUN: nada foi alterado. Use --apply para executar.");
      return;
    }

    // Tudo numa única transação — se algo falhar, nada é aplicado.
    await prisma.$transaction(async (tx) => {
      // INSERTs — campos sem fonte ficam com defaults do Prisma/banco
      for (const p of diff.inserts) {
        await tx.product.create({
          data: {
            id: randomUUID(),
            name: p.name,
            category: p.category,
            priceInCents: p.priceInCents,
            sizes: p.sizes,
            description: "",
            emoji: "📦",
            gradientKey: "default",
          },
        });
      }

      // UPDATEs — só os campos que mudam, preserva tudo que veio de fora
      for (const u of diff.updates) {
        await tx.product.update({
          where: { id: u.id as any },
          data: {
            category: u.depois.category,
            priceInCents: u.depois.priceInCents,
            sizes: u.depois.sizes,
          },
        });
      }

      // DELETEs — apenas se o usuário pediu explicitamente
      if (args.applyDeletes && diff.deletes.length > 0) {
        const deleteIds = diff.deletes.map((d) => d.id) as string[];
        // Remove cart items que referenciam os produtos a deletar (evita FK violation)
        await tx.cartItem.deleteMany({ where: { productId: { in: deleteIds } } });
        await tx.product.deleteMany({ where: { id: { in: deleteIds } } });
      }
    }, { timeout: 60000 });

    console.log("✓ Seed aplicado.");
    if (diff.deletes.length > 0 && !args.applyDeletes) {
      console.log(
        `  (${diff.deletes.length} produtos não estavam na planilha mas foram preservados)`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Falha:", err);
  process.exit(1);
});
