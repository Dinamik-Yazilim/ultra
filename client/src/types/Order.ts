import { postItem } from "@/lib/fetch"
import { today } from "@/lib/utils"

export interface OrderHeader {
  sip_Guid?: string
  _id?: string
  ioType?: number
  orderType?: string
  issueDate?: string
  docNoSerial?: string
  docNoSequence?: number
  orderNumber?: string
  documentNumber?: string
  documentDate?: string
  firmId?: string
  firm?: string
  warehouseId?: string
  warehouse?: string
  paymentPlanId?: string
  paymentPlan?: string
  projectId?: string
  project?: string
  salespersonId?: string
  salesperson?: string
  responsibilityId?: string
  responsibility?: string
  quantity?: number
  delivered?: number
  amount?: number
  discountAmount1?: number
  discountAmount2?: number
  discountAmount3?: number
  discountAmount4?: number
  discountAmount5?: number
  discountAmount6?: number

  discountRate1?: number
  discountRate2?: number
  discountRate3?: number
  discountRate4?: number
  discountRate5?: number
  discountRate6?: number
  expenseAmount1?: number
  expenseAmount2?: number
  expenseAmount3?: number
  expenseAmount4?: number
  grossTotal?: number
  vatAmount?: number
  netTotal?: number
  currency?: string
  lineCount?: number
}

export interface OrderDetail {
  sip_Guid?: string
  _id?: string
  orderId?: string
  lineNo?: number
  itemId?: string
  item?: string
  barcode?: string
  description?: string
  quantity?: number
  delivered?: number
  deliveryDate?: string
  remainder?: number
  unit?: string
  price?: number
  amount?: number
  discountAmount1?: number
  discountAmount2?: number
  discountAmount3?: number
  discountAmount4?: number
  discountAmount5?: number
  discountAmount6?: number

  discountRate1?: number
  discountRate2?: number
  discountRate3?: number
  discountRate4?: number
  discountRate5?: number
  discountRate6?: number
  expenseAmount1?: number
  expenseAmount2?: number
  expenseAmount3?: number
  expenseAmount4?: number
  vatRate?: number
  vatAmount?: number
  lineGrossTotal?: number
  lineNetTotal?: number
  deleted?: boolean
}

export interface orderListQueryProps {
  ioType: number
  top?: number
  search?: string
  isClosed?: string
  warehouseId?: string
  startDate?: string
  endDate?: string
}
export function orderListQuery({ ioType = 1, top = 100, search = '', isClosed = '0', warehouseId = '', startDate = today(), endDate = today() }: orderListQueryProps) {
  return `SELECT TOP ${top} orderNumber as _id, *
, ROUND(100*CASE WHEN amount>0 THEN discountAmount1/amount ELSE 0 END,2) as discountRate1 
, ROUND(100*CASE WHEN (amount-discountAmount1)>0 THEN discountAmount2/(amount-discountAmount1) ELSE 0 END,2) as discountRate2 
, ROUND(100*CASE WHEN (amount-discountAmount1-discountAmount2)>0 THEN discountAmount3/(amount-discountAmount1-discountAmount2) ELSE 0 END,2) as discountRate3 
, ROUND(100*CASE WHEN (amount-discountAmount1-discountAmount2-discountAmount3)>0 THEN discountAmount4/(amount-discountAmount1-discountAmount2-discountAmount3) ELSE 0 END,2) as discountRate4
, ROUND(100*CASE WHEN (amount-discountAmount1-discountAmount2-discountAmount3-discountAmount4)>0 
	THEN discountAmount5/(amount-discountAmount1-discountAmount2-discountAmount3-discountAmount4) ELSE 0 END,2) as discountRate5
, ROUND(100*CASE WHEN (amount-discountAmount1-discountAmount2-discountAmount3-discountAmount4-discountAmount5)>0 
	THEN discountAmount5/(amount-discountAmount1-discountAmount2-discountAmount3-discountAmount4-discountAmount5) ELSE 0 END,2) as discountRate6
,ROUND(grossTotal+vat,2) as netTotal
FROM (
SELECT SIP.sip_tarih as issueDate, SIP.sip_evrakno_seri + CAST(SIP.sip_evrakno_sira as varchar(10)) as orderNumber, 
SIP.sip_belgeno as documentNumber,
dbo.fn_SiparisCins(SIP.sip_cins) as orderType,
SIP.sip_musteri_kod as firmId, SIP.sip_musteri_kod + ' - ' + CARI.cari_unvan1 as firm,
CAST(SIP.sip_depono as VARCHAR(10)) as warehouseId, CAST(SIP.sip_depono as VARCHAR(10)) + ' - ' + dbo.fn_DepoIsmi(SIP.sip_depono) as warehouse,
SUM(SIP.sip_miktar) as quantity, SUM(SIP.sip_teslim_miktar) as delivered,
ROUND(SUM(SIP.sip_tutar),2) as amount,
ROUND(SUM(SIP.sip_iskonto_1),2) as discountAmount1, ROUND(SUM(SIP.sip_iskonto_2),2) as discountAmount2, ROUND(SUM(SIP.sip_iskonto_3),2)  as discountAmount3,
ROUND(SUM(SIP.sip_iskonto_4),2) as discountAmount4, ROUND(SUM(SIP.sip_iskonto_5),2) as discountAmount5, ROUND(SUM(SIP.sip_iskonto_6),2) as discountAmount6,
ROUND(dbo.fn_SiparisNetTutar(SUM(SIP.sip_tutar),SUM(SIP.sip_iskonto_1),SUM(SIP.sip_iskonto_2),SUM(SIP.sip_iskonto_3),SUM(SIP.sip_iskonto_4),SUM(SIP.sip_iskonto_5),SUM(SIP.sip_iskonto_6)
,SUM(SIP.sip_masraf_1),SUM(SIP.sip_masraf_2),SUM(SIP.sip_masraf_3),SUM(SIP.sip_masraf_4),0,SUM(SIP.sip_masvergi),
SUM(SIP.sip_Otv_Vergi),SUM(SIP.sip_otvtutari),0,0, 1,0,0),2) as grossTotal,
ROUND(SUM(SIP.sip_vergi),2) as vat , dbo.fn_DovizSembolu(SIP.sip_doviz_cinsi) as currency,
SIP.sip_satici_kod as salespersonId, SIP.sip_satici_kod as salesperson,
COUNT(*) as lineCount
FROM SIPARISLER SIP INNER JOIN
CARI_HESAPLAR CARI on SIP.sip_musteri_kod = CARI.cari_kod
WHERE SIP.sip_tip=${ioType} 
and (
  ('${isClosed}'='1' AND (SIP.sip_miktar<=SIP.sip_teslim_miktar OR SIP.sip_kapat_fl=1))
   OR
  ('${isClosed}'='0' AND (SIP.sip_miktar>SIP.sip_teslim_miktar AND SIP.sip_kapat_fl=0))
  OR
  ('${isClosed}'='')
)
GROUP BY SIP.sip_tarih, SIP.sip_evrakno_seri , SIP.sip_evrakno_sira,
SIP.sip_cins, CARI.cari_unvan1,SIP.sip_musteri_kod , SIP.sip_depono, 
SIP.sip_belgeno, SIP.sip_doviz_cinsi, SIP.sip_satici_kod
) X
WHERE (firm like '%${search}%' or orderNumber like '%${search}%')
and (issueDate>='${startDate}' and issueDate<='${endDate}')
and (warehouseId='${warehouseId}' OR '${warehouseId}'='')

ORDER BY issueDate DESC
`
}

export function orderHeaderQuery(orderId: string, ioType: number) {
  return `SELECT orderNumber as _id, *, quantity-delivered as remainder 
, ROUND(100*CASE WHEN amount>0 THEN discountAmount1/amount ELSE 0 END,2) as discountRate1 
, ROUND(100*CASE WHEN (amount-discountAmount1)>0 THEN discountAmount2/(amount-discountAmount1) ELSE 0 END,2) as discountRate2 
, ROUND(100*CASE WHEN (amount-discountAmount1-discountAmount2)>0 THEN discountAmount3/(amount-discountAmount1-discountAmount2) ELSE 0 END,2) as discountRate3 
, ROUND(100*CASE WHEN (amount-discountAmount1-discountAmount2-discountAmount3)>0 THEN discountAmount4/(amount-discountAmount1-discountAmount2-discountAmount3) ELSE 0 END,2) as discountRate4
, ROUND(100*CASE WHEN (amount-discountAmount1-discountAmount2-discountAmount3-discountAmount4)>0 
	THEN discountAmount5/(amount-discountAmount1-discountAmount2-discountAmount3-discountAmount4) ELSE 0 END,2) as discountRate5
, ROUND(100*CASE WHEN (amount-discountAmount1-discountAmount2-discountAmount3-discountAmount4-discountAmount5)>0 
	THEN discountAmount5/(amount-discountAmount1-discountAmount2-discountAmount3-discountAmount4-discountAmount5) ELSE 0 END,2) as discountRate6
,ROUND(grossTotal+vatAmount,2) as netTotal
  FROM (
    SELECT 
    SIP.sip_tip as ioType,
	(SELECT TOP 1 sip_Guid  FROM SIPARISLER WHERE sip_tip=SIP.sip_tip and sip_cins=SIP.sip_cins and 
	sip_evrakno_seri=SIP.sip_evrakno_seri and sip_evrakno_sira=SIP.sip_evrakno_sira AND sip_satirno=0) as sip_Guid,
    dbo.fn_SiparisCins(SIP.sip_cins) as orderType,
    SIP.sip_tarih as issueDate,
    
    SIP.sip_evrakno_seri as docNoSerial,SIP.sip_evrakno_sira as docNoSequence,
    (SIP.sip_evrakno_seri + CAST(SIP.sip_evrakno_sira as varchar(10))) as orderNumber,
    SIP.sip_belgeno as documentNumber, SIP.sip_belge_tarih as documentDate,
    CARI.cari_kod as firmId, CARI.cari_kod + ' - ' + CARI.cari_unvan1 as firm,
    CAST(SIP.sip_depono as VARCHAR(10)) as warehouseId, CAST(SIP.sip_depono as VARCHAR(10)) + ' - ' + dbo.fn_DepoIsmi(SIP.sip_depono) as warehouse,
    SIP.sip_adresno,
    SUM(SIP.sip_miktar) as quantity, SUM(SIP.sip_teslim_miktar) as delivered,
    ROUND(SUM(SIP.sip_tutar),2) as amount,
    ROUND(SUM(SIP.sip_iskonto_1),2) as discountAmount1, ROUND(SUM(SIP.sip_iskonto_2),2) as discountAmount2, ROUND(SUM(SIP.sip_iskonto_3),2)  as discountAmount3,
    ROUND(SUM(SIP.sip_iskonto_4),2) as discountAmount4, ROUND(SUM(SIP.sip_iskonto_5),2) as discountAmount5, ROUND(SUM(SIP.sip_iskonto_6),2) as discountAmount6,
    ROUND(dbo.fn_SiparisNetTutar(SUM(SIP.sip_tutar),SUM(SIP.sip_iskonto_1),SUM(SIP.sip_iskonto_2),SUM(SIP.sip_iskonto_3),SUM(SIP.sip_iskonto_4),SUM(SIP.sip_iskonto_5),SUM(SIP.sip_iskonto_6)
    ,SUM(SIP.sip_masraf_1),SUM(SIP.sip_masraf_2),SUM(SIP.sip_masraf_3),SUM(SIP.sip_masraf_4),0,SUM(SIP.sip_masvergi),
    SUM(SIP.sip_Otv_Vergi),SUM(SIP.sip_otvtutari),0,0, 1,0,0),2) as grossTotal,
    ROUND(SUM(SIP.sip_vergi),2) as vatAmount , dbo.fn_DovizSembolu(SIP.sip_doviz_cinsi) as currency,
    COUNT(*) as lineCount , CAST(SIP.sip_opno as VARCHAR(10)) as paymentPlanId, ISNULL(ODP.odp_kodu + '-' + ODP.odp_adi,'Peşin') as paymentPlan
    ,SIP.sip_stok_sormerk as responsibilityId , ISNULL(SOM.som_kod + '-' + SOM.som_isim,'') as responsibility
	,SIP.sip_projekodu as projectId, ISNULL(PRO.pro_kodu + '-' + PRO.pro_adi,'') as project
	,SIP.sip_teslimturu as deliveryTypeId, ISNULL(TSLT.tslt_kod + '-' + TSLT.tslt_ismi,'') as deliveryType
    FROM SIPARISLER SIP INNER JOIN
    CARI_HESAPLAR CARI ON SIP.sip_musteri_kod=CARI.cari_kod LEFT OUTER JOIN
    ODEME_PLANLARI ODP ON SIP.sip_opno= ODP.odp_no  LEFT OUTER JOIN
    TESLIM_TURLERI TSLT ON SIP.sip_teslimturu = TSLT.tslt_kod  LEFT OUTER JOIN
	PROJELER PRO ON SIP.sip_projekodu = PRO.pro_kodu LEFT OUTER JOIN
	SORUMLULUK_MERKEZLERI SOM ON SIP.sip_cari_sormerk=SOM.som_kod
    WHERE SIP.sip_tip=1
    GROUP BY SIP.sip_tarih,SIP.sip_belgeno,SIP.sip_evrakno_seri,SIP.sip_evrakno_sira,SIP.sip_belge_tarih,
    SIP.sip_depono,CARI.cari_kod, CARI.cari_unvan1, SIP.sip_adresno, SIP.sip_doviz_cinsi, SIP.sip_cins,
    SIP.sip_opno,ODP.odp_kodu, ODP.odp_adi,SIP.sip_stok_sormerk, SIP.sip_projekodu, SIP.sip_tip,SIP.sip_stok_sormerk,
	SOM.som_kod,SOM.som_isim,PRO.pro_kodu, PRO.pro_adi,SIP.sip_teslimturu,TSLT.tslt_kod, TSLT.tslt_ismi
    ) X
    WHERE orderNumber='${orderId}' and ioType=${ioType};`
}

export function orderDetailQuery(orderId: string, ioType: number) {
  return `SELECT *, quantity-delivered as remainder 
, ROUND(100*CASE WHEN amount>0 THEN discountAmount1/amount ELSE 0 END,2) as discountRate1 
, ROUND(100*CASE WHEN (amount-discountAmount1)>0 THEN discountAmount2/(amount-discountAmount1) ELSE 0 END,2) as discountRate2 
, ROUND(100*CASE WHEN (amount-discountAmount1-discountAmount2)>0 THEN discountAmount3/(amount-discountAmount1-discountAmount2) ELSE 0 END,2) as discountRate3 
, ROUND(100*CASE WHEN (amount-discountAmount1-discountAmount2-discountAmount3)>0 THEN discountAmount4/(amount-discountAmount1-discountAmount2-discountAmount3) ELSE 0 END,2) as discountRate4
, ROUND(100*CASE WHEN (amount-discountAmount1-discountAmount2-discountAmount3-discountAmount4)>0 
	THEN discountAmount5/(amount-discountAmount1-discountAmount2-discountAmount3-discountAmount4) ELSE 0 END,2) as discountRate5
, ROUND(100*CASE WHEN (amount-discountAmount1-discountAmount2-discountAmount3-discountAmount4-discountAmount5)>0 
	THEN discountAmount5/(amount-discountAmount1-discountAmount2-discountAmount3-discountAmount4-discountAmount5) ELSE 0 END,2) as discountRate6
,ROUND(lineGrossTotal+vatAmount,2) as lineNetTotal
FROM (
SELECT SIP.sip_Guid as _id,SIP.sip_Guid ,
SIP.sip_tip as ioType,
(SIP.sip_evrakno_seri + CAST(SIP.sip_evrakno_sira as VARCHAR(10))) as orderId,
SIP.sip_satirno as [lineNo], SIP.sip_stok_kod as itemId, SIP.sip_stok_kod + ' - ' + S.sto_isim as item
, ISNULL((SELECT TOP 1 bar_kodu FROM BARKOD_TANIMLARI WHERE bar_stokkodu= S.sto_kod),'') as barcode
, RTRIM(SIP.sip_aciklama + ' ' + SIP.sip_aciklama2) as description
,SIP.sip_miktar as quantity, SIP.sip_teslim_miktar as delivered, S.sto_birim1_ad as unit
,SIP.sip_b_fiyat as price, SIP.sip_tutar as amount ,
SIP.sip_iskonto_1 as discountAmount1,SIP.sip_iskonto_2 as discountAmount2,SIP.sip_iskonto_3 as discountAmount3,SIP.sip_iskonto_4 as discountAmount4,SIP.sip_iskonto_5 as discountAmount5,SIP.sip_iskonto_6 as discountAmount6,
dbo.fn_VergiYuzde(SIP.sip_vergi_pntr) as vatRate, SIP.sip_vergi as vatAmount,
dbo.fn_SiparisNetTutar(SIP.sip_tutar,SIP.sip_iskonto_1,SIP.sip_iskonto_2,SIP.sip_iskonto_3,SIP.sip_iskonto_4,SIP.sip_iskonto_5,SIP.sip_iskonto_6
,SIP.sip_masraf_1,SIP.sip_masraf_2,SIP.sip_masraf_3,SIP.sip_masraf_4,0, SIP.sip_masvergi,SIP.sip_Otv_Vergi,SIP.sip_otvtutari
,SIP.sip_vergisiz_fl,SIP.sip_doviz_cinsi, SIP.sip_doviz_kuru, SIP.sip_alt_doviz_kuru, 0) as lineGrossTotal

FROM SIPARISLER SIP INNER JOIN
STOKLAR S ON SIP.sip_stok_kod = S.sto_kod

WHERE 1=1
) X
WHERE orderId='${orderId}' and ioType=${ioType}
order by [lineNo]
  `
}

function preSaveOrder(token: string, orderHeader: OrderHeader, orderDetails: OrderDetail[]) {
  return new Promise<void>((resolve, reject) => {
    if (orderDetails.length == 0) return reject('Lines cannot be empty')
    if (!orderHeader.firmId) return reject('Firm required')
    if (!orderHeader.warehouseId) return reject('Warehouse required')

    resolve()
  })
}
export function saveOrder(token: string, orderHeader: OrderHeader, orderDetails: OrderDetail[]) {
  return new Promise<void>((resolve, reject) => {
    try {
      let msg = ''
      let query = ''
      preSaveOrder(token, orderHeader, orderDetails)
        .then(() => {
         
          query = `
            DECLARE @EvrakSira INT=${orderHeader.sip_Guid ? orderHeader.docNoSequence : 0};
            DECLARE @EvrakSeri VARCHAR(50)='${(orderHeader.docNoSerial || '').replaceAll("'", "''")}';
            DECLARE @SIP_TIP INT = ${orderHeader.ioType};
            DECLARE @SIP_CINS INT = 0;
            DECLARE @MikroUserNo INT = 99;
            DECLARE @SatirNo INT = -1;
            
            IF @EvrakSira=0 BEGIN
              SELECT @EvrakSira=ISNULL(MAX(sip_evrakno_sira),0)+1 FROM SIPARISLER WHERE sip_tip=@SIP_TIP AND sip_cins=@SIP_CINS AND sip_evrakno_seri=@EvrakSeri;
            END
            `

          const qList = orderDetails.map((e, rowIndex) => {
            if (e.sip_Guid) {
              if (e.deleted) {
                return `DELETE FROM SIPARISLER WHERE sip_Guid='${e.sip_Guid}';`
              } else {
                return updateLineQuery(orderHeader, e);
              }

            } else {
              return insertLineQuery(orderHeader, e)
            }
          }) as string[]
          query += qList.join('\n');

          postItem(`/mikro/save`, token, { query: query })
            .then(result => {
              console.log('saveOrder result:', result)
              resolve(result)
            })
            .catch(reject)
        })
        .catch(reject)

    } catch (err) {
      console.log('try error:', err)
      reject(err)
    }
  })
}

function insertLineQuery(orderHeader: OrderHeader, orderDetail: OrderDetail) {
  return `
        SET @SatirNo=@SatirNo+1;
        INSERT INTO SIPARISLER (sip_Guid, sip_DBCno, sip_SpecRECno, sip_iptal, sip_fileid, sip_hidden, sip_kilitli, sip_degisti, sip_checksum, sip_create_user, sip_create_date, sip_lastup_user, sip_lastup_date, sip_special1, sip_special2, sip_special3, sip_firmano, sip_subeno, sip_tarih, sip_teslim_tarih, sip_tip, sip_cins, sip_evrakno_seri, sip_evrakno_sira, sip_satirno, sip_belgeno, sip_belge_tarih, sip_satici_kod, sip_musteri_kod, sip_stok_kod, sip_b_fiyat, sip_miktar, sip_birim_pntr, sip_teslim_miktar, sip_tutar, sip_iskonto_1, sip_iskonto_2, sip_iskonto_3, sip_iskonto_4, sip_iskonto_5, sip_iskonto_6, sip_masraf_1, sip_masraf_2, sip_masraf_3, sip_masraf_4, sip_vergi_pntr, sip_vergi, sip_masvergi_pntr, sip_masvergi, sip_opno, sip_aciklama, sip_aciklama2, sip_depono, sip_OnaylayanKulNo, sip_vergisiz_fl, sip_kapat_fl, sip_promosyon_fl, sip_cari_sormerk, sip_stok_sormerk, sip_cari_grupno, sip_doviz_cinsi, sip_doviz_kuru, sip_alt_doviz_kuru, sip_adresno, sip_teslimturu, sip_cagrilabilir_fl, sip_prosip_uid, sip_iskonto1, sip_iskonto2, sip_iskonto3, sip_iskonto4, sip_iskonto5, sip_iskonto6, sip_masraf1, sip_masraf2, sip_masraf3, sip_masraf4, sip_isk1, sip_isk2, sip_isk3, sip_isk4, sip_isk5, sip_isk6, sip_mas1, sip_mas2, sip_mas3, sip_mas4, sip_Exp_Imp_Kodu, sip_kar_orani, sip_durumu, sip_stal_uid, sip_planlananmiktar, sip_teklif_uid, sip_parti_kodu, sip_lot_no, sip_projekodu, sip_fiyat_liste_no, sip_Otv_Pntr, sip_Otv_Vergi, sip_otvtutari, sip_OtvVergisiz_Fl, sip_paket_kod, sip_Rez_uid, sip_harekettipi, sip_yetkili_uid, sip_kapatmanedenkod, sip_gecerlilik_tarihi, sip_onodeme_evrak_tip, sip_onodeme_evrak_seri, sip_onodeme_evrak_sira, sip_rezervasyon_miktari, sip_rezerveden_teslim_edilen, sip_HareketGrupKodu1, sip_HareketGrupKodu2, sip_HareketGrupKodu3, sip_Olcu1, sip_Olcu2, sip_Olcu3, sip_Olcu4, sip_Olcu5, sip_FormulMiktarNo, sip_FormulMiktar, sip_satis_fiyat_doviz_cinsi, sip_satis_fiyat_doviz_kuru, sip_eticaret_kanal_kodu, sip_Tevkifat_turu, sip_otv_tevkifat_turu, sip_otv_tevkifat_tutari, sip_tevkifat_sifirlandi_fl) 
        VALUES(NEWID(), 0, 0, 0, 21, 0, 0, 0, 0, @MikroUserNo, GETDATE(),  @MikroUserNo, GETDATE(), '', '', 'DNMK', 0, 0
        ,'${orderHeader.issueDate}', '${orderDetail.deliveryDate || orderHeader.issueDate || new Date().toISOString().substring(0, 10)}'
        ,@SIP_TIP, @SIP_CINS, @EvrakSeri, @EvrakSira, @SatirNo
        ,'${(orderHeader.documentNumber || '').replaceAll("'", "''")}', '${orderHeader.documentDate}', '${orderHeader.salespersonId || ''}'
        ,'${orderHeader.firmId}', '${orderDetail.itemId}', ${orderDetail.price || 0}, ${orderDetail.quantity || 0}, 1, 0, ${orderDetail.amount}
        ,${orderDetail.discountAmount1 || 0}, ${orderDetail.discountAmount2 || 0}, ${orderDetail.discountAmount3 || 0}
        ,${orderDetail.discountAmount4 || 0}, ${orderDetail.discountAmount5 || 0}, ${orderDetail.discountAmount6 || 0}
        ,${orderDetail.expenseAmount1 || 0}, ${orderDetail.expenseAmount2 || 0}, ${orderDetail.expenseAmount3 || 0}, ${orderDetail.expenseAmount4 || 0}
        ,1 /*sip_vergi_pntr TODO: vergi pointer gelecek*/   , ${orderDetail.vatAmount || 0}
        ,0 /*sip_masvergi_pntr*/, 0 /*sip_masvergi*/
        , ${orderHeader.paymentPlanId || ''}, '${(orderDetail.description || '').replaceAll("'", "''").substring(0, 50)}'
        ,'${(orderDetail.description || '').replaceAll("'", "''").substring(50, 100)}', ${orderHeader.warehouseId || 0}
        ,0 /*sip_OnaylayanKulNo*/, 0 /*sip_vergisiz_fl*/, 0 /*sip_kapat_fl*/, 0 /*sip_promosyon_fl*/
        ,'${orderHeader.responsibilityId || ''}', '${orderHeader.responsibilityId || ''}', 0 /*sip_cari_grupno*/, 0 /*sip_doviz_cinsi*/, 1 /*sip_doviz_kuru*/
        ,0 /*sip_alt_doviz_kuru*/, 1 /*sip_adresno*/, '' /*sip_teslimturu*/, 0 /*sip_cagrilabilir_fl*/
        ,'00000000-0000-0000-0000-000000000000' /*sip_prosip_uid*/, 0 /*sip_iskonto1*/, 1 /*sip_iskonto2*/, 1 /*sip_iskonto3*/, 1 /*sip_iskonto4*/, 1 /*sip_iskonto5*/, 1 /*sip_iskonto6*/
        ,1 /*sip_masraf1*/,1 /*sip_masraf2*/,1 /*sip_masraf3*/,1 /*sip_masraf4*/,1 /*sip_isk1*/,0 /*sip_isk2*/,0 /*sip_isk3*/, 0 /*sip_isk4*/, 0 /*sip_isk5*/, 0 /*sip_isk6*/
        ,0 /*sip_mas1*/, 0 /*sip_mas2*/,0 /*sip_mas3*/, 0 /*sip_mas4*/, '' /*sip_Exp_Imp_Kodu*/, 0 /*sip_kar_orani*/, 0 /*sip_durumu*/,'00000000-0000-0000-0000-000000000000' /*sip_stal_uid*/
        ,0 /*sip_planlananmiktar*/, '00000000-0000-0000-0000-000000000000' /*sip_teklif_uid*/, '' /*sip_parti_kodu*/, 0  /*sip_lot_no*/, '${orderHeader.projectId || ''}'
        ,0 /*sip_fiyat_liste_no*/, 0 /*sip_Otv_Pntr*/, 0 /*sip_Otv_Vergi*/, 0 /*sip_otvtutari*/, 0 /*sip_OtvVergisiz_Fl*/,'' /*sip_paket_kod*/
        ,'00000000-0000-0000-0000-000000000000' /*sip_Rez_uid*/, 0 /*sip_harekettipi*/ ,'00000000-0000-0000-0000-000000000000' /*sip_yetkili_uid*/,'' /*sip_kapatmanedenkod*/
        ,'1900-01-01' /*sip_gecerlilik_tarihi*/ ,0 /*sip_onodeme_evrak_tip*/ ,'' /*sip_onodeme_evrak_seri*/ ,0 /*sip_onodeme_evrak_sira*/ ,0 /*sip_rezervasyon_miktari*/
        ,0 /*sip_rezerveden_teslim_edilen*/ ,'' /*sip_HareketGrupKodu1*/ ,'' /*sip_HareketGrupKodu2*/ ,'' /*sip_HareketGrupKodu3*/ ,0 /*sip_Olcu1*/ ,0 /*sip_Olcu2*/,0 /*sip_Olcu3*/ ,0 /*sip_Olcu4*/
        ,0 /*sip_Olcu5*/,0 /*sip_FormulMiktarNo*/,0 /*sip_FormulMiktar*/,0 /*sip_satis_fiyat_doviz_cinsi*/ ,0 /*sip_satis_fiyat_doviz_kuru*/,'' /*sip_eticaret_kanal_kodu*/ 
        ,0 /*sip_Tevkifat_turu*/, 0 /*sip_otv_tevkifat_turu*/ ,0 /*sip_otv_tevkifat_tutari*/, 0 /*sip_tevkifat_sifirlandi_fl*/  );
        `
}

function updateLineQuery(orderHeader: OrderHeader, orderDetail: OrderDetail) {
  return `
      SET @SatirNo=@SatirNo+1;
      UPDATE SIPARISLER SET
        sip_lastup_user=@MikroUserNo, sip_lastup_date=GETDATE(),
        sip_special3='DNMK',
        sip_tarih='${orderHeader.issueDate}', sip_teslim_tarih='${orderDetail.deliveryDate || orderHeader.issueDate || new Date().toISOString().substring(0, 10)}',
        -- sip_evrakno_seri='',sip_evrakno_sira=0 , 
        sip_satirno=@SatirNo, sip_belgeno='${orderHeader.documentNumber}',sip_belge_tarih='${orderHeader.documentDate}',
        sip_satici_kod='${orderHeader.salespersonId || ''}', sip_musteri_kod='${orderHeader.firmId || ''}',
        sip_stok_kod='${orderDetail.itemId || ''}', sip_b_fiyat=${orderDetail.price || 0}, sip_miktar=${orderDetail.quantity}, sip_birim_pntr=1,
        sip_tutar=${orderDetail.amount || 0}, sip_iskonto_1=${orderDetail.discountAmount1 || 0}, sip_iskonto_2=${orderDetail.discountAmount2 || 0},
        sip_iskonto_3=${orderDetail.discountAmount3 || 0}, sip_iskonto_4=${orderDetail.discountAmount4 || 0},
        sip_iskonto_5=${orderDetail.discountAmount5 || 0},sip_iskonto_6=${orderDetail.discountAmount6 || 0},
        sip_masraf_1=${orderDetail.expenseAmount1 || 0}, sip_masraf_2=${orderDetail.expenseAmount2 || 0}, 
        sip_masraf_3=${orderDetail.expenseAmount3 || 0}, sip_masraf_4=${orderDetail.expenseAmount4 || 0},
        sip_vergi_pntr=1, --- // TODO: vergi pointer eklenecek
        sip_vergi=${orderDetail.vatAmount},
        sip_masvergi_pntr=0, sip_masvergi=0, -- 
        sip_opno=${orderHeader.paymentPlanId},
        sip_aciklama='${(orderDetail.description || '').replaceAll("'", "''").substring(0, 50)}', 
        sip_aciklama2='${(orderDetail.description || '').replaceAll("'", "''").substring(50, 100)}',
        sip_depono=${orderHeader.warehouseId || 0},
        sip_cari_sormerk='${orderHeader.responsibilityId || ''}',
        sip_stok_sormerk='${orderHeader.responsibilityId || ''}',
        -- sip_doviz_cinsi=${orderHeader.currency || ''},   // TODO : Doviz cinsi eklenecek
        sip_doviz_kuru=1,
        sip_alt_doviz_kuru=0,
        sip_adresno=1,
        sip_teslimturu=''
        WHERE sip_Guid='${orderDetail.sip_Guid}';
              
         `
}