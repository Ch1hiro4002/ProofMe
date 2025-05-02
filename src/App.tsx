import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { networkConfig } from "./networkConfig";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from "./pages/HomePage"
import ProfilePage from "./pages/ProfilePage"
import CreateResumePage from "./pages/CreateResumePage"


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/create" element={<CreateResumePage />} />
            </Routes>
          </Router>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}

export default App
