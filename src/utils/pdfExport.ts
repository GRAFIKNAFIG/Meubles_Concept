import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import i18n from '../i18n'
import type { CutListItem, BomItem, PanelColor } from '../types'

function translatePanelColor(panelColor: PanelColor): string {
  return i18n.t(`cabinet.color${panelColor}`, { defaultValue: panelColor })
}

export function exportCutListPDF(
  projectName: string,
  cutList: CutListItem[],
  bom: BomItem[],
  translateBomLabel: (key: string) => string
): void {
  const lang = i18n.language
  const doc = new jsPDF({ orientation: 'landscape' })
  const now = new Date().toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'fr-FR')

  const title = `${projectName} – ${i18n.t('kitchen.tabCutList')}`
  const generatedLabel = lang === 'ro' ? `Generat pe ${now}` : `Généré le ${now}`
  const cutListLabel = i18n.t('kitchen.tabCutList')
  const bomLabel = i18n.t('kitchen.tabBOM')

  doc.setFontSize(18)
  doc.text(title, 14, 18)
  doc.setFontSize(10)
  doc.text(generatedLabel, 14, 26)

  // Cut list table
  doc.setFontSize(13)
  doc.text(cutListLabel, 14, 36)

  const cutListHead = [[
    i18n.t('cutlist.cabinet'),
    i18n.t('cutlist.part'),
    i18n.t('cutlist.qty'),
    i18n.t('cutlist.length'),
    i18n.t('cutlist.width'),
    i18n.t('cutlist.thickness'),
    i18n.t('cabinet.panelType'),
    i18n.t('cabinet.panelColor'),
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
      item.panelType,
      translatePanelColor(item.panelColor),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  })

  if (bom.length > 0) {
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
    doc.setFontSize(13)
    doc.text(bomLabel, 14, finalY)

    const bomHead = [[
      i18n.t('bom.cabinet'),
      i18n.t('bom.ref'),
      i18n.t('bom.description'),
      i18n.t('bom.qty'),
    ]]

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
