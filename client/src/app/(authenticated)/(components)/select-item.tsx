import { useEffect, useState } from "react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { TsnSelectRemote } from "@/components/ui216/tsn-select-remote"
import { postItem } from "@/lib/fetch"
import { useToast } from "@/components/ui/use-toast"
import { Item, itemListQuery } from "@/types/Item"
import Cookies from "js-cookie"
import { Input } from "@/components/ui/input"
import { cn, moneyFormat } from "@/lib/utils"
import { TsnPanel } from "@/components/ui216/tsn-panel"
import React from "react"
import { TsnDialogSelectButton } from "@/components/ui216/tsn-dialog-selectbutton"
import { Skeleton } from "@/components/ui/skeleton"

interface ItemSelectProps {
  t: (text: string) => string
  children?: React.ReactNode | any
  onSelect?: (e: Item) => void
}
export function SelectItem({ t, children, onSelect }: ItemSelectProps) {
  const [filter, setFilter] = useState<any>({ mainGroup: '', subGroup: '', category: '', brand: '', rayon: '' })
  const [search, setSearch] = useState('')
  const [mainLoading, setMainLoading] = useState(false)
  const [token, setToken] = useState('')
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<Item[]>([])
  const load = (s?: string, f?: any) => {
    setLoading(true)
    postItem(`/mikro/get`, token, { query: itemListQuery({ ...filter, search: s }) })
      .then(result => {
        setList(result as Item[])
      })
      .catch(err => toast({ title: 'Error', description: err || '', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }
  useEffect(() => { !token && setToken(Cookies.get('token') || '') }, [])
  // useEffect(() => { token && load('', filter) }, [token])
  useEffect(() => { token && load(search, filter) }, [filter])

  return (
    <AlertDialog onOpenChange={e => e && load(search)} >
      <AlertDialogTrigger>{children}</AlertDialogTrigger>
      <AlertDialogContent className=" px-3 py-1 lg:max-w-[900px]">
        <AlertDialogHeader className="p-0 m-0">
          <AlertDialogTitle className="p-0">
            <div className="flex justify-between">
              <span>{t('Select item')}</span>
              <AlertDialogCancel>X</AlertDialogCancel>
            </div>
          </AlertDialogTitle>
          <AlertDialogDescription></AlertDialogDescription>
        </AlertDialogHeader>
        <div className="overflow-y-auto h-[600px]">
          <div className="relative w-full pe-4">
            <div className='absolute left-1.5 top-1.5 text-xl'>🔍</div>
            <Input
              type='search'
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              placeholder={t('search...')}
              defaultValue={search}
              onChange={e => {
                setSearch(e.target.value)
                e.target.value == "" && load('', filter)
              }}
              onKeyDown={e => e.code == 'Enter' && load(search, filter)}
            />
          </div>
          <TsnPanel name="itemSelect_filter" trigger={<>{t('Group')}/{t('Category')}/{t('Brand')}/{t('Rayon')} </>} defaultOpen={false} className="pe-4">
            <TsnSelectRemote all title={t('Main Group')} value={filter.mainGroup}
              onValueChange={e => {
                setMainLoading(true)
                setFilter({ ...filter, mainGroup: e, subGroup: '', category: '', brand: '', rayon: '' })
                setTimeout(() => setMainLoading(false), 500)
              }}
              query={`SELECT san_kod as _id, san_isim as name FROM STOK_ANA_GRUPLARI ORDER BY san_isim`}
            />
            {filter.mainGroup && !mainLoading && <TsnSelectRemote all title={t('Sub Group')} value={filter.subGroup} onValueChange={e => setFilter({ ...filter, subGroup: e })} query={`SELECT sta_kod as _id, sta_isim as name FROM STOK_ALT_GRUPLARI WHERE sta_ana_grup_kod='${filter.mainGroup}' ORDER BY sta_isim`} />}
            {filter.mainGroup && !mainLoading && <TsnSelectRemote all title={t('Category')} value={filter.category} onValueChange={e => setFilter({ ...filter, category: e })} query={`SELECT ktg_kod as _id, ktg_isim as name FROM STOK_KATEGORILERI WHERE ktg_kod IN (SELECT DISTINCT sto_kategori_kodu FROM STOKLAR WHERE sto_anagrup_kod='${filter.mainGroup}') ORDER BY ktg_isim`} />}
            {filter.mainGroup && !mainLoading && <TsnSelectRemote all title={t('Brand')} value={filter.brand} onValueChange={e => setFilter({ ...filter, brand: e })} query={`SELECT mrk_kod as _id, mrk_ismi as name FROM STOK_MARKALARI WHERE mrk_kod IN (SELECT DISTINCT sto_marka_kodu FROM STOKLAR WHERE sto_anagrup_kod='${filter.mainGroup}') ORDER BY mrk_ismi`} />}
            {filter.mainGroup && !mainLoading && <TsnSelectRemote all title={t('Rayon')} value={filter.rayon} onValueChange={e => setFilter({ ...filter, rayon: e })} query={`SELECT ryn_kod as _id, ryn_ismi as name FROM STOK_REYONLARI WHERE ryn_kod IN (SELECT DISTINCT sto_reyon_kodu FROM STOKLAR WHERE sto_anagrup_kod='${filter.mainGroup}')  ORDER BY ryn_ismi`} />}
          </TsnPanel>
          <div className='grid grid-cols-6 w-full text-xs lg:text-sm border-b mb-2 ps-2 pe-5'>
            <div className='col-span-3 flex flex-row gap-1'>{t('Item')}</div>
            <div className='col-span-2 flex flex-row gap-1'>{t('Group')}</div>
            <div className='text-end'>{t('Price')}</div>
          </div>
          <div className="w-fu11ll overflow-y-auto h-[450px] ps-2 pe-2 lg:pe-4">
            {!loading && list && list.map((e: Item, rowIndex) => <TsnDialogSelectButton key={'gridList-' + rowIndex}
              onClick={(event: any) => onSelect && onSelect(e)}
              className={`flex-none p-0 border-none grid grid-cols-6 gap-1 w-full hover:bg-amber-500 hover:bg-opacity-15 cursor-pointer ${rowIndex % 2 == 1 ? 'bg-slate-500 bg-opacity-15' : ''} `}>
              <div className='col-span-3 flex flex-col gap-[2px] items-start text-xs lg:text-sm'>
                <div className='capitalize text-start'>{e.name?.toLowerCase()}</div>
                <div className='text-[80%] p-[1px] px-[3px] bg-green-800 text-white rounded capitalize truncate max-w-28 lg:max-w-48'>{e.brand?.toLowerCase()}</div>
                <div className='text-[80%] p-[1px] px-[3px] bg-amber-800 text-white rounded capitalize truncate max-w-28 lg:max-w-48'>{e.rayon?.toLowerCase()}</div>
              </div>
              <div className='col-span-2 flex flex-col gap-[2px] items-start text-xs lg:text-sm'>
                <div className='text-[80%] p-[1px] px-[3px] bg-purple-600 text-white rounded capitalize truncate max-w-28 lg:max-w-48'>{e.category?.toLowerCase()}</div>
                <div className='text-[80%] p-[1px] px-[3px] bg-blue-800 text-white rounded capitalize  truncate max-w-28 lg:max-w-48'>{e.mainGroup?.toLowerCase()}</div>
                <div className='text-[80%] p-[1px] px-[3px] bg-slate-500 text-white rounded capitalize  truncate max-w-28 lg:max-w-48'>{e.subGroup?.toLowerCase()}</div>
              </div>
              <div className="flex flex-col text-xs w-20 lg:text-sm lg:w-auto">
                <div className='flex justify-between'>
                  <div className="text-muted-foreground text-[70%]">SonA.</div>
                  <div className="text-end">{moneyFormat(e.lastPurchase)}</div>
                </div>
                <div className='flex justify-between'>
                  <div className="text-muted-foreground text-[70%]">SŞart</div>
                  <div className="text-end ">{moneyFormat(e.purchaseConditionPrice)}</div>
                </div>
                <div className='flex justify-between'>
                  <div className="text-muted-foreground  text-[70%]">Satış</div>
                  <div className="text-end">{moneyFormat(e.salesPrice)}</div>
                </div>
              </div>
            </TsnDialogSelectButton>)}
            {loading && Array.from(Array(8).keys()).map(e => (
              <div key={e} className='flex mb-4 h-10'>
                <div className='grid grid-cols-6 w-full h-full gap-4'>
                  <Skeleton className="col-span-3 h-6 bg-amber-600" />
                  <Skeleton className="col-span-2 h-6 bg-blue-600" />
                  <Skeleton className="col-span-1 h-6 bg-slate-600" />
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter> */}
      </AlertDialogContent>
    </AlertDialog>
  )
}