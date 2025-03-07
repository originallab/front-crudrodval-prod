"use client"
import * as React from "react";
import Link from "next/link"; // Importa Link de Next.js

import {
  NotebookPen,
  BadgeDollarSign,
} from "lucide-react";

import { NavMainn as NavMainnc } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// Este es un ejemplo de datos.
const data = {
  navMain: [
    {
      title: "Contenedores",
      url: "/contenedoresInfo/datosBasicos",
      icon: NotebookPen,
      isActive: true,
      items: [
        {
          title: "Datos Basicos",
          url: "/contenedoresInfo/datosBasicos",
        },
        {
          title: "Transportes",
          url: "/contenedoresInfo/datosTransportes",
        },
        {
          title: "Clientes",
          url: "/contenedoresInfo/datosClientes",
        },
        {
          title: "Costos Sugeridos",
          url: "/contenedoresInfo/datosBasicos",
        },
      ],
    },
    {
      title: "Cotizador",
      url: "/contenedoresInfo/datosBasicos",
      icon: BadgeDollarSign,
      items: [
        {
          title: "Realizar Cotizacion",
          url: "/contenedoresInfo/datosBasicos",
        },
      ],
    },
    {
      title: "Login",
      url: "/contenedoresInfo/login",
      icon: BadgeDollarSign,
      items: [
        {
          title: "Login",
          url: "/contenedoresInfo/login",
        },
      ],
    },
  ],
};


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="bg-gradient-to-b from-[rgb(80,120,150)] via-[rgb(0, 134, 237)] to-[rgb(40,80,110)] text-white"
    >
     <SidebarHeader className="p-4">
        {/* Aquí puedes añadir tu TeamSwitcher si lo necesitas */}
        <img 
        src="/imagenes/iconoRodval.svg"  // Ruta de la imagen del icono
        alt="Icono del sistema"      // Texto alternativo para accesibilidad
       className="w-30 h-50"       // Ajusta el tamaño del icono
       />
</SidebarHeader>
      <SidebarContent className="p-4">
        {/* Aquí usamos NavMain para que cargue los items */}
        <NavMainnc items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="p-4">
        {/* Aquí puedes añadir tu NavUser si lo necesitas */}
        <p>www.logisticaRodval.com</p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
