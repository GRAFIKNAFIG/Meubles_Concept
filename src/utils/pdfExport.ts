import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { GroupedCutListItem } from './cutList'
import type { KitchenProject } from '../types'

export function exportCutListPDF(project: KitchenProject, items: GroupedCutListItem[], lang: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const dateStr = new Date(project.createdAt).toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'fr-FR')
  const title = lang === 'ro'
    ? `Listă de debitare – ${project.name}`
    : `Liste de débit – ${project.name}`

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 14, 16)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(dateStr, 14, 22)

  const head = lang === 'ro'
    ? [['Cant.', 'Piesă', 'L (mm)', 'l (mm)', 'Gros. (mm)', 'Tip panou', 'Culoare', 'Dulap']]
    : [['Qté', 'Pièce', 'L (mm)', 'l (mm)', 'Ép. (mm)', 'Type panneau', 'Couleur', 'Meuble']]

  const colorLabel = (c: string, l: string) => {
    const map: Record<string, Record<string, string>> = {
      fr: { WOOD: 'Bois', WHITE: 'Blanc', BROWN: 'Marron', BLACK: 'Noir', GRAY: 'Gris', BLUE: 'Bleu', GREEN: 'Vert', RED: 'Rouge' },
      ro: { WOOD: 'Lemn', WHITE: 'Alb', BROWN: 'Maro', BLACK: 'Negru', GRAY: 'Gri', BLUE: 'Albastru', GREEN: 'Verde', RED: 'Roșu' },
    }
    return map[l]?.[c] ?? c
  }

  const panelLabel = (p: string, l: string) => {
    if (l === 'ro') return p === 'MDF' ? 'MDF (mediu)' : 'Melaminat'
    return p === 'MDF' ? 'MDF (medium)' : 'Mélaminé'
  }

  const body = items.map(it => [
    String(it.qty),
    it.partName,
    String(it.lengthMm),
    String(it.widthMm),
    String(it.thicknessMm),
    panelLabel(it.panelType, lang),
    colorLabel(it.panelColor, lang),
    it.cabinetNames.join(', '),
  ])

  autoTable(doc, {
    startY: 28,
    head,
    body,
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  })

  const totalPieces = items.reduce((s, i) => s + i.qty, 0)
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  const totalLabel = lang === 'ro' ? `Total piese: ${totalPieces}` : `Total pièces : ${totalPieces}`
  doc.text(totalLabel, 14, finalY)

  doc.save(`${project.name.replace(/\s+/g, '_')}_debit.pdf`)
}
