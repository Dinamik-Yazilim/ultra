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

import { postItem } from "@/lib/fetch"
import { useToast } from "@/components/ui/use-toast"
import Cookies from "js-cookie"
import { Input } from "@/components/ui/input"
import React from "react"
import { TsnDialogSelectButton } from "@/components/ui216/tsn-dialog-selectbutton"
import { Responsibility, responsibilityListQuery } from "@/types/Responsibility"
import { Skeleton } from "@/components/ui/skeleton"
import { ButtonSelect } from "@/components/icon-buttons"
import { Label } from "@/components/ui/label"

interface Props {
  t: (text: string) => string
  children?: React.ReactNode | any
  onSelect?: (e: Responsibility) => void
}
export function SelectResponsibility({ t, children, onSelect }: Props) {
  const [search, setSearch] = useState('')
  const [token, setToken] = useState('')
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<Responsibility[]>([])
  const load = (s?: string) => {
    setLoading(true)
    postItem(`/mikro/get`, token, { query: responsibilityListQuery({ search: s }) })
      .then(result => {
        setList(result as Responsibility[])
      })
      .catch(err => toast({ title: 'Error', description: err || '', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }
  useEffect(() => { !token && setToken(Cookies.get('token') || '') }, [])
  // useEffect(() => { token && load('') }, [token])

  return (
    <AlertDialog onOpenChange={e => e && load(search)} >
      <AlertDialogTrigger>{children}</AlertDialogTrigger>
      <AlertDialogContent className=" px-3 py-1 lg:max-w-[900px]">
        <AlertDialogHeader className="p-0 m-0 ">
          <AlertDialogTitle className="p-0">
            <div className="flex justify-between">
              <span>{t('Select responsibility')}</span>
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
                e.target.value == "" && load('')
              }}
              onKeyDown={e => e.code == 'Enter' && load(search)}
            />
          </div>

          <div className='grid grid-cols-1 w-full text-xs lg:text-sm border-b my-2 ps-2 pe-5'>
            <div className=''>{t('Responsibility')}</div>
          </div>
          <div className="w-fu11ll overflow-y-auto h-[450px] ps-2 pe-2 lg:pe-4">
            {!loading && list && list.map((e: Responsibility, rowIndex) => <TsnDialogSelectButton key={'gridList-' + rowIndex}
              onClick={(event: any) => onSelect && onSelect(e)}
              className={`flex-none p-0 border-none grid grid-cols-1 space-y-2 gap-1 w-full hover:bg-amber-500 hover:bg-opacity-15 cursor-pointer ${rowIndex % 2 == 1 ? 'bg-slate-500 bg-opacity-15' : ''} `}>
              <div className='flex flex-col gap-[2px] items-start text-xs lg:text-base capitalize'>
                {e.name?.toLowerCase()}
              </div>

            </TsnDialogSelectButton>)}
            {loading && Array.from(Array(12).keys()).map(e => (
              <div key={e} className='flex h-6 my-2'>
                <div className='grid grid-cols-1 w-full h-full gap-1'>
                  <Skeleton className="bg-slate-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </AlertDialogContent>
    </AlertDialog>
  )
}

interface WithLabelProps extends Props {
  className?: string
  caption?: React.ReactNode | any
}
export function SelectResponsibilityWithLabel({ t, children, onSelect, className, caption }: WithLabelProps) {
  return (
    <div className={`w-full flex justify-between p-2 pe-4 items-start  border rounded-md border-dashed ${className}`}>
      <div className="flex flex-col gap-1">
        <Label className="text-muted-foreground">{t('Responsibility')}</Label>
        <div className="capitalize">{caption}</div>
      </div>
      <SelectResponsibility t={t} onSelect={onSelect} ><ButtonSelect /></SelectResponsibility>
    </div>
  )
}