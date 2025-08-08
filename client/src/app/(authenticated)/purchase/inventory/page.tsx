"use client"

import { useEffect, useState } from 'react'
import { getItem, getList, postItem, putItem } from '@/lib/fetch'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { useToast } from '@/components/ui/use-toast'
import { TsnSelect } from '@/components/ui216/tsn-select'
import { useLanguage } from '@/i18n'
import { StandartForm } from '@/components/ui216/standart-form'
import { TsnInput } from '@/components/ui216/tsn-input'
import { Label } from '@/components/ui/label'
import { TsnPanel } from '@/components/ui216/tsn-panel'
import { PackageCheckIcon, Users2Icon } from 'lucide-react'
import { getRoleList, Member } from '@/types/Member'
import { ListGrid } from '@/components/ui216/list-grid'
import { TsnGrid } from '@/components/ui216/tsn-grid'
import { moneyFormat } from '@/lib/utils'
import { TsnSelectRemote } from '@/components/ui216/tsn-select-remote'
import { Inventory, inventoryQuery } from '@/types/Inventory'

interface FilterType {
  mainGroup?:string
  subGroup?:string
  category?:string
  brand?:string
  rayon?:string
}
export default function InventoryPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState({search:'', mainGroup:'',subGroup:'',category:'',brand:'',rayon:''})
  const router = useRouter()
  const { t } = useLanguage()
 
  return (
    <TsnGrid
      query={inventoryQuery(filter)}
      title={t('Inventory')}
      icon=<PackageCheckIcon />
      onSearchChanged={e=>setFilter({...filter,search:e})}
      onFilterPanel={() => {
        const [mainLoading,setMainLoading]=useState(false)
        return (<div className='flex flex-col gap-1'>
          <TsnSelectRemote all title={t('Main Group')} value={filter.mainGroup} 
            onValueChange={e => {
              setMainLoading(true)
              setFilter({...filter,mainGroup:e, subGroup:'', category:'', brand:'', rayon:''})
              setTimeout(()=>setMainLoading(false),500)
            }}
           query={`SELECT san_kod as _id, san_isim as name FROM STOK_ANA_GRUPLARI ORDER BY san_isim`}
          //  onLoadingFinish={()=>setMainLoading(false)}
            />
          {filter.mainGroup && !mainLoading && <TsnSelectRemote all title={t('Sub Group')} value={filter.subGroup} onValueChange={e => setFilter({...filter,subGroup:e})} query={`SELECT sta_kod as _id, sta_isim as name FROM STOK_ALT_GRUPLARI WHERE sta_ana_grup_kod='${filter.mainGroup}' ORDER BY sta_isim`} />}
          {filter.mainGroup && !mainLoading && <TsnSelectRemote all title={t('Category')} value={filter.category} onValueChange={e => setFilter({...filter,category:e})} query={`SELECT ktg_kod as _id, ktg_isim as name FROM STOK_KATEGORILERI WHERE ktg_kod IN (SELECT DISTINCT sto_kategori_kodu FROM STOKLAR WHERE sto_anagrup_kod='${filter.mainGroup}') ORDER BY ktg_isim`} /> }
          {filter.mainGroup && !mainLoading && <TsnSelectRemote all title={t('Brand')} value={filter.brand} onValueChange={e => setFilter({...filter,brand:e})} query={`SELECT mrk_kod as _id, mrk_ismi as name FROM STOK_MARKALARI WHERE mrk_kod IN (SELECT DISTINCT sto_marka_kodu FROM STOKLAR WHERE sto_anagrup_kod='${filter.mainGroup}') ORDER BY mrk_ismi`} />}
          {filter.mainGroup && !mainLoading && <TsnSelectRemote all title={t('Rayon')} value={filter.rayon} onValueChange={e => setFilter({...filter,rayon:e})} query={`SELECT ryn_kod as _id, ryn_ismi as name FROM STOK_REYONLARI WHERE ryn_kod IN (SELECT DISTINCT sto_reyon_kodu FROM STOKLAR WHERE sto_anagrup_kod='${filter.mainGroup}')  ORDER BY ryn_ismi`} />}
        </div>)
      }}
      onHeaderPaint={() => <>
        <div className='grid grid-cols-8 w-full'>
          <div className='col-span-2 flex flex-row gap-1'>
            <div>{t('Code')}</div>
            <div>{t('Brand')}</div>
            <div>{t('Category')}</div>
            <div>{t('Rayon')}</div>
          </div>
          <div className='col-span-2 flex flex-row gap-1'>
            <div>{t('Name')}</div>
            <div>{t('Main Group')}</div>
            <div>{t('Sub Group')}</div>
          </div>
          <div className='text-end'>{t('Last Purchase')}</div>
          <div className='text-end'>{t('P.C. Price')}</div>
          <div className='text-end'>{t('Sales Price')}</div>
          <div className='text-end'>{t('Quantity')}</div>
        </div>
      </>}
      onRowPaint={(e: Inventory, rowIndex) => <div className='grid grid-cols-8 w-full'>
        <div className='col-span-2 flex flex-col gap-1 items-start'>
          <div>{e.itemCode}</div>
          <div className='text-[10px] p-[1px] px-[3px] bg-green-800 text-white rounded capitalize '>{e.brand?.toLowerCase()}</div>
          <div className='text-[10px] p-[1px] px-[3px] bg-purple-600 text-white rounded capitalize'>{e.category?.toLowerCase()}</div>
          <div className='text-[10px] p-[1px] px-[3px] bg-amber-800 text-white rounded capitalize'>{e.rayon?.toLowerCase()}</div>
        </div>
        <div className='col-span-2 flex flex-col gap-1 items-start'>
          <div className='capitalize'>{e.itemName?.toLowerCase()}</div>
          <div className='text-[10px] p-[1px] px-[3px] bg-blue-800 text-white rounded capitalize'>{e.mainGroup?.toLowerCase()}</div>
          <div className='text-[10px] p-[1px] px-[3px] bg-slate-500 text-white rounded capitalize'>{e.subGroup?.toLowerCase()}</div>
        </div>

        <div className='text-end'>{moneyFormat(e.lastPurchase)}</div>
        <div className='text-end'>{moneyFormat(e.purchaseConditionPrice)}</div>
        <div className='text-end'>{moneyFormat(e.salesPrice)}</div>
        <div className='text-end'>{e.quantity} {e.unit}</div>
      </div>}
    />
  )
}