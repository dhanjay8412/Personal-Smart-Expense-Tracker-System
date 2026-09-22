import React, { useEffect, useState } from 'react';
import { calendarService } from '../services/calendarService';
import { transactionService } from '../services/transactionService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { CardSkeleton } from '../components/common/Skeleton';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const CalendarPage = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);

  const [calendarSummary, setCalendarSummary] = useState({});
  const [selectedDayTransactions, setSelectedDayTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDayLoading, setIsDayLoading] = useState(false);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  // Load calendar monthly summary data
  useEffect(() => {
    const fetchCalendar = async () => {
      setIsLoading(true);
      try {
        const res = await calendarService.getCalendarData(month, year);
        if (res.success && res.data) {
          const map = {};
          res.data.forEach((item) => {
            map[item.date] = item;
          });
          setCalendarSummary(map);
        }
      } catch (err) {
        console.error('[Calendar Error]', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCalendar();
  }, [month, year]);

  // Load transactions for selected date
  useEffect(() => {
    const fetchDayTx = async () => {
      if (!selectedDate) return;
      setIsDayLoading(true);
      try {
        const res = await transactionService.getTransactions({
          startDate: selectedDate,
          endDate: selectedDate,
          limit: 50,
        });
        if (res.success && res.data) {
          setSelectedDayTransactions(res.data);
        }
      } catch (err) {
        console.error('[Day Tx Error]', err);
      } finally {
        setIsDayLoading(false);
      }
    };
    fetchDayTx();
  }, [selectedDate]);

  // Calendar Days calculation
  const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const resetToday = () => {
    const t = new Date();
    setCurrentDate(new Date(t.getFullYear(), t.getMonth(), 1));
    setSelectedDate(t.toISOString().split('T')[0]);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const selectedSummary = calendarSummary[selectedDate] || { income: 0, expense: 0, transactionCount: 0 };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Calendar Expense View</h1>
          <p className="text-xs text-slate-400 mt-1">Visually explore daily spending, income, and transactions by date</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetToday}>
            Today
          </Button>
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button onClick={prevMonth} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-200 min-w-[120px] text-center">
              {monthName} {year}
            </span>
            <button onClick={nextMonth} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <Card>
        {isLoading ? (
          <CardSkeleton />
        ) : (
          <div className="space-y-3">
            {/* Weekday Labels */}
            <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 pb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Empty leading slots */}
              {[...Array(firstDayIndex)].map((_, i) => (
                <div key={`empty-${i}`} className="h-16 sm:h-24 rounded-xl bg-slate-950/20 opacity-30" />
              ))}

              {/* Month Days */}
              {[...Array(daysInMonth)].map((_, i) => {
                const dayNum = i + 1;
                const formattedDay = String(dayNum).padStart(2, '0');
                const formattedMonth = String(month).padStart(2, '0');
                const dateKey = `${year}-${formattedMonth}-${formattedDay}`;

                const dayData = calendarSummary[dateKey];
                const isSelected = selectedDate === dateKey;
                const isTodayDate = today.toISOString().split('T')[0] === dateKey;

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(dateKey)}
                    className={`h-16 sm:h-24 p-1.5 rounded-xl border text-left transition-all flex flex-col justify-between relative group ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/10'
                        : isTodayDate
                        ? 'border-emerald-500/50 bg-slate-900/90'
                        : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-bold ${
                          isSelected
                            ? 'text-sky-400'
                            : isTodayDate
                            ? 'text-emerald-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayData && dayData.transactionCount > 0 && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                          {dayData.transactionCount}tx
                        </span>
                      )}
                    </div>

                    {dayData && (
                      <div className="space-y-0.5 mt-1 overflow-hidden">
                        {dayData.expense > 0 && (
                          <div className="text-[10px] font-extrabold text-rose-400 truncate">
                            -{formatCurrency(dayData.expense, currency)}
                          </div>
                        )}
                        {dayData.income > 0 && (
                          <div className="text-[10px] font-extrabold text-emerald-400 truncate">
                            +{formatCurrency(dayData.income, currency)}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Selected Day Transaction Details Panel */}
      <Card
        title={`Transactions for ${formatDate(selectedDate)}`}
        subtitle={`${selectedDayTransactions.length} transaction(s) found for this date`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
            <span className="text-xs text-slate-400">Daily Income</span>
            <span className="text-sm font-extrabold text-emerald-400">
              +{formatCurrency(selectedSummary.income, currency)}
            </span>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
            <span className="text-xs text-slate-400">Daily Expenses</span>
            <span className="text-sm font-extrabold text-rose-400">
              -{formatCurrency(selectedSummary.expense, currency)}
            </span>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Count</span>
            <span className="text-sm font-extrabold text-sky-400">
              {selectedSummary.transactionCount} Transactions
            </span>
          </div>
        </div>

        {isDayLoading ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading day transactions...</div>
        ) : selectedDayTransactions.length > 0 ? (
          <TransactionTable
            transactions={selectedDayTransactions}
            currency={currency}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">
            No transactions recorded on {formatDate(selectedDate)}.
          </div>
        )}
      </Card>
    </div>
  );
};
