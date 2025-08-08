export interface Firm {
  _id?:string
  name?:string
  currency?:string
  priceNo?:number
  balance?:number
}

export function firmListQuery(top:number=100){
  return `SELECT TOP 100 C.cari_kod as _id, C.cari_kod + ' - ' + C.cari_unvan1 as name
, C.cari_satis_fk as priceNo, dbo.fn_DovizSembolu(C.cari_doviz_cinsi) as currency
FROM CARI_HESAPLAR C
WHERE (C.cari_kod like '%{search}%' or C.cari_unvan1 like '%{search}%')
`
}

export function firmListWithBalanceQuery(top:number=100) {
  return `SELECT C.cari_kod as _id,  C.cari_kod + ' - ' + C.cari_unvan1 as name
, C.cari_satis_fk as priceNo, dbo.fn_DovizSembolu(C.cari_doviz_cinsi) as currency,
ROUND(ISNULL(dbo.fn_CariHesapBakiye('',0, C.cari_kod, '', '', 0, C.cari_doviz_cinsi,0,0,0,0),0),2) as balance
FROM CARI_HESAPLAR C
WHERE (C.cari_kod like '%{search}%' or C.cari_unvan1 like '%{search}%')
`
}