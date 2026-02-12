
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  getLunarDate, 
  getCanChiYear, 
  getCanChiMonth, 
  getCanChiDay, 
  CAN, 
  CHI 
} from './lunarUtils';
import { fillLunarGaps } from './lunarData';

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTHS_VN = [
  "Tháng Giêng", "Tháng Hai", "Tháng Ba", "Tháng Tư", "Tháng Năm", "Tháng Sáu",
  "Tháng Bảy", "Tháng Tám", "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Chạp"
];

// Major Public Holidays in Vietnam for 2026
const HOLIDAYS_2026 = [
  "2026-01-01", // Tết Dương Lịch
  "2026-02-16", // Giao thừa Tết Nguyên Đán
  "2026-02-17", // Mùng 1 Tết
  "2026-02-18", // Mùng 2 Tết
  "2026-02-19", // Mùng 3 Tết
  "2026-02-20", // Mùng 4 Tết
  "2026-02-21", // Mùng 5 Tết
  "2026-02-22", // Mùng 6 Tết
  "2026-04-26", // Giỗ tổ Hùng Vương (10/3 Âm lịch)
  "2026-04-30", // Ngày Giải Phóng Miền Nam
  "2026-05-01", // Quốc Tế Lao Động
  "2026-09-02", // Quốc Khánh
  "2026-09-03", // Nghỉ lễ Quốc Khánh
];

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 0, 1));
  const [insight, setInsight] = useState<string>("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY || "" }), []);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= lastDay; d++) {
      days.push(new Date(currentYear, currentMonth, d));
    }
    return days;
  }, [currentYear, currentMonth]);

  const fetchInsight = useCallback(async (date: Date) => {
    setLoadingInsight(true);
    setInsight("");
    try {
      const lunar = fillLunarGaps(date.getFullYear(), date.getMonth() + 1, date.getDate());
      const canChiDay = getCanChiDay(getJulianDay(date.getDate(), date.getMonth() + 1, date.getFullYear()));
      const canChiMonth = getCanChiMonth(lunar.month, lunar.year);
      const canChiYear = getCanChiYear(lunar.year);

      const prompt = `
        Tôi đang xem lịch vạn niên cho ngày dương ${date.toLocaleDateString('vi-VN')}.
        Ngày âm tương ứng là ngày ${lunar.day} tháng ${lunar.month}${lunar.leap ? ' nhuận' : ''} năm ${canChiYear}.
        Can chi: Ngày ${canChiDay}, Tháng ${canChiMonth}, Năm ${canChiYear}.
        Hãy cho tôi biết ngắn gọn (khoảng 100 từ):
        1. Ý nghĩa của ngày này theo phong thủy Việt Nam.
        2. Đây có phải là ngày tốt để làm việc gì (khai trương, cưới hỏi, xuất hành...)?
        3. Một câu danh ngôn hoặc lời khuyên tích cực cho ngày này.
        Trả lời theo phong cách ấm áp, truyền thống bằng tiếng Việt.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setInsight(response.text || "Không có thông tin cho ngày này.");
    } catch (error) {
      console.error("Error fetching insight:", error);
      setInsight("Hiện không thể kết nối với trí tuệ nhân tạo để lấy thông tin chi tiết.");
    } finally {
      setLoadingInsight(false);
    }
  }, [ai]);

  useEffect(() => {
    fetchInsight(selectedDate);
  }, [selectedDate, fetchInsight]);

  const handlePrevMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    if (newDate.getFullYear() >= 2026 || (newDate.getFullYear() === 2025 && newDate.getMonth() >= 11)) {
        setCurrentDate(newDate);
    }
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    if (newDate.getFullYear() <= 2026) {
        setCurrentDate(newDate);
    }
  };

  function getJulianDay(d: number, m: number, y: number): number {
    const a = Math.floor((14 - m) / 12);
    const year = y + 4800 - a;
    const month = m + 12 * a - 3;
    return d + Math.floor((153 * month + 2) / 5) + 365 * year + Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400) - 32045;
  }

  const selectedLunar = fillLunarGaps(selectedDate.getFullYear(), selectedDate.getMonth() + 1, selectedDate.getDate());
  const selectedCanChiDay = getCanChiDay(getJulianDay(selectedDate.getDate(), selectedDate.getMonth() + 1, selectedDate.getFullYear()));

  /**
   * Safe holiday detection using local date parts to avoid timezone shifts from toISOString()
   */
  const isHoliday = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return HOLIDAYS_2026.includes(dateStr);
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header section */}
      <header className="bg-calendar-red text-white p-6 shadow-xl text-center">
        <h1 className="text-3xl font-serif mb-1">Lịch Vạn Niên 2026</h1>
        <p className="opacity-80 uppercase tracking-widest text-sm">Năm Bính Ngọ - Thiên Thượng Hỏa</p>
      </header>

      <main className="max-w-4xl mx-auto mt-8 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Monthly Calendar */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-lg overflow-hidden border-t-8 border-calendar-red">
          <div className="p-4 flex justify-between items-center bg-gray-50 border-b">
            <button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors text-calendar-red font-bold"
            >
              &larr; Tháng trước
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 uppercase">Tháng {currentMonth + 1} / {currentYear}</h2>
            </div>
            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors text-calendar-red font-bold"
            >
              Tháng sau &rarr;
            </button>
          </div>

          <div className="calendar-grid bg-gray-100 border-b">
            {WEEKDAYS.map((day, idx) => (
              <div key={idx} className={`text-center py-2 text-xs font-bold uppercase ${idx === 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-grid bg-white">
            {daysInMonth.map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} className="h-24 md:h-28 border-r border-b bg-gray-50"></div>;
              
              const isSelected = selectedDate.getTime() === date.getTime();
              const isToday = new Date().toDateString() === date.toDateString();
              const lunar = fillLunarGaps(date.getFullYear(), date.getMonth() + 1, date.getDate());
              const isFirstOrFull = lunar.day === 1 || lunar.day === 15;
              const isSunday = date.getDay() === 0;
              const isSpecialHoliday = isHoliday(date);

              // Styling logic based on user request
              let bgColor = 'bg-white';
              if (isSelected) {
                bgColor = 'bg-red-50';
              } else if (isSpecialHoliday) {
                bgColor = 'bg-red-100'; // Đỏ nhạt cho lễ tết
              } else if (isSunday) {
                bgColor = 'bg-yellow-100'; // Màu vàng cho chủ nhật
              }

              return (
                <div 
                  key={date.toISOString()} 
                  onClick={() => setSelectedDate(date)}
                  className={`h-24 md:h-28 border-r border-b p-1 flex flex-col items-center justify-center cursor-pointer transition-all relative
                    ${bgColor}
                    ${isSelected ? 'ring-2 ring-calendar-red ring-inset z-10 shadow-inner' : 'hover:bg-opacity-80'}
                  `}
                >
                  <span className={`text-xl md:text-2xl font-bold ${isSunday || isSpecialHoliday ? 'text-red-600' : 'text-gray-800'}`}>
                    {date.getDate()}
                  </span>
                  <span className={`text-[10px] md:text-xs font-medium mt-1 ${isFirstOrFull || isSpecialHoliday ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                    {lunar.day === 1 ? `${lunar.day}/${lunar.month}` : lunar.day}
                  </span>
                  {isToday && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-calendar-red rounded-full"></div>
                  )}
                  {isSpecialHoliday && (
                    <div className="absolute bottom-1 right-1 text-[8px] text-red-600 font-bold opacity-60 uppercase hidden md:block">
                      Tết/Lễ
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Detail Panel */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-lg border-t-8 border-yellow-500 overflow-hidden">
            <div className="p-6 text-center bg-yellow-50">
              <p className="text-gray-500 uppercase tracking-wider text-xs mb-2">Thông tin chi tiết</p>
              <div className="text-6xl font-serif text-calendar-red mb-2">{selectedDate.getDate()}</div>
              <p className="text-gray-700 font-medium">{MONTHS_VN[selectedDate.getMonth()]} năm {selectedDate.getFullYear()}</p>
              <div className="mt-4 border-t border-yellow-200 pt-4">
                <p className="text-sm text-gray-500 italic">Âm lịch</p>
                <div className="text-xl font-bold text-gray-800">
                  Ngày {selectedLunar.day} tháng {selectedLunar.month}{selectedLunar.leap ? ' (Nhuận)' : ''}
                </div>
                <p className="text-sm text-gray-600 mt-1 uppercase font-semibold">
                  Năm {getCanChiYear(selectedLunar.year)}
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 text-xs flex justify-around border-t border-gray-100">
              <div className="text-center">
                <span className="block text-gray-400">Can chi ngày</span>
                <span className="font-bold text-gray-700">{selectedCanChiDay}</span>
              </div>
              <div className="text-center">
                <span className="block text-gray-400">Can chi tháng</span>
                <span className="font-bold text-gray-700">{getCanChiMonth(selectedLunar.month, selectedLunar.year)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-5 border-l-4 border-calendar-red relative min-h-[200px]">
            <h3 className="text-lg font-bold text-calendar-red flex items-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Luận giải Gemini
            </h3>
            
            {loadingInsight ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-50">
                <div className="w-8 h-8 border-4 border-calendar-red border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm italic">Đang xin quẻ ngày...</p>
              </div>
            ) : (
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {insight}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>© 2026 Lịch Vạn Niên Bính Ngọ - Thiết kế bởi Chuyên gia AI</p>
      </footer>
    </div>
  );
};

export default App;
