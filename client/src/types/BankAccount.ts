export interface BankAccount {
  _id?:string
  name?:string
  currency?:string
  
}

interface Props {
  top?:number
  search?:string
}
export function bankAccountListQuery({top=100,search=''}:Props){
  return `SELECT  TOP ${top} ban_kod as _id, ban_kod + ' - ' + ban_ismi as [name], dbo.fn_DovizSembolu(ban_doviz_cinsi) as currency  FROM BANKALAR 
  WHERE  (ban_kod like '%${search}%' or ban_ismi like '%${search}%')
  ORDER BY ban_kod`
}