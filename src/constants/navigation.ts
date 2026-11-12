export interface NavItem {
  id: string;
  title: string;
  href: string;
  iconName: string;
  badge?: string;
}

export const MAIN_NAVIGATION: NavItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    href: "#dashboard",
    iconName: "LayoutDashboard",
  },
  {
    id: "patients",
    title: "Patients",
    href: "#patients",
    iconName: "Users",
  },
  {
    id: "temperature",
    title: "Temperature Tracking",
    href: "#temperature",
    iconName: "Thermometer",
  },
  {
    id: "doctor-visits",
    title: "Doctor Visits",
    href: "#doctor-visits",
    iconName: "Stethoscope",
  },
  {
    id: "discharges",
    title: "Discharges",
    href: "#discharges",
    iconName: "UserCheck",
  },
  {
    id: "analytics",
    title: "Analytics",
    href: "#analytics",
    iconName: "BarChart3",
  },
];
