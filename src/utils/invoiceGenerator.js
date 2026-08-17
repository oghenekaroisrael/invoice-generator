import Papa from 'papaparse';
import { createTemplateWorkbook } from './templateMaker';

/**
 * Generates an Excel invoice from a CSV file of time entries and triggers a download.
 *
 * @param {File} csvFile - The CSV file containing task descriptions and time logged.
 * @param {Object} config - The configuration object for the invoice.
 * @param {string} config.invoiceNumber - The invoice number to display.
 * @param {string} config.invoiceDate - The invoice date in YYYY-MM-DD format.
 * @param {string|number} config.hourlyRate - The hourly billing rate.
 * @returns {Promise<void>} Resolves when the invoice has been successfully generated and downloaded.
 */
export const generateInvoice = async (csvFile, config) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const tasks = results.data;
          const taskCount = tasks.length;

          const workbook = createTemplateWorkbook();
          const worksheet = workbook.worksheets[0];

          if (config.invoiceNumber) {
            worksheet.getCell('A2').value = {
              richText: [
                { font: { name: 'Raleway', bold: true, color: { theme: 1 } }, text: 'Invoice Number: ' },
                { font: { name: 'Raleway', bold: true, color: { theme: 1 } }, text: config.invoiceNumber }
              ]
            };
          }

          if (config.invoiceDate) {
            worksheet.getCell('A3').value = {
              richText: [
                { font: { name: 'Raleway', bold: true, color: { theme: 1 } }, text: 'Date: ' },
                { font: { name: 'Raleway', bold: true, color: { theme: 1 } }, text: config.invoiceDate }
              ]
            };
          }

          // Update Bill To (A4)
          const billToName = config.clientCompany || config.clientName || 'Client';
          worksheet.getCell('A4').value = {
            richText: [
              { font: { name: 'Raleway', bold: true, color: { theme: 1 } }, text: 'BILL TO: ' },
              { font: { name: 'Raleway', bold: true, color: { theme: 1 } }, text: billToName }
            ]
          };

          const billDetails = [];
          if (config.clientName && config.clientCompany) {
            billDetails.push(config.clientName);
          }
          if (config.clientEmail) {
            billDetails.push(config.clientEmail);
          }
          if (config.clientAddress) {
            billDetails.push(...config.clientAddress.split('\n'));
          }

          const L = billDetails.length;

          // Delete original 3 blank rows (5, 6, 7)
          worksheet.spliceRows(5, 3);

          // Insert L + 1 blank rows (L for details, 1 for the visual separator before headers)
          worksheet.spliceRows(5, 0, ...new Array(L + 1).fill([]));

          // Write bill details
          for (let i = 0; i < L; i++) {
            worksheet.getCell(`A${5 + i}`).value = billDetails[i];
            worksheet.getCell(`A${5 + i}`).style = {
              font: { name: 'Raleway', color: { theme: 1 } },
              alignment: { vertical: 'bottom' }
            };
          }

          // Calculate top shift for everything below
          const topShift = (L + 1) - 3;

          const originalTaskCount = 49;
          const startRow = 9 + topShift;
          const newBlankRowAfterTasks = 58 + topShift;

          if (taskCount > originalTaskCount) {
            const rowsToAdd = taskCount - originalTaskCount;
            worksheet.spliceRows(newBlankRowAfterTasks, 0, ...new Array(rowsToAdd).fill([]));

            for (let i = 0; i < rowsToAdd; i++) {
              const rowNum = newBlankRowAfterTasks + i;
              ['A', 'B', 'C', 'D'].forEach(col => {
                const cell = worksheet.getCell(`${col}${rowNum}`);
                cell.font = { name: 'Raleway', size: 10 };
                if (col !== 'A') {
                  cell.alignment = { horizontal: 'center' };
                }
              });
            }
          } else if (taskCount < originalTaskCount) {
            const rowsToDelete = originalTaskCount - taskCount;
            worksheet.spliceRows(startRow + taskCount, rowsToDelete);
          }

          // Calculate the total shift for account details based on task count AND top shift
          const taskShift = taskCount - originalTaskCount;
          const totalShift = topShift + taskShift;
          let accountRow = 63 + totalShift; // 62+totalShift is the "ACCOUNT DETAILS" header

          const addAccountDetail = (label, value) => {
            if (!value) return;
            worksheet.getCell(`A${accountRow}`).value = {
              richText: [
                { font: { name: 'Raleway', bold: true, color: { theme: 1 } }, text: `${label}: ` },
                { font: { name: 'Raleway', bold: true, color: { theme: 1 } }, text: value }
              ]
            };
            worksheet.getCell(`A${accountRow}`).style = {
              font: { name: 'Raleway' },
              alignment: { vertical: 'bottom', readingOrder: 'ltr' }
            };
            accountRow++;
          };

          // Clear original dummy data in the Account Details section before writing dynamically
          worksheet.getCell(`A${accountRow}`).value = null;
          worksheet.getCell(`A${accountRow + 1}`).value = null;
          worksheet.getCell(`A${accountRow + 2}`).value = null;

          addAccountDetail('Bank Name', config.bankName);
          addAccountDetail('Bank Address', config.bankAddress);
          addAccountDetail('Account Name', config.accountName);
          addAccountDetail('Account Number', config.accountNumber);
          addAccountDetail('Account Type', config.accountType);
          addAccountDetail('Routing Number', config.routingNumber);
          addAccountDetail('SWIFT/BIC', config.swiftCode);
          addAccountDetail('Address 1', config.accountAddress1);
          addAccountDetail('Address 2', config.accountAddress2);

          let totalHours = 0;
          let currentRow = startRow;

          tasks.forEach((task) => {
            const description = task.Description || task.Task || task.Name || '';
            const hoursDecimal = parseFloat(task['Time (decimal)'] || task.Hours || task['Time (h)'] || 0);
            const rate = parseFloat(config.hourlyRate) || 11.54;
            const total = Number((hoursDecimal * rate).toFixed(2));

            worksheet.getCell(`A${currentRow}`).value = description;
            worksheet.getCell(`B${currentRow}`).value = hoursDecimal;
            worksheet.getCell(`C${currentRow}`).value = rate;
            worksheet.getCell(`D${currentRow}`).value = total;

            totalHours += hoursDecimal;
            currentRow++;
          });

          const grandTotalRow = startRow + taskCount + 1;
          const grandTotal = Number((totalHours * (parseFloat(config.hourlyRate) || 11.54)).toFixed(2));

          worksheet.getCell(`B${grandTotalRow}`).value = totalHours;
          worksheet.getCell(`D${grandTotalRow}`).value = grandTotal;

          const buffer = await workbook.xlsx.writeBuffer();
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = `Invoice_${config.invoiceNumber || 'Generated'}.xlsx`;
          link.click();

          URL.revokeObjectURL(url);
          resolve();
        } catch (error) {
          console.error("Error generating invoice:", error);
          reject(error);
        }
      },
      error: (error) => reject(error)
    });
  });
};
