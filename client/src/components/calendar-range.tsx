import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

// Company operating dates - adjust these to match your company dates
const COMPANY_START_DATE = new Date(2024, 0, 1); // January 1, 2024
const COMPANY_END_DATE = new Date(2025, 11, 31); // December 31, 2025

export function CalendarRange({
  selected,
  onSelect,
}: {
  selected: DateRange | undefined;
  onSelect: (v: DateRange | undefined) => void;
}) {
  // Disable dates outside company operating range
  const disabledDates = (date: Date) => {
    return date < COMPANY_START_DATE || date > COMPANY_END_DATE;
  };

  // Preset range handlers
  const setTodayRange = () => {
    const today = new Date();
    onSelect({ from: today, to: today });
  };

  const setThisWeekRange = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    onSelect({ from: startOfWeek, to: endOfWeek });
  };

  const setThisMonthRange = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    onSelect({ from: startOfMonth, to: endOfMonth });
  };

  const setLastThirtyDaysRange = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    onSelect({ from: thirtyDaysAgo, to: today });
  };

  const setCompanyRangeRange = () => {
    onSelect({ from: COMPANY_START_DATE, to: COMPANY_END_DATE });
  };

  const clearSelection = () => {
    onSelect(undefined);
  };

  return (
    <div className="space-y-4">
      {/* Preset Range Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={setTodayRange}
          className="text-xs"
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={setThisWeekRange}
          className="text-xs"
        >
          This Week
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={setThisMonthRange}
          className="text-xs"
        >
          This Month
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={setLastThirtyDaysRange}
          className="text-xs"
        >
          Last 30 Days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={setCompanyRangeRange}
          className="text-xs"
        >
          Company Period
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={clearSelection}
          className="text-xs"
        >
          Clear
        </Button>
      </div>

      {/* Selected Range Display */}
      {selected?.from && (
        <div className="text-sm text-gray-600">
          <p>
            Selected: {selected.from.toLocaleDateString()} 
            {selected.to && ` - ${selected.to.toLocaleDateString()}`}
          </p>
        </div>
      )}

      {/* Calendar */}
      <Calendar
        mode="range"
        defaultMonth={selected?.from}
        selected={selected}
        onSelect={onSelect}
        numberOfMonths={2}
        disabled={disabledDates}
        className="rounded-lg border shadow-sm"
      />

      {/* Company Date Range Info */}
      <div className="text-xs text-gray-500 border-t pt-2">
        <p>Company operating period: {COMPANY_START_DATE.toLocaleDateString()} - {COMPANY_END_DATE.toLocaleDateString()}</p>
      </div>
    </div>
  );
}
