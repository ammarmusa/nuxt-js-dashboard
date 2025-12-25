export interface ModuleCard {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  enabled: boolean;
}

export const availableModules: ModuleCard[] = [
  {
    id: "3d-map",
    name: "3D Map",
    description: "Interactive 3D mapping and visualization",
    icon: "Map",
    route: "/modules/3d-map",
    color: "bg-blue-500",
    enabled: true,
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Data analytics and reporting dashboard",
    icon: "BarChart3",
    route: "/modules/analytics",
    color: "bg-green-500",
    enabled: true,
  },
  {
    id: "settings",
    name: "Settings",
    description: "Application configuration and preferences",
    icon: "Settings",
    route: "/modules/settings",
    color: "bg-purple-500",
    enabled: true,
  },
  {
    id: "open-navigation",
    name: "Open Navigation",
    description: "Advanced navigation and routing system",
    icon: "Navigation",
    route: "/modules/open-navigation",
    color: "bg-orange-500",
    enabled: true,
  },
];
