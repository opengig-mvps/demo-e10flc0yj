import SidebarComponent from "@/components/dashboardSidebar";
import { pages } from "./data";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SidebarComponent pages={pages}>{children}</SidebarComponent>
    </>
  );
}
