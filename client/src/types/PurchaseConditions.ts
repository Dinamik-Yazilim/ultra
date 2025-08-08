import { postItem } from "@/lib/fetch"
import { today } from "@/lib/utils"

export interface PurchaseConditionHeader {
  sas_Guid?: string
  _id?: string
  issueDate?: string
  docNoSerial?: string
  docNoSequence?: number
  documentNumber?: string
  documentDate?: string
  startDate?: string
  endDate?: string
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

  currency?: string
  lineCount?: number
}

export interface PurchaseConditionDetail {
  sas_Guid?: string
  _id?: string
  orderId?: string
  lineNo?: number
  itemId?: string
  item?: string
  unit?: string
  quantityCondition?: number
  quantity?: number
  grossPrice?: number

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
  expenseRate1?: number
  expenseRate2?: number
  expenseRate3?: number
  expenseRate4?: number
  salesPrice?: number
  vatRate?: number
  profitRate?: number
  netPurchasePrice?: number
  netSalesPrice?: number
  description?: string
  deleted?: boolean
}

export interface PurchaseConditionListQueryProps {
  top?: number
  search?: string
  warehouseId?: string
  startDate?: string
  endDate?: string
}
export function purchaseConditionListQuery({ top = 100, search = '', warehouseId = '', startDate = today(), endDate = today() }: PurchaseConditionListQueryProps) {
  return `SELECT TOP ${top} * FROM (
    SELECT sas_evrak_no_seri + CAST(sas_evrak_no_sira as VARCHAR(10)) as _id,
    MIN(sas_Guid) AS sas_Guid,
    sas_evrak_tarih AS issueDate,
    sas_evrak_no_seri AS docNoSerial,
    sas_evrak_no_sira AS docNoSequence,
    sas_belge_no as documentNumber,
    sas_belge_tarih as documentDate,
    sas_cari_kod AS firmId,
    sas_cari_kod + ' - ' + C.cari_unvan1 as firm,
    sas_basla_tarih as startDate,
    sas_bitis_tarih as endDate,
    ROUND(SUM(sas_brut_fiyat + (sas_mas_miktar1 +
    sas_mas_miktar2 +
    sas_mas_miktar3 +
    sas_mas_miktar4) -
    (sas_isk_miktar1 +
    sas_isk_miktar2 +
    sas_isk_miktar3 +
    sas_isk_miktar4 +
    sas_isk_miktar5 +
    sas_isk_miktar6)),2) AS amount,
    count(*) as lineCount,
    CAST(SA.sas_depo_no as VARCHAR(10)) as warehouseId,
    ISNULL(CAST(D.dep_no as varchar(10)) + ' - ' + D.dep_adi,'') as warehouse,
    SA.sas_srmmrk_kodu as responsibilityId,
    ISNULL(SOM.som_kod + ' - ' + SOM.som_isim,'') as responsibility,
    SA.sas_proje_kodu as projectId,
    ISNULL(PRO.pro_kodu  + ' - ' + PRO.pro_adi,'') as project,
    CAST(SA.sas_odeme_plan as VARCHAR(10)) as paymentPlanId,
    CASE WHEN SA.sas_odeme_plan <0 THEN CAST(SA.sas_odeme_plan*-1 as VARCHAR(10)) + ' Gün' ELSE
    ISNULL(O.odp_kodu + ' - ' + O.odp_adi,'Peşin') END as paymentPlan,
    dbo.fn_DovizSembolu(SA.sas_doviz_cinsi) as currency
    FROM dbo.SATINALMA_SARTLARI SA WITH (NOLOCK) INNER JOIN
    CARI_HESAPLAR C ON SA.sas_cari_kod= C.cari_kod LEFT OUTER JOIN
    DEPOLAR D ON SA.sas_depo_no = D.dep_no LEFT OUTER JOIN
    SORUMLULUK_MERKEZLERI SOM ON SA.sas_srmmrk_kodu = SOM.som_kod LEFT OUTER JOIN
    PROJELER PRO ON SA.sas_proje_kodu = PRO.pro_kodu LEFT OUTER JOIN 
    ODEME_PLANLARI O ON SA.sas_odeme_plan = O.odp_no
    WHERE (sas_evrtipi=0) 
    GROUP BY sas_evrak_no_seri, sas_evrak_no_sira, sas_evrak_tarih, sas_cari_kod, C.cari_unvan1,sas_basla_tarih,sas_bitis_tarih, sas_depo_no, D.dep_no, D.dep_adi,
    sas_belge_no,sas_belge_tarih , SA.sas_srmmrk_kodu, SOM.som_kod, SOM.som_isim, SA.sas_proje_kodu, PRO.pro_kodu ,PRO.pro_adi ,
    SA.sas_odeme_plan, O.odp_no,O.odp_kodu, O.odp_adi, SA.sas_doviz_cinsi
    ) X
    WHERE (firm like '%${search}%' )
    ORDER BY issueDate DESC
    `
}

export function purchaseConditionHeaderQuery(docId: string) {
  return `SELECT  * FROM (
    SELECT sas_evrak_no_seri + CAST(sas_evrak_no_sira as VARCHAR(10)) as _id,
    MIN(sas_Guid) AS sas_Guid,
    sas_evrak_tarih AS issueDate,
    sas_evrak_no_seri AS docNoSerial,
    sas_evrak_no_sira AS docNoSequence,
    sas_belge_no as documentNumber,
    sas_belge_tarih as documentDate,
    sas_cari_kod AS firmId,
    sas_cari_kod + ' - ' + C.cari_unvan1 as firm,
    sas_basla_tarih as startDate,
    sas_bitis_tarih as endDate,
    ROUND(SUM(sas_brut_fiyat + (sas_mas_miktar1 +
    sas_mas_miktar2 +
    sas_mas_miktar3 +
    sas_mas_miktar4) -
    (sas_isk_miktar1 +
    sas_isk_miktar2 +
    sas_isk_miktar3 +
    sas_isk_miktar4 +
    sas_isk_miktar5 +
    sas_isk_miktar6)),2) AS amount,
    count(*) as lineCount,
    CAST(SA.sas_depo_no as VARCHAR(10)) as warehouseId,
    ISNULL(CAST(D.dep_no as varchar(10)) + ' - ' + D.dep_adi,'') as warehouse,
    SA.sas_srmmrk_kodu as responsibilityId,
    ISNULL(SOM.som_kod + ' - ' + SOM.som_isim,'') as responsibility,
    SA.sas_proje_kodu as projectId,
    ISNULL(PRO.pro_kodu  + ' - ' + PRO.pro_adi,'') as project,
    CAST(SA.sas_odeme_plan as VARCHAR(10)) as paymentPlanId,
    CASE WHEN SA.sas_odeme_plan <0 THEN CAST(SA.sas_odeme_plan*-1 as VARCHAR(10)) + ' Gün' ELSE
    ISNULL(O.odp_kodu + ' - ' + O.odp_adi,'Peşin') END as paymentPlan,
    dbo.fn_DovizSembolu(SA.sas_doviz_cinsi) as currency
    FROM SATINALMA_SARTLARI SA WITH (NOLOCK) INNER JOIN
    CARI_HESAPLAR C ON SA.sas_cari_kod= C.cari_kod LEFT OUTER JOIN
    DEPOLAR D ON SA.sas_depo_no = D.dep_no LEFT OUTER JOIN
    SORUMLULUK_MERKEZLERI SOM ON SA.sas_srmmrk_kodu = SOM.som_kod LEFT OUTER JOIN
    PROJELER PRO ON SA.sas_proje_kodu = PRO.pro_kodu LEFT OUTER JOIN 
    ODEME_PLANLARI O ON SA.sas_odeme_plan = O.odp_no
    WHERE (sas_evrtipi=0) 
    GROUP BY sas_evrak_no_seri, sas_evrak_no_sira, sas_evrak_tarih, sas_cari_kod, C.cari_unvan1,sas_basla_tarih,sas_bitis_tarih, sas_depo_no, D.dep_no, D.dep_adi,
    sas_belge_no,sas_belge_tarih , SA.sas_srmmrk_kodu, SOM.som_kod, SOM.som_isim, SA.sas_proje_kodu, PRO.pro_kodu ,PRO.pro_adi ,
    SA.sas_odeme_plan, O.odp_no,O.odp_kodu, O.odp_adi, SA.sas_doviz_cinsi
    ) X
    WHERE _id='${docId}' 
    `
}

export function purchaseConditionDetailQuery(docId: string) {
  return `SELECT * FROM (
SELECT  
SAS.sas_Guid,
SAS.sas_Guid as _id,
SAS.sas_evrak_no_seri + CAST(SAS.sas_evrak_no_sira as varchar(10)) as docId,
S.sto_kod as itemId,
S.sto_kod + ' - ' + S.sto_isim as item,
SAS.sas_miktar as quantity,
SAS.sas_brut_fiyat as grossPrice,
SAS.sas_isk_yuzde1 as discountRate1,
SAS.sas_isk_yuzde2 as discountRate2,
SAS.sas_isk_yuzde3 as discountRate3,
SAS.sas_kar_oran as profitRate,
sas_satis_fiyat as salesPrice,
SAS.sas_net_alis_kdvli as netPurchasePrice,
SAS.sas_net_satis_kdvli as netSalesPrice,
dbo.fn_VergiYuzde(S.sto_toptan_vergi) as vatRate,
SAS.sas_aciklama as description
FROM SATINALMA_SARTLARI SAS INNER JOIN
STOKLAR S ON SAS.sas_stok_kod=S.sto_kod
) X
WHERE docId='${docId}' `
}


function preSavePurchaseCondition(token: string, pcHeader: PurchaseConditionHeader, pcDetails: PurchaseConditionDetail[]) {
  return new Promise<void>((resolve, reject) => {
    if (pcDetails.length == 0) return reject('Lines cannot be empty')
    if (!pcHeader.firmId) return reject('Firm required')
    // if (!pcHeader.warehouseId) return reject('Warehouse required')

    resolve()
  })
}
export function savePurchaseCondition(token: string, pcHeader: PurchaseConditionHeader, pcDetails: PurchaseConditionDetail[]) {
  return new Promise<void>((resolve, reject) => {
    try {
      let msg = ''
      let query = ''
      preSavePurchaseCondition(token, pcHeader, pcDetails)
        .then(() => {


          query = `
            DECLARE @EvrakSira INT=${pcHeader.sas_Guid ? pcHeader.docNoSequence : 0};
            DECLARE @EvrakSeri VARCHAR(50)='${(pcHeader.docNoSerial || '').replaceAll("'", "''")}';
            
            DECLARE @MikroUserNo INT = 99;
            DECLARE @SatirNo INT = -1;
            
            IF @EvrakSira=0 BEGIN
              SELECT @EvrakSira=ISNULL(MAX(sas_evrak_no_sira),0)+1 FROM SATINALMA_SARTLARI WHERE sas_evrak_no_seri=@EvrakSeri;
            END
            DELETE FROM SATINALMA_SARTLARI WHERE sas_evrak_no_seri=@EvrakSeri AND sas_evrak_no_sira=@EvrakSira;
            `

          const qList = pcDetails.map((e, rowIndex) => {
            if (e.itemId) {
              if (e.sas_Guid) {
                if (e.deleted) {
                  //return `DELETE FROM SATINALMA_SARTLARI WHERE sas_Guid='${e.sas_Guid}';`
                } else {
                  return updateLineQuery(pcHeader, e);
                }

              } else {
                return insertLineQuery(pcHeader, e)
              }
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

function insertLineQuery(pcHeader: PurchaseConditionHeader, pcDetail: PurchaseConditionDetail) {
  let q = `
        SET @SatirNo=@SatirNo+1;
        INSERT INTO SATINALMA_SARTLARI (sas_Guid, sas_DBCno, sas_SpecRECno, sas_iptal, sas_fileid, sas_hidden, sas_kilitli, sas_degisti, sas_checksum, sas_create_user, sas_create_date, sas_lastup_user, sas_lastup_date, sas_special1, sas_special2, sas_special3, sas_stok_kod, sas_cari_kod, sas_evrak_no_seri, sas_evrak_no_sira, sas_evrak_tarih, sas_satir_no, sas_belge_no, sas_belge_tarih, sas_asgari_miktar, sas_teslim_sure, sas_basla_tarih, sas_bitis_tarih, sas_brut_fiyat, sas_isk_acik1, sas_isk_uyg1, sas_isk_durum1, sas_isk_vergi1, sas_isk_kriter1, sas_isk_yuzde1, sas_isk_miktar1, sas_isk_acik2, sas_isk_uyg2, sas_isk_durum2, sas_isk_vergi2, sas_isk_kriter2, sas_isk_yuzde2, sas_isk_miktar2, sas_isk_acik3, sas_isk_uyg3, sas_isk_durum3, sas_isk_vergi3, sas_isk_kriter3, sas_isk_yuzde3, sas_isk_miktar3, sas_isk_acik4, sas_isk_uyg4, sas_isk_durum4, sas_isk_vergi4, sas_isk_kriter4, sas_isk_yuzde4, sas_isk_miktar4, sas_isk_acik5, sas_isk_uyg5, sas_isk_durum5, sas_isk_vergi5, sas_isk_kriter5, sas_isk_yuzde5, sas_isk_miktar5, sas_isk_acik6, sas_isk_uyg6, sas_isk_durum6, sas_isk_vergi6, sas_isk_kriter6, sas_isk_yuzde6, sas_isk_miktar6, sas_mas_acik1, sas_mas_uyg1, sas_mas_durum1, sas_mas_vergi1, sas_mas_kriter1, sas_mas_yuzde1, sas_mas_miktar1, sas_mas_acik2, sas_mas_uyg2, sas_mas_durum2, sas_mas_vergi2, sas_mas_kriter2, sas_mas_yuzde2, sas_mas_miktar2, sas_mas_acik3, sas_mas_uyg3, sas_mas_durum3, sas_mas_vergi3, sas_mas_kriter3, sas_mas_yuzde3, sas_mas_miktar3, sas_mas_acik4, sas_mas_uyg4, sas_mas_durum4, sas_mas_vergi4, sas_mas_kriter4, sas_mas_yuzde4, sas_mas_miktar4, sas_odeme_plan, sas_net_alis_kdvli, sas_kar_oran, sas_net_satis_kdvli, sas_satis_fiyat, sas_doviz_cinsi, sas_evrtipi, sas_aciklama, sas_depo_no, sas_maliyette_kullan_fl, sas_ilave_maliyet_tutari, sas_ilave_maliyet_yuzdesi, Sas_Kesinlesti_fl, Sas_ProSas_uid, sas_miktar_tip, sas_miktar, sas_proje_kodu, sas_srmmrk_kodu) 
                VALUES(NEWID(), 0, 0, 0, 44, 0, 0, 0, 0, @MikroUserNo, GETDATE(),  @MikroUserNo, GETDATE(), '', '', 'DNMK', 
                 '${pcDetail.itemId || ''}', '${pcHeader.firmId || ''}', @EvrakSeri, @EvrakSira, '${pcHeader.issueDate || ''}',
                  @SatirNo, '${(pcHeader.documentNumber || '').replaceAll("'", "''")}', '${pcHeader.documentDate}'
                  ,0 /*sas_asgari_miktar*/, 0 /*sas_teslim_sure*/, '${pcHeader.startDate || pcHeader.issueDate || ''}',
                  '${pcHeader.endDate || '1899-12-30 00:00:00.000'}',
                   ${pcDetail.grossPrice || 0}
                   ,'İskonto 1', 0 /*sas_isk_uyg1*/, 0 /*sas_isk_durum1*/,0 /*sas_isk_vergi1*/, 0 /*sas_isk_kriter1*/, ${pcDetail.discountRate1 || 0}, ${pcDetail.discountAmount1 || 0}
                   ,'İskonto 2',1 /*sas_isk_uyg2*/, 0 /*sas_isk_durum2*/, 0 /*sas_isk_vergi2*/, 0 /*sas_isk_kriter2*/, ${pcDetail.discountRate2 || 0}, ${pcDetail.discountAmount2 || 0}
                   ,'İskonto 3',1 /*sas_isk_uyg3*/, 0 /*sas_isk_durum3*/, 0 /*sas_isk_vergi3*/, 0 /*sas_isk_kriter3*/, ${pcDetail.discountRate3 || 0}, ${pcDetail.discountAmount3 || 0}
                   ,'İskonto 4',1 /*sas_isk_uyg4*/, 0 /*sas_isk_durum4*/, 0 /*sas_isk_vergi4*/, 0 /*sas_isk_kriter4*/, ${pcDetail.discountRate4 || 0}, ${pcDetail.discountAmount4 || 0}
                   ,'İskonto 5',1 /*sas_isk_uyg5*/, 0 /*sas_isk_durum5*/, 0 /*sas_isk_vergi5*/, 0 /*sas_isk_kriter5*/, ${pcDetail.discountRate5 || 0}, ${pcDetail.discountAmount5 || 0}
                   ,'İskonto 6',1 /*sas_isk_uyg6*/, 0 /*sas_isk_durum6*/, 0 /*sas_isk_vergi6*/, 0 /*sas_isk_kriter6*/, ${pcDetail.discountRate6 || 0}, ${pcDetail.discountAmount6 || 0}
                   , 'Masraf 1',1 /*sas_mas_uyg1*/, 0 /*sas_mas_durum1*/, 0 /*sas_mas_vergi1*/, 0 /*sas_mas_kriter1*/, ${pcDetail.expenseRate1 || 0}, ${pcDetail.expenseRate1 || 0}
                   , 'Masraf 2',1 /*sas_mas_uyg2*/, 0 /*sas_mas_durum2*/, 0 /*sas_mas_vergi2*/, 0 /*sas_mas_kriter2*/, ${pcDetail.expenseRate2 || 0}, ${pcDetail.expenseRate2 || 0}
                   , 'Masraf 3',1 /*sas_mas_uyg3*/, 0 /*sas_mas_durum3*/, 0 /*sas_mas_vergi3*/, 0 /*sas_mas_kriter3*/, ${pcDetail.expenseRate3 || 0}, ${pcDetail.expenseRate3 || 0}
                   , 'Masraf 4',1 /*sas_mas_uyg4*/, 0 /*sas_mas_durum4*/, 0 /*sas_mas_vergi4*/, 0 /*sas_mas_kriter4*/, ${pcDetail.expenseRate4 || 0}, ${pcDetail.expenseRate4 || 0}
                   , ${pcHeader.paymentPlanId || 0}, ${pcDetail.netPurchasePrice}, ${pcDetail.profitRate}, ${pcDetail.netSalesPrice}, ${pcDetail.salesPrice}
                   , 0 /*sas_doviz_cinsi*/, 0 /*sas_evrtipi*/, '${(pcDetail.description || '').replaceAll("'", "''")}'
                   , ${pcHeader.warehouseId || 0}, 0 /*sas_maliyette_kullan_fl*/, 0 /*sas_ilave_maliyet_tutari*/, 0 /*sas_ilave_maliyet_yuzdesi*/, 0 /*Sas_Kesinlesti_fl*/, '00000000-0000-0000-0000-000000000000'
                   , ${pcDetail.quantityCondition || 0} /*sas_miktar_tip*/, ${pcDetail.quantity || 0}, '${pcHeader.projectId || ''}', '${pcHeader.responsibilityId || ''}');
              `
  return q
}

function updateLineQuery(pcHeader: PurchaseConditionHeader, pcDetail: PurchaseConditionDetail) {
  let q = `
        SET @SatirNo=@SatirNo+1;
        INSERT INTO SATINALMA_SARTLARI (sas_Guid, sas_DBCno, sas_SpecRECno, sas_iptal, sas_fileid, sas_hidden, sas_kilitli, sas_degisti, sas_checksum, sas_create_user, sas_create_date, sas_lastup_user, sas_lastup_date, sas_special1, sas_special2, sas_special3, sas_stok_kod, sas_cari_kod, sas_evrak_no_seri, sas_evrak_no_sira, sas_evrak_tarih, sas_satir_no, sas_belge_no, sas_belge_tarih, sas_asgari_miktar, sas_teslim_sure, sas_basla_tarih, sas_bitis_tarih, sas_brut_fiyat, sas_isk_acik1, sas_isk_uyg1, sas_isk_durum1, sas_isk_vergi1, sas_isk_kriter1, sas_isk_yuzde1, sas_isk_miktar1, sas_isk_acik2, sas_isk_uyg2, sas_isk_durum2, sas_isk_vergi2, sas_isk_kriter2, sas_isk_yuzde2, sas_isk_miktar2, sas_isk_acik3, sas_isk_uyg3, sas_isk_durum3, sas_isk_vergi3, sas_isk_kriter3, sas_isk_yuzde3, sas_isk_miktar3, sas_isk_acik4, sas_isk_uyg4, sas_isk_durum4, sas_isk_vergi4, sas_isk_kriter4, sas_isk_yuzde4, sas_isk_miktar4, sas_isk_acik5, sas_isk_uyg5, sas_isk_durum5, sas_isk_vergi5, sas_isk_kriter5, sas_isk_yuzde5, sas_isk_miktar5, sas_isk_acik6, sas_isk_uyg6, sas_isk_durum6, sas_isk_vergi6, sas_isk_kriter6, sas_isk_yuzde6, sas_isk_miktar6, sas_mas_acik1, sas_mas_uyg1, sas_mas_durum1, sas_mas_vergi1, sas_mas_kriter1, sas_mas_yuzde1, sas_mas_miktar1, sas_mas_acik2, sas_mas_uyg2, sas_mas_durum2, sas_mas_vergi2, sas_mas_kriter2, sas_mas_yuzde2, sas_mas_miktar2, sas_mas_acik3, sas_mas_uyg3, sas_mas_durum3, sas_mas_vergi3, sas_mas_kriter3, sas_mas_yuzde3, sas_mas_miktar3, sas_mas_acik4, sas_mas_uyg4, sas_mas_durum4, sas_mas_vergi4, sas_mas_kriter4, sas_mas_yuzde4, sas_mas_miktar4, sas_odeme_plan, sas_net_alis_kdvli, sas_kar_oran, sas_net_satis_kdvli, sas_satis_fiyat, sas_doviz_cinsi, sas_evrtipi, sas_aciklama, sas_depo_no, sas_maliyette_kullan_fl, sas_ilave_maliyet_tutari, sas_ilave_maliyet_yuzdesi, Sas_Kesinlesti_fl, Sas_ProSas_uid, sas_miktar_tip, sas_miktar, sas_proje_kodu, sas_srmmrk_kodu) 
                VALUES('${pcDetail.sas_Guid || ''}', 0, 0, 0, 44, 0, 0, 0, 0, @MikroUserNo, GETDATE(),  @MikroUserNo, GETDATE(), '', '', 'DNMK', 
                 '${pcDetail.itemId || ''}', '${pcHeader.firmId || ''}', @EvrakSeri, @EvrakSira, '${pcHeader.issueDate || ''}',
                  @SatirNo, '${(pcHeader.documentNumber || '').replaceAll("'", "''")}', '${pcHeader.documentDate}'
                  ,0 /*sas_asgari_miktar*/, 0 /*sas_teslim_sure*/, '${pcHeader.startDate || pcHeader.issueDate || ''}',
                  '${pcHeader.endDate || '1899-12-30 00:00:00.000'}',
                   ${pcDetail.grossPrice || 0}
                   ,'İskonto 1', 0 /*sas_isk_uyg1*/, 0 /*sas_isk_durum1*/,0 /*sas_isk_vergi1*/, 0 /*sas_isk_kriter1*/, ${pcDetail.discountRate1 || 0}, ${pcDetail.discountAmount1 || 0}
                   ,'İskonto 2',1 /*sas_isk_uyg2*/, 0 /*sas_isk_durum2*/, 0 /*sas_isk_vergi2*/, 0 /*sas_isk_kriter2*/, ${pcDetail.discountRate2 || 0}, ${pcDetail.discountAmount2 || 0}
                   ,'İskonto 3',1 /*sas_isk_uyg3*/, 0 /*sas_isk_durum3*/, 0 /*sas_isk_vergi3*/, 0 /*sas_isk_kriter3*/, ${pcDetail.discountRate3 || 0}, ${pcDetail.discountAmount3 || 0}
                   ,'İskonto 4',1 /*sas_isk_uyg4*/, 0 /*sas_isk_durum4*/, 0 /*sas_isk_vergi4*/, 0 /*sas_isk_kriter4*/, ${pcDetail.discountRate4 || 0}, ${pcDetail.discountAmount4 || 0}
                   ,'İskonto 5',1 /*sas_isk_uyg5*/, 0 /*sas_isk_durum5*/, 0 /*sas_isk_vergi5*/, 0 /*sas_isk_kriter5*/, ${pcDetail.discountRate5 || 0}, ${pcDetail.discountAmount5 || 0}
                   ,'İskonto 6',1 /*sas_isk_uyg6*/, 0 /*sas_isk_durum6*/, 0 /*sas_isk_vergi6*/, 0 /*sas_isk_kriter6*/, ${pcDetail.discountRate6 || 0}, ${pcDetail.discountAmount6 || 0}
                   , 'Masraf 1',1 /*sas_mas_uyg1*/, 0 /*sas_mas_durum1*/, 0 /*sas_mas_vergi1*/, 0 /*sas_mas_kriter1*/, ${pcDetail.expenseRate1 || 0}, ${pcDetail.expenseRate1 || 0}
                   , 'Masraf 2',1 /*sas_mas_uyg2*/, 0 /*sas_mas_durum2*/, 0 /*sas_mas_vergi2*/, 0 /*sas_mas_kriter2*/, ${pcDetail.expenseRate2 || 0}, ${pcDetail.expenseRate2 || 0}
                   , 'Masraf 3',1 /*sas_mas_uyg3*/, 0 /*sas_mas_durum3*/, 0 /*sas_mas_vergi3*/, 0 /*sas_mas_kriter3*/, ${pcDetail.expenseRate3 || 0}, ${pcDetail.expenseRate3 || 0}
                   , 'Masraf 4',1 /*sas_mas_uyg4*/, 0 /*sas_mas_durum4*/, 0 /*sas_mas_vergi4*/, 0 /*sas_mas_kriter4*/, ${pcDetail.expenseRate4 || 0}, ${pcDetail.expenseRate4 || 0}
                   , ${pcHeader.paymentPlanId || 0}, ${pcDetail.netPurchasePrice}, ${pcDetail.profitRate}, ${pcDetail.netSalesPrice}, ${pcDetail.salesPrice}
                   , 0 /*sas_doviz_cinsi*/, 0 /*sas_evrtipi*/, '${(pcDetail.description || '').replaceAll("'", "''")}'
                   , ${pcHeader.warehouseId || 0}, 0 /*sas_maliyette_kullan_fl*/, 0 /*sas_ilave_maliyet_tutari*/, 0 /*sas_ilave_maliyet_yuzdesi*/, 0 /*Sas_Kesinlesti_fl*/, '00000000-0000-0000-0000-000000000000'
                   , ${pcDetail.quantityCondition || 0} /*sas_miktar_tip*/, ${pcDetail.quantity || 0}, '${pcHeader.projectId || ''}', '${pcHeader.responsibilityId || ''}');
              `
  return q
  // return `
  //     SET @SatirNo=@SatirNo+1;
  //     UPDATE SATINALMA_SARTLARI SET
  //       sas_lastup_user=@MikroUserNo, sas_lastup_date=GETDATE(),
  //       sas_special3='DNMK', 
  //       sas_stok_kod='${pcDetail.itemId}', sas_cari_kod='${pcHeader.firmId || ''}' , sas_evrak_tarih='${pcHeader.issueDate || ''}',
  //       sas_satir_no=@SatirNo, sas_belge_no='${(pcHeader.documentNumber || '').replaceAll("'","''")}', sas_belge_tarih='${pcHeader.documentDate || ''}',
  //       sas_basla_tarih='${pcHeader.startDate || ''}', sas_bitis_tarih='${pcHeader.endDate || '1899-12-30 00:00:00.000'}',
  //       sas_brut_fiyat=${pcDetail.grossPrice || 0}, 
  //       sas_isk_yuzde1=${pcDetail.discountRate1 || 0}, sas_isk_miktar1=${pcDetail.discountAmount1 || 0},
  //       sas_isk_yuzde2=${pcDetail.discountRate2 || 0}, sas_isk_miktar2=${pcDetail.discountAmount2 || 0},
  //       sas_isk_yuzde3=${pcDetail.discountRate3 || 0}, sas_isk_miktar3=${pcDetail.discountAmount3 || 0},
  //       sas_isk_yuzde4=${pcDetail.discountRate4 || 0}, sas_isk_miktar4=${pcDetail.discountAmount4 || 0},
  //       sas_isk_yuzde5=${pcDetail.discountRate5 || 0}, sas_isk_miktar5=${pcDetail.discountAmount5 || 0},
  //       sas_isk_yuzde6=${pcDetail.discountRate6 || 0}, sas_isk_miktar6=${pcDetail.discountAmount6 || 0},
  //       sas_mas_yuzde1=${pcDetail.expenseRate1 || 0}, sas_mas_miktar1=${pcDetail.expenseAmount1 || 0},
  //       sas_mas_yuzde2=${pcDetail.expenseRate2 || 0}, sas_mas_miktar2=${pcDetail.expenseAmount2 || 0},
  //       sas_mas_yuzde3=${pcDetail.expenseRate3 || 0}, sas_mas_miktar3=${pcDetail.expenseAmount3 || 0},
  //       sas_mas_yuzde4=${pcDetail.expenseRate4 || 0}, sas_mas_miktar4=${pcDetail.expenseAmount4 || 0},
  //       sas_odeme_plan=${pcHeader.paymentPlanId || 0}, sas_net_alis_kdvli=${pcDetail.netPurchasePrice || 0},
  //       sas_kar_oran=${pcDetail.profitRate || 0}, sas_net_satis_kdvli=${pcDetail.netSalesPrice || 0},
  //       sas_satis_fiyat=${pcDetail.salesPrice || 0}, sas_aciklama='${(pcDetail.description || '').replaceAll("'","''")}',
  //       sas_depo_no=${pcHeader.warehouseId || 0}, sas_miktar_tip=${pcDetail.quantityCondition || 0}, sas_miktar=${pcDetail.quantity || 0},
  //       sas_proje_kodu='${pcHeader.projectId || ''}', sas_srmmrk_kodu='${pcHeader.responsibilityId || ''}'
  //       WHERE sas_Guid='${pcDetail.sas_Guid}';
  //        `
}
