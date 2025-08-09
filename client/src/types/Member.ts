import { Organization } from "./Organization"
import { Partner } from "./Partner"

export interface Member {
  _id?: string
  partner?:Partner | null
  organization?:Organization | null
  username?: string
  name?: string
  role?: string
  passive?: boolean
}

export function getRoleList(t:any){
  return [
    {_id:'user',name:t('User')},
    {_id:'owner',name:t('Owner')},
    {_id:'purchase',name:t('Purchase')},
    {_id:'sales',name:t('Sales')},
    {_id:'admin',name:t('Administrator')},
  ]
}


export function getAdminRoleList(t:any){
  return [
    {_id:'sysuser',name:t('Sys User')},
    {_id:'sysadmin',name:t('Sys Admin')},
  ]
}