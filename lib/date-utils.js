/**
 * Utility functions for handling dates in a timezone-safe way
 */

/**
 * Múi giờ Việt Nam là UTC+7
 */
const VIETNAM_TIMEZONE_OFFSET = 7; // 7 hours

/**
 * Returns a YYYY-MM-DD date string in Vietnam timezone (GMT+7), avoiding UTC conversion issues
 * @param {Date|string} date - The date to convert (can be Date object or string)
 * @returns {string} The date in YYYY-MM-DD format in Vietnam timezone
 */
export function getLocalDateString(date) {
  // Xử lý trường hợp tham số là chuỗi
  let dateObj;
  
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    // Nếu không phải Date hoặc chuỗi, trả về ngày hiện tại
    dateObj = new Date();
  }
  
  // Kiểm tra xem dateObj có hợp lệ không
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    // Fallback to current date
    dateObj = new Date();
  }
  
  // Phương pháp mới: dùng formatter để đảm bảo đúng giờ Việt Nam
  try {
    // Sử dụng DateTimeFormat để format theo giờ Việt Nam
    const options = { 
      timeZone: 'Asia/Ho_Chi_Minh', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    };
    
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    return formatter.format(dateObj).replace(/\//g, '-');
  } catch (e) {
    // Fallback method nếu Intl API không khả dụng
    const utcTime = new Date(dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000));
    const vietnamTime = new Date(utcTime.getTime() + (VIETNAM_TIMEZONE_OFFSET * 3600000));
    
    const yyyy = vietnamTime.getUTCFullYear();
    const mm = String(vietnamTime.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(vietnamTime.getUTCDate()).padStart(2, '0');
    
    return `${yyyy}-${mm}-${dd}`;
  }
}

/**
 * Returns today's date as YYYY-MM-DD in Vietnam timezone (GMT+7)
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export function getTodayDateString() {
  return getLocalDateString(new Date());
}

/**
 * Parses a date string and returns a YYYY-MM-DD in Vietnam timezone
 * @param {string} dateString - Date string to parse
 * @returns {string} The parsed date in YYYY-MM-DD format
 */
export function parseDateString(dateString) {
  // Kiểm tra nếu là định dạng dd/mm/yyyy phổ biến ở Việt Nam
  if (typeof dateString === 'string') {
    // Regex cho định dạng dd/mm/yyyy hoặc d/m/yyyy
    const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateString.match(ddmmyyyyRegex);
    
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      
      // Tạo đối tượng Date (lưu ý: tháng trong JS bắt đầu từ 0)
      const date = new Date(year, month - 1, day);
      return getLocalDateString(date);
    }
  }
  
  // Nếu không phải định dạng dd/mm/yyyy, xử lý bình thường
  return getLocalDateString(dateString);
}

/**
 * Kiểm tra xem một ngày có phải hôm nay (theo giờ Việt Nam) hay không
 * @param {Date|string} date - Ngày cần kiểm tra
 * @returns {boolean} True nếu là ngày hôm nay, false nếu không phải
 */
export function isToday(date) {
  return getLocalDateString(date) === getTodayDateString();
}

/**
 * Chuyển đổi đối tượng Date sang chuỗi DateTime đầy đủ theo định dạng Việt Nam
 * @param {Date|string} date - Ngày cần chuyển đổi
 * @returns {string} Chuỗi định dạng 'YYYY-MM-DD HH:MM:SS (GMT+7)'
 */
export function getLocalDateTimeString(date) {
  let dateObj;
  
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date();
  }
  
  // Kiểm tra xem dateObj có hợp lệ không
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    dateObj = new Date();
  }
  
  try {
    // Sử dụng DateTimeFormat để format theo giờ Việt Nam
    const dateOptions = { 
      timeZone: 'Asia/Ho_Chi_Minh', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    };
    
    const timeOptions = {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    
    const dateFormatter = new Intl.DateTimeFormat('en-CA', dateOptions);
    const timeFormatter = new Intl.DateTimeFormat('en-US', timeOptions);
    
    const dateStr = dateFormatter.format(dateObj).replace(/\//g, '-');
    const timeStr = timeFormatter.format(dateObj);
    
    return `${dateStr} ${timeStr} (GMT+7)`;
  } catch (e) {
    // Fallback method
    const dateStr = getLocalDateString(dateObj);
    const utcTime = new Date(dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000));
    const vietnamTime = new Date(utcTime.getTime() + (VIETNAM_TIMEZONE_OFFSET * 3600000));
    
    const hours = String(vietnamTime.getUTCHours()).padStart(2, '0');
    const minutes = String(vietnamTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(vietnamTime.getUTCSeconds()).padStart(2, '0');
    
    return `${dateStr} ${hours}:${minutes}:${seconds} (GMT+7)`;
  }
}

/**
 * Trả về chuỗi timestamp ISO8601 theo múi giờ Việt Nam (GMT+7)
 * Hữu ích khi cần lưu trữ thời gian chính xác đã điều chỉnh theo múi giờ Vietnam
 * 
 * @param {Date|string} [date=new Date()] - Ngày cần chuyển đổi, mặc định là thời điểm hiện tại
 * @returns {string} Chuỗi ISO8601 đã điều chỉnh theo múi giờ Việt Nam
 */
export function getLocalISOString(date = new Date()) {
  let dateObj;
  
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date();
  }
  
  // Kiểm tra xem dateObj có hợp lệ không
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    dateObj = new Date();
  }
  
  try {
    // Tạo đối tượng Date theo múi giờ Việt Nam
    const utcTime = new Date(dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000));
    const vietnamTime = new Date(utcTime.getTime() + (VIETNAM_TIMEZONE_OFFSET * 3600000));
    
    return vietnamTime.toISOString();
  } catch (e) {
    console.error('Error generating ISO string with Vietnam timezone:', e);
    return new Date().toISOString(); // Fallback to system time
  }
}
