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
import { OrderHeader, orderListQuery, orderListQueryProps } from '@/types/Order'


export default function PurchaseOrdersPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()
  const [filter,setFilter]=useState<orderListQueryProps>({ioType:1,startDate:startOfLastMonth(),endDate:today()})

  return (
    <TsnGrid
      query={orderListQuery(filter)}
      options={{ showAddNew: true, showEdit: true, showDelete: true, showSearch: true, type: 'Update' }}
      title={t('Purchase Orders')}
      icon=<TruckIcon />
      onFilterPanel={() => {
        return (<div className='flex flex-col gap-1'>
          <TsnInput type='date' title={t('Start Date')} defaultValue={filter.startDate} onBlur={e => setFilter({ ...filter, startDate: e.target.value })} />
          <TsnInput type='date' title={t('End Date')} defaultValue={filter.endDate} onBlur={e => setFilter({ ...filter, endDate: e.target.value })} />
          <TsnSelectRemote all title={t('Warehouse')} itemClassName='capitalize' value={filter.warehouseId} onValueChange={e => setFilter({ ...filter, warehouseId: e })} query={`SELECT dep_no as _id, CAST(dep_no as VARCHAR(10)) + ' - ' + dep_adi as [name], * FROM DEPOLAR WHERE dep_envanter_harici_fl=0 ORDER BY dep_no`} />
          <TsnSelect title={t('Closed?')} all list={[{ _id: '0', name: t('Open')}, { _id: '1', name: t('Closed') }]} value={filter.isClosed} onValueChange={e => setFilter({ ...filter, isClosed: e })} />
        </div>)
      }}
      onHeaderPaint={() => <>
        <div className='grid grid-cols-9 w-full'>
          <div className=''>{t('Date')}/{t('Order No')}</div>
          <div className='col-span-3'>{t('Firm')}</div>
          <div className=''>{t('Warehouse')}</div>
          <div className='text-end'>{t('Quantity')}</div>
          <div className='text-end'>{t('Amount')}/{t('Discounts')}</div>
          <div className='text-end'>{t('VAT')}</div>
          <div className='text-end'>{t('Net Total')}</div>
        </div>
      </>}
      onRowPaint={(e: OrderHeader, colIndex) => <div className='grid grid-cols-9 w-full items-center'>
        <div className='flex flex-col gap-1 items-start'>
          <div>{new Date(e.issueDate || '').toLocaleDateString()}</div>
          <div className='flex gap-1'>
            <div className='text-xs p-[2px] rounded bg-indigo-600 text-white'>{e.orderType}</div>
            <div className='text-xs p-[2px] rounded bg-green-700 text-white'>{e.orderNumber}</div>
          </div>
        </div>
        <div className='col-span-3 flex flex-col gap-1 items-start'>
          <div className='capitalize'>{e.firm?.toLowerCase()}</div>
          <div className=''>{t('Line Count')}: <span className='text-foreground'>{e.lineCount}</span></div>
          
        </div>

        <div>
          <div className='capitalize'>{e.warehouse?.toLowerCase()}</div>
        </div>
        <div className='flex flex-col items-end'>
          <div>{e.quantity! - e.delivered!}</div>
          <div className='text-muted-foreground text-xs'>{e.quantity}-{e.delivered}</div>
        </div>
        <div className='flex flex-col gap-1 items-end'>
          <div className='flex items-center gap-[3px]'>{moneyFormat(e.amount)}<span className='text-xs text-muted-foreground'>{e.currency}</span></div>
          {(e.discountRate1! > 0 || e.discountRate2! > 0 || e.discountRate3! > 0 || e.discountRate4! > 0 || e.discountRate5! > 0 || e.discountRate6! > 0) &&
            <div className='flex flex-col items-center text-[10px] rounded border border-dashed p-[2px] bg-blue-500 bg-opacity-15'>
              <div>{t('Discounts')}</div>
              <div className='text-xs text-muted-foreground'>
                {e.discountRate1! > 0 && <span>%{e.discountRate1} </span>}
                {e.discountRate2! > 0 && <span>%{e.discountRate2} </span>}
                {e.discountRate3! > 0 && <span>%{e.discountRate3} </span>}
                {e.discountRate4! > 0 && <span>%{e.discountRate4} </span>}
                {e.discountRate5! > 0 && <span>%{e.discountRate5} </span>}
                {e.discountRate6! > 0 && <span>%{e.discountRate6} </span>}
              </div>

            </div>
          }
        </div>

        <div className='flex items-center justify-end gap-[3px]'>{moneyFormat(e.vatAmount)}<span className='text-xs text-muted-foreground ms-1'>{e.currency}</span></div>
        <div className='flex items-center justify-end gap-[3px]'>{moneyFormat(e.netTotal)}<span className='text-xs text-muted-foreground ms-1'>{e.currency}</span></div>
      </div>}
    />
  )
}