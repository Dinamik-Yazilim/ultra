export interface Warehouse {
  _id?:string
  name?:string
  responsibilityId?:string
  responsibility?:string
  projectId?:string
  project?:string
  type?:string
}

interface Props {
  top?:number
  search?:string
}

export function warehouseListQuery({top=100,search=''}:Props){
  return `SELECT TOP ${top} CAST(D.dep_no as VARCHAR(10)) as _id, CAST(D.dep_no as VARCHAR(10)) + ' - ' + D.dep_adi as [name], dbo.fn_DepoTipi(D.dep_tipi) as [type],
D.dep_sor_mer_kodu as responsibilityId, D.dep_sor_mer_kodu + ' - ' + ISNULL(SOM.som_isim,'') as responsibility,
D.dep_proje_kodu as projectId, D.dep_proje_kodu + ' - ' + ISNULL(PRO.pro_adi,'') as project
FROM DEPOLAR D LEFT OUTER JOIN
SORUMLULUK_MERKEZLERI SOM ON D.dep_sor_mer_kodu = SOM.som_kod LEFT OUTER JOIN
PROJELER PRO ON D.dep_proje_kodu = PRO.pro_kodu 
WHERE (D.dep_adi like '%${search}%')
ORDER BY D.dep_no
`
}
