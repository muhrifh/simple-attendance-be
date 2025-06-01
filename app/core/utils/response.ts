export interface IResponse {
  message: string
  success: boolean
  data: any
}

export interface IGetDataResponse {
  rows: Array<any>
  count: number
}

export interface IDataResponse extends IResponse {
  data: IGetDataResponse
}