import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CutListItem, BomItem } from '../types'

export function exportCutListPDF(
  projectName: string,
  cutList: CutListItem[],
  bom: BomItem[],
  t: (key: string, options?: Record<string, unknown>) => string,
  lang = 'ro'
): void {
  const doc = new jsPDF({ orientation: 'landscape' })
  const now = new Date().toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'fr-FR')

  const title = `${projectName} - ${t('pdf.titleSuffix')}`
  const generatedLabel = t('pdf.generated', { date: now })
  const cutListLabel = t('pdf.cutListTitle')
  const bomLabel = t('pdf.bomTitle')

  doc.setFontSize(18)
  doc.text(title, 14, 18)
  doc.setFontSize(10)
  doc.text(generatedLabel, 14, 26)

  // Cut list table
  doc.setFontSize(13)
  doc.text(cutListLabel, 14, 36)

  const cutListHead = [[
    t('cutlist.cabinet'),
    t('cutlist.part'),
    t('cutlist.qty'),
    t('cutlist.length'),
    t('cutlist.width'),
    t('cutlist.thickness'),
    t('cutlist.materialHeader'),
    t('cutlist.colorHeader'),
  ]]

  autoTable(doc, {
    startY: 40,
    head: cutListHead,
    body: cutList.map(item => [
      item.cabinetName,
      item.partName,
      item.qty,
      Math.round(item.lengthMm),
      Math.round(item.widthMm),
      item.thicknessMm,
      t(`cabinet.panelType${item.panelType}`),
      t(`cabinet.color${item.panelColor}`),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  })

  if (bom.length > 0) {
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
    doc.setFontSize(13)
    doc.text(bomLabel, 14, finalY)

    const bomHead = [[
      t('bom.cabinet'),
      t('bom.ref'),
      t('bom.description'),
      t('bom.qty'),
    ]]

    autoTable(doc, {
      startY: finalY + 4,
      head: bomHead,
      body: bom.map(item => [item.cabinetName, item.ref, t(item.labelKey), item.qty]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    })
  }

  doc.save(`${projectName.replace(/\s+/g, '_')}_debitare.pdf`)
}
