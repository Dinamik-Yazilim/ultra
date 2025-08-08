export interface Store {
    _id?:string
    organization?: string
    database?: string
    name?: string
    warehouseId?: string
    warehouse?: string
    responsibilityId?: string
    responsibility?: string
    projectId?: string
    project?: string
    defaultFirmId?: string
    defaultFirm?: string
    newFirm?:NewStoreFirm
    posIntegration?: PosIntegration
    passive?:boolean
}

export interface NewStoreFirm {
    codePattern?:string
    email?:string
    accountingCode?:string
}
export interface PosIntegration {
    integrationType?: string | undefined | 'dinamikup' | 'pos312' | 'ingenico' | 'genius3'
    useMikroWorkData?: boolean

    pos312?: Pos312
    ingenico?: Ingenico
    genius3?: Genius3

}

export interface Pos312 {
    webServiceUrl?: string
    webServiceUsername?: string
    webServicePassword?: string
    storeId?:number
}

export interface Ingenico {
    webServiceUrl?: string
    webServiceUsername?: string
    webServicePassword?: string
}

export interface Genius3 {

}

export function getPosIntegrationTypeList() {
    return [
        { _id: ' ', name: '---' },
        { _id: 'dinamikup', name: 'DinamikUp' },
        { _id: 'pos312', name: 'Pos 312' },
        { _id: 'ingenico', name: 'Ingenico' },
        { _id: 'genius3', name: 'IBM Genius 3' },
    ]
}