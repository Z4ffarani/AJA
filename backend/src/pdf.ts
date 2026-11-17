// Gera o dossiê em PDF com texto real (marcado para leitores de tela).
import PDFDocument from 'pdfkit'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const fonts = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'fonts')
const REGULAR = join(fonts, 'atkinson-hyperlegible-next-latin-400-normal.woff')
const BOLD = join(fonts, 'atkinson-hyperlegible-next-latin-700-normal.woff')

const FORMAT: Record<string, string> = { texto: 'texto', audio: 'áudio (transcrito)', foto: 'foto (com descrição)', libras: 'vídeo em Libras (legendado)' }

type Topic = { title: string; address: string; neighborhood: string; summary: string; proposal: string; supports: number; passes: number; categoryLabel: string; dossier: { number: string; version: number } | null; protocol: { number: string; org: string } | null }

export function buildDossier(t: Topic, reports: { format: string; body: string; caption: string; passes_by: boolean }[], refs: { title: string; source: string }[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4', margin: 56, tagged: true, lang: 'pt-BR', displayTitle: true, pdfVersion: '1.7',
      info: { Title: `Dossiê AJA · ${t.title}`, Author: 'AJA · participação cidadã', Subject: 'Dossiê de barreira de acessibilidade' },
    })
    const chunks: Buffer[] = []
    doc.on('data', (c) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    doc.registerFont('R', REGULAR)
    doc.registerFont('B', BOLD)

    const ink = '#0F172A', muted = '#475467', blue = '#1D5BD8'
    const h = (text: string) => { doc.moveDown(0.8); doc.font('B').fontSize(14).fillColor(ink).text(text); doc.moveDown(0.3) }
    const p = (text: string) => doc.font('R').fontSize(11.5).fillColor(ink).text(text, { lineGap: 3 })

    doc.font('B').fontSize(22).fillColor(blue).text('AJA')
    doc.font('R').fontSize(10).fillColor(muted).text(`Dossiê ${t.dossier?.number ?? 'em preparação'} · versão ${t.dossier?.version || 1} · gerado em ${new Date().toLocaleDateString('pt-BR')} · dados simulados do piloto`)
    doc.moveDown(1)
    doc.font('B').fontSize(18).fillColor(ink).text(t.title, { lineGap: 2 })
    doc.font('R').fontSize(11).fillColor(muted).text(`${t.address} · ${t.neighborhood} · Subprefeitura Cidade Ademar`)
    if (t.protocol) doc.text(`Protocolo SP156 ${t.protocol.number} · ${t.protocol.org}`)

    h('1. Situação'); p(t.summary || 'Sem descrição.')
    h('2. Quem é afetado')
    const byFormat = reports.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.format]: (acc[r.format] ?? 0) + 1 }), {})
    const parts = Object.entries(byFormat).map(([f, n]) => `${n} em ${FORMAT[f] ?? f}`).join(', ')
    p(`${reports.length} relatos${parts ? ` (${parts})` : ''}. ${t.passes} moradores informaram que passam pelo local; ${t.supports} apoiam a melhoria.`)
    h('3. Evidências')
    reports.forEach((r, i) => {
      const who = `Morador(a) ${String.fromCharCode(65 + (i % 26))}`
      p(`• ${who}, ${FORMAT[r.format] ?? r.format}${r.passes_by ? ', passa pelo local' : ''}: “${r.caption || r.body}”`)
      doc.moveDown(0.2)
    })
    h('4. Fundamentação')
    if (refs.length) refs.forEach((r) => p(`• ${r.title} (${r.source})`))
    else p('Referências em conferência pelos voluntários.')
    h('5. Pedido'); p(t.proposal || 'Remoção da barreira e adequação do local às normas de acessibilidade.')
    doc.moveDown(1.2)
    doc.font('R').fontSize(9.5).fillColor(muted).text('Este dossiê não contém dados pessoais. Quem relatou aparece como Morador(a) A, B, C. A avaliação técnica, a aprovação e a execução da intervenção são responsabilidade do poder público.', { lineGap: 2 })
    doc.end()
  })
}
