export interface Responsibility {
  _id?:string
  name?:string
  
}

interface Props {
  top?:number
  search?:string
}
export function responsibilityListQuery({top=100,search=''}:Props){
  return `SELECT  TOP ${top} som_kod as _id, som_kod + ' - ' + som_isim as [name] FROM SORUMLULUK_MERKEZLERI 
  WHERE  (som_kod like '%${search}%' or som_isim like '%${search}%')
  ORDER BY som_kod`
}