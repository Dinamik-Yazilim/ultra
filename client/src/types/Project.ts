export interface Project {
  _id?:string
  name?:string
  
}

interface Props {
  top?:number
  search?:string
}

export function projectListQuery({top=100,search=''}:Props){
  return `SELECT  TOP ${top} pro_kodu as _id, pro_kodu + ' - ' + pro_adi as [name] FROM PROJELER 
  WHERE  (pro_kodu like '%${search}%' or pro_adi like '%${search}%')
  ORDER BY pro_kodu`
}