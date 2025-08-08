export interface Inventory {
  _id?:string
  itemCode?:string 
  itemName?:string
  unit?:string
  mainGroup?:string
  subGroup?:string
  category?:string
  rayon?:string
  brand?:string
  lastPurchase?:number
  purchaseConditionPrice?:number
  purchaseConditionGrossPrice?:number
  salesPrice?:number
  quantity?:number
  
}

export interface InventoryProps {
	top?:number
	search?:string
	mainGroup?: string
	subGroup?: string
	category?: string
	brand?: string
	rayon?: string
}
export function inventoryQuery({top=100,search='',mainGroup='',subGroup='',category='', brand='', rayon=''}:InventoryProps){
  return `SELECT top ${top} S.sto_Guid as _id, S.sto_kod as itemCode, S.sto_isim as itemName, S.sto_birim1_ad as unit,
ISNULL(SAN.san_isim,'') as mainGroup, ISNULL(STA.sta_isim,'') as [subGroup],
ISNULL(KTG.ktg_isim,'') as category ,
ISNULL(RYN.ryn_ismi,'') as rayon ,
ISNULL(MRK.mrk_ismi,'') as brand ,
(
	SELECT TOP 1 dbo.fn_StokHareketNetDeger(sth_tutar,sth_iskonto1,sth_iskonto2,sth_iskonto3,sth_iskonto4,sth_iskonto5,sth_iskonto6,
		sth_masraf1,sth_masraf2,sth_masraf3,sth_masraf4,sth_otvtutari,sth_oivtutari,sth_tip,0,sth_har_doviz_kuru,sth_alt_doviz_kuru,sth_stok_doviz_kuru) / sth_miktar
	FROM STOK_HAREKETLERI WHERE sth_stok_kod=S.sto_kod AND sth_tip=0 AND sth_cins=0 AND sth_miktar>0 AND sth_normal_iade=0 ORDER BY sth_create_date DESC
) as lastPurchase
, SAS.Fiyat as purchaseConditionPrice, SAS.sas_brut_fiyat as purchaseConditionGrossPrice,
dbo.fn_StokSatisFiyati(S.sto_kod,1,0,1) as salesPrice,
STH.tMikar as quantity
FROM STOKLAR S LEFT OUTER JOIN
STOK_ANA_GRUPLARI SAN ON S.sto_anagrup_kod=SAN.san_kod LEFT OUTER JOIN
STOK_ALT_GRUPLARI STA ON S.sto_altgrup_kod=STA.sta_kod LEFT OUTER JOIN
STOK_KATEGORILERI KTG ON S.sto_kategori_kodu=KTG.ktg_kod LEFT OUTER JOIN
STOK_REYONLARI RYN ON S.sto_reyon_kodu=RYN.ryn_kod LEFT OUTER JOIN
STOK_MARKALARI MRK ON S.sto_marka_kodu=MRK.mrk_kod LEFT OUTER JOIN
(SELECT sth_stok_kod, ROUND(SUM(CASE sth_tip WHEN 0 THEN 1 ELSE -1 END * sth_miktar),1) as tMikar  
FROM STOK_HAREKETLERI 
WHERE sth_tip IN (0,1)
GROUP BY sth_stok_kod)
STH ON S.sto_kod=STH.sth_stok_kod LEFT OUTER JOIN
	(SELECT DISTINCT
		sas_stok_kod,
		dbo.fn_SatinAlmaSartiNetTutar(sas_brut_fiyat,
		sas_isk_miktar1,sas_isk_miktar2,sas_isk_miktar3,sas_isk_miktar4,sas_isk_miktar5,sas_isk_miktar6,
		sas_mas_miktar1,sas_mas_miktar2,sas_mas_miktar3,sas_mas_miktar4)
		*dbo.fn_KurBul (GETDATE(),sas_doviz_cinsi,0) 
		as Fiyat,
		sas_brut_fiyat,
		sas_bitis_tarih,
		sas_depo_no
	FROM dbo.SATINALMA_SARTLARI WITH (NOLOCK)
	WHERE sas_bitis_tarih>=GETDATE() AND sas_depo_no=0
	) SAS ON S.sto_kod= SAS.sas_stok_kod

 WHERE (S.sto_kod like '%${search}%' or S.sto_isim like '%${search}%') AND
 (S.sto_anagrup_kod='${mainGroup}' OR '${mainGroup}'='') AND
 (S.sto_altgrup_kod='${subGroup}' OR '${subGroup}'='') AND
 (S.sto_kategori_kodu='${category}' OR '${category}'='') AND
 (S.sto_marka_kodu='${brand}' OR '${brand}'='') AND
 (S.sto_reyon_kodu='${rayon}' OR '${rayon}'='')
 `
}