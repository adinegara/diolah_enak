'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { TransactionInsert } from '@/types/database'

export async function createTransaction(data: TransactionInsert) {
  const supabase = await createClient()

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'User not authenticated' }
  }

  // Add created_by to the data
  const dataWithCreator = {
    ...data,
    created_by: user.id,
  }

  const { error } = await supabase.from('transaction').insert(dataWithCreator)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/transaction')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateTransaction(id: number, data: Partial<TransactionInsert>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('transaction')
    .update(data)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/transaction')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteTransaction(id: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('transaction')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/transaction')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function bulkUpdateStatus(ids: number[], status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('transaction')
    .update({ status })
    .in('id', ids)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/transaction')
  revalidatePath('/dashboard')
  return { success: true }
}
