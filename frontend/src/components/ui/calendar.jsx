import { useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export function Calendar({
    value,
    onChange,
    shouldDisableDate,
    minDate = dayjs('2010-01-01'),
    maxDate = dayjs('2040-12-31'),
    onMonthChange,
    className
}) {
    const [viewDate, setViewDate] = useState(value || dayjs());
    const [view, setView] = useState('days'); // 'days', 'months', 'years'

    const daysInMonth = viewDate.daysInMonth();
    const startOfMonth = viewDate.startOf('month');
    const startDay = startOfMonth.day(); // 0-6 (Sunday-Saturday)

    const handlePrevMonth = () => {
        const newDate = viewDate.subtract(1, 'month');
        if (newDate.isBefore(minDate, 'month')) return;
        setViewDate(newDate);
        onMonthChange?.(newDate);
    };

    const handleNextMonth = () => {
        const newDate = viewDate.add(1, 'month');
        if (newDate.isAfter(maxDate, 'month')) return;
        setViewDate(newDate);
        onMonthChange?.(newDate);
    };

    const handleDateClick = (date) => {
        if (shouldDisableDate?.(date)) return;
        onChange?.(date);
    };

    const handleMonthClick = () => {
        setView('months');
    };

    const handleYearClick = () => {
        setView('years');
    };

    const handleMonthSelect = (month) => {
        setViewDate(viewDate.month(month));
        setView('days');
        onMonthChange?.(viewDate);
    };

    const handleYearSelect = (year) => {
        setViewDate(viewDate.year(year));
        setView('days'); // Changed from 'months' to 'days'
        onMonthChange?.(viewDate);
    };

    const renderDays = () => {
        const days = [];
        const daysArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Render day headers
        days.push(
            <div key="headers" className="grid grid-cols-7 mb-2">
                {daysArr.map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500">
                        {day}
                    </div>
                ))}
            </div>
        );

        // Render calendar grid
        const totalDays = [];

        // Previous month days
        for (let i = 0; i < startDay; i++) {
            totalDays.push(null);
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            totalDays.push(viewDate.date(i));
        }

        // Split into weeks
        const weeks = [];
        let week = [];

        totalDays.forEach((date, i) => {
            week.push(date);
            if (week.length === 7) {
                weeks.push(week);
                week = [];
            }
        });

        // Add remaining days
        if (week.length > 0) {
            weeks.push(week);
        }

        // Render weeks
        const monthContent = weeks.map((week, i) => (
            <div key={i} className="grid grid-cols-7">
                {week.map((date, j) => {
                    if (!date) return <div key={`empty-${j}`} className="p-2" />;

                    const isDisabled = shouldDisableDate?.(date);
                    const isToday = date.isSame(dayjs(), 'day');

                    return (
                        <button
                            key={date.format('YYYY-MM-DD')}
                            onClick={() => handleDateClick(date)}
                            disabled={isDisabled}
                            className={cn(
                                "w-full text-center rounded-md hover:bg-gray-100",
                                "flex flex-col justify-center items-center",
                                "p-2 pb-0", 
                                isDisabled && "pb-2",
                                isToday && "bg-blue-100 font-bold"
                            )}
                        >
                            <span>{date.date()}</span>
                            {!isDisabled && <div className="h-1.5 w-1.5 rounded-full bg-[#8AC0F6]" />}
                        </button>
                    );
                })}
            </div>
        ));

        days.push(...monthContent);
        return days;
    };

    const renderMonthSelection = () => {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        return (
            <div className="grid grid-cols-3 gap-2 p-2">
                {months.map((month, i) => (
                    <button
                        key={month}
                        onClick={() => handleMonthSelect(i)}
                        className={cn(
                            "p-2 rounded-md hover:bg-gray-100",
                            viewDate.month() === i && "bg-[#1F263E] text-white hover:bg-[#2A324D]"
                        )}
                    >
                        {month}
                    </button>
                ))}
            </div>
        );
    };

    const renderYearSelection = () => {
        const currentYear = viewDate.year();
        const startYear = currentYear - 6;
        const years = Array.from({ length: 12 }, (_, i) => startYear + i);

        return (
            <div className="grid grid-cols-3 gap-2 p-2">
                {years.map(year => (
                    <button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        className={cn(
                            "p-2 rounded-md hover:bg-gray-100",
                            viewDate.year() === year && "bg-[#1F263E] text-white hover:bg-[#2A324D]"
                        )}
                    >
                        {year}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className={cn("w-full p-4", className)}>
            <div className="flex justify-between items-center mb-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevMonth}
                    disabled={view !== 'days' || viewDate.subtract(1, 'month').isBefore(minDate, 'month')}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex gap-1 text-lg font-semibold">
                    <button
                        onClick={handleMonthClick}
                        className="hover:bg-gray-100 px-2 py-1 rounded"
                    >
                        {viewDate.format('MMMM')}
                    </button>
                    <button
                        onClick={handleYearClick}
                        className="hover:bg-gray-100 px-2 py-1 rounded"
                    >
                        {viewDate.format('YYYY')}
                    </button>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextMonth}
                    disabled={view !== 'days' || viewDate.add(1, 'month').isAfter(maxDate, 'month')}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            <div className="space-y-2">
                {view === 'days' && renderDays()}
                {view === 'months' && renderMonthSelection()}
                {view === 'years' && renderYearSelection()}
            </div>
        </div>
    );
}
