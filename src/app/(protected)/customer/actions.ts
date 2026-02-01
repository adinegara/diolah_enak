'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CustomerInsert } from '@/types/database'

export async function createCustomer(data: CustomerInsert) {
  const supabase = await createClient()

  const { error } = await supabase.from('customer').insert(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/customer')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateCustomer(id: string, data: Partial<CustomerInsert>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('customer')
    .update(data)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/customer')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('customer')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/customer')
  revalidatePath('/dashboard')
  return { success: true }
}
