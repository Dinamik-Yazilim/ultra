"use client"


import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from '@/i18n'
import { Member } from "@/types/Member"
// import { authSignOut } from '@/lib/authHelper'
import Cookies from 'js-cookie'
// import { cookies } from 'next/headers'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"
import { description } from "../home/dashboard/rapor1"



export function SignOutButton() {
  const router = useRouter()
  const { t } = useLanguage()
  const [user, setUser] = useState<Member>()
  const {toast}=useToast()
  useEffect(() => {
    try {
      if (!user) {
        setUser(JSON.parse(Cookies.get('user') || '{}') as Member)
      }
    } catch { }
  }, [])

  return (<>
    {user &&
      <Button variant={'outline'}
        onClick={() => {
          if (!user.role?.startsWith('sys') || user.role?.startsWith('sys') && !user.organization) {
            if (confirm(t('Do you want to exit?'))) {
              Cookies.remove('token')
              Cookies.remove('user')
              Cookies.remove('db')
              Cookies.remove('dbList')
              setTimeout(() => {
                location.href='/auth/login'
              }, 300)
            }
          } else {
            let u = user
            u.organization = null
            Cookies.set('user',JSON.stringify(u))
            toast({title:t(`Logging out from organization`),description:user?.organization?.name?.toUpperCase(), duration:1000})
            setTimeout(() => {
              location.href='/admin/organizations'
            }, 1100)
          }
        }}
      >
        <i className='fa-solid fa-power-off'></i>
      </Button>
    }
  </>
  )
}


