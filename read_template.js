import ExcelJS from 'exceljs';

async function analyze() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('./public/Invoice_Eternus_May_2026.xlsx');
  const sheet = workbook.worksheets[0];
  
  console.log(`Sheet Name: ${sheet.name}`);
  console.log(`Rows: ${sheet.rowCount}`);
  
  console.log('A2:', JSON.stringify(sheet.getCell('A2').value));
  console.log('A3:', JSON.stringify(sheet.getCell('A3').value));
  console.log('A4:', JSON.stringify(sheet.getCell('A4').value));
  console.log('B2:', JSON.stringify(sheet.getCell('B2').value));
  console.log('B3:', JSON.stringify(sheet.getCell('B3').value));
  console.log('B4:', JSON.stringify(sheet.getCell('B4').value));
  console.log('C2:', JSON.stringify(sheet.getCell('C2').value));
  console.log('D2:', JSON.stringify(sheet.getCell('D2').value));
}

analyze().catch(console.error);
