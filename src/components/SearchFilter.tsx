import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateFilter: string;
  onDateFilterChange: (filter: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
}

export const SearchFilter = ({
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  sortBy,
  onSortChange,
  activeFiltersCount,
  onClearFilters,
}: SearchFilterProps) => {
  return (
    <div className="glass rounded-2xl p-6 mb-8 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search messages or usernames..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 glass border-border bg-input text-foreground"
          />
        </div>

        {/* Filter Dropdown */}
        <Select value={dateFilter} onValueChange={onDateFilterChange}>
          <SelectTrigger className="w-full md:w-[180px] glass border-border bg-input text-foreground">
            <SelectValue placeholder="Time filter" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border z-50">
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full md:w-[180px] glass border-border bg-input text-foreground">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border z-50">
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="reactions">Most Reactions</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="glass border-border hover:bg-muted/50"
          >
            <X className="h-4 w-4 mr-2" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>
    </div>
  );
};
