// Debug script để kiểm tra vấn đề định dạng ngày giữa database và UI
// Chạy script này để phát hiện vấn đề

console.log("Script starting...");

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);

// Định dạng ngày hiện tại theo các cách khác nhau
console.log('📅 Format Check');
console.log('------------------------------------------------');
console.log('Ngày hiện tại:', today);
console.log('ISO format split T[0]:', today.toISOString().split('T')[0]); // YYYY-MM-DD
console.log('ISO format full:', today.toISOString()); 
console.log('Date string:', today.toString());
console.log('------------------------------------------------');

// Các ngày task trong database
const taskDates = [
  'Wed May 28 2025 00:00:00 GMT+0700 (Indochina Time)',
  'Thu May 29 2025 00:00:00 GMT+0700 (Indochina Time)',
  'Tue May 27 2025 00:00:00 GMT+0700 (Indochina Time)'
];

// Format theo cách TrelloTasks component cần
console.log('🔍 Database ngày và ISO Format');
console.log('------------------------------------------------');
taskDates.forEach(dateStr => {
  const date = new Date(dateStr);
  const isoFormat = date.toISOString().split('T')[0];
  
  console.log(`Database date: "${dateStr}"`);
  console.log(`ISO format:    "${isoFormat}"`);
  console.log('------------------------------------------------');
});

// Kiểm tra so sánh ngày đối với ngày hiện tại (selectedDate trong TrelloTasks)
const selectedDate = today.toISOString().split('T')[0];
console.log('🧪 So sánh ngày cho filtering');
console.log('------------------------------------------------');
console.log('selectedDate trong component:', selectedDate);

taskDates.forEach(dateStr => {
  const date = new Date(dateStr);
  const taskDate = date.toISOString().split('T')[0];
  const matches = taskDate === selectedDate;
  
  console.log(`Task date: ${dateStr}`);
  console.log(`Converted: ${taskDate}`);
  console.log(`Matches selectedDate (${selectedDate})? ${matches ? 'YES' : 'NO'}`);
  console.log('------------------------------------------------');
});

// So sánh với ngày 29/05/2025 (theo hiện tại)
console.log('📌 So sánh với ngày 29/05/2025');
console.log('------------------------------------------------');
const specificDate = '2025-05-29';
taskDates.forEach(dateStr => {
  const date = new Date(dateStr);
  const taskDate = date.toISOString().split('T')[0];
  const matches = taskDate === specificDate;
  
  console.log(`Task date: ${dateStr}`);
  console.log(`Converted: ${taskDate}`);
  console.log(`Matches 2025-05-29? ${matches ? 'YES' : 'NO'}`);
  console.log('------------------------------------------------');
});
