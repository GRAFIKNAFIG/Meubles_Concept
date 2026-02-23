import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CutListItem, BomItem } from '../types'

export function exportCutListPDF(
  projectName: string,
  cutList: CutListItem[],
  bom: BomItem[],
  translateBomLabel: (key: string) => string,
  lang = 'fr'
): void {
  const doc = new jsPDF({ orientation: 'landscape' })
  const now = new Date().toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'fr-FR')

  const title = lang === 'ro'
    ? `${projectName} – Plan de debitare`
    : `${projectName} – Plan de débit`
  const generatedLabel = lang === 'ro' ? `Generat pe ${now}` : `Généré le ${now}`
  const cutListLabel = lang === 'ro' ? 'Listă de debitare' : 'Liste de débit'
  const bomLabel = lang === 'ro' ? 'Nomenclatură feronerie' : 'Nomenclature quincaillerie'

  doc.setFontSize(18)
  doc.text(title, 14, 18)
  doc.setFontSize(10)
  doc.text(generatedLabel, 14, 26)

  // Cut list table
  doc.setFontSize(13)
  doc.text(cutListLabel, 14, 36)

  const cutListHead = lang === 'ro'
    ? [['Corp', 'Piesă', 'Cant.', 'L (mm)', 'l (mm)', 'Gros. (mm)', 'Material', 'Culoare']]
    : [['Meuble', 'Pièce', 'Qté', 'L (mm)', 'l (mm)', 'Ép. (mm)', 'Matière', 'Couleur']]

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
      item.panelType,
      item.panelColor,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  })

  if (bom.length > 0) {
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
    doc.setFontSize(13)
    doc.text(bomLabel, 14, finalY)

    const bomHead = lang === 'ro'
      ? [['Corp', 'Referință', 'Descriere', 'Cant.']]
      : [['Meuble', 'Référence', 'Description', 'Qté']]

    autoTable(doc, {
      startY: finalY + 4,
      head: bomHead,
      body: bom.map(item => [item.cabinetName, item.ref, translateBomLabel(item.labelKey), item.qty]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    })
  }

  doc.save(`${projectName.replace(/\s+/g, '_')}_debit.pdf`)
}
