"use client"

import { useToast } from "@/components/ui/use-toast"
import { StandartForm } from "@/components/ui216/standart-form"
import { useLanguage } from "@/i18n"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Cookies from 'js-cookie'
import { getItem, postItem, putItem } from "@/lib/fetch"
import { TsnInput } from "@/components/ui216/tsn-input"
import { TsnSwitch } from "@/components/ui216/tsn-switch"
import { TsnPanel } from "@/components/ui216/tsn-panel"
import { TsnSelect } from "@/components/ui216/tsn-select"
import { Organization } from "@/types/Organization"

interface Props {
  params: { id: string }
}

export default function EditPage({ params }: Props) {
  const [token, setToken] = useState('')
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()
  const [organization, setOrganization] = useState<Organization>({
    startDate:new Date().toISOString().substring(0,10),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear()+2)).toISOString().substring(0,10)
  })

  const load = () => {
    setLoading(true)
    getItem(`/admin/organizations/${params.id}`, token)
      .then(result => {
        console.log(result)
        setOrganization(result as Organization)
      })
      .catch(err => toast({ title: t('Error'), description: t(err || ''), variant: 'destructive' }))
      .finally(() => setLoading(false))
  }

  const save=()=>{
    if(!organization?._id){
      postItem(`/admin/organizations`,token,organization)
      .then(result=>router.back())
      .catch(err => toast({ title: t('Error'), description: t(err || ''), variant: 'destructive' }))
    }else{
      putItem(`/admin/organizations/${organization?._id}`,token,organization)
      .then(result=>router.back())
      .catch(err => toast({ title: t('Error'), description: t(err || ''), variant: 'destructive' }))
    }
  }
  useEffect(() => { !token && setToken(Cookies.get('token') || '') }, [])
  useEffect(() => { token && params.id != 'addnew' && load() }, [token])

  return (<StandartForm
    title={params.id == 'addnew' ? t('New Organization') : t('Edit Organization')}
    onSaveClick={save}
    onCancelClick={()=>router.back()}
    loading={loading}
  >
    <TsnInput title={t('Name')} defaultValue={organization?.name} onBlur={e => setOrganization({ ...organization, name: e.target.value })} />
    <TsnInput title={t('Location')} defaultValue={organization?.location} onBlur={e => setOrganization({ ...organization, location: e.target.value })} />
    <TsnInput type='date' readOnly title={t('Start Date')} defaultValue={organization?.startDate}  />
    <TsnInput type='date' title={t('End Date')} defaultValue={organization?.endDate} onBlur={e => setOrganization({ ...organization, endDate: e.target.value })} />
    <TsnSwitch title={t('Passive?')} defaultChecked={organization?.passive} onCheckedChange={e=>setOrganization({...organization,passive:e})} />
    
  </StandartForm>)
}
