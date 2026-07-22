import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomDatePickerProps {
  label?: string;
  value: string; // ISO format 'YYYY-MM-DD'
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select date...',
  className = '',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date or default to today for calendar view
  const parsedDate = useMemo(() => {
    if (!value) return new Date();
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
  }, [value]);

  const [viewDate, setViewDate] = useState<Date>(parsedDate);

  // Sync viewDate when value changes
  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      if (y && m && d) setViewDate(new Date(y, m - 1, d));
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Calculate calendar grid days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Previous month padding days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const prevDayNumber = daysInPrevMonth - i;
      const prevDate = new Date(currentYear, currentMonth - 1, prevDayNumber);
      const dateString = prevDate.toISOString().split('T')[0];
      days.push({
        dateString,
        dayNumber: prevDayNumber,
        isCurrentMonth: false,
        isToday: dateString === todayStr,
        isSelected: dateString === value,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateString = `${currentYear}-${monthStr}-${dayStr}`;

      days.push({
        dateString,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateString === todayStr,
        isSelected: dateString === value,
      });
    }

    // Next month padding days to complete 6 rows (42 cells)
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const nextDate = new Date(currentYear, currentMonth + 1, day);
      const dateString = nextDate.toISOString().split('T')[0];
      days.push({
        dateString,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateString === todayStr,
        isSelected: dateString === value,
      });
    }

    return days;
  }, [currentYear, currentMonth, value]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleSelectDay = (dateString: string) => {
    onChange(dateString);
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const todayStr = new Date().toISOString().split('T')[0];
    onChange(todayStr);
    setViewDate(new Date());
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  // Format displayed text
  const formattedDisplay = useMemo(() => {
    if (!value) return '';
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return value;
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [value]);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-[#d4cfc6]">
          {label}
        </label>
      )}

      <div ref={containerRef} className={`relative w-full ${isOpen ? 'z-50' : 'z-10'}`}>
        {/* Trigger Input Box */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm transition-all border ${
            error
              ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-gray-200 dark:border-[#3a3733] hover:border-gray-300 dark:hover:border-gray-600'
          } bg-white dark:bg-[#302d2a] text-gray-900 dark:text-[#e8e3d9] focus:outline-none shadow-xs`}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className={formattedDisplay ? '' : 'text-gray-400 dark:text-zinc-500'}>
              {formattedDisplay || placeholder}
            </span>
          </span>

          {value ? (
            <span
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3733] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Clear date"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          ) : (
            <span className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Floating Custom Calendar Popover */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 4, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute left-0 top-full z-50 mt-1.5 w-[280px] sm:w-[300px] p-4 rounded-2xl bg-white dark:bg-[#242120] border border-gray-100 dark:border-[#3a3733] shadow-2xl space-y-3"
            >
              {/* Header: Month & Year Navigator */}
              <div className="flex items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#302d2a] text-gray-500 dark:text-[#9c9891] transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="text-sm font-bold text-gray-900 dark:text-[#e8e3d9]">
                  {monthNames[currentMonth]} {currentYear}
                </span>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#302d2a] text-gray-500 dark:text-[#9c9891] transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Day Name Headers */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {daysOfWeek.map((day) => (
                  <span key={day} className="text-[11px] font-semibold text-gray-400 dark:text-[#6b6560]">
                    {day}
                  </span>
                ))}
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((item) => (
                  <button
                    key={item.dateString}
                    type="button"
                    onClick={() => handleSelectDay(item.dateString)}
                    className={`h-8 w-8 mx-auto rounded-xl text-xs font-semibold flex items-center justify-center transition-all ${
                      item.isSelected
                        ? 'bg-[#D7494C] text-white shadow-xs font-bold'
                        : item.isToday
                        ? 'bg-[#FEF2F2] dark:bg-[#D7494C]/15 text-[#D7494C] dark:text-[#e05c5f] font-bold border border-[#D7494C]/30'
                        : item.isCurrentMonth
                        ? 'text-gray-700 dark:text-[#d4cfc6] hover:bg-gray-100 dark:hover:bg-[#302d2a]'
                        : 'text-gray-300 dark:text-zinc-700 hover:bg-gray-50 dark:hover:bg-[#2a2825]'
                    }`}
                  >
                    {item.dayNumber}
                  </button>
                ))}
              </div>

              {/* Quick Actions Footer */}
              <div className="pt-2 border-t border-gray-100 dark:border-[#3a3733] flex items-center justify-between text-xs font-medium">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleSelectToday}
                  className="text-[#D7494C] dark:text-[#e05c5f] font-semibold hover:underline transition-all"
                >
                  Today
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
};
