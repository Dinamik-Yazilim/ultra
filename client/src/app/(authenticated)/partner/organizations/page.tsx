"use client"

import { useEffect, useState } from 'react'
import { getItem, getList, postItem, putItem } from '@/lib/fetch'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { Settings } from '@/types/Settings'
import { useToast } from '@/components/ui/use-toast'
import { TsnSelect } from '@/components/ui216/tsn-select'
import { useLanguage } from '@/i18n'
import { StandartForm } from '@/components/ui216/standart-form'
import { TsnInput } from '@/components/ui216/tsn-input'
import { Label } from '@/components/ui/label'
import { TsnPanel } from '@/components/ui216/tsn-panel'
import { Organization } from '@/types/Organization'
import { ListGrid } from '@/components/ui216/list-grid'
import { Building2Icon, Plug2Icon } from 'lucide-react'
import { ButtonConfirm } from '@/components/button-confirm'
import { Member } from '@/types/Member'
interface Props {
}
export default function SettingsPage({ }: Props) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [token, setToken] = useState('')
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()
  const [user, setUser] = useState<Member>()

  const load = () => {
    try {
      if (Cookies.get('user')) {
        setUser(JSON.parse(Cookies.get('user') || '{}') as Member)
      }
    } catch { }
    setLoading(true)
    getList(`/admin/organizations`, token)
      .then(result => {
        setOrganizations(result.docs as Organization[])
      })
      .catch(err => toast({ title: 'Error', description: err || '', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }

  const connectOrg = (orgId?: string) => {
    postItem(`/admin/organizations/connect/${orgId}`, token)
      .then((org: Organization) => {
        let u = user
        if (u) {
          u.organization = org
          Cookies.set('user', JSON.stringify(u))
          getItem(`/databases`, token)
            .then(result => Cookies.set('dbList', JSON.stringify(result)))
            .catch(err => toast({ title: t('Error'), description: t(err || ''), variant: 'destructive', duration: 1500 }))
            .finally(() => router.push('/'))
        }
        toast({ title: t(`Organization connected`), description: org.name?.toUpperCase(), duration: 1000 })
        setTimeout(() => location.href = '/', 1100)
      })
      .catch(err => toast({ title: 'Error', description: err || '', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }
  useEffect(() => { !token && setToken(Cookies.get('token') || '') }, [])
  useEffect(() => { token && load() }, [token])

  return (
    <ListGrid
      apiPath='/admin/organizations'

      title={t('Organizations')}
      icon=<Building2Icon />
      onHeaderPaint={() => <div className='grid  grid-cols-5 w-full'>
        <div className='col-span-4 lg:col-span-1'>{t('Name')}</div>
        <div className='hidden lg:flex'>{t('Location')}</div>
        <div className='hidden lg:flex'>{t('Start')}</div>
        <div className='hidden lg:flex'>{t('End')}</div>
        <div className='text-center'>{t('Passive?')}</div>
      </div>}
      onRowPaint={(e: Organization, colIndex) => <div className='grid grid-cols-5 gap-3 w-full'>
        <div className='col-span-4 lg:col-span-1'>
          <ButtonConfirm
            className='w-full'
            onOk={() => connectOrg(e._id)}
            title={t('Do you want to connect to organization?')}
            description={<>{e.name}</>}
          >
            <div className='flex gap-2 w-full px-2 py-2 rounded-md bg-green-800 text-white hover:bg-green-500 hover:text-white'>
              <Plug2Icon size={'16px'} />
              {e.name}
            </div>
          </ButtonConfirm>


        </div>
        <div className='hidden lg:flex'>{e.location}</div>
        <div className='hidden lg:flex'>{e.startDate}</div>
        <div className='hidden lg:flex'>{e.endDate}</div>
        <div className='text-center'>{e.passive ? '✅' : ''}</div>
      </div>}
    />
  )
}