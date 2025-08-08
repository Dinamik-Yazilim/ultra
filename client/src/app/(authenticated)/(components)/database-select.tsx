"use client"
import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { useLanguage } from '@/i18n'
import { Button } from '@/components/ui/button'
import { DatabaseIcon, DatabaseZapIcon, ListIcon, RefreshCcwDotIcon, Settings2Icon } from 'lucide-react'
import { getItem, postItem } from '@/lib/fetch'
import { Database } from '@/types/Database'
import { useToast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'


export function DatabaseSelect() {
  const [db, setDb] = useState('')
  const [dbList, setDbList] = useState<Database[]>([])
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()
  const { toast } = useToast()
  const router = useRouter()

  const changeDb = (dbId: string) => {
    setLoading(true)
    postItem(`/databases/${dbId}`, token)
      .then(result => {
        console.log('result:', result)
        Cookies.set('db', dbId)
        toast({ title: t('Database changed'), description: `database:${result.db.name}`, variant: 'default', duration: 500 })
        setTimeout(() => location.reload(), 1000)
      })
      .catch(err => toast({ title: err, variant: 'destructive', duration: 1500 }))
      .finally(() => setLoading(false))
  }

  const load = () => {
    setLoading(true)
    getItem(`/databases`, token)
      .then(result => {
        setDbList(result as Database[])
        Cookies.set('dbList', JSON.stringify(result))
      })
      .catch(err => toast({ title: t('Error'), description: t(err || ''), variant: 'destructive', duration: 1500 }))
      .finally(() => setLoading(false))
  }

  const loadFromCookies = () => {
    try {
      setLoading(true)
      if (Cookies.get('dbList')) {
        setDbList(JSON.parse(Cookies.get('dbList') || '[]'))
        setDb(Cookies.get('db') || '')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { !token && setToken(Cookies.get('token') || '') }, [])
  useEffect(() => { token && loadFromCookies() }, [token])

  return (
    <>

      {!loading &&
        <div className='flex gap-2'>
          <Select
            value={db}
            onValueChange={e => {
              changeDb(e)
            }}
          >
            <SelectTrigger className={`w-[180px] px-1 border-0`}>
              <SelectValue placeholder={'[' + t('Select Database') + ']'} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {dbList.map((e, index) =>
                  <SelectItem key={'database' + index} value={e.db || ''}>
                    <div className={`flex gap-2 items-center uppercase ${db == e.db ? 'text-[#1e40af] dark:text-[#eab308] font-bold' : ''}`}>
                      {db == e.db && <DatabaseZapIcon />}
                      {db != e.db && <DatabaseIcon />}
                      {e.dbName}
                    </div>

                  </SelectItem>)
                }
              </SelectGroup>
              <SelectGroup>
              <Button onClick={load} variant={'outline'} className="flex gap-2" ><RefreshCcwDotIcon /> {t('Reload Databases')}</Button>
              </SelectGroup>
            </SelectContent>
          </Select>
          
        </div>
      }
      {loading && <Skeleton className='w-[180px]  h-11' />}
    </>
  )
}