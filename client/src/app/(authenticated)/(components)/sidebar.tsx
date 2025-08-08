"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Settings, Users, ShoppingCart, BarChart, FileText, Mail, Bell, HelpCircle, CheckCircle2Icon, ChartAreaIcon, TruckIcon, ShoppingCartIcon, ComputerIcon, Users2Icon, Building2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HeaderLogo2 } from "@/components/logo"
import { useLanguage } from "@/i18n"
import Cookies from 'js-cookie'
import { Member } from "@/types/Member"
import { SignOutButton } from "./signout-button"

// Define menu item types
interface MenuItem {
  title: string
  icon: React.ReactNode
  href?: string
  submenu?: SubMenuItem[]
}

interface SubMenuItem {
  title: string
  href: string
}

interface Props {
  className?: string
}

function menuItems(t: (s: string) => string, user: Member) {
  let l = [
    {
      title: t('Dashboard'),
      icon: <Home className="h-5 w-5" />,
      href: "/",
    },
    {
      title: t('Purchase'),
      icon: <TruckIcon className="h-5 w-5" />,
      submenu: [
        { title: t('Inventory'), href: "/purchase/inventory" },
        { title: t('Vendors'), href: "/module-closed/vendors" },
        { title: t('Purchase Orders'), href: "/purchase/orders" },
        { title: t('Purchase Conditions'), href: "/purchase/conditions" },
      ],
    },
    // {
    //   title: t('Sales'),
    //   icon: <ShoppingCartIcon className="h-5 w-5" />,
    //   submenu: [
    //     { title: "Reports", href: "/module-closed/reports" },
    //     { title: "Sales", href: "/module-closed/sales" },
    //   ],
    // },
    {
      title: t('POS'),
      icon: <ComputerIcon className="h-5 w-5" />,
      submenu: [
        { title: "POS Güncelle", href: "/pos/transactions" },
        { title: "Mikro Aktarim", href: "/pos/syncSales" },
      ],
    },
    {
      title: t('Reports'),
      icon: <ChartAreaIcon className="h-5 w-5" />,
      submenu: [
        // { title: t('Sales Profit'), href: "/reports/sales-profit" },
        { title: "Satın Alma Raporu", href: "/reports/purchase" },
        { title: "Satış Devir Hızı", href: "/module-closed/sales-cycle" },
        { title: "Satış Raporu", href: "/module-closed/satis-raporu" },
        { title: "Saatlik Satış Raporu", href: "/module-closed/saatlik-satis-raporu" },
        { title: "Günlük Ciro", href: "/module-closed/gunluk-ciro" },
        { title: "Aylık Ciro", href: "/module-closed/aylik-ciro" },
        { title: "Mağaza Masrafları", href: "/module-closed/magaza-masraflari" },
        { title: "Envanter", href: "/module-closed/envanter" },
        { title: "Tedarikçiye Göre Satış Raporu", href: "/module-closed/tedarikciye-gore-satis-raporu" },
        { title: "Tedarikçiye Göre Sipariş Karşılama", href: "/module-closed/tedarikciye-gore-siparis-karsilama" },
        { title: "Satın Almaya Göre Satış Raporu", href: "/module-closed/satin-almaya-gore-satis-raporu" },
        { title: "Nakit Akış", href: "/module-closed/nakit-akis" },
        { title: "Müşteri Satış Raporu", href: "/module-closed/musteri-satis-raporu" },
        { title: "Ürün Satış Raporu", href: "/module-closed/urun-satis-raporu" },
        { title: "Belge Bazlı Ürün Raporu", href: "/module-closed/belge-bazli-urun-raporu" },
        { title: "İade Nedenleri", href: "/module-closed/iade-nedenleri" },
        { title: "Fire Raporu", href: "/module-closed/fire-raporu" },
        { title: "KDV Bazlı Satış Raporu", href: "/module-closed/kdv-bazli-satis-raporu" },
        { title: "Ürün Stok Durumu", href: "/module-closed/urun-stok-durumu" },
        { title: "Market Sipariş Raporu", href: "/module-closed/market-siparis-raporu" },
        { title: "Depo Sipariş Raporu", href: "/module-closed/depo-siparis-raporu" },
        { title: "Günlük Kasa Defteri", href: "/module-closed/gunluk-kasa-defteri" },
        { title: "İndirimler Raporu", href: "/module-closed/indirimler-raporu" },
        { title: "Fiyat Değişim Raporu", href: "/module-closed/fiyat-degisim-raporu" },
        { title: "Marj Raporu", href: "/module-closed/marj-raporu" },
      ],
    },
    {
      title: t('Notifications'),
      icon: <Bell className="h-5 w-5" />,
      href: "/notifications",
    },
    {
      title: t('Settings'),
      icon: <Settings className="h-5 w-5" />,
      submenu: [
        { title: t('Users'), href: "/settings/users" },
        { title: t('Connector'), href: "/settings/connector" },
        { title: t('Stores'), href: "/settings/stores" },
        { title: t('POS Computers'), href: "/settings/posComputers" },
        { title: t('Working Parameters'), href: "/settings/workingParams" },
      ],
    },
  ]
  return l
}

function adminMenu(t: (s: string) => string, user: Member) {
  let l = [
    {
      title: t('Dashboard'),
      icon: <Home className="h-5 w-5" />,
      href: "/",
    },
    {
      title: t('Organizations'),
      icon: <Building2Icon className="h-5 w-5" />,
      href: '/admin/organizations'
    }
  ]
  if (user.role == 'sysadmin') {
    l.push({
      title: t('Admin Users'),
      icon: <Users2Icon className="h-5 w-5" />,
      href: "/admin/adminUsers",
    })
  }
  return l
}


export function Sidebar({ className }: Props) {
  // const [pathname, setPathname] = useState(usePathname())
  const pathname = usePathname()
  // Track open accordion values
  const [openAccordions, setOpenAccordions] = useState<string[]>([])
  const { t } = useLanguage()
  const [user, setUser] = useState<Member>()
  const [menu, setMenu] = useState<MenuItem[]>([])
  // Define menu items

  // Check if a path is active or is a parent of the current path
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  // Handle accordion state changes
  const handleAccordionChange = (value: string) => {
    setOpenAccordions((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value)
      } else {
        return [...prev, value]
      }
    })
  }

  // Ensure parent accordion is open if a child is active
  const ensureParentOpen = () => {

  }


  useEffect(() => {
    try {
      if (!user) {
        setUser(JSON.parse(Cookies.get('user') || '{}') as Member)
      }
    } catch { }
  }, [])
  useEffect(() => {
    if (user) {
      const m: MenuItem[] = user.organization ? menuItems(t, user) : adminMenu(t, user)
      m.forEach((item, index) => {
        if (item.submenu) {
          const hasActiveChild = item.submenu.some((subItem) => isActive(subItem.href))
          if (hasActiveChild && !openAccordions.includes(`item-${index}`)) {
            setOpenAccordions((prev) => [...prev, `item-${index}`])
          }
        }
      })
      setMenu(m)
    }
  }, [user])

  // Update open accordions when pathname changes
  // useState(() => {
  //   ensureParentOpen()
  // }, [pathname])

  return (
    <div className={`w-64 min-h-screen border-r flex flex-col ${className}`}>
      {user?.organization &&
        <div className="flex justify-between items-center border-b mb-1 bg-gr11een-600 text-green-600 px-2 py-1 font-bold">
          <div className="flex gap-2">
            <Building2Icon />
            {user?.organization?.name?.toUpperCase()}
          </div>
          <SignOutButton />
        </div>
      }
      {menu &&
        <nav className="p-2 mt-0">
          <Accordion type="multiple" value={openAccordions} className="space-y-1">

            {menu.map((item, index) => {
              // If the item has a submenu, render as accordion
              if (item.submenu) {
                return (
                  <AccordionItem key={index} value={`item-${index}`} className="border-none">
                    <AccordionTrigger
                      onClick={() => handleAccordionChange(`item-${index}`)}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-md text-sm hover:bg-slate-500 hover:text-white transition-all",
                        item.submenu.some((subItem) => isActive(subItem.href)) && "bg-slate-600 text-white font-medium",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-0 pl-9">
                      <div className="flex flex-col space-y-1">
                        {item.submenu.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            href={subItem.href}
                            className={cn(
                              "px-3 py-2 rounded-md text-sm hover:bg-slate-600 hover:text-white transition-all",
                              isActive(subItem.href) && "bg-amber-700 text-white font-medium",
                            )}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              }

              // If the item doesn't have a submenu, render as a link
              return (
                <Link
                  key={index}
                  href={item.href || "#"}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-slate-600 hover:text-white transition-all",
                    isActive(item.href || "") && "bg-slate-600 font-medium text-white",
                  )}
                >
                  <div>{item.icon}</div>
                  <div>{item.title}</div>
                </Link>
              )
            })}

          </Accordion>
        </nav>
      }
    </div>
  )
}
