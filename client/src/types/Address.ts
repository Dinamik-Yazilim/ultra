export interface Address {
  _id?: string
  room?: string
  streetName?: string
  blockName?: string
  buildingName?: string
  buildingNumber?: string
  citySubdivisionName?: string
  cityName?: string
  postalZone?: string
  postbox?: string
  region?: string
  district?: string
  country?: Country
}

export interface Country {
  identificationCode: string
  name: string
}

export interface BillingInfo {
  _id?: string
  individual?: boolean
  companyName?: string
  firstName?: string
  lastName?: string
  taxNumber?: string
  taxOffice?: string
  idCardNo?: string
}