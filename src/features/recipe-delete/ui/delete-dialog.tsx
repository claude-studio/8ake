import { useState } from 'react'

import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { deleteRecipe } from '@/entities/recipe'

interface Props {
  recipeId: string
  /** 외부에서 open 상태를 제어할 때 사용 */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** trigger가 없을 때는 외부 open 제어만 사용 */
  trigger?: React.ReactNode
}

export function DeleteDialog({ recipeId, open: controlledOpen, onOpenChange, trigger }: Props) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (onOpenChange ?? setInternalOpen) : setInternalOpen

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteRecipe(recipeId)
      toast.success('레시피가 삭제되었습니다.')
      router.navigate({ to: '/' })
    } catch {
      toast.error('레시피 삭제에 실패했습니다.')
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        !isControlled && (
          <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                레시피 삭제
              </Button>
            </DialogTrigger>
          </div>
        )
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>레시피 삭제</DialogTitle>
          <DialogDescription>
            이 레시피를 삭제하면 되돌릴 수 없습니다. 정말 삭제하시겠어요?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            취소
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? '삭제 중...' : '삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
