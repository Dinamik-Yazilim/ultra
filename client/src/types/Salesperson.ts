export interface Salesperson {
  _id?:string
  name?:string
  
}

interface Props {
  top?:number
  search?:string
}
export function salespersonListQuery({top=100,search=''}:Props){
  return `SELECT  TOP ${top} cari_per_kod as _id, cari_per_kod + ' - ' + cari_per_adi + ' ' + cari_per_soyadi as [name] FROM CARI_PERSONEL_TANIMLARI 
  WHERE (cari_per_tip=1) AND (cari_per_kod like '%${search}%' or cari_per_adi like '%${search}%' or cari_per_soyadi like '%${search}%')
  ORDER BY cari_per_adi,cari_per_soyadi `
}
