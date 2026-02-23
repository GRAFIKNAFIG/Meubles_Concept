import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CutListItem, BomItem } from '../types'

export function exportCutListPDF(
  projectName: string,
  cutList: CutListItem[],
  bom: BomItem[]
): void {
  const doc = new jsPDF({ orientation: 'landscape' })
  const now = new Date().toLocaleDateString('fr-FR')

  doc.setFontSize(18)
  doc.text(`${projectName} – Plan de débit`, 14, 18)
  doc.setFontSize(10)
  doc.text(`Généré le ${now}`, 14, 26)

  // Cut list table
  doc.setFontSize(13)
  doc.text('Liste de débit', 14, 36)

  autoTable(doc, {
    startY: 40,
    head: [['Meuble', 'Pièce', 'Qté', 'Long (mm)', 'Larg (mm)', 'Ép (mm)', 'Matière', 'Couleur']],
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
    doc.text('Nomenclature quincaillerie', 14, finalY)

    autoTable(doc, {
      startY: finalY + 4,
      head: [['Meuble', 'Référence', 'Description', 'Qté']],
      body: bom.map(item => [item.cabinetName, item.ref, item.description, item.qty]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    })
  }

  doc.save(`${projectName.replace(/\s+/g, '_')}_debit.pdf`)
}
