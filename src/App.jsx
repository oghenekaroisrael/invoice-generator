import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import {
  FileSpreadsheet,
  FileText,
  Search,
  Download,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  Building,
  Settings
} from 'lucide-react';
import { generateInvoice } from './utils/invoiceGenerator';

/**
 * Accordion Component for grouping form sections
 */
const Accordion = ({ title, icon: Icon, isOpen, onToggle, children }) => (
  <div className="glass-panel rounded-3xl shadow-sm border border-slate-200/50 bg-white/60">
    <button
      onClick={onToggle}
      className={`w-full p-5 flex items-center justify-between text-left hover:bg-white/40 transition-colors ${isOpen ? 'rounded-t-3xl' : 'rounded-3xl'}`}
    >
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-indigo-50/80 text-indigo-600 rounded-2xl shadow-sm">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-lg text-slate-800">{title}</h3>
      </div>
      <div className={`p-1.5 rounded-full transition-colors ${isOpen ? 'bg-indigo-50 text-indigo-500' : 'text-slate-400'}`}>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </div>
    </button>
    {isOpen && (
      <div className="p-6 pt-2 border-t border-slate-100/50">
        {children}
      </div>
    )}
  </div>
);

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
  const [tasks, setTasks] = useState([]);
  const [expandedSection, setExpandedSection] = useState('settings');

  useEffect(() => {
    if (csvFile) {
      Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => setTasks(results.data),
        error: (err) => console.error('Error parsing CSV for preview:', err)
      });
    } else {
      setTasks([]);
    }
  }, [csvFile]);

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

  const rate = parseFloat(config.hourlyRate) || 11.54;
  const totalHours = tasks.reduce((sum, task) => sum + parseFloat(task['Time (decimal)'] || task.Hours || task['Time (h)'] || 0), 0);
  const grandTotal = totalHours * rate;

  const renderAddressLines = (address) => {
    if (!address) return null;
    return address.split('\n').map((line, idx) => (
      <div key={idx}>{line}</div>
    ));
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-800">
      <main className="flex-1 h-full relative flex flex-col lg:flex-row gap-8 p-4 md:p-6 lg:p-8 bg-transparent">

        {/* Left Side: Forms (Scrollable + Sticky Footer) */}
        <div className="w-full lg:w-[450px] xl:w-[500px] flex-shrink-0 h-full flex flex-col gap-0 lg:pr-4">

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-12 custom-scrollbar pr-2" style={{ scrollbarWidth: 'thin' }}>

            {/* Hero / Title Section */}
            <div className="text-center space-y-3 pt-2 mb-4">
              <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
                Invoice Generator
              </h1>
              <div className="inline-flex items-center gap-2 bg-indigo-50/80 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-bold border border-indigo-100 shadow-sm">
                Invoice: {config.invoiceNumber || 'INV-000'}
              </div>
            </div>

            {error && (
              <div className="bg-red-50/90 backdrop-blur-md border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 text-red-700 shadow-sm text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Accordion 1: Invoice Settings */}
            <Accordion title="Invoice Settings" icon={Settings} isOpen={expandedSection === 'settings'} onToggle={() => setExpandedSection(expandedSection === 'settings' ? null : 'settings')}>
              <div className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice Number</label>
                    <input type="text" name="invoiceNumber" value={config.invoiceNumber} onChange={handleConfigChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none" placeholder="INV-001" />
                  </div>
                  <div className="flex gap-4">
                    <div className="space-y-1.5 w-1/2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</label>
                      <input type="date" name="invoiceDate" value={config.invoiceDate} onChange={handleConfigChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none" />
                    </div>
                    <div className="space-y-1.5 w-1/2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rate ($)</label>
                      <input type="number" name="hourlyRate" value={config.hourlyRate} onChange={handleConfigChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none" />
                    </div>
                  </div>
                </div>

                {/* Data Source / CSV Upload */}
                <div className="pt-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Time Report Data</label>
                  <div className="relative group cursor-pointer">
                    <div className={`absolute inset-0 rounded-2xl border-2 border-dashed transition-colors ${csvFile ? 'border-green-400 bg-green-50/50' : 'border-slate-300 bg-slate-50/50 group-hover:border-indigo-400 group-hover:bg-indigo-50/30'}`}></div>
                    <input type="file" accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => setCsvFile(e.target.files[0])} />
                    <div className="relative p-6 text-center space-y-3">
                      <FileText className={`w-8 h-8 mx-auto ${csvFile ? 'text-green-500' : 'text-slate-400'}`} />
                      <div>
                        <p className="font-bold text-sm text-slate-700 truncate px-2">{csvFile ? csvFile.name : 'Upload Clockify CSV'}</p>
                        <p className="text-xs text-slate-500">{csvFile ? 'Ready to generate' : 'Drag & drop or click'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Accordion>

            {/* Accordion 2: Client Details */}
            <Accordion title="Client Details" icon={User} isOpen={expandedSection === 'client'} onToggle={() => setExpandedSection(expandedSection === 'client' ? null : 'client')}>
              <div className="space-y-3">
                <input type="text" name="clientName" value={config.clientName} onChange={handleConfigChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none" placeholder="Client Name" />
                <input type="email" name="clientEmail" value={config.clientEmail} onChange={handleConfigChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none" placeholder="Client Email" />
                <input type="text" name="clientCompany" value={config.clientCompany} onChange={handleConfigChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none" placeholder="Company Name" />
                <textarea name="clientAddress" value={config.clientAddress} onChange={handleConfigChange} rows="2" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none resize-none" placeholder="Client Address"></textarea>
              </div>
            </Accordion>

            {/* Accordion 3: Company & Banking */}
            <Accordion title="Company & Banking" icon={Building} isOpen={expandedSection === 'bank'} onToggle={() => setExpandedSection(expandedSection === 'bank' ? null : 'bank')}>
              <div className="space-y-3">
                <input type="text" name="accountName" value={config.accountName} onChange={handleConfigChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none" placeholder="Company Name" />
                <input type="email" name="accountEmail" value={config.accountEmail} onChange={handleConfigChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none" placeholder="Email" />
                <input type="text" name="accountAddress1" value={config.accountAddress1} onChange={handleConfigChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none" placeholder="Address Line 1" />
                <input type="text" name="bankName" value={config.bankName} onChange={handleConfigChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none" placeholder="Bank Name" />
                <div className="flex gap-3">
                  <input type="text" name="accountNumber" value={config.accountNumber} onChange={handleConfigChange} className="w-1/2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none" placeholder="Account Number" />
                  <input type="text" name="accountType" value={config.accountType} onChange={handleConfigChange} className="w-1/2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none" placeholder="Account Type" />
                </div>
                <div className="flex gap-3">
                  <input type="text" name="routingNumber" value={config.routingNumber} onChange={handleConfigChange} className="w-1/2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none" placeholder="Routing / IBAN" />
                  <input type="text" name="swiftCode" value={config.swiftCode} onChange={handleConfigChange} className="w-1/2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#B4F442] focus:border-transparent transition-all outline-none" placeholder="SWIFT / BIC" />
                </div>
              </div>
            </Accordion>

          </div>

          {/* Sticky Footer */}
          <div className="pt-4 pb-2 mt-auto bg-transparent z-10 pr-2">
            <button onClick={handleGenerate} disabled={isLoading} className="w-full py-4 rounded-2xl bg-[#B4F442] text-slate-900 font-extrabold text-lg shadow-[0_8px_20px_rgba(180,244,66,0.3)] hover:shadow-[0_8px_28px_rgba(180,244,66,0.6)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3">
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <><Download className="w-6 h-6" /> Send Invoice</>
              )}
            </button>
          </div>

        </div>

        {/* Right Side: Preview (Scrollable) */}
        <div className="flex-1 h-full overflow-y-auto pb-12 lg:pl-2" style={{ scrollbarWidth: 'thin' }}>

          <div className="glass-panel p-8 md:p-12 rounded-3xl bg-white shadow-2xl min-h-max">
            <h2 className="text-2xl font-bold mb-8 text-center text-slate-700 flex items-center justify-center gap-2">
              <Search className="w-6 h-6" /> Real-time Invoice Preview
            </h2>

            <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-sm shadow-md p-10 font-sans text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }}>

              {/* Header */}
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h1 className="text-4xl font-extrabold text-slate-800 tracking-widest mb-4">INVOICE</h1>
                  <div className="text-sm font-semibold">
                    <span className="text-slate-500">Invoice Number: </span>{config.invoiceNumber || 'INV-XXX'}
                  </div>
                  <div className="text-sm font-semibold">
                    <span className="text-slate-500">Date: </span>{config.invoiceDate}
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="mb-12">
                <h3 className="font-bold text-lg text-slate-800 mb-2">BILL TO:</h3>
                <div className="font-bold text-lg">{config.clientCompany || config.clientName || 'Client Name'}</div>
                {config.clientCompany && config.clientName && <div className="text-sm font-medium">{config.clientName}</div>}
                {config.clientEmail && <div className="text-sm">{config.clientEmail}</div>}
                <div className="text-sm mt-1">{renderAddressLines(config.clientAddress)}</div>
              </div>

              {/* Tasks Table */}
              <div className="mb-12">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 text-slate-800">
                      <th className="py-3 font-bold">Task Description</th>
                      <th className="py-3 font-bold text-right">Hours</th>
                      <th className="py-3 font-bold text-right">Rate ($)</th>
                      <th className="py-3 font-bold text-right">Total ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.length > 0 ? (
                      tasks.map((task, idx) => {
                        const description = task.Description || task.Task || task.Name || '';
                        const hours = parseFloat(task['Time (decimal)'] || task.Hours || task['Time (h)'] || 0);
                        const total = hours * rate;
                        return (
                          <tr key={idx} className="border-b border-slate-100">
                            <td className="py-3 text-slate-700">{description}</td>
                            <td className="py-3 text-right text-slate-600">{hours.toFixed(2)}</td>
                            <td className="py-3 text-right text-slate-600">{rate.toFixed(2)}</td>
                            <td className="py-3 text-right text-slate-700 font-medium">{total.toFixed(2)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-slate-400 italic border-b border-slate-100">No tasks found. Upload a CSV to preview entries.</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold text-lg">
                      <td className="py-4"></td>
                      <td className="py-4 text-right border-t-2 border-slate-300">{totalHours.toFixed(2)}</td>
                      <td className="py-4"></td>
                      <td className="py-4 text-right border-t-2 border-slate-300 text-slate-900">{grandTotal.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Account Details */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="font-bold text-lg text-slate-800 mb-4">ACCOUNT DETAILS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  {config.bankName && <div><span className="font-bold text-slate-500">Bank Name: </span><span className="font-medium">{config.bankName}</span></div>}
                  {config.accountName && <div><span className="font-bold text-slate-500">Account Name: </span><span className="font-medium">{config.accountName}</span></div>}
                  {config.accountNumber && <div><span className="font-bold text-slate-500">Account Number: </span><span className="font-medium">{config.accountNumber}</span></div>}
                  {config.bankAddress && <div><span className="font-bold text-slate-500">Bank Address: </span><span className="font-medium">{config.bankAddress}</span></div>}
                  {config.accountType && <div><span className="font-bold text-slate-500">Account Type: </span><span className="font-medium">{config.accountType}</span></div>}
                  {config.routingNumber && <div><span className="font-bold text-slate-500">Routing Number: </span><span className="font-medium">{config.routingNumber}</span></div>}
                  {config.swiftCode && <div><span className="font-bold text-slate-500">SWIFT/BIC: </span><span className="font-medium">{config.swiftCode}</span></div>}
                  {config.accountAddress1 && <div><span className="font-bold text-slate-500">Address 1: </span><span className="font-medium">{config.accountAddress1}</span></div>}
                  {config.accountAddress2 && <div><span className="font-bold text-slate-500">Address 2: </span><span className="font-medium">{config.accountAddress2}</span></div>}
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
