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
import { ListGrid } from '@/components/ui216/list-grid'
import { Building2Icon, HandshakeIcon, Plug2Icon } from 'lucide-react'
import { ButtonConfirm } from '@/components/button-confirm'
import { Member } from '@/types/Member'
import { Partner } from '@/types/Partner'
interface Props {
}
export default function SettingsPage({ }: Props) {
  const [partners, setPartners] = useState<Partner[]>([])
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
    getList(`/admin/partners`, token)
      .then(result => {
        setPartners(result.docs as Partner[])
      })
      .catch(err => toast({ title: 'Error', description: err || '', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }

  const connectAsPartner = (partnerId?: string) => {
    postItem(`/admin/partner/connect/${partnerId}`, token)
      .then((p: Partner) => {
        let u = user
        if (u) {
          u.partner = p
          Cookies.set('user', JSON.stringify(u))
          router.push('/')
        }
        toast({ title: t(`Partner connected`), description: p.name?.toUpperCase(), duration: 1000 })
        setTimeout(() => location.href = '/', 1100)
      })
      .catch(err => toast({ title: 'Error', description: err || '', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }
  useEffect(() => { !token && setToken(Cookies.get('token') || '') }, [])
  useEffect(() => { token && load() }, [token])

  return (
    <ListGrid
      apiPath='/admin/partners'

      title={t('Partners')}
      icon=<HandshakeIcon />
      onHeaderPaint={() => <div className='grid  grid-cols-5 w-full'>
        <div className='col-span-4 lg:col-span-3'>{t('Name')}</div>
        <div className='hidden lg:flex'>{t('Location')}</div>
        <div className='text-center'>{t('Passive?')}</div>
      </div>}
      onRowPaint={(e: Partner, colIndex) => <div className='grid grid-cols-5 gap-3 w-full'>
        <div className='col-span-4 lg:col-span-3'>
          <ButtonConfirm
            className='w-full'
            onOk={() => connectAsPartner(e._id)}
            title={t('Do you want to connect to the partner?')}
            description={<>{e.name}</>}
          >
            <div className='flex gap-2 w-full px-2 py-2 rounded-md bg-green-800 text-white hover:bg-green-500 hover:text-white'>
              <Plug2Icon size={'16px'} />
              {e.name}
            </div>
          </ButtonConfirm>


        </div>
        <div className='hidden lg:flex'>{e.location}</div>
        <div className='text-center'>{e.passive ? '✅' : ''}</div>
      </div>}
    />
  )
}