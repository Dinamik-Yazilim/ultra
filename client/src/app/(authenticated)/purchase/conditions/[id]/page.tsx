"use client"

import { useToast } from "@/components/ui/use-toast"
import { StandartForm } from "@/components/ui216/standart-form"
import { useLanguage } from "@/i18n"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Cookies from 'js-cookie'
import { postItem, putItem } from "@/lib/fetch"
import { TsnInput } from "@/components/ui216/tsn-input"
import { TsnPanel } from "@/components/ui216/tsn-panel"
import { moneyFormat, oneYearLater, today } from "@/lib/utils"
import { TsnGridButtonDelete } from "@/components/ui216/tsn-grid"
import { PurchaseConditionDetail, purchaseConditionHeaderQuery, purchaseConditionDetailQuery, savePurchaseCondition } from "@/types/PurchaseConditions"
import { ChefHatIcon, EditIcon, PlusSquareIcon } from "lucide-react"

import { TsnLineGrid } from "@/components/ui216/tsn-line-grid"
import { SelectFirm } from "@/app/(authenticated)/(components)/select-firm"
import { ButtonSelect } from "@/components/icon-buttons"
import { Label } from "@/components/ui/label"
import { SelectWarehouse } from "@/app/(authenticated)/(components)/select-warehouse"
import { SelectResponsibility } from "@/app/(authenticated)/(components)/select-responsibility"
import { SelectPaymentPlan } from "@/app/(authenticated)/(components)/select-paymentPlan"
import { SelectProject } from "@/app/(authenticated)/(components)/select-project"
import { SelectSalesperson } from "@/app/(authenticated)/(components)/select-salesperson"
import { PurchaseConditionHeader } from "@/types/PurchaseConditions"
import { SelectItem } from "@/app/(authenticated)/(components)/select-item"
import { TsnSelect } from "@/components/ui216/tsn-select"
import { Input } from "@/components/ui/input"
import { LineItem } from "./line-item"
import { TsnSwitch } from "@/components/ui216/tsn-switch"
import { Button } from "@/components/ui/button"

interface Props {
  params: { id: string }
}


export default function PurchaseConditionPage({ params }: Props) {
  const ioType = 1
  const [token, setToken] = useState('')

  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()
  const [pcHeader, setPCHeader] = useState<PurchaseConditionHeader>({
    issueDate: today(),
    documentDate: today(),
    startDate: today(),
    endDate: oneYearLater(),
    docNoSequence: 0
  })
  const [pcDetails, setPCDetails] = useState<PurchaseConditionDetail[]>([])
  const [showLineDetails, setShowLineDetails] = useState(false)

  const load = () => {
    setLoading(true)
    postItem(`/mikro/get`, token, { query: purchaseConditionHeaderQuery(params.id) })
      .then(result => {
        let h=result[0] as PurchaseConditionHeader
        if((h.endDate || '')<'1900-01-01') h.endDate=''
        setPCHeader(h)
        postItem(`/mikro/get`, token, { query: purchaseConditionDetailQuery(params.id) })
          .then(result => {
            setPCDetails(result as PurchaseConditionDetail[])
          })
          .catch(err => toast({ title: t('Error'), description: t(err || ''), variant: 'destructive' }))
          .finally(() => setLoading(false))
      })
      .catch(err => {
        toast({ title: t('Error'), description: t(err || ''), variant: 'destructive' })
        setLoading(false)
      })
  }


  const save = () => {
    savePurchaseCondition(token, pcHeader, pcDetails)
      .then(() => {
        toast({ title: `🙂 ${t('Success')}`, description: t('Document has been saved successfuly'), duration: 800 })
        setTimeout(() => router.back(), 1000)
      })
      .catch(err => toast({ title: t('Error'), description: t(err || ''), variant: 'destructive' }))
  }




  const FormHeader = () => {
    return (<TsnPanel name="pcondition_Header" defaultOpen={true} className="mt-4" trigger={t('Header')} contentClassName="flex flex-col gap-2 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-5 w-full items-center gap-2">
        <TsnInput title={t('Document Serial')} defaultValue={pcHeader.docNoSerial}
          onBlur={e => setPCHeader({ ...pcHeader, docNoSerial: e.target.value })}
          disabled={params.id != 'addnew'}
        />
        <TsnInput type='number' min={0} title={t('Document Sequence')} defaultValue={pcHeader.docNoSequence}
          disabled
        />
        <TsnInput type='date' title={t('Date')} defaultValue={pcHeader.issueDate?.substring(0, 10)}
          onBlur={e => setPCHeader({ ...pcHeader, issueDate: e.target.value })} />
        <TsnInput title={t('Document Number')} defaultValue={pcHeader.documentNumber}
          onBlur={e => setPCHeader({ ...pcHeader, documentNumber: e.target.value })} />
        <TsnInput type='date' title={t('Document Date')} defaultValue={pcHeader.issueDate?.substring(0, 10)}
          onBlur={e => setPCHeader({ ...pcHeader, documentDate: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        <div className="col-span-1 lg:col-span-4 w-full p-2 pe-4 flex items-start justify-between  border rounded-md border-dashed">
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">{t('Firm')}</Label>
            <div className="capitalize">{pcHeader.firm?.toLowerCase()}</div>
          </div>
          <SelectFirm t={t} onSelect={e => {
            setPCHeader({ ...pcHeader, firmId: e._id, firm: e.name })
          }} ><ButtonSelect /></SelectFirm>

        </div>
        <div className="col-span-1 lg:col-span-2 w-full flex justify-between p-2 pe-4 items-start  border rounded-md border-dashed">
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">{t('Warehouse')}</Label>
            <div className="capitalize">{pcHeader.warehouse}</div>
          </div>
          <SelectWarehouse t={t} onSelect={e => {
            setPCHeader({ ...pcHeader, warehouseId: e._id, warehouse: e.name })
          }} ><ButtonSelect /></SelectWarehouse>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 justify-between gap-2">
        <div className="w-full flex justify-between p-2 pe-4 items-start  border rounded-md border-dashed">
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">{t('Payment Plan')}</Label>
            <div className="capitalize">{pcHeader.paymentPlan}</div>
          </div>
          <SelectPaymentPlan t={t} onSelect={e => { setPCHeader({ ...pcHeader, paymentPlanId: e._id, paymentPlan: e.name }) }} ><ButtonSelect /></SelectPaymentPlan>

        </div>
        <div className="w-full flex justify-between p-2 pe-4 items-start  border rounded-md border-dashed">
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">{t('Project')}</Label>
            <div className="capitalize">{pcHeader.project}</div>
          </div>
          <SelectProject t={t} onSelect={e => { setPCHeader({ ...pcHeader, projectId: e._id, project: e.name }) }} ><ButtonSelect /></SelectProject>

        </div>
        <div className="w-full flex justify-between p-2 pe-4 items-start  border rounded-md border-dashed">
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">{t('Responsibility')}</Label>
            <div className="capitalize">{pcHeader.responsibility}</div>
          </div>
          <SelectResponsibility t={t} onSelect={e => { setPCHeader({ ...pcHeader, responsibilityId: e._id, responsibility: e.name }) }} ><ButtonSelect /></SelectResponsibility>

        </div>
        <div className="w-full flex justify-between p-2 pe-4 items-start  border rounded-md border-dashed">
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">{t('Purchase person')}</Label>
            <div className="capitalize">{pcHeader.salesperson}</div>
          </div>
          <SelectSalesperson t={t} onSelect={e => { setPCHeader({ ...pcHeader, salespersonId: e._id, salesperson: e.name }) }} ><ButtonSelect /></SelectSalesperson>

        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 w-full items-center gap-2">
       
        <TsnInput type='date' title={t('Start Date')} defaultValue={pcHeader.startDate?.substring(0, 10)}
          onBlur={e => setPCHeader({ ...pcHeader, startDate: e.target.value })} />
        <TsnInput type='date' title={t('End Date')} defaultValue={pcHeader.endDate?.substring(0, 10)}
          onBlur={e => setPCHeader({ ...pcHeader, endDate: e.target.value })} />
      </div>
    </TsnPanel>)
  }


  const FormDetail = () => {

    return (<TsnPanel
      collapsible={false}
      name="pcondition_Detail" defaultOpen={true} className="mt-4"
      trigger={<div className="flex justify-between items-center w-full me-4">
        <div>{t('Lines')}</div>
        <div>
          <TsnSwitch title={t('Detailed')} defaultChecked={showLineDetails}
            onCheckedChange={e => {
              localStorage && localStorage.setItem('showDetail_purchaseCondition_line', e.toString())
              setShowLineDetails(e)
            }}
          />
        </div>
      </div>}
      contentClassName="relative grid grid-cols-1gap-2 w-full"
    >
      <TsnLineGrid
        list={pcDetails}
        onHeaderPaint={() =>
          <div className="flex  w-full gap-2">
            <div className="text-xs text-nowrap mt-2 text-muted-foreground">#</div>
            <div className="grid grid-cols-3 w-full items-center">
              <div className="">{t('Item')}</div>
              <div className="col-span-2 grid grid-cols-6 gap-2 w-full items-center">
                <div className="text-end">{t('Gross Price')}</div>
                <div className="text-end">{t('%Dis.1')}</div>
                <div className="text-end">{t('%Dis.2')}</div>
                <div className="text-end">{t('%Dis.3')}</div>
                <div className="text-end">{t('Profit')}</div>
                <div className="text-end">{t('Net Price')}</div>
              </div>
            </div>
            <div className='w-20 p-1 flex justify-end lg:justify-end'>
            </div>
          </div>
        }
        onRowPaint={(line: PurchaseConditionDetail, rowIndex) => <>
          {!line.deleted &&
            <LineItem line={line} rowIndex={rowIndex} t={t} pcDetails={pcDetails} setPCDetails={setPCDetails} showDetail={showLineDetails} />
          }
        </>}
      />
      <div className="px-2 py-1 rounded border border-dashed bg-blue-600 bg-opacity-10 flex justify-end w-full">
        <Button className="bg-indigo-600 text-white hover:bg-indigo-400"
          onClick={() => {
            let l = pcDetails.map(e => e)
            l.push({
              item: '', itemId: '', vatRate: 0,
              deleted: false, discountRate1: 0, discountRate2: 0, discountRate3: 0, discountRate4: 0, discountRate5: 0, discountRate6: 0,
              expenseRate1: 0, expenseRate2: 0, expenseRate3: 0, expenseRate4: 0,
              grossPrice: 0, netPurchasePrice: 0, netSalesPrice: 0, profitRate: 0, salesPrice: 0
            })
            setPCDetails(l)
          }}
          variant={'outline'}
          size='sm'
        >
          <PlusSquareIcon size={'22px'} />
        </Button>

      </div>
    </TsnPanel>)
  }



  const FormFooter = () => {
    return (<TsnPanel collapsible={false} name="pcondition_Footer" defaultOpen={true} className="mt-4" trigger={t('Totals')} contentClassName="grid grid-cols-1 lg:grid-cols-4 gap-2 w-full">
      Kalem Sayisi: {pcDetails.length}
    </TsnPanel>)
  }


  useEffect(() => { !token && setToken(Cookies.get('token') || '') }, [])
  useEffect(() => {

    if (typeof window != 'undefined') {
      if ((localStorage.getItem('showDetail_purchaseCondition_line') || '') == 'true') {
        setShowLineDetails(true)
      } else {
        setShowLineDetails(false)
      }
    }
    token && params.id != 'addnew' && load()

  }, [token])

  return (<StandartForm
    title={params.id == 'addnew' ? t('New Purchase Condition') : t('Edit Purchase Condition')}
    onSaveClick={save}
    onCancelClick={() => router.back()}
    loading={loading}

  >
    <div className="relative w-full h-full">
      {FormHeader()}
      {/* {!loading && <FormDetail />} */}
      <FormDetail />
      {FormFooter()}
    </div>

  </StandartForm>)
}

