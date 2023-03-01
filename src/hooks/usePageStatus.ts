
import { history } from 'umi'

type resultData = {
  id: string,
} & Record<string, any>

export const usePageStatus = (props: any): resultData => {
  const { ...rest } = history.location.query;
  const { id = '' } = props.match.params;

  return {
    id,
    ...rest
  }
}
