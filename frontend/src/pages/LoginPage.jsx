import Login from "@/components/Login";
import React from "react";

const LoginPage = () => {
  return (
    <div className="flex h-screen bg-[#27304f] items-center justify-center">
      <div className="h-[500px] w-[800px] bg-white rounded-[20px] shadow-lg flex flex-col justify-center items-center">
        <Login />
      </div>
    </div>
  );
};

export default LoginPage;
