'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { TransactionInsert } from '@/types/database'

export async function createTransaction(data: TransactionInsert) {
  const supabase = await createClient()

  const { error } = await supabase.from('transaction').insert(data)

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
