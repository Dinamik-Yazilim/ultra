import { Connector } from "./Connector"

export interface Organization {
  _id?:string
  name?: string 
  location?:string
  startDate?:string
  endDate?:string
  connector?:Connector
  passive?:boolean
}