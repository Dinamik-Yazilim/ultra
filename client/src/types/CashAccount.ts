export interface CashAccount {
  _id?:string
  name?:string
  currency?:string
  
}

interface Props {
  top?:number
  search?:string
}
export function cashAccountListQuery({top=100,search=''}:Props){
  return `SELECT  TOP ${top} kas_kod as _id, kas_kod + ' - ' + kas_isim as [name], dbo.fn_DovizSembolu(kas_doviz_cinsi) as currency  FROM KASALAR 
  WHERE  (kas_kod like '%${search}%' or kas_isim like '%${search}%')
  ORDER BY kas_kod`
}