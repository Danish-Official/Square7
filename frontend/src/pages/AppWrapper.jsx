import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Outlet } from "react-router-dom";

const AppWrapper = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 pb-6 bg-[#f7f7f7] min-h-screen">
        <Header />
        <Outlet />
      </main>
    </div>
  );
};

export default AppWrapper;
