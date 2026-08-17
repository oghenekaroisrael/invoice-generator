import { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Search,
  Bell,
  Download,
  AlertCircle
} from 'lucide-react';
import { generateInvoice } from './utils/invoiceGenerator';

/**
 * Main application component for the Invoice Generator.
 * Handles state management for the invoice configuration, file upload,
 * and triggers the invoice generation process.
 *
 * @returns {JSX.Element} The rendered App component.
 */
function App() {
  const [csvFile, setCsvFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [config, setConfig] = useState({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    hourlyRate: '30',
    clientName: '',
    clientEmail: '',
    clientCompany: '',
    clientAddress: '',
    accountName: import.meta.env.VITE_ACCOUNT_NAME || '',
    accountEmail: import.meta.env.VITE_ACCOUNT_EMAIL || '',
    accountAddress1: import.meta.env.VITE_ACCOUNT_ADDRESS1 || '',
    accountAddress2: import.meta.env.VITE_ACCOUNT_ADDRESS2 || '',
    accountAddress3: import.meta.env.VITE_ACCOUNT_ADDRESS3 || '',
    bankName: import.meta.env.VITE_BANK_NAME || '',
    accountNumber: import.meta.env.VITE_ACCOUNT_NUMBER || '',
    accountType: import.meta.env.VITE_ACCOUNT_TYPE || '',
    swiftCode: import.meta.env.VITE_SWIFT_CODE || '',
    routingNumber: import.meta.env.VITE_ROUTING_NUMBER || '',
    bankAddress: import.meta.env.VITE_BANK_ADDRESS || ''
  });

  /**
   * Updates the configuration state when input fields change.
   * 
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event from the input.
   */
  const handleConfigChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  /**
   * Validates the uploaded file and triggers the invoice generation utility.
   * Sets loading states and handles potential errors during the generation process.
   */
  const handleGenerate = async () => {
    // 1. Validate that a CSV file has been provided
    if (!csvFile) {
      setError('Please upload the Clockify CSV report.');
      return;
    }
    
    // 2. Clear any previous errors and indicate loading state
    setError(null);
    setIsLoading(true);
    
    try {
      // 3. Delegate generation to the utility function
      await generateInvoice(csvFile, config);
    } catch (err) {
      // 4. Catch and display any errors that occur during generation
      setError(err.message || 'An error occurred during generation.');
    } finally {
      // 5. Always stop the loading indicator, regardless of success or failure
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-800">

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto p-6 md:p-10 relative">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Hero / Title Section */}
          <div className="text-center space-y-4 pt-2">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm">
              Invoice Generator
            </h1>
            <p className="text-slate-600 text-lg font-medium bg-white/60 backdrop-blur-xl px-6 py-2 rounded-full inline-block border border-white/50 shadow-sm">
              Transform your Clockify time reports into professional Excel invoices in seconds.
            </p>
          </div>

          {/* Top Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-4 md:px-8 rounded-2xl">
            <h1 className="text-2xl md:text-3xl font-bold">
              New Invoices: <span className="text-slate-500 font-medium">{config.invoiceNumber || 'INV-000'}</span>
            </h1>
          </header>

          {error && (
            <div className="bg-red-50/90 backdrop-blur-md border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 text-red-700 shadow-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column (Sender & Items) */}
            <div className="lg:col-span-2 space-y-8">

              {/* Account & Bank Details (Dark Card) */}
              <div className="glass-panel-dark rounded-3xl p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg mb-2">Company Details</h3>
                    <div className="space-y-3">
                      <input type="text" name="accountName" value={config.accountName} onChange={handleConfigChange} className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#B4F442] outline-none" placeholder="Company Name" />
                      <input type="email" name="accountEmail" value={config.accountEmail} onChange={handleConfigChange} className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#B4F442] outline-none" placeholder="Email" />
                      <input type="text" name="accountAddress1" value={config.accountAddress1} onChange={handleConfigChange} className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#B4F442] outline-none" placeholder="Address Line 1" />
                      <input type="text" name="accountAddress2" value={config.accountAddress2} onChange={handleConfigChange} className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#B4F442] outline-none" placeholder="Address Line 2" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg mb-2">Bank Details</h3>
                    <div className="space-y-3">
                      <input type="text" name="bankName" value={config.bankName} onChange={handleConfigChange} className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#B4F442] outline-none" placeholder="Bank Name" />
                      <input type="text" name="bankAddress" value={config.bankAddress} onChange={handleConfigChange} className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#B4F442] outline-none" placeholder="Bank Address" />
                      <div className="flex gap-3">
                        <input type="text" name="accountNumber" value={config.accountNumber} onChange={handleConfigChange} className="w-1/2 px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#B4F442] outline-none" placeholder="Account Number" />
                        <input type="text" name="accountType" value={config.accountType} onChange={handleConfigChange} className="w-1/2 px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#B4F442] outline-none" placeholder="Account Type (e.g. Checking)" />
                      </div>
                      <div className="flex gap-3">
                        <input type="text" name="swiftCode" value={config.swiftCode} onChange={handleConfigChange} className="w-1/2 px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#B4F442] outline-none" placeholder="SWIFT / BIC" />
                        <input type="text" name="routingNumber" value={config.routingNumber} onChange={handleConfigChange} className="w-1/2 px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#B4F442] outline-none" placeholder="Routing / IBAN" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Source / CSV Upload */}
              <div className="glass-panel p-8 rounded-3xl space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-500" /> Time Report Data
                </h3>

                <div className="relative group cursor-pointer">
                  <div className={`absolute inset-0 rounded-2xl border-2 border-dashed transition-colors ${csvFile ? 'border-green-400 bg-green-50/50' : 'border-slate-300 bg-slate-50/50 group-hover:border-indigo-400 group-hover:bg-indigo-50/30'}`}></div>
                  <input type="file" accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => setCsvFile(e.target.files[0])} />
                  <div className="relative p-8 text-center space-y-3">
                    <FileText className={`w-10 h-10 mx-auto ${csvFile ? 'text-green-500' : 'text-slate-400'}`} />
                    <div>
                      <p className="font-bold text-lg text-slate-700">{csvFile ? csvFile.name : 'Upload Clockify CSV'}</p>
                      <p className="text-sm text-slate-500">{csvFile ? 'Ready to generate' : 'Drag & drop or click to browse'}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column (Client & Basic Info) */}
            <div className="space-y-8">

              {/* Bill To */}
              <div className="glass-panel p-8 rounded-3xl space-y-6">
                <h3 className="font-bold text-lg">Bill To</h3>

                <div className="space-y-4">
                  <input type="text" name="clientName" value={config.clientName} onChange={handleConfigChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none" placeholder="Client Name" />
                  <input type="email" name="clientEmail" value={config.clientEmail} onChange={handleConfigChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none" placeholder="Client Email" />
                  <input type="text" name="clientCompany" value={config.clientCompany} onChange={handleConfigChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none" placeholder="Company Name" />
                  <textarea name="clientAddress" value={config.clientAddress} onChange={handleConfigChange} rows="2" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none resize-none" placeholder="Client Address"></textarea>
                </div>
              </div>

              {/* Basic Info & Generation */}
              <div className="glass-panel p-8 rounded-3xl space-y-6">
                <h3 className="font-bold text-lg">Basic Info</h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice Number</label>
                    <input
                      type="text"
                      name="invoiceNumber"
                      value={config.invoiceNumber}
                      onChange={handleConfigChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none"
                      placeholder="INV-001"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice Date</label>
                    <input
                      type="date"
                      name="invoiceDate"
                      value={config.invoiceDate}
                      onChange={handleConfigChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hourly Rate ($)</label>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={config.hourlyRate}
                      onChange={handleConfigChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full py-4 rounded-xl bg-[#B4F442] text-slate-900 font-bold text-lg shadow-[0_8px_20px_rgba(180,244,66,0.4)] hover:shadow-[0_8px_24px_rgba(180,244,66,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Send Invoice
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}

export default App;
