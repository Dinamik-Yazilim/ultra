import { Address, BillingInfo } from "./Address"

export interface Partner {
  _id?:string
  name?: string 
  location?:string
  billingInfo?: BillingInfo
  address?: Address
  passive?:boolean
}