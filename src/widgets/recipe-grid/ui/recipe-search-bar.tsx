import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  search: string
  onSearchChange: (value: string) => void
  sortBy: 'created_at' | 'total_score'
  onSortByChange: (value: 'created_at' | 'total_score') => void
}

export function RecipeSearchBar({ search, onSearchChange, sortBy, onSortByChange }: Props) {
  return (
    <div className="flex gap-2">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
        />
        <Input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="레시피 검색..."
          className="pl-9"
        />
      </div>

      {/* Sort Select */}
      <Select
        value={sortBy}
        onValueChange={(v) => onSortByChange(v as 'created_at' | 'total_score')}
      >
        <SelectTrigger className="w-[100px] shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_at">최신순</SelectItem>
          <SelectItem value="total_score">평점순</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
