import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ArrowRight, CalendarBlank } from "@phosphor-icons/react";

export default function DateScroller({ selectedDate, setSelectedDate }) {
  const [daysBefore, setDaysBefore] = useState(15);
  const [daysAfter, setDaysAfter] = useState(15);
  const scrollRef = useRef(null);
  const leftBoundaryRef = useRef(null);
  const rightBoundaryRef = useRef(null);
  const hasCentered = useRef(false);

  // Generate date array
  const dates = [];
  for (let i = -daysBefore; i <= daysAfter; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }

  const isToday = (date) =>
    date.toDateString() === new Date().toDateString();

  const isSelected = (date) =>
    date.toDateString() === selectedDate.toDateString();

  // Center on today or selected
  const scrollToToday = useCallback(() => {
    const container = scrollRef.current;
    const todayElem = container?.querySelector("#today-marker");
    if (container && todayElem) {
      const targetScroll =
        todayElem.offsetLeft -
        container.offsetWidth / 2 +
        todayElem.offsetWidth / 2;
      container.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
  }, []);

  // Initial centering
  useEffect(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const todayElem = container.querySelector("#today-marker");
    if (todayElem && !hasCentered.current) {
      const targetScroll =
        todayElem.offsetLeft -
        container.offsetWidth / 2 +
        todayElem.offsetWidth / 2;
      container.scrollLeft = targetScroll;
      hasCentered.current = true;
    }
  }, [dates.length]);

  // Infinite scroll observer
  const handleObserver = useCallback((entries) => {
    const container = scrollRef.current;
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target === leftBoundaryRef.current) {
          const oldScrollLeft = container.scrollLeft;
          const oldScrollWidth = container.scrollWidth;
          setDaysBefore((prev) => prev + 15);
          requestAnimationFrame(() => {
            const newScrollWidth = container.scrollWidth;
            container.scrollLeft =
              oldScrollLeft + (newScrollWidth - oldScrollWidth);
          });
        } else if (entry.target === rightBoundaryRef.current) {
          setDaysAfter((prev) => prev + 15);
        }
      }
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: scrollRef.current,
      threshold: 0.1,
    });
    if (leftBoundaryRef.current) observer.observe(leftBoundaryRef.current);
    if (rightBoundaryRef.current) observer.observe(rightBoundaryRef.current);
    return () => observer.disconnect();
  }, [handleObserver, dates.length]);

  // Selected date formatted
  const formattedSelected = selectedDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="w-full bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs">
      {/* Header with Month/Day & Today Jump */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <CalendarBlank size={18} className="text-emerald-600" weight="bold" />
          <span className="text-sm font-bold text-slate-900">
            {isToday(selectedDate) ? "Today" : formattedSelected}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {selectedDate.toLocaleDateString("en-US", { year: "numeric", month: "long" })}
          </span>
        </div>

        {!isToday(selectedDate) && (
          <button
            onClick={() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              setSelectedDate(today);
              scrollToToday();
            }}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 px-2.5 py-1 rounded-lg transition cursor-pointer"
          >
            Jump to Today
          </button>
        )}
      </div>

      {/* Date Ribbon */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div ref={leftBoundaryRef} className="min-w-[1px] h-1" />

        {dates.map((date) => {
          const selected = isSelected(date);
          const today = isToday(date);

          return (
            <button
              key={date.toISOString()}
              id={today ? "today-marker" : undefined}
              onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-12 h-14 sm:w-14 sm:h-16 rounded-xl border transition-all cursor-pointer ${
                selected
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold"
                  : today
                  ? "bg-slate-50 border-emerald-300 text-slate-800 hover:border-emerald-400"
                  : "bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <span
                className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold ${
                  selected ? "text-emerald-100" : "text-slate-400"
                }`}
              >
                {date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3)}
              </span>
              <span className="text-sm sm:text-base font-bold mt-0.5">
                {date.getDate()}
              </span>
              {today && !selected && (
                <div className="w-1 h-1 bg-emerald-600 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}

        <div ref={rightBoundaryRef} className="min-w-[1px] h-1" />
      </div>
    </div>
  );
}
