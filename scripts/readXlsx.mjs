import xlsx from 'xlsx';

const wb = xlsx.readFile('C:/Users/yudai/Downloads/skincare_database_complete.xlsx');
console.log('シート一覧:', wb.SheetNames);

for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name];
  const data = xlsx.utils.sheet_to_json(ws, { defval: '' });
  console.log(`\n=== ${name} (${data.length}行) ===`);
  if (data.length > 0) {
    console.log('カラム:', Object.keys(data[0]));
    console.log('先頭3行:');
    data.slice(0, 3).forEach((r, i) => console.log(i + ':', JSON.stringify(r)));
  }
}
