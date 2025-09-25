import React from "react";
import { Header } from "./Header";

const MainLayout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container py-6">{children}</main>
    </div>
  );
};

export default MainLayout;
