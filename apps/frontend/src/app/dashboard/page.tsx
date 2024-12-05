"use client";

import { useState } from "react";
import { AccountSelector } from "@/components/AccountSelector";
import { AccountOperations } from "@/components/AccountOperations";
import { AccountStatements } from "@/components/AccountStatements";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [selectedAccount, setSelectedAccount] = useState({
    iban: "",
    balance: 0,
  });
  const { logout } = useAuth();
  const router = useRouter();

  const handleUpdateBalance = (newBalance: number) => {
    if (selectedAccount) {
      setSelectedAccount((prev: any) => ({
        ...prev,
        balance: newBalance,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Banking Dashboard
          </h1>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 sm-lg:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <AccountSelector
              onSelectAccount={(account) => setSelectedAccount(account)}
            />
          </div>

          <div className="md:col-span-2 space-y-4">
            {selectedAccount ? (
              <>
                <AccountOperations
                  account={selectedAccount}
                  onUpdateBalance={handleUpdateBalance}
                />
                <AccountStatements selectedAccount={selectedAccount} />
              </>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p>Please create or select an account</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
