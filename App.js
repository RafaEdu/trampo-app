// App.js (na raiz do projeto)
import React from "react";
import { AuthProvider } from "./src/contexts/AuthContext";
import Router from "./src/navigation";

export default function App() {
  return (
    // 1. O AuthProvider gerencia se estamos logados ou não
    <AuthProvider>
      {/* 2. O Router decide qual tela mostrar com base no AuthProvider */}
      <Router />
    </AuthProvider>
  );
}
