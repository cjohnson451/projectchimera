import { api } from './api'
import { DeltaCardT, MemoDeltaT } from '../../../packages/schemas/ts/deltaSchemas'

export async function getDeltaCards(ticker: string): Promise<DeltaCardT[]> {
  const { data } = await api.get(`/api/delta/${ticker}/cards`)
  return data
}

export async function postMemoDelta(ticker: string): Promise<MemoDeltaT> {
  const { data } = await api.post(`/api/delta/${ticker}/memo`)
  return data
}


