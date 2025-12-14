"use client"

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "./ui/badge";

// Generate random sample data for the table
const SAMPLE_TITLES = ["LOMI", "Atlas", "Vista", "Aurora", "Nexus"];
const SAMPLE_DESCRIPTIONS = [
  "Tbillisi event-hall",
  "Main conference room",
  "Outdoor venue",
  "Banquet hall",
  "VIP lounge",
];
const SAMPLE_STATUSES: Array<"pending" | "processing" | "success" | "finished"> = [
  "pending",
  "processing",
  "success",
  "finished",
];

// Company samples
const COMPANY_TITLES = [
  "Acme Corp",
  "Eventify",
  "GrandHosts",
  "VenuePro",
  "Local Co",
];
const COMPANY_LINKS = [
  "https://example.com",
  "https://eventify.example",
  "https://grandhosts.example",
  "https://venuepro.example",
  "https://localco.example",
];
const COMPANY_DESCRIPTIONS = [
  "Official organizer",
  "Venue partner",
  "Catering partner",
  "Logistics",
  "Sponsorship",
];

export type Model = {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "pending" | "processing" | "success" | "finished";
  company: {
    link: string;
    title: string;
    description: string;
    date: string;
  };
};

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function randomChoice<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(startYear = 2023, endYear = 2026) {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  const d = new Date(start + Math.random() * (end - start));
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function generateRandomModels(count = 8): Model[] {
  return Array.from({ length: count }).map(() => ({
    id: randomId(),
    title: randomChoice(SAMPLE_TITLES),
    description: randomChoice(SAMPLE_DESCRIPTIONS),
    date: randomDate(),
    status: randomChoice(SAMPLE_STATUSES),
    company: {
      link: randomChoice(COMPANY_LINKS),
      title: randomChoice(COMPANY_TITLES),
      description: randomChoice(COMPANY_DESCRIPTIONS),
      date: randomDate(),
    },
  }));
}

export const data: Model[] = generateRandomModels(8);

export const columns: ColumnDef<Model>[] = [
  // ! Id section

  {
    accessorKey: "title",
    header: "title",
    enableGlobalFilter: true,
    cell: ({ row }) => (
      <div className="pt-2 px-2 capitalize">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "status",
    enableGlobalFilter: false,
    header: "status",
    cell: ({ row }) => (
      <div className="p-2 pt-0">
        {row.getValue("status") == "pending" && (
          <Badge className="capitalize">{row.getValue("status")}</Badge>
        )}
        {row.getValue("status") == "processing" && (
          <Badge variant={"process"} className="capitalize">
            {row.getValue("status")}
          </Badge>
        )}
        {row.getValue("status") == "success" && (
          <Badge variant={"success"} className="capitalize">
            {row.getValue("status")}
          </Badge>
        )}
        {row.getValue("status") == "finished" && (
          <Badge variant={"destructive"} className="capitalize">
            {row.getValue("status")}
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "description",
    enableGlobalFilter: false,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          description
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="p-2 pt-0 lowercase">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "company",
    header: "company",
    cell: ({ row }) => {
      const c = row.original.company;
      return (
        <div className="p-2 pb-0 flex flex-col bg-secondary/50 rounded-md gap-1">
          <a
            href={c.link && "#"}
            className="text-sm font-medium text-blue-600 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {c.title}
          </a>
          <div className="flex justify-between p-2 px-0">
            <div className="text-xs lowercase">{c.description}</div>
            <div className="text-xs text-right">{c.date}</div>
          </div>
        </div>
      );
    },
  },
];
