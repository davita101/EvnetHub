import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, Check, ChevronsUpDown, Calendar } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Card } from "./ui/card";
import { CalendarRange } from "./calendar-range";
import { data, columns } from "./table-data";

export function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Company filter states
  const [companyFilter, setCompanyFilter] = React.useState("");
  const [onlyCompany] = React.useState(false);
  const [openCompany, setOpenCompany] = React.useState(false);

  // Date range filter state
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [openDatePicker, setOpenDatePicker] = React.useState(false);

  const companySuggestions = React.useMemo(() => {
    const titles = data
      .map((d) => d.company?.title)
      .filter((t): t is string => Boolean(t));
    return Array.from(new Set(titles));
  }, []);

  // ! global filter
  const [globalFilter, setGlobalFilter] = React.useState("");

  const filteredData = React.useMemo(() => {
    let res = data;
    if (companyFilter.trim()) {
      const q = companyFilter.trim().toLowerCase();
      res = res.filter((p) => p.company?.title.toLowerCase().includes(q));
    }
    if (onlyCompany) {
      res = res.filter((p) => !!p.company && !!p.company.title);
    }
    // Date range filter
    if (dateRange?.from && dateRange?.to) {
      res = res.filter((p) => {
        const itemDate = new Date(p.date);
        return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
      });
    }
    return res;
  }, [companyFilter, onlyCompany, dateRange]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="w-full">
        {/* header */}
        <div className="flex items-center py-4 flex-wrap gap-2">
          <Input
            placeholder="event title..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex items-center gap-2">
            <Popover open={openCompany} onOpenChange={setOpenCompany}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCompany}
                  className="w-[220px] justify-between"
                >
                  {companyFilter
                    ? companySuggestions.find((c) => c === companyFilter) ||
                      companyFilter
                    : "Select company..."}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search company..."
                    value={companyFilter}
                    onValueChange={(v: string) => setCompanyFilter(v)}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No company found.</CommandEmpty>
                    <CommandGroup>
                      {companySuggestions.map((s) => (
                        <CommandItem
                          key={s}
                          value={s}
                          onSelect={(currentValue) => {
                            const v = currentValue as string;
                            setCompanyFilter(v === companyFilter ? "" : v);
                            setOpenCompany(false);
                          }}
                        >
                          {s}
                          <Check
                            className={cn(
                              "ml-auto",
                              companyFilter === s ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
              </Popover>
          </div>

          {/* Date Range Filter */}
          <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                {dateRange?.from ? (
                  <>
                    {dateRange.from.toLocaleDateString()} 
                    {dateRange.to && ` - ${dateRange.to.toLocaleDateString()}`}
                  </>
                ) : (
                  "Pick dates..."
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-4">
                <CalendarRange selected={dateRange} onSelect={setDateRange} />
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* header end */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          {table.getHeaderGroups().map((headerGroup) => (
            <div
              className="grid auto-rows-min gap-4 md:grid-cols-5"
              key={headerGroup.id}
            >
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <Card
                    className="flex gap-4 p-0 hover:bg-gray-200/10 transition-all"
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <div key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    ))}
                  </Card>
                ))
              ) : (
                <div>
                  <div className="h-24 text-center">No results.</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
