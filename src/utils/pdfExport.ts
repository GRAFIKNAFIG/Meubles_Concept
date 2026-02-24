import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import i18n from '../i18n'
import type { CutListItem, BomItem, PanelColor, PanelType } from '../types'

function translatePanelColor(panelColor: PanelColor): string {
  return i18n.t(`cabinet.color${panelColor}`, { defaultValue: panelColor })
}

function translatePanelType(panelType: PanelType): string {
  return i18n.t(`cabinet.panelType${panelType}`, { defaultValue: panelType })
}

type ImagePage = {
  title: string
  dataUrl: string
}

function addImagePage(doc: jsPDF, pageTitle: string, dataUrl: string, lang: string) {
  doc.addPage('a4', 'landscape')
  doc.setFontSize(16)
  doc.text(pageTitle, 14, 18)

  const now = new Date().toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'fr-FR')
  const generatedLabel = lang === 'ro' ? `Generat pe ${now}` : `Généré le ${now}`
  doc.setFontSize(10)
  doc.text(generatedLabel, 14, 26)

  // Fit image to page with margins
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  const marginX = 14
  const marginTop = 32
  const maxW = pageW - marginX * 2
  const maxH = pageH - marginTop - 14

  // jsPDF can infer dimensions for PNG; we set a safe fit box.
  doc.addImage(dataUrl, 'PNG', marginX, marginTop, maxW, maxH, undefined, 'FAST')
}

export function exportCutListPDF(
  projectName: string,
  cutList: CutListItem[],
  bom: BomItem[],
  t: (key: string) => string,
  imagePages?: ImagePage[]
): void {
  const lang = i18n.language

  const doc = new jsPDF({ orientation: 'landscape' })
  const now = new Date().toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'fr-FR')

  // IMPORTANT: use simple ASCII dash to avoid encoding issues
  const title = `${projectName} - ${t('kitchen.tabCutList')}`
  const generatedLabel = lang === 'ro' ? `Generat pe ${now}` : `Généré le ${now}`
  const cutListLabel = t('kitchen.tabCutList')
  const bomLabel = t('kitchen.tabBOM')

  doc.setFontSize(18)
  doc.text(title, 14, 18)
  doc.setFontSize(10)
  doc.text(generatedLabel, 14, 26)

  // Optional pages (2D / 3D) BEFORE tables
  if (imagePages?.length) {
    for (const p of imagePages) addImagePage(doc, p.title, p.dataUrl, lang)
    // Return to first page for tables? Keep tables after image pages:
    doc.addPage('a4', 'landscape')
  }

  // Cut list table
  doc.setFontSize(13)
  doc.text(cutListLabel, 14, 18)

  const cutListHead = [[
    t('cutlist.cabinet'),
    t('cutlist.part'),
    t('cutlist.qty'),
    t('cutlist.length'),
    t('cutlist.width'),
    t('cutlist.thickness'),
    t('cabinet.panelType'),
    t('cabinet.panelColor'),
  ]]

  autoTable(doc, {
    startY: 22,
    head: cutListHead,
    body: cutList.map(item => [
      item.cabinetName,
      item.partName,
      item.qty,
      Math.round(item.lengthMm),
      Math.round(item.widthMm),
      item.thicknessMm,
      translatePanelType(item.panelType),
      translatePanelColor(item.panelColor),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  })

  if (bom.length > 0) {
    const finalY = ((doc as any).lastAutoTable?.finalY ?? 40) + 10
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