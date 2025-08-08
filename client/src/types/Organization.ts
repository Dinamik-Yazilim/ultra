import { Connector } from "./Connector"

export interface Organization {
  _id?:string
  name?: string 
  connector?:Connector
  passive?:boolean
}