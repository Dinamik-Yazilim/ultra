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
// import { TsnInputAddress } from '@/components/ui216/tsn-input-address'
import { PackageCheckIcon, TruckIcon, Users2Icon } from 'lucide-react'
import { getRoleList, Member } from '@/types/Member'
import { ListGrid } from '@/components/ui216/list-grid'
import { TsnGrid } from '@/components/ui216/tsn-grid'
import { moneyFormat, startOfLastMonth, today } from '@/lib/utils'
import { TsnSelectRemote } from '@/components/ui216/tsn-select-remote'
import { PurchaseConditionHeader, purchaseConditionListQuery, PurchaseConditionListQueryProps } from '@/types/PurchaseConditions'
// import { OrderHeader, orderListQuery, orderListQueryProps } from '@/types/Order'


export default function PurchaseConditionsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()
  const [filter, setFilter] = useState<PurchaseConditionListQueryProps>({ startDate: startOfLastMonth(), endDate: today() })

  return (
    <TsnGrid
      query={purchaseConditionListQuery(filter)}
      options={{ showAddNew: true, showEdit: true, showDelete: true, showSearch: true, type: 'Update' }}
      title={t('Purchase Conditions')}
      icon=<TruckIcon />
      onFilterPanel={() => {
        return (<div className='flex flex-col gap-1'>
          <TsnInput type='date' title={t('Start Date')} defaultValue={filter.startDate} onBlur={e => setFilter({ ...filter, startDate: e.target.value })} />
          <TsnInput type='date' title={t('End Date')} defaultValue={filter.endDate} onBlur={e => setFilter({ ...filter, endDate: e.target.value })} />
          <TsnSelectRemote all title={t('Warehouse')} itemClassName='capitalize' value={filter.warehouseId} onValueChange={e => setFilter({ ...filter, warehouseId: e })} query={`SELECT dep_no as _id, CAST(dep_no as VARCHAR(10)) + ' - ' + dep_adi as [name], * FROM DEPOLAR WHERE dep_envanter_harici_fl=0 ORDER BY dep_no`} />
          {/* <TsnSelect title={t('Closed?')} all list={[{ _id: '0', name: t('Open')}, { _id: '1', name: t('Closed') }]} value={filter.isClosed} onValueChange={e => setFilter({ ...filter, isClosed: e })} /> */}
        </div>)
      }}
      onHeaderPaint={() => <>
        <div className='grid grid-cols-9 w-full gap-2'>
          <div className=''>{t('Date')}/{t('Order No')}</div>
          <div className=''>{t('Start')}/{t('End')}</div>
          <div className='col-span-3'>{t('Firm')}</div>
          <div className='text-end me-2'>{t('Amount')}</div>
          <div className='text-end me-3'>{t('Line Count')}</div>
          <div className=''>{t('Warehouse')}</div>
        </div>
      </>}
      onRowPaint={(e: PurchaseConditionHeader, colIndex) =>
        <div className='grid grid-cols-9 w-full items-center gap-2'>
          <div className='flex flex-col gap-1 items-start'>
            <div>{new Date(e.issueDate || '').toLocaleDateString()}</div>
            <div className='text-xs py-[2px] px-[5px] rounded bg-indigo-700 text-white'>{e.docNoSerial?e.docNoSerial + '-':''}{e.docNoSequence}</div>

          </div>
          <div className='flex flex-col gap-1 items-start'>
            <div>{new Date(e.startDate || '').toLocaleDateString()}</div>
            {(e.endDate|| '') >'1900-01-01' && <div>{new Date(e.endDate || '').toLocaleDateString()}</div>}
            {(e.endDate|| '') <'1900-01-01' && <div>-</div>}
          </div>
          <div className='col-span-3 flex flex-col gap-1 items-start'>
            <div className='capitalize'>{e.firm?.toLowerCase()}</div>

          </div>
          <div className='flex flex-col items-end'>
            {moneyFormat(e.amount)}
          </div>
          <div className='flex flex-col items-end'>
            {e.lineCount}
          </div>
          <div className='ms-4'>
            {e.warehouse  && <div className='capitalize'>{e.warehouse?.toLowerCase()}</div>}
            {!e.warehouse && <div>{t('General')}</div>}
          </div>

        </div>
      }
    />
  )
}
