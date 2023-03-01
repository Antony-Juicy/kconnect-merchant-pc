import { useLocation } from 'umi';

export function useQuery() {
  return new URLSearchParams(useLocation().search);
}
