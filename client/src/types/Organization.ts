import { Address, BillingInfo } from "./Address"
import { Connector } from "./Connector"

export interface Organization {
  _id?: string
  name?: string
  location?: string
  billingInfo?: BillingInfo
  address?: Address
  mainApp?:string
  connector?: Connector
  passive?: boolean
}