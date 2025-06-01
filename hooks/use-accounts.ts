"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getAccounts,
  createAccount,
  deleteAccount,
} from "@/lib/api/database"
import { createLocalStorageOperations } from "@/lib/api/database-fallback"
import {
  Account,
  CreateAccountInput,
} from "@/types/features"

export function useAccounts(isDatabaseAvailable: boolean) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const localOps = createLocalStorageOperations()

  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      if (isDatabaseAvailable) {
        const accountsData = await getAccounts()
        const mappedAccounts = accountsData.map((account: any) => ({
          ...account,
          id: account.id.toString(), 
          projectId: account.project_id?.toString() || "1",
          createdAt: account.created_at
        }))
        setAccounts(mappedAccounts as Account[])
      } else {
        const savedAccounts = localStorage.getItem("accounts")
        setAccounts(savedAccounts ? JSON.parse(savedAccounts) : [])
      }
    } catch (err) {
      console.error("Error loading accounts:", err)
      setError(err instanceof Error ? err : new Error("Unknown error occurred"))
      const savedAccounts = localStorage.getItem("accounts")
      setAccounts(savedAccounts ? JSON.parse(savedAccounts) : [])
    } finally {
      setLoading(false)
    }
  }, [isDatabaseAvailable, localOps])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  const addAccount = async (accountData: CreateAccountInput) => {
    try {
      if (isDatabaseAvailable) {
        const newAccount = await createAccount(accountData)
        setAccounts((prev) => [newAccount as Account, ...prev])
        return newAccount
      } else {
        const newAccount = localOps.createAccount(accountData)
        setAccounts((prev) => [newAccount as Account, ...prev])
        return newAccount
      }
    } catch (err) {
      console.error("Error adding account:", err)
      setError(err instanceof Error ? err : new Error("Unknown error occurred"))
      const newAccount = localOps.createAccount(accountData)
      setAccounts((prev) => [newAccount as Account, ...prev])
      return newAccount
    }
  }

  const removeAccount = async (id: string) => {
    try {
      if (isDatabaseAvailable) {
        await deleteAccount(parseInt(id))
        setAccounts((prev) => prev.filter((acc) => acc.id !== id))
      } else {
        localOps.deleteAccount(id)
        setAccounts((prev) => prev.filter((acc) => acc.id !== id))
      }
    } catch (err) {
      console.error("Error removing account:", err)
      setError(err instanceof Error ? err : new Error("Unknown error occurred"))
      localOps.deleteAccount(id)
      setAccounts((prev) => prev.filter((acc) => acc.id !== id))
    }
  }

  return {
    accounts,
    loadingAccounts: loading,
    errorAccounts: error,
    addAccount,
    removeAccount,
    reloadAccounts: loadAccounts
  }
}