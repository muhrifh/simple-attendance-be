import { IFilter, ISort } from "./IFilterSort.js";

export default interface IService {
  findAll(fields: string, sort: Array<ISort>, limit: number): Promise<any>;
  find(fields: string, filter: Array<IFilter>, sort: Array<ISort>, page: number, pageSize: number): Promise<any>;
}
