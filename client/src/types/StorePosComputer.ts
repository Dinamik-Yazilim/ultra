import { Store } from "./Store"

export interface StorePosComputer {
  _id?: string
  organization?: string
  database?: string
  store?:Store
  name?: string
  responsibilityId?: string
  responsibility?: string
  projectId?: string
  project?: string
  cashAccountId?: string
  cashAccount?: string
  bankAccountId?: string
  bankAccount?: string
  salesDocNoSerial?: string
  integrationCode?: string
  paymentDevices?: PaymentDevice[]
  scale?:Scale
  passive?: boolean
}

export interface PaymentDevice {

}

export interface Scale {
  connectionType?: string
  comPortOptions?: any
}