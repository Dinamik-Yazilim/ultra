export interface DeliveryType {
  _id?:string
  name?:string
  
}

interface Props {
  top?:number
  search?:string
}
export function deliveryTypeListQuery({top=100,search=''}:Props){
  return `SELECT  TOP ${top} tslt_kod as _id, tslt_kod + ' - ' + tslt_ismi as [name] FROM TESLIM_TURLERI 
  WHERE  (tslt_kod like '%${search}%' or tslt_ismi like '%${search}%')
  ORDER BY tslt_kod`
}