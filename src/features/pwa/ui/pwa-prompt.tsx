import { useRegisterSW } from 'virtual:pwa-register/react'

export function PwaPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        setInterval(() => r.update(), 60 * 60 * 1000)
      }
    },
  })

  function close() {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) return null

  return (
    <div className="fixed bottom-4 inset-x-4  z-50 mx-auto max-w-sm rounded-xl border border-border bg-card p-4 shadow-lg">
      {offlineReady ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-foreground">오프라인에서도 사용할 수 있습니다.</p>
          <button
            type="button"
            onClick={close}
            className="shrink-0 text-sm font-medium text-muted-foreground"
          >
            닫기
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-foreground">새 버전이 있습니다. 업데이트하시겠습니까?</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={close}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground"
            >
              나중에
            </button>
            <button
              type="button"
              onClick={() => updateServiceWorker()}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
            >
              업데이트
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
