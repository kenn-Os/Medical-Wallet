'use client'
import { useState } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function PDFExportClient({ targetId = "export-content", fileName = "MedWallet_Emergency_Profile.pdf", className = "" }) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const element = document.getElementById(targetId)
      if (!element) throw new Error("Could not find the content to export.")

      // Temporarily modify styles for better PDF rendering
      const originalBg = element.style.backgroundColor
      element.style.backgroundColor = '#ffffff'
      element.style.padding = '20px'

      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      // Restore original styles
      element.style.backgroundColor = originalBg
      element.style.padding = ''

      const imgData = canvas.toDataURL('image/png')
      
      // Calculate dimensions (A4 size is 210x297mm)
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(fileName)
      
      toast.success('PDF Export downloaded successfully!')
    } catch (error) {
      console.error("PDF Export Error: ", error)
      toast.error("Failed to generate PDF. " + error.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className={`btn-secondary flex items-center gap-2 text-sm px-4 py-2 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors ${className}`}
    >
      {exporting ? <Loader2 className="w-4 h-4 animate-spin text-primary-600" /> : <Download className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
      <span className="font-medium text-gray-700 dark:text-zinc-300">
        {exporting ? 'Generating PDF...' : 'Download ICE PDF'}
      </span>
    </button>
  )
}
