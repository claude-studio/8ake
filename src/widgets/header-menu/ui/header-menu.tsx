import { useNavigate } from '@tanstack/react-router'
import { LogOut, Menu, Moon, Pencil, Sun, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/features/auth'
import { useThemeStore } from '@/shared/model/theme-store'

interface Props {
  onEdit?: () => void
  onDelete?: () => void
}

export function HeaderMenu({ onEdit, onDelete }: Props) {
  const { theme, toggleTheme } = useThemeStore()
  const { signOut } = useAuthStore()
  const navigate = useNavigate()

  const hasActions = onEdit || onDelete

  const handleSignOut = async () => {
    await signOut()
    navigate({ to: '/' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
          <Menu size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-44 rounded-2xl border-border/60 bg-card/95 p-1.5 shadow-floating backdrop-blur-xl"
      >
        {/* 수정/삭제 — 상세 페이지에서만 표시 */}
        {hasActions && (
          <>
            {onEdit && (
              <DropdownMenuItem
                onClick={onEdit}
                className="cursor-pointer gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-foreground focus:bg-surface focus:text-foreground"
              >
                <Pencil size={15} className="text-muted-foreground" />
                <span>수정</span>
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={onDelete}
                className="cursor-pointer gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-destructive focus:bg-destructive/8 focus:text-destructive"
              >
                <Trash2 size={15} className="text-destructive" />
                <span>삭제</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="my-1 bg-border/50" />
          </>
        )}

        {/* 다크모드 토글 */}
        <DropdownMenuItem
          onClick={toggleTheme}
          className="cursor-pointer gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-foreground focus:bg-surface focus:text-foreground"
        >
          {theme === 'light' ? (
            <Moon size={15} className="text-muted-foreground" />
          ) : (
            <Sun size={15} className="text-muted-foreground" />
          )}
          <span>{theme === 'light' ? '다크 모드' : '라이트 모드'}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1 bg-border/50" />

        {/* 로그아웃 */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-destructive focus:bg-destructive/8 focus:text-destructive"
        >
          <LogOut size={15} className="text-destructive" />
          <span>로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
