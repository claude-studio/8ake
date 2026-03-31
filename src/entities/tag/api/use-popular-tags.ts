import { useQuery } from '@tanstack/react-query'

import { fetchPopularTags, tagKeys } from './tag-api'

export function usePopularTags() {
  return useQuery({
    queryKey: tagKeys.popular(),
    queryFn: () => fetchPopularTags(),
    staleTime: 5 * 60 * 1000,
  })
}
