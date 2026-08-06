"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Map, 
  AlertOctagon, 
  Bell, 
  BarChart3, 
  ShieldCheck,
  Globe
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Live GIS Map", href: "/map", icon: Map },
    { name: "SOS Requests", href: "/sos", icon: AlertOctagon },
    { name: "Alerts Center", href: "/alerts", icon: Bell },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "OSINT Intelligence", href: "/intelligence", icon: Globe },
    { name: "Citizen Trust", href: "/trust", icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-[#F4F8FA] border-r border-[#D5E2EC] flex flex-col h-full shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#D5E2EC] flex items-center gap-3">
        <img src="/logo.jpg" alt="OceanWatch Logo" className="w-10 h-10 rounded-full object-cover border border-[#D5E2EC]" />
        <div>
          <h1 className="text-sm font-black tracking-widest text-[#2563EB]">
            OCEANWATCH
          </h1>
          <p className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider">
            Operations Console
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3.5 px-4 py-3 text-xs font-bold rounded-2xl transition-all duration-150 ${
                isActive
                  ? "bg-[#2563EB]/5 text-[#2563EB] border-l-2 border-[#2563EB] shadow-sm"
                  : "text-[#64748B] hover:text-[#0E1726] hover:bg-[#EBF2F7]/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#2563EB]" : "text-[#64748B]"}`} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#D5E2EC] text-[9px] text-[#64748B] font-bold text-center uppercase tracking-wider">
        NDMC SECURITY DIVISION v1.0.0
      </div>
    </aside>
  );
}
