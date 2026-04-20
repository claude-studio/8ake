import { beforeEach, describe, expect, it, vi } from 'vitest'

const getPublicUrlMock = vi.fn().mockReturnValue({
  data: { publicUrl: 'https://example.com/photo.jpg' },
})

vi.mock('@/shared/api', () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnValue({ getPublicUrl: getPublicUrlMock }),
    },
  },
}))

describe('getPhotoUrl', () => {
  beforeEach(() => {
    vi.resetModules()
    getPublicUrlMock.mockClear()
  })

  it('동일 경로 두 번 호출 시 getPublicUrl은 1회만 호출', async () => {
    const { getPhotoUrl } = await import('../recipe-api')

    getPhotoUrl('user/recipe/photo.jpg')
    getPhotoUrl('user/recipe/photo.jpg')

    expect(getPublicUrlMock).toHaveBeenCalledTimes(1)
  })

  it('다른 경로 호출 시 각각 getPublicUrl 호출', async () => {
    const { getPhotoUrl } = await import('../recipe-api')

    getPhotoUrl('user/recipe/photo1.jpg')
    getPhotoUrl('user/recipe/photo2.jpg')

    expect(getPublicUrlMock).toHaveBeenCalledTimes(2)
  })
})
